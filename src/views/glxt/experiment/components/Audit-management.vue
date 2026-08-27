<template>
  <div class="audit-management">
    <div v-if="!effectiveId" class="empty-state">
      <el-empty description="请先完成基础信息并保存">
        <template #image>
          <el-icon :size="64" color="#94A3B8"><Document /></el-icon>
        </template>
      </el-empty>
    </div>

    <div v-else-if="loading" class="loading-state">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else class="audit-content">
      <!-- 顶部预览横幅 -->
      <div class="info-banner">
        <div class="banner-thumb">
          <el-image
            v-if="info?.thumbnail"
            :src="info.thumbnail"
            fit="cover"
            class="thumb-img"
          />
          <div v-else class="thumb-placeholder">
            <el-icon :size="32" color="#94A3B8"><Picture /></el-icon>
          </div>
        </div>
        <div class="banner-info">
          <h2 class="banner-title">{{ info?.experimentName || '未命名实验' }}</h2>
          <div class="banner-tags">
            <dict-tag :options="mt_school_type" :value="info?.schoolType" />
            <dict-tag :options="mt_academic_stage" :value="info?.academicStageType" />
            <dict-tag :options="mt_experiment_audit_status" :value="auditStatus" />
          </div>
          <div v-if="info?.blurb" class="banner-blurb">{{ info.blurb }}</div>
        </div>
      </div>

      <!-- 已审核结果显示 -->
      <div v-if="auditStatus === 2 || auditStatus === 3" class="audit-result-card" :class="auditStatus === 2 ? 'result-pass' : 'result-reject'">
        <div class="result-header">
          <el-icon :size="20">
            <CircleCheckFilled v-if="auditStatus === 2" />
            <CircleCloseFilled v-else />
          </el-icon>
          <span class="result-title">{{ auditStatus === 2 ? '审核通过' : '审核未通过' }}</span>
          <span class="result-meta" v-if="info?.auditTime">{{ info.auditTime }} {{ info.auditBy ? `审核人：${info.auditBy}` : '' }}</span>
        </div>
        <div v-if="info?.auditComment" class="result-comment">
          <span class="comment-label">审核意见：</span>{{ info.auditComment }}
        </div>
      </div>

      <!-- 审核中提示 -->
      <div v-if="auditStatus === 1" class="audit-result-card result-pending">
        <div class="result-header">
          <el-icon :size="20"><Clock /></el-icon>
          <span class="result-title">审核中</span>
          <span class="result-meta">已提交，等待管理员审核</span>
        </div>
      </div>

      <!-- 完整性检查面板 -->
      <div class="completeness-panel">
        <div class="panel-header">
          <span class="panel-title">完整性检查</span>
          <div class="panel-progress">
            <el-progress
              :percentage="Math.round(completedCount / modules.length * 100)"
              :stroke-width="8"
              :color="allRequiredComplete ? '#10B981' : '#2563EB'"
              style="width: 120px"
            />
            <span class="panel-summary">{{ completedCount }}/{{ modules.length }} 项已完成</span>
          </div>
        </div>

        <el-collapse v-model="activeCollapse" class="check-collapse">
          <el-collapse-item
            v-for="mod in modules"
            :key="mod.key"
            :name="mod.key"
          >
            <template #title>
              <div class="module-title-row">
                <el-icon
                  :size="16"
                  :color="mod.ok ? '#10B981' : (mod.required ? '#EF4444' : '#F59E0B')"
                >
                  <CircleCheckFilled v-if="mod.ok" />
                  <WarningFilled v-else-if="mod.required" />
                  <Warning v-else />
                </el-icon>
                <span class="module-name">{{ mod.name }}</span>
                <span class="module-summary" :class="{ 'incomplete': !mod.ok }">{{ mod.summary }}</span>
                <el-tag v-if="!mod.ok && mod.required" type="danger" size="small" effect="plain">必填</el-tag>
                <el-tag v-else-if="!mod.ok && !mod.required" type="warning" size="small" effect="plain">建议</el-tag>
                <el-button v-if="!mod.ok && auditStatus !== 1" type="primary" link size="small" @click.stop="goFill(mod.key)">去填写</el-button>
              </div>
            </template>
            <div class="module-detail">
              <!-- 基本信息 -->
              <template v-if="mod.key === 'info'">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">实验名称</span>
                    <span class="detail-value">{{ info?.experimentName || '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">学校类型</span>
                    <span class="detail-value"><dict-tag :options="mt_school_type" :value="info?.schoolType" /></span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">学段</span>
                    <span class="detail-value"><dict-tag :options="mt_academic_stage" :value="info?.academicStageType" /></span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">版本号</span>
                    <span class="detail-value">{{ info?.version || '—' }}</span>
                  </div>
                  <div class="detail-item" style="grid-column: 1 / -1">
                    <span class="detail-label">简介</span>
                    <span class="detail-value">{{ info?.blurb || '—' }}</span>
                  </div>
                </div>
              </template>
              <!-- 实验原理与目标 -->
              <template v-if="mod.key === 'principle'">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">实验原理</span>
                    <span class="detail-value">{{ stripHtml(experimentDataVO?.experimentPrinciple?.text) || '未填写' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">实验目标</span>
                    <span class="detail-value">{{ stripHtml(experimentDataVO?.experimentTarget?.text) || '未填写' }}</span>
                  </div>
                </div>
              </template>
              <!-- 实验器材 -->
              <template v-if="mod.key === 'equipment'">
                <div v-if="experimentDataVO?.mtExperimentWarehouse?.length" class="detail-list">
                  <div v-for="(eq, i) in experimentDataVO.mtExperimentWarehouse" :key="i" class="detail-list-item">
                    <el-image v-if="eq.equipmentThumbnailImg" :src="eq.equipmentThumbnailImg" fit="cover" class="eq-thumb" />
                    <span>{{ eq.equipmentName || `器材 ${i + 1}` }}</span>
                  </div>
                </div>
                <div v-else class="detail-empty">暂无器材</div>
              </template>
              <!-- 实验材料 -->
              <template v-if="mod.key === 'materials'">
                <div v-if="experimentDataVO?.experimentMaterials?.length" class="detail-list">
                  <div v-for="(mat, i) in experimentDataVO.experimentMaterials" :key="i" class="detail-list-item">
                    <span>{{ mat.sourceMaterial?.sourceMaterialName || `材料 ${i + 1}` }}</span>
                  </div>
                </div>
                <div v-else class="detail-empty">暂无材料</div>
              </template>
              <!-- 实验步骤 -->
              <template v-if="mod.key === 'steps'">
                <div v-if="stepTree.length" class="detail-steps-tree">
                  <template v-for="(step, i) in stepTree" :key="step.id || i">
                    <div class="step-node step-level-0">
                      <div class="step-node-header">
                        <span class="step-num step-num-primary">{{ i + 1 }}</span>
                        <span class="step-name">{{ step.stepName }}</span>
                        <span v-if="step.stepScore" class="step-score">{{ step.stepScore }}分</span>
                      </div>
                      <div v-if="step.children?.length" class="step-children">
                        <div v-for="(child, j) in step.children" :key="child.id || j" class="step-node step-level-1">
                          <div class="step-node-header">
                            <span class="step-dot"></span>
                            <span class="step-name">{{ child.stepName }}</span>
                            <span v-if="child.stepScore" class="step-score">{{ child.stepScore }}分</span>
                          </div>
                          <div v-if="child.children?.length" class="step-children">
                            <div v-for="(grand, k) in child.children" :key="grand.id || k" class="step-node step-level-2">
                              <div class="step-node-header">
                                <span class="step-dot step-dot-sm"></span>
                                <span class="step-name">{{ grand.stepName }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
                <div v-else class="detail-empty">暂无步骤</div>
              </template>
              <!-- 数据上传 -->
              <template v-if="mod.key === 'data'">
                <div v-if="experimentDataVO?.experimentDataFileUploads?.length" class="detail-list">
                  <div v-for="(file, i) in experimentDataVO.experimentDataFileUploads" :key="i" class="detail-list-item">
                    <el-icon><Document /></el-icon>
                    <span>{{ file.fileName || `文件 ${i + 1}` }}</span>
                  </div>
                </div>
                <div v-else class="detail-empty">
                  <span>尚未上传实验数据表，建议上传后再提交</span>
                </div>
              </template>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 操作按钮区 -->
      <div v-if="auditStatus === 0 || auditStatus === null || auditStatus === 3" class="action-bar">
        <div class="action-tip" v-if="!allRequiredComplete">
          <el-icon color="#EF4444"><WarningFilled /></el-icon>
          <span>请完成所有必填项后再提交审核</span>
        </div>
        <div class="action-buttons">
          <el-button @click="handleSubmit" type="primary" :disabled="!allRequiredComplete" :loading="submitting">
            提交审核
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CircleCheckFilled,
  CircleCloseFilled,
  WarningFilled,
  Warning,
  Document,
  Picture,
  Clock
} from '@element-plus/icons-vue'
import { getExperimentDataVO, submitExperiment } from '@/api/glxt/experimentInfo'

const { proxy } = getCurrentInstance()
const { mt_school_type, mt_academic_stage, mt_experiment_audit_status } = proxy.useDict(
  'mt_school_type', 'mt_academic_stage', 'mt_experiment_audit_status'
)

const emit = defineEmits(['addExperimentInfoId', 'goToStep'])

const props = defineProps({
  toEexperimentInfoId: { type: [Number, String], default: null },
  experimentName: { type: String, default: '' },
  experimentId: { type: [Number, String], default: null }
})

const loading = ref(false)
const submitting = ref(false)
const experimentDataVO = ref(null)
const info = ref(null)
const activeCollapse = ref([])

const effectiveId = computed(() => props.experimentId || props.toEexperimentInfoId)

const auditStatus = computed(() => {
  const s = info.value?.auditStatus
  return s != null ? Number(s) : null
})

const modules = computed(() => {
  const vo = experimentDataVO.value
  return [
    {
      name: '基本信息', key: 'info', required: true,
      ok: !!(vo?.experimentInfo?.experimentName),
      summary: vo?.experimentInfo?.experimentName || '未填写'
    },
    {
      name: '实验原理与目标', key: 'principle', required: true,
      ok: !!(vo?.experimentPrinciple || vo?.experimentTarget),
      summary: (vo?.experimentPrinciple || vo?.experimentTarget) ? '已填写' : '未填写'
    },
    {
      name: '实验器材', key: 'equipment', required: true,
      ok: (vo?.mtExperimentWarehouse?.length || 0) > 0,
      summary: `${vo?.mtExperimentWarehouse?.length || 0}件器材`
    },
    {
      name: '实验材料', key: 'materials', required: true,
      ok: (vo?.experimentMaterials?.length || 0) > 0,
      summary: `${vo?.experimentMaterials?.length || 0}种材料`
    },
    {
      name: '实验步骤', key: 'steps', required: true,
      ok: (vo?.experimentSteps?.length || 0) > 0,
      summary: `${vo?.experimentSteps?.length || 0}个步骤`
    },
    {
      name: '数据上传', key: 'data', required: false,
      ok: (vo?.experimentDataFileUploads?.length || 0) > 0,
      summary: `${vo?.experimentDataFileUploads?.length || 0}个文件`
    }
  ]
})

const completedCount = computed(() => modules.value.filter(m => m.ok).length)
const allRequiredComplete = computed(() => modules.value.filter(m => m.required).every(m => m.ok))

const stepMap = { info: 0, principle: 1, equipment: 2, materials: 2, steps: 3, data: 4 }

const goFill = (key) => {
  const step = stepMap[key]
  if (step !== undefined) emit('goToStep', step)
}

const stepTree = computed(() => {
  const steps = experimentDataVO.value?.experimentSteps
  if (!steps?.length) return []
  const map = {}
  const roots = []
  steps.forEach(s => { map[s.id] = { ...s, children: [] } })
  steps.forEach(s => {
    const node = map[s.id]
    if (!s.parentId || s.parentId === 0) {
      roots.push(node)
    } else if (map[s.parentId]) {
      map[s.parentId].children.push(node)
    }
  })
  return roots
})

const stripHtml = (html) => {
  if (!html) return ''
  const text = html.replace(/<[^>]+>/g, '').trim()
  return text.length > 80 ? text.substring(0, 80) + '...' : text
}

const loadData = async (id) => {
  if (!id) return
  loading.value = true
  try {
    const res = await getExperimentDataVO(id)
    if (res.code === 200 && res.data) {
      experimentDataVO.value = res.data
      info.value = res.data.experimentInfo
    }
  } catch (e) {
    console.error('加载实验数据失败', e)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!effectiveId.value) {
    ElMessage.warning('请先保存实验基本信息')
    return
  }
  try {
    await ElMessageBox.confirm(
      '确定提交审核？提交后等待管理员审核。',
      '提交审核',
      { confirmButtonText: '确定提交', cancelButtonText: '取消', type: 'info' }
    )
  } catch {
    return
  }

  submitting.value = true
  try {
    const res = await submitExperiment(effectiveId.value)
    if (res.code === 200) {
      ElMessage.success('已提交审核')
      await loadData(effectiveId.value)
    } else {
      ElMessage.error(res.msg || '提交失败')
    }
  } catch (e) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

watch(() => effectiveId.value, (newId) => {
  if (newId) loadData(newId)
}, { immediate: true })
</script>

<style scoped>
.audit-management {
  padding: 0 4px;
}

/* 空状态 / 加载 */
.empty-state,
.loading-state {
  padding: 60px 0;
  text-align: center;
}

/* 顶部横幅 */
.info-banner {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #FFFFFF;
  border-radius: 8px;
  margin-bottom: 16px;
}
.banner-thumb {
  width: 120px;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-img { width: 100%; height: 100%; }
.thumb-placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
.banner-info { flex: 1; min-width: 0; }
.banner-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
}
.banner-tags {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.banner-blurb {
  margin-top: 8px;
  font-size: 13px;
  color: #64748B;
  line-height: 1.5;
}

/* 审核结果卡片 */
.audit-result-card {
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.result-pass {
  background: #F0FDF4;
  border-left: 3px solid #10B981;
}
.result-pass .result-header { color: #059669; }
.result-reject {
  background: #FEF2F2;
  border-left: 3px solid #EF4444;
}
.result-reject .result-header { color: #DC2626; }
.result-pending {
  background: #EFF6FF;
  border-left: 3px solid #2563EB;
}
.result-pending .result-header { color: #2563EB; }
.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.result-title { font-size: 15px; }
.result-meta {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.8;
  margin-left: auto;
}
.result-comment {
  margin-top: 10px;
  font-size: 13px;
  color: #1E293B;
  line-height: 1.6;
}
.comment-label { font-weight: 500; color: #64748B; }

/* 完整性检查面板 */
.completeness-panel {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
  padding-left: 10px;
  border-left: 3px solid #2563EB;
}
.panel-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}
.panel-summary {
  font-size: 13px;
  color: #64748B;
  white-space: nowrap;
}

/* 折叠面板样式覆盖 */
.check-collapse {
  border: none;
}
.check-collapse :deep(.el-collapse-item__header) {
  height: 48px;
  line-height: 48px;
  border-bottom: 1px solid #F1F5F9;
  background: transparent;
}
.check-collapse :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}
.check-collapse :deep(.el-collapse-item__content) {
  padding: 12px 0;
}

/* 模块标题行 */
.module-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.module-name {
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
}
.module-summary {
  font-size: 13px;
  color: #64748B;
  margin-left: auto;
  margin-right: 8px;
}
.module-summary.incomplete { color: #94A3B8; }

/* 模块详情 */
.module-detail {
  padding: 0 8px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-label {
  font-size: 12px;
  color: #94A3B8;
}
.detail-value {
  font-size: 13px;
  color: #1E293B;
}
.detail-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.detail-list-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #F8FAFC;
  border-radius: 4px;
  font-size: 13px;
  color: #1E293B;
}
.eq-thumb {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}
.detail-empty {
  font-size: 13px;
  color: #94A3B8;
  padding: 8px 0;
}
.detail-steps-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.step-node {
  padding: 2px 0;
}
.step-node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
}
.step-level-0 > .step-node-header {
  background: #F8FAFC;
  font-weight: 500;
}
.step-level-1 > .step-node-header {
  padding-left: 16px;
}
.step-level-2 > .step-node-header {
  padding-left: 28px;
}
.step-num-primary {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #2563EB;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563EB;
  opacity: 0.4;
  flex-shrink: 0;
}
.step-dot-sm {
  width: 6px;
  height: 6px;
  opacity: 0.3;
}
.step-name {
  font-size: 13px;
  color: #1E293B;
}
.step-score {
  font-size: 11px;
  color: #94A3B8;
  margin-left: auto;
}
.step-children {
  display: flex;
  flex-direction: column;
  margin-left: 12px;
  border-left: 2px solid #E2E8F0;
  padding-left: 8px;
}

/* 操作栏 */
.action-bar {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.action-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #EF4444;
}
.action-buttons {
  display: flex;
  gap: 10px;
}
</style>
