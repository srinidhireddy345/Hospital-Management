import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, Menu, Phone } from "lucide-react";
import { useState } from "react";

export default function Layout({ children }) {
  const { currentUser, userRole, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Departments", path: "/#departments" },
    { name: "Doctors", path: "/#doctors" },
    { name: "Health Checkup", path: "/#health-checkup" },
    { name: "About Us", path: "/#about" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800">
      {/* Top Bar for emergency contact */}
      <div className="bg-medical-dark text-white text-sm py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={14} /> Emergency: +91 98765 43210</span>
            <span>WhatsApp: +91 98765 43211</span>
          </div>
          <div>Opening Hours: 24/7</div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <span className="text-2xl font-extrabold text-medical-primary tracking-tight">MediConnect</span>
              </Link>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <a key={link.name} href={link.path} className="text-gray-600 hover:text-medical-primary font-medium text-sm transition-colors">
                  {link.name}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="text-medical-primary hover:text-medical-dark font-medium text-sm transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-gray-200"
                    >
                      {userProfile?.photoUrl ? (
                        <img src={userProfile.photoUrl} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                      <span className="max-w-[100px] truncate">
                        {userProfile?.name || currentUser.displayName || currentUser.email.split('@')[0]}
                      </span>
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-50">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {userProfile?.name || currentUser.displayName || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                        <Link 
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-medical-primary"
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to={`/${userRole || 'patient'}/profile`}
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-medical-primary"
                        >
                          My Profile
                        </Link>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-medical-primary hover:bg-medical-dark text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-medical-primary focus:outline-none"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-medical-primary hover:bg-gray-50"
                >
                  {link.name}
                </a>
              ))}
              <div className="border-t pt-2 mt-2">
                {currentUser ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-medical-primary hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-medical-primary hover:bg-medical-dark"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full mx-auto">
        {/* If children exist (from App routing wrapper), render them. Otherwise Outlet for nested routes. */}
        {children || <Outlet />}
      </main>
      
      {/* Footer */}
      <footer id="about" className="bg-slate-900 text-slate-300 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-xl font-bold text-white mb-4">MediConnect</h3>
              <p className="text-sm mb-4">
                Providing world-class healthcare solutions with modern technology.
              </p>
              <div className="flex gap-2">
                {/* Social icons could go here */}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/#departments" className="hover:text-medical-primary">Departments</a></li>
                <li><a href="/#doctors" className="hover:text-medical-primary">Doctors</a></li>
                <li><a href="/#about" className="hover:text-medical-primary">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact Info</h4>
              <ul className="space-y-2 text-sm">
                <li>123 Healthcare Ave, Medical City, MC 10010</li>
                <li>Email: info@mediconnect.example.com</li>
                <li>Phone: +91 98765 43210</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Emergency</h4>
              <p className="text-sm mb-2">For medical emergencies, call us immediately:</p>
              <p className="text-lg font-bold text-medical-primary">+91 98765 43210</p>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} MediConnect Hospital Appointment System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
