const initCard = document.getElementById('init_card');
let cards = document.querySelectorAll('.card');

const nextBtn = document.getElementById('next_btn');
const fanContainer = document.getElementById('fan-container');
const fanWrapper = document.getElementById('fan-wrapper');

const detailContainer = document.getElementById('detail-container');
const detailCaptureArea = document.getElementById('capture_area');
const downloadBtn = document.getElementById('download_btn');
const detailTitle = document.getElementById('detail-title');
const detailDescription = document.getElementById('detail-description');
const closeBtn = document.getElementById('close_btn');

const categoryContainer = document.getElementById('category-container');
const techContainer = document.getElementById('technologies-container');
const statusValue = document.getElementById('status-value');
const scheduleValue = document.getElementById('schedule-value');
const detailLink = document.getElementById('detail-link');

const editTitleInput = document.getElementById('edit-title');
const editIconInput = document.getElementById('edit-icon');
const editColorInput = document.getElementById('edit-color');
const editCategoryInput = document.getElementById('edit-category');
const editDescInput = document.getElementById('edit-desc');
const editTechInput = document.getElementById('edit-tech');
const editStatusInput = document.getElementById('edit-status');
const editStartInput = document.getElementById('edit-start');
const editEndInput = document.getElementById('edit-end');
const editLinkInput = document.getElementById('edit-link');

const editBtn = document.getElementById('edit_btn');
const captureArea = document.getElementById('capture_area'); // 클래스 토글용

const iconInput = document.getElementById('edit-icon');
const iconPresets = document.getElementById('icon-presets');
const presetIcons = document.querySelectorAll('#icon-presets span');

let isNewEntry = false;   // 신규 카드 작성 중인지 확인하는 플래그
let targetDataIndex = -1; // 편집 중인 카드의 데이터 인덱스

let isEditMode = false;



const jsonData = [];

const MAX_CARDS = 16;

let currIdx = 4;

window.onload = () => {
    callJsonData();
}

