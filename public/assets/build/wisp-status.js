(function(){
  const out=document.getElementById('wisp-latency');
  if(!out)return;
  function target(){let c='';try{c=(localStorage.getItem('gl_wisp')||'').trim()}catch{}if(/^wss?:\/\//i.test(c))return c;return(location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/wisp/'}
  async function measure(){const url=target(),start=performance.now();out.textContent='measuring…';try{await new Promise((resolve,reject)=>{const ws=new WebSocket(url);const to=setTimeout(()=>{try{ws.close()}catch{}reject(new Error('timeout'))},4000);ws.onopen=()=>{clearTimeout(to);try{ws.close()}catch{}resolve()};ws.onerror=()=>{clearTimeout(to);reject(new Error('offline'))}});out.textContent=Math.max(1,Math.round(performance.now()-start))+' ms'}catch{out.textContent='offline'}}
  measure();document.addEventListener('visibilitychange',()=>{if(!document.hidden)measure()});window.addEventListener('storage',e=>{if(e.key==='gl_wisp')measure()});
})();
