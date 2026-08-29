<template>
  <div class="aclist">
    <!-- ==================== 加载中 ==================== -->
    <div v-if="loading" class="aclist__center">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span style="margin-left: 8px; color: #909399">加载中…</span>
    </div>

    <!-- ==================== 空态:居中"新增内容"按钮(或教师无学校提示) ==================== -->
    <div v-else-if="!records.length" class="aclist__center">
      <!-- 教师无学校:友好提示 -->
      <div v-if="isTeacher && !userSchoolId" class="aclist__empty">
        <el-icon class="aclist__empty-icon" style="color: #e6a23c"><Warning /></el-icon>
        <h2>您的账号未关联学校</h2>
        <p>请联系管理员配置所属学校后再使用AI课堂功能</p>
      </div>
      <!-- 正常空态 -->
      <div v-else class="aclist__empty">
        <el-icon class="aclist__empty-icon"><MagicStick /></el-icon>
        <h2>暂无AI课堂内容</h2>
        <p>通过 AI 生成讲解课堂(含语音、互动、测验),按学校/教材/语言管理多份内容</p>
        <el-button type="primary" size="large" @click="openWizard()" v-hasPermi="['glxt:experimentClassroom:generate']">
          <el-icon><Plus /></el-icon>&nbsp;新增内容
        </el-button>
      </div>
    </div>

    <!-- ==================== 列表 ==================== -->
    <div v-else>
      <!-- 顶部操作栏(教师无学校时隐藏新增按钮) -->
      <div class="aclist__bar">
        <el-button
          v-if="!(isTeacher && !userSchoolId)"
          type="primary" plain icon="Plus"
          @click="openWizard()"
          v-hasPermi="['glxt:experimentClassroom:generate']"
        >新增内容</el-button>
        <el-button plain circle icon="Refresh" @click="loadList" />
      </div>

      <!-- 表格(2026-08-28 优化:合并列减少拥挤,操作用图标+下拉) -->
      <el-table :data="records" v-loading="loading" :show-header="true" size="default">
        <!-- 内容信息:名称 + 页数合列 -->
        <el-table-column label="内容信息" align="left" min-width="200">
          <template #default="{ row }">
            <div class="aclist__info">
              <div class="aclist__info-name">{{ row.stageName || '生成中…' }}</div>
              <div class="aclist__info-meta">
                <span class="aclist__info-pages">{{ pageCount(row) }} 页</span>
                <span class="aclist__info-lang">{{ languageLabel(row.language) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 学校 -->
        <el-table-column label="学校" align="left" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">{{ row.schoolName || '-' }}</template>
        </el-table-column>

        <!-- 教材信息:科目/版本合列 -->
        <el-table-column label="教材" align="left" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="aclist__book">
              <span class="aclist__book-subject">{{ row.subjectName || '-' }}</span>
              <span class="aclist__book-sep">/</span>
              <span class="aclist__book-textbook">{{ row.textbookName || '-' }}</span>
            </span>
          </template>
        </el-table-column>

        <!-- 用户 -->
        <el-table-column label="用户" align="center" width="80">
          <template #default="{ row }">{{ row.userName || '-' }}</template>
        </el-table-column>

        <!-- 状态(含语言 tag 已移入内容信息) -->
        <el-table-column label="状态" align="center" width="120">
          <template #default="{ row }">
            <!-- 生成中:进度计数 + tooltip(状态消息 + 已用时) -->
            <div v-if="row.status === 0" class="aclist__gen">
              <el-tag size="small" type="warning">生成中</el-tag>
              <span v-if="row.progress" class="aclist__gen-count">
                {{ row.progress.scenesGenerated || 0 }}/{{ row.progress.totalScenes || '?' }}
              </span>
            </div>
            <!-- 完成 -->
            <el-tag v-else-if="row.status === 1" size="small" type="success">完成</el-tag>
            <!-- 失败:tag + 下方错误摘要(截断,title 悬浮看完整) -->
            <div v-else-if="row.status === 2" class="aclist__gen">
              <el-tag size="small" type="danger">失败</el-tag>
              <span v-if="row.errorMsg" class="aclist__gen-error" :title="row.errorMsg">
                {{ row.errorMsg.length > 24 ? row.errorMsg.slice(0, 24) + '…' : row.errorMsg }}
              </span>
            </div>
            <!-- 已取消 -->
            <el-tag v-else-if="row.status === 3" size="small" type="info">已取消</el-tag>
          </template>
        </el-table-column>

        <!-- 操作:全部平铺,不折叠 -->
        <el-table-column label="操作" align="center" width="260">
          <template #default="{ row }">
            <div class="aclist__ops">
              <el-button v-if="row.status === 1" link type="success" size="small" @click="previewClassroom(row)">
                <el-icon><VideoPlay /></el-icon>&nbsp;预览
              </el-button>
              <el-button v-if="row.status === 0 && canOperate(row)" link type="warning" size="small" :loading="cancellingId === row.id" @click="doCancel(row)">
                <el-icon><VideoPause /></el-icon>&nbsp;终止
              </el-button>
              <el-button v-if="canOperate(row) && row.status !== 0" link type="primary" size="small" @click="openWizard('prompt', row)">提示词修改</el-button>
              <el-button v-if="canOperate(row) && row.status !== 0" link size="small" @click="openWizard('outline', row)">大纲修改</el-button>
              <el-button v-if="canOperate(row)" link type="danger" size="small" @click="doDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 生成中自动轮询(2.5s,有 status=0 的记录时启动) -->
      <div v-if="hasGenerating" class="aclist__polling-hint">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>有内容正在生成,自动刷新中…</span>
      </div>
    </div>

    <!-- ==================== 生成向导弹窗(新增/提示词修改/大纲修改) ==================== -->
    <el-dialog v-model="wizardVisible" :title="wizardTitle" width="72%" top="4vh" :close-on-click-modal="false" @closed="onWizardClosed">
      <!-- 头部:步骤指示 -->
      <template #header>
        <div class="wiz-header">
          <span class="wiz-header__title">{{ wizardTitle }}</span>
          <div class="wiz-steps">
            <div class="wiz-step-ind" :class="{ 'is-active': wStep === 0, 'is-done': wStep > 0 }">
              <span class="wiz-step-ind__dot"><el-icon v-if="wStep > 0"><Check /></el-icon><template v-else>1</template></span>
              <span>选择维度与要求</span>
            </div>
            <span class="wiz-steps__line" />
            <div class="wiz-step-ind" :class="{ 'is-active': wStep === 1 }">
              <span class="wiz-step-ind__dot">2</span>
              <span>确认大纲</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Step 0:学校(管理员)+教材三连+提示词+语言(el-form rules 校验) -->
      <div v-if="wStep === 0" class="wiz-step">
        <div class="wiz-flow-tip">流程:选择维度与填写要求 → 确认大纲 → 生成内容(约 1~5 分钟)</div>

        <el-form ref="wizardFormRef" :model="wizardForm" :rules="wizardRules" label-position="top" class="wiz-form">
          <!-- 学校:管理员必选(下拉,按实验的学校类型过滤);教师锁定(自动填充,不需要校验) -->
          <div class="wiz-group">
            <el-form-item v-if="!isTeacher" label="学校" prop="schoolId">
              <el-select v-model="wizardForm.schoolId" placeholder="请选择学校" filterable style="width: 100%">
                <el-option v-for="s in filteredSchools" :key="s.id" :value="s.id" :label="s.schoolName" />
              </el-select>
            </el-form-item>
            <template v-else>
              <div class="wiz-group__head"><span class="wiz-group__title">学校</span></div>
              <!-- 教师有学校:显示校名 -->
              <div v-if="userSchoolId" class="wiz-locked">
                <el-tag effect="plain">{{ schoolName || '本校' }}</el-tag>
                <span class="wiz-locked__tip">教师账号,学校已锁定</span>
              </div>
              <!-- 教师无学校:警告提示 -->
              <div v-else class="wiz-locked">
                <el-tag type="warning" effect="plain">⚠ 未关联学校</el-tag>
                <span class="wiz-locked__tip" style="color: #e6a23c">请联系管理员配置所属学校</span>
              </div>
            </template>
          </div>

          <!-- 教材三连级联:科目→教材版本→分册(必填,校验三级完整) -->
          <div class="wiz-group">
            <el-form-item label="教材版本" prop="textbook">
              <el-cascader
                v-model="wizardForm.textbook"
                :options="bookTree"
                placeholder="科目 / 教材版本 / 分册"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </div>

          <!-- 提示词(必填) -->
          <div class="wiz-group">
            <el-form-item label="生成要求" prop="requirement">
              <el-input
                v-model="wizardForm.requirement"
                type="textarea"
                :rows="5"
                placeholder="描述这节课要讲什么(已预填实验名,可补充重点、深度、风格等)"
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>
          </div>
        </el-form>

        <!-- 语言(非 el-form-item:卡片选择,不在 rules 校验范围) -->
        <div class="wiz-group">
          <div class="wiz-group__head"><span class="wiz-group__title">语言版本</span></div>
          <div class="wiz-langs">
            <div v-for="opt in LANG_OPTIONS" :key="opt.value" class="wiz-lang-card" :class="{ 'is-selected': wLanguage === opt.value }" @click="wLanguage = opt.value">
              <div class="wiz-lang-card__label">{{ opt.label }}</div>
              <div class="wiz-lang-card__desc">{{ opt.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1:大纲确认/编辑 -->
      <div v-else class="wiz-step">
        <div class="wiz-lang-row">
          <span class="wiz-lang-row__label">生成语言</span>
          <el-tag size="small" effect="plain">{{ languageLabel(wLanguage) }}</el-tag>
          <span class="wiz-lang-row__tip">如需更换语言,请返回上一步选择后重新生成大纲</span>
        </div>
        <div v-if="streaming" class="wiz-stream">
          <span class="wiz-stream__pulse" />
          <span>大纲生成中… 已生成 <b>{{ outlines.length }}</b> 个场景</span>
        </div>
        <div ref="outlineListRef" class="wiz-outline-list">
          <div v-for="(row, i) in outlines" :key="row._uid" class="wiz-card" :class="{ 'is-live': streaming && i === outlines.length - 1 }">
            <div class="wiz-card__left">
              <span class="wiz-card__order">{{ i + 1 }}</span>
              <span v-if="streaming && i === outlines.length - 1" class="wiz-card__live" />
            </div>
            <div class="wiz-card__main">
              <div class="wiz-card__row">
                <el-input v-model="row.title" placeholder="场景标题" :disabled="streaming" class="wiz-inline wiz-inline--title" />
                <!-- 场景类型下拉(可切换:幻灯片/测验/实验检查点,与旧生成页一致) -->
                <el-select v-model="row.type" size="small" :disabled="streaming" style="width: 110px; flex-shrink: 0;">
                  <el-option label="幻灯片" value="slide" />
                  <el-option label="测验" value="quiz" />
                  <el-option label="实验检查点" value="experiment" />
                </el-select>
                <el-button v-if="!streaming" type="danger" link @click="outlines.splice(i, 1)">删除</el-button>
              </div>
              <el-input v-model="row.description" type="textarea" :rows="2" placeholder="场景简介" :disabled="streaming" class="wiz-inline" />
              <div class="wiz-kps">
                <span v-for="(kp, j) in (row.keyPoints || [])" :key="j" class="wiz-kp">{{ kp }}<el-icon v-if="!streaming" @click="row.keyPoints.splice(j, 1)"><Close /></el-icon></span>
              </div>
            </div>
          </div>
          <div v-if="!outlines.length && !streaming" class="wiz-empty">暂无大纲,可返回上一步重新生成</div>
        </div>
      </div>

      <!-- 统一操作区 -->
      <template #footer>
        <div class="wiz-footer">
          <div class="wiz-footer__left">
            <el-button v-if="wStep === 1" @click="wStep = 0" :disabled="streaming">上一步</el-button>
          </div>
          <div class="wiz-footer__right">
            <el-button @click="wizardVisible = false">取消</el-button>
            <el-button v-if="wStep === 0" type="primary" :loading="outlineLoading" :disabled="!canSubmitStep0" @click="doGenerateOutline">
              <el-icon><MagicStick /></el-icon>&nbsp;生成大纲 →
            </el-button>
            <el-button v-else type="primary" :disabled="streaming || !outlines.length" :loading="submitting" @click="confirmGenerate">
              确认大纲并生成内容
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- ==================== 预览弹窗(iframe 播放器) ==================== -->
    <el-dialog v-model="previewVisible" title="AI课堂预览" fullscreen destroy-on-close append-to-body>
      <iframe
        v-if="previewUrl"
        :src="previewUrl"
        style="width: 100%; height: calc(100vh - 120px); border: none; border-radius: 8px;"
        allow="autoplay; fullscreen"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listClassroomByExperiment, generateScenes, cancelClassroom, deleteClassroom
} from '@/api/glxt/experimentClassroom'
import request from '@/utils/request'
import { streamOutline } from '@/api/glxt/experimentClassroom'
import { getCourseSystemOptions } from '@/api/glxt/subject'
import { baseListSchool } from '@/api/glxt/base_school'
import { useTeacherInfo } from '@/store/modules/teacherInfo'
import useUserStore from '@/store/modules/user'

/**
 * AI课堂多内容列表(2026-08-28 P2)
 *
 * 一个实验可有多份课堂内容,按 学校×教材三连×教师×语言 维度管理。
 * 列表权限:教师=本校全部(校本共享);管理员=全部。
 * 操作权限:预览全校;提示词修改/大纲修改/删除 = 创建者+管理员(前端按 userId + isTeacher 判定,后端有双层校验)。
 * 生成向导:维度选择(学校/教材/提示词/语言)→ 流式大纲确认 → 异步生成 → 轮询列表。
 */
const props = defineProps({
  experimentId: { type: [Number, String], required: true },
  experimentName: { type: String, default: '' },
  /** 实验的学校类型和学段(教材三联级联依赖这两个参数) */
  schoolType: { type: String, default: '' },
  academicStageType: { type: String, default: '' },
})

const { isTeacher, schoolId: userSchoolId } = useTeacherInfo()
const userStore = useUserStore()

// ==================== 列表 ====================
const loading = ref(true)
const records = ref([])
let pollTimer = null

const hasGenerating = computed(() => records.value.some((r) => r.status === 0))

const loadList = async () => {
  try {
    // 数据权限:教师传本校 schoolId(后端强制过滤);管理员不传(看全部)
    const params = { experimentId: props.experimentId }
    if (isTeacher.value && userSchoolId.value) {
      params.schoolId = userSchoolId.value
    }
    const res = await request({
      url: '/glxt/experimentClassroom/byExperiment/' + props.experimentId,
      method: 'get',
      params: isTeacher.value && userSchoolId.value ? { schoolId: userSchoolId.value } : {}
    })
    records.value = res.data || []
  } catch (e) {
    ElMessage.error('查询AI课堂列表失败')
  } finally {
    loading.value = false
  }
}

/** 生成中自动轮询(有 status=0 时启动,全完成后停) */
const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(async () => {
    if (!hasGenerating.value) { stopPolling(); return }
    try {
      const res = await request({
        url: '/glxt/experimentClassroom/byExperiment/' + props.experimentId,
        method: 'get',
        params: isTeacher.value && userSchoolId.value ? { schoolId: userSchoolId.value } : {}
      })
      records.value = res.data || []
      if (!hasGenerating.value) {
        stopPolling()
        ElMessage.success('AI课堂内容生成完成')
      }
    } catch (e) { /* 单次失败忽略 */ }
  }, 2500)
}
const stopPolling = () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null } }

