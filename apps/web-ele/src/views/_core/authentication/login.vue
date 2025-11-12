<script lang="ts" setup>
import type { ImageCaptchaResp } from '#/api';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  Input,
  VbenButton,
  VbenCheckbox,
  VbenInputPassword,
  VbenInputCaptcha
} from '@vben-core/shadcn-ui';
import { z, loginFormSchema } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getImageCaptcha } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const router = useRouter();

// Captcha info
const captchaInfo = ref<ImageCaptchaResp>({
  uuid: '',
  img: '',
  expireTime: 0,
  isEnabled: false,
});

// Form data
const username = ref('');
const password = ref('');
const captcha = ref('');
const rememberMe = ref(false);

// Remember me functionality
const REMEMBER_ME_KEY = `REMEMBER_ME_USERNAME_${location.hostname}`;
const localUsername = localStorage.getItem(REMEMBER_ME_KEY) || '';

// Initialize form
username.value = localUsername || 'admin';
password.value = 'admin123';
rememberMe.value = !!localUsername;

// Validation schema using zod
const loginSchema = z.object({
  username: z.string().min(1, $t('authentication.usernameTip')),
  password: z.string().min(1, $t('authentication.passwordTip')),
  captcha: z.string().optional(),
});

// Validation state
const validationErrors = ref<Record<string, string>>({});

// Validate form
const validateField = (field: string, value: string) => {
  try {
    if (field === 'username') {
      loginSchema.shape.username.parse(value);
    } else if (field === 'password') {
      loginSchema.shape.password.parse(value);
    } else if (field === 'captcha' && captchaInfo.value.isEnabled) {
      z.string().min(1, $t('authentication.verifyRequiredTip')).parse(value);
    }
    validationErrors.value[field] = '';
  } catch (error) {
    if (error instanceof z.ZodError) {
      validationErrors.value[field] = error.errors[0]?.message || '';
    }
  }
};

// Validate entire form
const validateForm = () => {
  const formData = {
    username: username.value,
    password: password.value,
    captcha: captcha.value,
  };

  try {
    // Validate basic fields
    loginSchema.parse(formData);

    // Validate captcha if enabled
    if (captchaInfo.value.isEnabled) {
      z.string().min(1, $t('authentication.verifyRequiredTip')).parse(captcha.value);
    }

    validationErrors.value = {};
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      validationErrors.value = errors;
    }
    return false;
  }
};

// Get captcha
const getCaptcha = async () => {
  try {
    const res = await getImageCaptcha();
    const { uuid, img, expireTime, isEnabled } = res;
    captchaInfo.value = { uuid, img, expireTime, isEnabled };
    captcha.value = '';
  } catch (error) {
    console.error('Failed to get captcha:', error);
  }
};

// Submit handler
const handleSubmit = async (event?: Event) => {
  event?.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    const loginData = {
      username: username.value,
      password: password.value,
      captcha: captcha.value,
      uuid: captchaInfo.value.uuid,
    };

    // Handle remember me
    localStorage.setItem(
      REMEMBER_ME_KEY,
      rememberMe.value ? username.value : '',
    );

    // Call auth login
    await authStore.authLogin(loginData);
  } catch (error) {
    console.error('Login failed:', error);
    // Reset captcha on failure
    if (captchaInfo.value.isEnabled) {
      getCaptcha();
    }
  }
};

// Navigation
const handleGo = (path: string) => {
  router.push(path);
};

// Computed properties for validation
const usernameError = computed(() => validationErrors.value.username);
const passwordError = computed(() => validationErrors.value.password);
const captchaError = computed(() => validationErrors.value.captcha);

onMounted(() => {
  getCaptcha();
});
</script>

<template>
  <div @keydown.enter.prevent="onSubmit">
    <!-- Title Section -->
    <div class="mb-7 sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-foreground mb-3 text-3xl font-bold leading-9 tracking-tight lg:text-4xl">
        {{ $t('authentication.welcomeBack') }} 👋🏻
      </h2>
      <p class="text-muted-foreground lg:text-md text-sm">
        {{ $t('authentication.loginSubtitle') }}
      </p>
    </div>

    <!-- Form Section -->
    <form @submit="handleSubmit">
      <!-- Username Field -->
      <div class="mb-4">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {{ $t('authentication.username') }}
        </label>
        <Input v-model="username" :placeholder="$t('authentication.usernameTip')"
          :class="{ 'border-red-500': usernameError }" class="mt-2" @blur="validateField('username', username)" />
        <div v-if="usernameError" class="text-sm text-red-500 mt-1">
          {{ usernameError }}
        </div>
      </div>

      <!-- Password Field -->
      <div class="mb-4">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {{ $t('authentication.password') }}
        </label>
        <VbenInputPassword v-model="password" :placeholder="$t('authentication.password')"
          :class="{ 'border-red-500': passwordError }" class="mt-2" @blur="validateField('password', password)" />
        <div v-if="passwordError" class="text-sm text-red-500 mt-1">
          {{ passwordError }}
        </div>
      </div>

      <!-- Captcha Field (conditional) -->
      <div v-if="captchaInfo.isEnabled" class="mb-4">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {{ $t('authentication.code') }}
        </label>
        <VbenInputCaptcha v-model="captcha" :captcha="captchaInfo.img" :expire-time="captchaInfo.expireTime"
          :placeholder="$t('authentication.code')"
          :class="{ 'border-red-500': captchaError, 'focus:border-primary': !captchaError }" class="mt-2"
          @captcha-click="getCaptcha" @blur="validateField('captcha', captcha)" />
        <div v-if="captchaError" class="text-sm text-red-500 mt-1">
          {{ captchaError }}
        </div>
      </div>
    </form>

    <!-- Remember Me and Forget Password -->
    <div class="mb-6 flex justify-between">
      <div class="flex-center">
        <VbenCheckbox v-model:checked="rememberMe" name="rememberMe">
          {{ $t('authentication.rememberMe') }}
        </VbenCheckbox>
      </div>

      <span class="vben-link text-sm font-normal" @click="handleGo('/auth/forget-password')">
        {{ $t('authentication.forgetPassword') }}
      </span>
    </div>

    <!-- Submit Button -->
    <VbenButton :class="{
      'cursor-wait': authStore.loginLoading,
    }" :loading="authStore.loginLoading" aria-label="login" class="w-full" @click="handleSubmit">
      {{ $t('common.login') }}
    </VbenButton>

    <!-- Alternative Login Methods -->
    <div class="mb-2 mt-4 flex items-center justify-between">
      <VbenButton class="w-1/2" variant="outline" @click="handleGo('/auth/code-login')">
        {{ $t('authentication.mobileLogin') }}
      </VbenButton>
      <VbenButton class="ml-4 w-1/2" variant="outline" @click="handleGo('/auth/qrcode-login')">
        {{ $t('authentication.qrcodeLogin') }}
      </VbenButton>
    </div>

    <!-- Register Link -->
    <div class="mt-3 text-center text-sm">
      {{ $t('authentication.accountTip') }}
      <span class="vben-link text-sm font-normal" @click="handleGo('/auth/register')">
        {{ $t('authentication.createAccount') }}
      </span>
    </div>
  </div>
</template>
