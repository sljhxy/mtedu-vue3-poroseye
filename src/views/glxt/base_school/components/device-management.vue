<template>
  <div class="device-management">
  
    <div class="content-wrapper">
      <!-- 学校信息卡片 -->
      <div class="info-card">
        <div class="info-header">
          <div class="header-left">
            <el-icon><School /></el-icon>
            <h3>基本信息</h3>
          </div>
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
      </div>

      <!-- 设备管理列表 -->
      <div class="info-card">
        <div class="info-header">
          <div class="header-left">
            <el-icon><Monitor /></el-icon>
            <h3>设备管理</h3>
          </div>
          <div class="header-right">
            <el-input
              v-model="queryParams.deviceNo"
              placeholder="请输入设备号搜索"
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
        <div class="device-content">
          <el-table :data="deviceList" style="width: 100%" v-loading="loading">
            <el-table-column prop="deviceNo" label="设备号" align="center"/>
            <el-table-column prop="isBinding" label="绑定状态" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.isBinding === '1' ? 'success' : 'info'">
                  {{ scope.row.isBinding === '1' ? '已绑定' : '未绑定' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="isStateActivation" label="激活状态" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.isStateActivation === '1' ? 'success' : 'info'">
                  {{ scope.row.isStateActivation === '1' ? '已激活' : '未激活' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="isStart" label="启动状态" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.isStart === '1' ? 'success' : 'info'">
                  {{ scope.row.isStart === '1'? '已启动' : '未启动' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="起止时间" width="300" align="center">
              <template #default="scope">
                {{ scope.row.startTime }} - {{ scope.row.endTime }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" align="center"/>
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


      <!-- 底部导航 -->
      <div class="page-footer">
        <div class="footer-content">
          <div class="button-group">
            <el-button class="nav-button prev-button" @click="handlePrevStep">
              <el-icon><ArrowLeft /></el-icon>
              上一步
            </el-button>
            <div class="button-divider"></div>
            <el-button class="nav-button next-button" type="primary" @click="handleComplete">
              完成
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>


  </div>
</template>

<script setup>
import { ArrowLeft, Check, Monitor, School, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import { listDevice } from '@/api/glxt/device'
const router = useRouter()
const props = defineProps({
  schoolInfo: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['prev-step'])

// 设备列表数据
const deviceList = ref([])

const total = ref(0)

const loading = ref(false)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  deviceNo: '',
  schoolId: props.schoolInfo.id,//学校id
  schoolType: props.schoolInfo.educationLevel,//学校类型
});

const handlePrevStep = () => {
  emit('prev-step')
}

const handleComplete = () => {
  router.push('/glxt/base_school/base_school')
}


// 处理页码改变
const handleCurrentChange = (val) => {
  queryParams.value.pageNum = val
  // 这里可以调用获取数据的方法
  getList(queryParams.value)
}

// 处理每页条数改变
const handleSizeChange = (val) => {
  queryParams.value.pageSize = val
  // 这里可以调用获取数据的方法
  getList(queryParams.value)
}

total.value = deviceList.value.length // 设置总数据量

// 添加搜索相关的响应式数据
const searchKeyword = ref('')

// 搜索处理方法
const handleSearch = () => {
  getList(queryParams.value);
}


// 获取班级列表
const getList = (params) => {
  loading.value = true;
  listDevice(params).then(response => {
    deviceList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
};


// 监听搜索关键词(设备号)变化  
watch(() => queryParams.value.deviceNo, () => {
  queryParams.value.pageNum = 1 // 重置页码
  handleSearch()
})
getList(queryParams.value)
</script>

<style scoped>
.device-management {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9));
  position: relative;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 16px;
  padding-bottom: 80px; /* 为固定底部导航留出空间 */
}

.content-wrapper {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  padding: 0 20px;
  margin: 0 auto;
  /* padding: 16px 24px; */
  display: flex;
  flex-direction: column;
  gap: 16px;
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

/* 添加响应式样式 */
@media screen and (max-width: 768px) {
  .footer-content {
    padding: 12px 16px;
  }
}

.info-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px 20px 15px;
  border-bottom: 1px solid #ebeef5;
  margin-left: 20px;
  margin-right: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left .el-icon {
  font-size: 20px;
  color: #409EFF;
  margin-right: 8px;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 200px;
}

:deep(.search-input .el-input__wrapper) {
  border-radius: 20px;
}

:deep(.search-input .el-input__prefix) {
  color: #909399;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .info-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
}

.info-content {
  display: flex;
  align-items: center;
  padding: 20px 20px;
}

.info-item {
  flex: 1;
  padding: 5px 20px;
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

/* 保持原有样式不变，添加设备管理列表的特定样式 */
.device-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}


.info-header h3{
    margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.5;
}

</style> 