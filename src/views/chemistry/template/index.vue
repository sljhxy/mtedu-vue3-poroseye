<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="实验名称" prop="nameZh">
        <el-input v-model="queryParams.nameZh" placeholder="请输入实验名称" clearable style="width: 150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="实验代码" prop="experimentCode">
        <el-input v-model="queryParams.experimentCode" placeholder="请输入实验代码" clearable style="width: 150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="难度等级" prop="difficultyLevel">
        <el-select v-model="queryParams.difficultyLevel" placeholder="请选择" clearable style="width: 120px">
          <el-option v-for="(label, value) in difficultyLevelOptions" :key="value" :label="label" :value="value" />
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
        <el-button type="primary" :icon="Plus" v-hasPermi="['chemistry:template:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :icon="Edit" :disabled="single" v-hasPermi="['chemistry:template:edit']" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :icon="Delete" :disabled="multiple" v-hasPermi="['chemistry:template:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" :icon="Download" v-hasPermi="['chemistry:template:export']" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <!-- <el-table-column label="ID" align="center" prop="id" width="70" /> -->
      <el-table-column label="实验名称" align="center" prop="nameZh" min-width="150" show-overflow-tooltip />
      <el-table-column label="实验代码" align="center" prop="experimentCode" width="150" />
      <el-table-column label="分类" align="center" prop="category" width="100" />
      <el-table-column label="难度" align="center" prop="difficultyLevel" width="90">
        <template #default="scope">
          <el-tag :type="getDifficultyTagType(scope.row.difficultyLevel)" size="small">{{ getDifficultyLabel(scope.row.difficultyLevel) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时长(分钟)" align="center" prop="duration" width="100" />
      <el-table-column label="状态" align="center" prop="isPublished" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.isPublished ? 'success' : 'warning'" size="small">{{ scope.row.isPublished ? '已发布' : '未发布' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button plain type="primary" @click="handleView(scope.row)" v-hasPermi="['chemistry:template:query']">详情</el-button>
          <el-button plain type="success" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['chemistry:template:edit']">修改</el-button>
          <el-button plain type="danger" @click="handleDelete(scope.row)" v-hasPermi="['chemistry:template:remove']">删除</el-button>
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
            <el-form-item label="实验中文名称" prop="nameZh">
              <el-input v-model="form.nameZh" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实验英文名称" prop="nameEn">
              <el-input v-model="form.nameEn" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="实验代码" prop="experimentCode">
              <el-input v-model="form.experimentCode" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="科目" prop="subject">
              <el-input v-model="form.subject" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="实验分类" prop="category">
              <el-input v-model="form.category" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度等级" prop="difficultyLevel">
              <el-select v-model="form.difficultyLevel" placeholder="请选择">
                <el-option v-for="(label, value) in difficultyLevelOptions" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="预计时长(分钟)" prop="duration">
              <el-input-number v-model="form.duration" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否发布" prop="isPublished">
              <el-switch v-model="form.isPublished" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="实验目标" prop="objective">
              <el-input v-model="form.objective" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="实验原理" prop="principle">
              <el-input v-model="form.principle" type="textarea" :rows="4" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="所需器材" prop="requiredEquipment">
              <el-select v-model="form.requiredEquipment" multiple placeholder="请选择器材" style="width: 100%">
                <el-option v-for="item in equipmentList" :key="item.id" :label="item.nameZh" :value="item.code" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="安全注意事项" prop="safetyPrecautions">
              <el-input v-model="form.safetyPrecautions" type="textarea" :rows="3" />
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

<script setup name="Template">
import { listTemplate, getTemplate, addTemplate, updateTemplate, delTemplate, exportTemplate } from '@/api/chemistry/template'
import { listEquipment } from '@/api/chemistry/equipment'
import { CHEMISTRY_DICT } from '@/utils/chemistry'
import { Search, Refresh, Plus, Edit, Delete, Download, View } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const templateList = ref([])
const equipmentList = ref([])
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
  experimentCode: null,
  difficultyLevel: null
})

const form = ref({})

const rules = {
  nameZh: [
    { required: true, message: '实验名称不能为空', trigger: 'blur' }
  ],
  experimentCode: [
    { required: true, message: '实验代码不能为空', trigger: 'blur' },
    { max: 50, message: '最多50个字符', trigger: 'blur' }
  ]
}

// 难度等级选项
const difficultyLevelOptions = ref({
  elementary: '小学',
  easy: '简单',
  medium: '中等',
  hard: '困难',
  advanced: '高级'
})

/** 获取难度标签类型 */
function getDifficultyTagType(level) {
  const typeMap = {
    elementary: 'success',
    easy: 'success',
    medium: 'warning',
    hard: 'danger',
    advanced: 'danger'
  }
  return typeMap[level] || ''
}

/** 获取难度标签 */
function getDifficultyLabel(level) {
  return difficultyLevelOptions.value[level] || level
}

/** 获取器材列表 */
function getEquipmentOptions() {
  listEquipment({ pageNum: 1, pageSize: 1000 }).then(response => {
    equipmentList.value = response.rows || []
  })
}

/** 查询实验模板列表 */
function getList() {
  loading.value = true
  listTemplate(queryParams.value).then(response => {
    templateList.value = response.rows
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
    experimentCode: null,
    subject: 'chemistry',
    category: null,
    difficultyLevel: null,
    duration: null,
    objective: null,
    principle: null,
    requiredEquipment: [],
    safetyPrecautions: null,
    isPublished: false
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
  title.value = '添加实验模板'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value[0]
  getTemplate(id).then(response => {
    form.value = response.data
    // 处理器材数组
    if (typeof form.value.requiredEquipment === 'string') {
      try {
        form.value.requiredEquipment = JSON.parse(form.value.requiredEquipment)
      } catch {
        form.value.requiredEquipment = []
      }
    }
    open.value = true
    title.value = '修改实验模板'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      const submitData = { ...form.value }
      // 处理器材数组转为JSON字符串
      if (Array.isArray(submitData.requiredEquipment)) {
        submitData.requiredEquipment = JSON.stringify(submitData.requiredEquipment)
      }
      if (submitData.id != null) {
        updateTemplate(submitData).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addTemplate(submitData).then(() => {
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
  proxy.$modal.confirm('是否确认删除实验模板编号为"' + deleteIds + '"的数据项？').then(() => {
    return delTemplate(deleteIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('chemistry/template/export', {
    ...queryParams.value
  }, `template_${new Date().getTime()}.xlsx`)
}

/** 查看详情 */
function handleView(row) {
  const id = row.id
  getTemplate(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '实验模板详情'
  })
}

// 初始化
getEquipmentOptions()
getList()
</script>
