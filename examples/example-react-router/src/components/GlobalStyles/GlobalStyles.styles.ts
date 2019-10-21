import { createGlobalStyle } from 'styled-components';

import { BREAKPOINT } from '../../constants/constants';

export const GlobalStyles = createGlobalStyle`
  :root {
    --color-accent: hsl(165, 100%, 50%);
    --color-dark: hsl(0, 0%, 10%);
    --color-error: hsl(343, 100%, 45%);
    --color-light: hsl(70, 0%, 95%);
    --color-light-translucent: hsla(70, 0%, 95%, 0.85);
    --font-size-xxs: 15px;
    --font-size-xs: 17px;
    --font-size-s: 18px;
    --font-size-m: 22px;
    --font-size-l: 30px;
    --font-size-xl: 46px;
    --font-size-xxl: 60px;
    --padding: 4%;
    --radius-l: 10px;
    --radius-m: 6px;
  }

  html
  body {
    background-color: var(--color-light);
    color: var(--color-dark);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: var(--font-size-s);
    padding-top: 80px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;

    @media (max-width: ${BREAKPOINT}px) {
      font-size: var(--font-size-xs);
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  [contenteditable] {
    user-select: text;
  }

  /* CSS Reset */

  * {
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -webkit-tap-highlight-color: hsla(0,0%,0%,0);
    -webkit-tap-highlight-color: transparent;
  }

  html,
  body {
    margin: 0;
    height: 100%;
    width: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    font-size: inherit;
    font-weight: inherit;
    margin: 0;
    margin-block-end: 0;
    margin-block-start: 0;
    margin-inline-end: 0;
    margin-inline-start: 0;
    -webkit-margin-after: 0;
    -webkit-margin-before: 0;
    -webkit-margin-end: 0;
    -webkit-margin-start: 0;
  }

  button {
    background-color: inherit;
    border: none;
    color: inherit;
    cursor: pointer;
    display: inline-block;
    font-family: inherit;
    font-size: inherit;
    margin: 0;
    padding: 0;
    text-align: center;
    text-decoration: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  button:focus {
    outline: 0;
  }

  input {
    border-color: initial;
    border-image: initial;
    border-style: none;
    color: inherit;
    display: block;
    font: inherit;
    padding: 10px;
    margin: 0;
    width: 100%;
  }

  input:focus {
    outline: 0;
  }

  input:not([type=checkbox]):not([type=radio]) {
    appearance: none;
  }

  ::-webkit-scrollbar {
    display: none;
  }
`;
