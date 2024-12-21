<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
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
      <!-- <el-form-item label="题型：">
        <el-select v-model="queryParam.questionType" clearable>
          <el-option v-for="item in questionType" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <!-- <el-tooltip placement="bottom" trigger="click">
          <template #content>
            <el-button type="warning" size="mini" v-for="item in editUrlEnumTmp" :key="item.key"
                      @click="$router.push({path:item.value})">{{item.name}}
            </el-button>
          </template>
          <el-button slots="default" type="primary" class="link-left" style="float: right;">添加</el-button>
        </el-tooltip> -->
      </el-form-item>
    </el-form>
    <!-- v-loading="listLoading"  -->
    <el-table :data="tableData" border fit highlight-current-row style="width: 100%" v-loading="listLoading">
      <el-table-column type="index" label="序号" width="70px"/>
      <el-table-column prop="subjectId" label="学科" :formatter="subjectFormatter" width="120px"/>
      <el-table-column prop="questionType" label="题型" :formatter="questionTypeFormatter" width="70px"/>
      <el-table-column prop="shortTitle" label="题干" show-overflow-tooltip/>
      <el-table-column prop="score" label="分数" width="60px"/>
      <el-table-column prop="difficult" label="难度" width="60px"/>
      <el-table-column label="操作" align="center" width="300px">
        <template #default="{row}">
          <el-button size="mini"   @click="showQuestion(row)">预览</el-button>
          <el-button size="mini" plain type="success" icon="Edit"  @click="editQuestion(row)">编辑</el-button>
          <el-button size="mini" plain type="danger" icon="Delete" @click="deleteQuestion(row)" class="link-left">删除</el-button>
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
// 组件注册
const components = { Pagination, QuestionShow }

const store = useStore()
const router = useRouter()

// 响应式状态
const queryParam = reactive({
  id: null,
  questionType: null,
  level: null,
  subjectId: null,
  pageNum: 1,
  pageSize: 10
})

const subjectFilter = ref(null)
const listLoading = ref(true)
const tableData = ref([])
const total = ref(0)

const questionShow = reactive({
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

// 计算属性
const questionType = computed(() => store.state.enumItem.exam.question.typeEnum)
const editUrlEnum = computed(() => store.state.enumItem.exam.question.editUrlEnum)
const levelEnum = computed(() => store.state.enumItem.user.levelEnum)
const subjects = computed(() => store.state.exam.subjects)

// 方法
const submitForm = () => {
  queryParam.pageNum = 1
  search()
}

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

const levelChange = () => {
  queryParam.subjectId = null
  subjectFilter.value = subjects.value.filter(data => data.level === queryParam.level)
}

const showQuestion = async (row) => {
  questionShow.dialog = true
  questionShow.loading = true
  try {
    const re = await getQuestion(row.id)
    questionShow.qType = re.data.questionType
    questionShow.question = re.response
  } finally {
    questionShow.loading = false
  }
}

const editQuestion = (row) => {
  // const url = store.getters['enumItem/enumFormat'](editUrlEnum.value, row.questionType)
  // router.push({ path: url, query: { id: row.id } })
  const url = editUrlEnumTmp.find(item => item.key === row.questionType)?.value
  if (url) {
    router.push({ path: url, query: { id: row.id } })
  } else {
    ElMessage.error('未找到对应的编辑页面')
  }
}

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

// const questionTypeFormatter = (row, column, cellValue) => {
//   return store.getters['enumItem/enumFormat'](questionType.value, cellValue)
// }

// const subjectFormatter = (row, column, cellValue) => {
//   return store.getters['exam/subjectEnumFormat'](cellValue)
// }

// 生命周期钩子
onMounted(() => {
  queryParam.pageNum = 1
  search()
})
</script>
