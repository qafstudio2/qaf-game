// Code-built cartoon cameos, soot curls and torn cloth; no labels or dialogue.
export function addAfro(T,parent,r=.25,y=.05){
 const mat=new T.MeshStandardMaterial({color:'#17181c',roughness:1}),shape=new T.SphereGeometry(1,12,8),curls=[];
 for(let row=0;row<10;row++)for(let j=0;j<26;j++){const a=j/26*Math.PI*2+row*.24,edge=1.95-Math.max(0,Math.cos(a))*.77,th=(row+.3)/10*edge;curls.push({x:Math.sin(th)*Math.sin(a)*r,y:y+Math.cos(th)*r,z:Math.sin(th)*Math.cos(a)*r*.86-.018,s:r*(.12+.012*Math.sin(j*7+row))});}
 const core=new T.Mesh(new T.SphereGeometry(r*.96,24,16,0,Math.PI*2,0,1.45),mat);core.position.set(0,y,-.018);core.scale.z=.86;parent.add(core);
 const mesh=new T.InstancedMesh(shape,mat,curls.length),dummy=new T.Object3D();curls.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.setScalar(p.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});mesh.name='round tightly curled soot afro';parent.add(mesh);return mesh;
}
export function raggedSkirt(T,g,color){
 const positions=[],N=28;for(let i=0;i<N;i++){const a=i/N*Math.PI*2,b=(i+1)/N*Math.PI*2,low=j=>.23+(j%4===1?.12:j%3===0?.045:0),point=(angle,y,r)=>[Math.sin(angle)*r,y,Math.cos(angle)*r];positions.push(...point(a,.63,.15),...point(a,low(i),.23),...point(b,low(i+1),.23),...point(a,.63,.15),...point(b,low(i+1),.23),...point(b,.63,.15));}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.computeVertexNormals();const o=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:1,side:T.DoubleSide}));g.add(o);return o;
}
export function makeCameos(T,scene){
 const sphere=new T.SphereGeometry(1,16,12),cube=new T.BoxGeometry(1,1,1),mats=new Map();
 const mat=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.65}));return mats.get(c)};
 const mesh=(g,geo,c,x,y,z,sx=1,sy=1,sz=1)=>{const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);g.add(m);return m};
 const ball=(g,c,x,y,z,sx,sy=sx,sz=sx)=>mesh(g,sphere,c,x,y,z,sx,sy,sz),box=(g,c,x,y,z,sx,sy,sz)=>mesh(g,cube,c,x,y,z,sx,sy,sz);
 const rod=(g,c,a,b,r)=>{const u=new T.Vector3(...a),v=new T.Vector3(...b),m=mesh(g,new T.CylinderGeometry(r,r,u.distanceTo(v),8),c,0,0,0);m.position.copy(u).add(v).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.sub(u).normalize());return m};
 const list=[['spider-man','#bd2f32','#25468b','vault'],['masked-rider','#254d3b','#252931','leap'],['luffy','#be3330','#244b86','run'],['piccolo','#643880','#663d88','fly'],['superman','#2f5ba7','#2f5ba7','fly'],['batman','#363c46','#272d35','glide'],['iron-man','#a53f32','#a53f32','fly'],['captain','#2d5087','#304c7f','run'],['goku','#e17f33','#e17f33','leap'],['naruto','#e28a3c','#dd8237','run']];
 return list.map(([kind,shirt,pants,motion],index)=>{
  const g=new T.Group();g.name=kind;g.visible=false;scene.add(g);const arms=[],legs=[],skin=kind==='piccolo'?'#65a84f':'#dfb18c',head=new T.Group();head.position.set(0,1.23,.03);g.add(head);
  ball(g,shirt,0,.80,0,.23,.32,.14);box(g,kind==='luffy'?'#e9be56':'#222936',0,.57,.015,.38,.075,.26);
  for(const s of[-1,1]){const arm=new T.Group();arm.position.set(s*.22,1.01,0);g.add(arm);rod(arm,kind==='piccolo'||kind==='luffy'?skin:shirt,[0,0,0],[s*.03,-.23,0],.066);rod(arm,kind==='luffy'?skin:shirt,[s*.03,-.23,0],[s*.06,-.43,.05],.052);ball(arm,kind==='luffy'||kind==='piccolo'?skin:shirt,s*.06,-.46,.05,.065);arms.push(arm);
   const leg=new T.Group();leg.position.set(s*.10,.53,0);g.add(leg);rod(leg,pants,[0,0,0],[0,-.22,0],.082);rod(leg,kind==='luffy'?skin:pants,[0,-.22,0],[0,-.45,.02],.058);box(leg,kind==='luffy'?'#6e4830':kind==='goku'?'#204d83':shirt,0,-.46,.065,.13,.09,.20);legs.push(leg);}
  const masked=['spider-man','masked-rider','batman','iron-man','captain'].includes(kind);const face=kind==='spider-man'?'#bd2f32':kind==='masked-rider'?'#466957':kind==='iron-man'?'#d4ad58':kind==='batman'?'#272c34':kind==='captain'?'#2e5289':skin;
  ball(head,face,0,0,0,.19,.23,.17);
  for(const side of[-1,1]){const e=ball(head,masked?(kind==='masked-rider'?'#d0463f':'#edeacb'):'#fbf1df',side*.075,.035,.156,masked?.064:.034,masked?.060:.040,.017);e.rotation.z=-side*.18;if(!masked)ball(head,'#20252a',side*.075,.034,.173,.015,.023,.009);}
  if(!masked){ball(head,'#845043',0,-.10,.155,.043,.040,.016);ball(head,'#dbc38e',0,-.087,.168,.031,.009,.005);}
  let cape=null;
  if(['piccolo','superman','batman'].includes(kind)){cape=new T.Group();cape.position.set(0,1.03,-.15);g.add(cape);const shape=new T.Shape();shape.moveTo(-.26,0);shape.lineTo(.26,0);shape.lineTo(.44,-.77);for(let i=0;i<7;i++)shape.lineTo(.44-i*.146,-.77+(i%2)*.07);shape.closePath();const cm=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshStandardMaterial({color:kind==='piccolo'?'#eee8d8':kind==='superman'?'#c33f38':'#202631',side:T.DoubleSide,roughness:.85}));cape.add(cm);}
  if(kind==='spider-man'){for(const x of[-.13,0,.13])rod(head,'#303138',[[x,-.14,.12],[x,.18,.12]][0],[[x,-.14,.12],[x,.18,.12]][1],.005);for(const y of[-.13,-.055,.115])rod(head,'#303138',[-.15,y,.13],[.15,y,.13],.005);ball(g,'#1e2932',0,.90,.144,.025,.057,.012);for(const s of[-1,1])for(let i=0;i<3;i++)rod(g,'#1e2932',[0,.88+i*.018,.15],[s*.075,.86+i*.025,.148],.007);}
  if(kind==='masked-rider'){box(head,'#b9b6a0',0,.02,.174,.032,.37,.016);ball(head,'#a5adb1',0,-.12,.127,.115,.07,.055);for(const s of[-1,1])rod(head,'#c7c5b6',[s*.055,.18,0],[s*.11,.37,.01],.012);box(g,'#be3535',0,1.04,.02,.42,.08,.27);const scarf=box(g,'#be3535',.23,1.01,-.31,.14,.07,.52);scarf.rotation.z=.2;ball(g,'#c0bcb0',0,.57,.158,.065);ball(g,'#e74b33',0,.57,.205,.034);}
  if(kind==='luffy'){mesh(head,new T.CylinderGeometry(.32,.32,.035,28),'#d1b472',0,.15,0);mesh(head,new T.CylinderGeometry(.20,.235,.13,24),'#d1b472',0,.225,0);mesh(head,new T.CylinderGeometry(.237,.237,.044,24),'#9f3635',0,.177,0);box(g,skin,0,.83,.145,.15,.39,.017);for(const s of[-1,1])box(g,'#efbd53',s*.075,.79,.166,.013,.15,.01);rod(head,'#774b3c',[.08,-.064,.172],[.13,-.072,.142],.007);}
  if(kind==='piccolo'){for(const s of[-1,1]){const ear=mesh(head,new T.ConeGeometry(.067,.22,10),skin,s*.22,.035,0);ear.rotation.z=-s*1.0;rod(head,skin,[s*.07,.18,.08],[s*.12,.30,.18],.015);ball(g,'#e4dcca',s*.24,1.035,-.01,.15,.08,.19);for(let i=0;i<3;i++)box(arms[s<0?0:1],'#c58482',s*.045,-.10-i*.047,.052,.072,.020,.016);}box(g,'#a64139',0,.60,.02,.43,.10,.28);}
  if(kind==='superman'){const shield=box(g,'#dfbc51',0,.91,.153,.14,.13,.02);shield.rotation.z=Math.PI/4;box(g,'#c6403c',0,.91,.174,.08,.04,.01);}
  if(kind==='batman'){for(const s of[-1,1])mesh(head,new T.ConeGeometry(.055,.18,8),'#272c34',s*.12,.23,0);ball(head,skin,0,-.125,.125,.10,.057,.053);box(g,'#ad9551',0,.57,.016,.40,.064,.28);ball(g,'#18212a',0,.89,.15,.14,.043,.015);}
  if(kind==='iron-man'){ball(g,'#abeafa',0,.91,.15,.063,.063,.020);for(const arm of arms)ball(arm,'#d4eff3',0,-.465,.108,.026,.030,.007);box(head,'#722f2e',0,-.133,.146,.1,.02,.013);}
  if(kind==='captain'){const shield=new T.Group();shield.position.set(-.10,-.30,.12);arms[0].add(shield);for(const [r,c,z]of[[.29,'#bd4141',0],[.23,'#d6d9d7',.012],[.18,'#bd4141',.024],[.12,'#3c5b98',.036]]){const disc=mesh(shield,new T.CylinderGeometry(r,r,.022,28),c,0,0,z);disc.rotation.x=Math.PI/2;}const star=box(shield,'#eee7d5',0,0,.055,.09,.09,.009);star.rotation.z=Math.PI/4;}
  if(['goku','naruto','superman'].includes(kind)){const hc=kind==='naruto'?'#dab847':'#20252b';for(let i=0;i<7;i++){const spike=mesh(head,new T.ConeGeometry(.07,.20+(i%3)*.035,8),hc,(i-3)*.047,.20+Math.cos(i)*.015,-.025);spike.rotation.z=-(i-3)*.13;}if(kind==='goku'){box(g,'#245284',0,.60,.016,.40,.07,.28);box(g,'#245284',0,.96,.143,.10,.16,.02);}if(kind==='naruto'){box(head,'#3f4b59',0,.11,.14,.30,.065,.016);box(head,'#b7c0c0',0,.11,.156,.14,.047,.007);for(const s of[-1,1])for(let i=0;i<2;i++)rod(head,'#745342',[s*.085,-.055-i*.025,.159],[s*.15,-.066-i*.025,.10],.006);}}
  return {g,kind,arms,legs,head,cape,motion,index,at:71+index*.65,escapeAge:-1,firstEmergence:false,emerged:false,escaped:false};
 });
}
