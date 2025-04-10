<template>
  <div class="app-container">
    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <span>编辑简答题</span>
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
            <!-- {{ formData.knowledgePoints }} -->
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuestionShow from '../components/Show'
import Tinymce from "@/components/Tinymce/index.vue"
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import FirstLinePlugins from '../components/FirstLinePlugins'//类型、学段、科目教材体系组件
import { addQuestion, getQuestion, updateQuestion } from '@/api/glxt/question'
//获取知识点树形结构
import { getKnowledgeTree } from '@/api/glxt/knowledge';
// 路由相关
const route = useRoute()
const router = useRouter()

// 表单相关
const formRef = ref(null)
const formLoading = ref(false)
const tinymceRef = ref(null)



// 表单数据
const formData = ref({
  id: null,
  questionType: 5, // 简答题类型
  title: '',
  analyze: '',
  correct: '',
  score: '1',
  items: [],
  difficult: 0,
  infoTextContentId: null,
  knowledgePoints: [],//知识点
  courseSystems: [[]],//挂载课程
  schoolType: '',//学校类型 1-普教  2-职教
  academicStageType: '',//学段
})

// 表单验证规则
const rules = {
  // schoolType: [{ required: true, message: '请选择学校类型', trigger: 'change' }],
  // courseSystems: [{ required: true, message: '请选择学科', trigger: 'change' }],
  // academicStageType: [{ required: true, message: '请选择学段', trigger: 'change' }],
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
            // 先获取知识点树
            await getKnowledgeTreeList()
            
            const response = await getQuestion(id)
            const questionData = response.data
            
            // 处理知识点数据，将 id 转换为具体的知识点对象
            const knowledgePoints = questionData.knowledgePoints || []
            
            //数组中字符串类型转换为整型
            const newKnowledgePoints = Array.from(knowledgePoints).map(item => Number(item))
            // 创建一个映射来存储知识点的完整信息
            const knowledgeMap = new Map()
            const buildKnowledgeMap = (items) => {
                items.forEach(item => {
                    knowledgeMap.set(item.id, item)
                    if (item.children) {
                        buildKnowledgeMap(item.children)
                    }
                })
            }
            buildKnowledgeMap(knowledgeTreeList.value)
            
            formData.value = {
                ...questionData,
                knowledgePoints: newKnowledgePoints
            }

            // 将数据传递给 FirstLinePlugins 组件
            handleSelectData({
                schoolType: questionData.schoolType,
                academicStageType: questionData.academicStageType,
                courseSystems: questionData.courseSystems
            })
            
        } catch (error) {
        } finally {
            formLoading.value = false
        }
    }
})

// 监听知识点的变化
watch(() => formData.value.knowledgePoints, (newVal) => {
  formData.value.knowledgePoints = newVal
}, { deep: true })


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

//返回列表
const reback = () => {
  router.push('/glxt/question/list')
}

// 表单相关方法
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
  if (!formRef.value) return
  const lastId = formData.value.id
  formRef.value.resetFields()
  
  Object.assign(formData.value, {
    id: lastId,
    questionType: 5,
    title: '',
    analyze: '',
    correct: '',
    score: '',
    difficult: 0,
    infoTextContentId: null,
    knowledgePoints: [],//知识点
    courseSystems: [[]],//挂载课程
    schoolType: '',//学校类型 1-普教  2-职教
    academicStageType: '',//学段
  })
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
        margin-top: 0px;
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
