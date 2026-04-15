import request from '@/utils/request'

// 获取模型列表
export function modelList() {
  // 模拟返回数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: [
          { id: 1, name: 'gpt-3.5-turbo', description: 'GPT-3.5 Turbo模型', maxTokens: 4096 },
          { id: 2, name: 'gpt-4', description: 'GPT-4模型', maxTokens: 8192 },
          { id: 3, name: 'claude-2', description: 'Claude 2模型', maxTokens: 100000 },
          { id: 4, name: 'llama-2', description: 'Llama 2模型', maxTokens: 4096 }
        ]
      })
    }, 300)
  })
}