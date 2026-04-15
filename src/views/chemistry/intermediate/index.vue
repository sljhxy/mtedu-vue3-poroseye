<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="方程式ID" prop="equationId">
        <el-input v-model="queryParams.equationId" placeholder="请输入方程式ID" clearable style="width: 120px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="阶段ID" prop="stageId">
        <el-input v-model="queryParams.stageId" placeholder="请输入阶段ID" clearable style="width: 120px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="中间产物名称" prop="intermediateName">
        <el-input v-model="queryParams.intermediateName" placeholder="请输入中间产物名称" clearable style="width: 150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" :icon="Plus" v-hasPermi="['chemistry:intermediate:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :icon="Edit" :disabled="single" v-hasPermi="['chemistry:intermediate:edit']" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :icon="Delete" :disabled="multiple" v-hasPermi="['chemistry:intermediate:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" :icon="Download" v-hasPermi="['chemistry:intermediate:export']" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="intermediateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <!-- <el-table-column label="ID" align="center" prop="id" width="60" /> -->
      <el-table-column label="方程式ID" align="center" prop="equationId" width="90" />
      <el-table-column label="阶段ID" align="center" prop="stageId" width="80" />
      <el-table-column label="化学式" align="center" prop="intermediateFormula" width="120">
        <template #default="scope">
          <span v-html="formatFormula(scope.row.intermediateFormula)"></span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" prop="intermediateName" min-width="120" />
      <el-table-column label="英文名" align="center" prop="intermediateNameEn" min-width="120" show-overflow-tooltip />
      <el-table-column label="存在时间" align="center" prop="lifetime" width="80" />
      <el-table-column label="稳定性" align="center" prop="stability" width="90">
        <template #default="scope">
          <dict-tag :options="chemistry_intermediate_stability" :value="scope.row.stability" />
        </template>
      </el-table-column>
      <el-table-column label="可分离" align="center" prop="isIsolatable" width="70">
        <template #default="scope">
          <el-tag :type="scope.row.isIsolatable ? 'success' : 'info'" size="small">{{ scope.row.isIsolatable ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button plain type="primary" @click="handleView(scope.row)" v-hasPermi="['chemistry:intermediate:query']">详情</el-button>
          <el-button plain type="success" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['chemistry:intermediate:edit']">修改</el-button>
          <el-button plain type="danger" @click="handleDelete(scope.row)" v-hasPermi="['chemistry:intermediate:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属方程式ID" prop="equationId">
              <el-input-number v-model="form.equationId" :min="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属阶段ID" prop="stageId">
              <el-input-number v-model="form.stageId" :min="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="中间产物化学式" prop="intermediateFormula">
              <el-input v-model="form.intermediateFormula" maxlength="100" placeholder="如: [Fe(H₂O)₆]²⁺" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="中间产物名称" prop="intermediateName">
              <el-input v-model="form.intermediateName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="英文名称" prop="intermediateNameEn">
              <el-input v-model="form.intermediateNameEn" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存在时间" prop="lifetime">
              <el-select v-model="form.lifetime" placeholder="请选择">
                <el-option v-for="dict in chemistry_intermediate_lifetime" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="稳定性" prop="stability">
              <el-select v-model="form.stability" placeholder="请选择">
                <el-option v-for="dict in chemistry_intermediate_stability" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否可分离" prop="isIsolatable">
              <el-switch v-model="form.isIsolatable" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="检验方法" prop="detectionMethod">
              <el-input v-model="form.detectionMethod" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="特征反应" prop="characteristicReaction">
              <el-input v-model="form.characteristicReaction" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="可观察现象(JSON)" prop="observablePhenomena">
              <el-input v-model="observablePhenomenaStr" type="textarea" :rows="2" placeholder='{"color": "浅绿色"}' />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="教学重要性" prop="teachingImportance">
              <el-input v-model="form.teachingImportance" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Intermediate">
import { listIntermediate, getIntermediate, addIntermediate, updateIntermediate, delIntermediate, exportIntermediate } from '@/api/chemistry/intermediate'
import { formatFormula, CHEMISTRY_DICT, formatJsonData } from '@/utils/chemistry'
import { Search, Refresh, Plus, Edit, Delete, Download, View } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

// 获取系统字典
const { chemistry_intermediate_stability, chemistry_intermediate_lifetime } = proxy.useDict('chemistry_intermediate_stability', 'chemistry_intermediate_lifetime')

const intermediateList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const queryFormRef = ref()
const formRef = ref()

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  equationId: null,
  stageId: null,
  intermediateName: null
})

const form = ref({})
const observablePhenomenaStr = ref('')

const rules = {
  equationId: [
    { required: true, message: '所属方程式不能为空', trigger: 'blur' }
  ],
  intermediateFormula: [
    { required: true, message: '化学式不能为空', trigger: 'blur' }
  ],
  intermediateName: [
    { required: true, message: '中间产物名称不能为空', trigger: 'blur' }
  ]
}

/** 查询中间产物列表 */
function getList() {
  loading.value = true
  listIntermediate(queryParams.value).then(response => {
    intermediateList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    equationId: null,
    stageId: null,
    intermediateFormula: null,
    intermediateName: null,
    intermediateNameEn: null,
    lifetime: null,
    stability: null,
    isIsolatable: false,
    detectionMethod: null,
    characteristicReaction: null,
    observablePhenomena: null,
    teachingImportance: null
  }
  observablePhenomenaStr.value = ''
  proxy.resetForm('formRef')
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryFormRef')
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加中间产物'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value[0]
  getIntermediate(id).then(response => {
    form.value = response.data
    observablePhenomenaStr.value = formatJsonData(form.value.observablePhenomena)
    open.value = true
    title.value = '修改中间产物'
  })
}

/** 提交按钮 */
function submitForm() {
  // 处理JSON字符串
  try {
    if (observablePhenomenaStr.value) {
      form.value.observablePhenomena = JSON.parse(observablePhenomenaStr.value)
    }
  } catch (e) {
    proxy.$modal.msgError('可观察现象JSON格式不正确')
    return
  }

  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateIntermediate(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addIntermediate(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const deleteIds = row.id || ids.value.join(',')
  proxy.$modal.confirm('是否确认删除中间产物编号为"' + deleteIds + '"的数据项？').then(() => {
    return delIntermediate(deleteIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('chemistry/intermediate/export', {
    ...queryParams.value
  }, `intermediate_${new Date().getTime()}.xlsx`)
}

/** 查看详情 */
function handleView(row) {
  const id = row.id
  getIntermediate(id).then(response => {
    form.value = response.data
    observablePhenomenaStr.value = formatJsonData(form.value.observablePhenomena)
    open.value = true
    title.value = '中间产物详情'
  })
}

getList()
</script>
