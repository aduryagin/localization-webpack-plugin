import fs from 'fs';
import crypto from 'crypto';
import merge from 'merge';
import { RawSource } from 'webpack-sources';
import Template from 'webpack/lib/Template';

class LocalizationWebpackPlugin {
  constructor(options) {
    this.options = this.normalizeOptions(options);
    this.localesAssets = [];
  }

  normalizeOptions(options) {
    const defaultLocales = ['en'];
    const defaultFilename = '[chunkname].[lang].json';

    if (!options || options.length === 0) {
      options = {};
      options.locales = defaultLocales;
      options.filename = defaultFilename;
    }

    if (!options.locales) {
      options.locales = defaultLocales;
    }

    if (!options.filename) {
      options.filename = defaultFilename;
    }

    return options;
  }

  static replaceJSONByRandomNumber() {
    return require.resolve('./replaceJSONByRandomNumberLoader');
  }

  apply(compiler) {
    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('additional-assets', (callback) => {
        compilation.chunks.forEach((chunk) => {
          const grouppedLangs = {};

          chunk.forEachModule((module) => {
            if (String(module.resource).match(new RegExp(`(${this.options.locales.join('|')}).json`))) {
              module.fileDependencies.forEach((filepath) => {
                this.options.locales.forEach((locale) => {
                  if (String(filepath).match(new RegExp(`${locale}.json`))) {
                    if (Array.isArray(grouppedLangs[locale])) {
                      grouppedLangs[locale].push(filepath);
                    } else {
                      grouppedLangs[locale] = [filepath];
                    }
                  }
                });
              });
            }
          });

          this.options.locales.forEach((locale) => {
            if (grouppedLangs[locale]) {
              let allMergedLocalesOfSubmodule = {};

              grouppedLangs[locale].forEach((pathToLocale) => {
                try {
                  const data = fs.readFileSync(pathToLocale, 'utf8');
                  allMergedLocalesOfSubmodule = merge.recursive(
                    allMergedLocalesOfSubmodule,
                    JSON.parse(data),
                  );
                } catch (error) {
                  callback(new Error(`[localization-webpack-plugin] JSON.parse error! File: ${pathToLocale}`));
                }
              });

              allMergedLocalesOfSubmodule = JSON.stringify(allMergedLocalesOfSubmodule);

              const localeFileName =
                this.options.filename
                  .replace('[chunkname]', chunk.name || chunk.id)
                  .replace('[lang]', locale)
                  .replace('[hash]', crypto.createHash('md5').update(chunk.name || chunk.id).digest('hex').substr(-5));

              compilation.assets[localeFileName] = {
                source: () => allMergedLocalesOfSubmodule,
                size: () => allMergedLocalesOfSubmodule.length
              };

              const localeExist = this.localesAssets.find(localeAsset =>
                (localeAsset.chunkName === Template.toPath(chunk.name)) &&
                localeAsset.locale === locale);

              if (!localeExist) {
                this.localesAssets.push({
                  chunkName: chunk.name,
                  locale,
                  localeFileName
                });
              }
            }
          });
        });

        callback();
      });

      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        const files = [];

        chunks.forEach((chunk) => {
          chunk.files.forEach((file) => {
            files.push(file);
          });
        });

        compilation.additionalChunkAssets.forEach((file) => {
          files.push(file);
        });

        files.forEach((file) => {
          const asset = compilation.assets[file];

          let sourceCode;

          if (asset.sourceAndMap) {
            const sourceAndMap = asset.sourceAndMap();
            sourceCode = sourceAndMap.source;
          } else {
            sourceCode = asset.source();
          }

          const regExp = /chunkLocalizationURL: {"chunkName": ".*", "lang": ".*"}/gi;
          const arrayForReplace = sourceCode.match(regExp);

          if (Array.isArray(arrayForReplace)) {
            arrayForReplace.forEach((template) => {
              const JSONFromTemplate = JSON.parse(template.replace('chunkLocalizationURL: ', ''));

              const chunkLocaleAsset =
                this.localesAssets.find(localeAsset =>
                  (localeAsset.chunkName === Template.toPath(JSONFromTemplate.chunkName)) &&
                  localeAsset.locale === JSONFromTemplate.lang);

              if (chunkLocaleAsset) {
                sourceCode = sourceCode.replace(template, chunkLocaleAsset.localeFileName);
              }
            });
          }

          compilation.assets[file] = new RawSource(sourceCode);
        });

        callback();
      });
    });
  }
}

export default LocalizationWebpackPlugin;
