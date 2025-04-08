<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="40px">
      <el-form-item label="类型" prop="schoolType" >
        <el-select v-model="queryParams.schoolType" clearable style="width: 100px;" @change="schoolTypeChange">
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300px">
        <template #default="scope">
          <el-button plain type="success" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:subject:edit']">修改</el-button>
          <el-button plain type="warning" @click="chapters(scope.row)" v-hasPermi="['glxt:subject:edit']">章节体系</el-button>
          <el-button plain type="danger"  @click="handleDelete(scope.row)" v-hasPermi="['glxt:subject:remove']">删除</el-button>
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
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="subjectRef" :model="form" :rules="rules" label-width="110px">
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
          <el-select v-model="form.subjectType" placeholder="请选择科目">
            <el-option
              v-for="dict in form.schoolType=='1'?mt_school_subject:mt_vocal_school_subject"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发行时间" prop="versionReleaseTimeType">
          <el-select v-model="form.versionReleaseTimeType" placeholder="请选择版本发行时间">
            <el-option
              v-for="dict in mt_textbooklibrary_time"
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
      </el-form>
      <el-divider v-if="form.id !== null" content-position="center">章节列表</el-divider>
      <!-- <el-scrollbar :height="childrenChapter.length > 10 ? '500px' : '100px'" v-if="form.id !== null"> 
        <el-tree style="display: grid; place-items: center;margin-top: 30px;" 
          :data="childrenChapter" node-key="id" default-expand-all empty-text="暂无章节数据，请先添加章节..." :expand-on-click-node="false">
              <template #default="{ node, data }">
                <div class="custom-tree-node" :data-id="data.id">
                <span>
                  <span v-if="data.isInput=== undefined || !data.isInput">{{ data.chapterTxt }}</span>
                  <span v-else><el-input v-model="data.chapterTxt" placeholder="请输入章节内容" @blur="saveCurrentInp(data,node)"></el-input></span>
                </span>
                <span style="margin-left: 200px;">
                  <el-button v-if="node.level < 3" icon="Plus" size="small" type="primary" @click="() => appendChapter(data,node, form.volumeId)" circle disabled></el-button>
                  <el-button icon="Edit" size="small" type="info" @click="() => updateChapter(node, data)" circle disabled></el-button>
                  <el-button icon="Delete" size="small" type="danger" @click="() => removeChapter(node,data, form.volumeId)" circle disabled></el-button>
                </span>
              </div>
              </template>
            </el-tree>
          </el-scrollbar> -->
        <el-scrollbar ref="scrollbarRef" height="300px">
        <el-tree  class="chapter-tree" style="display: grid; place-items: center;margin-top: 30px;  background-color: #f9f9f9;" 
          :highlight-current="true" default-expand-all
          :data="childrenChapter" node-key="id" empty-text="暂无章节内容" :expand-on-click-node="false">
              <template #empty>
                <el-empty description="暂无章节内容" :image-size="120"/>
              </template>
              <template #default="{ node, data }">
                <div class="custom-tree-node" :data-id="data.id">
                <span>
                  <template v-if="data.id === editingId">
                    <el-input
                      v-model="data.chapterTxt"
                      placeholder="请输入章节内容"
                      @blur="cancelEdit"
                      @keyup.enter="saveCurrentInp(data, node, form.volumeId)"
                      size="small"
                    ></el-input>
                  </template>
                  <template v-else>
                    {{ data.chapterTxt }}
                  </template>
                </span>    
              </div>
              </template>
            </el-tree>
      </el-scrollbar>
          <template #footer>
            <div class="dialog-footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
            </div>
          </template>
    </el-dialog>


    <!-- 章节体系 -->
    <el-dialog :title="title" v-model="chapterOpen" width="1050px" append-to-body>
      <el-form ref="subjectRef" :model="form" label-width="110px" class="custom-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型" prop="schoolType" class="custom-form-item">
              <el-radio-group v-model="form.schoolType" disabled>
                <el-radio
                  v-for="dict in mt_school_type"
                  :key="dict.value"
                  :value="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学段" prop="educationStageType" class="custom-form-item" >
              <el-radio-group v-model="form.educationStageType" disabled>
                <el-radio
                  v-for="dict in form.schoolType=='1'?mt_academic_stage:mt_vocal_education_type"
                  :key="dict.value"
                  :value="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="科目" prop="subjectType" class="custom-form-item">
              <el-select v-model="form.subjectType" placeholder="请选择科目" disabled>
                <el-option
                  v-for="dict in form.schoolType=='1'?mt_school_subject:mt_vocal_school_subject"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发行时间" prop="versionReleaseTimeType" class="custom-form-item" style="margin-right: 15px;">
              <el-select v-model="form.versionReleaseTimeType" placeholder="请选择版本发行时间" disabled>
                <el-option
                  v-for="dict in mt_textbooklibrary_time"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="版本名称" prop="versionArr" class="custom-form-item">
              <el-cascader

                style="width: 100%;"
                disabled
                v-model="form.versionArr"
                :options="children"
                :props="props"
                separator="-"
                placeholder="版本分册"
                collapse-tags
                clearable/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-divider content-position="center">章节操作</el-divider>
      <div style="text-align: center; margin-top: 20px;  background-color: #f9f9f9;border-radius: 8px;">
        <el-button type="primary" @click="handleAddChapter(form.volumeId)" style="position: relative; top: 10px;z-index: 1;">添加章节</el-button>
      <el-scrollbar ref="scrollbarRef" height="300px">
        <el-tree  class="chapter-tree" style="display: grid; place-items: center;margin-top: 30px;  background-color: #f9f9f9;" 
          :highlight-current="true" default-expand-all
          :data="childrenChapter" node-key="id" empty-text="暂无章节内容" :expand-on-click-node="false">
              <template #empty>
                <el-empty 
                  description="暂无章节内容"
                  :image-size="120"
                >
                </el-empty>
              </template>
              <template #default="{ node, data }">
                <div class="custom-tree-node" :data-id="data.id">
                <span>
                  <template v-if="data.id === editingId">
                    <el-input
                      v-model="data.chapterTxt"
                      placeholder="请输入章节内容"
                      @blur="cancelEdit"
                      @keyup.enter="saveCurrentInp(data, node, form.volumeId)"
                      size="small"
                    ></el-input>
                  </template>
                  <template v-else>
                    {{ data.chapterTxt }}
                  </template>
                </span>
                <span style="margin-left: 300px;">
                  <a v-if="node.level < 3" :style="{marginRight: '0.5rem'}" @click="appendChapter(data, node, form.volumeId)">
                    <el-icon :style="{color:'#0000FF'}">
                      <Plus />
                    </el-icon>
                  </a>
                  <a :style="{marginRight: '0.5rem'}" @click="updateChapter(data, node, form.volumeId)">
                    <el-icon :style="{color:'#0000FF'}">
                      <Edit />
                    </el-icon>
                  </a>
                  <a :style="{marginRight: '0.5rem'}" @click="removeChapter(node, data, form.volumeId)">
                    <el-icon :style="{color:'#DA3434'}">
                      <Delete />
                    </el-icon>
                  </a>
                </span>
              </div>
              </template>
            </el-tree>
      </el-scrollbar>
    </div>
    </el-dialog>
  </div>
