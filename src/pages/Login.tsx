import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../css/Login.css';
import '../css/AuthCard.css';
import { getCookie, setCookie } from '../utils/cookie';
import Header from '../components/Header';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import SocialLoginButtons from '../components/SocialLoginButtons';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const lastLoginTime = params.get('lastLoginTime');
    const socialError = params.get('socialError');

    if (socialError) {
      Swal.fire({
        icon: 'warning',
        title: 'エラー',
        text: socialError,
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      navigate('/login', { replace: true });
      return;
    }

    if (accessToken && refreshToken && lastLoginTime) {
      setCookie('accessToken', accessToken, 1);
      setCookie('refreshToken', refreshToken, 1);
      setCookie('lastLoginTime', lastLoginTime, 1);
      navigate('/main', { replace: true });
    }
  }, [location.search, navigate]);

  const login = (loginId: string, loginPw: string) => {
    const targetLoginId = loginId.trim();
    const targetLoginPwd = loginPw.trim();

    if (targetLoginId.length < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'エラー',
        text: 'IDを入力してください。',
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      return false;
    } else if (targetLoginPwd.length < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'エラー',
        text: 'パスワードを入力してください。',
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      return false;
    }

    axios
      .post(
        '/login',
        {
          loginId: targetLoginId,
          password: targetLoginPwd,
        },
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        const {
          data: { resultCode },
        } = response;

        if (resultCode === 'STI01') {
          setCookie('accessToken', response.headers.accesstoken, 1);
          setCookie('refreshToken', response.headers.refreshtoken || '', 1);
          setCookie('lastLoginTime', response.headers.lastlogintime, 1);
          navigate('/main');
        } else if (resultCode === 'MBB01') {
          Swal.fire({
            icon: 'warning',
            title: 'エラー',
            text: 'IDが存在しません。',
            confirmButtonText: 'OK',
            showCloseButton: true,
          });
          return false;
        } else if (resultCode === 'MBB02') {
          Swal.fire({
            icon: 'warning',
            title: 'エラー',
            text: 'パスワードが一致しません。',
            confirmButtonText: 'OK',
            showCloseButton: true,
          });
          return false;
        } else if (resultCode === 'CMB06') {
          Swal.fire({
            icon: 'warning',
            title: 'エラー',
            text: '入力した内容を確認してください。',
            confirmButtonText: 'OK',
            showCloseButton: true,
          });
          return false;
        }
      });
  };

  function LoginInput() {
    const [loginId, setLoginId] = useState('');
    const [loginPw, setLoginPw] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.code === 'Enter') {
        login(loginId, loginPw);
      }
    };

    return (
      <div className='auth-page row justify-content-center'>
        <div className='auth-col text-center'>
          <div className='auth-card login-content' onKeyDown={handleKeyDown}>
            <input
              className='loginId'
              id='loginId'
              placeholder='  ID'
              maxLength={30}
              onChange={(e) => {
                setLoginId(e.currentTarget.value);
              }}
              type={'text'}
            />
            <div className='pwd-eye-wrap'>
              <input
                className='loginPassword'
                type={showPassword ? 'text' : 'password'}
                id='loginPassword'
                placeholder='  パスワード'
                maxLength={20}
                onChange={(e) => {
                  setLoginPw(e.currentTarget.value);
                }}
              />
                          <button
                type='button'
                className='password-toggle-btn'
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label='password-toggle'
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              className='login-btn'
              type='submit'
              onClick={() => {
                login(loginId, loginPw);
              }}
            >
              ログイン
            </button>
            <SocialLoginButtons />
            <div className='login-findUserInfo'>
              <a className='login-find-btn' href='/findId'>IDを探す</a>
              <a className='login-find-btn' href='/findPW'>パスワードを探す</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      {getCookie('accessToken') && getCookie('lastLoginTime') ? null : <LoginInput />}
    </div>
  );
}

export default Login;
