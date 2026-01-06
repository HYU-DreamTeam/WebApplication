const modal = document.getElementById('modal');
const hBtn = document.getElementById('horizontal-btn');
const vBtn = document.getElementById('vertical-btn');
const canvas = document.getElementById('canvas');
const templateBtn = document.getElementById('template-btn');
const template = document.getElementById('template');
const tool = document.getElementById('tool');
const canvasTrunBtn = document.getElementById('turn-canvas-btn');

const newCard = document.createElement('div');
const cardFront = document.createElement('div');
const cardBack = document.createElement('div');

let side = '';

let activateTool = false;
let trunCard = false;

let fullData = null;
let activeTypeName = null;
let activeElement = null;
let offsetPercent = { x: 0, y: 0 };

// 페이지 로드 시 팝업 보이기
window.onload = function () {
    modal.style.display = 'flex';
};

// canvas에 card 만들기
function createCard(type) {
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

templateBtn.onclick = function () {

    activateTool = !activateTool;

    const templateWidthSize = activateTool ? 400 : 0;
    const canvasMarginLeftSize = activateTool ? tool.offsetWidth + templateWidthSize : 0;

    template.style.width = templateWidthSize + 'px';
    canvas.style.marginLeft = canvasMarginLeftSize + 'px';
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

    const keys = Object.keys(data);

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

        templateCard.innerHTML = `
            <div class="card-info">
                <img src="${data[typeName][0]["img-path"]}" alt="${typeName}">
            </div>
        `;

        templateCard.onclick = function () {
            console.log(`${typeName} 선택됨`);
            cardFront.innerHTML = '';

            for (let j = 0; j < data[typeName].length - 1; j++) {
                drawCardElement(data[typeName][j + 1]);
                console.log(j + 1);
            }

            const allCards = document.querySelectorAll('.card-template');
            for (let k = 0; k < allCards.length; k++) {
                allCards[k].classList.remove('active');
            }
            templateCard.classList.add('active');
        };
        template.appendChild(templateCard);
    }
}

// 캔버스 위에 요소 배치
function drawCardElement(element) {

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

    newElement.innerHTML = `
        <input type="text" 
               class="card-input"
               style="width: 100%; font-size: ${fontSizeRatio}cqw;" 
               placeholder="${element["text"]}"
               autocomplete="off">
        `;

    cardFront.appendChild(newElement);
}

