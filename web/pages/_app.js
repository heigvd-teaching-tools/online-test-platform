import Head from 'next/head';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from "next-auth/react"
import Main from '../components/layout/Main';
import '../styles/normalize.css'

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function MyApp({ Component, pageProps: { session, ...pageProps} }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Meta />
      <SessionProvider session={session}>
        <Main>
          <Component {...pageProps} />
        </Main>
      </SessionProvider>
    </ThemeProvider>
  );
}

const Meta = () => <Head>
<title>HEIG-VD - TWeb - Online Test</title>
<meta name="description" content="HEIG-VD - Online test platform" />
<link rel="icon" href="/favicon.ico" />
</Head>

export default MyApp
