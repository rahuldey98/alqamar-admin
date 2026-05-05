import { alpha, Box, Skeleton, Typography } from '@mui/material'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import { useQuery } from '@tanstack/react-query'
import { getDashboardOverview } from '../api/client.ts'
import { AdminLayout } from '../components/AdminLayout.tsx'
import { tokens } from '../theme.ts'
import type { ReactNode } from 'react'

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string
    value: string
    color: string
    icon: ReactNode
}

function StatCard({ label, value, color, icon }: StatCardProps) {
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

// ── Stat config ───────────────────────────────────────────────────────────────

const STAT_CONFIG = [
    { key: 'totalStudents' as const, label: 'Total students', color: tokens.indigo, icon: <PeopleOutlinedIcon sx={{ fontSize: 15 }} /> },
    { key: 'totalTeachers' as const, label: 'Total teachers', color: tokens.cyan, icon: <WorkOutlinedIcon sx={{ fontSize: 15 }} /> },
    { key: 'todayTotalClasses' as const, label: 'Classes today', color: tokens.green, icon: <EventOutlinedIcon sx={{ fontSize: 15 }} /> },
]

// ── HomePage ──────────────────────────────────────────────────────────────────

export const HomePage = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: getDashboardOverview,
    })

    return (
        <AdminLayout activeNav="dashboard" crumb="Overview" title="Dashboard">
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, 1fr)' } }}>
                {STAT_CONFIG.map(({ key, label, color, icon }) =>
                    isLoading ? (
                        <Skeleton key={key} variant="rounded" height={112} sx={{ borderRadius: '10px', bgcolor: alpha(tokens.text, 0.06) }} />
                    ) : (
                        <StatCard key={key} label={label} value={String(data?.[key] ?? '—')} color={color} icon={icon} />
                    )
                )}
            </Box>
        </AdminLayout>
    )
}
