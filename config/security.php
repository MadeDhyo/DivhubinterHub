<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Allowed LAN IP Subnets & Whitelist
    |--------------------------------------------------------------------------
    |
    | Subnet / IP address yang diizinkan mengakses OCMS.
    | Masukkan IP individual (misal 127.0.0.1) atau format CIDR (misal 192.168.1.0/24).
    |
    */

    'allowed_ip_subnets' => array_filter(
        explode(',', env('ALLOWED_IP_SUBNETS', '192.168.80.0/24'))
    ),

];
