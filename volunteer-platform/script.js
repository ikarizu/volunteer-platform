// ************** Данные **************
const projects = [
    { id: 1, title: "Экомарафон «Зелёный кампус»", cat: "environment", desc: "Сбор вторсырья, посадка деревьев и экоуроки.", img: null },
    { id: 2, title: "Цифровой тьютор", cat: "education", desc: "Онлайн-помощь школьникам из малообеспеченных семей.", img: null },
    { id: 3, title: "Помощь ветеранам", cat: "social", desc: "Адресная помощь, общение и забота о старшем поколении.", img: null },
    { id: 4, title: "Культурный фестиваль МИФИ", cat: "culture", desc: "Организация арт-выставок, концертов и мастер-классов.", img: null },
    { id: 5, title: "Энергосбережение в корпусах", cat: "environment", desc: "Аудит и модернизация освещения в учебных зданиях.", img: null }
];

const news = [
    { title: "Открытие нового волонтёрского центра", date: "15 апреля 2025", text: "В главном корпусе НТИ НИЯУ МИФИ заработал коворкинг для добровольцев." },
    { title: "Студенты собрали 2 тонны макулатуры", date: "10 апреля 2025", text: "Экомарафон «Зелёный кампус» установил рекорд по сбору вторсырья." },
    { title: "Волонтёры получили благодарность от мэрии", date: "3 апреля 2025", text: "Команда «Сердце студенчества» награждена за вклад в благоустройство города." }
];

// ************** Роутинг и страницы **************
const pages = document.querySelectorAll('.page');
const profileBtn = document.getElementById('profileBtn');
const loginBtn = document.getElementById('loginBtn');
const userGreeting = document.getElementById('userGreeting');

function navigateTo(pageId) {
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToProjects() {
    navigateTo('home');
    setTimeout(() => {
        document.getElementById('projectsSection').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// Обработка кнопки профиля
function handleProfileClick() {
    if (localStorage.getItem('currentUser')) {
        navigateTo('profile');
        updateProfilePage();
    } else {
        openAuthModal();
    }
}

// ************** Авторизация / Регистрация **************
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function openAuthModal() { authModal.classList.add('active'); }
function closeAuthModal() { authModal.classList.remove('active'); }

function showRegisterForm() {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
}
function showLoginForm() {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
}

// Регистрация
registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    if (!name || !email || !password) return alert('Заполните все поля');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) return alert('Пользователь с таким email уже существует');
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Регистрация успешна! Теперь войдите.');
    showLoginForm();
    registerForm.reset();
});

// Вход
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return alert('Неверный email или пароль');
    localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
    alert('Добро пожаловать, ' + user.name + '!');
    closeAuthModal();
    updateUIforAuth(user);
    loginForm.reset();
    navigateTo('profile');
    updateProfilePage();
});

function logout() {
    localStorage.removeItem('currentUser');
    updateUIforAuth(null);
    navigateTo('home');
    alert('Вы вышли из профиля');
}

function updateUIforAuth(user) {
    if (user) {
        loginBtn.style.display = 'none';
        userGreeting.textContent = user.name;
        userGreeting.style.display = 'inline';
    } else {
        loginBtn.style.display = 'inline-flex';
        userGreeting.textContent = '';
        userGreeting.style.display = 'none';
    }
}

function updateProfilePage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
    }
}

// Проверка при загрузке
window.addEventListener('load', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    updateUIforAuth(currentUser);
    navigateTo('home');
    renderProjects('all');
    renderNews();
});

// ************** Рендер проектов и новостей **************
function renderProjects(filter = 'all') {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';
    const filtered = filter === 'all' ? projects : projects.filter(p => p.cat === filter);
    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="card-image image-placeholder">
                <svg width="48" height="48" fill="none" stroke="#9ca3af" stroke-width="2">
                    <rect x="8" y="8" width="32" height="32" rx="4"/><circle cx="24" cy="20" r="6"/><path d="M16 40l8-12 8 12"/>
                </svg>
                <span>Фото проекта</span>
            </div>
            <div class="card-body">
                <span class="category">${getCatName(p.cat)}</span>
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
                <button class="btn-primary" style="padding:10px 20px; font-size:0.9rem;" onclick="handleProfileClick()">Участвовать →</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderNews() {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    news.forEach(n => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-image image-placeholder">
                <svg width="40" height="40" fill="none" stroke="#9ca3af"><rect x="8" y="8" width="24" height="24" rx="2"/><path d="M16 16l8 8M24 16l-8 8"/></svg>
                <span>Новостное фото</span>
            </div>
            <div class="news-body">
                <div class="date">${n.date}</div>
                <h3>${n.title}</h3>
                <p>${n.text}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function getCatName(cat) {
    const map = { environment: 'Экология', education: 'Образование', social: 'Соц.помощь', culture: 'Культура' };
    return map[cat] || cat;
}

// Фильтры проектов
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderProjects(this.dataset.filter);
    });
});

// Форма обратной связи
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('contactMessage').innerHTML = '<span style="color:green;">Спасибо! Мы свяжемся с вами.</span>';
    this.reset();
});

// Анимированные счётчики
function animateCounter(el, target) {
    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
    }, 40);
}
window.addEventListener('load', () => {
    setTimeout(() => {
        animateCounter(document.getElementById('volunteersCount'), 148);
        animateCounter(document.getElementById('projectsCount'), 22);
        animateCounter(document.getElementById('hoursCount'), 3200);
    }, 400);
});

// Закрытие модалки по клику вне области
window.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
});