onMounted(() => { loadList(); startPolling() })
onUnmounted(stopPolling)

// ==================== 权限判定 ====================

/** 操作权限:当前用户是记录创建者 or 管理员(非教师) */
const canOperate = (row) => {
  if (!isTeacher.value) return true // 管理员
  return row.userId === userStore.id // 创建者
}

const languageLabel = (lang) => ({ 'zh-CN': '简体中文', 'zh-TW': '繁體中文(粵語)', 'en': 'English' }[lang] || '简体中文')
const typeLabel = (type) => ({ slide: '幻灯片', quiz: '测验', interactive: '互动', pbl: 'PBL', experiment: '实验' }[type] || type)

/** 页数:从 outlineJson 解析大纲条目数(生成中就有值,不用等完成) */
const pageCount = (row) => {
  if (!row.outlineJson) return '-'
  try { return JSON.parse(row.outlineJson).length || '-' } catch (e) { return '-' }
}

// ==================== 学校/教材数据 ====================
const schoolOptions = ref([])
const bookTree = ref([])
const schoolName = ref('')

/** 学校列表按实验的学校类型过滤(普教实验→普教学校;职教实验→职教学校) */
const filteredSchools = computed(() => {
  if (!props.schoolType) return schoolOptions.value
  return schoolOptions.value.filter((s) => String(s.schoolType) === String(props.schoolType))
})

