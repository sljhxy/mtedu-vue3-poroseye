<template>
  <div class="steps-setting">
    <!-- 主内容区域包装器 -->
    <div class="main-content-wrapper">
      <!-- 标签页容器 -->
      <div class="tabs-wrapper">
        <el-tabs v-model="activeTab" class="custom-tabs"  @tab-click="handleTabChange">
          <el-tab-pane name="steps">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>步骤设置{{ experimentId }}</span>
              </div>
            </template>
            
            <!-- 步骤设置内容 -->
            <div class="action-buttons">
              <el-button type="primary" plain @click="addStep(null)" v-hasPermi="['glxt:experimentInfoStep:add']">
                <el-icon><Plus /></el-icon>&nbsp;新建一级步骤
              </el-button>
              <el-button type="success" plain @click="previewSteps" :disabled="steps.length === 0">
                <el-icon><View /></el-icon>&nbsp;预览步骤
              </el-button>
            </div>

            <div class="steps-content">
              <el-empty v-if="steps.length === 0" description="暂无数据" />
              <el-tree
                v-else
                :data="steps"
                :props="defaultProps"
                node-key="id"
                default-expand-all
                @node-click="handleNodeClick"
              >
                <template #default="{ node, data }">
                  <span class="custom-tree-node">
                    <span class="node-content">
                      <span class="step-index">{{ getStepNumber(node) }}</span>
                      <span class="step-line"></span>
                      <span :class="['step-label', { 'first-level': getLevel(node) === 1 }]">
                        {{ data.stepName }}
                      </span>
                      <el-tag size="small" type="success" class="ml-2">
                        分数：{{ data.stepScore }}
                      </el-tag>
                    </span>
                    <span class="operation-buttons">
                      <el-button plain type="info" color="#ff6f21" @click.stop="handleOperation(data)" >
                        关联操作
                      </el-button>
                      <el-button v-if="getLevel(node) < 5" plain type="primary" @click.stop="addStep(data)" v-hasPermi="['glxt:experimentInfoStep:add']">
                        添加子步骤
                      </el-button>
                      <el-button plain type="success" @click.stop="editStep(data)" v-hasPermi="['glxt:experimentInfoStep:edit']">
                        编辑
                      </el-button>
                        <el-button plain type="danger" @click.stop="deleteStep(node, data)" title="先删除子步骤再删除父级" v-hasPermi="['glxt:experimentInfoStep:remove']"
                          :disabled="data.children && data.children.length > 0">
                          删除
                        </el-button>
                    </span>
                  </span>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>

          <el-tab-pane name="buttons">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Edit /></el-icon>
                <span>按钮定义</span>
              </div>
            </template>
            <!-- 按钮定义内容 -->
            <div class="search-wrapper">
              <div class="search-section" v-show="isSearchVisible">
                <el-form :inline="false" :model="queryExperimentButtonDefinitionParams">
                  <el-row :gutter="20">
                    <el-col :span="4">
                      <el-form-item label="按钮名称">
                        <el-input 
                          v-model="queryExperimentButtonDefinitionParams.btnName" 
                          placeholder="请输入名称"
                          @input="handleBtnDefinitionSearch('btnName', queryExperimentButtonDefinitionParams.btnName)"
                          clearable
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="4">
                      <el-form-item label="模块类型">
                        <el-select v-model="queryExperimentButtonDefinitionParams.btnType" placeholder="请选择模块类型"
                        @change="handleBtnDefinitionSearch('btnType', queryExperimentButtonDefinitionParams.btnType)"
                        clearable>
                          <el-option v-for="item in mt_btn_type" :key="item.value" :label="item.label" :value="item.value">
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
              <div class="operation-bar">
                <div class="left-buttons">
                  <el-button type="primary" plain icon="Plus" @click="handlerAddBtnDefinition" v-hasPermi="['glxt:experimentBtnDefinition:add']">按钮添加</el-button>
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

            <!-- Button Definition Table -->
            <el-table v-loading="loading"  :data="experimentButtonDefinitionPageList" border>
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="btnName" label="按钮名称" align="center">
              </el-table-column>
              <el-table-column prop="btnType" label="模块类型" align="center">
                <template #default="scope">
                  <dict-tag :options="mt_btn_type" :value="scope.row.btnType"/>
                </template>
              </el-table-column>
              <el-table-column prop="stepName" label="触发的实验步骤" align="center"/>
              <el-table-column label="操作" align="center">
                <template #default="scope">
                  <el-button type="success" plain @click="handlerEditBtnDefinition(scope.row)" v-hasPermi="['glxt:experimentBtnDefinition:edit']">编辑</el-button>
                  <el-button type="danger" plain  @click="handlerDelBtnDefinition(scope.row)" v-hasPermi="['glxt:experimentBtnDefinition:remove']">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- Button Definition Pagination -->
            <div class="pagination-container">
              <el-pagination
                v-model:page="queryExperimentButtonDefinitionParams.pageNum"
                v-model:limit="queryExperimentButtonDefinitionParams.pageSize"
                :page-sizes="[10, 20, 30, 50]"
                :total="experimentButtonDefinitionTotal"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 选择题目弹窗 -->
    <el-dialog 
      v-model="dialogButtonDefinitionVisible" 
      :title=" btnDefinitionForm.id ? '编辑按钮定义' : '添加按钮定义'"
      width="40%"
      style="margin-top: 10% !important;"
    >
      
    <el-form :model="btnDefinitionForm" :rules="btnDefinitionRules" ref="btnDefinitionFormRef" label-width="120px">
      <el-form-item label="模块类型" prop="btnType">
        <el-radio-group v-model="btnDefinitionForm.btnType">
            <el-radio
              v-for="dict in mt_btn_type"
              :key="dict.value"
              :value="dict.value"
              :label="dict.label"
            >{{dict.label}}</el-radio>
          </el-radio-group>
      </el-form-item>
      <el-form-item label="按钮名称" prop="btnName">
        <el-input v-model="btnDefinitionForm.btnName" placeholder="请输入按钮名称" />
      </el-form-item>
      <el-form-item label="触发实验步骤" prop="experimentStepId">
        <el-tree-select
                v-model="btnDefinitionForm.experimentStepId"
                :data="stepOptions"
                :props="{ value: 'id', label: 'stepName', children: 'children' }"
                value-key="id"
                placeholder="请选择关联操作步骤"
                check-strictly
                clearable
              />
      </el-form-item>
    </el-form>
      <!-- 底部按钮 -->
      <template #footer>
        <div class="dialog-buttons">
          <el-button @click="canclefirmBtnDefinition">取消</el-button>
          <el-button type="primary" @click="confirmBtnDefinition">确定</el-button>
        </div>
      </template>
    </el-dialog>



    <!-- 预览步骤对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="步骤预览"
      width="600px"
    >
      <div class="preview-content">
        <div v-for="(step) in flattenSteps" :key="step.id" 
             :style="{ paddingLeft: `${step.level * 20}px` }"
            class="preview-step">
          <span class="preview-index">{{ step.number }}</span>
          <span class="preview-label">{{ step.stepName }}</span>
          <span class="preview-score">分数：{{ step.stepScore }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑步骤的对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增步骤' : '编辑步骤'"
      width="500px"
      style="margin-top: 10% !important;"
    >
      <el-form :model="stepForm" label-width="100px">
        <!-- v-show="dialogType === 'edit' -->
        <el-form-item :label="dialogType === 'add' && dialogTypeIsParent == 2 ? '顶级步骤' : '子级步骤'" prop="parentId">
              <el-tree-select
                v-model="stepForm.parentId"
                :data="stepOptions"
                :props="{ value: 'id', label: 'stepName', children: 'children' }"
                value-key="id"
                placeholder="不选择则为顶级知识点"
                check-strictly
                disabled
                clearable
              />
          </el-form-item>
        <el-form-item label="步骤名称">
          <el-input v-model="stepForm.stepName" placeholder="请输入步骤名称" />
        </el-form-item>
        <el-form-item label="得分权重">
          <el-input-number v-model="stepForm.stepScore" :min="0" :max="100"  style="width: 100%;"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleStepSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 关联操作弹框 -->
    <el-dialog
      v-model="operationDialogVisible"
      title="关联操作"
      width="600px"
      style="margin-top: 8% !important;"
    >
      <el-form :model="operationForm" label-width="120px">
        <el-form-item label="步骤名称">
          <span><el-tag type="success">{{ currentStep?.stepName }}</el-tag></span>
        </el-form-item>
        <el-form-item label="操作详情">
          <el-input
            v-model="operationForm.operationDetails"
            type="textarea"
            :rows="3"
            placeholder="请输入操作详情"
          />
        </el-form-item>
        
        <el-form-item label="语音讲解">
          <el-input
            v-model="operationForm.voicePrompts"
            type="textarea"
            :rows="3"
            placeholder="请输入语音讲解内容"
          />
        </el-form-item>
        
        <el-form-item label="特效说明">
          <el-input
            v-model="operationForm.specialEffectDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入特效说明"
          />
        </el-form-item>
        
        <el-form-item label="关联页面">
          <el-select
            v-model="operationForm.relevancePageId"
            placeholder="请选择关联页面"
          >
            <el-option
              v-for="item in experimentDescribeList"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <!-- TODO: 操作观察要点待添加，后续优化 -->
        <!-- <el-form-item label="操作观察要点">
          <el-cascader
            v-model="operationForm.observationPoints"
            :options="observationOptions"
            :props="{
              multiple: true,
              checkStrictly: true
            }"
            clearable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择操作观察要点"
          />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleOperationsCancel">取消</el-button>
          <el-button type="primary" @click="handleOperationSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, View, Document, Edit } from '@element-plus/icons-vue'
