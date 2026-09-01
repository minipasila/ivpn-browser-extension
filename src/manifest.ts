import fs from 'fs-extra';
import type { Manifest } from 'webextension-polyfill';
import type PkgType from '../package.json';
import { isDev, port, r } from '../scripts/utils';

export async function getManifest() {
  const pkg = (await fs.readJSON(r('package.json'))) as typeof PkgType;

  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 2,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    browser_action: {
      default_icon: './assets/ivpn-logo.svg',
      default_popup: './dist/popup/index.html',
      default_area: 'navbar',
    },
    options_ui: {
      page: './dist/options/index.html',
      open_in_tab: true,
    },
    background: {
      page: './dist/background/index.html',
      persistent: true,
    },
    icons: {
      '16': './assets/ivpn-logo.svg',
      '48': './assets/ivpn-logo.svg',
      '96': './assets/ivpn-logo.svg',
    },
    permissions: ['management', 'privacy', 'search', 'storage', '*://*.ivpn.net/*'],
    optional_permissions: ['proxy', 'tabs', '<all_urls>'],
    browser_specific_settings: {
      gecko: {
        strict_min_version: '91.1.0',
        id: '{a7c4f2e1-9b3d-4e8a-9f1c-6d2e7b8a5c10}',
      },
    },
    incognito: 'spanning',
  };

  if (isDev) {
    // this is required on dev for Vite script to load
    // eslint-disable-next-line no-useless-escape
    manifest.content_security_policy = `script-src \'self\' http://localhost:${port}; object-src \'self\'`;
  }

  return manifest;
}
