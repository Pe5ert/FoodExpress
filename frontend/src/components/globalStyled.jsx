import { createGlobalStyle } from "styled-components"

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #FFF8F5;
    color: #2D3436;
    font-family: 'Inter', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
  }

  .price, .preco {
    font-family: 'Roboto Mono', monospace;
  }
`

