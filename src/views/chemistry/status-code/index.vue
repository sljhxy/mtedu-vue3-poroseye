<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="状态码" prop="statusCode">
        <el-input v-model="queryParams.statusCode" placeholder="请输入状态码" clearable style="width: 150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态名称" prop="statusName">
        <el-input v-model="queryParams.statusName" placeholder="请输入状态名称" clearable style="width: 150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable filterable style="width: 200px">
          <el-option v-for="item in categoryOptions" :key="item.id" :label="item.categoryName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['glxt:chemistry:status:code:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['glxt:chemistry:status:code:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['glxt:chemistry:status:code:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['glxt:chemistry:status:code:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="statusCodeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="ID" align="center" prop="id" width="70" /> -->
      <el-table-column label="状态码" align="center" prop="statusCode" width="280" />
      <el-table-column label="状态名称" align="center" prop="statusName" min-width="120" />
      <el-table-column label="英文名称" align="center" prop="statusNameEn" min-width="120" show-overflow-tooltip />
      <el-table-column label="分类" align="center" prop="categoryName" min-width="120" />
      <el-table-column label="颜色值" align="center" prop="rgbValue" width="120">
        <template #default="scope">
          <div v-if="scope.row.rgbValue" style="display: flex; align-items: center; gap: 8px">
            <span style="
              display: inline-block;
              width: 24px;
              height: 24px;
              border-radius: 4px;
              border: 1px solid #999;
              background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%);
              background-size: 6px 6px;
              background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
              position: relative;
            ">
              <span :style="{
                position: 'absolute',
                inset: '0',
                borderRadius: '4px',
                backgroundColor: scope.row.rgbValue
              }"></span>
            </span>
            <span style="font-size: 12px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ scope.row.rgbValue }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="典型物质" align="center" prop="typicalSubstance" min-width="150" show-overflow-tooltip />
      <!-- <el-table-column label="排序" align="center" prop="sortOrder" width="70" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:chemistry:status:code:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:chemistry:status:code:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改状态码对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="statusCodeRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态码" prop="statusCode">
              <el-input v-model="form.statusCode" placeholder="请输入状态码（如 COLOR_RED）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态名称" prop="statusName">
              <el-input v-model="form.statusName" placeholder="请输入状态名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文名称" prop="statusNameEn">
              <el-input v-model="form.statusNameEn" placeholder="请输入英文名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属分类" prop="categoryId">
              <el-tree-select v-model="form.categoryId" :data="categoryOptions" :props="{ value: 'id', label: 'categoryName', children: 'children' }" value-key="id" placeholder="选择所属分类" check-strictly filterable />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="RGB 颜色值" prop="rgbValue">
              <el-color-picker v-model="form.rgbValue" show-alpha :predefine="colorPresets" />
              <el-input v-model="form.rgbValue" placeholder="请输入 RGB/RGBA 颜色值" style="width: 200px; margin-left: 10px" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="典型物质" prop="typicalSubstance">
              <el-input v-model="form.typicalSubstance" type="textarea" placeholder="请输入典型物质，多个用逗号分隔" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description" type="textarea" placeholder="请输入描述" :rows="3" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remarks">
              <el-input v-model="form.remarks" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StatusCode">
import { listStatusCode, getStatusCode, delStatusCode, addStatusCode, updateStatusCode } from "@/api/chemistry/statusCode";
import { getCategoryTree } from "@/api/chemistry/statusCategory";

const { proxy } = getCurrentInstance();

const statusCodeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

// 颜色预设
const colorPresets = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(199, 199, 199, 1)',
  'rgba(83, 102, 255, 1)',
];

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    statusCode: undefined,
    statusName: undefined,
    categoryId: undefined
  },
  categoryOptions: []
});

const { queryParams, form, categoryOptions } = toRefs(data);

/** 规则 */
const rules = {
  statusCode: [{ required: true, message: "状态码不能为空", trigger: "blur" }],
  statusName: [{ required: true, message: "状态名称不能为空", trigger: "blur" }],
  categoryId: [{ required: true, message: "所属分类不能为空", trigger: "change" }]
};

/** 查询分类列表 */
function getCategoryList() {
  getCategoryTree().then(response => {
    categoryOptions.value = proxy.handleTree(response.data, "id");
  });
}

/** 查询状态码列表 */
function getList() {
  loading.value = true;
  listStatusCode(queryParams.value).then(response => {
    statusCodeList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    statusCode: undefined,
    statusName: undefined,
    statusNameEn: undefined,
    categoryId: undefined,
    rgbValue: undefined,
    description: undefined,
    typicalSubstance: undefined,
    remarks: undefined,
    sortOrder: 0
  };
  proxy.resetForm("statusCodeRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  if (row && row.categoryId) {
    form.value.categoryId = row.categoryId;
  }
  open.value = true;
  title.value = "新增状态码";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getStatusCode(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改状态码";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["statusCodeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateStatusCode(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStatusCode(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除选中状态码？').then(function () {
    return delStatusCode(ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("chemistry/statusCode/export", {
    ...queryParams.value
  }, `status_code_${proxy.parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')}.xlsx`);
}

getCategoryList();
getList();
</script>
