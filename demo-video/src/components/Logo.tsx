import React from 'react';
import {AbsoluteFill} from 'remotion';

export const OpenPawLogo: React.FC<{size?: number}> = ({size = 200}) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* Paw print design */}
			{/* Main pad (center) */}
			<ellipse
				cx="100"
				cy="120"
				rx="35"
				ry="40"
				fill="#3B82F6"
			/>
			
			{/* Toe pads */}
			{/* Top left toe */}
			<ellipse
				cx="60"
				cy="80"
				rx="18"
				ry="25"
				fill="#3B82F6"
				transform="rotate(-15 60 80)"
			/>
			
			{/* Top center-left toe */}
			<ellipse
				cx="80"
				cy="65"
				rx="18"
				ry="25"
				fill="#3B82F6"
				transform="rotate(-5 80 65)"
			/>
			
			{/* Top center-right toe */}
			<ellipse
				cx="120"
				cy="65"
				rx="18"
				ry="25"
				fill="#3B82F6"
				transform="rotate(5 120 65)"
			/>
			
			{/* Top right toe */}
			<ellipse
				cx="140"
				cy="80"
				rx="18"
				ry="25"
				fill="#3B82F6"
				transform="rotate(15 140 80)"
			/>
		</svg>
	);
};
