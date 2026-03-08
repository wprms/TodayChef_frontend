import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Main.css';
import { extractRecipes, RecipeItem } from '../services/recipeMapper';

function Main() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRecipes = async () => {
      const endpoints = ['/recipe/list', '/recipe/all', '/receipe/list'];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, { withCredentials: true });
          const list = extractRecipes(response.data);
          if (list.length > 0) {
            setRecipes(list);
            setLoading(false);
            return;
          }
        } catch (_error) {
          // try next endpoint
        }
      }

      setRecipes([]);
      setLoading(false);
    };

    fetchTopRecipes();
  }, []);

  const topRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => b.viewCount - a.viewCount).slice(0, 20);
  }, [recipes]);

  return (
    <div className='main-page'>
      <Header />
      <main className='main-wrap'>
        <section className='top-recipes-section'>
          <div className='section-head'>
            <h2>閲覧数ランキング</h2>
            <button type='button' className='go-list-btn' onClick={() => navigate('/recipes')}>
              レシピ一覧へ
            </button>
          </div>

          {loading ? <p className='main-message'>読み込み中...</p> : null}
          {!loading && topRecipes.length === 0 ? <p className='main-message'>レシピがまだありません。</p> : null}

          {!loading && topRecipes.length > 0 ? (
            <div className='top-recipe-grid'>
              {topRecipes.map((recipe, index) => {
                const previewImage = recipe.thumbnailImage ?? recipe.steps.find((step) => step.image)?.image ?? null;
                return (
                  <article
                    key={recipe.id}
                    className='top-recipe-card'
                    onClick={() => navigate(`/recipes/${recipe.id}`, { state: { recipe } })}
                    role='button'
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate(`/recipes/${recipe.id}`, { state: { recipe } });
                      }
                    }}
                  >
                    {previewImage ? (
                      <img src={previewImage} alt={recipe.title} className='top-recipe-image' />
                    ) : (
                      <div className='top-recipe-image placeholder'>NO IMAGE</div>
                    )}
                    <div className='top-recipe-body'>
                      <div className='rank-badge'>#{index + 1}</div>
                      <h3>{recipe.title}</h3>
                      <div className='top-recipe-view'>閲覧 {recipe.viewCount ?? 0}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default Main;
