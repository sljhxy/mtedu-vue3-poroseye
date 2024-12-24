<template>
  <div class="app-container">
    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <span>编辑多选题</span>
          <div class="header-actions">
            <el-button @click="reback">返回</el-button>
            <el-button type="primary" @click="submitForm">保存</el-button>
            <el-button type="info" @click="resetForm">重置</el-button>
            <el-button type="success" @click="showQuestion">预览</el-button>
          </div>
        </div>
      </template>

      <el-form :model="formData" ref="formRef" label-width="140px" v-loading="formLoading" :rules="rules" class="question-form">
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
import { ElMessage } from 'element-plus'
import QuestionShow from '../components/Show'
import FirstLinePlugins from '../components/FirstLinePlugins'//类型、学段、科目教材体系组件
import Tinymce from "@/components/Tinymce/index.vue"
import { addQuestion, getQuestion, updateQuestion } from '@/api/glxt/question'
//获取知识点树形结构
import { getKnowledgeTree } from '@/api/glxt/knowledge';
const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const formLoading = ref(false)

const formData = ref({
  id: null,
  questionType: 2,
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
  difficult: 0,
  infoTextContentId: null,
  knowledgePoints: [],//知识点
  courseSystems: [[]],//挂载课程
  schoolType: '',//学校类型 1-普教  2-职教
  academicStageType: '',//学段
})


const rules = {
  schoolType: [{ required: true, message: '请选择学校类型', trigger: 'change' }],
  courseSystems: [{ required: true, message: '请选择学科', trigger: 'change' }],
  academicStageType: [{ required: true, message: '请选择学段', trigger: 'change' }],
  title: [{ required: true, message: '请输入题干', trigger: 'blur' }],
  analyze: [{ required: true, message: '请输入解析', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分数', trigger: 'blur' }],
  correctArray: [{ required: true, message: '请选择正确答案', trigger: 'change' }]
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

// 关闭编辑器
const closeEditor = () => {
  richEditor.value.dialogVisible = false
  richEditor.value.object = null
  richEditor.value.parameterName = ''
  richEditor.value.content = ''
}

// 删除选项
const questionItemRemove = (index) => {
  formData.value.items.splice(index, 1)
}

// 添加选项
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

//返回列表
const reback = () => {
  router.push('/glxt/question/list')
}

// 保存
const submitForm = async() => {
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

// 预览 
const showQuestion = () => {
  questionShow.dialog = true
  questionShow.qType = formData.value.questionType
  questionShow.question = formData.value
}

// 重置
const resetForm = () => {
  let lastId = formData.value.id
  formRef.value.resetFields()
  formData.value = {
    id: null,
    questionType: 2,
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
    difficult: 0,
    infoTextContentId: null,
    knowledgePoints: [],//知识点
    courseSystems: [[]],//挂载课程
    schoolType: '',//学校类型 1-普教  2-职教
    academicStageType: '',//学段
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

