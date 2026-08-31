<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\AuditTrailService;

class LanAccessMiddleware
{
    /**
     * Handle an incoming request.
     * Restrict application access to configured LAN IP subnets / Whitelist.
     *
     * Even localhost/127.0.0.1 access is checked against the machine's
     * actual network IP to ensure the server is on the allowed network.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $allowedSubnets = config('security.allowed_ip_subnets', [
            '192.168.0.0/24',
        ]);

        $clientIp = $request->ip();

        // If client connects via loopback (localhost), we need to check
        // whether this machine's actual network IP is in the allowed subnet.
        if ($this->isLoopback($clientIp)) {
            $machineIps = $this->getMachineNetworkIps();

            $machineOnAllowedNetwork = false;
            foreach ($machineIps as $machineIp) {
                if ($this->isIpAllowed($machineIp, $allowedSubnets)) {
                    $machineOnAllowedNetwork = true;
                    break;
                }
            }

            if (!$machineOnAllowedNetwork) {
                $this->logBlockedAccess($clientIp, $allowedSubnets, $machineIps);
                abort(403, sprintf(
                    'AKSES DITOLAK: Server ini tidak terhubung ke jaringan LAN resmi NCB Interpol. IP jaringan aktual: %s',
                    implode(', ', $machineIps) ?: 'tidak terdeteksi'
                ));
            }

            return $next($request);
        }

        // For remote clients, check their IP directly
        if (!$this->isIpAllowed($clientIp, $allowedSubnets)) {
            $this->logBlockedAccess($clientIp, $allowedSubnets);
            abort(403, sprintf(
                'AKSES DITOLAK: Perangkat Anda (%s) tidak terhubung ke jaringan LAN resmi NCB Interpol.',
                $clientIp
            ));
        }

        return $next($request);
    }

    /**
     * Check if the IP is a loopback address (localhost).
     */
    private function isLoopback(string $ip): bool
    {
        return in_array($ip, ['127.0.0.1', '::1'], true)
            || str_starts_with($ip, '127.');
    }

    /**
     * Get all non-loopback IPv4 addresses of the machine.
     */
    private function getMachineNetworkIps(): array
    {
        $ips = [];

        // Windows: parse ipconfig output
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $output = shell_exec('ipconfig');
            if ($output) {
                preg_match_all('/IPv4 Address[.\s]*:\s*([\d.]+)/i', $output, $matches);
                if (!empty($matches[1])) {
                    foreach ($matches[1] as $ip) {
                        if (!str_starts_with($ip, '127.')) {
                            $ips[] = $ip;
                        }
                    }
                }
            }
        } else {
            // Linux/Mac: parse hostname -I or ip addr
            $output = shell_exec('hostname -I 2>/dev/null') ?: shell_exec("ip -4 addr show | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}'");
            if ($output) {
                $parts = preg_split('/\s+/', trim($output));
                foreach ($parts as $ip) {
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) && !str_starts_with($ip, '127.')) {
                        $ips[] = $ip;
                    }
                }
            }
        }

        return $ips;
    }

    /**
     * Check if client IP matches single IP or CIDR Subnet range.
     */
    private function isIpAllowed(string $ip, array $allowedRules): bool
    {
        foreach ($allowedRules as $rule) {
            $rule = trim($rule);
            if (empty($rule)) continue;

            // Direct IP match
            if ($ip === $rule) {
                return true;
            }

            // CIDR Subnet match (e.g. 192.168.80.0/24)
            if (str_contains($rule, '/')) {
                if ($this->ipInCidr($ip, $rule)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Validate IP against CIDR notation.
     */
    private function ipInCidr(string $ip, string $cidr): bool
    {
        list($subnet, $bits) = explode('/', $cidr);
        $ipLong = ip2long($ip);
        $subnetLong = ip2long($subnet);

        if ($ipLong === false || $subnetLong === false) {
            return false;
        }

        $mask = -1 << (32 - (int) $bits);
        $subnetLong &= $mask;

        return ($ipLong & $mask) === $subnetLong;
    }

    /**
     * Log blocked access attempt to audit trail.
     */
    private function logBlockedAccess(string $clientIp, array $allowedSubnets, array $machineIps = []): void
    {
        try {
            AuditTrailService::log(
                module: 'SECURITY',
                actionType: 'BLOCKED_IP_ACCESS',
                entityName: 'NetworkAccess',
                entityId: $clientIp,
                afterState: [
                    'blocked_ip' => $clientIp,
                    'machine_ips' => $machineIps,
                    'allowed_subnets' => $allowedSubnets,
                ]
            );
        } catch (\Throwable $e) {
            // Ignore audit error during blocking
        }
    }
}
