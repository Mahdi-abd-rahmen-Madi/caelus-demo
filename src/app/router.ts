import { lazy } from 'react';

// Lazy load pages to reduce initial bundle size
export const Dashboard = lazy(() => import('../features/dashboard/components/Dashboard'));
