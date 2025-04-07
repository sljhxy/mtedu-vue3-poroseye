import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid) {
  return request({
    url: '/auth/login',
    headers: {
      isToken: false,
      repeatSubmit: false,
      'login_type': 'web_user'
    },
    method: 'post',
    data: { username, password, code, uuid }
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/auth/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 刷新方法
export function refreshToken() {
  return request({
    url: '/auth/refresh',
    method: 'post'
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/system/user/getInfo',
    headers: { 'login_type': 'web_user' },
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'delete'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/code',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}

// 二维码的接口
export function getQRCodeMsg(){
  return request({
    url: '/auth/getQRCode',
    headers: {
      isToken: false
    },
    method: 'post',
    timeout: 20000
  })
}

// 二维码扫码的登录轮询接口
export function checkQRCode(data){
  return request({
    url: '/auth/wxcheck',
    method: 'get',
    params: data
  })
}

