import {ICONS,DEFAULT_SETTINGS,DEFAULT_SLIDES,DEFAULT_PILLARS,DEFAULT_PROGRAMMES,DEFAULT_GALLERY} from './defaults.js';

const SEL='.hslide img,.pol img';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paras=t=>String(t||'').split(/\n{2,}/).map(p=>p.trim()).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');
const byOrder=(a,b)=>(a.order??0)-(b.order??0);
const used=new Set();
const fresh=u=>{if(!u||used.has(u))return false;used.add(u);return true};
const okMail=e=>/^\S+@\S+\.\S+$/.test(e);
const fmtN=n=>(+n).toLocaleString('en-GH',{minimumFractionDigits:Number.isInteger(+n)?0:2,maximumFractionDigits:2});
const fmt=n=>'GH₵'+fmtN(n);
const fmtH=n=>`<span class="cur">GH₵</span><span class="num">${fmtN(n)}</span>`;

let S={...DEFAULT_SETTINGS},programmes=DEFAULT_PROGRAMMES;
let db=null,FS=null;
const fb=window.LCF_CONFIG?.firebase;

function renderText(){
 $('#mission').textContent=S.mission;$('#vision').textContent=S.vision;
 $('#supportIntro').textContent=S.supportIntro;
 $('#founderName').textContent=S.founderName;$('#founderRole').textContent=S.founderRole;
 $('#founderBio').innerHTML=paras(S.founderBio);$('#founderQuote').textContent=S.founderQuote;
 const ph=$('#founderPhoto');if(S.founderPhoto&&ph.getAttribute('src')!==S.founderPhoto)ph.src=S.founderPhoto;
 $('#tagline').textContent=S.tagline;$('#yr').textContent=new Date().getFullYear();
 const links=[['Facebook',S.facebook],['Instagram',S.instagram],['TikTok',S.tiktok],['X',S.x]].filter(l=>l[1]);
 $('#social').innerHTML=links.map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${n}</a>`).join('');
 $('#chips').innerHTML=String(S.amounts).split(',').map(a=>+a.trim()).filter(a=>a>0).slice(0,5).map(a=>`<button type="button" class="chip" data-amt="${a}">${fmtH(a)}</button>`).join('')+'<button type="button" class="chip" data-other>Other</button>';
 renderNext();
 syncDonate();
}
const IC={
 date:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
 time:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 place:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
};
function parseClock(t){
 t=String(t||'');
 let m=t.match(/(\d{1,2})(?:[:.](\d{2}))?\s*([ap])\.?m\b/i);
 if(m){let h=+m[1]%12;if(/p/i.test(m[3]))h+=12;return [h,+(m[2]||0)]}
 m=t.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
 return m?[+m[1],+m[2]]:null;
}
function niceTime(t){
 const x=String(t||'').trim();
 if(!/^\d{1,2}(?:[:.]\d{2})?\s*(?:[ap]\.?m\.?)?$/i.test(x))return x;
 const c=parseClock(x);if(!c)return x;
 return (c[0]%12||12)+':'+String(c[1]).padStart(2,'0')+' '+(c[0]<12?'AM':'PM');
}
function renderNext(){
 const box=$('#next'),on=S.nextOn&&String(S.nextTitle||'').trim();
 let d=null,left=null;
 if(/^\d{4}-\d{2}-\d{2}$/.test(S.nextDate||'')){const [y,m,dd]=S.nextDate.split('-').map(Number);d=new Date(y,m-1,dd);const t=new Date();left=Math.round((d-new Date(t.getFullYear(),t.getMonth(),t.getDate()))/864e5)}
 const wr=$('.mv .wrap');
 if(!on||(left!==null&&left<0)){box.hidden=true;wr.classList.add('solo');return}
 $('#nxTitle').textContent=S.nextTitle;
 const soon=$('#nxSoon');
 soon.hidden=left===null;if(left!==null)soon.textContent=left===0?'Today':left===1?'Tomorrow':`In ${left} days`;
 const rows=[];
 if(d)rows.push(['date','Date',d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})]);
 if(S.nextTime)rows.push(['time','Time',niceTime(S.nextTime)]);
 if(S.nextPlace)rows.push(['place','Venue',S.nextPlace]);
 $('#nxMeta').innerHTML=rows.map(([k,l,v])=>`<li><span class="ic">${IC[k]}</span><span class="tx"><small>${l}</small><b>${esc(v)}</b></span></li>`).join('');
 $('#nxMeta').hidden=!rows.length;
 $('#nxText').innerHTML=paras(S.nextText);$('#nxText').hidden=!S.nextText;
 const link=(S.nextLink||'').trim(),cta=(S.nextCta||'').trim()||(link?'Learn more':'Support this project');
 $('#nxAct').innerHTML=/^https?:\/\//i.test(link)?`<a class="btn" href="${esc(link)}" target="_blank" rel="noopener">${esc(cta)}</a>`:`<button type="button" class="btn" data-open="donate">${esc(cta)}</button>`;
 const im=$('#nxImg');im.hidden=!S.nextImage;if(S.nextImage)im.querySelector('img').src=S.nextImage;
 $('.nx-card').classList.toggle('noimg',!S.nextImage);
 box.hidden=false;wr.classList.remove('solo');
}
function renderPillars(list){
 $('#pillars').innerHTML=list.map(p=>`<div class="pillar"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[p.icon]||ICONS.heart}</svg><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('');
 const ps=$$('#pillars .pillar');
 ps.forEach((el,i)=>{el.style.setProperty('--d',i*.18+'s');el.querySelectorAll('svg *').forEach(n=>n.setAttribute('pathLength','1'))});
 const box=$('#pillars');
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches){box.classList.remove('anim');return}
 box.classList.add('anim');
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.35});
 ps.forEach(el=>io.observe(el));
}
function renderProgrammes(list){
 programmes=list;
 $('#programmeList').innerHTML=`${list.map((p,i)=>`<article class="pcard"><span class="num">${String(i+1).padStart(2,'0')}</span><h3>${esc(p.title)}</h3>${paras(p.body)}</article>`).join('')}`;
 $('#dfor').innerHTML='<option value="General">Where it is needed most</option>'+list.map(p=>`<option>${esc(p.title)}</option>`).join('');
}
function renderGallery(list){
 const seen=new Set(),sets=list.map(c=>(c.gallery||[]).filter(m=>m.url&&!seen.has(m.url)&&seen.add(m.url)).slice(0,8)),out=[];
 for(let i=0;sets.some(s=>i<s.length);i++)sets.forEach(s=>s[i]&&out.push(s[i]));
 $('#galleryList').innerHTML=out.map(m=>`<figure class="pol"><img src="${esc(m.url)}" alt="${esc(m.alt||m.caption||'Photo from our projects')}" loading="lazy"></figure>`).join('');
}

