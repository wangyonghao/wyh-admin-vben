<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MenuResp } from '#/apis';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  VbenButton,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  VbenIcon,
} from '@vben-core/shadcn-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { clearMenuCache, deleteMenu, listMenu } from '#/apis';
import { $t } from '@vben/locales';

import { useMenuColumns, useMenuSearchFormFields } from './data';
import EditModal from './EditModal.vue';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useMenuSearchFormFields(),
    submitOnChange: true,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useMenuColumns(),
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
        query: async ({ page }, formValues) => {
          const res = await listMenu({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
          return { list: res, total: res.length };
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
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<MenuResp>,
});

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: EditModal,
  destroyOnClose: true,
});

const handleEdit = (record: MenuResp) => {
  formDrawerApi.setData({ id: record.id });
  formDrawerApi.open();
};

const handleAdd = () => {
  formDrawerApi.setData({});
  formDrawerApi.open();
};

const deleteDialogVisible = ref(false);
const deleteRow = ref<MenuResp | null>(null);

const showDeleteDialog = (row: MenuResp) => {
  deleteRow.value = row;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (!deleteRow.value) return;

  try {
    await deleteMenu(deleteRow.value.id);
    // TODO: 使用 toast 替代 ElMessage
    console.log('删除成功');
    await gridApi.query();
    deleteDialogVisible.value = false;
    deleteRow.value = null;
    return true;
  } catch {
    return false;
  }
};

// 清除缓存
const centerDialogVisible = ref(false);
const handleClearCache = () => {
  centerDialogVisible.value = true;
};
const clearCache = async () => {
  await clearMenuCache();
  // TODO: 使用 toast 替代 ElMessage
  console.log('清除成功');
  centerDialogVisible.value = false;
};

// 树列表折叠状态
const expanded = ref<boolean>(false);
/**
 * 全部展开/折叠
 */
const handleExpand = () => {
  expanded.value = !expanded.value;
  gridApi.grid.setAllTreeExpand(expanded.value);
};
</script>
<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.menu.listTitle')">
      <template #toolbar-tools>
        <div class="flex items-center gap-2">
          <span v-access:code="['system:menu:create']">
            <VbenButton @click="handleAdd">
              {{ $t('pages.common.add') }}
            </VbenButton>
          </span>
          <span v-access:code="['system:menu:clearCache']">
            <VbenButton variant="destructive" @click="handleClearCache">
              {{ $t('pages.common.clearCache') }}
            </VbenButton>
          </span>
          <span>
            <VbenButton v-if="!expanded" variant="outline" @click="handleExpand">
              {{ $t('pages.common.expand') }}
            </VbenButton>
          </span>
          <span>
            <VbenButton v-if="expanded" variant="outline" @click="handleExpand">
              {{ $t('pages.common.collapse') }}
            </VbenButton>
          </span>
        </div>
      </template>
      <template #title="{ row }">
        <div class="flex items-center gap-2">
          <VbenIcon v-if="row.icon" :icon="row.icon" class="size-4" />
          <span>{{ row.title }}</span>
        </div>
      </template>
      <template #type="{ row }">
        <Badge v-if="row.type === 1" variant="default">目录</Badge>
        <Badge v-if="row.type === 2" variant="secondary" class="bg-green-500 text-white">菜单</Badge>
        <Badge v-if="row.type === 3" variant="outline">按钮</Badge>
      </template>
      <template #status="{ row }">
        <Badge v-if="row.status" variant="secondary" class="bg-green-500 text-white">
          {{ $t('common.enabled') }}
        </Badge>
        <Badge v-else variant="destructive">
          {{ $t('common.disabled') }}
        </Badge>
      </template>
      <template #isExternal="{ row }">
        {{ row.isExternal ? $t('common.yes') : $t('common.no') }}
      </template>
      <template #isHidden="{ row }">
        {{ row.isHidden ? $t('common.yes') : $t('common.no') }}
      </template>
      <template #isCache="{ row }">
        {{ row.isCache ? $t('common.yes') : $t('common.no') }}
      </template>

      <template #action="{ row }">
        <div class="flex items-center gap-2">
          <span v-access:code="['system:menu:update']">
            <VbenButton variant="link" @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </VbenButton>
          </span>
          <span v-access:code="['system:menu:delete']">
            <VbenButton variant="link" class="text-destructive" @click="showDeleteDialog(row)">
              {{ $t('common.delete') }}
            </VbenButton>
          </span>
        </div>
      </template>
    </Grid>
    <FormDrawer @success="gridApi.query()" />

    <!-- Clear Cache Dialog -->
    <Dialog :open="centerDialogVisible" @update:open="(val) => centerDialogVisible = val">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>清空缓存</DialogTitle>
          <DialogDescription>
            是否确定清除菜单缓存？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <VbenButton variant="outline" @click="centerDialogVisible = false">
            {{ $t('common.cancel') }}
          </VbenButton>
          <VbenButton @click="clearCache">
            {{ $t('common.confirm') }}
          </VbenButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="deleteDialogVisible" @update:open="(val) => deleteDialogVisible = val">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>确认删除?</DialogTitle>
          <DialogDescription>
            此操作将永久删除该菜单项，是否继续？
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
<style lang="scss" scoped></style>
