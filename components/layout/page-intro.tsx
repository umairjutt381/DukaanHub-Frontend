import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
};

export function PageIntro({ eyebrow, title, description, actions, className }: PageIntroProps) {
  return (
    <div className={cn("page-intro", className)}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="page-title mt-2">{title}</h1>
          <p className="page-copy mt-4">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
