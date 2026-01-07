var heroText = document.getElementById("heroText");

setTimeout(function () {
  heroText.className = "show";
}, 100);

setTimeout(function () {
  var strong = heroText.getElementsByTagName("strong")[0];
  strong.style.color = "#5b6cff";
}, 800);
