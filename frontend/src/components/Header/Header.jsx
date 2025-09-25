import { NavLink, Link } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import { HiShoppingBag } from "react-icons/hi";
import { useContext, useEffect, useRef, useCallback } from "react";

import { AuthContext } from "./../../context/AuthContext";
import { CartContext } from "./../../context/CartContext";

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
    path: "/pharmacy",
    display: "Pharmacy",
  },
];

const Header = () => {
  const { user, token, role } = useContext(AuthContext);
  const { items: cartItems } = useContext(CartContext);

  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const headerRef = useRef(null);
  const menuRef = useRef(null);


  const navLinks = baseNavLinks.filter(link => {
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

  const toggleMenu = () => menuRef.current.classList.toggle("show__menu");

  return (
    <header ref={headerRef} className="header flex items-center">
      <div className="container">
        <div className="flex items-center justify-between">
          <Link to="/home">
            <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-brand-diagonal cursor-pointer" style={{backgroundSize:'160% 160%'}}>
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
                    {link.display}
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
                <button className="btn--outline h-[44px] mt-0">
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
