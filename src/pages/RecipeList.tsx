import { KeyboardEvent, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../css/RecipeList.css';
import { extractRecipes, RecipeItem } from '../services/recipeMapper';
import { loadLocalRecipes } from '../services/recipeStorage';

function RecipeList() {
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const queryKeyword = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('q') ?? '').trim().toLowerCase();
  }, [location.search]);

  const moveToDetail = (recipe: RecipeItem) => {
    navigate(`/recipes/${recipe.id}`, { state: { recipe } });
  };

  const handleCardKeyDown = (e: KeyboardEvent<HTMLElement>, recipe: RecipeItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      moveToDetail(recipe);
    }
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      const endpoints = ['/recipe/list', '/recipe/all', '/recipes', '/receipe/list'];
      let remoteRecipes: RecipeItem[] = [];
      let hasSuccessfulResponse = false;

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, { withCredentials: true });
          hasSuccessfulResponse = true;
          const normalized = extractRecipes(response.data);
          if (normalized.length > 0) {
            remoteRecipes = normalized;
            break;
          }
        } catch (_error) {
          // Try next endpoint shape.
        }
      }

      const localRecipes = loadLocalRecipes();
      const merged = [...remoteRecipes, ...localRecipes];

      setRecipes(merged);
      setLoading(false);

      if (!hasSuccessfulResponse && merged.length === 0) {
        setError('レシピ一覧を読み込めませんでした。');
      } else {
        setError('');
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = useMemo(() => {
    if (!queryKeyword) {
      return recipes;
    }

    return recipes.filter((recipe) => {
      const targetParts: string[] = [
        recipe.title ?? '',
        recipe.info ?? '',
        ...recipe.steps.map((step) => step.text ?? ''),
      ];
      const target = targetParts.join(' ').toLowerCase();
      return target.includes(queryKeyword);
    });
  }, [recipes, queryKeyword]);

  const hasRecipes = useMemo(() => filteredRecipes.length > 0, [filteredRecipes]);

  return (
    <div className='recipe-list-page'>
      <Header />
      <div className='recipe-list-wrap'>
        <h2 className='recipe-list-title'>みんなのレシピ</h2>
        {loading ? <p className='recipe-list-message'>読み込み中...</p> : null}
        {!loading && error ? <p className='recipe-list-message error'>{error}</p> : null}
        {!loading && !error && !hasRecipes ? (
          <p className='recipe-list-message'>
            {queryKeyword ? '検索結果がありません。' : '登録されたレシピがありません。'}
          </p>
        ) : null}
        {!loading && hasRecipes ? (
          <div className='recipe-card-grid'>
            {filteredRecipes.map((recipe) => {
              const previewImage = recipe.thumbnailImage ?? recipe.steps.find((step) => step.image)?.image ?? null;

              return (
                <article
                  className='recipe-card'
                  key={recipe.id}
                  onClick={() => moveToDetail(recipe)}
                  onKeyDown={(e) => handleCardKeyDown(e, recipe)}
                  role='button'
                  tabIndex={0}
                >
                  {previewImage ? (
                    <img className='recipe-card-image' src={previewImage} alt={recipe.title} />
                  ) : (
                    <div className='recipe-card-image placeholder'>NO IMAGE</div>
                  )}
                  <div className='recipe-card-body'>
                    <h3>{recipe.title}</h3>
                    <div className='recipe-card-footer'>
                      <span className='recipe-view-count'>閲覧 {recipe.viewCount ?? 0}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default RecipeList;
