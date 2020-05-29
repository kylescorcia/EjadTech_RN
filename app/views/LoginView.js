import React from 'react';
import PropTypes from 'prop-types';
import {
	Text, View, StyleSheet, Keyboard, Alert, Image, BackHandler
} from 'react-native';
import { connect } from 'react-redux';
import equal from 'deep-equal';

import { analytics } from '../utils/log';
import sharedStyles from './Styles';
import Button from '../containers/Button';
import I18n from '../i18n';
import { LegalButton } from '../containers/HeaderButton';
import { themes } from '../constants/colors';
import { withTheme } from '../theme';
import { themedHeader } from '../utils/navigation';
import FormContainer, { FormContainerInner } from '../containers/FormContainer';
import TextInput from '../containers/TextInput';
import { loginRequest as loginRequestAction } from '../actions/login';
import LoginServices from '../containers/LoginServices';
import { verticalScale, moderateScale } from '../utils/scaling';
import { isTablet } from '../utils/deviceInfo';

const styles = StyleSheet.create({
	registerDisabled: {
		...sharedStyles.textRegular,
		...sharedStyles.textAlignCenter,
		fontSize: 16
	},
	title: {
		...sharedStyles.textBold,
		fontSize: 22
	},
	inputContainer: {
		marginVertical: 8,
		width: '90%',
		alignSelf: 'center',
	},
	bottomContainer: {
		flexDirection: 'column',
		alignItems: 'center',
		marginBottom: 24
	},
	bottomContainerText: {
		...sharedStyles.textRegular,
		fontSize: 13
	},
	bottomContainerTextBold: {
		...sharedStyles.textSemibold,
		fontSize: 15
	},
	bottomPolicy: {
		fontSize: 14,
		marginTop: 10,
		alignSelf: 'center',
	},
	loginButton: {
		marginTop: 10,
		width: '90%',
		alignSelf: 'center',
	},
	languageButton: {
		marginTop: 10,
		alignSelf: 'center',
		paddingBottom: 20,
		backgroundColor: 'transparent',
	},
	serverIcon: {
		alignSelf: 'center',
		marginTop: isTablet ? 0 : verticalScale(50),
		marginBottom: verticalScale(30),
		maxHeight: verticalScale(100),
		resizeMode: 'contain',
		width: 250,
		height: 90
	},
	shadowStyle: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.8,
		shadowRadius: 2,  
		elevation: 5,
		alignSelf: 'center'
	}
});

const Writings = [
	{
		EmailPlaceholder: 'Email or username',
		PasswordPlaceholder: 'Password',

		LoginBtn: 'Login',
		ForgotPasswordBtn: 'Forgot your password?',
		RegisterBtn: 'Register a new account',

		// TermsTxt: 'By proceeding you are agreeing to our '+'Terms of Service'+ ' Privacy Policy' + ' and' + ' Legal Notice',
		Terms: [
			{ weight: 'normal', txt: 'By proceeding you are agreeing to our ' },
			{ weight: 'bold', txt: 'Terms of Service' },
			{ weight: 'normal', txt: ' and' },
			{ weight: 'bold', txt: ' Privacy Policy' },
		],
		// PoweredTxt: 'Powered by',
		PoweredTxt: [
			{ weight: 'bold', txt: ' EjadChat' },
			{ weight: 'normal', txt: ' was developed for '},
			{ weight: 'bold', txt: ' EjadTech' },
		],

		Language: 'Go to English version',
	},
	{
		EmailPlaceholder: 'البريد الإلكتروني أو اسم المستخدم',
		PasswordPlaceholder: 'كلمه السر',

		LoginBtn: 'تسجيل الدخول',
		ForgotPasswordBtn: 'نسيت رقمك السري؟',
		RegisterBtn: 'تسجيل حساب جديد',

		// TermsTxt: 'من خلال المتابعة ، فإنك توافق على موقعنا ' + ' شروط الخدمة' + ' سياسة الخصوصية' + ' و' + 'إشعار قانوني',
		Terms: [
			{ weight: 'normal', txt: 'من خلال المتابعة فإنك توافق على' },
			{ weight: 'bold', txt: 'شروط الخدمة' },
			{ weight: 'normal', txt: '\nو' },
			{ weight: 'bold', txt: 'سياسة الخصوصية ' },
		],
		// PoweredTxt: 'مدعوم من',
		PoweredTxt: [
			{ weight: 'normal', txt: 'نم تطوير إيجاد شات لصالح شركة\n'},
			{ weight: 'bold', txt: 'إيجاد التقنية لتقنية المعلومات' },
		],

		Language: 'الذهاب إلى النسخة العربية',
	},
];

