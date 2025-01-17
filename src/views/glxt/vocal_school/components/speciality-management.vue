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
            <span class="value">{{ schoolInfo?.name }}-{{ schoolInfo?.id }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <span class="label">学校类型：</span>
            <span class="value">{{ schoolInfo.educationLevelName }}</span>
          </div>
          <!-- <div class="info-divider"></div> -->
          <!-- <div class="info-item">
            <span class="label">学段：</span>
            <span class="value">{{ schoolInfo.schoolPeriodName }}-{{ schoolInfo.schoolPeriod }}</span>
          </div> -->
        </div>
        <div class="grade-section" v-show="schoolInfo.isSystem == '1'">
          <div class="grade-header">
            <span class="label">系列表</span>
          </div>
          <div class="grade-tags">
            <el-tag
              v-for="system in systems"
              :key="system.id"
              :type="currentSystem?.systemName === system.systemName ? 'primary' : 'info'"
              class="grade-tag"
              @click="handleSystemClick(system)"
            >
              {{ system.systemName }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 专业管理表格 -->
      <div class="table-card">
        <div class="table-header">
          <div class="header-left">
            <el-icon class="header-icon"><List /></el-icon>
            <h3>专业管理</h3>
          </div>
          <div class="header-right">
            <el-input
              v-model="queryParams.specialityAbbreviation"
              placeholder="请输入专业简称"
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" plain @click="clickAddSpeciality" v-permission="['glxt:vocalSpeciality:add']">
              <el-icon><Plus /></el-icon>新增
            </el-button>
          </div>
        </div>

        <div class="table-container">
          <el-table :data="specialityList" v-loading="loading" style="width: 100%">
            <el-table-column type="index" width="70" label="序号" align="center"/>
            <el-table-column prop="schoolPeriod" label="学段" align="center">
              <template #default="scope">
                {{ getisPeriod(scope.row.schoolPeriod) }}
              </template>
            </el-table-column>
            <el-table-column prop="schoolYear" label="学制" align="center">
              <template #default="scope">
                {{ getisYear(scope.row.schoolYear) }}
              </template>
            </el-table-column>
            <!-- <el-table-column prop="collegeName" label="学院" align="center"/>
            <el-table-column prop="systemName" label="系" align="center"/> -->
            <el-table-column prop="specialityName" label="专业名称" align="center"/>
            <!-- <el-table-column prop="specialityName" label="专业名称" align="center">
              <template #default="scope">
                {{ getSpecialityDictLabel(scope.row.specialityName) }}
              </template>
            </el-table-column> -->
            <el-table-column prop="specialityAbbreviation" label="专业简称" align="center"/>
            <el-table-column prop="specialityDesc" label="专业描述" align="center"/>
            <el-table-column label="操作"  align="center">
              <template #default="scope">
                <el-button type="primary" link @click="editSpeciality(scope.row)" v-permission="['glxt:speciality:edit']">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="danger" link @click="deleteSpeciality(scope.row)" v-permission="['glxt:speciality:remove']">
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

    <!-- 专业编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加专业' : '编辑专业'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="specialityForm" label-width="80px" :rules="rules" ref="specialityFormRef">
        
        <el-form-item label="系" prop="vocalEduSystemId" v-show="schoolInfo.isSystem == '1'">
          <el-select v-model="specialityForm.vocalEduSystemId" placeholder="请选择系" class="w-full" disabled>
            <el-option
              v-for="system in systems"
              :key="system.id"
              :label="system.systemName"
              :value="system.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="学段" prop="schoolPeriod">
          <el-select v-model="specialityForm.schoolPeriod" placeholder="请选择学段" clearable>
              <el-option v-for="item in mt_vocal_education_type" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="学制" prop="schoolYear">
          <el-select v-model="specialityForm.schoolYear" placeholder="请选择学制" clearable>
              <el-option v-for="item in mt_vocal_education_system_type" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业名称" prop="specialityName">
          <el-input v-model="specialityForm.specialityName" placeholder="请输入专业名称" class="w-full" clearable/>
          <!-- <el-select v-model="specialityForm.specialityName" placeholder="请选择专业" class="w-full" clearable>
            <el-option
              v-for="speciality in mt_vocal_speciality_type"
              :key="speciality.value"
              :label="speciality.label"
              :value="speciality.value"/>
          </el-select> -->
        </el-form-item>
        <el-form-item label="专业简称" prop="specialityAbbreviation">
          <el-input v-model="specialityForm.specialityAbbreviation" placeholder="请输入专业简称" class="w-full" clearable/>
        </el-form-item>
        <el-form-item label="专业描述" prop="specialityDesc">
          <el-input v-model="specialityForm.specialityDesc" placeholder="请输入专业描述" class="w-full" clearable/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="saveSpeciality">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

//引入专业api
import { listSpeciality, addSpeciality, updateSpeciality, getSpeciality , delSpeciality} from '@/api/glxt/vocal_speciality'

const { proxy } = getCurrentInstance();
// 专业字典引入
const { mt_vocal_speciality_type, mt_vocal_education_type, mt_vocal_education_system_type} = proxy.useDict('mt_vocal_speciality_type', 'mt_vocal_education_type', 'mt_vocal_education_system_type');

//获取学段
const getisPeriod = (schoolType) => {
  if (!schoolType || !mt_vocal_education_type.value) return '';
  const found = mt_vocal_education_type.value.find(item => item.value === schoolType.toString());
  return found ? found.label : '';
}

//获取学制
const getisYear = (schoolSystem) => {
  if (!schoolSystem || !mt_vocal_education_system_type.value) return '';
  const found = mt_vocal_education_system_type.value.find(item => item.value === schoolSystem.toString());
  return found ? found.label : '';
}

// 接收父组件传递的数据
const props = defineProps({
  systems: {//系列表
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
      educationLevel: '',
      schoolPeriod: '',
      schoolPeriodName: ''
    })
  }
})

