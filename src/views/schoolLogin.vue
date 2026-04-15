<template>
  <div class="school-login">
    <!-- 动态渐变色块 -->
    <div class="bg-blobs">
      <div class="blob blob-blue"></div>
      <div class="blob blob-indigo"></div>
      <div class="blob blob-amber"></div>
      <div class="blob blob-violet"></div>
    </div>

    <!-- 毛玻璃卡片 -->
    <div class="login-card">
      <!-- 左侧品牌区 -->
      <div class="brand-side">
        <div class="brand-noise"></div>
        <div class="brand-content">
          <!-- Logo + 学校名称 同行 -->
          <div class="brand-header" v-if="schoolStore.resolved">
            <div class="brand-logo-wrap" v-if="schoolStore.schoolLogo">
              <div class="logo-glow"></div>
              <img :src="schoolStore.schoolLogo" class="brand-logo" alt="学校Logo"/>
            </div>
            <div class="brand-logo-wrap placeholder-logo" v-else>
              <div class="logo-glow"></div>
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M8 14L24 6L40 14V34L24 42L8 34V14Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>
                <path d="M24 18L16 22V30L24 34L32 30V22L24 18Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
                <circle cx="24" cy="26" r="3" fill="rgba(255,255,255,0.45)"/>
                <path d="M24 6V18" stroke="rgba(255,255,255,0.25)" stroke-width="0.6"/>
                <path d="M24 34V42" stroke="rgba(255,255,255,0.25)" stroke-width="0.6"/>
              </svg>
            </div>
            <div class="brand-header-text">
              <h1 class="brand-school-name">{{ schoolStore.schoolName || '智能实验模拟舱云平台' }}</h1>
              <span class="brand-tag">教师登录入口</span>
            </div>
          </div>
          <!-- 未解析时显示默认标题 -->
          <div class="brand-header" v-else>
            <div class="brand-logo-wrap placeholder-logo">
              <div class="logo-glow"></div>
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M8 14L24 6L40 14V34L24 42L8 34V14Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>
                <path d="M24 18L16 22V30L24 34L32 30V22L24 18Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
                <circle cx="24" cy="26" r="3" fill="rgba(255,255,255,0.45)"/>
                <path d="M24 6V18" stroke="rgba(255,255,255,0.25)" stroke-width="0.6"/>
                <path d="M24 34V42" stroke="rgba(255,255,255,0.25)" stroke-width="0.6"/>
              </svg>
            </div>
            <div class="brand-header-text">
              <h1 class="brand-school-name">智能实验模拟舱云平台</h1>
              <span class="brand-tag">教师登录入口</span>
            </div>
          </div>
          <div class="brand-divider"></div>
          <p class="brand-desc">动手做实验，科学看得见</p>
        </div>

        <!-- K12 物化生实验主题 SVG 装饰 -->
        <div class="brand-illustration">
          <svg viewBox="0 0 320 160" fill="none">
            <!-- ===== 物理：棱镜分光 ===== -->
            <g opacity="0.85">
              <path d="M30 120L58 62L86 120Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" stroke-linejoin="round"/>
              <line x1="6" y1="86" x2="44" y2="86" stroke="rgba(255,255,255,0.35)" stroke-width="1.2" stroke-linecap="round"/>
              <line x1="74" y1="86" x2="120" y2="66" stroke="rgba(255,200,200,0.4)" stroke-width="0.7" stroke-linecap="round"/>
              <line x1="74" y1="90" x2="120" y2="80" stroke="rgba(255,220,150,0.4)" stroke-width="0.7" stroke-linecap="round"/>
              <line x1="74" y1="94" x2="120" y2="94" stroke="rgba(200,255,200,0.4)" stroke-width="0.7" stroke-linecap="round"/>
              <line x1="74" y1="98" x2="120" y2="108" stroke="rgba(150,200,255,0.4)" stroke-width="0.7" stroke-linecap="round"/>
              <line x1="74" y1="102" x2="120" y2="120" stroke="rgba(200,170,255,0.4)" stroke-width="0.7" stroke-linecap="round"/>
            </g>

            <!-- ===== 化学：锥形瓶 + 滴管 ===== -->
            <g opacity="0.85">
              <path d="M145 48 L145 72 L120 114C118 118 121 126 127 126L173 126C179 126 182 118 180 114L155 72L155 48Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.28)" stroke-width="0.8"/>
              <path d="M128 104 Q150 96 172 104 L180 114C182 118 179 126 173 126L127 126C121 126 118 118 120 114Z" fill="rgba(255,255,255,0.05)"/>
              <line x1="140" y1="48" x2="160" y2="48" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" stroke-linecap="round"/>
              <circle cx="148" cy="94" r="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" stroke-width="0.4"/>
              <circle cx="157" cy="86" r="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="0.4"/>
              <circle cx="152" cy="76" r="2.5" fill="rgba(255,255,255,0.1)"/>
              <circle cx="162" cy="100" r="2" fill="rgba(255,255,255,0.07)"/>
              <circle cx="142" cy="108" r="1.5" fill="rgba(255,255,255,0.06)"/>
              <circle cx="156" cy="114" r="1.8" fill="rgba(255,255,255,0.05)"/>
              <rect x="148" y="28" width="4" height="18" rx="1.5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
              <ellipse cx="150" cy="26" rx="5.5" ry="3.5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" stroke-width="0.5"/>
              <ellipse cx="150" cy="47" rx="1.2" ry="2" fill="rgba(255,255,255,0.2)"/>
            </g>

            <!-- ===== 生物：DNA 双螺旋 ===== -->
            <g opacity="0.8">
              <path d="M230 35 C240 50 250 50 260 35 C270 20 280 20 290 35 C300 50 310 50 320 35" stroke="rgba(255,255,255,0.35)" stroke-width="1" fill="none" stroke-linecap="round"/>
              <path d="M230 50 C240 35 250 35 260 50 C270 65 280 65 290 50 C300 35 310 35 320 50" stroke="rgba(255,255,255,0.35)" stroke-width="1" fill="none" stroke-linecap="round"/>
              <line x1="240" y1="48" x2="240" y2="37" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
              <line x1="250" y1="37" x2="250" y2="48" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
              <line x1="265" y1="37" x2="265" y2="48" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
              <line x1="275" y1="48" x2="275" y2="37" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
              <line x1="285" y1="48" x2="285" y2="37" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
              <line x1="295" y1="37" x2="295" y2="48" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
              <line x1="305" y1="48" x2="305" y2="37" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
              <line x1="315" y1="37" x2="315" y2="48" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
            </g>

            <!-- ===== 物理：牛顿摆 ===== -->
            <g opacity="0.6" transform="translate(110, 8)">
              <line x1="0" y1="0" x2="44" y2="0" stroke="rgba(255,255,255,0.25)" stroke-width="1" stroke-linecap="round"/>
              <line x1="6" y1="0" x2="6" y2="22" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
              <line x1="15" y1="0" x2="15" y2="22" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
              <line x1="24" y1="0" x2="24" y2="22" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
              <line x1="33" y1="0" x2="33" y2="22" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
              <line x1="40" y1="0" x2="40" y2="22" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
              <circle cx="6" cy="25" r="3.5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.15)" stroke-width="0.4"/>
              <circle cx="15" cy="25" r="3.5" fill="rgba(255,255,255,0.15)"/>
              <circle cx="24" cy="25" r="3.5" fill="rgba(255,255,255,0.15)"/>
              <circle cx="33" cy="25" r="3.5" fill="rgba(255,255,255,0.15)"/>
              <circle cx="40" cy="25" r="3.5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.15)" stroke-width="0.4"/>
            </g>

            <!-- ===== 生物：显微镜 ===== -->
            <g opacity="0.55" transform="translate(195, 70)">
              <ellipse cx="16" cy="56" rx="15" ry="5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" stroke-width="0.6"/>
              <rect x="13" y="14" width="6" height="42" rx="1" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
              <rect x="11" y="2" width="10" height="14" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="0.6"/>
              <rect x="13" y="32" width="6" height="7" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
              <rect x="4" y="39" width="24" height="3.5" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
            </g>

            <!-- 底部特性标签 -->
            <g transform="translate(0, 138)">
              <rect x="0" y="0" width="80" height="20" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
              <text x="40" y="13.5" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.5)" font-family="system-ui, sans-serif">物理实验</text>
              <rect x="90" y="0" width="80" height="20" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
              <text x="130" y="13.5" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.5)" font-family="system-ui, sans-serif">化学实验</text>
              <rect x="180" y="0" width="80" height="20" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
              <text x="220" y="13.5" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.5)" font-family="system-ui, sans-serif">生物实验</text>
            </g>

            <!-- 散落装饰点 -->
            <circle cx="18" cy="32" r="1" fill="rgba(255,255,255,0.3)"/>
            <circle cx="125" cy="130" r="1.2" fill="rgba(255,255,255,0.2)"/>
            <circle cx="195" cy="24" r="0.8" fill="rgba(255,255,255,0.25)"/>
            <circle cx="280" cy="80" r="1" fill="rgba(255,255,255,0.2)"/>
          </svg>
        </div>

        <!-- 底部口号 -->
        <div class="brand-footer">
          <!-- <p class="brand-desc">动手做实验，科学看得见</p> -->
          <div class="brand-features">
            <span class="feature-dot"></span>
            <span class="feature-text">覆盖 K12 全学段</span>
            <span class="feature-dot"></span>
            <span class="feature-text">物化生同步实验</span>
            <span class="feature-dot"></span>
            <span class="feature-text">安全虚拟操作</span>
          </div>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="form-side">
        <!-- 错误状态 -->
        <div v-if="resolveError" class="error-state">
          <div class="error-illustration">
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="48" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
              <circle cx="60" cy="60" r="36" fill="#DBEAFE" opacity="0.5"/>
              <rect x="52" y="36" width="16" height="20" rx="3" fill="#93C5FD" opacity="0.6"/>
              <path d="M42 56 L60 48 L78 56 L78 76C78 80 74 84 60 84C46 84 42 80 42 76Z" fill="#BFDBFE" stroke="#93C5FD" stroke-width="1"/>
              <circle cx="60" cy="68" r="3" fill="#2563EB"/>
              <line x1="60" y1="72" x2="60" y2="76" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 class="error-title">未找到该学校</h3>
          <p class="error-desc">{{ resolveError }}</p>
          <p class="error-hint">请检查链接是否正确，或联系管理员获取正确的登录地址</p>
          <router-link to="/login" class="error-back-btn">
            <svg viewBox="0 0 16 16" fill="none" class="btn-icon-left">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            返回主页登录
          </router-link>
        </div>

        <!-- 加载状态 -->
        <div v-else-if="!schoolStore.resolved" class="loading-state">
          <div class="loading-spinner">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="16" stroke="#E2E8F0" stroke-width="3" fill="none"/>
              <path d="M20 4A16 16 0 0 1 36 20" stroke="#2563EB" stroke-width="3" fill="none" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.8s" repeatCount="indefinite"/>
              </path>
            </svg>
          </div>
          <p class="loading-text">正在加载学校信息...</p>
        </div>

        <!-- 登录表单 -->
        <template v-else>
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">请登录您的教师账号</p>
          </div>

          <el-form
            ref="loginRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                size="large"
                placeholder="请输入账号"
              >
                <template #prefix>
                  <svg viewBox="0 0 20 20" fill="none" class="input-icon-svg">
                    <circle cx="10" cy="7" r="3.5" stroke="currentColor" stroke-width="1.3"/>
                    <path d="M3 18.5C3 14.5 6.13 11.5 10 11.5C13.87 11.5 17 14.5 17 18.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                size="large"
                placeholder="请输入密码"
                show-password
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <svg viewBox="0 0 20 20" fill="none" class="input-icon-svg">
                    <rect x="4.5" y="9.5" width="11" height="7.5" rx="2" stroke="currentColor" stroke-width="1.3"/>
                    <path d="M7.5 9.5V6.5C7.5 4.84 8.62 3.5 10 3.5C11.38 3.5 12.5 4.84 12.5 6.5V9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                    <circle cx="10" cy="13.25" r="1" fill="currentColor"/>
                  </svg>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="code" v-if="captchaEnabled">
              <div class="captcha-row">
                <el-input
                  v-model="loginForm.code"
                  size="large"
                  placeholder="请输入验证码"
                  @keyup.enter="handleLogin"
                >
                  <template #prefix>
                    <svg viewBox="0 0 20 20" fill="none" class="input-icon-svg">
                      <rect x="3" y="6" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.3"/>
                      <path d="M7 9.5V12.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                      <path d="M10 9.5V12.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                      <path d="M13 10V12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                    </svg>
                  </template>
                </el-input>
                <img :src="codeUrl" @click="getCode" class="captcha-img" title="点击刷新"/>
              </div>
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            </div>

            <el-button
              :loading="loading"
              size="large"
              type="primary"
              class="submit-btn"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>

            <p class="login-hint">首次登录？请联系管理员获取账号</p>
          </el-form>
        </template>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="login-footer">
      <span>Copyright &copy; 2018-2024 slj All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import { resolveSchoolCode } from "@/api/schoolResolve";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'
