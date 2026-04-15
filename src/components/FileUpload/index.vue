<template>
  <div class="upload-file">
    <el-upload
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      class="upload-file-uploader"
      ref="fileUpload"
    >
      <!-- 上传按钮 -->
      <el-tooltip content="点击进行上传" placement="right" effect="light">
        <el-button type="warning" size="small" round>选取文件</el-button>
      </el-tooltip>
    </el-upload>
    <!-- 上传提示 -->
    <div class="el-upload__tip" v-if="showTip">
      请上传
      <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
      <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
      的文件
    </div>
    <!-- 文件列表 -->
    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="file.uid" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in fileList">
        <el-link :href="file.url" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" @click="handleDelete(index)" type="danger">删除</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth";

const props = defineProps({
  modelValue: [String, Object, Array],
  // 数量限制
  limit: {
    type: Number,
    default: 1,
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 50,
  },
  //文件后缀
  fileSuffix:{
    type: String,
    default: ''
  },
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    // default: () => ["doc", "xls", "ppt", "txt", "pdf"],
    default: [],
  },
  // 是否显示提示
  isShowTip: {
    type: Boolean,
    default: true
  }
});

const { proxy } = getCurrentInstance();
const emit = defineEmits();
const number = ref(0);
const uploadList = ref([]);
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/upload"); // 上传文件服务器地址
const headers = ref({ Authorization: "Bearer " + getToken() });
const fileList = ref([]);
const showTip = computed(
  () => props.isShowTip && (props.fileType || props.fileSize)
);


//对后缀进行判断 动态的判断上传的文件类型
watch(() => props.fileSuffix, (newSuffix) => {
  // debugger
  if (newSuffix == 'ab') {
    //验证文件名规则：命名规范：实验名_框架版本号_SDK版本号_内容版本号.assetbundle，仅限.aseetbundle扩展名，必须符合这个规则
    props.fileType.splice(0, props.fileType.length);//先清空之前的
    props.fileType.push('assetbundle');
  } else if (newSuffix == 'webgl') {
    props.fileType.splice(0, props.fileType.length);//先清空之前的
    props.fileType.push('zip');
  } else if (newSuffix == 'video') {
    props.fileType.splice(0, props.fileType.length);//先清空之前的
    //视频格式有很多种，常见的包括avi、mpeg、mp4、wmv、flv、mov、mkv、rmvb、3gp等。
    let videoArr = ["mp4", "mpeg", "flv"]
    videoArr.forEach(item => {
      props.fileType.push(item);
    });
  } else {
    props.fileType.splice(0, props.fileType.length);//先清空之前的
    let fileTempArr = ["doc", "docx", "xls", "xlsx","ppt", "pptx", "txt", "pdf"]
    fileTempArr.forEach(item => {
      props.fileType.push(item);
    });
  }
}, {immediate: true });


watch(() => props.modelValue, val => {
  if (val) {
    let temp = 1;
    // 首先将值转为数组
    const list = Array.isArray(val) ? val : props.modelValue.split(',');
    // 然后将数组转为对象数组
    fileList.value = list.map(item => {
      if (typeof item === "string") {
        item = { name: item, url: item };
      }
      item.uid = item.uid || new Date().getTime() + temp++;
      return item;
    });
  } else {
    fileList.value = [];
    return [];
  }
},{ deep: true, immediate: true });

// 上传前校检格式和大小
function handleBeforeUpload(file) {
  // 校检文件类型
  if (props.fileType.length) {
    const fileName = file.name.split('.');
    const fileExt = fileName[fileName.length - 1];
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0;
    if (!isTypeOk) {
      proxy.$modal.msgError(`文件格式不正确, 请上传${props.fileType.join("/")}格式文件!`);
      return false;
    }
  }
  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
      return false;
    }
  }
  proxy.$modal.loading("正在上传文件，请稍候...");
  number.value++;
  return true;
}

// 文件个数超出
function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`);
}

// 上传失败
function handleUploadError(err) {
  proxy.$modal.msgError("上传文件失败");
  // proxy.$modal.closeLoading(); // 添加此行以停止加载状态
}

// 上传成功回调
function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    uploadList.value.push({ name: res.data.url, url: res.data.url });

    //计算文件大小 保留两位小数
    let resFileSize = (res.data.fileSize / 1024 / 1024).toFixed(2);
    res.data.fileSize = resFileSize.concat("MB");
    //将res数据传到父组件中
    // console.log(res);
    // console.log(file);
    emit("fileData", res.data);
    emit("fileDataMsg", file);

    uploadedSuccessfully();
  } else {
    number.value--;
    proxy.$modal.closeLoading();
    proxy.$modal.msgError(res.msg);
    proxy.$refs.fileUpload.handleRemove(file);
    uploadedSuccessfully();
  }
}

// 删除文件
function handleDelete(index) {
  fileList.value.splice(index, 1);
  emit("update:modelValue", listToString(fileList.value));
}

// 上传结束处理
function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter(f => f.url !== undefined).concat(uploadList.value);
    uploadList.value = [];
    number.value = 0;
    emit("update:modelValue", listToString(fileList.value));
    proxy.$modal.msgSuccess("上传成功");
    proxy.$modal.closeLoading();
  }
}

// 获取文件名称
function getFileName(name) {
  // 如果是url那么取最后的名字 如果不是直接返回
  if (name.lastIndexOf("/") > -1) {
    return name.slice(name.lastIndexOf("/") + 1);
  } else {
    return name;
  }
}

// 对象转成指定字符串分隔
function listToString(list, separator) {
  let strs = "";
  separator = separator || ",";
  for (let i in list) {
    if (list[i].url) {
      strs += list[i].url + separator;
    }
  }
  return strs != '' ? strs.substr(0, strs.length - 1) : '';
}
</script>

<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
</style>
