import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { login } from '../utils/api';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 实现登录逻辑
    try {
      const response = await login(username, password);
      if (response.success) {
        localStorage.setItem('_token', response.data.token);
        message.success('登录成功');
        navigate('/admin');
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('登录失败');
      console.error('登录失败:', error);
    }
  };

  return (
    <div className="login-container" >
      <div className="login-box">
        <h2>AI Nav 登录</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              required
            />
          </div>
          <button type="submit" className="login-button">
            登录
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
