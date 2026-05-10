let scene, camera, renderer, perfumeBottle, particles = [];

function init3D() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xd4af37, 2, 20);
    pointLight1.position.set(4, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 15);
    pointLight2.position.set(-4, 2, 4);
    scene.add(pointLight2);

    const rimLight = new THREE.PointLight(0xd4af37, 0.8, 15);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    // TRANSPARENT LUXURY BOTTLE
    const bottleGroup = new THREE.Group();

    // Main body - glass-like transparent
    const bodyGeo = new THREE.CylinderGeometry(0.85, 0.9, 2.8, 64, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xd4af37,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.35,
        transmission: 0.85,
        thickness: 0.5,
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0,
        side: THREE.DoubleSide
    });
    const body = new THREE.Mesh(bodyGeo, glassMat);
    bottleGroup.add(body);

    // Inner liquid glow
    const liquidGeo = new THREE.CylinderGeometry(0.7, 0.75, 2.4, 32);
    const liquidMat = new THREE.MeshPhongMaterial({
        color: 0xd4af37,
        emissive: 0xaa8a00,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = -0.1;
    bottleGroup.add(liquid);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.3, 0.75, 0.8, 32);
    const neckMat = new THREE.MeshPhysicalMaterial({
        color: 0xd4af37,
        metalness: 0.2,
        roughness: 0.05,
        transparent: true,
        opacity: 0.4,
        transmission: 0.7,
        clearcoat: 1
    });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.y = 1.8;
    bottleGroup.add(neck);

    // Cap - metallic gold
    const capGeo = new THREE.CylinderGeometry(0.35, 0.32, 0.7, 32);
    const capMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.1
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 2.55;
    bottleGroup.add(cap);

    // Cap top sphere
    const capTopGeo = new THREE.SphereGeometry(0.2, 32, 32);
    const capTop = new THREE.Mesh(capTopGeo, capMat);
    capTop.position.y = 3.0;
    bottleGroup.add(capTop);

    // Decorative ring
    const ringGeo = new THREE.TorusGeometry(0.88, 0.05, 8, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.1 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.8;
    ring.rotation.x = Math.PI / 2;
    bottleGroup.add(ring);

    const ring2 = ring.clone();
    ring2.position.y = -0.8;
    bottleGroup.add(ring2);

    perfumeBottle = bottleGroup;
    scene.add(perfumeBottle);

    // Particles - smoke/mist effect
    createIntroParticles();

    camera.position.set(0, 0, 7);
    animateIntro();
}

function createIntroParticles() {
    const particleGeo = new THREE.SphereGeometry(0.04, 6, 6);
    for (let i = 0; i < 150; i++) {
        const mat = new THREE.MeshBasicMaterial({
            color: 0xd4af37,
            transparent: true,
            opacity: Math.random() * 0.3
        });
        const p = new THREE.Mesh(particleGeo, mat);
        resetParticle(p, true);
        scene.add(p);
        particles.push(p);
    }
}

function resetParticle(p, random = false) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.4;
    p.position.set(
        Math.cos(angle) * radius,
        random ? (Math.random() * 8 - 2) : 1.5,
        Math.sin(angle) * radius
    );
    p.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.025,
        0.04 + Math.random() * 0.04,
        (Math.random() - 0.5) * 0.025
    );
    p.userData.life = random ? Math.random() : 0;
    p.material.opacity = 0.3;
}

