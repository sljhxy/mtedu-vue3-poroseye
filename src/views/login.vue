<template>
  <div class="login">
    <div class="login-container">
      <div class="login-content">
        <!-- 左侧欢迎区域 -->
        <div class="login-left">
          <h2 class="welcome-text">欢迎使用</h2>
          <p class="welcome-desc">智能实验模拟舱云平台致力于为您提供专业、高效的服务</p>
          <div class="welcome-tips">
            <p>安全可靠 · 高效便捷 · 专业服务</p>
          </div>
        </div>
        <!-- 右侧登录表单 -->
        <div class="login-right">
          <h3 class="title">MT后台管理系统</h3>
          
          <!-- 添加登录方式切换tabs -->
          <div class="login-type-tabs">
            <div style="float: left;" 
              :class="['tab-item', { active: loginType === 'account' }]" 
              @click="loginType = 'account'"
            >
              账号登录
            </div>
            <!-- <div 
              :class="['tab-item', { active: loginType === 'wechat' }]" 
              @click="loginType = 'wechat'"
            >
              微信登录
            </div> -->
          </div>

          <!-- 账号密码登录表单 -->
          <el-form
            v-show="loginType === 'account'"
            ref="loginRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                type="text"
                size="large"
                auto-complete="off"
                placeholder="账号"
              >
                <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                size="large"
                auto-complete="off"
                placeholder="密码"
                @keyup.enter="handleLogin"
              >
                <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
              </el-input>
            </el-form-item>
            <el-form-item prop="code" v-if="captchaEnabled" class="code-item">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="验证码"
                @keyup.enter="handleLogin"
              >
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
              <div class="login-code">
                <img :src="codeUrl" @click="getCode" class="login-code-img"/>
              </div>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="loginForm.rememberMe" class="remember-me">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item style="width:100%;">
              <el-button
                :loading="loading"
                size="large"
                type="primary"
                class="login-button"
                @click.prevent="handleLogin"
              >
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
              <div class="register-link" v-if="register">
                <span>还没有账号？</span>
                <router-link class="link-type" :to="'/register'">立即注册</router-link>
              </div>
            </el-form-item>
          </el-form>

          <!-- 微信扫码登录区域 -->
          <div v-show="loginType === 'wechat'" class="wechat-login-container">
            <div class="qrcode-wrapper">
              <div class="qrcode-img">
                <!-- 这里放置微信二维码图片或组件 -->
                <img v-if="qrUrl" :src="qrUrl" alt="微信登录二维码" />
                <div v-else class="qrcode-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                </div>
              </div>
              <div class="qrcode-tip">
                <p>请使用微信扫描二维码登录</p>
                <p class="refresh-tip" v-if="isQrCodeExpired">
                  <span>二维码已过期</span>
                  <!-- <el-button type="primary" link @click="refreshQrCode">点击刷新</el-button> -->
                  <el-button type="primary" link @click="wxlogin">点击刷新</el-button>
                </p>
              </div>


              <div class="wechat-login"> 
            <img class="wechat-icon" src="@/assets/images/weixin_mw.png" alt="微信登录" @click.stop="wxlogin()" />
          </div>

    <el-dialog title="扫码登录" custom-class="bind-dialog" class="new-common-dialog" v-model="bindWxVisible" :close-on-click-modal="false" :close-on-press-escape="false" @close="wxLoginClose" width="320px">
      <div class="qr-code">
        <vue-qr :text="qrUrl" :size="280"></vue-qr>
        <div v-if="bindTimeout" class="tip text-center">
          二维码已失效，请点击
          <i class="el-icon-refresh" @click="wxlogin"></i> 刷新
        </div>
      </div>
    </el-dialog>


            </div>
          </div>
        </div>
      </div>
    </div>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2024 slj All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'
import { ref, watch } from 'vue'


import { updateUserProfile } from "@/api/system/user";
import { getUUid } from '@/api/system/weixin'
import { getToken } from '@/utils/auth'
import { getLoginUUid, bindOpenid, uuidLogin} from '@/api/system/user'
//引入vueQr组件
import VueQr from 'vue-qr'


const userStore = useUserStore()
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);

// 二维码相关
const timer = ref(null)
const bindWxVisible = ref(false)
const bindTimeout = ref(false)
const bindWxLoading = ref(false)
const qrUrl = ref('')



watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
}, { immediate: true });


