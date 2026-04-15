<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="栏目名称" prop="columnName">
        <el-input
          v-model="queryParams.columnName"
          placeholder="请输入栏目名称"
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
          v-hasPermi="['glxt:column:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['glxt:column:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:column:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['glxt:column:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="columnList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="55" align="center" prop="id" />
      <el-table-column label="缩略图" align="center" prop="thumbnail">
        <template #default="scope">
          <image-preview :src="scope.row.thumbnail" :width="100" :height="100"/>
        </template>
      </el-table-column>
      <el-table-column label="学校类型" align="center" prop="contentType">
        <template #default="scope">
          <dict-tag :options="mt_school_type" :value="scope.row.contentType"/>
        </template>
      </el-table-column>
      <el-table-column label="栏目名称" align="center" prop="columnName" />
      <el-table-column label="版本教材" align="center">
              <template #default="{ row }">
                <div class="column-systems">
                  <el-tag
                    v-for="(system, index) in row.courseSystems"
                    :key="index"
                    size="small"
                    class="course-system-tag"
                  >
                    {{ `${getSubjectName(system[0], '1')}-${system[1]}-${system[2]}` }}
                  </el-tag>
                </div>
              </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="同步更新" align="center" prop="realTimeUpdate" >
                  <template #default="scope">
                    <el-switch
                        v-model="scope.row.realTimeUpdate"
                        active-value="1"
                        inactive-value="0"
                        @change="handleStatusChange(scope.row)"
                    ></el-switch>
                  </template>
              </el-table-column>
      <el-table-column label="操作" align="center" min-width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button plain type="success" color="#6EDC93" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:column:edit']">修改</el-button>
          <router-link :to="'/glxt/column-data/index/' + scope.row.id + '-' + scope.row.contentType + '-' + scope.row.periodType" class="link-type">
                <el-button plain type="info" icon="Notification">内容管理</el-button>
          </router-link>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:column:remove']">删除</el-button>

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

    <!-- 添加或修改栏目对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="columnRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="缩略图" prop="thumbnail">
          <image-upload v-model="form.thumbnail"/>
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
            @change="periodTypeChange()"
              v-for="dict in form.contentType=='1'?mt_academic_stage:mt_vocal_education_type"
              :key="dict.value"
              :value="dict.value"
            
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>


        <!-- 新增栏目分类 -->
        <el-form-item label="分类" prop="classification">
              <el-radio-group v-model="form.classification">
                <el-radio
                  v-for="dict in column_classification"
                  :key="dict.value"
                  :value="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
        </el-form-item>
        <el-form-item label="名称" prop="columnName">
          <el-input v-model="form.columnName" placeholder="请输入栏目名称" />
        </el-form-item>
        <el-form-item label="版本教材" required>
          <el-cascader
            style="width: 100%;"
            v-model="form.courseSystems"
            :options="courseSystemOptions"
            :props="{ 
              expandTrigger: 'hover',
              multiple: true,
              emitPath: true
            }"
            placeholder="请选择课程体系"
            clearable
            collapse-tags
            collapse-tags-tooltip
            class="w-full"
          />
          <!-- {{ form.courseSystems }} -->
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <!-- <el-input v-model="form.remark" placeholder="请输入备注" /> -->
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="2"
            placeholder="请输入备注" 
            maxlength="500"
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

<script setup name="Column">
import { listColumn, getColumn, delColumn, addColumn, updateColumn, changeRealTimeUpdateStatus } from "@/api/glxt/column";

import { getCourseSystemOptions } from '@/api/glxt/subject'
import { useTeacherInfo } from '@/store/modules/teacherInfo'
const { proxy } = getCurrentInstance();
const { mt_real_time_update, mt_school_type,mt_academic_stage, mt_vocal_education_type, mt_school_subject,mt_vocal_school_subject, column_classification } = 
proxy.useDict('mt_real_time_update', 'mt_school_type','mt_academic_stage', 'mt_vocal_education_type', 'mt_school_subject', 'mt_vocal_school_subject', 'column_classification');
const { isTeacher, schoolType: userSchoolType } = useTeacherInfo()