let introTime = 0;
function animateIntro() {
    requestAnimationFrame(animateIntro);
    introTime += 0.01;

    if (perfumeBottle) {
        perfumeBottle.rotation.y += 0.008;
        perfumeBottle.position.y = Math.sin(introTime) * 0.15;
    }

    particles.forEach(p => {
        p.position.add(p.userData.velocity);
        p.userData.life += 0.008;
        p.material.opacity = 0.3 * (1 - p.userData.life);
        if (p.userData.life >= 1) resetParticle(p);
    });

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== CARD 3D BOTTLE =====
function createBottleCanvas(containerId, color = 0xd4af37) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const w = container.clientWidth || 300;
    const h = container.clientHeight || 280;

    const s = new THREE.Scene();
    const c = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setSize(w, h);
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(r.domElement);

    // Lights
    s.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pl = new THREE.PointLight(0xd4af37, 2, 20);
    pl.position.set(3, 4, 3);
    s.add(pl);
    s.add(Object.assign(new THREE.PointLight(0xffffff, 0.6, 15), { position: new THREE.Vector3(-3, 1, 2) }));

    const group = new THREE.Group();

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.05,
        roughness: 0.05,
        transparent: true,
        opacity: 0.3,
        transmission: 0.9,
        clearcoat: 1,
        clearcoatRoughness: 0,
        side: THREE.DoubleSide
    });

    const liquidMat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.55
    });

    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.1 });

    // Body
    group.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 2.4, 48), glassMat)));

    // Liquid inside
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 2.0, 32), liquidMat);
    liq.position.y = -0.1;
    group.add(liq);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.65, 0.7, 32), glassMat);
    neck.position.y = 1.55;
    group.add(neck);

    // Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.6, 32), metalMat);
    cap.position.y = 2.15;
    group.add(cap);

    // Sphere on cap
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 32), metalMat);
    sphere.position.y = 2.55;
    group.add(sphere);

    // Ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.04, 8, 48), metalMat);
    ring.position.y = 0.6;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    s.add(group);
    c.position.set(0, 0.5, 6);
    c.lookAt(0, 0.3, 0);

    let t = 0;
    function loop() {
        requestAnimationFrame(loop);
        t += 0.01;
        group.rotation.y += 0.008;
        group.position.y = Math.sin(t) * 0.08;
        r.render(s, c);
    }
    loop();
}

// Smoke particles in card
function addSmokeToCard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const parentEl = container.parentElement;

    for (let i = 0; i < 6; i++) {
        const smoke = document.createElement('div');
        smoke.className = 'smoke-particle';
        const size = 6 + Math.random() * 10;
        smoke.style.cssText = `
            width: ${size}px; height: ${size}px;
            bottom: 30px;
            left: ${40 + Math.random() * 20}%;
            animation-duration: ${3 + Math.random() * 3}s;
            animation-delay: ${Math.random() * 3}s;
            --drift: ${(Math.random() - 0.5) * 40}px;
        `;
        parentEl.appendChild(smoke);
    }
}

// ===== NAVIGATION =====
const enterBtn = document.getElementById('enter-btn');
const introSection = document.getElementById('intro-section');
const loginSection = document.getElementById('login-section');
const mainContent = document.getElementById('main-content');
const loginBtn = document.getElementById('login-btn');

enterBtn.addEventListener('click', () => {
    introSection.classList.remove('active');
    introSection.style.display = 'none';
    loginSection.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    loginSection.classList.remove('active');
    loginSection.style.display = 'none';
    mainContent.classList.add('active');
    renderPerfumes();
    createHeroParticles();
});

function showPage(pageId) {
    const pages = ['men-page', 'women-page', 'ai-page'];
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (id === pageId) {
            el.classList.remove('hidden');
            el.scrollIntoView({ behavior: 'smooth' });
        } else {
            el.classList.add('hidden');
        }
    });
}

