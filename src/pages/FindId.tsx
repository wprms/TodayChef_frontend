import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from 'axios';
import '../css/Login.css';
import { getCookie } from "../utils/cookie";
import Header from '../components/Header';

function FindId() {
  const navigate = useNavigate();

  const find = (inputMail: string) => {

    let targetInputMail = inputMail.trim();
    const emailExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

    if (targetInputMail.length < 1) {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "メールアドレスを入力してください。",
        confirmButtonText: "OK",
        showCloseButton: true,
      })
      return false
    } else if (!emailExp.test(targetInputMail)) {
      Swal.fire({
          icon: "warning",
          title: "エラー",
          text: "メールアドレスは形式に合わせて入力してください。",
          confirmButtonText: "OK",
          showCloseButton: true,
      })
  return false
  }
  
  axios
    .post(
        "/findId",
        {
          inputMail: targetInputMail
        },
        {
          withCredentials: true,
        }
        )
      .then((response) => {
        const {
          data: { resultCode },
        } = response;
        if (resultCode === "STI01") { //メール送信が完了した場合
          Swal.fire({
            icon: "success",
            title: "送信完了",
            text: "メールを送信しました。",
            confirmButtonText: "OK",
            showCloseButton: true,
          }).then(
            function(isConfirm){
              if(isConfirm){
                navigate("/login");
              }
            }
          )
        }
        else if (resultCode === "MBB01") {
          // 存在しないユーザー
          Swal.fire({
            icon: "warning",
            title: "エラー",
            text: "当該情報の会員が存在しません。",
            confirmButtonText: "OK",
            showCloseButton: true,
          })
          return false
        }
      })
  };

  function MailInput() {
    const [inputMail, setInputMail] = useState("");

    const handleKeyDown = (e: any) => {
      if (e.code === "Enter") {
        find(inputMail);
      }
      return;
    };

    return (
      <div className='row justify-content-center'>
            <div className='col-6 text-center'>
                <div className='page-heading center'>
                  <h1 className='page-title'>ID検索</h1>
                  <p className='page-subtitle'>登録したメールアドレスでアカウント情報を確認します。</p>
                </div>
                <div className="find-name" onKeyDown={handleKeyDown}>
                  <input
                    className='inputMail'
                    id='inputMail'
                    placeholder=" メールアドレス"
                    maxLength={50}
                    onChange={(e) => {
                      setInputMail(e.currentTarget.value);
                    }}
                    type={'text'} />
                  </div>
                  <button
                    className='login-btn'
                    onClick={() => { window.location.href = '/login'; }}>
                    ログインページに戻る
                  </button>
                  <button
                    className='login-btn'
                    type="submit"
                    onClick={() => {
                      find(inputMail);
                    }}>
                    確認する
                  </button>
              </div>
        </div>
    );
  }
  
  return (
    <div>
      <Header/>
      <div className='find'>
      {getCookie("accessToken") && getCookie("lastLoginTime")? null :<MailInput/> }
      </div>
    </div>
  );
}

export default FindId;
