import request from '@/utils/request'
import { getToken } from '@/utils/auth'

/**
 * 实验-内容简介(AI 生成纯 PPT)相关接口(对接后端 mtedu-glxt /experimentContentIntro)
 *
 * 流程(ppt 模式两步 API):
 *   提示词+语言 → 流式生成大纲(仅讲解页)→ 用户确认/编辑 → 提交生成(异步)
 *   → 轮询 byExperiment 看 status(0生成中/1完成/2失败/3已取消)→ 翻页查看/单页编辑。
 * 产物是页数组 JSON(后端直接入库,不上 OSS、无播放器)。
 */

/**
 * 流式生成内容简介大纲(SSE):用 fetch + ReadableStream(不走 axios,axios 不支持流式读)。
 * 大纲逐条通过 onOutline 回调追加,完成 onDone,出错 onError。
 * 后端把 maic(content_mode=ppt)的 SSE 裸透传,事件结构同 AI 课堂:
 * languageDirective / outline(index) / retry / done / error / :heartbeat。
 * @param {Object} p { experimentId, requirement, onOutline, onLanguageDirective, onThinking, onDone, onError }
 */
export async function streamIntroOutline({ experimentId, requirement, onOutline, onLanguageDirective, onThinking, onDone, onError }) {
  const baseURL = import.meta.env.VITE_APP_BASE_API || '/dev-api'
  let resp
  try {
    resp = await fetch(`${baseURL}/glxt/experimentContentIntro/outline-stream`, {
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
  // 流关闭后处理 buffer 里剩余的最后一个块(done 事件后可能没尾部 \n\n)
  if (buffer.trim()) processBlock(buffer)
}

// 提交生成(异步):{experimentId, requirement, languageDirective, outlines, language} → 立即返回
// 提交后用 getIntroByExperiment 轮询 status
export function generateIntro(data) {
  return request({
    url: '/glxt/experimentContentIntro/generate',
    method: 'post',
    data: data
  })
}

// 终止生成:cancel 后端线程 + 标中止(status=3),前端回流程页改大纲重来
export function cancelIntro(experimentId) {
  return request({
    url: '/glxt/experimentContentIntro/cancel/' + experimentId,
    method: 'post'
  })
}

// 按实验查内容简介(富内容:status/requirement/outlineJson/contentJson/language/errorMsg)
// data 为 null 表示该实验还没有简介;轮询状态也走这里
export function getIntroByExperiment(experimentId) {
  return request({
    url: '/glxt/experimentContentIntro/byExperiment/' + experimentId,
    method: 'get'
  })
}

// 轻量投影(APP/外部):{language, updateTime, pages:[{order,title,textBlocks[],latexBlocks[]}]}
export function getIntroProjection(experimentId) {
  return request({
    url: '/glxt/experimentContentIntro/app/' + experimentId,
    method: 'get'
  })
}

// 单页编辑后整份保存:{experimentId, pages:[{order,title,elements,background}]}
export function updateIntroContent(data) {
  return request({
    url: '/glxt/experimentContentIntro/content',
    method: 'put',
    data: data
  })
}

// 删除内容简介(软删;删后回空态可重新新增)
export function deleteIntro(ids) {
  return request({
    url: '/glxt/experimentContentIntro/' + ids,
    method: 'delete'
  })
}
