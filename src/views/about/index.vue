<template>
  <div class="about-container">
    <!-- 背景动画 -->
    <div class="background-effects">
      <div class="bubble" v-for="n in 20" :key="'b'+n" :style="getBubbleStyle(n)"></div>
      <div class="light-beam" v-for="n in 5" :key="'l'+n" :style="getLightStyle(n)"></div>
      <div class="particle" v-for="n in 30" :key="'p'+n" :style="getParticleStyle(n)"></div>
      <div class="wave-layer"></div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 头部标题 -->
      <header class="header-section">
        <div class="title-wrapper">
          <div class="title-glow"></div>
          <div class="title-decoration">
            <span class="deco-line left"></span>
            <span class="deco-icon">🌊</span>
            <span class="deco-line right"></span>
          </div>
          <div class="title-row">
            <span class="whale-icon left">🐋</span>
            <div class="title-center">
              <h1>关于我们</h1>
              <div class="title-underline"></div>
            </div>
            <span class="whale-icon right">🐋</span>
          </div>
          <p class="subtitle">
            <span class="wave-text">🐠 探索海洋奥秘</span>
            <span class="divider">✦</span>
            <span class="wave-text">守护蔚蓝家园 🐬</span>
          </p>
          <p class="description">
            我们致力于海洋生物多样性研究与保护，通过先进的数据可视化技术，让更多人了解并热爱海洋
          </p>
        </div>
      </header>

      <!-- 平台介绍区域 -->
      <section class="intro-section">
        <div class="intro-card main-intro">
          <div class="intro-glow"></div>
          <div class="intro-icon">🌏</div>
          <div class="intro-content">
            <h3>海洋数据可视化平台</h3>
            <p>
              OceanData 是一个专注于海洋生物数据收集、分析与可视化展示的综合性平台。
              我们汇集了来自全球各大洋的海洋生物数据，运用前沿的数据科学技术和精美的可视化设计，
              为科研人员、教育工作者和海洋爱好者提供一站式的海洋知识服务。
            </p>
          </div>
        </div>
        <div class="intro-features">
          <div class="feature-item" v-for="(feature, index) in platformFeatures" :key="index">
            <div class="feature-icon">{{ feature.icon }}</div>
            <div class="feature-text">
              <h4>{{ feature.title }}</h4>
              <p>{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 核心内容网格 -->
      <div class="content-grid">
        <!-- 左侧：使命与愿景 -->
        <section class="panel mission-panel">
          <div class="panel-glow"></div>
          <div class="panel-decoration"></div>
          <div class="panel-header">
            <span class="header-icon">🌊</span>
            <h2>我们的使命</h2>
            <div class="header-line"></div>
          </div>
          <div class="mission-list">
            <div class="mission-item" v-for="(mission, index) in missions" :key="index">
              <div class="item-glow"></div>
              <div class="icon-wrapper">
                <div class="icon-bg"></div>
                <span class="icon">{{ mission.icon }}</span>
              </div>
              <div class="text">
                <h4>{{ mission.title }}</h4>
                <p>{{ mission.desc }}</p>
              </div>
              <div class="item-arrow">→</div>
            </div>
          </div>
        </section>

        <!-- 中间：数据统计 -->
        <section class="panel stats-panel">
          <div class="panel-glow"></div>
          <div class="panel-decoration"></div>
          <div class="panel-header">
            <span class="header-icon">📊</span>
            <h2>平台数据</h2>
            <div class="header-line"></div>
          </div>
          <div class="stats-grid">
            <div class="stat-item" v-for="(stat, index) in stats" :key="index">
              <div class="stat-bg"></div>
              <div class="stat-ring"></div>
              <div class="stat-icon">{{ stat.icon }}</div>
              <div class="stat-number">{{ stat.number }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-bar">
                <div class="bar-fill" :style="{ width: stat.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- 右侧：团队介绍 -->
        <section class="panel team-panel">
          <div class="panel-glow"></div>
          <div class="panel-decoration"></div>
          <div class="panel-header">
            <span class="header-icon">🐙</span>
            <h2>我们的团队</h2>
            <div class="header-line"></div>
          </div>
          <div class="team-list">
            <div class="team-item" v-for="(member, index) in teamMembers" :key="index">
              <div class="avatar-wrapper">
                <div class="avatar-ring"></div>
                <span class="avatar">{{ member.avatar }}</span>
              </div>
              <div class="info">
                <h4>{{ member.title }}</h4>
                <p>{{ member.desc }}</p>
              </div>
              <div class="member-badge">{{ member.badge }}</div>
            </div>
          </div>
        </section>
      </div>

      <!-- 发展历程 -->
      <section class="timeline-section">
        <div class="section-header">
          <span class="section-icon">⏳</span>
          <h2>发展历程</h2>
          <div class="section-line"></div>
        </div>
        <div class="timeline">
          <div class="timeline-item" v-for="(item, index) in timeline" :key="index" :class="{ 'right': index % 2 === 1 }">
            <div class="timeline-dot">
              <span>{{ item.icon }}</span>
            </div>
            <div class="timeline-content">
              <div class="timeline-year">{{ item.year }}</div>
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 技术栈展示 -->
      <section class="tech-section">
        <div class="section-header">
          <span class="section-icon">🔧</span>
          <h2>技术支持</h2>
          <div class="section-line"></div>
        </div>
        <div class="tech-grid">
          <div class="tech-item" v-for="(tech, index) in techStack" :key="index">
            <div class="tech-icon">{{ tech.icon }}</div>
            <div class="tech-name">{{ tech.name }}</div>
            <div class="tech-desc">{{ tech.desc }}</div>
          </div>
        </div>
      </section>

      <!-- 合作伙伴 -->
      <section class="partners-section">
        <div class="section-header">
          <span class="section-icon">🤝</span>
          <h2>合作伙伴</h2>
          <div class="section-line"></div>
        </div>
        <div class="partners-grid">
          <div class="partner-item" v-for="(partner, index) in partners" :key="index">
            <div class="partner-logo">{{ partner.logo }}</div>
            <div class="partner-name">{{ partner.name }}</div>
          </div>
        </div>
      </section>

      <!-- 愿景展望 -->
      <section class="vision-section">
        <div class="vision-card">
          <div class="vision-glow"></div>
          <div class="vision-icon">🔮</div>
          <h3>未来愿景</h3>
          <p class="vision-text">
            我们希望通过科技的力量，让每个人都能感受到海洋的魅力。到2030年，我们计划覆盖全球95%以上的海洋生物物种数据，
            建立起全球最完整的海洋生物数据库，并与更多科研机构、环保组织合作，共同推动海洋保护事业的发展。
          </p>
          <div class="vision-goals">
            <div class="goal-item" v-for="(goal, index) in visionGoals" :key="index">
              <span class="goal-icon">{{ goal.icon }}</span>
              <span class="goal-text">{{ goal.text }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部：联系信息 -->
      <footer class="footer-section">
        <div class="footer-content">
          <!-- 联系卡片区域 -->
          <div class="contact-cards">
            <div class="contact-card email-card">
              <div class="card-glow"></div>
              <div class="card-pulse"></div>
              <div class="card-icon">📧</div>
              <div class="card-info">
                <span class="card-label">邮箱联系</span>
                <span class="card-value">contact@oceandata.com</span>
              </div>
              <div class="card-arrow">→</div>
            </div>
            <div class="contact-card location-card">
              <div class="card-glow"></div>
              <div class="card-icon">📍</div>
              <div class="card-info">
                <span class="card-label">办公地址</span>
                <span class="card-value">中国·杭州电子科技大学</span>
              </div>
            </div>
            <div class="contact-card website-card">
              <div class="card-glow"></div>
              <div class="card-icon">🌐</div>
              <div class="card-info">
                <span class="card-label">官方网站</span>
                <span class="card-value">www.oceandata.com</span>
              </div>
              <div class="card-arrow">→</div>
            </div>
          </div>

          <!-- 社交图标 -->
          <div class="social-row">
            <span class="social-label">关注我们</span>
            <div class="social-icons">
              <div class="social-icon" v-for="(item, index) in socialItems" :key="index" :title="item.name">
                <span>{{ item.icon }}</span>
              </div>
            </div>
          </div>

          <!-- 版权信息 -->
          <div class="copyright">
            <p>© 2024 OceanData 海洋数据可视化平台 | 保护海洋，从了解开始</p>
          </div>
        </div>

        <!-- 海底装饰 -->
        <div class="sea-floor">
          <div class="seaweed" v-for="n in 6" :key="'sw'+n" :style="getSeaweedStyle(n)"></div>
          <span class="creature" v-for="n in 10" :key="n" :style="getCreatureStyle(n)">
            {{ seaCreatures[(n - 1) % seaCreatures.length] }}
          </span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      missions: [
        { icon: '🐠', title: '探索发现', desc: '深入研究全球海洋生物多样性，记录珍稀物种数据' },
        { icon: '🦈', title: '科普教育', desc: '运用数据可视化技术，向公众传播海洋科学知识' },
        { icon: '🐢', title: '生态保护', desc: '推动海洋生态保护行动，共同守护蓝色家园' }
      ],
      teamMembers: [
        { avatar: '🧑‍🔬', title: '海洋研究员', desc: '专注深海生态系统研究', badge: '核心' },
        { avatar: '👩‍💻', title: '数据科学家', desc: 'AI驱动的数据分析专家', badge: '技术' },
        { avatar: '🧑‍🎨', title: '视觉设计师', desc: '打造沉浸式可视化体验', badge: '创意' },
        { avatar: '🤿', title: '潜水摄影师', desc: '捕捉海底精彩瞬间', badge: '实践' }
      ],
      stats: [
        { icon: '🐋', number: '10,000+', label: '收录物种', percent: 85 },
        { icon: '📄', number: '500+', label: '研究报告', percent: 70 },
        { icon: '🤝', number: '50+', label: '合作机构', percent: 60 },
        { icon: '👥', number: '1M+', label: '用户访问', percent: 95 }
      ],
      platformFeatures: [
        { icon: '🔬', title: '科学严谨', desc: '数据来源权威可靠，经过专业团队审核验证' },
        { icon: '🎨', title: '精美可视化', desc: '运用先进的可视化技术，让数据更直观易懂' },
        { icon: '🔄', title: '实时更新', desc: '数据库持续更新，紧跟最新科研发现' },
        { icon: '🌍', title: '全球覆盖', desc: '涵盖太平洋、大西洋、印度洋等全球主要海域' }
      ],
      timeline: [
        { year: '2020', icon: '🌱', title: '项目启动', desc: '团队成立，开始海洋数据收集工作' },
        { year: '2021', icon: '📊', title: '平台上线', desc: '第一版可视化平台正式发布' },
        { year: '2022', icon: '🤝', title: '生态合作', desc: '与10+海洋研究机构建立合作关系' },
        { year: '2023', icon: '🚀', title: '规模扩展', desc: '用户突破100万，数据库扩展至10000+物种' },
        { year: '2024', icon: '🏆', title: '荣誉认证', desc: '获得国家海洋科普优秀平台认证' }
      ],
      techStack: [
        { icon: '⚡', name: 'Vue.js', desc: '前端框架' },
        { icon: '📈', name: 'ECharts', desc: '数据可视化' },
        { icon: '🎯', name: 'Three.js', desc: '3D渲染' },
        { icon: '🗄️', name: 'MySQL', desc: '数据存储' },
        { icon: '🔥', name: 'Node.js', desc: '后端服务' },
        { icon: '☁️', name: '阿里云', desc: '云服务支持' }
      ],
      partners: [
        { logo: '🏛️', name: '杭州电子科技大学' },
        { logo: '🔬', name: '国家海洋局' },
        { logo: '🐋', name: '世界自然基金会' },
        { logo: '🌊', name: '蓝丝带海洋保护协会' },
        { logo: '🏢', name: '大数据研究院' },
        { logo: '📚', name: '国家自然科学基金委' }
      ],
      visionGoals: [
        { icon: '🎯', text: '覆盖95%海洋物种' },
        { icon: '🌐', text: '服务全球用户' },
        { icon: '🤖', text: 'AI智能识别' },
        { icon: '📱', text: '多端无缝体验' }
      ],
      socialItems: [
        { icon: '🐦', name: '微博' },
        { icon: '💬', name: '微信' },
        { icon: '📘', name: 'Facebook' },
        { icon: '📸', name: 'Instagram' },
        { icon: '🎬', name: 'B站' }
      ],
      seaCreatures: ['🐟', '🐠', '🦑', '🦐', '🦀', '🐙', '🐬', '🪼', '🦞', '🐡']
    }
  },
  methods: {
    getBubbleStyle(n) {
      return {
        left: `${(n * 5) % 100}%`,
        width: `${(n % 4 + 1) * 6}px`,
        height: `${(n % 4 + 1) * 6}px`,
        animationDuration: `${6 + n % 8}s`,
        animationDelay: `${n * 0.4}s`
      }
    },
    getLightStyle(n) {
      return {
        left: `${10 + n * 18}%`,
        animationDelay: `${n * 1.5}s`,
        opacity: 0.3 + (n % 3) * 0.1
      }
    },
    getParticleStyle(n) {
      return {
        left: `${(n * 3.3) % 100}%`,
        top: `${(n * 5) % 100}%`,
        animationDuration: `${2 + n % 4}s`,
        animationDelay: `${n * 0.2}s`
      }
    },
    getCreatureStyle(n) {
      return {
        left: `${(n - 1) * 10 + 2}%`,
        animationDelay: `${n * 0.3}s`,
        animationDuration: `${1.5 + n % 2}s`,
        fontSize: `${0.8 + (n % 3) * 0.3}rem`
      }
    },
    getSeaweedStyle(n) {
      return {
        left: `${n * 16 + 5}%`,
        height: `${30 + (n % 3) * 15}px`,
        animationDelay: `${n * 0.5}s`
      }
    }
  }
}
</script>

