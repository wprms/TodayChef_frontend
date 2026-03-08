import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { buildAuthHeaders } from '../utils/authHeaders';
import Header from '../components/Header';
import '../css/MyRecipes.css';
import { extractRecipes, RecipeItem } from '../services/recipeMapper';

function MyRecipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/recipe/my', { withCredentials: true, headers: buildAuthHeaders() });
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

  const deleteRecipe = async (recipe: RecipeItem) => {
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
      const deleteIds = recipe.sourceIds.length > 0 ? recipe.sourceIds : [recipe.id];
      await Promise.all(
        deleteIds.map((id) => axios.delete(`/recipe/${id}`, { withCredentials: true, headers: buildAuthHeaders() })),
      );
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
          {recipes.map((recipe) => {
            const previewImage = recipe.thumbnailImage ?? recipe.steps.find((step) => step.image)?.image ?? null;
            return (
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
                {previewImage ? (
                  <img className='my-recipe-card-image' src={previewImage} alt={recipe.title} />
                ) : (
                  <div className='my-recipe-card-image placeholder'>NO IMAGE</div>
                )}
                <div className='my-recipe-card-body'>
                  <h3>{recipe.title}</h3>
                  <div className='my-recipe-actions'>
                    <span className='my-recipe-step-count'>STEP {recipe.steps.length}</span>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRecipe(recipe);
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyRecipes;
