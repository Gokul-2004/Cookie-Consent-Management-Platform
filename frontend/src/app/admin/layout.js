import AdminNav from '../../components/admin/AdminNav'

export const metadata = {
  title: 'Admin - CMP Configuration',
  description: 'Banner Configuration Admin Panel',
}

// Admin layout (ConsentManager is excluded via ClientLayout pathname check)
export default function AdminLayout({ children }) {
  return (
    <>
      <AdminNav />
      {children}
    </>
  )
}