const { proxy } = getCurrentInstance();

//导入实验步骤API
import { getExperimentInfoStep, addExperimentInfoStep, updateExperimentInfoStep, delExperimentInfoStep, listExperimentInfoStep } from '@/api/glxt/experimentInfoStep'

//导入实验步骤关联操作API
import { getExperimentStepRelevance, addExperimentStepRelevance, updateExperimentStepRelevance, delExperimentStepRelevance, listExperimentStepRelevance } from '@/api/glxt/experimentStepRelevance'

//导入实验说明api
import {listExperimentInfoDescribe} from '@/api/glxt/experimentInfoDescribe'

//按钮定义模块类型
const { mt_btn_type} = proxy.useDict('mt_btn_type');


//导入按钮定义API
import { getExperimentBtnDefinition, listExperimentBtnDefinition, addExperimentBtnDefinition, updateExperimentBtnDefinition, delExperimentBtnDefinition } from '@/api/glxt/experimentBtnDefinition'
import { get } from '@vueuse/core';


const stepOptions = ref([]);//存父级下拉
const activeTab = ref('steps')
const steps = ref([])//存实验步骤数据
const dialogVisible = ref(false)
const dialogType = ref('add')
const dialogTypeIsParent = ref(0)//控制弹框中的输入框名称
const currentParentNode = ref(null)
const currentEditNode = ref(null)
const previewDialogVisible = ref(false)
// 接收父组件传递的数据
const props = defineProps({
  experimentId: {//实验id
    type: String,
    required: true,
    default: () => []
  },
})

