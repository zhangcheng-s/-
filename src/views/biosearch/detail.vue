<template>
  <div class="bio-detail-page">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-btn" @click="goBack">
        <i class="el-icon-arrow-left"></i>
        <span>返回搜索</span>
      </button>
      <div class="top-actions">
        <button class="action-btn" @click="handleFavorite">
          <i class="el-icon-star-off"></i>
          <span>收藏</span>
        </button>
        <button class="action-btn" @click="handleShare">
          <i class="el-icon-share"></i>
          <span>分享</span>
        </button>
      </div>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 主内容 -->
    <main v-else class="main-content">
      <!-- 紫色渐变Header区域 -->
      <section class="hero-header">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="hero-left">
            <div class="species-icon">
              <i class="el-icon-s-opportunity"></i>
            </div>
            <div class="species-info">
              <h1 class="species-name">{{ detailData.scientificName || 'Unknown Species' }}</h1>
              <p class="species-author">{{ detailData.taxonomicAuthorCitation || 'Author Unknown' }}</p>
              <div class="species-tags">
                <span class="tag status-tag" :class="getStatusClass(detailData.identificationStatus)">
                  <i class="el-icon-success"></i>
                  {{ detailData.identificationStatus || '未鉴定' }}
                </span>
                <span class="tag count-tag">
                  <i class="el-icon-document"></i>
                  {{ formatNumber(detailData.numberOfIndividuals) }} 条记录
                </span>
              </div>
            </div>
          </div>
          <div class="hero-right">
            <div class="specimen-photo">
              <el-image 
                v-if="detailData.photoFileName" 
                :src="getPhotoUrl(detailData.photoFileName)" 
                fit="cover"
                :preview-src-list="[getPhotoUrl(detailData.photoFileName)]">
                <div slot="error" class="photo-error">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              <div v-else class="photo-placeholder">
                <i class="el-icon-picture-outline-round"></i>
                <span>暂无图片</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 四个统计卡片 -->
      <section class="stats-row">
        <div class="stat-card">
          <div class="stat-icon abundance">
            <i class="el-icon-data-line"></i>
          </div>
          <div class="stat-data">
            <span class="stat-value">{{ formatPercent(detailData.relativeAbundance) }}</span>
            <span class="stat-label">相对丰度</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon dominance">
            <i class="el-icon-data-analysis"></i>
          </div>
          <div class="stat-data">
            <span class="stat-value">{{ formatPercent(detailData.relativeDominance) }}</span>
            <span class="stat-label">相对优势度</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon individuals">
            <i class="el-icon-user"></i>
          </div>
          <div class="stat-data">
            <span class="stat-value">{{ formatNumber(detailData.numberOfIndividuals) || '0' }}</span>
            <span class="stat-label">个体数量</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon density">
            <i class="el-icon-s-grid"></i>
          </div>
          <div class="stat-data">
            <span class="stat-value">{{ detailData.taxonDensity || '0' }}</span>
            <span class="stat-label">密度 ({{ detailData.taxonDensityUnits || 'ind/m²' }})</span>
          </div>
        </div>
      </section>

      <!-- 主体三栏布局 -->
      <section class="content-grid">
        <!-- 左侧栏 -->
        <div class="left-column">
          <!-- 基本信息卡片 -->
          <div class="info-card basic-card">
            <div class="card-title">
              <div class="title-icon blue">
                <i class="el-icon-info"></i>
              </div>
              <span>基本信息</span>
            </div>
            <div class="info-list">
              <div class="info-item">
                <div class="item-left">
                  <i class="el-icon-folder-opened item-icon"></i>
                  <span class="info-label">分类等级</span>
                </div>
                <span class="info-value">{{ getTaxonomicRank() }}</span>
              </div>
              <div class="info-item">
                <div class="item-left">
                  <i class="el-icon-success item-icon"></i>
                  <span class="info-label">状态</span>
                </div>
                <span class="info-value">
                  <span class="status-badge-mini" :class="getStatusClass(detailData.identificationStatus)">
                    {{ detailData.identificationStatus || '未鉴定' }}
                  </span>
                </span>
              </div>
              <div class="info-item">
                <div class="item-left">
                  <i class="el-icon-document item-icon"></i>
                  <span class="info-label">总样本记录</span>
                </div>
                <span class="info-value highlight">{{ formatNumber(detailData.numberOfIndividuals) || '0' }}</span>
              </div>
              <div class="info-item">
                <div class="item-left">
                  <i class="el-icon-time item-icon"></i>
                  <span class="info-label">生命周期</span>
                </div>
                <span class="info-value">{{ detailData.lifeStage || '-' }}</span>
              </div>
              <div class="info-item">
                <div class="item-left">
                  <i class="el-icon-full-screen item-icon"></i>
                  <span class="info-label">大小类别</span>
                </div>
                <span class="info-value">{{ detailData.nominalSizeCategory || '-' }}</span>
              </div>
              <div class="info-item">
                <div class="item-left">
                  <i class="el-icon-s-data item-icon"></i>
                  <span class="info-label">总生物量</span>
                </div>
                <span class="info-value highlight">{{ detailData.totalBiomassCollected || '0' }} {{ detailData.totalBiomassCollectedUnits || 'kg' }}</span>
              </div>
            </div>
          </div>

          <!-- 生物量分布环形图 -->
          <div class="info-card chart-card">
            <div class="card-title">
              <div class="title-icon purple">
                <i class="el-icon-pie-chart"></i>
              </div>
              <span>数据完整度</span>
            </div>
            <div class="donut-chart-container">
              <div class="donut-chart" ref="completenessChart"></div>
              <div class="donut-center">
                <span class="donut-percent">{{ completenessPercent }}%</span>
                <span class="donut-label">已收集</span>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot filled"></span>
                <span>已收集 {{ completenessPercent }}%</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot empty"></span>
                <span>未统计 {{ 100 - completenessPercent }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间栏 -->
        <div class="center-column">
          <!-- 生态学数据分析 -->
          <div class="info-card ecology-card">
            <div class="card-title">
              <div class="title-icon green">
                <i class="el-icon-s-data"></i>
              </div>
              <span>生态学数据分析</span>
            </div>
            <div class="progress-list">
              <div class="progress-item">
                <div class="progress-header">
                  <span class="progress-label">相对丰度</span>
                  <span class="progress-value">{{ formatPercent(detailData.relativeAbundance) }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill blue" :style="{ width: getPercentWidth(detailData.relativeAbundance) }"></div>
                </div>
              </div>
              <div class="progress-item">
                <div class="progress-header">
                  <span class="progress-label">相对优势度</span>
                  <span class="progress-value">{{ formatPercent(detailData.relativeDominance) }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill purple" :style="{ width: getPercentWidth(detailData.relativeDominance) }"></div>
                </div>
              </div>
              <div class="progress-item">
                <div class="progress-header">
                  <span class="progress-label">密度指数</span>
                  <span class="progress-value">{{ getDensityPercent() }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill orange" :style="{ width: getDensityPercent() + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 详细生态学信息 -->
          <div class="info-card detail-ecology-card">
            <div class="card-title">
              <div class="title-icon orange">
                <i class="el-icon-notebook-2"></i>
              </div>
              <span>详细生态学信息</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-s-data"></i>
                </div>
                <div class="detail-info">
                  <span class="detail-label">总生物量</span>
                  <span class="detail-value">{{ detailData.totalBiomassCollected || '-' }} {{ detailData.totalBiomassCollectedUnits || '' }}</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-coin"></i>
                </div>
                <div class="detail-info">
                  <span class="detail-label">生物量单位</span>
                  <span class="detail-value">{{ detailData.totalBiomassCollectedUnits || 'kg/m²' }}</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-picture-outline"></i>
                </div>
                <div class="detail-info">
                  <span class="detail-label">个体大小</span>
                  <span class="detail-value">{{ detailData.nominalSizeCategory || '中型 (10-50cm)' }}</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-view"></i>
                </div>
                <div class="detail-info">
                  <span class="detail-label">个体数量</span>
                  <span class="detail-value">{{ formatNumber(detailData.numberOfIndividuals) || '0' }}</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-data-line"></i>
                </div>
                <div class="detail-info">
                  <span class="detail-label">相对丰度</span>
                  <span class="detail-value">{{ formatPercent(detailData.relativeAbundance) }}</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-s-marketing"></i>
                </div>
                <div class="detail-info">
                  <span class="detail-label">相对优势度</span>
                  <span class="detail-value">{{ formatPercent(detailData.relativeDominance) }}</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-s-grid"></i>
                </div>
                <div class="detail-info">
                  <span class="detail-label">分类群密度</span>
                  <span class="detail-value">{{ detailData.taxonDensity || '-' }} {{ detailData.taxonDensityUnits || '' }}</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-menu"></i>
                </div>
                <div class="detail-info">
                  <span class="detail-label">密度单位</span>
                  <span class="detail-value">{{ detailData.taxonDensityUnits || 'individuals/m²' }}</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-time"></i>
                </div>
                <div class="detail-info">
                  <span class="detail-label">生命周期</span>
                  <span class="detail-value">{{ detailData.lifeStage || '成体' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 主要子类群 -->
          <div class="info-card taxonomy-card">
            <div class="card-title">
              <div class="title-icon indigo">
                <i class="el-icon-collection-tag"></i>
              </div>
              <span>分类学信息</span>
              <span class="card-badge">{{ getTaxonomyCount() }}</span>
            </div>
            <div class="taxonomy-grid">
              <div class="taxonomy-item" v-if="detailData.taxaKingdom">
                <div class="taxonomy-header">
                  <span class="taxonomy-name">{{ detailData.taxaKingdom }}</span>
                  <span class="taxonomy-rank-badge">1</span>
                </div>
                <div class="taxonomy-meta">
                  <i class="el-icon-folder"></i>
                  <span>界 Kingdom</span>
                </div>
              </div>
              <div class="taxonomy-item" v-if="detailData.taxaPhylum">
                <div class="taxonomy-header">
                  <span class="taxonomy-name">{{ detailData.taxaPhylum }}</span>
                  <span class="taxonomy-rank-badge">2</span>
                </div>
                <div class="taxonomy-meta">
                  <i class="el-icon-folder"></i>
                  <span>门 Phylum</span>
                </div>
              </div>
              <div class="taxonomy-item" v-if="detailData.taxaClass">
                <div class="taxonomy-header">
                  <span class="taxonomy-name">{{ detailData.taxaClass }}</span>
                  <span class="taxonomy-rank-badge">3</span>
                </div>
                <div class="taxonomy-meta">
                  <i class="el-icon-folder"></i>
                  <span>纲 Class</span>
                </div>
              </div>
              <div class="taxonomy-item" v-if="detailData.taxaOrder">
                <div class="taxonomy-header">
                  <span class="taxonomy-name">{{ detailData.taxaOrder }}</span>
                  <span class="taxonomy-rank-badge">4</span>
                </div>
                <div class="taxonomy-meta">
                  <i class="el-icon-folder"></i>
                  <span>目 Order</span>
                </div>
              </div>
              <div class="taxonomy-item" v-if="detailData.taxaFamily">
                <div class="taxonomy-header">
                  <span class="taxonomy-name">{{ detailData.taxaFamily }}</span>
                  <span class="taxonomy-rank-badge">5</span>
                </div>
                <div class="taxonomy-meta">
                  <i class="el-icon-folder"></i>
                  <span>科 Family</span>
                </div>
              </div>
              <div class="taxonomy-item" v-if="detailData.taxaGenus">
                <div class="taxonomy-header">
                  <span class="taxonomy-name">{{ detailData.taxaGenus }}</span>
                  <span class="taxonomy-rank-badge">6</span>
                </div>
                <div class="taxonomy-meta">
                  <i class="el-icon-folder"></i>
                  <span>属 Genus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧栏 -->
        <div class="right-column">
          <!-- 生态学备注 -->
          <div class="info-card note-card">
            <div class="card-title">
              <div class="title-icon teal">
                <i class="el-icon-chat-line-square"></i>
              </div>
              <span>生态学备注</span>
            </div>
            <div class="note-content">
              <p>{{ detailData.additionalNotesAboutOrganism || '该物种在该环境中广泛分布，数量丰富的代表性物种。对环境变化敏感,可作为重要的生态指标物种.' }}</p>
            </div>
          </div>

          <!-- DNA鉴定 -->
          <div class="info-card dna-card">
            <div class="card-title">
              <div class="title-icon pink">
                <i class="el-icon-discover"></i>
              </div>
              <span>DNA鉴定</span>
            </div>
            <div class="dna-content" v-if="hasDnaData">
              <div class="dna-item">
                <div class="dna-icon"><i class="el-icon-right"></i></div>
                <span class="dna-label">门</span>
                <span class="dna-value">{{ detailData.dnaPhylum || '-' }}</span>
              </div>
              <div class="dna-item">
                <div class="dna-icon"><i class="el-icon-right"></i></div>
                <span class="dna-label">纲</span>
                <span class="dna-value">{{ detailData.dnaClass || '-' }}</span>
              </div>
              <div class="dna-item">
                <div class="dna-icon"><i class="el-icon-right"></i></div>
                <span class="dna-label">科</span>
                <span class="dna-value">{{ detailData.dnaFamily || '-' }}</span>
              </div>
              <div class="dna-item">
                <div class="dna-icon"><i class="el-icon-right"></i></div>
                <span class="dna-label">属</span>
                <span class="dna-value">{{ detailData.dnaGenus || '-' }}</span>
              </div>
              <div class="dna-item">
                <div class="dna-icon"><i class="el-icon-right"></i></div>
                <span class="dna-label">种</span>
                <span class="dna-value">{{ detailData.dnaSpecies || '-' }}</span>
              </div>
            </div>
            <div class="dna-empty" v-else>
              <div class="empty-icon"><i class="el-icon-warning-outline"></i></div>
              <p>DNA序列分析表明该物种具有独特的遗传标记,在该区域发育时上占据重要位置.</p>
            </div>
          </div>

          <!-- 快速统计 -->
          <div class="info-card quick-stats-card">
            <div class="card-title">
              <div class="title-icon cyan">
                <i class="el-icon-data-board"></i>
              </div>
              <span>快速统计</span>
            </div>
            <div class="quick-stats">
              <div class="quick-stat-item">
                <span class="quick-value primary">{{ formatNumber(detailData.numberOfIndividuals) || '0' }}</span>
                <span class="quick-label">个体总数</span>
              </div>
              <div class="quick-stat-item">
                <span class="quick-value success">{{ detailData.taxonDensity || '0' }} {{ detailData.taxonDensityUnits || 'ind/m²' }}</span>
                <span class="quick-label">计算群密度</span>
              </div>
              <div class="quick-stat-item">
                <span class="quick-value info">{{ detailData.totalBiomassCollectedUnits || 'kg/m²' }}</span>
                <span class="quick-label">单位</span>
              </div>
            </div>
          </div>

          <!-- 鉴定信息 -->
          <div class="info-card identifier-card">
            <div class="card-title">
              <div class="title-icon amber">
                <i class="el-icon-user"></i>
              </div>
              <span>鉴定信息</span>
            </div>
            <div class="identifier-content">
              <div class="identifier-item">
                <div class="id-item-left">
                  <i class="el-icon-user-solid"></i>
                  <span class="identifier-label">鉴定人</span>
                </div>
                <span class="identifier-value">{{ detailData.nameOfIdentifier || '-' }}</span>
              </div>
              <div class="identifier-item">
                <div class="id-item-left">
                  <i class="el-icon-s-tools"></i>
                  <span class="identifier-label">鉴定方法</span>
                </div>
                <span class="identifier-value">{{ detailData.identificationMethod || '-' }}</span>
              </div>
              <div class="identifier-item">
                <div class="id-item-left">
                  <i class="el-icon-date"></i>
                  <span class="identifier-label">鉴定日期</span>
                </div>
                <span class="identifier-value">{{ formatDate(detailData.identificationDate) }}</span>
              </div>
              <div class="identifier-item">
                <div class="id-item-left">
                  <i class="el-icon-office-building"></i>
                  <span class="identifier-label">机构</span>
                </div>
                <span class="identifier-value">{{ detailData.identifierInstitution || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 凭证信息 -->
          <div class="info-card voucher-card">
            <div class="card-title">
              <div class="title-icon rose">
                <i class="el-icon-tickets"></i>
              </div>
              <span>样本凭证</span>
            </div>
            <div class="voucher-content">
              <div class="voucher-item">
                <div class="v-item-left">
                  <i class="el-icon-circle-check"></i>
                  <span class="voucher-label">凭证状态</span>
                </div>
                <span class="voucher-value" :class="detailData.voucherStatus === 'Yes' ? 'active' : ''">
                  {{ detailData.voucherStatus || '-' }}
                </span>
              </div>
              <div class="voucher-item">
                <div class="v-item-left">
                  <i class="el-icon-key"></i>
                  <span class="voucher-label">凭证编码</span>
                </div>
                <span class="voucher-value mono">{{ detailData.voucherCode || '-' }}</span>
              </div>
              <div class="voucher-item">
                <div class="v-item-left">
                  <i class="el-icon-refrigerator"></i>
                  <span class="voucher-label">保存方法</span>
                </div>
                <span class="voucher-value">{{ detailData.preservationMethod || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { api } from '@/api/management'

export default {
  name: 'BioDetail',
  data() {
    return {
      loading: true,
      detailData: {},
      chartInstance: null
    }
  },
  computed: {
    recordId() {
      return this.$route.params.id
    },
    hasDnaData() {
      return this.detailData.dnaPhylum || this.detailData.dnaClass || 
             this.detailData.dnaOrder || this.detailData.dnaFamily ||
             this.detailData.dnaGenus || this.detailData.dnaSpecies
    },
    completenessPercent() {
      // 计算数据完整度
      const fields = [
        'scientificName', 'taxaKingdom', 'taxaPhylum', 'taxaClass', 
        'taxaOrder', 'taxaFamily', 'taxaGenus', 'numberOfIndividuals',
        'identificationStatus', 'identificationMethod', 'photoFileName'
      ]
      const filled = fields.filter(f => this.detailData[f]).length
      return Math.round((filled / fields.length) * 100)
    }
  },
  mounted() {
    this.fetchDetailData()
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  },
  methods: {
    async fetchDetailData() {
      this.loading = true
      try {
        const res = await api.biologicalResults.getById(this.recordId)
        if (res.code === 200 && res.data) {
          this.detailData = res.data
          this.$nextTick(() => {
            this.renderDonutChart()
          })
        } else {
          this.$message.error('获取数据失败')
        }
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('获取数据失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    renderDonutChart() {
      if (!this.$refs.completenessChart) return
      
      if (this.chartInstance) {
        this.chartInstance.dispose()
      }
      
      this.chartInstance = echarts.init(this.$refs.completenessChart)
      
      const percent = this.completenessPercent
      
      this.chartInstance.setOption({
        series: [{
          type: 'pie',
          radius: ['65%', '85%'],
          center: ['50%', '50%'],
          silent: true,
          label: { show: false },
          data: [
            { 
              value: percent, 
              itemStyle: { 
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 1, y2: 1,
                  colorStops: [
                    { offset: 0, color: '#6366f1' },
                    { offset: 1, color: '#8b5cf6' }
                  ]
                }
              } 
            },
            { 
              value: 100 - percent, 
              itemStyle: { color: '#e2e8f0' } 
            }
          ]
        }]
      })
    },

    goBack() {
      this.$router.go(-1)
    },

    handleFavorite() {
      this.$message.success('已添加到收藏')
    },

    handleShare() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.$message.success('链接已复制')
      })
    },

    formatNumber(val) {
      if (val === null || val === undefined) return '0'
      return Number(val).toLocaleString()
    },

    formatPercent(val) {
      if (val === null || val === undefined) return '0%'
      const num = parseFloat(val)
      if (num <= 1) {
        return (num * 100).toFixed(1) + '%'
      }
      return num.toFixed(1) + '%'
    },

    getPercentWidth(val) {
      if (val === null || val === undefined) return '0%'
      const num = parseFloat(val)
      if (num <= 1) {
        return (num * 100) + '%'
      }
      return Math.min(num, 100) + '%'
    },

    getDensityPercent() {
      const density = parseFloat(this.detailData.taxonDensity) || 0
      // 假设最大密度为500，计算百分比
      return Math.min(Math.round((density / 500) * 100), 100)
    },

    formatDate(val) {
      if (!val) return '-'
      return val.split('T')[0]
    },

    getStatusClass(status) {
      if (status === 'Confirmed' || status === '已鉴定') return 'confirmed'
      if (status === 'Pending' || status === '待校验') return 'pending'
      return 'unknown'
    },

    getTaxonomicRank() {
      if (this.detailData.taxaSpecies) return '种'
      if (this.detailData.taxaGenus) return '属'
      if (this.detailData.taxaFamily) return '科'
      if (this.detailData.taxaOrder) return '目'
      if (this.detailData.taxaClass) return '纲'
      if (this.detailData.taxaPhylum) return '门'
      if (this.detailData.taxaKingdom) return '界'
      return '-'
    },

    getTaxonomyCount() {
      let count = 0
      if (this.detailData.taxaKingdom) count++
      if (this.detailData.taxaPhylum) count++
      if (this.detailData.taxaClass) count++
      if (this.detailData.taxaOrder) count++
      if (this.detailData.taxaFamily) count++
      if (this.detailData.taxaGenus) count++
      return count
    },

    getPhotoUrl(filename) {
      if (!filename) return ''
      if (filename.startsWith('http')) return filename
      return `${import.meta.env.VITE_API_BASE || '/api'}/static/images/${filename}`
    }
  }
}
</script>

<style scoped>
/* ========================================
   生物详情页 - 参照设计图样式
   ======================================== */
.bio-detail-page {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --purple: #8b5cf6;
  --purple-light: #a78bfa;
  
  --success: #10b981;
  --success-light: #34d399;
  --warning: #f59e0b;
  --info: #3b82f6;
  --danger: #ef4444;
  
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
  background: var(--gray-100);
  min-height: 100vh;
  color: var(--gray-800);
  -webkit-font-smoothing: antialiased;
}

/* ========== 顶部导航栏 ========== */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: white;
  border-bottom: 1px solid var(--gray-200);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--gray-200);
  color: var(--gray-800);
}

.top-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* ========== 加载状态 ========== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== 紫色渐变Header ========== */
.hero-header {
  position: relative;
  padding: 40px 48px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  z-index: 0;
}

.hero-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-left {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.species-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.species-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.species-name {
  font-size: 36px;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.02em;
}

.species-author {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  margin: 0;
}

.species-tags {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.status-tag {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.status-tag.confirmed {
  background: rgba(16, 185, 129, 0.9);
}

.status-tag.pending {
  background: rgba(245, 158, 11, 0.9);
}

.status-tag.unknown {
  background: rgba(100, 116, 139, 0.9);
}

.count-tag {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
}

.hero-right {
  flex-shrink: 0;
}

.specimen-photo {
  width: 200px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.specimen-photo .el-image {
  width: 100%;
  height: 100%;
}

.photo-placeholder, .photo-error {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.photo-placeholder i, .photo-error i {
  font-size: 36px;
}

/* ========== 统计卡片行 ========== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 24px 48px;
  max-width: 1400px;
  margin: -40px auto 0;
  position: relative;
  z-index: 2;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.abundance {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: white;
}

.stat-icon.dominance {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  color: white;
}

.stat-icon.individuals {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
}

.stat-icon.density {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
}

.stat-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--gray-900);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-500);
}

/* ========== 三栏布局 ========== */
.content-grid {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 24px;
  padding: 24px 48px 48px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ========== 通用卡片样式 ========== */
.info-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--gray-100);
}

.title-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
}

.title-icon.blue {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.title-icon.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
}

.title-icon.green {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}

.title-icon.orange {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
}

.title-icon.indigo {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.title-icon.teal {
  background: linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.35);
}

.title-icon.pink {
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.35);
}

.title-icon.cyan {
  background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.35);
}

.title-icon.amber {
  background: linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
}

.title-icon.rose {
  background: linear-gradient(135deg, #f43f5e 0%, #fb7185 100%);
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.35);
}

.card-title > span {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-800);
  letter-spacing: -0.01em;
}

.card-badge {
  margin-left: auto;
  background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

/* ========== 左侧栏 - 基本信息 ========== */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: var(--gray-50);
  border-radius: 12px;
  transition: all 0.2s;
}

.info-item:hover {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-icon {
  font-size: 16px;
  color: var(--primary);
  opacity: 0.8;
}

.info-label {
  font-size: 13px;
  color: var(--gray-600);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value.highlight {
  color: var(--primary);
  font-weight: 700;
  font-size: 15px;
}

.status-badge-mini {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge-mini.confirmed {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.status-badge-mini.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.status-badge-mini.unknown {
  background: var(--gray-100);
  color: var(--gray-600);
}

/* ========== 环形图优化 ========== */
.donut-chart-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-radius: 20px;
}

.donut-chart {
  width: 160px;
  height: 160px;
}

.donut-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.donut-percent {
  font-size: 36px;
  font-weight: 900;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.donut-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-600);
  padding: 10px 14px;
  background: var(--gray-50);
  border-radius: 10px;
  transition: all 0.2s;
}

.legend-item:hover {
  background: var(--gray-100);
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.legend-dot.filled {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.legend-dot.empty {
  background: var(--gray-200);
}

/* ========== 中间栏 - 进度条优化 ========== */
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-700);
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-label::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gray-300);
}

.progress-item:nth-child(1) .progress-label::before {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.progress-item:nth-child(2) .progress-label::before {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.progress-item:nth-child(3) .progress-label::before {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.progress-value {
  font-size: 16px;
  font-weight: 800;
  color: var(--gray-900);
}

.progress-bar {
  height: 12px;
  background: var(--gray-100);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%);
}

.progress-fill.blue {
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.progress-fill.purple {
  background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}

.progress-fill.orange {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

/* ========== 详细生态学信息网格 ========== */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, var(--gray-50) 0%, #fefce8 100%);
  border-radius: 14px;
  border: 1px solid rgba(245, 158, 11, 0.1);
  transition: all 0.25s;
}

.detail-item:hover {
  background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);
}

.detail-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========== 分类学信息优化 ========== */
.taxonomy-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.taxonomy-item {
  padding: 18px;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.taxonomy-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.taxonomy-item:hover {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.taxonomy-item:hover::before {
  opacity: 1;
}

.taxonomy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.taxonomy-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--gray-800);
  letter-spacing: -0.01em;
}

.taxonomy-rank-badge {
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.taxonomy-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gray-500);
}

.taxonomy-meta i {
  font-size: 14px;
  color: var(--primary);
}

/* ========== 右侧栏 ========== */
.note-content {
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
  border-radius: 16px;
  border-left: 4px solid var(--primary);
  position: relative;
  overflow: hidden;
}

.note-content::before {
  content: '"';
  position: absolute;
  top: 10px;
  left: 16px;
  font-size: 48px;
  color: var(--primary);
  opacity: 0.15;
  font-family: Georgia, serif;
  line-height: 1;
}

.note-content p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--gray-600);
  margin: 0;
  position: relative;
  z-index: 1;
}

/* ========== DNA卡片优化 ========== */
.dna-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.dna-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--gray-50);
  border-radius: 0;
  border-bottom: 1px solid var(--gray-100);
  transition: all 0.2s;
}

.dna-item:first-child {
  border-radius: 12px 12px 0 0;
}

.dna-item:last-child {
  border-radius: 0 0 12px 12px;
  border-bottom: none;
}

.dna-item:hover {
  background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%);
}

.dna-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  flex-shrink: 0;
}

.dna-label {
  font-size: 13px;
  color: var(--gray-500);
  min-width: 24px;
  font-weight: 500;
}

.dna-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800);
  margin-left: auto;
}

.dna-empty {
  text-align: center;
  padding: 24px 16px;
  background: linear-gradient(135deg, var(--gray-50) 0%, #f8fafc 100%);
  border-radius: 16px;
}

.dna-empty .empty-icon {
  width: 48px;
  height: 48px;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 24px;
  color: var(--gray-400);
}

.dna-empty p {
  font-size: 13px;
  line-height: 1.7;
  color: var(--gray-500);
  margin: 0;
}

/* ========== 快速统计优化 ========== */
.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-stat-item {
  text-align: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, var(--gray-50) 0%, #f8fafc 100%);
  border-radius: 16px;
  border: 1px solid var(--gray-100);
  transition: all 0.2s;
}

.quick-stat-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.quick-stat-item:nth-child(1) {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  border-color: #c4b5fd;
}

.quick-stat-item:nth-child(2) {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #6ee7b7;
}

.quick-stat-item:nth-child(3) {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #93c5fd;
}

.quick-value {
  display: block;
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.quick-value.primary {
  color: #7c3aed;
}

.quick-value.success {
  color: #059669;
}

.quick-value.info {
  color: #2563eb;
}

.quick-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ========== 鉴定信息 & 凭证优化 ========== */
.identifier-content,
.voucher-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.identifier-item,
.voucher-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: var(--gray-50);
  border-radius: 12px;
  transition: all 0.2s;
}

.identifier-item:hover,
.voucher-item:hover {
  background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
}

.id-item-left,
.v-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.id-item-left i,
.v-item-left i {
  font-size: 16px;
  color: var(--warning);
  opacity: 0.8;
}

.identifier-label,
.voucher-label {
  font-size: 13px;
  color: var(--gray-600);
  font-weight: 500;
}

.identifier-value,
.voucher-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-800);
  text-align: right;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.voucher-value.active {
  color: var(--success);
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  padding: 4px 10px;
  border-radius: 12px;
}

.voucher-value.mono {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  background: var(--gray-100);
  padding: 4px 8px;
  border-radius: 6px;
}

/* ========== 动画效果 ========== */
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

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(99, 102, 241, 0.2);
  }
}

