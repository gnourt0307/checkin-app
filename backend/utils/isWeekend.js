const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

function isWeekend() {
  const dayOfWeek = dayjs().tz("Asia/Ho_Chi_Minh").day();

  return dayOfWeek === 0 || dayOfWeek === 6;
}

module.exports = isWeekend;
