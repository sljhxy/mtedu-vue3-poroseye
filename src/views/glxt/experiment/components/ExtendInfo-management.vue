<template>
  <div class="extend-info-container">
    <div class="main-content-wrapper">

      <!-- 标签页 -->
      <div class="tabs-wrapper">
        <el-tabs 
          v-model="activeTab" 
          class="custom-tabs" 
          @tab-click="handleTabClick"
        >
          <!-- 实验原理 -->
          <el-tab-pane name="principle">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Notebook /></el-icon>
                <span>实验原理{{ props.experimentId }}</span>
              </div>
            </template>
            
            <div v-if="activeTab === 'principle' && !principleList.length" class="tab-content">
              <div class="editor-container">
                <!-- 空状态展示 -->
                <div class="empty-state">
                  <div class="welcome-content">
                    <el-icon class="welcome-icon"><Orange /></el-icon>
                    <h2>欢迎来到【扩展信息】管理</h2>
                    <p>开始创建您的实验原理</p>
                    <el-button type="primary" class="add-button" @click="openPrincipleDialog" v-hasPermi="['glxt:experimentPrinciple:add']">
                      <el-icon><Plus /></el-icon>
                      添加实验原理
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="principleList.length" class="target-list">
              <transition-group name="target-fade">
                <div v-for="(principle, index) in principleList" 
                    :key="principle.id" 
                    class="target-item"
                     :style="{ '--delay': `${index * 0.1}s` }"
                >
                  <div class="target-content">
                    <div class="target-header">
                      <div class="target-index-wrapper">
                        <div class="target-badge">{{index + 1}}</div>
                        <h3 class="target-title">实验原理</h3>
                      </div>
                      <div class="target-actions">
                        <el-tooltip content="编辑原理" placement="top">
                          <el-button 
                            type="primary" 
                            class="action-button edit-button"
                            @click="handleEditPrinciple(principle)"
                            v-hasPermi="['glxt:experimentPrinciple:edit']"
                          >
                            <el-icon><Edit /></el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip content="删除原理" placement="top">
                          <el-button 
                            type="danger" 
                            class="action-button delete-button"
                            @click="handleDeletePrinciple(principle)"
                            v-hasPermi="['glxt:experimentPrinciple:remove']"
                          >
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>
                    <div class="target-body">
                      <div class="target-text" v-html="principle.text"></div>
                    </div>
                    <div class="target-footer">
                      <el-tag size="small" plain type="info">
                        <el-icon class="clock-class"><Clock /></el-icon>
                        <span>创建时间: {{ formatDate(principle.createTime) }}</span>
                      </el-tag>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
            <el-dialog style="margin-top: 5vh !important;" title="实验原理" v-model="principleDialogVisible">   
                <el-form :model="formPrincipleData" ref="principleFormRef">
                        <el-form-item class="editor-wrapper" prop="text">
                          <Tinymce v-model="formPrincipleData.text" :height="400" />
                        </el-form-item>
                </el-form>
                <template #footer>
                <span class="dialog-footer">
                  <el-button @click="handleClose">取消</el-button>
                  <el-button type="primary" @click="submitPrincipleForm">确定</el-button>
                </span>
              </template>
            </el-dialog>
          </el-tab-pane>

          <!-- 实验目标 -->
          <el-tab-pane name="target">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Aim /></el-icon>
                <span>实验目标</span>
              </div>
            </template>
            <div v-if="activeTab === 'target' && !targetList.length" class="tab-content">
              <div class="editor-container">
                <!-- 空状态展示 -->
                <div class="empty-state">
                  <div class="welcome-content">
                    <el-icon class="welcome-icon"><Orange /></el-icon>
                    <h2>欢迎来到【扩展信息】管理</h2>
                    <p>开始创建您的实验目标</p>
                    <el-button type="primary" class="add-button" @click="openTargetDialog" v-hasPermi="['glxt:experimentTarget:add']">
                      <el-icon><Plus /></el-icon>
                      添加实验目标
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="targetList.length" class="target-list">
              <transition-group name="target-fade">
                <div v-for="(target, index) in targetList" 
                    :key="target.id" 
                    class="target-item"
                     :style="{ '--delay': `${index * 0.1}s` }"
                >
                  <div class="target-content">
                    <div class="target-header">
                      <div class="target-index-wrapper">
                        <div class="target-badge">{{index + 1}}</div>
                        <h3 class="target-title">实验目标</h3>
                      </div>
                      <div class="target-actions">
                        <el-tooltip content="编辑目标" placement="top">
                          <el-button 
                            type="primary" 
                            class="action-button edit-button"
                            @click="handleEditTarget(target)"
                            v-hasPermi="['glxt:experimentTarget:edit']"
                          >
                            <el-icon><Edit /></el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip content="删除目标" placement="top">
                          <el-button 
                            type="danger" 
                            class="action-button delete-button"
                            @click="handleDeleteTarget(target)"
                            v-hasPermi="['glxt:experimentTarget:remove']"
                          >
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>
                    <div class="target-body">
                      <div class="target-text" v-html="target.text"></div>
                    </div>
                    <div class="target-footer">
                      <el-tag size="small" plain type="info">
                        <el-icon class="clock-class"><Clock /></el-icon>
                        <span>创建时间: {{ formatDate(target.createTime) }}</span>
                      </el-tag>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
            <el-dialog style="margin-top: 5vh !important;" title="实验目标" v-model="targetDialogVisible">   
              <el-form :model="formTargetData" ref="targetFormRef">
                      <el-form-item class="editor-wrapper" prop="text">
                        <Tinymce v-model="formTargetData.text" :height="400" />
                      </el-form-item>
              </el-form>
                <template #footer>
                <span class="dialog-footer">
                  <el-button @click="handleClose">取消</el-button>
                  <el-button type="primary" @click="submitTargetForm">确定</el-button>
                </span>
              </template>
            </el-dialog>
          </el-tab-pane>

          <!-- 实验器具 -->
          <el-tab-pane name="equipment">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Tools /></el-icon>
                <span>实验器具</span>
              </div>
            </template>
            <div v-if="activeTab === 'equipment'" class="tab-content">
              <div class="search-wrapper">
              <div class="search-section" v-show="isSearchVisible">
                <el-form :inline="false" :model="queryExperimentWarehouseParams">
                  <el-row :gutter="20">
                    <el-col :span="5">
                      <el-form-item label="器具名称">
                        <el-input v-model="queryExperimentWarehouseParams.equipmentName" placeholder="请输入器具名称" style="width: 200px;"
                        @input="handleExperimentWarehouseSearch('equipmentName', queryExperimentWarehouseParams.equipmentName)"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="器材类型">
                        <el-select v-model="queryExperimentWarehouseParams.equipmentTypeId" placeholder="请选择器材类型" style="width: 200px"
                        @change="handleExperimentWarehouseSearch('equipmentTypeId', queryExperimentWarehouseParams.equipmentTypeId)" clearable>
                          <el-option v-for="item in equipment_type" :key="item.value" :label="item.label" :value="item.value">
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
              <div class="operation-bar">
                <div class="left-buttons">
                  <el-button type="primary" plain icon="Plus" @click="selectQuestions">选择器具</el-button>
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

            <!-- Warehouse Table -->
            <el-table :data="experimentWarehousePageList" border>
              <el-table-column type="index" label="序号" width="60"></el-table-column>
              <el-table-column prop="content" label="缩略图" align="center">
                <template #default="scope">
                  <image-preview :src="scope.row.equipmentWarehouse.thumbnailImg" alt="thumbnail" style="width: 50px; height: 50px;"/>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="器具名称" align="center">
                <template #default="scope">
                  {{scope.row.equipmentWarehouse.equipmentName}}
                </template>
              </el-table-column>
              <el-table-column prop="stage" label="器具类型" align="center">
                <template #default="scope">
                  <dict-tag :options="equipment_type" :value="scope.row.equipmentWarehouse.equipmentTypeId"/>
                </template>
              </el-table-column>
              <el-table-column prop="subject" label="操作说明" align="center">
                <template #default="scope">
                  {{scope.row.equipmentWarehouse.equipmentAttr}}
                </template>
              </el-table-column>
              <el-table-column prop="equipmentCount" label="器具数量" align="center">
                <template #default="scope">
                  {{scope.row.equipmentCount}}
                </template>
              </el-table-column>
              <el-table-column prop="type" label="是否封装" align="center">
                <template #default="scope">
                  <el-tag :type="scope.row.equipmentWarehouse.isPackage == 1 ? 'success' : 'danger'" 
                  plan>{{ scope.row.equipmentWarehouse.isPackage == 1 ? '已封装' : '未封装' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="scope">
                  <el-button plain type="danger" class="delete-btn" @click="deleteExperimentWarehouseHandler(scope.row)" 
                    v-hasPermi="['glxt:experimentWarehouse:remove']">删除</el-button>
                </template>
              </el-table-column>
              <pagination
              v-show="experimentWarehouseTotal > 0"
              :total="experimentWarehouseTotal"
              v-model:page="queryExperimentWarehouseParams.pageNum"
              v-model:limit="queryExperimentWarehouseParams.pageSize"
              @pagination="getExperimentWarehouseList"
            />
            </el-table>

            <!-- Pagination -->
            <div class="pagination-container">
              <el-pagination
                v-model:page="queryExperimentWarehouseParams.pageNum"
                v-model:limit="queryExperimentWarehouseParams.pageSize"
                :page-sizes="[10, 20, 30, 50]"
                v-show="experimentWarehouseTotal > 0"
                :total="experimentWarehouseTotal"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handleWarehouseCurrentChange"
              />
            </div>

              <!-- 选择题目弹窗 -->
              <el-dialog 
                v-model="dialogVisible" 
                title="选择器具" 
                width="60%"
              >
                <!-- 搜索框保持不变 -->
                <div class="dialog-search">
                  <el-form :inline="true" :model="dialogSearchForm">
                    <el-form-item label="器具名称">
                      <el-input
                        style="width: 150px;"  
                        v-model="queryWarehouseParams.equipmentName" 
                        placeholder="请输入名称"
                        @input="handleDialogSearch('equipmentName', queryWarehouseParams.equipmentName)"
                        clearable
                      />
                    </el-form-item>
                    <el-form-item label="类型">
                      <el-select
                        style="width: 150px;" 
                        v-model="queryWarehouseParams.equipmentTypeId" 
                        placeholder="请选择器具类型"
                        @change="handleDialogSearch('equipmentTypeId', queryWarehouseParams.equipmentTypeId)" clearable>
                        <el-option 
                          v-for="item in equipment_type" 
                          :key="item.value" 
                          :label="item.label" 
                          :value="item.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-form>
                </div>

                <!-- 修改表格容器，添加固定高度和滚动 -->
                <div class="dialog-table-wrapper">
                  <el-table 
                    :data="unselectedQuestions"
                    @selection-change="handleSelectionChange"
                    border
                    :max-height="calculateTableHeight(unselectedQuestions.length)"
                  >
                    <el-table-column type="selection" width="55" fixed />
                    <el-table-column type="index" label="序号" width="60" fixed />
                    <el-table-column prop="thumbnailImg" label="缩略图" align="center">
                      <template #default="scope">
                        <image-preview :src="scope.row.thumbnailImg" :width="50" :height="50"/>
                      </template>
                    </el-table-column>
                    <el-table-column prop="equipmentTypeId" label="器材类型" align="center">
                      <template #default="scope">
                        <dict-tag :options="equipment_type" :value="scope.row.equipmentTypeId"/>
                      </template>
                    </el-table-column>
                    <el-table-column prop="equipmentName" label="器材名称" align="center"/>
                    <el-table-column prop="equipmentAttr" label="器材属性" align="center"/>
                    <el-table-column prop="isPackage" label="是否封装" align="center">
                      <template #default="scope">
                        <el-tag :type="scope.row.isPackage == 1 ? 'success' : 'danger'" plan>{{ scope.row.isPackage == 1 ? '已封装' : '未封装' }}</el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <!-- 底部按钮 -->
                <template #footer>
                  <div class="dialog-buttons">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmSelection">确定</el-button>
                  </div>
                </template>
              </el-dialog>
            </div>
          </el-tab-pane>



          <!-- 新增实验结论 conclusion-->
          <el-tab-pane name="conclusion">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Document /></el-icon>
                <span>实验结论{{ props.experimentId }}</span>
              </div>
            </template>
            
            <div v-if="activeTab === 'conclusion' && !principleList.length" class="tab-content">
              <div class="editor-container">
                <!-- 空状态展示 -->
                <div class="empty-state">
                  <div class="welcome-content">
                    <el-icon class="welcome-icon"><CollectionTag /></el-icon>
                    <h2>欢迎来到【扩展信息】管理</h2>
                    <p>开始总结您的实验结论</p>
                    <el-button type="primary" class="add-button" @click="openPrincipleDialog" v-hasPermi="['glxt:experimentPrinciple:add']">
                      <el-icon><Plus /></el-icon>
                      添加实验结论
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="principleList.length" class="target-list">
              <transition-group name="target-fade">
                <div v-for="(principle, index) in principleList" 
                    :key="principle.id" 
                    class="target-item"
                     :style="{ '--delay': `${index * 0.1}s` }"
                >
                  <div class="target-content">
                    <div class="target-header">
                      <div class="target-index-wrapper">
                        <div class="target-badge">{{index + 1}}</div>
                        <h3 class="target-title">实验结论</h3>
                      </div>
                      <div class="target-actions">
                        <el-tooltip content="编辑结论" placement="top">
                          <el-button 
                            type="primary" 
                            class="action-button edit-button"
                            @click="handleEditPrinciple(principle)"
                            v-hasPermi="['glxt:experimentPrinciple:edit']"
                          >
                            <el-icon><Edit /></el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip content="删除结论" placement="top">
                          <el-button 
                            type="danger" 
                            class="action-button delete-button"
                            @click="handleDeletePrinciple(principle)"
                            v-hasPermi="['glxt:experimentPrinciple:remove']"
                          >
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>
                    <div class="target-body">
                      <div class="target-text" v-html="principle.text"></div>
                    </div>
                    <div class="target-footer">
                      <el-tag size="small" plain type="info">
                        <el-icon class="clock-class"><Clock /></el-icon>
                        <span>创建时间: {{ formatDate(principle.createTime) }}</span>
                      </el-tag>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
            <el-dialog style="margin-top: 5vh !important;" title="实验结论" v-model="principleDialogVisible">   
                <el-form :model="formPrincipleData" ref="principleFormRef">
                        <el-form-item class="editor-wrapper" prop="text">
                          <Tinymce v-model="formPrincipleData.text" :height="400" />
                        </el-form-item>
                </el-form>
                <template #footer>
                <span class="dialog-footer">
                  <el-button @click="handleClose">取消</el-button>
                  <el-button type="primary" @click="submitPrincipleForm">确定</el-button>
                </span>
              </template>
            </el-dialog>
          </el-tab-pane>

          <!-- 新增知识点延伸  knowledgeExtend  为后续的AI提示词作准备 -->
          <el-tab-pane name="knowledgeExtend">
            <template #label>
              <div class="custom-tab-label">
                <el-icon><Operation /></el-icon>
                <span>知识点延伸{{ props.experimentId }}</span>
              </div>
            </template>
            
            <div v-if="activeTab === 'knowledgeExtend' && !principleList.length" class="tab-content">
              <div class="editor-container">
                <!-- 空状态展示 -->
                <div class="empty-state">
                  <div class="welcome-content">
                    <el-icon class="welcome-icon"><More /></el-icon>
                    <h2>欢迎来到【扩展信息】管理</h2>
                    <p>开始添加您的知识点延伸</p>
                    <el-button type="primary" class="add-button" @click="openPrincipleDialog" v-hasPermi="['glxt:experimentPrinciple:add']">
                      <el-icon><Plus /></el-icon>
                      添加知识点延伸
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="principleList.length" class="target-list">
              <transition-group name="target-fade">
                <div v-for="(principle, index) in principleList" 
                    :key="principle.id" 
                    class="target-item"
                     :style="{ '--delay': `${index * 0.1}s` }"
                >
                  <div class="target-content">
                    <div class="target-header">
                      <div class="target-index-wrapper">
                        <div class="target-badge">{{index + 1}}</div>
                        <h3 class="target-title">知识点延伸</h3>
                      </div>
                      <div class="target-actions">
                        <el-tooltip content="编辑知识点" placement="top">
                          <el-button 
                            type="primary" 
                            class="action-button edit-button"
                            @click="handleEditPrinciple(principle)"
                            v-hasPermi="['glxt:experimentPrinciple:edit']"
                          >
                            <el-icon><Edit /></el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip content="删除知识点" placement="top">
                          <el-button 
                            type="danger" 
                            class="action-button delete-button"
                            @click="handleDeletePrinciple(principle)"
                            v-hasPermi="['glxt:experimentPrinciple:remove']"
                          >
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>
                    <div class="target-body">
                      <div class="target-text" v-html="principle.text"></div>
                    </div>
                    <div class="target-footer">
                      <el-tag size="small" plain type="info">
                        <el-icon class="clock-class"><Clock /></el-icon>
                        <span>创建时间: {{ formatDate(principle.createTime) }}</span>
                      </el-tag>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
            <el-dialog style="margin-top: 5vh !important;" title="知识点延伸" v-model="principleDialogVisible">   
                <el-form :model="formPrincipleData" ref="principleFormRef">
                        <el-form-item class="editor-wrapper" prop="text">
                          <Tinymce v-model="formPrincipleData.text" :height="400" />
                        </el-form-item>
                </el-form>
                <template #footer>
                <span class="dialog-footer">
                  <el-button @click="handleClose">取消</el-button>
                  <el-button type="primary" @click="submitPrincipleForm">确定</el-button>
                </span>
              </template>
            </el-dialog>
          </el-tab-pane>
        </el-tabs>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import Tinymce from "@/components/Tinymce/index.vue"
const { proxy } = getCurrentInstance();

const { equipment_type } = proxy.useDict('equipment_type');
//导入实验原理API
import { addExperimentPrinciple, updateExperimentPrinciple, delExperimentPrinciple, listExperimentPrinciple, getExperimentPrinciple } from '@/api/glxt/experimentPrinciple'

//导入实验目标API
import { addExperimentTarget, updateExperimentTarget, delExperimentTarget, listExperimentTarget, getExperimentTarget } from '@/api/glxt/experimentTarget'

//导入实验器具API
import {listWarehouse} from '@/api/glxt/warehouse'

//导入实验warehouseAPI
import {insertBatchMtExperimentWarehouse, delExperimentWarehouse, listExperimentWarehouse} from '@/api/glxt/experimentWarehouse'


import principleImage from "@/assets/icons/svg/原理.svg";

const route = useRoute()
const experimentId = ref(route.params.experimentId)
const activeTab = ref('principle')
const experimentData = ref(null)
const loading = ref(true);
const principleDialogVisible = ref(false)//实验原理弹框
const targetDialogVisible = ref(false)//实验原理弹框

// 接收父组件传递的数据
const props = defineProps({
  experimentId: {//实验id
    type: String,
    required: true,
    default: () => []
  },
})

// Table data
const equipmentWarehouseList = ref([]) // 当前显示的器具列表
// Search form
const searchForm = reactive({
  content: '',
  subject: '',
  type: ''
})

// 搜索的表单数据
const dialogSearchForm = reactive({
  equipmentName: '',
  equipmentTypeId: '',
})


// 实验原理表单数据
const formPrincipleData = ref({
  id:null,
  text: '',
  experimentInfoId:''
})

//重置实验原理
const resetPrinciple = () => {
  formPrincipleData.value = {
    id: null,
    text: null,
    experimentInfoId: null
  }
}

//实验目标表单数据
const formTargetData = ref({
  id: null,
  text: '',
  experimentInfoId:''
})

//重置实验目标
const resetTarget = () => {
  formTargetData.value = {
    id: null,
    text: null,
    experimentInfoId: null
  }
}




//开启实验原理弹框
const openPrincipleDialog = () => {
  //清空表单数据
  resetPrinciple()
  principleDialogVisible.value = true
}

//开启实验目标弹框
//开启实验原理弹框
const openTargetDialog = () => {
  //清空表单数据
  resetTarget()
  targetDialogVisible.value = true
}

// 添加关闭弹框的方法
const handleClose = () => {
  //重置表单
  resetPrinciple()//实验原理
  resetTarget()//实验目标
  targetDialogVisible.value = false
  principleDialogVisible.value = false
}



//提交实验原理
const submitPrincipleForm = async () => {
  try {
    if (!formPrincipleData.value.text) {
      proxy.$modal.msgError("请输入实验原理")
      principleDialogVisible.value = true
      return
    }
    proxy.$refs["principleFormRef"].validate(valid => {
    if (valid) {
      formPrincipleData.value.experimentInfoId = props.experimentId;
      if (formPrincipleData.value.id != null) {
        updateExperimentPrinciple(formPrincipleData.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          // 关闭对话框
          principleDialogVisible.value = false
          getPrincipleList();
        });
      } else {
        addExperimentPrinciple(formPrincipleData.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          // 关闭对话框
          principleDialogVisible.value = false
          getPrincipleList();
        });
      }
    }
  });
  } catch (error) {
    ElMessage.error('编辑失败，请重试')
  }
}

