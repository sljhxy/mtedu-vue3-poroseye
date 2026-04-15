<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="关联类型" prop="refType">
        <el-select v-model="queryParams.refType" placeholder="请选择关联类型" clearable style="width: 150px">
          <el-option label="物质" value="SUBSTANCE" />
          <el-option label="方程式" value="EQUATION" />
          <el-option label="现象" value="PHENOMENON" />
          <el-option label="反应阶段" value="REACTION_STAGE" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务 ID" prop="refId">
        <el-input v-model="queryParams.refId" placeholder="请输入业务 ID" clearable style="width: 120px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['glxt:chemistry:status:ref:save']">新增关联</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['glxt:chemistry:status:ref:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="statusRefList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="ID" align="center" prop="id" width="60" /> -->
      <el-table-column label="关联类型" align="center" prop="refType" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.refType === 'SUBSTANCE'" type="success">物质</el-tag>
          <el-tag v-else-if="scope.row.refType === 'EQUATION'" type="primary">方程式</el-tag>
          <el-tag v-else-if="scope.row.refType === 'PHENOMENON'" type="warning">现象</el-tag>
          <el-tag v-else-if="scope.row.refType === 'REACTION_STAGE'" type="info">反应阶段</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="业务 ID" align="center" prop="refId" width="80" />
      <el-table-column label="状态码" align="center" prop="statusCode" width="110" />
      <el-table-column label="状态名称" align="center" prop="statusName" min-width="120" show-overflow-tooltip />
      <el-table-column label="角色" align="center" prop="statusRole" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.statusRole === 'COLOR'" type="danger">颜色</el-tag>
          <el-tag v-else-if="scope.row.statusRole === 'STATE'" type="primary">状态</el-tag>
          <el-tag v-else-if="scope.row.statusRole === 'ODOR'" type="success">气味</el-tag>
          <el-tag v-else-if="scope.row.statusRole === 'CONDITION'" type="warning">条件</el-tag>
          <el-tag v-else-if="scope.row.statusRole === 'PHENOMENON'" type="info">现象</el-tag>
          <el-tag v-else>-</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="量级" align="center" prop="quantityStatusName" width="80" />
      <el-table-column label="浓度" align="center" prop="concentrationStatusName" width="80" />
      <el-table-column label="程度" align="center" prop="degreeStatusName" width="80" />
      <el-table-column label="颜色" align="center" prop="rgbValue" width="90">
        <template #default="scope">
          <div v-if="scope.row.rgbValue" style="display: flex; align-items: center; justify-content: center; gap: 6px">
            <span style="
              display: inline-block;
              width: 20px;
              height: 20px;
              border-radius: 3px;
              border: 1px solid #999;
              background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%);
              background-size: 4px 4px;
              background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
              position: relative;
            ">
              <span :style="{
                position: 'absolute',
                inset: '0',
                borderRadius: '3px',
                backgroundColor: scope.row.rgbValue
              }"></span>
            </span>
            <span style="font-size: 11px; color: #999;">{{ scope.row.rgbValue.substring(0, 7) }}</span>
          </div>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="140">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:chemistry:status:ref:save']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:chemistry:status:ref:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改关联对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref="statusRefRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联类型" prop="refType">
              <el-select v-model="form.refType" placeholder="请选择关联类型" @change="handleRefTypeChange" style="width: 100%">
                <el-option label="物质" value="SUBSTANCE" />
                <el-option label="方程式" value="EQUATION" />
                <el-option label="现象" value="PHENOMENON" />
                <el-option label="反应阶段" value="REACTION_STAGE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务 ID" prop="refId">
              <el-input-number v-model="form.refId" :min="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">选择状态码</el-divider>

        <el-row :gutter="20">
          <el-col :span="14">
            <el-transfer
              v-model="form.statusCodeIds"
              :data="allStatusCodes"
              :titles="['可选状态码', '已选状态码']"
              :button-texts="['取消', '确认']"
              :format="{
                noChecked: '${total}',
                hasChecked: '${checked}/${total}'
              }"
              class="panel"
              filterable
              filter-placeholder="搜索状态码"
              @change="handleTransferChange"
            >
              <template #default="{ option }">
                <div style="display: flex; align-items: center; gap: 8px">
                  <span v-if="option.rgbValue" style="
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border-radius: 2px;
                    border: 1px solid #999;
                    background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%);
                    background-size: 4px 4px;
                    background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
                    position: relative;
                  ">
                    <span :style="{
                      position: 'absolute',
                      inset: '0',
                      borderRadius: '2px',
                      backgroundColor: option.rgbValue
                    }"></span>
                  </span>
                  <span>{{ option.statusName }} <span style="color: #999; font-size: 12px;">({{ option.statusCode }})</span></span>
                </div>
              </template>
            </el-transfer>
          </el-col>
          <el-col :span="10">
            <div style="border: 1px solid #dcdfe6; border-radius: 4px; padding: 12px; height: 300px; overflow-y: auto;">
              <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #606266;">已选状态码详情</div>
              <el-empty v-if="!form.statusCodeIds || form.statusCodeIds.length === 0" description="请先选择状态码" :image-size="60" />
              <div v-else>
                <div v-for="itemId in form.statusCodeIds" :key="itemId" style="display: flex; flex-direction: column; gap: 6px; padding: 10px 0; border-bottom: 1px dashed #ebeef5;">
                  <div style="font-size: 13px; color: #303133; font-weight: 500;">
                    {{ getStatusName(itemId) }}
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                    <div>
                      <span style="font-size: 11px; color: #909399;">角色：</span>
                      <el-select :model-value="data.statusRoleMap[itemId]" @update:model-value="val => data.statusRoleMap[itemId] = val" placeholder="选择角色" size="small" style="width: 100%">
                        <el-option label="颜色" value="COLOR" />
                        <el-option label="状态" value="STATE" />
                        <el-option label="气味" value="ODOR" />
                        <el-option label="条件" value="CONDITION" />
                        <el-option label="现象" value="PHENOMENON" />
                      </el-select>
                    </div>
                    <div>
                      <span style="font-size: 11px; color: #909399;">量级：</span>
                      <el-select :model-value="data.quantityMap[itemId]" @update:model-value="val => data.quantityMap[itemId] = val" placeholder="选择量级" size="small" style="width: 100%" clearable>
                        <el-option v-for="item in quantityOptions" :key="item.key" :label="item.statusName" :value="item.key" />
                      </el-select>
                    </div>
                    <div>
                      <span style="font-size: 11px; color: #909399;">浓度：</span>
                      <el-select :model-value="data.concentrationMap[itemId]" @update:model-value="val => data.concentrationMap[itemId] = val" placeholder="选择浓度" size="small" style="width: 100%" clearable>
                        <el-option v-for="item in concentrationOptions" :key="item.key" :label="item.statusName" :value="item.key" />
                      </el-select>
                    </div>
                    <div>
                      <span style="font-size: 11px; color: #909399;">程度：</span>
                      <el-select :model-value="data.degreeMap[itemId]" @update:model-value="val => data.degreeMap[itemId] = val" placeholder="选择程度" size="small" style="width: 100%" clearable>
                        <el-option v-for="item in degreeOptions" :key="item.key" :label="item.statusName" :value="item.key" />
                      </el-select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

