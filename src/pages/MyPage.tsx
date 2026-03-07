import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import '../css/MyPage.css';
import { extractRecipes } from '../services/recipeMapper';

type MyPageInfo = {
  userSysId?: string;
  userLoginId?: string;
  userMail?: string;
};

function MyPage() {
  const [info, setInfo] = useState<MyPageInfo | null>(null);
  const [recipeCount, setRecipeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPage = async () => {
      try {
        const [memberResponse, recipeResponse] = await Promise.all([
          axios.get('/member/me', { withCredentials: true }),
          axios.get('/recipe/my', { withCredentials: true }),
        ]);

        const payload = memberResponse.data?.result ?? null;
        const myRecipes = extractRecipes(recipeResponse.data);

        setInfo(payload);
        setRecipeCount(myRecipes.length);
        setError('');
      } catch (_error) {
        setError('マイページ情報を読み込めませんでした。');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPage();
  }, []);

  return (
    <div className='mypage-page'>
      <Header />
      <div className='mypage-wrap'>
        <h2>マイページ</h2>
        {loading ? <p className='mypage-message'>読み込み中...</p> : null}
        {!loading && error ? <p className='mypage-message error'>{error}</p> : null}
        {!loading && !error && info ? (
          <div className='mypage-card'>
            <div className='mypage-row'>
              <span>ユーザー番号</span>
              <strong>{info.userSysId || '-'}</strong>
            </div>
            <div className='mypage-row'>
              <span>ログインID</span>
              <strong>{info.userLoginId || '-'}</strong>
            </div>
            <div className='mypage-row'>
              <span>メールアドレス</span>
              <strong>{info.userMail || '-'}</strong>
            </div>
            <div className='mypage-row'>
              <span>アップロードしたレシピ数</span>
              <strong>{recipeCount}</strong>
            </div>
            <div className='mypage-actions'>
              <Link to='/my-recipes' className='mypage-link-button'>
                マイレシピ管理
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MyPage;
