<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="学校类型" prop="schoolType">
        <el-select v-model="queryParams.schoolType" style="width: 100px;" clearable @change="handleQuery">
          <el-option
            v-for="dict in mt_school_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备SN号" prop="deviceNo" style="width: 170px;">
        <el-input
          v-model="queryParams.deviceNo"
          placeholder="设备SN号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    
      <!-- <el-form-item label="是否激活" prop="isStateActivation">
        <el-select v-model="queryParams.isStateActivation" style="width: 100px;" clearable>
          <el-option
            v-for="dict in mt_is_active_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否启动" prop="isStart">
        <el-select v-model="queryParams.isStart" style="width: 100px;" clearable>
          <el-option
            v-for="dict in mt_is_start_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['glxt:device:add']"
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
          v-hasPermi="['glxt:device:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:device:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['glxt:device:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="deviceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" prop="id" width="50px"/>
      <el-table-column label="类型" align="center" prop="schoolId" >
        <template #default="scope">
          <dict-tag :options="mt_school_type" :value="scope.row.schoolType"/>
        </template>
      </el-table-column>
      <el-table-column label="学校" align="center" prop="schoolName" />
      <el-table-column label="设备SN号" align="center" prop="deviceNo" />
      <el-table-column label="是否绑定" align="center" prop="isBinding">
        <template #default="scope">
          <dict-tag :options="mt_is_binding_type" :value="scope.row.isBinding"/>
        </template>
      </el-table-column>
      <el-table-column label="是否激活" align="center" prop="isStateActivation">
        <template #default="scope">
          <dict-tag :options="mt_is_active_type" :value="scope.row.isStateActivation"/>
        </template>
      </el-table-column>
      <el-table-column label="是否启动" align="center" prop="isStart">
        <template #default="scope">
          <dict-tag :options="mt_is_start_type" :value="scope.row.isStart"/>
        </template>
      </el-table-column>
      <el-table-column label="起止时间" align="center" prop="startTime" width="200">
        <template #default="scope">
          <span v-if="scope.row.startTime">{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}&nbsp;至&nbsp;{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300px">
        <template #default="scope">
          <el-button plain type="success" color="#6EDC93" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:device:edit']">修改</el-button>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:device:remove']">删除</el-button>
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

    <!-- 添加或修改设备管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="deviceRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="学校类型：" prop="schoolType">
          <el-select v-model="form.schoolType" placeholder="请选择学校类型" :disabled="form.id" clearable @change="schoolTypeChange">
            <el-option
              v-for="dict in mt_school_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;校：" prop="schoolId">
          <el-select v-model="form.schoolId" placeholder="请选择学校" :disabled="schoolDisabled" clearable filterable>
            <el-option
              v-for="dict in schoolList"
              :key="dict.id"
              :label="dict.schoolName"
              :value="dict.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备SN号：" prop="deviceNo">
          <el-input v-model="form.deviceNo" placeholder="请输入设备SN号" />
        </el-form-item>
        <el-form-item label="是否绑定：" prop="isBinding">
          <el-select v-model="form.isBinding" placeholder="是否绑定" clearable>
            <el-option
              v-for="dict in mt_is_binding_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否激活：" prop="isStateActivation">
          <el-select v-model="form.isStateActivation" placeholder="是否激活" clearable>
            <el-option
              v-for="dict in mt_is_active_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否启动：" prop="isStart">
          <el-select v-model="form.isStart" placeholder="是否启动" clearable>
            <el-option
              v-for="dict in mt_is_start_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="起止时间：" prop="startTime">
          <el-date-picker clearable
            v-model="dateDefault"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="截止日期"/>
        </el-form-item>
        <el-form-item label="备&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注：" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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

<script name="Device" setup>
import { listDevice, getDevice, delDevice, addDevice, updateDevice } from "@/api/glxt/device";
import { ref, reactive, watch, onMounted } from 'vue';
const { proxy } = getCurrentInstance();
const { mt_is_active_type, mt_is_start_type, mt_is_binding_type, mt_school_type } = proxy.useDict('mt_is_active_type', 'mt_is_start_type', 'mt_is_binding_type', 'mt_school_type');


