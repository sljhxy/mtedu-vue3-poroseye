<template>
  <div class="app-container">
    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <span>{{formData.id ? '编辑' : '新增'}}单选题</span>
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
        label-width="140px" 
        :rules="rules" 
        v-loading="formLoading"
        class="question-form"
      >
        <!-- 基础信息区域 -->
        <div class="form-section">
          <div class="section-row">
            <el-form-item label="类型：" prop="schoolType" required>
              <el-select 
                v-model="formData.schoolType" 
                placeholder="请选择学校类型"
                class="fixed-width-select"
                @change="schoolTypeChange"
              >
                <el-option 
                  v-for="item in mt_school_type" 
                  :key="item.value" 
                  :value="item.value" 
                  :label="item.label"
                ></el-option>
              </el-select>
              {{ formData.schoolType }}
            </el-form-item>
            <el-form-item label="学段：" prop="academicStageType" required>
              <el-select 
                v-model="formData.academicStageType" 
                placeholder="请选择学段"
                class="fixed-width-select"
              >
                <el-option 
                  v-for="item in educationStage.value" 
                  :key="item.value" 
                  :value="item.value" 
                  :label="item.label"
                ></el-option>
              </el-select>
              {{ formData.academicStageType }}
            </el-form-item>
            <el-form-item label="科目-教材体系：" prop="subjectId" required>
              <el-cascader
            v-model="formData.courseSystems"
            :options="courseSystemOptions"
            :props="{ 
              expandTrigger: 'hover',
              multiple: true,
              emitPath: true
            }"
            placeholder="请选择课程体系"
            clearable
            collapse-tags
            collapse-tags-tooltip
            class="w-full"
            @change="handleCourseSystemChange"
          />
          {{ formData.courseSystems }}
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
              <div class="options-header">
                <el-button type="primary" @click="questionItemAdd" size="small">
                  <el-icon><Plus /></el-icon>添加选项
                </el-button>
              </div>
              <div class="options-list">
                <div 
                  v-for="(item, index) in formData.items" 
                  :key="index"
                  class="option-item"
                >
                  <div class="option-prefix">{{item.prefix}}</div>
                  <el-input 
                    v-model="item.content" 
                    @focus="inputClick(item, 'content')" 
                    class="content-input"
                    placeholder="请输入选项内容"
                  />
                  <el-button 
                    type="danger" 
                    circle
                    size="small"
                    @click="questionItemRemove(index)"
                    class="remove-btn"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="正确答案：" prop="correct" required>
            <el-radio-group v-model="formData.correct" class="answer-group">
              <el-radio 
                v-for="item in formData.items" 
                :key="item.prefix" 
                :label="item.prefix"
                class="answer-radio"
              >
                {{item.prefix}}
              </el-radio>
            </el-radio-group> 
          </el-form-item>

          <el-form-item label="解析：" prop="analyze" required>
            <el-input 
              v-model="formData.analyze"  
              @focus="inputClick(formData,'analyze')"
              type="textarea"
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="分数：" prop="score" required>
            <el-input-number 
              v-model="formData.score" 
              :precision="1" 
              :step="1" 
              :max="100"
            ></el-input-number>
          </el-form-item>

          <el-form-item label="难度：" required>
            <el-rate v-model="formData.difficult"></el-rate>
          </el-form-item>

          <el-form-item label="知识点：" required>
            <el-tree-select
              v-model="formData.knowledgePoints"
              :data="knowledgeTreeList"
              :props="{
                value: 'id',
                label: 'knowledge',
                children: 'children',
                emitPath: false
              }"
              multiple
              :render-after-expand="false"
              show-checkbox
              placeholder="请选择知识点"
              clearable
              class="knowledge-select"
              collapse-tags-tooltip
              />
          </el-form-item>
          {{ formData.knowledgePoints }}
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

