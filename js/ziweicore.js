// ziweicore.js (修復1887年排盤問題的最終版本)

var ziwei = {
	y:null,m:null,d:null,h:null,g:null,lPos:null,bPos:null,f:null,yS:null,mS:null,dS:null,y1Pos:null,y2Pos:null,hPos:null,Place12:null,
	computeZiWei:function(y_Solar,m_Solar,d_Solar,h_Solar,g_Solar, l_Month, l_Day){
		this.yS=y_Solar; this.mS=m_Solar; this.dS=d_Solar;

		this.y=HeavenlyStems[(this.yS-4)%10]+EarthlyBranches[(this.yS-4)%12];
		
		this.m = l_Month; 
		this.d = l_Day; 
		
		this.h=h_Solar; this.g=g_Solar;
		this.y1Pos=HeavenlyStems.indexOf(this.y.substring(0,1));
		this.y2Pos=EarthlyBranches.indexOf(this.y.substring(1,2));
		this.hPos=EarthlyBranches.indexOf(this.h);
		this.setZiwei();
		this.stepSetStar();
        this.setMiscStars();
		return this.Place12;
	},
	getLunarDay:function(){
        const yearStr = GanGB[gan.y] + ZhiGB[zhi.y];
        return {
            yearString: yearStr,
            isLeap: lunar.l,
            monthKey: `lunar_month_${lunar.m}`,
            dayKey: `lunar_day_${lunar.d}`,
            hourChar: this.h
        };
    },
	getSolarDay:function(){return this.yS+"年"+this.mS+"月"+this.dS+"日"+this.h+"時";},
	getShengXiaoKey:function(){return ShengXiaoKeys[(this.yS-4)%12];},
	getFiveElementKey:function(){return this.f;},
    getYinYangKey:function(){return YinYangKeys[this.y1Pos%2];},
    getGenderKey:function(){return (this.g=="M" ? "ui_male" : "ui_female");},

	getStarArr:function(STAR,size,pos){var arr=new Array();for(var i=0;i<size;i++){arr[i]=STAR[i][pos];}return arr;},
	getStarArrByPosArr:function(STAR,size,PosArr){var arr=new Array();for(var i=0;i<size;i++){arr[i]=STAR[i][PosArr[i]];}return arr;},
	
    getS04Str:function(starKey,sihuaList){
        let sihuaKey = "";
        sihuaList.forEach((sKey, i) => {
            if (sKey === starKey) {
                sihuaKey = StarM_S04_Keys[i];
            }
        });
        return sihuaKey ? `(${sihuaKey})` : "";
    },
	setZiwei:function(){
		const l=EarthlyBranches[((12-this.hPos)+1+this.m*1.0)%12];
        const b=EarthlyBranches[(12-((22-this.hPos)+1-this.m*1.0)%12)%12];
		this.lPos=EarthlyBranches.indexOf(l);
        this.bPos=EarthlyBranches.indexOf(b);
		this.f=FiveElementKeys[FiveEleArr[this.y1Pos%5][((this.lPos-(this.lPos%2==0?0:1))/2)%6]];
        const z=EarthlyBranches[FiveEleTable[FiveElementKeys.indexOf(this.f)][this.d-1]];
        this.zPos=EarthlyBranches.indexOf(z);
	},
	stepSetStar:function(){
		const sZ06=this.getStarArr(Star_Z06,7,this.zPos),sT08=this.getStarArr(Star_T08,8,sZ06[6]);
		const sG07=this.getStarArrByPosArr(Star_G07,7,[this.hPos,this.hPos,this.m-1,this.m-1,this.y1Pos,this.y1Pos,this.y1Pos]);
		const sS04=this.getStarArr(Star_S04,4,this.y1Pos);
		const sB06=[Star_B06[0][this.y1Pos],Star_B06[1][this.y1Pos],Star_B06[2][this.y2Pos%4][this.hPos],Star_B06[3][this.y2Pos%4][this.hPos],Star_B06[4][this.hPos],Star_B06[5][this.hPos]];
		const OS05=this.getStarArr(Star_OS5,5,this.y2Pos);
		this.Place12=new Array(12);

		for(var i=0;i<12;i++){
            const palaceStem = HeavenlyStems[((this.y1Pos % 5) * 2 + (i < 2 ? i + 2 : i) % 10) % 10];
			var StarA=[],StarB=[],StarC=[],Star6=[];
			for(var k=0;k<6;k++){if(sZ06[k]==i)StarA.push(StarM_A14_Keys[k]+this.getS04Str(StarM_A14_Keys[k],sS04));if(sB06[k]==i)StarB.push(StarM_B06_Keys[k]);}
			for(var k=0;k<8;k++){if(sT08[k]==i)StarA.push(StarM_A14_Keys[k+6]+this.getS04Str(StarM_A14_Keys[k+6],sS04));}
			for(var k=0;k<7;k++){if(sG07[k]==i)Star6.push(StarM_A07_Keys[k]+this.getS04Str(StarM_A07_Keys[k],sS04));}
			for(var k=0;k<5;k++){if(OS05[k]==i)StarC.push(StarO_S05_Keys[k]);}
			const pIndex=(i-this.lPos+12)%12;
			
			this.Place12[i]={"MangA":palaceStem + " " + EarthlyBranches[i],"MangB":PalaceKeys[pIndex],"MangC":(this.bPos==i?PalaceKeys[12]:""),"Stars":[].concat(StarA,Star6,StarB,StarC)};
		}
	},
    setMiscStars: function() {
        let miscStarsByPalace = Array(12).fill(0).map(() => []);
        const B = EarthlyBranches.indexOf.bind(EarthlyBranches);
        miscStarsByPalace[(B('午') + this.hPos) % 12].push(StarM_Misc_Keys[0]);
        miscStarsByPalace[(B('寅') + this.hPos) % 12].push(StarM_Misc_Keys[1]);
        miscStarsByPalace[(B('酉') + this.m - 1) % 12].push(StarM_Misc_Keys[2]);
        miscStarsByPalace[(B('丑') + this.m - 1) % 12].push(StarM_Misc_Keys[3]);
        const jieShenMap = [B('申'),B('申'),B('戌'),B('戌'),B('子'),B('子'),B('寅'),B('寅'),B('辰'),B('辰'),B('午'),B('午')];
        miscStarsByPalace[jieShenMap[this.m-1]].push(StarM_Misc_Keys[4]);
        const tianWuMap = [B('巳'),B('申'),B('寅'),B('亥'),B('巳'),B('申'),B('寅'),B('亥'),B('巳'),B('申'),B('寅'),B('亥')];
        miscStarsByPalace[tianWuMap[this.m-1]].push(StarM_Misc_Keys[5]);
        const tianYueMap = [B('戌'),B('巳'),B('辰'),B('寅'),B('未'),B('卯'),B('亥'),B('未'),B('寅'),B('午'),B('戌'),B('寅')];
        miscStarsByPalace[tianYueMap[this.m-1]].push(StarM_Misc_Keys[6]);
        const yinShaMap = [B('寅'),B('子'),B('戌'),B('申'),B('午'),B('辰'),B('寅'),B('子'),B('戌'),B('申'),B('午'),B('辰')];
        miscStarsByPalace[yinShaMap[this.m-1]].push(StarM_Misc_Keys[7]);
        const jieKongMap = [[B('申'), B('酉')], [B('午'), B('未')], [B('辰'), B('巳')], [B('寅'), B('卯')], [B('子'), B('丑')]];
        const jieKongPos = jieKongMap[this.y1Pos % 5];
        miscStarsByPalace[jieKongPos[0]].push(StarM_Misc_Keys[8]);
        miscStarsByPalace[jieKongPos[1]].push(StarM_Misc_Keys[8]);
        const tianGuanMap = [B('未'),B('辰'),B('巳'),B('寅'),B('卯'),B('酉'),B('亥'),B('酉'),B('戌'),B('午')];
        const tianFuMap = [B('酉'),B('申'),B('子'),B('亥'),B('卯'),B('寅'),B('午'),B('巳'),B('午'),B('巳')];
        miscStarsByPalace[tianGuanMap[this.y1Pos]].push(StarM_Misc_Keys[9]);
        miscStarsByPalace[tianFuMap[this.y1Pos]].push(StarM_Misc_Keys[10]);
        miscStarsByPalace[(B('丑') + this.y2Pos) % 12].push(StarM_Misc_Keys[11]);
        miscStarsByPalace[(B('午') - this.y2Pos + 12) % 12].push(StarM_Misc_Keys[12]);
        miscStarsByPalace[(B('午') + this.y2Pos) % 12].push(StarM_Misc_Keys[13]);
        const guChenMap = [B('寅'),B('巳'),B('巳'),B('巳'),B('申'),B('申'),B('申'),B('亥'),B('亥'),B('亥'),B('寅'),B('寅')];
        const guaSuMap  = [B('戌'),B('丑'),B('丑'),B('丑'),B('辰'),B('辰'),B('辰'),B('未'),B('未'),B('未'),B('戌'),B('戌')];
        miscStarsByPalace[guChenMap[this.y2Pos]].push(StarM_Misc_Keys[14]);
        miscStarsByPalace[guaSuMap[this.y2Pos]].push(StarM_Misc_Keys[15]);
        const feiLianMap = [B('申'),B('酉'),B('戌'),B('巳'),B('午'),B('未'),B('寅'),B('卯'),B('辰'),B('亥'),B('子'),B('丑')];
        miscStarsByPalace[feiLianMap[this.y2Pos]].push(StarM_Misc_Keys[16]);
        const poSuiGroup = [[0, 3, 6, 9].includes(this.y2Pos) ? 0 : [2, 5, 8, 11].includes(this.y2Pos) ? 1 : 2];
        miscStarsByPalace[[B('巳'), B('酉'), B('丑')][poSuiGroup]].push(StarM_Misc_Keys[17]);
        const huaGaiMap = [B('辰'),B('丑'),B('戌'),B('未'),B('辰'),B('丑'),B('戌'),B('未'),B('辰'),B('丑'),B('戌'),B('未')];
        miscStarsByPalace[huaGaiMap[this.y2Pos]].push(StarM_Misc_Keys[18]);
        miscStarsByPalace[(this.lPos + this.y2Pos) % 12].push(StarM_Misc_Keys[19]);
        miscStarsByPalace[(this.bPos + this.y2Pos) % 12].push(StarM_Misc_Keys[20]);
        let changPos = -1, quPos = -1, zuoPos = -1, youPos = -1;
        this.Place12.forEach((p, i) => {
            if(p && p.Stars && p.Stars.some(s => s.startsWith(StarM_A07_Keys[0]))) changPos = i;
            if(p && p.Stars && p.Stars.some(s => s.startsWith(StarM_A07_Keys[1]))) quPos = i;
            if(p && p.Stars && p.Stars.some(s => s.startsWith(StarM_A07_Keys[2]))) zuoPos = i;
            if(p && p.Stars && p.Stars.some(s => s.startsWith(StarM_A07_Keys[3]))) youPos = i;
        });
        if(zuoPos !== -1) miscStarsByPalace[(zuoPos + this.d - 1) % 12].push(StarM_Misc_Keys[21]);
        if(youPos !== -1) miscStarsByPalace[(youPos - (this.d - 1) + 36) % 12].push(StarM_Misc_Keys[22]);
        if(changPos !== -1) miscStarsByPalace[(changPos + this.d - 2 + 24) % 12].push(StarM_Misc_Keys[23]);
        if(quPos !== -1) miscStarsByPalace[(quPos + this.d - 2 + 24) % 12].push(StarM_Misc_Keys[24]);
        const tcPos = [B('巳'),B('午'),B('子'),B('巳'),B('午'),B('申'),B('寅'),B('午'),B('酉'),B('亥')][this.y1Pos];
        miscStarsByPalace[tcPos].push(StarM_Misc_Keys[25]);
        const suiQianStars = StarM_Misc_Keys.slice(26, 38);
        for(let i=0; i<12; i++) {
            miscStarsByPalace[(this.y2Pos + i) % 12].push(suiQianStars[i]);
        }
        const jiangQianStars = StarM_Misc_Keys.slice(38);
        let jiangXingPos = -1;
        if ([B('寅'), B('午'), B('戌')].includes(this.y2Pos)) jiangXingPos = B('午');
        if ([B('申'), B('子'), B('辰')].includes(this.y2Pos)) jiangXingPos = B('子');
        if ([B('巳'), B('酉'), B('丑')].includes(this.y2Pos)) jiangXingPos = B('酉');
        if ([B('亥'), B('卯'), B('未')].includes(this.y2Pos)) jiangXingPos = B('卯');
        if(jiangXingPos !== -1) {
            for(let i=0; i<12; i++) {
                miscStarsByPalace[(jiangXingPos + i) % 12].push(jiangQianStars[i]);
            }
        }
        
        // --- ▼▼▼ 新增的保護層 ▼▼▼ ---
        for (let i = 0; i < 12; i++) {
            // 在加入雜曜前，先確保目標宮位及其星曜陣列已成功初始化
            if (!this.Place12[i] || !Array.isArray(this.Place12[i].Stars)) {
                console.error(`[ZiWeiCore DEBUG] Palace ${i} or its Stars array was not initialized correctly. Skipping misc stars for this palace to prevent a crash.`);
                continue; // 跳過這個宮位，防止程式崩潰
            }
            this.Place12[i].Stars.push(...miscStarsByPalace[i]);
        }
        // --- ▲▲▲ 保護層結束 ▲▲▲ ---
    },
	getDaShian:function(){
		const DYear=DaShian[FiveElementKeys.indexOf(this.f)];
        let DDir=this.y1Pos%2;
        DDir += (this.g === 'M' ? 1 : 0);
		const DShian=new Array(12);
		for(var i=0;i<12;i++){
            var DSY=DDir%2!=0?DYear+i*10:(DYear-i*10+120)%120;
            if(DSY===0)DSY=120;
            var pIndex=(i+this.lPos)%12;
            DShian[pIndex]=DSY.toString()+"-"+(DSY+9).toString();
        }
		return DShian;
	},
    getLunarMonthStem: function(flowYearGanIndex, lunarMonthNumber) {
        let startStemIndexForYinMonth;
        const ganRemainder = flowYearGanIndex % 5;
        switch (ganRemainder) {
            case 0: startStemIndexForYinMonth = 2; break;
            case 1: startStemIndexForYinMonth = 4; break;
            case 2: startStemIndexForYinMonth = 6; break;
            case 3: startStemIndexForYinMonth = 8; break;
            case 4: startStemIndexForYinMonth = 0; break;
            default: startStemIndexForYinMonth = 0;
        }
        const monthGanIndex = (startStemIndexForYinMonth + (lunarMonthNumber - 1)) % 10;
        return HeavenlyStems[monthGanIndex];
    }
};