<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm2.aspx.cs" Inherits="WebApplication1.WebForm2" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <title>哈夫克集团 - 员工登录</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
        }
        
        body {
            background-color: #ecf3fa;
            background-image: url('../Content/havvk/rp0.jpg');
            background-repeat: no-repeat;
            background-position: 50% 0;
            background-size: 100% auto;
            background-attachment: fixed;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-container {
            width: 100%;
            max-width: 420px;
            animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .logo-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #2c3e50, #3498db);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .logo-text {
            color: white;
        }
        
        .logo-text h1 {
            font-size: 32px;
            font-weight: 600;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .logo-text p {
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            margin-top: 5px;
        }
        
        .login-box {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .login-title {
            text-align: center;
            color: #2c3e50;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f3f5;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        .form-label {
            display: block;
            margin-bottom: 8px;
            color: #4a5568;
            font-weight: 500;
            font-size: 14px;
        }
        
        .input-group {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .input-icon {
            position: absolute;
            left: 15px;
            color: #a0aec0;
            font-size: 18px;
        }
        
        .form-control {
            width: 100%;
            padding: 15px 15px 15px 50px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 15px;
            transition: all 0.3s ease;
            background: white;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        .captcha-container {
            display: none;
            margin-top: 15px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
        }
        
        .captcha-row {
            display: flex;
            gap: 15px;
            margin-bottom: 10px;
        }
        
        .captcha-code {
            flex: 1;
            background: #2c3e50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 5px;
            text-align: center;
            user-select: none;
            cursor: pointer;
        }
        
        .captcha-input {
            flex: 1;
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            text-align: center;
            letter-spacing: 3px;
        }
        
        .refresh-captcha {
            color: #3498db;
            cursor: pointer;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-top: 10px;
        }
        
        .login-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-top: 10px;
        }
        
        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(52, 152, 219, 0.3);
        }
        
        .login-btn:disabled {
            background: #a0aec0;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .error-message {
            background: #fed7d7;
            color: #c53030;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            display: none;
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        .success-message {
            background: #c6f6d5;
            color: #22543d;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            display: none;
        }
        
        .remember-forgot {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            font-size: 14px;
        }
        
        .remember-me {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #4a5568;
        }
        
        .forgot-password {
            color: #3498db;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .forgot-password:hover {
            color: #2c3e50;
        }
        
        .login-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 13px;
        }
        
        .password-toggle {
            position: absolute;
            right: 15px;
            background: none;
            border: none;
            color: #a0aec0;
            cursor: pointer;
            font-size: 18px;
        }
        
        .login-attempts {
            color: #e53e3e;
            font-size: 12px;
            margin-top: 5px;
            display: none;
        }
        
        .loading {
            display: none;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* 响应式设计 */
        @media (max-width: 480px) {
            .login-box {
                padding: 30px 20px;
            }
            
            .captcha-row {
                flex-direction: column;
            }
        }
    </style>
    <link rel="stylesheet" href="../Content/havvk-theme.css" />
    </head>
<body>
    <form id="form1" runat="server">
        <div class="login-container">
            <div class="login-header">
                <div class="logo">
                    <div class="logo-icon">
                        🔐
                    </div>
                    <div class="logo-text">
                        <h1>哈夫克集团</h1>
                        <p>员工管理系统 v2.0</p>
                    </div>
                </div>
            </div>
            
            <div class="login-box">
                <h2 class="login-title">员工登录</h2>
                
                <div id="errorMessage" class="error-message"></div>
                <div id="successMessage" class="success-message"></div>
                
                <div class="form-group">
                    <label class="form-label">👤 员工姓名</label>
                    <div class="input-group">
                        <span class="input-icon">👤</span>
                        <input type="text" id="username" class="form-control" 
                               placeholder="请输入您的姓名" 
                               autocomplete="off" 
                               autofocus />
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">🔒 登录密码</label>
                    <div class="input-group">
                        <span class="input-icon">🔒</span>
                        <input type="password" id="password" class="form-control" 
                               placeholder="请输入您的密码" 
                               autocomplete="current-password" />
                        <button type="button" class="password-toggle" onclick="togglePassword()">👁️</button>
                    </div>
                    <div id="loginAttempts" class="login-attempts">
                        剩余尝试次数: <span id="attemptsLeft">3</span>
                    </div>
                </div>
                
                <div id="captchaContainer" class="captcha-container">
                    <div class="form-label">🔢 验证码</div>
                    <div class="captcha-row">
                        <div id="captchaCode" class="captcha-code">1234</div>
                        <input type="text" id="captchaInput" class="captcha-input" 
                               placeholder="输入验证码" 
                               maxlength="4" 
                               autocomplete="off" />
                    </div>
                    <div class="refresh-captcha" onclick="refreshCaptcha()">
                        🔄 刷新验证码
                    </div>
                </div>
                
                <div class="remember-forgot">
                    <label class="remember-me">
                        <input type="checkbox" id="rememberMe" />
                        <span>记住登录</span>
                    </label>
                    <a href="#" class="forgot-password" onclick="showForgotPassword()">忘记密码？</a>
                </div>
                
                <button type="button" id="loginBtn" class="login-btn" onclick="login()">
                    <span>登录系统</span>
                    <div class="loading"></div>
                </button>
                
                <div class="login-footer">
                    <p>© 2023 哈夫克集团 版权所有</p>
                    <p style="margin-top: 5px; font-size: 12px;">
                        <span id="currentTime">--:--:--</span> | 
                        <span>技术支持: 400-888-8888</span>
                    </p>
                </div>
            </div>
        </div>
        
        <!-- 忘记密码模态框 -->
        <div id="forgotPasswordModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 15px; padding: 30px; width: 90%; max-width: 400px;">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">重置密码</h3>
                <div class="form-group">
                    <label class="form-label">员工姓名</label>
                    <input type="text" id="resetUsername" class="form-control" placeholder="请输入您的姓名">
                </div>
                <div class="form-group">
                    <label class="form-label">员工编号</label>
                    <input type="text" id="resetEmployeeId" class="form-control" placeholder="请输入您的员工编号">
                </div>
                <div class="form-group">
                    <label class="form-label">邮箱地址</label>
                    <input type="email" id="resetEmail" class="form-control" placeholder="请输入您的邮箱">
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button class="btn" onclick="closeForgotPassword()" style="flex: 1; padding: 12px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">取消</button>
                    <button class="btn btn-primary" onclick="requestPasswordReset()" style="flex: 1; padding: 12px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">提交申请</button>
                </div>
            </div>
        </div>
    </form>

    <script>
        // 全局变量
        let loginAttempts = 0;
        const maxAttempts = 3;
        let currentCaptcha = '';
        let isCaptchaRequired = false;
        let sessionTimeout = null;

        // 页面加载时初始化
        document.addEventListener('DOMContentLoaded', function () {
            updateCurrentTime();
            setInterval(updateCurrentTime, 1000);

            // 检查是否有保存的登录信息
            checkSavedCredentials();

            // 生成初始验证码
            refreshCaptcha();

            // 设置会话超时（30分钟）
            resetSessionTimeout();

            // 监听键盘事件
            document.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    login();
                }
            });

            // 监听输入框变化
            document.getElementById('username').addEventListener('input', resetLoginAttempts);
            document.getElementById('password').addEventListener('input', resetLoginAttempts);
        });

        // 更新当前时间
        function updateCurrentTime() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            document.getElementById('currentTime').textContent = timeStr;
        }

        // 检查保存的登录信息
        function checkSavedCredentials() {
            const savedUsername = localStorage.getItem('saved_username');
            const savedRemember = localStorage.getItem('remember_login');

            if (savedUsername && savedRemember === 'true') {
                document.getElementById('username').value = savedUsername;
                document.getElementById('rememberMe').checked = true;
            }
        }

        // 生成验证码
        function generateCaptcha() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let captcha = '';
            for (let i = 0; i < 4; i++) {
                captcha += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return captcha;
        }

        // 刷新验证码
        function refreshCaptcha() {
            currentCaptcha = generateCaptcha();
            document.getElementById('captchaCode').textContent = currentCaptcha;
            document.getElementById('captchaInput').value = '';

            // 添加动画效果
            const captchaElement = document.getElementById('captchaCode');
            captchaElement.style.transform = 'scale(0.9)';
            setTimeout(() => {
                captchaElement.style.transform = 'scale(1)';
            }, 100);
        }

        // 显示验证码
        function showCaptcha() {
            const container = document.getElementById('captchaContainer');
            container.style.display = 'block';
            container.style.animation = 'fadeIn 0.3s ease-out';
            refreshCaptcha();
            document.getElementById('captchaInput').focus();
            isCaptchaRequired = true;
        }

        // 隐藏验证码
        function hideCaptcha() {
            const container = document.getElementById('captchaContainer');
            container.style.display = 'none';
            isCaptchaRequired = false;
        }

        // 切换密码显示
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const toggleBtn = document.querySelector('.password-toggle');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleBtn.textContent = '👁️‍🗨️';
            } else {
                passwordInput.type = 'password';
                toggleBtn.textContent = '👁️';
            }
        }

        // 登录验证
        async function login() {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const rememberMe = document.getElementById('rememberMe').checked;
            const captchaInput = document.getElementById('captchaInput').value.trim().toUpperCase();

            // 验证输入
            if (!username) {
                showError('请输入员工姓名');
                document.getElementById('username').focus();
                return;
            }

            if (!password) {
                showError('请输入密码');
                document.getElementById('password').focus();
                return;
            }

            // 如果需要验证码，检查验证码
            if (isCaptchaRequired && !captchaInput) {
                showError('请输入验证码');
                document.getElementById('captchaInput').focus();
                return;
            }

            if (isCaptchaRequired && captchaInput !== currentCaptcha) {
                showError('验证码错误');
                refreshCaptcha();
                document.getElementById('captchaInput').value = '';
                document.getElementById('captchaInput').focus();
                return;
            }

            // 禁用登录按钮，显示加载动画
            const loginBtn = document.getElementById('loginBtn');
            const loading = loginBtn.querySelector('.loading');
            loginBtn.disabled = true;
            loading.style.display = 'block';
            loginBtn.querySelector('span').textContent = '登录中...';

            try {
                // 调用WebMethod验证登录
                const response = await fetch('WebForm2.aspx/ValidateLogin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });

                const data = await response.json();

                if (data.d.success) {
                    // 登录成功
                    showSuccess('登录成功，正在跳转...');

                    // 保存登录信息（如果勾选了记住我）
                    if (rememberMe) {
                        localStorage.setItem('saved_username', username);
                        localStorage.setItem('remember_login', 'true');
                    } else {
                        localStorage.removeItem('saved_username');
                        localStorage.removeItem('remember_login');
                    }

                    // 重置登录尝试次数
                    resetLoginAttempts();

                    // 根据权限跳转
                    setTimeout(() => {
                        if (data.d.permissionLevel === 3) {
                            // 管理员跳转到后台管理
                            window.location.href = 'WebForm1.aspx';
                        } else {
                            // 普通员工跳转到员工门户
                            window.location.href = 'WebForm3.aspx';
                        }
                    }, 1500);

                } else {
                    // 登录失败
                    loginAttempts++;
                    document.getElementById('loginAttempts').style.display = 'block';
                    document.getElementById('attemptsLeft').textContent = maxAttempts - loginAttempts;

                    showError(data.d.message || '登录失败');

                    // 密码错误达到阈值时显示验证码
                    if (loginAttempts >= maxAttempts) {
                        showCaptcha();
                    }

                    // 清除密码输入框
                    document.getElementById('password').value = '';
                    document.getElementById('password').focus();

                    if (isCaptchaRequired) {
                        refreshCaptcha();
                        document.getElementById('captchaInput').value = '';
                        document.getElementById('captchaInput').focus();
                    }
                }

            } catch (error) {
                console.error('登录请求失败:', error);
                showError('网络错误，请稍后重试');
            } finally {
                // 恢复登录按钮
                loginBtn.disabled = false;
                loading.style.display = 'none';
                loginBtn.querySelector('span').textContent = '登录系统';
            }
        }

        // 显示错误信息
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';

            // 隐藏成功消息
            document.getElementById('successMessage').style.display = 'none';

            // 3秒后自动隐藏错误信息
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }

        // 显示成功信息
        function showSuccess(message) {
            const successDiv = document.getElementById('successMessage');
            successDiv.textContent = message;
            successDiv.style.display = 'block';

            // 隐藏错误消息
            document.getElementById('errorMessage').style.display = 'none';
        }

        // 重置登录尝试次数
        function resetLoginAttempts() {
            if (loginAttempts > 0) {
                loginAttempts = 0;
                document.getElementById('loginAttempts').style.display = 'none';
                hideCaptcha();
            }
        }

        // 显示忘记密码模态框
        function showForgotPassword() {
            document.getElementById('forgotPasswordModal').style.display = 'flex';
        }

        // 关闭忘记密码模态框
        function closeForgotPassword() {
            document.getElementById('forgotPasswordModal').style.display = 'none';
        }

        // 请求密码重置
        function requestPasswordReset() {
            const username = document.getElementById('resetUsername').value.trim();
            const employeeId = document.getElementById('resetEmployeeId').value.trim();
            const email = document.getElementById('resetEmail').value.trim();

            if (!username || !employeeId || !email) {
                alert('请填写所有信息');
                return;
            }

            // 这里应该调用后端的密码重置功能
            // 暂时模拟一个成功响应
            showSuccess('密码重置申请已提交，请查看您的邮箱');
            closeForgotPassword();
        }

        // 重置会话超时
        function resetSessionTimeout() {
            if (sessionTimeout) {
                clearTimeout(sessionTimeout);
            }

            // 30分钟后显示超时提示
            sessionTimeout = setTimeout(() => {
                if (confirm('会话已超时，是否重新登录？')) {
                    window.location.reload();
                }
            }, 30 * 60 * 1000);
        }

        // 监听用户活动以重置超时
        ['mousemove', 'keypress', 'click'].forEach(event => {
            document.addEventListener(event, resetSessionTimeout);
        });
    </script>
</body>
</html>