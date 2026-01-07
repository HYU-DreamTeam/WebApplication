const modal = document.getElementById('modal');
const hBtn = document.getElementById('horizontal-btn');
const vBtn = document.getElementById('vertical-btn');
const canvas = document.getElementById('canvas');
const templateBtn = document.getElementById('template-btn');
const storageBoxBtn = document.getElementById('storage-box-btn');
const sidePanel = document.getElementById('sidePanel');
const tool = document.getElementById('tool');
const canvasTrunBtn = document.getElementById('turn-canvas-btn');
const saveBtn = document.getElementById('save-btn');

const newCard = document.createElement('div');
const cardFront = document.createElement('div');
const cardBack = document.createElement('div');

// 이거 문법 좀 특이함
const contents = {
    template: document.getElementById('template'),
    storage: document.getElementById('storage')
};

let side = '';

let currentTab = null;

let trunCard = false;

let fullData = null;

// 저장 상태를 관리하는 변수
let isUnsaved = false;

// 현재 수정 중인 명함의 ID를 기억하는 변수
let currentId = null;

// 로컬 스토리지 저장 키
const STORAGE_KEY = 'my_card';

// 페이지 로드 시 팝업 보이기
window.onload = function () {
    modal.style.display = 'flex';
};

// 무언가 수정이 일어났을 때 실행할 함수 (타이핑 하거나, 드래그 하거나)
function markAsUnsaved() {
    isUnsaved = true;
    console.log('수정됨: 저장 필요!');
}

// 저장을 완료했을 때 실행할 함수
function saveComplete() {
    isUnsaved = false;
    alert('저장이 완료되었습니다.');
}

// 링크 클릭 감지 코드
document.body.addEventListener('click', function (event) {
    const targetLink = event.target.closest('a');

    if (targetLink && targetLink.href) {
        if (isUnsaved) {
            const movePage = confirm('저장하지 않은 내용이 있습니다. 정말 이동하시겠습니까?');
            if (movePage === false) {
                event.preventDefault();
            } else {
                isUnsaved = false;
            }
        }
    }
});

// 브라우저 닫기나 새로고침(F5) 경고
window.addEventListener('beforeunload', function (event) {
    if (isUnsaved) {
        event.preventDefault();
    }
});

// 입력 감지 코드
document.body.addEventListener('input', function (event) {
    if (event.target.matches('input')) {
        if (!isUnsaved) {
            markAsUnsaved();
            console.log('데이터 변경 감지됨: 저장 필요 상태로 전환');
        }
    }
});


// canvas에 card 만들기
function createCard(type) {
    currentId = null;

    newCard.classList.add('card');

    if (type === 'horizontal') {
        newCard.classList.add('card-' + type);
        cardFront.classList.add('card-' + type + '-front');
        cardBack.classList.add('card-' + type + '-back');
    }
    else {
        newCard.classList.add('card-' + type);
        cardFront.classList.add('card-' + type + '-front');
        cardBack.classList.add('card-' + type + '-back');
    }

    newCard.appendChild(cardFront);
    newCard.appendChild(cardBack);
    canvas.appendChild(newCard);

    modal.style.display = 'none';
    callJsonData();
}

// 버튼 클릭 시 크기 정의 후, 팝업 숨기기
hBtn.onclick = function () {
    side = 'horizontal';
    createCard(side);
};

vBtn.onclick = function () {
    side = 'vertical';
    createCard(side);
};

function toggleSidebar(tabName) {
    if (currentTab === tabName) {
        currentTab = null;
    } else {
        currentTab = tabName;
    }

    const isOpen = currentTab !== null;
    const currentPanelWidth = isOpen ? 400 : 0;

    const canvasMarginLeftSize = tool.offsetWidth + currentPanelWidth;

    sidePanel.style.width = currentPanelWidth + 'px';
    canvas.style.marginLeft = canvasMarginLeftSize + 'px';

    for (const key in contents) {
        contents[key].style.display = 'none';
    }

    if (isOpen) {
        contents[currentTab].style.display = 'inline';
    }
}

templateBtn.onclick = function () {
    toggleSidebar('template');
};

canvasTrunBtn.onclick = function () {
    trunCard = !trunCard;

    const frontDeg = trunCard ? '-180deg' : '0deg';
    const backDeg = trunCard ? '0deg' : '180deg';

    cardFront.style.transform = 'rotateY(' + frontDeg + ')';
    cardBack.style.transform = 'rotateY(' + backDeg + ')';

}