class LoginView extends React.Component {
	static navigationOptions = () => ({
		header: null
	})

	static propTypes = {
		navigation: PropTypes.object,
		Site_Name: PropTypes.string,
		Accounts_RegistrationForm: PropTypes.string,
		Accounts_RegistrationForm_LinkReplacementText: PropTypes.string,
		Accounts_EmailOrUsernamePlaceholder: PropTypes.string,
		Accounts_PasswordPlaceholder: PropTypes.string,
		Accounts_PasswordReset: PropTypes.bool,
		Accounts_ShowFormLogin: PropTypes.bool,
		isFetching: PropTypes.bool,
		error: PropTypes.object,
		failure: PropTypes.bool,
		theme: PropTypes.string,
		loginRequest: PropTypes.func
	}

	constructor(props) {
		super(props);
		this.state = {
			user: '',
			password: '',
			language: 0 // 0: English, 1: Arabic
		};
	}

	//expert-group changed
	componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton() {
    //    ToastAndroid.show('Back button is pressed', ToastAndroid.SHORT);
        return true;
    }
    //////////

	UNSAFE_componentWillReceiveProps(nextProps) {
		const { error } = this.props;
		if (nextProps.failure && !equal(error, nextProps.error)) {
			Alert.alert(I18n.t('Oops'), I18n.t('Login_error'));
		}
	}

	login = () => {
		const { navigation, Site_Name } = this.props;
		navigation.navigate('LoginView', { title: Site_Name });
	}

	register = () => {
		const { navigation, Site_Name } = this.props;
		navigation.navigate('RegisterView', { title: Site_Name });
	}

	forgotPassword = () => {
		const { navigation, Site_Name } = this.props;
		navigation.navigate('ForgotPasswordView', { title: Site_Name });
	}

	updateLanguage = () => {
		this.setState({ language: this.state.language === 1 ? 0 : 1})
	}

	valid = () => {
		const { user, password } = this.state;
		return user.trim() && password.trim();
	}

	submit = () => {
		if (!this.valid()) {
			return;
		}

		const { user, password, language } = this.state;
		const { loginRequest } = this.props;
		Keyboard.dismiss();
		loginRequest({ user, password, language });
		analytics().logEvent('login');
	}