//实验原理请求参数
const queryPrincipleParams =ref({
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: ''
  }
)

const principleList = ref([])
const principleTotal = ref(0);
//获取实验原理数据
function getPrincipleList() {
  loading.value = true;
  queryPrincipleParams.value.experimentInfoId = props.experimentId
  if(queryPrincipleParams.value.experimentInfoId) {
    listExperimentPrinciple(queryPrincipleParams.value).then(response => {
      principleList.value = response.rows;
      principleTotal.value = response.total;
      loading.value = false;
    });
  }
}



//提交实验目标
const submitTargetForm = async () => {
  try {
    if (!formTargetData.value.text) {
      proxy.$modal.msgError("请输入实验目标")
      // targetDialogVisible.value = true
      return
    }
    proxy.$refs["targetFormRef"].validate(valid => {
    if (valid) {
      formTargetData.value.experimentInfoId = props.experimentId;
      if (formTargetData.value.id != null) {
        updateExperimentTarget(formTargetData.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          // 关闭对话框
          targetDialogVisible.value = false
          getTargetList();
        });
      } else {
        addExperimentTarget(formTargetData.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          // 关闭对话框
          targetDialogVisible.value = false
          getTargetList();
        });
      }
    }
  });
  } catch (error) {
    ElMessage.error('编辑失败，请重试')
  }
}

