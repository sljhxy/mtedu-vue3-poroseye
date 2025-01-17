<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="区域名称" prop="areaName">
        <el-input
          v-model="queryParams.areaName"
          placeholder="请输入区域名称"
          clearable
          @input="handleQuery"
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
          @click="clickAddArea"
          v-hasPermi="['glxt:area:add']"
        >新增根级区域</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-card style="margin-top: 30px;">
      <el-scrollbar ref="scrollbarRef" height="950px">

          <el-tree
                style="padding: 0 40px 0 0;"
                ref="areaTreeRef"
                :data="areaList"
                :check-strictly="true"
                accordion
                node-key="id"
                highlight-current
                :filter-node-method="filterNode"
                :default-expanded-keys="defaultExpandedNode"
          >
        
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span class="node-content">
                <span class="step-line"></span>
                  <span>{{ data.label }}</span>
                    </span>
                      <span class="operation-buttons">
                        <el-button plain size="small" type="primary" @click.stop="clickAddArea(data)"  v-hasPermi="['glxt:area:add']">
                            添加子级区域
                          </el-button>
                        <el-button plain size="small" type="success" @click.stop="clickEditArea(data, node)" v-hasPermi="['glxt:area:edit']">
                            编辑
                        </el-button>
                        <el-button plain size="small" type="danger" @click.stop="handleDelete(node, data)" title="先删除子级再删除父级" v-hasPermi="['glxt:area:remove']"
                              :disabled="data.children && data.children.length > 0">
                              删除
                        </el-button>
                      </span>
            </span>
            </template>
        </el-tree>
      </el-scrollbar>
    </el-card>
    <!-- 添加或修改区域 对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="areaRef" :model="form" :rules="rules" label-position="right" label-width="100px">
            <el-form-item label="上级区域" prop="parentId">
                <!-- {{ typeof(form.parentId) }} -->
                <el-tree-select
                  v-model="form.parentId"
                  :data="areaList"
                  filterable
                  :check-strictly="true"
                  accordion
                  node-key="id"
                  highlight-current
                  disabled
            />
              </el-form-item>
              <el-form-item label="区域名称" prop="areaName">
                <el-input v-model="form.areaName" />
              </el-form-item>
              <el-form-item label="区域编码" prop="areCode">
                <el-input v-model="form.areaCode" />
              </el-form-item>
              <el-form-item label="版本" prop="version">
                <el-input v-model="form.version" placeholder="请输入版本" />
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

<script setup name="Area">
import { listArea, getArea, delArea, addArea, updateArea, getAreaTree } from "@/api/glxt/area";

import { ElMessageBox, ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance();

const areaList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const defaultExpandedNode = ref([]);//默认展开的节点


const data = reactive({
  form: {},
  queryParams: {
    areaName: null,
    version: null,
  },
  rules: {
    areaName: [
      { required: true, message: "区域名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);


/** 查询区域 列表 */
function getList() {
  loading.value = true;
  getAreaTree(queryParams.value).then(response => {
    areaList.value = response.data.rows;
    //设置默认展开节点
    areaList.value.forEach(element => {
      defaultExpandedNode.value.push(element.id);
    });
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
    parentId: null,
    areaCode: null,
    areaName: null,
    delFlag: null,
    version: null,
    createBy: null,
    createTime: null,
    modifyBy: null,
    modifyTime: null
  };
  proxy.resetForm("areaRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  proxy.$refs.areaTreeRef.filter(data.queryParams.areaName)
}

//节点过滤
function filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function clickAddArea(parentNode) {
  reset();
  //如果节点不为空  则为父级节点
  if (parentNode.id != null) {
    form.value.parentId = parentNode.id;
  } else {
    form.value.parentId = 0;
  }

  open.value = true;
  title.value = "添加区域 ";
}

/** 修改按钮操作 */
function clickEditArea(data, node) {
  reset();
  console.log(data)
  getArea(data.id).then(response => {
    form.value = response.data;
    form.value.id = data.id;
    form.value.parentId = data.parentId;
    open.value = true;
    title.value = "修改区域 ";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["areaRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateArea(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addArea(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(node, data) {
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delArea(data.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}

getList();
</script>

<style scope>

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 18px;
}

.step-index {
  background: #b0b4b8;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  min-width: 40px;
  text-align: center;
}

/**间距 */
.el-tree-node {
  margin: 10px 0px
}

/* 步骤线 */
/* .step-line {
  border-top: 1px dashed #909399;
  width: 200px;
  margin: 0 8px;
} */
</style>