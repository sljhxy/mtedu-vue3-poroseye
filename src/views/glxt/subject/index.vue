<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="40px">
      <el-form-item label="类型" prop="schoolType" >
        <el-select v-model="queryParams.schoolType" clearable style="width: 100px;" :disabled="isTeacher" @change="schoolTypeChange">
          <el-option
            v-for="dict in mt_school_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学段" prop="educationStageType">
        <el-select v-model="queryParams.educationStageType" clearable style="width: 100px;" :disabled="!queryParams.schoolType" @change="educationStageTypeChange">
          <el-option
            v-for="dict in queryParams.schoolType=='1'?mt_academic_stage:mt_vocal_education_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="科目" prop="subjectType" >
        <el-select v-model="queryParams.subjectType" clearable style="width: 100px;" :disabled="!queryParams.schoolType && !queryParams.educationStageType">
          <el-option
            v-for="dict in queryParams.schoolType=='1'?mt_school_subject:mt_vocal_school_subject"
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
          v-hasPermi="['glxt:subject:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          color="#6EDC93"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['glxt:subject:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:subject:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['glxt:subject:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="subjectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" prop="id" width="50px"/>
         <el-table-column label="封面" align="center" prop="coverImg" width="100">
        <template #default="scope">
          <el-image
            v-if="scope.row.coverImg"
            :src="scope.row.coverImg"
            
            fit="cover"
            class="table-cover-thumb"
          />
          <!-- :preview-src-list="[scope.row.coverImg]" -->
          <div v-else class="table-cover-placeholder"></div>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="schoolType">
        <template #default="scope">
          <dict-tag :options="mt_school_type" :value="scope.row.schoolType"/>
        </template>
      </el-table-column>
      <el-table-column label="学段" align="center" prop="educationStageType">
        <template #default="scope">
          <dict-tag :options="scope.row.schoolType == '1'?mt_academic_stage:mt_vocal_education_type" :value="scope.row.educationStageType"/>
        </template>
      </el-table-column>
      <el-table-column label="科目" align="center" prop="subjectType">
        <template #default="scope">
          <dict-tag :options="scope.row.schoolType=='1'?mt_school_subject:mt_vocal_school_subject" :value="scope.row.subjectType"/>
        </template>
      </el-table-column>
      <el-table-column label="版本名称" align="center" prop="textbookVersionName"/>
      <el-table-column label="分册名称" align="center" prop="volumeName"/>
      <el-table-column label="发行时间" align="center" prop="versionReleaseTimeType">
        <template #default="scope">
          <dict-tag :options="mt_textbooklibrary_time" :value="scope.row.versionReleaseTimeType"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200px">
        <template #default="scope">
          <el-button plain type="success" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:subject:edit']">修改</el-button>
          <el-button plain type="danger" @click="handleDelete(scope.row)" v-hasPermi="['glxt:subject:remove']">删除</el-button>
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

    <!-- 添加或修改科目对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body class="subject-dialog">
      <div class="subject-form-container">
        <!-- 左侧：封面预览区域 -->
        <div class="cover-section">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            :before-upload="beforeUpload"
            :action="uploadUrl"
            :headers="uploadHeaders"
            accept="image/*"
            :disabled="uploading"
          >
            <div class="cover-preview" :class="{ 'has-cover': form.coverImg, 'is-uploading': uploading }">
              <!-- 上传中的遮罩层 -->
              <div v-if="uploading" class="uploading-mask">
                <el-icon class="is-loading" :size="32" color="#6EDC93">
                  <Loading />
                </el-icon>
                <div class="uploading-text">上传中... {{ uploadProgress }}%</div>
                <el-progress
                  :percentage="uploadProgress"
                  :stroke-width="3"
                  :show-text="false"
                  color="#6EDC93"
                  class="upload-progress"
                />
              </div>

              <el-image
                v-if="form.coverImg && !uploading"
                :src="form.coverImg"
                fit="cover"
                class="cover-image"
                :preview-src-list="[form.coverImg]"
              />
              <template v-else-if="!uploading">
                <div class="cover-placeholder">
                  <el-icon :size="48" color="#6EDC93">
                    <Plus />
                  </el-icon>
                  <div class="placeholder-text">点击上传封面</div>
                  <div class="placeholder-hint">支持 JPG、PNG 格式，最大 10MB</div>
                </div>
              </template>
              <div v-if="form.coverImg && !uploading" class="cover-mask">
                <el-icon :size="24" color="#fff">
                  <Edit />
                </el-icon>
                <div class="mask-text">点击更换</div>
              </div>
            </div>
          </el-upload>
          <div class="cover-tip">建议尺寸 240×180px (3:4)，不超过 10MB</div>
        </div>

        <!-- 右侧：表单字段 -->
        <div class="form-section">
          <el-form ref="subjectRef" :model="form" :rules="rules" label-width="90px" class="subject-form">
            <!-- 基本信息 -->
            <div class="form-group">
              <div class="group-title">基本信息</div>
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
              <el-form-item label="科目" prop="subjectType">
                <el-select v-model="form.subjectType" placeholder="请选择科目" style="width: 100%;">
                  <el-option
                    v-for="dict in form.schoolType=='1'?mt_school_subject:mt_vocal_school_subject"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="发行时间" prop="versionReleaseTimeType">
                <el-select v-model="form.versionReleaseTimeType" placeholder="请选择版本发行时间" style="width: 100%;">
                  <el-option
                    v-for="dict in mt_textbooklibrary_time"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>

            <!-- 版本信息 -->
            <div class="form-group">
              <div class="group-title">版本信息</div>
              <el-form-item label="版本名称" prop="versionArr">
                <el-cascader
                  style="width: 100%;"
                  v-model="form.versionArr"
                  :options="children"
                  :props="props"
                  separator="-"
                  placeholder="版本分册"
                  collapse-tags
                  clearable
                />
              </el-form-item>
            </div>

            <!-- 章节摘要 -->
            <div class="form-group chapter-summary" v-if="form.id">
              <div class="group-title">章节体系</div>
              <div class="chapter-summary-content">
                <div class="chapter-stats">
                  <el-icon :size="20" color="#6EDC93">
                    <Document />
                  </el-icon>
                  <span class="stats-text">
                    共 <strong>{{ chapterCount }}</strong> 个章节
                  </span>
                </div>
                <el-button type="primary" size="small" @click="openChapterDrawer">
                  <el-icon><Setting /></el-icon>
                  管理章节
                </el-button>
              </div>
            </div>
          </el-form>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 章节管理抽屉 -->
    <el-drawer
      v-model="chapterDrawerVisible"
      title="章节管理"
      direction="rtl"
      size="600px"
      class="chapter-drawer"
    >
      <div class="chapter-drawer-content">
        <!-- 工具栏 -->
        <div class="chapter-toolbar">
          <el-input
            v-model="chapterSearchKeyword"
            placeholder="搜索章节..."
            prefix-icon="Search"
            style="width: 200px;"
            clearable
          />
          <div class="toolbar-actions">
            <el-button type="primary" :icon="Plus" @click="handleAddChapter(form.volumeId, form.id)">
              添加章节
            </el-button>
            <el-button :icon="Download" @click="exportChapters">
              导出
            </el-button>
          </div>
        </div>

        <!-- 章节列表 -->
        <div class="chapter-list-container">
          <el-empty v-if="filteredChapters.length === 0" description="暂无章节内容">
            <template #image>
              <el-icon :size="80" color="#d0d0d0">
                <Document />
              </el-icon>
            </template>
            <template #extra>
              <el-button type="primary" @click="handleAddChapter(form.volumeId, form.id)">
                添加第一个章节
              </el-button>
            </template>
          </el-empty>

          <div v-else class="chapter-tree-wrapper">
            <el-tree
              ref="chapterTreeRef"
              :data="filteredChapters"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              :highlight-current="true"
              class="chapter-tree-modern"
            >
              <template #default="{ node, data }">
                <div class="chapter-node" :class="{ 'is-editing': data.id === editingId }">
                  <div class="chapter-content">
                    <el-icon class="chapter-icon">
                      <Folder v-if="node.level === 1" />
                      <Document v-else />
                    </el-icon>
                    <template v-if="data.id === editingId">
                      <el-input
                        v-model="data.chapterTxt"
                        placeholder="请输入章节内容"
                        @blur="cancelEdit"
                        @keyup.enter="saveCurrentInp(data, node, form.volumeId, form.id)"
                        size="small"
                        ref="editInputRef"
                      />
                    </template>
                    <template v-else>
                      <span class="chapter-text">{{ data.chapterTxt }}</span>
                    </template>
                  </div>
                  <div class="chapter-actions">
                    <el-button
                      v-if="node.level < 3"
                      type="primary"
                      link
                      :icon="Plus"
                      @click.stop="appendChapter(data, node, form.volumeId, form.id)"
                    >
                      添加
                    </el-button>
                    <el-button
                      type="primary"
                      link
                      :icon="Edit"
                      @click.stop="updateChapter(data)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      :icon="Delete"
                      @click.stop="removeChapter(node, data, form.volumeId, form.id)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </template>
            </el-tree>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="chapterDrawerVisible = false">取消</el-button>
          <el-button type="primary" @click="saveChapters">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="Subject">
