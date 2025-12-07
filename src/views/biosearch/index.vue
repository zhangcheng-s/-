<template>
  <div class="ocean-atlas">
    <header class="top-nav">
      <div class="nav-left">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 6C8 6 5 9 5 12s3 6 7 6c2 0 4-1 5-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-main">海洋生物图谱</span>
          </div>
        </div>
      </div>
      
      <div class="nav-center">
        <div class="nav-tabs">
          <div 
            class="nav-tab" 
            :class="{ active: currentView === 'dashboard' }"
            @click="currentView = 'dashboard'">
            <i class="el-icon-s-data"></i>
            <span>数据总览</span>
          </div>
          <div 
            class="nav-tab" 
            :class="{ active: currentView === 'gallery' }"
            @click="currentView = 'gallery'">
            <i class="el-icon-collection"></i>
            <span>样本图谱</span>
          </div>
        </div>
      </div>

      <div class="nav-right"></div>
    </header>

    <main class="main-content">
      <div v-if="currentView === 'gallery'" class="gallery-layout">
        
        <aside class="filter-panel">
          <div class="panel-scroll">
            <div class="filter-group">
              <div class="group-title">
                <div class="title-icon-box colorful">
                  <i class="el-icon-s-grid"></i>
                </div>
                <div class="title-text">
                  <span class="title-main">分类索引</span>
                  <span class="group-hint">TAXONOMY INDEX</span>
                </div>
              </div>
              <div class="rank-list">
                <div 
                  v-for="level in taxonomyLevels" 
                  :key="level.key"
                  class="rank-item"
                  :class="{ active: currentCategoryLevel === level.key && galleryMode === 'category' }"
                  @click="switchToCategoryMode(level.key)">
                  <div class="rank-indicator"></div>
                  <div class="rank-content">
                    <div class="rank-icon-wrap">
                      <i class="el-icon-folder"></i>
                    </div>
                    <div class="rank-info">
                      <span class="rank-cn">{{ level.label_cn }}</span>
                      <span class="rank-en">{{ level.label_en }}</span>
                    </div>
                    <div class="rank-badge">
                      <span class="badge-num">{{ getLevelTotalCount(level.key) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="filter-group stats-container">
              <div class="stats-card">
                <div class="stats-top-line"></div>
                <div class="stats-header-new">
                  <i class="el-icon-pie-chart"></i>
                  <span>库内统计</span>
                </div>
                <div class="stats-grid-new">
                  <div class="stat-box-new">
                    <div class="stat-label">总记录</div>
                    <div class="stat-num-big gradient-text-primary">{{ stats.totalCount }}</div>
                  </div>
                  <div class="stat-box-new">
                    <div class="stat-label">含图像</div>
                    <div class="stat-num-big gradient-text-success">{{ stats.withImages }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section class="content-area">
          
          <div class="content-header glass-header">
            <div class="header-decoration-bg"></div>
            
            <div class="header-left">
              <div class="breadcrumb-modern">
                <div class="crumb-item clickable" @click="resetToRoot">
                  <i class="el-icon-s-home"></i> 首页
                </div>
                <div class="crumb-sep">/</div>
                <template v-if="galleryMode === 'specimen'">
                   <div class="crumb-item clickable" @click="backToCategories">
                     {{ getCurrentLevelName() }}
                   </div>
                   <div class="crumb-sep">/</div>
                </template>
                <div class="crumb-item active">
                   {{ galleryMode === 'category' ? getCurrentLevelName() + '视图' : currentFilterValue }}
                </div>
              </div>

              <div class="header-main-title">
                 <h1 v-if="galleryMode === 'category'">{{ getCurrentLevelName() }}分布</h1>
                 <h1 v-else>{{ currentFilterValue }}</h1>
                 
                 <div class="header-count-badge">
                   <span class="dot"></span>
                   <span v-if="galleryMode === 'category'">{{ categoryList.length }} 个分类</span>
                   <span v-else>{{ galleryTotal }} 条记录</span>
                 </div>
              </div>

            </div>

            <div class="header-spacer"></div>

            <transition name="filter-tag">
              <div class="header-filter-chip" v-if="currentFilterValue && !currentFilterValue.startsWith('搜索:')">
                <div class="chip-icon">
                  <i class="el-icon-aim"></i>
                </div>
                <div class="chip-content">
                  <span class="chip-level">{{ getCurrentLevelName() }}</span>
                  <span class="chip-value">{{ currentFilterValue }}</span>
                </div>
                <button class="chip-close" @click="backToCategories" title="清除筛选">
                  <i class="el-icon-close"></i>
                </button>
              </div>
            </transition>

            <div class="header-pagination" v-if="galleryMode === 'specimen' && galleryTotal > 0">
              <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">
                <i class="el-icon-arrow-left"></i> 上一页
              </button>
              <div class="page-info">
                <span class="current">{{ page }}</span>
                <span class="sep">/</span>
                <span class="total-pages">{{ totalPages }}</span>
                <span class="total-records">共 {{ galleryTotal }} 条</span>
              </div>
              <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">
                下一页 <i class="el-icon-arrow-right"></i>
              </button>
            </div>

            <div class="header-right">
              <div class="search-box-modern">
                <i class="el-icon-search search-icon"></i>
                <input 
                  v-model="globalKeyword" 
                  placeholder="搜索学名 / 样品号..."
                  @keyup.enter="handleGlobalSearch"
                />
                <button class="search-clear-btn" v-if="globalKeyword" @click="clearSearch" title="清除">
                  <i class="el-icon-circle-close"></i>
                </button>
                <button class="search-submit-btn" @click="handleGlobalSearch" title="搜索">
                  <i class="el-icon-search"></i>
                </button>
              </div>

              <div class="view-toggle-text" v-if="galleryMode === 'specimen'">
                <div 
                  class="toggle-item" 
                  :class="{ active: displayMode === 'grid' }" 
                  @click="switchDisplayMode('grid')">
                  <i class="el-icon-menu"></i> 网格
                </div>
                <div 
                  class="toggle-item" 
                  :class="{ active: displayMode === 'list' }" 
                  @click="switchDisplayMode('list')">
                  <i class="el-icon-s-operation"></i> 列表
                </div>
              </div>
            </div>
          </div>

          <div v-if="galleryMode === 'category'" class="category-view" v-loading="loadingCategories">
            <el-empty v-if="!loadingCategories && categoryList.length === 0" description="暂无分类数据"></el-empty>
            
            <div class="chart-section-modern" v-if="categoryList.length > 0">
              <div class="chart-dashboard-card">
                <div class="chart-visual-box">
                  <div class="chart-title-float">Top 10 占比</div>
                  <div class="chart-ring-container" ref="categoryChart"></div>
                </div>
                <div class="chart-list-box">
                  <div class="list-box-header"><span>分类统计榜单</span><small>按数量排序</small></div>
                  <div class="list-scroll-area">
                    <div class="rank-row-modern" v-for="(cat, idx) in topCategories" :key="idx" @click="enterSpecimenList(cat)" @mouseenter="highlightChart(idx)" @mouseleave="unhighlightChart()">
                      <div class="rank-index" :class="'top-' + (idx + 1)">{{ idx + 1 }}</div>
                      <div class="rank-name-col">
                        <div class="rank-name-text">{{ cat.label }}</div>
                        <div class="rank-progress-bg">
                           <div class="rank-progress-fill" :style="{ width: getPercent(cat.count) + '%', background: colors[idx % colors.length] }"></div>
                        </div>
                      </div>
                      <div class="rank-value-col"><span class="num">{{ cat.count }}</span></div>
                      <div class="rank-action"><i class="el-icon-arrow-right"></i></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section-divider"><span>所有分类卡片</span></div>

            <div class="category-grid">
              <div class="category-card-modern" v-for="(cat, idx) in categoryList" :key="idx" @click="enterSpecimenList(cat)" :style="{ '--delay': idx * 0.03 + 's', '--accent': getMainColor(idx) }">
                <div class="card-glow"></div>
                <div class="card-modern-body">
                   <div class="modern-icon-box"><i :class="getIconByLevel()"></i></div>
                   <div class="modern-info">
                      <div class="modern-title">{{ cat.label }}</div>
                      <div class="modern-count">{{ cat.count }} <small>Records</small></div>
                   </div>
                   <div class="modern-arrow"><i class="el-icon-right"></i></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="galleryMode === 'specimen'" class="specimen-view" v-loading="loadingGallery" ref="scrollContainer">
            <el-empty v-if="!loadingGallery && galleryList.length === 0" description="暂无样本数据"></el-empty>

            <div v-if="displayMode === 'grid'" class="specimen-grid">
              <div 
                class="specimen-card" 
                v-for="(item, index) in galleryList" 
                :key="item.id || index"
                @click="goToDetail(item)"
                :style="{ '--delay': index * 0.02 + 's' }">
                
                <div class="specimen-image">
                  <el-image :src="getRealImageUrl(item)" fit="cover" lazy>
                    <div slot="placeholder" class="img-loading">
                      <i class="el-icon-loading"></i>
                    </div>
                    <div slot="error" class="img-error-pretty">
                      <i class="el-icon-picture-outline-round"></i>
                      <span>暂无图像</span>
                    </div>
                  </el-image>
                  <div class="image-overlay">
                    <div class="overlay-btn"><i class="el-icon-view"></i> 查看详情</div>
                  </div>
                </div>

                <div class="specimen-info">
                  <h4 class="specimen-name" :title="item.scientificName">
                    {{ item.scientificName || 'Unknown Species' }}
                  </h4>
                  
                  <div class="specimen-sample-id">
                    <i class="el-icon-collection-tag"></i>
                    <span>{{ item.sampleName || '未命名' }}</span>
                  </div>
                  
                  <div class="specimen-key-info">
                    <div class="key-item">
                      <span class="key-label">鉴定状态</span>
                      <span class="key-value" :class="getStatusClass(item.identificationStatus)">
                        {{ item.identificationStatus || '未鉴定' }}
                      </span>
                    </div>
                    <div class="key-item" v-if="item.numberOfIndividuals">
                      <span class="key-label">个体数</span>
                      <span class="key-value">{{ item.numberOfIndividuals }}</span>
                    </div>
                    <div class="key-item" v-if="item.lifeStage">
                      <span class="key-label">生命期</span>
                      <span class="key-value">{{ item.lifeStage }}</span>
                    </div>
                    <div class="key-item" v-if="item.sex">
                      <span class="key-label">性别</span>
                      <span class="key-value">{{ item.sex }}</span>
                    </div>
                    <div class="key-item" v-if="item.identificationMethod">
                      <span class="key-label">鉴定方法</span>
                      <span class="key-value">{{ item.identificationMethod }}</span>
                    </div>
                    <div class="key-item" v-if="item.morphotype">
                      <span class="key-label">形态型</span>
                      <span class="key-value">{{ item.morphotype }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="displayMode === 'list'" class="specimen-list-container">
              <div class="list-head-row">
                <div class="col-head col-img">图像</div>
                <div class="col-head col-name">物种信息</div>
                <div class="col-head col-taxa">分类层级</div>
                <div class="col-head col-extra">附加信息</div>
                <div class="col-head col-status">状态</div>
                <div class="col-head col-action">操作</div>
              </div>

              <div class="list-card-row" v-for="(item, index) in galleryList" :key="item.id || index" @click="goToDetail(item)">
                <div class="col-body col-img">
                  <div class="row-thumb-large">
                    <el-image :src="getRealImageUrl(item)" fit="cover" lazy>
                      <div slot="error" class="thumb-error">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                  </div>
                </div>
                <div class="col-body col-name">
                  <div class="species-info-card">
                    <div class="name-sci-main">{{ item.scientificName || 'Unknown Species' }}</div>
                    <div class="name-sample-sub">
                      <i class="el-icon-collection-tag"></i>
                      <span>{{ item.sampleName }}</span>
                    </div>
                  </div>
                </div>
                <div class="col-body col-taxa">
                  <div class="taxonomy-hierarchy-list">
                    <div class="taxa-row-item" :class="{ highlighted: currentCategoryLevel === 'taxa_kingdom' && item.taxa_kingdom === currentFilterValue }" v-if="item.taxa_kingdom">
                      <span class="taxa-rank-label">界</span>
                      <span class="taxa-name-value">{{ item.taxa_kingdom }}</span>
                    </div>
                    <div class="taxa-row-item" :class="{ highlighted: currentCategoryLevel === 'taxa_phylum' && item.taxa_phylum === currentFilterValue }" v-if="item.taxa_phylum">
                      <span class="taxa-rank-label">门</span>
                      <span class="taxa-name-value">{{ item.taxa_phylum }}</span>
                    </div>
                    <div class="taxa-row-item" :class="{ highlighted: currentCategoryLevel === 'taxa_class' && item.taxa_class === currentFilterValue }" v-if="item.taxa_class">
                      <span class="taxa-rank-label">纲</span>
                      <span class="taxa-name-value">{{ item.taxa_class }}</span>
                    </div>
                    <div class="taxa-row-item" :class="{ highlighted: currentCategoryLevel === 'taxa_order' && item.taxa_order === currentFilterValue }" v-if="item.taxa_order">
                      <span class="taxa-rank-label">目</span>
                      <span class="taxa-name-value">{{ item.taxa_order }}</span>
                    </div>
                    <div class="taxa-row-item" :class="{ highlighted: currentCategoryLevel === 'taxa_family' && item.taxa_family === currentFilterValue }" v-if="item.taxa_family">
                      <span class="taxa-rank-label">科</span>
                      <span class="taxa-name-value">{{ item.taxa_family }}</span>
                    </div>
                    <div class="taxa-row-item" :class="{ highlighted: currentCategoryLevel === 'taxa_genus' && item.taxa_genus === currentFilterValue }" v-if="item.taxa_genus">
                      <span class="taxa-rank-label">属</span>
                      <span class="taxa-name-value">{{ item.taxa_genus }}</span>
                    </div>
                  </div>
                </div>
                <div class="col-body col-extra">
                  <div class="extra-info-list">
                    <div class="extra-item" v-if="item.numberOfIndividuals">
                      <span class="extra-lbl">个体数</span>
                      <span class="extra-num">{{ item.numberOfIndividuals }}</span>
                    </div>
                    <div class="extra-item" v-if="item.lifeStage">
                      <span class="extra-lbl">生命期</span>
                      <span class="extra-txt">{{ item.lifeStage }}</span>
                    </div>
                    <div class="extra-item" v-if="item.sex">
                      <span class="extra-lbl">性别</span>
                      <span class="extra-txt">{{ item.sex }}</span>
                    </div>
                    <div class="extra-item" v-if="item.identificationMethod">
                      <span class="extra-lbl">鉴定法</span>
                      <span class="extra-txt">{{ item.identificationMethod }}</span>
                    </div>
                  </div>
                </div>
                <div class="col-body col-status">
                  <div class="status-badge-new" :class="getStatusClass(item.identificationStatus)">
                    <span class="status-indicator"></span>
                    <span class="status-label">{{ item.identificationStatus || '未鉴定' }}</span>
                  </div>
                </div>
                <div class="col-body col-action">
                  <button class="detail-btn-new" @click.stop="goToDetail(item)">
                    <i class="el-icon-view"></i>
                    详情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div v-if="currentView === 'dashboard'" class="dashboard-layout">
        <div class="dashboard-placeholder">
          <i class="el-icon-s-data"></i>
          <p>数据总览开发中...</p>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { api } from '@/api/management';
import { debounce } from 'lodash'; 

export default {
  name: 'OceanAtlas',
  data() {
    return {
      currentView: 'dashboard', 
      galleryMode: 'category',
      currentCategoryLevel: 'taxa_kingdom',
      currentFilterValue: '',
      globalKeyword: '',
      displayMode: 'grid',

      levelMap: {
        'taxa_kingdom': 'taxaKingdom',
        'taxa_phylum':  'taxaPhylum',
        'taxa_class':   'taxaClass',
        'taxa_order':   'taxaOrder',
        'taxa_family':  'taxaFamily',
        'taxa_genus':   'taxaGenus',
        'taxa_species': 'taxaSpecies'
      },

      levelCounts: {},
      loadingCategories: false,
      categoryList: [],

      loadingGallery: false,
      galleryList: [],
      galleryTotal: 0,
      page: 1,
      size: 20, 

      taxonomyLevels: [
        { key: 'taxa_kingdom', label_cn: '界', label_en: 'Kingdom' },
        { key: 'taxa_phylum', label_cn: '门', label_en: 'Phylum' },
        { key: 'taxa_class', label_cn: '纲', label_en: 'Class' },
        { key: 'taxa_order', label_cn: '目', label_en: 'Order' },
        { key: 'taxa_family', label_cn: '科', label_en: 'Family' },
        { key: 'taxa_genus', label_cn: '属', label_en: 'Genus' },
        { key: 'taxa_species', label_cn: '种', label_en: 'Species' }
      ],

      stats: { totalCount: 0, withImages: 0 },
      chartInstance: null,
      colors: [
        '#3b82f6', '#06b6d4', '#14b8a6', '#8b5cf6', 
        '#f43f5e', '#f59e0b', '#10b981', '#6366f1'
      ],

      resizeHandler: null
    };
  },
  computed: {
    topCategories() {
      return [...this.categoryList]
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
    totalPages() {
      if (this.size === 0) return 0;
      return Math.ceil(this.galleryTotal / this.size);
    }
  },
  watch: {
    currentView(newVal) {
      if (newVal === 'gallery') {
        this.$nextTick(() => {
          if (this.galleryMode === 'category' && this.categoryList.length > 0) {
            this.renderCategoryChart();
          }
          this.calculatePageSize();
        });
      }
    }
  },
  created() {
    this.loadAllLevelCounts();
    this.switchToCategoryMode('taxa_kingdom');
    
    this.resizeHandler = debounce(() => {
      this.calculatePageSize();
    }, 200);
  },
  mounted() {
    window.addEventListener('resize', this.resizeHandler);
  },
  beforeDestroy() {
    if (this.chartInstance) this.chartInstance.dispose();
    window.removeEventListener('resize', this.resizeHandler);
  },
  methods: {
    calculatePageSize() {
      if (this.galleryMode !== 'specimen') return;
      const container = this.$refs.scrollContainer;
      if (!container) return;

      // 内容区域可用高度（减去 padding）
      const availableHeight = container.clientHeight - 48;
      const containerWidth = container.clientWidth - 96;

      if (availableHeight < 200) { this.size = 6; return; }

      if (this.displayMode === 'grid') {
        const cardWidth = 280; const gap = 24; const cardHeight = 380;
        const cols = Math.max(Math.floor((containerWidth + gap) / (cardWidth + gap)), 3);
        const rows = Math.max(Math.floor(availableHeight / cardHeight), 2);
        let newSize = cols * rows;
        if (newSize < 12) newSize = 12;
        if (newSize > 60) newSize = 60;
        if (this.size !== newSize) { this.size = newSize; this.fetchGalleryData(); }
      } else {
        const rowHeight = 82;
        let rows = Math.floor(availableHeight / rowHeight);
        if (rows < 4) rows = 4; if (rows > 20) rows = 20;
        if (this.size !== rows) { this.size = rows; this.fetchGalleryData(); }
      }
    },

    switchDisplayMode(mode) {
      this.displayMode = mode;
      this.$nextTick(() => {
        this.page = 1;
        this.calculatePageSize(); 
      });
    },

    async loadAllLevelCounts() {
      for (const level of this.taxonomyLevels) {
        try {
          const res = await api.biologicalResults.getCount({ field: level.key });
          let data = Array.isArray(res) ? res : (res?.data || []);
          this.levelCounts[level.key] = data.length;
        } catch (e) {
          this.levelCounts[level.key] = 0;
        }
      }
      this.$forceUpdate();
    },

    getLevelTotalCount(levelKey) { return this.levelCounts[levelKey] || '-'; },

    async switchToCategoryMode(levelKey) {
      this.galleryMode = 'category';
      this.currentCategoryLevel = levelKey;
      this.currentFilterValue = '';
      this.page = 1;
      this.loadingCategories = true;
      try {
        const res = await api.biologicalResults.getCount({ field: levelKey, isDesc: 1 });
        let rawData = [];
        if (Array.isArray(res)) rawData = res;
        else if (res && res.data) rawData = res.data;

        this.categoryList = rawData.map(item => {
          if (typeof item === 'object' && item !== null) {
            const val = item.className || item.value || item.name || 'Unknown';
            return { label: val, value: val, count: item.count || 0 };
          }
          return { label: item, value: item, count: 0 };
        }).filter(i => i.value && i.value !== 'Unknown' && i.value !== 'null');

        this.updateStats();
        if (this.currentView === 'gallery') this.$nextTick(() => this.renderCategoryChart());
      } catch (e) {
        console.error(e);
        this.categoryList = [];
      } finally {
        this.loadingCategories = false;
      }
    },

    updateStats() {
      const total = this.categoryList.reduce((sum, cat) => sum + cat.count, 0);
      this.stats.totalCount = total;
      this.stats.withImages = Math.floor(total * 0.7);
    },
    getTotalSpecimenCount() { return this.categoryList.reduce((sum, cat) => sum + cat.count, 0); },
    getPercent(count) {
      const total = this.getTotalSpecimenCount();
      return total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    },
    getMainColor(idx) { return this.colors[idx % this.colors.length]; },
    getIconByLevel() {
      const icons = {
        taxa_kingdom: 'el-icon-s-home', taxa_phylum: 'el-icon-folder-opened',
        taxa_class: 'el-icon-files', taxa_order: 'el-icon-document',
        taxa_family: 'el-icon-document-copy', taxa_genus: 'el-icon-tickets',
        taxa_species: 'el-icon-postcard'
      };
      return icons[this.currentCategoryLevel] || 'el-icon-folder';
    },

    renderCategoryChart() {
      if (!this.$refs.categoryChart) return;
      if (this.chartInstance) this.chartInstance.dispose();
      this.chartInstance = echarts.init(this.$refs.categoryChart);
      const total = this.topCategories.reduce((sum, item) => sum + item.count, 0);
      const data = this.topCategories.map((cat, idx) => ({
        name: cat.label, value: cat.count,
        itemStyle: { color: this.colors[idx % this.colors.length], borderRadius: 8, borderColor: '#fff', borderWidth: 2 }
      }));
      this.chartInstance.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        title: { text: '{num|' + total + '}\n{txt|Total}', left: 'center', top: 'center', textStyle: { rich: { num: { fontSize: 28, fontWeight: 'bold' }, txt: { fontSize: 12, color: '#94a3b8' } } } },
        series: [{ type: 'pie', radius: ['55%', '75%'], center: ['50%', '50%'], label: { show: false }, data: data }]
      });
    },
    highlightChart(index) { if (this.chartInstance) this.chartInstance.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: index }); },
    unhighlightChart() { if (this.chartInstance) this.chartInstance.dispatchAction({ type: 'downplay', seriesIndex: 0 }); },

    enterSpecimenList(categoryItem) {
      this.currentFilterValue = categoryItem.value;
      this.galleryMode = 'specimen';
      this.page = 1;
      this.fetchGalleryData();
      this.$nextTick(() => this.calculatePageSize());
    },
    backToCategories() {
      this.galleryMode = 'category';
      this.currentFilterValue = '';
      this.$nextTick(() => this.renderCategoryChart());
    },
    resetToRoot() { this.switchToCategoryMode('taxa_kingdom'); },
    
    handleGlobalSearch() {
      if (!this.globalKeyword) return;
      this.currentView = 'gallery'; 
      this.galleryMode = 'specimen';
      this.currentFilterValue = `搜索: ${this.globalKeyword}`;
      this.page = 1;
      this.fetchGalleryData();
      this.$nextTick(() => this.calculatePageSize());
    },

    clearSearch() {
      this.globalKeyword = '';
      if (this.currentFilterValue && this.currentFilterValue.startsWith('搜索:')) {
        this.backToCategories();
      }
    },

    async fetchGalleryData(newPage) {
      if (typeof newPage === 'number') {
        this.page = newPage;
      }

      this.loadingGallery = true;
      this.$nextTick(() => {
        if (this.$refs.scrollContainer) this.$refs.scrollContainer.scrollTop = 0;
      });

      try {
        let res;
        if (this.currentCategoryLevel && this.currentFilterValue && !this.currentFilterValue.startsWith('搜索:')) {
          const apiField = this.levelMap[this.currentCategoryLevel];
          const payload = {};
          if (apiField) payload[apiField] = this.currentFilterValue; 
          res = await api.biologicalResults.query(payload);
          if (res && res.data) {
            const allData = this.normalizeData(res.data);
            this.galleryTotal = allData.length; 
            const start = (this.page - 1) * this.size;
            const end = start + this.size;
            this.galleryList = allData.slice(start, end);
          }
        } else {
          const payload = { page: this.page - 1, size: this.size };
          if (this.globalKeyword) payload.scientificName = this.globalKeyword;
          res = await api.biologicalResults.page(payload);
          if (res && res.data) {
            this.galleryList = this.normalizeData(res.data);
            this.galleryTotal = res.total || res.data.length;
          }
        }
      } catch (e) {
        console.error(e);
        this.galleryList = [];
        this.galleryTotal = 0;
      } finally {
        this.loadingGallery = false;
      }
    },

    changePage(newPage) {
      if (newPage < 1 || newPage > this.totalPages) return;
      this.page = newPage;
      this.fetchGalleryData();
    },

    getCurrentLevelName() {
      const level = this.taxonomyLevels.find(l => l.key === this.currentCategoryLevel);
      return level ? level.label_cn : '分类';
    },

    goToDetail(item) {
      console.log('goToDetail called, item:', item);
      if(item && item.id) {
        this.$router.push({ name: 'BioDetail', params: { id: item.id } });
      } else {
        this.$message.warning('该记录没有ID，无法查看详情');
      }
    },

    normalizeData(rawData) {
      if (!Array.isArray(rawData)) return [];
      return rawData.map(item => ({
        ...item,
        id: item.id,
        sampleName: item.sampleName || '未命名',
        scientificName: item.scientificName || 'Unknown',
        taxa_kingdom: item.taxaKingdom || item.taxa_kingdom || '',
        taxa_phylum: item.taxaPhylum || item.taxa_phylum || '',
        taxa_class: item.taxaClass || item.taxa_class || '',
        taxa_order: item.taxaOrder || item.taxa_order || '',
        taxa_family: item.taxaFamily || item.taxa_family || '',
        taxa_genus: item.taxaGenus || item.taxa_genus || '',
        taxa_species: item.taxaSpecies || item.taxa_species || '',
        identificationStatus: item.identificationStatus || '未鉴定',
        photoFileName: item.photoFileName || ''
      }));
    },

    getStatusClass(status) {
      if (status === '已鉴定') return 'status-success';
      if (status === '待校验') return 'status-warning';
      return 'status-info';
    },
    
    getRealImageUrl(item) {
      if (!item.photoFileName) return '';
      if (item.photoFileName.startsWith('http')) return item.photoFileName;
      return `${import.meta.env.VITE_API_BASE || '/api'}/static/images/${item.photoFileName}`;
    }
  }
};
</script>

<style scoped>
/* ========================================
   海洋生物图谱 - 清理后的设计系统
   ======================================== */

.ocean-atlas {
  /* 主色调 */
  --primary: #0284c7;
  --primary-light: #38bdf8;
  --primary-dark: #0369a1;
  --primary-bg: #f0f9ff;
  
  /* 成功/警告/信息 */
  --success: #059669;
  --success-bg: #d1fae5;
  --warning: #d97706;
  --warning-bg: #fef3c7;
  --info: #6366f1;
  --info-bg: #e0e7ff;
  
  /* 中性色 */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  font-weight: 500;
  letter-spacing: 0.01em;
  
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
  height: 100vh;
  color: var(--gray-800);
  overflow: hidden;
}

*, *::before, *::after { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

/* ========== 顶部导航栏 ========== */
.top-nav {
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  align-items: center;
  padding: 0 32px;
  position: relative;
  z-index: 100;
}

.nav-left, .nav-right { flex: 1; }

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}

.logo-icon svg {
  width: 24px;
  height: 24px;
}

.logo-main {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.02em;
}

.nav-center .nav-tabs {
  display: flex;
  gap: 6px;
  background: var(--gray-100);
  padding: 5px;
  border-radius: 14px;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-500);
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-tab:hover {
  color: var(--gray-700);
  background: rgba(255, 255, 255, 0.6);
}

.nav-tab.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.nav-tab i {
  font-size: 16px;
}

/* ========== 主内容区域 ========== */
.main-content {
  height: calc(100vh - 64px);
  display: flex;
  overflow: hidden;
}

.gallery-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

/* ========== 左侧筛选面板 ========== */
.filter-panel {
  width: 300px;
  background: white;
  border-right: 1px solid var(--gray-200);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.panel-scroll {
  flex: 1;
  padding: 28px 20px;
  overflow-y: auto;
}

.panel-scroll::-webkit-scrollbar {
  width: 4px;
}

.panel-scroll::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 2px;
}

/* 筛选组标题 */
.filter-group {
  margin-bottom: 28px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.title-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.title-icon-box.colorful {
  background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-main {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.01em;
}

.group-hint {
  font-size: 11px;
  font-weight: 600;
  color: var(--gray-400);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ========== 分类索引列表 ========== */
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rank-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.rank-item:hover {
  background: var(--primary-bg);
  border-color: rgba(2, 132, 199, 0.1);
}

.rank-item.active {
  background: linear-gradient(135deg, var(--primary-bg) 0%, #e0f2fe 100%);
  border-color: rgba(2, 132, 199, 0.25);
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.1);
}

.rank-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, var(--primary) 0%, var(--primary-light) 100%);
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.rank-item.active .rank-indicator {
  opacity: 1;
}

.rank-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-icon-wrap {
  width: 36px;
  height: 36px;
  background: var(--gray-100);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--gray-500);
  transition: all 0.2s;
}

.rank-item.active .rank-icon-wrap {
  background: var(--primary);
  color: white;
}

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rank-cn {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-800);
  letter-spacing: 0.02em;
}

.rank-item.active .rank-cn {
  color: var(--primary-dark);
}

.rank-en {
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-400);
  letter-spacing: 0.03em;
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 28px;
  padding: 0 10px;
  background: var(--gray-100);
  border-radius: 8px;
  transition: all 0.2s;
}

