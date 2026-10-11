// Original phrases follow the approved C-major Suno workshop track.
const tuning=[40,45,50,55,59,64];
const chords={Em:[0,2,2,0,0,0],G:[3,2,0,0,3,3],F:[1,3,3,2,1,1],C:[null,3,2,0,1,0],Am:[null,0,2,2,1,0],Dm:[null,null,0,2,3,1]};
const scores=[
 {name:'工坊晨光',chords:['C','F','G','C'],order:[0,2,3,4,5,4,3,2],rhythm:[0,1,2,3,4,5,6,7]},
 {name:'口袋搖滾',chords:['C','Am','Dm','C'],order:[0,0,3,2,4,5,3,4],rhythm:[0,.7,2,3,4,5,6,7.3]},
 {name:'窗邊和弦',chords:['C','Dm','F','C'],order:[2,3,5,4,3,2,4,5],rhythm:[0,1,2,3,4,5,6,7]},
 {name:'夜班小步',chords:['C','G','Em','C'],order:[1,3,4,2,5,4,3,2],rhythm:[0,1,2,3.3,4,5,6,7]},
 {name:'收工之前',chords:['C','F','Am','C'],order:[0,2,4,5,3,5,4,2],rhythm:[0,1,2,3,4,4.7,6,7]}
];
export function phrase(index){const score=scores[index%5],events=[],step=.161;score.chords.forEach((name,bar)=>{const fingering=chords[name],valid=fingering.map((f,s)=>f===null?null:s).filter(s=>s!==null);score.order.forEach((string,i)=>{if(fingering[string]===null)string=valid[0];events.push({time:(bar*8+score.rhythm[i])*step,midi:tuning[string]+fingering[string],string,fret:fingering[string],finger:Math.min(3,Math.max(0,fingering[string]-1)),chord:name,fingering,handFret:Math.min(...fingering.filter(f=>f>0)),duration:i===7?.28:.31,accent:i===0||i===4?1:.78});});});return{name:score.name,key:'C major',events,duration:5.88};}
