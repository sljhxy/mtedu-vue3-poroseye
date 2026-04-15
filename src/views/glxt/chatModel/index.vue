<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模型名称" prop="modelName">
        <el-input
          v-model="queryParams.modelName"
          placeholder="请输入模型名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
        <el-form-item label="模型分类" prop="category">
        <el-input
          v-model="queryParams.category"
          placeholder="请输入模型分类"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['glxt:mtChatModel:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['glxt:mtChatModel:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:mtChatModel:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['glxt:mtChatModel:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mtChatModelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="主键" align="center" prop="id" /> -->
      <el-table-column label="序号" type="index" width="55" align="center" prop="id" />
      <el-table-column label="模型分类" align="center" prop="category" />
      <el-table-column label="模型名称" align="center" prop="modelName" />
      <!-- <el-table-column label="模型描述" align="center" prop="modelDescribe" />
      <el-table-column label="模型价格" align="center" prop="modelPrice" />
      <el-table-column label="计费类型" align="center" prop="modelType" />
      <el-table-column label="是否显示" align="center" prop="modelShow" />
      <el-table-column label="系统提示词" align="center" prop="systemPrompt" /> -->
      <el-table-column label="请求地址" align="center" prop="apiHost" />
      <el-table-column label="密钥" align="center" prop="apiKey" />
      <el-table-column label="请求后缀" align="center" prop="apiUrl" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200px">
        <template #default="scope">
          <el-button plain type="success" icon="Edit" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:mtChatModel:edit']">修改</el-button>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:mtChatModel:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改聊天模型对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="mtChatModelRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模型分类" prop="category">
          <el-input v-model="form.category" placeholder="请输入模型分类" />
        </el-form-item>
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="form.modelName" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="模型描述" prop="modelDescribe">
          <el-input v-model="form.modelDescribe" placeholder="请输入模型描述" />
        </el-form-item>
        <el-form-item label="模型价格" prop="modelPrice">
          <el-input v-model="form.modelPrice" placeholder="请输入模型价格" />
        </el-form-item>
        <el-form-item label="是否显示" prop="modelShow">
          <el-input v-model="form.modelShow" placeholder="请输入是否显示" />
        </el-form-item>
        <el-form-item label="请求地址" prop="apiHost">
          <el-input v-model="form.apiHost" placeholder="请输入请求地址" />
        </el-form-item>
        <el-form-item label="密钥" prop="apiKey">
          <el-input v-model="form.apiKey" placeholder="请输入密钥" />
        </el-form-item>
        <el-form-item label="请求后缀" prop="apiUrl">
          <el-input v-model="form.apiUrl" placeholder="请输入请求后缀" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
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

<script setup name="MtChatModel">
import { listMtChatModel, getMtChatModel, delMtChatModel, addMtChatModel, updateMtChatModel } from "@/api/glxt/chatModel";

const { proxy } = getCurrentInstance();

const mtChatModelList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    modelName: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询聊天模型列表 */
function getList() {
  loading.value = true;
  listMtChatModel(queryParams.value).then(response => {
    mtChatModelList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    tenantId: null,
    category: null,
    modelName: null,
    modelDescribe: null,
    modelPrice: null,
    modelType: null,
    modelShow: null,
    systemPrompt: null,
    apiHost: null,
    apiKey: null,
    apiUrl: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    delFlag: null,
    remark: null
  };
  proxy.resetForm("mtChatModelRef");
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

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加聊天模型";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMtChatModel(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改聊天模型";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["mtChatModelRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMtChatModel(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMtChatModel(form.value).then(response => {
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
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除？').then(function() {
    return delMtChatModel(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/mtChatModel/export', {
    ...queryParams.value
  }, `mtChatModel_${new Date().getTime()}.xlsx`)
}

getList();
</script>
