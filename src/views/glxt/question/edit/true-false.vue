<template>
  <div class="app-container">
    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <span>编辑判断题</span>
          <div class="header-actions">
            <el-button @click="reback">返回</el-button>
            <el-button type="primary" @click="submitForm">保存</el-button>
            <el-button type="info" @click="resetForm">重置</el-button>
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
            <FirstLinePlugins 
              @selectData="handleSelectData"
              :initialData="{
                schoolType: formData.schoolType,
                academicStageType: formData.academicStageType,
                courseSystems: formData.courseSystems
              }"
            />
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
              <el-radio  v-for="item in formData.items"  :key="item.prefix"  :value="item.prefix">{{item.prefix}}</el-radio>
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

import FirstLinePlugins from '../components/FirstLinePlugins'//类型、学段、科目教材体系组件
import { addQuestion, getQuestion, updateQuestion } from '@/api/glxt/question'
//获取知识点树形结构
import { getKnowledgeTree } from '@/api/glxt/knowledge';

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const formLoading = ref(false)

const formData = ref({
  id: null,
  questionType: 3,
  title: '',
  items: [
    { id: null, prefix: 'A', content: '是' },
    { id: null, prefix: 'B', content: '否' }
  ],
  analyze: '',
  correct: '',
  score: '1',
  difficult: 0,
  infoTextContentId: null,
  knowledgePoints: [],//知识点
  courseSystems: [[]],//挂载课程
  schoolType: '',//学校类型 1-普教  2-职教
  academicStageType: '',//学段
})

const rules = {
  // schoolType: [{ required: true, message: '请选择学校类型', trigger: 'change' }],
  // courseSystems: [{ required: true, message: '请选择学科', trigger: 'change' }],
  // academicStageType: [{ required: true, message: '请选择学段', trigger: 'change' }],
  title: [{ required: true, message: '请输入题干', trigger: 'blur' }],
  analyze: [{ required: true, message: '请输入解析', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分数', trigger: 'blur' }],
  correct: [{ required: true, message: '请选择正确答案', trigger: 'change' }]
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

//返回列表
const reback = () => {
  router.push('/glxt/question/list')
}

// Methods
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    formLoading.value = true
    if (formData.value.id) {
      // formData.value.id = route.query.id
      const res = await updateQuestion(formData.value)
      if (res.code === 200) {
        ElMessage.success('修改成功')
        router.push('/glxt/question/list')
      } else {
        ElMessage.error('修改失败')
      }
    } else {
      const res = await addQuestion(formData.value)
      if (res.code === 200) {
        ElMessage.success('添加成功')
        router.push('/glxt/question/list')
      } else {
        ElMessage.error('添加失败')
      }
    }
  } catch (error) {
    ElMessage.error('操作失败')
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
    title: '',
    items: [
      { id: null, prefix: 'A', content: '是' },
      { id: null, prefix: 'B', content: '否' }
    ],
    analyze: '',
    correct: '',
    score: '',
    difficult: 0,
    infoTextContentId: null,
    knowledgePoints: [],//知识点
    courseSystems: [[]],//挂载课程
    schoolType: '',//学校类型 1-普教  2-职教
    academicStageType: '',//学段
  }
  formData.value.id = lastId
}
// 处理firstLinePlugins组件传过来的数据
const handleSelectData = (data) => {
  formData.value.schoolType = data.schoolType
  formData.value.academicStageType = data.academicStageType
  formData.value.courseSystems = data.courseSystems

   // 如果所有必要参数都有值，则获取知识点
   if (data.schoolType && data.academicStageType && 
        data.courseSystems && data.courseSystems.length > 0 && 
        data.courseSystems[0].length > 0) {
       getKnowledgeTreeList();
  }
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
  
  // 设置初始内容
  if (object === formData.value) {
    richEditor.value.content = formData.value[parameterName] || ''
  } else {
    richEditor.value.content = object[parameterName] || ''
  }
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
}

//知识点树形结构
const knowledgeTreeList = ref([])
const getKnowledgeTreeList = () => {
    // 确保所有必要参数都有值
    if (!formData.value.schoolType || !formData.value.academicStageType || 
        !formData.value.courseSystems || formData.value.courseSystems.length === 0 ) {
      console.log('缺少获取知识点所需的参数');
      return;
    }
    
    console.log(formData.value.courseSystems[0]);
    console.log(formData.value.courseSystems[0][0]);
    console.log(formData.value.courseSystems);
    

     // 构建请求参数
     let params = {
      schoolTypeId: formData.value.schoolType,
      academicStageId: formData.value.academicStageType,
      subjectId: formData.value.courseSystems[0]
    }

    getKnowledgeTree(params).then(response => {
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
    })
}

getKnowledgeTreeList()


// 生命周期钩子
onMounted(async () => {
    const id = route.query.id
    if (id && parseInt(id) !== 0) {
    formLoading.value = true
    try {
        const response = await getQuestion(id)
        const questionData = response.data

        formData.value = questionData;
        console.log(questionData);
        console.log(questionData);
        console.log(questionData);
        getKnowledgeTreeList();
      
         //数组中字符串类型转换为整型
        const newKnowledgePoints = Array.from(questionData.knowledgePoints).map(item => Number(item))
        formData.value = {
        ...questionData,
        knowledgePoints: Array.isArray(newKnowledgePoints) 
        ? newKnowledgePoints 
        : []
      }
    } catch (error) {
        ElMessage.error('加载题目数据失败')
    } finally {
        formLoading.value = false
    }
}

    await getKnowledgeTreeList()
})

// 监听知识点的变化
watch(() => formData.value.knowledgePoints, (newVal) => {
  formData.value.knowledgePoints = newVal
}, { deep: true })


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
