import { Container, Navbar, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import logo from "../../public/syslogo.png"
export default function NavbarApp() {
  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? "active fw-bold" : ""}`;

  return (
    <Navbar bg="danger" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={NavLink} to="/employees">
          <img src={logo} width={100} alt="" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto gap-2">
            <NavLink to="/employees" className={linkClass}>
              Employees
            </NavLink>
            <NavLink to="/attendance" className={linkClass}>
              Attendance
            </NavLink>
            <NavLink to="/reports" className={linkClass}>
              Reports
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
  Dashboard
</NavLink>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
