import type { TreeNodeData } from 'element-plus';

import { requestClient as http } from '#/apis/request';

/** 部门类型 */
export interface DeptResp {
  id: string;
  name: string;
  sort: number;
  status: 1 | 2;
  isSystem: boolean;
  description: string;
  createUserString: string;
  createTime: string;
  updateUserString: string;
  updateTime: string;
  parentId: string;
  children: DeptResp[];
}
export interface DeptQuery {
  description?: string;
  status?: number;
}

/** 查询部门列表 */
export function listDept(query: DeptQuery) {
  return http.get<DeptResp[]>(`/system/dept/tree`, { params: query });
}

/** 查询部门详情 */
export function getDept(id: string) {
  return http.get<DeptResp>(`/system/dept/${id}`);
}

/** 新增部门 */
export function addDept(data: any) {
  return http.post<boolean>(`/system/dept`, data);
}

/** 修改部门 */
export function updateDept(data: any, id: string) {
  return http.put(`/system/dept/${id}`, data);
}

/** 删除部门 */
export function deleteDept(id: string) {
  return http.delete(`/system/dept`, { data: { ids: [id] } });
}

/** 导出部门 */
export function exportDept(query: DeptQuery) {
  return http.download(`/system/dept/export`, { params: query });
}

/** 查询部门字典树 */
export function listDeptDictTree(query: { description: string | unknown }) {
  return http.get<TreeNodeData[]>(`/system/dept/dict/tree`, {
    params: query,
  });
}
