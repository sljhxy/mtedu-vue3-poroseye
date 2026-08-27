<template>
  <div class="exp-gen">
    <!-- 背景装饰:蓝色光球 -->
    <div class="orb orb-1" />
    <div class="orb orb-2" />

    <div class="exp-gen__inner">
      <!-- 顶部 -->
      <header class="gen-header">
        <el-button @click="goBack" :icon="ArrowLeft" circle plain />
        <div class="gen-header__title">
          <h1>{{ experimentName }}</h1>
          <span class="gen-header__sub">AI 讲解课堂</span>
        </div>
      </header>

      <!-- 进度点(替代失效的 el-steps,4 阶段) -->
      <div class="stage-dots">
        <div v-for="(s, i) in stages" :key="i" class="stage-dot" :class="{ active: currentStage === i, done: currentStage > i }">
          <span class="stage-dot__dot" />
          <span class="stage-dot__label">{{ s }}</span>
        </div>
      </div>

      <!-- 模式:预览 -->
      <div v-if="mode === 'preview'" class="panel panel--preview">
        <div class="preview-bar">
          <div class="preview-bar__info">
            <el-icon class="preview-bar__ok"><CircleCheckFilled /></el-icon>
            <span>讲解课程已生成 · 关联到本实验</span>
          </div>
          <!-- 重新生成降级:收进 ⋯ 菜单(危险操作不抢主视觉) -->
          <el-dropdown trigger="click" @command="(c) => c === 'regen' && startRegenerate()">
            <el-button circle plain><el-icon><MoreFilled /></el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="regen">
                  <el-icon><Refresh /></el-icon>&nbsp;重新生成(覆盖)
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <iframe :src="playerUrl" class="preview-iframe" />
      </div>

      <!-- 模式:生成中 -->
      <div v-else-if="mode === 'generating'" class="panel panel--loading">
        <div class="pulse-ring"><span /></div>
        <h2>正在生成 AI 课堂内容</h2>
        <p class="muted">大纲 → 场景内容 → 动作 → 图片 → 语音,约 1~5 分钟,完成后自动进入预览</p>
        <div class="step-foot" style="justify-content: center; margin-top: 24px;">
          <el-button :loading="cancelling" plain @click="cancelGenerate">终止生成</el-button>
        </div>
      </div>

      <!-- 模式:流程 -->
      <div v-else class="panel panel--flow">
        <!-- Step 0: 需求 -->
        <div v-if="step === 0" class="step-requirement">
          <label class="field-label">这节课讲什么</label>
          <el-input
            v-model="requirement"
            type="textarea"
            :rows="6"
            placeholder="描述这节课要讲什么(已预填实验名,可编辑增补细节,如重点、深度、风格)"
            class="textarea-lg"
          />
          <div class="step-foot">
            <el-button type="primary" size="large" :loading="outlineLoading" @click="doGenerateOutline">
              <el-icon><MagicStick /></el-icon>&nbsp;生成大纲
            </el-button>
          </div>
        </div>

        <!-- Step 1: 大纲编辑(卡片式,流式时只读) -->
        <div v-if="step === 1" class="step-outline">
          <!-- 流式中提示 -->
          <div v-if="streaming" class="stream-banner">
            <span class="stream-banner__pulse" />
            <span>大纲生成中… 已生成 <b>{{ outlines.length }}</b> 个场景</span>
          </div>

          <div ref="outlineListRef" class="outline-list">
            <div v-for="(row, i) in outlines" :key="row._uid" class="outline-card" :style="{ '--i': i }">
              <div class="outline-card__left">
                <el-icon v-if="!streaming" class="drag-handle"><Rank /></el-icon>
                <span class="outline-card__order">{{ i + 1 }}</span>
                <span v-if="streaming && i === outlines.length - 1" class="outline-card__live" />
              </div>
              <div class="outline-card__main">
                <div class="outline-card__row1">
                  <el-input v-model="row.title" placeholder="场景标题" :disabled="streaming" class="inline-input inline-input--title" />
                  <el-select v-model="row.type" size="small" :disabled="streaming" style="width: 100px;" class="type-select">
                    <el-option label="幻灯片" value="slide" />
                    <el-option label="测验" value="quiz" />
                    <el-option label="实验检查点" value="experiment" />
                  </el-select>
                  <el-button v-if="!streaming" type="danger" link @click="removeOutline(i)">删除</el-button>
                </div>
                <el-input v-model="row.description" type="textarea" :rows="2" placeholder="场景简介" :disabled="streaming" class="inline-input" />
                <!-- quiz 配置 -->
                <div v-if="row.type === 'quiz'" class="quiz-cfg">
                  <span class="cfg-label">题目数量</span>
                  <el-input-number v-model="getQuizConfig(row).questionCount" :min="1" :max="10" size="small" :disabled="streaming" controls-position="right" />
                  <span class="cfg-label">难度</span>
                  <el-select v-model="getQuizConfig(row).difficulty" size="small" :disabled="streaming" style="width: 100px">
                    <el-option label="简单" value="easy" />
                    <el-option label="中等" value="medium" />
                    <el-option label="困难" value="hard" />
                  </el-select>
                  <span class="cfg-label">题型</span>
                  <el-select v-model="getQuizConfig(row).questionTypes" multiple size="small" :disabled="streaming" style="width: 220px">
                    <el-option label="单选" value="single" />
                    <el-option label="多选" value="multiple" />
                    <el-option label="简答" value="short_answer" />
                  </el-select>
                </div>
                <!-- experiment 检查点:选实验步骤(混合模式:LLM 产的已选,老师可改/新增;filterable 可搜) -->
                <div v-if="row.type === 'experiment'" class="quiz-cfg">
                  <span class="cfg-label">🔬 实验步骤</span>
                  <el-select
                    :model-value="row.experimentOutline?.stepId"
                    size="small"
                    :disabled="streaming"
                    placeholder="选择要操作的实验步骤"
                    style="width: 300px"
                    filterable
                    @change="(val) => onExperimentStepChange(row, val)"
                  >
                    <el-option
                      v-for="opt in stepTreeOptions"
                      :key="opt.id"
                      :label="opt.shortLabel"
                      :value="opt.id"
                    >
                      <!-- 下拉项:按 depth CSS 缩进 + 根/子配色(闭合时只显 shortLabel,干净) -->
                      <span :style="{ paddingLeft: opt.depth * 18 + 'px', color: opt.depth === 0 ? '#0f172a' : '#64748b' }">
                        {{ opt.shortLabel }}
                      </span>
                    </el-option>
                  </el-select>
                  <span v-if="!experimentSteps.length" style="font-size: 12px; color: #ef4444">未取到实验步骤</span>
                </div>
                <!-- keyPoints 芯片 -->
                <div class="keypoints">
                  <span v-for="(kp, j) in (row.keyPoints || [])" :key="j" class="kp-chip">{{ kp }}<el-icon v-if="!streaming" @click="removeKeyPoint(i, j)"><Close /></el-icon></span>
                  <input v-model="kpInputs[i]" class="kp-input" :disabled="streaming" placeholder="+ 要点(回车或逗号)" @keyup.enter="addKeyPoint(i)" @keydown="onKpKeydown(i, $event)" />
                </div>
              </div>
            </div>
          </div>

          <div class="step-foot">
            <el-button @click="step = 0" :disabled="streaming">上一步</el-button>
            <el-button @click="addOutline" :disabled="streaming"><el-icon><Plus /></el-icon>&nbsp;添加一页</el-button>
            <el-button type="primary" size="large" :disabled="streaming || !outlines.length" @click="confirmGenerate">
              {{ streaming ? '生成中…' : '开始生成' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, MagicStick, Rank, Close, Plus, Refresh, MoreFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import { generateScenes, getClassroomByExperiment, streamOutline, cancelClassroom } from '@/api/glxt/experimentClassroom'
import { getExperimentDataVO } from '@/api/glxt/experimentInfo'

const route = useRoute()
const router = useRouter()
const experimentId = route.query.id
const experimentName = ref(route.query.name || '实验')

const PLAYER_BASE = import.meta.env.VITE_PLAYER_URL

const mode = ref('flow')
const step = ref(0)

const requirement = ref('')
const languageDirective = ref('')
const outlines = ref([])
const experimentSteps = ref([])  // 实验步骤(给 experiment 检查点的步骤选择器;混合模式:LLM 产 + 老师改/加)
const outlineLoading = ref(false)
const streaming = ref(false)
const cancelling = ref(false)

const ossZipUrl = ref('')
const playerUrl = ref('')

let pollTimer = null

const kpInputs = ref([])
const outlineListRef = ref(null)
let sortableInst = null

/** 进度阶段(替代 el-steps):0需求 1大纲 2生成 3完成 */
const stages = ['填写需求', '编辑大纲', '生成内容', '完成']
const currentStage = computed(() => {
  if (mode.value === 'preview') return 3
  if (mode.value === 'generating') return 2
  return step.value
})

/** 实验步骤按树形排序(DFS)+ 层级深度,给步骤选择器美化层级用。
 *  mtedu 的 experimentSteps 是扁平 list + parentId 表树(最多 3 级);这里 DFS 从根展开,
 *  返回 [{id, shortLabel, depth}]。shortLabel = stepNum · stepName(闭合时显示);
 *  depth 给 el-option 插槽做 CSS 缩进 + 配色(下拉里看清父子,闭合时干净)。 */
const stepTreeOptions = computed(() => {
  const steps = experimentSteps.value
  if (!steps.length) return []
  const ids = new Set(steps.map((s) => s.id))
  const childrenOf = (pid) => steps.filter((s) => s.parentId === pid)
  const roots = steps.filter((s) => !s.parentId || !ids.has(s.parentId)) // 根:parentId 空 或 孤儿
  const visited = new Set()
  const result = []
  const walk = (list, depth) => {
    list.forEach((s) => {
      if (visited.has(s.id)) return
      visited.add(s.id)
      const num = s.stepNum ? s.stepNum + ' · ' : ''
      result.push({ id: s.id, shortLabel: num + s.stepName, depth })
      walk(childrenOf(s.id), depth + 1)
    })
  }
  walk(roots, 0)
  steps.forEach((s) => {
    if (!visited.has(s.id)) result.push({ id: s.id, shortLabel: s.stepName, depth: 0 }) // 兜底
  })
  return result
})

const isSupported = (o) => o && (o.type === 'slide' || o.type === 'quiz' || o.type === 'experiment')

const getQuizConfig = (row) => {
  if (!row.quizConfig) {
    row.quizConfig = { questionCount: 3, difficulty: 'medium', questionTypes: ['single'] }
  }
  return row.quizConfig
}

/** experiment 检查点:老师选实验步骤 → 填 experimentOutline(混合模式:可改 LLM 产的、可新增) */
const onExperimentStepChange = (row, stepId) => {
  const step = experimentSteps.value.find((s) => s.id === stepId)
  row.experimentOutline = step
    ? { experimentId: Number(experimentId), experimentName: experimentName.value, stepId: step.id, stepName: step.stepName }
    : null
}

const ensureUid = (arr) => arr.forEach((o) => { if (!o._uid) o._uid = Math.random().toString(36).slice(2, 10) })

onMounted(async () => {
  requirement.value = `请讲解实验:《${experimentName.value}》`
  // 取实验步骤(给 experiment 检查点的步骤选择器;混合模式:LLM 产 + 老师改/加)
  try {
    const resExp = await getExperimentDataVO(experimentId)
    const expData = resExp.data
    experimentSteps.value = expData?.experimentSteps || []
    if (expData?.experimentInfo?.experimentName) experimentName.value = expData.experimentInfo.experimentName
  } catch (e) {
    console.warn('取实验步骤失败(experiment 检查点选择器将无步骤可选)', e)
  }
  try {
    const res = await getClassroomByExperiment(experimentId)
    const data = res.data
    if (!data) mode.value = 'flow'
    else if (data.status === 1) enterPreview(data.ossZipUrl)
    else if (data.status === 0) { mode.value = 'generating'; startPolling() }
    else if (data.status === 2) {
      mode.value = 'flow'
      restoreFromRecord(data)
      step.value = data.outlineJson ? 1 : 0
      ElMessage.warning('上次生成失败,请调整后重试')
    } else if (data.status === 3) {
      // 已取消(用户主动终止),不是失败:回流程页可改了重提,轻提示
      mode.value = 'flow'
      restoreFromRecord(data)
      step.value = data.outlineJson ? 1 : 0
      ElMessage.info('上次已终止,可修改后重新生成')
    }
  } catch (e) {
    ElMessage.error('查询课堂状态失败')
  }
})

onUnmounted(() => { stopPolling(); if (sortableInst) sortableInst.destroy() })

watch(outlines, (arr) => {
  ensureUid(arr)
  while (kpInputs.value.length < arr.length) kpInputs.value.push('')
  kpInputs.value = kpInputs.value.slice(0, arr.length)
}, { deep: false })

watch([() => step.value, streaming], ([s, st]) => {
  if (s === 1 && !st) {
    nextTick(() => {
      if (outlineListRef.value && !sortableInst) {
        sortableInst = Sortable.create(outlineListRef.value, {
          handle: '.drag-handle',
          animation: 150,
          ghostClass: 'drag-ghost',
          onEnd: ({ oldIndex, newIndex }) => {
            if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
            const arr = [...outlines.value]
            const [moved] = arr.splice(oldIndex, 1)
            arr.splice(newIndex, 0, moved)
            outlines.value = arr
          }
        })
      }
    })
  } else if (sortableInst && (s !== 1 || st)) {
    sortableInst.destroy()
    sortableInst = null
  }
})

const doGenerateOutline = async () => {
  if (!requirement.value.trim()) { ElMessage.warning('请填写需求'); return }
  outlines.value = []
  streaming.value = true
  outlineLoading.value = false
  step.value = 1
  await streamOutline({
    experimentId,
    requirement: requirement.value,
    onLanguageDirective: (d) => { languageDirective.value = d },
    onOutline: (o) => { if (isSupported(o)) outlines.value.push(o) },
    onDone: (finalOutlines, lang) => {
      streaming.value = false
      let arr = Array.isArray(finalOutlines) && finalOutlines.length ? finalOutlines : outlines.value
      const before = arr.length
      arr = arr.filter(isSupported)
      outlines.value = arr
      if (lang) languageDirective.value = lang
      if (before !== arr.length) ElMessage.info(`已过滤 ${before - arr.length} 个暂不支持的互动/PBL 场景`)
      if (!outlines.value.length) { ElMessage.warning('大纲为空,请调整需求后重试'); step.value = 0 }
    },
    onError: (e) => {
      streaming.value = false
      ElMessage.error('生成大纲失败: ' + (e.message || e))
      if (!outlines.value.length) step.value = 0
    }
  })
}

const addKeyPoint = (i) => {
  const val = (kpInputs.value[i] || '').trim().replace(/,$/, '').trim()
  if (!val) return
  if (!Array.isArray(outlines.value[i].keyPoints)) outlines.value[i].keyPoints = []
  outlines.value[i].keyPoints.push(val)
  kpInputs.value[i] = ''
}
const removeKeyPoint = (i, j) => outlines.value[i].keyPoints.splice(j, 1)
const onKpKeydown = (i, e) => {
  if (e.key === ',') { e.preventDefault(); addKeyPoint(i) }
  else if (e.key === 'Backspace' && !(kpInputs.value[i] || '')) {
    const kps = outlines.value[i].keyPoints
    if (Array.isArray(kps) && kps.length) kps.pop()
  }
}

const removeOutline = (i) => outlines.value.splice(i, 1)
const addOutline = () => outlines.value.push({ _uid: Math.random().toString(36).slice(2, 10), type: 'slide', title: '新页面', description: '', keyPoints: [] })

const confirmGenerate = () => {
  ElMessageBox.confirm('将根据大纲生成完整课堂(约 1~5 分钟),如有旧内容会被覆盖。确认开始?', '开始生成', { type: 'warning' })
    .then(() => doGenerate()).catch(() => {})
}
const doGenerate = async () => {
  const cleanOutlines = outlines.value.map(({ _uid, ...rest }) => rest)
  try {
    await generateScenes({ experimentId, requirement: requirement.value, languageDirective: languageDirective.value, outlines: cleanOutlines })
    mode.value = 'generating'
    startPolling()
  } catch (e) { ElMessage.error('提交生成失败') }
}

const startRegenerate = () => {
  ElMessageBox.confirm('重新生成会覆盖当前课堂内容,确认?', '重新生成', { type: 'warning' })
    .then(async () => {
      try { const res = await getClassroomByExperiment(experimentId); if (res.data) restoreFromRecord(res.data) } catch (e) {}
      mode.value = 'flow'
      step.value = 1
    }).catch(() => {})
}
const restoreFromRecord = (data) => {
  if (data.outlineJson) { try { outlines.value = JSON.parse(data.outlineJson) } catch (e) {} }
  if (data.requirement) requirement.value = data.requirement
}

/** 终止生成:调后端 cancel(中断旧线程)+ 回流程页改大纲重来(旧 maic job 后台继续,结果丢弃) */
const cancelGenerate = async () => {
  try {
    await ElMessageBox.confirm('确认终止本次生成?可回到大纲页修改后重新生成。', '终止生成', { type: 'warning' })
  } catch { return }
  cancelling.value = true
  try {
    await cancelClassroom(experimentId)
    stopPolling()
    try {
      const res = await getClassroomByExperiment(experimentId)
      if (res.data) restoreFromRecord(res.data)
    } catch {}
    mode.value = 'flow'
    step.value = 1
    ElMessage.success('已终止,可修改后重新生成')
  } catch (e) {
    ElMessage.error('终止失败')
  } finally {
    cancelling.value = false
  }
}

const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(async () => {
    try {
      const res = await getClassroomByExperiment(experimentId)
      const data = res.data
      if (!data) return
      if (data.status === 1) { stopPolling(); enterPreview(data.ossZipUrl); ElMessage.success('生成完成') }
      else if (data.status === 2) {
        stopPolling(); mode.value = 'flow'; restoreFromRecord(data)
        step.value = data.outlineJson ? 1 : 0; ElMessage.error('生成失败,请调整后重试')
      } else if (data.status === 3) {
        stopPolling() // 已取消(终止),轮询停(前端 cancelGenerate 已处理回流程)
      }
    } catch (e) {}
  }, 5000)
}
const stopPolling = () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null } }

