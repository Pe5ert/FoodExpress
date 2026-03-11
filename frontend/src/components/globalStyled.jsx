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
    background-color: #f0f0f0;
  }
`