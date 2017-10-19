/*
  eslint-disable
  jsx-a11y/label-has-for
*/

import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.changeLanguage();
  }

  state = {
    component: null,
  };
  currentLang = 'RU';
  currentChunk = 'warAndPeace';
  langCache = new Map();
  i18n = {};

  changeLanguage = async (lang = this.currentLang) => {
    const locales = {
      warAndPeaceEN: 'chunkLocalizationURL: {"chunkName": "warAndPeace", "lang": "en"}',
      warAndPeaceRU: 'chunkLocalizationURL: {"chunkName": "warAndPeace", "lang": "ru"}',
      crimeAndPunishmentEN: 'chunkLocalizationURL: {"chunkName": "crimeAndPunishment", "lang": "en"}',
      crimeAndPunishmentRU: 'chunkLocalizationURL: {"chunkName": "crimeAndPunishment", "lang": "ru"}',
    };

    this.currentLang = lang;

    const fetchLanguage = async (chunk) => {
      if (this.langCache.get(`${chunk}${this.currentLang}`)) {
        this.i18n = this.langCache.get(`${chunk}${this.currentLang}`);
        return this.i18n;
      }

      await fetch(locales[`${chunk}${this.currentLang}`], {
        method: 'GET',
        credentials: 'same-origin',
      }).then(response => (
        response.json()
      )).then((localization) => {
        this.langCache.set(`${chunk}${this.currentLang}`, localization);
        this.i18n = localization;
      });

      return true;
    };

    if (this.currentChunk === 'warAndPeace') {
      await fetchLanguage('warAndPeace');
      return import(/* webpackChunkName: "warAndPeace" */ './chunks/warAndPeace/warAndPeace.js').then((chunk) => {
        this.setState({
          component: chunk.default.component,
        });
      });
    }

    await fetchLanguage('crimeAndPunishment');
    return import(/* webpackChunkName: "crimeAndPunishment" */ './chunks/crimeAndPunishment/crimeAndPunishment.js').then((chunk) => {
      this.setState({
        component: chunk.default.component,
      });
    });
  };

  render() {
    return (
      <div>
        <div style={{ marginRight: 10, marginBottom: 10, display: 'inline-block' }}>
          <label
            htmlFor="chunk"
            style={{ display: 'block' }}
          >
            Chunk
          </label>
          <select
            id="chunk"
            onChange={(event) => {
              this.currentChunk = event.target.value;
              this.changeLanguage();
            }}
            defaultValue={this.currentChunk}
          >
            <option value="warAndPeace">War and peace</option>
            <option value="crimeAndPunishment">Crime and punishment</option>
          </select>
        </div>
        <div style={{ display: 'inline-block' }}>
          <label
            htmlFor="language"
            style={{ display: 'block' }}
          >
            Language
          </label>
          <select
            onChange={event => this.changeLanguage(event.target.value)}
            id="language"
            defaultValue={this.currentLang}
          >
            <option value="EN">English</option>
            <option value="RU">Russian</option>
          </select>
        </div>
        {this.state.component && this.state.component({ i18n: this.i18n })}
      </div>
    );
  }
}

export default App;
