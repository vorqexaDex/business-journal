import { requireBusinessAccess } from "@/modules/businesses";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { business, role } = await requireBusinessAccess();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">{business.name}</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {business.currency} · {business.timezone} · {role.toLowerCase()}
      </p>
      <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
        Your revenue, profit and stock will appear here.
      </p>
    </main>
  );
}
