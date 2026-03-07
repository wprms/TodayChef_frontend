import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useParams } from 'react-router-dom';
import Header from '../components/Header';
import '../css/RecipeDetail.css';
import { extractRecipes, extractSingleRecipe, RecipeItem } from '../services/recipeMapper';
import { loadLocalRecipes } from '../services/recipeStorage';

type LocationState = {
  recipe?: RecipeItem;
};

function RecipeDetail() {
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [recipe, setRecipe] = useState<RecipeItem | null>(state?.recipe ?? null);
  const [loading, setLoading] = useState(state?.recipe ? false : true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || state?.recipe) {
      return;
    }

    const fetchRecipeDetail = async () => {
      const endpointCandidates = [`/recipe/detail/${id}`, `/recipe/${id}`, `/recipe/view/${id}`, `/receipe/${id}`];

      for (const endpoint of endpointCandidates) {
        try {
          const response = await axios.get(endpoint, { withCredentials: true });
          const parsed = extractSingleRecipe(response.data);
          if (parsed) {
            setRecipe({ ...parsed, id });
            setLoading(false);
            setError('');
            return;
          }
        } catch (_error) {
          // Try next endpoint shape.
        }
      }

      const listEndpoints = ['/recipe/list', '/recipe/all', '/recipes', '/receipe/list'];
      for (const endpoint of listEndpoints) {
        try {
          const response = await axios.get(endpoint, { withCredentials: true });
          const list = extractRecipes(response.data);
          const matched = list.find((item) => item.id === id);
          if (matched) {
            setRecipe(matched);
            setLoading(false);
            setError('');
            return;
          }
        } catch (_error) {
          // Continue fallback.
        }
      }

      const localRecipe = loadLocalRecipes().find((item) => item.id === id);
      if (localRecipe) {
        setRecipe(localRecipe);
        setLoading(false);
        setError('');
        return;
      }

      setLoading(false);
      setError('レシピ詳細を読み込めませんでした。');
    };

    fetchRecipeDetail();
  }, [id, state?.recipe]);

  const previewImage = useMemo(() => {
    if (!recipe) {
      return null;
    }
    return recipe.steps.find((step) => step.image)?.image ?? null;
  }, [recipe]);

  return (
    <div className='recipe-detail-page'>
      <Header />
      <div className='recipe-detail-wrap'>
        <div className='recipe-detail-top'>
          <Link to='/recipes' className='recipe-back-link'>
            ← レシピ一覧へ
          </Link>
        </div>
        {loading ? <p className='recipe-detail-message'>読み込み中...</p> : null}
        {!loading && error ? <p className='recipe-detail-message error'>{error}</p> : null}
        {!loading && !error && recipe ? (
          <article className='recipe-detail-card'>
            {previewImage ? (
              <img className='recipe-detail-image' src={previewImage} alt={recipe.title} />
            ) : (
              <div className='recipe-detail-image placeholder'>NO IMAGE</div>
            )}
            <div className='recipe-detail-content'>
              <h2>{recipe.title}</h2>
              <p className='recipe-detail-info'>{recipe.info || '紹介文がありません。'}</p>
              <div className='recipe-detail-links'>
                {recipe.instagramLink ? (
                  <a href={recipe.instagramLink} target='_blank' rel='noreferrer'>
                    Instagram
                  </a>
                ) : null}
                {recipe.videoLink ? (
                  <a href={recipe.videoLink} target='_blank' rel='noreferrer'>
                    YouTube
                  </a>
                ) : null}
              </div>
              <section className='recipe-steps'>
                <h3>レシピ手順</h3>
                {recipe.steps.length === 0 ? <p>手順がありません。</p> : null}
                {recipe.steps.map((step, index) => (
                  <div className='recipe-step-item' key={`${recipe.id}-step-${index}`}>
                    <div className='step-number'>STEP {index + 1}</div>
                    <p>{step.text || '説明なし'}</p>
                    {step.image ? (
                      <img src={step.image} alt={`${recipe.title} step ${index + 1}`} className='recipe-step-image' />
                    ) : null}
                  </div>
                ))}
              </section>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}

export default RecipeDetail;
