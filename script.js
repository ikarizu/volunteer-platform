// ============ БАЗА ДАННЫХ (localStorage) ============
const DB_KEY = 'serdce_full_db';

function getDB() {
    let db = localStorage.getItem(DB_KEY);
    if (!db) {
        const initial = {
            users: [
                { id: 1, name: 'Админ МИФИ', email: 'admin@mephi.ru', password: 'admin123', role: 'admin', avatar: '', projects: [] },
                { id: 2, name: 'Иван Волонтёров', email: 'ivan@example.com', password: '123', role: 'volunteer', avatar: '', projects: [] }
            ],
            projects: [
                { id: 1, title: 'Экомарафон «Зелёный кампус»', category: 'environment', description: 'Сбор вторсырья, посадка деревьев и экоуроки.', image: '', volunteers: [], hours: 0 },
                { id: 2, title: 'Цифровой тьютор', category: 'education', description: 'Онлайн-помощь школьникам из малообеспеченных семей.', image: '', volunteers: [], hours: 0 },
                { id: 3, title: 'Помощь ветеранам', category: 'social', description: 'Адресная помощь, общение и забота о старшем поколении.', image: '', volunteers: [], hours: 0 },
                { id: 4, title: 'Культурный фестиваль МИФИ', category: 'culture', description: 'Организация арт-выставок, концертов и мастер-классов.', image: '', volunteers: [], hours: 0 },
                { id: 5, title: 'Энергосбережение в корпусах', category: 'environment', description: 'Аудит и модернизация освещения в учебных зданиях.', image: '', volunteers: [], hours: 0 }
            ],
            news: [
                { id: 1, title: 'Открытие волонтёрского центра', date: '15.04.2025', content: 'В главном корпусе НТИ НИЯУ МИФИ заработал коворкинг для добровольцев.', image: '' },
                { id: 2, title: 'Собрали 2 тонны макулатуры', date: '10.04.2025', content: 'Экомарафон «Зелёный кампус» установил рекорд по сбору вторсырья.', image: '' }
            ],
            nextId: { projects: 6, news: 3, users: 3 }
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(db);
}

function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

// ============ СОСТОЯНИЕ ============
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let filterCat = 'all';

// ============ АВТОРИЗАЦИЯ ============
function login(email, password) {
    const db = getDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return alert('Неверный email или пароль');
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateUI();
    closeAuthModal();
    navigateTo(user.role === 'admin' ? 'admin' : 'profile');
    alert(`Добро пожаловать, ${user.name}!`);
}

function register(name, email, password) {
    const db = getDB();
    if (db.users.find(u => u.email === email)) return alert('Email уже занят');
    const newUser = {
        id: db.nextId.users++,
        name, email, password,
        role: 'volunteer',
        avatar: '',
        projects: []
    };
    db.users.push(newUser);
    saveDB(db);
    alert('Регистрация успешна! Войдите.');
    showLoginForm();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUI();
    navigateTo('home');
}

// ============ UI ============
function updateUI() {
    const c = document.getElementById('userActions');
    if (!c) return;
    if (currentUser) {
        c.innerHTML = `<span class="user-greeting">${currentUser.name}</span>
            <button class="btn-icon" onclick="handleProfileClick()">👤</button>
            <button class="btn-outline" onclick="logout()">Выйти</button>`;
    } else {
        c.innerHTML = `<button class="btn-outline" onclick="openAuthModal()">Войти</button>`;
    }
    updateStats();
    renderAll();
}

function updateStats() {
    const db = getDB();
    const volCount = document.getElementById('volunteersCount');
    const projCount = document.getElementById('projectsCount');
    const hoursCount = document.getElementById('hoursCount');
    if (volCount) volCount.textContent = db.users.filter(u => u.role === 'volunteer').length;
    if (projCount) projCount.textContent = db.projects.length;
    if (hoursCount) {
        const totalHours = db.projects.reduce((sum, p) => sum + (p.hours || 0), 0);
        hoursCount.textContent = totalHours;
    }
}

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(page + '-page');
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'admin') renderAdminTab();
    if (page === 'profile') renderProfile();
}

function handleProfileClick() {
    currentUser ? navigateTo(currentUser.role === 'admin' ? 'admin' : 'profile') : openAuthModal();
}

function scrollToProjects() {
    navigateTo('home');
    setTimeout(() => document.getElementById('projectsSection').scrollIntoView({ behavior: 'smooth' }), 100);
}

// ============ КАТЕГОРИИ ============
const catNames = { environment: 'Экология', education: 'Образование', social: 'Соц.помощь', culture: 'Культура' };

// ============ РЕНДЕР ВСЕГО ============
function renderAll() {
    renderProjects();
    renderNews();
}

