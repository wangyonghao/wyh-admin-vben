import type { RouteRecordRaw } from 'vue-router';

import type { MenuRecordRaw } from '@vben-core/typings';

import { ref } from 'vue';

import { acceptHMRUpdate, defineStore } from 'pinia';

type AccessToken = null | string;

/**
 * @zh_CN 访问权限相关
 */
export const useAccessStore = defineStore(
  'core-access',
  () => {
    /** 权限码 */
    const accessCodes = ref<string[]>([]);
    /** 可访问的菜单列表 */
    const accessMenus = ref<MenuRecordRaw[]>([]);
    /** 可访问的路由列表 */
    const accessRoutes = ref<RouteRecordRaw[]>([]);
    /** 登录 accessToken */
    const accessToken = ref<AccessToken>(null);
    /** 是否已经检查过权限 */
    const isAccessChecked = ref(false);
    /** 是否锁屏状态 */
    const isLockScreen = ref(false);
    /** 锁屏密码 */
    const lockScreenPassword = ref<string | undefined>(undefined);
    /** 登录是否过期 */
    const loginExpired = ref(false);
    /** 刷新 refreshToken */
    const refreshToken = ref<AccessToken>(null);

    function getMenuByPath(path: string): MenuRecordRaw | undefined {
      function findMenu(
        menus: MenuRecordRaw[],
        path: string,
      ): MenuRecordRaw | undefined {
        for (const menu of menus) {
          if (menu.path === path) {
            return menu;
          }
          if (menu.children) {
            const matched = findMenu(menu.children, path);
            if (matched) {
              return matched;
            }
          }
        }
      }
      return findMenu(accessMenus.value, path);
    }

    function lockScreen(password: string) {
      isLockScreen.value = true;
      lockScreenPassword.value = password;
    }

    function setAccessCodes(codes: string[]) {
      accessCodes.value = codes;
    }

    function setAccessMenus(menus: MenuRecordRaw[]) {
      accessMenus.value = menus;
    }

    function setAccessRoutes(routes: RouteRecordRaw[]) {
      accessRoutes.value = routes;
    }

    function setAccessToken(token: AccessToken) {
      accessToken.value = token;
    }

    function setIsAccessChecked(value: boolean) {
      isAccessChecked.value = value;
    }

    function setLoginExpired(value: boolean) {
      loginExpired.value = value;
    }

    function setRefreshToken(token: AccessToken) {
      refreshToken.value = token;
    }

    function unlockScreen() {
      isLockScreen.value = false;
      lockScreenPassword.value = undefined;
    }

    return {
      accessCodes,
      accessMenus,
      accessRoutes,
      accessToken,
      isAccessChecked,
      isLockScreen,
      lockScreenPassword,
      loginExpired,
      refreshToken,
      getMenuByPath,
      lockScreen,
      setAccessCodes,
      setAccessMenus,
      setAccessRoutes,
      setAccessToken,
      setIsAccessChecked,
      setLoginExpired,
      setRefreshToken,
      unlockScreen,
    };
  },
  {
    persist: {
      // 持久化
      pick: [
        'accessToken',
        'refreshToken',
        'accessCodes',
        'isLockScreen',
        'lockScreenPassword',
      ],
    },
  },
);

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useAccessStore, hot));
}
