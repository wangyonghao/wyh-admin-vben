<script setup lang="ts">
import type { MenuResp } from '#/api';
import type { ID } from '#/types/api';

import { nextTick, ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { cloneDeep, findGroupParentIds } from '@vben/utils';

import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  VbenButton,
} from '@vben-core/shadcn-ui';

import { uniq } from 'es-toolkit';

export interface Permission {
  checked: boolean;
  id: ID;
  label: string;
}

export interface MenuPermissionOption extends MenuResp {
  permissions: Permission[];
  expanded?: boolean;
  level?: number;
  label?: string;
}

defineOptions({
  name: 'MenuSelectTable',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    checkedKeys?: (number | string)[];
    defaultExpandAll?: boolean;
    menus: MenuResp[];
    onCheckChangeEvent?: (values: (number | string)[]) => void;
    onRefresh?: () => void;
    showToolbar?: boolean;
  }>(),
  {
    defaultExpandAll: true,
    checkedKeys: () => [],
    onCheckChangeEvent: () => { },
    onRefresh: undefined,
    showToolbar: true,
  },
);

/**
 * 是否节点关联
 */
const association = defineModel<boolean>('association', {
  default: true,
});

// 扁平化的菜单数据（用于渲染）
const flatMenus = ref<MenuPermissionOption[]>([]);
// 选中的菜单ID集合
const selectedIds = ref<Set<number | string>>(new Set());

/**
 * 将菜单树转换为带权限的结构
 */
function menusWithPermissions(menus: MenuResp[]): MenuPermissionOption[] {
  const result: MenuPermissionOption[] = [];

  menus.forEach((menu) => {
    const item: MenuPermissionOption = {
      ...menu,
      permissions: [],
      expanded: props.defaultExpandAll,
    };

    // 如果是菜单类型(type=2)且有子节点
    if (menu.type === 2 && menu.children && menu.children.length > 0) {
      // 检查是否有按钮类型的子节点
      const hasButton = menu.children.some((child) => child.type === 3);

      if (hasButton) {
        // 如果包含按钮，将所有子节点都作为权限
        item.permissions = menu.children.map((child) => ({
          id: child.id,
          label: child.title || child.name || '',
          checked: false,
        }));
        item.children = [];
      } else {
        // 否则递归处理子节点
        item.children = menusWithPermissions(menu.children) as any;
      }
    } else if (menu.children && menu.children.length > 0) {
      // 其他类型（目录等）递归处理子节点
      item.children = menusWithPermissions(menu.children) as any;
    }

    result.push(item);
  });

  return result;
}

/**
 * 将树形结构扁平化，用于渲染
 */
/**
 * 将树形结构扁平化，用于渲染
 */
function flattenMenus(
  menus: MenuPermissionOption[],
  level = 0,
  parentExpanded = true,
): MenuPermissionOption[] {
  const result: MenuPermissionOption[] = [];

  menus.forEach((menu) => {
    menu.level = level;
    result.push(menu);

    if (
      menu.children &&
      menu.children.length > 0 &&
      menu.expanded &&
      parentExpanded
    ) {
      result.push(
        ...flattenMenus(menu.children as MenuPermissionOption[], level + 1, true),
      );
    }
  });

  return result;
}

/**
 * 切换展开/折叠
 */
function toggleExpand(menu: MenuPermissionOption) {
  menu.expanded = !menu.expanded;
  updateFlatMenus();
}

/**
 * 更新扁平化菜单
 */
function updateFlatMenus() {
  flatMenus.value = flattenMenus(processedMenus.value);
}

/**
 * 处理后的菜单数据
 */
const processedMenus = ref<MenuPermissionOption[]>([]);

/**
 * 切换菜单选中状态
 */
function toggleMenuCheck(menu: MenuPermissionOption, checked: boolean) {
  if (checked) {
    selectedIds.value.add(menu.id);
  } else {
    selectedIds.value.delete(menu.id);
  }

  // 如果是节点关联模式
  if (association.value) {
    // 选中/取消选中所有子节点
    toggleChildrenCheck(menu, checked);
    // 选中/取消选中所有权限
    if (menu.permissions) {
      menu.permissions.forEach((perm) => {
        perm.checked = checked;
        if (checked) {
          selectedIds.value.add(perm.id);
        } else {
          selectedIds.value.delete(perm.id);
        }
      });
    }
  }

  updateCheckedNumber();
}

