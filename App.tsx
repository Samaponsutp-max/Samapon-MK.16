
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import UserManagement from './components/UserManagement';
import PlanDatabase from './components/PlanDatabase';
import AssetDatabase from './components/AssetDatabase';
import WebMap from './components/WebMap';
import Settings from './components/Settings';
import AuditLogs from './components/AuditLogs';
import { Project, UserRole, UserAccount, DevelopmentPlan, Asset } from './types';
import { MOCK_PROJECTS, MOCK_USERS, MOCK_DEVELOPMENT_PLANS, MOCK_ASSETS } from './constants';
import { ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS);
  const [plans, setPlans] = useState<DevelopmentPlan[]>(MOCK_DEVELOPMENT_PLANS);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Persistence Hooks
  useEffect(() => {
    const savedProjects = localStorage.getItem('infra_projects');
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    const savedUsers = localStorage.getItem('infra_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    const savedPlans = localStorage.getItem('infra_plans');
    if (savedPlans) setPlans(JSON.parse(savedPlans));
    const savedAssets = localStorage.getItem('infra_assets');
    if (savedAssets) setAssets(JSON.parse(savedAssets));
  }, []);

  const saveToCloud = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const saveProject = (updatedProject: Project) => {
    let updatedList;
    if (editingProject) {
      updatedList = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    } else {
      updatedList = [updatedProject, ...projects];
    }
    setProjects(updatedList);
    saveToCloud('infra_projects', updatedList);
    setEditingProject(null);
    setActiveTab('projects');
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
    const updated = assets.map(a => a.id === updatedAsset.id ? updatedAsset : a);
    setAssets(updated);
    saveToCloud('infra_assets', updated);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard projects={projects} userRole={userRole} />;
      case 'web-map':
        return <WebMap projects={projects} />;
      case 'plan-database':
        return <PlanDatabase plans={plans} onAddPlan={() => {}} />;
      case 'asset-database':
        return <AssetDatabase assets={assets} onUpdateAsset={handleUpdateAsset} />;
      case 'projects':
        return <ProjectList projects={projects} onEdit={handleEditClick} />;
      case 'form':
        return <ProjectForm onSave={saveProject} onCancel={() => setActiveTab('projects')} initialData={editingProject} />;
      case 'users':
        return <UserManagement users={users} onAdd={(u) => {}} onUpdate={(u) => {}} onDelete={(id) => {}} />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard projects={projects} userRole={userRole} />;
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setActiveTab('form');
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-['Sarabun']">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
      
      <main className="flex-1 ml-64 p-10 min-h-screen">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
          {renderContent()}
        </div>

        <footer className="mt-20 py-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[11px] gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-[#002d62]/10 p-2 rounded-lg"><ShieldCheck size={18} className="text-[#002d62]" /></div>
             <span className="font-extrabold text-slate-500 tracking-tight uppercase">Authorized System Admin Panel</span>
          </div>
          <p className="font-bold">© 2024 • InfraGuard Professional Executive Dashboard • องค์การบริหารส่วนตำบลเหนือเมือง</p>
          <div className="flex gap-6 font-black uppercase tracking-tighter">
             <a href="#" className="hover:text-[#002d62] transition-colors">Digital Blueprint</a>
             <a href="#" className="hover:text-[#002d62] transition-colors">Local Civic Tech</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
