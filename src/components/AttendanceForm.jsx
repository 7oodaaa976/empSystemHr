import React, { useMemo, useState } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { calcAttendance, todayISO } from "../utils/time";

export default function AttendanceForm({ emps, attendance, setAttendance, onAdded }) {
  const [empId, setEmpId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [checkIn, setCheckIn] = useState("09:00");
  const [checkOut, setCheckOut] = useState("17:00");
  const [error, setError] = useState("");

  const selectedEmp = useMemo(() => emps.find(e => e.id === empId), [emps, empId]);

  function handleSave() {
    setError("");

    if (!empId) return setError("اختار موظف الأول.");
    if (!checkIn || !checkOut) return setError("دخل وقت الحضور والانصراف.");

    const inMin = Number(checkIn.split(":")[0]) * 60 + Number(checkIn.split(":")[1]);
    const outMin = Number(checkOut.split(":")[0]) * 60 + Number(checkOut.split(":")[1]);
    if (outMin <= inMin) return setError("وقت الانصراف لازم يكون بعد وقت الحضور.");

    const exists = attendance.some(r => r.empId === empId && r.date === date);
    if (exists) return setError("تم تسجيل هذا الموظف بالفعل في نفس اليوم. احذف/عدّل السجل لو محتاج.");

    const officialHours = selectedEmp?.workHoursPerDay ?? 8;

    const calc = calcAttendance({
      checkIn,
      checkOut,
      officialStart: "09:00",
      officialHours,
    });

    const record = {
      id: Date.now(),
      empId,
      date,
      checkIn,
      checkOut,
      officialHours,
      ...calc,
    };

    setAttendance(prev => [record, ...prev]);
    onAdded?.();
  }

  return (
    <div className="d-flex flex-column gap-2">
      {error && <Alert variant="danger" className="py-2 mb-1">{error}</Alert>}

      <Form.Group>
        <Form.Label>Employee</Form.Label>
        <Form.Select value={empId} onChange={(e) => setEmpId(e.target.value)}>
          <option value="">Choose employee...</option>
          {emps.map(e => (
            <option key={e.id} value={e.id}>{e.name} — {e.job}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label>Date</Form.Label>
        <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Check In</Form.Label>
        <Form.Control type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Check Out</Form.Label>
        <Form.Control type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
      </Form.Group>

      <Button className="mt-2" onClick={handleSave}>Save Record</Button>

      {selectedEmp && (
        <small className="text-muted">
          Official hours/day for <b>{selectedEmp.name}</b>: {selectedEmp.workHoursPerDay}
        </small>
      )}
    </div>
  );
}
