<template>
  <div class="experiment-list">
    <!-- 搜索区域 -->
    <div v-show="showSearch" class="search-form" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="类型" prop="contentType">
        <el-select v-model="searchForm.contentType" placeholder="请选择" style="width: 100px;" clearable :disabled="isTeacher" @change="schoolTypeChange">
          <el-option
            v-for="dict in mt_school_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学段" prop="periodType">
        <el-select
          ref="stageSelectRef"
          v-model="searchForm.periodType"
          :placeholder="searchForm.contentType ? '请选择' : '请先选择类型'"
          style="width: 150px;"
          clearable
          :disabled="!searchForm.contentType"
          @change="handleStageChange"
        >
          <el-option
            v-for="dict in educationStage"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="教材" prop="bookFilter">
        <el-cascader
          v-model="bookFilter"
          :options="bookTree"
          :props="{ checkStrictly: true, expandTrigger: 'hover' }"
          placeholder="科目 / 教材版本 / 分册"
          clearable
          style="width: 300px"
          :disabled="!searchForm.contentType || !searchForm.periodType"
          @change="handleBookFilterChange"
        />
      </el-form-item>
        <el-form-item label="实验名称">
          <el-input v-model="searchForm.name" placeholder="请输入实验名称" clearable/>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="请选择审核状态"
            style="width: 150px"
            clearable
          >
            <el-option
              v-for="item in mt_experiment_audit_status"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="operation-bar">
      <div class="left-buttons">
        <el-button type="primary"  plain icon="Plus" @click="handleAdd" v-hasPermi="['glxt:experimentInfo:add']">新增</el-button>
      </div>
      <div class="right-buttons">
        <el-button
          plain
          circle
          :icon="showSearch ? 'ArrowUp' : 'ArrowDown'"
          @click="toggleSearch"
        />
        <el-button 
          plain
          circle 
          icon="Refresh" 
          @click="handleRefresh"
        />
      </div>
    </div>

    <!-- 表格 -->
    <div shadow="never">
      <el-table 
        :data="tableData" 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column type="index" label="ID" width="60" prop="id" align="center" />
        <el-table-column label="缩略图" align="center" width="110">
          <template #default="scope">
            <!-- 尺寸跟随默认图真实比例：16:9 → 80×45（默认），4:3 → 60×45 -->
            <image-preview v-if="scope.row.thumbnail" :src="scope.row.thumbnail" :width="scope.row.defaultImage === 2 ? 60 : 80" :height="45" />
            <span v-else style="color: #c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="experimentName" label="实验名称" align="center" show-overflow-tooltip min-width="160" />
        <el-table-column prop="schoolType" label="类型"  align="center" >
          <template #default="scope">
          <dict-tag :options="mt_school_type" :value="scope.row.schoolType"/>
        </template>
        </el-table-column>
        <el-table-column prop="academicStageType" label="学段"  align="center">
          <template #default="scope">
          <dict-tag :options="scope.row.schoolType == '1' ? mt_academic_stage : mt_vocal_education_type" :value="scope.row.academicStageType"/>
        </template>
        </el-table-column>
        <el-table-column label="教材关联" align="center" width="110">
          <template #default="scope">
            <el-tooltip v-if="scope.row.mountCount > 0" :content="scope.row.bookSummary" placement="top" :disabled="!scope.row.bookSummary">
              <el-tag size="small" type="info">{{ scope.row.mountCount }} 个关联</el-tag>
            </el-tooltip>
            <span v-else style="color: #c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核状态" align="center">
          <template #default="scope">
          <dict-tag :options="mt_experiment_audit_status" :value="scope.row.auditStatus"/>
        </template>
        </el-table-column>
        <el-table-column label="操作" width="620" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <!-- <el-button
                type="success"
                plain
                @click="handlePreview(scope.row)"
              >
                <el-icon><View /></el-icon>
                <span>预览</span>
              </el-button> -->
              <!-- 暂时注释掉，不上线 -->
              <el-button
                type="primary"
                plain
                @click="handleClassroom(scope.row)"
                v-hasPermi="['glxt:experimentClassroom:generate']"
              >
                <el-icon><MagicStick /></el-icon>
                <span>AI课堂</span>
              </el-button>
              <el-button
                type="primary"
                color="#6EDC93"
                plain
                @click="handleEdit(scope.row)"
                v-hasPermi="['glxt:experimentInfo:edit']"
              >
                <el-icon><Edit /></el-icon>
                <span>修改</span>
              </el-button>
              <el-button
                type="warning"
                plain
                @click="handleAudit(scope.row)"
                :disabled="scope.row.auditStatus == 2"
                v-hasPermi="['glxt:experimentInfo:edit']"
              >
                <el-icon><Check /></el-icon>
                <span>审核</span>
              </el-button>
              <el-button 
                type="danger" 
                plain
                @click="handleDelete(scope.row)"
                v-hasPermi="['glxt:experimentInfo:remove']"
              >
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:page="searchForm.pageNum"
          v-model:limit="searchForm.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" title="实验审核" width="480px" destroy-on-close>
      <div class="audit-dialog-content">
        <p class="audit-dialog-experiment">{{ auditRow?.experimentName }}</p>
        <el-form label-position="top">
          <el-form-item label="审核结果">
            <el-radio-group v-model="auditForm.status">
              <el-radio :value="2">通过</el-radio>
              <el-radio :value="3">未通过</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核意见">
            <el-input v-model="auditForm.comment" type="textarea" :rows="3" placeholder="请输入审核意见（选填）" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doAudit" :loading="auditSubmitting">确认审核</el-button>
      </template>
    </el-dialog>

    <!-- AI课堂多内容列表(全屏弹窗,2026-08-28 多内容改版) -->
    <el-dialog
      v-model="classroomVisible"
      :title="`AI课堂内容 — ${classroomRow?.experimentName || ''}`"
      fullscreen
      destroy-on-close
      append-to-body
    >
      <ExperimentClassroomList
        v-if="classroomVisible && classroomRow"
        :experiment-id="classroomRow.id"
        :experiment-name="classroomRow.experimentName"
        :school-type="classroomRow.schoolType"
        :academic-stage-type="classroomRow.academicStageType"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
