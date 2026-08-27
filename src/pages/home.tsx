import { alpha, Avatar, Box, Chip, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDashboardOverview, getAttendanceRecords, ClassAttendanceStatus } from '../api/client.ts'
import type { AttendanceClassRecord } from '../api/client.ts'
import { AdminLayout } from '../components/AdminLayout.tsx'
import { TeacherDrawer } from '../components/TeacherDrawer.tsx'
import { StudentDrawer } from '../components/StudentDrawer.tsx'
import { tokens } from '../theme.ts'
import { stringToColor, initials } from '../utils/ui.ts'
import { useState } from 'react'
import type { ReactNode } from 'react'

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string
    value: string
    color: string
    icon: ReactNode
    to?: string
}

function StatCard({ label, value, color, icon, to }: StatCardProps) {
    const navigate = useNavigate()
    return (
        <Box
            onClick={to ? () => navigate(to) : undefined}
            sx={{
                bgcolor: tokens.bgElev1, border: `1px solid ${tokens.divider}`, borderRadius: '10px', p: '18px 20px',
                ...(to && { cursor: 'pointer', '&:hover': { borderColor: alpha(color, 0.4), bgcolor: alpha(color, 0.03) }, transition: 'border-color 0.15s, background 0.15s' }),
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '14px' }}>
                <Typography sx={{ fontSize: '0.75rem', color: tokens.textDisabled, letterSpacing: '0.01em' }}>
                    {label}
                </Typography>
                <Box sx={{ width: 32, height: 32, borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: alpha(color, 0.1), color }}>
                    {icon}
                </Box>
            </Box>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', color: tokens.text, lineHeight: 1 }}>
                {value}
            </Typography>
        </Box>
    )
}

// ── Stat config ───────────────────────────────────────────────────────────────

const STAT_CONFIG = [
    { key: 'totalStudents' as const, label: 'Total students', color: tokens.indigo, icon: <PeopleOutlinedIcon sx={{ fontSize: 15 }} />, to: '/students' },
    { key: 'totalTeachers' as const, label: 'Total teachers', color: tokens.cyan, icon: <WorkOutlinedIcon sx={{ fontSize: 15 }} />, to: '/teachers' },
    { key: 'todayTotalClasses' as const, label: 'Classes today', color: tokens.green, icon: <EventOutlinedIcon sx={{ fontSize: 15 }}/>, to: '/attendance' },
]

// ── Status badge ──────────────────────────────────────────────────────────────

function normalizeStatus(status: string | null | undefined): string {
    if (!status) return ''
    const upper = status.toUpperCase().replace(/\s+/g, '_')
    if (upper === 'NOT_PRESENT') return ClassAttendanceStatus.ABSENT
    return upper
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    [ClassAttendanceStatus.ALL_PRESENT]:     { label: 'Present',        color: tokens.green,        bg: alpha(tokens.green, 0.12) },
    [ClassAttendanceStatus.TEACHER_PRESENT]: { label: 'Teacher only',   color: tokens.amber,        bg: alpha(tokens.amber, 0.12) },
    [ClassAttendanceStatus.STUDENT_PRESENT]: { label: 'Student only',   color: tokens.cyan,         bg: alpha(tokens.cyan, 0.12) },
    [ClassAttendanceStatus.PENDING]:         { label: 'Pending',        color: tokens.textSecondary,bg: alpha(tokens.text, 0.08) },
    [ClassAttendanceStatus.ABSENT]:          { label: 'Absent',         color: tokens.red,          bg: alpha(tokens.red, 0.12) },
}

const FALLBACK_STATUS = { label: 'Unknown', color: tokens.textDisabled, bg: alpha(tokens.text, 0.06) }

function StatusBadge({ status }: { status: string }) {
    const key = normalizeStatus(status)
    const cfg = STATUS_CONFIG[key] ?? FALLBACK_STATUS
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{
                fontSize: '0.6875rem', fontWeight: 500, height: 20,
                bgcolor: cfg.bg, color: cfg.color,
                border: 'none',
                '& .MuiChip-label': { px: '8px' },
            }}
        />
    )
}

// ── Person cell ───────────────────────────────────────────────────────────────

function PersonCell({ name }: { name: string | null | undefined }) {
    if (!name) return <Typography sx={{ fontSize: '0.8125rem', color: tokens.textDisabled }}>—</Typography>
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.625rem', fontWeight: 600, bgcolor: stringToColor(name), flexShrink: 0 }}>
                {initials(name)}
            </Avatar>
            <Typography sx={{ fontSize: '0.8125rem', color: tokens.text }}>{name}</Typography>
        </Box>
    )
}

