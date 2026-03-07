import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Join from './pages/Join';
import Main from './pages/Main';
import FindId from './pages/FindId';
import RecipeUpload from './pages/RecipeUpload';
import RecipeList from './pages/RecipeList';
import RecipeDetail from './pages/RecipeDetail';
import MyPage from './pages/MyPage';
import MyRecipes from './pages/MyRecipes';
import MyRecipeEdit from './pages/MyRecipeEdit';

const AppInner: React.FunctionComponent = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path={'/'} element={<Login />} />
          <Route path={'/login'} element={<Login />} />
          <Route path={'/join'} element={<Join />} />
          <Route path={'/main'} element={<Main />} />
          <Route path={'/findId'} element={<FindId />} />
          <Route path={'/recipes'} element={<RecipeList />} />
          <Route path={'/recipes/:id'} element={<RecipeDetail />} />
          <Route path={'/recipeUpload'} element={<RecipeUpload />} />
          <Route path={'/mypage'} element={<MyPage />} />
          <Route path={'/my-recipes'} element={<MyRecipes />} />
          <Route path={'/my-recipes/:id/edit'} element={<MyRecipeEdit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppInner;
