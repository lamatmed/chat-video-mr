import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon, MenuIcon, XIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useState } from "react";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <ShipWheelIcon className="size-7 sm:size-9 text-primary" />
                <span className="text-xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Mauritanie
                </span>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button 
            className="btn btn-ghost btn-circle lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>
            <ThemeSelector />
            <div className="avatar">
              <div className="w-9 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
              </div>
            </div>
            <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-base-200 border-b border-base-300 lg:hidden">
              <div className="container mx-auto px-4 py-3 space-y-3">
                <Link to={"/notifications"} className="flex items-center gap-2 p-2 hover:bg-base-300 rounded-lg">
                  <BellIcon className="h-5 w-5" />
                  <span>Notifications</span>
                </Link>
                <div className="p-2">
                  <ThemeSelector />
                </div>
                <div className="flex items-center gap-2 p-2">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
                    </div>
                  </div>
                  <span className="text-sm">{authUser?.fullName}</span>
                </div>
                <button 
                  className="flex items-center gap-2 p-2 w-full hover:bg-base-300 rounded-lg"
                  onClick={logoutMutation}
                >
                  <LogOutIcon className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
