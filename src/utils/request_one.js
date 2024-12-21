import axios from 'axios';
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { getToken } from '@/utils/auth'
const app = createApp({});
app.use(ElementPlus);

// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000
})

// request拦截器
service.interceptors.request.use(config => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  // 是否需要防止数据重复提交
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params);
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const requestSize = Object.keys(JSON.stringify(requestObj)).length; // 请求数据大小
    const limitSize = 5 * 1024 * 1024; // 限制存放数据5M
    if (requestSize >= limitSize) {
      console.warn(`[${config.url}]: ` + '请求数据大小超出允许的5M限制，无法进行防重复提交验证。')
      return config;
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url;                // 请求地址
      const s_data = sessionObj.data;              // 请求数据
      const s_time = sessionObj.time;              // 请求时间
      const interval = 1000;                       // 间隔时间(ms)，小于此时间视为重复提交
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = '数据正在处理，请勿重复提交';
        console.warn(`[${s_url}]: ` + message)
        return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

const request = function (loadtip, query) {
  let loading;

  if (loadtip) {
    loading = app.config.globalProperties.$loading({
      lock: false,
      text: '正在加载中…',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.5)'
    });
  }
  return axios.request(query)
    .then(res => {
      if (loadtip) {
        loading.close();
      }
      if (res.data.code === 401) {
        app.config.globalProperties.$$router.push({ path: '/index' });
        return Promise.reject(res.data);
      } else if (res.data.code === 500) {
        return Promise.reject(res.data);
      } else if (res.data.code === 501) {
        return Promise.reject(res.data);
      } else if (res.data.code === 502) {
        app.config.globalProperties.$$router.push({ path: '/index' });
        return Promise.reject(res.data);
      } else {
        return Promise.resolve(res.data);
      }
    })
    .catch(e => {
      if (loadtip) {
        loading.close();
      }
      app.config.globalProperties.$message.error(e.message);
      return Promise.reject(e.message);
    });
}

const post = function (url, params) {
  const query = {
    baseURL: import.meta.env.VITE_APP_BASE_API + '/glxt',
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'application/json', 'request-ajax': true }
  };
  return request(false, query);
}

const postWithLoadTip = function (url, params) {
  const query = {
    baseURL: process.env.VUE_APP_URL,
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'application/json', 'request-ajax': true }
  };
  return request(true, query);
}

const postWithOutLoadTip = function (url, params) {
  const query = {
    baseURL: process.env.VUE_APP_URL,
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'application/json', 'request-ajax': true }
  };
  return request(false, query);
}

const get = function (url, params) {
  const query = {
    baseURL: process.env.VUE_APP_URL,
    url: url,
    method: 'get',
    withCredentials: true,
    timeout: 30000,
    params: params,
    headers: { 'request-ajax': true }
  };
  return request(false, query);
}

const form = function (url, params) {
  const query = {
    baseURL: process.env.VUE_APP_URL,
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'multipart/form-data', 'request-ajax': true }
  };
  return request(false, query);
}

export {
  post,
  postWithLoadTip,
  postWithOutLoadTip,
  get,
  form
};