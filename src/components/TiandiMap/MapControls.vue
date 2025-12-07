<template>
  <div>
    <div id="fullscreenButton" @click="emit('toggle-fullscreen')" title="切换全屏">
      <img src="@/assets/images/global.png" alt="切换全屏" />
    </div>

    <div id="mapSwitchPanel" :class="{ open: isPanelOpen }" v-if="showMapSwitcher">
      <button id="toggleButton" @click="togglePanel" title="选择底图">
        <i class="iconfont">&#xe8e7;</i>
      </button>

      <div id="layerOptions" v-if="isPanelOpen">
        <h4>选择底图</h4>
        <div class="button-container">
          <button @click="emit('switch-map', 'vec')" :class="{ active: activeLayer === 'vec' }">
            <img src="@/assets/images/vec.jfif" alt="矢量地图" />
            <span :class="{ active: activeLayer === 'vec' }">矢量地图</span>
          </button>

          <button @click="emit('switch-map', 'img')" :class="{ active: activeLayer === 'img' }">
            <img src="@/assets/images/img.jfif" alt="影像地图" />
            <span :class="{ active: activeLayer === 'img' }">影像地图</span>
          </button>

          <button @click="emit('switch-map', 'ter')" :class="{ active: activeLayer === 'ter' }">
            <img src="@/assets/images/ter.jfif" alt="地形地图" />
            <span :class="{ active: activeLayer === 'ter' }">地形地图</span>
          </button>

          <button @click="emit('switch-map', 'ocean')" :class="{ active: activeLayer === 'ocean' }">
            <img src="@/assets/images/img.jfif" alt="海洋地图" />
            <span :class="{ active: activeLayer === 'ocean' }">海洋地图</span>
          </button>
        </div>
      </div>
    </div>

    <div id="zoomControls">
      <button id="zoomInButton" @click="emit('zoom-in')" title="放大">
        <i class="iconfont">&#xe85f;</i> </button>
      <button id="zoomOutButton" @click="emit('zoom-out')" title="缩小">
        <i class="iconfont">&#xe89a;</i> </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定义 props 接收父组件传递的激活图层状态
defineProps({
  activeLayer: {
    type: String,
    default: 'vec'
  },
  // 新增：控制是否显示底图切换器，默认为 true
  showMapSwitcher: {
    type: Boolean,
    default: true
  }
});

// 定义组件可以触发的事件
const emit = defineEmits(['toggle-fullscreen', 'switch-map', 'zoom-in', 'zoom-out']);

// 控制底图面板的开关状态
const isPanelOpen = ref(false);
const togglePanel = () => {
  isPanelOpen.value = !isPanelOpen.value;
};
</script>

<style scoped>
/* 地图全局显示样式 */
#fullscreenButton {
  position: absolute;
  right: 10px;
  top: 250px;
  transform: translateY(-50%);
  background: white;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 1000;
  overflow: hidden;
  transition: transform 0.3s ease;
  margin-right: 36px;
  margin-top: 6px;
}

#fullscreenButton:hover {
  background: #f0f0f0;
}

#fullscreenButton img {
  width: 46px;
  height: 46px;
  object-fit: contain;
  pointer-events: none;
}

#mapSwitchPanel {
  position: absolute; 
  top: 150px; 
  right: 10px; 
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 100px;
  margin-right: 30px;
}

#toggleButton {
  background: #007bff;
  border: none;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

#toggleButton i {
  font-size: 38px;
  color: white;
}

#layerOptions {
  margin-top: 10px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 允许内容稍微宽一点以容纳4个按钮 */
  min-width: 280px; 
}

.button-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  /* 如果按钮变多，允许换行，或者保持单行 */
  flex-wrap: wrap; 
}

.button-container button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  /* 限制按钮宽度，防止撑得太大 */
  width: 80px; 
}

.button-container button:hover {
  background: #e2e6ea;
}

.button-container img {
  width: 40px;
  height: 40px;
  margin-bottom: 5px;
  border-radius: 5px;
  object-fit: cover;
}

.button-container button span {
  font-size: 12px; /* 稍微调小字体以适应按钮宽度 */
  font-weight: 600;
  color: black;
  background: transparent;
  white-space: nowrap; /* 防止文字换行 */
}

.button-container button.active span {
  color: white;
  background: transparent;
}

.button-container button.active {
  background: #007bff;
}

/* 放大缩小控件容器 */
#zoomControls {
  position: absolute;
  right: 10px;
  top: 70%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  z-index: 1000;
  margin-right: 16px;
}

/* 放大缩小按钮样式 */
#zoomControls button {
  background: white;
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;
}

#zoomControls button:hover {
  background: #f0f0f0;
}

#zoomControls button i {
  font-size: 24px;
  color: #007bff;
  pointer-events: none;
}
</style>