// JSON 파일 읽어오기 (계속 찾아보다가 코드 이해 ㅈ같이 어려워서 박재형씨 코드 오마주)
async function callJsonData() {

    const request = new XMLHttpRequest();
    request.open('GET', './assets/json/card.json', true);

    request.responseText = 'json';

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            fullData = this.response;
            fullData = JSON.parse(fullData);
            console.log(fullData.TypeA);
            createCardTemplates(fullData);

            console.log("데이터 로드 및 카드 생성 완료!");
        } else {
            alert("데이터를 가져오는 중 오류가 발생했습니다.");
        }
    };
    request.send();
}

// 타입 개수만큼 템플릿 부분에 카드 그리는 함수
function createCardTemplates(data) {

    const currentGroup = data[side];
    const keys = Object.keys(currentGroup);

    template.innerHTML = '';

    for (let i = 0; i < keys.length; i++) {
        const typeName = keys[i];

        const templateCard = document.createElement('div');
        templateCard.className = 'card-template';

        if ('card-' + side === 'card-horizontal') {
            templateCard.style.width = "80%";
            templateCard.style.height = "auto";
            templateCard.style.aspectRatio = "94 / 54";
        }
        else {
            templateCard.style.width = "auto";
            templateCard.style.height = "47%";
            templateCard.style.aspectRatio = "54 / 94";
        }


        const type = currentGroup[typeName];

        // 템플릿 카드 미리보기
        const CardList = type.front;
        for (let t = 0; t < CardList.length; t++) {
            const element = CardList[t];
            drawCardElement(element, templateCard, false);
        }

        templateCard.onclick = function () {

            currentId = null;

            if (!isUnsaved) {
                console.log(`${typeName} 선택됨`);
                cardFront.innerHTML = '';
                cardBack.innerHTML = '';

                const typeData = currentGroup[typeName];

                const frontList = typeData.front;
                for (let j = 0; j < frontList.length; j++) {
                    const element = frontList[j];
                    drawCardElement(element, cardFront);
                }

                const backList = typeData.back;
                for (let k = 0; k < backList.length; k++) {
                    const element = backList[k];
                    drawCardElement(element, cardBack);
                }

                const allCards = document.querySelectorAll('.card-template');
                for (let m = 0; m < allCards.length; m++) {
                    allCards[m].classList.remove('active');
                }
                templateCard.classList.add('active');
            }
            else {
                const agree = confirm('저장하지 않은 내용이 있습니다. 정말 변경하시겠습니까?');
                if (agree) {
                    isUnsaved = false;

                    currentId = null;

                    console.log(`${typeName} 선택됨`);
                    cardFront.innerHTML = '';
                    cardBack.innerHTML = '';

                    const typeData = currentGroup[typeName];

                    const frontList = typeData.front;
                    for (let j = 0; j < frontList.length; j++) {
                        const element = frontList[j];
                        drawCardElement(element, cardFront);
                    }

                    const backList = typeData.back;
                    for (let k = 0; k < backList.length; k++) {
                        const element = backList[k];
                        drawCardElement(element, cardBack);
                    }

                    const allCards = document.querySelectorAll('.card-template');
                    for (let m = 0; m < allCards.length; m++) {
                        allCards[m].classList.remove('active');
                    }
                    templateCard.classList.add('active');
                }
            }

        };
        template.appendChild(templateCard);
    }
}

// 캔버스 위에 요소 배치
function drawCardElement(element, target, id = true) {

    const newElement = document.createElement('div');
    newElement.className = 'card-element';

    const baseWidth = side === 'horizontal' ? 940 : 540;
    const baseHeight = side === 'horizontal' ? 540 : 940;

    const leftPercent = (element.x / baseWidth) * 100;
    const topPercent = (element.y / baseHeight) * 100;
    const widthPercent = (element.width / baseWidth) * 100;

    newElement.style.left = `${leftPercent}%`;
    newElement.style.top = `${topPercent}%`;
    newElement.style.width = `${widthPercent}%`;

    const fontSizeRatio = (element["font-size"] / baseWidth) * 100;

    let idText = "";

    if (id) {
        idText = element["id"];
    }

    newElement.innerHTML = `
        <input type="text" 
               class="card-input"
               id="${idText}"
               style="width: 100%; font-size: ${fontSizeRatio}cqw;" 
               placeholder="${element["text"]}"
               autocomplete="off">
        `;

    target.appendChild(newElement);
}

storageBoxBtn.onclick = function () {
    toggleSidebar('storage');
    if (currentTab === 'storage') {
        renderStorageList();
    }
};

saveBtn.onclick = function () {
    saveToLocalStorage();
}

