<template>
  <div class="chem-detail-page">
    
    <header class="top-navbar">
      <div class="nav-container">
        
        <div class="nav-left">
          <button class="nav-back-btn" @click="goBack">
            <svg class="icon-back" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>返回列表</span>
          </button>

          <div class="nav-divider"></div>

          <div class="title-group">
            <div class="title-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="text-col">
              <h1 class="page-title">化学样本分析报告</h1>
              <span class="sub-badge">REPORT VIEW</span>
            </div>
          </div>
        </div>

        <div class="nav-right" v-if="chemData.updatedTime">
          <div class="time-pill">
            <span class="status-dot"></span>
            <span class="time-label">数据更新: {{ formatDateTime(chemData.updatedTime) }}</span>
          </div>
        </div>

      </div>
    </header>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>数据加载中...</p>
    </div>

    <main class="main-container" v-if="!loading && hasData">
      
      <aside class="left-sidebar">
        <div class="profile-card full-height">
          
          <div class="card-header-bold">
            <div class="header-row">
              <span class="header-label"> SAMPLE ID（样本 ID）</span>
              <span class="matrix-badge">{{ chemData.labMatrixName || 'NA' }}</span>
            </div>
            <div class="id-row">
              <span class="large-id">{{ chemData.sampleId || chemData.id }}</span>
              <button class="copy-btn-simple" title="复制ID">⧉</button>
            </div>
          </div>

          <div class="card-body-filled">
            
            <div class="data-group lab-group">
              <div class="group-icon">🏢</div>
              <div class="group-content">
                <span class="group-label">所属实验室 (Laboratory)</span>
                <span class="group-value-lg" v-html="formatNull(chemData.laboratory)"></span>
              </div>
            </div>

            <div class="grid-container">
              <div class="grid-box">
                <span class="box-label">航次编号 (Cruise)</span>
                <span class="box-value">{{ chemData.cruiseId || '-' }}</span>
              </div>
              <div class="grid-box">
                <span class="box-label">监测站点 (Station)</span>
                <span class="box-value">{{ chemData.stationId || '-' }}</span>
              </div>
              
              <div class="grid-box full-width depth-box">
                <div class="row-flex">
                  <div class="depth-text-col">
                    <span class="box-label">采样深度 (Depth)</span>
                    <div class="value-row">
                      <span class="depth-value">{{ chemData.ctdDepth ?? 0 }}</span>
                      <span class="unit-text">m</span>
                    </div>
                  </div>
                  <div class="depth-icon">🌊</div>
                </div>
              </div>
            </div>

            <div class="list-container">
              <div class="list-item bottom-border">
                <span class="item-icon">📅</span>
                <div class="item-info">
                  <span class="item-label">采样日期 (Date)</span>
                  <span class="item-value">{{ formatDateSimple(chemData.ctdSampleDate) }}</span>
                </div>
              </div>
              <div class="list-item">
                <span class="item-icon">🔬</span>
                <div class="item-info">
                  <span class="item-label">分析技术 (Technique)</span>
                  <span class="item-value">{{ chemData.analyticalTechnique || '未录入' }}</span>
                </div>
              </div>
            </div>

            <div class="remark-section">
              <div class="remark-header">
                <span>📝 备注说明 (Remarks)</span>
              </div>
              <div class="remark-body">
                {{ chemData.remarks || '暂无相关备注信息。' }}
              </div>
            </div>

          </div>
        </div>
      </aside>

      <div class="right-content">
        
        <div class="charts-row" v-if="hasDetailList">
          <div class="content-card">
            <div class="card-title-box">
              <span class="line-mark"></span>
              <span class="title-text">组分构成分布</span>
            </div>
            <div class="chart-box" ref="pieChartRef"></div>
          </div>
          <div class="content-card">
            <div class="card-title-box">
              <span class="line-mark"></span>
              <span class="title-text">多维数据评估</span>
            </div>
            <div class="chart-box" ref="radarChartRef"></div>
          </div>
        </div>

        <div class="charts-row single-col" v-if="hasDetailList">
          <div class="content-card">
            <div class="card-header-flex">
              <div class="card-title-box">
                <span class="line-mark"></span>
                <span class="title-text">参数数值统计</span>
              </div>
              <div class="category-tabs" v-if="uniqueCategories.length > 0">
                <span 
                  v-for="cat in uniqueCategories.slice(0, 6)" 
                  :key="cat" 
                  :class="['tab-item', { active: currentCategory === cat }]"
                  @click="changeCategory(cat)"
                >
                  {{ cat }}
                </span>
              </div>
            </div>
            <div class="chart-box wide" ref="barChartRef"></div>
          </div>
        </div>

        <div class="table-section" v-if="hasDetailList">
          <div class="content-card no-padding">
            <div class="table-header">
              <div class="th-title">
                <span class="t-icon">📄</span> 详细测量记录
              </div>
              <span class="t-badge">{{ filteredList.length }} 项数据</span>
            </div>
            
            <div class="table-wrapper">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th class="text-left" style="width: 30%">检测参数 (Parameter)</th>
                    <th class="text-center" style="width: 20%">所属分类</th>
                    <th class="text-center" style="width: 30%">测定结果 (Result)</th>
                    <th class="text-center" style="width: 20%">单位 (Unit)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in filteredList" :key="index">
                    <td class="text-left">
                      <span class="param-name">{{ item.analysis }}</span>
                    </td>
                    <td class="text-center">
                      <span :class="['status-badge', getCatClass(item.category)]">
                        {{ item.category || 'Unclassified' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="result-value" v-if="item.analysisResult !== null">
                        {{ formatNumber(item.analysisResult) }}
                      </span>
                      <span class="result-null" v-else>--</span>
                    </td>
                    <td class="text-center">
                      <span class="unit-box" v-html="formatNull(item.units)"></span>
                    </td>
                  </tr>
                  <tr v-if="filteredList.length === 0">
                    <td colspan="4" class="empty-row">
                      <div class="empty-state">暂无详细数据</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </main>

    <div v-if="!loading && !hasData" class="error-state">
      <div class="error-box">
        <div class="error-icon">⚠️</div>
        <h3>未找到相关数据</h3>
        <button class="btn-primary" @click="goBack">返回列表</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/api/management' 
import * as echarts from 'echarts'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const chemData = ref({})
const currentCategory = ref('') 

const pieChartRef = ref(null)
const barChartRef = ref(null)
const radarChartRef = ref(null)
let pieChartInstance = null
let barChartInstance = null
let radarChartInstance = null

const categoryMap = {
  'Nutrients': '营养盐',
  'Silicates': '硅酸盐',
  'Water Properties': '水体性质',
  'Trace Metals': '微量金属',
  'Isotopes': '同位素',
  'Halocarbons': '卤代烃',
  'Unclassified': '未分类'
}

const hasData = computed(() => chemData.value && (chemData.value.id || chemData.value.sampleId))
const hasDetailList = computed(() => Array.isArray(chemData.value.detailList) && chemData.value.detailList.length > 0)

const uniqueCategories = computed(() => {
  if (!hasDetailList.value) return []
  const cats = new Set(chemData.value.detailList.map(item => item.category || 'Unclassified'))
  return Array.from(cats).sort()
})

const filteredList = computed(() => {
  if (!hasDetailList.value) return []
  if (!currentCategory.value) return chemData.value.detailList
  return chemData.value.detailList.filter(item => (item.category || 'Unclassified') === currentCategory.value)
})

function formatNull(val) { return (val === null || val === undefined || val === '') ? '--' : val }

// 【修复】日期处理：只保留 YYYY-MM-DD
function formatDateSimple(dateStr) {
  if (!dateStr) return 'N/A'
  return String(dateStr).split('T')[0].split(' ')[0]
}

// 【新增】顶部时间格式化：YYYY-MM-DD HH:mm
function formatDateTime(dateStr) {
  if (!dateStr) return ''
  try {
    let cleanStr = String(dateStr).replace('T', ' ')
    if (cleanStr.includes('.')) {
      cleanStr = cleanStr.split('.')[0]
    }
    return cleanStr.substring(0, 16)
  } catch (e) {
    return dateStr
  }
}

function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '--'
  return val
}

function getCatClass(cat) {
  if (!cat) return 'gray'
  const c = cat.toLowerCase()
  if (c.includes('nutrient')) return 'blue'
  if (c.includes('metal')) return 'purple'
  if (c.includes('silicate')) return 'green'
  return 'gray'
}
function goBack() { router.back() }

onMounted(async () => {
  const id = route.params.id
  if (!id) { loading.value = false; return }
  try {
    const res = await api.chemResults.detail(id)
    const data = res.data || res 
    if (data) {
      chemData.value = data
      if (uniqueCategories.value.length > 0) currentCategory.value = uniqueCategories.value[0]
      nextTick(() => initCharts())
    }
  } catch (e) { console.error(e) } finally { loading.value = false }
})

watch(currentCategory, () => updateBarChart())

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChartInstance?.dispose()
  barChartInstance?.dispose()
  radarChartInstance?.dispose()
})

