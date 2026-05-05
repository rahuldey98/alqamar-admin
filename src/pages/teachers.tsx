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
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTeachers } from '../api/client.ts'
import { AdminLayout } from '../components/AdminLayout.tsx'
import { tokens } from '../theme.ts'
import { stringToColor, initials } from '../utils/ui.ts'
import type { User as Teacher } from "@rahuldey98/alqamar-models/dist/entities/user"

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Teacher['status'] }) {
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

// ── Teacher row skeleton ──────────────────────────────────────────────────────

function RowSkeleton() {
    return (
        <TableRow>
            {[48, 160, 110, 130, 80, 70].map((w, i) => (
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
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<FilterKey>('all')

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

    const counts: Record<FilterKey, number> = {
        all: teachers.length,
        ACTIVE: teachers.filter((t) => t.status === 'ACTIVE').length,
        INACTIVE: teachers.filter((t) => t.status === 'INACTIVE').length,
    }

    return (
        <AdminLayout activeNav="teachers" crumb="People" title="Teachers">
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
                                <TableCell>Name</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Meet link</TableCell>
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
                                                No teachers match your search.
                                            </TableCell>
                                        </TableRow>
                                    )
                                    : filtered.map((t) => <TeacherRow key={t.id} teacher={t} />)
                            }
                        </TableBody>
                    </Table>
                </Box>
            </Box>
        </AdminLayout>
    )
}

// ── Teacher row ───────────────────────────────────────────────────────────────

function TeacherRow({ teacher: t }: { teacher: Teacher }) {
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

            {/* Email */}
            <TableCell sx={{ fontSize: '0.78125rem', color: t.email ? tokens.textSecondary : tokens.textDisabled }}>
                {t.email ?? '—'}
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

            {/* Status */}
            <TableCell><StatusBadge status={t.status} /></TableCell>

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
