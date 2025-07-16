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
    const navigate = useNavigate();

    const backToMain = () => {
        navigate('/main');
    }

    const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null]);
    const [descriptions, setDescriptions] = useState<string[]>(['', '', '', '']);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const addImageBox = () => {
        setImagePreviews((prev) => [...prev, null]);
        setDescriptions((prev) => [...prev, '']);
    };

    const removeImageBox = (index: number) => {
        const newPreviews = [...imagePreviews];
        const newDescriptions = [...descriptions];
        newPreviews.splice(index, 1);
        newDescriptions.splice(index, 1);
        setImagePreviews(newPreviews);
        setDescriptions(newDescriptions);
    };

    const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedPreviews = [...imagePreviews];
                updatedPreviews[index] = reader.result as string;
                setImagePreviews(updatedPreviews);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = (index: number) => {
        fileInputRefs.current[index]?.click();
    };

    const upload = () => {

        const requestData = {
            title: title,
            info: info,
            imagePreviews: imagePreviews
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
        }

        axios.post('/receipe/upload',
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
                        <div className="title-input-container">
                            <textarea className='uploadText' rows={2} placeholder="  タイトル" style={{ overflow: 'hidden', resize: 'none' }} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="intro-input-container">
                            <textarea className='uploadText' rows={5} placeholder="  紹介" style={{ overflow: 'hidden', resize: 'none' }} onChange={(e) => setInfo(e.target.value)} />
                        </div>
                        <div className="image-upload-container">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="image-upload-box-wrapper">

                                    <button className="remove-button" onClick={() => removeImageBox(index)}>×</button>

                                    <div className="image-upload-box" onClick={() => triggerFileSelect(index)}>
                                        {preview ? (
                                            <img src={preview} alt={`preview-${index}`} className="image-preview" />
                                        ) : (
                                            <span className="circle-number">{String.fromCharCode(9312 + index)}</span>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            ref={(el) => (fileInputRefs.current[index] = el)}
                                            onChange={(e) => handleImageChange(index, e)}
                                        />
                                    </div>

                                    {preview && (
                                        <textarea
                                            className="image-description"
                                            placeholder={`レシピ ${index + 1} の説明を入力してください`}
                                            value={descriptions[index]}
                                            onChange={(e) => {
                                                const updatedDescriptions = [...descriptions];
                                                updatedDescriptions[index] = e.target.value;
                                                setDescriptions(updatedDescriptions);
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="add-image-button-wrapper">
                            <button className="add-image-button" onClick={addImageBox}>
                                レシピ追加
                            </button>
                        </div>
                    </div>
                </div>
                <div className="uploadBottom">
                    <button className='uploadApplication' onClick={upload}>
                        UPLOAD
                    </button>
                    <button className='uploadBackbtn' onClick={backToMain}>
                        Back
                    </button>
                </div>
            </div>
        </div >

    );
};


export default RecipeUpload;