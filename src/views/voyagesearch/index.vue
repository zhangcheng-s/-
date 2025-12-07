<template>
  <div class="voyage-layout">
    <aside class="sidebar-panel" :class="{ 'sidebar-collapsed': isMobile }">
      <div class="sidebar-header">
        <div class="nav-title-row">
          <button class="nav-arrow-btn arrow-3d left" @click="$router.push('/management')" title="返回数据管理"></button>
          <div class="brand-title-text">
            <span class="icon">⚓</span>
            <span class="title-text" v-if="!isMobile">航次检索</span>
          </div>
          <button class="nav-arrow-btn arrow-3d right" @click="$router.push('/chemsearch')" title="跳转化学数据查询"></button>
        </div>

        <div class="search-wrap" v-if="!isMobile || showMobileSearch">
          <div class="filter-row">
             <div class="input-group sub">
               <i class="el-icon-ship"></i>
               <input v-model="queryParams.researchVessel" placeholder="筛选船名" @keyup.enter="handleSearch" />
             </div>
             <button class="search-btn" @click="handleSearch">查询</button>
          </div>
        </div>
        
        <button class="mobile-search-toggle" @click="showMobileSearch = !showMobileSearch" v-if="isMobile && !showMobileSearch">
          <i class="el-icon-search"></i> 搜索
        </button>
      </div>

      <div class="nav-list custom-scrollbar" v-loading="loading">
        <div v-if="list.length > 0" class="list-container">
          <div 
            v-for="(item, index) in list" 
            :key="index"
            class="cruise-item"
            :class="{ 'is-active': currentCruiseId === item.id }"
            @click="handleSelectCruise(item); isMobile && toggleMobile()"
            @mouseenter="hoverItemId = item.id"
            @mouseleave="hoverItemId = null"
          >
            <div class="cruise-decor">
              <div class="wave"></div>
              <div class="wave wave-2"></div>
            </div>
            <div class="active-indicator"></div>
            <div class="item-content">
              <div class="item-head">
                <span class="cruise-title" :title="item.cruiseName">
                  <span class="label-tag">航次</span>{{ item.cruiseName || '未命名航次' }}
                </span>
                <span class="cruise-id"><span class="id-label">ID:</span>{{ item.id }}</span>
              </div>
              <div class="item-info">
                <div class="info-grid">
                  <div class="info-row"><i class="el-icon-ship info-icon"></i><span class="info-label">科考船</span><span class="info-val">{{ item.researchVessel || '未知' }}</span></div>
                  <div class="info-row"><i class="el-icon-location info-icon"></i><span class="info-label">海域</span><span class="info-val">{{ item.geographicalArea || '未知' }}</span></div>
                  <div class="info-row"><i class="el-icon-date info-icon"></i><span class="info-label">时间</span><span class="info-val">{{ formatTime(item.createdTime) }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-placeholder">
          <div class="ship-icon">🚢</div>
          <span>暂无航次数据</span>
          <p class="empty-tip">点击查询或创建新航次</p>
        </div>
      </div>

      <div class="sidebar-footer" v-if="!isMobile">
        <button class="page-btn" :disabled="queryParams.page <= 0" @click="changePage(-1)"><i class="el-icon-arrow-left"></i></button>
        <div class="page-info"><span>第 {{ queryParams.page + 1 }} 页</span><span class="total">共 {{ totalPages || '-' }} 页</span></div>
        <button class="page-btn" :disabled="list.length < queryParams.size" @click="changePage(1)"><i class="el-icon-arrow-right"></i></button>
      </div>
    </aside>

    <div class="mobile-overlay" v-if="isMobile" @click="toggleMobile()"></div>

    <main class="main-content">
      <div class="mobile-header" v-if="isMobile">
        <button class="back-btn" @click="toggleMobile()"><i class="el-icon-back"></i></button>
        <h2>航次详情</h2>
      </div>

      <template v-if="currentCruise">
        
        <header class="cruise-header-modern">
          <div class="ambient-glow glow-1"></div>
          <div class="ambient-glow glow-2"></div>

          <div class="header-inner">
            <div class="header-top-row">
              
              <div class="title-area">
                <div class="status-row">
                  <div class="modern-status-badge" :class="getStatusClass(currentCruise.status)">
                    <span class="dot"></span>
                    {{ currentCruise.status || '进行中' }}
                  </div>
                  <div class="modern-id-badge">
                    ID: {{ currentCruise.id }}
                  </div>
                </div>
                <h1 class="modern-title" :title="currentCruise.cruiseName">
                  {{ currentCruise.cruiseName || '未命名航次' }}
                </h1>
              </div>

              <div class="stats-capsule">
                <div class="stat-item">
                  <div class="stat-icon-bg">
                    <i class="el-icon-place"></i>
                  </div>
                  <div class="stat-text">
                    <span class="val">{{ stationList.length }}</span>
                    <span class="lbl">总站点数</span>
                  </div>
                </div>
                
                <div class="v-divider"></div>

                <div class="stat-item">
                  <div class="chart-mini-wrapper">
                    <div ref="gaugeChartRef" class="gauge-chart-container"></div>
                  </div>
                  <div class="stat-text">
                    <span class="val color-active">{{ getProgress() }}%</span>
                    <span class="lbl">完成进度</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="header-cards-row">
              <div 
                v-for="(field, index) in cruiseFieldConfig" 
                :key="index"
                class="bento-card"
                :class="field.theme"
              >
                <div class="bento-icon">
                  <i :class="field.icon"></i>
                </div>
                <div class="bento-info">
                  <span class="bento-label">{{ field.label }}</span>
                  <span class="bento-value" :title="getFieldValue(currentCruise, field)">
                    {{ getFieldValue(currentCruise, field) }}
                  </span>
                </div>
              </div>

              <div class="bento-card desc-card">
                <div class="bento-icon gray">
                  <i class="el-icon-document"></i>
                </div>
                <div class="bento-info">
                  <span class="bento-label">备注说明</span>
                  <span class="bento-value desc" :title="currentCruise.description">
                    {{ currentCruise.description || '暂无详细描述...' }}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </header>

        <div class="content-list custom-scrollbar" v-loading="stationLoading">
          <div v-if="stationList.length > 0" class="cards-grid">
            <div 
              v-for="(station, idx) in stationList" 
              :key="idx" 
              class="station-card"
              :class="[
                station.stationType === 'Tow' ? 'is-tow' : 'is-point',
                station.completed ? 'completed' : ''
              ]"
              @click="toDetail(station)"
              @mouseenter="hoverStationId = station.id"
              @mouseleave="hoverStationId = null"
            >
              <div class="card-corner"></div>
              <div class="sc-header">
                <div class="sc-type">
                  <span class="type-tag">{{ station.stationType === 'Tow' ? '拖网' : '站点' }}</span>
                  <span class="type-code">{{ station.stationType === 'Tow' ? '(TOW)' : '(POINT)' }}</span>
                </div>
                <div class="sc-status" v-if="station.completed"><i class="el-icon-check"></i> 已完成</div>
                <div class="sc-id"><span class="id-label">ID:</span>{{ station.id }}</div>
              </div>
              <div class="sc-body">
                <div class="sc-title" :title="station.pointName || station.towName">
                  {{ station.pointName || station.towName || '未命名站点' }}
                </div>
                <div class="sc-desc">
                  <span class="desc-label">描述:</span>
                  <span class="desc-text">{{ station.pointDescription || station.towDescription || '无详细描述' }}</span>
                </div>
                <div class="sc-divider"></div>
                <div class="sc-props">
                  <div class="prop-grid">
                    <div class="prop-item"><span class="prop-label">区块ID</span><span class="prop-val">{{ station.explorationBlockId || '-' }}</span></div>
                    <div class="prop-item"><span class="prop-label">单元/区块</span><span class="prop-val">{{ station.blockOrCell || '-' }}</span></div>
                    <div class="prop-item"><span class="prop-label">GPS位置</span><span class="prop-val">{{ station.gpsTransducerPosition || '-' }}</span></div>
                    <div class="prop-item" v-if="station.stationType === 'Tow'"><span class="prop-label">平均拖速</span><span class="prop-val text-blue">{{ station.avgTowSpeed ? station.avgTowSpeed + ' kn' : '-' }}</span></div>
                    <div class="prop-item"><span class="prop-label">更新时间</span><span class="prop-val mono-sm">{{ formatTime(station.updatedTime) || '-' }}</span></div>
                  </div>
                </div>
                <div class="sc-footer">
                  <div v-if="station.stationType !== 'Tow'" class="coord-single">
                    <i class="el-icon-location-outline coord-icon"></i>
                    <span class="coord-label">坐标:</span>
                    <span class="coord-val">{{ formatCoord(station.longitude) }}, {{ formatCoord(station.latitude) }}</span>
                  </div>
                  <div v-else class="coord-range">
                    <div class="cr-row"><span class="cr-tag s">始</span><span class="cr-label">起点:</span><span class="cr-val">{{ formatCoord(station.towStartLongitude) }}, {{ formatCoord(station.towStartLatitude) }}</span></div>
                    <div class="cr-row"><span class="cr-tag e">终</span><span class="cr-label">终点:</span><span class="cr-val">{{ formatCoord(station.towEndLongitude) }}, {{ formatCoord(station.towEndLatitude) }}</span></div>
                  </div>
                </div>
              </div>
              <div class="card-hover-shine" v-if="hoverStationId === station.id"></div>
            </div>
          </div>
          <div v-else class="list-empty-state">
            <div class="empty-inner">
              <img src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" alt="empty" width="100" />
              <p>该航次下暂无站点数据</p>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="welcome-screen">
        <div class="welcome-content">
          <div class="illustration-box">
            <div class="circle-bg"></div>
            <span class="main-icon">⚓</span>
            <div class="decor-dot d1"></div>
            <div class="decor-dot d2"></div>
            <div class="decor-dot d3"></div>
          </div>
          <h2 class="welcome-title">开始探索航次数据</h2>
          <p class="welcome-desc">请在左侧列表中选择一个航次，<br>查看详细的轨迹信息、站点分布以及实时的作业进度。</p>
          <div class="welcome-arrow" v-if="!isMobile"><i class="el-icon-back"></i> 请在左侧选择</div>
          <button class="welcome-btn" v-if="isMobile" @click="toggleMobile()">浏览航次列表</button>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router' // 1. 引入 useRouter
