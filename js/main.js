'use strict';

const dataSrc = 'https://nmorajda.github.io/time-tracking-dashboard/data.json';

let state = {
  period: 'weekly',
  data: [],
};

// selectors
const DOMselectors = {
  btnThemeSwitch: '#btnThemeSwitch',
  card: '.dashboard__card',
};

const DOMstrings = {};

for (const prop in DOMselectors) {
  if (Object.hasOwnProperty.call(DOMselectors, prop)) {
    DOMstrings[prop] = DOMselectors[prop].substr(1);
  }
}

// go go baby
(async function get() {
  try {
    const response = await fetch(dataSrc);
    const data = await response.json();

    updateState({ loaded: true, data });
    renderMenuBtns();
  } catch (error) {
    console.log(error);
  }
})();

const updateState = newState => {
  state = { ...state, ...newState };
  renderApp();
};

const renderApp = () => {
  renderCards();
};

const renderMenuBtns = () => {
  const menu = document.querySelector('.dashboard__header__menu');
  menu.innerHTML = '';

  const labels = Object.getOwnPropertyNames(state.data[0].timeframes);

  labels.forEach(label => {
    menu.insertAdjacentElement('beforeend', createMenuBtn(label));
  });
};

const createMenuBtn = label => {
  const btn = document.createElement('a');
  btn.setAttribute('class', 'btn');
  btn.setAttribute('href', '#');
  btn.setAttribute('data-period', label);
  btn.textContent = label;

  label === state.period ? btn.classList.add('is-active') : '';

  btn.addEventListener('click', e => menuBtnHandler(e.target, label));

  return btn;
};

const menuBtnHandler = (btn, label) => {
  const period = label;
  updateState({ period });
  setIsActive(btn);
};

const setIsActive = btn => {
  [...getSiblings(btn)].forEach(elem => elem.classList.remove('is-active'));

  btn.classList.add('is-active');
};

const getSiblings = elem => elem.parentElement.children;

const renderCard = (data, index) => {
  const title = data.title;
  const { current, previous } = data.timeframes[state.period];

  const prevLabels = {
    daily: 'Yesterday',
    weekly: 'Last week',
    monthly: 'Last month',
  };

  const type = title.replace(' ', '-').toLowerCase();

  const html = `
          <div class="${
            DOMstrings.card
          } ${type}" data-id="${index}" style="--index: ${index};">
              <div class="${
                DOMstrings.card
              }__inner" style="background-image: url(images/icon-${type}.svg)">
                <div class="${DOMstrings.card}__front">
                  <div class="${DOMstrings.card}__header">
                    <span class="${DOMstrings.card}-title">${title}</span>
                    <button class="${
                      DOMstrings.card
                    }__menu-open" aria-label="${type} card menu">
                      <img src="images/icon-ellipsis.svg" alt="Icon ellipsis" />
                    </button>
                  </div>
                  <div class="${DOMstrings.card}__content">
                      <p class="${
                        DOMstrings.card
                      }__current-time">${current}hrs</p>
                      <p class="${DOMstrings.card}__previous-time">
                        ${prevLabels[state.period]} ${previous}hrs</p>
                  </div>
                </div>
                <div class="${DOMstrings.card}__back">
                  <div class="${DOMstrings.card}__header">
                    <span class="${DOMstrings.card}-title">${title}</span>
                    <button class="${
                      DOMstrings.card
                    }__menu-close" aria-label="close card menu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #fff;transform: ;msFilter:;"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
                    </button>
                  </div>
                  <div class="${DOMstrings.card}__content">
                    <div class="${DOMstrings.card}__current-time">
                      <label class="small">Add: <input type="number" name="time" min="1" max="24" step="1" class="${
                        DOMstrings.card
                      }__input" /></label>hrs
                    </div>
                    <p class="${DOMstrings.card}__previous-time">${
    prevLabels[state.period]
  } ${previous}hrs</p>
                  </div>
                </div>
              </div>
            </div>
        `;

  return html;
};

const renderCards = () => {
  const cards = document.querySelector('.dashboard__cards ');
  // cards.classList.add('show');

  // Card show animation
  cards.classList.remove('show');
  setTimeout(() => {
    cards.classList.add('show');
  }, 500);

  cards.setAttribute('style', `--length: ${state.data.length}`);
  cards.innerHTML = '';

  state.data.forEach((item, index) => {
    const card = renderCard(item, index);
    cards.insertAdjacentHTML('beforeend', card);
  });
};

/*
@param {Function} func the function to debounce
@param {number} [wait = 0] the number of milliseconds to delay
*/
const debounce = (func, wait = 1000) => {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  let timerId;

  return (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      func.apply(null, args);
    }, wait);
  };
};

function inputHandler(e) {
  const card = e.target.closest(DOMselectors.card)
    ? e.target.closest(DOMselectors.card)
    : null;

  if (card) {
    const id = card.dataset.id;

    const elemInput = e.target;
    const valInput = +elemInput.value;

    if (valInput > 24) {
      alert('The maximum value is 24hrs.');
      elemInput.value = '';
      return;
    }

    if (valInput < 1) {
      alert('The minimum value is 1hrs.');
      elemInput.value = '';
      return;
    }

    const elemCurrentTime = card.querySelector(
      `${DOMselectors.card}__current-time`
    );

    const valCurrentTime = +elemCurrentTime.textContent.replace('hrs', '');

    // Update state without render cards

    const { timeframes } = state.data[id];

    for (const key in timeframes) {
      if (Object.hasOwnProperty.call(timeframes, key)) {
        timeframes[key].current += valInput;
      }
    }

    // Update UI
    elemCurrentTime.textContent = valCurrentTime + valInput + 'hrs';
    elemInput.value = '';
  }
}

function themeSwitchHandler() {
  document.body.classList.toggle('light');

  this.classList.toggle('is-active');
}

document.addEventListener('DOMContentLoaded', () => {
  const btnThemeSwitch = document.getElementById(DOMstrings.btnThemeSwitch);
  const elemCardsContainer = document.querySelector(`${DOMselectors.card}s`);

  btnThemeSwitch.addEventListener('click', themeSwitchHandler);

  // event delegation
  // TODO dodac aktualizacje w momencie nacisniecia klawisza
  elemCardsContainer.addEventListener('input', debounce(inputHandler, 600));

  elemCardsContainer.addEventListener('mouseover', e => {
    const card = e.target.closest(DOMselectors.card)
      ? e.target.closest(DOMselectors.card)
      : null;

    if (card) {
      // focus on input
      const input = card.querySelector('input');
      input.focus();
    }
  });

  elemCardsContainer.addEventListener('click', e => {
    const card = e.target.closest(DOMselectors.card)
      ? e.target.closest(DOMselectors.card)
      : null;

    if (card) {
      if (e.target.closest(`${DOMselectors.card}__menu-close`)) {
        card.classList.remove('flip');
      }

      if (e.target.closest(`${DOMselectors.card}__menu-open`)) {
        card.classList.add('flip');
        // focus on input
        const input = card.querySelector('input');
        input.focus();
      }
    }
  });
});
