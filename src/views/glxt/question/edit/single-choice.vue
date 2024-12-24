<template>
  <div class="app-container">
    <el-card class="question-card">
      <template #header>
        <div class="card-header">
          <span>{{formData.id ? '编辑' : '新增'}}单选题</span>
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
            <!-- v-model					id值。只要这个id值在树里能匹配上，就能够顺利回显出其label值。
            lazy 					开启懒加载
            load					加载子树数据的方法
            value-key 				作为 value 唯一标识的键名。简单说就是主键，根据自己后端返回的字段修改
            node-key				每个树节点用来作为唯一标识的属性。简单理解为树节点的主键，同value-key
            props					配置选项。一般配置value和label的属性值
            show-checkbox			开启复选框
            check-strictly			可选择任一级别
            highlight-current		选中高亮显示
            default-expanded-keys	默认展开节点的key数组（懒加载时用于数据回显，这个属性非常关键） -->

            <!-- {{knowledgeTreeList[0][0]}} -->
            <el-tree-select
              v-model="formData.knowledgePoints"
              :data="knowledgeTreeList"
              :props="{
                value: 'id',
                label: 'knowledge',
                children: 'children'
              }"
              multiple
              show-checkbox
              check-strictly
              node-key="id"
              :default-checked-keys="formData.knowledgePoints"
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
import QuestionShow from '../components/Show'
import Tinymce from "@/components/Tinymce/index.vue"
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import FirstLinePlugins from '../components/FirstLinePlugins'//类型、学段、科目教材体系组件
import { addQuestion, getQuestion, updateQuestion } from '@/api/glxt/question'

const { proxy } = getCurrentInstance();
//字典引入 学校类型、  mt_vocal_education_type->职教学段、mt_academic_stage->普教学段、 学制
const { mt_school_type, mt_vocal_education_type, mt_academic_stage, mt_school_subject} = proxy.useDict('mt_school_type', 'mt_vocal_education_type', 'mt_academic_stage', 'mt_school_subject');

import {getCourseSystemOptions } from '@/api/glxt/subject'

//获取知识点树形结构
import { getKnowledgeTree } from '@/api/glxt/knowledge';

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const formLoading = ref(false)


//知识点树形结构
const knowledgeTreeList = ref([])
const getKnowledgeTreeList = async () => {
  try {
    const response = await getKnowledgeTree({})
    const processTreeData = (items) => {
      if (!items) return []
      return items.map(item => ({
        id: item.id,
        knowledge: item.knowledge || item.knowledge,
        label: item.knowledge || item.knowledge, // 用于显示
        value: item.id, // 用于值绑定
        children: processTreeData(item.children)
      }))
    }
    
    knowledgeTreeList.value = processTreeData(response.rows)
  } catch (error) {
    ElMessage.error('获取知识点数据失败')
  }
}

// 使用 ref 不是 reactive 来管理表单数据
const formData = ref({
  id: null,
  questionType: 1,
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
  infoTextContentId: null,
  knowledgePoints: [],//知识点
  courseSystems: [[]],//挂载课程
})

const rules = {
  schoolType: [{ required: true, message: '请选择学校类型', trigger: 'change' }],
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


// 处理firstLinePlugins组件传过来的数据
const handleSelectData = (data) => {
  formData.value.schoolType = data.schoolType
  formData.value.academicStageType = data.academicStageType
  formData.value.courseSystems = data.courseSystems
}


// 修改编辑器相关方法
const tinymceRef = ref(null)


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

// 添加更新编辑器内容的方法
const updateEditorContent = (content) => {
  richEditor.value.content = content
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
    console.log('formData',formData.value)
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
    console.error(error)
    ElMessage.error('操作失败')
  } finally {
    formLoading.value = false
  }
}

//返回列表
const reback = () => {
  router.push('/glxt/question/list')
}

const resetForm = () => {
  if (!formRef.value) return
  const lastId = formData.value.id
  formRef.value.resetFields()
  
  Object.assign(formData.value, {
    id: lastId,
    questionType: 1,
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

// 生命周期钩子
onMounted(async () => {
  await getKnowledgeTreeList()

  const id = route.query.id
  if (id && parseInt(id) !== 0) {
    try {
      formLoading.value = true
      const response = await getQuestion(id)
      const questionData = response.data
      
      // 处理知识点数据
      const knowledgePoints = Array.isArray(questionData.knowledgePoints) 
        ? questionData.knowledgePoints 
        : questionData.knowledgePoints ? [questionData.knowledgePoints] : []

      const newKnowledgePoints = Array.from(knowledgePoints).map(item => Number(item))
      // 确保知识点数据包含完整信息
      const getFullKnowledgeInfo = (points) => {
        return points.map(point => {
          // 如果是数字或字符串，说明只有 ID
          if (typeof point === 'number' || typeof point === 'string') {
            // 在知识点树中查找完整信息
            const findInfo = (tree) => {
              for (const node of tree) {
                if (node.id === Number(point)) return node.id
                if (node.children) {
                  const found = findInfo(node.children)
                  if (found) return found
                }
              }
              return point
            }
            return findInfo(knowledgeTreeList.value)
          }
          return point.id
        })
      }

      formData.value = {
        ...questionData,
        knowledgePoints: getFullKnowledgeInfo(newKnowledgePoints)
      }
    } catch (error) {
      ElMessage.error('加载数据失败')
    } finally {
      formLoading.value = false
    }
  }
})



// 暴露给模板使用的属性和方法
defineExpose({
  formRef,
  formLoading,
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