<style lang="less" scoped>
.about-container {
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(6, 182, 212, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(8, 145, 178, 0.1) 0%, transparent 60%),
    linear-gradient(180deg, #020617 0%, #0c1929 20%, #0a3d62 60%, #0e7490 100%);
  color: #fff;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}

// ========== 背景效果 ==========
.background-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  .bubble {
    position: absolute;
    bottom: -50px;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(103, 232, 249, 0.15), transparent);
    border-radius: 50%;
    animation: rise linear infinite;
  }

  .light-beam {
    position: absolute;
    top: -100px;
    width: 150px;
    height: 120%;
    background: linear-gradient(180deg, rgba(103, 232, 249, 0.08) 0%, transparent 50%);
    transform: rotate(15deg);
    animation: shimmer 8s ease-in-out infinite;
  }

  .particle {
    position: absolute;
    width: 3px;
    height: 3px;
    background: rgba(167, 243, 252, 0.6);
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(103, 232, 249, 0.4);
    animation: twinkle ease-in-out infinite;
  }

  .wave-layer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.05) 100%);
    animation: wave-move 10s ease-in-out infinite;
  }
}

@keyframes rise {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.8; }
  50% { transform: translateY(-50vh) translateX(20px); }
  90% { opacity: 0.5; }
  100% { transform: translateY(-110vh) translateX(-10px); opacity: 0; }
}

