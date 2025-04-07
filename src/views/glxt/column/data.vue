<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="教材版本">
            <el-cascader
            @change="handleChange"
            style="width: 100%;"
            v-model="queryParams.courseSystems"
            :options="courseSystemOptions"
            :props="{ 
              expandTrigger: 'hover',
              multiple: false,
              emitPath: true
            }"
            placeholder="请选择课程体系"
            clearable
            collapse-tags
            collapse-tags-tooltip
            class="w-full"
          />
          </el-form-item>

        <el-form-item label="科目" prop="dictType">
            <el-select v-model="queryParams.subjectId" style="width: 200px" clearable>
              <el-option
                v-for="dict in route.params.columnId.split('-')[1]?mt_school_subject:mt_vocal_school_subject"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
         </el-form-item>
         <el-form-item label="实验名称" prop="experimentName">
            <el-input
               v-model="queryParams.experimentName"
               placeholder="请输入实验名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
      
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="clickAddExperimentContentDialog"
               v-hasPermi="['glxt:column:add']"
            >添加实验</el-button>
         </el-col>
      
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="deleteExperiment"
               v-hasPermi="['glxt:column:remove']"
            >删除</el-button>
         </el-col>
         <!-- <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['glxt:column:export']"
            >导出</el-button>
         </el-col> -->
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Close"
               @click="handleClose"
            >关闭</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getColumnExperimentList"></right-toolbar>
      </el-row>



    <!-- Experiment Table -->
    <el-table :data="columnExperimentPageList" @selection-change="handleSeleChange" ref="tableRef" :row-key="(row) => row.id" border>
          <el-table-column type="selection" width="55" fixed align="center"/>
              <el-table-column type="index" label="序号" width="60" fixed align="center"/>
              <el-table-column prop="experimentName" label="实验名称" align="center" />
              <el-table-column prop="subjectId" label="科目" align="center" >
                <template #default="scope">
                    <dict-tag v-if="scope.row.subjectId" :options="route.params.columnId.split('-')[1]=='1'?mt_school_subject:mt_vocal_school_subject" :value="scope.row.subjectId"/>
                </template>
              </el-table-column>
              <el-table-column prop="title" label="教材内容" align="center">
                <template #default="scope">
                <div class="column-systems">
                  <el-tag
                    size="small"
                    class="course-system-tag"
                    v-if="scope.row.subjectId"
                  >
                    {{ `${getSubjectName(scope.row.subjectId, route.params.columnId.split('-')[1])}
                    -${scope.row.textbookLibraryName}-${scope.row.volumeName}` }}
                  </el-tag>
                </div>
              </template>
              </el-table-column>
              <el-table-column
                label="拖拽排序"
                width="80"
                align="center"
              >
              <template #default="scope">
                  <!-- <i class="Rank" style="cursor:pointer" /> -->
                  <el-icon class="el-icon-rank allowDrag" style="cursor:pointer"><Rank /></el-icon>
                </template>
              </el-table-column>
              <el-table-column label="操作"  align="center">
                <template #default="scope">
                  <el-button plain type="danger" class="delete-btn" @click="deleteExperiment(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>


            <pagination
              v-show="total>0"
              :total="total"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              @pagination="getColumnExperimentList"
            />
      
      <!-- 添加实验弹窗 -->
      <el-dialog 
      v-model="dialogVisible" 
      title="选择实验进行添加" 
      width="60%"
    >
      <!-- 搜索框保持不变 -->
      <div class="dialog-search">
        <el-form :inline="true" :model="queryExperimentParams">
          <el-form-item label="教材版本">
            <el-cascader
            @change="handleCourseSystemChange"
            style="width: 100%;"
            v-model="queryExperimentParams.courseSystems"
            :options="courseSystemOptions"
            :props="{ 
              expandTrigger: 'hover',
              multiple: false,
              emitPath: true
            }"
            placeholder="请选择课程体系"
            clearable
            collapse-tags
            collapse-tags-tooltip
            class="w-full"
          />
          </el-form-item>


          <el-form-item label="实验名称" prop="experimentName">
            <el-input
              v-model="queryExperimentParams.experimentName"
              placeholder="请输入实验名称"
              clearable
              style="width: 200px"              
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQueryExeriment">搜索</el-button>
            <el-button icon="Refresh" @click="resetQueryExeriment">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 修改表格容器，添加固定高度和滚动 -->
      <div class="dialog-table-wrapper">
        <el-table 
          :data="unselectedMaterials"
          @selection-change="handleSelectionChange"
          border
          :max-height="calculateTableHeight(unselectedMaterials.length)"
        >
          <el-table-column type="selection" width="55" fixed align="center"/>
          <el-table-column type="index" label="序号" width="60" fixed  align="center"/>
          <el-table-column prop="experimentName" label="实验名称" align="center"/>
          <el-table-column prop="subjectId" label="科目" align="center">
            <template #default="scope">
                  <!-- <dict-tag v-if="scope.row.mtExperimentInfoMountSystems.length"
                    :options="scope.row.schoolType=='1'?mt_school_subject:mt_vocal_school_subject" :value="scope.row.mtExperimentInfoMountSystems[0].subjectId"/>-->
                  <dict-tag 
                    :options="scope.row.schoolType=='1'?mt_school_subject:mt_vocal_school_subject" :value="scope.row.subjectId"/>
              </template>
          </el-table-column>
          <el-table-column prop="shortTitle" label="教材版本" min-width="200" show-overflow-tooltip align="center" >
            <template #default="scope">
                <div class="column-systems">
                  <el-tag
                    size="small"
                    class="course-system-tag"
                   
                  >
                   <!-- v-if="scope.row.mtExperimentInfoMountSystems.length" -->
                    <!-- {{ `${getSubjectName(scope.row.mtExperimentInfoMountSystems[0].subjectId, route.params.columnId.split('-')[1])}
                    -${scope.row.mtExperimentInfoMountSystems[0].textbookLibraryName}-${scope.row.mtExperimentInfoMountSystems[0].volumeName}` }} -->

                    {{ `${getSubjectName(scope.row.subjectId, route.params.columnId.split('-')[1])}
                    -${scope.row.textbookLibraryName}-${scope.row.volumeName}` }}
                  </el-tag>
                </div>
              </template>
          </el-table-column>

        </el-table>
      </div>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="dialog-buttons">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExperimentSelection">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import Sortable from "sortablejs";
