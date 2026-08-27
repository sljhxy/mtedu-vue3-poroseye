<template>
  <div class="basic-info-container">
    <!-- 主内容区域包装器 -->
    <div class="main-content-wrapper">
      <!-- 标签页 -->
      <div class="tabs-wrapper">
        <el-tabs v-model="activeTab" class="custom-tabs"  @tab-click="handleTabChange">
          <el-tab-pane label="AB包" name="abPackage">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>AB包</span>
              </div>
            </template>

            <div class="compact-form">
              <!-- 搜索栏 -->
              <div class="search-wrapper">
                <div class="search-section" v-show="isSearchVisible">
                  <el-form :inline="false" :model="queryExperimentDataUploadParams">
                    <el-row :gutter="20">
                      <el-col :span="4">
                        <el-form-item label="文件名称">
                          <el-input 
                            v-model="queryExperimentDataUploadParams.fileName" 
                            placeholder="请输入名称"
                            @input="handleDataUploadSearch('ab', queryExperimentDataUploadParams.fileName)"
                            clearable/>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form>
                </div>
                <div class="operation-bar">
                  <div class="left-buttons">
                    <el-button type="primary" @click="handleUpload('ab')" icon="Upload" plain>上传</el-button>
                  </div>
                  <div class="right-buttons">
                    <el-button
                      plain
                      circle
                      :icon="isSearchVisible ? 'ArrowUp' : 'ArrowDown'"
                      @click="toggleSearch"
                    />
                    <el-button 
                      plain
                      circle 
                      icon="Refresh" 
                      @click="handleRefresh"
                    />
                  </div>
                </div>
              </div>

              <el-table v-loading="loading" :data="experimentDataUploadPageList" border>
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column label="文件名称" min-width="200" align="left">
                  <template #default="scope">
                    <div class="du-file-name">{{ scope.row.fileName }}</div>
                    <div class="du-file-meta">{{ scope.row.fileSize }} · {{ abTypeLabel(scope.row.abType) }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="版本号" min-width="150" align="left">
                  <template #default="scope">
                    <div class="du-version-item"><span class="du-version-label">AB包</span><span class="du-version-value">{{ scope.row.abVersion }}</span></div>
                    <div class="du-version-item"><span class="du-version-label">框架</span><span class="du-version-value">{{ scope.row.abFrameVersion }}</span></div>
                    <div class="du-version-item"><span class="du-version-label">SDK</span><span class="du-version-value">{{ scope.row.abSdkVersion }}</span></div>
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" align="left" show-overflow-tooltip min-width="140" />
                <el-table-column prop="createTime" label="上传时间" align="center" />
                <el-table-column label="操作" align="center" width="240">
                  <template #default="scope">
                    <div style="white-space: nowrap">
                      <el-button type="warning" plain @click="handleDownload(scope.row)">下载</el-button>
                      <el-button type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
                      <el-button type="danger" plain @click="handleDelete(scope.row)">删除</el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container">
                <el-pagination
                  v-model:page ="queryExperimentDataUploadParams.pageNum"
                  v-model:limit ="queryExperimentDataUploadParams.pageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  :total="total"
                  v-show="total > 0"
                  background
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleChange"
                  @current-change="handleChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="WEBGL-ZIP" name="webgl">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>WEBGL-ZIP</span>
              </div>
            </template>
            <div class="compact-form">
              <!-- 搜索栏 -->
              <div class="search-wrapper">
                <div class="search-section" v-show="isSearchVisible">
                  <el-form :inline="false" :model="queryExperimentDataUploadParams">
                    <el-row :gutter="20">
                      <el-col :span="4">
                        <el-form-item label="文件名称">
                          <el-input 
                            v-model="queryExperimentDataUploadParams.fileName" 
                            placeholder="请输入名称"
                            @input="handleDataUploadSearch('webgl', queryExperimentDataUploadParams.fileName)"
                            clearable/>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form>
                </div>
                <div class="operation-bar">
                  <div class="left-buttons">
                    <el-button type="primary" @click="handleUpload('webgl')" icon="Upload" plain>上传</el-button>
                  </div>
                  <div class="right-buttons">
                    <el-button
                      plain
                      circle
                      :icon="isSearchVisible ? 'ArrowUp' : 'ArrowDown'"
                      @click="toggleSearch"
                    />
                    <el-button 
                      plain
                      circle 
                      icon="Refresh" 
                      @click="handleRefresh"
                    />
                  </div>
                </div>
              </div>


              <el-table v-loading="loading" :data="experimentDataUploadPageList" border>
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="fileName" label="文件名称" align="center" />
                <el-table-column prop="zipVersion" label="版本号" align="center" />
                <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip min-width="120" />
                <el-table-column prop="fileSize" label="文件大小" align="center" />
                <el-table-column prop="createTime" label="上传时间" align="center" />
                <el-table-column label="操作" align="center" width="200" >
                  <template #default="scope">
                    <el-button type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" plain @click="handleDelete(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container">
                <el-pagination
                  v-model:page ="queryExperimentDataUploadParams.pageNum"
                  v-model:limit ="queryExperimentDataUploadParams.pageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  :total="total"
                  v-show="total > 0"
                  background
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleChange"
                  @current-change="handleChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="视频文件" name="video">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>视频文件</span>
              </div>
            </template>
            <div class="compact-form">

                <!-- 搜索栏 -->
              <div class="search-wrapper">
                <div class="search-section" v-show="isSearchVisible">
                  <el-form :inline="false" :model="queryExperimentDataUploadParams">
                    <el-row :gutter="20">
                      <el-col :span="4">
                        <el-form-item label="文件名称">
                          <el-input 
                            v-model="queryExperimentDataUploadParams.fileName" 
                            placeholder="请输入名称"
                            @input="handleDataUploadSearch('video', queryExperimentDataUploadParams.fileName)"
                            clearable/>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form>
                </div>
                <div class="operation-bar">
                  <div class="left-buttons">
                    <el-button type="primary" @click="handleUpload('video')" icon="Upload" plain>上传</el-button>
                  </div>
                  <div class="right-buttons">
                    <el-button
                      plain
                      circle
                      :icon="isSearchVisible ? 'ArrowUp' : 'ArrowDown'"
                      @click="toggleSearch"
                    />
                    <el-button 
                      plain
                      circle 
                      icon="Refresh" 
                      @click="handleRefresh"
                    />
                  </div>
                </div>
              </div>

              <el-table v-loading="loading" :data="experimentDataUploadPageList" border>
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="fileName" label="文件名称" align="center"/>
                <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip min-width="120"/>
                <el-table-column prop="size" label="文件大小" align="center"/>
                <el-table-column prop="createTime" label="上传时间" align="center"/>
                <el-table-column label="操作" align="center" width="200">
                  <template #default="scope">
                    <el-button type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" plain @click="handleDelete(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container">
                <el-pagination
                  v-model:page ="queryExperimentDataUploadParams.pageNum"
                  v-model:limit ="queryExperimentDataUploadParams.pageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  :total="total"
                  v-show="total > 0"
                  background
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleChange"
                  @current-change="handleChange"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 文件上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" :title="uploadDialogTitle" width="600px" class="upload-dialog" style="margin-top: 5vh !important;">
      <el-form ref="submitFormRef" :model="submitForm" :rules="rules" label-width="120px">
        <el-form-item :label="fileBtnName" prop="fileUrl">
          <file-upload v-model="submitForm.fileUrl" @fileData="fileSuccessData" :fileSuffix="currentUploadType" :before-upload="beforeAbUpload"/>
                  
        </el-form-item>

        <el-form-item>
          <el-button 
            v-if="currentUploadType === 'ab'" 
            type="info" 
            text 
            size="small" 
            class="format-help-btn"
            @click="toggleFormatGuide"
          >
            <el-icon class="format-help-icon"><QuestionFilled /></el-icon>
            查看命名规则
          </el-button>
        </el-form-item>
       
        <!-- AB包上传说明 -->
        <!-- <transition name="fade">

          <div v-if="currentUploadType === 'ab'" class="upload-guide-wrapper">
            <div class="upload-guide-content">
              <el-icon class="guide-icon"><InfoFilled /></el-icon>
              <div class="guide-text">
                <div class="guide-title">命名规则</div>
                <div class="guide-format-container">
                  <div class="guide-format">
                    <span class="format-part">文件名</span>
                    <span class="format-separator">_v</span>
                    <span class="format-part">框架版本</span>
                    <span class="format-separator">_v</span>
                    <span class="format-part">SDK版本</span>
                    <span class="format-separator">_v</span>
                    <span class="format-part">包版本</span>
                    <span class="format-suffix">.assetbundle</span>
                  </div>
                  <span class="guide-example">例：experiment_v1.0.0_v2.0.0_v3.0.0.assetbundle</span>
                </div>
              </div>
            </div>
          </div>
        </transition> -->
           <!-- AB包上传说明 - 可折叠版 -->
           <!-- AB包上传说明 - 样式优化 -->
        <transition name="fade">
          <div v-if="currentUploadType === 'ab' && showFormatGuide" class="upload-guide-wrapper">
            <div class="upload-guide-content">
              <el-icon class="guide-icon"><InfoFilled /></el-icon>
              <div class="guide-text">
                <div class="guide-title">AB包命名规则</div>
                <div class="guide-format-container">
                  <div class="guide-format">
                    <span class="format-part">文件名</span>
                    <span class="format-separator">_v</span>
                    <span class="format-part">内容框架版本(*.*)</span>
                    <span class="format-separator">_v</span>
                    <span class="format-part">SDK框架版本(*.*)</span>
                    <span class="format-separator">_v</span>
                    <span class="format-part">AB包版本(*.*.*)</span>
                    <span class="format-suffix">.assetbundle</span>
                  </div>
                  <span class="guide-example">例：experiment_v3.0_v2.1_v1.0.12.assetbundle</span>
                  <span class="guide-example">版本号说明：AB包 *.*.*（大版本.重要功能迭代.bug及小功能迭代）；内容框架 / SDK框架 *.*（大版本.重要功能迭代）。段数不符或非纯数字将被拦截</span>
                </div>
              </div>
              <el-icon class="close-guide-icon" @click="showFormatGuide = false"><Close /></el-icon>
            </div>
          </div>
        </transition>
        <el-form-item label="文件名" prop="fileName">
          <el-input v-model="submitForm.fileName" disabled placeholder="文件名将自动生成" />
        </el-form-item>
        <el-form-item label="文件大小" prop="fileSize">
          <el-input v-model="submitForm.fileSize" disabled placeholder="文件大小将自动计算" />
        </el-form-item>
        <el-form-item v-if="currentUploadType == 'ab'" label="AB版本号" prop="abVersion">
          <el-input v-model="submitForm.abVersion" disabled placeholder="AB版本号" />
        </el-form-item>
        <el-form-item v-if="currentUploadType == 'webgl' && submitForm.zipVersion" label="ZIP版本号" prop="zipVersion">
          <el-input v-model="submitForm.zipVersion" disabled placeholder="ZIP版本号" />
        </el-form-item>
        <el-form-item v-if="currentUploadType == 'ab'" label="内容框架版本号" prop="abFrameVersion">
          <el-input v-model="submitForm.abFrameVersion" disabled placeholder="内核框架版本号" />
        </el-form-item>
        <el-form-item v-if="currentUploadType == 'ab'" label="SDK框架版本号" prop="abSdkVersion">
          <el-input v-model="submitForm.abSdkVersion" disabled placeholder="SDK框架版本号" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="submitForm.remark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="请输入本次上传的备注（如更新内容、修复的问题），最多200字"/>
        </el-form-item>
        <el-form-item v-if="currentUploadType == 'ab'" label="清晰度" prop="abType">
          <el-radio-group v-model="submitForm.abType">
            <el-radio
              v-for="dict in mt_video_type"
              :key="dict.value"
              :value="dict.value"
              :label="dict.label"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel" >取 消</el-button>
          <el-button type="primary" @click="submitFormHandler">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

//导入数据上传API
import { updateExperimentDataUpload, delExperimentDataUpload, listExperimentDataUpload, getExperimentDataUpload, addExperimentDataUpload } from '@/api/glxt/experimentDataUpload'

const { proxy } = getCurrentInstance();

//视频画质类型
const { mt_video_type} = proxy.useDict('mt_video_type');

// 清晰度字典文本（AB包列表文件名副行用，避免在元信息行里塞标签）
const abTypeLabel = (value) => {
  const hit = mt_video_type.value.find(d => d.value == value)
  return hit ? hit.label : '—'
}

// 当前激活的标签页
const activeTab = ref('abPackage')

const loading = ref(true);

const total = ref(0);

// 搜索栏显示状态
const isSearchVisible = ref(false)

// 切换搜索栏显示状态
const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value
}


// 刷新方法
const handleRefresh = () => {
  // 重置搜索条件
  queryExperimentDataUploadParamsReset()
  // 重新加载数据
  getDataUploadList()
  ElMessage.success('刷新成功')
}

//用计算属性计算出文件上传按钮名称
const fileBtnName = computed(() => {
  const names = {
    ab: 'AB包',
    webgl: 'WEBGL-ZIP',
    video: '视频文件'
  }
  return names[currentUploadType.value] || ''
})


// 接收父组件传递的数据
const props = defineProps({
  experimentId: {//实验id
    type: String,
    required: true,
    default: () => []
  },
})


// 上传对话框控制
const uploadDialogVisible = ref(false)
const uploadDialogTitle = computed(() => {
  const titles = {
    ab: '上传AB包',
    webgl: 'WEBGL文件上传',
    video: '视频文件上传'
  }
  return titles[currentUploadType.value] || ''
})

//当前操作的类型
const currentUploadType = ref('')

// 上传相关方法
const handleUpload = (type) => {
  currentUploadType.value = type
  uploadDialogVisible.value = true
  showFormatGuide.value = false // 每次打开上传对话框时，默认隐藏命名规则
  //重置表单
  if(currentUploadType.value == 'ab') {
    resetForm()
  } else if(currentUploadType.value == 'webgl') {
    resetForm()
  } else if(currentUploadType.value == 'video') {
    resetForm()
  
  }

}

//已选中的搜索框参数处理
const handleDataUploadSearch = (type, value) => {
  if(type == 'ab') {
    queryExperimentDataUploadParams.value.fileName = value
    getDataUploadList()
  }else if(type == 'webgl') {
    queryExperimentDataUploadParams.value.fileName = value
    getDataUploadList();
  } else if(type == 'video') {
    queryExperimentDataUploadParams.value.fileName = value
    getDataUploadList()
  }
}


//表单提交
const submitForm = ref({
  id: null,
  experimentInfoId: '',//实验id
  abType: "1",//标清1 高清2
  fileName: "",//文件名称
  fileSize: "",//文件大小
  fileType: "",//文件类型
  abVersion: "",//ab包版本
  abFrameVersion: "",//ab框架版本
  abSdkVersion: "",//ab_sdk版本
  zipVersion: "",//zip版本
  fileUrl: "",//文件路径
  remark: ""//备注(上传说明)

})

//表单重置
const resetForm = () => {
  submitForm.value = {
    id: null,
    experimentInfoId: null,//实验id
    abType: "1",//标清1 高清2
    fileName: null,//文件名称
    fileSize: null,//文件大小
    fileType: null,//文件类型
    abVersion: null,//ab包版本
    abFrameVersion: null,//ab框架版本
    abSdkVersion: null,//ab_sdk版本
    zipVersion: null,//zip版本
    fileUrl: null,//文件路径
    remark: null//备注(上传说明)
  }
}
//表单验证
const rules = {
  // fileUrl: [
  //   { required: true, message: '请上传文件', trigger: 'blur' },
  // ],
  fileName: [
    { required: true, message: '请输入文件名', trigger: 'blur' },
  ],
  fileSize: [
    { required: true, message: '请输入文件大小', trigger: 'blur' },
  ],
}
//数据初始化
onMounted(() => {
  currentUploadType.value = 'ab'//默认获取AB列表
  getDataUploadList()
})


//取消按钮
const cancel = () => {
  resetForm()//重置表单
  uploadDialogVisible.value = false
}

//提交按钮
const submitFormHandler = () => {
  // 提交表单逻辑
  proxy.$refs["submitFormRef"].validate(valid => {
    if (valid) {
      submitForm.value.experimentInfoId = props.experimentId //实验id
      submitForm.value.fileType = currentUploadType.value //操作的类型
      if (submitForm.value.id != null) {
        updateExperimentDataUpload(submitForm.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          uploadDialogVisible.value = false
          getDataUploadList();
        });
      } else {
        addExperimentDataUpload(submitForm.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          uploadDialogVisible.value = false
          getDataUploadList();
        });
      }
    }
  });
}

