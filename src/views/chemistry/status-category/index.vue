<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="分类名称" prop="categoryName">
        <el-input v-model="queryParams.categoryName" placeholder="请输入分类名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="分类级别" prop="level">
        <el-select v-model="queryParams.level" placeholder="请选择级别" clearable style="width: 120px">
          <el-option label="一级分类" :value="1" />
          <el-option label="二级分类" :value="2" />
          <el-option label="三级分类" :value="3" />
          <el-option label="四级分类" :value="4" />
          <el-option label="五级分类" :value="5" />
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['glxt:chemistry:status:category:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['glxt:chemistry:status:category:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-if="refreshTable" v-loading="loading" :data="categoryList" row-key="id" :default-expand-all="isExpandAll" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column prop="categoryName" label="分类名称" min-width="100" />
      <el-table-column prop="categoryCode" label="分类编码" width="250" />
      <el-table-column prop="categoryNameEn" label="英文名称" width="250" />
      <el-table-column prop="level" label="级别" width="80" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.level === 1" type="primary">一级</el-tag>
          <el-tag v-else-if="scope.row.level === 2" type="success">二级</el-tag>
          <el-tag v-else-if="scope.row.level === 3" type="warning">三级</el-tag>
          <el-tag v-else-if="scope.row.level === 4" type="info">四级</el-tag>
          <el-tag v-else type="danger">五级</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip align="center"/>
       <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
      <!-- <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:chemistry:status:category:edit']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['glxt:chemistry:status:category:add']">新增子分类</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:chemistry:status:category:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改分类对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24" v-if="form.parentId !== 0 && form.parentId !== null">
            <el-form-item label="上级分类" prop="parentId">
              <el-tree-select v-model="form.parentId" :data="categoryOptions" :props="{ value: 'id', label: 'categoryName', children: 'children' }" value-key="id" placeholder="选择上级分类" check-strictly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类名称" prop="categoryName">
              <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类编码" prop="categoryCode">
              <el-input v-model="form.categoryCode" placeholder="请输入分类编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文名称" prop="categoryNameEn">
              <el-input v-model="form.categoryNameEn" placeholder="请输入英文名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description" type="textarea" placeholder="请输入描述" :rows="3" />
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

<script setup name="StatusCategory">
import { listCategory, getCategoryTree, getCategory, delCategory, addCategory, updateCategory } from "@/api/chemistry/statusCategory";

const { proxy } = getCurrentInstance();

const categoryList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);

const data = reactive({
  form: {},
  queryParams: {
    categoryName: undefined,
    level: undefined
  },
  categoryOptions: []
});

const { queryParams, form, categoryOptions } = toRefs(data);

/** 规则 */
const rules = {
  categoryName: [{ required: true, message: "分类名称不能为空", trigger: "blur" }],
  categoryCode: [{ required: true, message: "分类编码不能为空", trigger: "blur" }],
  level: [{ required: true, message: "分类级别不能为空", trigger: "change" }]
};

/** 查询分类列表 */
function getList() {
  loading.value = true;
  getCategoryTree().then(response => {
    // 使用若依的 handleTree 重建树形结构（第二个参数是 id 字段名）
    categoryList.value = proxy.handleTree(response.data || [], "id");
    loading.value = false;
  }).catch((error) => {
    console.error('Get category tree error:', error);
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
    parentId: 0,
    categoryName: undefined,
    categoryCode: undefined,
    categoryNameEn: undefined,
    level: 1,
    description: undefined,
    sortOrder: 0
  };
  proxy.resetForm("categoryRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  // 树形数据前端过滤
  if (queryParams.value.categoryName || queryParams.value.level) {
    getCategoryTree().then(response => {
      const allData = proxy.handleTree(response.data || [], "id");
      categoryList.value = filterTree(allData, queryParams.value);
    });
  } else {
    getList();
  }
}

/** 过滤树形数据 */
function filterTree(data, filters) {
  const result = [];
  data.forEach(item => {
    const matchName = !filters.categoryName || item.categoryName.includes(filters.categoryName);
    const matchLevel = !filters.level || item.level === filters.level;
    if (matchName && matchLevel) {
      result.push(item);
    } else if (item.children && item.children.length > 0) {
      const filteredChildren = filterTree(item.children, filters);
      if (filteredChildren.length > 0) {
        item.children = filteredChildren;
        result.push(item);
      }
    }
  });
  return result;
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  getList();
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  if (row) {
    form.value.parentId = row.id;
    form.value.level = (row.level || 1) + 1;
  }
  open.value = true;
  title.value = "新增分类";
  // 获取分类树形结构用于选择上级分类
  getCategoryTree().then(response => {
    categoryOptions.value = proxy.handleTree(response.data || [], "id");
  });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id;
  getCategory(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改分类";
    // 获取分类树形结构用于选择上级分类（排除当前分类及其子分类）
    getCategoryTree().then(res => {
      categoryOptions.value = proxy.handleTree(res.data || [], "id");
    });
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["categoryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCategory(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除分类 "' + row.categoryName + '" ？').then(function () {
    return delCategory(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("chemistry/statusCategory/export", {
    ...queryParams.value
  }, `status_category_${proxy.parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')}.xlsx`);
}

getList();
</script>