import { ref, onMounted, onBeforeUnmount } from "vue";

const { proxy } = getCurrentInstance();
const { mt_real_time_update, mt_school_type,mt_academic_stage, mt_vocal_education_type, mt_school_subject, mt_vocal_school_subject } = proxy.useDict('mt_real_time_update', 'mt_school_type','mt_academic_stage', 'mt_vocal_education_type', 'mt_school_subject','mt_vocal_school_subject');

import { getCourseSystemOptions } from '@/api/glxt/subject'
import { listExperimentInfoMountsystem ,listExperimentInfo } from '@/api/glxt/experimentInfo'
import { ElMessage, ElMessageBox } from 'element-plus'

//导入栏目-实验-API
import { insertBatchMtColumnExperiment, listColumnExperiment, delColumnExperiment, dragSort } from '@/api/glxt/columnExperiment'

const tableRef = ref();
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const route = useRoute();
const dialogVisible = ref(false)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    courseSystems: undefined,
    subjectId: undefined,
    experimentName: undefined
  }
});

const { queryParams, form } = toRefs(data);

//选择教材版本
const courseSystemOptions = ref([])

//获取挂载课程
const getCourseSystemOptionList = (schoolType, academicStage) => {
  getCourseSystemOptions(schoolType, academicStage).then(response => {
    courseSystemOptions.value = response.data

    courseSystemOptions.value.forEach(item => {
      console.log(item.value)
      item.label = getSubjectName(item.value, schoolType);
    })
  })
}