const currentSystem = ref(null)
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const dialogType = ref('add')
const specialityFormRef = ref(null)

const specialityForm = ref({
  id: null,
  schoolId: '',//学校id
  schoolPeriod: '',//学段
  schoolYear: '',//学制
  vocalEduSystemId: '',//系列id或者学校 Id
  specialityName: '',//专业名称
  specialityAbbreviation: '',//专业简称
  specialityDesc: '',//专业描述
})


// 表单校验规则
const rules = {
  vocalEduSystemId: [{ required: true, message: '请选择系', trigger: 'change' }],
  specialityName: [{ required: true, message: '请选择专业', trigger: 'change' }],
  specialityAbbreviation: [{ required: true, message: '请输入专业简称', trigger: 'change' }]
}

// 添加分页相关的响应式数据
const total = ref(0)

// 处理页码改变
const handleCurrentChange = (val) => {
  console.log(val + '=--------')
  queryParams.value.pageNum = val
  // 这里可以调用获取数据的方法
  getSpecialityesBySystem(currentSystem.value)
}

// 处理每页条数改变
const handleSizeChange = (val) => {
  queryParams.value.pageSize = val
  // 这里调用获取数据的方法
  getSpecialityesBySystem(currentSystem.value)
}

//专业列表
const specialityList = ref([]);

//搜索参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  schoolId: '',
  vocalEduSystemId: '',
  specialityName: '',
  specialityAbbreviation: '',
});


// 重置表单
const reset = () => {
  specialityForm.value = {
    id: null,
    vocalEduSystemId: null,//系列id
    specialityName: null,//专业名称
    specialityAbbreviation: null,//专业简称
    specialityDesc: null,//专业描述
  }
}
const loading = ref(false);



// 根据年级id获取专业列表的方法，添加分页逻辑
const getSpecialityesBySystem = (system) => {
  if(props.schoolInfo.isSystem == '1'){//专科院校 并且没有系的情况下
    queryParams.value.vocalEduSystemId = system.id;//获取学系id
  }else{//专科院校
    queryParams.value.schoolId = props.schoolInfo.id
    queryParams.value.vocalEduSystemId = props.schoolInfo.id//获取学校id
  }
  // queryParams.value.vocalEduSystemId = system.id;
  getList(queryParams.value);
  // 设置总数和更新表格数据
  // handleSearch()
}

