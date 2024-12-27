<template>
  <div class="question-material">
    <div class="main-content-wrapper">
      <div class="tabs-wrapper">
        <el-tabs 
          v-model="activeTab"
          class="custom-tabs"
          @tab-click="handleTabChange"
        >
          <el-tab-pane name="questions">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>题库{{ experimentId }}</span>
              </div>
            </template>
            <div class="search-wrapper">
              <div class="search-section" v-show="isSearchVisible">
                <el-form :inline="false" :model="searchForm">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="题干">
                        <el-input v-model="searchForm.content" placeholder="请输入题干"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="学科">
                        <el-select v-model="searchForm.subject" placeholder="请选择学科" style="width: 100%">
                          <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value">
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="题目类型">
                        <el-select v-model="searchForm.type" placeholder="请选择题目类型" style="width: 100%">
                          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
              <div class="operation-bar">
                <div class="left-buttons">
                  <el-button type="primary" plain icon="Plus" @click="selectQuestions">选择题目</el-button>
                </div>
                <div class="right-buttons">
                  <el-button
                    plain
                    circle
                    :icon="isSearchVisible ? 'ArrowUp' : 'ArrowDown'"
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
            </div>

            <!-- Question Table -->
            <el-table :data="questionList" border>
              <el-table-column type="index" label="序号" width="60"></el-table-column>
              <el-table-column prop="content" label="题目题干"></el-table-column>
              <el-table-column prop="stage" label="学段"></el-table-column>
              <el-table-column prop="subject" label="学科"></el-table-column>
              <el-table-column prop="type" label="题目类型"></el-table-column>
              <el-table-column prop="difficulty" label="难度"></el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="text" @click="previewQuestion(scope.row)">预览</el-button>
                  <el-button type="text" class="delete-btn" @click="deleteQuestion(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- Pagination -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="pagination.currentPage"
                v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 30, 50]"
                :total="pagination.total"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-tab-pane>
          
          <el-tab-pane name="materials">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Folder /></el-icon>
                <span>素材</span>
              </div>
            </template>
            <div class="search-wrapper">
              <div class="search-section" v-show="isSearchVisible">
                <el-form :inline="false" :model="materialSearchForm">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="题干">
                        <el-input v-model="materialSearchForm.content" placeholder="请输入题干" @input="handleMaterialSearch"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="学科">
                        <el-select v-model="materialSearchForm.subject" placeholder="请选择学科" style="width: 100%" @change="handleMaterialSearch">
                          <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value">
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="文件类型">
                        <el-select v-model="materialSearchForm.fileType" placeholder="请选择文件类型" style="width: 100%" @change="handleMaterialSearch">
                          <el-option v-for="item in fileTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
              <div class="operation-bar">
                <div class="left-buttons">
                  <el-button type="primary" plain icon="Plus" @click="selectMaterials">选择素材</el-button>
                </div>
                <div class="right-buttons">
                  <el-button
                    plain
                    circle
                    :icon="isSearchVisible ? 'ArrowUp' : 'ArrowDown'"
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
            </div>

            <!-- Materials Table -->
            <el-table :data="materialsList" border>
              <el-table-column type="index" label="题号" width="60"></el-table-column>
              <el-table-column prop="content" label="题目题干"></el-table-column>
              <el-table-column prop="stage" label="学段"></el-table-column>
              <el-table-column prop="subject" label="学科"></el-table-column>
              <el-table-column prop="fileType" label="文件类型"></el-table-column>
              <el-table-column prop="category" label="类别"></el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="text" @click="previewMaterial(scope.row)">预览</el-button>
                  <el-button type="text" class="delete-btn" @click="deleteMaterial(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- Materials Pagination -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="materialPagination.currentPage"
                v-model:page-size="materialPagination.pageSize"
                :page-sizes="[10, 20, 30, 50]"
                :total="materialPagination.total"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleMaterialSizeChange"
                @current-change="handleMaterialPageChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 选择题目弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="选择题目" 
      width="80%"
    >
      <!-- 搜索框保持不变 -->
      <div class="dialog-search">
        <el-form :inline="true" :model="dialogSearchForm">
          <el-form-item label="题干">
            <el-input 
              v-model="dialogSearchForm.content" 
              placeholder="请输入题干"
              @input="handleDialogSearch"
            />
          </el-form-item>
          <el-form-item label="学科">
            <el-select 
              v-model="dialogSearchForm.subject" 
              placeholder="请选择学科"
              @change="handleDialogSearch"
            >
              <el-option 
                v-for="item in subjectOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="题目类型">
            <el-select 
              v-model="dialogSearchForm.type" 
              placeholder="请选择题目类型"
              @change="handleDialogSearch"
            >
              <el-option 
                v-for="item in typeOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 修改表格容器，添加固定高度和滚动 -->
      <div class="dialog-table-wrapper">
        <el-table 
          :data="unselectedQuestions"
          @selection-change="handleSelectionChange"
          border
          :max-height="calculateTableHeight(unselectedQuestions.length)"
        >
          <el-table-column type="selection" width="55" fixed />
          <el-table-column type="index" label="序号" width="60" fixed />
          <el-table-column prop="content" label="题目题干" min-width="300" show-overflow-tooltip />
          <el-table-column prop="stage" label="学段" width="100" />
          <el-table-column prop="subject" label="学科" width="100" />
          <el-table-column prop="type" label="题目类型" width="120" />
          <el-table-column prop="difficulty" label="难度" width="100" />
        </el-table>
      </div>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="dialog-buttons">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSelection">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 选择素材弹窗 -->
    <el-dialog 
      v-model="materialDialogVisible" 
      title="选择素材" 
      width="80%"
    >
      <!-- 搜索框保持不变 -->
      <div class="dialog-search">
        <el-form :inline="true" :model="materialDialogSearchForm">
          <el-form-item label="题干">
            <el-input 
              v-model="materialDialogSearchForm.content" 
              placeholder="请输入题干"
              @input="handleMaterialDialogSearch"
            />
          </el-form-item>
          <el-form-item label="学科">
            <el-select 
              v-model="materialDialogSearchForm.subject" 
              placeholder="请选择学科"
              @change="handleMaterialDialogSearch"
            >
              <el-option 
                v-for="item in subjectOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="文件类型">
            <el-select 
              v-model="materialDialogSearchForm.fileType" 
              placeholder="请选择文件类型"
              @change="handleMaterialDialogSearch"
            >
              <el-option 
                v-for="item in fileTypeOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 修改表格容器，添加固定高度和滚动 -->
      <div class="dialog-table-wrapper">
        <el-table 
          :data="unselectedMaterials"
          @selection-change="handleMaterialSelectionChange"
          border
          :max-height="calculateTableHeight(unselectedMaterials.length)"
        >
          <el-table-column type="selection" width="55" fixed />
          <el-table-column type="index" label="题号" width="60" fixed />
          <el-table-column prop="content" label="题目题干" min-width="300" show-overflow-tooltip />
          <el-table-column prop="stage" label="学段" width="100" />
          <el-table-column prop="subject" label="学科" width="100" />
          <el-table-column prop="fileType" label="文件类型" width="100" />
          <el-table-column prop="category" label="类别" width="120" />
        </el-table>
      </div>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="dialog-buttons">
          <el-button @click="materialDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmMaterialSelection">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watchEffect, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Folder } from '@element-plus/icons-vue'