import * as echarts from 'echarts'
import { api, queryCruiseStations } from '@/api/management.js'

const router = useRouter() // 2. 初始化 router

// ============ 数据定义 ============
const loading = ref(false)
const stationLoading = ref(false)
const list = ref([])
const currentCruiseId = ref(null)
const currentCruise = ref(null)
const stationList = ref([])
const hoverItemId = ref(null)
const hoverStationId = ref(null)
const totalPages = ref(0)
const isMobile = ref(false)
const showMobileSearch = ref(false)

// ECharts
const gaugeChartRef = ref(null)
let gaugeChart = null

const queryParams = reactive({
  page: 0,
  size: 20,
  cruiseName: '',
  researchVessel: ''
})

// [CONFIG] 字段配置：使用清晰的中文，但保留英文缩写在Tooltip里
const cruiseFieldConfig = [
  { 
    prop: 'researchVessel',      
    label: '科考船',             
    enLabel: 'VESSEL',           
    icon: 'el-icon-ship',        
    theme: 'blue',               
    isTime: false
  },
  { 
    prop: 'geographicalArea', 
    label: '作业海域', 
    enLabel: 'AREA', 
    icon: 'el-icon-location-outline', 
    theme: 'cyan' 
  },
  { 
    prop: 'createdTime', 
    label: '开始时间', 
    enLabel: 'START',
    icon: 'el-icon-date', 
    theme: 'orange',
    isTime: true 
  },
  { 
    prop: 'updatedTime', 
    label: '更新时间', 
    enLabel: 'UPDATE',
    icon: 'el-icon-time', 
    theme: 'purple',
    isTime: true 
  }
]

