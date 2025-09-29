import React from "react";
import { Link, NavLink } from "react-router-dom";
import { SiShopware } from "react-icons/si";
import { MdAddBusiness, MdOutlineCancel } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useStateContext } from "../Contexts/ContextProvider";
import { FiShoppingBag } from "react-icons/fi";
import { IoMdContacts } from "react-icons/io";
import { AiOutlineShoppingCart } from "react-icons/ai"; // Added missing import
import { BsCalendarEvent } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { activeMenu, setActiveMenu, screenSize, currentMode } = useStateContext();
  const [openSections, setOpenSections] = React.useState({});

  const links = [
    {
      title: "Admin",
      links: [
        {
          name: "Dashboard",
          route: "",
          icon: <FiShoppingBag />,
        },
      ],
    },
    {
      title: "Users",
      links: [
        {
          name: "Users",
          route: "all-users",
          icon: <IoMdContacts />,
        },
      ],
    },
    {
      title: "Product",
      links: [
        {
          name: "Shop",
          route: "customers",
          icon: <AiOutlineShoppingCart />,
        },
        {
          name: "shop/history",
          route: "workers",
          icon: <AiOutlineShoppingCart />,
        },
      ],
    },
    {
      title: "Events",
      links: [
        {
          name: "Events",
          route: "events",
          icon: <BsCalendarEvent />,
        },
      ],
    },
    {
      title: "Clubs",
      links: [
        {
          name: "Club",
          route: "Club",
          icon: <FaUsers />,
        },
        {
          name: "Club/Category",
          route: "SubCLub",
          icon: <BiCategory />,
        },
      ],
    },
  ];

  const handleCloseSidebar = () => {
    if (activeMenu && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const activeLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg bg-primary text-white hover:bg-primary-focus text-md m-2";
  const normalLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-base-content hover:bg-base-300 text-md m-2";

  const sectionVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 },
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 },
      },
    },
  };

  return (
    <div className="ml-3 h-screen overflow-auto md:overflow-auto pb-10 bg-base-100">
      {activeMenu && (
        <>
          <div className="flex justify-center">
            <Link
              to="/"
              onClick={handleCloseSidebar}
              className="items-center gap-3 ml-3 mt-3 flex text-xl font-extrabold tracking-tight text-base-content"
            >
              <div className="flex items-center mr-10">
                <img
                  className="w-14 flex items-start"
                  src={currentMode === "Dark" ? "/images/logodark.png" : "/images/logo.png"}
                  alt="xz"
                />
                <p className="text-2xl text-base-900">Univibe</p>
              </div>
            </Link>
            <TooltipComponent content="Menu" position="BottomCenter">
              <button
                type="button"
                onClick={() => setActiveMenu(!activeMenu)}
                className="text-xl rounded-full p-3 hover:bg-base-300 text-base-content mt-4 block md:hidden"
              >
                <MdOutlineCancel />
              </button>
            </TooltipComponent>
          </div>
          <div className="mt-10">
            {links.map((item) => (
              <div key={item.title}>
                <p
                  className="m-3 mt-4 uppercase text-base-content cursor-pointer flex items-center gap-2 font-bold"
                  onClick={() => toggleSection(item.title)}
                >
                  <FaChevronDown
                    className={`transition-transform duration-300 text-sm ${
                      openSections[item.title] ? "rotate-180" : ""
                    }`}
                  />
                  {item.title}
                </p>
                <AnimatePresence>
                  {openSections[item.title] && (
                    <motion.div
                      variants={sectionVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="overflow-hidden"
                    >
                      {item.links.map((link) => (
                        <NavLink
                          to={`/${link.route}`}
                          key={link.name}
                          onClick={handleCloseSidebar}
                          className={({ isActive }) =>
                            isActive ? activeLink : normalLink
                          }
                        >
                          {link.icon}
                          <span className="capitalize">{link.name}</span>
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;