import { listSubject, getSubject, delSubject, addSubject, updateSubject, addOrUpdateChapter, delChapter, getChapterList, getChapterMaxId, subjectExist} from "@/api/glxt/subject";
import { selectTextBookLibraryAndVolumeList } from "@/api/glxt/library";
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Plus, Edit, Document, Setting, Folder, Delete, Search, Download, Loading } from '@element-plus/icons-vue'
import { useTeacherInfo } from '@/store/modules/teacherInfo'
const { proxy } = getCurrentInstance();
const { mt_academic_stage, mt_school_subject,mt_vocal_school_subject, mt_textbooklibrary_time, mt_school_type, mt_vocal_education_type } = proxy.useDict('mt_academic_stage', 'mt_school_subject','mt_vocal_school_subject', 'mt_textbooklibrary_time', 'mt_school_type', 'mt_vocal_education_type');
const { isTeacher, schoolType: userSchoolType } = useTeacherInfo()
const subjectList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const props = ref({
  multiple: false,
  checkStrictly: false
});

// 章节抽屉相关
const chapterDrawerVisible = ref(false);
const chapterSearchKeyword = ref('');
const chapterCount = ref(0);
const chapterTreeRef = ref(null);
const editInputRef = ref(null);

// 计算属性：过滤后的章节列表
const filteredChapters = computed(() => {
  if (!chapterSearchKeyword.value) {
    return childrenChapter.value;
  }
  const keyword = chapterSearchKeyword.value.toLowerCase();
  const filterNodes = (nodes) => {
    return nodes.filter(node => {
      if (node.chapterTxt.toLowerCase().includes(keyword)) {
        return true;
      }
      if (node.children && node.children.length > 0) {
        node.children = filterNodes(node.children);
        return node.children.length > 0;
      }
      return false;
    });
  };
  return filterNodes(JSON.parse(JSON.stringify(childrenChapter.value)));
});

