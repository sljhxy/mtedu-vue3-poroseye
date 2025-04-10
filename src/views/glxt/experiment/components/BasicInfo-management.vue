<template>
  <div class="basic-info-container">
    <!-- 主内容区域包装器 -->
    <div class="main-content-wrapper">

      <!-- 标签页 -->
      <div class="tabs-wrapper">
        <el-tabs 
          v-model="activeTab" 
          class="custom-tabs" 
          @tab-click="handleTabClick"
        >
          <el-tab-pane name="basicInfo">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>实验信息</span>
              </div>
            </template>
            
          
            <!-- 空状态展示 -->
            <div v-if="!hasExperiments" class="empty-state">
              <div class="welcome-content">
                <el-icon class="welcome-icon"><Sunny /></el-icon>
                <h2>欢迎来到【实验】配置管理</h2>
                <p>开始创建您的实验相关信息</p>
                <el-button type="primary" class="add-button" @click="showDialog('add', 0)">
                  <el-icon><Plus /></el-icon>
                  添加实验信息
                </el-button>
              </div>
            </div>

            <!-- 有数据时的展示 -->
            <div v-else class="experiment-info">
              <!-- 头部区域优化 -->
              <div class="info-header">
                <div class="header-left">
                  <div class="experiment-icon-wrapper">
                    <el-icon class="experiment-icon"><MostlyCloudy /></el-icon>
                  </div>
                  <div class="title-group">
                    <div class="title-row">
                      <h3>{{ experimentData?.experimentName || '' }}</h3>
                      <el-tag size="small" effect="plain" type="success"> 
                        V{{ experimentData?.version || '1.0' }}
                      </el-tag>
                    </div>
                    <div class="experiment-tags">
                      <el-tag size="small" effect="plain" type="info">
                        <dict-tag :options="mt_experiment_attr_type" :value="experimentData?.attrType"/>
                      </el-tag>
                      <!-- <el-tag size="small" effect="plain"> -->
                        <dict-tag :options="mt_school_type" :value="experimentData?.schoolType"/>
                      <!-- </el-tag> -->
                      <el-tag size="small" effect="plain" type="warning">
                        <dict-tag :options="mt_academic_stage" :value="experimentData?.academicStageType"/>
                      </el-tag>
                    </div>
                  </div>
                </div>
                <div class="header-actions">
                  <el-button type="primary" class="edit-button" @click="showDialog('edit', experimentId? experimentId : toEexperimentInfoId)">
                    <el-icon><Edit /></el-icon>
                    编辑实验信息
                  </el-button>
                </div>
              </div>
              
              <!-- 内容区域优化 -->
              <div class="info-content">
                <el-row :gutter="24">
                  <!-- 左侧缩略图区域 -->
                  <el-col :span="8">
                    <div class="thumbnail-section">
                      <div class="section-header">
                        <el-icon><Picture /></el-icon>
                        <span>实验示意图</span>
                      </div>
                      <div class="thumbnail-wrapper">
                        <image-preview :src="experimentData?.thumbnail || '暂无实验图像'" />
                      </div> 
                    </div>
                  </el-col>

                  <!-- 右侧信息区域 -->
                  <el-col :span="16">
                    <div class="info-sections">
                      <!-- 实验概述 -->
                      <div class="info-section">
                        <div class="section-header">
                          <el-icon><Document /></el-icon>
                          <span>实验简介</span>
                        </div>
                        <div class="section-content">
                          <p class="description-text">{{ experimentData?.blurb || '暂无实验概述' }}</p>
                        </div>
                      </div>

                      <!-- 实验要素 -->
                      <div class="info-section">
                        <div class="section-header">
                          <el-icon><Collection /></el-icon>
                          <span>实验要素</span>
                        </div>
                        <div class="section-content">
                          <div class="info-grid">
                            <div class="info-item">
                              <div class="item-label">
                                <el-icon><User /></el-icon>
                                开发者
                              </div>
                              <div class="item-value">
                                <dict-tag :options="mt_developer_type" :value="experimentData?.developerType"/>
                              </div>
                            </div>
                            <div class="info-item">
                              <div class="item-label">
                                <el-icon><Collection /></el-icon>
                                版本教材体系
                              </div>
                              <!-- <div class="item-value">{{ experimentData?.courseSystems || '暂无' }}</div> -->
                              <div class="item-value">
                                <el-cascader
                                  v-model="basicForm.courseSystems"
                                  :options="courseSystemOptions"
                                  :show-all-levels="false"
                                  :props="{ 
                                      expandTrigger: 'hover',
                                      multiple: false,
                                      emitPath: true
                                  }"
                                  placeholder="请选择课程体系"
                                  clearable
                                  collapse-tags-tooltip
                                  class="w-full"
                                  @change="handleCourseSystemChange"
                                  disabled
                                />
                              </div>
                              
                            </div>
                            <div class="info-item">
                              <div class="item-label">
                                <el-icon><InfoFilled /></el-icon>
                                备注
                              </div>
                              <div class="item-value">{{ experimentData?.remark || '暂无备注' }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>

            <!-- 弹框表单 -->
            <el-dialog
              v-model="dialogVisible"       
              :title="isEdit ? '编辑实验信息' : '添加实验信息'"
              width="50%"
              style="margin-top: 5vh !important;"
              :close-on-click-modal="false"
              :destroy-on-close="true"
              class="experiment-dialog"
            >
              <el-form :model="basicForm" label-width="100px" :rules="rules" ref="basicFormRef" class="compact-form">
                <!-- 缩略图行 -->
                <el-row class="thumbnail-row" :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="缩略图" prop="thumbnail">
                      <image-upload v-model="basicForm.thumbnail"/>
                    </el-form-item>
                  </el-col>
                </el-row>

                <!-- 表单主体 -->
                <el-row :gutter="20">
                  <el-col :span="12">
                    <!-- 实验名称 -->
                    <el-form-item label="实验名称" prop="experimentName">
                      <el-input v-model="basicForm.experimentName" placeholder="请输入实验名称"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <!-- 属性 -->
                    <el-form-item label="属性" prop="attrType">
                      <el-select 
                          v-model="basicForm.attrType" 
                          placeholder="请选择属性类型"
                          class="fixed-width-select"
                          clearable>
                              <el-option 
                                  v-for="item in mt_experiment_attr_type" 
                                  :key="item.value" 
                                  :value="item.value" 
                                  :label="item.label"
                              ></el-option>
                          </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <!-- 类型 -->
                    <el-form-item label="学校类型" prop="schoolType">
                      <el-select 
                          v-model="basicForm.schoolType" 
                          placeholder="请选择学校类型"
                          class="fixed-width-select"
                          @change="schoolTypeChange"
                          clearable
                          >
                              <el-option 
                                  v-for="item in mt_school_type" 
                                  :key="item.value" 
                                  :value="item.value" 
                                  :label="item.label"
                              ></el-option>
                        </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <!-- 学段 -->
                    <!-- {{ basicForm.academicStageType }} -->
                    <el-form-item label="学段" prop="academicStageType">
                        <el-select 
                              v-model="basicForm.academicStageType" 
                              placeholder="请选择学段"
                              class="fixed-width-select"
                              @change="academicStageChange"
                              clearable
                          >
                          <el-option 
                              v-for="item in educationStage.value" 
                              :key="item.value" 
                              :value="item.value" 
                              :label="item.label"
                          ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <!-- 开发者 -->
                    <el-form-item label="开发者" prop="developerType">
                      <el-select 
                              v-model="basicForm.developerType" 
                              placeholder="请选择开发者"
                              class="fixed-width-select"
                              clearable
                          >
                          <el-option 
                              v-for="item in mt_developer_type" 
                              :key="item.value" 
                              :value="item.value" 
                              :label="item.label"
                          ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <!-- 版本教材 -->
                    <!-- {{ basicForm.courseSystems }} -->
                    <el-form-item label="版本教材" prop="courseSystems">
                      <el-cascader
                          v-model="basicForm.courseSystems"
                          :options="courseSystemOptions"
                          :show-all-levels="true"
                          :props="{ 
                              expandTrigger: 'hover',
                              multiple: false,
                              emitPath: true
                          }"
                          placeholder="请选择课程体系"
                          clearable
                          collapse-tags
                          collapse-tags-tooltip
                          class="w-full"
                          @change="handleCourseSystemChange"
                        />
                    </el-form-item>
                  </el-col>
                </el-row>


                   <!-- 新增知识体系挂接 -->
                   <el-row :gutter="20">
                    <el-col :span="24">
                      {{ basicForm.knowledgePoints }}
                      <el-form-item label="知识点体系" prop="knowledgePoints">
                                <el-tree-select
                                    v-model="basicForm.knowledgePoints"
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
                                    placeholder="请选择知识点"
                                    clearable
                                    class="knowledge-select"
                                    collapse-tags-tooltip
                                  />
                                </el-form-item>
                    </el-col>
                    </el-row>
                
                <!-- 实验简介 -->
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="实验简介" prop="blurb">
                      <el-input
                        v-model="basicForm.blurb"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入实验简介"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <!-- 备注 -->
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="备注" prop="remark">
                      <el-input
                        v-model="basicForm.remark"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入备注"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <!-- 实验版本号 -->
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="版本号" prop="version">
                      <el-input
                        v-model="basicForm.version"
                        placeholder="请输入版本号"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="handleClose">取消</el-button>
                  <el-button type="primary" @click="submitForm">确定</el-button>
                </span>
              </template>
            </el-dialog>
          </el-tab-pane>

          <!-- 实验说明标签页 -->
          <el-tab-pane name="experimentDesc">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Edit /></el-icon>
                <span>实验说明</span>
              </div>
            </template>

            <div v-show="experimentDescribeList.length && (experimentId || toEexperimentInfoId) ">
              <el-button plain type="primary" icon="Plus" @click="showDescDialog" style="margin-bottom: 10px;" v-hasPermi="['glxt:experimentInfoDescribe:add']">添加</el-button>
              <el-table v-loading="loading" :data="experimentDescribeList">
                <el-table-column label="序号" width="55" type="index" align="center" />
                <el-table-column label="页码标题" align="center" prop="title" />
                <el-table-column label="内容" align="center" prop="text">
                  <template #default="scope">
                    <div v-html="scope.row.text"></div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                  <template #default="scope">
                    <el-button plain type="success" icon="Edit" color="#6EDC93" @click="handleDescUpdate(scope.row)" v-hasPermi="['glxt:experimentInfoDescribe:edit']">修改</el-button>
                    <el-button plain type="danger" icon="Delete" @click="handleDesDelete(scope.row)" v-hasPermi="['glxt:experimentInfoDescribe:remove']">删除</el-button>
                  </template>
              </el-table-column>
            </el-table>
              <!-- 分页器 -->
            <pagination
              v-show="total > 0"
              :total="total"
              v-model:page="experimentDescQueryParams.pageNum"
              v-model:limit="experimentDescQueryParams.pageSize"
              @pagination="getExperimentInfoDescribeList"
            />
            </div>
            <!-- 实验说明内容 -->
            <div v-show="!experimentId && !experimentDescribeList.length" class="empty-tip">
              <el-empty description="请先添加并保存实验基础信息">
                <template #description>
                  <p>请先添加并保存实验基础信息</p>
                  <p class="sub-tip">完成实验信息保存后即可进行实验说明编辑</p>
                </template>
              </el-empty>
            </div>
            <div v-show="!experimentDescribeList.length && experimentId" class="experiment-desc">
              <div class="editor-container">
                <!-- 空状态展示 -->
                <div class="empty-state">
                  <div class="welcome-content">
                    <el-icon class="welcome-icon"><Orange /></el-icon>
                    <h2>欢迎来到【实验】配置管理</h2>
                    <p>开始创建您的实验相关信息</p>
                    <el-button type="primary" class="add-button" @click="showDescDialog" v-hasPermi="['glxt:experimentInfoDescribe:add']">
                      <el-icon><Plus /></el-icon>
                      添加实验说明
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            <el-dialog
                  v-model="descDialogVisible"
                  :title="descForm.id ? '修改实验说明' : '添加实验说明'"
                  width="50%"
                  :before-close="handleDescClose">
                  <el-form :model="descForm" ref="descFormRef" :rules="descFormRules" >
                      <el-form-item label="页码标题" class="title-input" prop="title">
                        <el-input v-model="descForm.title" placeholder="请输入标题"/>
                      </el-form-item>
                      <el-form-item class="editor-wrapper" prop="text">
                        <el-input 
                          v-model="descForm.text"   
                          @focus="inputClick(descForm,'text')"
                          type="textarea"
                          :rows="30"
                        />
                        <!-- <Tinymce v-model="descForm.text" :height="260"/> -->
                      </el-form-item>
                  </el-form>
                  <template #footer>
                    <div class="dialog-footer">
                      <el-button @click="descDialogVisible = false">取消</el-button>
                      <el-button type="primary" @click="submitDescForm">确定</el-button>
                    </div>
                  </template>
            </el-dialog>


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
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
// import { Plus, ArrowLeft, ArrowRight, Check, Close, Beaker } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import Tinymce from "@/components/Tinymce/index.vue"


