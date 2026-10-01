import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoadingState } from './components/BadgesAndStates';

import { LandingPage } from './pages/LandingPage';
import { AuthPages } from './pages/AuthPages';
import { DashboardShellPage } from './pages/DashboardShellPage';
import { ComponentsGalleryPage } from './pages/ComponentsGalleryPage';

import { IdentityLoginPage, MyAccountPage, UserManagementPage, AuditExplorerPage } from './pages/IdentityPages';
import { UniversityProfilePage, OrganizationHierarchyPage, PostAssignmentsPage, OrganizationSettingsPage } from './pages/OrganizationPages';
import { FormBuilderPage, FormSubmissionsPage, TranslationsPage, TemplatesAndContentPage } from './pages/FormAndContentPages';
import { AcademicCatalogPage, AssessmentSchemesPage, ElectivesPage, TeachingAssignmentsPage } from './pages/CurriculumPages';
import { ApplicantWizardPage, AdmissionsReviewQueuePage, CSVImportWizardPage, EnrollmentRegistryPage } from './pages/AdmissionsWorkflowPages';
import { StudentOverviewPage, StudentProfilePage, StudentLifecyclePage, AlumniDirectoryPage } from './pages/StudentLifecyclePages';
import { AttendanceCapturePage, AttendanceCorrectionsPage, MyAttendancePage, AttendanceReportsPage } from './pages/AttendancePages';
import { TimetableCalendarPage, TimetableEditorPage, TimetableReschedulePage, AcademicEventsPage } from './pages/TimetablePages';
import { FeeRulesPage, StudentMyFeesPage, FinanceReconciliationPage, ConcessionsPage } from './pages/FinancePages';
import { ExamCyclesPage, StudentExamApplyPage, ExamReviewQueuePage, HallTicketsPage } from './pages/ExamApplicationPages';
import { ExamSchedulePage, ExamCentersPage, InvigilatorsPage, MaterialsRegisterPage } from './pages/ExamOperationsPages';
import { AssessmentMarksPage, AssessmentImportsPage, AssessmentModerationPage, StudentMyAssessmentsPage } from './pages/AssessmentPages';
import { ResultsTabulationPage, ResultsPublicationPage, StudentMyResultsPage, ResultsReportsPage } from './pages/ResultPages';
import { RevaluationApplyPage, RevaluationAssignmentsPage, RevaluationOutcomesPage, StudentMyDecisionsPage } from './pages/RevaluationPages';
import { CertificatePages } from './pages/CertificatePages';
import { HelpdeskPages } from './pages/HelpdeskPages';
import { HostelPages } from './pages/HostelPages';
import { TransportPages } from './pages/TransportPages';
import { CommunicationPages } from './pages/CommunicationPages';
import { GuardianPages } from './pages/GuardianPages';
import { GovernancePages } from './pages/GovernancePages';
import { RegisterPages } from './pages/RegisterPages';
import { StaffPages } from './pages/StaffPages';
import { PayrollPages } from './pages/PayrollPages';
import { LibraryPages } from './pages/LibraryPages';
import { InventoryPages } from './pages/InventoryPages';
import { MISPages } from './pages/MISPages';
import { AssistantPages } from './pages/AssistantPages';
import { PredictionPages } from './pages/PredictionPages';
import { LearningPages } from './pages/LearningPages';
import { MobilePages } from './pages/MobilePages';
import { DemoOperationsPages } from './pages/DemoOperationsPages';
import { ReleaseAuditPages } from './pages/ReleaseAuditPages';



