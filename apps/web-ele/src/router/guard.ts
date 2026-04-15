import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { useAuthStore } from '#/store';

import type { RouteItem } from '#/apis';

import { IFrameView } from '@vben/layouts';
import type { ComponentRecordType } from '@vben/types';

// 动态导入所有页面组件
const pageMap: ComponentRecordType = import.meta.glob('/src/views/**/*.vue');


// 已添加的动态路由
const addedRouteNames = new Set<string>();

/**
 * 根据用户菜单动态添加新路由
 */
export function generateRoutes(router:Router, menus: RouteItem[]) {
  const addRoutes = (menuList: RouteItem[]) => {

    for (const menu of menuList) {
      if (menu.type === 2 && menu.path) {
        const routeName = 'dynamic-' + menu.id

        // 检查是否已经有同路径的静态路由
        const menuPath = menu.path.startsWith('/') ? menu.path.slice(1) : menu.path
        
        // const existingRoutes = router.getRoutes()
        // const pathExists = existingRoutes.some(r => r.path === '/' + menuPath || r.path === menuPath)
        const pathExists = router.hasRoute(routeName);
        if (pathExists) {
          console.log(`[动态路由] 跳过(已存在): ${menuPath}` + ", " + router.getRoutes().length )
          continue
        }
        if (addedRouteNames.has(routeName)) {
          console.log(`[动态路由] 跳过(已添加): ${menuPath}`)
          continue
        }

        // 判断菜单是否是外链
        if(/^https?:\/\//.test(menu.path)){
          router.addRoute('Root',{
            path: menuPath,
            name: routeName,
            component: IFrameView,
            meta: {
              icon: menu.icon?.includes(':') ? menu.icon : `svg:${menu.icon}`,
              keepAlive: !menu.isCache,
              title: menu.name,
              link: menu.path,
            }
          })
          addedRouteNames.add(routeName)
          console.log(`[动态路由] ✓ 添加外链成功: ${menuPath} -> ${menu.component}`)
        }else if(menu.component){
            // 普通菜单，加载组件
          const componentName = menu.component.startsWith('/') ? menu.component.slice(1) : menu.component
          const componentPath = `/src/views/${componentName}.vue`

          const component = pageMap[componentPath] ? pageMap[componentPath] : () => import('#/views/_core/fallback/not-found.vue');

          router.addRoute('Root', {
              path: menuPath,
              name: routeName,
              component: component,
              meta: {
                title: menu.name,
                icon: menu.icon,
                permission: menu.permission
              }
            })
            addedRouteNames.add(routeName)
            console.log(`[动态路由] ✓ 添加成功: ${menuPath}`)
        }
      }

      if (menu.children && menu.children.length > 0) {
        addRoutes(menu.children)
      }
    }
  };
  console.log('[动态路由] 开始处理菜单:', menus)
  
  addRoutes(menus)
  console.log('[动态路由] 当前所有路由:', router.getRoutes().map(r => r.path))
}

export function resetRouter(router:Router) {
  console.log('[动态路由] 删除路由 before:', router.getRoutes().length)
  addedRouteNames.forEach(name => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
      console.log('[动态路由] 删除路由:', name)
    }
  })
  addedRouteNames.clear()
  console.log('[动态路由] 删除路由 after:', router.getRoutes().length)
};

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 这些路由不需要进入权限拦截
    if (to.meta.requiresAuth === false) {
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken && to.fullPath !== LOGIN_PATH) {
      return { path: LOGIN_PATH, query: { redirect: encodeURIComponent(to.fullPath) }, replace: true };
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 生成路由表
    // 当前登录用户拥有的角色标识列表
    let userInfo;
    try{
      userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
      generateRoutes(router, userInfo.menus);
    }catch(Error){
      alert("用户菜单加载失败！！！");
      return { path: LOGIN_PATH, query: { redirect: encodeURIComponent(to.fullPath) }, replace: true };
    }
    accessStore.setIsAccessChecked(true);
    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? userInfo.homePath || preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };
