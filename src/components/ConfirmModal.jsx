import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ConfirmModal({
  show,
  onHide,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Yes",
  confirmVariant = "danger",
  onConfirm,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{message}</Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm}>{confirmText}</Button>
      </Modal.Footer>
    </Modal>
  );
}