</template>

<script setup name="Subject">
import { listSubject, getSubject, delSubject, addSubject, updateSubject, addOrUpdateChapter, delChapter, getChapterList, getChapterMaxId, subjectExist} from "@/api/glxt/subject";
import { selectTextBookLibraryAndVolumeList } from "@/api/glxt/library";
import { ElMessage, ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance();
const { mt_academic_stage, mt_school_subject,mt_vocal_school_subject, mt_textbooklibrary_time, mt_school_type, mt_vocal_education_type } = proxy.useDict('mt_academic_stage', 'mt_school_subject','mt_vocal_school_subject', 'mt_textbooklibrary_time', 'mt_school_type', 'mt_vocal_education_type');
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

//确认密码校验
const subjectExistMethod = (rule, value, callback) => {
  if (value) {
    console.log('value');
    console.log(value);
    console.log(form.value);
    console.log('value');
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
      { required: true, validator: subjectExistMethod, trigger: "change" }
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
    delFlag: null
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
  form.value.schoolType = '1'//默认学校为普教
  schoolTypeChange('1')//调用普教下的学段

  open.value = true;
  title.value = "添加科目";
  getTextBookLibraryAndVolumeList();
}

/** 修改按钮操作 */
function handleUpdate(row) {
  schoolTypeChange('1')//调用普教下的学段
  getTextBookLibraryAndVolumeList();//获取教材版本-分册列表
  findChapterList(row.volumeId);//章节列表
  reset();
  const _id = row.id || ids.value[0].id
  const _libraryId = row.textbookLibraryId || ids.value[0].textbookLibraryId
  const _volumeId = row.volumeId || ids.value[0].volumeId
  getSubject(_id, _libraryId, _volumeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改科目";
  });
}

/** 章节体系 */
const chapterOpen = ref(false);
function chapters(row) {
  getTextBookLibraryAndVolumeList();//获取教材版本-分册列表
  findChapterList(row.volumeId);//章节列表
  reset();
  const _id = row.id || ids.value[0].id
  const _libraryId = row.textbookLibraryId || ids.value[0].textbookLibraryId
  const _volumeId = row.volumeId || ids.value[0].volumeId
  getSubject(_id, _libraryId, _volumeId).then(response => {
    form.value = response.data;
    chapterOpen.value = true;
    title.value = "章节体系";
  });
}

// 关闭章节体系
function chaterCanael(){
    chapterOpen.value = false;
}


const childrenChapter = ref([])
//添加章节
function handleAddChapter(volumeId) {
  const newChild = {
    chapterTxt: '标题',
    children: [],
    isInput: false,
    volumeId: volumeId
  };
  
  if (!childrenChapter) {
    childrenChapter.value = [];
  }
  
  addOrUpdateChapter(newChild).then(response => {
    if(200 === response.code) {
      proxy.$modal.msgSuccess("新增成功");
      findChapterList(volumeId).then(() => {
        // 等待DOM更新后执行滚动
        nextTick(() => {
          // 获取最后一个节点
          const lastNode = childrenChapter.value[childrenChapter.value.length - 1];
          if (lastNode) {
            // 设置当前节点为选中状态
            treeRef.value.setCurrentKey(lastNode.id);
            // 滚动到新添加的节点
            scrollToNode(lastNode.id);
            // 直接进入编辑模式
            editingId.value = lastNode.id;
          }
        });
      });
    } else {
      proxy.$modal.msgError(response.msg);
    }
  });
}

// 添加滚动到指定节点的方法
function scrollToNode(nodeId) {
  if (!scrollbarRef.value) return;
  
  // 获取目标节点的DOM元素
  const targetNode = document.querySelector(`[data-id="${nodeId}"]`);
  if (targetNode) {
    // 计算滚动位置
    const scrollContainer = scrollbarRef.value.wrapRef;
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();
    
    // 滚动到目标位置
    scrollContainer.scrollTop = targetRect.top - containerRect.top - 50; // 50是上边距
  }
}

// 修改获取章节列表方法，使其返回 Promise
function findChapterList(volumeId) {
  return getChapterList(volumeId).then(response => {
    childrenChapter.value = response.data;
    return response.data;
  });
}

//新增章节节点
function appendChapter(data, node, volumeId) {
      //获取章节最大id
      let maxId = getChapterMaxId() + 1;
      const newChild = {
        id: maxId,
        parentId: data.id,
        chapterTxt: '标题',
        children: [],
        isInput: false,
        volumeId: volumeId
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
        volumeId: volumeId
      }
      addOrUpdateChapter(formData).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          findChapterList(volumeId);
      });
}