// Tab control
const activeTab = ref('questions')
// 接收父组件传递的数据
const props = defineProps({
  experimentId: {//实验id
    type: String,
    required: true,
    default: () => []
  },
})
// Search form
const searchForm = reactive({
  content: '',
  subject: '',
  type: ''
})

// Options for select
const subjectOptions = [
  // Add subject options
]

const typeOptions = [
  // Add type options
]

// Table data
const questionList = ref([]) // 当前显示的题目列表
const allQuestions = ref([]) // 存储所有题目数据

// Pagination
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// Dialog control
const dialogVisible = ref(false)
const materialDialogVisible = ref(false)

// Dialog search form
const dialogSearchForm = reactive({
  content: '',
  subject: '',
  type: ''
})

const materialDialogSearchForm = reactive({
  content: '',
  subject: '',
  fileType: ''
})

// Dialog pagination
const dialogPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const materialDialogPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 扩展模拟题目数据
const mockUnselectedQuestions = [
  {
    id: 1,
    content: '光合作用的基本原理是什么？',
    stage: '高中',
    subject: '生物',
    type: '答题',
    difficulty: '困难'
  },
  {
    id: 2,
    content: '请��释DNA的双螺旋结构',
    stage: '高中',
    subject: '生物',
    type: '简答题',
    difficulty: '中等'
  },
  {
    id: 3,
    content: '下列关于细胞的说法正确的是',
    stage: '高中',
    subject: '生物',
    type: '单选题',
    difficulty: '简单'
  },
  {
    id: 4,
    content: '计算下列化学方程式的系数',
    stage: '高中',
    subject: '化学',
    type: '填空题',
    difficulty: '中等'
  },
  {
    id: 5,
    content: '简述理想气体状态方程的应用条件',
    stage: '高中',
    subject: '化学',
    type: '简答题',
    difficulty: '困难'
  },
  {
    id: 6,
    content: '牛顿运动定律的应用题',
    stage: '高中',
    subject: '物理',
    type: '计算题',
    difficulty: '中等'
  },
  {
    id: 7,
    content: '浅析太阳系的形成过程',
    stage: '高中',
    subject: '物理',
    type: '论述题',
    difficulty: '困难'
  },
  {
    id: 8,
    content: '解一元二次方程的步骤',
    stage: '初中',
    subject: '数学',
    type: '解答题',
    difficulty: '简单'
  },
  {
    id: 9,
    content: '三角函数的基本关系',
    stage: '高中',
    subject: '数学',
    type: '填空题',
    difficulty: '中等'
  },
  {
    id: 10,
    content: '概率论基础知���应用',
    stage: '高中',
    subject: '数学',
    type: '计算题',
    difficulty: '困难'
  },
  {
    id: 11,
    content: '现代诗歌的艺术特色分析',
    stage: '高中',
    subject: '语文',
    type: '分析题',
    difficulty: '中等'
  },
  {
    id: 12,
    content: '议论文写作技巧探讨',
    stage: '高中',
    subject: '语文',
    type: '作文',
    difficulty: '困难'
  },
  {
    id: 13,
    content: '英语时态用法分析',
    stage: '高中',
    subject: '英语',
    type: '语法题',
    difficulty: '中等'
  },
  {
    id: 14,
    content: '英语作文范文赏析',
    stage: '高中',
    subject: '英语',
    type: '写作题',
    difficulty: '困难'
  },
  {
    id: 15,
    content: '地理环境对人类活动的影响',
    stage: '高中',
    subject: '地理',
    type: '论述题',
    difficulty: '中等'
  }
]