//实验原理请求参数
const queryTargetParams =ref({
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: ''
  }
)

const targetList = ref([])
const targetTotal = ref(0);
//获取实验目标数据
function getTargetList() {
  loading.value = true;
  queryTargetParams.value.experimentInfoId = props.experimentId
  listExperimentTarget(queryTargetParams.value).then(response => {
    targetList.value = response.rows;
    targetTotal.value = response.total;
    loading.value = false;
  });
}


//实验器具选择器具列表请求参数
const queryWarehouseParams =ref({
    pageNum: 1,
    pageSize: 100000,
    equipmentName: '',
    equipmentTypeId: '',
    isPackage:''
  }
)

const warehouseList = ref([])
const warehouseTotal = ref(0);
//获取实验器具数据
function getWarehouseList() {
  loading.value = true;
  queryWarehouseParams.value.isPackage = 1
  listWarehouse(queryWarehouseParams.value).then(response => {
    warehouseList.value = response.rows;
    warehouseTotal.value = response.total;
    loading.value = false;
  });
}

//选择器具列表搜索
const handleDialogSearch = (type,value) =>{
  let equipmentNameTmp = ''
  let equipmentTypeIdTmp = ''
  if(type == 'equipmentName') {
    queryWarehouseParams.value.equipmentName = value
    queryWarehouseParams.value.isPackage = 1
    equipmentNameTmp = value
    getWarehouseList();
  } else if(type == 'equipmentTypeId') {
    queryPrincipleParams.value.equipmentTypeId = value
    queryWarehouseParams.value.isPackage = 1
    equipmentTypeIdTmp = value
    getWarehouseList();
  } else {
    queryPrincipleParams.value.equipmentName = equipmentNameTmp
    queryPrincipleParams.value.equipmentTypeId = equipmentTypeIdTmp
    queryWarehouseParams.value.isPackage = 1
    getPrincipleList();
  }
  
}


