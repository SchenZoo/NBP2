import { CronJob } from "cron";

export const sendReminders = new CronJob(
  "0 * * * * *",
  () => {
    console.log("Test cron");
  },
  undefined,
  true,
  "Europe/Belgrade"
);