//取消节点编辑
function cancelEdit() {
  editingId.value = null;
}

//获取弹框保存数据
function saveCurrentInp(data, node, volumeId){
  if (!data.chapterTxt.trim()) {
    proxy.$modal.msgError("章节内容不能为空");
    return;
  }
  
  addOrUpdateChapter(data).then(response => {
    if (response.code === 200) {
      proxy.$modal.msgSuccess("修改成功");
      editingId.value = null;
      findChapterList(volumeId);
    } else {
      proxy.$modal.msgError(response.msg);
    }
  });
}


//修改章节
function updateChapter(data, node, volumeId) {
  editingId.value = data.id;
  // let formData = {
  //       id: data.id,
  //       // parentId: data.parentId,
  //       chapterTxt: data.chapterTxt,
  //       children: [],
  //       isInput: false,
  //       volumeId: volumeId
  //     }
  //     console.log(formData)
  //     console.log(node)
  // addOrUpdateChapter(formData).then(response => {
  //     proxy.$modal.msgSuccess("修改成功");
  //     findChapterList(volumeId);
  // });
}

 //删除章节
function removeChapter(node, data, volumeId) {
  ElMessageBox.confirm('此操作将永久删除该内容, 是否继续?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delChapter(data.id).then(response => {
          if(response.code === 200 ) {
            proxy.$modal.msgSuccess("删除成功");
            findChapterList(volumeId);//获取列表
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

getList();
</script>
<style scoped lang="scss">
.custom-form {
  background-color: #f9f9f9;
  border-radius: 8px;
  /* display: grid; place-items: center; */
}

.el-form-item__content {
  display: flex;
  align-items: center;
}

.el-select {
  width: 100%;
}

.chapter-tree {
  :deep(.el-tree-node__content) {
    padding: 8px 0;
  }
}

.custom-tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  
  > span:first-child {
    flex: 1;
    text-align: left;
    margin-right: 20px;
    
    .el-input {
      width: 200px;
    }
  }
  
  > span:last-child {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>