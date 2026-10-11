'use strict';
// Progress is the mean of registered resources: download (90%) + decode/prepare (10%).
// Register the complete startup set before fetching so the total cannot jump backwards.
class QAFAssetLoader {
  constructor(element) {
    this.element=element; this.entries=new Map(); this.cache=new Map();
    this.onchange=()=>{}; this.onaction=()=>{}; this.locked=false; this.enabled=true;
    element?.querySelector('button')?.addEventListener('click',()=>this.onaction());
  }
  static mayAutoplay(){return window.top===window || /[?&]embed=friend(?:&|$)/.test(document.referrer);}
  key(url){return new URL(url,document.baseURI).href;}
  add(url){const key=this.key(url);if(!this.entries.has(key))this.entries.set(key,{value:0,error:false});return url;}
  get status(){const entries=[...this.entries.values()],complete=entries.length>0&&entries.every(e=>e.value===1&&!e.error),failed=entries.some(e=>e.error);return {complete,failed,percent:complete?100:Math.min(99,Math.floor(entries.reduce((n,e)=>n+e.value,0)/Math.max(1,entries.length)*100))};}
  mark(url,value,error=false){const item=this.entries.get(this.key(url));if(item){item.value=value;item.error=error;this.render();}}
  audioLocked(value,enabled=this.enabled){this.locked=value;this.enabled=enabled;this.render();}
  render(){const s=this.status,el=this.element;if(el){const text=el.querySelector('.asset-label'),bar=el.querySelector('[role="progressbar"]'),action=el.querySelector('button');text.textContent=(s.failed?'載入未完成':s.complete?'準備完成':'素材載入')+' '+s.percent+'%';bar.setAttribute('aria-valuenow',String(s.percent));bar.firstElementChild.style.width=s.percent+'%';action.hidden=!(s.failed||this.locked||s.complete);action.textContent=s.failed?'點一下繼續載入':this.locked&&this.enabled?'點一下開啟音樂':this.enabled?'音效 ON':'音效 OFF';}this.onchange(s);}
  async read(url,prepare){
    const key=this.key(url);if(this.cache.has(key))return this.cache.get(key);
    const task=(async()=>{try{
      this.mark(url,0);const response=await fetch(url);if(!response.ok)throw Error('Asset '+response.status);
      let bytes;const total=Number(response.headers.get('content-length'));
      if(response.body?.getReader){const reader=response.body.getReader(),chunks=[];let received=0;while(true){const{done,value}=await reader.read();if(done)break;chunks.push(value);received+=value.length;if(total>0)this.mark(url,.9*Math.min(received/total,1));}bytes=new Uint8Array(received);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}}
      else bytes=new Uint8Array(await response.arrayBuffer());
      this.mark(url,.9);const result=await prepare(bytes.buffer);this.mark(url,1);return result;
    }catch(error){const previous=this.entries.get(key)?.value||0;this.mark(url,previous,true);this.cache.delete(key);throw error;}})();
    this.cache.set(key,task);return task;
  }
  audio(context,url){return this.read(url,bytes=>context.decodeAudioData(bytes));}
  json(url,prepare){return this.read(url,async bytes=>{const data=JSON.parse(new TextDecoder().decode(bytes));await prepare(data);return data;});}
}