function saveToLocalStorage() {

    // 현재 작업물의 기준 크기 구하기
    const baseWidth = side === 'horizontal' ? 940 : 540;
    const baseHeight = side === 'horizontal' ? 540 : 940;

    function extractData(container) {
        const elements = container.querySelectorAll('.card-element');
        const dataList = [];

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const input = element.querySelector('input');

            const leftPer = parseFloat(element.style.left);
            const topPer = parseFloat(element.style.top);
            const widthPer = parseFloat(element.style.width);
            const fontSizeCqw = parseFloat(input.style.fontSize);

            const xVal = Math.round((leftPer * baseWidth) / 100);
            const yVal = Math.round((topPer * baseHeight) / 100);
            const widthVal = Math.round((widthPer * baseWidth) / 100);
            const fontSizeVal = Math.round((fontSizeCqw * baseWidth) / 100);

            const cardData = {
                "id": input.id,
                "text": input.value,
                "x": xVal,
                "y": yVal,
                "width": widthVal,
                "font-size": fontSizeVal
            };

            dataList.push(cardData);
        }
        return dataList;
    }

    let storageList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // 찾으면 인덱스 번호, 못 찾으면 -1
    const existingIndex = storageList.findIndex(item => item.id === currentId);

    
    if (currentId !== null && existingIndex !== -1) {        // 기존 명함 저장하기

        // 기존 데이터 가져와서 내용물을 최신으로 교체
        storageList[existingIndex].date = new Date().toLocaleString(); // 수정 시간 갱신
        storageList[existingIndex].front = extractData(cardFront);
        storageList[existingIndex].back = extractData(cardBack);                        

    } else {    // 새로운 명함 저장하기                
        
        const now = new Date();
        const saveName = `${now.toLocaleString()} 저장본`; 

        const newSaveData = {
            id: Date.now(),
            name: saveName,
            type: side,
            date: now.toLocaleString(),
            front: extractData(cardFront),
            back: extractData(cardBack)
        };

        storageList.push(newSaveData);
        
        currentId = newSaveData.id;         
    }

    // 저장 및 갱신
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageList));
    saveComplete();

    // 만약 보관함이 열려있다면 즉시 갱신
    if (currentTab === 'storage') {
        renderStorageList();
    }
}

function renderStorageList() {
    const storage = document.getElementById('storage');
    storage.innerHTML = '';

    const storageList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    storageList.reverse();

    let renderCount = 0;

    for (let i = 0; i < storageList.length; i++) {
        const savedItem = storageList[i];

        if (savedItem.type !== side) {
            continue;
        }
        renderCount++;

        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'storage-item';
        cardWrapper.style.position = 'relative';
        cardWrapper.style.margin = '20px auto';

        if (side === 'vertical') {
            cardWrapper.style.display = 'inline';
        }

        const templateCard = document.createElement('div');
        templateCard.className = 'card-template';

        // 가로형인지 세로형인지 확인해서 비율 잡아주기
        if (savedItem.type === 'horizontal') {
            // 가로형일 때
            templateCard.style.width = "80%";
            templateCard.style.aspectRatio = "94 / 54";
        } else {
            // 세로형일 때
            templateCard.style.width = "auto";
            templateCard.style.height = "47%";
            templateCard.style.aspectRatio = "54 / 94";
        }

        // 미리보기 내용 앞면만 그리기
        const frontElements = savedItem.front;

        for (let j = 0; j < frontElements.length; j++) {
            const element = frontElements[j];
            drawCardElement(element, templateCard, false);
        }

        // 저장된 데이터를 캔버스로 불러옴
        templateCard.onclick = function () {
            loadFromStorage(savedItem);
        };

        // 삭제 버튼 만들기        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '삭제';

        // 버튼 위치 잡아주기
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '0';
        deleteBtn.style.right = '10%';
        deleteBtn.style.zIndex = '10';

        // 삭제 버튼 클릭 이벤트
        deleteBtn.onclick = function (e) {
            e.stopPropagation(); // 중요: 부모(카드)가 클릭되는 것을 막아줌 (이 새끼 없을 때 부모도 사라져서 ㅈㄴ 골때렸음)
            deleteStorageItem(savedItem.id);
        };

        cardWrapper.appendChild(deleteBtn);
        cardWrapper.appendChild(templateCard);

        storage.appendChild(cardWrapper);
    }

    if (renderCount === 0) {
        storage.innerHTML = '<p style="padding:20px; text-align:center;">저장된 명함이 없습니다.</p>';
        return;
    }
}

