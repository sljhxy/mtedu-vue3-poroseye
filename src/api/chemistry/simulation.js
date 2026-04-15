import request from '@/utils/request'

/**
 * 模拟化学反应（完整）
 * 接口地址: POST /chemistry/simulation/simulate
 */
export async function simulateReaction(data) {
  return request({
    url: '/glxt/chemistry/simulation/simulate',
    method: 'post',
    data: data
  })
}

/**
 * 查找匹配的方程式
 */
export async function findEquations(data) {
  return request({
    url: '/glxt/chemistry/simulation/find-equations',
    method: 'post',
    data: data
  })
}

/**
 * 获取反应关联的知识点
 */
export function getReactionKnowledge(equationId) {
  return request({
    url: '/glxt/chemistry/simulation/knowledge/' + equationId,
    method: 'get'
  })
}

/**
 * 根据物质搜索可能的反应
 */
export function searchReactionsBySubstances(substanceIds) {
  return request({
    url: '/glxt/chemistry/simulation/search',
    method: 'post',
    data: { substanceIds }
  })
}
