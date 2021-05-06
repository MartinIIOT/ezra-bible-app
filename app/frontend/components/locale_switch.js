/* This file is part of Ezra Bible App.

   Copyright (C) 2019 - 2021 Ezra Bible App Development Team <contact@ezrabibleapp.net>

   Ezra Bible App is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 2 of the License, or
   (at your option) any later version.

   Ezra Bible App is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with Ezra Bible App. See the file LICENSE.
   If not, see <http://www.gnu.org/licenses/>. */


class LocaleSwitch extends HTMLElement {
  constructor() {
    super();

    const locales = i18nHelper.getAvaliableLocales();

    this.innerHTML = html`
      <style>
        .config-select {
          width: 100%;
        }
      </style>

      <div id="language-switch-box" class="switch-box">
        <div class="select-label"></div>
        <select name="config-select" class="config-select">
          ${locales.map(locale => `<option value="${locale.code}" ${locale.code === i18nHelper.getLanguage() ? 'selected' : ''}>${locale.languageName}</option>`).join('')}
        </select>
      </div>
    `;

    this.selectEl = this.querySelector('.config-select');

    this.changeEvent = new CustomEvent("optionChanged", {
      bubbles: true,
      cancelable: false,
      composed: true
    });

    this._settingsKey = this.getAttribute('settingsKey');
    this._autoLoad = true;
    if (this.hasAttribute('autoLoad') && this.getAttribute('autoLoad') == "false") {
      this._autoLoad = false;
    }

    this._localize();

    if (this._autoLoad) {
      this.loadOptionFromSettings();
    }

    $(this.selectEl).selectmenu({
      width: 247, // FIXME: magic number that works with jQuery UI
      change: () => this._handleChange(),
    });  
  }

  async _handleChange() {
    await waitUntilIdle();
    await ipcSettings.set(this._settingsKey, this.selectEl.value);
    console.log('select changed', this._settingsKey, this.selectEl.value);
    this.dispatchEvent(this.changeEvent);
  }

  _localize() {
    var labelId = this.getAttribute('label');
    this.querySelector('.select-label').innerText = i18n.t(labelId);
  }

  get value() {
    return this.selectEl.value;
  }

  async loadOptionFromSettings() {
    this.selectEl.value = await ipcSettings.get(this._settingsKey, "");
  }
}

customElements.define('locale-switch', LocaleSwitch);
module.exports = LocaleSwitch;