const { proxy } = getCurrentInstance();
//字典引入 学校类型、  mt_vocal_education_type->职教学段、mt_academic_stage->普教学段、 学制
const { mt_school_type, mt_vocal_education_type, mt_academic_stage,mt_school_subject, mt_experiment_attr_type,mt_developer_type, mt_vocal_school_subject} = proxy.useDict('mt_school_type', 'mt_vocal_education_type', 'mt_academic_stage', 'mt_school_subject','mt_experiment_attr_type','mt_developer_type', 'mt_vocal_school_subject');

//课程体系API
import {getCourseSystemOptions } from '@/api/glxt/subject'

//导入实验基本信息api 
import {getExperimentInfo, addExperimentInfo, updateExperimentInfo} from '@/api/glxt/experimentInfo'

//导入实验说明api
import {getExperimentInfoDescribe, addExperimentInfoDescribe, updateExperimentInfoDescribe, listExperimentInfoDescribe, delExperimentInfoDescribe} from '@/api/glxt/experimentInfoDescribe'

//获取知识点树形结构
import { getKnowledgeTree } from '@/api/glxt/knowledge';


const route = useRoute()
const activeStep = ref(0)
const loading = ref(true);

// 标签页激活状态
const activeTab = ref('basicInfo')


const richEditor = ref({
  dialogVisible: false,
  object: null,
  parameterName: '',
  instance: null,
  content: ''
})