// ============ 方法定义 ============

// 3. 跳转到详情页的方法
const toDetail = (station) => {
  if (!station || !station.id) return
  router.push({
    name: 'VoyageDetail',
    params: { id: station.id } // 传递站点ID
  })
}

const formatTime = (t) => { 
  if (!t) return '--'; 
  return t.replace('T', ' ').substring(0, 16) 
}

const formatCoord = (n) => { 
  if (n === null || n === undefined) return '-'; 
  return Number(n).toFixed(4) 
}

const getFieldValue = (item, config) => {
  if (!item) return '--'
  let val = item[config.prop]
  if (!val) return config.defaultValue || '--'
  if (config.isTime) return formatTime(val)
  return val
}

const checkMobile = () => { isMobile.value = window.innerWidth < 768 }
const toggleMobile = () => { isMobile.value = !isMobile.value; document.body.style.overflow = isMobile.value ? 'hidden' : '' }

const getList = async () => {
  loading.value = true
  try {
    const res = await api.cruises.page(queryParams)
    if (res && res.status) {
      list.value = res.data || []
      totalPages.value = res.totalPages || 0
    }
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const handleSelectCruise = async (item) => {
  if (!item || !item.id) return
  currentCruiseId.value = item.id
  currentCruise.value = item
  stationLoading.value = true
  stationList.value = []

  const params = { cruiseIds: [item.id] }
  try {
    const res = await queryCruiseStations(params)
    if (res && res.status && res.data) {
      stationList.value = Array.isArray(res.data) ? res.data : []
    }
    nextTick(() => initGaugeChart())
  } catch (e) { console.error(e) } finally { stationLoading.value = false }
}

const handleSearch = () => { queryParams.page = 0; getList(); showMobileSearch.value = false }
const changePage = (delta) => { queryParams.page += delta; getList() }

const getStatusClass = (status) => {
  if (!status) return 'status-default'
  const statusMap = { '进行中': 'status-active', '已完成': 'status-completed', '已取消': 'status-cancelled', '计划中': 'status-planned' }
  return statusMap[status] || 'status-default'
}

const getProgress = () => {
  if (!stationList.value.length) return 0
  const completed = stationList.value.filter(s => s.completed).length
  return Math.round((completed / stationList.value.length) * 100)
}

// ========== ECharts 现代风格 (渐变 + 圆角) ==========
const initGaugeChart = () => {
  if (!gaugeChartRef.value) return
  if (gaugeChart) gaugeChart.dispose()
  
  gaugeChart = echarts.init(gaugeChartRef.value)
  const percent = getProgress()
  
  const option = {
    series: [
      // 1. 底色圆环 (作为轨道)
      {
        type: 'gauge',
        startAngle: 90, endAngle: -270,
        radius: '100%',
        pointer: { show: false },
        progress: { show: false },
        axisLine: { lineStyle: { width: 6, color: [[1, '#f1f5f9']] } }, // 极淡灰
        splitLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, detail: { show: false }
      },
      // 2. 进度圆环 (亮色渐变)
      {
        type: 'gauge',
        startAngle: 90, endAngle: -270,
        radius: '100%',
        pointer: { show: false },
        progress: {
          show: true, overlap: false, roundCap: true, clip: false,
          itemStyle: {
            // iOS 风格的蓝青渐变
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#2563eb' },
              { offset: 1, color: '#0ea5e9' }
            ])
          }
        },
        axisLine: { lineStyle: { width: 6, color: [[1, 'transparent']] } },
        splitLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, detail: { show: false },
        data: [{ value: percent }]
      }
    ]
  }
  gaugeChart.setOption(option)
}