//已选中的器具搜索
const handleExperimentWarehouseSearch = (type,value) =>{
  let equipmentNameTmp = ''
  let equipmentTypeIdTmp = ''
  if(type == 'equipmentName') {
    queryExperimentWarehouseParams.value.equipmentName = value
    equipmentNameTmp = value
    getExperimentWarehouseList();
  } else if(type == 'equipmentTypeId') {
    queryExperimentWarehouseParams.value.equipmentTypeId = value
    equipmentTypeIdTmp = value
    getExperimentWarehouseList();
  } else {
    queryExperimentWarehouseParams.value.equipmentName = equipmentNameTmp
    queryExperimentWarehouseParams.value.equipmentTypeId = equipmentTypeIdTmp
    getExperimentWarehouseList();
  }
  
}


// Pagination
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})


// Dialog control
const dialogVisible = ref(false)
const selectQuestions = () => {
  //调器具列表
  getWarehouseList()
  dialogVisible.value = true
}
// 添加计算表格高度的方法
const calculateTableHeight = (dataLength) => {
  const rowHeight = 40 // 每行的高度
  const headerHeight = 40 // 表头高度
  const minHeight = rowHeight * 5 + headerHeight // 最小高度（5行）
  const maxHeight = rowHeight * 10 + headerHeight // 最大高度（10行）
  
  // 计算实际需要的高度
  const actualHeight = rowHeight * dataLength + headerHeight
  
  // 如果数据少于5行，返回最小高度
  if (actualHeight < minHeight) {
    return minHeight
  }
  // 如果数据多于10行，返回最大高度
  if (actualHeight > maxHeight) {
    return maxHeight
  }
  // 否则返回实际高度
  return actualHeight
}
// 添加新方法
const handleRefresh = () => {
  // 重置搜索条件
  resetSearch()
  // 重新加载数据
  getWarehouseList()
  ElMessage.success('刷新成功')
}

