// src/api/management.js

const BASE = '/api/v1';
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// --- 核心：数据缓存变量 ---
let chemDataCache = null;

// 辅助函数：将对象转换为 query string
function toQueryString(params) {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  });
  return searchParams.toString();
}

// 通用 POST 辅助函数
async function postRequest(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let errorMsg = `HTTP ${res.status} ${res.statusText}`;
    try {
      const errJson = JSON.parse(text);
      errorMsg = errJson.message || errJson.error || text;
    } catch (e) {
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }
  return res.json().catch(() => ({}));
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(await res.text() || res.statusText);
  try { return await res.json(); } catch { return {}; }
}

export const api = {
  cruises: {
    page: (params) => request(`${API_BASE}/cruises/page`, { method: 'POST', body: JSON.stringify(params) })
  },
  voyages: {
    list: () => request(`${API_BASE}/voyages`),
    create: (d) => request(`${API_BASE}/voyages`, { method: 'POST', body: JSON.stringify(d) }),
    update: (id, d) => request(`${API_BASE}/voyages/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    remove: (id) => request(`${API_BASE}/voyages/${id}`, { method: 'DELETE' })
  },
  stations: {
    page: (params) => request(`${API_BASE}/stations/page`, { method: 'POST', body: JSON.stringify(params) }),
    getBySRange: (params) => request(`${API_BASE}/stations/getBySRange`, { method: 'POST', body: JSON.stringify(params) }),
    getByCRange: (params) => request(`${API_BASE}/stations/getByCRange`, { method: 'POST', body: JSON.stringify(params) }),
  },
  samples: {
    list: () => request(`${API_BASE}/samples`),
    create: (d) => request(`${API_BASE}/samples`, { method: 'POST', body: JSON.stringify(d) }),
    update: (id, d) => request(`${API_BASE}/samples/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    remove: (id) => request(`${API_BASE}/samples/${id}`, { method: 'DELETE' }),
    queryByStationIds: (stationIds) => request(`${API_BASE}/samples/query`, { method: 'POST', body: JSON.stringify({ stationIds: stationIds }) }),
    queryByStationNames: (params) => {
      const stationId = params.id || params.stationId;
      const stationIds = stationId ? [stationId] : (Array.isArray(params.stationIds) ? params.stationIds : []);
      const requestBody = { size: 99, page: 0, stationIds: stationIds };
      return request(`${API_BASE}/samples/page`, { method: 'POST', body: JSON.stringify(requestBody) });
    }
  },
  chemResults: {
    query: (params) => request(`${API_BASE}/chem-results-main/query`, { method: 'POST', body: JSON.stringify(params) }),
    detail: (id) => request(`${API_BASE}/chem-results-main/${id}`),
    page: (params) => request(`${API_BASE}/chem-results-main/page`, { method: 'POST', body: JSON.stringify(params) })
  },
  biologicalResults: {
    page: (params) => request(`${API_BASE}/biological-results-main/page`, { method: 'POST', body: JSON.stringify(params) }),

    // [新增] 精确查询接口，用于分类点击时获取数据
    query: (params) => request(`${API_BASE}/biological-results-main/query`, { method: 'POST', body: JSON.stringify(params) }),

    // [核心修改] 级联筛选数据源接口，使用 GET 请求
    getCount: (params) => {
      const qs = toQueryString(params);
      return request(`${API_BASE}/biological-results-main/getCount?${qs}`, { method: 'GET' });
    },

    // 根据ID获取详情
    getById: (id) => request(`${API_BASE}/biological-results-main/${id}`, { method: 'GET' })
  },
  species: {
    list: () => request(`${API_BASE}/species`),
    create: (d) => request(`${API_BASE}/species`, { method: 'POST', body: JSON.stringify(d) }),
    update: (id, d) => request(`${API_BASE}/species/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    remove: (id) => request(`${API_BASE}/species/${id}`, { method: 'DELETE' })
  },
  media: {
    list: () => request(`${API_BASE}/media`),
    upload: (formData) => fetch(`${API_BASE}/media/upload`, { method: 'POST', body: formData }).then(r => r.json()),
    remove: (id) => request(`${API_BASE}/media/${id}`, { method: 'DELETE' })
  },
  provenance: {
    list: () => request(`${API_BASE}/provenance`)
  },
  batch: {
    importCsv: (entity, rows) => request(`${API_BASE}/batch/${entity}/import`, { method: 'POST', body: JSON.stringify({ rows }) }),
    exportCsv: (entity) => request(`${API_BASE}/batch/${entity}/export`),
    modify: (entity, ids, field, value) => request(`${API_BASE}/batch/${entity}/modify`, { method: 'PUT', body: JSON.stringify({ ids, field, value }) })
  },
  units: {
    convertPreview: (field, fromUnit, toUnit, sampleValue) => request(`${API_BASE}/units/preview`, { method: 'POST', body: JSON.stringify({ field, fromUnit, toUnit, sampleValue }) }),
    apply: (field, fromUnit, toUnit) => request(`${API_BASE}/units/apply`, { method: 'POST', body: JSON.stringify({ field, fromUnit, toUnit }) })
  },
  cleaning: {
    simulate: (rule, target) => request(`${API_BASE}/clean/simulate`, { method: 'POST', body: JSON.stringify({ rule, target }) }),
    commit: (rule, target) => request(`${API_BASE}/clean/commit`, { method: 'POST', body: JSON.stringify({ rule, target }) })
  },
  external: {
    import: (source, config) => request(`${API_BASE}/external/import`, { method: 'POST', body: JSON.stringify({ source, config }) }),
    export: (source, config) => request(`${API_BASE}/external/export`, { method: 'POST', body: JSON.stringify({ source, config }) })
  }
};

export async function uploadImportedData(payload) { return postRequest('/import/upload', payload); }
export async function uploadTowData(items) { return postRequest('/sample/management/towInput', items); }
export async function uploadPointData(items) { return postRequest('/sample/management/pointInput', items); }
export async function uploadChemData(items) { chemDataCache = null; return postRequest('/biochem/management/chemInput', items); }
export async function uploadBioData(items) { return postRequest('/biochem/management/bioInput', items); }

export async function deleteBioData(ids) {
  if (!ids || ids.length === 0) return;
  const idsParam = Array.isArray(ids) ? ids.join(',') : ids;
  const url = `${API_BASE}/biochem/management/deleteBio?ids=${idsParam}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    let msg = text || `HTTP ${res.status} ${res.statusText}`;
    try {
      const j = JSON.parse(text);
      msg = j.message || j.error || msg;
    } catch (e) { /* ignore */ }
    throw new Error(msg);
  }
  try { if (text) return JSON.parse(text); } catch (e) { }
  return {};
}

export async function fetchAllChemData(forceRefresh = false) {
  if (chemDataCache && chemDataCache.length > 0 && !forceRefresh) return chemDataCache;
  if (forceRefresh) chemDataCache = null;

  let allData = [];
  let page = 0;
  const pageSize = 99;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await postRequest('/chem-results-main/page', { page: page, size: pageSize });
      if (res && res.data && Array.isArray(res.data)) {
        if (res.data.length > 0) allData = allData.concat(res.data);
        if (typeof res.total === 'number') {
          if (allData.length >= res.total) hasMore = false;
          else page++;
        } else if (res.data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
        if (page > 50) hasMore = false;
      } else {
        hasMore = false;
      }
    } catch (e) {
      hasMore = false;
    }
  }
  if (allData.length > 0) chemDataCache = allData;
  return allData;
}

export async function getChemDataList(params) { return postRequest('/chem-results-main/page', params); }
export async function getChemDataById(id) {
  try {
    const res = await api.chemResults.detail(id);
    if (res && res.data) return res.data;
  } catch (e) { }
  const allData = await fetchAllChemData();
  const item = allData.find(d => d.id == id);
  if (item) return item;
  throw new Error(`未找到ID为 ${id} 的化学数据`);
}
export function queryCruiseStations(params) { return api.stations.page(params); }
export async function getAllChemDataForProfile() { return await fetchAllChemData(); }
export async function getBiologicalPage(params) { return postRequest('/biological-results-main/page', params); }