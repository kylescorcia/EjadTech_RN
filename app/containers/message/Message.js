import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import Touchable from 'react-native-platform-touchable';

import MessageContext from './Context';

import User from './User';
import styles from './styles';
import RepliedThread from './RepliedThread';
import MessageAvatar from './MessageAvatar';
import Attachments from './Attachments';
import Urls from './Urls';
import Thread from './Thread';
import Blocks from './Blocks';
import Reactions from './Reactions';
import Broadcast from './Broadcast';
import Discussion from './Discussion';
import Content from './Content';
import ReadReceipt from './ReadReceipt';
import CallButton from './CallButton';
import SyncStorage from 'sync-storage';

const MessageInner = React.memo((props) => {
	if (props.type === 'discussion-created') {
		return (
			<>
				<User {...props} />
				<Discussion {...props} />
			</>
		);
	}
	if (props.type === 'jitsi_call_started') {
		return (
			<>
				<User {...props} />
				<Content {...props} isInfo />
				<CallButton {...props} />
			</>
		);
	}
	if (props.blocks && props.blocks.length) {
		return (
			<>
				<User {...props} />
				<Blocks {...props} />
				<Thread {...props} />
				<Reactions {...props} />
			</>
		);
	}
	return (
		<View >
			<User {...props} />
			<Content {...props} />
			<Attachments {...props} />
			<Urls {...props} />
			<Thread {...props} />
			<Reactions {...props} />
			<Broadcast {...props} /> 
		</View>
	);
});
MessageInner.displayName = 'MessageInner';
const Message = React.memo((props) => {
	const visibility = SyncStorage.get('visibility');

	if (props.isThreadReply || props.isThreadSequential || props.isInfo) {
		const thread = props.isThreadReply ? <RepliedThread {...props} /> : null;
		return (
			<View style={[styles.container, props.style]}>
				<View style={[styles.flex, styles.center]}>
					<MessageAvatar small {...props} />
					<View
						style={[
							styles.messageContent,
							props.isHeader && styles.messageContentWithHeader
						]}
					>
						<Content {...props} />
					</View>
				</View>
			</View>
		);
	}

	//<View style={[styles.container, props.style, props.author.username === useContext(MessageContext).user.username && {backgroundColor: '#7DCDEB'}]}>
	return (
		<View style={[styles.container, props.style, props.author.username === useContext(MessageContext).user.username && {}]}>
			<View style={styles.flex}>
				{props.author.username !== useContext(MessageContext).user.username && <MessageAvatar {...props} />}
				<View
					style={[
						props.author.username !== useContext(MessageContext).user.username ? styles.messageContent : visibility === 'visible' ? styles.messageContentRight : styles.messageContent,
						props.author.username !== useContext(MessageContext).user.username ? props.isHeader && styles.messageContentWithHeader : visibility === 'visible' ? props.isHeader && styles.messageContentWithHeaderRight : props.isHeader && styles.messageContentWithHeader,
					]}
				>
					<MessageInner {...props} />
				</View>
				<ReadReceipt
					isReadReceiptEnabled={props.isReadReceiptEnabled}
					unread={props.unread}
					theme={props.theme}
				/>
				{props.author.username === useContext(MessageContext).user.username && visibility === 'visible' && <MessageAvatar {...props} />}
			</View>
		</View>
	);
});
Message.displayName = 'Message';

const MessageTouchable = React.memo((props) => {
	if (props.hasError) {
		return (
			<View>
				<Message {...props} />
			</View>
		);
	}
	const { onPress, onLongPress } = useContext(MessageContext);
	return (
		<Touchable
			onLongPress={onLongPress}
			onPress={onPress}
			disabled={props.isInfo || props.archived || props.isTemp}
		>
			<View>
				<Message {...props} />
			</View>
		</Touchable>
	);
});
MessageTouchable.displayName = 'MessageTouchable';

MessageTouchable.propTypes = {
	hasError: PropTypes.bool,
	isInfo: PropTypes.bool,
	isTemp: PropTypes.bool,
	archived: PropTypes.bool
};

Message.propTypes = {
	isThreadReply: PropTypes.bool,
	isThreadSequential: PropTypes.bool,
	isInfo: PropTypes.bool,
	isTemp: PropTypes.bool,
	isHeader: PropTypes.bool,
	hasError: PropTypes.bool,
	style: PropTypes.any,
	onLongPress: PropTypes.func,
	isReadReceiptEnabled: PropTypes.bool,
	unread: PropTypes.bool,
	theme: PropTypes.string,
};

MessageInner.propTypes = {
	type: PropTypes.string,
	blocks: PropTypes.array
};

export default MessageTouchable;
