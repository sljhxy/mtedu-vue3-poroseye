<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="教材版本名称" prop="textbookVersionName">
        <el-input
          v-model="queryParams.textbookVersionName"
          placeholder="请输入教材版本名称"
          clearable
          @input="handleQuery"
          prefix-icon="Search"
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
          v-hasPermi="['glxt:library:add']"
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
          v-hasPermi="['glxt:library:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:library:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['glxt:library:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="libraryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index"  width="50" align="center" prop="id" />
      <el-table-column label="教材版本名称" align="center" prop="textbookVersionName" />
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button plain type="success" color="#6EDC93" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:library:edit']">修改</el-button>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:library:remove']">删除</el-button>
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

    <!-- 添加或修改教程版本对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="libraryRef" :model="form" :rules="rules" label-width="110">
        <!-- {{ form.id }} -->
        <el-form-item label="教材版本名称" prop="textbookVersionName">
          <el-input v-model="form.textbookVersionName" placeholder="请输入教材版本名称" />
        </el-form-item>
        <el-divider content-position="center">分册信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddMtVolume">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteMtVolume" :disabled="multiple">删除</el-button>
          </el-col>
        </el-row>
        <el-scrollbar :height="mtVolumeList.length > 0 ? '500px' : '100px'"> 
          <!-- {{ mtVolumeList }} -->
            <el-table :data="mtVolumeList" :row-class-name="rowMtVolumeIndex" @selection-change="handleMtVolumeSelectionChange" ref="mtVolume">
              <el-table-column type="selection" width="50" align="center" />
              <!-- <el-table-column label="序号" align="center" prop="index" width="50"/> -->
              <el-table-column label="封面" align="center" prop="coverImg">
                <template #default="scope">
                  <!-- <el-input v-model="scope.row.coverImg" placeholder="请输入封面" /> -->
                  <image-upload v-model="scope.row.coverImg"/>
                </template>
              </el-table-column>
              <el-table-column label="分册名称" align="center" prop="volumeName">
                <template #default="scope">
                  <el-input v-model="scope.row.volumeName" placeholder="请输入分册名称" />
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-button plain type="danger" circle icon="Delete" @click="handleDeleteMtVolume(scope.row)" v-hasPermi="['glxt:library:remove']"></el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-scrollbar>
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

<script setup name="Library">
import { listLibrary, getLibrary, delLibrary, addLibrary, updateLibrary, delMtVolumeById, selectMtVolumeList } from "@/api/glxt/library";

const { proxy } = getCurrentInstance();

const libraryList = ref([]);//教材版本列表
const mtVolumeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);//教材版本id
const volumeIds = ref([]);//分册id

const checkedMtVolume = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    textbookVersionName: null,
    modifyBy: null,
    modifyTime: null,
  },
  rules: {
    textbookVersionName: [
      { required: true, message: "教材版本名称不能为空", trigger: "blur" }],
  },
});

//可以对reactive中定义的对象进行解构
const { queryParams, form, rules } = toRefs(data);

/** 查询教程版本列表 */
function getList() {
  loading.value = true;
  listLibrary(queryParams.value).then(response => {
    libraryList.value = response.rows;
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
    textbookVersionName: null,
    createBy: null,
    createTime: null,
    modifyBy: null,
    modifyTime: null,
    delFlag: null
  };
  mtVolumeList.value = [];
  proxy.resetForm("libraryRef");
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
  title.value = "添加教程版本";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getLibrary(_id).then(response => {
    form.value = response.data;
    mtVolumeList.value = response.data.mtVolumeList;
    open.value = true;
    title.value = "修改教程版本";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["libraryRef"].validate(valid => {
    if (valid) {
      form.value.mtVolumeList = mtVolumeList.value;
      if (form.value.id != null) {
        updateLibrary(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addLibrary(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除教程版本？').then(function() {
    return delLibrary(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 分册序号 */
function rowMtVolumeIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 分册添加按钮操作 */
function handleAddMtVolume() {
  let obj = {};
  obj.coverImg = "";
  obj.volumeName = "";
  obj.modifyBy = "";
  obj.modifyTime = "";
  mtVolumeList.value.push(obj);
}

//获取分册列表参数
const queryVolumeParams = ref({
  textbookLibraryId: null,
})

//教材版本下的分册列表
const volumeList = ref([]);
/** 分册删除按钮操作 */
function handleDeleteMtVolume(row) {
  console.log(row.id)
  if(volumeIds.value.length) {//多选的情况下
      proxy.$modal.confirm('是否确认删除该数据？').then(function() {
        return delMtVolumeById(volumeIds.value);
      }).then(() => {
        getMtVolumeList(form.value.id);
        proxy.$modal.msgSuccess("删除成功");
      }).catch(() => {});
  } else {//删除多条
    console.log('没进来')
    if(row.id == undefined || row.id == null) {
      // const mtVolumes = mtVolumeList.value;
      // const checkedMtVolumes = checkedMtVolume.value;
      // mtVolumeList.value = mtVolumes.filter(function(item) {
      //   console.log(item.index)
      //   mtVolumes.splice(item.index);
      //   return checkedMtVolumes.indexOf(item.index) == -1
      // });
      mtVolumeList.value.forEach(item => {
        mtVolumeList.value.splice(item.index, 1)
      })
    } else {
      proxy.$modal.confirm('是否确认删除该数据？').then(function() {
        return delMtVolumeById(row.id);
      }).then(() => {
        getMtVolumeList(form.value.id);
        proxy.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
  // if (checkedMtVolume.value.length == 0) {
  //   proxy.$modal.msgError("请先选择要删除的分册数据");
  // } else {
  //   const mtVolumes = mtVolumeList.value;
  //   const checkedMtVolumes = checkedMtVolume.value;
  //   mtVolumeList.value = mtVolumes.filter(function(item) {
  //     return checkedMtVolumes.indexOf(item.index) == -1
  //   });
    
  //   mtVolumeList.value.forEach(element => {
  //     if(element.id) {
  //       console.log('进来了')
  //       console.log(element.id)
  //       console.log('进来了')
        
  //     }

  //   });
  // }
}





/** 根据教材版本id获取分册列表 */
function getMtVolumeList(id) {
  // selectMtVolumeList(queryVolumeParams.value).then(response => {
  //   volumeList.value = response.data;
  // });
  getLibrary(id).then(response => {
    form.value = response.data;
    mtVolumeList.value = response.data.mtVolumeList;
    open.value = true;
    title.value = "修改教程版本";
  });
}

/** 复选框选中数据 */
function handleMtVolumeSelectionChange(selection) {
  volumeIds.value = selection.map(item => item.id);
  checkedMtVolume.value = selection.map(item => item.index)
  multiple.value = !selection.length;
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('glxt/library/export', {
    ...queryParams.value
  }, `library_${new Date().getTime()}.xlsx`)
}

getList();
</script>
