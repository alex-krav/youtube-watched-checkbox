'use strict';

import webpack from 'webpack';
import merge from 'webpack-merge';
import common from './webpack.common';

const config: webpack.Configuration = merge(common, {
  devtool: 'inline-source-map',
  mode: 'development',
});

export default config;
