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

<!-- <el-dialog :title="title" v-model="open" width="800px" append-to-body class="campus-dialog">
  <el-form ref="baseUserRef" :model="form" :rules="rules" label-width="100px" class="campus-form">
    <div class="form-sections"> -->
      <!-- 基本信息 -->
      <!-- <div class="form-section campus-card">
        <div class="section-header">
          <span class="section-title">学校信息</span>
        </div>
        <div class="form-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="类别" prop="userType">
                <el-select v-model="form.userType" placeholder="请选择用户类别" clearable style="width: 100%" @change="userTypeChange">
                  <el-option
                    v-for="dict in mt_user_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
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
                    :value="form.id ? school.id : school.id + ',' + school.isCollege + ',' + school.isSystem"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="学院" prop="collegeId" v-show="isCollege == '1'">
                <el-select v-model="form.collegeId" placeholder="请选择学院" clearable style="width: 100%"
                :disabled="!form.schoolId"
                @change="collegeChange(form.collegeId)">
                  <el-option
                    v-for="college in selectCollegeList"
                    :key="college.id"
                    :label="college.collegeName"
                    :value="form.id ? college.id : college.id + ',' + college.vocalEduSchoolId"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="系" prop="systemId" v-show="isCollege == '1' && isSystem == '1'">
                <el-select v-model="form.systemId" placeholder="请选择系" clearable style="width: 100%"
                :disabled="isCollege == '1' ? !form.collegeId : !form.schoolId"
                  @change="systemChange">
                  <el-option
                    v-for="system in selectSystemList"
                    :key="system.id"
                    :label="system.systemName"
                    :value="system.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="系" prop="systemId" v-show="isCollege == '0' && isSystem == '1'">
                <el-select v-model="form.systemId" placeholder="请选择系" clearable style="width: 100%"
                :disabled="isCollege == '1' ? !form.collegeId : !form.schoolId"
                  @change="systemChange">
                  <el-option
                    v-for="system in selectSystemList"
                    :key="system.id"
                    :label="system.systemName"
                    :value="system.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="专业" prop="specialityId" v-show="form.schoolId">
                <el-select v-model="form.specialityId" placeholder="请选择专业" clearable style="width: 100%"
                :disabled="!form.systemId"
                @change="specialityChange(form.specialityId, form.userType)">
                  <el-option
                    v-for="speciality in selectSpecialityList"
                    :key="speciality.id"
                    :label="speciality.specialityName"
                    :value="speciality.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>

      <div class="form-section campus-card" v-if="form.userType == '2'">
        <div class="section-header">
          <span class="section-title">年级-班级信息</span>
        </div>
        <div class="form-content"> -->
          <!-- 学生专属信息 -->
          <!-- <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="年级" prop="gradeId">
                <el-select v-model="form.gradeId" placeholder="请选择年级" clearable :disabled="!form.schoolId" @change="gradeChange">
                  <el-option
                    v-for="grade in selectGradeList"
                    :key="grade.id"
                    :label="grade.gradeName"
                    :value="grade.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="班级" prop="classId">
                <el-select v-model="form.classId" placeholder="请选择班级" clearable :disabled="!form.gradeId">
                  <el-option
                    v-for="classItem in selectClassList"
                    :key="classItem.id"
                    :label="classItem.className"
                    :value="classItem.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div> -->

      <!-- 个人信息 -->
      <!-- <div class="form-section campus-card">
        <div class="section-header">
          <span class="section-title">个人信息</span>
        </div>
        <div class="form-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" prop="userName">
                <el-input v-model="form.userName" placeholder="请输入用户姓名" />
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
                  />
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
      </div> -->

      <!-- 账户信息 -->
      <!-- <div class="form-section campus-card">
        <div class="section-header">
          <span class="section-title">账户信息</span>
        </div>
        <div class="form-content">
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
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
          </el-col>

          </el-row>
        </div>
      </div>
    </div>
  </el-form>
  <template #footer>
    <div class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </template>
