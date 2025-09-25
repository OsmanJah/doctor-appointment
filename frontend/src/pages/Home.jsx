import { Link } from "react-router-dom";
import heroImg01 from "../assets/images/hero-img01.jpg";
import heroImg02 from "../assets/images/hero-img02.jpg";
import icon01 from "../assets/images/icon01.png";
import icon02 from "../assets/images/icon02.png";
import icon03 from "../assets/images/icon03.png";
import { FaAngleRight } from 'react-icons/fa';

import DoctorsList from "../components/Doctors/DoctorsList";

const Home = () => {
  return (
    <>
      <section className="hero__section pt-[60px] 2xl:h-[800px]">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-[90px] items-center justify-between">
            <div>
              <div className=" lg:w-[570px]">
                <h1 className="heading bg-clip-text text-transparent bg-brand-diagonal-strong text-[36px] leading-[46px] md:text-[60px] md:leading-[70px] " style={{backgroundSize:'140% 140%'}}>
                  We help patients live a healthy, longer life.
                </h1>
                <p className="text__para">
                  Welcome to MarieCare, your trusted partner for accessible and personalized healthcare. 
                  Our platform connects you with experienced doctors, allows you to book appointments seamlessly, 
                  and manage your health journey with ease. Your well-being is our priority.
                </p>
                <Link to="/doctors">
                  <button className="btn">Book an Appointment</button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-[20px] lg:gap-[30px] justify-center md:justify-end items-center w-full lg:w-1/2">
              <div className="w-full md:w-1/2">
                <img className="w-full h-auto object-cover rounded-lg shadow-lg animate-float" src={heroImg01} alt="MarieCare Doctor 1" />
              </div>

              <div className="w-full md:w-1/2">
                <img
                  className="w-full h-auto object-cover rounded-lg shadow-lg animate-float"
                  src={heroImg02}
                  alt="MarieCare Doctor 2"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container ">
          <div className="lg:w-[470px] mx-auto">
            <h2 className="heading heading--accent text-center">
              Your Path to Comprehensive Healthcare
            </h2>
            <p className="text__para text-center">
              Discover specialized doctors, explore a wide range of medical services, and book your appointments seamlessly with MarieCare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[30px] mt-[30px] lg:mt-[55px]">
            <div className="card py-[30px] px-5 ">
              <div className="flex items-center justify-center">
                <span className="pill">
                  <img src={icon01} alt="" className="w-6 h-6" />
                </span>
              </div>

              <div className="mt-[30px]">
                <h2 className="text-[26px] leading-9 text-headingColor font-[700] text-center">
                  Find Your Doctor
                </h2>
                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                  Search our extensive network of qualified specialists. Read profiles, check expertise, and choose the ideal doctor for your needs.
                </p>

                <Link
                  to="/doctors"
                  className="w-[44px] h-[44px] rounded-full border border-solid border-primaryColor mt-[30px] mx-auto flex items-center justify-center group hover:bg-primaryColor hover:border-none shadow-glowSoft"
                  aria-label="View doctors"
                >
                  <FaAngleRight className="group-hover:text-white w-6 h-5" />
                </Link>
              </div>
            </div>

            <div className="card py-[30px] px-5 ">
              <div className="flex items-center justify-center">
                <span className="pill">
                  <img src={icon02} alt="" className="w-6 h-6" />
                </span>
              </div>

              <div className="mt-[30px]">
                <h2 className="text-[26px] leading-9 text-headingColor font-[700] text-center">
                  Explore Our Medical Services
                </h2>
                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                  MarieCare offers a wide range of medical services, from general consultations to specialized treatments, all accessible through our expert doctors.
                </p>

                <Link
                  to="/doctors"
                  className="w-[44px] h-[44px] rounded-full border border-solid border-primaryColor mt-[30px] mx-auto flex items-center justify-center group hover:bg-primaryColor hover:border-none shadow-glowSoft"
                  aria-label="View doctors"
                >
                  <FaAngleRight className="group-hover:text-white w-6 h-5" />
                </Link>
              </div>
            </div>
            <div className="card py-[30px] px-5 ">
              <div className="flex items-center justify-center">
                <span className="pill">
                  <img src={icon03} alt="" className="w-6 h-6" />
                </span>
              </div>

              <div className="mt-[30px]">
                <h2 className="text-[26px] leading-9 text-headingColor font-[700] text-center">
                  Book Appointments with Ease
                </h2>
                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                  Our platform makes booking simple. Select your doctor, view their availability, and confirm your appointment online in just a few clicks.
                </p>

                <Link
                  to="/doctors"
                  className="w-[44px] h-[44px] rounded-full border border-solid border-primaryColor mt-[30px] mx-auto flex items-center justify-center group hover:bg-primaryColor hover:border-none shadow-glowSoft"
                  aria-label="View doctors"
                >
                  <FaAngleRight className="group-hover:text-white w-6 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="xl:w-[470px] mx-auto">
            <h2 className="heading heading--accent text-center">Our great doctors</h2>
            <p className="text__para text-center">
              Meet the dedicated professionals at MarieCare. Our team is committed to 
              providing exceptional, patient-focused medical services in Hungary.
            </p>
          </div>

          <DoctorsList />
        </div>
      </section>
    </>
  );
};

export default Home;