/** 加载学校列表(管理员选择用)和教材三联树(所有人都要用) */
const loadDimensionData = async () => {
  // 学校:管理员需要下拉选择;教师不用(锁定)
  if (!isTeacher.value) {
    try {
      const res = await baseListSchool({ pageNum: 1, pageSize: 500 })
      schoolOptions.value = res.rows || []
    } catch (e) { console.warn('学校列表加载失败', e) }
  } else if (userSchoolId.value) {
    // 教师:用学校ID查名称(展示用)
    try {
      const res = await baseListSchool({ id: userSchoolId.value })
      schoolName.value = res.data?.schoolName || '本校'
    } catch (e) { schoolName.value = '本校' }
  }
  // 教材三联树:依赖实验的 schoolType + academicStageType(树节点用默认 value/label 字段)
  if (props.schoolType && props.academicStageType) {
    try {
      const res = await getCourseSystemOptions(props.schoolType, props.academicStageType)
      bookTree.value = res.data || []
    } catch (e) { console.warn('教材树加载失败', e) }
  }
}

onMounted(loadDimensionData)

// ==================== 生成向导 ====================
const wizardVisible = ref(false)
const wizardMode = ref('new') // new | prompt | outline
const wStep = ref(0)
const wLanguage = ref('zh-CN')

