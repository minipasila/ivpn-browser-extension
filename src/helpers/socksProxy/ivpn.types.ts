// Types for the IVPN servers/stats API (https://api.ivpn.net/v5/servers/stats)

export interface IVpnServerHost {
  host: string;
  hostname: string;
}

export interface IVpnServerHosts {
  openvpn: IVpnServerHost;
  wireguard: IVpnServerHost;
}

export interface IVpnServerStats {
  gateway: string;
  hostnames: IVpnServerHosts;
  hosts: IVpnServerHosts;
  is_active: boolean;
  in_maintenance: boolean;
  status: number;
  country_code: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  load: number;
  protocols: string[];
  wg_public_key: string;
  multihop_port: number;
  /**
   * Combined SOCKS5 endpoint as "hostname:internal_ip", e.g.
   * "socks5.fr1.gw.ivpn.net:10.1.64.62".
   * The internal IP is only reachable when the IVPN desktop app is connected.
   */
  socks5: string;
}

export interface IVpnServersStatsResponse {
  servers: IVpnServerStats[];
}
