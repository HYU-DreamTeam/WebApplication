const modal = document.getElementById('modal');
const hBtn = document.getElementById('horizontal-btn');
const vBtn = document.getElementById('vertical-btn');
const canvas = document.getElementById('canvas');
const toolBtn = document.getElementById('tool-btn');
const tool = document.getElementById('tool');

// 페이지 로드 시 팝업 보이기
window.onload = function() {
    modal.style.display = 'flex';
};

// canvas에 card 만들기
function createCard(type) {

    const newCard = document.createElement('div');

    newCard.classList.add('card');

    if(type === 'horizontal'){
        newCard.classList.add('card-horizontal');
    }
    else{
        newCard.classList.add('card-vertical');
    }

    canvas.appendChild(newCard);
    modal.style.display = 'none';
}

// 버튼 클릭 시 크기 정의 후, 팝업 숨기기
hBtn.onclick = function() {
    createCard('horizontal');
    createCard('horizontal');    
};

vBtn.onclick = function() {
    createCard('vertical');
    createCard('vertical');
};

toolBtn.onclick = function() {
    tool.style.width = '300px';
    canvas.style.marginLeft = "300px";
};