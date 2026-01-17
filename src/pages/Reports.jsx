import React, { useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Stack, Table, Badge, Alert } from "react-bootstrap";
import { load } from "../utils/storage";
import { exportToCSV } from "../utils/csv";

function currentMonthValue() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; 
}

export default function Reports() {
  const [emps] = useState(() => load("emps", []));
  const [attendance] = useState(() => load("attendance", []));

  const [month, setMonth] = useState(currentMonthValue());
  const [empId, setEmpId] = useState("all"); 

  const monthRecords = useMemo(() => {
    // filter by month
    let list = attendance.filter(r => String(r.date).startsWith(month));

    // filter by employee
    if (empId !== "all") list = list.filter(r => r.empId === empId);

    // sort by date asc
    list.sort((a, b) => a.date.localeCompare(b.date));

    return list;
  }, [attendance, month, empId]);

  const rows = useMemo(() => {
    return monthRecords.map(r => {
      const emp = emps.find(e => e.id === r.empId);
      return {
        Date: r.date,
        Employee: emp?.name ?? "Unknown",
        Job: emp?.job ?? "-",
        "Check In": r.checkIn,
        "Check Out": r.checkOut,
        "Total Hours": r.totalHours ?? ((r.totalMinutes || 0) / 60).toFixed(2),
        "Late (min)": r.lateMinutes ?? 0,
        "Overtime (min)": r.overtimeMinutes ?? 0,
      };
    });
  }, [monthRecords, emps]);

  const summary = useMemo(() => {
    const totalMinutes = monthRecords.reduce((s, r) => s + (r.totalMinutes || 0), 0);
    const lateMinutes = monthRecords.reduce((s, r) => s + (r.lateMinutes || 0), 0);
    const overtimeMinutes = monthRecords.reduce((s, r) => s + (r.overtimeMinutes || 0), 0);
    return {
      totalHours: (totalMinutes / 60).toFixed(2),
      lateMinutes,
      overtimeMinutes,
    };
  }, [monthRecords]);

  const selectedEmpName = useMemo(() => {
    if (empId === "all") return "All Employees";
    const emp = emps.find(e => e.id === empId);
    return emp ? emp.name : "Unknown";
  }, [empId, emps]);

  function handleExport() {
    if (!rows.length) return;
    const fileName = `report_${month}_${empId === "all" ? "all" : selectedEmpName}`;
    exportToCSV(fileName, rows);
  }

  if (!emps.length) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="mb-0">
          لازم تضيف موظفين الأول من صفحة Employees.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Stack direction="horizontal" className="mb-3 gap-2 flex-wrap">
        <h4 className="mb-0">Reports</h4>

        <div className="ms-auto d-flex gap-2 flex-wrap">
          <Form.Control
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            title="Month"
          />

          <Form.Select
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            style={{ minWidth: 220 }}
            title="Employee"
          >
            <option value="all">All Employees</option>
            {emps.map(e => (
              <option key={e.id} value={e.id}>{e.name} — {e.job}</option>
            ))}
          </Form.Select>

          <Button variant="primary" onClick={handleExport} disabled={!rows.length}>
            Export CSV
          </Button>
        </div>
      </Stack>

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <small className="text-muted">Selected</small>
              <div className="fw-bold fs-5">{selectedEmpName}</div>
              <small className="text-muted">Month: {month}</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <small className="text-muted">Total Hours</small>
              <div className="fw-bold fs-3">{summary.totalHours}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={2}>
          <Card className="shadow-sm">
            <Card.Body>
              <small className="text-muted">Late</small>
              <div className="fw-bold fs-4 text-danger">{summary.lateMinutes} min</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={2}>
          <Card className="shadow-sm">
            <Card.Body>
              <small className="text-muted">Overtime</small>
              <div className="fw-bold fs-4 text-success">{summary.overtimeMinutes} min</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">
            Records{" "}
            <Badge bg="secondary">{rows.length}</Badge>
          </Card.Title>

          {!rows.length ? (
            <p className="text-muted mb-0">No records for this selection.</p>
          ) : (
            <div className="table-responsive">
              <Table striped hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Job</th>
                    <th>In</th>
                    <th>Out</th>
                    <th>Total</th>
                    <th>Late</th>
                    <th>OT</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.Date}</td>
                      <td className="fw-semibold">{r.Employee}</td>
                      <td>{r.Job}</td>
                      <td><Badge bg="secondary">{r["Check In"]}</Badge></td>
                      <td><Badge bg="secondary">{r["Check Out"]}</Badge></td>
                      <td>{r["Total Hours"]} h</td>
                      <td className={Number(r["Late (min)"]) ? "text-danger fw-bold" : ""}>
                        {r["Late (min)"]} min
                      </td>
                      <td className={Number(r["Overtime (min)"]) ? "text-success fw-bold" : ""}>
                        {r["Overtime (min)"]} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
