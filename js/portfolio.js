const initCard = document.getElementById('init_card');
let cards = document.querySelectorAll('.card');

const nextBtn = document.getElementById('next_btn');
const fanContainer = document.getElementById('fan-container');
const fanWrapper = document.getElementById('fan-wrapper');

const jsonData = [];

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
}

function initDOMElements() {
    cards = document.querySelectorAll('.card');
}

function reloadCardOption() {
    cards.forEach((card, index) => {
        //3 -> 16 ~ 7, 4 -> 0 ~ 8
        
        if(getCircularRange(currIdx).includes(index)) {
            const rotateDeg = (getCircularRange(currIdx).indexOf(index) - 4) * 15;
            card.style.opacity = '1';
            card.style.setProperty('--rotate-deg', `${rotateDeg}deg`);
            card.style.zIndex = 4 - Math.abs(getCircularRange(currIdx).indexOf(index) - 4);
        } else {
            card.style.opacity = '0';
        }
    })
}

function buildPortFolioCards() {
    jsonData.forEach((item, index) => {
        const newCard = initCard.cloneNode(true);
        newCard.id = `card_${index}`;
        newCard.querySelector('span').innerText = item.title;
        newCard.querySelector('em').innerText = index+1;
        newCard.style.backgroundColor = item.color;
        newCard.style.display = 'flex';
        fanWrapper.appendChild(newCard);
    });

    initCard.remove();
}

function getCircularRange(currIdx) {
  const result = [];

  for (let i = -5; i <= 5; i++) {
    let targetIdx = currIdx + i;
    let adjustedIdx = (targetIdx % cards.length + cards.length) % cards.length;

    result.push(adjustedIdx);
  }
  console.log(result)
  return result;
}

async function callJsonData() {
    const request = new XMLHttpRequest();
    request.open('GET', '../assets/json/portfolio.json', true);
    request.responseText = 'json';

    request.onload = function() {
        if(request.status >= 200 && request.status < 400) {
            const data = JSON.parse(this.response);
            data.data.forEach((item) => {
                jsonData.push(item);
            });
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