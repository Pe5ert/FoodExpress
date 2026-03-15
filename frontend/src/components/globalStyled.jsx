import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary: #FF6B35;
    --primary-dark: #e55a2b;
    --primary-light: #fff1eb;
    --secondary: #2E294E;
    --secondary-light: #3d3766;
    --accent: #1B998B;
    --accent-light: #e8f7f5;
    --background: #F5F5F5;
    --surface: #FFFFFF;
    --surface-2: #FAFAFA;
    --text-primary: #3E3E3E;
    --text-secondary: #717171;
    --text-muted: #A0A0A0;
    --border: #EBEBEB;
    --border-strong: #D4D4D4;
    --shadow-xs: 0 1px 2px rgba(0,0,0,0.06);
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
    --shadow-lg: 0 8px 30px rgba(0,0,0,0.12);
    --shadow-xl: 0 16px 48px rgba(0,0,0,0.16);
    --radius-xs: 6px;
    --radius-sm: 10px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --radius-full: 9999px;
  }

  html {
    height: 100%;
    width: 100%;
  }

  body {
    height: 100%;
    width: 100%;
    min-height: 100vh;
    min-height: 100dvh;
    background-color: var(--background);
    color: var(--text-primary);
    font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100%;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    line-height: 1.2;
    color: var(--text-primary);
  }

  button {
    font-family: 'Nunito', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  input, select, textarea {
    font-family: 'Nunito', sans-serif;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  img {
    max-width: 100%;
    display: block;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track { background: var(--background); }
  ::-webkit-scrollbar-thumb {
    background: var(--border-strong);
    border-radius: var(--radius-full);
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

  *:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .price, .preco {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
  }
`;
