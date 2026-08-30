import { createWorkerClient } from "../lib/import/worker-client";
import { processImportJob } from "../lib/import/worker";

const supabase = createWorkerClient();
const POLL_INTERVAL = parseInt(process.env.WORKER_POLL_INTERVAL ?? "5000", 10);

async function pollForJobs() {
  console.log("Worker started, polling for import jobs...");

  while (true) {
    try {
      const { data: jobs, error } = await supabase
        .from("import_jobs")
        .select("*")
        .eq("status", "queued")
        .limit(5);

      if (error) {
        console.error("Poll error:", error);
        await sleep(POLL_INTERVAL);
        continue;
      }

      if (jobs && jobs.length > 0) {
        console.log(`Found ${jobs.length} queued jobs`);
        for (const job of jobs) {
          console.log(`Processing job ${job.id}`);
          await processImportJob(job.id);
        }
      } else {
        await sleep(POLL_INTERVAL);
      }
    } catch (error) {
      console.error("Worker error:", error);
      await sleep(POLL_INTERVAL);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

pollForJobs().catch((error) => {
  console.error("Worker crashed:", error);
  process.exit(1);
});
