<template>
   <div class="app-container">
      <el-row :gutter="20">
         <!--部门数据-->
         <el-col :span="4" :xs="24">
            <div class="head-container">
               <el-input
                  v-model="deptName"
                  placeholder="请输入部门名称"
                  clearable
                  prefix-icon="Search"
                  style="margin-bottom: 20px"
               />
            </div>
            <div class="head-container">
               <el-tree
                  :data="deptOptions"
                  :props="{ label: 'label', children: 'children' }"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  ref="deptTreeRef"
                  node-key="id"
                  highlight-current
                  default-expand-all
                  @node-click="handleNodeClick"
               />
            </div>
         </el-col>
         <!--用户数据-->
         <el-col :span="20" :xs="24">
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
               <el-form-item label="用户名称" prop="userName">
                  <el-input
                     v-model="queryParams.userName"
                     placeholder="请输入用户名称"
                     clearable
                     style="width: 240px"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
               <el-form-item label="手机号码" prop="phonenumber">
                  <el-input
                     v-model="queryParams.phonenumber"
                     placeholder="请输入手机号码"
                     clearable
                     style="width: 240px"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
               <el-form-item label="状态" prop="status">
                  <el-select
                     v-model="queryParams.status"
                     placeholder="用户状态"
                     clearable
                     style="width: 240px"
                  >
                     <el-option
                        v-for="dict in sys_normal_disable"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                     />
                  </el-select>
               </el-form-item>
               <el-form-item label="创建时间" style="width: 308px;">
                  <el-date-picker
                     v-model="dateRange"
                     value-format="YYYY-MM-DD"
                     type="daterange"
                     range-separator="-"
                     start-placeholder="开始日期"
                     end-placeholder="结束日期"
                  ></el-date-picker>
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
                     v-hasPermi="['system:user:add']"
                  >新增</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="success"
                     plain
                     icon="Edit"
                     :disabled="single"
                     @click="handleUpdate"
                     v-hasPermi="['system:user:edit']"
                  >修改</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="danger"
                     plain
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['system:user:remove']"
                  >删除</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="info"
                     plain
                     icon="Upload"
                     @click="handleImport"
                     v-hasPermi="['system:user:import']"
                  >导入</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="warning"
                     plain
                     icon="Download"
                     @click="handleExport"
                     v-hasPermi="['system:user:export']"
                  >导出</el-button>
               </el-col>
               <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
            </el-row>

            <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
               <el-table-column type="selection" width="50" align="center" />
               <el-table-column label="用户编号" align="center" key="userId" prop="userId" v-if="columns[0].visible" />
               <el-table-column label="用户名称" align="center" key="userName" prop="userName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
               <el-table-column label="用户昵称" align="center" key="nickName" prop="nickName" v-if="columns[2].visible" :show-overflow-tooltip="true" />
               <el-table-column label="部门" align="center" key="deptName" prop="dept.deptName" v-if="columns[3].visible" :show-overflow-tooltip="true" />
               <el-table-column label="手机号码" align="center" key="phonenumber" prop="phonenumber" v-if="columns[4].visible" width="120" />
               <el-table-column label="状态" align="center" key="status" v-if="columns[5].visible">
                  <template #default="scope">
                     <el-switch
                        v-model="scope.row.status"
                        active-value="0"
                        inactive-value="1"
                        @change="handleStatusChange(scope.row)"
                     ></el-switch>
                  </template>
               </el-table-column>
               <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[6].visible" width="160">
                  <template #default="scope">
                     <span>{{ parseTime(scope.row.createTime) }}</span>
                  </template>
               </el-table-column>
               <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
                  <template #default="scope">
                     <el-tooltip content="修改" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="删除" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="重置密码" placement="top" v-if="scope.row.userId !== 1">
                         <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="分配角色" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                     </el-tooltip>
                  </template>
               </el-table-column>
            </el-table>
            <pagination
               v-show="total > 0"
               :total="total"
               v-model:page="queryParams.pageNum"
               v-model:limit="queryParams.pageSize"
               @pagination="getList"
            />
         </el-col>
      </el-row>

      <!-- 添加或修改用户配置对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-tabs v-model="activeTab">
            <el-tab-pane label="普通用户" name="00">
               <el-form :model="form" :rules="rules" ref="userRef" label-width="80px">
                  <el-row>
                     <el-col :span="12">
                        <el-form-item label="用户昵称" prop="nickName">
                           <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
                        </el-form-item>
                     </el-col>
                     <el-col :span="12">
                        <el-form-item label="归属部门" prop="deptId">
                           <el-tree-select
                              v-model="form.deptId"
                              :data="deptOptions"
                              :props="{ value: 'id', label: 'label', children: 'children' }"
                              value-key="id"
                              placeholder="请选择归属部门"
                              check-strictly
                           />
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row>
                     <el-col :span="12">
                        <el-form-item label="手机号码" prop="phonenumber">
                           <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
                        </el-form-item>
                     </el-col>
                     <el-col :span="12">
                        <el-form-item label="邮箱" prop="email">
                           <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row>
                     <el-col :span="12">
                        <el-form-item v-if="form.userId == undefined" label="用户名称" prop="userName">
                           <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
                        </el-form-item>
                     </el-col>
                     <el-col :span="12">
                        <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
                           <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password />
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row>
                     <el-col :span="12">
                        <el-form-item label="用户性别">
                           <el-select v-model="form.sex" placeholder="请选择">
                              <el-option
                                 v-for="dict in sys_user_sex"
                                 :key="dict.value"
                                 :label="dict.label"
                                 :value="dict.value"
                              ></el-option>
                           </el-select>
                        </el-form-item>
                     </el-col>
                     <el-col :span="12">
                        <el-form-item label="状态">
                           <el-radio-group v-model="form.status">
                              <el-radio
                                 v-for="dict in sys_normal_disable"
                                 :key="dict.value"
                                 :value="dict.value"
                              >{{ dict.label }}</el-radio>
                           </el-radio-group>
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row>
                     <el-col :span="12">
                        <el-form-item label="岗位">
                           <el-select v-model="form.postIds" multiple placeholder="请选择">
                              <el-option
                                 v-for="item in postOptions"
                                 :key="item.postId"
                                 :label="item.postName"
                                 :value="item.postId"
                                 :disabled="item.status == 1"
                              ></el-option>
                           </el-select>
                        </el-form-item>
                     </el-col>
                     <el-col :span="12">
                        <el-form-item label="角色">
                           <el-select v-model="form.roleIds" multiple placeholder="请选择">
                              <el-option
                                 v-for="item in roleOptions"
                                 :key="item.roleId"
                                 :label="item.roleName"
                                 :value="item.roleId"
                                 :disabled="item.status == 1"
                              ></el-option>
                           </el-select>
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row>
                     <el-col :span="24">
                        <el-form-item label="备注">
                           <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
                        </el-form-item>
                     </el-col>
                  </el-row>
               </el-form>
            </el-tab-pane>
            <el-tab-pane label="教师用户" name="11">
               <el-form :model="form" :rules="rules" ref="teacherRef" label-width="80px">
                  <el-row>
                     <el-col :span="12">
                        <el-form-item label="学校类型" prop="schoolType">
                           <el-select
                              v-model="schoolType"
                              placeholder="请选择学校类型"
                              @change="handleSchoolTypeChange"
                           >
                              <el-option label="普教" value="1" />
                              <el-option label="职教" value="2" />
                           </el-select>
                        </el-form-item>
                     </el-col>
                     <el-col :span="12">
                        <el-form-item label="所属学校" prop="deptId">
                           <el-tree-select
                              v-model="form.deptId"
                              :data="filteredDeptOptions"
                              :props="{ value: 'id', label: 'label', children: 'children' }"
                              value-key="id"
                              placeholder="请选择所属学校"
                              filterable
                              check-strictly
                              @change="handleDeptChange"
                           />
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row>
                     <el-col :span="12">
                        <el-form-item label="教师" prop="teacherId">
                           <el-tree-select
                              v-model="form.teacherId"
                              :data="teacherList"
                              :props="{ value: 'id', label: 'userName', children: 'children' }"
                              value-key="id"
                              placeholder="请选择教师"
                              check-strictly
                              @change="handleTeacherChange"
                           />
                        </el-form-item>
                     </el-col>
                     <el-col :span="12">
                        <el-form-item label="手机号码" prop="phonenumber">
                           <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row>
                     <el-col :span="12">
                        <el-form-item label="邮箱" prop="email">
                           <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                        </el-form-item>
                     </el-col>
                     <el-col :span="12">
                        <el-form-item label="昵称" prop="nickName">
                           <el-input v-model="form.nickName" placeholder="请输入教师昵称" maxlength="30" />
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row>
                     <el-col :span="12">
                        <el-form-item label="教师性别">
                           <el-select v-model="form.sex" placeholder="请选择">
                              <el-option
                                 v-for="dict in sys_user_sex"
                                 :key="dict.value"
                                 :label="dict.label"
                                 :value="dict.value"
                              ></el-option>
                           </el-select>
                        </el-form-item>
                     </el-col>
                     <el-col :span="12">
                        <el-form-item label="状态">
                           <el-radio-group v-model="form.status">
                              <el-radio
                                 v-for="dict in sys_normal_disable"
                                 :key="dict.value"
                                 :value="dict.value"
                              >{{ dict.label }}</el-radio>
                           </el-radio-group>
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row v-if="form.userId == undefined">
                     <el-col :span="24">
                        <el-form-item label="登录密码" prop="password">
                           <el-input v-model="form.password" placeholder="请输入登录密码" type="password" maxlength="20" show-password />
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row>
                     <el-col :span="12">
                        <el-form-item label="职位">
                           <el-select v-model="form.postIds" multiple placeholder="请选择" disabled>
                              <el-option
                                 v-for="item in postOptions"
                                 :key="item.postId"
                                 :label="item.postName"
                                 :value="item.postId"
                                 :disabled="item.status == 1"
                              ></el-option>
                           </el-select>
                        </el-form-item>
                     </el-col>
                     <el-col :span="12">
                        <el-form-item label="角色">
                           <el-select v-model="form.roleIds" multiple placeholder="请选择" disabled>
                              <el-option
                                 v-for="item in roleOptions"
                                 :key="item.roleId"
                                 :label="item.roleName"
                                 :value="item.roleId"
                                 :disabled="item.status == 1"
                              ></el-option>
                           </el-select>
                        </el-form-item>
                     </el-col>
                  </el-row>
                  <el-row>
                     <el-col :span="24">
                        <el-form-item label="备注">
                           <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                        </el-form-item>
                     </el-col>
                  </el-row>
               </el-form>
            </el-tab-pane>
         </el-tabs>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 用户导入对话框 -->
      <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
         <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :action="upload.url + '?updateSupport=' + upload.updateSupport"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            drag
         >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
               <div class="el-upload__tip text-center">
                  <div class="el-upload__tip">
                     <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
                  </div>
                  <span>仅允许导入xls、xlsx格式文件。</span>
                  <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
               </div>
            </template>
         </el-upload>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitFileForm">确 定</el-button>
               <el-button @click="upload.open = false">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="User">