const SS={i:0,timer:null,slides:[],dots:[]};
const vp=$('#slides');
function ssGo(n,dir=1){
 const L=SS.slides.length;if(!L)return;
 const old=SS.i;SS.i=((n%L)+L)%L;
 SS.slides.forEach((s,k)=>{
  const on=k===SS.i;
  if(on){
   if(old!==SS.i){s.style.transition='none';s.style.transform=`translateX(${dir*100}%)`;void s.offsetWidth}
   s.style.transition='';s.style.transform='translateX(0)';
  }else if(k===old&&old!==SS.i){s.style.transition='';s.style.transform=`translateX(${-dir*100}%)`}
  else{s.style.transition='none';s.style.transform=`translateX(${dir*100}%)`}
  s.setAttribute('aria-hidden',String(!on));on?s.removeAttribute('inert'):s.setAttribute('inert','');
 });
 SS.dots.forEach((d,k)=>d.setAttribute('aria-current',String(k===SS.i)));
}
function ssStop(){clearInterval(SS.timer);SS.timer=null}
function ssStart(){ssStop();if(SS.slides.length>1)SS.timer=setInterval(()=>ssGo(SS.i+1,1),Math.max(2,+S.slideSeconds||6)*1000)}
function renderSlides(list){
 list=list.filter(s=>fresh(s.image));
 vp.innerHTML=list.map((s,k)=>{
  const t=esc((s.title||'').trim()||S.heroTitle),x=esc((s.text||'').trim()||S.heroLead);
  return `<div class="hslide"><div class="wrap"><div class="hero-copy">${k?`<h2 class="hero-h">${t}</h2>`:`<h1 class="hero-h">${t}</h1>`}<p class="lead">${x}</p><div class="actions"><a class="btn" href="#involved">Join our work</a><a class="btn ghost" href="#about">Our mission</a></div></div><div class="arch-wrap"><div class="frame"><div class="arch"><img src="${esc(s.image)}" alt="${esc(s.alt||'')}" style="object-position:${esc(s.pos||'50% 50%')}"${k?' loading="lazy"':''}></div></div></div></div></div>`;
 }).join('');
 SS.slides=$$('#slides .hslide');
 $('#heroDots').innerHTML=SS.slides.length>1?SS.slides.map((_,k)=>`<button type="button" data-go="${k}" aria-label="Show slide ${k+1}"></button>`).join(''):'';
 SS.dots=$$('#heroDots button');SS.i=0;
 ssGo(0);ssStart();
}
$('#heroDots').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b)return;const k=+b.dataset.go;ssGo(k,k>=SS.i?1:-1);ssStart()});
let x0=null;
vp.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
vp.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40){ssGo(SS.i+(dx<0?1:-1),dx<0?1:-1);ssStart()}});
document.addEventListener('visibilitychange',()=>{document.hidden?ssStop():ssStart()});

