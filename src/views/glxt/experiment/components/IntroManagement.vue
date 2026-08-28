<template>
  <div class="intro-mgmt">
    <!-- ==================== 加载中 ==================== -->
    <div v-if="mode === 'loading'" class="intro-center intro-tip">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中…</span>
    </div>

    <!-- ==================== 空态(无简介):新增内容按钮居中 ==================== -->
    <div v-else-if="mode === 'empty' || mode === 'cancelled'" class="intro-center">
      <div class="intro-empty">
        <el-icon class="intro-empty__icon"><Orange /></el-icon>
        <h2>{{ mode === 'cancelled' ? '上次生成已终止' : '暂无内容简介' }}</h2>
        <p>通过 AI 生成分页 PPT 内容简介(仅标题与内容,无语音与互动)</p>
        <el-button type="primary" size="large" class="intro-empty__btn" @click="openWizard('new')" v-hasPermi="['glxt:experimentContentIntro:edit']">
          <el-icon><Plus /></el-icon>&nbsp;新增内容
        </el-button>
      </div>
    </div>

    <!-- ==================== 生成中(Task Rows 任务行 + 已用时长,Beautiful UI 模式复刻) ==================== -->
    <div v-else-if="mode === 'generating'" class="intro-center">
      <div class="intro-gen">
        <div class="intro-gen__head">
          <span class="intro-gen__spinner" />
          <h3>内容简介生成中</h3>
          <span class="intro-gen__elapsed">已用时 {{ elapsedText }}</span>
        </div>
        <p class="intro-gen__sub">语言:{{ languageLabel(record?.language) }} · 共 {{ taskRows.length }} 页,完成后自动展示</p>

        <!-- 任务行:✓ 已完成 / ⋯ 生成中(呼吸) / ○ 待进行 -->
        <div class="intro-tasks">
          <div v-for="(t, i) in taskRows" :key="i" class="intro-task" :class="'is-' + t.state">
            <span class="intro-task__icon">
              <el-icon v-if="t.state === 'done'"><CircleCheckFilled /></el-icon>
              <span v-else-if="t.state === 'running'" class="intro-task__breath" />
              <span v-else class="intro-task__dot" />
            </span>
            <span class="intro-task__name">{{ t.name }}</span>
            <span class="intro-task__status">{{ t.statusText }}</span>
          </div>
        </div>

        <el-button plain @click="doCancel" :loading="cancelling">终止生成</el-button>
      </div>
    </div>

    <!-- ==================== 生成失败 ==================== -->
    <div v-else-if="mode === 'failed'" class="intro-center">
      <div class="intro-fail">
        <el-icon class="intro-fail__icon"><CircleCloseFilled /></el-icon>
        <h3>生成失败</h3>
        <p class="intro-fail__msg">{{ record?.errorMsg || '未知错误' }}</p>
        <div class="intro-fail__actions">
          <el-button type="primary" @click="retryGenerate" v-hasPermi="['glxt:experimentContentIntro:edit']">重新生成</el-button>
          <el-button @click="confirmOpenWizard('prompt')" v-hasPermi="['glxt:experimentContentIntro:edit']">提示词修改</el-button>
          <el-button @click="confirmOpenWizard('outline')" v-hasPermi="['glxt:experimentContentIntro:edit']">大纲修改</el-button>
        </div>
      </div>
    </div>

    <!-- ==================== 完成:PPT 翻页查看器 ==================== -->
    <div v-else-if="mode === 'done'" class="intro-viewer">
      <!-- 顶部工具条:语言/更新时间 + 操作 -->
      <div class="intro-viewer__bar">
        <div class="intro-viewer__meta">
          <el-tag size="small" effect="plain">{{ languageLabel(record?.language) }}</el-tag>
          <span class="intro-viewer__time">{{ record?.updateTime }} 更新</span>
        </div>
        <div class="intro-viewer__actions" v-hasPermi="['glxt:experimentContentIntro:edit']">
          <el-button plain size="small" @click="confirmOpenWizard('prompt')">提示词修改</el-button>
          <el-button plain size="small" @click="confirmOpenWizard('outline')">大纲修改</el-button>
          <el-button plain size="small" type="danger" @click="doDelete">删除</el-button>
        </div>
      </div>

      <!-- 舞台:画布 + 悬浮胶囊页控制器(浏览组‖编辑组,编辑态按钮就地切换,手不移动) -->
      <div class="intro-viewer__stage">
        <!-- 编辑态提示条(编辑操作在下方胶囊里,这里只留引导文案) -->
        <div v-if="editing" class="intro-edit-bar">
          <span class="intro-edit-bar__hint">直接点击文字修改;公式块点击弹窗编辑源码(双击页面进入/退出外的编辑均以保存为准)</span>
        </div>

        <div class="intro-viewer__canvas">
          <template v-if="currentPage">
            <!-- 画布坐标还原渲染(播放器同款做法,查看/编辑一体)。
                 外层按 1000×562 比例占位;内层固定 1000×562 px 渲染全部元素(含 LLM 写死的
                 内联 px 字号,按设计原尺寸),再整体 transform:scale() 等比缩放——
                 位置/字号/公式一次性同步缩放,不会出现"位置缩了字没缩"的错位。
                 编辑态:文本元素 contenteditable 原地编辑(点哪儿改哪儿,样式随内容保留);
                 公式块点击弹窗改源码;色块不可点(pointer-events:none,点击穿透到文字)。
                 双击画布 = 进入编辑(与胶囊按钮等效,需编辑权限)。
                 :key 拼 editEpoch —— 保存/取消后强制从源数据重建 DOM(清掉编辑残留)。 -->
            <div
              ref="canvasRef"
              class="intro-canvas"
              :class="{ 'intro-canvas--editing': editing }"
              tabindex="0"
              title="双击进入本页编辑"
              @dblclick="tryEnterEditByDblClick"
              @keydown.arrow.left="!editing && prevPage()"
              @keydown.arrow.right="!editing && nextPage()"
            >
              <div class="intro-canvas__inner" :style="{ transform: 'scale(' + introScale + ')' }">
                <template v-for="el in canvasElements(currentPage)" :key="el._idx + '-' + editEpoch">
                  <!-- shape 装饰元素:色块/分隔线/编号色条(fill 做背景色,按坐标定位;
                       数组序 shape 在 text 之前 = 先画在底层,文字正确叠放在上。
                       真实产物 path 均为矩形/分隔线,按色块近似渲染即可还原设计) -->
                  <div
                    v-if="el.type === 'shape'"
                    class="intro-canvas__shape"
                    :style="shapeStyle(el)"
                  ></div>
                  <!-- latex 公式:优先用预渲染 html(KaTeX 结果),没有则包 $..$ 走 v-katex 现渲;
                       编辑态点击弹窗改源码 -->
                  <div
                    v-if="el.type === 'latex' && el.html"
                    class="intro-canvas__el intro-canvas__el--latex"
                    :class="{ 'intro-canvas__el--clickable': editing }"
                    :style="elStyle(el)"
                    v-html="el.html"
                    @click="editing && openLatexEditor(el)"
                  ></div>
                  <div
                    v-else-if="el.type === 'latex'"
                    class="intro-canvas__el intro-canvas__el--latex"
                    :class="{ 'intro-canvas__el--clickable': editing }"
                    :style="elStyle(el)"
                    v-katex
                    @click="editing && openLatexEditor(el)"
                  >${{ el.latex }}$</div>
                  <!-- 文本·编辑态:contenteditable 原地编辑(不挂 v-katex——auto-render 会替换
                       内容节点,和 contenteditable 的光标/DOM 打架;保存回查看态再渲染公式) -->
                  <div
                    v-else-if="el.type === 'text' && editing"
                    class="intro-canvas__el intro-canvas__el--editable"
                    :style="elStyle(el)"
                    :data-el-idx="el._idx"
                    contenteditable="true"
                    v-html="el.content"
                  ></div>
                  <!-- 文本·查看态:富文本 v-html + v-katex(内联 $..$ 公式渲染) -->
                  <div
                    v-else-if="el.type === 'text'"
                    class="intro-canvas__el"
                    :style="elStyle(el)"
                    v-html="el.content"
                    v-katex
                  ></div>
                </template>
              </div>
            </div>
          </template>
          <el-empty v-else description="内容为空" />
        </div>

        <!-- 悬浮胶囊页控制器:浏览组(翻页)‖ 编辑组(本页编辑/保存取消)。
             浏览态 → 主 CTA「编辑本页」;编辑态 → 原位切换为「取消 / 保存本页」(空间连续)。 -->
        <div class="intro-pagebar">
          <div class="intro-pagebar__nav">
            <el-button circle size="small" :disabled="pageIndex <= 0" @click="prevPage"><el-icon><ArrowLeft /></el-icon></el-button>
            <span class="intro-pagebar__pageno">{{ pageIndex + 1 }} / {{ pages.length }}</span>
            <el-button circle size="small" :disabled="pageIndex >= pages.length - 1" @click="nextPage"><el-icon><ArrowRight /></el-icon></el-button>
          </div>
          <span class="intro-pagebar__divider" />
          <div class="intro-pagebar__actions">
            <template v-if="!editing">
              <!-- 浏览态的中性样式(白底描边):胶囊是覆盖在彩色页面上的 Chrome 控件,
                   实心主色会和 LLM 生成的页面配色打架;主 CTA 强调只留给瞬时的"保存"动作 -->
              <el-button
                size="small"
                class="intro-pagebar__btn"
                @click="startEditPage"
                v-hasPermi="['glxt:experimentContentIntro:edit']"
              >
                <el-icon><Edit /></el-icon>&nbsp;编辑本页
              </el-button>
            </template>
            <template v-else>
              <el-button size="small" class="intro-pagebar__btn" @click="cancelEditPage">取消</el-button>
              <!-- 保存是提交动作,保留实心主色(防误漏);编辑态有画布描边+提示条托底 -->
              <el-button size="small" type="primary" class="intro-pagebar__btn" :loading="savingPage" @click="savePage">保存本页</el-button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 公式块编辑弹窗(编辑态点击公式块触发) ==================== -->
    <el-dialog v-model="latexEditor.visible" title="编辑公式(LaTeX 源码)" width="560px" append-to-body>
      <el-input
        v-model="latexEditor.value"
        type="textarea"
        :rows="4"
        placeholder="LaTeX 源码,如 2Na + 2H_2O \rightarrow 2NaOH + H_2\uparrow"
      />
      <div class="latex-live-preview">
        <div class="latex-live-preview__label">实时预览</div>
        <div class="latex-live-preview__formula" v-katex>${{ latexEditor.value || '\\text{预览}' }}$</div>
      </div>
      <template #footer>
        <el-button @click="latexEditor.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmLatexEdit">确定</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 生成向导(提示词 → 流式大纲确认 → 生成) ==================== -->
    <el-dialog
      v-model="wizardVisible"
      width="72%"
      top="4vh"
      :close-on-click-modal="false"
      class="intro-wizard"
      @closed="onWizardClosed"
    >
      <!-- 头部:标题 + 步骤指示器(两步流程,当前步主色高亮、已完成打勾) -->
      <template #header>
        <div class="wiz-header">
          <span class="wiz-header__title">{{ wizardMode === 'outline' ? '大纲修改' : (wizardMode === 'prompt' ? '提示词修改(重新生成)' : '新增内容简介') }}</span>
          <div class="wiz-steps">
            <div class="wiz-step-ind" :class="{ 'is-active': wStep === 0, 'is-done': wStep > 0 }">
              <span class="wiz-step-ind__dot">
                <el-icon v-if="wStep > 0"><Check /></el-icon>
                <template v-else>1</template>
              </span>
              <span>填写要求</span>
            </div>
            <span class="wiz-steps__line" />
            <div class="wiz-step-ind" :class="{ 'is-active': wStep === 1 }">
              <span class="wiz-step-ind__dot">2</span>
              <span>确认大纲</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Step 0:提示词 + 语言(分组卡片化,常驻辅助文案) -->
      <div v-if="wStep === 0" class="wiz-step">
        <div class="wiz-flow-tip">流程:填写要求 → 确认大纲 → 生成内容(约 1~3 分钟)</div>

        <div class="wiz-group">
          <div class="wiz-group__head">
            <span class="wiz-group__title">生成要求</span>
            <span class="wiz-group__count">{{ (wRequirement || '').length }} 字</span>
          </div>
          <el-input
            v-model="wRequirement"
            type="textarea"
            :rows="7"
            placeholder="描述要生成的内容简介,如:面向高中学生,涵盖实验原理、现象与安全要点,风格简洁"
          />
          <div class="wiz-group__helper">已预填实验名;可补充受众、重点、深度、风格等要求,写得越具体生成越贴合</div>
        </div>

        <div class="wiz-group">
          <div class="wiz-group__head">
            <span class="wiz-group__title">语言版本</span>
          </div>
          <div class="wiz-langs">
            <div
              v-for="opt in LANG_OPTIONS"
              :key="opt.value"
              class="wiz-lang-card"
              :class="{ 'is-selected': wLanguage === opt.value }"
              @click="wLanguage = opt.value"
            >
              <div class="wiz-lang-card__label">{{ opt.label }}</div>
              <div class="wiz-lang-card__desc">{{ opt.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1:大纲确认/编辑(流式只读,完成后可编辑:标题/简介/要点/拖拽排序/增删页) -->
      <div v-else class="wiz-step">
        <!-- 当前生成语言(只读展示:大纲语言=成品语言,换语言须回提示词步骤重新生成大纲) -->
        <div class="wiz-lang-row">
          <span class="wiz-lang-row__label">生成语言</span>
          <el-tag size="small" effect="plain">{{ languageLabel(wLanguage) }}</el-tag>
          <span class="wiz-lang-row__tip">如需更换语言,请返回上一步选择后重新生成大纲</span>
        </div>

        <!-- 思考面板(Beautiful UI Thinking 模式):思考模式开时展示 LLM 推理过程;
             折叠态一行细条 + 计时,展开可看滚动思考文本;大纲开始产出后自动收起 -->
        <div v-if="thinkingText" class="wiz-thinking" :class="{ 'is-expanded': thinkingExpanded }">
          <div class="wiz-thinking__head" @click="thinkingExpanded = !thinkingExpanded">
            <span class="wiz-thinking__icon">💡</span>
            <span class="wiz-thinking__label">
              {{ outlines.length ? '思考完成' : '思考中…' }}
            </span>
            <span class="wiz-thinking__elapsed">{{ thinkingElapsedText }}</span>
            <el-icon class="wiz-thinking__arrow" :class="{ 'is-open': thinkingExpanded }"><ArrowRight /></el-icon>
          </div>
          <div v-if="thinkingExpanded" ref="thinkingBodyRef" class="wiz-thinking__body">
            {{ thinkingText }}
          </div>
        </div>

        <div v-if="streaming" class="wiz-stream">
          <span class="wiz-stream__pulse" />
          <span>大纲生成中… 已生成 <b>{{ outlines.length }}</b> 页</span>
        </div>

        <div ref="outlineListRef" class="wiz-outline-list">
          <div
            v-for="(row, i) in outlines"
            :key="row._uid"
            class="wiz-card"
            :class="{ 'is-live': streaming && i === outlines.length - 1 }"
          >
            <div class="wiz-card__left">
              <el-tooltip v-if="!streaming" content="拖动排序" placement="top">
                <el-icon class="wiz-drag"><Rank /></el-icon>
              </el-tooltip>
              <span class="wiz-card__order">{{ i + 1 }}</span>
              <span v-if="streaming && i === outlines.length - 1" class="wiz-card__live" />
            </div>
            <div class="wiz-card__main">
              <div class="wiz-card__row">
                <el-input v-model="row.title" placeholder="页标题" :disabled="streaming" class="wiz-inline wiz-inline--title" />
                <el-button v-if="!streaming" type="danger" link @click="removeOutline(i)">删除</el-button>
              </div>
              <el-input v-model="row.description" type="textarea" :rows="2" placeholder="页面简介" :disabled="streaming" class="wiz-inline" />
              <!-- 要点芯片 -->
              <div class="wiz-kps">
                <span v-for="(kp, j) in (row.keyPoints || [])" :key="j" class="wiz-kp">{{ kp }}<el-icon v-if="!streaming" @click="removeKeyPoint(i, j)"><Close /></el-icon></span>
                <input v-model="kpInputs[i]" class="wiz-kp-input" :disabled="streaming" placeholder="+ 要点(回车或逗号)" @keyup.enter="addKeyPoint(i)" @keydown="onKpKeydown(i, $event)" />
              </div>
            </div>
          </div>
          <!-- 空态兜底:大纲为空且不在流式中 -->
          <div v-if="!outlines.length && !streaming" class="wiz-empty">
            暂无大纲页,可点击左下角"添加一页"手动创建,或返回上一步重新生成
          </div>
        </div>
      </div>

      <!-- 统一操作区(两步共用一个 footer:次级动作靠左,主 CTA 最右;所有按钮同尺寸,主次靠实心/描边区分) -->
      <template #footer>
        <div class="wiz-footer">
          <div class="wiz-footer__left">
            <template v-if="wStep === 1">
              <el-button @click="wStep = 0" :disabled="streaming">上一步</el-button>
              <el-button @click="addOutline" :disabled="streaming"><el-icon><Plus /></el-icon>&nbsp;添加一页</el-button>
            </template>
          </div>
          <div class="wiz-footer__right">
            <el-button @click="wizardVisible = false">取消</el-button>
            <el-button
              v-if="wStep === 0"
              type="primary"
              :loading="outlineLoading"
              :disabled="!wRequirement.trim()"
              @click="doGenerateOutline"
            >
              <el-icon><MagicStick /></el-icon>&nbsp;生成大纲 →
            </el-button>
            <el-button
              v-else
              type="primary"
              :disabled="streaming || !outlines.length"
              :loading="submitting"
              @click="confirmGenerate"
            >
              确认大纲并生成内容
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Sortable from 'sortablejs'
import {
  streamIntroOutline, generateIntro, cancelIntro,
  getIntroByExperiment, updateIntroContent, deleteIntro
} from '@/api/glxt/experimentContentIntro'
import { checkPermi } from '@/utils/permission'

/**
 * 内容简介管理(AI 生成纯 PPT)
 *
 * 四态状态机:empty(空态,新增按钮居中)/ generating(轮询)/ failed(失败,可重试)/ done(翻页查看)
 * 生成闸口:无论新增还是修改重新生成,必须经过"大纲确认"向导步骤才能提交(需求硬约束)。
 * 单页编辑:查看态点"修改本页",编辑该页文本块(纯文本按行分段)与公式块(LaTeX 源码)。
 */
const props = defineProps({
  experimentId: { type: [Number, String], required: true },
  experimentName: { type: String, default: '' }
})

// ==================== 状态机 ====================
const mode = ref('loading') // loading | empty | generating | done | failed | cancelled
const record = ref(null)    // byExperiment 完整记录
const cancelling = ref(false)
let pollTimer = null

// ==================== 查看器 ====================
const pages = ref([])        // content_json 解析出的页数组
const pageIndex = ref(0)     // 当前页(0 基)
const currentPage = computed(() => pages.value[pageIndex.value] || null)

const prevPage = () => { if (pageIndex.value > 0) pageIndex.value-- }
const nextPage = () => { if (pageIndex.value < pages.value.length - 1) pageIndex.value++ }

// ==================== 画布坐标还原(A1:像播放器那样按坐标排版) ====================
const CANVAS_W = 1000  // generator 画布宽(slide-content 提示词约定的 canvas_width)
const CANVAS_H = 562   // 画布高(0.562 比例)
const canvasRef = ref(null)
const introScale = ref(1) // 字号缩放系数 = 容器宽 / 画布宽(随窗口自适应)

/** 画布元素:保持数组原序(绝对定位后顺序即 z 序,后画的在上层),只带 _idx */
const canvasElements = (page) => {
  if (!page || !Array.isArray(page.elements)) return []
  return page.elements.map((el, idx) => ({ ...el, _idx: idx }))
}

/** 元素坐标 → 内层画布(固定 1000×562)内的 px 定位,设计原尺寸直出 */
const elStyle = (el) => ({
  left: (el.left ?? 0) + 'px',
  top: (el.top ?? 0) + 'px',
  width: (el.width ?? 400) + 'px',
})

/** shape 元素 → 色块样式(fill 背景 + 坐标 + 高度 + 透明度;矩形 path 按色块近似) */
const shapeStyle = (el) => ({
  left: (el.left ?? 0) + 'px',
  top: (el.top ?? 0) + 'px',
  width: (el.width ?? 400) + 'px',
  height: (el.height ?? 40) + 'px',
  background: el.fill || '#5b9bd5',
  opacity: el.opacity ?? 1,
})

/** 监听画布容器宽度,更新整体缩放系数 = 容器宽/1000(画布随 done 态晚挂载,watch ref 再挂观察器) */
let canvasObserver = null
watch(canvasRef, (el) => {
  if (canvasObserver) { canvasObserver.disconnect(); canvasObserver = null }
  if (!el) return
  const measure = () => { introScale.value = (canvasRef.value?.clientWidth || CANVAS_W) / CANVAS_W }
  measure()
  canvasObserver = new ResizeObserver(measure)
  canvasObserver.observe(el)
}, { flush: 'post' })

const languageLabel = (lang) => ({ 'zh-CN': '简体中文', 'zh-TW': '繁体中文', 'en': 'English' }[lang] || '简体中文')

// ==================== 单页编辑(画布所见即所得) ====================
const editing = ref(false)
const savingPage = ref(false)
const editEpoch = ref(0)    // 保存/取消后自增 → v-for key 变化 → 画布从源数据强制重建(清掉编辑残留)
let editSnapshot = null     // 进入编辑时的元素快照(取消时回滚;公式弹窗是即时改源,靠它恢复)

/** 进入编辑:画布原地编辑,先拍快照供取消回滚 */
const startEditPage = () => {
  const page = currentPage.value
  if (!page) return
  editSnapshot = JSON.parse(JSON.stringify(page.elements || []))
  editing.value = true
}

/** 双击画布进入编辑(与胶囊按钮等效;权限与 v-hasPermi 同源校验,防止绕过按钮权限) */
const tryEnterEditByDblClick = () => {
  if (editing.value) return // 编辑态双击 = contenteditable 选词,不处理
  if (!checkPermi(['glxt:experimentContentIntro:edit'])) return
  startEditPage()
}

/** 取消:回滚公式弹窗的即时修改 + 自增 epoch 让画布丢弃 DOM 里的手改内容 */
const cancelEditPage = () => {
  const page = currentPage.value
  if (page && editSnapshot) page.elements = editSnapshot
  editSnapshot = null
  editing.value = false
  editEpoch.value++
}

// ---- 公式块编辑弹窗(编辑态点击公式块触发;即时写回源数据,画布实时刷新) ----
const latexEditor = ref({ visible: false, elIdx: null, value: '' })

const openLatexEditor = (el) => {
  latexEditor.value = { visible: true, elIdx: el._idx, value: el.latex || '' }
}

const confirmLatexEdit = () => {
  const { elIdx, value } = latexEditor.value
  const el = (currentPage.value?.elements || [])[elIdx]
  if (el && el.type === 'latex') {
    el.latex = value
    el.html = null // 源码已改,预渲染 html 作废(查看器自动回退 $..$ 现渲)
  }
  latexEditor.value.visible = false
}

/**
 * 保存本页:从画布 DOM 收集 contenteditable 的编辑结果(innerHTML,样式随内容保留),
 * 回写当前页元素 → 整份 pages 提交(存储契约不变:PUT /content 全量 JSON)。
 */
const savePage = async () => {
  const page = currentPage.value
  if (!page || !canvasRef.value) return
  savingPage.value = true
  try {
    // 收集 DOM 编辑结果:每个可编辑文本块带 data-el-idx,读其 innerHTML
    const edits = {}
    canvasRef.value.querySelectorAll('[data-el-idx]').forEach((node) => {
      edits[node.dataset.elIdx] = node.innerHTML
    })
    // 克隆全量页数组,回写当前页(其他页不动),整份提交
    const newPages = pages.value.map((p, pi) => {
      if (pi !== pageIndex.value) return p
      const els = (p.elements || []).map((e, idx) =>
        edits[idx] !== undefined ? { ...e, content: edits[idx] } : { ...e }
      )
      return { ...p, elements: els }
    })
    await updateIntroContent({ experimentId: props.experimentId, pages: newPages })
    pages.value = newPages
    editSnapshot = null
    editing.value = false
    editEpoch.value++ // 从新数据重建画布(同时把查看态的 v-katex 重新挂上)
    ElMessage.success('本页已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    savingPage.value = false
  }
}

// ==================== 生成进度(Task Rows 数据) ====================
const genProgress = ref(null)     // 后端透出的 maic job 进度 {scenesGenerated, totalScenes, statusMessage}
const genStartedAt = ref(0)       // 生成开始时间戳(优先用记录的 updateTime,刷新页面后计时不断)
const elapsedSec = ref(0)
let elapsedTimer = null

const elapsedText = computed(() => {
  const s = elapsedSec.value
  const mm = Math.floor(s / 60), ss = s % 60
  return mm > 0 ? `${mm}分${String(ss).padStart(2, '0')}秒` : `${ss}秒`
})

const startElapsed = (startedAt) => {
  if (startedAt) genStartedAt.value = startedAt
  if (!genStartedAt.value) genStartedAt.value = Date.now()
  stopElapsed()
  elapsedTimer = setInterval(() => {
    elapsedSec.value = Math.max(0, Math.floor((Date.now() - genStartedAt.value) / 1000))
  }, 1000)
  elapsedSec.value = Math.max(0, Math.floor((Date.now() - genStartedAt.value) / 1000))
}
const stopElapsed = () => { if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null } }

/** 大纲页标题(任务行名称用;从记录的 outlineJson 解析,解析失败返回空数组) */
const outlineTitles = computed(() => {
  try { return (JSON.parse(record.value?.outlineJson || '[]') || []).map((o) => o.title || '') } catch (e) { return [] }
})

/** 任务行:done ✓ / running ⋯ / pending ○;行数 = 进度总数(兜底大纲页数),页名 = 大纲标题 */
const taskRows = computed(() => {
  const p = genProgress.value
  const total = p?.totalScenes || outlineTitles.value.length || 0
  const done = p?.scenesGenerated ?? 0
  if (!total) {
    // 尚无进度且解析不到大纲(异常兜底):单行不确定态
    return [{ name: '正在连接生成服务…', state: 'running', statusText: '' }]
  }
  const rows = []
  for (let i = 0; i < total; i++) {
    const state = i < done ? 'done' : (i === done ? 'running' : 'pending')
    rows.push({
      name: outlineTitles.value[i] || `第 ${i + 1} 页`,
      state,
      statusText: state === 'done' ? '完成' : state === 'running' ? '生成中…' : '',
    })
  }
  return rows
})

// ==================== 记录加载 + 轮询 ====================
const applyRecord = (data) => {
  record.value = data
  if (!data) { mode.value = 'empty'; pages.value = []; return }
  if (data.status === 1) {
    try { pages.value = JSON.parse(data.contentJson || '[]') } catch (e) { pages.value = [] }
    pageIndex.value = 0
    mode.value = pages.value.length ? 'done' : 'empty'
    stopElapsed()
  } else if (data.status === 0) {
    mode.value = 'generating'
    // 计时起点用记录的 updateTime(生成提交时刻):页面刷新后计时也能接上,不从头算
    const startedAt = data.updateTime ? new Date(data.updateTime.replace(/-/g, '/')).getTime() : 0
    startElapsed(startedAt || Date.now())
    startPolling()
  }
  else if (data.status === 2) { mode.value = 'failed'; stopElapsed() }
  else if (data.status === 3) { mode.value = 'cancelled'; stopElapsed() }
}

const loadRecord = async () => {
  try {
    const res = await getIntroByExperiment(props.experimentId)
    applyRecord(res.data)
  } catch (e) {
    ElMessage.error('查询内容简介失败')
    mode.value = 'empty'
  }
}

const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(async () => {
    try {
      const res = await getIntroByExperiment(props.experimentId)
      const data = res.data
      if (!data) { stopPolling(); mode.value = 'empty'; return }
      if (data.progress) genProgress.value = data.progress // 生成中:更新 Task Rows 进度
      if (data.status === 0) {
        // 生成中也更新 record(语言/大纲/提示词是本次提交时新写入的)——
        // 不更新则生成中界面显示上一轮的旧语言和旧页名(2026-08-28 修复)
        record.value = data
      }
      if (data.status === 1) {
        stopPolling(); applyRecord(data); ElMessage.success('内容简介生成完成')
      } else if (data.status === 2) {
        stopPolling(); applyRecord(data); ElMessage.error('生成失败:' + (data.errorMsg || '未知错误'))
      } else if (data.status === 3) {
        stopPolling(); applyRecord(data)
      }
    } catch (e) { /* 单次轮询失败忽略,下轮再试 */ }
  }, 3000)
}
const stopPolling = () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null } }

