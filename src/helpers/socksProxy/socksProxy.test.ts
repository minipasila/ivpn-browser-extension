import { it, describe, expect } from 'vitest';

import { isExtConnCheck, isLocalOrReservedIP } from '@/helpers/socksProxy/socksProxy';
import { GEO_LOOKUP_URL } from '@/helpers/connCheck';
import { RequestDetails } from './socksProxy.types';

vi.mock('@/helpers/socksProxy/getRandomSessionProxy', () => ({
  browserStorage: {
    getLocal: vi.fn().mockResolvedValue({}),
  },
}));

describe('isLocalOrReservedIP', () => {
  it('should return true for localhost', () => {
    expect(isLocalOrReservedIP('localhost:8080')).toBeTruthy();
  });

  it('should return true for private IP', () => {
    expect(isLocalOrReservedIP('192.168.1.1')).toBeTruthy();
  });

  it('should return true for loopback IP', () => {
    expect(isLocalOrReservedIP('127.0.0.1')).toBeTruthy();
    expect(isLocalOrReservedIP('::1')).toBeTruthy();
  });

  it('should return true for bracketed IPv6', () => {
    expect(isLocalOrReservedIP('[::1]')).toBeTruthy();
    expect(isLocalOrReservedIP('[fc00::1]')).toBeTruthy();
  });

  it('should return false for public IP', () => {
    expect(isLocalOrReservedIP('8.8.8.8')).toBeFalsy();
  });

  it('should return false for domains that contain the localhost substring', () => {
    expect(isLocalOrReservedIP('notlocalhost.com')).toBeFalsy();
    expect(isLocalOrReservedIP('localhost.attacker.tld')).toBeFalsy();
    expect(isLocalOrReservedIP('prod-localhost-cdn.example')).toBeFalsy();
  });

  it('should return false for invalid IP', () => {
    expect(isLocalOrReservedIP('invalid.ip')).toBeFalsy();
  });

  it('should return true for unique local addresses', () => {
    expect(isLocalOrReservedIP('fc00::')).toBeTruthy();
  });

  it('should return true for multicast addresses', () => {
    expect(isLocalOrReservedIP('ff00::')).toBeTruthy();
  });

  it('should return false when IP address is not provided', () => {
    expect(isLocalOrReservedIP('')).toBeFalsy();
  });
});

describe('isExtConnCheck', () => {
  const baseDetails: RequestDetails = {
    requestId: '5979',
    url: '',
    method: 'GET',
    type: 'xmlhttprequest',
    fromCache: false,
    incognito: false,
    thirdParty: false,
    originUrl: '',
    documentUrl: '',
    frameId: 0,
    parentFrameId: -1,
    frameAncestors: [],
    timeStamp: 1740215207080,
    tabId: 4,
    cookieStoreId: 'firefox-default',
    urlClassification: {
      firstParty: [],
      thirdParty: [],
    },
  };

  it('should return true for extension geo-lookup connection check', () => {
    const details: RequestDetails = {
      ...baseDetails,
      url: GEO_LOOKUP_URL,
      originUrl: 'moz-extension://8ad8e256-a9a0-4017-b302-1345ac426553/dist/options/index.html',
      documentUrl: 'moz-extension://8ad8e256-a9a0-4017-b302-1345ac426553/dist/options/index.html',
    };
    expect(isExtConnCheck(details)).toBeTruthy();
  });

  it('should return false for non-extension requests', () => {
    const details: RequestDetails = {
      ...baseDetails,
      url: GEO_LOOKUP_URL,
      documentUrl: 'https://example.com',
      originUrl: 'https://example.com',
    };
    expect(isExtConnCheck(details)).toBeFalsy();
  });

  it('should return false for extension requests to other URLs', () => {
    const details: RequestDetails = {
      ...baseDetails,
      url: 'https://example.com',
      originUrl: 'moz-extension://8ad8e256-a9a0-4017-b302-1345ac426553/dist/options/index.html',
      documentUrl: 'moz-extension://8ad8e256-a9a0-4017-b302-1345ac426553/dist/options/index.html',
    };
    expect(isExtConnCheck(details)).toBeFalsy();
  });
});