//导入实验信息API
import { listExperimentInfo, delExperimentInfo, toExamine } from '@/api/glxt/experimentInfo'
// 复用课程页的「科目/教材版本/分册」级联树接口
import { getCourseSystemOptions } from '@/api/glxt/subject'
import { useTeacherInfo } from '@/store/modules/teacherInfo'
import ExperimentClassroomList from './components/ExperimentClassroomList.vue'

const { proxy } = getCurrentInstance();
const { mt_academic_stage, mt_school_type, mt_vocal_education_type, mt_experiment_audit_status, mt_school_subject, mt_vocal_school_subject } = proxy.useDict('mt_academic_stage', 'mt_school_type','mt_vocal_education_type', 'mt_experiment_audit_status', 'mt_school_subject', 'mt_vocal_school_subject');

const router = useRouter()
const { isTeacher, schoolType: userSchoolType } = useTeacherInfo()

//学段
const educationStage = ref([])
const stageSelectRef = ref(null)   // 学段下拉引用，用于选完类型后自动聚焦

//学校类型改变时，学段改变
const schoolTypeChange = (value, focusStage = true) => {
  //清空学段的数据
  searchForm.value.periodType = ''
  resetBookFilter()   // 类型变了，教材级联树失效，清掉选中
    if(value == '1'){
        educationStage.value = mt_academic_stage.value
    }else{
        educationStage.value = mt_vocal_education_type.value
    }
    // 选完类型后自动聚焦学段下拉，顺势选下一步（初始化调用时 focusStage=false 不弹）
    if (focusStage) {
      nextTick(() => {
        stageSelectRef.value && stageSelectRef.value.focus && stageSelectRef.value.focus()
      })
    }
}

// 搜索表单数据
const searchForm = ref({
  name: '',
  type: '',
  stage: '',
  status: '',
  contentType:'',
  periodType:'',
  subjectId: null,           // 科目（教材三连筛）
  textbookLibraryId: null,   // 教材版本
  volumeId: null,            // 分册
  pageNum: 1,
  pageSize: 10,
})

//重置搜索表单数据
const resetFormSearch = () => {
  searchForm.value = {
    name: '',
    type: '',
    stage: '',
    status: '',
    contentType:'',
    periodType:'',
    subjectId: null,
    textbookLibraryId: null,
    volumeId: null,
    pageNum: 1,
    pageSize: 10,
  }
}

// 科目/教材版本/分册 级联筛选（复用课程页 getCourseSystemOptions 的树，依赖 类型+学段）
const bookTree = ref([])     // 级联选项树
const bookFilter = ref([])   // 级联选中路径 [subjectType, libraryId?, volumeId?]

