import React from 'react';
import Main from './Main.js';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Main />
    </ThemeProvider>
  );
}

export default App;
