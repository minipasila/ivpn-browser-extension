<script lang="ts" setup>
import { inject } from 'vue';

import { ConnectionKey, defaultConnection } from '@/composables/useConnection/useConnection';

const { connection } = inject(ConnectionKey, defaultConnection);
</script>

<template>
  <div class="ml-30px">
    <div>
      <h4 class="font-semibold inline-block">IP</h4>
      <span class="ml-2">{{ connection.ip }}</span>
    </div>
    <div>
      <h4 class="font-semibold inline-block">Provider</h4>
      <span class="ml-2">{{ connection.isp }}</span>
    </div>
  </div>
</template>