// 加载级联树：类型(contentType)+学段(periodType) 都选了才加载
const loadBookTree = () => {
  if (searchForm.value.contentType && searchForm.value.periodType) {
    getCourseSystemOptions(searchForm.value.contentType, searchForm.value.periodType).then(res => {
      bookTree.value = res.data || []
    })
  } else {
    bookTree.value = []
  }
}

// 清空教材筛选
const resetBookFilter = () => {
  bookFilter.value = []
  searchForm.value.subjectId = null
  searchForm.value.textbookLibraryId = null
  searchForm.value.volumeId = null
}

// 级联选中：解析路径到 subjectId/libraryId/volumeId（checkStrictly 可选任意一级）
const handleBookFilterChange = (value) => {
  searchForm.value.subjectId = value && value[0] != null ? value[0] : null
  searchForm.value.textbookLibraryId = value && value[1] != null ? value[1] : null
  searchForm.value.volumeId = value && value[2] != null ? value[2] : null
}

// 学段改变：教材树失效，清筛 + 重载
const handleStageChange = () => {
  resetBookFilter()
  loadBookTree()
}

// 表格里把 subjectId 解析成科目名（按学校类型选字典）
const getSubjectName = (row) => {
  if (!row.subjectId) return ''
  // useDict 返回的是 ref，脚本里要取 .value 才是数组
  const dict = row.schoolType == '1' ? mt_school_subject.value : mt_vocal_school_subject.value
  const hit = dict && dict.find(d => d.value === row.subjectId)
  return hit ? hit.label : row.subjectId
}

// 模拟表格数据
const tableData = ref([])

// 设置总数据量为拟数据的长度
const total = ref(tableData.value.length)



//获取列表数据
const getListExperimentInfo = () => {
  const f = searchForm.value
  // 前端字段名与后端过滤字段不一致，这里对齐：
  // contentType→schoolType、periodType→academicStageType、name→experimentName、status→auditStatus
  const params = {
    pageNum: f.pageNum,
    pageSize: f.pageSize,
    experimentName: f.name || undefined,
    schoolType: f.contentType || undefined,
    academicStageType: f.periodType || undefined,
    auditStatus: f.status || undefined,
    subjectId: f.subjectId || undefined,
    textbookLibraryId: f.textbookLibraryId || undefined,
    volumeId: f.volumeId || undefined,
  }
  listExperimentInfo(params).then(response => {
    tableData.value = response.rows
    total.value = response.total
  })
}

//审核实验
const auditDialogVisible = ref(false)
const auditRow = ref(null)
const auditSubmitting = ref(false)
const auditForm = ref({ status: 2, comment: '' })

const handleAudit = (row) => {
  auditRow.value = row
  auditForm.value = { status: 2, comment: '' }
  auditDialogVisible.value = true
}

const doAudit = () => {
  auditSubmitting.value = true
  toExamine({
    id: auditRow.value.id,
    auditStatus: auditForm.value.status,
    auditComment: auditForm.value.comment
  }).then(response => {
    if (response.code == 200) {
      ElMessage.success(auditForm.value.status === 2 ? '审核通过' : '已拒绝')
      auditDialogVisible.value = false
      getListExperimentInfo()
    } else {
      ElMessage.error('审核失败')
    }
  }).catch(() => {
    ElMessage.error('审核失败')
  }).finally(() => {
    auditSubmitting.value = false
  })
}

// 删除试验信息
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除实验 ${row.experimentName} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除逻辑
    delExperimentInfo(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getListExperimentInfo();
      } else {
        ElMessage.error('删除失败')
      }
    });
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}

getListExperimentInfo();

// 教师用户自动填充学校类型
if (isTeacher.value) {
  searchForm.value.contentType = userSchoolType.value
  schoolTypeChange(userSchoolType.value, false)   // 初始化：不自动聚焦学段，避免页面加载就弹下拉
  getListExperimentInfo()
}


// 控制搜索框显示隐藏
const showSearch = ref(true)

// 切换搜索框显示状态
const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

// 刷新数据
const handleRefresh = () => {
  // 重置搜索条件
  resetSearch()
  // 重新加载数据
  // 这里可以调用获取数据的方法
  ElMessage.success('刷新成功')
}


// 方法定义
const handleSearch = () => {
  getListExperimentInfo()
}

const resetSearch = () => {
  resetFormSearch()
  getListExperimentInfo()
}

const handleAdd = () => {
  router.push({
    path: '/glxt/experiment/experiment_steps',
    query: {
      type: 'add'
    }
  })
}

const handlePreview = (row) => {
  router.push({
    path: '/glxt/experiment/experiment_steps',
    query: {
      id: row.id,
      type: 'preview'
    }
  })
}

