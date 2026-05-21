import { loadVault } from './storage.js';

import { setEntries }
from './vault.js';

import { initParticles }
from './particles.js';

import { filterCards }
from './search.js';

window.filterCards = filterCards;

boot();

function boot(){

  const data = loadVault();

  setEntries(data);

  initParticles();

}