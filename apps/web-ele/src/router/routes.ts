import type { RouteRecordRaw } from 'vue-router';

import {
  VBEN_ANT_PREVIEW_URL,
  VBEN_DOC_URL,
  VBEN_GITHUB_URL,
  VBEN_LOGO_URL,
  VBEN_NAIVE_PREVIEW_URL,
} from '@vben/constants';
import { SvgAntdvLogoIcon } from '@vben/icons';

import { traverseTreeValues } from '@vben/utils';

import { preferences } from '@vben/preferences';
import { $t } from '#/locales';
import { IFrameView } from '#/layouts';

/** 全局404页面 */
const fallbackNotFoundRoute: RouteRecordRaw = {
  name: 'FallbackNotFound',
  path: '/:path(.*)*',
  component: () => import('#/views/_core/fallback/not-found.vue'),
  meta: { hideInBreadcrumb: true, hideInMenu: true, hideInTab: true, title: '404' },
};

/** 基本路由，这些路由是必须存在的 */
const routes: RouteRecordRaw[] = [
  /**
   * 根路由
   * 使用基础布局，作为所有页面的父级容器，子级就不必配置BasicLayout。
   * 此路由必须存在，且不应修改
   */
  {
    name: 'Root',
    path: '/',
    component: () => import('#/layouts/basic.vue'),
    meta: { hideInBreadcrumb: true, title: 'Root' },
    redirect: preferences.app.defaultHomePath,
    children: [
      // dashboard
      {
        name: 'Dashboard',
        path: '/dashboard',
        meta: {
          icon: 'lucide:layout-dashboard',
          order: -1,
          title: $t('page.dashboard.title'),
        },
        children: [
          {
            name: 'Analytics',
            path: '/analytics',
            component: () => import('#/views/dashboard/analytics/index.vue'),
            meta: {
              affixTab: true,
              icon: 'lucide:area-chart',
              title: $t('page.dashboard.analytics'),
            },
          },
          {
            name: 'Workspace',
            path: '/workspace',
            component: () => import('#/views/dashboard/workspace/index.vue'),
            meta: {
              icon: 'carbon:workspace',
              title: $t('page.dashboard.workspace'),
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Authentication',
    path: '/auth',
    component: () => import('#/layouts/auth.vue'),
    meta: { hideInTab: true, requiresAuth: false, title: 'Authentication'},
    redirect: "/auth/login",
    children: [
      {
        name: 'Login',
        path: 'login',
        component: () => import('#/views/_core/authentication/login.vue'),
        meta: {
          requiresAuth: false, title: $t('page.auth.login'),
        },
      },
      {
        name: 'CodeLogin',
        path: 'code-login',
        component: () => import('#/views/_core/authentication/code-login.vue'),
        meta: {
          requiresAuth: false, title: $t('page.auth.codeLogin'),
        },
      },
      {
        name: 'QrCodeLogin',
        path: 'qrcode-login',
        component: () => import('#/views/_core/authentication/qrcode-login.vue'),
        meta: {
          requiresAuth: false,
          title: $t('page.auth.qrcodeLogin'),
        },
      },
      {
        name: 'ForgetPassword',
        path: 'forget-password',
        component: () => import('#/views/_core/authentication/forget-password.vue'),
        meta: { requiresAuth: false, title: $t('page.auth.forgetPassword'),
        },
      },
      {
        name: 'Register',
        path: 'register',
        component: () => import('#/views/_core/authentication/register.vue'),
        meta: { requiresAuth: false, title: $t('page.auth.register') },
      },
    ],
  },
  // User Center
  {
    path: '/user',
    name: 'User',
    meta: { hideInBreadcrumb: true, hideInMenu: true, hideInTab: true },
    children: [
      {
        path: '/user/profile',
        name: 'UserProfile',
        component: () => import('#/views/user/profile/index.vue'),
        meta: { title: '个人中心', showInTabs: false },
      },
      {
        path: '/user/message',
        name: 'UserMessage',
        component: () => import('#/views/user/message/index.vue'),
        meta: { title: '消息中心', showInTabs: false },
      },
      {
        path: '/user/notice',
        name: 'UserNotice',
        component: () =>
          import('#/views/user/message/components/view/index.vue'),
        meta: { title: '查看公告' },
      },
    ],
  },
  // vben
  {
    name: 'VbenProject',
    path: '/vben-admin',
    meta: {
      badgeType: 'dot',
      icon: VBEN_LOGO_URL,
      order: 9998,
      title: $t('demos.vben.title'),
    },

    children: [
      {
        name: 'VbenDocument',
        path: '/vben-admin/document',
        component: IFrameView,
        meta: {
          icon: 'lucide:book-open-text',
          link: VBEN_DOC_URL,
          title: $t('demos.vben.document'),
        },
      },
      {
        name: 'VbenGithub',
        path: '/vben-admin/github',
        component: IFrameView,
        meta: {
          icon: 'mdi:github',
          link: VBEN_GITHUB_URL,
          title: 'Github',
        },
      },
      {
        name: 'VbenNaive',
        path: '/vben-admin/naive',
        component: IFrameView,
        meta: {
          badgeType: 'dot',
          icon: 'logos:naiveui',
          link: VBEN_NAIVE_PREVIEW_URL,
          title: $t('demos.vben.naive-ui'),
        },
      },
      {
        name: 'VbenAntd',
        path: '/vben-admin/antd',
        component: IFrameView,
        meta: {
          badgeType: 'dot',
          icon: SvgAntdvLogoIcon,
          link: VBEN_ANT_PREVIEW_URL,
          title: $t('demos.vben.antdv'),
        },
      },
    ],
  },
  {
    name: 'VbenAbout',
    path: '/vben-admin/about',
    component: () => import('#/views/_core/about/index.vue'),
    meta: {
      icon: 'lucide:copyright',
      title: $t('demos.vben.about'),
      order: 9999,
    },
  },
  // demos
  {
    name: 'Demos',
    path: '/demos',
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    children: [
      {
        meta: {
          title: $t('demos.elementPlus'),
        },
        name: 'NaiveDemos',
        path: '/demos/element',
        component: () => import('#/views/demos/element/index.vue'),
      },
      {
        meta: {
          title: $t('demos.form'),
        },
        name: 'BasicForm',
        path: '/demos/form',
        component: () => import('#/views/demos/form/basic.vue'),
      },
    ],
  },
  {
    name: 'FallbackNotFound',
    path: '/:path(.*)*',
    component: () => import('#/views/_core/fallback/not-found.vue'),
    meta: { hideInBreadcrumb: true, hideInMenu: true, hideInTab: true, title: '404' },
  }
];

/** 基本路由列表，这些路由不需要进入权限拦截 */
const coreRouteNames = traverseTreeValues(routes, (route) => route.name);

export { fallbackNotFoundRoute, coreRouteNames, routes };
