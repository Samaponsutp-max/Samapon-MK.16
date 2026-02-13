
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import UserManagement from './components/UserManagement';
import PlanDatabase from './components/PlanDatabase';
import WebMap from './components/WebMap';
import { Project, UserRole, UserAccount, DevelopmentPlan } from './types';
import { MOCK_PROJECTS, MOCK_USERS, MOCK_DEVELOPMENT_PLANS } from './constants';
// Fix: Added missing Construction, Wrench, and ShieldCheck icons
import { UserCircle, Bell, Settings as SettingsIcon, LogOut, Construction, Wrench, ShieldCheck, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS);
  const [plans, setPlans] = useState<DevelopmentPlan[]>(MOCK_DEVELOPMENT_PLANS);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Persistence (Mock)
  useEffect(() => {
    const savedProjects = localStorage.getItem('infra_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    const savedUsers = localStorage.getItem('infra_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    const savedPlans = localStorage.getItem('infra_plans');
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    }
  }, []);

  const saveProject = (updatedProject: Project) => {
    let updatedList;
    if (editingProject) {
      updatedList = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    } else {
      updatedList = [updatedProject, ...projects];
    }
    
    setProjects(updatedList);
    localStorage.setItem('infra_projects', JSON.stringify(updatedList));
    setEditingProject(null);
    setActiveTab('projects');
  };

  const deleteProject = (id: string) => {
    const updatedList = projects.filter(p => p.id !== id);
    setProjects(updatedList);
    localStorage.setItem('infra_projects', JSON.stringify(updatedList));
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setActiveTab('form');
  };

  // User Management Actions
  const handleAddUser = (newUser: UserAccount) => {
    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem('infra_users', JSON.stringify(updated));
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updated);
    localStorage.setItem('infra_users', JSON.stringify(updated));
  };

  const handleDeleteUser = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    localStorage.setItem('infra_users', JSON.stringify(updated));
  };

  const renderContent = () => {
    // Basic Access Control for routes
    if (activeTab === 'users' && userRole !== UserRole.ADMIN) {
      return (
        <div className="bg-red-50 p-12 rounded-2xl border border-red-200 text-center max-w-lg mx-auto mt-20">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
             <SettingsIcon size={32} />
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Access Denied</h3>
          <p className="text-red-600">You do not have permission to view this section. Please contact your administrator.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard projects={projects} />;
      case 'web-map':
        return <WebMap projects={projects} />;
      case 'plan-database':
        return <PlanDatabase plans={plans} onAddPlan={() => alert('Feature coming soon: Integrated Plan Wizard')} />;
      case 'projects':
        return (
          <ProjectList 
            projects={projects} 
            onEdit={handleEditClick} 
            onDelete={deleteProject} 
          />
        );
      case 'form':
        return (
          <ProjectForm 
            onSave={saveProject} 
            onCancel={() => {
              setEditingProject(null);
              setActiveTab('projects');
            }} 
            initialData={editingProject}
          />
        );
      case 'tracking':
        return (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm max-w-3xl mx-auto">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
               <Construction size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800">Construction Tracking</h3>
            <p className="text-slate-500 text-lg leading-relaxed">
              โมดูลติดตามการก่อสร้างแบบเรียลไทม์จะถูกเปิดใช้งานเมื่อท่านเลือกโครงการจากหน้า 
              <span className="font-bold text-blue-600 mx-1 cursor-pointer hover:underline" onClick={() => setActiveTab('projects')}>โครงการงบประมาณ</span>
            </p>
          </div>
        );
      case 'maintenance':
        return (
          <div className="space-y-8">
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                      <Wrench size={24} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-slate-800">Smart Maintenance Database</h3>
                      <p className="text-slate-500">ระบบวิเคราะห์สภาพทรัพย์สินและการวางแผนซ่อมบำรุงเชิงป้องกัน</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-6 border border-amber-100 rounded-2xl bg-amber-50/50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-200">Critical</span>
                        <span className="text-xs text-slate-400">ID: ASSET-092</span>
                      </div>
                      <p className="font-bold text-lg text-slate-900 mb-1">อาคารสำนักงานเทศบาล</p>
                      <p className="text-sm text-slate-600">อายุ 12 ปี | สภาพ: ชำรุด (Poor)</p>
                      <div className="mt-4 pt-4 border-t border-amber-200/50">
                        <p className="text-xs font-bold text-amber-800 mb-1 tracking-wide uppercase">AI Maintenance Advice:</p>
                        <p className="text-sm text-slate-700 italic">"ควรเร่งปรับปรุงระบบหลังคาและทางหนีไฟเพื่อความปลอดภัยตามกฎหมายควบคุมอาคารปี 2567"</p>
                      </div>
                   </div>
                   <div className="p-6 border border-green-100 rounded-2xl bg-green-50/50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-green-200">Optimal</span>
                        <span className="text-xs text-slate-400">ID: ASSET-115</span>
                      </div>
                      <p className="font-bold text-lg text-slate-900 mb-1">ถนนคอนกรีตหมู่ 4</p>
                      <p className="text-sm text-slate-600">อายุ 3 ปี | สภาพ: ดี (Good)</p>
                      <div className="mt-4 pt-4 border-t border-green-200/50">
                        <p className="text-xs font-bold text-green-800 mb-1 tracking-wide uppercase">AI Maintenance Advice:</p>
                        <p className="text-sm text-slate-700 italic">"ตรวจสอบผิวจราจรทุก 6 เดือนเพื่อป้องกันการเกิดน้ำขังสะสมบนผิวทาง"</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
      case 'users':
        return (
          <UserManagement 
            users={users} 
            onAdd={handleAddUser}
            onUpdate={handleUpdateUser}
            onDelete={handleDeleteUser}
          />
        );
      default:
        return <Dashboard projects={projects} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab === 'form') {
            setEditingProject(null);
          }
          setActiveTab(tab);
        }} 
        userRole={userRole} 
      />
      
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        {/* Top Navigation */}
        <header className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-30">
          <div className="flex items-center gap-5">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">User Role Simulator</label>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-white"
              >
                {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <SettingsIcon size={20} />
              </button>
            </div>
            
            <div className="h-10 w-px bg-slate-200 mx-2"></div>
            
            <div className="flex items-center gap-4 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none text-slate-900">สมชาย รักงาน</p>
                <p className="text-[10px] text-blue-500 font-bold mt-1 uppercase tracking-widest">{userRole}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-2 ring-white">
                <UserCircle size={28} />
              </div>
              <button className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-2">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-both">
          {renderContent()}
        </div>

        <footer className="mt-16 py-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-slate-400 text-xs gap-4">
          <div className="flex items-center gap-2">
             <ShieldCheck size={16} className="text-blue-500" />
             <span className="font-semibold text-slate-500 tracking-tight">InfraGuard v2.5.0 Professional</span>
          </div>
          <p>© 2024 • ระบบฐานข้อมูลโครงสร้างพื้นฐานท้องถิ่นอัจฉริยะ (Smart Local Infrastructure OS)</p>
          <div className="flex gap-6 font-medium">
             <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-blue-600 transition-colors">Help Center</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
