import React from 'react';
import { StatusBar as StatusBarRN } from 'react-native';
import PropTypes from 'prop-types';

import { isIOS } from '../utils/deviceInfo';
import { themes } from '../constants/colors';
import { withTheme } from '../theme';

const StatusBar = React.memo(({ theme }) => {
	let barStyle = 'light-content';
	if (theme === 'light' && isIOS) {
		barStyle = 'dark-content';
	}
	return <StatusBarRN backgroundColor={'#2f343d'} barStyle={barStyle} animated />;
});

StatusBar.propTypes = {
	theme: PropTypes.string
};

export default withTheme(StatusBar);
