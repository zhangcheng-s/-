<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">海洋宏生物数据中心</h1>
        <p class="hero-subtitle">免费开放的全球海洋宏生物多样性数据探索平台</p>
        
        <div class="search-container">
          <input 
            type="text" 
            class="hero-search-input" 
            placeholder="搜索物种、数据集、航次、发生记录..."
          >
          <button class="hero-search-btn">搜索</button>
        </div>

        <div class="hero-actions">
          <a href="javascript:;" class="action-link">发生记录</a>
          <a href="javascript:;" class="action-link">物种</a>
          <a href="javascript:;" class="action-link">数据集</a>
          <a href="javascript:;" class="action-link">出版机构</a>
        </div>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-number">{{ displayValues.voyage.toLocaleString() }}</span>
        <span class="stat-label">航次</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ displayValues.species.toLocaleString() }}</span>
        <span class="stat-label">物种数据</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ displayValues.chemistry.toLocaleString() }}</span>
        <span class="stat-label">化学数据</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ displayValues.samples.toLocaleString() }}</span>
        <span class="stat-label">样本集</span>
      </div>
    </div>

    <div class="content-section">
      <div class="section-header">
        <h2>数据分布可视化</h2>
        <p>通过交互式地图探索全球海洋生物的时空分布</p>
      </div>
      
      <div class="map-wrapper">
        <div class="map-overlay-control">
          <MapLayerControl 
            @change="handleLayerChange" 
          />
        </div>

        <TianDiMap 
          :show-voyage="layerState.voyage"
          :show-bio="layerState.bio"
          :show-chem="layerState.chem"
          :show-controls="false"
        />
      </div>
    </div>

    <div class="media-section">
      <div class="section-header">
        <h2>多媒体影像</h2>
        <p>探索深海探测一线的精彩视频与珍贵影像</p>
      </div>
      
      <div class="media-subsection">
        <div class="subsection-header">
          <h3>精选图片</h3>
          <a href="javascript:;" class="more-link">查看更多 ></a>
        </div>
        <div class="media-grid">
          <div class="media-card" v-for="(img, index) in imageList" :key="'img'+index">
            <div class="media-wrapper pointer" @click="openPreview(img.url)">
              <img :src="img.url" :alt="img.title" class="media-content image-zoom">
              <div class="hover-overlay">
                <span class="zoom-text">点击查看</span>
              </div>
            </div>
            <div class="media-info">
              <h4>{{ img.title }}</h4>
            </div>
          </div>
        </div>
      </div>

      <div class="media-subsection">
        <div class="subsection-header">
          <h3>精彩视频</h3>
          <a href="javascript:;" class="more-link">查看更多 ></a>
        </div>
        <div class="media-grid">
          <div class="media-card video-card" v-for="(vid, index) in videoList" :key="'vid'+index">
            <div class="media-wrapper">
              <video controls class="media-content" v-if="vid.url">
                <source :src="vid.url" type="video/mp4">
                您的浏览器不支持 Video 标签。
              </video>
              <div class="video-placeholder" v-else>
                <div class="play-icon">▶</div>
                <span>视频待上传</span>
              </div>
            </div>
            <div class="media-info">
              <h4>{{ vid.title }}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-card">
        <h3>关于我们</h3>
        <p>致力于构建全面、开放的海洋宏生物数据库，支持科学研究与生态保护。</p>
        <router-link to="/about" class="info-btn">了解更多</router-link>
      </div>
      <div class="info-card">
        <h3>新闻动态</h3>
        <p>查看最新的数据发布、系统更新及相关学术会议通知。</p>
        <a 
          href="https://www.nmdis.org.cn/" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="news-btn"
        >
          查看新闻
        </a>
      </div>
      <div class="info-card">
        <h3>数据共享</h3>
        <p>加入我们的网络，发布您的生物多样性数据。</p>
        <button class="info-btn">发布数据</button>
      </div>
    </div>

    <footer class="home-footer">
      <p>© 2024 海洋宏生物数据中心 | 琼ICP备123456号</p>
    </footer>

    <div v-if="showViewer" class="image-viewer" @click="closePreview">
      <div class="viewer-content">
        <img :src="previewImageUrl" alt="Preview" @click.stop>
      </div>
      <button class="close-btn" @click="closePreview">×</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import TianDiMap from '@/components/TiandiMap/TianDiMap.vue'
