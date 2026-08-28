export function DashboardSectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
      <div className="mt-6 min-h-72 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        Content for this section will be added next.
      </div>
    </div>
  );
}
