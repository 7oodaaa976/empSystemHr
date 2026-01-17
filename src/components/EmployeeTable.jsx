import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

export default function EmployeeTable({ emps, onDelete, onEdit }) {
  if (!emps.length) return <p className="text-muted mb-0">No employees found.</p>;

  return (
    <div className="table-responsive">
      <Table striped hover className="align-middle mb-0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Job</th>
            <th>Salary</th>
            <th>Hours/Day</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>

        <tbody>
          {emps.map(e => (
            <tr key={e.id}>
              <td className="fw-semibold">{e.name}</td>
              <td><Badge bg="info">{e.job}</Badge></td>
              <td>{e.salary} EGP</td>
              <td>{e.workHoursPerDay}</td>

              <td className="text-end d-flex gap-2 justify-content-end">
                <Button variant="outline-primary" size="sm" onClick={() => onEdit(e)}>
                  Edit
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onDelete(e.id)}>
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
