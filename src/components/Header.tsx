import '../css/Header.css';
import React, { useRef, useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { Link, useNavigate } from "react-router-dom";
import { MemBerLogout  } from "../components/Logout";
import { getCookie } from '../utils/cookie';
import Swal from "sweetalert2";
import { delCookie } from '../utils/cookie';

const Header = () => {
  const navigate = useNavigate();
  const accessToken = getCookie("accessToken");
  const lastLoginTime = getCookie("lastLoginTime");

    function Menu() {
        const [isOpen, setIsOpen] = useState(false);
        const toggleMenu = () => {
          setIsOpen(!isOpen);
        };
        const target = useRef<HTMLInputElement>(null);

        useEffect(() => {
          const handleClick = (e: any) => {
              if (target.current && !target.current.contains(e.target)) {
                  setIsOpen(false);
              }
          };
          document.addEventListener("mousedown", handleClick);
          return () => {
              document.removeEventListener("mousedown", handleClick);
          }
      }, []);
      
      const memberLogout = () => {
        if(accessToken !== null && lastLoginTime !== null){
          MemBerLogout();
        } else{
          Swal.fire({
            icon: "warning",
            title: "エラー",
            text: "Fail to logout",
            confirmButtonText: "OK",
            showCloseButton: true,
          })
        }
      };

        return (
          <div className="row align-items-center">
            <div className="col-5" style={{ textAlign: "left"}}>
            <span className='headerCategoryLeft'>
            <span className="menuIcon">
              <FaBars size={20} className="menu-icon" onClick={toggleMenu} />
            </span>
            <span style={{ marginLeft: "20px"}}>카테고리</span>
            </span>
            {isOpen && (
              //@ts-ignore
              <ul className="menu-list" ref={target}>
                <div>
                <Link to={"/recipeUpload"} style={{ textDecoration: "none", color: 'black'}}><li  className='faBars-in'>{"レシピアップロード"}</li></Link>
                <Link to={"/"} style={{ textDecoration: "none", color: 'black' }}><li className='faBars-in'>{"2"}</li></Link>
                <Link to={"/"} style={{ textDecoration: "none", color: 'black' }}><li className='faBars-in'>{"3"}</li></Link>
                <Link to={"/"} style={{ textDecoration: "none", color: 'black' }}><li className='faBars-in'>{"4"}</li></Link>
                <Link to={"/"} style={{ textDecoration: "none", color: 'black' }}><li className='faBars-in'>{"5"}</li></Link>
                <button className="logoutBtn faBars-in" onClick= {memberLogout} style={{ background: "none", color: 'black' }}><li>ログアウト</li></button>
                </div>
              </ul>
            )
            }
            <Link to={"/recipe"} style={{ textDecoration: "none", color: 'black'}}><span className='headerCategoryLeft'>오늘의 레시피</span></Link>
            <Link to={"/best"} style={{ textDecoration: "none", color: 'black'}}><span className='headerCategoryLeft'>베스트</span></Link>
            </div> 
            <div className='col-2' style={{ textAlign: "center"}}>
            <Link to={"/main"} style={{ textDecoration: "none", color: 'black'}}><span>오늘의 쉐프</span></Link>
            </div>
            {
            getCookie("accessToken") && getCookie("lastLoginTime")
            ?<div className='col-5' style={{ textAlign: "right"}}>
            <span className='headerCategoryRight'><input/></span>  
            </div>    
            :<div className='col-5' style={{ textAlign: "right"}}>
            <Link to={"/login"} style={{ textDecoration: "none", color: 'black'}}><span className='headerCategoryRight'>로그인</span></Link>
            <Link to={"/join"} style={{ textDecoration: "none", color: 'black'}}><span className='headerCategoryRight'>회원가입</span></Link>
            <span className='headerCategoryRight'><input/></span>  
            </div>
            }
          </div>
        );
      }

    return(
        <header className="mainHeader">
          <Menu></Menu> 
        </header>
        )
}

export default Header