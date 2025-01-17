<template>
  <div class="page-container">
    <!-- 学校信息展示区域 -->
    <div v-if="hasSchools" class="school-content">
      <div class="school-card">
        <!-- 学校基本信息 -->
        <div class="card-header">
          <div class="school-title">
            <img :src="formData.logo || '/path/to/default-logo.png'" class="school-logo" />
            <div class="title-content">
              <div class="title-row">
                <h3>{{ formData.schoolName }}</h3>
                <el-button type="primary" link class="edit-btn" @click="handleEdit(schoolId? schoolId : toSchoolMagentSchooId)">
                  <el-icon><Edit /></el-icon>
                  编辑学校信息
                </el-button>
              </div>
              <span class="status-tag" :class="{ 'active': formData.isActive }">
                {{ Boolean(formData.isActive) ? '已生效' : '未生效' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 学校详细信息 -->
        <div class="card-body">
          <!-- 地址信息 -->
          <div class="info-section">
            <div class="section-title">
              <el-icon><Location /></el-icon>
              <span>地理位置</span>
            </div>
            <div class="info-content">
              <div class="info-item">
                <label>所在地区：</label>
                <span>{{ getLocationLabelTmp(formData.province) }}-{{ getLocationLabelTmp(formData.city) }}-{{ getLocationLabelTmp(formData.district) }}</span>
              </div>
              <div class="info-item">
                <label>详细地址：</label>
                <span>{{ formData.detailAddress }}</span>
              </div>
            </div>
          </div>

          <!-- 联系方式 -->
          <div class="info-section">
            <div class="section-title">
              <el-icon><User /></el-icon>
              <span>联系方式</span>
            </div>
            <div class="info-content">
              <div class="info-item">
                <label>联系人：</label>
                <span>{{ formData.contactName }}</span>
              </div>
              <div class="info-item">
                <label>联系电话：</label>
                <span>{{ formData.contactPhone }}</span>
              </div>
              <div class="info-item">
                <label>学校网址：</label>
                <span>{{ formData.website }}</span>
              </div>
            </div>
          </div>

          <!-- 教育信息 -->
          <div class="info-section">
            <div class="section-title">
              <el-icon><School /></el-icon>
              <span>教育信息</span>
            </div>
            <div class="info-content">
              <div class="info-item">
                <label>类&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;型：</label>
                <span>
                  <dict-tag :options="mt_school_type" :value="formData.educationLevel"/>
                </span>
              </div>
              <div class="info-item">
                <label>是否有学院：</label>
                <span>{{ formData.isCollege == '1' ? '是' : '否' }}</span>
              </div>
              <div class="info-item">
                <label>是&nbsp;&nbsp;否&nbsp;有&nbsp;系：</label>
                <span>{{ formData.isSystem == '1' ? '是' : '否' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态提示 -->
    <div v-else class="empty-state">
      <div class="welcome-content">
        <el-icon class="welcome-icon"><School /></el-icon>
        <h2>欢迎来到【职教-学校】配置管理</h2>
        <p>开始创建您的学校相关信息</p>
        <el-button type="primary" class="add-button" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加学校
        </el-button>
      </div>
    </div>

    <!-- 化弹框布局 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学校' : '新增学校'"
      width="670px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      class="school-dialog"
    >
      <el-form 
        ref="schoolFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="school-form"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon><School /></el-icon>
            <span>基本信息</span>
          </div>
          <div class="form-content">
            <el-form-item label="学校logo:" class="logo-item">
              <image-upload v-model="formData.logo"/>
            </el-form-item>
            <el-form-item label="学校名称:" prop="schoolName">
              <el-input v-model="formData.schoolName" placeholder="请输入学校名称"  @input="generate(formData.schoolName)"/>
            </el-form-item>
          </div>
        </div>

        <!-- 地址信息 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon><Location /></el-icon>
            <span>地址信息</span>
          </div>
          <div class="form-content">
            <el-form-item label="所在地区:" prop="province">
              <div class="address-group">
                <el-select v-model="formData.province" placeholder="省份" @change="handleProvinceChange">
                  <el-option v-for="item in areaList" :key="item.id" :label="item.label" :value="item.id" />
                </el-select>
                <!-- {{ formData.province }} -->
                <el-select v-model="formData.city" placeholder="城市" @change="handleCityChange">
                  <el-option v-for="item in cityList" :key="item.id" :label="item.label" :value="item.id" />
                </el-select>
                <!-- {{ formData.city }} -->
                <el-select v-model="formData.district" placeholder="区/县">
                  <el-option v-for="item in districtList" :key="item.id" :label="item.label" :value="item.id" />
                </el-select>
                <!-- {{ formData.district }} -->
              </div>
            </el-form-item>
            <el-form-item label="详细地址:" prop="detailAddress">
              <el-input v-model="formData.detailAddress" placeholder="请输入详细地址" />
            </el-form-item>
          </div>
        </div>

        <!-- 联系方式 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon><User /></el-icon>
            <span>联系方式</span>
          </div>
          <div class="form-content">
            <div class="form-row">
              <el-form-item label="联系人:" prop="contactName" class="half-width">
                <el-input v-model="formData.contactName" placeholder="请输入姓名" />
              </el-form-item>
              <el-form-item label="联系电话:" prop="contactPhone" class="half-width">
                <el-input v-model="formData.contactPhone" placeholder="请输入电话" />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="学校网址:" prop="website" class="full-width">
                <el-input v-model="formData.website" placeholder="请输入学校网址" />
              </el-form-item>
            </div>
          </div>
        </div>

        <!-- 教育信息 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon><Reading /></el-icon>
            <span>教育信息</span>
          </div>
          <div class="form-content">
            <div class="form-row">
              <el-form-item label="教育类型:" prop="isCollege" class="full-width">
                <div class="education-group">
                  <el-select v-model="formData.educationLevel" placeholder="职教类型" disabled>
                    <el-option v-for="item in educationLevels" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                  <!-- {{ formData.educationLevel }} -->
                </div>
              </el-form-item>
            </div>
            <el-form-item label="是否有学院:" class="full-width" prop="isCollege">
              <el-radio-group v-model="formData.isCollege">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="是否有系:" class="full-width" prop="isSystem">
              <el-radio-group v-model="formData.isSystem">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <div class="form-row">
              <el-form-item label="是否生效:" class="full-width" prop="isActive">
                <el-radio-group v-model="formData.isActive">
                  <el-radio :value="true">是</el-radio>
                  <el-radio :value="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 底部导航 -->
    <div class="page-footer">
        <div class="footer-content">
          <div class="button-group">
            <el-button class="nav-button prev-button" @click="handleBack">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <div class="button-divider"></div>
            <el-button class="nav-button next-button" type="primary" @click="handleNext">
              下一步
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted} from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const { proxy } = getCurrentInstance();
//字典引入 学校类型、 学段、 学制
const { mt_school_type, mt_vocal_education_type, mt_vocal_education_system_type} = proxy.useDict('mt_school_type', 'mt_vocal_education_type', 'mt_vocal_education_system_type');
const router = useRouter()
//引入区域接口
import { getAreaTree } from "@/api/glxt/area";

//引入学校相关接口
import { vocalListSchool, addSchool, updateSchool, getSchool, delSchool, checkSchool} from "@/api/glxt/vocal_school";

//学校网址接口引入
import { generateLetter } from '@/api/glxt/base_school'


// 添加路由相关引入
import { useRoute } from 'vue-router'
import { get } from '@vueuse/core';
const route = useRoute()
const emit = defineEmits(['next-step', 'addSchoolId'])


const schoolFormRef = ref(null)
const schoolId = ref(null)

// 接收父组件传递的学校ID
const props = defineProps({
  toSchoolMagentSchooId: {
    type: Number,
    required: true
  }
})

const formData = ref({
  id: null,
  logo: '',
  schoolName: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  contactName: '',
  contactPhone: '',
  website: '',
  educationLevel: '2',//类型 职教
  educationLevelName: '',//类型名称
  isCollege: '0',//是否有学院
  isSystem: '1',//是否有系
  isActive: true
})

const rules = {
  schoolName: [
    { required: true, message: '请输入学校名称', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // 如果是编辑模式，跳过该校验
        if (isEdit.value) {
          callback()
          return
        }
        // 只在新增模下验证学校是否存在
        checkSchool(value).then((r) => {
          if (r.data > 0) {
            callback('该学校已存在')
          } else {
            callback()
          }
        })
      },
      trigger: 'blur'
    }
  ],
  province: [
    { required: true, message: '请选择省份', trigger: 'change' }
  ],
  // city: [
  //   { required: true, message: '请选择城市', trigger: 'change' }
  // ],
  // district: [
  //   { required: true, message: '请选择区', trigger: 'change' }
  // ],
  // detailAddress: [
  //   { required: true, message: '请输入详细地址', trigger: 'blur' }
  // ],
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  website: [
    { required: true, message: '请输入学校网址', trigger: 'blur' }
  ],
  isCollege: [
    { required: true, message: '是否有学院', trigger: 'change' }
  ],
  isSystem: [
    { required: true, message: '是否有系', trigger: 'change' }
  ],
  isActive: [
    { required: true, message: '是否生效', trigger: 'change' }
  ]
}




// 下一步
const handleNext = async () => {
  if (!hasSchools.value) {
    ElMessage.warning('请先添加学校信息再进行下一步操作')
    return
  }
  try {
    emit('next-step', formData.value)
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}


// 职教类型
const educationLevels = ref([
{ value: '2', label: '职教' },
])

// 处理返回按钮点击
const handleBack = () => {
  router.push({
    path: '/glxt/vocal_school/vocal_school',
    query: { 
      _t: Date.now() // 添加时间戳参数强制刷新列表
    }
  })
}



//============================================start============================================
// 临时区域数据--获取详情中区域的逻辑
const areaListTmp = ref([])    // 省份列表
const cityListTmp = ref([])    // 城市列表
const districtListTmp = ref([]) // 区列表
const allAreaDataTmp = ref({}) // 存储完整的区域数据

// 获取地址标签的方法
const getLocationLabelTmp = (id) => {
  if (!id) return '';
  
  // 递归查找区域数据
  const findArea = (areas, targetId) => {
    for (const area of areas || []) {
      if (area.id === targetId) {
        return area;
      }
      const found = findArea(area.children, targetId);
      if (found) return found;
    }
    return null;
  };

  const area = findArea([allAreaDataTmp.value], id);
  return area ? area.label : '';
};

// 初始化取所有区域数据
const initAreaDataTmp = async () => {
  try {
    const response = await getAreaTree();
    if (response.data && response.data.rows) {
      // 保存完整的区域数据
      allAreaDataTmp.value = response.data.rows[0];
      
      // 获取学校列表后，再根据实际数据设置对应的省市区列表
      const updateAreaLists = (province, city) => {
        // 设置省份列表
        areaListTmp.value = allAreaDataTmp.value.children || [];
        
        // 找到对应的省份数据
        const provinceData = areaListTmp.value.find(p => p.id === province);
        if (provinceData) {
          // 设置城市列表
          cityListTmp.value = provinceData.children || [];
          
          // 找到对应的城市数据
          const cityData = cityListTmp.value.find(c => c.id === city);
          if (cityData) {
            // 设置区县列表
            districtListTmp.value = cityData.children || [];
          }
        }
      };

      // 监听学校列表数据变化
      watch(formData, (newList) => {
        if (newList && newList.length > 0) {
          // 使用第一条数据的省市信息初始化
          const firstSchool = newList[0];
          if (firstSchool.province && firstSchool.city) {
            updateAreaLists(firstSchool.province, firstSchool.city);
          }
        }
      }, { immediate: true });
    }
  } catch (error) {
    ElMessage.error('获取区域数据失败');
  }
}

//============================================end============================================

// 控制弹框显示
const dialogVisible = ref(false)
// 是否有学校数据
const hasSchools = ref(false)


// 编辑-区域数据
const areaList = ref([])    // 省份列表
const cityList = ref([])    // 城市列表
const districtList = ref([]) // 区列表
const allAreaData = ref({}) // 存储完整的区域数据

// 初始化取所有区域数据
const initAreaData = async () => {
  try {
    const response = await getAreaTree()
    if (response.data && response.data.rows) {
      // 保存完整的区域数据
      allAreaData.value = response.data.rows[0]
      // 设置省份列表
      areaList.value = response.data.rows[0].children || []
      // 设置城市列表
      cityList.value = areaList.value[0].children || []
      // 设置区县列表
      districtList.value = cityList.value[0].children || []
    }
  } catch (error) {
    ElMessage.error('获取区域数据失败')
  }
}

// 处理省份选择
const handleProvinceChange = async (provinceId) => {
  if (!provinceId) return;
  
  // 重置城市和区县
  formData.value.city = '';
  formData.value.district = '';
  cityList.value = [];
  districtList.value = [];

  // 加载城市列表
  const selectedProvince = areaList.value.find(province => province.id === provinceId);
  if (selectedProvince && selectedProvince.children) {
    cityList.value = selectedProvince.children;
  }
}

// 处理城市选择
const handleCityChange = async (cityId) => {
  if (!cityId) return;
  
  // 重置区县
  formData.value.district = '';
  districtList.value = [];

  // 加载区县列表
  const selectedCity = cityList.value.find(city => city.id === cityId);
  if (selectedCity && selectedCity.children) {
    districtList.value = selectedCity.children;
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  initAreaData()
  initAreaDataTmp()
  console.log('新增后接收到的学校id为: ', props.toSchoolMagentSchooId)

  //新增后接收的学校id不为空，则调用getSchoolData方法获取学校数据
  //解决新增学校后到下一步后，返回学校组件时不显示刚刚新增的学校数据BUG
  if (props.toSchoolMagentSchooId) {
    getSchoolData(props.toSchoolMagentSchooId)
    hasSchools.value = true
  }

})


// 暴露方法给父组件使用
defineExpose({
  formData,
  schoolFormRef
})

// 初始化省份选择
handleProvinceChange()



// 表单重置
function reset() {
  formData.value = {
    id: null,
    schoolName: null,
    province: null,
    city: null,
    district: null,
    detailAddress: null,
    contactName: null,
    contactPhone: null,
    website: null,
    educationLevel: null,
    isCollege: null,
    isSystem: null,
    isActive: false
  };
  proxy.resetForm("schoolFormRef");
}


// 添加编辑状态标识
const isEdit = ref(false)

// 修改编辑按钮处理函数
const handleEdit = async (id) => {
  reset();//表单重置
  try {
    // 确保区域数据已加载
    if (areaList.value.length === 0) {
      await initAreaData()
    }

    const response = await getSchool(id);
    formData.value = {
      ...response.data,
      // 将 isActive 转换为布尔值
      isActive: response.data.isActive === 'true' || response.data.isActive === true,
      educationLevel: '2',  // 固定为职教
      isCollege: response.data.isCollege == '1' ? true : false,
      isSystem: response.data.isSystem == '1' ? true : false,
      // 设置省市区的值
      province: response.data.province,
      city: response.data.city,
      district: response.data.district,
    };

    // 设置编辑状态
    isEdit.value = true;
    // 打开弹框
    dialogVisible.value = true;

    // 先加载省份对应的城市列表
    const selectedProvince = areaList.value.find(province => province.id === formData.value.province);
    if (selectedProvince && selectedProvince.children) {
      cityList.value = selectedProvince.children;
      
      // 再加载城市对应的区县列表
      const selectedCity = selectedProvince.children.find(city => city.id === formData.value.city);
      if (selectedCity && selectedCity.children) {
        districtList.value = selectedCity.children;
      }
    }

  } catch (error) {
    ElMessage.error('加载学校数据失败');
  }
}

// 修改取消按钮处理函数
const handleCancel = () => {
  dialogVisible.value = false
  isEdit.value = false // 重置编辑状态
  schoolFormRef.value?.resetFields()

  //新增的时候不走获取学校数据
  if (formData.value.id) {
    getSchoolData(formData.value.id)
  }
}

// 修改显示添加弹框函数
const showAddDialog = () => {

  reset()
  // 确保教育类型默认为职教
  formData.value.educationLevel = '2'
  // formData.value.isCollege = '0' 
  // formData.value.isSystem = '0' 
  formData.value.isCollege = '1' 
  formData.value.isSystem = '1' 
  formData.value.isActive = true

  isEdit.value = false // 重置编辑状态
  dialogVisible.value = true
}


// 确定钮处理函数
const handleConfirm = async () => {
  try {
    proxy.$refs["schoolFormRef"].validate(valid => {
      if (valid) {
        const submitData = { ...formData.value };
        
        // 保存省市区的ID和名称
        submitData.province = formData.value.province;
        submitData.city = formData.value.city;
        submitData.district = formData.value.district;
        submitData.isCollege = formData.value.isCollege ? '1' : '0';
        submitData.isSystem = formData.value.isSystem ? '1' : '0';
        if (submitData.id != null) {
          updateSchool(submitData).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            hasSchools.value = true;
            dialogVisible.value = false;
            // 更新展示的数据
            getSchoolData(submitData.id);
          });
        } else {
          formData.value.province = formData.value.province
          formData.value.city = formData.value.city
          formData.value.district = formData.value.district
          addSchool(formData.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
             // 更新状态  判断是否是新增 如果新增 则更新状态
            hasSchools.value = true
            // 关闭窗
            dialogVisible.value = false
            schoolId.value = response.data
            emit('addSchoolId', response.data)//将当前新增的学校ID穿到父组件
            getSchoolData(response.data)
          });
        }
      }
    });
  } catch (error) {
    ElMessage.error('操作失败，请重试')
    return
  }

}

