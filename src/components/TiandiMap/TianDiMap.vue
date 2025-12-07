<template>
  <div>
    <div id="mapContainer"></div>
    <BiologyStastic id="biologyStastic" ref="biology" class="biologyCss"/>
    
    <div class="drawing-controls" v-if="showControls">
      <button @click="startRectSelect" :class="{ active: currentTool === 'rect' }" title="框选站点">
         <i class="iconfont">&#xe658;</i> 框选
      </button>
      <button @click="startCircleSelect" :class="{ active: currentTool === 'circle' }" title="圈选站点">
         <i class="iconfont">&#xe631;</i> 圈选
      </button>
      <button @click="clearSelection" title="清除选择">
         <i class="iconfont">&#xe69a;</i> 清除
      </button>
    </div>

    <MapControls 
      v-if="showControls"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @toggle-fullscreen="toggleFullscreen"
      @toggle-dropdown="toggleDropdown"
      @switch-map="switchMap"
      :active-layer="activeLayer"
      :is-layer-control-open="isLayerControlOpen"
      :options="options"
      :current-coordinates="currentCoordinates"
    />

    <div v-if="isDrawingCircle" :style="tooltipStyle" class="radius-tooltip">
      半径: {{ currentRadiusText }}
    </div>
  </div>
</template>

<script>
import { onMounted, ref, reactive, markRaw } from "vue";
import { applyTileLayerProxy } from '@/utils/tdt-proxy.js';
import screenfull from "screenfull";
import stationIcon3 from "@/assets/images/icon3.png";
import { openPhoto } from '@/utils/photo.js';
import BiologyStastic from "./BiologyStastic.vue";
import MapControls from './MapControls.vue'; 
import { api } from '@/api/management.js'; // 引入 API

