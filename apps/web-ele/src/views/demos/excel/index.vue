<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';

import { computed, h, ref } from 'vue';

import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table';
import {
  ElButton,
  ElColorPicker,
  ElDivider,
  ElInput,
  ElMessage,
  ElSelect,
  ElOption,
  ElUpload,
} from 'element-plus';
import * as XLSX from 'xlsx';

import { Page } from '@vben/common-ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vben-core/shadcn-ui';

interface ExcelRow {
  [key: string]: any;
}

interface CellStyle {
  backgroundColor?: string;
  color?: string;
  fontWeight?: string;
  fontSize?: string;
  textAlign?: string;
}

const tableData = ref<ExcelRow[]>([]);
const fileName = ref('');
const editingCell = ref<{ row: number; col: string } | null>(null);
const selectedCell = ref<{ row: number; col: string } | null>(null);
const cellStyles = ref<Record<string, CellStyle>>({});

// 工具栏状态
const currentBgColor = ref('#ffffff');
const currentTextColor = ref('#000000');
const currentFontSize = ref('14px');
const currentTextAlign = ref('left');
const isBold = ref(false);

// 动态生成列配置
const columns = computed<ColumnDef<ExcelRow>[]>(() => {
  if (tableData.value.length === 0) return [];

  const firstRow = tableData.value[0];
  if (!firstRow) return [];

  return Object.keys(firstRow).map((key) => ({
    accessorKey: key,
    header: key,
    cell: ({ row, column }: any) => {
      const rowIndex = row.index;
      const columnId = column.id;
      const value = row.getValue(columnId);
      const cellKey = `${rowIndex}-${columnId}`;
      const style = cellStyles.value[cellKey] || {};
      const isEditing =
        editingCell.value?.row === rowIndex &&
        editingCell.value?.col === columnId;
      const isSelected =
        selectedCell.value?.row === rowIndex &&
        selectedCell.value?.col === columnId;

      if (isEditing) {
        return h(ElInput, {
          modelValue: value as string,
          size: 'small',
          autofocus: true,
          onBlur: () => finishEdit(),
          onKeyup: (e: KeyboardEvent) => {
            if (e.key === 'Enter') finishEdit();
            if (e.key === 'Escape') cancelEdit();
          },
          'onUpdate:modelValue': (val: string) => {
            if (tableData.value[rowIndex]) {
              tableData.value[rowIndex][columnId] = val;
            }
          },
        });
      }

      return h(
        'div',
        {
          class: [
            'cursor-pointer px-2 py-1 rounded min-h-[32px] flex items-center',
            isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-accent/50',
          ],
          style: {
            backgroundColor: style.backgroundColor,
            color: style.color,
            fontWeight: style.fontWeight,
            fontSize: style.fontSize,
            textAlign: style.textAlign,
          },
          onClick: () => selectCell(rowIndex, columnId),
          onDblclick: () => startEdit(rowIndex, columnId),
        },
        value as string,
      );
    },
  }));
});

// 创建表格实例
const table = useVueTable({
  get data() {
    return tableData.value;
  },
  get columns() {
    return columns.value;
  },
  getCoreRowModel: getCoreRowModel(),
});

// 处理文件上传
const handleFileChange = async (file: File) => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      ElMessage.warning('Excel 文件格式错误');
      return;
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      ElMessage.warning('无法读取工作表');
      return;
    }
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      ElMessage.warning('Excel 文件为空');
      return;
    }

    tableData.value = jsonData as ExcelRow[];
    fileName.value = file.name;
    cellStyles.value = {};

    ElMessage.success(`成功导入 ${jsonData.length} 条数据`);
  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('导入失败，请检查文件格式');
  }
};

const beforeUpload = (file: File) => {
  const isExcel =
    file.type === 'application/vnd.ms-excel' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件！');
    return false;
  }

  handleFileChange(file);
  return false;
};

// 导出 Excel
const handleExport = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('没有数据可导出');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(tableData.value);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(
    workbook,
    fileName.value || `导出数据_${Date.now()}.xlsx`,
  );

  ElMessage.success('导出成功');
};

// 清空数据
const handleClear = () => {
  tableData.value = [];
  fileName.value = '';
  editingCell.value = null;
  selectedCell.value = null;
  cellStyles.value = {};
  ElMessage.success('已清空数据');
};

// 选择单元格
const selectCell = (rowIndex: number, column: string) => {
  selectedCell.value = { row: rowIndex, col: column };
  const cellKey = `${rowIndex}-${column}`;
  const style = cellStyles.value[cellKey] || {};

  // 更新工具栏状态
  currentBgColor.value = style.backgroundColor || '#ffffff';
  currentTextColor.value = style.color || '#000000';
  currentFontSize.value = style.fontSize || '14px';
  currentTextAlign.value = style.textAlign || 'left';
  isBold.value = style.fontWeight === 'bold';
};

// 开始编辑单元格
const startEdit = (rowIndex: number, column: string) => {
  editingCell.value = { row: rowIndex, col: column };
  selectedCell.value = { row: rowIndex, col: column };
};

// 结束编辑
const finishEdit = () => {
  editingCell.value = null;
};

// 取消编辑
const cancelEdit = () => {
  editingCell.value = null;
};

// 应用样式到选中的单元格
const applyCellStyle = (styleKey: keyof CellStyle, value: string) => {
  if (!selectedCell.value) {
    ElMessage.warning('请先选择一个单元格');
    return;
  }

  const cellKey = `${selectedCell.value.row}-${selectedCell.value.col}`;
  if (!cellStyles.value[cellKey]) {
    cellStyles.value[cellKey] = {};
  }
  cellStyles.value[cellKey][styleKey] = value;
};

