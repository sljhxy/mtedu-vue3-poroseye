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
          <div class="info-divider"></div>
          <div class="info-item">
            <span class="label">学段：</span>
            <span class="value">{{ schoolInfo.schoolPeriodName }}</span>
          </div>
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
              {{ speciality.specialityName }}-{{ speciality.id }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 年级管理表格 -->
      <div class="table-card">
        <div class="table-header">
          <div class="header-left">
            <el-icon class="header-icon"><List /></el-icon>
            <h3>年级管理</h3>
          </div>
          <div class="header-right">
            <el-input
              v-model="queryParams.gradeName"
              placeholder="请输入年级名称搜索"
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" plain @click="clickAddGrade" v-permission="['glxt:vocalGrade:add']">
              <el-icon><Plus /></el-icon>新增
            </el-button>
          </div>
        </div>

        <div class="table-container">
          <el-table :data="gradeList" v-loading="loading" style="width: 100%">
            <el-table-column type="index" width="70" label="序号" align="center"/>
            <el-table-column prop="collegeName" label="学院" align="center"/>
            <el-table-column prop="systemName" label="系" align="center"/>
            <el-table-column prop="specialityName" label="专业" align="center"/>
            <el-table-column prop="gradeName" label="年级" align="center"/>
            <el-table-column prop="academicYear" label="所属学年" align="center"/>
            <el-table-column label="操作" width="200" align="center">
              <template #default="scope">
                <el-button type="primary" link @click="editGrade(scope.row)" v-permission="['glxt:vocalGrade:edit']">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="danger" link @click="deleteGrade(scope.row)" v-permission="['glxt:vocalGrade:remove']">
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

    <!-- 年级编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加年级' : '编辑年级'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="gradeForm" label-width="80px" :rules="rules" ref="gradeFormRef">
        <el-form-item label="专业" prop="vocalEduSpecialityId">
          <el-select v-model="gradeForm.vocalEduSpecialityId" placeholder="请选择专业" class="w-full" disabled>
            <el-option
              v-for="speciality in specialities"
              :key="speciality.id"
              :label="speciality.specialityName"
              :value="speciality.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属学年" prop="academicYear">
          <el-date-picker
            class="w-full"
            v-model="gradeForm.academicYear"
            type="year"
            placeholder="选择入学年份"
            format="YYYY"
            value-format="YYYY"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="年级名称" prop="gradeName">
          <el-input v-model="gradeForm.gradeName" placeholder="请输入年级名称"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="saveGrade">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

//引入年级api
import { listVocalGrade, addVocalGrade, updateVocalGrade, delVocalGrade, getVocalGrade, checkVocalGrade } from '@/api/glxt/vocal_grade'

const { proxy } = getCurrentInstance();
// 接收父组件传递的数据
const props = defineProps({
  specialities: {//年专业列表
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
      schoolPeriod: '',
      educationLevel: ''
    })
  }
})

const currentSpeciality = ref(null)
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const dialogType = ref('add')
const gradeFormRef = ref(null)


const gradeForm = ref({
  id: null,
  vocalEduSpecialityId: '',//专业id
  academicYear: '',//所属学年
  gradeName: ''//年级名称
})

// 表单校验规则
const rules = {
  vocalEduSpecialityId: [{ required: true, message: '请选择专业', trigger: 'blur' }],
  gradeName: [{ required: true, message: '请输入年级名称', trigger: 'blur' }]
}

// 添加分页相关的响应式数据
const total = ref(0)

// 处理页码改变
const handleCurrentChange = (val) => {
  console.log(val + '=--------')
  queryParams.value.pageNum = val
  // 这里可以调用获取数据的方法
  getVocalGradeesBySpeciality(currentSpeciality.value)
}

// 处理每页条数改变
const handleSizeChange = (val) => {
  queryParams.value.pageSize = val
  // 这里调用获取数据的方法
  getVocalGradeesBySpeciality(currentSpeciality.value)
}


