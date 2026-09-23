<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="PerformanceReview.aspx.cs" Inherits="WebApplication1.PerformanceReview" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>绩效考核 - 哈夫克集团</title>
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
            padding: 20px 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .container {
            width: 90%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 15px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .back-btn {
            padding: 8px 20px;
            background: #8e2de2;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
        
        .main-content {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin: 30px auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            min-height: 600px;
        }
        
        .section-title {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f3f5;
        }
        
        .filter-bar {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
            flex-wrap: wrap;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .filter-item {
            display: flex;
            flex-direction: column;
            min-width: 200px;
        }
        
        .filter-item label {
            margin-bottom: 5px;
            color: #555;
            font-weight: 500;
        }
        
        .search-btn {
            padding: 8px 25px;
            background: #8e2de2;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            align-self: flex-end;
        }
        
        .btn {
            padding: 8px 15px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 13px;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: #8e2de2;
            color: white;
        }
        
        .btn-success {
            background: #28a745;
            color: white;
        }
        
        .btn-warning {
            background: #ffc107;
            color: #212529;
        }
        
        .btn-danger {
            background: #dc3545;
            color: white;
        }
        
        .btn-info {
            background: #17a2b8;
            color: white;
        }
        
        .table-container {
            overflow-x: auto;
            margin-top: 20px;
        }
        
        .performance-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .performance-table th,
        .performance-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .performance-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
            position: sticky;
            top: 0;
        }
        
        .score-excellent {
            color: #28a745;
            font-weight: bold;
        }
        
        .score-good {
            color: #20c997;
            font-weight: bold;
        }
        
        .score-average {
            color: #ffc107;
            font-weight: bold;
        }
        
        .score-poor {
            color: #dc3545;
            font-weight: bold;
        }
        
        .status-pending {
            color: #ffc107;
            font-weight: bold;
        }
        
        .status-submitted {
            color: #17a2b8;
            font-weight: bold;
        }
        
        .status-reviewed {
            color: #28a745;
            font-weight: bold;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #8e2de2, #4a00e0);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 36px;
            font-weight: bold;
        }
        
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .modal-overlay {
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
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #555;
        }
        
        .form-control {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }
        
        .form-row {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .form-col {
            flex: 1;
        }
        
        .review-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 10px;
        }
        
        .info-label {
            width: 120px;
            font-weight: 500;
            color: #555;
        }
        
        .info-value {
            flex: 1;
            color: #333;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 30px;
            padding: 20px;
        }
        
        .empty-state {
            text-align: center;
            padding: 50px 20px;
            color: #6c757d;
        }
        
        .empty-state-icon {
            font-size: 60px;
            margin-bottom: 20px;
            opacity: 0.5;
        }
        
        .score-input {
            width: 80px;
            text-align: center;
        }
        
        .rating-stars {
            display: flex;
            gap: 5px;
            font-size: 20px;
        }
        
        .star {
            color: #ddd;
            cursor: pointer;
        }
        
        .star.filled {
            color: #ffc107;
        }
        
        .progress-bar {
            height: 10px;
            background: #e9ecef;
            border-radius: 5px;
            overflow: hidden;
            margin-top: 5px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #8e2de2, #4a00e0);
            border-radius: 5px;
        }
    </style>
    <link rel="stylesheet" href="../Content/havvk-theme.css" />
    </head>
<body>
    <form id="form1" runat="server">
        <asp:ScriptManager ID="ScriptManager1" runat="server"></asp:ScriptManager>
        
        <div class="header">
            <div class="container">
                <div class="header-content">
                    <h1>绩效考核</h1>
                    <div>
                        <a href="WebForm4.aspx" class="back-btn">返回主管门户</a>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="container">
            <div class="main-content">
                <h2 class="section-title">⭐ 绩效考核管理</h2>
                
                <asp:UpdatePanel ID="upMain" runat="server" UpdateMode="Conditional">
                    <ContentTemplate>
                        <!-- 筛选栏 -->
                        <div class="filter-bar">
                            <div class="filter-item">
                                <label>考核状态</label>
                                <asp:DropDownList ID="ddlStatus" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlStatus_SelectedIndexChanged">
                                    <asp:ListItem Value="">全部状态</asp:ListItem>
                                    <asp:ListItem Value="待提交">待提交</asp:ListItem>
                                    <asp:ListItem Value="已提交">已提交</asp:ListItem>
                                    <asp:ListItem Value="已审核">已审核</asp:ListItem>
                                </asp:DropDownList>
                            </div>
                            
                            <div class="filter-item">
                                <label>考核周期</label>
                                <asp:DropDownList ID="ddlReviewPeriod" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlReviewPeriod_SelectedIndexChanged">
                                    <asp:ListItem Value="">全部周期</asp:ListItem>
                                    <asp:ListItem Value="2023-Q1">2023年第一季度</asp:ListItem>
                                    <asp:ListItem Value="2023-Q2">2023年第二季度</asp:ListItem>
                                    <asp:ListItem Value="2023-Q3">2023年第三季度</asp:ListItem>
                                    <asp:ListItem Value="2023-Q4">2023年第四季度</asp:ListItem>
                                    <asp:ListItem Value="2024-Q1">2024年第一季度</asp:ListItem>
                                </asp:DropDownList>
                            </div>
                            
                            <div class="filter-item">
                                <label>绩效等级</label>
                                <asp:DropDownList ID="ddlPerformanceLevel" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlPerformanceLevel_SelectedIndexChanged">
                                    <asp:ListItem Value="">全部等级</asp:ListItem>
                                    <asp:ListItem Value="优秀">优秀</asp:ListItem>
                                    <asp:ListItem Value="良好">良好</asp:ListItem>
                                    <asp:ListItem Value="一般">一般</asp:ListItem>
                                    <asp:ListItem Value="待改进">待改进</asp:ListItem>
                                </asp:DropDownList>
                            </div>
                            
                            <div class="filter-item">
                                <label>搜索员工</label>
                                <asp:TextBox ID="txtSearch" runat="server" CssClass="form-control" placeholder="员工姓名或工号"></asp:TextBox>
                            </div>
                            
                            <asp:Button ID="btnSearch" runat="server" Text="搜索" CssClass="search-btn" OnClick="btnSearch_Click" />
                            <asp:Button ID="btnReset" runat="server" Text="重置" CssClass="search-btn" OnClick="btnReset_Click" />
                        </div>
                        
                        <!-- 统计卡片 -->
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value" id="pendingCount" runat="server">0</div>
                                <div class="stat-label">待考核</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="submittedCount" runat="server">0</div>
                                <div class="stat-label">已提交</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="reviewedCount" runat="server">0</div>
                                <div class="stat-label">已审核</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="avgScore" runat="server">0.0</div>
                                <div class="stat-label">平均分</div>
                            </div>
                        </div>
                        
                        <!-- 操作按钮 -->
                        <div class="action-buttons" style="margin-bottom: 20px;">
                            <asp:Button ID="btnNewReview" runat="server" Text="新增考核" 
                                CssClass="btn btn-primary" OnClick="btnNewReview_Click" />
                            <asp:Button ID="btnExport" runat="server" Text="导出报表" CssClass="btn btn-success" OnClick="btnExport_Click" />
                            <asp:Button ID="btnPrint" runat="server" Text="打印" CssClass="btn btn-warning" OnClick="btnPrint_Click" />
                        </div>
                        
                        <!-- 考核列表 -->
                        <div class="table-container">
                            <asp:GridView ID="gvPerformanceReviews" runat="server"
                                CssClass="performance-table"
                                AutoGenerateColumns="False"
                                DataKeyNames="ReviewID"
                                OnRowCommand="gvPerformanceReviews_RowCommand"
                                AllowPaging="True"
                                PageSize="15"
                                OnPageIndexChanging="gvPerformanceReviews_PageIndexChanging"
                                GridLines="None">
                                <Columns>
                                    <asp:BoundField DataField="EmployeeID" HeaderText="工号" />
                                    <asp:BoundField DataField="EmployeeName" HeaderText="姓名" />
                                    <asp:BoundField DataField="Department" HeaderText="部门" />
                                    <asp:BoundField DataField="ReviewPeriod" HeaderText="考核周期" />
                                    <asp:TemplateField HeaderText="绩效分数">
                                        <ItemTemplate>
                                            <span class='<%# GetScoreClassFromFrontend(Eval("PerformanceScore")) %>'>
                                                <%# Eval("PerformanceScore") %>
                                            </span>
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                    <asp:BoundField DataField="KPICompletion" HeaderText="KPI完成率" DataFormatString="{0}%" />
                                    <asp:BoundField DataField="WorkQuality" HeaderText="工作质量" />
                                    <asp:BoundField DataField="TeamworkScore" HeaderText="团队合作" />
                                    <asp:TemplateField HeaderText="状态">
                                        <ItemTemplate>
                                            <span class='<%# "status-" + Eval("Status").ToString().ToLower() %>'>
                                                <%# Eval("Status") %>
                                            </span>
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                    <asp:BoundField DataField="ReviewDate" HeaderText="考核日期" DataFormatString="{0:yyyy-MM-dd}" />
                                    <asp:TemplateField HeaderText="操作">
                                        <ItemTemplate>
                                            <asp:LinkButton ID="btnView" runat="server" Text="查看"
                                                CommandName="View"
                                                CommandArgument='<%# Eval("ReviewID") %>'
                                                CssClass="btn btn-info" />
                                            
                                            <asp:LinkButton ID="btnEdit" runat="server" Text="编辑"
                                                CommandName="Edit"
                                                CommandArgument='<%# Eval("ReviewID") %>'
                                                CssClass="btn btn-warning"
                                                Visible='<%# Eval("Status").ToString() == "待提交" %>' />
                                            
                                            <asp:LinkButton ID="btnSubmit" runat="server" Text="提交"
                                                CommandName="Submit"
                                                CommandArgument='<%# Eval("ReviewID") %>'
                                                CssClass="btn btn-success"
                                                Visible='<%# Eval("Status").ToString() == "待提交" %>'
                                                OnClientClick="return confirm('确定提交该绩效考核吗？提交后不可修改')" />
                                            
                                            <asp:LinkButton ID="btnDelete" runat="server" Text="删除"
                                                CommandName="Delete"
                                                CommandArgument='<%# Eval("ReviewID") %>'
                                                CssClass="btn btn-danger"
                                                OnClientClick="return confirm('确定删除该绩效考核记录吗？')" />
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                </Columns>
                                <PagerSettings Mode="NumericFirstLast" />
                                <PagerStyle CssClass="pagination" HorizontalAlign="Center" />
                                <EmptyDataTemplate>
                                    <div class="empty-state">
                                        <div class="empty-state-icon">📊</div>
                                        <h3>暂无考核记录</h3>
                                        <p>当前没有找到符合条件的绩效考核记录</p>
                                    </div>
                                </EmptyDataTemplate>
                            </asp:GridView>
                        </div>
                        
                        <div class="pagination">
                            <asp:Label ID="lblTotal" runat="server" Text=""></asp:Label>
                        </div>
                    </ContentTemplate>
                    <Triggers>
                        <asp:AsyncPostBackTrigger ControlID="ddlStatus" EventName="SelectedIndexChanged" />
                        <asp:AsyncPostBackTrigger ControlID="ddlReviewPeriod" EventName="SelectedIndexChanged" />
                        <asp:AsyncPostBackTrigger ControlID="ddlPerformanceLevel" EventName="SelectedIndexChanged" />
                        <asp:AsyncPostBackTrigger ControlID="btnSearch" EventName="Click" />
                        <asp:AsyncPostBackTrigger ControlID="btnReset" EventName="Click" />
                        <asp:AsyncPostBackTrigger ControlID="gvPerformanceReviews" EventName="PageIndexChanging" />
                        <asp:AsyncPostBackTrigger ControlID="gvPerformanceReviews" EventName="RowCommand" />
                        <asp:AsyncPostBackTrigger ControlID="btnNewReview" EventName="Click" />
                        <asp:PostBackTrigger ControlID="btnExport" />
                        <asp:PostBackTrigger ControlID="btnPrint" />
                    </Triggers>
                </asp:UpdatePanel>
            </div>
        </div>
        
        <!-- 查看详情模态框 -->
        <asp:UpdatePanel ID="upDetailModal" runat="server" UpdateMode="Conditional">
            <ContentTemplate>
                <div id="detailModal" class="modal-overlay">
                    <div class="modal-content">
                        <h3 style="color: #2c3e50; margin-bottom: 25px;">绩效考核详情</h3>
                        
                        <div class="review-info">
                            <div class="info-row">
                                <div class="info-label">员工信息：</div>
                                <div class="info-value" id="detailEmployeeInfo" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">考核周期：</div>
                                <div class="info-value" id="detailReviewPeriod" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">考核日期：</div>
                                <div class="info-value" id="detailReviewDate" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">考核状态：</div>
                                <div class="info-value">
                                    <span id="detailStatus" runat="server"></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-col">
                                <div class="form-group">
                                    <label>绩效分数</label>
                                    <asp:TextBox ID="txtDetailScore" runat="server" CssClass="form-control" ReadOnly="true"></asp:TextBox>
                                </div>
                                
                                <div class="form-group">
                                    <label>KPI完成率</label>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <asp:TextBox ID="txtDetailKPI" runat="server" CssClass="form-control" ReadOnly="true" style="width: 100px;"></asp:TextBox>
                                        <span>%</span>
                                        <div style="flex: 1;">
                                            <div class="progress-bar">
                                                <div class="progress-fill" id="kpiProgressBar"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-col">
                                <div class="form-group">
                                    <label>工作质量</label>
                                    <asp:TextBox ID="txtDetailWorkQuality" runat="server" CssClass="form-control" ReadOnly="true"></asp:TextBox>
                                </div>
                                
                                <div class="form-group">
                                    <label>团队合作评分</label>
                                    <asp:TextBox ID="txtDetailTeamwork" runat="server" CssClass="form-control" ReadOnly="true"></asp:TextBox>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>考核评语</label>
                            <asp:TextBox ID="txtDetailComments" runat="server" CssClass="form-control" TextMode="MultiLine" Rows="4" ReadOnly="true"></asp:TextBox>
                        </div>
                        
                        <div class="form-group" id="reviewerInfo" runat="server" visible="false">
                            <label>考核人信息</label>
                            <div class="info-row">
                                <div class="info-label">考核人：</div>
                                <div class="info-value" id="detailReviewer" runat="server"></div>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-top: 30px;">
                            <button type="button" class="btn btn-secondary" onclick="closeDetailModal()">关闭</button>
                        </div>
                    </div>
                </div>
            </ContentTemplate>
        </asp:UpdatePanel>
        
        <!-- 新增/编辑考核模态框 -->
        <asp:UpdatePanel ID="upEditModal" runat="server" UpdateMode="Conditional">
            <ContentTemplate>
                <div id="editModal" class="modal-overlay">
                    <div class="modal-content">
                        <h3 style="color: #2c3e50; margin-bottom: 25px;" id="editModalTitle" runat="server">新增绩效考核</h3>
                        
                        <asp:HiddenField ID="hdnEditReviewID" runat="server" />
                        
                        <div class="form-row">
                            <div class="form-col">
                                <div class="form-group">
                                    <label>选择员工 *</label>
                                    <asp:DropDownList ID="ddlEmployee" runat="server" CssClass="form-control">
                                    </asp:DropDownList>
                                    <asp:RequiredFieldValidator ID="rfvEmployee" runat="server" 
                                        ControlToValidate="ddlEmployee" 
                                        ErrorMessage="请选择员工" 
                                        Display="Dynamic" 
                                        ForeColor="Red" InitialValue=""></asp:RequiredFieldValidator>
                                </div>
                                
                                <div class="form-group">
                                    <label>考核周期 *</label>
                                    <asp:DropDownList ID="ddlModalReviewPeriod" runat="server" CssClass="form-control">
                                        <asp:ListItem Value="">请选择考核周期</asp:ListItem>
                                        <asp:ListItem Value="2023-Q1">2023年第一季度</asp:ListItem>
                                        <asp:ListItem Value="2023-Q2">2023年第二季度</asp:ListItem>
                                        <asp:ListItem Value="2023-Q3">2023年第三季度</asp:ListItem>
                                        <asp:ListItem Value="2023-Q4">2023年第四季度</asp:ListItem>
                                        <asp:ListItem Value="2024-Q1">2024年第一季度</asp:ListItem>
                                    </asp:DropDownList>
                                    <asp:RequiredFieldValidator ID="rfvReviewPeriod" runat="server" 
                                        ControlToValidate="ddlModalReviewPeriod" 
                                        ErrorMessage="请选择考核周期" 
                                        Display="Dynamic" 
                                        ForeColor="Red" InitialValue=""></asp:RequiredFieldValidator>
                                </div>
                                
                                <div class="form-group">
                                    <label>绩效分数 (0-100) *</label>
                                    <asp:TextBox ID="txtPerformanceScore" runat="server" CssClass="form-control score-input" 
                                        TextMode="Number" min="0" max="100" step="0.1"></asp:TextBox>
                                    <asp:RequiredFieldValidator ID="rfvScore" runat="server" 
                                        ControlToValidate="txtPerformanceScore" 
                                        ErrorMessage="请输入绩效分数" 
                                        Display="Dynamic" 
                                        ForeColor="Red"></asp:RequiredFieldValidator>
                                    <asp:RangeValidator ID="rvScore" runat="server" 
                                        ControlToValidate="txtPerformanceScore" 
                                        MinimumValue="0" 
                                        MaximumValue="100" 
                                        Type="Double"
                                        ErrorMessage="分数必须在0-100之间" 
                                        Display="Dynamic" 
                                        ForeColor="Red"></asp:RangeValidator>
                                </div>
                            </div>
                            
                            <div class="form-col">
                                <div class="form-group">
                                    <label>KPI完成率 (0-100) *</label>
                                    <asp:TextBox ID="txtKPICompletion" runat="server" CssClass="form-control score-input" 
                                        TextMode="Number" min="0" max="100"></asp:TextBox>
                                    <asp:RequiredFieldValidator ID="rfvKPI" runat="server" 
                                        ControlToValidate="txtKPICompletion" 
                                        ErrorMessage="请输入KPI完成率" 
                                        Display="Dynamic" 
                                        ForeColor="Red"></asp:RequiredFieldValidator>
                                    <asp:RangeValidator ID="rvKPI" runat="server" 
                                        ControlToValidate="txtKPICompletion" 
                                        MinimumValue="0" 
                                        MaximumValue="100" 
                                        Type="Integer"
                                        ErrorMessage="KPI完成率必须在0-100之间" 
                                        Display="Dynamic" 
                                        ForeColor="Red"></asp:RangeValidator>
                                </div>
                                
                                <div class="form-group">
                                    <label>工作质量 *</label>
                                    <asp:DropDownList ID="ddlWorkQuality" runat="server" CssClass="form-control">
                                        <asp:ListItem Value="">请选择工作质量</asp:ListItem>
                                        <asp:ListItem Value="优秀">优秀</asp:ListItem>
                                        <asp:ListItem Value="良好">良好</asp:ListItem>
                                        <asp:ListItem Value="一般">一般</asp:ListItem>
                                        <asp:ListItem Value="待改进">待改进</asp:ListItem>
                                    </asp:DropDownList>
                                    <asp:RequiredFieldValidator ID="rfvWorkQuality" runat="server" 
                                        ControlToValidate="ddlWorkQuality" 
                                        ErrorMessage="请选择工作质量" 
                                        Display="Dynamic" 
                                        ForeColor="Red" InitialValue=""></asp:RequiredFieldValidator>
                                </div>
                                
                                <div class="form-group">
                                    <label>团队合作评分 (1-5) *</label>
                                    <asp:TextBox ID="txtTeamworkScore" runat="server" CssClass="form-control score-input" 
                                        TextMode="Number" min="1" max="5"></asp:TextBox>
                                    <asp:RequiredFieldValidator ID="rfvTeamwork" runat="server" 
                                        ControlToValidate="txtTeamworkScore" 
                                        ErrorMessage="请输入团队合作评分" 
                                        Display="Dynamic" 
                                        ForeColor="Red"></asp:RequiredFieldValidator>
                                    <asp:RangeValidator ID="rvTeamwork" runat="server" 
                                        ControlToValidate="txtTeamworkScore" 
                                        MinimumValue="1" 
                                        MaximumValue="5" 
                                        Type="Integer"
                                        ErrorMessage="团队合作评分必须在1-5之间" 
                                        Display="Dynamic" 
                                        ForeColor="Red"></asp:RangeValidator>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>考核评语 *</label>
                            <asp:TextBox ID="txtReviewComments" runat="server" CssClass="form-control" 
                                TextMode="MultiLine" Rows="4" placeholder="请输入对员工的考核评语..."></asp:TextBox>
                            <asp:RequiredFieldValidator ID="rfvComments" runat="server" 
                                ControlToValidate="txtReviewComments" 
                                ErrorMessage="请输入考核评语" 
                                Display="Dynamic" 
                                ForeColor="Red"></asp:RequiredFieldValidator>
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-top: 30px;">
                            <asp:Button ID="btnSaveReview" runat="server" Text="保存考核" CssClass="btn btn-primary" OnClick="btnSaveReview_Click" />
                            <button type="button" class="btn btn-secondary" onclick="closeEditModal()">取消</button>
                        </div>
                    </div>
                </div>
            </ContentTemplate>
        </asp:UpdatePanel>
    </form>
    
    <script>
        // 显示详情模态框
        function showDetailModal() {
            document.getElementById('detailModal').style.display = 'flex';
        }
        
        // 关闭详情模态框
        function closeDetailModal() {
            document.getElementById('detailModal').style.display = 'none';
        }
        
        // 显示编辑考核模态框
        function showEditModal() {
            document.getElementById('editModal').style.display = 'flex';
        }
        
        // 关闭编辑考核模态框
        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
        }
        
        // 更新KPI进度条
        function updateKPIProgress() {
            const kpiValue = document.getElementById('<%= txtDetailKPI.ClientID %>').value;
            if (kpiValue) {
                const progressBar = document.getElementById('kpiProgressBar');
                if (progressBar) {
                    progressBar.style.width = kpiValue + '%';
                }
            }
        }

        // 页面加载完成后绑定事件
        document.addEventListener('DOMContentLoaded', function () {
            // 点击模态框外部关闭
            const detailModal = document.getElementById('detailModal');
            const editModal = document.getElementById('editModal');

            if (detailModal) {
                detailModal.addEventListener('click', function (e) {
                    if (e.target === this) {
                        closeDetailModal();
                    }
                });
            }

            if (editModal) {
                editModal.addEventListener('click', function (e) {
                    if (e.target === this) {
                        closeEditModal();
                    }
                });
            }

            // 初始化KPI进度条
            updateKPIProgress();
        });
    </script>
</body>
</html>