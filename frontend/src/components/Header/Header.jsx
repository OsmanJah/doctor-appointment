import { NavLink, Link } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import { HiShoppingBag } from "react-icons/hi";
import { useContext, useEffect, useRef, useCallback } from "react";

import { AuthContext } from "./../../context/AuthContext";
import { CartContext } from "./../../context/CartContext";
import { useChatContext } from "./../../context/ChatContext";

const baseNavLinks = [
  {
    path: "/home",
    display: "Home",
  },
  {
    path: "/doctors",
    display: "Find a Doctor",
  },
  {
    path: "/chat",
    display: "Chat",
  },
  {
    path: "/pharmacy",
    display: "Pharmacy",
  },
];

const Header = () => {
  const { user, token, role } = useContext(AuthContext);
  const { items: cartItems } = useContext(CartContext);
  const { totalUnreadCount, fetchTotalUnreadCount } = useChatContext();

  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const headerRef = useRef(null);
  const menuRef = useRef(null);


  const navLinks = baseNavLinks.filter(link => {
    // Show chat only for authenticated users
    if (link.path === '/chat') {
      return token && user;
    }
    // Show pharmacy for non-doctors
    if (link.path === '/pharmacy') {
      return role !== 'doctor';
    }
    return true;
  });


  const handleScroll = useCallback(() => {
    if (headerRef.current) {
      if (
        document.body.scrollTop > 80 ||
        document.documentElement.scrollTop > 80
      ) {
        headerRef.current.classList.add("sticky__header");
      } else {
        headerRef.current.classList.remove("sticky__header");
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Fetch unread count when user is authenticated
  useEffect(() => {
    if (token && user && fetchTotalUnreadCount) {
      fetchTotalUnreadCount();
    }
  }, [token, user, fetchTotalUnreadCount]);

  const toggleMenu = () => menuRef.current.classList.toggle("show__menu");

  return (
    <header ref={headerRef} className="header flex items-center">
      <div className="container">
        <div className="flex items-center justify-between">
          <Link to="/home">
            <div className="text-5xl font-bold text-primaryColor hover:text-teal-700 transition-colors duration-300 cursor-pointer">
              MarieCare
            </div>
          </Link>

          <div className="navigation" ref={menuRef} onClick={toggleMenu}>
            <ul className="menu flex items-center gap-[2.7rem]">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    className={navClass =>
                      navClass.isActive
                        ? "text-primaryColor font-[600] text-[16px] leading-7"
                        : "text-textColor font-[500] text-[16px] leading-7 hover:text-primaryColor transition-colors duration-200"
                    }
                  >
                    <span className="relative">
                      {link.display}
                      {link.path === '/chat' && totalUnreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </span>
                      )}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative cursor-pointer">
              <HiShoppingBag className="w-6 h-6" />
              {totalCartQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-primaryColor text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalCartQuantity}
                </span>
              )}
            </Link>

            {token && user ? (
              <div>
                <Link
                  to={`${
                    role === "doctor"
                      ? "/doctors/profile/me"
                      : "/users/profile/me"
                  }`}
                >
                  <figure className="w-[35px] h-[35px] rounded-full cursor-pointer border-2 border-solid border-primaryColor flex items-center justify-center overflow-hidden">
                    {user.photo ? (
                      <img
                        className="w-full h-full object-cover"
                        src={user.photo}
                        alt="User Profile"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </figure>
                </Link>
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-buttonBgColor py-2 px-6 rounded-[50px] text-white font-[600] h-[44px] flex items-center justify-center hover:bg-teal-700 transition-colors duration-300">
                  Log In
                </button>
              </Link>
            )}

            <span className="md:hidden" onClick={toggleMenu}>
              <BiMenu className="w-6 h-6 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
