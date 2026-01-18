import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Stack, Alert } from "react-bootstrap";
import { load, save } from "../utils/storage";

import AttendanceForm from "../components/AttendanceForm";
import AttendanceTable from "../components/AttendanceTable";
import AttendanceEditModal from "../components/AttendanceEditModal";
import ConfirmModal from "../components/ConfirmModal";
import AppToast from "../components/AppToast";
import { Link } from "react-router-dom";

export default function Attendance() {
    const [emps] = useState(() => load("emps", []));
    const [attendance, setAttendance] = useState(() => load("attendance", []));

    // Filters
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    // Edit modal
    const [showEdit, setShowEdit] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Confirm delete
    const [showConfirm, setShowConfirm] = useState(false);
    const [toDeleteId, setToDeleteId] = useState(null);

    // Toast
    const [toast, setToast] = useState({ show: false, title: "", message: "" });
    function fireToast(title, message) {
        setToast({ show: true, title, message });
    }

    useEffect(() => save("attendance", attendance), [attendance]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        return attendance.filter(r => {
            const emp = emps.find(e => e.id === r.empId);
            const empName = emp?.name?.toLowerCase() || "";
            const empJob = emp?.job?.toLowerCase() || "";

            const matchSearch =
                empName.includes(q) || empJob.includes(q) || String(r.date).includes(q);

            const matchDate = dateFilter ? r.date === dateFilter : true;

            return matchSearch && matchDate;
        });
    }, [attendance, search, dateFilter, emps]);

    const summary = useMemo(() => {
        const totalMinutes = filtered.reduce((s, r) => s + (r.totalMinutes || 0), 0);
        const lateMinutes = filtered.reduce((s, r) => s + (r.lateMinutes || 0), 0);
        const overtimeMinutes = filtered.reduce((s, r) => s + (r.overtimeMinutes || 0), 0);

        return {
            totalHours: (totalMinutes / 60).toFixed(2),
            lateMinutes,
            overtimeMinutes,
        };
    }, [filtered]);

    function openEdit(rec) {
        setSelectedRecord(rec);
        setShowEdit(true);
    }

    function updateRecord(updated) {
        setAttendance(prev => prev.map(r => (r.id === updated.id ? updated : r)));
        setShowEdit(false);
        setSelectedRecord(null);
        fireToast("Updated", "Attendance record updated successfully.");
    }

    function askDelete(id) {
        setToDeleteId(id);
        setShowConfirm(true);
    }

    function confirmDelete() {
        setAttendance(prev => prev.filter(r => r.id !== toDeleteId));
        setShowConfirm(false);
        setToDeleteId(null);
        fireToast("Deleted", "Attendance record has been deleted.");
    }

    if (!emps.length) {
        return (
            <Container className="py-4">
                <Alert variant="warning" className="mb-0">
                   You must add Employess first  <Link className="text-decoration-none fw-bold" to={"/employees"}>here</Link>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Row className="g-3">
                <Col lg={4}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title className="mb-3">Attendance تسجيل حضور/انصراف</Card.Title>
                            <AttendanceForm
                                emps={emps}
                                attendance={attendance}
                                setAttendance={setAttendance}
                                onAdded={() => fireToast("Saved", "Attendance record saved successfully.")}
                            />
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Stack direction="horizontal" className="mb-3 gap-2 flex-wrap">
                                <h5 className="mb-0">Records</h5>

                                <div className="ms-auto d-flex gap-2 flex-wrap">
                                    <Form.Control
                                        style={{ minWidth: 220 }}
                                        placeholder="Search name / job / date..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />

                                    <Form.Control
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        title="Filter by date"
                                    />

                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => { setSearch(""); setDateFilter(""); }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </Stack>

                            <Row className="g-2 mb-3">
                                <Col md={4}>
                                    <Card className="shadow-sm">
                                        <Card.Body className="py-2">
                                            <small className="text-muted">Total Hours</small>
                                            <div className="fw-bold fs-5">{summary.totalHours} h</div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={4}>
                                    <Card className="shadow-sm">
                                        <Card.Body className="py-2">
                                            <small className="text-muted">Total Late</small>
                                            <div className="fw-bold fs-5 text-danger">{summary.lateMinutes} min</div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={4}>
                                    <Card className="shadow-sm">
                                        <Card.Body className="py-2">
                                            <small className="text-muted">Total Overtime</small>
                                            <div className="fw-bold fs-5 text-success">{summary.overtimeMinutes} min</div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <AttendanceTable
                                records={filtered}
                                emps={emps}
                                onDelete={askDelete}
                                onEdit={openEdit}
                            />

                            <small className="text-muted d-block mt-3">
                                Total records: {filtered.length}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <AttendanceEditModal
                show={showEdit}
                onHide={() => { setShowEdit(false); setSelectedRecord(null); }}
                record={selectedRecord}
                emps={emps}
                allRecords={attendance}
                onSave={updateRecord}
            />

            <ConfirmModal
                show={showConfirm}
                onHide={() => { setShowConfirm(false); setToDeleteId(null); }}
                title="Delete Record"
                message="Are you sure you want to delete this attendance record?"
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={confirmDelete}
            />

            <AppToast
                show={toast.show}
                title={toast.title}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </Container>
    );
}
