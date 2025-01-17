<template>
  <div class="experiment-list">
    <!-- 搜索区域 -->
    <div v-show="showSearch" class="search-form" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="类型" prop="contentType">
        <el-select v-model="searchForm.contentType" placeholder="请选择" style="width: 100px;" clearable  @change="schoolTypeChange">
          <el-option
            v-for="dict in mt_school_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学段" prop="periodType">
        <el-select v-model="searchForm.periodType" placeholder="请选择" style="width: 150px;" clearable>
          <el-option
            v-for="dict in educationStage.value"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
        <el-table-column prop="experimentName" label="实验名称" align="center"/>
        <el-table-column prop="schoolType" label="类型"  align="center" >
          <template #default="scope">
          <dict-tag :options="mt_school_type" :value="scope.row.schoolType"/>
        </template>
        </el-table-column>
        <el-table-column prop="academicStageType" label="学段"  align="center">
          <template #default="scope">
          <dict-tag :options="mt_school_type == '1' ? mt_academic_stage : mt_vocal_education_type" :value="scope.row.schoolType"/>
        </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核状态" align="center">
          <template #default="scope">
          <dict-tag :options="mt_experiment_audit_status" :value="scope.row.auditStatus"/>
        </template>
        </el-table-column>
        <el-table-column label="操作" width="500" align="center">
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
//导入实验信息API
import { listExperimentInfo, delExperimentInfo, toExamine } from '@/api/glxt/experimentInfo'

const { proxy } = getCurrentInstance();
const { mt_academic_stage, mt_school_type, mt_vocal_education_type, mt_experiment_audit_status } = proxy.useDict('mt_academic_stage', 'mt_school_type','mt_vocal_education_type', 'mt_experiment_audit_status');

const router = useRouter()
//学段
const educationStage = ref([])

//学校类型改变时，学段改变
const schoolTypeChange = (value) => {
  //清空学段的数据
  searchForm.value.periodType = '' 
    if(value == '1'){
        educationStage.value = mt_academic_stage
    }else{
        educationStage.value = mt_vocal_education_type
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
    pageNum: 1,
    pageSize: 10,
  }
}

// 模拟表格数据
const tableData = ref([])

// 设置总数据量为拟数据的长度
const total = ref(tableData.value.length)



//获取列表数据
const getListExperimentInfo = () => {
  listExperimentInfo(searchForm.value).then(response => {
    tableData.value = response.rows
    total.value = response.total
  })
}

//审核实验
const handleAudit = (row) => {
  // 实现审核逻辑
  ElMessageBox.confirm(
    `确定要审核实验 【${row.experimentName}】 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除逻辑
    toExamine(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('审核成功')
        getListExperimentInfo();
      } else {
        ElMessage.error('审核失败')
      }
    });
  }).catch(() => {
    ElMessage.info('取消审核')
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
</style>

