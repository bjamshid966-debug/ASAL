(function(){
const TYPES=[
{n:"Paxta asali",s:"yoz",c:"#f0c14b",d:"Och sariq, yengil, tez qotadi. Iyul–avgust.",m:"Qaymoqsimon, yumshoq maza. Choy va sutga mos.",k:"Vodiy"},
{n:"Yantoq asali",s:"yoz",c:"#d98b2b",d:"Cho'l yantog'idan; to'q tillarang, xushbo'y.",m:"Biroz achchiqroq, uzoq saqlanadi.",k:"Cho'l chekkasi"},
{n:"Tog' gul asali",s:"bahor",c:"#b9722a",d:"Yovvoyi o'tlar va tog' gullaridan, may–iyun.",m:"Ko'p qirrali, o'tsimon hid.",k:"Tog' etagi"},
{n:"Akatsiya asali",s:"bahor",c:"#f4dd8e",d:"Deyarli shaffof, uzoq vaqt suyuq turadi.",m:"Nozik, shirin, bolalar uchun yaxshi.",k:"Vodiy"},
{n:"Kuzgi o'tlar asali",s:"kuz",c:"#8a5522",d:"Sentyabr–oktyabr, to'q jigarrang.",m:"Quyuq, mazasi boy; qishga zahira.",k:"Tog' etagi"},
{n:"Jiyda asali",s:"bahor",c:"#e3b04b",d:"Jiyda gulidan, aprel oxiri; kam yig'iladi.",m:"Xushbo'y, o'ziga xos shirin hid.",k:"Vodiy"}
];
const grid=document.getElementById('grid'),sel=document.getElementById('typeSel');
function render(f){
 grid.innerHTML='';
 TYPES.filter(t=>f==='all'||t.s===f).forEach(t=>{
  const b=document.createElement('button');b.className='card';b.style.setProperty('--c',t.c);
  b.innerHTML='<h3>'+t.n+'</h3><p>'+t.d+'</p><p class="more">'+t.m+'</p><div class="meta">'+t.s+' · '+t.k+'</div>';
  b.onclick=()=>b.classList.toggle('open');grid.appendChild(b);
 });
}
render('all');
TYPES.forEach(t=>sel.add(new Option(t.n,t.n)));
document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{
 document.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');render(c.dataset.f);
});

/* scroll-driven jar */
const fill=document.getElementById('fill'),pct=document.getElementById('pct'),steps=[...document.querySelectorAll('.steps li')];
function onScroll(){
 let p=0;
 steps.forEach(li=>{const r=li.getBoundingClientRect();if(r.top<innerHeight*.6){li.classList.add('on');p=+li.dataset.p}else li.classList.remove('on')});
 fill.style.height=p+'%';pct.textContent=p+'%';
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* calculator */
const $=id=>document.getElementById(id);
function calc(){
 const h=+$('hives').value,m=+$('months').value,r=+$('region').value;
 $('o1').textContent=h;$('o2').textContent=m;
 const kg=Math.round(h*m*4.2*r);
 $('kg').textContent=kg;
 $('jars').textContent='≈ '+Math.round(kg*2)+' ta 500 g lik banka';
}
['hives','months','region'].forEach(i=>$(i).addEventListener('input',calc));calc();

/* form */
$('form').addEventListener('submit',e=>{
 e.preventDefault();let ok=true;const f=e.target;
 const rules={name:v=>v.trim().length>=2||"Ismni kiriting (kamida 2 harf)",
  phone:v=>/^\+?998[\d\s-]{9,}$/.test(v.replace(/\s/g,'').replace(/-/g,''))&&v.replace(/\D/g,'').length===12||"Telefon +998 bilan 12 raqam bo'lishi kerak",
  qty:v=>(+v>=1&&+v<=50)||"1 dan 50 gacha son kiriting"};
 Object.keys(rules).forEach(k=>{
  const el=f.elements[k],res=rules[k](el.value),msg=res===true?'':res;
  el.classList.toggle('bad',!!msg);el.parentElement.querySelector('em').textContent=msg;if(msg)ok=false;
 });
 $('ok').textContent=ok?'Rahmat, '+f.elements.name.value.trim()+'! Buyurtmangiz qabul qilindi, tez orada qo\'ng\'iroq qilamiz.':'';
 if(ok)f.reset();
});

/* honeycomb canvas */
const cv=$('comb'),cx=cv.getContext('2d');
let W,H,R=34,cells=[],bees=[],mx=-999,my=-999,t=0;
const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
function hexPath(x,y,r){cx.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i+Math.PI/6;cx[i?'lineTo':'moveTo'](x+r*Math.cos(a),y+r*Math.sin(a))}cx.closePath()}
function resize(){
 const d=devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);
 R=W<600?24:34;cells=[];const w=Math.sqrt(3)*R,h=1.5*R;
 for(let r=0,y=0;y<H+R;r++,y+=h)for(let x=(r%2)*w/2;x<W+w;x+=w)cells.push({x,y,f:still?.6:Math.random()*.15});
 bees=Array.from({length:14},()=>({x:Math.random()*W,y:Math.random()*H,a:Math.random()*6.28,s:.8+Math.random()}));
}
function move(e){const b=cv.getBoundingClientRect(),p=e.touches?e.touches[0]:e;mx=p.clientX-b.left;my=p.clientY-b.top}
addEventListener('mousemove',move);addEventListener('touchmove',move,{passive:true});
function draw(){
 t+=.02;cx.clearRect(0,0,W,H);
 cells.forEach(c=>{
  const d=Math.hypot(c.x-mx,c.y-my);
  if(!still){if(d<130)c.f=Math.min(1,c.f+.04);else c.f=Math.max(.04,c.f-.003)}
  const r=R-3;
  hexPath(c.x,c.y,r);cx.fillStyle='rgba(42,29,17,.9)';cx.fill();
  if(c.f>0.03){
   cx.save();hexPath(c.x,c.y,r);cx.clip();
   const top=c.y+r-(2*r*c.f);
   cx.fillStyle='hsl('+(36+c.f*8)+',90%,'+(38+c.f*14)+'%)';
   cx.beginPath();cx.moveTo(c.x-r,top);
   for(let i=0;i<=8;i++)cx.lineTo(c.x-r+i*r/4,top+Math.sin(t*2+c.x*.05+i)*1.5);
   cx.lineTo(c.x+r,c.y+r);cx.lineTo(c.x-r,c.y+r);cx.fill();cx.restore();
  }
  hexPath(c.x,c.y,r);cx.strokeStyle='#8a5522';cx.lineWidth=2;cx.stroke();
 });
 if(!still)bees.forEach(b=>{
  b.a+=(Math.random()-.5)*.5;b.x+=Math.cos(b.a)*b.s*1.6;b.y+=Math.sin(b.a)*b.s*1.6;
  if(b.x<0)b.x=W;if(b.x>W)b.x=0;if(b.y<0)b.y=H;if(b.y>H)b.y=0;
  cx.fillStyle='#eba81c';cx.beginPath();cx.ellipse(b.x,b.y,5,3.2,b.a,0,6.28);cx.fill();
  cx.fillStyle='#1b130c';cx.fillRect(b.x-1,b.y-3,2,6);
  cx.fillStyle='rgba(243,226,181,.6)';cx.beginPath();cx.ellipse(b.x-1,b.y-4,3,2,0,0,6.28);cx.fill();
 });
 if(!still)requestAnimationFrame(draw);
}
addEventListener('resize',resize);resize();draw();if(still)draw();
})();
