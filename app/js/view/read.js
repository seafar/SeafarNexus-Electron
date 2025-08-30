// js/read.js (V6.2 - 最終修正版，修正 sessionStorage 邏輯)
document.addEventListener('DOMContentLoaded', async () => {
    const caseTitleEl = document.getElementById('case-title');
    const openEditBtn = document.getElementById('open-edit-btn');
    
    function renderArticleView(data) {
        const container = document.getElementById('read-content-container');
        // 【修正】確保所有欄位都有預設值，防止 data 物件本身不完整
        const safeData = { ...data, birthPlace: data.birthPlace || {}, sourceInfo: data.sourceInfo || {}, trueSolarTime: data.trueSolarTime || {}, solar: data.solar || {}, lunar: data.lunar || {} };
        const isPre1888 = !safeData.solar || !safeData.solar.year;
        
        let solarText = 'N/A';
        if (!isPre1888 && safeData.solar.year) {
            solarText = `${safeData.solar.year}年${String(safeData.solar.month).padStart(2, '0')}月${String(safeData.solar.day).padStart(2, '0')}日 ${String(safeData.solar.hour).padStart(2, '0')}:${String(safeData.solar.minute || 0).padStart(2, '0')}`;
        }
        
        const lunarText = safeData.lunar.year ? `${safeData.lunar.year}年 ${safeData.lunar.is_leap ? '(閏)' : ''}${safeData.lunar.month}月${safeData.lunar.day}日 ${safeData.lunar.hour_branch}時` : 'N/A';
        
        const tstText = safeData.trueSolarTime.enabled && safeData.trueSolarTime.finalHour !== undefined 
            ? `${safeData.trueSolarTime.finalYear}/${String(safeData.trueSolarTime.finalMonth).padStart(2, '0')}/${String(safeData.trueSolarTime.finalDay).padStart(2, '0')} ${String(safeData.trueSolarTime.finalHour).padStart(2, '0')}:${String(safeData.trueSolarTime.finalMinute).padStart(2, '0')}:${String(safeData.trueSolarTime.finalSecond || 0).padStart(2, '0')}` 
            : '未啟用';
        
        // 【修正】確保所有讀取都使用 safeData 物件
        container.innerHTML = `
            <aside class="info-card">
                <h2>基本資料</h2>
                <dl class="info-card-grid">
                    <dt>名稱</dt><dd>${safeData.name || 'N/A'}</dd>
                    <dt>性別</dt><dd>${safeData.gender === 'M' ? '男' : '女'}</dd>
                    <dt>分類</dt><dd>${(safeData.category === '__ROOT__' ? '未分類' : safeData.category) || '未分類'}</dd>
                    <dt>陽曆</dt><dd>${solarText}</dd>
                    <dt>陰曆</dt><dd>${lunarText}</dd>
                    <dt>真太陽時</dt><dd>${tstText}</dd>
                    <dt>出生地點</dt><dd>${safeData.birthPlace.city || 'N/A'}</dd>
                    <dt>經度/時區</dt><dd>${(safeData.birthPlace.longitude || 'N/A')} / ${(safeData.timezone || 'N/A')}</dd>
                </dl>
            </aside>
            <div class="main-article-content">
                <section class="content-section">
                    <h2>個人簡介</h2>
                    <p>${safeData.biography || '尚無簡介。'}</p>
                </section>
                <section class="content-section">
                    <h2>來源資訊</h2>
                    <dl class="info-card-grid">
                        <dt>資料來源</dt><dd>${safeData.sourceInfo.dataSource || 'N/A'}</dd>
                        <dt>生辰可靠度</dt><dd>${safeData.sourceInfo.reliability || 'N/A'}</dd>
                        <dt>來源註記</dt><dd>${safeData.sourceInfo.notes || 'N/A'}</dd>
                        <dt>外部連結</dt><dd><a href="${safeData.link || '#'}" target="_blank">${safeData.link || 'N/A'}</a></dd>
                    </dl>
                </section>
            </div>
        `;
    }

    try {
        const chartDataString = sessionStorage.getItem('currentCaseData');
        const relativePath = sessionStorage.getItem('currentCasePath');
        
        sessionStorage.removeItem('currentCaseData');
        sessionStorage.removeItem('currentCasePath');

        if (!chartDataString || !relativePath) {
            throw new Error("找不到從主頁面傳遞的命例資料。請關閉此分頁，返回主畫面重試。");
        }
        
        let chartData = JSON.parse(chartDataString);
        
        document.title = `瀏覽案例 - ${chartData.name}`;
        caseTitleEl.textContent = chartData.name;
        renderArticleView(chartData);
        
        if(openEditBtn) {
            openEditBtn.addEventListener('click', () => {
                sessionStorage.setItem('currentCaseData', JSON.stringify(chartData));
                sessionStorage.setItem('currentCasePath', relativePath);
                window.open(`details.html`, '_blank');
            });
        }

    } catch (error) {
        console.error("載入案例詳情失敗:", error);
        caseTitleEl.textContent = `載入案例失敗: ${error.message}`;
        if(openEditBtn) openEditBtn.style.display = 'none';
    }
});