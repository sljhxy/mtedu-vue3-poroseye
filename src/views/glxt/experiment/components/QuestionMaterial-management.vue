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
                <el-form :inline="false" :model="queryExperimentQuestionParams">
                  <el-row :gutter="20">
                    <el-col :span="3">
                      <el-form-item label="题型">
                        <el-select v-model="queryExperimentQuestionParams.questionType" placeholder="请选择题型" 
                        @change="handleQuestionSearch('questionType', queryExperimentQuestionParams.questionType)"
                        clearable>
                          <el-option v-for="item in mt_question_type" :key="item.value" :label="item.label" :value="item.value">
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
                    @click="handleQuestionRefresh"
                  />
                </div>
              </div>
            </div>

            <!-- Question Table -->
            <el-table :data="experimentQuestionPageList" border>
              <el-table-column type="index" label="序号" width="60" fixed />
              <el-table-column prop="schoolType" label="学校类型" align="center">
                <template #default="scope">
                      <dict-tag :options="mt_school_type" :value="scope.row.questionEditRequestVM.schoolType"/>
                </template>
              </el-table-column>
              <el-table-column prop="academicStageType" label="学段" align="center">
                <template #default="scope">
                      <dict-tag v-if="scope.row.questionEditRequestVM.schoolType == '1'" :options="mt_academic_stage" :value="scope.row.questionEditRequestVM.academicStageType"/>
                      <dict-tag v-else :options="mt_vocal_education_type" :value="scope.row.questionEditRequestVM.academicStageType"/>
                  </template>
              </el-table-column>
              <el-table-column prop="title" label="题目题干" min-width="300" show-overflow-tooltip>
                <template #default="scope">
                  <div v-html="scope.row.questionEditRequestVM.title"></div>
                </template>
              </el-table-column>
              <el-table-column prop="questionType" label="题目类型"  align="center">
                <template #default="scope">
                      <dict-tag :options="mt_question_type" :value="scope.row.questionEditRequestVM.questionType"/>
                  </template>
              </el-table-column>
              <el-table-column prop="difficult" label="难度" align="center">
                <template #default="scope">
                  {{ scope.row.questionEditRequestVM.difficult }}
                </template>

              </el-table-column>
              <el-table-column label="操作"  align="center">
                <template #default="scope">
                  <el-button plain type="danger" class="delete-btn" @click="deleteQuestion(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- Pagination -->
            <div class="pagination-container">
              <el-pagination
                v-model:page="queryExperimentQuestionParams.pageNum"
                v-model:limit="queryExperimentQuestionParams.pageSize"
                :page-sizes="[10, 20, 30, 50]"
                :total="experimentQuestionTotal"
                v-show="experimentQuestionTotal > 0"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handleQuestionCurrentChange"
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
                <el-form :inline="false" :model="queryExperimentSourceMaterialParams">
                  <el-row :gutter="20">
                    <el-col :span="3">
                      <el-form-item label="文件名称">
                        <el-input 
                          v-model="queryExperimentSourceMaterialParams.fileName" 
                          placeholder="请输入名称"
                          @input="handleMaterialSearch('fileName', queryExperimentSourceMaterialParams.fileName)"
                          clearable
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="3">
                      <el-form-item label="文件类型">
                        <el-input 
                            v-model="queryExperimentSourceMaterialParams.fileType" 
                            placeholder="请输入文件后缀"
                            @input="handleMaterialSearch('fileType', queryExperimentSourceMaterialParams.fileType)"
                            clearable
                          />
                      </el-form-item>
                    </el-col>
                    <el-col :span="3">
                      <el-form-item label="素材类别">
                        <el-select 
                          style="width: 150px;" 
                          v-model="queryExperimentSourceMaterialParams.sourceType" 
                          placeholder="请选择素材类别"
                          @change="handleMaterialSearch('sourceType', queryExperimentSourceMaterialParams.sourceType)"
                          clearable>
                          <el-option 
                            v-for="item in mt_source_material_type" 
                            :key="item.value" 
                            :label="item.label" 
                            :value="item.value"
                          />
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
            <el-table :data="experimentSourceMaterialPageList" border>
              <el-table-column type="contentType" label="学校类型" align="center">
              <template #default="scope">
                <dict-tag :options="mt_school_type" :value="scope.row.sourceMaterial.contentType"/>
              </template>
            </el-table-column>
            <el-table-column type="periodType" label="学段"  align="center">
              <template #default="scope">
                <dict-tag v-if="scope.row.sourceMaterial.contentType == '1'" :options="mt_academic_stage" :value="scope.row.sourceMaterial.periodType"/>
                <dict-tag v-else :options="mt_vocal_education_type" :value="scope.row.sourceMaterial.periodType"/>
              </template>
            </el-table-column>
            <el-table-column prop="fileName" label="文件名称" align="center">
              <template #default="scope"> 
                {{ scope.row.sourceMaterial.fileName }}
              </template>
            </el-table-column>
            <el-table-column prop="fileType" label="文件类型" align="center">
              <template #default="scope"> 
                {{ scope.row.sourceMaterial.fileType }}
              </template>
            </el-table-column>
            <el-table-column prop="sourceType" label="素材类别" align="center">
              <template #default="scope">
                <dict-tag :options="mt_source_material_type" :value="scope.row.sourceMaterial.sourceType"/>
              </template>
            </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="scope">
                  <el-button plain type="danger" class="delete-btn" @click="deleteMaterial(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- Materials Pagination -->
            <div class="pagination-container">
              <el-pagination
                v-model:page="queryExperimentSourceMaterialParams.pageNum"
                v-model:limit="queryExperimentSourceMaterialParams.pageSize"
                :page-sizes="[10, 20, 30, 50]"
                :total="experimentSourceMaterialTotal"
                v-show="experimentSourceMaterialTotal > 0"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handleSourceMaterialCurrentChange"
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
      width="60%"
    >
      <!-- 搜索框保持不变 -->
      <div class="dialog-search">
        <el-form :inline="true" :model="dialogSearchForm">
          <el-form-item label="题目类型">
            <el-select 
              style="width: 150px;" 
              v-model="dialogSearchForm.questionType" 
              placeholder="请选择题目类型"
              @change="handleQuestionDialogSearch('questionType', dialogSearchForm.questionType)"
              clearable>
              <el-option 
                v-for="item in mt_question_type" 
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
          <el-table-column prop="schoolType" label="学校类型" align="center">
            <template #default="scope">
                  <dict-tag :options="mt_school_type" :value="scope.row.schoolType"/>
              </template>
          </el-table-column>
          <el-table-column prop="academicStageType" label="学段" align="center">
            <template #default="scope">
                  <dict-tag v-if="scope.row.schoolType == '1'" :options="mt_academic_stage" :value="scope.row.academicStageType"/>
                  <dict-tag v-else :options="mt_vocal_education_type" :value="scope.row.academicStageType"/>
              </template>
          </el-table-column>
          <el-table-column prop="shortTitle" label="题目题干" min-width="300" show-overflow-tooltip >
            <template #default="scope">
                  <div v-html="scope.row.shortTitle"></div>
            </template>
          </el-table-column>
          <el-table-column prop="questionType" label="题目类型"  align="center">
            <template #default="scope">
                  <dict-tag :options="mt_question_type" :value="scope.row.questionType"/>
              </template>
          </el-table-column>
          <el-table-column prop="difficult" label="难度" width="100" align="center"/>
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
      width="60%"
    >
      <!-- 搜索框保持不变 -->
      <div class="dialog-search">
        <el-form :inline="true" :model="materialDialogSearchForm">
          <el-form-item label="文件名称">
            <el-input 
              v-model="materialDialogSearchForm.fileName" 
              placeholder="请输入名称"
              @input="handleMaterialDialogSearch('fileName', materialDialogSearchForm.fileName)"
              clearable
            />
          </el-form-item>
      
          <el-form-item label="文件类型">
            <el-input 
              v-model="materialDialogSearchForm.fileType" 
              placeholder="请输入文件后缀"
              @input="handleMaterialDialogSearch('fileType', materialDialogSearchForm.fileType)"
              clearable
            />
          </el-form-item>
          <el-form-item label="素材类别">
            <el-select 
              style="width: 150px;" 
              v-model="materialDialogSearchForm.sourceType" 
              placeholder="请选择素材类别"
              @change="handleMaterialDialogSearch('sourceType', materialDialogSearchForm.sourceType)"
              clearable>
              <el-option 
                v-for="item in mt_source_material_type" 
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
          <el-table-column type="contentType" label="学校类型">
            <template #default="scope">
                      <dict-tag :options="mt_school_type" :value="scope.row.contentType"/>
            </template>
          </el-table-column>
          <el-table-column type="periodType" label="学段">
            <template #default="scope">
              <dict-tag v-if="scope.row.contentType == '1'" :options="mt_academic_stage" :value="scope.row.periodType"/>
              <dict-tag v-else :options="mt_vocal_education_type" :value="scope.row.periodType"/>
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="文件名称"  />
          <el-table-column prop="fileType" label="文件类型" />
          <el-table-column prop="sourceType" label="素材类别">
            <template #default="scope">
              <dict-tag :options="mt_source_material_type" :value="scope.row.sourceType"/>
            </template>
          </el-table-column>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Folder } from '@element-plus/icons-vue'
