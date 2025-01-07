<template>
  <div class="class-management">
    <div class="content-wrapper">
      <!-- 学校信息展示 -->
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
          <!-- <div class="info-divider"></div>
          <div class="info-item">
            <span class="label">学段：</span>
            <span class="value">{{ schoolInfo.schoolPeriodName }}</span>
          </div> -->
        </div>
        <div class="grade-section">
          <div class="grade-header">
            <span class="label">专业列表</span>
          </div>
          <div class="grade-tags">
            <el-tag
              v-for="speciality in specialities"
              :key="speciality.id"
              :type="currentSpeciality?.specialityName === speciality.specialityName ? 'primary' : 'info'"
              class="grade-tag"
              @click="handleSpecialityClick(speciality)"
            >
              {{ speciality.specialityName }}
            </el-tag>
          </div>
        </div>

        <!-- 添加年级列表部分 -->
        <div class="grade-section" v-if="currentSpeciality">
          <div class="grade-header">
            <div class="header-left">
              <span class="label">年级列表</span>
            </div>
            <div class="current-specialty">
              <el-tag 
                type="primary" 
                effect="success" 
                class="specialty-indicator" round
              >
                当前专业：{{ currentSpeciality.specialityName }}
              </el-tag>
            </div>
          </div>
          <div class="grade-tags">
            <el-tag
              v-for="grade in filteredGrades"
              :key="grade.id"
              :type="currentGrade?.gradeName === grade.gradeName ? 'success' : 'info'"
              class="grade-tag"
              @click="handleGradeClick(grade)"
            >
              {{ grade.gradeName }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 班级管理表格 -->
      <div class="table-card">
        <div class="table-header">
          <div class="header-left">
            <el-icon class="header-icon"><List /></el-icon>
            <h3>班级管理</h3>
          </div>
          <div class="header-right">
            <el-input
              v-model="queryParams.className"
              placeholder="请输入班级名称"
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" plain @click="clickAddVocalClass">
              <el-icon><Plus /></el-icon>新增
            </el-button>
          </div>
        </div>

        <div class="table-container">
          <el-table :data="classList" v-loading="loading" style="width: 100%">
            <el-table-column type="index" width="70" label="序号" align="center"/>
            <el-table-column prop="gradeName" label="年级" align="center">
              {{ currentSpeciality?.specialityName }}
            </el-table-column>
            <el-table-column prop="className" label="班级名称" align="center"/>
            <el-table-column label="操作" align="center">
              <template #default="scope">
                <el-button type="primary" link @click="editVocalClass(scope.row)" v-permission="['glxt:class:edit']">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="danger" link @click="deleteVocalClass(scope.row)" v-permission="['glxt:class:remove']">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
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

    <!-- 底部按钮组 -->
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

    <!-- 班级编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加班级' : '编辑班级'"
      width="500px"
      destroy-on-close
    >
    
      <el-form :model="classForm" label-width="80px" :rules="rules" ref="classFormRef">
        <el-form-item label="专业" prop="vocalEduSpecialityId">
          <el-select v-model="classForm.vocalEduSpecialityId" placeholder="请选择专业" class="w-full" disabled>
            <el-option
              v-for="speciality in specialities"
              :key="speciality.id"
              :label="speciality.specialityName"
              :value="speciality.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="vocalEduGradeId">
          <el-select v-model="classForm.vocalEduGradeId" placeholder="请选择年级" class="w-full" disabled>
            <el-option
              v-for="grade in filteredGrades"
              :key="grade.id"
              :label="grade.gradeName"
              :value="grade.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="classForm.className" placeholder="请输入班级名称"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="saveVocalClass">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

//引入班级api
import { listVocalClass, addVocalClass, updateVocalClass, getVocalClass , delVocalClass, checkVocalClass } from '@/api/glxt/vocal_class'

//引入年级api
import { listVocalGrade } from '@/api/glxt/vocal_grade'

const { proxy } = getCurrentInstance();
// 接收父组件传递的数据
const props = defineProps({
  grades: {//年级列表
      type: Array,
      required: true,
      default: () => []
    },
  specialities: {//专业列表
      type: Array,
      required: true,
      default: () => []
    },
  schoolInfo: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '',
      schoolType: '',
      educationLevel: ''
    })
  }
})

