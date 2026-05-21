export function switchTab(tab){

  document
    .querySelectorAll('.tab')
    .forEach(t => t.classList.remove('active'));

  document
    .getElementById(`tab${capitalize(tab)}`)
    .classList.add('active');

}

function capitalize(v){

  return v.charAt(0).toUpperCase()
    + v.slice(1);

}