//=======================================================按钮定义=======================================================
//按钮搜索定义参数
const queryExperimentButtonDefinitionParams = ref({
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: '',
    btnType:'',
    btnName:''
  }
)

//重置按钮定义搜索参数
const queryExperimentButtonDefinitionParamsReset = () => {
  queryExperimentButtonDefinitionParams.value = {
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: '',
    btnType:''
  }
}

const dialogButtonDefinitionVisible = ref(false)
// 点击添加按钮
const handlerAddBtnDefinition = () => {
  btnDefinitionFormReset() //重置表单
  getTreeselect()//获取步骤数状
  dialogButtonDefinitionVisible.value = true
}

//已选中的题库搜索框参数处理
const handleBtnDefinitionSearch = (type, value) => {
  let btnTypeTmp = ''//模块类型
  let btnNameTmp = ''//按钮定义名称
  if(type == 'btnName') {
    queryExperimentButtonDefinitionParams.value.btnName = value
    btnNameTmp = value
    getBtnDefinitionList()
  }else if(type == 'btnType') {
    queryExperimentButtonDefinitionParams.value.btnType = value
    btnTypeTmp = value
    getBtnDefinitionList();
  } else {
    queryExperimentButtonDefinitionParams.value.btnName = btnNameTmp
    queryExperimentButtonDefinitionParams.value.btnType = btnTypeTmp
    getBtnDefinitionList()
  }
}