import MapLayerControl from './components/MapLayerControl.vue' // 先导引入

// 图层状态
const layerState = reactive({
  voyage: true,
  bio: true,
  chem: true
})

// 恢复处理函数
const handleLayerChange = (newState) => {
  Object.assign(layerState, newState)
}

//图片路径简化
const getImgUrl = (name) => {
  return new URL(`../../assets/images/${name}`, import.meta.url).href
}

const showViewer = ref(false)
const previewImageUrl = ref('')

const openPreview = (url) => {
  previewImageUrl.value = url
  showViewer.value = true
  document.body.style.overflow = 'hidden'
}

const closePreview = () => {
  showViewer.value = false
  document.body.style.overflow = ''
}

// 统计数字逻辑
const displayValues = reactive({
  voyage: 0,
  species: 0,
  chemistry: 0,
  samples: 0
})

let targetValues = {
  voyage: 1500, 
  species: 1200, 
  chemistry: 580, 
  samples: 35
}

const imageList = ref([
  { title: '海洋珊瑚生态系统', url: getImgUrl('coral system.jpg') },
  { title: '发光水母', url: getImgUrl('bioluminescent jellyfish.jpg') },
  { title: '海豚', url: getImgUrl('dolphin.jpg') },
  { title: '海洋科考作业', url: getImgUrl('research vessel.webp') },
  { title: '狮子鱼', url: getImgUrl('lionfish.jpg') },
  { title: '小丑鱼', url: getImgUrl('clownfish.jpg') },
  { title: '雀尾螳螂虾', url: getImgUrl('peacock mantis shrimp.jfif') },
  { title: '生物样本采集', url: getImgUrl('biological sample collection.jpeg') }
])

const videoList = ref([
  { title: '2024深海科考纪录片', url: '' },
  { title: '“蛟龙号”下潜实录', url: '' },
  { title: '发现新物种现场', url: '' },
  { title: '海底热液喷口观测', url: '' }
])

const fetchDashboardData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      targetValues = {
        voyage: 1500, 
        species: 32129054, 
        chemistry: 158200, 
        samples: 5600
      }
      resolve()
    }, 100)
  })
}

const runAnimation = () => {
  const duration = 1000 
  const startTime = performance.now()
  const startValues = { voyage: 0, species: 0, chemistry: 0, samples: 0 }

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1) 
    const easeProgress = 1 - Math.pow(1 - progress, 3)

    for (const key in targetValues) {
      const start = startValues[key]
      const end = targetValues[key]
      displayValues[key] = Math.floor(start + (end - start) * easeProgress)
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      for (const key in targetValues) {
        displayValues[key] = targetValues[key]
      }
    }
  }
  requestAnimationFrame(animate)
}

onMounted(async () => {
  await fetchDashboardData()
  runAnimation()
})
</script>

<style scoped>
.home {
  height: 100%;
  overflow-y: auto;
  background-color: #f5f7fa;
}

