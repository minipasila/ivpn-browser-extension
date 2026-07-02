// Static fallback for base conncheck URL
const CONNCHECK_URL = 'am.i.mullvad.net';
export const CONFIG_ENDPOINT = `https://${CONNCHECK_URL}/config`;

export type connCheckConfig = {
  dns_leak_domain: string;
  ipv4_url: string;
  ipv6_url: string;
};

export const DEFAULT_CONFIG: connCheckConfig = {
  dns_leak_domain: `dnsleak.${CONNCHECK_URL}`,
  ipv4_url: `https://ipv4.${CONNCHECK_URL}`,
  ipv6_url: `https://ipv6.${CONNCHECK_URL}`,
};

export const getConfig = async (): Promise<connCheckConfig> => {
  const { connCheckConfig } = await browser.storage.local.get('connCheckConfig');

  return connCheckConfig
    ? { ...DEFAULT_CONFIG, ...(JSON.parse(connCheckConfig) as Partial<connCheckConfig>) }
    : DEFAULT_CONFIG;
};

export const initConfig = async (): Promise<connCheckConfig> => {
  try {
    const response = await fetch(CONFIG_ENDPOINT, {
      headers: { Accept: 'application/json' },
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Error fetching conncheck config: ${response.status}`);
    }
    const config: Partial<connCheckConfig> = await response.json();
    const merged = { ...DEFAULT_CONFIG, ...config };
    await browser.storage.local.set({ connCheckConfig: JSON.stringify(merged) });
    return merged;
  } catch {
    return getConfig();
  }
};
