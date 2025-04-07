<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <!-- <el-form-item label="学校" prop="schoolId">
        <el-input
          v-model="queryParams.schoolId"
          placeholder="请输入学校"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
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
      <!-- <el-form-item label="用户类别" prop="userType">
        <el-select v-model="queryParams.userType" style="width: 100px;" placeholder="请选择" clearable>
          <el-option
            v-for="dict in mt_user_type"
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
          v-hasPermi="['glxt:baseUser:add']"
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
          v-hasPermi="['glxt:baseUser:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:baseUser:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['glxt:baseUser:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="baseUserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" width="50px" />
      <el-table-column label="类型" align="center" prop="userType">
        <template #default="scope">
          <dict-tag :options="mt_user_type" :value="scope.row.userType" :style="scope.row.userType == '1' ? 'color:#2ecc71;font-weight: bold' : 'color:#3498db;font-weight: bold'"/>
        </template>
      </el-table-column>
      <el-table-column label="姓名" align="center" prop="userName" />
      <el-table-column label="性别" align="center" prop="sex">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.sex"/>
        </template>
      </el-table-column>
      <el-table-column label="学校" align="center" prop="schoolName">
        <template #default="scope">
          {{scope.row.mtBaseEduSchool ? scope.row.mtBaseEduSchool.schoolName : '--'}}
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center" prop="userNo" />
      <el-table-column label="手机号" align="center" prop="phonenumber" />
      <el-table-column label="帐号状态" align="center" prop="status">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.status == '0'">正常</el-tag>
          <el-tag type="danger" v-else>停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="400px">
        <template #default="scope">
          <el-button plain type="info" v-show="scope.row.userType == '1'" icon="Setting" @click="handleConfig(scope.row)" v-hasPermi="['glxt:baseUser:edit']">配置</el-button>
          <el-button plain type="success" icon="Edit" color="#6EDC93" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:baseUser:edit']">编辑</el-button>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:baseUser:remove']">删除</el-button>
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

    <el-dialog :title="title" v-model="open" width="1000px" append-to-body class="campus-dialog">
  <el-form ref="baseUserRef" :model="form" :rules="rules" label-width="100px" class="campus-form">
    <div class="form-sections">
      <div class="form-section campus-card">
      <div class="section-header">
          <span class="section-title">学校信息</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="类别" prop="userType">
            <el-select v-model="form.userType" placeholder="请选择用户类别" clearable style="width: 100%" @change="userTypeChange">
              <el-option
                v-for="dict in mt_user_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="学校" prop="schoolId">
            <el-select v-model="form.schoolId" placeholder="请选择学校" clearable style="width: 100%" :disabled="!form.userType" @change="schoolChange(form.schoolId, form.userType)">
              <el-option
                v-for="school in schoolList"
                :key="school.id"
                :label="school.schoolName"
                :value="school.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
  
    </div>

    <div class="form-section campus-card" v-if="form.userType == '2'">
        <div class="section-header">
          <span class="section-title">年级-班级信息</span>
        </div>
          <!-- 学生专属信息 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="年级" prop="gradeId">
                <el-select v-model="form.gradeId" placeholder="请选择年级" clearable :disabled="!form.schoolId" @change="gradeChange">
                  <el-option
                    v-for="grade in selectGradeList"
                    :key="grade.id"
                    :label="grade.name"
                    :value="grade.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="班级" prop="classId">
                <el-select v-model="form.classId" placeholder="请选择班级" clearable :disabled="!form.gradeId">
                  <el-option
                    v-for="classItem in selectClassList"
                    :key="classItem.id"
                    :label="classItem.name"
                    :value="classItem.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
      </div>


    <div class="form-section campus-card">
      <div class="section-header">
          <span class="section-title">个人信息</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="userName">
            <el-input v-model="form.userName" placeholder="请输入用户名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="昵称" prop="nickName">
            <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="sex">
            <el-select v-model="form.sex" placeholder="请选择性别" clearable>
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
          <el-form-item :label="form.userType == '2' ? '学生编号' : form.userType == '1' ? '教师编号' : '编号'" prop="userNo">
            <el-input v-model="form.userNo" :placeholder="`请输入${form.userType == '2' ? '学生' : form.userType == '1' ? '教师' : ''}编号`" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="form-section campus-card">
      <div class="section-header">
          <span class="section-title">账户信息</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="form.password" placeholder="请输入密码" show-password/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="确认密码" prop="rconfirmPassword">
            <el-input type="password" v-model="form.rconfirmPassword" placeholder="请确认密码" show-password/>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系方式" prop="phonenumber">
            <el-input v-model="form.phonenumber" placeholder="请输入手机号码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>
    </div>

  </el-form>
  <template #footer>
    <div class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </template>
