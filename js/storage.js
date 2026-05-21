const STORAGE_KEY = "vault_os_data";

function saveVault(){
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(vaultEntries)
  );
}

function loadVault(){
  const data = localStorage.getItem(STORAGE_KEY);

  if(data){
    vaultEntries = JSON.parse(data);
  }else{
    vaultEntries = DEFAULT_VAULT;
    saveVault();
  }
}