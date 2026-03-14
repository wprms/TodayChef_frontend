import { Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Layout.css';

export interface ILayoutProps {}

const Layout: React.FunctionComponent<ILayoutProps> = () => {
  const location = useLocation();
  const isSimpleLayout =
    location.pathname.includes('/certification') ||
    location.pathname.includes('/agreement') ||
    location.pathname.includes('/private');

  return (
    <div className='layout-shell'>
      {!isSimpleLayout ? (
        <>
          <aside className='ad-fixed ad-fixed-left' aria-label='left-banner-slot'>
            <div className='ad-slot'>
              <span className='ad-badge'>AD</span>
              <strong>LEFT BANNER</strong>
              <p>240 x 600</p>
            </div>
          </aside>
          <aside className='ad-fixed ad-fixed-right' aria-label='right-banner-slot'>
            <div className='ad-slot'>
              <span className='ad-badge'>AD</span>
              <strong>RIGHT BANNER</strong>
              <p>240 x 600</p>
            </div>
          </aside>
        </>
      ) : null}
      <div className={isSimpleLayout ? 'layout-content-only' : 'layout-main'}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