// 캔버스에 실제 적용하는 함수
function loadFromStorage(savedItem) {
    // 저장되지 않은 내용 체크
    if (isUnsaved) {
        if (!confirm('저장하지 않은 내용이 있습니다. 정말 불러오시겠습니까?')) return;
    }
    
    currentId = savedItem.id;

    cardFront.innerHTML = '';
    cardBack.innerHTML = '';

    const frontList = savedItem.front;
    const backList = savedItem.back;

    for (let i = 0; i < frontList.length; i++) {
        const element = frontList[i];
        drawCardElementWithText(element, cardFront);
    }

    for (let i = 0; i < backList.length; i++) {
        const element = backList[i];
        drawCardElementWithText(element, cardBack);
    }

    isUnsaved = false;
    console.log(`"${savedItem.name}" 불러오기 완료`);
}

// 기존 drawCardElement는 placeholder만 넣으므로, value를 넣기 위한 함수
function drawCardElementWithText(element, target) {
    drawCardElement(element, target, true);

    // 추가된 input을 찾아서 텍스트 주입
    const lastAdded = target.lastElementChild.querySelector('input');
    if (lastAdded) {
        lastAdded.value = element.text;
    }
}

// 삭제 기능
function deleteStorageItem(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    let storageList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    // 해당 ID를 제외한 나머지로 필터링
    storageList = storageList.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageList));

    renderStorageList(); // 목록 갱신
}

// PDF 다운로드 버튼 연결
const pdfBtn = document.getElementById('pdf-btn');

pdfBtn.onclick = function() {
    downloadCard();
};

async function downloadCard() {    
    
   const zip = new JSZip();

   const canvasOptions = {
        scale: 4, 
        useCORS: true,
        backgroundColor: '#fff',
        
        
        // input도 된다길래 날먹 하려고 했는데 텍스트가 짤려서 에라이 어쩔 수 없지. 그래서 글자 안 잘리게 하는 법을
        // 검색해보니 onclone이란 걸 알게 됐고 일단 써보면서 테스트를 해보니 지금 좀 완벽할지도. 
        onclone: (clonedDoc) => {
                                                
            const allInputs = clonedDoc.querySelectorAll('input');
            
            for (let i = 0; i < allInputs.length; i++) {
                const input = allInputs[i];
                
                // 입력 값 없으면 넘기기
                if (!input.value) continue;

                // input을 대체할 div 태그 생성
                const div = clonedDoc.createElement('div');
                div.innerText = input.value;

                // input의 스타일을 그대로 가져오기
                const style = window.getComputedStyle(input);

                div.style.fontSize = style.fontSize;
                div.style.fontFamily = style.fontFamily;
                div.style.fontWeight = style.fontWeight;
                div.style.color = style.color;
                div.style.letterSpacing = style.letterSpacing;
                div.style.textAlign = style.textAlign;

                // 위치와 크기 맞추기
                // div는 기본적으로 위쪽에 붙으므로, 수직 중앙 정렬을 위해 Flexbox 사용
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.display = 'flex';
                div.style.alignItems = 'center'; // 수직 중앙 정렬

                // 가로 정렬 (input의 text-align에 따라 맞춤)
                if (style.textAlign === 'center') div.style.justifyContent = 'center';
                else if (style.textAlign === 'right') div.style.justifyContent = 'flex-end';
                else div.style.justifyContent = 'flex-start';

                // 잘림 방지용 핵심 스타일
                div.style.overflow = 'visible'; // 삐져나와도 일단 자르지마 새끼야. 이렇게 처리하니까 안 잘리고 나옴 ^__^
                div.style.whiteSpace = 'nowrap'; // 줄바꿈 금지
                div.style.lineHeight = '1.2'; // 적당한 줄 간격
                div.style.position = 'absolute'; // 위치 고정
                div.style.top = '0';
                div.style.left = '0';
                div.style.background = 'transparent'; // 배경 투명하게

                // 부모 요소 설정 (position: relative가 있어야 absolute가 먹힘)
                const parent = input.parentElement;
                if (window.getComputedStyle(parent).position === 'static') {
                    parent.style.position = 'relative';
                }

                // input 숨기고 div 추가
                input.style.display = 'none';
                parent.appendChild(div);
            }
        }
    };

    const frontCanvas = await html2canvas(cardFront, canvasOptions);
    const frontData = frontCanvas.toDataURL('image/jpeg', 1.0).split(',')[1];

    const backCanvas = await html2canvas(cardBack, canvasOptions);
    const backData = backCanvas.toDataURL('image/jpeg', 1.0).split(',')[1];

    let cleanName = '나의명함';

    const firstInput = cardFront.querySelector('input');

    if (firstInput && firstInput.value.trim() !== '') {
        cleanName = firstInput.value.trim();
    }

    zip.file('앞면(94x54).jpg', frontData, {base64: true});
    zip.file('뒷면(94x54).jpg', backData, {base64: true});

    zip.generateAsync({type: "blob"}).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${cleanName}_명함제작용.zip`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);                
    });
}
