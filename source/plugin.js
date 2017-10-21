// @flow

import fs from 'fs';
import crypto from 'crypto';
import merge from 'merge';
import { RawSource } from 'webpack-sources';
import Template from 'webpack/lib/Template';

type pluginOptions = { locales: [string], filename: string };
type localeAsset = { chunkName: string, locale: string, localeFileName: string };

class LocalizationWebpackPlugin {
  options: pluginOptions;
  localesAssets: Array<localeAsset>;

  constructor(options: pluginOptions): void {
    this.options = this.normalizeOptions(options);
    this.localesAssets = [];
  }

  normalizeOptions(options: pluginOptions): pluginOptions {
    const defaultLocales: [string] = ['en'];
    const defaultFilename: string = '[chunkname].[lang].json';

    if (!options || typeof options !== 'object' || Object.keys(options).length === 0) {
      options = {
        locales: defaultLocales,
        filename: defaultFilename
      };
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

  apply(compiler: { plugin: Function }) {
    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('additional-assets', (callback) => {
        compilation.chunks.forEach((chunk) => {
          let grouppedLangs: { [locale: string]: Array<string> } = {};

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
              let allMergedLocalesOfSubmodule: Object | string = {};

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

              const localeFileName: string =
                this.options.filename
                  .replace('[chunkname]', chunk.name || chunk.id)
                  .replace('[lang]', locale)
                  .replace('[hash]', crypto.createHash('md5').update(chunk.name || chunk.id).digest('hex').substr(-5));

              compilation.assets[localeFileName] = {
                source: () => allMergedLocalesOfSubmodule,
                size: () => allMergedLocalesOfSubmodule.length
              };

              const localeExist: ?localeAsset = this.localesAssets.find(asset =>
                (asset.chunkName === Template.toPath(chunk.name)) &&
                asset.locale === locale);

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
        const files: Array<string> = [];

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

          let sourceCode: string;

          if (asset.sourceAndMap) {
            const sourceAndMap = asset.sourceAndMap();
            sourceCode = sourceAndMap.source;
          } else {
            sourceCode = asset.source();
          }

          const regExp: RegExp = /chunkLocalizationURL: {"chunkName": ".*", "lang": ".*"}/gi;
          const arrayForReplace: Array<string> = sourceCode.match(regExp);

          if (Array.isArray(arrayForReplace)) {
            arrayForReplace.forEach((template) => {
              const JSONFromTemplate: Object = JSON.parse(template.replace('chunkLocalizationURL: ', ''));

              const chunkLocaleAsset: ?localeAsset =
                this.localesAssets.find(chunkLocalizationAsset =>
                  (
                    chunkLocalizationAsset.chunkName === Template.toPath(JSONFromTemplate.chunkName)
                  ) && chunkLocalizationAsset.locale === JSONFromTemplate.lang);

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
