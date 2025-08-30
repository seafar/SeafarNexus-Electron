// i18n.js (已補全簡體中文內容並修正語法的最終版)

const i18n = {
    // =================================================================
    // 繁體中文 (Traditional Chinese)
    // =================================================================
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
        "ui_app_title_version": "紫微斗數 動態演象分析 Seafar.org",
        "ui_solar_prefix": "陽曆：",
        "ui_lunar_prefix": "農曆：",
        "ui_year_char": "年",
        "ui_month_char": "月",
        "ui_day_char": "日",
        "ui_hour_char": "時",
        "ui_leap_char": "閏",
        "ui_dashian_char": "大限",
        "ui_age_char": "歲",
        "ui_palace_char": "宮",
        "ui_life_char": "命",

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

        // --- 星曜 ---
        "star_ziwei": "紫微", "star_tianji": "天機", "star_taiyang": "太陽", "star_wuqu": "武曲", "star_tiantong": "天同", "star_lianzhen": "廉貞",
        "star_tianfu": "天府", "star_taiyin": "太陰", "star_tanlang": "貪狼", "star_jumen": "巨門", "star_tianxiang": "天相", "star_tianliang": "天梁",
        "star_qisha": "七殺", "star_pojun": "破軍", "star_wenchang": "文昌", "star_wenqu": "文曲", "star_zuofu": "左輔", "star_youbi": "右弼",
        "star_tiankui": "天魁", "star_tianyue": "天鉞", "star_lucun": "祿存", "star_qingyang": "擎羊", "star_tuoluo": "陀羅", "star_huoxing": "火星",
        "star_lingxing": "鈴星", "star_dikong": "地空", "star_dijie": "地劫", "star_tianma": "天馬", "star_longchi": "龍池", "star_fengge": "鳳閣",
        "star_hongluan": "紅鸞", "star_tianxi": "天喜",

        // --- 雜曜 ---
        "star_taifu": "台輔", "star_fenggao": "封誥", "star_tianxing": "天刑", "star_tianyao": "天姚", "star_jieshen": "解神", "star_tianwu": "天巫",
        "star_tianyue_misc": "天月", "star_yinsha": "陰煞", "star_jiekong": "截空", "star_tianguan": "天官", "star_tianfu_misc": "天福",
        "star_tiankong": "天空", "star_tianku": "天哭", "star_tianxu": "天虛", "star_guchen": "孤辰", "star_guasu": "寡宿", "star_feilian": "蜚廉",
        "star_posui": "破碎", "star_huagai": "華蓋", "star_tiancai": "天才", "star_tianshou": "天壽", "star_santai": "三台", "star_bazuo": "八座",
        "star_enguang": "恩光", "star_tiangui": "天貴", "star_tianchu": "天廚", "star_suijian": "歲建", "star_huiqi": "晦氣", "star_sangmen": "喪門",
        "star_guansuo": "貫索", "star_guanfu": "官符", "star_xiaohao": "小耗", "star_dahao": "大耗", "star_longde": "龍德", "star_baihu": "白虎",
        "star_tiande": "天德", "star_diaoke": "弔客", "star_bingfu": "病符", "star_jiangxing": "將星", "star_panan": "攀鞍", "star_suiyi": "歲驛",
        "star_xishen": "息神", "star_nianhuagai": "年華蓋", "star_jiesha": "劫煞", "star_zaisha": "災煞", "star_tiansha": "天煞", "star_zhibei": "指背",
        "star_xianchi": "咸池", "star_yuesha": "月煞", "star_wangshen": "亡神",

        // --- 流運星曜 ---
        "flow_star_lucun": "流祿", "flow_star_qingyang": "流羊", "flow_star_tuoluo": "流陀",
        "flow_month_lucun": "月祿", "flow_month_qingyang": "月羊", "flow_month_tuoluo": "月陀",
        "flow_day_lucun": "日祿", "flow_day_qingyang": "日羊", "flow_day_tuoluo": "日陀",

        // --- 農曆月日 ---
        "lunar_month_1":"正月", "lunar_month_2":"二月", "lunar_month_3":"三月", "lunar_month_4":"四月", "lunar_month_5":"五月", "lunar_month_6":"六月", "lunar_month_7":"七月", "lunar_month_8":"八月", "lunar_month_9":"九月", "lunar_month_10":"十月", "lunar_month_11":"十一月", "lunar_month_12":"臘月",
        "lunar_day_1":"初一", "lunar_day_2":"初二", "lunar_day_3":"初三", "lunar_day_4":"初四", "lunar_day_5":"初五", "lunar_day_6":"初六", "lunar_day_7":"初七", "lunar_day_8":"初八", "lunar_day_9":"初九", "lunar_day_10":"初十", "lunar_day_11":"十一", "lunar_day_12":"十二", "lunar_day_13":"十三", "lunar_day_14":"十四", "lunar_day_15":"十五", "lunar_day_16":"十六", "lunar_day_17":"十七", "lunar_day_18":"十八", "lunar_day_19":"十九", "lunar_day_20":"二十", "lunar_day_21":"廿一", "lunar_day_22":"廿二", "lunar_day_23":"廿三", "lunar_day_24":"廿四", "lunar_day_25":"廿五", "lunar_day_26":"廿六", "lunar_day_27":"廿七", "lunar_day_28":"廿八", "lunar_day_29":"廿九", "lunar_day_30":"三十",

        // --- chart.html 控制項 UI ---
        "ui_toggle_flow_analysis": "流運分析",
        "ui_flow_analysis": "流運分析", // 供 js 內部使用
        "ui_toggle_dashian_only": "大限分析",
        "ui_no_month": "月份",
        "ui_no_day": "日期",
        "ui_select_dashian": "請選擇大限",
        "ui_dashian_option_format": "大限 {range} ({palace})",

        "ui_flow_month": "流月",
        "ui_flow_day": "流日",
        "ui_flow_age_label": "虛",
        "ui_dashian_char_short": "限",
        "ui_tab_jilu": "忌祿",
        "ui_tab_lu": "化祿",
        "ui_tab_quan": "化權",
        "ui_tab_ke": "化科",
        "ui_tab_ji": "化忌",
        "ui_legend_jilu": "忌祿連線",
        "ui_show_all": "顯示所有",
        "ui_clear_jilu": "清除忌祿",
        "ui_legend_lu": "化祿傳導",
        "ui_clear_lu": "清除化祿",
        "ui_cycle_lu": "化祿回圈",
        "ui_legend_quan": "化權傳導",
        "ui_clear_quan": "清除化權",
        "ui_cycle_quan": "化權回圈",
        "ui_legend_ke": "化科傳導",
        "ui_clear_ke": "清除化科",
        "ui_cycle_ke": "化科回圈",
        "ui_legend_ji": "化忌傳導",
        "ui_clear_ji": "清除化忌",
        "ui_cycle_ji": "化忌回圈",
        "ui_clear_arrows": "清除所有箭頭",
        "ui_new_chart": "關閉命盤",
        "ui_download_chart": "下載命盤",
        "ui_month_gan_prefix": "月干：",
        "ui_month_palace_prefix": "月命宮：",
        "ui_month_char_short": "月",
        "ui_day_char_short": "日",
        "ui_flow_day_palace_prefix": "日命宮：",
        "ui_flow_year_not_active_alert": "請先啟用流年/大限。",
        "ui_flow_month_not_active_alert": "請先啟用流月。",
        "ui_flow_run_text_prefix": "流運：",
        "ui_flow_run_month_suffix": "",
        "ui_solar_year_input_label": "輸入公元年份",
        "ui_lunar_month_select_label": "選擇農曆月份",
        "ui_lunar_day_select_label": "選擇農曆日期",
        "ui_year_info_format": "農曆 {lunarYear} ({ganzhi})",
        "ui_age_info_format": "虛歲 {age}",
        "ui_month_palace_info": "月命宮在 {palace}",
        "ui_day_palace_info": "日命宮在 {palace}",
        "ui_day_warning_2049": "超過2049年，流日資料不準確",
        "ui_day_invalid": "無此日",
        "ui_solar_date_label": "選擇陽曆日期 (快速設定)",
        "ui_mode_year_only": "僅排流年",
        "ui_mode_full_date": "完整日期排盤",
        "ui_solar_flow_tab": "輸入陽曆流運",
        "ui_lunar_flow_tab": "輸入陰曆流運",
        "ui_gregorian_year": "西元年",
        "ui_leap_month_short": "閏月",
        "ui_solar_tab_hint": "需提供完整陽曆年月日才能換算出對應陰曆",
        "ui_category": "分類",
        "ui_minute": "分 (0-59)",
        "ui_save_case": "儲存命例",
        "ui_add_new_case": "新增命例",
        "ui_edit_case": "編輯命例",
        "ui_case_name": "命例名稱",
        "ui_gender": "性別",
        "ui_solar_birthday": "陽曆生日",
        "ui_lunar_birthday": "陰曆生日",
        "ui_actions": "操作",
        "ui_category_placeholder": "例如：家人, 客戶",
        "ui_no_saved_charts":  "尚無已儲存命盘",
        "ui_select_flow_year": "請選擇流年",
    },

    // =================================================================
    // 簡體中文 (Simplified Chinese)
    // =================================================================
    'zh-CN': {
        // --- UI 介面文字 ---
        "ui_title": "紫微斗数 - 生辰输入",
        "ui_input_title": "生辰资料输入",
        "ui_name_label": "名称 (姓名或主题)",
        "ui_example_chart": "范例命盘",
        "ui_solar": "阳历",
        "ui_lunar": "阴历",
        "ui_year": "年",
        "ui_month": "月",
        "ui_day": "日",
        "ui_hour": "时",
        "ui_hour_branch": "时辰",
        "ui_leap_month": "闰月",
        "ui_male": "男",
        "ui_female": "女",
        "ui_generate_chart": "产生命盘",
        "ui_chart_title": "紫微斗数命盘",
        "ui_chart_filename": "命盘",
        "ui_app_title_version": "紫微斗数动态演象分析 Seafar.org",
        "ui_solar_prefix": "阳历：",
        "ui_lunar_prefix": "农历：",
        "ui_year_char": "年",
        "ui_month_char": "月",
        "ui_day_char": "日",
        "ui_hour_char": "时",
        "ui_leap_char": "闰",
        "ui_dashian_char": "大限",
        "ui_age_char": "岁",
        "ui_palace_char": "宫",
        "ui_life_char": "命",

        // --- 宮位 ---
        "palace_life": "命宫", "palace_parents": "父母宫", "palace_fortune": "福德宫", "palace_property": "田宅宫",
        "palace_career": "官禄宫", "palace_friends": "仆役宫", "palace_travel": "迁移宫", "palace_health": "疾厄宫",
        "palace_wealth": "财帛宫", "palace_children": "子女宫", "palace_spouse": "夫妻宫", "palace_siblings": "兄弟宫",
        "palace_body": "身宫",

        // --- 五行局 & 生肖 & 陰陽 ---
        "bureau_water_2": "水二局", "bureau_fire_6": "火六局", "bureau_earth_5": "土五局", "bureau_wood_3": "木三局", "bureau_gold_4": "金四局",
        "animal_rat": "鼠", "animal_ox": "牛", "animal_tiger": "虎", "animal_rabbit": "兔", "animal_dragon": "龙", "animal_snake": "蛇",
        "animal_horse": "马", "animal_goat": "羊", "animal_monkey": "猴", "animal_rooster": "鸡", "animal_dog": "狗", "animal_pig": "猪",
        "yin_yang_yang": "阳", "yin_yang_yin": "阴",

        // --- 星曜亮度 ---
        "level_miao": "庙", "level_wang": "旺", "level_di": "地", "level_li": "利", "level_ping": "平", "level_xian": "陷", "level_shi": "失",

        // --- 四化 ---
        "sihua_lu": "禄", "sihua_quan": "权", "sihua_ke": "科", "sihua_ji": "忌",

        // --- 星曜 ---
        "star_ziwei": "紫微", "star_tianji": "天机", "star_taiyang": "太阳", "star_wuqu": "武曲", "star_tiantong": "天同", "star_lianzhen": "廉贞",
        "star_tianfu": "天府", "star_taiyin": "太阴", "star_tanlang": "贪狼", "star_jumen": "巨门", "star_tianxiang": "天相", "star_tianliang": "天梁",
        "star_qisha": "七杀", "star_pojun": "破军", "star_wenchang": "文昌", "star_wenqu": "文曲", "star_zuofu": "左辅", "star_youbi": "右弼",
        "star_tiankui": "天魁", "star_tianyue": "天钺", "star_lucun": "禄存", "star_qingyang": "擎羊", "star_tuoluo": "陀罗", "star_huoxing": "火星",
        "star_lingxing": "铃星", "star_dikong": "地空", "star_dijie": "地劫", "star_tianma": "天马", "star_longchi": "龙池", "star_fengge": "凤阁",
        "star_hongluan": "红鸾", "star_tianxi": "天喜",
        
        // --- 雜曜 ---
        "star_taifu": "台辅", "star_fenggao": "封诰", "star_tianxing": "天刑", "star_tianyao": "天姚", "star_jieshen": "解神", "star_tianwu": "天巫",
        "star_tianyue_misc": "天月", "star_yinsha": "阴煞", "star_jiekong": "截空", "star_tianguan": "天官", "star_tianfu_misc": "天福",
        "star_tiankong": "天空", "star_tianku": "天哭", "star_tianxu": "天虚", "star_guchen": "孤辰", "star_guasu": "寡宿", "star_feilian": "蜚廉",
        "star_posui": "破碎", "star_huagai": "华盖", "star_tiancai": "天才", "star_tianshou": "天寿", "star_santai": "三台", "star_bazuo": "八座",
        "star_enguang": "恩光", "star_tiangui": "天贵", "star_tianchu": "天厨", "star_suijian": "岁建", "star_huiqi": "晦气", "star_sangmen": "丧门",
        "star_guansuo": "贯索", "star_guanfu": "官符", "star_xiaohao": "小耗", "star_dahao": "大耗", "star_longde": "龙德", "star_baihu": "白虎",
        "star_tiande": "天德", "star_diaoke": "吊客", "star_bingfu": "病符", "star_jiangxing": "将星", "star_panan": "攀鞍", "star_suiyi": "岁驿",
        "star_xishen": "息神", "star_nianhuagai": "年华盖", "star_jiesha": "劫煞", "star_zaisha": "灾煞", "star_tiansha": "天煞", "star_zhibei": "指背",
        "star_xianchi": "咸池", "star_yuesha": "月煞", "star_wangshen": "亡神",

        // --- 流運星曜 ---
        "flow_star_lucun": "流禄", "flow_star_qingyang": "流羊", "flow_star_tuoluo": "流陀",
        "flow_month_lucun": "月禄", "flow_month_qingyang": "月羊", "flow_month_tuoluo": "月陀",
        "flow_day_lucun": "日禄", "flow_day_qingyang": "日羊", "flow_day_tuoluo": "日陀",

        // --- 農曆月日 ---
        "lunar_month_1":"正月", "lunar_month_2":"二月", "lunar_month_3":"三月", "lunar_month_4":"四月", "lunar_month_5":"五月", "lunar_month_6":"六月", "lunar_month_7":"七月", "lunar_month_8":"八月", "lunar_month_9":"九月", "lunar_month_10":"十月", "lunar_month_11":"十一月", "lunar_month_12":"腊月",
        "lunar_day_1":"初一", "lunar_day_2":"初二", "lunar_day_3":"初三", "lunar_day_4":"初四", "lunar_day_5":"初五", "lunar_day_6":"初六", "lunar_day_7":"初七", "lunar_day_8":"初八", "lunar_day_9":"初九", "lunar_day_10":"初十", "lunar_day_11":"十一", "lunar_day_12":"十二", "lunar_day_13":"十三", "lunar_day_14":"十四", "lunar_day_15":"十五", "lunar_day_16":"十六", "lunar_day_17":"十七", "lunar_day_18":"十八", "lunar_day_19":"十九", "lunar_day_20":"二十", "lunar_day_21":"廿一", "lunar_day_22":"廿二", "lunar_day_23":"廿三", "lunar_day_24":"廿四", "lunar_day_25":"廿五", "lunar_day_26":"廿六", "lunar_day_27":"廿七", "lunar_day_28":"廿八", "lunar_day_29":"廿九", "lunar_day_30":"三十",

        // --- chart.html 控制項 UI ---
        "ui_toggle_flow_analysis": "流运分析",
        "ui_flow_analysis": "流运分析",
        "ui_toggle_dashian_only": "大限分析",
        "ui_no_month": "月份",
        "ui_no_day": "日期",
        "ui_select_dashian": "请选择大限",
        "ui_dashian_option_format": "大限 {range} ({palace})",
        "ui_flow_month": "流月",
        "ui_flow_day": "流日",
        "ui_flow_age_label": "虚",
        "ui_dashian_char_short": "限",
        "ui_tab_jilu": "忌禄",
        "ui_tab_lu": "化禄",
        "ui_tab_quan": "化权",
        "ui_tab_ke": "化科",
        "ui_tab_ji": "化忌",
        "ui_legend_jilu": "忌禄连线",
        "ui_show_all": "显示所有",
        "ui_clear_jilu": "清除忌禄",
        "ui_legend_lu": "化禄传导",
        "ui_clear_lu": "清除化禄",
        "ui_cycle_lu": "化禄回圈",
        "ui_legend_quan": "化权传导",
        "ui_clear_quan": "清除化权",
        "ui_cycle_quan": "化权回圈",
        "ui_legend_ke": "化科传导",
        "ui_clear_ke": "清除化科",
        "ui_cycle_ke": "化科回圈",
        "ui_legend_ji": "化忌传导",
        "ui_clear_ji": "清除化忌",
        "ui_cycle_ji": "化忌回圈",
        "ui_clear_arrows": "清除所有箭头",
        "ui_new_chart": "关闭命盘",
        "ui_download_chart": "下载命盘",
        "ui_month_gan_prefix": "月干：",
        "ui_month_palace_prefix": "月命宫：",
        "ui_month_char_short": "月",
        "ui_day_char_short": "日",
        "ui_flow_day_palace_prefix": "日命宫：",
        "ui_flow_year_not_active_alert": "请先启用流年/大限。",
        "ui_flow_month_not_active_alert": "请先启用流月。",
        "ui_flow_run_text_prefix": "流运：",
        "ui_flow_run_month_suffix": "",
        "ui_solar_year_input_label": "输入公元年份",
        "ui_lunar_month_select_label": "选择农历月份",
        "ui_lunar_day_select_label": "选择农历日期",
        "ui_year_info_format": "农历 {lunarYear} ({ganzhi})",
        "ui_age_info_format": "虚岁 {age}",
        "ui_month_palace_info": "月命宫在 {palace}",
        "ui_day_palace_info": "日命宫在 {palace}",
        "ui_day_warning_2049": "超过2049年，流日数据不准确",
        "ui_day_invalid": "无此日",
        "ui_solar_date_label": "选择阳历日期 (快速设定)",
        "ui_mode_year_only": "仅排流年",
        "ui_mode_full_date": "完整日期排盘",
        "ui_solar_flow_tab": "输入阳历流运",
        "ui_lunar_flow_tab": "输入阴历流运",
        "ui_gregorian_year": "西元年",
        "ui_leap_month_short": "闰月",
        "ui_solar_tab_hint": "需提供完整阳历年月日才能换算出对应阴历",
        "ui_category": "分类",
        "ui_minute": "分 (0-59)",
        "ui_save_case": "保存命例",
        "ui_add_new_case": "新增命例",
        "ui_edit_case": "编辑命例",
        "ui_case_name": "命例名称",
        "ui_gender": "性别",
        "ui_solar_birthday": "阳历生日",
        "ui_lunar_birthday": "阴历生日",
        "ui_actions": "操作",
        "ui_category_placeholder": "例如：家人, 客户",
        "ui_no_saved_charts":  "尚无已储存命盘",
        "ui_select_flow_year": "请选择流年",
    }
};

// 語言切換幫助函式
let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = i18n[lang] ? lang : 'zh-TW';
}

function getString(key) {
    return i18n[currentLang][key] || key;
}