import {T} from './models.js?v=ankle-14';
const clamp=T.MathUtils.clamp;

function flameTexture(){
 const c=document.createElement('canvas');c.width=128;c.height=256;const x=c.getContext('2d');
 // A curved, tapered flame with two uneven tongues; particles rise independently.
 x.beginPath();x.moveTo(66,247);x.bezierCurveTo(5,231,18,166,39,129);x.bezierCurveTo(29,173,65,147,53,81);x.bezierCurveTo(83,111,63,33,83,6);x.bezierCurveTo(81,82,118,102,94,152);x.bezierCurveTo(123,124,122,223,66,247);
 const g=x.createLinearGradient(0,245,0,8);g.addColorStop(0,'rgba(255,241,178,0)');g.addColorStop(.14,'rgba(255,246,186,.95)');g.addColorStop(.4,'rgba(255,166,35,.95)');g.addColorStop(.72,'rgba(239,66,13,.68)');g.addColorStop(1,'rgba(170,30,8,0)');x.fillStyle=g;x.shadowBlur=13;x.shadowColor='#ff781f';x.fill();x.shadowBlur=0;
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}

export class Distress{
 constructor(rig){
  this.rig=rig;this.level=0;this.fireLevel=0;this.emit=0;this.cursor=0;this.dropCount=0;this.dummy=new T.Object3D();this.origin=new T.Vector3();this.root=new T.Group();this.root.name='load-driven sweat and fire';rig.scene.add(this.root);
  const geo=new T.SphereGeometry(1,10,8),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const y=p.getY(i);if(y>0){p.setX(i,p.getX(i)*(1-y*.65));p.setZ(i,p.getZ(i)*(1-y*.65));p.setY(i,y*1.4);}}geo.computeVertexNormals();
  this.sweat=new T.InstancedMesh(geo,new T.MeshBasicMaterial({color:'#9cdef3',transparent:true,opacity:.93,depthWrite:false}),36);this.sweat.instanceMatrix.setUsage(T.DynamicDrawUsage);this.sweat.frustumCulled=false;this.root.add(this.sweat);
  this.drops=Array.from({length:36},()=>({life:0,max:1,p:new T.Vector3(),v:new T.Vector3(),size:.03}));
  this.texture=flameTexture();this.flames=[];const anchors=[[-.35,1.20,-1.26],[.35,1.20,-1.26],[-.37,.17,-.65],[.37,.17,-.65],[-.51,.95,-1.35],[.51,.95,-1.35]];
  for(let i=0;i<12;i++){const m=new T.SpriteMaterial({map:this.texture,transparent:true,depthWrite:false,opacity:0,blending:T.AdditiveBlending}),s=new T.Sprite(m);s.userData={anchor:anchors[i%anchors.length],phase:i*.61803%1,speed:.72+(i%5)*.13};s.visible=false;this.root.add(s);this.flames.push(s);}
  this.light=new T.PointLight('#ff862f',0,4,1.7);this.light.position.set(0,1.25,-.85);this.root.add(this.light);this.reset();
 }
 pose(pain){
  const f=this.rig.face;
  for(const {eye,brow,side}of f.eyes){eye.scale.y=1-.82*pain;eye.rotation.z=side*pain*.12;brow.rotation.z=-side*pain*.48;brow.position.y=.091+pain*.018;}
  f.restMouth.scale.set(1-pain*.18,Math.max(.02,1-pain*4),1);f.restMouth.visible=pain<.25;
  f.grimace.visible=pain>.035;f.grimace.scale.set(.70+pain*.47,.10+pain*1.18,1);f.mouth.position.y=-.119-pain*.012;f.skin.color.copy(f.restColor).lerp(f.painColor,pain*.62);
 }
 stopEffects(){this.emit=0;this.dropCount=0;this.fireLevel=0;this.drops.forEach(d=>d.life=0);this.sweat.visible=false;this.flames.forEach(f=>f.visible=false);this.light.intensity=0;}
 reset(){this.level=0;this.stopEffects();this.pose(0);this.rig.body.position.y=1.42;this.rig.head.position.y=2.15;this.rig.drummer.rotation.set(0,0,0);}
 update(now,dt,stress,active=true,reducedMotion=false){
  if(!active){this.stopEffects();return;}
  const target=clamp(stress/100,0,1);this.level+=(target-this.level)*(1-Math.exp(-dt/(target>this.level?.14:.28)));if(this.level<.0001)this.level=0;
  const p=this.level,t=now/1000,movement=reducedMotion?.35:1;this.pose(p);
  // Stress adds visible strain; stick hits and kick timing remain driven by the sound events.
  this.rig.body.rotation.x+=p*.10;this.rig.body.rotation.z=Math.sin(t*(7+p*7))*p*.035*movement;
  const bounce=Math.sin(t*(9+p*9))*p*.017*movement;
  this.rig.body.position.y=1.42-p*.04+bounce;this.rig.head.position.y=2.15-p*.04+bounce;
  this.rig.head.rotation.x+=p*.17+Math.sin(t*(10+p*9))*p*.058*movement;
  this.rig.head.rotation.z+=Math.sin(t*(8+p*7))*p*.095*movement;
  this.rig.head.rotation.y+=Math.sin(t*11)*p*.065*movement;
  this.rig.drummer.rotation.z=Math.sin(t*8.5)*p*.018*movement;
  const rate=p>.10?(3+p*p*34):0;this.emit+=dt*rate;this.rig.head.updateWorldMatrix(true,false);
  while(this.emit>=1){this.emit--;const d=this.drops[this.cursor++%this.drops.length],side=this.cursor%2?1:-1;this.origin.set(side*.216,.06,.18).applyMatrix4(this.rig.head.matrixWorld);d.p.copy(this.origin);d.v.set(side*(.7+p*1.6+Math.random()*.65),.8+p*1.2+Math.random()*.8,.25+Math.random()*.65);d.max=d.life=.48+Math.random()*.3;d.size=.020+p*.020+Math.random()*.007;}
  this.dropCount=0;for(let i=0;i<this.drops.length;i++){const d=this.drops[i];d.life=Math.max(0,d.life-dt);if(d.life>0){d.v.y-=5.5*dt;d.p.addScaledVector(d.v,dt);this.dummy.position.copy(d.p);this.dummy.rotation.set(0,0,-Math.atan2(d.v.x,d.v.y));const size=d.size*Math.min(1,d.life/.14);this.dummy.scale.set(size*.62,size,size*.48);this.dropCount++;}else this.dummy.scale.setScalar(0);this.dummy.updateMatrix();this.sweat.setMatrixAt(i,this.dummy.matrix);}this.sweat.instanceMatrix.needsUpdate=true;this.sweat.visible=this.dropCount>0;
  this.fireLevel=clamp((p-.52)/.45,0,1);
  for(let i=0;i<this.flames.length;i++){const f=this.flames[i],a=f.userData,q=(t*a.speed+a.phase)%1;f.visible=this.fireLevel>.01;if(!f.visible)continue;const e=this.fireLevel;f.position.set(a.anchor[0]+Math.sin(t*6+i*2.7)*.075*q,a.anchor[1]+q*(.25+e*.60),a.anchor[2]);f.scale.set((.16+e*.22)*(1-q*.35),(.35+e*.83)*(1-q*.40),1);f.material.rotation=Math.sin(t*5+i)*.17;f.material.opacity=e*(.40+.50*Math.sin(q*Math.PI));}
  this.light.intensity=this.fireLevel*(4+Math.sin(t*23)*.6);
 }
 dispose(){this.sweat.geometry.dispose();this.sweat.material.dispose();this.texture.dispose();this.flames.forEach(f=>f.material.dispose());this.root.removeFromParent();}
}