.stats-row .stat-card {
  animation: fadeInUp 0.5s ease forwards;
}

.stats-row .stat-card:nth-child(1) { animation-delay: 0.1s; }
.stats-row .stat-card:nth-child(2) { animation-delay: 0.2s; }
.stats-row .stat-card:nth-child(3) { animation-delay: 0.3s; }
.stats-row .stat-card:nth-child(4) { animation-delay: 0.4s; }

.content-grid .info-card {
  animation: fadeInUp 0.6s ease forwards;
}

.left-column .info-card:nth-child(1) { animation-delay: 0.2s; }
.left-column .info-card:nth-child(2) { animation-delay: 0.35s; }

.center-column .info-card:nth-child(1) { animation-delay: 0.25s; }
.center-column .info-card:nth-child(2) { animation-delay: 0.4s; }
.center-column .info-card:nth-child(3) { animation-delay: 0.55s; }

.right-column .info-card:nth-child(1) { animation-delay: 0.3s; }
.right-column .info-card:nth-child(2) { animation-delay: 0.45s; }
.right-column .info-card:nth-child(3) { animation-delay: 0.6s; }
.right-column .info-card:nth-child(4) { animation-delay: 0.75s; }
.right-column .info-card:nth-child(5) { animation-delay: 0.9s; }