@keyframes shimmer {
  0%, 100% { opacity: 0.2; transform: rotate(15deg) translateY(0); }
  50% { opacity: 0.4; transform: rotate(15deg) translateY(-20px); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

@keyframes wave-move {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

// ========== 主内容 ==========
.main-content {
  display: flex;
  flex-direction: column;
  padding: 2rem 4rem;
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

// ========== 头部 ==========
.header-section {
  text-align: center;
  padding: 1.5rem 0 2rem;

  .title-wrapper {
    position: relative;
    display: inline-block;
    max-width: 800px;

    .title-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 120px;
      background: radial-gradient(ellipse, rgba(103, 232, 249, 0.25) 0%, transparent 70%);
      filter: blur(30px);
      animation: glow-breathe 4s ease-in-out infinite;
    }

    .title-decoration {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 0.8rem;

      .deco-line {
        width: 80px;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.5), transparent);
        
        &.left { background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.5)); }
        &.right { background: linear-gradient(90deg, rgba(103, 232, 249, 0.5), transparent); }
      }

      .deco-icon {
        font-size: 1.5rem;
        animation: float 3s ease-in-out infinite;
      }
    }
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;

    .whale-icon {
      font-size: 3rem;
      filter: drop-shadow(0 0 15px rgba(103, 232, 249, 0.6));
      &.left { animation: whale-swim 3s ease-in-out infinite; }
      &.right { animation: whale-swim 3s ease-in-out infinite reverse; transform: scaleX(-1); }
    }

    .title-center {
      position: relative;
      
      h1 {
        font-size: 3.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, #fff 0%, #67e8f9 40%, #a5f3fc 70%, #fff 100%);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
        letter-spacing: 0.15em;
        text-shadow: 0 0 40px rgba(103, 232, 249, 0.3);
        animation: gradient-shift 5s ease-in-out infinite;
      }

      .title-underline {
        width: 60%;
        height: 3px;
        margin: 0.5rem auto 0;
        background: linear-gradient(90deg, transparent, #67e8f9, transparent);
        border-radius: 2px;
      }
    }
  }

  .subtitle {
    margin-top: 1rem;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.2rem;
    opacity: 0.9;

    .wave-text {
      color: #a5f3fc;
      font-weight: 500;
    }

    .divider {
      color: #67e8f9;
      font-size: 1.5rem;
      animation: rotate 6s linear infinite;
    }
  }

  .description {
    margin-top: 1rem;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.7);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.8;
  }
}

