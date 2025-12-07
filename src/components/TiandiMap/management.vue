<template>
  <div>
    <div id="mapContainer"></div>
    
    <BiologyStastic id="biologyStastic" ref="biology" class="biologyCss" v-show="isStasticOpen"/>

    <MapControls 
      :active-layer="activeLayer"
      :show-map-switcher="false"
      @toggle-fullscreen="toggleFullscreen"
      @switch-map="switchMap"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
    />

    <div class="map-tools-panel">
      <div class="tool-group">
        <button class="tool-btn" :class="{ active: currentTool === 'rect' }" @click="activateTool('rect')" title="矩形框选">
          <i class="iconfont icon-juxing"></i> 框选
        </button>
        <button class="tool-btn" :class="{ active: currentTool === 'circle' }" @click="activateTool('circle')" title="圆形框选">
          <i class="iconfont icon-yuanxing"></i> 圈选
        </button>
        <button class="tool-btn" @click="handleUndo" title="撤回上一步" :class="{ disabled: selectionHistory.length === 0 }">
          <i class="iconfont icon-chexiao"></i> 撤回
        </button>
        <button class="tool-btn" @click="clearSelection" title="清除选择">
          <i class="iconfont icon-qingchu"></i> 清除
        </button>
      </div>
    </div>

    <div id="datamaSwitchPanel" :class="{ open: isDataPanelOpen }">
      
      <button id="datamaButton" @click.stop="toggleDatama" title="数据管理">
        <span class="icon-svg" v-if="!isDataPanelOpen" v-html="openIconSvg"></span>
        <span class="icon-svg" v-else v-html="closeIconSvg"></span>
      </button>

      <MapQuickControls 
        :active-layer="activeLayer" 
        @switch-map="switchMap"
      />

      <div id="datalayerOptions" v-show="isDataPanelOpen" aria-label="数据面板">
        <div class="data-header">
          <div class="tabs">
            <button class="tab" :class="{ active: activeDataTab === 'catalogue' }" @click="setDataTab('catalogue')">目录</button>
            <button class="tab" :class="{ active: activeDataTab === 'layers' }" @click="setDataTab('layers')">数据</button>
          </div>
          <button class="header-add-btn" v-if="activeDataTab === 'catalogue'" @click="openImport" title="添加外部数据">
            <span>+</span> 添加外部数据
          </button>
        </div>

        <div class="data-search" v-if="activeDataTab === 'catalogue'">
          <input v-model="layerSearch" placeholder="搜索数据" class="data-search-input" />
        </div>

        <div class="data-list data-list-action" v-if="activeDataTab === 'layers'">
          <div v-for="cruise in groupedActiveLayerItems" :key="cruise.id" class="cruise-data-group">
              <div class="cruise-data-header" @click="toggleCruise(cruise.id)">
                <div class="cruise-header-left">
                  <i class="iconfont icon-chuan" style="margin-right:6px; font-size:16px;"></i>
                  <span>{{ cruise.name }}</span>
                  <span class="badge-count">{{ cruise.totalCount }}</span>
                </div>
                
                <div class="cruise-header-right" style="display:flex; align-items:center; gap:10px;">
                  <button class="icon-btn small-btn" @click.stop="toggleCruiseHull(cruise.id)" :title="cruiseHullVisibility[cruise.id] !== false ? '隐藏航次范围' : '显示航次范围'">
                    <span class="icon-svg" :class="{ 'is-off': cruiseHullVisibility[cruise.id] === false }" 
                      v-html="cruiseHullVisibility[cruise.id] !== false ? eyeCloseSvg : eyeOpenSvg">
                    </span>
                  </button>

                  <button class="icon-btn small-btn" @click.stop="removeCruiseData(cruise)" title="移除该航次所有数据">
                    <span class="btn-icon btn-icon--danger iconfont icon-alidelete-fill" style="font-size: 16px;"></span>
                  </button>

                  <span class="cat-arrow" :class="{ open: expandedCruises[cruise.id] }" v-html="arrowSvg"></span>
                </div>
              </div>

              <div v-show="expandedCruises[cruise.id]" class="cruise-data-body">
                <div v-for="group in cruise.stationList" :key="group.stationId" class="station-data-group">
                    <div class="station-data-header" @click="toggleStation(group.stationName)">
                      <div class="station-header-left">
                        <span>{{ group.stationName }}</span>
                        <span class="badge-count" v-if="group.items.length > 0">{{ group.items.length }}</span>
                      </div>
                      
                      <div class="station-header-right">
                        <button class="icon-btn small-btn" @click.stop="viewStationDetail(group)" title="跳转到站点详情">
                          <span class="icon-svg" v-html="infoSvg"></span>
                        </button>
                        <button class="icon-btn small-btn" @click.stop="toggleStationVisibility(group)" :title="isStationVisible(group) ? '隐藏该站点所有数据' : '显示该站点所有数据'">
                          <span class="icon-svg" :class="{ 'is-off': !isStationVisible(group) }" 
                          v-html="isStationVisible(group) ? eyeCloseSvg : eyeOpenSvg">
                          </span>
                        </button>

                        <button class="icon-btn small-btn" @click.stop="removeStationData(group)" title="移除该站点所有数据">
                          <span class="btn-icon btn-icon--danger iconfont icon-alidelete-fill" style="font-size: 16px;"></span>
                        </button>

                        <span class="cat-arrow" :class="{ open: isStationExpanded(group.stationName) }" v-html="arrowSvg"></span>
                      </div>
                    </div>
                    
                    <div v-show="isStationExpanded(group.stationName)">
                      <div v-for="item in group.items" :key="item.id" class="data-layer-container">
                        <div class="data-layer-item">
                          <div class="data-layer-info">
                            <div class="data-layer-title" @click="centerOnLayer(item)" style="cursor: pointer;" title="点击定位到站点">
                              <span :class="['badge-common', getBadgeClass(item.type)]">{{ getBadgeText(item.type) }}</span>
                              {{ item.name }}
                            </div>
                            
                            <div class="cat-item-source">
                                <span class="source-tag">来源站点</span> {{ group.stationName }}
                            </div>

                            <div class="data-layer-description">{{ item.description }}</div>
                          </div>
                          <div class="data-layer-action">
                            <button class="icon-btn" @click="viewChemDetail(chem)" title="查看详情">
                              <span class="icon-svg" v-html="infoSvg"></span>
                            </button>
                            
                            <button class="icon-btn" @click="onCatalogueItemToggle(chem, false)" title="移除">
                              <span class="btn-icon btn-icon--danger iconfont icon-alidelete-fill"></span>
                            </button>
                          </div>
                        </div>

                        <div v-if="item.chemChildren && item.chemChildren.length > 0" class="chem-sub-list">
                          <div class="chem-sub-header" @click="toggleChemList(item.id)">
                              <span>🧪 化学数据 ({{ item.chemChildren.length }})</span>
                              <span class="sub-arrow" :class="{ open: !isChemCollapsed(item.id) }">▼</span>
                          </div>
                          <div v-show="!isChemCollapsed(item.id)" class="chem-items-container">
                              <div v-for="chem in item.chemChildren" :key="chem.id" class="data-layer-item chem-item">
                                <div class="data-layer-info">
                                  <div class="data-layer-title chem-title">{{ chem.name }}</div>
                                  <div class="data-layer-description">{{ chem.description }}</div>
                                </div>
                                <div class="data-layer-action">
                                  <button class="icon-btn" @click="viewChemDetail(item)" title="查看详情">
                                    <span class="icon-svg" v-html="infoSvg"></span>
                                  </button>
                                  
                                  <button class="icon-btn" @click="onCatalogueItemToggle(chem, false)" title="移除">
                                    <span class="btn-icon btn-icon--danger iconfont icon-alidelete-fill"></span>
                                  </button>
                                </div>
                              </div>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
          </div>
        </div>

        <div class="data-actions-fixed" v-if="activeDataTab === 'layers'">
          <div class="layer-bulk">
            <button class="control-btn" @click="toggleAllLayers" :title="allHidden ? '显示所有数据':'隐藏所有数据'">
              <span class="icon-svg" v-html= "allHidden ? eyeOpenSvg : eyeCloseSvg"></span>
              {{allHidden ? '显示所有数据' : '隐藏所有数据'}}
            </button>
            <div class="clear-block">
              <button class="control-btn" @click="showClearConfirm = true" title="清除所有数据">
                <i class="iconfont icon-alidelete-fill" aria-hidden="true"></i> 清除所有数据
              </button>
            </div>
          </div>
        </div>

        <div class="data-list catalogue-list" v-if="activeDataTab === 'catalogue'">
          <div class="catalogue-groups">
              <div class="cat-group" v-for="group in filteredCatalogue" :key="group.id">
                <div class="cat-group-header" @click="toggleGroup(group.id)">
                  <div class="cat-group-title">{{ group.name }}</div>
                  <span class="cat-arrow" :class="{ open: expanded[group.id] }" v-html="arrowSvg"></span>
              </div>
              
              <div class="cat-group-body" v-show="expanded[group.id]">
                 <div class="select-all-row">
                  <label>
                    <input
                      type="checkbox"
                      :checked="isNodeAllSelected(groupItems[group.id])"
                      @change="toggleNodeSelectAll(groupItems[group.id], $event.target.checked)"
                    />
                    全选本组
                  </label>
                </div>

                <div v-for="node in (filteredGroupTree[group.id] || [])" :key="node.id">
                  <template v-if="Array.isArray(node.children) && node.children.length">
                    <div class="cat2">
                      <div class="cat2-header" @click="toggleCat(node.id)">
                        <div class="header-check" @click.stop>
                          <input type="checkbox"
                            :checked="isNodeAllSelected(node.children)"
                            @change="toggleNodeSelectAll(node.children, $event.target.checked)" 
                          >
                          </div>
                        <div class="cat2-title">{{ node.name }}</div>
                        <span class="cat-arrow" :class="{ open: expandedSecond[node.id] }" v-html="arrowSvg"></span>
                      </div>
                      
                      <div class="cat2-body" v-show="expandedSecond[node.id]">
                        <div v-for="subItem in (node.children || [])" :key="subItem.id">
                            <template v-if="Array.isArray(subItem.children) && subItem.children.length">
                              <div class="cat3">
                                <div class="cat3-header" @click="toggleCat3(subItem.id)">
                                  <div class="header-check" @click.stop>
                                    <input type="checkbox"
                                      :checked="isNodeAllSelected(subItem.children)"
                                      @change="toggleNodeSelectAll(subItem.children, $event.target.checked)"
                                    >
                                  </div>
                                  <div class="cat3-title">{{ subItem.name }}</div>
                                  <span class="cat-arrow" :class="{ open: expandedThird[subItem.id] }" v-html="arrowSvg"></span>
                                </div>

                                <div class="cat3-body" v-show="expandedThird[subItem.id]">
                                  <div class="select-all-row smaller">
                                    <label>
                                      <input
                                        type="checkbox"
                                        :checked="isNodeAllSelected(subItem.children)"
                                        @change="toggleNodeSelectAll(subItem.children, $event.target.checked)"
                                      />
                                      全选 {{ subItem.name }}
                                    </label>
                                  </div>
                                  
                                  <div v-for="leaf in (subItem.children || [])" :key="leaf.id">
                                    <template v-if="Array.isArray(leaf.children) && leaf.children.length > 0">
                                      <div class="cat4">
                                        <div class="cat4-header" @click="toggleCat4(leaf.id)">
                                          <div class="header-check" @click.stop>
                                            <input type="checkbox"
                                              :checked="isNodeAllSelected(leaf.children)"
                                              @change="toggleNodeSelectAll(leaf.children, $event.target.checked)"
                                            >
                                          </div>
                                          <div class="cat4-title-group">
                                            <div class="cat4-title">{{ leaf.name }}</div>
                                            <div class="cat4-desc" v-if="leaf.description">{{ leaf.description }}</div>
                                          </div>
                                          <span class="cat-arrow" :class="{ open: expandedFourth[leaf.id] }" v-html="arrowSvg"></span>
                                        </div>
                                        
                                        <div class="cat4-body" v-show="expandedFourth[leaf.id]">
                                           <div class="select-all-row smaller">
                                              <label>
                                                <input
                                                  type="checkbox"
                                                  :checked="isNodeAllSelected(leaf.children)"
                                                  @change="toggleNodeSelectAll(leaf.children, $event.target.checked)"
                                                />
                                                全选 {{ leaf.name }}
                                              </label>
                                           </div>

                                           <div class="cat-item-row sample-row" v-for="sample in leaf.children" :key="sample.id">
                                              <label class="cat-item-left sample-left">
                                                <input type="checkbox" v-model="sample.selected" @change="onCatalogueItemToggle(sample)" />
                                                <div class="cat-item-content">
                                                  <span class="cat-item-name">{{ sample.name }}</span>
                                                  <div class="cat-item-source" v-if="sample.stationName">
                                                    <span class="source-tag">来源站点</span> {{ sample.stationName }}
                                                  </div>
                                                  <div class="cat-item-desc" v-if="sample.description">
                                                    {{ sample.description }}
                                                  </div>
                                                </div>
                                              </label>
                                              <div class="cat-item-actions">
                                                <button class="icon-btn" @click="showCatalogueInfo(sample)" title="信息">
                                                  <span class="icon-svg" v-html="infoSvg"></span>
                                                </button>
                                              </div>
                                           </div>
                                        </div>
                                      </div>
                                    </template>
                                    <template v-else>
                                      <div class="cat-item-row">
                                        <label class="cat-item-left" style="align-items: flex-start;">
                                          <input type="checkbox" v-model="leaf.selected" @change="onCatalogueItemToggle(leaf)" style="margin-top: 4px;" />
                                          <div class="cat-item-content">
                                            <span class="cat-item-name">{{ leaf.name }}</span>
                                            <div class="cat-item-desc" v-if="leaf.description">
                                              {{ leaf.description }}
                                            </div>
                                          </div>
                                        </label>
                                        <div class="cat-item-actions">
                                          <button class="icon-btn" @click="showCatalogueInfo(leaf)" title="信息">
                                            <span class="icon-svg" v-html="infoSvg"></span>
                                          </button>
                                        </div>
                                      </div>
                                    </template>
                                  </div>
                                </div>
                              </div>
                           </template>
                           
                           <template v-else>
                              <div class="cat-item-row">
                                <label class="cat-item-left" style="align-items: flex-start;">
                                  <input type="checkbox" v-model="subItem.selected" @change="onCatalogueItemToggle(subItem)" style="margin-top: 4px;" />
                                  <div class="cat-item-content">
                                    <span class="cat-item-name">{{ subItem.name }}</span>
                                    <div class="cat-item-desc" v-if="subItem.description">
                                      {{ subItem.description }}
                                    </div>
                                  </div>
                                </label>
                                <div class="cat-item-actions">
                                  <button class="icon-btn" @click="showCatalogueInfo(subItem)" title="信息">
                                    <span class="icon-svg" v-html="infoSvg"></span>
                                  </button>
                                </div>
                              </div>
                           </template>
                        </div>
                      
                      </div>
                    </div>
                  </template>
                  
                  <template v-else>
                    <div class="cat-item-row">
                      <label class="cat-item-left">
                        <input type="checkbox" v-model="node.selected" @change="onCatalogueItemToggle(node)" style="margin-top: 4px;" />
                        <div class="cat-item-content">
                          <span class="cat-item-name">{{ node.name }}</span>
                          <div class="cat-item-desc" v-if="node.description">
                            {{ node.description }}
                          </div>
                        </div>
                      </label>
                      <div class="cat-item-actions">
                        <button class="icon-btn" @click="showCatalogueInfo(node)" title="信息">
                          <span class="icon-svg" v-html="infoSvg"></span>
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="data-more">
          更多数据集可在 
          <router-link :to="{ name: 'VoyageSearch' }" class="catalogue-link">航次</router-link>、
          <router-link :to="{ name: 'ChemSearch' }" class="catalogue-link">化学</router-link>、
          <router-link :to="{ name: 'BioSearch' }" class="catalogue-link">生物</router-link>
          查询中查看
        </div>
      </div> 
    </div>
    
    <div v-if="showClearConfirm" class="confirm-modal-overlay" role="dialog" aria-modal="true">
      <div class="confirm-modal">
        <div class="confirm-header">确认删除</div>
        <div class="confirm-body">确认清除所有数据吗？</div>
        <div class="confirm-actions">
          <button class="confirm-yes" @click="confirmClearAll">确认</button>
          <button class="confirm-no" @click="showClearConfirm = false">取消</button>
        </div>
      </div>
    </div>

    <div id="coordinateDisplay"
      style="position: absolute; bottom: 10px; right: 10px; z-index: 1200; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);">
      <p>经度: {{ currentCoordinates.lng }}</p>
      <p>纬度: {{ currentCoordinates.lat }}</p>
    </div>
  </div>
  <ImportAndExport :open="importOpen" @update:open="v => importOpen = v" @submitted="onImported" />
