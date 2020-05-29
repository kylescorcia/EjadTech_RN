import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';
import equal from 'deep-equal';

import I18n from '../../i18n';
import styles from './styles';
import Markdown from '../markdown';
import { getInfoMessage } from './utils';
import { themes } from '../../constants/colors';
import MessageContext from './Context';
import { withTheme } from '../../theme';

const Content = React.memo((props) => {
	if (props.isInfo) {
		const infoMessage = getInfoMessage({ ...props });
		return (
			<Text
				style={[styles.textInfo, { color: themes[props.theme].auxiliaryText }]}
				accessibilityLabel={infoMessage}
			>{infoMessage}
			</Text>
		);
	}

	let content = null;

	const { baseUrl, user } = useContext(MessageContext);
	if (props.tmid && !props.msg) {
		content = <Text style={[styles.text, { color: themes[props.theme].bodyText }]}>{I18n.t('Sent_an_attachment')}</Text>;
	} else {
		content = (
			<Markdown
				msg={props.msg}
				baseUrl={baseUrl}
				getCustomEmoji={props.getCustomEmoji}
				username={user.username}
				isEdited={props.isEdited}
				numberOfLines={(props.tmid && !props.isThreadRoom) ? 1 : 0}
				preview={props.tmid && !props.isThreadRoom}
				channels={props.channels}
				mentions={props.mentions}
				navToRoomInfo={props.navToRoomInfo}
				tmid={props.tmid}
				useRealName={props.useRealName}
				theme={props.theme}
				authorUsername={props.author.username}
				style={[
					// user.username === props.author.username ? {backgroundColor: '#7DCDEB', flexDirection: 'row', width:'70%'} : {backgroundColor: themes[props.theme].otherTextBackgroundColor, flexDirection: 'row', width:'70%'}, 
					user.username === props.author.username ? {backgroundColor: themes[props.theme].chatTextBackgroundColor, flexDirection: 'row', minWidth:30, maxWidth:'70%'} : {backgroundColor: themes[props.theme].otherTextBackgroundColor, minWidth:30, maxWidth:'70%'}, 
					{padding:5, paddingLeft:10, paddingRight:10, borderRadius: 5}
				]}
			/>
		);
	}
	return (
		<View style={[
			props.isTemp && styles.temp, user.username === props.author.username && { justifyContent: 'flex-end'}, {flex: 1, flexDirection: 'row'} ]} >
			{content}
		</View>
	);
}, (prevProps, nextProps) => {
	if (prevProps.isTemp !== nextProps.isTemp) {
		return false;
	}
	if (prevProps.msg !== nextProps.msg) {
		return false;
	}
	if (prevProps.theme !== nextProps.theme) {
		return false;
	}
	if (!equal(prevProps.mentions, nextProps.mentions)) {
		return false;
	}
	if (!equal(prevProps.channels, nextProps.channels)) {
		return false;
	}
	return true;
});

Content.propTypes = {
	isTemp: PropTypes.bool,
	isInfo: PropTypes.bool,
	tmid: PropTypes.string,
	isThreadRoom: PropTypes.bool,
	msg: PropTypes.string,
	theme: PropTypes.string,
	isEdited: PropTypes.bool,
	getCustomEmoji: PropTypes.func,
	channels: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	mentions: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	navToRoomInfo: PropTypes.func,
	useRealName: PropTypes.bool
};
Content.displayName = 'MessageContent';

export default Content;
