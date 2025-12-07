<template>
  <div class="search-page">
    <aside class="sidebar">
      <div class="sidebar-header">
        
        <button class="nav-arrow-btn arrow-3d left" @click="$router.push('/voyagesearch')" title="切换到航次查询">
        </button>
        
        <div class="header-title-box">
          <svg class="chem-icon-simple" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iconGradientSimple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" /> <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" /> </linearGradient>
            </defs>
            <path d="M15 2H9V8L4.2 16.3C3.6 17.3 3.5 18.5 4 19.5C4.5 20.5 5.5 21 6.6 21H17.4C18.5 21 19.5 20.5 20 19.5C20.5 18.5 20.4 17.3 19.8 16.3L15 8V2Z" 
                  fill="url(#iconGradientSimple)"></path>
            <circle cx="10" cy="14" r="1" fill="white" fill-opacity="0.5"></circle>
            <circle cx="14" cy="17" r="1.5" fill="white" fill-opacity="0.5"></circle>
          </svg>
          
          <span class="title-text">化学数据</span>
        </div>

        <button class="nav-arrow-btn arrow-3d right" @click="$router.push('/biosearch')" title="切换到生物查询">
        </button>

      </div> 

      <div class="search-box-wrapper">
        
        <div class="search-box">
          <input 
            v-model="displayQuery" 
            type="text" 
            class="clean-input"
            placeholder="搜索 编号/站点/仪器/备注..." 
            @input="handleSearchInput"
            @keyup.enter="triggerSearchNow"
          />
          <button v-if="displayQuery" class="clear-btn" @click="clearSearch">✕</button>
          <button class="search-btn" @click="triggerSearchNow">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
        <el-tooltip content="清除所有筛选条件" placement="bottom" effect="dark">
          <button class="trash-circle" @click="clearAllFilters">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </el-tooltip>
      </div>

      <div class="panel">
        <div class="panel-header" @click="togglePanel('managed')">
          <div class="panel-title">
            <span class="icon-sync">🔄</span> 数据管理已选中
          </div>
          <div class="caret" :class="{open: !collapsedState.managed}">▾</div>
        </div>
        
        <ul class="filter-list" v-show="!collapsedState.managed">
          
          <li v-if="managedSelectedItems.length === 0" class="filter-item">
             <label class="filter-label" style="cursor: default;">
               <div class="filter-label-left">
                 <span class="filter-name" style="color: #94a3b8;">暂无选中数据</span>
               </div>
               <span class="item-count">0</span>
             </label>
          </li>
          
          <li v-for="item in managedSelectedItems" :key="item.id" class="filter-item">
            <label class="filter-label" @click="goToDetailFromSidebar(item)">
              <div class="filter-label-left">
                 <span class="filter-name" :title="item.sampleName || item.name">
                   {{ item.name }}
                 </span>
              </div>
              <span class="item-count">ID:{{ item.id }}</span>
            </label>
          </li>

        </ul>
      </div>
      <div class="panel">
        <div class="panel-header" @click="togglePanel('matrix')">
          <div class="panel-title">分析基质 (Matrix)</div>
          <div class="caret" :class="{open: !collapsedState.matrix}">▾</div>
        </div>
        <ul class="filter-list" v-show="!collapsedState.matrix">
          <li v-for="opt in matrixOptions" :key="opt.name" class="filter-item">
            <label class="filter-label">
              <div class="filter-label-left">
                <input class="small-checkbox" type="checkbox" 
                       :checked="selectedFilters.matrix.includes(opt.name)"
                       @change="toggleFilter('matrix', opt.name)" />
                <span class="filter-name">{{ opt.name }}</span>
              </div>
              <span class="item-count">{{ opt.count }}</span>
            </label>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header" @click="togglePanel('cruise')">
          <div class="panel-title">航次编号 (Cruise)</div>
          <div class="caret" :class="{open: !collapsedState.cruise}">▾</div>
        </div>
        <ul class="filter-list" v-show="!collapsedState.cruise">
          <li v-for="opt in cruiseOptions" :key="opt.name" class="filter-item">
            <label class="filter-label">
              <div class="filter-label-left">
                <input class="small-checkbox" type="checkbox" 
                       :checked="selectedFilters.cruise.includes(opt.name)"
                       @change="toggleFilter('cruise', opt.name)" />
                <span class="filter-name">{{ opt.name }}</span>
              </div>
              <span class="item-count">{{ opt.count }}</span>
            </label>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header" @click="togglePanel('station')">
          <div class="panel-title">站点编号 (Station)</div>
          <div class="caret" :class="{open: !collapsedState.station}">▾</div>
        </div>
        <ul class="filter-list" v-show="!collapsedState.station">
          <li v-for="opt in stationOptions" :key="opt.name" class="filter-item">
            <label class="filter-label">
              <div class="filter-label-left">
                <input class="small-checkbox" type="checkbox" 
                       :checked="selectedFilters.station.includes(opt.name)"
                       @change="toggleFilter('station', opt.name)" />
                <span class="filter-name">{{ opt.name }}</span>
              </div>
              <span class="item-count">{{ opt.count }}</span>
            </label>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header" @click="togglePanel('depth')">
          <div class="panel-title">深度范围 (Depth)</div>
          <div class="caret" :class="{open: !collapsedState.depth}">▾</div>
        </div>
        <ul class="filter-list" v-show="!collapsedState.depth">
          <li v-for="opt in depthOptions" :key="opt.id" class="filter-item">
            <label class="filter-label">
              <div class="filter-label-left">
                <input class="small-checkbox" type="checkbox" 
                       :checked="selectedFilters.depth.includes(opt.id)"
                       @change="toggleFilter('depth', opt.id)" />
                <span class="filter-name">{{ opt.name }}</span>
              </div>
              <span class="item-count">{{ opt.count }}</span>
            </label>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header" @click="togglePanel('instrument')">
          <div class="panel-title">分析仪器 (Instrument)</div>
          <div class="caret" :class="{open: !collapsedState.instrument}">▾</div>
        </div>
        <ul class="filter-list" v-show="!collapsedState.instrument">
          <li v-for="opt in instrumentOptions" :key="opt.name" class="filter-item">
            <label class="filter-label">
              <div class="filter-label-left">
                <input class="small-checkbox" type="checkbox" 
                       :checked="selectedFilters.instrument.includes(opt.name)"
                       @change="toggleFilter('instrument', opt.name)" />
                <span class="filter-name">{{ opt.name }}</span>
              </div>
              <span class="item-count">{{ opt.count }}</span>
            </label>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header" @click="togglePanel('technique')">
          <div class="panel-title">分析技术 (Technique)</div>
          <div class="caret" :class="{open: !collapsedState.technique}">▾</div>
        </div>
        <ul class="filter-list" v-show="!collapsedState.technique">
          <li v-for="opt in techniqueOptions" :key="opt.name" class="filter-item">
            <label class="filter-label">
              <div class="filter-label-left">
                <input class="small-checkbox" type="checkbox" 
                       :checked="selectedFilters.technique.includes(opt.name)"
                       @change="toggleFilter('technique', opt.name)" />
                <span class="filter-name">{{ opt.name }}</span>
              </div>
              <span class="item-count">{{ opt.count }}</span>
            </label>
          </li>
        </ul>
      </div>
      
      <div class="panel">
        <div class="panel-header" @click="togglePanel('ctdDate')">
          <div class="panel-title">采样日期范围</div>
          <div class="caret" :class="{open: !collapsedState.ctdDate}">▾</div>
        </div>
        <div class="panel-content date-box-wrapper" v-show="!collapsedState.ctdDate">
          <div class="date-input-group">
            <label>开始:</label>
            <input type="date" v-model="selectedFilters.dateRange.start" class="date-input" />
          </div>
          <div class="date-input-group">
            <label>结束:</label>
            <input type="date" v-model="selectedFilters.dateRange.end" class="date-input" />
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header" @click="togglePanel('createdTime')">
          <div class="panel-title">入库时间范围</div>
          <div class="caret" :class="{open: !collapsedState.createdTime}">▾</div>
        </div>
        <div class="panel-content date-box-wrapper" v-show="!collapsedState.createdTime">
          <div class="date-input-group">
            <label>开始:</label>
            <input type="date" v-model="selectedFilters.createRange.start" class="date-input" />
          </div>
          <div class="date-input-group">
            <label>结束:</label>
            <input type="date" v-model="selectedFilters.createRange.end" class="date-input" />
          </div>
        </div>
      </div>
    </aside>

    <main class="content" v-loading="loading" element-loading-text="数据加载中...">
      <div class="content-bar">
        <div class="bar-content">
          <div class="icon-circle">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 9h20M2 15h20M5 9v6M19 9v6"></path></svg>
          </div>
          <span class="bar-title">化学分析列表</span>
          <span class="bar-divider"></span>
          <span class="bar-result">
            <span class="result-number">{{ totalResults.toLocaleString() }}</span>
            <span class="result-text">条</span>
          </span>
        </div>
      </div>
      
      <div class="pager-bar ocean-pager">
        <div class="pager-left">
          <span class="page-size-label">排序方式</span>
          <div class="select-wrapper sort-wrapper">
             <select v-model="sortState.field" class="page-size-select sort-select">
               <option value="default">默认排序</option>
               <option value="ctdDepth">按深度 (Depth)</option>
               <option value="ctdSampleDate">按时间 (Date)</option>
               <option value="sampleId">按编号 (ID)</option>
             </select>
             <span class="select-arrow">▼</span>
             <button class="sort-order-btn" @click="toggleSortOrder" :title="sortState.order === 'asc' ? '当前: 升序' : '当前: 降序'">
                {{ sortState.order === 'asc' ? '↑' : '↓' }}
             </button>
          </div>

          <div class="divider-vertical"></div>

          <span class="page-size-label">每页显示</span>
          <div class="select-wrapper">
            <select v-model="pageSize" class="page-size-select">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
            <span class="select-arrow">▼</span>
          </div>
          <span class="result-text-small">
             {{ totalResults > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} - {{ Math.min(currentPage * pageSize, totalResults) }}
          </span>
        </div>

        <div class="pager-right">
          <button class="ocean-btn prev" @click="goPage(currentPage - 1)" :disabled="currentPage === 1">
            <span>上一页</span>
          </button>
          <span class="page-info-box">{{ currentPage }} / {{ totalPages }}</span>
          <button class="ocean-btn next" @click="goPage(currentPage + 1)" :disabled="currentPage === totalPages">
            <span>下一页</span>
          </button>
        </div>
      </div>

      <div class="list">
        <div class="pro-card" v-for="item in paginatedItems" :key="item.uniqueId" @click="goToDetail(item)">
          
          <div class="card-section section-id">
            <div class="matrix-title-row">
              <div class="chem-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
              </div>
              <h3 class="card-title" :title="item.labMatrixName">
                {{ item.labMatrixName }}
              </h3>
            </div>
            
            <div class="id-grid">
              <div class="id-box">
                <span class="label">样本编号 (Sample ID)</span>
                <span class="value highlight">{{ item.sampleId }}</span>
              </div>
              <div class="id-box">
                <span class="label">站点 (Station)</span>
                <span class="value">{{ item.stationId }}</span>
              </div>
              <div class="id-box full">
                <span class="label">航次 (Cruise)</span>
                <span class="value">{{ item.cruiseId }}</span>
              </div>
            </div>
          </div>

          <div class="card-section section-metrics">
            <div class="metric-row">
              <span class="metric-label">采样深度 (Depth)</span>
              <span class="metric-value">
                {{ item.ctdDepth !== null ? item.ctdDepth : '-' }} 
                <small v-if="item.ctdDepth !== null">m</small>
                <small v-else>(N/A)</small>
              </span>
            </div>
            
            <div class="depth-visual-bar">
              <div class="bar-bg">
                <div class="bar-fill" :style="{ width: getDepthBarWidth(item.ctdDepth) }"></div>
              </div>
              <div class="bar-labels">
                <span>Surface</span>
                <span>Deep (>1500m)</span>
              </div>
            </div>

            <div class="metric-row mt-3">
              <span class="metric-label">采样日期 (Date)</span>
              <span class="metric-value date-font">{{ item.ctdSampleDate ? item.ctdSampleDate.split(' ')[0] : '-' }}</span>
            </div>
            
            <div class="badges-row">
              <span class="capsule-badge blue" v-if="item.totalOrDissolved">{{ item.totalOrDissolved }}</span>
              <span class="capsule-badge green" v-if="item.measurementBasis">{{ item.measurementBasis }}</span>
            </div>
          </div>

          <div class="card-section section-tech">
            <div class="tech-grid">
              <div class="tech-item">
                <span class="tech-icon" title="分析仪器">🔬</span>
                <div class="tech-content">
                  <span class="tech-label">仪器 (Instrument)</span>
                  <span class="tech-value" :title="item.instrument">{{ item.instrument }}</span>
                </div>
              </div>
              <div class="tech-item">
                <span class="tech-icon" title="分析技术">🧪</span>
                <div class="tech-content">
                  <span class="tech-label">技术 (Technique)</span>
                  <span class="tech-value" :title="item.analyticalTechnique">{{ item.analyticalTechnique }}</span>
                </div>
              </div>
              <div class="tech-item">
                <span class="tech-icon" title="实验室">🏢</span>
                <div class="tech-content">
                  <span class="tech-label">实验室 (Lab)</span>
                  <span class="tech-value" :title="item.laboratory">{{ item.laboratory }}</span>
                </div>
              </div>
               <div class="tech-item">
                <span class="tech-icon" title="检测限">📏</span>
                <div class="tech-content">
                  <span class="tech-label">检测限 (LOD)</span>
                  <span class="tech-value">{{ item.lod || '-' }}</span>
                </div>
              </div>
            </div>
            
            <div class="remarks-box" v-if="item.remarks">
               <span class="remarks-label">备注:</span>
               <span class="remarks-text" :title="item.remarks">{{ item.remarks }}</span>
            </div>
          </div>

          <div class="hover-indicator">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
        
        <div v-if="!loading && filteredItems.length === 0" class="empty-state">
          <div class="empty-icon">🌊</div>
          <div class="empty-text">未找到相关数据，请尝试调整筛选条件</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAllChemData } from '@/api/management'