//获取当前学校数据
const getSchoolData = async (id) => {
  try {
    const response = await getSchool(id);
    formData.value = {...response.data};
    // 确保 isActive 是布尔值
    formData.value.isActive = response.data.isActive === 'true' || response.data.isActive === true;
    
  
    formData.value.educationLevelName = response.data.educationLevel ? getBaseEducationType(response.data.educationLevel) : '';

  } catch (error) {
    ElMessage.error('获取学校数据失败');
  }
}

//根据学校名称生成字母
const generate = async (schoolName) => {
  if (schoolName) {
    await generateLetter(schoolName).then(response => {
      formData.value.website = response.msg;
    });
  }
}


// 获取地址标签方法
const getLocationLabel = (id) => {
  // 从省份列表中查找
  const provinceItem = areaList.value?.find(item => item.id === id)
  if (provinceItem) return provinceItem.label

  // 从城市列表中查找
  const cityItem = cityList.value?.find(item => item.id === id)
  if (cityItem) return cityItem.label

  // 从区域列表中查找
  const districtItem = districtList.value?.find(item => item.id === id)
  if (districtItem) return districtItem.label

  return ''
}


//获取学校类型
const getBaseEducationType = (educationType) => {
  if (!educationType || !mt_school_type.value) return '';
  const found = mt_school_type.value.find(item => item.value === educationType.toString());
  return found ? found.label : '';
}



