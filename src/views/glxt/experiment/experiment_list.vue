<template>
  <div class="experiment-list">
    <!-- 搜索区域 -->
    <div v-show="showSearch" class="search-form" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="实验名称">
          <el-input v-model="searchForm.name" placeholder="请输入实验名称" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select 
            v-model="searchForm.type" 
            placeholder="请选择类型"
            style="width: 150px"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学段">
          <el-select 
            v-model="searchForm.stage" 
            placeholder="请选择学段"
            style="width: 150px"
          >
            <el-option
              v-for="item in stageOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="请选择审核状态"
            style="width: 150px"
          >
            <el-option
              v-for="item in statusOptions"
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
        <el-button type="primary"  plain icon="Plus" @click="handleAdd">新增</el-button>
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
        <el-table-column prop="name" label="实验名称" min-width="100" align="center" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="150" align="center" />
        <el-table-column prop="stage" label="学段" width="200" align="center" />
        <el-table-column prop="textbook" label="教材版本" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="审核状态" width="200" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]" effect="light">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="380" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button 
                type="success" 
                plain
                @click="handlePreview(scope.row)"
              >
                <el-icon><View /></el-icon>
                <span>预览</span>
              </el-button>
              <el-button 
                type="primary" 
                plain
                @click="handleEdit(scope.row)"
              >
                <el-icon><Edit /></el-icon>
                <span>修改</span>
              </el-button>
              <el-button 
                type="warning" 
                plain
                @click="handleAudit(scope.row)"
              >
                <el-icon><Check /></el-icon>
                <span>审核</span>
              </el-button>
              <el-button 
                type="danger" 
                plain
                @click="handleDelete(scope.row)"
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ArrowUp, ArrowDown, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索表单数据
const searchForm = reactive({
  name: '',
  type: '',
  stage: '',
  status: ''
})

// 下拉选项
const typeOptions = [
  { value: '1', label: '虚拟实验' },
  { value: '2', label: '实体实验' }
]

const stageOptions = [
  { value: '1', label: '小学' },
  { value: '2', label: '初中' },
  { value: '3', label: '高中' }
]

const statusOptions = [
  { value: '0', label: '待审核' },
  { value: '1', label: '已通过' },
  { value: '2', label: '已拒绝' }
]

// 模拟表格数据
const tableData = ref([
  {
    id: 1,
    name: '光的反射与折射实验',
    type: '虚拟实验',
    stage: '初中',
    textbook: '人教版物理八年级上册',
    status: '已通过'
  },
  {
    id: 2,
    name: '电磁感应实验',
    type: '实体实验',
    stage: '高中',
    textbook: '人教版物理必修二',
    status: '待审核'
  },
  {
    id: 3,
    name: '植物的光合作用',
    type: '虚拟实验',
    stage: '初中',
    textbook: '人教版生物七年级下册',
    status: '已通过'
  },
  {
    id: 4,
    name: '简单机械实验',
    type: '实体实验',
    stage: '小学',
    textbook: '人教版科学六年级',
    status: '已拒绝'
  }
])

// 设置总数据量为���拟数据的长度
const total = ref(tableData.value.length)

// 状态样式映射
const statusTypeMap = {
  '待审核': 'warning',
  '已通过': 'success',
  '已拒绝': 'danger'
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

// 分页相关的响应式数据
const currentPage = ref(1)
const pageSize = ref(10)

// 方法定义
const handleSearch = () => {
  currentPage.value = 1  // 搜索时重置为第一页
  getPageData()
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1  // 重置时回到第页
  total.value = tableData.value.length
  getPageData()
}

const handleAdd = () => {
  router.push('/glxt/experiment/experiment_steps')
}

const handlePreview = (row) => {
  router.push({
    path: '/glxt/experiment/experiment_steps',
    query: {
      id: row.id,
      mode: 'preview'
    }
  })
}

const handleEdit = (row) => {
  router.push({
    path: '/glxt/experiment/experiment_steps',
    query: {
      id: row.id,
      mode: 'edit'
    }
  })
}

const handleAudit = (row) => {
  // 实现审核逻辑
}

const handleDelete = (row) => {
  // 实现删除逻辑
}

// 处理分页方法的优化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1  // 切换每页条数时重置为第一页
  getPageData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getPageData()
}

// 获取分页数据的方法
const getPageData = () => {
  // 先过滤数据
  const filteredData = tableData.value.filter(item => {
    const nameMatch = !searchForm.name || item.name.includes(searchForm.name)
    const typeMatch = !searchForm.type || item.type === searchForm.type
    const stageMatch = !searchForm.stage || item.stage === searchForm.stage
    const statusMatch = !searchForm.status || item.status === searchForm.status
    return nameMatch && typeMatch && stageMatch && statusMatch
  })
  
  // 更新总数据量
  total.value = filteredData.length
  
  // 计算当前页的数据
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.slice(start, end)
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