@keyframes glow-breathe {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes whale-swim {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// ========== 平台介绍区域 ==========
.intro-section {
  margin: 2rem 0;

  .intro-card.main-intro {
    position: relative;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(103, 232, 249, 0.2);
    border-radius: 24px;
    padding: 2.5rem;
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    overflow: hidden;
    margin-bottom: 2rem;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.6), rgba(20, 184, 166, 0.4), transparent);
    }

    .intro-glow {
      position: absolute;
      top: -100px;
      right: -100px;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(103, 232, 249, 0.1) 0%, transparent 70%);
      pointer-events: none;
    }

    .intro-icon {
      font-size: 4rem;
      flex-shrink: 0;
      filter: drop-shadow(0 0 20px rgba(103, 232, 249, 0.5));
      animation: float 4s ease-in-out infinite;
    }

    .intro-content {
      flex: 1;

      h3 {
        font-size: 1.8rem;
        font-weight: 700;
        color: #67e8f9;
        margin-bottom: 1rem;
        letter-spacing: 0.05em;
      }

      p {
        font-size: 1.1rem;
        line-height: 2;
        color: rgba(255, 255, 255, 0.8);
        text-align: justify;
      }
    }
  }

  .intro-features {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;

    .feature-item {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(103, 232, 249, 0.12);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        border-color: rgba(103, 232, 249, 0.3);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), 0 0 20px rgba(103, 232, 249, 0.1);
      }

      .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 0.8rem;
        filter: drop-shadow(0 0 8px rgba(103, 232, 249, 0.4));
      }

      .feature-text {
        h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #a5f3fc;
          margin-bottom: 0.5rem;
        }

        p {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.5;
        }
      }
    }
  }
}

