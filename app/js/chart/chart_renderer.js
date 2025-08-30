// js/chart_renderer.js (新版)
window.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save-chart-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const params = new URLSearchParams(window.location.search);
            const name = params.get('name') || '未命名';
            
            // 從 URL 參數重建 chartData 物件
            const chartData = { name: name };
            for (const [key, value] of params.entries()) {
                if (key.startsWith('solar.') || key.startsWith('lunar.')) {
                    const [type, prop] = key.split('.');
                    if (!chartData[type]) {
                        chartData[type] = {};
                    }
                    if (!isNaN(value)) {
                        chartData[type][prop] = parseInt(value, 10);
                    } else {
                        chartData[type][prop] = value;
                    }
                } else {
                    chartData[key] = value;
                }
            }

            // 確保 lunar 物件存在且包含 hour_branch
            if (chartData.inputType === 'lunar') {
                chartData.lunar = {
                    year: parseInt(params.get('year')),
                    month: parseInt(params.get('month')),
                    day: parseInt(params.get('day')),
                    hour_branch: params.get('hour'),
                    is_leap: params.get('isLeap') === 'true'
                };
            } else if (chartData.inputType === 'solar') {
                // 如果是陽曆，需補充 lunar 資訊以生成文件夾名稱
                // 這需要引入 LunarSolarConverter，但為了簡化，我們可以這樣處理
                // 假設 main_circle.js 已經計算好 lunar 資料並存在於全域變數 birthDetails 中
                const b = window.birthDetails;
                chartData.lunar = {
                    year: b.lunarY,
                    month: b.lunarM,
                    day: b.lunarD,
                    hour_branch: b.h,
                    is_leap: b.isLeap
                };
                chartData.solar = {
                    year: b.y,
                    month: b.m,
                    day: b.d,
                    hour: b.hour,
                    minute: b.minute
                };
            }
            
            // 透過 API 呼叫後端進行儲存
            try {
                const result = await window.api.fs.addChart(chartData);
                if (result.id) {
                    alert(`命盤 "${name}" 儲存成功！`);
                }
            } catch (error) {
                console.error('儲存命盤失敗:', error);
                alert(`儲存命盤 "${name}" 失敗！`);
            }
        });
    }
});