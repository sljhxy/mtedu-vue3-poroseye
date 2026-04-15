<template>
  <div class="steps-setting">
    <!-- 主内容区域包装器 -->
    <div class="main-content-wrapper">
      <!-- 标签页容器 -->
      <div class="tabs-wrapper">
        <el-tabs v-model="activeTab" class="custom-tabs"  @tab-click="handleTabChange">
          <!-- 步骤 -->
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
               <el-button type="warning" plain icon="Upload" @click="importSteps">
                导入步骤
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
                      <el-button v-if="getLevel(node) < 3" plain type="primary" @click.stop="addStep(data)" v-hasPermi="['glxt:experimentInfoStep:add']">
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

          <!-- 按钮定义 -->
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

          <!-- 新增评价维度 evaluationDimension -->
          <!-- <el-tab-pane name="evaluationDimension">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Connection /></el-icon>
                <span>评价维度</span>
              </div>
            </template>
            <div class="search-wrapper">
              <div class="search-section">
            
              </div>
            </div>
           
          </el-tab-pane> -->
           <!-- 新增评价维度 evaluationDimension -->
           <el-tab-pane name="evaluationDimension">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Connection /></el-icon>
                <span>评价维度</span>
              </div>
            </template>
            <!-- 评价维度内容 -->
            <div v-if="activeTab === 'evaluationDimension' && !evaluationDimensionList.length" class="tab-content">
              <div class="editor-container">
                <!-- 空状态展示 -->
                <div class="empty-state">
                  <div class="welcome-content">
                    <el-icon class="welcome-icon"><Connection /></el-icon>
                    <h2>欢迎来到【评价维度】管理</h2>
                    <p>开始添加您的评价维度</p>
                    <el-button type="primary" class="add-button" @click="openDimensionDialog">
                      <el-icon><Plus /></el-icon>
                      添加评价维度
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            
             <!-- 评价维度列表 -->
             <div v-if="evaluationDimensionList.length" class="dimension-list">
              <div class="operation-bar">
                <div class="left-buttons">
                  <el-button type="primary" plain icon="Plus" @click="openDimensionDialog">添加评价维度</el-button>
                </div>
              </div>
              
              <el-table 
                v-loading="dimensionLoading" 
                :data="evaluationDimensionList" 
                border 
                show-summary 
                :summary-method="getSummaries"
                sum-text="合计得分："
                :span-method="dimensionSpanMethod">
                <el-table-column type="index" label="序号" width="100" align="center" />
                <el-table-column prop="evaluationContent" label="评价内容" align="center" />
                <el-table-column prop="experimentStepNums" label="关联步骤" align="center">
                  <template #default="scope">
                    <el-tag 
                      v-for="stepNum in scope.row.experimentStepNums" 
                      :key="stepNum"
                      class="step-tag"
                      type="info"
                    >
                      {{ stepNum }}
                    </el-tag>
                    <span v-if="!scope.row.experimentStepNums || !scope.row.experimentStepNums.length">未关联步骤</span>
                  </template>
                </el-table-column>
                <el-table-column prop="stepScore" label="分数" width="100" align="center" />
                <el-table-column label="操作" width="200" align="center">
                  <template #default="scope">
                    <el-button type="success" plain @click="editDimension(scope.row)">编辑</el-button>
                    <el-button type="danger" plain @click="deleteDimension(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <!-- 评价维度对话框 -->
            <el-dialog 
              v-model="dimensionDialogVisible" 
              :title="currentDimension.id ? '编辑评价维度' : '添加评价维度'"
              width="650px"
              destroy-on-close
            >
              <el-form :model="currentDimension" ref="dimensionFormRef" label-width="100px" :rules="dimensionRules">
                <el-form-item label="评价内容" prop="evaluationContent">
                  <el-input 
                    v-model="currentDimension.evaluationContent" 
                    type="textarea" 
                    :rows="4"
                    placeholder="请输入评价内容"
                  />
                </el-form-item>
                
                {{ currentDimension.experimentStepIds }}
                <el-form-item label="关联步骤" prop="relatedSteps">
                  <el-tree-select
                    v-model="currentDimension.experimentStepIds"
                    :data="stepOptions"
                    :props="{ 
                      value: 'id', 
                      label: 'stepName', 
                      children: 'children' 
                    }"
                    multiple
                    show-checkbox
                    check-strictly
                    node-key="id"
                    placeholder="请选择关联步骤"
                    clearable
                    class="dimension-step-select"
                  />
                </el-form-item>
                
                <el-form-item label="分数" prop="stepScore">
                  <el-input-number 
                    v-model="currentDimension.stepScore" 
                    :min="0" 
                    :max="10" 
                    :precision="1"
                    :step="0.5"
                    style="width: 180px;"
                  />
                </el-form-item>
              </el-form>
              
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="dimensionDialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="submitDimensionForm">确定</el-button>
                  <el-button type="success" @click="submitAndContinue">确定并继续</el-button>
                </span>
              </template>
            </el-dialog>
          </el-tab-pane>

          
          <!-- 新增评价要求 evaluationRequirements -->
         
          <el-tab-pane name="evaluationRequirements">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Operation /></el-icon>
                <span>评价要求{{ props.experimentId }}</span>
              </div>
            </template>
            
            <div v-if="activeTab === 'evaluationRequirements' && !evaluationRequirementsList.length" class="tab-content">
              <div class="editor-container">
                <!-- 空状态展示 -->
                <div class="empty-state">
                  <div class="welcome-content">
                    <el-icon class="welcome-icon"><WindPower /></el-icon>
                    <h2>欢迎来到【扩展信息】管理</h2>
                    <p>开始添加您的评价要求</p>
                    <el-button type="primary" class="add-button" @click="openRequirementDialog" >
                      <el-icon><Plus /></el-icon>
                      添加评价要求
                    </el-button>
                  </div>
                </div>


            
              </div>
            </div>
            <div v-if="evaluationRequirementsList.length" class="target-list">
              <transition-group name="target-fade">
                <div v-for="(requirement, index) in evaluationRequirementsList" 
                    :key="requirement.id" 
                    class="target-item"
                     :style="{ '--delay': `${index * 0.1}s` }"
                >
                  <div class="target-content">
                    <div class="target-header">
                      <div class="target-index-wrapper">
                        <div class="target-badge">{{index + 1}}</div>
                        <h3 class="target-title">评价要求</h3>
                      </div>
                      <div class="target-actions">
                        <el-tooltip content="编辑评价要求" placement="top">
                          <el-button 
                            type="primary" 
                            class="action-button edit-button"
                            @click="handleEditRequirement(requirement)"
                          >
                            <el-icon><Edit /></el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip content="删除评价要求" placement="top">
                          <el-button 
                            type="danger" 
                            class="action-button delete-button"
                            @click="handleDeleteRequirement(requirement)"
                          >
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>
                    <div class="target-body">
                      <div class="target-text" v-html="requirement.text"></div>
                    </div>
                    <div class="target-footer">
                      <el-tag size="small" plain type="info">
                        <el-icon class="clock-class"><Clock /></el-icon>
                        <span>创建时间: {{ formatDate(requirement.createTime) }}</span>
                      </el-tag>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>

            <el-dialog style="margin-top: 5vh !important;" title="评价要求" v-model="requirementDialogVisible">   
                <el-form :model="formRequirementData" ref="requirementFormRef">
                        <el-form-item class="editor-wrapper" prop="text">
                          <Tinymce v-model="formRequirementData.text" :height="400" />
                        </el-form-item>
                </el-form>
                <template #footer>
                <span class="dialog-footer">
                  <el-button @click="handleRequirementClose">取消</el-button>
                  <el-button type="primary" @click="submitRequirementForm">确定</el-button>
                </span>
              </template>
            </el-dialog>
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

