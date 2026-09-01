import { InjectionKey, Ref, ref } from 'vue';
import type { Connection } from '@/helpers/connCheck.types';
import { connCheck } from '@/helpers/connCheck';

const connection = ref({} as Connection);
const isLoading = ref(false);
const isError = ref(false);
const error = ref<Error | undefined>(undefined);

const updateConnection = async () => {
  isLoading.value = true;
  isError.value = false;
  error.value = undefined;
  try {
    connection.value = await connCheck();
  } catch (e) {
    console.log({ useConnectionError: e });
    isError.value = true;
    error.value = e as Error;
  } finally {
    isLoading.value = false;
  }
};

const useConnection = () => {
  return { connection, error, isError, isLoading, updateConnection };
};

export default useConnection;

export const ConnectionKey: InjectionKey<{
  connection: Ref<Connection>;
  isError: Ref<boolean>;
  isLoading: Ref<boolean>;
}> = Symbol('Connection');

export const defaultConnection = {
  connection: ref({} as Connection),
  isLoading: ref(false),
  isError: ref(false),
};
