// js/dashboard.js (V16.3 - 修正檔案識別邏輯)

document.addEventListener('DOMContentLoaded', () => {
    let userDataHandle = null;
    const DB_NAME = 'SeafarNexusDB';
    const STORE_NAME = 'FileHandles';

    const handleStore = {
        async set(key, value) {
            const db = await this.getDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(value, key);
            return new Promise((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        },
        async get(key) {
            const db = await this.getDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        getDB() {
            return new Promise((resolve, reject) => {
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
        }
    };

    let allCases = [];
    let currentCategory = '所有命例';
    let currentPage = 1;
    const itemsPerPage = 10;
    let eventListenersBound = false;

    const caseListBody = document.getElementById('case-list-body');
    const categoryList = document.getElementById('category-list');
    const searchBox = document.getElementById('search-box');
    const paginationControls = document.getElementById('pagination-controls');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const renameCategoryBtn = document.getElementById('rename-category-btn');
    const deleteCategoryBtn = document.getElementById('delete-category-btn');
    const selectFolderBtn = document.getElementById('select-folder-btn');
    const initialPrompt = document.getElementById('initial-prompt');
    const tableWrapper = document.querySelector('.table-wrapper');

    function parseOldFolderName(folderName) {
        const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        const parts = folderName.split('-');
        if (parts.length < 6) return null;
        const [gender, yearStr, monthStr, dayStr, hourStr, ...nameParts] = parts;
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        const name = nameParts.join('-');
        if (isNaN(year) || isNaN(month) || isNaN(day) || !['M', 'F'].includes(gender) || !earthlyBranches.includes(hourStr)) return null;
        return { name, gender, lunar: { year, month, day, hour_branch: hourStr, is_leap: false } };
    }

    async function scanDirectory(dirHandle, currentPath = '') {
        let charts = [];
        let categories = [];
        let directCaseCount = 0;
        for await (const entry of dirHandle.values()) {
            if (entry.name.startsWith('.')) continue;

            if (entry.kind === 'directory') {
                let chartData = null;
                let isCase = false;

                // 【核心修正】統一的、向下相容的命例識別邏輯
                try {
                    // 優先級 1: 嘗試讀取 birth-data.json
                    const fileHandle = await entry.getFileHandle('birth-data.json');
                    const file = await fileHandle.getFile();
                    chartData = JSON.parse(await file.text());
                    isCase = true;
                } catch (e) {
                    if (e.name === 'NotFoundError') {
                        try {
                            // 優先級 2: 嘗試讀取舊的 profile.json
                            const fileHandle = await entry.getFileHandle('profile.json');
                            const file = await fileHandle.getFile();
                            chartData = JSON.parse(await file.text());
                            isCase = true;
                        } catch (e2) {
                            if (e2.name !== 'NotFoundError') { console.error("Error reading profile.json:", e2); }
                        }
                    } else { console.error("Error reading birth-data.json:", e); }
                }

                if (isCase) {
                    directCaseCount++;
                    chartData.category = currentPath || '__ROOT__';
                    charts.push({ id: entry.name, birth_data_json: chartData });
                } else {
                    // 優先級 3: 檢查是否為舊格式命例資料夾 (無json檔案)
                    const isOldFormat = entry.name.split('-').length >= 6 && !entry.name.includes('_SeafarNexus-');
                    if (isOldFormat) {
                        chartData = parseOldFolderName(entry.name);
                        if (chartData) {
                            directCaseCount++;
                            chartData.category = currentPath || '__ROOT__';
                            charts.push({ id: entry.name, birth_data_json: chartData });
                        }
                    } else {
                        // 優先級 4: 確認為分類資料夾
                        const categoryName = entry.name.startsWith('_') ? entry.name.substring(1) : entry.name;
                        const newPath = currentPath ? `${currentPath}/${categoryName}` : categoryName;
                        const subScan = await scanDirectory(entry, newPath);
                        charts.push(...subScan.charts);
                        categories.push({ name: categoryName, children: subScan.categories, count: subScan.totalCaseCount });
                    }
                }
            }
        }
        const totalCaseCount = directCaseCount + categories.reduce((sum, child) => sum + child.count, 0);
        return { charts, categories: categories.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant')), totalCaseCount };
    }
    
    // ... 後續所有函式 (renderCategoryTree, renderCaseList, etc.) 維持不變 ...
    // ... 此處省略，請保留您檔案中原有的內容 ...
    
    // 為了確保您的檔案是最新的，以下是完整的 dashboard.js 剩餘內容
    function renderCategoryTree(nodes, parentElement, parentPath = '') {
        nodes.forEach(node => {
            const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = `${node.name} (${node.count})`;
            span.dataset.category = currentPath;
            if (currentPath === currentCategory) { span.classList.add('active'); }
            li.appendChild(span);
            if (node.children && node.children.length > 0) {
                li.classList.add('has-children');
                if (parentPath === '') li.classList.add('expanded');
                const subUl = document.createElement('ul');
                li.appendChild(subUl);
                renderCategoryTree(node.children, subUl, currentPath);
            }
            parentElement.appendChild(li);
        });
    }

    async function renderCategories() {
        if (!userDataHandle) return;
        const { categories, charts } = await scanDirectory(userDataHandle);
        const totalCaseCount = charts.length;
        categoryList.innerHTML = '';
        const allCasesLi = document.createElement('li');
        const allCasesSpan = document.createElement('span');
        allCasesSpan.textContent = `所有命例 (${totalCaseCount})`;
        allCasesSpan.dataset.category = '所有命例';
        if ('所有命例' === currentCategory) { allCasesSpan.classList.add('active'); }
        allCasesLi.appendChild(allCasesSpan);
        categoryList.appendChild(allCasesLi);
        renderCategoryTree(categories, categoryList);
    }

    function renderCaseList(casesToRender) {
        caseListBody.innerHTML = '';
        if (casesToRender.length === 0) {
            caseListBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">尚無符合條件的命盤</td></tr>`;
        } else {
            casesToRender.forEach(item => {
                const b = item.birth_data_json;
                if (!b) return;
                const tr = document.createElement('tr');
                const solarText = (b.solar && b.solar.year) ? `${b.solar.year}/${String(b.solar.month).padStart(2, '0')}/${String(b.solar.day).padStart(2, '0')} ${String(b.solar.hour).padStart(2, '0')}:${String(b.solar.minute || 0).padStart(2, '0')}` : 'N/A';
                const lunarText = (b.lunar && b.lunar.year) ? `${b.lunar.year}年 ${b.lunar.is_leap ? '(閏)' : ''}${b.lunar.month}月${b.lunar.day}日 ${b.lunar.hour_branch}時` : 'N/A';
                const displayCategory = (b.category === '__ROOT__') ? '未分類' : (b.category || '未分類');
                tr.innerHTML = `
                    <td>${b.name}</td>
                    <td>${b.gender === 'M' ? '男' : '女'}</td>
                    <td>${solarText}</td>
                    <td>${lunarText}</td>
                    <td>${displayCategory}</td>
                    <td>
                        <button class="action-btn read-btn" data-id="${item.id}" title="瀏覽">👁️</button>
                        <button class="action-btn edit-btn" data-id="${item.id}" title="編輯">✏️</button>
                        <button class="action-btn delete-btn" data-id="${item.id}" title="刪除">🗑️</button>
                    </td>
                    <td>
                        <button class="action-btn load-btn" data-type="square" data-id="${item.id}">方</button>
                        <button class="action-btn load-btn" data-type="circle" data-id="${item.id}">圓</button>
                    </td>
                    <td>
                        <button class="action-btn analysis-btn" data-type="Aura" data-id="${item.id}">Aura</button>
                        <button class="action-btn analysis-btn" data-type="Spectrum" data-id="${item.id}">Spectrum</button>
                        <button class="action-btn analysis-btn" data-type="Synapse" data-id="${item.id}">Synapse</button>
                    </td>`;
                caseListBody.appendChild(tr);
            });
        }
    }

    function renderPaginationControls(totalItems) {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return;
        const prevButton = document.createElement('button');
        prevButton.textContent = '上一頁';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => { if (currentPage > 1) { currentPage--; filterAndRender(false); } });
        paginationControls.appendChild(prevButton);
        for (let i = 1; i <= totalPages; i++) {
            const pageElement = document.createElement(i === currentPage ? 'span' : 'button');
            pageElement.textContent = i;
            pageElement.className = 'page-number';
            if (i === currentPage) { pageElement.classList.add('active'); }
            else {
                pageElement.dataset.page = i;
                pageElement.addEventListener('click', (e) => { currentPage = parseInt(e.target.dataset.page, 10); filterAndRender(false); });
            }
            paginationControls.appendChild(pageElement);
        }
        const nextButton = document.createElement('button');
        nextButton.textContent = '下一頁';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; filterAndRender(false); } });
        paginationControls.appendChild(nextButton);
    }

    function showInputModal(title, message, initialValue = '', onOk) {
        const modal = document.getElementById('input-modal');
        const modalTitle = document.getElementById('input-modal-title');
        const modalMessage = document.getElementById('input-modal-message');
        const inputField = document.getElementById('input-modal-field');
        const okBtn = document.getElementById('input-modal-ok');
        const cancelBtn = document.getElementById('input-modal-cancel');
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        inputField.value = initialValue;
        const handleOk = () => { onOk(inputField.value); closeModal(); };
        const closeModal = () => {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', closeModal);
            document.removeEventListener('keydown', handleKeydown);
            modal.classList.add('hidden');
        };
        const handleKeydown = (e) => { if (e.key === 'Enter') { handleOk(); } else if (e.key === 'Escape') { closeModal(); } };
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', closeModal);
        document.addEventListener('keydown', handleKeydown);
        modal.classList.remove('hidden');
        inputField.focus();
    }
    
    async function getHandleFromPath(pathString, create = false) {
        let currentHandle = userDataHandle;
        if (pathString && pathString !== '__ROOT__') {
            const parts = pathString.split('/');
            for (const part of parts) {
                if (part) {
                    const prefixedName = `_${part}`;
                    try {
                        currentHandle = await currentHandle.getDirectoryHandle(prefixedName, { create });
                    } catch (e) {
                        if (e.name === 'NotFoundError' && !create) {
                            try {
                                currentHandle = await currentHandle.getDirectoryHandle(part, { create });
                            } catch (e2) { throw e2; }
                        } else {
                            throw e;
                        }
                    }
                }
            }
        }
        return currentHandle;
    }

    async function loadAndRender() {
        if (!userDataHandle) return;
        caseListBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">載入中...</td></tr>`;
        try {
            const { charts } = await scanDirectory(userDataHandle);
            allCases = charts;
            currentPage = 1;
            await filterAndRender(true);
            bindEventListeners();
        } catch (error) {
            console.error("無法載入列表:", error);
            caseListBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">載入失敗: ${error.message}</td></tr>`;
        }
    }

    async function filterAndRender(shouldRenderCategories = true) {
        if (shouldRenderCategories) {
            await renderCategories();
        }
        let filteredCases = allCases;
        if (currentCategory !== '所有命例') {
            filteredCases = allCases.filter(c => {
                const caseCategory = c.birth_data_json.category;
                if (currentCategory === '未分類') {
                    return caseCategory === '__ROOT__';
                }
                return caseCategory === currentCategory || caseCategory.startsWith(currentCategory + '/');
            });
        }
        const searchTerm = searchBox.value.toLowerCase().trim();
        if (searchTerm) {
            filteredCases = filteredCases.filter(c => c.birth_data_json.name.toLowerCase().includes(searchTerm));
        }
        const paginatedCases = filteredCases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        renderCaseList(paginatedCases);
        renderPaginationControls(filteredCases.length);
    }

    function normalizeCategoryName(name) {
        let cleanName = name.trim();
        while (cleanName.startsWith('_')) {
            cleanName = cleanName.substring(1);
        }
        return `_${cleanName}`;
    }

    function bindEventListeners() {
        if (eventListenersBound) return;
        
        addCategoryBtn.addEventListener('click', () => {
            showInputModal('新增分類', '請輸入新的分類路徑 (例如: "我的客戶" 或 "研究/商業名人"):', '', async (newCategoryPath) => {
                newCategoryPath = newCategoryPath.trim();
                if (newCategoryPath) {
                     if (newCategoryPath.split('/').some(part => part.startsWith('_'))) {
                        alert('分類名稱的任何層級都不能以 "_" 符號開頭，此為系統保留字元。');
                        return;
                    }
                    try {
                        let currentHandle = userDataHandle;
                        const pathParts = newCategoryPath.split('/');
                        for (const part of pathParts) {
                            if (part) {
                                const normalizedPart = normalizeCategoryName(part);
                                currentHandle = await currentHandle.getDirectoryHandle(normalizedPart, { create: true });
                            }
                        }
                        await loadAndRender();
                    } catch (e) { alert(`建立失敗: ${e.message}`); }
                }
            });
        });

        renameCategoryBtn.addEventListener('click', async () => {
            if (renameCategoryBtn.disabled) return;
            const oldPath = currentCategory;
            const oldName = oldPath.split('/').pop();
            
            showInputModal('重新命名分類', `請輸入「${oldName}」的新名稱：`, oldName, async (newName) => {
                newName = newName.trim();
                if (!newName || newName === oldName) return;
                 if (newName.startsWith('_')) {
                    alert('分類名稱不能以 "_" 符號開頭，此為系統保留字元。');
                    return;
                }
                if (/[\\/:*?"<>|]/.test(newName)) {
                    alert('分類名稱不能包含 \\ / : * ? " < > | 等特殊字元。');
                    return;
                }
                
                const oldPathParts = oldPath.split('/');
                oldPathParts.pop();
                const parentPath = oldPathParts.join('/');
                const newPath = parentPath ? `${parentPath}/${newName}` : newName;

                try {
                    await renameCategory(oldPath, newPath);
                    await loadAndRender();
                } catch (e) {
                    alert(`重新命名失敗: ${e.message}`);
                    console.error('Rename failed:', e);
                }
            });
        });
        
        deleteCategoryBtn.addEventListener('click', async () => { alert('刪除分類功能開發中'); });

        categoryList.addEventListener('click', (e) => {
            const span = e.target.closest('span[data-category]');
            if (span) {
                if (span.parentElement.classList.contains('has-children')) {
                    span.parentElement.classList.toggle('expanded');
                }
                document.querySelector('#category-list span.active')?.classList.remove('active');
                span.classList.add('active');
                currentCategory = span.dataset.category;
                currentPage = 1;
                
                if (currentCategory === '所有命例') {
                    renameCategoryBtn.disabled = true;
                    deleteCategoryBtn.disabled = true;
                } else {
                    renameCategoryBtn.disabled = false;
                    deleteCategoryBtn.disabled = false;
                }
                filterAndRender(false);
            }
        });
        
        searchBox.addEventListener('input', () => { currentPage = 1; filterAndRender(false); });

        caseListBody.addEventListener('click', async (e) => {
            const target = e.target.closest('.action-btn');
            if (!target) return;
            const id = target.dataset.id;
            const item = allCases.find(c => c.id === id);
            if (!item) return;

            const categoryPath = item.birth_data_json.category;
            const relativePath = (categoryPath === '__ROOT__') ? id : `${categoryPath}/${id}`;

            if (target.classList.contains('edit-btn') || target.classList.contains('read-btn')) {
                try {
                    const parentHandle = await getHandleFromPath(categoryPath);
                    const chartFolderHandle = await parentHandle.getDirectoryHandle(id);
                    let chartData;
                    try {
                        const fileHandle = await chartFolderHandle.getFileHandle('birth-data.json');
                        chartData = JSON.parse(await (await fileHandle.getFile()).text());
                    } catch (e) {
                         try {
                            const fileHandle = await chartFolderHandle.getFileHandle('profile.json');
                            chartData = JSON.parse(await (await fileHandle.getFile()).text());
                         } catch (e2) {
                             chartData = parseOldFolderName(id);
                             if(chartData) chartData.category = item.birth_data_json.category;
                         }
                    }
                    if(!chartData) throw new Error('無法解析命例資料');
                    
                    sessionStorage.setItem('currentCaseData', JSON.stringify(chartData));
                    sessionStorage.setItem('currentCasePath', relativePath);

                    const viewToOpen = target.classList.contains('edit-btn') ? 'details.html' : 'case-viewer.html';
                    window.open(viewToOpen, '_blank');
                } catch (error) {
                    alert(`無法讀取命例檔案: ${error.message}`);
                    console.error("讀取命例檔案失敗:", error);
                }
            } else if (target.classList.contains('delete-btn')) {
                if (confirm(`確定刪除 "${item.birth_data_json.name}" 嗎？`)) {
                    try {
                        const parentHandle = await getHandleFromPath(categoryPath);
                        await parentHandle.removeEntry(id, { recursive: true });
                        await loadAndRender();
                    } catch (err) { alert(`刪除失敗: ${err.message}`); }
                }
            } else if (target.classList.contains('load-btn')) {
                const type = target.dataset.type;
                const d = item.birth_data_json;
                let params = new URLSearchParams();
                if (d.lunar && d.lunar.year) {
                    params.set('name', d.name); params.set('gender', d.gender); params.set('lang', 'zh-TW'); params.set('inputType', 'lunar'); params.set('year', d.lunar.year); params.set('month', d.lunar.month); params.set('day', d.lunar.day); params.set('hour', d.lunar.hour_branch); params.set('isLeap', d.lunar.is_leap);
                } else if (d.solar && d.solar.year) {
                    params.set('name', d.name); params.set('gender', d.gender); params.set('lang', 'zh-TW'); params.set('inputType', 'solar'); params.set('year', d.solar.year); params.set('month', d.solar.month); params.set('day', d.solar.day); params.set('hour', d.solar.hour); params.set('minute', d.solar.minute || 0);
                } else {
                    alert(`命例 "${d.name}" 缺少有效的生日資料`);
                    return;
                }
                const htmlFile = type === 'circle' ? `chart_circle.html` : `chart.html`;
                window.open(htmlFile + '?' + params.toString(), '_blank');
            } else if (target.classList.contains('analysis-btn')) {
                alert(`「${target.dataset.type}」分析模組功能開發中。`);
            }
        });
        
        window.addEventListener('requestOpenAddCaseModal', async () => {
            const { categories } = await scanDirectory(userDataHandle);
            window.dispatchEvent(new CustomEvent('openAddCaseModal', { detail: { categoryTree: categories, currentCategory } }));
        });

        window.addEventListener('saveCase', async (e) => {
            const chartData = e.detail;
            if (!chartData.category) {
                alert('錯誤：新增案例時必須選擇一個分類。');
                return;
            }
            const getBaseNameFromData = (d) => {
                const gender = d.gender === 'M' ? 'M' : 'F';
                const year = String(d.lunar.year);
                const month = String(d.lunar.month).padStart(2, '0');
                const day = String(d.lunar.day).padStart(2, '0');
                const hour = d.lunar.hour_branch;
                const name = chartData.name.replace(/[\\/:*?"<>|]/g, '_');
                return `${gender}-${year}-${month}-${day}-${hour}-${name}`;
            };
            const baseName = getBaseNameFromData(chartData);
            
            const newId = String(Date.now()).slice(-7);
            const folderName = `${baseName}_SeafarNexus-${newId}`;
            
            const categoryPath = chartData.category;
            
            try {
                const parentHandle = await getHandleFromPath(categoryPath, true);
                const chartFolderHandle = await parentHandle.getDirectoryHandle(folderName, { create: true });
                const profileHandle = await chartFolderHandle.getFileHandle('birth-data.json', { create: true });
                const writable = await profileHandle.createWritable();
                
                // 【核心修正】為新案例建立完整的資料結構
                const dataToSave = { 
                    ...chartData, 
                    category: categoryPath,
                    media: {
                        profile_image: "",
                        gallery_files: [],
                        supplementary_images: [],
                        videos: []
                    },
                    content: {
                        biography: "",
                        life_events: "",
                        relationships: ""
                    }
                };
                
                await writable.write(JSON.stringify(dataToSave, null, 2));
                await writable.close();
                await loadAndRender();
            } catch (error) {
                console.error('新增命盤失敗:', error);
                alert(`新增命盤失敗: ${error.message}`);
            }
        });
        window.addEventListener('message', (event) => { if (event.data === 'caseUpdated') loadAndRender(); }, false);
        eventListenersBound = true;
    }
    
    async function initializeApp() {
        if (!window.showDirectoryPicker) {
            initialPrompt.innerHTML = `<h2>瀏覽器不支援</h2><p>您的瀏覽器不支援 File System Access API。<br>請使用最新版的 Chrome, Edge, 或 Opera 瀏覽器以獲得完整功能。</p>`;
            return;
        }
        
        selectFolderBtn.addEventListener('click', async () => {
            try {
                userDataHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
                await handleStore.set('userDataHandle', userDataHandle);
                await initializeApp();
            } catch (error) {
                console.warn('使用者取消選擇或發生錯誤:', error);
            }
        });
        
        try {
            userDataHandle = await handleStore.get('userDataHandle');
            if (userDataHandle) {
                 const permission = await userDataHandle.queryPermission({ mode: 'readwrite' });
                 if (permission !== 'granted') {
                    console.warn("先前授權的資料夾權限已失效或被撤銷。");
                    userDataHandle = null;
                 }
            }
        } catch(e) { 
            console.error("檢查權限時發生錯誤:", e);
            userDataHandle = null; 
        }

        if (userDataHandle) {
            initialPrompt.style.display = 'none';
            tableWrapper.style.display = 'block';
            document.querySelectorAll('button, input').forEach(el => el.disabled = false);
            renameCategoryBtn.disabled = true;
            deleteCategoryBtn.disabled = true;
            await loadAndRender();
        } else {
            initialPrompt.style.display = 'block';
            tableWrapper.style.display = 'none';
            document.querySelectorAll('button, input[type=text]').forEach(el => el.disabled = true);
            selectFolderBtn.disabled = false;
        }
    }
    
    async function moveDirectoryContents(sourceHandle, destHandle) {
        for await (const entry of sourceHandle.values()) {
            if (entry.kind === 'file') {
                const file = await entry.getFile();
                const newFileHandle = await destHandle.getFileHandle(entry.name, { create: true });
                const writable = await newFileHandle.createWritable();
                await writable.write(file);
                await writable.close();
            } else if (entry.kind === 'directory') {
                const newDestHandle = await destHandle.getDirectoryHandle(entry.name, { create: true });
                await moveDirectoryContents(entry, newDestHandle);
            }
        }
    }

    async function updateCategoryInProfiles(dirHandle, oldPathPrefix, newPathPrefix) {
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'directory') {
                try {
                    let fileHandle;
                    try {
                        fileHandle = await entry.getFileHandle('birth-data.json');
                    } catch(e) {
                        fileHandle = await entry.getFileHandle('profile.json');
                    }
                    const file = await fileHandle.getFile();
                    let chartData = JSON.parse(await file.text());
                    
                    if (chartData.category && chartData.category.startsWith(oldPathPrefix)) {
                        chartData.category = chartData.category.replace(oldPathPrefix, newPathPrefix);
                        
                        const writable = await fileHandle.createWritable();
                        await writable.write(JSON.stringify(chartData, null, 2));
                        await writable.close();
                    }
                } catch (e) {
                    if(e.name !== 'NotFoundError') {
                        await updateCategoryInProfiles(entry, oldPathPrefix, newPathPrefix);
                    }
                }
            }
        }
    }

    async function renameCategory(oldPath, newPath) {
        const oldPathParts = oldPath.split('/');
        const newPathParts = newPath.split('/');
        const oldName = oldPathParts.pop();
        const newName = newPathParts.pop();
        const parentPath = oldPathParts.join('/');

        const parentHandle = await getHandleFromPath(parentPath);
        
        const prefixedNewName = normalizeCategoryName(newName);

        try {
            await parentHandle.getDirectoryHandle(prefixedNewName);
            throw new Error(`分類 "${newName}" 已存在。`);
        } catch (e) {
            if (e.name !== 'NotFoundError') { throw e; }
        }
        
        let oldDirHandle;
        try {
            oldDirHandle = await parentHandle.getDirectoryHandle(`_${oldName}`);
        } catch (e) {
            if (e.name === 'NotFoundError') {
                oldDirHandle = await parentHandle.getDirectoryHandle(oldName);
            } else { throw e; }
        }

        const newDirHandle = await parentHandle.getDirectoryHandle(prefixedNewName, { create: true });

        await moveDirectoryContents(oldDirHandle, newDirHandle);
        await updateCategoryInProfiles(newDirHandle, oldPath, newPath);
        await parentHandle.removeEntry(oldDirHandle.name, { recursive: true });

        currentCategory = newPath;
    }

    initializeApp();
});