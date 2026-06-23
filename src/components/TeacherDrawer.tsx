import { alpha, Avatar, Box, CircularProgress, Divider, Drawer, IconButton, TextField, Typography } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTeacher, updateTeacher } from '../api/client.ts'
import { tokens } from '../theme.ts'
import { stringToColor, initials } from '../utils/ui.ts'
import type { Teacher } from '@rahuldey98/alqamar-models'

export interface TeacherDrawerProps {
    open: boolean
    onClose: () => void
    teacher?: Teacher
}

const isValidPhone = (p: string) => /^[0-9]{10}$/.test(p.trim())

export function TeacherDrawer({ open, onClose, teacher }: TeacherDrawerProps) {
    const isEdit = !!teacher
    const queryClient = useQueryClient()
    const [name, setName] = useState(teacher?.name ?? '')
    const [phone, setPhone] = useState(teacher?.phone ?? '')
    const [email, setEmail] = useState(teacher?.email ?? '')
    const [phoneTouched, setPhoneTouched] = useState(false)
    const [addAnother, setAddAnother] = useState(false)

    const resetForm = () => { setName(''); setPhone(''); setEmail(''); setPhoneTouched(false) }

    const createMutation = useMutation({
        mutationFn: () => createTeacher({ name: name.trim(), phone: phone.trim(), ...(email.trim() ? { email: email.trim() } : {}) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
            if (addAnother) { resetForm(); createMutation.reset() }
            else { resetForm(); onClose() }
        },
    })

    const editMutation = useMutation({
        mutationFn: () => updateTeacher(teacher!.id, { name: name.trim(), phone: phone.trim(), ...(email.trim() ? { email: email.trim() } : { email: undefined }) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
            onClose()
        },
    })

    const mutation = isEdit ? editMutation : createMutation
    const phoneError = phoneTouched && !isValidPhone(phone)
    const canSave = name.trim().length > 1 && isValidPhone(phone)

    const handleClose = () => {
        if (mutation.isPending) return
        resetForm(); mutation.reset(); onClose()
    }

    const handleSave = (another: boolean) => {
        setAddAnother(another)
        mutation.mutate()
    }

    const previewName = name.trim() || (isEdit ? teacher.name : 'New Teacher')

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            slotProps={{
                paper: {
                    sx: {
                        width: 480, maxWidth: '92vw',
                        bgcolor: tokens.bgElev1,
                        borderLeft: `1px solid ${tokens.divider}`,
                        boxShadow: '-24px 0 48px -12px rgba(0,0,0,0.5)',
                        display: 'flex', flexDirection: 'column',
                    },
                },
            }}
        >
            {/* Header */}
            <Box sx={{ px: '22px', pt: '18px', pb: '16px', borderBottom: `1px solid ${tokens.divider}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                <Box>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em', color: tokens.text, mb: '3px' }}>
                        {isEdit ? 'Edit teacher' : 'Add teacher'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78125rem', color: tokens.textDisabled }}>
                        {isEdit ? `Editing profile for ${teacher.name}` : 'Quick add — full profile editable later.'}
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small" sx={{ color: tokens.textSecondary, '&:hover': { bgcolor: tokens.bgElev2, color: tokens.text } }}>
                    <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: '22px', py: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Avatar preview */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', pb: '16px', borderBottom: `1px solid ${tokens.divider}` }}>
                    <Avatar sx={{ width: 48, height: 48, fontSize: '1rem', fontWeight: 600, bgcolor: stringToColor(previewName) }}>
                        {initials(previewName)}
                    </Avatar>
                    <Box>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: tokens.text }}>{previewName}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: tokens.textDisabled }}>Faculty · 1:1 coach</Typography>
                    </Box>
                </Box>

                {/* Fields */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <TextField
                        label="Full name"
                        required
                        fullWidth
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aisha Rahman"
                        disabled={mutation.isPending}
                    />
                    <TextField
                        label="Phone"
                        required
                        fullWidth
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onBlur={() => setPhoneTouched(true)}
                        placeholder="9876543210"
                        disabled={mutation.isPending}
                        error={phoneError}
                        helperText={phoneError ? 'Must be 10 digits' : undefined}
                        slotProps={{ input: { inputMode: 'numeric', sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.875rem' } } }}
                    />
                    <TextField
                        label="Email"
                        fullWidth
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        helperText="Optional"
                        disabled={mutation.isPending}
                    />
                </Box>

                {mutation.isError && (
                    <Box sx={{ px: '12px', py: '10px', borderRadius: '8px', bgcolor: alpha(tokens.red, 0.08), border: `1px solid ${alpha(tokens.red, 0.2)}` }}>
                        <Typography sx={{ fontSize: '0.78125rem', color: tokens.red }}>
                            {isEdit ? 'Failed to update teacher.' : 'Failed to create teacher.'} Please try again.
                        </Typography>
                    </Box>
                )}
            </Box>

            <Divider sx={{ borderColor: tokens.divider }} />

            {/* Footer */}
            <Box sx={{ px: '22px', py: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Box
                    component="button"
                    onClick={handleClose}
                    disabled={mutation.isPending}
                    sx={{
                        px: '14px', py: '8px', borderRadius: '8px', border: `1px solid ${tokens.divider}`,
                        bgcolor: 'transparent', color: tokens.textSecondary, fontSize: '0.8125rem', fontWeight: 500,
                        cursor: 'pointer', '&:hover': { bgcolor: tokens.bgElev2, color: tokens.text },
                        '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
                    }}
                >
                    Cancel
                </Box>
                <Box sx={{ display: 'flex', gap: '8px' }}>
                    {!isEdit && (
                        <Box
                            component="button"
                            onClick={() => handleSave(true)}
                            disabled={!canSave || mutation.isPending}
                            sx={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                px: '14px', py: '8px', borderRadius: '8px', border: `1px solid ${tokens.divider}`,
                                bgcolor: 'transparent', color: tokens.textSecondary, fontSize: '0.8125rem', fontWeight: 500,
                                cursor: 'pointer', '&:hover:not(:disabled)': { bgcolor: tokens.bgElev2, color: tokens.text },
                                '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
                            }}
                        >
                            {mutation.isPending && addAnother
                                ? <><CircularProgress size={12} sx={{ color: tokens.textSecondary }} /> Saving…</>
                                : <><AddOutlinedIcon sx={{ fontSize: 13 }} /> Save & add another</>
                            }
                        </Box>
                    )}
                    <Box
                        component="button"
                        onClick={() => handleSave(false)}
                        disabled={!canSave || mutation.isPending}
                        sx={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            px: '14px', py: '8px', borderRadius: '8px', border: 'none',
                            bgcolor: tokens.indigo, color: '#fff', fontSize: '0.8125rem', fontWeight: 500,
                            cursor: 'pointer',
                            boxShadow: `0 1px 0 rgba(255,255,255,0.12) inset, 0 8px 18px -8px ${tokens.indigo}`,
                            '&:hover:not(:disabled)': { bgcolor: '#5558e3' },
                            '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
                        }}
                    >
                        {mutation.isPending && !addAnother
                            ? <><CircularProgress size={12} sx={{ color: '#fff' }} /> Saving…</>
                            : <><CheckOutlinedIcon sx={{ fontSize: 13 }} /> {isEdit ? 'Save changes' : 'Create teacher'}</>
                        }
                    </Box>
                </Box>
            </Box>
        </Drawer>
    )
}
