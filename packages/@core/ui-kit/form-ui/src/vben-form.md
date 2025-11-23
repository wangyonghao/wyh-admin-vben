# VbenForm Component

`VbenForm` 是一个基于 Schema 的高级表单组件，旨在通过声明式配置来动态生成表单，从而简化开发、提高效率和可维护性。

## 设计目的

`VbenForm` 的核心设计思想是 **“配置即代码”**。它将传统的、繁琐的表单 UI 编写工作抽象为对数据结构（`schemas`）的定义。主要目的如下：

1.  **动态化与数据驱动**：表单的结构、布局和行为完全由 `schemas` prop 决定。后端可以轻松地生成和下发表单配置，实现动态渲染，这在动态流程、自定义表单等场景中非常有用。

2.  **简化与提效**：开发者无需为每个表单项手动编写组件标签和布局代码，只需关注数据和逻辑。组件内置了布局、校验、数据绑定、操作按钮等常见功能，大大减少了重复性工作。

3.  **标准化与一致性**：通过统一的配置入口，可以确保项目内所有表单的风格、交互和校验行为保持一致，便于团队协作和维护。

4.  **高可扩展性**：虽然 `VbenForm` 提供了高度封装，但它也通过插槽（Slots）和属性透传（Props Forwarding）等机制保留了强大的自定义能力，允许开发者对特定部分进行深度定制。

## 核心概念

-   **Schema（模式）**：`VbenForm` 的灵魂。它是一个对象数组，每个对象定义了一个表单项的所有属性，例如：
    -   `field`: 字段名，用于数据绑定。
    -   `label`: 标签文本。
    -   `component`: 要渲染的组件类型（如 `'Input'`, `'Select'`）。
    -   `rules`: 校验规则。
    -   `componentProps`: 传递给内部组件的 props。
    -   ...等等。

-   **组件映射（Component Mapping）**：内部维护一个 `COMPONENT_MAP`，它将 `schema` 中定义的字符串组件名（如 `'Input'`）映射到实际的 Vue 组件。这使得表单可以轻松集成任何组件。

-   **动态渲染（Dynamic Rendering）**：组件内部的 `form-render` 模块会遍历 `schemas`，并根据每个 `schema` 的定义动态地创建和渲染对应的表单组件，并处理好数据绑定、事件监听和校验。

## 基础用法

使用 `VbenForm` 非常简单，主要分为两步：
1.  定义 `schemas`。
2.  将 `schemas` 传递给组件，并监听 `submit` 事件。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { VbenForm } from '@vben-core/ui-kit/form-ui';
import type { FormSchema } from '@vben-core/ui-kit/form-ui';

// 1. 定义表单的 schemas
const schemas = ref<FormSchema[]>([
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入用户名',
    },
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    required: true,
    componentProps: {
      placeholder: '请输入密码',
    },
  },
]);

// 2. 处理提交事件
function handleSubmit(values: Record<string, any>) {
  console.log('表单已提交:', values);
  // 在这里可以发送 API 请求等
}
</script>

<template>
  <VbenForm :schemas="schemas" @submit="handleSubmit" />
</template>
```

## 主要 Props

| Prop                | 类型                               | 默认值     | 描述                                                                 |
| ------------------- | ---------------------------------- | ---------- | -------------------------------------------------------------------- |
| `schemas`           | `FormSchema[]`                     | `[]`       | **核心**：表单的配置数组。                                           |
| `layout`            | `'horizontal'｜'vertical'｜'inline'` | `horizontal` | 表单布局。                                                           |
| `showDefaultActions`| `boolean`                          | `true`     | 是否显示默认的“提交”和“重置”按钮。                                   |
| `submitButtonOptions`| `ButtonProps`                      | `{}`       | 自定义“提交”按钮的属性，例如 `loading`、`text` 等。                  |
| `resetButtonOptions`| `ButtonProps`                      | `{}`       | 自定义“重置”按钮的属性。                                             |
| `collapsed`         | `boolean`                          | `false`    | 是否默认折叠部分表单项。                                             |
| `showCollapseButton`| `boolean`                          | `false`    | 是否显示折叠/展开按钮。                                              |
| `collapsedRows`     | `number`                           | `1`        | 折叠时保留的行数。                                                   |
| `commonConfig`      | `object`                           | `{}`       | 应用于所有表单项的通用配置。                                         |

## 事件

| 事件名   | 回调参数               | 描述                                 |
| -------- | ---------------------- | ------------------------------------ |
| `submit` | `(values: object)`     | 表单验证成功后触发，返回所有表单值。 |
| `reset`  | `()`                   | 点击重置按钮后触发。                 |

## 插槽 (Slots)

`VbenForm` 提供了强大的插槽功能以实现深度自定义。

### 默认插槽

用于替换底部的操作按钮区域。

```vue
<VbenForm :schemas="schemas">
  <!-- 自定义操作按钮 -->
  <template #default>
    <VbenButton type="primary" @click="customSubmit">自定义提交</VbenButton>
    <VbenButton>取消</VbenButton>
  </template>
</VbenForm>
```

### 具名插槽

你可以为任何一个 `schema` 定义的字段提供一个具名插槽，插槽名与 `schema` 的 `field` 属性同名。这允许你完全控制该字段的渲染。

```vue
<script setup lang="ts">
const schemas = [
  {
    field: 'customField',
    label: '自定义字段',
    component: 'Input', // component 依然需要，用于占位
  },
  // ...
];
</script>

<template>
  <VbenForm :schemas="schemas">
    <!-- 自定义 customField 字段的渲染 -->
    <template #customField="{ model, field }">
      <VbenInput
        :model-value="model[field]"
        @update:model-value="(val) => model[field] = val"
        placeholder="这是一个完全自定义的输入框"
        class="!w-full"
      />
      <p class="text-sm text-gray-400">这是自定义的提示信息</p>
    </template>
  </VbenForm>
</template>
```
