// js/details.js (V37 - 增強 paste_postprocess 以處理更複雜的列表結構)

document.addEventListener('DOMContentLoaded', async () => {
    const converter = new LunarSolarConverter();
    const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    const caseTitleEl = document.getElementById('case-title');
    const saveAllBtn = document.getElementById('save-all-changes-btn');
    const headerButtonsContainer = document.getElementById('header-buttons');

    let isRichEditor = true;

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

    function renderBasicInfoForm(data) {
        const container = document.getElementById('basic-info');
        const safeData = { ...data, birthPlace: data.birthPlace || {}, sourceInfo: data.sourceInfo || {}, trueSolarTime: data.trueSolarTime || {}, solar: data.solar || {}, lunar: data.lunar || {}, media: data.media || {}, content: data.content || {} };
        safeData.media.gallery_files = safeData.media.gallery_files || [];
        const isPre1888 = !safeData.solar || !safeData.solar.year;
        const hourBranchOptions = earthlyBranches.map(branch => `<option value="${branch}" ${safeData.lunar.hour_branch === branch ? 'selected' : ''}>${branch}</option>`).join('');

        let mediaListHTML = (safeData.media.gallery_files || []).map((filePath, index) => `
            <div class="media-list-item" data-path="${filePath}">
                <input type="text" value="${filePath}" readonly style="background-color: #f8f9fa; border: 1px solid #ddd;">
                <button type="button" class="remove-media-btn" data-index="${index}">移除</button>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="form-grid">
                <div class="form-section">
                    <h2>核心資料</h2>
                    <div class="input-group"> <label for="name">名稱 (Name)</label> <input type="text" id="name" value="${safeData.name || ''}"> </div>
                    <div class="input-group radio-group">
                        <label>性別 (Gender)</label>
                        <div><label><input type="radio" name="gender" value="M" ${safeData.gender === 'M' ? 'checked' : ''}> 男</label><label><input type="radio" name="gender" value="F" ${safeData.gender === 'F' ? 'checked' : ''}> 女</label></div>
                    </div>
                    <div class="input-group"><label for="category-select">分類</label><select id="category-select"></select></div>
                </div>

                <div class="form-section">
                    <h2>生辰資料 (Born On)</h2>
                    <div class="date-group">
                        <div class="input-group"><label>陽曆年</label><input type="number" id="solar-year" value="${safeData.solar.year || ''}" ${isPre1888 ? 'disabled' : ''}></div>
                        <div class="input-group"><label>月</label><input type="number" id="solar-month" value="${safeData.solar.month || ''}" ${isPre1888 ? 'disabled' : ''}></div>
                        <div class="input-group"><label>日</label><input type="number" id="solar-day" value="${safeData.solar.day || ''}" ${isPre1888 ? 'disabled' : ''}></div>
                    </div>
                    <div class="date-group">
                        <div class="input-group"><label>時</label><input type="number" id="solar-hour" value="${safeData.solar.hour !== undefined ? safeData.solar.hour : ''}" ${isPre1888 ? 'disabled' : ''}></div>
                        <div class="input-group"><label>分</label><input type="number" id="solar-minute" value="${safeData.solar.minute !== undefined ? String(safeData.solar.minute).padStart(2, '0') : ''}" ${isPre1888 ? 'disabled' : ''}></div>
                    </div>
                    <div class="date-group">
                        <div class="input-group"><label>陰曆年</label><input type="number" id="lunar-year" value="${safeData.lunar.year || ''}" ${isPre1888 ? '' : 'readonly'}></div>
                        <div class="input-group"><label>月</label><input type="number" id="lunar-month" value="${safeData.lunar.month || ''}" ${isPre1888 ? '' : 'readonly'}></div>
                        <div class="input-group"><label>日</label><input type="number" id="lunar-day" value="${safeData.lunar.day || ''}" ${isPre1888 ? '' : 'readonly'}></div>
                    </div>
                    <div class="date-group">
                        <div class="input-group" style="flex-grow: 2;"><label>時辰</label><select id="lunar-hour" ${isPre1888 ? '' : 'disabled'}>${hourBranchOptions}</select></div>
                        <div class="input-group" style="flex-grow: 1;"><label>&nbsp;</label><div class="checkbox-line"><input type="checkbox" id="lunar-leap" ${safeData.lunar.is_leap ? 'checked' : ''} ${isPre1888 ? '' : 'disabled'}><label for="lunar-leap">閏月</label></div></div>
                    </div>
                </div>

                <div class="form-section">
                    <h2>出生地點 & 真太陽時</h2>
                    <div class="input-group"><label for="place-city">城市/地點</label><input type="text" id="place-city" value="${safeData.birthPlace.city || ''}"></div>
                    <div class="date-group">
                        <div class="input-group"><label for="longitude">經度</label><input type="number" step="0.0001" id="longitude" value="${safeData.birthPlace.longitude || ''}"></div>
                        <div class="input-group"><label for="timezone">時區</label><input type="number" id="timezone" value="${safeData.timezone || ''}"></div>
                    </div>
                    <div class="input-group"><div class="checkbox-line"><input type="checkbox" id="use-tst" ${safeData.trueSolarTime.enabled ? 'checked' : ''}><label for="use-tst">使用真太陽時排盤</label></div><div id="tst-result" class="tst-display"></div></div>
                </div>

                <div class="form-section">
                    <h2>來源資訊</h2>
                    <div class="input-group"><label for="data-source">資料來源</label><input type="text" id="data-source" value="${safeData.sourceInfo.dataSource || ''}"></div>
                    <div class="input-group"><label for="reliability">生辰可靠度</label><input type="text" id="reliability" value="${safeData.sourceInfo.reliability || ''}"></div>
                    <div class="input-group"><label for="source-notes">來源註記</label><textarea id="source-notes">${safeData.sourceInfo.notes || ''}</textarea></div>
                </div>

                <div class="form-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <h2>個人簡介 (主條目內容)</h2>
                        <button type="button" id="toggle-editor-btn" style="padding: 4px 8px; font-size: 12px;">切換為純文字</button>
                    </div>
                    <textarea id="biography-editor" style="min-height: 250px;">${safeData.content.biography || ''}</textarea>
                </div>

                <div class="form-section">
                    <h2>媒體資料</h2>
                    <div class="input-group">
                        <label for="profile-image-upload">主要案例圖片 (1張)</label>
                        <div class="media-list-item">
                            <input type="file" id="profile-image-upload" accept="image/*" style="flex-grow: 1;">
                            <button type="button" id="remove-profile-image-btn" class="remove-media-btn">移除</button>
                        </div>
                        <small>目前檔案: <span id="profile-image-name">${safeData.media.profile_image || '無'}</span></small>
                    </div>
                    <div class="input-group">
                        <label>輔助媒體檔案 (圖片/影片)</label>
                        <div id="media-list-container" class="media-list">${mediaListHTML}</div>
                        <button type="button" id="add-media-btn">新增媒體檔案</button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('life-events-editor').value = safeData.content.life_events || '';
        document.getElementById('relationships-editor').value = safeData.content.relationships || '';
    }

    async function handleFileUploads(caseFolderHandle, updatedData) {
        updatedData.media = updatedData.media || {};
        const mediaDirHandle = await caseFolderHandle.getDirectoryHandle('media', { create: true });
        
        const profileImgInput = document.getElementById('profile-image-upload');
        if (profileImgInput && profileImgInput.files.length > 0) {
            const file = profileImgInput.files[0];
            const profileDirHandle = await caseFolderHandle.getDirectoryHandle('profile', { create: true });
            const newFileHandle = await profileDirHandle.getFileHandle(file.name, { create: true });
            const writable = await newFileHandle.createWritable();
            await writable.write(file);
            await writable.close();
            updatedData.media.profile_image = `profile/${file.name}`;
        } else {
            const oldFileNameSpan = document.getElementById('profile-image-name');
            const oldFileName = oldFileNameSpan ? oldFileNameSpan.textContent : '';
            updatedData.media.profile_image = (oldFileName && oldFileName !== '無') ? oldFileName : '';
        }

        const newGalleryFiles = [];
        const mediaItems = document.querySelectorAll('#media-list-container .media-list-item');
        for (const item of mediaItems) {
            const fileInput = item.querySelector('input[type="file"]');
            const pathInput = item.querySelector('input[type="text"]');

            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const newFileHandle = await mediaDirHandle.getFileHandle(file.name, { create: true });
                const writable = await newFileHandle.createWritable();
                await writable.write(file);
                await writable.close();
                newGalleryFiles.push(`media/${file.name}`);
            } else if (pathInput) {
                newGalleryFiles.push(pathInput.value);
            }
        }
        updatedData.media.gallery_files = newGalleryFiles.filter(Boolean);
    }
    
    function setupFileInputListeners() {
        const mainInput = document.getElementById('profile-image-upload');
        const mainSpan = document.getElementById('profile-image-name');
        if (mainInput && mainSpan) {
            mainInput.addEventListener('change', () => {
                if (mainInput.files.length > 0) {
                    mainSpan.textContent = mainInput.files[0].name;
                }
            });
        }
    }

    function calculateAndDisplay(initialData) {
        const solarYearInput = document.getElementById('solar-year');
        if (!solarYearInput) return { tstResult: null, finalLunar: initialData.lunar };
        if (solarYearInput.disabled) return { tstResult: null, finalLunar: initialData.lunar };
        
        const tstResultEl = document.getElementById('tst-result');
        const solarData = {
            year: parseInt(document.getElementById('solar-year').value, 10),
            month: parseInt(document.getElementById('solar-month').value, 10),
            day: parseInt(document.getElementById('solar-day').value, 10),
            hour: parseInt(document.getElementById('solar-hour').value, 10),
            minute: parseInt(document.getElementById('solar-minute').value, 10)
        };
        const longitude = parseFloat(document.getElementById('longitude').value);
        const timezone = parseFloat(document.getElementById('timezone').value);
        const useTstCheckbox = document.getElementById('use-tst');

        let tstResult = null;
        let finalHourForCalc = solarData.hour;
        
        if (tstResultEl && !isNaN(longitude) && !isNaN(timezone) && !isNaN(solarData.year) && !isNaN(solarData.month) && !isNaN(solarData.day) && !isNaN(solarData.hour) && !isNaN(solarData.minute)) {
            const birthDateTime = new Date(solarData.year, solarData.month - 1, solarData.day, solarData.hour, solarData.minute, 0);
            const timezoneLongitude = timezone * 15;
            const longitudeCorrectionInSeconds = (longitude - timezoneLongitude) * 4 * 60;
            const date = new Date(solarData.year, solarData.month - 1, solarData.day);
            const start = new Date(date.getFullYear(), 0, 0);
            const diff = date - start;
            const oneDay = 1000 * 60 * 60 * 24;
            const dayOfYear = Math.floor(diff / oneDay);
            const B = (2 * Math.PI * (dayOfYear - 81)) / 364;
            const equationOfTimeInMinutes = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
            const equationOfTimeInSeconds = equationOfTimeInMinutes * 60;
            const totalCorrectionInSeconds = longitudeCorrectionInSeconds + equationOfTimeInSeconds;
            const correctedDateTime = new Date(birthDateTime.getTime() + totalCorrectionInSeconds * 1000);
            const [finalYear, finalMonth, finalDay, finalHour, finalMinute, finalSecond] = [correctedDateTime.getFullYear(), correctedDateTime.getMonth() + 1, correctedDateTime.getDate(), correctedDateTime.getHours(), correctedDateTime.getMinutes(), correctedDateTime.getSeconds()];
            const format = (num) => String(num).padStart(2, '0');
            tstResultEl.innerHTML = `經度時差: ${longitudeCorrectionInSeconds.toFixed(2)}秒 | 均時差: ${equationOfTimeInSeconds.toFixed(2)}秒 | <b>真太陽時: ${finalYear}/${format(finalMonth)}/${format(finalDay)} ${format(finalHour)}:${format(finalMinute)}:${format(finalSecond)}</b>`;
            tstResult = { longitudeCorrection: longitudeCorrectionInSeconds, equationOfTime: equationOfTimeInSeconds, finalYear, finalMonth, finalDay, finalHour, finalMinute, finalSecond };
            if(useTstCheckbox && useTstCheckbox.checked) finalHourForCalc = finalHour;
        } else if (tstResultEl) {
            tstResultEl.textContent = '請輸入完整的陽曆、經度和時區以計算真太陽時';
        }
        
        const lunarYearInput = document.getElementById('lunar-year');
        const lunarMonthInput = document.getElementById('lunar-month');
        const lunarDayInput = document.getElementById('lunar-day');
        const lunarHourSelect = document.getElementById('lunar-hour');
        const lunarLeapCheckbox = document.getElementById('lunar-leap');
        const s = new Solar();
        s.solarYear = solarData.year; s.solarMonth = solarData.month; s.solarDay = solarData.day;
        const l_res = converter.SolarToLunar(s);
        const hour_branch = isNaN(finalHourForCalc) ? 'N/A' : earthlyBranches[Math.floor(((finalHourForCalc + 1) % 24) / 2)];
        if(lunarYearInput) lunarYearInput.value = l_res.lunarYear;
        if(lunarMonthInput) lunarMonthInput.value = l_res.lunarMonth;
        if(lunarDayInput) lunarDayInput.value = l_res.lunarDay;
        if(lunarHourSelect) lunarHourSelect.value = hour_branch;
        if(lunarLeapCheckbox) lunarLeapCheckbox.checked = l_res.isleap;
        
        return { tstResult, finalLunar: { year: l_res.lunarYear, month: l_res.lunarMonth, day: l_res.lunarDay, is_leap: l_res.isleap, hour_branch: hour_branch } };
    }

    async function setupEventListeners(initialData, initialFolderName) {
        let currentFolderName = initialFolderName;
        const categorySelect = document.getElementById('category-select');

        async function scanCategories(dirHandle, parentPath = '') {
            let categories = [];
            for await (const entry of dirHandle.values()) {
                if (entry.name.startsWith('.') || entry.name === '(子分類)') continue;
                if (entry.kind === 'directory') {
                    let isCaseFolder = false;
                    try { await entry.getFileHandle('birth-data.json'); isCaseFolder = true; }
                    catch (e) {
                         try { await entry.getFileHandle('profile.json'); isCaseFolder = true; }
                         catch (e2) { if (entry.name.split('-').length >= 6 && !entry.name.includes('_SeafarNexus-')) { isCaseFolder = true; } }
                    }
                    if (!isCaseFolder) {
                        const cleanName = entry.name.startsWith('_') ? entry.name.substring(1) : entry.name;
                        const currentPath = parentPath ? `${parentPath}/${cleanName}` : cleanName;
                        const subScan = await scanCategories(entry, currentPath);
                        categories.push({ path: currentPath, name: cleanName, children: subScan });
                    }
                }
            }
            return categories.sort((a,b) => a.name.localeCompare(b.name, 'zh-Hant'));
        }

        async function populateCategorySelect() {
            const userDataHandle = await handleStore.get('userDataHandle');
            if (!userDataHandle) return;
            const categoryTree = await scanCategories(userDataHandle);
            
            function buildCategoryOptions(nodes, level = 0) {
                nodes.forEach(node => {
                    const option = document.createElement('option');
                    option.value = node.path;
                    option.textContent = `${'—'.repeat(level)} ${node.name}`;
                    categorySelect.appendChild(option);
                    if (node.children && node.children.length > 0) {
                        buildCategoryOptions(node.children, level + 1);
                    }
                });
            }
            categorySelect.innerHTML = '';
            buildCategoryOptions(categoryTree);
            
            const currentCaseCategory = initialData.category;
            if (currentCaseCategory && currentCaseCategory !== '__ROOT__' && [...categorySelect.options].some(opt => opt.value === currentCaseCategory)) {
                categorySelect.value = currentCaseCategory;
            }
        }
        
        await populateCategorySelect();

        const triggerTSTCalculation = () => calculateAndDisplay(initialData);
        ['solar-year', 'solar-month', 'solar-day', 'solar-hour', 'solar-minute', 'longitude', 'timezone', 'use-tst'].forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('input', triggerTSTCalculation);
                el.addEventListener('change', triggerTSTCalculation);
            }
        });
        
        triggerTSTCalculation();

        const removeProfileImgBtn = document.getElementById('remove-profile-image-btn');
        if(removeProfileImgBtn) {
            removeProfileImgBtn.addEventListener('click', () => {
                const profileImgInput = document.getElementById('profile-image-upload');
                const profileImgNameSpan = document.getElementById('profile-image-name');
                if (profileImgInput) profileImgInput.value = '';
                if (profileImgNameSpan) profileImgNameSpan.textContent = '無';
            });
        }
        
        const mediaListContainer = document.getElementById('media-list-container');
        const addMediaBtn = document.getElementById('add-media-btn');
        if (addMediaBtn && mediaListContainer) {
            addMediaBtn.addEventListener('click', () => {
                const newItem = document.createElement('div');
                newItem.className = 'media-list-item';
                newItem.innerHTML = `
                    <input type="file" accept="image/*,video/*" style="flex-grow: 1;">
                    <button type="button" class="remove-media-btn">移除</button>
                `;
                mediaListContainer.appendChild(newItem);
            });
            mediaListContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-media-btn')) {
                    e.target.parentElement.remove();
                }
            });
        }
        
        const toggleEditorBtn = document.getElementById('toggle-editor-btn');

        function initTinyMCE() {
            if (tinymce.get('biography-editor')) {
                 tinymce.get('biography-editor').remove();
            }
            tinymce.init({
                selector: '#biography-editor',
                license_key: 'gpl',
                plugins: 'paste lists link image table code help wordcount',
                
                paste_preprocess: function(plugin, args) {
                    const cleanedContent = args.content.replace(/\sdata-(start|end|is-last-node|is-only-node)="[^"]*"/g, '');
                    args.content = cleanedContent;
                },

                // 【核心修正】增強 paste_postprocess 的邏輯
                paste_postprocess: function(plugin, args) {
                    const listItems = args.node.querySelectorAll('li');
                    listItems.forEach(li => {
                        // 尋找 li 中作為第一個元素的 p
                        const firstChild = li.firstElementChild;
                        if (firstChild && firstChild.tagName === 'P') {
                            // 將 p 的所有內容 (包括 <strong> 等標籤) 移到 p 的前面 (也就是 li 的開頭)
                            while (firstChild.firstChild) {
                                li.insertBefore(firstChild.firstChild, firstChild);
                            }
                            // 移除現在已經變空的 p 標籤
                            li.removeChild(firstChild);
                        }
                    });
                },
                
                valid_elements: 'p,strong,em,br,ul,ol,li,hr',
                toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | table | code',
                menubar: false,
                height: 300,
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            });
        }

        initTinyMCE();

        toggleEditorBtn.addEventListener('click', () => {
            isRichEditor = !isRichEditor;
            if (isRichEditor) {
                initTinyMCE();
                toggleEditorBtn.textContent = '切換為純文字';
            } else {
                if (tinymce.get('biography-editor')) {
                    tinymce.get('biography-editor').remove();
                }
                toggleEditorBtn.textContent = '切換為編輯器';
            }
        });

        saveAllBtn.addEventListener('click', async () => {
            const getHandleFromPath = async (pathString, create = false) => {
                let currentHandle = await handleStore.get('userDataHandle');
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
                                } else { throw e; }
                            }
                        }
                    }
                }
                return currentHandle;
            };

            saveAllBtn.textContent = '儲存中...';
            saveAllBtn.disabled = true;

            try {
                let tstResult = calculateAndDisplay(initialData).tstResult;
                const solarYearInput = document.getElementById('solar-year');
                let solarDataToSave, lunarDataToSave;

                if (solarYearInput && !solarYearInput.disabled) {
                    lunarDataToSave = calculateAndDisplay(initialData).finalLunar;
                    solarDataToSave = { year: parseInt(document.getElementById('solar-year').value, 10), month: parseInt(document.getElementById('solar-month').value, 10), day: parseInt(document.getElementById('solar-day').value, 10), hour: parseInt(document.getElementById('solar-hour').value, 10), minute: parseInt(document.getElementById('solar-minute').value, 10) };
                } else {
                    solarDataToSave = null;
                    lunarDataToSave = { year: parseInt(document.getElementById('lunar-year').value, 10), month: parseInt(document.getElementById('lunar-month').value, 10), day: parseInt(document.getElementById('lunar-day').value, 10), hour_branch: document.getElementById('lunar-hour').value, is_leap: document.getElementById('lunar-leap').checked };
                }

                let updatedData = {
                    ...initialData,
                    name: document.getElementById('name').value,
                    gender: document.querySelector('input[name="gender"]:checked').value,
                    category: categorySelect.value,
                    solar: solarDataToSave,
                    lunar: lunarDataToSave,
                    birthPlace: { city: document.getElementById('place-city').value, longitude: parseFloat(document.getElementById('longitude').value) || null },
                    timezone: parseFloat(document.getElementById('timezone').value) || null,
                    trueSolarTime: { enabled: document.getElementById('use-tst').checked, ...(tstResult || {}) },
                    sourceInfo: { dataSource: document.getElementById('data-source').value, reliability: document.getElementById('reliability').value, notes: document.getElementById('source-notes').value },
                    link: initialData.link || '',
                    content: {
                        biography: isRichEditor 
                            ? tinymce.get('biography-editor').getContent() 
                            : document.getElementById('biography-editor').value,
                        life_events: document.getElementById('life-events-editor').value,
                        relationships: document.getElementById('relationships-editor').value,
                    }
                };
                
                const getBaseNameFromData = (chartData) => {
                    const d = chartData.lunar;
                    const gender = chartData.gender === 'M' ? 'M' : 'F';
                    const year = String(d.year);
                    const month = String(d.month).padStart(2, '0');
                    const day = String(d.day).padStart(2, '0');
                    const hour = d.hour_branch;
                    const name = updatedData.name.replace(/[\\/:*?"<>|]/g, '_');
                    return `${gender}-${year}-${month}-${day}-${hour}-${name}`;
                };

                const newBaseName = getBaseNameFromData(updatedData);
                let newFullName = currentFolderName;
                const isOldFormat = !currentFolderName.includes('_SeafarNexus-');

                if (isOldFormat) {
                    const newId = String(Date.now()).slice(-7);
                    newFullName = `${newBaseName}_SeafarNexus-${newId}`;
                } else {
                    const suffixMatch = currentFolderName.match(/(_SeafarNexus-.+)$/);
                    if (suffixMatch) newFullName = `${newBaseName}${suffixMatch[1]}`;
                }
                
                const newCategoryPath = updatedData.category;
                const oldCategoryPath = initialData.category;
                let finalFolderHandle;
                
                if (newFullName !== currentFolderName || newCategoryPath !== oldCategoryPath) {
                    const oldParentHandle = await getHandleFromPath(oldCategoryPath);
                    const newParentHandle = await getHandleFromPath(newCategoryPath, true);
                    const oldFolderHandle = await oldParentHandle.getDirectoryHandle(currentFolderName);
                    const newFolderHandle = await newParentHandle.getDirectoryHandle(newFullName, { create: true });
                    for await (const entry of oldFolderHandle.values()) {
                        if (entry.kind === 'file') {
                            const file = await entry.getFile();
                            const newFileHandle = await newFolderHandle.getFileHandle(entry.name, { create: true });
                            const writable = await newFileHandle.createWritable();
                            await writable.write(file);
                            await writable.close();
                        } else if (entry.kind === 'directory') {
                            const subDestHandle = await newFolderHandle.getDirectoryHandle(entry.name, { create: true });
                            for await (const subEntry of entry.values()){
                                if (subEntry.kind === 'file'){
                                    const file = await subEntry.getFile();
                                    const newFileHandle = await subDestHandle.getFileHandle(subEntry.name, {create: true});
                                    const writable = await newFileHandle.createWritable();
                                    await writable.write(file);
                                    await writable.close();
                                }
                            }
                        }
                    }
                    await oldParentHandle.removeEntry(currentFolderName, { recursive: true });
                    currentFolderName = newFullName;
                    initialData.category = newCategoryPath;
                    finalFolderHandle = newFolderHandle;
                } else {
                    const parentHandle = await getHandleFromPath(oldCategoryPath);
                    finalFolderHandle = await parentHandle.getDirectoryHandle(currentFolderName);
                }
                
                await handleFileUploads(finalFolderHandle, updatedData);

                const profileHandle = await finalFolderHandle.getFileHandle('birth-data.json', { create: true });
                const writable = await profileHandle.createWritable();
                await writable.write(JSON.stringify(updatedData, null, 2));
                await writable.close();

                if (window.opener) {
                    window.opener.postMessage('caseUpdated', '*');
                }
                
                saveAllBtn.style.display = 'none';
                
                let viewBtn = document.getElementById('view-case-btn');
                if(!viewBtn){
                    viewBtn = document.createElement('button');
                    viewBtn.id = 'view-case-btn';
                    viewBtn.className = 'header-btn';
                    headerButtonsContainer.appendChild(viewBtn);
                }
                viewBtn.textContent = '檢視案例';
                viewBtn.style.display = 'inline-block';
                
                viewBtn.onclick = () => {
                    const newRelativePath = `${updatedData.category === '__ROOT__' ? '' : updatedData.category}/${newFullName}`.replace(/^\//, '');
                    sessionStorage.setItem('currentCaseData', JSON.stringify(updatedData));
                    sessionStorage.setItem('currentCasePath', newRelativePath);
                    window.location.href = 'case-viewer.html';
                };
                
                document.title = `編輯案例 - ${updatedData.name}`;
                caseTitleEl.textContent = updatedData.name;

            } catch (error) {
                console.error("儲存失敗:", error);
                saveAllBtn.textContent = `儲存失敗！`;
                saveAllBtn.style.backgroundColor = '#dc3545';
                saveAllBtn.disabled = false;
                 setTimeout(() => {
                    saveAllBtn.textContent = '儲存所有變更';
                    saveAllBtn.style.backgroundColor = '';
                }, 3000);
            }
        });
    }

    // --- Main Entry Point ---
    try {
        const chartDataString = sessionStorage.getItem('currentCaseData');
        const relativePath = sessionStorage.getItem('currentCasePath');
        
        if (!chartDataString || !relativePath) {
            throw new Error("找不到從主頁面傳遞的命例資料。");
        }
        
        let chartData = JSON.parse(chartDataString);
        const originalFolderName = relativePath.split('/').pop();
        document.title = `編輯案例 - ${chartData.name}`;
        caseTitleEl.textContent = chartData.name;
        
        renderBasicInfoForm(chartData);
        await setupEventListeners(chartData, originalFolderName);
        setupFileInputListeners();
        
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                button.classList.add('active');
                const targetPane = document.getElementById(button.dataset.tab);
                if(targetPane) targetPane.classList.add('active');
            });
        });
    } catch (error) {
        console.error("載入案例詳情失敗:", error);
        caseTitleEl.textContent = `載入失敗: ${error.message}`;
        if(saveAllBtn) saveAllBtn.style.display = 'none';
    }
});