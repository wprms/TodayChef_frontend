import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useParams } from 'react-router-dom';
import Header from '../components/Header';
import '../css/RecipeDetail.css';
import { extractRecipes, extractSingleRecipe, RecipeItem } from '../services/recipeMapper';
import { loadLocalRecipes } from '../services/recipeStorage';
import { buildAuthHeaders } from '../utils/authHeaders';
import { getCookie } from '../utils/cookie';

type LocationState = {
  recipe?: RecipeItem;
};

type RecipeComment = {
  commentId: string;
  writerId: string;
  commentText: string;
  recCreateDatetime: string;
};

const extractComments = (payload: unknown): RecipeComment[] => {
  const root = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const candidates = [payload, root.result, root.list, root.items, root.data];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }
    return candidate
      .filter((item) => item && typeof item === 'object')
      .map((item, index) => {
        const record = item as Record<string, unknown>;
        return {
          commentId:
            typeof record.commentId === 'string'
              ? record.commentId
              : typeof record.id === 'string'
                ? record.id
                : String(index),
          writerId:
            typeof record.writerId === 'string'
              ? record.writerId
              : typeof record.userSysId === 'string'
                ? record.userSysId
                : 'unknown',
          commentText:
            typeof record.commentText === 'string'
              ? record.commentText
              : typeof record.text === 'string'
                ? record.text
                : '',
          recCreateDatetime:
            typeof record.recCreateDatetime === 'string'
              ? record.recCreateDatetime
              : typeof record.createdAt === 'string'
                ? record.createdAt
                : '',
        };
      });
  }

  return [];
};

function RecipeDetail() {
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [recipe, setRecipe] = useState<RecipeItem | null>(state?.recipe ?? null);
  const [loading, setLoading] = useState(state?.recipe ? false : true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const isLoggedIn = Boolean(getCookie('accessToken') && getCookie('lastLoginTime'));

  useEffect(() => {
    if (!id) {
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
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchComments = async () => {
      setCommentLoading(true);
      setCommentError('');
      const endpoints = [`/recipe/${id}/comments`, `/receipe/${id}/comments`];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, { withCredentials: true });
          setComments(extractComments(response.data));
          setCommentLoading(false);
          return;
        } catch (_error) {
          // Try next endpoint.
        }
      }

      setCommentLoading(false);
      setCommentError('コメントを読み込めませんでした。');
    };

    fetchComments();
  }, [id]);

  const previewImage = useMemo(() => {
    if (!recipe) {
      return null;
    }
    return recipe.steps.find((step) => step.image)?.image ?? null;
  }, [recipe]);

  const embeddedVideoUrl = useMemo(() => {
    if (!recipe?.videoLink) {
      return '';
    }

    try {
      const url = new URL(recipe.videoLink);
      if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.replace('/', '');
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
      if (url.hostname.includes('youtube.com')) {
        const id = url.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
      return '';
    } catch (_error) {
      return '';
    }
  }, [recipe?.videoLink]);

  const submitComment = async () => {
    if (!id || !commentText.trim()) {
      return;
    }
    setCommentSubmitting(true);
    setCommentError('');

    try {
      await axios.post(
        `/recipe/${id}/comments`,
        { commentText: commentText.trim() },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(),
          },
        },
      );
      setCommentText('');
      const response = await axios.get(`/recipe/${id}/comments`, { withCredentials: true });
      setComments(extractComments(response.data));
    } catch (_error) {
      setCommentError('コメント登録に失敗しました。');
    } finally {
      setCommentSubmitting(false);
    }
  };

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
              {recipe.ingredients.length > 0 ? (
                <section className='recipe-ingredients'>
                  <h3>レシピ材料</h3>
                  <ul className='recipe-ingredient-list'>
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={`${recipe.id}-ingredient-${index}`}>
                        <span className='ingredient-name'>{ingredient.name || '-'}</span>
                        <span className='ingredient-amount'>{ingredient.amount || '-'}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
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
              {recipe.videoFile || embeddedVideoUrl || recipe.videoLink ? (
                <section className='recipe-video'>
                  <h3>動画</h3>
                  {recipe.videoFile ? (
                    <div className='recipe-video-frame-wrap'>
                      <video className='recipe-video-frame' controls src={recipe.videoFile} />
                    </div>
                  ) : embeddedVideoUrl ? (
                    <div className='recipe-video-frame-wrap'>
                      <iframe
                        className='recipe-video-frame'
                        src={embeddedVideoUrl}
                        title='recipe video'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                        referrerPolicy='strict-origin-when-cross-origin'
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                  {!recipe.videoFile && recipe.videoLink ? (
                    <a href={recipe.videoLink} target='_blank' rel='noreferrer' className='recipe-video-link'>
                      動画を開く
                    </a>
                  ) : null}
                </section>
              ) : null}
              <section className='recipe-comments'>
                <h3>コメント</h3>
                {commentLoading ? <p className='recipe-comment-message'>読み込み中...</p> : null}
                {!commentLoading && commentError ? <p className='recipe-comment-message error'>{commentError}</p> : null}
                {!commentLoading && !commentError && comments.length === 0 ? (
                  <p className='recipe-comment-message'>まだコメントがありません。</p>
                ) : null}
                {!commentLoading && comments.length > 0 ? (
                  <div className='recipe-comment-list'>
                    {comments.map((comment) => (
                      <article key={comment.commentId} className='recipe-comment-item'>
                        <div className='recipe-comment-head'>
                          <span className='recipe-comment-writer'>{comment.writerId}</span>
                          <span className='recipe-comment-time'>
                            {comment.recCreateDatetime ? new Date(comment.recCreateDatetime).toLocaleString('ja-JP') : ''}
                          </span>
                        </div>
                        <p>{comment.commentText}</p>
                      </article>
                    ))}
                  </div>
                ) : null}
                <div className='recipe-comment-form'>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.currentTarget.value)}
                    placeholder={isLoggedIn ? 'コメントを入力してください。' : 'コメント登録はログインが必要です。'}
                    disabled={!isLoggedIn || commentSubmitting}
                  />
                  <button type='button' onClick={submitComment} disabled={!isLoggedIn || commentSubmitting}>
                    {commentSubmitting ? '送信中...' : 'コメント投稿'}
                  </button>
                </div>
              </section>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}

export default RecipeDetail;