const enterPreview = (url) => {
  ossZipUrl.value = url
  // ⚠ 临时:&mockAndroid=1 让预览里 experiment 场景走 mock(自动完成),方便测试交互。
  //   安卓桥做好后删掉这个参数(真设备有 window.Android 走 real)。见记忆 experiment-checkpoint-feature。
  playerUrl.value = `${PLAYER_BASE}/play?src=${encodeURIComponent(url)}&mockAndroid=1`
  mode.value = 'preview'
}

const goBack = () => router.back()
</script>

<style scoped>
/* ===== 蓝色主题(非紫,区别于播放器) ===== */
.exp-gen {
  --brand: #3b82f6;
  --brand-soft: #3b82f614;
  --quiz: #f59e0b;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --surface: #ffffff;
  min-height: calc(100vh - 50px);
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  position: relative;
  overflow: hidden;
}
.exp-gen__inner { position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; padding: 24px 24px 64px; }

/* 背景光球(蓝,非紫) */
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5; pointer-events: none; }
.orb-1 { width: 400px; height: 400px; background: #3b82f6; top: -120px; left: -80px; animation: float 8s ease-in-out infinite; }
.orb-2 { width: 360px; height: 360px; background: #60a5fa; bottom: -100px; right: -60px; animation: float 10s ease-in-out infinite reverse; }
@keyframes float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px, 20px); } }