const emit = defineEmits(['addExperimentInfoId'])

// const richEditor = ref({
//   dialogVisible: false,
//   object: null,
//   parameterName: '',
//   instance: null,
//   content: ''
// })
// // 添加更新编辑器内容的方法
// const updateEditorContent = (content) => {
//   richEditor.value.content = content
// }


// const content = richEditor.value.content
  
//   if (richEditor.value.object === descForm.value) {
//     descForm.value[richEditor.value.parameterName] = content
//   } else {
//     const index = descForm.value.text.findIndex(item => item === richEditor.value.object)
//     if (index !== -1) {
//       descForm.value.items[index][richEditor.value.parameterName] = content
//     }
//   }


// 接收父组件传递的实验ID
const props = defineProps({
  toEexperimentInfoId: {
    type: Number,
    required: true
  }
})

//点击点击富文本编辑器
const inputClick = (object, parameterName) => {
  richEditor.value.object = object
  richEditor.value.parameterName = parameterName
  
  // 设置初始内容
  if (object === descForm.value) {
    richEditor.value.content = descForm.value[parameterName] || ''
  } else {
    richEditor.value.content = object[parameterName] || ''
  }
  richEditor.value.dialogVisible = true
}

const closeEditor = () => {
  richEditor.value.dialogVisible = false
  richEditor.value.object = null
  richEditor.value.parameterName = ''
  richEditor.value.content = ''
}

