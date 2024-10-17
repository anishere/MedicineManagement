/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import { axiosCus } from "../axios/axios";
import { URLLogin } from "../../URL/url";
import { Bounce, toast, ToastContainer } from "react-toastify";

function login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = () => {
      const fetchData = async () => {
        try {
            const res = await axiosCus.post(URLLogin,{
              "userName": username,
              "password": password,
            });
            if(res.statusCode === 200) {
                console.log(res.user[0].userID)
                localStorage.setItem("maNV", res.user[0].maNV)
                localStorage.setItem("userID", res.user[0].userID)
                localStorage.setItem("isLogin", true)
                toast('Đăng nhập thành công', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                console.log(res)
                toast.error('Tài khoản hoặc mật khẩu không chính xác', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
    
    return (
        <div className="login">
            <div className="container-login">
                <h1>Đăng nhập</h1>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Tên đăng nhập"/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu"/>
                <button onClick={handleLogin} className="btn-login">Đăng nhập</button>                
            </div>
            <ToastContainer />
        </div>
    );
}

export default login;