<template>
  <div class="dashboard-container">
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="exam" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              系统访问量
            </div>
            <count-to :start-val="0" :end-val="visitCount" :duration="2600" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" >
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="question" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              欢迎:{{ state.user.userName }} 来到我的世界！！！
            </div>
            <div class="card-panel-num">{{ currentTime }}</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shopping">
            <svg-icon icon-class="doexampaper" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              在线用户数
            </div>
            <count-to :start-val="0" :end-val="onlineUsers" :duration="3600" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="doquestion" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              IP:{{ state.user.loginIp }}
            </div>
            <count-to :start-val="0" :end-val="totalUsers" :duration="3200" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <div class="chart-title">用户分布统计</div>
          <div ref="pieChart" style="height: 300px;"></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <div class="chart-title">访问量趋势</div>
          <div ref="lineChart" style="height: 300px;"></div>
        </div>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <div class="chart-wrapper">
          <div class="chart-title">组织架构图</div>
          <div ref="treeChart" style="height: 400px;"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { getUserProfile } from "@/api/system/user";
import * as echarts from 'echarts';
import { onMounted, ref, reactive } from 'vue';

const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {}
});

// 统计数据
const visitCount = ref(12345);
const onlineUsers = ref(256);
const totalUsers = ref(5678);
const currentTime = ref('');

// 图表引用
const pieChart = ref(null);
const lineChart = ref(null);
const treeChart = ref(null);

// 更新时间
function updateTime() {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-CN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// 初始化饼图
function initPieChart() {
  const chart = echarts.init(pieChart.value);
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '用户分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '普通用户' },
          { value: 735, name: 'VIP用户' },
          { value: 580, name: '管理员' },
          { value: 484, name: '游客' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  chart.setOption(option);
}

// 初始化折线图
function initLineChart() {
  const chart = echarts.init(lineChart.value);
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }]
  };
  chart.setOption(option);
}

// 初始化树状图
function initTreeChart() {
  const chart = echarts.init(treeChart.value);
  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'tree',
        data: [{
          name: '公司架构',
          children: [
            {
              name: '技术部',
              children: [
                { name: '开发组' },
                { name: '测试组' },
                { name: '运维组' }
              ]
            },
            {
              name: '市场部',
              children: [
                { name: '销售组' },
                { name: '客服组' }
              ]
            }
          ]
        }],
        top: '10%',
        left: '8%',
        bottom: '22%',
        right: '20%',
        symbolSize: 7,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right'
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        emphasis: {
          focus: 'descendant'
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }
    ]
  };
  chart.setOption(option);
}

// 获取用户信息
function getUser() {
  getUserProfile().then(response => {
    state.user = response.data;
    console.log(state.user);
  });
}

// 监听窗口大小变化，重绘图表
function handleResize() {
  const charts = [
    echarts.getInstanceByDom(pieChart.value),
    echarts.getInstanceByDom(lineChart.value),
    echarts.getInstanceByDom(treeChart.value)
  ];
  charts.forEach(chart => chart && chart.resize());
}

onMounted(() => {
  getUser();
  updateTime();
  setInterval(updateTime, 1000);
  
  nextTick(() => {
    initPieChart();
    initLineChart();
    initTreeChart();
  });
  
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
  .dashboard-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;

    .chart-wrapper {
      background: #fff;
      padding: 16px 16px 0;
      margin-bottom: 32px;
    }
  }

  @media (max-width: 1024px) {
    .chart-wrapper {
      padding: 8px;
    }
  }

  .dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;

    .github-corner {
      position: absolute;
      top: 0px;
      border: 0;
      right: 0;
    }

    .chart-wrapper {
      background: #fff;
      padding: 16px 16px 0;
      margin-bottom: 32px;
    }
  }

  @media (max-width: 1024px) {
    .chart-wrapper {
      padding: 8px;
    }
  }

  .panel-group {
    margin-top: 18px;

    .card-panel-col {
      margin-bottom: 32px;
    }

    .card-panel {
      height: 108px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      color: #666;
      background: #fff;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
      border-color: rgba(0, 0, 0, .05);

      &:hover {
        .card-panel-icon-wrapper {
          color: #fff;
        }

        .icon-people {
          background: #40c9c6;
        }

        .icon-message {
          background: #36a3f7;
        }

        .icon-money {
          background: #f4516c;
        }

        .icon-shopping {
          background: #34bfa3
        }
      }

      .icon-people {
        color: #40c9c6;
      }

      .icon-message {
        color: #36a3f7;
      }

      .icon-money {
        color: #f4516c;
      }

      .icon-shopping {
        color: #34bfa3
      }

      .card-panel-icon-wrapper {
        float: left;
        margin: 14px 0 0 14px;
        padding: 16px;
        transition: all 0.38s ease-out;
        border-radius: 6px;
      }

      .card-panel-icon {
        float: left;
        font-size: 48px;
      }

      .card-panel-description {
        float: right;
        font-weight: bold;
        margin: 26px;
        margin-left: 0px;

        .card-panel-text {
          line-height: 18px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 16px;
          margin-bottom: 12px;
        }

        .card-panel-num {
          font-size: 20px;
        }
      }
    }
  }

  @media (max-width: 550px) {
    .card-panel-description {
      display: none;
    }

    .card-panel-icon-wrapper {
      float: none !important;
      width: 100%;
      height: 100%;
      margin: 0 !important;

      .svg-icon {
        display: block;
        margin: 14px auto !important;
        float: none !important;
      }
    }
  }

  .echarts-line{
    background:#fff;
    padding:16px 16px 0;
    margin-bottom:32px;
    height:450px;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px;
    margin-bottom: 32px;
    border-radius: 4px;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);

    .chart-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 16px;
      padding-left: 10px;
      border-left: 4px solid #409EFF;
    }
  }
</style>


