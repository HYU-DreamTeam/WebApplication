// 편집 모드 상태
let isEditing = false;

// DOM 요소
const resumeContainer = document.getElementById('resume-container');
const editBtn = document.getElementById('edit-btn');
const pdfBtn = document.getElementById('pdf-btn');
const profileImage = document.getElementById('profile-image');
const profileInput = document.getElementById('profile-input');
const nameInput = document.getElementById('name-input');
const nameDisplay = document.getElementById('name-display');
const emailInput = document.getElementById('email-input');
const emailDisplay = document.getElementById('email-display');
const phoneInput = document.getElementById('phone-input');
const phoneDisplay = document.getElementById('phone-display');

// 섹션별 필드 정의
const fields = {
    intro: ['intro'],
    skills: ['skill'],
    activities: ['name', 'description', 'url'],
    certifications: ['title', 'organization', 'date', 'description'],
    experience: ['company', 'position', 'period', 'description'],
    education: ['school', 'location', 'degree', 'year', 'grade'],
    projects: ['name', 'description', 'url']
};

const placeholders = {
    intro: '자기소개를 입력하세요.',
    skill: '기술명',
    name: '이름',
    description: '설명',
    url: 'URL',
    title: '수상/자격증명',
    organization: '기관',
    date: '취득일',
    company: '회사명',
    position: '직책',
    period: '기간',
    school: '학교명',
    location: '위치',
    degree: '학위',
    year: '연도',
    grade: '성적/비고'
};

// 페이지 로드 시 로컬스토리지에서 데이터 불러오기
window.onload = () => {
    loadFromLocalStorage();
};

// 로컬스토리지에서 데이터 불러오기
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
        const data = JSON.parse(savedData);

        // 프로필 정보 복원
        if (data.profile) {
            nameInput.value = data.profile.name || '';
            nameDisplay.textContent = data.profile.name || '';
            emailInput.value = data.profile.email || '';
            emailDisplay.textContent = data.profile.email || '';
            phoneInput.value = data.profile.phone || '';
            phoneDisplay.textContent = data.profile.phone || '';
            if (data.profile.image) {
                profileImage.style.backgroundImage = `url(${data.profile.image})`;
            }
        }

        // 각 섹션 데이터 복원
        Object.keys(data.sections || {}).forEach(section => {
            const container = document.getElementById(section);
            if (container && data.sections[section]) {
                data.sections[section].forEach(itemData => {
                    addItemWithData(section, container, itemData);
                });
            }
        });
    }
}

// 로컬스토리지에 데이터 저장
function saveToLocalStorage() {
    const data = {
        profile: {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            image: profileImage.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
        },
        sections: {}
    };

    // 각 섹션 데이터 수집
    Object.keys(fields).forEach(section => {
        const container = document.getElementById(section);
        if (container) {
            data.sections[section] = [];
            container.querySelectorAll('.item, .skill-item').forEach(item => {
                const inputs = item.querySelectorAll('input, textarea');
                const itemData = [];
                inputs.forEach(input => {
                    itemData.push(input.value);
                });
                if (itemData.some(v => v.trim())) {
                    data.sections[section].push(itemData);
                }
            });
        }
    });

    localStorage.setItem('resumeData', JSON.stringify(data));
}

// 편집/저장 버튼 클릭
editBtn.addEventListener('click', () => {
    if (isEditing) {
        // 저장 모드로 전환
        saveData();
        saveToLocalStorage();
        resumeContainer.classList.remove('editing');
        editBtn.textContent = '편집';
    } else {
        // 편집 모드로 전환
        resumeContainer.classList.add('editing');
        editBtn.textContent = '저장';
    }
    isEditing = !isEditing;
});

