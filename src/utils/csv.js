export function exportToCSV(filename, rows) {
  if (!rows?.length) return;

  const headers = Object.keys(rows[0]);

  const escapeVal = (v) => {
    const s = String(v ?? "");
    const escaped = s.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const csv =
    [headers.join(","), ...rows.map(r => headers.map(h => escapeVal(r[h])).join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
