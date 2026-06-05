import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import RoutesPage from "@/pages/Routes";
import Stations from "@/pages/Stations";
import Tasks from "@/pages/Tasks";
import TaskDetail from "@/pages/TaskDetail";
import Shifts from "@/pages/Shifts";
import Customer from "@/pages/Customer";
import Settlement from "@/pages/Settlement";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="stations" element={<Stations />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="shifts" element={<Shifts />} />
          <Route path="customer" element={<Customer />} />
          <Route path="settlement" element={<Settlement />} />
        </Route>
      </Routes>
    </Router>
  );
}
