<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="LeaveApproval.aspx.cs" Inherits="WebApplication1.LeaveApproval" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>请假审批 - 哈夫克集团</title>
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
        
        .leave-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .leave-table th,
        .leave-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .leave-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
            position: sticky;
            top: 0;
        }
        
        .status-pending {
            color: #ffc107;
            font-weight: bold;
        }
        
        .status-approved {
            color: #28a745;
            font-weight: bold;
        }
        
        .status-rejected {
            color: #dc3545;
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
        
        .leave-info {
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
            width: 100px;
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
    </style>
    <link rel="stylesheet" href="../Content/havvk-theme.css" />
    </head>
<body>
    <form id="form1" runat="server">
        <asp:ScriptManager ID="ScriptManager1" runat="server"></asp:ScriptManager>
        
        <div class="header">
            <div class="container">
                <div class="header-content">
                    <h1>请假审批</h1>
                    <div>
                        <a href="WebForm4.aspx" class="back-btn">返回主管门户</a>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="container">
            <div class="main-content">
                <h2 class="section-title">📋 请假审批管理</h2>
                
                <asp:UpdatePanel ID="upMain" runat="server" UpdateMode="Conditional">
                    <ContentTemplate>
                        <!-- 筛选栏 -->
                        <div class="filter-bar">
                            <div class="filter-item">
                                <label>审批状态</label>
                                <asp:DropDownList ID="ddlStatus" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlStatus_SelectedIndexChanged">
                                    <asp:ListItem Value="">全部状态</asp:ListItem>
                                    <asp:ListItem Value="待审批">待审批</asp:ListItem>
                                    <asp:ListItem Value="已批准">已批准</asp:ListItem>
                                    <asp:ListItem Value="已拒绝">已拒绝</asp:ListItem>
                                </asp:DropDownList>
                            </div>
                            
                            <div class="filter-item">
                                <label>请假类型</label>
                                <asp:DropDownList ID="ddlLeaveType" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlLeaveType_SelectedIndexChanged">
                                    <asp:ListItem Value="">全部类型</asp:ListItem>
                                    <asp:ListItem Value="事假">事假</asp:ListItem>
                                    <asp:ListItem Value="病假">病假</asp:ListItem>
                                    <asp:ListItem Value="年假">年假</asp:ListItem>
                                    <asp:ListItem Value="产假">产假</asp:ListItem>
                                    <asp:ListItem Value="婚假">婚假</asp:ListItem>
                                    <asp:ListItem Value="其他">其他</asp:ListItem>
                                </asp:DropDownList>
                            </div>
                            
                            <div class="filter-item">
                                <label>时间范围</label>
                                <asp:TextBox ID="txtDateRange" runat="server" CssClass="form-control" TextMode="Date"></asp:TextBox>
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
                                <div class="stat-label">待审批</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="approvedCount" runat="server">0</div>
                                <div class="stat-label">已批准</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="rejectedCount" runat="server">0</div>
                                <div class="stat-label">已拒绝</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="totalCount" runat="server">0</div>
                                <div class="stat-label">总申请数</div>
                            </div>
                        </div>
                        
                        <!-- 请假列表 -->
                        <div class="table-container">
                            <asp:GridView ID="gvLeaveApplications" runat="server"
                                CssClass="leave-table"
                                AutoGenerateColumns="False"
                                DataKeyNames="LeaveID"
                                OnRowCommand="gvLeaveApplications_RowCommand"
                                AllowPaging="True"
                                PageSize="15"
                                OnPageIndexChanging="gvLeaveApplications_PageIndexChanging"
                                GridLines="None">
                                <Columns>
                                    <asp:BoundField DataField="EmployeeID" HeaderText="工号" />
                                    <asp:BoundField DataField="EmployeeName" HeaderText="姓名" />
                                    <asp:BoundField DataField="Department" HeaderText="部门" />
                                    <asp:BoundField DataField="LeaveType" HeaderText="请假类型" />
                                    <asp:BoundField DataField="StartDate" HeaderText="开始时间" DataFormatString="{0:yyyy-MM-dd}" />
                                    <asp:BoundField DataField="EndDate" HeaderText="结束时间" DataFormatString="{0:yyyy-MM-dd}" />
                                    <asp:BoundField DataField="Days" HeaderText="天数" />
                                    <asp:TemplateField HeaderText="状态">
                                        <ItemTemplate>
                                            <span class='<%# "status-" + Eval("Status").ToString().ToLower() %>'>
                                                <%# Eval("Status") %>
                                            </span>
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                    <asp:BoundField DataField="ApplyTime" HeaderText="申请时间" DataFormatString="{0:yyyy-MM-dd HH:mm}" />
                                    <asp:TemplateField HeaderText="操作">
                                        <ItemTemplate>
                                            <asp:LinkButton ID="btnApprove" runat="server" Text="批准"
                                                CommandName="Approve"
                                                CommandArgument='<%# Eval("LeaveID") %>'
                                                CssClass="btn btn-success"
                                                Visible='<%# Eval("Status").ToString() == "待审批" %>'
                                                OnClientClick="return confirm('确定批准该请假申请吗？')" />
                                            
                                            <asp:LinkButton ID="btnReject" runat="server" Text="拒绝"
                                                CommandName="Reject"
                                                CommandArgument='<%# Eval("LeaveID") %>'
                                                CssClass="btn btn-danger"
                                                Visible='<%# Eval("Status").ToString() == "待审批" %>'
                                                OnClientClick="return confirm('确定拒绝该请假申请吗？')" />
                                            
                                            <asp:LinkButton ID="btnView" runat="server" Text="查看"
                                                CommandName="View"
                                                CommandArgument='<%# Eval("LeaveID") %>'
                                                CssClass="btn btn-info" />
                                            
                                            <asp:LinkButton ID="btnEdit" runat="server" Text="编辑"
                                                CommandName="Edit"
                                                CommandArgument='<%# Eval("LeaveID") %>'
                                                CssClass="btn btn-warning"
                                                Visible='<%# Eval("Status").ToString() == "待审批" %>' />
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                </Columns>
                                <PagerSettings Mode="NumericFirstLast" />
                                <PagerStyle CssClass="pagination" HorizontalAlign="Center" />
                                <EmptyDataTemplate>
                                    <div class="empty-state">
                                        <div class="empty-state-icon">📄</div>
                                        <h3>暂无请假申请</h3>
                                        <p>当前没有找到符合条件的请假申请记录</p>
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
                        <asp:AsyncPostBackTrigger ControlID="ddlLeaveType" EventName="SelectedIndexChanged" />
                        <asp:AsyncPostBackTrigger ControlID="btnSearch" EventName="Click" />
                        <asp:AsyncPostBackTrigger ControlID="btnReset" EventName="Click" />
                        <asp:AsyncPostBackTrigger ControlID="gvLeaveApplications" EventName="PageIndexChanging" />
                        <asp:AsyncPostBackTrigger ControlID="gvLeaveApplications" EventName="RowCommand" />
                    </Triggers>
                </asp:UpdatePanel>
            </div>
        </div>
        
        <!-- 请假详情模态框 -->
        <asp:UpdatePanel ID="upModal" runat="server" UpdateMode="Conditional">
            <ContentTemplate>
                <div id="detailModal" class="modal-overlay">
                    <div class="modal-content">
                        <h3 style="color: #2c3e50; margin-bottom: 25px;">请假申请详情</h3>
                        
                        <div class="leave-info">
                            <div class="info-row">
                                <div class="info-label">员工工号：</div>
                                <div class="info-value" id="detailEmployeeID" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">员工姓名：</div>
                                <div class="info-value" id="detailEmployeeName" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">所属部门：</div>
                                <div class="info-value" id="detailDepartment" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">请假类型：</div>
                                <div class="info-value" id="detailLeaveType" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">请假时间：</div>
                                <div class="info-value" id="detailDateRange" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">请假天数：</div>
                                <div class="info-value" id="detailDays" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">当前状态：</div>
                                <div class="info-value">
                                    <span id="detailStatus" runat="server"></span>
                                </div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">申请时间：</div>
                                <div class="info-value" id="detailApplyTime" runat="server"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>请假原因：</label>
                            <asp:TextBox ID="txtDetailReason" runat="server" CssClass="form-control" TextMode="MultiLine" Rows="4" ReadOnly="true"></asp:TextBox>
                        </div>
                        
                        <div class="form-group" id="approvalInfo" runat="server" visible="false">
                            <label>审批信息：</label>
                            <div class="info-row">
                                <div class="info-label">审批人：</div>
                                <div class="info-value" id="detailApprover" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">审批时间：</div>
                                <div class="info-value" id="detailApproveTime" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">审批备注：</div>
                                <div class="info-value" id="detailRemarks" runat="server"></div>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-top: 30px;">
                            <button type="button" class="btn btn-secondary" onclick="closeDetailModal()">关闭</button>
                        </div>
                    </div>
                </div>
            </ContentTemplate>
        </asp:UpdatePanel>
        
        <!-- 编辑/审批模态框 -->
        <asp:UpdatePanel ID="upEditModal" runat="server" UpdateMode="Conditional">
            <ContentTemplate>
                <div id="editModal" class="modal-overlay">
                    <div class="modal-content">
                        <h3 style="color: #2c3e50; margin-bottom: 25px;" id="editModalTitle" runat="server">审批请假申请</h3>
                        
                        <asp:HiddenField ID="hdnEditLeaveID" runat="server" />
                        
                        <div class="leave-info">
                            <div class="info-row">
                                <div class="info-label">员工：</div>
                                <div class="info-value" id="editEmployeeInfo" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">请假时间：</div>
                                <div class="info-value" id="editDateRange" runat="server"></div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">请假类型：</div>
                                <div class="info-value" id="editLeaveType" runat="server"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>请假原因：</label>
                            <asp:TextBox ID="txtEditReason" runat="server" CssClass="form-control" TextMode="MultiLine" Rows="4" ReadOnly="true"></asp:TextBox>
                        </div>
                        
                        <div class="form-group">
                            <label>审批意见 *</label>
                            <asp:TextBox ID="txtApprovalComments" runat="server" CssClass="form-control" TextMode="MultiLine" Rows="3" 
                                placeholder="请输入审批意见（批准或拒绝的原因）"></asp:TextBox>
                            <asp:RequiredFieldValidator ID="rfvComments" runat="server" 
                                ControlToValidate="txtApprovalComments" 
                                ErrorMessage="审批意见不能为空" 
                                Display="Dynamic" 
                                ForeColor="Red"></asp:RequiredFieldValidator>
                        </div>
                        
                        <div class="form-group">
                            <label>处理操作</label>
                            <div style="display: flex; gap: 15px;">
                                <asp:RadioButton ID="rbApprove" runat="server" Text="批准请假" GroupName="ApprovalAction" Checked="true" />
                                <asp:RadioButton ID="rbReject" runat="server" Text="拒绝请假" GroupName="ApprovalAction" />
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-top: 30px;">
                            <asp:Button ID="btnSubmitApproval" runat="server" Text="提交审批" CssClass="btn btn-primary" OnClick="btnSubmitApproval_Click" />
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

        // 显示编辑/审批模态框
        function showEditModal() {
            document.getElementById('editModal').style.display = 'flex';
        }

        // 关闭编辑/审批模态框
        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
        }

        // 点击模态框外部关闭
        document.addEventListener('DOMContentLoaded', function () {
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
        });
    </script>
</body>
</html>