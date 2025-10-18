import { processCycleRollover } from "@/actions/cycle.actions";

/**
 * Cron job handler for automated cycle rollover
 * Called by Vercel Cron or similar service
 * Secured by Bearer token in Authorization header
 *
 * Example usage:
 * GET /api/cron
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  try {
    // Extract secret from Authorization header
    const authHeader = request.headers.get("authorization");
    const secret = authHeader?.replace("Bearer ", "");

    // Process cycle rollover (validates secret internally)
    const result = await processCycleRollover(secret);

    if (!result.success) {
      return Response.json(
        { error: result.error || "Failed to process cycle rollover" },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      processedGroups: result.processedGroups || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cron handler:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
