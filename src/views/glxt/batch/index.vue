<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <!-- <el-form-item label="学段id" prop="periodId">
        <el-input
          v-model="queryParams.periodId"
          placeholder="请输入学段id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="科目id" prop="subjectId">
        <el-input
          v-model="queryParams.subjectId"
          placeholder="请输入科目id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="教材id" prop="versionId">
        <el-input
          v-model="queryParams.versionId"
          placeholder="请输入教材id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分册id" prop="volumeId">
        <el-input
          v-model="queryParams.volumeId"
          placeholder="请输入分册id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="激活有效起" prop="activeStartTime">
        <el-date-picker clearable
          v-model="queryParams.activeStartTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择激活有效起">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="激活有效止" prop="activeEndTime">
        <el-date-picker clearable
          v-model="queryParams.activeEndTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择激活有效止">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="渠道商编码
        " prop="channelNo">
        <el-input
          v-model="queryParams.channelNo"
          placeholder="请输入渠道商编码
"
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
          @click="handleAdd"
          v-hasPermi="['glxt:batch:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['glxt:batch:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:batch:remove']"
        >删除</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Download"
          @click="handleImport"
          v-hasPermi="['glxt:batch:export']"
        >导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Upload"
          @click="handleExport"
          v-hasPermi="['glxt:batch:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="batchList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="学校类型" align="center" prop="schoolType" >
        <template #default="scope">
          <dict-tag :options="mt_school_type" :value="scope.row.schoolType"/>
        </template>
      </el-table-column>
      <el-table-column label="学段" align="center" prop="periodId" >

        <template #default="scope">
          <dict-tag :options="scope.row.schoolType == '1' ? mt_academic_stage : mt_vocal_education_type" :value="scope.row.periodId"/>
        </template>
      </el-table-column>
      <el-table-column label="科目" align="center" prop="subjectId">

        <template #default="scope">
          <dict-tag :options="scope.row.schoolType == '1' ? mt_school_subject : mt_vocal_school_subject" :value="scope.row.subjectId"/>
        </template>

      </el-table-column>
      <el-table-column label="教材" align="center" prop="versionName" />
      <el-table-column label="分册" align="center" prop="volumeName" />
      <el-table-column label="激活有效起" align="center" prop="activeStartTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.activeStartTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="激活有效止" align="center" prop="activeEndTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.activeEndTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="渠道商编码" align="center" prop="channelNo" /> -->
      <el-table-column label="批次名称" align="center" prop="batchName" />
      <el-table-column label="批次数量" align="center" prop="batchNumber" />
      <el-table-column label="激活码" align="center" prop="mtSerialNumber"  width="280">
        <template #default="scope">
          <el-popover
            placement="top-start"
            trigger="hover"
            :width="500"
            :content="scope.row.mtSerialNumber"
          >
            <template #reference>
              <el-button plain type="primary" icon="DocumentCopy" >{{ scope.row.mtSerialNumber.serialNumber }}</el-button>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <!-- <el-table-column label="类型:0正式使用1非正式使用" align="center" prop="type" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="180">
        <template #default="scope">
          <el-button plain type="success" color="#6EDC93" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:batch:edit']">修改</el-button>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:batch:remove']">删除</el-button>
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

    <!-- 添加或修改批次对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="batchRef" :model="form" :rules="rules" label-width="110px">
        <!-- <el-form-item label="学校类型" prop="schoolType">
          <el-input v-model="form.schoolType" placeholder="请输入学校类型" />
        </el-form-item>
        <el-form-item label="学段" prop="periodId">
          <el-input v-model="form.periodId" placeholder="请输入学段" />
        </el-form-item> -->

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
        <el-form-item label="学段" prop="periodId">
          <el-radio-group v-model="form.periodId">
            <el-radio
              v-for="dict in form.schoolType=='1'?mt_academic_stage:mt_vocal_education_type"
              :key="dict.value"
              :value="dict.value"
              @change="academicStageChange"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- {{ form.courseSystems}} -->
        <!-- 新增教材体系和知识点体系 -->
        <el-form-item label="教材体系" prop="courseSystems">
                <el-cascader
                    style="width: 100%;"
                    v-model="form.courseSystems"
                    :options="courseSystemOptions"
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

        <!-- <el-form-item label="科目" prop="subjectId">
          <el-input v-model="form.subjectId" placeholder="请输入科目" />
        </el-form-item>
        <el-form-item label="教材" prop="versionId">
          <el-input v-model="form.versionId" placeholder="请输入教材" />
        </el-form-item>
        <el-form-item label="分册" prop="volumeId">
          <el-input v-model="form.volumeId" placeholder="请输入分册" />
        </el-form-item> -->
        <!-- <el-form-item label="激活有效起" prop="activeStartTime">
          <el-date-picker clearable
            v-model="form.activeStartTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择激活有效起">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="激活有效止" prop="activeEndTime">
          <el-date-picker clearable
            v-model="form.activeEndTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择激活有效止">
          </el-date-picker>
        </el-form-item> -->
        <el-form-item label="激活有效期" prop="activePeriod">
          <el-date-picker
            v-model="activePeriod"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleActivePeriodChange"
            style="width: 100%"
            clearable>
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="实验可使用日起
" prop="experimentStartTime">
          <el-date-picker clearable
            v-model="form.experimentStartTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择实验可使用日起