//存子组件传过来的文件相关数据
const fileMsg = ref()

// ==================== AB包文件名规则校验 ====================
// 规则：文件名_v内容框架版本(*.*)_vSDK框架版本(*.*)_vAB包版本(*.*.*).assetbundle
// 严格校验：段内纯数字、段数精确匹配（缺段/多段均不合规，不自动补0）
// 返回错误信息，空串表示通过（上传前拦截与上传成功后兜底共用）
const validateAbFileName = (name) => {
  if (!name || !name.includes('_v')) {
    return '上传文件命名不符合规则：文件名_v内容框架版本_vSDK框架版本_vAB包版本.assetbundle，例：experiment_v3.0_v2.1_v1.0.12.assetbundle'
  }
  const arr = name.split('_v')
  const frameRaw = arr[1] || ''//内容框架版本
  const sdkRaw = arr[2] || ''//SDK框架版本
  const abRaw = arr.length > 3 ? arr[3].split('.assetbundle')[0] : ''//AB包版本
  if (!/^\d+\.\d+$/.test(frameRaw)) {
    return `内容框架版本号「${frameRaw || '缺失'}」格式不正确，应为 *.* 两位版本号（如 3.0）`
  }
  if (!/^\d+\.\d+$/.test(sdkRaw)) {
    return `SDK框架版本号「${sdkRaw || '缺失'}」格式不正确，应为 *.* 两位版本号（如 2.1）`
  }
  if (!/^\d+\.\d+\.\d+$/.test(abRaw)) {
    return `AB包版本号「${abRaw || '缺失'}」格式不正确，应为 *.*.* 三位版本号（如 1.0.12）`
  }
  return ''
}