// ---- el-form 校验:学校/教材/提示词必填(rules + 红星 + 错误提示) ----
const wizardFormRef = ref(null)
const wizardForm = reactive({
  schoolId: null,       // 管理员选的学校(教师= userSchoolId,不需要校验)
  textbook: [],         // 教材三连 [subjectValue, textbookValue, volumeValue](树的 value 类型)
  requirement: '',      // 提示词
})
const wizardRules = {
  schoolId: [{ required: true, message: '请选择学校', trigger: 'change' }],
  textbook: [{
    required: true,
    validator: (rule, value, callback) => {
      if (!value || value.length < 3) {
        callback(new Error('请选择完整的教材(科目/版本/分册)'))
      } else {
        callback()
      }
    },
    trigger: 'change',
  }],
  requirement: [{ required: true, message: '请填写生成要求', trigger: 'blur' }],
}
const outlines = ref([])
const streaming = ref(false)
const outlineLoading = ref(false)
const submitting = ref(false)
const languageDirective = ref('')
const editingRecord = ref(null) // 提示词修改/大纲修改时的已有记录
const LANG_OPTIONS = [
  { value: 'zh-CN', label: '简体中文', desc: '默认,适合国内课堂' },
  { value: 'zh-TW', label: '繁體中文(粵語)', desc: '香港/澳門,粵語發音' },
  { value: 'en', label: 'English', desc: '国际版 / 双语场景' },
]

