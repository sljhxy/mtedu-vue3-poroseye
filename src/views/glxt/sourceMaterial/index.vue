<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学校类型" prop="contentType">
        <el-select v-model="queryParams.contentType" placeholder="请选择" style="width: 100px;" clearable  @change="schoolTypeChange">
          <el-option
            v-for="dict in mt_school_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学段" prop="periodType">
        <el-select v-model="queryParams.periodType" placeholder="请选择" style="width: 150px;" clearable>
          <el-option
            v-for="dict in queryParams.contentType=='1'?mt_academic_stage:mt_vocal_education_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="素材类别" prop="sourceType">
        <el-select v-model="queryParams.sourceType" style="width: 100px;" placeholder="请选择" clearable>
          <el-option
            v-for="dict in mt_source_material_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文件名称" prop="fileName">
        <el-input
          v-model="queryParams.fileName"
          placeholder="请输入文件名称"
          clearable
          @input="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="文件类型" prop="fileType">
        <el-input
          v-model="queryParams.fileType"
          placeholder="请输入文件类型"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
  
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
          v-hasPermi="['glxt:sourceMaterial:add']"
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
          v-hasPermi="['glxt:sourceMaterial:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:sourceMaterial:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['glxt:sourceMaterial:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="sourceMaterialList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" width="55" type="index" align="center" />
      <el-table-column label="学校类型" align="center" prop="contentType">
        <template #default="scope">
          <dict-tag :options="mt_school_type" :value="scope.row.contentType"/>
        </template>
      </el-table-column>
      <el-table-column label="学段" align="center" prop="periodType">
        <template #default="scope">
          <dict-tag :options="scope.row.contentType == '1' ? mt_academic_stage : mt_vocal_education_type" :value="scope.row.periodType"/>
        </template>
      </el-table-column>
      <el-table-column label="文件名称" align="center" prop="fileName" />
      <!-- <el-table-column label="文件URL" align="center" prop="fileUrl" /> -->
      <el-table-column label="文件类型" align="center" prop="fileType" />
      <el-table-column label="素材类别" align="center" prop="sourceType">
        <template #default="scope">
          <dict-tag :options="mt_source_material_type" :value="scope.row.sourceType"/>
        </template>
      </el-table-column>
      <el-table-column label="来源说明" align="center" prop="sourceDesc" />
      <!-- <el-table-column label="是否选择" align="center" prop="isSelect" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button plain type="success" icon="Edit" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:sourceMaterial:edit']">修改</el-button>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:sourceMaterial:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"/>

    <!-- 添加或修改素材对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="sourceMaterialRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="素材" prop="fileUrl">
          <file-upload v-model="form.fileUrl" @fileData="fileSuccessData"/>
        </el-form-item>
        <el-form-item label="类型" prop="contentType">
          <el-radio-group v-model="form.contentType" >
            <el-radio
              @change="schoolTypeChange(dict.value)"
              v-for="dict in mt_school_type"
              :key="dict.value"
              :value="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="学段" prop="periodType">
          <el-radio-group v-model="form.periodType">
            <el-radio
              v-for="dict in form.contentType=='1'?mt_academic_stage:mt_vocal_education_type"
              :key="dict.value"
              :value="dict.value"
            
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="文件名称" prop="fileName">
          <el-input v-model="form.fileName" placeholder="请输入文件名称" disabled/>
        </el-form-item>
        <el-form-item label="文件路径" prop="fileUrl">
          <el-input v-model="form.fileUrl" placeholder="请输入文件URL" disabled/>
        </el-form-item>
        <el-form-item label="文件类型" prop="fileType">
          <el-input v-model="form.fileType" placeholder="请输入文件类型" disabled/>
        </el-form-item>
        <el-form-item label="文件类别" prop="sourceType">
          <el-radio-group v-model="form.sourceType">
            <el-radio
              v-for="dict in mt_source_material_type"
              :key="dict.value"
              :value="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="来源说明" prop="sourceDesc">
          <el-input v-model="form.sourceDesc" placeholder="请输入来源说明" />
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

<script setup name="SourceMaterial">
import { listSourceMaterial, getSourceMaterial, delSourceMaterial, addSourceMaterial, updateSourceMaterial } from "@/api/glxt/sourceMaterial";
const { proxy } = getCurrentInstance();
const { mt_academic_stage, mt_source_material_type, mt_school_type, mt_vocal_education_type } = proxy.useDict('mt_academic_stage', 'mt_source_material_type', 'mt_school_type','mt_vocal_education_type');

const sourceMaterialList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    contentType: null,
    periodType: null,
    fileName: null,
    fileType: null,
    sourceType: null,
  },
  rules: {
    contentType: [
      { required: true, message: "学校类型不能为空", trigger: "change" }
    ],
    periodType: [
      { required: true, message: "学段不能为空", trigger: "change" }
    ],
    fileName: [
      { required: true, message: "文件名称不能为空", trigger: "blur" }
    ],
    fileUrl: [
      { required: true, message: "文件URL不能为空", trigger: "blur" }
    ],
    fileType: [
      { required: true, message: "文件类型不能为空", trigger: "blur" }
    ],
    sourceType: [
      { required: true, message: "素材类别不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

//接收到子组件的数据
const fileSuccessData = (data) => {
  
  form.value.fileName = data.name
  form.value.fileUrl = data.url
  form.value.fileType = data.name.split(".")[1]

}

//学段
const educationStage = ref([])

//学校类型改变时，学段改变
const schoolTypeChange = (value) => {
  //清空学段的数据
    form.value.periodType = '1'
    if(value == '1'){
        educationStage.value = mt_academic_stage
    }else{
        educationStage.value = mt_vocal_education_type
    }
}


/** 查询素材列表 */
function getList() {
  loading.value = true;
  listSourceMaterial(queryParams.value).then(response => {
    sourceMaterialList.value = response.rows;
    total.value = response.total;
    loading.value = false;
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
    contentType: null,
    periodType: null,
    fileName: null,
    fileUrl: null,
    fileType: null,
    sourceType: null,
    sourceDesc: null,
    isSelect: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    delFlag: null
  };
  proxy.resetForm("sourceMaterialRef");
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
  form.value.contentType = '1'//默认学校为普教
  schoolTypeChange('1')//调用普教下的学段
  open.value = true;
  title.value = "添加素材";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getSourceMaterial(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改素材";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["sourceMaterialRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateSourceMaterial(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSourceMaterial(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除？').then(function() {
    return delSourceMaterial(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/sourceMaterial/export', {
    ...queryParams.value
  }, `sourceMaterial_${new Date().getTime()}.xlsx`)
}

getList();
</script>