</el-dialog> -->

    <!-- 添加或修改职教-用户对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="vocalUserRef" :model="form" :rules="rules" label-width="100px" class="dialog-form">
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
          <el-select v-model="form.schoolId" placeholder="请选择学校" clearable filterable style="width: 100%" 
          :disabled="!form.userType"
          @change="schoolChange(form.schoolId, form.userType)">
          <el-option
            v-for="school in schoolList"
            :key="school.id"
            :label="school.schoolName"
            :value="form.id ? school.id : school.id + ',' + school.isCollege + ',' + school.isSystem"
            ></el-option>
          </el-select>
        </el-form-item>
      
        <el-form-item label="学校：" prop="selectSchoolOpections">
                <el-cascader
                    v-model="form.selectSchoolOpections"
                    :options="schoolOptions"
                    :show-all-levels="false"
                    :props="{ 
                        expandTrigger: 'hover',
                        emitPath: true
                    }"
                    placeholder="请选择课程体系"
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                    class="w-full"
                    @change="handleCourseSystemChange"
                />
                {{form.selectSchoolOpections}}
            </el-form-item>
        <el-form-item label="学院" prop="collegeId" v-show="isCollege == '1'">
          <el-select v-model="form.collegeId" placeholder="请选择学院" clearable style="width: 100%"
          :disabled="!form.schoolId"
          @change="collegeChange(form.collegeId)">
            <el-option
              v-for="college in selectCollegeList"
              :key="college.id"
              :label="college.collegeName"
              :value="form.id ? college.id : college.id + ',' + college.vocalEduSchoolId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系" prop="systemId" v-show="isSystem == '1'">
          <el-select v-model="form.systemId" placeholder="请选择系" clearable style="width: 100%"
          :disabled="isCollege == '1' ? !form.collegeId : !form.schoolId"
            @change="systemChange">
            <el-option
              v-for="system in selectSystemList"
              :key="system.id"
              :label="system.systemName"
              :value="system.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="specialityId">
          <el-select v-model="form.specialityId" placeholder="请选择专业" clearable style="width: 100%"
          :disabled="!form.systemId"
          @change="specialityChange(form.specialityId, form.userType)">
            <el-option
              v-for="speciality in selectSpecialityList"
              :key="speciality.id"
              :label="speciality.specialityName"
              :value="speciality.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="gradeId" v-show="form.userType == '2'">
          <el-select v-model="form.gradeId" placeholder="请选择年级" clearable :disabled="!form.specialityId"
          @change="gradeChange">
            <el-option
              v-for="grade in selectGradeList"
              :key="grade.id"
              :label="grade.gradeName"
              :value="grade.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="classId" v-show="form.userType == '2'">
          <el-select v-model="form.classId" placeholder="请选择班级" clearable :disabled="!form.gradeId">
            <el-option
              v-for="classItem in selectClassList"
              :key="classItem.id"
              :label="classItem.className"
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
          <el-select v-model="form.sex" placeholder="请选择用户性别">
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
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>


      <!-- 修改配置对话框 -->
    <el-dialog title="配置科目列表" v-model="configOpen" width="1000px" append-to-body >
      <div class="config-header">
        <!-- {{ configForm }} -->
        <el-descriptions :column="4" border>
          <el-descriptions-item><template #label><el-icon class="icon-tmp"><School /></el-icon>学校</template>{{ configForm.schoolId }}</el-descriptions-item>
          <el-descriptions-item v-show="configForm.collegeId"><template #label><el-icon class="icon-tmp"><School /></el-icon>学院</template>{{ configForm.collegeId }}</el-descriptions-item>
          <el-descriptions-item v-show="configForm.systemId"><template #label><el-icon class="icon-tmp"><School /></el-icon>系</template>{{ configForm.systemId }}</el-descriptions-item>
          <el-descriptions-item><template #label><el-icon class="icon-tmp"><School /></el-icon>专业</template>{{ configForm.specialityId }}</el-descriptions-item>
          <el-descriptions-item><template #label><el-icon class="icon-tmp"><user /></el-icon>姓名</template>{{ configForm.userName }}</el-descriptions-item>
          <el-descriptions-item><template #label><el-icon class="icon-tmp"><Female /></el-icon>性别</template>{{ configForm.sex == '0' ? '男' : '女'}}</el-descriptions-item>
          <el-descriptions-item><template #label><el-icon class="icon-tmp"><ReadingLamp /></el-icon>编号</template>{{ configForm.userNo }}</el-descriptions-item>
          <el-descriptions-item><template #label><el-icon class="icon-tmp"><ReadingLamp /></el-icon>手机号</template>{{ configForm.phonenumber }}</el-descriptions-item>
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
                      :label="grade.gradeName"
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
                      :label="item.className"
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
                  <el-tooltip content="取消后可重新配置科目" placement="bottom" effect="light" v-if="scope.row.id">
                      <el-button plain size="small" @click="handleCancleConfig(scope.row)">
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
                <dict-tag v-for="item in scope.row.vocalCourseList" :key="item.id" :options="mt_school_subject" :value="item.subjectId"/>
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

