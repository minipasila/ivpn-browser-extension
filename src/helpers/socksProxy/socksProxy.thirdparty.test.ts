import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleProxyRequest } from '@/helpers/socksProxy/socksProxy';
import { ProxyInfoType } from '@/helpers/socksProxy/socksProxy.types';
import { RequestDetails } from './socksProxy.types';

const protectedProxy = {
  type: ProxyInfoType.socks,
  host: '10.1.0.1',
  port: 1080,
  proxyDNS: true,
};

const storageState = {
  excludedHosts: JSON.stringify([]),
  globalProxy: JSON.stringify({}),
  globalProxyDetails: JSON.stringify({ socksEnabled: false }),
  hostProxies: JSON.stringify({ 'protected.example': protectedProxy }),
  hostProxiesDetails: JSON.stringify({
    'protected.example': {
      socksEnabled: true,
      server: 'se-got-wg-001',
      country: 'Sweden',
      countryCode: 'se',
      city: 'Gothenburg',
      proxyDNS: true,
    },
  }),
  randomProxyMode: JSON.stringify(false),
};

const baseDetails: RequestDetails = {
  requestId: 'req',
  url: '',
  method: 'GET',
  type: 'image',
  fromCache: false,
  incognito: false,
  thirdParty: false,
  originUrl: '',
  documentUrl: '',
  frameId: 0,
  parentFrameId: -1,
  frameAncestors: [],
  timeStamp: 0,
  tabId: 1,
  cookieStoreId: 'firefox-default',
  urlClassification: { firstParty: [], thirdParty: [] },
};

describe('handleProxyRequest: per-domain rules apply to the requested host', () => {
  beforeEach(() => {
    vi.mocked(browser.storage.local.get).mockResolvedValue(storageState);
  });

  it('proxies a third-party subresource when its requested host has a proxy rule', async () => {
    // Requested host is protected.example, embedded under attacker.example.
    const result = await handleProxyRequest({
      ...baseDetails,
      url: 'https://protected.example/tracker-pixel',
      type: 'image',
      thirdParty: true,
      originUrl: 'https://attacker.example/',
      documentUrl: 'https://attacker.example/',
    });
    expect(result).toEqual(protectedProxy);
  });

  it('proxies a third-party iframe when its requested host has a proxy rule', async () => {
    // Even with a frameAncestors entry pointing at an unproxied top-level site,
    // routing must follow the requested host.
    const details: RequestDetails = {
      ...baseDetails,
      url: 'https://protected.example/iframe',
      type: 'sub_frame',
      thirdParty: true,
      originUrl: 'https://attacker.example/',
      documentUrl: 'https://protected.example/iframe',
      frameId: 4,
      parentFrameId: 0,
      frameAncestors: [{ frameId: 0, url: 'https://attacker.example/' }],
    };
    const result = await handleProxyRequest(details);
    expect(result).toEqual(protectedProxy);
  });

  it('still proxies a top-level request to the protected host (no regression)', async () => {
    const result = await handleProxyRequest({
      ...baseDetails,
      url: 'https://protected.example/',
      type: 'main_frame',
      thirdParty: false,
      originUrl: 'https://protected.example/',
      documentUrl: 'https://protected.example/',
    });
    expect(result).toEqual(protectedProxy);
  });

  it('applies the parent-domain proxy rule to a subdomain requested host', async () => {
    const result = await handleProxyRequest({
      ...baseDetails,
      url: 'https://login.protected.example/static.js',
      type: 'script',
      thirdParty: true,
      originUrl: 'https://attacker.example/',
      documentUrl: 'https://attacker.example/',
    });
    expect(result).toEqual(protectedProxy);
  });

  it('does not leak the proxy to an unrelated host loaded from a proxied top-level page', async () => {
    // A non-proxied host embedded under the proxied top-level host must stay direct,
    // i.e. proxy rules do not bleed from the top-level context to third-party hosts.
    const details: RequestDetails = {
      ...baseDetails,
      url: 'https://unrelated.example/asset.png',
      type: 'image',
      thirdParty: true,
      originUrl: 'https://protected.example/',
      documentUrl: 'https://protected.example/',
      frameAncestors: [{ frameId: 0, url: 'https://protected.example/' }],
    };
    const result = await handleProxyRequest(details);
    expect(result).toEqual({ type: 'direct' });
  });

  it('respects an exclusion rule on the requested host for third-party requests', async () => {
    vi.mocked(browser.storage.local.get).mockResolvedValue({
      ...storageState,
      excludedHosts: JSON.stringify(['protected.example']),
    });

    const result = await handleProxyRequest({
      ...baseDetails,
      url: 'https://protected.example/tracker-pixel',
      type: 'image',
      thirdParty: true,
      originUrl: 'https://attacker.example/',
      documentUrl: 'https://attacker.example/',
    });
    expect(result).toEqual({ type: 'direct' });
  });
});
