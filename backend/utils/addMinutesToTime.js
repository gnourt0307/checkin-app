function addMinutesToTime(timeStr, minutesToAdd) {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds);

  date.setMinutes(date.getMinutes() + Number(minutesToAdd));

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

module.exports = addMinutesToTime;
