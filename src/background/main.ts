import { addExtensionsListeners } from '@/helpers/extensions';
import { initProxyListeners } from '@/helpers/proxyListeners';
import { initConfig } from '@/helpers/config';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client');
}

// Add listeners on extension actions
addExtensionsListeners();

// Add listeners for proxy actions
initProxyListeners();

// Fetch and save the conncheck config
void initConfig();
