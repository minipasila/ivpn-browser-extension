// Response from the IVPN geo-lookup API (https://api.ivpn.net/v4/geo-lookup)
export interface IVpnGeoLookupResponse {
  ip_address?: string;
  isp?: string;
  organization?: string;
  country?: string;
  country_code?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isIvpnServer?: boolean;
}

export type Connection = {
  city?: string;
  country?: string;
  countryCode?: string;
  ip?: string;
  isp?: string;
  isIvpn: boolean;
};
