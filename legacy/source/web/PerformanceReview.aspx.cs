using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Collections.Generic;
using System.Linq;

namespace WebApplication1
{
    public partial class PerformanceReview : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // 权限验证
                if (Session["EmployeeID"] == null || Session["PermissionLevel"] == null || Convert.ToInt32(Session["PermissionLevel"]) != 2)
                {
                    Response.Redirect("WebForm2.aspx");
                    return;
                }

                LoadEmployeeDropdown();
                BindPerformanceData();
                LoadStatistics();
            }

            // 处理新增考核请求
            string eventArg = Request.Params["__EVENTARGUMENT"];
            if (!string.IsNullOrEmpty(eventArg) && eventArg == "NewReview")
            {
                PrepareNewReview();
            }
        }

        protected void LoadEmployeeDropdown()
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;
                string currentUserDept = Session["Department"]?.ToString();

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    // 获取当前用户所在部门的员工
                    string query = @"
                        SELECT EmployeeID, EmployeeName, Department 
                        FROM EmployeeUser 
                        WHERE Department = @Department 
                        AND IsActive = 1
                        ORDER BY EmployeeID";

                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@Department", currentUserDept);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    ddlEmployee.Items.Clear();
                    ddlEmployee.Items.Add(new ListItem("请选择员工", ""));

                    foreach (DataRow row in dt.Rows)
                    {
                        string employeeId = row["EmployeeID"].ToString();
                        string employeeName = row["EmployeeName"].ToString();
                        string department = row["Department"].ToString();
                        ddlEmployee.Items.Add(new ListItem($"{employeeName} ({employeeId}) - {department}", employeeId));
                    }
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('加载员工列表失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "LoadError", script);
            }
        }

        protected void BindPerformanceData()
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    // 查询所有绩效考核数据
                    string query = @"
                        SELECT 
                            pr.ReviewID,
                            pr.EmployeeID,
                            pr.EmployeeName,
                            pr.Department,
                            pr.ReviewPeriod,
                            pr.PerformanceScore,
                            pr.KPICompletion,
                            pr.WorkQuality,
                            pr.TeamworkScore,
                            pr.ReviewComments,
                            pr.ReviewerID,
                            pr.ReviewDate,
                            pr.Status
                        FROM PerformanceReviews pr
                        WHERE 1=1";  // 不限制部门

                    // 添加筛选条件
                    List<string> conditions = new List<string>();
                    List<SqlParameter> parameters = new List<SqlParameter>();

                    if (!string.IsNullOrEmpty(ddlStatus.SelectedValue))
                    {
                        conditions.Add("pr.Status = @Status");
                        parameters.Add(new SqlParameter("@Status", ddlStatus.SelectedValue));
                    }

                    if (!string.IsNullOrEmpty(ddlReviewPeriod.SelectedValue))
                    {
                        conditions.Add("pr.ReviewPeriod = @ReviewPeriod");
                        parameters.Add(new SqlParameter("@ReviewPeriod", ddlReviewPeriod.SelectedValue));
                    }

                    if (!string.IsNullOrEmpty(ddlPerformanceLevel.SelectedValue))
                    {
                        conditions.Add("pr.WorkQuality = @WorkQuality");
                        parameters.Add(new SqlParameter("@WorkQuality", ddlPerformanceLevel.SelectedValue));
                    }

                    if (!string.IsNullOrEmpty(txtSearch.Text))
                    {
                        conditions.Add("(pr.EmployeeName LIKE @Search OR pr.EmployeeID LIKE @Search)");
                        parameters.Add(new SqlParameter("@Search", "%" + txtSearch.Text + "%"));
                    }

                    if (conditions.Count > 0)
                    {
                        query += " AND " + string.Join(" AND ", conditions);
                    }

                    query += " ORDER BY pr.ReviewDate DESC";

                    SqlCommand cmd = new SqlCommand(query, conn);
                    foreach (var param in parameters)
                    {
                        cmd.Parameters.Add(param);
                    }

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    gvPerformanceReviews.DataSource = dt;
                    gvPerformanceReviews.DataBind();

                    lblTotal.Text = $"共 {dt.Rows.Count} 条记录";
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('加载数据失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "ErrorMessage", script);
            }
        }

        protected void LoadStatistics()
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    // 统计绩效考核数据
                    string query = @"
                        SELECT 
                            Status,
                            COUNT(*) as Count,
                            AVG(PerformanceScore) as AvgScore
                        FROM PerformanceReviews
                        GROUP BY Status";

                    SqlCommand cmd = new SqlCommand(query, conn);

                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();

                    int pending = 0, submitted = 0, reviewed = 0;
                    double totalAvgScore = 0;
                    int count = 0;

                    while (reader.Read())
                    {
                        string status = reader["Status"].ToString();
                        int statusCount = Convert.ToInt32(reader["Count"]);
                        double avgScore = reader["AvgScore"] != DBNull.Value ? Convert.ToDouble(reader["AvgScore"]) : 0;

                        switch (status)
                        {
                            case "待提交":
                                pending = statusCount;
                                break;
                            case "已提交":
                                submitted = statusCount;
                                break;
                            case "已审核":
                                reviewed = statusCount;
                                break;
                        }

                        totalAvgScore += avgScore * statusCount;
                        count += statusCount;
                    }

                    pendingCount.InnerText = pending.ToString();
                    submittedCount.InnerText = submitted.ToString();
                    reviewedCount.InnerText = reviewed.ToString();

                    double overallAvg = count > 0 ? totalAvgScore / count : 0;
                    avgScore.InnerText = overallAvg.ToString("F1");

                    reader.Close();
                }
            }
            catch (Exception ex)
            {
                // 静默处理统计加载错误
            }
        }

        // 这个方法是页面可以访问的公共方法
        public string GetScoreClass(object score)
        {
            if (score == null || score == DBNull.Value)
                return "score-average";

            double scoreValue = Convert.ToDouble(score);

            if (scoreValue >= 90) return "score-excellent";
            if (scoreValue >= 80) return "score-good";
            if (scoreValue >= 70) return "score-average";
            return "score-poor";
        }

        // 供前端调用的方法
        protected string GetScoreClassFromFrontend(object score)
        {
            return GetScoreClass(score);
        }

        protected void gvPerformanceReviews_RowCommand(object sender, GridViewCommandEventArgs e)
        {
            if (e.CommandName == "View")
            {
                int reviewId = Convert.ToInt32(e.CommandArgument);
                ShowReviewDetails(reviewId);
            }
            else if (e.CommandName == "Edit")
            {
                int reviewId = Convert.ToInt32(e.CommandArgument);
                LoadReviewForEdit(reviewId);
            }
            else if (e.CommandName == "Submit")
            {
                int reviewId = Convert.ToInt32(e.CommandArgument);
                SubmitPerformanceReview(reviewId);
            }
            else if (e.CommandName == "Delete")
            {
                int reviewId = Convert.ToInt32(e.CommandArgument);
                DeletePerformanceReview(reviewId);
            }

            upMain.Update();
        }

        private void ShowReviewDetails(int reviewId)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = "SELECT * FROM PerformanceReviews WHERE ReviewID = @ReviewID";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@ReviewID", reviewId);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    if (dt.Rows.Count > 0)
                    {
                        DataRow row = dt.Rows[0];

                        // 填充详情信息
                        detailEmployeeInfo.InnerText = $"{row["EmployeeName"]} ({row["EmployeeID"]}) - {row["Department"]}";
                        detailReviewPeriod.InnerText = row["ReviewPeriod"].ToString();
                        detailReviewDate.InnerText = Convert.ToDateTime(row["ReviewDate"]).ToString("yyyy-MM-dd");
                        detailStatus.InnerText = row["Status"].ToString();
                        txtDetailScore.Text = row["PerformanceScore"].ToString();
                        txtDetailKPI.Text = row["KPICompletion"].ToString();
                        txtDetailWorkQuality.Text = row["WorkQuality"].ToString();
                        txtDetailTeamwork.Text = row["TeamworkScore"].ToString();
                        txtDetailComments.Text = row["ReviewComments"].ToString();

                        // 考核人信息
                        if (!row.IsNull("ReviewerID") && !string.IsNullOrEmpty(row["ReviewerID"].ToString()))
                        {
                            reviewerInfo.Visible = true;
                            detailReviewer.InnerText = row["ReviewerID"].ToString();
                        }
                        else
                        {
                            reviewerInfo.Visible = false;
                        }

                        // 显示模态框并更新进度条
                        string script = @"
                            <script>
                                showDetailModal();
                                updateKPIProgress();
                            </script>";
                        ClientScript.RegisterStartupScript(this.GetType(), "ShowDetailModal", script);
                    }

                    upDetailModal.Update();
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('加载详情失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "LoadError", script);
            }
        }

        private void LoadReviewForEdit(int reviewId)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = "SELECT * FROM PerformanceReviews WHERE ReviewID = @ReviewID";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@ReviewID", reviewId);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    if (dt.Rows.Count > 0)
                    {
                        DataRow row = dt.Rows[0];

                        hdnEditReviewID.Value = reviewId.ToString();

                        // 设置员工下拉框
                        string employeeId = row["EmployeeID"].ToString();
                        string employeeName = row["EmployeeName"].ToString();
                        string department = row["Department"].ToString();
                        string displayText = $"{employeeName} ({employeeId}) - {department}";

                        // 先清空再添加
                        ddlEmployee.Items.Clear();
                        ddlEmployee.Items.Add(new ListItem(displayText, employeeId));

                        ddlModalReviewPeriod.SelectedValue = row["ReviewPeriod"].ToString();
                        txtPerformanceScore.Text = row["PerformanceScore"].ToString();
                        txtKPICompletion.Text = row["KPICompletion"].ToString();
                        ddlWorkQuality.SelectedValue = row["WorkQuality"].ToString();
                        txtTeamworkScore.Text = row["TeamworkScore"].ToString();
                        txtReviewComments.Text = row["ReviewComments"].ToString();

                        // 设置模态框标题
                        editModalTitle.InnerText = "编辑绩效考核";

                        // 显示模态框
                        string script = "<script>showEditModal();</script>";
                        ClientScript.RegisterStartupScript(this.GetType(), "ShowEditModal", script);
                    }

                    upEditModal.Update();
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('加载编辑信息失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "LoadError", script);
            }
        }

        protected void btnNewReview_Click(object sender, EventArgs e)
        {
            PrepareNewReview();
        }

        private void PrepareNewReview()
        {
            try
            {
                // 清空表单
                hdnEditReviewID.Value = "";
                LoadEmployeeDropdown();  // 重新加载员工下拉框
                ddlModalReviewPeriod.SelectedIndex = 0;
                txtPerformanceScore.Text = "";
                txtKPICompletion.Text = "";
                ddlWorkQuality.SelectedIndex = 0;
                txtTeamworkScore.Text = "";
                txtReviewComments.Text = "";

                // 设置模态框标题
                editModalTitle.InnerText = "新增绩效考核";

                // 使用简单的客户端回调显示模态框
                // 注册一个客户端脚本，在UpdatePanel更新后执行
                ScriptManager.RegisterStartupScript(
                    upEditModal,
                    upEditModal.GetType(),
                    "ShowEditModal",
                    "setTimeout(function() { document.getElementById('editModal').style.display = 'flex'; }, 100);",
                    true);

                // 更新UpdatePanel
                upEditModal.Update();
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('准备新增考核失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "PrepareError", script);
            }
        }

        private void SubmitPerformanceReview(int reviewId)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = @"
                        UPDATE PerformanceReviews 
                        SET Status = '已提交',
                            ReviewerID = @ReviewerID,
                            ReviewDate = GETDATE()
                        WHERE ReviewID = @ReviewID";

                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@ReviewerID", Session["EmployeeID"]);
                    cmd.Parameters.AddWithValue("@ReviewID", reviewId);

                    conn.Open();
                    cmd.ExecuteNonQuery();

                    string script = "<script>alert('提交成功！绩效考核已提交');</script>";
                    ClientScript.RegisterStartupScript(this.GetType(), "SubmitSuccess", script);

                    BindPerformanceData();
                    LoadStatistics();
                    upMain.Update();
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('提交失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "SubmitError", script);
            }
        }

        private void DeletePerformanceReview(int reviewId)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = "DELETE FROM PerformanceReviews WHERE ReviewID = @ReviewID";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@ReviewID", reviewId);

                    conn.Open();
                    int rowsAffected = cmd.ExecuteNonQuery();

                    if (rowsAffected > 0)
                    {
                        string script = "<script>alert('删除成功！');</script>";
                        ClientScript.RegisterStartupScript(this.GetType(), "DeleteSuccess", script);

                        BindPerformanceData();
                        LoadStatistics();
                        upMain.Update();
                    }
                    else
                    {
                        string script = "<script>alert('删除失败：考核记录不存在！');</script>";
                        ClientScript.RegisterStartupScript(this.GetType(), "DeleteFail", script);
                    }
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('删除失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "DeleteError", script);
            }
        }

        protected void btnSaveReview_Click(object sender, EventArgs e)
        {
            if (Page.IsValid)
            {
                try
                {
                    string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;
                    string selectedEmployeeId = ddlEmployee.SelectedValue;

                    // 获取员工信息
                    string employeeName = "";
                    string department = "";

                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        string employeeQuery = "SELECT EmployeeName, Department FROM EmployeeUser WHERE EmployeeID = @EmployeeID";
                        SqlCommand employeeCmd = new SqlCommand(employeeQuery, conn);
                        employeeCmd.Parameters.AddWithValue("@EmployeeID", selectedEmployeeId);

                        conn.Open();
                        SqlDataReader reader = employeeCmd.ExecuteReader();
                        if (reader.Read())
                        {
                            employeeName = reader["EmployeeName"].ToString();
                            department = reader["Department"].ToString();
                        }
                        reader.Close();

                        // 检查是否已存在相同周期的考核
                        if (string.IsNullOrEmpty(hdnEditReviewID.Value))
                        {
                            string checkQuery = @"
                                SELECT COUNT(*) 
                                FROM PerformanceReviews 
                                WHERE EmployeeID = @EmployeeID 
                                AND ReviewPeriod = @ReviewPeriod";

                            SqlCommand checkCmd = new SqlCommand(checkQuery, conn);
                            checkCmd.Parameters.AddWithValue("@EmployeeID", selectedEmployeeId);
                            checkCmd.Parameters.AddWithValue("@ReviewPeriod", ddlModalReviewPeriod.SelectedValue);

                            int count = (int)checkCmd.ExecuteScalar();
                            if (count > 0)
                            {
                                string script = "<script>alert('该员工在此考核周期已存在考核记录！');</script>";
                                ClientScript.RegisterStartupScript(this.GetType(), "DuplicateError", script);
                                return;
                            }
                        }

                        // 保存或更新考核记录
                        if (!string.IsNullOrEmpty(hdnEditReviewID.Value))
                        {
                            // 更新考核记录
                            string updateQuery = @"
                                UPDATE PerformanceReviews SET 
                                    EmployeeID = @EmployeeID,
                                    EmployeeName = @EmployeeName,
                                    Department = @Department,
                                    ReviewPeriod = @ReviewPeriod,
                                    PerformanceScore = @PerformanceScore,
                                    KPICompletion = @KPICompletion,
                                    WorkQuality = @WorkQuality,
                                    TeamworkScore = @TeamworkScore,
                                    ReviewComments = @ReviewComments,
                                    ReviewDate = GETDATE()
                                WHERE ReviewID = @ReviewID";

                            SqlCommand cmd = new SqlCommand(updateQuery, conn);
                            AddReviewParameters(cmd, selectedEmployeeId, employeeName, department);
                            cmd.Parameters.AddWithValue("@ReviewID", Convert.ToInt32(hdnEditReviewID.Value));

                            cmd.ExecuteNonQuery();
                        }
                        else
                        {
                            // 插入新考核记录
                            string insertQuery = @"
                                INSERT INTO PerformanceReviews 
                                (EmployeeID, EmployeeName, Department, ReviewPeriod, 
                                 PerformanceScore, KPICompletion, WorkQuality, TeamworkScore, 
                                 ReviewComments, ReviewerID, ReviewDate, Status)
                                VALUES 
                                (@EmployeeID, @EmployeeName, @Department, @ReviewPeriod,
                                 @PerformanceScore, @KPICompletion, @WorkQuality, @TeamworkScore,
                                 @ReviewComments, @ReviewerID, GETDATE(), '待提交')";

                            SqlCommand cmd = new SqlCommand(insertQuery, conn);
                            AddReviewParameters(cmd, selectedEmployeeId, employeeName, department);
                            cmd.Parameters.AddWithValue("@ReviewerID", Session["EmployeeID"]);

                            cmd.ExecuteNonQuery();
                        }
                    }

                    string closeScript = @"
                        <script>
                            closeEditModal();
                            alert('保存成功！');
                        </script>";
                    ClientScript.RegisterStartupScript(this.GetType(), "SaveSuccess", closeScript);

                    BindPerformanceData();
                    LoadStatistics();
                    upMain.Update();
                }
                catch (Exception ex)
                {
                    string script = $"<script>alert('保存失败: {ex.Message.Replace("'", "\\'")}');</script>";
                    ClientScript.RegisterStartupScript(this.GetType(), "SaveError", script);
                }
            }
        }

        private void AddReviewParameters(SqlCommand cmd, string employeeId, string employeeName, string department)
        {
            cmd.Parameters.AddWithValue("@EmployeeID", employeeId);
            cmd.Parameters.AddWithValue("@EmployeeName", employeeName);
            cmd.Parameters.AddWithValue("@Department", department);
            cmd.Parameters.AddWithValue("@ReviewPeriod", ddlModalReviewPeriod.SelectedValue);
            cmd.Parameters.AddWithValue("@PerformanceScore", Convert.ToDouble(txtPerformanceScore.Text));
            cmd.Parameters.AddWithValue("@KPICompletion", Convert.ToInt32(txtKPICompletion.Text));
            cmd.Parameters.AddWithValue("@WorkQuality", ddlWorkQuality.SelectedValue);
            cmd.Parameters.AddWithValue("@TeamworkScore", Convert.ToInt32(txtTeamworkScore.Text));
            cmd.Parameters.AddWithValue("@ReviewComments", txtReviewComments.Text);
        }

        protected void ddlStatus_SelectedIndexChanged(object sender, EventArgs e)
        {
            BindPerformanceData();
            LoadStatistics();
            upMain.Update();
        }

        protected void ddlReviewPeriod_SelectedIndexChanged(object sender, EventArgs e)
        {
            BindPerformanceData();
            LoadStatistics();
            upMain.Update();
        }

        protected void ddlPerformanceLevel_SelectedIndexChanged(object sender, EventArgs e)
        {
            BindPerformanceData();
            upMain.Update();
        }

        protected void btnSearch_Click(object sender, EventArgs e)
        {
            BindPerformanceData();
            LoadStatistics();
            upMain.Update();
        }

        protected void btnReset_Click(object sender, EventArgs e)
        {
            ddlStatus.SelectedIndex = 0;
            ddlReviewPeriod.SelectedIndex = 0;
            ddlPerformanceLevel.SelectedIndex = 0;
            txtSearch.Text = "";
            BindPerformanceData();
            LoadStatistics();
            upMain.Update();
        }

        protected void gvPerformanceReviews_PageIndexChanging(object sender, GridViewPageEventArgs e)
        {
            gvPerformanceReviews.PageIndex = e.NewPageIndex;
            BindPerformanceData();
            upMain.Update();
        }

        protected void btnExport_Click(object sender, EventArgs e)
        {
            try
            {
                // Excel导出逻辑
                Response.Clear();
                Response.Buffer = true;
                Response.ContentType = "application/vnd.ms-excel";
                Response.AddHeader("content-disposition", "attachment;filename=绩效考核报表.xls");
                Response.Charset = "utf-8";
                Response.ContentEncoding = System.Text.Encoding.UTF8;

                gvPerformanceReviews.AllowPaging = false;
                BindPerformanceData();

                System.IO.StringWriter sw = new System.IO.StringWriter();
                System.Web.UI.HtmlTextWriter hw = new System.Web.UI.HtmlTextWriter(sw);
                gvPerformanceReviews.RenderControl(hw);

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
                gvPerformanceReviews.AllowPaging = true;
            }
        }

        protected void btnPrint_Click(object sender, EventArgs e)
        {
            string script = "<script>window.print();</script>";
            ClientScript.RegisterStartupScript(this.GetType(), "PrintPage", script);
        }

        public override void VerifyRenderingInServerForm(Control control)
        {
            // 解决GridView导出Excel时的警告
        }
    }
}