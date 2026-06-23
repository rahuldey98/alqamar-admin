import { alpha, Avatar, Box, InputBase, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Typography, Chip } from '@mui/material'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined'
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getClassesAttendance } from '../api/client.ts'
import type { ClassAttendance } from '../api/client.ts'
import { AdminLayout } from '../components/AdminLayout.tsx'
import { tokens } from '../theme.ts'
import { stringToColor, initials } from '../utils/ui.ts'
import type { ReactNode } from 'react'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    'all present':     { label: 'Present',      color: tokens.green,        bg: alpha(tokens.green, 0.12) },
    'teacher present': { label: 'Teacher only', color: tokens.amber,        bg: alpha(tokens.amber, 0.12) },
    'not present':     { label: 'Not present',  color: tokens.red,          bg: alpha(tokens.red, 0.12) },
}
const FALLBACK_STATUS = { label: 'Unknown', color: tokens.textDisabled, bg: alpha(tokens.text, 0.06) }

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? FALLBACK_STATUS
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

// ── Summary stat card ─────────────────────────────────────────────────────────

interface SummaryCardProps {
    label: string
    value: string | number
    color: string
    icon: ReactNode
}

function SummaryCard({ label, value, color, icon }: SummaryCardProps) {
    return (
        <Box sx={{ bgcolor: tokens.bgElev1, border: `1px solid ${tokens.divider}`, borderRadius: '10px', p: '18px 20px' }}>
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

// ── Filter chip ───────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'all present' | 'teacher present' | 'not present'

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all',             label: 'All' },
    { key: 'all present',     label: 'Present' },
    { key: 'teacher present', label: 'Teacher only' },
    { key: 'not present',     label: 'Not present' },
]

function FilterChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
    return (
        <Box
            component="button"
            onClick={onClick}
            sx={{
                px: '10px', py: '5px', fontSize: '0.75rem', fontWeight: 500, borderRadius: '6px',
                color: active ? tokens.text : tokens.textSecondary,
                bgcolor: active ? tokens.bgElev1 : 'transparent',
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px',
                transition: 'background 0.12s, color 0.12s',
                '&:hover': { color: tokens.text },
            }}
        >
            {label}
            <Box component="span" sx={{ fontSize: '0.6875rem', color: tokens.textDisabled, ml: '2px' }}>{count}</Box>
        </Box>
    )
}

// ── Person cell ───────────────────────────────────────────────────────────────

