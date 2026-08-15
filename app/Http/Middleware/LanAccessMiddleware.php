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
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get configured allowed IP subnets from .env (comma-separated)
        // Default allows localhost and user's testing subnet (192.168.1.0/24)
        $allowedSubnets = config('security.allowed_ip_subnets', [
            '127.0.0.1',
            '::1',
            '192.168.1.0/24', // Home / Office LAN Testing range
            // '10.0.0.0/8',   // Example Office LAN range
        ]);

        $clientIp = $request->ip();

        if (!$this->isIpAllowed($clientIp, $allowedSubnets)) {
            // Record Security Violation Audit Log
            try {
                AuditTrailService::log(
                    module: 'SECURITY',
                    actionType: 'BLOCKED_IP_ACCESS',
                    entityName: 'NetworkAccess',
                    entityId: $clientIp,
                    afterState: ['blocked_ip' => $clientIp, 'allowed_subnets' => $allowedSubnets]
                );
            } catch (\Throwable $e) {
                // Ignore audit error during blocking
            }

            abort(403, sprintf('AKSES DITOLAK: Perangkat Anda (%s) tidak terhubung ke jaringan LAN resmi NCB Interpol.', $clientIp));
        }

        return $next($request);
    }

    /**
     * Check if client IP matches single IP or CIDR Subnet range
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

            // CIDR Subnet match (e.g. 192.168.1.0/24 or 10.0.0.0/8)
            if (str_contains($rule, '/')) {
                if ($this->ipInCidr($ip, $rule)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Validate IP against CIDR notation
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
}
