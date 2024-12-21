<template>
  <div class="college-management">
    <div class="content-wrapper">
      <!-- 学校信息展示 -->
      <div class="info-card">
        <div class="info-header">
          <el-icon><School /></el-icon>
          <h3>学校信息</h3>
        </div>
        <div class="info-content">
          <div class="info-item">
            <span class="label">学校名称：</span>
            <span class="value">{{ schoolInfo.name }}-{{ schoolInfo.id }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <span class="label">学校类型：</span>
            <span class="value">{{ schoolInfo.educationLevelName }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <span class="label">学段：</span>
            <span class="value">{{ schoolInfo.schoolPeriodName }}-{{ schoolInfo.schoolYearName }}-{{ schoolInfo.schoolPeriod }}</span>
          </div>
        </div>
      </div>

      <!-- 年学院管理表格 -->
      <div class="table-card">
        <div class="table-header">
          <div class="header-left">
            <el-icon class="header-icon"><List /></el-icon>
            <h3>学院管理</h3>
            <!-- {{ schoolInfo.id }} -->
          </div>
          <el-button type="primary" plain @click="clickAddHandle" v-hasPermi="['glxt:college:add']">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>

        <el-table :data="collegeList"  style="width: 100%" v-loading="loading">
          <!-- 序号 -->
          <el-table-column type="index" width="70" label="序号" align="center"/>
          <el-table-column prop="educationLevelName" label="学校类型" align="center">
            {{ schoolInfo.educationLevelName }}
          </el-table-column>
          <el-table-column prop="schoolPeriodName" label="学段" align="center">
            {{ schoolInfo.schoolPeriodName }}
          </el-table-column>
          <el-table-column prop="collegeName" label="学院名称" align="center"/>
          <el-table-column prop="contactName" label="联系人" align="center"/>
          <el-table-column prop="contactPhone" label="联系电话" align="center"/>
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button type="primary" link @click="editCollege(scope.row)" v-hasPermi="['glxt:college:edit']">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="danger" link @click="deleteCollege(scope.row)" v-hasPermi="['glxt:college:remove']">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
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
    </div>

    <!-- 添加学院编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加学院' : '编辑学院'"
      width="500px"
      destroy-on-close>
      <el-form :model="collegeFrom" label-width="100px" :rules="rules" ref="collegeFromRef">
        <el-form-item label="学校类型" prop="educationLevel">
          <el-input v-model="collegeFrom.educationLevel" :value="schoolInfo.educationLevelName" disabled/>
        </el-form-item>
        <el-form-item label="学段" prop="schoolPeriod">
          <el-input v-model="collegeFrom.schoolPeriod" :value="schoolInfo.schoolPeriodName" disabled/>
        </el-form-item>
        <el-form-item label="学院名称" prop="collegeName">
            <el-input v-model="collegeFrom.collegeName"  placeholder="请输入学院名称"/>
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
            <el-input v-model="collegeFrom.contactName"  placeholder="请输入联系人"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="collegeFrom.contactPhone"  placeholder="请输入联系电话"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="saveCollege">确定</el-button>
        </span>
      </template>
    </el-dialog>


  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const { proxy } = getCurrentInstance();
//导入学院相关接口
import { listCollege, getCollege, addCollege, updateCollege, delCollege, checkCollege } from '@/api/glxt/vocal_college'
// const collegeFromRef = ref(null)
// 接收父组件传递的学校信息
const props = defineProps({
  schoolInfo: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '',
      educationLevel: '',
      educationLevelName: '',
      schoolPeriod: '',
      schoolPeriodName: '',
      schoolYear: '',
      schoolYearName: ''
    })
  }
})

// 分页相关
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  vocalEduSchoolId: props.schoolInfo.id
})
// 添加分页相关的响应式数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

