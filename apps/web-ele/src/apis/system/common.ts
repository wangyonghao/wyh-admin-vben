import type { LabelValueState } from '#/types/global';

import { requestClient as http } from '#/apis/request';

/** 查询字典列表 */
export function listCommonDict(code: string) {
  return http.get<LabelValueState[]>(`/system/common/dict/${code}`);
}

/** 查询系统配置参数 */
export function listSiteOptionDict() {
  return http.get<LabelValueState[]>(`/system/common/dict/settings/site`);
}

/** 上传文件 */
export function uploadFile(data: FormData) {
  return http.post(`/system/common/file`, data);
}

/** 查询租户开启状态 */
export function getTenantStatus() {
  return http.get<boolean>(`/system/common/dict/settings/tenant`);
}
