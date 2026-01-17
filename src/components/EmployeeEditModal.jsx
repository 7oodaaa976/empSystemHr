import React, { useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

export default function EmployeeEditModal({ show, onHide, emp, onSave }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: "", job: "", salary: "", workHoursPerDay: 8 },
    mode: "onBlur",
  });

  useEffect(() => {
    if (emp) {
      reset({
        name: emp.name,
        job: emp.job,
        salary: emp.salary,
        workHoursPerDay: emp.workHoursPerDay,
      });
    }
  }, [emp, reset]);

  function submit(values) {
    if (!emp) return;
    onSave({
      ...emp,
      name: values.name.trim(),
      job: values.job.trim(),
      salary: Number(values.salary),
      workHoursPerDay: Number(values.workHoursPerDay),
    });
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Employee</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit(submit)} className="d-flex flex-column gap-2">
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 chars" } })}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>Job</Form.Label>
            <Form.Control
              {...register("job", { required: "Job is required" })}
              isInvalid={!!errors.job}
            />
            <Form.Control.Feedback type="invalid">{errors.job?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>Salary</Form.Label>
            <Form.Control
              type="number"
              {...register("salary", { required: "Salary is required", min: { value: 0, message: "Must be >= 0" } })}
              isInvalid={!!errors.salary}
            />
            <Form.Control.Feedback type="invalid">{errors.salary?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>Work hours/day</Form.Label>
            <Form.Control
              type="number"
              {...register("workHoursPerDay", { required: true, min: 1, max: 24 })}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
