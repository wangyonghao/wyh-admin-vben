# 图标使用指南

## 项目图标方案

本项目使用 **Iconify** 作为图标解决方案，支持超过 150,000+ 个图标。

### 依赖包
- `@iconify/vue` - Iconify Vue 组件
- `lucide-vue-next` - Lucide 图标库（Vue 3）

## 使用方式

### 1. 使用 IconifyIcon 组件（推荐）

```vue
<script setup lang="ts">
import { IconifyIcon } from '@vben/icons';
</script>

<template>
  <!-- Lucide 图标 -->
  <IconifyIcon icon="lucide:search" />
  <IconifyIcon icon="lucide:user" />
  <IconifyIcon icon="lucide:settings" />
  
  <!-- Material Design Icons -->
  <IconifyIcon icon="mdi:home" />
  <IconifyIcon icon="mdi:account" />
  
  <!-- Carbon Icons -->
  <IconifyIcon icon="carbon:user" />
  <IconifyIcon icon="carbon:settings" />
  
  <!-- 自定义大小和颜色 -->
  <IconifyIcon 
    icon="lucide:heart" 
    class="w-6 h-6 text-red-500" 
  />
</template>
```

### 2. 使用 VbenIcon 组件

VbenIcon 是项目封装的图标组件，支持多种图标类型：

```vue
<script setup lang="ts">
import { VbenIcon } from '@vben-core/shadcn-ui';
</script>

<template>
  <!-- 字符串图标（Iconify） -->
  <VbenIcon icon="lucide:search" />
  
  <!-- 远程图片 -->
  <VbenIcon icon="https://example.com/icon.png" />
  
  <!-- Vue 组件 -->
  <VbenIcon :icon="MyIconComponent" />
  
  <!-- 带 fallback -->
  <VbenIcon icon="invalid-icon" fallback />
</template>
```

### 3. 创建自定义图标组件

```typescript
import { createIconifyIcon } from '@vben-core/icons';

// 创建可复用的图标组件
export const SearchIcon = createIconifyIcon('lucide:search');
export const UserIcon = createIconifyIcon('lucide:user');
export const SettingsIcon = createIconifyIcon('lucide:settings');
```

使用：

```vue
<script setup lang="ts">
import { SearchIcon, UserIcon } from '@/icons';
</script>

<template>
  <SearchIcon class="w-5 h-5" />
  <UserIcon class="w-5 h-5" />
</template>
```

## 常用图标集

### Lucide Icons（推荐）
现代、简洁的图标集，适合企业应用。

```
lucide:search
lucide:user
lucide:settings
lucide:home
lucide:mail
lucide:phone
lucide:calendar
lucide:file
lucide:folder
lucide:download
lucide:upload
lucide:trash-2
lucide:edit
lucide:plus
lucide:minus
lucide:x
lucide:check
lucide:chevron-down
lucide:chevron-up
lucide:chevron-left
lucide:chevron-right
lucide:arrow-left
lucide:arrow-right
lucide:loader-2 (加载动画)
```

### Material Design Icons
```
mdi:home
mdi:account
mdi:settings
mdi:email
mdi:phone
```

### Carbon Icons
```
carbon:user
carbon:settings
carbon:home
carbon:search
```

## 图标搜索

访问以下网站搜索图标：
- [Iconify](https://icon-sets.iconify.design/) - 所有图标集
- [Lucide Icons](https://lucide.dev/icons/) - Lucide 图标集
- [Material Design Icons](https://pictogrammers.com/library/mdi/) - MDI 图标集

## 样式控制

使用 Tailwind CSS 类控制图标样式：

```vue
<template>
  <!-- 大小 -->
  <IconifyIcon icon="lucide:search" class="w-4 h-4" />
  <IconifyIcon icon="lucide:search" class="w-6 h-6" />
  <IconifyIcon icon="lucide:search" class="w-8 h-8" />
  
  <!-- 颜色 -->
  <IconifyIcon icon="lucide:heart" class="text-red-500" />
  <IconifyIcon icon="lucide:star" class="text-yellow-500" />
  
  <!-- 动画 -->
  <IconifyIcon icon="lucide:loader-2" class="animate-spin" />
  
  <!-- 组合 -->
  <IconifyIcon 
    icon="lucide:alert-circle" 
    class="w-5 h-5 text-orange-500 mr-2" 
  />
</template>
```

## 在按钮中使用

### Element Plus 按钮

```vue
<template>
  <ElButton type="primary">
    <IconifyIcon icon="lucide:plus" class="mr-2" />
    添加
  </ElButton>
  
  <ElButton>
    <IconifyIcon icon="lucide:download" class="mr-2" />
    导出
  </ElButton>
</template>
```

### 图标按钮

```vue
<template>
  <button class="p-2 hover:bg-gray-100 rounded-md">
    <IconifyIcon icon="lucide:edit" class="w-4 h-4" />
  </button>
  
  <button class="p-2 hover:bg-red-100 rounded-md text-red-600">
    <IconifyIcon icon="lucide:trash-2" class="w-4 h-4" />
  </button>
</template>
```

## 注意事项

1. **不使用 UnoCSS**：本项目不使用 UnoCSS，不要使用 `i-lucide:icon-name` 这种格式
2. **使用 Iconify 格式**：使用 `lucide:icon-name` 格式
3. **性能优化**：Iconify 会按需加载图标，首次使用时会从 CDN 加载
4. **离线使用**：如需离线使用，可以预加载图标集

## 示例：用户管理页面

```vue
<script setup lang="ts">
import { IconifyIcon } from '@vben/icons';
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- 搜索 -->
    <IconifyIcon icon="lucide:search" class="w-4 h-4" />
    
    <!-- 编辑 -->
    <button @click="handleEdit">
      <IconifyIcon icon="lucide:pencil" class="w-4 h-4" />
    </button>
    
    <!-- 删除 -->
    <button @click="handleDelete">
      <IconifyIcon icon="lucide:trash-2" class="w-4 h-4 text-red-600" />
    </button>
    
    <!-- 重置密码 -->
    <button @click="handleResetPassword">
      <IconifyIcon icon="lucide:key" class="w-4 h-4" />
    </button>
  </div>
</template>
```

## 总结

- ✅ 使用 `IconifyIcon` 组件
- ✅ 使用 `lucide:icon-name` 格式
- ✅ 使用 Tailwind CSS 控制样式
- ❌ 不使用 `i-lucide:icon-name` 格式（UnoCSS）
- ❌ 不使用 `class="lucide:icon-name"` 格式
