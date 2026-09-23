<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm3.aspx.cs" Inherits="WebApplication1.WebForm3" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <title>员工门户 - 哈夫克集团</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        
        .container {
            width: 90%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 15px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo h1 {
            color: #2c3e50;
            font-size: 24px;
            font-weight: 600;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3498db, #2c3e50);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        .user-details {
            text-align: right;
        }
        
        .user-name {
            font-weight: 600;
            color: #2c3e50;
        }
        
        .user-role {
            color: #718096;
            font-size: 14px;
        }
        
        .logout-btn {
            padding: 8px 20px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .logout-btn:hover {
            background: #c0392b;
            transform: translateY(-2px);
        }
        
        .main-content {
            padding: 40px 0;
        }
        
        .welcome-section {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .welcome-title {
            font-size: 32px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        
        .welcome-subtitle {
            color: #718096;
            font-size: 18px;
            line-height: 1.6;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .feature-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            border-color: #3498db;
            box-shadow: 0 12px 30px rgba(52, 152, 219, 0.15);
        }
        
        .feature-icon {
            font-size: 40px;
            margin-bottom: 20px;
            color: #3498db;
        }
        
        .feature-title {
            font-size: 20px;
            color: #2c3e50;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .feature-desc {
            color: #718096;
            line-height: 1.6;
        }
        
        .personal-info {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .section-title {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f3f5;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
        }
        
        .info-item {
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
            border-left: 4px solid #3498db;
        }
        
        .info-label {
            color: #718096;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .info-value {
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
        }
        
        .notifications {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-top: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .notification-list {
            list-style: none;
        }
        
        .notification-item {
            padding: 20px;
            border-bottom: 1px solid #f0f3f5;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .notification-item:last-child {
            border-bottom: none;
        }
        
        .notification-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .notification-icon.info {
            background: #3498db;
        }
        
        .notification-icon.warning {
            background: #f39c12;
        }
        
        .notification-content {
            flex: 1;
        }
        
        .notification-title {
            color: #2c3e50;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .notification-time {
            color: #a0aec0;
            font-size: 12px;
        }
        
        .footer {
            text-align: center;
            padding: 30px 0;
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            margin-top: 50px;
        }
        
        .footer a {
            color: white;
            text-decoration: none;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 20px;
            }
            
            .user-info {
                width: 100%;
                justify-content: space-between;
            }
            
            .welcome-title {
                font-size: 24px;
            }
            
            .feature-card {
                padding: 20px;
            }
        }
    </style>
    <link rel="stylesheet" href="../Content/havvk-theme.css" />
    </head>
<body>
    <form id="form1" runat="server">
        <div class="header">
            <div class="container">
                <div class="header-content">
                    <div class="logo">
                        <h1>哈夫克集团 - 员工门户</h1>
                    </div>
                    
                    <div class="user-info">
                        <div class="user-avatar" id="userAvatar">U</div>
                        <div class="user-details">
                            <div class="user-name" id="userName">加载中...</div>
                            <div class="user-role">普通员工</div>
                        </div>
                        <button class="logout-btn" onclick="logout()">退出登录</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="container">
                <div class="welcome-section">
                    <h1 class="welcome-title" id="welcomeMessage">欢迎您，员工！</h1>
                    <p class="welcome-subtitle">
                        今天是 <span id="currentDate">--</span>，祝您工作愉快！<br>
                        系统为您提供个人中心、考勤查看、请假申请、公告通知等功能。
                    </p>
                </div>
                
                <div class="features-grid">
                    <div class="feature-card" onclick="window.location.href='daka.aspx'">
                        <div class="feature-icon">📅</div>
                        <h3 class="feature-title">我的考勤</h3>
                        <p class="feature-desc">查看上下班打卡记录，月度考勤统计</p>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.href='qingjia.aspx'">
                        <div class="feature-icon">🏖️</div>
                        <h3 class="feature-title">请假申请</h3>
                        <p class="feature-desc">提交请假申请，查看审批进度</p>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.href='mission.aspx'">
                        <div class="feature-icon">✅</div>
                        <h3 class="feature-title">我的任务</h3>
                        <p class="feature-desc">查看分配的工作任务，提交完成情况</p>
                    </div>
                    
                    <div class="feature-card" onclick="window.location.href='profile.aspx'">
                        <div class="feature-icon">📄</div>
                        <h3 class="feature-title">个人文档</h3>
                        <p class="feature-desc">查看合同、工资条、考核记录等</p>
                    </div>
                </div>
                
                <div class="personal-info">
                    <h2 class="section-title">📋 个人信息</h2>
                    <div class="info-grid" id="personalInfo">
                        <!-- 动态加载个人信息 -->
                    </div>
                </div>
                
                <div class="notifications">
                    <h2 class="section-title">🔔 最新通知</h2>
                    <ul class="notification-list" id="notificationList">
                        <!-- 动态加载通知 -->
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="container">
                <p>© 2023 哈夫克集团 版权所有 | 员工门户系统 v1.0</p>
                <p>技术支持：信息技术部 | 服务热线：400-888-8888</p>
                <p style="margin-top: 10px;">
                    <span id="serverTime">--:--:--</span>
                </p>
            </div>
        </div>
        
        <!-- 模态框容器 -->
        <div id="modalContainer"></div>
    </form>

    <script>
        // 页面加载时初始化
        document.addEventListener('DOMContentLoaded', function () {
            loadUserInfo();
            loadPersonalInfo();
            loadNotifications();
            updateCurrentTime();
            setInterval(updateCurrentTime, 1000);
        });

        // 加载用户信息
        async function loadUserInfo() {
            try {
                const response = await fetch('WebForm3.aspx/GetUserInfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.d.success) {
                        const user = data.d.user;
                        document.getElementById('userName').textContent = user.EmployeeName;
                        document.getElementById('userAvatar').textContent = user.EmployeeName.charAt(0);
                        document.getElementById('welcomeMessage').textContent = `欢迎您，${user.EmployeeName}！`;
                    }
                }
            } catch (error) {
                console.error('加载用户信息失败:', error);
            }
        }

        // 加载个人信息
        async function loadPersonalInfo() {
            try {
                const response = await fetch('WebForm3.aspx/GetPersonalInfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.d.success) {
                        displayPersonalInfo(data.d.info);
                    }
                }
            } catch (error) {
                console.error('加载个人信息失败:', error);
            }
        }

        // 显示个人信息
        function displayPersonalInfo(info) {
            const container = document.getElementById('personalInfo');
            container.innerHTML = `
                <div class="info-item">
                    <div class="info-label">员工编号</div>
                    <div class="info-value">${info.EmployeeID}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">所属部门</div>
                    <div class="info-value">${info.Department}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">职位</div>
                    <div class="info-value">${info.PermissionName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">联系方式</div>
                    <div class="info-value">${info.PhoneNumber}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">邮箱</div>
                    <div class="info-value">${info.Email}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">入职时间</div>
                    <div class="info-value">${formatDate(info.CreatedAt)}</div>
                </div>
            `;
        }

        // 加载通知
        async function loadNotifications() {
            try {
                const response = await fetch('WebForm3.aspx/GetNotifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.d.success) {
                        displayNotifications(data.d.notifications);
                    }
                }
            } catch (error) {
                console.error('加载通知失败:', error);
            }
        }

        // 显示通知
        function displayNotifications(notifications) {
            const container = document.getElementById('notificationList');
            container.innerHTML = '';

            notifications.forEach(notif => {
                const item = document.createElement('li');
                item.className = 'notification-item';
                item.innerHTML = `
                    <div class="notification-icon ${notif.type}">
                        ${notif.icon}
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notif.title}</div>
                        <div class="notification-desc">${notif.description}</div>
                        <div class="notification-time">${notif.time}</div>
                    </div>
                `;
                container.appendChild(item);
            });
        }

        // 显示功能模块
        function showFeature(feature) {
            const features = {
                'attendance': {
                    title: '我的考勤',
                    content: '考勤功能开发中...'
                },
                'leave': {
                    title: '请假申请',
                    content: '请假功能开发中...'
                },
                'task': {
                    title: '我的任务',
                    content: '任务功能开发中...'
                },
                'documents': {
                    title: '个人文档',
                    content: '文档功能开发中...'
                }
            };

            const selected = features[feature];
            if (selected) {
                showModal(selected.title, selected.content);
            }
        }

        // 显示模态框
        function showModal(title, content) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            `;

            modal.innerHTML = `
                <div style="background: white; border-radius: 15px; padding: 30px; width: 90%; max-width: 500px;">
                    <h3 style="color: #2c3e50; margin-bottom: 20px;">${title}</h3>
                    <div style="margin-bottom: 25px; color: #4a5568;">${content}</div>
                    <button onclick="closeModal()" style="padding: 10px 25px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">关闭</button>
                </div>
            `;

            document.getElementById('modalContainer').appendChild(modal);
        }

        // 关闭模态框
        function closeModal() {
            const container = document.getElementById('modalContainer');
            container.innerHTML = '';
        }

        // 更新当前时间
        function updateCurrentTime() {
            const now = new Date();

            // 日期
            const dateStr = now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
            document.getElementById('currentDate').textContent = dateStr;

            // 时间
            const timeStr = now.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            document.getElementById('serverTime').textContent = timeStr;
        }

        // 格式化日期
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN');
        }

        // 退出登录
        function logout() {
            if (confirm('确定要退出登录吗？')) {
                // 先尝试调用服务器端登出
                fetch('WebForm4.aspx/Logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(response => {
                    // 无论服务器响应如何，都重定向到登录页
                    window.location.href = 'WebForm2.aspx';
                }).catch(error => {
                    console.error('登出请求失败:', error);
                    // 即使请求失败也重定向
                    window.location.href = 'WebForm2.aspx';
                });
            }
        }
    </script>
</body>
</html>