.badge-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-700);
}

.rank-item.active .rank-badge {
  background: white;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.15);
}

.rank-item.active .badge-num {
  color: var(--primary);
}

/* ========== 统计卡片 ========== */
.stats-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--gray-200);
  position: relative;
  overflow: hidden;
}

.stats-top-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary) 0%, #10b981 50%, #6366f1 100%);
}

.stats-header-new {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.stats-header-new i {
  font-size: 18px;
  color: var(--primary);
}

.stats-header-new span {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-800);
}

.stats-grid-new {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-box-new {
  padding: 16px;
  background: var(--gray-50);
  border-radius: 12px;
  border: 1px solid var(--gray-100);
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-500);
  margin-bottom: 6px;
  letter-spacing: 0.03em;
}

.stat-num-big {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.gradient-text-primary {
  background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-600) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-text-success {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ========== 内容区域 ========== */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

/* ========== 玻璃头部 ========== */
.glass-header {
  flex-shrink: 0;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  align-items: center;
  position: relative;
  z-index: 20;
}

.header-decoration-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at top right, rgba(56, 189, 248, 0.08) 0%, transparent 50%);
}

.header-left {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 面包屑导航 */
.breadcrumb-modern {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crumb-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-500);
  transition: color 0.2s;
}

.crumb-item.clickable {
  cursor: pointer;
}

