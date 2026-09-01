import { ProxyInfo } from '@/helpers/socksProxy/socksProxy.types';

export const baseConfig: Partial<ProxyInfo> = {
  port: 1080,
  proxyDNS: true,
};

// IVPN local SOCKS5 gateway IP (socks5.gw.ivpn.net). Used as a fallback when
// a proxy entry has no explicit internal IP. Only reachable when the IVPN
// desktop app is connected.
export const socksIp = '10.1.0.1';