import useSchoolContextStore from '@/store/modules/schoolContext'
import { ref, onMounted } from 'vue'

const userStore = useUserStore()
const schoolStore = useSchoolContextStore()
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: "",
  schoolCode: "",
  expectedSchoolId: null
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
const captchaEnabled = ref(true);
const resolveError = ref("");

onMounted(async () => {
  const code = route.params.code;
  if (!code) {
    resolveError.value = "缺少学校编码";
    return;
  }

  try {
    const res = await resolveSchoolCode(code);
    if (res.code === 200) {
      schoolStore.setSchoolInfo(res.data);
      loginForm.value.schoolCode = code;
      loginForm.value.expectedSchoolId = res.data.id;
      getCode();
      getCookie();
    } else {
      resolveError.value = res.msg || "学校不存在";
    }
  } catch (error) {
    resolveError.value = "学校不存在或编码无效";
  }
});

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      userStore.login(loginForm.value).then(() => {
        router.push({ path: "/" });
      }).catch(() => {
        loading.value = false;
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
  if (username !== undefined) {
    loginForm.value.username = username;
  }
  if (password !== undefined) {
    loginForm.value.password = decrypt(password);
  }
  if (rememberMe !== undefined) {
    loginForm.value.rememberMe = Boolean(rememberMe);
  }
}
</script>

<style lang="scss" scoped>
/* ========== 页面背景 + 动态色块 ========== */
.school-login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(125deg, #003973 0%, #1e4d8a 50%, #005aa7 100%);
  position: relative;
  overflow: hidden;
}

.bg-blobs {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
}

.blob-blue {
  width: 480px;
  height: 480px;
  top: -15%;
  right: -8%;
  background: rgba(82, 183, 255, 0.15);
  animation: blobFloat1 14s ease-in-out infinite;
}

.blob-indigo {
  width: 380px;
  height: 380px;
  bottom: -10%;
  left: -6%;
  background: rgba(72, 219, 251, 0.12);
  animation: blobFloat2 18s ease-in-out infinite;
}

.blob-amber {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 25%;
  background: rgba(82, 183, 255, 0.1);
  animation: blobFloat4 20s ease-in-out infinite;
}

.blob-violet {
  width: 320px;
  height: 320px;
  top: 20%;
  left: 30%;
  background: rgba(100, 149, 237, 0.12);
  animation: blobFloat3 16s ease-in-out infinite;
}

@keyframes blobFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-30px, 20px) scale(1.05); }
  66% { transform: translate(15px, -15px) scale(0.95); }
}

