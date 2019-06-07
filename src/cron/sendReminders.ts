import { CronJob } from 'cron'

export const sendReminders = new CronJob(
  '0 * * * * *',
  () => {
    console.log('TICK TACK MOTHERFUCKER')
  },
  undefined,
  true,
  'Europe/Belgrade',
)
