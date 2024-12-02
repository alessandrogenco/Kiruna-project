const webpack = require('webpack');
const dotenv = require('dotenv');

// Carica le variabili di ambiente dal file .env
dotenv.config();

module.exports = {
  // Punto di ingresso dell'applicazione
  entry: './src/index.js',
  
  // Configurazione dell'output
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
  
  // Configurazione dei loader
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      // Altri loader
    ],
  },
  
  // Configurazione dei plugin
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ],
  
  // Risoluzione delle estensioni dei file
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  
  // Configurazione del server di sviluppo
  devServer: {
    contentBase: './dist',
    hot: true,
  },
};