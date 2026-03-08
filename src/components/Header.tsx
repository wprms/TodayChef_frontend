import '../css/Header.css';
import React, { useRef, useEffect, useState } from 'react';
import { FaBars, FaBell } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MemBerLogout } from '../components/Logout';
import { getCookie } from '../utils/cookie';
import Swal from 'sweetalert2';
import axios from 'axios';
import { buildAuthHeaders } from '../utils/authHeaders';

type CommentNotification = {
  commentId: string;
  recipeId: string;
  recipeTitle: string;
  writerId: string;
  commentText: string;
  recCreateDatetime: string;
};

const extractNotifications = (payload: unknown): CommentNotification[] => {
  const root = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const candidates = [payload, root.result, root.list, root.items, root.data];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    return candidate
      .filter((item) => item && typeof item === 'object')
      .map((item, index) => {
        const record = item as Record<string, unknown>;
        return {
          commentId:
            typeof record.commentId === 'string'
              ? record.commentId
              : typeof record.id === 'string'
                ? record.id
                : String(index),
          recipeId:
            typeof record.recipeId === 'string'
              ? record.recipeId
              : typeof record.id === 'string'
                ? record.id
                : '',
          recipeTitle: typeof record.recipeTitle === 'string' ? record.recipeTitle : 'レシピ',
          writerId: typeof record.writerId === 'string' ? record.writerId : 'user',
          commentText: typeof record.commentText === 'string' ? record.commentText : '',
          recCreateDatetime: typeof record.recCreateDatetime === 'string' ? record.recCreateDatetime : '',
        };
      });
  }

  return [];
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const target = useRef<HTMLUListElement>(null);
  const noticeTarget = useRef<HTMLDivElement>(null);
  const accessToken = getCookie('accessToken');
  const lastLoginTime = getCookie('lastLoginTime');
  const isLoggedIn = Boolean(accessToken && lastLoginTime);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [notifications, setNotifications] = useState<CommentNotification[]>([]);

  const noticeSeenAtKey = `todaychef_notice_seen_at_${lastLoginTime ?? 'guest'}`;
  const [noticeSeenAt, setNoticeSeenAt] = useState<number>(() => {
    const saved = localStorage.getItem(noticeSeenAtKey);
    return saved ? Number(saved) : 0;
  });

  const unreadCount = notifications.filter((notice) => {
    const createdAt = new Date(notice.recCreateDatetime).getTime();
    return Number.isFinite(createdAt) && createdAt > noticeSeenAt;
  }).length;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchKeyword(params.get('q') ?? '');
  }, [location.search]);

  useEffect(() => {
    const saved = localStorage.getItem(noticeSeenAtKey);
    setNoticeSeenAt(saved ? Number(saved) : 0);
  }, [noticeSeenAtKey]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (target.current && !target.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (noticeTarget.current && !noticeTarget.current.contains(e.target as Node)) {
        setIsNoticeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    let cancelled = false;
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/recipe/comment/notifications', {
          withCredentials: true,
          headers: buildAuthHeaders(),
        });
        if (!cancelled) {
          setNotifications(extractNotifications(response.data));
        }
      } catch (_error) {
        if (!cancelled) {
          setNotifications([]);
        }
      }
    };

    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isLoggedIn, lastLoginTime]);

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const keyword = searchKeyword.trim();
    if (keyword.length === 0) {
      navigate('/recipes');
      return;
    }
    navigate(`/recipes?q=${encodeURIComponent(keyword)}`);
  };

  const memberLogout = async () => {
    if (accessToken !== null && lastLoginTime !== null) {
      const success = await MemBerLogout();
      if (success) {
        navigate('/main', { replace: true });
      }
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

  const openNotifications = () => {
    const now = Date.now();
    localStorage.setItem(noticeSeenAtKey, String(now));
    setNoticeSeenAt(now);
    setIsNoticeOpen((prev) => !prev);
  };

  return (
    <header className='mainHeader'>
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
          {isLoggedIn ? (
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
          ) : null}
          {isLoggedIn ? (
            <div className='header-notice-wrap' ref={noticeTarget}>
              <button className='header-notice-btn' type='button' onClick={openNotifications}>
                <FaBell size={15} />
                {unreadCount > 0 ? <span className='header-notice-badge'>{unreadCount > 99 ? '99+' : unreadCount}</span> : null}
              </button>
              {isNoticeOpen ? (
                <div className='header-notice-panel'>
                  <div className='header-notice-title'>コメント通知</div>
                  {notifications.length === 0 ? (
                    <div className='header-notice-empty'>新しい通知はありません。</div>
                  ) : (
                    <ul>
                      {notifications.map((notice) => (
                        <li key={notice.commentId}>
                          <button
                            type='button'
                            onClick={() => {
                              setIsNoticeOpen(false);
                              navigate(`/recipes/${notice.recipeId}`);
                            }}
                          >
                            <div className='notice-recipe'>{notice.recipeTitle}</div>
                            <div className='notice-text'>
                              {notice.writerId}: {notice.commentText}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
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
    </header>
  );
};

export default Header;
