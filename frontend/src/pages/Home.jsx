import { Link } from "react-router-dom";
import heroImg01 from "../assets/images/hero-img01.jpg";
import heroImg02 from "../assets/images/hero-img02.jpg";
import icon01 from "../assets/images/icon01.png";
import icon02 from "../assets/images/icon02.png";
import icon03 from "../assets/images/icon03.png";
import { FaAngleRight } from "react-icons/fa";
import { BsShieldCheck, BsCalendar2Check, BsHeartPulse } from "react-icons/bs";

import DoctorsList from "../components/Doctors/DoctorsList";

const Home = () => {
  const heroHighlights = [
    {
      icon: <BsShieldCheck className="text-lg" />,
      title: "Verified Specialists",
      metric: "120+",
      description: "across 20 disciplines",
    },
    {
      icon: <BsCalendar2Check className="text-lg" />,
      title: "Same-Day Slots",
      metric: "82%",
      description: "appointments confirmed",
    },
    {
      icon: <BsHeartPulse className="text-lg" />,
      title: "Continuity of Care",
      metric: "24/7",
      description: "clinical follow-up",
    },
  ];

  const serviceHighlights = [
    {
      icon: icon01,
      title: "Find Your Doctor",
      copy:
        "Search a curated network of specialists, review credentials, and pick the doctor who fits your health goals.",
    },
    {
      icon: icon02,
      title: "Explore Medical Services",
      copy:
        "From diagnostics to chronic care, discover multi-disciplinary services supported by leading hospitals.",
    },
    {
      icon: icon03,
      title: "Book in Minutes",
      copy:
        "Select availability that suits you, confirm instantly, and manage upcoming visits from one dashboard.",
    },
  ];

  return (
    <>
      <section className="hero__section pt-[60px] 2xl:h-[800px]">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-[90px] items-center justify-between">
            <div>
              <div className=" lg:w-[570px]">
                <h1
                  className="heading bg-clip-text text-transparent bg-brand-diagonal-strong text-[36px] leading-[46px] md:text-[60px] md:leading-[70px] animate-gradient-x"
                  style={{ backgroundSize: "160% 160%" }}
                >
                  We help patients live a healthy, longer life.
                </h1>
                <p className="text__para">
                  Welcome to MarieCare, your trusted partner for accessible and personalized healthcare. 
                  Our platform connects you with experienced doctors, allows you to book appointments seamlessly, 
                  and manage your health journey with ease. Your well-being is our priority.
                </p>
                <ul className="mt-8 flex flex-wrap items-center gap-4 md:gap-6">
                  {heroHighlights.map((item, index) => (
                    <li key={index} className="stat-chip">
                      <span className="stat-chip__icon">{item.icon}</span>
                      <span>
                        <span className="block text-xs font-medium uppercase tracking-[0.3em] text-primaryColor/70">
                          {item.title}
                        </span>
                        <span className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-extrabold text-headingColor">
                            {item.metric}
                          </span>
                          <span className="text-xs font-semibold text-textColor/70">
                            {item.description}
                          </span>
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to="/doctors">
                  <button className="btn">Book an Appointment</button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-[20px] lg:gap-[30px] justify-center md:justify-end items-center w-full lg:w-1/2 relative">
              <div className="w-full md:w-1/2 relative">
                <img
                  className="w-full h-auto object-cover rounded-[26px] shadow-panelShadow animate-float"
                  src={heroImg01}
                  alt="MarieCare Doctor"
                />
              </div>

              <div className="w-full md:w-1/2">
                <img
                  className="w-full h-auto object-cover rounded-[26px] shadow-panelShadow animate-float"
                  src={heroImg02}
                  alt="MarieCare Doctor 2"
                />
              </div>

              <div className="hero__badge">
                <span className="hero__badge-title">Patient Satisfaction</span>
                <span className="hero__badge-metric">97%</span>
                <span className="hero__badge-meta">Based on 4K+ post-visit surveys</span>
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
            {serviceHighlights.map(service => (
              <div key={service.title} className="card">
                <div className="card__body text-center">
                  <span className="pill mx-auto">
                    <img src={service.icon} alt="" className="w-6 h-6" />
                  </span>
                  <h3 className="text-[26px] leading-9 text-headingColor font-[700]">
                    {service.title}
                  </h3>
                  <p className="text-[16px] leading-7 text-textColor font-[400]">
                    {service.copy}
                  </p>
                  <Link
                    to="/doctors"
                    className="mx-auto mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-solid border-primaryColor/40 bg-white text-primaryColor transition-all duration-300 hover:bg-primaryColor hover:text-white shadow-panelShadow hover:shadow-glowSoft"
                    aria-label={`Explore ${service.title}`}
                  >
                    <FaAngleRight className="w-6 h-5" />
                  </Link>
                </div>
              </div>
            ))}
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