/* 顶部 */
.gen-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
.gen-header__title h1 { font-size: 20px; font-weight: 700; color: var(--ink); margin: 0; letter-spacing: -0.01em; }
.gen-header__sub { font-size: 12px; color: var(--muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.15em; }

/* 进度点(替代 el-steps) */
.stage-dots { display: flex; align-items: center; gap: 0; margin-bottom: 28px; }
.stage-dot { display: flex; align-items: center; gap: 8px; flex: 1; position: relative; }
.stage-dot:not(:last-child)::after { content: ''; flex: 1; height: 2px; background: var(--line); margin: 0 12px; border-radius: 2px; }
.stage-dot.done:not(:last-child)::after { background: var(--brand); }
.stage-dot__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--line); transition: all 0.3s; }
.stage-dot.done .stage-dot__dot { background: var(--brand); }
.stage-dot.active .stage-dot__dot { width: 28px; border-radius: 6px; background: var(--brand); box-shadow: 0 0 0 4px var(--brand-soft); animation: pulse-dot 1.4s ease-in-out infinite; }
.stage-dot__label { font-size: 13px; color: var(--muted); font-weight: 500; }
.stage-dot.active .stage-dot__label, .stage-dot.done .stage-dot__label { color: var(--ink); }
@keyframes pulse-dot { 0%,100% { box-shadow: 0 0 0 4px var(--brand-soft); } 50% { box-shadow: 0 0 0 8px #3b82f608; } }

/* 面板(毛玻璃卡片) */
.panel { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.6); border-radius: 20px; padding: 32px; box-shadow: 0 20px 60px -20px rgba(15,23,42,0.12); }

/* 预览 */
.panel--preview { padding: 0; overflow: hidden; }
.preview-bar { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--line); }
.preview-bar__info { display: flex; align-items: center; gap: 8px; color: var(--ink); font-size: 14px; font-weight: 500; }
.preview-bar__ok { color: #22c55e; font-size: 18px; }
.preview-iframe { width: 100%; height: 72vh; border: 0; display: block; }

/* 生成中 */
.panel--loading { text-align: center; padding: 72px 32px; }
.pulse-ring { width: 64px; height: 64px; margin: 0 auto 20px; position: relative; }
.pulse-ring span { position: absolute; inset: 0; border-radius: 50%; border: 3px solid var(--brand); animation: ring 1.4s ease-out infinite; }
@keyframes ring { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.2); opacity: 0; } }
.panel--loading h2 { font-size: 18px; color: var(--ink); margin: 0 0 8px; }
.muted { color: var(--muted); font-size: 13px; }

