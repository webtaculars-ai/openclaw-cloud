import {Composition, Sequence} from 'remotion';
import {
	Intro,
	WhoItsFor,
	WhatIsOpenPaw,
	HowItWorks,
	KeyBenefits,
	DashboardTour,
	Closing,
} from './Video';
import {BackgroundMusic} from './Audio';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="OpenPawDemo"
				component={() => {
					return (
						<>
							{/* Background music throughout */}
							<BackgroundMusic />
							
							{/* Scene timing: shortened for pacing */}
							<Sequence from={0} durationInFrames={300}>
								<Intro />
							</Sequence>
							<Sequence from={300} durationInFrames={450}>
								<WhoItsFor />
							</Sequence>
							<Sequence from={750} durationInFrames={450}>
								<WhatIsOpenPaw />
							</Sequence>
							<Sequence from={1200} durationInFrames={750}>
								<HowItWorks />
							</Sequence>
							<Sequence from={1950} durationInFrames={600}>
								<KeyBenefits />
							</Sequence>
							<Sequence from={2550} durationInFrames={600}>
								<DashboardTour />
							</Sequence>
							<Sequence from={3150} durationInFrames={150}>
								<Closing />
							</Sequence>
						</>
					);
				}}
				durationInFrames={3300} // 110 seconds @ 30fps = 1:50
				fps={30}
				width={1280}
				height={720}
			/>

			<Composition
				id="Intro"
				component={Intro}
				durationInFrames={300}
				fps={30}
				width={1280}
				height={720}
			/>

			<Composition
				id="WhoItsFor"
				component={WhoItsFor}
				durationInFrames={450}
				fps={30}
				width={1280}
				height={720}
			/>

			<Composition
				id="WhatIsOpenPaw"
				component={WhatIsOpenPaw}
				durationInFrames={450}
				fps={30}
				width={1280}
				height={720}
			/>

			<Composition
				id="HowItWorks"
				component={HowItWorks}
				durationInFrames={750}
				fps={30}
				width={1280}
				height={720}
			/>

			<Composition
				id="KeyBenefits"
				component={KeyBenefits}
				durationInFrames={600}
				fps={30}
				width={1280}
				height={720}
			/>

			<Composition
				id="DashboardTour"
				component={DashboardTour}
				durationInFrames={600}
				fps={30}
				width={1280}
				height={720}
			/>

			<Composition
				id="Closing"
				component={Closing}
				durationInFrames={150}
				fps={30}
				width={1280}
				height={720}
			/>
		</>
	);
};
