<template>
  <div class="course-management">
    <div class="content-wrapper">
      <!-- 基本信息展示 -->
      <div class="info-card">
        <div class="info-header">
          <el-icon><School /></el-icon>
          <h3>基本信息</h3>
        </div>
        <div class="info-content">
          <div class="info-item">
            <span class="label">学校名称：</span>
            <span class="value">{{ schoolInfo?.name }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <span class="label">学校类型：</span>
            <span class="value">{{ schoolInfo.educationLevelName }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <span class="label">学制：</span>
            <span class="value">{{ schoolInfo.schoolSystemName }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <span class="label">学段：</span>
            <span class="value">{{ schoolInfo.schoolTypeName }}</span>
          </div>
        </div>
        <div class="grade-section">
          <div class="grade-header">
            <span class="label">年级列表</span>
          </div>
          <div class="grade-tags">
            <el-tag
              v-for="grade in grades"
              :key="grade.id"
              :type="currentGrade?.name === grade.name ? 'primary' : 'info'"
              class="grade-tag"
              @click="handleGradeClick(grade)">
              {{ grade.name }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 课程管理 + 栏目管理（同级 Tab） -->
      <div class="table-card">
        <el-tabs v-model="activeManagementTab" class="management-tabs">
          <!-- ===== Tab: 课程管理 ===== -->
          <el-tab-pane label="课程管理" name="course">
            <div class="table-header">
              <div class="header-right">
                <el-input v-model="queryParams.name" placeholder="请输入科目名称搜索" class="search-input" clearable @input="handleSearch">
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
                <el-button type="primary" plain @click="clickAddCourse"><el-icon><Plus /></el-icon>新增</el-button>
              </div>
            </div>
            <div class="table-container">
              <el-table :data="groupedCourseList" style="width: 100%" v-loading="loading">
                <el-table-column label="年级" align="center">{{ currentGrade?.name }}</el-table-column>
                <el-table-column label="科目" align="center">
                  <template #default="scope">{{ scope.row.subjectName }}</template>
                </el-table-column>
                <el-table-column label="教材版本" align="center">
                  <template #default="scope">{{ scope.row.textbookVersionName || '-' }}</template>
                </el-table-column>
                <el-table-column label="分册" align="center">
                  <template #default="scope">
                    <el-tag
                      v-for="v in scope.row.volumes"
                      :key="v.id"
                      closable
                      style="margin: 2px 4px;"
                      @close="deleteCourse(v)"
                    >{{ v.volumeName || '-' }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- ===== Tab: 栏目管理 ===== -->
          <el-tab-pane label="栏目管理" name="column">
            <div class="table-header">
              <div class="header-right">
                <el-button type="primary" plain @click="openColumnAddDialog"><el-icon><Plus /></el-icon>添加</el-button>
                <el-button type="danger" plain :disabled="selectedColumnIds.length === 0" @click="batchDeleteColumns">批量删除</el-button>
              </div>
              <span class="drag-tip">提示：拖动 <el-icon><Rank /></el-icon> 可调整栏目顺序</span>
            </div>
            <div class="table-container">
              <el-table ref="columnTableRef" :data="columnList" row-key="id" style="width: 100%" v-loading="columnLoading" @selection-change="handleColumnSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column label="序号" type="index" width="55" align="center" />
                <el-table-column label="缩略图" width="100" align="center">
                  <template #default="scope">
                    <div class="col-thumb">
                      <image-preview v-if="getColumnThumb(scope.row.columnId)" :src="getColumnThumb(scope.row.columnId)" :width="80" :height="80"/>
                      <span v-else style="color:#c0c4cc;">-</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="columnName" label="栏目名称" align="center">
                  <template #default="scope">{{ getColumnLabel(scope.row.columnId) }}</template>
                </el-table-column>
                <el-table-column label="副名称" align="center">
                  <template #default="scope">{{ getColumnSubName(scope.row.columnId) || '-' }}</template>
                </el-table-column>
                <el-table-column label="排序" width="70" align="center">
                  <template #default>
                    <el-icon class="drag-handler"><Rank /></el-icon>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="scope">
                    <el-button type="danger" link @click="deleteSingleColumn(scope.row)"><el-icon><Delete /></el-icon>删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 课程配置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="配置课程（可多选）"
      width="600px"
      destroy-on-close
    >
      <el-form :model="courseForm" label-width="100px" v-loading="loading" :rules="rules" ref="courseFormRef">
        <el-form-item label="年级" prop="gradeId">
          <el-select v-model="courseForm.gradeId" placeholder="请选择年级" class="w-full" disabled>
            <el-option
              v-for="grade in grades"
              :key="grade.name"
              :label="grade.name"
              :value="grade.id"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="入学时间" prop="enrollmentYear">
          <el-input v-model="courseForm.enrollmentYear" disabled />
        </el-form-item> -->
        <el-form-item label="课程" prop="courseBook">
          <el-cascader
            v-model="courseForm.courseBook"
            :options="subjectBookTree"
            :props="{ expandTrigger: 'hover', emitPath: true, multiple: true }"
            placeholder="请选择 科目 / 教材版本 / 分册（可多选）"
            clearable
            collapse-tags
            collapse-tags-tooltip
            class="w-full"
          />
        </el-form-item>
        <!-- <el-form-item label="课程体系" required>
          <el-cascader
            v-model="courseForm.courseSystems"
            :options="courseSystemOptions"
            :props="{ 
              expandTrigger: 'hover',
              multiple: true,
              emitPath: true
            }"
            placeholder="请选择课程体系"
            clearable
            collapse-tags
            collapse-tags-tooltip
            class="w-full"
            @change="handleCourseSystemChange"
          />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="saveCourse">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量添加栏目对话框 -->
    <el-dialog
      v-model="columnAddDialogVisible"
      title="批量添加栏目"
      width="640px"
      destroy-on-close
    >
      <el-table
        :data="availableColumns"
        max-height="400"
        @selection-change="handleAddSelectionChange"
        empty-text="暂无可添加的栏目"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="缩略图" align="center" width="90">
          <template #default="scope">
            <image-preview v-if="scope.row.thumbnail" :src="scope.row.thumbnail" :width="60" :height="60" />
            <span v-else style="color:#c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="columnName" label="栏目名称" align="center" />
        <el-table-column label="副名称" align="center">
          <template #default="scope">{{ scope.row.subName || '-' }}</template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="columnAddDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitColumnAdd">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加新的底部导航 -->
    <div class="page-footer">
        <div class="footer-content">
          <div class="button-group">
            <el-button class="nav-button prev-button" @click="handlePrevStep">
              <el-icon><ArrowLeft /></el-icon>
              上一步
            </el-button>
            <div class="button-divider"></div>
            <el-button class="nav-button next-button" type="primary" @click="handleNextStep">
              下一步
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { listCourse, addCourse, delCourse } from '@/api/glxt/base_course'
import { getCourseSystemOptions } from '@/api/glxt/subject'
const { proxy } = getCurrentInstance();
const { mt_school_subject } = proxy.useDict('mt_school_subject');
//获取教材版本
import {getLibrary, getVolumeDetail } from '@/api/glxt/library';

//栏目API
import { listColumn, listColumnsByGrade, batchAddColumnsToGrade, delSchoolColumns, reorderSchoolColumns } from "@/api/glxt/column";
// 拖拽排序
import Sortable from 'sortablejs';



const loading = ref(false);
const props = defineProps({
  grades: {
    type: Array,
    required: true,
    default: () => []
  },
  schoolInfo: {
    type: Object,
    required: true,
    default: () => ({})
  },
  // classList: {
  //   type: Array,
  //   required: true,
  //   default: () => []
  // }
})

const currentGrade = ref(null)
const activeManagementTab = ref('course')
const dialogVisible = ref(false)
const dialogType = ref('add')
const courseFormRef = ref(null)


// 表单校验规则
const rules = {
  courseBook: [{ required: true, message: '请选择 科目 / 教材版本 / 分册', trigger: 'change' }],
  // subject: [{ required: true, message: '请选择科目', trigger: 'change' }],
  // textbookSubject: [{ required: true, message: '请选择科目', trigger: 'change' }],
  // textbookVersion: [{ required: true, message: '请选择教材版本', trigger: 'change' }],
  // textbookVolume: [{ required: true, message: '请选择分册', trigger: 'change' }],
  // teacher: [{ required: true, message: '请选择任课教师', trigger: 'change' }]
}



const total = ref(0)
const courseList = ref([]);
const queryParams = ref({
  pageNum: 1,
  pageSize: 100000, // 课程按年级全量加载（不分页），前端分组
  gradeId: '',
  name: '',
  schoolId: props.schoolInfo.id,//学校id
  schoolType: props.schoolInfo.educationLevel,//学校类型
});

const courseForm = ref({
  schoolId: props.schoolInfo.id,
  schoolType: props.schoolInfo.educationLevel,//学校类型
  gradeId: '',
  courseBook: []       // 多选级联值 [[subjectType, libraryId, volumeId], ...]
})
//重置
const reset = () => {
  courseForm.value = {
    schoolId: props.schoolInfo.id,
    schoolType: props.schoolInfo.educationLevel,
    gradeId: currentGrade.value.id,
    courseBook: []
  }
}

// 「科目 → 教材版本 → 分册」级联树（复用 getCourseSystemOptions，按学校类型 + 学段）
const subjectBookTree = ref([])

// 加载级联树
const loadSubjectBookTree = () => {
  // 本组件为普教专用，educationLevel 兜底取 '1'，避免空值导致后端不过滤 school_type 而混入职教科目
  const schoolType = props.schoolInfo.educationLevel || '1'
  getCourseSystemOptions(schoolType, props.schoolInfo.schoolType).then(res => {
    if (res.code == 200) subjectBookTree.value = res.data || []
  })
}

// 级联选择：科目 / 教材版本 / 分册
// 列表按「科目 + 教材版本」分组，每组一行，分册内联成 tag
const groupedCourseList = computed(() => {
  const map = new Map()
  courseList.value.forEach(c => {
    const key = `${c.subjectId}-${c.libraryId}`
    if (!map.has(key)) {
      map.set(key, {
        subjectId: c.subjectId,
        subjectName: c.name,
        libraryId: c.libraryId,
        textbookVersionName: c.textbookVersionName,
        volumes: []
      })
    }
    map.get(key).volumes.push(c)
  })
  return Array.from(map.values())
})

// 按级联路径从树里取名称
const findBookLabels = (path) => {
  if (!path || path.length < 3) return null
  const [sType, lId, vId] = path
  const subj = subjectBookTree.value.find(s => s.value === sType)
  if (!subj) return null
  const lib = (subj.children || []).find(l => l.value === lId)
  if (!lib) return { subjectName: subj.label }
  const vol = (lib.children || []).find(v => v.value === vId)
  return { subjectName: subj.label, versionName: lib.label, volumeName: vol ? vol.label : null }
}


// ===== 栏目管理（按年级） =====
// 栏目目录：用于名称/缩略图回显 + 批量添加可选项
const columnOptions = ref([])
const columnList = ref([])          // 当前年级已关联的栏目（MtSchoolColumn 列表）
const columnLoading = ref(false)
const selectedColumns = ref([])     // 表格多选行
const selectedColumnIds = computed(() => selectedColumns.value.map(c => c.id))

// 加载栏目目录（按学校类型过滤）
const loadColumnCatalog = () => {
  return listColumn({
    pageNum: 1,
    pageSize: 100000,
    contentType: props.schoolInfo.educationLevel
  }).then(response => {
    if (response.code == 200) columnOptions.value = response.rows || []
  }).catch(() => {
    ElMessage.error('获取栏目数据失败')
  })
}

// 栏目名称/缩略图回显
const findColumn = (columnId) => columnOptions.value.find(c => c.id === columnId)
const getColumnLabel = (columnId) => findColumn(columnId)?.columnName
const getColumnThumb = (columnId) => findColumn(columnId)?.thumbnail
const getColumnSubName = (columnId) => findColumn(columnId)?.subName

// 加载某年级已关联栏目
const loadGradeColumns = (gradeId) => {
  columnLoading.value = true
  listColumnsByGrade(gradeId).then(res => {
    if (res.code == 200) columnList.value = res.data || []
    columnLoading.value = false
  }).catch(() => {
    columnLoading.value = false
  })
}

// 表格多选
const handleColumnSelectionChange = (selection) => {
  selectedColumns.value = selection
}

// 删除单个栏目关联
const deleteSingleColumn = (row) => {
  proxy.$modal.confirm('确定要移除该栏目吗？').then(() => {
    return delSchoolColumns(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    loadGradeColumns(currentGrade.value.id)
  }).catch(() => {})
}

// 批量删除栏目关联
const batchDeleteColumns = () => {
  const ids = selectedColumnIds.value
  proxy.$modal.confirm(`确定要移除选中的 ${ids.length} 个栏目吗？`).then(() => {
    return delSchoolColumns(ids.join(','))
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    loadGradeColumns(currentGrade.value.id)
  }).catch(() => {})
}

// ===== 批量添加栏目对话框 =====
const columnAddDialogVisible = ref(false)
const columnAddSelectedRows = ref([])
// 可添加 = 目录中尚未关联到当前年级的栏目
const availableColumns = computed(() => {
  const existed = new Set(columnList.value.map(c => c.columnId))
  return columnOptions.value.filter(c => !existed.has(c.id))
})
const openColumnAddDialog = () => {
  if (!currentGrade.value) {
    ElMessage.warning('请先选择年级')
    return
  }
  columnAddSelectedRows.value = []
  const open = () => { columnAddDialogVisible.value = true }
  if (columnOptions.value.length === 0) {
    loadColumnCatalog().then(open)
  } else {
    open()
  }
}
const handleAddSelectionChange = (rows) => {
  columnAddSelectedRows.value = rows
}
const submitColumnAdd = () => {
  if (columnAddSelectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一个栏目')
    return
  }
  const payload = columnAddSelectedRows.value.map(c => ({
    columnId: c.id,
    schoolId: props.schoolInfo.id,
    gradeId: currentGrade.value.id,
    contentType: props.schoolInfo.educationLevel
  }))
  batchAddColumnsToGrade(payload).then(res => {
    if (res.code == 200) {
      proxy.$modal.msgSuccess('添加成功')
      columnAddDialogVisible.value = false
      loadGradeColumns(currentGrade.value.id)
    }
  })
}

// ===== 栏目拖拽排序 =====
const columnTableRef = ref(null)
const columnSortable = ref(null)
const initColumnDrag = () => {
  const tbody = columnTableRef.value?.$el?.querySelector('.el-table__body-wrapper tbody')
  if (!tbody || columnSortable.value) return
  columnSortable.value = Sortable.create(tbody, {
    handle: '.drag-handler',
    animation: 150,
    onEnd: ({ oldIndex, newIndex }) => {
      if (oldIndex === newIndex) return
      // 先同步本地顺序，再按新顺序落库 sort
      const moved = columnList.value.splice(oldIndex, 1)[0]
      columnList.value.splice(newIndex, 0, moved)
      reorderSchoolColumns(columnList.value.map(c => c.id)).then(res => {
        if (res.code == 200) {
          proxy.$modal.msgSuccess('排序成功')
        } else {
          loadGradeColumns(currentGrade.value.id)
        }
      }).catch(() => loadGradeColumns(currentGrade.value.id))
    }
  })
}
// 首次切到「栏目管理」Tab 时初始化拖拽（表格 tbody 此时才确定存在）
watch(activeManagementTab, (val) => {
  if (val === 'column') nextTick(initColumnDrag)
})



// 分页已移除（课程按年级全量加载 + 前端分组）


// 修改 handleGradeClick 函数
const handleGradeClick = (grade) => {
  currentGrade.value = grade

  getCoursesByGrade(grade)
  // 栏目按年级管理：切换年级时同步加载栏目目录与该年级已关联栏目
  if (columnOptions.value.length === 0) loadColumnCatalog()
  loadGradeColumns(grade.id)

  ElMessage.success(`已切换到${grade.name}`)

}


// 根据年级id获取班级列表的方法，添加分页逻辑
const getCoursesByGrade = (grade) => {
  queryParams.value.gradeId = grade.id;
  getList(queryParams.value);
  // 设置总数和更新表格数据
  // handleSearch()
}

// 获取课程列表
const getList = (params) => {
  loading.value = true;
  listCourse(params).then(response => {
    courseList.value = response.rows;
    total.value = response.total;
    loading.value = false;
    
  });
}

// 添加搜索方法
const handleSearch = () => {
  queryParams.value.gradeId = currentGrade.value.id;
  getList(queryParams.value);
}


// 监听搜索关键词变化
watch(() => queryParams.value.name, () => {
  queryParams.value.pageNum = 1 // 重置页码
  handleSearch()
})

//获取科目名称
const getSubjectName = (subjectType) => {
  return mt_school_subject.value ?.find(item => item.value === subjectType).label
}

// 修改 addCourse 函数
const clickAddCourse = () => {
   //重置表单
  reset();
  //加载「科目→版本→分册」级联树
  loadSubjectBookTree();
  //获取挂载课程
  getCourseSystemOptionList(props.schoolInfo.educationLevel, props.schoolInfo.schoolType);

  if (!currentGrade.value) {
    ElMessage.warning('请先选择年级')
    return
  }
  
  dialogType.value = 'add'
  dialogVisible.value = true
}


// 编辑已移除（要改课程删了重加；课程身份=科目+版本+分册，无其它可编辑属性）

// 删除课程
const deleteCourse = (row) => {
  ElMessageBox.confirm('确定要删除该课程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    delCourse(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getCoursesByGrade(currentGrade.value)
        loading.value = true
      }else{
        ElMessage.error('删除失败')
      }
    })
  })
}

//取消
const cancel = () => {
  reset();
  dialogVisible.value = false
}

// 多选批量新增：遍历选中级联路径，去重后逐条 addCourse
const saveCourse = () => {
  if (!courseFormRef.value) return
  courseFormRef.value.validate(valid => {
    if (!valid) return
    const paths = courseForm.value.courseBook || []
    if (!paths.length) return
    // 去重：跳过当前年级已存在的（科目+版本+分册）
    const existKeys = new Set(courseList.value.map(c => `${c.subjectId}-${c.libraryId}-${c.volumeId}`))
    const toAdd = []
    paths.forEach(path => {
      if (!path || path.length < 3) return
      const [subjectType, libraryId, volumeId] = path
      if (existKeys.has(`${subjectType}-${libraryId}-${volumeId}`)) return
      const labels = findBookLabels(path)
      toAdd.push({
        schoolId: props.schoolInfo.id,
        schoolType: props.schoolInfo.educationLevel,
        gradeId: currentGrade.value.id,
        subjectId: subjectType,
        libraryId: libraryId != null ? Number(libraryId) : null,
        volumeId: volumeId != null ? Number(volumeId) : null,
        name: labels?.subjectName || getSubjectName(subjectType)
      })
    })
    if (toAdd.length === 0) {
      proxy.$modal.msgWarning('所选课程均已存在，无需重复添加')
      return
    }
    loading.value = true
    Promise.all(toAdd.map(c => addCourse(c))).then(() => {
      proxy.$modal.msgSuccess(`新增成功 ${toAdd.length} 条`)
      dialogVisible.value = false
      getCoursesByGrade(currentGrade.value)
    }).catch(() => {
      proxy.$modal.msgError('部分课程新增失败，请重试')
    }).finally(() => {
      loading.value = false
    })
  })
}

// 修改初始化默认年级的方法
const initDefaultGrade = () => {
  if (props.grades && props.grades.length > 0) {
    // 默认选中一年级
    handleGradeClick(props.grades[0])
  }
}
// 监听年级数据变化
watch(() => props.grades, (newGrades) => {
  if (newGrades && newGrades.length > 0) {
    initDefaultGrade()
  }
}, { immediate: true })

const emit = defineEmits(['prev-step', 'next-step'])

const handlePrevStep = () => {
  emit('prev-step')
}

const handleNextStep = () => {
  if (courseList.value.length === 0) {
    ElMessage.warning('请至少配置一门课程')
    return
  }
  emit('next-step', courseList.value)
}

// 学段文本转换方法
const getEducationLevelText = (level) => {
  const levelMap = {
    primary: '小学',
    junior: '初中',
    senior: '高中'
  }
  return levelMap[level] || level
}



const courseSystemOptions = ref([])

//获取挂载课程
const getCourseSystemOptionList = (schoolType, academicStage) => {
  getCourseSystemOptions(schoolType, academicStage).then(response => {
    courseSystemOptions.value = response.data

    // console.log('courseSystemOptions',courseSystemOptions.value)
    courseSystemOptions.value.forEach(item => {
      // console.log('item',item.value)
      item.label = getSubjectName(item.value);
    })
  })
}

// 挂载课程系统
const handleCourseSystemChange = (values) => {
  if (!values || values.length === 0) {
    courseForm.value.courseSystems = []
    return
  }

}
</script>

<style scoped>
/* 修改图标和标题样式 */
.info-header,
.table-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}


