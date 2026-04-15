import type { BaseEntity, PageQuery, PageRes } from '#/types/api';
import type { LabelValueState } from '#/types/global';

import { requestClient as http } from '#/apis/request';

export interface RoleUserResp {
  id: string;
  username: string;
  nickname: string;
  gender: number;
  description: string;
  status: 1 | 2;
  isSystem?: boolean;
  deptId: string;
  deptName: string;
  roleIds: Array<number>;
  roleNames: Array<string>;
  disabled: boolean;
}

export interface RoleResp extends BaseEntity {
  /** ID */
  id: string;
  /** 名称 */
  name: string;
  /** 编码 */
  code: string;
  /** 数据权限（1：全部数据权限；2：本部门及以下数据权限；3：本部门数据权限；4：仅本人数据权限；5：自定义数据权限） */
  dataScope: string;
  /** 描述 */
  description: string;
  /** 排序 */
  sort: string;
  /** 是否为系统内置数据 */
  isSystem: string;
  /** 菜单选择是否父子节点关联 */
  menuCheckStrictly: string;
  /** 部门选择是否父子节点关联 */
  deptCheckStrictly: string;
}

export interface RoleDetailResp extends BaseEntity {
  id: string;
  name: string;
  code: string;
  dataScope: string;
  description: string;
  sort: string;
  isSystem: string;
  menuCheckStrictly: boolean;
  deptCheckStrictly: boolean;
  menuIds: Array<number>;
  deptIds: Array<number>;
}

export interface RoleQuery {
  description: string | undefined;
  sort: Array<string> | string;
}

export interface RolePermissionResp {
  id: string;
  title: string;
  parentId: string;
  permission?: string;
  children?: RolePermissionResp[];
  permissions?: RolePermissionResp[];
  isChecked?: boolean;
}

export interface RolePageQuery extends PageQuery, RoleQuery {}

export interface RoleUserQuery {
  description?: string;
  sort: Array<string>;
}

export interface RoleUserPageQuery extends PageQuery, RoleUserQuery {}

/** 查询角色列表 */
export function listRole(query: RolePageQuery) {
  return http.get<RoleResp[]>(`/system/role/list`, {
    params: query,
  });
}

/** 查询角色详情 */
export function getRole(id: string) {
  return http.get<RoleDetailResp>(`/system/role/${id}`);
}

/** 新增角色 */
export function addRole(data: any) {
  return http.post('/system/role', data);
}

/** 修改角色 */
export function updateRole(data: any, id: string) {
  return http.put(`/system/role/${id}`, data);
}

/** 删除角色 */
export function deleteRole(id: string) {
  return http.delete('/system/role', { data: { ids: [id] } });
}

/** 查询角色权限树 */
export function listRolePermissionTree() {
  return http.get<RolePermissionResp[]>(`/system/role/permission/tree`);
}

/** 修改角色权限 */
export function updateRolePermission(id: string, data: any) {
  return http.put(`/system/role/${id}/permission`, { ...data });
}

/** 查询角色关联用户 */
export function listRoleUser(id: string, query: RoleUserPageQuery) {
  return http.get<PageRes<RoleUserResp[]>>(`/system/role/${id}/user`, {
    params: query,
  });
}

/** 分配角色给用户 */
export function assignToUsers(id: string, userIds: Array<string>) {
  return http.post(`/system/role/${id}/user`, userIds);
}

/** 取消分配角色给用户 */
export function unassignFromUsers(userRoleIds: Array<number | string>) {
  return http.delete(`/system/role/user`, {
    data: userRoleIds,
  });
}

/** 查询角色关联用户 ID */
export function listRoleUserId(id: string) {
  return http.get(`/system/role/${id}/user/id`);
}

/** 查询角色字典 */
export function listRoleDict(query?: { name: string; status: number }) {
  return http.get<LabelValueState[]>(`/system/role/dict`, {
    params: query,
  });
}