function renderProjects() {
    const db = getDB();
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const filtered = filterCat === 'all' ? db.projects : db.projects.filter(p => p.category === filterCat);
    grid.innerHTML = filtered.map(p => `
        <div class="project-card" onclick="openProject(${p.id})">
            ${p.image ? `<img src="${p.image}" class="card-image" onerror="this.style.display='none'">` : '<div class="card-image">📸</div>'}
            <div class="card-body">
                <span class="category">${catNames[p.category] || p.category}</span>
                <h3>${p.title}</h3>
                <p>${(p.description || '').slice(0, 100)}...</p>
                <div style="font-size:0.85rem;color:var(--text-light);margin-top:8px;">
                    👥 ${(p.volunteers || []).length} волонтёров · ⏱ ${p.hours || 0} часов
                </div>
            </div>
        </div>
    `).join('');
}

function renderNews() {
    const db = getDB();
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    grid.innerHTML = db.news.map(n => `
        <div class="project-card">
            ${n.image ? `<img src="${n.image}" class="card-image" onerror="this.style.display='none'">` : '<div class="card-image">📰</div>'}
            <div class="card-body">
                <div style="color:#94a3b8;font-size:0.8rem;margin-bottom:8px;">${n.date}</div>
                <h3>${n.title}</h3>
                <p>${n.content}</p>
            </div>
        </div>
    `).join('');
}

// ============ ДЕТАЛЬНАЯ ПРОЕКТА ============
function openProject(id) {
    const db = getDB();
    const p = db.projects.find(x => x.id === id);
    if (!p) return;

    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
    const dp = document.getElementById('project-detail-page');
    dp.classList.add('active');

    const isJoined = currentUser && (p.volunteers || []).includes(currentUser.id);

    dp.innerHTML = `<div class="container" style="padding:40px 0;">
        <button class="btn-outline" onclick="navigateTo('home')" style="margin-bottom:24px;">← Назад к проектам</button>
        ${p.image ? `<img src="${p.image}" style="width:100%;max-height:400px;object-fit:cover;border-radius:var(--radius);margin-bottom:20px;" onerror="this.style.display='none'">` : ''}
        <span class="category">${catNames[p.category] || p.category}</span>
        <h2 style="font-size:2rem;margin:12px 0;">${p.title}</h2>
        <p style="font-size:1.1rem;line-height:1.8;color:var(--text-light);margin-bottom:20px;">${p.description || 'Описание пока не добавлено.'}</p>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
            ${currentUser && currentUser.role === 'volunteer' ?
            (isJoined ?
                `<button class="btn-outline" onclick="leaveProject(${p.id})">❌ Отписаться</button>` :
                `<button class="btn-primary" onclick="joinProject(${p.id})">✅ Участвовать</button>`
            ) :
            (!currentUser ? `<button class="btn-primary" onclick="openAuthModal()">Войдите, чтобы участвовать</button>` : '')
        }
            <span style="color:var(--text-light);">👥 ${(p.volunteers || []).length} волонтёров</span>
        </div>
        ${currentUser && currentUser.role === 'admin' ? `
            <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:var(--radius-sm);">
                <strong>Волонтёры проекта:</strong>
                <ul style="margin-top:8px;">${(p.volunteers || []).map(vid => {
            const u = db.users.find(u => u.id === vid);
            return u ? `<li>${u.name} (${u.email})</li>` : '';
        }).join('')}</ul>
            </div>
        ` : ''}
    </div>`;
    window.scrollTo({ top: 0 });
}

function joinProject(projectId) {
    const db = getDB();
    const project = db.projects.find(p => p.id === projectId);
    const user = db.users.find(u => u.id === currentUser.id);
    if (!project || !user) return;
    if (!project.volunteers) project.volunteers = [];
    if (!user.projects) user.projects = [];
    if (project.volunteers.includes(user.id)) return alert('Вы уже участвуете!');
    project.volunteers.push(user.id);
    user.projects.push(projectId);
    project.hours = (project.hours || 0) + 2;
    saveDB(db);
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateStats();
    openProject(projectId);
    alert('Вы записаны в проект! +2 волонтёрских часа.');
}

function leaveProject(projectId) {
    const db = getDB();
    const project = db.projects.find(p => p.id === projectId);
    const user = db.users.find(u => u.id === currentUser.id);
    if (!project || !user) return;
    project.volunteers = (project.volunteers || []).filter(vid => vid !== user.id);
    user.projects = (user.projects || []).filter(pid => pid !== projectId);
    saveDB(db);
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateStats();
    openProject(projectId);
    alert('Вы отписаны от проекта.');
}