// ── Quick actions ─────────────────────────────────────────────────────────────

type QuickActionDef =
    | { icon: ReactNode; label: string; desc: string; color: string; to: string; onClick?: never }
    | { icon: ReactNode; label: string; desc: string; color: string; onClick: () => void; to?: never }

function QuickActions({ onCreateTeacher, onCreateStudent }: { onCreateTeacher: () => void; onCreateStudent: () => void }) {
    const navigate = useNavigate()

    const actions: QuickActionDef[] = [
        { icon: <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />, label: 'Create teacher', desc: 'Onboard a new faculty member', color: tokens.indigo,  onClick: onCreateTeacher },
        { icon: <SchoolOutlinedIcon    sx={{ fontSize: 15 }} />, label: 'Create student', desc: 'Enroll a new student',         color: tokens.green,   onClick: onCreateStudent },
        { icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />, label: 'View attendance', desc: 'Session attendance',      color: tokens.cyan,    to: '/attendance' },
        { icon: <BadgeOutlinedIcon     sx={{ fontSize: 15 }} />, label: 'All teachers',   desc: 'Browse faculty list',         color: tokens.violet,  to: '/teachers' },
        { icon: <PeopleOutlinedIcon    sx={{ fontSize: 15 }} />, label: 'All students',   desc: 'Browse enrolled students',    color: tokens.amber,   to: '/students' },
    ]

    return (
        <Box sx={{ bgcolor: tokens.bgElev1, border: `1px solid ${tokens.divider}`, borderRadius: '10px', overflow: 'hidden' }}>
            <Box sx={{ px: '20px', py: '14px', borderBottom: `1px solid ${tokens.divider}` }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: tokens.text, letterSpacing: '-0.005em' }}>Quick actions</Typography>
            </Box>
            <Box sx={{ p: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {actions.map(({ icon, label, desc, color, to, onClick }) => (
                    <Box
                        key={label}
                        component="button"
                        onClick={onClick ?? (() => navigate(to!))}
                        sx={{
                            textAlign: 'left', display: 'flex', gap: '12px', p: '12px',
                            bgcolor: tokens.bgElev2, border: `1px solid ${tokens.divider}`,
                            borderRadius: '8px', cursor: 'pointer', color: tokens.text,
                            transition: 'border-color 0.15s, background 0.15s',
                            '&:hover': { borderColor: color, bgcolor: alpha(color, 0.05) },
                        }}
                    >
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(color, 0.15), color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            {icon}
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: tokens.text }}>{label}</Typography>
                            <Typography sx={{ fontSize: '0.71875rem', color: tokens.textSecondary, mt: '2px' }}>{desc}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

// ── Sessions section ──────────────────────────────────────────────────────────

const TABLE_HEADERS = ['Time', 'Teacher', 'Student', 'Subject', 'Status']

function RowSkeleton() {
    return (
        <TableRow sx={{ '& .MuiTableCell-root': { borderColor: tokens.divider } }}>
            {[70, 140, 120, 150, 80].map((w, i) => (
                <TableCell key={i} sx={{ py: '11px' }}>
                    <Skeleton variant="rounded" width={w} height={14} sx={{ bgcolor: alpha(tokens.text, 0.05) }} />
                </TableCell>
            ))}
        </TableRow>
    )
}

function TodaySessionsSection() {
    const navigate = useNavigate()
    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date())

    const { data: attendanceData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['classes-attendance-v2', today],
        queryFn: () => getAttendanceRecords(today),
    })

    const rawSessions = attendanceData?.classes ?? []

    const sessions = [...rawSessions]
        .sort((a, b) => b.startTime.localeCompare(a.startTime))
        .slice(0, 10)

    return (
        <Box sx={{ bgcolor: tokens.bgElev1, border: `1px solid ${tokens.divider}`, borderRadius: '10px', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: '14px', borderBottom: `1px solid ${tokens.divider}` }}>
                <Box>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: tokens.text }}>
                        Today's sessions
                    </Typography>
                </Box>
                <Box
                    component="button"
                    onClick={() => navigate('/attendance')}
                    sx={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        px: '10px', py: '6px', borderRadius: '7px',
                        fontSize: '0.78125rem', fontWeight: 500,
                        color: tokens.textSecondary, bgcolor: tokens.bgElev2,
                        border: `1px solid ${tokens.divider}`, cursor: 'pointer',
                        '&:hover': { color: tokens.text, borderColor: tokens.border },
                        transition: 'color 0.12s, border-color 0.12s',
                    }}
                >
                    View all
                    <ArrowForwardOutlinedIcon sx={{ fontSize: 12 }} />
                </Box>
            </Box>

            {/* Table */}
            <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 680 }}>
                    <TableHead>
                        <TableRow sx={{ '& .MuiTableCell-root': { borderColor: tokens.divider } }}>
                            {TABLE_HEADERS.map(h => (
                                <TableCell key={h} sx={{ fontSize: '0.6875rem', fontWeight: 600, color: tokens.textDisabled, letterSpacing: '0.06em', textTransform: 'uppercase', py: '10px', bgcolor: alpha(tokens.text, 0.02) }}>
                                    {h}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }, (_, i) => <RowSkeleton key={i} />)
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, border: 0 }}>
                                    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                        <ErrorOutlineOutlinedIcon sx={{ color: tokens.red, fontSize: 24 }} />
                                        <Typography sx={{ color: tokens.red, fontSize: '0.8125rem', fontWeight: 500 }}>
                                            Failed to load today's sessions
                                        </Typography>
                                        <Typography sx={{ color: tokens.textSecondary, fontSize: '0.71875rem' }}>
                                            {error instanceof Error ? error.message : 'An error occurred'}
                                        </Typography>
                                        <Box
                                            component="button"
                                            onClick={() => refetch()}
                                            sx={{
                                                mt: 1, px: '10px', py: '4px', borderRadius: '6px',
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                fontSize: '0.75rem', fontWeight: 500,
                                                bgcolor: tokens.bgElev2, color: tokens.text,
                                                border: `1px solid ${tokens.divider}`, cursor: 'pointer',
                                                transition: 'border-color 0.15s, background 0.15s',
                                                '&:hover': { borderColor: tokens.border, bgcolor: alpha(tokens.text, 0.06) },
                                            }}
                                        >
                                            <RefreshOutlinedIcon sx={{ fontSize: 13 }} />
                                            Retry
                                        </Box>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : sessions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, border: 0 }}>
                                    <Typography sx={{ color: tokens.textDisabled, fontSize: '0.875rem' }}>
                                        No sessions scheduled for today.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sessions.map((s: AttendanceClassRecord) => (
                                <TableRow
                                    key={s.classId}
                                    sx={{
                                        '& .MuiTableCell-root': { borderColor: tokens.divider },
                                        '&:last-child .MuiTableCell-root': { border: 0 },
                                        '&:hover': { bgcolor: alpha(tokens.text, 0.025) },
                                    }}
                                >
                                    <TableCell sx={{ py: '11px' }}>
                                        <Typography sx={{ fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace', color: tokens.textSecondary, whiteSpace: 'nowrap' }}>
                                            {s.startTime}–{s.endTime}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: '11px' }}>
                                        <PersonCell name={s.teacher?.name} />
                                    </TableCell>
                                    <TableCell sx={{ py: '11px' }}>
                                        <PersonCell name={s.student?.name} />
                                    </TableCell>
                                    <TableCell sx={{ py: '11px' }}>
                                        <Typography sx={{ fontSize: '0.8125rem', color: s.courseTitle ? tokens.text : tokens.textDisabled }}>{s.courseTitle ?? '—'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: '11px' }}>
                                        <StatusBadge status={s.attendanceStatus} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    )
}

