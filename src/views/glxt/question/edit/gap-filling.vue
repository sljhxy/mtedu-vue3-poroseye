<template>
  <div class="app-container">
    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <span>编辑填空题</span>
          <div class="header-actions">
            <el-button type="primary" @click="submitForm">保存</el-button>
            <el-button @click="resetForm">重置</el-button>
            <el-button type="success" @click="showQuestion">预览</el-button>
          </div>
        </div>
      </template>

      <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading" :rules="rules" class="question-form">
        <!-- 基础信息区域 -->
        <div class="form-section">
          <div class="section-row">
            <el-form-item label="年级：" prop="gradeLevel" required>
              <el-select v-model="form.gradeLevel" placeholder="请选择年级" @change="levelChange" clearable class="fixed-width-select">
                <el-option v-for="item in levelEnumTmp" :key="item.id" :value="item.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="学科：" prop="subjectId" required>
              <el-select v-model="form.subjectId" placeholder="请选择学科" class="fixed-width-select">
                <el-option v-for="item in subjectFilterTmp" :key="item.id" :value="item.id" :label="item.name+' ( '+item.levelName+' )'"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- 题目内容区域 -->
        <div class="form-section">
          <el-form-item label="题干：" prop="title" required>
            <el-input v-model="form.title" @focus="inputClick(form,'title')" type="textarea" :rows="3"/>
          </el-form-item>

          <el-form-item label="填空答案：" required>
            <div class="answers-container">
              <div v-for="item in form.items" :key="item.prefix" class="answer-item">
                <div class="answer-prefix">{{item.prefix}}</div>
                <el-input 
                  v-model="item.content"   
                  @focus="inputClick(item,'content')"  
                  class="content-input"
                  placeholder="请输入答案内容"
                />
                <div class="score-input">
                  <span>分数：</span>
                  <el-input-number v-model="item.score" :precision="1" :step="1" :max="100" size="small"></el-input-number>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="解析：" prop="analyze" required>
            <el-input v-model="form.analyze"  @focus="inputClick(form,'analyze')" />
          </el-form-item>
          <el-form-item label="分数：" prop="score" required>
            <el-input-number v-model="form.score" :precision="1" :step="1" :max="100"></el-input-number>
          </el-form-item>
          <el-form-item label="难度：" required>
            <el-rate v-model="form.difficult" class="question-item-rate"></el-rate>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 编辑器对话框 -->
    <el-dialog 
      v-model="richEditor.dialogVisible" 
      :close-on-click-modal="false" 
      width="800px"
      destroy-on-close
      @close="closeEditor"
    >
      <Tinymce ref="tinymceRef" @ready="editorReady"/>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeEditor">取 消</el-button>
          <el-button type="primary" @click="editorConfirm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="questionShow.dialog" width="40%" destroy-on-close>
      <QuestionShow :qType="questionShow.qType" :question="questionShow.question" :qLoading="questionShow.loading"/>
    </el-dialog>
  </div>
</template>

<script setup>
import QuestionShow from '../components/Show'
import Tinymce from "@/components/Tinymce/index.vue"
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addQuestion, getQuestion } from '@/api/glxt/question'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const tinymceRef = ref(null)
const formLoading = ref(false)

// 年级和学科数据
const levelEnumTmp = ref([
  {id:1, name:'一年级'},
  {id:2, name:'二年级'},
  {id:3, name:'三年级'}
])

const subjectFilterTmp = ref([
  {id:1, name:'语文', levelName:'一年级'},
  {id:2, name:'数学', levelName:'一年级'},
  {id:3, name:'英语', levelName:'二年级'},
  {id:4, name:'物理', levelName:'二年级'},
  {id:5, name:'化学', levelName:'三年级'},
  {id:6, name:'生物', levelName:'三年级'}
])

// 表单数据
const form = ref({
  id: null,
  questionType: 4,
  gradeLevel: null,
  subjectId: null,
  title: '',
  items: [],
  analyze: '',
  correct: '',
  score: '',
  difficult: 0
})

