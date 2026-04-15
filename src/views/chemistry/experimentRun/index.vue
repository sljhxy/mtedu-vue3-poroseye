<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="模板ID" prop="templateId">
        <el-input v-model="queryParams.templateId" placeholder="请输入模板ID" clearable style="width: 120px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 120px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" :icon="Delete" :disabled="multiple" v-hasPermi="['chemistry:run:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" :icon="Download" v-hasPermi="['chemistry:run:export']" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="runList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="模板ID" align="center" prop="templateId" width="80" />
      <el-table-column label="用户ID" align="center" prop="userId" min-width="80" />
      <el-table-column label="反应时间(秒)" align="center" prop="reactionTime" width="100">
        <template #default="scope">
          {{ scope.row.reactionTime ? scope.row.reactionTime.toFixed(2) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="反应速率" align="center" prop="reactionRate" width="90">
        <template #default="scope">
          {{ scope.row.reactionRate ? scope.row.reactionRate.toFixed(4) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="产率(%)" align="center" prop="yieldPercentage" width="80">
        <template #default="scope">
          {{ scope.row.yieldPercentage ? scope.row.yieldPercentage.toFixed(1) + '%' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="评分" align="center" prop="score" width="70">
        <template #default="scope">
          <el-tag v-if="scope.row.score" :type="getScoreTagType(scope.row.score)" size="small">{{ scope.row.score }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="150" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button plain type="primary" @click="handleView(scope.row)" v-hasPermi="['chemistry:run:query']">详情</el-button>
          <el-button plain type="danger" @click="handleDelete(scope.row)" v-hasPermi="['chemistry:run:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="实验记录详情" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记录ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="模板ID">{{ detailData.templateId }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ detailData.userId }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">输入参数</el-divider>
      <el-card>
        <pre class="json-pre">{{ formatJsonData(detailData.inputParams) }}</pre>
      </el-card>

      <el-divider content-position="left">反应结果</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="反应是否发生">
          <el-tag v-if="detailData.resultData" :type="detailData.resultData.reactionOccurred ? 'success' : 'info'" size="small">
            {{ detailData.resultData.reactionOccurred ? '是' : '否' }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="反应时间(秒)">
          {{ detailData.reactionTime ? detailData.reactionTime.toFixed(2) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="反应速率">
          {{ detailData.reactionRate ? detailData.reactionRate.toFixed(4) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="产率(%)">
          {{ detailData.yieldPercentage ? detailData.yieldPercentage.toFixed(1) + '%' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="最终浓度" :span="2">
          <span v-if="detailData.resultData && detailData.resultData.finalConcentrations">
            {{ formatJsonData(detailData.resultData.finalConcentrations) }}
          </span>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">观察现象</el-divider>
      <el-card>
        <pre class="json-pre">{{ formatJsonData(detailData.observedPhenomena) }}</pre>
      </el-card>

      <el-divider content-position="left">评价</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="评分">
          <el-tag v-if="detailData.score" :type="getScoreTagType(detailData.score)" size="small">{{ detailData.score }}</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="反馈">
          {{ detailData.feedback || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ExperimentRun">
import { listExperimentRun, getExperimentRun, delExperimentRun, exportExperimentRun } from '@/api/chemistry/experimentRun'
import { formatJsonData } from '@/utils/chemistry'
import { Search, Refresh, Delete, Download, View } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const runList = ref([])
const detailVisible = ref(false)
const detailData = ref({})
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)

const queryFormRef = ref()

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  templateId: null,
  userId: null
})

/** 获取评分标签类型 */
function getScoreTagType(score) {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 60) return 'warning'
  return 'danger'
}

/** 查询实验记录列表 */
function getList() {
  loading.value = true
  listExperimentRun(queryParams.value).then(response => {
    console.log('实验记录API响应:', response)
    runList.value = response.rows || []
    total.value = response.total || 0
    loading.value = false
  }).catch(error => {
    console.error('查询实验记录失败:', error)
    proxy.$modal.msgError('查询失败：' + (error.message || '未知错误'))
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryFormRef')
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

/** 查看详情 */
function handleView(row) {
  const id = row.id
  getExperimentRun(id).then(response => {
    detailData.value = response.data
    detailVisible.value = true
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const deleteIds = row.id || ids.value.join(',')
  proxy.$modal.confirm('是否确认删除实验记录编号为"' + deleteIds + '"的数据项？').then(() => {
    return delExperimentRun(deleteIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('chemistry/experimentRun/export', {
    ...queryParams.value
  }, `experiment_run_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped lang="scss">
.app-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  min-height: calc(100vh - 84px);
  padding: 20px;

  :deep(.el-form) {
    background: #fff;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }

  :deep(.el-table) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .el-table__header-wrapper {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      th {
        background: transparent !important;
        color: #fff;
        font-weight: 500;
      }
    }

    .el-table__row {
      transition: all 0.3s;

      &:hover {
        background: #f0f9ff !important;
      }
    }
  }
}

.json-pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background: linear-gradient(135deg, #f8f9fa 0%, #eef1f5 100%);
  padding: 16px;
  border-radius: 10px;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  line-height: 1.6;
  color: #303133;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;

    &:hover {
      background: #909399;
    }
  }
}

:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    padding: 20px 24px;
    margin: 0;

    .el-dialog__title {
      color: #fff;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    background: #f8f9fa;
    border-top: 1px solid #e4e7ed;
  }
}

:deep(.el-descriptions) {
  .el-descriptions__label {
    font-weight: 500;
    color: #606266;
  }

  .el-descriptions__content {
    color: #303133;
  }
}

:deep(.el-card) {
  border-radius: 10px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .el-card__header {
    background: linear-gradient(135deg, #f8f9fa 0%, #eef1f5 100%);
    border-bottom: 1px solid #e4e7ed;
    font-weight: 500;
  }
}

:deep(.el-divider) {
  &.el-divider--horizontal {
    margin: 24px 0;
  }

  .el-divider__text {
    background: transparent;
    font-weight: 500;
    color: #409eff;
    font-size: 15px;
  }
}

// 表格操作按钮样式优化
:deep(.el-button) {
  border-radius: 6px;
  font-weight: 400;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-1px);
  }

  &.el-button--primary {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }

  &.el-button--danger {
    background: linear-gradient(135deg, #f56c6c 0%, #ff8080 100%);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #ff8080 0%, #f56c6c 100%);
      box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
    }
  }

  &.el-button--warning {
    background: linear-gradient(135deg, #e6a23c 0%, #f0b855 100%);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #f0b855 0%, #e6a23c 100%);
      box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
    }
  }
}

// 分页样式优化
:deep(.el-pagination) {
  .el-pager li {
    border-radius: 6px;
    margin: 0 2px;
    transition: all 0.3s;

    &.is-active {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      color: #fff;
    }

    &:hover {
      transform: scale(1.1);
    }
  }

  button {
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.05);
    }
  }
}

// 工具栏按钮样式优化
:deep(.el-row.mb8) {
  .el-button {
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 400;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 12px;

    :deep(.el-form) {
      padding: 12px 16px;
    }

    :deep(.el-table) {
      font-size: 13px;

      .el-table__cell {
        padding: 8px 0;
      }
    }
  }

  :deep(.el-dialog) {
    width: 90% !important;

    .el-dialog__body {
      padding: 16px;
    }
  }
}
</style>
