const dayjs = require("dayjs");

function addMinutesToTime(timeStr, minutesToAdd) {
  // Use a dummy date since we only care about shifting the time part
  const dummyDate = `2000-01-01 ${timeStr}`;
  const newTime = dayjs(dummyDate).add(Number(minutesToAdd), "minute");

  return newTime.format("HH:mm:ss");
}

module.exports = addMinutesToTime;
