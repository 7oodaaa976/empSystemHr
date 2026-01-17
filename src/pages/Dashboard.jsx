import React, { useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Stack } from "react-bootstrap";
import { load } from "../utils/storage";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
} from "recharts";
import TopOvertimeTable from "../components/TopOvertimeTable";
import TopLateTable from './../components/TopLateTable';


export default function Dashboard() {
  const [emps] = useState(() => load("emps", []));
  const [attendance] = useState(() => load("attendance", []));

  // Filters
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState("");     // YYYY-MM-DD

  const filteredAttendance = useMemo(() => {
    return attendance.filter(r => {
      const okFrom = from ? r.date >= from : true;
      const okTo = to ? r.date <= to : true;
      return okFrom && okTo;
    });
  }, [attendance, from, to]);

  const summary = useMemo(() => {
    const totalMinutes = filteredAttendance.reduce((s, r) => s + (r.totalMinutes || 0), 0);
    const lateMinutes = filteredAttendance.reduce((s, r) => s + (r.lateMinutes || 0), 0);
    const overtimeMinutes = filteredAttendance.reduce((s, r) => s + (r.overtimeMinutes || 0), 0);

    return {
      employees: emps.length,
      records: filteredAttendance.length,
      totalHours: +(totalMinutes / 60).toFixed(2),
      lateMinutes,
      overtimeMinutes,
    };
  }, [filteredAttendance, emps.length]);

  // Chart 1: hours by employee
  const hoursByEmp = useMemo(() => {
    const map = new Map(); // empId -> totalMinutes
    for (const r of filteredAttendance) {
      map.set(r.empId, (map.get(r.empId) || 0) + (r.totalMinutes || 0));
    }
    return emps
      .map(e => ({
        name: e.name,
        hours: +(((map.get(e.id) || 0) / 60).toFixed(2)),
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [filteredAttendance, emps]);
  const topLate = useMemo(() => {
  const map = new Map(); // empId -> { lateMinutes, lateDays }

  for (const r of filteredAttendance) {
    const late = r.lateMinutes || 0;
    if (!map.has(r.empId)) map.set(r.empId, { lateMinutes: 0, lateDays: 0 });
    const obj = map.get(r.empId);

    obj.lateMinutes += late;
    if (late > 0) obj.lateDays += 1;
  }

  return emps
    .map(e => {
      const x = map.get(e.id) || { lateMinutes: 0, lateDays: 0 };
      return {
        empId: e.id,
        name: e.name,
        job: e.job,
        lateMinutes: x.lateMinutes,
        lateDays: x.lateDays,
      };
    })
    .filter(x => x.lateMinutes > 0)
    .sort((a, b) => b.lateMinutes - a.lateMinutes)
    .slice(0, 5);
}, [filteredAttendance, emps]);
const topOvertime = useMemo(() => {
  const map = new Map(); // empId -> { overtimeMinutes, otDays }

  for (const r of filteredAttendance) {
    const ot = r.overtimeMinutes || 0;
    if (!map.has(r.empId)) map.set(r.empId, { overtimeMinutes: 0, otDays: 0 });
    const obj = map.get(r.empId);

    obj.overtimeMinutes += ot;
    if (ot > 0) obj.otDays += 1;
  }

  return emps
    .map(e => {
      const x = map.get(e.id) || { overtimeMinutes: 0, otDays: 0 };
      return {
        empId: e.id,
        name: e.name,
        job: e.job,
        overtimeMinutes: x.overtimeMinutes,
        otDays: x.otDays,
      };
    })
    .filter(x => x.overtimeMinutes > 0)
    .sort((a, b) => b.overtimeMinutes - a.overtimeMinutes)
    .slice(0, 5);
}, [filteredAttendance, emps]);



  // Chart 2: last 7 days hours (global)
  const last7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push(iso);
    }

    const byDate = new Map(); // date -> minutes
    for (const r of filteredAttendance) {
      byDate.set(r.date, (byDate.get(r.date) || 0) + (r.totalMinutes || 0));
    }

    return days.map(date => ({
      date,
      hours: +(((byDate.get(date) || 0) / 60).toFixed(2)),
    }));
  }, [filteredAttendance]);

  return (
    <Container className="py-4">
      <Stack direction="horizontal" className="mb-3 gap-2 flex-wrap">
        <h4 className="mb-0">Dashboard</h4>

        <div className="ms-auto d-flex gap-2 flex-wrap">
          <Form.Control
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            title="From"
          />
          <Form.Control
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            title="To"
          />
        </div>
      </Stack>

      {/* SUMMARY CARDS */}
      <Row className="g-3 mb-3">
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <small className="text-muted">Employees</small>
              <div className="fw-bold fs-3">{summary.employees}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <small className="text-muted">Attendance Records</small>
              <div className="fw-bold fs-3">{summary.records}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <small className="text-muted">Total Hours</small>
              <div className="fw-bold fs-3">{summary.totalHours}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <small className="text-muted">Late / OT (min)</small>
              <div className="fw-bold fs-5">
                <span className="text-danger">{summary.lateMinutes}</span>
                {" / "}
                <span className="text-success">{summary.overtimeMinutes}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CHARTS */}
      <Row className="g-3">
        <Col lg={7}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="mb-3">Hours by Employee</Card.Title>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={hoursByEmp}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <small className="text-muted">
                Tip: استخدم فلتر التاريخ فوق عشان تحسب فترة معينة.
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="mb-3">Last 7 Days (Hours)</Card.Title>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="hours" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <small className="text-muted">
                لو مفيش سجلات في الأيام دي هتشوف ساعات = 0.
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-3 mt-1">
  <Col lg={6}>
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title className="mb-3">Top Late Employees</Card.Title>
        <TopLateTable rows={topLate} />
        <small className="text-muted d-block mt-2">Based on selected date range.</small>
      </Card.Body>
    </Card>
  </Col>

  <Col lg={6}>
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title className="mb-3">Top Overtime Employees</Card.Title>
        <TopOvertimeTable rows={topOvertime} />
        <small className="text-muted d-block mt-2">Based on selected date range.</small>
      </Card.Body>
    </Card>
  </Col>
</Row>


    </Container>
  );
}
