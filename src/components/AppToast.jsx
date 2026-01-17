import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";

export default function AppToast({ show, onClose, title = "Done", message = "", delay = 2500 }) {
  return (
    <ToastContainer position="bottom-end" className="p-3">
      <Toast show={show} onClose={onClose} delay={delay} autohide>
        <Toast.Header>
          <strong className="me-auto">{title}</strong>
          <small>now</small>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
