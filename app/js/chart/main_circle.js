// main_circle.js (V4 - 修正視窗標題)
document.addEventListener('DOMContentLoaded', () => {

    // ... (檔案頂部全域變數與繪圖函式等保持不變) ...
    let stage, backgroundLayer, textLayer, arrowLayer, highlightLayer;
    let birthDetails, placeData, daShianData;
    let chartSize;
    let activeJiLuStems = [], activeTransmissions = { lu: [], quan: [], ke: [], ji: [] }, activeCycleTypes = { lu: false, quan: false, ke: false, ji: false };
    let isDaShianActive = false;
    let isFlowYearActive = false;
    let currentDaShianPalaceIndex = -1;
    let currentFlowYearAge = -1;
    let currentFlowYearPalaceIndex = -1;
    let flowLuCunPalaceIndex = -1, flowQingYangPalaceIndex = -1, flowTuoLuoPalaceIndex = -1;
    let customSettings = {
        arrowThickness: 0.8,
        colors: {
            CHART_BG: '#FFFFFF', PALACE_NAME: '#757575', CROSSHAIR: '#757575', STEM_BRANCH: '#222', 
            MAIN_STAR_RED: '#A01C1C', GROUP_FIRE_JIE_KONG: '#FF1744', GROUP_ASSISTANT: '#1976D2',     
            GROUP_YANG_TUO_QUAN: '#388E3C', GROUP_LU: '#FFA000', GROUP_KE: '#1976D2', 
            SIHUA_JI: '#000000', GRAY: '#9E9E9E', ARROW_JILU: '#FF00FF', ARROW_LU: '#FFA000', 
            ARROW_QUAN: '#388E3C', ARROW_KE: '#1976D2', ARROW_JI: '#000000', 
            COMPASS_NORTH: '#D32F2F', DASHIAN_COLOR: '#0000FF', FLOWYEAR_COLOR: '#FF0000'
        }
    };
    const brightnessShortName = { "level_miao": "廟", "level_wang": "旺", "level_di": "地", "level_li": "利", "level_ping": "平", "level_xian": "陷", "level_shi": "失" };
    const sihuaShortName = { "sihua_lu": "祿", "sihua_quan": "權", "sihua_ke": "科", "sihua_ji": "忌" };
    const arrowAngleOffsets = { jilu: 0, dashian: 7.5, flowyear: -7.5, ji: -2.5, lu: 2.5, quan: -5, ke: 5 };

    // =================================================================
    // SECTION: 所有函式定義
    // =================================================================

    function translateHtmlElements() {
        // 【問題二最終修正】使用 IPC API 設定原生視窗標題
        const windowTitle = `${birthDetails.name} - ${getString('ui_chart_title')}`;
        if (window.api && window.api.setWindowTitle) {
            window.api.setWindowTitle(windowTitle);
        }
        // 同時也更新 HTML 內的 title 標籤文字
        document.querySelector('title').textContent = windowTitle;

        // 繼續處理頁面其他元素的翻譯
        document.querySelectorAll('[data-i18n-key]').forEach(el => {
            el.textContent = getString(el.dataset.i18nKey);
        });
    }

    function setupKonva() {
        const container = document.getElementById('chart-container');
        if (!container) return;
        stage = new Konva.Stage({ container: 'chart-container', width: container.offsetWidth, height: container.offsetHeight });
        backgroundLayer = new Konva.Layer();
        highlightLayer = new Konva.Layer();
        textLayer = new Konva.Layer();
        arrowLayer = new Konva.Layer();
        stage.add(backgroundLayer, highlightLayer, textLayer, arrowLayer);
    }

    function redrawAll(forExport = false) {
        const container = document.getElementById('chart-container');
        if (!stage || !container) return;
        stage.width(container.offsetWidth); stage.height(container.offsetHeight);
        chartSize = Math.min(container.offsetWidth, container.offsetHeight);
        
        backgroundLayer.destroyChildren(); textLayer.destroyChildren();
        arrowLayer.destroyChildren(); highlightLayer.destroyChildren();
        
        const flowYearSelect = document.getElementById('flow-year-select');
        if (isFlowYearActive && flowYearSelect && flowYearSelect.value) {
            const year = parseInt(flowYearSelect.value, 10);
            const effectiveBirthYear = birthDetails.y > 0 ? birthDetails.y : birthDetails.lunarY;
            if (!isNaN(year) && year >= effectiveBirthYear) {
                currentFlowYearAge = year - effectiveBirthYear + 1;
                currentDaShianPalaceIndex = getDaShianPalaceByAge(currentFlowYearAge);
                const birthYearZhiIndex = (effectiveBirthYear - 4 + 120) % 12;
                currentFlowYearPalaceIndex = (birthYearZhiIndex + currentFlowYearAge - 1 + 12) % 12;
                calculateFlowStars(currentFlowYearAge);
            } else {
                currentFlowYearAge = -1; currentFlowYearPalaceIndex = -1; currentDaShianPalaceIndex = -1;
                calculateFlowStars(-1);
            }
        } else if (isDaShianActive) {
            const dashianSelect = document.getElementById('dashian-select');
            currentDaShianPalaceIndex = dashianSelect ? parseInt(dashianSelect.value, 10) : -1;
            currentFlowYearAge = -1; currentFlowYearPalaceIndex = -1;
            calculateFlowStars(-1);
        } else {
            currentFlowYearAge = -1; currentFlowYearPalaceIndex = -1; currentDaShianPalaceIndex = -1;
            calculateFlowStars(-1);
        }

        const bgCheckbox = document.getElementById('transparent-bg-checkbox');
        const isTransparent = bgCheckbox ? bgCheckbox.checked : false;

        if (!isTransparent) {
            backgroundLayer.add(new Konva.Rect({ x: 0, y: 0, width: stage.width(), height: stage.height(), fill: customSettings.colors.CHART_BG, cornerRadius: 20 }));
        }

        drawCircularGrid();
        drawAllPalaceContent();
        
        activeJiLuStems.forEach(stem => drawJiLuArrow(stem));
        Object.keys(activeTransmissions).forEach(type => {
            activeTransmissions[type].forEach(branch => drawTransmissionArrow(type, branch));
        });
        for(const type in activeCycleTypes){ 
            if(activeCycleTypes[type]){ findAndDrawCycles(type); }
        }
        
        const shouldShowDaShian = (isDaShianActive || isFlowYearActive) && currentDaShianPalaceIndex > -1;
        if (shouldShowDaShian) {
            drawHighlightBorder(currentDaShianPalaceIndex, customSettings.colors.DASHIAN_COLOR);
            drawFlowJilu('dashian');
        }
        if (isFlowYearActive && currentFlowYearPalaceIndex > -1) {
            drawHighlightBorder(currentFlowYearPalaceIndex, customSettings.colors.FLOWYEAR_COLOR);
            drawFlowJilu('flowyear');
        }

        drawCenterInfo();
        stage.draw();
    }

    function drawCircularGrid() {
        const centerX = stage.width() / 2, centerY = stage.height() / 2;
        const outerRadius = chartSize * 0.48;
        const palaceRingOuterBorder = chartSize * 0.38;
        const innerRadius = chartSize * 0.33;
        for (let i = 0; i < 12; i++) {
            const angle = -105 + i * 30;
            const rad = Konva.getAngle(angle);
            backgroundLayer.add(new Konva.Line({ points: [centerX + innerRadius * Math.cos(rad), centerY + innerRadius * Math.sin(rad), centerX + outerRadius * Math.cos(rad), centerY + outerRadius * Math.sin(rad)], stroke: customSettings.colors.GRAY, strokeWidth: 1 }));
        }
        const radii = [outerRadius, palaceRingOuterBorder, innerRadius];
        radii.forEach(r => {
            backgroundLayer.add(new Konva.Circle({ x: centerX, y: centerY, radius: r, stroke: customSettings.colors.GRAY, strokeWidth: 1 }));
        });
        const cardinalLabels = { 0: '北', 3: '東', 6: '南', 9: '西' };
        const cardinalTickLength = chartSize * 0.025;
        const intermediateTickLength = chartSize * 0.015;
        const textOffset = chartSize * 0.035;

        for (let i = 0; i < 12; i++) {
            const angle = -90 + (i * 30);
            const rad = Konva.getAngle(angle);
            const isCardinal = cardinalLabels.hasOwnProperty(i);
            const tickLength = isCardinal ? cardinalTickLength : intermediateTickLength;
            const strokeWidth = isCardinal ? 2 : 1.5;
            const color = (i === 0) ? customSettings.colors.COMPASS_NORTH : '#000000';
            const startX = centerX + outerRadius * Math.cos(rad);
            const startY = centerY + outerRadius * Math.sin(rad);
            const endX = centerX + (outerRadius + tickLength) * Math.cos(rad);
            const endY = centerY + (outerRadius + tickLength) * Math.sin(rad);
            backgroundLayer.add(new Konva.Line({ points: [startX, startY, endX, endY], stroke: color, strokeWidth: strokeWidth }));
            if (isCardinal) {
                const text = cardinalLabels[i];
                const textRadius = outerRadius + tickLength + textOffset;
                const textX = centerX + textRadius * Math.cos(rad);
                const textY = centerY + textRadius * Math.sin(rad);
                const textNode = new Konva.Text({ x: textX, y: textY, text: text, fontSize: chartSize * 0.03, fill: color });
                textNode.offsetX(textNode.width() / 2).offsetY(textNode.height() / 2);
                textLayer.add(textNode);
            }
        }
        backgroundLayer.add(new Konva.Line({ points: [centerX - 6, centerY, centerX + 6, centerY], stroke: customSettings.colors.CROSSHAIR, strokeWidth: 1 }));
        backgroundLayer.add(new Konva.Line({ points: [centerX, centerY - 6, centerX, centerY + 6], stroke: customSettings.colors.CROSSHAIR, strokeWidth: 1 }));
    }

    function getStarBaseColor(starKey) {
        if (['star_huoxing', 'star_lingxing', 'star_dikong', 'star_dijie'].includes(starKey)) return customSettings.colors.GROUP_FIRE_JIE_KONG;
        if (['star_wenchang', 'star_wenqu', 'star_zuofu', 'star_youbi', 'star_tiankui', 'star_tianyue'].includes(starKey)) return customSettings.colors.GROUP_ASSISTANT;
        if (['star_qingyang', 'star_tuoluo'].includes(starKey)) return customSettings.colors.GROUP_YANG_TUO_QUAN;
        if (starKey === 'star_lucun') return customSettings.colors.GROUP_LU;
        if (StarM_A14_Keys.includes(starKey)) return customSettings.colors.MAIN_STAR_RED;
        return '#000000';
    }

    function getSihuaColor(sihuaKey) {
        const sihuaColorMap = {
            'sihua_lu': customSettings.colors.GROUP_LU, 'sihua_quan': customSettings.colors.GROUP_YANG_TUO_QUAN,
            'sihua_ke': customSettings.colors.GROUP_KE, 'sihua_ji': customSettings.colors.SIHUA_JI
        };
        return sihuaColorMap[sihuaKey] || 'transparent';
    }

    function drawAllPalaceContent() {
        if (!placeData) return;
        placeData.forEach((palace, index) => {
            drawPalaceContent(palace, index);
        });
    }

    function drawPalaceContent(palace, index) {
        const centerX = stage.width() / 2, centerY = stage.height() / 2;
        const baseAngle = -90 + (index * 30);
        const R_STARS = chartSize * 0.43, R_PALACE_INFO = chartSize * 0.355;
        const palaceName = getString(palace.MangB).substring(0, 1);
        const stemBranch = palace.MangA.split(' ').join(''), decadeText = daShianData[index] ? daShianData[index].split('-')[0] : '';
        const palaceFontSize = chartSize * 0.022;
        const palaceInfoPaddingAngle = 3.0;
        const decadeNode = new Konva.Text({ text: decadeText, fontSize: palaceFontSize, fill: customSettings.colors.PALACE_NAME, fontStyle: 'normal'});
        const palaceNode = new Konva.Text({ text: palaceName, fontSize: palaceFontSize, fill: customSettings.colors.PALACE_NAME, fontStyle: 'normal'});
        const stemBranchNode = new Konva.Text({ text: stemBranch, fontSize: palaceFontSize, fill: customSettings.colors.PALACE_NAME, fontStyle: 'normal'});
        const infoNodes = [decadeNode];
        if (isFlowYearActive) {
            let flowStarText = '', flowStarColor = '#000000';
            if (index === flowLuCunPalaceIndex) { flowStarText = getString('flow_star_lucun'); flowStarColor = customSettings.colors.GROUP_LU; }
            else if (index === flowQingYangPalaceIndex) { flowStarText = getString('flow_star_qingyang'); flowStarColor = customSettings.colors.GROUP_YANG_TUO_QUAN; }
            else if (index === flowTuoLuoPalaceIndex) { flowStarText = getString('flow_star_tuoluo'); flowStarColor = customSettings.colors.GROUP_YANG_TUO_QUAN; }
            if (flowStarText) {
                const verticalText = flowStarText.split('').join('\n');
                const flowStarNode = new Konva.Text({ text: verticalText, fontSize: chartSize * 0.02, fill: flowStarColor, align: 'center', fontStyle: 'bold' });
                infoNodes.push(flowStarNode);
            }
        }
        infoNodes.push(palaceNode, stemBranchNode);
        let totalPalaceAngleWidth = 0;
        infoNodes.forEach(node => { totalPalaceAngleWidth += (node.width() / R_PALACE_INFO) * (180 / Math.PI); });
        totalPalaceAngleWidth += palaceInfoPaddingAngle * (infoNodes.length - 1);
        let currentPalaceAngle = baseAngle - totalPalaceAngleWidth / 2;
        infoNodes.forEach(node => {
            const nodeAngleWidth = (node.width() / R_PALACE_INFO) * (180 / Math.PI);
            const angle = currentPalaceAngle + nodeAngleWidth / 2;
            const rad = Konva.getAngle(angle);
            node.position({ x: centerX + R_PALACE_INFO * Math.cos(rad), y: centerY + R_PALACE_INFO * Math.sin(rad) });
            node.rotation(angle + 90).offsetX(node.width() / 2).offsetY(node.height() / 2);
            textLayer.add(node);
            currentPalaceAngle += nodeAngleWidth + palaceInfoPaddingAngle;
        });
        const importantStars = palace.Stars.filter(s => starShortName[s.split('(')[0]] !== undefined);
        const starInfoFontSize = chartSize * 0.028, subInfoFontSize = chartSize * 0.022, paddingAngle = 1.0;
        let totalStarAngleWidth = 0;
        importantStars.forEach(() => {
            let textWidth = new Konva.Text({ text: "星", fontSize: starInfoFontSize, fontStyle: 'bold' }).width();
            totalStarAngleWidth += (textWidth / R_STARS) * (180 / Math.PI) + paddingAngle;
        });
        totalStarAngleWidth -= paddingAngle;
        let currentStarAngle = baseAngle - totalStarAngleWidth / 2;
        importantStars.forEach((star) => {
            let starKey = star, sihuaKey = '';
            if (star.includes('(')) { const match = star.match(/(.*)\((.*)\)/); if (match) { starKey = match[1]; sihuaKey = match[2]; } }
            const shortName = starShortName[starKey] || '';
            const brightnessLevelKey = StarBrightness[starKey] ? StarBrightness[starKey][index] : null;
            const shortBrightness = brightnessLevelKey ? brightnessShortName[brightnessLevelKey] : '', shortSihua = sihuaKey ? sihuaShortName[sihuaKey] : '';
            const starColor = getStarBaseColor(starKey), sihuaColor = getSihuaColor(sihuaKey);
            const starNode = new Konva.Text({ text: shortName, fontSize: starInfoFontSize, fill: starColor, fontStyle: 'bold' });
            const brightnessNode = new Konva.Text({ text: shortBrightness, fontSize: subInfoFontSize, fill: customSettings.colors.GRAY, fontStyle: 'normal' });
            const sihuaNode = new Konva.Text({ text: shortSihua, fontSize: subInfoFontSize, fill: sihuaColor, fontStyle: 'normal' });
            const textBlockWidth = Math.max(starNode.width(), brightnessNode.width(), sihuaNode.width());
            const angularWidth = (textBlockWidth / R_STARS) * (180 / Math.PI);
            const textAngle = currentStarAngle + angularWidth / 2;
            const textRad = Konva.getAngle(textAngle);
            const textGroup = new Konva.Group({ x: centerX + R_STARS * Math.cos(textRad), y: centerY + R_STARS * Math.sin(textRad), rotation: textAngle + 90 });
            const totalHeight = starNode.height() + brightnessNode.height() + sihuaNode.height();
            starNode.y(0).offsetX(starNode.width() / 2);
            brightnessNode.y(starNode.height()).offsetX(brightnessNode.width() / 2);
            sihuaNode.y(starNode.height() + brightnessNode.height()).offsetX(sihuaNode.width() / 2);
            textGroup.add(starNode, brightnessNode, sihuaNode);
            textGroup.offsetX(textBlockWidth / 2).offsetY(totalHeight / 2);
            textLayer.add(textGroup);
            currentStarAngle += angularWidth + paddingAngle;
        });
    }

    function getPointForPalace(palaceIndex, radius, angleOffset = 0) {
        const centerX = stage.width() / 2, centerY = stage.height() / 2;
        const angle = -90 + (palaceIndex * 30) + angleOffset;
        const rad = Konva.getAngle(angle);
        return { x: centerX + radius * Math.cos(rad), y: centerY + radius * Math.sin(rad) };
    }

    function drawArrow(startIndex, endIndex, color, isDashed = false, arrowType = 'default') {
        const endRadiusPx = chartSize * 0.34;
        const startRadiusPx = endRadiusPx - 12;
        const angleOffset = arrowAngleOffsets[arrowType] || 0;
        const startPoint = getPointForPalace(startIndex, startRadiusPx, angleOffset), endPoint = getPointForPalace(endIndex, endRadiusPx, angleOffset);
        arrowLayer.add(new Konva.Arrow({ points: [startPoint.x, startPoint.y, endPoint.x, endPoint.y], pointerLength: 12, pointerWidth: 4, fill: color, stroke: color, strokeWidth: customSettings.arrowThickness, dash: isDashed ? [6, 4] : [] }));
    }

    function drawJiLuArrow(stem) {
        const transformMap = { '甲':{ji:'star_taiyang',lu:'star_lianzhen'},'乙':{ji:'star_taiyin',lu:'star_tianji'},'丙':{ji:'star_lianzhen',lu:'star_tiantong'}, '丁':{ji:'star_jumen',lu:'star_taiyin'},'戊':{ji:'star_tianji',lu:'star_tanlang'},'己':{ji:'star_wenqu',lu:'star_wuqu'}, '庚':{ji:'star_tiantong',lu:'star_taiyang'},'辛':{ji:'star_wenchang',lu:'star_jumen'},'壬':{ji:'star_wuqu',lu:'star_tianliang'}, '癸':{ji:'star_tanlang',lu:'star_pojun'} };
        const transform = transformMap[stem];
        if (!transform) return;
        let jiPalaceIndex = -1, luPalaceIndex = -1;
        placeData.forEach((p, i) => {
            if (p.Stars.some(s => s.startsWith(transform.ji))) jiPalaceIndex = i;
            if (p.Stars.some(s => s.startsWith(transform.lu))) luPalaceIndex = i;
        });
        if (jiPalaceIndex !== -1 && luPalaceIndex !== -1) {
            drawArrow(jiPalaceIndex, luPalaceIndex, customSettings.colors.ARROW_JILU, true, 'jilu');
        }
    }

    function drawTransmissionArrow(type, startBranch) {
        const typeKey = `sihua_${type}`;
        const typeIndex = { 'sihua_lu': 0, 'sihua_quan': 1, 'sihua_ke': 2, 'sihua_ji': 3 }[typeKey];
        if (typeIndex === undefined) return;
        const colorMap = {'lu': customSettings.colors.ARROW_LU, 'quan': customSettings.colors.ARROW_QUAN, 'ke': customSettings.colors.ARROW_KE, 'ji': customSettings.colors.ARROW_JI};
        const startPalaceIndex = EarthlyBranches.indexOf(startBranch);
        if (startPalaceIndex === -1) return;
        const palaceStem = placeData[startPalaceIndex].MangA[0];
        const palaceStemIndex = HeavenlyStems.indexOf(palaceStem);
        if (palaceStemIndex === -1) return;
        const targetStarKey = Star_S04[typeIndex][palaceStemIndex];
        if (!targetStarKey) return;
        const endPalaceIndex = placeData.findIndex(p => p.Stars.some(s => s.startsWith(targetStarKey)));
        if (endPalaceIndex !== -1) {
            drawArrow(startPalaceIndex, endPalaceIndex, colorMap[type], false, type);
        }
    }

    function findAndDrawCycles(type){
        const typeKey = `sihua_${type}`;
        const typeIndex={'sihua_lu':0,'sihua_quan':1,'sihua_ke':2,'sihua_ji':3}[typeKey];
        if(typeIndex===undefined) return;
        const colorMap = {'lu': customSettings.colors.ARROW_LU, 'quan': customSettings.colors.ARROW_QUAN, 'ke': customSettings.colors.ARROW_KE, 'ji': customSettings.colors.ARROW_JI};
        const transmissionMap = new Array(12).fill(-1);
        for(let i=0; i<12; i++){
            const palaceStem = placeData[i].MangA[0];
            const palaceStemIndex = HeavenlyStems.indexOf(palaceStem);
            if(palaceStemIndex === -1) continue;
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
                    cycleNodes.forEach(fromNode => { 
                        const toNode = transmissionMap[fromNode];
                        if (toNode !== -1) {
                           drawArrow(fromNode, toNode, colorMap[type], false, type);
                        }
                    });
                    drawnCycles.add(cycleKey);
                }
            }
        }
    }

    function drawHighlightBorder(palaceIndex, color) {
        const centerX = stage.width() / 2;
        const centerY = stage.height() / 2;
        const outerRadius = chartSize * 0.48;
        const innerRadius = chartSize * 0.33;
        const baseAngle = -90 + (palaceIndex * 30);
        highlightLayer.add(new Konva.Arc({ x: centerX, y: centerY, innerRadius: innerRadius, outerRadius: outerRadius, angle: 30, rotation: baseAngle - 15, stroke: color, strokeWidth: 2.5 }));
    }

    function drawFlowJilu(type) {
        let stem;
        if (type === 'dashian') {
            if (currentDaShianPalaceIndex === -1) return;
            stem = placeData[currentDaShianPalaceIndex].MangA[0];
        } else {
            if (isNaN(currentFlowYearAge) || currentFlowYearAge <= 0) return;
            const effectiveBirthYear = birthDetails.y > 0 ? birthDetails.y : birthDetails.lunarY;
            const flowSolarYear = effectiveBirthYear + currentFlowYearAge - 1;
            const ganIndex = (flowSolarYear - 4 + 100) % 10;
            stem = HeavenlyStems[ganIndex];
        }
        const transformMap = { '甲':{ji:'star_taiyang',lu:'star_lianzhen'},'乙':{ji:'star_taiyin',lu:'star_tianji'},'丙':{ji:'star_lianzhen',lu:'star_tiantong'}, '丁':{ji:'star_jumen',lu:'star_taiyin'},'戊':{ji:'star_tianji',lu:'star_tanlang'},'己':{ji:'star_wenqu',lu:'star_wuqu'}, '庚':{ji:'star_tiantong',lu:'star_taiyang'},'辛':{ji:'star_wenchang',lu:'star_jumen'},'壬':{ji:'star_wuqu',lu:'star_tianliang'}, '癸':{ji:'star_tanlang',lu:'star_pojun'} };
        const transform = transformMap[stem];
        if (!transform) return;
        let jiPalaceIndex = -1, luPalaceIndex = -1;
        placeData.forEach((p, i) => {
            if (p.Stars.some(s => s.startsWith(transform.ji))) jiPalaceIndex = i;
            if (p.Stars.some(s => s.startsWith(transform.lu))) luPalaceIndex = i;
        });
        if (jiPalaceIndex !== -1 && luPalaceIndex !== -1) {
            const color = type === 'dashian' ? customSettings.colors.DASHIAN_COLOR : customSettings.colors.FLOWYEAR_COLOR;
            drawArrow(jiPalaceIndex, luPalaceIndex, color, true, type);
        }
    }

    function calculateFlowStars(age) {
        if (isNaN(age) || age <= 0) {
            flowLuCunPalaceIndex = -1; flowQingYangPalaceIndex = -1; flowTuoLuoPalaceIndex = -1;
            return;
        }
        const effectiveBirthYear = birthDetails.y > 0 ? birthDetails.y : birthDetails.lunarY;
        const flowSolarYear = effectiveBirthYear + age - 1;
        const ganIndex = (flowSolarYear - 4 + 100) % 10;
        const gan = HeavenlyStems[ganIndex];
        const luCunMap = {'甲':'寅','乙':'卯','丙':'巳','戊':'巳','丁':'午','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子'};
        const luCunZhi = luCunMap[gan];
        if (luCunZhi) {
            const luCunIndex = EarthlyBranches.indexOf(luCunZhi);
            flowLuCunPalaceIndex = luCunIndex;
            flowQingYangPalaceIndex = (luCunIndex + 1) % 12;
            flowTuoLuoPalaceIndex = (luCunIndex - 1 + 12) % 12;
        }
    }

    function getDaShianPalaceByAge(age) {
        if (isNaN(age) || age <= 0) return -1;

        // 找出命盤的五行局數 (即最小的大限起始歲數)
        let minStartAge = 121;
        for (let i = 0; i < 12; i++) {
            const rangeStr = daShianData[i];
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
                if (age >= startAge && age <= endAge) { return i; }
            }
        }
        return -1;
    }

    function drawCenterInfo() {
        const centerX = stage.width() / 2, centerY = stage.height() / 2;
        const h_branch = EarthlyBranches[Math.floor(((birthDetails.hour + 1) % 24) / 2)];
        const ziwei_y_ganzhi = ziwei.y;
        const versionText = getString('ui_app_title_version');
        const versionNode = new Konva.Text({ text: versionText, fontSize: chartSize * 0.02, fill: customSettings.colors.GRAY, align: 'center' });
        const lunarDateString = `${getString('ui_lunar_prefix')}${ziwei_y_ganzhi}(${birthDetails.lunarY})${getString('ui_year_char')} ` + `${birthDetails.isLeap ? getString('ui_leap_char') : ''}${getString('lunar_month_' + birthDetails.lunarM)} ` + `${getString('lunar_day_' + birthDetails.lunarD)} ${h_branch}${getString('ui_hour_char')}`;
        let flowInfoText = '';
        if (isFlowYearActive && currentFlowYearAge > 0) {
            const effectiveBirthYear = birthDetails.y > 0 ? birthDetails.y : birthDetails.lunarY;
            const flowSolarYear = effectiveBirthYear + currentFlowYearAge - 1;
            const ganIndex = (flowSolarYear - 4 + 100) % 10;
            const zhiIndex = (flowSolarYear - 4 + 120) % 12;
            const flowYearText = `${HeavenlyStems[ganIndex]}${EarthlyBranches[zhiIndex]}年`;
            const dashianGZ = currentDaShianPalaceIndex !== -1 ? placeData[currentDaShianPalaceIndex].MangA.split(' ').join('') : '';
            const dashianText = `${dashianGZ}限`;
            flowInfoText = `流運: ${dashianText} ${flowYearText} ${currentFlowYearAge}歲`;
        } else if (isDaShianActive && currentDaShianPalaceIndex !== -1) {
            const dashianGZ = placeData[currentDaShianPalaceIndex].MangA.split(' ').join('');
            flowInfoText = `${dashianGZ}限`;
        }
        let solarDateString = '';
        if (birthDetails.y > 0) {
            solarDateString = `${getString('ui_solar_prefix')}${birthDetails.y}${getString('ui_year_char')} ${birthDetails.m}${getString('ui_month_char')} ${birthDetails.d}${getString('ui_day_char')} ${birthDetails.hour}${getString('ui_hour_char')}\n`;
        }
        const fullText = `${birthDetails.name}\n` + `${getString(ziwei.getYinYangKey())}${getString(ziwei.getGenderKey())} ${getString(ziwei.getFiveElementKey())} (${getString(ziwei.getShengXiaoKey())})\n` + solarDateString + `${lunarDateString}\n` + `${flowInfoText}`;
        const textNode = new Konva.Text({ text: fullText, fontSize: chartSize * 0.022, fill: customSettings.colors.PALACE_NAME, align: 'center', lineHeight: 1.5 });
        textNode.position({ x: centerX - textNode.width() / 2, y: centerY + 5 });
        versionNode.position({ x: centerX - versionNode.width() / 2, y: textNode.y() - versionNode.height() - (chartSize * 0.03) });
        textLayer.add(textNode);
        textLayer.add(versionNode);
    }

    function populateDaShianSelect() {
        const dashianSelect = document.getElementById('dashian-select');
        if (!dashianSelect || !daShianData || !placeData || !ziwei) return;

        dashianSelect.innerHTML = ''; 
        dashianSelect.appendChild(new Option(getString('ui_select_da_shian'), '-1'));

        const isYangYear = ziwei.y1Pos % 2 === 0;
        const isMale = birthDetails.g === 'M';
        const direction = (isYangYear && isMale) || (!isYangYear && !isMale) ? 1 : -1;
        
        const lifePalaceIndex = ziwei.lPos;

        for (let i = 0; i < 12; i++) {
            const palaceIndex = (lifePalaceIndex + (i * direction) + 12) % 12;
            const range = daShianData[palaceIndex];
            const palaceName = getString(placeData[palaceIndex].MangB);
            
            if (range) {
                const optionText = `${range} (${palaceName})`;
                const option = new Option(optionText, palaceIndex);
                dashianSelect.add(option);
            }
        }
    }

    function setupControls() {
        const bgCheckbox = document.getElementById('transparent-bg-checkbox');
        if (bgCheckbox) {
            bgCheckbox.addEventListener('change', () => redrawAll());
        }
        const downloadBtn = document.getElementById('download-btn');
        const dashianBtn = document.getElementById('toggle-dashian-btn');
        const flowYearBtn = document.getElementById('toggle-flow-year-btn');
        const dashianSelect = document.getElementById('dashian-select');
        const flowYearSelect = document.getElementById('flow-year-select');
        const bgColorPicker = document.getElementById('bg-color-picker');
        const palaceTextColorPicker = document.getElementById('palace-text-color-picker');
        const crosshairColorPicker = document.getElementById('crosshair-color-picker');
        const arrowThicknessSlider = document.getElementById('arrow-thickness-slider');
        if(downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const downloadSizeSelect = document.getElementById('download-size-select');
                const downloadSize = downloadSizeSelect ? parseInt(downloadSizeSelect.value, 10) : 590;
                const currentSize = chartSize;
                stage.width(downloadSize); stage.height(downloadSize); chartSize = downloadSize;
                redrawAll(true);
                stage.toDataURL({
                    mimeType: 'image/png', pixelRatio: 1,
                    callback: function (dataURL) {
                        const link = document.createElement('a');
                        link.download = `${birthDetails.name}_${getString('ui_chart_filename')}_${downloadSize}px.png`;
                        link.href = dataURL; document.body.appendChild(link);
                        link.click(); document.body.removeChild(link);
                        chartSize = currentSize; stage.width(currentSize); stage.height(currentSize);
                        redrawAll(false);
                    }
                });
            });
        }
        if(bgColorPicker) bgColorPicker.addEventListener('input', (e) => { customSettings.colors.CHART_BG = e.target.value; redrawAll(); });
        if(palaceTextColorPicker) palaceTextColorPicker.addEventListener('input', (e) => { customSettings.colors.PALACE_NAME = e.target.value; redrawAll(); });
        if(crosshairColorPicker) crosshairColorPicker.addEventListener('input', (e) => { customSettings.colors.CROSSHAIR = e.target.value; redrawAll(); });
        if(arrowThicknessSlider) arrowThicknessSlider.addEventListener('input', (e) => { customSettings.arrowThickness = parseFloat(e.target.value); redrawAll(); });
        if(dashianBtn) dashianBtn.addEventListener('click', function() {
            if (isDaShianActive && !isFlowYearActive) { isDaShianActive = false; } 
            else { isDaShianActive = true; isFlowYearActive = false; }
            updateFlowUIAndState();
        });
        if(flowYearBtn) flowYearBtn.addEventListener('click', function() {
            isFlowYearActive = !isFlowYearActive;
            isDaShianActive = false; 
            updateFlowUIAndState();
        });
        if(dashianSelect) dashianSelect.addEventListener('change', redrawAll);
        if(flowYearSelect) flowYearSelect.addEventListener('change', redrawAll);
        
        const currentParams = new URLSearchParams(window.location.search);
        const twLink = document.getElementById('lang-tw-link');
        if (twLink) { const twParams = new URLSearchParams(currentParams); twParams.set('lang', 'zh-TW'); twLink.href = `chart_circle.html?${twParams.toString()}`; }
        const cnLink = document.getElementById('lang-cn-link');
        if (cnLink) { const cnParams = new URLSearchParams(currentParams); cnParams.set('lang', 'zh-CN'); cnLink.href = `chart_circle.html?${cnParams.toString()}`; }
        if (birthDetails && birthDetails.lang === 'zh-CN') { cnLink?.classList.add('active'); twLink?.classList.remove('active'); } 
        else { twLink?.classList.add('active'); cnLink?.classList.remove('active'); }
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-button.active, .tab-pane.active').forEach(el => el.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(button.dataset.tab)?.classList.add('active');
            });
        });
        document.querySelectorAll('.stem-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const stem = this.value;
                if (this.checked) { if (!activeJiLuStems.includes(stem)) activeJiLuStems.push(stem); } 
                else { activeJiLuStems = activeJiLuStems.filter(s => s !== stem); }
                redrawAll();
            });
        });
        document.querySelector('.show-all[data-type="jilu"]')?.addEventListener('click', () => { activeJiLuStems = [...HeavenlyStems]; document.querySelectorAll('.stem-checkbox').forEach(cb => cb.checked = true); redrawAll(); });
        document.querySelector('.clear-all[data-type="jilu"]')?.addEventListener('click', () => { activeJiLuStems = []; document.querySelectorAll('.stem-checkbox').forEach(cb => cb.checked = false); redrawAll(); });
        ['lu', 'quan', 'ke', 'ji'].forEach(type => {
            document.querySelectorAll(`.transmission-checkbox[data-type="${type}"]`).forEach(cb => cb.addEventListener('change', function() {
                const branch = this.value;
                if (this.checked) { if (!activeTransmissions[type].includes(branch)) activeTransmissions[type].push(branch); } 
                else { activeTransmissions[type] = activeTransmissions[type].filter(b => b !== branch); }
                const cycleBtn = document.querySelector(`.cycle-button[data-type="${type}"]`);
                if(cycleBtn) cycleBtn.classList.remove('active');
                activeCycleTypes[type] = false;
                redrawAll();
            }));
            document.querySelector(`.cycle-button[data-type="${type}"]`)?.addEventListener('click', function() {
                this.classList.toggle('active');
                activeCycleTypes[type] = this.classList.contains('active');
                if (activeCycleTypes[type]) { activeTransmissions[type] = []; document.querySelectorAll(`.transmission-checkbox[data-type="${type}"]`).forEach(cb => cb.checked = false); }
                redrawAll();
            });
            document.querySelector(`.show-all[data-type="${type}"]`)?.addEventListener('click', () => {
                activeTransmissions[type] = [...EarthlyBranches]; document.querySelectorAll(`.transmission-checkbox[data-type="${type}"]`).forEach(cb => cb.checked = true);
                const cycleBtn = document.querySelector(`.cycle-button[data-type="${type}"]`);
                if(cycleBtn) cycleBtn.classList.remove('active');
                activeCycleTypes[type] = false;
                redrawAll();
            });
            document.querySelector(`.clear-all[data-type="${type}"]`)?.addEventListener('click', () => {
                activeTransmissions[type] = []; document.querySelectorAll(`.transmission-checkbox[data-type="${type}"]`).forEach(cb => cb.checked = false);
                const cycleBtn = document.querySelector(`.cycle-button[data-type="${type}"]`);
                if(cycleBtn) cycleBtn.classList.remove('active');
                activeCycleTypes[type] = false;
                redrawAll();
            });
        });
        document.getElementById('clear-all-arrows-btn')?.addEventListener('click', () => {
            activeJiLuStems = []; activeTransmissions = { lu: [], quan: [], ke: [], ji: [] }; activeCycleTypes = { lu: false, quan: false, ke: false, ji: false };
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('.cycle-button.active').forEach(b => b.classList.remove('active'));
            if (isDaShianActive || isFlowYearActive) { isDaShianActive = false; isFlowYearActive = false; updateFlowUIAndState(); } 
            else { redrawAll(); }
        });
        const newChartLink = document.getElementById('new-chart-link');
        if(newChartLink) {
            newChartLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.close();
            });
        }
    }

    function updateFlowUIAndState() {
        const dashianBtn = document.getElementById('toggle-dashian-btn');
        const flowYearBtn = document.getElementById('toggle-flow-year-btn');
        const optionsWrapper = document.getElementById('flow-options-wrapper');
        const dashianOptionsGroup = document.getElementById('dashian-options-group');
        const flowYearOptionsGroup = document.getElementById('flow-year-options-group');
        const dashianSelect = document.getElementById('dashian-select');
        const flowYearSelect = document.getElementById('flow-year-select');
        if(dashianBtn) dashianBtn.classList.toggle('active', isDaShianActive);
        if(flowYearBtn) flowYearBtn.classList.toggle('active', isFlowYearActive);
        const showOptions = isDaShianActive || isFlowYearActive;
        if(optionsWrapper) optionsWrapper.classList.toggle('hidden', !showOptions);
        if(dashianOptionsGroup) dashianOptionsGroup.classList.toggle('hidden', !isDaShianActive);
        if(flowYearOptionsGroup) flowYearOptionsGroup.classList.toggle('hidden', !isFlowYearActive);
        if (!showOptions) {
            if(dashianSelect) dashianSelect.value = "-1"; 
            if(flowYearSelect) flowYearSelect.value = "";
        } else if (isFlowYearActive) {
            // No action needed
        } else if (isDaShianActive) {
            if (dashianSelect && (dashianSelect.value === "-1" || !dashianSelect.value)) {
                const firstDaShian = getDaShianPalaceByAge(1);
                if (firstDaShian !== -1) dashianSelect.value = firstDaShian;
            }
        }
        redrawAll();
    }

    function populateFlowYearSelect() {
        const flowYearSelect = document.getElementById('flow-year-select');
        if (!flowYearSelect || !birthDetails) return;
        const effectiveBirthYear = birthDetails.y > 0 ? birthDetails.y : birthDetails.lunarY;
        flowYearSelect.innerHTML = ''; 
        const defaultOption = document.createElement('option');
        defaultOption.value = ""; defaultOption.textContent = "請選擇流年"; defaultOption.disabled = true;
        flowYearSelect.appendChild(defaultOption);
        for (let age = 1; age <= 120; age++) {
            const flowYear = effectiveBirthYear + age - 1;
            const ganIndex = (flowYear - 4 + 100) % 10;
            const zhiIndex = (flowYear - 4 + 120) % 12;
            const ganzhi = `${HeavenlyStems[ganIndex]}${EarthlyBranches[zhiIndex]}`;
            const option = document.createElement('option');
            option.value = flowYear; option.textContent = `${flowYear} (${ganzhi}) 虛${age}歲`;
            flowYearSelect.appendChild(option);
        }
        const currentYear = new Date().getFullYear();
        if (flowYearSelect.querySelector(`option[value="${currentYear}"]`)) {
            flowYearSelect.value = currentYear;
        } else {
            flowYearSelect.selectedIndex = 0;
        }
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
    setupKonva();
    setupControls();
    
    populateDaShianSelect();
    populateFlowYearSelect();

    setTimeout(() => { redrawAll(); }, 200);
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { redrawAll(); }, 200); });
});