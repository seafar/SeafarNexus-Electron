// i18n_circle.js (完整且無省略的最終版本)

// =================================================================
// SECTION 1: 星曜簡稱對照表
// =================================================================

// 繁體中文簡稱
const starShortName_tc = { 
    'star_ziwei': '紫', 'star_tianji': '機', 'star_taiyang': '陽', 'star_wuqu': '武', 'star_tiantong': '同', 
    'star_lianzhen': '廉', 'star_tianfu': '府', 'star_taiyin': '陰', 'star_tanlang': '狼', 'star_jumen': '巨', 
    'star_tianxiang': '相', 'star_tianliang': '梁', 'star_qisha': '殺', 'star_pojun': '破', 'star_wenchang': '昌', 
    'star_wenqu': '曲', 'star_zuofu': '輔', 'star_youbi': '弼', 'star_tiankui': '魁', 'star_tianyue': '鉞', 
    'star_lucun': '祿', 'star_qingyang': '羊', 'star_tuoluo': '陀', 'star_huoxing': '火', 'star_lingxing': '鈴', 
    'star_dikong': '空', 'star_dijie': '劫' 
};

// 簡體中文簡稱
const starShortName_sc = { 
    'star_ziwei': '紫', 'star_tianji': '机', 'star_taiyang': '阳', 'star_wuqu': '武', 'star_tiantong': '同', 
    'star_lianzhen': '廉', 'star_tianfu': '府', 'star_taiyin': '阴', 'star_tanlang': '狼', 'star_jumen': '巨', 
    'star_tianxiang': '相', 'star_tianliang': '梁', 'star_qisha': '杀', 'star_pojun': '破', 'star_wenchang': '昌', 
    'star_wenqu': '曲', 'star_zuofu': '辅', 'star_youbi': '弼', 'star_tiankui': '魁', 'star_tianyue': '钺', 
    'star_lucun': '禄', 'star_qingyang': '羊', 'star_tuoluo': '陀', 'star_huoxing': '火', 'star_lingxing': '铃', 
    'star_dikong': '空', 'star_dijie': '劫' 
};

// 預設使用的簡稱表 (會由 setLanguage 函式動態切換)
let starShortName = starShortName_tc;

// =================================================================
// SECTION 2: 國際化(i18n)文字內容主體
// =================================================================