// 搜索栏显示状态
const isSearchVisible = ref(false)

// 切换搜索栏显示状态
const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value
}


const unselectedQuestions = computed(() => {
  // const selectedIds = new Set(equipmentWarehouseList.value.map(q => q.id))
  // return mockUnselectedQuestions.filter(q => !selectedIds.has(q.id))
  return warehouseList.value;
})
const allWarehouses = ref({
  experimentId:'',
  experimentWarehouseList:[]
}) 


// 存储所有题目数据
const selectedRows = ref([])

// Methods for dialog
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  console.log(selectedRows.value)
  console.log(selection)
}
// 修改确认选择方法
const confirmSelection = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一个器具')
    return
  }

  // 检查重复选择
 // const selectedIds = new Set(allWarehouses.value.map(q => q.id))
  // const newQuestions = selectedRows.value.filter(q => !selectedIds.has(q.id))
  const newQuestions = selectedRows.value

  // if (newQuestions.length === 0) {
  //   ElMessage.warning('所选题目已全部添加')
  //   return
  // }

  // 添加新选择的题目
  allWarehouses.value.experimentWarehouseList = [...newQuestions]
  // console.log('allWarehouses.value')
  // console.log(allWarehouses.value.experimentWarehouseList)
  // console.log('allWarehouses.value')

  //进行将已经选择数据添加到实验器具列表
  allWarehouses.value.experimentId = props.experimentId//实验id
  insertBatchMtExperimentWarehouse(allWarehouses.value).then(response => {
    if(response.code == 200){
        ElMessage.success(`成功添加 ${newQuestions.length} 个器具`)
        // 关闭弹窗并清空选择
        dialogVisible.value = false
        selectedRows.value = []
        // 重新加载当前页数据
        getExperimentWarehouseList()
      }else{
        ElMessage.error('添加失败')
      } 
  });

  // handleSearch() // 重新加载当前页数据
  
}

