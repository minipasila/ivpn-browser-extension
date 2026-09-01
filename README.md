# IVPN Browser Extension

IVPN Browser Extension is a Firefox extension improving your browser experience while using IVPN. It
displays information about your connection and provides one-click access to
[SOCKS5 proxy servers](https://www.ivpn.net/knowledgebase/general/socks5-proxy-service/).

> **Note:** This is a community fork of
> [Mullvad's browser extension](https://github.com/mullvad/browser-extension), adapted to use IVPN's
> API and SOCKS5 proxy service. It is not affiliated with or endorsed by IVPN Limited.

## Disclaimer

**This software is provided "as is", without warranty of any kind, express or implied.** Use it at
your own risk. The maintainers of this fork are not responsible for any damage, data loss, or
security issues that may arise from using this extension. You are solely responsible for verifying
that the extension behaves as expected in your environment and that it meets your privacy and
security requirements. Always review the source code before installing untrusted browser extensions.

## Download

The extension is available here on Github in the
[Releases](https://github.com/minipasila/ivpn-browser-extension/releases).

## Development

### **Environment**

Build with:

- Node 24 LTS
- Npm 11

_If you use `nvm`, run `nvm use` to automatically set these versions._

For:

- Firefox: last version (>91.1.0)

### **Developing**

The first time, use `npm install` to install the necessary packages.

To start the extension in a a temporary and clean browser:

- use `npm run dev` to automatically rebuild the extension when changes are saved.
- use `npm start` in another terminal to start a development instance of Firefox with the extension
  loaded. The extension will automatically reload when changes are saved.

The developer tools can be started by clicking on the `inspect` in the debugging tab (automatically
opened).

### **Building**

- use `npm run build` to build the extension **first**
- use `npm run pack:xpi` to create `.xpi` file in the root folder

_There are other build options which you can view in `package.json`._

### **Testing the extension in your browser**

You can only install the extension temporarily when it is not signed by Mozilla. To do so:

- open Firefox
- enter "about:debugging#/runtime/this-firefox" in the URL bar
- click "Load Temporary Add-on"
- open `extension.xpi` file.

The extension will automatically unload when Firefox is closed.

### **Testing restart and persisting features**

You can use the `restart` script to test restart and persisting features (like settings saved to
local storage). It will require some manual configuration:

- go to `about:profiles` and create a new Firefox profile
- go to `package.json` and change the `restart` script with your own Firefox profile path
- go to `about:config` and set both `extensions.webextensions.keepStorageOnUninstall` and
  `extensions.webextensions.keepUuidOnUninstall` to `true`.

[Learn more](https://extensionworkshop.com/documentation/develop/testing-persistent-and-restart-features/)

## Permissions

IVPN Browser Extension requires the following permissions:

- `management` to be able to recommend third party extensions
- `privacy` to disable webRTC and check HTTPS-Only status
- `storage` to save preferences
- `search` to recommend other search engines
- `*://*.ivpn.net/*` to get proxy servers list and display your connection information (See
  `Network requests` for details)

The following permissions are optional, but are needed to use the proxy feature:

- `proxy` to configure and use IVPN proxy servers
- `tabs` to show proxy settings from active tab
- `<all_urls>` to specify a proxy configuration per domain (each request needs to be intercepted)

_Permissions are automatically accepted when testing the extension._

## Network requests

Two external network requests are made by the extension:

- `api.ivpn.net` to get the latest proxy servers (Frequency: each time the
  `Select proxy server location` drawer is opened)
- `api.ivpn.net/v4/geo-lookup` to get the connection information (Frequency: each time the popup is
  started and each time the proxy is connected/disconnected)

_External links are marked with this icon_
![External Link icon](https://github.com/feathericon/feathericon/blob/master/src/svg/link-external.svg)

## Source code

Source code is available in the [Github repo](https://github.com/minipasila/ivpn-browser-extension).

## License

IVPN Browser Extension as a whole is licensed GPLv3+, except for the parts specified in
[LICENSE.md](./LICENSE.md). This is a fork of the Mullvad Browser Extension, which is also licensed
GPLv3+.
