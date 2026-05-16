const API_URL = 'http://localhost:3000/api';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// API helpers
async function apiPost(url, data) { const r=await fetch(API_URL+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); return r.json(); }
async function apiGet(url) { const r=await fetch(API_URL+url); return r.json(); }
async function apiDelete(url) { await fetch(API_URL+url,{method:'DELETE'}); }
async function apiPut(url, data) { await fetch(API_URL+url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); }

// Auth
async function login(email, password) {
    const u = await apiPost('/login', { email, password });
    if (u.error) return alert(u.error);
    currentUser = u; localStorage.setItem('currentUser', JSON.stringify(u));
    updateUI(); closeAuthModal(); navigateTo(u.role === 'admin' ? 'admin' : 'profile');
}
async function register(name, email, password) {
    const r = await apiPost('/register', { name, email, password });
    if (r.error) return alert(r.error);
    alert('Регистрация успешна! Войдите.'); showLoginForm();
}
function logout() { currentUser = null; localStorage.removeItem('currentUser'); updateUI(); navigateTo('home'); }

// UI
function updateUI() {
    const c = document.getElementById('userActions'); if (!c) return;
    if (currentUser) {
        c.innerHTML = `<span class="user-greeting">${currentUser.name}</span>
            <button class="btn-icon" onclick="handleProfileClick()">👤</button>
            <button class="btn-outline" onclick="logout()">Выйти</button>`;
    } else {
        c.innerHTML = `<button class="btn-outline" onclick="openAuthModal()">Войти</button>`;
    }
    loadProjects(); loadNews();
    if (document.getElementById('admin-page')?.classList.contains('active')) renderAdminTab();
    if (document.getElementById('profile-page')?.classList.contains('active')) renderProfile();
}

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page')?.classList.add('active');
    window.scrollTo({top:0, behavior:'smooth'});
    if (page === 'admin') renderAdminTab();
    if (page === 'profile') renderProfile();
}
function handleProfileClick() { currentUser ? navigateTo(currentUser.role === 'admin' ? 'admin' : 'profile') : openAuthModal(); }
function scrollToProjects() { navigateTo('home'); setTimeout(() => document.getElementById('projectsSection').scrollIntoView({behavior:'smooth'}), 100); }

// Projects
const catNames = { environment:'Экология', education:'Образование', social:'Соц.помощь', culture:'Культура' };
let allProjects = [], filterCat = 'all';
async function loadProjects() { allProjects = await apiGet('/projects'); renderProjects(); }
function renderProjects() {
    const g = document.getElementById('projectsGrid'); if (!g) return;
    const f = filterCat === 'all' ? allProjects : allProjects.filter(p => p.category === filterCat);
    g.innerHTML = f.map(p => `
        <div class="project-card" onclick="openProject(${p.id})">
            <div class="card-image">📸</div>
            <div class="card-body"><span class="category">${catNames[p.category]||p.category}</span><h3>${p.title}</h3><p>${(p.description||'').slice(0,100)}...</p></div>
        </div>`).join('');
}
function openProject(id) {
    const p = allProjects.find(x => x.id === id); if (!p) return;
    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
    const dp = document.getElementById('project-detail-page');
    dp.classList.add('active');
    dp.innerHTML = `<div class="container" id="projectDetail" style="padding:40px 0;">
        <button class="btn-outline" onclick="navigateTo('home')" style="margin-bottom:24px;">← Назад к проектам</button>
        <span class="category">${catNames[p.category]||p.category}</span>
        <h2 style="font-size:2rem;margin:12px 0;">${p.title}</h2>
        <p style="font-size:1.1rem;color:var(--text-light);line-height:1.8;">${p.description || 'Описание пока не добавлено.'}</p>
    </div>`;
}

// News
let allNews = [];
async function loadNews() { allNews = await apiGet('/news'); renderNews(); }
function renderNews() {
    const g = document.getElementById('newsGrid'); if (!g) return;
    g.innerHTML = allNews.map(n => `<div class="project-card"><div class="card-image">📰</div><div class="card-body"><div style="color:#94a3b8;font-size:0.8rem;margin-bottom:8px;">${n.date}</div><h3>${n.title}</h3><p>${n.content}</p></div></div>`).join('');
}

// Profile
function renderProfile() {
    const c = document.getElementById('profileCard'); if (!c||!currentUser) return;
    c.innerHTML = `
        <div class="profile-block"><h3>👤 Личные данные</h3><p><strong>${currentUser.name}</strong></p><p>${currentUser.email}</p><p>Роль: ${currentUser.role==='admin'?'Администратор':'Волонтёр'}</p></div>
        <div class="profile-block"><h3>📋 Мои проекты</h3><p>Список проектов, в которых ты участвуешь, появится здесь.</p></div>
        <div class="profile-block"><h3>⏱️ Волонтёрские часы</h3><p>0 часов</p></div>
        <button class="btn-outline" onclick="logout()">Выйти из профиля</button>`;
}