@keyframes blobFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -25px) scale(1.08); }
  66% { transform: translate(-15px, 10px) scale(0.96); }
}

@keyframes blobFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -15px) scale(1.08); }
}

@keyframes blobFloat4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  40% { transform: translate(-20px, 15px) scale(1.1); }
  80% { transform: translate(10px, -10px) scale(0.95); }
}

/* ========== 毛玻璃卡片 ========== */
.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  width: 940px;
  min-height: 560px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 120px rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

/* ========== 左侧品牌区 ========== */
.brand-side {
  width: 400px;
  background: linear-gradient(160deg, rgba(37, 99, 235, 0.92) 0%, rgba(79, 70, 229, 0.92) 100%);
  padding: 48px 40px 36px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.3) 100%);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.15);
  }
}

/* 微噪点纹理 */
.brand-noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  pointer-events: none;
}

.brand-content {
  position: relative;
  z-index: 1;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.brand-header-text {
  flex: 1;
  min-width: 0;
}

.brand-logo-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: visible;
  flex-shrink: 0;

  .logo-glow {
    position: absolute;
    inset: -6px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.08);
    filter: blur(8px);
  }
}

.brand-logo {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.25);
}

.placeholder-logo {
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 28px;
    height: 28px;
  }
}

.brand-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.4px;
  line-height: 1;
  margin-top: 6px;
}

