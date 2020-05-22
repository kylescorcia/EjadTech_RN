import { StyleSheet } from 'react-native';

import sharedStyles from '../Styles';
import { verticalScale, moderateScale } from '../../utils/scaling';
import { isTablet } from '../../utils/deviceInfo';

export default StyleSheet.create({
	serverName: {
		...sharedStyles.textSemibold,
		fontSize: 16,
		marginBottom: 4
	},
	serverUrl: {
		...sharedStyles.textRegular,
		fontSize: 14,
		marginBottom: 24
	},
	registrationText: {
		fontSize: 14,
		...sharedStyles.textAlignCenter,
		...sharedStyles.textRegular
	},
	alignItemsCenter: {
		alignItems: 'center'
	},
	//expert-group changed
	serverIcon: {
		alignSelf: 'center',
		marginTop: isTablet ? 0 : verticalScale(116),
		marginBottom: verticalScale(20),
		maxHeight: verticalScale(150),
		resizeMode: 'contain',
		width: 200,
		height: 70
	},
});