import Tinymce from "@/components/Tinymce/index.vue"

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

//导入评价维度API
import { getExperimentEvaluationDimension, listExperimentEvaluationDimension, addExperimentEvaluationDimension, updateExperimentEvaluationDimension, delExperimentEvaluationDimension } from '@/api/glxt/experimentEvaluationDimension'

//导入评价要求API
import { getExperimentRequirements, listExperimentRequirements, addExperimentRequirements, updateExperimentRequirements, delExperimentRequirements } from '@/api/glxt/experimentRequirements'
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
  let param = { experimentInfoId: props.experimentId }
  listExperimentInfoStep(param).then(response => {
    console.log(response.rows)
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

  console.log(parentNode)
    console.log(parentNode)
    // console.log(parentNode.children)
  getTreeselect();//获取步骤下拉树结构
  stepForm.value.experimentInfoId = props.experimentId//设置实验id
  //如果节点不为空  则为父级节点
  if (parentNode != null) {
    stepForm.value.parentId = parentNode.id;
   
    // stepForm.value.stepNum = getStepNumber(parentNode)//设置步骤编号

    if (parentNode && parentNode.stepNum) {
      // 如果父节点有步骤号，则在其基础上添加子步骤号
      const childCount = parentNode.children ? parentNode.children.length : 0;
      stepForm.value.stepNum = `${parentNode.stepNum}.${childCount + 1}`;
    } else {
      // 如果父节点没有步骤号，则根据其在同级中的位置生成
      const index = parentNode.parent ? parentNode.childNodes.indexOf(parentNode) + 1 : 1;
      stepForm.value.stepNum = `${index}.1`;
    }

    dialogTypeIsParent.value = 1 // 有父级
  } else {
    stepForm.value.parentId = 0;

    // 顶级步骤，获取当前顶级步骤数量作为新步骤的序号
    stepForm.value.stepNum = `${steps.value.length + 1}`;
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
/** 查询实验步骤列表 */
function getStepsList() {
  loading.value = true;
  queryParams.value.experimentInfoId = props.experimentId
  listExperimentInfoStep(queryParams.value).then(response => {
    steps.value = proxy.handleTree(response.rows, "id", "parentId");
    total.value = steps.value.length
    loading.value = false;

    // 确保每个步骤都有正确的步骤号
    updateStepNumbers(steps.value);
  });
}

// 更新所有步骤的步骤号
const updateStepNumbers = (nodes, parentNum = '') => {
  nodes.forEach((node, index) => {
    const currentNum = parentNum ? `${parentNum}.${index + 1}` : `${index + 1}`;
    node.stepNum = currentNum;
    
    if (node.children && node.children.length > 0) {
      updateStepNumbers(node.children, currentNum);
    }
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
  } else if(activeTab.value == 'evaluationDimension') {//评价维度
    getDimensionList() // 加载评价维度数据
  }else if(activeTab.value == 'evaluationRequirements') {//评价要求
    getRequirementsList() // 加载评价要求数据
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

//导入
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

// 评价维度相关数据和方法
const evaluationDimensionList = ref([])
const dimensionDialogVisible = ref(false)
const dimensionLoading = ref(false)
const currentDimension = ref({
  id: null,
  experimentInfoId: '',
  evaluationContent: '',
  experimentStepIds: [],
  relatedSteps: [],
  stepScore: 1
})

// 评价维度表单验证规则
const dimensionRules = {
  evaluationContent: [
    { required: true, message: '请输入评价内容', trigger: 'blur' }
  ],
  stepScore: [
    { required: true, message: '请输入分数', trigger: 'blur' }
  ]
}

// 打开评价维度对话框
const openDimensionDialog = () => {
  // 获取步骤树形结构，用于关联步骤选择
  getTreeselect()
  
 // 重置当前评价维度
 resetDimensionForm()
  dimensionDialogVisible.value = true
}

// 编辑评价维度
const editDimension = (dimension) => {
  // 重置表单
  resetDimensionForm();
  // 获取步骤树形结构，用于关联步骤选择
  getTreeselect()
  
  // 深拷贝避免直接修改列表数据
  currentDimension.value = { ...dimension}
  
  // 如果有关联步骤，提取步骤ID用于树形选择器 TODO

   // 获取评价维度详情
   getExperimentEvaluationDimension(dimension.id).then(response => {
    if (response.code === 200) {
      // 设置当前维度数据
      currentDimension.value = response.data;
      
      // 确保 experimentStepIds 字段存在
      if (!currentDimension.value.experimentStepIds) {
        currentDimension.value.experimentStepIds = [];
      }
      
      // 打开对话框
      dimensionDialogVisible.value = true;
    } else {
      ElMessage.error('获取评价维度详情失败');
    }
  });
  
  // dimensionDialogVisible.value = true
}

// 删除评价维度
const deleteDimension = (row) => {
  ElMessageBox.confirm('确定要删除该评价维度吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delExperimentEvaluationDimension(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getDimensionList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })

}

// 提交评价维度表单
const submitDimensionForm = () => {
  proxy.$refs.dimensionFormRef.validate(valid => {
    if (!valid) return
    
    // 准备提交的数据
    const submitData = {
      ...currentDimension.value
    }
    
    if (currentDimension.value.id) {
        updateExperimentEvaluationDimension(submitData).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          // 关闭对话框
          dimensionDialogVisible.value = false
          getDimensionList();
        });
      } else {
        addExperimentEvaluationDimension(submitData).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          // 关闭对话框
          dimensionDialogVisible.value = false
          getDimensionList();
        });
      }
  })
}

// 提交并继续添加
const submitAndContinue = () => {
  proxy.$refs.dimensionFormRef.validate(valid => {
    if (!valid) return
    
    // 准备提交的数据
    const submitData = {
      ...currentDimension.value
    }
    
      if (currentDimension.value.id) {
        updateExperimentEvaluationDimension(submitData).then(response => {
          proxy.$modal.msgSuccess("修改成功");
        
          getDimensionList();

           // 重置表单但不关闭对话框
           resetDimensionForm()
        });
      } else {
        addExperimentEvaluationDimension(submitData).then(response => {
          proxy.$modal.msgSuccess("新增成功");
        
          getDimensionList();

          // 重置表单但不关闭对话框
          resetDimensionForm()
        });
      }
  })
}



// 重置评价维度表单
const resetDimensionForm = () => {
  currentDimension.value = {
    id: null,
    experimentInfoId: props.experimentId,
    evaluationContent: '',
    experimentStepIds: [],
    relatedSteps: [],
    stepScore: 1
  }
  // 如果表单引用存在，重置验证状态
  if (proxy.$refs.dimensionFormRef) {
    proxy.$refs.dimensionFormRef.resetFields()
  }
}

//实验-评价维度请求参数
const queryExperimentDimensionParams =ref({
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: ''
  }
)

const evaluationDimensionTotal = ref(0)

// 获取评价维度列表
const getDimensionList = () => {
  dimensionLoading.value = true
  queryExperimentDimensionParams.value.experimentInfoId = props.experimentId
  if(queryExperimentDimensionParams.value.experimentInfoId) {
    listExperimentEvaluationDimension(queryExperimentDimensionParams.value).then(response => {
      evaluationDimensionList.value = response.rows;
      evaluationDimensionTotal.value = response.total;
      dimensionLoading.value = false;
    });
  }
}


// 计算评价维度表格的合计行
const getSummaries = (param) => {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (index === 3) { // 分数列的索引
      const values = data.map(item => Number(item.stepScore))
      const totalScore = values.reduce((prev, curr) => {
        return prev + curr
      }, 0)
      sums[index] = totalScore.toFixed(1)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

// 评价维度表格单元格合并方法
const dimensionSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  // 判断是否是合计行（通过检查是否有特定属性来判断）
  if (row && row.isSummary) {
    if (columnIndex === 0) {
      // 第一列显示"合计得分："
      return { colspan: 3, rowspan: 1 };
    } else if (columnIndex === 3) {
      // 分数列正常显示
      return { colspan: 1, rowspan: 1 };
    } else if (columnIndex > 0 && columnIndex < 3) {
      // 中间列不显示
      return { colspan: 0, rowspan: 0 };
    } else if (columnIndex === 4) {
      // 操作列不显示
      return { colspan: 0, rowspan: 0 };
    }
  }
  return undefined;
}










// 评价要求相关数据和方法
const evaluationRequirementsList = ref([])
const evaluationRequirementsTotal = ref([])
const requirementDialogVisible = ref(false)
const formRequirementData = ref({
  id: null,
  experimentInfoId: '',
  text: ''
})

//实验-评价要求请求参数
const queryEvaluationRequirementsParams =ref({
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: ''
  }
)

//重置评价要求
const resetEvaluationRequirements = () => {
  formRequirementData.value = {
    id: null,
    text: null,
    experimentInfoId: props.experimentId
  }
}

// 打开评价要求对话框
const openRequirementDialog = () => {
  // 重置表单数据
  resetEvaluationRequirements()
  requirementDialogVisible.value = true
}

// 编辑评价要求
const handleEditRequirement = (requirement) => {
  formRequirementData.value = { ...requirement }
  // console.log(formRequirementData.value)
  requirementDialogVisible.value = true
}


// 删除评价要求
const handleDeleteRequirement = (requirement) => {
  ElMessageBox.confirm('确定要删除该评价要求吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delExperimentRequirements(requirement.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getRequirementsList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}

// 关闭评价要求对话框
const handleRequirementClose = () => {
  requirementDialogVisible.value = false
  formRequirementData.value = {
    id: null,
    experimentInfoId: '',
    text: ''
  }
}

// 提交评价要求表单
const submitRequirementForm = () => {
  if (!formRequirementData.value.text) {
    ElMessage.error('请输入评价要求内容')
    return
  }
  
  proxy.$refs.requirementFormRef.validate(valid => {
    if (!valid) return
    
    // 准备提交的数据
    const submitData = {
      ...formRequirementData.value
    }
    
    if (formRequirementData.value.id) {
        updateExperimentRequirements(submitData).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          // 关闭对话框
          requirementDialogVisible.value = false
          getRequirementsList();
        });
      } else {
        addExperimentRequirements(submitData).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          // 关闭对话框
          requirementDialogVisible.value = false
          getRequirementsList();
        });
      }
  })


}

// 获取评价要求列表
const getRequirementsList = () => {
  queryEvaluationRequirementsParams.value.experimentInfoId = props.experimentId
  if(queryEvaluationRequirementsParams.value.experimentInfoId) {
    listExperimentRequirements(queryEvaluationRequirementsParams.value).then(response => {
      evaluationRequirementsList.value = response.rows;
      evaluationRequirementsTotal.value = response.total;
    });
  }
}



// 格式化日期的函数
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
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
.operation-ba {
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


/* 评价维度相关样式 */
.dimension-list {
  /* padding: 20px; */
}

.dimension-step-select {
  width: 100%;
}

.step-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.tab-content {
  padding: 20px;
}

.editor-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  /* background-color: #f9f9f9; */
  border-radius: 8px;
}

.welcome-content {
  text-align: center;
  padding: 30px;
}

.welcome-icon {
  font-size: 48px;
  color: var(--el-color-primary);
  margin-bottom: 20px;
}

.add-button {
  margin-top: 20px;
}

/* 评价维度表格合计行样式 */
:deep(.el-table__footer-wrapper) {
  font-weight: bold;
}

:deep(.el-table__footer td:first-child) {
  text-align: right;
  padding-right: 20px;
}

:deep(.el-table__footer td) {
  background-color: #f5f7fa;
  border: none !important; /* 移除所有单元格的边框 */
}

:deep(.el-table__footer td:nth-child(4)) {
  color: #f56c6c;
  font-size: 16px;
}

/* 移除表格底部边框 */
:deep(.el-table__footer) {
  border-top: none !important;
}

/* 确保表格底部没有边框 */
:deep(.el-table__footer-wrapper::before) {
  display: none;
}

:deep(.el-table__footer-wrapper::after) {
  display: none;
}






/* 评价要求相关样式 */
.tab-content {
  padding: 20px;
}

.editor-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  /* background-color: #f9f9f9; */
  border-radius: 8px;
}

.welcome-content {
  text-align: center;
  padding: 30px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.welcome-icon {
  font-size: 48px;
  color: var(--el-color-primary);
  margin-bottom: 20px;
}

.add-button {
  margin-top: 20px;
}

.target-list {
  padding: 24px;
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* .target-item {
  margin-bottom: 20px;
  animation: fadeIn 0.5s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
} */

.target-item {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.6s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    .target-actions {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
    border-radius: 12px 12px 0 0;
  }
}

.target-content {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
 
}

.target-index-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}


.target-badge {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
}

.target-title {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.target-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}

.action-button {
  padding: 8px;
  border-radius: 8px;
  
  &.edit-button {
    background: var(--el-color-primary-light-9);
    border: none;
    color: var(--el-color-primary);
    
    &:hover {
      background: var(--el-color-primary-light-7);
    }
  }
  
  &.delete-button {
    background: var(--el-color-danger-light-9);
    border: none;
    color: var(--el-color-danger);
    
    &:hover {
      background: var(--el-color-danger-light-7);
    }
  }
}

.target-body {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  margin-bottom: 16px;
}

.target-text {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  
  :deep(p) {
    margin: 0;
  }
  
  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
}

.target-footer {
  display: flex;
  justify-content: flex-end;
  
  .el-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    
    .el-icon {
      font-size: 14px;
    }
  }
}

.clock-class {
  position: relative;
  top: 2px;
  margin: 0 2px 0 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.target-fade-enter-active,
.target-fade-leave-active {
  transition: all 0.5s ease;
}

.target-fade-enter-from,
.target-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.editor-wrapper {
  margin-bottom: 0;
}


</style>