// 工具栏操作
const handleBgColorChange = (color: string | null) => {
  if (color) applyCellStyle('backgroundColor', color);
};

const handleTextColorChange = (color: string | null) => {
  if (color) applyCellStyle('color', color);
};

const handleFontSizeChange = (size: string) => {
  applyCellStyle('fontSize', size);
};

const handleTextAlignChange = (align: string) => {
  applyCellStyle('textAlign', align);
};

const toggleBold = () => {
  isBold.value = !isBold.value;
  applyCellStyle('fontWeight', isBold.value ? 'bold' : 'normal');
};

// 添加行
const addRow = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('请先导入数据');
    return;
  }

  const firstRow = tableData.value[0];
  if (!firstRow) return;

  const newRow: ExcelRow = {};
  Object.keys(firstRow).forEach((key) => {
    newRow[key] = '';
  });
  tableData.value.push(newRow);
  ElMessage.success('已添加新行');
};

// 删除选中行
const deleteRow = () => {
  if (!selectedCell.value) {
    ElMessage.warning('请先选择一个单元格');
    return;
  }

  tableData.value.splice(selectedCell.value.row, 1);
  selectedCell.value = null;
  ElMessage.success('已删除行');
};
</script>

<template>
  <Page>
    <div class="space-y-4">
      <!-- 文件操作区域 -->
      <div class="flex items-center gap-4 flex-wrap border-b pb-4">
        <ElUpload
          :before-upload="beforeUpload"
          :show-file-list="false"
          accept=".xlsx,.xls"
        >
          <ElButton type="primary">
            <span class="lucide:upload mr-2" />
            导入 Excel
          </ElButton>
        </ElUpload>

        <ElButton :disabled="!tableData.length" @click="handleExport">
          <span class="lucide:download mr-2" />
          导出 Excel
        </ElButton>

        <ElButton
          :disabled="!tableData.length"
          type="danger"
          @click="handleClear"
        >
          <span class="lucide:trash-2 mr-2" />
          清空数据
        </ElButton>

        <ElDivider direction="vertical" />

        <ElButton :disabled="!tableData.length" @click="addRow">
          <span class="lucide:plus mr-2" />
          添加行
        </ElButton>

        <ElButton
          :disabled="!selectedCell"
          type="warning"
          @click="deleteRow"
        >
          <span class="lucide:minus mr-2" />
          删除行
        </ElButton>

        <div v-if="fileName" class="text-sm text-gray-500 dark:text-gray-400">
          当前文件: {{ fileName }} ({{ tableData.length }} 条数据)
        </div>
      </div>

      <!-- 格式工具栏 -->
      <div
        v-if="tableData.length > 0"
        class="flex items-center gap-4 flex-wrap border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">背景色:</span>
          <ElColorPicker
            v-model="currentBgColor"
            :disabled="!selectedCell"
            @change="handleBgColorChange"
          />
        </div>

        <ElDivider direction="vertical" />

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">文字颜色:</span>
          <ElColorPicker
            v-model="currentTextColor"
            :disabled="!selectedCell"
            @change="handleTextColorChange"
          />
        </div>

        <ElDivider direction="vertical" />

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">字号:</span>
          <ElSelect
            v-model="currentFontSize"
            :disabled="!selectedCell"
            style="width: 100px"
            @change="handleFontSizeChange"
          >
            <ElOption label="12px" value="12px" />
            <ElOption label="14px" value="14px" />
            <ElOption label="16px" value="16px" />
            <ElOption label="18px" value="18px" />
            <ElOption label="20px" value="20px" />
            <ElOption label="24px" value="24px" />
          </ElSelect>
        </div>

        <ElDivider direction="vertical" />

        <ElButton
          :disabled="!selectedCell"
          :type="isBold ? 'primary' : 'default'"
          @click="toggleBold"
        >
          <span class="lucide:bold" />
        </ElButton>

        <ElDivider direction="vertical" />

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">对齐:</span>
          <ElButton
            :disabled="!selectedCell"
            :type="currentTextAlign === 'left' ? 'primary' : 'default'"
            @click="handleTextAlignChange('left')"
          >
            <span class="lucide:align-left" />
          </ElButton>
          <ElButton
            :disabled="!selectedCell"
            :type="currentTextAlign === 'center' ? 'primary' : 'default'"
            @click="handleTextAlignChange('center')"
          >
            <span class="lucide:align-center" />
          </ElButton>
          <ElButton
            :disabled="!selectedCell"
            :type="currentTextAlign === 'right' ? 'primary' : 'default'"
            @click="handleTextAlignChange('right')"
          >
            <span class="lucide:align-right" />
          </ElButton>
        </div>

        <div
          v-if="selectedCell"
          class="ml-auto text-sm text-gray-500 dark:text-gray-400"
        >
          已选择: 行 {{ selectedCell.row + 1 }}, 列 {{ selectedCell.col }}
        </div>
      </div>

      <!-- 表格区域 -->
      <div v-if="tableData.length > 0" class="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
            >
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                class="bg-gray-100 dark:bg-gray-800 font-bold"
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="table.getRowModel().rows?.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                :data-state="row.getIsSelected() && 'selected'"
              >
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </TableCell>
              </TableRow>
            </template>

            <TableRow v-else>
              <TableCell :colspan="columns.length" class="h-24 text-center">
                暂无数据
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- 空状态 -->
      <div
        v-else
        class="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700"
      >
        <div class="text-center">
          <span class="lucide:file-spreadsheet mb-4 text-6xl text-gray-400" />
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            请导入 Excel 文件开始编辑
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500">
            支持 .xlsx 和 .xls 格式，单击选择单元格，双击编辑内容
          </p>
        </div>
      </div>
    </div>
  </Page>
</template>