const wizardTitle = computed(() => ({
  new: '新增AI课堂内容',
  prompt: '提示词修改(重新生成)',
  outline: '大纲修改',
}[wizardMode.value] || '新增AI课堂内容'))

/** step 0 可提交:学校(管理员必选)+ 教材三连 + 提示词非空 */
const canSubmitStep0 = computed(() => {
  if (!isTeacher.value && !wizardForm.schoolId) return false
  if (!wizardForm.textbook || wizardForm.textbook.length < 3) return false
  if (!wizardForm.requirement.trim()) return false
  return true
})

/** 硬指令:覆写 LLM 归纳的 directive,防语言被残留语境带偏 */
const HARD_LANGUAGE_DIRECTIVE = () => ({
  'zh-CN': '全部内容必须使用简体中文输出,包括标题、要点、正文与语音。',
  'zh-TW': '全部內容必須用香港粵語書面語寫作(繁體字,粵語口語詞彙),包括標題、要點、正文與語音。',
  'en': 'ALL content MUST be in English, including titles, key points, body text and speech.',
}[wLanguage.value] || '')

/** 语言后缀(拼进提示词,引导大纲语言) */
const languageSuffix = () => ({
  'zh-CN': '\n(请全部使用简体中文输出,包括标题、要点与正文。)',
  'zh-TW': '\n(請用香港粵語書面語寫作,使用繁體字,口语词汇用粤语表达如:今日/嘅/唔/一齊/嚟等。)',
  'en': '\n(Please output ALL content in English, including titles, key points and page body text.)'
}[wLanguage.value] || '')

/**
 * 从记录行还原级联值:在树里查找匹配节点,返回 [subjectValue, textbookValue, volumeValue]。
 * 树节点用默认 value 字段(类型可能是 Number),DB 里 subjectId 是 String → 需要类型对齐。
 * 找不到匹配(数据不一致/树未加载)返回空数组(用户重新选择)。
 */
const buildCascaderValue = (row) => {
  if (!row || !bookTree.value.length) return []
  const subj = String(row.subjectId ?? '')
  const tbLib = String(row.textbookLibraryId ?? '')
  const vol = String(row.volumeId ?? '')
  // 遍历树:科目 → 教材版本 → 分册,按 String 比较(统一口径)
  for (const s of bookTree.value) {
    if (String(s.value) !== subj) continue
    for (const t of (s.children || [])) {
      if (String(t.value) !== tbLib) continue
      for (const v of (t.children || [])) {
        if (String(v.value) === vol) return [s.value, t.value, v.value] // 用树的原值(类型与树一致)
      }
      // 分册没找到(可能只选了两级):返回两级
      return [s.value, t.value]
    }
  }
  return [] // 未匹配
}

/**
 * 打开向导。
 * new:空态新增,step 0 全空(预填实验名)。
 * prompt:提示词修改,step 0 预填记录的提示词+维度+语言。
 * outline:大纲修改,直接进 step 1 用记录的大纲。
 */
