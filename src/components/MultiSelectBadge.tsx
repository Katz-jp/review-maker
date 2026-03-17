import { CheckSquare2 } from "lucide-react";

export function MultiSelectBadge({
  children = "複数選択OK",
}: {
  children?: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 ring-1 ring-primary/25 shadow-sm">
      <CheckSquare2 className="w-4 h-4 text-primary" aria-hidden="true" />
      <span className="text-sm font-semibold tracking-wide text-gray-900">
        {children}
      </span>
    </div>
  );
}
