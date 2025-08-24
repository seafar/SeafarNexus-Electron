// js/main.js (繪製方形盤的前端邏輯 - 修正語言切換功能)
document.addEventListener('DOMContentLoaded', () => {

    // --- Global State Variables ---
    let currentFlowYearPalaceIndex = -1, currentDaShianPalaceIndex = -1, currentFlowMonthPalaceIndex = -1, currentFlowDayPalaceIndex = -1;
    let daShianOnlyStartPalace = -1; 
    let daShianOnlyJiLuStem = null;
    let isFlowAnalysisActive = false;
    let isDaShianOnlyActive = false;
    let CHART_SIZE, PADDING, CELL_SIZE;
    let stage, backgroundLayer, arrowLayer, textLayer;
    let flowLuCunPalaceIndex = -1, flowQingYangPalaceIndex = -1, flowTuoLuoPalaceIndex = -1;
    let flowMonthLuCunPalaceIndex = -1, flowMonthQingYangPalaceIndex = -1, flowMonthTuoLuoPalaceIndex = -1;
    let flowDayLuCunPalaceIndex = -1, flowDayQingYangPalaceIndex = -1, flowDayTuoLuoPalaceIndex = -1;
    let birthDetails, placeData, daShianData;

    const CalendarService = {
        _getDayGZ(solarYear, solarMonth, solarDay) {
            const converter = new LunarSolarConverter();
            const refDayInt = converter.SolarToInt(2000, 1, 1);
            const refGanIndex = 6; const refZhiIndex = 4;
            const targetDayInt = converter.SolarToInt(solarYear, solarMonth, solarDay);
            const diff = targetDayInt - refDayInt;
            const dayGanIndex = (refGanIndex + diff % 10 + 10) % 10;
            const dayZhiIndex = (refZhiIndex + diff % 12 + 12) % 12;
            return { gan: HeavenlyStems[dayGanIndex], zhi: EarthlyBranches[dayZhiIndex] };
        },
        getFlowYearInfo(age, birthYear) {
            const flowSolarYear = birthYear + age - 1;
            const ganIndex = (flowSolarYear - 4 + 10) % 10;
            const zhiIndex = (flowSolarYear - 4 + 12) % 12;
            return { flowSolarYear: flowSolarYear, flowYearGan: HeavenlyStems[ganIndex], flowYearZhi: EarthlyBranches[zhiIndex], flowYearPalaceIndex: zhiIndex };
        },
        getFlowMonthInfo(age, birthYear, lunarMonthNumber, flowYearPalaceIndex) {
            const flowMonthPalaceIndex = (flowYearPalaceIndex + (lunarMonthNumber - 1)) % 12;
            const flowMonthPalaceZhi = EarthlyBranches[flowMonthPalaceIndex];
            const flowYearInfo = this.getFlowYearInfo(age, birthYear);
            const flowYearGanIndex = HeavenlyStems.indexOf(flowYearInfo.flowYearGan);
            const flowMonthGan = ziwei.getLunarMonthStem(flowYearGanIndex, lunarMonthNumber);
            return { flowMonthPalaceIndex: flowMonthPalaceIndex, flowMonthPalaceZhi: flowMonthPalaceZhi, flowMonthGan: flowMonthGan, lunarMonthNumber: lunarMonthNumber };
        },
        getFlowDayInfo(age, birthYear, monthNum, dayNum, isLeap, currentFlowMonthPalaceIndex) {
            const flowDayPalaceIndex = (currentFlowMonthPalaceIndex + dayNum - 1) % 12;
            const converter = new LunarSolarConverter();
            const lunarDate = new Lunar();
            const effectiveBirthYear = birthDetails.y > 0 ? birthDetails.y : birthDetails.lunarY;
            lunarDate.lunarYear = this.getFlowYearInfo(age, effectiveBirthYear).flowSolarYear;
            lunarDate.lunarMonth = monthNum;
            lunarDate.lunarDay = dayNum;
            lunarDate.isleap = isLeap;
            const solarDate = converter.LunarToSolar(lunarDate);
            if (solarDate.solarYear === 0) {
                 return { flowDayGan: '無', flowDayZhi: '此日', flowDayPalaceIndex: -1, isValid: false };
            }
            const dayGZ = this._getDayGZ(solarDate.solarYear, solarDate.solarMonth, solarDate.solarDay);
            return { flowDayGan: dayGZ.gan, flowDayZhi: dayGZ.zhi, flowDayPalaceIndex: flowDayPalaceIndex, isValid: true };
        }
    };

    const BASE_CHART_SIZE_REF = 540;
    const BASE_PADDING_REF = 3;
    const BASE_CELL_SIZE_FOR_RATIO = 135;
    const CJK_FONT_STACK = "'Microsoft JhengHei', 'Microsoft YaHei', 'PingFang SC', 'SimHei', sans-serif";
    const CHART_BG_COLOR='#FFFFF7';const BORDER_COLOR='#AAAAAA';
    const OUTER_BORDER_COLOR = '#999999';
    const PALACE_NAME_COLOR='#696969';const MAIN_STAR_COLOR='#880000ff';
    const STEM_BRANCH_COLOR='#333333';const GRAY_COLOR='#808080';
    const BRIGHT_RED='#FF0000';const MAGENTA='#FF00FF';const DEEP_AQUA='#1E90FF';
    const GREEN='#006400';const DEEP_GOLD='#fab301ff';const BLACK='#000000';
    const FLOW_YEAR_HIGHLIGHT_COLOR = '#ff0000';
    const DASHIAN_HIGHLIGHT_COLOR = '#0000FF';
    const FLOW_MONTH_HIGHLIGHT_FILL = '#d8d6ffff'; 
    const FLOW_DAY_HIGHLIGHT_FILL = '#fff0fcff';
    const FLOW_MONTH_ARROW_COLOR = '#8A2BE2'; 
    const FLOW_DAY_ARROW_COLOR = '#dd0194ff'; 
    const HIGHLIGHT_BORDER_WIDTH = 2;
    const HIGHLIGHT_OPACITY = 1.0;
    const DAXIAN_JILU_OFFSET_X_BASE = -2;
    const DAXIAN_JILU_OFFSET_Y_BASE = 8;
    const FLOW_YEAR_JILU_OFFSET_X_BASE = 8;
    const FLOW_YEAR_JILU_OFFSET_Y_BASE = -2;
    const FLOW_MONTH_JILU_OFFSET_X_BASE = -6;
    const FLOW_MONTH_JILU_OFFSET_Y_BASE = 4;
    const FLOW_DAY_JILU_OFFSET_X_BASE = 4;
    const FLOW_DAY_JILU_OFFSET_Y_BASE = -6;

    let activeJiLuStems=[],activeTransmissions={lu:[],quan:[],ke:[],ji:[]},activeCycleTypes={lu:false,quan:false,ke:false,ji:false};

    function translateHtmlElements() {
        document.title = `${birthDetails.name} - ${getString('ui_chart_title')}`;
        document.querySelectorAll('[data-i18n-key]').forEach(el => {
            el.textContent = getString(el.dataset.i18nKey);
        });
    }

    function updateChartDimensions() {
        const chartContainer = document.getElementById('chart-container');
        let availableWidth = chartContainer ? chartContainer.offsetWidth : 0;
        if (availableWidth === 0) availableWidth = BASE_CHART_SIZE_REF;
        const PC_BASE_SIZE = 540, MOBILE_MAX_SIZE_CSS = 420, MIN_CHART_SIZE = 280;
        let calculatedChartSize;
        if (window.innerWidth <= 600 && window.innerHeight > window.innerWidth) { 
            calculatedChartSize = Math.min(window.innerWidth - 10, MOBILE_MAX_SIZE_CSS);
        } else { 
            calculatedChartSize = Math.min(availableWidth, PC_BASE_SIZE);
        }
        CHART_SIZE = Math.max(calculatedChartSize, MIN_CHART_SIZE);
        if (chartContainer) {
            chartContainer.style.width = `${CHART_SIZE}px`;
            chartContainer.style.height = `${CHART_SIZE}px`; 
        }

        const controlsContainer = document.querySelector('.controls');
        if (controlsContainer) {
            if (window.innerWidth > 900) {
                controlsContainer.style.height = `${CHART_SIZE}px`;
            } else {
                controlsContainer.style.height = 'auto';
            }
        }
        
        PADDING = BASE_PADDING_REF * (CHART_SIZE / BASE_CHART_SIZE_REF); 
        CELL_SIZE = (CHART_SIZE - PADDING * 2) / 4;
        if (!stage) {
            stage = new Konva.Stage({container:'chart-container',width:CHART_SIZE,height:CHART_SIZE});
            backgroundLayer = new Konva.Layer(); arrowLayer = new Konva.Layer(); textLayer = new Konva.Layer();
            stage.add(backgroundLayer, arrowLayer, textLayer);
        } else {
            stage.width(CHART_SIZE); stage.height(CHART_SIZE);
        }
    }

    function redrawAll(){
        updateChartDimensions();
        backgroundLayer.destroyChildren(); arrowLayer.destroyChildren(); textLayer.destroyChildren();

        backgroundLayer.add(new Konva.Rect({x:0,y:0,width:CHART_SIZE,height:CHART_SIZE,fill:CHART_BG_COLOR,stroke: OUTER_BORDER_COLOR,strokeWidth: 2 }));
        backgroundLayer.add(new Konva.Rect({x: PADDING + CELL_SIZE, y: PADDING + CELL_SIZE, width: CELL_SIZE * 2, height: CELL_SIZE * 2, fill: CHART_BG_COLOR}));
        
        [currentFlowYearPalaceIndex, currentDaShianPalaceIndex, currentFlowMonthPalaceIndex, currentFlowDayPalaceIndex] = [-1, -1, -1, -1];
        [flowLuCunPalaceIndex, flowQingYangPalaceIndex, flowTuoLuoPalaceIndex] = [-1, -1, -1];
        [flowMonthLuCunPalaceIndex, flowMonthQingYangPalaceIndex, flowMonthTuoLuoPalaceIndex] = [-1, -1, -1];
        [flowDayLuCunPalaceIndex, flowDayQingYangPalaceIndex, flowDayTuoLuoPalaceIndex] = [-1, -1, -1];
        
        if (isFlowAnalysisActive) {
            const flowYearSelect = document.getElementById('flow-year-select');
            const selectedYear = parseInt(flowYearSelect.value, 10);

            if (!isNaN(selectedYear)) {
                const effectiveBirthYear = birthDetails.y > 0 ? birthDetails.y : birthDetails.lunarY;
                const age = selectedYear - effectiveBirthYear + 1;

                if (age > 0) {
                    const flowYearInfo = CalendarService.getFlowYearInfo(age, effectiveBirthYear);
                    currentFlowYearPalaceIndex = flowYearInfo.flowYearPalaceIndex;
                    currentDaShianPalaceIndex = getDaShianPalaceIndexByAge(age);
                    calculateFlowLuYangTuo(flowYearInfo.flowYearGan, 'flow_year');
                    drawFlowAndDaShianJilu(age);
                    
                    const monthNum = parseInt(document.getElementById('flow-lunar-month').value, 10);
                    if (monthNum > 0 && selectedYear > 1887) {
                        const flowMonthInfo = CalendarService.getFlowMonthInfo(age, effectiveBirthYear, monthNum, flowYearInfo.flowYearPalaceIndex);
                        currentFlowMonthPalaceIndex = flowMonthInfo.flowMonthPalaceIndex;
                        calculateFlowLuYangTuo(flowMonthInfo.flowMonthGan, 'flow_month');
                        drawFlowMonthJiLu(flowMonthInfo.flowMonthGan);
                        
                        const dayNum = parseInt(document.getElementById('flow-lunar-day').value, 10);
                        const isLeap = document.getElementById('flow-lunar-leap').checked;
                        if (dayNum > 0) {
                            const flowDayInfo = CalendarService.getFlowDayInfo(age, effectiveBirthYear, monthNum, dayNum, isLeap, flowMonthInfo.flowMonthPalaceIndex);
                            if(flowDayInfo.isValid) {
                                currentFlowDayPalaceIndex = flowDayInfo.flowDayPalaceIndex;
                                calculateFlowLuYangTuo(flowDayInfo.flowDayGan, 'flow_day');
                                drawJiLuArrow(flowDayInfo.flowDayGan, 'linked_flow_day_jilu');
                            }
                        }
                    }
                }
            }
        }
        
        drawGridLines();
        drawAllPalaceContent(); 
        
        activeJiLuStems.forEach(stem=>drawJiLuArrow(stem, 'user_selected'));
        Object.keys(activeTransmissions).forEach(type=>{activeTransmissions[type].forEach(branch=>drawTransmissionArrow(type,branch));});
        for(const type in activeCycleTypes){ if(activeCycleTypes[type]){findAndDrawCycles(type);} }
        
        if (isDaShianOnlyActive && daShianOnlyJiLuStem) {
            drawJiLuArrow(daShianOnlyJiLuStem, 'linked_dashian_jilu');
        }

        drawCenterInfo();
        stage.draw();
    }
    
    // ... 內部的函式 (calculateFlowLuYangTuo, getDaShianPalaceIndexByAge, drawFlowAndDaShianJilu, etc.) 保持不變 ...
    function calculateFlowLuYangTuo(gan, type) {
        const luCunMap = {'甲':'寅','乙':'卯','丙':'巳','戊':'巳','丁':'午','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子'};
        const luCunZhi = luCunMap[gan];
        if (luCunZhi) {
            const luCunZhiIndex = EarthlyBranches.indexOf(luCunZhi);
            const qingYangIndex = (luCunZhiIndex + 1) % 12;
            const tuoLuoIndex = (luCunZhiIndex - 1 + 12) % 12;

            if (type === 'flow_year') {
                flowLuCunPalaceIndex = luCunZhiIndex;
                flowQingYangPalaceIndex = qingYangIndex;
                flowTuoLuoPalaceIndex = tuoLuoIndex;
            } else if (type === 'flow_month') {
                flowMonthLuCunPalaceIndex = luCunZhiIndex;
                flowMonthQingYangPalaceIndex = qingYangIndex;
                flowMonthTuoLuoPalaceIndex = tuoLuoIndex;
            } else if (type === 'flow_day') {
                flowDayLuCunPalaceIndex = luCunZhiIndex;
                flowDayQingYangPalaceIndex = qingYangIndex;
                flowDayTuoLuoPalaceIndex = tuoLuoIndex;
            }
        }
    }

    function getDaShianPalaceIndexByAge(age) {
        if (age <= 0) return -1; 

        // 找出命盤的五行局數 (即最小的大限起始歲數)
        let minStartAge = 121; // 設定一個比最大可能歲數還大的初始值
        for (const rangeStr of daShianData) {
            if (rangeStr) {
                const startAge = parseInt(rangeStr.split('-')[0], 10);
                if (startAge < minStartAge) {
                    minStartAge = startAge;
                }
            }
        }

        // 【核心修正】如果輸入的歲數小於五行局數，則大限在命宮
        if (age < minStartAge) {
            return ziwei.lPos; // ziwei.lPos 中儲存了命宮的索引
        }

        // 對於其他情況，使用原有的邏輯尋找大限區間
        for (let i = 0; i < 12; i++) {
            const rangeStr = daShianData[i]; 
            if (rangeStr) {
                const [startAge, endAge] = rangeStr.split('-').map(Number);
                if (age >= startAge && age <= endAge) return i; 
            }
        }
        return -1; 
    }
    
    function drawFlowAndDaShianJilu(age) {
        const effectiveBirthYear = birthDetails.y > 0 ? birthDetails.y : birthDetails.lunarY;
        const flowYearInfo = CalendarService.getFlowYearInfo(age, effectiveBirthYear);
        const daShianIndex = getDaShianPalaceIndexByAge(age);
        if (daShianIndex !== -1) {
            const daShianStem = placeData[daShianIndex].MangA.split(' ')[0]; 
            drawJiLuArrow(daShianStem, 'linked_dashian_jilu');
        }
        if (flowYearInfo.flowYearGan) {
            drawJiLuArrow(flowYearInfo.flowYearGan, 'linked_flow_year_jilu');
        }
    }

    function drawFlowMonthJiLu(flowMonthGan) {
        drawJiLuArrow(flowMonthGan, 'linked_flow_month_jilu');
    }
    
    function findAndDrawCycles(type){
        const typeKey = `sihua_${type}`;
        const typeIndex={'sihua_lu':0,'sihua_quan':1,'sihua_ke':2,'sihua_ji':3}[typeKey];
        if(typeIndex===undefined) return;
        const transmissionMap = new Array(12).fill(-1);
        for(let i=0; i<12; i++){
            const palaceStem = placeData[i].MangA[0];
            const palaceStemIndex = HeavenlyStems.indexOf(palaceStem);
            const targetStarKey = Star_S04[typeIndex][palaceStemIndex];
            if(!targetStarKey) continue;
            const nextNode = placeData.findIndex(p => p.Stars.some(s => s.startsWith(targetStarKey)));
            transmissionMap[i] = nextNode;
        }
        const drawnCycles = new Set();
        for(let i=0; i<12; i++){
            let path = [], currentNode = i;
            while(currentNode !== -1 && !path.includes(currentNode)){ path.push(currentNode); currentNode = transmissionMap[currentNode]; }
            if(currentNode !== -1){
                const cycleStartIndex = path.indexOf(currentNode);
                const cycleNodes = path.slice(cycleStartIndex);
                const cycleKey = cycleNodes.sort((a,b) => a-b).join('-');
                if(!drawnCycles.has(cycleKey)){
                    const arrowColor={'sihua_lu':DEEP_GOLD,'sihua_quan':GREEN,'sihua_ke':DEEP_AQUA,'sihua_ji':BLACK}[typeKey];
                    cycleNodes.forEach(fromNode => { drawArrow(typeKey, fromNode, transmissionMap[fromNode], arrowColor, false); });
                    drawnCycles.add(cycleKey);
                }
            }
        }
    }

    function drawTransmissionArrow(type,startBranch){
        const typeKey = `sihua_${type}`;
        const typeIndex={'sihua_lu':0,'sihua_quan':1,'sihua_ke':2,'sihua_ji':3}[typeKey];
        const arrowColor={'sihua_lu':DEEP_GOLD,'sihua_quan':GREEN,'sihua_ke':DEEP_AQUA,'sihua_ji':BLACK}[typeKey];
        const startPalaceIndex=EarthlyBranches.indexOf(startBranch);
        const palaceStem=placeData[startPalaceIndex].MangA[0];
        const palaceStemIndex=HeavenlyStems.indexOf(palaceStem);
        const targetStarKey=Star_S04[typeIndex][palaceStemIndex];
        if(!targetStarKey) return;
        const endPalaceIndex=placeData.findIndex(p=>p.Stars.some(s=>s.startsWith(targetStarKey)));
        if(startPalaceIndex===-1||endPalaceIndex===-1)return;
        drawArrow(typeKey,startPalaceIndex,endPalaceIndex,arrowColor,false);
    }
    
    function drawJiLuArrow(stem, contextType = 'user_selected'){
        const transformMap = { '甲':{ji:'star_taiyang',lu:'star_lianzhen'},'乙':{ji:'star_taiyin',lu:'star_tianji'},'丙':{ji:'star_lianzhen',lu:'star_tiantong'}, '丁':{ji:'star_jumen',lu:'star_taiyin'},'戊':{ji:'star_tianji',lu:'star_tanlang'},'己':{ji:'star_wenqu',lu:'star_wuqu'}, '庚':{ji:'star_tiantong',lu:'star_taiyang'},'辛':{ji:'star_wenchang',lu:'star_jumen'},'壬':{ji:'star_wuqu',lu:'star_tianliang'}, '癸':{ji:'star_tanlang',lu:'star_pojun'} };
        const transform = transformMap[stem];
        if(!transform) return;
        let jiPalaceIndex=-1, luPalaceIndex=-1;
        placeData.forEach((p,i)=>{
            if(p.Stars.some(s=>s.startsWith(transform.ji))) jiPalaceIndex=i;
            if(p.Stars.some(s=>s.startsWith(transform.lu))) luPalaceIndex=i;
        });
        if(jiPalaceIndex === -1 || luPalaceIndex === -1) return;
        let color = MAGENTA, isDashed = true, offsetX = 0, offsetY = 0;
        const scale = CELL_SIZE / BASE_CELL_SIZE_FOR_RATIO;
        if (contextType === 'linked_dashian_jilu') { color = DASHIAN_HIGHLIGHT_COLOR; offsetX = DAXIAN_JILU_OFFSET_X_BASE * scale; offsetY = DAXIAN_JILU_OFFSET_Y_BASE * scale; } 
        else if (contextType === 'linked_flow_year_jilu') { color = FLOW_YEAR_HIGHLIGHT_COLOR; offsetX = FLOW_YEAR_JILU_OFFSET_X_BASE * scale; offsetY = FLOW_YEAR_JILU_OFFSET_Y_BASE * scale; }
        else if (contextType === 'linked_flow_month_jilu') { color = FLOW_MONTH_ARROW_COLOR; offsetX = FLOW_MONTH_JILU_OFFSET_X_BASE * scale; offsetY = FLOW_MONTH_JILU_OFFSET_Y_BASE * scale; }
        else if (contextType === 'linked_flow_day_jilu') { color = FLOW_DAY_ARROW_COLOR; isDashed = true; offsetX = FLOW_DAY_JILU_OFFSET_X_BASE * scale; offsetY = FLOW_DAY_JILU_OFFSET_Y_BASE * scale; }
        drawArrow('jilu', jiPalaceIndex, luPalaceIndex, color, isDashed, offsetX, offsetY);
    }
    
    function drawArrow(type, startIndex, endIndex, color, isDashed, extraOffsetX = 0, extraOffsetY = 0){
        const ORIGINAL_COORDS = { jilu:{start:{x:6,y:2},end:{x:11.37,y:12.73}}, sihua_lu:{start:{x:4,y:0},end:{x:6.91,y:11.64}}, sihua_quan:{start:{x:8,y:0},end:{x:10.91,y:11.64}}, sihua_ke:{start:{x:10,y:0},end:{x:12.91,y:11.64}}, sihua_ji:{start:{x:12,y:0},end:{x:8.91,y:11.64}} };
        const coords = ORIGINAL_COORDS[type] || ORIGINAL_COORDS['jilu'];
        const gridPositions=[{x:2,y:3},{x:1,y:3},{x:0,y:3},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:3,y:1},{x:3,y:2},{x:3,y:3}];
        const startPos=gridPositions[startIndex], endPos=gridPositions[endIndex];
        if(!startPos||!endPos)return;
        const scale = CELL_SIZE / BASE_CELL_SIZE_FOR_RATIO;
        const startCellCenterX=PADDING+startPos.x*CELL_SIZE+CELL_SIZE/2, startCellCenterY=PADDING+startPos.y*CELL_SIZE+CELL_SIZE/2;
        const endCellCenterX=PADDING+endPos.x*CELL_SIZE+CELL_SIZE/2, endCellCenterY=PADDING+endPos.y*CELL_SIZE+CELL_SIZE/2;
        const startX=startCellCenterX+(coords.start.x*scale)+extraOffsetX, startY=startCellCenterY+(coords.start.y*scale)+extraOffsetY;
        const endX=endCellCenterX+(coords.end.x*scale)+extraOffsetX, endY=endCellCenterY+(coords.end.y*scale)+extraOffsetY;
        let dashPattern = isDashed ? [8, 3] : [];
        let strokeWidth = 0.8; 
        if (color === FLOW_MONTH_ARROW_COLOR || color === FLOW_DAY_ARROW_COLOR) { dashPattern = [2, 4]; strokeWidth = 0.8; }
        arrowLayer.add(new Konva.Arrow({ points:[startX,startY,endX,endY], pointerLength:13*scale, pointerWidth:3*scale, fill:color, stroke:color, strokeWidth: strokeWidth, dash: dashPattern }));
    }
    
    function drawGridLines(){
        const gridPositions = [{x:2,y:3}, {x:1,y:3}, {x:0,y:3}, {x:0,y:2}, {x:0,y:1}, {x:0,y:0}, {x:1,y:0}, {x:2,y:0}, {x:3,y:0}, {x:3,y:1}, {x:3,y:2}, {x:3,y:3}];
        for (let i = 0; i < 12; i++) {
            const pos = gridPositions[i]; 
            backgroundLayer.add(new Konva.Rect({ x: PADDING + pos.x * CELL_SIZE, y: PADDING + pos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE, stroke: BORDER_COLOR, strokeWidth: 1 }));
        }
        if (isFlowAnalysisActive) {
            if (currentFlowMonthPalaceIndex !== -1) {
                const pos = gridPositions[currentFlowMonthPalaceIndex];
                backgroundLayer.add(new Konva.Rect({ x: PADDING + pos.x * CELL_SIZE, y: PADDING + pos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE, fill: FLOW_MONTH_HIGHLIGHT_FILL, opacity: HIGHLIGHT_OPACITY }));
            }
            if (currentFlowDayPalaceIndex !== -1) {
                const pos = gridPositions[currentFlowDayPalaceIndex];
                backgroundLayer.add(new Konva.Rect({ x: PADDING + pos.x * CELL_SIZE, y: PADDING + pos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE, fill: FLOW_DAY_HIGHLIGHT_FILL, opacity: HIGHLIGHT_OPACITY }));
            }
        }
        if (isFlowAnalysisActive) {
            if (currentDaShianPalaceIndex !== -1) {
                const pos = gridPositions[currentDaShianPalaceIndex];
                backgroundLayer.add(new Konva.Rect({ x: PADDING + pos.x * CELL_SIZE, y: PADDING + pos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE, stroke: DASHIAN_HIGHLIGHT_COLOR, strokeWidth: HIGHLIGHT_BORDER_WIDTH }));
            }
            if (currentFlowYearPalaceIndex !== -1) {
                const pos = gridPositions[currentFlowYearPalaceIndex];
                backgroundLayer.add(new Konva.Rect({ x: PADDING + pos.x * CELL_SIZE, y: PADDING + pos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE, stroke: FLOW_YEAR_HIGHLIGHT_COLOR, strokeWidth: HIGHLIGHT_BORDER_WIDTH }));
            }
        } else if (isDaShianOnlyActive) {
            if (daShianOnlyStartPalace !== -1) {
                const pos = gridPositions[daShianOnlyStartPalace];
                backgroundLayer.add(new Konva.Rect({ x: PADDING + pos.x * CELL_SIZE, y: PADDING + pos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE, stroke: DASHIAN_HIGHLIGHT_COLOR, strokeWidth: HIGHLIGHT_BORDER_WIDTH }));
            }
        }
    }

    function drawAllPalaceContent(){
        const gridPositions=[{x:2,y:3},{x:1,y:3},{x:0,y:3},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:3,y:1},{x:3,y:2},{x:3,y:3}];
        placeData.forEach((palace,index)=>{
            const pos=gridPositions[index];
            const group=new Konva.Group({x:PADDING+pos.x*CELL_SIZE,y:PADDING+pos.y*CELL_SIZE});
            drawPalaceContent(group,{palaceNameKey:palace.MangB,isBodyPalace:!!palace.MangC,stars:palace.Stars,daShian:daShianData[index],stemBranch:palace.MangA, palaceIndex: index});
            textLayer.add(group);
        });
    }
    
    function addTextWithBg(group, textNode, bgColor, bgOpacity = 1){
        const padding = 1.5 * (CELL_SIZE / BASE_CELL_SIZE_FOR_RATIO);
        const bgRect = new Konva.Rect({ x: textNode.x() - padding, y: textNode.y() - padding, width: textNode.width() + (padding * 2), height: textNode.height() + (padding * 2), fill: bgColor, opacity: bgOpacity });
        group.add(bgRect);
        group.add(textNode);
    }

    function drawPalaceContent(group,data){
        let textBgColor = CHART_BG_COLOR;
        const textBgOpacity = 1.0;
        if (isFlowAnalysisActive) {
            if (data.palaceIndex === currentFlowMonthPalaceIndex) textBgColor = FLOW_MONTH_HIGHLIGHT_FILL;
            if (data.palaceIndex === currentFlowDayPalaceIndex) textBgColor = FLOW_DAY_HIGHLIGHT_FILL;
        }
        const PIXEL_SCALE = CELL_SIZE / BASE_CELL_SIZE_FOR_RATIO;
        const Y_START = 5 * PIXEL_SCALE; 
        const Y_SPACING = 18 * PIXEL_SCALE;
        const sihuaColorMap={'sihua_lu':DEEP_GOLD,'sihua_quan':GREEN,'sihua_ke':DEEP_AQUA,'sihua_ji':BLACK};
        const importantStars = [], miscStars = [];
        data.stars.forEach(star => {
            const starKey = star.split('(')[0];
            if (StarM_A14_Keys.includes(starKey) || [...StarM_A07_Keys, ...StarM_B06_Keys].includes(starKey)) { importantStars.push(star); } 
            else { miscStars.push(star); }
        });
        importantStars.forEach((star, index) => {
            let starKey=star, sihuaKey='';
            if(star.includes('(')){ const match=star.match(/(.*)\((.*)\)/); if(match){ starKey=match[1]; sihuaKey=match[2]; } }
            let color = GRAY_COLOR, fontStyle = 'bold';
            if(StarM_A14_Keys.includes(starKey)) color=MAIN_STAR_COLOR;
            else if (['star_wenchang', 'star_wenqu', 'star_zuofu', 'star_youbi', 'star_tiankui', 'star_tianyue'].includes(starKey)) color=DEEP_AQUA;
            else if (['star_dikong','star_dijie','star_huoxing','star_lingxing'].includes(starKey)) color=BRIGHT_RED;
            else if (['star_qingyang','star_tuoluo'].includes(starKey)) color=GREEN;
            else if (starKey==='star_lucun') color=DEEP_GOLD;
            const starX = 8 * PIXEL_SCALE, starY = Y_START + (index * Y_SPACING);
            const baseFontSize = 14 * PIXEL_SCALE;
            const starTextNode = new Konva.Text({ x: starX, y: starY, text: getString(starKey), fontSize: baseFontSize * 1.15, fill: color, fontStyle: fontStyle, fontFamily: CJK_FONT_STACK });
            addTextWithBg(group, starTextNode, textBgColor, textBgOpacity);
            let currentRightEdge = starTextNode.x() + starTextNode.width();
            const brightnessLevelKey = StarBrightness[starKey] ? StarBrightness[starKey][data.palaceIndex] : null;
            if (brightnessLevelKey) {
                const brightnessNode = new Konva.Text({ x: currentRightEdge + 2*PIXEL_SCALE, y: starY, text: getString(brightnessLevelKey), fontSize: 12*PIXEL_SCALE*1.3, fill: GRAY_COLOR, fontFamily: CJK_FONT_STACK });
                addTextWithBg(group, brightnessNode, textBgColor, textBgOpacity);
                currentRightEdge = brightnessNode.x() + brightnessNode.width();
            }
            if (sihuaKey) {
                const sihuaColor = sihuaColorMap[sihuaKey] || BLACK;
                const sihuaTextNode = new Konva.Text({ x: currentRightEdge + 4*PIXEL_SCALE, y: starY, text: getString(sihuaKey), fontSize: 14*PIXEL_SCALE*1.15, fill: sihuaColor, fontStyle: 'bold', fontFamily: CJK_FONT_STACK });
                addTextWithBg(group, sihuaTextNode, textBgColor, textBgOpacity);
            }
        });
        const MISC_FONT_SIZE = 12 * PIXEL_SCALE, MISC_LINE_HEIGHT = MISC_FONT_SIZE * 1.2;
        const PALACE_BOTTOM_MARGIN = 18 * PIXEL_SCALE, MISC_X_OFFSET = 6 * PIXEL_SCALE;
        let miscCurrentY = Y_START, miscColumnX = CELL_SIZE - MISC_X_OFFSET;
        miscStars.forEach(starKey => {
            const starName = (starKey === 'star_nianhuagai') ? getString('star_huagai') : getString(starKey);
            const starWidth = new Konva.Text({text: starName, fontSize: MISC_FONT_SIZE, fontFamily: CJK_FONT_STACK}).width();
            if (miscCurrentY + MISC_LINE_HEIGHT < CELL_SIZE - PALACE_BOTTOM_MARGIN) {
                const starNode = new Konva.Text({x: miscColumnX-starWidth, y: miscCurrentY, text: starName, fontSize: MISC_FONT_SIZE, fill: GRAY_COLOR, fontFamily: CJK_FONT_STACK});
                addTextWithBg(group, starNode, textBgColor, textBgOpacity);
                miscCurrentY += MISC_LINE_HEIGHT;
            }
        });
        let currentFlowStarY = CELL_SIZE - PALACE_BOTTOM_MARGIN - (8 * PIXEL_SCALE);
        const flowDayStarsToDraw = [];
        if (data.palaceIndex === flowDayLuCunPalaceIndex) flowDayStarsToDraw.push({ nameKey: 'flow_day_lucun', color: DEEP_GOLD });
        if (data.palaceIndex === flowDayQingYangPalaceIndex) flowDayStarsToDraw.push({ nameKey: 'flow_day_qingyang', color: GREEN }); 
        if (data.palaceIndex === flowDayTuoLuoPalaceIndex) flowDayStarsToDraw.push({ nameKey: 'flow_day_tuoluo', color: GREEN });
        flowDayStarsToDraw.reverse().forEach(flowStar => {
            const flowStarTextNode = new Konva.Text({ text: getString(flowStar.nameKey), fontSize: 11 * PIXEL_SCALE, fill: flowStar.color, fontStyle: 'bold', fontFamily: CJK_FONT_STACK });
            flowStarTextNode.x((CELL_SIZE - flowStarTextNode.width()) / 2);
            flowStarTextNode.y(currentFlowStarY - flowStarTextNode.height());
            addTextWithBg(group, flowStarTextNode, textBgColor, textBgOpacity);
            currentFlowStarY -= (flowStarTextNode.height() * 1.1);
        });
        const flowMonthStarsToDraw = [];
        if (data.palaceIndex === flowMonthLuCunPalaceIndex) flowMonthStarsToDraw.push({ nameKey: 'flow_month_lucun', color: DEEP_GOLD });
        if (data.palaceIndex === flowMonthQingYangPalaceIndex) flowMonthStarsToDraw.push({ nameKey: 'flow_month_qingyang', color: GREEN }); 
        if (data.palaceIndex === flowMonthTuoLuoPalaceIndex) flowMonthStarsToDraw.push({ nameKey: 'flow_month_tuoluo', color: GREEN }); 
        flowMonthStarsToDraw.reverse().forEach(flowStar => {
            const flowStarTextNode = new Konva.Text({ text: getString(flowStar.nameKey), fontSize: 12 * PIXEL_SCALE, fill: flowStar.color, fontStyle: 'bold', fontFamily: CJK_FONT_STACK });
            flowStarTextNode.x((CELL_SIZE - flowStarTextNode.width()) / 2);
            flowStarTextNode.y(currentFlowStarY - flowStarTextNode.height());
            addTextWithBg(group, flowStarTextNode, textBgColor, textBgOpacity);
            currentFlowStarY -= (flowStarTextNode.height() * 1.1 + 3 * PIXEL_SCALE);
        });
        const flowStarsToDraw = [];
        if (data.palaceIndex === flowLuCunPalaceIndex) flowStarsToDraw.push({ nameKey: 'flow_star_lucun', color: DEEP_GOLD });
        if (data.palaceIndex === flowQingYangPalaceIndex) flowStarsToDraw.push({ nameKey: 'flow_star_qingyang', color: GREEN }); 
        if (data.palaceIndex === flowTuoLuoPalaceIndex) flowStarsToDraw.push({ nameKey: 'flow_star_tuoluo', color: GREEN }); 
        flowStarsToDraw.reverse().forEach(flowStar => { 
            const flowStarTextNode = new Konva.Text({ text: getString(flowStar.nameKey), fontSize: 12 * PIXEL_SCALE, fill: flowStar.color, fontStyle: 'bold', fontFamily: CJK_FONT_STACK });
            flowStarTextNode.x((CELL_SIZE - flowStarTextNode.width()) / 2);
            flowStarTextNode.y(currentFlowStarY - flowStarTextNode.height());
            addTextWithBg(group, flowStarTextNode, textBgColor, textBgOpacity);
            currentFlowStarY -= flowStarTextNode.height() * 1.1;
        });
        const bottomY=CELL_SIZE-18*PIXEL_SCALE; 
        let ageRangeText=data.daShian; if(ageRangeText && parseInt(ageRangeText.split('-')[0],10)>105)ageRangeText='';
        const ageTextNode = new Konva.Text({x:8*PIXEL_SCALE,y:bottomY,text:ageRangeText,fontSize:12*PIXEL_SCALE,fill:STEM_BRANCH_COLOR, fontFamily: CJK_FONT_STACK});
        addTextWithBg(group, ageTextNode, textBgColor, textBgOpacity);
        const rawPalaceName = getString(data.palaceNameKey).replace(getString('ui_palace_char'), '');
        let formattedPalaceName;
        if (data.palaceNameKey === 'palace_life') { formattedPalaceName = data.isBodyPalace ? `${getString('ui_life_char')}◆${getString('ui_palace_char')}` : `${getString('ui_life_char')}★${getString('ui_palace_char')}`; } 
        else { formattedPalaceName = data.isBodyPalace ? `${rawPalaceName[0]}◆${rawPalaceName.substring(1)}` : rawPalaceName; }
        const palaceText=new Konva.Text({y:bottomY,text:formattedPalaceName,fontSize:12*PIXEL_SCALE,fill:PALACE_NAME_COLOR,fontStyle:'bold', fontFamily: CJK_FONT_STACK});
        palaceText.x((CELL_SIZE-palaceText.width())/2);
        addTextWithBg(group,palaceText,textBgColor, textBgOpacity);
        const stemBranchNode = new Konva.Text({x:CELL_SIZE-45*PIXEL_SCALE,y:bottomY,width:40*PIXEL_SCALE,text:data.stemBranch,fontSize:12*PIXEL_SCALE,fill:STEM_BRANCH_COLOR,align:'right', fontFamily: CJK_FONT_STACK});
        addTextWithBg(group, stemBranchNode, textBgColor, textBgOpacity);
    }
    
    function drawCenterInfo(){
        const group = new Konva.Group({x:PADDING+CELL_SIZE,y:PADDING+CELL_SIZE});
        const PIXEL_SCALE = CELL_SIZE / BASE_CELL_SIZE_FOR_RATIO; 
        const TEXT_FONT_SIZE = 13 * PIXEL_SCALE, LINE_HEIGHT = TEXT_FONT_SIZE * 1.6; 
        const LEFT_ALIGN_X = 20 * PIXEL_SCALE, USABLE_WIDTH = CELL_SIZE * 2 - (LEFT_ALIGN_X * 2);
        let currentY = 10 * PIXEL_SCALE;
        const addLine = (text, color=BLACK, style='normal') => {
            group.add(new Konva.Text({
                x:LEFT_ALIGN_X, 
                y:currentY, 
                width:USABLE_WIDTH, 
                text:text, 
                fontSize:TEXT_FONT_SIZE, 
                fill:color, 
                fontStyle:style, 
                fontFamily:CJK_FONT_STACK,
                align: 'left'
            }));
            currentY += LINE_HEIGHT;
        };
        addLine(getString('ui_app_title_version'), GRAY_COLOR);
        addLine(birthDetails.name);
        addLine(`${getString(ziwei.getYinYangKey())}${getString(ziwei.getGenderKey())} ${getString(ziwei.getFiveElementKey())} (${getString(ziwei.getShengXiaoKey())})`);
        if (birthDetails.y > 0) {
            const solarDateString=`${getString('ui_solar_prefix')}${birthDetails.y}${getString('ui_year_char')} ${birthDetails.m}${getString('ui_month_char')} ${birthDetails.d}${getString('ui_day_char')} ${birthDetails.hour}${getString('ui_hour_char')}`;
            addLine(solarDateString);
        }
        const h_branch = EarthlyBranches[Math.floor(((birthDetails.hour + 1) % 24) / 2)];
        const lunarDateString = `${getString('ui_lunar_prefix')}${ziwei.y}(${birthDetails.lunarY})${getString('ui_year_char')} ` + `${birthDetails.isLeap ? getString('ui_leap_char') : ''}${getString('lunar_month_' + birthDetails.lunarM)} ${getString('lunar_day_' + birthDetails.lunarD)} ${h_branch}${getString('ui_hour_char')}`;
        addLine(lunarDateString);
        let infoTextLine1 = '', infoTextLine2 = '';
        if (isFlowAnalysisActive) {
            const flowYearSelect = document.getElementById('flow-year-select');
            const solarYear = parseInt(flowYearSelect.value, 10);
            if (!isNaN(solarYear)) {
                const effectiveBirthYear = birthDetails.y > 0 ? birthDetails.y : birthDetails.lunarY;
                const age = solarYear - effectiveBirthYear + 1;
                if (age > 0) {
                    const flowYearInfo = CalendarService.getFlowYearInfo(age, effectiveBirthYear);
                    const daShianIndex = getDaShianPalaceIndexByAge(age);
                    const daShianStemBranchText = daShianIndex !== -1 ? placeData[daShianIndex].MangA.split(' ').join('') : '';
                    infoTextLine1 = `${daShianStemBranchText}${getString('ui_dashian_char_short')} ` + `${flowYearInfo.flowSolarYear}(${flowYearInfo.flowYearGan}${flowYearInfo.flowYearZhi})${getString('ui_year_char')} ` + `${age}${getString('ui_age_char')}`;
                    if (solarYear > 1887) {
                        const monthNum = parseInt(document.getElementById('flow-lunar-month').value, 10);
                        if (monthNum > 0) {
                            const flowMonthInfo = CalendarService.getFlowMonthInfo(age, effectiveBirthYear, monthNum, flowYearInfo.flowYearPalaceIndex);
                            const monthName = getString(`lunar_month_${monthNum}`).replace(getString('ui_month_char'), '');
                            const monthBranch = EarthlyBranches[(monthNum + 1) % 12];
                            const flowMonthText = `${monthName}(${flowMonthInfo.flowMonthGan}${monthBranch})${getString('ui_month_char_short')}`;
                            let flowDayText = '';
                            const dayNum = parseInt(document.getElementById('flow-lunar-day').value, 10);
                            const isLeap = document.getElementById('flow-lunar-leap').checked;
                            if (dayNum > 0) {
                                const flowDayInfo = CalendarService.getFlowDayInfo(age, effectiveBirthYear, monthNum, dayNum, isLeap, flowMonthInfo.flowMonthPalaceIndex);
                                const dayName = getString(`lunar_day_${dayNum}`);
                                if(flowDayInfo.isValid){ flowDayText = ` ${dayName}(${flowDayInfo.flowDayGan}${flowDayInfo.flowDayZhi})${getString('ui_day_char_short')}`; }
                                else { flowDayText = ` ${dayName}(${getString('ui_day_invalid')})`; }
                            }
                            infoTextLine2 = `${flowMonthText}${flowDayText}`;
                        }
                    }
                }
            }
        } else if (isDaShianOnlyActive) {
            if (daShianOnlyStartPalace >= 0) {
                const daShianStemBranchText = placeData[daShianOnlyStartPalace].MangA.split(' ').join('');
                infoTextLine1 = `${getString('ui_dashian_char')}: ${daShianStemBranchText} (${daShianData[daShianOnlyStartPalace]}${getString('ui_age_char')})`;
            }
        }
        if(infoTextLine1) addLine(infoTextLine1, FLOW_YEAR_HIGHLIGHT_COLOR, 'normal');
        if(infoTextLine2) addLine(infoTextLine2, FLOW_YEAR_HIGHLIGHT_COLOR, 'normal');
        textLayer.add(group);
    }
    
    function setupControls() {
        // 【問題一修正】從此處加入語言切換邏輯
        const currentParams = new URLSearchParams(window.location.search);
        const twLink = document.getElementById('lang-tw-link');
        if (twLink) { 
            const twParams = new URLSearchParams(currentParams); 
            twParams.set('lang', 'zh-TW'); 
            twLink.href = `chart.html?${twParams.toString()}`;
        }
        const cnLink = document.getElementById('lang-cn-link');
        if (cnLink) { 
            const cnParams = new URLSearchParams(currentParams); 
            cnParams.set('lang', 'zh-CN'); 
            cnLink.href = `chart.html?${cnParams.toString()}`;
        }
        // 這段判斷需要在 birthDetails 物件被賦值後執行，所以我們在檔案末尾的主邏輯中再次呼叫它
        const setActiveLanguageLink = () => {
            if (birthDetails && birthDetails.lang === 'zh-CN') { 
                cnLink?.classList.add('active'); 
                twLink?.classList.remove('active'); 
            } else { 
                twLink?.classList.add('active'); 
                cnLink?.classList.remove('active'); 
            }
        };

        const toggleFlowAnalysisBtn = document.getElementById('toggle-flow-analysis-btn');
        const flowControlsWrapper = document.getElementById('flow-controls-wrapper');
        const verticalTabButtons = document.querySelectorAll('.vertical-tab-buttons .tab-button');
        const solarMonthSelect = document.getElementById('flow-solar-month');
        const solarDaySelect = document.getElementById('flow-solar-day');
        const lunarMonthSelect = document.getElementById('flow-lunar-month');
        const lunarDaySelect = document.getElementById('flow-lunar-day');
        const lunarLeapCheckbox = document.getElementById('flow-lunar-leap');
        const toggleDaShianOnlyBtn = document.getElementById('toggle-dashian-only-btn');
        const dashianOnlySelect = document.getElementById('dashian-only-select');
        const flowYearSelect = document.getElementById('flow-year-select');
        const flowTabButtons = document.querySelectorAll('.flow-tabs .flow-tab-button');
        const flowTabPanes = document.querySelectorAll('.flow-tab-content .flow-tab-pane');
        let isSyncing = false;
        const flowConverter = new LunarSolarConverter();
        verticalTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('.vertical-tab-buttons .tab-button.active')?.classList.remove('active');
                document.querySelector('.tab-content .tab-pane.active')?.classList.remove('active');
                button.classList.add('active');
                const targetPane = document.getElementById(button.dataset.tab);
                if(targetPane) targetPane.classList.add('active');
            });
        });
        flowTabButtons.forEach(button => {
            button.addEventListener('click', function() {
                if(this.disabled) return;
                flowTabButtons.forEach(btn => btn.classList.remove('active'));
                flowTabPanes.forEach(pane => pane.classList.remove('active'));
                this.classList.add('active');
                const targetPane = document.getElementById(`${this.dataset.tab}-flow-tab`);
                if(targetPane) targetPane.classList.add('active');
            });
        });
        function populateFlowYearSelect() {
            if (!flowYearSelect) return;
            const effectiveBirthYear = birthDetails.y > 0 ? birthDetails.y : birthDetails.lunarY;
            flowYearSelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = ""; defaultOption.textContent = "請選擇流年"; defaultOption.disabled = true; defaultOption.selected = true;
            flowYearSelect.appendChild(defaultOption);
            for (let age = 1; age <= 120; age++) {
                const flowYear = effectiveBirthYear + age - 1;
                const ganIndex = (flowYear - 4 + 10) % 10; const zhiIndex = (flowYear - 4 + 12) % 12;
                const ganzhi = `${HeavenlyStems[ganIndex]}${EarthlyBranches[zhiIndex]}`;
                const option = document.createElement('option');
                option.value = flowYear; option.textContent = `${flowYear} (${ganzhi}) 虛${age}歲`;
                flowYearSelect.appendChild(option);
            }
        }
        
        function populateDaShianSelect() {
            if (!dashianOnlySelect) return;
            dashianOnlySelect.innerHTML = '';
            dashianOnlySelect.appendChild(new Option(getString('ui_select_dashian'), '-1'));

            const optionsData = [];
            daShianData.forEach((range, index) => {
                if (range) {
                    optionsData.push({
                        range: range,
                        startAge: parseInt(range.split('-')[0], 10),
                        palaceName: getString(placeData[index].MangB),
                        palaceIndex: index
                    });
                }
            });

            optionsData.sort((a, b) => a.startAge - b.startAge);

            optionsData.forEach(data => {
                const text = getString('ui_dashian_option_format').replace('{range}', data.range).replace('{palace}', data.palaceName);
                dashianOnlySelect.appendChild(new Option(text, data.palaceIndex));
            });
        }
        
        function updateSolarDayOptions(year, month, selectedDay) {
            if (!solarDaySelect) return;
            const daysInMonth = (month > 0 && year > 0) ? new Date(year, month, 0).getDate() : 31;
            solarDaySelect.innerHTML = '';
            solarDaySelect.appendChild(new Option(getString('ui_no_day'), '0'));
            for (let i = 1; i <= daysInMonth; i++) solarDaySelect.appendChild(new Option(i, i));
            let dayToSet = selectedDay > 0 ? selectedDay : 1;
            if (dayToSet > daysInMonth) dayToSet = daysInMonth;
            solarDaySelect.value = dayToSet;
        }
        function processFlowDateUpdate(sourceTab) {
            if (isSyncing) return; isSyncing = true;
            const lYear = parseInt(flowYearSelect.value, 10);
            if (isNaN(lYear) || lYear < 1888) { isSyncing = false; return; }
            const sMonth = parseInt(solarMonthSelect.value, 10);
            const sDay = parseInt(solarDaySelect.value, 10);
            const lMonth = parseInt(lunarMonthSelect.value, 10);
            const lDay = parseInt(lunarDaySelect.value, 10);
            if (sourceTab === 'solar' && sMonth > 0 && sDay > 0) {
                const solar = new Solar(); solar.solarYear = lYear; solar.solarMonth = sMonth; solar.solarDay = sDay;
                const lunar = flowConverter.SolarToLunar(solar);
                lunarMonthSelect.value = lunar.lunarMonth;
                lunarDaySelect.value = lunar.lunarDay;
                if(lunarLeapCheckbox) lunarLeapCheckbox.checked = lunar.isleap;
            } else if (sourceTab === 'lunar' && lMonth > 0 && lDay > 0) {
                const lunar = new Lunar(); lunar.lunarYear = lYear; lunar.lunarMonth = lMonth; lunar.lunarDay = lDay; lunar.isleap = lunarLeapCheckbox.checked;
                const solar = flowConverter.LunarToSolar(lunar);
                if (solar.solarYear > 0) {
                    solarMonthSelect.value = solar.solarMonth;
                    updateSolarDayOptions(solar.solarYear, solar.solarMonth, solar.solarDay);
                }
            }
            redrawAll(); isSyncing = false;
        }
        toggleFlowAnalysisBtn?.addEventListener('click', () => {
            isFlowAnalysisActive = !isFlowAnalysisActive;
            toggleFlowAnalysisBtn.classList.toggle('active', isFlowAnalysisActive);
            if(flowControlsWrapper) flowControlsWrapper.classList.toggle('hidden', !isFlowAnalysisActive);
            if(isFlowAnalysisActive && isDaShianOnlyActive) toggleDaShianOnlyBtn.click();
            redrawAll();
        });
        flowYearSelect?.addEventListener('change', () => {
            const solarTabButton = document.querySelector('.flow-tab-button[data-tab="solar"]');
            if (parseInt(flowYearSelect.value, 10) > 1887) {
                if(solarTabButton) solarTabButton.disabled = false;
                processFlowDateUpdate('lunar');
            } else {
                if(solarTabButton) solarTabButton.disabled = true;
            }
            redrawAll();
        });
        toggleDaShianOnlyBtn?.addEventListener('click', function() {
            isDaShianOnlyActive = !isDaShianOnlyActive;
            this.classList.toggle('active', isDaShianOnlyActive);
            if(dashianOnlySelect) dashianOnlySelect.disabled = !isDaShianOnlyActive;
            if (isDaShianOnlyActive) {
                if (isFlowAnalysisActive) toggleFlowAnalysisBtn.click();
                if (dashianOnlySelect && dashianOnlySelect.options.length > 1) {
                    dashianOnlySelect.selectedIndex = 1;
                    dashianOnlySelect.dispatchEvent(new Event('change'));
                }
            } else {
                if (dashianOnlySelect) dashianOnlySelect.value = "-1";
                daShianOnlyStartPalace = -1; daShianOnlyJiLuStem = null;
            }
            redrawAll();
        });
        dashianOnlySelect?.addEventListener('change', function() {
            daShianOnlyStartPalace = parseInt(this.value, 10);
            if (daShianOnlyStartPalace >= 0) { daShianOnlyJiLuStem = placeData[daShianOnlyStartPalace].MangA.split(' ')[0]; } 
            else { daShianOnlyJiLuStem = null; }
            redrawAll();
        });
        if (solarMonthSelect && solarDaySelect) { [solarMonthSelect, solarDaySelect].forEach(el => el.addEventListener('change', () => processFlowDateUpdate('solar'))); }
        if (lunarMonthSelect && lunarDaySelect && lunarLeapCheckbox) { [lunarMonthSelect, lunarDaySelect, lunarLeapCheckbox].forEach(el => el.addEventListener('change', () => processFlowDateUpdate('lunar'))); }
        if(lunarMonthSelect) { lunarMonthSelect.innerHTML = ''; lunarMonthSelect.appendChild(new Option(getString('ui_no_month'), '0')); for (let i = 1; i <= 12; i++) lunarMonthSelect.appendChild(new Option(getString(`lunar_month_${i}`), i)); }
        if(lunarDaySelect) { lunarDaySelect.innerHTML = ''; lunarDaySelect.appendChild(new Option(getString('ui_no_day'), '0')); for (let i = 1; i <= 30; i++) lunarDaySelect.appendChild(new Option(getString(`lunar_day_${i}`), i)); }
        if(solarMonthSelect) { solarMonthSelect.innerHTML = ''; solarMonthSelect.appendChild(new Option(getString('ui_no_month'), '0')); for (let i = 1; i <= 12; i++) solarMonthSelect.appendChild(new Option(i, i)); }
        updateSolarDayOptions(0,0,0);
        document.querySelectorAll('.stem-checkbox').forEach(cb => cb.addEventListener('change', function() {
            const stem = this.value;
            if (this.checked) { if (!activeJiLuStems.includes(stem)) activeJiLuStems.push(stem); } 
            else { activeJiLuStems = activeJiLuStems.filter(s => s !== stem); }
            redrawAll();
        }));
        ['lu', 'quan', 'ke', 'ji'].forEach(type => {
            const checkboxes = document.querySelectorAll(`.transmission-checkbox[data-type="${type}"]`);
            const cycleBtn = document.querySelector(`.cycle-button[data-type="${type}"]`);
            const showAllBtn = document.querySelector(`.show-all[data-type="${type}"]`);
            const clearAllBtn = document.querySelector(`.clear-all[data-type="${type}"]`);
            checkboxes.forEach(cb => cb.addEventListener('change', function() {
                const branch = this.value;
                if (this.checked) { if (!activeTransmissions[type].includes(branch)) activeTransmissions[type].push(branch); } 
                else { activeTransmissions[type] = activeTransmissions[type].filter(b => b !== branch); }
                if(cycleBtn) cycleBtn.classList.remove('active');
                activeCycleTypes[type] = false;
                redrawAll();
            }));
            cycleBtn?.addEventListener('click', function() { this.classList.toggle('active'); activeCycleTypes[type] = this.classList.contains('active'); if (activeCycleTypes[type]) { activeTransmissions[type] = []; checkboxes.forEach(cb => cb.checked = false); } redrawAll(); });
            showAllBtn?.addEventListener('click', () => { activeTransmissions[type] = [...EarthlyBranches]; checkboxes.forEach(cb => cb.checked = true); if(cycleBtn) cycleBtn.classList.remove('active'); activeCycleTypes[type] = false; redrawAll(); });
            clearAllBtn?.addEventListener('click', () => { activeTransmissions[type] = []; checkboxes.forEach(cb => cb.checked = false); if(cycleBtn) cycleBtn.classList.remove('active'); activeCycleTypes[type] = false; redrawAll(); });
        });
        document.querySelector('.show-all[data-type="jilu"]')?.addEventListener('click', () => { activeJiLuStems = [...HeavenlyStems]; document.querySelectorAll('.stem-checkbox').forEach(cb => cb.checked = true); redrawAll(); });
        document.querySelector('.clear-all[data-type="jilu"]')?.addEventListener('click', () => { activeJiLuStems = []; document.querySelectorAll('.stem-checkbox').forEach(cb => cb.checked = false); redrawAll(); });
        document.getElementById('clear-all-arrows-btn')?.addEventListener('click', () => {
            activeJiLuStems = []; activeTransmissions = {lu:[], quan:[], ke:[], ji:[]}; activeCycleTypes = {lu:false, quan:false, ke:false, ji:false};
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('.cycle-button.active').forEach(b => b.classList.remove('active'));
            if (isFlowAnalysisActive) toggleFlowAnalysisBtn.click();
            if (isDaShianOnlyActive) toggleDaShianOnlyBtn.click();
            redrawAll();
        });
        document.getElementById('download-btn')?.addEventListener('click',()=>{
            const downloadSize = parseInt(document.getElementById('download-size-select')?.value, 10) || 540;
            const scale = downloadSize / CHART_SIZE;
            stage.toDataURL({ pixelRatio: scale, callback: function(dataURL) {
                const link = document.createElement('a'); link.download = `${birthDetails.name}_${getString('ui_chart_filename')}_${downloadSize}px.png`; link.href = dataURL; document.body.appendChild(link); link.click(); document.body.removeChild(link);
            }});
        });
        const newChartLink = document.getElementById('new-chart-link');
        if(newChartLink) { newChartLink.addEventListener('click', function(e) { e.preventDefault(); window.close(); }); }
        
        // 這兩個函式需要在 birthDetails 產生後再呼叫
        populateFlowYearSelect();
        populateDaShianSelect();
        setActiveLanguageLink(); // 在 birthDetails 確定後再呼叫以設定 active 狀態
    }
    
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang') || (navigator.language.startsWith('zh-CN') ? 'zh-CN' : 'zh-TW');
    setLanguage(lang);
    const converter = new LunarSolarConverter();
    const inputType = params.get('inputType');
    if (inputType === 'lunar') {
        const ly = parseInt(params.get('year')); const lm = parseInt(params.get('month')); const ld = parseInt(params.get('day'));
        const isLeap = params.get('isLeap') === 'true'; const h_branch_str = params.get('hour');
        const h_map = {"子":23, "丑":1, "寅":3, "卯":5, "辰":7, "巳":9, "午":11, "未":13, "申":15, "酉":17, "戌":19, "亥":21};
        const hour_val = h_map[h_branch_str] ?? 5;
        if (ly < 1888) {
            birthDetails = { name: params.get('name'), y: 0, m: 0, d: 0, hour: hour_val, g: params.get('gender'), lang: lang, lunarY: ly, lunarM: lm, lunarD: ld, isLeap: isLeap };
            const h_branch = EarthlyBranches[Math.floor(((hour_val + 1) % 24) / 2)];
            placeData = ziwei.computeZiWei(ly, 0, 0, h_branch, birthDetails.g, lm, ld);
        } else {
            const lunarForCalc = new Lunar(); lunarForCalc.lunarYear = ly; lunarForCalc.lunarMonth = lm; lunarForCalc.lunarDay = ld; lunarForCalc.isleap = isLeap;
            const solarForCalc = converter.LunarToSolar(lunarForCalc);
            birthDetails = { name: params.get('name'), y: solarForCalc.solarYear, m: solarForCalc.solarMonth, d: solarForCalc.solarDay, hour: hour_val, g: params.get('gender'), lang: lang, lunarY: ly, lunarM: lm, lunarD: ld, isLeap: isLeap };
            let adjustedDate = new Date(birthDetails.y, birthDetails.m - 1, birthDetails.d);
            if (birthDetails.hour >= 23) adjustedDate.setDate(adjustedDate.getDate() + 1);
            const calc_y = adjustedDate.getFullYear(), calc_m = adjustedDate.getMonth() + 1, calc_d = adjustedDate.getDate();
            const h_branch = EarthlyBranches[Math.floor(((birthDetails.hour + 1) % 24) / 2)];
            const solarForFinalCalc = new Solar(); solarForFinalCalc.solarYear = calc_y; solarForFinalCalc.solarMonth = calc_m; solarForFinalCalc.solarDay = calc_d;
            const lunarForFinalCalc = converter.SolarToLunar(solarForFinalCalc);
            placeData = ziwei.computeZiWei(calc_y, calc_m, calc_d, h_branch, birthDetails.g, lunarForFinalCalc.lunarMonth, lunarForFinalCalc.lunarDay);
        }
        daShianData = ziwei.getDaShian();
    } else {
        const y = parseInt(params.get('year')); const m = parseInt(params.get('month')); const d = parseInt(params.get('day'));
        const hour = parseInt(params.get('hour')); const minute = parseInt(params.get('minute'));
        const solarForLunar = new Solar(); solarForLunar.solarYear = y; solarForLunar.solarMonth = m; solarForLunar.solarDay = d;
        const lunarResult = converter.SolarToLunar(solarForLunar);
        birthDetails = { name: params.get('name'), y: y, m: m, d: d, hour: hour, minute: minute, g: params.get('gender'), lang: lang, lunarY: lunarResult.lunarYear, lunarM: lunarResult.lunarMonth, lunarD: lunarResult.lunarDay, isLeap: lunarResult.isleap };
        let adjustedDate = new Date(birthDetails.y, birthDetails.m - 1, birthDetails.d);
        if (birthDetails.hour >= 23) adjustedDate.setDate(adjustedDate.getDate() + 1);
        const calc_y = adjustedDate.getFullYear(), calc_m = adjustedDate.getMonth() + 1, calc_d = adjustedDate.getDate();
        const h_branch = EarthlyBranches[Math.floor(((birthDetails.hour + 1) % 24) / 2)];
        const solarForCalc = new Solar(); solarForCalc.solarYear = calc_y; solarForCalc.solarMonth = calc_m; solarForCalc.solarDay = calc_d;
        const lunarForCalc = converter.SolarToLunar(solarForCalc);
        placeData = ziwei.computeZiWei(calc_y, calc_m, calc_d, h_branch, birthDetails.g, lunarForCalc.lunarMonth, lunarForCalc.lunarDay);
        daShianData = ziwei.getDaShian();
    }
    translateHtmlElements();
    setupControls();
    
    setTimeout(() => {
        updateChartDimensions(); 
        redrawAll(); 
    }, 200);
    
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { redrawAll(); }, 200); });
});