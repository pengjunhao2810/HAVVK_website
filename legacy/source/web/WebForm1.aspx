<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm1.aspx.cs" Inherits="WebApplication1.WebForm1" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <title>哈夫克集团员工管理系统</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
        }
        
        body {
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 20px 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .container {
            width: 90%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 15px;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
        }
        
        .logo h1 {
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 1px;
        }
        
        .logo span {
            background: #e74c3c;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: normal;
        }
        
        .nav-tabs {
            display: flex;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 5px;
            margin-top: 20px;
        }
        
        .nav-tab {
            flex: 1;
            text-align: center;
            padding: 12px;
            cursor: pointer;
            color: rgba(255,255,255,0.8);
            border-radius: 6px;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .nav-tab:hover {
            background: rgba(255,255,255,0.15);
            color: white;
        }
        
        .nav-tab.active {
            background: white;
            color: #2c3e50;
            font-weight: 600;
        }
        
        .content {
            background: white;
            border-radius: 12px;
            margin: 30px 0;
            padding: 30px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }
        
        .section-title {
            font-size: 22px;
            color: #2c3e50;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f3f5;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-title::before {
            font-size: 24px;
        }
        
        .search-box {
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            border: 1px solid #e3e8ef;
        }
        
        .search-row {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 15px;
        }
        
        .form-group {
            flex: 1;
            min-width: 200px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #4a5568;
            font-weight: 500;
        }
        
        .form-control {
            width: 100%;
            padding: 10px 15px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s ease;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #3498db;
        }
        
        .btn {
            padding: 10px 25px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }
        
        .btn-success {
            background: linear-gradient(135deg, #27ae60 0%, #219653 100%);
            color: white;
        }
        
        .btn-warning {
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            color: white;
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
        }
        
        .btn-outline {
            background: transparent;
            border: 2px solid #3498db;
            color: #3498db;
        }
        
        .btn-outline:hover {
            background: #3498db;
            color: white;
        }
        
        .btn-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .query-results {
            margin: 25px 0;
        }
        
        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f3f5;
        }
        
        .results-title {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .results-meta {
            font-size: 14px;
            color: #718096;
        }
        
        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .employee-card {
            background: white;
            border: 1px solid #e3e8ef;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .employee-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.1);
            border-color: #3498db;
        }
        
        .employee-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f0f3f5;
        }
        
        .employee-info {
            flex: 1;
        }
        
        .employee-id {
            font-size: 14px;
            color: #718096;
            margin-bottom: 4px;
        }
        
        .employee-name {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 4px;
        }
        
        .employee-position {
            font-size: 14px;
            color: #3498db;
            font-weight: 500;
        }
        
        .employee-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .employee-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 14px;
        }
        
        .detail-item {
            display: flex;
            flex-direction: column;
        }
        
        .detail-label {
            color: #718096;
            font-size: 13px;
            margin-bottom: 4px;
        }
        
        .detail-value {
            color: #2c3e50;
            font-weight: 500;
        }
        
        .employee-actions {
            display: flex;
            gap: 8px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #f0f3f5;
        }
        
        .employee-actions .btn {
            padding: 6px 12px;
            font-size: 13px;
            flex: 1;
        }
        
        .no-results {
            text-align: center;
            padding: 40px 20px;
            color: #718096;
            background: #f8fafc;
            border-radius: 8px;
            border: 2px dashed #e3e8ef;
        }
        
        .table-container {
            overflow-x: auto;
            border-radius: 10px;
            border: 1px solid #e3e8ef;
            margin-top: 20px;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 800px;
        }
        
        .data-table th {
            background: #f8fafc;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #2c3e50;
            border-bottom: 2px solid #e3e8ef;
        }
        
        .data-table td {
            padding: 15px;
            border-bottom: 1px solid #f0f3f5;
        }
        
        .data-table tr:hover {
            background-color: #f8fafc;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .badge-primary {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        
        .badge-success {
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        
        .badge-warning {
            background-color: #fff3e0;
            color: #ef6c00;
        }
        
        .badge-danger {
            background-color: #ffebee;
            color: #c62828;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 30px;
        }
        
        .page-item {
            padding: 8px 15px;
            border: 1px solid #e3e8ef;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .page-item:hover {
            background-color: #f8fafc;
        }
        
        .page-item.active {
            background-color: #3498db;
            color: white;
            border-color: #3498db;
        }
        
        .footer {
            text-align: center;
            padding: 30px 0;
            color: #718096;
            font-size: 14px;
            border-top: 1px solid #e3e8ef;
            margin-top: 50px;
        }
        
        .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border-left: 4px solid #3498db;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-card .value {
            font-size: 32px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .stat-card.today {
            border-left-color: #27ae60;
        }
        
        .stat-card.inactive {
            border-left-color: #e74c3c;
        }
        
        .stat-card.department {
            border-left-color: #f39c12;
        }
        
        .quick-actions {
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            margin: 30px 0;
            border: 1px solid #e3e8ef;
        }
        
        .action-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .action-btn {
            background: white;
            border: 2px solid #e3e8ef;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .action-btn:hover {
            border-color: #3498db;
            background: #f0f7ff;
            transform: translateY(-3px);
        }
        
        .action-btn i {
            font-size: 24px;
            color: #3498db;
        }
        
        .recent-activity {
            background: white;
            border-radius: 10px;
            padding: 20px;
            border: 1px solid #e3e8ef;
            margin-top: 20px;
        }
        
        .activity-item {
            display: flex;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #f0f3f5;
            gap: 15px;
        }
        
        .activity-item:last-child {
            border-bottom: none;
        }
        
        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e3f2fd;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #3498db;
        }
        
        .section-title.with-action {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .section-title .action-buttons {
            display: flex;
            gap: 10px;
        }
        
        .batch-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e3e8ef;
            margin-top: 20px;
        }
        
        .emp-checkbox {
            transform: scale(1.2);
            cursor: pointer;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            color: #718096;
        }
        
        .loading::after {
            content: '...';
            animation: dots 1.5s steps(4, end) infinite;
        }
        
        @keyframes dots {
            0%, 20% { content: ''; }
            40% { content: '.'; }
            60% { content: '..'; }
            80%, 100% { content: '...'; }
        }
        
        .error-message {
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #e74c3c;
        }
        
        .success-message {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4caf50;
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
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .modal-header {
            padding: 20px 30px;
            border-bottom: 1px solid #e3e8ef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-body {
            padding: 30px;
        }
        
        .close {
            font-size: 24px;
            cursor: pointer;
            color: #718096;
        }
        
        @media (max-width: 768px) {
            .container {
                width: 95%;
            }
            
            .search-row {
                flex-direction: column;
                gap: 15px;
            }
            
            .form-group {
                min-width: 100%;
            }
            
            .btn-group {
                width: 100%;
            }
            
            .btn {
                flex: 1;
                justify-content: center;
            }
            
            .nav-tabs {
                flex-direction: column;
            }
            
            .action-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .section-title.with-action {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
            
            .section-title .action-buttons {
                width: 100%;
            }
            
            .batch-actions {
                flex-direction: column;
                align-items: stretch;
            }
            
            .batch-actions .btn {
                width: 100%;
            }
        }
    </style>
    <link rel="stylesheet" href="../Content/havvk-theme.css" />
    </head>
<body>
    <form id="form1" runat="server">
        <div class="header">
            <div class="container">
                <div class="logo">
                    <h1>哈夫克集团员工管理系统</h1>
                    <span>v2.0</span>
                </div>
                <p>高效管理企业人力资源，提升组织效能</p>
                
                <div class="nav-tabs">
                    <div class="nav-tab active" onclick="showTab('dashboard')">📊 系统首页</div>
                    <div class="nav-tab" onclick="showTab('employee')">👥 员工管理</div>
                    <div class="nav-tab" onclick="showTab('department')">🏢 部门管理</div>
                </div>
            </div>
        </div>

        <div class="container">
            <!-- 系统首页 -->
            <div id="dashboard" class="content tab-content" style="display: block;">
                <h2 class="section-title">📊 系统概览</h2>
                
                <div class="stats-cards">
                    <div class="stat-card">
                        <h3>员工总数</h3>
                        <div class="value" id="totalEmployees">0</div>
                        <p>在职员工数量</p>
                    </div>
                    <div class="stat-card today">
                        <h3>今日新增</h3>
                        <div class="value" id="todayEmployees">0</div>
                        <p>今日新入职员工</p>
                    </div>
                    <div class="stat-card department">
                        <h3>部门数量</h3>
                        <div class="value" id="totalDepartments">0</div>
                        <p>公司部门总数</p>
                    </div>
                    <div class="stat-card inactive">
                        <h3>离职员工</h3>
                        <div class="value" id="inactiveEmployees">0</div>
                        <p>已离职员工数量</p>
                    </div>
                </div>

                <div class="quick-actions">
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">🚀 快捷操作</h3>
                    <div class="action-grid">
                        <div class="action-btn" onclick="showTab('employee', event); showAddForm()">
                            <span style="font-size: 24px;">➕</span>
                            <span>添加员工</span>
                        </div>
                        <div class="action-btn" onclick="showTab('department', event); addDepartmentModal()">
                            <span style="font-size: 24px;">🏢</span>
                            <span>添加部门</span>
                        </div>
                        
                    </div>
                </div>

                <h3 class="section-title">📋 最新员工动态</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>员工编号</th>
                                <th>姓名</th>
                                <th>部门</th>
                                <th>职位</th>
                                <th>入职时间</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody id="recentEmployees">
                            <!-- 动态加载 -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 员工管理 -->
            <div id="employee" class="content tab-content" style="display: none;">
                <div class="section-title with-action">
                    <span>👥 员工管理</span>
                    <div class="action-buttons">
                        <button type="button" class="btn btn-success" onclick="showAddForm()">
                            <span>➕ 新增员工</span>
                        </button>
                        <button type="button" class="btn btn-outline" onclick="refreshEmployeeList()">
                            <span>🔄 刷新</span>
                        </button>
                    </div>
                </div>

                <!-- 搜索框 -->
                <div class="search-box">
                    <div class="search-row">
                        <div class="form-group">
                            <label>员工编号/姓名</label>
                            <input type="text" class="form-control" id="empSearchKeyword" 
                                   placeholder="输入员工编号或姓名" />
                        </div>
                        <div class="form-group">
                            <label>所在部门</label>
                            <select class="form-control" id="empSearchDept">
                                <option value="">所有部门</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>员工状态</label>
                            <select class="form-control" id="empSearchStatus">
                                <option value="">所有状态</option>
                                <option value="true">在职</option>
                                <option value="false">离职</option>
                            </select>
                        </div>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary" onclick="searchEmployees()">
                            <span>🔍 搜索</span>
                        </button>
                        <button type="button" class="btn btn-outline" onclick="clearEmployeeSearch()">
                            <span>🗑️ 清空</span>
                        </button>
                        
                    </div>
                </div>

                <!-- 操作结果提示 -->
                <div id="employeeMessage" style="display: none;"></div>

                <!-- 员工列表 -->
                <div class="results-header">
                    <div class="results-title">
                        📋 员工列表
                        <span id="employeeCount" class="badge badge-primary">0 人</span>
                    </div>
                    <div class="results-meta" id="employeeMeta">
                        共 0 条记录
                    </div>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th width="50">
                                    <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)" />
                                </th>
                                <th>员工编号</th>
                                <th>姓名</th>
                                <th>性别</th>
                                <th>年龄</th>
                                <th>部门</th>
                                <th>权限等级</th>
                                <th>状态</th>
                                <th>联系电话</th>
                                <th>邮箱</th>
                                <th width="180">操作</th>
                            </tr>
                        </thead>
                        <tbody id="employeeList">
                            <tr>
                                <td colspan="11" class="loading">加载中...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 分页 -->
                <div class="pagination" id="employeePagination" style="display: none;"></div>

                <!-- 批量操作 -->
                <div class="batch-actions" id="batchActions" style="display: none;">
                    <span style="margin-right: 15px;">已选择 <span id="selectedCount">0</span> 项：</span>
                    <button type="button" class="btn btn-outline" onclick="batchUpdateStatus('active')">
                        <span>✅ 设为在职</span>
                    </button>
                    <button type="button" class="btn btn-outline" onclick="batchUpdateStatus('inactive')">
                        <span>❌ 设为离职</span>
                    </button>
                    <button type="button" class="btn btn-danger" onclick="batchDelete()">
                        <span>🗑️ 批量删除</span>
                    </button>
                    <button type="button" class="btn btn-outline" onclick="clearSelection()">
                        <span>✖️ 取消选择</span>
                    </button>
                </div>
            </div>

            <!-- 部门管理 -->
<div id="department" class="content tab-content" style="display: none;">
    <div class="section-title with-action">
        <span>🏢 部门管理</span>
        <div class="action-buttons">
            <button type="button" class="btn btn-success" onclick="addDepartmentModal()">
                <span>➕ 添加部门</span>
            </button>
            <button type="button" class="btn btn-outline" onclick="loadDepartments()">
                <span>🔄 刷新</span>
            </button>
        </div>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-box">
        <div class="search-row">
            <div class="form-group" style="flex: 2;">
                <label>部门代码/名称</label>
                <input type="text" class="form-control" id="deptSearchKeyword" 
                       placeholder="输入部门代码或部门名称" />
            </div>
        </div>
        <div class="btn-group">
            <button class="btn btn-primary" onclick="searchDepartments()">
                <span>🔍 搜索部门</span>
            </button>
            <button class="btn" onclick="resetDeptSearch()">
                <span>🔄 重置</span>
            </button>
        </div>
    </div>

    <!-- 操作结果提示 -->
    <div id="departmentMessage" style="display: none;"></div>

    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>部门ID</th>
                    <th>部门代码</th>
                    <th>部门名称</th>
                    <th>部门经理</th>
                    <th>员工数量</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody id="departmentList">
                <!-- 动态加载 -->
            </tbody>
        </table>
    </div>
</div>

<!-- 添加/编辑部门模态框 -->
<div id="departmentModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="deptModalTitle">添加部门</h2>
            <span class="close" onclick="closeModal('departmentModal')">×</span>
        </div>

        <div id="deptModalMessage" style="display: none; margin: 0 30px 20px 30px;"></div>

        <div class="modal-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                    <label><span style="color: red;">*</span> 部门代码</label>
                    <input type="text" class="form-control" id="deptCode" required 
                           placeholder="如：DEPT001" />
                </div>
                <div class="form-group">
                    <label><span style="color: red;">*</span> 部门名称</label>
                    <input type="text" class="form-control" id="deptName" required 
                           placeholder="请输入部门名称" />
                </div>
                <div class="form-group" style="grid-column: span 2;">
                    <label>部门经理</label>
                    <select class="form-control" id="deptManager">
                        <option value="">暂不指定</option>
                        <!-- 动态加载权限2级以上的员工 -->
                    </select>
                    <small style="color: #666; display: block; margin-top: 5px;">
                        只能选择权限为2级（部门主管）或以上的员工
                    </small>
                </div>
            </div>
            <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: flex-end;">
                <button type="button" class="btn" onclick="closeModal('departmentModal')">取消</button>
                <button type="button" class="btn btn-success" onclick="saveDepartment()">
                    <span>💾 保存</span>
                </button>
            </div>
        </div>
    </div>
</div>

        <!-- 快速搜索模态框 -->
        <div id="quickSearchModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔍 快速搜索员工</h3>
                    <span class="close" onclick="closeModal('quickSearchModal')">×</span>
                </div>
                <div class="modal-body">
                    <div class="search-box">
                        <div class="search-row">
                            <div class="form-group">
                                <label>员工编号/姓名</label>
                                <input type="text" class="form-control" id="quickSearchInput" placeholder="输入员工编号或姓名" />
                            </div>
                            <div class="form-group">
                                <label>所在部门</label>
                                <select class="form-control" id="quickDeptSelect">
                                    <option value="">所有部门</option>
                                </select>
                            </div>
                        </div>
                        <div style="margin-top: 20px; display: flex; gap: 15px;">
                            <button class="btn btn-primary" onclick="executeQuickSearch()">
                                <span>🔍 开始搜索</span>
                            </button>
                            <button class="btn" onclick="closeModal('quickSearchModal')">
                                <span>取消</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 员工编辑/添加模态框 -->
<div id="employeeModal" class="modal">
    <div class="modal-content" style="max-width: 750px;">
        <div class="modal-header">
            <h2 id="modalTitle">新增员工</h2>
            <span class="close" onclick="closeModal('employeeModal')">×</span>
        </div>

        <div id="modalMessage" style="display: none; margin: 0 30px 20px 30px;"></div>

        <form id="employeeForm">
            <div style="padding: 0 30px;">
                <!-- 第一行：员工编号和姓名 -->
                <div class="search-row">
                    <div class="form-group" style="flex: 1.2;">
                        <label><span style="color: red;">*</span> 员工编号</label>
                        <input type="text" class="form-control" id="empId" name="EmployeeID" 
                               required placeholder="如：EMP001" style="width: 100%;" />
                    </div>
                    <div class="form-group" style="flex: 1.5;">
                        <label><span style="color: red;">*</span> 姓名</label>
                        <input type="text" class="form-control" id="empName" name="EmployeeName" 
                               required placeholder="请输入员工姓名" style="width: 100%;" />
                    </div>
                </div>

                <!-- 第二行：性别、年龄、部门 -->
                <div class="search-row">
                    <div class="form-group">
                        <label>性别</label>
                        <select class="form-control" id="empGender" name="Gender" style="width: 100%;">
                            <option value="">请选择</option>
                            <option value="男">男</option>
                            <option value="女">女</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>年龄</label>
                        <input type="number" class="form-control" id="empAge" name="Age" 
                               placeholder="请输入年龄" min="18" max="65" style="width: 100%;" />
                    </div>
                    <div class="form-group" style="flex: 1.2;">
                        <label>部门</label>
                        <input type="text" class="form-control" id="empDept" name="Department" 
                               placeholder="请输入部门" style="width: 100%;" />
                    </div>
                </div>

                <!-- 第三行：权限等级和员工状态 -->
                <div class="search-row">
                    <div class="form-group" style="flex: 1.2;">
                        <label>权限等级</label>
                        <select class="form-control" id="empPermission" name="PermissionLevel" style="width: 100%;">
                            <option value="1">普通员工 (1级)</option>
                            <option value="2">部门主管 (2级)</option>
                            <option value="3">管理员 (3级)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>员工状态</label>
                        <select class="form-control" id="empStatus" name="IsActive" style="width: 100%;">
                            <option value="true">在职</option>
                            <option value="false">离职</option>
                        </select>
                    </div>
                </div>

                <!-- 第四行：联系电话和电子邮箱 -->
                <div class="search-row">
                    <div class="form-group" style="flex: 1.3;">
                        <label>联系电话</label>
                        <input type="tel" class="form-control" id="empPhone" name="Phone" 
                               placeholder="请输入联系电话" style="width: 100%;" />
                    </div>
                    <div class="form-group" style="flex: 1.5;">
                        <label>电子邮箱</label>
                        <input type="email" class="form-control" id="empEmail" name="Email" 
                               placeholder="请输入电子邮箱" style="width: 100%;" />
                    </div>
                </div>

                <!-- 第五行：备注 -->
                <div class="form-group" style="margin-top: 20px;">
                    <label>备注</label>
                    <textarea class="form-control" id="empRemarks" name="Remarks" rows="4" 
                              placeholder="请输入备注信息" style="width: 100%; resize: vertical;"></textarea>
                </div>
            </div>

            <div style="margin-top: 30px; padding: 20px 30px; border-top: 1px solid #e3e8ef;">
                <div class="btn-group" style="justify-content: flex-end;">
                    <button type="button" class="btn" onclick="closeModal('employeeModal')" style="padding: 10px 25px;">
                        <span>取消</span>
                    </button>
                    <button type="submit" class="btn btn-primary" style="padding: 10px 25px;">
                        <span>💾 保存</span>
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

        <!-- 添加部门模态框 -->
        <div id="addDepartmentModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>添加新部门</h3>
                    <span class="close" onclick="closeModal('addDepartmentModal')">×</span>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>部门代码 *</label>
                            <input type="text" class="form-control" id="newDeptCode" required />
                        </div>
                        <div class="form-group">
                            <label>部门名称 *</label>
                            <input type="text" class="form-control" id="newDeptName" required />
                        </div>
                        <div class="form-group">
                            <label>上级部门</label>
                            <select class="form-control" id="newParentDept">
                                <option value="">无（顶级部门）</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>部门经理</label>
                            <select class="form-control" id="newDeptManager">
                                <option value="">暂不指定</option>
                            </select>
                        </div>
                    </div>
                    <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: flex-end;">
                        <button class="btn" onclick="closeModal('addDepartmentModal')">取消</button>
                        <button class="btn btn-success" onclick="saveDepartment()">保存</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="container">
                <p>© 2023 哈夫克集团 版权所有 | 员工管理系统 v2.0</p>
                <p>技术支持：信息技术部 | 服务热线：400-888-8888</p>
                <p style="margin-top: 10px; font-size: 12px; color: #a0aec0;">
                    <span id="serverTime">服务器时间：</span> | 
                    <span>在线人数：<span id="onlineCount">0</span></span>
                </p>
            </div>
        </div>
    </form>

    <script>
        // ============ 全局变量 ============
        let currentPage = 1;
        const pageSize = 10;

        // 员工管理相关变量
        let employeeCurrentPage = 1;
        let employeePageSize = 10;
        let allEmployees = [];
        let selectedEmployees = new Set();

        // ============ 页面初始化 ============
        document.addEventListener('DOMContentLoaded', function () {
            console.log('页面初始化开始...');

            // 初始化仪表盘数据
            loadDashboardData();

            // 加载部门选择列表
            loadEmployeeDepartments();

            // 初始化服务器时间显示
            updateServerTime();
            setInterval(updateServerTime, 1000);

            // 加载最新员工数据
            loadRecentEmployees();

            // 绑定表单提交事件
            document.getElementById('employeeForm').addEventListener('submit', handleEmployeeFormSubmit);

            // 页面加载后立即加载员工数据（如果当前标签是员工管理）
            if (document.getElementById('employee').style.display !== 'none') {
                loadEmployeeData();
            }

            console.log('页面初始化完成');
        });

        // ============ 通用函数 ============
        // 切换标签页
        function showTab(tabName, event) {
            console.log('切换到标签页:', tabName);

            // 隐藏所有标签页
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.style.display = 'none';
            });

            // 移除所有活跃标签
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // 显示目标标签页
            const targetTab = document.getElementById(tabName);
            if (targetTab) {
                targetTab.style.display = 'block';
            }

            // 设置活跃标签
            if (event && event.target) {
                event.target.classList.add('active');
            } else {
                // 如果没有event对象，找到对应的标签页
                const tabs = document.querySelectorAll('.nav-tab');
                tabs.forEach(tab => {
                    if (tab.textContent.trim().includes(getTabName(tabName))) {
                        tab.classList.add('active');
                    }
                });
            }

            // 加载对应数据
            switch (tabName) {
                case 'dashboard':
                    loadDashboardData();
                    loadRecentEmployees();
                    break;
                case 'employee':
                    loadEmployeeData();
                    loadEmployeeDepartments();
                    break;
                case 'department':
                    loadDepartments();
                    break;

            }
        }

        function getTabName(tabId) {
            const names = {
                'dashboard': '系统首页',
                'employee': '员工管理',
                'department': '部门管理'
            };
            return names[tabId] || tabId;
        }

        function getPermissionText(level) {
            switch (String(level)) {
                case '1': return '普通员工';
                case '2': return '部门主管';
                case '3': return '管理员';
                default: return level ? `权限${level}级` : '未设置';
            }
        }

        function formatDate(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('zh-CN') + ' ' +
                    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                return dateString;
            }
        }

        // 更新服务器时间
        function updateServerTime() {
            const now = new Date();
            const timeStr = now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const serverTimeElement = document.getElementById('serverTime');
            if (serverTimeElement) {
                serverTimeElement.textContent = '服务器时间：' + timeStr;
            }
        }

        function showMessage(message, type, elementId = 'employeeMessage') {
            const messageDiv = document.getElementById(elementId);

            // 清空之前的内容
            messageDiv.innerHTML = '';

            // 创建消息内容
            const content = document.createElement('div');
            content.className = type === 'error' ? 'error-message' : 'success-message';

            // 添加图标
            const icon = document.createElement('span');
            icon.style.marginRight = '10px';
            icon.innerHTML = type === 'error' ? '❌' : '✅';

            // 添加文本
            const text = document.createElement('span');
            text.textContent = message;

            content.appendChild(icon);
            content.appendChild(text);
            messageDiv.appendChild(content);
            messageDiv.style.display = 'block';

            // 如果是错误消息，添加调试按钮
            if (type === 'error') {
                const debugBtn = document.createElement('button');
                debugBtn.textContent = '查看详情';
                debugBtn.style.marginLeft = '10px';
                debugBtn.style.padding = '2px 8px';
                debugBtn.style.fontSize = '12px';
                debugBtn.style.cursor = 'pointer';
                debugBtn.onclick = function () {
                    console.error('详细错误信息:', message);
                    alert('请按F12打开开发者工具，在控制台查看详细错误信息');
                };
                content.appendChild(debugBtn);
            }

            // 5秒后自动隐藏（成功消息）或10秒后隐藏（错误消息）
            const timeout = type === 'error' ? 10000 : 5000;
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, timeout);
        }

        // ============ 首页功能 ============
        // 加载仪表盘数据
        async function loadDashboardData() {
            try {
                const result = await callWebMethod('GetDashboardData');

                if (result && result.success) {
                    document.getElementById('totalEmployees').textContent = result.TotalEmployees || 0;
                    document.getElementById('todayEmployees').textContent = result.TodayEmployees || 0;
                    document.getElementById('totalDepartments').textContent = result.TotalDepartments || 0;
                    document.getElementById('inactiveEmployees').textContent = result.InactiveEmployees || 0;
                } else if (result && result.error) {
                    console.error('仪表盘数据错误:', result.message);
                }

                // 加载最新员工
                const recentResult = await callWebMethod('GetRecentEmployees');
                if (recentResult && recentResult.success && recentResult.data) {
                    displayRecentEmployees(recentResult.data);
                }

            } catch (error) {
                console.error('加载仪表盘数据失败:', error);
                showMessage('加载仪表盘数据失败', 'error');
            }
        }

        // 显示最新员工
        function displayRecentEmployees(employees) {
            const tbody = document.getElementById('recentEmployees');
            if (!tbody) return;

            tbody.innerHTML = '';

            if (employees.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="6" style="text-align: center; padding: 50px; color: #95a5a6;">暂无最新员工数据</td>`;
                tbody.appendChild(row);
                return;
            }

            employees.forEach(emp => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${emp.EmployeeID || ''}</td>
                    <td>${emp.EmployeeName || ''}</td>
                    <td>${emp.Department || ''}</td>
                    <td>${emp.PermissionName || ''}</td>
                    <td>${emp.CreatedAt || ''}</td>
                    <td><span class="badge ${emp.Status === '启用' ? 'badge-success' : 'badge-warning'}">${emp.Status || ''}</span></td>
                `;
                tbody.appendChild(row);
            });
        }

        // ============ 员工管理功能 ============
        // 加载员工数据
        async function loadEmployeeData() {
            const tbody = document.getElementById('employeeList');
            const messageDiv = document.getElementById('employeeMessage');
            messageDiv.style.display = 'none';

            tbody.innerHTML = '<tr><td colspan="11" class="loading">加载中...</td></tr>';

            try {
                // 获取搜索条件
                const keyword = document.getElementById('empSearchKeyword')?.value.trim() || '';
                const department = document.getElementById('empSearchDept')?.value || '';
                const status = document.getElementById('empSearchStatus')?.value || '';

                console.log('搜索条件:', { keyword, department, status, page: employeeCurrentPage, pageSize: employeePageSize });

                // 调用后端方法 - 使用正确的参数结构
                const response = await callWebMethod('GetEmployeeData', {
                    keyword: keyword,
                    department: department,
                    status: status,
                    page: employeeCurrentPage,
                    pageSize: employeePageSize
                });

                console.log('员工查询响应:', response);

                // 处理响应
                if (response && response.success) {
                    allEmployees = response.employees || [];
                    renderEmployeeTable(allEmployees);
                    renderEmployeePagination(response.total || allEmployees.length);

                    // 显示成功消息（如果有）
                    if (response.message && response.message !== '加载成功') {
                        showMessage(response.message, 'success');
                    }

                    // 清空错误消息
                    messageDiv.style.display = 'none';
                } else {
                    const errorMsg = response?.message || '加载员工数据失败';
                    console.error('加载员工数据失败:', errorMsg);
                    showMessage('加载员工数据失败: ' + errorMsg, 'error');

                    // 显示空表格
                    tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 50px; color: #95a5a6;">暂无数据或加载失败</td></tr>';
                }

            } catch (error) {
                console.error('加载员工数据失败:', error);
                tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 50px; color: #e74c3c;">
            <div>加载失败</div>
            <div style="font-size: 12px; margin-top: 10px;">${error.message}</div>
        </td></tr>`;
                showMessage('加载员工数据失败，请检查网络连接或联系管理员', 'error');
            }
        }

        // 渲染员工表格
        function renderEmployeeTable(employees) {
            const tbody = document.getElementById('employeeList');
            const countSpan = document.getElementById('employeeCount');
            const metaSpan = document.getElementById('employeeMeta');

            if (!employees || employees.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" class="loading">暂无员工数据</td></tr>';
                countSpan.textContent = '0 人';
                metaSpan.textContent = '共 0 条记录';
                return;
            }

            tbody.innerHTML = '';
            selectedEmployees.clear();
            updateBatchActions();

            employees.forEach((emp, index) => {
                const row = document.createElement('tr');

                // 正确处理状态字段
                const isActive = emp.IsActive === true || emp.IsActive === 'true' || emp.IsActive === 1 || emp.Status === '在职';
                const statusClass = isActive ? 'badge-success' : 'badge-danger';
                const statusText = isActive ? '在职' : '离职';

                // 使用正确的字段名
                const permissionText = getPermissionText(emp.PermissionLevel);
                const employeeName = emp.EmployeeName || emp.Name || '';
                const phoneNumber = emp.PhoneNumber || emp.Phone || '';

                row.innerHTML = `
                    <td><input type="checkbox" class="emp-checkbox" value="${emp.EmployeeID}" 
                           onchange="toggleEmployeeSelection('${emp.EmployeeID}', this.checked)" /></td>
                    <td><strong>${emp.EmployeeID || ''}</strong></td>
                    <td>${employeeName}</td>
                    <td>${emp.Gender || '未设置'}</td>
                    <td>${emp.Age || ''}</td>
                    <td>${emp.Department || ''}</td>
                    <td>${permissionText}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>${phoneNumber}</td>
                    <td>${emp.Email || ''}</td>
                    <td>
                        <div class="btn-group" style="justify-content: flex-start;">
                            <button type="button" class="btn btn-primary" onclick="editEmployee('${emp.EmployeeID}')" style="padding: 5px 10px; font-size: 12px;">
                                编辑
                            </button>
                            <button type="button" class="btn btn-danger" onclick="deleteEmployee('${emp.EmployeeID}', '${employeeName}')" style="padding: 5px 10px; font-size: 12px;">
                                删除
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });

            countSpan.textContent = `${employees.length} 人`;
            metaSpan.textContent = `共 ${employees.length} 条记录`;
        }

        // 编辑员工
        async function editEmployee(employeeId) {
            try {
                const result = await callWebMethod('GetEmployeeById', { employeeId: employeeId });

                console.log('编辑员工数据:', result);

                if (result && result.success && result.employee) {
                    const emp = result.employee;

                    // 填充表单
                    document.getElementById('modalTitle').textContent = '编辑员工信息';
                    document.getElementById('empId').value = emp.EmployeeID || '';
                    document.getElementById('empId').readOnly = true;
                    document.getElementById('empName').value = emp.EmployeeName || '';
                    document.getElementById('empGender').value = emp.Gender || '';
                    document.getElementById('empAge').value = emp.Age || '';
                    document.getElementById('empDept').value = emp.Department || '';
                    document.getElementById('empPermission').value = emp.PermissionLevel || '1';
                    document.getElementById('empStatus').value = emp.IsActive ? 'true' : 'false';
                    document.getElementById('empPhone').value = emp.PhoneNumber || emp.Phone || '';
                    document.getElementById('empEmail').value = emp.Email || '';
                    document.getElementById('empRemarks').value = emp.Remarks || '';

                    document.getElementById('employeeModal').style.display = 'flex';
                } else {
                    showMessage('获取员工信息失败: ' + (result?.message || '未知错误'), 'error');
                }

            } catch (error) {
                console.error('编辑员工失败:', error);
                showMessage(`编辑失败: ${error.message}`, 'error');
            }
        }

        // 删除员工
        async function deleteEmployee(employeeId, employeeName) {
            if (!confirm(`确定要删除员工 "${employeeName}" (${employeeId}) 吗？此操作不可恢复！`)) {
                return;
            }

            try {
                const result = await callWebMethod('DeleteEmployee', { employeeId });

                let data = result;
                if (typeof result.d !== 'undefined') {
                    data = typeof result.d === 'string' ? JSON.parse(result.d) : result.d;
                }

                if (data && data.success) {
                    showMessage(`员工 "${employeeName}" 删除成功！`, 'success');
                    loadEmployeeData(); // 刷新列表
                } else {
                    showMessage(`删除失败: ${data?.message || '未知错误'}`, 'error');
                }

            } catch (error) {
                console.error('删除员工失败:', error);
                showMessage(`删除失败: ${error.message}`, 'error');
            }
        }

        // 搜索员工
        function searchEmployees() {
            employeeCurrentPage = 1;
            loadEmployeeData();
        }

        // 清空搜索
        function clearEmployeeSearch() {
            document.getElementById('empSearchKeyword').value = '';
            document.getElementById('empSearchDept').value = '';
            document.getElementById('empSearchStatus').value = '';
            employeeCurrentPage = 1;
            loadEmployeeData();
        }

        // 刷新员工列表
        function refreshEmployeeList() {
            employeeCurrentPage = 1;
            loadEmployeeData();
            showMessage('员工列表已刷新！', 'success');
        }

        // 显示新增员工表单
        function showAddForm() {
            document.getElementById('modalTitle').textContent = '新增员工';
            document.getElementById('employeeForm').reset();
            document.getElementById('empId').readOnly = false;

            // 设置默认值
            document.getElementById('empStatus').value = 'true';
            document.getElementById('empPermission').value = '1';

            document.getElementById('employeeModal').style.display = 'flex';
        }

        // 处理员工表单提交
        async function handleEmployeeFormSubmit(e) {
            e.preventDefault();

            // 收集表单数据
            const employeeData = {
                EmployeeID: document.getElementById('empId').value.trim(),
                EmployeeName: document.getElementById('empName').value.trim(),
                Gender: document.getElementById('empGender').value,
                Department: document.getElementById('empDept').value.trim(),
                Age: document.getElementById('empAge').value || "0",
                PermissionLevel: parseInt(document.getElementById('empPermission').value) || 1,
                Phone: document.getElementById('empPhone').value.trim(),
                Email: document.getElementById('empEmail').value.trim(),
                Remarks: document.getElementById('empRemarks').value.trim(),
                IsActive: document.getElementById('empStatus').value === 'true'
            };

            // 验证必填字段
            if (!employeeData.EmployeeID) {
                showMessage('员工编号不能为空！', 'error', 'modalMessage');
                return;
            }

            if (!employeeData.EmployeeName) {
                showMessage('员工姓名不能为空！', 'error', 'modalMessage');
                return;
            }

            const isEdit = document.getElementById('empId').readOnly;
            const endpoint = isEdit ? 'UpdateEmployee' : 'AddEmployee';

            try {
                showMessage('正在保存...', 'success', 'modalMessage');

                // 传递参数的方式
                const result = await callWebMethod(endpoint, employeeData);

                console.log('保存结果:', result);

                if (result && result.success) {
                    showMessage(`员工信息${isEdit ? '更新' : '添加'}成功！`, 'success', 'modalMessage');
                    setTimeout(() => {
                        closeModal('employeeModal');
                        loadEmployeeData(); // 刷新列表
                    }, 1500);
                } else {
                    showMessage(`${isEdit ? '更新' : '添加'}失败: ${result?.message || '未知错误'}`, 'error', 'modalMessage');
                }

            } catch (error) {
                console.error('保存员工信息失败:', error);
                showMessage(`保存失败: ${error.message}`, 'error', 'modalMessage');
            }
        }

        // 加载员工管理页面的部门
        async function loadEmployeeDepartments() {
            const select = document.getElementById('empSearchDept');
            if (!select) return;

            try {
                const result = await callWebMethod('GetDepartments');

                let data = result;
                if (typeof result.d !== 'undefined') {
                    data = typeof result.d === 'string' ? JSON.parse(result.d) : result.d;
                }

                if (data && data.success && data.data) {
                    const departments = data.data;

                    const firstOption = select.options[0];
                    select.innerHTML = '';
                    if (firstOption) {
                        select.appendChild(firstOption);
                    } else {
                        const opt = document.createElement('option');
                        opt.value = '';
                        opt.textContent = '所有部门';
                        select.appendChild(opt);
                    }

                    departments.forEach(dept => {
                        const opt = document.createElement('option');
                        opt.value = dept.DepartmentCode;
                        opt.textContent = `${dept.DepartmentName}`;
                        select.appendChild(opt);
                    });
                }

            } catch (error) {
                console.error('加载部门失败：', error);
            }
        }

        // ============ 分页功能 ============
        function renderEmployeePagination(totalCount) {
            const pagination = document.getElementById('employeePagination');
            const totalPages = Math.ceil(totalCount / employeePageSize);

            if (totalPages <= 1) {
                pagination.style.display = 'none';
                return;
            }

            let html = '';

            if (employeeCurrentPage > 1) {
                html += `<div class="page-item" onclick="changeEmployeePage(${employeeCurrentPage - 1})">上一页</div>`;
            }

            const maxVisiblePages = 5;
            let startPage = Math.max(1, employeeCurrentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                html += `<div class="page-item ${i === employeeCurrentPage ? 'active' : ''}" onclick="changeEmployeePage(${i})">${i}</div>`;
            }

            if (employeeCurrentPage < totalPages) {
                html += `<div class="page-item" onclick="changeEmployeePage(${employeeCurrentPage + 1})">下一页</div>`;
            }

            html += `<div style="margin-left: 20px; color: #718096; display: flex; align-items: center;">
                    共 ${totalPages} 页，${totalCount} 条记录
                </div>`;

            pagination.innerHTML = html;
            pagination.style.display = 'flex';
        }

        function changeEmployeePage(page) {
            employeeCurrentPage = page;
            loadEmployeeData();
            document.getElementById('employee').scrollIntoView({ behavior: 'smooth' });
        }

        // ============ 批量操作功能 ============
        function toggleSelectAll(checkbox) {
            const checkboxes = document.querySelectorAll('.emp-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = checkbox.checked;
                toggleEmployeeSelection(cb.value, cb.checked);
            });
            updateBatchActions();
        }

        function toggleEmployeeSelection(employeeId, selected) {
            if (selected) {
                selectedEmployees.add(employeeId);
            } else {
                selectedEmployees.delete(employeeId);
            }
            updateBatchActions();
        }

        function updateBatchActions() {
            const batchDiv = document.getElementById('batchActions');
            const countSpan = document.getElementById('selectedCount');

            countSpan.textContent = selectedEmployees.size;

            if (selectedEmployees.size > 0) {
                batchDiv.style.display = 'block';
            } else {
                batchDiv.style.display = 'none';
            }
        }

        async function batchUpdateStatus(status) {
            const statusText = status === 'active' ? '在职' : '离职';
            if (!confirm(`确定要将选中的 ${selectedEmployees.size} 名员工设置为"${statusText}"状态吗？`)) {
                return;
            }

            const employeeIds = Array.from(selectedEmployees);

            try {
                const result = await callWebMethod('BatchUpdateEmployeeStatus', {
                    employeeIds,
                    isActive: status === 'active'
                });

                let data = result;
                if (typeof result.d !== 'undefined') {
                    data = typeof result.d === 'string' ? JSON.parse(result.d) : result.d;
                }

                if (data && data.success) {
                    showMessage(`成功更新 ${employeeIds.length} 名员工状态！`, 'success');
                    selectedEmployees.clear();
                    loadEmployeeData(); // 刷新列表
                } else {
                    showMessage(`批量更新失败: ${data?.message || '未知错误'}`, 'error');
                }

            } catch (error) {
                console.error('批量更新状态失败:', error);
                showMessage(`批量更新失败: ${error.message}`, 'error');
            }
        }

        async function batchDelete() {
            if (!confirm(`确定要删除选中的 ${selectedEmployees.size} 名员工吗？此操作不可恢复！`)) {
                return;
            }

            const employeeIds = Array.from(selectedEmployees);

            try {
                const result = await callWebMethod('BatchDeleteEmployees', { employeeIds });

                let data = result;
                if (typeof result.d !== 'undefined') {
                    data = typeof result.d === 'string' ? JSON.parse(result.d) : result.d;
                }

                if (data && data.success) {
                    showMessage(`成功删除 ${employeeIds.length} 名员工！`, 'success');
                    selectedEmployees.clear();
                    loadEmployeeData(); // 刷新列表
                } else {
                    showMessage(`批量删除失败: ${data?.message || '未知错误'}`, 'error');
                }

            } catch (error) {
                console.error('批量删除失败:', error);
                showMessage(`批量删除失败: ${error.message}`, 'error');
            }
        }

        function clearSelection() {
            const checkboxes = document.querySelectorAll('.emp-checkbox');
            checkboxes.forEach(cb => cb.checked = false);
            selectedEmployees.clear();
            updateBatchActions();
        }

        // 导出员工列表
        function exportEmployeeList() {
            if (!allEmployees || allEmployees.length === 0) {
                alert('没有可导出的数据！');
                return;
            }

            const header = ['员工编号', '姓名', '性别', '年龄', '部门', '权限', '状态', '联系电话', '邮箱', '创建时间'];
            const rows = allEmployees.map(emp => {
                const isActive = emp.IsActive === true || emp.IsActive === 'true' || emp.IsActive === 1 || emp.Status === '在职';
                const statusText = isActive ? '在职' : '离职';
                const permissionText = getPermissionText(emp.PermissionLevel);
                const created = formatDate(emp.CreatedAt) || '';

                return [
                    emp.EmployeeID || '',
                    emp.EmployeeName || emp.Name || '',
                    emp.Gender || '',
                    emp.Age || '',
                    emp.Department || '',
                    permissionText,
                    statusText,
                    emp.PhoneNumber || emp.Phone || '',
                    emp.Email || '',
                    created
                ].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',');
            });

            const csv = [header.join(','), ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '员工列表.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showMessage('员工列表导出成功！', 'success');
        }

        // ============ 通用WebMethod调用函数 ============
        async function callWebMethod(methodName, params = {}) {
            try {
                const url = `WebForm1.aspx/${methodName}`;

                console.log(`调用WebMethod: ${methodName}`, params);

                // 准备请求数据 - 特别注意：ASP.NET WebMethod 需要特定的参数格式
                let requestData;

                if (methodName === 'GetEmployeeData') {
                    // 对于 GetEmployeeData，需要将参数作为单独参数传递
                    requestData = JSON.stringify({
                        keyword: params.keyword || '',
                        department: params.department || '',
                        status: params.status || '',
                        page: params.page || 1,
                        pageSize: params.pageSize || 10
                    });
                } else {
                    // 其他方法保持原样
                    requestData = JSON.stringify(params);
                }

                console.log('发送的请求数据:', requestData);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json'
                    },
                    body: requestData,
                    credentials: 'same-origin'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('HTTP错误响应:', errorText);
                    throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
                }

                const responseText = await response.text();
                console.log('原始响应文本:', responseText);

                if (!responseText) {
                    throw new Error('响应为空');
                }

                // 解析响应
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('JSON解析错误:', parseError, '原始文本:', responseText);
                    throw new Error(`响应解析失败: ${parseError.message}`);
                }

                // ASP.NET WebMethod 返回的数据在 .d 属性中
                if (data && data.d !== undefined) {
                    // 如果 .d 是字符串，尝试解析为JSON
                    if (typeof data.d === 'string') {
                        try {
                            return JSON.parse(data.d);
                        } catch (innerError) {
                            console.error('解析.d字符串失败:', innerError, '原始字符串:', data.d);
                            return {
                                success: false,
                                message: data.d,
                                rawData: data.d
                            };
                        }
                    }
                    return data.d;
                }

                return data;

            } catch (error) {
                console.error(`调用WebMethod失败: ${methodName}`, error);

                // 检查是否是登录超时
                if (error.message.includes('权限不足') || error.message.includes('登录')) {
                    // 跳转到登录页面
                    window.location.href = 'WebForm2.aspx?timeout=1';
                    return {
                        success: false,
                        message: '登录已超时，请重新登录',
                        needRelogin: true
                    };
                }

                return {
                    success: false,
                    message: `调用失败: ${error.message}`,
                    originalError: error.message
                };
            }
        }

        // 关闭模态框
        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        }

        // ============ 其他原有功能 ============
        // 快速搜索功能
        function quickSearchAction() {
            // 加载部门列表
            loadDepartmentsForSelect();

            // 清空输入框
            const quickSearchInput = document.getElementById('quickSearchInput');
            if (quickSearchInput) quickSearchInput.value = '';

            const quickDeptSelect = document.getElementById('quickDeptSelect');
            if (quickDeptSelect) quickDeptSelect.value = '';

            // 显示模态框
            document.getElementById('quickSearchModal').style.display = 'flex';
        }

        // 执行快速搜索
        function executeQuickSearch() {
            const searchValue = document.getElementById('quickSearchInput').value.trim();
            const deptValue = document.getElementById('quickDeptSelect').value;

            // 设置搜索条件
            const empSearchKeyword = document.getElementById('empSearchKeyword');
            const empSearchDept = document.getElementById('empSearchDept');

            if (empSearchKeyword) empSearchKeyword.value = searchValue;
            if (empSearchDept && deptValue) empSearchDept.value = deptValue;

            // 关闭模态框
            closeModal('quickSearchModal');

            // 切换到员工管理标签页
            showTab('employee');

            // 执行搜索
            setTimeout(() => {
                searchEmployees();
            }, 100);
        }

        // ============ 部门管理功能 ============

        // 加载部门数据
        async function loadDepartments() {
            try {
                const result = await callWebMethod('GetDepartments');

                if (result && result.success && result.data) {
                    displayDepartments(result.data);
                    showMessage('部门数据加载成功！', 'success', 'departmentMessage');
                } else {
                    showMessage('加载部门数据失败: ' + (result?.message || '未知错误'), 'error', 'departmentMessage');
                }

            } catch (error) {
                console.error('加载部门数据失败:', error);
                showMessage('加载部门数据失败，请检查网络连接', 'error', 'departmentMessage');
            }
        }

        // 显示部门列表
        // 显示部门列表
        function displayDepartments(departments) {
            const tbody = document.getElementById('departmentList');
            if (!tbody) return;

            tbody.innerHTML = '';

            if (departments.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="6" style="text-align: center; padding: 50px; color: #95a5a6;">暂无部门数据</td>`;
                tbody.appendChild(row);
                return;
            }

            departments.forEach(dept => {
                const row = document.createElement('tr');
                const employeeCount = dept.EmployeeCount || 0;

                // 根据员工数量显示不同样式
                let countBadgeClass = 'badge-warning';
                let countText = `${employeeCount} 人`;

                if (employeeCount > 0) {
                    countBadgeClass = 'badge-primary';
                }

                // 处理经理显示
                let managerDisplay = '未指定';
                if (dept.ManagerName && dept.ManagerID) {
                    managerDisplay = `${dept.ManagerName} (${dept.ManagerID})`;
                }

                row.innerHTML = `
            <td>${dept.DepartmentID || ''}</td>
            <td><strong>${dept.DepartmentCode || ''}</strong></td>
            <td>${dept.DepartmentName || ''}</td>
            <td>${managerDisplay}</td>
            <td>
                <span class="badge ${countBadgeClass}">
                    ${countText}
                </span>
            </td>
            <td>
                <div class="btn-group" style="justify-content: flex-start;">
                    <button type="button" class="btn btn-primary" onclick="editDepartment(${dept.DepartmentID})" style="padding: 5px 10px; font-size: 12px;">
                        编辑
                    </button>
                    <button type="button" class="btn btn-danger" onclick="deleteDepartment(${dept.DepartmentID}, '${escapeHtml(dept.DepartmentName)}')" style="padding: 5px 10px; font-size: 12px;">
                        删除
                    </button>
                </div>
            </td>
        `;
                tbody.appendChild(row);
            });
        }

        // 转义HTML字符的函数
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // 搜索部门
        async function searchDepartments() {
            const keyword = document.getElementById('deptSearchKeyword')?.value.trim() || '';

            if (!keyword) {
                loadDepartments();
                return;
            }

            try {
                const result = await callWebMethod('SearchDepartments', { keyword });

                if (result && result.success && result.data) {
                    displayDepartments(result.data);
                    showMessage(`找到 ${result.data.length} 个部门`, 'success', 'departmentMessage');
                } else {
                    showMessage('搜索部门失败: ' + (result?.message || '未知错误'), 'error', 'departmentMessage');
                }

            } catch (error) {
                console.error('搜索部门失败:', error);
                showMessage('搜索部门失败，请检查网络连接', 'error', 'departmentMessage');
            }
        }

        // 重置部门搜索
        function resetDeptSearch() {
            document.getElementById('deptSearchKeyword').value = '';
            loadDepartments();
        }

        // 添加部门模态框
        async function addDepartmentModal() {
            // 清空表单
            document.getElementById('deptModalTitle').textContent = '添加部门';
            document.getElementById('deptCode').value = '';
            document.getElementById('deptName').value = '';
            document.getElementById('deptManager').value = '';
            document.getElementById('deptCode').readOnly = false;

            // 加载经理选项
            await loadManagersForSelect();

            // 显示模态框
            document.getElementById('departmentModal').style.display = 'flex';
        }

        // 编辑部门
        // 编辑部门
        async function editDepartment(departmentId) {
            try {
                const result = await callWebMethod('GetDepartmentById', { departmentId });

                console.log('编辑部门响应:', result);

                if (result && result.success && result.data) {
                    const dept = result.data;

                    // 填充表单
                    document.getElementById('deptModalTitle').textContent = '编辑部门';
                    document.getElementById('deptCode').value = dept.DepartmentCode || '';
                    document.getElementById('deptName').value = dept.DepartmentName || '';

                    // 存储部门ID
                    document.getElementById('deptCode').dataset.departmentId = departmentId;

                    // 加载经理选项
                    await loadManagersForSelect();

                    // 设置选中的经理（必须在加载选项之后）
                    setTimeout(() => {
                        const managerSelect = document.getElementById('deptManager');
                        if (managerSelect && dept.ManagerID) {
                            managerSelect.value = dept.ManagerID;
                        }
                    }, 100);

                    // 显示模态框
                    document.getElementById('departmentModal').style.display = 'flex';
                } else {
                    showMessage('获取部门信息失败: ' + (result?.message || '未知错误'), 'error', 'departmentMessage');
                }

            } catch (error) {
                console.error('编辑部门失败:', error);
                showMessage(`编辑失败: ${error.message}`, 'error', 'departmentMessage');
            }
        }

        // 加载经理选项
        async function loadManagersForSelect() {
            try {
                const result = await callWebMethod('GetManagersForSelect');

                if (result && result.success && result.data) {
                    const select = document.getElementById('deptManager');
                    if (select) {
                        // 保留当前选中的值
                        const currentValue = select.value;

                        // 生成选项HTML
                        let options = '<option value="">暂不指定</option>';
                        result.data.forEach(emp => {
                            options += `<option value="${emp.EmployeeID}">${emp.EmployeeName} (${emp.EmployeeID}) - 权限${emp.PermissionLevel}级</option>`;
                        });

                        select.innerHTML = options;

                        // 恢复之前选中的值
                        if (currentValue) {
                            select.value = currentValue;
                        }
                    }
                }

            } catch (error) {
                console.error('加载经理列表失败:', error);
            }
        }

        // 保存部门
        async function saveDepartment() {
            const isEdit = document.getElementById('deptModalTitle').textContent === '编辑部门';
            const departmentCode = document.getElementById('deptCode').value.trim();
            const departmentName = document.getElementById('deptName').value.trim();
            const managerId = document.getElementById('deptManager').value.trim();

            // 验证必填字段
            if (!departmentCode) {
                showMessage('部门代码不能为空！', 'error', 'deptModalMessage');
                return;
            }

            if (!departmentName) {
                showMessage('部门名称不能为空！', 'error', 'deptModalMessage');
                return;
            }

            // 验证部门代码格式
            if (!/^[A-Za-z0-9]+$/.test(departmentCode)) {
                showMessage('部门代码只能包含字母和数字！', 'error', 'deptModalMessage');
                return;
            }

            try {
                showMessage('正在保存...', 'success', 'deptModalMessage');

                if (isEdit) {
                    const departmentId = document.getElementById('deptCode').dataset.departmentId;

                    const result = await callWebMethod('UpdateDepartment', {
                        departmentId: parseInt(departmentId),
                        departmentCode: departmentCode,
                        departmentName: departmentName,
                        managerId: managerId || ''
                    });

                    console.log('更新部门结果:', result);

                    if (result && result.success) {
                        showMessage('部门信息更新成功！', 'success', 'deptModalMessage');
                        setTimeout(() => {
                            closeModal('departmentModal');
                            loadDepartments();
                        }, 1500);
                    } else {
                        showMessage('更新失败: ' + (result?.message || '未知错误'), 'error', 'deptModalMessage');
                    }
                } else {
                    const result = await callWebMethod('AddDepartment', {
                        departmentCode: departmentCode,
                        departmentName: departmentName,
                        managerId: managerId || ''
                    });

                    console.log('添加部门结果:', result);

                    if (result && result.success) {
                        showMessage('部门添加成功！', 'success', 'deptModalMessage');
                        setTimeout(() => {
                            closeModal('departmentModal');
                            loadDepartments();
                        }, 1500);
                    } else {
                        showMessage('添加失败: ' + (result?.message || '未知错误'), 'error', 'deptModalMessage');
                    }
                }

            } catch (error) {
                console.error('保存部门失败:', error);
                showMessage(`保存失败: ${error.message}`, 'error', 'deptModalMessage');
            }
        }

        // 删除部门
        async function deleteDepartment(departmentId, departmentName) {
            if (!confirm(`确定要删除部门 "${departmentName}" 吗？此操作不可恢复！`)) {
                return;
            }

            try {
                const result = await callWebMethod('DeleteDepartment', { departmentId });

                console.log('删除部门结果:', result);

                if (result && result.success) {
                    showMessage(`部门 "${departmentName}" 删除成功！`, 'success', 'departmentMessage');
                    loadDepartments();
                } else {
                    showMessage(`删除失败: ${result?.message || '未知错误'}`, 'error', 'departmentMessage');
                }

            } catch (error) {
                console.error('删除部门失败:', error);
                showMessage(`删除失败: ${error.message}`, 'error', 'departmentMessage');
            }
        }

// 在showTab函数中添加部门管理标签页的逻辑
// 修改现有的showTab函数，在case 'department'分支中：

    </script>
</body>
</html>