const gradeList = ref([]);
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  vocalEduSpecialityId: '',
  gradeName: ''
});


// 重置表单
const reset = () => {
  gradeForm.value = {
    id: null,
    vocalEduSpecialityId: null,//专业id
    academicYear: null,//所属学年
    gradeName: null//年级名称
  }
}
const loading = ref(false);
// 根据年级id获取年级列表的方法，添加分页逻辑
const getVocalGradeesBySpeciality = (speciality) => {
  queryParams.value.vocalEduSpecialityId = speciality.id;
  getList(queryParams.value);
  // 设置总数和更新表格数据
  // handleSearch()
}

// 获取年级列表
const getList = (params) => {
  loading.value = true;
  listVocalGrade(params).then(response => {
    gradeList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
};

// 添加搜索处理方法
const handleSearch = () => {
  queryParams.value.gradeId = currentSpeciality.value.id;
  getList(queryParams.value);

}

// 监听搜索关键词变化
watch(queryParams.value.name, () => {
  queryParams.value.pageNum = 1 // 重置页码
  handleSearch()
})

// 处理年级点击
const handleSpecialityClick = (speciality) => {
  currentSpeciality.value = speciality
  // 根据选中的年级获取年级列表
  getVocalGradeesBySpeciality(speciality)
  // 添加加载效果
  const loading = ElLoading.service({
    target: '.table-container',
    text: '加载中...'
  })
  // 模拟异步加载
  setTimeout(() => {
    loading.close()
    ElMessage.success(`已切换到${speciality.specialityName}`)
  }, 500)
}

// 初始化时默认选中第一个年级
const initDefaultGrade = () => {
  if (props.specialities && props.specialities.length > 0) {
    handleSpecialityClick(props.specialities[0])
  }
}

// 监听年级数据变化
watch(() => props.specialities, (newGrades) => {
  if (newGrades && newGrades.length > 0) {
    initDefaultGrade()
  }
}, { immediate: true })

// 添加年级
const clickAddGrade = () => {
  reset();
  //为专业赋值
  gradeForm.value.vocalEduSpecialityId = currentSpeciality.value.id
  if (!currentSpeciality.value) {
    ElMessage.warning('请先选择专业')
    return
  }
  
  dialogType.value = 'add'
  dialogVisible.value = true

}

// 编辑年级
const editGrade = (row) => {
  reset();
  dialogType.value = 'edit'

  //获取年级信息
  getVocalGrade(row.id).then(response => {
    gradeForm.value = response.data
    //开启弹框
    dialogVisible.value = true
  })
}

// 删除年级
const deleteGrade = (row) => {
  ElMessageBox.confirm('确定要删除该年级吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    delVocalGrade(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getVocalGradeesBySpeciality(currentSpeciality.value)
        loading.value = true
      }else{
        ElMessage.error('删除失败')
      }
    })
  })
}

// 取消
const cancel = () => {
  reset();
  dialogVisible.value = false
}


// 保存/修改年级
const saveGrade = () => {
  console.log(gradeForm.value)
  if (!gradeFormRef.value) return
  try{
    gradeFormRef.value.validate((valid) => {
    if (valid) {
      if (gradeForm.value.id != null) {
        updateVocalGrade(gradeForm.value).then(response => {
          if(response.code == 200){
            proxy.$modal.msgSuccess("修改成功");
            queryParams.value.gradeId = gradeForm.value.gradeId
            getList(queryParams.value);
          } 
        });
      } else {
        addVocalGrade(gradeForm.value).then(response => {
          if(response.code == 200){
            proxy.$modal.msgSuccess("新增成功");
            queryParams.value.gradeId = gradeForm.value.gradeId
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
  if (gradeList.value.length === 0) {
    ElMessage.warning('请至少添加一个年级')
    return
  }
  emit('next-step', gradeList.value)
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
  padding: 15px 0;
}

.grade-header .label {
  font-size: 14px;
  color: #909399;
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
</style> 