const editorConfirm = () => {
  const content = richEditor.value.content
  
  if (richEditor.value.object === descForm.value) {
    descForm.value[richEditor.value.parameterName] = content
  } 
  // else {
  //   const index = descForm.value.items.findIndex(item => item === richEditor.value.object)
  //   if (index !== -1) {
  //     descForm.value.items[index][richEditor.value.parameterName] = content
  //   }
  // }
  
  closeEditor()
}

// 添加更新编辑器内容的方法
const updateEditorContent = (content) => {
  richEditor.value.content = content
}


// 处理标签页点击
const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
  if (activeTab.value === 'experimentDesc' && experimentDescribeList.length == 0) {
    ElMessage.warning('请先添加并保存实验基础信息后再进行实验说明编辑')
    activeTab.value = 'basicInfo' // 强制切回基础信息标签
    return;
  }
  
  if(activeTab.value == 'experimentDesc') {
    //获取实验说明列表
    getExperimentInfoDescribeList()
  }
  if(activeTab.value == 'basicInfo') {
    //获取实验信息
    if (route.query.type === 'edit') {//新增状态的话无需调用接口
      loadExperimentData(experimentId.value? experimentId.value : props.toEexperimentInfoId)
    }
    
  }
}



// 表单引用
const basicFormRef = ref(null)



// 基础信息表单数据
const basicForm = ref({
  id: null,
  thumbnail: '',//缩略图
  experimentName: '',//实验名称
  attrType:'',//属性类型
  schoolType:'',//学校类型
  academicStageType:'',//学段类型
  developerType:'',//开发者类型
  blurb:'',//简介
  version:'',//实验版本号
  remark:'',//实验备注
  courseSystems: [[]],//课程体系
  knowledgePoints:[]//知识点体系
})


//重置表单数据
const resetBasicForm = () => {
     // 重置表单数据
    basicForm.value = {
      id: null,
      thumbnail: null,//缩略图
      experimentName: null,//实验名称
      attrType:null,//属性类型
      schoolType:null,//学校类型
      academicStageType:null,//学段类型
      developerType:null,//开发者类型
      blurb:null,//简介
      version:null,//实验版本号
      version:null,//实验版本号
      courseSystems: [[]],//课程体系
      knowledgePoints:[]//知识点体系
    }
  
}

//实验说明列表
const experimentDescribeList = ref([])
// 实验说明表单数据
const descForm = ref({
  pageNum: 1,
  pageSize:10,
  id:null,
  experimentInfoId:'',
  title:'',
  text:''
})

//实验说明表单重置
const descReset = () => {
  descForm.value = {
    id:null,
    experimentInfoId:null,
    title:null,
    text:null
  }
}

//学段
const educationStage = ref([])

//学校类型改变时，学段改变
const schoolTypeChange = (value) => {
   //清空学段的数据
    basicForm.value.academicStageType = null
    if(value == 1){
        educationStage.value = mt_academic_stage
    }else{
        educationStage.value = mt_vocal_education_type
    }
}

const academicStageChange = (value) => {
    getCourseSystemOptionList(basicForm.value.schoolType, value)
}

const courseSystemOptions = ref([])//获取挂载课程
const getCourseSystemOptionList = (schoolType, academicStage) => {
  getCourseSystemOptions(schoolType, academicStage).then(response => {
      courseSystemOptions.value = response.data
      courseSystemOptions.value.forEach(item => {
      item.label = getSubjectName(item.value, schoolType);
      })
  })
}


const handleCourseSystemChange = (values) => {

  if(values == '' || values == undefined || values == null){
    console.log('data为空')
    //清空知识点的数据
    basicForm.value.knowledgePoints = []
    return
  }

// 挂载课程系统
  if (!values || values.length === 0) {
    basicForm.value.courseSystems = []
    return
  }

   //清空知识点的数据
   basicForm.value.knowledgePoints = []

   console.log(values)
   console.log(values[0])
  // 如果所有必要参数都有值，则获取知识点
  if (values.length > 0 && values[0].length > 0) {
      let subjectId = values[0]
      getKnowledgeTreeList(subjectId);
  }

}


//获取科目名称
const getSubjectName = (subjectType, schoolType) => {
    return schoolType == '1'? mt_school_subject.value ?.find(item => item.value === subjectType).label : mt_vocal_school_subject.value ?.find(item => item.value === subjectType).label
}

// 实验基本信息表单验证规则
const rules = {
  experimentName: [{ required: true, message: '请输入实验名称', trigger: 'blur' }],
  attrType: [{ required: true, message: '属性不能为空', trigger: 'blur' }],
  schoolType: [{ required: true, message: '学校类型不能为空', trigger: 'blur' }],
  academicStageType: [{ required: true, message: '学段类型不能为空', trigger: 'blur' }],
  developerType: [{ required: true, message: '开发者不能为空', trigger: 'blur' }],
  version: [{ required: true, message: '版本号不能为空', trigger: 'blur' }],
  knowledgePoints: [{ required: true, message: "知识点体系不能为空", trigger: "change" }],
  // 其他验规则...
}    
//实验说明表单验证规则
const descFormRules = {
  title: [{ required: true, message: '请输入实验标题', trigger: 'blur' }],
}


