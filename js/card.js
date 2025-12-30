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

let activateTool = false;
let trunCard = false;

// 페이지 로드 시 팝업 보이기
window.onload = function() {
    modal.style.display = 'flex';
};

// canvas에 card 만들기
function createCard(type) {
    newCard.classList.add('card');

    if(type === 'horizontal'){
        newCard.classList.add('card-'+type);        
        cardFront.classList.add('card-'+type+'-front');
        cardBack.classList.add('card-'+type+'-back');
    }
    else{
        newCard.classList.add('card-'+type);        
        cardFront.classList.add('card-'+type+'-front');
        cardBack.classList.add('card-'+type+'-back');
    }

    newCard.appendChild(cardFront);
    newCard.appendChild(cardBack);
    canvas.appendChild(newCard);
    
    modal.style.display = 'none';
}

// 버튼 클릭 시 크기 정의 후, 팝업 숨기기
hBtn.onclick = function() {
    createCard('horizontal');    
};

vBtn.onclick = function() {
    createCard('vertical');    
};

templateBtn.onclick = function() {

    activateTool = !activateTool;

    const templateWidthSize = activateTool ? 400 : 0;
    const canvasMarginLeftSize = activateTool ? tool.offsetWidth + templateWidthSize : 0;

    template.style.width = templateWidthSize + 'px';
    canvas.style.marginLeft = canvasMarginLeftSize + 'px';    
};

canvasTrunBtn.onclick = function(){    
    trunCard = !trunCard;

    const frontDeg = trunCard ? '-180deg' : '0deg';
    const backDeg = trunCard ? '0deg' : '180deg';

    cardFront.style.transform = 'rotateY(' + frontDeg + ')';
    cardBack.style.transform = 'rotateY(' + backDeg + ')';        
}
