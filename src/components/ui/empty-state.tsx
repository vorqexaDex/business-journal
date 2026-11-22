import type { ReactNode } from "react";
import { Card } from "./card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

// The dashed border signals "nothing here yet" and invites an action.
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center border-dashed px-6 py-14 text-center">
      <h2 className="text-ink text-base font-semibold">{title}</h2>
      <p className="text-muted mt-1 max-w-sm text-sm">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
