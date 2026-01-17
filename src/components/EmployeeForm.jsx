import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

export default function EmployeeForm({ onAdd }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { name: "", job: "", salary: "", workHoursPerDay: 8 },
    mode: "onBlur"
  });

  function onSubmit(values) {
    const emp = {
      id: crypto.randomUUID(),
      name: values.name.trim(),
      job: values.job.trim(),
      salary: Number(values.salary),
      workHoursPerDay: Number(values.workHoursPerDay),
    };
    onAdd(emp);
    reset();
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-2">
      <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control
          placeholder="Employee name"
          {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 chars" } })}
          isInvalid={!!errors.name}
        />
        <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group>
        <Form.Label>Job</Form.Label>
        <Form.Control
          placeholder="Job title"
          {...register("job", { required: "Job is required" })}
          isInvalid={!!errors.job}
        />
        <Form.Control.Feedback type="invalid">{errors.job?.message}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group>
        <Form.Label>Salary</Form.Label>
        <Form.Control
          type="number"
          placeholder="EGP"
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

      <Button type="submit" className="mt-2">Add</Button>
    </Form>
  );
}
