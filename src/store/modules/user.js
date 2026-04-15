import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: [],
      schoolType: '',
      schoolId: null
    }),
    actions: {
      // 登录
      login(userInfo) {
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        const schoolCode = userInfo.schoolCode || ''
        const expectedSchoolId = userInfo.expectedSchoolId || null
        return new Promise((resolve, reject) => {
          login(username, password, code, uuid, schoolCode, expectedSchoolId).then(res => {
            let data = res.data
            setToken(data.access_token)
            this.token = data.access_token
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            const user = res.user
            const avatar = (user.avatar == "" || user.avatar == null) ? defAva : user.avatar;

            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.userId
            this.name = user.userName
            this.avatar = avatar
            this.schoolType = user.schoolType || ''
            this.schoolId = (user.dept && user.dept.schoolId) ? user.dept.schoolId : null
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          logout(this.token).then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            this.schoolType = ''
            this.schoolId = null
            removeToken()
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      }
    },
    // 微信uuid登录
    uuidLogin({
      commit
    }, res) {
      setToken(res.token.access_token)
      commit('SET_TOKEN', res.token.access_token)
      setExpiresIn(res.token.expires_in)
      commit('SET_EXPIRES_IN', res.token.expires_in)
    },
  })

export default useUserStore
