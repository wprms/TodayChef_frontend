import Swal from 'sweetalert2';
import axios from 'axios';
import { getCookie, delCookie } from '../utils/cookie';

export function MemBerLogout() {
  axios
    .post(
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
    )
    .then((response) => {
      const {
        data: { resultCode },
      } = response;

      if (resultCode === 'STI01') {
        delCookie('accessToken');
        delCookie('refreshToken');
        delCookie('lastLoginTime');
        Swal.fire({
          icon: 'success',
          title: '完了',
          text: 'ログアウトしました。',
          confirmButtonText: 'OK',
          showCloseButton: true,
        });
      }
    });
}