// ========== 内容网格 ==========
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  padding: 1rem 0 2rem;
}

// ========== 面板通用样式 ==========
.panel {
  position: relative;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(103, 232, 249, 0.15);
  border-radius: 24px;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.4s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.5), transparent);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.2), transparent);
  }

  .panel-decoration {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(103, 232, 249, 0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  &:hover {
    border-color: rgba(103, 232, 249, 0.35);
    transform: translateY(-5px);
    box-shadow: 
      0 15px 40px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(103, 232, 249, 0.1),
      inset 0 0 30px rgba(103, 232, 249, 0.03);
    .panel-glow { opacity: 1; }
  }

  .panel-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(103, 232, 249, 0.06) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.4s;
    pointer-events: none;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
    flex-shrink: 0;

    .header-icon {
      font-size: 2rem;
      filter: drop-shadow(0 0 10px rgba(103, 232, 249, 0.5));
      animation: float 3s ease-in-out infinite;
    }

    h2 {
      font-size: 1.4rem;
      font-weight: 700;
      color: #a5f3fc;
      margin: 0;
      letter-spacing: 0.05em;
    }

    .header-line {
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, rgba(103, 232, 249, 0.4), transparent);
      border-radius: 1px;
    }
  }
}

// ========== 使命面板 ==========
.mission-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .mission-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.2rem 1rem;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    border: 1px solid rgba(103, 232, 249, 0.08);
    border-radius: 16px;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      background: linear-gradient(135deg, rgba(103, 232, 249, 0.12) 0%, rgba(103, 232, 249, 0.04) 100%);
      border-color: rgba(103, 232, 249, 0.25);
      transform: translateX(8px);
      
      .item-arrow {
        opacity: 1;
        transform: translateX(0);
      }
      
      .icon-wrapper .icon-bg {
        transform: scale(1.1);
      }
    }

    .icon-wrapper {
      width: 55px;
      height: 55px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .icon-bg {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(103, 232, 249, 0.15), rgba(103, 232, 249, 0.05));
        border-radius: 50%;
        transition: transform 0.3s;
      }

      .icon { 
        font-size: 2rem;
        position: relative;
        z-index: 1;
        filter: drop-shadow(0 0 5px rgba(103, 232, 249, 0.3));
      }
    }

    .text {
      flex: 1;
      h4 {
        font-size: 1.15rem;
        font-weight: 600;
        color: #67e8f9;
        margin-bottom: 0.3rem;
      }
      p {
        font-size: 0.95rem;
        opacity: 0.75;
        margin: 0;
        line-height: 1.5;
      }
    }

    .item-arrow {
      font-size: 1.2rem;
      color: #67e8f9;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s;
    }
  }
}

