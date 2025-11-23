<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { UserResp } from '#/api/system/user';

import { watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  VbenButton,
} from '@vben-core/shadcn-ui';

import { ElAvatar, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listRoleUser, unassignFromUsers } from '#/api';

import RoleUserAssign from './RoleUserAssign.vue';

interface Props {
  roleId: number | string;
  roleName: string;
}
const props = withDefaults(defineProps<Props>(), {
  roleId: '',
  roleName: '',
});

// Table 字段配置
function useUserGridFieldColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 70, fixed: 'left' },
    {
      field: 'nickname',
      title: $t('system.user.nickname'),
      slots: { default: 'nickname' },
      align: 'center',
    },
    {
      field: 'username',
      title: $t('system.user.username'),
      align: 'center',
    },
    {
      field: 'status',
      title: $t('system.user.status'),
      slots: { default: 'status' },
      align: 'center',
    },
    {
      field: 'gender',
      title: $t('system.user.gender'),
      slots: { default: 'gender' },
      align: 'center',
    },
    {
      field: 'deptName',
      title: $t('system.user.deptId'),
      align: 'center',
    },

    {
      field: 'description',
      title: $t('system.user.description'),
      align: 'center',
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.operation'),
      width: 150,
    },
  ];
}
// 设置表格搜索
function useUserGridSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'description',
      component: 'Input',
      hideLabel: true,
      componentProps: {
        placeholder: $t('system.user.searchKey'),
      },
    },
  ];
}

// 设置表格
const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useUserGridSearchFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
  },
  gridOptions: {
    columns: useUserGridFieldColumns(),
    border: true,
    height: 'auto',
    keepSource: true,
    columnConfig: {
      resizable: true,
    },
    proxyConfig: {
      response: {
        list: 'list',
      },
      ajax: {
        query: async ({ page }, formValues) => {
          if (props.roleId === '') {
            return {
              list: [],
              total: 0,
            };
          }
          const res = await listRoleUser(props.roleId as string, {
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
          return res;
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
      isCurrent: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: {
        code: 'query',
      },
      search: true,
      zoom: true,
      zoomOptions: {},
    },
  } as VxeTableGridOptions<UserResp>,
});

const deleteDialogVisible = ref(false);
const deleteRow = ref<UserResp | null>(null);

const showDeleteDialog = (row: UserResp) => {
  deleteRow.value = row;
  deleteDialogVisible.value = true;
};

const handleCancelAssignment = async () => {
  if (!deleteRow.value) return;

  try {
    await unassignFromUsers([deleteRow.value.id]);
    ElMessage.success($t('pages.common.deleteSuccess'));
    await tableGridApi.query();
    deleteDialogVisible.value = false;
    deleteRow.value = null;
    return true;
  } catch {
    return false;
  }
};

const [RoleAssignModel, roleUserAssignApi] = useVbenModal({
  connectedComponent: RoleUserAssign,
  destroyOnClose: true,
});

const handleAssign = () => {
  roleUserAssignApi.open();
};

watch(
  () => props.roleId,
  async () => {
    await tableGridApi.query();
  },
  { immediate: true },
);
</script>
<template>
  <TableGrid :table-title="$t('system.user.listTitle')">
    <template #toolbar-tools>
      <div class="flex items-center gap-2">
        <span v-access:code="['system:user:create']">
          <VbenButton @click="handleAssign">
            {{ $t('system.role.assignRole') }}
          </VbenButton>
        </span>
      </div>
    </template>
    <template #nickname="{ row }">
      <div class="flex flex-row items-center gap-2">
        <ElAvatar :size="32" :src="row.avatar" />
        <span class="flex-1">{{ row.nickname }}</span>
      </div>
    </template>
    <template #status="{ row }">
      <ElTag v-if="row.status === 1" type="success">
        {{ $t('common.enabled') }}
      </ElTag>
      <ElTag v-else type="danger">
        {{ $t('common.disabled') }}
      </ElTag>
    </template>
    <template #gender="{ row }">
      <ElTag v-if="row.gender === 1" type="success"> 男 </ElTag>
      <ElTag v-else-if="row.gender === 2"> 女 </ElTag>
      <ElTag v-else> 未知 </ElTag>
    </template>
    <template #roleIds="{ row }">
      <ElTag type="success" v-for="item in row.roleNames" :key="item">
        {{ item }}
      </ElTag>
    </template>
    <template #action="{ row }">
      <div class="flex items-center gap-2">
        <span v-access:code="['system:role:unassign']">
          <VbenButton 
            variant="ghost" 
            size="icon" 
            :disabled="row.isSystem"
            @click="showDeleteDialog(row)"
          >
            <IconifyIcon icon="lucide:user-minus" class="w-4 h-4 text-destructive" />
          </VbenButton>
        </span>
      </div>
    </template>
  </TableGrid>
  <RoleAssignModel
    :role-id="props.roleId"
    :role-name="props.roleName"
    @close="tableGridApi.query()"
    @success="tableGridApi.query()"
  />

  <!-- Delete Confirmation Dialog -->
  <Dialog :open="deleteDialogVisible" @update:open="(val) => deleteDialogVisible = val">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>取消分配</DialogTitle>
        <DialogDescription>
          {{ $t('system.role.cancelRoleConfirm', [deleteRow?.nickname, props.roleName]) }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <VbenButton variant="outline" @click="deleteDialogVisible = false">
          {{ $t('common.cancel') }}
        </VbenButton>
        <VbenButton variant="destructive" @click="handleCancelAssignment">
          {{ $t('common.confirm') }}
        </VbenButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
<style lang="scss" scoped></style>
