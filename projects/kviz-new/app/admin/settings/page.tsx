// app/admin/settings/page.tsx
import { AdminPageHeader } from "@/components/AdminLayoutDark"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Nastavení"
        subtitle="Konfigurace systému"
      />
      <div className="px-8 py-12 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
          <Settings size={32} className="text-violet-400" />
        </div>
        <p className="text-gray-400 text-sm">Nastavení jsou zatím v přípravě.</p>
      </div>
    </div>
  )
}