const i18n = {
    // --- 繁體中文 (Traditional Chinese) ---
    'zh-TW': {
        // --- UI 介面文字 ---
        "ui_title": "紫微斗數 - 生辰輸入",
        "ui_input_title": "生辰資料輸入",
        "ui_name_label": "名稱 (姓名或主題)",
        "ui_example_chart": "範例命盤",
        "ui_solar": "陽曆",
        "ui_lunar": "陰曆",
        "ui_year": "年",
        "ui_month": "月",
        "ui_day": "日",
        "ui_hour": "時",
        "ui_hour_branch": "時辰",
        "ui_leap_month": "閏月",
        "ui_male": "男",
        "ui_female": "女",
        "ui_generate_chart": "產生命盤",
        "ui_chart_title": "紫微斗數命盤",
        "ui_chart_filename": "命盤",
        "ui_app_title_version": "紫微斗數風水專用圓形盤 Seafar.org",
        "ui_solar_prefix": "陽曆：",
        "ui_lunar_prefix": "農曆：",
        "ui_year_char": "年",
        "ui_month_char": "月",
        "ui_day_char": "日",
        "ui_hour_char": "時",
        "ui_leap_char": "閏",
        "ui_palace_char": "宮",

        // --- 宮位 ---
        "palace_life": "命宮", "palace_parents": "父母宮", "palace_fortune": "福德宮", "palace_property": "田宅宮",
        "palace_career": "官祿宮", "palace_friends": "僕役宮", "palace_travel": "遷移宮", "palace_health": "疾厄宮",
        "palace_wealth": "財帛宮", "palace_children": "子女宮", "palace_spouse": "夫妻宮", "palace_siblings": "兄弟宮",
        "palace_body": "身宮",

        // --- 五行局 & 生肖 & 陰陽 ---
        "bureau_water_2": "水二局", "bureau_fire_6": "火六局", "bureau_earth_5": "土五局", "bureau_wood_3": "木三局", "bureau_gold_4": "金四局",
        "animal_rat": "鼠", "animal_ox": "牛", "animal_tiger": "虎", "animal_rabbit": "兔", "animal_dragon": "龍", "animal_snake": "蛇",
        "animal_horse": "馬", "animal_goat": "羊", "animal_monkey": "猴", "animal_rooster": "雞", "animal_dog": "狗", "animal_pig": "豬",
        "yin_yang_yang": "陽", "yin_yang_yin": "陰",

        // --- 星曜亮度 ---
        "level_miao": "廟", "level_wang": "旺", "level_di": "地", "level_li": "利", "level_ping": "平", "level_xian": "陷", "level_shi": "失",

        // --- 四化 ---
        "sihua_lu": "祿", "sihua_quan": "權", "sihua_ke": "科", "sihua_ji": "忌",
        
        // --- chart_circle.html 控制項 UI ---
        "ui_tab_jilu": "忌祿", "ui_tab_lu": "化祿", "ui_tab_quan": "化權", "ui_tab_ke": "化科", "ui_tab_ji": "化忌",
        "ui_show_all": "全選", "ui_clear_jilu": "清除", "ui_clear_lu": "清除", "ui_cycle_lu": "回圈",
        "ui_clear_quan": "清除", "ui_cycle_quan": "回圈", "ui_clear_ke": "清除", "ui_cycle_ke": "回圈",
        "ui_clear_ji": "清除", "ui_cycle_ji": "回圈", "ui_clear_arrows": "清除所有箭頭",
        "ui_new_chart": "關閉命盤", "ui_download_chart": "下載命盤",
        "ui_transparent_bg": "透明背景 (儲存用)", "ui_da_shian_analysis": "大限",
        "ui_flow_year_analysis": "流年", "ui_select_da_shian": "選擇大限",
        "ui_select_flow_year": "輸入流年(西元)", "ui_flow_info_hint": "{dashian} {flowyear} 虛{age}歲",
        "flow_star_lucun": "流祿", "flow_star_qingyang": "流羊", "flow_star_tuoluo": "流陀",
        "ui_appearance_settings": "外觀設定", "ui_bg_color": "命盤底色",
        "ui_palace_text_color": "宮位文字", "ui_crosshair_color": "中心十字",
        "ui_arrow_thickness": "箭頭粗細", "ui_download_size": "匯出尺寸",
        "ui_save_chart": "儲存目前命盤",

        // --- 農曆月日 ---
        "lunar_month_1":"正月", "lunar_month_2":"二月", "lunar_month_3":"三月", "lunar_month_4":"四月", "lunar_month_5":"五月", "lunar_month_6":"六月", "lunar_month_7":"七月", "lunar_month_8":"八月", "lunar_month_9":"九月", "lunar_month_10":"十月", "lunar_month_11":"十一月", "lunar_month_12":"臘月",
        "lunar_day_1":"初一", "lunar_day_2":"初二", "lunar_day_3":"初三", "lunar_day_4":"初四", "lunar_day_5":"初五", "lunar_day_6":"初六", "lunar_day_7":"初七", "lunar_day_8":"初八", "lunar_day_9":"初九", "lunar_day_10":"初十", "lunar_day_11":"十一", "lunar_day_12":"十二", "lunar_day_13":"十三", "lunar_day_14":"十四", "lunar_day_15":"十五", "lunar_day_16":"十六", "lunar_day_17":"十七", "lunar_day_18":"十八", "lunar_day_19":"十九", "lunar_day_20":"二十", "lunar_day_21":"廿一", "lunar_day_22":"廿二", "lunar_day_23":"廿三", "lunar_day_24":"廿四", "lunar_day_25":"廿五", "lunar_day_26":"廿六", "lunar_day_27":"廿七", "lunar_day_28":"廿八", "lunar_day_29":"廿九", "lunar_day_30":"三十"
    },
    // --- 簡體中文 (Simplified Chinese) ---
    'zh-CN': {
        // --- UI 介面文字 ---
        "ui_title": "紫微斗数 - 生辰输入", "ui_input_title": "生辰资料输入", "ui_name_label": "名称 (姓名或主题)",
        "ui_example_chart": "范例命盘", "ui_solar": "阳历", "ui_lunar": "阴历", "ui_year": "年", "ui_month": "月",
        "ui_day": "日", "ui_hour": "时", "ui_hour_branch": "时辰", "ui_leap_month": "闰月", "ui_male": "男", "ui_female": "女",
        "ui_generate_chart": "产生命盘", "ui_chart_title": "紫微斗数命盘", "ui_chart_filename": "命盘",
        "ui_app_title_version": "紫微斗数风水专用圆形盘 Seafar.org",
        "ui_solar_prefix": "阳历：", "ui_lunar_prefix": "农历：", "ui_year_char": "年", "ui_month_char": "月",
        "ui_day_char": "日", "ui_hour_char": "时", "ui_leap_char": "闰", "ui_palace_char": "宫",
        
        // --- 宮位 ---
        "palace_life": "命宫", "palace_parents": "父母宫", "palace_fortune": "福德宫", "palace_property": "田宅宫",
        "palace_career": "官禄宫", "palace_friends": "仆役宫", "palace_travel": "迁移宫", "palace_health": "疾厄宫",
        "palace_wealth": "财帛宫", "palace_children": "子女宫", "palace_spouse": "夫妻宫", "palace_siblings": "兄弟宫",
        "palace_body": "身宫", 

        // --- 五行局 & 生肖 & 陰陽 ---
        "bureau_water_2": "水二局", "bureau_fire_6": "火六局", "bureau_earth_5": "土五局", "bureau_wood_3": "木三局",
        "bureau_gold_4": "金四局", "animal_rat": "鼠", "animal_ox": "牛", "animal_tiger": "虎",
        "animal_rabbit": "兔", "animal_dragon": "龙", "animal_snake": "蛇", "animal_horse": "马", "animal_goat": "羊",
        "animal_monkey": "猴", "animal_rooster": "鸡", "animal_dog": "狗", "animal_pig": "猪", "yin_yang_yang": "阳",
        "yin_yang_yin": "阴", 
        
        // --- 星曜亮度 ---
        "level_miao": "庙", "level_wang": "旺", "level_di": "地", "level_li": "利",
        "level_ping": "平", "level_xian": "陷", "level_shi": "失", 
        
        // --- 四化 ---
        "sihua_lu": "禄", "sihua_quan": "权", "sihua_ke": "科", "sihua_ji": "忌",
        
        // --- chart_circle.html 控制項 UI ---
        "ui_tab_jilu": "忌禄", "ui_tab_lu": "化禄", "ui_tab_quan": "化权", "ui_tab_ke": "化科", "ui_tab_ji": "化忌",
        "ui_show_all": "全选", "ui_clear_jilu": "清除", "ui_clear_lu": "清除", "ui_cycle_lu": "回圈",
        "ui_clear_quan": "清除", "ui_cycle_quan": "回圈", "ui_clear_ke": "清除", "ui_cycle_ke": "回圈",
        "ui_clear_ji": "清除", "ui_cycle_ji": "回圈", "ui_clear_arrows": "清除所有箭头",
        "ui_new_chart": "关闭命盘", "ui_download_chart": "下载命盘",
        "ui_transparent_bg": "透明背景 (保存用)", "ui_da_shian_analysis": "大限",
        "ui_flow_year_analysis": "流年", "ui_select_da_shian": "选择大限",
        "ui_select_flow_year": "输入流年(公元)", "ui_flow_info_hint": "{dashian} {flowyear} 虚{age}岁",
        "flow_star_lucun": "流禄", "flow_star_qingyang": "流羊", "flow_star_tuoluo": "流陀",
        "ui_appearance_settings": "外观设定", "ui_bg_color": "命盘底色",
        "ui_palace_text_color": "宫位文字", "ui_crosshair_color": "中心十字",
        "ui_arrow_thickness": "箭头粗细", "ui_download_size": "汇出尺寸",
        "ui_save_chart": "保存当前命盘",
        
        // --- 農曆月日 ---
        "lunar_month_1":"正月", "lunar_month_2":"二月", "lunar_month_3":"三月", "lunar_month_4":"四月", "lunar_month_5":"五月", "lunar_month_6":"六月", "lunar_month_7":"七月", "lunar_month_8":"八月", "lunar_month_9":"九月", "lunar_month_10":"十月", "lunar_month_11":"十一月", "lunar_month_12":"腊月",
        "lunar_day_1":"初一", "lunar_day_2":"初二", "lunar_day_3":"初三", "lunar_day_4":"初四", "lunar_day_5":"初五", "lunar_day_6":"初六", "lunar_day_7":"初七", "lunar_day_8":"初八", "lunar_day_9":"初九", "lunar_day_10":"初十", "lunar_day_11":"十一", "lunar_day_12":"十二", "lunar_day_13":"十三", "lunar_day_14":"十四", "lunar_day_15":"十五", "lunar_day_16":"十六", "lunar_day_17":"十七", "lunar_day_18":"十八", "lunar_day_19":"十九", "lunar_day_20":"二十", "lunar_day_21":"廿一", "lunar_day_22":"廿二", "lunar_day_23":"廿三", "lunar_day_24":"廿四", "lunar_day_25":"廿五", "lunar_day_26":"廿六", "lunar_day_27":"廿七", "lunar_day_28":"廿八", "lunar_day_29":"廿九", "lunar_day_30":"三十"
    }
};

// =================================================================
// SECTION 3: 語言切換與文字獲取函式
// =================================================================

let currentLang = 'zh-TW';

function setLanguage(lang) { 
    currentLang = i18n[lang] ? lang : 'zh-TW'; 
    starShortName = (currentLang === 'zh-CN') ? starShortName_sc : starShortName_tc;
}

function getString(key) {
    const langPack = i18n[currentLang] || i18n['zh-TW'];
    const fallbackPack = i18n['zh-TW'];
    return langPack[key] || fallbackPack[key] || key;
}