function handleResize() {
  pieChartInstance?.resize()
  barChartInstance?.resize()
  radarChartInstance?.resize()
}

function initCharts() {
  if (!hasDetailList.value) return
  window.addEventListener('resize', handleResize)
  try { initPieChart(); initRadarChart(); initBarChart(); } catch (e) { console.error(e) }
}

function initPieChart() {
  if (!pieChartRef.value) return
  pieChartInstance = echarts.init(pieChartRef.value)
  const countMap = {}
  chemData.value.detailList.forEach(item => { const cat = item.category || 'Unclassified'; countMap[cat] = (countMap[cat] || 0) + 1 })
  
  const data = Object.keys(countMap).map(key => {
    const cnName = categoryMap[key]
    const displayName = cnName ? `${key} ${cnName}` : key
    return { name: displayName, value: countMap[key] }
  })

  pieChartInstance.setOption({
    color: ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'],
    tooltip: { trigger: 'item', backgroundColor:'rgba(255,255,255,0.95)', textStyle:{color:'#333'} },
    legend: { bottom: 0, icon: 'circle', type: 'scroll' },
    series: [{
      type: 'pie', radius: ['45%', '65%'], center: ['50%', '45%'],
      itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      label: { show: false }, data
    }]
  })
}

function initRadarChart() {
  if (!radarChartRef.value) return
  radarChartInstance = echarts.init(radarChartRef.value)
  const categories = uniqueCategories.value.slice(0, 6)
  const values = categories.map(cat => chemData.value.detailList.filter(i => (i.category || 'Unclassified') === cat).length)
  const maxVal = Math.max(...values, 5) + 2
  
  const indicators = categories.map(c => {
    const cnName = categoryMap[c]
    const displayName = cnName ? `${c}\n(${cnName})` : c
    return { name: displayName, max: maxVal }
  })

  radarChartInstance.setOption({
    tooltip: { trigger: 'item' },
    radar: {
      indicator: indicators,
      radius: '65%', 
      splitNumber: 4, 
      axisName: { color: '#64748b', lineHeight: 16 }, 
      splitArea: { show: true, areaStyle: { color: ['#f8fafc', '#fff'] } }
    },
    series: [{
      type: 'radar', data: [{
        value: values, name: '分布情况',
        areaStyle: { color: 'rgba(139,92,246,0.2)' },
        lineStyle: { width: 2, color: '#8b5cf6' },
        itemStyle: { color: '#8b5cf6' }
      }]
    }]
  })
}