// 获取专业列表
const getList = (params) => {
  loading.value = true;
  listSpeciality(params).then(response => {
    specialityList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
};


// 监听学院数据变化
watch(() => props.schoolInfo.isSystem, (newSystems) => {
  
  if(newSystems == '0') {
    queryParams.value.vocalEduSystemId = props.schoolInfo.id//获取学校id
    getList(queryParams.value);  
  }
  
  
}, { immediate: true })

// 添加搜索处理方法
const handleSearch = () => {
  queryParams.value.vocalEduSystemId = currentSystem.value.id;
  getList(queryParams.value);

}

// 监听搜索关键词变化
watch(() => queryParams.value.specialityName, () => {
  queryParams.value.pageNum = 1 // 重置页码
  handleSearch()
})

// 处理系点击
const handleSystemClick = (system) => {
  currentSystem.value = system
  // 根据选中的年级获取专业列表
  getSpecialityesBySystem(system)
  // 添加加载效果
  const loading = ElLoading.service({
    target: '.table-container',
    text: '加载中...'
  })
  // 模拟异步加载
  setTimeout(() => {
    loading.close()
    ElMessage.success(`已切换到${system.systemName}`)
  }, 500)
}

// 初始化时默认选中第一个年级
const initDefaultSystem = () => {
  if (props.systems && props.systems.length > 0) {
    handleSystemClick(props.systems[0])
  }
}

// 监听系的数据变化
watch(() => props.systems, (newSystems) => {
  if (newSystems && newSystems.length > 0) {
    initDefaultSystem()
  }
}, { immediate: true })

// 添加专业
const clickAddSpeciality = () => {
  reset();

  if(props.schoolInfo.isSystem == '1'){//专科院校 并且没有系的情况下
      specialityForm.value.vocalEduSystemId = currentSystem.value.id//获取学系id
  }else{//专科院校
    specialityForm.value.schoolId = props.schoolInfo.id
    specialityForm.value.vocalEduSystemId = props.schoolInfo.id//获取学校id
  }

  //给系赋值获取当前选中的系id
  // specialityForm.value.vocalEduSystemId = currentSystem.value.id

  if(props.schoolInfo.isSystem == '1'){
    if (!currentSystem.value) {
    ElMessage.warning('请先选择系')
    return
  }
  }

  
  dialogType.value = 'add'
  dialogVisible.value = true

}

// 编辑专业
const editSpeciality = (row) => {
  reset();
  dialogType.value = 'edit'

  //获取年级信息
  getSpeciality(row.id).then(response => {
    specialityForm.value = response.data
    //开启弹框
    dialogVisible.value = true
  })
}

// 删除专业
const deleteSpeciality = (row) => {
  ElMessageBox.confirm('确定要删除该专业吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    delSpeciality(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getSpecialityesBySystem(currentSystem.value)
        loading.value = true
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.error('取消删除')
  })
}


// 取消
const cancel = () => {
  reset();
  dialogVisible.value = false
}

// 保存/修改专业
const saveSpeciality = () => {
  console.log(specialityForm.value)
  if (!specialityFormRef.value) return
  try{
    specialityFormRef.value.validate((valid) => {
    if (valid) {
      // if(props.schoolInfo.isSystem == '1'){//专科院校 并且没有系的情况下
      //   specialityForm.value.vocalEduSystemId = currentSystem.value.id//获取学系id
      // }else{//专科院校
      //   specialityForm.value.vocalEduSystemId = props.schoolInfo.id//获取学校id
      // }
      if(props.schoolInfo.isSystem == '1'){//专科院校 并且没有系的情况下
        queryParams.value.vocalEduSystemId = currentSystem.value.id//获取学系id
      }else{//专科院校
        queryParams.value.schoolId = props.schoolInfo.id
        queryParams.value.vocalEduSystemId = props.schoolInfo.id//获取学校id
      }
      if (specialityForm.value.id != null) {
        updateSpeciality(specialityForm.value).then(response => {
          if(response.code == 200){
            proxy.$modal.msgSuccess("修改成功");
           // queryParams.value.vocalEduSystemId = currentSystem.value.id
            getList(queryParams.value);
          } 
        });
      } else {
        addSpeciality(specialityForm.value).then(response => {
          if(response.code == 200){
            proxy.$modal.msgSuccess("新增成功");
            // queryParams.value.vocalEduSystemId = currentSystem.value.id
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

const emit = defineEmits(['prev-step', 'next-step'])

const handlePrevStep = () => {
  emit('prev-step')//子传父
}

const handleNextStep = () => {
  if (specialityList.value.length === 0) {
    ElMessage.warning('请至少添加一个专业')
    return
  }
  emit('next-step', specialityList.value)
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