// 上传前拦截（file-upload 的 beforeUpload 钩子）：文件名不合规直接拒绝，不发起网络上传
const beforeAbUpload = (file) => {
  if (currentUploadType.value !== 'ab') return true
  const err = validateAbFileName(file.name)
  if (err) {
    ElMessage.error(err + '，请修改文件名后重新选择')
    return false
  }
  return true
}

//接收到子组件的数据
const fileSuccessData = (data) => {
  fileMsg.value = data
  submitForm.value.fileSize = fileMsg.value.fileSize

  if(currentUploadType.value == 'ab') {
    // 上传成功后兜底校验（正常应已被 beforeAbUpload 在上传前拦截）
    const versionError = validateAbFileName(fileMsg.value.name)
    if (versionError) {
      ElMessage.error(versionError + '，请修改文件名后重新上传')
      submitForm.value.fileUrl = ''// 触发 watch 重置表单，清掉本次结果
      return
    }
    // 按命名规则解析：文件名_v内容框架版本_vSDK框架版本_vAB包版本.assetbundle
    let arrFileName = fileMsg.value.name.split('_v')
    submitForm.value.fileName = arrFileName[0] || ''//文件名
    submitForm.value.abFrameVersion = arrFileName[1]//内容框架版本
    submitForm.value.abSdkVersion = arrFileName[2]//SDK框架版本
    submitForm.value.abVersion = arrFileName[3].split('.assetbundle')[0]//AB包版本
  } else if(currentUploadType.value == 'webgl') {
      //文件名称
      submitForm.value.fileName = fileMsg.value.name.split(".zip")[0]
      if (fileMsg.value.name.includes("-v")) {
        //版本
        let arrFileName = fileMsg.value.name.split("-v")
        if (arrFileName.length >= 1) {
          submitForm.value.zipVersion = arrFileName[1].split(".zip")[0]
        }
      } else {
        ElMessage.error('上传文件格式不正确!');
        return
      }
  } else if(currentUploadType.value == 'video') {
    //文件名称
    submitForm.value.fileName = fileMsg.value.name.split(".")[0]
  }

}