// ========== 数据统计面板 ==========
.stats-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  .stat-item {
    position: relative;
    background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
    border: 1px solid rgba(103, 232, 249, 0.1);
    border-radius: 20px;
    padding: 1.5rem 1rem;
    text-align: center;
    transition: all 0.3s;
    overflow: hidden;

    &:hover {
      border-color: rgba(103, 232, 249, 0.3);
      background: linear-gradient(145deg, rgba(103, 232, 249, 0.1) 0%, rgba(103, 232, 249, 0.03) 100%);
      transform: scale(1.03);
      
      .stat-bg { opacity: 1; }
      .stat-ring { transform: scale(1.1); opacity: 1; }
    }

    .stat-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(103, 232, 249, 0.12), transparent 70%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .stat-ring {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      border: 2px solid rgba(103, 232, 249, 0.2);
      border-radius: 50%;
      opacity: 0.5;
      transition: all 0.3s;
    }

    .stat-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 0 8px rgba(103, 232, 249, 0.4));
      margin-bottom: 0.5rem;
    }

    .stat-number {
      font-size: 1.8rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, #67e8f9 50%, #a5f3fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0.3rem 0;
    }

    .stat-label {
      font-size: 0.95rem;
      opacity: 0.8;
      margin-bottom: 0.8rem;
    }

    .stat-bar {
      width: 80%;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      margin: 0 auto;
      overflow: hidden;

      .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #0891b2, #67e8f9);
        border-radius: 2px;
        transition: width 1s ease-out;
      }
    }
  }
}

// ========== 团队面板 ==========
.team-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;

  .team-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.2rem;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    border: 1px solid rgba(103, 232, 249, 0.08);
    border-radius: 16px;
    transition: all 0.3s;

    &:hover {
      background: linear-gradient(135deg, rgba(103, 232, 249, 0.12) 0%, rgba(103, 232, 249, 0.04) 100%);
      border-color: rgba(103, 232, 249, 0.25);
      transform: translateX(8px);
      
      .avatar-ring { transform: scale(1.1) rotate(180deg); }
    }

    .avatar-wrapper {
      width: 55px;
      height: 55px;
      flex-shrink: 0;
      position: relative;

      .avatar-ring {
        position: absolute;
        inset: -3px;
        border: 2px dashed rgba(103, 232, 249, 0.3);
        border-radius: 50%;
        transition: all 0.5s;
      }

      .avatar {
        width: 100%;
        height: 100%;
        font-size: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(103, 232, 249, 0.15), rgba(103, 232, 249, 0.05));
        border-radius: 50%;
      }
    }

    .info {
      flex: 1;
      h4 {
        font-size: 1.1rem;
        font-weight: 600;
        color: #67e8f9;
        margin-bottom: 0.2rem;
      }
      p {
        font-size: 0.9rem;
        opacity: 0.7;
        margin: 0;
      }
    }

    .member-badge {
      padding: 0.3rem 0.8rem;
      background: linear-gradient(135deg, rgba(103, 232, 249, 0.2), rgba(103, 232, 249, 0.1));
      border: 1px solid rgba(103, 232, 249, 0.3);
      border-radius: 20px;
      font-size: 0.75rem;
      color: #a5f3fc;
      font-weight: 500;
    }
  }
}

// ========== 通用区块标题 ==========
.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;

  .section-icon {
    font-size: 2rem;
    filter: drop-shadow(0 0 10px rgba(103, 232, 249, 0.5));
  }

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #a5f3fc;
    letter-spacing: 0.08em;
    margin: 0;
  }

  .section-line {
    flex: 1;
    max-width: 200px;
    height: 2px;
    background: linear-gradient(90deg, rgba(103, 232, 249, 0.5), transparent);
    border-radius: 1px;
  }
}

// ========== 发展历程 ==========
.timeline-section {
  padding: 2rem 0;

  .timeline {
    position: relative;
    max-width: 900px;
    margin: 0 auto;
    padding: 1rem 0;

    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, rgba(103, 232, 249, 0.4), rgba(103, 232, 249, 0.1));
      transform: translateX(-50%);
      border-radius: 2px;
    }

    .timeline-item {
      display: flex;
      align-items: center;
      margin-bottom: 2rem;
      position: relative;

      &:last-child { margin-bottom: 0; }

      .timeline-dot {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, rgba(103, 232, 249, 0.3), rgba(103, 232, 249, 0.1));
        border: 2px solid rgba(103, 232, 249, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        transition: all 0.3s;

        span {
          font-size: 1.5rem;
        }

        &:hover {
          transform: translateX(-50%) scale(1.15);
          box-shadow: 0 0 25px rgba(103, 232, 249, 0.4);
        }
      }

      .timeline-content {
        width: 42%;
        padding: 1.5rem;
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
        border: 1px solid rgba(103, 232, 249, 0.15);
        border-radius: 16px;
        transition: all 0.3s;

        &:hover {
          border-color: rgba(103, 232, 249, 0.3);
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .timeline-year {
          display: inline-block;
          padding: 0.3rem 1rem;
          background: linear-gradient(135deg, rgba(103, 232, 249, 0.25), rgba(103, 232, 249, 0.1));
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #67e8f9;
          margin-bottom: 0.8rem;
        }

        h4 {
          font-size: 1.2rem;
          color: #a5f3fc;
          margin-bottom: 0.5rem;
        }

        p {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0;
        }
      }

      // 左侧内容
      &:not(.right) .timeline-content {
        margin-right: auto;
        margin-left: 0;
        text-align: right;
      }

      // 右侧内容
      &.right .timeline-content {
        margin-left: auto;
        margin-right: 0;
        text-align: left;
      }
    }
  }
}

