<template>
  <div class="app-container">
    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <span>编辑判断题</span>
          <div class="header-actions">
            <el-button type="primary" @click="submitForm">保存</el-button>
            <el-button @click="resetForm">重置</el-button>
            <el-button type="success" @click="showQuestion">预览</el-button>
          </div>
        </div>
      </template>

      <el-form 
        :model="formData" 
        ref="formRef" 
        label-width="100px" 
        :rules="rules" 
        v-loading="formLoading"
        class="question-form"
      >
        <!-- 基础信息区域 -->
        <div class="form-section">
          <div class="section-row">
            <el-form-item label="年级：" prop="gradeLevel" required>
              <el-select 
                v-model="formData.gradeLevel" 
                placeholder="请选择年级"  
                @change="levelChange" 
                clearable
                class="fixed-width-select"
              >
                <el-option 
                  v-for="item in levelEnumTmp" 
                  :key="item.id" 
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="学科：" prop="subjectId" required>
              <el-select 
                v-model="formData.subjectId" 
                placeholder="请选择学科"
                class="fixed-width-select"
              >
                <el-option 
                  v-for="item in subjectFilterTmp" 
                  :key="item.id" 
                  :value="item.id" 
                  :label="item.name+' ( '+item.levelName+' )'"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- 题目内容区域 -->
        <div class="form-section">
          <el-form-item label="题干：" prop="title" required>
            <el-input 
              v-model="formData.title"   
              @focus="inputClick(formData,'title')"
              type="textarea"
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="选项：" required>
            <div class="options-container">
              <div class="options-list">
                <div 
                  v-for="(item) in formData.items" 
                  :key="item.prefix"
                  class="option-item"
                >
                  <div class="option-prefix">{{item.prefix}}</div>
                  <el-input 
                    v-model="item.content" 
                    @focus="inputClick(item,'content')"
                    class="content-input"
                    placeholder="请输入选项内容"
                  />
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="正确答案：" prop="correct" required>
            <el-radio-group v-model="formData.correct">
              <el-radio  v-for="item in formData.items"  :key="item.prefix"  :label="item.prefix">{{item.prefix}}</el-radio>
            </el-radio-group>
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
import QuestionShow from '../components/Show'
import Tinymce from "@/components/Tinymce/index.vue"
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addQuestion, getQuestion, updateQuestion } from '@/api/glxt/question'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const formLoading = ref(false)

// 定义响应式状态
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

const formData = ref({
  id: null,
  questionType: 3,
  gradeLevel: null,
  subjectId: null,
  title: '',
  items: [
    { id: null, prefix: 'A', content: '是' },
    { id: null, prefix: 'B', content: '否' }
  ],
  analyze: '',
  correct: '',
  score: '',
  difficult: 0
})

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
  correct: [
    { required: true, message: '请选择正确答案', trigger: 'change' }
  ]
}

const tinymceRef = ref(null)
const richEditor = ref({
  dialogVisible: false,
  object: null,
  parameterName: '',
  instance: null,
  content: ''
})

const questionShow = ref({
  qType: 0,
  dialog: false,
  question: null,
  loading: false
})

// Methods
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    formLoading.value = true
    const res = await addQuestion(formData.value)
    
    if (res.code === 200) {
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
  let lastId = formData.value.id
  formRef.value.resetFields()
  formData.value = {
    id: null,
    questionType: 3,
    gradeLevel: null,
    subjectId: null,
    title: '',
    items: [
      { id: null, prefix: 'A', content: '是' },
      { id: null, prefix: 'B', content: '否' }
    ],
    analyze: '',
    correct: '',
    score: '',
    difficult: 0
  }
  formData.value.id = lastId
}

const levelChange = () => {
  formData.value.subjectId = null
  // subjectFilterTmp.value = subjectFilterTmp.value.filter(data => data.level === formData.value.gradeLevel)
}

const showQuestion = () => {
  questionShow.value.dialog = true
  questionShow.value.qType = formData.value.questionType
  questionShow.value.question = formData.value
}

const editorReady = (editor) => {
  richEditor.value.instance = editor
  if (richEditor.value.object && richEditor.value.parameterName) {
    let currentContent = ''
    if (richEditor.value.object === formData.value) {
      currentContent = formData.value[richEditor.value.parameterName] || ''
    } else {
      currentContent = richEditor.value.object[richEditor.value.parameterName] || ''
    }
    richEditor.value.content = currentContent
    editor.setContent(currentContent)
  }
}

const inputClick = (object, parameterName) => {
  richEditor.value.object = object
  richEditor.value.parameterName = parameterName
  if (object === formData.value) {
    richEditor.value.content = formData.value[parameterName] || ''
  } else {
    richEditor.value.content = object[parameterName] || ''
  }
  richEditor.value.dialogVisible = true
  
  if (richEditor.value.instance) {
    richEditor.value.instance.setContent(richEditor.value.content)
  }
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

// 生命周期钩子
onMounted(async () => {
  const id = route.query.id
  if (id && parseInt(id) !== 0) {
    formLoading.value = true
    try {
      const response = await getQuestion(id)
      Object.assign(formData.value, response.response)
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

    .options-container {
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
