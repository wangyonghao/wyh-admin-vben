<script setup lang="ts">
import type { TreeNodeData } from 'element-plus';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { UserQuery, UserResp } from '#/apis/system/user';

import { nextTick, ref } from 'vue';

import { useAccess } from '@vben/access';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useVbenDrawer,
  useVbenModal,
} from '@vben/common-ui';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@vben-core/shadcn-ui';

import {
  ElAvatar,
  ElMessage,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUser, exportUser, listUser } from '#/apis/system/user';
import { useDownload } from '#/hooks/app/useDownload';

import { emitter } from '../mitt';
import ResetPwdModal from './ResetPwdModal.vue';
import {
  useUserGridFieldColumns,
  useUserGridSearchFormSchema,
} from './UserData';
import UserEditDrawer from './UserEditDrawer.vue';
import UserUpdateRoleModal from './UserUpdateRoleModal.vue';

const deptInfo = ref<TreeNodeData>();
const { hasAccessByCodes } = useAccess();

emitter.on('nodeClick', async (value: TreeNodeData) => {
  deptInfo.value = value;
  await tableGridApi.formApi.setFieldValue(
    'deptId',
    deptInfo.value.key ?? undefined,
  );
  await nextTick();
  await tableGridApi.query();
});

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useUserGridSearchFormSchema(),
    submitOnChange: true,
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
          const res = await listUser({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
            deptId: deptInfo.value?.key ?? undefined,
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

const [EditorWindow, editorApi] = useVbenDrawer({
  connectedComponent: UserEditDrawer,
  destroyOnClose: true,
});

const handleEdit = (record: UserResp) => {
  editorApi.setData({ id: record.id });
  editorApi.open();
};

const handleAdd = () => {
  editorApi.setData({});
  editorApi.open();
};

const deleteDialogVisible = ref(false);
const deleteRow = ref<UserResp | null>(null);

const showDeleteDialog = (row: UserResp) => {
  deleteRow.value = row;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (!deleteRow.value) return;

  try {
    await deleteUser(deleteRow.value.id);
    ElMessage.success($t('pages.common.deleteSuccess'));
    await tableGridApi.query();
    deleteDialogVisible.value = false;
    deleteRow.value = null;
    return true;
  } catch {
    return false;
  }
};

const handleExport = () => {
  useDownload(async () =>
    exportUser(await tableGridApi.formApi.getValues<UserQuery>()),
  );
};

// 重置密码窗口
const [ResetPwdWindow, resetPwdApi] = useVbenModal({
  connectedComponent: ResetPwdModal,
  destroyOnClose: true,
});
// 重置密码
const onResetPwd = (record: UserResp) => {
  resetPwdApi.setData(record);
  resetPwdApi.open();
};

// 分配角色
const [UserUpdateRoleModalWindow, UserUpdateRoleModalApi] = useVbenModal({
  connectedComponent: UserUpdateRoleModal,
  destroyOnClose: true,
});
const onUpdateRole = (record: UserResp) => {
  UserUpdateRoleModalApi.setData(record);
  UserUpdateRoleModalApi.open();
};
</script>

<template>
  <Card class="flex h-full flex-col">
    <CardHeader>
      <CardTitle>{{ deptInfo?.title }}</CardTitle>
    </CardHeader>
    <CardContent class="flex-1 overflow-auto">
      <TableGrid :table-title="$t('system.user.listTitle')">
        <template #toolbar-tools>
          <div class="flex items-center gap-2">
            <span v-access:code="['system:user:create']">
              <VbenButton @click="handleAdd">
                {{ $t('pages.common.add') }}
              </VbenButton>
            </span>
            <span v-access:code="['system:user:export']">
              <VbenButton variant="destructive" @click="handleExport">
                {{ $t('pages.common.export') }}
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
            <span v-access:code="['system:user:update']">
              <VbenButton variant="ghost" size="icon" @click="handleEdit(row)">
                <IconifyIcon icon="lucide:pencil" class="w-4 h-4" />
              </VbenButton>
            </span>
            <span v-access:code="['system:user:delete']">
              <VbenButton variant="ghost" size="icon" @click="showDeleteDialog(row)">
                <IconifyIcon icon="lucide:trash-2" class="w-4 h-4 text-destructive" />
              </VbenButton>
            </span>
            <span
              v-if="
                hasAccessByCodes([
                  'system:user:resetPwd',
                  'system:user:updateRole',
                ])
              "
            >
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <VbenButton variant="ghost" size="icon">
                    <IconifyIcon icon="lucide:more-vertical" class="w-4 h-4" />
                  </VbenButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <span v-access:code="['system:user:resetPwd']">
                    <DropdownMenuItem @click="onResetPwd(row)">
                      {{ $t('system.user.pwdReset') }}
                    </DropdownMenuItem>
                  </span>
                  <span v-access:code="['system:user:updateRole']">
                    <DropdownMenuItem :disabled="row.isSystem" @click="onUpdateRole(row)">
                      {{ $t('system.user.roleAssign') }}
                    </DropdownMenuItem>
                  </span>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          </div>
        </template>
      </TableGrid>
    </CardContent>
    <EditorWindow @success="tableGridApi.query()" />
    <ResetPwdWindow />
    <UserUpdateRoleModalWindow @success="tableGridApi.query()" />

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="deleteDialogVisible" @update:open="(val) => deleteDialogVisible = val">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ $t('ui.actionMessage.deleteTitle') }}</DialogTitle>
          <DialogDescription>
            {{ $t('ui.actionMessage.deleteConfirm', [deleteRow?.username]) }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <VbenButton variant="outline" @click="deleteDialogVisible = false">
            {{ $t('common.cancel') }}
          </VbenButton>
          <VbenButton variant="destructive" @click="handleDelete">
            {{ $t('common.confirm') }}
          </VbenButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Card>
</template>
<style lang="scss" scoped>
.card {
  height: 100%;
}
</style>
