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
                <el-icon class="welcome-icon"><Cpu /></el-icon>
                <h2>暂无实验信息</h2>
                <p>点击下方按钮创建您的第一个实验</p>
                <el-button type="primary" class="add-button" @click="showDialog('add', 0)">
                  <el-icon><Plus /></el-icon>
                  添加实验
                </el-button>
              </div>
            </div>

            <!-- 有数据时的展示 -->
            <div v-else>
              <!-- 头部横幅 -->
              <div class="info-banner">
                <div class="banner-left">
                  <div class="banner-thumb" :class="experimentData?.defaultImage === 2 ? 'thumb-4-3' : 'thumb-16-9'">
                    <image-preview :src="experimentData?.thumbnail" />
                  </div>
                  <div class="banner-info">
                    <div class="banner-title-row">
                      <h3>{{ experimentData?.experimentName || '' }}</h3>
                      <el-tag size="small" effect="plain" type="success">V{{ experimentData?.version || '1.0' }}</el-tag>
                    </div>
                    <div class="banner-tags">
                      <dict-tag :options="mt_experiment_attr_type" :value="experimentData?.attrType"/>
                      <dict-tag :options="mt_school_type" :value="experimentData?.schoolType"/>
                      <dict-tag :options="mt_academic_stage" :value="experimentData?.academicStageType"/>
                    </div>
                    <p class="banner-desc">{{ experimentData?.blurb || '暂无实验概述' }}</p>
                  </div>
                </div>
                <div class="banner-actions">
                  <el-button type="primary" @click="showDialog('edit', experimentId? experimentId : toEexperimentInfoId)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                </div>
              </div>

              <!-- 教材章节体系（独立卡片，保存实验后才能操作） -->
              <BookChapterManagement
                ref="bookChapterRef"
                v-if="hasExperiments && (experimentId || toEexperimentInfoId)"
                :experimentId="experimentId || toEexperimentInfoId"
                :schoolType="experimentData?.schoolType"
                :academicStageType="experimentData?.academicStageType"
                @saved="loadExperimentData(experimentId || toEexperimentInfoId)"
              />
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

                <!-- 实验图片（多比例双图必传，可设默认；保存时后端自动将默认图同步为缩略图） -->
                <div class="form-group">
                  <div class="form-group-title">
                    <el-icon><Picture /></el-icon>
                    <span>实验图片</span>
                  </div>
                  <div class="form-group-body">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="图片一" prop="image1Url">
                          <div class="exp-img-card">
                            <div class="exp-img-box ratio-16-9">
                              <template v-if="basicForm.image1Url">
                                <image-preview :src="basicForm.image1Url" width="100%" height="100%"/>
                                <span v-if="isDefaultImage(1)" class="exp-img-default-tag">默认</span>
                                <div class="exp-img-mask">
                                  <span class="exp-img-mask-item" title="重新上传" @click.stop>
                                    <el-upload
                                      :action="uploadImgUrl"
                                      :headers="uploadHeaders"
                                      :show-file-list="false"
                                      accept="image/png,image/jpeg"
                                      :before-upload="beforeImageUpload(1)"
                                      :on-success="handleImageSuccess(1)"
                                      :on-error="handleImageError"
                                    >
                                      <el-icon><Refresh /></el-icon>
                                    </el-upload>
                                  </span>
                                  <span class="exp-img-mask-item" title="删除" @click.stop="removeExperimentImage(1)">
                                    <el-icon><Delete /></el-icon>
                                  </span>
                                </div>
                              </template>
                              <el-upload
                                v-else
                                class="exp-img-uploader"
                                :action="uploadImgUrl"
                                :headers="uploadHeaders"
                                :show-file-list="false"
                                accept="image/png,image/jpeg"
                                :before-upload="beforeImageUpload(1)"
                                :on-success="handleImageSuccess(1)"
                                :on-error="handleImageError"
                              >
                                <div class="exp-img-placeholder">
                                  <el-icon class="exp-img-placeholder-icon"><Plus /></el-icon>
                                  <span>上传图片</span>
                                </div>
                              </el-upload>
                            </div>
                            <div class="exp-img-info">
                              <span class="exp-img-spec">640×360 · 16:9 · 不超过1M</span>
                              <el-button v-if="basicForm.image1Url && !isDefaultImage(1)" link type="primary" size="small" @click="setDefaultImage(1)">设为默认</el-button>
                            </div>
                          </div>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="图片二" prop="image2Url">
                          <div class="exp-img-card">
                            <div class="exp-img-box ratio-4-3">
                              <template v-if="basicForm.image2Url">
                                <image-preview :src="basicForm.image2Url" width="100%" height="100%"/>
                                <span v-if="isDefaultImage(2)" class="exp-img-default-tag">默认</span>
                                <div class="exp-img-mask">
                                  <span class="exp-img-mask-item" title="重新上传" @click.stop>
                                    <el-upload
                                      :action="uploadImgUrl"
                                      :headers="uploadHeaders"
                                      :show-file-list="false"
                                      accept="image/png,image/jpeg"
                                      :before-upload="beforeImageUpload(2)"
                                      :on-success="handleImageSuccess(2)"
                                      :on-error="handleImageError"
                                    >
                                      <el-icon><Refresh /></el-icon>
                                    </el-upload>
                                  </span>
                                  <span class="exp-img-mask-item" title="删除" @click.stop="removeExperimentImage(2)">
                                    <el-icon><Delete /></el-icon>
                                  </span>
                                </div>
                              </template>
                              <el-upload
                                v-else
                                class="exp-img-uploader"
                                :action="uploadImgUrl"
                                :headers="uploadHeaders"
                                :show-file-list="false"
                                accept="image/png,image/jpeg"
                                :before-upload="beforeImageUpload(2)"
                                :on-success="handleImageSuccess(2)"
                                :on-error="handleImageError"
                              >
                                <div class="exp-img-placeholder">
                                  <el-icon class="exp-img-placeholder-icon"><Plus /></el-icon>
                                  <span>上传图片</span>
                                </div>
                              </el-upload>
                            </div>
                            <div class="exp-img-info">
                              <span class="exp-img-spec">800×600 · 4:3 · 不超过1M</span>
                              <el-button v-if="basicForm.image2Url && !isDefaultImage(2)" link type="primary" size="small" @click="setDefaultImage(2)">设为默认</el-button>
                            </div>
                          </div>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>
                </div>

                <!-- 分组1：基本信息 -->
                <div class="form-group">
                  <div class="form-group-title">
                    <el-icon><Document /></el-icon>
                    <span>基本信息</span>
                  </div>
                  <div class="form-group-body">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="实验名称" prop="experimentName">
                          <el-input v-model="basicForm.experimentName" placeholder="请输入实验名称"/>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="属性" prop="attrType">
                          <el-select v-model="basicForm.attrType" placeholder="请选择属性类型" clearable>
                            <el-option v-for="item in mt_experiment_attr_type" :key="item.value" :value="item.value" :label="item.label"/>
                          </el-select>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="学校类型" prop="schoolType">
                          <el-select v-model="basicForm.schoolType" placeholder="请选择学校类型" @change="schoolTypeChange" clearable>
                            <el-option v-for="item in mt_school_type" :key="item.value" :value="item.value" :label="item.label"/>
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="学段" prop="academicStageType">
                          <el-select v-model="basicForm.academicStageType" placeholder="请选择学段" @change="academicStageChange" clearable>
                            <el-option v-for="item in educationStage.value" :key="item.value" :value="item.value" :label="item.label"/>
                          </el-select>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="开发者" prop="developerType">
                          <el-select v-model="basicForm.developerType" placeholder="请选择开发者" clearable>
                            <el-option v-for="item in mt_developer_type" :key="item.value" :value="item.value" :label="item.label"/>
                          </el-select>
                        </el-form-item>
                      </el-col>
                     <!-- <el-col :span="12">
                        <el-form-item label="版本号" prop="version">
                          <el-input v-model="basicForm.version" placeholder="请输入版本号"/>
                        </el-form-item>
                      </el-col> -->
                    </el-row>
                  </div>
                </div>

                <!-- 分组2：课程与知识点 -->
                <div class="form-group">
                  <div class="form-group-title">
                    <el-icon><Collection /></el-icon>
                    <span>课程与知识点</span>
                  </div>
                  <div class="form-group-body">
                  <!-- 教材章节体系已移至独立的 BookChapterManagement 组件（信息页卡片），弹框中不再需要 -->
                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item label="知识点体系" prop="knowledgePoints">
                        <el-tree-select
                            v-model="basicForm.knowledgePoints"
                            :data="knowledgeTreeList"
                            :props="{ value: 'id', label: 'knowledge', children: 'children' }"
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
                  <!-- 知识点权重表格（选择知识点后显示） -->
                  <div v-if="basicForm.knowledgePoints && basicForm.knowledgePoints.length" class="knowledge-ratio-section">
                    <el-form-item label="知识点权重">
                      <div class="ratio-tip">设置各知识点在当前实验中的占比权重，范围为 0 ~ 1，建议合计为 1.0</div>
                      <el-table :data="knowledgeRatioData" size="small" border class="ratio-table">
                        <el-table-column prop="name" label="知识点" min-width="200" />
                        <el-table-column label="权重" width="140" align="center">
                          <template #default="{ row }">
                            <el-input-number
                              :model-value="basicForm.knowledgeRatios[row.id]"
                              @update:model-value="val => { if(basicForm.knowledgeRatios) basicForm.knowledgeRatios[row.id] = val }"
                              :min="0" :max="1" :step="0.1"
                              :precision="2" size="small" controls-position="right" style="width: 110px"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                      <div class="ratio-total" :class="{ 'ratio-warning': ratioSum !== 1 }">
                        合计：{{ ratioSum.toFixed(2) }}
                        <span v-if="ratioSum !== 1">（建议合计为 1.0）</span>
                      </div>
                    </el-form-item>
                  </div>
                  </div>
                </div>

                <!-- 分组3：其他信息 -->
                <div class="form-group">
                  <div class="form-group-title">
                    <el-icon><Memo /></el-icon>
                    <span>其他信息</span>
                  </div>
                  <div class="form-group-body">
                    <el-form-item label="实验简介" prop="blurb">
                      <el-input v-model="basicForm.blurb" type="textarea" :rows="3" placeholder="请输入实验简介"/>
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                      <el-input v-model="basicForm.remark" type="textarea" :rows="2" placeholder="请输入备注"/>
                    </el-form-item>
                  </div>
                </div>

              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="handleClose">取消</el-button>
                  <el-button type="primary" @click="submitForm">确定</el-button>
                </span>
              </template>
            </el-dialog>
          </el-tab-pane>

          <!-- 内容简介标签页(AI 生成纯 PPT,2026-08-27 替代原"实验说明"手输条目) -->
          <el-tab-pane name="experimentDesc">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Edit /></el-icon>
                <span>内容简介</span>
              </div>
            </template>

            <!-- 未保存实验基础信息时的门槛提示 -->
            <div v-if="!(experimentId || toEexperimentInfoId)" class="empty-tip">
              <el-empty>
                <template #description>
                  <p>请先添加并保存实验基础信息</p>
                  <p class="sub-tip">完成后即可生成内容简介</p>
                </template>
              </el-empty>
            </div>

            <!-- 内容简介管理(空态/生成中/失败/翻页查看/单页编辑,组件内部自治) -->
            <IntroManagement
              v-else
              :experiment-id="experimentId || toEexperimentInfoId"
              :experiment-name="experimentData?.experimentName || ''"
            />
          </el-tab-pane>


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
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import Tinymce from "@/components/Tinymce/index.vue"
import BookChapterManagement from './BookChapterManagement.vue'
const bookChapterRef = ref(null)


