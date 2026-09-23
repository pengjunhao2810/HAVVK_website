using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace WebApplication1
{
    public partial class DepartmentReport : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            System.Diagnostics.Debug.WriteLine("=== Page_Load 开始 ===");
            System.Diagnostics.Debug.WriteLine($"IsPostBack: {IsPostBack}");

            if (!IsPostBack)
            {
                // 打印所有Session值
                System.Diagnostics.Debug.WriteLine("Session内容:");
                System.Diagnostics.Debug.WriteLine($"EmployeeID: {Session["EmployeeID"]?.ToString() ?? "NULL"}");
                System.Diagnostics.Debug.WriteLine($"PermissionLevel: {Session["PermissionLevel"]?.ToString() ?? "NULL"}");
                System.Diagnostics.Debug.WriteLine($"Department: {Session["Department"]?.ToString() ?? "NULL"}");
                System.Diagnostics.Debug.WriteLine($"UserName: {Session["UserName"]?.ToString() ?? "NULL"}");

                // 权限验证：只允许权限等级2的用户访问
                if (Session["EmployeeID"] == null)
                {
                    System.Diagnostics.Debug.WriteLine("权限验证失败: EmployeeID为空，跳转到登录页");
                    Response.Redirect("WebForm2.aspx");
                    return;
                }

                if (Session["PermissionLevel"] == null || Convert.ToInt32(Session["PermissionLevel"]) != 2)
                {
                    System.Diagnostics.Debug.WriteLine("权限验证失败: 权限等级不是2，跳转到无权限页");
                    Response.Redirect("WebForm4.aspx");
                    return;
                }

                // 检查Department是否为空
                string department = Session["Department"]?.ToString();
                if (string.IsNullOrEmpty(department))
                {
                    System.Diagnostics.Debug.WriteLine("警告: Session[\"Department\"]为空，使用默认值");
                    // 可以尝试从数据库获取部门信息
                    department = GetDepartmentFromDatabase();
                    if (!string.IsNullOrEmpty(department))
                    {
                        Session["Department"] = department;
                        System.Diagnostics.Debug.WriteLine($"从数据库获取部门: {department}");
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine("无法获取部门信息");
                    }
                }

                System.Diagnostics.Debug.WriteLine($"将加载部门数据: {department}");

                // 加载部门统计数据
                LoadDepartmentOverview();
                LoadDepartmentData();
            }

            System.Diagnostics.Debug.WriteLine("=== Page_Load 结束 ===");
        }

        private string GetDepartmentFromDatabase()
        {
            try
            {
                string employeeID = Session["EmployeeID"]?.ToString();
                if (string.IsNullOrEmpty(employeeID))
                    return null;

                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;
                string query = "SELECT Department FROM EmployeeUser WHERE EmployeeID = @EmployeeID";

                using (SqlConnection conn = new SqlConnection(connectionString))
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@EmployeeID", employeeID);
                    conn.Open();
                    var result = cmd.ExecuteScalar();
                    return result?.ToString();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"获取部门信息错误: {ex.Message}");
                return null;
            }
        }

        protected void LoadDepartmentOverview()
        {
            try
            {
                string department = Session["Department"]?.ToString();
                if (string.IsNullOrEmpty(department))
                {
                    SetDefaultValues();
                    return;
                }

                System.Diagnostics.Debug.WriteLine($"=== 为部门 {department} 加载数据 ===");

                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // 使用一个查询获取所有统计数据，提高效率
                    string comprehensiveQuery = @"
                -- 部门总人数
                SELECT 
                    (SELECT COUNT(*) 
                     FROM EmployeeUser 
                     WHERE Department = @Department AND IsActive = 1) as TotalEmployees,
                    
                    -- 平均绩效（优先使用已审核数据，如果没有则使用所有数据）
                    ISNULL(
                        (SELECT AVG(PerformanceScore) 
                         FROM PerformanceReviews 
                         WHERE Department = @Department AND Status = '已审核'),
                        (SELECT AVG(PerformanceScore) 
                         FROM PerformanceReviews 
                         WHERE Department = @Department)
                    ) as AvgPerformance,
                    
                    -- KPI完成率（同样的逻辑）
                    ISNULL(
                        (SELECT AVG(KPICompletion) 
                         FROM PerformanceReviews 
                         WHERE Department = @Department AND Status = '已审核'),
                        (SELECT AVG(KPICompletion) 
                         FROM PerformanceReviews 
                         WHERE Department = @Department)
                    ) as AvgKPI,
                    
                    -- 检查是否有绩效数据
                    (SELECT COUNT(*) 
                     FROM PerformanceReviews 
                     WHERE Department = @Department) as HasPerformanceData";

                    SqlCommand cmd = new SqlCommand(comprehensiveQuery, conn);
                    cmd.Parameters.AddWithValue("@Department", department);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            // 部门总人数
                            int totalCount = reader.GetInt32(0);
                            totalEmployees.InnerText = totalCount.ToString();
                            System.Diagnostics.Debug.WriteLine($"部门总人数: {totalCount}");

                            // 平均绩效
                            if (!reader.IsDBNull(1))
                            {
                                double avgPerformanceValue = reader.GetDouble(1);
                                avgPerformance.InnerText = avgPerformanceValue.ToString("F1");
                                System.Diagnostics.Debug.WriteLine($"平均绩效: {avgPerformanceValue}");
                            }
                            else
                            {
                                avgPerformance.InnerText = "0.0";
                                System.Diagnostics.Debug.WriteLine("平均绩效: 无数据");
                            }

                            // KPI完成率
                            if (!reader.IsDBNull(2))
                            {
                                double kpiValue = reader.GetDouble(2);
                                kpiRate.InnerText = kpiValue.ToString("F1") + "%";
                                System.Diagnostics.Debug.WriteLine($"KPI完成率: {kpiValue}%");
                            }
                            else
                            {
                                kpiRate.InnerText = "0%";
                                System.Diagnostics.Debug.WriteLine("KPI完成率: 无数据");
                            }

                            // 检查是否有数据
                            int hasData = reader.GetInt32(3);
                            System.Diagnostics.Debug.WriteLine($"绩效数据记录数: {hasData}");
                        }
                    }

                    conn.Close();
                }

                // 设置模拟数据（如果数据库没有数据）
                if (avgPerformance.InnerText == "0.0" || kpiRate.InnerText == "0%")
                {
                    System.Diagnostics.Debug.WriteLine("使用模拟数据");
                    SetSimulatedData();
                }
                else
                {
                    // 设置其他模拟数据（考勤和请假）
                    attendanceRate.InnerText = "96.5%";
                    leaveCount.InnerText = "8";
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"错误: {ex.Message}");
                SetDefaultValues();
            }
        }

        private void SetSimulatedData()
        {
            // 基于部门总人数生成模拟数据
            if (int.TryParse(totalEmployees.InnerText, out int employeeCount) && employeeCount > 0)
            {
                Random rnd = new Random();

                // 平均绩效：70-95之间
                double avgPerf = 70 + rnd.NextDouble() * 25;
                avgPerformance.InnerText = avgPerf.ToString("F1");

                // KPI完成率：75-98之间
                double kpiRateValue = 75 + rnd.NextDouble() * 23;
                kpiRate.InnerText = kpiRateValue.ToString("F1") + "%";

                // 考勤率：90-99之间
                double attendance = 90 + rnd.NextDouble() * 9;
                attendanceRate.InnerText = attendance.ToString("F1") + "%";

                // 请假人数：基于总人数的10-30%
                int leaveDays = (int)(employeeCount * (0.1 + rnd.NextDouble() * 0.2));
                leaveCount.InnerText = leaveDays.ToString();

                System.Diagnostics.Debug.WriteLine($"使用模拟数据: 绩效={avgPerf:F1}, KPI={kpiRateValue:F1}%");
            }
            else
            {
                // 如果连员工数都没有，使用默认值
                SetDefaultValues();
            }
        }

        private void SetDefaultValues()
        {
            totalEmployees.InnerText = "15";
            avgPerformance.InnerText = "87.2";
            attendanceRate.InnerText = "96.5%";
            leaveCount.InnerText = "8";
            kpiRate.InnerText = "92.3%";
        }

        protected void LoadDepartmentData()
        {
            try
            {
                string department = Session["Department"]?.ToString();
                if (string.IsNullOrEmpty(department))
                    return;

                DataTable dt = new DataTable();

                // 创建列
                dt.Columns.Add("EmployeeID", typeof(string));
                dt.Columns.Add("EmployeeName", typeof(string));
                dt.Columns.Add("PerformanceScore", typeof(double));
                dt.Columns.Add("WorkQuality", typeof(string));
                dt.Columns.Add("KPICompletion", typeof(double));
                dt.Columns.Add("AttendanceRate", typeof(double));
                dt.Columns.Add("LeaveDays", typeof(int));
                dt.Columns.Add("LastUpdate", typeof(DateTime));

                // 添加示例数据
                dt.Rows.Add("E2024009", "常睿", 88.00, "良好", 92.0, 96.5, 1, DateTime.Now.AddDays(-2));
                dt.Rows.Add("E2024016", "Iwasaki Airi", 87.0, "良好", 91.0, 94.2, 2, DateTime.Now.AddDays(-3));
                dt.Rows.Add("E2024003", "Kudo Airi", 86.0, "良好", 90.0, 98.7, 0, DateTime.Now.AddDays(-1));
                dt.Rows.Add("E2024012", "Ogawa Shino", 92.5, "优秀", 95.0, 89.3, 4, DateTime.Now.AddDays(-5));
                dt.Rows.Add("E2024013", "蔡云熙", 85.5, "良好", 88.0, 97.1, 1, DateTime.Now.AddDays(-2));
                dt.Rows.Add("E2024011", "徐璐", 65.0, "待改进", 70.0, 92.8, 2, DateTime.Now.AddDays(-4));
                dt.Rows.Add("E2024001", "Hirano Yuna", 94.5, "优秀", 97.0, 95.6, 1, DateTime.Now.AddDays(-1));
                dt.Rows.Add("E2024015", "谭宇宁", 76.0, "一般", 80.0, 85.4, 5, DateTime.Now.AddDays(-6));
                dt.Rows.Add("E2024005", "袁致远", 78.5, "一般", 82.0, 93.9, 1, DateTime.Now.AddDays(-3));
                dt.Rows.Add("E2024007s", "Watanabe Aoi", 96.0, "优秀", 99.0, 90.2, 3, DateTime.Now.AddDays(-4));

                // 应用筛选条件
                if (!string.IsNullOrEmpty(ddlDataType.SelectedValue))
                {
                    DataView dv = new DataView(dt);
                    switch (ddlDataType.SelectedValue)
                    {
                        case "performance":
                            dv.Sort = "PerformanceScore DESC";
                            break;
                        case "attendance":
                            dv.Sort = "AttendanceRate DESC";
                            break;
                        case "leave":
                            dv.Sort = "LeaveDays ASC";
                            break;
                    }
                    dt = dv.ToTable();
                }

                gvDepartmentData.DataSource = dt;
                gvDepartmentData.DataBind();

                // 更新最后更新时间
                lastUpdateTime.InnerText = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("加载部门数据错误: " + ex.Message);
            }
        }

        protected void ddlTimeRange_SelectedIndexChanged(object sender, EventArgs e)
        {
            LoadDepartmentData();
        }

        protected void ddlDataType_SelectedIndexChanged(object sender, EventArgs e)
        {
            LoadDepartmentData();
        }

        protected void btnSearch_Click(object sender, EventArgs e)
        {
            LoadDepartmentOverview();
            LoadDepartmentData();
        }

        protected void btnExportExcel_Click(object sender, EventArgs e)
        {
            try
            {
                // Excel导出逻辑
                Response.Clear();
                Response.Buffer = true;
                Response.ContentType = "application/vnd.ms-excel";
                Response.AddHeader("content-disposition", "attachment;filename=部门数据报表_" + DateTime.Now.ToString("yyyyMMdd") + ".xls");
                Response.Charset = "utf-8";
                Response.ContentEncoding = System.Text.Encoding.UTF8;

                gvDepartmentData.AllowPaging = false;
                LoadDepartmentData();

                System.IO.StringWriter sw = new System.IO.StringWriter();
                System.Web.UI.HtmlTextWriter hw = new System.Web.UI.HtmlTextWriter(sw);
                gvDepartmentData.RenderControl(hw);

                Response.Write(sw.ToString());
                Response.Flush();
                Response.End();
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('导出失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "ExportError", script);
            }
            finally
            {
                gvDepartmentData.AllowPaging = true;
            }
        }

        protected void btnPrintReport_Click(object sender, EventArgs e)
        {
            string script = "<script>window.print();</script>";
            ClientScript.RegisterStartupScript(this.GetType(), "PrintPage", script);
        }

        protected void btnGenerateSummary_Click(object sender, EventArgs e)
        {
            string summary = GenerateDepartmentSummary();
            string script = $"<script>alert('部门总结已生成！\\n\\n{summary}');</script>";
            ClientScript.RegisterStartupScript(this.GetType(), "SummaryAlert", script);
        }

        protected void gvDepartmentData_PageIndexChanging(object sender, GridViewPageEventArgs e)
        {
            gvDepartmentData.PageIndex = e.NewPageIndex;
            LoadDepartmentData();
        }

        // 辅助方法：获取状态CSS类
        public string GetStatusClass(object status)
        {
            if (status == null || status == DBNull.Value)
                return "status-tag status-average";

            string statusText = status.ToString();
            switch (statusText)
            {
                case "优秀": return "status-tag status-excellent";
                case "良好": return "status-tag status-good";
                case "一般": return "status-tag status-average";
                case "待改进": return "status-tag status-poor";
                default: return "status-tag status-average";
            }
        }

        // 生成部门总结
        // 生成部门总结
        private string GenerateDepartmentSummary()
        {
            try
            {
                string department = Session["Department"]?.ToString();
                string currentTime = DateTime.Now.ToString("yyyy年MM月dd日");

                // 获取数据
                int total = int.Parse(totalEmployees.InnerText);
                double avgScore = double.Parse(avgPerformance.InnerText);
                string kpi = kpiRate.InnerText;
                string attendance = attendanceRate.InnerText;
                int leave = int.Parse(leaveCount.InnerText);

                // 生成总结
                string summary = $"【{department}部门工作总结】\n" +
                                $"生成时间：{currentTime}\n\n" +
                                $"📊 部门概况：\n" +
                                $"• 部门总人数：{total}人\n" +
                                $"• 平均绩效分：{avgScore}分\n" +
                                $"• KPI达成率：{kpi}\n" +
                                $"• 平均出勤率：{attendance}\n" +
                                $"• 本月请假：{leave}人次\n\n" +
                                $"📈 表现分析：\n";

                if (avgScore >= 90)
                    summary += "• 绩效表现：优秀，超出预期目标\n";
                else if (avgScore >= 80)
                    summary += "• 绩效表现：良好，达到预期目标\n";
                else if (avgScore >= 70)
                    summary += "• 绩效表现：一般，需要改进\n";
                else
                    summary += "• 绩效表现：待改进，需重点关注\n";

                // 修正这里的代码：移除百分号并转换为数值比较
                string attendanceValueStr = attendance.Replace("%", "").Trim();
                if (double.TryParse(attendanceValueStr, out double attendanceValue))
                {
                    if (attendanceValue >= 95)
                        summary += "• 出勤情况：优秀，员工出勤良好\n";
                    else if (attendanceValue >= 90)
                        summary += "• 出勤情况：良好\n";
                    else
                        summary += "• 出勤情况：需要关注\n";
                }
                else
                {
                    summary += "• 出勤情况：数据异常\n";
                }

                summary += $"\n🎯 建议措施：\n" +
                          $"1. 保持现有优秀表现\n" +
                          $"2. 关注绩效待改进员工\n" +
                          $"3. 优化工作流程提高效率";

                return summary;
            }
            catch
            {
                return "无法生成总结，请检查数据是否完整";
            }
        }

        public override void VerifyRenderingInServerForm(Control control)
        {
            // 解决GridView导出Excel时的警告
        }
    }
}