.crumb-item.clickable:hover {
  color: var(--primary);
}

.crumb-item.active {
  color: var(--gray-800);
  font-weight: 600;
}

.crumb-item i {
  font-size: 14px;
}

.crumb-sep {
  color: var(--gray-300);
  font-size: 12px;
}

/* 主标题 */
.header-main-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-main-title h1 {
  font-size: 26px;
  font-weight: 800;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  margin: 0;
}

.header-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--primary-bg) 0%, #e0f2fe 100%);
  border: 1px solid rgba(2, 132, 199, 0.2);
  border-radius: 20px;
}

.header-count-badge .dot {
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.header-count-badge span:last-child {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-dark);
}

.header-spacer {
  flex: 1;
  min-width: 24px;
}

/* ========== 头部筛选芯片（新样式） ========== */
.header-filter-chip {
  display: flex;
  align-items: center;
  gap: 0;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  animation: chipIn 0.3s ease;
  margin-left: 20px;
}

@keyframes chipIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--info));
  color: white;
  font-size: 16px;
}

.chip-content {
  display: flex;
  flex-direction: column;
  padding: 6px 14px;
  gap: 2px;
}

.chip-level {
  font-size: 10px;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chip-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-900);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 40px;
  background: transparent;
  border: none;
  border-left: 1px solid var(--gray-100);
  color: var(--gray-400);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-close:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* ========== 头部分页控件 ========== */
