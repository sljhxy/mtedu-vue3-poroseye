<template>
  <div class="bind-student">
    <div class="bind-container">
      <div class="bind-content">
        <!-- 左侧区域 -->
        <div class="bind-left">
          <h2 class="welcome-text">绑定学号</h2>
          <p class="welcome-desc">绑定您的学号以使用完整功能</p>
          <div class="welcome-tips">
            <p>安全可靠 · 高效便捷 · 专业服务</p>
          </div>
        </div>
        <!-- 右侧表单 -->
        <div class="bind-right">
          <h3 class="title">绑定学号</h3>
          <p class="subtitle">请绑定您的学号以使用完整功能</p>

          <el-form ref="bindFormRef" :model="bindForm" :rules="bindRules" class="bind-form">
            <el-form-item prop="schoolType">
              <el-select v-model="bindForm.schoolType" placeholder="请选择学校类型" size="large" style="width: 100%" @change="handleSchoolTypeChange">
                <el-option label="普教" value="1" />
                <el-option label="职教" value="2" />
              </el-select>
            </el-form-item>

            <el-form-item prop="schoolId">
              <el-select v-model="bindForm.schoolId" placeholder="请选择学校" size="large" style="width: 100%" :disabled="!bindForm.schoolType" filterable>
                <el-option
                  v-for="school in schoolList"
                  :key="school.id"
                  :label="school.schoolName"
                  :value="school.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item prop="userNo">
              <el-input
                v-model="bindForm.userNo"
                size="large"
                placeholder="请输入学号"
                auto-complete="off"
              >
                <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="bindForm.password"
                type="password"
                size="large"
                placeholder="请输入密码"
                auto-complete="off"
                show-password
              >
                <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
              </el-input>
            </el-form-item>

            <el-form-item style="width:100%;">
              <el-button
                :loading="loading"
                size="large"
                type="primary"
                class="bind-button"
                @click.prevent="handleBind"
              >
                <span v-if="!loading">绑 定</span>
                <span v-else>绑 定 中...</span>
              </el-button>
            </el-form-item>

            <div class="skip-link" @click="handleSkip">
              跳过，稍后绑定
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <div class="el-login-footer">
      <span>Copyright © 2018-2024 slj All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import useSmsUserStore from '@/store/modules/smsUser'
import request from '@/utils/request'

const router = useRouter()
const smsUserStore = useSmsUserStore()

const bindFormRef = ref(null)
const loading = ref(false)
const schoolList = ref([])

const bindForm = ref({
  schoolType: '',
  schoolId: null,
  userNo: '',
  password: ''
})

const bindRules = {
  schoolType: [{ required: true, trigger: 'change', message: '请选择学校类型' }],
  schoolId: [{ required: true, trigger: 'change', message: '请选择学校' }],
  userNo: [{ required: true, trigger: 'blur', message: '请输入学号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入密码' }]
}

// 获取学校列表
function loadSchoolList(schoolType) {
  schoolList.value = []
  if (!schoolType) return
  request({
    url: '/glxt/schoolList',
    method: 'get',
    params: { schoolType }
  }).then(res => {
    schoolList.value = res.data || []
  })
}

function handleSchoolTypeChange(val) {
  bindForm.value.schoolId = null
  loadSchoolList(val)
}

// 获取当前appUserId
async function getAppUserId() {
  const res = await request({
    url: '/glxt/appUser/getInfo',
    headers: { login_type: 'app_user' },
    method: 'get'
  })
  return res.user.id
}

async function handleBind() {
  bindFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const appUserId = await getAppUserId()
      await smsUserStore.doBindStudent({
        appUserId,
        schoolType: bindForm.value.schoolType,
        userNo: bindForm.value.userNo,
        password: bindForm.value.password
      })
      ElMessage.success('绑定成功')
      router.push('/')
    } catch (err) {
      ElMessage.error(err.msg || err.message || '绑定失败')
    } finally {
      loading.value = false
    }
  })
}

function handleSkip() {
  router.push('/')
}

onMounted(() => {
  // 如果不是app_user直接跳走
  if (smsUserStore.loginType !== 'app_user') {
    router.replace('/')
  }
})
</script>

<style lang="scss" scoped>
.bind-student {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
  background: linear-gradient(125deg, #003973 0%, #1e4d8a 50%, #005aa7 100%);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image:
      linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
      linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridMove 20s linear infinite;
  }
}

@keyframes gridMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(40px); }
}

.bind-container {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1000px;
  height: 560px;
}

.bind-content {
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.bind-left {
  width: 400px;
  padding: 40px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.95) 0%, rgba(0, 150, 255, 0.95) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;

  .welcome-text {
    font-size: 36px;
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
    p { line-height: 1.6; }
  }
}

.bind-right {
  width: 500px;
  padding: 40px;

  .title {
    margin: 0 auto 8px auto;
    text-align: center;
    color: #333;
    font-size: 24px;
    font-weight: bold;
  }

  .subtitle {
    text-align: center;
    color: #909399;
    font-size: 14px;
    margin-bottom: 30px;
  }
}

.bind-form {
  .el-input, .el-select {
    height: 40px;

    :deep(.el-input__wrapper) {
      border-radius: 8px;
      background-color: #f5f7fa;
      box-shadow: 0 0 0 1px #e4e7ed inset;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }

      &.is-focus {
        background-color: white;
        box-shadow: 0 0 0 1px #1890ff inset, 0 0 0 2px rgba(24,144,255,0.2);
      }
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 12px;
    color: #909399;
  }
}

.bind-button {
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

.skip-link {
  text-align: center;
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #1890ff;
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
</style>
