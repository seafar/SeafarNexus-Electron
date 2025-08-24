// js/modal.js (V13.2 - 最終修正版，處理元素不存在的致命錯誤)
document.addEventListener('DOMContentLoaded', () => {
    const converter = new LunarSolarConverter();
    const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    
    const modal = document.getElementById('case-modal');
    const addNewCaseBtn = document.getElementById('add-new-case-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const caseForm = document.getElementById('birth-info-form');
    const solarInputsDiv = document.getElementById('solar-inputs');
    const lunarInputsDiv = document.getElementById('lunar-inputs');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = caseForm ? caseForm.querySelector('.submit-btn') : null;
    const caseIdInput = document.getElementById('case-id');
    const prefixDisplay = document.getElementById('prefix-display');
    const categorySelect = document.getElementById('category-select');
    
    const solarYearInput = document.getElementById('solar-year');
    const solarMonthSelect = document.getElementById('solar-month');
    const solarDaySelect = document.getElementById('solar-day');
    const solarHourSelect = document.getElementById('solar-hour');
    const solarMinuteSelect = document.getElementById('solar-minute');
    const lunarYearInput = document.getElementById('lunar-year');
    const lunarMonthSelect = document.getElementById('lunar-month');
    const lunarDaySelect = document.getElementById('lunar-day');
    const lunarHourSelect = document.getElementById('lunar-hour');
    const isLeapCheckbox = document.getElementById('is-leap');
    let isSyncing = false;

    function setSolarInputsDisabled(disabled) {
        if (!solarYearInput) return;
        solarYearInput.disabled = disabled;
        solarMonthSelect.disabled = disabled;
        solarDaySelect.disabled = disabled;
        solarInputsDiv.style.opacity = disabled ? '0.5' : '1';
    }

    function updateSolarFromLunar() {
        if (isSyncing || !lunarYearInput) return;
        isSyncing = true;
        const lunarData = { year: parseInt(lunarYearInput.value, 10), month: parseInt(lunarMonthSelect.value, 10), day: parseInt(lunarDaySelect.value, 10), is_leap: isLeapCheckbox.checked };
        if (lunarData.year && lunarData.month && lunarData.day && lunarData.year >= 1888) {
            const l = new Lunar();
            l.lunarYear = lunarData.year; l.lunarMonth = lunarData.month; l.lunarDay = lunarData.day; l.isleap = lunarData.is_leap;
            const s_res = converter.LunarToSolar(l);
            if (s_res.solarYear > 0) {
                solarYearInput.value = s_res.solarYear;
                solarMonthSelect.value = s_res.solarMonth;
                solarDaySelect.value = s_res.solarDay;
                setSolarInputsDisabled(false);
            }
        } else if (lunarData.year < 1888) {
             setSolarInputsDisabled(true);
             if(solarYearInput) solarYearInput.value = '';
             if(solarMonthSelect) solarMonthSelect.value = '';
             if(solarDaySelect) solarDaySelect.value = '';
        }
        isSyncing = false;
    }
    
    function updateLunarFromSolar() {
        if (isSyncing || !solarYearInput) return;
        isSyncing = true;
        const solarData = { year: parseInt(solarYearInput.value, 10), month: parseInt(solarMonthSelect.value, 10), day: parseInt(solarDaySelect.value, 10) };
        if (solarData.year && solarData.month && solarData.day) {
            const s = new Solar();
            s.solarYear = solarData.year; s.solarMonth = solarData.month; s.solarDay = solarData.day;
            const l_res = converter.SolarToLunar(s);
            if(lunarYearInput) lunarYearInput.value = l_res.lunarYear;
            if(lunarMonthSelect) lunarMonthSelect.value = l_res.lunarMonth;
            if(lunarDaySelect) lunarDaySelect.value = l_res.lunarDay;
            if(isLeapCheckbox) isLeapCheckbox.checked = l_res.isleap;
        }
        isSyncing = false;
    }

    function populateSelect(element, start, end) { if (!element) return; element.innerHTML = ''; for (let i = start; i <= end; i++) { const o = document.createElement('option'); o.value = i; o.text = String(i).padStart(2, '0'); element.appendChild(o); } }
    function populateSelectWithArray(element, array) { if (!element) return; element.innerHTML = ''; array.forEach(item => { const o = document.createElement('option'); o.value = item; o.text = item; element.appendChild(o); }); }
    function populateYearSelect(element, start, end) { if (!element) return; element.innerHTML = ''; for (let i = end; i >= start; i--) { const o = document.createElement('option'); o.value = i; o.text = i; element.appendChild(o); } }
    function hideModal() { if (modal) modal.classList.add('hidden'); }

    window.addEventListener('openAddCaseModal', (e) => {
        if (!caseForm) return;
        const { categoryTree, currentCategory } = e.detail;
        caseForm.reset();
        
        if (prefixDisplay) {
            prefixDisplay.textContent = 'SeafarNexus';
        }

        if (categorySelect) {
            categorySelect.innerHTML = '';
            const submitBtn = caseForm.querySelector('.submit-btn');

            if (!categoryTree || categoryTree.length === 0) {
                const option = document.createElement('option');
                option.textContent = '（請先在主畫面新增分類）';
                option.disabled = true;
                categorySelect.appendChild(option);
                if (submitBtn) submitBtn.disabled = true;
            } else {
                if (submitBtn) submitBtn.disabled = false;

                const buildCategoryOptions = (node, level = 0, parentPath = '') => {
                    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
                    const option = document.createElement('option');
                    option.value = currentPath;
                    option.textContent = `${'—'.repeat(level)} ${node.name}`;
                    categorySelect.appendChild(option);
                    if (node.children && node.children.length > 0) {
                        node.children.forEach(child => buildCategoryOptions(child, level + 1, currentPath));
                    }
                }
                
                categoryTree.forEach(node => buildCategoryOptions(node));
                
                if (currentCategory && currentCategory !== '所有命例' && [...categorySelect.options].some(opt => opt.value === currentCategory)) {
                    categorySelect.value = currentCategory;
                }
            }
        }

        modalTitle.textContent = '新增命例';
        submitBtn.textContent = '儲存命例';
        caseIdInput.value = '';
        
        document.querySelector('input[name="inputType"][value="solar"]').checked = true;
        solarInputsDiv.classList.remove('hidden');
        lunarInputsDiv.classList.add('hidden');
        solarInputsDiv.querySelectorAll('input, select').forEach(el => el.disabled = false);
        lunarInputsDiv.querySelectorAll('input, select').forEach(el => el.disabled = true);
        
        const now = new Date();
        solarYearInput.value = now.getFullYear();
        solarMonthSelect.value = now.getMonth() + 1;
        solarDaySelect.value = now.getDate();
        solarHourSelect.value = now.getHours();
        solarMinuteSelect.value = now.getMinutes();
        updateLunarFromSolar();
        setSolarInputsDisabled(false);
        modal.classList.remove('hidden');
    });

    if (addNewCaseBtn) {
        addNewCaseBtn.addEventListener('click', () => {
             window.dispatchEvent(new CustomEvent('requestOpenAddCaseModal'));
        });
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }
    
    if (caseForm) {
        document.querySelectorAll('input[name="inputType"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const isSolar = this.value === 'solar';
                solarInputsDiv.classList.toggle('hidden', !isSolar);
                lunarInputsDiv.classList.toggle('hidden', isSolar);
                solarInputsDiv.querySelectorAll('input, select').forEach(el => el.disabled = !isSolar);
                lunarInputsDiv.querySelectorAll('input, select').forEach(el => el.disabled = isSolar);
                if (isSolar) {
                    updateLunarFromSolar();
                } else {
                    updateSolarFromLunar();
                }
            });
        });

        caseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputType = document.querySelector('input[name="inputType"]:checked').value;
            let finalSolarData = null;
            let finalLunarData = null;
            const hourMap = {"子":23, "丑":1, "寅":3, "卯":5, "辰":7, "巳":9, "午":11, "未":13, "申":15, "酉":17, "戌":19, "亥":21};

            if (inputType === 'solar') {
                const year = parseInt(solarYearInput.value, 10);
                const month = parseInt(solarMonthSelect.value, 10);
                const day = parseInt(solarDaySelect.value, 10);
                const hour = parseInt(solarHourSelect.value, 10);
                const minute = parseInt(solarMinuteSelect.value, 10);
                finalSolarData = { year, month, day, hour, minute };
                const s = new Solar(); s.solarYear = year; s.solarMonth = month; s.solarDay = day;
                const l_res = converter.SolarToLunar(s);
                finalLunarData = {
                    year: l_res.lunarYear, month: l_res.lunarMonth, day: l_res.lunarDay,
                    hour_branch: earthlyBranches[Math.floor(((hour + 1) % 24) / 2)],
                    is_leap: l_res.isleap
                };
            } else {
                const year = parseInt(lunarYearInput.value, 10);
                if (!year || year > 2100) { alert('請輸入有效的陰曆年份（2100年及以前）。'); return; }
                const month = parseInt(lunarMonthSelect.value, 10);
                const day = parseInt(lunarDaySelect.value, 10);
                const hour_branch = lunarHourSelect.value;
                const is_leap = isLeapCheckbox.checked;
                finalLunarData = { year, month, day, hour_branch, is_leap };
                if (year < 1888) {
                    finalSolarData = null;
                } else {
                    const l = new Lunar(); l.lunarYear = year; l.lunarMonth = month; l.lunarDay = day; l.isleap = is_leap;
                    const s_res = converter.LunarToSolar(l);
                    if(s_res.solarYear > 0) {
                        finalSolarData = { 
                            year: s_res.solarYear, month: s_res.solarMonth, day: s_res.solarDay, 
                            hour: hourMap[hour_branch] ?? 0, minute: 0 
                        };
                    }
                }
            }
            
            const payload = {
                name: document.getElementById('name').value,
                gender: document.querySelector('input[name="gender"]:checked').value,
                category: categorySelect.value,
                solar: finalSolarData,
                lunar: finalLunarData
            };
            
            window.dispatchEvent(new CustomEvent('saveCase', { detail: payload }));
            hideModal();
        });

        populateYearSelect(solarYearInput, 1888, 2100);
        populateSelect(solarMonthSelect, 1, 12); 
        populateSelect(solarDaySelect, 1, 31); 
        populateSelect(solarHourSelect, 0, 23);
        populateSelect(solarMinuteSelect, 0, 59);
        populateSelect(lunarMonthSelect, 1, 12); 
        populateSelect(lunarDaySelect, 1, 30); 
        populateSelectWithArray(lunarHourSelect, earthlyBranches);

        [solarYearInput, solarMonthSelect, solarDaySelect].forEach(el => { el?.addEventListener('change', updateLunarFromSolar); });
        [lunarYearInput, lunarMonthSelect, lunarDaySelect, isLeapCheckbox].forEach(el => { el?.addEventListener('change', updateSolarFromLunar); });
    }
});