const { proxy } = getCurrentInstance();
const { mt_school_type, mt_vocal_education_type, mt_academic_stage,mt_school_subject, mt_experiment_attr_type,mt_developer_type, mt_vocal_school_subject} = proxy.useDict('mt_school_type', 'mt_vocal_education_type', 'mt_academic_stage', 'mt_school_subject','mt_experiment_attr_type','mt_developer_type', 'mt_vocal_school_subject');

//课程体系API
import {getCourseSystemOptions, getChapterList } from '@/api/glxt/subject'

//导入实验基本信息api 
import {getExperimentInfo, addExperimentInfo, updateExperimentInfo, getExperimentAlias, saveExperimentAlias} from '@/api/glxt/experimentInfo'

//获取知识点树形结构
import { getKnowledgeTree } from '@/api/glxt/knowledge';

//内容简介管理组件(AI 生成纯 PPT,替代原"实验说明"手输条目)
import IntroManagement from './IntroManagement.vue'

// 实验图片上传鉴权
import { getToken } from '@/utils/auth';


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
  richEditor.value.content = object[parameterName] || ''
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
  if (richEditor.value.object) {
    richEditor.value.object[richEditor.value.parameterName] = content
  }
  closeEditor()
}

// 添加更新编辑器内容的方法
const updateEditorContent = (content) => {
  richEditor.value.content = content
}


