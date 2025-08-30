import { clsx } from "../formats";

export function Th({ label, onClick, active, dir, align = "left" }: {
    label: string;
    onClick: () => void;
    active: boolean;
    dir: "asc" | "desc";
    align?: "left" | "right";
  }) {
    const arrow = active ? (dir === "asc" ? "▲" : "▼") : "↕";
    return (
      <th
        onClick={onClick}
        className={clsx(
          "sticky top-0 z-10 select-none whitespace-nowrap px-4 py-3 text-xs font-semibold tracking-wide text-zinc-600",
          "bg-zinc-50/90 backdrop-blur supports-[backdrop-filter]:bg-zinc-50/60",
          "cursor-pointer",
          align === "right" ? "text-right" : "text-left"
        )}
        scope="col"
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <span className="text-zinc-400">{arrow}</span>
        </span>
      </th>
    );
  }
  