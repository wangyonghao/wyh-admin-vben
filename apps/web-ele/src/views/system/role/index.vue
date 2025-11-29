<script setup lang="ts">
import { reactive } from 'vue';

import { ColPage } from '@vben/common-ui';

import RoleList from './left/index.vue';
import RoleDetail from './right/index.vue';

defineOptions({ name: 'SystemRole' });
const props = reactive({
  leftCollapsedWidth: 5,
  leftCollapsible: true,
  leftMaxWidth: 35,
  leftMinWidth: 20,
  leftWidth: 30,
  resizable: true,
  rightWidth: 70,
  splitHandle: true,
  splitLine: true,
});
</script>

<template>
  <ColPage auto-content-height v-bind="props">
    <template #left>
      <RoleList />
    </template>
    <RoleDetail />
  </ColPage>
</template>

<style scoped></style>