.header-pagination {
  display: flex;
  align-items: center;
  gap: 4px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 28px;
  padding: 4px;
  margin-right: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-600);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.page-btn:hover:not(:disabled) {
  background: var(--primary-bg);
  color: var(--primary);
}

.page-btn:disabled {
  color: var(--gray-300);
  cursor: not-allowed;
}

.page-btn i {
  font-size: 12px;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--gray-50);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.page-info .current {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
}

.page-info .sep {
  color: var(--gray-300);
}

.page-info .total-pages {
  color: var(--gray-700);
  font-weight: 700;
}

.page-info .total-records {
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--gray-200);
  color: var(--gray-400);
  font-size: 12px;
  font-weight: 500;
}

/* ========== 右侧工具栏 ========== */
.header-right {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box-modern {
  display: flex;
  align-items: center;
  gap: 0;
  background: white;
  padding: 0;
  border-radius: 12px;
  width: 260px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.25s;
  overflow: hidden;
}

.search-box-modern:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.1);
  width: 300px;
}

.search-box-modern .search-icon {
  font-size: 15px;
  color: var(--gray-400);
  padding-left: 14px;
}

.search-box-modern input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-800);
  padding: 12px 10px;
  min-width: 0;
}

.search-box-modern input::placeholder {
  color: var(--gray-400);
  font-size: 13px;
}