//监听URL改变 如果为空则重置表单
watch(() => submitForm.value.fileUrl, (newValue, oldValue) => {
  if (newValue == '') {
    resetForm()
  }
})

//搜索定义参数
const queryExperimentDataUploadParams = ref({
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: '',//实验id
    fileType:'',//文件类型
    fileName:''//文件名称
  }
)

//重置搜索参数
const queryExperimentDataUploadParamsReset = () => {
  queryExperimentDataUploadParams.value = {
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: '',//实验id
    fileType:'',//文件类型
    fileName:''//文件名称
  }
}

//存数据上传列表
const experimentDataUploadPageList = ref([])

//获取列表
const getDataUploadList = () => {
  loading.value = true;
  queryExperimentDataUploadParams.value.experimentInfoId = props.experimentId //实验id
  queryExperimentDataUploadParams.value.fileType = currentUploadType.value  //操作的类型
  listExperimentDataUpload(queryExperimentDataUploadParams.value).then(response => {
    experimentDataUploadPageList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });

}


// 编辑和删除方法
// 下载文件：fileUrl 是 MinIO 完整 URL，新窗口打开由浏览器下载（二进制会触发下载）；相对路径则走下载插件兜底
const handleDownload = (row) => {
  if (!row.fileUrl) {
    proxy.$modal.msgWarning('文件地址不存在')
    return
  }
  if (/^https?:\/\//i.test(row.fileUrl)) {
    // 完整 URL（MinIO）：新窗口打开，二进制文件会触发下载
    window.open(row.fileUrl, '_blank')
  } else {
    // 相对路径：走下载插件（baseURL + 路径，带 token，blob 下载）
    proxy.$download.zip(row.fileUrl, row.fileName || row.fileUrl.split('/').pop())
  }
}

