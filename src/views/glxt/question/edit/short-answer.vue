<template>
  <div class="app-container">
    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <span>编辑简答题</span>
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
              placeholder="请输入题目题干"
            />
          </el-form-item>

          <el-form-item label="答案：" prop="correct" required>
            <el-input 
              v-model="formData.correct"   
              @focus="inputClick(formData,'correct')"
              type="textarea"
              :rows="3"
              placeholder="请输入标准答案"
            />
          </el-form-item>

          <el-form-item label="解析：" prop="analyze" required>
            <el-input 
              v-model="formData.analyze"  
              @focus="inputClick(formData,'analyze')"
              type="textarea"
              :rows="3"
              placeholder="请输入答案解析"
            />
          </el-form-item>

          <el-form-item label="分数：" prop="score" required>
            <el-input-number 
              v-model="formData.score" 
              :precision="1" 
              :step="1" 
              :max="100"
              class="fixed-width-input"
            ></el-input-number>
          </el-form-item>

          <el-form-item label="难度：" required>
            <el-rate 
              v-model="formData.difficult"
              class="difficulty-rate"
            ></el-rate>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 富文本编辑器 -->
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

    <!-- 预览对话框 -->
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

      .fixed-width-input {
        width: 240px;
      }

      .difficulty-rate {
        margin-top: 8px;
      }

      :deep(.el-textarea__inner) {
        font-family: inherit;
        line-height: 1.5;
        padding: 12px;
      }

      :deep(.el-input-number) {
        width: 240px;
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

// 深度选择器处理 Element Plus 组件样式
:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-rate) {
  margin-top: 5px;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuestionShow from '../components/Show'
import Tinymce from "@/components/Tinymce/index.vue"
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { addQuestion, getQuestion, updateQuestion } from '@/api/glxt/question'

// 路由相关
const route = useRoute()
const router = useRouter()

// 表单相关
const formRef = ref(null)
const formLoading = ref(false)
const tinymceRef = ref(null)

// 基础数据
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
const formData = ref({
  id: null,
  questionType: 5, // 简答题类型
  gradeLevel: '',
  subjectId: '',
  title: '',
  analyze: '',
  correct: '',
  score: '1',
  difficult: 0
})

// 表单验证规则
const rules = {
  gradeLevel: [{ required: true, message: '请选择年级', trigger: 'change' }],
  subjectId: [{ required: true, message: '请选择学科', trigger: 'change' }],
  title: [{ required: true, message: '请输入题干', trigger: 'blur' }],
  correct: [{ required: true, message: '请输入答案', trigger: 'blur' }],
  analyze: [{ required: true, message: '请输入解析', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分数', trigger: 'blur' }]
}

// 富文本编辑器相关
const richEditor = ref({
  dialogVisible: false,
  object: null,
  parameterName: '',
  instance: null,
  content: ''
})

// 预览相关
const questionShow = ref({
  qType: 0,
  dialog: false,
  question: null,
  loading: false
})

// 编辑器相关方法
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
  richEditor.value.content = object[parameterName] || ''
  richEditor.value.dialogVisible = true
  
  if (richEditor.value.instance) {
    richEditor.value.instance.setContent(richEditor.value.content)
  }
}

const editorConfirm = () => {
  const content = richEditor.value.content
  if (richEditor.value.object === formData.value) {
    formData.value[richEditor.value.parameterName] = content
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

// 表单相关方法
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    formLoading.value = true
    const res = await addQuestion(formData.value)
    
    if (res.code === 200) {
      ElMessage.success('保存成功')
      router.push('/glxt/question/list')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('表单提交错误:', error)
    ElMessage.error('表单验证失败')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  if (!formRef.value) return
  const lastId = formData.value.id
  formRef.value.resetFields()
  
  Object.assign(formData.value, {
    id: lastId,
    questionType: 5,
    gradeLevel: '',
    subjectId: '',
    title: '',
    analyze: '',
    correct: '',
    score: '',
    difficult: 0
  })
}

const levelChange = () => {
  formData.value.subjectId = null
}

const showQuestion = () => {
  questionShow.value.dialog = true
  questionShow.value.qType = formData.value.questionType
  questionShow.value.question = formData.value
}

// 初始化数据
const initQuestionData = async (id) => {
  if (!id || parseInt(id) === 0) return
  
  formLoading.value = true
  try {
    const response = await getQuestion(id)
    if (response.data) {
      Object.assign(formData.value, response.data)
    }
  } catch (error) {
    console.error('获取题目数据失败:', error)
    ElMessage.error('获取题目数据失败')
  } finally {
    formLoading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  const id = route.query.id
  if (id) {
    initQuestionData(id)
  }
})

// 无需使用 defineExpose，因为使用 setup 语法糖时，模板可以直接访问所有定义的变量和方法
</script>
