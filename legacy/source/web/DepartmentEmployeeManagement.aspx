<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="DepartmentEmployeeManagement.aspx.cs" 
    Inherits="WebApplication1.DepartmentEmployeeManagement" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>部门员工管理 - 哈夫克集团</title>
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
        
        .action-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .btn {
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
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
        
        .employee-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .employee-table th,
        .employee-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .employee-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
            position: sticky;
            top: 0;
        }
        
        .employee-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        .table-container {
            max-height: 500px;
            overflow-y: auto;
            border: 1px solid #eee;
            border-radius: 8px;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 30px;
            padding: 20px;
        }
        
        /* 模态框样式 */
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
        
        .error-message {
            color: #dc3545;
            font-size: 12px;
            margin-top: 5px;
        }
        
        .form-control.error {
            border-color: #dc3545;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
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
        
        /* UpdatePanel加载样式 */
        .update-progress {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255,255,255,0.9);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 2000;
            display: none;
        }
        
        .update-progress.active {
            display: block;
        }
        
        .btn-cancel {
            background: #6c757d;
            color: white;
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }
    </style>
    <link rel="stylesheet" href="../Content/havvk-theme.css" />
    </head>
<body>
    <form id="form1" runat="server">
        <asp:ScriptManager ID="ScriptManager1" runat="server"></asp:ScriptManager>
        
        <!-- UpdatePanel加载进度 -->
        <div class="update-progress" id="updateProgress">
            <div style="text-align: center;">
                <div style="font-size: 20px; margin-bottom: 10px; color: #8e2de2;">加载中...</div>
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #8e2de2; border-radius: 50%; margin: 0 auto; animation: spin 1s linear infinite;"></div>
            </div>
        </div>
        
        <div class="header">
            <div class="container">
                <div class="header-content">
                    <h1>部门员工管理</h1>
                    <div>
                        <a href="WebForm4.aspx" class="back-btn">返回主管门户</a>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="container">
            <div class="main-content">
                <h2 class="section-title">👥 部门员工管理</h2>
                
                <asp:UpdatePanel ID="upMain" runat="server" UpdateMode="Conditional">
                    <ContentTemplate>
                        <!-- 部门统计 -->
                        <div class="stats-grid" id="departmentStats" runat="server">
                            <!-- 动态加载 -->
                        </div>
                        
                        <!-- 筛选栏 -->
                        <div class="filter-bar">
                            <div class="filter-item">
                                <label>性别筛选</label>
                                <asp:DropDownList ID="ddlGenderFilter" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlGenderFilter_SelectedIndexChanged">
                                    <asp:ListItem Value="">全部性别</asp:ListItem>
                                    <asp:ListItem Value="男">男</asp:ListItem>
                                    <asp:ListItem Value="女">女</asp:ListItem>
                                </asp:DropDownList>
                            </div>
                            
                            <div class="filter-item">
                                <label>搜索员工</label>
                                <asp:TextBox ID="txtSearch" runat="server" placeholder="输入姓名或工号" CssClass="form-control"></asp:TextBox>
                            </div>
                            
                            <asp:Button ID="btnSearch" runat="server" Text="搜索" CssClass="search-btn" OnClick="btnSearch_Click" />
                            <asp:Button ID="btnReset" runat="server" Text="重置" CssClass="search-btn" OnClick="btnReset_Click" />
                        </div>
                        
                        <!-- 操作按钮 -->
                        <div class="action-buttons">
                            <button type="button" id="btnAddNew" class="btn btn-primary" onclick="showAddModal()">新增员工</button>
                            <asp:Button ID="btnExport" runat="server" Text="导出Excel" CssClass="btn btn-success" OnClick="btnExport_Click" />
                            <asp:Button ID="btnPrint" runat="server" Text="打印列表" CssClass="btn btn-warning" OnClick="btnPrint_Click" />
                        </div>
                        
                        <!-- 员工表格 -->
                        <div class="table-container">
                            <asp:GridView ID="gvEmployees" runat="server" 
                                CssClass="employee-table" 
                                AutoGenerateColumns="False"
                                DataKeyNames="EmployeeID"
                                OnRowCommand="gvEmployees_RowCommand"
                                AllowPaging="True" 
                                PageSize="15"
                                OnPageIndexChanging="gvEmployees_PageIndexChanging"
                                GridLines="None">
                                <Columns>
                                    <asp:BoundField DataField="EmployeeID" HeaderText="工号" />
                                    <asp:BoundField DataField="EmployeeName" HeaderText="姓名" />
                                    <asp:BoundField DataField="Gender" HeaderText="性别" />
                                    <asp:BoundField DataField="Age" HeaderText="年龄" />
                                    <asp:BoundField DataField="Department" HeaderText="部门" />
                                    <asp:BoundField DataField="PhoneNumber" HeaderText="电话" />
                                    <asp:BoundField DataField="Email" HeaderText="邮箱" />
                                    <asp:BoundField DataField="PermissionLevel" HeaderText="权限等级" />
                                    <asp:BoundField DataField="LastLogin" HeaderText="最后登录" DataFormatString="{0:yyyy-MM-dd HH:mm}" />
                                    <asp:TemplateField HeaderText="状态">
                                        <ItemTemplate>
                                            <span style='color: <%# (bool)Eval("IsActive") ? "#28a745" : "#dc3545" %>; font-weight: bold;'>
                                                <%# (bool)Eval("IsActive") ? "激活" : "禁用" %>
                                            </span>
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                    <asp:TemplateField HeaderText="操作">
                                        <ItemTemplate>
                                            <asp:LinkButton ID="btnEdit" runat="server" Text="编辑" 
                                                CommandName="EditRow" 
                                                CommandArgument='<%# Eval("EmployeeID") %>'
                                                CssClass="btn btn-warning" />
                                            <asp:LinkButton ID="btnDelete" runat="server" Text="删除" 
                                                CommandName="DeleteRow" 
                                                CommandArgument='<%# Eval("EmployeeID") %>'
                                                CssClass="btn btn-danger" 
                                                OnClientClick="return confirm('确定删除该员工吗？')" />
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                </Columns>
                                <PagerSettings Mode="NumericFirstLast" />
                                <PagerStyle CssClass="pagination" HorizontalAlign="Center" />
                                <EmptyDataTemplate>
                                    <div style="text-align:center; padding: 20px;">
                                        没有找到员工数据
                                    </div>
                                </EmptyDataTemplate>
                            </asp:GridView>
                        </div>
                        
                        <div class="pagination">
                            <asp:Label ID="lblTotal" runat="server" Text=""></asp:Label>
                        </div>
                    </ContentTemplate>
                        <Triggers>
                            <asp:AsyncPostBackTrigger ControlID="ddlGenderFilter" EventName="SelectedIndexChanged" />
                            <asp:AsyncPostBackTrigger ControlID="btnSearch" EventName="Click" />
                            <asp:AsyncPostBackTrigger ControlID="btnReset" EventName="Click" />
                            <asp:AsyncPostBackTrigger ControlID="gvEmployees" EventName="PageIndexChanging" />
                            <asp:AsyncPostBackTrigger ControlID="gvEmployees" EventName="RowCommand" />
                            <asp:AsyncPostBackTrigger ControlID="btnSave" EventName="Click" />
                            <asp:PostBackTrigger ControlID="btnExport" />
                            <asp:PostBackTrigger ControlID="btnPrint" />
                        </Triggers>
                </asp:UpdatePanel>
            </div>
        </div>
        
        <!-- 添加/编辑员工模态框 -->
        <asp:UpdatePanel ID="upModal" runat="server" UpdateMode="Conditional">
            <ContentTemplate>
                <div id="employeeModal" class="modal-overlay">
                    <div class="modal-content">
                        <h3 style="color: #2c3e50; margin-bottom: 25px;" id="modalTitle">添加新员工</h3>
                        
                        <div class="form-row">
                            <div class="form-col">
                                <div class="form-group">
                                    <label>工号 *</label>
                                    <asp:TextBox ID="txtEmployeeID" runat="server" CssClass="form-control"></asp:TextBox>
                                    <div id="errorEmployeeID" class="error-message"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label>姓名 *</label>
                                    <asp:TextBox ID="txtEmployeeName" runat="server" CssClass="form-control"></asp:TextBox>
                                    <div id="errorEmployeeName" class="error-message"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label>性别</label>
                                    <asp:DropDownList ID="ddlGenderModal" runat="server" CssClass="form-control">
                                        <asp:ListItem Value="男">男</asp:ListItem>
                                        <asp:ListItem Value="女">女</asp:ListItem>
                                    </asp:DropDownList>
                                </div>
                                
                                <div class="form-group">
                                    <label>年龄</label>
                                    <asp:TextBox ID="txtAge" runat="server" CssClass="form-control" TextMode="Number" min="18" max="65"></asp:TextBox>
                                    <div id="errorAge" class="error-message"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label>部门</label>
                                    <asp:DropDownList ID="ddlDepartment" runat="server" CssClass="form-control">
                                        <asp:ListItem Value="策划部">策划部</asp:ListItem>
                                        <asp:ListItem Value="技术部">技术部</asp:ListItem>
                                        <asp:ListItem Value="市场部">市场部</asp:ListItem>
                                        <asp:ListItem Value="财务部">财务部</asp:ListItem>
                                        <asp:ListItem Value="董事会">董事会</asp:ListItem>
                                        <asp:ListItem Value="信息技术支持部">信息技术支持部</asp:ListItem>
                                    </asp:DropDownList>
                                </div>
                            </div>
                            
                            <div class="form-col">
                                <div class="form-group">
                                    <label>权限等级 *</label>
                                    <asp:DropDownList ID="ddlPermissionLevel" runat="server" CssClass="form-control">
                                        <asp:ListItem Value="1">普通员工</asp:ListItem>
                                        <asp:ListItem Value="2">部门主管</asp:ListItem>
                                        <asp:ListItem Value="3">管理员</asp:ListItem>
                                    </asp:DropDownList>
                                </div>
                                
                                <div class="form-group">
                                    <label>电话号码</label>
                                    <asp:TextBox ID="txtPhoneNumber" runat="server" CssClass="form-control"></asp:TextBox>
                                    <div id="errorPhone" class="error-message"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label>邮箱</label>
                                    <asp:TextBox ID="txtEmail" runat="server" CssClass="form-control" TextMode="Email"></asp:TextBox>
                                    <div id="errorEmail" class="error-message"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label>状态</label>
                                    <asp:DropDownList ID="ddlIsActive" runat="server" CssClass="form-control">
                                        <asp:ListItem Value="True">激活</asp:ListItem>
                                        <asp:ListItem Value="False">禁用</asp:ListItem>
                                    </asp:DropDownList>
                                </div>
                                
                                <div class="form-group">
                                    <label>备注</label>
                                    <asp:TextBox ID="txtRemarks" runat="server" CssClass="form-control" TextMode="MultiLine" Rows="3"></asp:TextBox>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group" id="passwordGroup">
                            <label>密码 (新增员工时必填)</label>
                            <asp:TextBox ID="txtPassword" runat="server" CssClass="form-control" TextMode="Password"></asp:TextBox>
                            <div id="errorPassword" class="error-message"></div>
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-top: 30px;">
                            <asp:Button ID="btnSave" runat="server" Text="保存" CssClass="btn btn-primary" OnClientClick="if(!validateForm()) return false;" OnClick="btnSave_Click" />
                            <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                        </div>
                    </div>
                </div>
            </ContentTemplate>
            <Triggers>
                <asp:AsyncPostBackTrigger ControlID="btnSave" EventName="Click" />
            </Triggers>
        </asp:UpdatePanel>
        
        <!-- 隐藏字段用于存储编辑的EmployeeID -->
        <asp:HiddenField ID="hdnEditEmployeeID" runat="server" />
        <asp:HiddenField ID="hdnIsEditMode" runat="server" Value="false" />
    </form>
    
    <script>
        // 显示UpdatePanel加载进度
        var prm = Sys.WebForms.PageRequestManager.getInstance();
        prm.add_beginRequest(function (sender, args) {
            document.getElementById('updateProgress').classList.add('active');
        });

        prm.add_endRequest(function (sender, args) {
            document.getElementById('updateProgress').classList.remove('active');

            // 如果有错误，重新显示模态框
            if (args.get_error() != undefined) {
                showLastModal();
            }
        });

        // 记录最后一次显示的模态框类型
        var lastModalType = ''; // 'add' 或 'edit'
        var lastEmployeeId = '';

        // 显示添加员工模态框
        // 显示添加员工模态框
        function showAddModal() {
            lastModalType = 'add';
            document.getElementById('employeeModal').style.display = 'flex';
            document.getElementById('modalTitle').textContent = '添加新员工';
            document.getElementById('<%= hdnEditEmployeeID.ClientID %>').value = '';
            document.getElementById('<%= hdnIsEditMode.ClientID %>').value = 'false';

            // 清空表单和错误信息
            clearForm();
            clearErrors();

            // 显示密码字段（新增时需要）
            document.getElementById('<%= txtPassword.ClientID %>').style.display = 'block';
            document.getElementById('passwordGroup').style.display = 'block';

            // 确保所有必填字段都是空的
            document.getElementById('<%= txtEmployeeID.ClientID %>').value = '';
            document.getElementById('<%= txtEmployeeName.ClientID %>').value = '';
            document.getElementById('<%= ddlGenderModal.ClientID %>').selectedIndex = 0;
            document.getElementById('<%= ddlDepartment.ClientID %>').selectedIndex = 0;
            document.getElementById('<%= ddlPermissionLevel.ClientID %>').selectedIndex = 0;
            document.getElementById('<%= ddlIsActive.ClientID %>').selectedIndex = 0;
        }

        // 显示编辑员工模态框
        function showEditModal(employeeId) {
            lastModalType = 'edit';
            lastEmployeeId = employeeId;

            // 通过服务器端处理
            __doPostBack('<%= upModal.ClientID %>', 'Edit:' + employeeId);
        }

        // 重新显示最后的模态框（在UpdatePanel刷新后）
        function showLastModal() {
            if (lastModalType === 'add') {
                showAddModal();
            } else if (lastModalType === 'edit' && lastEmployeeId) {
                showEditModal(lastEmployeeId);
            }
        }

        // 关闭模态框
        function closeModal() {
            document.getElementById('employeeModal').style.display = 'none';
            lastModalType = '';
            lastEmployeeId = '';
            return false;
        }

        // 清空表单
        function clearForm() {
            document.getElementById('<%= txtEmployeeID.ClientID %>').value = '';
            document.getElementById('<%= txtEmployeeName.ClientID %>').value = '';
            document.getElementById('<%= ddlGenderModal.ClientID %>').selectedIndex = 0;
            document.getElementById('<%= txtAge.ClientID %>').value = '';
            document.getElementById('<%= ddlDepartment.ClientID %>').selectedIndex = 0;
            document.getElementById('<%= ddlPermissionLevel.ClientID %>').selectedIndex = 0;
            document.getElementById('<%= txtPhoneNumber.ClientID %>').value = '';
            document.getElementById('<%= txtEmail.ClientID %>').value = '';
            document.getElementById('<%= ddlIsActive.ClientID %>').selectedIndex = 0;
            document.getElementById('<%= txtRemarks.ClientID %>').value = '';
            document.getElementById('<%= txtPassword.ClientID %>').value = '';
        }
        
        // 清空错误信息
        function clearErrors() {
            const errorElements = document.querySelectorAll('.error-message');
            errorElements.forEach(el => el.textContent = '');
            
            const errorInputs = document.querySelectorAll('.form-control.error');
            errorInputs.forEach(el => el.classList.remove('error'));
        }
        
        // 客户端验证
        function validateForm() {
            let isValid = true;
            clearErrors();
            
            // 验证工号
            const employeeId = document.getElementById('<%= txtEmployeeID.ClientID %>').value.trim();
            if (!employeeId) {
                document.getElementById('errorEmployeeID').textContent = '工号不能为空';
                document.getElementById('<%= txtEmployeeID.ClientID %>').classList.add('error');
                isValid = false;
            }
            
            // 验证姓名
            const employeeName = document.getElementById('<%= txtEmployeeName.ClientID %>').value.trim();
            if (!employeeName) {
                document.getElementById('errorEmployeeName').textContent = '姓名不能为空';
                document.getElementById('<%= txtEmployeeName.ClientID %>').classList.add('error');
                isValid = false;
            }
            
            // 验证年龄
            const age = document.getElementById('<%= txtAge.ClientID %>').value;
            if (age) {
                const ageNum = parseInt(age);
                if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
                    document.getElementById('errorAge').textContent = '年龄必须在18-65之间';
                    document.getElementById('<%= txtAge.ClientID %>').classList.add('error');
                    isValid = false;
                }
            }
            
            // 如果是新增模式，验证密码
            const isEditMode = document.getElementById('<%= hdnIsEditMode.ClientID %>').value === 'false';
            const password = document.getElementById('<%= txtPassword.ClientID %>').value;
            if (isEditMode && !password) {
                document.getElementById('errorPassword').textContent = '新增员工时密码不能为空';
                document.getElementById('<%= txtPassword.ClientID %>').classList.add('error');
                isValid = false;
            }
            
            return isValid;
        }
        
        // 页面加载完成后绑定事件
        document.addEventListener('DOMContentLoaded', function() {
            // 绑定保存按钮的客户端验证
            const btnSave = document.getElementById('<%= btnSave.ClientID %>');
            if (btnSave) {
                btnSave.onclick = function () {
                    if (!validateForm()) {
                        return false;
                    }
                    // 显示加载动画
                    document.getElementById('updateProgress').classList.add('active');
                    return true;
                };
            }

            // 点击模态框外部关闭
            const modal = document.getElementById('employeeModal');
            if (modal) {
                modal.addEventListener('click', function (e) {
                    if (e.target === this) {
                        closeModal();
                    }
                });
            }
        });

        // 旋转动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>