const hv=$('#homeView'),gv=$('#galleryView');
let inGallery=false;
function route(first){
 const h=decodeURIComponent(location.hash||''),g=h==='#story'||h==='#gallery',switched=g!==inGallery;
 inGallery=g;gv.hidden=!g;hv.hidden=g;
 $$('header nav a').forEach(a=>a.getAttribute('href')==='#story'&&(g?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')));
 const beh=switched?'instant':'smooth',el=h.length>1&&h!=='#top'&&!g?document.getElementById(h.slice(1)):null;
 if(el)el.scrollIntoView({behavior:beh});else if(!first||switched)window.scrollTo({top:0,behavior:beh});
}
addEventListener('hashchange',()=>route(false));

let joinType='volunteer',paying=false;
const lb=$('#lb'),lbImg=lb.querySelector('img');
let lbList=[],lbI=0;
function lbShow(i){lbI=(i+lbList.length)%lbList.length;const m=lbList[lbI];lbImg.src=m.currentSrc||m.src;lbImg.alt=m.alt}
function lbOpen(img){lbList=img.closest('#galleryList')?$$('#galleryList img'):[img];lb.classList.toggle('single',lbList.length<2);lbShow(lbList.indexOf(img));lb.showModal()}
lb.addEventListener('click',e=>{const n=e.target.closest('.lb-nav');if(n){lbShow(lbI+(n.dataset.d==='next'?1:-1));return}lb.close()});
document.addEventListener('click',e=>{
 const o=e.target.closest('[data-open]');
 if(o){const d=$('#'+o.dataset.open);if(o.dataset.title){$('#jt').textContent=o.dataset.title;joinType=o.dataset.type||'volunteer'}d.showModal();return}
 const img=e.target.closest(SEL);
 if(img)lbOpen(img);
});
document.addEventListener('keydown',e=>{
 if(lb.open&&(e.key==='ArrowRight'||e.key==='ArrowLeft')&&lbList.length>1){lbShow(lbI+(e.key==='ArrowRight'?1:-1));return}
 if((e.key==='Enter'||e.key===' ')&&e.target.matches?.(SEL)){e.preventDefault();e.target.click()}
});
$$('dialog').forEach(d=>{
 d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))d.close()});
 d.addEventListener('close',()=>{if(paying)return;$('#dform').hidden=false;$('#dthanks').hidden=true;$('#jform').hidden=false;$('#jthanks').hidden=true});
});
new MutationObserver(()=>$$(SEL).forEach(i=>{if(!i.tabIndex||i.tabIndex<0){i.tabIndex=0;i.setAttribute('role','button')}})).observe(document.body,{childList:true,subtree:true});
$('#share').onclick=async()=>{const b=$('#share');try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);b.textContent='Link copied'}}catch(_){}};

