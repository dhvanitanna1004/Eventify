/* Eventify - Vanilla JavaScript interactions + client-side validation */
const EVENTS = [
  {id:1,cat:'Culinary',title:'Mastering Modern Cuisine',date:'Oct 24, 2024',time:'7:00 PM',place:'Culinary Institute, Downtown',price:125,img:'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80'},
  {id:2,cat:'Wellness',title:'Sunrise Yoga in the Park',date:'Oct 26, 2024',time:'6:30 AM',place:'Central Park West',price:45,img:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80'},
  {id:3,cat:'Tech',title:'Future of AI Workshop',date:'Oct 28, 2024',time:'10:00 AM',place:'Tech Hub Innovation Center',price:75,img:'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80'},
  {id:4,cat:'Culinary',title:'City Street Food Festival',date:'Nov 02, 2024',time:'12:00 PM',place:'Old Town Square',price:20,img:'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80'},
  {id:5,cat:'Music',title:'Jazz Nights: Blue Note',date:'Nov 05, 2024',time:'9:00 PM',place:'The Underground Lounge',price:85,img:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80'},
  {id:6,cat:'Arts',title:'Outdoor Canvas & Wine',date:'Nov 10, 2024',time:'3:00 PM',place:'Botanical Gardens',price:60,img:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80'}
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ .'-]{1,49}$/;
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;

function eventCard(e){
  return `<div class="event-card"><img class="event-img" src="${e.img}" alt="${e.title}" loading="lazy"><div class="event-body"><span class="tag">${e.cat}</span><div class="event-title">${e.title}</div><div class="meta">◷ ${e.date} • ${e.time}<br>⌖ ${e.place}</div><a class="detail-btn d-block" href="event-details.html?id=${e.id}">View Details <span>→</span></a></div></div>`;
}
function renderEvents(list,el){ if(el) el.innerHTML=list.map(eventCard).join(''); }
function toast(msg){ const t=document.querySelector('.toast-msg'); if(!t)return; t.textContent=msg; t.style.display='block'; clearTimeout(window.__toastTimer); window.__toastTimer=setTimeout(()=>t.style.display='none',2500); }

function setCustomValidity(input, message){
  if(!input) return;
  input.setCustomValidity(message || '');
  let feedback=input.parentElement?.querySelector('.invalid-feedback');
  if(!feedback && input.parentElement){ feedback=document.createElement('div'); feedback.className='invalid-feedback'; input.parentElement.appendChild(feedback); }
  if(feedback && message) feedback.textContent=message;
}
function markForm(form){
  if(!form) return false;
  form.classList.add('was-validated');
  return form.checkValidity();
}
function bindLiveValidation(form, validator){
  if(!form) return;
  const run=()=>validator(form);
  form.querySelectorAll('input,textarea,select').forEach(input=>{
    input.addEventListener('blur',run);
    input.addEventListener('input',()=>{ if(input.classList.contains('is-invalid') || form.classList.contains('was-validated')) run(); });
    input.addEventListener('change',run);
  });
}
function validateCommonName(input){
  if(!input) return;
  setCustomValidity(input, input.value.trim() && NAME_RE.test(input.value.trim()) ? '' : 'Enter a valid name (2–50 characters).');
}
function validateEmail(input){
  if(!input) return;
  setCustomValidity(input, input.value.trim() && EMAIL_RE.test(input.value.trim()) ? '' : 'Enter a valid email address.');
}
function validatePassword(input){
  if(!input) return;
  setCustomValidity(input, input.value.length>=8 ? '' : 'Password must be at least 8 characters.');
}
function luhn(value){
  const digits=value.replace(/\D/g,''); if(digits.length<13 || digits.length>19) return false;
  let sum=0, alt=false;
  for(let i=digits.length-1;i>=0;i--){ let n=Number(digits[i]); if(alt){n*=2;if(n>9)n-=9;} sum+=n; alt=!alt; }
  return sum%10===0;
}
function validateCard(input){
  if(!input)return;
  const value=input.value.trim();
  setCustomValidity(input, luhn(value) ? '' : 'Enter a valid card number.');
}
function validateExpiry(input){
  if(!input)return;
  const m=input.value.trim().match(/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/);
  if(!m){setCustomValidity(input,'Use MM / YY format.');return;}
  const month=Number(m[1]), year=2000+Number(m[2]);
  const now=new Date(), currentMonth=new Date(now.getFullYear(),now.getMonth(),1);
  setCustomValidity(input, new Date(year,month-1,1) >= currentMonth ? '' : 'Card expiry date must be in the future.');
}
function validateCheckout(form){
  const fields=form.querySelectorAll('input');
  fields.forEach(i=>setCustomValidity(i,''));
  const names=form.querySelectorAll('input[pattern="[A-Za-z ]{2,}"]'); names.forEach(validateCommonName);
  const email=form.querySelector('input[type="email"]'); validateEmail(email);
  const street=form.querySelector('input[placeholder="123 Event St"]'); if(street)setCustomValidity(street,street.value.trim().length>=5?'':'Enter a valid street address.');
  const city=form.querySelector('input[placeholder="City"]'); if(city)setCustomValidity(city,/^[A-Za-z .'-]{2,50}$/.test(city.value.trim())?'':'Enter a valid city.');
  const state=form.querySelector('input[placeholder="ST"]'); if(state)setCustomValidity(state,/^[A-Za-z]{2}$/.test(state.value.trim())?'':'Enter a 2-letter state code.');
  const zip=form.querySelector('input[placeholder="00000"]'); if(zip)setCustomValidity(zip,/^\d{5,6}$/.test(zip.value.trim())?'':'Enter a 5–6 digit ZIP code.');
  const cardRadio=form.querySelector('input[name="pay"][value="card"]') || form.querySelectorAll('input[name="pay"]')[0];
  const paypalRadio=form.querySelector('input[name="pay"][value="paypal"]') || form.querySelectorAll('input[name="pay"]')[1];
  const card= form.querySelector('input[placeholder="0000 0000 0000 0000"]');
  const expiry=form.querySelector('input[placeholder="MM / YY"]');
  const cvv=form.querySelector('input[placeholder="123"]');
  const cardMode=!paypalRadio || cardRadio?.checked;
  [card,expiry,cvv].forEach(i=>{if(i)i.required=cardMode;});
  if(cardMode){validateCard(card);validateExpiry(expiry);if(cvv)setCustomValidity(cvv,/^\d{3,4}$/.test(cvv.value.trim())?'':'Enter a valid 3–4 digit CVV.');}
  const terms=form.querySelector('#termsCheckout'); if(terms) setCustomValidity(terms,terms.checked?'':'You must accept the Terms of Service and Privacy Policy.');
  return form.checkValidity();
}

function setupNewsletter(){
  document.querySelectorAll('.newsletter-form').forEach(f=>{
    const input=f.querySelector('input[type="email"]');
    f.addEventListener('submit',e=>{e.preventDefault();validateEmail(input);if(!markForm(f))return;toast('Thanks! You are subscribed.');f.reset();f.classList.remove('was-validated');});
    bindLiveValidation(f,()=>validateEmail(input));
  });
}
function setupExplore(){
  const grid=document.getElementById('eventGrid'); if(!grid)return;
  const search=document.getElementById('eventSearch'), sort=document.getElementById('sortSelect'), apply=document.getElementById('applyFilters');
  function update(){
    const q=(search?.value||'').trim().toLowerCase();
    const cats=[...document.querySelectorAll('.cat-filter:checked')].map(x=>x.value);
    let list=EVENTS.filter(e=>(!q||`${e.title} ${e.cat} ${e.place}`.toLowerCase().includes(q))&&(!cats.length||cats.includes(e.cat)));
    if(sort?.value==='price')list.sort((a,b)=>a.price-b.price); if(sort?.value==='name')list.sort((a,b)=>a.title.localeCompare(b.title));
    renderEvents(list,grid);
  }
  search?.addEventListener('input',update); sort?.addEventListener('change',update); apply?.addEventListener('click',()=>{update();toast('Filters applied.')});
  document.getElementById('resetFilters')?.addEventListener('click',()=>{document.querySelectorAll('.cat-filter').forEach(x=>x.checked=false);if(search)search.value='';if(sort)sort.value='relevance';update();});
  update();
}
function setupHome(){
  renderEvents(EVENTS.slice(0,3),document.getElementById('featuredGrid'));
  document.getElementById('homeSearch')?.addEventListener('submit',e=>{e.preventDefault();const q=document.getElementById('homeQuery').value.trim();location.href='explore.html'+(q?'?q='+encodeURIComponent(q):'');});
}
function setupDetails(){
  const root=document.getElementById('detailImage'); if(!root)return;
  const id=Number(new URLSearchParams(location.search).get('id'))||1, e=EVENTS.find(x=>x.id===id)||EVENTS[0];
  document.querySelectorAll('[data-event-title]').forEach(x=>x.textContent=e.title);
  root.src=e.img;root.alt=e.title;
  const meta=document.getElementById('detailMeta');if(meta)meta.innerHTML=`◷ ${e.date} &nbsp; ◷ ${e.time} &nbsp; ⌖ ${e.place}`;
  const price=document.getElementById('ticketPrice');let qty=1;
  function calc(){const qi=document.getElementById('qtyInput');if(qi)qi.value=qty;const sub=e.price*qty,fee=sub*.05,total=sub+fee;['subTotal','fee','total'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent='$'+[sub,fee,total][i].toFixed(2);});if(price)price.textContent='$'+e.price;}
  document.getElementById('minus')?.addEventListener('click',()=>{qty=Math.max(1,qty-1);calc();});document.getElementById('plus')?.addEventListener('click',()=>{qty=Math.min(10,qty+1);calc();});
  document.getElementById('bookNow')?.addEventListener('click',()=>location.href=`checkout.html?id=${e.id}&qty=${qty}`);
  document.getElementById('wishlist')?.addEventListener('click',()=>{localStorage.setItem('wishlist',e.id);toast('Added to wishlist.');});calc();renderEvents(EVENTS.filter(x=>x.id!==e.id).slice(0,3),document.getElementById('relatedGrid'));
}
function setupCheckout(){
  const form=document.getElementById('checkoutForm'); if(!form)return;
  const params=new URLSearchParams(location.search),id=Number(params.get('id'))||1,qty=Math.min(10,Math.max(1,Number(params.get('qty'))||2)),e=EVENTS.find(x=>x.id===id)||EVENTS[0];
  const title=document.getElementById('checkoutTitle');if(title)title.textContent=e.title;const img=document.getElementById('checkoutImg');if(img){img.src=e.img;img.alt=e.title;}
  document.getElementById('checkoutDate').textContent=e.date+' • '+e.time;document.getElementById('checkoutPlace').textContent=e.place;
  const sub=e.price*qty,fee=sub*.05,tax=sub*.086,total=sub+fee+tax;document.getElementById('registration').textContent='$'+sub.toFixed(2);document.getElementById('serviceFee').textContent='$'+fee.toFixed(2);document.getElementById('tax').textContent='$'+tax.toFixed(2);document.getElementById('checkoutTotal').textContent='$'+total.toFixed(2);
  const radios=form.querySelectorAll('input[name="pay"]'); if(radios[0])radios[0].value='card';if(radios[1])radios[1].value='paypal';
  radios.forEach(r=>r.addEventListener('change',()=>{validateCheckout(form);form.classList.add('was-validated');}));
  bindLiveValidation(form,()=>validateCheckout(form));
  form.addEventListener('submit',ev=>{ev.preventDefault();if(!validateCheckout(form)||!markForm(form))return;localStorage.setItem('lastBooking',JSON.stringify({title:e.title,qty,total,date:Date.now(),email:form.querySelector('input[type="email"]')?.value.trim()}));toast('Order placed successfully!');setTimeout(()=>location.href='dashboard.html',900);});
}
function setupAuth(){
  const login=document.getElementById('loginForm');
  if(login){const email=document.getElementById('loginEmail'),pass=login.querySelector('input[type="password"]');bindLiveValidation(login,()=>{validateEmail(email);validatePassword(pass);});login.addEventListener('submit',e=>{e.preventDefault();validateEmail(email);validatePassword(pass);if(!markForm(login))return;localStorage.setItem('eventifyUser',email.value.trim().toLowerCase());toast('Login successful.');setTimeout(()=>location.href='dashboard.html',700);});}
  const signup=document.getElementById('signupForm');
  if(signup){const name=signup.querySelector('input[placeholder="John Doe"]'),email=document.getElementById('signupEmail'),pass=signup.querySelector('input[type="password"]'),terms=signup.querySelector('input[type="checkbox"]');const validate=()=>{validateCommonName(name);validateEmail(email);validatePassword(pass);if(terms)setCustomValidity(terms,terms.checked?'':'You must agree to the Terms of Service and Privacy Policy.');};bindLiveValidation(signup,validate);signup.addEventListener('submit',e=>{e.preventDefault();validate();if(!markForm(signup))return;localStorage.setItem('eventifyUser',email.value.trim().toLowerCase());toast('Account created successfully.');setTimeout(()=>location.href='dashboard.html',700);});}
}
function setupContact(){
  const f=document.getElementById('contactForm');if(!f)return;
  const name=f.querySelector('input[placeholder="e.g. Alex Johnson"]'),email=f.querySelector('input[type="email"]'),subject=f.querySelector('input[placeholder="How can we help you?"]'),message=f.querySelector('textarea');
  const validate=()=>{validateCommonName(name);validateEmail(email);if(subject)setCustomValidity(subject,subject.value.trim().length>=3?'':'Subject must be at least 3 characters.');if(message)setCustomValidity(message,message.value.trim().length>=10?'':'Message must be at least 10 characters.');};
  bindLiveValidation(f,validate);f.addEventListener('submit',e=>{e.preventDefault();validate();if(!markForm(f))return;toast('Message sent. We will get back to you within 24 hours.');f.reset();f.classList.remove('was-validated');});
}
function setupGlobalSearch(){
  document.querySelectorAll('.header-search').forEach(input=>input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const q=input.value.trim();location.href='explore.html'+(q?'?q='+encodeURIComponent(q):'');}}));
}

document.addEventListener('DOMContentLoaded',()=>{
  setupNewsletter();setupHome();setupExplore();setupDetails();setupCheckout();setupAuth();setupContact();setupGlobalSearch();
  document.getElementById('logout')?.addEventListener('click',()=>{localStorage.removeItem('eventifyUser');location.href='index.html';});
  const q=new URLSearchParams(location.search).get('q');const search=document.getElementById('eventSearch');if(q&&search){search.value=q;search.dispatchEvent(new Event('input'));}
});