// 处理标签页点击
const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
  if (activeTab.value === 'experimentDesc' && !(experimentId.value || props.toEexperimentInfoId)) {
    ElMessage.warning('请先添加并保存实验基础信息后再生成内容简介')
    activeTab.value = 'basicInfo' // 强制切回基础信息标签
    return;
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
  thumbnail: '',//缩略图（不再由表单维护，保存时后端自动同步为默认实验图）
  image1Url: '',//图片一(640×360,16:9)
  image2Url: '',//图片二(800×600,4:3)
  defaultImage: null,//默认图片:1-图片一 2-图片二
  experimentName: '',//实验名称
  attrType:'',//属性类型
  schoolType:'',//学校类型
  academicStageType:'',//学段类型
  developerType:'',//开发者类型
  blurb:'',//简介
  version:'',//实验版本号
  remark:'',//实验备注
  courseSystems: [],//课程体系
  knowledgePoints:[],//知识点体系
  knowledgeRatios:{},//知识点权重映射
  aliasName:null//实验副名称
})


//重置表单数据
const resetBasicForm = () => {
     // 重置表单数据
    basicForm.value = {
      id: null,
      thumbnail: null,//缩略图（不再由表单维护，保存时后端自动同步为默认实验图）
      image1Url: null,//图片一(640×360,16:9)
      image2Url: null,//图片二(800×600,4:3)
      defaultImage: null,//默认图片:1-图片一 2-图片二
      experimentName: null,//实验名称
      attrType:null,//属性类型
      schoolType:null,//学校类型
      academicStageType:null,//学段类型
      developerType:null,//开发者类型
      blurb:null,//简介
      version:null,//实验版本号
      courseSystems: [],//课程体系
      knowledgePoints:[],//知识点体系
      knowledgeRatios:{},//知识点权重映射
      aliasName: null,//实验副名称
      _aliasId: null//副名称记录ID
    }
    mountSystemList.value = []   // 清空教材章节体系列表
}

// ==================== 实验图片（多比例双图）====================
// 图片规格：图片一 640×360(16:9)、图片二 800×600(4:3)，均不超过 1M，上传前严格校验
const EXP_IMAGE_SPECS = {
  1: { width: 640, height: 360, ratio: '16:9' },
  2: { width: 800, height: 600, ratio: '4:3' },
}
const EXP_IMAGE_MAX_MB = 1
const baseApi = import.meta.env.VITE_APP_BASE_API
const uploadImgUrl = ref(baseApi + '/file/upload')
const uploadHeaders = ref({ Authorization: 'Bearer ' + getToken() })

// 上传前校验：格式 / 大小 / 精确分辨率（读实际宽高，不符即拦截并提示当前值）
const beforeImageUpload = (slot) => (file) => {
  const spec = EXP_IMAGE_SPECS[slot]
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    proxy.$modal.msgError('只能上传 jpg / png 格式图片')
    return false
  }
  if (file.size / 1024 / 1024 > EXP_IMAGE_MAX_MB) {
    proxy.$modal.msgError(`图片大小不能超过 ${EXP_IMAGE_MAX_MB}M（当前 ${(file.size / 1024 / 1024).toFixed(2)}M）`)
    return false
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width !== spec.width || img.height !== spec.height) {
        proxy.$modal.msgError(`分辨率不符：当前 ${img.width}×${img.height}，请上传 ${spec.width}×${spec.height}（${spec.ratio}）`)
        reject()
      } else {
        resolve(true)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      proxy.$modal.msgError('图片读取失败，请重新选择')
      reject()
    }
    img.src = url
  })
}

