import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import { AdminLayout } from '../components/AdminLayout.tsx'
import { ComingSoon } from '../components/ComingSoon.tsx'

export function FeesPage() {
    return (
        <AdminLayout activeNav="fees" crumb="Academy" title="Fees">
            <ComingSoon name="Fees" icon={<PaymentsOutlinedIcon sx={{ fontSize: 26 }} />} />
        </AdminLayout>
    )
}