//重置表单
const reset = () => {
  collegeFrom.value = {
    id: null,
    collegeName: null,
    vocalEduSchoolId: props.schoolInfo.id,
    educationLevel: props.schoolInfo.educationLevel,
    schoolPeriod: props.schoolInfo.schoolPeriod,
    schoolPeriodName: props.schoolInfo.schoolPeriodName,
    schoolYear: props.schoolInfo.schoolYear,
    schoolYearName: props.schoolInfo.schoolYearName,
    contactName: null,
    contactPhone: null
  }
  proxy.resetForm("collegeFromRef");
}

// 表单校验规则
const rules = {
  collegeName: [
    { required: true, message: '请输入学院名称', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ]
}
// 加载状态
const loading = ref(false)


const dialogVisible = ref(false)
const dialogType = ref('add')

const collegeFrom = ref({
  id: null,
  collegeName: '',
  vocalEduSchoolId: props.schoolInfo.id,//学校id  
  educationLevel: props.schoolInfo.educationLevel,//学校类型
  schoolPeriod: props.schoolInfo.schoolPeriod,//学段
  schoolPeriodName: props.schoolInfo.schoolPeriodName,//学段名称
  schoolYear: props.schoolInfo.schoolYear,//学年
  schoolYearName: props.schoolInfo.schoolYearName,//学年名称
  contactName: '',//联系人
  contactPhone: '',//联系电话
})

//学院列表
const collegeList = ref([]);

//获取学院列表
const getList = () =>{
  loading.value = true;
  listCollege(queryParams.value).then(response => {
    collegeList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
};


// 添加学院弹框
const clickAddHandle = () => {
  reset();
  dialogType.value = 'add'
  dialogVisible.value = true
}

const editCollege = (row) => {
  reset();
  dialogType.value = 'edit'

  //获取学院信息
  getCollege(row.id).then(response => {
    collegeFrom.value = response.data
    //开启弹框
    dialogVisible.value = true
  })
}

//删除学院
const deleteCollege = (row) => {
  ElMessageBox.confirm('确定要删除该学院吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delCollege(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}


// 修改保存方法
const saveCollege = () => {
  console.log(collegeFrom.value)
  try{
    proxy.$refs["collegeFromRef"].validate(valid => {
    if (valid) {
      if (collegeFrom.value.id != null) {
        console.log(1)
        updateCollege(collegeFrom.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          getList();
        });
      } else {
        console.log(2)
        console.log(collegeFrom.value)
        addCollege(collegeFrom.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          getList();
        });
      }
    }
  });
  }catch(error){
    ElMessage.error('操作失败')
  } finally {
    dialogVisible.value = false//关闭弹框
  }
}

//取消
const cancel = () => {
  reset();
  dialogVisible.value = false
}

const emit = defineEmits(['prev-step', 'next-step'])

const handlePrevStep = () => {
  emit('prev-step')
}
const handleNextStep = () => {
  if (collegeList.value.length === 0) {
    ElMessage.warning('请至少添加一个学院')
    return
  }
  // 传递学院数据
  emit('next-step', collegeList.value)

}


// 处理页码改变
const handleCurrentChange = (val) => {
  queryParams.value.pageNum = val
  currentPage.value = val
  getList();
}

// 处理每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = queryParams.value.pageNum++
  
  getList();
}

getList()// 学院列表
</script>

<style scoped>
.college-management {
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
  padding-bottom: 100px;
}

.info-card,
.table-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  
}

.info-card {
  padding: 20px;
  flex-shrink: 0; /* 防止内容压缩 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.table-card {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 确保flex布局正常工作 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 表格容器样式 */
:deep(.el-table) {
  flex: 1;
  height: 100%;
}

:deep(.el-table__body-wrapper) {
  height: calc(100% - 40px); /* 减去表头高度 */
  overflow-y: auto;
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

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  line-height: 32px;
}

.table-header :deep(.el-button) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  height: 32px;
}

.table-header :deep(.el-button .el-icon) {
  margin: 0;
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

.info-row {
  display: flex;
  align-items: center;
  gap: 4px;
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

.w-full {
  width: 100%;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__body) {
  padding: 24px 20px;
}

:deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
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