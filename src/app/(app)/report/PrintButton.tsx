'use client';

/** Printing is a browser capability; this is only the affordance for it. */
export function PrintButton() {
  return (
    <button className="btn btn-primary btn-sm" type="button" onClick={() => window.print()}>
      Print or save as PDF
    </button>
  );
}