const managedSelectedItems = ref([])
const router = useRouter()
const displayQuery = ref('')
const effectiveQuery = ref('')
const loading = ref(false)
const apiData = ref([]) 

const currentPage = ref(1)
const pageSize = ref(10)

const sortState = reactive({
  field: 'default', 
  order: 'asc'     
})

const selectedFilters = reactive({
  cruise: [], 
  station: [], 
  depth: [],
  matrix: [],
  instrument: [],
  technique: [],
  dateRange: { start: '', end: '' },
  createRange: { start: '', end: '' }
})

const collapsedState = reactive({
  managed: false,
  cruise: true, 
  matrix: true, 
  station: true, 
  depth: true, 
  ctdDate: false, 
  createdTime: false, 
  instrument: true, 
  technique: true 
})

// === 核心修复1：深度配置 ===
const DEPTH_CONFIG = [
  { 
    id: 'SURFACE', 
    label: '0-50m (Surface)', 
    check: (val) => { 
      if (val === null || val === undefined) return false;
      const d = Number(val); 
      return !isNaN(d) && d >= 0 && d <= 50;
    } 
  },
  { 
    id: 'MIDDLE', 
    label: '50-200m', 
    check: (val) => { 
      if (val === null || val === undefined) return false;
      const d = Number(val); 
      return !isNaN(d) && d > 50 && d <= 200;
    } 
  },
  { 
    id: 'DEEP', 
    label: '200-1000m', 
    check: (val) => { 
      if (val === null || val === undefined) return false;
      const d = Number(val); 
      return !isNaN(d) && d > 200 && d <= 1000;
    } 
  },
  { 
    id: 'ABYSSAL', 
    label: '>1000m (Deep)', 
    check: (val) => { 
      if (val === null || val === undefined) return false;
      const d = Number(val); 
      return !isNaN(d) && d > 1000;
    } 
  },
  { 
    id: 'UNKNOWN', 
    label: '未知深度 (Unknown)', 
    check: (val) => val === null || val === undefined || isNaN(Number(val)) 
  }
]

