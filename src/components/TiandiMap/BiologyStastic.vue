<template>
    <div>
        <!-- <button @click="showSidebar" class="showButton">Open Sidebar</button> -->
        <div class="sidebar" :class="{ 'sidebar-open': sidebarVisible }">
            <!-- 侧边栏 -->
            <div style="height: 30px;width: 200px;">
                <i class="iconfont" style="font-size: 30px;" @click="hideSidebar">&#xe899;</i>
                <span class="title-label">统计结果</span>
            </div>
            <div id="selectionsPieChart" class="echart" ref="selectionPieChart" style="width: 100%;height: 50%; margin-top: 20px;"></div>
            <div id="dataTable">
                
                <table>
                    <thead style=" font-weight: bold;">
                        <tr>
                            <th v-for="(item, index) in dataProps" :key="index">{{ item.label }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in selectedData" :key="index">
                            <td v-for="(prop, key) in dataProps" :key="key">{{ FormatData(item[prop.name]) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from "echarts"
export default {
    name: 'BiologyStastic',
    data() {
        return {
            sidebarVisible: false,
            selectedData: [
                {
                    value: 21,
                    name: '叶疣参(Peniagone sp.)'
                },
                {
                    value: 18,
                    name: '蝶参科（Psychropotidae）'
                },
                {
                    value: 15,
                    name: '东参科（Elpidiidae）'
                },
                {
                    value: 8,
                    name: '合鳃鳗科（Synaphobranchidae）',
                },
                {
                    value: 5,
                    name: '海绵动物门（Porifera）',
                }
            ],
            dataProps: [
                {
                    'label': "生物名称",
                    'name': "name",
                },
                {
                    'label': "生物数量",
                    'name': "value",
                }
            ],
            pieChartData: {

            }
        };
    },
    methods: {
        getPieChartData() {
            var pieChartData = [];
            for (const key in this.selectedData) {
                if (pieChartData.length == 0) {
                    pieChartData.push({ name: this.selectedData[key].vernacular, value: 1 });
                }
                else {
                    var isExist = false;
                    for (const key2 in pieChartData) {
                        if (pieChartData[key2].name == this.selectedData[key].vernacular) {
                            pieChartData[key2].value += 1;
                            isExist = true;
                            break;
                        }
                    }
                    if (!isExist) {
                        pieChartData.push({ name: this.selectedData[key].vernacular, value: 1 });
                    }
                }
                // console.log(this.selectedData[key].vernacular);
            }
            console.log(pieChartData);
            return pieChartData;
        },
        SetPieChart() {
            var chartDom = this.$refs.selectionPieChart;
            var myChart = echarts.init(chartDom);
            var option;

            option = {
                tooltip: {
                    trigger: 'item'
                },
                // legend: {
                //     top: '10%',
                //     orient: 'horizontal',
                //     left: 'center'
                // },
                series: [
                    {
                        name: 'Access From',
                        type: 'pie',
                        radius: '50%',
                         top: -20,
                        avoidLabelOverlap: false,
                        data: this.selectedData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            }

            option && myChart.setOption(option);
        },
        FormatData(_data) {
            if (typeof _data === 'object') {
                // return JSON.stringify(_data.type);
                return _data.constructor.name;
            }
            return _data;
        },
        showSidebar(_data = null) {
            if (_data != null) {
                this.selectedData = _data;
            }
            this.sidebarVisible = true;
            
            // if (this.selectedData.length > 0) {
            //     for (const key in this.selectedData) {
            //         console.log(key);
            //         const element = this.selectedData[key];
            //         this.dataProps.push({ key: element.name, label: element.value });
            //         if (Object.prototype.hasOwnProperty.call(this.selectedData[0], key)) {
            //             // const element = this.selectedData[0][key];
            //             // console.log(key + " : " + element);
            //             this.dataProps.push({ key: element.name, label: element.value });
            //         }
            //     }
            //     console.log(this.dataProps);
            // }
            this.SetPieChart();
        },
        hideSidebar() {
            console.log("hide SideBar");
            this.sidebarVisible = false;
            this.selectedData = [];
            this.dataProps = [];
        },
    },
}
</script>

<style scoped>
.sidebar {
    position: absolute;
    top: 0;
    /* 将侧边栏放在窗口外 */
    background-color: rgba(255, 255, 255, 0.75);
    /* right: -100%; */
    right: 100%;
    width: 100% !important;
    height: 50% !important;
    transition: transform 0.3s ease-in-out;
    overflow-y: auto;
    /* 垂直滚动条 */
    overflow-x: auto;
    /* 添加过渡效果 */
}

.sidebar-open {
    transform: translateX(100%);
    /* 将侧边栏移回窗口内 */
}

.showButton {
    position: absolute;
    right: 800px;
    top: 330px;
    color: white;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0px;
    font-family: Arial, sans-serif;
}

#dataTable {
    border-radius: 8px;
    /* margin: 10px; */
    max-height: 90%;
    max-width: 100%;
    overflow-y: auto;
    /* 垂直滚动条 */
    overflow-x: auto;
    /* 防止水平滚动条 */
    border: 1px solid #ddd;
    margin-top: -30px !important;
    font-family: Arial, sans-serif;
}

th,
td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
    color: #333;
    font-weight: bold;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

tr:hover {
    background-color: #eaf2ff;
}

.highlight {
    background-color: #f0f8ff;
}

td:first-child,
th:first-child {
    border-left: none;
}

td:last-child,
th:last-child {
    border-right: none;
}

tbody tr:last-child td {
    border-bottom: none;
}

/* 滚动条宽度 */
::-webkit-scrollbar {
    width: auto;
    border: 1px solid #ebbebe;
    background-color: transparent;
}

/* 滚动条颜色 */
::-webkit-scrollbar-thumb {
    background-color: #d9e1f8;
}

.title-label {
    font-size: 20px;
    font-weight: bold;

    /* margin-left: 10px; */
}
</style>
