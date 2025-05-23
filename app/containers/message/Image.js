import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import FastImage from 'react-native-fast-image';
import equal from 'deep-equal';
import { createImageProgress } from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

import Touchable from './Touchable';
import Markdown from '../markdown';
import styles from './styles';
import { formatAttachmentUrl } from '../../lib/utils';
import { withSplit } from '../../split';
import { themes } from '../../constants/colors';
import sharedStyles from '../../views/Styles';
import MessageContext from './Context';
import { withTheme } from '../../theme';

const ImageProgress = createImageProgress(FastImage);

const Button = React.memo(({
	children, onPress, split, theme
}) => (
	<Touchable
		onPress={onPress}
		style={[styles.imageContainer, split && sharedStyles.tabletContent]}
		background={Touchable.Ripple(themes[theme].bannerBackground)}
	>
		{children}
	</Touchable>
));

export const MessageImage = React.memo(({ img, theme, authorUsername, username }) => (
	<ImageProgress
		style={[styles.image, { borderColor: themes[theme].borderColor, width: '80%'}, authorUsername === username && {marginLeft: 'auto'} ]}
		source={{ uri: encodeURI(img) }}
		resizeMode={FastImage.resizeMode.cover}
		indicator={Progress.Pie}
		indicatorProps={{
			color: themes[theme].actionTintColor
		}}
	/>
));

const ImageContainer = React.memo(({
	file, imageUrl, showAttachment, getCustomEmoji, split, theme, props, author
}) => {
	const { baseUrl, user } = useContext(MessageContext);
	const img = imageUrl || formatAttachmentUrl(file.image_url, user.id, user.token, baseUrl);
	if (!img) {
		return null;
	}

	const onPress = () => showAttachment(file);

	if (file.description) {
		return (
			<Button split={split} theme={theme} onPress={onPress}>
				<View  style={[{ width: '100%', flexDirection: 'column', justifyContent: 'flex-end'}]}>
					<MessageImage img={img} theme={theme} authorUsername={author.username} username={user.username} />
					<Markdown 
					msg={file.description} baseUrl={baseUrl} 
					username={user.username} 
					getCustomEmoji={getCustomEmoji} 
					theme={theme} isDescription='1' 
					style={[author.username === user.username && {marginLeft: 'auto'}, 
					// user.username === props.author.username ? {backgroundColor: '#7DCDEB', flexDirection: 'row', width:'70%'} : {backgroundColor: themes[props.theme].otherTextBackgroundColor, flexDirection: 'row', width:'70%'}, 
					user.username === author.username ? {backgroundColor: themes[theme].chatTextBackgroundColor, flexDirection: 'row', minWidth:30, maxWidth:'80%'} : {backgroundColor: themes[theme].otherTextBackgroundColor, minWidth:30, maxWidth:'80%'}, 
					{padding:5, paddingLeft:10, paddingRight:10, borderRadius: 5}]}
					/>
				</View>
			</Button>
		);
	}

	return (
		<Button split={split} theme={theme} onPress={onPress} style={[{ width: '100%', flexDirection: 'column', justifyContent: 'flex-end'}]}>
			<MessageImage img={img} theme={theme} authorUsername={author.username} username={user.username} />
		</Button>
	);
}, (prevProps, nextProps) => equal(prevProps.file, nextProps.file) && prevProps.split === nextProps.split && prevProps.theme === nextProps.theme);

ImageContainer.propTypes = {
	file: PropTypes.object,
	imageUrl: PropTypes.string,
	showAttachment: PropTypes.func,
	theme: PropTypes.string,
	getCustomEmoji: PropTypes.func,
	split: PropTypes.bool,
	author: PropTypes.object,
};
ImageContainer.displayName = 'MessageImageContainer';

MessageImage.propTypes = {
	img: PropTypes.string,
	theme: PropTypes.string
};
ImageContainer.displayName = 'MessageImage';

Button.propTypes = {
	children: PropTypes.node,
	onPress: PropTypes.func,
	theme: PropTypes.string,
	split: PropTypes.bool
};
ImageContainer.displayName = 'MessageButton';

export default withSplit(ImageContainer);
