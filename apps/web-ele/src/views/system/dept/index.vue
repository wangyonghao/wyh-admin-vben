<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DeptResp } from '#/apis/system/dept';

import { ref, watch } from 'vue';

import { useDebounceFn } from '@vueuse/core';
import { IconifyIcon } from '@vben/icons';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  VbenButton,
} from '@vben-core/shadcn-ui';

import { ElMessage, ElTag } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDept, exportDept, listDept } from '#/apis/system/dept';
import { useDownload } from '#/hooks/app/useDownload';

import { useDeptColumns } from './data';
import EditModal from './EditModal.vue';

// 搜索表单
const searchForm = ref({
  name: '',
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useDeptColumns(),
    border: true,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    columnConfig: {
      resizable: true,
    },
    treeConfig: {
      rowField: 'id',
      parentField: 'parentId',
      childrenField: 'children',
      transform: false,
    },
    proxyConfig: {
      response: {
        list: 'list',
      },
      ajax: {
        query: async () => {
          const res = await listDept({
            description: searchForm.value.name || undefined,
          });
          return { list: res, total: res.length };
        },
        querySuccess: ({ $grid }) => {
          $grid?.setAllTreeExpand(true);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    checkboxConfig: {
      highlight: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: {
        code: 'query',
      },
      zoom: true,
      zoomOptions: {},
    },
  } as VxeTableGridOptions<DeptResp>,
});

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: EditModal,
  destroyOnClose: true,
});

const handleEdit = (record: DeptResp) => {
  formDrawerApi.setData({ id: record.id });
  formDrawerApi.open();
};

const handleAdd = () => {
  formDrawerApi.setData({});
  formDrawerApi.open();
};

const deleteDialogVisible = ref(false);
const deleteRow = ref<DeptResp | null>(null);

const showDeleteDialog = (row: DeptResp) => {
  deleteRow.value = row;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (!deleteRow.value) return;

  try {
    await deleteDept(deleteRow.value.id);
    ElMessage.success($t('pages.common.deleteSuccess'));
    await gridApi.query();
    deleteDialogVisible.value = false;
    deleteRow.value = null;
    return true;
  } catch {
    return false;
  }
};

const handleExport = () => {
  useDownload(() =>
    exportDept({
      description: searchForm.value.name || undefined,
    }),
  );
};

// 搜索（防抖）
const handleSearch = useDebounceFn(() => {
  gridApi.query();
}, 300);

// 监听搜索表单变化
watch(
  () => searchForm.value.name,
  () => {
    handleSearch();
  },
);

// 树列表折叠状态
const expanded = ref<boolean>(true);
const handleExpand = () => {
  expanded.value = !expanded.value;
  gridApi.grid.setAllTreeExpand(expanded.value);
};
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.dept.listTitle')">
          <template #toolbar-tools>
            <div class="flex items-center justify-between w-full gap-4">
              <!-- 左侧搜索框 -->
              <div class="relative w-64">
                <IconifyIcon
                  icon="lucide:search"
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                />
                <Input
                  v-model="searchForm.name"
                  :placeholder="$t('system.dept.name')"
                  class="pl-10 h-8"
                />
              </div>

              <!-- 右侧操作按钮 -->
              <div class="flex items-center gap-2">
                <span v-access:code="['system:dept:create']">
                  <Button @click="handleAdd" variant="outline">
                    <IconifyIcon icon="lucide:plus" class="mr-2 w-4 h-4" />
                    {{ $t('pages.common.add') }}
                  </Button>
                </span>
                <span v-access:code="['system:dept:export']">
                  <Button variant="outline" @click="handleExport">
                    <IconifyIcon icon="lucide:download" class="mr-2 w-4 h-4" />
                    {{ $t('pages.common.export') }}
                  </Button>
                </span>
                <span>
                  <Button variant="outline" @click="handleExpand">
                    <IconifyIcon
                      :icon="expanded ? 'lucide:chevrons-up' : 'lucide:chevrons-down'"
                      class="mr-2 w-4 h-4"
                    />
                    {{ expanded ? $t('pages.common.collapse') : $t('pages.common.expand') }}
                  </Button>
                </span>
              </div>
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
            <template #action="{ row }">
              <div class="flex items-center gap-2">
                <span v-access:code="['system:dept:update']">
                  <VbenButton variant="ghost" size="icon" @click="handleEdit(row)">
                    <IconifyIcon icon="lucide:pencil" class="w-4 h-4" />
                  </VbenButton>
                </span>
                <span v-access:code="['system:dept:delete']">
                  <VbenButton variant="ghost" size="icon" @click="showDeleteDialog(row)">
                    <IconifyIcon icon="lucide:trash-2" class="w-4 h-4 text-destructive" />
                  </VbenButton>
                </span>
              </div>
            </template>
    </Grid>
    <FormDrawer @success="gridApi.query()" />

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="deleteDialogVisible" @update:open="(val) => deleteDialogVisible = val">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ $t('ui.actionMessage.deleteTitle') }}</DialogTitle>
          <DialogDescription>
            {{ $t('ui.actionMessage.deleteConfirm', [deleteRow?.name]) }}
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
  </Page>
</template>

<style scoped>
:deep(.vxe-table) {
  border-radius: 0;
}

:deep(.vxe-toolbar) {
  padding: 1rem;
}
</style>
