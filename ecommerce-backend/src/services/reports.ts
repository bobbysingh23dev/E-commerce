import * as reportModel from "../models/reports";

export async function getSummary() {
  // Run all the report queries in parallel (they're independent).
  const [overview, counts, byStatus, topProducts, bestSellers] =
    await Promise.all([
      reportModel.getOverview(),
      reportModel.getCounts(),
      reportModel.getOrdersByStatus(),
      reportModel.getTopProducts(5),
      reportModel.getBestSellerPerCategory(),
    ]);

  // Reshape the status rows into a tidy object: { pending: 5, cancelled: 2 }.
  const ordersByStatus: Record<string, number> = {};
  for (const row of byStatus) ordersByStatus[row.status] = row.count;

  return {
    overview: {
      totalRevenue: overview.total_revenue,
      orderCount: overview.order_count,
      avgOrderValue: overview.avg_order_value,
      productCount: counts.product_count,
      customerCount: counts.customer_count,
    },
    ordersByStatus,
    topProducts: topProducts.map((p) => ({
      id: p.id,
      name: p.name,
      unitsSold: p.units_sold,
      revenue: p.revenue,
    })),
    bestSellerPerCategory: bestSellers,
  };
}
