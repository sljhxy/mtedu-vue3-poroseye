import { createWebHistory, createRouter } from 'vue-router'
/* Layout */
import Layout from '@/layout'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true
  },
  {
    path: '/s/:code',
    component: () => import('@/views/schoolLogin'),
    hidden: true
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import('@/views/error/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index'),
        name: 'Index',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  {
    path: '/glxt',
    component: Layout,
    name: '题库管理',
    hidden: true,
    children: [
      {
        path: 'question/list',
        component: () => import('@/views/glxt/question/list'),
        name: 'ExamQuestionPageList',
        meta: { title: '题目列表', noCache: true }
      },
      {
        path: 'question/edit/singleChoice',
        component: () => import('@/views/glxt/question/edit/single-choice'),
        name: 'singleChoicePage',
        meta: { title: '单选题编辑', noCache: true, activeMenu: '/glxt/question/list' },
        hidden: true
      },
      {
        path: 'question/edit/multipleChoice',
        component: () => import('@/views/glxt/question/edit/multiple-choice'),
        name: 'multipleChoicePage',
        meta: { title: '多选题编辑', noCache: true, activeMenu: '/glxt/question/list' },
        hidden: true
      },
      {
        path: 'question/edit/trueFalse',
        component: () => import('@/views/glxt/question/edit/true-false'),
        name: 'trueFalsePage',
        meta: { title: '判断题编辑', noCache: true, activeMenu: '/glxt/question/list' },
        hidden: true
      },
      {
        path: 'question/edit/gapFilling',
        component: () => import('@/views/glxt/question/edit/gap-filling'),
        name: 'gapFillingPage',
        meta: { title: '填空题编辑', noCache: true, activeMenu: '/glxt/question/list' },
        hidden: true
      },
      {
        path: 'question/edit/shortAnswer',
        component: () => import('@/views/glxt/question/edit/short-answer'),
        name: 'shortAnswerPage',
        meta: { title: '简答题编辑', noCache: true, activeMenu: '/glxt/question/list' },
        hidden: true
      }
    ]
  },
// 普教-学校的路由配置文件
{
  path: '/glxt/base_school',
  component: Layout,
  redirect: '/glxt/base_school/base_school',
  name: 'BaseSchoolManagement',
  meta: { title: '学校管理' },
  hidden: true,
  children: [
    {
      path: 'base_school',
      name: 'BaseSchool',
      component: () => import('@/views/glxt/base_school/base_school.vue'),
      meta: { title: '学校管理' },
      hidden: true
    },
    {
      path: 'add_base_school',
      name: 'AddBaseSchool',
      component: () => import('@/views/glxt/base_school/add_base_school.vue'),
      meta: { title: '普教-学校(添加/编辑)' },
      hidden: true
    }
  ]
},
// 职教-实验管理的路由配置文件
{
  path: '/glxt/vocal_school',
  component: Layout,
  redirect: '/glxt/vocal_school/vocal_school',
  name: 'VocalSchoolManagement',
  meta: { title: '学校管理' },
  hidden: true,
  children: [
    {
      path: 'vocal_school',
      name: 'VocalSchool',
      component: () => import('@/views/glxt/vocal_school/vocal_school.vue'),
      meta: { title: '学校管理' },
      hidden: true
    },
    {
      path: 'add_vocal_school',
      name: 'AddVocalSchool',
      component: () => import('@/views/glxt/vocal_school/add_vocal_school.vue'),
      meta: { title: '职教-学校(添加/编辑)' },
      hidden: true
    }
  ]
},
//实验管理的路由配置文件
{
  path: '/glxt/experiment',
  component: Layout,
  redirect: '/glxt/experiment/experiment_list',
  name: 'ExperimentManagement',
  meta: { title: '实验管理'},
  hidden: true,
  children: [
    {
      path: 'experiment_list',
      name: 'experimentList',
      component: () => import('@/views/glxt/experiment/experiment_list.vue'),
      meta: { title: '实验管理列表'},
      hidden: true
    },
    {
      path: 'experiment_steps',
      name: 'experimentSteps',
      component: () => import('@/views/glxt/experiment/experiment_steps.vue'),
      meta: { title: '实验步骤'},
      hidden: true
    },
    // [2026-08-29] AI课堂多内容改版:旧的单内容生成页已废弃,入口改为 experiment_list.vue
    // 的"AI课堂"按钮打开全屏弹窗(ExperimentClassroomList 组件)。
    // 不可恢复此路由:后端 byExperiment 接口已改为返回数组(多内容),旧页面期望单个对象,直访会异常。
    // 如需恢复多内容管理,请从实验列表的"AI课堂"按钮进入。
    // {
    //   path: 'experiment_generate',
    //   name: 'experimentGenerate',
    //   component: () => import('@/views/glxt/experiment/experiment_generate.vue'),
    //   meta: { title: 'AI课堂生成' },
    //   hidden: true
    // }
    // ... 其他路由
  ]
},
// 统计详情页路由
{
  path: '/statistics',
  component: Layout,
  hidden: true,
  children: [
    {
      path: 'class-statistics',
      component: () => import('@/views/statistics/class-statistics/index'),
      name: 'ClassStatistics',
      meta: { title: '班级整体数据' }
    },
    {
      path: 'class-detail/:data(.*)',
      component: () => import('@/views/statistics/class-statistics/class-detail'),
      name: 'ClassDetail',
      meta: { title: '班级情况', activeMenu: '/statistics/class-statistics', noCache: true }
    },
    {
      path: 'student-detail/:data(.*)',
      component: () => import('@/views/statistics/class-statistics/student-detail'),
      name: 'StudentDetail',
      meta: { title: '学生情况', activeMenu: '/statistics/class-statistics', noCache: true }
    },
    {
      path: 'student-experiment-detail/:data(.*)',
      component: () => import('@/views/statistics/class-statistics/student-experiment-detail'),
      name: 'StudentExperimentDetail',
      meta: { title: '学生学习情况', activeMenu: '/statistics/class-statistics', noCache: true }
    },
    // 内容操作数据页面
    {
      path: 'operation-statistics',
      component: () => import('@/views/statistics/operation-statistics/index'),
      name: 'OperationStatistics',
      meta: { title: '内容操作数据' }
    },
    {
      path: 'operation-statistics/student-experiment-detail/:data(.*)',
      component: () => import('@/views/statistics/class-statistics/student-experiment-detail'),
      name: 'OperationStudentExperimentDetail',
      meta: { title: '学生学习情况', activeMenu: '/statistics/operation-statistics', noCache: true }
    },
    {
      path: 'operation-statistics/experiment-detail/:data(.*)',
      component: () => import('@/views/statistics/operation-statistics/experiment-detail'),
      name: 'ExperimentDetail',
      meta: { title: '实验详情', activeMenu: '/statistics/operation-statistics', noCache: true }
    }
  ]
}
]

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: '分配角色', activeMenu: '/system/user' }
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser'),
        name: 'AuthUser',
        meta: { title: '分配用户', activeMenu: '/system/role' }
      }
    ]
  },
  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data'),
        name: 'Data',
        meta: { title: '字典数据', activeMenu: '/system/dict' }
      }
    ]
  },
  {
    path: '/glxt/column-data',
    component: Layout,
    hidden: true,
    permissions: ['glxt:column:list'],
    children: [
      {
        path: 'index/:columnId(.*)',
        component: () => import('@/views/glxt/column/data'),
        name: 'columnData',
        meta: { title: '内容管理', activeMenu: '/school/column' }
      }
    ]
  },
  {
    path: '/monitor/job-log',
    component: Layout,
    hidden: true,
    permissions: ['monitor:job:list'],
    children: [
      {
        path: 'index/:jobId(\\d+)',
        component: () => import('@/views/monitor/job/log'),
        name: 'JobLog',
        meta: { title: '调度日志', activeMenu: '/monitor/job' }
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable'),
        name: 'GenEdit',
        meta: { title: '修改生成配置', activeMenu: '/tool/gen' }
      }
    ]
  },