/* Hero Section */
.hero-section {
  background-image: url('@/assets/images/home_bg2.jpg');
  background-size: cover;
  background-position: center;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  position: relative;
}
.hero-content { max-width: 800px; width: 100%; padding: 0 20px; }
.hero-title { font-size: 3.5rem; margin-bottom: 10px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.hero-subtitle { font-size: 1.2rem; margin-bottom: 40px; opacity: 0.9; }

/* Search Box */
.search-container { display: flex; background: white; border-radius: 4px; padding: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); margin-bottom: 20px; }
.hero-search-input { flex: 1; border: none; padding: 15px 20px; font-size: 16px; outline: none; }
.hero-search-btn { background-color: #0085ca; color: white; border: none; padding: 0 30px; font-size: 16px; border-radius: 3px; cursor: pointer; font-weight: bold; transition: background 0.3s; }
.hero-search-btn:hover { background-color: #006fb3; }
.hero-actions { margin-top: 20px; }
.action-link { color: white; margin: 0 15px; text-decoration: none; font-weight: 500; border-bottom: 1px solid transparent; transition: border 0.3s; }
.action-link:hover { border-bottom-color: white; }

/* Stats Bar */
.stats-bar { background-color: #333; color: white; display: flex; justify-content: space-around; padding: 20px 0; flex-wrap: wrap; }
.stat-item { text-align: center; padding: 10px; min-width: 120px; }
.stat-number { display: block; font-size: 32px; font-weight: 700; color: #5cc9f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-variant-numeric: tabular-nums; line-height: 1.2; }
.stat-label { font-size: 14px; color: #ccc; margin-top: 5px; }

/* Content Section */
.content-section { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
.section-header { text-align: center; margin-bottom: 30px; }
.section-header h2 { font-size: 28px; color: #333; margin-bottom: 10px; font-weight: 600; }
.section-header p { color: #666; font-size: 16px; }

.map-wrapper { 
  position: relative; 
  height: 600px; 
  background: white; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
  border-radius: 4px; 
  overflow: hidden; 
}

/* 恢复：图层控制器的悬浮定位 */
.map-overlay-control {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

/* --- Media Section --- */
.media-section {
  background-color: white;
  padding: 60px 0;
  margin-bottom: 40px;
}

.media-subsection {
  max-width: 1200px;
  margin: 0 auto 50px auto;
  padding: 0 20px;
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-left: 4px solid #0085ca;
  padding-left: 15px;
}

.subsection-header h3 {
  font-size: 20px;
  color: #333;
  font-weight: 600;
  margin: 0;
}

.more-link {
  font-size: 14px;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}
.more-link:hover { color: #0085ca; }

.media-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.media-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.media-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.media-wrapper {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: #f0f2f5;
}

.media-content {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-zoom {
  transition: transform 0.5s ease;
}
.media-card:hover .image-zoom {
  transform: scale(1.08);
}

.pointer {
  cursor: pointer;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.media-wrapper:hover .hover-overlay {
  opacity: 1;
}

.zoom-text {
  color: white;
  border: 1px solid white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  background: rgba(0,0,0,0.2);
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef;
  color: #adb5bd;
}

.play-icon {
  font-size: 32px;
  margin-bottom: 5px;
  opacity: 0.6;
}

.media-info {
  padding: 15px;
}

.media-info h4 {
  margin: 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 900px) {
  .media-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 500px) {
  .media-grid {
    grid-template-columns: 1fr;
  }
}

/* Info Section */
.info-section { max-width: 1200px; margin: 0 auto 60px; display: flex; justify-content: space-between; gap: 20px; padding: 0 20px; flex-wrap: wrap; }
.info-card { flex: 1; min-width: 300px; background: white; padding: 30px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center; transition: transform 0.3s; }
.info-card:hover { transform: translateY(-5px); }
.info-card h3 { margin-bottom: 15px; color: #333; }
.info-card p { color: #666; margin-bottom: 20px; line-height: 1.6; }
.info-btn, .news-btn { display: inline-block; border: 1px solid #0085ca; color: #0085ca; background: transparent; padding: 8px 20px; border-radius: 20px; cursor: pointer; transition: all 0.3s; text-decoration: none; font-size: 14px; }
.info-btn:hover, .news-btn:hover { background: #0085ca; color: white; }

/* Footer */
.home-footer { background-color: #2c3e50; color: #999; text-align: center; padding: 20px; font-size: 14px; }

/* Image Viewer */
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

.viewer-content {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.viewer-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  animation: zoomIn 0.3s ease;
}

.close-btn {
  position: absolute;
  top: 30px;
  right: 30px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: rotate(90deg);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>