//确认密码校验
const subjectExistMethod = (rule, value, callback) => {
  if (value) {
    // 修改操作时跳过验证（后端会排除当前科目）
    if (form.value.id) {
      callback();
      return;
    }

    // 只在新增时验证重复性
    form.value.textbookLibraryId = value[0]
    form.value.volumeId = value[1]
    subjectExist(form.value).then(response => {
    if(response.code === 200) {
      if(response.data) {
        callback(new Error("该科目已存在"));
      } else {
        callback();
      }
    }
  });
  } else {
    callback();
  }
};


/** 节点是否修改 */
const editingId = ref(null);

// 上传相关配置
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + '/file/upload');
const uploadHeaders = ref({
  Authorization: 'Bearer ' + localStorage.getItem('access_token')
});

// 上传状态
const uploading = ref(false);
const uploadProgress = ref(0);

// 上传成功处理
const handleUploadSuccess = (res) => {
  uploading.value = false;
  uploadProgress.value = 0;
  if (res.code === 200) {
    form.value.coverImg = res.data.url;
    proxy.$modal.msgSuccess('封面上传成功');
  } else {
    proxy.$modal.msgError(res.msg || '上传失败');
  }
};

// 上传错误处理
const handleUploadError = () => {
  uploading.value = false;
  uploadProgress.value = 0;
  proxy.$modal.msgError('封面上传失败，请重试');
};

