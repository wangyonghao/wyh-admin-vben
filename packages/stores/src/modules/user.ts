import { ref } from 'vue';

import { acceptHMRUpdate, defineStore } from 'pinia';

interface UserProfile {
  [key: string]: any;
  /**
   * 用户id
   */
  userId: string;
  /**
   * 用户名
   */
  username: string;
  /**
   * 头像
   */
  avatar: string;
  /**
   * 用户昵称
   */
  nickname: string;
  /**
   * 用户角色
   */
  roles?: string[];
}

/**
 * @zh_CN 用户信息相关
 */
export const useUserStore = defineStore('core-user', () => {
  // 用户信息
  const userInfo = ref<UserProfile | null>(null);
  // 用户token
  const accessToken = ref<string>('');

  function setAccessToken(token: string) {
    accessToken.value = token;
  }

  function setUserInfo(info: UserProfile | null) {
    userInfo.value = info;
  }

  return {
    userInfo,
    accessToken,
    setUserInfo,
    setAccessToken,
  };
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useUserStore, hot));
}
