// ziweistar.js (修正 Star_S04 結構的最終版)

var YinYangKeys = ["yin_yang_yang", "yin_yang_yin"];
var HeavenlyStems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
var EarthlyBranches=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
var ShengXiaoKeys=["animal_rat", "animal_ox", "animal_tiger", "animal_rabbit", "animal_dragon", "animal_snake", "animal_horse", "animal_goat", "animal_monkey", "animal_rooster", "animal_dog", "animal_pig"];

var PalaceKeys = ["palace_life", "palace_parents", "palace_fortune", "palace_property", "palace_career", "palace_friends", "palace_travel", "palace_health", "palace_wealth", "palace_children", "palace_spouse", "palace_siblings", "palace_body"];
var FiveElementKeys = ["bureau_water_2", "bureau_fire_6", "bureau_earth_5", "bureau_wood_3", "bureau_gold_4"];
var DaShian=[2,6,5,3,4];

var StarM_A14_Keys = ["star_ziwei", "star_tianji", "star_taiyang", "star_wuqu", "star_tiantong", "star_lianzhen", "star_tianfu", "star_taiyin", "star_tanlang", "star_jumen", "star_tianxiang", "star_tianliang", "star_qisha", "star_pojun"];
var StarM_A07_Keys = ["star_wenchang", "star_wenqu", "star_zuofu", "star_youbi", "star_tiankui", "star_tianyue", "star_lucun"];
var StarM_S04_Keys = ["sihua_lu", "sihua_quan", "sihua_ke", "sihua_ji"];
var StarM_B06_Keys = ["star_qingyang", "star_tuoluo", "star_huoxing", "star_lingxing", "star_dikong", "star_dijie"];
var StarO_S05_Keys = ["star_tianma", "star_longchi", "star_fengge", "star_hongluan", "star_tianxi"];
var StarM_Misc_Keys = ["star_taifu", "star_fenggao", "star_tianxing", "star_tianyao", "star_jieshen", "star_tianwu", "star_tianyue_misc", "star_yinsha", "star_jiekong", "star_tianguan", "star_tianfu_misc", "star_tiankong", "star_tianku", "star_tianxu", "star_guchen", "star_guasu", "star_feilian", "star_posui", "star_huagai", "star_tiancai", "star_tianshou", "star_santai", "star_bazuo", "star_enguang", "star_tiangui", "star_tianchu", "star_suijian", "star_huiqi", "star_sangmen", "star_guansuo", "star_guanfu", "star_xiaohao", "star_dahao", "star_longde", "star_baihu", "star_tiande", "star_diaoke", "star_bingfu", "star_jiangxing", "star_panan", "star_suiyi", "star_xishen", "star_nianhuagai", "star_jiesha", "star_zaisha", "star_tiansha", "star_zhibei", "star_xianchi", "star_yuesha", "star_wangshen"];

// 【關鍵修正】恢復 4x10 的正確結構，並使用星曜 Key
var Star_S04 = [
    // 化祿星列表 (10天干)
    [StarM_A14_Keys[5], StarM_A14_Keys[1], StarM_A14_Keys[4], StarM_A14_Keys[7], StarM_A14_Keys[8], StarM_A14_Keys[3], StarM_A14_Keys[2], StarM_A14_Keys[9], StarM_A14_Keys[11], StarM_A14_Keys[13]],
    // 化權星列表 (10天干)
    [StarM_A14_Keys[13], StarM_A14_Keys[11], StarM_A14_Keys[1], StarM_A14_Keys[4], StarM_A14_Keys[7], StarM_A14_Keys[8], StarM_A14_Keys[3], StarM_A14_Keys[2], StarM_A14_Keys[0], StarM_A14_Keys[9]],
    // 化科星列表 (10天干)
    [StarM_A14_Keys[3], StarM_A14_Keys[0], StarM_A07_Keys[0], StarM_A14_Keys[1], StarM_A07_Keys[3], StarM_A14_Keys[11], StarM_A14_Keys[7], StarM_A07_Keys[1], StarM_A07_Keys[2], StarM_A14_Keys[7]],
    // 化忌星列表 (10天干)
    [StarM_A14_Keys[2], StarM_A14_Keys[7], StarM_A14_Keys[5], StarM_A14_Keys[9], StarM_A14_Keys[1], StarM_A07_Keys[1], StarM_A14_Keys[4], StarM_A07_Keys[0], StarM_A14_Keys[3], StarM_A14_Keys[8]]
];

