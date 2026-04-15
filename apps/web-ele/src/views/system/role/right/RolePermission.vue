<script setup lang="ts">
import type { RoleDetailResp } from '#/apis/system/role';

import { ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { VbenButton } from '@vben-core/shadcn-ui';

import { ElMessage } from 'element-plus';

import { updateRolePermission } from '#/apis/system/role';
import { MenuSelectTable } from '#/components/tree';

interface Props {
  roleId: number | string;
  roleDetail: RoleDetailResp;
  menuTree: any[];
  selectKeys: any[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  refresh: [];
}>();

// 菜单选择组件实例引用
const menuSelectRef = ref<InstanceType<typeof MenuSelectTable>>();

/**
 * 通过回调更新 无法通过v-model
 * @param value 菜单选择是否严格模式
 */
function handleMenuCheckStrictlyChange(value: boolean) {
  props.roleDetail.menuCheckStrictly = value;
}

// 保存权限
const saving = ref(false);
const handleSave = async () => {
  saving.value = true;
  try {
    // 这个用于提交
    const menuIds = menuSelectRef.value?.getCheckedKeys?.() ?? [];
    await updateRolePermission(props.roleId.toString(), {
      menuIds,
      menuCheckStrictly: props.roleDetail.menuCheckStrictly,
    });
    ElMessage.success($t('pages.common.saveSuccess'));
    emit('refresh');
  } finally {
    saving.value = false;
  }
};

// 菜单id列表
const menuIds = ref<(number | string)[]>([]);
// 处理菜单选择变化
const handleCheckEvent = (values: (number | string)[]) => {
  menuIds.value = values;
};

// 展开/折叠全部
const expandAll = () => {
  menuSelectRef.value?.setExpandOrCollapse?.(true);
};
const collapseAll = () => {
  menuSelectRef.value?.setExpandOrCollapse?.(false);
};
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 操作栏 -->
    <div class="flex items-center justify-between px-3 py-3 border-b bg-card">
      <div class="flex items-center gap-4">
        <VbenButton :loading="saving" size="sm" @click="handleSave">
          <IconifyIcon icon="lucide:save" class="mr-1.5 w-4 h-4" />
          {{ $t('system.role.permissionSave') }}
        </VbenButton>

        <div class="rounded-md bg-blue-50 px-3 py-1 text-sm dark:bg-blue-950">
          已选中
          <span class="mx-1 font-semibold text-primary">{{ menuIds.length }}</span>
          项
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span>节点关联:</span>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" :checked="roleDetail.menuCheckStrictly"
              @change="handleMenuCheckStrictlyChange(!roleDetail.menuCheckStrictly)"
              class="w-4 h-4 rounded border-gray-300" />
            <span>{{ roleDetail.menuCheckStrictly ? '已启用' : '已禁用' }}</span>
          </label>
        </div>
        <VbenButton variant="outline" size="sm" @click="collapseAll" title="折叠全部">
          <IconifyIcon icon="lucide:chevrons-up" class="mr-1.5 w-4 h-4" />
          折叠全部
        </VbenButton>
        <VbenButton variant="outline" size="sm" @click="expandAll" title="展开全部">
          <IconifyIcon icon="lucide:chevrons-down" class="mr-1.5 w-4 h-4" />
          展开全部
        </VbenButton>
      </div>
    </div>

    <!-- 权限表格 -->
    <div class="flex-1 overflow-auto">
      <MenuSelectTable ref="menuSelectRef" :checked-keys="selectKeys" :association="roleDetail.menuCheckStrictly"
        :menus="menuTree" :show-toolbar="false" @check-change-event="handleCheckEvent"
        @update:association="handleMenuCheckStrictlyChange" @refresh="emit('refresh')" />
    </div>
  </div>
</template>

<style scoped>
:deep(.vxe-table) {
  border: none !important;
}

:deep(.vxe-table--header) {
  background: hsl(var(--muted)) !important;
}

:deep(.vxe-table--body) {
  background: transparent !important;
}

:deep(.vxe-body--row) {
  border-bottom: 1px solid hsl(var(--border)) !important;
}

:deep(.vxe-body--row:hover) {
  background: hsl(var(--accent)) !important;
}
</style>