onMounted(loadRecord)
onUnmounted(() => {
  stopPolling()
  stopElapsed()
  stopThinkingTimer()
  if (canvasObserver) { canvasObserver.disconnect(); canvasObserver = null }
})

// ==================== 终止 / 删除 / 失败重试 ====================
const doCancel = async () => {
  try { await ElMessageBox.confirm('确认终止本次生成?可回到向导修改后重新生成。', '终止生成', { type: 'warning' }) } catch { return }
  cancelling.value = true
  try {
    await cancelIntro(props.experimentId)
    stopPolling()
    await loadRecord()
    ElMessage.success('已终止')
  } catch (e) { ElMessage.error('终止失败') } finally { cancelling.value = false }
}

const doDelete = () => {
  ElMessageBox.confirm('删除后该实验回到"暂无简介"状态,需重新生成。确认删除?', '删除内容简介', { type: 'warning' })
    .then(async () => {
      try {
        await deleteIntro(record.value.id)
        ElMessage.success('删除成功')
        await loadRecord()
      } catch (e) { ElMessage.error('删除失败') }
    }).catch(() => {})
}

/** 失败态"重新生成":用记录里的大纲+提示词原样重提(不动大纲的快速重试) */
const retryGenerate = async () => {
  let outlines = []
  try { outlines = JSON.parse(record.value?.outlineJson || '[]') } catch (e) {}
  if (!outlines.length) { openWizard('new'); return }
  try {
    await generateIntro({
      experimentId: props.experimentId,
      requirement: record.value?.requirement,
      // 记录里的语言指令(已持久化);老记录可能没有 → 兜底空串,防 null 透传 422
      languageDirective: record.value?.languageDirective || '',
      outlines,
      language: record.value?.language || 'zh-CN'
    })
    genProgress.value = null
    mode.value = 'generating'
    startElapsed(Date.now())
    startPolling()
  } catch (e) { ElMessage.error('提交重试失败') }
}