// ========== 技术栈 ==========
.tech-section {
  padding: 2rem 0;

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1.5rem;
    max-width: 1000px;
    margin: 0 auto;

    .tech-item {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(103, 232, 249, 0.12);
      border-radius: 16px;
      padding: 1.5rem 1rem;
      text-align: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px) scale(1.03);
        border-color: rgba(103, 232, 249, 0.35);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(103, 232, 249, 0.15);
      }

      .tech-icon {
        font-size: 2.5rem;
        margin-bottom: 0.8rem;
        filter: drop-shadow(0 0 8px rgba(103, 232, 249, 0.4));
      }

      .tech-name {
        font-size: 1rem;
        font-weight: 600;
        color: #67e8f9;
        margin-bottom: 0.3rem;
      }

      .tech-desc {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}

// ========== 合作伙伴 ==========
.partners-section {
  padding: 2rem 0;

  .partners-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1.5rem;
    max-width: 1000px;
    margin: 0 auto;

    .partner-item {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(103, 232, 249, 0.1);
      border-radius: 16px;
      padding: 1.5rem 1rem;
      text-align: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        border-color: rgba(103, 232, 249, 0.3);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);

        .partner-logo {
          transform: scale(1.15);
        }
      }

      .partner-logo {
        font-size: 2.5rem;
        margin-bottom: 0.8rem;
        transition: transform 0.3s;
        filter: drop-shadow(0 0 8px rgba(103, 232, 249, 0.3));
      }

      .partner-name {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.4;
      }
    }
  }
}

// ========== 愿景展望 ==========
.vision-section {
  padding: 2rem 0;

  .vision-card {
    position: relative;
    max-width: 900px;
    margin: 0 auto;
    background: linear-gradient(145deg, rgba(103, 232, 249, 0.12) 0%, rgba(103, 232, 249, 0.03) 100%);
    border: 1px solid rgba(103, 232, 249, 0.25);
    border-radius: 24px;
    padding: 3rem;
    text-align: center;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.6), rgba(20, 184, 166, 0.4), transparent);
    }

    .vision-glow {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(103, 232, 249, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }

    .vision-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 20px rgba(103, 232, 249, 0.5));
      animation: float 4s ease-in-out infinite;
    }

    h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #67e8f9;
      margin-bottom: 1.5rem;
      letter-spacing: 0.1em;
    }

    .vision-text {
      font-size: 1.1rem;
      line-height: 2;
      color: rgba(255, 255, 255, 0.8);
      max-width: 700px;
      margin: 0 auto 2rem;
    }

    .vision-goals {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;

      .goal-item {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.8rem 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(103, 232, 249, 0.2);
        border-radius: 30px;
        transition: all 0.3s;

        &:hover {
          background: rgba(103, 232, 249, 0.1);
          border-color: rgba(103, 232, 249, 0.4);
          transform: translateY(-2px);
        }

        .goal-icon {
          font-size: 1.3rem;
        }

        .goal-text {
          font-size: 0.95rem;
          color: #a5f3fc;
          font-weight: 500;
        }
      }
    }
  }
}