function addEventListeners() {
    let isScrolling = false;

document.addEventListener('wheel', (e) => {
    if (isScrolling) return;

    isScrolling = true;

    if(e.deltaY > 0) {
        currIdx++;
        if(currIdx >= cards.length) {
            currIdx = 0;
        }
    } else {
        currIdx--;
        if(currIdx < 0) {
            currIdx = cards.length - 1;
        }
    }
    reloadCardOption();
    setTimeout(() => {
        isScrolling = false;
    }, 200);
});
    
    // ... (기존 wheel 이벤트 리스너 코드는 그대로 유지) ...

    // [카드 클릭 이벤트 - 리팩토링]
    // 중복 코드를 줄이기 위해 렌더링 함수를 분리하는 것이 좋지만, 
    // 일단 기존 구조에서 편집 모드일 때 클릭 방지만 추가합니다.
for(let i = 0; i < MAX_CARDS; i++) {
        cards[i].addEventListener('click', () => {
            if(isEditMode) {
                alert("저장하지 않은 내용이 있습니다."); 
                return;
            }

            currIdx = i + 1; // 팬 애니메이션용 인덱스
            reloadCardOption(); // 팬 돌리기
            detailContainer.classList.add('active');

            // [핵심 변경: 데이터 존재 여부 확인]
            if (i < jsonData.length) {
                // >> 기존 데이터가 있는 경우 (수정 모드)
                isNewEntry = false;
                targetDataIndex = i; // 수정할 인덱스 저장
                renderDetailView(jsonData[i]);
            } else {
                // >> 데이터가 없는 경우 (Empty -> 신규 생성 모드)
                isNewEntry = true;
                targetDataIndex = jsonData.length; // 새로 추가될 위치 (배열의 끝)

                // 기본값(Dummy Data) 생성
                const defaultData = {
                    title: "새 프로젝트",
                    description: "프로젝트 설명을 입력하세요.",
                    themeColor: "#555555", // 요청하신 기본 색상
                    icon: "📝",
                    category: "New & Project",
                    technologies: ["Plan", "Idea"],
                    status: "기획 중",
                    startDate: new Date().toISOString().substring(0, 10), // 오늘 날짜
                    endDate: "",
                    link: ""
                };
                
                // 가짜 데이터로 렌더링
                renderDetailView(defaultData);
            }
        });
    }
    closeBtn.addEventListener('click', () => {
        if(isEditMode) {
            if(!confirm("편집 중입니다. 닫으시겠습니까?")) return;
            isEditMode = false;
            detailContainer.classList.remove('editing');
            editBtn.innerText = "편집하기";
            renderDetailView(jsonData[targetDataIndex]); // 변경사항 취소 후 원래 데이터로 복원
        }
        detailContainer.classList.remove('active');
    });

    // ... (기존 downloadBtn 이벤트 리스너 그대로 유지) ...
        downloadBtn.addEventListener('click', () => {
        html2canvas(detailContainer).then(function(canvas) {
            const captureImgData = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = captureImgData;
            link.download = `${detailTitle.innerText}.png`;
        
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    })});

    // [신규 기능 2: 편집 모드 토글]
editBtn.addEventListener('click', () => {
    // 편집 모드가 아닐 때 (편집 시작)
    if (!isEditMode) {
        isEditMode = true;
        detailContainer.classList.add('editing');
        editBtn.innerText = "저장하기";
    } else {
        // 편집 모드일 때 (저장)
        saveChanges(); // 인자 없이 호출
    }
});
// 2. 프리셋 아이콘 선택 시 값 입력
presetIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {

        iconInput.value = e.target.innerText;

        iconPresets.classList.remove('show');
    });
});
// 3. 박스 외부 클릭 시 박스 닫기
document.addEventListener('click', (e) => {
    if(e.target !== iconInput && !iconPresets.contains(e.target)) {
        iconPresets.classList.remove('show');
    }
});
}
function renderDetailView(data) {
    if (!data) return;

    // --- 1. View Mode 렌더링 (HTML 요소에 값 넣기) ---
    detailTitle.innerText = data.title;
    detailDescription.innerText = data.description;
    detailContainer.style.backgroundColor = data.themeColor;
    statusValue.innerText = data.status;
    
    // 날짜 포맷
    const formatMonth = (dateStr) => dateStr ? dateStr.substring(0, 7).replace('-', '.') : '';
    scheduleValue.innerText = `${formatMonth(data.startDate)} ~ ${formatMonth(data.endDate)}`;

    // 카테고리 칩
    categoryContainer.innerHTML = '';
    if(data.category) {
        data.category.split('&').forEach(cat => {
            const span = document.createElement('span');
            span.className = 'category-chip';
            span.innerText = cat.trim();
            categoryContainer.appendChild(span);
        });
    }

    // 기술 칩
    techContainer.innerHTML = '';
    if(data.technologies) {
        data.technologies.forEach(tech => {
            const span = document.createElement('span');
            span.className = 'tech-chip';
            span.innerText = tech;
            techContainer.appendChild(span);
        });
    }

    // 링크
    if (data.link) {
        detailLink.href = data.link;
        detailLink.style.display = 'inline-block';
        detailLink.innerText = '자세히 보기';
    } else {
        detailLink.style.display = 'none';
    }


    // --- 2. Edit Mode 렌더링 (Input에 값 채워넣기) ---
    editTitleInput.value = data.title;
    editIconInput.value = data.icon;
    editColorInput.value = data.themeColor;
    editDescInput.value = data.description;
    editCategoryInput.value = data.category;
    
    // 배열이 있으면 join, 없으면 빈 문자열
    editTechInput.value = data.technologies ? data.technologies.join(', ') : '';
    
    editStatusInput.value = data.status;
    editStartInput.value = data.startDate;
    editEndInput.value = data.endDate;
    editLinkInput.value = data.link;
}