">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实验可使用日止
" prop="experimentEndTime">
          <el-date-picker clearable
            v-model="form.experimentEndTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择实验可使用日止
">
          </el-date-picker>
        </el-form-item> -->
        <el-form-item label="价格" prop="price">
          <el-input type="number" v-model="form.price" placeholder="请输入价格" />
        </el-form-item>
      
        <el-form-item label="渠道商编码" prop="channelNo">
          <el-input v-model="form.channelNo" placeholder="请输入渠道商编码" />
        </el-form-item>
        <el-form-item label="批次参数" prop="batchParam">
          <el-input v-model="form.batchParam" placeholder="请输入批次参数" />
        </el-form-item>
        <el-form-item label="批次名称" prop="batchName">
          <el-input v-model="form.batchName" placeholder="请输入批次名称" />
        </el-form-item>
        <el-form-item label="批次数量" prop="batchNumber">
          <el-input type="number" v-model="form.batchNumber" placeholder="请输入批次数量" />
        </el-form-item>
        <el-form-item label="限制次数" prop="limitCount">
          <el-input type="number"  v-model="form.limitCount" placeholder="请输入限制次数" />
        </el-form-item>

        <el-form-item label="说明" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入说明" type="textarea" 
          :rows="2"/>
        </el-form-item>
        <!-- <el-divider content-position="center">批次-激活码信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddMtSerialNumber">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteMtSerialNumber">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="mtSerialNumberList" :row-class-name="rowMtSerialNumberIndex" @selection-change="handleMtSerialNumberSelectionChange" ref="mtSerialNumber">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50"/>
          <el-table-column label="序列号" prop="serialNumber" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.serialNumber" placeholder="请输入序列号" />
            </template>
          </el-table-column>
          <el-table-column label="0未激活1已激活" prop="activite" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.activite" placeholder="请输入0未激活1已激活" />
            </template>
          </el-table-column>
        </el-table> -->
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

<script setup name="Batch">
import { listBatch, getBatch, delBatch, addBatch, updateBatch } from "@/api/glxt/batch";

const { proxy } = getCurrentInstance();

const { mt_academic_stage, mt_source_material_type, mt_school_type, mt_vocal_education_type,mt_school_subject,mt_vocal_school_subject } = 
proxy.useDict('mt_academic_stage', 'mt_source_material_type', 'mt_school_type','mt_vocal_education_type','mt_school_subject','mt_vocal_school_subject');



import {getCourseSystemOptions } from '@/api/glxt/subject'