//获取题库
import { listQuestion } from '@/api/glxt/question'
const { proxy } = getCurrentInstance();
//字典引入 学校类型、  mt_vocal_education_type->职教学段、mt_academic_stage->普教学段、 学制
const { mt_question_type, mt_school_type, mt_vocal_education_type, mt_academic_stage, mt_source_material_type} = proxy.useDict('mt_question_type', 'mt_school_type', 'mt_vocal_education_type', 'mt_academic_stage', 'mt_source_material_type');

//导入实验-题库API
import { insertBatchMtExperimentQuestion, listExperimentQuestion, delExperimentQuestion } from '@/api/glxt/experimentQuestion'


//获取素材
import { listSourceMaterial } from '@/api/glxt/sourceMaterial'

//导入实验-素材API
import { insertBatchMtExperimentSourceMaterial, listExperimentMaterial, delExperimentMaterial } from '@/api/glxt/experimentMaterial'

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


// Table data
const allQuestions = ref({
  experimentId:'',
  questionList:[]
}) // 存储所有题目数据

// Dialog control
const dialogVisible = ref(false)
const materialDialogVisible = ref(false)


//素材-弹框搜索参数
const materialDialogSearchForm = reactive({
  fileName: '',
  periodType: '',
  fileType: '',
  sourceType:''
})

