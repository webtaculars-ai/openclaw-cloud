import React from 'react';
import {
	AbsoluteFill,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
} from 'remotion';
import {OpenPawLogo} from './components/Logo';
import {MessagingIcons} from './components/Icons';

const AnimatedText: React.FC<{
	children: React.ReactNode;
	delay?: number;
	fontSize?: number;
	fontWeight?: number;
}> = ({children, delay = 0, fontSize = 60, fontWeight = 700}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const opacity = spring({
		frame: frame - delay,
		fps,
		config: {
			damping: 100,
		},
	});

	const translateY = interpolate(frame - delay, [0, 20], [30, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				opacity,
				transform: `translateY(${translateY}px)`,
				fontSize,
				fontWeight,
				textAlign: 'center',
				color: 'white',
				textShadow: '0 2px 10px rgba(0,0,0,0.3)',
			}}
		>
			{children}
		</div>
	);
};

const Scene: React.FC<{background: string; children: React.ReactNode}> = ({
	background,
	children,
}) => {
	return (
		<AbsoluteFill
			style={{
				background,
				justifyContent: 'center',
				alignItems: 'center',
				padding: 60,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

// Intro (0-10s = 300 frames, shortened)
export const Intro: React.FC = () => {
	const frame = useCurrentFrame();
	
	const logoScale = spring({
		frame,
		fps: 30,
		config: {
			damping: 100,
		},
	});

	return (
		<Scene background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
			<div style={{transform: `scale(${logoScale})`}}>
				<OpenPawLogo size={220} />
			</div>
			<AnimatedText delay={15} fontSize={72} fontWeight={700}>
				OpenPaw
			</AnimatedText>
			<AnimatedText delay={30} fontSize={38} fontWeight={400}>
				Your AI Workforce, Managed
			</AnimatedText>
		</Scene>
	);
};

// Who It's For (10-25s = 450 frames, with non-tech use cases)
export const WhoItsFor: React.FC = () => {
	return (
		<Scene background="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
			<AnimatedText delay={0} fontSize={48}>
				Who uses OpenPaw?
			</AnimatedText>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '30px',
					marginTop: '50px',
					maxWidth: '1200px',
				}}
			>
				{[
					{
						title: 'Small Businesses',
						benefit: 'Automate customer support 24/7',
						delay: 40,
					},
					{
						title: 'Freelancers',
						benefit: 'Handle client messages while you work',
						delay: 70,
					},
					{
						title: 'SaaS Teams',
						benefit: 'Add AI to your product in days',
						delay: 100,
					},
					{
						title: 'Content Creators',
						benefit: 'Manage community chats automatically',
						delay: 130,
					},
				].map((persona, i) => (
					<AnimatedText key={i} delay={persona.delay} fontSize={24}>
						<div
							style={{
								background: 'rgba(255,255,255,0.2)',
								backdropFilter: 'blur(10px)',
								padding: '25px',
								borderRadius: '15px',
								border: '2px solid rgba(255,255,255,0.3)',
							}}
						>
							<div style={{fontSize: 32, fontWeight: 700, marginBottom: 10}}>
								{persona.title}
							</div>
							<div style={{fontSize: 20, fontWeight: 400, lineHeight: 1.3}}>
								{persona.benefit}
							</div>
						</div>
					</AnimatedText>
				))}
			</div>
		</Scene>
	);
};

// What Is OpenPaw (35-55s = 600 frames)
export const WhatIsOpenPaw: React.FC = () => {
	return (
		<Scene background="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
			<AnimatedText delay={0} fontSize={55}>
				Run AI agents without DevOps
			</AnimatedText>
			<div style={{marginTop: '80px', marginBottom: '80px'}}>
				<MessagingIcons size={80} />
			</div>
			<AnimatedText delay={120} fontSize={48}>
				Connect to the apps you already use
			</AnimatedText>
			<AnimatedText delay={180} fontSize={38} fontWeight={400}>
				No servers. No setup. Just AI that works.
			</AnimatedText>
		</Scene>
	);
};

// How It Works (40-65s = 750 frames, fixed text cutoff)
export const HowItWorks: React.FC = () => {
	return (
		<Scene background="linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
			<AnimatedText delay={0} fontSize={48}>
				Get started in 3 steps
			</AnimatedText>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '35px',
					marginTop: '60px',
					maxWidth: '1100px',
				}}
			>
				{[
					{
						step: '1',
						title: 'Deploy your agent',
						subtext: 'Pick your AI model, configure in minutes',
						delay: 40,
					},
					{
						step: '2',
						title: 'Connect channels',
						subtext: 'WhatsApp, Telegram, Discord, Slack, or API',
						delay: 180,
					},
					{
						step: '3',
						title: 'Start chatting',
						subtext: 'Your AI is live and ready',
						delay: 320,
					},
				].map((step) => (
					<AnimatedText key={step.step} delay={step.delay} fontSize={28}>
						<div
							style={{
								background: 'rgba(255,255,255,0.2)',
								backdropFilter: 'blur(10px)',
								padding: '30px 35px',
								borderRadius: '18px',
								border: '2px solid rgba(255,255,255,0.3)',
								display: 'flex',
								alignItems: 'center',
								gap: '35px',
							}}
						>
							<div
								style={{
									width: '70px',
									height: '70px',
									borderRadius: '50%',
									background: 'rgba(255,255,255,0.4)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 44,
									fontWeight: 900,
									flexShrink: 0,
								}}
							>
								{step.step}
							</div>
							<div style={{textAlign: 'left', flex: 1}}>
								<div style={{fontSize: 36, fontWeight: 700, marginBottom: 8}}>
									{step.title}
								</div>
								<div style={{fontSize: 24, fontWeight: 400, opacity: 0.9}}>
									{step.subtext}
								</div>
							</div>
						</div>
					</AnimatedText>
				))}
			</div>
		</Scene>
	);
};