/**
 * 递归切换子节点选中状态
 */
function toggleChildrenCheck(menu: MenuPermissionOption, checked: boolean) {
  if (menu.children && menu.children.length > 0) {
    (menu.children as MenuPermissionOption[]).forEach((child) => {
      if (checked) {
        selectedIds.value.add(child.id);
      } else {
        selectedIds.value.delete(child.id);
      }

      // 递归处理子节点的权限
      if (child.permissions) {
        child.permissions.forEach((perm) => {
          perm.checked = checked;
          if (checked) {
            selectedIds.value.add(perm.id);
          } else {
            selectedIds.value.delete(perm.id);
          }
        });
      }

      toggleChildrenCheck(child, checked);
    });
  }
}

/**
 * 切换权限选中状态
 */
function togglePermissionCheck(
  menu: MenuPermissionOption,
  permission: Permission,
  checked: boolean,
) {
  permission.checked = checked;

  if (checked) {
    selectedIds.value.add(permission.id);
    // 如果是节点关联模式，选中权限时也选中菜单
    if (association.value) {
      selectedIds.value.add(menu.id);
    }
  } else {
    selectedIds.value.delete(permission.id);
    // 如果是节点关联模式，取消所有权限时也取消菜单
    if (association.value) {
      const hasCheckedPermission = menu.permissions?.some((p) => p.checked);
      if (!hasCheckedPermission) {
        selectedIds.value.delete(menu.id);
      }
    }
  }

  updateCheckedNumber();
}

/**
 * 检查菜单是否选中
 */
function isMenuChecked(menu: MenuPermissionOption): boolean {
  return selectedIds.value.has(menu.id);
}

/**
 * 选中的数量
 */
const checkedNum = ref(0);

/**
 * 更新选中数量
 */
function updateCheckedNumber() {
  checkedNum.value = selectedIds.value.size;
  if (props.onCheckChangeEvent) {
    props.onCheckChangeEvent(Array.from(selectedIds.value));
  }
}

/**
 * 全部展开/折叠
 */
function setExpandOrCollapse(expand: boolean) {
  function toggleAll(menus: MenuPermissionOption[]) {
    menus.forEach((menu) => {
      menu.expanded = expand;
      if (menu.children && menu.children.length > 0) {
        toggleAll(menu.children as MenuPermissionOption[]);
      }
    });
  }

  toggleAll(processedMenus.value);
  updateFlatMenus();
}

/**
 * 根据keys设置选中状态
 */
function setCheckedByKeys(keys: (number | string)[]) {
  selectedIds.value = new Set(keys);

  // 更新权限的选中状态
  function updatePermissions(menus: MenuPermissionOption[]) {
    menus.forEach((menu) => {
      if (menu.permissions) {
        menu.permissions.forEach((perm) => {
          perm.checked = keys.includes(perm.id);
        });
      }
      if (menu.children && menu.children.length > 0) {
        updatePermissions(menu.children as MenuPermissionOption[]);
      }
    });
  }

  updatePermissions(processedMenus.value);
  updateCheckedNumber();
}

/**
 * 获取选中的keys
 */
function getCheckedKeys(): (number | string)[] {
  if (association.value) {
    // 节点关联模式：需要包含所有父节点
    const keys = Array.from(selectedIds.value);
    const parentIds = findGroupParentIds(props.menus, keys as number[]);
    return uniq([...parentIds, ...keys]);
  }
  // 节点独立模式：直接返回选中的keys
  return Array.from(selectedIds.value);
}

/**
 * 设置加载状态
 */
const loading = ref(false);
function setLoading(value: boolean) {
  loading.value = value;
}