.info-header h3,
.table-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.5;
}

.table-header {
  justify-content: space-between;
  margin-bottom: 0;
  border-bottom: 1px solid #ebeef5;
}

.header-left {
  display: flex;
  align-items: center;
}

/* 调整表格容器样式 */
.table-container {
  padding: 20px;
}

/* 调整基本信息内容区域样式 */
.info-content {
  display: flex;
  align-items: center;
  padding: 20px 20px;
}

.info-item {
  flex: 1;
  padding: 0 20px;
}

.info-item .label {
  font-size: 14px;
  color: #909399;
  white-space: nowrap;
}

.info-item .value {
  font-size: 14px;
  color: #909399;
  font-weight: bold;
}

.info-divider {
  width: 1px;
  height: 24px;
  background-color: #ebeef5;
  margin: 0;
}

/* 调整卡片样式 */
.info-card,
.table-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 复用 class-management.vue 的样式 */
.course-management {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9));
  position: relative;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 16px;
  padding-bottom: 80px;
}

.content-wrapper {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  padding: 0 20px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  /* gap: 16px; */
}

/* 其他样式与 class-management.vue 相同 */
.top-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 16px;
}

.step-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 23px;
  box-shadow: 0 2px 12px 0 rgba(107, 219, 42, 0.1);
  transition: all 0.3s;
  padding: 8px 20px;
}

