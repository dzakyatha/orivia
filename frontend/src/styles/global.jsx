import { colors, fontFamily, fontFamilySerif } from './variables.jsx';

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

	/* Firefox */
	html, body {
		scrollbar-width: none;
		-ms-overflow-style: none; /* IE 10+ */
	}

	/* WebKit (Chrome, Safari, Opera) */
	html::-webkit-scrollbar, body::-webkit-scrollbar {
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
`;

export default globalStyles;