.footer-section {
  position: relative;
  padding: 3rem 0 1.5rem;
  margin-top: 2rem;

  .footer-content {
    position: relative;
    z-index: 1;
  }

  .contact-cards {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;

    .contact-card {
      position: relative;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.2rem 2rem;
      background: linear-gradient(135deg, rgba(103, 232, 249, 0.12) 0%, rgba(103, 232, 249, 0.04) 100%);
      border: 1px solid rgba(103, 232, 249, 0.25);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.4s ease;
      overflow: hidden;
      min-width: 280px;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.6), transparent);
      }

      .card-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(103, 232, 249, 0.15), transparent);
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover {
        transform: translateY(-5px);
        border-color: rgba(103, 232, 249, 0.5);
        box-shadow: 
          0 15px 35px rgba(0, 0, 0, 0.25),
          0 0 30px rgba(103, 232, 249, 0.2);
        
        .card-glow { opacity: 1; }
        .card-icon { transform: scale(1.2) rotate(10deg); }
        .card-arrow { transform: translateX(5px); opacity: 1; }
      }

      .card-icon {
        font-size: 2.2rem;
        filter: drop-shadow(0 0 10px rgba(103, 232, 249, 0.5));
        transition: transform 0.3s;
        z-index: 1;
      }

      .card-info {
        display: flex;
        flex-direction: column;
        z-index: 1;

        .card-label {
          font-size: 0.85rem;
          opacity: 0.7;
          margin-bottom: 0.2rem;
        }

        .card-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #a5f3fc;
          letter-spacing: 0.02em;
        }
      }

      .card-arrow {
        font-size: 1.3rem;
        color: #67e8f9;
        opacity: 0.5;
        transition: all 0.3s;
        z-index: 1;
      }

      &.email-card {
        background: linear-gradient(135deg, rgba(103, 232, 249, 0.2) 0%, rgba(20, 184, 166, 0.1) 100%);
        border-color: rgba(103, 232, 249, 0.4);
        
        .card-pulse {
          position: absolute;
          inset: -2px;
          border-radius: 22px;
          border: 2px solid rgba(103, 232, 249, 0.4);
          animation: pulse-ring 2s ease-out infinite;
        }

        .card-value {
          color: #67e8f9;
          text-shadow: 0 0 15px rgba(103, 232, 249, 0.4);
          font-size: 1.2rem;
        }
      }
    }
  }

  .social-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;

    .social-label {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .social-icons {
      display: flex;
      gap: 0.8rem;

      .social-icon {
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(103, 232, 249, 0.1);
        border: 1px solid rgba(103, 232, 249, 0.2);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;

        span {
          font-size: 1.4rem;
          transition: transform 0.3s;
        }

        &:hover {
          background: rgba(103, 232, 249, 0.2);
          border-color: rgba(103, 232, 249, 0.4);
          transform: translateY(-3px) scale(1.1);
          box-shadow: 0 8px 20px rgba(103, 232, 249, 0.25);
          
          span { transform: scale(1.1); }
        }
      }
    }
  }

  .copyright {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(103, 232, 249, 0.1);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    
    p { margin: 0; }
  }

  .sea-floor {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    pointer-events: none;

    .seaweed {
      position: absolute;
      bottom: 0;
      width: 8px;
      background: linear-gradient(180deg, rgba(34, 197, 94, 0.4), rgba(34, 197, 94, 0.1));
      border-radius: 4px 4px 0 0;
      transform-origin: bottom center;
      animation: sway 3s ease-in-out infinite;
    }

    .creature {
      position: absolute;
      bottom: 5px;
      animation: float-creature ease-in-out infinite;
      opacity: 0.5;
    }
  }
}

// ========== 响应式设计 =========
@media (max-width: 1400px) {
  .main-content { padding: 1.5rem 3rem; }
  .content-grid { gap: 1.5rem; }
}

@media (max-width: 1200px) {
  .main-content { padding: 1.5rem 2rem; }
  
  .header-section {
    .title-row {
      h1 { font-size: 2.8rem; }
      .whale-icon { font-size: 2.5rem; }
    }
  }
  
  .contact-cards {
    gap: 1.2rem !important;
    .contact-card { 
      padding: 1rem 1.5rem;
      min-width: 240px;
    }
  }
  
  .tech-grid,
  .partners-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .team-panel {
    grid-column: span 2;
    .team-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }

  .intro-features {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .contact-cards {
    flex-wrap: wrap;
    .contact-card { min-width: 220px; }
  }

  .timeline::before { left: 0; }
  
  .timeline-item {
    .timeline-content {
      width: 100% !important;
      text-align: left !important;
      margin: 0 !important;
      margin-left: 80px !important;
    }
  }
}

@media (max-width: 768px) {
  .main-content { padding: 1rem; }

  .header-section {
    .title-row {
      gap: 0.8rem;
      .whale-icon { font-size: 2rem; }
      h1 { font-size: 2rem; }
    }
    .subtitle { font-size: 1rem; }
    .description { font-size: 0.95rem; }
  }

  .intro-section {
    .intro-card.main-intro {
      flex-direction: column;
      text-align: center;
    }
    .intro-features {
      grid-template-columns: 1fr !important;
    }
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .team-panel {
    grid-column: span 1;
    .team-list {
      grid-template-columns: 1fr;
    }
  }

  .tech-grid,
  .partners-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .contact-cards {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem !important;
    
    .contact-card {
      width: 100%;
      max-width: 320px;
    }
  }

  .social-row {
    flex-direction: column;
    gap: 0.8rem !important;
  }

  .vision-card {
    padding: 2rem 1rem;
  }
}
</style>