const openWizard = (mode = 'new', row = null) => {
  wizardMode.value = mode
  editingRecord.value = row
  if (mode === 'outline' && row) {
    wizardForm.schoolId = row.schoolId
    wizardForm.textbook = buildCascaderValue(row)
    wizardForm.requirement = row.requirement || ''
    wLanguage.value = row.language || 'zh-CN'
    try { outlines.value = JSON.parse(row.outlineJson || '[]') } catch (e) { outlines.value = [] }
    outlines.value.forEach((o) => { if (!o._uid) o._uid = Math.random().toString(36).slice(2, 10) })
    languageDirective.value = row.languageDirective || ''
    wStep.value = 1
  } else if (mode === 'prompt' && row) {
    wizardForm.schoolId = row.schoolId
    wizardForm.textbook = buildCascaderValue(row)
    wizardForm.requirement = row.requirement || ''
    wLanguage.value = row.language || 'zh-CN'
    outlines.value = []
    languageDirective.value = ''
    wStep.value = 0
  } else {
    wizardForm.schoolId = isTeacher.value ? userSchoolId.value : null
    wizardForm.textbook = []
    wizardForm.requirement = `请讲解实验:《${props.experimentName || '本实验'}》`
    wLanguage.value = 'zh-CN'
    outlines.value = []
    languageDirective.value = ''
    wStep.value = 0
  }
  wizardVisible.value = true
}

const onWizardClosed = () => { streaming.value = false }

/** 生成大纲(SSE 流式):先走 el-form 校验,不通过则不进入 step 1 */
const doGenerateOutline = async () => {
  // el-form rules 校验:学校(管理员)/教材三连/提示词;不通过会标红并阻止
  if (wizardFormRef.value) {
    await wizardFormRef.value.validate() // 不通过会 throw
  }
  outlines.value = []
  languageDirective.value = ''
  streaming.value = true
  outlineLoading.value = false
  wStep.value = 1
  await streamOutline({
    experimentId: props.experimentId,
    requirement: wizardForm.requirement + languageSuffix(),
    onLanguageDirective: (d) => { languageDirective.value = d },
    onOutline: (o) => { if (o) outlines.value.push(o) },
    onDone: (finalOutlines, lang) => {
      streaming.value = false
      if (finalOutlines && finalOutlines.length) outlines.value = finalOutlines
      if (lang) languageDirective.value = lang
      if (!outlines.value.length) { ElMessage.warning('大纲为空,请调整要求后重试'); wStep.value = 0 }
    },
    onError: (e) => {
      streaming.value = false
      ElMessage.error('生成大纲失败: ' + (e.message || e))
      if (!outlines.value.length) wStep.value = 0
    }
  })
}

/** 确认生成(覆盖提示 + 并发校验:同用户同组合正在生成中则阻止) */
const confirmGenerate = () => {
  // 并发校验:当前用户 + 同组合 是否有 status=0(生成中)的记录 → 阻止提交防竞态
  const generating = records.value.find((r) =>
    r.status === 0 &&
    r.userId === userStore.id &&
    r.subjectId === (wizardForm.textbook[0] != null ? String(wizardForm.textbook[0]) : '') &&
    r.textbookLibraryId === wizardForm.textbook[1] &&
    r.language === wLanguage.value
  )
  if (generating) {
    ElMessage.warning('该教材组合正在生成中,请等待完成或先终止后再提交')
    return
  }
  const hasOld = editingRecord.value || records.value.some((r) =>
    r.userId === userStore.id &&
    r.subjectId === (wizardForm.textbook[0] != null ? String(wizardForm.textbook[0]) : '') &&
    r.textbookLibraryId === wizardForm.textbook[1] &&
    r.language === wLanguage.value
  )
  ElMessageBox.confirm(
    hasOld ? '将根据该大纲重新生成,原有AI课堂内容会被覆盖。确认开始?' : '将根据该大纲生成AI课堂内容(约 1~5 分钟)。确认开始?',
    '开始生成', { type: 'warning' }
  ).then(() => doGenerate()).catch(() => {})
}

const doGenerate = async () => {
  submitting.value = true
  try {
    // 级联值提取:树的原生值类型(subjectId 转 String,后端实体是 String)
    const cascaderVals = wizardForm.textbook || []
    await generateScenes({
      experimentId: props.experimentId,
      schoolId: isTeacher.value ? userSchoolId.value : wizardForm.schoolId,
      subjectId: cascaderVals[0] != null ? String(cascaderVals[0]) : null,
      textbookLibraryId: cascaderVals[1] != null ? Number(cascaderVals[1]) : null,
      volumeId: cascaderVals[2] != null ? Number(cascaderVals[2]) : null,
      requirement: wizardForm.requirement,
      languageDirective: HARD_LANGUAGE_DIRECTIVE() || languageDirective.value,
      language: wLanguage.value,
      outlines: outlines.value.map(({ _uid, ...rest }) => rest),
      existingRecordId: editingRecord.value?.id || null,
    })
    wizardVisible.value = false
    await loadList()
    startPolling()
    ElMessage.success('已提交生成任务')
  } catch (e) {
    ElMessage.error('提交生成失败')
  } finally {
    submitting.value = false
  }
}

