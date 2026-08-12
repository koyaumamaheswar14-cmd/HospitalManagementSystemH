import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import ManageAppointments from "./pages/ManageAppointments";
import ViewPatients from "./pages/ViewPatients";
import PatientDetails from "./pages/PatientDetails";
import BookAppointment from "./pages/BookAppointment";
import TrackAppointment from "./pages/TrackAppointment";
import Doctors from "./pages/Doctors";
import PatientPayments from "./pages/PatientPayments";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login / Signup */}
        <Route
          path="/"
          element={<Auth />}
        />

        {/* Doctor Dashboard */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Doctor Manage Appointments */}
        <Route
          path="/doctor/:doctorName/manage"
          element={
            <ProtectedRoute allowedRole="doctor">
              <ManageAppointments />
            </ProtectedRoute>
          }
        />

        {/* Doctor View Patients */}
        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRole="doctor">
              <ViewPatients />
            </ProtectedRoute>
          }
        />

        {/* Patient Details */}
        <Route
          path="/patient/:id"
          element={
            <ProtectedRoute allowedRole="doctor">
              <PatientDetails />
            </ProtectedRoute>
          }
        />

        {/* Patient Dashboard */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Book Appointment */}
        <Route
          path="/book-appointment"
          element={
            <ProtectedRoute allowedRole="patient">
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        {/* Track Appointment */}
        <Route
          path="/track-appointment"
          element={
            <ProtectedRoute allowedRole="patient">
              <TrackAppointment />
            </ProtectedRoute>
          }
        />

        {/* Doctors */}
        <Route
          path="/doctors"
          element={
            <ProtectedRoute allowedRole="patient">
              <Doctors />
            </ProtectedRoute>
          }
        />

        {/* Patient Payments */}
        <Route
          path="/patient-payments"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientPayments />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}