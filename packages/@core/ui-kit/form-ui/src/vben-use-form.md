# VbenUseForm & useForm

`VbenUseForm` 和 `useForm` Composable 共同构成了一个高级的、"Headless" 的表单解决方案。此模式旨在将表单的 **逻辑（State & Logic）** 与其 **视图（View）** 分离，为复杂场景提供了卓越的灵活性和可控性。

-   **`useForm`**: 一个 Vue Composable (Hook)，是表单的“大脑”。它负责管理表单的所有状态（如表单值、校验状态、`schemas` 配置）、方法（如提交、重置、校验）和生命周期。
-   **`VbenUseForm`**: 一个纯粹的视图组件。它没有自己的内部状态，完全由 `useForm` 返回的 `formApi` 对象驱动。它的职责就是根据 `formApi` 提供的状态来渲染 UI。

## 设计目的

与自包含的 `VbenForm` 组件不同，`useForm` + `VbenUseForm` 的组合主要用于解决以下问题：

1.  **关注点分离 (SoC)**：将表单的数据处理、校验和业务逻辑从 Vue 组件模板中抽离出来。这使得逻辑部分更易于测试和复用，视图部分则保持简洁。

2.  **外部控制**：允许在父组件或项目中的任何其他地方，通过 `formApi` 直接调用表单的方法。例如，你可以在页面顶部的“保存”按钮中调用 `formApi.submit()`，而无需通过 `ref` 获取组件实例。

3.  **跨组件通信**：`formApi` 可以在多个组件之间传递，使得多个组件可以协同操作同一个表单的状态。

4.  **更高的灵活性**：当表单的行为需要根据外部条件动态改变时（例如，根据用户的权限动态更新 `schema`），这种模式比简单的 props/events 模式更强大。

## 核心概念

-   **`useForm()` Composable**: 这是使用此模式的入口。你需要在 `setup` 脚本中调用它，并传入表单的配置（如 `schemas`）。它会返回一个包含 `VbenUseForm` 组件和 `formApi` 对象的数组。

-   **`formApi` 对象**: 这是与表单交互的“遥控器”。它暴露了一系列方法和状态，允许你从外部完全控制表单。

-   **属性优先级**: 通过 `useForwardPriorityValues` 实现。这意味着你可以同时在 `useForm` 和 `VbenUseForm` 组件上设置属性（如 `showDefaultActions`）。组件上直接设置的 prop 具有更高的优先级，可以覆盖 `useForm` 中的配置。

## 基础用法

```vue
<script setup lang="ts">
import { useForm } from '@vben-core/ui-kit/form-ui';
import type { FormSchema } from '@vben-core/ui-kit/form-ui';

// 1. 在 setup 中调用 useForm，传入配置
const [VbenUseForm, formApi] = useForm({
  schemas: [
    {
      field: 'name',
      label: '姓名',
      component: 'Input',
      required: true,
    },
    // ... 其他 schemas
  ],
  showDefaultActions: true, // 在 useForm 中配置
  handleSubmit: (values) => {
    console.log('表单在 useForm 中提交:', values);
  },
});

// 3. 在父组件中通过 formApi 控制表单
async function handleExternalSubmit() {
  try {
    // 调用 API 进行校验和提交
    await formApi.validateAndSubmitForm();
    console.log('外部提交成功');
  } catch (error) {
    console.error('外部提交失败，表单校验未通过');
  }
}
</script>

<template>
  <div>
    <!-- 2. 渲染 VbenUseForm 组件，并传入 formApi -->
    <VbenUseForm :form-api="formApi" />

    <VbenButton class="mt-4" type="primary" @click="handleExternalSubmit">
      从外部提交
    </VbenButton>
  </div>
</template>
```

## `useForm` 配置

`useForm` 接受一个配置对象，其属性与 `VbenForm` 的 `props` 基本一致。

| 配置项                | 类型                               | 描述                                                                 |
| --------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| `schemas`             | `FormSchema[]`                     | **核心**：表单的配置数组。                                           |
| `layout`              | `'horizontal'｜'vertical'｜'inline'` | 表单布局。                                                           |
| `showDefaultActions`  | `boolean`                          | 是否显示默认的“提交”和“重置”按钮。                                   |
| `submitOnChange`      | `boolean`                          | 表单值变化时是否自动（防抖）提交。                                     |
| `submitOnEnter`       | `boolean`                          | 在输入框中按回车时是否提交表单。                                     |
| `handleValuesChange`  | `(values, changedFields) => void`  | 表单值变化时的回调函数。                                             |
| `handleSubmit`        | `(values) => void`                 | 提交成功时的回调函数。                                               |
| `...`                 | `...`                              | 其他所有 `VbenForm` 的 props 均可在此配置。                          |

## `formApi` 核心方法

`formApi` 对象是控制表单的关键，它提供了丰富的 API。

| 方法名                  | 描述                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `getValues()`           | 获取当前所有表单项的值。                                             |
| `setValues(values)`     | 设置一个或多个表单项的值。                                           |
| `getSchema()`           | 获取当前的 `schemas` 配置。                                          |
| `setSchema(schemas)`    | 覆盖式地设置新的 `schemas`。                                         |
| `updateSchema(schema)`  | 更新单个或多个 `schema` 的配置。                                     |
| `validate()`            | 触发整个表单的校验。                                                 |
| `validateFields(fields)`| 校验指定的某些字段。                                                 |
| `clearValidate()`       | 清除所有校验信息。                                                   |
| `resetFields()`         | 重置所有表单项到初始值。                                             |
| `submit()`              | **不经验证**，直接触发 `handleSubmit` 回调。                         |
| `validateAndSubmitForm()`| **推荐使用**：先校验整个表单，成功后再触发 `handleSubmit` 回调。     |
| `getComponentRef(field)`| 获取指定字段的组件实例引用，可用于调用组件自身的方法（如 `focus`）。 |
| `setState(state)`       | 更新表单的内部状态，如 `collapsed`。                                 |

## `VbenUseForm` 的 Props, 事件和插槽

-   **Props**: `VbenUseForm` 的核心 prop 是 `formApi`。此外，你也可以传入其他与 `useForm` 配置相同的 prop 来 **覆盖** `useForm` 中的设置。

-   **事件**: `VbenUseForm` 自身不派发 `submit` 等事件，所有逻辑都应在 `useForm` 的 `handleSubmit` 等回调中处理。

-   **插槽**: 插槽的使用方式与 `VbenForm` **完全相同**，你可以通过默认插槽自定义操作区，或通过具名插槽自定义任意字段的渲染。

```vue
<!-- 插槽用法与 VbenForm 一致 -->
<VbenUseForm :form-api="formApi">
  <!-- 自定义操作按钮 -->
  <template #default>
    <VbenButton @click="formApi.resetFields()">清空</VbenButton>
  </template>

  <!-- 自定义字段 -->
  <template #name="{ model, field }">
    <VbenInput
      :model-value="model[field]"
      @update:model-value="(val) => model[field] = val"
      placeholder="自定义渲染的姓名输入框"
    />
  </template>
</VbenUseForm>
```