// 监听菜单数据变化
watch(
  () => props.menus,
  (menus) => {
    if (!menus || menus.length === 0) {
      return;
    }

    const clonedMenus = cloneDeep(menus);
    processedMenus.value = menusWithPermissions(clonedMenus);

    // 如果有选中的keys，应用选中状态
    if (props.checkedKeys && props.checkedKeys.length > 0) {
      setCheckedByKeys(props.checkedKeys);
    }

    updateFlatMenus();

    // 展开全部
    if (props.defaultExpandAll) {
      nextTick(() => {
        setExpandOrCollapse(true);
      });
    }
  },
  { immediate: true },
);

// 监听选中的keys变化
watch(
  () => props.checkedKeys,
  (keys) => {
    if (keys) {
      setCheckedByKeys(keys);
      // 强制更新视图，确保复选框状态正确渲染
      updateFlatMenus();
    }
  },
  { deep: true }
);

// 暴露方法
defineExpose({
  getCheckedKeys,
  setLoading,
  setExpandOrCollapse,
});
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">节点关联:</span>
          <Checkbox :checked="association" @update:checked="(val) => (association = val)" />
        </div>
        <div class="rounded-md bg-blue-50 px-3 py-1 text-sm dark:bg-blue-950">
          已选中
          <span class="mx-1 font-semibold text-primary">{{ checkedNum }}</span>
          个节点
        </div>
      </div>

      <div class="flex items-center gap-2">
        <VbenButton variant="outline" size="sm" @click="setExpandOrCollapse(false)">
          <IconifyIcon icon="lucide:chevrons-up" class="mr-1.5 h-4 w-4" />
          折叠全部
        </VbenButton>
        <VbenButton variant="outline" size="sm" @click="setExpandOrCollapse(true)">
          <IconifyIcon icon="lucide:chevrons-down" class="mr-1.5 h-4 w-4" />
          展开全部
        </VbenButton>
        <VbenButton v-if="props.onRefresh" variant="outline" size="sm" @click="props.onRefresh">
          <IconifyIcon icon="lucide:refresh-cw" class="mr-1.5 h-4 w-4" />
          刷新
        </VbenButton>
      </div>
    </div>

    <!-- 表格 -->
    <div class="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="px-3 py-2 w-[32px]"></TableHead>
            <TableHead class="px-3 py-2 h-6 w-[238px]">菜单</TableHead>
            <TableHead class="px-3 py-2 h-6">权限</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="menu in flatMenus" :key="menu.id" class="group">
            <TableCell class="px-3 py-2">
              <!-- 复选框 -->
              <Checkbox :checked="isMenuChecked(menu)" @update:checked="(val) => toggleMenuCheck(menu, val)" />
            </TableCell>
            <!-- 菜单名称列 -->
            <TableCell class="px-3 py-2">
              <div class="flex items-center gap-2" :style="{ paddingLeft: `${(menu.level || 0) * 1}em` }">
                <!-- 展开/折叠图标 -->
                <button v-if="menu.children && menu.children.length > 0"
                  class="flex h-5 w-5 items-center justify-center rounded hover:bg-accent" @click="toggleExpand(menu)">
                  <IconifyIcon :icon="menu.expanded
                    ? 'lucide:chevron-down'
                    : 'lucide:chevron-right'
                    " class="h-4 w-4" />
                </button>
                <div v-else class="w-5" />
                <!-- 图标 -->
                <IconifyIcon v-if="menu.icon && menu.icon !== '#'" :icon="menu.icon" class="h-4 w-4 flex-shrink-0" />
                <!-- 菜单名称 -->
                <span class="text-sm">{{ menu.title || menu.name }}</span>
              </div>
            </TableCell>

            <!-- 权限列 -->
            <TableCell class="px-3 py-2">
              <div v-if="menu.permissions && menu.permissions.length > 0" class="flex flex-wrap gap-x-4 gap-y-2">
                <label v-for="permission in menu.permissions" :key="permission.id"
                  class="flex cursor-pointer items-center gap-1.5 text-sm">
                  <Checkbox :checked="permission.checked" @update:checked="
                    (val) => togglePermissionCheck(menu, permission, val)
                  " />
                  <span>{{ permission.label }}</span>
                </label>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
