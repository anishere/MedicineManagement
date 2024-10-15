/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";

function login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    
    return (
        <div className="login">
            <div className="container-login">
                <h1>Đăng nhập</h1>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Tên đăng nhập"/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu"/>
                <p className="btn-login">Đăng nhập</p>                
            </div>
        </div>
    );
}

export default login;