// ============ ПРОФИЛЬ ============
function renderProfile() {
    const c = document.getElementById('profileCard');
    if (!c || !currentUser) return;
    const db = getDB();
    const userProjects = (currentUser.projects || []).map(pid => db.projects.find(p => p.id === pid)).filter(Boolean);
    const totalHours = userProjects.reduce((sum, p) => sum + (p.hours || 0) / (p.volunteers?.length || 1), 0);

    c.innerHTML = `
        <div class="profile-block" style="text-align:center;">
            ${currentUser.avatar ? `<img src="${currentUser.avatar}" class="profile-avatar" onerror="this.style.display='none'">` : '<div class="profile-avatar" style="display:flex;align-items:center;justify-content:center;font-size:3rem;">👤</div>'}
            <button class="btn-outline btn-sm" onclick="openImageModal('avatar')">📷 Сменить фото</button>
            <h3 style="margin-top:12px;">${currentUser.name}</h3>
            <p>${currentUser.email}</p>
            <p>Роль: ${currentUser.role === 'admin' ? 'Администратор' : 'Волонтёр'}</p>
        </div>
        <div class="profile-block">
            <h3>📋 Мои проекты</h3>
            ${userProjects.length ? userProjects.map(p => `<p>✅ ${p.title} (${p.hours || 0} часов)</p>`).join('') : '<p>Вы пока не участвуете в проектах.</p>'}
        </div>
        <div class="profile-block">
            <h3>⏱️ Волонтёрские часы</h3>
            <p><strong>${Math.round(totalHours)} часов</strong></p>
        </div>
        <button class="btn-outline" onclick="logout()">Выйти из профиля</button>
    `;
}

// ============ АДМИНКА ============
let adminTab = 'projects';

function switchAdminTab(tab) {
    adminTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderAdminTab();
}

function renderAdminTab() {
    const db = getDB();
    const c = document.getElementById('adminTabContent');
    if (!c || !currentUser || currentUser.role !== 'admin') return;

    if (adminTab === 'projects') {
        c.innerHTML = `<ul class="admin-list">${db.projects.map(p => `
            <li>
                <span>${p.title} (👥${(p.volunteers || []).length})</span>
                <div style="display:flex;gap:6px;">
                    <button class="btn-outline btn-sm" onclick="openImageModal('project', ${p.id})">🖼</button>
                    <button class="btn-outline btn-sm" style="color:#E31837;border-color:#E31837;" onclick="deleteProject(${p.id})">Удалить</button>
                </div>
            </li>`).join('')}</ul>
            <form class="admin-form" onsubmit="addProject(event)">
                <input placeholder="Название" id="npT" required>
                <textarea placeholder="Описание" id="npD" required rows="3"></textarea>
                <select id="npC"><option>environment</option><option>education</option><option>social</option><option>culture</option></select>
                <button class="btn-primary">Добавить проект</button>
            </form>`;
    } else if (adminTab === 'news') {
        c.innerHTML = `<ul class="admin-list">${db.news.map(n => `
            <li>
                <span>${n.title}</span>
                <div style="display:flex;gap:6px;">
                    <button class="btn-outline btn-sm" onclick="openImageModal('news', ${n.id})">🖼</button>
                    <button class="btn-outline btn-sm" style="color:#E31837;border-color:#E31837;" onclick="deleteNews(${n.id})">Удалить</button>
                </div>
            </li>`).join('')}</ul>
            <form class="admin-form" onsubmit="addNews(event)">
                <input placeholder="Заголовок" id="nnT" required>
                <textarea placeholder="Текст" id="nnTx" required rows="3"></textarea>
                <input placeholder="Дата (ДД.ММ.ГГГГ)" id="nnD" required>
                <button class="btn-primary">Добавить новость</button>
            </form>`;
    } else if (adminTab === 'users') {
        c.innerHTML = `<ul class="admin-list">${db.users.map(u => `
            <li>
                ${u.name} (${u.email}) — <strong>${u.role}</strong>
                <div style="display:flex;gap:6px;">
                    <button class="btn-outline btn-sm" onclick="changeRole(${u.id}, '${u.role === 'admin' ? 'volunteer' : 'admin'}')">Сменить роль</button>
                    <button class="btn-outline btn-sm" style="color:#E31837;border-color:#E31837;" onclick="deleteUser(${u.id})">Удалить</button>
                </div>
            </li>`).join('')}</ul>`;
    } else if (adminTab === 'volunteers') {
        let html = '<h3>Волонтёры по проектам</h3>';
        db.projects.forEach(p => {
            html += `<div style="margin-bottom:16px;padding:16px;background:white;border-radius:var(--radius-sm);box-shadow:var(--shadow);">
                <strong>${p.title}</strong> (👥${(p.volunteers || []).length})
                <ul style="margin-top:8px;">${(p.volunteers || []).map(vid => {
                const u = db.users.find(u => u.id === vid);
                return u ? `<li>${u.name} (${u.email})</li>` : '';
            }).join('') || '<li>Нет волонтёров</li>'}</ul>
            </div>`;
        });
        c.innerHTML = html;
    }
}

