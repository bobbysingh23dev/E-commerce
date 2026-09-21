import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import ProductFormPage from "./pages/admin/ProductFormPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";

// Providers wrap the Router so every page + the nav can call useAuth()/useCart().
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              {/* Public */}
              <Route index element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="cart" element={<CartPage />} />

              {/* Requires login — ProtectedRoute redirects to /login if not */}
              <Route
                path="account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin only — AdminRoute redirects non-admins away */}
              <Route
                path="admin/products"
                element={
                  <AdminRoute>
                    <AdminProductsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/products/new"
                element={
                  <AdminRoute>
                    <ProductFormPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/products/:id/edit"
                element={
                  <AdminRoute>
                    <ProductFormPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/categories"
                element={
                  <AdminRoute>
                    <AdminCategoriesPage />
                  </AdminRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
