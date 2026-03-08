import Swal from 'sweetalert2';
import axios from 'axios';
import { getCookie, delCookie } from '../utils/cookie';

export async function MemBerLogout(): Promise<boolean> {
  try {
    const response = await axios.post(
      '/member/logout',
      {},
      {
        withCredentials: true,
        headers: {
          accessToken: getCookie('accessToken'),
          refreshToken: getCookie('refreshToken'),
          lastLoginTime: getCookie('lastLoginTime'),
        },
      },
    );

    const {
      data: { resultCode },
    } = response;

    if (resultCode === 'STI01') {
      delCookie('accessToken');
      delCookie('refreshToken');
      delCookie('lastLoginTime');
      await Swal.fire({
        icon: 'success',
        title: '完了',
        text: 'ログアウトしました。',
        confirmButtonText: 'OK',
        showCloseButton: true,
      });
      return true;
    }
  } catch (_error) {
    return false;
  }

  return false;
}
