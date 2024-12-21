<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户昵称" prop="nickName">
         <el-input v-model="form.nickName" maxlength="30" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
         <el-input v-model="form.phonenumber" maxlength="11" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
         <el-input v-model="form.email" maxlength="50" />
      </el-form-item>
      <el-form-item label="性别">
         <el-radio-group v-model="form.sex">
            <el-radio value="0">男</el-radio>
            <el-radio value="1">女</el-radio>
         </el-radio-group>
      </el-form-item>

      <el-form-item label="微信">
      <span class="mr10">{{form.wxnickname || '未绑定'}}</span>
      <el-button v-if="form.openid == '' || form.openid == null" :loading="bindloading" size="medium" type="primary" class="btn" @click.stop="wxBind()">绑 定</el-button>
      <el-button v-else :loading="bindloading" size="medium" type="primary" class="btn" @click.stop="unBind()">解
        绑</el-button>
    </el-form-item>
 
    <el-dialog title="绑定微信" custom-class="bind-dialog" class="new-common-dialog" v-model="bindWxVisible" :close-on-click-modal="false" :close-on-press-escape="false" @close="wxLoginClose" width="320px">
      <div class="qr-code">
        <vue-qr :text="qrUrl" :size="280"></vue-qr>
      </div>
    </el-dialog>

      <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
      </el-form-item>

      
   </el-form>
</template>

<script setup>
import { updateUserProfile } from "@/api/system/user";
import { getUUid } from '@/api/system/weixin'
import { getToken } from '@/utils/auth'
import vueQr from 'vue-qr'
const props = defineProps({
  user: {
    type: Object
  }
});

const { proxy } = getCurrentInstance();


const timer = ref(null);
const bindWxVisible = ref(false);
const bindloading = ref(false);
const qrUrl = ref('');



const form = ref({});
const rules = ref({
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phonenumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
});

function wxBind() {
      let token = getToken()
      console.log(token)
       const appid = 'wxf2f18512ae0adebc'
      const key = JSON.parse(atob(token.split('.')[1]))['user_key'];
      const redirect_uri = `http://localhost/dev-api/system/weixin/bind-openid?key=${key}` //回调地址
      const codeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=snsapi_userinfo&state=123456#wechat_redirect`
      qrUrl.value = codeUrl
      console.log('========================================')
      console.log(token)
      console.log(key)
      console.log(redirect_uri)
      console.log(qrUrl.value)

      console.log('========================================')
      bindWxVisible.value = true
      let that = this
      timer.value = setInterval(function() {
        getUUid({
          uuid: key
        })
          .then((res) => {
            console.log(res)
            if (res.status === 1) {
              that.bindWxVisible = false
              that.form.openid = res.openid
              that.form.wxnickname = res.wxnickname
              that.$message({
                type: 'success',
                message: '操作成功',
              })
              clearTimeout(timer.value)
            }
          })
          .catch((err) => {
            clearTimeout(that.timer)
          })
      }, 1000)
    };
  function wxLoginClose() {
      timer.value && clearTimeout(timer.value)
    };





/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      updateUserProfile(form.value).then(response => {
        proxy.$modal.msgSuccess("修改成功");
        props.user.phonenumber = form.value.phonenumber;
        props.user.email = form.value.email;
      });
    }
  });
};

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage();
};

// 回显当前登录用户信息
watch(() => props.user, user => {
  if (user) {
    form.value = { nickName: user.nickName, phonenumber: user.phonenumber, email: user.email, sex: user.sex,  openid: user.openid };
  }
},{ immediate: true });
</script>
