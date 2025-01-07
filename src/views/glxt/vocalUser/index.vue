<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户编号" prop="userNo">
        <el-input
          v-model="queryParams.userNo"
          placeholder="请输入用户编号"
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
          v-hasPermi="['glxt:vocalUser:add']"
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
          v-hasPermi="['glxt:vocalUser:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:vocalUser:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['glxt:vocalUser:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="vocalUserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" width="50px" />
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="用户昵称" align="center" prop="nickName" />
      <el-table-column label="用户性别" align="center" prop="sex">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.sex"/>
        </template>
      </el-table-column>
      <el-table-column label="用户编号" align="center" prop="userNo" />
      <el-table-column label="手机号码" align="center" prop="phonenumber" />
      <el-table-column label="用户邮箱" align="center" prop="email" />
      <el-table-column label="用户类别" align="center" prop="userType"> 
        <template #default="scope">
          <dict-tag :options="mt_user_type" :value="scope.row.userType"/>
        </template>
      </el-table-column>
      <el-table-column label="帐号状态" align="center" prop="status">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.status == '0'">正常</el-tag>
          <el-tag type="danger" v-else>停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="400px">
        <template #default="scope">
          <el-button plain type="info" v-show="scope.row.userType == '1'" icon="Setting" @click="handleConfig(scope.row)" v-hasPermi="['glxt:vocalUser:edit']">配置</el-button>
          <el-button plain type="success" icon="Edit" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:vocalUser:edit']">修改</el-button>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:vocalUser:remove']">删除</el-button>
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

    <!-- 添加或修改职教-用户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="vocalUserRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类别" prop="userType">
          <el-select v-model="form.userType" placeholder="请选择用户类别" clearable style="width: 100%">
            <el-option
              v-for="dict in mt_user_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        {{ form.userType }}
        <el-form-item label="学校" prop="schoolId">
          <el-select v-model="form.schoolId" placeholder="请选择学校" clearable style="width: 100%">
            <el-option
              v-for="dict in mt_user_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学院" prop="collegeId">
          <el-select v-model="form.collegeId" placeholder="请选择学院" clearable style="width: 100%">
            <el-option
              v-for="dict in mt_user_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系" prop="systemId">
          <el-select v-model="form.systemId" placeholder="请选择系" clearable style="width: 100%">
            <el-option
              v-for="dict in mt_user_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="specialityId">
          <el-select v-model="form.specialityId" placeholder="请选择专业" clearable style="width: 100%">
            <el-option
              v-for="dict in mt_user_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="gradeId" v-show="form.userType == '2'">
          <el-select v-model="form.gradeId" placeholder="请选择年级" clearable :disabled="form.schoolId">
            <el-option
              v-for="dict in mt_user_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="classId" v-show="form.userType == '2'">
          <el-select v-model="form.classId" placeholder="请选择班级" clearable :disabled="form.gradeId">
            <el-option
              v-for="dict in mt_user_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="用户性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择用户性别">
            <el-option
              v-for="dict in sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户编号" prop="userNo">
          <el-input v-model="form.userNo" placeholder="请输入用户编号" />
        </el-form-item>
        <el-form-item label="密码" prop="password" >
          <el-input type="password" v-model="form.password" placeholder="请输入密码" show-password/>
        </el-form-item>
        <el-form-item label="确认密码" prop="rconfirmPassword">
          <el-input type="password" v-model="form.rconfirmPassword" placeholder="请确认密码" show-password/>
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入用户邮箱" />
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

<script setup name="VocalUser">
import { listVocalUser, getVocalUser, delVocalUser, addVocalUser, updateVocalUser } from "@/api/glxt/vocalUser";

const { proxy } = getCurrentInstance();
const {mt_user_type, sys_user_sex } = proxy.useDict('mt_user_type','sys_user_sex');

const vocalUserList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

//确认密码校验
const equalToPassword = (rule, value, callback) => {
  if (form.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    schoolId: null,
    collegeId: null,
    systemId: null,
    specialityId: null,
    userName: null,
    userNo: null,
    userType: null,
  },
  rules: {
    schoolId: [
      { required: true, message: "学校不能为空", trigger: "blur" }
    ],
    userName: [
      { required: true, message: "用户名称不能为空", trigger: "blur" }
    ],
    sex: [
      { required: true, message: "用户名称不能为空", trigger: "blur" }
    ],
    userNo: [
      { required: true, message: "用户编号不能为空", trigger: "blur" }
    ],
    password: [
      { required: true, trigger: "blur", message: "请输入您的密码" },
      { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
      { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
    ],
    rconfirmPassword: [
      { required: true, trigger: "blur", message: "请再次输入您的密码" },
      { required: true, validator: equalToPassword, trigger: "blur" }
    ],
    phonenumber: [
      { required: true, message: "手机号码不能为空", trigger: "blur" },
      { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }
    ],
    userType: [
      { required: true, message: "用户类别不能为空", trigger: "change" }
    ],
    email: [
      { required: true, message: "邮箱不能为空", trigger: "blur" },
      { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);



/** 查询职教-用户列表 */
function getList() {
  loading.value = true;
  listVocalUser(queryParams.value).then(response => {
    vocalUserList.value = response.rows;
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
    collegeId: null,
    systemId: null,
    specialityId: null,
    userName: null,
    nickName: null,
    sex: null,
    userNo: null,
    password: null,
    phonenumber: null,
    email: null,
    userType: null,
    status: null,
    loginIp: null,
    loginDate: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    delFlag: null
  };
  proxy.resetForm("vocalUserRef");
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
  open.value = true;
  title.value = "添加职教-用户";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getVocalUser(_id).then(response => {
    form.value = response.data;
    form.value.rconfirmPassword = response.data.password;
    open.value = true;
    title.value = "修改职教-用户";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["vocalUserRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateVocalUser(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addVocalUser(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除职教-用户编号为"' + _ids + '"的数据项？').then(function() {
    return delVocalUser(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/vocalUser/export', {
    ...queryParams.value
  }, `vocalUser_${new Date().getTime()}.xlsx`)
}

getList();
</script>
