"use client"

import { Search } from "lucide-react"
import type { Resource } from "@/data/subjects"
import { typeIcons, typeLabels, typeBadgeStyle } from "@/lib/resource-ui"

interface ResourceListProps {
  subjectName: string
  // sub-subjects of the unit, shown as filter chips after "All"
  disciplines: string[]
  resources: Resource[]
  filter: string
  onFilter: (f: string) => void
  search: string
  onSearch: (s: string) => void
  selectedId: string | number | null
  onSelect: (r: Resource) => void
}

export default function ResourceList({
  subjectName,
  disciplines,
  resources,
  filter,
  onFilter,
  search,
  onSearch,
  selectedId,
  onSelect,
}: ResourceListProps) {
  return (
    <main
      className="flex h-full flex-col overflow-hidden md:border-r"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      <div className="flex flex-col gap-4 border-b p-6" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="display-serif text-2xl font-bold">{subjectName}</h2>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide tabular-nums"
            style={{ backgroundColor: "var(--bg-pane)", color: "var(--text-muted)" }}
          >
            {resources.length} items
          </span>
        </div>

        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
            style={{ backgroundColor: "var(--bg-inset)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {[{ key: "all", label: "All" }, ...disciplines.map((d) => ({ key: d, label: d }))].map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => onFilter(f.key)}
                className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-all"
                style={{
                  backgroundColor: active ? "var(--accent)" : "var(--bg-pane)",
                  color: active ? "var(--accent-contrast)" : "var(--text-muted)",
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {resources.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm italic" style={{ color: "var(--text-muted)" }}>
            No resources match your search.
          </p>
        ) : (
          resources.map((r) => {
            const Icon = typeIcons[r.type]
            const active = selectedId === r.id
            return (
              <button
                key={r.id}
                onClick={() => onSelect(r)}
                className={`resource-card flex w-full items-center justify-between gap-3 rounded-xl p-3.5 text-left ${active ? "is-active" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ ...typeBadgeStyle(r.type) }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold" style={{ color: "var(--text-main)" }}>
                      {r.cleanTitle}
                    </h4>
                    <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
                      {r.topic}
                    </p>
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                  style={{ ...typeBadgeStyle(r.type) }}
                >
                  {typeLabels[r.type]}
                </span>
              </button>
            )
          })
        )}
      </div>
    </main>
  )
}
