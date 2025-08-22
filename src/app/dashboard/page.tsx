// src/app/dashboard/calendar/page.tsx
'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import AppointmentCalendar from '@/components/calendar/AppointmentCalendar';

export default function CalendarPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <AppointmentCalendar />
      </div>
    </AuthGuard>
  );
}