// ==================== 生成向导 ====================
const wizardVisible = ref(false)
const wizardMode = ref('new') // new | prompt | outline
const wStep = ref(0)          // 0 提示词+语言 → 1 大纲确认
const wRequirement = ref('')
const wLanguage = ref('zh-CN')
const outlines = ref([])
const streaming = ref(false)
const outlineLoading = ref(false)
const submitting = ref(false)
const languageDirective = ref('')
const kpInputs = ref([])

// ---- 思考面板(Beautiful UI Thinking 模式):思考模式开时展示 LLM 推理过程 ----
const thinkingText = ref('')          // 累积的思考增量文本(generator 节流 300ms 批量发)
const thinkingExpanded = ref(false)    // 默认折叠;点击展开看思考正文
const thinkingElapsed = ref(0)         // 思考已用时(秒;timer 每秒更新,computed 直接读)
const thinkingBodyRef = ref(null)      // 展开态的滚动区域引用(自动滚底)
const THINKING_MAX_CHARS = 5000        // 前端截断上限(防超长思考撑爆 DOM)
let thinkingTimer = null

const thinkingElapsedText = computed(() => {
  const s = thinkingElapsed.value
  if (!s) return ''
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${s % 60}s`
})

const startThinkingTimer = () => {
  stopThinkingTimer()
  thinkingElapsed.value = 0
  const t0 = Date.now()
  thinkingTimer = setInterval(() => {
    thinkingElapsed.value = Math.floor((Date.now() - t0) / 1000)
  }, 1000)
}
const stopThinkingTimer = () => { if (thinkingTimer) { clearInterval(thinkingTimer); thinkingTimer = null } }

/** 思考事件回调:追加文本 + 自动滚底(展开态时) */
const onThinkingDelta = (text) => {
  if (!thinkingText.value) startThinkingTimer() // 第一个思考 chunk 到达,启动计时
  thinkingText.value = (thinkingText.value + text).slice(-THINKING_MAX_CHARS) // 截尾保最近
  nextTick(() => {
    if (thinkingBodyRef.value && thinkingExpanded.value) {
      thinkingBodyRef.value.scrollTop = thinkingBodyRef.value.scrollHeight // 自动滚底
    }
  })
}

const resetThinking = () => {
  thinkingText.value = ''
  thinkingExpanded.value = false
  thinkingElapsed.value = 0
  stopThinkingTimer()
}
const outlineListRef = ref(null)
let sortableInst = null

/** 语言版本可选项(step 0 的选择卡片;desc 给用户决策依据,选中态主色描边) */
const LANG_OPTIONS = [
  { value: 'zh-CN', label: '简体中文', desc: '默认,适合国内课堂' },
  { value: 'zh-TW', label: '繁体中文', desc: '港澳台地区使用' },
  { value: 'en', label: 'English', desc: '国际版 / 双语场景' },
]

/**
 * 打开向导(生成闸口:所有生成/重新生成必经此处的大纲确认步骤)
 * - new:空态新增,step0 预填提示词
 * - prompt:提示词修改,step0 预填记录里的提示词+语言(改完重新生成大纲)
 * - outline:大纲修改,直接进 step1 用记录里的大纲(提示词/语言沿用)
 */
const openWizard = (m) => {
  wizardMode.value = m
  if (m === 'outline') {
    wRequirement.value = record.value?.requirement || `请为《${props.experimentName || '本实验'}》生成内容简介`
    wLanguage.value = record.value?.language || 'zh-CN'
    try { outlines.value = JSON.parse(record.value?.outlineJson || '[]') } catch (e) { outlines.value = [] }
    ensureUid(outlines.value)
    languageDirective.value = record.value?.languageDirective || ''
    wStep.value = 1
  } else {
    wRequirement.value = m === 'prompt'
      ? (record.value?.requirement || '')
      : `请为《${props.experimentName || '本实验'}》生成内容简介,面向学生,涵盖实验原理、现象与要点`
    wLanguage.value = (m === 'prompt' && record.value?.language) || 'zh-CN'
    outlines.value = []
    languageDirective.value = ''
    wStep.value = 0
  }
  wizardVisible.value = true
}

const onWizardClosed = () => {
  streaming.value = false
  resetThinking() // 关向导也清思考面板
  destroySortable()
}

/**
 * 修改入口二次确认(双闸的前一闸):内容已存在时,点"提示词修改/大纲修改"先确认再进向导;
 * 后一闸是向导内"确认大纲并生成内容"的覆盖确认 —— 两道确认防误触覆盖已生成内容。
 * 空态(无内容)直接进,无需确认。
 */
const confirmOpenWizard = (m) => {
  if (!record.value) { openWizard(m); return }
  ElMessageBox.confirm('修改后重新生成将覆盖现有内容简介,是否继续?', '内容修改', { type: 'warning' })
    .then(() => openWizard(m)).catch(() => {})
}

// 语言 → 附加到提示词的显式指令(让大纲/正文都按选定语言输出;简体不附加)
// 三语对称硬约束(2026-08-28 修复:之前 zh-CN 是空串 → 依赖 LLM 从提示词推断语言,
// 上一次英文/繁体的残留语境会把简体生成带偏 → 显式注入简体指令,和繁体/英文对齐)
const languageSuffix = () => ({
  'zh-CN': '\n(请全部使用简体中文输出,包括标题、要点与正文。)',
  'zh-TW': '\n(请全部使用繁体中文输出,包括标题、要点与正文。)',
  'en': '\n(Please output ALL content in English, including titles, key points and page body text.)'
}[wLanguage.value] || '')

const doGenerateOutline = async () => {
  if (!wRequirement.value.trim()) { ElMessage.warning('请填写提示词'); return }
  outlines.value = []
  languageDirective.value = ''
  resetThinking() // 清上一轮的思考面板
  streaming.value = true
  outlineLoading.value = false
  wStep.value = 1
  await streamIntroOutline({
    experimentId: props.experimentId,
    requirement: wRequirement.value + languageSuffix(),
    onLanguageDirective: (d) => { languageDirective.value = d },
    onThinking: onThinkingDelta, // 思考模式开时,LLM 推理过程逐段透出
    onOutline: (o) => {
      if (o && o.type === 'slide') {
        outlines.value.push(o)
        // 第一个大纲到达 = 思考结束,LLM 开始产出答案:自动收起面板 + 停计时
        if (thinkingExpanded.value) thinkingExpanded.value = false
        stopThinkingTimer()
      }
    },
    onDone: (finalOutlines, lang) => {
      streaming.value = false
      stopThinkingTimer() // 兜底(万一没有 outline 事件)
      let arr = Array.isArray(finalOutlines) && finalOutlines.length ? finalOutlines : outlines.value
      arr = arr.filter((o) => o && o.type === 'slide')
      outlines.value = arr
      if (lang) languageDirective.value = lang
      if (!outlines.value.length) { ElMessage.warning('大纲为空,请调整提示词后重试'); wStep.value = 0 }
    },
    onError: (e) => {
      streaming.value = false
      ElMessage.error('生成大纲失败: ' + (e.message || e))
      if (!outlines.value.length) wStep.value = 0
    }
  })
}

// ---- 大纲卡片编辑(标题/简介/要点/拖拽/增删,同 AI 课堂向导的交互) ----
const ensureUid = (arr) => arr.forEach((o) => { if (!o._uid) o._uid = Math.random().toString(36).slice(2, 10) })

watch(outlines, (arr) => {
  ensureUid(arr)
  while (kpInputs.value.length < arr.length) kpInputs.value.push('')
  kpInputs.value = kpInputs.value.slice(0, arr.length)
})

watch([() => wStep.value, streaming], ([s, st]) => {
  if (s === 1 && !st) {
    nextTick(() => {
      if (outlineListRef.value && !sortableInst) {
        sortableInst = Sortable.create(outlineListRef.value, {
          handle: '.wiz-drag',
          animation: 150,
          ghostClass: 'wiz-drag-ghost',
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
    destroySortable()
  }
})
const destroySortable = () => { if (sortableInst) { sortableInst.destroy(); sortableInst = null } }

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

// ---- 确认生成(闸口出口:必须用户点确认) ----
const confirmGenerate = () => {
  const hasOld = !!record.value
  ElMessageBox.confirm(
    hasOld ? '将根据该大纲重新生成,原有内容简介会被覆盖。确认开始?' : '将根据该大纲生成内容简介(约 1~3 分钟)。确认开始?',
    '开始生成', { type: 'warning' }
  ).then(() => doGenerate()).catch(() => {})
}

/** 硬指令(用目标语言本身书写,信号更强):覆写 LLM 归纳的 directive,防语言被残留语境带偏 */
const HARD_LANGUAGE_DIRECTIVE = () => ({
  'zh-CN': '全部内容必须使用简体中文输出,包括标题、要点、正文与公式说明。',
  'zh-TW': '全部內容必須使用繁體中文輸出,包括標題、要點、正文與公式說明。',
  'en': 'ALL content MUST be in English, including titles, key points, body text and formula labels.'
}[wLanguage.value] || '')

const doGenerate = async () => {
  const cleanOutlines = outlines.value.map(({ _uid, ...rest }) => rest)
  submitting.value = true
  try {
    await generateIntro({
      experimentId: props.experimentId,
      requirement: wRequirement.value,
      // 双保险第二层:用硬指令覆写 LLM 归纳的 directive——即使大纲被残留语境带偏,
      // 内容生成也会被这条指令拉回用户选择的语言(第一层是提示词后缀,治大纲层)
      languageDirective: HARD_LANGUAGE_DIRECTIVE() || languageDirective.value,
      outlines: cleanOutlines,
      language: wLanguage.value
    })
    wizardVisible.value = false
    genProgress.value = null
    // 乐观更新 record(刚提交的数据自己就知道,不等 3 秒后的首次轮询)——
    // 否则生成中界面出现 → 先闪旧语言 → 3 秒后才变正确(2026-08-28 修复)
    record.value = {
      ...record.value,
      language: wLanguage.value,
      outlineJson: JSON.stringify(cleanOutlines),
      requirement: wRequirement.value,
      status: 0,
    }
    mode.value = 'generating'
    startElapsed(Date.now())
    startPolling()
  } catch (e) {
    ElMessage.error('提交生成失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* ==================== 布局骨架 ==================== */
.intro-mgmt { min-height: 420px; display: flex; flex-direction: column; }

/* 居中容器(空态/生成中/失败共用) */
.intro-center { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px 0; }
.intro-tip { color: #909399; gap: 8px; }

/* ==================== 空态 ==================== */
.intro-empty { text-align: center; }
.intro-empty__icon { font-size: 56px; color: #e6a23c; }
.intro-empty h2 { margin: 16px 0 8px; font-size: 20px; color: #303133; }
.intro-empty p { color: #909399; font-size: 13px; margin-bottom: 24px; }
.intro-empty__btn { border-radius: 8px; }

/* ==================== 生成中(Task Rows 复刻 Beautiful UI) ==================== */
.intro-gen { max-width: 520px; }
.intro-gen__head { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 6px; }
.intro-gen__spinner {
  width: 18px; height: 18px; flex-shrink: 0;
  border-radius: 50%; border: 2px solid #e6e8eb; border-top-color: #409eff;
  animation: intro-rotate 1s linear infinite;
}
@keyframes intro-rotate { to { transform: rotate(360deg); } }
.intro-gen__head h3 { font-size: 17px; color: #303133; margin: 0; }
.intro-gen__elapsed {
  font-size: 12px; color: #6b7280; background: #f5f7fa;
  border-radius: 999px; padding: 2px 10px;
  font-variant-numeric: tabular-nums; /* 计时等宽数字,秒数跳动不晃 */
}
.intro-gen__sub { color: #6b7280; font-size: 13px; text-align: center; margin-bottom: 16px; }

/* 任务行列表:✓ 完成 / ⋯ 生成中(呼吸)/ ○ 待进行 */
.intro-tasks {
  display: flex; flex-direction: column;
  border: 1px solid #ebeef5; border-radius: 10px; background: #fff;
  padding: 6px; margin-bottom: 18px; max-height: 320px; overflow-y: auto;
}
.intro-task {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 8px; font-size: 13px;
}
.intro-task__icon { width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.intro-task__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.intro-task__status { font-size: 12px; flex-shrink: 0; }

/* 完成:绿勾,整行降透明度(已过去时) */
.intro-task.is-done { color: #4b5563; }
.intro-task.is-done .intro-task__icon { color: #67c23a; font-size: 16px; }
.intro-task.is-done .intro-task__status { color: #a8abb2; }

/* 生成中:呼吸圆点 + 主色文字 + 浅蓝底高亮当前行 */
.intro-task.is-running { background: #ecf5ff; color: #303133; }
.intro-task.is-running .intro-task__status { color: #409eff; }
.intro-task__breath {
  width: 9px; height: 9px; border-radius: 50%; background: #409eff;
  animation: intro-blink 1.1s ease-in-out infinite;
}

/* 待进行:灰点,降透明度 */
.intro-task.is-pending { color: #a8abb2; }
.intro-task__dot { width: 7px; height: 7px; border-radius: 50%; background: #dcdfe6; }

/* 终止按钮居中 */
.intro-gen > .el-button { display: flex; margin: 0 auto; }

/* 减少动态偏好:停呼吸/旋转 */
@media (prefers-reduced-motion: reduce) {
  .intro-gen__spinner, .intro-task__breath { animation: none; }
}

/* ==================== 失败 ==================== */
.intro-fail { text-align: center; max-width: 560px; }
.intro-fail__icon { font-size: 52px; color: #f56c6c; }
.intro-fail h3 { margin: 14px 0 8px; font-size: 18px; color: #303133; }
.intro-fail__msg {
  color: #f56c6c; font-size: 13px; background: #fef0f0; border-radius: 6px;
  padding: 10px 14px; margin-bottom: 20px; word-break: break-all; text-align: left;
}
.intro-fail__actions { display: flex; gap: 4px; justify-content: center; }

/* ==================== 翻页查看器 ==================== */
.intro-viewer { flex: 1; display: flex; flex-direction: column; gap: 12px; }
.intro-viewer__bar { display: flex; justify-content: space-between; align-items: center; }
.intro-viewer__meta { display: flex; align-items: center; gap: 10px; }
.intro-viewer__time { color: #909399; font-size: 12px; }

.intro-viewer__canvas {
  flex: 1; min-height: 360px; border: 1px solid #ebeef5; border-radius: 10px;
  background: #fff; padding: 28px 36px 56px; /* 底部留出悬浮胶囊的空间 */
  overflow-y: auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

/* 舞台:画布 + 悬浮胶囊页控制器的定位容器 */
.intro-viewer__stage { position: relative; flex: 1; display: flex; flex-direction: column; }
.intro-page__title {
  font-size: 19px; color: #303133; text-align: center;
  margin: 0 0 6px; padding-bottom: 12px; border-bottom: 1px solid #f0f2f5;
}
/* 画布坐标还原查看态:外层按 1000×562 比例占位裁切;
   内层固定 1000×562 px 原尺寸渲染,transform scale 整体等比缩放(播放器同款) */
.intro-canvas {
  position: relative;
  width: 100%;
  aspect-ratio: 1000 / 562;
  margin-top: 14px;
  background: #fff;
  border-radius: 8px;
  outline: none;
  overflow: hidden;
}

.intro-canvas__inner {
  position: absolute;
  left: 0;
  top: 0;
  width: 1000px;
  height: 562px;
  transform-origin: 0 0;
}

.intro-canvas__el {
  position: absolute;
  line-height: 1.65;
  color: #3b414b;
  word-break: break-word;
}

.intro-canvas__el :deep(p) { margin: 0 0 0.5em; }

/* shape 装饰底板(色块/分隔线/编号色条):纯视觉,不挡交互 */
.intro-canvas__shape {
  position: absolute;
  pointer-events: none;
}

.intro-canvas__el--latex {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 单页编辑 */
/* 编辑态提示条(操作按钮在下方胶囊里,这里只留引导文案) */
.intro-edit-bar {
  margin-bottom: 10px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 6px;
  padding: 6px 14px;
}
.intro-edit-bar__hint { font-size: 12px; color: #409eff; }

/* ---- 悬浮胶囊页控制器(方案C):浏览组‖编辑组,悬浮于画布下缘 ---- */
.intro-pagebar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #ebeef5;
  border-radius: 999px;
  padding: 6px 10px 6px 8px;
  box-shadow: 0 4px 16px rgba(0, 21, 41, 0.1);
  backdrop-filter: blur(6px);
  z-index: 5;
}
.intro-pagebar__nav { display: flex; align-items: center; gap: 6px; }
.intro-pagebar__pageno {
  font-size: 13px; color: #4b5563; min-width: 52px; text-align: center;
  font-variant-numeric: tabular-nums; /* 页码等宽数字,翻页不跳动 */
}
.intro-pagebar__divider { width: 1px; height: 18px; background: #e4e7ed; }
.intro-pagebar__actions { display: flex; align-items: center; gap: 8px; }

/* 胶囊内的文字按钮(编辑本页/取消/保存)做跑道形圆角,与胶囊 999px 几何同构;
   翻页圆钮保持 Element Plus 原生圆形,不受影响 */
.intro-pagebar :deep(.intro-pagebar__btn) { border-radius: 999px; padding: 5px 14px; }

/* 编辑态画布微弱标识(配合胶囊的取消/保存) */
.intro-canvas--editing { box-shadow: 0 0 0 2px #a0cfff inset; border-radius: 8px; }

/* 画布内可编辑文本块:悬停虚线示意、聚焦高亮(点哪儿改哪儿) */
.intro-canvas__el--editable {
  cursor: text;
  outline: 1px dashed transparent;
  outline-offset: 2px;
  border-radius: 4px;
  transition: outline-color 0.15s, background-color 0.15s;
}
.intro-canvas__el--editable:hover { outline-color: #a0cfff; }
.intro-canvas__el--editable:focus {
  outline: 2px solid #409eff;
  background-color: rgba(64, 158, 255, 0.06);
}

/* 编辑态的公式块:可点提示(点击弹窗改源码) */
.intro-canvas__el--clickable { cursor: pointer; }
.intro-canvas__el--clickable:hover {
  outline: 2px dashed #e6a23c;
  outline-offset: 2px;
  border-radius: 4px;
}

/* 公式编辑弹窗的实时预览 */
.latex-live-preview { margin-top: 12px; }
.latex-live-preview__label { font-size: 12px; color: #909399; margin-bottom: 6px; }
.latex-live-preview__formula {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 18px;
}


/* ==================== 向导(设计原则:Element Plus 主色体系内精致化;
     8px 间距韵律;同排按钮同尺寸,主次靠实心/描边区分;过渡 150-250ms) ==================== */

/* ---- 头部:标题 + 步骤指示器 ---- */
.wiz-header { display: flex; align-items: center; justify-content: space-between; }
.wiz-header__title { font-size: 16px; font-weight: 600; color: #303133; }
.wiz-steps { display: flex; align-items: center; gap: 10px; }
.wiz-step-ind { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #a8abb2; }
.wiz-step-ind__dot {
  width: 20px; height: 20px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; border: 1px solid #dcdfe6; background: #fff; color: #a8abb2;
  transition: all 0.2s;
}
.wiz-step-ind.is-active { color: #409eff; font-weight: 500; }
.wiz-step-ind.is-active .wiz-step-ind__dot { border-color: #409eff; color: #409eff; background: #ecf5ff; }
.wiz-step-ind.is-done { color: #67c23a; }
.wiz-step-ind.is-done .wiz-step-ind__dot { border-color: #67c23a; color: #67c23a; background: #f0f9eb; }
.wiz-steps__line { width: 28px; height: 1px; background: #dcdfe6; }

/* ---- 步骤内容骨架 ---- */
.wiz-step { display: flex; flex-direction: column; gap: 16px; }

/* 流程引导(step 0 顶部) */
.wiz-flow-tip {
  font-size: 12px; color: #6b7280;
  background: #f5f7fa; border-radius: 6px; padding: 8px 14px;
}

/* 分组卡片(step 0) */
.wiz-group {
  border: 1px solid #ebeef5; border-radius: 10px; padding: 14px 16px;
  background: #fff; transition: border-color 0.2s;
}
.wiz-group__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.wiz-group__title { font-size: 13px; font-weight: 600; color: #303133; }
.wiz-group__count { font-size: 12px; color: #a8abb2; }
.wiz-group__helper { margin-top: 8px; font-size: 12px; color: #6b7280; }

/* 语言选择卡片 */
.wiz-langs { display: flex; gap: 12px; }
.wiz-lang-card {
  flex: 1; padding: 12px 14px; border: 1px solid #ebeef5; border-radius: 8px;
  cursor: pointer; transition: all 0.2s; background: #fff;
}
.wiz-lang-card:hover { border-color: #a0cfff; }
.wiz-lang-card.is-selected { border-color: #409eff; background: #ecf5ff; box-shadow: 0 0 0 1px #409eff inset; }
.wiz-lang-card__label { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 4px; }
.wiz-lang-card__desc { font-size: 12px; color: #6b7280; }

/* 大纲步骤的语言只读行 */
.wiz-lang-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wiz-lang-row__label { font-size: 13px; color: #606266; }
.wiz-lang-row__tip { font-size: 12px; color: #6b7280; }

/* ---- 思考面板(Beautiful UI Thinking 模式复刻) ---- */
.wiz-thinking {
  border: 1px solid #e4e7ed; border-radius: 8px; background: #fafafa;
  overflow: hidden; margin-bottom: 12px; transition: border-color 0.2s;
}
.wiz-thinking__head {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; cursor: pointer; user-select: none;
  font-size: 13px; color: #6b7280;
}
.wiz-thinking__head:hover { background: #f0f2f5; }
.wiz-thinking__icon { font-size: 14px; }
.wiz-thinking__label { font-weight: 500; }
.wiz-thinking__elapsed {
  font-size: 12px; color: #a8abb2;
  font-variant-numeric: tabular-nums; /* 等宽数字,秒数跳动不晃 */
}
.wiz-thinking__arrow { margin-left: auto; transition: transform 0.2s; color: #c0c4cc; }
.wiz-thinking__arrow.is-open { transform: rotate(90deg); }
.wiz-thinking__body {
  max-height: 180px; overflow-y: auto; padding: 8px 14px 10px;
  font-size: 12.5px; line-height: 1.7; color: #8d939c;
  white-space: pre-wrap; word-break: break-all;
  border-top: 1px dashed #e4e7ed;
}

/* 流式进度条 */
.wiz-stream {
  display: flex; align-items: center; gap: 8px;
  background: #ecf5ff; color: #409eff; border-radius: 6px;
  padding: 8px 14px; font-size: 13px;
}
.wiz-stream__pulse {
  width: 8px; height: 8px; border-radius: 50%; background: #409eff;
  animation: intro-blink 1s ease-in-out infinite;
}
@keyframes intro-blink { 50% { opacity: 0.2; } }

/* 大纲卡片列表 */
.wiz-outline-list { max-height: 56vh; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 2px; }
.wiz-card {
  display: flex; gap: 10px; padding: 12px 14px;
  border: 1px solid #ebeef5; border-radius: 8px; background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  animation: wiz-card-in 0.18s ease-out;
}
.wiz-card:hover { border-color: #a0cfff; box-shadow: 0 2px 8px rgba(0, 21, 41, 0.06); }
@keyframes wiz-card-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.wiz-card__left { display: flex; align-items: center; gap: 6px; }
.wiz-drag { cursor: grab; color: #c0c4cc; transition: transform 0.15s, color 0.15s; }
.wiz-drag:hover { color: #409eff; transform: scale(1.2); }
.wiz-card__order {
  width: 22px; height: 22px; border-radius: 50%; background: #409eff; color: #fff;
  font-size: 12px; display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.wiz-card__live { width: 7px; height: 7px; border-radius: 50%; background: #67c23a; animation: intro-blink 1s infinite; }
.wiz-card__main { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.wiz-card__row { display: flex; align-items: center; gap: 8px; }
.wiz-inline--title { font-weight: 600; }

/* 要点芯片 */
.wiz-kps { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.wiz-kp {
  display: inline-flex; align-items: center; gap: 4px;
  background: #f0f2f5; border-radius: 4px; padding: 2px 8px; font-size: 12px; color: #4b5563;
}
.wiz-kp .el-icon { cursor: pointer; color: #c0c4cc; transition: color 0.15s; }
.wiz-kp .el-icon:hover { color: #f56c6c; }
.wiz-kp-input {
  border: none; outline: none; background: transparent; font-size: 12px;
  width: 150px; border-bottom: 1px dashed #dcdfe6; padding: 2px 4px;
  transition: border-color 0.15s;
}
.wiz-kp-input:focus { border-bottom-color: #409eff; }

/* 大纲空态 */
.wiz-empty {
  text-align: center; color: #6b7280; font-size: 13px;
  padding: 36px 0; border: 1px dashed #ebeef5; border-radius: 8px;
}

.wiz-drag-ghost { opacity: 0.4; }

/* ---- 统一操作区:次级靠左、主 CTA 最右;所有按钮同尺寸(主次靠实心/描边区分) ---- */
.wiz-footer { display: flex; justify-content: space-between; align-items: center; }
.wiz-footer__left { display: flex; gap: 8px; }
.wiz-footer__right { display: flex; gap: 8px; }

/* 减少动态偏好:关闭入场/脉冲动画(可访问性) */
@media (prefers-reduced-motion: reduce) {
  .wiz-card { animation: none; }
  .wiz-stream__pulse, .wiz-card__live { animation: none; }
  .wiz-drag:hover { transform: none; }
}
</style>
