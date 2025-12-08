// app.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transfer from "./pages/Transfer.jsx";
import Transactions from "./pages/Transactions.jsx";
import Profile from "./pages/Profile.jsx";
import AddMoney from "./pages/AddMoney.jsx";
import AddBeneficiary from "./pages/AddBeneficiary.jsx";
import AdminLogin from "./pages/AdminLogin";
import Sidebar from "./components/Sidebar.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminTransactions from "./pages/admin/AdminTransactions.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminSuspicious from "./pages/admin/AdminSuspicious.jsx";


// 🔒 USER PROTECTED ROUTE
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

// 🔓 PUBLIC ROUTE
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" /> : children;
};

// 🧭 USER LAYOUT (Sidebar)
function UserLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full p-6">{children}</div>
    </div>
  );
}

// 🔐 ADMIN PROTECTED ROUTE
const AdminProtected = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (role !== "admin") return <Navigate to="/dashboard" />;

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ROOT */}
        <Route
          path="/"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/dashboard" />
              : <Navigate to="/login" />
          }
        />

        {/* ------- PUBLIC ROUTES ------- */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* ADMIN LOGIN PAGE (must be outside admin layout) */}
        <Route path="/admin-login" element={<AdminLogin />} />


        {/* ------- USER ROUTES (WITH SIDEBAR) ------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout><Dashboard /></UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-money"
          element={
            <ProtectedRoute>
              <UserLayout><AddMoney /></UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <UserLayout><Transfer /></UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <UserLayout><Transactions /></UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserLayout><Profile /></UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-beneficiary"
          element={
            <ProtectedRoute>
              <UserLayout><AddBeneficiary /></UserLayout>
            </ProtectedRoute>
          }
        />


        {/* ------- ADMIN ROUTES (SIDEBAR + PROTECTED) ------- */}
        <Route
          path="/admin/*"
          element={
            <AdminProtected>
              <AdminLayout />
            </AdminProtected>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="suspicious" element={<AdminSuspicious />} />
        </Route>

      </Routes>
    </Router>
  );
}
