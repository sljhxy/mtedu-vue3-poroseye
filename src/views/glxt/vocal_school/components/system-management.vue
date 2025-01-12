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
            <span class="value">{{ schoolInfo.schoolPeriodName }}-{{ schoolInfo.schoolPeriod }}</span>
          </div> -->
        </div>
        <!-- 只有为本科院校时，才显示学院列表 1本科 -->
        <div class="college-section" v-show="schoolInfo.isCollege == '1'">
          <div class="college-header">
            <span class="label">学院列表</span>
            {{ currentCollege }}
            {{ colleges }}
          </div>
          <div class="college-tags">
            <el-tag
              v-for="college in colleges"
              :key="college.id"
              :type="currentCollege?.collegeName === college.collegeName ? 'primary' : 'info'"
              class="college-tag"
              @click="handleCollegeClick(college)"
            >
              {{ college.collegeName }}-{{ college.id }}-{{ currentCollege.id }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 院系管理表格 -->
      <div class="table-card">
        <div class="table-header">
          <div class="header-left">
            <el-icon class="header-icon"><List /></el-icon>
            <h3>系管理</h3>
          </div>
          <div class="header-right">
            <el-input
              v-model="queryParams.systemName"
              placeholder="请输入系名称"
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" plain @click="clickAddSystem" v-permission="['glxt:system:add']">
              <el-icon><Plus /></el-icon>新增
            </el-button>
          </div>
        </div>

        <div class="table-container">
          <el-table :data="systemList" v-loading="loading" style="width: 100%">
            <el-table-column type="index" width="70" label="序号" align="center"/>
            <el-table-column prop="collegeName" label="学院" align="center" v-if="schoolInfo.schoolPeriod == 1">
              {{ currentCollege?.collegeName }}
            </el-table-column>
            <el-table-column prop="schoolName" label="学校" align="center" v-else>
              {{ schoolInfo?.name }}
            </el-table-column>
            <el-table-column prop="systemName" label="系" align="center"/>
            <el-table-column prop="contactName" label="联系人" align="center"/>
            <el-table-column prop="contactPhone" label="联系电话" align="center"/>
            <el-table-column label="操作" align="center">
              <template #default="scope">
                <el-button type="primary" link @click="editSystem(scope.row)" v-permission="['glxt:system:edit']">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="danger" link @click="deleteSystem(scope.row)" v-permission="['glxt:system:remove']">
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

    <!-- 院系编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加院系' : '编辑院系'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="systemForm" label-width="80px" :rules="rules" ref="systemFormRef">
        <el-form-item label="学院" prop="collegeId" v-if="schoolInfo.schoolPeriod == 1">
          <el-select v-model="systemForm.schoolOrCollegeId" placeholder="请选择学院" class="w-full" disabled>
            <el-option
              v-for="college in colleges"
              :key="college.id"
              :label="college.collegeName"
              :value="college.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="院系名称" prop="systemName">
          <el-input v-model="systemForm.systemName" placeholder="请输入院系名称"/>
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
            <el-input v-model="systemForm.contactName"  placeholder="请输入联系人"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="systemForm.contactPhone"  placeholder="请输入联系电话"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="saveSystem">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

//引入院系api
import { listSystem, addSystem, updateSystem, getSystem , delSystem, checkSystem } from '@/api/glxt/vocal_system'

const { proxy } = getCurrentInstance();
// 接收父组件传递的数据
const props = defineProps({
  colleges: {//学院列表
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

const currentCollege = ref(null)
const dialogVisible = ref(false)
const dialogType = ref('add')
const systemFormRef = ref(null)


const systemForm = ref({
    id: null,
    schoolOrCollegeId: '',
    educationLevel: '',
    systemName: '',
    contactName: '',
    contactPhone: '',
    collegeId:''
})

// 表单校验规则
const rules = {
  // collegeId: [{ required: true, message: '请选择年级', trigger: 'change' }],
  // baseEduLevelType: [{ required: true, message: '请选入学时间', trigger: 'change' }],
  systemName: [
    { required: true, message: '请输入院系名称', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ]
}

// 添加分页相关的响应式数据
const total = ref(0)

// 处理页码改变
const handleCurrentChange = (val) => {
  console.log(val + '=--------')
  queryParams.value.pageNum = val
  // 这里可以调用获取数据的方法
  getSystemsByCollege(currentCollege.value)
}

// 处理每页条数改变
const handleSizeChange = (val) => {
  queryParams.value.pageSize = val
  // 这里调用获取数据的方法
  getSystemsByCollege(currentCollege.value)
}


const systemList = ref([]);
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  schoolOrCollegeId: '',//院id或者学校id
  systemName: ''//院系名称
});


// 重置表单
const reset = () => {
  systemForm.value = {
    id: null,
    schoolOrCollegeId: null,
    educationLevel: null,
    systemName: null,
    contactName: null,
    contactPhone: null
  };    
}

const loading = ref(false);
// 根据年级id获取院系列表的方法，添加分页逻辑
const getSystemsByCollege = (college) => {
  queryParams.value.schoolOrCollegeId = college.id;
  getList(queryParams.value);
  // 设置总数和更新表格数据
  // handleSearch()
}

// 获取院系列表
const getList = (params) => {
  loading.value = true;
  listSystem(params).then(response => {
    systemList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
};


// 添加搜索处理方法
const handleSearch = () => {

  if(props.schoolInfo.schoolPeriod == 1){//只有在本科院校时，才根据学院id获取院系列表
    console.log('搜索关键词为：' + currentCollege.value.id + '=' + queryParams.value.systemName)
    queryParams.value.schoolOrCollegeId = currentCollege.value.id;
  }else{//专科院校
    queryParams.value.schoolOrCollegeId = props.schoolInfo.id;
  }
  getList(queryParams.value);

}

// 在组件挂载时，根据学校类型获取院系列表  
onMounted(() => {
  if(props.schoolInfo.schoolPeriod != 1){//只有在非本科院校时，才根据学校id获取院系列表
    queryParams.value.schoolOrCollegeId = props.schoolInfo.id;
    getList(queryParams.value);
    console.log('学校id为==========================》：' + props.schoolInfo.id)
  }
})


// 监听搜索关键词变化
watch(()=> queryParams.value.systemName, () => {
  queryParams.value.pageNum = 1 // 重置页码
  handleSearch()
})

// 处理学院点击
const handleCollegeClick = (college) => {
  currentCollege.value = college
  // 根据选中的年学院获取院系列表
  getSystemsByCollege(college)
  // 添加加载效果
  const loading = ElLoading.service({
    target: '.table-container',
    text: '加载中...'
  })
  // 模拟异步加载
  setTimeout(() => {
    loading.close()
    ElMessage.success(`已切换到${college.collegeName}学院下的系列表`)
  }, 500)
}

// 初始化时默认选中第一个学院
const initDefaultCollege = () => {
  if (props.colleges && props.colleges.length > 0) {
    handleCollegeClick(props.colleges[0])
  }
}

// 监听学院数据变化
watch(() => props.colleges, (newColleges) => {
  if (newColleges && newColleges.length > 0) {
    initDefaultCollege()
  }
}, { immediate: true })

// 添加院系
const clickAddSystem = () => {
  reset();
  
  if(props.schoolInfo.schoolPeriod == 1){//只有在本科院校时，才需要选择学院
    //给弹框中的学院赋值学院id
    systemForm.value.schoolOrCollegeId = currentCollege.value.id
    if (!currentCollege.value) {
      ElMessage.warning('请先选择学院')
      return
    }
  }
  
  dialogType.value = 'add'
  dialogVisible.value = true

}

// 编辑院系
const editSystem = (row) => {
  reset();
  dialogType.value = 'edit'

  //获取院系信息
  getSystem(row.id).then(response => {
    systemForm.value = response.data
    //开启弹框
    dialogVisible.value = true
  })
}

// 删除院系
const deleteSystem = (row) => {
  ElMessageBox.confirm('确定要删除该院系吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    delSystem(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        if(props.schoolInfo.schoolPeriod == 1){//只有在本科院校时，才根据学院id获取院系列表
          getSystemsByCollege(currentCollege.value)
        }else{//专科院校
          queryParams.value.schoolOrCollegeId = props.schoolInfo.id;//获取学校id
          getList(queryParams.value);
        }
        loading.value = true
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}


// 取消
const cancel = () => {
  reset();
  dialogVisible.value = false
}


// 保存/修改院系
const saveSystem = () => {
  console.log(systemForm.value)
  if (!systemFormRef.value) return
  try{
    systemFormRef.value.validate((valid) => {
    if (valid) {
      debugger
      if(props.schoolInfo.isCollege == '1'){//本科院校
        systemForm.value.schoolOrCollegeId = currentCollege.value.id//获取学院id
      }else{//专科院校
        systemForm.value.schoolOrCollegeId = props.schoolInfo.id//获取学校id
      }
      if (systemForm.value.id != null) {
        updateSystem(systemForm.value).then(response => {
          if(response.code == 200){
            proxy.$modal.msgSuccess("修改成功");
            queryParams.value.schoolOrCollegeId = systemForm.value.schoolOrCollegeId
            getList(queryParams.value);
          } 
        });
      } else {
        addSystem(systemForm.value).then(response => {
          if(response.code == 200){
            proxy.$modal.msgSuccess("新增成功");
            queryParams.value.schoolOrCollegeId = systemForm.value.schoolOrCollegeId
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

//子组件向父组件发送事件
const emit = defineEmits(['prev-step', 'next-step'])

// 返回上一步
const handlePrevStep = () => {
  emit('prev-step')
}

// 下一步
const handleNextStep = () => {
  if (systemList.value.length === 0) {
    ElMessage.warning('请至少添加一个院系')
    return
  }
  emit('next-step', systemList.value)
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

.college-section {
  padding: 0 20px 20px;
  border-top: 1px solid #ebeef5;
  margin: 0 20px;
}

.college-header {
  padding: 15px 0;
}

.college-header .label {
  font-size: 14px;
  color: #909399;
}

.college-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.college-tag {
  cursor: pointer;
  transition: all 0.3s;
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
}

.college-tag:hover {
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