// 搜索栏显示状态
const isSearchVisible = ref(false)

// 切换搜索栏显示状态
const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value
}

// 刷新方法
const handleRefresh = () => {
  // 重置搜索条件
  queryExperimentButtonDefinitionParamsReset()
  // 重新加载数据
  getBtnDefinitionList()
  ElMessage.success('刷新成功')
}

//判断是否选择顶级节点
const handleStepIdIs = (rule, value, callback) => {
  let stepTmp = 0;
  if (stepTmp == value) {
    callback(new Error("不能选择顶级知识点进行关联"));
  } else {
    callback();
  }
};

//按钮提交表单
const btnDefinitionForm = ref({
  id: null,
  experimentInfoId: '',//实验id
  experimentStepId: '',//步骤id
  btnName: '',//按钮名称
  btnType: ''//按钮类型
})

// 表单校验规则
const btnDefinitionRules = {
  btnName: [{ required: true, message: '请输入按钮名称', trigger: 'blur' }],
  btnType: [{ required: true, message: '请选择模块类型', trigger: 'blur' }],
  experimentStepId: [
    { required: true, message: '请选择关联步骤', trigger: 'blur' },
    { required: true, validator: handleStepIdIs, trigger: "blur" }
  ]
}

//重置按钮定义表单
const btnDefinitionFormReset = () => {
  btnDefinitionForm.value = {
    id: null,
    experimentInfoId: null,//实验id
    experimentStepId: null,//步骤id
    btnName: null,//按钮名称
    btnType: null//按钮类型
  }
}

//取消按钮定义
const canclefirmBtnDefinition = () => {
  dialogButtonDefinitionVisible.value = false
  btnDefinitionFormReset()//重置按钮定义表单
}

//按钮定义表单提交
const confirmBtnDefinition = () => {
  proxy.$refs["btnDefinitionFormRef"].validate(valid => {
    if (valid) {
      btnDefinitionForm.value.experimentInfoId = props.experimentId //实验id
      if (btnDefinitionForm.value.id != null) {
        updateExperimentBtnDefinition(btnDefinitionForm.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          dialogButtonDefinitionVisible.value = false
          getBtnDefinitionList();
        });
      } else {
        addExperimentBtnDefinition(btnDefinitionForm.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          dialogButtonDefinitionVisible.value = false
          getBtnDefinitionList();
        });
      }
    }
  });
}

const experimentButtonDefinitionPageList = ref([])
const experimentButtonDefinitionTotal = ref(0)

/** 查询按钮定义列表 */
function getBtnDefinitionList() {
  loading.value = true;
  queryExperimentButtonDefinitionParams.value.experimentInfoId = props.experimentId //实验id
  listExperimentBtnDefinition(queryExperimentButtonDefinitionParams.value).then(response => {
    experimentButtonDefinitionPageList.value = response.rows;
    experimentButtonDefinitionTotal.value = response.total;
    loading.value = false;
  });
}

// 处理页码改变
const handleCurrentChange = (val) => {
  queryExperimentButtonDefinitionParams.value.pageNum = val
  // 这里调用获取数据的方法
  getBtnDefinitionList()
}


//修改按钮定义-弹框
const handlerEditBtnDefinition = (row) => {
  btnDefinitionFormReset();//重置表单
  getTreeselect()//获取步骤数状
  getExperimentBtnDefinition(row.id).then(response => {
    if(response.code == 200){
      btnDefinitionForm.value = response.data;
      dialogButtonDefinitionVisible.value = true //开启弹框
    } else{
      ElMessage.error('获取数据失败')
    }
  });
}

