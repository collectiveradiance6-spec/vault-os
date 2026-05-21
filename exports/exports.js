function exportVault(){

  const blob = new Blob(
    [JSON.stringify(vaultEntries,null,2)],
    { type:"application/json" }
  );

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);

  a.download = "vault_backup.json";

  a.click();
}