//引入普教-学校相关接口
import { baseListSchool } from "@/api/glxt/base_school";

//引入职教-学校相关接口
import { vocalListSchool } from "@/api/glxt/vocal_school";

const deviceList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const schoolDisabled = ref(true);

//存学校列表
const schoolList = ref([]);

//默认日期
const dateDefault = ref([]);
// 表单引用
const deviceRef = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    schoolId: null,
    schoolType: null,
    deviceNo: null,
    isBinding: null,
    isStateActivation: null,
    isStart: null,
    startTime: null,
    endTime: null,
  },
  rules: {
    schoolType: [
      { required: true, message: "学校类型不能为空", trigger: "change" }
    ],
    schoolId: [
      { required: true, message: "学校不能为空", trigger: "change" },
      // { required: true, validator: schoolChange, trigger: "blur" }
    ],
    deviceNo: [
      { required: true, message: "设备SN号不能为空", trigger: "blur" }
    ],
    isBinding: [
      { required: true, message: "不能为空", trigger: "change" }
    ],
    isStateActivation: [
      { required: true, message: "不能为空", trigger: "change" }
    ],
    isStart: [
      { required: true, message: "不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);


//根据选择的学校类型获取学校列表
function schoolTypeChange(value) {
  schoolList.value = []
  form.value.schoolId = null;
  schoolDisabled.value = true;
  if (value == '1') {
    schoolDisabled.value = false;
    baseListSchool({ pageNum: 1, pageSize: 1000 }).then(response => {
      schoolList.value = response.rows;
    });
  } else if (value == '2') {
    schoolDisabled.value = false;
    vocalListSchool({ pageNum: 1, pageSize: 1000 }).then(response => {
      schoolList.value = response.rows;
    })
  }
}


/** 查询设备管理列表 */
function getList() {
  console.log(queryParams.value)
  loading.value = true;
  listDevice(queryParams.value).then(response => {
    deviceList.value = response.rows;
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
    schoolId: null,
    deviceNo: null,
    remark: null,
    isBinding: null,
    isStateActivation: null,
    isStart: null,
    startTime: null,
    endTime: null,
    createBy: null,
    createTime: null,
    modifyBy: null,
    modifyTime: null,
    delFlag: null
  };
  proxy.resetForm("deviceRef");
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


// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
// 设置默认值
onMounted(() => {
    // 初始化日期
    dateDefault.value = [formatDate(new Date()), '2099-12-31'];
});

// 监听 dateDefault 的变化
watch(dateDefault, (newVal) => {
  if (newVal || newVal.length === 2) {
    form.value.startTime = newVal[0];
    form.value.endTime = newVal[1];
  } else {
    form.value.startTime = newVal[0];
    form.value.endTime = newVal[1];
  }
}, {immediate: true});


/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  schoolDisabled.value = true;//学校禁止
  title.value = "添加设备";
  // 初始化日期
  dateDefault.value[0] = formatDate(new Date());
  dateDefault.value[1] = '2099-12-31';
  form.value.startTime = dateDefault.value[0];
  form.value.endTime = dateDefault.value[1];
}

/** 修改按钮操作 */
function handleUpdate(row) {
  schoolDisabled.value = true;//学校禁止
  reset();
  //获取通过类型获取学校
  if (row.schoolType == '1') {
    baseListSchool({ pageNum: 1, pageSize: 1000 }).then(response => {
      schoolList.value = response.rows;
    });
  } 
  if (row.schoolType == '2') {
    vocalListSchool({ pageNum: 1, pageSize: 1000 }).then(response => {
      schoolList.value = response.rows;
    })
  }

  const _id = row.id || ids.value
  getDevice(_id).then(response => {
    form.value = response.data;
    // 初始化日期
    dateDefault.value[0] = form.value.startTime;
    dateDefault.value[1] = form.value.endTime;
    open.value = true;
    title.value = "修改设备管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deviceRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateDevice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDevice(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除设备管理编号为"' + _ids + '"的数据项？').then(function() {
    return delDevice(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/device/export', {
    ...queryParams.value
  }, `device_${new Date().getTime()}.xlsx`)
}



getList();
</script>

<style lang="scss" scoped>



</style>