function addProject(e) {
    e.preventDefault();
    const db = getDB();
    db.projects.push({
        id: db.nextId.projects++,
        title: document.getElementById('npT').value,
        description: document.getElementById('npD').value,
        category: document.getElementById('npC').value,
        image: '', volunteers: [], hours: 0
    });
    saveDB(db);
    updateStats();
    renderAdminTab();
    renderProjects();
    e.target.reset();
}

function deleteProject(id) {
    const db = getDB();
    db.projects = db.projects.filter(p => p.id !== id);
    saveDB(db);
    updateStats();
    renderAdminTab();
    renderProjects();
}

function addNews(e) {
    e.preventDefault();
    const db = getDB();
    db.news.push({
        id: db.nextId.news++,
        title: document.getElementById('nnT').value,
        content: document.getElementById('nnTx').value,
        date: document.getElementById('nnD').value,
        image: ''
    });
    saveDB(db);
    renderAdminTab();
    renderNews();
    e.target.reset();
}

function deleteNews(id) {
    const db = getDB();
    db.news = db.news.filter(n => n.id !== id);
    saveDB(db);
    renderAdminTab();
    renderNews();
}

function deleteUser(id) {
    if (id === currentUser.id) return alert('Нельзя удалить себя!');
    const db = getDB();
    db.users = db.users.filter(u => u.id !== id);
    db.projects.forEach(p => p.volunteers = (p.volunteers || []).filter(vid => vid !== id));
    saveDB(db);
    updateStats();
    renderAdminTab();
}

function changeRole(id, newRole) {
    const db = getDB();
    const user = db.users.find(u => u.id === id);
    if (user) { user.role = newRole; saveDB(db); renderAdminTab(); }
}

// ============ ЗАГРУЗКА ИЗОБРАЖЕНИЙ ============
let imageTarget = { type: '', id: null };

function openImageModal(type, id) {
    imageTarget = { type, id };
    document.getElementById('imageModal').classList.add('active');
    document.getElementById('imageUrl').value = '';
    document.getElementById('imageFile').value = '';
}

function closeImageModal() {
    document.getElementById('imageModal').classList.remove('active');
}

function saveImage() {
    const url = document.getElementById('imageUrl').value.trim();
    const fileInput = document.getElementById('imageFile');
    const db = getDB();

    function applyImage(imgUrl) {
        if (imageTarget.type === 'avatar') {
            const user = db.users.find(u => u.id === currentUser.id);
            if (user) { user.avatar = imgUrl; currentUser = user; localStorage.setItem('currentUser', JSON.stringify(user)); }
        } else if (imageTarget.type === 'project') {
            const project = db.projects.find(p => p.id === imageTarget.id);
            if (project) project.image = imgUrl;
        } else if (imageTarget.type === 'news') {
            const news = db.news.find(n => n.id === imageTarget.id);
            if (news) news.image = imgUrl;
        }
        saveDB(db);
        closeImageModal();
        renderAll();
        if (document.getElementById('profile-page').classList.contains('active')) renderProfile();
        if (document.getElementById('admin-page').classList.contains('active')) renderAdminTab();
    }

    if (url) {
        applyImage(url);
    } else if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => applyImage(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        alert('Вставьте ссылку или выберите файл.');
    }
}

// ============ МОДАЛКИ ============
function openAuthModal() { document.getElementById('authModal').classList.add('active'); }
function closeAuthModal() { document.getElementById('authModal').classList.remove('active'); }
function showRegisterForm() { document.getElementById('loginForm').classList.add('hidden'); document.getElementById('registerForm').classList.remove('hidden'); }
function showLoginForm() { document.getElementById('registerForm').classList.add('hidden'); document.getElementById('loginForm').classList.remove('hidden'); }

document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value);
});
document.getElementById('registerForm').addEventListener('submit', e => {
    e.preventDefault();
    register(document.getElementById('regName').value, document.getElementById('regEmail').value, document.getElementById('regPassword').value);
});
document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('contactMessage').innerText = 'Спасибо! Мы свяжемся с вами.';
    e.target.reset();
});

// ============ ИНИЦИАЛИЗАЦИЯ ============
window.addEventListener('load', () => {
    getDB();
    updateUI();

    const fb = document.getElementById('filterBar');
    if (fb) {
        ['all', 'environment', 'education', 'social', 'culture'].forEach(cat => {
            const b = document.createElement('button');
            b.className = 'filter-btn' + (cat === 'all' ? ' active' : '');
            b.textContent = cat === 'all' ? 'Все' : catNames[cat];
            b.onclick = () => {
                document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                filterCat = cat;
                renderProjects();
            };
            fb.appendChild(b);
        });
    }
});