const unselectedQuestions = computed(() => {
  const selectedIds = new Set(questionList.value.map(q => q.id))
  return mockUnselectedQuestions.filter(q => !selectedIds.has(q.id))
})

const selectedRows = ref([])
const selectedMaterials = ref([])

// Methods
const selectQuestions = () => {
  dialogVisible.value = true
}

const previewQuestion = (row) => {
  // Implement preview logic
}

const deleteQuestion = (row) => {
  const index = questionList.value.findIndex(item => item.id === row.id)
  if (index !== -1) {
    questionList.value.splice(index, 1)
    pagination.total = questionList.value.length
    ElMessage.success('删除成功')
  }
}

const handlePageChange = (page) => {
  pagination.currentPage = page
  // Fetch data for the new page
}

// Methods for dialog
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleDialogSearch = () => {
  const filteredData = mockUnselectedQuestions.filter(item => {
    const contentMatch = !dialogSearchForm.content || 
      item.content.toLowerCase().includes(dialogSearchForm.content.toLowerCase())
    const subjectMatch = !dialogSearchForm.subject || 
      item.subject === dialogSearchForm.subject
    const typeMatch = !dialogSearchForm.type || 
      item.type === dialogSearchForm.type
    return contentMatch && subjectMatch && typeMatch
  })
  
  unselectedQuestions.value = filteredData
  dialogPagination.total = filteredData.length
}

const handleDialogSizeChange = (val) => {
  dialogPagination.pageSize = val
  handleDialogSearch()
}

const handleDialogPageChange = (val) => {
  dialogPagination.currentPage = val
  handleDialogSearch()
}

const resetDialogSearch = () => {
  dialogSearchForm.content = ''
  dialogSearchForm.subject = ''
  dialogSearchForm.type = ''
  handleDialogSearch()
}

