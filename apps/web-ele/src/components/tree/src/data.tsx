import type { VxeGridProps } from '#/adapter/vxe-table';
import type { MenuResp } from '#/api';
import type { ID } from '#/types/api';

import { h, markRaw } from 'vue';

import { VbenIcon } from '@vben/common-ui';
import {
  SvgFolderIcon as OkButtonIcon,
  SvgFolderIcon,
  SvgMenuIcon,
} from '@vben/icons';

export interface Permission {
  checked: boolean;
  id: ID;
  label: string;
}

export interface MenuPermissionOption extends MenuResp {
  permissions: Permission[];
}

const menuTypes = {
  2: { icon: markRaw(SvgMenuIcon), value: '菜单' },
  3: { icon: markRaw(OkButtonIcon), value: '按钮' },
  1: { icon: markRaw(SvgFolderIcon), value: '目录' },
};

export const nodeOptions = [
  { label: '节点关联', value: true },
  { label: '节点独立', value: false },
];

export const columns: VxeGridProps['columns'] = [
  {
    type: 'checkbox',
    title: '菜单名称',
    field: 'label',
    treeNode: true,
    headerAlign: 'left',
    align: 'left',
    width: 230,
    slots: {
      default: ({ row }) => {
        return (
          <div class="flex items-center gap-2">
            {row?.icon && row.icon !== '#' && (
              <VbenIcon icon={row.icon} class="w-4 h-4 flex-shrink-0" />
            )}
            <span>{row.label}</span>
          </div>
        );
      },
    },
  },
  {
    title: '权限标识',
    field: 'permissions',
    headerAlign: 'left',
    align: 'left',
    slots: {
      default: 'permissions',
    },
  },
];
