export const dynamic = "force-dynamic";

import DashboardProductDetail from "@/components/dashboard/product-detail";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <DashboardProductDetailPage params={params} />;
}

async function DashboardProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DashboardProductDetail productId={id} />;
}