const confirmSelection1 = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一道题目')
    return
  }

  // 检查重复选择
  const selectedIds = new Set(allQuestions.value.map(q => q.id))
  const newQuestions = selectedRows.value.filter(q => !selectedIds.has(q.id))

  if (newQuestions.length === 0) {
    ElMessage.warning('所选题目已全部添加')
    return
  }

  // 添加新选择的题目
  allQuestions.value = [...allQuestions.value, ...newQuestions]
  handleSearch() // 重新加载当前页数据
  
  // 关闭弹窗并清空选择
  dialogVisible.value = false
  selectedRows.value = []
  
  ElMessage.success(`成功添加 ${newQuestions.length} 道题目`)
}

// 修改 dialogPagination 的 total
watchEffect(() => {
  dialogPagination.total = unselectedQuestions.value.length
})

// 搜索栏显示状态
const isSearchVisible = ref(false)

// 切换搜索栏显示状态
const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value
}

// 刷新列表
const refreshList = () => {
  // 实现刷新逻辑
  ElMessage.success('刷新成功')
}

// 添加需要的图标导入
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Refresh 
} from '@element-plus/icons-vue'

// 添加��新方法
const handleRefresh = () => {
  // 重置搜索条件
  resetSearch()
  // 重新加载数据
  handleSearch()
  ElMessage.success('刷新成功')
}

// 新增素材相关的数据和方法
const materialSearchForm = reactive({
  content: '',
  subject: '',
  fileType: ''
})

const fileTypeOptions = [
  { value: 'PDF', label: 'PDF' },
  { value: 'Word', label: 'Word' },
  { value: 'PPT', label: 'PPT' },
  { value: '图片', label: '图片' },
  { value: '视频', label: '视频' },
  { value: '音频', label: '音频' }
]

// 扩展模拟素材数据
const mockMaterials = [
  {
    id: 1,
    content: '光的反射实验教学PPT',
    stage: '初中',
    subject: '物理',
    fileType: 'PPT',
    category: '教学课件'
  },
  {
    id: 2,
    content: '生物细胞结构图解',
    stage: '高中',
    subject: '生物',
    fileType: '图片',
    category: '教学素材'
  },
  {
    id: 3,
    content: '化学实验安全教程',
    stage: '高中',
    subject: '化学',
    fileType: 'PDF',
    category: '实验指导'
  },
  {
    id: 4,
    content: '物理力学实验视频',
    stage: '高中',
    subject: '物理',
    fileType: '视频',
    category: '实验演示'
  },
  {
    id: 5,
    content: '数学函数图像分析',
    stage: '高中',
    subject: '数学',
    fileType: 'Word',
    category: '教学资料'
  },
  {
    id: 6,
    content: '英语听力练习材料',
    stage: '初中',
    subject: '英语',
    fileType: '音频',
    category: '练习材料'
  },
  {
    id: 7,
    content: '地理地形图解析',
    stage: '高中',
    subject: '地理',
    fileType: '图片',
    category: '教学素材'
  },
  {
    id: 8,
    content: '历史文献资料集',
    stage: '高中',
    subject: '历史',
    fileType: 'PDF',
    category: '参考资料'
  },
  {
    id: 9,
    content: '生物实验操作视频',
    stage: '高中',
    subject: '生物',
    fileType: '视频',
    category: '实验演示'
  },
  {
    id: 10,
    content: '化学分子结构3D模型',
    stage: '高中',
    subject: '化学',
    fileType: '模型',
    category: '教学素材'
  },
  {
    id: 11,
    content: '物理电学实验指导',
    stage: '高中',
    subject: '物理',
    fileType: 'PDF',
    category: '实验指导'
  },
  {
    id: 12,
    content: '数学几何证明课件',
    stage: '高中',
    subject: '数学',
    fileType: 'PPT',
    category: '教学课件'
  },
  {
    id: 13,
    content: '语文古诗文赏析',
    stage: '高中',
    subject: '语文',
    fileType: 'Word',
    category: '教学资料'
  },
  {
    id: 14,
    content: '英语口语训练音频',
    stage: '高中',
    subject: '英语',
    fileType: '音频',
    category: '练习材料'
  },
  {
    id: 15,
    content: '地理气候类型图集',
    stage: '高中',
    subject: '地理',
    fileType: '图片',
    category: '教学素材'
  }
]

// 初始化素材列表
const materialsList = ref([]) // 当前显示的素材列表
const allMaterials = ref([]) // 存储所有素材数据

// 未选择的素材计算属性
const unselectedMaterials = computed(() => {
  const selectedIds = new Set(materialsList.value.map(m => m.id))
  return mockMaterials.filter(m => !selectedIds.has(m.id))
})

