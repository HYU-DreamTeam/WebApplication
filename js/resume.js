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

    let html = `<button class="remove-btn" onclick="this.parentElement.remove()">닫기</button>`;

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

    item.innerHTML = html;
    container.appendChild(item);

    // 첫 번째 입력 필드에 포커스
    item.querySelector('input, textarea').focus();
}
