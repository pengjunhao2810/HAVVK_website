<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="profile.aspx.cs" Inherits="WebApplication1.profile" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>哈夫克集团 - 个人信息</title>
    <style>
        /* 统一紫色渐变风格 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            line-height: 1.6;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(12px);
            padding: 18px 0;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            position: sticky;
            top: 0;
            z-index: 1000;
            border-bottom: 1px solid rgba(230,230,230,0.5);
        }
        
        .container {
            width: 92%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 15px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
        }
        
        .logo h1 {
            color: #2c3e50;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        
        .back-btn {
            padding: 10px 24px;
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
        }
        
        .back-btn:hover {
            background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }
        
        /* 个人信息卡片 */
        .main-content {
            padding: 60px 0;
        }
        
        .profile-card {
            background: white;
            border-radius: 16px;
            padding: 50px 40px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.07);
            border: 1px solid rgba(245,245,245,0.8);
        }
        
        .section-title {
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 40px;
            padding-bottom: 25px;
            border-bottom: 2px solid #f5f7fa;
            display: flex;
            align-items: center;
            gap: 15px;
            font-weight: 600;
        }
        
        .section-title::before {
            content: "👤";
            font-size: 32px;
        }
        
        /* 信息项布局 */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px 20px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .info-label {
            color: #4a5568;
            font-size: 14px;
            font-weight: 500;
        }
        
        .info-value {
            color: #2c3e50;
            font-size: 16px;
            padding: 12px 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #f0f4f8;
        }
        
        .footer {
            text-align: center;
            padding: 30px 0;
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            margin-top: 50px;
            letter-spacing: 0.5px;
        }

        /* 响应式适配 */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
            
            .profile-card {
                padding: 30px 25px;
            }
            
            .section-title {
                font-size: 24px;
                margin-bottom: 30px;
            }
        }
    </style>
    <link rel="stylesheet" href="../Content/havvk-theme.css" />
    </head>
<body>
    <form id="form1" runat="server">
        <!-- 头部 -->
        <div class="header">
            <div class="container">
                <div class="header-content">
                    <div class="logo">
                        <h1>哈夫克集团 - 个人信息</h1>
                    </div>
                    <a href="WebForm3.aspx" class="back-btn">返回首页</a>
                </div>
            </div>
        </div>
        
        <!-- 主内容区 -->
        <div class="main-content">
            <div class="container">
                <div class="profile-card">
                    <h2 class="section-title">我的个人信息</h2>
                    
                    <!-- 信息展示网格（新增Email项） -->
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">员工姓名</div>
                            <div class="info-value"><asp:Label ID="lblEmployeeName" runat="server"></asp:Label></div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">年龄</div>
                            <div class="info-value"><asp:Label ID="lblAge" runat="server"></asp:Label></div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">所属部门</div>
                            <div class="info-value"><asp:Label ID="lblDepartment" runat="server"></asp:Label></div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">性别</div>
                            <div class="info-value"><asp:Label ID="lblGender" runat="server"></asp:Label></div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">电话号码</div>
                            <div class="info-value"><asp:Label ID="lblPhoneNumber" runat="server"></asp:Label></div>
                        </div>
                        <!-- 新增Email字段展示项 -->
                        <div class="info-item">
                            <div class="info-label">电子邮箱</div>
                            <div class="info-value"><asp:Label ID="lblEmail" runat="server"></asp:Label></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 页脚 -->
        <div class="footer">
            <div class="container">
                <p>© 2023 哈夫克集团 版权所有 | 员工门户系统 v1.0</p>
            </div>
        </div>
    </form>
</body>
</html>