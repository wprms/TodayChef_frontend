import '../css/Header.css';
import React, { useRef, useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MemBerLogout } from '../components/Logout';
import { getCookie } from '../utils/cookie';
import Swal from 'sweetalert2';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = getCookie('accessToken');
  const lastLoginTime = getCookie('lastLoginTime');
  const isLoggedIn = Boolean(accessToken && lastLoginTime);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchKeyword(params.get('q') ?? '');
  }, [location.search]);

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const keyword = searchKeyword.trim();
    if (keyword.length === 0) {
      navigate('/recipes');
      return;
    }
    navigate(`/recipes?q=${encodeURIComponent(keyword)}`);
  };

  function Menu() {
    const [isOpen, setIsOpen] = useState(false);
    const target = useRef<HTMLUListElement>(null);

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (target.current && !target.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => {
        document.removeEventListener('mousedown', handleClick);
      };
    }, []);

    const memberLogout = () => {
      if (accessToken !== null && lastLoginTime !== null) {
        MemBerLogout();
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'エラー',
          text: 'ログイン状態を確認できません。',
          confirmButtonText: 'OK',
          showCloseButton: true,
        });
      }
    };

    return (
      <div className='header-inner'>
        <div className='header-left'>
          <button className='menu-trigger' type='button' onClick={() => setIsOpen((prev) => !prev)}>
            <FaBars size={18} className='menu-icon' />
            <span>メニュー</span>
          </button>
          {isOpen && (
            <ul className='menu-list' ref={target}>
              <li>
                <Link to='/recipes'>レシピ一覧</Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li>
                    <Link to='/recipeUpload'>レシピ投稿</Link>
                  </li>
                  <li>
                    <Link to='/my-recipes'>マイレシピ管理</Link>
                  </li>
                  <li>
                    <button className='menu-logout' type='button' onClick={memberLogout}>
                      ログアウト
                    </button>
                  </li>
                </>
              ) : null}
            </ul>
          )}
        </div>

        <div className='header-center'>
          <Link to='/main' className='brand-link'>
            TodayChef
          </Link>
        </div>

        <div className='header-right'>
          <form className='header-search-form' onSubmit={submitSearch}>
            <input
              className='header-search-input'
              type='text'
              placeholder='レシピ検索'
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.currentTarget.value)}
            />
            <button className='header-search-btn' type='submit'>
              検索
            </button>
          </form>
          {!isLoggedIn ? (
            <>
              <Link to='/login' className='header-link'>
                ログイン
              </Link>
              <Link to='/join' className='header-link'>
                新規登録
              </Link>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <header className='mainHeader'>
      <Menu />
    </header>
  );
};

export default Header;