<script setup name="StatusRef">
import { listStatusRef, getStatusRef, delStatusRef, saveStatusRef, getStatusRefByRef } from "@/api/chemistry/statusRef";
import { listStatusCode, searchStatusCode } from "@/api/chemistry/statusCode";
import { listQuantityStatusCodes, listConcentrationStatusCodes, listDegreeStatusCodes } from "@/api/chemistry/statusRef";

const { proxy } = getCurrentInstance();

const statusRefList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const allStatusCodes = ref([]);
const quantityOptions = ref([]);
const concentrationOptions = ref([]);
const degreeOptions = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    refType: undefined,
    refId: undefined
  },
  // 用于穿梭框和角色编辑
  selectedStatusCodes: [],
  // 状态码角色映射
  statusRoleMap: {},
  // 量级映射
  quantityMap: {},
  // 浓度映射
  concentrationMap: {},
  // 程度映射
  degreeMap: {}
});

const { queryParams, form } = toRefs(data);

/** 规则 */
const rules = {
  refType: [{ required: true, message: "关联类型不能为空", trigger: "change" }],
  refId: [{ required: true, message: "业务 ID 不能为空", trigger: "blur" }],
  statusCodeIds: [{ required: true, message: "请至少选择一个状态码", trigger: "change" }]
};