// 上传成功：存相对地址（与共享 ImageUpload 口径一致）；当前无默认图时首张自动成为默认
const handleImageSuccess = (slot) => (res) => {
  if (res.code !== 200) {
    proxy.$modal.msgError(res.msg || '上传失败')
    return
  }
  const raw = res.data.url
  const clean = baseApi && raw && raw.startsWith(baseApi) ? raw.replace(baseApi, '') : raw
  if (slot === 1) {
    basicForm.value.image1Url = clean
  } else {
    basicForm.value.image2Url = clean
  }
  if (basicForm.value.defaultImage !== 1 && basicForm.value.defaultImage !== 2) {
    basicForm.value.defaultImage = slot
  }
  // 自定义上传区不会自动触发 change 校验，手动清除该字段的旧错误提示
  basicFormRef.value?.clearValidate(slot === 1 ? 'image1Url' : 'image2Url')
}

const handleImageError = () => {
  proxy.$modal.msgError('上传图片失败')
}

// 删除图片；删除的是默认图时，默认自动落到另一张（存在时）
const removeExperimentImage = (slot) => {
  if (slot === 1) {
    basicForm.value.image1Url = ''
  } else {
    basicForm.value.image2Url = ''
  }
  if (basicForm.value.defaultImage === slot) {
    const other = slot === 1 ? 2 : 1
    const otherUrl = other === 1 ? basicForm.value.image1Url : basicForm.value.image2Url
    basicForm.value.defaultImage = otherUrl ? other : null
  }
}

const setDefaultImage = (slot) => {
  basicForm.value.defaultImage = slot
}

