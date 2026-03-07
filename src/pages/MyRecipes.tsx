import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getCookie } from '../utils/cookie';
import Header from '../components/Header';
import '../css/MyRecipes.css';
import { extractRecipes, RecipeItem } from '../services/recipeMapper';

function MyRecipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    const accessToken = getCookie('accessToken');
    const refreshToken = getCookie('refreshToken');
    const lastLoginTime = getCookie('lastLoginTime');

    if (accessToken) headers.accessToken = accessToken;
    if (refreshToken) headers.refreshToken = refreshToken;
    if (lastLoginTime) headers.lastLoginTime = lastLoginTime;

    return headers;
  };

  const fetchMyRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/recipe/my', { withCredentials: true, headers: authHeaders() });
      setRecipes(extractRecipes(response.data));
      setError('');
    } catch (_error) {
      setError('マイレシピを読み込めませんでした。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const deleteRecipe = async (id: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '削除確認',
      text: 'このレシピを削除しますか？',
      showCancelButton: true,
      confirmButtonText: '削除',
      cancelButtonText: 'キャンセル',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await axios.delete(`/recipe/${id}`, { withCredentials: true, headers: authHeaders() });
      await Swal.fire({ icon: 'success', title: '削除しました', confirmButtonText: 'OK' });
      fetchMyRecipes();
    } catch (_error) {
      await Swal.fire({ icon: 'error', title: 'エラー', text: '削除に失敗しました。' });
    }
  };

  return (
    <div className='my-recipes-page'>
      <Header />
      <div className='my-recipes-wrap'>
        <h2>マイレシピ管理</h2>
        <p className='my-recipes-caption'>カードをクリックすると編集ページに移動します。</p>

        {loading ? <p className='my-recipes-message'>読み込み中...</p> : null}
        {!loading && error ? <p className='my-recipes-message error'>{error}</p> : null}
        {!loading && !error && recipes.length === 0 ? (
          <p className='my-recipes-message'>登録したレシピはまだありません。</p>
        ) : null}

        <div className='my-recipe-list'>
          {recipes.map((recipe) => (
            <article
              key={recipe.id}
              className='my-recipe-card clickable'
              onClick={() => navigate(`/my-recipes/${recipe.id}/edit`)}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/my-recipes/${recipe.id}/edit`);
                }
              }}
            >
              <h3>{recipe.title}</h3>
              <p>{recipe.info || '紹介は未入力です。'}</p>
              <p>STEP {recipe.steps.length}</p>
              <div className='my-recipe-actions'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRecipe(recipe.id);
                  }}
                >
                  削除
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyRecipes;
