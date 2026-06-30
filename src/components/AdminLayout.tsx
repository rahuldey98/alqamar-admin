import { alpha, Avatar, Box, Divider, InputBase, Typography } from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getUser } from '../utils/auth.ts'
import { tokens } from '../theme.ts'
import { stringToColor, initials } from '../utils/ui.ts'
import type { ReactNode } from 'react'

const { bgElev1, bgElev2, divider: borderSoft } = tokens

// ── Navigation config ─────────────────────────────────────────────────────────

const NAV_GROUPS = [
    {
        label: 'Overview',
        items: [
            { id: 'dashboard', label: 'Dashboard', to: '/home', icon: <DashboardOutlinedIcon sx={{ fontSize: 16 }} /> },
            { id: 'attendance', label: 'Attendance', to: '/attendance', icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} /> },
        ],
    },
    {
        label: 'People',
        items: [
            { id: 'teachers', label: 'Teachers', to: '/teachers', icon: <BadgeOutlinedIcon sx={{ fontSize: 16 }} /> },
            { id: 'students', label: 'Students', to: '/students', icon: <SchoolOutlinedIcon sx={{ fontSize: 16 }} /> },
        ],
    },
    {
        label: 'Academy',
        items: [
            { id: 'courses', label: 'Courses', to: '/academy/courses', icon: <MenuBookOutlinedIcon sx={{ fontSize: 16 }} /> },
            { id: 'fees', label: 'Fees', to: '/academy/fees', icon: <PaymentsOutlinedIcon sx={{ fontSize: 16 }} /> },
        ],
    },
]

// ── NavItem ───────────────────────────────────────────────────────────────────

