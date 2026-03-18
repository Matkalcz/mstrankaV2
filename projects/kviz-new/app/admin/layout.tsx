// app/admin/layout.tsx
import { AdminShell } from "@/components/AdminLayoutDark"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
