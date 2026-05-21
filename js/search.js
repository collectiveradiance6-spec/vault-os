export function filterCards(){

  const value =
    document
      .getElementById('searchInput')
      .value
      .toLowerCase();

  document
    .querySelectorAll('.card')
    .forEach(card => {

      const text =
        card.innerText.toLowerCase();

      card.style.display =
        text.includes(value)
          ? ''
          : 'none';

    });

}