.search-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.search-clear-btn:hover {
  color: var(--gray-600);
}

.search-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 42px;
  background: linear-gradient(135deg, var(--primary), var(--info));
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.search-submit-btn:hover {
  filter: brightness(1.1);
}

.view-toggle-text {
  display: flex;
  background: white;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--gray-200);
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-500);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.toggle-item:hover {
  color: var(--gray-700);
}

.toggle-item.active {
  background: var(--primary-bg);
  color: var(--primary);
}

/* ========== 内容滚动区 ========== */
.category-view,
.specimen-view {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 28px 48px;
  scroll-behavior: smooth;
}

.category-view::-webkit-scrollbar,
.specimen-view::-webkit-scrollbar {
  width: 8px;
}

.category-view::-webkit-scrollbar-track,
.specimen-view::-webkit-scrollbar-track {
  background: transparent;
}

.category-view::-webkit-scrollbar-thumb,
.specimen-view::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 4px;
}

.category-view::-webkit-scrollbar-thumb:hover,
.specimen-view::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}

/* ===========================================
   网格卡片样式 - Grid Cards
   =========================================== */
.specimen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 8px 4px;
}

.specimen-card {
  background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.specimen-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--info));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.specimen-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 12px 32px rgba(2, 132, 199, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--primary-light);
}

