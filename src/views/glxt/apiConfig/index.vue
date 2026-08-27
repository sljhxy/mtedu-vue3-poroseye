<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 平台列表 -->
      <el-col :span="5" :xs="24">
        <div class="platform-search-wrapper">
          <el-input
            v-model="platformName"
            placeholder="搜索平台"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            class="platform-search-input"
          />
        </div>
        <div class="head-container tree-container">
          <el-tree
            :data="platformOptions"
            :props="defaultProps"
            :filter-node-method="filterNode"
            ref="tree"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>

      <!-- 右侧内容区 -->
      <el-col :span="19" :xs="24">
        <!-- 面包屑导航和快速选择 -->
        <div class="page-header">
          <el-breadcrumb separator="/" class="breadcrumb-nav">
            <el-breadcrumb-item>AI管理</el-breadcrumb-item>
            <el-breadcrumb-item>API配置</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentPlatformName">{{ currentPlatformName }}</el-breadcrumb-item>
            <el-breadcrumb-item v-else>请选择平台</el-breadcrumb-item>
          </el-breadcrumb>

          <div class="platform-quick-select">
            <span class="select-label">快速切换：</span>
            <el-select
              v-model="currentPlatformId"
              placeholder="选择平台"
              size="small"
              @change="handlePlatformChange"
              style="width: 200px"
            >
              <el-option
                v-for="platform in platformOptions"
                :key="platform.id"
                :label="platform.platformName"
                :value="platform.id"
              />
            </el-select>
          </div>
        </div>

        <el-tabs v-model="activeTab">
          <!-- Tab 1: API配置列表 -->
          <el-tab-pane label="API配置" name="apiConfig">
            <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="auto" class="filter-form">
              <el-form-item label="应用名称" prop="appName">
                <el-input
                  v-model="queryParams.appName"
                  placeholder="请输入应用名称"
                  clearable
                  style="width: 200px"
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
                  <el-option label="启用" value="0" />
                  <el-option label="停用" value="1" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                  type="primary"
                  plain
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAddConfig"
                  :disabled="!currentPlatformId"
                  v-hasPermi="['glxt:aiConfig:add']"
                >新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  type="danger"
                  plain
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="multiple"
                  @click="handleDeleteConfig"
                  v-hasPermi="['glxt:aiConfig:remove']"
                >删除</el-button>
              </el-col>
              <right-toolbar :showSearch.sync="showSearch" @queryTable="getConfigList"></right-toolbar>
            </el-row>

            <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column label="应用名称" prop="appName" :show-overflow-tooltip="true" />
              <el-table-column label="应用ID" prop="appId" :show-overflow-tooltip="true" width="150" />
              <el-table-column label="模型名称" prop="modelName" :show-overflow-tooltip="true" width="120" />
              <el-table-column label="API地址" prop="apiUrl" :show-overflow-tooltip="true" width="200" />
              <el-table-column label="状态" prop="status" width="80" align="center">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    active-value="0"
                    inactive-value="1"
                    @change="handleStatusChange(scope.row)"
                  ></el-switch>
                </template>
              </el-table-column>
              <el-table-column label="测试状态" prop="lastTestResult" width="110" align="center">
                <template #default="scope">
                  <el-tooltip :content="getTestStatusTooltip(scope.row)" placement="top">
                    <span class="test-status-indicator">
                      <i v-if="scope.row.lastTestResult === 'success'" class="el-icon-success test-status-success"></i>
                      <i v-else-if="scope.row.lastTestResult === 'failed'" class="el-icon-error test-status-failed"></i>
                      <i v-else-if="scope.row.lastTestResult === 'timeout'" class="el-icon-warning test-status-timeout"></i>
                      <i v-else class="el-icon-question test-status-unknown"></i>
                      <span class="test-status-text">{{ getTestStatusText(scope.row) }}</span>
                    </span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" prop="createTime" width="160" align="center">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
                <template #default="scope">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-chat-line-round"
                    @click="handleTest(scope.row)"
                    v-hasPermi="['glxt:aiConfig:query']"
                  >测试</el-button>
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-edit"
                    @click="handleUpdateConfig(scope.row)"
                    v-hasPermi="['glxt:aiConfig:edit']"
                  >修改</el-button>
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-delete"
                    @click="handleDeleteConfig(scope.row)"
                    v-hasPermi="['glxt:aiConfig:remove']"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <pagination
              v-show="total>0"
              :total="total"
              :page="queryParams.pageNum"
              :limit="queryParams.pageSize"
              @pagination="getConfigList"
            />
          </el-tab-pane>

          <!-- Tab 2: 场景配置 -->
          <el-tab-pane label="场景配置" name="sceneConfig">
            <el-form :model="sceneQueryParams" ref="sceneQueryForm" size="small" :inline="true" v-show="showSceneSearch" label-width="auto" class="filter-form">
              <el-form-item label="场景名称" prop="sceneName">
                <el-input
                  v-model="sceneQueryParams.sceneName"
                  placeholder="请输入场景名称"
                  clearable
                  style="width: 200px"
                  @keyup.enter.native="handleSceneQuery"
                />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-select v-model="sceneQueryParams.status" placeholder="请选择状态" clearable style="width: 120px">
                  <el-option label="正常" value="0" />
                  <el-option label="停用" value="1" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSceneQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetSceneQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                  type="primary"
                  plain
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAddScene"
                  :disabled="!currentPlatformId"
                  v-hasPermi="['glxt:aiConfig:add']"
                >新增</el-button>
              </el-col>
              <right-toolbar :showSearch.sync="showSceneSearch" @queryTable="getSceneList"></right-toolbar>
            </el-row>

            <el-table v-loading="sceneLoading" :data="sceneConfigList">
              <el-table-column label="场景标识" prop="sceneKey" width="120" />
              <el-table-column label="场景名称" prop="sceneName" width="120" />
              <el-table-column label="使用配置" prop="configId" width="150">
                <template #default="scope">
                  {{ getConfigName(scope.row.configId) }}
                </template>
              </el-table-column>
              <el-table-column label="描述" prop="description" :show-overflow-tooltip="true" />
              <el-table-column label="状态" prop="status" width="80" align="center">
                <template #default="scope">
                  <el-tag v-if="scope.row.status === '0'" type="success" size="mini">正常</el-tag>
                  <el-tag v-else type="danger" size="mini">停用</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
              <el-table-column label="操作" align="center" width="200">
                <template #default="scope">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-edit"
                    @click="handleUpdateScene(scope.row)"
                    v-hasPermi="['glxt:aiConfig:edit']"
                  >修改</el-button>
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-delete"
                    @click="handleDeleteScene(scope.row)"
                    v-hasPermi="['glxt:aiConfig:remove']"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <pagination
              v-show="sceneTotal>0"
              :total="sceneTotal"
              :page="sceneQueryParams.pageNum"
              :limit="sceneQueryParams.pageSize"
              @pagination="getSceneList"
            />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <!-- 添加或修改API配置对话框 -->
    <el-dialog :title="configTitle" v-model="configOpen" width="800px" append-to-body>
      <el-form ref="configForm" :model="configForm" :rules="configRules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="应用名称" prop="appName">
              <el-input v-model="configForm.appName" placeholder="请输入应用名称" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应用ID" prop="appId">
              <el-input v-model="configForm.appId" placeholder="应用ID/模型ID/Bot ID" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型名称" prop="modelName">
              <el-input v-model="configForm.modelName" placeholder="如：gpt-4" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="API地址" prop="apiUrl">
              <el-input v-model="configForm.apiUrl" placeholder="留空使用预设地址" maxlength="500" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="API密钥" prop="apiKey">
              <el-input v-model="configForm.apiKey" type="password" placeholder="请输入API密钥" show-password maxlength="500" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="认证方式" prop="authType">
              <el-select v-model="configForm.authType" placeholder="请选择认证方式" clearable>
                <el-option label="Bearer Token" value="bearer_token" />
                <el-option label="API Key(Header)" value="api_key_header" />
                <el-option label="API Key(Query)" value="api_key_query" />
                <el-option label="Basic Auth" value="basic_auth" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求方式" prop="requestMethod">
              <el-select v-model="configForm.requestMethod" placeholder="请选择请求方式">
                <el-option label="POST" value="POST" />
                <el-option label="GET" value="GET" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="默认参数" prop="defaultParams">
              <el-input v-model="configForm.defaultParams" type="textarea" placeholder='JSON格式，如：{"temperature": 0.7}' />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="configForm.status">
                <el-radio label="0">启用</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="configForm.sortOrder" :min="0" controls-position="right" style="width: 200px" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="configForm.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitConfigForm">确 定</el-button>
          <el-button @click="cancelConfig">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改场景配置对话框 -->
    <el-dialog :title="sceneTitle" v-model="sceneOpen" width="600px" append-to-body>
      <el-form ref="sceneForm" :model="sceneForm" :rules="sceneRules" label-width="100px">
        <el-form-item label="场景标识" prop="sceneKey">
          <el-input v-model="sceneForm.sceneKey" placeholder="如：tutor" :disabled="sceneForm.id != null" maxlength="50" />
          <span class="help-block">只能包含字母、数字和下划线，创建后不可修改</span>
        </el-form-item>
        <el-form-item label="场景名称" prop="sceneName">
          <el-input v-model="sceneForm.sceneName" placeholder="如：智能辅导" maxlength="100" />
        </el-form-item>
        <el-form-item label="使用配置" prop="configId">
          <el-select v-model="sceneForm.configId" placeholder="请选择API配置" clearable style="width: 100%">
            <el-option
              v-for="config in allConfigs"
              :key="config.id"
              :label="config.appName"
              :value="config.id"
            >
              <span style="float: left">{{ config.appName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ config.modelName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="sceneForm.description" type="textarea" placeholder="请输入场景描述" maxlength="500" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="sceneForm.sortOrder" :min="0" controls-position="right" style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="sceneForm.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="sceneForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitSceneForm">确 定</el-button>
          <el-button @click="cancelScene">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 测试对话框 -->
    <el-dialog title="测试API配置" v-model="testOpen" width="800px" append-to-body>
      <el-form ref="testForm" :model="testForm" label-width="80px">
        <el-form-item label="测试内容">
          <el-input v-model="testForm.query" type="textarea" placeholder="请输入测试内容（可选）" :rows="3" />
          <div class="help-block">留空则发送默认测试内容"test"</div>
        </el-form-item>
      </el-form>

      <!-- 高级选项折叠面板 -->
      <el-collapse v-model="activeCollapseNames" style="margin: 20px 0;">
        <el-collapse-item title="高级选项（自定义测试问题和参数）" name="advanced">
          <el-form ref="advancedTestForm" :model="advancedTestForm" label-width="100px">
            <el-form-item label="自定义问题">
              <el-input v-model="advancedTestForm.query" type="textarea" placeholder="留空则使用上方测试内容" :rows="2" />
              <div class="help-block">如果填写，将覆盖上方的测试内容</div>
            </el-form-item>

            <!-- 化学实验参数（仅当配置是化学实验助手时显示） -->
            <div v-if="isChemistryExperimentConfig" class="experiment-params">
              <el-divider content-position="left">实验参数</el-divider>
              <el-row :gutter="15">
                <el-col :span="8">
                  <el-form-item label="实验ID">
                    <el-input v-model="advancedTestForm.customInputs.exp_id" placeholder="如：101" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="实验名称">
                    <el-input v-model="advancedTestForm.customInputs.exp_name" placeholder="如：酸碱中和" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="学校类型">
                    <el-select v-model="advancedTestForm.customInputs.exp_school" placeholder="请选择">
                      <el-option label="小学" value="小学" />
                      <el-option label="初中" value="初中" />
                      <el-option label="高中" value="高中" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="15">
                <el-col :span="8">
                  <el-form-item label="年级">
                    <el-input v-model="advancedTestForm.customInputs.exp_grade" placeholder="如：9" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="班级">
                    <el-input v-model="advancedTestForm.customInputs.exp_class" placeholder="如：2" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="实验对象">
                    <el-input v-model="advancedTestForm.customInputs.exp_obj" placeholder="如：1" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="15">
                <el-col :span="8">
                  <el-form-item label="实验流程">
                    <el-input v-model="advancedTestForm.customInputs.exp_process" placeholder="如：11" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 自定义参数 -->
            <el-divider content-position="left">自定义参数（JSON格式）</el-divider>
            <el-form-item label="CustomInputs">
              <el-input
                v-model="advancedTestForm.customInputsJson"
                type="textarea"
                :rows="3"
                placeholder='{"key": "value"}'
              />
              <div class="help-block">
                自定义参数会与上述实验参数合并，相同键名时实验参数优先
              </div>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleDoTest" :loading="testLoading">
            <i class="el-icon-video-play" v-if="!testLoading"></i>
            {{ testLoading ? '测试中...' : '开始测试' }}
          </el-button>
          <el-button @click="testOpen = false">关 闭</el-button>
        </div>
      </template>

      <!-- 测试结果 -->
      <div v-if="testResult" class="test-result-container">
        <el-alert
          :title="testResult.success ? '测试成功' : '测试失败'"
          :type="testResult.success ? 'success' : 'error'"
          :closable="false"
          show-icon
          style="margin-bottom: 15px"
        >
          <template #default>
            <div v-if="testResult.success">
              <p>API配置可用，连接测试成功</p>
            </div>
            <div v-else>
              <p>{{ testResult.errorMessage || '测试失败，请检查配置' }}</p>
            </div>
          </template>
        </el-alert>

        <!-- 详细信息 -->
        <el-card v-if="testResult.success" shadow="never" class="test-details-card">
          <template #header>
            <span class="test-details-title">详细信息</span>
          </template>

          <!-- 响应内容 -->
          <div class="test-detail-item">
            <span class="test-detail-label">响应内容：</span>
            <div class="test-detail-content">
              {{ testResult.content || '(无内容)' }}
            </div>
          </div>

          <!-- 统计信息 -->
          <el-row :gutter="20" class="test-stats-row">
            <el-col :span="8">
              <div class="test-stat-item">
                <i class="el-icon-time"></i>
                <span class="test-stat-label">响应时间：</span>
                <span class="test-stat-value">{{ testResult.duration || 0 }} ms</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="test-stat-item">
                <i class="el-icon-coin"></i>
                <span class="test-stat-label">总Token：</span>
                <span class="test-stat-value">{{ testResult.totalTokens || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="test-stat-item">
                <i class="el-icon-document"></i>
                <span class="test-stat-label">提示Token：</span>
                <span class="test-stat-value">{{ testResult.promptTokens || '-' }}</span>
              </div>
            </el-col>
          </el-row>

          <!-- 原始响应（折叠） -->
          <el-collapse v-if="testResult.rawResponse" style="margin-top: 15px">
            <el-collapse-item title="查看原始响应" name="raw">
              <pre class="test-raw-response">{{ JSON.stringify(JSON.parse(testResult.rawResponse), null, 2) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPlatform } from "@/api/glxt/aiPlatform";
import { listApiConfig, getApiConfig, delApiConfig, addApiConfig, updateApiConfig, toggleApiConfigStatus, testApiConfig, advancedTestApiConfig } from "@/api/glxt/aiPlatform";
import { listSceneConfig, getSceneConfig, addSceneConfig, updateSceneConfig, delSceneConfig } from "@/api/glxt/aiSceneConfig";

export default {
  name: "AiApiConfig",
  data() {
    return {
      // 当前激活的Tab
      activeTab: 'apiConfig',

      // ============ API配置相关数据 ============
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      configList: [],
      platformOptions: [],
      platformName: '',
      defaultProps: {
        children: 'children',
        label: 'platformName'
      },
      currentPlatformId: null,
      currentPlatformName: '', // 当前选中平台的名称
      configTitle: "",
      configOpen: false,
      configForm: {},
      configRules: {
        appName: [
          { required: true, message: "应用名称不能为空", trigger: "blur" }
        ],
        modelName: [
          { required: true, message: "模型名称不能为空", trigger: "blur" }
        ],
        apiKey: [
          { required: true, message: "API密钥不能为空", trigger: "blur" }
        ]
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        platformId: null,
        appName: null,
        status: null
      },

      // ============ 场景配置相关数据 ============
      sceneLoading: true,
      showSceneSearch: true,
      sceneTotal: 0,
      sceneConfigList: [],
      sceneTitle: "",
      sceneOpen: false,
      sceneForm: {},
      sceneRules: {
        sceneKey: [
          { required: true, message: "场景标识不能为空", trigger: "blur" },
          { pattern: /^[a-zA-Z0-9_]+$/, message: "只能包含字母、数字和下划线", trigger: "blur" }
        ],
        sceneName: [
          { required: true, message: "场景名称不能为空", trigger: "blur" }
        ],
        configId: [
          { required: true, message: "请选择API配置", trigger: "change" }
        ]
      },
      sceneQueryParams: {
        pageNum: 1,
        pageSize: 10,
        platformId: null,
        sceneName: null,
        status: null
      },
      allConfigs: [], // 所有API配置（用于场景配置选择）

      // ============ 测试相关数据 ============
      testOpen: false,
      testLoading: false,
      testForm: {
        query: ""
      },
      testResult: null,
      currentConfig: null,
      activeCollapseNames: [], // 激活的折叠面板名称数组
      // 高级测试表单
      advancedTestForm: {
        query: "",
        customInputsJson: '{}',
        customInputs: {
          exp_id: '101',
          exp_name: '氢气还原氧化铜实验',
          exp_school: '初中',
          exp_grade: '9',
          exp_class: '3',
          exp_obj: '2',
          exp_process: '11'
        }
      },
      isChemistryExperimentConfig: false // 是否为化学实验助手配置
    };
  },
  created() {
    this.getPlatformList().then(() => {
      const urlPlatformId = this.$route.query.platformId;

      if (urlPlatformId) {
        // URL指定了平台，使用URL的平台
        this.currentPlatformId = parseInt(urlPlatformId);
        this.queryParams.platformId = parseInt(urlPlatformId);
        this.sceneQueryParams.platformId = parseInt(urlPlatformId);
        this.$nextTick(() => {
          if (this.$refs.tree) {
            this.$refs.tree.setCurrentKey(urlPlatformId);
          }
        });
      } else if (this.platformOptions.length > 0) {
        // URL没有指定平台，默认选中第一个平台
        const firstPlatform = this.platformOptions[0];
        this.currentPlatformId = firstPlatform.id;
        this.currentPlatformName = firstPlatform.platformName;
        this.queryParams.platformId = firstPlatform.id;
        this.sceneQueryParams.platformId = firstPlatform.id;
        this.$nextTick(() => {
          if (this.$refs.tree) {
            this.$refs.tree.setCurrentKey(firstPlatform.id);
          }
        });
      }

      this.getConfigList();
      this.getAllConfigs();
    });
  },
  methods: {
    /** Tab切换事件 */
    handleTabClick(tab) {
      // 此方法已废弃，改用 watch activeTab
      if (tab.name === 'sceneConfig') {
        this.handleSceneQuery();
      }
    },

    /** 查询平台列表 */
    getPlatformList() {
      return listPlatform({ status: '0', pageNum: 1, pageSize: 100 }).then(response => {
        this.platformOptions = response.rows;
      });
    },

    /** 查询API配置列表 */
    getConfigList(event) {
      if (event) {
        this.queryParams.pageNum = event.page;
        this.queryParams.pageSize = event.limit;
      }
      this.loading = true;
      listApiConfig(this.queryParams).then(response => {
        this.configList = response.rows;
        this.total = response.total;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },

    /** 获取所有API配置（用于场景配置选择） */
    getAllConfigs() {
      // 如果已选择平台，只获取该平台的配置；否则获取所有启用配置
      const params = { status: '0', pageNum: 1, pageSize: 1000 };
      if (this.currentPlatformId) {
        params.platformId = this.currentPlatformId;
      }
      listApiConfig(params).then(response => {
        this.allConfigs = response.rows;
      });
    },

    /** 查询场景配置列表 */
    getSceneList(event) {
      if (event) {
        this.sceneQueryParams.pageNum = event.page;
        this.sceneQueryParams.pageSize = event.limit;
      }
      this.sceneLoading = true;
      listSceneConfig(this.sceneQueryParams).then(response => {
        this.sceneConfigList = response.rows;
        this.sceneTotal = response.total;
        this.sceneLoading = false;
      }).catch((error) => {
        this.sceneLoading = false;
      });
    },

    /** 根据配置ID获取配置名称 */
    getConfigName(configId) {
      const config = this.allConfigs.find(c => c.id === configId);
      return config ? `${config.appName} (${config.modelName})` : '未知配置';
    },

    /** 获取测试状态文本 */
    getTestStatusText(row) {
      if (!row.lastTestResult) {
        return '未测试';
      }
      switch (row.lastTestResult) {
        case 'success':
          return '已测试';
        case 'failed':
          return '失败';
        case 'timeout':
          return '超时';
        default:
          return '未知';
      }
    },

    /** 获取测试状态提示信息 */
    getTestStatusTooltip(row) {
      if (!row.lastTestResult) {
        return '尚未测试此配置';
      }
      const statusText = {
        'success': '测试成功',
        'failed': '测试失败',
        'timeout': '测试超时'
      }[row.lastTestResult] || '未知状态';

      const timeText = row.lastTestTime
        ? `最后测试时间：${this.parseTime(row.lastTestTime)}`
        : '无测试时间';

      return `${statusText}\n${timeText}`;
    },

    /** 筛选节点 */
    filterNode(value, data) {
      if (!value) return true;
      return data.platformName.indexOf(value) !== -1;
    },

    /** 节点单击事件 */
    handleNodeClick(data) {
      this.currentPlatformId = data.id;
      this.currentPlatformName = data.platformName;
      this.queryParams.platformId = data.id;
      this.sceneQueryParams.platformId = data.id;
      this.getConfigList();
      this.getAllConfigs(); // 更新场景配置选择器的配置列表
      // 如果当前在场景配置tab，同时刷新场景列表
      if (this.activeTab === 'sceneConfig') {
        this.handleSceneQuery();
      }
    },

    /** 平台快速切换 */
    handlePlatformChange(platformId) {
      if (!platformId) return;

      const platform = this.platformOptions.find(p => p.id === platformId);
      if (platform) {
        this.currentPlatformId = platformId;
        this.currentPlatformName = platform.platformName;
        this.queryParams.platformId = platformId;
        this.sceneQueryParams.platformId = platformId;
        this.$nextTick(() => {
          if (this.$refs.tree) {
            this.$refs.tree.setCurrentKey(platformId);
          }
        });
        this.getConfigList();
        this.getAllConfigs(); // 更新场景配置选择器的配置列表
        // 如果当前在场景配置tab，同时刷新场景列表
        if (this.activeTab === 'sceneConfig') {
          this.handleSceneQuery();
        }
      }
    },

    // ============ API配置相关方法 ============
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getConfigList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.pageNum = 1;
      this.queryParams.appName = null;
      this.queryParams.status = null;
      this.$modal.msgSuccess("已重置筛选条件");
      this.getConfigList();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleAddConfig() {
      if (!this.currentPlatformId) {
        this.$modal.msgError("请先选择平台");
        return;
      }
      this.resetConfigForm();
      this.configOpen = true;
      this.configTitle = "添加API配置";
    },
    handleUpdateConfig(row) {
      this.resetConfigForm();
      const id = row.id || this.ids[0];
      getApiConfig(id).then(response => {
        this.configForm = response.data;
        this.configOpen = true;
        this.configTitle = "修改API配置";
      });
    },
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.appName + '"配置吗？').then(function() {
        return toggleApiConfigStatus(row.id);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    submitConfigForm() {
      this.$refs["configForm"].validate(valid => {
        if (valid) {
          if (this.configForm.id != null) {
            updateApiConfig(this.configForm).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.configOpen = false;
              this.getConfigList();
              this.getAllConfigs();
            });
          } else {
            addApiConfig(this.configForm).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.configOpen = false;
              this.getConfigList();
              this.getAllConfigs();
            });
          }
        }
      });
    },
    handleDeleteConfig(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除选中的配置数据？').then(function() {
        return delApiConfig(ids);
      }).then(() => {
        this.getConfigList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    cancelConfig() {
      this.configOpen = false;
      this.resetConfigForm();
    },
    resetConfigForm() {
      this.configForm = {
        id: null,
        platformId: this.currentPlatformId,
        appName: null,
        appId: null,
        modelName: null,
        apiUrl: null,
        authType: null,
        authHeaderName: 'Authorization',
        authPrefix: 'Bearer ',
        apiKey: null,
        secretKey: null,
        requestMethod: 'POST',
        contentType: 'application/json',
        customHeaders: null,
        requestBodyTemplate: null,
        defaultParams: null,
        requiredFields: null,
        responseType: 'json',
        responseExtractPath: null,
        status: "0",
        sortOrder: 0,
        remark: null
      };
      this.resetForm("configForm");
    },

    // ============ 场景配置相关方法 ============
    handleSceneQuery() {
      this.sceneQueryParams.pageNum = 1;
      this.getSceneList();
    },
    resetSceneQuery() {
      this.resetForm("sceneQueryForm");
      this.sceneQueryParams.pageNum = 1;
      this.sceneQueryParams.sceneName = null;
      this.sceneQueryParams.status = null;
      this.$modal.msgSuccess("已重置筛选条件");
      this.getSceneList();
    },
    handleAddScene() {
      if (!this.currentPlatformId) {
        this.$modal.msgError("请先选择平台");
        return;
      }
      this.resetSceneForm();
      this.sceneOpen = true;
      this.sceneTitle = "添加场景配置";
    },
    handleUpdateScene(row) {
      this.resetSceneForm();
      getSceneConfig(row.id).then(response => {
        this.sceneForm = response.data;
        this.sceneOpen = true;
        this.sceneTitle = "修改场景配置";
      });
    },
    submitSceneForm() {
      this.$refs["sceneForm"].validate(valid => {
        if (valid) {
          if (this.sceneForm.id != null) {
            updateSceneConfig(this.sceneForm).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.sceneOpen = false;
              this.getSceneList();
            });
          } else {
            addSceneConfig(this.sceneForm).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.sceneOpen = false;
              this.getSceneList();
            });
          }
        }
      });
    },
    handleDeleteScene(row) {
      this.$modal.confirm('是否确认删除场景配置"' + row.sceneName + '"？').then(function() {
        return delSceneConfig(row.id);
      }).then(() => {
        this.getSceneList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    cancelScene() {
      this.sceneOpen = false;
      this.resetSceneForm();
    },
    resetSceneForm() {
      this.sceneForm = {
        id: null,
        sceneKey: null,
        sceneName: null,
        configId: null,
        platformId: this.currentPlatformId,
        schoolId: null,
        schoolType: null,
        description: null,
        status: "0",
        sortOrder: 0,
        remark: null
      };
      this.resetForm("sceneForm");
    },

    // ============ 测试相关方法 ============
    handleTest(row) {
      this.currentConfig = row;
      this.testForm.query = "";
      this.testResult = null;
      this.activeCollapseNames = []; // 重置折叠面板状态

      // 判断是否为化学实验助手配置
      this.isChemistryExperimentConfig =
        (row.appName && row.appName.includes('化学实验助手')) ||
        (row.appId && row.appId === '4f874c95da6c49ba96b6cb39d35131b1');

      // 重置高级测试表单
      this.advancedTestForm = {
        query: "",
        customInputsJson: '{}',
        customInputs: {
          exp_id: '101',
          exp_name: '氢气还原氧化铜实验',
          exp_school: '初中',
          exp_grade: '9',
          exp_class: '3',
          exp_obj: '2',
          exp_process: '11'
        }
      };

      this.testOpen = true;
    },

    handleDoTest() {
      // 检查是否有高级选项的自定义问题或参数
      const hasAdvancedQuery = this.advancedTestForm.query && this.advancedTestForm.query.trim() !== '';
      const hasCustomInputs = this.advancedTestForm.customInputsJson && this.advancedTestForm.customInputsJson !== '{}';
      const hasExpParams = this.isChemistryExperimentConfig && Object.values(this.advancedTestForm.customInputs).some(v => v);

      if (hasAdvancedQuery || hasCustomInputs || hasExpParams) {
        // 使用高级测试模式
        this.testLoading = true;

        // 确定使用哪个query
        const queryToUse = hasAdvancedQuery ? this.advancedTestForm.query : (this.testForm.query || "test");

        // 合并自定义参数
        let customInputs = { ...this.advancedTestForm.customInputs };

        // 解析JSON格式的自定义参数
        if (hasCustomInputs) {
          try {
            const jsonParams = JSON.parse(this.advancedTestForm.customInputsJson);
            customInputs = { ...customInputs, ...jsonParams };
          } catch (e) {
            this.$modal.msgError("自定义参数JSON格式错误");
            this.testLoading = false;
            return;
          }
        }

        // 如果没有自定义参数且有化学实验参数，直接使用实验参数
        if (!hasCustomInputs && this.isChemistryExperimentConfig) {
          customInputs = this.advancedTestForm.customInputs;
        }

        // 构建测试请求
        const testRequest = {
          configId: this.currentConfig.id,
          query: queryToUse,
          customInputs: Object.keys(customInputs).length > 0 ? customInputs : undefined
        };

        this.callAiApi(testRequest);
      } else {
        // 使用快速测试模式
        this.testLoading = true;

        const testRequest = {
          configId: this.currentConfig.id,
          query: this.testForm.query || "test"
        };

        this.callAiApi(testRequest);
      }
    },

    callAiApi(testRequest) {
      // 调用高级测试接口
      advancedTestApiConfig(testRequest).then(response => {
        this.testLoading = false;
        if (response.data && response.data.success) {
          this.testResult = response.data;
          // 测试完成后刷新配置列表，更新测试状态
          this.getConfigList();
        } else {
          this.testResult = {
            success: false,
            errorMessage: response.data?.errorMessage || '测试失败'
          };
          // 显示错误提示
          this.$modal.msgError(this.testResult.errorMessage);
        }
      }).catch((error) => {
        this.testLoading = false;
        const errorMsg = error.response?.data?.msg || error.message || "网络错误，请检查网络连接";
        this.testResult = {
          success: false,
          errorMessage: "测试失败：" + errorMsg
        };
        // 显示错误提示
        this.$modal.msgError(this.testResult.errorMessage);
      });
    }
  },
  watch: {
    platformName(val) {
      this.$nextTick(() => {
        if (this.$refs.tree) {
          this.$refs.tree.filter(val);
        }
      });
    },
    activeTab(newVal) {
      if (newVal === 'sceneConfig') {
        this.$nextTick(() => {
          this.handleSceneQuery();
        });
      }
    }
  }
};
</script>

<style scoped>
.help-block {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

/* 筛选表单样式 */
.filter-form .el-form-item {
  margin-bottom: 12px;
}

.filter-form .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

/* 平台搜索容器 - 统一高度与右侧面包屑对齐 */
.platform-search-wrapper {
  padding: 12px 0;
  margin-bottom: 16px;
  min-height: 54px;
  display: flex;
  align-items: center;
}

/* 平台搜索框 */
.platform-search-input {
  width: 100%;
}

.platform-search-input .el-input__inner {
  width: 100%;
}

/* 树形容器 */
.tree-container {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

/* 页面头部导航 - 调整padding以与左侧对齐 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: 54px;
  box-sizing: border-box;
}

.breadcrumb-nav {
  flex: 1;
  display: flex;
  align-items: center;
}

.platform-quick-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.platform-quick-select .select-label {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}

/* 测试状态指示器样式 */
.test-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: help;
}

.test-status-indicator i {
  font-size: 16px;
}

.test-status-success {
  color: #67C23A;
}

.test-status-failed {
  color: #F56C6C;
}

.test-status-timeout {
  color: #E6A23C;
}

.test-status-unknown {
  color: #909399;
}

.test-status-text {
  font-size: 12px;
}

/* 测试结果容器 */
.test-result-container {
  margin-top: 20px;
}

.test-details-card {
  border: 1px solid #ebeef5;
}

.test-details-title {
  font-weight: 600;
  color: #303133;
}

.test-detail-item {
  margin-bottom: 15px;
}

.test-detail-label {
  font-weight: 600;
  color: #606266;
  margin-right: 8px;
}

.test-detail-content {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.test-stats-row {
  margin-top: 15px;
}

.test-stat-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.test-stat-item i {
  margin-right: 8px;
  color: #409eff;
  font-size: 16px;
}

.test-stat-label {
  color: #606266;
  margin-right: 5px;
}

.test-stat-value {
  color: #303133;
  font-weight: 600;
}

.test-raw-response {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
  font-size: 12px;
  color: #606266;
}

/* 响应式优化 */
@media screen and (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .platform-quick-select {
    width: 100%;
  }

  .platform-quick-select .el-select {
    width: 100% !important;
  }
}

/* 高级测试相关样式 */
.experiment-params {
  margin: 15px 0;
}

.experiment-params .el-divider {
  margin: 10px 0;
}

.experiment-params .el-form-item {
  margin-bottom: 12px;
}

/* 高级选项折叠面板样式 */
.el-collapse-item__content {
  padding-bottom: 0;
}

.el-collapse-item__wrap {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
}

.el-collapse-item__header {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式优化 */
@media screen and (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .platform-quick-select {
    width: 100%;
  }

  .platform-quick-select .el-select {
    width: 100% !important;
  }

  .filter-form {
    display: block;
  }

  .filter-form .el-form-item {
    display: block;
    margin-right: 0;
    margin-bottom: 16px;
  }

  .filter-form .el-input,
  .filter-form .el-select {
    width: 100% !important;
  }

  .tree-container {
    max-height: 400px;
  }
}

@media screen and (max-width: 576px) {
  .platform-quick-select .select-label {
    font-size: 12px;
  }

  .filter-form .el-button {
    width: 100%;
    margin-bottom: 8px;
  }

  .filter-form .el-button:last-child {
    margin-bottom: 0;
  }
}
</style>
