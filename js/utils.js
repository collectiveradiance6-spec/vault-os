export function copy(text){

  navigator.clipboard.writeText(text);

}

export function uuid(){

  return crypto.randomUUID();

}