// 上传进度处理
const handleUploadProgress = (event) => {
  uploading.value = true;
  if (event.percent) {
    uploadProgress.value = Math.min(99, Math.floor(event.percent));
  }
};

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isImage) {
    proxy.$modal.msgError('只能上传图片文件！');
    return false;
  }
  if (!isLt10M) {
    proxy.$modal.msgError('图片大小不能超过 10MB！');
    return false;
  }
  uploading.value = true;
  uploadProgress.value = 0;
  return true;
};
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    subjectType: null,
    schoolType: null,
    educationStageType: null,
    versionReleaseTimeType: null,
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
    versionReleaseTimeType: [
      { required: true, message: "版本发行时间不能为空", trigger: "change" }
    ],
    versionArr: [
      { required: true, message: "版本名称不能为空", trigger: "change" },
      { validator: subjectExistMethod, trigger: "change" }
    ],
  }
});


const { queryParams, form, rules } = toRefs(data);



//学段
const educationStage = ref([])
//科目
const subjectStage = ref([])
//学校类型改变时，学段改变
const schoolTypeChange = (value) => {
    // 清空学段选择
    queryParams.value.educationStageType = null;
    queryParams.value.subjectType = null;
  //清空学段的数据
    form.value.educationStageType = '1'//默认小学
    // if(value == '1'){
    //     educationStage.value = mt_academic_stage//普教
    //     subjectStage.value = mt_school_subject
    // }else{
    //     educationStage.value = mt_vocal_education_type//职教
    //     subjectStage.value = mt_vocal_school_subject

    // }
}

const educationStageTypeChange = (value) => {
    // 清空学段选择
    // queryParams.value.educationStageType = null;
    queryParams.value.subjectType = null;
  //清空学段的数据
    // form.value.educationStageType = '1'//默认小学
    // if(value == '1'){
    //     educationStage.value = mt_academic_stage//普教
    //     subjectStage.value = mt_school_subject
    // }else{
    //     educationStage.value = mt_vocal_education_type//职教
    //     subjectStage.value = mt_vocal_school_subject

    // }
}
/** 查询科目列表 */
function getList() {
  loading.value = true;
  listSubject(queryParams.value).then(response => {
    subjectList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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
    versionReleaseTimeType: null,
    versionName: null,
    delFlag: null,
    coverImg: null
  };
  proxy.resetForm("subjectRef");
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
  let obj = {}
  selection.forEach(item => {
    obj.id = item.id 
    obj.textbookLibraryId = item.textbookLibraryId
    obj.volumeId = item.volumeId
    ids.value.push(obj)
  })


  // ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  childrenChapter.value = []//清空章节数据
  chapterCount.value = 0//清空章节数量
  form.value.schoolType = '1'//默认学校为普教
  schoolTypeChange('1')//调用普教下的学段

  open.value = true;
  title.value = "添加科目";
  getTextBookLibraryAndVolumeList();
}

/** 修改按钮操作 */
function handleUpdate(row) {
  console.log('row');
  console.log(row);
  console.log('row');
  schoolTypeChange('1')//调用普教下的学段
  getTextBookLibraryAndVolumeList();//获取教材版本-分册列表
  reset();
  const _id = row.id || ids.value[0].id
  const _libraryId = row.textbookLibraryId || ids.value[0].textbookLibraryId
  const _volumeId = row.volumeId || ids.value[0].volumeId
  getSubject(_id, _libraryId, _volumeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改科目";
    // 加载章节数据并更新数量
    if (form.value.volumeId && form.value.id) {
      findChapterList(form.value.volumeId, form.value.id);
    }
  });
}

