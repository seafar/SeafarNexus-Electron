// js/case-viewer.js (V4 - Implemented Lightbox Media Viewer)

document.addEventListener('DOMContentLoaded', async () => {
    // --- Global Variables ---
    let currentCaseData = null;
    let currentCaseFolderHandle = null;
    let relativePath = '';

    // --- UI Elements ---
    const caseTitleEl = document.getElementById('case-title');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const mainEditBtn = document.getElementById('main-edit-btn');
    
    // --- IndexedDB Helper ---
    const DB_NAME = 'SeafarNexusDB';
    const STORE_NAME = 'FileHandles';
    const handleStore = {
        async get(key) {
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME);
                    }
                };
            });
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
    };

    /**
     * 遞迴尋找子資料夾中的檔案 Handle
     * @param {FileSystemDirectoryHandle} startHandle - 開始尋找的資料夾 Handle
     * @param {string} path - 相對路徑, e.g., "videos/01.mp4"
     * @returns {Promise<FileSystemFileHandle>}
     */
    async function getFileHandleByPath(startHandle, path) {
        const parts = path.split('/');
        let currentHandle = startHandle;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;

            if (i === parts.length - 1) { // 最後一部分是檔案
                return await currentHandle.getFileHandle(part);
            } else { // 中間部分是資料夾
                currentHandle = await currentHandle.getDirectoryHandle(part);
            }
        }
    }
    
    async function getHandleByRelativePath(rootHandle, path) {
        const parts = path.split('/');
        let currentHandle = rootHandle;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;
            const isLastPart = (i === parts.length - 1);
            if (isLastPart) {
                currentHandle = await currentHandle.getDirectoryHandle(part);
                continue;
            }
            const prefixedName = `_${part}`;
            try {
                currentHandle = await currentHandle.getDirectoryHandle(prefixedName);
            } catch (e) {
                if (e.name === 'NotFoundError') {
                    try {
                        currentHandle = await currentHandle.getDirectoryHandle(part);
                    } catch (e2) {
                         console.error(`找不到路徑 ${path} 中的 ${part} 或 ${prefixedName}`);
                         throw e2; 
                    }
                } else {
                    throw e;
                }
            }
        }
        return currentHandle;
    }


    // --- Rendering Functions ---

    async function buildInfoboxHTML(data, caseFolderHandle) {
        // 建立一個安全的資料物件，確保所有屬性都存在，避免錯誤
        const safeData = { 
            ...data, 
            birthPlace: data.birthPlace || {}, 
            sourceInfo: data.sourceInfo || {}, 
            solar: data.solar || {}, 
            lunar: data.lunar || {}, 
            media: data.media || {},
            trueSolarTime: data.trueSolarTime || {}
        };
        
        let profileImageSrc = 'assets/icon.png'; // 預設圖片
        // 【核心修正】建立一個變數來儲存最終的主圖 HTML
        let profileImageHTML;

        if (safeData.media.profile_image) {
            try {
                const profileImageName = safeData.media.profile_image.split('/').pop();
                const profileDir = await caseFolderHandle.getDirectoryHandle('profile', { create: false });
                const fileHandle = await profileDir.getFileHandle(profileImageName);
                const file = await fileHandle.getFile();
                profileImageSrc = URL.createObjectURL(file);

                // 【核心修正】如果圖片成功載入，生成帶有 <a> 標籤的可點擊圖片
                profileImageHTML = `
                    <a href="#" class="media-link" data-path="${safeData.media.profile_image}" title="點擊放大檢視">
                        <img src="${profileImageSrc}" alt="${safeData.name}" style="width:100%; display:block; object-fit: cover; cursor: pointer;">
                    </a>
                `;

            } catch (e) {
                console.error("無法載入主要案例圖片:", e);
                profileImageSrc = 'assets/icon.png';
                // 【核心修正】如果圖片載入失敗，生成預設的、不可點擊的圖片
                profileImageHTML = `<img src="${profileImageSrc}" alt="${safeData.name}" style="width:100%; display:block; object-fit: cover;">`;
            }
        } else {
            // 【核心修正】如果沒有主圖，也生成預設的、不可點擊的圖片
            profileImageHTML = `<img src="${profileImageSrc}" alt="${safeData.name}" style="width:100%; display:block; object-fit: cover;">`;
        }
    
        let galleryLinksHTML = '';
        const galleryFiles = safeData.media.gallery_files || [];
        if (galleryFiles.length > 0) {
            galleryLinksHTML = galleryFiles.map(filePath => {
                if (!filePath) return '';
                const fileName = filePath.split('/').pop();
                return `<li><a href="#" class="media-link" data-path="${filePath}">${fileName}</a></li>`;
            }).join('');
        }

        const solarText = (safeData.solar.year) ? `${safeData.solar.year}年${safeData.solar.month}月${safeData.solar.day}日 ${safeData.solar.hour}:${String(safeData.solar.minute||0).padStart(2,'0')}` : 'N/A';
        const lunarText = (safeData.lunar.year) ? `${safeData.lunar.year}年 ${safeData.lunar.is_leap ? '(閏)' : ''}${safeData.lunar.month}月${safeData.lunar.day}日 ${safeData.lunar.hour_branch}時` : 'N/A';
        
        const linkHTML = safeData.link ? `<a href="${safeData.link}" target="_blank" rel="noopener noreferrer">點擊查看</a>` : '無';

        const tst = safeData.trueSolarTime;
        const tstText = tst.enabled && tst.finalYear
            ? `${tst.finalYear}/${String(tst.finalMonth).padStart(2, '0')}/${String(tst.finalDay).padStart(2, '0')} ${String(tst.finalHour).padStart(2, '0')}:${String(tst.finalMinute).padStart(2, '0')}`
            : '未啟用';

        const longitudeDiffText = tst.enabled && tst.longitudeCorrection !== undefined
            ? `${tst.longitudeCorrection.toFixed(2)} 秒`
            : 'N/A';
        const equationOfTimeText = tst.enabled && tst.equationOfTime !== undefined
            ? `${tst.equationOfTime.toFixed(2)} 秒`
            : 'N/A';

        return `
            <aside class="info-card">
                ${profileImageHTML}
                <h2 style="text-align: center; margin: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">${safeData.name}</h2>
                <dl class="info-card-grid">
                    <dt>性別</dt><dd>${safeData.gender === 'M' ? '男' : '女'}</dd>
                    <dt>分類</dt><dd>${safeData.category === '__ROOT__' ? '未分類' : safeData.category}</dd>
                    <dt>陽曆</dt><dd>${solarText}</dd>
                    <dt>陰曆</dt><dd>${lunarText}</dd>
                    <dt>地點</dt><dd>${safeData.birthPlace.city || 'N/A'}</dd>
                    <dt>真太陽時</dt><dd>${tstText}</dd>
                    <dt>經度時差</dt><dd>${longitudeDiffText}</dd>
                    <dt>均時差</dt><dd>${equationOfTimeText}</dd>
                    <dt>媒體庫</dt><dd><ul style="margin:0; padding-left: 15px;">${galleryLinksHTML || '<li>無</li>'}</ul></dd>
                    <dt style="grid-column: 1 / -1; text-align:center; font-weight:bold; color: #333; background-color: #f0f0f0; padding: 5px 0; margin-top:10px;">來源資訊</dt>
                    <dt>來源</dt><dd>${safeData.sourceInfo.dataSource || 'N/A'}</dd>
                    <dt>可靠度</dt><dd>${safeData.sourceInfo.reliability || 'N/A'}</dd>
                    <dt>來源註記</dt><dd>${safeData.sourceInfo.notes || 'N/A'}</dd>
                    <dt>來源連結</dt><dd>${linkHTML}</dd>
                </dl>
            </aside>
        `;
    }
    
    function buildMainContentHTML(data) {
        const content = { biography: "尚無個人簡介。", life_events: "尚無生命事件記錄。", relationships: "尚無人際關係記錄。", ...(data.content || {}) };
        // 【核心修正】直接使用儲存的 HTML，不再用 <p> 標籤包裹或進行文字轉換
        return `
            <div class="main-article-content">
                <section class="content-section">
                    <h2>個人簡介</h2>
                    <div>${content.biography}</div>
                </section>
                <section class="content-section">
                    <h2>生命事件</h2>
                    <div>${content.life_events}</div>
                </section>
                <section class="content-section">
                    <h2>人際關係</h2>
                    <div>${content.relationships}</div>
                </section>
            </div>
        `;
    }
    
    async function renderProfileTab() {
        const pane = document.getElementById('profile-pane');
        if (!currentCaseData || !currentCaseFolderHandle) {
            pane.innerHTML = "案例資料或資料夾控制代碼載入失敗。"; return;
        }
        pane.innerHTML = `<link rel="stylesheet" href="css/read.css"><div id="read-content-container"><div class="loading-placeholder">正在載入...</div></div>`;
        const infoboxHTML = await buildInfoboxHTML(currentCaseData, currentCaseFolderHandle);
        const mainContentHTML = buildMainContentHTML(currentCaseData);
        const container = pane.querySelector('#read-content-container');
        container.innerHTML = mainContentHTML + infoboxHTML;
    }
    
    async function renderTutorialTab() {
        const pane = document.getElementById('tutorial-pane');
        pane.innerHTML = '此處將會顯示 tutorial/ 資料夾內的影片和文件列表。 (功能開發中)';
    }
    
    async function renderUserTab() {
        const pane = document.getElementById('user-pane');
        pane.innerHTML = '此處將會顯示 user/ 資料夾的內容，並提供新增筆記的功能。 (功能開發中)';
    }

    // --- Main Entry Point ---
    try {
        const chartDataString = sessionStorage.getItem('currentCaseData');
        relativePath = sessionStorage.getItem('currentCasePath');
        
        if (!chartDataString || !relativePath) {
            throw new Error("找不到從主頁面傳遞的命例資料。");
        }
        currentCaseData = JSON.parse(chartDataString);

        document.title = `案例: ${currentCaseData.name}`;
        caseTitleEl.textContent = currentCaseData.name;

        const rootHandle = await handleStore.get('userDataHandle');
        if (!rootHandle) throw new Error("無法取得 UserData 資料夾權限。");
        
        currentCaseFolderHandle = await getHandleByRelativePath(rootHandle, relativePath);

        // Setup Lightbox Event Listeners
        const lightboxOverlay = document.getElementById('lightbox-overlay');
        const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
        const lightboxVideo = document.getElementById('lightbox-video');
        const lightboxImage = document.getElementById('lightbox-image');
        
        document.body.addEventListener('click', async (event) => {
            const mediaLink = event.target.closest('a.media-link');
            if (mediaLink) {
                event.preventDefault();
                const filePath = mediaLink.dataset.path;
                if (!filePath || !currentCaseFolderHandle) return;

                lightboxOverlay.classList.remove('hidden');
                lightboxVideo.style.display = 'none';
                lightboxImage.style.display = 'none';
                
                try {
                    const fileHandle = await getFileHandleByPath(currentCaseFolderHandle, filePath);
                    const file = await fileHandle.getFile();
                    const blobUrl = URL.createObjectURL(file);
                    
                    const fileExtension = filePath.split('.').pop().toLowerCase();
                    if (['mp4', 'webm', 'ogv', 'mov'].includes(fileExtension)) {
                        lightboxVideo.src = blobUrl;
                        lightboxVideo.style.display = 'block';
                    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExtension)) {
                        lightboxImage.src = blobUrl;
                        lightboxImage.style.display = 'block';
                    } else {
                        alert(`不支援的檔案格式: ${fileExtension}`);
                        lightboxOverlay.classList.add('hidden');
                    }
                } catch (e) {
                    console.error(`無法載入媒體檔案: ${filePath}`, e);
                    alert(`無法載入媒體檔案: ${filePath}`);
                    lightboxOverlay.classList.add('hidden');
                }
            }
        });

        const closeLightbox = () => {
            if (lightboxOverlay) lightboxOverlay.classList.add('hidden');
            if (lightboxVideo) {
                lightboxVideo.pause();
                URL.revokeObjectURL(lightboxVideo.src);
                lightboxVideo.src = '';
            }
            if (lightboxImage) {
                URL.revokeObjectURL(lightboxImage.src);
                lightboxImage.src = '';
            }
        };
        
        if(lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
        if(lightboxOverlay) lightboxOverlay.addEventListener('click', (event) => {
            if (event.target === lightboxOverlay) {
                closeLightbox();
            }
        });

        // Setup tab switching event listeners
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                button.classList.add('active');
                const targetPane = document.getElementById(button.dataset.tab);
                if (targetPane) targetPane.classList.add('active');

                switch(button.dataset.tab) {
                    case 'profile-pane': renderProfileTab(); break;
                    case 'tutorial-pane': renderTutorialTab(); break;
                    case 'user-pane': renderUserTab(); break;
                }
            });
        });
        
        mainEditBtn.addEventListener('click', () => {
            sessionStorage.setItem('currentCaseData', JSON.stringify(currentCaseData));
            sessionStorage.setItem('currentCasePath', relativePath);
            window.location.href = 'details.html';
        });

        // Default to loading the first tab
        await renderProfileTab();

    } catch (error) {
        console.error("載入案例儀表板失敗:", error);
        caseTitleEl.textContent = `載入失敗: ${error.message}`;
        const profilePane = document.getElementById('profile-pane');
        if(profilePane) profilePane.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
});