const StarBrightness = {
    "star_ziwei": ["level_miao","level_miao","level_wang","level_wang","level_di","level_wang","level_miao","level_miao","level_wang","level_wang","level_di","level_wang"],
    "star_tianji": ["level_miao","level_xian","level_di","level_wang","level_li","level_ping","level_miao","level_xian","level_di","level_wang","level_li","level_ping"],
    "star_taiyang": ["level_xian","level_shi","level_wang","level_miao","level_wang","level_miao","level_wang","level_wang","level_di","level_xian","level_shi","level_xian"],
    "star_wuqu": ["level_wang","level_miao","level_li","level_li","level_miao","level_ping","level_wang","level_miao","level_li","level_li","level_miao","level_ping"],
    "star_tiantong": ["level_wang","level_shi","level_li","level_miao","level_ping","level_miao","level_xian","level_shi","level_wang","level_ping","level_wang","level_miao"],
    "star_lianzhen": ["level_ping","level_li","level_miao","level_li","level_miao","level_xian","level_xian","level_miao","level_miao","level_ping","level_li","level_xian"],
    "star_tianfu": ["level_wang","level_miao","level_miao","level_di","level_miao","level_di","level_wang","level_miao","level_miao","level_di","level_miao","level_di"],
    "star_taiyin": ["level_miao","level_xian","level_di","level_li","level_shi","level_xian","level_xian","level_shi","level_li","level_wang","level_wang","level_miao"],
    "star_tanlang": ["level_wang","level_miao","level_ping","level_li","level_miao","level_xian","level_wang","level_miao","level_ping","level_li","level_miao","level_xian"],
    "star_jumen": ["level_wang","level_shi","level_miao","level_miao","level_wang","level_wang","level_wang","level_shi","level_miao","level_miao","level_wang","level_wang"],
    "star_tianxiang": ["level_miao","level_di","level_miao","level_xian","level_li","level_di","level_miao","level_di","level_miao","level_xian","level_li","level_di"],
    "star_tianliang": ["level_miao","level_miao","level_miao","level_wang","level_miao","level_xian","level_wang","level_miao","level_xian","level_wang","level_miao","level_xian"],
    "star_qisha": ["level_wang","level_miao","level_miao","level_wang","level_miao","level_ping","level_wang","level_miao","level_miao","level_wang","level_miao","level_ping"],
    "star_pojun": ["level_miao","level_wang","level_di","level_xian","level_wang","level_ping","level_miao","level_wang","level_di","level_xian","level_wang","level_ping"],
    "star_wenchang": ["level_di","level_miao","level_xian","level_li","level_di","level_miao","level_xian","level_li","level_wang","level_miao","level_xian","level_li"],
    "star_wenqu": ["level_di","level_miao","level_xian","level_li","level_di","level_miao","level_xian","level_li","level_wang","level_miao","level_xian","level_li"],
    "star_lucun": ["level_miao",null,"level_miao","level_miao",null,"level_miao","level_miao",null,"level_miao","level_miao",null,"level_miao"],
    "star_qingyang": ["level_xian","level_miao","level_xian","level_xian","level_miao","level_xian","level_xian","level_miao","level_xian","level_xian","level_miao","level_xian"],
    "star_tuoluo": [null,"level_miao","level_xian",null,"level_miao","level_xian",null,"level_miao","level_xian",null,"level_miao","level_xian"],
    "star_huoxing": ["level_xian","level_di","level_miao","level_li","level_xian","level_di","level_miao","level_li","level_xian","level_di","level_miao","level_li"],
    "star_lingxing": ["level_xian","level_di","level_miao","level_li","level_xian","level_di","level_miao","level_li","level_xian","level_di","level_miao","level_li"]
};


