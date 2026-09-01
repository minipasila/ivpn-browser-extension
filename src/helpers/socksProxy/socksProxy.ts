import ipaddr from 'ipaddr.js';
import { parse } from 'tldts';

import {
  RequestDetails,
  ProxyDetails,
  ProxyInfoMap,
  ProxyInfo,
} from '@/helpers/socksProxy/socksProxy.types';
import { GEO_LOOKUP_URL } from '@/helpers/connCheck';
import { checkDomain } from '@/helpers/domain';
import { getRandomSessionProxy } from '@/helpers/socksProxy/getRandomSessionProxy';
import { getActiveTabDetails } from '@/helpers/tabs';

// TODO decide what how to handle fallback proxy (if proxy is invalid, it will fallback to Firefox proxy if configured)
// https://bugzilla.mozilla.org/show_bug.cgi?id=1750561

export const handleProxyRequest = async (details: browser.proxy._OnRequestDetails) => {
  try {
    const {
      excludedHosts,
      globalProxy,
      globalProxyDetails,
      hostProxies,
      hostProxiesDetails,
      randomProxyMode,
    } = await getLocalStorageItems();

    const currentHost = new URL(details.url).hostname;
    const { hasSubdomain, domain, fullHost } = checkDomain(currentHost);
    const currentDomain = hasSubdomain ? fullHost : domain;

    const isDomainExcluded =
      excludedHosts.includes(currentDomain) || (hasSubdomain && excludedHosts.includes(domain));
    const isDomainProxied = Object.hasOwn(hostProxies, currentDomain);
    const isDomainProxydEnabled = Boolean(hostProxiesDetails[currentDomain]?.socksEnabled);
    const isParentDomainProxied = hasSubdomain && Object.hasOwn(hostProxies, domain);
    const isParentProxyEnabled = hasSubdomain && Boolean(hostProxiesDetails[domain]?.socksEnabled);
    const isGlobalProxyEnabled = globalProxyDetails.socksEnabled;

    // 1. Block speculative requests, since we can't identify their origins
    if (details.type === 'speculative') {
      return { cancel: true };
    }

    // 2. Skip proxy for local/reserved IPs
    if (isLocalOrReservedIP(currentHost)) {
      return { type: 'direct' };
    }

    // 3. When the request is a connection check (geo-lookup) originating from
    // the extension, we want to use the same proxy as the active tab, to get
    // a consistent connection check result.
    if (isExtConnCheck(details)) {
      return getProxyForExtensionConnectionCheck(
        isGlobalProxyEnabled,
        globalProxy,
        randomProxyMode,
        excludedHosts,
        hostProxies,
        hostProxiesDetails,
      );
    }

    // 4. Check for random proxy mode
    // For now, overrides all other proxy settings
    if (randomProxyMode) {
      return getRandomSessionProxy(domain);
    }

    // 5. Check domain/subdomain level
    if (isDomainExcluded) {
      return { type: 'direct' };
    }

    if (isDomainProxied && isDomainProxydEnabled) {
      return hostProxies[currentDomain];
    }

    // 5b. Fallback to parent domain for subdomains (e.g., www.reddit.com -> reddit.com)
    if (isParentDomainProxied && isParentProxyEnabled) {
      return hostProxies[domain];
    }

    // 6. Check global proxy
    if (isGlobalProxyEnabled) {
      return globalProxy;
    }

    // 7. Default: no proxy
    return { type: 'direct' };
  } catch (error) {
    console.log(error);
  }
};

async function getLocalStorageItems(): Promise<{
  excludedHosts: string[];
  globalProxy: ProxyInfo;
  globalProxyDetails: ProxyDetails;
  hostProxies: ProxyInfoMap;
  hostProxiesDetails: Record<string, ProxyDetails>;
  randomProxyMode: boolean;
}> {
  const data = await browser.storage.local.get([
    'excludedHosts',
    'globalProxy',
    'globalProxyDetails',
    'hostProxies',
    'hostProxiesDetails',
    'randomProxyMode',
  ]);

  return {
    excludedHosts: JSON.parse(data.excludedHosts),
    globalProxy: JSON.parse(data.globalProxy),
    globalProxyDetails: JSON.parse(data.globalProxyDetails),
    hostProxies: JSON.parse(data.hostProxies),
    hostProxiesDetails: JSON.parse(data.hostProxiesDetails),
    randomProxyMode: JSON.parse(data.randomProxyMode),
  };
}

export const isExtConnCheck = (details: RequestDetails): boolean => {
  const isExtensionRequest = Boolean(details.documentUrl?.startsWith('moz-extension://'));
  const isConnCheck = details.url === GEO_LOOKUP_URL;

  return isExtensionRequest && isConnCheck;
};

export const isLocalOrReservedIP = (hostname: string) => {
  //Parse with `tldts` to normalize the host (it strips the brackets for IPv6 and lowercases),
  // and to match "localhost" via the special-use flag.
  const parsed = parse(hostname, { detectSpecialUse: true });
  const normalizedHost = parsed.hostname;
  if (!normalizedHost) return false;
  if (parsed.isSpecialUse && normalizedHost === 'localhost') return true;
  if (!ipaddr.isValid(normalizedHost)) return false;

  try {
    const addr = ipaddr.parse(normalizedHost);
    const range = addr.range();

    return (
      range === 'private' ||
      range === 'multicast' ||
      range === 'linkLocal' ||
      range === 'loopback' ||
      range === 'uniqueLocal'
    );
  } catch (e: unknown) {
    console.error('Invalid IP address:', e);
    return false;
  }
};

const getProxyForExtensionConnectionCheck = async (
  isGlobalProxyEnabled: boolean,
  globalProxy: ProxyInfo,
  randomProxyMode: boolean,
  excludedHosts: string[],
  hostProxies: ProxyInfoMap,
  hostProxiesDetails: Record<string, ProxyDetails>,
) => {
  const { isAboutPage, host } = await getActiveTabDetails();
  const { domain, hasSubdomain, fullHost } = checkDomain(host);
  const tabDomain = hasSubdomain ? fullHost : domain;

  const isTabDomainExcluded =
    excludedHosts.includes(tabDomain) || (hasSubdomain && excludedHosts.includes(domain));
  const isTabDomainProxied = Object.hasOwn(hostProxies, tabDomain);
  const isTabProxyEnabled = !!hostProxiesDetails[tabDomain]?.socksEnabled;
  const isParentDomainProxied = hasSubdomain && Object.hasOwn(hostProxies, domain);
  const isParentProxyEnabled = hasSubdomain && !!hostProxiesDetails[domain]?.socksEnabled;

  // a) If the current tab is an about page, we only need to check for a global proxy
  if (isAboutPage) {
    return isGlobalProxyEnabled ? globalProxy : { type: 'direct' };
  }

  // b) If random proxy mode is enabled, we need to check for the current tab's proxy
  if (randomProxyMode) {
    return getRandomSessionProxy(tabDomain);
  }

  // c) If current tab domain is excluded, connection is direct
  if (isTabDomainExcluded) {
    return { type: 'direct' };
  }

  // d) If current tab is proxied, we need to check for the current tab's proxy
  if (isTabDomainProxied && isTabProxyEnabled) {
    return hostProxies[tabDomain];
  }

  // d-b) Fallback to parent domain for subdomains (e.g., www.reddit.com -> reddit.com)
  if (isParentDomainProxied && isParentProxyEnabled) {
    return hostProxies[domain];
  }

  // e) If global proxy is enabled
  if (isGlobalProxyEnabled) {
    return globalProxy;
  }

  return { type: 'direct' };
};
