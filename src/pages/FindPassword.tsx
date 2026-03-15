import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../css/AuthCard.css';
import '../css/FindAccount.css';
import '../css/Login.css';
import { getCookie } from '../utils/cookie';
import Header from '../components/Header';

function FindPassword() {
  const navigate = useNavigate();

  const submitFindPassword = (loginId: string, inputMail: string) => {
    const targetLoginId = loginId.trim();
    const targetInputMail = inputMail.trim();
    const emailExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (targetLoginId.length < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'エラー',
        text: 'IDを入力してください。',
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      return false;
    }

    if (targetInputMail.length < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'エラー',
        text: 'メールアドレスを入力してください。',
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      return false;
    }

    if (!emailExp.test(targetInputMail)) {
      Swal.fire({
        icon: 'warning',
        title: 'エラー',
        text: 'メールアドレスは形式に合わせて入力してください。',
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      return false;
    }

    axios
      .post(
        '/findPW',
        {
          loginId: targetLoginId,
          inputMail: targetInputMail,
        },
        { withCredentials: true },
      )
      .then((response) => {
        const {
          data: { resultCode, resultMessage },
        } = response;

        if (resultCode === 'STI01') {
          Swal.fire({
            icon: 'success',
            title: '送信完了',
            text: resultMessage || 'パスワード再設定案内を送信しました。',
            confirmButtonText: 'OK',
            showCloseButton: true,
          }).then(() => navigate('/login'));
        }
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'エラー',
          text: 'パスワード確認中にエラーが発生しました。',
          confirmButtonText: 'OK',
          showCloseButton: true,
        });
      });
  };

  function PasswordFindForm() {
    const [loginId, setLoginId] = useState('');
    const [inputMail, setInputMail] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.code === 'Enter') {
        submitFindPassword(loginId, inputMail);
      }
    };

    return (
      <div className='auth-page row justify-content-center'>
        <div className='auth-col text-center'>
          <div className='auth-card find-account-card' onKeyDown={handleKeyDown}>
            <div className='page-heading center'>
              <h1 className='page-title'>パスワード検索</h1>
              <p className='page-subtitle'>登録したIDとメールアドレスで確認します。</p>
            </div>
            <div className='find-account-fields'>
              <input
                className='find-account-input'
                placeholder='ID'
                maxLength={30}
                type='text'
                onChange={(e) => setLoginId(e.currentTarget.value)}
              />
              <input
                className='find-account-input'
                placeholder='メールアドレス'
                maxLength={50}
                type='text'
                onChange={(e) => setInputMail(e.currentTarget.value)}
              />
            </div>
            <div className='find-account-actions'>
              <button className='login-btn find-account-btn-secondary' type='button' onClick={() => navigate('/login')}>
                ログインページに戻る
              </button>
              <button className='login-btn' type='button' onClick={() => submitFindPassword(loginId, inputMail)}>
                確認する
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      {getCookie('accessToken') && getCookie('lastLoginTime') ? null : <PasswordFindForm />}
    </div>
  );
}

export default FindPassword;