// 将响应式引用移到最前面
const currentGrade = ref(null)
const currentSpeciality = ref(null)
const classList = ref([])
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const dialogType = ref('add')
const classFormRef = ref(null)
const loading = ref(false)
const total = ref(0)

// 根据当前专业过滤年级列表
// const filteredGrades = computed(() => {
//   if (!currentSpeciality.value) return []
//   console.log(props.grades)
//   return props.grades.filter(grade => grade.vocalEduSpecialityId === currentSpeciality.value.id)
// })

//专业下 的年级列表
const filteredGrades = ref([])
//根据专业获取年级
const getGradesBySpeciality = (params) => {
  listVocalGrade(params).then(response => {
    if(response.code == 200){
      filteredGrades.value = response.rows
      if (filteredGrades.value.length === 0) {
        ElMessage.warning(`${speciality.specialityName}专业下暂无年级数据`)
      }
    }else{
      ElMessage.error('获取年级数据失败')
    }
  })
}

// 处理专业点击
const handleSpecialityClick = (speciality) => {
  currentSpeciality.value = speciality
  currentGrade.value = null // 清空当前选中的年级
  classList.value = [] // 清空班级列表
  let params = {
    pageNum: 1,
    pageSize: 1000000,
    vocalEduSpecialityId: speciality.id
  }
  getGradesBySpeciality(params)
  
}

// 初始化时默认选中第一个专业
const initDefaultSpeciality = () => {
  if (props.specialities && props.specialities.length > 0) {
    handleSpecialityClick(props.specialities[0])
  }
}

// 监听专业数据变化
watch(() => props.specialities, (newSpecialities) => {
  if (newSpecialities && newSpecialities.length > 0) {
    initDefaultSpeciality()
  }
}, { immediate: true })

const classes = ref([])


const classForm = ref({
  id: null,
  vocalEduGradeId: '',
  vocalEduSpecialityId: '',
  className: ''
})

// 表单校验规则
const rules = {
  vocalEduGradeId: [{ required: true, message: '请选择年级', trigger: 'change' }],
  vocalEduSpecialityId: [{ required: true, message: '请选所属学年', trigger: 'change' }],
  className: [{ required: true, message: '请输入班级名称', trigger: 'blur' }]
}

// 处理页码改变
const handleCurrentChange = (val) => {
  console.log(val + '=--------')
  queryParams.value.pageNum = val
  // 这里可以调用获取数据的方法
  getVocalClassesByGrade(currentSpeciality.value)
}

// 处理每页条数改变
const handleSizeChange = (val) => {
  queryParams.value.pageSize = val
  // 这里调用获取数据的方法
  getVocalClassesByGrade(currentSpeciality.value)
}


const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  vocalEduGradeId: '',
  vocalEduSpecialityId: '',
  className: ''
});


// 重置表单
const reset = () => {
  classForm.value = {
    id: null,
    vocalEduGradeId: null,
    vocalEduSpecialityId: null,
    className: null
  }
}

// 根据年级id获取班级列表的方法，添加分页逻辑
const getVocalClassesByGrade = (grade) => {
  queryParams.value.vocalEduGradeId = grade.id;
  getList(queryParams.value);
  // 设置总数和更新表格数据
  // handleSearch()
}

