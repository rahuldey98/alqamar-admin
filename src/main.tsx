import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {CssBaseline, ThemeProvider, createTheme} from '@mui/material'
import App from './App.tsx'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const theme = createTheme({
    palette: {
        primary: {
            main: '#0c5b56',
        },
        background: {
            default: '#eef3f1',
        },
    },
    shape: {
        borderRadius: 18,
    },
    typography: {
        fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    },
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <CssBaseline/>
                <App/>
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>,
)
