<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="方程式" prop="equationId">
           <el-select v-model="queryParams.equationId" placeholder="请选择" clearable style="width: 120px">
                  <el-option
                    v-for="equation in equationList"
                    :key="equation.id"
                    :label="equation.equationText"
                    :value="equation.id"
                  ></el-option>
                </el-select>
      </el-form-item>
      <el-form-item label="描述类型" prop="narrativeType">
        <el-select v-model="queryParams.narrativeType" placeholder="请选择" clearable style="width: 120px">
          <el-option v-for="dict in chemistry_narrative_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-button type="primary" :icon="Plus" v-hasPermi="['chemistry:narrative:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :icon="Edit" :disabled="single" v-hasPermi="['chemistry:narrative:edit']" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :icon="Delete" :disabled="multiple" v-hasPermi="['chemistry:narrative:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" :icon="Download" v-hasPermi="['chemistry:narrative:export']" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="narrativeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <!-- <el-table-column label="ID" align="center" prop="id" width="60" /> -->
      <!-- <el-table-column label="方程式ID" align="center" prop="equationId" width="90" /> -->
      <el-table-column label="方程" align="center" prop="equationName" />
      <el-table-column label="描述类型" align="center" prop="narrativeType" width="90">
        <template #default="scope">
          <dict-tag :options="chemistry_narrative_type" :value="scope.row.narrativeType" />
        </template>
      </el-table-column>
      <el-table-column label="过程描述" align="center" prop="processDescription" min-width="300" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button plain type="primary" @click="handleView(scope.row)" v-hasPermi="['chemistry:narrative:query']">详情</el-button>
          <el-button plain type="success" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['chemistry:narrative:edit']">修改</el-button>
          <el-button plain type="danger" @click="handleDelete(scope.row)" v-hasPermi="['chemistry:narrative:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/修改对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属方程式" prop="equationId">
              <!-- <el-input-number v-model="form.equationId" :min="1" controls-position="right" style="width: 100%" /> -->
               <el-select v-model="form.equationId" placeholder="请选择方程式" clearable >
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
            <el-form-item label="描述类型" prop="narrativeType">
              <el-select v-model="form.narrativeType" placeholder="请选择">
                <el-option v-for="dict in chemistry_narrative_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="过程描述" prop="processDescription">
              <el-input v-model="form.processDescription" type="textarea" :rows="4" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="分步描述(JSON)">
              <el-input v-model="stepByStepStr" type="textarea" :rows="5" placeholder='[{"step": 1, "action": "取少量硫酸铜溶液于试管中", "observation": "溶液呈蓝色"}]' />
              <div class="text-gray text-xs mt-1">JSON数组格式，每步包含step(步骤号)、action(操作)、observation(观察)</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="常见问题(JSON)">
              <el-input v-model="commonQuestionsStr" type="textarea" :rows="4" placeholder='[{"question": "为什么溶液颜色会变化？", "answer": "因为蓝色的Cu²⁺逐渐被消耗..."}]' />
              <div class="text-gray text-xs mt-1">JSON数组格式，每项包含question(问题)、answer(答案)</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="常见错误(JSON)">
              <el-input v-model="commonMistakesStr" type="textarea" :rows="4" placeholder='[{"mistake": "铁钉未除锈", "consequence": "可能影响反应速率"}]' />
              <div class="text-gray text-xs mt-1">JSON数组格式，每项包含mistake(错误)、consequence(后果)</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="关键点(JSON)">
              <el-input v-model="keyPointsStr" type="textarea" :rows="2" placeholder='["铁钉要洁净", "观察要及时"]' />
              <div class="text-gray text-xs mt-1">JSON数组格式，字符串数组</div>
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

<script setup name="Narrative">
import { listNarrative, getNarrative, addNarrative, updateNarrative, delNarrative, exportNarrative } from '@/api/chemistry/reactionNarrative'
import { formatJsonData } from '@/utils/chemistry'
import { Search, Refresh, Plus, Edit, Delete, Download, View } from '@element-plus/icons-vue'


// 方程式列表接口
import { listEquation } from '@/api/chemistry/equation'
const { proxy } = getCurrentInstance()

// 获取系统字典
const { chemistry_narrative_type } = proxy.useDict('chemistry_narrative_type')

const narrativeList = ref([])
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
  narrativeType: null
})

const form = ref({})
const stepByStepStr = ref('')
const commonQuestionsStr = ref('')
const commonMistakesStr = ref('')
const keyPointsStr = ref('')

const rules = {
  equationId: [
    { required: true, message: '所属方程式不能为空', trigger: 'blur' }
  ],
  narrativeType: [
    { required: true, message: '描述类型不能为空', trigger: 'change' }
  ],
  processDescription: [
    { required: true, message: '过程描述不能为空', trigger: 'blur' }
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

/** 查询反应描述列表 */
function getList() {
  loading.value = true
  listNarrative(queryParams.value).then(response => {
    console.log('反应描述API响应:', response)
    narrativeList.value = response.rows || []
    total.value = response.total || 0
    loading.value = false
  }).catch(error => {
    console.error('查询反应描述失败:', error)
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
    equationId: null,
    narrativeType: null,
    processDescription: null,
    stepByStep: null,
    commonQuestions: null,
    commonMistakes: null,
    keyPoints: null
  }
  stepByStepStr.value = ''
  commonQuestionsStr.value = ''
  commonMistakesStr.value = ''
  keyPointsStr.value = ''
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
  title.value = '添加反应描述'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value[0]
  getNarrative(id).then(response => {
    form.value = response.data
    stepByStepStr.value = formatJsonData(form.value.stepByStep)
    commonQuestionsStr.value = formatJsonData(form.value.commonQuestions)
    commonMistakesStr.value = formatJsonData(form.value.commonMistakes)
    keyPointsStr.value = formatJsonData(form.value.keyPoints)
    open.value = true
    title.value = '修改反应描述'
  })
}

/** 提交按钮 */
function submitForm() {
  // 处理JSON字符串
  try {
    if (stepByStepStr.value) {
      form.value.stepByStep = JSON.parse(stepByStepStr.value)
    }
    if (commonQuestionsStr.value) {
      form.value.commonQuestions = JSON.parse(commonQuestionsStr.value)
    }
    if (commonMistakesStr.value) {
      form.value.commonMistakes = JSON.parse(commonMistakesStr.value)
    }
    if (keyPointsStr.value) {
      form.value.keyPoints = JSON.parse(keyPointsStr.value)
    }
  } catch (e) {
    proxy.$modal.msgError('JSON格式不正确，请检查')
    return
  }

  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateNarrative(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addNarrative(form.value).then(() => {
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
  proxy.$modal.confirm('是否确认删除反应描述编号为"' + deleteIds + '"的数据项？').then(() => {
    return delNarrative(deleteIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('chemistry/reactionNarrative/export', {
    ...queryParams.value
  }, `narrative_${new Date().getTime()}.xlsx`)
}

/** 查看详情 */
function handleView(row) {
  const id = row.id
  getNarrative(id).then(response => {
    form.value = response.data
    stepByStepStr.value = formatJsonData(form.value.stepByStep)
    commonQuestionsStr.value = formatJsonData(form.value.commonQuestions)
    commonMistakesStr.value = formatJsonData(form.value.commonMistakes)
    keyPointsStr.value = formatJsonData(form.value.keyPoints)
    open.value = true
    title.value = '反应描述详情'
  })
}

getList()
</script>
