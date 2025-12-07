<template>
  <div class="quick-controls">
    <div class="control-item">
      <button class="control-btn-icon" @click.stop="toggleRegion" title="海洋区域">
        <span class="icon-svg" v-html="globeSvg"></span>
      </button>
      
      <div v-show="isRegionOpen" class="control-popup" @click.stop>
         <div class="popup-title">海洋区域</div>
         <div class="popup-content">
           <select class="custom-select">
              <option value="">搜索区域 ...</option>
              <option value="1">区域 1</option>
           </select>
         </div>
      </div>
    </div>

    <div class="control-item">
      <button class="control-btn-icon" @click.stop="toggleMap" title="底图选择">
        <span class="icon-svg" v-html="layerSvg"></span>
      </button>

      <div v-show="isMapOpen" class="control-popup" @click.stop>
        <div class="popup-title">底图选择</div>
        <div class="map-options">
          <div 
            v-for="map in maps" 
            :key="map.value"
            class="map-option-item"
            :class="{ active: activeLayer === map.value }"
            @click="selectMap(map.value)"
          >
            {{ map.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'MapQuickControls',
  props: {
    activeLayer: {
      type: String,
      default: 'vec'
    }
  },
  emits: ['switch-map'],
  setup(props, { emit }) {
    const isRegionOpen = ref(false);
    const isMapOpen = ref(false);

    // SVGs for icons
    const globeSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="currentColor"/><path d="M512 140c-205.4 0-372 166.6-372 372h744c0-205.4-166.6-372-372-372z" fill="currentColor" opacity="0.4"/></svg>`;
    const layerSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M128 320l384 192 384-192-384-192L128 320zm384-128l256 128-256 128-256-128 256-128z" fill="currentColor"/><path d="M128 512l384 192 384-192-64-32-320 160-320-160z" fill="currentColor"/><path d="M128 704l384 192 384-192-64-32-320 160-320-160z" fill="currentColor"/></svg>`;

    const maps = [
      { label: "矢量地图 (天地图)", value: "vec" },
      { label: "影像地图 (天地图)", value: "img" },
      { label: "地形地图 (天地图)", value: "ter" },
      { label: "海洋地图 (Esri 基础)", value: "ocean" },
      { label: "海洋地图 (Esri 卫星)", value: "ocean_sat" }
    ];

    const toggleRegion = () => {
      isRegionOpen.value = !isRegionOpen.value;
      isMapOpen.value = false;
    };

    const toggleMap = () => {
      isMapOpen.value = !isMapOpen.value;
      isRegionOpen.value = false;
    };

    const selectMap = (val) => {
      emit('switch-map', val);
      isMapOpen.value = false;
    };

    return {
      isRegionOpen,
      isMapOpen,
      toggleRegion,
      toggleMap,
      selectMap,
      globeSvg,
      layerSvg,
      maps
    };
  }
};
</script>

<style scoped>
.quick-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-item {
  position: relative;
}

/* Base button style matching the Data Management button */
.control-btn-icon {
  width: 40px;
  height: 40px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #007bff;
  border: none;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  cursor: pointer;
  color: #fff;
  transition: background 0.2s, transform 0.1s;
}

.control-btn-icon:hover {
  background: #0069d9;
}

.control-btn-icon:active {
  transform: scale(0.95);
}

.icon-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

:deep(.icon-svg svg) {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* Popup Panel Styles */
.control-popup {
  position: absolute;
  left: 52px; /* Offset to appear to the right of the button */
  top: 0;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 0;
  width: 220px;
  z-index: 1202;
  border: 1px solid #ebeef5;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-5px); }
  to { opacity: 1; transform: translateX(0); }
}

.popup-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  padding: 10px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.popup-content {
  padding: 12px;
}

.custom-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  font-size: 13px;
}

.map-options {
  display: flex;
  flex-direction: column;
}

.map-option-item {
  padding: 10px 15px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-bottom: 1px solid #f9f9f9;
  transition: background 0.2s;
}

.map-option-item:last-child {
  border-bottom: none;
}

.map-option-item:hover {
  background: #f0f7ff;
  color: #007bff;
}

.map-option-item.active {
  background: #ecf5ff;
  color: #007bff;
  font-weight: bold;
}
</style>