import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { UsersPage } from './pages/UsersPage';
import { AdmissionsPage, AdmissionReviewPage } from './pages/AdmissionsPage';
import { StudentDirectoryPage, StudentDetailPage } from './pages/StudentDirectoryPage';
import { CoursesPage, TimetablePage, AttendancePage } from './pages/AcademicsPages';
import { ExamsPage, GradebookPage, TranscriptsPage } from './pages/ExamsPages';
import { StudentFeePage, AdminFeePage, PayrollPage } from './pages/FeesAndPayrollPages';
import { HostelPage, TransportPage, LibraryPage } from './pages/FacilitiesPages';
import { PlacementDrivesPage, AlumniPage } from './pages/PlacementAndAlumniPages';
import { GuardianDashboardPage, GrievancePage, NoticeBoardPage } from './pages/SupportPages';
import { AIRiskPage } from './pages/AIRiskPage';
import { SystemAdminPage } from './pages/SystemAdminPage';

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingState message="Checking session token..." />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-wrapper">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/app/foundation/dashboard" element={<DashboardShellPage />} />
            <Route path="/app/foundation/components" element={<ComponentsGalleryPage />} />
            <Route path="/app/identity/my-account" element={<MyAccountPage />} />
            <Route path="/app/identity/users" element={<UserManagementPage />} />
            <Route path="/app/identity/audit" element={<AuditExplorerPage />} />
            <Route path="/app/organization/university" element={<UniversityProfilePage />} />
            <Route path="/app/organization/hierarchy" element={<OrganizationHierarchyPage />} />
            <Route path="/app/organization/post-assignments" element={<PostAssignmentsPage />} />
            <Route path="/app/organization/settings" element={<OrganizationSettingsPage />} />
            <Route path="/app/forms/builder" element={<FormBuilderPage />} />
            <Route path="/app/forms/submissions" element={<FormSubmissionsPage />} />
            <Route path="/app/forms/translations" element={<TranslationsPage />} />
            <Route path="/app/forms/templates" element={<TemplatesAndContentPage />} />
            <Route path="/app/academics/catalog" element={<AcademicCatalogPage />} />
            <Route path="/app/academics/schemes" element={<AssessmentSchemesPage />} />
            <Route path="/app/academics/electives" element={<ElectivesPage />} />
            <Route path="/app/academics/teaching" element={<TeachingAssignmentsPage />} />
            <Route path="/app/admissions/apply" element={<ApplicantWizardPage />} />
            <Route path="/app/admissions/review" element={<AdmissionsReviewQueuePage />} />
            <Route path="/app/admissions/imports" element={<CSVImportWizardPage />} />
            <Route path="/app/admissions/enrollment" element={<EnrollmentRegistryPage />} />
            <Route path="/app/students/overview" element={<StudentOverviewPage />} />
            <Route path="/app/students/profile" element={<StudentProfilePage />} />
            <Route path="/app/students/lifecycle" element={<StudentLifecyclePage />} />
            <Route path="/app/students/alumni" element={<AlumniDirectoryPage />} />
            <Route path="/app/attendance/capture" element={<AttendanceCapturePage />} />
            <Route path="/app/attendance/corrections" element={<AttendanceCorrectionsPage />} />
            <Route path="/app/attendance/my-attendance" element={<MyAttendancePage />} />
            <Route path="/app/attendance/reports" element={<AttendanceReportsPage />} />
            <Route path="/app/timetable/calendar" element={<TimetableCalendarPage />} />
            <Route path="/app/timetable/editor" element={<TimetableEditorPage />} />
            <Route path="/app/timetable/reschedule" element={<TimetableReschedulePage />} />
            <Route path="/app/timetable/events" element={<AcademicEventsPage />} />
            <Route path="/app/finance/rules" element={<FeeRulesPage />} />
            <Route path="/app/finance/my-fees" element={<StudentMyFeesPage />} />
            <Route path="/app/finance/reconciliation" element={<FinanceReconciliationPage />} />
            <Route path="/app/finance/concessions" element={<ConcessionsPage />} />
            <Route path="/app/exam-applications/cycles" element={<ExamCyclesPage />} />
            <Route path="/app/exam-applications/apply" element={<StudentExamApplyPage />} />
            <Route path="/app/exam-applications/review" element={<ExamReviewQueuePage />} />
            <Route path="/app/exam-applications/hall-tickets" element={<HallTicketsPage />} />
            <Route path="/app/exam-operations/schedule" element={<ExamSchedulePage />} />
            <Route path="/app/exam-operations/centers" element={<ExamCentersPage />} />
            <Route path="/app/exam-operations/invigilators" element={<InvigilatorsPage />} />
            <Route path="/app/exam-operations/materials" element={<MaterialsRegisterPage />} />
            <Route path="/app/assessment/marks" element={<AssessmentMarksPage />} />
            <Route path="/app/assessment/imports" element={<AssessmentImportsPage />} />
            <Route path="/app/assessment/moderation" element={<AssessmentModerationPage />} />
            <Route path="/app/assessment/my-assessments" element={<StudentMyAssessmentsPage />} />
            <Route path="/app/results/tabulation" element={<ResultsTabulationPage />} />
            <Route path="/app/results/publication" element={<ResultsPublicationPage />} />
            <Route path="/app/results/my-results" element={<StudentMyResultsPage />} />
            <Route path="/app/results/reports" element={<ResultsReportsPage />} />
            <Route path="/app/revaluation/apply" element={<RevaluationApplyPage />} />
            <Route path="/app/revaluation/assignments" element={<RevaluationAssignmentsPage />} />
            <Route path="/app/revaluation/outcomes" element={<RevaluationOutcomesPage />} />
            <Route path="/app/revaluation/my-decisions" element={<StudentMyDecisionsPage />} />
            <Route path="/app/certificates/catalog" element={<CertificatePages />} />
            <Route path="/app/certificates/review" element={<CertificatePages />} />
            <Route path="/app/certificates/my-certificates" element={<CertificatePages />} />
            <Route path="/app/certificates/verify" element={<CertificatePages />} />
            <Route path="/app/helpdesk/my-tickets" element={<HelpdeskPages />} />
            <Route path="/app/helpdesk/ticket-detail" element={<HelpdeskPages />} />
            <Route path="/app/helpdesk/staff-inbox" element={<HelpdeskPages />} />
            <Route path="/app/helpdesk/knowledge" element={<HelpdeskPages />} />
            <Route path="/app/hostel/inventory" element={<HostelPages />} />
            <Route path="/app/hostel/apply" element={<HostelPages />} />
            <Route path="/app/hostel/allocations" element={<HostelPages />} />
            <Route path="/app/hostel/reports" element={<HostelPages />} />
            <Route path="/admin/institutions" element={<InstitutionsPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admissions" element={<ApplicantWizardPage />} />
            <Route path="/admin/admissions" element={<AdmissionsReviewQueuePage />} />
            <Route path="/students" element={<StudentOverviewPage />} />
            <Route path="/students/:id" element={<StudentOverviewPage />} />
            <Route path="/academics/courses" element={<CoursesPage />} />
            <Route path="/academics/timetable" element={<TimetableCalendarPage />} />
            <Route path="/academics/attendance" element={<AttendanceCapturePage />} />
            <Route path="/exams/schedule" element={<ExamsPage />} />
            <Route path="/exams/marks" element={<GradebookPage />} />
            <Route path="/exams/transcripts" element={<TranscriptsPage />} />
            <Route path="/fees/student" element={<StudentFeePage />} />
            <Route path="/fees/admin" element={<AdminFeePage />} />
            <Route path="/finance/payroll" element={<PayrollPage />} />
            <Route path="/facilities/hostel" element={<HostelPages />} />
            <Route path="/facilities/transport" element={<TransportPages />} />
            <Route path="/app/transport/routes" element={<TransportPages />} />
            <Route path="/app/transport/my-pass" element={<TransportPages />} />
            <Route path="/app/transport/operations" element={<TransportPages />} />
            <Route path="/app/transport/tracking" element={<TransportPages />} />
            <Route path="/app/communications/notices" element={<CommunicationPages />} />
            <Route path="/app/communications/inbox" element={<CommunicationPages />} />
            <Route path="/app/communications/outbox" element={<CommunicationPages />} />
            <Route path="/app/communications/calendar" element={<CommunicationPages />} />
            <Route path="/app/guardians/linking" element={<GuardianPages />} />
            <Route path="/app/guardians/dashboard" element={<GuardianPages />} />
            <Route path="/app/guardians/student-summary" element={<GuardianPages />} />
            <Route path="/app/guardians/permissions" element={<GuardianPages />} />
            <Route path="/app/governance/committees" element={<GovernancePages />} />
            <Route path="/app/governance/tasks" element={<GovernancePages />} />
            <Route path="/app/governance/notesheets" element={<GovernancePages />} />
            <Route path="/app/governance/approvals" element={<GovernancePages />} />
            <Route path="/app/registers/entries" element={<RegisterPages />} />
            <Route path="/app/registers/numbering" element={<RegisterPages />} />
            <Route path="/app/registers/movement" element={<RegisterPages />} />
            <Route path="/app/registers/reports" element={<RegisterPages />} />
            <Route path="/app/hr/employees" element={<StaffPages />} />
            <Route path="/app/hr/my-leave" element={<StaffPages />} />
            <Route path="/app/hr/approvals" element={<StaffPages />} />
            <Route path="/app/hr/establishment" element={<StaffPages />} />
            <Route path="/app/payroll/structures" element={<PayrollPages />} />
            <Route path="/app/payroll/runs" element={<PayrollPages />} />
            <Route path="/app/payroll/my-payslips" element={<PayrollPages />} />
            <Route path="/app/payroll/claims" element={<PayrollPages />} />

            <Route path="/app/library/catalog" element={<LibraryPages />} />
            <Route path="/app/library/accessions" element={<LibraryPages />} />
            <Route path="/app/library/circulation" element={<LibraryPages />} />
            <Route path="/app/library/my-library" element={<LibraryPages />} />

            <Route path="/app/inventory/masters" element={<InventoryPages />} />
            <Route path="/app/inventory/procurement" element={<InventoryPages />} />
            <Route path="/app/inventory/movements" element={<InventoryPages />} />
            <Route path="/app/inventory/assets" element={<InventoryPages />} />

            <Route path="/app/mis/dashboard" element={<MISPages />} />
            <Route path="/app/mis/research" element={<MISPages />} />
            <Route path="/app/mis/accreditation" element={<MISPages />} />
            <Route path="/app/mis/reports" element={<MISPages />} />

            <Route path="/app/assistant/chat" element={<AssistantPages />} />
            <Route path="/app/assistant/history" element={<AssistantPages />} />
            <Route path="/app/assistant/voice" element={<AssistantPages />} />
            <Route path="/app/assistant/evaluation" element={<AssistantPages />} />

            <Route path="/app/predictions/dashboard" element={<PredictionPages />} />
            <Route path="/app/predictions/student-support" element={<PredictionPages />} />
            <Route path="/app/predictions/training" element={<PredictionPages />} />
            <Route path="/app/predictions/interventions" element={<PredictionPages />} />

            <Route path="/app/learning/my-plan" element={<LearningPages />} />
            <Route path="/app/learning/resources" element={<LearningPages />} />
            <Route path="/app/learning/progress" element={<LearningPages />} />
            <Route path="/app/learning/faculty" element={<LearningPages />} />

            <Route path="/app/mobile/home" element={<MobilePages />} />
            <Route path="/app/mobile/install" element={<MobilePages />} />
            <Route path="/app/mobile/android" element={<MobilePages />} />
            <Route path="/app/mobile/settings" element={<MobilePages />} />

            <Route path="/app/demo-operations/scenarios" element={<DemoOperationsPages />} />
            <Route path="/app/demo-operations/integrations" element={<DemoOperationsPages />} />
            <Route path="/app/demo-operations/jobs" element={<DemoOperationsPages />} />
            <Route path="/app/demo-operations/clock" element={<DemoOperationsPages />} />

            <Route path="/app/release/coverage" element={<ReleaseAuditPages />} />
            <Route path="/app/release/reviewer-guide" element={<ReleaseAuditPages />} />
            <Route path="/app/release/accessibility" element={<ReleaseAuditPages />} />

            <Route path="/facilities/library" element={<LibraryPage />} />
            <Route path="/placement/drives" element={<PlacementDrivesPage />} />
            <Route path="/alumni" element={<AlumniDirectoryPage />} />
            <Route path="/guardian/dashboard" element={<GuardianDashboardPage />} />
            <Route path="/support/grievances" element={<HelpdeskPages />} />
            <Route path="/notices" element={<NoticeBoardPage />} />
            <Route path="/analytics/risk" element={<AIRiskPage />} />
            <Route path="/admin/system" element={<SystemAdminPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app/foundation/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app/foundation/authentication" element={<AuthPages />} />
            <Route path="/app/identity/login" element={<IdentityLoginPage />} />
            <Route path="/certificates/verify" element={<CertificatePages />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
};

export default App;