// ==================== 终止/删除/预览 ====================
const cancellingId = ref(null)

const doCancel = async (row) => {
  try { await ElMessageBox.confirm('确认终止本次生成?', '终止', { type: 'warning' }) } catch { return }
  cancellingId.value = row.id
  try {
    await cancelClassroom(row.id)
    await loadList()
    ElMessage.success('已终止')
  } catch (e) { ElMessage.error('终止失败') } finally { cancellingId.value = null }
}

const doDelete = (row) => {
  ElMessageBox.confirm('删除后该内容不可恢复,需重新生成。确认删除?', '删除', { type: 'warning' })
    .then(async () => {
      try {
        await deleteClassroom(row.id)
        ElMessage.success('删除成功')
        await loadList()
      } catch (e) { ElMessage.error('删除失败') }
    }).catch(() => {})
}

/** 操作下拉菜单分发 */
const handleOps = (command, row) => {
  if (command === 'prompt') openWizard('prompt', row)
  else if (command === 'outline') openWizard('outline', row)
  else if (command === 'delete') doDelete(row)
}

// ==================== 预览(iframe 播放器) ====================
const previewVisible = ref(false)
const previewUrl = ref('')
const PLAYER_BASE = import.meta.env.VITE_PLAYER_URL || ''

/** 预览:打开 iframe 播放器(URL 格式与 experiment_generate.vue 完全一致,含 /play 路径 + mockAndroid) */
const previewClassroom = (row) => {
  if (!row.ossZipUrl) { ElMessage.warning('该内容暂无预览地址'); return }
  previewUrl.value = `${PLAYER_BASE}/play?src=${encodeURIComponent(row.ossZipUrl)}&mockAndroid=1`
  previewVisible.value = true
}
</script>

<style scoped>
.aclist { min-height: 400px; display: flex; flex-direction: column; }
.aclist__center { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px 0; }