// [저장 로직] - Reload 없이 데이터와 화면 갱신
function saveChanges(index) { 

    const newObj = {
        title: editTitleInput.value,
        icon: editIconInput.value,
        themeColor: editColorInput.value,
        description: editDescInput.value,
        category: editCategoryInput.value,
        technologies: editTechInput.value.split(',').map(t => t.trim()).filter(t => t),
        status: editStatusInput.value,
        startDate: editStartInput.value,
        endDate: editEndInput.value,
        link: editLinkInput.value
    };

    if (isNewEntry) {
        // 1. 신규 추가 (Push)
        jsonData.push(newObj);
        
        // 중요: 신규 추가된 카드의 DOM(메인화면 카드)을 업데이트해야 함
        // 지금 targetDataIndex는 jsonData.length - 1 (방금 추가된 곳)
        const newIndex = jsonData.length - 1;
        const targetCard = cards[newIndex];
        
        if(targetCard) {
            // Empty 스타일 제거하고 데이터 입히기
            targetCard.querySelector('span').innerText = newObj.title;
            targetCard.querySelector('b').innerText = newObj.icon;
            targetCard.querySelector('em').innerText = newIndex + 1;
            targetCard.style.backgroundColor = newObj.themeColor;
            // X 표시 였던 것을 숫자로 변경 등 필요한 스타일 리셋
        }
        
        // 플래그 초기화
        isNewEntry = false;

    } else {
        // 2. 기존 수정 (Update)
        // editBtn 클릭 시 넘겨준 index 사용 (혹은 targetDataIndex)
        // 안전하게 targetDataIndex를 사용
        jsonData[targetDataIndex] = newObj;

        const targetCard = cards[targetDataIndex];
        if(targetCard) {
            targetCard.querySelector('span').innerText = newObj.title;
            targetCard.querySelector('b').innerText = newObj.icon;
            targetCard.style.backgroundColor = newObj.themeColor;
        }
    }

    // 공통: 저장 및 뷰 갱신
    localStorage.setItem('portfolioData', JSON.stringify(jsonData));
    renderDetailView(newObj); // 저장된 데이터로 다시 뷰 렌더링

    // 모드 종료
    isEditMode = false;
    detailContainer.classList.remove('editing');
    editBtn.innerText = "편집하기";

    alert("저장되었습니다.");
}

function initDOMElements() {
    cards = document.querySelectorAll('.card');
}

function reloadCardOption() {
    
    for(let i = 0; i < MAX_CARDS; i++) {
        
        if(getCircularRange(currIdx).includes(i)) {
            const rotateDeg = (getCircularRange(currIdx).indexOf(i) - 4) * 15;
            cards[i].style.opacity = '1';
            cards[i].style.setProperty('--rotate-deg', `${rotateDeg}deg`);
            cards[i].style.zIndex = 4 - Math.abs(getCircularRange(currIdx).indexOf(i) - 4);
        } else {
            cards[i].style.opacity = '0';
        }
    }
}

function buildPortFolioCards() {

    for(let i = 0; i < MAX_CARDS; i++) {
        const newCard = initCard.cloneNode(true);
        newCard.id = `card_${i}`;

        if(i >= jsonData.length) {
            newCard.querySelector('span').innerText = "EMPTY";
            newCard.querySelector('em').innerText = "X";
            newCard.style.backgroundColor = "#555";
        } else {
            const item = jsonData[i];
            const index = i;

            newCard.querySelector('span').innerText = item.title;
            newCard.querySelector('em').innerText = index+1;
            newCard.querySelector('b').innerText = item.icon;
            newCard.style.backgroundColor = item.themeColor;
        }

        newCard.style.display = 'flex';

        fanWrapper.appendChild(newCard);
    }

    initCard.remove();
}

function getCircularRange(currIdx) {
  const result = [];

  for (let i = -5; i <= 5; i++) {
    let targetIdx = currIdx + i;
    let adjustedIdx = (targetIdx % cards.length + cards.length) % cards.length;

    result.push(adjustedIdx);
  }
  return result;
}

async function callJsonData() {
    if(localStorage.getItem('portfolioData')) {
        const storeData = JSON.parse(localStorage.getItem('portfolioData')); 
        storeData.forEach((item) => {
            jsonData.push(item);
        });
        buildPortFolioCards();
        initDOMElements();
        addEventListeners();
        reloadCardOption();
    } else {
        const request = new XMLHttpRequest();
        request.open('GET', './assets/json/portfolio.json', true);
        request.responseText = 'json';

        request.onload = function() {
            if(request.status >= 200 && request.status < 400) {
                const data = JSON.parse(this.response);
                data.data.forEach((item) => {
                    jsonData.push(item);
                });
                localStorage.setItem('portfolioData', JSON.stringify(jsonData));
                buildPortFolioCards();
                initDOMElements();
                addEventListeners();
                reloadCardOption();
            } else {
                alert("Error!");
            }
        }

        request.send();

    }
}