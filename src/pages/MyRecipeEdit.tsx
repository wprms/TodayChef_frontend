import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Header from '../components/Header';
import '../css/Recipe.css';
import { buildAuthHeaders } from '../utils/authHeaders';
import { extractSingleRecipe, RecipeIngredient, RecipeStep } from '../services/recipeMapper';

type RecipeForm = {
  title: string;
  info: string;
  ingredients: RecipeIngredient[];
  thumbnailImage: string | null;
  steps: RecipeStep[];
  instagramLink: string;
  videoLink: string;
  videoFile: string | null;
};

const defaultForm: RecipeForm = {
  title: '',
  info: '',
  ingredients: [{ name: '', amount: '' }],
  thumbnailImage: null,
  steps: [{ text: '', image: null }],
  instagramLink: '',
  videoLink: '',
  videoFile: null,
};

function MyRecipeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const stepFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const thumbnailFileRef = useRef<HTMLInputElement | null>(null);
  const videoFileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<RecipeForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [draggingStepIndex, setDraggingStepIndex] = useState<number | null>(null);
  const [dragOverStepIndex, setDragOverStepIndex] = useState<number | null>(null);

  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const endpoints = [`/recipe/${id}`, `/recipe/view/${id}`, `/receipe/${id}`, `/recipe/detail/${id}`];
      let loaded = false;

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, { withCredentials: true, headers: buildAuthHeaders() });
          const parsed = extractSingleRecipe(response.data);
          if (parsed) {
            setForm({
              title: parsed.title,
              info: parsed.info,
              ingredients: parsed.ingredients.length > 0 ? parsed.ingredients : [{ name: '', amount: '' }],
              thumbnailImage: parsed.thumbnailImage ?? null,
              steps: parsed.steps.length > 0 ? parsed.steps : [{ text: '', image: null }],
              instagramLink: parsed.instagramLink ?? '',
              videoLink: parsed.videoLink ?? '',
              videoFile: parsed.videoFile ?? null,
            });
            loaded = true;
            break;
          }
        } catch (_error) {
          // try next endpoint
        }
      }

      if (!loaded) {
        await Swal.fire({ icon: 'error', title: 'エラー', text: 'レシピを読み込めませんでした。' });
        navigate('/my-recipes');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  const updateStepText = (index: number, value: string) => {
    const next = [...form.steps];
    next[index] = { ...next[index], text: value };
    setForm({ ...form, steps: next });
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const next = [...form.steps];
      next[index] = { ...next[index], image: (reader.result as string) ?? null };
      setForm({ ...form, steps: next });
    };
    reader.readAsDataURL(file);
  };

  const triggerImageUpload = (index: number) => {
    stepFileRefs.current[index]?.click();
  };

  const triggerThumbnailUpload = () => {
    thumbnailFileRef.current?.click();
  };

  const triggerVideoUpload = () => {
    videoFileRef.current?.click();
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, thumbnailImage: (reader.result as string) ?? null }));
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, videoFile: (reader.result as string) ?? null }));
    };
    reader.readAsDataURL(file);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= form.steps.length ||
      toIndex >= form.steps.length
    ) {
      return;
    }

    const next = [...form.steps];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setForm({ ...form, steps: next });
  };

  const handleStepDragStart = (e: React.DragEvent<HTMLButtonElement>, index: number) => {
    setDraggingStepIndex(index);
    setDragOverStepIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleStepDragOver = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStepIndex !== targetIndex) {
      setDragOverStepIndex(targetIndex);
    }
  };

  const handleStepDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggingStepIndex ?? Number(e.dataTransfer.getData('text/plain'));

    if (!Number.isNaN(sourceIndex)) {
      moveStep(sourceIndex, targetIndex);
    }

    setDraggingStepIndex(null);
    setDragOverStepIndex(null);
  };

  const handleStepDragEnd = () => {
    setDraggingStepIndex(null);
    setDragOverStepIndex(null);
  };

  const addStep = () => {
    setForm({ ...form, steps: [...form.steps, { text: '', image: null }] });
  };

  const updateIngredient = (index: number, key: 'name' | 'amount', value: string) => {
    const next = [...form.ingredients];
    next[index] = { ...next[index], [key]: value };
    setForm({ ...form, ingredients: next });
  };

  const addIngredient = () => {
    setForm({ ...form, ingredients: [...form.ingredients, { name: '', amount: '' }] });
  };

  const removeIngredient = (index: number) => {
    if (form.ingredients.length === 1) {
      return;
    }
    const next = [...form.ingredients];
    next.splice(index, 1);
    setForm({ ...form, ingredients: next });
  };

  const removeStep = (index: number) => {
    if (form.steps.length === 1) {
      return;
    }

    const next = [...form.steps];
    next.splice(index, 1);
    setForm({ ...form, steps: next });
  };

  const saveRecipe = async () => {
    if (!id) {
      return;
    }

    if (!form.title.trim()) {
      await Swal.fire({ icon: 'warning', title: 'エラー', text: 'タイトルを入力してください。' });
      return;
    }

    if (!form.info.trim()) {
      await Swal.fire({ icon: 'warning', title: 'エラー', text: '紹介を入力してください。' });
      return;
    }

    if (!form.steps[0]?.text?.trim()) {
      await Swal.fire({ icon: 'warning', title: 'エラー', text: 'レシピ手順を入力してください。' });
      return;
    }

    try {
      await axios.put(
        `/recipe/${id}`,
        {
          title: form.title,
          info: form.info,
          ingredients: form.ingredients.filter((item) => (item.name ?? '').trim() || (item.amount ?? '').trim()),
          thumbnailImage: form.thumbnailImage,
          steps: form.steps,
          instagramLink: form.instagramLink,
          videoLink: form.videoLink,
          videoFile: form.videoFile,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(),
          },
        },
      );

      await Swal.fire({ icon: 'success', title: '修正しました', confirmButtonText: '確認' });
      navigate('/my-recipes');
    } catch (_error) {
      await Swal.fire({ icon: 'error', title: 'エラー', text: '修正に失敗しました。' });
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className='text-center' style={{ marginTop: '2rem' }}>
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className='row justify-content-center'>
      <Header />
      <div className='text-center'>
        <div className='uploadMain'>
          <div className='uploadBasicInfo'>
            <div className='title-input-container input-group'>
              <textarea
                className='uploadText'
                rows={1}
                placeholder='  '
                style={{ overflow: 'hidden', resize: 'none' }}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <label htmlFor='title-input' className='input-label'>
                タイトル
              </label>
            </div>

            <div className='thumbnail-input-container input-group'>
              <label htmlFor='thumbnail-image' className='input-label'>
                代表写真（任意）
              </label>
              <div className='thumbnail-upload-box' onClick={triggerThumbnailUpload}>
                {form.thumbnailImage ? (
                  <img src={form.thumbnailImage} className='step-image-preview' alt='代表写真' />
                ) : (
                  <div className='upload-placeholder'>＋代表写真を追加</div>
                )}
                <input
                  id='thumbnail-image'
                  type='file'
                  accept='image/*'
                  style={{ display: 'none' }}
                  ref={thumbnailFileRef}
                  onChange={handleThumbnailChange}
                />
              </div>
            </div>
            <div className='intro-input-container input-group'>
              <textarea
                className='uploadText'
                rows={2}
                placeholder='  '
                style={{ overflow: 'hidden', resize: 'none' }}
                value={form.info}
                onChange={(e) => setForm({ ...form, info: e.target.value })}
              />
              <label htmlFor='info-input' className='input-label'>
                紹介
              </label>
            </div>
            <div className='recipe-input-container input-group'>
              {form.steps.map((step, index) => (
                <div
                  key={`step-${index}`}
                  className={`recipe-step-box${draggingStepIndex === index ? ' dragging' : ''}${dragOverStepIndex === index ? ' drag-over' : ''}`}
                  style={{ marginTop: index === 0 ? '0' : '1.5rem' }}
                  onDragOver={(e) => handleStepDragOver(e, index)}
                  onDrop={(e) => handleStepDrop(e, index)}
                >
                  <div className='step-header'>
                    <span>{String.fromCharCode(9312 + index)} レシピ</span>
                    <button
                      type='button'
                      className='step-drag-handle'
                      draggable
                      onDragStart={(e) => handleStepDragStart(e, index)}
                      onDragEnd={handleStepDragEnd}
                    >
                      順序変更
                    </button>
                  </div>

                  <textarea
                    className='step-description'
                    placeholder='説明を入力してください'
                    value={step.text ?? ''}
                    onChange={(e) => updateStepText(index, e.target.value)}
                  />

                  <div className='step-image-upload' onClick={() => triggerImageUpload(index)}>
                    {step.image ? (
                      <img src={step.image} className='step-image-preview' alt={`レシピ${index + 1}画像`} />
                    ) : (
                      <div className='upload-placeholder'>＋画像を追加</div>
                    )}
                    <input
                      type='file'
                      accept='image/*'
                      style={{ display: 'none' }}
                      ref={(el) => (stepFileRefs.current[index] = el)}
                      onChange={(e) => handleImageChange(index, e)}
                    />
                  </div>

                  <div className='step-buttons'>
                    {index > 0 && (
                      <button className='add-step-button delete-button' onClick={() => removeStep(index)} type='button'>
                        削除
                      </button>
                    )}
                    {index === form.steps.length - 1 && (
                      <button className='add-step-button' onClick={addStep} type='button'>
                        ＋ レシピ追加
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className='ingredients-input-container input-group'>
              <label htmlFor='ingredients-input' className='input-label'>
                レシピ材料（例: 醤油 | 2スプーン）
              </label>
              <div className='ingredient-list'>
                {form.ingredients.map((ingredient, index) => (
                  <div key={`ingredient-${index}`} className='ingredient-row'>
                    <input
                      className='ingredient-input'
                      type='text'
                      placeholder='材料名'
                      value={ingredient.name ?? ''}
                      onChange={(e) => updateIngredient(index, 'name', e.currentTarget.value)}
                    />
                    <input
                      className='ingredient-input'
                      type='text'
                      placeholder='分量'
                      value={ingredient.amount ?? ''}
                      onChange={(e) => updateIngredient(index, 'amount', e.currentTarget.value)}
                    />
                    {index > 0 ? (
                      <button className='ingredient-remove' type='button' onClick={() => removeIngredient(index)}>
                        削除
                      </button>
                    ) : null}
                  </div>
                ))}
                <button className='ingredient-add' type='button' onClick={addIngredient}>
                  ＋ 材料追加
                </button>
              </div>
            </div>
            <div className='video-file-container input-group'>
              <label htmlFor='video-file' className='input-label'>
                動画ファイル（任意）
              </label>
              <div className='video-upload-box' onClick={triggerVideoUpload}>
                {form.videoFile ? (
                  <video className='video-preview' controls src={form.videoFile} />
                ) : (
                  <div className='upload-placeholder'>＋動画追加</div>
                )}
                <input
                  id='video-file'
                  type='file'
                  accept='video/*'
                  style={{ display: 'none' }}
                  ref={videoFileRef}
                  onChange={handleVideoFileChange}
                />
              </div>
            </div>
            <div className='video-links-container input-group'>
              <textarea
                className='uploadText'
                rows={1}
                placeholder='  '
                style={{ overflow: 'hidden', resize: 'none' }}
                value={form.videoLink}
                onChange={(e) => setForm({ ...form, videoLink: e.target.value })}
              />
              <label htmlFor='video-link' className='input-label'>
                動画リンク（任意）
              </label>
            </div>

            <div className='social-links-container input-group'>
              <textarea
                className='uploadText'
                rows={1}
                placeholder='  '
                style={{ overflow: 'hidden', resize: 'none' }}
                value={form.instagramLink}
                onChange={(e) => setForm({ ...form, instagramLink: e.target.value })}
              />
              <label htmlFor='instagram-link' className='input-label'>
                SNSリンク（任意）
              </label>
            </div>
          </div>
        </div>

        <div className='uploadBottom'>
          <button className='upload-btn' onClick={saveRecipe}>
            修正保存
          </button>
          <button className='upload-btn back-btn' onClick={() => navigate('/my-recipes')}>
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyRecipeEdit;
