const initCard = document.getElementById('init_card');
let cards = document.querySelectorAll('.card');

const nextBtn = document.getElementById('next_btn');
const fanContainer = document.getElementById('fan-container');
const fanWrapper = document.getElementById('fan-wrapper');

const detailContainer = document.getElementById('detail-container');
const detailTitle = document.getElementById('detail-title');
const detailDescription = document.getElementById('detail-description');
const closeBtn = document.getElementById('close_btn');

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

            detailTitle.innerText = jsonData[i] ? jsonData[i].title : 'EMPTY';
            detailDescription.innerText = jsonData[i] ? jsonData[i].description : 'No Data Available.';
            detailContainer.style.backgroundColor = jsonData[i] ? jsonData[i].themeColor : '#555';
        });
    }

    closeBtn.addEventListener('click', () => {
        detailContainer.classList.remove('active');
    });


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