//获取已选择的列表
const queryExperimentWarehouseParams =ref({
    pageNum: 1,
    pageSize: 10,
    experimentInfoId: '',
    equipmentName:'',
    equipmentTypeId:''
  }
)
const experimentWarehousePageList = ref([])
const experimentWarehouseTotal = ref(0);
//获取已经选择的器具列表
function getExperimentWarehouseList() {
  loading.value = true;
  queryExperimentWarehouseParams.value.experimentInfoId = props.experimentId//实验id
  listExperimentWarehouse(queryExperimentWarehouseParams.value).then(response => {
    experimentWarehousePageList.value = response.rows;
    experimentWarehouseTotal.value = response.total;
    loading.value = false;
  });
}


//
// 处理实验器具页码改变
const handleWarehouseCurrentChange = (val) => {
  queryExperimentWarehouseParams.value.pageNum = val
  // 这里调用获取数据的方法
  getExperimentWarehouseList()
}


//删除器具
const deleteExperimentWarehouseHandler = (row) => {
  ElMessageBox.confirm('确定要删除该器具吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delExperimentWarehouse(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getExperimentWarehouseList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })

}


// 计算当前标签页名称
const getActiveTabName = computed(() => {
  const tabNames = {
    principle: '实验原理',
    target: '实验目标',
    equipment: '实验器具'
  }
  return tabNames[activeTab.value]
})



// 处理标签页点击
const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
  console.log(activeTab.value)
  if(activeTab.value == 'principle') {
    //调用实验原理
    getPrincipleList()
  } else if(activeTab.value == 'target') {
    //调用实验目标
    getTargetList()
  } else if(activeTab.value == 'equipment') {
    //调用器具
    getExperimentWarehouseList();
  } else if(activeTab.value == 'conclusion') {//实验结论
    // getWarehouseList()
  } else if(activeTab.value == 'knowledgeExtend') {//知识点延伸
  }
}

