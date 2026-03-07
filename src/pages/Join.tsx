import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axios from 'axios';
import '../css/Join.css';
import Header from '../components/Header';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import {
    ResponseData,
} from '../services/apiTypes';

function Join() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mail, setMail] = useState('');  
  const navigate = useNavigate();
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const backToLogin = () => {
      navigate('/login');
  }
  
  const join = () => {

      const requestData = {
          loginId: id,
          password: password,
          mail: mail,
      };

      const emailExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

      if (!id || id == null) {
          Swal.fire({ 
            icon: "warning",
            title: "エラー",
            text: "IDを入力してください。",
            confirmButtonText: "OK",
            showCloseButton: true,
          })
          return false
      } else if (!password || password == null){
          Swal.fire({
              icon: "warning",
              title: "エラー",
              text: "Passwordを入力してください。",
              confirmButtonText: "OK",
              showCloseButton: true,
          })
          return false    
      } else if (!confirmPassword || confirmPassword == null){
          Swal.fire({
              icon: "warning",
              title: "エラー",
              text: "Password確認を入力してください。",
              confirmButtonText: "OK",
              showCloseButton: true,
          })
          return false
      } else if (password !== confirmPassword){
          Swal.fire({
              icon: "warning",
              title: "エラー",
              text: "PasswordとPassword確認が一致しません。",
              confirmButtonText: "OK",
              showCloseButton: true,
          })
          return false
      } else if (!mail || mail== null){
          Swal.fire({
              icon: "warning",
              title: "エラー",
              text: "メールアドレスを入力してください。",
              confirmButtonText: "OK",
              showCloseButton: true,
          })
          return false 
      } else if (!emailExp.test(mail)) {
          Swal.fire({
              icon: "warning",
              title: "エラー",
              text: "メールアドレスは形式に合わせて入力してください。",
              confirmButtonText: "OK",
              showCloseButton: true,
          })
      return false
      }
      axios.post('/join/signup',
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
              Swal.fire({
                  icon: "success",
                  title: "送信完了",
                  text: "メールを送信しました。通知を確認してください。",
                  confirmButtonText: "確認",
                  showCloseButton: true,
              }).then(
                  function(isConfirm){
                      if(isConfirm){
                          navigate('/login');
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
                      navigate(`/login`);
                  }
                });
          }
      })
      .catch(() => {
          Swal.fire({
              icon: "warning",
              title: "エラー",
              text: "メール送信中にエラーが発生しました。",
              confirmButtonText: "OK",
              showCloseButton: true,
          }).then(
              function(isConfirm){
                  if(isConfirm){
                      navigate('/login');
                  }
          })
          return false;
      });
  };

return(
    <div className='row justify-content-center'>
    <Header/>
      <div className='col-6 text-center'>
            <div className="JoinMain">        
              <div>
                  <div className="brText">ID<span className='imfortantEnter'>*</span></div>
                  <input className='joinTextName' maxLength={200} type={'text'} onChange={(e) => setId(e.target.value.replace(/　/g, '').replace(/ /g, ''))}/> 
              </div>
              <div>
                  <div className="brText">Password<span className='imfortantEnter'>*</span></div>
                  <div className='pwd-eye-wrap'>
                  <input className='joinTextName' maxLength={200} type={showPassword ? 'text' : 'password'} onChange={(e) => setPassword(e.target.value.replace(/　/g, '').replace(/ /g, ''))}/>
                  <button type='button' className='password-toggle-btn' onClick={() => setShowPassword((prev) => !prev)} aria-label='join-password-toggle'>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                  </div> 
              </div>
              <div>
                  <div className="brText">Password確認<span className='imfortantEnter'>*</span></div>
                  <div className='pwd-eye-wrap'>
                  <input className='joinTextName' maxLength={200} type={showConfirmPassword ? 'text' : 'password'} onChange={(e) => setConfirmPassword(e.target.value.replace(/　/g, '').replace(/ /g, ''))}/>
                  <button type='button' className='password-toggle-btn' onClick={() => setShowConfirmPassword((prev) => !prev)} aria-label='join-confirm-password-toggle'>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
                  </div> 
                  {isPasswordMismatch ? (
                    <div className='joinWarningText'>Passwordが一致しません。</div>
                  ) : null}
              </div>
              <div>
                  <div className="brText">Mail<span className='imfortantEnter'>*</span></div>
                  <input className='joinTextName' placeholder='example@todaychef.com' maxLength={50} type={'text'} onChange={(e) => setMail(e.target.value)}/> 
              </div>             
          </div>
          <div className="joinBottom">
              <button className='joinApplication' onClick={join} disabled={isPasswordMismatch}>                    
                      送信
              </button>
              <button className='joinBackbtn' onClick={backToLogin}>                    
                      ログイン
              </button>
          </div>
      </div>
  </div>

  );
};


export default Join;
