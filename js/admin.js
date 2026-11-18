import {ICONS,DEFAULT_SETTINGS,DEFAULT_SLIDES,DEFAULT_PILLARS,DEFAULT_PROGRAMMES} from './defaults.js';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,sendPasswordResetEmail} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getFirestore,collection,getDocs,getDoc,doc,addDoc,setDoc,updateDoc,deleteDoc,writeBatch,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>'GH₵'+(+n||0).toLocaleString('en-GH',{minimumFractionDigits:2,maximumFractionDigits:2});
const when=t=>{const d=t?.toDate?t.toDate():t?new Date(t):null;return d?d.toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'};
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2600)};

const fb=window.LCF_CONFIG?.firebase,cl=window.LCF_CONFIG?.cloudinary;
if(!fb||/REPLACE/.test(fb.apiKey)){
 $('#login').hidden=false;$('#lf').innerHTML='<h1>Not configured</h1>';
 throw new Error('Firebase not configured');
}
const app=initializeApp(fb),auth=getAuth(app),db=getFirestore(app);

$('#lf').addEventListener('submit',async e=>{
 e.preventDefault();$('#lerr').textContent='';
 try{await signInWithEmailAndPassword(auth,$('#le').value.trim(),$('#lp').value)}catch(_){$('#lerr').textContent='Wrong email or password.'}
});
$('#forgot').onclick=async()=>{
 const m=$('#le').value.trim();if(!m)return $('#lerr').textContent='Enter your email first.';
 try{await sendPasswordResetEmail(auth,m);$('#lerr').style.color='#17855a';$('#lerr').textContent='Reset link sent. Check your email.'}catch(_){$('#lerr').textContent='Could not send reset email.'}
};
$('#out').onclick=()=>signOut(auth);
onAuthStateChanged(auth,async u=>{
 if(!u){$('#app').hidden=true;$('#login').hidden=false;return}
 let isAdmin=false;try{isAdmin=(await getDoc(doc(db,'admins',u.uid))).exists()}catch(_){}
 if(!isAdmin){
  $('#login').hidden=false;$('#app').hidden=true;
  $('#lerr').innerHTML='This account is not an admin.';
  return;
 }
 $('#login').hidden=true;$('#app').hidden=false;$('#who').textContent=u.email;start();
});

function resize(file,max=1800){
 return new Promise(res=>{
  if(!file.type.startsWith('image/')||file.type==='image/svg+xml')return res(file);
  const img=new Image();img.onload=()=>{
   const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');
   c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
   c.toBlob(b=>res(b||file),'image/jpeg',.86);
  };img.onerror=()=>res(file);img.src=URL.createObjectURL(file);
 });
}
async function upload(file){
 if(!cl||/REPLACE/.test(cl.cloudName))throw new Error('Uploads unavailable');
 const fd=new FormData();fd.append('file',await resize(file));fd.append('upload_preset',cl.uploadPreset);fd.append('folder','lady-cornelia');
 const r=await fetch(`https://api.cloudinary.com/v1_1/${cl.cloudName}/image/upload`,{method:'POST',body:fd});
 const j=await r.json();if(!r.ok)throw new Error(j.error?.message||'Upload failed');return j.secure_url;
}
function pickFile(cb){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=async()=>{if(!i.files[0])return;toast('Uploading…');try{cb(await upload(i.files[0]));toast('Uploaded')}catch(e){toast(e.message)}};i.click()}

