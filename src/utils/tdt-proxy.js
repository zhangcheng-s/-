// src/utils/tdt-proxy.js

// 你的所有可用天地图密钥
const tdtKeys = [
  'db74e3389d27b4b68914d84fd152f1b8',
  '432dda4c3f730a98719817b263dadeb1',
  'ca6f1de744c87ef551bc8fcc9b8046e1',
];

/**
 * 为天地图的 TileLayer 类创建一个代理，以实现无限滚动支持和 TK 的动态负载均衡。
 * @param {object} T - 全局的天地图 API 对象 (window.T)
 */
export function applyTileLayerProxy(T) {
  if (T.TileLayer._isProxied) {
    return;
  }

  const OriginalTileLayer = T.TileLayer;

  T.TileLayer = new Proxy(OriginalTileLayer, {
    construct(target, args) {
      let [url, options] = args;

      // 移除 URL 中可能存在的硬编码 tk，避免冲突
      if (url && url.includes("tk=")) {
        url = url.replace(/&?tk=[^&]*/, '');
      }

      const instance = new target(url, options);

      // 覆盖 getTileUrl 方法
      instance.getTileUrl = function(tileCoord) {
        // -----------------------------------------------------------
        // 【核心修复步骤 1】：坐标归一化
        // 在调用原始方法生成 URL 之前，先将越界的 x 坐标修正回有效范围。
        // 例如：Zoom=3 时，x=8 会被修正为 x=0。
        // -----------------------------------------------------------
        
        // 获取当前缩放级别的瓦片总列数 (2^z)
        // 注意：_getZoomForUrl 是 Leaflet 内部方法，如果不存在则回退到 tileCoord.z
        const z = this._getZoomForUrl ? this._getZoomForUrl() : tileCoord.z;
        const limit = Math.pow(2, z);

        // 计算归一化后的 x 坐标
        let normalizedX = tileCoord.x % limit;
        if (normalizedX < 0) normalizedX += limit;

        // 创建一个新的坐标对象，避免修改原始 tileCoord 产生副作用
        const normalizedCoord = {
          x: normalizedX,
          y: tileCoord.y,
          z: z
        };

        // -----------------------------------------------------------
        // 【核心修复步骤 2】：生成正确的 URL
        // 使用修正后的坐标调用原始方法。这样生成的 URL 里 x 参数就是正确的（如 x=0），
        // 天地图服务器就能正确返回图片，而不是 404。
        // -----------------------------------------------------------
        let tileUrl = OriginalTileLayer.prototype.getTileUrl.call(this, normalizedCoord);
        
        // -----------------------------------------------------------
        // 【核心修复步骤 3】：添加 TK 并利用缓存
        // -----------------------------------------------------------
        if (tileUrl.includes("tianditu.gov.cn")) {
            // 使用归一化的坐标计算 keyIndex，确保同一个位置永远使用同一个 Key
            const total = Math.abs(normalizedCoord.x + normalizedCoord.y);
            const keyIndex = total % tdtKeys.length;
            const currentTk = tdtKeys[keyIndex];

            const separator = tileUrl.includes("?") ? "&" : "?";
            tileUrl += `${separator}tk=${currentTk}`;
        }
        
        return tileUrl;
      };

      return instance;
    }
  });

  T.TileLayer._isProxied = true;
}