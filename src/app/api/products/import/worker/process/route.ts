import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getImportJob } from "@/lib/import/db";
import { processImportJob } from "@/lib/import/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const jobId = body.jobId as string | undefined;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const job = await getImportJob(jobId);
    if (!job || job.user_id !== user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status === "processing" || job.status === "completed") {
      return NextResponse.json({ status: job.status });
    }

    processImportJob(jobId).catch((error) => {
      console.error(`Worker failed for job ${jobId}:`, error);
    });

    return NextResponse.json({ status: "processing" });
  } catch (error) {
    console.error("Worker trigger error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Worker trigger failed" },
      { status: 500 },
    );
  }
}
