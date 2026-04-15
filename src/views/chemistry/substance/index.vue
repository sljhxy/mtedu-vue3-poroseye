<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="中文名称" prop="nameZh">
        <el-input v-model="queryParams.nameZh" placeholder="请输入中文名称" clearable style="width: 150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="化学式" prop="formula">
        <el-input v-model="queryParams.formula" placeholder="请输入化学式" clearable style="width: 120px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="物质类型" prop="substanceType">
        <el-select v-model="queryParams.substanceType" placeholder="请选择" clearable style="width: 120px">
          <el-option v-for="(label, value) in substanceTypeOptions" :key="value" :label="label" :value="value" />
        </el-select>
      </el-form-item>
      <el-form-item label="化合物类型" prop="compoundType">
        <el-select v-model="queryParams.compoundType" placeholder="请选择" clearable style="width: 120px">
          <el-option v-for="(label, value) in compoundTypeOptions" :key="value" :label="label" :value="value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" :icon="Plus" v-hasPermi="['chemistry:substance:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :icon="Edit" :disabled="single" v-hasPermi="['chemistry:substance:edit']" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :icon="Delete" :disabled="multiple" v-hasPermi="['chemistry:substance:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" :icon="Download" v-hasPermi="['chemistry:substance:export']" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="substanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="中文名" align="center" prop="nameZh" width="100" />
      <el-table-column label="英文名" align="center" prop="nameEn" min-width="100" show-overflow-tooltip />
      <el-table-column label="化学式" align="center" prop="formula" width="100">
        <template #default="scope">
          <span v-html="formatFormula(scope.row.formula)"></span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="substanceType" width="70">
        <template #default="scope">
          <dict-tag :options="substanceTypeOptions" :value="scope.row.substanceType" />
        </template>
      </el-table-column>
      <el-table-column label="化合物类型" align="center" prop="compoundType" width="120">
        <template #default="scope">
          <dict-tag :options="compoundTypeOptions" :value="scope.row.compoundType" />
        </template>
      </el-table-column>
      <el-table-column label="摩尔质量" align="center" prop="molarMass" width="90">
        <template #default="scope">
          {{ scope.row.molarMass ? scope.row.molarMass + ' g/mol' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="stateAtStp" width="70">
        <template #default="scope">
          <el-tag :type="getStateTagType(scope.row.stateAtStp)">{{ getStateLabel(scope.row.stateAtStp) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="颜色" align="center" prop="color" min-width="60" />
      <el-table-column label="密度" align="center" prop="density" width="90">
        <template #default="scope">
          {{ scope.row.density ? scope.row.density + ' g/cm³' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="pH值" align="center" prop="phValue" width="70" />
      <el-table-column label="毒性" align="center" prop="toxicityLevel" width="70">
        <template #default="scope">
          <dict-tag :options="chemistry_toxicity_level" :value="scope.row.toxicityLevel" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button plain type="primary" @click="handleView(scope.row)" v-hasPermi="['chemistry:substance:query']">详情</el-button>
          <el-button plain type="success" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['chemistry:substance:edit']">修改</el-button>
          <el-button plain type="danger" @click="handleDelete(scope.row)" v-hasPermi="['chemistry:substance:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="中文名称" prop="nameZh">
              <el-input v-model="form.nameZh" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文名称" prop="nameEn">
              <el-input v-model="form.nameEn" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="化学式" prop="formula">
              <el-input v-model="form.formula" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物质类型" prop="substanceType">
              <el-select v-model="form.substanceType" placeholder="请选择">
                <el-option v-for="(label, value) in substanceTypeOptions" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="化合物类型" prop="compoundType">
              <el-select v-model="form.compoundType" placeholder="请选择">
                <el-option v-for="(label, value) in compoundTypeOptions" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="摩尔质量(g/mol)" prop="molarMass">
              <el-input-number v-model="form.molarMass" :precision="2" :step="0.01" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="标准状态" prop="stateAtStp">
              <el-select v-model="form.stateAtStp" placeholder="请选择">
                <el-option label="固态" value="solid" />
                <el-option label="液态" value="liquid" />
                <el-option label="气态" value="gas" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="颜色" prop="color">
              <el-input v-model="form.color" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="密度(g/cm³)" prop="density">
              <el-input-number v-model="form.density" :precision="4" :step="0.0001" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="熔点(°C)" prop="meltingPoint">
              <el-input-number v-model="form.meltingPoint" :precision="2" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="沸点(°C)" prop="boilingPoint">
              <el-input-number v-model="form.boilingPoint" :precision="2" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="pH值" prop="phValue">
              <el-input-number v-model="form.phValue" :precision="2" :step="0.1" :min="0" :max="14" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毒性等级" prop="toxicityLevel">
              <el-select v-model="form.toxicityLevel" placeholder="请选择">
                <el-option v-for="dict in chemistry_toxicity_level" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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

<script setup name="Substance">
import { listSubstance, getSubstance, addSubstance, updateSubstance, delSubstance, exportSubstance } from '@/api/chemistry/substance'
import { formatFormula, CHEMISTRY_DICT } from '@/utils/chemistry'
import { Search, Refresh, Plus, Edit, Delete, Download, View } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

// 获取系统字典
const { chemistry_toxicity_level } = proxy.useDict('chemistry_toxicity_level')

const substanceList = ref([])
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
  nameZh: null,
  formula: null,
  substanceType: null,
  compoundType: null
})

const form = ref({})

const rules = {
  nameZh: [
    { required: true, message: '中文名称不能为空', trigger: 'blur' }
  ],
  formula: [
    { required: true, message: '化学式不能为空', trigger: 'blur' },
    { max: 50, message: '最多50个字符', trigger: 'blur' }
  ]
}

// 物质类型选项
const substanceTypeOptions = ref([
  { label: '单质', value: 'element', elTagType: '' },
  { label: '化合物', value: 'compound', elTagType: 'success' }
])

// 化合物类型选项
const compoundTypeOptions = ref([
  { label: '无机物', value: 'inorganic', elTagType: '' },
  { label: '有机物', value: 'organic', elTagType: 'success' }
])

/** 获取状态标签类型 */
function getStateTagType(state) {
  const typeMap = {
    solid: '',
    liquid: 'warning',
    gas: 'info'
  }
  return typeMap[state] || ''
}

/** 获取状态标签 */
function getStateLabel(state) {
  const labelMap = {
    solid: '固态',
    liquid: '液态',
    gas: '气态'
  }
  return labelMap[state] || state || '-'
}

/** 查询物质库列表 */
function getList() {
  loading.value = true
  listSubstance(queryParams.value).then(response => {
    substanceList.value = response.rows
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
    nameZh: null,
    nameEn: null,
    formula: null,
    substanceType: null,
    compoundType: null,
    molarMass: null,
    stateAtStp: null,
    color: null,
    density: null,
    meltingPoint: null,
    boilingPoint: null,
    phValue: null,
    toxicityLevel: null
  }
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
  title.value = '添加物质库'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value[0]
  getSubstance(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改物质库'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateSubstance(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addSubstance(form.value).then(() => {
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
  proxy.$modal.confirm('是否确认删除物质库编号为"' + deleteIds + '"的数据项？').then(() => {
    return delSubstance(deleteIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('chemistry/substance/export', {
    ...queryParams.value
  }, `substance_${new Date().getTime()}.xlsx`)
}

/** 查看详情 */
function handleView(row) {
  const id = row.id
  getSubstance(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '物质详情'
  })
}

getList()
</script>
