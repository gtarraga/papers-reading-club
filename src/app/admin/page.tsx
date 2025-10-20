import { AdminPanel } from "@/components/AdminPanel";
import type { Group } from "@/db/types";
import { getCurrentCycle, getCycleStatus } from "@/lib/cycle";

// Force dynamic rendering - database queries need runtime access
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const groupId: Group["id"] = 1; // Hardcoded for single group initially

  // Fetch current cycle
  const currentCycle = await getCurrentCycle(groupId);
  const cycleStatus = currentCycle ? getCycleStatus(currentCycle) : null;

  return (
    <AdminPanel
      groupId={groupId}
      currentCycle={currentCycle}
      cycleStatus={cycleStatus}
    />
  );
}