/* 需求 */
.field-label { display: block; font-size: 13px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
:deep(.textarea-lg .el-textarea__inner) { font-size: 15px; line-height: 1.7; border-radius: 12px; }

.step-foot { display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 20px; }

/* 流式提示 */
.stream-banner { display: inline-flex; align-items: center; gap: 10px; background: var(--brand-soft); color: var(--brand); padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 500; margin-bottom: 18px; }
.stream-banner__pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); animation: blink 1.2s ease-in-out infinite; }
@keyframes blink { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }

/* 大纲卡片列表 */
.outline-list { display: flex; flex-direction: column; gap: 12px; }
.outline-card {
  display: flex; gap: 14px;
  background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 16px;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
  animation: card-in 0.4s ease both; animation-delay: calc(var(--i) * 0.04s);
}
.outline-card:hover { box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); border-color: #cbd5e1; }
.drag-ghost { opacity: 0.4; }
@keyframes card-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.outline-card__left { display: flex; flex-direction: column; align-items: center; gap: 6px; padding-top: 4px; }
.drag-handle { cursor: grab; color: #94a3b8; font-size: 18px; }
.drag-handle:active { cursor: grabbing; }
.outline-card__order { font-size: 13px; font-weight: 600; color: var(--muted); font-variant-numeric: tabular-nums; }
.outline-card__live { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); animation: blink 1.2s ease-in-out infinite; }