const childrenChapter = ref([])
//添加章节
function handleAddChapter(volumeId, subjectId) {
  const newChild = {
    chapterTxt: '标题',
    children: [],
    isInput: false,
    volumeId: volumeId,
    subjectId: subjectId
  };

  if (!childrenChapter) {
    childrenChapter.value = [];
  }

  addOrUpdateChapter(newChild).then(response => {
    if(200 === response.code) {
      proxy.$modal.msgSuccess("新增成功");
      findChapterList(volumeId, subjectId);
    } else {
      proxy.$modal.msgError(response.msg);
    }
  });
}

// 修改获取章节列表方法，使其返回 Promise
function findChapterList(volumeId, subjectId) {
  return getChapterList(volumeId, subjectId).then(response => {
    childrenChapter.value = response.data || [];
    chapterCount.value = countChapters(childrenChapter.value);
    return response.data;
  });
}

//新增章节节点
function appendChapter(data, node, volumeId, subjectId) {
      //获取章节最大id
      let maxId = getChapterMaxId() + 1;
      const newChild = {
        id: maxId,
        parentId: data.id,
        chapterTxt: '标题',
        children: [],
        isInput: false,
        volumeId: volumeId,
        subjectId: subjectId
      };

      //因为vue3全是代理对象所以需要转换一下
      let dataObj = JSON.parse(JSON.stringify(data))
      if (!dataObj.children) {
        childrenChapter.value.children = [];
      }

      dataObj.children = [].push(newChild);
      let formData = {
        parentId: data.id,
        chapterTxt: '标题',
        children: [],
        isInput: false,
        volumeId: volumeId,
        subjectId: subjectId
      }
      addOrUpdateChapter(formData).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          findChapterList(volumeId, subjectId);
      });
}


//取消节点编辑
function cancelEdit() {
  editingId.value = null;
}

// 打开章节管理抽屉
function openChapterDrawer() {
  chapterDrawerVisible.value = true;
  // 加载章节数据并计算数量
  if (form.value.volumeId && form.value.id) {
    getChapterList(form.value.volumeId, form.value.id).then(response => {
      childrenChapter.value = response.data || [];
      chapterCount.value = countChapters(childrenChapter.value);
    });
  }
}

// 递归计算章节数量
function countChapters(nodes) {
  let count = 0;
  nodes.forEach(node => {
    count++;
    if (node.children && node.children.length > 0) {
      count += countChapters(node.children);
    }
  });
  return count;
}

// 保存章节（抽屉确定按钮）
function saveChapters() {
  chapterDrawerVisible.value = false;
  proxy.$modal.msgSuccess('章节已保存');
}

// 导出章节
function exportChapters() {
  if (!childrenChapter.value || childrenChapter.value.length === 0) {
    proxy.$modal.msgWarning('暂无章节数据可导出');
    return;
  }

  // 将章节树转换为扁平结构
  const flattenChapters = (nodes, level = 0) => {
    let result = [];
    nodes.forEach(node => {
      result.push({
        level: level + 1,
        title: node.chapterTxt,
        indent: '  '.repeat(level)
      });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenChapters(node.children, level + 1));
      }
    });
    return result;
  };

  const chapters = flattenChapters(childrenChapter.value);
  const content = chapters.map(ch => `${ch.indent}${ch.level === 1 ? '第' : ''}${ch.title}`).join('\n');

  // 创建下载
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `章节体系_${form.value.subjectType || '科目'}.txt`;
  link.click();
  URL.revokeObjectURL(url);

  proxy.$modal.msgSuccess('导出成功');
}