/* 课程体系选择器样式 */
.course-system-select {
  display: flex;
  gap: 12px;
}

.course-system-select :deep(.el-form-item) {
  margin-bottom: 0;
  flex: 1;
}

/* 复用其他所有样式... */
.info-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.info-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}


.info-header .el-icon,
.header-left .el-icon {
  font-size: 20px;
  color: #409EFF;
  margin-right: 8px;
}

/* .info-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: #606266;
  font-size: 14px;
}

.value {
  color: #909399;
  font-size: 14px;
  font-weight: bold;
} */



.grade-section {
  margin-top: 20px;
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

.grade-header {
  margin-bottom: 16px;
}

.grade-header .label {
  font-size: 14px;
  color: #86909c;
}

.grade-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  /* padding-left: 72px; */
}

.grade-tag {
  cursor: pointer;
  transition: all 0.3s;
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
}


.grade-tag:hover {
  transform: translateY(-2px);
}

/* 修改 el-tag 的默认样式 */
.grade-tag:deep(.el-tag) {
  border: none;
}

.grade-tag:deep(.el-tag--info) {
  background-color: #f5f7fa;
  color: #909399;
}

.grade-tag:deep(.el-tag--primary) {
  background-color: #ecf5ff;
  color: #409eff;
}

.table-card {
  padding: 20px;
  margin-top: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 添加或修���以下样式 */
:deep(.el-dialog__body) {
  padding: 20px 40px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  font-weight: normal;
  color: #606266;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

:deep(.el-cascader) {
  width: 100%;
}

:deep(.el-select),
:deep(.el-input),
:deep(.el-cascader) {
  height: 32px;
  line-height: 32px;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-cascader__wrapper) {
  height: 32px;
  line-height: 32px;
}

/* 确保所有输入框高度一致 */
.w-full {
  width: 100%;
  height: 32px;
}

/* 调整表单项间距 */
.el-form {
  padding: 10px 0;
}

/* 调整对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
}

/* 添加课程体系标签的样式 */
.course-systems {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.course-system-tag {
  margin: 2px;
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px 0 0;
  background: transparent;
}

/* 分页组件样式优化 */
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

/* 暗色模式适配 */
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

/* 响应式调整 */
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

/* 添加搜索框相关样式 */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 200px;
  margin-right: 8px;
}

:deep(.search-input .el-input__wrapper) {
  border-radius: 20px;
}

:deep(.search-input .el-input__prefix) {
  color: #909399;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .header-right {
    flex-direction: column;
    gap: 8px;
  }
  
  .search-input {
    width: 100%;
    margin-right: 0;
  }
}

/* 底部导航样式优化 */
.page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-top: 2px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 32px;
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-left: 150px;
}