.brand-school-name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.brand-divider {
  width: 320px;
  height: 3px;
  background: linear-gradient(90deg, #F59E0B, #FBBF24);
  border-radius: 2px;
  margin: 0 0 20px;
}

.brand-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.6;
  letter-spacing: 0.3px;
}

.brand-illustration {
  position: relative;
  z-index: 1;
  margin-top: auto;
  opacity: 0.85;

  svg {
    width: 100%;
    height: auto;
  }
}

.brand-footer {
  position: relative;
  z-index: 1;
  margin-top: 20px;
}

.brand-features {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.feature-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.6);

  &:first-child {
    display: none;
  }
}

.feature-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.3px;
}

/* ========== 右侧表单区 ========== */
.form-side {
  flex: 1;
  padding: 52px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 36px;
}

.form-title {
  font-size: 26px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 8px;
  letter-spacing: -0.3px;
}

.form-subtitle {
  font-size: 14px;
  color: #94A3B8;
  margin: 0;
}

/* ========== 表单控件 ========== */
.login-form {
  :deep(.el-form-item) {
    margin-bottom: 22px;
  }

  :deep(.el-input__wrapper) {
    padding: 6px 14px;
    border-radius: 12px;
    background: rgba(248, 250, 252, 0.8);
    box-shadow: 0 0 0 1px #E2E8F0 inset;
    transition: all 0.25s ease;

    &:hover {
      box-shadow: 0 0 0 1px #CBD5E1 inset;
      background: rgba(255, 255, 255, 0.9);
    }

    &.is-focus {
      box-shadow: 0 0 0 2px #2563EB inset;
      background: #fff;
    }
  }

  :deep(.el-input__inner) {
    height: 42px;
    font-size: 14px;
    color: #1E293B;

    &::placeholder {
      color: #94A3B8;
    }
  }
}