const handleEdit = (row) => {
  //先重置表单
  resetForm();
  // 处理编辑逻辑
  getExperimentDataUpload(row.id).then(response => {
    if(response.code == 200){
      submitForm.value = response.data
      uploadDialogVisible.value = true
    }else{
      ElMessage.error('获取数据失败')
    }
  })

}


//删除方法
const handleDelete = (row) => {
  // 处理删除逻辑
  ElMessageBox.confirm('确定要删除该条数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delExperimentDataUpload(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getDataUploadList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}



// 修改 tab 切换处理方法
const handleTabChange = (tab) => {
  activeTab.value = tab.props.name
  if (activeTab.value == 'abPackage') {
    currentUploadType.value = 'ab'
  } else if(activeTab.value == 'webgl') {
    currentUploadType.value = 'webgl'
  } else if(activeTab.value == 'video') {
    currentUploadType.value = 'video'
  }
  getDataUploadList()
}

//分页当前页面
const handleChange = (val) => {
  queryExperimentDataUploadParams.value.pageNum = val
  getDataUploadList() // 重新加载数据
}


// 对所有的tab进行校验，如果都没有操作则无法通过下一步
const validateForm = async () => {
  if (activeTab.value == 'abPackage') {
    if (experimentDataUploadPageList.value.length == 0) {
      throw new Error('请完成数据包的上传')
    }
  } else if (activeTab.value == 'webgl') {
    if (experimentDataUploadPageList.value.length == 0) {
      throw new Error('请完成数据包的上传')
    }
  } else if (activeTab.value == 'video') {
    if (experimentDataUploadPageList.value.length == 0) {
      throw new Error('请完成数据包的上传')
    }
  }
  return true
}


// 控制命名规则说明的显示与隐藏
const showFormatGuide = ref(false)

// 切换命名规则说明的显示状态
const toggleFormatGuide = () => {
  showFormatGuide.value = !showFormatGuide.value
}


//暴漏给父组件
defineExpose({
  validateForm
})
</script>

<style scoped>
.basic-info-container {
  min-height: calc(100vh - 520px);
  padding: 24px;
  position: relative;
}

/* ==================== AB包列表：合并列展示 ==================== */
/* 文件名列：主行文件名 + 副行元信息（大小 · 清晰度） */
.du-file-name {
  font-weight: 500;
  color: #303133;
}

.du-file-meta {
  margin-top: 2px;
  font-size: 12px;
  color: #909399;
}

/* 版本号列：三行紧凑展示（AB包 / 框架 / SDK，同一次上传的三个版本维度） */
.du-version-item {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 22px;

  &:not(:first-child) {
    margin-top: 2px;
  }
}

.du-version-label {
  flex-shrink: 0;
  width: 34px;
  font-size: 12px;
  color: #909399;
}

.du-version-value {
  font-size: 13px;
  color: #303133;
}

.main-content-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-top: 20px;
}

.tabs-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.custom-tabs {
  background: white;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #e8edf3;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  padding: 6px 8px 0;
}

.custom-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 36px;
}

