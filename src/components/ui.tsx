// Shared dashboard pieces. Styles live in app/globals.css; every page uses these so the house looks like one house.
import type { ReactNode } from "react";

export function PageHead({ title, quip, children }: { title: string; quip?: string; children?: ReactNode }) {
  return (
    <header className="page-head row">
      <div>
        <h1>{title}</h1>
        {quip && <p className="quip">{quip}</p>}
      </div>
      {children && <><span className="spacer" />{children}</>}
    </header>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <b>{title}</b>
      {children}
    </div>
  );
}

export function NoHousehold() {
  return (
    <div className="card">
      <Empty title="Nobody's home.">
        Add Kevin to a Telegram group and say hi, or run <code>npm run seed</code>.
      </Empty>
    </div>
  );
}