function safeStr(val) {
  if (val === null || val === undefined || val === '') return 'NA'
  return String(val).trim()
}

function formatEmpty(val) {
  if (val === null || val === undefined || val === '' || String(val).toUpperCase() === 'NA' || String(val).toUpperCase() === 'N/A') {
    return '无'
  }
  return String(val).trim()
}

// === 核心修复2：数据清洗与唯一键 ===
async function fetchData() {
  loading.value = true
  try {
    const allData = await fetchAllChemData()
    if (allData && allData.length > 0) {
      apiData.value = allData.map((item, index) => { // 增加 index
        let rawDepth = item.ctdDepth ?? item.ctd_depth ?? item.depth;
        
        // 严格的深度解析
        let finalDepth = null;
        if (rawDepth !== null && rawDepth !== undefined) {
           const strVal = String(rawDepth).trim(); // 去空
           if (strVal !== '') {
             const parsed = Number(strVal);
             if (!isNaN(parsed)) {
               finalDepth = parsed;
             }
           }
        }

        return {
          // 确保唯一 Key
          uniqueId: (item.id || 'temp') + '_' + index, 
          id: item.id,
          ctdDepth: finalDepth,
          lod: item.lod,
          
          sampleId: safeStr(item.sampleId || item.sample_id || item.sampleName),
          stationId: safeStr(item.stationId || item.station_id),
          cruiseId: safeStr(item.cruiseId || item.cruise_id),
          labMatrixName: safeStr(item.labMatrixName || item.lab_matrix_name || item['Lab Matrix']),
          
          instrument: formatEmpty(item.instrument),
          analyticalTechnique: formatEmpty(item.analyticalTechnique || item.analytical_technique),
          
          laboratory: safeStr(item.laboratory),
          ctdSampleDate: item.ctdSampleDate || item.ctd_sample_date || '',
          totalOrDissolved: item.totalOrDissolved || item.total_or_dissolved,
          measurementBasis: item.measurementBasis || item.measurement_basis,
          remarks: item.remarks || '',
          createdTime: item.createdTime || item.created_time || ''
        }
      })
    } else {
      apiData.value = []
    }
  } catch (error) {
    console.error("Fetch chem data error:", error)
    apiData.value = []
  } finally {
    loading.value = false
  }
}

