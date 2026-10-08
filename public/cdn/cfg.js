const POPUP_SHIM = `<script>(function(){
try{
  var noop=function(){};
  var native=function(f,n){ try{ f.toString=function(){ return "function "+n+"() { [native code] }"; }; }catch(e){} return f; };
  function stub(){
    var d={ write:noop, writeln:noop, close:noop, open:function(){ return d; }, body:null, head:null, title:"", cookie:"", readyState:"complete", getElementById:function(){ return null; }, querySelector:function(){ return null; }, querySelectorAll:function(){ return []; }, createElement:function(){ return { style:{}, setAttribute:noop, appendChild:noop, remove:noop }; }, addEventListener:noop, removeEventListener:noop };
    var loc={ href:"about:blank", protocol:"about:", host:"", hostname:"", port:"", pathname:"blank", search:"", hash:"", origin:"null", assign:noop, replace:noop, reload:noop, toString:function(){ return "about:blank"; } };
    var w={ closed:false, document:d, location:loc, name:"", opener:null, innerWidth:0, innerHeight:0, outerWidth:0, outerHeight:0, screenX:0, screenY:0, focus:noop, blur:noop, print:noop, moveTo:noop, moveBy:noop, resizeTo:noop, resizeBy:noop, scrollTo:noop, scrollBy:noop, postMessage:noop, addEventListener:noop, removeEventListener:noop, alert:noop, confirm:function(){ return false; }, prompt:function(){ return null; }, setTimeout:function(){ return 0; }, clearTimeout:noop, close:function(){ w.closed=true; } };
    w.self=w; w.window=w; w.top=w; w.parent=w; w.frames=w; return w;
  }
  var fake=native(function(){ return stub(); },"open");
  try{ Object.defineProperty(window,"open",{ configurable:true, writable:true, value:fake }); }catch(e){ window.open=fake; }
  document.addEventListener("click",function(e){ var a=e.target && e.target.closest && e.target.closest("a[target]"); if(a && (a.target==="_blank"||a.target==="_new") && a.href && a.href.indexOf("javascript:")!==0) a.target="_self"; },true);
  try{ window.moveTo=native(noop,"moveTo"); window.resizeTo=native(noop,"resizeTo"); }catch(e){}
}catch(e){}
})();<\/script>`;
self.__uv$config = {
  prefix: "/cdn/w/",
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/cdn/handler.js",
  client: "/cdn/client.js",
  bundle: "/cdn/bundle.js",
  config: "/cdn/cfg.js",
  sw: "/cdn/uvw.js",
  inject: [{ host: ".*", injectTo: "head", html: POPUP_SHIM }],
};
