function openPanel(id){
  const panel = document.getElementById("panel");

  panel.classList.add("active");
}

function closePanel(){
  document
    .getElementById("panel")
    .classList.remove("active");
}