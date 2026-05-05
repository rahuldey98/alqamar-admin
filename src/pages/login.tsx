import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    IconButton,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {useState} from 'react'
import {useMutation} from '@tanstack/react-query'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import {setAccessToken, setUser} from '../utils/auth.ts'
import {login} from '../api/client.ts'
import {tokens} from '../theme.ts'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const LoginPage = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (response) => {
            setAccessToken(response.data.accessToken)
            setUser(response.data.user)
            navigate('/home', {replace: true})
        },
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        loginMutation.mutate({phone: phone.trim(), password})
    }

    const errorMessage = axios.isAxiosError(loginMutation.error)
        ? loginMutation.error.response?.data?.message || 'Unable to sign in with these credentials.'
        : loginMutation.error
            ? 'Something went wrong. Please try again.'
            : null

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh'
            }}
        >
            {/* Left panel — branding */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 5,
                    borderRight: `1px solid ${tokens.divider}`,
                    background: `
                        radial-gradient(60% 80% at 30% 20%, rgba(99,102,241,0.18), transparent 70%),
                        radial-gradient(50% 60% at 80% 80%, rgba(168,85,247,0.14), transparent 60%)
                    `,
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '32px 32px',
                        pointerEvents: 'none',
                    },
                }}
            >
                {/* Brand mark */}
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1.25}}>
                    <Box component="img" src="/favicon.png" alt="Alqamar" sx={{ width: 36, height: 36, borderRadius: 2, flexShrink: 0, objectFit: 'cover' }} />
                    <Box>
                        <Typography sx={{
                            fontSize: '0.84375rem',
                            fontWeight: 600,
                            letterSpacing: '-0.005em',
                            color: tokens.text
                        }}>
                            Alqamar Academy
                        </Typography>
                        <Typography sx={{
                            fontSize: '0.6875rem',
                            color: tokens.textDisabled,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase'
                        }}>
                            Admin Portal
                        </Typography>
                    </Box>
                </Box>

                {/* Quote */}
                <Box sx={{display: 'flex', mt: 'auto', maxWidth: 460, flexDirection: 'column'}}>
                    <Typography
                        sx={{
                            fontSize: '1.625rem',
                            fontWeight: 500,
                            color: tokens.text,
                        }}
                    >
                        Run your institute with{' '}
                        <Box component="em" sx={{color: tokens.indigoLight, fontStyle: 'normal'}}>
                            clarity
                        </Box>{' '}
                        Track every class, every teacher, every student — in one quiet place.
                    </Typography>
                </Box>
            </Box>

            {/* Right panel — form */}
            <Box
                sx={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    padding: {xs: 3, sm: 5},
                    background: tokens.bg,
                }}
            >
                <Box sx={{width: '100%', maxWidth: 380}}>
                    <Typography
                        variant="h3"
                        sx={{fontSize: '1.625rem', fontWeight: 600, letterSpacing: '-0.025em', color: tokens.text}}
                    >
                        Sign in
                    </Typography>
                    <Typography sx={{mt: 0.5, fontSize: '0.875rem', color: tokens.textDisabled}}>
                        Use your admin credentials to continue.
                    </Typography>

                    <Stack component="form" spacing={2.5} sx={{mt: 4}} onSubmit={handleSubmit}>
                        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

                        <TextField
                            fullWidth
                            id="phone-number"
                            label="Phone number"
                            placeholder="9876543210"
                            variant="outlined"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            disabled={loginMutation.isPending}
                        />
                        <TextField
                            fullWidth
                            id="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            disabled={loginMutation.isPending}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                edge="end"
                                                onClick={() => setShowPassword((v) => !v)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                sx={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    '&:hover': {background: 'transparent'}
                                                }}
                                            >
                                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <FormControlLabel
                                control={<Checkbox
                                    defaultChecked
                                    size="small"
                                />}
                                label={
                                    <Typography sx={{fontSize: '0.8125rem', color: tokens.textDisabled}}>Remember
                                        me</Typography>
                                }
                                sx={{mr: 0}}
                            />
                        </Box>

                        <Button
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={loginMutation.isPending}
                            sx={{mt: 0.5, textTransform: 'none'}}
                            endIcon={!loginMutation.isPending ? <ArrowForwardIcon/> : undefined}
                        >
                            {loginMutation.isPending ? 'Signing in…' : 'Sign in to dashboard'}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Box>
    )
}