// 获取班级列表
const getList = (params) => {
  loading.value = true;
  listVocalClass(params).then(response => {
    classList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
};

// 添加搜索处理方法
const handleSearch = () => {
  queryParams.value.vocalEduGradeId = currentSpeciality.value.id;
  getList(queryParams.value);

}

// 监听搜索关键词变化
watch(queryParams.value.name, () => {
  queryParams.value.pageNum = 1 // 重置页码
  handleSearch()
})

// 监听年级数据变化
// watch(() => props.grades, (newGrades) => {
//   if (newGrades && newGrades.length > 0) {
//     // initDefaultGrade()
//   }
// }, { immediate: true })



// 修改添加班级的方法
const clickAddVocalClass = () => {
  // 检查是否选择了专业
  if (!currentSpeciality.value) {
    ElMessage.warning('请先选择专业')
    return
  }
  
  if(filteredGrades.value.length === 0){
    ElMessage.warning('当前专业下暂无年级数据，请先添加年级')
    return
  }

  // 检查是否选择了年级
  if (!currentGrade.value) {
    ElMessage.warning('请先选择年级')
    return
  }

  reset();
  // 给专业和年级赋值
  classForm.value.vocalEduSpecialityId = currentSpeciality.value.id;
  classForm.value.vocalEduGradeId = currentGrade.value.id;
  
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 编辑班级
const editVocalClass = (row) => {
  reset();
  dialogType.value = 'edit'

  //获取年级信息
  getVocalClass(row.id).then(response => {
    classForm.value = response.data
    //开启弹框
    dialogVisible.value = true
  })
}

// 删除班级
const deleteVocalClass = (row) => {
  ElMessageBox.confirm('确定要删除该班级吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    delVocalClass(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getVocalClassesByGrade(currentSpeciality.value)
        loading.value = true
      }else{
        ElMessage.error('删除失败')
      }
    })
  })
}

// 清空学生数据
const clearStudents = (row) => {
  ElMessageBox.confirm('确定要清空该班级的学生数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = classes.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      classes.value[index].studentCount = 0
    }
    ElMessage.success('清空成功')
  })
}

// 导入学生
const importStudents = (row) => {
  importDialogVisible.value = true
}

// 取消
const cancel = () => {
  reset();
  dialogVisible.value = false
}


// 保存/修改班级
const saveVocalClass = () => {
  console.log(classForm.value)
  if (!classFormRef.value) return
  try{
    classFormRef.value.validate((valid) => {
    if (valid) {
      if (classForm.value.id != null) {
        updateVocalClass(classForm.value).then(response => {
          if(response.code == 200){
            proxy.$modal.msgSuccess("修改成功");
            queryParams.value.vocalEduGradeId = classForm.value.vocalEduGradeId
            getList(queryParams.value);
          } 
        });
      } else {
        addVocalClass(classForm.value).then(response => {
          if(response.code == 200){
            proxy.$modal.msgSuccess("新增成功");
            queryParams.value.vocalEduGradeId = classForm.value.vocalEduGradeId
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

// 文件上传相关方法
const handleImportSuccess = (response) => {
  ElMessage.success('导入成功')
  importDialogVisible.value = false
}

const beforeImportUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  return true
}

const emit = defineEmits(['prev-step', 'next-step'])

const handlePrevStep = () => {
  emit('prev-step')
}

const handleNextStep = () => {
  if (filteredGrades.value.length === 0) {
    ElMessage.warning('请先添加年级')
    return
  }
  if (!currentGrade.value) {
    ElMessage.warning('请先选择年级')
    return
  }
  if (classList.value.length === 0) {
    ElMessage.warning('请至少添加一个班级')
    return
  }
  emit('next-step', classList.value)
}

// 添加年级点击处理函数
const handleGradeClick = (grade) => {
  currentGrade.value = grade
  // 获取该年级下的班级列表
  queryParams.value = {
    ...queryParams.value,
    vocalEduGradeId: grade.id,
    vocalEduSpecialityId: currentSpeciality.value.id,
    pageNum: 1
  }
  getList(queryParams.value)
}

</script>

<style scoped>
.class-management {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)),
  url('@/assets/school-bg.png');
  position: relative;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 16px;
}

.content-wrapper {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card,
.table-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.info-card {
  padding: 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.table-card {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.info-header,
.table-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
}

.header-icon {
  font-size: 18px;
  color: #409EFF;
  display: flex;
  align-items: center;
  height: 100%;
}

.info-header .el-icon,
.header-left .el-icon {
  font-size: 20px;
  color: #409EFF;
  margin-right: 8px;
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
}

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

.grade-section {
  padding: 0 20px 20px;
  border-top: 1px solid #ebeef5;
  margin: 0 20px;
}

.grade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.current-specialty {
  margin-left: auto;
}


.grade-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 200px;
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

/* 添加新的样式 */
.grade-subtitle {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.grade-empty {
  font-size: 12px;
  color: #f56c6c;
  margin-left: 8px;
}

.grade-section {
  margin-top: 16px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 