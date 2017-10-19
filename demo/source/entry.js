import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';

const container = document.getElementById('app');

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    container,
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./App.js', () => {
    // eslint-disable-next-line global-require
    render(require('./App').default);
  });
}
