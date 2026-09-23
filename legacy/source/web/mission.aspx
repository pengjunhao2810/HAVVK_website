<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="mission.aspx.cs" Inherits="WebApplication1.mission" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>我的任务 - 哈夫克集团</title>
    <style>
        /* 全局样式 */
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
        
        /* 头部样式 */
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
        
        /* 主内容区 */
        .main-content {
            padding: 60px 0 80px;
        }
        
        .mission-section {
            background: white;
            border-radius: 20px;
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
            content: "📋";
            font-size: 32px;
        }
        
        /* 任务列表样式 */
        .mission-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-top: 20px;
        }
        
        /* 任务卡片 */
        .mission-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px 28px;
            border-left: 4px solid #3498db;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        
        /* 已完成任务卡片样式 */
        .mission-card.completed {
            background: #f0fdf4;
            border-left-color: #22c55e;
        }
        
        .mission-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        }
        
        /* 任务内容 */
        .mission-content {
            font-size: 16px;
            color: #2c3e50;
            margin-bottom: 12px;
            line-height: 1.6;
            font-weight: 500;
        }
        
        /* 截止日期 + 状态 + 操作行 */
        .mission-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .deadline {
            font-size: 14px;
            color: #4a5568;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .deadline::before {
            content: "⏰";
            font-size: 16px;
        }
        
        /* 状态+操作容器 */
        .status-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        /* 完成状态标签 */
        .status-tag {
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
        }
        
        .status-unfinished {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .status-completed {
            background: #dcfce7;
            color: #16a34a;
        }
        
        /* 完成按钮样式 */
        .complete-btn {
            padding: 6px 18px;
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white;
            border: none;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 6px rgba(46, 204, 113, 0.2);
        }
        
        .complete-btn:hover {
            background: linear-gradient(135deg, #27ae60 0%, #219653 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
        }
        
        /* 已完成标识 */
        .completed-icon {
            font-size: 20px;
            color: #22c55e;
        }
        
        /* 空数据提示 */
        .no-data {
            text-align: center;
            padding: 80px 20px;
            color: #718096;
            font-size: 18px;
            background-color: #f8fafc;
            border-radius: 16px;
            margin: 20px 0;
            line-height: 1.8;
        }
        
        .no-data::before {
            content: "📭";
            font-size: 40px;
            display: block;
            margin-bottom: 15px;
        }
        
        /* 提示信息 */
        .success-msg {
            background: #c6f6d5;
            color: #22543d;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            font-size: 14px;
            display: none;
        }
        
        /* 页脚 */
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
            
            .mission-section {
                padding: 30px 25px;
            }
            
            .section-title {
                font-size: 24px;
                margin-bottom: 30px;
            }
            
            .mission-card {
                padding: 20px 22px;
            }
            
            .mission-content {
                font-size: 15px;
            }
            
            .mission-footer {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }
            
            .status-actions {
                width: 100%;
                justify-content: space-between;
            }
            
            .no-data {
                padding: 60px 15px;
                font-size: 16px;
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
                        <h1>哈夫克集团 - 我的任务</h1>
                    </div>
                    <a href="WebForm3.aspx" class="back-btn">返回首页</a>
                </div>
            </div>
        </div>
        
        <!-- 主内容 -->
        <div class="main-content">
            <div class="container">
                <div class="mission-section">
                    <h2 class="section-title">我的任务清单</h2>
                    
                    <!-- 成功提示 -->
                    <asp:Label ID="lblSuccess" runat="server" CssClass="success-msg"></asp:Label>
                    
                    <!-- 任务列表（Repeater） -->
                    <asp:Repeater ID="rptMissions" runat="server" OnItemDataBound="rptMissions_ItemDataBound">
                        <HeaderTemplate>
                            <div class="mission-list">
                        </HeaderTemplate>
                        <ItemTemplate>
                            <div class="mission-card" id="missionCard" runat="server">
                                <div class="mission-content"><%# Eval("MissionContent") %></div>
                                <div class="mission-footer">
                                    <div class="deadline"><%# Eval("MissionDeadline", "{0:yyyy-MM-dd}") %></div>
                                    <div class="status-actions">
                                        <asp:Label ID="lblStatus" runat="server" CssClass="status-tag"></asp:Label>
                                        
                                        <%-- 未完成：显示完成按钮；已完成：显示✅ --%>
                                        <asp:LinkButton ID="lnkComplete" runat="server" 
                                            CssClass="complete-btn"
                                            CommandArgument='<%# Eval("ID") %>'
                                            OnClick="lnkComplete_Click"
                                            Visible='<%# !Convert.ToBoolean(Eval("IsCompleted")) %>'>
                                            标记完成
                                        </asp:LinkButton>
                                        <asp:Label ID="lblCompletedIcon" runat="server" 
                                            CssClass="completed-icon"
                                            Visible='<%# Convert.ToBoolean(Eval("IsCompleted")) %>'>✅</asp:Label>
                                    </div>
                                </div>
                            </div>
                        </ItemTemplate>
                        <FooterTemplate>
                            </div>
                        </FooterTemplate>
                    </asp:Repeater>
                    
                    <!-- 空数据提示 -->
                    <asp:Panel ID="pnlNoData" runat="server" CssClass="no-data" Visible="false">
                        暂无任务记录
                    </asp:Panel>
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