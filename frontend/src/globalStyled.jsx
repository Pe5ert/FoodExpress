import { createGlobalStyle } from "styled-components";

export const colors = {
  primary: "#FF6B35",
  secondary: "#2E294E",
  accent: "#1B998B",
  background: "#FFF8F5",
  text: "#2D3436",
};

export const GlobalStyled = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: ${colors.background};
    color: ${colors.text};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    color: ${colors.text};
  }

  .price {
    font-family: 'Roboto Mono', monospace;
    color: ${colors.primary};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: 'Inter', sans-serif;
  }
`;

export default GlobalStyled