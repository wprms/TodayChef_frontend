import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../css/Login.css';
import { getCookie, setCookie } from '../utils/cookie';
import Header from '../components/Header';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log(getCookie('accessToken'));
    console.log(getCookie('lastLoginTime'));
  }, []);

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
      <div className='row justify-content-center'>
        <div className='login-panel text-center'>
          <div className='login-content' onKeyDown={handleKeyDown}>
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
            <div className='login-findUserInfo'>
              <a href='/findId'>IDを探す</a>
              <span className='login-and'> | </span>
              <a href='/findPW'>パスワードを探す</a>
            </div>
          </div>
          <div className='loginJoin'>
            <span>
              <a className='signup-btn' href='/join'>新規登録</a>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className='login'>
        {getCookie('accessToken') && getCookie('lastLoginTime') ? null : <LoginInput />}
      </div>
    </div>
  );
}

export default Login;
