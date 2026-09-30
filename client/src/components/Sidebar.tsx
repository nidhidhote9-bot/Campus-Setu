import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  IndianRupee,
  Receipt,
  Building,
  Bus,
  Library,
  Briefcase,
  Users2,
  HeartHandshake,
  MessageSquareWarning,
  Bell,
  AlertTriangle,
  Settings,
  ShieldCheck,
  FileText,
  Box
} from 'lucide-react';
import { UserRole } from '@shared/index';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  if (!user) return null;

  const links = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, roles: [] },
    { to: '/admin/institutions', label: t('institutions'), icon: Building2, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { to: '/app/admissions/apply', label: 'Admissions Wizard', icon: UserCheck, roles: [] },
    { to: '/app/admissions/review', label: 'Admissions Review Queue', icon: UserCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ADMISSIONS_OFFICER] },
    { to: '/app/admissions/imports', label: 'CSV Admissions Imports', icon: UserCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ADMISSIONS_OFFICER] },
    { to: '/app/admissions/enrollment', label: 'Enrollment Registry', icon: UserCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ADMISSIONS_OFFICER] },
    { to: '/app/students/overview', label: 'Student Directory & 360', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY, UserRole.FINANCE, UserRole.STUDENT] },
    { to: '/app/students/profile', label: 'Profile & Locker', icon: Users, roles: [] },
    { to: '/app/students/lifecycle', label: 'Lifecycle & Clearance', icon: GraduationCap, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY] },
    { to: '/app/students/alumni', label: 'Alumni Network', icon: Users2, roles: [] },
    { to: '/app/timetable/calendar', label: 'Academic Timetable', icon: Calendar, roles: [] },
    { to: '/app/timetable/editor', label: 'Schedule & Conflict Editor', icon: Calendar, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { to: '/app/timetable/reschedule', label: 'Reschedule Workflow', icon: Calendar, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY] },
    { to: '/app/timetable/events', label: 'Academic Events & Holidays', icon: Calendar, roles: [] },
    { to: '/app/attendance/capture', label: 'Roster Attendance Capture', icon: ClipboardCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY] },
    { to: '/app/attendance/corrections', label: 'Corrections & Bulk Upload', icon: ClipboardCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY] },
    { to: '/app/attendance/my-attendance', label: 'My Course Attendance', icon: ClipboardCheck, roles: [] },
    { to: '/app/attendance/reports', label: 'Attendance Analytics & Reports', icon: ClipboardCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY] },
    { to: '/exams/schedule', label: 'Exam Schedule', icon: GraduationCap, roles: [] },
    { to: '/exams/marks', label: 'Gradebook Marks Entry', icon: GraduationCap, roles: [UserRole.FACULTY, UserRole.ADMIN] },
    { to: '/app/exam-applications/cycles', label: 'Exam Cycles & Policy', icon: Calendar, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { to: '/app/exam-applications/apply', label: 'Exam Paper Registration', icon: FileText, roles: [] },
    { to: '/app/exam-applications/review', label: 'Exam Review Queue', icon: ShieldCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY] },
    { to: '/app/exam-applications/hall-tickets', label: 'Exam Hall Tickets', icon: GraduationCap, roles: [] },
    { to: '/app/exam-operations/schedule', label: 'Exam Timetable Builder', icon: Calendar, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { to: '/app/exam-operations/centers', label: 'Centers & Room Allocation', icon: Building, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { to: '/app/exam-operations/invigilators', label: 'Invigilation Duty Roster', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY] },
    { to: '/app/exam-operations/materials', label: 'Answer Books & Materials', icon: Box, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { to: '/app/finance/my-fees', label: 'Student Invoices & Payments', icon: IndianRupee, roles: [UserRole.STUDENT, UserRole.GUARDIAN, UserRole.FINANCE, UserRole.ADMIN] },
    { to: '/app/finance/rules', label: 'Fee Structures & Policy', icon: Receipt, roles: [UserRole.FINANCE, UserRole.ADMIN] },
    { to: '/app/finance/reconciliation', label: 'Finance & Reconciliation', icon: Receipt, roles: [UserRole.FINANCE, UserRole.ADMIN] },
    { to: '/app/finance/concessions', label: 'Scholarships & Concessions', icon: ShieldCheck, roles: [UserRole.FINANCE, UserRole.ADMIN] },
    { to: '/finance/payroll', label: t('payroll'), icon: IndianRupee, roles: [UserRole.FINANCE, UserRole.ADMIN] },
    { to: '/facilities/hostel', label: t('hostel'), icon: Building, roles: [] },
    { to: '/facilities/transport', label: t('transport'), icon: Bus, roles: [] },
    { to: '/facilities/library', label: t('library'), icon: Library, roles: [] },
    { to: '/placement/drives', label: t('placement'), icon: Briefcase, roles: [] },
    { to: '/guardian/dashboard', label: t('guardian'), icon: HeartHandshake, roles: [UserRole.GUARDIAN, UserRole.ADMIN] },
    { to: '/support/grievances', label: t('grievances'), icon: MessageSquareWarning, roles: [] },
    { to: '/notices', label: t('notices'), icon: Bell, roles: [] },
    { to: '/analytics/risk', label: t('aiRisk'), icon: AlertTriangle, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY] },
    { to: '/admin/system', label: t('systemAdmin'), icon: Settings, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
  ];

  const filteredLinks = links.filter(link => {
    if (link.roles.length === 0) return true;
    if (user.role === UserRole.SUPER_ADMIN) return true;
    return link.roles.includes(user.role);
  });

  return (
    <aside className="sidebar">
      <div style={{ padding: '0 8px 12px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Portal Navigation
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
