import type { BaseEntity, PageQuery, PageRes } from '#/types/api';
import type { Gender, LabelValueState } from '#/types/global';

import { requestClient as http } from '#/apis/request';

export interface UserResp extends BaseEntity {
  /** ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 密码 */
  password: string;
  /** 性别（0：未知；1：男；2：女） */
  gender: Gender;
  /** 邮箱 */
  email: string;
  /** 手机号码 */
  phone: string;
  /** 头像 */
  avatar: string;
  /** 描述 */
  description: string;
  /** 状态（1：启用；2：禁用） */
  status: 1 | 2;
  /** 是否为系统内置数据 */
  isSystem: boolean;
  /** 最后一次修改密码时间 */
  pwdResetTime: string;
  /** 部门ID */
  deptId: string;
  /** 创建人 */
  createUser: string;
  /** 创建时间 */
  createTime: string;
  /** 修改人 */
  updateUser: string;
  /** 修改时间 */
  updateTime: string;
  /** 租户ID */
  tenantId: string;
  deptName: string;
  roleIds: Array<number | string>;
  roleNames: Array<string>;
  disabled: boolean;
}

export interface UserDetailResp extends UserResp {
  /** 最后一次修改密码时间 */
  pwdResetTime: string;
}

export interface UserQuery {
  description?: string;
  username: string | undefined;
  nickname: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  status: string | undefined;
  deptId: string | undefined;
  sort: Array<string> | string;
  userIds?: Array<string>;
  roleId?: string;
  createTime?: Array<string>;
}

export interface UserPageQuery extends PageQuery, UserQuery {}

/** 查询用户列表 */
export function listUser(query: UserPageQuery) {
  return http.get<PageRes<UserResp[]>>('/system/user', {
    params: query,
  });
}

/** 查询用户详情 */
export function getUser(id: string) {
  return http.get<UserDetailResp>(`/system/user/${id}`);
}

/** 新增用户 */
export function addUser(data: any) {
  return http.post('/system/user', data);
}

/** 修改用户 */
export function updateUser(data: any, id: string) {
  return http.put(`/system/user/${id}`, data);
}

/** 删除用户 */
export function deleteUser(id: string) {
  return http.delete('/system/user', { data: { ids: [id] } });
}

/** 导出用户 */
export function exportUser(query: UserQuery) {
  return http.download('/system/user/export', {
    params: query,
  });
}

/** 下载用户导入模板 */
export function downloadUserTemplate() {
  return http.download(`/system/user/import/template`);
}

/** 解析用户导入数据 */
export function parseImportUser(data: FormData) {
  return http.post('/system/user/import/parse', data);
}

/** 导入用户 */
export function importUser(data: any) {
  return http.post('/system/user/import', data);
}

/** 重置密码 */
export function resetUserPwd(data: any, id: string) {
  return http.patch(`/system/user/${id}/password`, data);
}

/** 分配角色 */
export function updateUserRole(
  data: { roleIds: Array<number | string> },
  id: string,
) {
  return http.patch(`/system/user/${id}/role`, data);
}

/** 查询用户字典 */
export function listUserDict(query?: { status: number }) {
  return http.get<LabelValueState[]>('/system/user/dict', {
    params: query,
  });
}