//获取弹框保存数据
function saveCurrentInp(data, node, volumeId, subjectId){
  if (!data.chapterTxt.trim()) {
    proxy.$modal.msgError("章节内容不能为空");
    return;
  }

  addOrUpdateChapter(data).then(response => {
    if (response.code === 200) {
      proxy.$modal.msgSuccess("修改成功");
      editingId.value = null;
      findChapterList(volumeId, subjectId).then(() => {
        // 更新章节数量
        chapterCount.value = countChapters(childrenChapter.value);
      });
    } else {
      proxy.$modal.msgError(response.msg);
    }
  });
}


//修改章节
function updateChapter(data, node, volumeId) {
  editingId.value = data.id;
  // 自动聚焦到输入框
  nextTick(() => {
    if (editInputRef.value) {
      if (Array.isArray(editInputRef.value) && editInputRef.value.length > 0) {
        editInputRef.value[0].focus();
      } else if (editInputRef.value.focus) {
        editInputRef.value.focus();
      }
    }
  });
}

 //删除章节
function removeChapter(node, data, volumeId, subjectId) {
  ElMessageBox.confirm('此操作将永久删除该内容, 是否继续?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delChapter(data.id).then(response => {
          if(response.code === 200 ) {
            proxy.$modal.msgSuccess("删除成功");
            findChapterList(volumeId, subjectId).then(() => {
              // 更新章节数量
              chapterCount.value = countChapters(childrenChapter.value);
            });
          } else {
            proxy.$modal.msgError("删除失败");
          }
        });
      }).catch(() => {
        ElMessage({message: '已取消删除', type: 'info', plain: true, })
      }).catch(() => {
        ElMessage({ message: '删除失败', type: 'error', plain: true, })
      })
}




