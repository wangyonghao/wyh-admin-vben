<script setup lang="ts">
import type { RoleResp } from '#/api/system/role';

import { onMounted, ref } from 'vue';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  ScrollArea,
  VbenButton,
} from '@vben-core/shadcn-ui';

import { ElMessage } from 'element-plus';

import { deleteRole, listRole } from '#/api/system/role';

import { emitter } from '../mitt';
import RoleEditModal from './RoleEditModal.vue';

// 角色列表
const roles = ref<RoleResp[]>([]);
// 当前选中的角色
const selectedRoleId = ref<string | number | null>(null);
// 搜索关键词
const searchKeyword = ref('');
// 加载状态
const loading = ref(false);

// 加载角色列表
const loadRoles = async () => {
  loading.value = true;
  try {
    const res = await listRole({
      page: 1,
      size: 1000,
      sort: 'createTime,desc',
      description: searchKeyword.value || undefined,
    });
    roles.value = res;
    
    // 如果有角色且没有选中任何角色，自动选中第一个
    if (res.length > 0 && !selectedRoleId.value && res[0]) {
      selectRole(res[0]);
    }
  } catch (error) {
    console.error('加载角色列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 选中角色
const selectRole = (role: RoleResp) => {
  selectedRoleId.value = role.id;
  emitter.emit('rowClick', role.id);
};

// 编辑角色
const [EditorWindow, editorApi] = useVbenModal({
  connectedComponent: RoleEditModal,
  destroyOnClose: true,
});

const handleEdit = (role: RoleResp) => {
  editorApi.setData({ id: role.id });
  editorApi.open();
};

const handleAdd = () => {
  editorApi.setData({});
  editorApi.open();
};

// 删除角色
const deleteDialogVisible = ref(false);
const deleteRow = ref<RoleResp | null>(null);

const showDeleteDialog = (role: RoleResp) => {
  deleteRow.value = role;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (!deleteRow.value) return;

  try {
    await deleteRole(deleteRow.value.id);
    ElMessage.success($t('pages.common.deleteSuccess'));
    
    // 如果删除的是当前选中的角色，清空选中状态
    if (selectedRoleId.value === deleteRow.value.id) {
      selectedRoleId.value = null;
    }
    
    await loadRoles();
    deleteDialogVisible.value = false;
    deleteRow.value = null;
    return true;
  } catch {
    return false;
  }
};

// 搜索
const handleSearch = () => {
  loadRoles();
};

// 初始化
onMounted(() => {
  loadRoles();
});
</script>

<template>
  <div class="h-full flex flex-col bg-background">
    <!-- 搜索和添加按钮 -->
    <div class="p-3 border-b">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <IconifyIcon
            icon="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <Input
            v-model="searchKeyword"
            :placeholder="$t('system.role.searchKey')"
            class="pl-9 h-9"
            @keyup.enter="handleSearch"
          />
        </div>
        <span v-access:code="['system:role:create']">
          <VbenButton size="sm" class="h-9" @click="handleAdd">
            <IconifyIcon icon="lucide:plus" class="w-4 h-4" />
          </VbenButton>
        </span>
      </div>
    </div>

    <!-- 角色列表 -->
    <ScrollArea class="flex-1">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <IconifyIcon icon="lucide:loader-2" class="w-6 h-6 animate-spin text-primary" />
      </div>
      
      <div v-else-if="roles.length === 0" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <IconifyIcon icon="lucide:inbox" class="w-12 h-12 mb-2 opacity-50" />
        <p class="text-sm">{{ $t('pages.common.noData') }}</p>
      </div>

      <div v-else class="p-2">
        <div
          v-for="role in roles"
          :key="role.id"
          :class="[
            'group relative flex items-center gap-3 rounded-md cursor-pointer transition-all',
            selectedRoleId === role.id
              ? 'bg-primary/10 text-current'
              : 'hover:bg-accent'
          ]"
          @click="selectRole(role)"
        >
          <div class="flex-1 min-w-0 pl-2">
            <div class="text-sm py-2 truncate">
              {{ role.name }}
              <span
                v-if="role.description" 
                class="text-xs text-muted-foreground truncate"
              >
                {{ role.description }}
              </span>
            </div>
          </div>
          
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <VbenButton
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7"
                  @click="(e: MouseEvent) => e.stopPropagation()"
                >
                  <IconifyIcon icon="lucide:more-vertical" class="w-3.5 h-3.5" />
                </VbenButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-40">
                <span v-access:code="['system:role:update']">
                  <DropdownMenuItem @click="handleEdit(role)">
                    <IconifyIcon icon="lucide:pencil" class="mr-2 w-4 h-4" />
                    {{ $t('pages.common.edit') }}
                  </DropdownMenuItem>
                </span>
                <DropdownMenuSeparator />
                <span v-access:code="['system:role:delete']">
                  <DropdownMenuItem 
                    class="text-destructive focus:text-destructive"
                    @click="showDeleteDialog(role)"
                  >
                    <IconifyIcon icon="lucide:trash-2" class="mr-2 w-4 h-4" />
                    {{ $t('pages.common.delete') }}
                  </DropdownMenuItem>
                </span>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </ScrollArea>

    <EditorWindow @success="loadRoles()" />

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
  </div>
</template>

<style lang="scss" scoped>
:deep(.scroll-area) {
  height: 100%;
}
</style>