//获取科目名称
const getSubjectName = (subjectType, schoolType) => {
  console.log('科目：' + subjectType, '学校类型：' + schoolType)
  if(subjectType == '' || subjectType == undefined || subjectType == null) return;
  return schoolType == '1' ? mt_school_subject.value ?.find(item => item.value === subjectType).label : mt_vocal_school_subject.value ?.find(item => item.value === subjectType).label
}



//点击添加实验按钮
// 点击选择实验按钮获取列表
const clickAddExperimentContentDialog = () => {
  //调用教材版本列表
  let contentType = route.params.columnId.split('-')[1];//学校类型
  let periodType = route.params.columnId.split('-')[2];//学段类型
  console.log('学校类型：' + contentType, '学段类型：' + periodType)
  console.log(typeof(contentType), typeof(periodType))
  getCourseSystemOptionList(contentType, periodType)
  //调用实验列表
  // queryExperimentParams.value.schoolType = contentType
  // queryExperimentParams.value.academicStageType = periodType
  getExperimentList()
  dialogVisible.value = true
}

//弹框搜索参数处理
const handleQuestionDialogSearch = (type, value) => {
  let questionTypeTmp = ''//题目类型
  if(type == 'questionType') {
    queryQuestionParams.value.questionType = value
    questionTypeTmp = value
    getQuestionList();
  }else {
    queryQuestionParams.value.questionType = questionTypeTmp
    getQuestionList();
  }
}


//弹框搜索参数方法
const handleQueryExeriment = () => {
  // console.log('搜索参数：', queryExperimentParams.value.courseSystems[0])
  // console.log('搜索参数：', queryExperimentParams.value.courseSystems[1])
  // console.log('搜索参数：', queryExperimentParams.value.courseSystems[2])
  // console.log('搜索参数：', queryExperimentParams.value.courseSystems.length)
  // console.log('搜索参数：', queryExperimentParams.value.courseSystems)
  // console.log('搜索参数：', queryExperimentParams.value.experimentName)
  if(queryExperimentParams.value.courseSystems != undefined && queryExperimentParams.value.courseSystems.length === 3) {
    queryExperimentParams.value.subjectId = queryExperimentParams.value.courseSystems[0]//科目
    queryExperimentParams.value.textbookLibraryId = queryExperimentParams.value.courseSystems[1]//教材
    queryExperimentParams.value.volumeId = queryExperimentParams.value.courseSystems[2]//分册
  }
  getExperimentList()
}

//重置搜索条件
const resetQueryExeriment = () => {
  queryExperimentParams.value.courseSystems = []
  queryExperimentParams.value.experimentName = ''
  queryExperimentParams.value.subjectId = ''//科目
  queryExperimentParams.value.textbookLibraryId = ''//教材
  queryExperimentParams.value.volumeId = ''//分册
  getExperimentList()
}


/** 获取实验列表 */
// const experimentInfoList = ref([]);

const queryExperimentParams = ref({
  schoolType: route.params.columnId.split('-')[1],
  academicStageType:'',
  subjectId:'',
  textbookLibraryId:'',
  volumeId:'',
  courseSystems:[],
  experimentName:'',
  pageNum: 1,
  pageSize: 1000000,
  
})
function getExperimentList() {
  loading.value = true;
   listExperimentInfoMountsystem(queryExperimentParams.value).then(response => {
  // listExperimentInfo(queryExperimentParams.value).then(response => {
    experimentList.value = response.rows;
    // loading.value = false;
  });
}


