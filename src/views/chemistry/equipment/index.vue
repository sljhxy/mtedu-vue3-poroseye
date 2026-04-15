<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="器材名称" prop="nameZh">
        <el-input v-model="queryParams.nameZh" placeholder="请输入器材名称" clearable style="width: 150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="器材编码" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入器材编码" clearable style="width: 120px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类别" prop="category">
        <el-select v-model="queryParams.category" placeholder="请选择" clearable style="width: 120px">
          <el-option v-for="(label, value) in equipmentCategoryOptions" :key="value" :label="label" :value="value" />
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
        <el-button type="primary" :icon="Plus" v-hasPermi="['chemistry:equipment:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :icon="Edit" :disabled="single" v-hasPermi="['chemistry:equipment:edit']" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :icon="Delete" :disabled="multiple" v-hasPermi="['chemistry:equipment:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" :icon="Download" v-hasPermi="['chemistry:equipment:export']" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="equipmentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="名称" align="center" prop="nameZh" width="100" />
      <el-table-column label="英文名" align="center" prop="nameEn" min-width="100" show-overflow-tooltip />
      <el-table-column label="编码" align="center" prop="code" width="90" />
      <el-table-column label="类别" align="center" prop="category" width="90">
        <template #default="scope">
          <dict-tag :options="equipmentCategoryOptions" :value="scope.row.category" />
        </template>
      </el-table-column>
      <el-table-column label="规格" align="center" prop="specification" width="90" />
      <el-table-column label="容量" align="center" prop="capacity" width="70" />
      <el-table-column label="材质" align="center" prop="material" width="70" />
      <el-table-column label="耐热" align="center" prop="isHeatResistant" width="60">
        <template #default="scope">
          <el-tag :type="scope.row.isHeatResistant ? 'success' : 'info'">{{ scope.row.isHeatResistant ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="有刻度" align="center" prop="hasGraduation" width="70">
        <template #default="scope">
          <el-tag :type="scope.row.hasGraduation ? 'success' : 'info'">{{ scope.row.hasGraduation ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button plain type="primary" @click="handleView(scope.row)" v-hasPermi="['chemistry:equipment:query']">详情</el-button>
          <el-button plain type="success" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['chemistry:equipment:edit']">修改</el-button>
          <el-button plain type="danger" @click="handleDelete(scope.row)" v-hasPermi="['chemistry:equipment:remove']">删除</el-button>
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
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
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
            <el-form-item label="器材编码" prop="code">
              <el-input v-model="form.code" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类别" prop="category">
              <el-select v-model="form.category" placeholder="请选择">
                <el-option v-for="(label, value) in equipmentCategoryOptions" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="规格" prop="specification">
              <el-input v-model="form.specification" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容量" prop="capacity">
              <el-input v-model="form.capacity" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="材质" prop="material">
              <el-input v-model="form.material" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否耐热" prop="isHeatResistant">
              <el-switch v-model="form.isHeatResistant" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否有刻度" prop="hasGraduation">
              <el-switch v-model="form.hasGraduation" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="主要用途" prop="primaryUse">
              <el-input v-model="form.primaryUse" type="textarea" :rows="2" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="使用注意事项" prop="usagePrecautions">
              <el-input v-model="form.usagePrecautions" type="textarea" :rows="3" maxlength="500" />
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

<script setup name="Equipment">
import { listEquipment, getEquipment, addEquipment, updateEquipment, delEquipment, exportEquipment } from '@/api/chemistry/equipment'
import { CHEMISTRY_DICT } from '@/utils/chemistry'
import { Search, Refresh, Plus, Edit, Delete, Download, View } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

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
  code: null,
  category: null
})

const form = ref({})

const rules = {
  nameZh: [
    { required: true, message: '器材名称不能为空', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '器材编码不能为空', trigger: 'blur' },
    { max: 50, message: '最多50个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '类别不能为空', trigger: 'change' }
  ]
}

// 器材类别选项
const equipmentCategoryOptions = ref([
  { label: '容器类', value: 'container', elTagType: '' },
  { label: '加热类', value: 'heating', elTagType: 'danger' },
  { label: '夹持类', value: 'holding', elTagType: 'warning' },
  { label: '测量类', value: 'measuring', elTagType: 'success' },
  { label: '分离类', value: 'filtration', elTagType: 'info' },
  { label: '其他', value: 'other', elTagType: '' }
])

/** 查询实验器材列表 */
function getList() {
  loading.value = true
  listEquipment(queryParams.value).then(response => {
    equipmentList.value = response.rows
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
    code: null,
    category: null,
    specification: null,
    capacity: null,
    material: null,
    isHeatResistant: false,
    hasGraduation: false,
    primaryUse: null,
    usagePrecautions: null
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
  title.value = '添加实验器材'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value[0]
  getEquipment(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改实验器材'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateEquipment(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addEquipment(form.value).then(() => {
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
  proxy.$modal.confirm('是否确认删除实验器材编号为"' + deleteIds + '"的数据项？').then(() => {
    return delEquipment(deleteIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('chemistry/equipment/export', {
    ...queryParams.value
  }, `equipment_${new Date().getTime()}.xlsx`)
}

/** 查看详情 */
function handleView(row) {
  const id = row.id
  getEquipment(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '器材详情'
  })
}

getList()
</script>
