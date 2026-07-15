import type { ReactNode } from "react";

type StatusNoteProps = {
  title: string;
  children: ReactNode;
};

export function StatusNote({ title, children }: StatusNoteProps) {
  return (
    <section className="status-note" aria-labelledby="status-note-title">
      <h2 id="status-note-title">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
