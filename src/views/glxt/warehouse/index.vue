<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="器材名称" prop="equipmentName">
        <el-input
          v-model="queryParams.equipmentName"
          placeholder="请输入器材名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="器材类型" prop="equipmentTypeId">
        <el-select v-model="queryParams.equipmentTypeId" placeholder="请选择器材类型" style="width: 200px;" clearable>
          <el-option
            v-for="dict in equipment_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['glxt:warehouse:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['glxt:warehouse:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:warehouse:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['glxt:warehouse:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="warehouseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="55" align="center" prop="id" />
      <el-table-column label="缩略图" align="center" prop="thumbnailImg" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.thumbnailImg" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="器材名称" align="center" prop="equipmentName" />
      <el-table-column label="器材类型" align="center" prop="equipmentTypeId">
        <template #default="scope">
          <dict-tag :options="equipment_type" :value="scope.row.equipmentTypeId"/>
        </template>
      </el-table-column>
      <el-table-column label="操作说明" align="center" prop="equipmentAttr" />
      <el-table-column label="注意事项" align="center" prop="usageAttention" />
      <el-table-column label="是否封" align="center" prop="isPackage" >
        <template #default="scope">
          <el-tag :type="scope.row.isPackage == 1 ? 'success' : 'danger'" effect="plan">{{ scope.row.isPackage == 1 ? '已封装' : '未封装' }}</el-tag>
          <!-- {{ scope.row.isPackage == 1 ? '已封装' : '未封装' }} -->
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button plain type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:warehouse:edit']">修改</el-button>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:warehouse:remove']">删除</el-button>
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

    <!-- 添加或修改实验器具对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="warehouseRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="缩略图" prop="thumbnailImg">
          <image-upload v-model="form.thumbnailImg"/>
        </el-form-item>
        <el-form-item label="是否封装" prop="isPackage">
          <el-radio-group v-model="form.isPackage">
            <el-radio value="1" size="large">是</el-radio>
            <el-radio value="0" size="large">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="器材类型" prop="equipmentTypeId">
          <el-select v-model="form.equipmentTypeId" placeholder="请选择器材类型">
            <el-option
              v-for="dict in equipment_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="器材名称" prop="equipmentName">
          <el-input v-model="form.equipmentName" placeholder="请输入器材名称" />
        </el-form-item>
        <el-form-item label="操作说明" prop="equipmentAttr">
          <el-input v-model="form.equipmentAttr" placeholder="请输入操作说明" />
        </el-form-item>
        <el-form-item label="注意事项" prop="usageAttention">
          <el-input v-model="form.usageAttention" placeholder="请输入注意事项" />
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

<script setup name="Warehouse">
import { listWarehouse, getWarehouse, delWarehouse, addWarehouse, updateWarehouse } from "@/api/glxt/warehouse";

const { proxy } = getCurrentInstance();
const { equipment_type } = proxy.useDict('equipment_type');

const warehouseList = ref([]);
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
    equipmentName: null,
    equipmentTypeId: null,
  },
  rules: {
    equipmentName: [
      { required: true, message: "器材名称不能为空", trigger: "blur" }
    ],
    // equipmentAttr: [
    //   { required: true, message: "操作说明不能为空", trigger: "blur" }
    // ],
    // usageAttention: [
    //   { required: true, message: "注意事项不能为空", trigger: "blur" }
    // ],
    // thumbnailImg: [
    //   { required: true, message: "缩略图不能为空", trigger: "blur" }
    // ],
    equipmentTypeId: [
      { required: true, message: "器材类型 字典表不能为空", trigger: "change" }
    ],
    isPackage: [
      { required: true, message: "是否封装 1是 0 否不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询实验器具列表 */
function getList() {
  loading.value = true;
  listWarehouse(queryParams.value).then(response => {
    warehouseList.value = response.rows;
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
    equipmentName: null,
    equipmentAttr: null,
    usageAttention: null,
    thumbnailImg: null,
    equipmentTypeId: null,
    isPackage: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    delFlag: null
  };
  proxy.resetForm("warehouseRef");
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
  title.value = "添加实验器具";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getWarehouse(_id).then(response => {
    response.data.isPackage = String(response.data.isPackage)
    form.value = response.data;
    open.value = true;
    title.value = "修改实验器具";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["warehouseRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateWarehouse(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addWarehouse(form.value).then(response => {
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
    return delWarehouse(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/warehouse/export', {
    ...queryParams.value
  }, `warehouse_${new Date().getTime()}.xlsx`)
}

getList();
</script>
