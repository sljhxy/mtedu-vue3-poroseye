import request from '@/utils/request'
import { he } from 'element-plus/es/locales.mjs'

// 获取路由
export const getRouters = () => {
  return request({
    url: '/system/menu/getRouters',
    headers: {      'login_type': 'web_user' },
    method: 'get'
  })
}