const ICON_OPTS=Object.keys(ICONS);
const C={
 slides:{label:'Hero slides',single:'slide',def:DEFAULT_SLIDES,fields:[
  {k:'image',t:'image',label:'Photo',req:1,full:1},{k:'caption',t:'text',label:'Caption',full:1},{k:'alt',t:'text',label:'Photo description',full:1},
  {k:'pos',t:'pos',label:'Focus point',full:1},{k:'order',t:'number',label:'Order'},{k:'published',t:'check',label:'Show on website',def:true}],
  title:i=>i.caption||'(no caption)',thumb:i=>i.image,meta:i=>''},
 programmes:{label:'Programmes',single:'programme',def:DEFAULT_PROGRAMMES,fields:[
  {k:'title',t:'text',label:'Title',req:1,full:1},{k:'body',t:'textarea',label:'Description',rows:6,full:1},{k:'gallery',t:'gallery',label:'Photos (up to 4)',full:1},
  {k:'order',t:'number',label:'Order'},{k:'published',t:'check',label:'Show on website',def:true}],
  title:i=>i.title,thumb:i=>i.gallery?.[0]?.url,meta:i=>`${(i.gallery||[]).length} photo(s)`},
 pillars:{label:'What we support',single:'focus area',def:DEFAULT_PILLARS,fields:[
  {k:'title',t:'text',label:'Title',req:1,full:1},{k:'text',t:'textarea',label:'Short description',rows:3,full:1},{k:'icon',t:'select',label:'Icon',opts:ICON_OPTS,def:'heart'},
  {k:'order',t:'number',label:'Order'},{k:'published',t:'check',label:'Show on website',def:true}],
  title:i=>i.title,thumb:null,icon:i=>`<svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[i.icon]||ICONS.heart}</svg>`,meta:i=>i.text}
};
const SET_GROUPS=[
 ['Hero & intro',[['heroTitle','text','Hero headline'],['heroLead','textarea','Hero paragraph'],['slideSeconds','number','Seconds per hero slide'],['mission','textarea','Mission'],['vision','textarea','Vision'],['supportIntro','text','“What we support” intro'],['programmesIntro','textarea','“Our programmes” intro']]],
 ['Founder',[['founderName','text','Name'],['founderRole','text','Role line'],['founderBio','textarea','Biography',8],['founderQuote','text','Quote'],['founderPhoto','image','Portrait photo']]],
 ['Contact & footer',[['tagline','text','Footer tagline'],['email','text','Foundation email'],['phone','text','Phone'],['facebook','text','Facebook URL'],['instagram','text','Instagram URL'],['tiktok','text','TikTok URL'],['x','text','X / Twitter URL']]],
 ['Giving',[['paystackKey','text','Paystack public key'],['amounts','text','Quick amounts (GH₵, comma separated)'],['bankDetails','textarea','Bank transfer details',5]]]
];

