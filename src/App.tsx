import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/layout/AppShell';
import { useApp } from '@/store';
import { Trailer } from '@/features/trailer/Trailer';
import Login from '@/pages/Login';
import Propuesta from '@/pages/Propuesta';
import AdminPanel from '@/pages/admin/Panel';
import Crm from '@/pages/admin/Crm';
import LeadDetail from '@/pages/admin/LeadDetail';
import Scoring from '@/pages/admin/Scoring';
import Proposals from '@/pages/admin/Proposals';
import ProposalNew from '@/pages/admin/ProposalNew';
import ProposalDetail from '@/pages/admin/ProposalDetail';
import AdminCalendar from '@/pages/admin/Calendar';
import Clients from '@/pages/admin/Clients';
import UsersPage from '@/pages/admin/Users';
import Expansion from '@/pages/franquiciante/Expansion';
import Units from '@/pages/franquiciante/Units';
import UnitDetail from '@/pages/franquiciante/UnitDetail';
import Candidates from '@/pages/franquiciante/Candidates';
import Reports from '@/pages/franquiciante/Reports';
import FranchiseeHome from '@/pages/franquiciado/Home';
import Opening from '@/pages/franquiciado/Opening';
import Documents from '@/pages/franquiciado/Documents';
import MonthlyReportPage from '@/pages/franquiciado/MonthlyReport';
import MessagesPage from '@/pages/franquiciado/Messages';
import Projects from '@/pages/equipo/Projects';
import Board from '@/pages/equipo/Board';
import MyTasks from '@/pages/equipo/MyTasks';
import TeamCalendar from '@/pages/equipo/TeamCalendar';

export default function App() {
  const authed = useApp((s) => s.authed);
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppShell />}>
          <Route path="/propuesta" element={<Propuesta />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/admin/crm" element={<Crm />} />
          <Route path="/admin/crm/:leadId" element={<LeadDetail />} />
          <Route path="/admin/scoring" element={<Scoring />} />
          <Route path="/admin/propuestas" element={<Proposals />} />
          <Route path="/admin/propuestas/nueva" element={<ProposalNew />} />
          <Route path="/admin/propuestas/:id" element={<ProposalDetail />} />
          <Route path="/admin/calendario" element={<AdminCalendar />} />
          <Route path="/admin/clientes" element={<Clients />} />
          <Route path="/admin/usuarios" element={<UsersPage />} />
          <Route path="/franquiciante/panel" element={<Expansion />} />
          <Route path="/franquiciante/unidades" element={<Units />} />
          <Route path="/franquiciante/unidades/:id" element={<UnitDetail />} />
          <Route path="/franquiciante/candidatos" element={<Candidates />} />
          <Route path="/franquiciante/reportes" element={<Reports />} />
          <Route path="/franquiciado/inicio" element={<FranchiseeHome />} />
          <Route path="/franquiciado/apertura" element={<Opening />} />
          <Route path="/franquiciado/documentos" element={<Documents />} />
          <Route path="/franquiciado/carga" element={<MonthlyReportPage />} />
          <Route path="/franquiciado/consultas" element={<MessagesPage />} />
          <Route path="/equipo/proyectos" element={<Projects />} />
          <Route path="/equipo/proyectos/:id" element={<Board />} />
          <Route path="/equipo/mis-tareas" element={<MyTasks />} />
          <Route path="/equipo/calendario" element={<TeamCalendar />} />
        </Route>
        <Route path="*" element={<Navigate to={authed ? '/propuesta' : '/login'} replace />} />
      </Routes>
      <Trailer />
    </>
  );
}