// PDF 다운로드 버튼 (A4 사이즈)
pdfBtn.addEventListener('click', () => {
    html2canvas(resumeContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    }).then(function(canvas) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pageHeight = 297;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${nameDisplay.textContent || 'resume'}.pdf`);
    });
});

// 프로필 이미지 업로드
profileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            profileImage.style.backgroundImage = `url(${reader.result})`;
        };
        reader.readAsDataURL(file);
    }
});

// 데이터 저장 (화면에 반영)
function saveData() {
    // 프로필 정보 저장
    nameDisplay.textContent = nameInput.value;
    emailDisplay.textContent = emailInput.value;
    phoneDisplay.textContent = phoneInput.value;

    // 각 섹션의 아이템들 저장
    document.querySelectorAll('.item, .skill-item').forEach(item => {
        updateViewText(item);
    });
}

// 아이템의 view-text 업데이트
function updateViewText(item) {
    const inputs = item.querySelectorAll('input, textarea');
    let viewContainer = item.querySelector('.view-container');

    if (!viewContainer) {
        viewContainer = document.createElement('div');
        viewContainer.className = 'view-container view-text';
        item.appendChild(viewContainer);
    }

    let html = '';
    inputs.forEach((input, index) => {
        const value = input.value.trim();
        if (value) {
            if (index === 0) {
                html += `<div class="item-title">${value}</div>`;
            } else if (input.tagName === 'TEXTAREA') {
                html += `<div class="item-desc">${value}</div>`;
            } else {
                html += `<div class="item-sub">${value}</div>`;
            }
        }
    });

    viewContainer.innerHTML = html;
}

// + 버튼 클릭 시 입력 필드 추가
document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        const container = document.getElementById(section);
        const isSingle = btn.dataset.single === 'true';

        // 단일 항목인 경우 이미 있으면 추가 안함
        if (isSingle && container.children.length > 0) {
            return;
        }

        addItem(section, container);
    });
});

function addItem(section, container) {
    const item = document.createElement('div');
    item.className = section === 'skills' ? 'skill-item' : 'item';

    let html = `<button class="remove-btn" onclick="this.parentElement.remove()">삭제</button>`;

    if (section === 'intro') {
        html += `<textarea placeholder="${placeholders.intro}"></textarea>`;
    } else if (section === 'skills') {
        html += `<input type="text" placeholder="${placeholders.skill}">`;
    } else {
        fields[section].forEach(field => {
            if (field === 'description') {
                html += `<textarea placeholder="${placeholders[field]}"></textarea>`;
            } else {
                html += `<input type="text" placeholder="${placeholders[field]}">`;
            }
        });
    }

    // 보기용 컨테이너 추가
    html += `<div class="view-container view-text"></div>`;

    item.innerHTML = html;
    container.appendChild(item);

    // 첫 번째 입력 필드에 포커스
    const firstInput = item.querySelector('input, textarea');
    if (firstInput) {
        firstInput.focus();
    }
}

// 데이터와 함께 아이템 추가 (로컬스토리지에서 복원용)
function addItemWithData(section, container, itemData) {
    const item = document.createElement('div');
    item.className = section === 'skills' ? 'skill-item' : 'item';

    let html = `<button class="remove-btn" onclick="this.parentElement.remove()">삭제</button>`;

    if (section === 'intro') {
        html += `<textarea placeholder="${placeholders.intro}">${itemData[0] || ''}</textarea>`;
    } else if (section === 'skills') {
        html += `<input type="text" placeholder="${placeholders.skill}" value="${itemData[0] || ''}">`;
    } else {
        fields[section].forEach((field, index) => {
            const value = itemData[index] || '';
            if (field === 'description') {
                html += `<textarea placeholder="${placeholders[field]}">${value}</textarea>`;
            } else {
                html += `<input type="text" placeholder="${placeholders[field]}" value="${value}">`;
            }
        });
    }

    // 보기용 컨테이너 추가
    html += `<div class="view-container view-text"></div>`;

    item.innerHTML = html;
    container.appendChild(item);

    // view-text 업데이트
    updateViewText(item);
}
