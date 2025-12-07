<template>
    <div>
      <div id="mapContainer" style="width: 100%; height: 90vh;"></div>
      <BiologyStastic id="biologyStastic" ref="biology" class="biologyCss"/>
      <!-- 全局切换按钮 -->
      <div id="fullscreenButton" @click="toggleFullscreen" title="切换全屏">
        <img src="@/assets/images/global.png" alt="切换全屏" />
      </div>
  
      <!-- 底图切换控制面板 -->
      <div id="mapSwitchPanel" :class="{ open: isPanelOpen }"
        style="position: absolute; top: 150px; right: 10px; z-index: 1000;">
        <!-- 控件图标 -->
        <button id="toggleButton" @click="togglePanel" title="选择底图">
          <i class="iconfont">&#xe8e7;</i>
        </button>
  
        <!-- 底图选择框 -->
        <div id="layerOptions" v-if="isPanelOpen">
          <h4>选择底图</h4>
          <div class="button-container">
            <button @click="switchMap('vec')" :class="{ active: activeLayer === 'vec' }">
              <img src="@/assets/images/vec.jfif" alt="矢量地图" />
              <span :class="{ active: activeLayer === 'vec' }">矢量地图</span>
            </button>
            <button @click="switchMap('img')" :class="{ active: activeLayer === 'img' }">
              <img src="@/assets/images/img.jfif" alt="影像地图" />
              <span :class="{ active: activeLayer === 'img' }">影像地图</span>
            </button>
            <button @click="switchMap('ter')" :class="{ active: activeLayer === 'ter' }">
              <img src="@/assets/images/ter.jfif" alt="地形地图" />
              <span :class="{ active: activeLayer === 'ter' }">地形地图</span>
            </button>
          </div>
        </div>
      </div>
      <!-- 放大缩小按钮 -->
      <div id="zoomControls">
        <button id="zoomInButton" @click="zoomIn" title="放大">
          <i class="iconfont">&#xe85f;</i> <!-- 加号图标 -->
        </button>
        <button id="zoomOutButton" @click="zoomOut" title="缩小">
          <i class="iconfont">&#xe89a;</i> <!-- 减号图标 -->
        </button>
      </div>
  
      <!-- 显示经纬度的悬浮框 -->
      <div id="coordinateDisplay"
        style="position: absolute; bottom: 10px; right: 10px; z-index: 1000; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);">
        <p>经度: {{ currentCoordinates.lng }}</p>
        <p>纬度: {{ currentCoordinates.lat }}</p>
      </div>
    </div>
  </template>
  
  
  <script>
  import { onMounted, ref , useTemplateRef } from "vue";
  import screenfull from "screenfull";
  import stationIcon3 from "@/assets/images/icon3.png";
  import { openPhoto } from '@/utils/photo.js';
  import BiologyStastic from "./BiologyStastic.vue";
  
  
  export default {
    name: "TianDiMap",
    methods: {
      openPhoto(stationId) { },
    },
    components: {
          BiologyStastic,
      },
    setup() {
      const map = ref(null); // 地图实例
      const currentLayer = ref(null); // 当前图层
      const currentLabelLayer = ref(null); // 当前标签层
      const isPanelOpen = ref(false); // 控制面板开关
      const activeLayer = ref('vec'); // 当前激活的图层
      const isRectToolOpen = ref(false); //框选工具开启状态
          const isStasticOpen = ref(false);
          const biologyComp = useTemplateRef('biology');
      const currentCoordinates = ref({ lng: 0, lat: 0 }); // 当前鼠标经纬度
      const options = ref([
        {
          name: '实况数据分析-生物',
          source: null,
          isSelect: false,
        },
        {
          name: '实况数据分析-温度',
          source: null,
          isSelect: false,
        },
        {
          name: '实况数据分析-溶解氧',
          source: null,
          isSelect: false,
        },
        {
          name: '实况数据分析-盐度',
          source: null,
          isSelect: false,
        }]);
      const stationData = ref([]); // 默认值为空数组
      stationData.value = [//存储站点位置信息
        { id: 1, lng: 158.90606, lat: 20.40569 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 2, lng: 158.90843, lat: 19.58073,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 3, lng: 158.8706, lat: 23.09281,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 4, lng: 159.45556, lat: 19.94075,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 5, lng: 156.97338, lat: 20.43096 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 6, lng: 158.93843, lat: 20.82953 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 7, lng: 160.12771, lat: 23.88421 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 8, lng: 158.33543, lat: 22.58379,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 9, lng: 157.03445, lat: 22.21881,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 10, lng: 159.45556, lat: 19.94075 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 11, lng: 156.97338, lat: 20.43096,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 12, lng: 158.47129, lat: 20.39184 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 13, lng: 160.40548, lat: 20.45998,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 14, lng: 160.3351, lat: 20.24005,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 15, lng: 160.84998, lat: 20.92679,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 16, lng: 158.97543, lat: 22.15266,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 17, lng: 160.54633, lat: 22.88359,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 18, lng: 161.09346, lat: 23.17995,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 19, lng: 160.12771, lat: 23.88421,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
        { id: 20, lng: 157.03445, lat: 22.21881,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl: "@/assets/images/shengwu.jpg"},
      ];
      const isLayerControlOpen = ref(false);
      const toggleDropdown = () => {
        isLayerControlOpen.value = !isLayerControlOpen.value;
      };
      // 在 setup 中定义 addStationsToMap 函数
      const addStationsToMap = () => {
        if (!map.value) {
          console.error("地图实例未初始化");
          return;
        }
  
        stationData.value.forEach((station) => {
          let iconUrl;
  
  
          iconUrl = stationIcon3; // 默认图标
  
          // 创建图标
          const icon = new T.Icon({
            iconUrl: iconUrl, // 替换为自定义图标URL
            iconSize: new T.Point(30, 30),
            iconAnchor: new T.Point(15, 30),
          });
  
  
          const point = new T.LngLat(station.lng, station.lat);
          const marker = new T.Marker(point, { icon });
  
          map.value.addOverLay(marker);
          // const label = new T.Label({
          //   text: station.name,
          //   position: point,
          //   offset: new T.Point(0, -30),
          // });
          // map.value.addOverLay(label);
          // 创建信息窗口（用于显示站点名称）
          const infoWindow = new T.InfoWindow();
  
          // 设置信息窗口的HTML内容
          const content = `
      <div style="font-family: Arial, sans-serif; padding: 10px; background-color: transparent; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); width: 220px; text-align: center;">
    <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #333;text-align: left;">生物中文名: ${station.chname}</h4>
    <p style="margin: 6px 0; font-size: 14px; font-weight: bold; color: #333;text-align: left;">拉丁学名: ${station.laname}</p>
    <p style="margin: 6px 0; font-size: 14px; font-weight: bold; color: #333;text-align: left;">经度: ${station.lng}</p>
    <p style="margin: 6px 0; font-size: 14px; font-weight: bold; color: #333;text-align: left;">纬度: ${station.lat}</p>
    <p style="margin: 6px 0; font-size: 14px; font-weight: bold; color: #333;text-align: left;">水深: ${station.depth}</p>
    <p style="margin: 6px 0; font-size: 14px; font-weight: bold; color: #333;text-align: left;">温度: ${station.temperature}</p>
    <p style="margin: 6px 0; font-size: 14px; font-weight: bold; color: #333;text-align: left;">盐度: ${station.sanity}</p>
   <button id="photoButton-${station.id}" style="margin: 6px 0; padding: 8px 12px; width: 90%; background-color: #0085ca; color: white; border: none; 
      border-radius: 4px; cursor: pointer; font-size: 14px;"
      onmouseover="this.style.backgroundColor='#005f8a';" 
      onmouseout="this.style.backgroundColor='#0085ca';">
      查看生物图片
    </button>
  
  </div>
  
    `;
          infoWindow.setContent(content);
  
          // 添加鼠标点击事件，点击标记时弹出信息窗口
          marker.addEventListener("click", () => {
            console.log('点击了站点:', station.name);
  
            // 在点击位置打开信息窗口
            map.value.openInfoWindow(infoWindow, point);
            const buttonId = `photoButton-${station.id}`;
            document.getElementById(buttonId).addEventListener('click', () => {
              openPhoto(station.id);
            });
  
          });
  
        });
        console.log("站点已添加到地图");
      };
  
      const toggleFullscreen = () => {
        if (screenfull.isEnabled) {
          screenfull.toggle(document.getElementById("mapContainer")); // 切换全屏状态
        } else {
          alert("浏览器不支持全屏模式！");
        }
      };
  
      // 中心点
      const defaultCenter = { lng: 116, lat: 20 };
      const togglePanel = () => {
        isPanelOpen.value = !isPanelOpen.value;
      };
      // 切换地图图层
      const switchMap = (type) => {
        if (!map.value) return;
  
        // 移除当前图层
        if (currentLayer.value) {
          map.value.removeLayer(currentLayer.value);
        }
  
        // 移除当前标签图层
        if (currentLabelLayer.value) {
          map.value.removeLayer(currentLabelLayer.value);
        }
  
        let layerUrl, labelLayerUrl;
        switch (type) {
          case "vec":
            layerUrl = "http://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=e697b89bf3a744725b37567f90e802e9";
            labelLayerUrl = "http://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=e697b89bf3a744725b37567f90e802e9";
            break;
          case "img":
            layerUrl = "http://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=e697b89bf3a744725b37567f90e802e9";
            labelLayerUrl = "http://t0.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=e697b89bf3a744725b37567f90e802e9";
            break;
          case "ter":
            layerUrl = "http://t0.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=e697b89bf3a744725b37567f90e802e9";
            labelLayerUrl = "http://t0.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=e697b89bf3a744725b37567f90e802e9";
            break;
        }
  
        // 创建新的图层
        currentLayer.value = new T.TileLayer(layerUrl);
        map.value.addLayer(currentLayer.value);
  
        // 创建新的标签层
        currentLabelLayer.value = new T.TileLayer(labelLayerUrl);
        map.value.addLayer(currentLabelLayer.value);
        activeLayer.value = type; // 更新当前激活的图层
      };
  
      // 初始化地图
      function initMap() {
        // 初始化地图并设置中心点
        const centerPoint = new T.LngLat(defaultCenter.lng, defaultCenter.lat);
        map.value = new T.Map("mapContainer");
        map.value.centerAndZoom(centerPoint, 5);
  
        // 默认显示矢量地图
        const defaultLayer = new T.TileLayer(
            `https://{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}`, 
            { subdomains: ['t0','t1','t2','t3','t4','t5','t6','t7'] } // 显式指定子域
        );
        const labelLayer = new T.TileLayer(
            `https://{s}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}`, 
            { subdomains: ['t0','t1','t2','t3','t4','t5','t6','t7'] }
        );
        map.value.addLayer(defaultLayer); // 底图
        map.value.addLayer(labelLayer); // 标注文字层
        addStationsToMap();
        // 添加鼠标移动监听事件
        map.value.addEventListener("mousemove", (event) => {
          const { lng, lat } = event.lnglat;
          currentCoordinates.value = { lng: lng.toFixed(6), lat: lat.toFixed(6) };
        });
  // 初始化框选工具
  const rectTool = ref(new T.RectangleTool(map.value));
              // 双击时启动框选工具函数
              function EnableRectangleTool(rectTool, isRectToolOpen) {
                  // console.log("enbaleRectangle");
                  // console.log(rectTool.value);
                  // console.log(isRectToolOpen.value);
                  // rectTool.value.open();
                  if(isRectToolOpen.value == false){
                      isRectToolOpen.value = true;
                      rectTool.value.open();
                  }else{
                      isRectToolOpen.value = false;
                      rectTool.value.close();
                      rectTool.value.clear();
                  }
              }
  
              // 画框结束函数
              function RectDrawEnd() {
                  const newControl = new T.Control({position: T_ANCHOR_TOP_LEFT});
                  newControl.onAdd = (map) => {
                      var container = document.getElementById("biologyStastic");
                      // if (container) {
                      // 	container.innerHTML = BiologyStatistic;
                      // }
                      // var zicsstext = "font-size:12px;border:solid 2px blue;background:#fff;padding:2px;line-height:15px;cursor:pointer;";
                      // var zocsstext = "font-size:12px;border:solid 2px blue;background:#fff;padding:2px;line-height:15px;cursor:pointer;";
                      // const zoomInButton = createButton("放大", "放大", 'a', container, zicsstext);
                      // const zoomOutButton = createButton("缩小", "缩小", 'b', container, zocsstext);
                      // zoomInButton.onclick = zoomIn;
                      // zoomOutButton.onclick = zoomOut;
                      return container;
                  };
                  biologyComp.value.showSidebar();
                  map.value.addControl(newControl);
                  console.log("RectDrawEnd");
              }
  
  
              // map添加监听双击事件来控制使能矩形画框工具
              map.value.addEventListener('contextmenu', () => {
                  // rectTool.value.open();
                  EnableRectangleTool(rectTool, isRectToolOpen);
              })
  
              rectTool.value.addEventListener('draw', () => {
                  // rectTool.value.open();
                  RectDrawEnd();
              })
  
              const newControl = new T.Control({position: T_ANCHOR_TOP_LEFT});
              newControl.onAdd = (map) => {
                  var container = document.getElementById("biologyStastic");
                  return container;
              };
              map.value.addControl(newControl);
  
      }
  
      // 放大地图的方法
      function zoomIn() {
        if (map.value) {
          map.value.zoomIn(); // 调用地图放大方法
        }
      }
  
      // 缩小地图的方法
      function zoomOut() {
        if (map.value) {
          map.value.zoomOut(); // 调用地图缩小方法
        }
      }
  
      // 加载天地图脚本（使用 HTTPS，增加错误处理与超时提示，避免混合内容或加载失败）
      function loadTiandituScript(callback) {
        const script = document.createElement("script");
        // 使用 https 可以避免在 https 页面出现混合内容问题
        script.src = "https://api.tianditu.gov.cn/api?v=4.0&tk=e697b89bf3a744725b37567f90e802e9"; // 替换为你的密钥
        script.async = true;
        script.onload = () => {
          callback && callback();
        };
        script.onerror = () => {
          console.error("加载天地图脚本失败：", script.src);
          // 可以在页面上提示用户或记录上报
        };
        document.head.appendChild(script);

        // 超时保护：10s 内没有 window.T 就报错
        setTimeout(() => {
          if (!window.T) {
            console.error("天地图脚本超时未加载（10s）");
          }
        }, 10000);
      }
  
      onMounted(() => {
        if (window.T) {
          initMap();
        
        } else {
          loadTiandituScript(initMap);
        }
      });
  
      return {
        switchMap,
        togglePanel,
        isPanelOpen,
        activeLayer, // 绑定当前激活图层
        currentCoordinates,
        toggleFullscreen,
        zoomIn,
        zoomOut,
        addStationsToMap,
        toggleDropdown,
        isLayerControlOpen,
        options,
        openPhoto,
        isStasticOpen,
      };
    }
  };
  </script>
  
  <style>
  /* 专题图层控件样式 */
  #layerControlPanel {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 100px;
    margin-left: 30px;
  }
  
  
  /* 地图全局显示样式 */
  #fullscreenButton {
    position: absolute;
    right: 10px;
    top: 26%;
    transform: translateY(-50%);
    background: white;
    /* 按钮背景 */
    width: 40px;
    /* 按钮宽度 */
    height: 40px;
    /* 按钮高度 */
    border-radius: 12px;
    /* 圆角 */
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    /* 添加阴影效果 */
    cursor: pointer;
    z-index: 1000;
    /* 确保按钮显示在最前面 */
    overflow: hidden;
    /* 防止图片溢出边界 */
    transition: transform 0.3s ease;
    /* 添加交互效果 */
    margin-right: 36px;
    margin-top: 6px;
  }
  
  #fullscreenButton:hover {
    background: #f0f0f0;
    /* 悬停时背景变亮 */
    /* transform: scale(1.1); 悬停时放大效果 */
  }
  
  #fullscreenButton img {
    width: 46px;
    /* 调整图片宽度 */
    height: 46px;
    /* 调整图片高度 */
    object-fit: contain;
    /* 确保图片比例正常 */
    pointer-events: none;
    /* 避免图片遮挡点击事件 */
  }
  
  
  #mapSwitchPanel {
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
    /* 设置为更大的值来放大图标 */
    color: white;
  }
  
  #toggleButton img {
    display: block;
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
  }
  
  .button-container {
    display: flex;
    flex-direction: row;
    /* 水平排列按钮 */
    justify-content: center;
    /* 中心对齐按钮 */
    gap: 10px;
    /* 按钮之间的间距 */
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
  }
  
  .button-container button:hover {
    background: #e2e6ea;
  }
  
  .button-container img {
    width: 40px;
    /* 图标的宽度 */
    height: 40px;
    /* 图标的高度 */
    margin-bottom: 5px;
    border-radius: 5px;
    object-fit: cover;
  }
  
  .button-container button span {
    font-size: 14px;
    font-weight: 600;
    color: black;
    /* 按钮文字默认颜色 */
    background: transparent;
    /* 始终保持透明背景 */
  }
  
  .button-container button.active span {
    color: white;
    /* 激活状态下文字变白 */
    background: transparent;
    /* 防止背景颜色被覆盖 */
  }
  
  .button-container button.active {
    background: #007bff;
    /* 激活按钮背景色 */
  }
  
  .button-container i {
    font-size: 36px;
    /* 增大图标大小 */
    color: black;
    /* 图标的默认颜色 */
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
    /* 按钮间距 */
    z-index: 1000;
    margin-right: 16px;
  }
  
  /* 放大缩小按钮样式 */
  #zoomControls button {
    background: white;
    border: none;
    border-radius: 12px;
    /* 圆角 */
    width: 40px;
    /* 按钮宽度 */
    height: 40px;
    /* 按钮高度 */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-right: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    /* 添加阴影效果 */
    transition: background 0.3s ease;
    /* 添加交互效果 */
  }
  
  #zoomControls button:hover {
    background: #f0f0f0;
    /* 悬停时背景变亮 */
  }
  
  #zoomControls button i {
    font-size: 24px;
    /* 图标大小 */
    color: #007bff;
    /* 图标颜色 */
    pointer-events: none;
    /* 避免图标阻挡点击事件 */
  }
  
  /* 经纬度显示样式 */
  #coordinatesDisplay {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    /* 背景改为半透明黑色 */
    color: #ffffff;
    /* 字体颜色为白色 */
    padding: 10px 15px;
    /* 内边距增加 */
    border-radius: 10px;
    /* 增加圆角 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    /* 添加阴影效果 */
    font-size: 16px;
    /* 字体大小调整 */
    font-weight: bold;
    /* 字体加粗 */
    font-family: 'Arial', sans-serif;
    /* 使用现代感的字体 */
    z-index: 1000;
    text-align: center;
    /* 居中文本 */
  }
  
  #coordinatesDisplay span {
    display: block;
    /* 每一行独占 */
    margin-bottom: 5px;
    /* 行间距 */
  }
  
  #coordinatesDisplay span:last-child {
    margin-bottom: 0;
    /* 去除最后一行的间距 */
  }
  
  .tdt-marker-icon {
    width: 25px !important;
    height: 25px !important;
  }
  
  
  .dropdown-item {
    color: black;
    padding: 6px 8px;
    text-decoration: none;
    display: block;
  }
  
  .dropdown-item:hover {
    background-color: #f1f1f1;
  }
  
  .dropdown-button-selected {
    background-color: royalblue;
  }
  
  .biologyCss {
      width: 500px !important;
      height: 1000px !important;
      overflow-y: auto;
      /* 垂直滚动条 */
      overflow-x: auto;
  
  }
  
  </style>
  