//获取操作类型
const operateType = ref('')
// 修改 onMounted 钩子
onMounted(async () => {
  await initAreaData()
  
  // 从路由参数判断操作类型和学校ID
  const { type, id } = route.query
  
  operateType.value = type
  console.log(route.query)
  if (type === 'edit' && id) {
    // 编辑模式
    schoolId.value = id
    await getSchoolData(id)
    hasSchools.value = true
  } else {
    // 新增模式
    // hasSchools.value = false
    // // 重置表单数据
    // reset()
      //      getSchoolData(brotherFormGradeSchoolData.value.id)
      // hasSchools.value = true
  }
})


</script>

<style lang="scss" scoped>
.page-container {
  max-width: 1600px;
  margin: 0 auto;
  background: #f5f7fa;
  background-image: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)),
    url('@/assets/school-bg.png');
  background-size: cover;
  background-position: center;
  padding: 24px;
  padding-bottom: 80px;
}

/* 学校信息卡片样式 */
.school-card {
  // height: 700px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 卡片头部样式 */
.card-header {
  padding: 20px;
  // background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%);
  border-bottom: 1px solid #e4e7ed;
}

.school-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.school-logo {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title-content {
  flex: 1;

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #303133;
  }
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #f56c6c;
  color: #fff;

  &.active {
    background: #67c23a;
  }
}

/* 卡片内容样式 */
.card-body {
  padding: 20px;
}

.info-section {
  margin-bottom: 24px;
  background: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #e6f3ff;
  color: #409EFF;
  font-size: 15px;
  font-weight: 500;

  .el-icon {
    margin-right: 8px;
  }

  /* 编辑按钮样式 */
  .edit-btn {
    margin-left: auto;
    font-size: 14px;
    
    .el-icon {
      margin-right: 4px;
      font-size: 16px;
    }

    &:hover {
      opacity: 0.8;
    }
  }
}

.info-content {
  padding: 16px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    width: 100px;
    color: #606266;
    font-weight: 500;
  }

  span {
    flex: 1;
    color: #303133;
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .card-header {
    padding: 16px;
  }

  .school-title {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .info-item {
    flex-direction: column;
    
    label {
      width: 100%;
      margin-bottom: 4px;
    }
  }

  .section-title {
    flex-wrap: wrap;
    gap: 8px;
    
    .edit-btn {
      width: 100%;
      justify-content: center;
      margin-top: 8px;
    }
  }
}

/* 欢迎页样式 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 360px);
}

.welcome-content {
  text-align: center;
  padding: 48px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.welcome-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 24px;
}

.add-button {
  margin-top: 24px;
  padding: 12px 32px;
  font-size: 16px;
}

/* 表单布局样式优化 */
.school-dialog {
  :deep(.el-dialog__header) {
    padding: 10px;
    margin: 0;
    border-bottom: 1px solid #e4e7ed;
    background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%);
  }

  :deep(.el-dialog__body) {
    padding: 10px;
    max-height: 50vh;
    overflow-y: auto;
  }
}

.form-section {
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  padding: 8px 10px;
  background: #e6f3ff;
  color: #409EFF;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-content {
  padding: 10px;
  background: #f8f9fa;
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.full-width {
  width: 100%;
}

.half-width {
  width: calc(50% - 12px);
}

.flex-1 {
  flex: 1;
}

.address-group,
.education-group {
  display: flex;
  gap: 12px;
  width: 100%;

  :deep(.el-select) {
    width: calc((100% - 10px) / 3);
  }
}

:deep(.el-form-item) {
  margin-bottom: 0;
  
  .el-form-item__label {
    font-weight: 500;
    color: #606266;
  }
  
  .el-form-item__content {
    display: flex;
  }
}

:deep(.el-input),
:deep(.el-select) {
  width: 100%;
}

.upload-placeholder {
  width: 72px;
  height: 72px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
  
  &:hover {
    border-color: #409EFF;
    color: #409EFF;
  }

  .el-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }

  span {
    font-size: 12px;
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }

  .half-width {
    width: 100%;
  }

  .address-group,
  .education-group {
    flex-direction: column;
    gap: 16px;
    
    :deep(.el-select) {
      width: 100%;
    }
  }
}

/* 底部导航样式 */
/* 底部导航样式优化 */
.page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-top: 2px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 32px;
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-left: 150px;
}