//当修改教材版本下拉  重置搜索条件
const handleCourseSystemChange = (value) => {
  if(value == undefined) {
    queryExperimentParams.value.subjectId = ''//科目
    queryExperimentParams.value.textbookLibraryId = ''//教材
    queryExperimentParams.value.volumeId = ''//分册
    getExperimentList()
  } 

  if(value != undefined && queryExperimentParams.value.courseSystems.length === 3) {
    queryExperimentParams.value.subjectId = queryExperimentParams.value.courseSystems[0]//科目
    queryExperimentParams.value.textbookLibraryId = queryExperimentParams.value.courseSystems[1]//教材
    queryExperimentParams.value.volumeId = queryExperimentParams.value.courseSystems[2]//分册
    getExperimentList()
  }

}


//确认添加实验按钮

 // 存储所有实验数据
const allColumnExperiments = ref({
  columnId:'',
  experimentList:[]
})

// 修改确认选择素材方法
const confirmExperimentSelection = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一个实验')
    return
  }

  // 检查重复选择
  const newExperiments = selectedRows.value

  // // 添加新选择的实验
  allColumnExperiments.value.experimentList = [ ...newExperiments]
  
  //进行将已经选择数据添加到实验题库列表
  allColumnExperiments.value.columnId = route.params.columnId.split('-')[0]//栏目id

  // allColumnExperiments.value.mtExperimentInfoMountSystems
  insertBatchMtColumnExperiment(allColumnExperiments.value).then(response => {
    if(response.code == 200){
        // 关闭弹窗并清空选择
        dialogVisible.value = false
        selectedRows.value = []
        ElMessage.success(`成功添加 ${newExperiments.length} 个实验`)
        // 重新加载当前页数据
        getColumnExperimentList()
      }else{
        ElMessage.error('添加失败')
      } 
  });

}

//获取已经选择的实验列表
const columnExperimentPageList = ref([])


function getColumnExperimentList() {
  // loading.value = true;
  queryParams.value.columnId = route.params.columnId.split('-')[0]//栏目id
  listColumnExperiment(queryParams.value).then(response => {
    columnExperimentPageList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

//内容管理页面 教材下拉 搜索
const handleChange = (value) => {


if(value == undefined) {
  queryParams.value.subjectId = ''//科目
  queryParams.value.textbookLibraryId = ''//教材
  queryParams.value.volumeId = ''//分册
  getColumnExperimentList()
} 

if(value != undefined && queryParams.value.courseSystems.length === 3) {
  queryParams.value.subjectId = queryParams.value.courseSystems[0]//科目
  queryParams.value.textbookLibraryId = queryParams.value.courseSystems[1]//教材
  queryParams.value.volumeId = queryParams.value.courseSystems[2]//分册
  getColumnExperimentList()
}
}


//删除题库
const deleteExperiment = (row) => {
  const _id = row.id || ids.value;
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delColumnExperiment(_id).then(response => {
      if(response.code == 200){
        ElMessage.success('删除成功')
        getColumnExperimentList()
      }else{
        ElMessage.error('删除失败')
      }
    })
  }).catch(() => {
    ElMessage.info('取消删除')
  })
}


/** 多选框选中数据 */
function handleSeleChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}


/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getColumnExperimentList()
}

/** 返回按钮操作 */
function handleClose() {
  const obj = { path: "/school/column" };
  proxy.$tab.closeOpenPage(obj);
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}



// 点击添加按钮后选中的实验
const selectedRows = ref([])
const handleSelectionChange = (selection) => {
  selectedRows.value = selection

}


// 未选择的素材计算属性
const experimentList = ref([]) // 当前显示的实验列表
const unselectedMaterials = computed(() => {
  return experimentList.value
})

// 添加计算表格高度的方法
const calculateTableHeight = (dataLength) => {
  const rowHeight = 40 // 每行的高度
  const headerHeight = 40 // 表头高度
  const minHeight = rowHeight * 5 + headerHeight // 最小高度（5行）
  const maxHeight = rowHeight * 10 + headerHeight // 最大高度（10行）
  
  // 计算实际需要的高度
  const actualHeight = rowHeight * dataLength + headerHeight
  
  // 如果数据少于5行，返回最小高度
  if (actualHeight < minHeight) {
    return minHeight
  }
  // 如果数据多于10行，返回最大高度
  if (actualHeight > maxHeight) {
    return maxHeight
  }
  // 否则返回实际高度
  return actualHeight
}




