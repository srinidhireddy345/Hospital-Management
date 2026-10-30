import { Outlet, Link, useLocation } from "react-router-dom";
import { Calendar, Clock, FileText, Activity, Bell, User, Search } from "lucide-react";

export default function PatientLayout() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard Overview", path: "/patient/dashboard", icon: <Activity size={20} /> },
    { name: "Book Appointment", path: "/patient/book-appointment", icon: <Calendar size={20} /> },
    { name: "Find a Doctor", path: "/patient/doctors", icon: <Search size={20} /> },
    { name: "My Appointments", path: "/patient/my-appointments", icon: <Clock size={20} /> },
    { name: "Health Packages", path: "/patient/health-packages", icon: <FileText size={20} /> },
    { name: "My Bookings", path: "/patient/health-package-bookings", icon: <Activity size={20} /> },
    { name: "Notifications", path: "/patient/notifications", icon: <Bell size={20} /> },
    { name: "My Profile", path: "/patient/profile", icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Patient Menu</h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-medical-primary/10 text-medical-primary" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={isActive ? "text-medical-primary" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