	renderUserForm = () => {
		const {
			Accounts_EmailOrUsernamePlaceholder, Accounts_PasswordPlaceholder, Accounts_PasswordReset, Accounts_RegistrationForm, Accounts_RegistrationForm_LinkReplacementText, isFetching, theme, Accounts_ShowFormLogin
		} = this.props;

		if (!Accounts_ShowFormLogin) {
			return null;
		}

		const { language } = this.state;

		return (
			<>
				<View style={{position: 'absolute', top:-1000, bottom:-1000, right:-1000, left: -1000}}>
					<Image style={{width: '100%', height: '100%'}} source={require('../static/images/bg.png')} />
				</View>
				<Image style={styles.serverIcon} source={require('../static/images/logo.png')} />
				<View style={{ backgroundColor: 'white', paddingTop: 20, width: '90%', ...styles.shadowStyle }}>
					<TextInput
						containerStyle={styles.inputContainer}
						placeholder={Accounts_EmailOrUsernamePlaceholder || Writings[language].EmailPlaceholder}
						keyboardType='email-address'
						returnKeyType='next'
						onChangeText={value => this.setState({ user: value })}
						onSubmitEditing={() => { this.passwordInput.focus(); }}
						testID='login-view-email'
						textContentType='username'
						autoCompleteType='username'
						theme={theme}
						arabicInput={language === 1 ? true : false}
					/>
					<TextInput
						containerStyle={styles.inputContainer}
						inputRef={(e) => { this.passwordInput = e; }}
						placeholder={Accounts_PasswordPlaceholder || Writings[language].PasswordPlaceholder}
						returnKeyType='send'
						secureTextEntry
						onSubmitEditing={this.submit}
						onChangeText={value => this.setState({ password: value })}
						testID='login-view-password'
						textContentType='password'
						autoCompleteType='password'
						theme={theme}
						arabicInput={language === 1 ? true : false}
					/>
					<Button
						title={Writings[language].LoginBtn}
						type='primary'
						onPress={this.submit}
						testID='login-view-submit'
						loading={isFetching}
						theme={theme}
						style={styles.loginButton}
					/>
					{Accounts_PasswordReset && (
						<Button
							title={Writings[language].ForgotPasswordBtn}
							type='secondary'
							onPress={this.forgotPassword}
							testID='login-view-forgot-password'
							theme={theme}
							color='#000'
							boldBtn
							style={{backgroundColor: 'none'}, {fontWeight: "bold"}}
							fontSize={15}
						/>
					)}
					{Accounts_RegistrationForm === 'Public' ? (
						<View style={styles.bottomContainer}>
							<Text
								style={[styles.bottomContainerTextBold, { color: themes[theme].black }]}
								onPress={this.register}
								testID='login-view-register'
							>{Writings[language].RegisterBtn}
							</Text>
						</View>
					) : (<Text style={[styles.registerDisabled, { color: themes[theme].auxiliaryText }]}>{Accounts_RegistrationForm_LinkReplacementText}</Text>)}
				</View>
				<View style={{ backgroundColor: 'none', paddingTop: 20, width: '90%', alignSelf: 'center', justifyContent: 'center' }}>
					<Text style={[styles.bottomPolicy, { color: themes[theme].black , textAlign: 'center' }]}>
						{Writings[language].Terms.map((item, index) => <Text style={{fontWeight: item.weight}} key={index}>{item.txt}</Text>)}
					</Text>
					<Text style={[styles.bottomPolicy, { color: themes[theme].black, textAlign: 'center' }]}>
						{Writings[language].PoweredTxt.map((item, index) => <Text style={{fontWeight: item.weight}} key={index}>{item.txt}</Text>)}	
					</Text>
				</View>
				<View style={styles.languageButton}>
					<Text
						style={[styles.bottomContainerTextBold, { color: themes[theme].actionTintColor, textAlign: 'right', textDecorationLine: 'underline', textDecorationStyle: 'solid' }]}
						onPress={this.updateLanguage}
						testID='language-view-Switch'
					>{Writings[language === 1 ? 0 : 1].Language}
					</Text>
				</View>
			</>
		);
	}

	render() {
		const { Accounts_ShowFormLogin, theme } = this.props;
		return (
			<FormContainer theme={theme} testID='login-view'>
				<FormContainerInner>
					<LoginServices separator={Accounts_ShowFormLogin} />
					{this.renderUserForm()}
				</FormContainerInner>
			</FormContainer>
		);
	}
}

const mapStateToProps = state => ({
	server: state.server.server,
	Site_Name: state.settings.Site_Name,
	Accounts_ShowFormLogin: state.settings.Accounts_ShowFormLogin,
	Accounts_RegistrationForm: state.settings.Accounts_RegistrationForm,
	Accounts_RegistrationForm_LinkReplacementText: state.settings.Accounts_RegistrationForm_LinkReplacementText,
	isFetching: state.login.isFetching,
	failure: state.login.failure,
	error: state.login.error && state.login.error.data,
	Accounts_EmailOrUsernamePlaceholder: state.settings.Accounts_EmailOrUsernamePlaceholder,
	Accounts_PasswordPlaceholder: state.settings.Accounts_PasswordPlaceholder,
	Accounts_PasswordReset: state.settings.Accounts_PasswordReset
});

const mapDispatchToProps = dispatch => ({
	loginRequest: params => dispatch(loginRequestAction(params))
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(LoginView));