.outline-card__main { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.outline-card__row1 { display: flex; gap: 8px; align-items: center; }

/* Notion 风格无边框输入 */
:deep(.inline-input .el-input__wrapper),
:deep(.inline-input .el-textarea__inner) { box-shadow: none !important; background: transparent; padding-left: 0; }
:deep(.inline-input .el-textarea__inner) { font-size: 13px; }
:deep(.inline-input--title .el-input__wrapper) { font-weight: 600; font-size: 15px; }
:deep(.inline-input .el-input__wrapper:hover),
:deep(.inline-input .el-textarea__inner:hover) { background: var(--brand-soft); border-radius: 6px; }
:deep(.inline-input.is-focus .el-input__wrapper) { box-shadow: inset 0 -2px 0 var(--brand) !important; background: var(--brand-soft); border-radius: 6px; }
:deep(.inline-input.is-disabled .el-input__wrapper),
:deep(.inline-input.is-disabled .el-textarea__inner) { background: transparent; }

/* 类型 select 配色 */
:deep(.type-select .el-input__wrapper) { box-shadow: 0 0 0 1px var(--line); }

/* quiz 配置 */
.quiz-cfg { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 0; border-top: 1px dashed var(--line); }
.cfg-label { font-size: 12px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }

/* keyPoints 芯片 */
.keypoints { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding-top: 4px; }
.kp-chip { display: inline-flex; align-items: center; gap: 4px; background: var(--brand-soft); color: var(--brand); padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; }
.kp-chip .el-icon { cursor: pointer; font-size: 12px; opacity: 0.6; }
.kp-chip .el-icon:hover { opacity: 1; }
.kp-input { border: 1px dashed #cbd5e1; border-radius: 6px; padding: 3px 10px; font-size: 12px; outline: none; width: 200px; background: transparent; color: var(--ink); }
.kp-input:focus { border-color: var(--brand); background: var(--brand-soft); }
.kp-input::placeholder { color: #94a3b8; }
</style>