.button-divider {
  width: 1px;
  height: 24px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(64, 158, 255, 0.2),
    transparent
  );
}

.nav-button {
  min-width: 120px;
  height: 40px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 24px;
}

.prev-button {
  background-color: #f8faff;
  border: 1px solid rgba(64, 158, 255, 0.2);
  color: #409EFF;
}

.prev-button:hover {
  background-color: #fff;
  border-color: #409EFF;
  color: #409EFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.next-button {
  background: linear-gradient(135deg, #409EFF, #3a8ee6);
  border: none;
  color: #ffffff;
}

.next-button:hover {
  background: linear-gradient(135deg, #66b1ff, #409EFF);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.25);
}

.nav-button .el-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.prev-button:hover .el-icon {
  transform: translateX(-3px);
}

.next-button:hover .el-icon {
  transform: translateX(3px);
}

/* 添加按钮点击效果 */
.nav-button:active {
  transform: translateY(0);
  box-shadow: none;
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .page-footer {
    background: rgba(30, 35, 45, 0.98);
    border-top: 2px solid rgba(64, 158, 255, 0.05);
  }
  
  .prev-button {
    background-color: rgba(64, 158, 255, 0.1);
    border-color: rgba(64, 158, 255, 0.3);
  }
}

/* 适配移动端 */
@media screen and (max-width: 768px) {
  .footer-content {
    padding: 16px;
  }

  .button-group {
    gap: 16px;
  }

  .nav-button {
    min-width: 120px;
    height: 40px;
    font-size: 14px;
    padding: 0 16px;
  }
  
  .button-divider {
    height: 20px;
  }
}

/* 确保内容不被底部导航遮挡 */
.content-wrapper {
  padding-bottom: 100px;
}
/* 响应式调整 */
@media screen and (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
  }

  .info-row {
    flex-direction: column;
    gap: 16px;
  }

  .address-container {
    flex-direction: column;
  }

  .address-select,
  .contact-input,
  .edu-select {
    width: 100%;
  }

  .footer-content {
    padding: 12px 16px;
  }
}

/* 弹框样式优化 */
.school-dialog {
  :deep(.el-dialog__body) {
    padding: 10px;
    max-height: 50vh;
    overflow-y: auto;
  }

  :deep(.el-dialog__header) {
    padding: 10px;
    margin: 0;
    border-bottom: 1px solid #e4e7ed;
    background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%);
  }

  :deep(.el-dialog__footer) {
    padding: 10px;
    border-top: 1px solid #e4e7ed;
  }
}