//删除按钮定义
const handlerDelBtnDefinition = (row) => {
  ElMessageBox.confirm('确定要删除该条数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delExperimentBtnDefinition(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getBtnDefinitionList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}



//=======================================================按钮定义 end=======================================================




//步骤提交表单
const stepForm = ref({
  id: null,
  experimentInfoId: '',//实验id
  parentId: '',//父级id
  stepName: '',//步骤名称
  stepNum: '',//步骤序号
  stepScore: 0,//实验步骤分数
  stepDescribe: '',//实验步骤描述
})

const defaultProps = {
  children: 'children',
  label: 'label'
}

// 关联操作相关数据
const operationDialogVisible = ref(false)
const currentStep = ref(null)

//步骤关联操作表单
const operationForm = ref({
  id:null,
  experimentStepId:'',//实验步骤id
  relevancePageId:'',//关联页面id
  operationDetails: '',//操作详情
  voicePrompts: '',//语音提示
  specialEffectDesc: '',//特效说明
  observationPoints: []
})

//重置关联-操作表单
const resetOperationForm = () => {
  operationForm.value = {
    id:null,
    experimentStepId: null,//实验步骤id
    relevancePageId: null,//关联页面id
    operationDetails: null,//操作详情
    voicePrompts: null,//语音提示
    specialEffectDesc: null,//特效说明
    observationPoints: []
  }
}


// 模拟页面选项数据
const pageOptions = [
  { value: '1', label: '页面1' },
  { value: '2', label: '页面2' },
  // ... 更多页面选项
]

// 模拟观察要点级联数据
const observationOptions = [
  {
    value: 'point1',
    label: '观察要点1',
    children: [
      {
        value: 'point1-1',
        label: '子要点1-1',
        children: [
          { value: 'point1-1-1', label: '细节1-1-1' },
          { value: 'point1-1-2', label: '细节1-1-2' }
        ]
      }
    ]
  },
  // ... 更多观察要点
]

// 获取节点层级
const getLevel = (node) => {
  if(null == node) {
    return 0
  }
  let level = 1
  let parent = node.parent
  while (parent && parent.level !== 0) {
    level++
    parent = parent.parent
  }
  return level
}

// 获取步骤编号
const getStepNumber = (node) => {
  const level = getLevel(node)
  let numbers = []
  let currentNode = node
  
  while (currentNode.parent && currentNode.parent.level !== undefined) {
    const siblings = currentNode.parent.childNodes
    const index = siblings.findIndex(n => n === currentNode) + 1
    numbers.unshift(index)
    currentNode = currentNode.parent
  }
  
  return numbers.join('.')
}


//重置步骤表单数据
const resetStepForm = () => {
  stepForm.value = {
    id: null,
    experimentInfoId: null,//实验id
    parentId: null,//父级id
    stepName: null,//步骤名称
    stepNum: null,//步骤序号
    stepScore: 0,//实验步骤分数
    stepDescribe: null,//实验步骤描述
  }
}

/** 查询步骤下拉树结构 */
function getTreeselect() {
  listExperimentInfoStep().then(response => {
    stepOptions.value = [];
    const data = { id: 0, stepName: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.rows, "id", "parentId");
    stepOptions.value.push(data);
  });
}
	

// 添加步骤
const addStep = (parentNode) => {
  resetStepForm();//重置表单数据
  dialogType.value = 'add'

  getTreeselect();//获取步骤下拉树结构
  stepForm.value.experimentInfoId = props.experimentId//设置实验id
  //如果节点不为空  则为父级节点
  if (parentNode != null) {
    stepForm.value.parentId = parentNode.id;
    stepForm.value.stepNum = getStepNumber(parentNode)//设置步骤编号
    dialogTypeIsParent.value = 1 // 有父级
  } else {
    stepForm.value.parentId = 0;
    dialogTypeIsParent.value = 2 // 无父级
  }

  currentParentNode.value = parentNode

  dialogVisible.value = true
}

// 编辑步骤
const editStep = (node) => {

  resetStepForm();//重置表单数据
  getTreeselect();//获取步骤下拉树结构
  dialogType.value = 'edit'


  if (node != null) {
    stepForm.value.parentId = node.parentId;
  }
  //获取当前步骤的信息
  getExperimentInfoStep(node.id).then(response => {
    stepForm.value = response.data;
  });

  currentEditNode.value = node
  dialogVisible.value = true
}

// 处理步骤提交
const handleStepSubmit = () => {
  if (dialogType.value === 'add') {
    //新增父级步骤，当前节点为空的前提下
    if (currentParentNode.value === null) {
      //新增步骤
      addExperimentInfoStep(stepForm.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          getStepsList();
      });
    } else {
      // if (!currentParentNode.value.children) {
      //   currentParentNode.value.children = []
      // }
      // currentParentNode.value.children.push(newStep)
      //新增子级步骤
      addExperimentInfoStep(stepForm.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          getStepsList();
      });
    }
  } else {
    // 编辑步骤
    updateExperimentInfoStep(stepForm.value).then(response => {
        proxy.$modal.msgSuccess("修改成功");
        getStepsList();
    });
  }

  dialogVisible.value = false
  ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
}