/** 查询关联列表 */
function getList() {
  loading.value = true;
  listStatusRef(queryParams.value).then(response => {
    statusRefList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 查询所有状态码 */
function getAllStatusCodes() {
  listStatusCode({ pageSize: 1000 }).then(response => {
    allStatusCodes.value = response.rows.map(item => ({
      key: item.id,
      statusName: item.statusName,
      statusCode: item.statusCode,
      rgbValue: item.rgbValue,
      statusRole: ''
    }));
  });
}

/** 查询量级、浓度、程度选项 */
function getModifierOptions() {
  listQuantityStatusCodes().then(response => {
    quantityOptions.value = (response.data || []).map(item => ({
      key: item.statusCodeId,
      statusName: item.statusName,
      statusCode: item.statusCode
    }));
  });
  listConcentrationStatusCodes().then(response => {
    concentrationOptions.value = (response.data || []).map(item => ({
      key: item.statusCodeId,
      statusName: item.statusName,
      statusCode: item.statusCode
    }));
  });
  listDegreeStatusCodes().then(response => {
    degreeOptions.value = (response.data || []).map(item => ({
      key: item.statusCodeId,
      statusName: item.statusName,
      statusCode: item.statusCode
    }));
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
    refType: undefined,
    refId: undefined,
    statusCodeIds: [],
    statusRoles: []
  };
  data.selectedStatusCodes = [];
  data.statusRoleMap = {};
  data.quantityMap = {};
  data.concentrationMap = {};
  data.degreeMap = {};
  proxy.resetForm("statusRefRef");
}

/** 获取状态码名称 */
function getStatusName(id) {
  const item = allStatusCodes.value.find(item => item.key === id);
  return item ? item.statusName : '';
}

/** 获取状态码角色 */
function getStatusRole(id) {
  return data.statusRoleMap[id] || '';
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
  multiple.value = !selection.length;
}

/** 穿梭框变化 */
function handleTransferChange(value) {
  // 更新选中的状态码信息
  data.selectedStatusCodes = allStatusCodes.value.filter(item => value.includes(item.key));
  // 保留已有映射，移除不在选中列表中的
  const newRoleMap = {};
  const newQuantityMap = {};
  const newConcentrationMap = {};
  const newDegreeMap = {};
  value.forEach(id => {
    newRoleMap[id] = data.statusRoleMap[id] || '';
    newQuantityMap[id] = data.quantityMap[id] || null;
    newConcentrationMap[id] = data.concentrationMap[id] || null;
    newDegreeMap[id] = data.degreeMap[id] || null;
  });
  data.statusRoleMap = newRoleMap;
  data.quantityMap = newQuantityMap;
  data.concentrationMap = newConcentrationMap;
  data.degreeMap = newDegreeMap;
}

/** 关联类型变化 */
function handleRefTypeChange(value) {
  // 清空已选状态码
  form.value.statusCodeIds = [];
  data.selectedStatusCodes = [];
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  if (row) {
    form.value.refType = row.refType;
    form.value.refId = row.refId;
  }
  open.value = true;
  title.value = "新增关联";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getStatusRef(id).then(response => {
    form.value = response.data;
    // 初始化选中的状态码
    if (response.data.statusCodeId) {
      form.value.statusCodeIds = [response.data.statusCodeId];
      // 初始化角色映射
      if (response.data.statusRole) {
        data.statusRoleMap[response.data.statusCodeId] = response.data.statusRole;
      }
      // 初始化量级映射
      if (response.data.quantityStatusId) {
        data.quantityMap[response.data.statusCodeId] = response.data.quantityStatusId;
      }
      // 初始化浓度映射
      if (response.data.concentrationStatusId) {
        data.concentrationMap[response.data.statusCodeId] = response.data.concentrationStatusId;
      }
      // 初始化程度映射
      if (response.data.degreeStatusId) {
        data.degreeMap[response.data.statusCodeId] = response.data.degreeStatusId;
      }
    }
    open.value = true;
    title.value = "修改关联";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["statusRefRef"].validate(valid => {
    if (valid) {
      // 构建角色、量级、浓度、程度列表
      const statusRoles = form.value.statusCodeIds.map(id => data.statusRoleMap[id] || '');
      const quantityIds = form.value.statusCodeIds.map(id => data.quantityMap[id] || null);
      const concentrationIds = form.value.statusCodeIds.map(id => data.concentrationMap[id] || null);
      const degreeIds = form.value.statusCodeIds.map(id => data.degreeMap[id] || null);

      // 调用保存接口（需要更新后端接口支持新字段）
      saveStatusRefWithModifiers(
        form.value.refType,
        form.value.refId,
        form.value.statusCodeIds,
        statusRoles,
        quantityIds,
        concentrationIds,
        degreeIds
      ).then(response => {
        proxy.$modal.msgSuccess("保存成功");
        open.value = false;
        getList();
      });
    }
  });
}

/** 保存关联（支持量级、浓度、程度） */
function saveStatusRefWithModifiers(refType, refId, statusCodeIds, statusRoles, quantityIds, concentrationIds, degreeIds) {
  return proxy.$axios({
    url: '/glxt/chemistry/status/ref/save',
    method: 'post',
    params: { refType, refId },
    data: { statusCodeIds, statusRoles, quantityIds, concentrationIds, degreeIds }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除选中关联？').then(function () {
    return delStatusRef(ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 获取对比色（用于文字颜色） */
function getContrastColor(hexColor) {
  return '#fff';
}

getAllStatusCodes();
getModifierOptions();
getList();
</script>

<style scoped>
.panel {
  text-align: left;
}
:deep(.el-transfer-panel) {
  width: 280px;
}
</style>
