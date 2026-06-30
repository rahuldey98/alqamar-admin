import { alpha, Box, Chip, Skeleton, Typography } from '@mui/material'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../api/client.ts'
import type { CourseListItem } from '../api/client.ts'
import { AdminLayout } from '../components/AdminLayout.tsx'
import { CourseDrawer } from '../components/CourseDrawer.tsx'
import { tokens } from '../theme.ts'

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CourseListItem['status'] }) {
    const isActive = status === 'ACTIVE'
    return (
        <Chip
            label={isActive ? 'Active' : 'Inactive'}
            size="small"
            sx={{
                fontSize: '0.6875rem', fontWeight: 500, height: 20,
                bgcolor: isActive ? alpha(tokens.green, 0.12) : alpha(tokens.text, 0.06),
                color: isActive ? tokens.green : tokens.textDisabled,
                border: 'none',
                '& .MuiChip-label': { px: '8px' },
            }}
        />
    )
}

// ── Duration formatting ───────────────────────────────────────────────────────

function formatDuration(months: number): string {
    if (!months) return '—'
    const years = Math.floor(months / 12)
    const rem = months % 12
    const parts: string[] = []
    if (years) parts.push(`${years} yr${years !== 1 ? 's' : ''}`)
    if (rem) parts.push(`${rem} mo${rem !== 1 ? 's' : ''}`)
    return parts.join(' ')
}

// ── Course card ───────────────────────────────────────────────────────────────

function CourseCard({ course: c }: { course: CourseListItem }) {
    return (
        <Box
            sx={{
                bgcolor: tokens.bgElev1,
                border: `1px solid ${tokens.divider}`,
                borderRadius: '12px',
                p: '18px',
                display: 'flex', flexDirection: 'column', gap: '14px',
                transition: 'border-color 0.12s, background 0.12s',
                '&:hover': { borderColor: alpha(tokens.indigo, 0.4), bgcolor: alpha(tokens.indigo, 0.03) },
            }}
        >
            {/* Top row: icon + status */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box
                    sx={{
                        width: 40, height: 40, borderRadius: '10px',
                        bgcolor: alpha(tokens.indigo, 0.12), color: tokens.indigoLight,
                        display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}
                >
                    <MenuBookOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <StatusBadge status={c.status} />
            </Box>

            {/* Titles */}
            <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: tokens.text, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    {c.title}
                </Typography>
                {c.enTitle && (
                    <Typography sx={{ fontSize: '0.78125rem', color: tokens.textSecondary, mt: '3px' }}>
                        {c.enTitle}
                    </Typography>
                )}
            </Box>

            {/* Footer: duration + id */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: '12px', borderTop: `1px solid ${tokens.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', color: tokens.textSecondary }}>
                    <ScheduleOutlinedIcon sx={{ fontSize: 14 }} />
                    <Typography sx={{ fontSize: '0.78125rem', fontVariantNumeric: 'tabular-nums' }}>
                        {formatDuration(c.durationMonths)}
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.71875rem', color: tokens.textDisabled, fontFamily: '"JetBrains Mono", monospace' }}>
                    #{c.id}
                </Typography>
            </Box>
        </Box>
    )
}

// ── Card skeleton ─────────────────────────────────────────────────────────────

function CardSkeleton() {
    return (
        <Box sx={{ bgcolor: tokens.bgElev1, border: `1px solid ${tokens.divider}`, borderRadius: '12px', p: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton variant="rounded" width={40} height={40} sx={{ bgcolor: alpha(tokens.text, 0.05) }} />
                <Skeleton variant="rounded" width={56} height={20} sx={{ bgcolor: alpha(tokens.text, 0.05) }} />
            </Box>
            <Box>
                <Skeleton variant="rounded" width="80%" height={16} sx={{ bgcolor: alpha(tokens.text, 0.05) }} />
                <Skeleton variant="rounded" width="60%" height={12} sx={{ bgcolor: alpha(tokens.text, 0.05), mt: '6px' }} />
            </Box>
            <Skeleton variant="rounded" width="40%" height={14} sx={{ bgcolor: alpha(tokens.text, 0.05) }} />
        </Box>
    )
}

// ── Create card ───────────────────────────────────────────────────────────────

function CreateCourseCard({ onClick }: { onClick: () => void }) {
    return (
        <Box
            component="button"
            onClick={onClick}
            sx={{
                bgcolor: 'transparent',
                border: `1px dashed ${tokens.border}`,
                borderRadius: '12px',
                p: '18px',
                minHeight: 168,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
                color: tokens.textSecondary,
                transition: 'border-color 0.12s, background 0.12s, color 0.12s',
                '&:hover': { borderColor: alpha(tokens.indigo, 0.5), bgcolor: alpha(tokens.indigo, 0.04), color: tokens.indigoLight },
            }}
        >
            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(tokens.indigo, 0.12), color: tokens.indigoLight, display: 'grid', placeItems: 'center' }}>
                <AddOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontSize: '0.84375rem', fontWeight: 500, color: 'inherit' }}>
                Create course
            </Typography>
        </Box>
    )
}

// ── CoursesPage ───────────────────────────────────────────────────────────────

export function CoursesPage() {
    const [drawerOpen, setDrawerOpen] = useState(false)

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: getCourses,
    })

    return (
        <AdminLayout activeNav="courses" crumb="Academy" title="Courses">
            <CourseDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            {/* Page header */}
            <Box sx={{ mb: '4px' }}>
                <Typography sx={{ fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.02em', color: tokens.text, mb: '4px' }}>
                    Courses
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: tokens.textDisabled }}>
                    {isLoading ? '—' : `${courses.length} course${courses.length !== 1 ? 's' : ''}`}
                </Typography>
            </Box>

            {/* Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
                <CreateCourseCard onClick={() => setDrawerOpen(true)} />
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
                    : courses.map((c) => <CourseCard key={c.id} course={c} />)
                }
            </Box>
        </AdminLayout>
    )
}