import { getToken } from "@/utils/auth";
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user";



import { listBaseUser } from "@/api/glxt/baseUser";
import { listVocalUser } from "@/api/glxt/vocalUser";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex");

const userList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const deptName = ref("");
const deptOptions = ref(undefined);
const initPassword = ref(undefined);
const postOptions = ref([]);
const roleOptions = ref([]);
const activeTab = ref('00');

/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
});
// 列显隐信息
const columns = ref([
  { key: 0, label: `用户编号`, visible: true },
  { key: 1, label: `用户名称`, visible: true },
  { key: 2, label: `用户昵称`, visible: true },
  { key: 3, label: `部门`, visible: true },
  { key: 4, label: `手机号码`, visible: true },
  { key: 5, label: `状态`, visible: true },
  { key: 6, label: `创建时间`, visible: true }
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined
  },
  rules: {
    userName: [
      { required: true, message: "用户名称不能为空", trigger: "blur" },
      { min: 2, max: 20, message: "用户名称长度必须介于 2 和 20 之间", trigger: "blur" }
    ],
    nickName: [
      { required: true, message: "用户昵称不能为空", trigger: "blur" }
    ],
    password: [
      { required: true, message: "用户密码不能为空", trigger: "blur" },
      { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
      { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\ |", trigger: "blur" }
    ],
    email: [
      { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
    ],
    phonenumber: [
      { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }
    ],
    deptId: [
      { required: true, message: "请选择所属部门", trigger: "change" }
    ],
    teacherId: [
      { required: true, message: "请选择教师", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);


//获取教师

const schoolType = ref('1');
const selectedSchoolId = ref(null);
const teacherQueryParams = ref({
    pageNum: 1,
    pageSize: 100,
    userType: '1'
})
/** 查询教师用户列表 */
const teacherList = ref([]);
const teacherTotal = ref(0);
function getTeacherList() {
  loading.value = true;
  const api = schoolType.value === '2' ? listVocalUser : listBaseUser;
  const params = { ...teacherQueryParams.value };
  if (selectedSchoolId.value) {
    params.schoolId = selectedSchoolId.value;
  }
  api(params).then(response => {
    teacherList.value = response.rows;
    teacherTotal.value = response.total;
    loading.value = false;
  });
}

/** 切换学校类型时重置学校和教师，自动分配对应角色 */
function handleSchoolTypeChange() {
  form.value.deptId = undefined;
  form.value.teacherId = undefined;
  selectedSchoolId.value = null;
  teacherList.value = [];
  // 自动分配角色：普教=3，职教=2
  form.value.roleIds = schoolType.value === '1' ? [3] : [2];
}

/** 根据学校类型过滤部门树 - 只显示对应类型的学校节点 */
const filteredDeptOptions = computed(() => {
  if (!deptOptions.value) return [];
  return filterDeptsBySchoolType(deptOptions.value, schoolType.value);
});

function filterDeptsBySchoolType(depts, type) {
  if (!depts) return [];
  return depts.map(dept => {
    if (dept.schoolType) {
      return dept;
    }
    const filteredChildren = dept.children ? filterDeptsBySchoolType(dept.children, type) : [];
    return { ...dept, children: filteredChildren };
  }).filter(dept => {
    if (dept.schoolType) return dept.schoolType === type;
    return dept.children && dept.children.length > 0;
  });
}

/** 选择学校后加载该学校教师 */
function handleDeptChange(deptId) {
  selectedSchoolId.value = null;
  form.value.teacherId = undefined;
  if (!deptId) return;
  // 从部门树中找到对应节点的schoolId
  const node = findDeptNode(deptOptions.value, deptId);
  if (node && node.schoolId) {
    selectedSchoolId.value = node.schoolId;
    getTeacherList();
  }
}

function findDeptNode(depts, id) {
  for (const dept of depts) {
    if (dept.id === id) return dept;
    if (dept.children) {
      const found = findDeptNode(dept.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** 选择教师后自动回填信息 */
function handleTeacherChange(teacherId) {
  if (!teacherId) return;
  const teacher = teacherList.value.find(t => t.id === teacherId);
  if (teacher) {
    form.value.phonenumber = teacher.phonenumber || form.value.phonenumber;
    form.value.email = teacher.email || form.value.email;
    form.value.sex = teacher.sex || form.value.sex;
    form.value.userName = teacher.userNo || form.value.userName;
    form.value.nickName = teacher.userName || form.vaule.nickName
  }
}
/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};

/** 根据名称筛选部门树 */
watch(deptName, val => {
  proxy.$refs["deptTreeRef"].filter(val);
});

/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data;
  });
};

/** 查询用户列表 */
function getList() {
  loading.value = true;
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    loading.value = false;
    userList.value = res.rows;
    total.value = res.total;
  });
};

/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id;
  handleQuery();
};

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.deptId = undefined;
  proxy.$refs.deptTreeRef.setCurrentKey(null);
  handleQuery();
};

/** 删除按钮操作 */
function handleDelete(row) {
  const userIds = row.userId || ids.value;
  proxy.$modal.confirm('是否确认删除用户编号为"' + userIds + '"的数据项？').then(function () {
    return delUser(userIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
};

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  },`user_${new Date().getTime()}.xlsx`);
};

/** 用户状态修改  */
function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.userName + '"用户吗?').then(function () {
    return changeUserStatus(row.userId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
};

/** 更多操作 */
function handleCommand(command, row) {
  switch (command) {
    case "handleResetPwd":
      handleResetPwd(row);
      break;
    case "handleAuthRole":
      handleAuthRole(row);
      break;
    default:
      break;
  }
};

/** 跳转角色分配 */
function handleAuthRole(row) {
  const userId = row.userId;
  router.push("/system/user-auth/role/" + userId);
};

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
    inputValidator: (value) => {
      if (/<|>|"|'|\||\\/.test(value)) {
        return "不能包含非法字符：< > \" ' \\\ |"
      }
    },
  }).then(({ value }) => {
    resetUserPwd(row.userId, value).then(response => {
      proxy.$modal.msgSuccess("修改成功，新密码是：" + value);
    });
  }).catch(() => {});
};