// 素材分页配置
const materialPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: mockMaterials.length
})

// 修改搜索方法
const handleSearch = () => {
  // 先根据搜索条件过滤数据
  const filteredData = allQuestions.value.filter(item => {
    const contentMatch = !searchForm.content || 
      item.content.toLowerCase().includes(searchForm.content.toLowerCase())
    const subjectMatch = !searchForm.subject || 
      item.subject === searchForm.subject
    const typeMatch = !searchForm.type || 
      item.type === searchForm.type
    return contentMatch && subjectMatch && typeMatch
  })
  
  // 更新总数
  pagination.total = filteredData.length
  
  // 根据分页设置截取当前页数据
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  questionList.value = filteredData.slice(start, end)
}

// 修改素材搜索方法
const handleMaterialSearch = () => {
  // 先根据搜索条件过滤数据
  const filteredData = allMaterials.value.filter(item => {
    const contentMatch = !materialSearchForm.content || 
      item.content.toLowerCase().includes(materialSearchForm.content.toLowerCase())
    const subjectMatch = !materialSearchForm.subject || 
      item.subject === materialSearchForm.subject
    const fileTypeMatch = !materialSearchForm.fileType || 
      item.fileType === materialSearchForm.fileType
    return contentMatch && subjectMatch && fileTypeMatch
  })
  
  // 更新总数
  materialPagination.total = filteredData.length
  
  // 根据分页设置截取当前页数据
  const start = (materialPagination.currentPage - 1) * materialPagination.pageSize
  const end = start + materialPagination.pageSize
  materialsList.value = filteredData.slice(start, end)
}

// 修改分页方法
const handleSizeChange = (val) => {
  pagination.pageSize = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  handleSearch()
}

const handleMaterialSizeChange = (val) => {
  materialPagination.pageSize = val
  handleMaterialSearch()
}

const handleMaterialPageChange = (val) => {
  materialPagination.currentPage = val
  handleMaterialSearch()
}

// 初始化数据
onMounted(() => {
  handleSearch() // 初始化题库列表
  handleMaterialSearch() // 初始化素材列表
})

// 监听搜索表单变化
watch(
  [
    () => searchForm.content,
    () => searchForm.subject,
    () => searchForm.type
  ],
  () => {
    pagination.currentPage = 1 // 重置页码
    handleSearch()
  }
)

// 监听素材搜索表单变���
watch(
  [
    () => materialSearchForm.content,
    () => materialSearchForm.subject,
    () => materialSearchForm.fileType
  ],
  () => {
    materialPagination.currentPage = 1 // 重置页码
    handleMaterialSearch()

  }
)

// 修改确认选择方法
const confirmSelection = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一道题目')
    return
  }

  // 检查重复选择
  const selectedIds = new Set(allQuestions.value.map(q => q.id))
  const newQuestions = selectedRows.value.filter(q => !selectedIds.has(q.id))

  if (newQuestions.length === 0) {
    ElMessage.warning('所选题目已全部添加')
    return
  }

  // 添加新选择的题目
  allQuestions.value = [...allQuestions.value, ...newQuestions]
  handleSearch() // 重新加载当前页数据
  
  // 关闭弹窗并清空选择
  dialogVisible.value = false
  selectedRows.value = []
  
  ElMessage.success(`成功添加 ${newQuestions.length} 道题目`)
}

// 修改确认选择素材方法
const confirmMaterialSelection = () => {
  if (selectedMaterials.value.length === 0) {
    ElMessage.warning('请至少选择一个素材')
    return
  }

  // 检查重复选择
  const selectedIds = new Set(allMaterials.value.map(m => m.id))
  const newMaterials = selectedMaterials.value.filter(m => !selectedIds.has(m.id))

  if (newMaterials.length === 0) {
    ElMessage.warning('所选素材已全部添加')
    return
  }

  // 添加新选择的素材
  allMaterials.value = [...allMaterials.value, ...newMaterials]
  handleMaterialSearch() // 重新加载当前页数据
  
  // 关闭弹窗并清空选择
  materialDialogVisible.value = false
  selectedMaterials.value = []
  
  ElMessage.success(`成功添加 ${newMaterials.length} 个素材`)
}

// 删除素材
const deleteMaterial = (row) => {
  const index = materialsList.value.findIndex(item => item.id === row.id)
  if (index !== -1) {
    materialsList.value.splice(index, 1)
    materialPagination.total = materialsList.value.length
    ElMessage.success('删除成功')
  }
}

