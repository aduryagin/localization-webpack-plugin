import React from 'react';
import PropTypes from 'prop-types';
import './locales';

const Text = ({ i18n }) => (
  <div>{i18n.warAndPeace}</div>
);

Text.propTypes = {
  i18n: PropTypes.object.isRequired,
};

export default Text;
