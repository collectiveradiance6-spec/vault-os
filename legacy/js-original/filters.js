function filterCards(){
  const q = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  renderCards(
    vaultEntries.filter(e =>
      e.name.toLowerCase().includes(q)
    )
  );
}