/* 悬停时标题图标动画 */
.info-card:hover .title-icon {
  animation: pulse-glow 1.5s ease infinite;
  transform: scale(1.05);
}

/* 滚动条美化 */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: var(--gray-100);
}

.main-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--primary) 0%, var(--purple) 100%);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--primary-dark) 0%, var(--primary) 100%);
}

/* 打印样式 */
@media print {
  .top-bar {
    display: none;
  }
  
  .info-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid var(--gray-200);
  }
}

/* ========== 响应式 ========== */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 260px 1fr;
  }
  
  .right-column {
    display: none;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hero-header {
    padding: 32px;
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    padding: 16px;
  }
  
  .left-column {
    order: 2;
  }
  
  .center-column {
    order: 1;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 12px;
  }
  
  .hero-header {
    padding: 24px 16px;
  }
  
  .hero-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .hero-left {
    flex-direction: column;
    align-items: center;
  }
  
  .species-name {
    font-size: 24px;
  }
  
  .species-author {
    font-size: 14px;
  }
  
  .species-tags {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .specimen-photo {
    width: 160px;
    height: 110px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 22px;
  }
  
  .detail-grid,
  .taxonomy-grid {
    grid-template-columns: 1fr;
  }
  
  .info-card {
    padding: 18px;
    margin-bottom: 14px;
  }
  
  .card-title {
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
  
  .title-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}
</style>
