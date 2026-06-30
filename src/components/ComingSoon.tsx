import { alpha, Box, Typography } from '@mui/material'
import { tokens } from '../theme.ts'
import type { ReactNode } from 'react'

// Placeholder shown for modules that exist in the nav but aren't built yet.
// Mirrors the "Coming soon" card from the design prototype.

export function ComingSoon({ name, icon }: { name: string; icon: ReactNode }) {
    return (
        <Box
            sx={{
                bgcolor: tokens.bgElev1,
                border: `1px solid ${tokens.divider}`,
                borderRadius: 2.5,
                p: '60px',
                textAlign: 'center',
            }}
        >
            <Box
                sx={{
                    width: 60, height: 60, mx: 'auto', mb: 2,
                    borderRadius: 3,
                    bgcolor: alpha(tokens.indigo, 0.12),
                    color: tokens.indigoLight,
                    display: 'grid', placeItems: 'center',
                }}
            >
                {icon}
            </Box>
            <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600, color: tokens.text, mb: '6px' }}>
                {name}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: tokens.textDisabled, m: 0 }}>
                This module is part of the full portal — coming up next.
            </Typography>
        </Box>
    )
}