function initBarChart() {
  if (!barChartRef.value) return
  barChartInstance = echarts.init(barChartRef.value)
  updateBarChart()
}

function updateBarChart() {
  if (!barChartInstance) return
  const list = filteredList.value.slice(0, 15)
  const names = list.map(item => item.analysis)
  const plotValues = list.map(item => { const v = parseFloat(item.analysisResult); return isNaN(v) ? 0 : v })
  const rawValues = list.map(item => item.analysisResult)
  barChartInstance.setOption({
    tooltip: {
      trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)',
      formatter: (params) => {
        const idx = params[0].dataIndex
        return `<b>${params[0].name}</b><br/><span style="color:#0ea5e9">${rawValues[idx]}</span>`
      }
    },
    grid: { left: '3%', right: '3%', bottom: '5%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: names, axisLabel: { color: '#64748b', width: 80, overflow: 'break' }, axisTick: {show:false}, axisLine: {show:false} },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } },
    series: [{
      type: 'bar', data: plotValues, barMaxWidth: 24,
      itemStyle: { borderRadius: [4,4,0,0], color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#22d3ee'},{offset:1,color:'#0ea5e9'}]) },
      showBackground: true, backgroundStyle: { color: '#f8fafc', borderRadius: [4,4,0,0] }
    }]
  }, true)
}

function changeCategory(cat) { currentCategory.value = cat }
</script>

<style scoped>
.chem-detail-page {
  --bg-color: #f3f6f9;
  --card-bg: #ffffff;
  --primary: #2563eb;
  --text-main: #1e293b;
  --text-sub: #64748b;
  --border: #e2e8f0;
  --shadow: 0 4px 12px rgba(0,0,0,0.05);
  
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  min-height: 100vh;
  padding-bottom: 40px;
}

/* 1. 顶部导航 - 重构为经典美观版 */
.top-navbar {
  background: #fff;
  height: 64px;
  padding: 0 40px;
  display: flex; align-items: center;
  border-bottom: 1px solid #e6e9eb;
  position: sticky; top: 0; z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.nav-container { 
  width: 100%; max-width: 1600px; margin: 0 auto; 
  display: flex; justify-content: space-between; align-items: center; 
}

.nav-left { display: flex; align-items: center; height: 100%; }

/* 返回按钮：文字+图标 */
.nav-back-btn {
  display: flex; align-items: center; gap: 6px;
  background: transparent; border: none; cursor: pointer;
  padding: 8px 12px; margin-left: -12px; /* 视觉对齐 */
  border-radius: 8px; color: #64748b; font-size: 14px; font-weight: 500;
  transition: all 0.2s;
}
.nav-back-btn:hover { background: #f1f5f9; color: var(--primary); }
.icon-back { stroke-width: 2.5; }

/* 垂直分割线 */
.nav-divider {
  width: 1px; height: 20px; background: #cbd5e1; margin: 0 20px; opacity: 0.6;
}

/* 标题组 */
.title-group { display: flex; align-items: center; gap: 12px; }
.title-icon-box {
  width: 32px; height: 32px; background: #eff6ff; color: #2563eb;
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
}
.text-col { display: flex; align-items: baseline; gap: 8px; }

.page-title { 
  font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; 
  letter-spacing: -0.2px; 
}
.sub-badge { 
  font-size: 11px; font-weight: 700; color: #94a3b8; 
  background: #f8fafc; border: 1px solid #f1f5f9;
  padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px;
}

/* 右侧时间胶囊 */
.time-pill {
  display: flex; align-items: center; gap: 8px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  padding: 6px 14px; border-radius: 20px;
}
.status-dot { 
  width: 6px; height: 6px; background: #10b981; 
  border-radius: 50%; 
}
.time-label { font-size: 12px; color: #64748b; font-family: sans-serif; }


/* 2. 核心布局 */
.main-container {
  max-width: 1600px; 
  margin: 32px auto; padding: 0 40px;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 32px;
  align-items: start;
}

/* 3. 左侧侧边栏 */
.left-sidebar {
  position: sticky; top: 96px;
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.profile-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
  min-height: calc(100vh - 140px);
  display: flex; flex-direction: column; overflow: hidden;
}

.card-header-bold {
  background: #1e293b; padding: 24px; color: #fff;
}
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.header-label { font-size: 12px; font-weight: 700; opacity: 0.6; letter-spacing: 1px; }
.matrix-badge { 
  background: #0ea5e9; color: #fff; padding: 4px 10px; 
  border-radius: 4px; font-size: 13px; font-weight: 700;
}
.id-row { display: flex; justify-content: space-between; align-items: center; }
.large-id { 
  font-size: 36px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1; letter-spacing: -1px;
}
.copy-btn-simple {
  background: rgba(255,255,255,0.1); border: none; color: #fff;
  width: 36px; height: 36px; border-radius: 8px; font-size: 18px; cursor: pointer; transition: background 0.2s;
}
.copy-btn-simple:hover { background: rgba(255,255,255,0.2); }

.card-body-filled {
  padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 20px; background: #f8fafc;
}

.data-group, .grid-container, .list-container, .remark-section {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.lab-group { padding: 20px; display: flex; align-items: flex-start; gap: 16px; border-left: 5px solid #3b82f6; }
.group-icon { font-size: 28px; line-height: 1; }
.group-content { display: flex; flex-direction: column; gap: 6px; }
.group-label { font-size: 13px; color: #64748b; font-weight: 600; }
.group-value-lg { font-size: 18px; color: #0f172a; font-weight: 700; line-height: 1.4; word-break: break-all; }

.grid-container { display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
.grid-box { padding: 20px; display: flex; flex-direction: column; gap: 8px; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
.grid-box:nth-child(2) { border-right: none; }
.grid-box.full-width { grid-column: span 2; border-bottom: none; border-right: none; background: #f0f9ff; }

.box-label { font-size: 13px; color: #64748b; font-weight: 600; }
.box-value { font-size: 20px; font-family: monospace; font-weight: 700; color: #334155; }

/* 深度显示修正：分层布局 */
.depth-box .row-flex { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.depth-text-col { display: flex; flex-direction: column; gap: 8px; }
.value-row { display: flex; align-items: baseline; gap: 4px; }
.depth-value { 
  font-size: 32px; font-weight: 800; color: #0284c7; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1;
}
.unit-text { font-size: 14px; color: #64748b; font-weight: 600; }
.depth-icon { font-size: 32px; opacity: 0.8; }

.list-container { display: flex; flex-direction: column; }
.list-item { padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
.list-item.bottom-border { border-bottom: 1px solid #f1f5f9; }
.item-icon { font-size: 20px; width: 40px; height: 40px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.item-info { display: flex; flex-direction: column; gap: 4px; }
.item-label { font-size: 12px; color: #64748b; }
.item-value { font-size: 16px; font-weight: 600; color: #1e293b; }

.remark-section { flex: 1; display: flex; flex-direction: column; background: #fffbeb; border-color: #fcd34d; min-height: 150px; }
.remark-header { padding: 12px 16px; border-bottom: 1px dashed #fcd34d; font-size: 13px; font-weight: 700; color: #92400e; }
.remark-body { padding: 16px; font-size: 14px; color: #78350f; line-height: 1.6; flex: 1; }

/* 4. 右侧内容流 */
.right-content { display: flex; flex-direction: column; gap: 32px; }
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.charts-row.single-col { grid-template-columns: 1fr; }

.content-card {
  background: #fff; border-radius: 16px; padding: 24px; box-shadow: var(--shadow);
  display: flex; flex-direction: column; border: 1px solid #fff;
}
.content-card.no-padding { padding: 0; overflow: hidden; }

.card-title-box { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.line-mark { width: 4px; height: 18px; background: var(--primary); border-radius: 2px; }
.title-text { font-size: 16px; font-weight: 700; color: var(--text-main); }
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-header-flex .card-title-box { margin-bottom: 0; }
.chart-box { height: 280px; width: 100%; }
.chart-box.wide { height: 320px; }

.category-tabs { display: flex; gap: 6px; background: #f1f5f9; padding: 4px; border-radius: 8px; }
.tab-item {
  padding: 6px 14px; font-size: 12px; color: var(--text-sub); font-weight: 600;
  border-radius: 6px; cursor: pointer; transition: 0.2s;
}
.tab-item.active { background: #fff; color: var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

/* 表格 */
.table-header {
  padding: 20px 30px; background: #f8fafc; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.th-title { font-weight: 700; color: var(--text-main); display: flex; gap: 8px; font-size: 15px; }
.t-badge { background: #e2e8f0; font-size: 12px; padding: 4px 10px; border-radius: 12px; color: var(--text-sub); font-weight: 600; }
.table-wrapper { overflow-x: auto; border-radius: 0 0 16px 16px; max-height: 600px; }
.modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.modern-table th {
  background: #f8fafc; color: #64748b; font-size: 13px; font-weight: 700;
  padding: 18px 24px; border-bottom: 2px solid #e2e8f0; white-space: nowrap; letter-spacing: 0.5px;
  position: sticky; top: 0; z-index: 2;
}
.modern-table td {
  padding: 20px 24px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; transition: background 0.2s;
}
.modern-table tr:hover td { background: #f1f5f9; }

.param-name {
  font-size: 15px; font-weight: 700; color: #1e293b; display: block;
  max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.status-badge {
  display: inline-block; padding: 6px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.5px;
}
.status-badge.gray { background: #f1f5f9; color: #64748b; }
.status-badge.blue { background: #eff6ff; color: #3b82f6; }
.status-badge.purple { background: #f3e8ff; color: #7c3aed; }
.status-badge.green { background: #ecfdf5; color: #10b981; }

.result-value {
  font-family: 'SF Mono', 'Roboto Mono', Consolas, monospace;
  font-size: 18px; font-weight: 700; color: #0ea5e9; letter-spacing: -0.5px;
}
.result-null { font-family: monospace; color: #cbd5e1; }
.unit-box {
  display: inline-block; background: #fff; border: 1px solid #e2e8f0;
  padding: 4px 10px; border-radius: 6px; font-size: 13px; color: #64748b; font-weight: 500;
  min-width: 40px; text-align: center;
}

.text-left { text-align: left; }
.text-center { text-align: center; }
.empty-row { text-align: center; padding: 60px 0; color: #94a3b8; }
.empty-state { font-size: 14px; letter-spacing: 1px; opacity: 0.8; }

.loading-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.loading-spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 10px; }
.error-state { height: 60vh; display: flex; align-items: center; justify-content: center; }
.error-box { text-align: center; background: #fff; padding: 40px; border-radius: 12px; box-shadow: var(--shadow); }
.btn-primary { margin-top: 20px; background: var(--primary); color: #fff; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1100px) {
  .main-container { grid-template-columns: 1fr; }
  .left-sidebar { position: static; margin-bottom: 32px; min-height: auto; }
  .profile-card { min-height: auto; }
  .charts-row { grid-template-columns: 1fr; }
}
</style>