<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm4.aspx.cs" Inherits="WebApplication1.WebForm4" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <title>部门主管门户 - 哈夫克集团</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);
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
            background: linear-gradient(135deg, #8e2de2, #4a00e0);
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
            color: #8e2de2;
            font-size: 14px;
            font-weight: 600;
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
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
            border-color: #8e2de2;
            box-shadow: 0 12px 30px rgba(142, 45, 226, 0.15);
        }
        
        .feature-icon {
            font-size: 40px;
            margin-bottom: 20px;
            color: #8e2de2;
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
        
        .department-info {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .section-title {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f3f5;
        }
        
        .info-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .stat-item {
            background: linear-gradient(135deg, #8e2de2, #4a00e0);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .footer {
            text-align: center;
            padding: 30px 0;
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            margin-top: 50px;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            background: white;
            border-radius: 15px;
            padding: 30px;
            width: 90%;
            max-width: 600px;
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
                        <h1>哈夫克集团 - 部门主管门户</h1>
                    </div>
                    
                    <div class="user-info">
                        <div class="user-avatar" id="userAvatar">M</div>
                        <div class="user-details">
                            <div class="user-name" id="userName">加载中...</div>
                            <div class="user-role">部门主管</div>
                        </div>
                        <button class="logout-btn" onclick="logout()">退出登录</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="container">
                <div class="welcome-section">
                    <h1 class="welcome-title" id="welcomeMessage">欢迎您，主管！</h1>
                    <p>今天是 <span id="currentDate">--</span>，祝您工作顺利！</p>
                </div>
                
                <div class="features-grid">
                    <div class="feature-card" onclick="showDepartmentEmployees()">
                        <div class="feature-icon">👥</div>
                        <h3 class="feature-title">部门员工管理</h3>
                        <p class="feature-desc">查看和管理本部门员工信息，分配工作任务</p>
                    </div>
                    
                    <div class="feature-card" onclick="showLeaveApproval()">
                        <div class="feature-icon">📋</div>
                        <h3 class="feature-title">请假审批</h3>
                        <p class="feature-desc">审批部门员工的请假申请，管理考勤</p>
                    </div>
                    
                    <div class="feature-card" onclick="showPerformanceReview()">
                        <div class="feature-icon">⭐</div>
                        <h3 class="feature-title">绩效考核</h3>
                        <p class="feature-desc">进行员工绩效考核，提交考核结果</p>
                    </div>
                    
                    <div class="feature-card" onclick="showDepartmentReport()">
                        <div class="feature-icon">📊</div>
                        <h3 class="feature-title">部门报表</h3>
                        <p class="feature-desc">查看部门工作统计，生成工作报告</p>
                    </div>
                </div>
                
                <div class="department-info">
                    <h2 class="section-title">🏢 部门信息</h2>
                    <div class="info-stats" id="departmentStats">
                        <!-- 动态加载部门信息 -->
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="container">
                <p>© 2023 哈夫克集团 版权所有 | 部门主管门户 v1.0</p>
                <p>技术支持：信息技术部 | 服务热线：400-888-8888</p>
                <p style="margin-top: 10px;">
                    <span id="serverTime">--:--:--</span>
                </p>
            </div>
        </div>
        
        <!-- 模态框容器 -->
        <div id="modalContainer" class="modal"></div>
    </form>

    <script>
        // 页面加载时初始化
        document.addEventListener('DOMContentLoaded', function () {
            loadUserInfo();
            loadDepartmentInfo();
            updateCurrentTime();
            setInterval(updateCurrentTime, 1000);
        });

        // 加载用户信息
        async function loadUserInfo() {
            try {
                const response = await fetch('WebForm4.aspx/GetUserInfo', {
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
                        document.getElementById('welcomeMessage').textContent = `欢迎您，${user.EmployeeName}主管！`;
                    }
                }
            } catch (error) {
                console.error('加载用户信息失败:', error);
            }
        }

        // 加载部门信息
        async function loadDepartmentInfo() {
            try {
                const response = await fetch('WebForm4.aspx/GetDepartmentInfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.d.success) {
                        displayDepartmentInfo(data.d.department);
                    }
                }
            } catch (error) {
                console.error('加载部门信息失败:', error);
            }
        }

        // 显示部门信息
        function displayDepartmentInfo(dept) {
            const container = document.getElementById('departmentStats');
            container.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${dept.DepartmentName}</div>
                    <div class="stat-label">部门名称</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${dept.EmployeeCount}</div>
                    <div class="stat-label">员工数量</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${dept.IsManager ? '是' : '否'}</div>
                    <div class="stat-label">是否为部门经理</div>
                </div>
            `;
        }

        // 主管功能
        function showDepartmentEmployees() {
            window.location.href = 'DepartmentEmployeeManagement.aspx';
        }

        function showLeaveApproval() {
            window.location.href = 'LeaveApproval.aspx';
        }

        function showPerformanceReview() {
            window.location.href = 'PerformanceReview.aspx';
        }

        function showDepartmentReport() {
            window.location.href = 'DepartmentReport.aspx';
        }

        // 显示模态框
        function showModal(title, content) {
            const modal = document.getElementById('modalContainer');
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3 style="color: #2c3e50; margin-bottom: 20px;">${title}</h3>
                    <div style="margin-bottom: 25px; color: #4a5568;">${content}</div>
                    <button onclick="closeModal()" style="padding: 10px 25px; background: #8e2de2; color: white; border: none; border-radius: 8px; cursor: pointer;">关闭</button>
                </div>
            `;
        }

        // 关闭模态框
        function closeModal() {
            const modal = document.getElementById('modalContainer');
            modal.style.display = 'none';
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