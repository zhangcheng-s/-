<template>
  <div class="layer-control-card">
    <div class="control-header">数据图层</div>
    
    <div class="layer-list">
      <div 
        class="layer-item" 
        :class="{ active: layers.voyage }"
        @click="toggleLayer('voyage')"
      >
        <div class="indicator voyage-color"></div>
        <span class="label">航次信息</span>
        <div class="toggle-switch">
          <div class="knob"></div>
        </div>
      </div>
      <div 
        class="layer-item" 
        :class="{ active: layers.chem }"
        @click="toggleLayer('chem')"
      >
        <div class="indicator chem-color"></div>
        <span class="label">化学数据</span>
        <div class="toggle-switch">
          <div class="knob"></div>
        </div>
      </div>
      <div 
        class="layer-item" 
        :class="{ active: layers.bio }"
        @click="toggleLayer('bio')"
      >
        <div class="indicator bio-color"></div>
        <span class="label">生物样本</span>
        <div class="toggle-switch">
          <div class="knob"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapLayerControl',
  data() {
    return {
      layers: {
        voyage: true,
        chem: true,
        bio: true,
      }
    };
  },
  methods: {
    toggleLayer(type) {
      this.layers[type] = !this.layers[type];
      this.$emit('change', { ...this.layers });
    }
  }
};
</script>

<style scoped>
/* 卡片主体样式 */
.layer-control-card {
  /* --- 核心修复 --- */
  /* 1. 移除 backdrop-filter，因为它会错误地模糊底下的白色背景导致变成实心白块 */
  /* backdrop-filter: blur(10px); */
  /* -webkit-backdrop-filter: blur(10px); */
  
  /* 2. 调整背景为 90% 不透明度的白色。
     既能看清文字，又能隐约透出地图的色块，代替毛玻璃效果 */
  background: rgba(255, 255, 255, 0.5);
  
  /* 3. 加强阴影，增加悬浮感，弥补没有毛玻璃的层次感缺失 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  /* --- 修复结束 --- */

  border-radius: 12px;
  padding: 16px;
  width: 160px;
  border: 1px solid rgba(255, 255, 255, 0.8); /* 稍微加深边框 */
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.control-header {
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 列表项布局 */
.layer-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 6px; /*稍微增加点击区域*/
  border-radius: 6px;
}

.layer-item:hover {
  background-color: rgba(0, 0, 0, 0.03); /* 增加鼠标悬停反馈 */
}

.layer-item:last-child {
  margin-bottom: 0;
}

/* 颜色指示点 */
.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 10px;
  box-shadow: 0 0 4px currentColor;
  flex-shrink: 0;
}

/* 各类别的颜色定义 - 修正颜色匹配 */
.voyage-color { background-color: #1890ff; color: #1890ff; } /* 保持蓝色 */
.chem-color   { background-color: #20b2aa; color: #20b2aa; } /* 修改为青色 (匹配化学页) */
.bio-color    { background-color: #388e3c; color: #388e3c; } /* 修改为森林绿 (匹配生物页) */

.label {
  font-size: 14px;
  color: #333;
  flex-grow: 1;
  font-weight: 500;
}

/* 开关样式设计 */
.toggle-switch {
  width: 32px;
  height: 18px;
  background-color: #e0e0e0;
  border-radius: 20px;
  position: relative;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.knob {
  width: 14px;
  height: 14px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* 激活状态样式 */
.layer-item.active .toggle-switch {
  background-color: #1890ff; 
}

.layer-item.active .knob {
  transform: translateX(14px);
}

/* 针对不同类别激活时的开关颜色微调 - 修正开关颜色匹配 */
.layer-item.active:nth-child(1) .toggle-switch { background-color: #1890ff; }
.layer-item.active:nth-child(2) .toggle-switch { background-color: #20b2aa; } /* 青色 */
.layer-item.active:nth-child(3) .toggle-switch { background-color: #388e3c; } /* 绿色 */

</style>