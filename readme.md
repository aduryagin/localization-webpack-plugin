# LocalizationWebpackPlugin
Make separate JSON localization files for every chunk

* [See demo](https://warm-savannah-71686.herokuapp.com/)
* [See source of demo](https://github.com/aiduryagin/localization-webpack-plugin-demo)

## Usage
This plugin creates merged JSON files with translations for cunks. One JSON file by one chunk.
To get link to JSON file with translations you need to write in code 

```javascript
// 'chunkLocalizationURL: {"chunkName": "warAndPeace", "lang": "en"}' will be replaced by 'warAndPeace.en.json'
const linksToTranslationFiles = {
  warAndPeaceEN: 'chunkLocalizationURL: {"chunkName": "warAndPeace", "lang": "en"}',
  warAndPeaceRU: 'chunkLocalizationURL: {"chunkName": "warAndPeace", "lang": "ru"}'
};
```

## Options
```javascript
plugins: [
  ...
  new LocalizationWebpackPlugin({
    filename: '[chunkname].[lang].json', // Avaible: [chunkname], [hash], [lang]
    locales: ['en', 'ru'],
  }),
],
```
* `filename`: the default value is `[chunkname].[lang].json` Avaible tags is `[chunkname], [hash], [lang]`
* `locales`: the default value is `['en']`