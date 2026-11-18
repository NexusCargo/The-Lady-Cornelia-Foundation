import {ICONS,DEFAULT_SETTINGS,DEFAULT_SLIDES,DEFAULT_PILLARS,DEFAULT_PROGRAMMES} from './defaults.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paras=t=>String(t||'').split(/\n{2,}/).map(p=>p.trim()).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');
const byOrder=(a,b)=>(a.order??0)-(b.order??0);
const okMail=e=>/^\S+@\S+\.\S+$/.test(e);
const fmt=n=>'GH₵'+(+n).toLocaleString('en-GH',{minimumFractionDigits:Number.isInteger(+n)?0:2,maximumFractionDigits:2});

let S={...DEFAULT_SETTINGS},programmes=DEFAULT_PROGRAMMES;
let db=null,FS=null;
const fb=window.LCF_CONFIG?.firebase;

function renderText(){
 $('#heroTitle').textContent=S.heroTitle;$('#heroLead').textContent=S.heroLead;
 $('#mission').textContent=S.mission;$('#vision').textContent=S.vision;
 $('#supportIntro').textContent=S.supportIntro;$('#programmesIntro').textContent=S.programmesIntro;
 $('#founderName').textContent=S.founderName;$('#founderRole').textContent=S.founderRole;
 $('#founderBio').innerHTML=paras(S.founderBio);$('#founderQuote').textContent=S.founderQuote;
 const ph=$('#founderPhoto');if(S.founderPhoto&&ph.getAttribute('src')!==S.founderPhoto)ph.src=S.founderPhoto;
 $('#tagline').textContent=S.tagline;$('#yr').textContent=new Date().getFullYear();
 const links=[['Facebook',S.facebook],['Instagram',S.instagram],['TikTok',S.tiktok],['X',S.x]].filter(l=>l[1]);
 $('#social').innerHTML=links.map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${n}</a>`).join('');
 $('#chips').innerHTML=String(S.amounts).split(',').map(a=>+a.trim()).filter(a=>a>0).slice(0,5).map(a=>`<button type="button" class="chip" data-amt="${a}">${fmt(a)}</button>`).join('')+'<button type="button" class="chip" data-other>Other</button>';
 syncDonate();
}
function renderPillars(list){
 $('#pillars').innerHTML=list.map(p=>`<div class="pillar"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[p.icon]||ICONS.heart}</svg><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('');
}
function renderProgrammes(list){
 programmes=list;
 $('#programmeList').innerHTML=list.map((p,i)=>{
  const g=(p.gallery||[]).slice(0,4),n=g.length;
  const cls=n>=4?'m4':n===3?'m3':n===2?(i%2?'mtall':'m2'):'m1';
  return `<article class="pg${i%2?' flip':''}"><div class="pg-txt"><h3>${esc(p.title)}</h3>${paras(p.body)}</div><div class="pg-media ${cls}">${g.map(m=>`<figure><img src="${esc(m.url)}" alt="${esc(m.caption||p.title)}" style="object-position:${esc(m.pos||'50% 50%')}" loading="lazy">${m.caption?`<figcaption>${esc(m.caption)}</figcaption>`:''}</figure>`).join('')}</div></article>`;
 }).join('');
 $('#dfor').innerHTML='<option value="General">Where it is needed most</option>'+list.map(p=>`<option>${esc(p.title)}</option>`).join('');
}

