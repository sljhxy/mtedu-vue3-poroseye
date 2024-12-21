<template>
  <div class="school-management">
    <!-- 顶部搜索和操作区域 -->
    <el-form :model="searchForm" ref="queryRef" :inline="true" v-show="showSearch" class="search-form">
      <el-form-item label="学校名称">
        <el-input v-model="searchForm.schoolName" placeholder="请输入学校名称"  @keyup.enter="handleSearch" clearable />
      </el-form-item>
      <el-form-item label="学段">
        <el-select v-model="searchForm.stage" placeholder="请选择学段" clearable>
          <el-option v-for="item in mt_vocal_education_system_type" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="所在地市">
        <el-select v-model="searchForm.city" placeholder="请选择地市" clearable>
          <el-option label="北京市" value="北京市" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        <el-button @click="resetSearch">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['glxt:vocalSchool:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="handleSearch"></right-toolbar>
    </el-row>

    <!-- 表格区域 -->
    <el-table
      v-loading="loading"
      :data="baseSchoolList"
      
      @selection-change="handleSelectionChange"
    >
    <!-- 添加空标签 -->
    <template #empty>
      <el-empty description="暂无内容" :image-size="120"></el-empty>
    </template>

      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column type="index" label="序号" width="70" align="center" />
      <el-table-column prop="schoolName" label="学校名称" min-width="150" align="center"  />
      <el-table-column prop="schoolName" label="学院名称" min-width="150" align="center"  />
      <el-table-column prop="schoolType" label="学段" min-width="100" align="center">
        <template #default="{ row }"> 
          {{ getSchoolPeriod(row.schoolPeriod) }}
        </template>
      </el-table-column>
      <el-table-column prop="schoolSystem" label="年制" min-width="100" align="center">
        <template #default="{ row }"> 
          {{ getSchoolYear(row.schoolYear) }}
        </template>
      </el-table-column>
      <el-table-column prop="city" label="所在地市" min-width="150" align="center" >
        <template #default="{ row }"> 
          <div v-if="getLocationLabel(row.province) === getLocationLabel(row.city)">
            {{ getLocationLabel(row.city) }}-{{ getLocationLabel(row.district) }}-{{ row.detailAddress }}
          </div>
          <div v-else>
            {{ getLocationLabel(row.province) }}-{{ getLocationLabel(row.city) }}-{{ getLocationLabel(row.district) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="studentCount" label="年级/班级/人数" min-width="100" show-overflow-tooltip  align="center"/>
      <el-table-column prop="deviceCount" label="设备数量" width="100" align="center" />
      <el-table-column prop="status" label="生效" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isActive == 'true' ? 'success' : 'info'" size="small">
            {{ row.isActive == 'true' ? '已生效' : '未生效' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="180">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button plain type="success" icon="Edit" @click="handleEdit(scope.row)" v-hasPermi="['glxt:vocalSchool:edit']">修改</el-button>
            <el-button plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['glxt:vocalSchool:remove']">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="currentPage"
      v-model:limit="pageSize"
      @pagination="handleSearch"
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
const { proxy } = getCurrentInstance();
const {mt_vocal_education_system_type, mt_vocal_education_type } = proxy.useDict('mt_vocal_education_system_type', 'mt_vocal_education_type');
// 导入分页组件
import Pagination from '@/components/Pagination'
//导入学校列表
import { listSchool, delSchool } from '@/api/glxt/vocal_school'
// 导入区域接口
import { getAreaTree } from "@/api/glxt/area";

// 加载状态
const loading = ref(false)
const total = ref(1)


// 在顶层作用域初始化 router
const router = useRouter()

// 显示搜索表
const showSearch = ref(true)

// 搜索表单数据
const searchForm = reactive({
  schoolName: '',
  stage: '',
  city: ''
})
// 区域数据
const areaList = ref([])    // 省份列表
const cityList = ref([])    // 城市列表
const districtList = ref([]) // 区列表
const allAreaData = ref({}) // 存储完整的区域数据

// 获取地址标签的方法
const getLocationLabel = (id) => {
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

  const area = findArea([allAreaData.value], id);
  return area ? area.label : '';
};

// 初始化取所有区域数据
const initAreaData = async () => {
  try {
    const response = await getAreaTree();
    if (response.data && response.data.rows) {
      // 保存完整的区域数据
      allAreaData.value = response.data.rows[0];
      
      // 获取学校列表后，再根据实际数据设置对应的省市区列表
      const updateAreaLists = (province, city) => {
        // 设置省份列表
        areaList.value = allAreaData.value.children || [];
        
        // 找到对应的省份数据
        const provinceData = areaList.value.find(p => p.id === province);
        if (provinceData) {
          // 设置城市列表
          cityList.value = provinceData.children || [];
          
          // 找到对应的城市数据
          const cityData = cityList.value.find(c => c.id === city);
          if (cityData) {
            // 设置区县列表
            districtList.value = cityData.children || [];
          }
        }
      };

      // 监听学校列表数据变化
      watch(baseSchoolList, (newList) => {
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
};

// 分页相关
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})


// 获取地址标签的方法
const getLocationLabel1 = (id) => {
  // 从省份列表中查找
  console.log(areaList.value)
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

//获取学段
const getSchoolPeriod = (schoolType) => {
  if (!schoolType || !mt_vocal_education_type.value) return '';
  const found = mt_vocal_education_type.value.find(item => item.value === schoolType.toString());
  return found ? found.label : '';
}

//获取学制
const getSchoolYear = (schoolSystem) => {
  if (!schoolSystem || !mt_vocal_education_system_type.value) return '';
  const found = mt_vocal_education_system_type.value.find(item => item.value === schoolSystem.toString());
  return found ? found.label : '';
}


// 搜索方法
const handleSearch = () => {
  loading.value = true
  // 实现搜索逻辑
  queryParams.pageNum = 1;
  getList();
}

const baseSchoolList = ref([]);
/** 查询普教-学校列表 */
function getList() {
  console.log(searchForm.value)
  loading.value = true;
  listSchool(searchForm.value).then(response => {
    baseSchoolList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}


// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch();
}

// 添加学校
const handleAdd = () => {
  router.push({
    path: '/glxt/vocal_school/add_vocal_school',
    query: {
      type: 'add'
    }
  })
}

// 编辑学校
const handleEdit = (row) => {
  router.push({
    path: '/glxt/vocal_school/add_vocal_school',
    query: {
      id: row.id,
      type: 'edit'
    }
  })
}



// 删除学校
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除学校 ${row.schoolName} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除逻辑
    delSchool(row.id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getList();
      } else {
        ElMessage.error('删除失败')
      }
    });
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}

// 在 script setup 中添加选择相关的代码
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

// 多选框选中数据
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

getList();
initAreaData();
</script>

<style lang="scss" scoped>
.school-management {
  padding: 24px;
}

.mb8 {
  margin-bottom: 8px;
}

.search-form {
  margin-bottom: 16px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

:deep(.el-input) {
  width: 200px;
}

:deep(.el-select) {
  width: 200px;
}

:deep(.small-padding) {
  padding-left: 8px;
  padding-right: 8px;
}

:deep(.fixed-width) {
  min-width: 180px;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
}

:deep(.el-button) {
  margin: 0 5px;  /* 移除按钮默认外边距 */
}

/* 分页器样式调整 */
:deep(.el-pagination) {
  margin-top: 0px;
  justify-content: flex-end;

  .el-pagination__sizes {
    .el-select {
      width: 110px;  /* 调整每页条数选择器的宽度 */
    }
  }

  .el-pagination__jump {
    .el-input {
      width: 50px;  /* 调整跳转页码输入框的宽度 */
      margin: 0 6px;  /* 调整输入框两侧间距 */
    }
  }
}
</style>
