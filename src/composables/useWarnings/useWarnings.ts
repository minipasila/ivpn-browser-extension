import { computed } from 'vue';

import { warnings } from '@/composables/useWarnings/warnings';
import useWebRtc from '@/composables/useWebRtc';

const { webRTCLeaking } = useWebRtc();

const activeWarnings = computed(() => {
  const activeWarningsIds: string[] = [];

  if (webRTCLeaking.value) {
    activeWarningsIds.push('webrtc-leak');
  }

  return warnings.filter((warning) => activeWarningsIds.includes(warning.id));
});

const useWarnings = () => {
  return {
    activeWarnings,
  };
};

export default useWarnings;