const all=async n=>(await getDocs(collection(db,n))).docs.map(d=>({id:d.id,...d.data()}));
const sorted=l=>l.sort((a,b)=>(a.order??0)-(b.order??0));
function csv(name,rows){
 const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
 const blob=new Blob(['\ufeff'+rows.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
}
const view=$('#view');
function setHead(t,actions=''){$('#title').textContent=t;$('#actions').innerHTML=actions}

function fieldHTML(f,v){
 const id='f_'+f.k,val=v??f.def??'';
 if(f.t==='check')return `<label class="${f.full?'full':''}"><input type="checkbox" id="${id}" ${val?'checked':''}> ${esc(f.label)}</label>`;
 const w=f.full?'full':'';let inner='';
 if(f.t==='text')inner=`<input id="${id}" value="${esc(val)}">`;
 else if(f.t==='number')inner=`<input id="${id}" type="number" step="any" value="${esc(val)}">`;
 else if(f.t==='textarea')inner=`<textarea id="${id}" rows="${f.rows||4}">${esc(val)}</textarea>`;
 else if(f.t==='select')inner=`<select id="${id}">${f.opts.map(o=>`<option ${o===val?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
 else if(f.t==='image')inner=`<div class="imgf"><input id="${id}" value="${esc(val)}" placeholder="Image URL"><button type="button" class="btn ghost sm" data-up="${id}">Upload</button></div><div class="prev" id="${id}_p" style="background-image:url('${esc(val)}')"></div>`;
 else if(f.t==='pos'){const [x,y]=String(val||'50% 50%').replace(/%/g,'').split(' ').map(Number);inner=`<input type="hidden" id="${id}" value="${esc(val||'50% 50%')}"><label>Left ↔ right <input type="range" id="${id}_x" min="0" max="100" value="${x||50}"></label><label>Top ↕ bottom <input type="range" id="${id}_y" min="0" max="100" value="${y||50}"></label>`}
 else if(f.t==='gallery'){inner=`<div id="${id}_rows"></div><button type="button" class="btn ghost sm" id="${id}_add">+ Add photo</button>`}
 return `<div class="${w}"><label for="${id}">${esc(f.label)}</label>${inner}</div>`;
}
function galRow(g={}){
 return `<div class="grow"><div class="row"><input class="g-url" placeholder="Image URL" value="${esc(g.url||'')}"><input class="g-cap" placeholder="Caption" value="${esc(g.caption||'')}"></div><div style="display:flex;gap:6px"><button type="button" class="btn ghost sm g-up">Upload</button><button type="button" class="btn danger sm g-rm">✕</button></div><input class="g-pos full" placeholder="Focus e.g. 50% 40%" value="${esc(g.pos||'50% 50%')}"></div>`;
}
function wire(fields,root){
 root.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>pickFile(u=>{const i=root.querySelector('#'+b.dataset.up);i.value=u;i.dispatchEvent(new Event('input'))}));
 fields.filter(f=>f.t==='image').forEach(f=>{const i=root.querySelector('#f_'+f.k);if(i)i.oninput=()=>{root.querySelector('#f_'+f.k+'_p').style.backgroundImage=`url('${i.value}')`;const pv=root.querySelector('.prev');}});
 fields.filter(f=>f.t==='pos').forEach(f=>{
  const h=root.querySelector('#f_'+f.k),x=root.querySelector('#f_'+f.k+'_x'),y=root.querySelector('#f_'+f.k+'_y'),img=root.querySelector('#f_image_p');
  const up=()=>{h.value=`${x.value}% ${y.value}%`;if(img)img.style.backgroundPosition=h.value};x.oninput=y.oninput=up;up();
 });
 fields.filter(f=>f.t==='gallery').forEach(f=>{
  const rows=root.querySelector('#f_'+f.k+'_rows'),add=root.querySelector('#f_'+f.k+'_add');
  const bind=()=>{rows.querySelectorAll('.grow').forEach(r=>{r.querySelector('.g-rm').onclick=()=>{r.remove();add.hidden=false};r.querySelector('.g-up').onclick=()=>pickFile(u=>r.querySelector('.g-url').value=u)})};
  add.onclick=()=>{if(rows.children.length>=4)return;rows.insertAdjacentHTML('beforeend',galRow());bind();if(rows.children.length>=4)add.hidden=true};
  root._gal=()=>[...rows.querySelectorAll('.grow')].map(r=>({url:r.querySelector('.g-url').value.trim(),caption:r.querySelector('.g-cap').value.trim(),pos:r.querySelector('.g-pos').value.trim()||'50% 50%'})).filter(g=>g.url);
  root._galInit=g=>{rows.innerHTML=(g||[]).slice(0,4).map(galRow).join('');bind();add.hidden=rows.children.length>=4};
 });
}
function collect(fields,root){
 const o={};
 for(const f of fields){
  const el=root.querySelector('#f_'+f.k);
  if(f.t==='check')o[f.k]=el.checked;else if(f.t==='number')o[f.k]=el.value===''?null:+el.value;
  else if(f.t==='gallery')o[f.k]=root._gal();else o[f.k]=(el.value||'').trim();
 }
 return o;
}
function openForm(title,fields,values,onSave){
 const m=$('#modal'),b=$('#mb');b._galInit=null;b._gal=null;$('#mt').textContent=title;$('#merr').textContent='';
 b.innerHTML=`<div class="fgrid">${fields.map(f=>fieldHTML(f,values[f.k])).join('')}</div>`;
 wire(fields,b);b._galInit&&b._galInit(values.gallery);
 $('#mc').onclick=()=>m.close();
 $('#mf').onsubmit=async e=>{
  e.preventDefault();const data=collect(fields,b);
  for(const f of fields)if(f.req&&!data[f.k])return $('#merr').textContent=`${f.label} is required.`;
  $('#ms').disabled=true;try{await onSave(data);m.close()}catch(err){$('#merr').textContent=err.message||'Could not save.'}$('#ms').disabled=false;
 };
 m.showModal();
}

async function showCollection(name){
 const cfg=C[name];setHead(cfg.label,`<button class="btn" id="add">+ Add ${cfg.single}</button>`);
 view.innerHTML='<p class="empty">Loading…</p>';
 const items=sorted(await all(name));
 view.innerHTML=(items.length?`<div class="list">${items.map((it,i)=>`<div class="item" data-id="${it.id}">
  ${cfg.thumb?`<img class="th" src="${esc(cfg.thumb(it))}" alt="">`:`<div class="th">${cfg.icon(it)}</div>`}
  <div><h3>${esc(cfg.title(it))}</h3><p><span class="tag ${it.published?'ok':'warn'}">${it.published?'Live':'Hidden'}</span> ${esc(cfg.meta(it)||'')}</p></div>
  <div class="acts"><button class="btn ghost sm" data-a="up" ${i?'':'disabled'}>▲</button><button class="btn ghost sm" data-a="down" ${i<items.length-1?'':'disabled'}>▼</button><button class="btn ghost sm" data-a="pub">${it.published?'Hide':'Show'}</button><button class="btn sm" data-a="edit">Edit</button><button class="btn danger sm" data-a="del">Delete</button></div></div>`).join('')}</div>`
  :`<div class="card empty">Nothing here yet.</div>`);
 const save=async(it,data)=>{it?await updateDoc(doc(db,name,it.id),{...data,updatedAt:serverTimestamp()}):await addDoc(collection(db,name),{...data,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});toast('Saved');showCollection(name)};
 $('#add').onclick=()=>openForm('Add '+cfg.single,cfg.fields,{order:(items.at(-1)?.order||0)+1},d=>save(null,d));
 view.onclick=async e=>{
  const b=e.target.closest('[data-a]');if(!b)return;
  const idx=items.findIndex(x=>x.id===b.closest('.item').dataset.id),it=items[idx],a=b.dataset.a;
  if(a==='edit')openForm('Edit '+cfg.single,cfg.fields,it,d=>save(it,d));
  if(a==='pub'){await updateDoc(doc(db,name,it.id),{published:!it.published});showCollection(name)}
  if(a==='del'&&confirm('Delete this '+cfg.single+'? This cannot be undone.')){await deleteDoc(doc(db,name,it.id));toast('Deleted');showCollection(name)}
  if(a==='up'||a==='down'){
   const o=items[idx+(a==='up'?-1:1)];if(!o)return;const bt=writeBatch(db);
   const arr=items.slice();[arr[idx],arr[arr.indexOf(o)]]=[o,it];arr.forEach((x,k)=>bt.update(doc(db,name,x.id),{order:k+1}));
   await bt.commit();showCollection(name);
  }
 };
}

async function showSettings(){
 setHead('Site settings','<button class="btn" id="sv">Save changes</button>');
 const snap=await getDoc(doc(db,'settings','site')),S={...DEFAULT_SETTINGS,...(snap.exists()?snap.data():{})};
 view.innerHTML=SET_GROUPS.map(([g,fs])=>`<div class="group">${g}</div><div class="card"><div class="fgrid">${fs.map(([k,t,l,r])=>fieldHTML({k,t,label:l,rows:r,full:t!=='number'},S[k])).join('')}</div></div>`).join('')+
 `<div class="group">Starter content</div><div class="card"><button class="btn ghost" id="seed">Load default content</button></div>`;
 const fields=SET_GROUPS.flatMap(g=>g[1].map(([k,t])=>({k,t})));wire(fields,view);
 $('#sv').onclick=async()=>{await setDoc(doc(db,'settings','site'),{...collect(fields,view),updatedAt:serverTimestamp()},{merge:true});toast('Settings saved')};
 $('#seed').onclick=async()=>{
  if(!confirm('Load default content?'))return;
  for(const n of ['slides','programmes','pillars'])if(!(await all(n)).length){const bt=writeBatch(db);C[n].def.forEach(d=>bt.set(doc(collection(db,n)),{...d,createdAt:serverTimestamp()}));await bt.commit()}
  await setDoc(doc(db,'settings','site'),{...DEFAULT_SETTINGS,...(snap.exists()?snap.data():{}),seeded:true},{merge:true});toast('Default content loaded');showSettings();
 };
}

async function showDonations(){
 setHead('Donations','<button class="btn ghost" id="ex">Export CSV</button><button class="btn" id="man">+ Record offline gift</button>');
 const list=(await all('donations')).sort((a,b)=>(b.paidAt?.seconds||b.createdAt?.seconds||0)-(a.paidAt?.seconds||a.createdAt?.seconds||0));
 const draw=q=>{
  const l=list.filter(d=>!q||[d.name,d.email,d.reference,d.designation].join(' ').toLowerCase().includes(q.toLowerCase()));
  $('#dt').innerHTML=l.length?`<tr><th>Date</th><th>Donor</th><th>Amount</th><th>For</th><th>Via</th><th>Reference</th><th></th></tr>`+l.map(d=>`<tr><td>${when(d.paidAt||d.createdAt)}</td><td><b>${esc(d.name||'Anonymous')}</b><br>${esc(d.email||'')}</td><td><b>${fmt(d.amount)}</b></td><td>${esc(d.designation||'General')}</td><td><span class="tag">${esc(d.channel||'')}</span></td><td>${esc(d.reference||'')}</td><td><button class="btn danger sm" data-del="${d.id}">Delete</button></td></tr>`).join(''):'<tr><td class="empty">No donations yet.</td></tr>';
 };
 view.innerHTML=`<div class="bar"><input id="q" placeholder="Search name, email, reference…"></div><div class="tw"><table id="dt"></table></div>`;draw('');
 $('#q').oninput=e=>draw(e.target.value);
 view.onclick=async e=>{const b=e.target.closest('[data-del]');if(b&&confirm('Delete this record?')){await deleteDoc(doc(db,'donations',b.dataset.del));showDonations()}};
 $('#ex').onclick=()=>csv('donations.csv',[['Date','Name','Email','Amount GHS','Designation','Channel','Reference','Status'],...list.map(d=>[when(d.paidAt||d.createdAt),d.name,d.email,d.amount,d.designation,d.channel,d.reference,d.status])]);
 $('#man').onclick=()=>openForm('Record offline gift',[{k:'name',t:'text',label:'Donor name',req:1},{k:'email',t:'text',label:'Email'},{k:'amount',t:'number',label:'Amount (GH₵)',req:1},{k:'designation',t:'text',label:'Designation',def:'General'},{k:'channel',t:'select',label:'How received',opts:['bank transfer','cash','mobile money','cheque'],def:'bank transfer'},{k:'reference',t:'text',label:'Reference / note'}],{},async d=>{await addDoc(collection(db,'donations'),{...d,currency:'GHS',status:'success',createdAt:serverTimestamp(),paidAt:serverTimestamp(),manual:true});toast('Recorded');showDonations()});
}

async function showInbox(){
 setHead('Messages & requests','<button class="btn ghost" id="ex">Export CSV</button>');
 const list=(await all('inquiries')).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
 view.innerHTML=`<div class="bar"><select id="ft"><option value="">All types</option><option>volunteer</option><option>partner</option><option>bank</option><option value="new">Unread only</option></select></div><div class="tw"><table id="it"></table></div>`;
 const draw=f=>{
  const l=list.filter(d=>!f||(f==='new'?d.status==='new':d.type===f));
  $('#it').innerHTML=l.length?`<tr><th>Received</th><th>Type</th><th>From</th><th>Message</th><th>Status</th><th></th></tr>`+l.map(d=>`<tr><td>${when(d.createdAt)}</td><td><span class="tag">${esc(d.type)}</span></td><td><b>${esc(d.name)}</b><br><a href="mailto:${esc(d.email)}">${esc(d.email)}</a>${d.phone?'<br>'+esc(d.phone):''}</td><td style="max-width:320px;white-space:pre-wrap">${esc(d.message||'')}${d.amount?`<br><b>Plans to give ${fmt(d.amount)}</b>`:''}</td><td><select data-st="${d.id}">${['new','read','done'].map(s=>`<option ${d.status===s?'selected':''}>${s}</option>`).join('')}</select></td><td><a class="btn ghost sm" href="mailto:${esc(d.email)}?subject=${encodeURIComponent('The Lady Cornelia Foundation')}">Reply</a> <button class="btn danger sm" data-del="${d.id}">✕</button></td></tr>`).join(''):'<tr><td class="empty">Nothing here yet.</td></tr>';
 };draw('');$('#ft').onchange=e=>draw(e.target.value);
 view.onchange=async e=>{const s=e.target.closest('[data-st]');if(s){await updateDoc(doc(db,'inquiries',s.dataset.st),{status:s.value});list.find(x=>x.id===s.dataset.st).status=s.value;refreshBadge()}};
 view.onclick=async e=>{const b=e.target.closest('[data-del]');if(b&&confirm('Delete this message?')){await deleteDoc(doc(db,'inquiries',b.dataset.del));showInbox()}};
 $('#ex').onclick=()=>csv('inquiries.csv',[['Received','Type','Name','Email','Phone','Message','Amount','Status'],...list.map(d=>[when(d.createdAt),d.type,d.name,d.email,d.phone,d.message,d.amount,d.status])]);
}

async function showDash(){
 setHead('Dashboard');view.innerHTML='<p class="empty">Loading…</p>';
 const [don,inq,sl,pr]=await Promise.all([all('donations'),all('inquiries'),all('slides'),all('programmes')]);
 const ok=don.filter(d=>d.status==='success'),total=ok.reduce((a,d)=>a+(+d.amount||0),0);
 const now=new Date(),months=[...Array(6)].map((_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);return{k:d.getFullYear()+'-'+d.getMonth(),l:d.toLocaleString('en-GB',{month:'short'}),v:0}});
 ok.forEach(d=>{const t=(d.paidAt||d.createdAt)?.toDate?.();if(!t)return;const m=months.find(x=>x.k===t.getFullYear()+'-'+t.getMonth());if(m)m.v+=+d.amount||0});
 const mx=Math.max(1,...months.map(m=>m.v)),unread=inq.filter(i=>i.status==='new').length;
 const recent=ok.sort((a,b)=>(b.paidAt?.seconds||0)-(a.paidAt?.seconds||0)).slice(0,5);
 view.innerHTML=`<div class="stats"><div class="card stat"><b>${fmt(total)}</b><span>Total raised</span></div><div class="card stat"><b>${ok.length}</b><span>Gifts received</span></div><div class="card stat"><b>${unread}</b><span>Unread messages</span></div><div class="card stat"><b>${sl.filter(s=>s.published).length}</b><span>Live hero slides</span></div><div class="card stat"><b>${pr.filter(s=>s.published).length}</b><span>Live programmes</span></div></div>
 <div class="grid2"><div class="card"><h3>Giving, last 6 months</h3><div class="bars">${months.map(m=>`<div><i style="height:${Math.round(m.v/mx*100)}%" title="${fmt(m.v)}"></i>${m.l}</div>`).join('')}</div></div>
 <div class="card"><h3>Latest gifts</h3>${recent.length?recent.map(d=>`<p style="margin:.6em 0"><b>${fmt(d.amount)}</b> · ${esc(d.name||'Anonymous')}<br><small style="color:var(--muted)">${esc(d.designation||'General')} · ${when(d.paidAt)}</small></p>`).join(''):'<p class="empty">No gifts yet.</p>'}</div></div>`;
}
async function refreshBadge(){try{const n=(await all('inquiries')).filter(i=>i.status==='new').length;const b=document.querySelector('#nav [data-v=inbox] .pill');if(b){b.textContent=n;b.hidden=!n}}catch(_){}}

const VIEWS={dash:['Dashboard',showDash],slides:['Hero slides',()=>showCollection('slides')],programmes:['Programmes',()=>showCollection('programmes')],pillars:['What we support',()=>showCollection('pillars')],settings:['Site settings',showSettings],donations:['Donations',showDonations],inbox:['Messages','']};
VIEWS.inbox=['Messages',showInbox];
function go(v){
 document.querySelectorAll('#nav button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.v===v)));
 $('aside').classList.remove('open');history.replaceState(null,'','#'+v);view.onclick=view.onchange=null;
 VIEWS[v][1]().catch(e=>{console.error(e);view.innerHTML=`<div class="card"><b>Something went wrong.</b><p>${esc(e.message)}</p></div>`});
}
function start(){
 $('#nav').innerHTML=Object.entries(VIEWS).map(([k,[l]])=>`<button data-v="${k}">${l}${k==='inbox'?'<span class="pill" hidden></span>':''}</button>`).join('');
 $('#nav').onclick=e=>{const b=e.target.closest('button');if(b)go(b.dataset.v)};
 $('#menu').onclick=()=>$('aside').classList.toggle('open');
 const h=location.hash.slice(1);go(VIEWS[h]?h:'dash');refreshBadge();
}
