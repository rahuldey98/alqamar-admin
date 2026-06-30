import { alpha, Box, CircularProgress, Divider, Drawer, IconButton, TextField, Typography } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCourse } from '../api/client.ts'
import { tokens } from '../theme.ts'

export interface CourseDrawerProps {
    open: boolean
    onClose: () => void
}

export function CourseDrawer({ open, onClose }: CourseDrawerProps) {
    const queryClient = useQueryClient()
    const [title, setTitle] = useState('')
    const [enTitle, setEnTitle] = useState('')
    const [duration, setDuration] = useState('')
    const [addAnother, setAddAnother] = useState(false)

    const resetForm = () => {
        setTitle(''); setEnTitle(''); setDuration('')
    }

    const createMutation = useMutation({
        mutationFn: () => createCourse({
            title: title.trim(),
            enTitle: enTitle.trim(),
            durationMonths: Number(duration),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
            if (addAnother) { resetForm(); createMutation.reset() }
            else { resetForm(); onClose() }
        },
    })

    const durationValid = duration !== '' && Number(duration) > 0
    const canSave = title.trim().length > 1 && enTitle.trim().length > 1 && durationValid

    const handleClose = () => {
        if (createMutation.isPending) return
        resetForm(); createMutation.reset(); onClose()
    }

    const handleSave = (another: boolean) => {
        setAddAnother(another)
        createMutation.mutate()
    }

    const previewTitle = title.trim() || 'New Course'

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
                        Add course
                    </Typography>
                    <Typography sx={{ fontSize: '0.78125rem', color: tokens.textDisabled }}>
                        Create a new course offering.
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small" sx={{ color: tokens.textSecondary, '&:hover': { bgcolor: tokens.bgElev2, color: tokens.text } }}>
                    <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: '22px', py: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Icon preview */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', pb: '16px', borderBottom: `1px solid ${tokens.divider}` }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: alpha(tokens.indigo, 0.12), color: tokens.indigoLight, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <MenuBookOutlinedIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: tokens.text }}>{previewTitle}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: tokens.textDisabled }}>Course</Typography>
                    </Box>
                </Box>

                {/* Fields */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <TextField
                        label="Title"
                        required
                        fullWidth
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Qur’an Hifz Course"
                        disabled={createMutation.isPending}
                    />
                    <TextField
                        label="English title"
                        required
                        fullWidth
                        value={enTitle}
                        onChange={(e) => setEnTitle(e.target.value)}
                        placeholder="e.g. Qur’an Memorization Course"
                        disabled={createMutation.isPending}
                    />
                    <TextField
                        label="Duration (months)"
                        required
                        fullWidth
                        value={duration}
                        onChange={(e) => setDuration(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="e.g. 36"
                        disabled={createMutation.isPending}
                        slotProps={{ input: { inputMode: 'numeric', sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.875rem' } } }}
                    />
                </Box>

                {createMutation.isError && (
                    <Box sx={{ px: '12px', py: '10px', borderRadius: '8px', bgcolor: alpha(tokens.red, 0.08), border: `1px solid ${alpha(tokens.red, 0.2)}` }}>
                        <Typography sx={{ fontSize: '0.78125rem', color: tokens.red }}>
                            Failed to create course. Please try again.
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
                    disabled={createMutation.isPending}
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
                    <Box
                        component="button"
                        onClick={() => handleSave(true)}
                        disabled={!canSave || createMutation.isPending}
                        sx={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            px: '14px', py: '8px', borderRadius: '8px', border: `1px solid ${tokens.divider}`,
                            bgcolor: 'transparent', color: tokens.textSecondary, fontSize: '0.8125rem', fontWeight: 500,
                            cursor: 'pointer', '&:hover:not(:disabled)': { bgcolor: tokens.bgElev2, color: tokens.text },
                            '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
                        }}
                    >
                        {createMutation.isPending && addAnother
                            ? <><CircularProgress size={12} sx={{ color: tokens.textSecondary }} /> Saving…</>
                            : <><AddOutlinedIcon sx={{ fontSize: 13 }} /> Save & add another</>
                        }
                    </Box>
                    <Box
                        component="button"
                        onClick={() => handleSave(false)}
                        disabled={!canSave || createMutation.isPending}
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
                        {createMutation.isPending && !addAnother
                            ? <><CircularProgress size={12} sx={{ color: '#fff' }} /> Saving…</>
                            : <><CheckOutlinedIcon sx={{ fontSize: 13 }} /> Create course</>
                        }
                    </Box>
                </Box>
            </Box>
        </Drawer>
    )
}
