import type * as T from './type';

import { requestClient as http } from '#/api/request';

export type * from './type';

/** 账号登录 */
export function accountLogin(req: T.AccountLoginReq) {
  return http.post<T.LoginResp>('/auth/login', req);
}

/** 手机号登录 */
export function phoneLogin(req: T.PhoneLoginReq) {
  return http.post<T.LoginResp>('/auth/login', req);
}

/** 邮箱登录 */
export function emailLogin(req: T.EmailLoginReq) {
  return http.post<T.LoginResp>('/auth/login', req);
}

/** 三方账号登录 */
export function socialLogin(req: any) {
  return http.post<T.LoginResp>('/auth/login', req);
}

/** 三方账号登录授权 */
export function socialAuth(source: string) {
  return http.get<T.SocialAuthAuthorizeResp>(`/auth/${source}`);
}

/** 退出登录 */
 */
export function logout() {
  return http.post('/auth/logout');
}

/** 获取用户信息 */
export const getUserInfo = () => {
  return http.get<T.UserInfo>('/auth/user');
};

/** 获取路由信息 */
export const getUserRoute = () => {
  return http.get<T.RouteItem[]>('/auth/user/route');
};

/** 强制修改密码（密码过期时使用） */
export function forceChangePassword(req: T.ForceChangePasswordReq) {
  return http.post<T.ForceChangePasswordResp>('/auth/force-change-password', req);
}
