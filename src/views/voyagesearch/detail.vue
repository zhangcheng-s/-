<template>
  <div class="station-dashboard">
    
    <header class="dashboard-header">
      <div class="header-left">
        <div class="back-btn-wrapper" @click="goBack">
           <svg class="back-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
             <path d="M424.2 819.9c-10.2 0-20.5-3.9-28.3-11.7L181.6 594c-15.6-15.6-15.6-40.9 0-56.6L396 323.2c15.6-15.6 40.9-15.6 56.6 0 15.6 15.6 15.6 40.9 0 56.6L266.5 554.7h443c94.3 0 170.7 76.4 170.7 170.7s-76.4 170.7-170.7 170.7c-22.1 0-40-17.9-40-40s17.9-40 40-40c50.2 0 90.7-40.5 90.7-90.7s-40.5-90.7-90.7-90.7H266.5l186.1 186.1c15.6 15.6 15.6 40.9 0 56.6-7.9 7.8-18.2 11.7-28.4 11.7z" fill="currentColor"></path>
           </svg>
           <span class="back-text">返回列表</span>
        </div>
        
        <div class="header-divider"></div>

        <div class="title-group">
          <span class="sub-label">站点详情分析</span>
          <div class="main-title-row">
            <h1 class="main-title">{{ stationId || '—' }}</h1>
            <el-tag size="small" effect="dark" v-if="stationType" class="station-tag">{{ stationType }}</el-tag>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="el-icon-download" size="small" plain>导出报告</el-button>
      </div>
    </header>

    <main class="dashboard-body" v-loading="loading">
      
      <div class="content-container">
        
        <section class="metrics-section">
          <div class="metric-card">
            <div class="m-icon-box blue">
              <i class="el-icon-files"></i>
            </div>
            <div class="m-content">
              <div class="m-val">{{ sampleList.length }}</div>
              <div class="m-lbl">样本总数</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="m-icon-box cyan">
              <i class="el-icon-bottom"></i>
            </div>
            <div class="m-content">
              <div class="m-val">
                {{ maxDepth }}<span class="unit">m</span>
              </div>
              <div class="m-lbl">最大深度</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="m-icon-box purple">
              <i class="el-icon-finished"></i>
            </div>
            <div class="m-content">
              <div class="m-val">
                {{ avgRecovery }}<span class="unit">%</span>
              </div>
              <div class="m-lbl">平均回收率</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="m-icon-box orange">
              <i class="el-icon-s-operation"></i>
            </div>
            <div class="m-content">
              <div class="m-val">{{ deviceCount }}</div>
              <div class="m-lbl">使用设备数</div>
            </div>
          </div>
        </section>

        <section class="charts-section" v-show="sampleList.length > 0">
          <div class="chart-wrapper">
            <div class="chart-header">
              <span class="chart-title"><i class="el-icon-s-data"></i> 采样深度分布 (m)</span>
            </div>
            <div ref="depthChartRef" class="chart-body"></div>
          </div>
          <div class="chart-wrapper">
            <div class="chart-header">
              <span class="chart-title"><i class="el-icon-pie-chart"></i> 基质类型构成</span>
            </div>
            <div ref="matrixChartRef" class="chart-body"></div>
          </div>
        </section>

        <section class="table-section">
          <div class="section-head">
            <div class="head-left">
              <div class="decoration-line"></div>
              <h3>样本数据清单</h3>
            </div>
            <div class="table-actions">
              <el-input 
                v-model="searchText" 
                placeholder="搜索编号 / 设备..." 
                prefix-icon="el-icon-search" 
                size="small" 
                class="search-input"
                clearable
              ></el-input>
            </div>
          </div>

          <el-table 
            :data="filteredList" 
            style="width: 100%" 
            :header-cell-style="{ background: '#f8fafc', color: '#64748b', fontWeight: '600', height: '56px', fontSize: '13px' }"
            :row-style="{ height: '64px' }"
            class="custom-table"
          >
            <el-table-column type="index" label="序号" width="70" align="center">
              <template #default="scope">
                <span class="index-badge">{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="sampleName" label="样本编号" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="sample-code">
                  <span class="code-text">{{ row.sampleName || '—' }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="深度 (m)" width="130" align="left">
              <template #default="{ row }">
                <span class="depth-text">{{ formatDepthSimple(row) }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="matrixType" label="基质类型" width="140" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.matrixType" class="matrix-tag">{{ row.matrixType }}</span>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="sampler" label="采样设备" width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="device-text">{{ row.sampler || row.samplingDevice || '-' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="sampleDate" label="采样时间" width="170">
              <template #default="{ row }">
                <span class="time-text">{{ formatTime(row.sampleDate || row.sampleStartDate, true) }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-btn" @click="openDetail(row)">
                  <span>查看详情</span>
                </div>
              </template>
            </el-table-column>
            
            <template #empty>
              <div class="empty-state">
                <i class="el-icon-folder-opened"></i>
                <p>暂无数据</p>
              </div>
            </template>
          </el-table>
        </section>

      </div>
    </main>

    <el-dialog
      v-model="dialogVisible"
      title="样本详细档案"
      width="70%"
      align-center
      draggable
      custom-class="detail-dialog"
      append-to-body
    >
      <div v-if="currentItem" class="dialog-content">
        <div class="detail-summary">
          <div class="ds-item">
            <span class="ds-label">样本编号</span>
            <span class="ds-val primary">{{ currentItem.sampleName }}</span>
          </div>
          <div class="ds-item">
            <span class="ds-label">数据库ID</span>
            <span class="ds-val">{{ currentItem.id }}</span>
          </div>
          <div class="ds-item">
            <span class="ds-label">库位</span>
            <span class="ds-val warning">{{ formatVal(currentItem.storageLocation) }}</span>
          </div>
        </div>

        <el-tabs v-model="activeTab" type="border-card" class="detail-tabs">
          <el-tab-pane label="基础信息" name="basic">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="航次 ID">{{ formatVal(currentItem.cruiseId) }}</el-descriptions-item>
              <el-descriptions-item label="站点 ID">{{ formatVal(currentItem.stationId) }}</el-descriptions-item>
              <el-descriptions-item label="站点类型">{{ formatVal(currentItem.stationType) }}</el-descriptions-item>
              <el-descriptions-item label="时区基准">{{ formatVal(currentItem.timeDatum) }}</el-descriptions-item>
              <el-descriptions-item label="采样开始时间">{{ formatVal(currentItem.sampleStartDate, true) }}</el-descriptions-item>
              <el-descriptions-item label="采样结束时间">{{ formatVal(currentItem.sampleEndDate, true) }}</el-descriptions-item>
              <el-descriptions-item label="采样日期">{{ formatVal(currentItem.sampleDate, true) }}</el-descriptions-item>
              <el-descriptions-item label="创建/更新">{{ formatVal(currentItem.updatedTime, true) }}</el-descriptions-item>
            </el-descriptions>
            <div class="sub-title">深度数据</div>
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="水深">{{ formatVal(currentItem.waterDepth, ' m') }}</el-descriptions-item>
              <el-descriptions-item label="上层深度">{{ formatVal(currentItem.upperDepth, ' m') }}</el-descriptions-item>
              <el-descriptions-item label="下层深度">{{ formatVal(currentItem.lowerDepth, ' m') }}</el-descriptions-item>
              <el-descriptions-item label="拖网起始深">{{ formatVal(currentItem.towStartDepth, ' m') }}</el-descriptions-item>
              <el-descriptions-item label="拖网终止深">{{ formatVal(currentItem.towEndDepth, ' m') }}</el-descriptions-item>
              <el-descriptions-item label="深度单位">{{ formatVal(currentItem.depthUnits || currentItem.waterDepthUnits) }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="采样设备" name="device">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="采样器 (Sampler)">{{ formatVal(currentItem.sampler) }}</el-descriptions-item>
              <el-descriptions-item label="采集方法">{{ formatVal(currentItem.sampleCollectionMethod) }}</el-descriptions-item>
              <el-descriptions-item label="设备名称">{{ formatVal(currentItem.samplingDevice) }}</el-descriptions-item>
              <el-descriptions-item label="品牌/型号">{{ formatVal(currentItem.samplingDeviceBrandModel) }}</el-descriptions-item>
              <el-descriptions-item label="设备尺寸">{{ formatVal(currentItem.samplingDeviceSize) }}</el-descriptions-item>
              <el-descriptions-item label="垂直基准">{{ formatVal(currentItem.verticalDatum) }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="样本属性" name="attr">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="基质类型">{{ formatVal(currentItem.matrixType) }}</el-descriptions-item>
              <el-descriptions-item label="生境类型">{{ formatVal(currentItem.habitatType) }}</el-descriptions-item>
              <el-descriptions-item label="采样体积">{{ formatVal(currentItem.volumeSampled, ' L') }}</el-descriptions-item>
              <el-descriptions-item label="采样重量">{{ formatVal(currentItem.weightSampled) }}</el-descriptions-item>
              <el-descriptions-item label="采样面积">{{ formatVal(currentItem.areaSampled) }}</el-descriptions-item>
              <el-descriptions-item label="总长度">{{ formatVal(currentItem.totalLength) }}</el-descriptions-item>
              <el-descriptions-item label="回收率">{{ formatVal(currentItem.recoveryPercent, '%') }}</el-descriptions-item>
              <el-descriptions-item label="层位">{{ formatVal(currentItem.layerSampled) }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="描述与备注" name="desc">
            <div class="desc-text-block">
              <span class="label">生境描述:</span>
              <p>{{ formatVal(currentItem.habitatDescription) }}</p>
            </div>
            <div class="desc-text-block">
              <span class="label">岩石描述:</span>
              <p>{{ formatVal(currentItem.rockDescription) }}</p>
            </div>
            <div class="desc-text-block">
              <span class="label">碎屑描述:</span>
              <p>{{ formatVal(currentItem.detritus) }}</p>
            </div>
            <div class="desc-text-block">
              <span class="label">备注:</span>
              <p>{{ formatVal(currentItem.remarks) }}</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
// 确保引入路径正确
import { api } from '@/api/management.js'

const route = useRoute()
const router = useRouter()

// === 状态 ===
const loading = ref(false)
const stationId = ref('')
const sampleList = ref([])
const searchText = ref('')
const dialogVisible = ref(false)
const currentItem = ref(null)
const activeTab = ref('basic')

// 图表实例
const depthChartRef = ref(null)
const matrixChartRef = ref(null)
let depthChart = null
let matrixChart = null

// === 计算属性 ===
const stationType = computed(() => {
  if (!sampleList.value || sampleList.value.length === 0) return ''
  const first = sampleList.value.find(s => s.stationType)
  return first ? first.stationType : ''
})

const filteredList = computed(() => {
  if (!searchText.value) return sampleList.value
  const key = searchText.value.toLowerCase()
  return sampleList.value.filter(item => {
    return (item.sampleName && item.sampleName.toLowerCase().includes(key)) ||
           (item.sampler && item.sampler.toLowerCase().includes(key)) ||
           (item.matrixType && item.matrixType.toLowerCase().includes(key))
  })
})

const maxDepth = computed(() => {
  if (!sampleList.value.length) return 0
  const depths = sampleList.value.map(s => parseFloat(s.lowerDepth || s.waterDepth || s.towMaxDepth || 0))
  return Math.max(...depths).toFixed(1)
})

const avgRecovery = computed(() => {
  if (!sampleList.value.length) return 0
  let total = 0, count = 0
  sampleList.value.forEach(s => {
    if (s.recoveryPercent) {
      total += parseFloat(s.recoveryPercent)
      count++
    }
  })
  return count ? (total / count).toFixed(1) : 0
})

const deviceCount = computed(() => {
  const set = new Set()
  sampleList.value.forEach(s => {
    const dev = s.sampler || s.samplingDevice
    if (dev) set.add(dev)
  })
  return set.size
})

// === 初始化 ===
onMounted(() => {
  stationId.value = route.query.stationId || route.params.id || ''
  if (stationId.value) {
    fetchData()
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  depthChart && depthChart.dispose()
  matrixChart && matrixChart.dispose()
})

async function fetchData() {
  loading.value = true
  try {
    const res = await api.samples.queryByStationIds([stationId.value])
    let data = []
    if (Array.isArray(res)) data = res
    else if (res && res.data && Array.isArray(res.data)) data = res.data
    else if (res && Array.isArray(res.data)) data = res.data
    
    sampleList.value = data
    nextTick(() => { initCharts() })
  } catch (err) {
    console.error('Data Fetch Error:', err)
    sampleList.value = []
  } finally {
    loading.value = false
  }
}

// === 业务逻辑 ===
function openDetail(row) {
  currentItem.value = row
  activeTab.value = 'basic'
  dialogVisible.value = true
}

function formatVal(val, suffix = '') {
  if (val === null || val === undefined || val === '') return '未记录'
  if (typeof val === 'boolean') return val ? '是' : '否'
  if (suffix === true) return formatTime(val)
  return String(val) + suffix
}

function formatTime(t, short = false) {
  if (!t) return short ? '-' : '未记录'
  const s = t.replace('T', ' ')
  return short ? s.substring(0, 16) : s
}

function formatDepthSimple(row) {
  const d = row.waterDepth || row.lowerDepth || row.towMaxDepth
  return d ? parseFloat(d).toFixed(1) : '-'
}

// === 图表绘制 ===
function initCharts() {
  if (sampleList.value.length === 0) {
      if (depthChart) depthChart.clear()
      if (matrixChart) matrixChart.clear()
      return
  }

  // 1. 深度分布图
  if (depthChartRef.value) {
    if (depthChart) depthChart.dispose()
    depthChart = echarts.init(depthChartRef.value)
    
    const rawData = sampleList.value.map(s => parseFloat(s.lowerDepth || s.waterDepth || 0));
    const avgVal = rawData.length ? (rawData.reduce((a, b) => a + b, 0) / rawData.length).toFixed(1) : 0;
    
    const xData = sampleList.value.map((_, i) => i); 
    const yData = rawData;

    depthChart.setOption({
      backgroundColor: 'transparent',
      grid: { top: '15%', bottom: '5%', left: '12%', right: '10%', containLabel: false },
      tooltip: { 
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        padding: 12,
        textStyle: { color: '#1e293b' },
        formatter: (params) => {
          if (!params.length) return ''
          const idx = params[0].dataIndex;
          const item = sampleList.value[idx];
          const val = params[0].value;
          return `
            <div style="font-weight:600;margin-bottom:6px;color:#0f172a">${item.sampleName || '未命名'}</div>
            <div style="display:flex;justify-content:space-between;width:160px;margin-bottom:4px">
              <span style="color:#64748b">深度:</span>
              <span style="font-weight:bold;color:#0ea5e9">${val} m</span>
            </div>
            <div style="display:flex;justify-content:space-between;width:160px">
              <span style="color:#64748b">设备:</span>
              <span>${item.sampler || '-'}</span>
            </div>
          `
        }
      },
      xAxis: { 
        type: 'category', data: xData, show: false, 
      },
      yAxis: { 
        type: 'value', name: '深度 (m)', nameLocation: 'start',
        nameTextStyle: { align: 'right', padding: [0, 8, 0, 0], color: '#64748b' },
        inverse: true, 
        splitLine: { show: true, lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontFamily: 'Inter, sans-serif' }
      },
      dataZoom: [
        { type: 'inside', xAxisIndex: 0, zoomOnMouseWheel: true },
        { type: 'slider', show: rawData.length > 20, height: 12, bottom: 5, borderColor: 'transparent', backgroundColor: '#f1f5f9' }
      ],
      series: [{
        name: '采样深度', type: 'bar', data: yData,
        barMaxWidth: 24, barMinWidth: 6, showBackground: true,
        backgroundStyle: { color: 'rgba(241, 245, 249, 0.5)', borderRadius: [0, 0, 4, 4] },
        itemStyle: {
          borderRadius: [0, 0, 8, 8],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#7dd3fc' }, 
            { offset: 0.5, color: '#38bdf8' },
            { offset: 1, color: '#0284c7' } 
          ])
        },
        emphasis: { itemStyle: { color: '#0ea5e9', shadowBlur: 10, shadowColor: 'rgba(14, 165, 233, 0.5)' } },
        markLine: {
          silent: true, symbol: 'none',
          lineStyle: { type: 'solid', color: '#f59e0b', width: 2, opacity: 0.8 },
          label: { 
            position: 'insideEndTop', formatter: 'Avg: {c}m', color: '#d97706',
            fontSize: 11, padding: [4, 8], backgroundColor: 'rgba(254, 243, 199, 0.9)', borderRadius: 4, fontWeight: 600
          },
          data: [ { yAxis: avgVal } ]
        }
      }]
    })
  }

  // 2. 基质类型图
  if (matrixChartRef.value) {
    if (matrixChart) matrixChart.dispose()
    matrixChart = echarts.init(matrixChartRef.value)
    
    const map = {}
    sampleList.value.forEach(s => {
      const k = s.matrixType || '未记录'
      map[k] = (map[k] || 0) + 1
    })
    const data = Object.keys(map).map(k => ({ name: k, value: map[k] })).sort((a, b) => b.value - a.value);
      
    matrixChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'item', backgroundColor: 'rgba(255, 255, 255, 0.95)', textStyle: { color: '#334155' },
        formatter: (params) => {
           return `<div style="font-weight:600;color:${params.color}">${params.name}</div>
                   <div style="margin-top:4px">数量: <b>${params.value}</b></div>
                   <div>占比: <b>${params.percent}%</b></div>`
        }
      },
      legend: {
        type: 'scroll', orient: 'vertical', right: '2%', top: 'center', itemGap: 16,
        itemWidth: 12, itemHeight: 12, icon: 'circle',
        textStyle: { color: '#64748b', fontSize: 13, fontFamily: 'Inter, sans-serif' }
      },
      color: ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#94a3b8'],
      series: [{
        name: '基质类型', type: 'pie', radius: ['50%', '70%'], center: ['32%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 4 },
        label: { show: false, position: 'center' },
        emphasis: {
          scale: true, scaleSize: 8,
          label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#334155', formatter: '{b}\n{d}%', fontFamily: 'Inter, sans-serif' }
        },
        labelLine: { show: false }, data: data
      }]
    })
  }
}

function handleResize() {
  depthChart && depthChart.resize()
  matrixChart && matrixChart.resize()
}

function goBack() {
  router.back()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
/* 如需等宽字体，可选引入: */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&display=swap');

/* --- 基础布局 --- */
.station-dashboard {
  height: 100vh;
  display: flex; flex-direction: column;
  background-color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
}

/* --- 顶部 Header 美化 --- */
.dashboard-header {
  height: 80px; 
  flex-shrink: 0;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 40px; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  z-index: 10;
}

.header-left {
  display: flex; align-items: center; 
}

/* 1. 美化返回按钮 - 胶囊样式 + SVG图标 */
.back-btn-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: #f8fafc; /* 浅灰背景 */
  border: 1px solid #e2e8f0; 
  border-radius: 20px; /* 胶囊圆角 */
  padding: 8px 16px;
  transition: all 0.2s ease;
  color: #475569;
}
.back-btn-wrapper:hover {
  background-color: #fff;
  border-color: #65a30d; /* 悬停绿色边框 */
  box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
.back-btn-wrapper:hover .back-icon-svg {
  fill: #65a30d; /* 悬停图标变绿 */
}
.back-btn-wrapper:hover .back-text {
  color: #0f172a;
}
/* SVG 图标样式 */
.back-icon-svg {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  fill: #84cc16; /* 默认使用 Lime Green */
  transition: fill 0.2s ease;
}
.back-text {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  transition: color 0.2s ease;
}

/* 竖线分割符 */
.header-divider {
  width: 1px; height: 32px;
  background-color: #e2e8f0;
  margin: 0 32px; 
}

/* 标题组美化 */
.title-group {
  display: flex; flex-direction: column; justify-content: center;
}
.sub-label {
  font-size: 13px; font-weight: 600; color: #94a3b8; line-height: 1; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;
}
.main-title-row {
  display: flex; align-items: center; gap: 16px; 
}
.main-title {
  font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1; letter-spacing: -1px;
}
.station-tag {
  border: none; font-weight: 600; padding: 0 12px; height: 24px; line-height: 24px; border-radius: 6px;
}

/* --- 主内容区 --- */
.dashboard-body { flex: 1; overflow-y: auto; padding: 40px; } 
.content-container { max-width: 1600px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }

/* --- 2. 核心指标卡片 美化 (质感升级) --- */
.metrics-section {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
}

.metric-card {
  background: #fff;
  padding: 30px; 
  border-radius: 24px; 
  border: 1px solid #fff; 
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05); 
  display: flex; align-items: center; gap: 24px;
  transition: all 0.3s ease;
  position: relative; overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.1);
}

.m-icon-box {
  width: 72px; height: 72px; 
  border-radius: 20px; 
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; color: #fff;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.3), 0 12px 20px -8px rgba(0,0,0,0.2); 
  flex-shrink: 0;
}
.m-icon-box.blue   { background: linear-gradient(135deg, #60a5fa, #2563eb); }
.m-icon-box.cyan   { background: linear-gradient(135deg, #22d3ee, #0891b2); }
.m-icon-box.purple { background: linear-gradient(135deg, #c084fc, #9333ea); }
.m-icon-box.orange { background: linear-gradient(135deg, #fb923c, #ea580c); }

.m-content { display: flex; flex-direction: column; justify-content: center; }
.m-val {
  font-size: 36px; 
  font-weight: 800;
  color: #1e293b;
  line-height: 1.1;
  letter-spacing: -1.5px;
  font-family: 'Inter', sans-serif;
}
.m-val .unit {
  font-size: 16px; font-weight: 600; color: #94a3b8; margin-left: 6px; letter-spacing: 0;
}
.m-lbl {
  font-size: 15px; font-weight: 500; color: #64748b; margin-top: 6px;
}

/* --- 图表区容器 --- */
.charts-section { display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; }
.chart-wrapper {
  background: #fff; border-radius: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  padding: 32px;
  transition: all 0.3s ease;
  border: 1px solid #f8fafc;
}
.chart-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
}
.chart-header { margin-bottom: 24px; display: flex; align-items: center; }
.chart-title { font-size: 18px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px; }
.chart-title i { color: #94a3b8; font-size: 20px; }
.chart-body { height: 360px; width: 100%; }

/* --- 4. 表格区优化 --- */
.table-section {
  background: #fff; border-radius: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  padding: 32px;
  border: 1px solid #f8fafc;
  display: flex; flex-direction: column; gap: 24px;
}
.section-head { display: flex; justify-content: space-between; align-items: center; }
.head-left { display: flex; align-items: center; gap: 12px; }
.decoration-line { width: 4px; height: 18px; background: #3b82f6; border-radius: 2px; }
.section-head h3 { font-size: 18px; font-weight: 700; margin: 0; color: #1e293b; letter-spacing: -0.5px; }

/* 搜索框 */
.search-input { width: 260px; }
:deep(.search-input .el-input__wrapper) { box-shadow: 0 0 0 1px #e2e8f0 inset !important; border-radius: 8px; padding: 8px 12px; transition: all 0.2s; }
:deep(.search-input .el-input__wrapper:hover) { box-shadow: 0 0 0 1px #cbd5e1 inset !important; }
:deep(.search-input .el-input__wrapper.is-focus) { box-shadow: 0 0 0 2px #bfdbfe inset !important; }

/* 表格内容美化 */
.custom-table { border-radius: 12px; overflow: hidden; }
:deep(.el-table__inner-wrapper::before) { display: none; } /* 去掉底部横线 */

/* 序号 */
.index-badge { font-family: 'Inter', sans-serif; color: #94a3b8; font-weight: 500; font-size: 13px; }

/* 样本编号 (等宽字体) */
.sample-code { display: flex; align-items: center; gap: 8px; }
.code-text {
  font-family: 'JetBrains Mono', 'Roboto Mono', monospace; 
  font-weight: 600; color: #0f172a; font-size: 14px;
  background: #f8fafc; padding: 4px 8px; border-radius: 6px; border: 1px solid #f1f5f9;
}

/* 深度 */
.depth-text { font-weight: 700; color: #334155; font-family: 'Inter', sans-serif; }

/* 基质 Tag */
.matrix-tag {
  display: inline-block; padding: 4px 10px; background-color: #f0f9ff;
  color: #0369a1; border-radius: 6px; font-size: 12px; font-weight: 600; border: 1px solid #e0f2fe;
}

/* 设备 & 时间 */
.device-text { color: #475569; font-size: 13px; }
.time-text { color: #94a3b8; font-size: 12px; font-variant-numeric: tabular-nums; }

/* 操作按钮 (胶囊) */
.action-btn {
  display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px;
  background-color: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 600;
  border-radius: 20px; cursor: pointer; transition: all 0.2s ease; user-select: none;
}
.action-btn:hover {
  background-color: #2563eb; color: #fff; box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.4); transform: translateY(-1px);
}
.action-btn:active { transform: translateY(0); }

.empty-state { text-align: center; padding: 60px; color: #94a3b8; }
.empty-state i { font-size: 48px; margin-bottom: 16px; opacity: 0.4; }

/* --- 弹窗 --- */
:deep(.detail-dialog) { border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
:deep(.el-dialog__header) { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; }
:deep(.el-dialog__body) { padding: 32px; }
:deep(.el-dialog__footer) { padding: 20px 32px; border-top: 1px solid #f1f5f9; background: #fcfcfc; }
.detail-summary { display: flex; gap: 60px; padding: 32px; background: #f8fafc; border-radius: 16px; margin-bottom: 32px; border: 1px solid #f1f5f9; }
.ds-item { display: flex; flex-direction: column; gap: 8px; }
.ds-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
.ds-val { font-size: 24px; font-weight: 800; color: #0f172a; }
.ds-val.primary { color: #2563eb; }
.ds-val.warning { color: #f59e0b; }

/* 响应式 */
@media (max-width: 1400px) {
  .metrics-section { grid-template-columns: 1fr 1fr; }
  .charts-section { grid-template-columns: 1fr; }
}
</style>