.button-divider {
  width: 1px;
  height: 24px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(64, 158, 255, 0.2),
    transparent
  );
}

.nav-button {
  min-width: 120px;
  height: 40px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 24px;
}

.prev-button {
  background-color: #f8faff;
  border: 1px solid rgba(64, 158, 255, 0.2);
  color: #409EFF;
}

.prev-button:hover {
  background-color: #fff;
  border-color: #409EFF;
  color: #409EFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.next-button {
  background: linear-gradient(135deg, #409EFF, #3a8ee6);
  border: none;
  color: #ffffff;
}

.next-button:hover {
  background: linear-gradient(135deg, #66b1ff, #409EFF);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.25);
}

.nav-button .el-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.prev-button:hover .el-icon {
  transform: translateX(-3px);
}

.next-button:hover .el-icon {
  transform: translateX(3px);
}

/* 添加按钮点击效果 */
.nav-button:active {
  transform: translateY(0);
  box-shadow: none;
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .page-footer {
    background: rgba(30, 35, 45, 0.98);
    border-top: 2px solid rgba(64, 158, 255, 0.05);
  }
  
  .prev-button {
    background-color: rgba(64, 158, 255, 0.1);
    border-color: rgba(64, 158, 255, 0.3);
  }
}

/* 适配移动端 */
@media screen and (max-width: 768px) {
  .footer-content {
    padding: 16px;
  }

  .button-group {
    gap: 16px;
  }

  .nav-button {
    min-width: 120px;
    height: 40px;
    font-size: 14px;
    padding: 0 16px;
  }
  
  .button-divider {
    height: 20px;
  }
}

/* 确保内容不被底部导航遮挡 */
.content-wrapper {
  padding-bottom: 100px;
}

/* 栏目拖拽排序 */
.drag-handler {
  cursor: move;
  font-size: 18px;
  color: #909399;
}

/* 缩略图：强制正方形 + cover，避免宽图被压扁 */
.col-thumb {
  display: flex;
  justify-content: center;
  align-items: center;
}
.col-thumb :deep(.el-image) {
  width: 80px;
  height: 80px;
}
.col-thumb :deep(.el-image__inner) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}

.drag-handler:hover {
  color: #409eff;
}

.drag-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}
</style> 