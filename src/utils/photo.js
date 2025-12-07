import shengwu from "@/assets/images/shengwu.jpg";
const stationData  = [//存储站点位置信息
    { id: 1, lng: 158.90606, lat: 20.40569 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 2, lng: 158.90843, lat: 19.58073,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 3, lng: 158.8706, lat: 23.09281,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 4, lng: 159.45556, lat: 19.94075,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 5, lng: 156.97338, lat: 20.43096 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 6, lng: 158.93843, lat: 20.82953 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu },
    { id: 7, lng: 160.12771, lat: 23.88421 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 8, lng: 158.33543, lat: 22.58379,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 9, lng: 157.03445, lat: 22.21881,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 10, lng: 159.45556, lat: 19.94075 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 11, lng: 156.97338, lat: 20.43096,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 12, lng: 158.47129, lat: 20.39184 ,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 13, lng: 160.40548, lat: 20.45998,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 14, lng: 160.3351, lat: 20.24005,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 15, lng: 160.84998, lat: 20.92679,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 16, lng: 158.97543, lat: 22.15266,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 17, lng: 160.54633, lat: 22.88359,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 18, lng: 161.09346, lat: 23.17995,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 19, lng: 160.12771, lat: 23.88421,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
    { id: 20, lng: 157.03445, lat: 22.21881,chname:"合鳃鳗科",laname:"Synaphobranchidae",depth:5507,temperature:20.45,sanity:33.13,imageUrl:shengwu},
  ];
  export function openPhoto(stationId) {
     // 查找对应的站点数据
  const station = stationData.find(s => s.id === stationId);
  if (!station) {
    alert("未找到该站点信息！");
    return;
  }

  // 动态生成弹窗内容
  const modalContent = `
   <div style="background: #fff; padding: 20px; border-radius: 16px; width: 400px; height: 420px; text-align: left; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3); font-family: Arial, sans-serif; display: flex; flex-direction: column; position: relative;">
  <!-- 关闭按钮 -->
  <button id="closeModal" style="position: absolute; top: -5px; right: 16px; width: 30px; height: 30px; 
    background-color: white; color: black; border: none; border-radius: 50%; font-size: 30px; cursor: pointer; text-align: center; line-height: 30px;">
    ×
  </button>
  
  <!-- 标题 -->
  <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #333; font-weight: bold; text-align: center;">${station.chname}(${station.laname})</h3>
  
  <!-- 图片区域 -->
  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; justify-content: center; padding-bottom: 40px;">
    <!-- 动态插入图片 -->
    <img src="${station.imageUrl}" alt="${station.chname}" style="width: 100%; height: auto; max-width: 400px; max-height: 350px; border-radius: 10px; margin-bottom: 26px;" />
    
    <!-- 底部按钮 -->
    <div style="position: absolute; bottom: 20px; right: 6px;">
      <button id="downloadChartImage" style="padding: 8px 16px; background-color: #0085ca; color: white; border: none; border-radius: 4px; cursor: pointer; 
        font-size: 15px; transition: background-color 0.3s;"
        onmouseover="this.style.backgroundColor='#005f8a';" 
        onmouseout="this.style.backgroundColor='#0085ca';">
        下载图片
      </button>
    </div>
  </div>
</div>

  `;

  // 创建弹窗
  const modal = document.createElement('div');
  modal.id = 'photoModal';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.zIndex = '9999';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';

  const modalWrapper = document.createElement('div');
  modalWrapper.innerHTML = modalContent;
  modal.appendChild(modalWrapper);
  document.body.appendChild(modal);

  // 绑定关闭按钮
  document.getElementById('closeModal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
   
  }
  