.compact-form {
  padding: 24px;
  height: auto;
  /* min-height: 500px; */
  overflow-y: visible;
}



.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0 0;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-hover-color: #409EFF;
  padding: 0;
}

:deep(.el-pagination .el-pagination__total) {
  margin-right: 16px;
}

:deep(.el-pagination .el-pagination__sizes) {
  margin-right: 16px;
}

:deep(.el-pagination button) {
  background: transparent;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

:deep(.el-pagination button:hover) {
  border-color: #409EFF;
  color: #409EFF;
  transform: translateY(-1px);
}

:deep(.el-pagination .el-pager li) {
  background: transparent;
  border: 1px solid #dcdfe6;
  margin: 0 4px;
  transition: all 0.3s ease;
}

:deep(.el-pagination .el-pager li:hover) {
  border-color: #409EFF;
  color: #409EFF;
  transform: translateY(-1px);
}

:deep(.el-pagination .el-pager li.active) {
  background: #409EFF;
  border-color: #409EFF;
  color: white;
  font-weight: bold;
}

:deep(.el-pagination .el-pagination__jump) {
  margin-left: 16px;
}

:deep(.el-pagination .el-input__wrapper) {
  background: transparent;
  box-shadow: 0 0 0 1px #dcdfe6;
}

:deep(.el-pagination .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409EFF;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .pagination-container {
    padding: 16px 0 0;
  }

  :deep(.el-pagination) {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.upload-dialog {
  font-family: 'Arial', sans-serif;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  
}

/* 搜索区域样式更新 */
.search-wrapper {
  margin-bottom: 20px;
}

.search-section {
  border-radius: 8px;
}
/* 操作栏样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}


/* AB包上传说明样式 */
/* .ab-upload-guide {
  margin-bottom: 15px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: none;
  border: 1px dashed #d9ecff;
  background-color: #f0f9ff;
}

.ab-upload-guide :deep(.el-alert__icon) {
  font-size: 14px;
  color: #409EFF;
  margin-right: 8px;
}

.ab-upload-guide :deep(.el-alert__title) {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

.ab-upload-guide :deep(.el-alert__content) {
  padding: 0 8px 8px;
}

.guide-title {
  font-weight: 500;
  color: #409EFF;
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

.format-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.format-label {
  font-weight: 500;
  min-width: 36px;
  color: #606266;
}

.format-row code {
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 2px;
  padding: 1px 3px;
  font-family: monospace;
  font-size: 11px;
  color: #409EFF;
  border: none;
} */
/* 优化后的AB包上传说明样式 - 动态版 */
/* .upload-guide-wrapper {
  margin: 0 0 16px;
  padding: 8px 12px;
  background-color: #f9f9f9;
  border-left: 3px solid #909399;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.upload-guide-content {
  display: flex;
  align-items: flex-start;
}

.guide-icon {
  color: #909399;
  margin-right: 8px;
  font-size: 16px;
  margin-top: 2px;
  transition: transform 0.3s ease;
}

.guide-text {
  flex: 1;
}

.guide-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 4px;
}

.guide-format-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.guide-format {
  font-family: monospace;
  color: #606266;
  font-size: 12px;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 3px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
}

.format-part {
  color: #409EFF;
  font-weight: 500;
  transition: color 0.3s ease;
}

.format-separator {
  color: #67c23a;
  font-weight: bold;
  margin: 0 1px;
}

.format-suffix {
  color: #e6a23c;
  font-weight: 500;
}

.guide-example {
  color: #909399;
  font-size: 12px;
  font-style: italic;
  padding-left: 8px;
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


.upload-guide-wrapper:hover {
  background-color: #f5f7fa;
  border-left-color: #409EFF;
}

.upload-guide-wrapper:hover .guide-icon {
  transform: scale(1.1);
  color: #409EFF;
} */

/* .upload-guide-wrapper:hover .format-part {
  color: #409EFF;
} */

/* 文件上传容器 */
.upload-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}


/* 命名规则帮助按钮容器 */
.format-help-wrapper {
  margin-top: 8px;
  display: flex;
  align-items: center;
}


.format-help-btn:hover {
  color: #66b1ff;
  background-color: #ecf5ff;
  border-radius: 4px;
}

.format-help-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 命名规则帮助按钮 */
.format-help-btn {
  font-size: 12px;
  color: #409EFF;
  transition: all 0.3s;
  height: 28px;
  padding: 0 8px;
}

.format-help-btn:hover {
  color: #66b1ff;
  background-color: #ecf5ff;
  border-radius: 4px;
}

.format-help-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 上传说明样式优化 */
.upload-guide-wrapper {
  margin: 0 0 16px;
  padding: 10px 12px;
  background-color: #ecf5ff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  margin-left: 120px;
}

.upload-guide-content {
  display: flex;
  align-items: flex-start;
}

.guide-icon {
  color: #409EFF;
  margin-right: 10px;
  font-size: 16px;
  margin-top: 2px;
}

.guide-text {
  flex: 1;
}

.guide-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.guide-format-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.guide-format {
  font-family: monospace;
  color: #606266;
  font-size: 13px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 6px 10px;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  border-left: 2px solid #409EFF;
}

.format-part {
  color: #409EFF;
  font-weight: 500;
}

.format-separator {
  color: #67c23a;
  font-weight: bold;
  margin: 0 2px;
}

.format-suffix {
  color: #e6a23c;
  font-weight: 500;
}

.guide-example {
  color: #606266;
  font-size: 12px;
  padding: 4px 10px;
}

/* 关闭按钮 */
.close-guide-icon {
  cursor: pointer;
  color: #909399;
  font-size: 16px;
  transition: all 0.3s;
  position: absolute;
  top: 10px;
  right: 10px;
}

.close-guide-icon:hover {
  color: #f56c6c;
  transform: scale(1.1);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}


</style>