async function saveInquiry(data){
 if(!db)throw new Error('offline');
 const clean={status:'new',createdAt:FS.serverTimestamp()};
 for(const [k,v] of Object.entries(data))if(v!==''&&v!=null)clean[k]=v;
 await FS.addDoc(FS.collection(db,'inquiries'),clean);
}
$('#jf').addEventListener('submit',async e=>{
 e.preventDefault();
 const n=$('#jn').value.trim(),m=$('#je').value.trim(),err=$('#jerr'),btn=$('#jgo');
 if(!n)return err.textContent='Please enter your name.';
 if(!okMail(m))return err.textContent='Please enter a valid email address.';
 err.textContent='';btn.disabled=true;
 try{
  await saveInquiry({type:joinType,name:n,email:m,phone:$('#jp').value.trim(),message:$('#jm').value.trim()});
  $('#jmsg').textContent=`Thank you, ${n.split(' ')[0]}. We will reply to ${m} soon.`;
  $('#jform').hidden=true;$('#jthanks').hidden=false;$('#jf').reset();
 }catch(_){err.textContent=S.email?`We could not send that just now. Please email us at ${S.email}.`:'We could not send that just now. Please try again shortly.'}
 btn.disabled=false;
});

let mode='online';
const amt=()=>{const v=parseFloat($('#amt').value);return isFinite(v)&&v>0?Math.round(v*100)/100:0};
function syncDonate(){
 const a=amt(),chips=$$('.chip[data-amt]');
 chips.forEach(c=>c.setAttribute('aria-pressed',String(a>0&&+c.dataset.amt===a)));
 const oth=$('.chip[data-other]');if(oth)oth.setAttribute('aria-pressed',String(a>0&&!chips.some(c=>+c.dataset.amt===a)));
 const hasBank=!!(S.bankDetails||'').trim();
 $('#go').innerHTML=mode==='online'?(a>0?`Give ${fmtH(a)} with Paystack`:'Give with Paystack'):(hasBank?'I have noted the details':'Request bank details');
 $('#amtl').innerHTML=mode==='online'?'Amount':'Amount you plan to give <small>(optional)</small>';
 $('#pm-online').hidden=mode!=='online';$('#pm-bank').hidden=mode!=='bank';
 $('#bankbox').hidden=!hasBank;$('#bankbox').textContent=S.bankDetails||'';
 $('#bankNote').textContent='';
 $$('.seg button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.mode===mode)));
 $('#derr').textContent='';
}
$$('.seg button').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;syncDonate()});
$('#chips').addEventListener('click',e=>{
 const c=e.target.closest('.chip');if(!c)return;
 if(c.dataset.amt)$('#amt').value=c.dataset.amt;else{$('#amt').value='';$('#amt').focus()}
 syncDonate();
});
$('#amt').addEventListener('input',syncDonate);
function showThanks(msg){$('#dmsg').textContent=msg;$('#dform').hidden=true;$('#dthanks').hidden=false;if(!$('#donate').open)$('#donate').showModal()}

