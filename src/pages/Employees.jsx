import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Stack } from "react-bootstrap";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeEditModal from "../components/EmployeeEditModal";
import PaginationBar from "../components/PaginationBar";
import { load, save } from "../utils/storage";

export default function Employees() {
  const [emps, setEmps] = useState(() => load("emps", []));
  const [search, setSearch] = useState("");
  const [sortSalary, setSortSalary] = useState("none"); // none | asc | desc
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => save("emps", emps), [emps]);

  function addEmp(emp) {
    setEmps(prev => [emp, ...prev]);
    setPage(1);
  }

  function deleteEmp(id) {
    setEmps(prev => prev.filter(e => e.id !== id));
  }

  function openEdit(emp) {
    setSelectedEmp(emp);
    setShowEdit(true);
  }

  function updateEmp(updated) {
    setEmps(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    setShowEdit(false);
    setSelectedEmp(null);
  }

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = emps.filter(e =>
      [e.name, e.job].some(v => String(v).toLowerCase().includes(q))
    );

    if (sortSalary === "asc") list.sort((a, b) => a.salary - b.salary);
    if (sortSalary === "desc") list.sort((a, b) => b.salary - a.salary);

    return list;
  }, [emps, search, sortSalary]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));

  useEffect(() => {
    // لو البحث قلّل النتائج بحيث الصفحة الحالية بقت خارج الرينج
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page]);

  return (
    <Container className="py-4">
      <Row className="g-3">
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Add Employee</Card.Title>
              <EmployeeForm onAdd={addEmp} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Stack direction="horizontal" className="mb-3 gap-2 flex-wrap">
                <h5 className="mb-0">Employees</h5>

                <div className="ms-auto d-flex gap-2 flex-wrap">
                  <Form.Control
                    style={{ minWidth: 220 }}
                    placeholder="Search name / job..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />

                  <Form.Select
                    style={{ width: 170 }}
                    value={sortSalary}
                    onChange={(e) => setSortSalary(e.target.value)}
                  >
                    <option value="none">Sort Salary: None</option>
                    <option value="asc">Salary: Low → High</option>
                    <option value="desc">Salary: High → Low</option>
                  </Form.Select>

                  <Button
                    variant="outline-secondary"
                    onClick={() => { setSearch(""); setSortSalary("none"); setPage(1); }}
                  >
                    Reset
                  </Button>
                </div>
              </Stack>

              <EmployeeTable
                emps={paged}
                onDelete={deleteEmp}
                onEdit={openEdit}
              />

              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  Showing {paged.length} of {filteredSorted.length}
                </small>

                <PaginationBar
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <EmployeeEditModal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        emp={selectedEmp}
        onSave={updateEmp}
      />
    </Container>
  );
}
