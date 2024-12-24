<template>
  <div class="app-container">
    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <span>编辑填空题</span>
          <div class="header-actions">
            <el-button type="primary" @click="submitForm">保存</el-button>
            <el-button type="info" @click="resetForm" >重置</el-button>
            <el-button type="success" @click="showQuestion">预览</el-button>
          </div>
        </div>
      </template>

      <el-form :model="form" ref="form" label-width="140px" v-loading="formLoading" :rules="rules" class="question-form">
        <!-- 基础信息区域 -->
        <div class="form-section">
          <div class="section-row">
            <FirstLinePlugins @selectData="handleSelectData" />
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
          <el-form-item label="知识点：" required>
            <el-tree-select
                v-model="form.knowledgePoints"
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
            {{ form.knowledgePoints }}
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
      <Tinymce 
        ref="tinymceRef" 
        v-model="richEditor.content" 
        :value="richEditor.content"
        @update:modelValue="updateEditorContent"      
      />
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import FirstLinePlugins from '../components/FirstLinePlugins'//类型、学段、科目教材体系组件

import { addQuestion, getQuestion, updateQuestion } from '@/api/glxt/question'
//获取知识点树形结构
import { getKnowledgeTree } from '@/api/glxt/knowledge';

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const tinymceRef = ref(null)
const formLoading = ref(false)


// 表单数据
const form = ref({
  id: null,
  questionType: 4,
  title: '',
  items: [],
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

// 表单验证规则
const rules = {
  schoolType: [{ required: true, message: '请选择学校类型', trigger: 'change' }],
  courseSystems: [{ required: true, message: '请选择学科', trigger: 'change' }],
  academicStageType: [{ required: true, message: '请选择学段', trigger: 'change' }],
  title: [{ required: true, message: '请输入题干', trigger: 'blur' }],
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

// 预览对话框相关
const questionShow = ref({
  qType: 0,
  dialog: false,
  question: null,
  loading: false
})


// 处理firstLinePlugins组件传过来的数据
const handleSelectData = (data) => {
  formData.value.schoolType = data.schoolType
  formData.value.academicStageType = data.academicStageType
  formData.value.courseSystems = data.courseSystems
}

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

// 监听知识点的变化
watch(() => form.value.knowledgePoints, (newVal) => {
  console.log('选中的知识点:', newVal)
  form.value.knowledgePoints = newVal
}, { deep: true })



const inputClick = (object, parameterName) => {
  richEditor.value.object = object
  richEditor.value.parameterName = parameterName
  richEditor.value.dialogVisible = true
}

const editorConfirm = () => {
  // let content = richEditor.value.instance.getContent()
  // if (richEditor.value.parameterName === 'title') {
  //   if (questionItemReset(content)) {
  //     richEditor.value.object[richEditor.value.parameterName] = content
  //     richEditor.value.dialogVisible = false
  //   }
  // } else {
  //   richEditor.value.object[richEditor.value.parameterName] = content
  //   richEditor.value.dialogVisible = false
  // }
  
  const content = richEditor.value.content
  if (questionItemReset(content)) {
    if (richEditor.value.object === form.value) {
      form.value[richEditor.value.parameterName] = content
    } else {
      const index = form.value.items.findIndex(item => item === richEditor.value.object)
      if (index !== -1) {
        form.value.items[index][richEditor.value.parameterName] = content
      }
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

// 填空题特有的方法
const questionItemReset = (content) => {
  let spanRegex = new RegExp('<span class="gapfilling-span (.*?)">(.*?)<\\/span>', 'g')
      let newFormItem = []
      let gapfillingItems = content.match(spanRegex)
      if (gapfillingItems === null) {
        ElMessage.error('请插入填空')
        return false
      }
      gapfillingItems.forEach(function (span, index) {
        let pairRegex = /<span class="gapfilling-span (.*?)">(.*?)<\/span>/
        pairRegex.test(span)
        newFormItem.push({ id: null, itemUuid: RegExp.$1, prefix: RegExp.$2, content: '', score: '0' })
      })

      console.log('newFormItem', newFormItem)
      console.log('newFormItem', form.value)
      let formItem = []
      newFormItem.forEach(function (item) {
        formItem.some((oldItem, index) => {
          if (oldItem.itemUuid === item.itemUuid) {
            item.content = oldItem.content
            item.id = oldItem.id
            item.score = oldItem.score
            return true
          }
        })
      })

    
      form.value.items = [...newFormItem]
      console.log('newFormItem', form.value.items)
      return true
};


// 表单操作方法
const submitForm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    formLoading.value = true
    console.log('formData',form.value)
    if (form.value.id) {
      // formData.value.id = route.query.id
      const res = await updateQuestion(form.value)
      if (res.code === 200) {
        ElMessage.success('修改成功')
        router.push('/glxt/question/list')
      } else {
        ElMessage.error('修改失败')
      }
    } else {
      const res = await addQuestion(form.value)
      if (res.code === 200) {
        ElMessage.success('添加成功')
        router.push('/glxt/question/list')
      } else {
        ElMessage.error('添加失败')
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  } finally {
    formLoading.value = false
  }
}

// 重置
const resetForm = () => {
  if (!formRef.value) return
  const lastId = form.value.id
  formRef.value.resetFields()
  
  form.value = {
    id: lastId,
    questionType: 4,
    title: '',
    items: [],
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
}

// 预览 
const showQuestion = () => {
  questionShow.value.dialog = true
  questionShow.value.qType = form.value.questionType
  questionShow.value.question = form.value
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