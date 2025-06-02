import React from "react";
import { Link } from "react-router-dom";

import { RiLinkedinFill } from "react-icons/ri";
import { AiFillGithub, AiOutlineInstagram } from "react-icons/ai";

const socialLinks = [
  { icon: <AiFillGithub />, path: "https://github.com" },
  { icon: <AiOutlineInstagram />, path: "https://www.instagram.com" },
  { icon: <RiLinkedinFill />, path: "https://www.linkedin.com" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="pb-16 pt-10">
      <div className="container">

        <div className="flex flex-col md:flex-row justify-center md:justify-start items-center md:items-start text-center md:text-left">
          <div>
            <div className="text-4xl font-bold text-primaryColor mb-4 md:mb-2">
              MarieCare
            </div>
            <p className="text-[16px] leading-7 font-[400] text-textColor">
              Copyright © {year} developed by Osman Jah. All rights reserved.
            </p>
            <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
              {socialLinks.map((link, index) => (
                <Link
                  to={link.path}
                  key={index}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-solid border-primaryColor rounded-full flex items-center justify-center text-primaryColor hover:bg-primaryColor hover:text-white transition-all duration-300"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>


        </div>
      </div>
    </footer>
  );
};

export default Footer;
