import { it, describe, expect } from 'vitest';

import getCityCountrySocksProxy from '@/helpers/socksProxy/getCityCountrySocksProxy';
import { Country } from '@/helpers/socksProxy/socksProxies.types';

const gothenburgProxies = [
  { hostname: 'se1', port: 1080, location: { countryCode: 'se' } },
  { hostname: 'se2', port: 1080, location: { countryCode: 'se' } },
  { hostname: 'se3', port: 1080, location: { countryCode: 'se' } },
];

const malmoProxies = [
  { hostname: 'se4', port: 1080, location: { countryCode: 'se' } },
  { hostname: 'se5', port: 1080, location: { countryCode: 'se' } },
];

const stockholmProxies = [
  { hostname: 'se6', port: 1080, location: { countryCode: 'se' } },
  { hostname: 'se7', port: 1080, location: { countryCode: 'se' } },
  { hostname: 'se8', port: 1080, location: { countryCode: 'se' } },
  { hostname: 'se9', port: 1080, location: { countryCode: 'se' } },
];

const mockSocksProxies = [
  {
    country: 'Sweden',
    cities: [
      {
        city: 'Gothenburg',
        proxyList: gothenburgProxies,
      },
      {
        city: 'Malmo',
        proxyList: malmoProxies,
      },
      {
        city: 'Stockholm',
        proxyList: stockholmProxies,
      },
    ],
  },
] as Country[];

describe('getCityCountrySocksProxy', () => {
  it('should throw error if no sockproxies list is available', () => {
    expect(() =>
      getCityCountrySocksProxy({ socksProxies: undefined, country: 'Mongolia' }),
    ).toThrow('No proxies to choose from');

    expect(() => getCityCountrySocksProxy({ socksProxies: [], country: 'Mongolia' })).toThrow(
      'No proxies to choose from',
    );
  });

  it('should return a proxy in Sweden', () => {
    const { hostname, port } = getCityCountrySocksProxy({
      socksProxies: mockSocksProxies,
      country: 'Sweden',
    });
    const isSwedishProxy = [...gothenburgProxies, ...malmoProxies, ...stockholmProxies].find(
      (p) => p.hostname === hostname && p.port === port,
    );
    expect(isSwedishProxy).toBeDefined();
  });

  it('should return a proxy in Gothenburg', () => {
    const { hostname, port } = getCityCountrySocksProxy({
      socksProxies: mockSocksProxies,
      country: 'Sweden',
      city: 'Gothenburg',
    });
    const isGothenburgProxy = gothenburgProxies.find(
      (p) => p.hostname === hostname && p.port === port,
    );
    const isMalmoProxy = malmoProxies.find((p) => p.hostname === hostname && p.port === port);
    expect(isGothenburgProxy).toBeDefined();
    expect(isMalmoProxy).toBeUndefined();
  });

  it('should return a proxy in Malmö', () => {
    const { hostname, port } = getCityCountrySocksProxy({
      socksProxies: mockSocksProxies,
      country: 'Sweden',
      city: 'Malmo',
    });
    const isMalmoProxy = malmoProxies.find((p) => p.hostname === hostname && p.port === port);
    expect(isMalmoProxy).toBeDefined();
  });

  it('should return a proxy in Stockholm', () => {
    const { hostname, port } = getCityCountrySocksProxy({
      socksProxies: mockSocksProxies,
      country: 'Sweden',
      city: 'Stockholm',
    });
    const isStockholmProxy = stockholmProxies.find(
      (p) => p.hostname === hostname && p.port === port,
    );
    expect(isStockholmProxy).toBeDefined();
  });
});
