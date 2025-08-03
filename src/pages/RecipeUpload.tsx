import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axios from 'axios';
import '../css/Recipe.css';
import Header from '../components/Header';
import {
    ResponseData,
} from '../services/apiTypes';

function RecipeUpload() {
    const [title, setTitle] = useState('');
    const [info, setInfo] = useState('');
    const [result, setResult] = useState<ResponseData>();
    const [steps, setSteps] = useState<RecipeStep[]>([
        { text: '', image: null }, 
    ]);
    const [instagramLink, setInstagramLink] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const navigate = useNavigate();

    const backToMain = () => {
        navigate('/main');
    }

    type RecipeStep = {
        text: string;
        image: string | null;
    };

    const stepFileRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    const addStep = () => {
        setSteps((prev) => [...prev, { text: '', image: null }]);
    };

    const removeStep = (index: number) => {
        const updated = [...steps];
        updated.splice(index, 1);
        setSteps(updated);
    };

    const upload = () => {

        const requestData = {
            title : title,
            info : info,
            steps : steps,
            instagramLink : instagramLink,
            videoLink : videoLink
        };

        if (!title || title == null) {
            Swal.fire({
                icon: "warning",
                title: "エラー",
                text: "タイトルを入力してください。",
                confirmButtonText: "OK",
                showCloseButton: true,
            })
            return false
        } else if (!info || info == null) {
            Swal.fire({
                icon: "warning",
                title: "エラー",
                text: "紹介を入力してください。",
                confirmButtonText: "OK",
                showCloseButton: true,
            })
            return false
        } else if ((!steps[0].image || steps[0].image == null) || (!steps[0].text || steps[0].text == null)){
            Swal.fire({
                icon: "warning",
                title: "エラー",
                text: "レシピを入力してください。",
                confirmButtonText: "OK",
                showCloseButton: true,
            })
            return false
        }

        axios.post('/recipe/upload',
            requestData,
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                const res = response.data as ResponseData;
                if (res && res.resultCode === 'STI01') {
                    const result = res.result;
                    setResult(result);
                    Swal.fire({
                        icon: "success",
                        title: "送信完了",
                        confirmButtonText: "確認",
                        showCloseButton: true,
                    }).then(
                        function (isConfirm) {
                            if (isConfirm) {
                                navigate('/main');
                            }
                        })
                }
                else if (res && res.resultCode === 'MBB09') {
                    Swal.fire({
                        icon: "warning",
                        title: "送信エラー",
                        text: res.resultMessage,
                        confirmButtonText: "確認",
                        showCloseButton: true,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigate(`/main`);
                        }
                    });
                }
            })
            .catch((error) => {
                Swal.fire({
                    icon: "warning",
                    title: "エラー",
                    text: "送信中にエラーが発生しました。",
                    confirmButtonText: "OK",
                    showCloseButton: true,
                }).then(
                    function (isConfirm) {
                        if (isConfirm) {
                            navigate('/main');
                        }
                    })
                return false;
            });
    };

    return (
        <div className='row justify-content-center'>
            <Header />
            <div className='text-center'>
                <div className="uploadMain">
                    <div className='uploadBasicInfo'>
                        <div className="title-input-container input-group">
                            <textarea className='uploadText' rows={1} placeholder="  " style={{ overflow: 'hidden', resize: 'none' }} onChange={(e) => setTitle(e.target.value)} />
                            <label htmlFor="title-input" className="input-label">タイトル</label>
                        </div>
                        <div className="intro-input-container input-group">
                            <textarea className='uploadText' rows={2} placeholder="  " style={{ overflow: 'hidden', resize: 'none' }} onChange={(e) => setInfo(e.target.value)} />
                            <label htmlFor="info-input" className="input-label">紹介</label>
                        </div>
                        <div className="recipe-input-container input-group">
                            {steps.map((step, index) => (
                                <div key={index} className="recipe-step-box" style={{ marginTop: index === 0 ? '0' : '1.5rem' }} >

                                    <div className="step-header">
                                        <span>{String.fromCharCode(9312 + index)} レシピ</span>
                                    </div>

                                    <textarea
                                        className="step-description"
                                        placeholder={`説明を入力してください`}
                                        value={step.text}
                                        onChange={(e) => updateStepText(index, e.target.value)}
                                    />

                                    <div className="step-image-upload" onClick={() => triggerImageUpload(index)}>
                                        {step.image ? (
                                            <img src={step.image} className="step-image-preview" alt={`レシピ${index + 1}画像`} />
                                        ) : (
                                            <div className="upload-placeholder">＋画像を追加</div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            ref={(el) => (stepFileRefs.current[index] = el)}
                                            onChange={(e) => handleImageChange(index, e)}
                                        />
                                    </div>

                                    <div className="step-buttons">
                                        {index > 0 && (
                                            <button
                                                className="add-step-button delete-button"
                                                onClick={() => removeStep(index)}
                                                type="button"
                                            >
                                                削除
                                            </button>
                                        )}
                                        {index === steps.length - 1 && (
                                            <button
                                                className="add-step-button"
                                                onClick={addStep}
                                                type="button"
                                            >
                                                ＋ レシピ追加
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="social-links-container input-group">
                            <textarea className='uploadText' rows={1} placeholder="  " style={{ overflow: 'hidden', resize: 'none' }} onChange={(e) => setInstagramLink(e.target.value)} />
                            <label htmlFor="instagram-link" className="input-label">SNSリンク</label>
                        </div>
                        <div className="video-links-container input-group">
                            <textarea className='uploadText' rows={1} placeholder="  " style={{ overflow: 'hidden', resize: 'none' }} onChange={(e) => setVideoLink(e.target.value)} />
                            <label htmlFor="video-link" className="input-label">動画リンク</label>
                        </div>
                    </div>
                </div>
                <div className="uploadBottom">
                    <button className="upload-btn" onClick={upload}>
                        UPLOAD
                    </button>
                    <button className="upload-btn back-btn" onClick={backToMain}>
                        Back
                    </button>
                </div>
            </div>
        </div >

    );
};


export default RecipeUpload;