// 该槽位是否为默认图（未设置时视为图片一）
const isDefaultImage = (slot) => {
  const d = basicForm.value.defaultImage
  if (d === 1 || d === 2) return d === slot
  return slot === 1
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

// ===== 教材章节体系（一对多） =====
const mountSystemList = ref([])    // 已添加的教材章节体系列表
const bookSelection = ref([])      // 当前选择的 [subjectType, libraryId, volumeId]
const chapterSelection = ref(null) // 当前选择的章节/小节 id
const chapterTree = ref([])        // 章节树（选完分册后加载）

// 选完分册后加载章节树
const handleBookSelectChange = (value) => {
  chapterSelection.value = null
  chapterTree.value = []
  if (value && value.length >= 3) {
    const subjectId = value[0]
    const volumeId = value[2]
    getChapterList(volumeId, subjectId).then(res => {
      // 后端已构建章节树（含 children），前端只需递归给每个节点加 label（= chapterTxt）
      // tree-select 和 findInChapterNode 都用 label 取名称
      const mapLabel = (nodes) => {
        (nodes || []).forEach(n => {
          n.label = n.chapterTxt
          if (n.children && n.children.length) mapLabel(n.children)
        })
      }
      mapLabel(res.data || [])
      chapterTree.value = res.data || []
    })
  }
}

// 在章节树里递归查找节点
const findInChapterNode = (tree, id) => {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children) {
      const found = findInChapterNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 添加到列表（副名称初始为空，在列表中编辑）
const addMountSystem = () => {
  if (!bookSelection.value || bookSelection.value.length < 3) return
  const [subjectType, libraryId, volumeId] = bookSelection.value
  // 从 courseSystemOptions 取名称
  const subject = courseSystemOptions.value.find(s => s.value == subjectType)
  const subjectName = subject?.label || ''
  const lib = subject?.children?.find(l => l.value == libraryId)
  const textbookLibraryName = lib?.label || ''
  const vol = lib?.children?.find(v => v.value == volumeId)
  const volumeName = vol?.label || ''
  // 从 chapterTree 取章节/小节
  let chapterId = null, sectionId = null, chapterName = '', sectionName = ''
  if (chapterSelection.value) {
    const node = findInChapterNode(chapterTree.value, chapterSelection.value)
    if (node) {
      if (node.parentId) {
        // 是小节：取父为章节
        sectionId = node.id
        sectionName = node.label
        const parent = findInChapterNode(chapterTree.value, node.parentId)
        if (parent) { chapterId = parent.id; chapterName = parent.label }
      } else {
        // 是章节
        chapterId = node.id
        chapterName = node.label
      }
    }
  }
  mountSystemList.value.push({
    subjectId: subjectType,
    textbookLibraryId: Number(libraryId),
    volumeId: Number(volumeId),
    chapterId, sectionId,
    aliasName: '',
    subjectName, textbookLibraryName, volumeName,
    chapterName, sectionName
  })
  // 清空选择，准备下一次添加
  bookSelection.value = []
  chapterSelection.value = null
  chapterTree.value = []
}

// 从列表删除
const removeMountSystem = (index) => {
  mountSystemList.value.splice(index, 1)
}


const handleCourseSystemChange = (values) => {

  if(values == '' || values == undefined || values == null){
    basicForm.value.knowledgePoints = []
    basicForm.value.aliasName = null
    return
  }

  if (!values || values.length === 0) {
    basicForm.value.courseSystems = []
    basicForm.value.aliasName = null
    return
  }

  // 科目不变时保留知识点，科目变了才清空
  const newSubjectId = values[0]
  if (lastSubjectId.value != newSubjectId) {
    basicForm.value.knowledgePoints = []
  }
  lastSubjectId.value = newSubjectId

  // 如果所有必要参数都有值，则获取知识点
  if (values.length > 0 && values[0] != null) {
      let subjectId = values[0]
      getKnowledgeTreeList(subjectId);
  }

  // 加载该版本教材下的实验副名称
  loadAliasName(values)

}

// 加载实验副名称
const loadAliasName = (courseSystems) => {
  const eid = basicForm.value.id || experimentId.value || props.toEexperimentInfoId
  basicForm.value.aliasName = null
  basicForm.value._aliasId = null
  if (!eid || !courseSystems || courseSystems.length < 3) return

  const subjectId = courseSystems[0]
  const textbookLibraryId = courseSystems[1]
  const volumeId = courseSystems[2]

  getExperimentAlias(eid, subjectId, textbookLibraryId, volumeId).then(res => {
    if (res.data) {
      basicForm.value.aliasName = res.data.aliasName
      basicForm.value._aliasId = res.data.id
      if (experimentData.value) {
        experimentData.value.aliasName = res.data.aliasName
      }
    }
  })
}

// 保存实验副名称
const saveAliasNameIfNeeded = (experimentId) => {
  const courseSystems = basicForm.value.courseSystems
  const aliasName = basicForm.value.aliasName

  if (!experimentId || !courseSystems || courseSystems.length < 3) return

  const data = {
    subjectId: courseSystems[0],
    textbookLibraryId: courseSystems[1],
    volumeId: courseSystems[2],
    aliasName: aliasName || null
  }

  return saveExperimentAlias(experimentId, data)
}


//获取科目名称
const getSubjectName = (subjectType, schoolType) => {
    return schoolType == '1'? mt_school_subject.value ?.find(item => item.value === subjectType)?.label : mt_vocal_school_subject.value ?.find(item => item.value === subjectType)?.label
}

// 获取教材版本名称（从级联选项中取第二级label）
const getTextbookName = () => {
  const cs = experimentData.value?.courseSystems
  if (!cs || cs.length < 2 || !courseSystemOptions.value) return ''
  const subject = courseSystemOptions.value.find(s => s.value == cs[0])
  if (!subject || !subject.children) return ''
  const book = subject.children.find(b => b.value == cs[1])
  return book?.label || ''
}

const getVolumeName = () => {
  const cs = experimentData.value?.courseSystems
  if (!cs || cs.length < 3 || !courseSystemOptions.value) return ''
  const subject = courseSystemOptions.value.find(s => s.value == cs[0])
  if (!subject || !subject.children) return ''
  const book = subject.children.find(b => b.value == cs[1])
  if (!book || !book.children) return ''
  const vol = book.children.find(v => v.value == cs[2])
  return vol?.label || ''
}

const getKnowledgeNames = () => {
  const ids = experimentData.value?.knowledgePoints
  if (!ids || ids.length === 0) return ''
  const ratios = experimentData.value?.knowledgeRatios || {}
  const names = []
  const findNames = (items) => {
    if (!items) return
    for (const item of items) {
      if (ids.includes(item.id)) {
        const r = ratios[item.id]
        names.push(r != null ? `${item.knowledge || item.label}(${r})` : (item.knowledge || item.label))
      }
      if (item.children) findNames(item.children)
    }
  }
  findNames(knowledgeTreeList.value)
  return names.join('、')
}

// 查找单个知识点名称
const findKnowledgeName = (id) => {
  const find = (items) => {
    if (!items) return null
    for (const item of items) {
      if (item.id === id) return item.knowledge || item.label
      if (item.children) {
        const found = find(item.children)
        if (found) return found
      }
    }
    return null
  }
  return find(knowledgeTreeList.value) || `知识点${id}`
}

// 知识点权重表格行数据（仅 id + name）
const knowledgeRatioData = computed(() => {
  const points = basicForm.value.knowledgePoints
  if (!points || points.length === 0) return []
  return points.map(id => ({ id, name: findKnowledgeName(id) }))
})

// 权重合计
const ratioSum = computed(() => {
  const ratios = basicForm.value.knowledgeRatios || {}
  const points = basicForm.value.knowledgePoints || []
  const sum = points.reduce((acc, id) => acc + (ratios[id] || 0), 0)
  return Math.round(sum * 100) / 100
})

// 知识点变化时自动初始化权重
watch(() => basicForm.value.knowledgePoints, (newPoints) => {
  if (!newPoints || newPoints.length === 0) {
    basicForm.value.knowledgeRatios = {}
    return
  }
  if (!basicForm.value.knowledgeRatios) basicForm.value.knowledgeRatios = {}
  // 清除已取消选择的权重
  Object.keys(basicForm.value.knowledgeRatios).forEach(key => {
    if (!newPoints.includes(Number(key))) delete basicForm.value.knowledgeRatios[key]
  })
  // 新增的知识点设置默认均分权重
  newPoints.forEach(id => {
    if (basicForm.value.knowledgeRatios[id] == null) {
      basicForm.value.knowledgeRatios[id] = +(1 / newPoints.length).toFixed(2)
    }
  })
}, { deep: true })

// 实验基本信息表单验证规则
const rules = {
  image1Url: [{ required: true, message: '请上传图片一（640×360，16:9）', trigger: 'change' }],
  image2Url: [{ required: true, message: '请上传图片二（800×600，4:3）', trigger: 'change' }],
  experimentName: [{ required: true, message: '请输入实验名称', trigger: 'blur' }],
  attrType: [{ required: true, message: '属性不能为空', trigger: 'blur' }],
  schoolType: [{ required: true, message: '学校类型不能为空', trigger: 'blur' }],
  academicStageType: [{ required: true, message: '学段类型不能为空', trigger: 'blur' }],
  developerType: [{ required: true, message: '开发者不能为空', trigger: 'blur' }],
  // version: [{ required: true, message: '版本号不能为空', trigger: 'blur' }],
  courseSystems: [{ required: true, message: '请选择版本教材', trigger: 'change' }],
  // knowledgePoints: [{ required: true, message: "知识点体系不能为空", trigger: "change" }],
}


//知识点树形结构
const knowledgeTreeList = ref([])
const lastSubjectId = ref(null)
const getKnowledgeTreeList = async (subjectId) => {
  try {
    if (!basicForm.value.schoolType || !basicForm.value.academicStageType) {
      return;
    }

    let params = {
      schoolTypeId: basicForm.value.schoolType,
      academicStageId: basicForm.value.academicStageType,
      subjectId: subjectId
    }

    const response = await getKnowledgeTree(params)
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

// 添加响应式变量
const dialogVisible = ref(false)
const isEdit = ref(false)

const operateType = ref('')
onMounted(async () => {
  const { type, id } = route.query
  operateType.value = type
  if (type === 'edit' && id) {
    experimentId.value = id
    await loadExperimentData(id)
    hasExperiments.value = true
  } else {
    if (props.toEexperimentInfoId) {
      loadExperimentData(props.toEexperimentInfoId)
      hasExperiments.value = true
    }
  }
})


// 加载实验数据的方法
const loadExperimentData = async (id) => {
  try {
    const response = await getExperimentInfo(id)
    experimentData.value = {...response.data};
    experimentData.value.attrType = experimentData.value.attrType + ''

    schoolTypeChange(experimentData.value.schoolType)
    getCourseSystemOptionList(experimentData.value.schoolType, experimentData.value.academicStageType)

    basicForm.value.schoolType = experimentData.value.schoolType
    basicForm.value.academicStageType = experimentData.value.academicStageType
    if (experimentData.value.courseSystems && experimentData.value.courseSystems.length > 0) {
      getKnowledgeTreeList(experimentData.value.courseSystems[0])
    }

    basicForm.value = {
      ...experimentData.value
    }

    // 回显教材章节体系列表（从后端返回的 mtExperimentInfoMountSystems）
    if (experimentData.value.mtExperimentInfoMountSystems && experimentData.value.mtExperimentInfoMountSystems.length > 0) {
      mountSystemList.value = experimentData.value.mtExperimentInfoMountSystems.map(ms => ({
        ...ms,
        subjectName: ms.subjectId ? getSubjectName(ms.subjectId, experimentData.value.schoolType) : '',
        textbookLibraryName: ms.textbookLibraryName || '',
        volumeName: ms.volumeName || '',
        chapterName: ms.chapterName || '',
        sectionName: ms.sectionName || ''
      }))
    } else {
      mountSystemList.value = []
    }

    hasExperiments.value = true
    if (experimentData.value.courseSystems && experimentData.value.courseSystems.length > 0) {
      lastSubjectId.value = experimentData.value.courseSystems[0]
    }
  } catch (error) {
    console.error('获取实验数据失败:', error)
    ElMessage.error('获取实验数据失败')
    hasExperiments.value = false
  }
}

// 展示获取的数据
const experimentData = ref()

// 控制是否有实验数据
const hasExperiments = ref(false) // 默认为 false



const showDialog = (value, id) => {
  resetBasicForm()
  dialogVisible.value = true
  if (value == 'edit') {
    isEdit.value = true
    loadExperimentData(id)
  }
}

const submitForm = async () => {
  try {
    proxy.$refs["basicFormRef"].validate(valid => {
      if (valid) {
        if (basicForm.value.id != null) {
          updateExperimentInfo(basicForm.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            experimentId.value = response.data
            emit('addExperimentInfoId', response.data)
            loadExperimentData(response.data)
            // saveAliasNameIfNeeded(response.data) // 副名称已改到教材章节体系列表(mountSystemList)，随主保存一起提交，不再单独保存
          });
        } else {
          addExperimentInfo(basicForm.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            experimentId.value = response.data
            emit('addExperimentInfoId', response.data)
            loadExperimentData(response.data)
            // saveAliasNameIfNeeded(response.data) // 副名称已改到教材章节体系列表(mountSystemList)，随主保存一起提交，不再单独保存
          });
        }
      }
    });
  } catch (error) {
    ElMessage.error('操作失败，请重试')
    return
  } finally {
    dialogVisible.value = false
    hasExperiments.value = true
  }
}

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

// 原"实验说明"手输 CRUD(列表/弹窗/提交/删除/分页查询)已随内容简介改版整体移除,
// 新实现见 IntroManagement.vue(AI 生成纯 PPT:空态新增 → 大纲确认 → 生成 → 翻页查看/单页编辑)。

const validateForm = () => {
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
/* ==================== Variables ==================== */
$primary: #409eff;
$primary-light: #EFF6FF;
$bg: #F8FAFC;
$card: #FFFFFF;
$border: #E2E8F0;
$text: #1E293B;
$text-secondary: #64748B;
$text-muted: #94A3B8;
$radius: 8px;
$radius-lg: 12px;

/* ==================== Container ==================== */
.basic-info-container {
  min-height: calc(100vh - 520px);
  position: relative;
}

/* ==================== Empty State ==================== */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 500px);
}

.welcome-content {
  text-align: center;
  padding: 48px;
  background: $card;
  border-radius: $radius-lg;
  border: 1px solid $border;
}

.welcome-icon {
  font-size: 48px;
  color: $primary;
  margin-bottom: 24px;
}

h2 {
  font-size: 20px;
  color: $text;
  margin-bottom: 12px;
  font-weight: 600;
}

p {
  font-size: 14px;
  color: $text-muted;
  margin-bottom: 24px;
}

.add-button {
  margin-top: 24px;
  padding: 10px 28px;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: $primary;
  color: #fff;
  border: none;
  border-radius: $radius;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1D4ED8;
  }

  .el-icon {
    font-size: 16px;
  }
}

