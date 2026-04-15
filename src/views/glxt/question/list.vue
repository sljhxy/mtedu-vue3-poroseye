<template>
  <div class="app-container">
    <!-- <el-form :model="queryParam" ref="queryFormRef" :inline="true" v-show="showSearch"> -->
    <el-form :model="queryParam" ref="queryFormRef" :inline="true" >
      <!-- <el-form-item label="题目ID：">
        <el-input v-model="queryParam.id" clearable></el-input>
      </el-form-item>
      <el-form-item label="题目内容：">
        <el-input v-model="queryParam.content" clearable></el-input>
      </el-form-item> -->

      <!-- <el-form-item label="年级：">
        <el-select v-model="queryParam.level" placeholder="年级"  @change="levelChange" clearable>
          <el-option v-for="item in levelEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学科：">
        <el-select v-model="queryParam.subjectId" clearable>
          <el-option v-for="item in subjectFilter" :key="item.id" :value="item.id"
                    :label="item.name+' ( '+item.levelName+' )'"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="类型：">
        <el-select v-model="queryParam.schoolType" clearable style="width: 100px;" :disabled="isTeacher">
          <el-option v-for="item in mt_school_type" :key="item.value" :value="item.value"
                    :label="item.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="题型：">
        <el-select v-model="queryParam.questionType" clearable style="width: 100px;">
          <el-option v-for="item in mt_question_type" :key="item.value" :value="item.value" :label="item.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="submitForm">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        
      
      </el-form-item>
    </el-form>
  
    <!-- <right-toolbar v-model:showSearch="showSearch" @queryTable="submitForm" style="margin-bottom: 10px;float: right;"></right-toolbar> -->
    <!-- v-loading="listLoading"  -->
    <!-- 添加按钮 按照后续需要再进行添加 -->
    
    <!-- <el-tooltip placement="bottom" trigger="click" effect="light">
          <template #content>
            <el-button type="warning" size="small" v-for="item in editUrlEnumTmp" :key="item.key"
                      @click="$router.push({path:item.value})">{{item.name}}
            </el-button>
          </template>
          <el-button slots="default" type="primary" class="link-left" style="float: right;">添加</el-button>
        </el-tooltip> -->
    <el-table :data="tableData" border fit highlight-current-row style="width: 100%" v-loading="listLoading">
      <el-table-column type="index" label="序号" width="70px" align="center"/>
      <el-table-column prop="schoolType" label="学校类型"  width="120px" align="center">
        <template #default="scope">
          <dict-tag :options="mt_school_type" :value="scope.row.schoolType"/>
        </template>
      </el-table-column>
      <el-table-column prop="academicStageType" label="学段"  width="120px" align="center">
        <template #default="scope">
          <dict-tag :options=" scope.row.schoolType == 1 ? mt_academic_stage : mt_vocal_education_type" :value="scope.row.academicStageType"/>
        </template>
      </el-table-column>
      <el-table-column prop="questionType" label="题型"  width="70px" align="center">
        <template #default="scope">
          <dict-tag :options="mt_question_type" :value="scope.row.questionType"/>
        </template>
      </el-table-column>
      <el-table-column prop="shortTitle" label="题干" show-overflow-tooltip>
        <template #default="{row}">
          <div v-html="row.shortTitle"></div>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="分数" width="60px"/>
      <el-table-column prop="difficult" label="难度" width="60px"/>
      <el-table-column label="操作" align="center" width="300px">
        <template #default="{row}">
          <!-- <el-button plain type="info" color="#6c757d" @click="showQuestion(row)">预览</el-button> -->
          <el-button plain type="success" icon="Edit" color="#6EDC93" @click="editQuestion(row)">编辑</el-button>
          <el-button plain type="danger" icon="Delete" @click="deleteQuestion(row)" class="link-left">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

        <!-- 分页器 -->
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParam.pageNum"
        v-model:limit="queryParam.pageSize"
        @pagination="search"/>

    <el-dialog v-model="questionShow.dialog" style="width: 50%;height: 50%">
      <QuestionShow :qType="questionShow.qType" :question="questionShow.question" :qLoading="questionShow.loading"/>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Pagination from '@/components/Pagination'
import QuestionShow from './components/Show'
import { listQuestion, getQuestion, delQuestion} from '@/api/glxt/question'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTeacherInfo } from '@/store/modules/teacherInfo'

const showSearch = ref(false);//默认隐藏
const { isTeacher, schoolType: userSchoolType } = useTeacherInfo()

const { proxy } = getCurrentInstance();
//字典引入 学校类型、  mt_vocal_education_type->职教学段、mt_academic_stage->普教学段、 学制
const { mt_question_type, mt_school_type, mt_vocal_education_type, mt_academic_stage} = proxy.useDict('mt_question_type', 'mt_school_type', 'mt_vocal_education_type', 'mt_academic_stage');


const router = useRouter()

// 响应式状态
const queryParam = reactive({
  id: null,
  questionType: null,
  schoolType: null,
  level: null,
  subjectId: null,
  pageNum: 1,
  pageSize: 10
})

const subjectFilter = ref(null)
const listLoading = ref(true)
const tableData = ref([])
const total = ref(0)

//预览题库
const questionShow = ref({
  qType: 0,
  dialog: false,
  question: null,
  loading: false
})

// 编辑页面路由映射
const editUrlEnumTmp = [
  { key: 1, value: '/glxt/question/edit/singleChoice', name: '单选题' },
  { key: 2, value: '/glxt/question/edit/multipleChoice', name: '多选题' },
  { key: 3, value: '/glxt/question/edit/trueFalse', name: '判断题' },
  { key: 4, value: '/glxt/question/edit/gapFilling', name: '填空题' },
  { key: 5, value: '/glxt/question/edit/shortAnswer', name: '简答题' }
]



/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryFormRef");
  submitForm();
}

// 搜索方法
const submitForm = () => {
  queryParam.pageNum = 1
  search()
}

//获取题库列表
const search = async () => {
  listLoading.value = true
  try {
    const data = await listQuestion(queryParam)
    const re = data.rows
    tableData.value = re || []
    total.value = data.total || 0
  } catch (error) {
    ElMessage.error('查询失败，请稍后重试')
    tableData.value = []
    total.value = 0
  } finally {
    listLoading.value = false
  }
}

// 预览题库
const showQuestion = async (row) => {
  questionShow.value.dialog = true
  questionShow.value.loading = true
  try {
    const re = await getQuestion(row.id)
    questionShow.value.qType = re.data.questionType
    questionShow.value.question = re.data
  } finally {
    questionShow.value.loading = false
  }
}

const editQuestion = (row) => {
  // router.push({ path: url, query: { id: row.id } })
  const url = editUrlEnumTmp.find(item => item.key === row.questionType)?.value
  if (url) {
    router.push({ path: url, query: { id: row.id } })
  } else {
    ElMessage.error('未找到对应的编辑页面')
  }
}

//删除题库
const  deleteQuestion= async (row) => {

  ElMessageBox.confirm(
    `确定要删除吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除逻辑
    delQuestion(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        search()
      } else {
        ElMessage.error('删除失败')
      }
    });
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}


// 生命周期钩子
onMounted(() => {
  queryParam.pageNum = 1
  // 教师用户自动填充学校类型
  if (isTeacher.value) {
    queryParam.schoolType = userSchoolType.value
  }
  search()
})
</script>
