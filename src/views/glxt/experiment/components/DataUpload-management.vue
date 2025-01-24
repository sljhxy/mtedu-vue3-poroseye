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
                <span>AB包{{ experimentId }}</span>
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
                <el-table-column prop="fileName" label="文件名称" align="center" />
                <el-table-column prop="abVersion" label="ab包版本" align="center" />
                <el-table-column prop="abFrameVersion" label="ab框架版本" align="center" />
                <el-table-column prop="abSdkVersion" label="ab-sdk版本" align="center" />
                <el-table-column prop="fileSize" label="文件大小" align="center" />
                <el-table-column prop="abType" label="清晰度" align="center" >
                  <template #default="scope">
                    <dict-tag :options="mt_video_type" :value="scope.row.abType"/>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="上传时间" align="center" />
                <el-table-column label="操作" align="center" >
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
                <el-table-column prop="fileSize" label="文件大小" align="center" />
                <el-table-column prop="createTime" label="上传时间" align="center" />
                <el-table-column label="操作" align="center" >
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
                <el-table-column prop="size" label="文件大小" align="center"/>
                <el-table-column prop="createTime" label="上传时间" align="center"/>
                <el-table-column label="操作" align="center">
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
          <file-upload v-model="submitForm.fileUrl" @fileData="fileSuccessData" :fileSuffix="currentUploadType"/>
        </el-form-item>
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
        <el-form-item v-if="currentUploadType == 'ab'" label="内核框架版本号" prop="abFrameVersion">
          <el-input v-model="submitForm.abFrameVersion" disabled placeholder="内核框架版本号" />
        </el-form-item>
        <el-form-item v-if="currentUploadType == 'ab'" label="SDK框架版本号" prop="abSdkVersion">
          <el-input v-model="submitForm.abSdkVersion" disabled placeholder="SDK框架版本号" />
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
  fileUrl: ""//文件路径

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
    fileUrl: null//文件路径
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
  debugger
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

//接收到子组件的数据
const fileSuccessData = (data) => {
  fileMsg.value = data
  submitForm.value.fileSize = fileMsg.value.fileSize

  if(currentUploadType.value == 'ab') {
    //组装版本
    if (fileMsg.value.name.includes("_v")) {
          let arrFileName = fileMsg.value.name.split("_v")
          if (arrFileName.length >= 1) {
            submitForm.value.fileName = arrFileName[0]//文件名
          }

          if (arrFileName.length >= 2) {
            submitForm.value.abFrameVersion = arrFileName[1]//ab包框架版本
          }

          if (arrFileName.length >= 2) {
            submitForm.value.abSdkVersion = arrFileName[2]//sdk版本
          }

          if (arrFileName.length >= 3) {
            submitForm.value.abVersion = arrFileName[3].split(".assetbundle")[0]//ab包版本
          } else {
            ElMessage.error('上传文件格式不正确!');
            return
        }
      }
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
</style>