/* ==================== Detail Page Banner ==================== */
.info-banner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px;
  margin-bottom: 8px;

  .banner-left {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    flex: 1;
    min-width: 0;
  }

  .banner-thumb {
    // 宽度跟随默认图真实比例：16:9 → 142px（默认），4:3 → 107px；高度固定 80px
    width: 142px;
    height: 80px;
    border-radius: $radius;
    flex-shrink: 0;
    background: $bg;
    overflow: hidden;

    &.thumb-4-3 { width: 107px; }

    :deep(img) {
      width: 100%;
      height: 100%;
      // 兜底：老数据/比例不符时优雅裁切，不变形
      object-fit: cover;
    }
  }

  .banner-info {
    flex: 1;
    min-width: 0;
  }

  .banner-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: $text;
    }
  }

  .banner-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;

    :deep(.el-tag) {
      margin-right: 0;
    }
  }

  .banner-desc {
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .banner-actions {
    flex-shrink: 0;
    margin-left: 20px;
    align-self: flex-start;
  }
}

/* ==================== Detail Section (Flat) ==================== */
.info-section {
  padding: 24px;
}

.info-group-title {
  font-size: 14px;
  font-weight: 600;
  color: $text;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 2px solid $primary;
  display: inline-block;
}

.detail-row {
  display: flex;
  align-items: baseline;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid #F1F5F9;
  }

  .detail-label {
    width: 80px;
    flex-shrink: 0;
    font-size: 13px;
    color: $text-muted;
  }

  .detail-value {
    flex: 1;
    font-size: 14px;
    color: $text;
    line-height: 1.5;
  }
}

@media screen and (max-width: 900px) {
  .info-section :deep(.el-col) {
    max-width: 100% !important;
    flex: 0 0 100% !important;
    margin-bottom: 16px;
  }
}

/* ==================== Top Actions ==================== */
.top-actions {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $card;
  border-bottom: 1px solid $border;
  padding: 12px 24px;
}

.left-area,
.right-area {
  flex: 0 0 200px;
  display: flex;
  align-items: center;
}

.left-area { justify-content: flex-start; }
.right-area { justify-content: flex-end; }

.center-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
}

.title-wrapper {
  padding: 6px 32px;
  background: $primary-light;
  border-radius: $radius;
}

.title-prefix {
  font-size: 12px;
  color: $text-muted;
  margin-bottom: 2px;
  letter-spacing: 1px;
}

.experiment-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: $text;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 500px;
}

.title-decoration { display: none; }

/* ==================== Tabs ==================== */
.tabs-wrapper {
  background: $card;
  overflow: hidden;
  border: 1px solid $border;
  border-radius: $radius;
}

.full-height-tabs {
  background: $card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  margin-bottom: 24px;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: $bg;
  border-bottom: 1px solid $border;
  border-radius: $radius $radius 0 0;
  padding: 6px 8px 0;
}

:deep(.el-tabs__nav) { border: none !important; }
:deep(.el-tabs__active-bar) { display: none; }

:deep(.el-tabs__item) {
  height: 36px;
  line-height: 36px;
  padding: 0 !important;
  font-size: 14px;
  color: $text-muted;
  position: relative;
  border-radius: 6px 6px 0 0;
  margin: 0 4px;
  transition: color 0.2s;

  &:hover { color: $primary; }

  &.is-active {
    color: $primary;
    font-weight: 500;
    background-color: $card;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: $primary;
    transition: all 0.2s;
    transform: translateX(-50%);
  }

  &.is-active::before { width: 100%; }
}

.custom-tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 36px;
}

:deep(.el-tab-pane) { padding: 24px; }
:deep(.el-tabs--border-card) { border: none; box-shadow: none; }

/* ==================== Form ==================== */
.compact-form {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

:deep(.el-form-item) { margin-bottom: 20px; }

:deep(.el-form-item__label) {
  font-weight: 500;
  color: $text-secondary;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: $radius;
  transition: box-shadow 0.2s;
}

:deep(.el-cascader) { width: 100%; }
:deep(.el-select) { width: 100%; }
:deep(.knowledge-select) { width: 100%; }
:deep(.w-full) { width: 100%; }

.full-width { width: 100%; }

.form-actions { display: none; }

/* ==================== Upload ==================== */
.upload-area {
  width: 180px;
  height: 140px;
  border: 2px dashed $border;
  border-radius: $radius;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: border-color 0.2s;
  background: $bg;
  cursor: pointer;

  &:hover {
    border-color: $primary;
    background: $primary-light;
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: $text-muted;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
  color: $text-muted;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

/* ==================== 实验图片（多比例双图） ==================== */
.exp-img-card {
  width: 100%;
}

.exp-img-box {
  position: relative;
  height: 152px;
  max-width: 100%;
  // 盒子自身作为弹性容器：无论 el-upload 内部结构如何，子内容都被强制水平垂直居中
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed $border;
  border-radius: $radius;
  overflow: hidden;
  background: $bg;

  // 显式宽度按 152px 高 × 对应比例换算(块级布局下 aspect-ratio 会被宽度拉伸覆盖,写死最稳)
  &.ratio-16-9 { width: 270px; }  // 16:9
  &.ratio-4-3 { width: 203px; }   // 4:3

  &:hover { border-color: $primary; }

  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }
}

.exp-img-uploader {
  // class 落在 el-upload 外层包装 div 上：此层自身也要双向居中，三层嵌套（盒子→包装div→.el-upload）才全部居中
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.exp-img-placeholder {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: $text-muted;
  font-size: 12px;
  cursor: pointer;

  .exp-img-placeholder-icon {
    font-size: 24px;
  }
}

.exp-img-default-tag {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  padding: 2px 10px;
  border-radius: 0 0 $radius 0;
  background: #e6a23c;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
}

.exp-img-mask {
  position: absolute;
  right: 6px;
  top: 6px;
  z-index: 3;
  display: none;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.55);

  .exp-img-mask-item {
    display: flex;
    padding: 4px;
    color: #fff;
    font-size: 15px;
    cursor: pointer;

    &:hover { opacity: 0.8; }

    :deep(.el-upload) { display: flex; color: #fff; }
  }
}

.exp-img-box:hover .exp-img-mask { display: flex; }

.exp-img-info {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;

  .exp-img-spec {
    font-size: 12px;
    color: $text-muted;
  }
}

/* ==================== Edit Dialog ==================== */
.experiment-dialog {
  :deep(.el-dialog) {
    border-radius: $radius-lg;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 16px 20px;
    border-bottom: 1px solid $border;

    .el-dialog__title {
      font-size: 17px;
      font-weight: 600;
      color: $text;
    }
  }

  :deep(.el-dialog__body) {
    padding: 20px 24px;
    max-height: calc(80vh - 140px);
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 20px;
    border-top: 1px solid $border;
  }

  .form-thumb-top {
    margin-bottom: 10px;
    padding-bottom: 20px;
    border-bottom: 1px solid #F1F5F9;

    :deep(.el-form-item__label) {
      padding-bottom: 8px;
    }

    :deep(.el-form-item__content) {
      display: flex;
      justify-content: center;
    }
  }

  .form-group {
    margin-bottom: 20px;

    &:last-child { margin-bottom: 0; }
  }

  .form-group-title {
    font-size: 14px;
    font-weight: 600;
    color: $text;
    padding-bottom: 10px;
    margin-bottom: 16px;
    border-bottom: 2px solid $primary;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    .el-icon {
      color: $primary;
      font-size: 16px;
    }
  }

  .form-group-body {
    padding: 0;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;

    &:last-child { margin-bottom: 0; }
  }
}

/* ==================== Buttons ==================== */
.action-button { transition: opacity 0.2s; &:hover { opacity: 0.85; } }

.submit-button {
  background: $primary;
  border-color: $primary;

  &:hover { background: #1D4ED8; border-color: #1D4ED8; }
}

.cancel-button {
  border-color: $border;
  color: $text-secondary;
}

.add-experiment-btn {
  margin: 20px 0;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: $radius;
  background: $primary;
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: #1D4ED8; }
}

/* ==================== Steps ==================== */
.custom-steps {
  padding: 20px 24px;
  border-bottom: 1px solid $border;
}

.steps-action {
  padding: 14px 24px;
  border-top: 1px solid $border;
  display: flex;
  justify-content: center;
  gap: 12px;
  background: $bg;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 14px;
}

/* ==================== Experiment Description ==================== */
.experiment-desc {
  background: $card;
  border-radius: $radius;
  padding: 20px;

  .toolbar {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .desc-item {
    margin-bottom: 20px;
    border-radius: $radius;
    padding: 16px;
    background: $bg;
  }
}

.desc-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.title-input { flex: 1; }
.editor-wrapper { margin-bottom: 20px; }

/* ==================== Desc Dialog ==================== */
.desc-dialog {
  .desc-item {
    background: $bg;
    border-radius: $radius;
    padding: 20px;
    margin-bottom: 16px;
  }

  .add-desc-btn {
    margin-bottom: 16px;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 2px dashed $border;
    border-radius: $radius;
    color: $text-muted;
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      border-color: $primary;
      color: $primary;
      background: $primary-light;
    }
  }
}

/* ==================== Misc ==================== */
.empty-tip {
  padding: 40px;
  text-align: center;

  .sub-tip {
    color: $text-muted;
    font-size: 14px;
    margin-top: 8px;
  }
}

.alias-tip {
  font-size: 12px;
  color: $text-muted;
  margin-top: 4px;
  line-height: 1.5;
}

.main-content-wrapper {
  background: $card;
  border-radius: $radius;
  border: 1px solid $border;
  margin-top: 20px;
}

/* ==================== Responsive ==================== */
@media screen and (max-width: 768px) {
  .top-actions { flex-wrap: wrap; gap: 8px; }
  .left-area, .right-area { flex: 0 0 auto; }
  .experiment-dialog :deep(.el-dialog) { width: 95% !important; margin: 10px auto; }
  .welcome-content { padding: 32px; margin: 0 16px; }

  .info-banner {
    flex-direction: column;
    align-items: flex-start;

    .banner-left { flex-direction: column; }
    .banner-thumb { width: 100%; height: 160px; }
    .banner-actions { margin-left: 0; margin-top: 12px; align-self: stretch; }
  }
}

/* ==================== Knowledge Ratio Table ==================== */
.knowledge-ratio-section {
  margin-top: 4px;

  .ratio-tip {
    font-size: 12px;
    color: $text-muted;
    margin-bottom: 8px;
    line-height: 1.6;
    padding: 6px 10px;
    background: $bg;
    border-radius: 4px;
    border-left: 3px solid $primary;
  }

  .ratio-table {
    width: 100%;
  }

  .ratio-total {
    margin-top: 8px;
    padding: 6px 12px;
    font-size: 13px;
    color: $text-secondary;
    background: $bg;
    border-radius: 4px;
    text-align: right;

    span {
      color: $text-muted;
      font-size: 12px;
    }

    &.ratio-warning {
      color: #e6a23c;
      background: #fdf6ec;

      span { color: #e6a23c; }
    }
  }
}
</style>

