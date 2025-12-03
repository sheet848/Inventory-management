import Sidebar from "@/components/ui/sidebar";
import ProductsChart from "@/components/products-chart";
import { TrendingUp } from "lucide-react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function DashboardPage() {

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  );

  // fetch key metrics for dashboard
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("price, quantity, low_stock_at");

  if (productsError || !productsData) {
    return <div>Error loading metrics</div>;
  }

  const totalProducts = productsData.length;
  const totalValue = productsData.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const lowStockCount = productsData.filter(product => product.low_stock_at !== null && product.low_stock_at !== undefined && product.quantity <= product.low_stock_at).length;

  // stock levels for top products
  const { data: topProducts, error: topError } = await supabase
    .from("products")
    .select("*") // use correct column names
    .order("updated_at", { ascending: false })
    .order("user_id", { ascending: true })
    .limit(5);

  if (topError || !topProducts) {
    return <div>Error loading stock levels</div>;
  }

  const bgColors = ["bg-red-600", "bg-yellow-600", "bg-green-600"];
  const textColors = ["text-red-600", "text-yellow-600", "text-green-600"];

  // Prepare data for inventory over time chart
  const now = new Date();
  const weeklyProductsData = [];

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekStart.setHours(23, 59, 59, 999);

    const weekLabel = `${String(weekStart.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(weekStart.getDate() + 1).padStart(2, "0")}`;

    const weekProducts = productsData.filter((product) => {
      const productDate = new Date(product.created_at);
      return productDate >= weekStart && productDate <= weekEnd;
    });

    weeklyProductsData.push({
      week: weekLabel,
      products: weekProducts.length,
    });
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/dashboard" />
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome Back! Here is an overview of the inventory.</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Key Metrics
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {totalProducts}
              </div>
              <div className="text-sm text-gray-600">Total Products</div>
              <div className="flex items-center justify-center mt-1">
                <span className="text-xs text-green-600">
                  +{totalProducts}
                </span>
                <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                ${Number(totalValue).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
              <div className="flex items-center justify-center mt-1">
                <span className="text-xs text-green-600">
                  +${Number(totalValue).toFixed(0)}
                </span>
                <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {lowStockCount}
              </div>
              <div className="text-sm text-gray-600">Low Stock</div>
              <div className="flex items-center justify-center mt-1">
                <span className="text-xs text-green-600">+{lowStockCount}</span>
                <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Over Time */}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">New products per week</h2>
          </div>
          <div className="h-48">
            <ProductsChart data={weeklyProductsData} />
          </div>
        </div>

        {/* Stock Levels */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Stock Levels
            </h2>
          </div>

          <div className="space-y-3">
            {topProducts.map((product, idx) => {
              const lowStockAt = product.low_stock_at ?? 5;
              const quantity = product.quantity ?? 0;

              const stockLevel =
                quantity === 0
                  ? 0
                  : quantity <= lowStockAt
                    ? 1
                    : 2;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${bgColors[stockLevel]}`}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {product.name}
                    </span>
                  </div>
                  <div
                    className={`text-sm font-medium ${textColors[stockLevel]}`}
                  >
                    {quantity} units
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