<script setup>
import QuestionShow from '../components/Show'
import Ueditor from '@/components/Ueditor'
import Tinymce from "@/components/Tinymce/index.vue"
import { ref, reactive, onMounted, toRefs, toRaw, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { addQuestion, getQuestion, updateQuestion } from '@/api/glxt/question'

const { proxy } = getCurrentInstance();
//字典引入 学校类型、  mt_vocal_education_type->职教学段、mt_academic_stage->普教学段、 学制
const { mt_school_type, mt_vocal_education_type, mt_academic_stage, mt_school_subject} = proxy.useDict('mt_school_type', 'mt_vocal_education_type', 'mt_academic_stage', 'mt_school_subject');

import { initSubject, getCourseSystemOptions } from '@/api/glxt/subject'

//获取知识点树形结构
import { getKnowledgeTree } from '@/api/glxt/knowledge';

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const formLoading = ref(false)


//知识点树形结构
const knowledgeTreeList = ref([])
const getKnowledgeTreeList = () => {
  getKnowledgeTree({}).then(response => {
    // 递归处理树形数据，确保每个节点都有正确的属性
    const processTreeData = (items) => {
      return items.map(item => ({
        id: item.id,
        knowledge: item.knowledge || item.name,
        label: item.knowledge || item.name, // 添加 label 属性
        value: item.id, // 添加 value 属性
        children: item.children ? processTreeData(item.children) : []
      }))
    }
    
    knowledgeTreeList.value = processTreeData(response.rows)
    console.log('处理后的知识点树形数据:', knowledgeTreeList.value)
  })
}

getKnowledgeTreeList()


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

// 使用 ref 不是 reactive 来管理表单数据
const formData = ref({
  id: null,
  questionType: 1,
  gradeLevel: '',
  subjectId: '',
  schoolType: '',//学校类型 1-普教  2-职教
  academicStageType: '',//学段
  title: '',
  items: [
    { prefix: 'A', content: '' },
    { prefix: 'B', content: '' },
    { prefix: 'C', content: '' },
    { prefix: 'D', content: '' }
  ],
  analyze: '',
  correct: '',
  score: '1',
  difficult: 0,
  knowledge:'',
  knowledgePoints: [],
  courseSystems: [[]],
})

const rules = {
  gradeLevel: [{ required: true, message: '请选择年级', trigger: 'change' }],
  courseSystems: [{ required: true, message: '请选择学科', trigger: 'change' }],
  academicStageType: [{ required: true, message: '请选择学段', trigger: 'change' }],
  title: [{ required: true, message: '请输入题干', trigger: 'blur' }],
  analyze: [{ required: true, message: '请输入解析', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分数', trigger: 'blur' }],
  correct: [{ required: true, message: '请选择正确答案', trigger: 'change' }]
}

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



//学段
const educationStage = ref([])

//学校类型改变时，学段改变
const schoolTypeChange = (value) => {
  //清空学段的数据
  formData.value.academicStageType = null

  console.log('选择了学校类型')
  console.log(value)
  console.log('选择了学校类型')

  if(value == 1){
    console.log('普教')
    educationStage.value = mt_academic_stage
    console.log(educationStage.value)
  }else{
    console.log('职教')
    educationStage.value = mt_vocal_education_type
    console.log(educationStage.value)
  }
}





// 修改编辑器相关方法
const tinymceRef = ref(null)


const editorReady = (editor) => {
  console.log('编辑器初始化完成', editor)
  richEditor.value.instance = editor
  // 确保在编辑器准备好后设置内容
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
  // 在打开对话框前先设置当前内容
  if (object === formData.value) {
    richEditor.value.content = formData.value[parameterName] || ''
  } else {
    richEditor.value.content = object[parameterName] || ''
  }
  richEditor.value.dialogVisible = true
  
  // 如果编辑器实例已存在，立即设置内容
  if (richEditor.value.instance) {
    richEditor.value.instance.setContent(richEditor.value.content)
  }
}

const editorConfirm = () => {
  // if (richEditor.value.instance && richEditor.value.object && richEditor.value.parameterName) {
    const content = richEditor.value.content
    
    if (richEditor.value.object === formData.value) {
      formData.value[richEditor.value.parameterName] = content
    } else {
      const index = formData.value.items.findIndex(item => item === richEditor.value.object)
      if (index !== -1) {
        formData.value.items[index][richEditor.value.parameterName] = content
      }
    }
    
    richEditor.value.dialogVisible = false
  // }
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

// 更新选项时同步更新正确答案选项
const updateCorrectOptions = () => {
  // 确保当前选中的正确答案在选项列表中存在
  const prefixes = formData.value.items.map(item => item.prefix)
  if (!prefixes.includes(formData.value.correct)) {
    formData.value.correct = ''
  }
}

// 修改选项相关方法
const questionItemRemove = (index) => {
  formData.value.items.splice(index, 1)
  updateCorrectOptions()
}

const questionItemAdd = () => {
  const items = formData.value.items
  const newLastPrefix = items.length > 0 
    ? String.fromCharCode(items[items.length - 1].prefix.charCodeAt() + 1)
    : 'A'
  items.push({ prefix: newLastPrefix, content: '' })
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    formLoading.value = true
    console.log('表单验证通过，提交数据：', formData.value)
    const res = await addQuestion(formData.value)
    
    if (res.code === 200) {
      ElMessage.success(res.message)
      router.push('/glxt/question/list')
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
  const lastId = formData.value.id
  formRef.value.resetFields()
  
  Object.assign(formData.value, {
    id: lastId,
    questionType: 1,
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
    score: '',
    difficult: 0
  })
}

const levelChange = () => {
  formRef.subjectId = null
}

const showQuestion = () => {
  questionShow.value.dialog = true
  questionShow.value.qType = formData.value.questionType
  questionShow.value.question = formData.value
}

// 生命周期钩子
onMounted(async () => {
  const id = route.query.id
  if (id && parseInt(id) !== 0) {
    formLoading.value = true
    try {
      const response = await getQuestion(id)
      const questionData = response.data
      formData.value = {
        ...questionData,
        knowledgePoints: Array.isArray(questionData.knowledgePoints) 
          ? questionData.knowledgePoints 
          : []
      }
      console.log('加载的表单数据:', formData.value)
    } catch (error) {
      console.error('加载题目数据失败:', error)
    } finally {
      formLoading.value = false
    }
  }
  
  await getKnowledgeTreeList()
})


const courseSystemOptions = ref([])//获取挂载课程
const getCourseSystemOptionList = (schoolType, academicStage) => {

  getCourseSystemOptions(schoolType, academicStage).then(response => {
    courseSystemOptions.value = response.data

    console.log('courseSystemOptions',courseSystemOptions.value)
    courseSystemOptions.value.forEach(item => {
      console.log('item',item.value)
      item.label = getSubjectName(item.value);
    })
  })
}

const handleCourseSystemChange = (values) => {
// 挂载课程系统
  if (!values || values.length === 0) {
    formData.value.courseSystems = []
    return
  }

}

getCourseSystemOptionList(1,1)


//获取科目名称
const getSubjectName = (subjectType) => {
  return mt_school_subject.value ?.find(item => item.value === subjectType).label
}


// 监听知识点的变化
watch(() => formData.value.knowledgePoints, (newVal) => {
  console.log('选中的知识点:', newVal)
  formData.value.knowledgePoints = newVal
}, { deep: true })


// 暴露给模板使用的属性和方法
defineExpose({
  formRef,
  formLoading,
  levelEnumTmp,
  subjectFilterTmp,
  formData,
  rules,
  richEditor,
  questionShow
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
          width: 240px;  // 统一设置下拉框宽度
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

          .content-input{
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

    .answer-group {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;

      .answer-radio {
        margin-right: 0;
        
        :deep(.el-radio__label) {
          padding-left: 8px;
        }
      }
    }
  }

  .knowledge-select {
    width: 100%;  // Make the tree select component full width
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>