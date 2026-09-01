import { computed, ref } from 'vue';

import useStore from '@/composables/useStore';

import { addCountryCode } from '@/helpers/socksProxy/addCountryCode';
import { groupByCountryAndCity } from '@/helpers/socksProxy/groupByCountryAndCity';
import { sortProxiesByCountryAndCity } from '@/helpers/socksProxy/sortProxiesByCountryAndCity';
import { SocksProxy } from '@/helpers/socksProxy/socksProxies.types';
import { ivpnServersToSocksProxies } from '@/helpers/socksProxy/ivpnAdapter';
import { IVpnServersStatsResponse } from '@/helpers/socksProxy/ivpn.types';

const SOCKS_API_URL = 'https://api.ivpn.net/v5/servers/stats';
const NETWORK_ERROR = `The proxy list couldn't be loaded. Please try again later.`;

const { flatProxiesList } = useStore();
const query = ref('');
const isLoading = ref(false);
const isError = ref(false);
const error = ref('');

const clearFilter = () => {
  query.value = '';
};

const getSocksProxies = async () => {
  isLoading.value = true;
  isError.value = false;
  error.value = '';

  try {
    const response = await fetch(SOCKS_API_URL);
    const raw: IVpnServersStatsResponse = await response.json();
    // Transform the IVPN servers/stats response into the flat SocksProxy[]
    // shape the rest of the pipeline expects. The adapter filters inactive
    // servers and parses the socks5 "hostname:internal_ip" field.
    const data: SocksProxy[] = ivpnServersToSocksProxies(raw);
    flatProxiesList.value = data;
  } catch (e: unknown) {
    isError.value = true;

    if (e instanceof Error) {
      if (e.message.includes('NetworkError')) {
        error.value = NETWORK_ERROR;
      } else {
        error.value = e.message;
      }
    } else {
      error.value = `An unknown error occurred: ${e}`;
    }
    console.log(e);
  } finally {
    isLoading.value = false;
  }
};

const queryLower = computed(() => query.value?.toLowerCase() ?? '');
const filteredData = computed(() =>
  flatProxiesList.value.filter((socksProxy) => {
    const q = queryLower.value;
    if (!q) return true;

    const country = socksProxy.location.country?.toLowerCase();
    const city = socksProxy.location.city?.toLowerCase();
    const hostname = socksProxy.hostname?.toLowerCase();

    return country?.includes(q) || city?.includes(q) || hostname?.includes(q);
  }),
);

const filteredProxies = computed(() =>
  sortProxiesByCountryAndCity(groupByCountryAndCity(addCountryCode(filteredData.value))),
);

const useSocksProxies = () => {
  return { clearFilter, filteredProxies, getSocksProxies, query, isLoading, isError, error };
};

export default useSocksProxies;
