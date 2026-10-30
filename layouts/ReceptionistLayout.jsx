import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Calendar, Users, Bell, User, LogOut, Menu, X, Activity, Clock } from "lucide-react";

export default function ReceptionistLayout() {
  const { userProfile, currentUser, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/receptionist", icon: LayoutDashboard },
    { name: "Appointments", href: "/receptionist/appointments", icon: Calendar },
    { name: "Doctors", href: "/receptionist/doctors", icon: Activity },
    { name: "Availability", href: "/receptionist/availability", icon: Clock },
    { name: "Health Packages", href: "/receptionist/health-packages", icon: Users },
    { name: "Notifications", href: "/receptionist/notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 
        flex flex-col transition-transform duration-300 z-50
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <Link to="/receptionist" className="text-2xl font-bold text-medical-primary flex items-center gap-2">
            <span className="bg-medical-primary text-white p-1.5 rounded-lg">
              <Activity size={20} />
            </span>
            MediConnect
          </Link>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-medical-primary/10 text-medical-primary rounded-full flex items-center justify-center font-bold">
              {userProfile?.name?.charAt(0) || "R"}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-gray-900 truncate">{userProfile?.name || "Receptionist"}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-medical-primary/10 text-medical-primary' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-medical-primary' : 'text-gray-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 text-gray-500 hover:text-gray-900">
              <Menu size={24} />
            </button>
            <span className="font-bold text-gray-900">MediConnect Receptionist</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
