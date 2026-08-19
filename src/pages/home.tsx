import { alpha, Avatar, Box, Chip, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Typography, Tooltip } from '@mui/material'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDashboardOverview, getClassesAttendance } from '../api/client.ts'
import type { ClassAttendance } from '../api/client.ts'
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    'all present':     { label: 'Present',        color: tokens.green,        bg: alpha(tokens.green, 0.12) },
    'teacher present': { label: 'Present',        color: tokens.green,        bg: alpha(tokens.green, 0.12) },
    'student present': { label: 'Present',        color: tokens.green,        bg: alpha(tokens.green, 0.12) },
    'not present':     { label: 'Not present',    color: tokens.red,          bg: alpha(tokens.red, 0.12) },
}

const FALLBACK_STATUS = { label: 'Unknown', color: tokens.textDisabled, bg: alpha(tokens.text, 0.06) }

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? FALLBACK_STATUS
    const hasDetailedStatus = status === 'teacher present' || status === 'student present'
    
    let tooltipText = ''
    if (status === 'teacher present') {
        tooltipText = 'System recorded: Teacher only joined (treated as Present)'
    } else if (status === 'student present') {
        tooltipText = 'System recorded: Student only joined (treated as Present)'
    }

    const chip = (
        <Chip
            label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {cfg.label}
                    {hasDetailedStatus && <InfoOutlinedIcon sx={{ fontSize: 11, opacity: 0.8 }} />}
                </Box>
            }
            size="small"
            sx={{
                fontSize: '0.6875rem', fontWeight: 500, height: 20,
                bgcolor: cfg.bg, color: cfg.color,
                border: 'none',
                cursor: hasDetailedStatus ? 'help' : 'default',
                '& .MuiChip-label': { px: '8px' },
            }}
        />
    )

    if (hasDetailedStatus && tooltipText) {
        return (
            <Tooltip title={tooltipText} arrow placement="top">
                {chip}
            </Tooltip>
        )
    }

    return chip
}

// ── Person cell ───────────────────────────────────────────────────────────────

function PersonCell({ name }: { name: string }) {
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
    const today = new Date().toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).split('/').reverse().join('-');

    const { data: rawSessions = [], isLoading } = useQuery({
        queryKey: ['classes-attendance', today],
        queryFn: () => getClassesAttendance(today),
    })

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
                        {isLoading
                            ? Array.from({ length: 5 }, (_, i) => <RowSkeleton key={i} />)
                            : sessions.map((s: ClassAttendance) => (
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
                                        {s.teacherName
                                            ? <PersonCell name={s.teacherName} />
                                            : <Typography sx={{ fontSize: '0.8125rem', color: tokens.textDisabled }}>—</Typography>}
                                    </TableCell>
                                    <TableCell sx={{ py: '11px' }}>
                                        {s.studentName
                                            ? <PersonCell name={s.studentName} />
                                            : <Typography sx={{ fontSize: '0.8125rem', color: tokens.textDisabled }}>—</Typography>}
                                    </TableCell>
                                    <TableCell sx={{ py: '11px' }}>
                                        <Typography sx={{ fontSize: '0.8125rem', color: s.className ? tokens.text : tokens.textDisabled }}>{s.className ?? '—'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: '11px' }}>
                                        <StatusBadge status={s.attendanceStatus} />
                                    </TableCell>
                                </TableRow>
                            ))
                        }
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
