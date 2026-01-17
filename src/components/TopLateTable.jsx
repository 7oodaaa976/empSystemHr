import React from "react";
import { Table, Badge } from "react-bootstrap";

export default function TopLateTable({ rows }) {
  if (!rows.length) return <p className="text-muted mb-0">No late data yet.</p>;

  return (
    <div className="table-responsive">
      <Table striped hover className="align-middle mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Employee</th>
            <th className="text-end">Late (min)</th>
            <th className="text-end">Days Late</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.empId}>
              <td className="fw-bold">{idx + 1}</td>
              <td className="fw-semibold">
                {r.name}{" "}
                <Badge bg="info" className="ms-2">{r.job}</Badge>
              </td>
              <td className="text-end text-danger fw-bold">{r.lateMinutes}</td>
              <td className="text-end">{r.lateDays}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
