import { AdminPanel } from "@/components/AdminPanel";
import { db } from "@/db";
import type { Group } from "@/db/types";
import { getCurrentCycle, getCycleStatus } from "@/lib/cycle";

// Force dynamic rendering - database queries need runtime access
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const groupId: Group["id"] = 1; // Hardcoded for single group initially

  // Fetch group data
  const group = await db.query.groups.findFirst({
    where: (groups, { eq }) => eq(groups.id, groupId),
  });

  if (!group) {
    return <div>Group not found</div>;
  }

  // Fetch current cycle
  const currentCycle = await getCurrentCycle(groupId);
  const cycleStatus = currentCycle ? getCycleStatus(currentCycle) : null;

  return (
    <AdminPanel
      group={group}
      currentCycle={currentCycle}
      cycleStatus={cycleStatus}
    />
  );
}
