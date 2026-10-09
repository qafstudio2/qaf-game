const vm=require('vm'),fs=require('fs'),assert=require('assert/strict');
const code=fs.readFileSync(__dirname+'/game-stats.js','utf8');
function setup(endpoint='https://counts.test',result={counts:{aii:4,hdmi:2}}){
 let requests=[];const labels=[{dataset:{playCount:'aii'},textContent:''}];const handlers={};
 const window={QAF_GAME_STATS_CONFIG:{endpoint},addEventListener:(n,f)=>handlers[n]=f,dispatchEvent:()=>{}};
 const document={readyState:'loading',addEventListener:()=>{},querySelectorAll:s=>s==='iframe'?[]:labels};
 const context={window,document,parent:window,location:{origin:'https://qafstudio2.github.io'},Map,Set,Number,Intl,Event,AbortController,setTimeout,clearTimeout,crypto:require('crypto').webcrypto,fetch:async(u,o)=>{requests.push({u,o});return{ok:true,json:async()=>result}}};vm.runInNewContext(code,context);return{api:window.QAFGameStats,requests,labels,handlers};
}
(async()=>{let n=0;const s=setup();await s.api.refresh();assert.equal(s.api.count('aii'),4);n++;
await s.api.start('aii');await s.api.start('aii');assert.equal(s.requests.filter(x=>x.o.method==='POST').length,1);n++;
s.api.end('aii');await s.api.start('aii');assert.equal(s.requests.filter(x=>x.o.method==='POST').length,2);n++;
const body=JSON.parse(s.requests.at(-1).o.body);assert.deepEqual(Object.keys(body).sort(),['eventId','gameId']);n++;
await s.api.start('unknown');assert.equal(s.requests.length,3);n++;
const off=setup('');await off.api.refresh();await off.api.start('aii');assert.equal(off.requests.length,0);assert.equal(off.labels[0].textContent,'遊玩次數：尚未啟用');n++;
const invalid=setup('https://counts.test',{counts:{aii:-1,hdmi:'99'}});await invalid.api.refresh();assert.equal(invalid.api.count('aii'),undefined);n++;
s.handlers.message({origin:'https://evil.test',data:{namespace:'qaf-game-stats',type:'updated'}});assert.equal(s.requests.length,3);n++;
const html=fs.readFileSync(__dirname+'/index.html','utf8');assert(html.includes('發布日期：新到舊')&&html.includes('遊玩次數：多到少'));n++;
assert(html.includes('v.el.style.order=i'));n++;
fs.writeFileSync(__dirname+'/logic-test-results.json',JSON.stringify({passed:n,visualBrowserTest:'blocked: socket Operation not permitted',backendTests:7},null,2));console.log(n+' logic checks passed');})().catch(e=>{console.error(e);process.exit(1)});
