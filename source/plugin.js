import fs from 'fs';
import merge from 'merge';

class LocalizationWebpackPlugin {
  constructor(options) {
    this.options = this.normalizeOptions(options);
  }

  normalizeOptions(options) {
    if (!options.locales || !Array.isArray(options.locales) || options.length === 0) {
      options.locales = ['en'];
    }

    return options;
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
                  // TODO: maybe show the path?
                  throw new Error('JSON\'s can\'t be merged! One of your JSON files is incorrect!');
                }
              });

              allMergedLocalesOfSubmodule = JSON.stringify(allMergedLocalesOfSubmodule);

              const chunkName = chunk.name.replace(/[-]/g, '.');

              compilation.assets[`${chunkName}.${locale}.json`] = {
                source: () => allMergedLocalesOfSubmodule,
                size: () => allMergedLocalesOfSubmodule.length,
              };
            }
          });
        });

        callback();
      });
    });
  }
}

export default LocalizationWebpackPlugin;