/** 提交按钮 */
function submitForm() {
  proxy.$refs["subjectRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
      console.log('form.value')
      console.log(form.value)
      console.log('form.value')
        updateSubject(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSubject(form.value).then(response => {
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
  const _libraryId = row.textbookLibraryId
  const _volumeId = row.volumeId
  proxy.$modal.confirm('是否确认删除？').then(function() {
    return delSubject(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/subject/export', {
    ...queryParams.value
  }, `subject_${new Date().getTime()}.xlsx`)
}

// 教师用户自动填充学校类型
if (isTeacher.value) {
  queryParams.value.schoolType = userSchoolType.value
  schoolTypeChange(userSchoolType.value)
}
getList();
</script>
<style scoped lang="scss">
/* 列表封面缩略图 - 正方形裁剪 */
.table-cover-thumb {
  width: 67px;
  height: 67px;
  border-radius: 8px;
  overflow: hidden;
}

.table-cover-placeholder {
  width: 67px;
  height: 67px;
  background: #f0f0f0;
  border-radius: 8px;
}

.el-form-item__content {
  display: flex;
  align-items: center;
}

.el-select {
  width: 100%;
}

/* 科目对话框优化样式 */
.subject-form-container {
  display: flex;
  gap: 40px;
  padding: 4px 0;
  align-items: flex-start;
}

/* 左侧封面区域 */
.cover-section {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 2px;
}

.cover-uploader {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
    display: block;
  }
}

.cover-preview {
  width: 100%;
  max-width: 240px;
  aspect-ratio: 3/4;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border: 2px dashed #d0d0d0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    border-color: #6EDC93;
    box-shadow: 0 8px 24px rgba(110, 220, 147, 0.25);

    .cover-mask {
      opacity: 1;
    }
  }

  &.has-cover {
    border: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
}

.placeholder-text {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.placeholder-hint {
  font-size: 13px;
  color: #999;
  margin-top: -4px;
}

.cover-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mask-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

/* 上传中的遮罩层 */
.uploading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 10;
}

.cover-preview.is-uploading {
  pointer-events: none;
}

.uploading-text {
  font-size: 14px;
  color: #6EDC93;
  font-weight: 500;
}

.upload-progress {
  width: 60%;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.cover-tip {
  font-size: 12px;
  color: #999;
  text-align: center;
  line-height: 1.4;
  padding: 0 4px;
  margin-top: -4px;
}

/* 右侧表单区域 */
.form-section {
  flex: 1;
  min-width: 0;
}

.subject-form {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}

/* 表单分组 */
.form-group {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

/* 对话框优化 */
:deep(.subject-dialog) {
  .el-dialog__body {
    padding: 20px 24px 16px;
  }
}

/* 响应式：小屏幕切换为垂直布局 */
@media (max-width: 768px) {
  .subject-form-container {
    flex-direction: column;
    gap: 24px;
  }

  .cover-section {
    width: 100%;
  }

  .cover-preview {
    width: 100%;
    max-width: 320px;
  }
}

/* 章节摘要卡片 */
.chapter-summary {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;

  .group-title {
    border-bottom-color: #86efac;
  }
}

.chapter-summary-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.chapter-stats {
  display: flex;
  align-items: center;
  gap: 12px;

  .stats-text {
    font-size: 14px;
    color: #166534;

    strong {
      font-size: 18px;
      color: #15803d;
    }
  }
}

/* 章节管理抽屉 */
.chapter-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #e8e8e8;
  }

  :deep(.el-drawer__body) {
    padding: 0;
    overflow: hidden;
  }

  :deep(.el-drawer__footer) {
    padding: 16px 24px;
    border-top: 1px solid #e8e8e8;
  }
}

.chapter-drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chapter-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;

  .toolbar-actions {
    display: flex;
    gap: 8px;
  }
}

.chapter-list-container {
  flex: 1;
  overflow: auto;
  padding: 16px 24px;
}

.chapter-tree-wrapper {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
}

/* 现代化章节树样式 */
.chapter-tree-modern {
  background: #fff;

  :deep(.el-tree-node) {
    position: relative;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 24px;
      top: 36px;
      bottom: 0;
      width: 1px;
      background: #e8e8e8;
    }
  }

  :deep(.el-tree-node__content) {
    height: auto;
    min-height: 48px;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
    margin-bottom: 4px;

    &:hover {
      background: #f5f5f5;
    }
  }

  :deep(.el-tree-node__expand-icon) {
    font-size: 16px;
    color: #999;
  }
}

.chapter-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;

  &.is-editing {
    .chapter-content {
      flex: 1;
    }
  }
}

.chapter-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;

  .chapter-icon {
    flex-shrink: 0;
    color: #6EDC93;
  }

  .chapter-text {
    font-size: 14px;
    color: #333;
    word-break: break-all;
  }
}

.chapter-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.chapter-node:hover .chapter-actions {
  opacity: 1;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<style>
/* 全局修复：图片预览层级问题 - 必须放在非 scoped 样式中 */
.el-image-viewer__wrapper {
  z-index: 99999 !important;
}

.el-image-viewer__mask {
  z-index: 99999 !important;
}

.el-image-viewer__btn {
  z-index: 100000 !important;
}

.el-image-viewer__canvas {
  z-index: 100000 !important;
}

/* Element Plus 表格相关元素 - 降低层级 */
.el-table__fixed,
.el-table__fixed-right {
  z-index: 1 !important;
}

.el-table__fixed-body-wrapper {
  z-index: 1 !important;
}
</style>