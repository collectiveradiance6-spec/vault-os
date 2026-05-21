let enteredPin = "";

function pressKey(v){
  enteredPin += v;

  if(enteredPin.length >= 6){
    unlock();
  }
}

function unlock(){
  document
    .getElementById("lockScreen")
    .classList.add("fade-out");
}