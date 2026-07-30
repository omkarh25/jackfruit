"use client";

export interface ProgramItem {
  id: string;
  title: string;
  category: "workshop" | "service" | "consultation" | "course" | "membership";
  date: string; // event date/time (may be "")
  regDate: string; // registration date ISO (may be "")
  amount?: number; // in paise
  meetingLink?: string;
  status: "Upcoming" | "In Progress" | "Completed" | "Cancelled";
}

const CATEGORY_LABELS: Record<ProgramItem["category"], string> = {
  workshop: "Workshop",
  service: "Service",
  consultation: "1:1 Consultation",
  course: "Course",
  membership: "Membership",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusBadge(status: ProgramItem["status"]) {
  switch (status) {
    case "Upcoming":
      return "bg-amber-100 text-amber-700";
    case "In Progress":
      return "bg-blue-100 text-blue-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

export function MyPrograms({ items }: { items: ProgramItem[] }) {
  const current = items.filter((i) => i.status === "Upcoming" || i.status === "In Progress");
  const past = items.filter((i) => i.status === "Completed" || i.status === "Cancelled");

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="font-serif text-xl font-bold text-tattvam-purple-900">My Programs</h2>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-tattvam-purple-400">
          No registrations yet. Explore our{" "}
          <a href="/services" className="text-tattvam-purple-600 underline">
            services
          </a>{" "}
          to get started.
        </p>
      ) : (
        <>
          {[
            { label: "Current", list: current },
            { label: "Past", list: past },
          ].map(
            (group) =>
              group.list.length > 0 && (
                <div key={group.label} className="mt-4">
                  <h3 className="text-sm font-semibold text-tattvam-purple-800">
                    {group.label} ({group.list.length})
                  </h3>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.list.map((item) => (
                      <div key={item.id} className="rounded-xl bg-tattvam-purple-50 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-tattvam-purple-800">{item.title}</p>
                          <span className="shrink-0 rounded-full bg-tattvam-gold-100 px-2 py-0.5 text-[10px] font-bold text-tattvam-gold-700">
                            {CATEGORY_LABELS[item.category]}
                          </span>
                        </div>
                        {item.date && (
                          <p className="mt-1 text-xs text-tattvam-purple-600">
                            📅 {formatDate(item.date)}
                          </p>
                        )}
                        {item.regDate && (
                          <p className="mt-0.5 text-xs text-tattvam-purple-500">
                            Registered {formatDate(item.regDate)}
                          </p>
                        )}
                        {item.amount != null && (
                          <p className="mt-0.5 text-xs font-medium text-tattvam-purple-700">
                            ₹{(item.amount / 100).toLocaleString("en-IN")}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusBadge(item.status)}`}
                          >
                            {item.status}
                          </span>
                          {item.meetingLink && item.status !== "Completed" && item.status !== "Cancelled" && (
                            <a
                              href={item.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg bg-tattvam-purple-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-tattvam-purple-700"
                            >
                              Join Meeting ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </>
      )}
    </div>
  );
}