//初始化数据
onMounted(() => {
  getPrincipleList()//实验原理
  getTargetList()//实验目标
  getExperimentWarehouseList()//实验器具
})

// 对所有的tab进行校验，如果都没有操作则无法通过下一步
const validateForm = async () => {
  // if (activeTab.value == 'principle') {
  //   // debugger
  //   // Validate principle tab
  //   if (principleList.value.length === 0) {
  //     throw new Error('请完成实验原理的必填项')
  //   }
  // } else if (activeTab.value == 'target') {
  //   // Validate target tab
  //   if (targetList.value.length === 0) {
  //     throw new Error('请完成实验目标的必填项')
  //   }
  // } else if (activeTab.value == 'equipment') {
  //   // Validate equipment tab
  //   if (experimentWarehousePageList.value.length === 0) {
  //     throw new Error('请至少添加一个实验器具')
  //   }
  // }
  if(principleList.value.length === 0 && targetList.value.length === 0 && experimentWarehousePageList.value.length === 0) {
    throw new Error('请完成实验扩展信息的必填项')
  }
  return true
}

// Expose the validation method
defineExpose({
  activeTab,
  validateForm
})

// 编辑实验目标
const handleEditTarget = (target) => {
  formTargetData.value = { ...target }
  targetDialogVisible.value = true
}

