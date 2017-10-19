import React from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import './locales';

const RootComponent = ({ i18n }) => (
  <div>
    <b>{i18n.title}</b>
    <Text i18n={i18n} />
  </div>
);

RootComponent.propTypes = {
  i18n: PropTypes.object.isRequired,
};

export default RootComponent;
