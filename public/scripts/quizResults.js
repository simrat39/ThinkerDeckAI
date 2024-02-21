function init(){
  // extract URL parameters
  const URLParams = new URLSearchParams(window.location.search);
  const score = URLParams.get('score');
  const total = URLParams.get('total');

  document.getElementById("score-label").innerText = `Score: ${score} / ${total}`;
  document.getElementById("percentage-label").innerText = `Percentage: ${score/total * 100}%`;
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});