</template>

<script>
import { onMounted, ref, computed, reactive, watch, markRaw } from "vue";
import { useRouter } from "vue-router"; 
import screenfull from "screenfull";
import stationIcon3 from "@/assets/images/icon3.png";
import { openPhoto } from '@/utils/photo.js';
import BiologyStastic from "./BiologyStastic.vue";
import '@/assets/ali-font-icon/iconfont.css';
import ImportAndExport from './ImportAndExport.vue';
import MapControls from './MapControls.vue';
import MapQuickControls from './MapQuickControls.vue'; // 新增组件引入
import { applyTileLayerProxy } from '@/utils/tdt-proxy.js';
import { api } from '@/api/management.js';
import * as turf from '@turf/turf';
import { getBiologicalPage } from '@/api/management.js';

export default {
  name: "TianDiMap",
  components: { BiologyStastic, ImportAndExport, MapControls, MapQuickControls },
  setup() {
    const router = useRouter(); 
    
    const openIconSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M160 448h704v128H160zM160 256h704v128H160zM160 640h704v128H160z" fill="currentColor"></path></svg>`;
    const closeIconSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M512 456.3l243.5-243.5 55.7 55.7L567.7 512l243.5 243.5-55.7 55.7L512 567.7l-243.5 243.5-55.7-55.7L456.3 512 212.8 268.5l55.7-55.7L512 456.3z" fill="currentColor"></path></svg>`;
    const eyeOpenSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path fill="currentColor" d="M512 224c224 0 384 192 384 288s-160 288-384 288S128 608 128 512 288 224 512 224zm0 96c-141.4 0-269.6 102.7-316.7 192C242.4 601.3 370.6 704 512 704s269.6-102.7 316.7-192C781.6 422.7 653.4 320 512 320zm0 96a96 96 0 110 192 96 96 0 010-192z"/></svg>`;
    const eyeCloseSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path fill="currentColor" d="M160 160l704 704-45.3 45.3L114.7 205.3 160 160zM512 288c224 0 384 192 384 288 0 44.4-21.1 93.8-57.3 139.1l-67.3-67.3C792.8 601.9 816 555.5 816 576c0-64-160-224-304-224-20.5 0-39.9 2.6-58.1 7.5l-77.9-77.9C411.6 291.6 460 288 512 288zM208 448c0 64 160 224 304 224 23.3 0 45.7-3.2 66.9-9.1l78.6 78.6C617.5 760.4 567 768 512 768 288 768 128 576 128 480c0-40.3 19.7-85.1 53.8-127.1l72.9 72.9C226.2 429.5 208 460.6 208 448zm304-32a96 96 0 0187 139.7L432.3 389a95.7 95.7 0 0179.7-41z"/></svg>`;
    const arrowSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path fill="currentColor" d="M384 192l384 320-384 320z"/></svg>`;
    const infoSvg = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path fill="currentColor" d="M512 64a448 448 0 1 0 0 896 448 448 0 0 0 0-896zm0 128a64 64 0 1 1 0 128 64 64 0 0 1 0-128zm96 576H416v-64h64V480h-64v-64h192v288h64v64z"/></svg>`;

  
    const map = ref(null);
    const currentLayer = ref(null);
    const currentLabelLayer = ref(null);
    const activeLayer = ref('vec');
    const isDataPanelOpen = ref(false);
    const activeDataTab = ref('catalogue');

    const currentRenderedStationIds = new Set();
    const setDataTab = (tab) => { activeDataTab.value = tab; };
    const isRectToolOpen = ref(false);
    const isStasticOpen = ref(false);
    const biology = ref(null); 
    const currentCoordinates = ref({ lng: 0, lat: 0 });
    const showClearConfirm = ref(false);
    const importOpen = ref(false);

    const expandedCruises = ref({});
    const toggleCruise = (cruiseId) => {
      expandedCruises.value[cruiseId] = !expandedCruises.value[cruiseId];
    };
    
    // 辅助函数：根据类型返回徽章文字
    const getBadgeText = (type) => {
      if (type === 'biology') return '生';
      if (type === 'chemistry') return '化';
      return '样'; // 默认为样本
    };

    // 辅助函数：根据类型返回徽章样式类
    const getBadgeClass = (type) => {
      if (type === 'biology') return 'badge-bio';
      if (type === 'chemistry') return 'badge-chem';
      return 'badge-sample';
    };

    // 新增：存储航次信息的 Map (ID -> Name)
    const cruiseInfoMap = ref({});

    const currentTool = ref(''); 
    const rectTool = ref(null);
    const openImport = () => { importOpen.value = true; };
    const onImported = ({ count }) => {
      console.log('已导入并发送到后端条数：', count);
      alert(`已导入并发送 ${count} 条`);
    };


    const expandedFourth = ref({});
    const toggleCat4 = (id) => { expandedFourth.value[id] = !expandedFourth.value[id]; };
    // 用于快速查找站点节点以便插入样本
    const stationNodeMap = {}; 
    // 存储航次对应的文件夹节点，方便插入站点 { 'cruiseId_point': node, 'cruiseId_tow': node }
    const cruiseFolderMap = {};
    // 存储站点 Marker 的对象： { stationId: MarkerObject }
    const stationMarkers = {};
    const stationIdMap = ref({});
    const chemListCollapsed = ref({});

    // 存储站点数据（用于框选时遍历）
    const allLoadedStations = ref([]);

    const layerSearch = ref('');
    const layers = ref([
      { name: "航次数据", id: "layer_1", description: "与航次相关数据" },
      { name: "生物数据", id: "layer_2", description: "与生物相关数据" },
      { name: "化学数据", id: "layer_3", description: "与化学相关数据" },
    ]);

    const groupItems = reactive({
      layer_1: [], // 初始为空，等待加载航次
      layer_2: [],
      layer_3: []
    });

    const expanded = ref({});
    const expandedSecond = ref({});
    const expandedThird = ref({}); 
    const expandedStations = ref({});
    
    const toggleGroup = (groupId) => { expanded.value[groupId] = !expanded.value[groupId]; };
    const toggleCat = (catId) => { expandedSecond.value[catId] = !expandedSecond.value[catId]; };
    const toggleCat3 = (catId) => { expandedThird.value[catId] = !expandedThird.value[catId]; };
    
    const toggleStation = (stationName) => {
      
        expandedStations.value[stationName] = !expandedStations.value[stationName];
      
    };
    //包围圈的部分
    // --- 航次包围圈相关状态 ---
    const cruiseHulls = {}; // 存储地图上的覆盖物引用
    const cruiseHullVisibility = ref({}); // 存储显隐状态

    // 1. 切换航次包围圈的显隐
    const toggleCruiseHull = (cruiseId) => {
      const current = cruiseHullVisibility.value[cruiseId];
      cruiseHullVisibility.value[cruiseId] = !current;
      
      if (cruiseHullVisibility.value[cruiseId]) {
        drawCruiseHull(cruiseId);
      } else {
        removeCruiseHull(cruiseId);
      }
    };

    // 2. 清除指定航次的包围圈
    const removeCruiseHull = (cruiseId) => {
      if (!map.value || !cruiseHulls[cruiseId]) return;
      const { polygon, label } = cruiseHulls[cruiseId];
      if (polygon) map.value.removeOverLay(polygon);
      if (label) map.value.removeOverLay(label);
      delete cruiseHulls[cruiseId];
    };

    // 3. 绘制航次包围圈
    // 3. 绘制航次包围圈 (修复跨日界线 bug)
    const drawCruiseHull = (cruiseId) => {
      // 1. 如果显隐状态为 false，则不绘制
      if (cruiseHullVisibility.value[cruiseId] === false) return;
      
      // 2. 防止重复绘制
      if (cruiseHulls[cruiseId]) return;

      // 3. 获取该航次下所有已加载的站点
      // 必须使用 String 转换确保 ID 类型匹配
      const stations = allLoadedStations.value.filter(s => String(s.cruiseId) === String(cruiseId));
      if (stations.length === 0) return;

      // 4. 收集所有有效坐标点
      const points = [];
      stations.forEach(s => {
        let lng = s.longitude;
        let lat = s.latitude;
        
        // 处理拖网数据：如果主坐标为空，优先取起点
        if (lng == null || lat == null) { 
          lng = s.towStartLongitude;
          lat = s.towStartLatitude;
        }
        
        // 加入有效点
        if (lng != null && lat != null) {
          points.push([parseFloat(lng), parseFloat(lat)]);
        }
        
        // 始终检查并加入拖网终点 (拖网需要包含终点以构成完整的包围盒)
        if (s.towEndLongitude != null && s.towEndLatitude != null) {
          points.push([parseFloat(s.towEndLongitude), parseFloat(s.towEndLatitude)]);
        }
      });

      if (points.length === 0) return;

      // === [跨日界线处理核心逻辑 START] ===
      // 原理：如果点的经度极差超过 180 度 (如 -179 和 +179)，说明跨越了日界线。
      // 此时将负经度临时加 360 度 (变成 181+)，使其在数学上连续，便于计算凸包。
      const lons = points.map(p => p[0]);
      const maxLon = Math.max(...lons);
      const minLon = Math.min(...lons);
      const isCrossingDateLine = (maxLon - minLon) > 180;

      // 转换为 Turf Feature Collection，并根据情况对经度进行投影修正
      const turfPoints = points.map(p => {
        let lng = p[0];
        if (isCrossingDateLine && lng < 0) {
          lng += 360; 
        }
        return turf.point([lng, p[1]]);
      });
      // === [跨日界线处理核心逻辑 END] ===

      let geometryToBuffer;
      try {
        if (turfPoints.length === 1) {
             geometryToBuffer = turfPoints[0];
        } else if (turfPoints.length === 2) {
             // 两点构成线
             geometryToBuffer = turf.lineString(turfPoints.map(p => p.geometry.coordinates));
        } else {
             // 三点以上计算凸包
             geometryToBuffer = turf.convex(turf.featureCollection(turfPoints));
        }
      } catch (e) { 
        console.warn('计算包围圈失败:', e);
        return; 
      }

      if (!geometryToBuffer) return;

      // 创建缓冲区 (例如 5km)，让包围圈稍微大一点，不那么贴合
      const bufferDistance = 5; 
      const bufferedHull = turf.buffer(geometryToBuffer, bufferDistance, { units: 'kilometers' });
      if (!bufferedHull) return;

      // 转换坐标供天地图使用
      // 注意：天地图 API 通常能正确渲染 >180 的经度，无需还原回负值
      const coords = bufferedHull.geometry.coordinates[0].map(p => new T.LngLat(p[0], p[1]));
      
      const polygon = new T.Polygon(coords, {
        color: "#409EFF", weight: 2, opacity: 0.6, 
        fillColor: "#409EFF", fillOpacity: 0.05, lineStyle: "dashed"
      });
      map.value.addOverLay(polygon);

      // 绘制标签
      // 使用修正后的 geometry 计算 bbox 中心，确保标签显示在包围圈上方正中
      const bbox = turf.bbox(bufferedHull);
      const topCenterLng = (bbox[0] + bbox[2]) / 2;
      const topCenterLat = bbox[3];

      const cruiseInfo = cruiseInfoMap.value[cruiseId] || {};
      let labelText = cruiseInfo.name || `航次 ${cruiseId}`;
      if (cruiseInfo.researchVessel) {
        labelText += `<br/><span style="font-size:11px;">(船只: ${cruiseInfo.researchVessel})</span>`;
      }
      
      const label = new T.Label({
        text: `<div style="font-size:12px; color:#666; background:rgba(255,255,255,0.85); padding:4px 8px; border-radius:4px; border:1px solid #e0e0e0; text-align:center;">${labelText}</div>`,
        position: new T.LngLat(topCenterLng, topCenterLat),
        offset: new T.Point(0, -35)
      });
      label.setBackgroundColor("transparent");
      label.setBorderColor("transparent");
      map.value.addOverLay(label);

      // 存储引用以便后续移除
      cruiseHulls[cruiseId] = { polygon, label };
    };

    // 4. 核心：监听选中数据的变化，自动管理包围圈
    

    
    //加载航次
    const loadCruises = async () => {
      console.log("开始加载航次数据...");
      let allCruises = [];
      const pageSize = 99;
      let currentPage = 0;
      let hasMore = true;

      try {
        while(hasMore) {
          const params = { page: currentPage, size: pageSize };
          const res = await api.cruises.page(params);
          const list = res.data || [];

          if (list.length > 0) {
            allCruises = allCruises.concat(list);
            currentPage++;
            if (list.length < pageSize) hasMore = false;
          } else {
            hasMore = false;
          }
        }

        // 构建目录树 & 填充 Map
        const cruiseNodes = [];
        allCruises.forEach(cruise => {
          const cId = String(cruise.id);
          const cName = cruise.cruiseName || `航次 ${cId}`;

          // [修改点]：存入 researchVessel 信息
          cruiseInfoMap.value[cId] = {
             id: cId,
             name: cName,
             researchVessel: cruise.researchVessel, // 存这个字段供标签使用
             count: 0
          };

          // 建立分类文件夹
          const pointFolder = { id: `cruise_${cId}_point`, name: '点采样', children: [] };
          const towFolder = { id: `cruise_${cId}_tow`, name: '拖曳采样', children: [] };

          cruiseFolderMap[`${cId}_point`] = pointFolder;
          cruiseFolderMap[`${cId}_tow`] = towFolder;

          cruiseNodes.push({
            id: `cruise_${cId}`,
            name: cName,
            children: [pointFolder, towFolder],
            description: cruise.researchVessel ? `科考船: ${cruise.researchVessel}` : ''
          });
        });

        groupItems.layer_1 = cruiseNodes;
        return allCruises.map(c => c.id); 

      } catch (e) {
        console.error("加载航次失败:", e);
        return [];
      }
    };


    const isStationVisible = (group) => {
      if (!group || !group.items) return false;
        // 只要有一个是 visible=true，显示为开启状态
        return group.items.some(item => item.visible);
      };

    // 切换整个站点的显隐
    // 切换整个站点的显隐
    const toggleStationVisibility = (group) => {
      if (!group || !group.items||group.items.length === 0) return;
      
      const currentVisible = isStationVisible(group);
      const targetState = !currentVisible;

      // 1. 核心修复：同步更新【原始数据】和【视图数据】
      group.items.forEach(viewItem => {
        // A. 更新当前视图中的临时对象（保证 UI 立即响应）
        viewItem.visible = targetState;

        // B. 查找并更新原始数据源（保证状态持久化，防止回滚）
        // activeLayerItems 包含所有被选中的原始数据引用
        const originalItem = activeLayerItems.value.find(item => item.id === viewItem.id);
        if (originalItem) {
          originalItem.visible = targetState;
        }

        // C. 同步更新关联的化学数据（如果存在）
        // viewItem.chemChildren 引用的是筛选后的原始化学数据，直接更新即可
        if (viewItem.chemChildren && viewItem.chemChildren.length > 0) {
          viewItem.chemChildren.forEach(chem => {
            chem.visible = targetState;
          });
        }
      });

      // 2. 更新地图显示 (保持原有逻辑，利用缓存 Marker 提高性能)
      const stationId = String(group.items[0].stationId);
      const markers = stationMarkers[stationId];

      if (markers) {
        const overlays = Array.isArray(markers) ? markers : [markers];
        
        if (targetState) {
          // 显示：检查是否已经在地图上，不在则添加
          if (!currentRenderedStationIds.has(stationId)) {
            overlays.forEach(o => map.value.addOverLay(o));
            currentRenderedStationIds.add(stationId);
          }
        } else {
          // 隐藏：直接移除
          overlays.forEach(o => map.value.removeOverLay(o));
          currentRenderedStationIds.delete(stationId);
        }
      }
    };
    //航次中站点的跳转
    const jumpSvg = `<svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M754.956 436.142l-665.463 0c-19.352 0-35.04 15.688-35.04 35.04 0 19.352 15.688 35.04 35.04 35.04l665.463 0c19.352 0 35.04-15.688 35.04-35.04C789.996 451.83 774.308 436.142 754.956 436.142z" fill="#272636" /><path d="M679.332 285.982c-13.681-13.681-35.863-13.681-49.544 0-13.681 13.681-13.681 35.863 0 49.544l126.644 126.644c6.84 6.84 15.806 10.261 24.772 10.261 8.966 0 17.932-3.42 24.772-10.261l126.644-126.644c13.681-13.681 13.681-35.863 0-49.544-13.681-13.681-35.863-13.681-49.544 0L733.044 435.66 679.332 285.982z" fill="#272636" /><path d="M832.62 603.261c-13.681-13.681-35.863-13.681-49.544 0L733.044 752.943 679.332 603.261c-13.681-13.681-35.863-13.681-49.544 0-13.681 13.681-13.681 35.863 0 49.544l126.644 126.644c6.84 6.84 15.806 10.261 24.772 10.261 8.966 0 17.932-3.42 24.772-10.261l126.644-126.644C846.301 639.124 846.301 616.942 832.62 603.261z" fill="#272636" /></svg>`;

    // [新增 2] 定义跳转到站点详情页的方法
    const viewStationDetail = (stationGroup) => {
      // stationGroup 是数据面板中分组好的对象，包含 stationId
      if (stationGroup && stationGroup.stationId) {
        // 直接使用 router.push 跳转到详情页路由，携带 id 参数
        // 这样可以避开航次查询页的选择流程
        router.push({
          name: 'VoyageDetail',
          params: { id: stationGroup.stationId }
        });
      }
    };

    const isStationExpanded = (stationName) => {
      return expandedStations.value[stationName] === true;
    };

    // --- 选择工具相关变量 ---
    //生物数据
    const loadBioData = async () => {
      console.log("开始加载生物数据...");
      let allBioData = [];
      const pageSize = 99; // 前端期望请求 99 条
      let currentPage = 0; // 后端 page 从 0 开始
      let hasMore = true;
      const MAX_PAGES = 100; // 安全限制，防止死循环

      try {
        while (hasMore && currentPage < MAX_PAGES) {
          const params = {
            page: currentPage,
            size: pageSize
          };
          
          // 发送请求
          const res = await getBiologicalPage(params);
          
          if (res && res.code === 200) {
            const list = res.data || [];
            const total = res.total || 0; // 获取总条数
            
            if (list.length > 0) {
              allBioData = allBioData.concat(list);
              currentPage++; // 准备下一次请求
              
              // 【核心修复】：使用已获取的总数 vs 后端总数 total 来判断
              if (allBioData.length >= total) {
                hasMore = false;
              }
            } else {
              // 如果返回空列表，肯定结束了
              hasMore = false;
            }
          } else {
            console.error("生物数据请求异常:", res);
            hasMore = false;
          }
        }

        console.log(`共加载生物数据 ${allBioData.length} 条`);

        // 构建前端目录树结构
        const bioNodes = allBioData.map(item => {
          // 构造显示名称：优先使用 学名，其次 样品名，最后用 ID 兜底
          const displayName = item.scientificName || item.sampleName || `生物记录 ${item.id}`;
          
          return {
            id: `bio_${item.id}`,       // 唯一ID
            originalId: item.id,        // 原始ID
            name: displayName,          // 显示名称
            type: 'biology',            // 类型标记
            stationId: item.stationId,  // 关联站点ID
            sampleId: item.sampleId,    // 关联样本ID
            // 描述信息：界/门/纲
            description: `${item.taxaKingdom || ''} / ${item.taxaPhylum || ''} / ${item.taxaClass || ''}`, 
            selected: false,            // 默认不选中
            visible: true               // 选中后默认可见
          };
        });

        // 更新到 layer_2
        groupItems.layer_2 = [{
          id: 'bio_all_folder',
          name: `全部生物数据 (${allBioData.length})`, // 文件夹名显示总数，方便确认
          children: bioNodes
        }];

      } catch (e) {
        console.error("加载生物数据失败:", e);
        groupItems.layer_2 = []; 
      }
    };

    //化学数据
    const loadChemData = async () => {
      console.log("开始加载化学数据...");
      let allChems = [];
      const pageSize = 99;
      let currentPage = 0; 
      let hasMore = true;
      const MAX_PAGES = 5; // 安全限制：防止死循环

      try {
        while (hasMore && currentPage < MAX_PAGES) {
          const params = {
            size: pageSize,
            page: currentPage
          };
          
          const res = await api.chemResults.page(params);
          const list = res.data || [];
          
          if (list.length === 0) {
            hasMore = false;
          } else {
            allChems = allChems.concat(list);
            currentPage++;
            if (list.length < pageSize) hasMore = false;
          }
        }
        
        if (currentPage >= MAX_PAGES) {
            console.warn("达到化学数据最大页数限制，停止加载");
        }

        // 构建 sampleId -> sampleName 映射，用于查找关联样本名称
        const sampleIdToName = {};
        const collectSamples = (nodes) => {
          if (!nodes) return;
          nodes.forEach(node => {
            if (node.children) {
              collectSamples(node.children);
            } else {
              // 假设叶子节点是 Sample (或者根据是否有 sampleId 判断)
              if (node.sampleId) {
                sampleIdToName[node.sampleId] = node.name || node.sampleName;
              }
            }
          });
        };
        // 遍历 layer_1 (Samples)
        if (groupItems.layer_1) {
           collectSamples(groupItems.layer_1);
        }

        const chemRoot = [];
        allChems.forEach(chem => {
          const stId = chem.stationId;
          const stName = stationIdMap.value[stId] || `未知站点(ID:${stId})`;

          let displayName = chem.analyticalTechnique || '未知分析项';
          if (chem.totalOrDissolved) displayName += ` - ${chem.totalOrDissolved}`;
          if (chem.ctdDepth !== undefined) displayName += ` (${chem.ctdDepth}m)`;
          
          // 获取关联的 Sample Name (通过 sampleId)
          const derivedFromName = sampleIdToName[chem.sampleId] || chem.sampleName || '未知样本';
          const desc = `来源于：${derivedFromName}  样本ID：${chem.sampleId ?? '-'}`;

          chemRoot.push({
            id: `chem_${chem.id}`,
            name: displayName, 
            originalId: chem.id,
            sampleName: derivedFromName,
            sampleId: chem.sampleId, // 存储 sampleId 用于关联
            stationId: chem.stationId,
            stationName: stName, 
            analyticalTechnique: chem.analyticalTechnique,
            ctdDepth: chem.ctdDepth,
            totalOrDissolved: chem.totalOrDissolved,
            selected: false,
            visible: true,
            description: desc, // 显示关联的样本名称
            type: 'chemistry' 
          });
        });

        groupItems.layer_3 = [{
          id: 'chem_all_folder',
          name: '全部化学数据',
          children: chemRoot
        }];

      } catch (e) {
        console.error("加载化学数据失败:", e);
      }
    };

    const filterNodes = (nodes, query) => {
      if (!nodes) return [];
      const res = [];
      for (const node of nodes) {
        const nameHit = (node.name || '').toLowerCase().includes(query);
        if (Array.isArray(node.children) && node.children.length) {
          const hitChildren = filterNodes(node.children, query);
          if (hitChildren.length > 0) {
            if (nameHit) res.push(node);
            else res.push({ ...node, children: hitChildren });
          } else if (nameHit) {
             res.push(node);
          }
        } else {
          if (nameHit) res.push(node);
        }
      }
      return res;
    };

    const filteredCatalogue = computed(() => {
      const q = (layerSearch.value || '').trim().toLowerCase();
      if (!q) return layers.value;
      return layers.value.filter(g => {
        const nodes = groupItems[g.id] || [];
        const hitNodes = filterNodes(nodes, q);
        return hitNodes.length > 0 || g.name.toLowerCase().includes(q);
      });
    });

    const filteredGroupTree = computed(() => {
      const q = (layerSearch.value || '').trim().toLowerCase();
      const tree = {};
      for (const g of layers.value) {
        const nodes = groupItems[g.id] || [];
        if (!q) tree[g.id] = nodes;
        else tree[g.id] = filterNodes(nodes, q);
      }
      return tree;
    });

    const getLeafs = (nodes) => {
      let res = [];
      if (!nodes) return res;
      nodes.forEach(n => {
        if (Array.isArray(n.children) && n.children.length) {
          res = res.concat(getLeafs(n.children));
        } else {
          res.push(n);
        }
      });
      return res;
    };

    const getAllLeafItems = () => {
      const allNodes = [];
      Object.values(groupItems).forEach(groupNodes => {
        allNodes.push(...groupNodes);
      });
      return getLeafs(allNodes);
    };

    watch(layerSearch, (val) => {
      const q = (val || '').trim().toLowerCase();
      if (!q) { 
        expanded.value = {}; 
        expandedSecond.value = {}; 
        expandedThird.value = {};
        return; 
      }
      for (const g of layers.value) {
        const nodes = filteredGroupTree.value[g.id] || [];
        if (nodes.length) expanded.value[g.id] = true;
        const traverseExpand = (items) => {
          items.forEach(item => {
            if (item.children && item.children.length) {
              expandedSecond.value[item.id] = true;
              expandedThird.value[item.id] = true; 
              traverseExpand(item.children);
            }
          });
        };
        traverseExpand(nodes);
      }
    });

    const activeLayerItems = computed(() => {
      return getAllLeafItems().filter(n => n.selected);
    });

    // src/components/TiandiMap/management.vue

    const groupedActiveLayerItems = computed(() => {
        const activeItems = activeLayerItems.value;
        
        // 1. 准备站点映射 Map (ID -> Station Object)
        const stationMap = new Map();
        (allLoadedStations.value || []).forEach(st => {
           if (st.id) stationMap.set(String(st.id), st);
        });

        // 2. 提取所有选中的化学数据，并去重
        const allChems = activeItems.filter(i => i.type === 'chemistry');
        const uniqueChemsMap = new Map();
        allChems.forEach(c => uniqueChemsMap.set(String(c.originalId || c.id), c));
        const uniqueChems = Array.from(uniqueChemsMap.values());
        
        // 用于记录哪些化学数据已经被挂载到了样本下
        const usedChemIds = new Set();

        // 3. 准备结果容器
        const cruiseGroups = {};
        const UNKNOWN_CRUISE_ID = 'UNKNOWN_CRUISE';
        const UNKNOWN_STATION_ID = 'UNKNOWN_STATION';

        // --- 辅助函数：将条目添加到分组 ---
        const addToGroup = (item) => {
            // 获取站点信息
            const stId = String(item.stationId || UNKNOWN_STATION_ID);
            const stationObj = stationMap.get(stId);
            const stName = stationObj ? (stationObj.pointName || stationObj.towName || `站点 ${stId}`) : '未知站点';

            // 获取航次信息
            let cId = UNKNOWN_CRUISE_ID;
            if (stationObj && stationObj.cruiseId) {
               cId = String(stationObj.cruiseId);
            }
            // 尝试获取航次名称
            const cName = cruiseInfoMap.value[cId] ? cruiseInfoMap.value[cId].name : (cId === UNKNOWN_CRUISE_ID ? '其他数据' : `航次 ${cId}`);

            // 初始化航次组
            if (!cruiseGroups[cId]) {
                cruiseGroups[cId] = { id: cId, name: cName, stations: {}, totalCount: 0 };
            }
            // 初始化站点组
            if (!cruiseGroups[cId].stations[stId]) {
                cruiseGroups[cId].stations[stId] = { stationId: stId, stationName: stName, items: [] };
            }

            cruiseGroups[cId].stations[stId].items.push(item);
            cruiseGroups[cId].totalCount++;
        };

        // 4. 处理非化学数据 (样本、生物数据)
        // 这些作为主要条目显示
        const nonChems = activeItems.filter(i => i.type !== 'chemistry');
        
        nonChems.forEach(item => {
            // 浅拷贝对象，避免修改原始数据
            const viewItem = { ...item, chemChildren: [] };
            
            // 尝试查找该条目下属的化学数据 (通常是 Sample -> Chemistry)
            const parentId = String(item.sampleId || item.id);
            
            // 在所有选中的化学数据中查找匹配项
            const matching = uniqueChems.filter(c => String(c.sampleId) === parentId);
            
            if (matching.length > 0) {
                viewItem.chemChildren = matching;
                // 标记这些化学数据已被使用
                matching.forEach(m => usedChemIds.add(String(m.originalId || m.id)));
            }

            addToGroup(viewItem);
        });

        // 5. 处理“孤儿”化学数据
        // 如果化学数据被选中，但没找到父样本（或者父样本没被选中），它应该作为独立条目显示
        uniqueChems.forEach(chem => {
            const chemId = String(chem.originalId || chem.id);
            if (!usedChemIds.has(chemId)) {
                addToGroup(chem);
            }
        });

        // 6. 格式化输出 (对象转数组)
        return Object.values(cruiseGroups).map(cruise => {
            return {
                ...cruise,
                stationList: Object.values(cruise.stations).filter(s => s.items.length > 0)
            };
        }).filter(c => c.stationList.length > 0);
    });

    watch(groupedActiveLayerItems, (newGroups) => {
      const activeCruiseIds = new Set(newGroups.map(g => String(g.id)));

      // A. 移除：如果某个航次不再处于选中列表（即没有站点被选中），则移除包围圈
      Object.keys(cruiseHulls).forEach(cId => {
        if (!activeCruiseIds.has(cId)) {
          removeCruiseHull(cId);
        }
      });

      // B. 新增：如果某个航次被选中了（且包围圈还没画），则画出来
      activeCruiseIds.forEach(cId => {
        // 初始化显隐状态：如果是第一次出现，默认为 true (显示)
        if (cruiseHullVisibility.value[cId] === undefined) {
          cruiseHullVisibility.value[cId] = true;
        }
        // 尝试绘制
        drawCruiseHull(cId);
      });
    }, { deep: true, immediate: true });

    watch(activeLayerItems, (newItems) => {
      // 1. 筛选出所有被选中的化学数据 item
      const selectedChems = newItems
        .filter(item => item.type === 'chemistry') 
        .map(item => ({
          id: item.originalId,         // 原始数据库 ID
          name: item.name,             // 显示名称
          sampleName: item.sampleName, // 关联样本名
          stationId: item.stationId,   // 站点ID
          sampleId: item.sampleId      // 样本ID
        }));
      
      // 2. 存入 SessionStorage (Key 必须与 chemsearch 页面读取的一致)
      sessionStorage.setItem('MANAGEMENT_SELECTED_CHEMS', JSON.stringify(selectedChems));
      
      // (可选) 打印日志方便调试
      console.log('同步化学数据到缓存:', selectedChems.length, '条');
    }, { deep: true, immediate: true });

    // --- 核心逻辑更新：更新地图上的 Marker 显示 ---
    const updateMapMarkers = () => {
      if (!map.value) return;

      const targetVisibleIds = new Set();
      const activeItems = activeLayerItems.value;
      
      activeItems.forEach(sample => {
        // 只有被勾选(selected) 且 可见(visible) 的才需要显示
        // 注意：这里用 String 统一 ID 类型，防止数字/字符串不匹配
        if (sample.visible && sample.type !== 'chemistry') {
          targetVisibleIds.add(String(sample.stationId));
        }
      });

      // 2. 找出需要“移除”的 (在地图上但不在目标里的)
      for (const id of currentRenderedStationIds) {
        if (!targetVisibleIds.has(id)) {
          const markers = stationMarkers[id];
          if (markers) {
            const overlays = Array.isArray(markers) ? markers : [markers];
            overlays.forEach(o => map.value.removeOverLay(o));
          }
          currentRenderedStationIds.delete(id);
        }
      }

      // 3. 找出需要“添加”的 (在目标里但不在地图上的)
      for (const id of targetVisibleIds) {
        if (!currentRenderedStationIds.has(id)) {
          const markers = stationMarkers[id];
          if (markers) {
            const overlays = Array.isArray(markers) ? markers : [markers];
            overlays.forEach(o => map.value.addOverLay(o));
            currentRenderedStationIds.add(id);
          }
        }
      }
    };

    // 目录勾选回调
    const onCatalogueItemToggle = (item, overrideState) => {
      if (typeof overrideState === 'boolean') {
        item.selected = overrideState;
      }
      
      // 默认勾选时可见
      if (item.selected) {
        item.visible = true; 
      }

      // 改为使用 sampleId
      const targetSampleId = item.sampleId;
      if (!targetSampleId) {
        updateMapMarkers();
        return;
      }

      // 级联选择逻辑（改为使用 sampleId）
      const isSelected = item.selected;
      const traverseAndSync = (nodes) => {
        nodes.forEach(node => {
           if (node.children && node.children.length) {
             traverseAndSync(node.children);
           } else {
           
               // 使用 sampleId 匹配
               if (node.sampleId && String(node.sampleId) === String(targetSampleId)) {
                 if (node.selected !== isSelected) {
                   node.selected = isSelected;
                   if (isSelected) node.visible = true; // 级联勾选时也设为可见
                 }
               }
             }
           
        });
      };

      const allGroups = [groupItems.layer_1, groupItems.layer_3]; 
      allGroups.forEach(group => traverseAndSync(group));

      // 更新地图 Marker
      updateMapMarkers();
    };
    
    // 眼睛图标切换显隐（不改变 selected）
    const toggleLayerVisibility = (item) => {
       item.visible = !item.visible;
       updateMapMarkers();
    };

    // 显示/隐藏所有
    function toggleAllLayers() {
      const list = getList();
      if (!list.length) return;
      if (allHidden.value) {
        list.forEach(it => { it.visible = true; });
      } else {
        list.forEach(it => { it.visible = false; });
      }
      updateMapMarkers();
    }

    // 清除所有选择（取消勾选）
    const confirmClearAll = () => {
      try {
        const all = getAllLeafItems();
        all.forEach(item => {
          item.selected = false;
          item.visible = false;
        });
        updateMapMarkers();
      } catch (e) {
        console.error('清除所有图层失败：', e);
      } finally {
        showClearConfirm.value = false;
      }
    };

    const centerOnLayer = (item) => {
      if (item._stationCoords && map.value) {
         const { lng, lat } = item._stationCoords;
         if (lng != null && lat != null) {
           const point = new T.LngLat(lng, lat);
           map.value.panTo(point);
           if (map.value.getZoom() < 12) {
             map.value.setZoom(12);
           }
         }
      }
    };

    const loadSamplesForStations = async (stations) => {
      // 并发控制
      const CHUNK_SIZE = 5;

      const processStation = async (station) => {
        // 1. 从 Map 中直接找到该站点在目录树中的节点
        const stationNode = stationNodeMap[station.id];
        if (!stationNode) return; // 如果目录里没有这个站点节点，就跳过

        const params = {
          size: 99,
          page: 0, 
          stationId: station.id,
          pointName: station.pointName || "",
          towName: station.towName || "",
          sampleName: ""
        };

        try {
          const res = await api.samples.queryByStationNames(params);
          const samples = Array.isArray(res.data) ? res.data : [];

          if (samples.length > 0) {
            samples.forEach(sample => {
              const rawName = sample.sampleName || sample.sampleCode || '未命名样本';
              const sampleItem = {
                id: sample.id || `sample_${Math.random()}`,
                sampleId: sample.id, 
                stationId: station.id, 
                name: rawName,
                sampleName: rawName, 
                stationName: stationNode.name, 
                selected: false,
                visible: true,
                opacity: 1,
                description: sample.description,
                _stationCoords: {
                  lng: station.longitude || station.towStartLongitude,
                  lat: station.latitude || station.towStartLatitude
                },
                chemChildren: []
              };
              // 直接推入站点节点的 children
              stationNode.children.push(sampleItem);
            });
          }
        } catch (e) {
          console.warn(`获取站点 ${station.id} 的样本失败:`, e);
        }
      };

      // 分批处理
      for (let i = 0; i < stations.length; i += CHUNK_SIZE) {
        const chunk = stations.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(s => processStation(s)));
      }
    };

    const loadStations = async () => {
      
      if (!map.value) return;

      // 1. 先加载航次
      const cruiseIds = await loadCruises();
      if (cruiseIds.length === 0) {
        console.warn("未获取到航次信息，无法加载关联站点");
        // 如果没有航次，是否需要加载无航次站点？根据需求，这里暂时只加载有航次的。
        return;
      }

      console.log("开始加载站点数据 (关联航次)...");

      let allStations = [];
      const pageSize = 99;
      let currentPage = 0;
      let hasMore = true;
      const MAX_PAGES = 100; // 防止过多

      try {
        while (hasMore && currentPage < MAX_PAGES) {
          // 修改：加入 cruiseIds 参数
          const params = {
            page: currentPage,
            size: pageSize,
            pointName: "",
            towName: "",
            sampleName: "",
            cruiseIds: cruiseIds 
          };

          const res = await api.stations.page(params);
          const list = Array.isArray(res) ? res : (res.data || []);

          if (list.length === 0) {
            hasMore = false;
          } else {
            allStations = allStations.concat(list);
            currentPage++;
            // 如果有 pages 字段，也可以用来判断
            if (res.pages && currentPage >= res.pages) hasMore = false;
            if (list.length < pageSize) hasMore = false;
          }
        }

        allLoadedStations.value = allStations;

        // 分配站点到对应的航次文件夹中
        allStations.forEach(st => {
          stationIdMap.value[st.id] = st.pointName || st.towName || `Station ${st.id}`;

          // 找到对应的父级文件夹 (点 or 拖)
          // 假设 stationType 为 'Point' 或 'Tow'，或者根据是否有 towStart... 判断
          const isTow = st.stationType === 'Tow' || (st.towStartLatitude != null);
          const typeKey = isTow ? 'tow' : 'point';
          const folderKey = `${st.cruiseId}_${typeKey}`;

          const targetFolder = cruiseFolderMap[folderKey];

          if (targetFolder) {
            // 创建站点节点
            const stationNode = {
              id: `st_folder_${st.id}`,
              name: st.pointName || st.towName || `站点 ${st.id}`,
              children: [], // 待放入样本
              selected: false,
              // 可以在这里加一些站点详情
              description: `经度:${st.longitude || st.towStartLongitude}, 纬度:${st.latitude || st.towStartLatitude}`
            };

            // 存入 stationNodeMap，供 loadSamplesForStations 使用
            stationNodeMap[st.id] = stationNode;

            targetFolder.children.push(stationNode);
          }
        });
        
        if (groupItems.layer_1) {
      groupItems.layer_1.forEach(cruiseNode => {
        if (cruiseNode.children && Array.isArray(cruiseNode.children)) {
          // 只保留 children 数组不为空的文件夹
          cruiseNode.children = cruiseNode.children.filter(folder => 
            folder.children && folder.children.length > 0
          );
        }
      });
    }


        renderStations(allStations); 
        await loadSamplesForStations(allStations);
        await Promise.all([loadChemData(), loadBioData()]); // 同时加载化学数据和生物数据

      } catch (e) {
        console.error("加载站点数据失败:", e);
      }
    };

    // --- 修改：renderStations 不再直接添加到地图 ---

    const renderStations = (list) => { 
      if (!list || list.length === 0) return;

      list.forEach(item => {
        try {
          // 用于收集该站点的所有覆盖物（包括本尊和左右分身）
          let allOverlays = []; 

          // 定义三个偏移量：原始位置(0)，右侧世界(+360)，左侧世界(-360)
          const longitudeOffsets = [0, 360, -360];

          longitudeOffsets.forEach(offset => {
            // --- 1. Point 类型 ---
            if (item.stationType === 'Point' || (!item.towStartLatitude && item.latitude)) {
               if (item.longitude != null && item.latitude != null) {
                 // 计算偏移后的经度
                 const finalLng = parseFloat(item.longitude) + offset;
                 const point = new T.LngLat(finalLng, item.latitude);
                 
                 const icon = new T.Icon({
                   iconUrl: stationIcon3,
                   iconSize: new T.Point(25, 25),
                   iconAnchor: new T.Point(12, 25),
                 });
                 
                 // 只创建对象，不要 map.value.addOverLay(marker)！
                 // 等用户勾选目录时，updateMapMarkers 会负责添加它
                 const marker = markRaw(new T.Marker(point, { icon }));
                 addInfoWindow(marker, item, 'Point');
                 
                 allOverlays.push(marker);
               }
            } 
            // --- 2. Tow 类型 ---
            else if (item.stationType === 'Tow' || (item.towStartLatitude && item.towEndLatitude)) {
               if (item.towStartLongitude != null && item.towStartLatitude != null &&
                   item.towEndLongitude != null && item.towEndLatitude != null) {
                   
                   const startLng = parseFloat(item.towStartLongitude) + offset;
                   const endLng = parseFloat(item.towEndLongitude) + offset;

                   const startPoint = new T.LngLat(startLng, item.towStartLatitude);
                   const endPoint = new T.LngLat(endLng, item.towEndLatitude);

                   const startMarker = markRaw(new T.Marker(startPoint, { 
                     icon: new T.Icon({ iconUrl: stationIcon3, iconSize: new T.Point(25, 25), iconAnchor: new T.Point(12, 25) })
                   }));
                   addInfoWindow(startMarker, item, 'Tow (起点)');

                   const endMarker = markRaw(new T.Marker(endPoint, { 
                     icon: new T.Icon({ iconUrl: stationIcon3, iconSize: new T.Point(20, 20), iconAnchor: new T.Point(10, 20) })
                   }));
                   addInfoWindow(endMarker, item, 'Tow (终点)');

                   const line = new T.Polyline([startPoint, endPoint], {
                     color: "#0000FF", weight: 3, opacity: 0.7, lineStyle: "dashed" 
                   });

                   allOverlays.push(startMarker, endMarker, line);
               }
            }
          });

          // 将包含所有分身的数组存入 Map
          if (allOverlays.length > 0) {
            stationMarkers[item.id] = allOverlays;
          }

        } catch (err) {
          console.warn("渲染站点出错:", item, err);
        }
      });
    };






    const addInfoWindow = (overlay, item, typeLabel) => {
      const infoWindow = new T.InfoWindow();
      const name = item.pointName || item.towName || `Station ${item.id}`;
      const desc = item.pointDescription || item.towDescription || '暂无描述';
      const content = `
        <div style="font-family: Arial, sans-serif; padding: 10px; width:240px; font-size:13px;">
          <h4 style="margin:0 0 6px; color:#0b57a4;">${name}</h4>
          <p style="margin:2px 0;">类型: <span style="font-weight:bold;">${item.stationType || typeLabel}</span></p>
          <p style="margin:2px 0;">描述: ${desc}</p>
          <hr style="margin:6px 0; border:0; border-top:1px dashed #ccc;" />
          ${ 
            (item.stationType === 'Point' || typeLabel === 'Point') 
            ? `<p>经度: ${item.longitude}</p><p>纬度: ${item.latitude}</p>` 
            : `<p>起点: [${item.towStartLongitude}, ${item.towStartLatitude}]</p>
               <p>终点: [${item.towEndLongitude}, ${item.towEndLatitude}]</p>`
          }
          <p style="margin:2px 0; color:#666;">更新时间: ${item.updatedTime ? item.updatedTime.split('T')[0] : '-'}</p>
        </div>
      `;
      infoWindow.setContent(content);
      overlay.addEventListener("click", () => {
        let pos;
        if (overlay.getLngLat) pos = overlay.getLngLat();
        else if (overlay.getLngLats) pos = overlay.getLngLats()[0];
        if(pos) map.value.openInfoWindow(infoWindow, pos);
      });
    };
    
    // 移除原有 addLayerToMap, removeLayerFromMap, hideAllLayers 的直接调用，
    // 改为通过更改 selected/visible 状态后调用 updateMapMarkers 统一处理

    const showCatalogueInfo = (catalogueItem) => {
      console.log('显示目录项信息:', catalogueItem);
    };

    const viewSampleDetail = (item) => {
      console.log("跳转到采样点详情, stationId:", item.stationId);
      if (router && item.stationId) {
        try {
           router.push(`/voyagesearch/detail/${item.stationId}`); 
        } catch (e) {
           console.error("路由跳转失败", e);
        }
      }
    };

    // src/components/TiandiMap/management.vue 中的 viewChemDetail 函数

const viewChemDetail = (chem) => {
  console.log("跳转到化学数据详情, chemId:", chem.originalId);
  if (router && chem.originalId) {
    try {
       // 修改：使用对象形式跳转，并携带 query 参数
       router.push({
         path: `/main/chemsearch/${chem.originalId}`,
         query: {
           stationId: chem.stationId,
           sampleId: chem.sampleId
         }
       });
    } catch (e) {
       console.error("路由跳转失败", e);
    }
  }
};

    const toggleFullscreen = () => {
      if (screenfull.isEnabled) screenfull.toggle(document.getElementById("mapContainer"));
      else alert("浏览器不支持全屏模式！");
    };
    const toggleDatama = () => {
      isDataPanelOpen.value = !isDataPanelOpen.value;
    };
    
    const switchMap = (type) => {
      if (!map.value) return;
      
      if (currentLayer.value) {
        try { map.value.removeLayer(currentLayer.value); } catch(e){}
      }
      if (currentLabelLayer.value) {
        try { map.value.removeLayer(currentLabelLayer.value); } catch(e){}
      }
      
      let layerUrl = '', labelLayerUrl = '';
      const mapMaxZoom = 18; 
      const mapMinZoom = 3;
      let nativeMaxZoom = 18;

      if(type === 'vec') {
         layerUrl = "https://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
         labelLayerUrl = "https://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
      } else if(type === 'img') {
         layerUrl = "https://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
         labelLayerUrl = "https://t0.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
      } else if (type === 'ter') {
         layerUrl = "https://t0.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
         labelLayerUrl = "https://t0.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=db74e3389d27b4b68914d84fd152f1b8";
      } else if (type === 'ocean') {
         // Esri 海洋基础底图
         layerUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}";
         // Esri 海洋参考标注
         labelLayerUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}";
      } else if (type === 'ocean_sat') {
         // Esri 卫星影像 (World Imagery)
         layerUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
         // 如果需要叠加路网或地名注记，可以使用 Reference 图层，不需要则留空
         // labelLayerUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
      }

      if (map.value.setMaxZoom) map.value.setMaxZoom(mapMaxZoom);
      if (map.value.setMinZoom) map.value.setMinZoom(mapMinZoom);

      const layerOptions = { 
        maxZoom: nativeMaxZoom, 
        minZoom: mapMinZoom, 
        maxNativeZoom: nativeMaxZoom 
      };

      if (layerUrl) {
        currentLayer.value = new T.TileLayer(layerUrl, layerOptions);
        map.value.addLayer(currentLayer.value);
      }
      
      if (labelLayerUrl) {
        currentLabelLayer.value = new T.TileLayer(labelLayerUrl, layerOptions);
        map.value.addLayer(currentLabelLayer.value);
      } else {
        currentLabelLayer.value = null; // 确保清空引用
      }
      activeLayer.value = type;
    };

    const defaultCenter = { lng: 116, lat: 20 };
    const onMapMouseMove = (e) => {
      // 只有在“圈选工具”激活，且“已确定圆心(step=1)”时才执行
      if (currentTool.value === 'circle' && circleState.step === 1 && circleState.center) {
        const { lng, lat } = e.lnglat;
        const currentPt = new T.LngLat(lng, lat);
        const centerPt = new T.LngLat(circleState.center.lng, circleState.center.lat);
        
        // 1. 计算当前半径距离 (单位: 米)
        const distance = map.value.getDistance(centerPt, currentPt);

        // 2. 清除上一帧的临时图形
        clearTempCircleOverlays();

        // 3. 绘制新的临时图形（主圆 + 左右分身，防止跨界闪烁）
        const offsets = [0, 360, -360];
        offsets.forEach(offset => {
          const ghostCenter = new T.LngLat(circleState.center.lng + offset, circleState.center.lat);
          
          // 创建临时虚线圆
          const circle = new T.Circle(ghostCenter, distance, {
            color: "#FF0000", // 蓝色虚线
            weight: 2, 
            opacity: 0.5, 
            lineStyle: "dashed", 
            fillColor: "#FFFFFF", 
            fillOpacity: 0.2
          });
          
          map.value.addOverLay(circle);
          circleState.tempOverlays.push(circle); // 加入临时列表以便下次清除
        });
      }
    };

    function initMap() {
      if (window.T) {
        applyTileLayerProxy(window.T);
      }
      const centerPoint = new T.LngLat(defaultCenter.lng, defaultCenter.lat);
      map.value = new T.Map("mapContainer", {
        minZoom: 3,
        maxZoom: 18,
        projection: 'EPSG:900913',
        worldCopyJump: false,
      });
      map.value.centerAndZoom(centerPoint, 4); 

      const maxBounds = new T.LngLatBounds(
        new T.LngLat(-Infinity, -85), 
        new T.LngLat(Infinity, 85)
      );

      map.value.setMaxBounds(maxBounds); 
      
      const defaultLayer = new T.TileLayer(`https://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}`, { maxZoom: 18, minZoom: 3, maxNativeZoom: 18 });
      const labelLayer = new T.TileLayer(`https://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}`, { maxZoom: 18, minZoom: 3, maxNativeZoom: 18 });
      map.value.addLayer(defaultLayer);
      map.value.addLayer(labelLayer);
      
      if (map.value.setMaxZoom) map.value.setMaxZoom(18);
      if (map.value.setMinZoom) map.value.setMinZoom(3);
      
      const scale = new T.Control.Scale();
      map.value.addControl(scale);
      
      loadStations();

      map.value.addEventListener("mousemove", (event) => {
        const { lng, lat } = event.lnglat;
        currentCoordinates.value = { lng: lng.toFixed(6), lat: lat.toFixed(6) };
      });

     // 添加事件监听，用于自定义圈选
      map.value.addEventListener("click", onMapClick);
      map.value.addEventListener("mousemove", onMapMouseMove);

      // 初始化矩形工具 (保持不变，但回调换了)
      rectTool.value = new T.RectangleTool(map.value);
      rectTool.value.addEventListener('draw', onRectDrawEnd);
      
    }



    // --- 选择工具逻辑 ---
    const normalizeLng = (lng) => {
      while (lng > 180) lng -= 360;
      while (lng < -180) lng += 360;
      return lng;
    };
    //定义撤回操作

    const selectionHistory = ref([]);
    const handleUndo = () => {
      if (selectionHistory.value.length === 0) return;

      const lastAction = selectionHistory.value.pop();
      // 修改解构：取出 overlays (数组)
      const { overlays, items } = lastAction;

      // A. 移除地图上的所有关联覆盖物（本尊+分身）
      if (overlays && Array.isArray(overlays)) {
        overlays.forEach(o => {
          if (map.value) map.value.removeOverLay(o);
          // 从 drawnOverlays 列表中移除
          const idx = drawnOverlays.indexOf(o);
          if (idx > -1) drawnOverlays.splice(idx, 1);
        });
      } else if (overlays) {
        // 兼容旧数据的单对象情况
        if (map.value) map.value.removeOverLay(overlays);
        const idx = drawnOverlays.indexOf(overlays);
        if (idx > -1) drawnOverlays.splice(idx, 1);
      }

      // B. 撤销数据选中状态 (保持不变)
      if (items && items.length > 0) {
        items.forEach(item => {
          item.selected = false;
          item.visible = false; 
        });
        updateMapMarkers();
      }
    };


    // 新增：用于存储地图上画出的框选/圈选图形，以便清除
    const drawnOverlays = []; 
    // --- 圈选自定义逻辑相关变量 ---
    const circleState = reactive({
      step: 0, // 0: 未开始, 1: 已定圆心正在拉半径
      center: null, // 圆心坐标 {lng, lat}
      tempOverlays: [] // 存储临时的圆心点、半径线、半径文字、动态圆
    });

    // ... (原有 loadStations, loadSamples 等函数保持不变)

    // ---------------------------------------------------------
    // 1. 修改选择站点逻辑：支持从 API 获取 ID 后进行勾选
    // ---------------------------------------------------------
    const selectStationsAndRecord = (ids, overlays) => {
      const targetIdSet = new Set((ids || []).map(String));
      const allItems = getAllLeafItems();
      const samples = allItems.filter(i => i.type !== 'chemistry');
      const chems = allItems.filter(i => i.type === 'chemistry');
      const changedItems = [];
      let hasChanges = false;

      // ... (中间遍历样本和化学数据的逻辑保持不变) ...
      samples.forEach(sample => {
        if (sample.stationId && targetIdSet.has(String(sample.stationId))) {
          if (!sample.selected) {
            sample.selected = true;
            sample.visible = true;
            changedItems.push(sample);
            hasChanges = true;
          }
          // 级联处理化学数据
          const currentSampleIdStr = String(sample.sampleId || sample.id);
          chems.forEach(chem => {
            if (String(chem.sampleId) === currentSampleIdStr) {
              if (!chem.selected) {
                chem.selected = true;
                chem.visible = true;
                changedItems.push(chem);
                hasChanges = true;
              }
            }
          });
        }
      });

      // 修改：记录覆盖物数组到历史
      if (overlays) {
        // 统一转为数组
        const overlayList = Array.isArray(overlays) ? overlays : [overlays];
        
        selectionHistory.value.push({
          overlays: overlayList, // 存数组
          items: changedItems
        });
        
        // 将所有生成的图形加入全局清理列表
        drawnOverlays.push(...overlayList);
      }

      // 刷新 UI
      if (hasChanges) {
        updateMapMarkers();
        if (!isDataPanelOpen.value) {
          isDataPanelOpen.value = true;
          setDataTab('layers');
        }
      }
    };
    // ---------------------------------------------------------
    // 2. 框选逻辑 (修正：画完即停 + 样式保留 + 后端 API)
    // ---------------------------------------------------------
    const onRectDrawEnd = async (e) => {
      const extent = e.currentBounds;
      if (!extent) return;

      if (rectTool.value) {
        rectTool.value.close();
        rectTool.value.clear();
      }
      currentTool.value = '';

      // --- 核心修改：同时创建 3 个矩形 (中、左、右) ---
      const createdOverlays = [];
      const offsets = [0, 360, -360];

      offsets.forEach(offset => {
        const sw = extent.getSouthWest();
        const ne = extent.getNorthEast();
        
        // 偏移坐标
        const newSw = new T.LngLat(sw.getLng() + offset, sw.getLat());
        const newNe = new T.LngLat(ne.getLng() + offset, ne.getLat());
        const newBounds = new T.LngLatBounds(newSw, newNe);

        const rect = new T.Rectangle(newBounds, {
          color: "blue", weight: 2, opacity: 0.5, lineStyle: "solid", fillColor: "#FFFFFF", fillOpacity: 0.1
        });
        
        map.value.addOverLay(rect);
        createdOverlays.push(rect);
      });

      // --- API 查询逻辑 ---
      const ne = extent.getNorthEast();
      const sw = extent.getSouthWest();
      
      // 1. 获取原始坐标
      let latBegin = ne.getLat ? ne.getLat() : ne.lat;
      let lngBegin = sw.getLng ? sw.getLng() : sw.lng;
      let latEnd = sw.getLat ? sw.getLat() : sw.lat;
      let lngEnd = ne.getLng ? ne.getLng() : ne.lng;

      // 2. 归一化经度 (保证传给后端的是 -180 到 180)
      lngBegin = normalizeLng(lngBegin);
      lngEnd = normalizeLng(lngEnd);

      const params = {
        longitudeBegin: lngBegin,
        latitudeBegin: latBegin,
        longitudeEnd: lngEnd,
        latitudeEnd: latEnd
      };

      try {
        const res = await api.stations.getBySRange(params);
        const ids = (res && res.data) ? res.data.map(item => item.id) : [];
        // 传入覆盖物数组
        selectStationsAndRecord(ids, createdOverlays);
      } catch (err) {
        console.error("框选查询失败:", err);
        selectStationsAndRecord([], createdOverlays);
      }
    };

    // ---------------------------------------------------------
    // 3. 圈选逻辑 (完全重写：点击-移动-点击)
    // ---------------------------------------------------------
    
    // 激活工具时的处理
    const activateTool = (tool) => {
      // 先清理旧状态
      if (rectTool.value) {
        rectTool.value.close();
        rectTool.value.clear();
      }
      // 重置圈选状态
      circleState.step = 0;
      clearTempCircleOverlays();
      
      // 恢复默认鼠标样式
      const container = document.getElementById('mapContainer');
      if (container) container.style.cursor = 'default';

      if (currentTool.value === tool) {
        currentTool.value = ''; // 再次点击取消
        return;
      }

      currentTool.value = tool;
      
      if (tool === 'rect') {
        rectTool.value.open();
      } else if (tool === 'circle') {
        // 圈选现在由 map 的 click/mousemove 事件接管，不需要 open T.CircleTool
        // 修改点：直接设置 DOM 的 cursor 样式
        if (container) container.style.cursor = 'crosshair'; 
      }
    };

    // 清除临时圈选图形
    const clearTempCircleOverlays = () => {
      circleState.tempOverlays.forEach(o => map.value.removeOverLay(o));
      circleState.tempOverlays = [];
    };

    // 地图点击事件 (用于自定义圈选)
    const onMapClick = async (e) => {
      if (currentTool.value !== 'circle') return;

      const { lng, lat } = e.lnglat;

      // 第一步：确定圆心
      if (circleState.step === 0) {
        circleState.center = { lng, lat };
        circleState.step = 1;

        // 画一个圆心点
        const centerMarker = new T.Circle(new T.LngLat(lng, lat), 50, { // 这里的50是像素还是米取决于版本，通常小圆点用Marker更好，这里用小Circle代替
            color: "red", weight: 1, fillOpacity: 1, fillColor: "red"
        });
        map.value.addOverLay(centerMarker);
        circleState.tempOverlays.push(centerMarker);

      }else if (circleState.step === 1) {
        // 计算原始圆心和半径
        const centerLngLat = new T.LngLat(circleState.center.lng, circleState.center.lat);
        const end = new T.LngLat(lng, lat);
        const distance = map.value.getDistance(centerLngLat, end); // 米

        // 1. 清除临时的线、文字等
        clearTempCircleOverlays();
        
        // 2. --- 核心修改：同时创建 3 个圆 (中、左、右) ---
        const createdOverlays = [];
        const offsets = [0, 360, -360];

        offsets.forEach(offset => {
          // 偏移圆心
          const newCenter = new T.LngLat(circleState.center.lng + offset, circleState.center.lat);
          
          const circle = new T.Circle(newCenter, distance, {
             color: "#FF0000", weight: 2, opacity: 0.5, lineStyle: "solid", fillColor: "#FFFFFF", fillOpacity: 0.1
          });
          map.value.addOverLay(circle);
          createdOverlays.push(circle);
        });

        // 3. 重置工具状态
        circleState.step = 0;
        currentTool.value = '';
        const container = document.getElementById('mapContainer');
        if (container) container.style.cursor = 'default';
        
        // 4. 调用后端 API
        // 归一化圆心经度
        const normalizedLng = normalizeLng(circleState.center.lng);

        const params = {
          longitude: normalizedLng,
          latitude: circleState.center.lat,
          distanceM: distance
        };

        try {
          const res = await api.stations.getByCRange(params);
          const ids = (res && res.data) ? res.data.map(item => item.id) : [];
          // 传入覆盖物数组
          selectStationsAndRecord(ids, createdOverlays);
        } catch (err) {
          console.error("圈选查询失败:", err);
          selectStationsAndRecord([], createdOverlays);
        }
      }
    };

    // ---------------------------------------------------------
    // 清除选择
    // ---------------------------------------------------------
    const clearSelection = () => {
      // 1. 清除工具状态
      rectTool.value.close();
      rectTool.value.clear();
      currentTool.value = '';
      circleState.step = 0;
      clearTempCircleOverlays();
      const container = document.getElementById('mapContainer');
      if (container) container.style.cursor = 'default';

      // 2. 清除所有画在地图上的框和圆
      drawnOverlays.forEach(o => map.value.removeOverLay(o));
      drawnOverlays.length = 0; // 清空数组

      // 3. 清除数据选择 (保留原有逻辑)
      confirmClearAll(); 
    };

    

    // 选择站点后的通用处理：找到所有 Station 关联的 Sample 并勾选
    const selectStations = (targetStationIds) => {
      if (!targetStationIds.size) return;

      const allLeafs = getAllLeafItems().filter(i => i.type !== 'chemistry');
      let hasChanges = false;

      allLeafs.forEach(sample => {
        // 如果样本属于目标站点，将其选中
        if (targetStationIds.has(sample.stationId)) {
          if (!sample.selected) {
            sample.selected = true;
            sample.visible = true; // 自动可见
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        updateMapMarkers(); // 刷新地图
        // 自动打开数据面板
        if (!isDataPanelOpen.value) {
          isDataPanelOpen.value = true;
          setDataTab('layers');
        }
      }
    };

    

    
    // ----------------------

    function zoomIn() { if (map.value) map.value.zoomIn(); }
    function zoomOut() { if (map.value) map.value.zoomOut(); }

    function loadTiandituScript(callback) {
      const script = document.createElement("script");
      const initialTk = 'db74e3389d27b4b68914d84fd152f1b8';
      script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${initialTk}`;
      script.async = true;
      script.onload = () => { callback && callback(); };
      script.onerror = () => { console.error("加载天地图脚本失败：", script.src); };
      document.head.appendChild(script);
      setTimeout(() => { if (!window.T) console.error("天地图脚本超时未加载（10s）"); }, 10000);
    }

    onMounted(() => {
      if (window.T) initMap();
      else loadTiandituScript(initMap);
    });

    const isNodeAllSelected = (nodeList) => {
      if (!nodeList || !nodeList.length) return false;
      const leafs = getLeafs(nodeList);
      return leafs.length > 0 && leafs.every(l => l.selected);
    };

    const toggleNodeSelectAll = (nodeList, checked) => {
      if (!nodeList) return;
      const leafs = getLeafs(nodeList);
      leafs.forEach(l => {
        if (l.selected !== checked) {
          l.selected = checked;
          onCatalogueItemToggle(l);
        }
      });
    };

    function setItemVisible(item, visible) {
      item.visible = visible;
    }

    function getList() {
      try {
        if (typeof activeLayerItems !== 'undefined' && Array.isArray(activeLayerItems.value)) {
          return activeLayerItems.value;
        }
      } catch (_) {}
      return [];
    }

    const allHidden = computed(() => {
      const list = getList();
      return list.length > 0 && list.every(it => it.visible === false);
    });
    
    const toggleChemList = (itemId) => {
      chemListCollapsed.value[itemId] = !chemListCollapsed.value[itemId];
    };
    const isChemCollapsed = (itemId) => {
      return chemListCollapsed.value[itemId] !== false; 
    };

    // ----------------------------------------------
    // 新增：删除整个站点的数据
    // ----------------------------------------------
    const removeStationData = (stationGroup) => {
      const stId = String(stationGroup.stationId);
      // 筛选出属于该站点的所有选中项（包括样本和化学数据）
      const targetItems = activeLayerItems.value.filter(item => String(item.stationId) === stId);
      
      targetItems.forEach(item => {
        item.selected = false;
        item.visible = false;
      });
      // 更新地图
      updateMapMarkers();
    };

    // ----------------------------------------------
    // 新增：删除整个航次的数据
    // ----------------------------------------------
    const removeCruiseData = (cruise) => {
      // 1. 获取该航次下所有站点的 ID
      const stationIds = new Set(cruise.stationList.map(s => String(s.stationId)));
      
      // 2. 筛选出属于这些站点的所有选中项
      const targetItems = activeLayerItems.value.filter(item => stationIds.has(String(item.stationId)));
      
      targetItems.forEach(item => {
        item.selected = false;
        item.visible = false;
      });
      // 更新地图
      updateMapMarkers();
    };

    return {
      isStasticOpen,
      biology,
      toggleCruiseHull,
      cruiseHullVisibility,
      expandedCruises,
      toggleCruise,
      expandedFourth,
      toggleCat4,
      isStationVisible,
      toggleStationVisibility,
      importOpen,
      openImport,
      onImported,
      toggleDatama,
      isDataPanelOpen,
      activeDataTab,
      setDataTab,
      showClearConfirm,
      confirmClearAll,
      openIconSvg,
      closeIconSvg,
      arrowSvg,
      infoSvg,
      eyeOpenSvg,
      eyeCloseSvg,
      layerSearch,
      layers,
      filteredCatalogue,
      filteredGroupTree,
      groupItems,
      expanded,
      toggleGroup,
      expandedSecond,
      toggleCat,
      expandedThird,
      toggleCat3, 
      activeLayerItems,
      groupedActiveLayerItems,
      toggleLayerVisibility,
      toggleAllLayers,
      zoomIn,
      zoomOut,
      switchMap,
      toggleFullscreen,
      currentCoordinates,
      activeLayer,
      isNodeAllSelected, 
      toggleNodeSelectAll, 
      allHidden,
      centerOnLayer,
      onCatalogueItemToggle,
      showCatalogueInfo,
      expandedStations,
      toggleStation,
      isStationExpanded,
      toggleChemList,
      isChemCollapsed,
      viewSampleDetail,
      viewChemDetail,
      jumpSvg,
      viewStationDetail,
      // Selection Tools
      activateTool,
      clearSelection,
      currentTool,
      onRectDrawEnd,
      // Added delete functions
      removeStationData,
      removeCruiseData,
      //撤回
      selectionHistory, // 新增
      handleUndo,
      //数据页徽章样式
      getBadgeText,  // 新增
      getBadgeClass, // 新增
      groupedActiveLayerItems // 确保返回了更新后的计算属性
    };
  }
};
</script>

<style scoped>
/* 样式保留原有的，新增 Tool Panel 样式 */
.map-tools-panel {
  position: absolute;
  top: 300px;
  right: 35px; /* MapControls 通常在 right: 10px */
  z-index: 1200;
  flex-direction: column;
  align-items: stretch; 
  background: rgba(255, 255, 255, 0.6); /* 将背景改为半透明白色，0.6 是透明度 */
  backdrop-filter: blur(8px);            /* 关键：添加背景模糊效果 (数值越大越模糊) */
  -webkit-backdrop-filter: blur(8px);    /* 兼容 Safari 浏览器 */
  border: 1px solid rgba(255, 255, 255, 0.3); /* 可选：加一个淡淡的边框增强质感 */
  display: flex; 
  
  padding: 6px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.tool-group {
  display: flex;
  flex-direction: column;      /* 改为纵向 */
  gap: 8px;
  align-items: stretch;
}
.tool-btn {
  position: relative; /* 1. 为内部绝对定位做参照 */
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 10px; /* 微调高度 */
  cursor: pointer;
  
  display: flex;
  align-items: center;
  justify-content: center; /* 2. 让文字水平居中 */
  
  font-size: 13px;
  color: #333;
  width: 100%;
  min-height: 32px; /* 保证最小高度 */
}


.tool-btn:hover {
  background: #e6e6e6;
}
.tool-btn.active {
  background: #0b57a4;
  color: white;
  border-color: #0b57a4;
}
.tool-btn .iconfont {
  position: absolute;
  left: 10px; /* 距离左边的距离，可根据需要调整 */
  top: 50%;
  transform: translateY(-50%); /* 垂直居中 */
  font-size: 16px; /* 确保图标大小合适 */
}

/* 左侧控制区域样式调整 */
#datamaSwitchPanel {
  position: absolute;
  top: 250px;
  left: 10px;
  z-index: 1200;
  display: flex;
  flex-direction: column; /* 垂直排列按钮 */
  gap: 10px;              /* 按钮间距 */
  pointer-events: none;   /* 允许点击穿透空白区域 */
}

/* 确保按钮可以点击 */
#datamaButton, 
#datamaSwitchPanel :deep(.quick-controls-container) {
  pointer-events: auto;
}

#datamaButton {
  width: 40px;
  height: 40px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #007bff;
  border: none;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  cursor: pointer;
}
#datamaButton:hover {
  background: #0069d9;
}
#datamaButton span { color: #fff; display: flex; align-items: center; }
#datamaButton .iconfont { font-size: 30px; line-height: 1; color: #fff; }
#datamaButton .icon-svg { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; }
#datamaButton .icon-svg svg { width: 24px; height: 24px; fill: #ffffff; pointer-events: none; display: block; }

/* 调整数据面板宽度和位置 */
#datalayerOptions {
  position: absolute;
  left: 52px; /* 偏移到按钮右侧 */
  top: 0;
  width: 420px; /* 变窄：从 480px 改为 320px */
  max-height: 76vh;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  padding: 8px;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  z-index: 1201;
  pointer-events: auto; /* 恢复面板的点击事件 */
}

/* 以下原有样式保持不变 */
.confirm-modal-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1500; border-radius: 6px;
}
.confirm-modal {
  background-color: white; padding: 20px; border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); width: 90%; max-width: 320px; text-align: center;
}
.confirm-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
.confirm-body { font-size: 14px; margin-bottom: 20px; color: #333; }
.confirm-actions { display: flex; justify-content: center; gap: 15px; }
.confirm-actions button { padding: 8px 20px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; font-weight: 500; }
.confirm-actions .confirm-yes { background-color: #d9534f; color: white; border-color: #d43f3a; }
.confirm-actions .confirm-no { background-color: #f0f0f0; }

#datalayerOptions .data-header{
  display: flex;
  justify-content: space-between; /* 关键：左边 tabs，右边 btn */
  align-items: center;            /* 垂直居中 */
  padding: 10px 12px;             /* 增加一点内边距 */
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  /* 覆盖原有的 text-align: center */
  text-align: left;
}
#datalayerOptions .data-search,
#datalayerOptions .data-add,
#datalayerOptions .data-more{ padding:8px 4px; color:#666; font-size:13px; text-align:center; }
#datalayerOptions .data-footer { flex: 0 0 auto; }
#datalayerOptions .data-list { flex: 1 1 auto; overflow-y: auto; padding-right: 6px; }

.catalogue-link {
  color: #0b57a4;           /* 主题蓝色 */
  text-decoration: none;    /* 去掉默认下划线 */
  font-weight: bold;        /* 加粗突出显示 */
  margin: 0 2px;            /* 链接左右增加微小间距 */
  padding-bottom: 2px;      /* 预留边框位置 */
  border-bottom: 1px solid transparent; /* 默认透明边框，避免hover时跳动 */
  transition: all 0.3s ease;
  cursor: pointer;
}

.catalogue-link:hover {
  color: #074f90;           /* 悬停加深颜色 */
  border-bottom-color: #074f90; /* 悬停显示下划线 */
}



.data-list-action .selected-list { max-height: none; overflow-y: visible; padding-right: 6px; }

.catalogue-list { max-height: none; padding: 6px 4px; }
#datalayerOptions .tabs { display: flex; gap: 10px; margin-bottom: 0; }
#datalayerOptions .tab { padding: 8px 14px; border-radius: 4px; background: #e9f1fb; color: #2b6aa3; border: none; cursor: pointer; font-weight: 600; }
#datalayerOptions .tab.active { background: #0b57a4; color: #fff; font-weight: 700; }

.header-add-btn {
  background-color: #e9f1fb;
  color: #0b57a4;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap; /* 防止文字换行 */
}

.header-add-btn:hover {
  background-color: #dceefc;
  color: #074f90;
  border-color: #bcdbf7;
}

.cat-item-source {
  font-size: 12px; /* 基础字体 */
  color: #999;      /* 颜色更淡，降低视觉权重 */
  margin-top: 2px;
  
  /* 关键：整体缩放 0.85 倍 */
  transform: scale(0.85); 
  transform-origin: left top; /* 缩放基点设为左上角 */
  
  /* 缩放后宽度会变小，需要补偿宽度以免换行过早 */
  width: 117%; 
  
  display: flex;
  align-items: center;
  margin-bottom: -4px; /* 修正缩放后留下的空白间距 */
}

/* 来源标签样式：更像一个小徽章 */
.source-tag {
  background-color: #f2f3f5;  /* 极浅的灰色背景 */
  border: 1px solid #ebeef5;  /* 淡淡的边框 */
  color: #909399;              /* 灰色文字 */
  padding: 0 4px;              /* 紧凑的内边距 */
  border-radius: 2px;          /* 直角圆角 */
  margin-right: 5px;
  
  font-size: 12px;             /* 保持清晰度 */
  height: 16px;                /* 固定高度 */
  line-height: 14px;           /* 垂直居中微调 */
  display: inline-block;
  white-space: nowrap;
}

.cruise-data-group {
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.cruise-header-left {
  display: flex;
  align-items: center;
}

.cruise-data-body {
  background-color: #f9f9f9;
  padding: 8px;
}

.cruise-data-header {
  background-color: #e3f2fd; /* 浅蓝色背景区分航次 */
  color: #0d47a1;
  padding: 10px 12px;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid #dcebf7;
}

.station-data-group {
  margin-bottom: 8px;
  border: 1px solid #eee;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}
.station-data-header { 
  /* --- 核心布局 (必须保留，否则左右会对不齐) --- */
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;

  /* --- 视觉样式 (根据您的要求修改) --- */
  background-color: #fff;         /* 背景改为白色 */
  padding: 8px 10px;
  
  /* 边框调整：去掉四周深色框，只留底部浅色分割线 */
  border: none;
  border-bottom: 1px solid #f0f0f0; 
  
  /* 字体样式 */
  font-weight: bold;
  font-size: 13px;
  color: #333;
}

/* 新增：左侧区域 */
.station-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.station-header-right {
  display: flex;
  align-items: center;
  gap: 12px; /* 眼睛和箭头的间距 */
}

/* 通用 Header 按钮样式 (适用于 Station 和 Cruise 的 Header) */
.cruise-header-right .icon-btn.small-btn,
.station-header-right .icon-btn.small-btn {
  width: 24px;
  height: 24px;
  background: transparent; /* 透明背景融入 Header */
  border: 1px solid transparent;
  color: #666; /* 默认图标颜色 */
}

/* 统一悬停样式：变为蓝色背景，白色图标 */
.cruise-header-right .icon-btn.small-btn:hover,
.station-header-right .icon-btn.small-btn:hover {
  background: #074f90;
  border-color: #074f90;
  color: #fff;
}

.badge-count {
  background: #dceefc;
  color: #0b57a4;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
  font-weight: normal;
}

.data-actions-fixed {
  flex: 0 0 auto; 
  padding: 10px 4px; 
  border-top: 1px solid #eee; 
  background-color: #fff;
}

.header-check {
  margin-right: 8px; /* 与标题文字的间距 */
  display: flex;
  align-items: center;
}

/* 复选框样式 */
.header-check input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #0b57a4; /* 选中时的颜色 */
  cursor: pointer;
  margin: 0;
}

/* 针对第一级标题（深蓝色背景）的特殊调整，如果需要的话 */
.cat-group-header .header-check input {
  border-color: #fff;
  accent-color: #fff; /* 或者保持蓝色，看您喜好 */
}

.cat-item-content { display: flex; flex-direction: column; }
.cat-item-desc { font-size: 12px; color: #999; margin-top: 2px; }

.data-search { padding:6px 4px; }
.data-search-input { width:100%; padding:8px; border:1px solid #e6e6e6; border-radius:4px; font-size:14px; }
.data-list { margin-top:8px; }
.data-layer-item { display:flex; justify-content:space-between; align-items:center; background:#fff; color:#333; padding:12px; margin:8px 0; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.1); border:1px solid #eee; }
.data-layer-info { flex-grow:1; }
.data-layer-title { font-weight:600; color:#074f90; margin-bottom:4px; }
.data-layer-description { font-size:13px; color:#666; }
.data-layer-action { display:flex; gap:8px; align-items:center; }
.cat2 { margin: 6px 0 8px; }
.cat2-header { background:#e8f1ff; color:#074f90; padding:10px 12px; border-radius:4px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:600; }
.cat2-title { font-size:14px;  flex: 1;            /* 新增：占据剩余空间 */
  text-align: left;  /* 新增：文字左对齐 */}
.cat2-body { border:1px solid #e6eef8; border-top:none; background:#fff; padding:6px 6px; border-radius:0 0 4px 4px; }
.cat2-header .cat-arrow { color:#000; }

.cat3 { margin: 4px 0; }
.cat3-header { background:#f5f9ff; color:#0b57a4; padding:8px 10px 8px 24px; border-radius:4px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:600; font-size: 13px; border: 1px solid #e8f1ff; }
.cat3-title { flex: 1; text-align: left; /* 确保添加左对齐 */}
.cat3-body { background:#fff; border:1px solid #f0f0f0; border-top:none; padding:4px; border-radius:0 0 4px 4px; margin-left: 12px; }

.cat4 { margin: 2px 0; }
.cat4-header {
  background: #fcfcfc; /* 比 cat3 更浅一点，或者一样 */
  color: #555;
  padding: 6px 10px 6px 32px; /* 缩进更多 */
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  cursor: pointer;
  font-size: 13px;
  border: 1px solid #f0f0f0;
}
.cat4-title-group {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column; /* 垂直排列标题和描述 */
  margin-top: 2px; /* 微调对齐 */
}
.cat4-desc {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  font-weight: normal;
}
.cat4-title {
  flex: 1;
  text-align: left;
}
.cat4-body {
  background: #fff;
  padding: 4px;
  border-radius: 0 0 4px 4px;
  margin-left: 24px; /* 内容缩进 */
  border-left: 1px solid #eee;
}
/* 确保箭头垂直居中或顶部对齐 */
.cat4-header .cat-arrow {
  margin-top: 4px;
}

.select-all-row.smaller { font-size: 12px; padding: 4px 6px; margin-bottom: 4px; background: #fafafa; }

.select-all-row { padding: 6px 8px; border: 1px dashed #d5e2f3; background: #f5f9ff; margin: 4px 0 8px; border-radius: 4px; font-size: 13px; color:#074f90; display:flex; align-items:center; }
.select-all-row.small { background:#f8fbff; margin-top:4px; margin-bottom:6px; }
.select-all-row input { width:16px; height:16px; accent-color:#0b57a4; margin-right:6px; }
.icon-btn { background:#f0f0f0; border:none; width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#000; }
.icon-btn:hover { background:#074f90; color:#fff; }
.icon-svg { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
.icon-svg svg { width: 100%; height: 100%; fill: currentColor; pointer-events: none; display: block; }
.icon-btn .icon-svg { display: flex; align-items: center; justify-content: center; }
.icon-btn .icon-svg svg { width: 18px; height: 18px; fill: currentColor; pointer-events: none; }
.cat-arrow .icon-svg { width: 18px; height: 18px; color: #000; }
.cat-arrow .icon-svg svg { width: 18px; height: 18px; }
.cat-group-header { color:#fff; }
.cat-group-header .cat-arrow { color:#000 !important; } 
.cat-group-header .cat-arrow .icon-svg { color: #fff; }
.cat-arrow.open { transform: rotate(90deg); }
.control-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; border-radius: 8px; border: 2px solid #0b57a4; background: #ffffff; color: #0b57a4; font-weight: 600; font-size: 14px; cursor: pointer; box-shadow: none; }
.control-btn i.iconfont { font-size:18px; }
.control-btn:hover { background: #0b57a4; color: #ffffff; border-color: #0b57a4; }
.layer-bulk { display: flex; gap: 16px; justify-content: center; align-items: center; padding: 0; } 
.no-layers { color:#666; text-align:center; padding:24px 0; }
.catalogue-groups { margin-top: 6px; }
.cat-group { margin: 8px 0; }
.cat-group-header { background: #0b57a4; color: #fff; padding: 12px 14px; border-radius: 4px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:700; }
.cat-group-title {font-size: 15px;
  flex: 1;            /* 新增：占据剩余空间 */
  text-align: left;  /* 新增：文字左对齐 */}
.cat-arrow { font-size:18px; transform: rotate(0deg); transition: transform .2s ease; color:#000; } 
.cat-arrow.open { transform: rotate(90deg); }
.cat-group-body { background:#fff; border:1px solid #e6eef8; border-top:none; padding:8px 8px; border-radius:0 0 4px 4px; }
.cat-item-row { display:flex; align-items:center; justify-content:space-between; padding:10px 8px; border-bottom:1px solid #f1f1f1; }
.cat-item-row:last-child { border-bottom:none; }
.cat-item-left { display:flex; align-items:center; gap:10px; }
.cat-item-left input[type="checkbox"] { width:16px; height:16px; accent-color:#0b57a4; }
.cat-item-name { color:#333; font-size:14px; }
.cat-item-actions .icon-btn { background:transparent; border:none; color:#0b57a4; }
.cat-item-actions .icon-btn:hover { color:#074f90; }
.data-add { padding:8px 4px; text-align:right; }
.data-add-btn { background: transparent; color: #074f90; border: 1px solid #074f90; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
.data-more { padding:8px 4px; color:#666; font-size:13px; text-align:center; }
.data-footer { padding:8px 4px; border-top:1px solid #f1f1f1; margin-top:8px; }
.data-row { display:flex; flex-direction:column; gap: 6px; margin-bottom:8px; }
.data-row label { font-size:13px; color:#074f90; font-weight:600; }
.small-select { width:100%; padding:8px; border-radius:4px; border:1px solid #e6e6e6; }
.tdt-marker-icon { width:25px !important; height:25px !important; }
.biologyCss { position: absolute; right: 12px; top: 120px; width: 360px; max-height: 70vh; background: #fff; border-radius: 6px; box-shadow: 0 6px 18px rgba(0,0,0,0.12); overflow-y: auto; z-index: 1300; padding: 8px; }
#datamaSwitchPanel { z-index: 2000; pointer-events: auto; }
#datamaButton { pointer-events: auto; }
@media (max-width: 768px) { #datalayerOptions { width:260px; max-height:60vh; left:52px; top:0; } }
.btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; font-size: 18px; line-height: 1; color: #0b57a4; transition: color .15s ease, transform .12s ease, opacity .15s ease; }
.icon-btn:hover .btn-icon { color: #fff; transform: scale(1.05); }
.btn-icon.is-off { opacity: .45; }
.btn-icon--danger { color: #d9534f; }
.icon-btn:hover .btn-icon--danger { color: #fff; }
.control-btn .icon-svg, .control-btn .icon-svg svg { width: 18px !important; height: 18px !important; display: inline-block; vertical-align: middle; }
.control-btn { align-items: center; display: inline-flex; gap: 8px; }

.tdt-control-scale { margin-bottom: 5px; }
.tdt-control-scale .tdt-control-scale-line { text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff; color: #000 !important; font-weight: bold; border-color: #000 !important; }

.icon-svg.is-off {
  opacity: 0.5; /* 变暗/变淡 */
  color: #999;  /* 如果 SVG 使用 currentColor，这会让它变成灰色 */
}

/* 确保 SVG 能够正确继承颜色和大小 (如果原本已有可忽略) */
.icon-btn .icon-svg svg {
  width: 18px; 
  height: 18px; 
  fill: currentColor;
  transition: all 0.3s ease; /* 添加过渡效果，让切换更丝滑 */
}

#mapContainer {
  width: 100%; 
  height: 90vh;
  background-color: #aac6ee;
}

.badge-sample {
  background: #28a745; color: white; font-size: 10px; padding: 1px 4px; border-radius: 3px; margin-right: 4px;
}
.chem-sub-list {
  margin-left: 12px;
  border-left: 2px solid #e0e0e0;
  margin-top: 4px;
  margin-bottom: 8px;
}
.chem-sub-header {
  padding: 6px 10px;
  background: #fffcf5; 
  font-size: 12px;
  font-weight: bold;
  color: #d68a00;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
}
.sub-arrow {
  font-size: 10px; transition: transform 0.2s;
}
.sub-arrow.open {
  transform: rotate(180deg);
}
.chem-items-container {
  background: #fffff8;
}
.chem-item {
  background-color: #fffbe6;
  padding: 8px 10px;
  border-bottom: 1px dashed #eee;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  border: none;
  border-bottom: 1px solid #f0f0f0;
}
.chem-item:hover {
  background-color: #fff1b8; /* 鼠标悬停时稍微加深 */
}
.chem-title {
  font-size: 12px; color: #555; font-weight: normal;
}
.badge-common {
  color: white;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  margin-right: 4px;
  display: inline-block;
  vertical-align: middle;
  line-height: 1.2;
}

/* 绿色：样本 */
.badge-sample {
  background: #28a745;
}

/* 青色：生物 */
.badge-bio {
  background: #17a2b8;
}

/* 橙色：化学 */
.badge-chem {
  background: #fd7e14;
}
.tool-btn.disabled{
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f0f0f0; /* 保持背景色但加深透明度感 */
  color: #999;
}
</style>