// 删除实验目标
const handleDeleteTarget = async (target) => {
  try {
    await proxy.$modal.confirm('是否确认删除该实验目标？')
    await delExperimentTarget(target.id)
    proxy.$modal.msgSuccess("删除成功")
    getTargetList()
  } catch (error) {
    console.error('删除失败:', error)
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

// 编辑实验原理
const handleEditPrinciple = (principle) => {
  formPrincipleData.value = { ...principle }
  principleDialogVisible.value = true
}

// 删除实验原理
const handleDeletePrinciple = async (principle) => {
  try {
    await proxy.$modal.confirm('是否确认删除该实验原理？')
    await delExperimentPrinciple(principle.id)
    proxy.$modal.msgSuccess("删除成功")
    getPrincipleList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}



</script>

<style lang="scss" scoped>
/* 复用 BasicInfo-management 的主要样式 */
.extend-info-container {
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
  border-radius: 0;
  border: none;
}

/* 自定义标签页样式 */
.custom-tabs {
  background: white;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #e8edf3;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 0;
  padding: 6px 8px 0;
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

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
  background-color: white;
}

/* Tab内容区域样式 */
:deep(.el-tab-pane) {
  padding: 10px;
}

/* Tinymce编辑器容器样式 */
.tab-content {
  padding: 20px;
  background: white;
}
.title-input {
  flex: 1;
}


/* 搜索区域样式更新 */
.search-wrapper {
  margin-bottom: 10px;
}

.search-section {
  /* background: #f8fafc; */
  border-radius: 8px;
  /* padding: 20px; */
  /* margin-bottom: 10px; */
}

/* 操作栏样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 弹窗样式优化 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  /* border-top: 1px solid #e4e7ed;
  background: #f8fafc; */
}

/* 按钮样式统一 */
:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
}


/* 空状态样式 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 500px);
}

.welcome-content {
  text-align: center;
  padding: 48px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.welcome-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 24px;
}

h2 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 12px;
  font-weight: 500;
}

p {
  font-size: 14px;
  color: #909399;
  margin-bottom: 24px;
}

.add-button {
  margin-top: 24px;
  padding: 12px 32px;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #409EFF, #3a8ee6);
  border: none;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
    background: linear-gradient(135deg, #66b1ff, #409EFF);
  }

  .el-icon {
    font-size: 16px;
  }
}

/* 实验目标列表样式 */
.target-list {
  padding: 24px;
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.target-item {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideIn 0.6s ease-out forwards;
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 过渡动画
.target-fade-enter-active,
.target-fade-leave-active {
  transition: all 0.5s ease;
}

.target-fade-enter-from,
.target-fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

//实验原理和目标创建时间图标调整
.clock-class {
  position: relative;
  top: 2px;
  margin: 0 2px 0 0;
}
</style>