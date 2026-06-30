import {
    alpha,
    Avatar,
    Box,
    Chip,
    CircularProgress,
    IconButton,
    InputBase,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Popper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined'
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTeacherStudents, getTeachers, updateTeacher, resetPassword } from '../api/client.ts'
import { AdminLayout } from '../components/AdminLayout.tsx'
import { TeacherDrawer } from '../components/TeacherDrawer.tsx'
import { tokens } from '../theme.ts'
import { stringToColor, initials } from '../utils/ui.ts'
import { createDefaultPassword } from '../utils/password.ts'
import type { Teacher } from "@rahuldey98/alqamar-models"


function StudentCountBadge({ count, teacherId }: { count: number; teacherId: number }) {
    const hasStudents = count > 0
    const [anchor, setAnchor] = useState<HTMLElement | null>(null)
    const open = Boolean(anchor)

    const { data: students = [], isFetching } = useQuery({
        queryKey: ['teacher-students', teacherId],
        queryFn: () => getTeacherStudents(teacherId),
        enabled: open,
        staleTime: 30_000,
    })

    return (
        <Box
            onMouseEnter={(e) => setAnchor(e.currentTarget)}
            onMouseLeave={() => setAnchor(null)}
            sx={{ display: 'inline-flex' }}
        >
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: '8px',
                    py: '2px',
                    borderRadius: '999px',
                    fontSize: '0.71875rem',
                    fontWeight: 500,
                    cursor: hasStudents ? 'default' : 'default',
                    bgcolor: hasStudents ? alpha(tokens.cyan, 0.1) : alpha(tokens.textDisabled, 0.05),
                    color: hasStudents ? tokens.cyan : tokens.textDisabled,
                    border: `1px solid ${hasStudents ? alpha(tokens.cyan, 0.2) : alpha(tokens.textDisabled, 0.1)}`,
                    transition: 'bgcolor 0.15s',
                }}
            >
                {count} {count === 1 ? 'student' : 'students'}
            </Box>

            <Popper
                open={open && hasStudents}
                anchorEl={anchor}
                placement="bottom-start"
                modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
                sx={{ zIndex: 1400 }}
            >
                <Box
                    sx={{
                        bgcolor: tokens.bgElev1,
                        border: `1px solid ${tokens.divider}`,
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                        minWidth: 160,
                        maxWidth: 240,
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{ px: '10px', py: '7px', borderBottom: `1px solid ${tokens.divider}` }}>
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: tokens.textDisabled, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Students
                        </Typography>
                    </Box>
                    <Box sx={{ py: '4px' }}>
                        {isFetching
                            ? (
                                <Box sx={{ px: '12px', py: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CircularProgress size={11} sx={{ color: tokens.textDisabled }} />
                                    <Typography sx={{ fontSize: '0.75rem', color: tokens.textDisabled }}>Loading…</Typography>
                                </Box>
                            )
                            : students.length === 0
                                ? <Typography sx={{ px: '12px', py: '8px', fontSize: '0.75rem', color: tokens.textDisabled }}>No students</Typography>
                                : students.map((s) => (
                                    <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '10px', py: '5px' }}>
                                        <Avatar sx={{ width: 20, height: 20, fontSize: '0.55rem', fontWeight: 600, bgcolor: stringToColor(s.name), flexShrink: 0 }}>
                                            {initials(s.name)}
                                        </Avatar>
                                        <Typography sx={{ fontSize: '0.78125rem', color: tokens.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {s.name}
                                        </Typography>
                                    </Box>
                                ))
                        }
                    </Box>
                </Box>
            </Popper>
        </Box>
    )
}

// ── Filter chips ──────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'ACTIVE' | 'INACTIVE'

const FILTER_LABELS: Record<FilterKey, string> = { all: 'All', ACTIVE: 'Active', INACTIVE: 'Inactive' }

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

// ── Sortable column header ────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc'

function SortableCell({ label, colKey, sortCol, sortDir, onSort, sx }: {
    label: string
    colKey: string
    sortCol: string
    sortDir: SortDir
    onSort: (col: string) => void
    sx?: object
}) {
    const active = sortCol === colKey
    return (
        <TableCell
            onClick={() => onSort(colKey)}
            sx={{
                cursor: 'pointer', userSelect: 'none',
                '&:hover .sort-icon': { opacity: 1 },
                ...sx,
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

// ── Password cell ──────────────────────────────────────────────────────────────

function PasswordCell({ name }: { name: string }) {
    const [visible, setVisible] = useState(false)
    const [copied, setCopied] = useState(false)
    const password = createDefaultPassword(name)

    const handleCopy = () => {
        navigator.clipboard.writeText(password)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
            <Typography sx={{
                fontSize: '0.78125rem',
                fontFamily: '"JetBrains Mono", monospace',
                color: tokens.textSecondary,
                letterSpacing: visible ? 'normal' : '0.15em',
                minWidth: 72,
            }}>
                {visible ? password : '••••••'}
            </Typography>
            {!visible
                ? (
                    <IconButton size="small" onClick={() => setVisible(true)}
                        sx={{ p: '3px', color: tokens.textDisabled, '&:hover': { color: tokens.textSecondary, bgcolor: tokens.bgElev2 } }}
                    >
                        <VisibilityOutlinedIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                )
                : (
                    <IconButton size="small" onClick={handleCopy}
                        sx={{ p: '3px', color: copied ? tokens.green : tokens.textDisabled, '&:hover': { color: copied ? tokens.green : tokens.textSecondary, bgcolor: tokens.bgElev2 } }}
                    >
                        {copied
                            ? <CheckOutlinedIcon sx={{ fontSize: 13 }} />
                            : <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />
                        }
                    </IconButton>
                )
            }
        </Box>
    )
}

// ── Teacher row skeleton ──────────────────────────────────────────────────────────

function RowSkeleton() {
    return (
        <TableRow>
            {[48, 160, 100, 110, 130, 70].map((w, i) => (
                <TableCell key={i}>
                    <Skeleton variant="rounded" width={w} height={14} sx={{ bgcolor: alpha(tokens.text, 0.05) }} />
                </TableCell>
            ))}
            <TableCell />
        </TableRow>
    )
}

// ── TeachersPage ──────────────────────────────────────────────────────────────

export const TeachersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<FilterKey>('ACTIVE')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>(undefined)

    useEffect(() => {
        if (searchParams.get('new') === '1') {
            setEditingTeacher(undefined)
            setDrawerOpen(true)
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, setSearchParams])
    const [sortCol, setSortCol] = useState('name')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    const handleSort = (col: string) => {
        if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        else { setSortCol(col); setSortDir('desc') }
    }

    const { data: teachers = [], isLoading } = useQuery({
        queryKey: ['teachers'],
        queryFn: getTeachers,
    })

    const filtered = teachers.filter((t) => {
        if (filter !== 'all' && t.status !== filter) return false
        if (search) {
            const q = search.toLowerCase()
            return (
                t.name.toLowerCase().includes(q) ||
                t.phone.includes(q) ||
                (t.email ?? '').toLowerCase().includes(q)
            )
        }
        return true
    })

    const sorted = [...filtered].sort((a, b) => {
        let cmp = 0
        if (sortCol === 'name') cmp = a.name.localeCompare(b.name)
        else if (sortCol === 'phone') cmp = a.phone.localeCompare(b.phone)
        else if (sortCol === 'noOfStudents') cmp = a.noOfStudents - b.noOfStudents
        else if (sortCol === 'meetLink') cmp = (a.meetLink ? 1 : 0) - (b.meetLink ? 1 : 0)
        else if (sortCol === 'status') cmp = (a.status ?? '').localeCompare(b.status ?? '')
        return sortDir === 'asc' ? cmp : -cmp
    })

    const counts: Record<FilterKey, number> = {
        all: teachers.length,
        ACTIVE: teachers.filter((t) => t.status === 'ACTIVE').length,
        INACTIVE: teachers.filter((t) => t.status === 'INACTIVE').length,
    }

    return (
        <AdminLayout activeNav="teachers" crumb="People" title="Teachers">
            <TeacherDrawer
                key={editingTeacher?.id ?? 'new'}
                open={drawerOpen}
                teacher={editingTeacher}
                onClose={() => { setDrawerOpen(false); setEditingTeacher(undefined) }}
            />

            {/* Page header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: '4px' }}>
                <Box>
                    <Typography sx={{ fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.02em', color: tokens.text, mb: '4px' }}>
                        Teachers
                    </Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: tokens.textDisabled }}>
                        {isLoading ? '—' : `${teachers.length} faculty member${teachers.length !== 1 ? 's' : ''}`}
                    </Typography>
                </Box>
                <Box
                    component="button"
                    onClick={() => { setEditingTeacher(undefined); setDrawerOpen(true) }}
                    sx={{
                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                        px: '14px', py: '8px', borderRadius: '8px', border: 'none',
                        bgcolor: tokens.indigo, color: '#fff', fontSize: '0.8125rem', fontWeight: 500,
                        cursor: 'pointer', flexShrink: 0,
                        boxShadow: `0 1px 0 rgba(255,255,255,0.12) inset, 0 8px 18px -8px ${tokens.indigo}`,
                        '&:hover': { bgcolor: '#5558e3' },
                    }}
                >
                    <AddOutlinedIcon sx={{ fontSize: 14 }} />
                    Add teacher
                </Box>
            </Box>

            {/* Card */}
            <Box sx={{ bgcolor: tokens.bgElev1, border: `1px solid ${tokens.divider}`, borderRadius: '10px', overflow: 'hidden' }}>
                {/* Filter row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: 2, py: 1.5, borderBottom: `1px solid ${tokens.divider}`, flexWrap: 'wrap' }}>
                    {/* Search */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: tokens.bgElev2, border: `1px solid ${tokens.divider}`, borderRadius: '8px', px: 1.5, height: 32, width: 260, color: tokens.textSecondary }}>
                        <SearchOutlinedIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                        <InputBase
                            placeholder="Search by name or phone…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ flex: 1, fontSize: '0.8125rem', color: tokens.text, '& input::placeholder': { color: tokens.textDisabled } }}
                        />
                    </Box>

                    {/* Status chips */}
                    <Box sx={{ display: 'inline-flex', bgcolor: tokens.bgElev2, border: `1px solid ${tokens.divider}`, borderRadius: '8px', p: '2px', gap: '2px' }}>
                        {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
                            <FilterChip key={key} label={FILTER_LABELS[key]} count={counts[key]} active={filter === key} onClick={() => setFilter(key)} />
                        ))}
                    </Box>

                    <Box sx={{ flex: 1 }} />

                    {!isLoading && filtered.length !== teachers.length && (
                        <Chip label={`${filtered.length} shown`} size="small" sx={{ fontSize: '0.6875rem', height: 22, bgcolor: alpha(tokens.indigo, 0.1), color: tokens.indigoLight }} />
                    )}
                </Box>

                {/* Table */}
                <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow>
                                <SortableCell label="Name" colKey="name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                <SortableCell label="Phone" colKey="phone" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                <TableCell>Password</TableCell>
                                <SortableCell label="No. of students" colKey="noOfStudents" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                <SortableCell label="Meet link" colKey="meetLink" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                <TableCell sx={{ width: 50 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading
                                ? Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
                                : sorted.length === 0
                                    ? (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: tokens.textDisabled, fontSize: '0.8125rem', border: 0 }}>
                                                No teachers match your search.
                                            </TableCell>
                                        </TableRow>
                                    )
                                    : sorted.map((t) => (
                                        <TeacherRow
                                            key={t.id}
                                            teacher={t}
                                            onEdit={() => { setEditingTeacher(t); setDrawerOpen(true) }}
                                        />
                                    ))
                            }
                        </TableBody>
                    </Table>
                </Box>
            </Box>
        </AdminLayout>
    )
}

// ── Row actions menu ──────────────────────────────────────────────────────────

function RowMenu({ teacher, onEdit }: { teacher: Teacher; onEdit: () => void }) {
    const queryClient = useQueryClient()
    const [anchor, setAnchor] = useState<null | HTMLElement>(null)

    const isActive = teacher.status === 'ACTIVE'
    const password = createDefaultPassword(teacher.name)

    const statusMutation = useMutation({
        mutationFn: () => updateTeacher(teacher.id, { status: isActive ? 'INACTIVE' : 'ACTIVE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }),
        onSettled: () => setAnchor(null),
    })

    const resetMutation = useMutation({
        mutationFn: () => resetPassword(teacher.id, password),
        onSettled: () => setAnchor(null),
    })

    return (
        <>
            <Box
                component="button"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setAnchor(e.currentTarget) }}
                sx={{
                    width: 28, height: 28, borderRadius: '6px', bgcolor: 'transparent',
                    border: 'none', display: 'grid', placeItems: 'center',
                    cursor: 'pointer', color: tokens.textDisabled,
                    '&:hover': { bgcolor: tokens.bgElev2, color: tokens.text },
                }}
            >
                <MoreHorizOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                onClick={(e) => e.stopPropagation()}
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: tokens.bgElev1,
                            border: `1px solid ${tokens.divider}`,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            borderRadius: '8px',
                            minWidth: 160,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    onClick={() => { setAnchor(null); onEdit() }}
                    sx={{ fontSize: '0.8125rem', color: tokens.text, gap: 1, '&:hover': { bgcolor: tokens.bgElev2 } }}
                >
                    <ListItemIcon sx={{ minWidth: 'unset' }}><EditOutlinedIcon sx={{ fontSize: 15, color: tokens.textSecondary }} /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => resetMutation.mutate()}
                    disabled={resetMutation.isPending}
                    sx={{ fontSize: '0.8125rem', color: tokens.text, gap: 1, '&:hover': { bgcolor: tokens.bgElev2 }, '&.Mui-disabled': { opacity: 0.4 } }}
                >
                    <ListItemIcon sx={{ minWidth: 'unset' }}>
                        {resetMutation.isPending
                            ? <CircularProgress size={13} sx={{ color: tokens.textSecondary }} />
                            : resetMutation.isSuccess
                                ? <CheckOutlinedIcon sx={{ fontSize: 15, color: tokens.green }} />
                                : <LockResetOutlinedIcon sx={{ fontSize: 15, color: tokens.textSecondary }} />
                        }
                    </ListItemIcon>
                    <ListItemText>Reset Password</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => statusMutation.mutate()}
                    disabled={statusMutation.isPending}
                    sx={{
                        fontSize: '0.8125rem', gap: 1,
                        color: isActive ? tokens.red : tokens.green,
                        '&:hover': { bgcolor: isActive ? alpha(tokens.red, 0.08) : alpha(tokens.green, 0.08) },
                        '&.Mui-disabled': { opacity: 0.4 },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 'unset' }}>
                        {statusMutation.isPending
                            ? <CircularProgress size={13} sx={{ color: isActive ? tokens.red : tokens.green }} />
                            : isActive
                                ? <BlockOutlinedIcon sx={{ fontSize: 15, color: tokens.red }} />
                                : <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 15, color: tokens.green }} />
                        }
                    </ListItemIcon>
                    <ListItemText>{isActive ? 'Deactivate' : 'Activate'}</ListItemText>
                </MenuItem>
            </Menu>
        </>
    )
}