//实验题库选择题目列表请求参数
const queryQuestionParams = ref({
    pageNum: 1,
    pageSize: 100000,
    questionType:''
  }
)

const loading = ref(true);
const questionList = ref([]) // 当前显示的题目列表
const questionTotal = ref(0);
//获取未选择-题库数据
function getQuestionList() {
  loading.value = true;
  listQuestion(queryQuestionParams.value).then(response => {
    questionList.value = response.rows;
    questionTotal.value = response.total;
    loading.value = false;
  });
}


const unselectedQuestions = computed(() => {
  return questionList.value
})


//选择的素材
const selectedMaterials = ref([])

// 点击选择题目按钮获取列表
const selectQuestions = () => {
  //调用题库列表
  getQuestionList()
  dialogVisible.value = true
}


const selectedRows = ref([])
// 选中的题目
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}


const confirmSelection = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一道题目')
    return
  }

  // 检查重复选择
  // const selectedIds = new Set(allQuestions.value.map(q => q.id))
  const newQuestions = selectedRows.value

  // if (newQuestions.length === 0) {
  //   ElMessage.warning('所选题目已全部添加')
  //   return
  // }

  // 添加新选择的题目
  allQuestions.value.questionList = [...newQuestions]
  
    //进行将已经选择数据添加到实验题库列表
    allQuestions.value.experimentId = props.experimentId//实验id
    insertBatchMtExperimentQuestion(allQuestions.value).then(response => {
    if(response.code == 200){
        ElMessage.success(`成功添加 ${newQuestions.length} 道题目`)
        // 关闭弹窗并清空选择
        dialogVisible.value = false
        selectedRows.value = []
  
        // 重新加载当前页数据
        getExperimentQuestionList()
      }else{
        ElMessage.error('添加失败')
      } 
  });

}

//获取已选择的题库列表
const queryExperimentQuestionParams = ref({
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: '',
    questionType:''
  }
)

//重置参数
const queryExperimentQuestionParamsReset = () =>{
  queryExperimentQuestionParams.value = {
    questionType:''
  }
}


const experimentQuestionPageList = ref([])
const experimentQuestionTotal = ref(0);
//获取已经选择的题目列表
function getExperimentQuestionList() {
  loading.value = true;
  queryExperimentQuestionParams.value.experimentInfoId = props.experimentId//实验id
  listExperimentQuestion(queryExperimentQuestionParams.value).then(response => {
    experimentQuestionPageList.value = response.rows;
    experimentQuestionTotal.value = response.total;
    loading.value = false;
  });
}