//知识点树形结构
const knowledgeTreeList = ref([])
const getKnowledgeTreeList = async (subjectId) => {
  try {
     // 确保所有必要参数都有值
     if (!basicForm.value.schoolType || !basicForm.value.academicStageType ) {
      console.log('缺少获取知识点所需的参数');
      return;
    }
    
     // 构建请求参数
     let params = {
      schoolTypeId: basicForm.value.schoolType,
      academicStageId: basicForm.value.academicStageType,
      subjectId: subjectId
    }

 
    // 发起请求       
    const response = await getKnowledgeTree(params)
    console.log(params)
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
    console.error('获取知识点数据失败:', error);
    ElMessage.error('获取知识点数据失败');
  } finally {
  }
}

// 实验ID
const experimentId = ref()

// 添加 emit 定义
// const emit = defineEmits(['update:experimentName', 'canSave'])

// // 监听实验名称变化
// watch(() => basicForm.name, (newName) => {
//   emit('update:experimentName', newName)
// })


// 监听表单变化
// watch(basicForm, async () => {
//   await validateForm()
// }, { deep: true })

// 添加响应式变量
const dialogVisible = ref(false)
const isEdit = ref(false)

// 在组件挂载时获取路由参数
//获取操作类型
const operateType = ref('')
// 修改 onMounted 钩子
onMounted(async () => {
  
  // 获取实验说明列表
  getExperimentInfoDescribeList();

  // 从路由参数判断操作类型和学校ID
  const { type, id } = route.query
  
  operateType.value = type
  if (type === 'edit' && id) {
    // 编辑模式
    experimentId.value = id
    await loadExperimentData(id)
    hasExperiments.value = true
  } else {
    // 新增模式
    //新增后接收的实验id不为空，则调用loadExperimentData方法获取学校数据
    //解决新增实验到下一步后，返回实验组件时不显示刚刚新增的实验数据BUG、
    // debugger
    if (props.toEexperimentInfoId) {
      console.log('新增后接收到的实验id为: ', props.toEexperimentInfoId)
      loadExperimentData(props.toEexperimentInfoId)
      hasExperiments.value = true
    }
  }
})


// 加载实验数据的方法
const loadExperimentData = async (id) => {
  try {
    // TODO: 调用获取实验详情的 API
    const response = await getExperimentInfo(id)
    experimentData.value = {...response.data};
    
    //属性转字符串
    experimentData.value.attrType = experimentData.value.attrType + ''

    // console.log('获取的实验数据为: ', experimentData.value)
    // 更新表单数据
    //获取学段
    schoolTypeChange(experimentData.value.academicStageType)

    //加载挂载科目体系
    getCourseSystemOptionList(experimentData.value.schoolType, experimentData.value.academicStageType)
    
    // console.log('加载的课程体系为: ', experimentData.value.courseSystems[0])
    //供调用知识点使用
    basicForm.value.schoolType = experimentData.value.schoolType//学校类型
    basicForm.value.academicStageType = experimentData.value.academicStageType//学段
    //加载知识点
    getKnowledgeTreeList(experimentData.value.courseSystems[0])
    // 更新表单数据
    basicForm.value = {
      ...experimentData.value
    }
    
    // 更新实验状态
    hasExperiments.value = true
  } catch (error) {
    ElMessage.error('获取实验数据失败')
    hasExperiments.value = false
  }
}

// 展示获取的数据
const experimentData = ref()

// 控制是否有实验数据
const hasExperiments = ref(false) // 默认为 false



// 修改 showDialog 方法
const showDialog = (value, id) => {
  resetBasicForm()//重置表单
  dialogVisible.value = true
  if (value == 'edit') {
    isEdit.value = true
    // 使用已加载的数据填充表单
    loadExperimentData(id)
  } 
}

// 修改提交表单方法
const submitForm = async () => {
  try {
    proxy.$refs["basicFormRef"].validate(valid => {
      if (valid) {
        // debugger
        if (basicForm.value.id != null) {
          updateExperimentInfo(basicForm.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
             //获取实验数据
            experimentId.value = response.data
            emit('addExperimentInfoId', response.data)
             //获取实验数据
            loadExperimentData(response.data)
          });
        } else {
          addExperimentInfo(basicForm.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            //获取实验数据
            experimentId.value = response.data
            emit('addExperimentInfoId', response.data)
            console.log('新增实验id传过去的id为： ' + response.data)
            loadExperimentData(response.data)
            // hasExperiments.value = true // 添加成功后显示实验信息
          });
        }
      }
    });
  } catch (error) {
    ElMessage.error('操作失败，请重试')
    return
  } finally {
    dialogVisible.value = false
    hasExperiments.value = true // 修改成功后显示实验信息
  }
}

// 添加关闭弹框的方法
const handleClose = () => {
  resetBasicForm()
  dialogVisible.value = false
  
  //编辑的时候，加载挂载科目体系
  if(operateType.value == 'edit') {    
    if(experimentData.value.schoolType && experimentData.value.academicStageType) {
      getCourseSystemOptionList(experimentData.value.schoolType, experimentData.value.academicStageType)
    }
  }
}
//===================================================================实验说明===================================================================

// 添加实验说明对话框的控制变量
const descDialogVisible = ref(false)

//实验说明编辑弹框
const handleDescUpdate = (row) => {
  descReset()
  getExperimentInfoDescribe(row.id).then(response => {
    descForm.value = response.data;
    descDialogVisible.value = true;
  });
}