var FiveEleTable=[[1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,0,0,1,1,2,2,3,3,4],[9,6,11,4,1,2,10,7,0,5,2,3,11,8,1,6,3,4,0,9,2,7,4,5,1,10,3,8,5,6],[6,11,4,1,2,7,0,5,2,3,8,1,6,3,4,9,2,7,4,5,10,3,8,5,6,11,4,9,6,7],[4,1,2,5,2,3,6,3,4,7,4,5,8,5,6,9,6,7,10,7,8,11,8,9,0,9,10,1,10,11],[11,4,1,2,0,5,2,3,1,6,3,4,2,7,4,5,3,8,5,6,4,9,6,7,5,10,7,8,6,11]];
var FiveEleArr=[[0,1,3,2,4,1],[1,2,4,3,0,2],[2,3,0,4,1,3],[3,4,1,0,2,4],[4,0,2,1,3,0]];
var Star_A14=[[[0],[],[13],[],[5,6],[7],[8],[4,9],[3,10],[2,11],[12],[1]],[[1],[0,13],[],[6],[7],[5,8],[9],[10],[4,11],[3,12],[2],[]],[[13],[1],[0,6],[7],[8],[9],[5,10],[11],[12],[10],[3],[2]],[[2],[6],[1,7],[0,8],[9],[10],[11],[5,12],[],[],[4],[3,13]],[[3,6],[2,7],[8],[1,9],[0,10],[11],[12],[],[5],[],[13],[4]],[[4,7],[3,8],[2,9],[10],[1,10],[0,12],[],[],[],[5,13],[],[6]],[[8],[4,9],[3,10],[2,11],[12],[1],[0],[],[13],[],[5,6],[7]],[[9],[10],[4,11],[3,12],[2],[],[1],[0,13],[],[6],[7],[5,8]],[[5,10],[11],[12],[10],[3],[2],[13],[1],[0,6],[7],[8],[9]],[[11],[5,12],[],[],[4],[3,13],[2],[6],[1,7],[0,8],[9],[10]],[[12],[],[5],[],[13],[4],[3,6],[2,7],[8],[1,9],[0,10],[11]],[[],[],[],[5,13],[],[6],[4,7],[3,8],[2,9],[10],[1,10],[0,12]]];
var Star_Z06=[[0,1,2,3,4,5,6,7,8,9,10,11],[11,0,1,2,3,4,5,6,7,8,9,10],[9,10,11,0,1,2,3,4,5,6,7,8],[8,9,10,11,0,1,2,3,4,5,6,7],[7,8,9,10,11,0,1,2,3,4,5,6],[4,5,6,7,8,9,10,11,0,1,2,3],[4,3,2,1,0,11,10,9,8,7,6,5]];
var Star_T08=[[0,1,2,3,4,5,6,7,8,9,10,11],[1,2,3,4,5,6,7,8,9,10,11,0],[2,3,4,5,6,7,8,9,10,11,0,1],[3,4,5,6,7,8,9,10,11,0,1,2],[4,5,6,7,8,9,10,11,0,1,2,3],[5,6,7,8,9,10,11,0,1,2,3,4],[6,7,8,9,10,11,0,1,2,3,4,5],[10,11,0,1,2,3,4,5,6,7,8,9]];
var Star_G07=[[10,9,8,7,6,5,4,3,2,1,0,11],[4,5,6,7,8,9,10,11,0,1,2,3],[4,5,6,7,8,9,10,11,0,1,2,3],[10,9,8,7,6,5,4,3,2,1,0,11],[1,0,11,11,1,0,1,6,3,3],[7,8,9,9,7,8,7,2,5,5],[2,3,5,6,5,6,8,9,11,0]];
var Star_B06=[[3,4,6,7,6,7,9,10,0,1],[1,2,4,5,4,5,7,8,10,11],[[2,3,4,5,6,7,8,9,10,11,0,1],[3,4,5,6,7,8,9,10,11,0,1,2],[1,2,3,4,5,6,7,8,9,10,11,0],[9,10,11,0,1,2,3,4,5,6,7,8]],[[10,11,0,1,2,3,4,5,6,7,8,9],[10,11,0,1,2,3,4,5,6,7,8,9],[3,4,5,6,7,8,9,10,11,0,1,2],[10,11,0,1,2,3,4,5,6,7,8,9]],[11,10,9,8,7,6,5,4,3,2,1,0],[11,0,1,2,3,4,5,6,7,8,9,10]];
var Star_OS5=[[2,11,8,5,2,11,8,5,2,11,8,5],[4,5,6,7,8,9,10,11,0,1,2,3],[10,9,8,7,6,5,4,3,2,1,0,11],[3,2,1,0,11,10,9,8,7,6,5,4],[9,8,7,6,5,4,3,2,1,0,11,10]];