const columnList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const contentTypes = ref([]);
const periodTypes = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    columnName: null,
  },
  rules: {
    classification: [
      { required: true, message: "分类不能为空", trigger: "blur" }
    ],
    columnName: [
      { required: true, message: "栏目名称不能为空", trigger: "blur" }
    ],
    realTimeUpdate: [
      { required: true, message: "是否开启同步更新 0否 1是不能为空", trigger: "change" }
    ],
    thumbnail: [
      { required: true, message: "缩略图不能为空", trigger: "blur" }
    ],
    // schoolId: [
    //   { required: true, message: "关联学校id不能为空", trigger: "blur" }
    // ],
    contentType: [
      { required: true, message: "学校类型不能为空", trigger: "change" }
    ],
    periodType: [
      { required: true, message: "学段不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

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

//学段更改后
const periodTypeChange = () => {
  getCourseSystemOptionList(form.value.contentType, form.value.periodType)
}


const courseSystemOptions = ref([])

//获取挂载课程
const getCourseSystemOptionList = (schoolType, academicStage) => {
  getCourseSystemOptions(schoolType, academicStage).then(response => {
    courseSystemOptions.value = response.data

    courseSystemOptions.value.forEach(item => {
      item.label = getSubjectName(item.value, schoolType);
    })
  })
}

//获取科目名称
const getSubjectName = (subjectType, schoolType) => {
  if(subjectType == '' || subjectType == undefined || subjectType == null) return;
  return schoolType == '1'? mt_school_subject.value ?.find(item => item.value === subjectType).label : mt_vocal_school_subject.value ?.find(item => item.value === subjectType).label
}



//同步更新状态更改
function handleStatusChange(row) {
  let text = row.realTimeUpdate === "0" ? "停用" : "启用";
  proxy.$modal.confirm('确认要"' + text + '"' + '吗?').then(function () {
    return changeRealTimeUpdateStatus(row);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.realTimeUpdate = row.realTimeUpdate === "0" ? "1" : "0";
  });
};

/** 查询栏目列表 */
function getList() {
  loading.value = true;
  listColumn(queryParams.value).then(response => {
    columnList.value = response.rows;
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
    columnName: null,
    realTimeUpdate: null,
    thumbnail: null,
    schoolId: null,
    contentType: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    delFlag: null,
    classification: null,
  };
  proxy.resetForm("columnRef");
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
  contentTypes.value = selection.map(item => item.contentType);//类型
  periodTypes.value = selection.map(item => item.periodType);//学段
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  form.value.contentType = '1'//默认学校为普教

  form.value.classification = '1'//默认分类为学科
  schoolTypeChange('1')//调用普教下的学段
  //获取挂载课程体系
  getCourseSystemOptionList(form.value.contentType, form.value.periodType)
  open.value = true;
  title.value = "添加栏目";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  const _contentType = row.contentType || contentTypes.value
  const _periodType = row.periodType || periodTypes.value

   //获取挂载课程体系
  getCourseSystemOptionList(_contentType, _periodType)
  getColumn(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改栏目";
  });
}

/**跳转页面 */
function handleJumpTo(){

}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["columnRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateColumn(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addColumn(form.value).then(response => {
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
    return delColumn(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/column/export', {
    ...queryParams.value
  }, `column_${new Date().getTime()}.xlsx`)
}

// 栏目页面查询表单没有学校类型选择器，后端SchoolUtils自动过滤
getList();
</script>

<style lang="scss" scoped>

.course-system-tag{
  // white-space: pre-wrap;//换行
  margin-left: 20px;
  margin-top: 5px;
}
.link-type{
  margin: 0 5px;
}
</style>