const SS={i:0,timer:null,playing:!matchMedia('(prefers-reduced-motion:reduce)').matches,held:false,slides:[],dots:[]};
const root=$('.arch-wrap'),badge=root.querySelector('.badge'),dotBox=root.querySelector('.ss-dots'),tog=root.querySelector('[data-toggle]'),ctrl=root.querySelector('.ss-controls');
function ssGo(n){
 const L=SS.slides.length;if(!L)return;SS.i=(n+L)%L;
 const c=SS.slides[SS.i].dataset.caption||'';badge.textContent=c;badge.hidden=!c;
 SS.slides.forEach((s,k)=>{const a=k===SS.i;s.classList.toggle('is-active',a);s.setAttribute('aria-hidden',String(!a));a?s.removeAttribute('inert'):s.setAttribute('inert','')});
 SS.dots.forEach((d,k)=>d.setAttribute('aria-current',String(k===SS.i)));
}
function ssStop(){clearInterval(SS.timer);SS.timer=null}
function ssStart(){ssStop();if(SS.playing&&!SS.held&&SS.slides.length>1)SS.timer=setInterval(()=>ssGo(SS.i+1),Math.max(2,+S.slideSeconds||5.5)*1000)}
function ssSync(){tog.classList.toggle('paused',!SS.playing);tog.setAttribute('aria-label',SS.playing?'Pause slideshow':'Play slideshow')}
function renderSlides(list){
 $('#slides').innerHTML=list.map((s,k)=>`<div class="slide" data-caption="${esc(s.caption||'')}"><img src="${esc(s.image)}" alt="${esc(s.alt||s.caption||'')}" style="object-position:${esc(s.pos||'50% 50%')}"${k?' loading="lazy"':''}></div>`).join('');
 SS.slides=$$('#slides .slide');dotBox.innerHTML='';
 SS.dots=SS.slides.map((_,n)=>{const b=document.createElement('button');b.type='button';b.className='ss-dot';b.setAttribute('aria-label',`Show photo ${n+1} of ${SS.slides.length}`);b.onclick=()=>{ssGo(n);ssStart()};dotBox.appendChild(b);return b});
 ctrl.hidden=SS.slides.length<2;ssGo(0);ssSync();ssStart();
}
root.querySelector('[data-prev]').onclick=()=>{ssGo(SS.i-1);ssStart()};
root.querySelector('[data-next]').onclick=()=>{ssGo(SS.i+1);ssStart()};
tog.onclick=()=>{SS.playing=!SS.playing;ssSync();ssStart()};
root.addEventListener('mouseenter',()=>{SS.held=true;ssStart()});root.addEventListener('mouseleave',()=>{SS.held=false;ssStart()});
root.addEventListener('focusin',()=>{SS.held=true;ssStart()});root.addEventListener('focusout',()=>{SS.held=false;ssStart()});
root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){ssGo(SS.i-1);ssStart()}if(e.key==='ArrowRight'){ssGo(SS.i+1);ssStart()}});
let x0=null;
root.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
root.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40){ssGo(SS.i+(dx<0?1:-1));ssStart()}});
document.addEventListener('visibilitychange',()=>{document.hidden?ssStop():ssStart()});

let joinType='volunteer',paying=false;
document.addEventListener('click',e=>{
 const o=e.target.closest('[data-open]');
 if(o){const d=$('#'+o.dataset.open);if(o.dataset.title){$('#jt').textContent=o.dataset.title;joinType=o.dataset.type||'volunteer'}d.showModal();return}
 const img=e.target.closest('.arch img,.prog figure img');
 if(img){const l=$('#lb img');l.src=img.src;l.alt=img.alt;$('#lb').showModal()}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('.arch img,.prog figure img')){e.preventDefault();e.target.click()}});
$$('dialog').forEach(d=>{
 d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))d.close()});
 d.addEventListener('close',()=>{if(paying)return;$('#dform').hidden=false;$('#dthanks').hidden=true;$('#jform').hidden=false;$('#jthanks').hidden=true});
});
new MutationObserver(()=>$$('.arch img,.prog figure img').forEach(i=>{if(!i.tabIndex||i.tabIndex<0){i.tabIndex=0;i.setAttribute('role','button')}})).observe(document.body,{childList:true,subtree:true});
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
 $('#go').textContent=mode==='online'?(a>0?`Give ${fmt(a)} with Paystack`:'Give with Paystack'):(hasBank?'I have noted the details':'Request bank details');
 $('#amtl').innerHTML=mode==='online'?'Amount':'Amount you plan to give <small>(optional)</small>';
 $('#pm-online').hidden=mode!=='online';$('#pm-bank').hidden=mode!=='bank';
 $('#bankbox').hidden=!hasBank;$('#bankbox').textContent=S.bankDetails||'';
 $('#bankNote').textContent=hasBank?'Transfer to the account below, then enter your name and email so we can thank you and record your gift.':'Enter your name and email and we will send you our bank account details.';
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

function applyAll(slides,pillars,progs){renderText();renderSlides(slides);renderPillars(pillars);renderProgrammes(progs)}
applyAll(DEFAULT_SLIDES,DEFAULT_PILLARS,DEFAULT_PROGRAMMES);
if(fb&&!/REPLACE/.test(fb.apiKey)){
 try{
  const V='10.14.1',[{initializeApp},fs]=await Promise.all([import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)]);
  FS=fs;db=fs.getFirestore(initializeApp(fb));
  const {collection,getDocs,getDoc,doc,query,where}=fs;
  const pub=n=>getDocs(query(collection(db,n),where('published','==',true))).then(s=>s.docs.map(d=>({id:d.id,...d.data()})).sort(byOrder));
  const [st,sl,pi,pr]=await Promise.all([getDoc(doc(db,'settings','site')),pub('slides'),pub('pillars'),pub('programmes')]);
  if(st.exists())S={...DEFAULT_SETTINGS,...st.data()};
  const pick=(a,d)=>S.seeded||a.length?a:d;
  applyAll(pick(sl,DEFAULT_SLIDES),pick(pi,DEFAULT_PILLARS),pick(pr,DEFAULT_PROGRAMMES));
 }catch(e){console.warn('Using default content',e)}
}
