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
            <div class="info-row">
              <span class="label">学校名称：</span>
              <span class="value">{{ schoolInfo?.name }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-row">
              <span class="label">学校类型：</span>
              <span class="value">{{ schoolInfo?.educationLevelName }}</span>
            </div>
          </div>
          <!-- <div class="info-item">
            <div class="info-row">
              <span class="label">学段：</span>
              <span class="value">{{ schoolInfo?.schoolTypeName }}</span>
            </div>
          </div> -->
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

      <!-- 科目课程管理表格 -->
      <div class="table-card">
        <div class="table-header">
          <div class="header-left">
            <el-icon class="header-icon"><List /></el-icon>
            <h3>课程管理</h3>
            <!-- 学校id：{{ schoolInfo?.id }} 选中的年级：{{currentGrade?.id}} - {{ currentGrade?.name }} -->
          </div>
          <div class="header-right">
            <!-- 添加搜索框 -->
            <el-input
              v-model="queryParams.name"
              placeholder="请输入科目名称搜索"
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" plain @click="clickAddCourse">
              <el-icon><Plus /></el-icon>新增
            </el-button>
          </div>
        </div>

        <div class="table-container">
          <el-table :data="courseList" style="width: 100%" v-loading="loading" element-loading-text="Loading..."> 
            <el-table-column prop="gradeName" label="年级" align="center">
              {{ currentGrade?.name }}
            </el-table-column>
            <!-- <el-table-column prop="enrollmentYear" label="入学时间" align="center"/> -->
            <el-table-column prop="name" label="科目" align="center"/>
            <el-table-column label="课程体系" align="center">
              <template #default="{ row }">
                <div class="course-systems">
                  <el-tag
                    v-for="(system, index) in row.courseSystems"
                    :key="index"
                    size="small"
                    class="course-system-tag"
                  >
                    {{ `${getSubjectName(system[0])}-${system[1]}-${system[2]}` }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column prop="teacher" label="任课教师" align="center"/> -->
            <el-table-column label="操作" width="200" align="center">
              <template #default="scope">
                <el-button type="primary" link @click="editCourse(scope.row)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="danger" link @click="deleteCourse(scope.row)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 添加分页组件 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="queryParams.pageNum"
              v-model:page-size="queryParams.pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :total="total"
              background
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 课程配置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '配置课程' : '编辑课程'"
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
        <el-form-item label="科目" prop="subject">
          <el-select v-model="courseForm.subjectId" placeholder="请选择科目" class="w-full">
            <el-option
              v-for="item in subjectOptions"
              :key="item.id"
              :label="item.subjectName"
              :value="item.subjectType"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程体系" required>
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
          {{ courseForm.courseSystems }}
        </el-form-item>
        <!-- <el-form-item label="任课教师" prop="teacher">
          <el-select v-model="editingCourse.teacher" placeholder="请选择教师" class="w-full">
            <el-option
              v-for="item in teacherOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item> -->
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="saveCourse">确定</el-button>
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
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { listCourse, addCourse, updateCourse, delCourse, getCourse } from '@/api/glxt/base_course'
import { initSubject, getCourseSystemOptions } from '@/api/glxt/subject'
const { proxy } = getCurrentInstance();
const { mt_school_subject } = proxy.useDict('mt_school_subject');
//获取教材版本
import {getLibrary, getVolumeDetail } from '@/api/glxt/library';
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
  classList: {
    type: Array,
    required: true,
    default: () => []
  }
})

const currentGrade = ref(null)
const dialogVisible = ref(false)
const dialogType = ref('add')
const courseFormRef = ref(null)


// 表单校验规则
const rules = {
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
  pageSize: 10,
  gradeId: '',
  name: '',
  schoolId: props.schoolInfo.id,//学校id
  schoolType: props.schoolInfo.educationLevel,//学校类型
});

const courseForm = ref({
  id: null,
  schoolId: props.schoolInfo.id,
  schoolType: props.schoolInfo.educationLevel,//学校类型
  gradeId: '',
  subjectId: '',
  name: '',
  courseSystems: [[]],
})
//重置
const reset = () => {
  courseForm.value = {
    id: null,
    gradeId: currentGrade.value.id,
    subjectId: null,
    name: null,
    courseSystems: [[]],
  }
}