onMounted(()=>
  fetchData(),
  loadManagedSelection()
)

function loadManagedSelection() {
  try {
    const str = sessionStorage.getItem('MANAGEMENT_SELECTED_CHEMS')
    if (str) {
      const rawList = JSON.parse(str)
      
      // [修复 Bug]：增加去重逻辑
      // 使用 Map 根据 item.id 进行去重，防止出现重复数据
      const uniqueMap = new Map()
      if (Array.isArray(rawList)) {
        rawList.forEach(item => {
          // 只有当 ID 存在且 Map 中尚未包含此 ID 时才添加
          if (item && item.id && !uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item)
          }
        })
      }
      
      managedSelectedItems.value = Array.from(uniqueMap.values())
    }
  } catch(e) { 
    console.error('读取同步数据失败', e) 
    managedSelectedItems.value = []
  }
}

function goToDetailFromSidebar(item) {
  // 跳转详情页 (复用详情页逻辑)
  router.push({ 
    name: 'ChemDetail', 
    params: { id: item.id }, 
    query: { stationId: item.stationId, sampleId: item.sampleId } 
  })
}

let searchTimeout = null
function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    effectiveQuery.value = displayQuery.value.trim()
    currentPage.value = 1
  }, 300)
}

function triggerSearchNow() {
  if (searchTimeout) clearTimeout(searchTimeout)
  effectiveQuery.value = displayQuery.value.trim()
  currentPage.value = 1
}

