<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="DepartmentReport.aspx.cs" Inherits="WebApplication1.DepartmentReport" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>部门报表 - 哈夫克集团</title>
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
        
        /* 数据概览卡片 */
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .overview-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border-left: 5px solid #8e2de2;
        }
        
        .overview-icon {
            font-size: 32px;
            margin-bottom: 15px;
            color: #8e2de2;
        }
        
        .overview-value {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .overview-label {
            color: #718096;
            font-size: 14px;
        }
        
        /* 数据图表区域 */
        .charts-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .chart-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border: 1px solid #eee;
        }
        
        .chart-title {
            font-size: 16px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        /* 快速操作按钮 */
        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .action-btn {
            background: white;
            border: 2px solid transparent;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .action-btn:hover {
            transform: translateY(-5px);
            border-color: #8e2de2;
            box-shadow: 0 10px 25px rgba(142, 45, 226, 0.15);
        }
        
        .action-icon {
            font-size: 40px;
            margin-bottom: 15px;
            color: #8e2de2;
        }
        
        .action-text {
            font-size: 16px;
            font-weight: 500;
            color: #2c3e50;
        }
        
        .action-desc {
            font-size: 12px;
            color: #718096;
            margin-top: 8px;
        }
        
        /* 数据表格 */
        .table-container {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            margin-top: 30px;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .data-table th,
        .data-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .data-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
            position: sticky;
            top: 0;
        }
        
        .data-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        /* 状态标签 */
        .status-tag {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .status-excellent { background: #d4edda; color: #155724; }
        .status-good { background: #d1ecf1; color: #0c5460; }
        .status-average { background: #fff3cd; color: #856404; }
        .status-poor { background: #f8d7da; color: #721c24; }
        
        /* 操作按钮 */
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
        
        .btn-export {
            background: #28a745;
            color: white;
        }
        
        .btn-print {
            background: #ffc107;
            color: #212529;
        }
        
        .action-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        /* 页面底部 */
        .page-footer {
            text-align: center;
            padding: 20px 0;
            color: #718096;
            font-size: 14px;
            margin-top: 30px;
            border-top: 1px solid #eee;
        }
        
        @media (max-width: 768px) {
            .charts-container,
            .quick-actions,
            .overview-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
    <!-- Chart.js 库 -->
    <script src="../Content/chart.min.js"></script>
    <link rel="stylesheet" href="../Content/havvk-theme.css" />
    </head>
<body>
    <form id="form1" runat="server">
        <asp:ScriptManager ID="ScriptManager1" runat="server"></asp:ScriptManager>
        
        <div class="header">
            <div class="container">
                <div class="header-content">
                    <h1>部门数据报表</h1>
                    <div>
                        <a href="WebForm4.aspx" class="back-btn">返回主管门户</a>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="container">
            <asp:UpdatePanel ID="upMain" runat="server" UpdateMode="Conditional">
                <ContentTemplate>
                    <div class="main-content">
                        <h2 class="section-title">📊 部门数据报表</h2>
                        
                        <!-- 筛选栏 -->
                        <div class="filter-bar">
                            <div class="filter-item">
                                <label>时间范围</label>
                                <asp:DropDownList ID="ddlTimeRange" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlTimeRange_SelectedIndexChanged">
                                    <asp:ListItem Value="">全部时间</asp:ListItem>
                                    <asp:ListItem Value="month">本月数据</asp:ListItem>
                                    <asp:ListItem Value="quarter">本季度</asp:ListItem>
                                    <asp:ListItem Value="year">本年度</asp:ListItem>
                                    <asp:ListItem Value="custom">自定义</asp:ListItem>
                                </asp:DropDownList>
                            </div>
                            
                            <div class="filter-item">
                                <label>数据类型</label>
                                <asp:DropDownList ID="ddlDataType" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlDataType_SelectedIndexChanged">
                                    <asp:ListItem Value="">全部数据</asp:ListItem>
                                    <asp:ListItem Value="performance">绩效数据</asp:ListItem>
                                    <asp:ListItem Value="attendance">考勤数据</asp:ListItem>
                                    <asp:ListItem Value="leave">请假数据</asp:ListItem>
                                </asp:DropDownList>
                            </div>
                            
                            <asp:Button ID="btnSearch" runat="server" Text="刷新数据" CssClass="search-btn" OnClick="btnSearch_Click" />
                        </div>
                        
                        <!-- 数据概览 -->
                        <div class="overview-grid">
                            <div class="overview-card">
                                <div class="overview-icon">👥</div>
                                <div class="overview-value" id="totalEmployees" runat="server">0</div>
                                <div class="overview-label">部门总人数</div>
                            </div>
                            
                            <div class="overview-card">
                                <div class="overview-icon">⭐</div>
                                <div class="overview-value" id="avgPerformance" runat="server">0.0</div>
                                <div class="overview-label">平均绩效分</div>
                            </div>
                            
                            <div class="overview-card">
                                <div class="overview-icon">📅</div>
                                <div class="overview-value" id="attendanceRate" runat="server">0%</div>
                                <div class="overview-label">出勤率</div>
                            </div>
                            
                            <div class="overview-card">
                                <div class="overview-icon">📋</div>
                                <div class="overview-value" id="leaveCount" runat="server">0</div>
                                <div class="overview-label">本月请假</div>
                            </div>
                            
                            <div class="overview-card">
                                <div class="overview-icon">🎯</div>
                                <div class="overview-value" id="kpiRate" runat="server">0%</div>
                                <div class="overview-label">KPI达成率</div>
                            </div>
                        </div>
                        
                        <!-- 操作按钮 -->
                        <div class="action-buttons">
                            <asp:Button ID="btnExportExcel" runat="server" Text="导出Excel" CssClass="btn btn-export" OnClick="btnExportExcel_Click" />
                            <asp:Button ID="btnPrintReport" runat="server" Text="打印报表" CssClass="btn btn-print" OnClick="btnPrintReport_Click" />
                            <asp:Button ID="btnGenerateSummary" runat="server" Text="生成总结" CssClass="btn btn-primary" OnClick="btnGenerateSummary_Click" />
                        </div>
                        
                        <!-- 图表展示 -->
                        <div class="charts-container">
                            <div class="chart-card">
                                <div class="chart-title">📈 绩效趋势分析</div>
                                <canvas id="performanceChart" height="200"></canvas>
                            </div>
                            
                            <div class="chart-card">
                                <div class="chart-title">📊 人员结构分析</div>
                                <canvas id="structureChart" height="200"></canvas>
                            </div>
                        </div>
                        
                        <!-- 快速操作 -->
                        <div class="quick-actions">
                            <div class="action-btn" onclick="showPerformanceReport()">
                                <div class="action-icon">📈</div>
                                <div class="action-text">绩效详情</div>
                                <div class="action-desc">查看详细绩效分析</div>
                            </div>
                            
                            <div class="action-btn" onclick="showAttendanceReport()">
                                <div class="action-icon">📅</div>
                                <div class="action-text">考勤分析</div>
                                <div class="action-desc">查看考勤统计</div>
                            </div>
                            
                            <div class="action-btn" onclick="showLeaveReport()">
                                <div class="action-icon">📋</div>
                                <div class="action-text">请假统计</div>
                                <div class="action-desc">请假数据汇总</div>
                            </div>
                            
                            <div class="action-btn" onclick="showEmployeeAnalysis()">
                                <div class="action-icon">👥</div>
                                <div class="action-text">员工分析</div>
                                <div class="action-desc">员工能力分析</div>
                            </div>
                        </div>
                        
                        <!-- 数据表格 -->
                        <div class="table-container">
                            <h3 style="color: #2c3e50; margin-bottom: 20px;">📋 部门数据明细</h3>
                            <div class="table-container">
                                <asp:GridView ID="gvDepartmentData" runat="server"
                                    CssClass="data-table"
                                    AutoGenerateColumns="False"
                                    AllowPaging="True"
                                    PageSize="10"
                                    OnPageIndexChanging="gvDepartmentData_PageIndexChanging"
                                    GridLines="None">
                                    <Columns>
                                        <asp:BoundField DataField="EmployeeID" HeaderText="工号" />
                                        <asp:BoundField DataField="EmployeeName" HeaderText="姓名" />
                                        <asp:BoundField DataField="PerformanceScore" HeaderText="绩效分数" />
                                        <asp:TemplateField HeaderText="绩效等级">
                                            <ItemTemplate>
                                                <span class='<%# GetStatusClass(Eval("WorkQuality")) %>'>
                                                    <%# Eval("WorkQuality") %>
                                                </span>
                                            </ItemTemplate>
                                        </asp:TemplateField>
                                        <asp:BoundField DataField="KPICompletion" HeaderText="KPI完成率" DataFormatString="{0}%" />
                                        <asp:BoundField DataField="AttendanceRate" HeaderText="出勤率" DataFormatString="{0}%" />
                                        <asp:BoundField DataField="LeaveDays" HeaderText="请假天数" />
                                        <asp:BoundField DataField="LastUpdate" HeaderText="更新日期" DataFormatString="{0:yyyy-MM-dd}" />
                                    </Columns>
                                    <PagerSettings Mode="NumericFirstLast" />
                                    <PagerStyle HorizontalAlign="Center" />
                                    <EmptyDataTemplate>
                                        <div style="text-align:center; padding: 40px; color: #718096;">
                                            <div style="font-size: 48px; margin-bottom: 20px;">📊</div>
                                            <h3>暂无数据</h3>
                                            <p>当前没有找到部门数据记录</p>
                                        </div>
                                    </EmptyDataTemplate>
                                </asp:GridView>
                            </div>
                        </div>
                        
                        <div class="page-footer">
                            <p>数据更新时间：<span id="lastUpdateTime" runat="server"><%= DateTime.Now.ToString("yyyy-MM-dd HH:mm") %></span></p>
                            <p style="margin-top: 5px; font-size: 12px;">© 2024 哈夫克集团 - 部门数据报表系统</p>
                        </div>
                    </div>
                </ContentTemplate>
            </asp:UpdatePanel>
        </div>
    </form>
    
    <script>
        // 全局变量存储图表实例
        var performanceChartInstance = null;
        var structureChartInstance = null;

        // 页面加载时初始化图表
        document.addEventListener('DOMContentLoaded', function () {
            initCharts();
        });

        // 初始化所有图表
        function initCharts() {
            initPerformanceChart();
            initStructureChart();
        }

        // 绩效趋势图
        function initPerformanceChart() {
            const ctx = document.getElementById('performanceChart');
            if (!ctx) return;

            // 销毁旧的图表实例
            if (performanceChartInstance) {
                performanceChartInstance.destroy();
                performanceChartInstance = null;
            }

            performanceChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                    datasets: [
                        {
                            label: '平均绩效分',
                            data: [87.5, 88.2, 89.0, 88.5, 89.2, 90.1],
                            borderColor: '#8e2de2',
                            backgroundColor: 'rgba(142, 45, 226, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: '部门目标',
                            data: [85, 85, 86, 86, 87, 87],
                            borderColor: '#28a745',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true, // 改为true，保持宽高比
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 80,
                            max: 95,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    }
                }
            });
        }

        // 人员结构图
        function initStructureChart() {
            const ctx = document.getElementById('structureChart');
            if (!ctx) return;

            // 销毁旧的图表实例
            if (structureChartInstance) {
                structureChartInstance.destroy();
                structureChartInstance = null;
            }

            structureChartInstance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['优秀', '良好', '一般', '待改进'],
                    datasets: [{
                        data: [4, 6, 3, 2],
                        backgroundColor: [
                            '#28a745',
                            '#20c997',
                            '#ffc107',
                            '#dc3545'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true, // 改为true
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }

    // UpdatePanel刷新后重新初始化图表
    var prm = Sys.WebForms.PageRequestManager.getInstance();
    prm.add_endRequest(function (sender, args) {
        if (args.get_error() == undefined) {
            // 延迟初始化，确保DOM已更新
            setTimeout(initCharts, 100);
        }
    });

    // 清理图表资源（页面离开时）
    window.addEventListener('beforeunload', function () {
        if (performanceChartInstance) {
            performanceChartInstance.destroy();
        }
        if (structureChartInstance) {
            structureChartInstance.destroy();
        }
    });
</script>

        // 人员结构图
        function initStructureChart() {
            const ctx = document.getElementById('structureChart').getContext('2d');
            if (window.structureChartInstance) {
                window.structureChartInstance.destroy();
            }
            window.structureChartInstance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['优秀', '良好', '一般', '待改进'],
                    datasets: [{
                        data: [4, 6, 3, 2],
                        backgroundColor: [
                            '#28a745',
                            '#20c997',
                            '#ffc107',
                            '#dc3545'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }

        // 快速操作函数
        function showPerformanceReport() {
            alert('绩效详情功能正在加载中...');
            // window.location.href = 'PerformanceReport.aspx';
        }

        function showAttendanceReport() {
            alert('考勤分析功能正在加载中...');
            // window.location.href = 'AttendanceReport.aspx';
        }

        function showLeaveReport() {
            alert('请假统计功能正在加载中...');
            // window.location.href = 'LeaveReport.aspx';
        }

        function showEmployeeAnalysis() {
            alert('员工分析功能正在加载中...');
            // window.location.href = 'EmployeeAnalysis.aspx';
        }

        // UpdatePanel刷新后重新初始化图表
        var prm = Sys.WebForms.PageRequestManager.getInstance();
        prm.add_endRequest(function (sender, args) {
            if (args.get_error() == undefined) {
                initCharts();
            }
        });
    </script>
</body>
</html>