// 预览素材
const previewMaterial = (row) => {
  ElMessage.info(`预览素材：${row.content}`)
}

// 弹窗搜索方法
const handleMaterialDialogSearch = () => {
  const filteredData = mockMaterials.filter(item => {
    const contentMatch = !materialDialogSearchForm.content || 
      item.content.toLowerCase().includes(materialDialogSearchForm.content.toLowerCase())
    const subjectMatch = !materialDialogSearchForm.subject || 
      item.subject === materialDialogSearchForm.subject
    const fileTypeMatch = !materialDialogSearchForm.fileType || 
      item.fileType === materialDialogSearchForm.fileType
    return contentMatch && subjectMatch && fileTypeMatch
  })
  
  unselectedMaterials.value = filteredData
  materialDialogPagination.total = filteredData.length
}

// 弹窗分页方法
const handleMaterialDialogSizeChange = (val) => {
  materialDialogPagination.pageSize = val
  handleMaterialDialogSearch()
}

const handleMaterialDialogPageChange = (val) => {
  materialDialogPagination.currentPage = val
  handleMaterialDialogSearch()
}

// 添加选择素材的方法
const selectMaterials = () => {
  materialDialogVisible.value = true
  // 初始化弹窗数据
  handleMaterialDialogSearch()
}

// 修改素材选择处理方法
const handleMaterialSelectionChange = (selection) => {
  selectedMaterials.value = selection
}

// 添加计算表格高度的方法
const calculateTableHeight = (dataLength) => {
  const rowHeight = 40 // 每行的高度
  const headerHeight = 40 // 表头高度
  const minHeight = rowHeight * 5 + headerHeight // 最小高度（5行）
  const maxHeight = rowHeight * 10 + headerHeight // 最大高度（10行）
  
  // 计算实际需要的高度
  const actualHeight = rowHeight * dataLength + headerHeight
  
  // 如果数据少于5行，返回最小高度
  if (actualHeight < minHeight) {
    return minHeight
  }
  // 如果数据多于10行，返回最大高度
  if (actualHeight > maxHeight) {
    return maxHeight
  }
  // 否则返回实际高度
  return actualHeight
}

// 修改 tab 切换处理方法
const handleTabChange = () => {
  // 隐藏搜索框
  isSearchVisible.value = false
  
  // 清空搜索内容并重新加载数据
  if (activeTab.value === 'questions') {
    // 清空题库搜索表单
    searchForm.content = ''
    searchForm.subject = ''
    searchForm.type = ''
    // 重新加载题库数据
    handleSearch()
  } else {
    // 清空素材搜索表单
    materialSearchForm.content = ''
    materialSearchForm.subject = ''
    materialSearchForm.fileType = ''
    // 重新加载素材数据
    handleMaterialSearch()
  }
}
</script>

<style scoped>
.question-material {
  min-height: calc(100vh - 520px);
  padding: 24px;
  position: relative;
}

/* 主内容包装器样式 */
.main-content-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-top: 20px;
}

/* 标签页容器样式 */
.tabs-wrapper {
  border-radius: 0;
  border: none;
}

/* 自定义标签页样式 */
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

:deep(.el-tabs__nav-wrap) {
  padding: 0;
}

:deep(.el-tabs__nav) {
  border: none !important;
}

/* 自定义标签标题样式 */
.custom-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 36px;
}

:deep(.el-tabs__item) {
  height: 36px;
  line-height: 36px;
  padding: 0 !important;
  font-size: 14px;
  color: #909399;
  position: relative;
  transition: all 0.3s;
  border-radius: 6px 6px 0 0;
  margin: 0 4px;
}

:deep(.el-tabs__item:hover) {
  color: var(--el-color-primary);
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
  background-color: white;
}

/* 移除默认的底部条 */
:deep(.el-tabs__active-bar) {
  display: none;
}

/* Tab内容区域样式 */
:deep(.el-tab-pane) {
  padding: 24px;
}

/* 搜索区域样式更新 */
.search-wrapper {
  margin-bottom: 20px;
}

.search-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

/* 操作栏样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  padding: 16px 0;
  display: flex;
  justify-content: flex-end;
}

/* 弹窗样式优化 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  background: #f8fafc;
}

/* 按钮样式统一 */
:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
}

/* 其他原有样式保持不变... */
</style>