function wxlogin() {
      // getLoginUUid().then(response => {
      //   console.log(response.uuid)
      //   const uuid = response.uuid
      //   // const redirect_uri = `http://localhost:9201/system/weixin/uuid/bind/openid?uuid=${uuid}`
      //   bindOpenid({
      //     uuid: uuid
      //   }).then(res => {
      //     console.log(res)
      //     const redirect_uri = res.data.redirect_uri
      //     const appid = 'wxf2f18512ae0adebc'
      //     const codeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=snsapi_userinfo&state=123456#wechat_redirect`
      //   qrUrl.value = codeUrl
      //   console.log(qrUrl.value)
      //   bindWxVisible.value = true
      //   let that = this
      //   let counter = 1
      //   timer.value && clearTimeout(this.timer)
      //   timer.value = setInterval(function() {
      //     uuidLogin({
      //       uuid: uuid
      //     })
      //       .then((res) => {
      //         console.log(res)
      //         counter++
      //         console.log(counter)
      //         if (counter === 60) {
      //           clearTimeout(that.timer)
      //           that.bindTimeout = true
      //         }
      //         if (res.status === 1) {
      //           clearTimeout(that.timer)
      //           that.bindWxVisible = false
      //           that.$message({
      //             type: 'success',
      //             message: '登录成功',
      //           })
      //           clearTimeout(that.timer)
      //           console.log("登陆成功后的res")
      //           console.log(res)
      //           that.$store.dispatch("uuidLogin", res)
      //           setTimeout(() => {
      //             that.$router.push({
      //               path: this.redirect || "/"
      //             }).catch(() => {});
      //           }, 1500)
      //         }
      //       })
      //       .catch((err) => {
      //         that.bindWxVisible = false
      //         clearTimeout(that.timer)
      //       })
      //   }, 1000)
      //   })
      // });

    
      getLoginUUid().then(response => {
        console.log(response.uuid)
        const uuid = response.uuid
        const redirect_uri = `http://localhost/dev-api/system/weixin/uuid/bind/openid?uuid=${uuid}`
         const appid = 'wxf2f18512ae0adebc'
        const codeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=snsapi_userinfo&state=123456#wechat_redirect`
        qrUrl.value = codeUrl
        console.log('----------------------------------')
        console.log('----------------------------------')
        console.log(qrUrl.value)
        console.log('----------------------------------')
        console.log(qrUrl.value)
        bindWxVisible.value = true
        let that = this
        let counter = 1
        timer.value && clearTimeout(this.timer)
        timer.value = setInterval(function() {
          uuidLogin({
            uuid: uuid
          })
            .then((res) => {
              console.log(res)
              counter++
              console.log(counter)
              if (counter === 60) {
                clearTimeout(that.timer)
                that.bindTimeout = true
              }
              if (res.status === 1) {
                clearTimeout(that.timer)
                that.bindWxVisible = false
                that.$message({
                  type: 'success',
                  message: '登录成功',
                })
                clearTimeout(that.timer)
                console.log("登陆成功后的res")
                console.log(res)
                that.$store.dispatch("uuidLogin", res)
                setTimeout(() => {
                  that.$router.push({
                    path: this.redirect || "/"
                  }).catch(() => {});
                }, 1500)
              }
            })
            .catch((err) => {
              that.bindWxVisible = false
              clearTimeout(that.timer)
            })
        }, 1000)
      });
    }

function  wxLoginClose() {
  this.timer && clearTimeout(this.timer)
}


function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query;
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur];
          }
          return acc;
        }, {});
        router.push({ path: redirect.value || "/", query: otherQueryParams });
      }).catch(() => {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}



getCode();
getCookie();

// 新增微信登录相关的响应式数据
const loginType = ref('account') // 登录方式：account 或 wechat
const qrCodeUrl = ref('') // 二维码图片URL
const isQrCodeExpired = ref(false) // 二维码是否过期
let qrCodeTimer = null // 二维码检查定时器

// 获取微信登录二维码
const getWechatQrCode = async () => {
  try {
    // 这里调用获取二维码的接口
    // const res = await getWechatQrCode()
    // qrCodeUrl.value = res.qrCodeUrl
    // 模拟获取二维码
    qrCodeUrl.value = 'https://example.com/qrcode'
    isQrCodeExpired.value = false
    startQrCodeCheck()
  } catch (error) {
    console.error('获取二维码失败:', error)
  }
}

// 刷新二维码
const refreshQrCode = () => {
  getWechatQrCode()
}

// 开始检查二维码状态
const startQrCodeCheck = () => {
  clearInterval(qrCodeTimer)
  qrCodeTimer = setInterval(async () => {
    // 这里调用检查扫码状态的接口
    // const res = await checkQrCodeStatus()
    // if (res.isScanned) { 处理扫码成功逻辑 }
    // if (res.isExpired) { 处理二维码过期逻辑 }
  }, 3000)
}

// 监听登录方式切换
watch(loginType, (newVal) => {
  if (newVal === 'wechat') {
    getWechatQrCode()
  } else {
    clearInterval(qrCodeTimer)
  }
})

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  clearInterval(qrCodeTimer)
})
</script>

