// import { getBindStatus, bindStudent } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const useSmsUserStore = defineStore(
  'smsUser',
  {
    state: () => ({
      loginType: '', // 'app_user' or 'web_user'
      bindUserType: null,
      schoolId: null,
      bindUserId: null,
      appUserId: null
    }),
    actions: {
      // 设置loginType（登录成功后由login页面调用）
      setLoginType(type) {
        this.loginType = type
      },

      // 设置token（短信/微信登录成功后调用）
      setToken(token) {
        setToken(token)
      },

      // 查询绑定状态
      // checkBindStatus() {
      //   return new Promise((resolve, reject) => {
      //     getBindStatus().then(res => {
      //       this.bindUserType = res.bindUserType || null
      //       this.schoolId = res.schoolId || null
      //       this.bindUserId = res.bindUserId || null
      //       resolve(res)
      //     }).catch(error => {
      //       reject(error)
      //     })
      //   })
      // },

      // 绑定学号
      // doBindStudent(data) {
      //   return new Promise((resolve, reject) => {
      //     bindStudent(data).then(res => {
      //       this.bindUserType = data.schoolType === '1' ? 'base' : 'vocal'
      //       this.schoolId = null // 绑定后会由后端返回，下次getInfo时更新
      //       resolve(res)
      //     }).catch(error => {
      //       reject(error)
      //     })
      //   })
      // },

      // 退出时清除状态
      clearState() {
        this.loginType = ''
        this.bindUserType = null
        this.schoolId = null
        this.bindUserId = null
        this.appUserId = null
        removeToken()
      }
    }
  })

export default useSmsUserStore
