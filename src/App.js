import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { Navbar, Footer, Sidebar, ThemeSettings } from './Components';
import './App.css';

import { useStateContext } from './Contexts/ContextProvider';
import { ToastContainer } from 'react-toastify';

const App = () => {
  const { setCurrentMode, currentMode, activeMenu, themeSettings, setThemeSettings } = useStateContext();

  useEffect(() => {
    const currentThemeMode = localStorage.getItem('themeMode');
    if (currentThemeMode) {
      setCurrentMode(currentThemeMode);
    }
  }, [setCurrentMode]);

  const [width, setWidth] = useState(0);
  const sidebarRef = useRef(null);

  useEffect(() => {
  const resizeObserver = new ResizeObserver(() => {
    if (sidebarRef.current) {
      const newWidth = Math.round(sidebarRef.current.offsetWidth);
      setWidth((prev) =>
        Math.abs(prev - newWidth) > 3 ? newWidth : prev
      );
    }
  });

  if (sidebarRef.current) {
    resizeObserver.observe(sidebarRef.current);
  }

  return () => resizeObserver.disconnect();
}, []);

  const local = useLocation() // 70-строка

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex relative">
        <div className="fixed right-4 bottom-4" style={{ zIndex: '1000' }}>
          <TooltipComponent content="Settings" position="Top">
            <button
              type="button"
              onClick={() => setThemeSettings(true)}
              className="text-3xl p-3 hover:drop-shadow-xl bg-primary text-white rounded-full"
            >
              <FiSettings />
            </button>
          </TooltipComponent>
        </div>
        {activeMenu ? (
          <div className="w-1/6 fixed sidebar" ref={sidebarRef}>
            <Sidebar />
          </div>
        ) : (
          <div className="w-0 bg-base-100">
            <Sidebar />
          </div>
        )}
        <div
          className={
            activeMenu
              ? local.pathname == "/" ? `bg-base-300 min-h-screen md:w-5/6 w-full overflow-x-hidden` : `bg-base-300 min-h-screen md:w-5/6 w-full`
              : 'bg-base-300 w-full min-h-screen flex-2'
          }
          style={activeMenu ? { marginLeft: `${width}px` } : {}}
        >
          <div className="fixed md:static shadow bg-base-100 navbar w-full">
            <Navbar />
          </div>
          <div className="px-5 py-8 w-full">
            {themeSettings && <ThemeSettings />}
            <Outlet /> {/* Render nested routes here */}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default App;
///asdsadsaassdsadsasda
//sasass