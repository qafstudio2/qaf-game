// Reusable fragments peel off the actual facade while the main shell survives until the blast.
export function buildMaterialSpray(T,scene){
 const geometry=new T.BoxGeometry(1,1,1),fallback=new T.MeshStandardMaterial({color:'#a39b85',roughness:.8});
 const pool=Array.from({length:96},()=>{const mesh=new T.Mesh(geometry,fallback);mesh.visible=false;mesh.castShadow=false;scene.add(mesh);return{mesh,life:0,duration:0,v:new T.Vector3(),spin:new T.Vector3(),size:new T.Vector3()};});
 let stage=0,sources=[],cursor=0,next=0,credit=0,power=1,solo=0,stopped=false,total=0;
 const floors=[0,0,0];
 function reset(level,pieces){stage=level;cursor=next=credit=solo=total=0;power=1;stopped=false;floors.fill(0);for(const p of pool){p.life=0;p.mesh.visible=false;}
  scene.updateMatrixWorld(true);const groups=[[],[],[]];
  for(const p of pieces){const d=p.userData;if(d.exactStage!==stage||!p.isMesh||!['wall','facade','roof','glass','cornice'].includes(d.type))continue;
   const position=p.getWorldPosition(new T.Vector3());const front=position.z>1.0,right=position.x>3.0,roof=d.type==='roof';
   if(!front&&!right&&!roof)continue;if(front&&position.y<2.3&&Math.abs(position.x)<1.55)continue;
   const floor=stage===1?(position.y>2.45?1:0):Math.min(2,Math.max(0,Math.floor((position.y-.4)/2.1)));
   groups[floor].push({position,material:p.material,floor,type:d.type,normal:new T.Vector3(roof?0:right?1:0,roof?1:0,front?1:0)});
  }
  sources=[];for(let i=0;i<Math.max(...groups.map(g=>g.length));i++)for(const g of groups)if(g[i])sources.push(g[i]);
 }
 function emit(progress){if(!sources.length)return;const source=sources[cursor++%sources.length],p=pool[next++%pool.length],large=total%7===0;
  p.mesh.material=source.material;p.mesh.visible=true;p.mesh.position.copy(source.position).addScaledVector(source.normal,.15);p.mesh.position.x+=(Math.random()-.5)*.20;p.mesh.position.y+=(Math.random()-.5)*.20;
  const panel=source.type==='roof'||source.type==='glass',size=(large?.35:.14)+Math.random()*.15;
  p.size.set(size,panel?.035:size*.55,size*(panel?1.3:.62));p.mesh.scale.copy(p.size);p.mesh.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);
  const force=1.6+Math.min(2.4,power)*.65+progress/65+solo*.8;
  p.v.set((Math.random()-.5)*2,1.8+Math.random()*2.2,(Math.random()-.5)*1.5).addScaledVector(source.normal,force);
  p.spin.set((Math.random()-.5)*9,(Math.random()-.5)*11,(Math.random()-.5)*9);p.duration=p.life=1.6+Math.random()*.9;total++;floors[source.floor]++;
 }
 function update(dt,progress,active){if(!active)return;
  if(stage>0&&!stopped&&progress>0&&progress<100){credit+=dt*(20+stage*5+progress*.35+solo*18);let count=Math.min(8,Math.floor(credit));credit-=count;while(count-->0)emit(progress);}
  for(const p of pool){if(p.life<=0)continue;p.life-=dt;if(p.life<=0){p.mesh.visible=false;continue;}p.v.y-=8.5*dt;p.mesh.position.addScaledVector(p.v,dt);p.mesh.rotation.x+=p.spin.x*dt;p.mesh.rotation.y+=p.spin.y*dt;p.mesh.rotation.z+=p.spin.z*dt;
   if(p.mesh.position.y<.18){p.mesh.position.y=.18;p.v.y=Math.abs(p.v.y)*.23;p.v.x*=.65;p.v.z*=.65;p.spin.multiplyScalar(.65);}
   p.mesh.scale.copy(p.size).multiplyScalar(Math.min(1,p.life/.35));
  }
 }
 return{reset,update,strike(value){power=value;},solo(value){solo=Math.max(solo,1+Math.max(0,Math.min(1,value))*.6);},explode(value){stopped=true;credit=0;for(const p of pool)if(p.life>0){p.life=Math.min(p.life,1.2);p.v.y+=2+value;p.v.x+=(p.mesh.position.x<0?-1:1)*value*2;p.v.z+=value;}},get stats(){return{stage,total,active:pool.filter(p=>p.life>0).length,floors:[...floors],solo,stopped,capacity:pool.length};}};
}
