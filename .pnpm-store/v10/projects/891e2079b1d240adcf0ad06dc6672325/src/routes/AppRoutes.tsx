import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Activity from "@/pages/home/Activity";
import Dashboard from "@/pages/home/dashboard/Dashboard";
import Incident from "@/pages/home/Incident";
import NotFound from "@/pages/NotFound";
import Unauthorize from "@/pages/Unauthorized";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicRoute } from "@/routes/PublicRoute";
import React from "react";
import { Routes, Route } from "react-router-dom";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route
          index
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="*" element={<Unauthorize />} />
      </Route>

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="incidents" element={<Incident />} />
        <Route path="activity" element={<Activity />} />
        <Route path="*" element={<Unauthorize />} />
      </Route>

      <Route path="unauthorized" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;