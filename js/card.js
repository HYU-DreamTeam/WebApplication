const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close-btn');

// 페이지 로드 시 팝업 보이기
window.onload = function() {
    modal.style.display = 'flex';
};

// 닫기 버튼 클릭 시 팝업 숨기기
closeBtn.onclick = function() {
    modal.style.display = 'none';
};