.input-icon-svg {
  width: 18px;
  height: 18px;
  color: #94A3B8;
  margin-right: 2px;
  flex-shrink: 0;
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  :deep(.el-input) {
    flex: 1;
  }
}

.captcha-img {
  height: 50px;
  width: 120px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid #E2E8F0;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
}

.form-options {
  margin-bottom: 28px;

  :deep(.el-checkbox__label) {
    color: #64748B;
    font-size: 13px;
  }

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #2563EB;
    border-color: #2563EB;
  }
}

.submit-btn {
  width: 100%;
  height: 46px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
  border: none;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(37, 99, 235, 0.4), 0 0 0 3px rgba(37, 99, 235, 0.08);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
  }
}

.login-hint {
  text-align: center;
  font-size: 13px;
  color: #94A3B8;
  margin: 16px 0 0;
}

/* ========== 错误状态 ========== */
.error-state {
  text-align: center;
  padding: 24px 0;
}

.error-illustration {
  margin-bottom: 24px;

  svg {
    width: 100px;
    height: 100px;
  }
}

.error-title {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 8px;
}

.error-desc {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 8px;
}

.error-hint {
  font-size: 13px;
  color: #94A3B8;
  margin: 0 0 28px;
  line-height: 1.5;
}

.error-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 28px;
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 12px;
  color: #2563EB;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(37, 99, 235, 0.1);
    border-color: rgba(37, 99, 235, 0.3);
  }

  .btn-icon-left {
    width: 14px;
    height: 14px;
    margin-right: 6px;
  }
}

/* ========== 加载状态 ========== */
.loading-state {
  text-align: center;
  padding: 48px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 18px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.loading-text {
  font-size: 14px;
  color: #fff;
  margin: 0;
}

/* ========== 底部版权 ========== */
.login-footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  padding: 16px 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  z-index: 1;
}

/* ========== 响应式 ========== */
@media screen and (max-width: 768px) {
  .school-login {
    padding: 16px;
  }

  .login-card {
    flex-direction: column;
    width: 100%;
    max-width: 420px;
    min-height: auto;
    border-radius: 20px;
  }

  .brand-side {
    width: 100%;
    padding: 32px 28px 24px;

    .brand-school-name {
      font-size: 22px;
    }
  }

  .brand-illustration {
    display: none;
  }

  .form-side {
    padding: 28px;
  }

  .blob-1, .blob-2, .blob-3 {
    filter: blur(60px);
  }
}

/* ========== 减弱动画偏好 ========== */
@media (prefers-reduced-motion: reduce) {
  .blob {
    animation: none !important;
  }
}
</style>
