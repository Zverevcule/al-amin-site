(function(){
'use strict';
var SVGNS='http://www.w3.org/2000/svg';
var BOOL={checked:1,disabled:1,selected:1,required:1,multiple:1,readonly:1,hidden:1};
var HOLE=/\{\{\s*([^}]+?)\s*\}\}/g, WHOLE=/^\{\{\s*([^}]+?)\s*\}\}$/;
function look(path,scope){
  if(path==='true')return true; if(path==='false')return false; if(path==='null')return null;
  if(/^-?\d+(\.\d+)?$/.test(path))return parseFloat(path);
  var parts=path.split('.'),v=scope[parts[0]];
  for(var i=1;i<parts.length;i++){ if(v==null)return undefined; v=v[parts[i]]; }
  return v;
}
function interp(s,scope){ return s.replace(HOLE,function(_,p){var v=look(p,scope);return v==null?'':String(v);}); }
function resolveImg(v){ if(typeof v==='string'&&v.indexOf('img:')===0){ return (window.IMG&&window.IMG[v.slice(4)])||''; } return v; }
function build(node,scope,out){
  var ch=node.childNodes;
  for(var i=0;i<ch.length;i++){
    var n=ch[i];
    if(n.nodeType===3){ var t=n.nodeValue; out.push({x:t.indexOf('{{')>-1?interp(t,scope):t}); continue; }
    if(n.nodeType!==1)continue;
    if(n.localName==='template'){
      var kind=n.getAttribute('data-sc');
      if(kind==='for'){
        var m=WHOLE.exec(n.getAttribute('list')||''); var list=m?look(m[1],scope):null; var as=n.getAttribute('as')||'item';
        if(list&&list.length){ for(var j=0;j<list.length;j++){ var s2=Object.create(scope); s2[as]=list[j]; s2.$index=j; build(n.content,s2,out); } }
      } else if(kind==='if'){
        var m2=WHOLE.exec(n.getAttribute('value')||''); var c=m2?look(m2[1],scope):false;
        if(c) build(n.content,scope,out);
      }
      continue;
    }
    var p={},at=n.attributes;
    for(var k=0;k<at.length;k++){
      var a=at[k],nm=a.name,val=a.value;
      if(nm.indexOf('hint-')===0)continue;
      var w=WHOLE.exec(val),v;
      if(w)v=look(w[1],scope); else if(val.indexOf('{{')>-1)v=interp(val,scope); else v=(val===''&&BOOL[nm])?true:val;
      if(nm==='data-ref'){ p['src']=resolveImg(v); continue; }
      p[nm]=v;
    }
    var kids=[]; build(n,scope,kids);
    out.push({t:n.localName,svg:n.namespaceURI===SVGNS,p:p,c:kids});
  }
  return out;
}
function evName(el,nm){ var e=nm.slice(2); if(e==='change'&&(el.localName==='textarea'||(el.localName==='input'&&!/^(checkbox|radio|file)$/.test(el.type))))e='input'; return e; }
function setProp(el,nm,v,old){
  if(nm.indexOf('on')===0&&(typeof v==='function'||typeof old==='function')){
    var e=evName(el,nm); el._h=el._h||{};
    if(!el._h[e]){ el._h[e]=v; el.addEventListener(e,function(ev){ var f=el._h[ev.type]; if(f)f(ev); }); }
    el._h[e]=v; return;
  }
  if(nm==='value'){ if(el.value!==String(v==null?'':v))el.value=v==null?'':v; return; }
  if(BOOL[nm]&&nm!=='readonly'){ el[nm]=!!v; return; }
  if(v==null||v===false){ el.removeAttribute(nm); return; }
  el.setAttribute(nm,v===true?'':String(v));
}
function create(v,svg){
  if(v.x!==undefined)return document.createTextNode(v.x);
  var isSvg=svg||v.svg||v.t==='svg';
  var el=isSvg?document.createElementNS(SVGNS,v.t):document.createElement(v.t);
  var val;
  for(var k in v.p){ if(k==='value'){val=v.p[k];continue;} setProp(el,k,v.p[k]); }
  for(var i=0;i<v.c.length;i++)el.appendChild(create(v.c[i],isSvg&&v.t!=='foreignObject'));
  if(val!==undefined)setProp(el,'value',val);
  el._v=v; return el;
}
function patchChildren(parent,oldC,newC,svg){
  var nodes=parent.childNodes,i;
  for(i=0;i<newC.length;i++){
    var o=oldC[i],n=newC[i],dom=nodes[i];
    if(!o||!dom){ parent.appendChild(create(n,svg)); continue; }
    if((o.x!==undefined)!==(n.x!==undefined)||o.t!==n.t){ parent.replaceChild(create(n,svg),dom); continue; }
    if(n.x!==undefined){ if(o.x!==n.x)dom.nodeValue=n.x; continue; }
    var k;
    for(k in o.p){ if(!(k in n.p))setProp(dom,k,null,o.p[k]); }
    for(k in n.p){ if(k!=='value'&&o.p[k]!==n.p[k])setProp(dom,k,n.p[k],o.p[k]); else if(k!=='value'&&typeof n.p[k]==='function')setProp(dom,k,n.p[k],o.p[k]); }
    var isSvg=svg||n.svg||n.t==='svg';
    patchChildren(dom,o.c,n.c,isSvg&&n.t!=='foreignObject');
    if('value' in n.p)setProp(dom,'value',n.p.value);
  }
  while(parent.childNodes.length>newC.length)parent.removeChild(parent.lastChild);
}
function DCLogic(props){ this.props=props||{}; this.state={}; }
DCLogic.prototype.setState=function(p){
  if(this._dead)return;
  if(typeof p==='function')p=p(this.state,this.props);
  this.state=Object.assign({},this.state,p);
  var self=this; if(!self._q){ self._q=true; Promise.resolve().then(function(){ self._q=false; self._render(); }); }
};
DCLogic.prototype.forceUpdate=function(){ this._render(); };
DCLogic.prototype._render=function(){
  if(this._dead||!this._root)return;
  var vals=this.renderVals?this.renderVals():{};
  var tree=build(this._tpl.content,vals,[]);
  patchChildren(this._root,this._tree||[],tree,false);
  this._tree=tree;
};
window.DCLogic=DCLogic;
var cur=null,curName=null,styleEl=null,root=null;
function mount(name){
  var P=window.PAGES[name]; if(!P){ name='Home'; P=window.PAGES.Home; }
  if(cur){ cur._dead=true; try{ cur.componentWillUnmount&&cur.componentWillUnmount(); }catch(e){console.error(e);} }
  root.innerHTML='';
  styleEl.textContent=window.PAGE_CSS[name];
  var meta=window.PAGE_META[name]; document.documentElement.lang=meta.lang; document.title=meta.title;
  var C=P.cls, inst=new C({}); inst._tpl=document.getElementById('tpl-'+name); inst._root=root;
  cur=inst; curName=name; window.scrollTo(0,0);
  inst._render();
  try{ inst.componentDidMount&&inst.componentDidMount(); }catch(e){console.error(e);}
}
function route(){ var h=location.hash.replace(/^#\/?/,''); return window.PAGES[h]?h:'Home'; }
function go(n){ if(location.hash==='#'+n)mount(n); else location.hash=n; }
document.addEventListener('click',function(ev){
  if(ev.defaultPrevented||ev.button!==0||ev.metaKey||ev.ctrlKey)return;
  var a=ev.target.closest&&ev.target.closest('a[href]'); if(!a)return;
  var href=a.getAttribute('href');
  var m=/^\/?([\w-]+)\.dc\.html$/.exec(href);
  if(m){ ev.preventDefault(); setTimeout(function(){ go(m[1]); },0); return; }
  if(href==='#'){ ev.preventDefault(); return; }
  if(href.charAt(0)==='#'&&window.PAGES[href.slice(1)]){ ev.preventDefault(); setTimeout(function(){ go(href.slice(1)); },0); return; }
  if(href.charAt(0)==='#'){ ev.preventDefault(); var t=document.getElementById(href.slice(1)); if(t)t.scrollIntoView({behavior:'smooth',block:'start'}); }
},true);
window.addEventListener('hashchange',function(){ var n=route(); if(n!==curName)mount(n); });
window.addEventListener('DOMContentLoaded',function(){
  styleEl=document.getElementById('page-css'); root=document.getElementById('app');
  mount(route());
});
})();