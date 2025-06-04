import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Join from './pages/Join';
import Main from './pages/Main';
import FindId from './pages/FindId';


export interface IApplicationProps {}

const AppInner: React.FunctionComponent<IApplicationProps> = (props) => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path={'/'} element={<Login />} />
          <Route path={'/login'} element={<Login />} />
          <Route path={'/join'} element={<Join />} />
          <Route path={'/main'} element={<Main />} />
          <Route path={'/findId'} element={<FindId />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppInner;