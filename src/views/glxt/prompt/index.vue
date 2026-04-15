<template>
  <div class="app-container">
    
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="学校类型" prop="schoolType">
        <el-select v-model="queryParams.schoolType" placeholder="请选择学校类型" clearable style="width: 150px;">
          <el-option
            v-for="dict in mt_school_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="学段" prop="educationStageType">
        <el-select v-model="queryParams.educationStageType" placeholder="请选择学段" clearable style="width: 150px;">
          <el-option
            v-for="dict in mt_academic_stage"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="科目" prop="subjectType">
        <el-select v-model="queryParams.subjectType" placeholder="请选择科目" clearable style="width: 150px;">
          <el-option
            v-for="dict in mt_school_subject"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
   
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['glxt:prompt:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['glxt:prompt:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:prompt:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['glxt:prompt:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="promptList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" width="55" type="index" align="center" />
      <el-table-column label="学校类型" align="center" prop="schoolType">
        <template #default="scope">
          <dict-tag :options="mt_school_type" :value="scope.row.schoolType"/>
        </template>
      </el-table-column>
      <el-table-column label="学段" align="center" prop="educationStageType">
        <template #default="scope">
          <dict-tag :options="mt_academic_stage" :value="scope.row.educationStageType"/>
        </template>
      </el-table-column>
      <el-table-column label="科目" align="center" prop="subjectType">
        <template #default="scope">
          <dict-tag :options="mt_school_subject" :value="scope.row.subjectType"/>
        </template>
      </el-table-column>
      <el-table-column label="提示词" align="center" prop="prompt">
        <template #default="scope">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="scope.row.prompt"
            placement="top-start"
            :hide-after="0"
          >
            <span>{{ scope.row.prompt.length > 10 ? scope.row.prompt.slice(0, 30) + '...' : scope.row.prompt }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button plain type="success" icon="Edit" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:prompt:edit']">修改</el-button>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:prompt:remove']">删除</el-button>

        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改ai提示词对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body class="prompt-dialog">
      <el-form ref="promptRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="类型" prop="schoolType">
          <el-radio-group v-model="form.schoolType" >
            <el-radio
              @change="schoolTypeChange(dict.value)"
              v-for="dict in mt_school_type"
              :key="dict.value"
              :value="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
    
      
        <el-form-item label="学段" prop="educationStageType">
          <el-radio-group v-model="form.educationStageType">
            <el-radio
              v-for="dict in form.schoolType=='1'?mt_academic_stage:mt_vocal_education_type"
              :key="dict.value"
              :value="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="学校" prop="schoolId">
          <el-select v-model="form.schoolId" placeholder="请选择学校">
            <el-option
              v-for="dict in form.schoolType=='1'?baseSchoolList:vocalSchoolList"
              :key="dict.id"
              :label="dict.schoolName"
              :value="dict.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="科目" prop="subjectType">
          <el-select v-model="form.subjectType" placeholder="请选择科目">
            <el-option
              v-for="dict in form.schoolType=='1'?mt_school_subject:mt_vocal_school_subject"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本名称" prop="versionArr">
          <el-cascader
                style="width: 100%;"
                v-model="form.versionArr"
                :options="children"
                :props="props"
                separator="-"
                placeholder="版本分册"
                collapse-tags
                clearable/>
        </el-form-item>
        <!-- <el-form-item label="自定义变量" prop="variables" >
          <el-card class="variable-manager" style="width: 100%;">
            <template #header>
              <div class="variable-header">
                <div class="header-left">
                  <el-icon class="header-icon"><Setting /></el-icon>
                  <span class="header-title">变量</span>
                  <el-tooltip effect="light" content="变量能使用户输入表单引入提示词或开场白，你可以试试在提示词中输入 {{input}}" placement="top-start">
                    <el-icon class="header-tip"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
                <el-button type="primary" link @click="startAddVariable" v-if="!showEditArea" class="add-btn">+ 添加</el-button>
              </div>
            </template>
            <div class="variable-desc" >变量能使用户输入表单引入提示词或开场白，你可以试试在提示词中输入 {{input}}</div>
            <el-table v-if="form.variables && form.variables.length && variableDialogVisible" :data="form.variables" size="small" border style="margin-top: 12px;" >
              <el-table-column label="变量类型" prop="variableType" width="120" align="center" />
              <el-table-column label="变量名称" prop="variableName" width="120" align="center" />
              <el-table-column label="类型" prop="fieldType" width="100" align="center">
                <template #default="{ row }">
                  <span v-if="row.fieldType==='text'">文本</span>
                  <span v-else-if="row.fieldType==='select'">下拉选项</span>
                </template>
              </el-table-column>
              <el-table-column label="必填" prop="required" align="center" >
                <template #default="{ row }">
                  <el-icon v-if="row.required == '1'"><Select /></el-icon>
                  <el-icon v-else="row.required == '0'"><CloseBold /></el-icon>
                </template>
              </el-table-column>
        
              
              <el-table-column label="选项" width="180" align="center">

      

                <template #default="{ row }">
                  <span v-if="row.fieldType === 'select'">{{ row.selectData.length > 10 ? row.selectData.split(',').join(' , ') + '...' : row.selectData.split(',').join(' , ') }}</span>
                  <span v-else>无</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template #default="{ row, $index }">
                  <el-button type="primary" link @click="startEditVariable(row, $index)">编辑</el-button>
                  <el-button type="danger" link @click="deleteVariable(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="showEditArea" class="variable-edit-area">
              <div class="edit-row">
                <div class="edit-label">字段类型</div>
                <div class="type-btn-group">
                  <el-radio-group v-model="editingVariable.fieldType" size="default">
                    <el-radio-button label="text">
                      <el-icon style="margin-right:6px;"><Edit /></el-icon>文本
                    </el-radio-button>
                    <el-radio-button label="select">
                      <el-icon style="margin-right:6px;"><List /></el-icon>下拉选项
                    </el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div class="edit-row">
                <div class="edit-label">变量类型</div>
                <el-input v-model="editingVariable.variableType" placeholder="请输入变量类型" maxlength="20" class="edit-input" />
              </div>
              <div class="edit-row">
                <div class="edit-label">变量名称</div>
                <el-input v-model="editingVariable.variableName" placeholder="请输入变量名称" maxlength="20" class="edit-input" />
              </div>
              <div v-if="editingVariable.fieldType==='select'" class="edit-row">
                <div class="edit-label">选项</div>
                <div class="select-options">
                  <div v-for="(opt, idx) in editingVariable.options" :key="idx" class="option-item">
                    <el-input v-model="opt.value" placeholder="请输入选项值" maxlength="20" class="edit-input" />
                    <el-button icon="Delete" @click="removeOption(idx)" type="danger" class="delete-option-btn"/>
                  </div>
                  <el-button type="primary" link icon="Plus" @click="addOption" class="add-option-btn">添加选项</el-button>
                </div>
              </div>
              <div class="edit-row">
                <div class="edit-label">是否必填</div>
                <el-checkbox v-model="editingVariable.required">必填</el-checkbox>
              </div>
              <div class="edit-actions">
                <el-button type="primary" @click="saveVariable" size="default">保存</el-button>
                <el-button @click="cancelEditVariable" size="default">取消</el-button>
              </div>
            </div>
          </el-card>
        </el-form-item> -->
        <el-form-item label="提示词" prop="prompt">
          <el-card style="width: 100%;" shadow="never" class="prompt-card">
            <div class="prompt-header">
              <div class="prompt-header-left">
                <el-tooltip
                  effect="light"
                  content="提示词用于对AI的回复做出一系列指令和约束。这段提示词不会被最终用户所看到"
                  placement="top-start"
                >
                  <el-icon class="header-icon"><Warning /></el-icon>
                </el-tooltip>
                <span class="header-title">提示词内容</span>
              </div>
              <div class="prompt-header-right">
                <el-button
                  type="info"
                  size="small"
                  :icon="MagicStick"
                  @click="handleGeneratePrompt"
                  :disabled="!form.schoolType || !form.educationStageType || !form.subjectType || !form.versionArr?.length"
                >AI生成提示词</el-button>
              </div>
            </div>
            <div class="prompt-editor">
              <el-input 
                v-model="form.prompt" 
                type="textarea" 
                :rows="15" 
                maxlength="5000"
                show-word-limit
                placeholder="请输入提示词，可以使用 {{变量名}} 的方式引用自定义变量"
              />
            </div>
          </el-card>
        </el-form-item>
        <el-form-item label="对话开场白" prop="greeting">
          <el-card style="width: 100%;" shadow="never" class="greeting-card">
            <div class="greeting-header">
              <div class="greeting-header-left">
                <el-tooltip
                  effect="light"
                  content="开场白是用户进入对话时看到的第一条消息"
                  placement="top-start"
                >
                  <el-icon class="header-icon"><ChatDotRound /></el-icon>
                </el-tooltip>
                <span class="header-title">开场白内容</span>
              </div>
            </div>
            <div class="greeting-editor">
              <el-input 
                v-model="form.greeting" 
                type="textarea" 
                :rows="5" 
                maxlength="1000" 
                show-word-limit
                placeholder="请输入对话开场白，可以使用 {{变量名}} 的方式引用自定义变量"
              />
            </div>
          </el-card>
        </el-form-item>
        <el-form-item label="开场问题标签" prop="enableTags">
          <el-switch v-model="form.enableTags" inline-prompt active-text="是" inactive-text="否" />
        </el-form-item>
        <el-collapse-transition>
          <template v-if="form.enableTags">
            <el-card class="tag-manager" shadow="hover">
              <template #header>
                <div class="tag-header">
                  <span class="title">
                    <el-icon><Collection /></el-icon>
                    标签管理
                  </span>
                </div>
              </template>
              <div class="tag-content">
                <div class="tag-section">
                  <div class="section-header">
                    <el-icon><List /></el-icon>
                    <span>选择已有标签</span>
                  </div>
                  <el-select
                    v-model="form.selectedTags"
                    multiple
                    filterable
                    placeholder="请选择已有标签"
                    class="tag-select"
                    @change="handleTagSelect"
                  >
                    <el-option
                      v-for="item in tagsList"
                      :key="item.id"
                      :label="item.tagName"
                      :value="item.id"
                    />
                  </el-select>
                </div>

                <div class="tag-section">
                  <div class="section-header">
                    <el-icon><Plus /></el-icon>
                    <span>新增标签</span>
                  </div>
                  <div class="tag-input-wrapper">
                    <el-input
                      v-model="newTagName"
                      placeholder="请输入新标签名称"
                      @keyup.enter="handleAddNewTag"
                    >
                      <template #append>
                        <el-button type="primary" @click="handleAddNewTag">添加</el-button>
                      </template>
                    </el-input>
                  </div>
                </div>

                <div class="tag-section" v-if="currentTags.length > 0">
                  <div class="section-header">
                    <el-icon><Files /></el-icon>
                    <span>已选标签</span>
                    <el-tooltip
                      content="双击标签可以编辑名称"
                      placement="right"
                      effect="light"
                    >
                      <el-icon class="tip-icon"><InfoFilled /></el-icon>
                    </el-tooltip>
                  </div>
                  <div class="tag-display">
                    <el-tag
                      v-for="tag in currentTags"
                      :key="tag.id"
                      :type="tag.isNew ? 'success' : ''"
                      closable
                      class="tag-item"
                      @close="handleRemoveTag(tag)"
                    >
                      <span v-if="!tag.isEditing" @dblclick="handleEditTagStart(tag)">
                        {{ tag.tagName }}
                      </span>
                      <el-input
                        v-else
                        v-model="tag.editingName"
                        size="small"
                        @blur="handleEditTagComplete(tag)"
                        @keyup.enter="handleEditTagComplete(tag)"
                        v-focus
                      />
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-card>
          </template>
        </el-collapse-transition>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加生成提示词的弹窗 -->
    <el-dialog
      v-model="generateDialogVisible"
      title="AI生成提示词"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-if="generating" class="generating-loading">
        <template v-if="currentStreamText">
          <div class="stream-content">
            <pre>{{ currentStreamText }}</pre>
          </div>
        </template>
        <template v-else>
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在生成中，请稍候...</span>
        </template>
      </div>
      
      <div v-else class="generated-prompts">
        <div v-for="(item, index) in generatedPrompts" :key="index" class="prompt-item">
          <div class="prompt-content">
            <h4>提示词模板 {{index + 1}}</h4>
            <div class="prompt-text">{{item.prompt}}</div>
            <div class="greeting-text">
              <strong>开场白：</strong>{{item.greeting}}
            </div>
          </div>
          <div class="prompt-actions">
            <el-button type="primary" @click="useGeneratedPrompt(item)">使用此模板</el-button>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="generateDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleGeneratePrompt" :loading="generating">
            重新生成
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 变量选项编辑对话框 -->
    <el-dialog
      v-model="optionsDialogVisible"
      title="编辑选项值"
      width="500px"
      append-to-body
    >
      <div class="options-editor">
        <div class="options-list">
          <div v-for="(option, index) in currentVariable.options" :key="index" class="option-item">
            <el-input v-model="option.value" placeholder="请输入选项值">
              <template #append>
                <el-button @click="removeOption(index)" type="danger" link>
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="options-actions">
          <el-button type="primary" @click="addOption">
            <el-icon><Plus /></el-icon>添加选项
          </el-button>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="optionsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveOptions">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Prompt">
import { listPrompt, getPrompt, delPrompt, addPrompt, updatePrompt } from "@/api/glxt/prompt";
// import { Magic } from '@element-plus/icons-vue'
import {
  MagicStick,
  Setting,
  ChatDotRound,
  QuestionFilled,
  Select,
  Hide,
  Delete,
  Plus,
  Edit,
  List
} from '@element-plus/icons-vue'
const { proxy } = getCurrentInstance();


//导入标签 API
import { listTags, getTags, delTags, addTags, updateTags } from "@/api/glxt/tags";


//导入变量API
import { listPromptVariable, getPromptVariable, delPromptVariable, addPromptVariable, updatePromptVariable } from "@/api/glxt/promptVariable";


//导入科目API
import { listSubject, getSubject, delSubject, addSubject, updateSubject, addOrUpdateChapter, delChapter, getChapterList, getChapterMaxId, subjectExist} from "@/api/glxt/subject";
import { selectTextBookLibraryAndVolumeList } from "@/api/glxt/library";
import { ElMessage, ElMessageBox } from 'element-plus'
const { mt_academic_stage, mt_school_subject,mt_vocal_school_subject, mt_textbooklibrary_time, mt_school_type, mt_vocal_education_type } = proxy.useDict('mt_academic_stage', 'mt_school_subject','mt_vocal_school_subject', 'mt_textbooklibrary_time', 'mt_school_type', 'mt_vocal_education_type');
const subjectList = ref([]);



//导入普教学校API
import { baseListSchool } from "@/api/glxt/base_school";

//导入职教学校列表
import { vocalListSchool } from '@/api/glxt/vocal_school'


const promptList = ref([]);
const mtAiPromptVolumeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedMtAiPromptVolume = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");


//列表显示变量
const variableDialogVisible = ref(false);

const props = ref({
  multiple: false,
  checkStrictly: false
});

// 标签选项数据
const tagOptions = ref([
  { value: '重要', label: '重要' },
  { value: '紧急', label: '紧急' },
  { value: '普通', label: '普通' }
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    subjectType: null,
    schoolType: null,
    educationStageType: null,
  },
  rules: {
    subjectType: [
      { required: true, message: "科目不能为空", trigger: "change" }
    ],
    schoolType: [
      { required: true, message: "学校类型不能为空", trigger: "change" }
    ],
    educationStageType: [
      { required: true, message: "学段不能为空", trigger: "change" }
    ],
    schoolId: [
      { required: true, message: "学校不能为空", trigger: "change" }
    ],
    versionArr: [
      { required: true, message: "版本名称不能为空", trigger: "change" }
    ],
    greeting: [
      { required: true, message: "开场白不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);



//获取用户信息
import { getUserProfile } from "@/api/system/user";


const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {}
});

/** 获取用户信息 */
async function getUser() {
  try {
    const response = await getUserProfile();
    state.user = response.data;
    state.roleGroup = response.roleGroup;
    state.postGroup = response.postGroup;
  } catch (error) {
    proxy.$modal.msgError("获取用户信息失败");
  }
};




/** 查询ai提示词列表 */
function getList() {
  loading.value = true;
  listPrompt(queryParams.value).then(response => {
    promptList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
//学校类型改变时，学段改变
const schoolTypeChange = (value) => {
    // 清空学段选择
    queryParams.value.educationStageType = null;
    queryParams.value.subjectType = null;
  //清空学段的数据
    form.value.educationStageType = '1'//默认小学
    if(value == '1'){
        
      getBaseSchoolList();
    }else{
      getVocalSchoolList();
    }
}

/** 获取教材版本-分册列表 */
const libraryList = ref([]);
const children = ref([]);
function getTextBookLibraryAndVolumeList() {
  loading.value = true;
  selectTextBookLibraryAndVolumeList().then(response => {
    libraryList.value = response.data;
    setChildren(libraryList.value);
    loading.value = false;
  });
}

//处理版本名称关数据
function setChildren(data) {
  let dataArr = []
      data.forEach(value => {
        value.isInput = false
        let fDataArr = {
          value: value.id,
          label: value.textbookVersionName,
          children: []
        }

        if (value.mtVolumeList !== null && value.mtVolumeList !== undefined) {
          value.mtVolumeList.forEach(tValue => {
            let tDataArr = {
              value: tValue.id,
              label: tValue.volumeName,
            }
            fDataArr.children.push(tDataArr)
          })
        }
        dataArr.push(fDataArr)
      })
      children.value = dataArr
}



/** 查询职教-学校列表 */
// 搜索表单数据
const searchVocalForm = ref({
  pageNum: 1,
  pageSize: 1000,
  schoolName: '',
  stage: '',
  city: ''
})

const vocalSchoolList = ref([]);
const vocalSchoolTotal = ref([]);
function getVocalSchoolList() {
  // console.log(searchVocalForm.value)
  // loading.value = true;
  vocalListSchool(searchVocalForm.value).then(response => {
    vocalSchoolList.value = response.rows;
    vocalSchoolTotal.value = response.total;
    // loading.value = false;
  });
}



/** 查询普教-学校列表 */
// 搜索表单数据
const searchBaseForm = ref({
  pageNum: 1,
  pageSize: 1000,
  schoolName: '',
  stage: '',
  city: ''
})

const baseSchoolList = ref([]);
const baseSchoolTotal = ref([]);
function getBaseSchoolList() {
  console.log(searchBaseForm.value)
  // loading.value = true;
  baseListSchool(searchBaseForm.value).then(response => {
    baseSchoolList.value = response.rows;
    baseSchoolTotal.value = response.total;
    // loading.value = false;
  });
}




// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    subjectType: null,
    schoolType: null,
    educationStageType: null,
    prompt: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    delFlag: null,
    enableTags: false,
    selectedTags: [],
    tagIds: [],
    variables: [],
  };
  resetTagData();
  proxy.resetForm("promptRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  form.value.schoolType = '1'//默认学校为普教
  currentPromptId.value = null;
  schoolTypeChange('1')//调用普教下的学段
  getTagsList(); // 获取标签列表
  getUser();//获取用户信息
  open.value = true;
  title.value = "添加提示词";
  getTextBookLibraryAndVolumeList();
}

const currentPromptId = ref(null);
/** 修改按钮操作 */
async function handleUpdate(row) {
  schoolTypeChange(row.schoolType)//调用普教下的学段
  getTextBookLibraryAndVolumeList();//获取教材版本-分册列表
  await getTagsList(); // 获取标签列表

  //将提示词 Id 赋值给变量
  variableParams.value.aiPromptId = row.id;
  currentPromptId.value = row.id;

  //根据类型获取学校
  if(row.schoolType == '1'){
    getBaseSchoolList();
  }else{
    getVocalSchoolList();
  }


  reset();
  const _id = row.id || ids.value
  getPrompt(_id).then(response => {
    form.value = response.data;
    //将变量列表中的是否必填进行转换为 boolean
    if(form.value.variables){
      form.value.variables.forEach(variable => {
        variable.required = variable.required === '1' ? true : false;
      });
      variableDialogVisible.value = true;
    }

    // 如果有标签数据，设置标签相关的值
    if (response.data.tags && response.data.tags.length > 0) {
      form.value.enableTags = true;
      const tags = response.data.tags.map(tag => ({
        id: tag.id,
        tagName: tag.tagName,
        isNew: false,
        isEditing: false
      }));
      currentTags.value = tags;
      form.value.selectedTags = response.data.selectedTags;
    }
    open.value = true;
    title.value = "修改提示词";
  });

  // //获取变量列表
  // getVariableList();
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["promptRef"].validate(async valid => {
    if (valid) {
      await handleSubmitWithTags();
      if (form.value.id != null) {
        updatePrompt(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        
        });
      } else {
        addPrompt(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
          
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除ai提示词编号为"' + _ids + '"的数据项？').then(function() {
    return delPrompt(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** ai提示词管理分册序号 */
function rowMtAiPromptVolumeIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** ai提示词管理分册添加按钮操作 */
function handleAddMtAiPromptVolume() {
  let obj = {};
  obj.textbookLibraryId = "";
  obj.volumeId = "";
  mtAiPromptVolumeList.value.push(obj);
}

/** ai提示词管理分册删除按钮操作 */
function handleDeleteMtAiPromptVolume() {
  if (checkedMtAiPromptVolume.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的ai提示词管理分册数据");
  } else {
    const mtAiPromptVolumes = mtAiPromptVolumeList.value;
    const checkedMtAiPromptVolumes = checkedMtAiPromptVolume.value;
    mtAiPromptVolumeList.value = mtAiPromptVolumes.filter(function(item) {
      return checkedMtAiPromptVolumes.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleMtAiPromptVolumeSelectionChange(selection) {
  checkedMtAiPromptVolume.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/prompt/export', {
    ...queryParams.value
  }, `prompt_${new Date().getTime()}.xlsx`)
}

// 标签相关数据
const tagsList = ref([]); // 所有可用标签列表
const currentTags = ref([]); // 当前提示词的标签
const newTagName = ref(''); // 新标签名称输入
const tagParams = ref({
  pageNum: 1,
  pageSize: 1000,
})

// 自定义指令：自动聚焦
const vFocus = {
  mounted: (el) => el.querySelector('input')?.focus()
};

// 获取所有标签列表
const getTagsList = async () => {
  try {
    const res = await listTags(tagParams.value);
    tagsList.value = res.rows || [];
  } catch (error) {
    console.error('获取标签列表失败:', error);
  }
};

// 处理标签选择
const handleTagSelect = (selectedIds) => {
  // 保存当前的新添加和编辑中的标签
  const specialTags = currentTags.value.filter(tag => tag.isNew || tag.isEditing);
  
  // 更新当前标签列表
  const selectedTags = selectedIds.map(id => {
    const tag = tagsList.value.find(t => t.id === id);
    if (tag) {
      return {
        id: tag.id,
        tagName: tag.tagName,
        isNew: false,
        isEditing: false
      };
    }
    return null;
  }).filter(Boolean);
  
  // 合并已选标签和特殊标签，确保不重复
  const uniqueTags = [...selectedTags];
  specialTags.forEach(tag => {
    if (!uniqueTags.some(t => t.id === tag.id)) {
      uniqueTags.push(tag);
    }
  });
  
  currentTags.value = uniqueTags;
};

// 添加新标签
const handleAddNewTag = async () => {
  console.log('newTagName.value')
  if (!newTagName.value.trim()) {
    proxy.$modal.msgError("标签名称不能为空");
    return;
  }

  try {
    // 添加新标签
    const res = await addTags({
      tagName: newTagName.value.trim(),
      promptId: form.value.id
    });

    if(res.data === 0) {
      proxy.$modal.msgError("添加标签失败");
    }
    // 构造新标签对象
    const newTag = {
      id: res.data,
      tagName: newTagName.value.trim(),
      isNew: true,
      isEditing: false
    };

    // 添加到当前标签列表
    currentTags.value.push(newTag);
    
    // 更新已选标签ID列表
    form.value.selectedTags = [...(form.value.selectedTags || []), newTag.id];

    // 清空输入
    newTagName.value = '';
    
    // 刷新标签列表并更新选中状态
    await getTagsList();
    // 确保新标签在列表中显示为选中状态
    if (form.value.selectedTags) {
      const selectedIds = form.value.selectedTags;
      handleTagSelect(selectedIds);
    }

    proxy.$modal.msgSuccess("添加标签成功");
  } catch (error) {
    console.error('添加标签失败:', error);
    proxy.$modal.msgError("添加标签失败");
  }
};

// 开始编辑标签
const handleEditTagStart = (tag) => {
  tag.isEditing = true;
  tag.editingName = tag.tagName;
};

// 完成编辑标签
const handleEditTagComplete = async (tag) => {
  if (!tag.editingName || tag.editingName.trim() === '') {
    proxy.$modal.msgError("标签名称不能为空");
    tag.editingName = tag.tagName;
    tag.isEditing = false;
    return;
  }

  if (tag.editingName === tag.tagName) {
    tag.isEditing = false;
    return;
  }

  try {
    // 调用更新标签API
    await updateTags({
      id: tag.id,
      tagName: tag.editingName.trim(),
      promptId: form.value.id
    });

    // 更新标签名称
    tag.tagName = tag.editingName.trim();
    tag.isEditing = false;

    // 刷新标签列表
    await getTagsList();

    proxy.$modal.msgSuccess("修改标签成功");
  } catch (error) {
    console.error('修改标签失败:', error);
    proxy.$modal.msgError("修改标签失败");
    tag.editingName = tag.tagName;
    tag.isEditing = false;
  }
};

// 移除标签
const handleRemoveTag = (tag) => {
  currentTags.value = currentTags.value.filter(t => t.id !== tag.id);
  form.value.selectedTags = currentTags.value
    .filter(t => !t.isNew)
    .map(t => t.id);
};

// 在表单提交时处理标签
const handleSubmitWithTags = async () => {
  if (form.value.enableTags) {
    form.value.tagIds = currentTags.value.map(tag => tag.id);
  } else {
    form.value.tagIds = [];
    currentTags.value = [];
    form.value.selectedTags = [];
  }
};

// 重置表单时重置标签相关数据
const resetTagData = () => {
  currentTags.value = [];
  form.value.selectedTags = [];
  form.value.enableTags = false;
  newTagName.value = '';
};

// 添加生成默认提示词的函数
const generateDefaultPrompt = () => {
  if (form.value.prompt) return; // 已有内容不覆盖
  const { schoolType, educationStageType, subjectType, versionArr } = form.value;
  
  // 如果必要的字段未填写完整，则不生成
  if (!schoolType || !educationStageType || !subjectType || !versionArr?.length) {
    return;
  }

  // 获取学校类型文本
  const schoolTypeText = mt_school_type.value.find(item => item.value === schoolType)?.label || '';
  
  // 获取学段文本
  const stageList = schoolType === '1' ? mt_academic_stage.value : mt_vocal_education_type.value;
  const stageText = stageList.find(item => item.value === educationStageType)?.label || '';
  
  // 获取科目文本
  const subjectList = schoolType === '1' ? mt_school_subject.value : mt_vocal_school_subject.value;
  const subjectText = subjectList.find(item => item.value === subjectType)?.label || '';
  
  // 获取版本名称
  const versionText = children.value.find(item => item.value === versionArr[0])?.label || '';
  const volumeText = children.value
    .find(item => item.value === versionArr[0])
    ?.children.find(child => child.value === versionArr[1])?.label || '';

  // 生成默认提示词
  const defaultPrompt = `你现在是一位经验丰富的${schoolTypeText}-${stageText}-${subjectText}老师，精通${versionText}-${volumeText}教材的教学。
    请你基于以下原则进行回答：

    1. 教学内容严格遵循教材要求和教学大纲
    2. 回答要符合${stageText}学生的认知水平和学习特点
    3. 结合${subjectText}学科特点，注重知识点的连贯性和系统性
    4. 适时融入趣味性内容，提高学生学习兴趣
    5. 注重培养学生的思维能力和解决问题的能力
    6. 关注学科核心素养的培养
    7. 适当融入生活实例，体现学以致用

    在回答问题时，你应该：
    - 使用清晰易懂的语言
    - 循序渐进地讲解知识点
    - 适时提供具体的例子
    - 注意知识点的难度梯度
    - 适当设置启发性问题
    - 关注重点、难点内容
    - 注重与其他知识点的关联`;

  // 设置默认提示词
  form.value.prompt = defaultPrompt;

  // 设置默认开场白
  form.value.greeting = `你好！我是你的${subjectText}学习助手。让我们一起探索${versionText}${volumeText}的知识吧！有什么问题都可以问我哦！`;
};

// 监听相关字段变化
watch(
  () => [form.value.schoolType, form.value.educationStageType, form.value.subjectType, form.value.versionArr],
  () => {
    generateDefaultPrompt();
  },
  { deep: true }
);

// 添加生成提示词相关的状态
const generateDialogVisible = ref(false);
const generating = ref(false);
const generatedPrompts = ref([]);

// 处理生成提示词按钮点击
const handleGeneratePrompt = async () => {
  const { schoolType, educationStageType, subjectType, versionArr, schoolId } = form.value;
  
  // 获取各种文本描述
  const schoolTypeText = mt_school_type.value.find(item => item.value === schoolType)?.label || '';
  const stageList = schoolType === '1' ? mt_academic_stage.value : mt_vocal_education_type.value;
  const stageText = stageList.find(item => item.value === educationStageType)?.label || '';
  const subjectList = schoolType === '1' ? mt_school_subject.value : mt_vocal_school_subject.value;
  const subjectText = subjectList.find(item => item.value === subjectType)?.label || '';
  const versionText = children.value.find(item => item.value === versionArr[0])?.label || '';
  const volumeText = children.value
    .find(item => item.value === versionArr[0])
    ?.children.find(child => child.value === versionArr[1])?.label || '';

  // 获取学校名称
  const currentSchoolList = schoolType === '1' ? baseSchoolList.value : vocalSchoolList.value;
  const schoolName = currentSchoolList.find(school => school.id === schoolId)?.schoolName || '';

  generateDialogVisible.value = true;
  generating.value = true;

  try {
    // 构造请求参数
    const requestData = {
      inputs: {
        school_type: schoolTypeText,
        school_level: stageText,
        school_name: schoolName,
        subject: subjectText,
        textbook_version: `${versionText}-${volumeText}`,
        variables: form.value.variables.map(v => ({
          name: v.name,
          type: v.type,
          description: v.description,
          options: v.options || []
        }))
      },
      query: "请根据相关条件生成提示词和开场白",
      response_mode: "streaming",
      conversation_id: "",
      user: `${state.user.userName}_${state.user.userId}`,
      files: []
    };

    // 调用API自动生成提示词和开场白
    const response = await fetch('http://172.31.32.147/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-VoACD2wsWa9cUguDd7LePmGO',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    // 处理流式响应
    const reader = response.body.getReader();
    let result = '';
    let currentStreamText = ref(''); // 用于存储当前的流式文本

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // 将 Uint8Array 转换为文本
      const text = new TextDecoder().decode(value);
      
      // 按照 \n\n 分割数据块
      const chunks = text.split('\n\n');
      
      for (const chunk of chunks) {
        if (chunk.startsWith('data: ')) {
          try {
            // 移除 'data: ' 前缀并解析 JSON
            const jsonStr = chunk.replace('data: ', '');
            const data = JSON.parse(jsonStr);
            
            if (data.event === 'message' && data.answer) {
              // 移除 think 标签内容
              const cleanAnswer = data.answer.replace(/<think>[\s\S]*?<\/think>/g, '');
              result += cleanAnswer;
              console.log('result');
              console.log(result);
              console.log('result');
              
              // 更新流式显示的文本
              currentStreamText.value = result;
            }
          } catch (error) {
            console.error('解析数据块失败:', error);
          }
        }
      }
    }

    // 解析最终的 JSON 结果
    if (result) {
      try {
        // 移除所有的 think 标签内容
        let cleanResult = result.replace(/<think>[\s\S]*?<\/think>/g, '');
        
        // 移除 markdown 代码块标记
        cleanResult = cleanResult.replace(/```json\s*/, '');
        cleanResult = cleanResult.replace(/```\s*$/, '');
        
        // 尝试解析 JSON
        const jsonResult = JSON.parse(cleanResult);
        
        // 提取 prompts 数组中的提示词和开场白
        if (jsonResult.prompts && Array.isArray(jsonResult.prompts)) {
          generatedPrompts.value = jsonResult.prompts.map(template => ({
            prompt: template.content,
            greeting: template.opening
          }));
          // 清空流式显示的文本
          currentStreamText.value = '';
        } else {
          throw new Error('未找到有效的提示词数组');
        }
      } catch (error) {
        console.error('解析JSON结果失败:', error, '\n原始数据:', result);
        throw new Error('解析响应数据失败');
      }
    } else {
      throw new Error('未收到有效的响应数据');
    }
    
    generating.value = false;
  } catch (error) {
    console.error('生成提示词失败:', error);
    proxy.$modal.msgError("生成提示词失败，请重试");
    generating.value = false;
    generateDialogVisible.value = false;
  }
};

// 使用选中的提示词
const useGeneratedPrompt = (item) => {
  form.value.prompt = item.prompt;
  form.value.greeting = item.greeting;
  generateDialogVisible.value = false;
  proxy.$modal.msgSuccess("应用提示词成功");
};

// 添加自定义变量相关的数据
const optionsDialogVisible = ref(false);
const currentVariable = ref({
  options: []
});


// 添加选项
// const addOption = () => {
//   currentVariable.value.options.push({ value: '' });
// };

// 删除选项
// const removeOption = (index) => {
//   currentVariable.value.options.splice(index, 1);
// };

// 保存选项
const saveOptions = () => {
  const variable = form.value.variables.find(v => v.name === currentVariable.value.name);
  if (variable) {
    variable.options = currentVariable.value.options;
  }
  optionsDialogVisible.value = false;
};

// 变量编辑相关
const editingVariable = ref({
  name: '',
  label: '',
  aiPromptId: null,
  fieldType: 'text',
  variableType: '',
  variableName: '',
  selectData: null,

  type: 'text',
  required: true,
  hide: false,
  options: []
});

// 表单重置
function resetVariable() {
  editingVariable.value = {
    id: null,
    fieldType: null,
    variableType: null,
    variableName: null,
    required: null,
    selectData: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    delFlag: null,
    options: []
  };
  
}

const editingIndex = ref(-1);
const showEditArea = ref(false);

// 获取所有变量列表
const variableParams = ref({
  pageNum: 1,
  pageSize: 1000,
  aiPromptId: null
})
// const variableList = ref([]);
const getVariableList = async () => {
  try {
    const res = await listPromptVariable(variableParams.value);
    form.value.variables = res.rows || [];
    console.log('form.value.variables');
    console.log(form.value.variables);
    console.log('variableList.value');
  } catch (error) {
    console.error('获取变量列表失败:', error);
  }
};


//点击添加变量按钮
const startAddVariable = () => {
  resetVariable();
  // variableDialogVisible.value = !variableDialogVisible.value;//隐藏列表
  // editingVariable.value = { name: '', label: '', type: 'text', required: true, hide: false, options: [] };
  // editingVariable.value = { name: '', label: '', fieldType: 'text', required: true, hide: false, options: [] };
  if(form.value.variables){
    variableDialogVisible.value = false;
  }
  editingVariable.value.fieldType = 'text';
  editingIndex.value = -1;
  showEditArea.value = true;
};

//编辑变量
const startEditVariable = (row, idx) => {
  resetVariable();
  // variableDialogVisible.value = !variableDialogVisible.value;//隐藏列表
  // editingVariable.value = JSON.parse(JSON.stringify(row));
  if(form.value.variables){
    variableDialogVisible.value = false;
  }
  //根据Id 获取变量数据
  getPromptVariable(row.id).then(response => {
    if (response.code === 200) {
      editingVariable.value = response.data;
      editingVariable.value.required = editingVariable.value.required === '1' ? true : false;
      editingIndex.value = idx;
      showEditArea.value = true;
    } else {
      proxy.$modal.msgError(response.msg);
    }
  });
  
};

//保存变量
const saveVariable = () => {
  if (!editingVariable.value.variableName) {
    proxy.$modal.msgError('变量名称不能为空');
    return;
  }
  if (!editingVariable.value.variableType) {
    proxy.$modal.msgError('变量类型不能为空');
    return;
  }
  if (editingVariable.value.fieldType === 'select' && (!editingVariable.value.options.length || editingVariable.value.options.some(opt => !opt.value))) {
    proxy.$modal.msgError('下拉选项不能为空');
    return;
  }
  
  if (!form.value.variables) form.value.variables = [];
  editingVariable.value.required = editingVariable.value.required ? '1' : '0';
  if (editingIndex.value === -1) {
    // form.value.variables.push(JSON.parse(JSON.stringify(editingVariable.value)));
    // 添加新变量
    //先判断是否是下拉选项 然后将option数组转换为字符串
    if (editingVariable.value.fieldType === 'select') {
      editingVariable.value.selectData = editingVariable.value.options.map(opt => opt.value).join(',');
    }

    
    editingVariable.value.aiPromptId = currentPromptId.value;
    console.log(editingVariable.value.aiPromptId);
    console.log(editingVariable.value.aiPromptId);
    console.log(editingVariable.value.aiPromptId);
    addPromptVariable(editingVariable.value).then(response => {
      if (response.code === 200) {
        proxy.$modal.msgSuccess("新增成功");
        getVariableList();
        showEditArea.value = false;
        variableDialogVisible.value = true;
      } else {
        proxy.$modal.msgError(response.msg);
      }
    });
    console.log(editingVariable.value);
  } else {
    // form.value.variables.splice(editingIndex.value, 1, JSON.parse(JSON.stringify(editingVariable.value)));
    // 更新变量
    updatePromptVariable(editingVariable.value).then(response => {
      if (response.code === 200) {
        proxy.$modal.msgSuccess("更新成功");
        getVariableList();
        showEditArea.value = false;
        variableDialogVisible.value = true;
      } else {
        proxy.$modal.msgError(response.msg);
      }
    });
  }
  showEditArea.value = false;
};

//取消编辑变量按钮
const cancelEditVariable = () => {
  // variableDialogVisible.value = !variableDialogVisible.value;//显示列表
  resetVariable();
  if(form.value.variables){
    variableDialogVisible.value = true;
  }
  showEditArea.value = false;
};

//删除变量
const deleteVariable = (row) => {
  // form.value.variables.splice(idx, 1);
  ElMessageBox.confirm(
    `确定要删除变量 「${row.variableName}」 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除逻辑
    delPromptVariable(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getVariableList();  
        if(form.value.variables){
          variableDialogVisible.value = true;
        }
      }else {
        ElMessage.error('删除失败')
      }
    });
  }).catch(() => {
    ElMessage.info('取消删除')
  })
};


//添加选项
const addOption = () => {
  editingVariable.value.options.push({ value: '' });
};

//删除选项
const removeOption = (idx) => {
  editingVariable.value.options.splice(idx, 1);
};


getList();
</script>

<style>
/* tooltip样式需要放在全局作用域中 */
.el-tooltip__popper {
  max-width: 400px !important;
  max-height: 300px !important;
  overflow-y: auto !important;
  line-height: 1.5 !important;
  word-break: break-all !important;
  white-space: pre-wrap !important;
}
</style>

<style scoped>
.tag-manager {
  margin: 10px 0 0 40px;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  transition: all 0.3s ease;
}

.tag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag-header .title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-content {
  padding: 0;
}

.tag-section {
  padding: 16px 0;
}

.tag-section:not(:last-child) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: var(--el-text-color-regular);
  font-size: 14px;
  font-weight: 500;
}

.tip-icon {
  margin-left: 4px;
  font-size: 14px;
  color: var(--el-color-info);
  cursor: help;
}

.tag-select {
  width: 100%;
}

.tag-input-wrapper {
  display: flex;
  align-items: center;
  z-index: 1000;
}

.tag-input-wrapper :deep(.el-input-group__append) {
  padding: 0;
  background-color: var(--el-color-primary);
}

.tag-input-wrapper :deep(.el-input-group__append button) {
  border: none;
  height: 32px;
  padding: 0 40px;
  color: white;
}

.tag-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  min-height: 30px;
  background-color: var(--el-fill-color-blank);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  max-width: 200px;
  transition: all 0.3s ease;
}

.tag-item:hover {
  transform: translateY(-1px);
}

.tag-item :deep(.el-input__inner) {
  height: 20px;
  line-height: 20px;
}

:deep(.el-card__header) {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

:deep(.el-collapse-transition) {
  transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out;
}

:deep(.el-select .el-select__tags .el-tag) {
  background-color: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  height: 32px;
}

.prompt-header {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prompt-icon {
  font-size: 16px;
  color: var(--el-color-info);
  cursor: help;
  margin-left: 4px;
}

.generating-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--el-text-color-secondary);
}

.generating-loading .el-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: var(--el-color-primary);
}

.stream-content {
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
  margin-bottom: 20px;
}

.stream-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: monospace;
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

.generated-prompts {
  max-height: 600px;
  overflow-y: auto;
}

.prompt-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: var(--el-bg-color);
  transition: all 0.3s ease;
}

.prompt-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.prompt-content h4 {
  margin: 0 0 15px 0;
  color: var(--el-color-primary);
  font-size: 16px;
}

.prompt-text {
  white-space: pre-line;
  line-height: 1.6;
  margin-bottom: 15px;
  color: var(--el-text-color-primary);
}

.greeting-text {
  padding: 10px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
  margin-bottom: 15px;
  color: var(--el-text-color-regular);
}

.prompt-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.prompt-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.variable-manager {
  /* margin-bottom: 20px; */
  background: #f7f9fb;
  border-radius: 10px;
  border: none;
  box-shadow: none;
  /* padding: 24px 32px 18px 32px; */
}

.header-left {
  display: flex;
  align-items: center;
  /* gap: 4px; */
}

.header-icon {
  font-size: 14px;
  /* color: #409EFF; */
  color: gray;
}

/* 变量.提示词.开场白标题 */
.header-title{
  color: gray;
  font-size: 15px;
  font-weight: 500;
  margin-left: 4px;
}

/* 变量提示 */
.header-tip {
  font-size: 16px;
  color: #bfc8d7;
  margin-left: 4px;
}

/* 添加变量按钮 */
.add-btn {
  margin-left: auto;
  font-size: 15px;
}

.variable-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* padding-left: 40px; */
  padding-right: 16px;
}
.variable-desc {
  color: #7a869a;
  font-size: 15px;
  margin-bottom: 8px;
  margin-top: 2px;
}
.variable-edit-area {
  background: #fff;
  border-radius: 10px;
  margin: 10px 0 0 0;
  padding: 32px 40px 24px 40px;
  /* box-shadow: 0 4px 24px 0 rgba(0,0,0,0.06); */
  /* border: 1px solid #e5e6eb; */
  /* max-width: 420px; */
}
.edit-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.edit-label {
  width: 90px;
  color: #6b778c;
  font-size: 16px;
  text-align: left;
  margin-right: 0;
  flex-shrink: 0;
}
.edit-input {
  width: 100%;
  font-size: 16px;
}
.type-btn-group :deep(.el-radio-button) {
  /* width: 100px; */
  height: 30px;
  font-size: 16px;
  /* margin-right: 16px; */
}
.select-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}
.add-option-btn {
  margin-top: 6px;
  padding-left: 0;
  font-size: 15px;
  border: 1px solid #dcdfe6;
  height: 30px;
}

/* .add-option-btn:hover {
  border: 1px solid #409EFF;
  color: #409EFF;
} */

.delete-option-btn{
  margin-left: 4px;
}

.delete-option-btn:hover {
  /* color: #f56c6c; */
}
.checkbox-row {
  margin-bottom: 18px;
  margin-left: 90px;
  gap: 110px;
}
.edit-actions {
  margin-top: 10px;
  text-align: right;
}
:deep(.el-table) {
  font-size: 14px;
  --el-table-border-color: #e5e6eb;
  --el-table-header-bg-color: #f7f9fb;
}
:deep(.el-table th) {
  background-color: #f7f9fb;
  font-weight: 500;
  color: #6b778c;
}
</style>