</el-dialog>
    <!-- 添加或修改用户对话框 -->
    <!-- <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="baseUserRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类别" prop="userType">
          <el-select v-model="form.userType" placeholder="请选择用户类别" clearable style="width: 100%" @change="userTypeChange">
            <el-option
              v-for="dict in mt_user_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学校" prop="schoolId">
          <el-select v-model="form.schoolId" placeholder="请选择学校" clearable style="width: 100%" :disabled="!form.userType" @change="schoolChange(form.schoolId, form.userType)">
            <el-option
              v-for="school in schoolList"
              :key="school.id"
              :label="school.schoolName"
              :value="school.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="gradeId" v-show="form.userType == '2'">
          <el-select v-model="form.gradeId" placeholder="请选择年级" clearable :disabled="!form.schoolId" @change="gradeChange">
            <el-option
              v-for="grade in selectGradeList"
              :key="grade.id"
              :label="grade.name"
              :value="grade.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="classId" v-show="form.userType == '2'">
          <el-select v-model="form.classId" placeholder="请选择班级" clearable :disabled="!form.gradeId">
            <el-option
              v-for="classItem in selectClassList"
              :key="classItem.id"
              :label="classItem.name"
              :value="classItem.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择性别" clearable>
            <el-option
              v-for="dict in sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学生编号" prop="userNo" v-if="form.userType == '2'">
          <el-input v-model="form.userNo" placeholder="请输入学生编号" />
        </el-form-item>
        <el-form-item label="教师编号" prop="userNo" v-else-if="form.userType == '1'">
          <el-input v-model="form.userNo" placeholder="请输入教师编号" />
        </el-form-item>
        <el-form-item label="编号" prop="userNo" v-else>
          <el-input v-model="form.userNo" placeholder="请输入编号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" placeholder="请输入密码" show-password/>
        </el-form-item>
        <el-form-item label="确认密码" prop="rconfirmPassword">
          <el-input type="password" v-model="form.rconfirmPassword" placeholder="请确认密码" show-password/>
        </el-form-item>
        <el-form-item label="联系方式" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
      
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog> -->

    <!-- 修改配置对话框 -->
    <el-dialog title="配置科目列表" v-model="configOpen" width="1000px" append-to-body >
      <div class="config-header">
        <el-descriptions :column="4" border>
          <el-descriptions-item><template #label><el-icon class="icon-tmp"><School /></el-icon>学校</template>{{ configForm.schoolId }}</el-descriptions-item>
          <el-descriptions-item><template #label><el-icon class="icon-tmp"><user /></el-icon>姓名</template>{{ configForm.userName }}</el-descriptions-item>
          <el-descriptions-item><template #label><el-icon class="icon-tmp"><Female /></el-icon>性别</template>{{ configForm.sex == '0' ? '男' : '女'}}</el-descriptions-item>
          <el-descriptions-item><template #label><el-icon class="icon-tmp"><ReadingLamp /></el-icon>编号</template>{{ configForm.userNo }}</el-descriptions-item>
        </el-descriptions>
      </div>

  
      <el-tabs v-model="activeTab" class="mt20" type="card"  @tab-click="handleTabClick">
        <el-tab-pane label="配置科目" name="config">
          <div class="mt20 text-right">
            <el-button plain type="primary" @click="handleAddSubject" v-hasPermi="['glxt:baseUser:add']" v-show="isShow">
              <el-icon><Setting /></el-icon>&nbsp;配置科目
            </el-button>
          </div>
          <div class="config-content">
            <el-table :data="subjectList" empty-text="请点击配置科目按钮进行配置" border>
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column label="年级" align="center">
                <template #default="scope">
                  <!-- {{ scope.row.grade }} -->
                  <el-select 
                    v-model="scope.row.grade" 
                    placeholder="请选择年级" 
                    @change="handleGradeChange(scope.row)"
                    clearable
                  >
                    <el-option
                      v-for="grade in gradeOptions"
                      :key="grade.id"
                      :label="grade.name"
                      :value="grade.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="班级" align="center">
                <template #default="scope">
                  <!-- {{ scope.row.selectedClass }} -->
                  <el-select 
                    v-model="scope.row.selectedClass" 
                    placeholder="请选择班级" 
                    style="width: 200px"
                    :disabled="!scope.row.grade"
                    @change="handleClassChange(scope.row)"
                    clearable
                  >
                    <el-option
                      v-for="item in classListOptions"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="科目" align="center">
                <template #default="scope">
                  <!-- {{ scope.row.subject }} -->
                  <el-select
                    multiple 
                    v-model="scope.row.subject" 
                    placeholder="请选择科目" 
                    :disabled="!scope.row.selectedClass"
                    @change="handleSubjectChange(scope.row)"
                    clearable
                  >
                    <el-option
                      v-for="item in courseListOptions"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" align="center">
                <template #default="scope">
                  <el-button 
                    type="success" 
                    plain
                    size="small" 
                    v-if="isRowComplete(scope.row)"
                    @click="handleSaveConfig(scope.row)"
                  >
                    保存
                  </el-button>
                  <el-tooltip content="取消后可重新配置科目" placement="bottom" effect="light">
                      <el-button plain size="small" v-if="scope.row.id" @click="handleCancleConfig(scope.row)">
                        取消
                      </el-button>
                  </el-tooltip>
                  <el-button 
                    type="danger" 
                    plain
                    size="small"
                    v-if="!scope.row.id"  
                    @click="handleConfigDelete(scope.$index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已配置科目" name="list">
          <el-table v-loading="loading" :data="configList" border style="width: 100%">
            <!-- 添加空标签 -->
            <template #empty>
              <el-empty description="暂无内容" :image-size="100"></el-empty>
            </template>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column label="年级" align="center" prop="gradeName"/>
            <el-table-column label="班级" align="center" prop="className"/>
            <el-table-column label="科目" align="center">
              <template #default="scope">
                <dict-tag v-for="item in scope.row.courseList" :key="item.id" :options="mt_school_subject" :value="item.subjectId"/>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" >
              <template #default="scope">
                <el-button plain type="success" icon="Edit" size="small" color="#6EDC93" @click="handleConfigUpdate(scope.row)" v-hasPermi="['glxt:baseUser:edit']">编辑</el-button>
                <el-button plain type="danger" icon="Delete" size="small" @click="handleConfigDel(scope.row)" v-hasPermi="['glxt:baseUser:remove']">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelConfig">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="BaseUser">
