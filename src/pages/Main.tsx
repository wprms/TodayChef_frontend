import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import Swal from "sweetalert2";
import axios from 'axios';
import '../css/Login.css';
import { getCookie, setCookie } from "../utils/cookie";
import Header from '../components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';

function Main() {
  const navigate = useNavigate();

  useEffect(() => {
  }, []);

  const login = (loginId: string, loginPw: string) => {

    let targetLoginId = loginId.trim();
    let targetLoginPwd = loginPw.trim();

    if (targetLoginId.length < 1) {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "IDを入力してください。",
        confirmButtonText: "OK",
        showCloseButton: true,
      })
      return false
    } else if (targetLoginPwd.length < 1) {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "パスワードを入力してください。",
        confirmButtonText: "OK",
        showCloseButton: true,
      })
      return false
    }
    axios
      .post(
        "/login",
        {
          loginId: targetLoginId,
          password: targetLoginPwd
        },
        {
          withCredentials: true
        }
      )
      .then((response) => {
        const {
          data: { resultCode },
        } = response;
        const {
          data: { result },
        } = response;
        if (resultCode === "STI01") {
          setCookie("accessToken", response.headers.accesstoken, 1);
          setCookie("lastLoginTime", response.headers.lastlogintime, 1);
          navigate("/main");
        }
        else if (resultCode === "MBB01") {
          // 存在しないユーザー
          Swal.fire({
            icon: "warning",
            title: "エラー",
            text: "IDが存在しません。",
            confirmButtonText: "OK",
            showCloseButton: true,
          })
          return false
        }
        else if (resultCode === "MBB02") {
          // パスワードエラー
          Swal.fire({
            icon: "warning",
            title: "エラー",
            text: "パスワードが一致しません。",
            confirmButtonText: "OK",
            showCloseButton: true,
          })
          return false
        }
        else if (resultCode === "CMB06") {
          // 入力漏れ
          Swal.fire({
            icon: "warning",
            title: "エラー",
            text: "入力した内容を確認してください。",
            confirmButtonText: "OK",
            showCloseButton: true,
          })
          return false;
        }
      })
  };

  function LoginInput() {
    const [loginId, setLoginId] = useState("");
    const [loginPw, setLoginPw] = useState("");

    const handleKeyDown = (e: any) => {
      if (e.code === "Enter") {
        login(loginId, loginPw);
      }
      return;
    };

    return (
      <div>
      </div>
    );
  }
  
  return (
    <div>
      <Header/>
      <div className='main'>
      {/* {getCookie("accessToken") && getCookie("lastLoginTime")?<NotFound />:<LoginInput/> }  */}
        <LoginInput/> 
      </div>
    </div>
  );
}

export default Main;