.specimen-card:hover::before {
  opacity: 1;
}

.specimen-card:hover .specimen-image img,
.specimen-card:hover .specimen-image .el-image {
  transform: scale(1.08);
}

.specimen-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--gray-100), var(--gray-200));
  border-radius: 16px 16px 0 0;
}

.specimen-image .el-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.specimen-image .el-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.specimen-image .img-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--gray-100);
  color: var(--primary);
  font-size: 24px;
  animation: pulse 1.5s ease-in-out infinite;
}

.specimen-image .img-error-pretty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--gray-100), var(--gray-200));
  color: var(--gray-400);
  gap: 8px;
}

.specimen-image .img-error-pretty i {
  font-size: 42px;
}

.specimen-image .img-error-pretty span {
  font-size: 13px;
  font-weight: 500;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.specimen-card:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--primary);
  border-radius: 25px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.specimen-card:hover .overlay-btn {
  transform: translateY(0);
}

.specimen-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.specimen-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;
}

.specimen-card:hover .specimen-name {
  color: var(--primary);
}

.specimen-sample-id {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gray-500);
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--gray-200);
}

.specimen-sample-id i {
  color: var(--primary);
  font-size: 13px;
}

.specimen-sample-id span {
  font-weight: 600;
  color: var(--gray-700);
}