function clearSearch() {
  displayQuery.value = ''
  effectiveQuery.value = ''
  currentPage.value = 1
}

function getDepthBarWidth(depth) {
  if (depth === null || depth < 0) return '0%'
  const maxRef = 1500 
  const pct = Math.min((depth / maxRef) * 100, 100)
  return `calc(${pct}% + 2px)` 
}

// === 修改：getOptions 增加自然排序逻辑 ===
function getOptions(key, desc = false) {
  const counts = {}
  apiData.value.forEach(item => {
    const v = item[key]
    if (v) { // 简单过滤空值
        counts[v] = (counts[v] || 0) + 1
    }
  })
  
  // 使用 numeric: true 实现自然排序（例如 Station 2 排在 Station 10 前面）
  return Object.keys(counts).sort((a,b) => {
    return desc 
      ? String(b).localeCompare(String(a), undefined, { numeric: true }) 
      : String(a).localeCompare(String(b), undefined, { numeric: true })
  }).map(k => ({ name: k, count: counts[k] }))
}

const cruiseOptions = computed(() => getOptions('cruiseId'))
const stationOptions = computed(() => getOptions('stationId'))
const matrixOptions = computed(() => getOptions('labMatrixName'))
const instrumentOptions = computed(() => getOptions('instrument'))
const techniqueOptions = computed(() => getOptions('analyticalTechnique'))

const depthOptions = computed(() => {
  const counts = {}
  DEPTH_CONFIG.forEach(c => counts[c.id] = 0)
  
  apiData.value.forEach(item => {
    const d = item.ctdDepth
    const config = DEPTH_CONFIG.find(c => c.check(d))
    if (config) {
      counts[config.id]++
    }
  })

  return DEPTH_CONFIG
    .filter(c => counts[c.id] > 0)
    .map(c => ({ 
      id: c.id, 
      name: c.label, 
      count: counts[c.id] 
    }))
})

function toggleFilter(category, value) {
  const arr = selectedFilters[category]
  const idx = arr.indexOf(value)
  if (idx > -1) {
    arr.splice(idx, 1)
  } else {
    arr.push(value)
  }
  currentPage.value = 1
}

function toggleSortOrder() {
  sortState.order = sortState.order === 'asc' ? 'desc' : 'asc'
}

function clearAllFilters() {
  displayQuery.value = ''
  effectiveQuery.value = ''
  selectedFilters.cruise = []
  selectedFilters.station = []
  selectedFilters.matrix = []
  selectedFilters.instrument = []
  selectedFilters.technique = []
  selectedFilters.depth = []
  selectedFilters.dateRange = { start: '', end: '' }
  selectedFilters.createRange = { start: '', end: '' }
  currentPage.value = 1
  sortState.field = 'default'
}

function togglePanel(key){ collapsedState[key] = !collapsedState[key] }

const filteredItems = computed(() => {
  const { cruise, station, depth, matrix, instrument, technique, dateRange, createRange } = selectedFilters
  const q = effectiveQuery.value.toLowerCase()
  
  return apiData.value.filter(item => {
    if (q) {
      const match = [
        item.stationId, item.sampleId, item.cruiseId, item.labMatrixName, 
        item.analyticalTechnique, item.instrument, item.remarks, item.laboratory
      ].some(val => val && val.toLowerCase().includes(q))
      if (!match) return false
    }

    if (cruise.length > 0 && !cruise.includes(item.cruiseId)) return false
    if (station.length > 0 && !station.includes(item.stationId)) return false
    if (matrix.length > 0 && !matrix.includes(item.labMatrixName)) return false
    if (instrument.length > 0 && !instrument.includes(item.instrument)) return false
    if (technique.length > 0 && !technique.includes(item.analyticalTechnique)) return false

    if (depth.length > 0) {
       const d = item.ctdDepth
       const matchDepth = depth.some(selectedId => {
         const config = DEPTH_CONFIG.find(c => c.id === selectedId)
         return config && config.check(d)
       })
       if (!matchDepth) return false
    }

    if (dateRange.start || dateRange.end) {
      const dateStr = item.ctdSampleDate ? item.ctdSampleDate.split(' ')[0] : ''
      if (!dateStr) return false 
      if (dateRange.start && dateStr < dateRange.start) return false
      if (dateRange.end && dateStr > dateRange.end) return false
    }
    if (createRange.start || createRange.end) {
      const createStr = item.createdTime ? item.createdTime.split(' ')[0] : ''
      if (!createStr) return false
      if (createRange.start && createStr < createRange.start) return false
      if (createRange.end && createStr > createRange.end) return false
    }

    return true
  })
})

