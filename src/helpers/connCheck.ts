import type { Connection, IVpnGeoLookupResponse } from '@/helpers/connCheck.types';

// IVPN geo-lookup endpoint. Returns the public IP, location and an
// isIvpnServer flag indicating whether the request exited through an IVPN
// server (VPN or SOCKS5 proxy).
export const GEO_LOOKUP_URL = 'https://api.ivpn.net/v4/geo-lookup';

export const connCheck = async (): Promise<Connection> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(GEO_LOOKUP_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data: IVpnGeoLookupResponse = await response.json();

    return {
      city: data.city,
      country: data.country,
      countryCode: data.country_code,
      ip: data.ip_address,
      isp: data.organization ?? data.isp,
      isIvpn: data.isIvpnServer ?? false,
    };
  } catch (error) {
    throw new Error('Connection check failed.', { cause: error });
  }
};
