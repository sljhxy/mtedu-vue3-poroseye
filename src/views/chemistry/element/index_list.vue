<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="原子序数" prop="atomicNumber">
        <el-input v-model="queryParams.atomicNumber" placeholder="请输入原子序数" clearable style="width: 120px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="元素符号" prop="symbol">
        <el-input v-model="queryParams.symbol" placeholder="请输入元素符号" clearable style="width: 120px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="中文名" prop="nameZh">
        <el-input v-model="queryParams.nameZh" placeholder="请输入中文名称" clearable style="width: 150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="元素分类" prop="category">
        <el-select v-model="queryParams.category" placeholder="请选择" clearable style="width: 120px">
          <el-option v-for="(label, value) in elementCategoryOptions" :key="value" :label="label" :value="value" />
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
        <el-button type="primary" :icon="Plus" v-hasPermi="['chemistry:element:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :icon="Edit" :disabled="single" v-hasPermi="['chemistry:element:edit']" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :icon="Delete" :disabled="multiple" v-hasPermi="['chemistry:element:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" :icon="Download" v-hasPermi="['chemistry:element:export']" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="elementList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <!-- <el-table-column label="ID" align="center" prop="atomicNumber" width="70" /> -->
      <el-table-column label="原子序数" align="center" prop="atomicNumber" width="150" sortable />
      <el-table-column label="符号" align="center" prop="symbol" width="70">
        <template #default="scope">
          <el-tag size="small">{{ scope.row.symbol }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="中文名" align="center" prop="nameZh" width="90" />
      <el-table-column label="英文名" align="center" prop="nameEn" min-width="100" show-overflow-tooltip />
      <el-table-column label="原子量" align="center" prop="atomicMass" width="90" />
      <el-table-column label="分类" align="center" prop="category" width="90">
        <template #default="scope">
          <dict-tag :options="elementCategoryOptions" :value="scope.row.category" />
        </template>
      </el-table-column>
      <el-table-column label="周期" align="center" prop="period" width="60" />
      <el-table-column label="族" align="center" prop="groupNum" width="60" />
      <el-table-column label="区" align="center" prop="block" width="50" />
      <el-table-column label="状态" align="center" prop="stateAtStp" width="70">
        <template #default="scope">
          <el-tag :type="getStateTagType(scope.row.stateAtStp)">{{ getStateLabel(scope.row.stateAtStp) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="颜色" align="center" prop="color" min-width="70" />
      <el-table-column label="色值" align="center" prop="colorCode" width="80">
        <template #default="scope">
          <span v-if="scope.row.colorCode" :style="{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: scope.row.colorCode, border: '1px solid #ddd' }"></span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button plain type="primary" @click="handleView(scope.row)" v-hasPermi="['chemistry:element:query']">详情</el-button>
          <el-button plain type="success" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['chemistry:element:edit']">修改</el-button>
          <el-button plain type="danger" @click="handleDelete(scope.row)" v-hasPermi="['chemistry:element:remove']">删除</el-button>
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="原子序数" prop="atomicNumber">
              <el-input-number v-model="form.atomicNumber" :min="1" :max="118" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="元素符号" prop="symbol">
              <el-input v-model="form.symbol" maxlength="10" />
            </el-form-item>
          </el-col>
        </el-row>
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
            <el-form-item label="相对原子质量" prop="atomicMass">
              <el-input-number v-model="form.atomicMass" :precision="4" :step="0.0001" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="元素分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择">
                <el-option v-for="(label, value) in elementCategoryOptions" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="周期" prop="period">
              <el-input-number v-model="form.period" :min="1" :max="7" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="族" prop="groupNum">
              <el-input-number v-model="form.groupNum" :min="1" :max="18" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="区" prop="block">
              <el-select v-model="form.block" placeholder="请选择">
                <el-option label="s区" value="s" />
                <el-option label="p区" value="p" />
                <el-option label="d区" value="d" />
                <el-option label="f区" value="f" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="电子排布" prop="electronConfiguration">
              <el-input v-model="form.electronConfiguration" placeholder="如: 1s1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价电子数" prop="valenceElectrons">
              <el-input-number v-model="form.valenceElectrons" :min="0" :max="18" controls-position="right" style="width: 100%" />
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
          <el-col :span="12">
            <el-form-item label="电负性" prop="electronegativity">
              <el-input-number v-model="form.electronegativity" :precision="2" :step="0.01" :min="0" :max="4" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="色值" prop="colorCode">
              <el-color-picker v-model="form.colorCode" />
              <el-input v-model="form.colorCode" placeholder="#FFFFFF" maxlength="20" style="width: calc(100% - 50px); margin-left: 10px" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
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
          <el-col :span="8">
            <el-form-item label="密度(g/cm³)" prop="density">
              <el-input-number v-model="form.density" :precision="4" :step="0.0001" controls-position="right" style="width: 100%" />
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

<script setup name="Element">
import { listElement, getElement, addElement, updateElement, delElement, exportElement } from '@/api/chemistry/element'
import { Search, Refresh, Plus, Edit, Delete, Download, View } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const elementList = ref([])
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
  atomicNumber: null,
  symbol: null,
  nameZh: null,
  category: null
})

const form = ref({})

const rules = {
  atomicNumber: [
    { required: true, message: '原子序数不能为空', trigger: 'blur' },
    { type: 'number', min: 1, max: 118, message: '原子序数范围1-118', trigger: 'blur' }
  ],
  symbol: [
    { required: true, message: '元素符号不能为空', trigger: 'blur' },
    { max: 10, message: '最多10个字符', trigger: 'blur' }
  ],
  nameZh: [
    { required: true, message: '中文名称不能为空', trigger: 'blur' }
  ]
}

// 元素分类选项
const elementCategoryOptions = ref([
  { label: '非金属', value: '非金属', elTagType: '' },
  { label: '金属', value: '金属', elTagType: 'success' },
  { label: '稀有气体', value: '稀有气体', elTagType: 'info' },
  { label: '类金属', value: '类金属', elTagType: 'warning' }
])

/** 获取状态标签类型 */
function getStateTagType(state) {
  const typeMap = {
    solid: '',
    liquid: 'warning',
    gas: 'info',
    s: '',
    l: 'warning',
    g: 'info',
    aq: 'primary'
  }
  return typeMap[state] || ''
}

/** 获取状态标签 */
function getStateLabel(state) {
  const labelMap = {
    solid: '固态',
    liquid: '液态',
    gas: '气态',
    s: '固态',
    l: '液态',
    g: '气态',
    aq: '水溶液'
  }
  return labelMap[state] || state
}

/** 查询元素周期表列表 */
function getList() {
  loading.value = true
  listElement(queryParams.value).then(response => {
    elementList.value = response.rows
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
    atomicNumber: null,
    symbol: null,
    nameZh: null,
    nameEn: null,
    atomicMass: null,
    category: null,
    period: null,
    groupNum: null,
    block: null,
    electronConfiguration: null,
    valenceElectrons: null,
    stateAtStp: null,
    color: null,
    electronegativity: null,
    meltingPoint: null,
    boilingPoint: null,
    density: null,
    colorCode: null
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
  ids.value = selection.map(item => item.atomicNumber)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加元素周期表'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const atomicNumber = row.atomicNumber || ids.value[0]
  getElement(atomicNumber).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改元素周期表'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      if (form.value.atomicNumber != null) {
        updateElement(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addElement(form.value).then(() => {
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
  const deleteIds = row.atomicNumber || ids.value.join(',')
  proxy.$modal.confirm('是否确认删除元素周期表编号为"' + deleteIds + '"的数据项？').then(() => {
    return delElement(deleteIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('chemistry/element/export', {
    ...queryParams.value
  }, `element_${new Date().getTime()}.xlsx`)
}

/** 查看详情 */
function handleView(row) {
  const atomicNumber = row.atomicNumber
  getElement(atomicNumber).then(response => {
    form.value = response.data
    open.value = true
    title.value = '元素详情'
  })
}

getList()
</script>