// ===== HERO PARTICLES =====
function createHeroParticles() {
    const container = document.getElementById('hero-particles');
    for (let i = 0; i < 40; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: absolute;
            width: ${1 + Math.random() * 3}px;
            height: ${1 + Math.random() * 3}px;
            background: rgba(212,175,55,${0.1 + Math.random() * 0.3});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: floatDot ${5 + Math.random() * 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(dot);
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatDot {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100px) translateX(${Math.random() > 0.5 ? '' : '-'}30px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ===== PERFUME DATA =====
const perfumes = [
    {
        id: 1, name: "إلهام الملكي", category: "men", price: "750 جنيه",
        usage: "سهرات", usageLabel: "🌙 للسهرات الفاخرة",
        snippet: "عطر ملكي يجمع بين العود الداكن والمسك الشرقي، يمنحك هيبة لا تُنسى.",
        tags: ["فاخر", "شرقي", "دافئ"],
        notes: ["عود", "مسك", "عنبر", "صندل"],
        description: "إلهام الملكي هو تجسيد للثقة والأناقة. مزيج نادر من العود الداكن مع المسك الشرقي الدافئ، مغلف بأريج العنبر وخشب الصندل. عطر يترك أثراً لا يُنسى في كل مكان تدخله.",
        rating: 4.8, reviews: 234,
        color: 0xaa5500,
        img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 2, name: "إلهام الصباح", category: "men", price: "550 جنيه",
        usage: "عمل", usageLabel: "☀️ للعمل والجامعة",
        snippet: "نضارة الصباح في قارورة، خفيف ومنعش يرافقك طوال النهار بثقة.",
        tags: ["منعش", "خفيف", "نهاري"],
        notes: ["حمضيات", "خشب", "بيرغموت", "أرز"],
        description: "إلهام الصباح عطر يوحي بالانطلاق والحيوية. رائحة منعشة تبدأ بالحمضيات البرية وتستقر على خشب الأرز الدافئ. مثالي للنهار الطويل المليء بالإنجازات.",
        rating: 4.6, reviews: 189,
        color: 0x336633,
        img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 3, name: "إلهام الزهور", category: "women", price: "680 جنيه",
        usage: "مناسبات", usageLabel: "🌹 للمناسبات الخاصة",
        snippet: "باقة من أرق الزهور الشرقية، عطر يشعرك بالجمال والأنوثة في كل لحظة.",
        tags: ["زهري", "رومانسي", "ناعم"],
        notes: ["وردة", "ياسمين", "مسك أبيض", "فانيليا"],
        description: "إلهام الزهور هدية من حديقة الأحلام. يفتتح بعطر الوردة الدمشقية ثم يتطور إلى ياسمين حالم مع لمسة من المسك الأبيض والفانيليا. عطر يُلبسك سحراً لا يقاوم.",
        rating: 4.9, reviews: 312,
        color: 0xdd6688,
        img: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 4, name: "إلهام الكلاسيكي", category: "women", price: "600 جنيه",
        usage: "يومي", usageLabel: "💫 للاستخدام اليومي",
        snippet: "رفاهية يومية بأناقة هادئة، عطر يناسب كل امرأة في كل وقت.",
        tags: ["كلاسيكي", "أنيق", "متعدد"],
        notes: ["بودر", "خوخ", "خشب الورد", "مسك"],
        description: "إلهام الكلاسيكي هو رفيقتك في كل يوم. مزيج متوازن من البودر الناعم والخوخ الحلو مع خشب الورد الدافئ. بسيط في ظاهره، عميق في أثره.",
        rating: 4.7, reviews: 267,
        color: 0xcc9955,
        img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=400"
    }
];

// ===== RENDER PERFUMES =====
function renderPerfumes() {
    const menGrid = document.getElementById('men-grid');
    const womenGrid = document.getElementById('women-grid');

    perfumes.forEach((p, idx) => {
        const starsHtml = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(p.rating));
        const bottleId = `bottle-${p.id}`;

        const card = document.createElement('div');
        card.className = 'perfume-card';
        card.innerHTML = `
            <div class="bottle-container" id="${bottleId}">
                <div class="bottle-glow"></div>
            </div>
            <div class="card-body">
                <h3>${p.name}</h3>
                <p class="perfume-snippet">${p.snippet}</p>
                <div class="perfume-tags">
                    <span class="tag">${p.usageLabel}</span>
                    ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
                <div class="card-footer">
                    <span class="price">${p.price}</span>
                    <div>
                        <div class="stars">${starsHtml}</div>
                        <div style="font-size:0.7rem;color:#666;text-align:center">${p.reviews} تقييم</div>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openModal(p));

        if (p.category === 'men') menGrid.appendChild(card);
        else womenGrid.appendChild(card);

        // Create 3D bottle after card is in DOM
        setTimeout(() => {
            createBottleCanvas(bottleId, p.color);
            addSmokeToCard(bottleId);
        }, 100 + idx * 50);
    });
}

// ===== MODAL =====
function openModal(p) {
    const modal = document.getElementById('perfume-modal');
    const modalBody = document.getElementById('modal-body');
    const starsHtml = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));

    modalBody.innerHTML = `
        <div class="modal-bottle" id="modal-bottle-${p.id}">
            <div class="bottle-glow"></div>
        </div>
        <div class="modal-info">
            <h2>${p.name}</h2>
            <span class="modal-usage-badge">${p.usageLabel}</span>
            <p class="modal-desc">${p.description}</p>
            <div class="modal-notes">
                <h4>✦ النوتات العطرية</h4>
                <div class="notes-pills">
                    ${p.notes.map(n => `<span class="note-pill">${n}</span>`).join('')}
                </div>
            </div>
            <div class="modal-footer-row">
                <span class="modal-price">${p.price}</span>
                <div class="modal-rating">
                    <div class="modal-stars">${starsHtml}</div>
                    <div class="modal-rating-count">${p.reviews} تقييم · ${p.rating}/5</div>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        createBottleCanvas(`modal-bottle-${p.id}`, p.color);
        addSmokeToCard(`modal-bottle-${p.id}`);
    }, 100);
}

function closeModal() {
    document.getElementById('perfume-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

// ===== AI QUIZ =====
const questions = [
    {
        text: "ما هو جنسك؟",
        options: [
            { text: "رجل", emoji: "👔" },
            { text: "امرأة", emoji: "👗" }
        ],
        key: "gender"
    },
    {
        text: "ما هو الوقت الذي تفضل فيه العطر؟",
        options: [
            { text: "الصباح والنهار", emoji: "☀️" },
            { text: "المساء والليل", emoji: "🌙" }
        ],
        key: "time"
    },
    {
        text: "ما هي الأجواء التي تفضلها؟",
        options: [
            { text: "هادئة وأنيقة", emoji: "🕊️" },
            { text: "حيوية وجريئة", emoji: "🔥" }
        ],
        key: "mood"
    },
    {
        text: "ما هو موسمك المفضل؟",
        options: [
            { text: "الربيع والصيف", emoji: "🌸" },
            { text: "الخريف والشتاء", emoji: "🍂" }
        ],
        key: "season"
    },
    {
        text: "ما هو مزاجك المعتاد؟",
        options: [
            { text: "رومانسي وعاطفي", emoji: "💫" },
            { text: "عملي وواثق", emoji: "💼" }
        ],
        key: "vibe"
    }
];

let currentQ = 0;
let userAnswers = {};

const personalities = {
    "رجل-المساء والليل-حيوية وجريئة": {
        name: "الملك الليلي",
        desc: "شخصيتك قوية وجذابة، تملأ الغرفة بحضورك حيثما ذهبت. أنت من يُجسّد الفخامة الشرقية بكل تفاصيلها.",
        perfume: 0
    },
    "رجل-الصباح والنهار-هادئة وأنيقة": {
        name: "الرجل الهادف",
        desc: "شخصيتك متزنة وواثقة، تؤمن بأن الأناقة الحقيقية في التفاصيل. إنجازاتك تتكلم عنك.",
        perfume: 1
    },
    "رجل-المساء والليل-هادئة وأنيقة": {
        name: "الكلاسيكي المتطور",
        desc: "تجمع بين الأصالة والتطور. تفضل العمق على الصخب، والجودة على الكثرة.",
        perfume: 0
    },
    "رجل-الصباح والنهار-حيوية وجريئة": {
        name: "القائد النشيط",
        desc: "طاقتك معدية وحماسك لا ينضب. تُلهم من حولك بتفاؤلك وإصرارك على النجاح.",
        perfume: 1
    },
    "امرأة-المساء والليل-حيوية وجريئة": {
        name: "الأميرة الشرقية",
        desc: "أنت امرأة تعرف قيمتها جيداً. تمزجين بين الأنوثة الراقية والقوة الداخلية بأسلوب فريد.",
        perfume: 2
    },
    "امرأة-الصباح والنهار-هادئة وأنيقة": {
        name: "الأناقة الهادئة",
        desc: "تُعبّرين عن نفسك بدفء وثقة. جمالك طبيعي وحضورك مريح لكل من حولك.",
        perfume: 3
    },
    "امرأة-المساء والليل-هادئة وأنيقة": {
        name: "الغموض الجميل",
        desc: "شخصيتك ذات أعماق لا تُكتشف دفعة واحدة. تجذبين الآخرين بهدوئك الواثق وذوقك الرفيع.",
        perfume: 2
    },
    "امرأة-الصباح والنهار-حيوية وجريئة": {
        name: "الروح المضيئة",
        desc: "حماسك يُنير كل مكان تدخلينه. عفوية ودافئة ومحبوبة، أنت الصديقة التي يتمنى الجميع أن يكونها.",
        perfume: 3
    }
};

function startQuiz() {
    currentQ = 0;
    userAnswers = {};
    document.getElementById('result-box').classList.add('hidden');
    document.getElementById('question-box').classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    const q = questions[currentQ];
    document.getElementById('question-text').textContent = q.text;

    // Progress
    const progressEl = document.getElementById('quiz-progress');
    progressEl.innerHTML = questions.map((_, i) =>
        `<div class="progress-dot ${i <= currentQ ? 'active' : ''}"></div>`
    ).join('');

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<span class="option-emoji">${opt.emoji}</span><span>${opt.text}</span>`;
        btn.onclick = () => handleAnswer(q.key, opt.text);
        container.appendChild(btn);
    });
}

function handleAnswer(key, value) {
    userAnswers[key] = value;
    currentQ++;
    if (currentQ < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('question-box').classList.add('hidden');
    const resultBox = document.getElementById('result-box');
    resultBox.classList.remove('hidden');

    // Find personality
    const key = `${userAnswers.gender}-${userAnswers.time}-${userAnswers.mood}`;
    const personalityData = personalities[key] || personalities[`${userAnswers.gender}-${userAnswers.time}-هادئة وأنيقة`];
    const rec = perfumes[personalityData ? personalityData.perfume : 0];

    const starsHtml = '★'.repeat(Math.floor(rec.rating)) + '☆'.repeat(5 - Math.floor(rec.rating));

    document.getElementById('recommended-perfume').innerHTML = `
        <div class="result-perfume-card">
            <img src="${rec.img}" alt="${rec.name}" class="result-img">
            <div class="result-perfume-info">
                <h3>${rec.name}</h3>
                <p>${rec.snippet}</p>
                <span class="tag">${rec.usageLabel}</span>
                <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
                    <span style="color:var(--gold)">${starsHtml}</span>
                </div>
                <span class="price" style="margin-top:8px">${rec.price}</span>
            </div>
        </div>
    `;

    document.getElementById('personality-text').innerHTML = `
        <h4>✦ شخصيتك العطرية: ${personalityData?.name || 'المتميز'}</h4>
        <p>${personalityData?.desc || 'شخصية فريدة ومتميزة تعكس ذوقاً رفيعاً.'}</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:15px">
            ${Object.entries(userAnswers).map(([k, v]) => `<span class="tag">${v}</span>`).join('')}
        </div>
    `;
}

// Initialize
window.onload = init3D;