// ── HomePage ──────────────────────────────────────────────────────────────────

export const HomePage = () => {
    const [drawer, setDrawer] = useState<'teacher' | 'student' | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: getDashboardOverview,
    })

    return (
        <AdminLayout activeNav="dashboard" crumb="Overview" title="Dashboard">
            <TeacherDrawer open={drawer === 'teacher'} onClose={() => setDrawer(null)} />
            <StudentDrawer open={drawer === 'student'} onClose={() => setDrawer(null)} />

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, 1fr)' } }}>
                {STAT_CONFIG.map(({ key, label, color, icon, to }) =>
                    isLoading ? (
                        <Skeleton key={key} variant="rounded" height={112} sx={{ borderRadius: '10px', bgcolor: alpha(tokens.text, 0.06) }} />
                    ) : (
                        <StatCard key={key} label={label} value={String(data?.[key] ?? '—')} color={color} icon={icon} to={to} />
                    )
                )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, alignItems: 'start', '@media (max-width: 1100px)': { gridTemplateColumns: '1fr' } }}>
                <TodaySessionsSection />
                <QuickActions
                    onCreateTeacher={() => setDrawer('teacher')}
                    onCreateStudent={() => setDrawer('student')}
                />
            </Box>
        </AdminLayout>
    )
}
