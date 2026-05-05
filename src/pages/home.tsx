import {alpha, Avatar, Box, Divider, InputBase, Skeleton, Typography,} from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import {clearAccessToken} from '../utils/auth.ts'
import {useNavigate} from 'react-router-dom'
import {tokens} from '../theme.ts'
import {useQuery} from '@tanstack/react-query'
import {getDashboardOverview} from '../api/client.ts'
import type {ReactNode} from 'react'

// Elevation colours that complement the dark theme tokens
const ELEV1 = '#0f1525'
const ELEV2 = '#161d33'
const BORDER_SOFT = tokens.divider // #1c2440

// ── Utilities ────────────────────────────────────────────────────────────────

function stringToColor(s: string) {
    let hash = 0
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash)
    let color = '#'
    for (let i = 0; i < 3; i++) color += `00${((hash >> (i * 8)) & 0xff).toString(16)}`.slice(-2)
    return color
}

function initials(name: string) {
    const parts = name.trim().split(' ')
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0]
}

// ── Navigation ────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
    {
        label: 'Overview',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 16 }} /> },
            { id: 'attendance', label: 'Attendance', icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} /> },
        ],
    },
    {
        label: 'People',
        items: [
            { id: 'teachers', label: 'Teachers', icon: <BadgeOutlinedIcon sx={{ fontSize: 16 }} /> },
            { id: 'students', label: 'Students', icon: <SchoolOutlinedIcon sx={{ fontSize: 16 }} /> },
        ],
    },
    {
        label: 'Academy',
        items: [
            { id: 'classes', label: 'Classes', icon: <MenuBookOutlinedIcon sx={{ fontSize: 16 }} /> },
            { id: 'fees', label: 'Fees', icon: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} /> },
            { id: 'messages', label: 'Messages', icon: <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16 }} /> },
        ],
    },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
    activeId: string
    onLogout: () => void
}

function Sidebar({ activeId, onLogout }: SidebarProps) {
    return (
        <Box
            component="aside"
            sx={{
                width: 232,
                flexShrink: 0,
                bgcolor: ELEV1,
                borderRight: `1px solid ${BORDER_SOFT}`,
                display: 'flex',
                flexDirection: 'column',
                px: 1.5,
                py: '20px',
                position: 'sticky',
                top: 0,
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            {/* Brand */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: 1,
                    pb: 2.5,
                    mb: 2,
                    borderBottom: `1px solid ${BORDER_SOFT}`,
                }}
            >
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${tokens.indigo} 0%, ${tokens.indigoDark} 100%)`,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        boxShadow: `0 0 0 1px rgba(255,255,255,0.06) inset, 0 8px 20px -8px ${tokens.indigo}`,
                    }}
                >
                    {/* Crescent mark */}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1a6 6 0 1 0 0 12A4.5 4.5 0 0 1 7 1z" fill="white" opacity="0.9" />
                    </svg>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.84375rem', fontWeight: 600, color: tokens.text, letterSpacing: '-0.005em' }}>
                        Alqamar
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: tokens.textDisabled, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        Academy
                    </Typography>
                </Box>
            </Box>

            {/* Nav groups */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {NAV_GROUPS.map((group) => (
                    <Box key={group.label}>
                        <Typography
                            sx={{
                                fontSize: '0.65625rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: tokens.textDisabled,
                                fontWeight: 600,
                                px: 1.5,
                                pt: 1.5,
                                pb: 0.75,
                            }}
                        >
                            {group.label}
                        </Typography>
                        {group.items.map((item) => (
                            <NavItem key={item.id} icon={item.icon} label={item.label} active={activeId === item.id} />
                        ))}
                    </Box>
                ))}
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Bottom links */}
            <NavItem icon={<SettingsOutlinedIcon sx={{ fontSize: 16 }} />} label="Settings" />
            <NavItem icon={<HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} />} label="Help & support" />
            <NavItem icon={<LogoutOutlinedIcon sx={{ fontSize: 16 }} />} label="Sign out" onClick={onLogout} />

            <Box sx={{ height: 12 }} />

            {/* User row */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    bgcolor: ELEV2,
                    border: `1px solid ${BORDER_SOFT}`,
                }}
            >
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.625rem', fontWeight: 600, bgcolor: stringToColor('Naveed Ali') }}>
                    {initials('Naveed Ali')}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: '0.78125rem', fontWeight: 500, color: tokens.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Naveed Ali
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: tokens.textDisabled }}>Administrator</Typography>
                </Box>
            </Box>
        </Box>
    )
}

interface NavItemProps {
    icon: ReactNode
    label: string
    active?: boolean
    onClick?: () => void
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
    return (
        <Box
            component="a"
            onClick={onClick}
            href="#"
            sx={{
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
                position: 'relative',
                '&:hover': {
                    bgcolor: active ? alpha(tokens.indigo, 0.16) : ELEV2,
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
            }}
        >
            {icon}
            <span>{label}</span>
        </Box>
    )
}

// ── Topbar ────────────────────────────────────────────────────────────────────

interface TopbarProps {
    crumb: string
    title: string
    onMenuToggle?: () => void
}

function Topbar({ crumb, title, onMenuToggle }: TopbarProps) {
    return (
        <Box
            component="header"
            sx={{
                height: 60,
                borderBottom: `1px solid ${BORDER_SOFT}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 3,
                bgcolor: alpha(tokens.bg, 0.85),
                backdropFilter: 'blur(12px)',
                position: 'sticky',
                top: 0,
                zIndex: 5,
                flexShrink: 0,
            }}
        >
            {/* Sidebar toggle */}
            <Box
                component="button"
                onClick={onMenuToggle}
                sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    bgcolor: ELEV2,
                    border: `1px solid ${BORDER_SOFT}`,
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    color: tokens.textSecondary,
                    flexShrink: 0,
                    '&:hover': { color: tokens.text, borderColor: tokens.border },
                }}
            >
                <MenuOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>

            {/* Page title */}
            <Box>
                <Typography sx={{ fontSize: '0.78125rem', color: tokens.textDisabled, mb: '1px' }}>
                    {crumb}
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em', color: tokens.text }}>
                    {title}
                </Typography>
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Search */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: ELEV2,
                    border: `1px solid ${BORDER_SOFT}`,
                    borderRadius: '8px',
                    px: 1.5,
                    height: 34,
                    width: 280,
                    color: tokens.textSecondary,
                }}
            >
                <SearchOutlinedIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                <InputBase
                    placeholder="Search teachers, students…"
                    sx={{
                        flex: 1,
                        fontSize: '0.8125rem',
                        color: tokens.text,
                        '& input::placeholder': { color: tokens.textDisabled },
                    }}
                />
                <Box
                    component="kbd"
                    sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.625rem',
                        px: '5px',
                        py: '1px',
                        bgcolor: '#1a2238',
                        border: `1px solid ${tokens.border}`,
                        borderRadius: '4px',
                        color: tokens.textDisabled,
                        flexShrink: 0,
                    }}
                >
                    ⌘K
                </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', borderColor: BORDER_SOFT }} />

            {/* Avatar */}
            <Avatar
                sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor: stringToColor('Naveed Ali'),
                    cursor: 'pointer',
                }}
            >
                {initials('Naveed Ali')}
            </Avatar>
        </Box>
    )
}