import { ElMessage, ElMessageBox } from 'element-plus'
import { listBaseUser, getBaseUser, delBaseUser, addBaseUser, updateBaseUser, 
          configCourse,editConfigCourse,deleteConfigCourse,selectConfigCourseById,selectConfigCourseList } from "@/api/glxt/baseUser";
const { proxy } = getCurrentInstance();
const { mt_user_type, sys_user_sex, mt_school_subject } = proxy.useDict('mt_user_type', 'sys_user_sex', 'mt_school_subject');
import { encrypt, decrypt } from "@/utils/jsencrypt";
//导入学校API
import { baseListSchool } from "@/api/glxt/base_school";

//导入年级API
import { listGrade } from "@/api/glxt/base_grade";

//导入班级API
import { listClass } from "@/api/glxt/base_class";

//导入科目API
import { listCourse } from "@/api/glxt/base_course";
import { ref } from 'vue';


const baseUserList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
// 新增的响应式变量
const configOpen = ref(false);
const activeTab = ref('list');
const configForm = ref({});
const subjectList = ref([]);
const configList = ref([]);//已经配置科目列表
const isShow = ref(true)//配置按钮是否显示, 默认显示


//存配置科目中的年级列表
const gradeOptions = ref([]);

//存学校列表
const schoolList = ref([]);
//根据选择的学校类型获取学校列表
function schoolSelectChange() {
  schoolList.value = []
  baseListSchool({ pageNum: 1, pageSize: 10000 }).then(response => {
      schoolList.value = response.rows;
  });
}


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
    userName: null,
    nickName: null,
    userNo: null,
    userType: null,
  },
  rules: {
    schoolId: [
      { required: true, message: "学校不能为空", trigger: "blur" }
    ],
    
    // gradeId: [
    //   { required: true, message: "年级不能为空", trigger: "blur" }
    // ],
    // classId: [
    //   { required: true, message: "班级不能为空", trigger: "blur" }
    // ],
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

/** 查询用户列表 */
function getList() {
  loading.value = true;
  listBaseUser(queryParams.value).then(response => {
    baseUserList.value = response.rows;
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
    userName: null,
    nickName: null,
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
  proxy.resetForm("baseUserRef");
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
  //调用学校列表
  schoolSelectChange()
  reset();
  open.value = true;
  title.value = "添加用户";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  //调用学校列表
  schoolSelectChange()

  if(row.userType == '2') {

    //调用年级
    gradeList(row.schoolId)
    //调用班级
    classList(row.gradeId)

  }
  getBaseUser(_id).then(response => {
    form.value = response.data;
    // form.value.password = decrypt(response.data.password)
    form.value.rconfirmPassword = response.data.password;

    if(row.userType == '2') {//如果是学生
      form.value.gradeId = response.data.mtStudentGrade ? response.data.mtStudentGrade.gradeId : '暂无年级'//给年级赋值
      form.value.classId = response.data.mtStudentClass ? response.data.mtStudentClass.classId : '暂无班级'//给班级赋值
    }
    open.value = true;
    title.value = "修改用户";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["baseUserRef"].validate(valid => {
    if (valid) {
      // form.value.password = encrypt(form.value.password);
      if (form.value.id != null) {
        if(form.value.userType == '2') {//如果是学生
          
          form.value.mtStudentGradeId = form.value.mtStudentGrade.id//学生年级的主键，并不是本身的年级ID
          form.value.mtStudentClassId = form.value.mtStudentClass.id//学生班级的主键，并不是本身的班级ID
        }
        updateBaseUser(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        if(form.value.userType == '2') {//如果是学生进行校验年级和班级
          if(!form.value.gradeId) {
              ElMessage.error('年级或班级不能为空')
              return
          }else if(!form.value.classId) {
              ElMessage.error('班级不能为空')
              return
          }
        }
        addBaseUser(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除该用户？').then(function() {
    return delBaseUser(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/baseUser/export', {
    ...queryParams.value
  }, `baseUser_${new Date().getTime()}.xlsx`)
}

// 打开配置对话框
function handleConfig(row) {
  configOpen.value = true;
  configForm.value = { ...row };
  activeTab.value = 'list';//默认打开配置列表
  
  console.log(row.id)
  console.log(configForm.value)

  //获取已经配置列表
  selectConfigList(row.id)
}

// 检查行是否完整填写
const isRowComplete = (row) => {
  return row.subject && row.grade && row.selectedClass && row.selectedClass;
};


//存科目
const courseListOptions = ref([]);
// 处理班级选择变更
const handleClassChange = (row) => {

  //获取科目列表
  // 分页相关
  const queryParams = {
      pageNum: 1,
      pageSize: 10000,
      gradeId: row.grade
  }
  listCourse(queryParams).then(response => {
    courseListOptions.value = response.rows;
  });

  // 触发视图更新
  row.isComplete = isRowComplete(row);

};

// 处理单行配置保存
const handleSaveConfig = (row) => {

  try {
    //编辑
    if(row.id != null){
      const params = {
        id: row.id,
        teacherId: configForm.value.id,
        gradeId: row.grade,//年级
        classId: row.selectedClass, //班级
        courseList: row.subject,//课程
        contentType: '1'//普教
      };
      // 调用保存接口
      editConfigCourse(params).then(() => {
        console.log('save config', params);
        proxy.$modal.msgSuccess("配置修改成功");
        selectConfigList(configForm.value.id)
        activeTab.value = 'list';
      });
    } else {//保存
      const params = {
        teacherId: configForm.value.id,
        gradeId: row.grade,//年级
        classId: row.selectedClass, //班级
        courseList: row.subject,//课程
        contentType: '1'//普教
      };
    
      // 调用保存接口
      configCourse(params).then(() => {
        console.log('save config', params);
        proxy.$modal.msgSuccess("配置保存成功");
        selectConfigList(configForm.value.id)
        activeTab.value = 'list';
      });
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
};

//教师配置列表
const selectConfigList = (teacherId) => {
  return selectConfigCourseList(teacherId).then(response => {
    configList.value = response.rows;
  });
};

// 修改科目变更处理
const handleSubjectChange = (row) => {
  row.isComplete = false;
};

//存班级
const classListOptions = ref([]);
// 修改年级变更处理
const handleGradeChange = (row) => {
   //获取班级级列表
  // 分页相关
  const queryParams = {
      pageNum: 1,
      pageSize: 10000,
      gradeId: row.grade
  }
  listClass(queryParams).then(response => {
      classListOptions.value = response.rows;
  });

  // row.selectedClass = [];
  // 模拟获取班级列表
  row.isComplete = false;
};

// 处理标签页点击
const handleTabClick = (tab) => {
  if(tab.props.name == 'config') {
    //删除之前的
    subjectList.value.splice(0, subjectList.value.length);
  }
  if(tab.props.name == 'list') {
    //将按钮显示
    isShow.value = true
    //获取当前教师配置列表
    selectConfigList(configForm.value.id)
  }
}

//用户类型切换的时候，学校下拉数据清空
const userTypeChange = (value) => {
  form.value.schoolId = null//清空学校
  if(value == '2') {//只有当用户类型是学生的时候，才显示年级和班级
    form.value.gradeId = null;//清空年级
    form.value.classId = null;//清空班级
  }
}

//新增学生时候，选择学校下拉框
const schoolChange = (value, userType) => {
  if(userType == '2') {//只有当用户类型是学生的时候，才显示年级和班级
    form.value.gradeId = null;//清空年级
    form.value.classId = null;//清空班级
    gradeList(value);
  }
}
//新增学生时候，选择年级下拉框
const gradeChange = (value) => {
  form.value.classId = null//清空班级
  classList(value)
}

//存年级列表
const selectGradeList = ref([]);

//获取学校下的年级
const gradeList = (schoolId) => {
  try{
    //获取年级列表
    // 分页相关
    const queryParams = {
        pageNum: 1,
        pageSize: 10000,
        schoolId: schoolId
      }
      listGrade(queryParams).then(response => {
        selectGradeList.value = response.rows;
    });
} catch (error) {
    ElMessage.error('获取数据失败')
  }
}


//存班级列表
const selectClassList = ref([]);
//获取年级下的班级
const classList = (gradeId) => {
  try{
    //获取班级级列表
    // 分页相关
    const queryParams = {
        pageNum: 1,
        pageSize: 10000,
        gradeId: gradeId
    }
    listClass(queryParams).then(response => {
      if(response.code == 200) {
        selectClassList.value = response.rows;
      }
    });
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
}


// 修改添加科目方法
const handleAddSubject = () => {
  subjectList.value.push({
    id: null,//判断编辑还是保存
    subject: '',
    grade: '',
    selectedClass: [],
    classList: [],
    isComplete: false
  });
  //获取年级列表
  // 分页相关
  const queryParams = {
      pageNum: 1,
      pageSize: 10000,
      schoolId: configForm.value.schoolId
    }
    listGrade(queryParams).then(response => {
      gradeOptions.value = response.rows;
  });
};


//修改配置项
const handleConfigUpdate = (row) => {
  //先删除缓存
  subjectList.value.splice(0, subjectList.value.length);
  //切换到配置栏
  activeTab.value = 'config';
  //编辑的时候将配置栏中的配置科目按钮隐藏
  isShow.value = false

  //组装课程列表
  const subjectArr = []
  row.courseList.forEach(item => {
    subjectArr.push(item.id)
  });
  
  subjectList.value.push({
    id: row.id,
    subject: subjectArr,
    grade: row.gradeId,
    selectedClass: row.classId,
    classList: [],
    isComplete: false
  });

  try{
 //获取年级列表
  // 分页相关
  const queryParams = {
      pageNum: 1,
      pageSize: 10000,
      schoolId: configForm.value.schoolId
    }
    listGrade(queryParams).then(response => {
      if(response.code == 200) {
        gradeOptions.value = response.rows;
        //获取班级级列表
        // 分页相关
        const queryParams = {
            pageNum: 1,
            pageSize: 10000,
            gradeId: row.gradeId
        }
        listClass(queryParams).then(response => {
          if(response.code == 200) {
            classListOptions.value = response.rows;
              //获取科目列表
            // 分页相关
            const queryParams = {
                pageNum: 1,
                pageSize: 1000,
                gradeId: row.gradeId
            }
            listCourse(queryParams).then(response => {
              courseListOptions.value = response.rows;
            });
          }
        });
      }
  });
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
  
  // console.log(row)
};


//保存科目配置逻辑删除列表
function handleConfigDelete(index) {
  subjectList.value.splice(index, 1);
}

// 删除配置项
function handleConfigDel(row) {
  // subjectList.value.splice(index, 1);
  console.log('删除了' + row)
  ElMessageBox.confirm('确定要删除该数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteConfigCourse(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        //刷新当前教师列表
        selectConfigList(row.teacherId)
      }else{
        ElMessage.error('删除失败')
      }
    })
  })
}


// 配置验证
function validateConfig() {
  for (const item of subjectList.value) {
    if (!item.subject) {
      proxy.$modal.msgError("请选择科目");
      return false;
    }
    if (!item.grade) {
      proxy.$modal.msgError("请选择年级");
      return false;
    }
    if (!item.selectedClass.length) {
      proxy.$modal.msgError("请选择班级");
      return false;
    }
  }
  return true;
}

//编辑中取消按钮
function handleCancleConfig() {
  subjectList.value = [];//清空表单列表
  isShow.value = true //恢复配置课程按钮
}


// 取消配置
function cancelConfig() {
  configOpen.value = false;
  configForm.value = {};
  subjectList.value = [];
}

getList(); //获取用户列表
</script>

<style lang="scss" scoped>
.mt20 {
  margin-top: 20px;
}
.text-right {
  margin-top: 5px;
  text-align: left;
  margin-bottom: 10px;
}
.el-select {
  width: 100%;
}
/* .config-content {
  min-height: 300px;
} */
/* 设置tabs下的表格容器最小高度 */
/* .el-tab-pane {
  min-height: 100px;
} */

.config-content .el-select {
  width: 100%;
}

.config-content {
  margin-top: 10px;
}

/* 可选：美化表格内的按钮间距 */
.el-button + .el-button {
  margin-left: 8px;
}

/**图标布局 */
.icon-tmp{
  position: relative;
  top: 2px;
  margin-right: 2px;
}


.school-dialog {
  background: #f5f9fc;
  border-radius: 12px;
}

.school-dialog .el-dialog__header {
  background: linear-gradient(135deg, #6edc93, #3498db);
  border-radius: 12px 12px 0 0;
  padding: 20px;
}

.school-dialog .el-dialog__title {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

/* .form-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}*/



/* 表单布局样式优化 */
.campus-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}

.campus-form {
  .form-sections {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .campus-card {
    background: #fff;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid #ebeef5;

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #ebeef5;

      .el-icon {
        color: #6EDC93;
        margin-right: 8px;
      }

      span {
        font-size: 16px;
        font-weight: 500;
        color: #2c3e50;
      }
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #6edc93;
} 

.dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #e0e7ed;
  margin-top: 40px;
  text-align: right;
}
.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  color: #34495e;
  font-weight: 500;
}

.el-input__inner,
.el-select {
  border-radius: 6px;
}

.dialog-footer {
  text-align: right;
  /* padding: 20px 0 0; */
}

.el-button {
  border-radius: 6px;
  padding: 10px 20px;
}

/* .el-button--primary {
  background: linear-gradient(135deg, #6edc93, #3498db);
  border: none;
} */

.el-button--primary:hover {
  opacity: 0.9;
}

</style>