<script setup name="VocalUser">
import { ElMessage, ElMessageBox } from 'element-plus'
import { listVocalUser, getVocalUser, delVocalUser, addVocalUser, updateVocalUser,
        configCourse,editConfigCourse,deleteConfigCourse,selectConfigCourseById,selectVocalConfigCourseList, getSchoolOptions } from "@/api/glxt/vocalUser";

const { proxy } = getCurrentInstance();
const { mt_user_type, sys_user_sex, mt_school_subject } = proxy.useDict('mt_user_type', 'sys_user_sex', 'mt_school_subject');


//导入学校API
import { vocalListSchool, getSchool } from "@/api/glxt/vocal_school";

//导入学院相关接口
import { listCollege } from '@/api/glxt/vocal_college'

//引入院系api
import { listSystem } from '@/api/glxt/vocal_system'

//引入专业api
import { listSpeciality } from '@/api/glxt/vocal_speciality'

//导入年级API
import { listVocalGrade } from "@/api/glxt/vocal_grade";

//导入班级API
import { listVocalClass } from "@/api/glxt/vocal_class";

//导入科目API
import { listVocalCourse } from "@/api/glxt/vocal_course";
import { ref } from 'vue';





const vocalUserList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");


const schoolOptions = ref([])//获取挂载课程

const getSelectSchoolOptionList = () => {

  getSchoolOptions().then(response => {
    schoolOptions.value = response.data
   
})
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

//用户类型切换的时候，学校下拉数据清空
const userTypeChange = (value) => {
  form.value.schoolId = null//清空学校
  if(value == '2') {//只有当用户类型是学生的时候，才显示年级和班级
    form.value.gradeId = null;//清空年级
    form.value.classId = null;//清空班级
  }
}

//学院
const isCollege = ref('')
//系
const isSystem = ref('')
//新增学生时候，选择学校下拉框
const schoolChange = (value, userType) => {
  isCollege.value == '1' ? form.value.collegeId = null : ''//学院
  form.value.systemId = null//清空系
  form.value.specialityId = null//清空专业
  
  debugger
  //判断  修改的时候将学校id组装成 【学校id+是否有学院+是否有系】用以处理数据 否则会报错
  // value.splice(0, value.length - 1)
  value = !form.id ? value + ',' + isCollege.value + ',' + isSystem.value : value
  if(value != undefined) {
    let arr = value.split(',')
    // if(arr.length == 3) {
    if(arr.length > 0) {
      isCollege.value = arr[1]
  
      isSystem.value = arr[2]
      //获取学院或系
      isCollege.value == '1' ? collegeList(arr[0]) : systemList(arr[0])
    }
  }
  if(userType == '2') {//只有当用户类型是学生的时候，才显示年级和班级
    form.value.gradeId = null;//清空年级
    form.value.classId = null;//清空班级
  }
}

//学院下拉
const collegeChange = (value) => {
  // form.value.systemId = null//清空系
  // form.value.specialityId = null//清空专业
  //判断  修改的时候将学院id组装成 【学院id+学校id】用以处理数据 否则会报错
  // debugger
  value = !form.id ? value + ',' + form.value.schoolId : value
  if(value != undefined) {
    let arr = value.split(',')
    // if(arr.length == 2) {
    if(arr.length > 0) {
      //获取系 
      isCollege.value == '1' ? systemList(arr[1]) : systemList(arr[1])
    }
  }

}

//专业下拉
const systemChange = (value) => {
  // isCollege.value == '1' ? form.value.collegeId = null : ''//学院
  // form.value.systemId = null//清空系
  // form.value.specialityId = null//清空专业
  //获取专业
  specialityList(value)
}

//新增学生时候，选择学校下拉框
const specialityChange = (value, userType) => {
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

//存学院列表
const selectCollegeList = ref([]);
//获取学校下的学院
const collegeList = (schoolId) => {
  try{
    //获取学院列表
    // 分页相关
    const queryParams = {
      pageNum: 1,
      pageSize: 1000,
      vocalEduSchoolId: schoolId
    }
    listCollege(queryParams).then(response => {
      selectCollegeList.value = response.rows;
    });
  } catch (error) {
    ElMessage.error('获取学院数据失败')
  }
}

//存系列表
const selectSystemList = ref([]);
//获取学院下的系
const systemList = (schoolOrCollegeId) => {
  try{
    //获取系列表
    // 分页相关
    const queryParams = {
      pageNum: 1,
      pageSize: 1000,
      schoolOrCollegeId: schoolOrCollegeId
    }
    listSystem(queryParams).then(response => {
      selectSystemList.value = response.rows;
    });
  }catch (error) {
    ElMessage.error('获取系数据失败')
  }
}

//存专业
const selectSpecialityList = ref([])
//获取学院下的系
const specialityList = (systemId) => {
  try{
    //获取系列表
    // 分页相关
    const queryParams = {
      pageNum: 1,
      pageSize: 1000,
      vocalEduSystemId: systemId
    }
    listSpeciality(queryParams).then(response => {
      selectSpecialityList.value = response.rows;
    });
  }catch (error) {
    ElMessage.error('获取专业数据失败')
  }
}

//存年级列表
const selectGradeList = ref([]);

//获取学校下的年级
const gradeList = (specialityId) => {
  try{
    //获取年级列表
     // 分页相关
  const queryParams = {
      pageNum: 1,
      pageSize: 1000,
      vocalEduSpecialityId: specialityId
    }
    listVocalGrade(queryParams).then(response => {
      selectGradeList.value = response.rows;
  });
} catch (error) {
    ElMessage.error('获取年级数据失败')
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
            pageSize: 1000,
            vocalEduGradeId: gradeId
        }
    listVocalClass(queryParams).then(response => {
          if(response.code == 200) {
            selectClassList.value = response.rows;
          }
        });
  } catch (error) {
    ElMessage.error('获取班级数据失败')
  }
}

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
  getSelectSchoolOptionList()
  //获取学校列表
  schoolSelectChange()
  open.value = true;
  title.value = "添加职教-用户";
}


