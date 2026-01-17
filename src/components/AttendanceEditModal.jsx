import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { calcAttendance } from "../utils/time";

export default function AttendanceEditModal({
  show,
  onHide,
  record,
  emps,
  allRecords,
  onSave,
}) {
  const [date, setDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");

  const emp = useMemo(() => {
    if (!record) return null;
    return emps.find(e => e.id === record.empId);
  }, [record, emps]);

  useEffect(() => {
    if (record) {
      setDate(record.date);
      setCheckIn(record.checkIn);
      setCheckOut(record.checkOut);
      setError("");
    }
  }, [record]);

  function handleSave() {
    if (!record) return;

    setError("");
    if (!date || !checkIn || !checkOut) return setError("املأ التاريخ ووقت الحضور والانصراف.");

    const inMin = Number(checkIn.split(":")[0]) * 60 + Number(checkIn.split(":")[1]);
    const outMin = Number(checkOut.split(":")[0]) * 60 + Number(checkOut.split(":")[1]);
    if (outMin <= inMin) return setError("وقت الانصراف لازم يكون بعد وقت الحضور.");

    const duplicate = allRecords.some(r =>
      r.id !== record.id &&
      r.empId === record.empId &&
      r.date === date
    );
    if (duplicate) return setError("فيه سجل موجود بالفعل لنفس الموظف في نفس اليوم.");

    const officialHours = emp?.workHoursPerDay ?? record.officialHours ?? 8;

    const calc = calcAttendance({
      checkIn,
      checkOut,
      officialStart: "09:00",
      officialHours,
    });

    const updated = {
      ...record,
      date,
      checkIn,
      checkOut,
      officialHours,
      ...calc,
    };

    onSave(updated);
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Edit Attendance {emp ? `— ${emp.name}` : ""}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="d-flex flex-column gap-2">
        {error && <Alert variant="danger" className="py-2 mb-1">{error}</Alert>}

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

        <small className="text-muted">
          Official hours/day: <b>{emp?.workHoursPerDay ?? record?.officialHours ?? 8}</b>
        </small>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
}
