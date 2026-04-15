<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="主反应" prop="mainEquationId" >
        <el-select v-model="queryParams.mainEquationId" placeholder="请选择" clearable style="width: 120px">
                  <el-option
                    v-for="equation in equationList"
                    :key="equation.id"
                    :label="equation.equationText"
                    :value="equation.id"
                  ></el-option>
                </el-select>
      </el-form-item>
      <el-form-item label="副反应" prop="secondaryEquationId">
         <el-select v-model="queryParams.secondaryEquationId" placeholder="请选择" clearable style="width: 120px">
                  <el-option
                    v-for="equation in equationList"
                    :key="equation.id"
                    :label="equation.equationText"
                    :value="equation.id"
                  ></el-option>
              </el-select>

      </el-form-item>
      <el-form-item label="反应类型" prop="reactionType">
        <el-select v-model="queryParams.reactionType" placeholder="请选择" clearable style="width: 120px">
          <el-option v-for="dict in chemistry_secondary_reaction_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-button type="primary" :icon="Plus" v-hasPermi="['chemistry:secondary:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :icon="Edit" :disabled="single" v-hasPermi="['chemistry:secondary:edit']" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :icon="Delete" :disabled="multiple" v-hasPermi="['chemistry:secondary:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" :icon="Download" v-hasPermi="['chemistry:secondary:export']" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="reactionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <!-- <el-table-column label="ID" align="center" prop="id" width="60" /> -->
      <!-- <el-table-column label="主反应ID" align="center" prop="mainEquationId" width="90" /> -->
      <el-table-column label="主反应方程式" align="center" prop="mainEquationName" />
      <!-- <el-table-column label="副反应ID" align="center" prop="secondaryEquationId" min-width="100" /> -->
      <el-table-column label="副反应方程式" align="center" prop="secondaryEquationName" min-width="100" />
      <el-table-column label="反应类型" align="center" prop="reactionType" width="90">
        <template #default="scope">
          <dict-tag :options="chemistry_secondary_reaction_type" :value="scope.row.reactionType" />
        </template>
      </el-table-column>
      <el-table-column label="关系" align="center" prop="relationship" width="80">
        <template #default="scope">
          <dict-tag :options="chemistry_reaction_relationship" :value="scope.row.relationship" />
        </template>
      </el-table-column>
      <el-table-column label="触发概率" align="center" prop="triggerProbability" width="90">
        <template #default="scope">
          {{ scope.row.triggerProbability ? (scope.row.triggerProbability * 100).toFixed(1) + '%' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="学生易错" align="center" prop="isCommonStudentError" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.isCommonStudentError ? 'danger' : 'info'" size="small">{{ scope.row.isCommonStudentError ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button plain type="primary" @click="handleView(scope.row)" v-hasPermi="['chemistry:secondary:query']">详情</el-button>
          <el-button plain type="success" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['chemistry:secondary:edit']">修改</el-button>
          <el-button plain type="danger" @click="handleDelete(scope.row)" v-hasPermi="['chemistry:secondary:remove']">删除</el-button>
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
            <el-form-item label="主反应方程式" prop="mainEquationId">
               <el-select v-model="form.mainEquationId" placeholder="请选择主反应方程式" clearable>
                  <el-option
                    v-for="equation in equationList"
                    :key="equation.id"
                    :label="equation.equationText"
                    :value="equation.id"
                  ></el-option>
                </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副反应方程式ID" prop="secondaryEquationId">
               <el-select v-model="form.secondaryEquationId" placeholder="请选择副反应方程式" clearable>
                  <el-option
                    v-for="equation in equationList"
                    :key="equation.id"
                    :label="equation.equationText"
                    :value="equation.id"
                  ></el-option>
                </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="反应类型" prop="reactionType">
              <el-select v-model="form.reactionType" placeholder="请选择">
                <el-option v-for="dict in chemistry_secondary_reaction_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="与主反应关系" prop="relationship">
              <el-select v-model="form.relationship" placeholder="请选择">
                <el-option v-for="dict in chemistry_reaction_relationship" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="触发概率" prop="triggerProbability">
              <el-input-number v-model="form.triggerProbability" :min="0" :max="1" :step="0.001" :precision="3" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否学生常见错误" prop="isCommonStudentError">
              <el-switch v-model="form.isCommonStudentError" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="触发条件(JSON)" prop="triggerCondition">
              <el-input v-model="triggerConditionStr" type="textarea" :rows="3" placeholder='{"temperature_range": [50, 80], "oxygenPresent": true}' />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="现象影响(JSON)" prop="phenomenonImpact">
              <el-input v-model="phenomenonImpactStr" type="textarea" :rows="3" placeholder='{"colorMask": "溶液可能变黄"}' />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="教学说明" prop="teachingNote">
              <el-input v-model="form.teachingNote" type="textarea" :rows="3" />
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

<script setup name="SecondaryReaction">
import { listSecondaryReaction, getSecondaryReaction, addSecondaryReaction, updateSecondaryReaction, delSecondaryReaction, exportSecondaryReaction } from '@/api/chemistry/secondaryReaction'
import { formatJsonData } from '@/utils/chemistry'
import { Search, Refresh, Plus, Edit, Delete, Download, View } from '@element-plus/icons-vue'


// 方程式列表接口
import { listEquation } from '@/api/chemistry/equation'

const { proxy } = getCurrentInstance()

// 获取系统字典
const { chemistry_secondary_reaction_type, chemistry_reaction_relationship } = proxy.useDict('chemistry_secondary_reaction_type', 'chemistry_reaction_relationship')

const reactionList = ref([])
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
  mainEquationId: null,
  secondaryEquationId: null,
  reactionType: null
})

const form = ref({})
const triggerConditionStr = ref('')
const phenomenonImpactStr = ref('')

const rules = {
  mainEquationId: [
    { required: true, message: '主反应不能为空', trigger: 'blur' }
  ],
  secondaryEquationId: [
    { required: true, message: '副反应不能为空', trigger: 'blur' }
  ]
}

/** 查询化学方程式列表 */
const equationList = ref([])

const equationQueryParams = ref({
  pageNum: 1,
  pageSize: 9999
})
function getEquationList() {
  listEquation(equationQueryParams.value).then(response => {
    equationList.value = response.rows
  })
}

getEquationList()

/** 查询副反应列表 */
function getList() {
  loading.value = true
  listSecondaryReaction(queryParams.value).then(response => {
    console.log('副反应API响应:', response)
    reactionList.value = response.rows || []
    total.value = response.total || 0
    loading.value = false
  }).catch(error => {
    console.error('查询副反应失败:', error)
    proxy.$modal.msgError('查询失败：' + (error.message || '未知错误'))
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
    mainEquationId: null,
    secondaryEquationId: null,
    reactionType: null,
    relationship: null,
    triggerProbability: null,
    triggerCondition: null,
    phenomenonImpact: null,
    teachingNote: null,
    isCommonStudentError: false
  }
  triggerConditionStr.value = ''
  phenomenonImpactStr.value = ''
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
  getEquationList()
  open.value = true
  title.value = '添加副反应'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  getEquationList()
  const id = row.id || ids.value[0]
  getSecondaryReaction(id).then(response => {
    form.value = response.data
    // 处理JSON字段
    triggerConditionStr.value = formatJsonData(form.value.triggerCondition)
    phenomenonImpactStr.value = formatJsonData(form.value.phenomenonImpact)
    open.value = true
    title.value = '修改副反应'
  })
}

/** 提交按钮 */
function submitForm() {
  // 处理JSON字符串
  try {
    if (triggerConditionStr.value) {
      form.value.triggerCondition = JSON.parse(triggerConditionStr.value)
    }
    if (phenomenonImpactStr.value) {
      form.value.phenomenonImpact = JSON.parse(phenomenonImpactStr.value)
    }
  } catch (e) {
    proxy.$modal.msgError('JSON格式不正确，请检查')
    return
  }

  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateSecondaryReaction(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addSecondaryReaction(form.value).then(() => {
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
  proxy.$modal.confirm('是否确认删除副反应编号为"' + deleteIds + '"的数据项？').then(() => {
    return delSecondaryReaction(deleteIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('chemistry/secondaryReaction/export', {
    ...queryParams.value
  }, `secondary_${new Date().getTime()}.xlsx`)
}

/** 查看详情 */
function handleView(row) {
  const id = row.id
  getSecondaryReaction(id).then(response => {
    form.value = response.data
    triggerConditionStr.value = formatJsonData(form.value.triggerCondition)
    phenomenonImpactStr.value = formatJsonData(form.value.phenomenonImpact)
    open.value = true
    title.value = '副反应详情'
  })
}

getList()
</script>
