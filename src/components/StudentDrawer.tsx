import { alpha, Autocomplete, Avatar, Box, CircularProgress, Divider, Drawer, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createStudent, getCourses, getTeachers, updateStudent } from '../api/client.ts'
import { tokens } from '../theme.ts'
import { stringToColor, initials } from '../utils/ui.ts'
import type { Student, Teacher } from '@rahuldey98/alqamar-models'

export interface StudentDrawerProps {
    open: boolean
    onClose: () => void
    student?: Student
}

const isValidPhone = (p: string) => /^[0-9]{10}$/.test(p.trim())
const todayISO = () => new Date().toISOString().split('T')[0]

export function StudentDrawer({ open, onClose, student }: StudentDrawerProps) {
    const isEdit = !!student
    const queryClient = useQueryClient()
    const [name, setName] = useState(student?.name ?? '')
    const [phone, setPhone] = useState(student?.phone ?? '')
    const [email, setEmail] = useState(student?.email ?? '')
    const [feesDate, setFeesDate] = useState(student?.feesDate ?? todayISO())
    const [courseId, setCourseId] = useState<number | ''>(student?.course?.id ?? '')
    const [teacher, setTeacher] = useState<Teacher | null>(null)
    const [phoneTouched, setPhoneTouched] = useState(false)
    const [addAnother, setAddAnother] = useState(false)

    const { data: courses = [], isLoading: coursesLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: getCourses,
    })

    const { data: teachers = [], isLoading: teachersLoading } = useQuery({
        queryKey: ['teachers'],
        queryFn: getTeachers,
    })

    useEffect(() => {
        if (isEdit && student?.teacherId && teachers.length > 0) {
            setTeacher(teachers.find(t => t.id === student.teacherId) ?? null)
        }
    }, [teachers, isEdit, student?.teacherId])

    const resetForm = () => {
        setName(''); setPhone(''); setEmail(''); setFeesDate(todayISO()); setCourseId(''); setTeacher(null); setPhoneTouched(false)
    }

    const toDateTime = (d: string) => d ? new Date(d).toISOString() : undefined

    const buildBody = () => ({
        name: name.trim(),
        phone: phone.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(feesDate ? { feesDate: toDateTime(feesDate) } : {}),
        ...(courseId !== '' ? { courseId: courseId as number } : {}),
        ...(teacher ? { teacherId: teacher.id } : {}),
    })

    const createMutation = useMutation({
        mutationFn: () => createStudent(buildBody()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
            if (addAnother) { resetForm(); createMutation.reset() }
            else { resetForm(); onClose() }
        },
    })

    const editMutation = useMutation({
        mutationFn: () => updateStudent(student!.id, {
            name: name.trim(),
            phone: phone.trim(),
            ...(email.trim() ? { email: email.trim() } : {}),
            ...(feesDate ? { feesDate: toDateTime(feesDate) } : {}),
            ...(courseId !== '' ? { courseId: courseId as number } : {}),
            ...(teacher ? { teacherId: teacher.id } : {}),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
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

    const previewName = name.trim() || (isEdit ? student.name : 'New Student')

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
                        {isEdit ? 'Edit student' : 'Add student'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78125rem', color: tokens.textDisabled }}>
                        {isEdit ? `Editing profile for ${student.name}` : 'Quick add — full profile editable later.'}
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
                        <Typography sx={{ fontSize: '0.75rem', color: tokens.textDisabled }}>Student</Typography>
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
                        placeholder="e.g. Aarav Sharma"
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <TextField
                            label="Fees date"
                            fullWidth
                            type="date"
                            value={feesDate}
                            onChange={(e) => setFeesDate(e.target.value)}
                            disabled={mutation.isPending}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <FormControl fullWidth disabled={mutation.isPending || coursesLoading}>
                            <InputLabel shrink>Course</InputLabel>
                            <Select
                                notched
                                label="Course"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value as number | '')}
                                displayEmpty
                            >
                                <MenuItem value=""><em style={{ color: tokens.textDisabled }}>None</em></MenuItem>
                                {courses.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Autocomplete
                        options={teachers}
                        getOptionLabel={(t) => t.name}
                        value={teacher}
                        onChange={(_, val) => setTeacher(val)}
                        loading={teachersLoading}
                        disabled={mutation.isPending}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Assigned teacher"
                                placeholder="Search teacher…"
                            />
                        )}
                        renderOption={(props, t) => (
                            <Box component="li" {...props} key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', fontWeight: 600, bgcolor: stringToColor(t.name), flexShrink: 0 }}>
                                    {initials(t.name)}
                                </Avatar>
                                {t.name}
                            </Box>
                        )}
                    />
                </Box>

                {mutation.isError && (
                    <Box sx={{ px: '12px', py: '10px', borderRadius: '8px', bgcolor: alpha(tokens.red, 0.08), border: `1px solid ${alpha(tokens.red, 0.2)}` }}>
                        <Typography sx={{ fontSize: '0.78125rem', color: tokens.red }}>
                            {isEdit ? 'Failed to update student.' : 'Failed to create student.'} Please try again.
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
                            : <><CheckOutlinedIcon sx={{ fontSize: 13 }} /> {isEdit ? 'Save changes' : 'Create student'}</>
                        }
                    </Box>
                </Box>
            </Box>
        </Drawer>
    )
}