const handleEdit = (row) => {
  router.push({
    path: '/glxt/experiment/experiment_steps',
    query: {
      id: row.id,
      type: 'edit'
    }
  })
}

// 打开AI课堂多内容列表(全屏弹窗,内嵌 ExperimentClassroomList 组件)
// 2026-08-28 多内容改版:不再跳 experiment_generate 页,列表+向导+预览全在弹窗内闭环
const classroomVisible = ref(false)
const classroomRow = ref(null) // 当前操作的实验行(传 id/name/schoolType/academicStageType 给子组件)
const handleClassroom = (row) => {
  classroomRow.value = row
  classroomVisible.value = true
}


//当前页面
const handleCurrentChange = (val) => {
  searchForm.value.pageNum = val
  getListExperimentInfo()
}

</script>

<style scoped>
.experiment-list {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.search-form {
  margin-bottom: 0px;
  /* transition: all 0.3s ease-in-out; */
}

.search-form[style*="display: none"] {
  opacity: 0;
  /* transform: translateY(-20px); */
}

.operation-bar {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-buttons {
  display: flex;
  gap: 8px;
}

.right-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px 0 0;
  background: transparent;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-hover-color: #409EFF;
  padding: 0;
}

:deep(.el-pagination .el-pagination__total) {
  margin-right: 16px;
}

:deep(.el-pagination .el-pagination__sizes) {
  margin-right: 16px;
}

:deep(.el-pagination button) {
  background: transparent;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

:deep(.el-pagination button:hover) {
  border-color: #409EFF;
  color: #409EFF;
  transform: translateY(-1px);
}

:deep(.el-pagination .el-pager li) {
  background: transparent;
  border: 1px solid #dcdfe6;
  margin: 0 4px;
  transition: all 0.3s ease;
}

:deep(.el-pagination .el-pager li:hover) {
  border-color: #409EFF;
  color: #409EFF;
  transform: translateY(-1px);
}

:deep(.el-pagination .el-pager li.active) {
  background: #409EFF;
  border-color: #409EFF;
  color: white;
  font-weight: bold;
}

:deep(.el-pagination .el-pagination__jump) {
  margin-left: 16px;
}

:deep(.el-pagination .el-input__wrapper) {
  background: transparent;
  box-shadow: 0 0 0 1px #dcdfe6;
}

:deep(.el-pagination .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409EFF;
}

@media (prefers-color-scheme: dark) {
  :deep(.el-pagination) {
    --el-pagination-button-color: #a8abb2;
    --el-pagination-hover-color: #409EFF;
  }

  :deep(.el-pagination button),
  :deep(.el-pagination .el-pager li) {
    background: rgba(0, 0, 0, 0.1);
    border-color: #4c5c6b;
    color: #e9ecef;
  }

  :deep(.el-pagination .el-input__wrapper) {
    box-shadow: 0 0 0 1px #4c5c6b;
  }
}

@media screen and (max-width: 768px) {
  .pagination-container {
    padding: 16px 0 0;
  }

  :deep(.el-pagination) {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
}

/* 更新操作按钮样式 */
.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;  /* 增加按钮间距 */
}

.op-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;  /* 调整内边距 */
  font-size: 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.op-button .el-icon {
  font-size: 14px;
  margin-right: 2px;
}

.op-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}


/* 暗色模式适配 */
@media (prefers-color-scheme: dark) { 
  .op-button {
    opacity: 0.9;
  }
  
  .op-button:hover {
    opacity: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .operation-buttons {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 4px;
  }
  
  .op-button {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .op-button .el-icon {
    font-size: 12px;
  }
}

.audit-dialog-experiment {
  font-size: 15px;
  font-weight: 500;
  color: #1E293B;
  margin: 0 0 16px;
}

/* ===== 教材列：科目 pill + 版本/分册弱化文本 ===== */
.book-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
/* 科目：浅主色底的小标签。注：纯主色字在浅底对比度不足(≈2.6:1)，故用深色字保证可读(≥4.5:1)，靠浅主色底体现"主色" */
.book-subject {
  padding: 1px 8px;
  background: var(--el-color-primary-light-9, #ecf5ff);
  color: var(--el-text-color-primary, #303133);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}
/* 版本 · 分册：次要文本 */
.book-detail {
  color: var(--el-text-color-regular, #606266);
  font-size: 13px;
}
/* 无教材时的占位 */
.book-empty {
  color: var(--el-text-color-placeholder, #c0c4cc);
}
</style>

