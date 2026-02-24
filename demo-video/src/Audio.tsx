import {Audio, staticFile} from 'remotion';

export const BackgroundMusic: React.FC = () => {
	return (
		<Audio
			src={staticFile('background-music.mp3')}
			volume={0.15}
			startFrom={0}
			endAt={4950} // 165 seconds at 30fps
		/>
	);
};
