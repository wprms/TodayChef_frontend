import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axios from 'axios';
import '../css/Join.css';
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
  
  const upload = () => {

      const requestData = {
          title: title,
          info: info
      };


      if (!title || title == null) {
          Swal.fire({ 
            icon: "warning",
            title: "エラー",
            text: "IDを入力してください。",
            confirmButtonText: "OK",
            showCloseButton: true,
          })
          return false
      } else if (!info || info == null){
          Swal.fire({
              icon: "warning",
              title: "エラー",
              text: "Passwordを入力してください。",
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
                  text: "メールを送信しました。通知を確認してください。",
                  confirmButtonText: "確認",
                  showCloseButton: true,
              }).then(
                  function(isConfirm){
                      if(isConfirm){
                          navigate('/main');
                      }
              })
          }
          else if (res && res.resultCode === 'MBB09'){
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
              text: "メール送信中にエラーが発生しました。",
              confirmButtonText: "OK",
              showCloseButton: true,
          }).then(
              function(isConfirm){
                  if(isConfirm){
                      navigate('/main');
                  }
          })
          return false;
      });
  };

return(
    <div className='row justify-content-center'>
    <Header/>
      <div className='col-6 text-center'>
            <div className="uploadMain">
                <div className='uploadBasicInfo'>    
                  <div className="brText">タイトル</div>
                  <textarea className='uploadTextName' rows={3} style={{ overflow: 'hidden', resize: 'none' }} onChange={(e) => setTitle(e.target.value)}/> 
                  <div className="brText">紹介</div>
                  <textarea className='uploadTextName' rows={3} style={{ overflow: 'hidden', resize: 'none' }} onChange={(e) => setInfo(e.target.value)}/>
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
  </div>

  );
};


export default RecipeUpload;