function payOnline(name,email,a,purpose){
 const err=$('#derr'),d=$('#donate'),key=(S.paystackKey||'').trim();
 if(!key)return err.textContent='Online giving is being set up. Please use bank transfer for now.';
 if(typeof PaystackPop==='undefined')return err.textContent='We could not reach Paystack. Check your connection and try again.';
 const ref='LCF-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase();
 let done=false;
 try{
  const h=PaystackPop.setup({
   key,email,amount:Math.round(a*100),currency:'GHS',ref,channels:['mobile_money','card'],
   metadata:{donor_name:name,designation:purpose,custom_fields:[{display_name:'Donor name',variable_name:'donor_name',value:name},{display_name:'Designation',variable_name:'designation',value:purpose}]},
   callback:function(){
    done=true;paying=false;
    const first=name.split(' ')[0],base=`Thank you, ${first}. Your gift of ${fmt(a)} has been received. Your payment reference is ${ref}. Please keep it for your records.`;
    showThanks(base);
    fetch('/api/verify?reference='+encodeURIComponent(ref)).catch(()=>{});
   },
   onClose:function(){if(done)return;paying=false;if(!d.open)d.showModal()}
  });
  paying=true;d.close();h.openIframe();
 }catch(_){paying=false;if(!d.open)d.showModal();err.textContent='Something went wrong opening the payment window. Please try again.'}
}
async function bankFlow(name,email,a,purpose){
 const err=$('#derr'),hasBank=!!(S.bankDetails||'').trim();
 try{
  await saveInquiry({type:'bank',name,email,amount:a||null,message:`Designation: ${purpose}`});
  showThanks(hasBank?`Thank you, ${name.split(' ')[0]}. Once you have made your transfer we will thank you at ${email}.`:`Thank you, ${name.split(' ')[0]}. We will email our bank details to ${email} shortly.`);
 }catch(_){
  if(S.email){
   location.href='mailto:'+S.email+'?subject='+encodeURIComponent('Bank details request')+'&body='+encodeURIComponent(`Hello,\n\nI would like to give${a?' '+fmt(a):''} by bank transfer. Please send me your bank account details.\n\nName: ${name}\nEmail: ${email}`);
   showThanks(`Thank you, ${name.split(' ')[0]}. Your email app should open with a message to us.`);
  }else err.textContent='We could not send that just now. Please try again shortly.';
 }
}
$('#df').addEventListener('submit',e=>{
 e.preventDefault();
 const a=amt(),n=$('#dn').value.trim(),m=$('#de').value.trim(),err=$('#derr'),p=$('#dfor').value;
 if(mode==='online'&&!(a>=1))return err.textContent='Enter an amount of GH₵1 or more.';
 if(!n)return err.textContent='Please enter your name.';
 if(!okMail(m))return err.textContent='Please enter a valid email address.';
 err.textContent='';
 mode==='online'?payOnline(n,m,a,p):bankFlow(n,m,a,p);
});

function applyAll(slides,pillars,progs,gallery){renderText();used.clear();used.add(S.founderPhoto);if(S.nextOn&&S.nextImage)used.add(S.nextImage);renderSlides(slides);renderPillars(pillars);renderProgrammes(progs);renderGallery(gallery)}
applyAll(DEFAULT_SLIDES,DEFAULT_PILLARS,DEFAULT_PROGRAMMES,DEFAULT_GALLERY);
route(true);
if(fb&&fb.apiKey){
 try{
  const V='10.14.1',[{initializeApp},fs]=await Promise.all([import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)]);
  FS=fs;db=fs.getFirestore(initializeApp(fb));
  const {collection,getDocs,getDoc,doc,query,where}=fs;
  const pub=n=>getDocs(query(collection(db,n),where('published','==',true))).then(s=>s.docs.map(d=>({id:d.id,...d.data()})).sort(byOrder));
  const [st,sl,pi,pr]=await Promise.all([getDoc(doc(db,'settings','site')),pub('slides'),pub('pillars'),pub('programmes')]);
  if(st.exists())S={...DEFAULT_SETTINGS,...st.data()};
  const pick=(a,d)=>S.seeded||a.length?a:d;
  let gl=[];try{gl=await pub('gallery')}catch(_){}
  applyAll(pick(sl,DEFAULT_SLIDES),pick(pi,DEFAULT_PILLARS),pick(pr,DEFAULT_PROGRAMMES),gl.length?gl:DEFAULT_GALLERY);
 }catch(e){console.warn('Using default content',e)}
}

(()=>{
 const h=$('header'),b=$('#menuBtn');if(!h||!b)return;
 const set=o=>{h.classList.toggle('open',o);b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'Close menu':'Open menu')};
 b.addEventListener('click',e=>{e.stopPropagation();set(!h.classList.contains('open'))});
 $('#mainnav').addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
 document.addEventListener('click',e=>{if(h.classList.contains('open')&&!h.contains(e.target))set(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
 matchMedia('(min-width:861px)').addEventListener('change',e=>{if(e.matches)set(false)});
})();
