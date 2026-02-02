import './globals.css'
import ClientLayout from '../components/ClientLayout'

export const metadata = {
  title: 'CMP Starter',
  description: 'Cookie Consent Management Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
