<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="qingjia.aspx.cs" Inherits="WebApplication1.qingjia" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>哈夫克集团 - 员工请假</title>
    <style>
        /* 完全恢复原紫色渐变风格 */
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
        
        .main-content {
            padding: 40px 0;
        }
        
        .leave-section {
            background: white;
            border-radius: 16px;
            padding: 40px 30px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.06);
            border: 1px solid rgba(245,245,245,0.8);
        }
        
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
            content: "📝";
            font-size: 28px;
        }
        
        .leave-form {
            background: #f8fafc;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 40px;
            border: 1px solid #f0f4f8;
        }
        
        .form-row {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .form-group {
            flex: 1;
            min-width: 250px;
        }
        
        .form-label {
            display: block;
            margin-bottom: 8px;
            color: #2c3e50;
            font-weight: 500;
            font-size: 14px;
        }
        
        /* 通用输入框样式 */
        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s ease;
        }
        
        /* 核心：原生日期输入框 彻底隐藏占位符 */
        .date-input {
            position: relative;
            /* 隐藏原生占位符文字 */
            color: transparent;
            cursor: pointer;
        }
        /* 选中日期后显示文字 */
        .date-input:valid, .date-input:focus {
            color: #4a5568;
        }
        /* 保留右侧日历图标 */
        .date-input::-webkit-calendar-picker-indicator {
            color: #4a5568;
            opacity: 1;
            cursor: pointer;
        }
        
        .form-control[readonly] {
            background-color: #f5f7fa;
            color: #4a5568;
            cursor: default;
        }
        
        .form-control:focus, .date-input:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        .submit-btn {
            padding: 12px 30px;
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
        }
        
        .submit-btn:hover {
            background: linear-gradient(135deg, #27ae60 0%, #219653 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
        }
        
        .leave-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        
        .leave-table th,
        .leave-table td {
            padding: 16px 20px;
            text-align: left;
        }
        
        .leave-table th {
            background: linear-gradient(135deg, #f8fafc 0%, #f5f7fa 100%);
            color: #2c3e50;
            font-weight: 600;
            position: sticky;
            top: 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        
        .leave-table tr {
            transition: background-color 0.2s ease;
        }
        
        .leave-table tr:not(:last-child) td {
            border-bottom: 1px solid #f0f4f8;
        }
        
        .leave-table tr:hover {
            background-color: #f8fafc;
        }
        
        .leave-table td {
            color: #4a5568;
            font-size: 14px;
        }
        
        .no-data {
            text-align: center;
            padding: 60px 20px;
            color: #718096;
            font-size: 16px;
            background-color: #f8fafc;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .success-msg {
            background: #c6f6d5;
            color: #22543d;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }
        
        .error-msg {
            background: #fed7d7;
            color: #c53030;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }
        
        .footer {
            text-align: center;
            padding: 30px 0;
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            margin-top: 50px;
            letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
            
            .leave-section {
                padding: 25px 20px;
            }
            
            .leave-form {
                padding: 20px;
            }
            
            .form-row {
                gap: 15px;
            }
            
            .leave-table th,
            .leave-table td {
                padding: 12px 15px;
                font-size: 13px;
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
                        <h1>哈夫克集团 - 员工请假</h1>
                    </div>
                    <a href="WebForm3.aspx" class="back-btn">返回首页</a>
                </div>
            </div>
        </div>
        
        <!-- 主内容区 -->
        <div class="main-content">
            <div class="container">
                <div class="leave-section">
                    <h2 class="section-title">请假申请</h2>
                    
                    <!-- 提示信息 -->
                    <asp:Label ID="lblSuccess" runat="server" CssClass="success-msg"></asp:Label>
                    <asp:Label ID="lblError" runat="server" CssClass="error-msg"></asp:Label>
                    
                    <!-- 请假表单 -->
                    <div class="leave-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">员工ID</label>
                                <asp:TextBox ID="txtEmployeeID" runat="server" CssClass="form-control" ReadOnly="True"></asp:TextBox>
                            </div>
                            <div class="form-group">
                                <label class="form-label">员工姓名</label>
                                <asp:TextBox ID="txtEmployeeName" runat="server" CssClass="form-control" ReadOnly="True"></asp:TextBox>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <!-- 请假开始日期（原生date，无占位符） -->
                            <div class="form-group">
                                <label class="form-label">请假开始日期</label>
                                <asp:TextBox ID="txtStartDate" runat="server" CssClass="form-control date-input" type="date" placeholder="" required="required"></asp:TextBox>
                            </div>
                            <!-- 请假截止日期（原生date，无占位符） -->
                            <div class="form-group">
                                <label class="form-label">请假截止日期</label>
                                <asp:TextBox ID="txtEndDate" runat="server" CssClass="form-control date-input" type="date" placeholder="" required="required"></asp:TextBox>
                            </div>
                        </div>
                        
                        <!-- 提交按钮 -->
                        <asp:Button ID="btnSubmit" runat="server" Text="提交请假申请" CssClass="submit-btn" OnClick="btnSubmit_Click" />
                    </div>
                    
                    <!-- 请假记录展示 -->
                    <h3 style="color: #2c3e50; margin-bottom: 20px; font-size: 18px;">📋 我的请假记录</h3>
                    <asp:GridView ID="gvLeaveRecords" runat="server" 
                        CssClass="leave-table"
                        EmptyDataText="暂无请假记录"
                        AutoGenerateColumns="false"
                        GridLines="None">
                        <Columns>
                            <asp:BoundField DataField="EmployeeID" HeaderText="员工ID" />
                            <asp:BoundField DataField="EmployeeName" HeaderText="员工姓名" />
                            <asp:BoundField DataField="LeaveStartDate" HeaderText="请假开始日期" DataFormatString="{0:yyyy-MM-dd}" />
                            <asp:BoundField DataField="LeaveEndDate" HeaderText="请假截止日期" DataFormatString="{0:yyyy-MM-dd}" />
                            <asp:BoundField DataField="SubmitTime" HeaderText="提交时间" DataFormatString="{0:yyyy-MM-dd HH:mm:ss}" />
                        </Columns>
                        <EmptyDataTemplate>
                            <div class="no-data">暂无请假记录</div>
                        </EmptyDataTemplate>
                    </asp:GridView>
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