/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/dict/data/export", {
    ...queryParams.value
  }, `dict_data_${new Date().getTime()}.xlsx`);
}

// console.log(route.params.columnId);


// 组件挂载之后执行
onMounted(() => {
  onSortableRow();
  //列
  // onSortableColumn();
});

const sortableRow = ref(null);//行
const sortableColumn = ref(null);//列

//存之前的数据  排序会用到
const oldColumnExperimentPageList = ref()


// 拖动表格行
const onSortableRow = () => {

  sortableRow.value = Sortable.create(
    tableRef.value.$el.querySelector(".el-table__body-wrapper tbody"),
    {
      animation: 150,
      onEnd: ({ newIndex, oldIndex }) => {

        //获取两两交换的数据
        const finalRow = columnExperimentPageList.value[newIndex]
        const curRow = columnExperimentPageList.value[oldIndex]

        /**
         * splice(index,1)：表示 删除 下标为index的内容
            splice(index,1,item)：表示用新的值item 更新 替换掉下标为index的值
            splice(index,0,item)：表示在下标为index的位置 增加 值为item的内容
         */
        // 获取新的行位置
        const currRow = columnExperimentPageList.value.splice(oldIndex, 1)[0];
        // console.log('oldIndex-' + oldIndex);

        // 重新排列行位置
        columnExperimentPageList.value.splice(newIndex, 0, currRow);
        // console.log('newIndex-' + newIndex);
        
        // console.log(columnExperimentPageList);
        if(oldIndex != newIndex) {
          // console.log('进来了')
          //先获取旧数据
          queryParams.value.columnId = route.params.columnId.split('-')[0]//栏目id
          listColumnExperiment(queryParams.value).then(response => {

            if(response.code == 200) {
              oldColumnExperimentPageList.value = response.rows;
              total.value = response.total;
              // console.log(oldColumnExperimentPageList);
              // console.log(columnExperimentPageList);
              //排序接口参数
              let sortParams = {
                oldIndex: oldIndex,
                newIndex: newIndex,
                oldColumnExperimentList:oldColumnExperimentPageList.value, //初始排序的数据
                newColumnExperimentList:columnExperimentPageList.value //最终排序后的数据
              }

              //调用排序接口
              dragSort(sortParams).then(response => {
                if(response.code == 200){
                
                  ElMessage.success(`排序成功`)
                    // 重新加载当前页数据
                    getColumnExperimentList()
                  }else{
                    ElMessage.error('排序失败')
                  } 
              });
            } else{
              ElMessage.error('服务器异常，稍后再试...')
            }
          });

        }
      },
    }
  );
};





// 拖动表格列
const onSortableColumn = () => {
  sortableColumn.value = Sortable.create(
    tableRef.value.$el.querySelector(".el-table__header-wrapper thead tr"),
    {
      animation: 150,
      onEnd: ({ newIndex, oldIndex }) => {
        // 1.获取表格列
        const table = tableRef.value;
        const oldColumns = table.store.states.columns;
        // 2. 重新排列列的顺序
        const newColumns = [...oldColumns.value];
        const movedColumn = newColumns.splice(oldIndex, 1)[0];
        newColumns.splice(newIndex, 0, movedColumn);
        oldColumns.value = newColumns;
      },
    }
  );
};


// 销毁
onBeforeUnmount(() => {
  if (sortableRow.value) {
    sortableRow.value.destroy();
    sortableRow.value = null;
  }
  //列
  // if (sortableColumn.value) {
  //   sortableColumn.value.destroy();
  //   sortableColumn.value = null;
  // }
});





//页面初始化加载实验数据
getColumnExperimentList()


//获取教材版本
getCourseSystemOptionList(route.params.columnId.split('-')[1], route.params.columnId.split('-')[2])
</script>