function PersonCell({ name }: { name: string | null }) {
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

// ── Row skeleton ──────────────────────────────────────────────────────────────

function RowSkeleton() {
    return (
        <TableRow sx={{ '& .MuiTableCell-root': { borderColor: tokens.divider } }}>
            {[70, 140, 120, 160, 90].map((w, i) => (
                <TableCell key={i} sx={{ py: '11px' }}>
                    <Skeleton variant="rounded" width={w} height={14} sx={{ bgcolor: alpha(tokens.text, 0.05) }} />
                </TableCell>
            ))}
        </TableRow>
    )
}

// ── Sortable column header ────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc'

function SortableCell({ label, colKey, sortCol, sortDir, onSort }: {
    label: string
    colKey: string
    sortCol: string
    sortDir: SortDir
    onSort: (col: string) => void
}) {
    const active = sortCol === colKey
    return (
        <TableCell
            onClick={() => onSort(colKey)}
            sx={{
                cursor: 'pointer', userSelect: 'none', fontSize: '0.6875rem', fontWeight: 600,
                color: tokens.textDisabled, letterSpacing: '0.06em', textTransform: 'uppercase',
                py: '10px', bgcolor: alpha(tokens.text, 0.02),
                '&:hover .sort-icon': { opacity: 1 },
            }}
        >
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {label}
                <Box className="sort-icon" sx={{ display: 'flex', opacity: active ? 1 : 0.3, transition: 'opacity 0.15s' }}>
                    {active
                        ? <ArrowUpwardOutlinedIcon sx={{ fontSize: 12, transform: sortDir === 'desc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        : <UnfoldMoreOutlinedIcon sx={{ fontSize: 12 }} />
                    }
                </Box>
            </Box>
        </TableCell>
    )
}

// ── AttendancePage ────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().split('T')[0]

export function AttendancePage() {
    const [date, setDate] = useState(todayISO)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<FilterKey>('all')
    const [sortCol, setSortCol] = useState('time')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    const handleSort = (col: string) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortCol(col); setSortDir('asc') }
    }

    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['classes-attendance', date],
        queryFn: () => getClassesAttendance(date),
    })

    // Counts per status
    const counts: Record<FilterKey, number> = {
        'all':             sessions.length,
        'all present':     sessions.filter(s => s.attendanceStatus === 'all present').length,
        'teacher present': sessions.filter(s => s.attendanceStatus === 'teacher present').length,
        'not present':     sessions.filter(s => s.attendanceStatus === 'not present').length,
    }

    // Apply filter + search
    const filtered = sessions.filter((s: ClassAttendance) => {
        if (filter !== 'all' && s.attendanceStatus !== filter) return false
        if (search) {
            const q = search.toLowerCase()
            return (
                (s.teacherName?.toLowerCase().includes(q) ?? false) ||
                (s.studentName?.toLowerCase().includes(q) ?? false) ||
                (s.className?.toLowerCase().includes(q) ?? false)
            )
        }
        return true
    })

    const sorted = [...filtered].sort((a, b) => {
        let cmp = 0
        if (sortCol === 'time')    cmp = a.startTime.localeCompare(b.startTime)
        else if (sortCol === 'teacher') cmp = (a.teacherName ?? '').localeCompare(b.teacherName ?? '')
        else if (sortCol === 'student') cmp = (a.studentName ?? '').localeCompare(b.studentName ?? '')
        else if (sortCol === 'class')   cmp = (a.className ?? '').localeCompare(b.className ?? '')
        else if (sortCol === 'status')  cmp = a.attendanceStatus.localeCompare(b.attendanceStatus)
        return sortDir === 'asc' ? cmp : -cmp
    })

    const isToday = date === todayISO()

    return (
        <AdminLayout activeNav="attendance" crumb="Attendance" title="Attendance">
            {/* Summary cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, 1fr)' } }}>
                {isLoading ? (
                    Array.from({ length: 4 }, (_, i) => (
                        <Skeleton key={i} variant="rounded" height={104} sx={{ borderRadius: '10px', bgcolor: alpha(tokens.text, 0.06) }} />
                    ))
                ) : (
                    <>
                        <SummaryCard label="Total sessions" value={counts.all} color={tokens.indigo} icon={<EventOutlinedIcon sx={{ fontSize: 15 }} />} />
                        <SummaryCard label="Present" value={counts['all present']} color={tokens.green} icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 15 }} />} />
                        <SummaryCard label="Teacher only" value={counts['teacher present']} color={tokens.amber} icon={<HourglassEmptyOutlinedIcon sx={{ fontSize: 15 }} />} />
                        <SummaryCard label="Not present" value={counts['not present']} color={tokens.red} icon={<CancelOutlinedIcon sx={{ fontSize: 15 }} />} />
                    </>
                )}
            </Box>

            {/* Main card */}
            <Box sx={{ bgcolor: tokens.bgElev1, border: `1px solid ${tokens.divider}`, borderRadius: '10px', overflow: 'hidden' }}>
                {/* Card header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: '14px', borderBottom: `1px solid ${tokens.divider}` }}>
                    <Box>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: tokens.text }}>
                            Browse attendance
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: tokens.textSecondary, mt: '2px' }}>
                            {isLoading ? 'Loading…' : `${sessions.length} session${sessions.length !== 1 ? 's' : ''} on ${isToday ? 'today' : date}`}
                        </Typography>
                    </Box>

                    {/* Date picker */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '10px', py: '6px', borderRadius: '7px', bgcolor: tokens.bgElev2, border: `1px solid ${tokens.divider}` }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: tokens.textSecondary, flexShrink: 0 }} />
                        <Box
                            component="input"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            sx={{
                                background: 'none', border: 'none', outline: 'none',
                                fontSize: '0.78125rem', fontWeight: 500, color: tokens.text,
                                cursor: 'pointer', fontFamily: 'inherit',
                                colorScheme: 'dark',
                            }}
                        />
                    </Box>
                </Box>

                {/* Filter row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: 2, py: '10px', borderBottom: `1px solid ${tokens.divider}`, bgcolor: alpha(tokens.text, 0.01) }}>
                    {/* Search */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', px: '10px', height: 32, borderRadius: '7px', bgcolor: tokens.bgElev2, border: `1px solid ${tokens.divider}`, width: 260, flexShrink: 0 }}>
                        <SearchOutlinedIcon sx={{ fontSize: 13, color: tokens.textDisabled, flexShrink: 0 }} />
                        <InputBase
                            placeholder="Search teacher, student or class…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            sx={{ flex: 1, fontSize: '0.78125rem', color: tokens.text, '& input::placeholder': { color: tokens.textDisabled } }}
                        />
                    </Box>

                    {/* Filters */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', bgcolor: tokens.bgElev2, borderRadius: '7px', p: '2px', border: `1px solid ${tokens.divider}` }}>
                        {FILTERS.map(f => (
                            <FilterChip
                                key={f.key}
                                label={f.label}
                                count={counts[f.key]}
                                active={filter === f.key}
                                onClick={() => setFilter(f.key)}
                            />
                        ))}
                    </Box>

                    <Box sx={{ flex: 1 }} />
                    <Typography sx={{ fontSize: '0.6875rem', color: tokens.textDisabled }}>
                        {sorted.length} result{sorted.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>

                {/* Table */}
                <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 680 }}>
                        <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-root': { borderColor: tokens.divider } }}>
                                <SortableCell label="Time"    colKey="time"    sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                <SortableCell label="Teacher" colKey="teacher" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                <SortableCell label="Student" colKey="student" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                <SortableCell label="Class"   colKey="class"   sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                <SortableCell label="Status"  colKey="status"  sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading
                                ? Array.from({ length: 8 }, (_, i) => <RowSkeleton key={i} />)
                                : sorted.length === 0
                                    ? (
                                        <TableRow>
                                            <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, border: 0 }}>
                                                <Typography sx={{ color: tokens.textDisabled, fontSize: '0.875rem' }}>
                                                    {sessions.length === 0 ? 'No sessions found for this date.' : 'No sessions match your filters.'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )
                                    : sorted.map((s: ClassAttendance) => (
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
                                                <PersonCell name={s.teacherName} />
                                            </TableCell>
                                            <TableCell sx={{ py: '11px' }}>
                                                <PersonCell name={s.studentName} />
                                            </TableCell>
                                            <TableCell sx={{ py: '11px' }}>
                                                <Typography sx={{ fontSize: '0.8125rem', color: s.className ? tokens.text : tokens.textDisabled }}>
                                                    {s.className ?? '—'}
                                                </Typography>
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
        </AdminLayout>
    )
}
