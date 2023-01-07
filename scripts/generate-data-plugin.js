import webpack from 'webpack';

/**
 * Webpack plugin to generate JSON data from .txt files in the example/assets directory.
 */
export default class GenerateDataPlugin {
  constructor(config = {}) {
    if (!config.filename || !config.dataPromise) {
      throw new Error('GenerateDataPlugin "filename" and "dataPromise" options are required');
    }

    if (!(config.dataPromise instanceof Promise)) {
      throw new Error('GenerateDataPlugin "dataPromise" needs to be a Promise instance');
    }

    this.config = config;
  }

  apply(compiler) {
    const { mode } = compiler.options;

    compiler.hooks.thisCompilation.tap(this.constructor.name, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: this.constructor.name,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => this.addAsset(mode, compilation).catch((err) => compilation.errors.push(err))
      )
    });
  }

  async addAsset(mode, compilation) {
    const data = await this.config.dataPromise;
    const contents = JSON.stringify(data);

    compilation.emitAsset(
      this.config.filename,
      new webpack.sources.RawSource(contents)
    );
  }
}
