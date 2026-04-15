<script setup lang="ts">
import type { RoleDetailResp } from '#/apis/system/role';

import { nextTick, ref } from 'vue';


import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { eachTree } from '@vben/utils';

import { Tabs, TabsList, TabsTrigger, VbenButton } from '@vben-core/shadcn-ui';

import { getRole, listRolePermissionTree } from '#/apis/system/role';

import { emitter } from '../mitt';
import RolePermission from './RolePermission.vue';
import RoleUser from './RoleUser.vue';

// 角色id
const dataId = ref<number | string>();
// 角色详情
const roleDetail = ref<RoleDetailResp>();
// 菜单树
const menuTree = ref<any>([]);
// 菜单选中的key
const selectKeys = ref<any>([]);
// 加载状态
const loading = ref(false);

// 当前激活的Tab
const activeTab = ref('permission');

// 监听左侧角色管理行点击时，右侧的数据处理
emitter.on('rowClick', async (value) => {
  console.log('接收到rowClick事件:', value);
  loading.value = true;
  try {
    dataId.value = value;
    console.log('开始获取菜单列表...');
    // 获取菜单列表
    const menus = await listRolePermissionTree();
    console.log('菜单列表:', menus);
    // i18n处理
    eachTree(menus, (node) => {
      node.label = ((node.title ?? node.name ?? '') as string).includes('.')
        ? $t(node.title ?? node.name ?? '')
        : (node.title ?? node.name ?? '');
    });
    menuTree.value = menus;
    await nextTick();
    console.log('开始获取角色详情...');
    // 查询角色详情
    roleDetail.value = await getRole(dataId.value);
    console.log('角色详情:', roleDetail.value);
    selectKeys.value = roleDetail.value.menuIds;
    console.log('选中的菜单ID:', selectKeys.value);
  } catch (error) {
    console.error('加载角色数据失败:', error);
  } finally {
    loading.value = false;
  }
});

// 刷新当前角色权限
const handleRefresh = () => {
  if (roleDetail.value?.id) {
    emitter.emit('rowClick', roleDetail.value.id);
  }
};
</script>

<template>
  <div class="h-full flex flex-col bg-background">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center h-full">
      <IconifyIcon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="!roleDetail" class="flex flex-col items-center justify-center h-full text-muted-foreground">
      <IconifyIcon icon="lucide:shield" class="w-16 h-16 mb-4 opacity-50" />
      <p class="text-base">{{ $t('system.role.selectRoleTip') }}</p>
    </div>

    <!-- 内容区 -->
    <div v-else class="h-full flex flex-col">
      <!-- 顶部操作栏 -->
      <div class="flex items-center justify-between p-3 border-b bg-card">
        <Tabs v-model="activeTab" class="w-auto">
          <TabsList>
            <TabsTrigger value="permission" class="gap-2">
              <IconifyIcon icon="lucide:shield-check" class="w-4 h-4" />
              {{ $t('system.role.permission') }}
            </TabsTrigger>
            <TabsTrigger value="members" class="gap-2">
              <IconifyIcon icon="lucide:users" class="w-4 h-4" />
              {{ $t('system.role.user') }}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div class="flex items-center gap-2">
          <VbenButton variant="outline" size="sm" @click="handleRefresh">
            <IconifyIcon icon="lucide:refresh-cw" class="w-4 h-4" />
          </VbenButton>
        </div>
      </div>

      <!-- Tab 内容 -->
      <div class="flex-1 overflow-hidden">
        <div v-show="activeTab === 'permission'" class="h-full">
          <RolePermission :role-id="dataId!" :role-detail="roleDetail" :menu-tree="menuTree"
            :select-keys="selectKeys" />
        </div>

        <div v-show="activeTab === 'members'" class="h-full">
          <RoleUser :role-id="dataId!" :role-name="roleDetail.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.tabs-list) {
  background: transparent;
  border: none;
}

:deep(.tabs-trigger) {
  border-radius: 0;
  border-bottom: 2px solid transparent;

  &[data-state="active"] {
    background: transparent;
    border-bottom-color: hsl(var(--primary));
  }
}
</style>