// 表单验证规则
const rules = {
  gradeLevel: [
    { required: true, message: '请选择年级', trigger: 'change' }
  ],
  subjectId: [
    { required: true, message: '请选择学科', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入题干', trigger: 'blur' }
  ],
  analyze: [
    { required: true, message: '请输入解析', trigger: 'blur' }
  ],
  score: [
    { required: true, message: '请输入分数', trigger: 'blur' }
  ]
}

// 富文本编辑器相关
const richEditor = ref({
  dialogVisible: false,
  object: null,
  parameterName: '',
  instance: null,
  content: ''
})

// 预览对话框相关
const questionShow = ref({
  qType: 0,
  dialog: false,
  question: null,
  loading: false
})

// 编辑器相关方法
const editorReady = (instance) => {
  richEditor.value.instance = instance
  let currentContent = richEditor.value.object[richEditor.value.parameterName]
  richEditor.value.instance.setContent(currentContent)
  richEditor.value.instance.focus(true)
}

const inputClick = (object, parameterName) => {
  richEditor.value.object = object
  richEditor.value.parameterName = parameterName
  richEditor.value.dialogVisible = true
}

const editorConfirm = () => {
  let content = richEditor.value.instance.getContent()
  if (richEditor.value.parameterName === 'title') {
    if (questionItemReset(content)) {
      richEditor.value.object[richEditor.value.parameterName] = content
      richEditor.value.dialogVisible = false
    }
  } else {
    richEditor.value.object[richEditor.value.parameterName] = content
    richEditor.value.dialogVisible = false
  }
}

const closeEditor = () => {
  richEditor.value.dialogVisible = false
  richEditor.value.object = null
  richEditor.value.parameterName = ''
  if (richEditor.value.instance) {
    richEditor.value.instance.setContent('')
  }
}

// 填空题特有的方法
const questionItemReset = (content) => {
  let spanRegex = new RegExp('<span class="gapfilling-span (.*?)">(.*?)<\\/span>', 'g')
  let newFormItem = []
  let gapfillingItems = content.match(spanRegex)
  
  if (gapfillingItems === null) {
    ElMessage.error('请插入填空')
    return false
  }

  gapfillingItems.forEach((span, index) => {
    let pairRegex = /<span class="gapfilling-span (.*?)">(.*?)<\/span>/
    pairRegex.test(span)
    newFormItem.push({ 
      id: null, 
      itemUuid: RegExp.$1, 
      prefix: RegExp.$2, 
      content: '', 
      score: '0' 
    })
  })

  newFormItem.forEach(item => {
    form.value.items.some((oldItem, index) => {
      if (oldItem.itemUuid === item.itemUuid) {
        item.content = oldItem.content
        item.id = oldItem.id
        item.score = oldItem.score
        return true
      }
    })
  })

  form.value.items = newFormItem
  return true
}

// 表单操作方法
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    formLoading.value = true
    const res = await addQuestion(form.value)
    
    if (res.code === 1) {
      ElMessage.success(res.message)
      router.push('/exam/question/list')
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    console.error(error)
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  if (!formRef.value) return
  const lastId = form.value.id
  formRef.value.resetFields()
  
  form.value = {
    id: lastId,
    questionType: 4,
    gradeLevel: null,
    subjectId: null,
    title: '',
    items: [],
    analyze: '',
    correct: '',
    score: '',
    difficult: 0
  }
}

const levelChange = () => {
  form.value.subjectId = null
}

const showQuestion = () => {
  questionShow.value.dialog = true
  questionShow.value.qType = form.value.questionType
  questionShow.value.question = form.value
}

// 生命周期钩子
onMounted(async () => {
  const id = route.query.id
  if (id && parseInt(id) !== 0) {
    formLoading.value = true
    try {
      const res = await getQuestion(id)
      if (res.response) {
        form.value = res.response
      }
    } catch (error) {
      console.error(error)
    } finally {
      formLoading.value = false
    }
  }
})
</script>


<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .question-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .question-form {
    .form-section {
      margin-bottom: 24px;

      .section-row {
        display: flex;
        gap: 40px;
        margin-bottom: 20px;

        .fixed-width-select {
          width: 240px;
        }
      }
    }

    .answers-container {
      .answer-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        background-color: #f8f9fa;
        padding: 12px;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: #f0f2f5;
        }

        .answer-prefix {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #409EFF;
          color: white;
          border-radius: 4px;
          font-weight: bold;
        }

        .content-input {
          flex: 1;
        }

        .score-input {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 160px;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>