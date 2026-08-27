<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="APP名称" prop="appName">
        <el-input v-model="queryParams.appName" placeholder="请输入APP名称" clearable style="width: 200px" @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="平台" prop="platform">
        <el-select v-model="queryParams.platform" placeholder="请选择平台" clearable style="width: 150px">
          <el-option v-for="dict in mt_app_platform" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
          <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['glxt:appUpgrade:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['glxt:appUpgrade:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"/>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="upgradeList" @selection-change="handleSelectionChange" style="width: 100%">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" width="60" align="center"/>
      <el-table-column label="APP名称" prop="appName" align="center" width="350" :show-overflow-tooltip="true"/>
      <el-table-column label="版本号" prop="appVersion" align="center" width="180"/>
      <!-- <el-table-column label="Unity版本" prop="unityVersion" align="center" width="120"/> -->
      <el-table-column label="平台" prop="platform" align="center" width="150">
        <template #default="scope">
          <dict-tag :options="mt_app_platform" :value="scope.row.platform"/>
        </template>
      </el-table-column>
      <el-table-column label="升级范围" align="center" width="180">
        <template #default="scope">
          <!-- 全部 -->
          <el-tag v-if="scope.row.schoolScope === 0 && scope.row.schoolType === 0">全部</el-tag>
          <el-tag v-else-if="scope.row.schoolScope === 0 && scope.row.schoolType === 1" type="success">全部普教</el-tag>
          <el-tag v-else-if="scope.row.schoolScope === 0 && scope.row.schoolType === 2" type="warning">全部职教</el-tag>
          <!-- 指定学校：统一用popover按类型分组显示 -->
          <template v-else>
            <el-popover placement="top" trigger="hover" :width="260">
              <template #reference>
                <el-tag type="info" class="cursor-pointer">{{ getRangeTagText(scope.row) }}</el-tag>
              </template>
              <!-- 普教分组 -->
              <template v-if="getGroupedSchools(scope.row).base.length">
                <div class="school-group-title">普教({{ getGroupedSchools(scope.row).base.length }}所)</div>
                <div class="school-popover-list" :class="{ 'has-divider': getGroupedSchools(scope.row).vocal.length }">
                  <div v-for="name in getGroupedSchools(scope.row).base" :key="name" class="school-popover-item">{{ name }}</div>
                </div>
              </template>
              <!-- 职教分组 -->
              <template v-if="getGroupedSchools(scope.row).vocal.length">
                <div class="school-group-title">职教({{ getGroupedSchools(scope.row).vocal.length }}所)</div>
                <div class="school-popover-list">
                  <div v-for="name in getGroupedSchools(scope.row).vocal" :key="name" class="school-popover-item">{{ name }}</div>
                </div>
              </template>
            </el-popover>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="更新策略" prop="updateStrategy" align="center" width="150">
        <template #default="scope">
          <el-tag :type="scope.row.updateStrategy === 0 ? 'danger' : 'success'">
            {{ scope.row.updateStrategy === 0 ? '强制' : '非强制' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="150">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否有效" prop="isEffective" align="center" width="150">
        <template #default="scope">
          <el-tag :type="scope.row.isEffective === 1 ? 'success' : 'info'">
            {{ scope.row.isEffective === 1 ? '有效' : '无效' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="升级时间" prop="upgradeTime" align="center" width="260"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <!-- color="#6EDC93" -->
          <el-button plain type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['glxt:appUpgrade:edit']">修改</el-button>
          <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:appUpgrade:remove']">删除</el-button>
          <el-button plain type="success" icon="VideoPlay" @click="handlePublish(scope.row)" v-if="scope.row.status === 0" v-hasPermi="['glxt:appUpgrade:publish']">发布</el-button>
          <el-button plain type="warning" icon="VideoPause" @click="handleOffline(scope.row)" v-if="scope.row.status === 1" v-hasPermi="['glxt:appUpgrade:offline']">下架</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/修改弹窗 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="upgradeRef" :model="form" :rules="rules" label-width="110px">
        <!-- 基础信息 -->
        <el-divider content-position="left">基础信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="APP名称" prop="appName">
              <el-input v-model="form.appName" placeholder="请输入APP名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台" prop="platform">
              <el-select v-model="form.platform" placeholder="请选择平台" style="width: 100%" :disabled="form.status === 1">
                <el-option v-for="dict in mt_app_platform" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="APP版本号" prop="appVersion">
              <el-input v-model="form.appVersion" placeholder="如 1.0.1 或 2.0.50.52"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Unity版本号" prop="unityVersion">
              <el-input v-model="form.unityVersion" placeholder="如 2021.3.14f1"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="APP数据包" prop="fileUrl">
          <file-upload v-model="form.fileUrl" fileSuffix="apk" :fileSize="200" @fileData="fileSuccessData"/>
        </el-form-item>
        <el-form-item label="升级描述" prop="appDesc">
          <el-input v-model="form.appDesc" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入升级内容，最多不超过200字"/>
        </el-form-item>

        <!-- 升级范围 -->
        <el-divider content-position="left">升级范围</el-divider>
        <el-form-item label="目标范围" prop="checkedNodeIds">
          <div class="range-selector-trigger" @click="openRangeDialog">
            <div class="range-preview">
              <span v-if="rangePreviewText" class="preview-text">{{ rangePreviewText }}</span>
              <span v-else class="preview-placeholder">请选择学校和设备</span>
            </div>
            <el-icon class="trigger-icon"><ArrowRight /></el-icon>
          </div>
        </el-form-item>

        <!-- 升级策略 -->
        <el-divider content-position="left">升级策略</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="更新策略" prop="updateStrategy">
              <el-radio-group v-model="form.updateStrategy">
                <el-radio :value="0">强制</el-radio>
                <el-radio :value="1">非强制</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否有效" prop="isEffective">
              <el-radio-group v-model="form.isEffective">
                <el-radio :value="1">有效</el-radio>
                <el-radio :value="0">无效</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="计划升级时间" prop="upgradeTime">
          <el-date-picker
            v-model="form.upgradeTime"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="请输入备注信息，最多不超过200字"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>

    <!-- 学校-设备选择弹窗 -->
    <el-dialog
      v-model="rangeDialogVisible"
      title="选择学校和设备"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="range-dialog-content">
        <!-- 左侧：快捷操作 -->
        <div class="range-sidebar">
          <div class="sidebar-title">快捷操作</div>
          <el-button size="small" @click="selectAll" class="sidebar-btn">
            全&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;选
          </el-button>
          <el-button size="small" @click="clearAll" class="sidebar-btn">
            清&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;空
          </el-button>
          <el-button size="small" @click="selectBaseOnly" class="sidebar-btn">
            只选普教
          </el-button>
          <el-button size="small" @click="selectVocalOnly" class="sidebar-btn">
            只选职教
          </el-button>

          <el-divider style="margin: 16px 0;" />

          <div class="sidebar-title">已选统计</div>
          <div class="stat-item">
            <span class="stat-label">学校：</span>
            <el-tag size="small" type="primary" effect="plain">{{ selectedSchoolCount }}所</el-tag>
          </div>
          <div class="stat-item">
            <span class="stat-label">设备：</span>
            <el-tag size="small" type="success" effect="plain">{{ selectedDeviceCount }}台</el-tag>
          </div>
        </div>

        <!-- 右侧：树形选择器 -->
        <div class="range-tree-wrapper">
          <!-- 树区域工具栏：搜索框 + 展开收起 -->
          <div class="tree-toolbar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索学校或设备名称"
              size="small"
              clearable
              @input="handleSearch"
              @change="handleSearchChange"
              @clear="handleSearchClear"
              class="tree-search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button-group class="tree-expand-btns">
              <el-button size="small" @click="expandAll">展开全部</el-button>
              <el-button size="small" @click="collapseAll">收起全部</el-button>
            </el-button-group>
          </div>

          <!-- 树形组件 -->
          <el-empty v-if="isTreeEmpty" description="未找到匹配的学校或设备" :image-size="80" />
          <el-tree
            v-else
            ref="rangeTreeRef"
            :data="schoolDeviceTreeData"
            :key="`${rangeDialogVisible}-${treeComponentKey}`"
            show-checkbox
            node-key="value"
            :default-expand-all="false"
            :check-strictly="false"
            :default-expanded-keys="['all', 'base', 'vocal']"
            @check="handleRangeTreeCheck"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rangeDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :disabled="!hasSelection"
            @click="confirmRangeSelection"
          >
            确定{{ hasSelection ? ` (${selectedSchoolCount}所学校/${selectedDeviceCount}台设备)` : '' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, nextTick, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listAppUpgrade, getAppUpgrade, addAppUpgrade, updateAppUpgrade,
  delAppUpgrade, publishAppUpgrade, offlineAppUpgrade, getSchoolDeviceTree
} from '@/api/glxt/appUpgrade'

const { proxy } = getCurrentInstance()
const { mt_app_platform } = proxy.useDict('mt_app_platform')

// 导入图标
import { ArrowRight, Search, Check, Delete, Plus, FolderOpened, Folder } from '@element-plus/icons-vue'

// 列表相关
const loading = ref(false)
const upgradeList = ref([])
const total = ref(0)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const open = ref(false)
const title = ref('')
const submitLoading = ref(false)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  appName: null,
  platform: null,
  status: null
})

// 状态映射（搜索和展示复用）
const statusMap = { '0': '待发布', '1': '已发布', '2': '已下架' }

// 学校-设备树形数据
const schoolDeviceTreeData = ref([])
const deviceTreeRef = ref(null) // 保留用于提交时获取选中节点
const rangeTreeRef = ref(null) // 弹窗内的树引用
// 学校ID → 名称 映射表（分类型）
const baseSchoolMap = ref({})
const vocalSchoolMap = ref({})

// 范围选择弹窗
const rangeDialogVisible = ref(false)

// 搜索关键词
const searchKeyword = ref('')
const originalTreeData = ref([]) // 保存原始树数据
const treeComponentKey = ref(0) // 用于强制重新渲染树组件

// 版本号正则校验器
const validateVersion = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  if (!/^\d+(\.\d+){1,3}$/.test(value)) {
    callback(new Error('版本号格式不正确，如 1.0.1 或 2.0.50.52'))
  } else {
    callback()
  }
}

// 表单
const form = ref({})
const rules = {
  appName: [{ required: true, message: '请输入APP名称', trigger: 'blur' }],
  appVersion: [
    { required: true, message: '请输入APP版本号', trigger: 'blur' },
    { validator: validateVersion, trigger: 'blur' }
  ],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  fileUrl: [{ required: true, message: '请上传APP安装包', trigger: 'change' }],
  upgradeTime: [{ required: true, message: '请选择升级时间', trigger: 'change' }],
  checkedNodeIds: [{ required: true, message: '请选择目标范围', trigger: 'change', validator: (rule, value, callback) => {
    // 检查是否已选择范围
    // schoolScope=0 表示全部，即使字段为null也是有效的
    if (form.value.schoolScope === 0) {
      callback()
    } else if (!form.value.baseSchoolIds && !form.value.vocalSchoolIds && !form.value.baseDeviceIds && !form.value.vocalDeviceIds) {
      callback(new Error('请选择目标范围'))
    } else {
      callback()
    }
  } }]
}

// 禁选今天之前的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

// 监听搜索关键词变化（统一处理搜索逻辑）
watch(searchKeyword, (newVal) => {
  console.log('=== watch searchKeyword ===', newVal)
  // 任何变化都调用 handleSearch 进行搜索
  // 这样可以确保删除字符时也能正确触发搜索
  handleSearch(newVal)
})

// 计算已选的学校数量
const selectedSchoolCount = computed(() => {
  if (!rangeTreeRef.value) return 0
  const checkedKeys = rangeTreeRef.value.getCheckedKeys()
  return checkedKeys.filter(k =>
    (k.startsWith('base_') && !k.startsWith('base_device_')) ||
    (k.startsWith('vocal_') && !k.startsWith('vocal_device_'))
  ).length
})

// 计算已选的设备数量
const selectedDeviceCount = computed(() => {
  if (!rangeTreeRef.value) return 0
  const checkedKeys = rangeTreeRef.value.getCheckedKeys()
  return checkedKeys.filter(k => k.startsWith('base_device_') || k.startsWith('vocal_device_')).length
})

// 是否有选择（用于确定按钮禁用状态）
const hasSelection = computed(() => {
  return selectedSchoolCount.value > 0 || selectedDeviceCount.value > 0
})

// 树是否为空（用于空状态显示）
const isTreeEmpty = computed(() => {
  return !schoolDeviceTreeData.value || schoolDeviceTreeData.value.length === 0 ||
    (schoolDeviceTreeData.value.length === 1 && !schoolDeviceTreeData.value[0].children)
})

// 预览文本（显示在触发器中）
const rangePreviewText = computed(() => {
  if (!form.value || Object.keys(form.value).length === 0) {
    return ''
  }

  // schoolScope=0 表示全部，直接返回"全部"
  if (form.value.schoolScope === 0) {
    const parts = []
    let baseDeviceCount = 0
    let vocalDeviceCount = 0
    if (form.value.baseDeviceIds) {
      baseDeviceCount = form.value.baseDeviceIds.split(',').length
    }
    if (form.value.vocalDeviceIds) {
      vocalDeviceCount = form.value.vocalDeviceIds.split(',').length
    }
    if (baseDeviceCount > 0) parts.push(`普教${baseDeviceCount}台设备`)
    if (vocalDeviceCount > 0) parts.push(`职教${vocalDeviceCount}台设备`)
    if (parts.length > 0) {
      return '全部 + ' + parts.join('、')
    }
    return '全部'
  }

  const parts = []
  let schoolCount = 0
  let deviceCount = 0

  // 统计学校
  if (form.value.baseSchoolIds) {
    const ids = form.value.baseSchoolIds.split(',').map(s => s.trim())
    if (form.value.schoolScope === 2) {
      // 排除模式：总数 - 排除数 = 实际选中的
      schoolCount += Object.keys(baseSchoolMap.value).length - ids.length
    } else {
      // 包含模式：直接数列表
      schoolCount += ids.length
    }
  } else if (form.value.schoolType === 0 || form.value.schoolType === 1) {
    // 没有baseSchoolIds，但schoolType包含普教 → 普教全部
    schoolCount += Object.keys(baseSchoolMap.value).length
  }

  if (form.value.vocalSchoolIds) {
    const ids = form.value.vocalSchoolIds.split(',').map(s => s.trim())
    if (form.value.schoolScope === 2) {
      schoolCount += Object.keys(vocalSchoolMap.value).length - ids.length
    } else {
      schoolCount += ids.length
    }
  } else if (form.value.schoolType === 0 || form.value.schoolType === 2) {
    schoolCount += Object.keys(vocalSchoolMap.value).length
  }

  // 统计设备
  if (form.value.baseDeviceIds) {
    deviceCount += form.value.baseDeviceIds.split(',').length
  }
  if (form.value.vocalDeviceIds) {
    deviceCount += form.value.vocalDeviceIds.split(',').length
  }

  if (schoolCount > 0) parts.push(`${schoolCount}所学校`)
  if (deviceCount > 0) parts.push(`${deviceCount}台设备`)

  return parts.join('、') || '请选择学校和设备'
})

// 状态展示
const statusTagType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'warning' }
  return map[status] || 'info'
}
const statusText = (status) => {
  return statusMap[status] || '未知'
}

// 获取平台名称
const getPlatformLabel = (value) => {
  const dict = mt_app_platform.value?.find(d => d.value === String(value))
  return dict?.label || '未知'
}

// 查询列表
const getList = () => {
  loading.value = true
  listAppUpgrade(queryParams.value).then(response => {
    upgradeList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  proxy.resetForm('queryRef')
  handleQuery()
}

// 多选
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

// 加载学校-设备树形数据
const loadSchoolDeviceTree = () => {
  getSchoolDeviceTree().then(res => {
    console.log('API返回数据:', res)
    const data = res.data || []
    console.log('解析后的数据:', data)
    schoolDeviceTreeData.value = data
    originalTreeData.value = JSON.parse(JSON.stringify(data)) // 保存原始数据用于搜索
    console.log('保存的原始数据:', originalTreeData.value)
    // 构建学校ID→名称映射
    const bMap = {}, vMap = {}
    const tree = data
    if (tree.length > 0 && tree[0].children) {
      tree[0].children.forEach(typeNode => {
        if (typeNode.value === 'base' && typeNode.children) {
          typeNode.children.forEach(s => { bMap[s.value.replace('base_', '')] = s.label })
        }
        if (typeNode.value === 'vocal' && typeNode.children) {
          typeNode.children.forEach(s => { vMap[s.value.replace('vocal_', '')] = s.label })
        }
      })
    }
    baseSchoolMap.value = bMap
    vocalSchoolMap.value = vMap
  })
}

// 按类型分组获取学校名称（用于popover展示，支持排除模式）
const getGroupedSchools = (row) => {
  const base = [], vocal = []

  // 普教
  if (row.baseSchoolIds) {
    const ids = row.baseSchoolIds.split(',').map(id => id.trim())
    if (row.schoolScope === 2) {
      // 排除模式：显示全部普教 - 排除的 = 实际推送的
      Object.keys(baseSchoolMap.value).forEach(id => {
        if (!ids.includes(id)) base.push(baseSchoolMap.value[id])
      })
    } else {
      // 包含模式：直接显示选中的
      ids.forEach(id => {
        if (baseSchoolMap.value[id]) base.push(baseSchoolMap.value[id])
      })
    }
  } else if (row.schoolType === 0 || row.schoolType === 1) {
    // baseSchoolIds为null且类型包含普教 → 该类型全部学校
    if (row.schoolScope === 0 || (row.schoolScope === 2 && !row.baseSchoolIds)) {
      Object.values(baseSchoolMap.value).forEach(name => base.push(name))
    }
  }

  // 职教
  if (row.vocalSchoolIds) {
    const ids = row.vocalSchoolIds.split(',').map(id => id.trim())
    if (row.schoolScope === 2) {
      Object.keys(vocalSchoolMap.value).forEach(id => {
        if (!ids.includes(id)) vocal.push(vocalSchoolMap.value[id])
      })
    } else {
      ids.forEach(id => {
        if (vocalSchoolMap.value[id]) vocal.push(vocalSchoolMap.value[id])
      })
    }
  } else if (row.schoolType === 0 || row.schoolType === 2) {
    if (row.schoolScope === 0 || (row.schoolScope === 2 && !row.vocalSchoolIds)) {
      Object.values(vocalSchoolMap.value).forEach(name => vocal.push(name))
    }
  }

  return { base, vocal }
}

// 标签文字：普教(3所) / 职教(5所) / 普教+职教(8所)
const getRangeTagText = (row) => {
  const { base, vocal } = getGroupedSchools(row)
  const parts = []
  if (base.length) parts.push('普教(' + base.length + '所)')
  if (vocal.length) parts.push('职教(' + vocal.length + '所)')
  return parts.join('+') || '指定学校'
}

// 重置表单
const resetForm = () => {
  form.value = {
    id: null,
    appName: null,
    appDesc: null,
    appVersion: null,
    unityVersion: null,
    platform: 0,
    fileUrl: null,
    fileSize: null,
    baseSchoolIds: null,
    vocalSchoolIds: null,
    baseDeviceIds: null,
    vocalDeviceIds: null,
    schoolType: null,
    schoolScope: null,
    updateStrategy: 1,
    upgradeTime: null,
    isEffective: 1,
    status: 0,
    remark: null
  }
  proxy.resetForm('upgradeRef')
}

// 文件上传成功
const fileSuccessData = (data) => {
  form.value.fileUrl = data.url
  form.value.fileSize = data.fileSize || data.size
}

// 树勾选变化（弹窗内）
const handleRangeTreeCheck = () => {}

// 打开范围选择弹窗
const openRangeDialog = () => {
  // 重置搜索关键词
  searchKeyword.value = ''

  // 先清空树的选中状态（清除之前的残留）
  if (rangeTreeRef.value) {
    try {
      rangeTreeRef.value.setCheckedKeys([])
    } catch (e) {
      console.warn('清空树选中状态失败:', e)
    }
  }

  // 打开弹窗
  rangeDialogVisible.value = true

  // 等待弹窗完全渲染后，再恢复选中状态
  nextTick(() => {
    if (!rangeTreeRef.value) return

    // 根据当前表单数据恢复选中状态
    let restoreKeys = []

    if (form.value.id) {
      // 编辑模式：从已保存的数据恢复
      let targetBaseIds = []
      let targetVocalIds = []

      if (form.value.baseSchoolIds) {
        const ids = form.value.baseSchoolIds.split(',').map(s => s.trim())
        if (form.value.schoolScope === 2) {
          const allBase = Object.keys(baseSchoolMap.value)
          targetBaseIds = allBase.filter(id => !ids.includes(id))
        } else {
          targetBaseIds = ids
        }
      } else if (form.value.schoolType === 0 || form.value.schoolType === 1) {
        targetBaseIds = Object.keys(baseSchoolMap.value)
      }

      if (form.value.vocalSchoolIds) {
        const ids = form.value.vocalSchoolIds.split(',').map(s => s.trim())
        if (form.value.schoolScope === 2) {
          const allVocal = Object.keys(vocalSchoolMap.value)
          targetVocalIds = allVocal.filter(id => !ids.includes(id))
        } else {
          targetVocalIds = ids
        }
      } else if (form.value.schoolType === 0 || form.value.schoolType === 2) {
        targetVocalIds = Object.keys(vocalSchoolMap.value)
      }

      if (form.value.schoolScope === 0 && !form.value.baseSchoolIds && !form.value.vocalSchoolIds && !form.value.baseDeviceIds && !form.value.vocalDeviceIds) {
        restoreKeys.push('all')
      } else {
        targetBaseIds.forEach(id => restoreKeys.push('base_' + id))
        targetVocalIds.forEach(id => restoreKeys.push('vocal_' + id))
        // 还原普教设备
        if (form.value.baseDeviceIds) {
          form.value.baseDeviceIds.split(',').map(s => s.trim()).forEach(id => {
            restoreKeys.push('base_device_' + id)
          })
        }
        // 还原职教设备
        if (form.value.vocalDeviceIds) {
          form.value.vocalDeviceIds.split(',').map(s => s.trim()).forEach(id => {
            restoreKeys.push('vocal_device_' + id)
          })
        }
      }
    } else {
      // 新增模式：默认全选
      restoreKeys = ['all']
    }

    rangeTreeRef.value.setCheckedKeys(restoreKeys)
  })
}

// 确认范围选择
const confirmRangeSelection = () => {
  if (!rangeTreeRef.value) return

  // 获取选中的节点（includeHalfChecked=true, 包含半选状态的父节点）
  // 关键修复：当用户选择设备时，学校父节点处于半选状态，需要包含进来
  const checkedNodes = rangeTreeRef.value.getCheckedNodes(false, true)
  // 获取选中的Keys（leafOnly=false, includeHalfChecked=false）
  // 关键修复：leafOnly=false 才能获取到 'all' 父节点
  const checkedKeys = rangeTreeRef.value.getCheckedKeys(false, false)
  const baseIds = []
  const vocalIds = []
  const baseDeviceIds = []
  const vocalDeviceIds = []

  checkedNodes.forEach(node => {
    const val = node.value || node
    if (typeof val !== 'string') return

    // 过滤掉父节点：'all', 'base', 'vocal'（这些节点的 value 不包含数字ID）
    if (val === 'all' || val === 'base' || val === 'vocal') {
      return
    }

    if (val.startsWith('base_') && !val.startsWith('base_device_')) {
      // 普教学校（格式：base_学校ID）
      const id = parseInt(val.split('_')[1])
      if (!isNaN(id)) baseIds.push(id)
    } else if (val.startsWith('vocal_') && !val.startsWith('vocal_device_')) {
      // 职教学校（格式：vocal_学校ID）
      const id = parseInt(val.split('_')[1])
      if (!isNaN(id)) vocalIds.push(id)
    } else if (val.startsWith('base_device_')) {
      // 普教设备（格式：base_device_设备ID）
      const id = parseInt(val.split('_')[2])
      if (!isNaN(id)) baseDeviceIds.push(id)
    } else if (val.startsWith('vocal_device_')) {
      // 职教设备（格式：vocal_device_设备ID）
      const id = parseInt(val.split('_')[2])
      if (!isNaN(id)) vocalDeviceIds.push(id)
    }
  })

  // 保存到表单
  form.value.baseSchoolIds = baseIds.length > 0 ? baseIds.join(',') : null
  form.value.vocalSchoolIds = vocalIds.length > 0 ? vocalIds.join(',') : null
  form.value.baseDeviceIds = baseDeviceIds.length > 0 ? baseDeviceIds.join(',') : null
  form.value.vocalDeviceIds = vocalDeviceIds.length > 0 ? vocalDeviceIds.join(',') : null

  // 如果全选了（包含 'all' 节点），清空字段表示"全部"
  const allSelected = checkedKeys.includes('all')
  if (allSelected) {
    form.value.baseSchoolIds = null
    form.value.vocalSchoolIds = null
    form.value.baseDeviceIds = null
    form.value.vocalDeviceIds = null
    form.value.schoolType = 0
    form.value.schoolScope = 0
  }

  rangeDialogVisible.value = false

  // 关闭弹窗后立即清空树的选中状态，避免残留
  nextTick(() => {
    if (rangeTreeRef.value) {
      try {
        rangeTreeRef.value.setCheckedKeys([])
      } catch (e) {
        console.warn('清空树选中状态失败:', e)
      }
    }
  })
}

// 快捷操作：全选
const selectAll = () => {
  if (!rangeTreeRef.value) return
  rangeTreeRef.value.setCheckedKeys(['all'])
}

// 快捷操作：清空
const clearAll = () => {
  if (!rangeTreeRef.value) return
  rangeTreeRef.value.setCheckedKeys([])
}

// 快捷操作：只选普教
const selectBaseOnly = () => {
  if (!rangeTreeRef.value) return
  clearAll()
  nextTick(() => {
    const keys = ['base', ...Object.keys(baseSchoolMap.value).map(id => 'base_' + id)]
    rangeTreeRef.value.setCheckedKeys(keys)
  })
}

// 快捷操作：只选职教
const selectVocalOnly = () => {
  if (!rangeTreeRef.value) return
  clearAll()
  nextTick(() => {
    const keys = ['vocal', ...Object.keys(vocalSchoolMap.value).map(id => 'vocal_' + id)]
    rangeTreeRef.value.setCheckedKeys(keys)
  })
}

// 展开全部节点
const expandAll = () => {
  if (!rangeTreeRef.value) return
  nextTick(() => {
    try {
      // 方法1: 尝试使用 setExpandedKeys
      if (typeof rangeTreeRef.value.setExpandedKeys === 'function') {
        const allKeys = []
        const collectKeys = (nodes) => {
          if (!nodes || !Array.isArray(nodes)) return
          nodes.forEach(node => {
            allKeys.push(node.value)
            if (node.children) collectKeys(node.children)
          })
        }
        collectKeys(schoolDeviceTreeData.value)
        rangeTreeRef.value.setExpandedKeys(allKeys)
        return
      }

      // 方法2: 遍历 store 中的节点
      const store = rangeTreeRef.value.store
      if (store && store.nodesMap) {
        Object.values(store.nodesMap).forEach(node => {
          node.expanded = true
        })
      } else if (store && store._getAllNodes) {
        store._getAllNodes().forEach(node => {
          node.expanded = true
        })
      }
    } catch (e) {
      console.warn('展开全部失败:', e)
    }
  })
}

// 收起全部节点
const collapseAll = () => {
  if (!rangeTreeRef.value) return
  nextTick(() => {
    try {
      // 方法1: 尝试使用 setExpandedKeys
      if (typeof rangeTreeRef.value.setExpandedKeys === 'function') {
        rangeTreeRef.value.setExpandedKeys([])
        return
      }

      // 方法2: 遍历 store 中的节点
      const store = rangeTreeRef.value.store
      if (store && store.nodesMap) {
        Object.values(store.nodesMap).forEach(node => {
          node.expanded = false
        })
      } else if (store && store._getAllNodes) {
        store._getAllNodes().forEach(node => {
          node.expanded = false
        })
      }
    } catch (e) {
      console.warn('收起全部失败:', e)
    }
  })
}

// 搜索学校和设备
const handleSearch = (keyword) => {
  console.log('=== handleSearch 被调用 ===')
  console.log('搜索关键词:', keyword)
  console.log('原始数据:', originalTreeData.value)
  console.log('rangeTreeRef.value:', rangeTreeRef.value)

  if (!keyword || keyword.trim() === '') {
    // 搜索为空，恢复原始数据
    restoreOriginalTree()
    return
  }

  // 检查原始数据是否存在
  if (!originalTreeData.value || originalTreeData.value.length === 0) {
    console.log('原始数据为空')
    return
  }

  // 搜索逻辑：过滤树节点
  const filterTree = (nodes, parentMatched = false) => {
    if (!nodes || !Array.isArray(nodes)) return []

    const result = []
    for (const node of nodes) {
      // 检查当前节点是否匹配
      const isMatch = node.label && node.label.toLowerCase().includes(keyword.toLowerCase().trim())

      // 如果当前节点匹配，保留所有子节点（不再过滤子节点）
      if (isMatch) {
        const newNode = { ...node, children: node.children || [] }
        result.push(newNode)
      } else if (parentMatched) {
        // 如果父节点匹配，当前节点及其子节点都保留
        const newNode = { ...node, children: node.children || [] }
        result.push(newNode)
      } else {
        // 递归检查子节点
        const children = node.children ? filterTree(node.children, false) : []
        // 如果有匹配的子节点，保留该节点
        if (children.length > 0) {
          const newNode = { ...node, children }
          result.push(newNode)
        }
      }
    }
    return result
  }

  const filteredData = filterTree(originalTreeData.value)
  console.log('过滤后的数据:', filteredData)
  console.log('过滤后数据长度:', filteredData.length)

  // 强制重新渲染树组件，确保每次搜索都重新渲染
  treeComponentKey.value++
  console.log('更新 treeComponentKey:', treeComponentKey.value)

  // 更新树数据
  schoolDeviceTreeData.value = filteredData

  // 自动展开所有匹配的节点（以便看到搜索结果）
  nextTick(() => {
    if (rangeTreeRef.value && rangeTreeRef.value.store && rangeTreeRef.value.store.nodes) {
      try {
        rangeTreeRef.value.store.nodes.forEach(node => {
          if (node.visible) {
            node.expanded = true
          }
        })
      } catch (e) {
        console.warn('展开节点失败:', e)
      }
    }
  })
}

// 清空搜索
const handleSearchClear = () => {
  console.log('=== 清空搜索（点击清空按钮）===')
  searchKeyword.value = ''
  restoreOriginalTree()
}

// 处理搜索值变化（@change 事件，作为 @input 的备份）
const handleSearchChange = (value) => {
  console.log('=== @change 事件 ===', value)
  // @change 事件通常在失去焦点或按回车时触发
  // 这里不重复调用 handleSearch，因为 watch 已经处理了
}

// 恢复原始树数据
const restoreOriginalTree = () => {
  console.log('=== 恢复原始数据 ===')
  console.log('originalTreeData.value:', originalTreeData.value)
  console.log('originalTreeData.value 长度:', originalTreeData.value?.length)

  // 如果原始数据为空，尝试重新加载
  if (!originalTreeData.value || originalTreeData.value.length === 0) {
    console.log('原始数据为空，尝试重新加载')
    loadSchoolDeviceTree()
    return
  }

  // 强制重新渲染树组件
  treeComponentKey.value++
  console.log('更新 treeComponentKey:', treeComponentKey.value)

  // 直接恢复数据（使用深拷贝避免响应式问题）
  const restoredData = JSON.parse(JSON.stringify(originalTreeData.value))
  schoolDeviceTreeData.value = restoredData
  console.log('已恢复 schoolDeviceTreeData，长度:', schoolDeviceTreeData.value.length)
  console.log('恢复的数据内容:', schoolDeviceTreeData.value)

  // 验证数据结构
  if (schoolDeviceTreeData.value[0]) {
    console.log('第一个节点:', schoolDeviceTreeData.value[0])
    console.log('第一个节点的 children:', schoolDeviceTreeData.value[0].children)
  }

  // 等待树组件完全渲染后设置展开状态
  nextTick(() => {
    console.log('第一次 nextTick')
    console.log('isTreeEmpty:', isTreeEmpty.value)
    nextTick(() => {
      console.log('第二次 nextTick，设置展开状态')
      console.log('rangeTreeRef.value:', rangeTreeRef.value)
      if (rangeTreeRef.value && rangeTreeRef.value.store) {
        const store = rangeTreeRef.value.store
        console.log('store 存在，nodesMap:', store.nodesMap)
        if (store.nodesMap) {
          Object.values(store.nodesMap).forEach(node => {
            if (['all', 'base', 'vocal'].includes(node.key)) {
              node.expanded = true
              console.log('展开节点:', node.key)
            }
          })
        }
      } else {
        console.log('rangeTreeRef 或 store 不存在')
      }
    })
  })
}

// 新增
const handleAdd = () => {
  resetForm()
  open.value = true
  title.value = '新增APP升级'
}

// 修改
const handleUpdate = (row) => {
  resetForm()
  getAppUpgrade(row.id).then(response => {
    const data = response.data
    form.value = { ...data }
    open.value = true
    title.value = '修改APP升级'
  })
}

// 提交
const submitForm = () => {
  proxy.$refs['upgradeRef'].validate(valid => {
    if (!valid) return

    submitLoading.value = true

    // 数据已经在 confirmRangeSelection 时保存到 form.value 中
    const submitData = { ...form.value }

    const request = submitData.id != null ? updateAppUpgrade(submitData) : addAppUpgrade(submitData)
    request.then(() => {
      ElMessage.success(submitData.id != null ? '修改成功' : '新增成功')
      open.value = false
      getList()
    }).finally(() => {
      submitLoading.value = false
    })
  })
}

// 删除
const handleDelete = (row) => {
  const deleteIds = row.id || ids.value
  const hint = row.id ? `确认删除「${row.appName} v${row.appVersion}」？` : '确认删除选中的数据？'
  ElMessageBox.confirm(hint, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delAppUpgrade(deleteIds).then(() => {
      ElMessage.success('删除成功')
      getList()
    })
  }).catch(() => {})
}

// 发布
const handlePublish = (row) => {
  const platformLabel = getPlatformLabel(row.platform)
  ElMessageBox.confirm(
    `确认发布「${row.appName} v${row.appVersion} (${platformLabel})」？\n发布后同平台旧版本将自动下架。`,
    '发布确认',
    {
      confirmButtonText: '确定发布',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    publishAppUpgrade(row.id).then(() => {
      ElMessage.success('发布成功')
      getList()
    })
  }).catch(() => {})
}

// 下架
const handleOffline = (row) => {
  ElMessageBox.confirm(
    `确认下架「${row.appName} v${row.appVersion}」？\n下架后APP客户端将不再检测到此升级。`,
    '下架确认',
    {
      confirmButtonText: '确定下架',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    offlineAppUpgrade(row.id).then(() => {
      ElMessage.success('下架成功')
      getList()
    })
  }).catch(() => {})
}

// 取消
const cancel = () => {
  open.value = false
  resetForm()
}

// 初始化
loadSchoolDeviceTree()
onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

/* 范围选择器触发器 */
.range-selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
  background: #fff;
}

.range-selector-trigger:hover {
  border-color: var(--el-color-primary);
}

.range-preview {
  flex: 1;
}

.preview-text {
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.preview-placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.trigger-icon {
  color: var(--el-text-color-placeholder);
  transition: transform 0.2s;
}

/* 弹窗内容 */
.range-dialog-content {
  display: flex;
  gap: 16px;
  height: 400px;
}

/* 左侧边栏 */
.range-sidebar {
  width: 120px;
  flex-shrink: 0;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 7px;
}

.sidebar-btn {
  width: 100%;
  margin-bottom: 10px;
  margin-left: 0px;
  justify-content: center
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
}

.stat-label {
  color: var(--el-text-color-secondary);
}

/* 右侧树形选择器 */
.range-tree-wrapper {
  flex: 1;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 树区域工具栏 */
.tree-toolbar {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-blank);
  display: flex;
  gap: 8px;
  align-items: center;
}

.tree-search-input {
  flex: 1;
}

.tree-expand-btns {
  flex-shrink: 0;
}

/* 树容器 */
.range-tree-wrapper :deep(.el-tree) {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

/* 树空状态 */
.range-tree-wrapper :deep(.el-empty) {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 弹窗底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 表格相关样式 */
.cursor-pointer {
  cursor: pointer;
}

.school-group-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.school-popover-list {
  max-height: 150px;
  overflow-y: auto;
}

.school-popover-list.has-divider {
  padding-bottom: 6px;
  margin-bottom: 6px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}

.school-popover-item {
  padding: 3px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
