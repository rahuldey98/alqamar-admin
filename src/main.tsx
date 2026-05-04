import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {CssBaseline, ThemeProvider} from '@mui/material'
import App from './App.tsx'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { theme } from './theme.ts'

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
