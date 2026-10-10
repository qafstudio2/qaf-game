export const LEVELS=[
 {name:'午夜唱片行',defense:400,bpm:160,fee:1600,subtitle:'火焰、玻璃碎裂、店面爆破',unlock:'六顆起始效果器自由選'},
 {name:'重音音樂倉庫',defense:850,bpm:184,fee:4200,subtitle:'大爆破、地震、吉他手蹲低站穩',unlock:'新增 DISTORTION / MUFF / MID BOOST'},
 {name:'末日搖滾大樓',defense:1500,bpm:212,fee:7200,subtitle:'全街崩塌、器材爆炸、吉他手飛走',unlock:'新增三顆終極升級＋三顆混亂特效'}
];
export const CATALOG=[
 {id:'drive',name:'DRIVE',model:'IRON / OD-01',color:'#ca844c',cost:0,tier:0,energy:220,family:'drive',label:'GAIN',description:'過載重擊。和 FUZZ 一起全開，剛好 400 能量。'},
 {id:'fuzz',name:'FUZZ',model:'WOOL / F-02',color:'#cb6960',cost:0,tier:0,energy:180,family:'fuzz',label:'FUZZ',description:'毛茸茸的削波失真。越開越髒，火焰更密。'},
 {id:'comp',name:'COMP',model:'SUSTAIN / C-04',color:'#b5a675',cost:0,tier:0,energy:100,family:'boost',label:'SUSTAIN',description:'壓縮延音。與破音組合會增加連鎖能量。'},
 {id:'echo',name:'ECHO',model:'TAPE / D-03',color:'#9db6a7',cost:0,tier:0,energy:140,family:'echo',label:'REPEAT',description:'回聲追擊。搭配 FUZZ 會增加連鎖爆破。'},
 {id:'space',name:'SPACE',model:'ROOM / R-07',color:'#ad9ebb',cost:0,tier:0,energy:130,family:'space',label:'ROOM',description:'空間音浪。搭配 ECHO 擴大火勢。'},
 {id:'eq',name:'DEPTH',model:'SHAPE / E-05',color:'#7c9da9',cost:0,tier:0,energy:120,family:'eq',label:'DEPTH',description:'調整音牆厚度，增加地基震動。'},
 {id:'distortion',name:'DISTORTION',model:'BLADE / DS-02',color:'#d88a38',cost:600,tier:1,energy:480,family:'drive',label:'DIST',description:'DRIVE 的第二階，失真更緊、更破。'},
 {id:'muff',name:'MUFF',model:'MUD / F-03',color:'#a1ac84',cost:700,tier:1,energy:420,family:'fuzz',label:'DIRT',description:'FUZZ 的第二階，濃厚音牆與更髒的尾音。'},
 {id:'midboost',name:'MID BOOST',model:'PUNCH / B-02',color:'#80a9af',cost:450,tier:1,energy:380,family:'boost',label:'BOOST',description:'COMP 的第二階，推起中頻與輸出。'},
 {id:'metalarea',name:'METAL AREA',model:'MELT / DS-03',color:'#555c6b',cost:1500,tier:2,energy:1050,family:'drive',label:'METAL',description:'終極破音，緊實低音與劇烈的削波音牆。'},
 {id:'dirtyrat',name:'DIRTY RAT',model:'FILTH / F-04',color:'#797a69',cost:1600,tier:2,energy:900,family:'fuzz',label:'FILTH',description:'終極髒音。和 METAL AREA、BOMBOOST 組合有額外能量。'},
 {id:'bomboost',name:'BOMBOOST',model:'BLAST / B-03',color:'#d35347',cost:1300,tier:2,energy:850,family:'boost',label:'BLAST',description:'終極強化，壓縮、推升與爆破連鎖。'},
 {id:'octave',name:'OCTAVE',model:'THUNDER / O-01',color:'#8c78b4',cost:850,tier:2,energy:560,family:'octave',label:'OCTAVE',description:'追加低八度真實吉他採樣，音浪向地面擴散。'},
 {id:'wah',name:'FIRE WAH',model:'SWEEP / W-01',color:'#76ab93',cost:650,tier:2,energy:430,family:'wah',label:'SWEEP',description:'自動 Wah 掃頻，Solo 更有咬勁，火勢向上竄。'},
 {id:'feedback',name:'FEEDBACK',model:'CHAOS / FB-01',color:'#c783a9',cost:900,tier:2,energy:610,family:'feedback',label:'CHAOS',description:'受控回授與長尾追擊，拆除現場更混亂。'}
];
export function calculate(pedals,stage){const active=pedals.filter(p=>p?.on&&p.amount>0),map=new Map(CATALOG.map(p=>[p.id,p]));const base=Math.round(active.reduce((s,p)=>s+map.get(p.id).energy*p.amount/100,0));let bonus=0;const family=id=>active.some(p=>map.get(p.id).family===id);if(family('drive')&&family('boost'))bonus+=60;if(family('fuzz')&&family('echo'))bonus+=45;if(family('space')&&family('echo'))bonus+=30;if(['metalarea','dirtyrat','bomboost'].every(id=>active.some(p=>p.id===id)))bonus+=200;const energy=base+bonus,defense=LEVELS[stage].defense,ratio=energy/defense;return {base,bonus,energy,defense,ratio,fire:Math.min(1.9,ratio*.9),radius:Math.min(2.4,.45+ratio*.8),grade:ratio<.45?'小火花':ratio<.85?'局部起火':ratio<1.3?'整棟燃燒':ratio<1.9?'連鎖大爆破':'超載大爆破'};}
