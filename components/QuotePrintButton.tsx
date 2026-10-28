"use client";
export function QuotePrintButton() {
  return <button type="button" onClick={() => window.print()} className="offer-print-button">
    <span aria-hidden="true">↓</span> حفظ نسخة PDF
  </button>;
}
