import { SocksProxy } from '@/helpers/socksProxy/socksProxies.types';
import { IVpnServerStats, IVpnServersStatsResponse } from '@/helpers/socksProxy/ivpn.types';

/**
 * Parse the IVPN `socks5` field ("socks5.fr1.gw.ivpn.net:10.1.64.62") into
 * a display hostname and the internal proxy IP.
 *
 * The display hostname strips the "socks5." prefix and the ".gw.ivpn.net"
 * suffix, mirroring the old Mullvad logic that stripped "wg-socks5-" and
 * ".relays.mullvad.net" to produce a short server label (e.g. "fr1").
 */
const parseSocks5Field = (socks5: string): { hostname: string; internalIp: string } => {
  // "socks5.fr1.gw.ivpn.net:10.1.64.62" -> ["socks5.fr1.gw.ivpn.net", "10.1.64.62"]
  const [socksHost, internalIp] = socks5.split(':');
  const hostname = socksHost.replace(/^socks5\./, '').replace(/\.gw\.ivpn\.net$/, '');
  return { hostname, internalIp };
};

/**
 * Transform a single IVPN server-stats entry into the SocksProxy shape
 * consumed by the rest of the proxy pipeline (groupByCountryAndCity,
 * addCountryCode, getRandomSessionProxy, setGlobalProxy, ...).
 */
export const ivpnServerToSocksProxy = (server: IVpnServerStats): SocksProxy => {
  const { hostname, internalIp } = parseSocks5Field(server.socks5);
  const countryCode = server.country_code.toLowerCase();

  return {
    online: server.is_active,
    hostname,
    // The internal IP is the proxy host used by proxy.onRequest. It is only
    // reachable when the IVPN desktop app is connected to this server.
    ipv4_address: internalIp,
    ipv6_address: '',
    port: 1080,
    location: {
      city: server.city,
      // `code` is consumed by addCountryCode which takes the first 2 chars,
      // so store the lowercased country code here.
      code: countryCode,
      country: server.country,
      countryCode,
      longitude: server.longitude,
      latitude: server.latitude,
    },
  };
};

/**
 * Transform the full IVPN servers/stats response into a flat SocksProxy[].
 * Inactive servers are filtered out.
 */
export const ivpnServersToSocksProxies = (response: IVpnServersStatsResponse): SocksProxy[] => {
  return response.servers
    .filter((server) => server.is_active && server.socks5)
    .map(ivpnServerToSocksProxy);
};
