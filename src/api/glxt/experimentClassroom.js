import request from '@/utils/request'
import { getToken } from '@/utils/auth'

/**
 * 实验-AI课堂内容 相关接口(2026-08-28 多内容版,对接后端 mtedu-glxt /experimentClassroom)
 *
 * 核心变化:一个实验一份 → 按 学校×教材三连×教师×语言 管理多份内容列表。
 * 流程:
 *   列表页(byExperiment 查数组)→ 新增内容(向导:学校+教材+提示词+语言 → 流式大纲 → 确认生成)
 *   → 轮询列表看状态(0生成中/1成功/2失败/3已取消)→ 预览/提示词修改/大纲修改/删除
 *
 * 数据权限:
 *   教师 → 前端传 schoolId = userStore.schoolId(本校)
 *   管理员 → schoolId 不传(看全部),可选筛学校
 */

// ==================== 列表查询 ====================

/**
 * 按实验id查全部课堂内容(多内容,返回数组按创建时间倒序)。
 * 每条含:status/ossZipUrl/stageName/outlineJson/requirement/language + 联表字段
 * (userName老师/schoolName学校/subjectName科目/textbookName教材版本)。
 * data 为空数组表示该实验还没有任何AI课堂内容。
 */
export function listClassroomByExperiment(experimentId) {
  return request({
    url: '/glxt/experimentClassroom/byExperiment/' + experimentId,
    method: 'get'
  })
}

/**
 * 分页列表(管理端"AI课堂内容"全局列表页用)。
 * 参数:pageNum/pageSize + 可选筛选(schoolId/subjectId/textbookLibraryId/volumeId/status)。
 * 后端 Service 自动做数据权限(教师=本校,管理员=全部)。
 */
export function listClassroom(query) {
  return request({
    url: '/glxt/experimentClassroom/list',
    method: 'get',
    params: query
  })
}

// 按记录id查详情(含 ossZipUrl 预览地址、requirement/outlineJson 修改回显)
export function getClassroomById(id) {
  return request({
    url: '/glxt/experimentClassroom/' + id,
    method: 'get'
  })
}

// ==================== 生成大纲 ====================

// 生成大纲(同步):{experimentId, requirement} → {languageDirective, outlines}
export function generateOutline(data) {
  return request({
    url: '/glxt/experimentClassroom/outline',
    method: 'post',
    data: data
  })
}

/**
 * 流式生成大纲(SSE):用 fetch + ReadableStream(不走 axios,axios 不支持流式读)。
 * 大纲逐条通过 onOutline 回调追加,完成 onDone,出错 onError。
 * 事件:languageDirective / thinking(思考模式开时) / outline(index) / retry / done / error。
 * @param {Object} p { experimentId, requirement, onOutline, onLanguageDirective, onThinking, onDone, onError }
 */
export async function streamOutline({ experimentId, requirement, onOutline, onLanguageDirective, onThinking, onDone, onError }) {
  const baseURL = import.meta.env.VITE_APP_BASE_API || '/dev-api'
  let resp
  try {
    resp = await fetch(`${baseURL}/glxt/experimentClassroom/outline-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken(),
        'login_type': 'web_user'
      },
      body: JSON.stringify({ experimentId, requirement })
    })
  } catch (e) {
    onError?.(new Error('连接失败: ' + e.message))
    return
  }
  if (!resp.ok || !resp.body) {
    onError?.(new Error('HTTP ' + resp.status))
    return
  }
  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finished = false

  /** 处理一个 SSE 事件块(可能多行 data:) */
  const processBlock = (block) => {
    const dataLines = block
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).replace(/^ /, ''))
    if (!dataLines.length) return // 跳过 :heartbeat 注释等非 data 行
    try {
      const evt = JSON.parse(dataLines.join('\n'))
      if (evt.type === 'languageDirective') onLanguageDirective?.(evt.data)
      else if (evt.type === 'thinking') onThinking?.(evt.data)
      else if (evt.type === 'outline') onOutline?.(evt.data, evt.index)
      else if (evt.type === 'done') { onDone?.(evt.outlines, evt.languageDirective); finished = true }
      else if (evt.type === 'error') { onError?.(new Error(evt.error || '生成失败')); finished = true }
      // retry 事件忽略(继续等下一轮流式)
    } catch (e) {
      /* 单个事件解析失败,跳过等下一个完整块 */
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    // SSE 事件以空行(\n\n)分隔
    let idx
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      processBlock(buffer.slice(0, idx))
      buffer = buffer.slice(idx + 2)
      if (finished) return
    }
  }
  // 流关闭后,处理 buffer 里剩余的最后一个块(maic 的 done 事件后可能没尾部 \n\n,会留在 buffer)
  if (buffer.trim()) processBlock(buffer)
}

// ==================== 生成内容(异步) ====================

/**
 * 提交生成(异步,多内容版):带维度参数。
 * @param {Object} data - {experimentId, schoolId, subjectId, textbookLibraryId, volumeId,
 *   requirement, languageDirective, language, outlines, existingRecordId}
 * existingRecordId:重新生成(提示词修改/大纲修改/失败重试)时传已有记录id;不传=新增。
 * 后端逻辑:同教师同组合 → 覆盖更新;不同教师同组合 → 新建并存。
 */
export function generateScenes(data) {
  return request({
    url: '/glxt/experimentClassroom/generate',
    method: 'post',
    data: data
  })
}

// 终止生成(按记录id,多内容版不再按 experimentId)
export function cancelClassroom(classroomId) {
  return request({
    url: '/glxt/experimentClassroom/cancel/' + classroomId,
    method: 'post'
  })
}

// ==================== 修改/删除 ====================

// 修改(Service 校验:仅创建者+管理员)
export function updateClassroom(data) {
  return request({
    url: '/glxt/experimentClassroom',
    method: 'put',
    data: data
  })
}

// 删除(软删;Service 校验:仅创建者+管理员)
export function deleteClassroom(ids) {
  return request({
    url: '/glxt/experimentClassroom/' + ids,
    method: 'delete'
  })
}