.form-section {
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  padding: 8px 10px;
  background: #e6f3ff;
  color: #409EFF;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-content {
  padding: 10px;
  background: #f8f9fa;
}

/* Logo上传样式 */
.logo-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.upload-placeholder {
  width: 72px;
  height: 72px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #409EFF;
    color: #409EFF;
  }
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  object-fit: cover;
}

/* 表单项样式 */
:deep(.el-form-item) {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 16px;
  }
}

/* 地址选择器样式 */
.address-group {
  display: flex;
  gap: 5px;

  :deep(.el-select) {
    width: calc((100% - 10px) / 3);
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .address-group {
    flex-direction: column;
    gap: 16px;

    :deep(.el-select) {
      width: 100%;
    }
  }
}

/* 修改标题区域样式 */
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #303133;
  }
}

.edit-btn {
  padding: 4px 8px;
  font-size: 14px;
  
  .el-icon {
    margin-right: 4px;
    font-size: 16px;
  }

  &:hover {
    opacity: 0.8;
  }
}

/* 更新响应式样式 */
@media screen and (max-width: 768px) {
  .title-row {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .edit-btn {
    width: auto;
    margin-top: 0;
  }
}

.content-wrapper {
  flex: 1;
  max-width: 670px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card,
.table-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  width: 100%;
}
</style> 