/* 网格卡片关键信息 */
.specimen-key-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.key-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  background: var(--gray-50);
  border-radius: 8px;
  min-width: calc(50% - 3px);
  flex: 1;
}

.key-item .key-label {
  font-size: 10px;
  color: var(--gray-500);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.key-item .key-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===========================================
   列表视图样式 - List View
   =========================================== */
.specimen-list-container {
  padding: 8px 0;
}

.list-head-row {
  display: grid;
  grid-template-columns: 110px 1.5fr 2.2fr 1.2fr 100px 90px;
  padding: 14px 20px;
  background: linear-gradient(135deg, var(--gray-50), var(--gray-100));
  border-radius: 12px;
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 11px;
  color: var(--gray-600);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.col-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.col-head::before {
  content: '';
  width: 3px;
  height: 12px;
  background: var(--primary);
  border-radius: 2px;
}

.list-card-row {
  display: grid;
  grid-template-columns: 110px 1.5fr 2.2fr 1.2fr 100px 90px;
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--gray-100);
  cursor: pointer;
  min-height: 110px;
}

.list-card-row:hover {
  transform: translateX(4px);
  box-shadow: 
    0 4px 20px rgba(2, 132, 199, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border-color: var(--primary-light);
  background: linear-gradient(90deg, white 0%, #f0f9ff 100%);
}

.col-body {
  font-size: 13px;
  color: var(--gray-700);
}

/* 列表图片放大 */
.row-thumb-large {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--gray-100);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;
}

.list-card-row:hover .row-thumb-large {
  transform: scale(1.05);
}

.row-thumb-large .el-image {
  width: 100%;
  height: 100%;
}

.row-thumb-large .el-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.row-thumb-large .thumb-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--gray-100), var(--gray-200));
  color: var(--gray-300);
  font-size: 28px;
}

/* 物种信息卡片 */
.species-info-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.name-sci-main {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.3;
  transition: color 0.2s ease;
}

.list-card-row:hover .name-sci-main {
  color: var(--primary);
}

.name-sample-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gray-500);
}

.name-sample-sub i {
  font-size: 12px;
  color: var(--primary);
}

/* 分类层级列表（高亮当前筛选） */
.taxonomy-hierarchy-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.taxa-row-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--gray-50);
  border-radius: 6px;
  font-size: 11px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.taxa-row-item.highlighted {
  background: linear-gradient(135deg, var(--primary-light), #bae6fd);
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.2);
}

.taxa-row-item .taxa-rank-label {
  color: var(--primary);
  font-weight: 700;
  font-size: 10px;
}

.taxa-row-item .taxa-name-value {
  color: var(--gray-700);
  font-weight: 600;
}

.taxa-row-item.highlighted .taxa-name-value {
  color: var(--primary-dark);
  font-weight: 700;
}

/* 附加信息列表 */
.extra-info-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.extra-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.extra-item .extra-lbl {
  color: var(--gray-400);
  font-weight: 500;
  min-width: 45px;
}

.extra-item .extra-num {
  color: var(--primary);
  font-weight: 700;
}

.extra-item .extra-txt {
  color: var(--gray-700);
  font-weight: 600;
}

/* 状态徽章新版 */
.status-badge-new {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge-new .status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-badge-new.confirmed {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #15803d;
}

.status-badge-new.confirmed .status-indicator {
  background: var(--success);
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
}

.status-badge-new.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #b45309;
}

.status-badge-new.pending .status-indicator {
  background: var(--warning);
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
}

.status-badge-new.unidentified {
  background: var(--gray-100);
  color: var(--gray-600);
}

.status-badge-new.unidentified .status-indicator {
  background: var(--gray-400);
}

/* 详情按钮新版 */
.detail-btn-new {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary), var(--info));
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
  white-space: nowrap;
}

.detail-btn-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
}

.detail-btn-new i {
  font-size: 13px;
}

/* ===========================================
   图表区域样式 - Chart Section
   =========================================== */
.chart-section-modern {
  margin-bottom: 32px;
}

.chart-dashboard-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.chart-visual-box {
  position: relative;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid var(--gray-100);
  display: flex;
  flex-direction: column;
}

.chart-title-float {
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-600);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-title-float::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, var(--primary), var(--info));
  border-radius: 2px;
}

.chart-ring-container {
  flex: 1;
  min-height: 280px;
  width: 100%;
}

.chart-list-box {
  padding: 24px;
  display: flex;
  flex-direction: column;
  background: white;
}

.list-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--gray-100);
}

.list-box-header span {
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-900);
}

.list-box-header small {
  font-size: 11px;
  color: var(--gray-500);
  font-weight: 500;
}

.list-scroll-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-row-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--gray-50);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.rank-row-modern:hover {
  background: white;
  border-color: var(--primary-light);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.1);
  transform: translateX(4px);
}

.rank-index {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  border-radius: 8px;
  flex-shrink: 0;
}

