import { createFileRoute } from '@tanstack/react-router';
import InitKV from '../../pages/admin/InitKV';

export const Route = createFileRoute('/admin/init-kv')({
  component: InitKV,
}); 