// 化学虚拟实验模块路由
{
  path: '/chemistry',
  component: Layout,
  name: 'Chemistry',
  meta: { title: '化学虚拟实验', icon: 'education' },
  hidden: false,
  children: [
    {
      path: 'element',
      name: 'ChemistryElement',
      component: () => import('@/views/chemistry/element/index.vue'),
      meta: { title: '元素周期表', icon: 'chart' }
    },
    {
      path: 'substance',
      name: 'ChemistrySubstance',
      component: () => import('@/views/chemistry/substance/index.vue'),
      meta: { title: '物质库', icon: 'documentation' }
    },
    {
      path: 'equation',
      name: 'ChemistryEquation',
      component: () => import('@/views/chemistry/equation/index.vue'),
      meta: { title: '化学方程式', icon: 'link' }
    },
    {
      path: 'equipment',
      name: 'ChemistryEquipment',
      component: () => import('@/views/chemistry/equipment/index.vue'),
      meta: { title: '实验器材', icon: 'tool' }
    },
    {
      path: 'template',
      name: 'ChemistryTemplate',
      component: () => import('@/views/chemistry/template/index.vue'),
      meta: { title: '实验模板', icon: 'form' }
    },
    {
      path: 'reaction-stage',
      name: 'ChemistryReactionStage',
      component: () => import('@/views/chemistry/reaction-stage/index.vue'),
      meta: { title: '反应阶段', icon: 'step' }
    },
    {
      path: 'secondary-reaction',
      name: 'ChemistrySecondaryReaction',
      component: () => import('@/views/chemistry/secondary-reaction/index.vue'),
      meta: { title: '副反应', icon: 'connection' }
    },
    {
      path: 'intermediate',
      name: 'ChemistryIntermediate',
      component: () => import('@/views/chemistry/intermediate/index.vue'),
      meta: { title: '中间产物', icon: 'component' }
    },
    {
      path: 'reactionNarrative',
      name: 'ChemistryNarrative',
      component: () => import('@/views/chemistry/reactionNarrative/index.vue'),
      meta: { title: '反应描述', icon: 'document' }
    },
    {
      path: 'experimentRun',
      name: 'ChemistryExperimentRun',
      component: () => import('@/views/chemistry/experimentRun/index.vue'),
      meta: { title: '实验记录', icon: 'data-analysis' }
    },
    {
      path: 'simulation',
      name: 'ChemistrySimulation',
      component: () => import('@/views/chemistry/simulation/index.vue'),
      meta: { title: '反应模拟器', icon: 'cpu' }
    },
    {
      path: 'parameter-calculator',
      name: 'ChemistryParameterCalculator',
      component: () => import('@/views/chemistry/parameter-calculator/index.vue'),
      meta: { title: '物质参数计算器', icon: 'calculator' }
    },
    {
      path: 'realtime-simulation',
      name: 'ChemistryRealtimeSimulation',
      component: () => import('@/views/chemistry/realtime-simulation/index.vue'),
      meta: { title: '实时模拟器', icon: 'cpu' }
    },
    {
      path: 'status-category',
      name: 'ChemistryStatusCategory',
      component: () => import('@/views/chemistry/status-category/index.vue'),
      meta: { title: '状态码分类', icon: 'tree' }
    },
    {
      path: 'status-code',
      name: 'ChemistryStatusCode',
      component: () => import('@/views/chemistry/status-code/index.vue'),
      meta: { title: '状态码管理', icon: 'document' }
    },
    {
      path: 'status-ref',
      name: 'ChemistryStatusRef',
      component: () => import('@/views/chemistry/status-ref/index.vue'),
      meta: { title: '状态码关联', icon: 'link' }
    }
  ]
}
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
});

export default router;