//删除实验说明
const handleDesDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除吗？`,
    '警告',{
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除逻辑
    delExperimentInfoDescribe(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getExperimentInfoDescribeList()
      } else {
        ElMessage.error('删除失败')
      }
    });
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}

//实验说明的弹框方法
const showDescDialog = () => {
  descReset()
  descDialogVisible.value = true
}


// 处理对话框关闭
const handleDescClose = (done) => {
    descDialogVisible.value = false
}

// 提交实验说明表单
const submitDescForm = async () => {

  try {
    proxy.$refs["descFormRef"].validate(valid => {
    if (valid) {
      descForm.value.experimentInfoId = experimentId.value? experimentId.value : props.toEexperimentInfoId;
      if (descForm.value.id != null) {
        updateExperimentInfoDescribe(descForm.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          getExperimentInfoDescribeList();
        });
      } else {
        addExperimentInfoDescribe(descForm.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          getExperimentInfoDescribeList();
        });
      }
    }
  });
  } catch (error) {
    ElMessage.error('编辑失败，请重试')
  }finally {
    // 关闭对话框
    descDialogVisible.value = false
  }
}
const total = ref(0);
const experimentDescQueryParams = ref({
    experimentInfoId: null,
    pageNum: 1,
    pageSize: 10,
  }
)
/** 查询实验说明列表 */
function getExperimentInfoDescribeList() {
  loading.value = true;
  //获取实验id
  experimentDescQueryParams.value.experimentInfoId = experimentId.value?(experimentId.value?experimentId.value:route.query.id):props.toEexperimentInfoId;
  // debugger
  if(experimentDescQueryParams.value.experimentInfoId) {
    listExperimentInfoDescribe(experimentDescQueryParams.value).then(response => {
      experimentDescribeList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    });
  }


}

//===================================================================实验说明====END===============================================================
// 修改表单验证方法   TODO： 优化为动态获取
const validateForm = () => {
  // if (activeTab.value == 'basicInfo') {
  //   // Validate principle tab
  //   if (!basicForm.value.experimentName && !basicForm.value.schoolType && experimentDescribeList.value.length === 0) {
  //     throw new Error('请完成实验基本信息的必填项')
  //     // return false
  //   }
  // } else if (activeTab.value == 'experimentDesc') {
  //   // Validate target tab
  //   if (experimentDescribeList.value.length === 0) {
  //     throw new Error('请完成实验说明的必填项')
  //     // return false
  //   }
  // }
  // debugger
  // console.log('total.value', total.value)
  // console.log('total.value', !basicForm.value)
  // console.log('total.value', experimentDescribeList.value.length == 0)
  //去掉校验实验说明
  // if (basicForm.value && total.value == 0) {
  //     throw new Error('请完成实验信息和实验说明的添加')
      // return false
  // }
  return true
}



// 暴露 activeTab 给父组件
defineExpose({
  activeTab,
  experimentId,
  validateForm 
})
</script>

<style lang="scss" scoped>
.basic-info-container {
  min-height: calc(100vh - 520px);
  /* padding: 24px; */
  position: relative;
  /* background-color: #f8fafa; */
}

.full-height-tabs {
  background: white;
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.compact-form {
  padding: 24px;
  height: auto;
  min-height: 500px;
  overflow-y: visible;
}

/* 美化上传区域 */
.upload-area {
  width: 180px;
  height: 140px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  background: #fafafa;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #409EFF;
  background: #f5f7fa;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
  color: #909399;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

/* 表单操作按钮组 */
.form-actions {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.right-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

/* 美化表单控件 */
:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #409EFF inset;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #e8edf3; /* 加深背景色 */
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  padding: 6px 8px 0;
}

:deep(.el-tabs__nav) {
  border: none !important;
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
  transition: all 0.3s;
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
  background-color: white;
}

.full-width {
  width: 100%;
}

/* 自定义滚动条 */
.compact-form::-webkit-scrollbar {
  width: 6px;
}

.compact-form::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.compact-form::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 美化按钮样式 */
.custom-button {
  min-width: 100px;
  height: 36px;
  font-weight: 500;
  transition: all 0.3s;
}

.cancel-button {
  border-color: #dcdfe6;
  color: #606266;
}

.cancel-button:hover {
  border-color: #c0c4cc;
  color: #909399;
}

.submit-button {
  background: #409EFF;
  border-color: #409EFF;
}

.submit-button:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

/* 空状态提示样式 */
.empty-tip {
  padding: 40px;
  text-align: center;

  .sub-tip {
    color: #909399;
    font-size: 14px;
    margin-top: 8px;
  }
}

/* 确保知识点和版本教材对齐 */
:deep(.el-cascader) {
  width: 100%;
  line-height: 32px;
}

:deep(.el-cascader .el-input__wrapper) {
  height: 32px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  height: 32px;
}

/* 更新步骤条样式 */
.custom-steps {
  margin: 0 0 40px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-step__title) {
  font-size: 15px;
  font-weight: 500;
  color: #606266;
}

:deep(.el-step__title.is-success) {
  color: #67c23a;
}

:deep(.el-step__title.is-process) {
  color: #409EFF;
  font-weight: 600;
}

:deep(.el-step__icon) {
  background: #edf2fc;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  line-height: 36px;
  transition: all 0.3s;
}

:deep(.el-step.is-process .el-step__icon) {
  background: #409EFF;
  transform: scale(1.1);
}

/* 更新底部导航按钮样式 */
.steps-action {
  /* margin-top: 40px; */
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 12px;
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); */
}

.nav-button {
  padding: 12px 24px;
  font-size: 15px;
  border-radius: 8px;
  margin: 0 12px;
  transition: all 0.3s;
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-button .el-icon {
  margin: 0 6px;
  font-size: 16px;
}

/* 确保备注显示正常 */
.compact-form {
  padding: 24px;
  height: auto;
  min-height: 500px;
  overflow-y: visible;
}

/* 更新表单控件样式 */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 添加教育主题相关的装饰元素 */
.basic-info-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  /* background: linear-gradient(90deg, #409EFF, #67c23a); */
  opacity: 0.6;
}

/* 顶部操作栏样式重新设计 */
.top-actions {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-area,
.right-area {
  flex: 0 0 200px; /* 固定宽度，确保居中标题有足够空间 */
  display: flex;
  align-items: center;
}

.left-area {
  justify-content: flex-start;
}

.right-area {
  justify-content: flex-end;
}

.center-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  position: relative;
}

/* 标题包装器样式 */
.title-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 40px;
  background: linear-gradient(to right, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  border-radius: 8px;
}

/* 标题前缀样式 */
.title-prefix {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: normal;
  letter-spacing: 2px;
}

/* 实验标题样式优化 */
.experiment-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 600px;
  position: relative;
  padding: 0 10px;
  letter-spacing: 1px;
}

/* 标题装饰元素 */
.title-decoration {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(64, 158, 255, 0.2), 
    rgba(103, 194, 58, 0.2)
  );
  border-radius: 2px;
}

/* 标题包装器悬浮效果 */
.title-wrapper:hover .title-decoration {
  background: linear-gradient(90deg, 
    rgba(64, 158, 255, 0.4), 
    rgba(103, 194, 58, 0.4)
  );
  transition: background 0.3s ease;
}

/* 标题两侧装饰 */
.title-wrapper::before,
.title-wrapper::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409EFF;
  opacity: 0.6;
}

.title-wrapper::before {
  left: 20px;
}

.title-wrapper::after {
  right: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .left-area,
  .right-area {
    flex: 0 0 120px; /* 在小屏幕上减少按钮区域的宽度 */
  }

  .title-wrapper {
    padding: 6px 30px;
  }

  .experiment-title {
    font-size: 20px;
    max-width: 300px;
  }

  .title-prefix {
    font-size: 12px;
  }
}

/* 顶部操作栏背景优化 */
.top-actions {
  background: linear-gradient(to bottom, #f5f7fa, #ffffff);
  border-bottom: 1px solid #e4e7ed;
  padding: 16px 24px;
}

/* 按钮样式微调 */
.action-button {
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-1px);
}

.submit-button {
  background: linear-gradient(to right, #409EFF, #67c23a);
  border: none;
}

.submit-button:hover {
  opacity: 0.9;
  background: linear-gradient(to right, #66b1ff, #85ce61);
}

/* 移除原有的表单操作按钮样式 */
.form-actions {
  display: none;
}

/* 标签页容器样式 */
.tabs-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

/* 自定义标签页样式 */
.custom-tabs {
  background: white;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #e8edf3; /* 加深背景色 */
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  padding: 6px 8px 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0;
}

:deep(.el-tabs__nav) {
  border: none !important;
}

/* 自定义标签标题样式 */
.custom-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 36px;
}

:deep(.el-tabs__item) {
  height: 36px;
  line-height: 36px;
  padding: 0 !important;
  font-size: 14px;
  color: #909399;
  position: relative;
  transition: all 0.3s;
  border-radius: 6px 6px 0 0;
  margin: 0 4px;
}

:deep(.el-tabs__item:hover) {
  color: var(--el-color-primary);
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
  background-color: white;
}

:deep(.el-tabs__item.is-active .custom-tab-label) {
  color: var(--el-color-primary);
}

.custom-tab-label .el-icon {
  font-size: 16px;
  margin-right: 4px;
}

/* 移除默认的底部条 */
:deep(.el-tabs__active-bar) {
  display: none;
}

/* Tab内容区域样式 */
:deep(.el-tab-pane) {
  padding: 24px;
}

/* 确保内容区域样式正确 */
.compact-form {
  max-width: 1200px;
  margin: 0 auto;
}

/* 移除多余的边框和阴影 */
:deep(.el-tabs--border-card) {
  border: none;
  box-shadow: none;
}

/* 添加动画效果 */
:deep(.el-tabs__item) {
  position: relative;
  overflow: hidden;
}

:deep(.el-tabs__item)::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: var(--el-color-primary);
  transition: all 0.3s;
  transform: translateX(-50%);
}

:deep(.el-tabs__item.is-active)::before {
  width: 100%;
}

/* 实验说明编辑器样式 */
.experiment-desc {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}

.desc-item {
  margin-bottom: 30px;
}

.desc-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.title-input {
  flex: 1;
}

.editor-wrapper {
  margin-bottom: 24px;
}

/* 提交按钮样式 */
.submit-button {
  min-width: 140px; /* 保按钮文字能够完整显示 */
}

/* 主内容区域包装器 */
.main-content-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-top: 20px;
}

/* 步骤条样式 */
.custom-steps {
  padding: 24px;
  border-bottom: 1px solid #e4e7ed;
}

/* 标签页容器样式 */
.tabs-wrapper {
  border-radius: 0;
  border: none;
}

/* 底部导航按钮样式 */
.steps-action {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
  gap: 12px;
  background: #f8fafc;
}

/* 导航按钮样式 */
.nav-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 14px;
}

/* 错误消息样式 */
:deep(.el-message-box__message) {
  color: #f56c6c;
  font-size: 14px;
  line-height: 1.4;
}

/* 移除tabs-wrapper的重复边框 */
:deep(.el-tabs__header) {
  border-radius: 0;
}

/* 确保内容区域没有重复的边框和圆角 */
:deep(.el-tab-pane) {
  border-radius: 0;
}

/* 添加按钮样式 */
.add-experiment-btn {
  margin: 20px 0;
  padding: 12px 24px;
  font-size: 15px;
  border-radius: 8px;
  background: linear-gradient(135deg, #409EFF, #3a8ee6);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
    background: linear-gradient(135deg, #66b1ff, #409EFF);
  }

  .el-icon {
    font-size: 16px;
  }
}

/* 弹框样式优化 */
.experiment-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%);
    border-bottom: 1px solid #e4e7ed;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
    max-height: calc(80vh - 150px);
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid #e4e7ed;
    background: #f8fafc;
  }

  /* 表单区域样式 */
  .form-section {
    margin-bottom: 24px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-header {
    padding: 12px 16px;
    background: #e6f3ff;
    color: #409EFF;
    font-size: 15px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .form-content {
    padding: 16px;
    background: #f8f9fa;
  }

  /* 上传区域样式优化 */
  .upload-area {
    width: 180px;
    height: 140px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all 0.3s;
    background: #fafafa;
    cursor: pointer;

    &:hover {
      border-color: #409EFF;
      background: #f5f7fa;
      box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
    }
  }

  /* 表单控件样式 */
  :deep(.el-form-item) {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .el-form-item__label {
      font-weight: 500;
      color: #606266;
    }
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 0 0 1px #409EFF inset;
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) inset;
    }
  }
}

/* 实验说明编辑器样式优化 */
.experiment-desc {
  background: white;
  border-radius: 8px;
  padding: 24px;
  // box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .toolbar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .desc-item {
    margin-bottom: 24px;
    border-radius: 8px;
    padding: 16px;
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .experiment-dialog {
    :deep(.el-dialog) {
      width: 95% !important;
      margin: 10px auto;
    }
  }
}

/* 空状态样式 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 500px);
}

.welcome-content {
  text-align: center;
  padding: 48px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.welcome-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 24px;
}

h2 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 12px;
  font-weight: 500;
}

p {
  font-size: 14px;
  color: #909399;
  margin-bottom: 24px;
}

.add-button {
  margin-top: 24px;
  padding: 12px 32px;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #409EFF, #3a8ee6);
  border: none;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
    background: linear-gradient(135deg, #66b1ff, #409EFF);
  }

  .el-icon {
    font-size: 16px;
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .welcome-content {
    padding: 32px;
    margin: 0 16px;
  }

  h2 {
    font-size: 18px;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }
}

.experiment-info {
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;

  .header-left {
    display: flex;
    align-items: flex-start;
    gap: 20px;
  }

  .experiment-icon-wrapper {
    padding: 16px;
    background: linear-gradient(135deg, #ecf5ff 0%, #e6f3ff 100%);
    border-radius: 12px;
    
    .experiment-icon {
      font-size: 12px;
      color: #409EFF;
    }
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .version-tag {
      padding: 2px 8px;
      background: #f0f7ff;
      color: #409EFF;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
    }
  }

  .experiment-tags {
    display: flex;
    gap: 8px;
    
    .el-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      
      .el-icon {
        font-size: 14px;
      }
    }
  }
}

.info-content {
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
    color: #303133;
    font-weight: 500;
    font-size: 16px;

    .el-icon {
      color: #409EFF;
    }
  }
}

.thumbnail-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  height: 100%;

  .thumbnail-wrapper {
    position: relative;
    margin-top: 16px;
    border-radius: 8px;
    overflow: hidden;
    // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    
    &:hover {
      .thumbnail-overlay {
        opacity: 1;
      }
      
      img {
        transform: scale(1.05);
      }
    }
  }

  .thumbnail-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .thumbnail-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    .el-icon {
      font-size: 24px;
      color: #fff;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  .info-item {
    .item-label {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #909399;
      margin-bottom: 8px;
      font-size: 14px;

      .el-icon {
        font-size: 16px;
      }
    }

    .item-value {
      color: #303133;
      font-size: 15px;
      line-height: 1.6;
    }
  }
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 768px) {
  .info-header {
    flex-direction: column;
    gap: 16px;

    .header-actions {
      width: 100%;
      
      .edit-button {
        width: 100%;
      }
    }
  }
}

/* 添加或优化实验说明对话框样式 */
.desc-dialog {
  .desc-item {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    position: relative;
  }

  .desc-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    .title-input {
      flex: 1;
    }

    .delete-btn {
      flex-shrink: 0;
    }
  }

  .editor-wrapper {
    margin-bottom: 24px;
    
    :deep(.tox-tinymce) {
      border-radius: 8px;
    }
  }

  /* 添加新说明按钮样式 */
  .add-desc-btn {
    margin-bottom: 20px;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    color: #909399;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      border-color: #409EFF;
      color: #409EFF;
      background: #f0f7ff;
    }

    .el-icon {
      font-size: 16px;
    }
  }
}

/* 优化空状态提示样式 */
.empty-tip {
  padding: 40px;
  text-align: center;

  .sub-tip {
    color: #909399;
    font-size: 14px;
    margin-top: 8px;
  }
}
</style>