const queryParams = ref({
    pageNum: 1,
    pageSize: 10000,
    experimentInfoId:''

  }
)
const loading = ref(true);
const total = ref(0);
/** 查询知识点列表 */
function getStepsList() {
  loading.value = true;
  queryParams.value.experimentInfoId = props.experimentId
  listExperimentInfoStep(queryParams.value).then(response => {
    steps.value = proxy.handleTree(response.rows, "id", "parentId");
    total.value = steps.value.length
    loading.value = false;
  });
}


// 删除步骤
const deleteStep = (node, data) => {
  console.log(node, data)
  ElMessageBox.confirm('确定要删除该步骤吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delExperimentInfoStep(data.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getStepsList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}

const handleNodeClick = (data) => {
  // console.log(data)
}


// 修改 tab 切换处理方法
const handleTabChange = (tab) => {
  activeTab.value = tab.props.name
  // 清空搜索内容并重新加载数据
  if (activeTab.value == 'steps') {
    // 重新加载步骤
    getStepsList()
  } else if(activeTab.value == 'buttons') {
    getBtnDefinitionList()//获取按钮定义列表
  }
}



// 对所有的tab进行校验，如果都没有操作则无法通过下一步
const validateForm = async () => {
  if (activeTab.value == 'steps') {
    // Validate principle tab
    if (steps.value.length == 0) {
      throw new Error('请完成实验步骤的填写')
    }
  } else if (activeTab.value == 'buttons') {
    // Validate target tab
    if (experimentButtonDefinitionPageList.value.length == 0) {
      throw new Error('请完成按钮定义的必填项')
    }
  }
  return true
}

//暴漏给父组件
defineExpose({
  validateForm
})

//数据初始化
onMounted(() => {
  getStepsList();//实验-步骤列表
})

// 扁平化处理步骤数据，用于预览
const flattenSteps = computed(() => {
  const result = []

  const flatten = (nodes, level = 1, parentNumber = '') => {
    nodes.forEach((node, index) => {
      const currentNumber = parentNumber ? `${parentNumber}.${index + 1}` : `${index + 1}`
      result.push({
        ...node,
        level,
        number: currentNumber
      })

      if (node.children && node.children.length) {
        flatten(node.children, level + 1, currentNumber)
      }
    })
  }

  flatten(steps.value)
  return result
})

// 预览步骤
const previewSteps = () => {
  previewDialogVisible.value = true
}

//当前关联操作-数据
const relevanceData = ref();

const queryRelevanceParams = ref({
    pageNum: 1,
    pageSize: 10,
    experimentStepId:'',
    experimentInfoId:''
  }
)
//获取操作详情数据
const getStepRelevance = () => {
  queryRelevanceParams.value.experimentStepId = currentStep.value.id
  listExperimentStepRelevance(queryRelevanceParams.value).then(response => {
    if(response.code == 200) {
      relevanceData.value =  response.rows;
    } else {
      ElMessage.error('关联操作数据获取失败')
    }
  });
}

// 处理关联操作按钮点击
const handleOperation = (step) => {
  resetOperationForm();//重置表单数据
  //获取实验说明列表
  getExperimentInfoDescribeList()
  //拿到当前步骤信息
  currentStep.value = step

  queryRelevanceParams.value.experimentStepId = currentStep.value.id
  listExperimentStepRelevance(queryRelevanceParams.value).then(response => {
    if(response.code == 200) {
      relevanceData.value =  response.rows;
      console.log(relevanceData.value)
      if(relevanceData.value.length > 0) {
        console.log('获取数据成功’')
        operationForm.value = relevanceData.value[0];
      }
    } else {
      ElMessage.error('关联操作数据获取失败')
    }
  });

  

  operationDialogVisible.value = true
}

//存关联页面数据
const experimentDescribeList = ref([])
/** 查询实验说明列表 */
function getExperimentInfoDescribeList() {
  loading.value = true;
  //获取实验id
  queryRelevanceParams.value.experimentInfoId = props.experimentId;
  listExperimentInfoDescribe(queryRelevanceParams.value).then(response => {
    experimentDescribeList.value = response.rows;
    loading.value = false;
  });

}

//关联操作取消按钮
const handleOperationsCancel = async () => {
  resetOperationForm();//重置表单数据
  operationDialogVisible.value = false 
}
// 处理关联操作提交
const handleOperationSubmit = async () => {
  try {
    operationForm.value.experimentStepId = currentStep.value.id//当前操作步骤ID
    if(relevanceData.value.length == 0) {
      addExperimentStepRelevance(operationForm.value).then(response => {
        if(response.code == 200){
          proxy.$modal.msgSuccess("新增成功");
        } else {
          ElMessage.error('新增失败')
        }
      });
    } else {
      updateExperimentStepRelevance(operationForm.value).then(response => {
        if(response.code == 200){
          proxy.$modal.msgSuccess("修改成功");
        } else {
          ElMessage.error('修改失败')
        }
      });
    }
    
  } catch (error) {
    ElMessage.error('操作失败')
  }finally {
    operationDialogVisible.value = false//关闭弹窗
  }
}


</script>

<style scoped>
.steps-setting {
  min-height: calc(100vh - 520px);
  padding: 24px;
  position: relative;
}

/* 主内容区域包装器 */
.main-content-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-top: 20px;
}

/* 标签页容器样式 */
.tabs-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

/* 自定义标签页样式 */
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

:deep(.el-tabs__nav-wrap) {
  padding: 0;
}

:deep(.el-tabs__nav) {
  border: none !important;
}

/* 自定义标签标题样式 */
.custom-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 36px;
}