// 处理题目页码改变
const handleQuestionCurrentChange = (val) => {
  queryExperimentQuestionParams.value.pageNum = val
  // 这里调用获取数据的方法
  getExperimentQuestionList()
}

//删除题库
const deleteQuestion = (row) => {
  ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delExperimentQuestion(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getExperimentQuestionList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}

// 题目弹框搜索参数
const dialogSearchForm = reactive({
  questionType: '',
})
//弹框搜索参数处理
const handleQuestionDialogSearch = (type, value) => {
  let questionTypeTmp = ''//题目类型
  if(type == 'questionType') {
    queryQuestionParams.value.questionType = value
    questionTypeTmp = value
    getQuestionList();
  }else {
    queryQuestionParams.value.questionType = questionTypeTmp
    getQuestionList();
  }
}


//已选中的题库搜索框参数处理
const handleQuestionSearch = (type, value) => {
  let questionTypeTmp = ''//题目类型
  if(type == 'questionType') {
    queryExperimentQuestionParams.value.questionType = value
    questionTypeTmp = value
    getExperimentQuestionList();
  }else {
    queryExperimentQuestionParams.value.questionType = questionTypeTmp
    getExperimentQuestionList();
  }
}


//题库筛选
const handleQuestionRefresh = () => {
  // 重置搜索条件
  queryExperimentQuestionParamsReset()
  // 重新加载数据
  getExperimentQuestionList()
  ElMessage.success('刷新成功')
}

//======================================================素材相关=============================================================

//实验器具选择器具列表请求参数
const queryourceMaterialParams =ref({
    pageNum: 1,
    pageSize: 100000,
    fileName:'',
    fileType:'',
    sourceType:''
  }
)


const sourceMaterialList = ref([]) // 当前显示的题目列表
const sourceMaterialTotal = ref(0);
//获取未选择-题库数据
function getSourceMaterialList() {
  loading.value = true;
  listSourceMaterial(queryourceMaterialParams.value).then(response => {
    sourceMaterialList.value = response.rows;
    sourceMaterialTotal.value = response.total;
    loading.value = false;
  });
}

// 未选择的素材计算属性
const unselectedMaterials = computed(() => {
  return sourceMaterialList.value
})

// 添加选择素材的方法
const selectMaterials = () => {
  materialDialogVisible.value = true
  // 初始化弹窗数据
  getSourceMaterialList()
}

// 修改素材选择处理方法
const handleMaterialSelectionChange = (selection) => {
  selectedMaterials.value = selection
}

 // 存储所有素材数据
const allMaterials = ref({
  experimentId:'',
  sourceMaterialList:[]
})


// 修改确认选择素材方法
const confirmMaterialSelection = () => {
  if (selectedMaterials.value.length === 0) {
    ElMessage.warning('请至少选择一个素材')
    return
  }

  // 检查重复选择
  const newMaterials = selectedMaterials.value

  // 添加新选择的素材
  allMaterials.value.sourceMaterialList = [ ...newMaterials]
  
  //进行将已经选择数据添加到实验题库列表
  allMaterials.value.experimentId = props.experimentId//实验id
    insertBatchMtExperimentSourceMaterial(allMaterials.value).then(response => {
    if(response.code == 200){
        // 关闭弹窗并清空选择
        materialDialogVisible.value = false
        selectedMaterials.value = []
        ElMessage.success(`成功添加 ${newMaterials.length} 个素材`)
        // 重新加载当前页数据
        getExperimentSourceMaterialList()
      }else{
        ElMessage.error('添加失败')
      } 
  });

}


//获取已选择的素材列表
const queryExperimentSourceMaterialParams = ref({
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: '',
    fileName:'',
    fileType:'',
    sourceType:''
  }
)

const queryExperimentSourceMaterialParamsReset = () => {
  queryExperimentSourceMaterialParams.value = {
    fileName:'',
    fileType:'',
    sourceType:''
  }
}
const experimentSourceMaterialPageList = ref([])
const experimentSourceMaterialTotal = ref(0);
//获取已经选择的器具列表
function getExperimentSourceMaterialList() {
  loading.value = true;
  queryExperimentSourceMaterialParams.value.experimentInfoId = props.experimentId//实验id
  listExperimentMaterial(queryExperimentSourceMaterialParams.value).then(response => {
    experimentSourceMaterialPageList.value = response.rows;
    experimentSourceMaterialTotal.value = response.total;
    loading.value = false;
  });
}


// 处理素材页码改变
const handleSourceMaterialCurrentChange = (val) => {
  queryExperimentSourceMaterialParams.value.pageNum = val
  // 这里调用获取数据的方法
  getExperimentSourceMaterialList()
}

// 删除素材
const deleteMaterial = (row) => {
  ElMessageBox.confirm('确定要删除该素材吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delExperimentMaterial(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getExperimentSourceMaterialList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}


// 对所有的tab进行校验，如果都没有操作则无法通过下一步
const validateForm = async () => {
  if (activeTab.value == 'questions') {
    // Validate principle tab
    if (experimentQuestionPageList.value.length === 0) {
      throw new Error('请完成实验题目的必填项')
    }
  } else if (activeTab.value == 'materials') {
    // Validate target tab
    if (experimentSourceMaterialPageList.value.length === 0) {
      throw new Error('请完成实验素材的必填项')
    }
  }
  return true
}

//暴漏给父组件
defineExpose({
  validateForm
})

// 搜索栏显示状态
const isSearchVisible = ref(false)

// 切换搜索栏显示状态
const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value
}


// 材新刷新方法
const handleRefresh = () => {
  // 重置搜索条件
  queryExperimentSourceMaterialParamsReset()
  getExperimentSourceMaterialList()
  // 重新加载数据
  // handleSearch()
  ElMessage.success('刷新成功')
}


// 初始化数据
onMounted(() => {
  getExperimentQuestionList() // 初始化题库列表
  getExperimentSourceMaterialList() // 初始化素材列表
})



// 素材-弹窗搜索餐宿方法
const handleMaterialDialogSearch = (type,value) => {
  let fileNameTmp = ''//文件名称
  let fileTypeIdTmp = ''//文件类型
  let sourceTypeIdTmp = ''//素材类别
  if(type == 'fileName') {
    queryourceMaterialParams.value.fileName = value
    fileNameTmp = value
    getSourceMaterialList();
  } else if(type == 'fileType') {
    queryourceMaterialParams.value.fileType = value
    fileTypeIdTmp = value
    getSourceMaterialList();
  }else if(type == 'sourceType') {
    queryourceMaterialParams.value.sourceType = value
    sourceTypeIdTmp = value
    getSourceMaterialList();
  }else {
    queryourceMaterialParams.value.fileName = fileNameTmp
    queryourceMaterialParams.value.fileType = fileTypeIdTmp
    queryourceMaterialParams.value.sourceType = sourceTypeIdTmp
    getSourceMaterialList();
  }
}

// 素材已经选择-搜索方法
const handleMaterialSearch = (type, value) => {
  let fileNameTmp = ''//文件名称
  let fileTypeIdTmp = ''//文件类型
  let sourceTypeIdTmp = ''//素材类别
  if(type == 'fileName') {
    queryExperimentSourceMaterialParams.value.fileName = value
    fileNameTmp = value
    getExperimentSourceMaterialList();
  } else if(type == 'fileType') {
    queryExperimentSourceMaterialParams.value.fileType = value
    fileTypeIdTmp = value
    getExperimentSourceMaterialList();
  }else if(type == 'sourceType') {
    queryExperimentSourceMaterialParams.value.sourceType = value
    sourceTypeIdTmp = value
    getExperimentSourceMaterialList();
  }else {
    queryExperimentSourceMaterialParams.value.fileName = fileNameTmp
    queryExperimentSourceMaterialParams.value.fileType = fileTypeIdTmp
    queryExperimentSourceMaterialParams.value.sourceType = sourceTypeIdTmp
    getExperimentSourceMaterialList();
  }
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
const handleTabChange = (tab) => {
  activeTab.value = tab.props.name
  // 隐藏搜索框
  isSearchVisible.value = false
  // 清空搜索内容并重新加载数据
  if (activeTab.value == 'questions') {
    // 清空题库搜索表单
    searchForm.content = ''
    searchForm.subject = ''
    searchForm.type = ''
    // 重新加载题库数据
    getExperimentQuestionList()
  } else if(activeTab.value == 'materials') {
    // 清空素材搜索表单
    queryourceMaterialParams.content = ''
    queryourceMaterialParams.subject = ''
    queryourceMaterialParams.fileType = ''
    // 重新加载素材数据
    getExperimentSourceMaterialList()
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
  /* background: #f8fafc; */
  border-radius: 8px;
  /* padding: 20px; */
  /* margin-bottom: 1px; */
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
  /* border-top: 1px solid #e4e7ed;
  background: #f8fafc; */
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