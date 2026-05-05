import {
    alpha,
    Avatar,
    Box,
    Chip,
    InputBase,
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
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getStudents } from '../api/client.ts'
import { AdminLayout } from '../components/AdminLayout.tsx'
import { tokens } from '../theme.ts'
import { stringToColor, initials } from '../utils/ui.ts'
import type { GetStudentResponse as Student } from "@rahuldey98/alqamar-models/dist/api/users/get-student"

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Student['status'] }) {
    const active = status === 'ACTIVE'
    return (
        <Box
            sx={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                px: '8px', py: '3px', borderRadius: '999px',
                fontSize: '0.71875rem', fontWeight: 500,
                bgcolor: active ? alpha(tokens.green, 0.12) : alpha(tokens.textSecondary, 0.08),
                color: active ? tokens.green : tokens.textSecondary,
                border: `1px solid ${active ? alpha(tokens.green, 0.2) : alpha(tokens.textSecondary, 0.15)}`,
            }}
        >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: active ? tokens.green : tokens.textSecondary, flexShrink: 0 }} />
            {active ? 'Active' : 'Inactive'}
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

// ── Row skeleton ──────────────────────────────────────────────────────────────

function RowSkeleton() {
    return (
        <TableRow>
            {[160, 110, 130, 140, 70].map((w, i) => (
                <TableCell key={i}>
                    <Skeleton variant="rounded" width={w} height={14} sx={{ bgcolor: alpha(tokens.text, 0.05) }} />
                </TableCell>
            ))}
            <TableCell />
        </TableRow>
    )
}

// ── Enrolled courses cell ─────────────────────────────────────────────────────

function EnrolledCourses({ student }: { student: Student }) {
    const courses = student.enrollments.map((e) => e.class.course.title)
    const unique = [...new Set(courses)]

    if (unique.length === 0) {
        return <Typography sx={{ fontSize: '0.78125rem', color: tokens.textDisabled }}>—</Typography>
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {unique.map((title) => (
                <Box
                    key={title}
                    sx={{
                        display: 'inline-flex', alignItems: 'center',
                        px: '7px', py: '2px', borderRadius: '999px',
                        fontSize: '0.6875rem', fontWeight: 500,
                        bgcolor: alpha(tokens.indigo, 0.1),
                        color: tokens.indigoLight,
                        border: `1px solid ${alpha(tokens.indigo, 0.22)}`,
                    }}
                >
                    {title}
                </Box>
            ))}
        </Box>
    )
}

// ── Student row ───────────────────────────────────────────────────────────────

function StudentRow({ student: s }: { student: Student }) {
    return (
        <TableRow sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(tokens.indigo, 0.04) } }}>
            {/* Name */}
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 600, bgcolor: stringToColor(s.name) }}>
                        {initials(s.name)}
                    </Avatar>
                    <Box>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: tokens.text }}>{s.name}</Typography>
                        <Typography sx={{ fontSize: '0.71875rem', color: tokens.textDisabled, fontFamily: '"JetBrains Mono", monospace' }}>
                            #{s.id}
                        </Typography>
                    </Box>
                </Box>
            </TableCell>

            {/* Phone */}
            <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78125rem', color: tokens.textSecondary }}>
                {s.phone}
            </TableCell>

            {/* Email */}
            <TableCell sx={{ fontSize: '0.78125rem', color: s.email ? tokens.textSecondary : tokens.textDisabled }}>
                {s.email ?? '—'}
            </TableCell>

            {/* Enrolled courses */}
            <TableCell><EnrolledCourses student={s} /></TableCell>

            {/* Status */}
            <TableCell><StatusBadge status={s.status} /></TableCell>

            {/* Actions */}
            <TableCell onClick={(e) => e.stopPropagation()}>
                <Box
                    component="button"
                    sx={{
                        width: 28, height: 28, borderRadius: '6px', bgcolor: 'transparent',
                        border: 'none', display: 'grid', placeItems: 'center',
                        cursor: 'pointer', color: tokens.textDisabled,
                        '&:hover': { bgcolor: tokens.bgElev2, color: tokens.text },
                    }}
                >
                    <MoreHorizOutlinedIcon sx={{ fontSize: 16 }} />
                </Box>
            </TableCell>
        </TableRow>
    )
}

// ── StudentsPage ──────────────────────────────────────────────────────────────

export const StudentsPage = () => {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<FilterKey>('all')

    const { data: students = [], isLoading } = useQuery({
        queryKey: ['students'],
        queryFn: getStudents,
    })

    const filtered = students.filter((s) => {
        if (filter !== 'all' && s.status !== filter) return false
        if (search) {
            const q = search.toLowerCase()
            return (
                s.name.toLowerCase().includes(q) ||
                s.phone.includes(q) ||
                (s.email ?? '').toLowerCase().includes(q)
            )
        }
        return true
    })

    const counts: Record<FilterKey, number> = {
        all: students.length,
        ACTIVE: students.filter((s) => s.status === 'ACTIVE').length,
        INACTIVE: students.filter((s) => s.status === 'INACTIVE').length,
    }

    return (
        <AdminLayout activeNav="students" crumb="People" title="Students">
            {/* Page header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: '4px' }}>
                <Box>
                    <Typography sx={{ fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.02em', color: tokens.text, mb: '4px' }}>
                        Students
                    </Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: tokens.textDisabled }}>
                        {isLoading ? '—' : `${students.length} enrolled student${students.length !== 1 ? 's' : ''}`}
                    </Typography>
                </Box>
                <Box
                    component="button"
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
                    Add student
                </Box>
            </Box>

            {/* Card */}
            <Box sx={{ bgcolor: tokens.bgElev1, border: `1px solid ${tokens.divider}`, borderRadius: '10px', overflow: 'hidden' }}>
                {/* Filter row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: 2, py: 1.5, borderBottom: `1px solid ${tokens.divider}`, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: tokens.bgElev2, border: `1px solid ${tokens.divider}`, borderRadius: '8px', px: 1.5, height: 32, width: 260, color: tokens.textSecondary }}>
                        <SearchOutlinedIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                        <InputBase
                            placeholder="Search by name or phone…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ flex: 1, fontSize: '0.8125rem', color: tokens.text, '& input::placeholder': { color: tokens.textDisabled } }}
                        />
                    </Box>

                    <Box sx={{ display: 'inline-flex', bgcolor: tokens.bgElev2, border: `1px solid ${tokens.divider}`, borderRadius: '8px', p: '2px', gap: '2px' }}>
                        {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
                            <FilterChip key={key} label={FILTER_LABELS[key]} count={counts[key]} active={filter === key} onClick={() => setFilter(key)} />
                        ))}
                    </Box>

                    <Box sx={{ flex: 1 }} />

                    {!isLoading && filtered.length !== students.length && (
                        <Chip label={`${filtered.length} shown`} size="small" sx={{ fontSize: '0.6875rem', height: 22, bgcolor: alpha(tokens.indigo, 0.1), color: tokens.indigoLight }} />
                    )}
                </Box>

                {/* Table */}
                <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 680 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Enrolled courses</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell sx={{ width: 50 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading
                                ? Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
                                : filtered.length === 0
                                    ? (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: tokens.textDisabled, fontSize: '0.8125rem', border: 0 }}>
                                                No students match your search.
                                            </TableCell>
                                        </TableRow>
                                    )
                                    : filtered.map((s) => <StudentRow key={s.id} student={s} />)
                            }
                        </TableBody>
                    </Table>
                </Box>
            </Box>
        </AdminLayout>
    )
}
