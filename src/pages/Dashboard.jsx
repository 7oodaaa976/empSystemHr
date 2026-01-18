import React, { useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Stack } from "react-bootstrap";
import { load } from "../utils/storage";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import TopOvertimeTable from "../components/TopOvertimeTable";
import TopLateTable from "../components/TopLateTable";

// ===================== Helpers =====================
function toDateTime(date, time) {
  if (!date || !time) return null;
  const dt = new Date(`${date}T${time}:00`);
  return isNaN(dt.getTime()) ? null : dt;
}

function calcLateMinutes(date, checkIn, start = "09:00") {
  const inTime = toDateTime(date, checkIn);
  const startTime = toDateTime(date, start);
  if (!inTime || !startTime) return 0;

  const diffMin = Math.floor((inTime - startTime) / 60000);
  return diffMin > 0 ? diffMin : 0;
}

function calcTotalMinutes(date, checkIn, checkOut) {
  const inTime = toDateTime(date, checkIn);
  const outTime = toDateTime(date, checkOut);
  if (!inTime || !outTime) return 0;

  const diffMin = Math.floor((outTime - inTime) / 60000);
  return diffMin > 0 ? diffMin : 0;
}

function calcOvertimeMinutes(totalMinutes, requiredMinutes = 8 * 60) {
  const diff = (totalMinutes || 0) - requiredMinutes;
  return diff > 0 ? diff : 0;
}
// ===================================================

export default function Dashboard() {
  const [emps] = useState(() => load("emps", []));
  const [attendance] = useState(() => load("attendance", []));

  const [from, setFrom] = useState(""); 
  const [to, setTo] = useState(""); 

  const filteredAttendance = useMemo(() => {
    return attendance.filter((r) => {
      const okFrom = from ? r.date >= from : true;
      const okTo = to ? r.date <= to : true;
      return okFrom && okTo;
    });
  }, [attendance, from, to]);

  const computedAttendance = useMemo(() => {
    return filteredAttendance.map((r) => {
      const checkIn = r.checkIn ?? r.inTime ?? r.in ?? "";
      const checkOut = r.checkOut ?? r.outTime ?? r.out ?? "";

      const totalMinutes =
        Number(r.totalMinutes ?? 0) || calcTotalMinutes(r.date, checkIn, checkOut);

      const lateMinutes =
        Number(r.lateMinutes ?? 0) || calcLateMinutes(r.date, checkIn, "09:00");

      const overtimeMinutes =
        Number(r.overtimeMinutes ?? 0) || calcOvertimeMinutes(totalMinutes, 8 * 60);

      return {
        ...r,
        checkIn,
        checkOut,
        totalMinutes,
        lateMinutes,
        overtimeMinutes,
      };
    });
  }, [filteredAttendance]);

  const summary = useMemo(() => {
    const totalMinutes = computedAttendance.reduce((s, r) => s + (r.totalMinutes || 0), 0);
    const lateMinutes = computedAttendance.reduce((s, r) => s + (r.lateMinutes || 0), 0);
    const overtimeMinutes = computedAttendance.reduce(
      (s, r) => s + (r.overtimeMinutes || 0),
      0
    );

    return {
      employees: emps.length,
      records: computedAttendance.length,
      totalHours: +((totalMinutes / 60).toFixed(2)),
      lateMinutes,
      overtimeMinutes,
    };
  }, [computedAttendance, emps.length]);

  const hoursByEmp = useMemo(() => {
    const map = new Map(); 
    for (const r of computedAttendance) {
      map.set(r.empId, (map.get(r.empId) || 0) + (r.totalMinutes || 0));
    }
    return emps
      .map((e) => ({
        name: e.name,
        hours: +(((map.get(e.id) || 0) / 60).toFixed(2)),
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [computedAttendance, emps]);

  const topLate = useMemo(() => {
    const map = new Map(); 

    for (const r of computedAttendance) {
      const late = Number(r.lateMinutes || 0);

      if (!map.has(r.empId)) map.set(r.empId, { lateMinutes: 0, lateDays: 0 });
      const obj = map.get(r.empId);

      obj.lateMinutes += late;
      if (late > 0) obj.lateDays += 1;
    }

    return emps
      .map((e) => {
        const x = map.get(e.id) || { lateMinutes: 0, lateDays: 0 };
        return {
          empId: e.id,
          name: e.name,
          job: e.job,
          lateMinutes: x.lateMinutes,
          lateDays: x.lateDays,
        };
      })
      .filter((x) => x.lateMinutes > 0)
      .sort((a, b) => b.lateMinutes - a.lateMinutes)
      .slice(0, 5);
  }, [computedAttendance, emps]);
// overtime
  const topOvertime = useMemo(() => {
    const map = new Map(); 

    for (const r of computedAttendance) {
      const ot = Number(r.overtimeMinutes || 0);

      if (!map.has(r.empId)) map.set(r.empId, { overtimeMinutes: 0, otDays: 0 });
      const obj = map.get(r.empId);

      obj.overtimeMinutes += ot;
      if (ot > 0) obj.otDays += 1;
    }

    return emps
      .map((e) => {
        const x = map.get(e.id) || { overtimeMinutes: 0, otDays: 0 };
        return {
          empId: e.id,
          name: e.name,
          job: e.job,
          overtimeMinutes: x.overtimeMinutes,
          otDays: x.otDays,
        };
      })
      .filter((x) => x.overtimeMinutes > 0)
      .sort((a, b) => b.overtimeMinutes - a.overtimeMinutes)
      .slice(0, 5);
  }, [computedAttendance, emps]);

  const last7Days = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push(iso);
    }

    const byDate = new Map();
    for (const r of computedAttendance) {
      byDate.set(r.date, (byDate.get(r.date) || 0) + (r.totalMinutes || 0));
    }

    return days.map((date) => ({
      date,
      hours: +(((byDate.get(date) || 0) / 60).toFixed(2)),
    }));
  }, [computedAttendance]);

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
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
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
             
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* TABLES */}
      <Row className="g-3 mt-1">
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="mb-3">Top Late Employees</Card.Title>
              <TopLateTable rows={topLate} />
              <small className="text-muted d-block mt-2">
                Based on selected date range. (Start time: 09:00)
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="mb-3">Top Overtime Employees</Card.Title>
              <TopOvertimeTable rows={topOvertime} />
              <small className="text-muted d-block mt-2">
                Based on selected date range.
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
