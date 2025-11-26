# 依赖分析报告

## 当前 login.vue 组件依赖项分析

### 当前实现位置
- 主要实现：`playground/src/views/_core/authentication/login.vue`
- 其他实现：`apps/web-antd/`, `apps/web-ele/`, `apps/web-naive/` 中也有类似实现

### 当前依赖项

#### 1. 类型导入
```typescript
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption, Recordable } from '@vben/types';
```

#### 2. Vue 核心依赖
```typescript
import { computed, markRaw, useTemplateRef } from 'vue';
```

#### 3. 组件依赖
```typescript
import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
```

#### 4. 国际化
```typescript
import { $t } from '@vben/locales';
```

#### 5. 状态管理
```typescript
import { useAuthStore } from '#/store';
```

### 当前表单结构
- 使用 `VbenFormSchema` 配置表单字段
- 通过 `AuthenticationLogin` 包装组件渲染
- 使用 `SliderCaptcha` 作为验证码组件
- 表单验证使用 `zod` schema

## shadcn-ui 组件可用性验证

### ✅ 可用的表单组件
```typescript
// 从 @vben-core/shadcn-ui 可导入
import {
  Form,                    // vee-validate 的 Form
  FormField,              // vee-validate 的 Field (别名)
  FormControl,            // 表单控件包装器
  FormItem,               // 表单项容器
  FormLabel,              // 表单标签
  FormMessage,            // 错误消息显示
} from '@vben-core/shadcn-ui';
```

### ✅ 可用的输入组件
```typescript
// 基础输入组件
import { Input } from '@vben-core/shadcn-ui';

// 专用输入组件
import { 
  VbenInputPassword,      // 密码输入框
  VbenInputCaptcha        // 验证码输入框
} from '@vben-core/shadcn-ui';
```

### ✅ 可用的交互组件
```typescript
import { 
  VbenButton,             // 按钮组件
  VbenCheckbox            // 复选框组件
} from '@vben-core/shadcn-ui';
```

## vee-validate 和 zod 集成验证

### ✅ 依赖可用性
- `vee-validate`: 在 `@vben-core/form-ui` 包中可用
- `zod`: 在 `@vben-core/form-ui` 包中可用
- `@vee-validate/zod`: 在 `@vben-core/form-ui` 包中可用

### ✅ 集成配置
```typescript
// 可以直接从 shadcn-ui 导入 vee-validate 组件
import { Form, Field as FormField } from '@vben-core/shadcn-ui';

// 可以使用 useForm hook
import { useForm } from 'vee-validate';
import { z } from 'zod';
```

## 验证码功能分析

### VbenInputCaptcha 组件接口
```typescript
interface Props {
  captcha?: string;        // 验证码图片 base64
  expireTime?: number;     // 过期时间戳
  label?: string;          // 标签文本
  loading?: boolean;       // 加载状态
  placeholder?: string;    // 占位符文本
}

// 事件
emit('captchaClick');      // 点击验证码图片时触发
```

### 验证码数据结构
```typescript
interface ImageCaptchaResp {
  uuid: string;            // 验证码唯一标识
  img: string;             // 验证码图片 base64
  expireTime: number;      // 过期时间戳
  isEnabled: boolean;      // 是否启用验证码
}
```

## 认证存储接口分析

### authStore.authLogin 方法
```typescript
async function authLogin(
  params: Recordable<any>,           // 登录参数对象
  onSuccess?: () => Promise<void> | void  // 成功回调
)
```

### 登录参数结构
```typescript
// 当前传递的参数包括：
{
  username: string;        // 用户名
  password: string;        // 密码
  captcha?: boolean;       // 滑块验证码结果 (当前实现)
  // 或者对于图片验证码：
  captcha?: string;        // 验证码输入值
  uuid?: string;           // 验证码UUID
}
```

## 国际化支持

### ✅ 可用的国际化键
- `authentication.welcomeBack`
- `authentication.loginSubtitle`
- `authentication.username`
- `authentication.usernameTip`
- `authentication.password`
- `authentication.passwordTip`
- `authentication.code`
- `authentication.rememberMe`
- `authentication.forgetPassword`
- `authentication.verifyRequiredTip`
- `common.login`

## 重构所需的主要更改

### 1. 移除的依赖
```typescript
// 需要移除
import type { VbenFormSchema } from '@vben/common-ui';
import { AuthenticationLogin } from '@vben/common-ui';
```

### 2. 新增的依赖
```typescript
// 需要新增
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  VbenInputPassword,
  VbenInputCaptcha,
  VbenButton,
  VbenCheckbox,
} from '@vben-core/shadcn-ui';

import { useForm } from 'vee-validate';
import { z } from 'zod';
```

### 3. 表单验证 Schema
```typescript
const loginSchema = z.object({
  username: z.string().min(1, { message: $t('authentication.usernameTip') }),
  password: z.string().min(1, { message: $t('authentication.passwordTip') }),
  captcha: z.string().min(1, { message: $t('authentication.verifyRequiredTip') }).optional(),
  uuid: z.string().optional(),
});
```

## 风险评估

### ✅ 低风险项
- shadcn-ui 组件完全可用
- vee-validate 和 zod 集成已配置
- 国际化支持完整
- 认证接口保持兼容

### ⚠️ 需要注意的项
- 验证码实现需要从 SliderCaptcha 改为 VbenInputCaptcha
- 需要实现验证码获取逻辑 (getCaptcha 函数)
- 表单提交参数格式需要适配
- 样式保持一致性需要验证

### ✅ 兼容性确认
- 所有必需的组件都可用
- 表单验证库已正确集成
- 国际化系统完整支持
- 认证流程接口兼容

## 结论

✅ **所有依赖项验证通过，可以开始重构实现**

- shadcn-ui 表单组件完全可用
- vee-validate 和 zod 已正确集成
- 所有必需的输入组件都可用
- 验证码组件接口清晰
- 认证接口保持兼容
- 国际化支持完整

重构可以按计划进行，所有技术依赖都已就绪。