watch(() => window.innerWidth, () => { checkMobile(); if (gaugeChart) gaugeChart.resize() }, { immediate: true })
watch(stationList, () => { nextTick(() => initGaugeChart()) })

onMounted(() => { getList(); window.addEventListener('resize', checkMobile) })
onBeforeUnmount(() => { if (gaugeChart) gaugeChart.dispose(); window.removeEventListener('resize', checkMobile) })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

.voyage-layout {
  display: flex; height: 100vh;
  /* 整体背景微调，更干净 */
  background: #f1f5f9;
  font-family: 'Inter', "Microsoft YaHei", sans-serif; color: #1e293b;
  overflow: hidden; position: relative;
}

/* 响应式 */
@media (max-width: 768px) {
  .sidebar-panel { position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; transform: translateX(-100%); transition: transform 0.3s ease; }
  .sidebar-panel.sidebar-collapsed { transform: translateX(0); }
  .mobile-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 99; }
  .main-content { width: 100%; }
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

/* ================= 左侧侧边栏 (原样) ================= */
.sidebar-panel { width: 420px; background: #fff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; z-index: 10; box-shadow: 4px 0 20px rgba(0,0,0,0.02); border-radius: 0; overflow: hidden; }
.sidebar-header { padding: 20px; border-bottom: 1px solid #f1f5f9; background: #fff; position: relative; display: flex; flex-direction: column; gap: 16px; }
.nav-title-row { display: flex; justify-content: space-between; align-items: center; position: relative; padding: 10px 4px; }
.brand-title-text { font-size: 20px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
.brand-title-text .icon { font-size: 24px; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0) rotate(-15deg); } 50% { transform: translateY(-5px) rotate(-10deg); } }
.nav-arrow-btn.arrow-3d { width: 40px; height: 40px; border: none; cursor: pointer; position: relative; z-index: 5; background: linear-gradient(180deg, #bae6fd 0%, #60a5fa 100%); filter: drop-shadow(0px 4px 0px #2563eb) drop-shadow(2px 6px 5px rgba(29, 78, 216, 0.25)); transition: all 0.15s ease-out; padding: 0; display: block; }
.nav-arrow-btn.arrow-3d.left { clip-path: polygon(0% 50%, 40% 0%, 40% 28%, 100% 28%, 100% 72%, 40% 72%, 40% 100%); }
.nav-arrow-btn.arrow-3d.right { clip-path: polygon(0% 28%, 60% 28%, 60% 0%, 100% 50%, 60% 100%, 60% 72%, 0% 72%); }
.nav-arrow-btn.arrow-3d:hover { background: linear-gradient(180deg, #e0f2fe 0%, #93c5fd 100%); transform: translateY(-2px); }
.nav-arrow-btn.arrow-3d:active { transform: translateY(3px); }
.mobile-search-toggle { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; margin-top: 10px; }
.search-wrap { display: flex; flex-direction: column; }
.input-group { display: flex; align-items: center; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 0 14px; height: 44px; transition: all 0.2s; }
.input-group:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.input-group i { color: #64748b; margin-right: 12px; font-size: 16px; }
.input-group input { border: none; background: transparent; width: 100%; outline: none; color: #1e293b; font-size: 15px; font-weight: 500; }
.filter-row { display: flex; gap: 10px; }
.input-group.sub { flex: 1; }
.search-btn { padding: 0 20px; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
.search-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3); }
.nav-list { flex: 1; overflow-y: auto; padding: 20px; background: #f8fafc; }
.list-container { display: flex; flex-direction: column; gap: 16px; }
.cruise-item { position: relative; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; cursor: pointer; transition: all 0.3s ease; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.cruise-item:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.08); border-color: #cbd5e1; }
.cruise-item.is-active { border-color: #2563eb; background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); }
.cruise-decor { position: absolute; bottom: 0; right: 0; width: 80px; height: 60px; overflow: hidden; opacity: 0.1; transition: opacity 0.3s; }
.cruise-item:hover .cruise-decor { opacity: 0.2; }
.wave { position: absolute; bottom: 0; right: 0; width: 120px; height: 12px; background: #2563eb; border-radius: 50%; animation: wave 3s ease-in-out infinite; }
.wave-2 { height: 8px; background: #3b82f6; animation-delay: 1s; }
.active-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, #2563eb 0%, #3b82f6 100%); opacity: 0; transition: opacity 0.3s; }
.is-active .active-indicator { opacity: 1; }
.item-content { position: relative; z-index: 2; }
.item-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed #f1f5f9; }
.cruise-title { font-size: 16px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.cruise-title .label-tag { font-size: 11px; font-weight: 600; color: #fff; background: #3b82f6; padding: 1px 5px; border-radius: 4px; flex-shrink: 0; }
.is-active .cruise-title { color: #2563eb; }
.cruise-id { font-size: 12px; color: #64748b; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 4px; background: #f8fafc; padding: 2px 6px; border: 1px solid #e2e8f0; border-radius: 4px; flex-shrink: 0; margin-left: 8px; }
.cruise-id .id-label { font-weight: 500; }
.info-grid { display: flex; flex-direction: column; gap: 6px; }
.info-row { display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 1.4; width: 100%; }
.info-icon { color: #3b82f6; font-size: 14px; width: 16px; text-align: center; flex-shrink: 0; }
.info-label { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; border-radius: 4px; padding: 1px 6px; font-size: 11px; font-weight: 600; width: 60px; flex-shrink: 0; text-align: justify; text-align-last: justify; box-shadow: 0 1px 2px rgba(0,0,0,0.02); margin-right: 4px; }
.info-val { color: #334155; font-weight: 500; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cruise-item:hover .info-val { color: #0f172a; }
.empty-placeholder { display: flex; flex-direction: column; align-items: center; margin-top: 60px; color: #64748b; font-size: 16px; gap: 12px; text-align: center; padding: 20px; }
.ship-icon { font-size: 60px; animation: shipFloat 4s ease-in-out infinite; }
.empty-tip { font-size: 14px; color: #94a3b8; margin-top: 8px; }
.sidebar-footer { padding: 16px 20px; background: #fff; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.page-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; color: #475569; transition: all 0.2s; }
.page-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #f1f5f9; }
.page-info { display: flex; flex-direction: column; align-items: center; font-size: 13px; }
.page-info .total { font-size: 12px; color: #94a3b8; }

/* ================= 右侧主内容 ================= */
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 24px; }

.mobile-header { display: none; padding: 12px 20px; background: #fff; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
@media (max-width: 768px) {
  .mobile-header { display: flex; align-items: center; gap: 12px; }
  .back-btn { background: transparent; border: none; color: #2563eb; font-size: 18px; cursor: pointer; }
  .mobile-header h2 { font-size: 18px; font-weight: 700; margin: 0; flex: 1; text-align: center; }
}

/* ================= [NEW] Modern Glass Header (SaaS Style) ================= */
.cruise-header-modern {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  /* 柔和的高级阴影 */
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 5px 10px -5px rgba(0, 0, 0, 0.02);
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid #fff;
}

/* 顶部光晕装饰 */
.ambient-glow {
  position: absolute; width: 400px; height: 400px; border-radius: 50%;
  filter: blur(80px); opacity: 0.08; pointer-events: none; z-index: 0;
}
.glow-1 { top: -200px; left: -100px; background: #2563eb; }
.glow-2 { bottom: -200px; right: -100px; background: #06b6d4; }

.header-inner { position: relative; z-index: 1; padding: 24px 30px; display: flex; flex-direction: column; gap: 24px; }

/* 行1: 核心信息区 */
.header-top-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }

.title-area { display: flex; flex-direction: column; gap: 8px; }

.status-row { display: flex; align-items: center; gap: 10px; }

/* 现代状态徽章 */
.modern-status-badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px;
  border-radius: 20px; font-size: 12px; font-weight: 600;
  border: 1px solid transparent;
}
.modern-status-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status-active { background: #eff6ff; color: #2563eb; border-color: #dbeafe; }
.status-completed { background: #ecfdf5; color: #059669; border-color: #d1fae5; }
.status-cancelled { background: #fef2f2; color: #dc2626; border-color: #fee2e2; }
.status-planned { background: #fffbeb; color: #d97706; border-color: #fef3c7; }
.status-default { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; }

.modern-id-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; color: #64748b;
  background: rgba(241, 245, 249, 0.8); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(226, 232, 240, 0.8);
}

.modern-title {
  margin: 0; font-size: 30px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;
}

/* 右侧悬浮数据胶囊 */
.stats-capsule {
  display: flex; align-items: center; gap: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  padding: 8px 0;
}
.stat-item { display: flex; align-items: center; gap: 14px; padding: 0 24px; }
.stat-icon-bg {
  width: 42px; height: 42px; border-radius: 12px;
  background: #f0f9ff; color: #0ea5e9;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.chart-mini-wrapper { width: 44px; height: 44px; position: relative; }
.gauge-chart-container { width: 100%; height: 100%; }

.stat-text { display: flex; flex-direction: column; }
.stat-text .val { font-size: 20px; font-weight: 700; color: #1e293b; line-height: 1.1; font-family: 'Inter', sans-serif; }
.stat-text .val.color-active { color: #2563eb; }
.stat-text .lbl { font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 2px; }

.v-divider { width: 1px; height: 28px; background: #e2e8f0; }

/* 行2: Bento Grid 字段卡片 */
.header-cards-row { display: flex; gap: 16px; flex-wrap: wrap; }

.bento-card {
  flex: 1; min-width: 160px;
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative; overflow: hidden;
}
.bento-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border-color: #fff; }
/* 顶部微细的色彩条 */
.bento-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; opacity: 0; transition: opacity 0.2s; }
.bento-card:hover::before { opacity: 1; }

.bento-card.blue::before { background: #3b82f6; } .bento-card.blue .bento-icon { background: #eff6ff; color: #2563eb; }
.bento-card.cyan::before { background: #06b6d4; } .bento-card.cyan .bento-icon { background: #ecfeff; color: #0891b2; }
.bento-card.orange::before { background: #f97316; } .bento-card.orange .bento-icon { background: #fff7ed; color: #ea580c; }
.bento-card.purple::before { background: #a855f7; } .bento-card.purple .bento-icon { background: #faf5ff; color: #9333ea; }
.desc-card .bento-icon.gray { background: #f1f5f9; color: #64748b; }

.bento-icon {
  width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;
}
.bento-info { display: flex; flex-direction: column; overflow: hidden; }
.bento-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
.bento-value { font-size: 14px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bento-value.desc { font-weight: 500; color: #64748b; }

/* ================= 欢迎 & 空状态 (不变) ================= */
.welcome-screen { flex: 1; display: flex; justify-content: center; align-items: center; background: #fff; height: 100%; position: relative; overflow: hidden; }
.welcome-content { text-align: center; max-width: 480px; padding: 40px; position: relative; z-index: 10; margin-top: -120px; }
.illustration-box { position: relative; width: 120px; height: 120px; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; }
.circle-bg { position: absolute; width: 100%; height: 100%; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 50%; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15); animation: pulse 3s infinite ease-in-out; }
.main-icon { font-size: 64px; position: relative; z-index: 2; filter: drop-shadow(0 4px 6px rgba(37, 99, 235, 0.2)); animation: float 4s ease-in-out infinite; }
.decor-dot { position: absolute; border-radius: 50%; background: #3b82f6; opacity: 0.2; }
.d1 { width: 12px; height: 12px; top: 0; right: 10px; animation: float 5s infinite reverse; }
.d2 { width: 8px; height: 8px; bottom: 10px; left: 0; animation: float 4s infinite 1s; }
.d3 { width: 6px; height: 6px; top: 40%; right: -20px; animation: float 6s infinite 0.5s; }
.welcome-title { font-size: 26px; font-weight: 800; color: #1e293b; margin-bottom: 16px; letter-spacing: -0.5px; }
.welcome-desc { font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 30px; }
.welcome-arrow { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #2563eb; background: #eff6ff; padding: 8px 16px; border-radius: 20px; animation: slideLeft 1.5s infinite alternate; }
.welcome-btn { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #fff; border: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: transform 0.2s; }
.welcome-btn:active { transform: scale(0.98); }

.list-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: #94a3b8; }
.list-empty-state img { opacity: 0.6; margin-bottom: 16px; filter: grayscale(100%); }
.list-empty-state p { font-size: 14px; margin: 0; }

@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
@keyframes slideLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-5px); } }

/* 站点卡片 */
.content-list { flex: 1; overflow-y: auto; padding: 0; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; padding-bottom: 40px; }
.station-card { 
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; 
  overflow: hidden; display: flex; flex-direction: column; transition: all 0.3s; 
  position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.02); 
  /* 增加手型样式 */
  cursor: pointer;
}
.station-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); border-color: #cbd5e1; }
.station-card.completed { border-left: 4px solid #10b981; }
.card-corner { position: absolute; top: 0; right: 0; width: 40px; height: 40px; background: linear-gradient(135deg, transparent 50%, #f8fafc 50%); z-index: 1; }
.station-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
.is-point::before { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
.is-tow::before { background: linear-gradient(90deg, #f97316, #fdba74); }
.sc-header { padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; position: relative; z-index: 2; }
.sc-type { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.type-tag { font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.is-point .type-tag { background: #e0f2fe; color: #0284c7; }
.is-tow .type-tag { background: #ffedd5; color: #ea580c; }
.type-code { font-size: 12px; color: #94a3b8; font-weight: 400; }
.sc-status { position: absolute; top: 14px; right: 60px; font-size: 12px; font-weight: 500; color: #10b981; background: #dcfce7; padding: 2px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; }
.sc-id { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #64748b; display: flex; align-items: center; gap: 4px; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; }
.sc-id .id-label { font-weight: 500; }
.sc-body { padding: 18px; flex: 1; display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 2; }
.sc-title { font-size: 17px; font-weight: 600; color: #0f172a; margin-bottom: 4px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.station-card:hover .sc-title { color: #2563eb; font-weight: 700; }
.sc-desc { font-size: 14px; color: #475569; line-height: 1.5; display: flex; gap: 6px; }
.desc-label { color: #94a3b8; font-weight: 500; flex-shrink: 0; }
.desc-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sc-divider { border-top: 1px dashed #e2e8f0; margin: 8px 0; }
.sc-props { background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; }
.prop-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.prop-item { display: flex; flex-direction: column; }
.prop-label { font-size: 11px; color: #64748b; font-weight: 500; margin-bottom: 3px; }
.prop-val { font-size: 13px; font-weight: 400; color: #1e293b; font-family: 'JetBrains Mono', monospace; }
.prop-val.text-blue { color: #2563eb; font-weight: 500; }
.prop-val.mono-sm { font-size: 12px; }
.sc-footer { margin-top: auto; padding-top: 12px; border-top: 1px solid #f1f5f9; }
.coord-single { font-size: 13px; color: #334155; display: flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; }
.coord-icon { color: #94a3b8; font-size: 14px; width: 18px; text-align: center; }
.coord-label { color: #64748b; font-weight: 500; flex-shrink: 0; }
.coord-val { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.coord-range { display: flex; flex-direction: column; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #334155; }
.cr-row { display: flex; align-items: center; gap: 8px; }
.cr-tag { display: inline-block; width: 18px; text-align: center; font-weight: bold; border-radius: 2px; font-size: 11px; color: #fff; padding: 1px 0; flex-shrink: 0; }
.cr-label { color: #64748b; font-weight: 500; flex-shrink: 0; width: 40px; }
.cr-val { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cr-row .tag.s { background: #10b981; }
.cr-row .tag.e { background: #ef4444; }
.card-hover-shine { position: absolute; top: 0; right: -50%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transform: skewX(-25deg); transition: right 0.8s; z-index: 1; }
.station-card:hover .card-hover-shine { right: 150%; }
</style>