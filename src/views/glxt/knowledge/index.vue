<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="58px">
      <el-form-item label="类型" prop="schoolTypeId">
        <el-select v-model="queryParams.schoolTypeId" placeholder="请选择类型" @change="handleSchoolTypeChange" style="width: 130px" clearable>
          <el-option
            v-for="dict in mt_school_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学段" prop="academicStageId">
        <el-select v-model="queryParams.academicStageId" placeholder="请选择学段" style="width: 130px" clearable>
          <el-option
            v-for="dict in academicStageOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="科目" prop="subjectId">
        <el-select v-model="queryParams.subjectId" placeholder="请选择科目"  style="width: 130px" clearable>
          <el-option
            v-for="dict in queryParams.schoolTypeId=='1'?mt_school_subject:mt_vocal_school_subject"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="知识点" prop="knowledge">
        <el-input
          v-model="queryParams.knowledge"
          placeholder="请输入知识点"
          clearable
          @keyup.enter="handleQuery"
        />
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
          @click="handleAdd('add',1)"
          v-hasPermi="['glxt:knowledge:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Sort"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="knowledgeList"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{
        children: 'children',
        hasChildren: 'hasChildren',
        indent: 20
      }"
      border
    >
      <el-table-column label="知识点体系">
        <template #default="scope">
          <span class="knowledge-label">
            <el-icon v-if="scope.row.children && scope.row.children.length > 0">
              <Notebook />
            </el-icon>
            <el-icon v-else>
              <Collection />
            </el-icon>
            {{ scope.row.knowledge }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="schoolTypeId" width="150">
        <template #default="scope">
          <dict-tag :options="mt_school_type" :value="scope.row.schoolTypeId"/>
        </template>
      </el-table-column>
      <el-table-column label="学段" align="center" width="150">
        <template #default="scope">
          <dict-tag :options="mt_academic_stage" :value="scope.row.academicStageId"/>
        </template>
      </el-table-column> 
      <el-table-column label="科目" align="center" width="150">
        <template #default="scope">
          <dict-tag :options="scope.row.schoolTypeId=='1'?mt_school_subject:mt_vocal_school_subject" :value="scope.row.subjectId"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="450">
        <template #default="scope">
          <el-button plain type="success" color="#6EDC93" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:knowledge:edit']">修改</el-button>
          <el-button plain type="primary" icon="Plus" @click="handleAdd(scope.row, 2)" v-hasPermi="['glxt:knowledge:add']">新增子节点</el-button>
          <el-button 
            plain 
            type="danger" 
            icon="Delete" 
            @click="handleDelete(scope.row)" 
            v-hasPermi="['glxt:knowledge:remove']"
            :disabled="scope.row.children && scope.row.children.length > 0"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    /> -->


    <!-- 添加或修改知识点对话框 -->
    <el-dialog 
      :title="title" 
      v-model="open" 
      width="600px" 
      append-to-body
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
    {{ operateTypeNum }}
      <el-form ref="knowledgeRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="类型" prop="schoolTypeId">
          <el-select 
            v-model="form.schoolTypeId" 
            placeholder="请选择类型" 
            style="width: 100%"
            @change="handleSchoolTypeChange"
          >
            <el-option
              v-for="dict in mt_school_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
          <!-- <div class="el-form-item-msg">选择上级知识点后将继承其类型</div> -->
        </el-form-item>
        <el-form-item label="学段" prop="academicStageId">
              <el-select 
                v-model="form.academicStageId" 
                placeholder="请选择学段" 
                style="width: 100%"
                >
                <el-option
                  v-for="item in academicStageOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          <el-form-item label="科目" prop="subjectId">
            <el-select v-model="form.subjectId" placeholder="请选择科目"  clearable>
              <el-option
                v-for="dict in form.schoolTypeId=='1'?mt_school_subject:mt_vocal_school_subject"
                :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"/>
            </el-select>
            </el-form-item>
            <el-form-item label="上级知识点" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                :data="knowledgeOptions"
                :props="{ value: 'id', label: 'knowledge', children: 'children' }"
                value-key="id"
                placeholder="不选择则为顶级知识点"
                check-strictly
                disabled
                clearable
              />
              <!-- :disabled="operateType == 1" -->
          </el-form-item>
            <el-form-item label="知识点名称" prop="knowledge">
          <el-input 
            v-model="form.knowledge" 
            placeholder="请输入知识点名称"
            show-word-limit
          />
        </el-form-item>
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

<script setup name="Knowledge">
import { listKnowledge, getKnowledge, delKnowledge, addKnowledge, updateKnowledge } from "@/api/glxt/knowledge";
import { Document, Folder } from '@element-plus/icons-vue'
import { listSubject} from "@/api/glxt/subject";
const { proxy } = getCurrentInstance();
//字典引入 学校类型、  mt_vocal_education_type->职教学段、mt_academic_stage->普教学段、 学制
const { mt_vocal_education_type, mt_academic_stage, mt_school_subject, mt_school_type,mt_vocal_school_subject} = proxy.useDict('mt_school_type', 'mt_vocal_education_type', 'mt_academic_stage', 'mt_school_subject', 'mt_school_type','mt_vocal_school_subject');

const knowledgeList = ref([]);
const knowledgeOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(false);//默认不展开
const refreshTable = ref(true);
const subjectOptions = ref([]);  // 科目选项
const stageOptions = ref([]);    // 学段选项
const operateType = ref(0);
const total = ref(0);
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10000,
    knowledge: null,
    schoolTypeId: null,
    subjectId: null,
    academicStageId: null,
  },
  rules: {
    knowledge: [
      { required: true, message: "知识点名称不能为空", trigger: "blur" },
      { min: 2, max: 50, message: "知识点名称长度在 2 到 50 个字符", trigger: "blur" }
    ],
    // schoolTypeId: [
    //   { required: true, message: "请选择类型", trigger: "change" }
    // ],
    // subjectId: [
    //   { required: true, message: "请选择科目", trigger: "change" }
    // ],
    // academicStageId: [
    //   { required: true, message: "请选择学段", trigger: "change" }
    // ]
  }
});

