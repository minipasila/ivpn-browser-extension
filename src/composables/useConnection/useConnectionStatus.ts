import { ref } from 'vue';
import useConnection from '@/composables/useConnection/useConnection';

const isChecking = ref(false);

const useConnectionStatus = () => {
  const { updateConnection } = useConnection();

  const checkStatus = async () => {
    if (isChecking.value) {
      return;
    }

    isChecking.value = true;

    try {
      await updateConnection();
    } finally {
      isChecking.value = false;
    }
  };

  return {
    checkStatus,
    isChecking,
  };
};

export default useConnectionStatus;