// 处理页码改变
const handleCurrentChange = (val) => {
  queryParams.value.pageNum = val
   // 这里调用获取数据的方法
  getCoursesByGrade(currentGrade.value)
}

// 处理每页条数改变
const handleSizeChange = (val) => {
  queryParams.value.pageSize = val
  // 这里调用获取数据的方法
  getCoursesByGrade(currentGrade.value)
}


// 修改 handleGradeClick 函数
const handleGradeClick = (grade) => {
  currentGrade.value = grade
  
  getCoursesByGrade(grade);

  ElMessage.success(`已切换到${grade.name}课程列表`)

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
watch(queryParams.value.name, () => {
  queryParams.value.pageNum = 1 // 重置页码
  handleSearch()
})

// 初始化科目下拉列表
const subjectOptions = ref([])
const initSubjectList = () => {
  try{
    initSubject({schoolType: '1'}).then(response => {
      if(response.code == 200){
        subjectOptions.value = response.rows
        //获取科目名称
        console.log('subjectOptions',subjectOptions.value)
        subjectOptions.value.forEach(item => {
          item.subjectName = getSubjectName(item.subjectType)
        })
      }
    })
  }catch(err){
    ElMessage.error('数据初始化失败')
  }
}
//获取科目名称
const getSubjectName = (subjectType) => {
  return mt_school_subject.value ?.find(item => item.value === subjectType).label
}

// 修改 addCourse 函数
const clickAddCourse = () => {
   //重置表单
  reset();
  //调用初始化科目下拉列表
  initSubjectList();
  //获取挂载课程
  getCourseSystemOptionList(props.schoolInfo.educationLevel, props.schoolInfo.schoolType);

  if (!currentGrade.value) {
    ElMessage.warning('请先选择年级')
    return
  }
  
  dialogType.value = 'add'
  dialogVisible.value = true
}


// 修改 editCourse 函数
const editCourse = (row) => {
  reset();
   //调用初始化科目下拉列表
  initSubjectList();
  //获取挂载课程  学校类型   学段
  getCourseSystemOptionList(props.schoolInfo.educationLevel, props.schoolInfo.schoolType);
  dialogType.value = 'edit'
  //获取课程信息
  getCourse(row.id, props.schoolInfo.id, props.schoolInfo.educationLevel).then(response => {
    courseForm.value = response.data
    //开启弹框
    dialogVisible.value = true
  })

}

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

// 修改 saveCourse 函数
const saveCourse = () => {
  if (!courseFormRef.value) return
  try{
    courseFormRef.value.validate((valid) => {
    if (valid) {
      if (courseForm.value.id != null) {
        updateCourse(courseForm.value).then(response => {
          if(response.code == 200){
            proxy.$modal.msgSuccess("修改成功");
            queryParams.value.gradeId = courseForm.value.gradeId
            getList(queryParams.value);
          } 
        });
      } else {
        //获取课程名称传入参数
        let name = getSubjectName(courseForm.value.subjectId);
        courseForm.value.name = name;
        courseForm.value.schoolId = props.schoolInfo.id;
        courseForm.value.schoolType = props.schoolInfo.educationLevel;
        addCourse(courseForm.value).then(response => {
          if(response.code == 200){
            proxy.$modal.msgSuccess("新增成功");
            queryParams.value.gradeId = courseForm.value.gradeId
            getList(queryParams.value);
          }
        });
      }
    }
  })
  }catch(err){
    ElMessage.error('操作失败')
  } finally {
    dialogVisible.value = false//关闭弹框
  }
}

// 修改初始化默认年级的方法
const initDefaultGrade = () => {
  if (props.grades && props.grades.length > 0) {
    // 默认选中一年级
    console.log('监听到了》》》》')
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

    console.log('courseSystemOptions',courseSystemOptions.value)
    courseSystemOptions.value.forEach(item => {
      console.log('item',item.value)
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
  padding: 12px 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.label {
  color: #86909c;
  font-size: 14px;
  white-space: nowrap;
}

.value {
  color: #1d2129;
  font-size: 14px;
  font-weight: 400;
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

.info-content {
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
}



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
</style> 