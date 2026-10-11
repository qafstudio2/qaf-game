// Progress drives entrances; elapsed time drives the short, unskippable visual finales.
// Actors live outside the architecture group so they never alter the building camera fit.
function factory(T){
 const sphere=new T.SphereGeometry(1,18,12),cube=new T.BoxGeometry(1,1,1),materials=new Map();
 const material=(color,metalness=0)=>{const key=color+metalness;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:metalness?.32:.76,metalness}));return materials.get(key);};
 const mesh=(g,geo,color,x,y,z,sx=1,sy=1,sz=1)=>{const m=new T.Mesh(geo,typeof color==='string'?material(color):color);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.receiveShadow=true;g.add(m);return m;};
 const ball=(g,color,x,y,z,sx,sy=sx,sz=sx)=>mesh(g,sphere,color,x,y,z,sx,sy,sz);
 const box=(g,color,x,y,z,sx,sy,sz)=>mesh(g,cube,color,x,y,z,sx,sy,sz);
 const rod=(g,color,a,b,r)=>{a=new T.Vector3(...a);b=new T.Vector3(...b);const m=mesh(g,new T.CylinderGeometry(r,r,a.distanceTo(b),8),color,0,0,0);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());return m;};
 return {material,mesh,ball,box,rod};
}

export function makeGrandma(T,index=0,charred=false){
 const {material,mesh,ball,box,rod}=factory(T),g=new T.Group(),arms=[],legs=[];
 const skin=charred?'#504940':'#deb495',dress=charred?'#393b3d':['#9881ab','#789b94','#b18682','#7489a9','#b29462'][index%5],hair=charred?'#484640':'#e4ded5';
 mesh(g,new T.CylinderGeometry(.15,.23,.39,20),dress,0,.44,0);
 ball(g,dress,0,.69,0,.18,.19,.13);box(g,charred?'#525251':'#f1dfbc',0,.70,.127,.036,.24,.012);
 for(let i=0;i<3;i++)ball(g,'#c4b386',.025,.61+i*.07,.14,.012);
 const head=new T.Group();head.position.set(0,.95,.045);g.add(head);
 ball(head,skin,0,0,0,.16,.18,.145);
 mesh(head,new T.SphereGeometry(.173,20,12,0,Math.PI*2,0,1.45),hair,0,.035,-.014);
 ball(head,hair,0,.12,-.12,.10);ball(head,skin,0,-.02,.148,.029,.031,.039);
 for(const side of[-1,1]){
  ball(head,charred?'#faf6de':'#272a2d',side*.057,.015,.139,charred?.040:.013,charred?.037:.015,.011);
  if(charred)ball(head,'#202127',side*.057,.015,.151,.013);
  const glasses=mesh(head,new T.TorusGeometry(.046,.005,5,16),material('#bcb9a6',.65),side*.056,.019,.153);glasses.rotation.y=side*.10;
 }
 box(head,'#a9a690',0,.019,.163,.026,.006,.007);
 const mouth=ball(head,charred?'#101619':'#89584a',0,-.092,.134,.022,charred?.025:.008,.008);
 if(charred)for(let i=0;i<6;i++)rod(head,hair,[(i-2.5)*.04,.14,-.025],[(i-2.5)*.075,.28+(i%2)*.08,-.03],.012);
 for(const side of[-1,1]){
  const arm=new T.Group();arm.position.set(side*.16,.77,0);g.add(arm);rod(arm,dress,[0,0,0],[side*.025,-.22,.01],.049);ball(arm,skin,side*.027,-.25,.015,.045);arms.push(arm);
  const leg=new T.Group();leg.position.set(side*.075,.28,0);g.add(leg);rod(leg,'#9d8979',[0,0,0],[0,-.21,0],.035);ball(leg,'#30323b',0,-.225,.033,.055,.041,.09);legs.push(leg);
 }
 // A cane and handbag make the five slower figures readable even at phone size.
 rod(arms[0],'#97744d',[-.05,-.24,.06],[-.05,-.69,.06],.014);
 const handle=mesh(arms[1],new T.TorusGeometry(.064,.009,6,16),'#514443',.025,-.30,.025);handle.scale.y=.8;
 ball(arms[1],charred?'#333239':'#6b4d48',.025,-.395,.025,.075,.09,.045);
 g.userData.grandma=true;
 return {g,arms,legs,head,mouth};
}