const { queryParams, form, rules } = toRefs(data);


const academicStageOptions = ref([]);
// 学校类型改变
function handleSchoolTypeChange(value) {
  // 清空学段选择
  queryParams.value.academicStageId = null;
  queryParams.value.subjectId = null;
  //点击新增按钮进行清空
  form.value.academicStageId = null;
  form.value.subjectId = null;
  if(value == 1){//普教
    academicStageOptions.value = mt_academic_stage.value;
    getSubjectList(value);
  } else {//职教
    academicStageOptions.value = mt_vocal_education_type.value;
    getSubjectList(value);
  }
}


//获取科目
function getSubjectList(schoolType){
  const queryParamTmp = {
    pageNum: 1,
    pageSize: 1000000,
    schoolType: schoolType
  }
  listSubject(queryParamTmp).then(response => {
    subjectOptions.value = response.rows;
    //对类型和学段进行去重
    subjectOptions.value = subjectOptions.value.filter((item, index, self) => {
      return self.findIndex(t => t.schoolType === item.schoolType && t.subjectType === item.subjectType) === index;
    });
  });
}

//获取科目名称
const getSubjectName = (subjectType) => {
  if (!subjectType || !mt_school_subject.value) return '';
  const found = mt_school_subject.value.find(item => item.value === subjectType.toString());
  return found ? found.label : '';
}

/** 查询知识点列表 */
function getList() {
  loading.value = true;
  listKnowledge(queryParams.value).then(response => {
    knowledgeList.value = proxy.handleTree(response.rows, "id", "parentId");
    total.value = knowledgeList.value.length
    loading.value = false;
  });
}

/** 查询知识点下拉树结构 */
function getTreeselect() {
  listKnowledge().then(response => {
    knowledgeOptions.value = [];
    const data = { id: 0, knowledge: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.rows, "id", "parentId");
    knowledgeOptions.value.push(data);
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
    knowledge: null,
    parentId: null,
    schoolTypeId: null,
    subjectId: null,
    academicStageId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    delFlag: null
  };
  proxy.resetForm("knowledgeRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 获取学段列表 */
function getStageList() {
  listStage().then(response => {
    stageOptions.value = response.data;
  });
}

/** 新增按钮操作 */
const operateTypeNum = ref();
function handleAdd(row, type) {
  //新增父还是子
  operateTypeNum.value = type;
  //用与禁止父级节点的类型
  operateType.value = type;
  //给学段赋值
  if(type == 2){//新增子节点的时候
    handleSchoolTypeChange(row.schoolTypeId)
  }
  reset();
  getTreeselect();
  getSubjectList(row.schoolTypeId);
  if (row != null && row.id) {
    form.value.parentId = row.id;
    // 继承父节点的类型、科目和学段
    form.value.schoolTypeId = row.schoolTypeId;
    form.value.subjectId = row.subjectId;
    form.value.academicStageId = row.academicStageId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "添加知识点";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {

  operateTypeNum.value = row.parentId? 2 : 1;
  //回显学段
  handleSchoolTypeChange(row.schoolTypeId)
  reset();
  await Promise.all([getTreeselect(), getSubjectList(row.schoolTypeId)]);
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  getKnowledge(row.id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改知识点";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["knowledgeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateKnowledge(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {

        // if(operateTypeNum.value == 2){//新增子节点的时候不需要新增类型、学段、科目
        //   form.value.schoolTypeId = null;
        //   form.value.subjectId = null;
        //   form.value.academicStageId = null;

        // }

        addKnowledge(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除知识点编号为"' + row.id + '"的数据项？').then(function() {
    return delKnowledge(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
getSubjectList();//科目列表
</script>

<style lang="scss" scoped>
.el-form-item-msg {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.knowledge-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.knowledge-label .el-icon {
  font-size: 16px;
}

:deep(.el-table__row) {
  .cell {
    white-space: nowrap;
  }
}

/* 树形缩进样式优化 */
:deep(.el-table__indent) {
  padding-left: 20px !important;
}

/* 文件夹图标颜色 */
.el-icon-folder {
  color: #e6a23c;
}

/* 文档图标颜色 */
.el-icon-document {
  color: #909399;
}
</style>
