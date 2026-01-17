export function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return (h * 60) + m;
}

export function minutesToHours(mins) {
  return +(mins / 60).toFixed(2);
}

export function calcAttendance({ checkIn, checkOut, officialStart = "09:00", officialHours = 8 }) {
  const inMin = toMinutes(checkIn);
  const outMin = toMinutes(checkOut);

  const totalMinutes = Math.max(0, outMin - inMin);
  const lateMinutes = Math.max(0, inMin - toMinutes(officialStart));

  const requiredMinutes = officialHours * 60;
  const overtimeMinutes = Math.max(0, totalMinutes - requiredMinutes);

  return {
    totalMinutes,
    totalHours: minutesToHours(totalMinutes),
    lateMinutes,
    overtimeMinutes,
  };
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
