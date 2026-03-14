import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../css/Recipe.css';
import Header from '../components/Header';
import { buildAuthHeaders } from '../utils/authHeaders';
import { ResponseData } from '../services/apiTypes';

type RecipeStep = {
  text: string;
  image: string | null;
};

type RecipeIngredient = {
  name: string;
  amount: string;
};

function RecipeUpload() {
  const [title, setTitle] = useState('');
  const [info, setInfo] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([{ name: '', amount: '' }]);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [steps, setSteps] = useState<RecipeStep[]>([{ text: '', image: null }]);
  const [instagramLink, setInstagramLink] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [draggingStepIndex, setDraggingStepIndex] = useState<number | null>(null);
  const [dragOverStepIndex, setDragOverStepIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const backToMain = () => {
    navigate('/main');
  };

  const stepFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const thumbnailFileRef = useRef<HTMLInputElement | null>(null);
  const videoFileRef = useRef<HTMLInputElement | null>(null);

  const updateStepText = (index: number, value: string) => {
    const updated = [...steps];
    updated[index].text = value;
    setSteps(updated);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...steps];
        updated[index].image = reader.result as string;
        setSteps(updated);
      };
      reader.readAsDataURL(file);
    }
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
      setThumbnailImage((reader.result as string) ?? null);
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
      setVideoFile((reader.result as string) ?? null);
    };
    reader.readAsDataURL(file);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= steps.length || toIndex >= steps.length) {
      return;
    }

    const next = [...steps];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setSteps(next);
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
    setSteps((prev) => [...prev, { text: '', image: null }]);
  };

  const updateIngredient = (index: number, key: 'name' | 'amount', value: string) => {
    const next = [...ingredients];
    next[index] = { ...next[index], [key]: value };
    setIngredients(next);
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: '', amount: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length === 1) {
      return;
    }
    const next = [...ingredients];
    next.splice(index, 1);
    setIngredients(next);
  };

  const removeStep = (index: number) => {
    const updated = [...steps];
    updated.splice(index, 1);
    setSteps(updated);
  };

  const upload = async () => {
    const requestData = {
      title,
      info,
      ingredients: ingredients.filter((item) => item.name.trim() || item.amount.trim()),
      thumbnailImage,
      steps,
      instagramLink,
      videoLink,
      videoFile,
    };

    if (!title) {
      await Swal.fire({
        icon: 'warning',
        title: 'エラー',
        text: 'タイトルを入力してください。',
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      return false;
    }

    if (!info) {
      await Swal.fire({
        icon: 'warning',
        title: 'エラー',
        text: '紹介を入力してください。',
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      return false;
    }

    if ((!steps[0].image && !steps[0].text) || !steps[0].text) {
      await Swal.fire({
        icon: 'warning',
        title: 'エラー',
        text: 'レシピを入力してください。',
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      return false;
    }

    const uploadEndpoints = ['/recipe/upload', '/receipe/upload'];
    let uploadSuccess = false;

    for (const endpoint of uploadEndpoints) {
      try {
        const response = await axios.post(endpoint, requestData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(),
          },
        });
        const res = response.data as ResponseData;

        if (res && res.resultCode === 'STI01') {
          uploadSuccess = true;
          break;
        }

        if (res && res.resultCode === 'MBB09') {
          await Swal.fire({
            icon: 'warning',
            title: '送信エラー',
            text: res.resultMessage,
            confirmButtonText: '確認',
            showCloseButton: true,
          });
          return false;
        }
      } catch (_error) {
        // Try next endpoint.
      }
    }

    if (!uploadSuccess) {
      await Swal.fire({
        icon: 'warning',
        title: 'エラー',
        text: '送信中にエラーが発生しました。',
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      return false;
    }
    await Swal.fire({
      icon: 'success',
      title: '送信完了',
      confirmButtonText: '確認',
      showCloseButton: true,
    });
    navigate('/recipes');

    return true;
  };

  return (
    <div className='row justify-content-center'>
      <Header />
      <div className='text-center'>
        <div className='uploadMain'>
          <div className='page-heading upload-page-heading'>
            <h1 className='page-title'>レシピ投稿</h1>
            <p className='page-subtitle'>写真、材料、手順をまとめてアップロードします。</p>
          </div>
          <div className='uploadBasicInfo'>
            <div className='title-input-container input-group'>
              <textarea
                className='uploadText'
                rows={1}
                placeholder='  '
                style={{ overflow: 'hidden', resize: 'none' }}
                onChange={(e) => setTitle(e.target.value)}
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
                {thumbnailImage ? (
                  <img src={thumbnailImage} className='step-image-preview' alt='代表写真' />
                ) : (
                  <div className='upload-placeholder'>＋写真追加</div>
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
                onChange={(e) => setInfo(e.target.value)}
              />
              <label htmlFor='info-input' className='input-label'>
                紹介
              </label>
            </div>
            <div className='recipe-input-container input-group'>
              {steps.map((step, index) => (
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
                    value={step.text}
                    onChange={(e) => updateStepText(index, e.target.value)}
                  />

                  <div className='step-image-upload' onClick={() => triggerImageUpload(index)}>
                    {step.image ? (
                      <img src={step.image} className='step-image-preview' alt={`レシピ${index + 1}画像`} />
                    ) : (
                      <div className='upload-placeholder'>＋写真追加</div>
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
                    {index === steps.length - 1 && (
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
                {ingredients.map((ingredient, index) => (
                  <div key={`ingredient-${index}`} className='ingredient-row'>
                    <input
                      className='ingredient-input'
                      type='text'
                      placeholder='材料名'
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.currentTarget.value)}
                    />
                    <input
                      className='ingredient-input'
                      type='text'
                      placeholder='分量'
                      value={ingredient.amount}
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
                {videoFile ? (
                  <video className='video-preview' controls src={videoFile} />
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
                onChange={(e) => setVideoLink(e.target.value)}
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
                onChange={(e) => setInstagramLink(e.target.value)}
              />
              <label htmlFor='instagram-link' className='input-label'>
                SNSリンク（任意）
              </label>
            </div>
          </div>
        </div>
        <div className='uploadBottom'>
          <button className='upload-btn' onClick={upload}>
            UPLOAD
          </button>
          <button className='upload-btn back-btn' onClick={backToMain}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeUpload;
