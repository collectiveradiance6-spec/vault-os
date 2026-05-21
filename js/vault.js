import { saveVault } from './storage.js';

export let entries = [];

export function setEntries(data){

  entries = data;

}

export function addEntry(entry){

  entries.push(entry);

  saveVault(entries);

}

export function deleteEntry(id){

  entries =
    entries.filter(e => e.id !== id);

  saveVault(entries);

}

export function updateEntry(id,newData){

  const index =
    entries.findIndex(e => e.id === id);

  if(index === -1) return;

  entries[index] = {
    ...entries[index],
    ...newData
  };

  saveVault(entries);

}