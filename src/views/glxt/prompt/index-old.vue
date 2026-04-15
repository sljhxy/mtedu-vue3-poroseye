<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
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
      <el-table-column label="提示词" align="center" prop="prompt" />
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
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
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
        <el-form-item label="提示词" prop="prompt">
          <el-input v-model="form.prompt" placeholder="请输入提示词"  type="textarea" 
          :rows="20" maxlength="5000"
          show-word-limit/>
        </el-form-item>
        <el-form-item label="对话开场白" prop="greeting">
          <el-input v-model="form.greeting" placeholder="请输入对话开场白" type="textarea" 
          :rows="5" maxlength="1000" show-word-limit/>
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
  </div>
</template>

<script setup name="Prompt">
import { listPrompt, getPrompt, delPrompt, addPrompt, updatePrompt } from "@/api/glxt/prompt";

const { proxy } = getCurrentInstance();


//导入标签 API
import { listTags, getTags, delTags, addTags, updateTags } from "@/api/glxt/tags";

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
    tagIds: []
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
  schoolTypeChange('1')//调用普教下的学段
  getTagsList(); // 获取标签列表
  open.value = true;
  title.value = "添加提示词";
  getTextBookLibraryAndVolumeList();
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  schoolTypeChange(row.schoolType)//调用普教下的学段
  getTextBookLibraryAndVolumeList();//获取教材版本-分册列表
  await getTagsList(); // 获取标签列表

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

getList();
</script>

<style scoped>
.tag-manager {
  margin: 10px 0 0 40px;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  transition: all 0.3s ease;
}

.tag-manager:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag-header .title {
  font-size: 16px;
  font-weight: 600;
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

/* .tag-input-wrapper :deep(.el-input-group__append button:hover) {
  color: white;
  background-color: var(--el-color-primary-light-3);
} */

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
</style>
