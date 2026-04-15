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
      <el-form-item label="阶段名称" prop="stageName">
        <el-input v-model="queryParams.stageName" placeholder="请输入阶段名称" clearable style="width: 150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="阶段类型" prop="stageType">
        <el-select v-model="queryParams.stageType" placeholder="请选择" clearable style="width: 120px">
          <el-option v-for="dict in chemistry_stage_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-button type="primary" :icon="Plus" v-hasPermi="['chemistry:stage:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :icon="Edit" :disabled="single" v-hasPermi="['chemistry:stage:edit']" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :icon="Delete" :disabled="multiple" v-hasPermi="['chemistry:stage:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" :icon="Download" v-hasPermi="['chemistry:stage:export']" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="stageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <!-- <el-table-column label="ID" align="center" prop="id" width="70" /> -->
      <el-table-column label="方程式" align="center" prop="equationName" />
      <el-table-column label="阶段顺序" align="center" prop="stageOrder" width="90" />
      <el-table-column label="阶段名称" align="center" prop="stageName" width="120" />
      <el-table-column label="阶段类型" align="center" prop="stageType" width="100">
        <template #default="scope">
          <dict-tag :options="chemistry_stage_type" :value="scope.row.stageType" />
        </template>
      </el-table-column>
      <el-table-column label="预计时间" align="center" prop="durationEstimate" width="100" />
      <el-table-column label="现象描述" align="center" prop="phenomenaDescription" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button plain type="primary" @click="handleView(scope.row)" v-hasPermi="['chemistry:stage:query']">详情</el-button>
          <el-button plain type="success" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['chemistry:stage:edit']">修改</el-button>
          <el-button plain type="danger" @click="handleDelete(scope.row)" v-hasPermi="['chemistry:stage:remove']">删除</el-button>
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
            <el-form-item label="所属方程式" prop="equationId">
              <!-- <el-input-number v-model="form.equationId" :min="1" controls-position="right" style="width: 100%" /> -->
               <el-select v-model="form.equationId" placeholder="请选择所属方程式" clearable>
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
            <el-form-item label="阶段顺序" prop="stageOrder">
              <el-input-number v-model="form.stageOrder" :min="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="阶段名称" prop="stageName">
              <el-input v-model="form.stageName" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="阶段类型" prop="stageType">
              <el-select v-model="form.stageType" placeholder="请选择">
                <el-option v-for="dict in chemistry_stage_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="预计持续时间" prop="durationEstimate">
              <el-input v-model="form.durationEstimate" placeholder="如: 5-10秒、1-2分钟" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="现象描述" prop="phenomenaDescription">
              <el-input v-model="form.phenomenaDescription" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="微观解释" prop="microscopicExplanation">
              <el-input v-model="form.microscopicExplanation" type="textarea" :rows="4" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="观察要点" prop="observationPoints">
              <el-input v-model="observationPointsStr" type="textarea" :rows="3" placeholder='每行一个观察要点，如: ["观察溶液颜色", "注意铁钉表面变化"]' />
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

<script setup name="ReactionStage">
import { listReactionStage, getReactionStage, addReactionStage, updateReactionStage, delReactionStage, exportReactionStage } from '@/api/chemistry/reactionStage'
import { Search, Refresh, Plus, Edit, Delete, Download, View } from '@element-plus/icons-vue'

// 方程式列表接口
import { listEquation } from '@/api/chemistry/equation'
const { proxy } = getCurrentInstance()

// 获取系统字典
const { chemistry_stage_type } = proxy.useDict('chemistry_stage_type')

const stageList = ref([])
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
  stageName: null,
  stageType: null
})


const form = ref({})
const observationPointsStr = ref('')

const rules = {
  equationId: [
    { required: true, message: '所属方程式不能为空', trigger: 'blur' }
  ],
  stageOrder: [
    { required: true, message: '阶段顺序不能为空', trigger: 'blur' }
  ],
  stageName: [
    { required: true, message: '阶段名称不能为空', trigger: 'blur' }
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

/** 查询反应阶段列表 */
function getList() {
  loading.value = true
  listReactionStage(queryParams.value).then(response => {
    console.log('反应阶段API响应:', response)
    stageList.value = response.rows || []
    total.value = response.total || 0
    loading.value = false
  }).catch(error => {
    console.error('查询反应阶段失败:', error)
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
    stageOrder: null,
    stageName: null,
    stageType: null,
    durationEstimate: null,
    phenomenaDescription: null,
    microscopicExplanation: null,
    observationPoints: null
  }
  observationPointsStr.value = ''
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
  //获取方程式列表
  getEquationList()
  open.value = true
  title.value = '添加反应阶段'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  //获取方程式列表
  getEquationList()
  const id = row.id || ids.value[0]
  getReactionStage(id).then(response => {
    form.value = response.data
    // 处理观察要点数组
    if (Array.isArray(form.value.observationPoints)) {
      observationPointsStr.value = form.value.observationPoints.join('\n')
    } else {
      observationPointsStr.value = ''
    }
    open.value = true
    title.value = '修改反应阶段'
  })
}

/** 提交按钮 */
function submitForm() {
  // 处理观察要点字符串转数组
  if (observationPointsStr.value) {
    form.value.observationPoints = observationPointsStr.value.split('\n').filter(item => item.trim())
  } else {
    form.value.observationPoints = []
  }

  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateReactionStage(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addReactionStage(form.value).then(() => {
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
  proxy.$modal.confirm('是否确认删除反应阶段编号为"' + deleteIds + '"的数据项？').then(() => {
    return delReactionStage(deleteIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('chemistry/reactionStage/export', {
    ...queryParams.value
  }, `stage_${new Date().getTime()}.xlsx`)
}

/** 查看详情 */
function handleView(row) {
  const id = row.id
  getReactionStage(id).then(response => {
    form.value = response.data
    if (Array.isArray(form.value.observationPoints)) {
      observationPointsStr.value = form.value.observationPoints.join('\n')
    }
    open.value = true
    title.value = '反应阶段详情'
  })
}

getList()
</script>