//存当前用户下的学校数据
const schoolData = ref()
//获取学校详情
const getSchoolData = async (id) =>{
  const response = await getSchool(id);
  if(response.code == 200) {
    schoolData.value = response.data
    console.log('获取到的学校数据为:')
    console.log(schoolData.value)
    console.log('获取到的学校数据为:')
    //为了表单中是否有学院和是否有系显示
    isCollege.value = schoolData.value.isCollege
    isSystem.value = schoolData.value.isSystem
  }
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value

  //调用学校列表
  schoolSelectChange()

  //单独调用一下当前学校数据
  getSchoolData(row.schoolId)

  console.log(row)
  //调用学院
  collegeList(row.schoolId)
  //调用系
  //获取学院或系
  isCollege.value == '1' ? collegeList(row.schoolId) : systemList(row.schoolId)
  //调用专业
  specialityList(row.systemId)

  if(row.userType == '2') {
    //调用年级
    gradeList(row.specialityId)
    //调用班级
    classList(row.gradeId)
  }
  getVocalUser(_id).then(response => {
    form.value = response.data;
    form.value.rconfirmPassword = response.data.password;
    // form.value.schoolId = response.data.schoolId + ',' + 1 + ',' + 1
    if(row.userType == '2') {//如果是学生
      form.value.gradeId = response.data.mtStudentGrade ? response.data.mtStudentGrade.gradeId : '暂无年级'//给年级赋值
      form.value.classId = response.data.mtStudentClass ? response.data.mtStudentClass.classId : '暂无班级'//给班级赋值
    }
    open.value = true;
    title.value = "修改职教-用户";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["vocalUserRef"].validate(valid => {
    if (valid) {
      debugger
      if (form.value.id != null) {
        if(form.value.userType == '2') {//如果是学生
          form.value.mtStudentGradeId = form.value.mtStudentGrade.id//学生年级的主键，并不是本身的年级ID
          form.value.mtStudentClassId = form.value.mtStudentClass.id//学生班级的主键，并不是本身的班级ID
        }
        updateVocalUser(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        if(form.value.schoolId != undefined) {//处理学校id
          let arr = form.value.schoolId.split(',')
          if(arr.length == 3) {
            form.value.schoolId = arr[0]
          }
        }
        if(form.value.collegeId != undefined) {//处理学院
          let arr = form.value.collegeId.split(',')
          if(arr.length == 2) {
            form.value.collegeId = arr[0]
          }
        }
        if(form.value.userType == '2') {//如果是学生进行校验年级和班级
          if(!form.value.gradeId) {
              ElMessage.error('年级或班级不能为空')
              return
          }else if(!form.value.classId) {
              ElMessage.error('班级不能为空')
              return
          }
        }
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
  proxy.$modal.confirm('是否确认删除该用户？').then(function() {
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


//获取学校列表
//根据选择的学校类型获取学校列表
function schoolSelectChange() {
  schoolList.value = []
  vocalListSchool({ pageNum: 1, pageSize: 10000 }).then(response => {
      schoolList.value = response.rows;
  });
}

// ================================教师科目配置================================
// 新增的响应式变量
const configOpen = ref(false);
const activeTab = ref('list');//默认打开配置列表
const configForm = ref({});//配置表单
const subjectList = ref([]);//存配置科目列表
const configList = ref([]);//已经配置科目列表
const isShow = ref(true)//配置按钮是否显示, 默认显示
//存学校列表
const schoolList = ref([]);
//存配置科目中的年级列表
const gradeOptions = ref([]);
//存班级
const classListOptions = ref([]);
//存科目
const courseListOptions = ref([]);


// 打开配置对话框
function handleConfig(row) {
  configOpen.value = true;
  configForm.value = { ...row };
  console.log(configForm.value)
  activeTab.value = 'list';//默认打开配置列表
  
  console.log(row.id)
  console.log(configForm.value)

  //获取已经配置列表
  selectConfigList(row.id)
}

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
      pageSize: 1000,
      vocalEduSpecialityId: configForm.value.specialityId
    }
    listVocalGrade(queryParams).then(response => {
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
  row.vocalCourseList.forEach(item => {
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
      pageSize: 1000,
      vocalEduSpecialityId: configForm.value.specialityId
    }
    listVocalGrade(queryParams).then(response => {
      if(response.code == 200) {
        gradeOptions.value = response.rows;
        //获取班级级列表
        // 分页相关
        const queryParams = {
            pageNum: 1,
            pageSize: 1000,
            gradeId: row.gradeId
        }
        listVocalClass(queryParams).then(response => {
          if(response.code == 200) {
            classListOptions.value = response.rows;
              //获取科目列表
            // 分页相关
            const queryParams = {
                pageNum: 1,
                pageSize: 1000,
                vocalEduGradeId: row.gradeId
            }
            listVocalCourse(queryParams).then(response => {
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
        contentType: '2'//职教
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
        contentType: '2'//职教
      };
    
      if(params.courseList.length == 0) {
        ElMessage.error('科目不能为空')
        return
      }
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
// 修改年级变更处理
const handleGradeChange = (row) => {
   //获取班级级列表
  // 分页相关
  const queryParams = {
      pageNum: 1,
      pageSize: 1000,
      vocalEduGradeId: row.grade
  }
  listVocalClass(queryParams).then(response => {
      classListOptions.value = response.rows;
  });

  // row.selectedClass = [];
  // 模拟获取班级列表
  row.isComplete = false;
};

// 处理班级选择变更
const handleClassChange = (row) => {

//获取科目列表
// 分页相关
const queryParams = {
    pageNum: 1,
    pageSize: 1000,
    vocalEduGradeId: row.grade
}
listVocalCourse(queryParams).then(response => {
  courseListOptions.value = response.rows;
});

// 触发视图更新
row.isComplete = isRowComplete(row);

};

// 检查行是否完整填写
const isRowComplete = (row) => {
  return row.subject && row.grade && row.selectedClass && row.selectedClass;
};

// 修改科目变更处理
const handleSubjectChange = (row) => {
  row.isComplete = false;
};

//教师配置列表
const selectConfigList = (teacherId) => {
  return selectVocalConfigCourseList(teacherId).then(response => {
    configList.value = response.rows;
  });
};

getList();
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

/**关闭按钮样式 */
.dialog-footer {
  margin-top: 16px;
  
}

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
    gap: 5px;
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
      // padding-bottom: 10px;
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

    // .form-content {
    //   .el-form-item {
    //     margin-bottom: 16px;
    //   }
    // }
  }
}

.dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #e0e7ed;
  text-align: right;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #6edc93;
}

/**表单字体两端对齐 */
// :deep .el-form-item label:after {
//   content: "";
//   width: 100%;
// }
//  :deep .el-form-item__label {
//  /* display: inline-block必须要有，不然布局出问题，之前我看别人都加在伪类中，我试了没效果 */
//   display: inline-block;
//   text-align: justify;
//   text-align-last: justify;
// }
// /* 这里去除必选字段的*,这个符号会造成一定影响,去掉之后我用了li列表进行定位,在前面加上" * ". */
//  :deep .el-form-item.is-required .el-form-item__label:before {
//   // content: none !important;
// }

</style>