:deep(.el-tabs__item) {
  height: 36px;
  line-height: 36px;
  padding: 0 !important;
  font-size: 14px;
  color: #909399;
  position: relative;
  transition: all 0.3s;
  border-radius: 6px 6px 0 0;
  margin: 0 4px;
}

:deep(.el-tabs__item:hover) {
  color: var(--el-color-primary);
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
  background-color: white;
}

:deep(.el-tabs__item.is-active .custom-tab-label) {
  color: var(--el-color-primary);
}

/* 内容区域样式 */
.action-buttons {
  padding: 24px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.steps-content {
  padding: 24px;
}

/* 其他现有样式（树节点、对话框等）保持不变... */

/* 移除tabs-wrapper的重复边框 */
:deep(.el-tabs__header) {
  border-radius: 0;
}

/* 确保内容区域没有重复的边框和圆角 */
:deep(.el-tab-pane) {
  border-radius: 0;
}

/* 确保内容区域样式正确 */
.compact-form {
  max-width: 1200px;
  margin: 0 auto;
}

/* Tab内容区域样式 */
:deep(.el-tab-pane) {
  padding: 24px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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

/* 步骤线 */
.step-line {
  border-top: 1px dashed #909399;
  width: 200px;
  margin: 0 8px;
}

.step-label {
  font-size: 14px;
}

.first-level {
  font-weight: bold;
  font-size: 16px;
}

.el-tag--small {
    margin-left: 20px;
}

.operation-buttons {
  display: flex;
  
  gap: 30px;
}

.preview-content {
  max-height: 60vh;
  overflow-y: auto;
}

.preview-step {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.preview-index {
  background: #a0a3a5;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: 12px;
  font-size: 12px;
}

.preview-label {
  flex: 1;
}

.preview-score {
  color: #3ace26;
  margin-left: 12px;
}

/* 按钮悬停效果 */
.el-button {
  transition: all 0.3s;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.el-cascader) {
  width: 100%;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
}

/* 设置步骤间距 */
.el-tree {
  --el-tree-node-content-height: 50px;
}

/**按钮定义布局样式 */
/* 搜索区域样式更新 */
.search-wrapper {
  margin-bottom: 20px;
}

.search-section {
  /* background: #f8fafc; */
  border-radius: 8px;
  /* padding: 20px; */
  /* margin-bottom: 1px; */
}

/* 操作栏样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  padding: 16px 0;
  display: flex;
  justify-content: flex-end;
}

</style>