const batchList = ref([]);
const mtSerialNumberList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedMtSerialNumber = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    schoolType: null,
    periodId: null,
    subjectId: null,
    versionId: null,
    volumeId: null,
    activeStartTime: null,
    activeEndTime: null,
    channelNo: null,
  },
  rules: {
    schoolType: [
      { required: true, message: "学校类型不能为空", trigger: "change" }
    ],
    periodId: [
      { required: true, message: "学段不能为空", trigger: "change" }
    ],
    courseSystems: [
      { required: true, message: "教材体系不能为空", trigger: "change" }
    ],
    // activePeriod: [
    //   { required: true, message: "有效期不能为空", trigger: "change" }
    // ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询批次列表 */
function getList() {
  loading.value = true;
  listBatch(queryParams.value).then(response => {
    batchList.value = response.rows;
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
    schoolType: null,
    periodId: null,
    subjectId: null,
    versionId: null,
    volumeId: null,
    activeStartTime: null,
    activeEndTime: null,
    experimentStartTime: null,
    experimentEndTime: null,
    price: null,
    remark: null,
    channelNo: null,
    batchParam: null,
    batchName: null,
    batchNumber: null,
    type: null,
    limitCount: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    delFlag: null
  };
  mtSerialNumberList.value = [];
  activePeriod.value = [];
  proxy.resetForm("batchRef");
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
  getCourseSystemOptionList('1','1')//调用普教下的课程体系
  open.value = true;
  title.value = "添加批次";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getBatch(_id).then(response => {
    form.value = response.data;
    mtSerialNumberList.value = response.data.mtSerialNumberList;
    open.value = true;
    title.value = "修改批次";

    schoolTypeChange(form.value.schoolType)//调用普教下的学段
    getCourseSystemOptionList(form.value.schoolType,form.value.periodId)
     // 设置日期范围
     if (form.value.activeStartTime && form.value.activeEndTime) {
      activePeriod.value = [form.value.activeStartTime, form.value.activeEndTime];
    }
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["batchRef"].validate(valid => {
    if (valid) {
      form.value.mtSerialNumberList = mtSerialNumberList.value;
      if (form.value.id != null) {
        updateBatch(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addBatch(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除该数据？').then(function() {
    return delBatch(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 批次-激活码序号 */
function rowMtSerialNumberIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 批次-激活码添加按钮操作 */
function handleAddMtSerialNumber() {
  let obj = {};
  obj.serialNumber = "";
  obj.activite = "";
  mtSerialNumberList.value.push(obj);
}

/** 批次-激活码删除按钮操作 */
function handleDeleteMtSerialNumber() {
  if (checkedMtSerialNumber.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的批次-激活码数据");
  } else {
    const mtSerialNumbers = mtSerialNumberList.value;
    const checkedMtSerialNumbers = checkedMtSerialNumber.value;
    mtSerialNumberList.value = mtSerialNumbers.filter(function(item) {
      return checkedMtSerialNumbers.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleMtSerialNumberSelectionChange(selection) {
  checkedMtSerialNumber.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/batch/export', {
    ...queryParams.value
  }, `batch_${new Date().getTime()}.xlsx`)
}

/**导入按钮 */
getList();
function handleImport() {

  console.log("导入")
}


// 在 script setup 中添加
const activePeriod = ref([]);

// 处理日期范围变化
function handleActivePeriodChange(val) {
  if (val) {
    form.value.activeStartTime = val[0];
    form.value.activeEndTime = val[1];
  } else {
    form.value.activeStartTime = null;
    form.value.activeEndTime = null;
  }
}



//学段
const educationStage = ref([])

//学校类型改变时，学段改变
const schoolTypeChange = (value) => {
  //清空学段的数据
    form.value.periodId = '1'
    if(value == '1'){
        educationStage.value = mt_academic_stage
    }else{
        educationStage.value = mt_vocal_education_type
    }
}


//选完学段获取科目教材列表
const academicStageChange = (value) => {

//清空教材体系和知识点的数据
form.value.courseSystems = []
form.value.knowledgePoints = []

getCourseSystemOptionList(form.value.schoolType, value)
}



const courseSystemOptions = ref([])//获取挂载课程
const getCourseSystemOptionList = (schoolType, academicStage) => {

    getCourseSystemOptions(schoolType, academicStage).then(response => {
        courseSystemOptions.value = response.data
        // console.log(courseSystemOptions.value)
        courseSystemOptions.value.forEach(item => {
        item.label = getSubjectName(schoolType,item.value);
        })
    })
}


const handleCourseSystemChange = (data) => {
  // if(data == '' || data == undefined || data == null){
  //   console.log('data为空')
  //   //清空知识点的数据
  //   form.value.knowledgePoints = []
  //   return
  // }
    form.value.courseSystems = data
    console.log(form.value.courseSystems)
    console.log('进来了')
    console.log(data)
    console.log('进来了')

    //清空知识点的数据
    //  form.value.knowledgePoints = []

}

//获取科目名称
const getSubjectName = (schoolType, subjectType) => {
    return schoolType=='1' ? 
    mt_school_subject.value ?.find(item => item.value === subjectType).label : 
    mt_vocal_school_subject.value ?.find(item => item.value === subjectType).label
}

</script>
