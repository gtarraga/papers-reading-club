import { AdminPanel } from "@/components/AdminPanel";

export default function AdminPage() {
  const groupId = 1; // Hardcoded for single group initially

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-mono text-4xl text-stone-900 mb-8">Admin Panel</h1>
        <AdminPanel groupId={groupId} />
      </div>
    </div>
  );
}
