import React from "react";
import { Pagination } from "react-bootstrap";

export default function PaginationBar({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const items = [];
  for (let p = 1; p <= totalPages; p++) {
    items.push(
      <Pagination.Item key={p} active={p === page} onClick={() => onChange(p)}>
        {p}
      </Pagination.Item>
    );
  }

  return (
    <Pagination className="mb-0">
      <Pagination.Prev disabled={page === 1} onClick={() => onChange(page - 1)} />
      {items}
      <Pagination.Next disabled={page === totalPages} onClick={() => onChange(page + 1)} />
    </Pagination>
  );
}