/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 导入按钮操作 */
function handleImport() {
  upload.title = "用户导入";
  upload.open = true;
};

/** 下载模板操作 */
function importTemplate() {
  proxy.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
};

/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
};

/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};

/** 监听标签页切换 */
watch(activeTab, (newVal) => {
  if (newVal === '11') {
    rules.value.deptId[0].message = "请选择所属学校";
    form.value.postIds = [4];
    // 根据当前学校类型自动分配角色
    form.value.roleIds = schoolType.value === '1' ? [3] : [2];
    getTeacherList();
  } else {
    rules.value.deptId[0].message = "请选择所属部门";
  }
});

/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: "0",
    remark: undefined,
    postIds: [],
    roleIds: [],
    userType: activeTab.value,
    schoolType: undefined,
    teacherId: undefined
  };
  schoolType.value = '1';
  selectedSchoolId.value = null;
  teacherList.value = [];
  proxy.resetForm("userRef");
  if (activeTab.value === '11') {
    proxy.resetForm("teacherRef");
  }
};

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
  activeTab.value = '00';
  schoolType.value = '1';
};

/** 新增按钮操作 */
function handleAdd() {
  reset();
  getUser().then(response => {
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    open.value = true;
    title.value = "添加用户";
    form.value.password = initPassword.value;
  });
};

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const userId = row.userId || ids.value;
  getUser(userId).then(response => {
    form.value = response.data;
    activeTab.value = response.data.userType
    if (response.data.schoolType) {
      schoolType.value = response.data.schoolType;
    }
    if (activeTab.value === '11' && response.data.deptId) {
      // 编辑时根据部门找到schoolId并加载教师列表
      const node = findDeptNode(deptOptions.value, response.data.deptId);
      if (node && node.schoolId) {
        selectedSchoolId.value = node.schoolId;
      }
      
      getTeacherList();
    }

    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    form.value.postIds = response.postIds;
    form.value.roleIds = response.roleIds;
    open.value = true;
    title.value = "修改用户";
    form.password = "";
  });
};

/** 提交按钮 */
function submitForm() {
  const formRef = activeTab.value === '00' ? proxy.$refs["userRef"] : proxy.$refs["teacherRef"];
  formRef.validate(valid => {
    if (valid) {
      // 设置用户类型
      form.value.userType = activeTab.value;
      form.value.schoolType = schoolType.value;
      
      if (form.value.userId != undefined) {
        updateUser(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
         if(activeTab.value === '11'){//教师
            // form.value.userName = form.value.nickName
         }
        addUser(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
};

getDeptTree();
getList();
</script>