const sortedItems = computed(() => {
  const items = [...filteredItems.value]
  const { field, order } = sortState
  
  if (field === 'default') {
    return items
  }

  return items.sort((a, b) => {
    let valA = a[field]
    let valB = b[field]

    if (valA === null || valA === undefined) return 1
    if (valB === null || valB === undefined) return -1

    if (valA < valB) return order === 'asc' ? -1 : 1
    if (valA > valB) return order === 'asc' ? 1 : -1
    return 0
  })
})

const totalResults = computed(() => filteredItems.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalResults.value / pageSize.value)))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedItems.value.slice(start, start + pageSize.value)
})

function goPage(p) { if (p >= 1 && p <= totalPages.value) currentPage.value = p }
function goToDetail(item) {
  router.push({ name: 'ChemDetail', params: { id: item.id }, query: { stationId: item.stationId, sampleId: item.sampleId } })
}

watch([pageSize, sortState, selectedFilters], () => currentPage.value = 1)
</script>

<style scoped>
/* 样式保持不变 */
.search-page { display:flex; height: calc(100vh - 80px); background: #f0f5fa; overflow: hidden; }

/* === 侧边栏宽度 380px === */
.sidebar { 
  width: 360px; 
  background: #fff; 
  border-right: 1px solid #e6e9eb; 
  height: 100%; 
  overflow-y: auto; 
  flex-shrink: 0; 
}

.content { flex:1; display:flex; flex-direction:column; background: #f4f8fb; overflow:hidden; }

/* === Sidebar Header === */
.sidebar-header {
  background: linear-gradient(to right, #e1f0fa, #f0f8ff, #e1f0fa);
  display: flex;
  justify-content: space-between;
  padding: 12px 16px; 
  align-items: center;
  border-bottom: 1px solid #e6e9eb;
  box-shadow: none; 
}

/* === 3D立体天蓝小箭头 (完全复用航次界面) === */
.nav-arrow-btn.arrow-3d {
  width: 40px;
  height: 40px;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 5;
  background: linear-gradient(180deg, #bae6fd 0%, #60a5fa 100%);
  filter: 
    drop-shadow(0px 4px 0px #2563eb) 
    drop-shadow(2px 6px 5px rgba(29, 78, 216, 0.25));
  transition: all 0.15s ease-out;
  padding: 0;
  display: block; 
}

/* 箭头左向裁剪 */
.nav-arrow-btn.arrow-3d.left {
  clip-path: polygon(0% 50%, 40% 0%, 40% 28%, 100% 28%, 100% 72%, 40% 72%, 40% 100%);
}

/* 箭头右向裁剪 */
.nav-arrow-btn.arrow-3d.right {
  clip-path: polygon(0% 28%, 60% 28%, 60% 0%, 100% 50%, 60% 100%, 60% 72%, 0% 72%);
}

/* 悬停效果 */
.nav-arrow-btn.arrow-3d:hover {
  background: linear-gradient(180deg, #e0f2fe 0%, #93c5fd 100%);
  filter: 
    drop-shadow(0px 5px 0px #2563eb) 
    drop-shadow(3px 8px 6px rgba(29, 78, 216, 0.3));
  transform: translateY(-2px);
}

/* 点击效果 */
.nav-arrow-btn.arrow-3d:active {
  filter: 
    drop-shadow(0px 1px 0px #2563eb) 
    drop-shadow(1px 2px 2px rgba(29, 78, 216, 0.3));
  transform: translateY(3px); 
}

/* 中间标题区域 */
.header-title-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* === 修改：实心烧瓶图标 (Simpler) === */
.chem-icon-simple {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 3px rgba(37, 99, 235, 0.2));
}

/* === 修改：文字更深更粗，模仿图片 === */
.title-text {
  color: #0f172a;  /* 深黑蓝 */
  font-size: 22px; 
  font-weight: 800; /* Extra Bold */
  letter-spacing: 1px;
  white-space: nowrap; 
}

.search-box-wrapper { padding: 16px 16px; background: #fff; border-bottom: 1px solid #f0f2f5; display: flex; gap: 8px; }
.search-box { position: relative; flex: 1; display: flex; align-items: center; }

/* === 搜索框 === */
.clean-input { 
  width: 100%; 
  padding: 10px 60px 10px 16px; 
  border: 1px solid #dbeafe; 
  border-radius: 20px; 
  background: #f8fbff; 
  font-size: 15px; 
  outline: none; 
  transition: 0.3s; 
  appearance: none; 
  -webkit-appearance: none; 
}
.clean-input:focus { border-color: #0085ca; background: #fff; box-shadow: 0 0 0 3px rgba(0, 133, 202, 0.1); }

.search-btn { position: absolute; right: 8px; background: none; border: none; color: #0085ca; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center;}
.clear-btn { position: absolute; right: 32px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 14px; padding: 4px; display: flex; align-items: center; justify-content: center; }
.clear-btn:hover { color: #ef4444; }

.trash-circle { width: 38px; height: 38px; border-radius: 50%; border: 1px solid #dae2e9; background: #fff; color: #8fa6b7; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; flex-shrink: 0; }
.trash-circle:hover { border-color: #ffcdd2; color: #ef5350; background: #ffebee; transform: rotate(90deg); }

.panel { border-bottom:1px solid #f0f2f5; }
.panel-header { display:flex; justify-content:space-between; padding:12px 16px; cursor:pointer; font-size:14px; font-weight:600; color:#003d82; transition: background 0.2s; }
.panel-header:hover { background: #f0f8ff; color: #0085ca; }
.caret { transform:rotate(-90deg); transition:transform 0.2s ease; color: #b0bec5; }
.caret.open { transform:rotate(0deg); color: #0085ca; }

.filter-list { list-style:none; padding:4px 0; margin:0; max-height:240px; overflow-y:auto; }
.filter-item { padding: 0; }
.filter-item:hover { background: #e1f5fe; }
.filter-label { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; width: 100%; cursor: pointer; }
.filter-label-left { display: flex; align-items: center; gap: 8px; overflow: hidden; }
.filter-name { color: #546e7a; font-size: 13px; }
.small-checkbox { margin: 0; accent-color: #0085ca; cursor: pointer;}
.item-count { background: #eceff1; padding: 1px 6px; border-radius: 10px; font-size: 12px; color: #78909c; }

.date-box-wrapper { background: #fcfdff; padding: 8px 16px; }
.date-input-group { display: flex; align-items: center; margin-bottom: 6px; font-size: 13px; color: #546e7a; }
.date-input-group label { width: 36px; font-weight: 600; }
.date-input { flex: 1; border: 1px solid #dbeafe; border-radius: 4px; padding: 6px 8px; font-size: 13px; color: #37474f; outline: none; }
.date-input:focus { border-color: #0085ca; }

.content-bar { padding: 14px 32px; background: #fff; border-bottom: 1px solid #e6e9eb; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.bar-content { display:flex; align-items:center; gap:12px; }
.icon-circle { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #e1f5fe, #f0f9ff); border: 1px solid #b3e5fc; display: flex; align-items: center; justify-content: center; color: #0085ca; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.bar-title { font-size: 16px; font-weight: 700; color: #003d82; letter-spacing: 0.5px; }
.bar-result { font-size: 13px; color: #78909c; margin-left: auto; background: #f1f5f9; padding: 4px 12px; border-radius: 20px; }
.result-number { font-weight: 800; color: #0085ca; margin-right: 4px; }

.pager-bar.ocean-pager { display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; background: linear-gradient(to right, #fcfeff, #f4f8fb); border-bottom: 1px solid #e6e9eb; }
.pager-left { display: flex; align-items: center; gap: 12px; }

.sort-wrapper {
  display: flex;
  align-items: center;
}

.page-size-label { font-size: 13px; color: #546e7a; font-weight: 500; margin-right: 4px; }
.select-wrapper { position: relative; }
.page-size-select { 
  appearance: none; 
  height: 34px; 
  padding: 0 28px 0 12px; 
  border: 1px solid #cfd8dc; 
  background: #fff; 
  border-radius: 6px; 
  font-size: 13px; 
  color: #003d82; 
  font-weight: 600; 
  cursor: pointer; 
  transition: 0.2s; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.03); 
}
.page-size-select:hover { border-color: #0085ca; }

.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 10px; color: #90a4ae; pointer-events: none; }
.result-text-small { font-size: 13px; color: #90a4ae; margin-left: 8px; }
.pager-right { display: flex; align-items: center; gap: 16px; }

.divider-vertical { width: 1px; height: 20px; background: #e0e6ed; margin: 0 16px; }
.sort-select { padding-right: 24px; min-width: 120px; }

.sort-order-btn { 
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px; 
  height: 34px; 
  margin-left: 8px; 
  border: 1px solid #cfd8dc; 
  background: #fff; 
  border-radius: 6px; 
  cursor: pointer; 
  color: #546e7a; 
  font-weight: bold; 
  transition: 0.2s; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.03); 
}
.sort-order-btn:hover { border-color: #0085ca; color: #0085ca; background: #f0f9ff; }

.ocean-btn { border: none; background: linear-gradient(135deg, #00c6fb 0%, #005bea 100%); color: #fff; padding: 8px 24px; border-radius: 24px; font-size: 13px; font-weight: 700; letter-spacing: 1px; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 91, 234, 0.3); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden; }
.ocean-btn::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0)); opacity: 0; transition: opacity 0.3s; }
.ocean-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 15px rgba(0, 91, 234, 0.4); }
.ocean-btn:hover::before { opacity: 1; }
.ocean-btn:active:not(:disabled) { transform: translateY(1px); }
.ocean-btn:disabled { background: #e0e6ed; color: #b0bec5; box-shadow: none; cursor: not-allowed; }
.page-info-box { background: #fff; border: 1px solid #e3e8ee; padding: 6px 16px; border-radius: 20px; color: #003d82; font-weight: 700; font-size: 13px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.03); }

.list { flex:1; overflow-y:auto; padding:24px 32px; display:flex; flex-direction:column; gap: 20px; }
.pro-card { background: #fff; border-radius: 12px; border: 1px solid #ced6e0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04); display: flex; align-items: stretch; min-height: 140px; position: relative; cursor: pointer; transition: all 0.3s ease; overflow: hidden; }
.pro-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(to bottom, #00c6fb, #005bea); }

/* === 修改：增强的 Hover 效果 === */
.pro-card:hover { 
  transform: translateY(-6px) scale(1.005); /* 增加上浮和微缩放 */
  box-shadow: 0 16px 32px rgba(0, 85, 180, 0.15); /* 加深阴影，带一点蓝色 */
  border-color: #0085ca; /* 边框变深蓝 */
  z-index: 10;
}

.card-section { padding: 20px; display: flex; flex-direction: column; justify-content: center; }

.section-id { flex: 0 0 30%; border-right: 1px dashed #d1d9e0; background: #fafbfc; }
.matrix-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.chem-icon-box { width: 40px; height: 40px; background: linear-gradient(135deg, #005bea, #00c6fb); color: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0, 91, 234, 0.25); }
.card-title { font-size: 18px; font-weight: 700; color: #003d82; margin: 0; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-clamp: 2;}

.id-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.id-box { display: flex; flex-direction: column; }
.id-box.full { grid-column: span 2; }
.label { font-size: 11px; color: #546e7a; font-weight: 700; margin-bottom: 3px; }
.value { font-size: 14px; color: #263238; font-family: 'Roboto Mono', 'Monaco', monospace; font-weight: 600; }
.value.highlight { color: #0085ca; font-weight: 700; font-size: 15px; }

.section-metrics { flex: 0 0 32%; padding-left: 32px; padding-right: 32px; border-right: 1px solid #e6e9eb; position: relative; }
.metric-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; }
.mt-3 { margin-top: 12px; }
.metric-label { font-size: 13px; color: #455a64; font-weight: 600; }
.metric-value { font-size: 18px; color: #003d82; font-weight: 700; }
.metric-value small { font-size: 12px; color: #78909c; font-weight: normal; margin-left: 2px; }
.date-font { font-size: 16px; font-family: 'Roboto Mono', monospace; color: #37474f; }
.depth-visual-bar { margin-top: 4px; margin-bottom: 8px; }
.bar-bg { height: 6px; background: #e0e6ed; border-radius: 3px; overflow: hidden; position: relative; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); border-radius: 3px; transition: width 0.5s ease; }
.bar-labels { display: flex; justify-content: space-between; margin-top: 4px; font-size: 10px; color: #90a4ae; font-weight: 600; text-transform: uppercase; }
.badges-row { display: flex; gap: 8px; margin-top: auto; }
.capsule-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
.capsule-badge.blue { background: #e3f2fd; color: #1565c0; border: 1px solid #bbdefb; }
.capsule-badge.green { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }

.section-tech { flex: 1; display: flex; flex-direction: column; background: #fff; justify-content: flex-start; }
.tech-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
.tech-item { display: flex; align-items: flex-start; gap: 10px; }
.tech-icon { font-size: 16px; background: #f5f7fa; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; color: #78909c; flex-shrink: 0; }
.tech-content { display: flex; flex-direction: column; overflow: hidden; }
.tech-label { font-size: 11px; color: #546e7a; font-weight: 600; margin-bottom: 2px; }
.tech-value { font-size: 13px; color: #263238; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.remarks-box { border-top: 1px dashed #eceff1; padding-top: 10px; margin-top: auto; font-size: 12px; display: flex; gap: 6px; align-items: flex-start; }
.remarks-label { color: #90a4ae; font-weight: 600; flex-shrink: 0; }
.remarks-text { color: #546e7a; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }

.hover-indicator { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #cfd8dc; opacity: 0; transition: all 0.3s; }
.pro-card:hover .hover-indicator { opacity: 1; right: 12px; color: #0085ca; transform: translateY(-50%) scale(1.1); } /* Indicator 动画优化 */

.empty-state { text-align: center; padding: 60px; color: #90a4ae; }
.empty-icon { font-size: 48px; margin-bottom: 16px; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.empty-text { font-size: 15px; font-weight: 500; }

.sidebar::-webkit-scrollbar, .list::-webkit-scrollbar, .filter-list::-webkit-scrollbar { width: 6px; }
.sidebar::-webkit-scrollbar-thumb, .list::-webkit-scrollbar-thumb, .filter-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
.sidebar::-webkit-scrollbar-track, .list::-webkit-scrollbar-track, .filter-list::-webkit-scrollbar-track { background: transparent; }
</style>