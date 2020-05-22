import React from 'react';
import {
	View, Text, Image, BackHandler, Linking
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Orientation from 'react-native-orientation-locker';

import { appStart as appStartAction } from '../../actions';
import I18n from '../../i18n';
import Button from '../../containers/Button';
import styles from './styles';
import { isTablet } from '../../utils/deviceInfo';
import { themes } from '../../constants/colors';
import { withTheme } from '../../theme';
import FormContainer, { FormContainerInner } from '../../containers/FormContainer';

class OnboardingView extends React.Component {
	static navigationOptions = () => ({
		header: null
	})

	static propTypes = {
		navigation: PropTypes.object,
		appStart: PropTypes.func,
		theme: PropTypes.string
	}

	constructor(props) {
		super(props);
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		if (!isTablet) {
			Orientation.lockToPortrait();
		}
		//expert-group changed
		this.connectServer()   		
	}

	shouldComponentUpdate(nextProps) {
		const { theme } = this.props;
		if (theme !== nextProps.theme) {
			return true;
		}
		return false;
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = () => {
		const { appStart } = this.props;
		appStart('background');
		return false;
	}

	connectServer = () => {
		const { navigation } = this.props;
		navigation.navigate('NewServerView');
	}

	createWorkspace = async() => {
		try {
			await Linking.openURL('https://cloud.rocket.chat/trial');
		} catch {
			// do nothing
		}
	}

	render() {
		const { theme } = this.props;
		return (
			<View />
		);
	}
}

const mapDispatchToProps = dispatch => ({
	appStart: root => dispatch(appStartAction(root))
});

export default connect(null, mapDispatchToProps)(withTheme(OnboardingView));
