import EventBus from './event_bus.js';

export default class Loading {
  constructor() {
    this.element = document.getElementById('js-loading-component');

    EventBus.addEventListener('order:submit:started', () => this.#show());
    EventBus.addEventListener('order:submit:finished', () => this.#hide());
  }

  #show() {
    console.log('show loading');
    this.element.style.display = 'flex';
  }

  #hide() {
    console.log('hide loading');
    this.element.style.display = 'none';
  }
}