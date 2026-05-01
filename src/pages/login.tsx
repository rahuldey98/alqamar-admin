import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { setAccessToken } from '../utils/auth.ts'
import { login } from '../api/client.ts'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAccessToken(response.accessToken)
      navigate('/home', { replace: true })
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    loginMutation.mutate({
      phone: phone.trim(),
      password,
    })
  }

  const errorMessage = axios.isAxiosError(loginMutation.error)
    ? loginMutation.error.response?.data?.message || 'Unable to sign in with these credentials.'
    : loginMutation.error
      ? 'Something went wrong. Please try again.'
      : null

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        background:
          'radial-gradient(circle at top left, rgba(12, 91, 86, 0.16), transparent 30%), linear-gradient(135deg, #f5f7f4 0%, #eef3f1 55%, #e6eeeb 100%)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 1080,
          overflow: 'hidden',
          borderRadius: 6,
          border: '1px solid rgba(20, 55, 51, 0.08)',
          boxShadow: '0 24px 80px rgba(20, 55, 51, 0.12)',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
          }}
        >
          <Box
            sx={{
              p: { xs: 4, sm: 5, md: 7 },
              backgroundColor: '#fcfdfc',
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    letterSpacing: '0.24em',
                    fontWeight: 700,
                  }}
                >
                  Al Qamar Admin
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    mt: 1.5,
                    fontWeight: 700,
                    color: '#102a27',
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    lineHeight: 1.1,
                  }}
                >
                  Admin portal for your institute
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mt: 1.5,
                    maxWidth: 460,
                    color: 'text.secondary',
                  }}
                >
                  Sign in to view students, teachers, attendance, and the daily
                  academic activity that keeps your institute running smoothly.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 4, sm: 5, md: 7 },
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(247,250,248,0.98) 100%)',
            }}
          >
            <Box sx={{ maxWidth: 420, mx: 'auto' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#102a27' }}>
                Sign in
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Use your admin credentials to continue.
              </Typography>

              <Stack component="form" spacing={2.5} sx={{ mt: 4 }} onSubmit={handleSubmit}>
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
                            onClick={() => setShowPassword((visible) => !visible)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <FormControlLabel
                    control={<Checkbox defaultChecked size="small" />}
                    label="Remember me"
                    sx={{ mr: 0 }}
                  />
                </Box>

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={loginMutation.isPending || !phone.trim() || !password}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxShadow: 'none',
                  }}
                >
                  {loginMutation.isPending ? 'Signing in...' : 'Login'}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
