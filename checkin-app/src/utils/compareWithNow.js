import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

function compareWithNow(timeString) {
  const nowInVN = dayjs().tz("Asia/Ho_Chi_Minh");
  const [targetHour, targetMinute, targetSecond] = timeString.split(":");
  const target = nowInVN
    .hour(parseInt(targetHour, 10))
    .minute(parseInt(targetMinute, 10))
    .second(parseInt(targetSecond || 0, 10))
    .millisecond(0);

  if (nowInVN.isBefore(target)) return "before";
  else return "after";
}

export default compareWithNow;
