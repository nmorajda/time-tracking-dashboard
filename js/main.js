let state = {
  period: 'weekly',
  data: [],
};

const updateState = newState => {
  state = { ...state, ...newState };
  renderData();
};

const renderCard = data => {
  const title = data.title;
  const { current, previous } = data.timeframes[state.period];

  const labels = {
    daily: 'Yesterday',
    weekly: 'Last week',
    monthly: 'Last month',
  };

  const type = title.replace(' ', '-').toLowerCase();

  const html = `
          <div class="card ${type}" style="background-image: url(/images/icon-${type}.svg)">
            <div class="card-wrapper">
              <div class="card__header">
                <span>${title} </span>
                <img src="images/icon-ellipsis.svg" alt="Icon ellipsis"/>
              </div>
              <div class="card__body">
                  <h2>${current}hrs</h2>
                  <p><span>${labels[state.period]}: </span>${previous}hrs</p>
              </div>
          </div>
        </div>
      `;

  return html;
};

const renderData = () => {
  const cards = document.querySelector('.cards');
  cards.innerHTML = '';

  console.log(state.data);
  state.data.forEach(item => {
    const card = renderCard(item);
    cards.insertAdjacentHTML('beforeend', card);
  });
};

(async function get() {
  const response = await fetch('../data.json');
  const data = await response.json();

  updateState({ data });
})();

document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('[data-period]');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const period = btn.dataset.period;
      updateState({ period });

      btns.forEach(btn => btn.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
});
