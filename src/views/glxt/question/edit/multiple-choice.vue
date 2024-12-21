<template>
  <div class="app-container">
    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <span>编辑多选题</span>
          <div class="header-actions">
            <el-button type="primary" @click="submitForm">保存</el-button>
            <el-button @click="resetForm">重置</el-button>
            <el-button type="success" @click="showQuestion">预览</el-button>
          </div>
        </div>
      </template>

      <el-form :model="formData" ref="formRef" label-width="100px" v-loading="formLoading" :rules="rules" class="question-form">
        <!-- 基础信息区域 -->
        <div class="form-section">
          <div class="section-row">
            <el-form-item label="年级：" prop="gradeLevel" required>
              <el-select v-model="formData.gradeLevel" placeholder="请选择年级" clearable class="fixed-width-select">
                <el-option v-for="item in levelEnumTmp" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="学科：" prop="subjectId" required>
              <el-select v-model="formData.subjectId" placeholder="请选择学科" class="fixed-width-select">
                <el-option v-for="item in subjectFilterTmp" :key="item.id"  :value="item.id" :label="item.name+' ( '+item.levelName+' )'"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- 题目内容区域 -->
        <div class="form-section">
          <el-form-item label="题干：" prop="title" required>
            <el-input v-model="formData.title" @focus="inputClick(formData,'title')" type="textarea" :rows="3"/>
          </el-form-item>

          <el-form-item label="选项：" required>
            <div class="options-container">
              <div class="options-header">
                <el-button type="primary" @click="questionItemAdd" size="small">
                  <el-icon><Plus /></el-icon>添加选项
                </el-button>
              </div>
              <div class="options-list">
                <div v-for="(item, index) in formData.items" :key="index" class="option-item">
                  <div class="option-prefix">{{item.prefix}}</div>
                  <el-input v-model="item.content" @focus="inputClick(item,'content')" class="content-input" placeholder="请输入选项内容"/>
                  <el-button type="danger" circle size="small" @click="questionItemRemove(index)" class="remove-btn">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-form-item>

          <!-- 更新多选答案部分 -->
          <el-form-item label="正确答案：" prop="correctArray" required>
            <el-checkbox-group v-model="formData.correctArray" class="answer-group">
              <el-checkbox v-for="item in formData.items" :key="item.prefix" :label="item.prefix" class="answer-checkbox">
                {{item.prefix}}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="解析：" prop="analyze" required>
            <el-input v-model="formData.analyze"  @focus="inputClick(formData,'analyze')" />
          </el-form-item>
          <el-form-item label="分数：" prop="score" required>
            <el-input-number v-model="formData.score" :precision="1" :step="1" :max="100"></el-input-number>
          </el-form-item>
          <el-form-item label="难度：" required>
            <el-rate v-model="formData.difficult" class="question-item-rate"></el-rate>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <el-dialog 
      v-model="richEditor.dialogVisible"   
      :close-on-click-modal="false" 
      width="800px"
      destroy-on-close
      @close="closeEditor"
    >
      <Tinymce 
        ref="tinymceRef" 
        v-model="richEditor.content" 
        @onInit="editorReady"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeEditor">取 消</el-button>
          <el-button type="primary" @click="editorConfirm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog 
      v-model="questionShow.dialog" 
      width="40%"
      destroy-on-close
    >
      <QuestionShow 
        :qType="questionShow.qType" 
        :question="questionShow.question" 
        :qLoading="questionShow.loading"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import QuestionShow from '../components/Show'
import Tinymce from "@/components/Tinymce/index.vue"
import { addQuestion, getQuestion, updateQuestion } from '@/api/glxt/question'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const formLoading = ref(false)

const formData = ref({
  id: null,
  questionType: 2,
  gradeLevel: '',
  subjectId: '',
  title: '',
  items: [
    { prefix: 'A', content: '' },
    { prefix: 'B', content: '' },
    { prefix: 'C', content: '' },
    { prefix: 'D', content: '' }
  ],
  analyze: '',
  correct: '',
  correctArray: [],
  score: '1',
  difficult: 0
})