// Admin
let adminTab = 'projects', allUsers = [];
async function switchAdminTab(tab) { adminTab=tab; document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); await renderAdminTab(); }
async function renderAdminTab() {
    const c = document.getElementById('adminTabContent'); if (!c||!currentUser||currentUser.role!=='admin') return;
    if (adminTab==='projects') {
        await loadProjects();
        c.innerHTML = `<ul class="admin-list">${allProjects.map(p=>`<li>${p.title} <button class="btn-outline" style="color:#E31837;border-color:#E31837;" onclick="deleteProject(${p.id})">Удалить</button></li>`).join('')}</ul>
            <form class="admin-form" onsubmit="addProject(event)"><input placeholder="Название" id="npT" required><input placeholder="Описание" id="npD" required><select id="npC"><option>environment</option><option>education</option><option>social</option><option>culture</option></select><button class="btn-primary">Добавить проект</button></form>`;
    } else if (adminTab==='news') {
        await loadNews();
        c.innerHTML = `<ul class="admin-list">${allNews.map(n=>`<li>${n.title} <button class="btn-outline" style="color:#E31837;border-color:#E31837;" onclick="deleteNews(${n.id})">Удалить</button></li>`).join('')}</ul>
            <form class="admin-form" onsubmit="addNews(event)"><input placeholder="Заголовок" id="nnT" required><input placeholder="Текст" id="nnTx" required><input placeholder="Дата (ДД.ММ.ГГГГ)" id="nnD" required><button class="btn-primary">Добавить новость</button></form>`;
    } else {
        allUsers = await apiGet('/users');
        c.innerHTML = `<ul class="admin-list">${allUsers.map(u=>`<li>${u.name} (${u.email}) — <strong>${u.role}</strong> <div style="display:flex;gap:6px;"><button class="btn-outline" onclick="changeRole(${u.id},'${u.role==='admin'?'volunteer':'admin'}')">Сменить роль</button> <button class="btn-outline" style="color:#E31837;border-color:#E31837;" onclick="deleteUser(${u.id})">Удалить</button></div></li>`).join('')}</ul>`;
    }
}
async function addProject(e){e.preventDefault();await apiPost('/projects',{title:document.getElementById('npT').value,description:document.getElementById('npD').value,category:document.getElementById('npC').value});await renderAdminTab();await loadProjects();}
async function deleteProject(id){await apiDelete('/projects/'+id);await renderAdminTab();await loadProjects();}
async function addNews(e){e.preventDefault();await apiPost('/news',{title:document.getElementById('nnT').value,content:document.getElementById('nnTx').value,date:document.getElementById('nnD').value});await renderAdminTab();await loadNews();}
async function deleteNews(id){await apiDelete('/news/'+id);await renderAdminTab();await loadNews();}
async function deleteUser(id){if(id===currentUser.id)return alert('Нельзя удалить себя!');await apiDelete('/users/'+id);await renderAdminTab();}
async function changeRole(id,role){await apiPut('/users/'+id+'/role',{role});await renderAdminTab();}

// Modal
function openAuthModal(){document.getElementById('authModal').classList.add('active');}
function closeAuthModal(){document.getElementById('authModal').classList.remove('active');}
function showRegisterForm(){document.getElementById('loginForm').classList.add('hidden');document.getElementById('registerForm').classList.remove('hidden');}
function showLoginForm(){document.getElementById('registerForm').classList.add('hidden');document.getElementById('loginForm').classList.remove('hidden');}
document.getElementById('loginForm').addEventListener('submit',e=>{e.preventDefault();login(document.getElementById('loginEmail').value,document.getElementById('loginPassword').value);});
document.getElementById('registerForm').addEventListener('submit',e=>{e.preventDefault();register(document.getElementById('regName').value,document.getElementById('regEmail').value,document.getElementById('regPassword').value);});
document.getElementById('contactForm')?.addEventListener('submit',e=>{e.preventDefault();document.getElementById('contactMessage').innerText='Спасибо! Мы свяжемся с вами.';e.target.reset();});

// Init
window.addEventListener('load',()=>{
    updateUI();
    const fb = document.getElementById('filterBar');
    if(fb){['all','environment','education','social','culture'].forEach(cat=>{const b=document.createElement('button');b.className='filter-btn'+(cat==='all'?' active':'');b.textContent=cat==='all'?'Все':catNames[cat];b.onclick=()=>{document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');filterCat=cat;renderProjects();};fb.appendChild(b);});}
});