.rank-index.top-1 {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.rank-index.top-2 {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
}

.rank-index.top-3 {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: white;
}

.rank-index.top-4,
.rank-index.top-5,
.rank-index.top-6,
.rank-index.top-7,
.rank-index.top-8,
.rank-index.top-9,
.rank-index.top-10 {
  background: var(--gray-200);
  color: var(--gray-600);
}

.rank-name-col {
  flex: 1;
  min-width: 0;
}

.rank-name-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-progress-bg {
  height: 4px;
  background: var(--gray-200);
  border-radius: 2px;
  overflow: hidden;
}

.rank-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.rank-value-col {
  text-align: right;
}

.rank-value-col .num {
  font-size: 16px;
  font-weight: 800;
  color: var(--primary);
}

.rank-action {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  transition: all 0.2s;
}

.rank-row-modern:hover .rank-action {
  color: var(--primary);
  transform: translateX(2px);
}

/* 分隔线 */
.section-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0 24px;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gray-200), transparent);
}

.section-divider span {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ===========================================
   分类视图卡片 - Category Cards
   =========================================== */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  padding: 16px 0;
}

.category-card-modern {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: left;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid var(--gray-100);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.4s ease backwards;
  animation-delay: var(--delay, 0s);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.category-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary) 0%, var(--info) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.category-card-modern:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(2, 132, 199, 0.2);
  border-color: var(--primary);
}

.category-card-modern:hover::before {
  opacity: 0.05;
}

.category-card-modern .card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent, var(--primary)), var(--info));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card-modern:hover .card-glow {
  opacity: 1;
}

.card-modern-body {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.modern-icon-box {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-light), #e0f2fe);
  border-radius: 14px;
  font-size: 22px;
  color: var(--primary);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.category-card-modern:hover .modern-icon-box {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.3);
}

.modern-info {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.modern-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modern-count {
  font-size: 22px;
  font-weight: 800;
  color: var(--primary);
}

.modern-count small {
  font-size: 11px;
  color: var(--gray-500);
  font-weight: 500;
  margin-left: 4px;
}

.modern-arrow {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border-radius: 50%;
  color: var(--gray-400);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.category-card-modern:hover .modern-arrow {
  background: var(--primary);
  color: white;
  transform: translateX(4px);
}

/* ===========================================
   仪表盘占位符 - Dashboard Placeholder
   =========================================== */
.dashboard-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: linear-gradient(145deg, var(--gray-50), var(--gray-100));
  border-radius: 16px;
  border: 2px dashed var(--gray-300);
}

.dashboard-placeholder-content {
  text-align: center;
  padding: 40px;
}

.dashboard-placeholder-icon {
  font-size: 64px;
  color: var(--gray-300);
  margin-bottom: 16px;
}

.dashboard-placeholder-text {
  font-size: 16px;
  color: var(--gray-500);
  font-weight: 500;
}

/* ===========================================
   响应式设计 - Responsive Design
   =========================================== */
@media (max-width: 1400px) {
  .specimen-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
  
  .list-head-row,
  .list-card-row {
    grid-template-columns: 110px 1.5fr 1fr 1fr 90px;
  }
  
  .list-head-row .col-head:nth-child(5),
  .list-card-row .col-body:nth-child(5) {
    display: none;
  }
}

@media (max-width: 1200px) {
  .gallery-layout {
    grid-template-columns: 260px 1fr;
  }
  
  .filter-panel {
    padding: 16px;
  }
  
  .chart-dashboard-card {
    grid-template-columns: 1fr;
  }
  
  .chart-visual-box {
    border-right: none;
    border-bottom: 1px solid var(--gray-100);
  }
  
  .chart-ring-container {
    min-height: 220px;
  }
  
  .list-scroll-area {
    max-height: 250px;
  }
  
  .list-head-row,
  .list-card-row {
    grid-template-columns: 110px 1.5fr 1fr 90px;
  }
  
  .list-head-row .col-head:nth-child(4),
  .list-card-row .col-body:nth-child(4) {
    display: none;
  }
}

@media (max-width: 992px) {
  .gallery-layout {
    grid-template-columns: 1fr;
  }
  
  .filter-panel {
    display: none;
  }
  
  .specimen-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  .list-head-row,
  .list-card-row {
    grid-template-columns: 110px 1fr 90px;
  }
  
  .list-head-row .col-head:nth-child(3),
  .list-card-row .col-body:nth-child(3) {
    display: none;
  }
}

@media (max-width: 768px) {
  .glass-header {
    flex-wrap: wrap;
    padding: 16px;
    gap: 12px;
  }
  
  .search-box-modern {
    order: 3;
    width: 100%;
    max-width: none;
  }
  
  .specimen-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .specimen-card {
    border-radius: 12px;
  }
  
  .list-head-row {
    display: none;
  }
  
  .list-card-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 20px;
  }
  
  .list-card-row .col-body {
    width: 100%;
  }
}

/* ===========================================
   动画效果 - Animations
   =========================================== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 卡片入场动画 */
.specimen-card {
  animation: fadeInUp 0.4s ease backwards;
}

.specimen-card:nth-child(1) { animation-delay: 0.05s; }
.specimen-card:nth-child(2) { animation-delay: 0.1s; }
.specimen-card:nth-child(3) { animation-delay: 0.15s; }
.specimen-card:nth-child(4) { animation-delay: 0.2s; }
.specimen-card:nth-child(5) { animation-delay: 0.25s; }
.specimen-card:nth-child(6) { animation-delay: 0.3s; }
.specimen-card:nth-child(7) { animation-delay: 0.35s; }
.specimen-card:nth-child(8) { animation-delay: 0.4s; }

.list-card-row {
  animation: slideInRight 0.3s ease backwards;
}

.list-card-row:nth-child(1) { animation-delay: 0.05s; }
.list-card-row:nth-child(2) { animation-delay: 0.1s; }
.list-card-row:nth-child(3) { animation-delay: 0.15s; }
.list-card-row:nth-child(4) { animation-delay: 0.2s; }
.list-card-row:nth-child(5) { animation-delay: 0.25s; }

/* ===========================================
   打印样式 - Print Styles
   =========================================== */
@media print {
  .top-nav,
  .filter-panel,
  .glass-header {
    display: none !important;
  }
  
  .specimen-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .specimen-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid var(--gray-300);
  }
}
</style>