// Key Benefits (95-125s = 900 frames, reduced to 3 benefits)
export const KeyBenefits: React.FC = () => {
	return (
		<Scene background="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)">
			<AnimatedText delay={0} fontSize={50}>
				Why OpenPaw?
			</AnimatedText>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '50px',
					marginTop: '80px',
					maxWidth: '1200px',
				}}
			>
				{[
					{
						title: 'Zero DevOps',
						description: 'We manage servers, updates, and scaling',
						delay: 60,
					},
					{
						title: 'Pay only for what you use',
						description:
							'Credits consumed per conversation. Auto-hibernate when idle.',
						delay: 180,
					},
					{
						title: 'Full transparency',
						description: 'See exactly what each AI interaction costs',
						delay: 300,
					},
				].map((benefit, i) => (
					<AnimatedText key={i} delay={benefit.delay} fontSize={32}>
						<div
							style={{
								background: 'rgba(255,255,255,0.2)',
								backdropFilter: 'blur(10px)',
								padding: '40px',
								borderRadius: '20px',
								border: '2px solid rgba(255,255,255,0.3)',
								textAlign: 'left',
							}}
						>
							<div style={{fontSize: 46, fontWeight: 700, marginBottom: 15}}>
								{benefit.title}
							</div>
							<div style={{fontSize: 30, fontWeight: 400, lineHeight: 1.4}}>
								{benefit.description}
							</div>
						</div>
					</AnimatedText>
				))}
			</div>
		</Scene>
	);
};

// Dashboard Tour (125-160s = 1050 frames)
export const DashboardTour: React.FC = () => {
	return (
		<Scene background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
			<AnimatedText delay={0} fontSize={50}>
				Real-time cost visibility
			</AnimatedText>
			<div
				style={{
					marginTop: '80px',
					background: 'rgba(255,255,255,0.15)',
					backdropFilter: 'blur(10px)',
					padding: '60px',
					borderRadius: '30px',
					border: '3px solid rgba(255,255,255,0.3)',
					maxWidth: '1300px',
				}}
			>
				<AnimatedText delay={60} fontSize={36}>
					<div style={{textAlign: 'left', marginBottom: '40px'}}>
						<div style={{fontSize: 28, fontWeight: 400, marginBottom: 20}}>
							See your credit balance at a glance
						</div>
						<div
							style={{
								fontSize: 64,
								fontWeight: 900,
								color: '#4ade80',
								textShadow: '0 0 20px rgba(74,222,128,0.5)',
							}}
						>
							500,000 credits remaining
						</div>
					</div>
				</AnimatedText>
				<AnimatedText delay={300} fontSize={36}>
					<div style={{textAlign: 'left', marginTop: '40px'}}>
						<div style={{fontSize: 28, fontWeight: 400, marginBottom: 20}}>
							Track exactly what each agent costs
						</div>
						<div
							style={{
								fontSize: 52,
								fontWeight: 900,
								color: '#60a5fa',
								textShadow: '0 0 20px rgba(96,165,250,0.5)',
							}}
						>
							15 credits per message
						</div>
					</div>
				</AnimatedText>
			</div>
		</Scene>
	);
};

// Closing (160-165s = 150 frames, shortened)
export const Closing: React.FC = () => {
	return (
		<Scene background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
			<AnimatedText delay={0} fontSize={65} fontWeight={700}>
				Deploy your first agent free
			</AnimatedText>
			<AnimatedText delay={40} fontSize={70} fontWeight={900}>
				openpaw.co
			</AnimatedText>
			<AnimatedText delay={60} fontSize={36} fontWeight={400}>
				No credit card required
			</AnimatedText>
		</Scene>
	);
};
