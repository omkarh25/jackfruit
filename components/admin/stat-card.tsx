interface StatCardProps {
  readonly title: string;
  readonly value: string;
  readonly change?: string;
  readonly changeType?: "positive" | "negative" | "neutral";
  readonly icon: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon }: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-green-600"
      : changeType === "negative"
      ? "text-red-600"
      : "text-tattvam-purple-500";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-tattvam-purple-500">{title}</p>
          <p className="mt-2 font-serif text-3xl font-bold text-tattvam-purple-900">{value}</p>
          {change ? (
            <p className={`mt-2 text-sm font-medium ${changeColor}`}>{change}</p>
          ) : null}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tattvam-purple-50 text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