<style lang='scss' scoped>
.login-code-img {
  height: 50px;
}
.wechat-login {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
}
 
.wechat-icon {
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
  background: linear-gradient(125deg, #003973 0%, #1e4d8a 50%, #005aa7 100%);
  overflow: hidden;
  
  // 添加动态网格效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
      linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridMove 20s linear infinite;
  }

  // 添加光束效果
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: 30%;
    right: 0;
    bottom: 0;
    background: 
      conic-gradient(
        from 220deg at 50% 50%,
        transparent 0deg,
        rgba(255, 255, 255, 0) 140deg,
        rgba(255, 255, 255, 0.15) 160deg,
        rgba(255, 255, 255, 0.3) 180deg,
        rgba(255, 255, 255, 0.15) 200deg,
        rgba(255, 255, 255, 0) 220deg,
        transparent 360deg
      ),
      radial-gradient(circle at 20% 35%, rgba(82, 183, 255, 0.2) 0%, transparent 45%),
      radial-gradient(circle at 75% 44%, rgba(72, 219, 251, 0.2) 0%, transparent 50%);
    transform: rotate(-45deg) scale(1.5);
    filter: blur(30px);
    animation: lightBeam 8s ease-in-out infinite;
  }
}

// 添加光束动画
@keyframes lightBeam {
  0%, 100% {
    opacity: 0.8;
    transform: rotate(-45deg) scale(1.5);
  }
  50% {
    opacity: 1;
    transform: rotate(-45deg) scale(1.8);
  }
}

@keyframes gridMove {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(40px);
  }
}

.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1000px;
  height: 600px;
  
  // 添加登录框光晕效果
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 70%
    );
    transform: translate(-50%, -50%);
    z-index: -1;
    filter: blur(20px);
  }
}

.login-content {
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 100px rgba(255, 255, 255, 0.2);  // 添加外发光效果
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.login-left {
  width: 400px;
  padding: 40px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.95) 0%, rgba(0, 150, 255, 0.95) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;

  .welcome-text {
    font-size: 42px;
    margin-bottom: 20px;
    font-weight: 600;
    letter-spacing: 2px;
  }

  .welcome-desc {
    font-size: 16px;
    opacity: 0.9;
    line-height: 1.8;
    margin-bottom: 40px;
  }

  .welcome-tips {
    font-size: 14px;
    opacity: 0.8;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    
    p {
      line-height: 1.6;
    }
  }
}

.login-right {
  width: 500px;
  padding: 40px;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #333;
  font-size: 24px;
  font-weight: bold;
}

.login-form {
  .el-input {
    height: 40px;
    
    input {
      height: 40px;
      padding-left: 40px;
      border-radius: 8px;
      background-color: #f5f7fa;
      border: 1px solid #e4e7ed;
      transition: all 0.3s;
      
      &:focus {
        background-color: white;
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
      }
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 12px;
    color: #909399;
  }

  .code-item {
    display: flex;
    align-items: center;
    gap: 20px;

    .el-input {
      flex: 1;
      max-width: calc(100% - 140px);
    }
  }
}

.remember-me {
  color: #606266;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 45px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #007aff 0%, #0096ff 100%);
  border: none;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24,144,255,0.4);
  }
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
  
  .link-type {
    color: #1890ff;
    margin-left: 8px;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.login-code {
  width: 120px;
  height: 40px;
  margin-left: auto;
  
  img {
    height: 40px;
    width: 120px;
    cursor: pointer;
    border-radius: 4px;
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
  z-index: 1;
}

// 新增的样式
.login-type-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  
  .tab-item {
    padding: 10px 20px;
    margin: 0 10px;
    cursor: pointer;
    position: relative;
    color: #606266;
    transition: all 0.3s;
    
    &.active {
      color: #007aff;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 2px;
        background: #007aff;
        border-radius: 2px;
      }
    }
    
    &:hover {
      color: #007aff;
    }
  }
}

.wechat-login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  
  .qrcode-wrapper {
    text-align: center;
    
    .qrcode-img {
      width: 200px;
      height: 200px;
      margin: 0 auto 20px;
      border: 1px solid #eee;
      padding: 10px;
      border-radius: 8px;
      
      img {
        width: 100%;
        height: 100%;
      }
      
      .qrcode-loading {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        font-size: 24px;
      }
    }
    
    .qrcode-tip {
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
      
      .refresh-tip {
        margin-top: 10px;
        color: #909399;
        
        .el-button {
          padding: 0;
          margin-left: 5px;
        }
      }
    }
  }
}
</style>
