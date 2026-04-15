import { requestClient as http } from '#/apis/request';

/** 菜单类型 */
export interface MenuResp {
  id: string;
  title: string;
  parentId: string;
  type: 1 | 2 | 3;
  path: string;
  name: string;
  component: string;
  redirect: string;
  icon: string;
  isExternal: boolean;
  isCache: boolean;
  isHidden: boolean;
  permission: string;
  sort: number;
  status: 1 | 2;
  createUserString: string;
  createTime: string;
  updateUserString: string;
  updateTime: string;
  children: MenuResp[];
}
export interface MenuQuery {
  title?: string;
  status?: number;
}

/** 查询菜单列表 */
export function listMenu(query?: MenuQuery) {
  return http.get<MenuResp[]>(`/system/menu/tree`, { params: query });
}

/** 查询菜单列表 */
export function listDictMenu(query?: MenuQuery) {
  return http.get<MenuResp[]>(`/system/menu/dict/tree`, { params: query });
}

/** 查询菜单详情 */
export function getMenu(id: string) {
  return http.get<MenuResp>(`/system/menu/${id}`);
}

/** 新增菜单 */
export function addMenu(data: any) {
  return http.post<boolean>(`/system/menu`, data);
}

/** 修改菜单 */
export function updateMenu(data: any, id: string) {
  return http.put(`/system/menu/${id}`, data);
}

/** 删除菜单 */
export function deleteMenu(id: string) {
  return http.delete(`/system/menu`, { data: { ids: [id] } });
}

/** 清除菜单缓存 */
export function clearMenuCache() {
  return http.delete(`/system/menu/cache`);
}