// ── Teacher row ───────────────────────────────────────────────────────────────

function TeacherRow({ teacher: t, onEdit }: { teacher: Teacher; onEdit: () => void }) {
    return (
        <TableRow sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(tokens.indigo, 0.04) } }}>
            {/* Name */}
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 600, bgcolor: stringToColor(t.name) }}>
                        {initials(t.name)}
                    </Avatar>
                    <Box>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: tokens.text }}>{t.name}</Typography>
                        <Typography sx={{ fontSize: '0.71875rem', color: tokens.textDisabled, fontFamily: '"JetBrains Mono", monospace' }}>
                            #{t.id}
                        </Typography>
                    </Box>
                </Box>
            </TableCell>

            {/* Phone */}
            <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78125rem', color: tokens.textSecondary }}>
                {t.phone}
            </TableCell>

            {/* Password */}
            <TableCell><PasswordCell name={t.name} /></TableCell>

            {/* Students */}
            <TableCell>
                <StudentCountBadge count={t.noOfStudents} teacherId={t.id} />
            </TableCell>

            {/* Meet link */}
            <TableCell>
                {t.meetLink ? (
                    <Box
                        component="a"
                        href={t.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        sx={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '0.75rem', color: tokens.indigo, textDecoration: 'none',
                            '&:hover': { color: tokens.indigoLight, textDecoration: 'underline' },
                        }}
                    >
                        <VideoCallOutlinedIcon sx={{ fontSize: 14 }} />
                        Meet
                    </Box>
                ) : (
                    <Typography sx={{ fontSize: '0.78125rem', color: tokens.textDisabled }}>—</Typography>
                )}
            </TableCell>

            {/* Actions */}
            <TableCell onClick={(e) => e.stopPropagation()}>
                <RowMenu teacher={t} onEdit={onEdit} />
            </TableCell>
        </TableRow>
    )
}
