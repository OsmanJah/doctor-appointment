import { Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from 'react';
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const SignUp = lazy(() => import("../pages/Signup"));
const Doctors = lazy(() => import("../pages/Doctors/Doctors"));
const MyAccount = lazy(() => import("../Dashboard/User-Account/MyAccount"));
const Pharmacy = lazy(() => import("../pages/Pharmacy"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutSuccess = lazy(() => import("../pages/CheckoutSuccess"));

const Dashboard = lazy(() => import("../Dashboard/Doctor-Account/Dashboard"));
import ProtectedRoute from "./ProtectedRoute";
const DoctorDetails = lazy(() => import("../pages/Doctors/DoctorDetails"));

function RouteFallback() {
  return (
    <div className="p-4">
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

const Router = () => {
  return (
    <Suspense fallback={<RouteFallback />}> 
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/doctors/:id" element={<DoctorDetails />} />
      <Route path="/pharmacy" element={<Pharmacy />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout-success" element={<CheckoutSuccess />} />
      <Route
        path="/users/profile/me"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <MyAccount />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors/profile/me"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<SignUp />} />
    </Routes>
    </Suspense>
  );
};

export default Router;
