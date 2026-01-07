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

const jsonData = [];

const MAX_CARDS = 16;

let currIdx = 4;

window.onload = () => {
    
    callJsonData();

}

function addEventListeners() {
    nextBtn.addEventListener('click', () => {
        currIdx++;
        if(currIdx >= cards.length) {
            currIdx = 0;
        }

        reloadCardOption();
    });

    for(let i = 0; i < MAX_CARDS; i++) {
        cards[i].addEventListener('click', () => {
            currIdx = i+1;
            reloadCardOption();
            
            detailContainer.classList.add('active');

            const data = jsonData[i];

    if (data) {
        detailTitle.innerText = data.title;
        detailDescription.innerText = data.description;
        detailContainer.style.backgroundColor = data.themeColor;

        // 1. Category 처리
        categoryContainer.innerHTML = '';
        const categories = data.category.split('&').map(s => s.trim());
        
        // 2. Categories 처리
        categories.forEach(catText => {
            const span = document.createElement('span');
            span.className = 'category-chip';
            span.innerText = catText;
            categoryContainer.appendChild(span);
        });

        // 3. Technologies 처리
        techContainer.innerHTML = '';
        data.technologies.forEach(tech => {
            const span = document.createElement('span');
            span.className = 'tech-chip';
            span.innerText = tech;
            techContainer.appendChild(span);
        });

        // 4. Status 처리
        statusValue.innerText = data.status;

        // 5. Schedule 처리 (YYYY-MM-DD -> YYYY.MM 형식으로 변환)
        const formatMonth = (dateStr) => {
            if (!dateStr) return '';
            return dateStr.substring(0, 7).replace('-', '.');
        };
        scheduleValue.innerText = `${formatMonth(data.startDate)} ~ ${formatMonth(data.endDate)}`;

        // 6. Link 처리 (링크 없으면 버튼 숨김)
        if (data.link && data.link !== "") {
            detailLink.href = data.link;
            detailLink.style.display = 'inline-block'; // 혹은 'flex' 등 CSS에 맞춰서
            detailLink.innerText = '자세히 보기';
        } else {
            detailLink.href = '#';
            detailLink.style.display = 'none';
        }
    } else {
        // 데이터가 없을 때의 방어 로직
        detailTitle.innerText = 'EMPTY';
        detailDescription.innerText = 'No Data Available.';
        categoryContainer.innerHTML = '';
        techContainer.innerHTML = '';
        statusValue.innerText = '-';
        scheduleValue.innerText = '-';
        detailLink.style.display = 'none';
    }
        });
    }

    closeBtn.addEventListener('click', () => {
        detailContainer.classList.remove('active');
    });

    downloadBtn.addEventListener('click', () => {
        html2canvas(detailContainer).then(function(canvas) {
            const captureImgData = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = captureImgData;
            link.download = `${detailTitle.innerText}.png`;
        
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    });
    });

}

// JSON 에서 카테고리 불러온 다음에, 리스트로 병합해 SELECT 박스 생성 - TASK 1


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