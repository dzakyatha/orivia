import { colors, fontFamily, fontFamilySerif, spacing } from './variables.jsx';

export const globalStyles = `
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	html, body, #root {
		width: 100%;
		min-height: 100vh;
		margin: 0;
		padding: 0;
	}

	body {
		font-family: 'Poppins', 'Lora', sans-serif;
		background-color: ${colors.bg};
		color: ${colors.text};
		line-height: 1.5;
		font-size: 1rem;
		overflow-x: hidden;
	}

	#root {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	h1, h2, h3, h4, h5, h6 {
		font-family: 'Poppins', 'Lora', sans-serif;
		font-weight: 700;
		line-height: 1.2;
		color: ${colors.accent1};
	}

	h1 { font-size: 1.875rem; }
	h2 { font-size: 1.5rem; }
	h3 { font-size: 1.25rem; }

	p {
		color: ${colors.textLight};
	}

	// span {
	// 	font-family: ${fontFamily.base};
	// }

	span, p, label {
		font-family: ${fontFamilySerif.serif};
	}

	table, th, td, tr {
		font-family: ${fontFamily.base};
	}

	a {
		color: ${colors.primary};
		text-decoration: none;
		transition: color 0.3s ease-in-out;
	}

	a:hover {
		color: ${colors.accent5};
	}

	button {
		cursor: pointer;
		font-family: 'Poppins', 'Lora', sans-serif;
		border: none;
		transition: all 0.3s ease-in-out;
	}

	button:focus {
		outline: none;
	}

	input, textarea, select {
		font-family: 'Poppins', 'Lora', sans-serif;
		font-size: 1rem;
		color: #0f172a;
	}

	input::placeholder, textarea::placeholder {
		color: #6b7280;
	}

	input:focus, textarea:focus, select:focus {
		outline: none;
	}

	/* Hide page-level scrollbars but keep custom-scrollbar/.cards-scroll visible */
	/* Firefox */
	html, body, #root {
		scrollbar-width: none; /* hide page scrollbar in Firefox */
		-ms-overflow-style: none; /* IE 10+ */
	}

	/* WebKit (Chrome, Safari, Opera) - hide page scrollbar */
	html::-webkit-scrollbar, body::-webkit-scrollbar, #root::-webkit-scrollbar {
		width: 0;
		height: 0;
	}

	::selection {
		background-color: ${colors.accent5};
		color: white;
	}

	.container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
	}

	@media (max-width: 768px) {
		.container {
			padding: 0 16px;
		}
	}

	/* Custom scrollbars for designated scrollable areas */
	.custom-scrollbar {
		scrollbar-width: thin; /* Firefox */
		scrollbar-color: ${colors.accent4} transparent;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 8px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: ${colors.accent3}12; /* subtle track tint */
		border-radius: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: ${colors.accent4};
		border-radius: 10px;
		transition: background 0.2s ease;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: ${colors.accent5};
	}

	/* Cards scroll (used for trip card grids and similar panels) */
	.cards-scroll {
		max-height: calc(100vh - 240px);
		overflow-y: auto;
		padding-right: ${spacing.sm};
		padding-top: ${spacing.md};
		box-sizing: border-box;
		scrollbar-width: thin; /* Firefox */
		scrollbar-color: ${colors.accent4} transparent;
	}

	.cards-scroll::-webkit-scrollbar {
		width: 8px;
	}

	.cards-scroll::-webkit-scrollbar-track {
		background: rgba(127, 110, 40, 0.06);
		border-radius: 10px;
	}

	.cards-scroll::-webkit-scrollbar-thumb {
		background: ${colors.accent4};
		border-radius: 10px;
		transition: background 0.2s ease;
	}

	.cards-scroll::-webkit-scrollbar-thumb:hover {
		background: rgba(127, 110, 40, 0.9);
	}

	/* Left summary panel fixed height with its own scrollbar */
	.left-panel-fixed {
		height: 488px;
		overflow-y: auto;
		padding-right: ${spacing.sm};
		box-sizing: border-box;
		scrollbar-width: thin;
		scrollbar-color: ${colors.accent4} transparent;
	}

	.left-panel-fixed::-webkit-scrollbar {
		width: 8px;
	}

	.left-panel-fixed::-webkit-scrollbar-track {
		background: ${colors.accent3}12;
		border-radius: 10px;
	}

	.left-panel-fixed::-webkit-scrollbar-thumb {
		background: ${colors.accent4};
		border-radius: 10px;
		transition: background 0.2s ease;
	}

	.left-panel-fixed::-webkit-scrollbar-thumb:hover {
		background: ${colors.accent5};
	}
`;

export default globalStyles;
