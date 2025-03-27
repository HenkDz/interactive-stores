import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboard } from '../../pages/admin/Dashboard';

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboard,
  beforeLoad: () => {
    // Here you could add protection to check if the user is authenticated
    // For now, we'll just implement a simple page with no authentication check
  },
}); 