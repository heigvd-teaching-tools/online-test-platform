import Head from 'next/head';
import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from "next-auth/react"
import Main from '../components/layout/Main';
import { SnackbarProvider } from '../context/SnackbarContext';
import '../styles/normalize.css'



export const themeOptions = {
  palette: {
    type: 'light',
    primary: {
      main: '#da291c',
      contrastText: '#ffffff',
      dark: '#da291c',
    },
    secondary: {
      main: '#4c36f3',
    },
    divider: 'rgba(4,178,241,0.12)',
    background: {
      default: '#e8e8e8',
    },
  },
  typography: {
    fontSize: 12,
    fontWeightLight: 400,
    fontWeightRegular: 400,
    h1: {
      fontSize: '4rem',
    },
  },
};


const theme = createTheme(themeOptions);

function MyApp({ Component, pageProps: { session, ...pageProps} }) {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider >
        <CssBaseline />
        <Meta />
        <SessionProvider session={session}>
          <Main>
            <Component {...pageProps} />
          </Main>
        </SessionProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

const Meta = () => <Head>
<title>HEIG-VD - TWeb - Online Test</title>
<meta name="description" content="HEIG-VD - Online test platform" />
<link rel="icon" href="/favicon.ico" />
</Head>

export default MyApp