export function buildEscapeShow(T,scene,customers,occupants,critters){
 const {material,mesh,ball,box,rod}=factory(T),v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 let stage=0,progress=0,clock=0,blastAge=-1,running=false;
 const events=[],animals=[],vehicles=[];
 const soot=makeGrandma(T,0,true);soot.g.visible=false;soot.g.scale.setScalar(1.35);scene.add(soot.g);

 function striped(kind){
  const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle=kind==='zebra'?'#e2e2d4':'#d78734';ctx.fillRect(0,0,512,256);ctx.fillStyle=kind==='zebra'?'#24282b':'#312a24';
  for(let i=0;i<17;i++){const x=i*32;ctx.beginPath();ctx.moveTo(x-8,0);ctx.bezierCurveTo(x+36,80,x-36,165,x+18,256);ctx.lineTo(x+29,256);ctx.bezierCurveTo(x-12,160,x+49,78,x+7,0);ctx.fill();}
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map,roughness:.8});
 }
 function animal(kind,at){
  const g=new T.Group(),legs=[],coat=kind==='lion'?material('#c3944e'):striped(kind);scene.add(g);g.visible=false;
  const horse=kind==='zebra',body=ball(g,coat,0,.72,0,.31,.34,.61);
  const neck=ball(g,coat,0,horse?1.02:.88,.39,horse?.20:.26,horse?.42:.27,.26);neck.rotation.x=-.26;
  const head=new T.Group();head.position.set(0,horse?1.36:1.04,.65);g.add(head);
  if(kind==='lion')ball(head,'#79502e',0,-.005,-.045,.38,.40,.28);
  ball(head,coat,0,0,0,.23,.245,horse?.33:.24);
  ball(head,horse?'#5d6260':'#d6c0a0',0,-.075,horse?.29:.21,horse?.19:.18,.115,.14);
  ball(head,'#25282a',0,-.04,horse?.405:.33,.062,.04,.035);
  for(const side of[-1,1]){
   ball(head,coat,side*.17,.23,-.05,.065,horse?.17:.075,.05);
   ball(head,'#f5dfab',side*.169,.065,.17,.06,.051,.035);ball(head,'#121b20',side*.182,.065,.197,.022);
   for(const z of[-.40,.36]){const leg=new T.Group();leg.position.set(side*.21,.65,z);g.add(leg);rod(leg,coat,[0,0,0],[0,-.50,.02],horse?.053:.070);ball(leg,horse?'#2d3030':'#d2a262',0,-.54,.055,.077,.077,.105);legs.push(leg);}
  }
  if(horse)for(let i=0;i<7;i++)box(g,'#282b2e',0,1.10+i*.042,.22+i*.048,.04,.16,.048);
  const tail=new T.Group();tail.position.set(0,.91,-.55);g.add(tail);rod(tail,coat,[0,0,0],[.14,-.18,-.44],.032);ball(tail,kind==='lion'?'#67452e':'#2a3030',.14,-.18,-.47,.065,.065,.10);
  const o={g,kind,at,legs,head,tail,emerged:false,escaped:false};animals.push(o);return o;
 }
 animal('zebra',18);animal('lion',28);animal('tiger',38);

 function wheel(g,x,y,z,r,width){const a=new T.Group();a.position.set(x,y,z);g.add(a);const tire=mesh(a,new T.CylinderGeometry(r,r,width,20),'#20242a',0,0,0);tire.rotation.z=Math.PI/2;const rim=mesh(a,new T.CylinderGeometry(r*.61,r*.61,width+.015,16),material('#aab4b7',.8),0,0,0);rim.rotation.z=Math.PI/2;for(let i=0;i<6;i++){const spoke=box(a,'#455059',0,0,0,width+.022,r*1.06,.024);spoke.rotation.x=i*Math.PI/3;}return a;}
 const car=new T.Group();scene.add(car);car.visible=false;const carWheels=[];
 box(car,'#d2a347',0,.43,0,1.20,.39,2.05);ball(car,'#e7b556',0,.49,.64,.60,.24,.47);
 box(car,'#dfa946',0,.78,-.14,1.04,.54,1.01);box(car,'#263e4b',0,.82,.379,.86,.31,.018);
 for(const side of[-1,1]){box(car,'#2a4550',side*.529,.83,-.14,.016,.29,.78);box(car,'#d7b269',side*.539,.84,-.09,.014,.37,.046);box(car,'#b7bdb6',side*.36,.52,1.027,.22,.13,.033);for(const z of[-.64,.66])carWheels.push(wheel(car,side*.59,.28,z,.25,.14));box(car,'#5e584a',side*.61,.62,.15,.10,.055,.11);}
 box(car,'#454c52',0,.30,1.08,1.13,.09,.07);box(car,'#e1ddce',0,.39,1.09,.24,.09,.012);
 // An alarmed driver is visible through the windscreen.
 ball(car,'#d3a587',-.25,.81,.15,.115);ball(car,'#242935',-.25,.88,.12,.12,.085,.11);for(const x of[-.289,-.215])ball(car,'#f3ede3',x,.82,.25,.017);
 vehicles.push({g:car,kind:'car',at:68,wheels:carWheels,emerged:false,escaped:false});
 const bike=new T.Group();scene.add(bike);bike.visible=false;const bikeWheels=[wheel(bike,0,.28,-.58,.28,.11),wheel(bike,0,.28,.64,.28,.11)];
 rod(bike,'#b7bfc0',[0,.29,-.58],[0,.55,.10],.045);rod(bike,'#b7bfc0',[0,.55,.10],[0,.29,.64],.04);box(bike,'#814949',0,.60,0,.34,.26,.60);box(bike,'#252b30',0,.77,-.24,.35,.11,.40);
 rod(bike,'#b6bec0',[0,.29,.64],[0,.93,.49],.036);rod(bike,'#b6bec0',[-.32,.91,.49],[.32,.91,.49],.025);ball(bike,'#eadba7',0,.80,.65,.10,.10,.04);
 ball(bike,'#273946',0,1.04,-.13,.20,.31,.14);ball(bike,'#c24838',0,1.41,-.02,.21,.23,.21);ball(bike,'#253c4a',0,1.44,.14,.17,.10,.065);
 for(const side of[-1,1]){rod(bike,'#273946',[side*.17,1.20,-.06],[side*.30,.94,.47],.057);ball(bike,'#25282e',side*.30,.94,.47,.057);rod(bike,'#303843',[side*.10,.86,-.21],[side*.29,.61,.15],.073);rod(bike,'#303843',[side*.29,.61,.15],[side*.28,.27,-.03],.064);box(bike,'#1e252d',side*.28,.26,.025,.13,.09,.25);}
 vehicles.push({g:bike,kind:'motorcycle',at:83,wheels:bikeWheels,emerged:false,escaped:false});

 // Reuse geometry/materials for the stampede, with separate joints on each actor.
 function cloneActor(source,at,index){const g=source.g.clone(true),map=new Map();function pair(a,b){map.set(a,b);a.children.forEach((child,i)=>pair(child,b.children[i]));}pair(source.g,g);scene.add(g);const o={...source,g,at,index,emerged:false,escaped:false};if(source.legs)o.legs=source.legs.map(l=>map.get(l));if(source.wheels)o.wheels=source.wheels.map(l=>map.get(l));if(source.head)o.head=map.get(source.head);if(source.tail)o.tail=map.get(source.tail);return o;}
 for(const [kind,at]of[['zebra',18],['lion',28],['tiger',38]]){const source=animals.find(o=>o.kind===kind);source.index=0;for(let i=1;i<4;i++)animals.push(cloneActor(source,at+i*2.1,i));}animals.sort((a,b)=>a.at-b.at);
 for(const [kind,at]of[['car',51],['motorcycle',65]]){const source=vehicles.find(o=>o.kind===kind);source.at=at;source.index=0;for(let i=1;i<6;i++)vehicles.push(cloneActor(source,at+i*1.65,i));}vehicles.sort((a,b)=>a.at-b.at);

 // Three-storey soot-covered hero, completely hidden until the detonation.
 const hero=new T.Group();scene.add(hero);hero.visible=false;
 const silver=material('#333539',.08),red=material('#493239',.06),dark=material('#13191e',.02);
 ball(hero,silver,0,.65,0,.95,1.42,.55);ball(hero,red,0,-.10,.01,.86,.51,.53);
 for(const side of[-1,1]){const chest=box(hero,red,side*.44,1.20,.47,.20,1.48,.08);chest.rotation.z=side*-.47;ball(hero,red,side*.97,1.32,0,.39,.43,.40);
  rod(hero,silver,[side*.97,1.30,0],[side*1.37,2.43,.06],.29);rod(hero,silver,[side*1.37,2.43,.06],[side*1.42,3.35,.13],.25);
  ball(hero,silver,side*1.42,3.57,.14,.31,.39,.23);for(let i=0;i<4;i++)ball(hero,silver,side*(1.18+i*.15),3.87,.20,.078,.25,.083);
  rod(hero,silver,[side*.44,-.32,0],[side*.53,-1.65,0],.35);rod(hero,red,[side*.53,-1.65,0],[side*.62,-2.84,.12],.30);ball(hero,red,side*.62,-2.96,.36,.34,.21,.62);
 }
 const heroHead=new T.Group();heroHead.position.set(0,2.62,0);hero.add(heroHead);ball(heroHead,silver,0,0,0,.72,.92,.61);
 const crest=box(heroHead,silver,0,.72,-.03,.09,.84,.58);crest.rotation.x=.05;
 const eyeMat=new T.MeshStandardMaterial({color:'#e9e1bf',emissive:'#d5c9a3',emissiveIntensity:.25,roughness:.7});
 for(const side of[-1,1]){const e=ball(heroHead,eyeMat,side*.32,.15,.51,.27,.17,.075);e.rotation.z=side*-.10;ball(heroHead,dark,side*.71,-.04,-.02,.075,.24,.16);ball(heroHead,dark,side*.32,.18,.588,.043,.065,.009);rod(heroHead,dark,[side*.12,.42,.52],[side*.52,.31,.44],.035);ball(heroHead,silver,side*.32,.32,.515,.28,.09,.06);}
 const mouthCurve=new T.CatmullRomCurve3([v(-.21,-.46,.54),v(0,-.37,.59),v(.21,-.46,.54)]);mesh(heroHead,new T.TubeGeometry(mouthCurve,16,.028,6,false),dark,0,0,0);rod(heroHead,silver,[0,.04,.63],[0,-.23,.66],.054);
 const timer=ball(hero,new T.MeshStandardMaterial({color:'#ad5750',emissive:'#6e1714',emissiveIntensity:.35}),0,1.03,.56,.16,.21,.06);
 // Keep the resigned face and raised hands readable during the upward launch.
 const closeSphere=new T.SphereGeometry(1,64,40);heroHead.traverse(o=>{if(o.isMesh&&o.geometry.type==='SphereGeometry')o.geometry=closeSphere;});

 const smokeMap=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(100,100,103,.9)');r.addColorStop(.6,'rgba(92,94,97,.55)');r.addColorStop(1,'rgba(70,73,80,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new T.CanvasTexture(c);})();
 const smoke=Array.from({length:18},(_,i)=>{const s=new T.Sprite(new T.SpriteMaterial({map:smokeMap,transparent:true,depthWrite:false,opacity:0}));scene.add(s);s.visible=false;return {g:s,i};});

 function reset(level){stage=level;clock=progress=0;blastAge=-1;running=false;events.length=0;hero.visible=soot.g.visible=false;hero.userData.passed=false;smoke.forEach(o=>o.g.visible=false);
  for(const o of customers){o.flee=o.escaped=o.emerged=o.knocked=o.startedRun=false;o.blastAge=-1;o.g.visible=o.stage===stage&&(stage===1||o.index<6);o.g.position.copy(o.home);o.g.rotation.set(0,o.idleYaw||0,0);o.arms.forEach(a=>a.rotation.set(0,0,0));o.legs.forEach(l=>l.rotation.set(0,0,0));}
  for(const o of [...animals,...vehicles]){o.g.visible=false;o.g.position.set(0,.28,-1.5);o.g.rotation.set(0,0,0);o.emerged=o.escaped=false;}
 }
 function charge(value){progress=Math.max(progress,value);}
 function log(kind,index){events.push({kind,index,progress});}
 function runPose(o,age,slow=false){const pace=age*(slow?13:23)+(o.index||0);o.g.rotation.x=slow?.14:-.13;o.g.rotation.z=Math.sin(pace*.5)*(slow?.035:.07);o.legs.forEach((l,i)=>l.rotation.x=Math.sin(pace+i*Math.PI)*(slow?.24:.76));o.arms.forEach((a,i)=>{a.rotation.x=Math.sin(pace+i*Math.PI)*(slow?.18:.72);a.rotation.z=(i?1:-1)*(slow?.12:.32);});}
 function people(){for(const o of customers){if(o.stage!==stage||o.knocked)continue;const granny=!!o.isGrandma,exit=v(stage===0?.38:0,.28,1.72),side=o.index%2?1:-1,outside=v(side*(granny?3.3:10),.13,granny?3.6:4.1),insideDistance=o.home.distanceTo(exit),slowSpeed=.68;
   const at=stage===0?(granny?72+(o.index-15)*4-insideDistance/slowSpeed*11:3+o.index*3.6):2+o.index*(stage===1?1.5:2),age=(clock-at)/11;
   if(age<0)continue;o.startedRun=o.flee=true;o.elapsed=age;o.g.visible=true;
   const doorTime=granny?insideDistance/slowSpeed:.35,outsideTime=granny?exit.distanceTo(outside)/slowSpeed:1.45;
   let a,b,u;if(age<doorTime){a=o.home;b=exit;u=age/doorTime;}else{if(!o.emerged){o.emerged=true;log(granny?'grandma':'customer',o.index);}a=exit;b=outside;u=clamp((age-doorTime)/outsideTime);}
   o.g.position.copy(a).lerp(b,u);o.g.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);runPose(o,age,granny);o.g.position.y+=Math.abs(Math.sin(age*(granny?13:23)))*(granny?.018:.055);
   if(!granny&&age>1.80){o.escaped=true;o.g.visible=false;}
  }}
 function pests(t){if(stage!==1)return;for(const o of critters){const at=o.kind==='rat'?41+o.index*.32:45+o.index*(o.kind==='roach'?.22:.09),age=(clock-at)/18;o.elapsed=age;if(age<0||o.escaped)continue;
   o.g.visible=true;const side=o.index%2?1:-1,exit=v((o.index%3-1)*.18,.25,1.72),safe=v(side*(8.5+o.index%4),.11,3.7+(o.index%5)*.19);let a,b,u;
   if(age<.14){a=o.home;b=exit;u=age/.14;}else{a=exit;b=safe;u=clamp((age-.14)/.80);if(!o.emerged){o.emerged=true;log(o.kind,o.index);}}
   o.g.position.copy(a).lerp(b,u);o.g.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);o.legs.forEach((l,i)=>l.rotation.z=o.legHomes[i].z+Math.sin(t*34+i*Math.PI+o.index)*.25);
   if(age>.94){o.escaped=true;o.g.visible=false;}
  }}
 function surprises(t){if(stage!==2)return;for(const [i,o]of [...animals,...vehicles].entries()){const age=(clock-o.at)/18;if(age<0)continue;o.g.visible=true;const side=i%2?-1:1,lane=o.legs?0:(o.index%2)*.16,exit=v((o.index%2?1:-1)*.14,.28,1.78),road=v(0,.13,5.20+lane),turn=v(side*1.8,.13,5.65+lane),safe=v(side*12,.13,5.65+lane);let a,b,u;
   if(age<.16){a=v(exit.x,.28,-1.25);b=exit;u=age/.16;}else if(age<.36){a=exit;b=road;u=(age-.16)/.20;}else if(age<.54){a=road;b=turn;u=(age-.36)/.18;}else{a=turn;b=safe;u=clamp((age-.54)/.72);}
   if(age>=.16&&!o.emerged){o.emerged=true;log(o.kind,i);}
   o.g.position.copy(a).lerp(b,u);const direction=Math.atan2(b.x-a.x,b.z-a.z);o.g.rotation.y=direction;
   if(o.legs){o.legs.forEach((l,j)=>l.rotation.x=Math.sin(age*38+(j%2)*Math.PI+(j>1?Math.PI:0))*.90);o.g.position.y+=Math.abs(Math.sin(age*38))*.10;o.head.rotation.z=Math.sin(t*13)*.07;o.head.rotation.x=-.11;o.tail.rotation.y=Math.sin(t*24)*.5;}
   else{o.wheels.forEach(w=>w.rotation.x=-age*38);o.g.rotation.z=age>.36&&age<.54?side*(o.kind==='motorcycle'?.23:.035):Math.sin(age*24)*.015;}
   if(age>1.26){o.escaped=true;o.g.visible=false;}
  }}
 function upstairs(dt,t){if(stage!==1)return;for(const [i,o]of occupants.filter(o=>o.stage===1).entries()){o.g.visible=true;const a=t*4.3+i*Math.PI,dx=Math.sin(a)*.36,dz=Math.cos(a)*.63;o.g.position.set(o.home.x+dx,o.home.y+Math.abs(Math.sin(t*22))*.05,.64+dz);o.g.rotation.y=Math.atan2(Math.cos(a)*.36,-Math.sin(a)*.63);runPose(o,t+i);o.arms.forEach((arm,j)=>arm.rotation.z=(j?1:-1)*(1.6+Math.sin(t*18)*.5));}}
 function detonate(){clock=100;people();pests(0);surprises(0);blastAge=0;running=false;
  if(stage===0)for(const o of customers.filter(o=>o.stage===0&&o.isGrandma&&o.g.visible)){o.knocked=true;o.blastHome=o.g.position.clone();o.blastTurn=o.g.rotation.y;o.blastAge=0;log('grandma-knocked',o.index);}
  if(stage===1){soot.g.position.set(0,.21,2.50);soot.g.rotation.set(0,.30,0);smoke.forEach(o=>o.g.visible=true);critters.forEach(o=>o.g.visible=false);}
  if(stage===2){hero.visible=true;hero.position.set(0,3.40,-.1);hero.rotation.set(0,0,0);log('giant-reveal',0);}
 }
 function update(dt,t,active){running=active;if(blastAge<0){if(stage===1)for(const o of customers.filter(o=>o.stage===1&&!o.startedRun)){o.g.rotation.y=o.idleYaw+Math.sin(t*.7+o.index)*.10;o.arms.forEach((a,i)=>a.rotation.x=(o.index%3===i?-.45:0)+Math.sin(t+o.index)*.04);}if(!active||progress<=0)return;clock+=(progress-clock)*Math.min(1,dt*18);people();pests(t);surprises(t);upstairs(dt,t);return;}
  if(!active)return;blastAge+=dt;
  if(stage===0)for(const o of customers.filter(o=>o.knocked)){const a=blastAge,side=o.index%2?1:-1;o.blastAge=a;o.g.position.copy(o.blastHome).add(v(side*Math.min(a,1)*1.1,Math.max(0,1.9*a-3.5*a*a),Math.min(a,1)*.9));o.g.position.y=Math.max(.16,o.g.position.y);o.g.rotation.set(-Math.min(1.38,a*2.8),o.blastTurn,side*Math.min(.40,a*.8));o.arms.forEach((arm,i)=>arm.rotation.z=(i?1:-1)*(1.1+Math.sin(a*18)*.3));o.legs.forEach((l,i)=>l.rotation.x=a<1?Math.sin(a*19+i*Math.PI)*.6:.1);}
  if(stage===1){soot.g.visible=blastAge>.90;soot.head.rotation.y=Math.sin(Math.max(0,blastAge-1.8)*3)*.12;soot.arms.forEach((a,i)=>a.rotation.z=(i?1:-1)*(.10+Math.sin(t*4)*.015));soot.g.rotation.z=Math.sin(t*5)*.012;
   for(const {g,i}of smoke){const a=blastAge,side=i%2?1:-1;g.position.set(side*(.15+(i%5)*.25+Math.max(0,a-.9)*(1.7+i%3*.25)),.40+(i%6)*.24+a*.22,2.9+Math.sin(i)*.35);g.scale.setScalar(1.0+a*.5);g.material.opacity=clamp(1-(a-.9)/1.4)*.82;g.visible=g.material.opacity>0;}
  }
 }
 function present(camera){if(blastAge<0)return;
  if(stage===0){const u=clamp(blastAge/.55),look=camera.getWorldDirection(v()).multiplyScalar(10).add(camera.position).lerp(v(0,.85,1.95),u);camera.lookAt(look);}
  if(stage===1){const u=clamp((blastAge-1.0)/1.2);camera.position.lerp(v(3.2,2.3,7.5),u*.85);const old=camera.getWorldDirection(v()).multiplyScalar(10).add(camera.position),look=old.lerp(v(0,.92,2.5),u);camera.lookAt(look);soot.g.rotation.y=Math.atan2(camera.position.x-soot.g.position.x,camera.position.z-soot.g.position.z);}
  if(stage===2){
   // Let the blast clear first, then accelerate upward without approaching the camera.
   const rise=blastAge*.25+8*Math.max(0,blastAge-1.45)**2;
   hero.position.set(0,3.4+rise,.4);hero.rotation.set(0,Math.atan2(camera.position.x,camera.position.z-.4),Math.sin(blastAge*8)*.035);
   if(blastAge>=3.0){hero.visible=false;if(!hero.userData.passed){hero.userData.passed=true;log('giant-flew-up',0);}}
   timer.material.emissiveIntensity=.35;
  }
 }
 return {reset,charge,detonate,update,present,animals,vehicles,hero,soot,events,get progress(){return clock;},get blastAge(){return blastAge;},get duration(){return [2700,4100,3600][stage];}};
}