/* 空态 */
.aclist__empty { text-align: center; }
.aclist__empty-icon { font-size: 56px; color: #409eff; }
.aclist__empty h2 { margin: 16px 0 8px; font-size: 20px; color: #303133; }
.aclist__empty p { color: #909399; font-size: 13px; margin-bottom: 24px; }

/* 顶部操作栏 */
.aclist__bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }

/* 内容信息合列:名称 + 页数/语言(上下两行,紧凑) */
.aclist__info { display: flex; flex-direction: column; gap: 2px; padding: 1px 0; }
.aclist__info-name { font-size: 13px; font-weight: 500; color: #303133; line-height: 1.4; }
.aclist__info-meta { display: flex; gap: 8px; font-size: 12px; color: #909399; line-height: 1.3; }
.aclist__info-pages { font-variant-numeric: tabular-nums; }

/* 生成中/失败 状态列:tag + 下方信息(进度计数/错误摘要) */
.aclist__gen { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.aclist__gen-count {
  font-size: 12px; color: #e6a23c; font-variant-numeric: tabular-nums;
}
.aclist__gen-error {
  font-size: 11px; color: #f56c6c; max-width: 110px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  cursor: help; /* 提示可 hover 看完整 */
}

/* 操作列:圆形图标按钮,水平排列 */
.aclist__ops {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  white-space: nowrap;
}
.aclist__ops .el-button { margin-left: 0; }

/* 教材信息合列:科目 + " / " + 版本,单行展示 */
.aclist__book { white-space: nowrap; }
.aclist__book-subject { font-size: 13px; font-weight: 600; color: #409eff; }
.aclist__book-sep { font-size: 12px; color: #dcdfe6; margin: 0 4px; }
.aclist__book-textbook { font-size: 12px; color: #6b7280; }

/* 操作列按钮一行显示(flex + nowrap,不换行) */
.aclist__ops {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
  flex-wrap: nowrap;
}
.aclist__ops .el-button { margin-left: 0; } /* 去掉 el-button 默认的 margin-left */

/* 轮询提示 */
.aclist__polling-hint {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  margin-top: 12px; font-size: 12px; color: #e6a23c;
}

/* ==================== 向导(与 IntroManagement 同套样式) ==================== */
.wiz-header { display: flex; align-items: center; justify-content: space-between; }
.wiz-header__title { font-size: 16px; font-weight: 600; color: #303133; }
.wiz-steps { display: flex; align-items: center; gap: 10px; }
.wiz-step-ind { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #a8abb2; }
.wiz-step-ind__dot {
  width: 20px; height: 20px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; border: 1px solid #dcdfe6; background: #fff; color: #a8abb2;
}
.wiz-step-ind.is-active { color: #409eff; font-weight: 500; }
.wiz-step-ind.is-active .wiz-step-ind__dot { border-color: #409eff; color: #409eff; background: #ecf5ff; }
.wiz-step-ind.is-done { color: #67c23a; }
.wiz-step-ind.is-done .wiz-step-ind__dot { border-color: #67c23a; color: #67c23a; background: #f0f9eb; }
.wiz-steps__line { width: 28px; height: 1px; background: #dcdfe6; }

.wiz-step { display: flex; flex-direction: column; gap: 16px; }
.wiz-flow-tip { font-size: 12px; color: #6b7280; background: #f5f7fa; border-radius: 6px; padding: 8px 14px; }

.wiz-group { border: 1px solid #ebeef5; border-radius: 10px; padding: 14px 16px; background: #fff; }
.wiz-group__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.wiz-group__title { font-size: 13px; font-weight: 600; color: #303133; }

/* el-form 在 wiz-group 卡片内的样式适配:label 顶置 + 去掉默认底边距 */
.wiz-form :deep(.el-form-item) { margin-bottom: 0; }
.wiz-form :deep(.el-form-item__label) {
  font-size: 13px; font-weight: 600; color: #303133;
  padding-bottom: 8px; line-height: 1.4;
}
.wiz-form :deep(.el-form-item__error) { padding-top: 4px; }
.wiz-group__count { font-size: 12px; color: #a8abb2; }
.wiz-group__helper { margin-top: 8px; font-size: 12px; color: #6b7280; }

/* 教师锁定态 */
.wiz-locked { display: flex; align-items: center; gap: 10px; }
.wiz-locked__tip { font-size: 12px; color: #909399; }

/* 语言卡片 */
.wiz-langs { display: flex; gap: 12px; }
.wiz-lang-card { flex: 1; padding: 12px 14px; border: 1px solid #ebeef5; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.wiz-lang-card:hover { border-color: #a0cfff; }
.wiz-lang-card.is-selected { border-color: #409eff; background: #ecf5ff; box-shadow: 0 0 0 1px #409eff inset; }
.wiz-lang-card__label { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 4px; }
.wiz-lang-card__desc { font-size: 12px; color: #6b7280; }

/* 大纲步骤 */
.wiz-lang-row { display: flex; align-items: center; gap: 8px; }
.wiz-lang-row__label { font-size: 13px; color: #606266; }
.wiz-lang-row__tip { font-size: 12px; color: #6b7280; }

.wiz-stream {
  display: flex; align-items: center; gap: 8px;
  background: #ecf5ff; color: #409eff; border-radius: 6px; padding: 8px 14px; font-size: 13px;
}
.wiz-stream__pulse { width: 8px; height: 8px; border-radius: 50%; background: #409eff; animation: aclist-blink 1s ease-in-out infinite; }
@keyframes aclist-blink { 50% { opacity: 0.2; } }

.wiz-outline-list { max-height: 56vh; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.wiz-card { display: flex; gap: 10px; padding: 12px 14px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; animation: aclist-card-in 0.18s ease-out; }
.wiz-card:hover { border-color: #a0cfff; box-shadow: 0 2px 8px rgba(0, 21, 41, 0.06); }
@keyframes aclist-card-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.wiz-card__left { display: flex; align-items: center; gap: 6px; }
.wiz-card__order { width: 22px; height: 22px; border-radius: 50%; background: #409eff; color: #fff; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.wiz-card__live { width: 7px; height: 7px; border-radius: 50%; background: #67c23a; animation: aclist-blink 1s infinite; }
.wiz-card__main { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.wiz-card__row { display: flex; align-items: center; gap: 8px; }
.wiz-inline--title { font-weight: 600; }
.wiz-kps { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.wiz-kp { display: inline-flex; align-items: center; gap: 4px; background: #f0f2f5; border-radius: 4px; padding: 2px 8px; font-size: 12px; color: #4b5563; }
.wiz-kp .el-icon { cursor: pointer; color: #c0c4cc; }
.wiz-kp .el-icon:hover { color: #f56c6c; }
.wiz-empty { text-align: center; color: #6b7280; font-size: 13px; padding: 36px 0; border: 1px dashed #ebeef5; border-radius: 8px; }

/* 统一 footer */
.wiz-footer { display: flex; justify-content: space-between; align-items: center; }
.wiz-footer__left { display: flex; gap: 8px; }
.wiz-footer__right { display: flex; gap: 8px; }

@media (prefers-reduced-motion: reduce) {
  .wiz-card { animation: none; }
  .wiz-stream__pulse { animation: none; }
}
</style>
