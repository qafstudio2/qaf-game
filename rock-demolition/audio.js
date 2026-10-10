// Real recorded guitar and drum voices; composition and DSP are original. See credits.html.
const BASE='../ankle-breaker/samples/';
// Original stage-specific scores. Each slot is a 32nd note; null is an intentional rest.
// Reference order confirmed by user: Roadwar 2:06, People = Shit 2:35, Angel Of Death 3:55.
// Original arrangements inspired by the requested genres; these are not song transcriptions.
const classic=[
 [0,0,null,0,0,0,null,0,3,null,5,3,0,0,null,0],
 [0,0,null,0,0,0,null,0,7,5,3,2,0,0,0,null],
 [0,null,0,0,0,null,0,0,5,null,3,2,0,null,0,0],
 [0,0,null,0,3,0,null,0,7,null,5,3,2,0,0,null]
].map(bar=>bar.flatMap(p=>[p,null]));
const sourceScores=[
 {name:'CLASSIC THRASH',key:'E natural minor',root:0,accent:[0,8,16,24],gate:1.85,phrases:classic,lead:[[71,72,74,76,79,76,74,72],[76,79,81,83,84,83,81,79],[81,83,84,86,88,86,84,83]]},
 {name:'CHROMATIC ASSAULT',key:'E chromatic / tritone',root:0,accent:[0,6,12,20,28],gate:1.2,phrases:[
 [0,0,0,0,1,0,0,null,0,0,0,0,6,6,1,null,0,0,0,0,1,0,0,0,6,null,3,2,1,0,0,null],
 [0,0,1,0,0,0,6,null,0,0,1,0,0,0,3,null,6,5,3,2,1,0,0,0,0,0,1,0,6,3,1,null],
 [0,0,0,1,0,0,6,null,0,0,0,1,0,0,3,null,0,0,6,0,1,0,6,0,6,5,3,2,1,0,0,null]
 ],lead:[[71,72,73,74,77,74,73,72],[76,77,78,79,82,79,78,77],[81,82,83,84,86,84,83,82]]},
 {name:'HIGH SPEED GROOVE',key:'Low B / minor + chromatic',root:-5,accent:[0,6,14,20,26],gate:1.45,phrases:[
 [0,0,null,0,0,null,0,null,0,0,1,null,null,null,6,null,0,0,null,0,0,null,null,0,0,null,3,null,1,0,0,null],
 [0,0,0,null,null,null,0,0,null,1,0,null,null,null,6,0,0,null,0,0,null,null,0,0,3,null,1,null,0,0,0,null],
 [0,0,null,null,0,0,0,null,6,null,null,0,1,0,null,null,0,0,0,null,0,null,6,0,null,null,3,1,0,0,0,null]
 ],lead:[[71,74,76,78,79,78,76,74],[78,79,81,83,86,83,81,79],[83,86,88,90,91,90,88,86]]}
];
export const STYLES=[
 {...sourceScores[0],name:'ROAD METAL',reference:'https://youtu.be/wupHhdlF27Q?t=126'},
 {...sourceScores[2],name:'PERCUSSIVE GROOVE',reference:'https://youtu.be/qqK1FrO3BdM?t=155'},
 {...sourceScores[1],name:'EXTREME THRASH',reference:'https://youtu.be/5rJ-awAHA4k?t=235'}
];
// Four-bar drum arrangements. Each position uses the same 32nd-note clock as the guitars.
export function drumScore(stage,bar,n,pitch,solo=false){
 const hits=[],hit=(name,gain)=>hits.push({name,gain}),fill=bar%4===3&&n>=24;
 if(stage===0){
  if(n%4===0)hit('hh',n%8===0?.31:.22);
  if([8,24].includes(n)&&!fill)hit('snare',.82);
  const kick=[[0,4,6,16,20,22],[0,6,12,16,18,22,28],[0,4,14,16,20,22,30],[0,6,12,16,20]][bar%4];
  if(kick.includes(n))hit('kick',.76);
  if(n===0&&bar%2===0)hit('crash',.29);
  if(fill&&n%2===0)hit(['snare','tom-high','tom-mid','tom-low'][(n-24)/2],.65);
 }else if(stage===1){
  // Low-tuned bursts lock to the chugs, with percussion answers and alternating blast/groove bars.
  if(n%4===0)hit(bar%2===0?'crash':'hh',bar%2===0?.16:.30);
  if(n===8||n===24)hit('snare',.86);
  if([7,15,23,31].includes(n)&&!fill)hit('snare',.15);
  if(pitch!==null&&(n%2===0||[1,17].includes(n))||solo&&bar%2===1&&n%2===0)hit('kick',n%8===0?.83:.62);
  if(bar%2===0&&[6,14,20,26].includes(n))hit('tom-low',.31);
  if(solo&&bar%4===2&&[4,12,20,28].includes(n))hit('snare',.48);
  if(fill&&n%2===0)hit(['tom-low','snare','tom-mid','snare'][(n-24)/2],.69);
 }else{
  // Fast thrash: two-beat snare, sustained double kick, open cymbal accents and descending fills.
  if(n%4===0)hit(bar%2===0?'hh':'crash',bar%2===0?.31:.17);
  if([4,12,20,28].includes(n)&&!fill)hit('snare',n===12||n===28?.84:.74);
  if(n%2===0||solo&&bar%4===2&&[7,15,23].includes(n))hit('kick',n%8===0?.79:.58);
  if(n===0||bar%2===1&&n===16)hit('crash',.28);
  if(fill&&n%2===0)hit(['snare','tom-high','tom-mid','tom-low'][(n-24)/2],.72);
 }
 return hits;
}
export class Sound{
 constructor(){this.enabled=true;this.nodes=new Set();this.buffers={};this.events=[];this.serial=0;this.clock=null;this.config=[];this.mode='off';}
 async unlock(){if(!this.ctx){const c=this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=c.createGain();this.master.gain.value=.63;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=65;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6700;const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=10;comp.ratio.value=4;comp.attack.value=.006;comp.release.value=.13;this.analyser=c.createAnalyser();this.analyser.fftSize=1024;this.master.connect(hp).connect(lp).connect(comp).connect(this.analyser).connect(c.destination);this.guitar=c.createGain();this.drums=c.createGain();this.drums.gain.value=.66;this.drums.connect(this.master);const b=c.createBuffer(1,1,c.sampleRate),s=c.createBufferSource();s.buffer=b;s.connect(this.master);s.start();}await this.ctx.resume();}
 async preload(){await this.unlock();if(!this.ready)this.ready=Promise.all(['low-e-down','low-e-up','kick','snare','hh','crash','tom-high','tom-mid','tom-low'].map(async n=>{const r=await fetch(new URL(BASE+n+'.wav?v=rock-6',import.meta.url));if(!r.ok)throw Error('Missing recording '+n);this.buffers[n]=await this.ctx.decodeAudioData(await r.arrayBuffer());}));await this.ready;if(!this.buffers['sustain']){const r=await fetch(new URL('./samples/sustain.wav?v=rock-6',import.meta.url));if(!r.ok)throw Error('Missing sustained guitar recording');this.buffers.sustain=await this.ctx.decodeAudioData(await r.arrayBuffer());}for(const name of ['lead-g5','open-e2']){if(!this.buffers[name]){const r=await fetch(new URL('./samples/'+name+'.wav?v=rock-6',import.meta.url));if(!r.ok)throw Error('Missing recording '+name);this.buffers[name]=await this.ctx.decodeAudioData(await r.arrayBuffer());}}this.route(this.config);}
 route(config){this.config=config.map(p=>({...p}));if(!this.ctx)return;this.guitar.disconnect();if(this.fxLFO){try{this.fxLFO.stop();}catch{}this.nodes.delete(this.fxLFO);this.fxLFO=null;}if(this.fx){for(const n of this.fx)try{n.disconnect();}catch{}}this.fx=[];const c=this.ctx;let head=this.guitar;const link=n=>{head.connect(n);this.fx.push(n);head=n;};for(const p of config){if(!p.on)continue;const a=p.amount/100,dirty=['fuzz','muff','dirtyrat'].includes(p.id),level=['metalarea','dirtyrat'].includes(p.id)?3:['distortion','muff'].includes(p.id)?2:1;
  if(['drive','distortion','metalarea','fuzz','muff','dirtyrat'].includes(p.id)){const pre=c.createGain(),shape=c.createWaveShaper(),tone=c.createBiquadFilter(),post=c.createGain();pre.gain.value=dirty?1.4+a*(3+level*2):.6+a*(1.5+level*1.2);const curve=new Float32Array(2048),k=dirty?4+a*(5+level*3):1.3+a*(2+level*1.5);for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(x*k)/Math.tanh(k);}shape.curve=curve;shape.oversample='2x';tone.type='lowpass';tone.frequency.value=dirty?2800+a*1200:3900+a*1000;post.gain.value=dirty?.52:.60;link(pre);link(shape);link(tone);link(post);}
  if(p.id==='echo'){const input=c.createGain(),output=c.createGain(),delay=c.createDelay(1),feedback=c.createGain(),wet=c.createGain(),tone=c.createBiquadFilter();delay.delayTime.value=60/158*.75;feedback.gain.value=.15+a*.42;wet.gain.value=.04+a*.42;tone.type='lowpass';tone.frequency.value=2900;head.connect(input);input.connect(output);input.connect(delay);delay.connect(tone);tone.connect(wet).connect(output);tone.connect(feedback).connect(delay);this.fx.push(input,output,delay,feedback,wet,tone);head=output;}
  if(p.id==='space'){const input=c.createGain(),out=c.createGain(),verb=c.createConvolver(),wet=c.createGain(),hp=c.createBiquadFilter();const duration=.30+a*1.1,ir=c.createBuffer(2,Math.floor(c.sampleRate*duration),c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);let prior=0;for(let i=0;i<d.length;i++){prior=prior*.6+(Math.random()*2-1)*.4;d[i]=prior*Math.pow(1-i/d.length,2.8);}}verb.buffer=ir;wet.gain.value=.05+a*.3;hp.type='highpass';hp.frequency.value=260;head.connect(input);input.connect(out);input.connect(verb).connect(hp).connect(wet).connect(out);this.fx.push(input,out,verb,wet,hp);head=out;}
  if(p.id==='eq'){const low=c.createBiquadFilter(),mid=c.createBiquadFilter();low.type='lowshelf';low.frequency.value=170;low.gain.value=a*5;mid.type='peaking';mid.frequency.value=850;mid.Q.value=.8;mid.gain.value=-2-a*4;link(low);link(mid);}
  if(['comp','midboost','bomboost'].includes(p.id)){const comp=c.createDynamicsCompressor(),g=c.createGain();comp.threshold.value=-10-a*18;comp.ratio.value=2+a*6;comp.attack.value=.012;comp.release.value=.12;g.gain.value=1.1+a*(p.id==='bomboost'?.65:.3);link(comp);if(p.id!=='comp'){const mid=c.createBiquadFilter();mid.type='peaking';mid.frequency.value=p.id==='midboost'?1100:600;mid.Q.value=.65;mid.gain.value=2+a*5;link(mid);}link(g);}}
 for(const p of config){if(!p.on)continue;const a=p.amount/100;if(p.id==='wah'){const filter=c.createBiquadFilter(),lfo=c.createOscillator(),depth=c.createGain();filter.type='bandpass';filter.frequency.value=1600;filter.Q.value=.6;lfo.frequency.value=1.8+a*3;depth.gain.value=1100;lfo.connect(depth).connect(filter.frequency);link(filter);lfo.start();this.nodes.add(lfo);this.fx.push(depth);this.fxLFO=lfo;}if(p.id==='feedback'){const d=c.createDelay(.8),g=c.createGain(),f=c.createBiquadFilter(),out=c.createGain();d.delayTime.value=.19;g.gain.value=.12+a*.42;f.type='lowpass';f.frequency.value=2600;head.connect(out);head.connect(d).connect(f).connect(g).connect(out);g.connect(d);this.fx.push(d,g,f,out);head=out;}}if(this.stage>0){const bite=c.createBiquadFilter();bite.type='peaking';bite.frequency.value=this.stage===2?1800:850;bite.Q.value=.8;bite.gain.value=this.stage===2?1.3:-2.5;link(bite);}head.connect(this.master);}
 play(name,t,gain=1,semitones=0,duration=null,bass=false){if(!this.enabled||!this.buffers[name])return;const c=this.ctx,s=c.createBufferSource(),g=c.createGain();s.buffer=this.buffers[name];s.playbackRate.value=2**(semitones/12);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain,t+.002);if(duration){g.gain.setValueAtTime(gain,t+duration*.62);g.gain.exponentialRampToValueAtTime(.001,t+duration);}if(name==='lead-g5'){s.detune.setValueAtTime(-8,t);s.detune.linearRampToValueAtTime(0,t+.007);if(duration>.2){s.detune.setValueAtTime(0,t+duration*.4);s.detune.linearRampToValueAtTime(130,t+duration*.75);s.detune.linearRampToValueAtTime(75,t+duration);}}s.connect(g);if(bass){const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=320;g.connect(filter).connect(this.master);s.onended=()=>{this.nodes.delete(s);filter.disconnect();g.disconnect();};}else{g.connect(name.startsWith('low-e')||['sustain','lead-g5','open-e2'].includes(name)?this.guitar:this.drums);s.onended=()=>{this.nodes.delete(s);g.disconnect();};}this.nodes.add(s);s.start(t);if(duration)s.stop(t+duration+.02);this.events.push({name,t,semitones,gain});if(this.events.length>250)this.events.shift();}
 sequence({kind='show',variation=0,stage=0,onNote=()=>{},onFinish=()=>{}}={}){this.stop();if(!this.ctx)return;this.stage=stage;this.route(this.config);const profile=STYLES[stage];const token=this.serial,c=this.ctx,bpm=[160,184,212][stage],step=7.5/bpm,count=kind==='show'?[128,160,192][stage]:kind==='preview'?64:128,quiet=kind==='ambient'?.22:1;this.mode=kind;this.guitar.gain.value=quiet*.76;this.drums.gain.value=quiet*.62;let next=0,from=c.currentTime+.07,emitted=0;const notes=[];this.lastSequence={kind,stage,bpm,soloNotes:0,riffNotes:0,style:profile.name,reference:profile.reference,key:profile.key,duration:count*step+.15,soloStarts:32*step,soloRate:stage===0?bpm/15:stage===1?bpm/10:bpm/7.5};
 const soloRuns=profile.lead;
 const pump=()=>{if(token!==this.serial||document.hidden)return;const now=c.currentTime;while(next<count&&from+next*step<now+.18){const index=next++,t=from+index*step,bar=Math.floor(index/32),n=index%32,slot=Math.floor(n/2),solo=kind==='show'&&bar>=1,is16=n%2===0,phrase=profile.phrases[(variation+bar)%profile.phrases.length],pitch=phrase[n],guitar=kind!=='ambient',accent=profile.accent.includes(n);
 if(guitar&&pitch!==null){const open=stage===0&&n===24&&bar%2===1;this.play(open?'open-e2':index%4===0?'low-e-down':'low-e-up',t,solo?.36:accent?.76:.64,pitch+profile.root,open?.14:Math.min(.12,step*profile.gate));if(n%8===0)this.play('sustain',t,.18,pitch+profile.root-12,.26,true);if(this.config.some(p=>p.on&&p.id==='octave'))this.play('low-e-down',t,.18,pitch+profile.root-12,.18);notes.push({t,index,pitch:pitch+profile.root,accent,solo:false});this.lastSequence.riffNotes++;}
 if(guitar&&solo&&(stage===0?is16:stage===1?n%4!==2:true)){const soloProgress=Math.max(0,Math.min(1,(index-32)/(count-33))),band=Math.min(2,Math.floor(soloProgress*3)),run=soloRuns[band],last=index>count-5,midi=last?[83,86,91][stage]:Math.min([83,86,91][stage],run[(index-32)%run.length]);if(this.lastSequence.firstSoloMidi===undefined)this.lastSequence.firstSoloMidi=midi;this.lastSequence.lastSoloMidi=midi;this.lastSequence.soloPosition=soloProgress;this.play('lead-g5',t,last?.35:.22+soloProgress*.08+(index%3)*.012,midi-79,last?.20:step*(stage===0?1.8:1.25));notes.push({t,index,pitch:midi,accent,solo:true,soloProgress});this.lastSequence.soloNotes++;}
 for(const hit of drumScore(stage,bar,n,pitch,solo))this.play(hit.name,t,hit.gain);}

 while(emitted<notes.length&&notes[emitted].t<=now){onNote({...notes[emitted++],kind});}if(next===count&&now>from+count*step+.12){clearInterval(this.clock);this.clock=null;this.mode='off';onFinish();return;}};this.clock=setInterval(pump,20);pump();return count*step+.22;}
 boom(stage=0){if(!this.enabled||!this.ctx)return;const c=this.ctx,t=c.currentTime,strength=.9+stage*.16;this.lastBoom={hits:1,duration:1.8,stage};const layers=[{length:.38,cutoff:2400,gain:.54,decay:.075},{length:1.8,cutoff:440,gain:1.1,decay:.48},{length:1.3,cutoff:1300,gain:.22,decay:.35}];for(const layer of layers){const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*layer.length),c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const age=i/c.sampleRate,roll=.72+Math.sin(age*31)*.12+Math.sin(age*57)*.1;data[i]=(Math.random()*2-1)*Math.exp(-age/layer.decay)*roll;}const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=layer.cutoff;gain.gain.value=layer.gain*strength;source.connect(filter).connect(gain).connect(this.master);this.nodes.add(source);source.onended=()=>{this.nodes.delete(source);filter.disconnect();gain.disconnect();};source.start(t);}const body=c.createOscillator(),env=c.createGain();body.type='sine';body.frequency.setValueAtTime(118,t);body.frequency.exponentialRampToValueAtTime(48,t+.65);env.gain.setValueAtTime(.0001,t);env.gain.linearRampToValueAtTime(strength*.6,t+.012);env.gain.exponentialRampToValueAtTime(.001,t+1.2);body.connect(env).connect(this.master);this.nodes.add(body);body.onended=()=>{this.nodes.delete(body);env.disconnect();};body.start(t);body.stop(t+1.25);}
 impact(strength=1){if(!this.enabled||!this.ctx)return;const c=this.ctx,t=c.currentTime,b=c.createBuffer(1,c.sampleRate*.3,c.sampleRate),data=b.getChannelData(0);let z=0;for(let i=0;i<data.length;i++){z=z*.82+(Math.random()*2-1)*.18;data[i]=z*Math.exp(-i/(c.sampleRate*.065));}const s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=.3*strength;s.connect(g).connect(this.master);this.nodes.add(s);s.onended=()=>{this.nodes.delete(s);g.disconnect();};s.start(t);}
 stop(){this.serial++;clearInterval(this.clock);this.clock=null;for(const n of this.nodes)try{n.stop();}catch{}this.nodes.clear();if(this.guitar){this.guitar.disconnect();for(const n of this.fx||[])try{n.disconnect();}catch{}this.fx=[];}this.mode='off';}
 level(){if(!this.analyser)return 0;const d=new Float32Array(this.analyser.fftSize);this.analyser.getFloatTimeDomainData(d);return Math.sqrt(d.reduce((s,v)=>s+v*v,0)/d.length);}
 dispose(){this.stop();this.ctx?.close();}
}