// ── Stat cards ────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string
    value: string
    color: string
    icon: ReactNode
}

function StatCard({ label, value, color, icon }: StatCardProps) {
    return (
        <Box
            sx={{
                bgcolor: ELEV1,
                border: `1px solid ${BORDER_SOFT}`,
                borderRadius: '10px',
                p: '18px 20px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Top row: label + icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '14px' }}>
                <Typography sx={{ fontSize: '0.75rem', color: tokens.textDisabled, letterSpacing: '0.01em' }}>
                    {label}
                </Typography>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        bgcolor: alpha(color, 0.1),
                        color,
                    }}
                >
                    {icon}
                </Box>
            </Box>

            {/* Value */}
            <Typography
                sx={{
                    fontSize: '1.75rem',
                    fontWeight: 600,
                    letterSpacing: '-0.025em',
                    fontVariantNumeric: 'tabular-nums',
                    color: tokens.text,
                    mb: '6px',
                    lineHeight: 1,
                }}
            >
                {value}
            </Typography>
        </Box>
    )
}

// ── Stat card config (static shape, dynamic value) ───────────────────────────

const STAT_CONFIG = [
    {
        key: 'totalStudents' as const,
        label: 'Total students',
        color: tokens.indigo,
        icon: <PeopleOutlinedIcon sx={{ fontSize: 15 }} />,
    },
    {
        key: 'totalTeachers' as const,
        label: 'Total teachers',
        color: tokens.cyan,
        icon: <WorkOutlinedIcon sx={{ fontSize: 15 }} />,
    },
    {
        key: 'todayTotalClasses' as const,
        label: 'Classes today',
        color: tokens.green,
        icon: <EventOutlinedIcon sx={{ fontSize: 15 }} />,
    },
]

// ── HomePage ──────────────────────────────────────────────────────────────────

export const HomePage = () => {
    const navigate = useNavigate()

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: getDashboardOverview,
    })

    const handleLogout = () => {
        clearAccessToken()
        navigate('/login', { replace: true })
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: tokens.bg }}>
            <Sidebar activeId="dashboard" onLogout={handleLogout} />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <Topbar crumb="Overview" title="Dashboard" />

                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Stat cards grid */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 2,
                            '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                        }}
                    >
                        {STAT_CONFIG.map(({ key, label, color, icon }) => (
                            isLoading ? (
                                <Skeleton
                                    key={key}
                                    variant="rounded"
                                    height={112}
                                    sx={{ borderRadius: '10px', bgcolor: alpha(tokens.text, 0.06) }}
                                />
                            ) : (
                                <StatCard
                                    key={key}
                                    label={label}
                                    value={String(data?.[key] ?? '—')}
                                    color={color}
                                    icon={icon}
                                />
                            )
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
