<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="daka.aspx.cs" Inherits="WebApplication1.daka" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>我的考勤 - 哈夫克集团</title>
    <style>
        /* 全局重置 & 基础样式 */
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
        
        /* 头部样式（优化阴影/圆角/间距） */
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
            max-width: 1200px;
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
        
        /* 返回按钮优化（圆角/渐变/hover效果） */
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
        
        /* 主内容区（优化间距/圆角/阴影） */
        .main-content {
            padding: 40px 0;
        }
        
        .attendance-section {
            background: white;
            border-radius: 16px;
            padding: 40px 30px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.06);
            border: 1px solid rgba(245,245,245,0.8);
        }
        
        /* 标题样式优化（图标/间距/颜色） */
        .section-title {
            font-size: 26px;
            color: #2c3e50;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f5f7fa;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
        }
        
        .section-title::before {
            content: "📅";
            font-size: 28px;
        }
        
        /* 考勤表格样式（大幅优化视觉） */
        .attendance-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 20px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        
        .attendance-table th,
        .attendance-table td {
            padding: 16px 20px;
            text-align: left;
        }
        
        .attendance-table th {
            background: linear-gradient(135deg, #f8fafc 0%, #f5f7fa 100%);
            color: #2c3e50;
            font-weight: 600;
            position: sticky;
            top: 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
            letter-spacing: 0.3px;
        }
        
        /* 表格行hover效果优化 */
        .attendance-table tr {
            transition: background-color 0.2s ease;
        }
        
        .attendance-table tr:not(:last-child) td {
            border-bottom: 1px solid #f0f4f8;
        }
        
        .attendance-table tr:hover {
            background-color: #f8fafc;
        }
        
        .attendance-table td {
            color: #4a5568;
            font-size: 14px;
        }
        
        /* 空数据提示优化 */
        .no-data {
            text-align: center;
            padding: 60px 20px;
            color: #718096;
            font-size: 16px;
            background-color: #f8fafc;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        /* 页脚样式优化 */
        .footer {
            text-align: center;
            padding: 30px 0;
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            margin-top: 50px;
            letter-spacing: 0.5px;
        }

        /* 响应式适配（移动端优化） */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
            
            .attendance-section {
                padding: 25px 20px;
            }
            
            .section-title {
                font-size: 22px;
            }
            
            .attendance-table th,
            .attendance-table td {
                padding: 12px 15px;
                font-size: 13px;
            }
            
            .no-data {
                padding: 40px 15px;
                font-size: 14px;
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
                        <h1>哈夫克集团 - 我的考勤</h1>
                    </div>
                    <a href="WebForm3.aspx" class="back-btn">返回首页</a>
                </div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="container">
                <div class="attendance-section">
                    <h2 class="section-title">考勤记录</h2>
                    <asp:GridView ID="gvAttendance" runat="server" 
                        CssClass="attendance-table"
                        EmptyDataText="暂无考勤记录"
                        AutoGenerateColumns="false"
                        GridLines="None">
                        <Columns>
                            <asp:BoundField DataField="EmployeeID" HeaderText="员工ID" />
                            <asp:BoundField DataField="EmployeeName" HeaderText="员工姓名" />
                            <asp:BoundField DataField="AttendanceDate" HeaderText="打卡日期" />
                            <asp:BoundField DataField="AttendanceTime" HeaderText="打卡时间" />
                            <asp:BoundField DataField="CheckType" HeaderText="打卡类型" />
                        </Columns>
                        <EmptyDataTemplate>
                            <div class="no-data">暂无考勤记录</div>
                        </EmptyDataTemplate>
                    </asp:GridView>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="container">
                <p>© 2023 哈夫克集团 版权所有 | 员工门户系统 v1.0</p>
            </div>
        </div>
    </form>
</body>
</html>