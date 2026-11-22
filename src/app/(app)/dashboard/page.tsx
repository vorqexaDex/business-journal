import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireBusinessAccess } from "@/modules/businesses";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { business, role } = await requireBusinessAccess();
  const place = business.city ? `${business.city}. ` : "";

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 p-6">
      <PageHeader
        title={business.name}
        description={`${place}Amounts in ${business.currency}, times in ${business.timezone}. Your role: ${role.toLowerCase()}.`}
      />
      <EmptyState
        title="No sales yet"
        description="Record your first sale and your revenue, profit and top products will show up here."
      />
    </main>
  );
}