function NavItem({ icon, label, to, active = false }: { icon: ReactNode; label: string; to?: string; active?: boolean }) {
    const sx = {
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        px: 1.5,
        py: '9px',
        borderRadius: 2,
        color: active ? tokens.indigoLight : tokens.textSecondary,
        bgcolor: active ? alpha(tokens.indigo, 0.12) : 'transparent',
        cursor: 'pointer',
        fontSize: '0.84375rem',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'background 0.12s, color 0.12s',
        position: 'relative' as const,
        '&:hover': {
            bgcolor: active ? alpha(tokens.indigo, 0.16) : bgElev2,
            color: active ? tokens.indigoLight : tokens.text,
        },
        ...(active && {
            '&::before': {
                content: '""',
                position: 'absolute',
                left: -12,
                top: 8,
                bottom: 8,
                width: 2,
                bgcolor: tokens.indigo,
                borderRadius: '0 2px 2px 0',
            },
        }),
    }

    if (to) {
        return (
            <Box component={Link} to={to} sx={sx}>
                {icon}
                <span>{label}</span>
            </Box>
        )
    }

    return (
        <Box component="span" sx={sx}>
            {icon}
            <span>{label}</span>
        </Box>
    )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ activeId }: { activeId: string }) {
    const navigate = useNavigate()
    const adminName = getUser()?.name ?? 'Admin'

    const handleLogout = () => {
        clearAuth()
        navigate('/login', { replace: true })
    }

    return (
        <Box
            component="aside"
            sx={{
                width: 232, flexShrink: 0, bgcolor: bgElev1,
                borderRight: `1px solid ${borderSoft}`,
                display: 'flex', flexDirection: 'column',
                px: 1.5, py: '20px',
                position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
            }}
        >
            {/* Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1, pb: 2.5, mb: 2, borderBottom: `1px solid ${borderSoft}` }}>
                <Box component="img" src="/favicon.png" alt="Alqamar" sx={{ width: 32, height: 32, borderRadius: 2, flexShrink: 0, objectFit: 'cover' }} />
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.84375rem', fontWeight: 600, color: tokens.text, letterSpacing: '-0.005em' }}>Alqamar</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: tokens.textDisabled, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Academy</Typography>
                </Box>
            </Box>

            {/* Nav groups */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {NAV_GROUPS.map((group) => (
                    <Box key={group.label}>
                        <Typography sx={{ fontSize: '0.65625rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: tokens.textDisabled, fontWeight: 600, px: 1.5, pt: 1.5, pb: 0.75 }}>
                            {group.label}
                        </Typography>
                        {group.items.map((item) => (
                            <NavItem key={item.id} icon={item.icon} label={item.label} to={item.to} active={activeId === item.id} />
                        ))}
                    </Box>
                ))}
            </Box>

            <Box sx={{ flex: 1 }} />
            <Box
                component="span"
                onClick={handleLogout}
                sx={{
                    display: 'flex', alignItems: 'center', gap: '11px', px: 1.5, py: '9px',
                    borderRadius: 2, color: tokens.textSecondary, cursor: 'pointer',
                    fontSize: '0.84375rem', fontWeight: 500,
                    '&:hover': { bgcolor: bgElev2, color: tokens.text },
                }}
            >
                <LogoutOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Sign out</span>
            </Box>

            <Box sx={{ height: 12 }} />

            {/* User row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: bgElev2, border: `1px solid ${borderSoft}` }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.625rem', fontWeight: 600, bgcolor: stringToColor(adminName) }}>
                    {initials(adminName)}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: '0.78125rem', fontWeight: 500, color: tokens.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {adminName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: tokens.textDisabled }}>Administrator</Typography>
                </Box>
            </Box>
        </Box>
    )
}

// ── Topbar ────────────────────────────────────────────────────────────────────

function Topbar({ crumb, title }: { crumb: string; title: string }) {
    const adminName = getUser()?.name ?? 'Admin'
    return (
        <Box
            component="header"
            sx={{
                height: 60, borderBottom: `1px solid ${borderSoft}`,
                display: 'flex', alignItems: 'center', gap: 2, px: 3,
                bgcolor: alpha(tokens.bg, 0.85), backdropFilter: 'blur(12px)',
                position: 'sticky', top: 0, zIndex: 5, flexShrink: 0,
            }}
        >
            <Box
                component="button"
                sx={{
                    width: 34, height: 34, borderRadius: '8px', bgcolor: bgElev2,
                    border: `1px solid ${borderSoft}`, display: 'grid', placeItems: 'center',
                    cursor: 'pointer', color: tokens.textSecondary, flexShrink: 0,
                    '&:hover': { color: tokens.text, borderColor: tokens.border },
                }}
            >
                <MenuOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>

            <Box>
                <Typography sx={{ fontSize: '0.78125rem', color: tokens.textDisabled, mb: '1px' }}>{crumb}</Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em', color: tokens.text }}>{title}</Typography>
            </Box>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: bgElev2, border: `1px solid ${borderSoft}`, borderRadius: '8px', px: 1.5, height: 34, width: 280, color: tokens.textSecondary }}>
                <SearchOutlinedIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                <InputBase placeholder="Search teachers, students…" sx={{ flex: 1, fontSize: '0.8125rem', color: tokens.text, '& input::placeholder': { color: tokens.textDisabled } }} />
                <Box component="kbd" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.625rem', px: '5px', py: '1px', bgcolor: '#1a2238', border: `1px solid ${tokens.border}`, borderRadius: '4px', color: tokens.textDisabled, flexShrink: 0 }}>
                    ⌘K
                </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', borderColor: borderSoft }} />

            <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 600, bgcolor: stringToColor(adminName), cursor: 'pointer' }}>
                {initials(adminName)}
            </Avatar>
        </Box>
    )
}

// ── AdminLayout ───────────────────────────────────────────────────────────────

interface AdminLayoutProps {
    activeNav: string
    crumb: string
    title: string
    children: ReactNode
}

export function AdminLayout({ activeNav, crumb, title, children }: AdminLayoutProps) {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: tokens.bg }}>
            <Sidebar activeId={activeNav} />
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <Topbar crumb={crumb} title={title} />
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    )
}