const levelEnumTmp = [
  {id:1, name:'一年级'},
  {id:2, name:'二年级'},
  {id:3, name:'三年级'}
]

const subjectFilterTmp = [
  {id:1, name:'语文', levelName:'一年级'},
  {id:2, name:'数学', levelName:'一年级'},
  {id:3, name:'英语', levelName:'二年级'},
  {id:4, name:'物理', levelName:'二年级'},
  {id:5, name:'化学', levelName:'三年级'},
  {id:6, name:'生物', levelName:'三年级'}
]

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
  ],
  correctArray: [
    { required: true, message: '请选择正确答案', trigger: 'change' }
  ]
}

const richEditor = ref({
  dialogVisible: false,
  object: null,
  parameterName: '',
  instance: null,
  content: ''
})

const questionShow = {
  qType: 0,
  dialog: false,
  question: null,
  loading: false
}

onMounted(() => {
  let id = route.query.id
  if (id && parseInt(id) !== 0) {
    formLoading.value = true
    getQuestion(id).then(re => {
      formData.value = re.response
      formLoading.value = false
    })
  }
})

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
  const content = richEditor.value.content
  
  if (richEditor.value.object === formData.value) {
    formData.value[richEditor.value.parameterName] = content
  } else {
    const index = formData.value.items.findIndex(item => item === richEditor.value.object)
    if (index !== -1) {
      formData.value.items[index][richEditor.value.parameterName] = content
    }
  }
  
  closeEditor()
}

const closeEditor = () => {
  richEditor.value.dialogVisible = false
  richEditor.value.object = null
  richEditor.value.parameterName = ''
  richEditor.value.content = ''
  if (richEditor.value.instance) {
    richEditor.value.instance.setContent('')
  }
}

const questionItemRemove = (index) => {
  formData.value.items.splice(index, 1)
}

const questionItemAdd = () => {
  let items = formData.value.items
  let newLastPrefix
  if (items.length > 0) {
    let last = items[items.length - 1]
    newLastPrefix = String.fromCharCode(last.prefix.charCodeAt() + 1)
  } else {
    newLastPrefix = 'A'
  }
  items.push({ id: null, prefix: newLastPrefix, content: '' })
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      formLoading.value = true
      addQuestion(formData.value).then(re => {
        if (re.code === 200) {
          ElMessage.success(re.message)
          router.push('/exam/question/list')
        } else {
          ElMessage.error(re.message)
          formLoading.value = false
        }
      }).catch(e => {
        formLoading.value = false
      })
    } else {
      return false
    }
  })
}

const levelChange = () => {
  formData.value.subjectId = null
}

const showQuestion = () => {
  questionShow.dialog = true
  questionShow.qType = formData.value.questionType
  questionShow.question = formData.value
}

const resetForm = () => {
  let lastId = formData.value.id
  formRef.value.resetFields()
  formData.value = {
    id: null,
    questionType: 2,
    gradeLevel: null,
    subjectId: null,
    title: '',
    items: [
      { id: null, prefix: 'A', content: '' },
      { id: null, prefix: 'B', content: '' },
      { id: null, prefix: 'C', content: '' },
      { id: null, prefix: 'D', content: '' }
    ],
    analyze: '',
    correct: '',
    correctArray: [],
    score: '',
    difficult: 0
  }
  formData.value.id = lastId
}
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

    .options-container {
      .options-header {
        margin-bottom: 16px;
      }

      .options-list {
        .option-item {
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
            
            .remove-btn {
              opacity: 1;
            }
          }

          .option-prefix {
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
            width: 500px;
          }

          .remove-btn {
            opacity: 0.5;
            transition: all 0.3s;

            &:hover {
              opacity: 1;
              transform: scale(1.1);
            }
          }
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

