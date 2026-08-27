import request from '@/utils/request'
import { getToken } from '@/utils/auth'

/**
 * 实验-AI课堂内容 相关接口(对接后端 mtedu-glxt /experimentClassroom)
 *
 * 流程:生成大纲(同步)→ 前端编辑 → 提交生成(异步)→ 轮询 byExperiment → 预览。
 * 导出 zip + 上传 OSS 是后端 generate 内部自动做的,前端不用单独调。
 */

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
 * 事件:languageDirective / outline(index) / retry / done / error。
 * @param {Object} p { experimentId, requirement, onOutline, onLanguageDirective, onDone, onError }
 */
export async function streamOutline({ experimentId, requirement, onOutline, onLanguageDirective, onDone, onError }) {
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

// 生成内容(异步):{experimentId, requirement, languageDirective, outlines} → 立即返回
// 提交后用 getClassroomByExperiment 轮询 status(0生成中/1成功/2失败)
export function generateScenes(data) {
  return request({
    url: '/glxt/experimentClassroom/generate',
    method: 'post',
    data: data
  })
}

// 终止生成:cancel 旧线程 + 标中止,前端回流程页改大纲重新生成
export function cancelClassroom(experimentId) {
  return request({
    url: '/glxt/experimentClassroom/cancel/' + experimentId,
    method: 'post'
  })
}

// 按实验id查课堂内容(轮询状态 + 预览URL + 是否已生成判断)
// 返回 data 为 null 表示该实验还没生成过;有则含 status/ossZipUrl/stageName/outlineJson 等
export function getClassroomByExperiment(experimentId) {
  return request({
    url: '/glxt/experimentClassroom/byExperiment/' + experimentId,
    method: 'get'
  })
}