export default {
  name: "TianDiMap",
  components: {
    BiologyStastic,
    MapControls,
  },
  props: {
    showVoyage: { type: Boolean, default: true },
    showBio: { type: Boolean, default: true },
    showChem: { type: Boolean, default: true },
    showControls: { type: Boolean, default: true }
  },
  setup(props) {
    const map = ref(null);
    const currentLayer = ref(null);
    const currentLabelLayer = ref(null);
    const activeLayer = ref('vec');
    const biology = ref(null); 
    const currentCoordinates = reactive({ lng: '0.000000', lat: '0.000000' });
    const isLayerControlOpen = ref(false);
    const options = ref([]); // 占位 options

    // --- 核心状态 ---
    const stationMarkers = new Map(); // 存储站点 Marker: ID -> Marker
    const currentTool = ref(null);    // 当前激活工具: 'rect', 'circle', null
    let rectTool = null;
    let circleTool = null;
    let selectionOverlay = null;      // 持久化的选区图形(Rect/Circle)

    // --- 圈选辅助状态 ---
    const isDrawingCircle = ref(false);
    const currentRadiusText = ref('0 m');
    const tooltipStyle = reactive({ top: '0px', left: '0px' });
    let circleStartPoint = null;
    
    const toggleDropdown = () => {
      isLayerControlOpen.value = !isLayerControlOpen.value;
    };

    // --- 1. 清除功能 ---
    const clearSelection = () => {
      // 移除地图上的选区图形
      if (selectionOverlay && map.value) {
        map.value.removeOverLay(selectionOverlay);
        selectionOverlay = null;
      }
      
      // 关闭工具并清理临时图形
      if (rectTool) { rectTool.close(); rectTool.clear(); }
      if (circleTool) { circleTool.close(); circleTool.clear(); }
      
      currentTool.value = null;
      isDrawingCircle.value = false;
      circleStartPoint = null;

      // 【关键修改】恢复所有站点显示
      // 现在的结构是：id -> [Marker1, Marker2, Line1, ...] (数组)
      stationMarkers.forEach(overlays => {
        if (Array.isArray(overlays)) {
          overlays.forEach(overlay => overlay.show());
        }
      });

      // 隐藏侧边栏
      if (biology.value) biology.value.hideSidebar();
      
      console.log("已清除选区，重置视图");
    };

    // --- 2. 框选功能 ---
    const startRectSelect = () => {
      clearSelection(); // 先清除旧的
      if (rectTool) {
        rectTool.open();
        currentTool.value = 'rect';
      }
    };

    const handleRectDraw = async (e) => {
      // e.currentBounds 是天地图返回的范围
      const bounds = e.currentBounds;
      console.log("👉 矩形绘制完成，触发 handleRectDraw", e);
      // 停止绘制
      rectTool.close();
      rectTool.clear();
      currentTool.value = null;

      // 绘制持久化矩形
      const rect = new T.Rectangle(bounds, {
        color: "#0000FF", weight: 2, opacity: 0.5, 
        fillColor: "#FFFFFF", fillOpacity: 0.1, lineStyle: "dashed"
      });
      map.value.addOverLay(rect);
      selectionOverlay = rect;

      // 坐标转换：天地图 Bounds (SW, NE) -> API (Begin:TopLeft, End:BottomRight)
      // 注意：根据你的 API 定义，Begin 是框左上角，End 是框右下角
      const ne = bounds.getNorthEast(); // 右上 (maxLng, maxLat)
      const sw = bounds.getSouthWest(); // 左下 (minLng, minLat)

      const params = {
        longitudeBegin: sw.lng, 
        latitudeBegin: ne.lat,  
        longitudeEnd: ne.lng,   
        latitudeEnd: sw.lat     
      };

      try {
        const res = await api.stations.getBySRange(params);
        handleSelectionResult(res);
      } catch (err) {
        console.error("框选请求失败", err);
      }
    };

    // --- 3. 圈选功能 ---
    const startCircleSelect = () => {
      clearSelection();
      if (circleTool) {
        circleTool.open();
        currentTool.value = 'circle';
        isDrawingCircle.value = true;
        circleStartPoint = null;
      }
    };

    // 辅助：监听点击确定圆心（用于实时计算半径）
    const onMapClick = (e) => {
      if (isDrawingCircle.value && !circleStartPoint) {
        // 第一次点击，确认为圆心
        circleStartPoint = e.lnglat;
      }
    };

    // 辅助：监听鼠标移动更新半径提示
    const onMapMouseMove = (e) => {
      // 更新坐标显示
      const { lng, lat } = e.lnglat;
      currentCoordinates.lng = lng.toFixed(6);
      currentCoordinates.lat = lat.toFixed(6);

      // 如果正在圈选且已知圆心，计算半径
      if (isDrawingCircle.value && circleStartPoint) {
        const currentPoint = new T.LngLat(lng, lat);
        const distance = map.value.getDistance(circleStartPoint, currentPoint);
        currentRadiusText.value = distance < 1000 
          ? `${Math.round(distance)} m` 
          : `${(distance / 1000).toFixed(2)} km`;
        
        // 更新提示框位置
        tooltipStyle.top = (e.containerPoint.y + 15) + 'px';
        tooltipStyle.left = (e.containerPoint.x + 15) + 'px';
      }
    };

    const handleCircleDrawEnd = async (e) => {
      const center = e.currentCenter;
      const radius = e.currentRadius; // 米

      // 停止绘制
      circleTool.close();
      circleTool.clear();
      currentTool.value = null;
      isDrawingCircle.value = false;
      circleStartPoint = null;

      // 绘制持久化圆
      const circle = new T.Circle(center, radius, {
        color: "#FF0000", weight: 2, opacity: 0.5,
        fillColor: "#FFFFFF", fillOpacity: 0.1, lineStyle: "dashed"
      });
      map.value.addOverLay(circle);
      selectionOverlay = circle;

      // 发送请求
      const params = {
        longitude: center.lng,
        latitude: center.lat,
        distanceM: radius
      };

      try {
        const res = await api.stations.getByCRange(params);
        handleSelectionResult(res);
      } catch (err) {
        console.error("圈选请求失败", err);
      }
    };

    // --- 4. 筛选结果处理 (通用) ---
    const handleSelectionResult = (res) => {
      const dataList = Array.isArray(res) ? res : (res.data || []);
      const validIds = new Set(dataList.map(item => item.id));

      // 遍历所有站点 (注意：overlays 是一个数组)
      stationMarkers.forEach((overlays, id) => {
        const shouldShow = validIds.has(id);
        
        // 必须遍历数组中的每一个元素（包括 Marker 和 Polyline），分别控制显隐
        if (Array.isArray(overlays)) {
          overlays.forEach(overlay => {
            if (shouldShow) {
              overlay.show();
            } else {
              overlay.hide();
            }
          });
        }
      });
      
      // 显示侧边栏数据 (保持不变)
      if (biology.value && dataList.length > 0) {
        biology.value.showSidebar(dataList);
      } else {
        console.log("选区内无数据");
      }
    };

    // --- 5. 渲染站点 ---


    const renderStations = (list) => { 
      if (!list || list.length === 0) return;

      list.forEach(item => {
        try {
          // 用于收集该站点的所有覆盖物（包括本尊和左右分身）
          // 最终结构：[StartMarker1, EndMarker1, Line1, StartMarker2, EndMarker2, Line2...]
          let allOverlays = []; 

          // 定义三个偏移量：原始位置(0)，右侧世界(+360)，左侧世界(-360)
          const longitudeOffsets = [0, 360, -360];

          longitudeOffsets.forEach(offset => {
            
            // --- 1. Point 类型处理 ---
            if (item.stationType === 'Point' || (!item.towStartLatitude && item.latitude)) {
              if (item.longitude != null && item.latitude != null) {
                  // 经度加上偏移量
                  const finalLng = item.longitude + offset;
                  
                  const point = new T.LngLat(finalLng, item.latitude);
                  const icon = new T.Icon({
                    iconUrl: stationIcon3,
                    iconSize: new T.Point(25, 25),
                    iconAnchor: new T.Point(12, 25),
                  });
                  
                  const marker = new T.Marker(point, { icon });
                  addInfoWindow(marker, item, 'Point');
                  
                  // 添加到地图并收集
                  map.value.addOverLay(marker);
                  allOverlays.push(markRaw(marker));
              }
            } 
            // --- 2. Tow 类型处理 (保留画线逻辑) ---
            else if (item.stationType === 'Tow' || (item.towStartLatitude && item.towEndLatitude)) {
              if (item.towStartLongitude != null && item.towStartLatitude != null &&
                  item.towEndLongitude != null && item.towEndLatitude != null) {
                  
                  // 起点和终点的经度都要加上偏移量
                  const startLng = item.towStartLongitude + offset;
                  const endLng = item.towEndLongitude + offset;

                  const startPoint = new T.LngLat(startLng, item.towStartLatitude);
                  const endPoint = new T.LngLat(endLng, item.towEndLatitude);

                  // A. 创建起点 Marker
                  const startMarker = new T.Marker(startPoint, { 
                    icon: new T.Icon({ iconUrl: stationIcon3, iconSize: new T.Point(25, 25), iconAnchor: new T.Point(12, 25) })
                  });
                  addInfoWindow(startMarker, item, 'Tow (起点)');

                  // B. 创建终点 Marker
                  const endMarker = new T.Marker(endPoint, { 
                    icon: new T.Icon({ iconUrl: stationIcon3, iconSize: new T.Point(20, 20), iconAnchor: new T.Point(10, 20) })
                  });
                  addInfoWindow(endMarker, item, 'Tow (终点)');

                  // C. 创建虚线连线
                  const line = new T.Polyline([startPoint, endPoint], {
                    color: "#0000FF", 
                    weight: 3,       
                    opacity: 0.7,    
                    lineStyle: "dashed" 
                  });

                  // D. 全部添加到地图
                  map.value.addOverLay(startMarker);
                  map.value.addOverLay(endMarker);
                  map.value.addOverLay(line);

                  // E. 收集到数组中
                  allOverlays.push(markRaw(startMarker));
                  allOverlays.push(markRaw(endMarker));
                  allOverlays.push(markRaw(line));
              }
            }
          });

          // 只有当成功创建了覆盖物时才存入 Map
          if (allOverlays.length > 0) {
            // 注意：这里存的是一个包含所有分身(Point或Tow组件)的大数组
            stationMarkers.set(item.id, allOverlays);
          }

        } catch (err) {
          console.warn("渲染站点出错:", item, err);
        }
      });
    };

    const addInfoWindow = (overlay, item) => {
      const infoWindow = new T.InfoWindow();
      const name = item.pointName || item.towName || `Station ${item.id}`;
      const content = `
        <div style="font-size:13px; padding:5px;">
          <h4 style="margin:0 0 5px; color:#0b57a4;">${name}</h4>
          <p>经度: ${item.longitude}</p>
          <p>纬度: ${item.latitude}</p>
        </div>
      `;
      infoWindow.setContent(content);
      overlay.addEventListener("click", () => {
        const pos = overlay.getLngLat();
        map.value.openInfoWindow(infoWindow, pos);
      });
    };

    // --- 数据加载 ---
    const loadStations = async () => {
      if (!map.value) return;
      try {
        // 加载全部数据 (分页或一次性，这里简化演示一次性获取大页)
        const params = { page: 0, size: 9999 };
        const res = await api.stations.page(params);
        const list = Array.isArray(res) ? res : (res.data || []);
        renderStations(list);
      } catch (e) {
        console.error("加载站点数据失败:", e);
      }
    };

    // --- 地图初始化 ---
    function initMap() {
      if (window.T) {
        applyTileLayerProxy(window.T);
      }

      const centerPoint = new T.LngLat(116, 20);
      map.value = new T.Map("mapContainer", { minZoom: 3, maxZoom: 18, projection: 'EPSG:900913', worldCopyJump: false });
      map.value.centerAndZoom(centerPoint, 5);

      // 底图
      const defaultLayer = new T.TileLayer(`https://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8`);
      const labelLayer = new T.TileLayer(`https://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8`);
      map.value.addLayer(defaultLayer);
      map.value.addLayer(labelLayer);

      // 加载数据
      loadStations();

      // 初始化工具
      rectTool = new T.RectangleTool(map.value);
      rectTool.addEventListener('draw', handleRectDraw);

      circleTool = new T.CircleTool(map.value);
      circleTool.addEventListener('drawend', handleCircleDrawEnd);

      // 添加事件监听
      map.value.addEventListener("click", onMapClick);
      map.value.addEventListener("mousemove", onMapMouseMove);

      const newControl = new T.Control({position: T_ANCHOR_TOP_LEFT});
      newControl.onAdd = () => document.getElementById("biologyStastic");
      map.value.addControl(newControl);
    }

    // --- 辅助函数 ---
    const toggleFullscreen = () => {
      if (screenfull.isEnabled) screenfull.toggle(document.getElementById("mapContainer"));
    };
    const zoomIn = () => map.value && map.value.zoomIn();
    const zoomOut = () => map.value && map.value.zoomOut();
    
    const switchMap = (type) => {
      if (!map.value) return;
      if (currentLayer.value) map.value.removeLayer(currentLayer.value);
      if (currentLabelLayer.value) map.value.removeLayer(currentLabelLayer.value);
      
      let layerUrl, labelUrl;
      if(type === 'vec') {
         layerUrl = "https://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
         labelUrl = "https://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
      } else if(type === 'img') {
         layerUrl = "https://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
         labelUrl = "https://t0.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
      } else if (type === 'ter') {
         layerUrl = "https://t0.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
         labelUrl = "https://t0.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
      }
      currentLayer.value = new T.TileLayer(layerUrl);
      map.value.addLayer(currentLayer.value);
      if(labelUrl) {
        currentLabelLayer.value = new T.TileLayer(labelUrl);
        map.value.addLayer(currentLabelLayer.value);
      }
      activeLayer.value = type;
    };

    function loadTiandituScript(callback) {
      const script = document.createElement("script");
      script.src = "https://api.tianditu.gov.cn/api?v=4.0&tk=db74e3389d27b4b68914d84fd152f1b8";
      script.async = true;
      script.onload = () => callback && callback();
      document.head.appendChild(script);
    }

    onMounted(() => {
      if (window.T) initMap();
      else loadTiandituScript(initMap);
    });

    return {
      map,
      activeLayer,
      currentCoordinates,
      toggleFullscreen,
      zoomIn,
      zoomOut,
      switchMap,
      toggleDropdown,
      isLayerControlOpen,
      options,
      biology,
      // 工具相关
      currentTool,
      startRectSelect,
      startCircleSelect,
      clearSelection,
      // 圈选UI
      isDrawingCircle,
      currentRadiusText,
      tooltipStyle
    };
  }
};
</script>

<style scoped>
#mapContainer {
  width: 100%; 
  height: 90vh;
  background-color: #aac6ee;
}

/* 绘图工具条样式 */
.drawing-controls {
  position: absolute;
  top: 20px;
  left: 60px; /* 根据实际布局调整，避开左上角其他控件 */
  z-index: 1000;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.drawing-controls button {
  border: 1px solid #ccc;
  background: white;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s;
}

.drawing-controls button:hover {
  background: #f0f0f0;
  color: #007bff;
}

.drawing-controls button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.drawing-controls i {
  font-size: 16px;
}

/* 半径提示框 */
.radius-tooltip {
  position: fixed; /* 使用 fixed 以便跟随鼠标且不被遮挡 */
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none; /* 让鼠标穿透提示框 */
  z-index: 2000;
  white-space: nowrap;
}

/* 兼容原有样式 */
.biologyCss {
  width: 500px !important;
  height: 1000px !important;
  overflow-y: auto;
  overflow-x: auto;
}
</style>