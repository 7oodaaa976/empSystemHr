import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

export default function AttendanceTable({ records, emps, onDelete, onEdit }) {
  if (!records.length) return <p className="text-muted mb-0">No attendance records.</p>;

  function empInfo(empId) {
    const emp = emps.find(e => e.id === empId);
    return emp ? `${emp.name} (${emp.job})` : "Unknown";
  }

  return (
    <div className="table-responsive">
      <Table striped hover className="align-middle mb-0">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>In</th>
            <th>Out</th>
            <th>Total</th>
            <th>Late</th>
            <th>Overtime</th>
            <th className="text-end">Action</th>
          </tr>
        </thead>

        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td className="fw-semibold">{empInfo(r.empId)}</td>
              <td>{r.date}</td>
              <td><Badge bg="secondary">{r.checkIn}</Badge></td>
              <td><Badge bg="secondary">{r.checkOut}</Badge></td>
              <td>{r.totalHours} h</td>

              <td className={r.lateMinutes ? "text-danger fw-bold" : ""}>
                {r.lateMinutes} min
              </td>

              <td className={r.overtimeMinutes ? "text-success fw-bold" : ""}>
                {r.overtimeMinutes} min
              </td>

              <td className="text-end d-flex gap-2 justify-content-end">
                <Button variant="outline-primary" size="sm" onClick={() => onEdit(r)}>
                  Edit
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onDelete(r.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
