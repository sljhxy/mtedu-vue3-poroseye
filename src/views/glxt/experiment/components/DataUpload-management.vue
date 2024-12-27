<template>
  <div class="basic-info-container">
    <!-- 主内容区域包装器 -->
    <div class="main-content-wrapper">
      <!-- 标签页 -->
      <div class="tabs-wrapper">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="AB包" name="abPackage">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>AB包{{ experimentId }}</span>
              </div>
            </template>
            <div class="compact-form">
              <div class="operation-bar">
                <el-button type="primary" @click="handleUpload('ab')" icon="Upload" plain>上传</el-button>
              </div>
              <el-table :data="abPackageList">
                <el-table-column prop="name" label="AB包名称" />
                <el-table-column prop="version" label="版本号" />
                <el-table-column prop="size" label="文件大小" />
                <el-table-column prop="kernelVersion" label="内核框架版本号" />
                <el-table-column prop="uploadTime" label="上传时间" />
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="abPagination.currentPage"
                  v-model:page-size="abPagination.pageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  :total="abPagination.total"
                  background
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleAbSizeChange"
                  @current-change="handleAbPageChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="WEBGL-ZIP" name="webgl">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>WEBGL-ZIP</span>
              </div>
            </template>
            <div class="compact-form">
              <div class="operation-bar">
                <el-button type="primary" @click="handleUpload('webgl')" icon="Upload" plain>上传</el-button>
              </div>
              <el-table :data="webglList">
                <el-table-column prop="name" label="文件名称" />
                <el-table-column prop="version" label="版本号" />
                <el-table-column prop="size" label="文件大小" />
                <el-table-column prop="uploadTime" label="上传时间" />
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="webglPagination.currentPage"
                  v-model:page-size="webglPagination.pageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  :total="webglPagination.total"
                  background
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleWebglSizeChange"
                  @current-change="handleWebglPageChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="视频文件" name="video">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>视频文件</span>
              </div>
            </template>
            <div class="compact-form">
              <div class="operation-bar">
                <el-button type="primary" @click="handleUpload('video')" icon="Upload" plain>上传</el-button>
              </div>
              <el-table :data="videoList">
                <el-table-column prop="name" label="文件名称" />
                <el-table-column prop="version" label="版本号" />
                <el-table-column prop="size" label="文件大小" />
                <el-table-column prop="uploadTime" label="上传时间" />
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="videoPagination.currentPage"
                  v-model:page-size="videoPagination.pageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  :total="videoPagination.total"
                  background
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleVideoSizeChange"
                  @current-change="handleVideoPageChange"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog v-model="uploadDialogVisible" :title="uploadDialogTitle">
      <el-upload
        class="upload-demo"
        :action="uploadUrl"
        :on-success="handleUploadSuccess"
        :before-upload="beforeUpload"
      >
        <el-button type="primary">选择文件</el-button>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 当前激活的标签页
const activeTab = ref('abPackage')

// 接收父组件传递的数据
const props = defineProps({
  experimentId: {//实验id
    type: String,
    required: true,
    default: () => []
  },
})

// 列表数据
const abPackageList = ref([])
const webglList = ref([])
const videoList = ref([])

// 上传对话框控制
const uploadDialogVisible = ref(false)
const uploadDialogTitle = computed(() => {
  const titles = {
    ab: '上传AB包',
    webgl: 'WEBGL文件上传',
    video: '视频文件上传'
  }
  return titles[currentUploadType.value] || ''
})
const currentUploadType = ref('')

// 上传相关方法
const handleUpload = (type) => {
  currentUploadType.value = type
  uploadDialogVisible.value = true
}

const handleUploadSuccess = (response) => {
  // 处理上传成功逻辑
  uploadDialogVisible.value = false
  // 刷新对应列表数据
}

const beforeUpload = (file) => {
  // 文件上传前的验证逻辑
  return true
}

// 编辑和删除方法
const handleEdit = (row) => {
  // 处理编辑逻辑
}

const handleDelete = (row) => {
  // 处理删除逻辑
}

// 分页相关代码
const abPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const webglPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const videoPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// AB包分页方法
const handleAbSizeChange = (val) => {
  abPagination.pageSize = val
  loadAbPackageList() // 需要实现此方法来加载数据
}

const handleAbPageChange = (val) => {
  abPagination.currentPage = val
  loadAbPackageList() // 需要实现此方法来加载数据
}

// WEBGL分页方法
const handleWebglSizeChange = (val) => {
  webglPagination.pageSize = val
  loadWebglList() // 需要实现此方法来加载数据
}

const handleWebglPageChange = (val) => {
  webglPagination.currentPage = val
  loadWebglList() // 需要实现此方法来加载数据
}

// 视频文件分页方法
const handleVideoSizeChange = (val) => {
  videoPagination.pageSize = val
  loadVideoList() // 需要实现此方法来加载数据
}

const handleVideoPageChange = (val) => {
  videoPagination.currentPage = val
  loadVideoList() // 需要实现此方法来加载数据
}
</script>

<style scoped>
.basic-info-container {
  min-height: calc(100vh - 520px);
  padding: 24px;
  position: relative;
}

.main-content-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-top: 20px;
}

.tabs-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.custom-tabs {
  background: white;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #e8edf3;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  padding: 6px 8px 0;
}

.custom-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 36px;
}

.compact-form {
  padding: 24px;
  height: auto;
  min-height: 500px;
  overflow-y: visible;
}

.operation-bar {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0 0;
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
</style>