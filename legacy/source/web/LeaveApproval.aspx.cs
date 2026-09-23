using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Collections.Generic;

namespace WebApplication1
{
    public partial class LeaveApproval : System.Web.UI.Page
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

                BindLeaveData();
                LoadStatistics();
            }
        }

        protected void BindLeaveData()
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    // 查询所有请假申请（不限制部门）
                    string query = @"
                        SELECT 
                            la.LeaveID,
                            la.EmployeeID,
                            la.EmployeeName,
                            la.Department,
                            la.LeaveType,
                            la.StartDate,
                            la.EndDate,
                            la.Days,
                            la.Reason,
                            la.Status,
                            la.ApplyTime,
                            la.ApproverID,
                            la.ApproveTime,
                            la.Remarks
                        FROM LeaveApplications la
                        WHERE 1=1";  // 修改：移除部门限制

                    // 添加筛选条件
                    List<string> conditions = new List<string>();
                    List<SqlParameter> parameters = new List<SqlParameter>();

                    if (!string.IsNullOrEmpty(ddlStatus.SelectedValue))
                    {
                        conditions.Add("la.Status = @Status");
                        parameters.Add(new SqlParameter("@Status", ddlStatus.SelectedValue));
                    }

                    if (!string.IsNullOrEmpty(ddlLeaveType.SelectedValue))
                    {
                        conditions.Add("la.LeaveType = @LeaveType");
                        parameters.Add(new SqlParameter("@LeaveType", ddlLeaveType.SelectedValue));
                    }

                    if (!string.IsNullOrEmpty(txtDateRange.Text))
                    {
                        conditions.Add("la.StartDate >= @DateRange");
                        parameters.Add(new SqlParameter("@DateRange", Convert.ToDateTime(txtDateRange.Text)));
                    }

                    if (!string.IsNullOrEmpty(txtSearch.Text))
                    {
                        conditions.Add("(la.EmployeeName LIKE @Search OR la.EmployeeID LIKE @Search)");
                        parameters.Add(new SqlParameter("@Search", "%" + txtSearch.Text + "%"));
                    }

                    // 如果需要限制部门，请取消注释下面两行，并将 currentUserDept 替换为实际部门
                    // conditions.Add("la.Department = @Department");
                    // parameters.Add(new SqlParameter("@Department", "您的部门名称"));

                    if (conditions.Count > 0)
                    {
                        query += " AND " + string.Join(" AND ", conditions);
                    }

                    query += " ORDER BY la.ApplyTime DESC";

                    SqlCommand cmd = new SqlCommand(query, conn);
                    foreach (var param in parameters)
                    {
                        cmd.Parameters.Add(param);
                    }

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    gvLeaveApplications.DataSource = dt;
                    gvLeaveApplications.DataBind();

                    lblTotal.Text = $"共 {dt.Rows.Count} 条记录";
                    totalCount.InnerText = dt.Rows.Count.ToString();
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
                    // 统计所有请假申请（不限制部门）
                    string query = @"
                        SELECT 
                            Status,
                            COUNT(*) as Count
                        FROM LeaveApplications
                        GROUP BY Status";

                    SqlCommand cmd = new SqlCommand(query, conn);

                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();

                    int pending = 0, approved = 0, rejected = 0;

                    while (reader.Read())
                    {
                        string status = reader["Status"].ToString();
                        int count = Convert.ToInt32(reader["Count"]);

                        switch (status)
                        {
                            case "待审批":
                                pending = count;
                                break;
                            case "已批准":
                                approved = count;
                                break;
                            case "已拒绝":
                                rejected = count;
                                break;
                        }
                    }

                    pendingCount.InnerText = pending.ToString();
                    approvedCount.InnerText = approved.ToString();
                    rejectedCount.InnerText = rejected.ToString();

                    reader.Close();
                }
            }
            catch (Exception ex)
            {
                // 静默处理统计加载错误
            }
        }

        protected void gvLeaveApplications_RowCommand(object sender, GridViewCommandEventArgs e)
        {
            if (e.CommandName == "View")
            {
                int leaveId = Convert.ToInt32(e.CommandArgument);
                ShowLeaveDetails(leaveId);
            }
            else if (e.CommandName == "Edit")
            {
                int leaveId = Convert.ToInt32(e.CommandArgument);
                LoadLeaveForApproval(leaveId);
            }
            else if (e.CommandName == "Approve")
            {
                int leaveId = Convert.ToInt32(e.CommandArgument);
                ProcessLeaveApproval(leaveId, "已批准", "请假申请已批准");
            }
            else if (e.CommandName == "Reject")
            {
                int leaveId = Convert.ToInt32(e.CommandArgument);
                ProcessLeaveApproval(leaveId, "已拒绝", "请假申请被拒绝");
            }

            upMain.Update();
        }

        private void ShowLeaveDetails(int leaveId)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = "SELECT * FROM LeaveApplications WHERE LeaveID = @LeaveID";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@LeaveID", leaveId);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    if (dt.Rows.Count > 0)
                    {
                        DataRow row = dt.Rows[0];

                        // 填充详情信息
                        detailEmployeeID.InnerText = row["EmployeeID"].ToString();
                        detailEmployeeName.InnerText = row["EmployeeName"].ToString();
                        detailDepartment.InnerText = row["Department"].ToString();
                        detailLeaveType.InnerText = row["LeaveType"].ToString();
                        detailDateRange.InnerText = $"{Convert.ToDateTime(row["StartDate"]):yyyy-MM-dd} 至 {Convert.ToDateTime(row["EndDate"]):yyyy-MM-dd}";
                        detailDays.InnerText = row["Days"].ToString();
                        detailStatus.InnerText = row["Status"].ToString();
                        detailApplyTime.InnerText = Convert.ToDateTime(row["ApplyTime"]).ToString("yyyy-MM-dd HH:mm");
                        txtDetailReason.Text = row["Reason"].ToString();

                        // 审批信息
                        if (!row.IsNull("ApproverID") && !string.IsNullOrEmpty(row["ApproverID"].ToString()))
                        {
                            approvalInfo.Visible = true;
                            detailApprover.InnerText = row["ApproverID"].ToString();
                            detailApproveTime.InnerText = Convert.ToDateTime(row["ApproveTime"]).ToString("yyyy-MM-dd HH:mm");
                            detailRemarks.InnerText = row["Remarks"]?.ToString() ?? "无";
                        }
                        else
                        {
                            approvalInfo.Visible = false;
                        }

                        // 显示模态框
                        string script = "<script>showDetailModal();</script>";
                        ClientScript.RegisterStartupScript(this.GetType(), "ShowDetailModal", script);
                    }

                    upModal.Update();
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('加载详情失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "LoadError", script);
            }
        }

        private void LoadLeaveForApproval(int leaveId)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = "SELECT * FROM LeaveApplications WHERE LeaveID = @LeaveID";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@LeaveID", leaveId);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    if (dt.Rows.Count > 0)
                    {
                        DataRow row = dt.Rows[0];

                        hdnEditLeaveID.Value = leaveId.ToString();
                        editEmployeeInfo.InnerText = $"{row["EmployeeName"]} ({row["EmployeeID"]})";
                        editDateRange.InnerText = $"{Convert.ToDateTime(row["StartDate"]):yyyy-MM-dd} 至 {Convert.ToDateTime(row["EndDate"]):yyyy-MM-dd}";
                        editLeaveType.InnerText = row["LeaveType"].ToString();
                        txtEditReason.Text = row["Reason"].ToString();

                        // 设置模态框标题
                        editModalTitle.InnerText = "审批请假申请";

                        // 显示模态框
                        string script = "<script>showEditModal();</script>";
                        ClientScript.RegisterStartupScript(this.GetType(), "ShowEditModal", script);
                    }

                    upEditModal.Update();
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('加载审批信息失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "LoadError", script);
            }
        }

        private void ProcessLeaveApproval(int leaveId, string status, string defaultRemarks)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = @"
                        UPDATE LeaveApplications 
                        SET Status = @Status,
                            ApproverID = @ApproverID,
                            ApproveTime = GETDATE(),
                            Remarks = @Remarks
                        WHERE LeaveID = @LeaveID";

                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@Status", status);
                    cmd.Parameters.AddWithValue("@ApproverID", Session["EmployeeID"]);
                    cmd.Parameters.AddWithValue("@Remarks", defaultRemarks);
                    cmd.Parameters.AddWithValue("@LeaveID", leaveId);

                    conn.Open();
                    cmd.ExecuteNonQuery();

                    string script = $"<script>alert('操作成功！请假申请已{status}');</script>";
                    ClientScript.RegisterStartupScript(this.GetType(), "SuccessMessage", script);

                    BindLeaveData();
                    LoadStatistics();
                    upMain.Update();
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('操作失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "ErrorMessage", script);
            }
        }

        protected void btnSubmitApproval_Click(object sender, EventArgs e)
        {
            if (Page.IsValid)
            {
                try
                {
                    int leaveId = Convert.ToInt32(hdnEditLeaveID.Value);
                    string status = rbApprove.Checked ? "已批准" : "已拒绝";
                    string remarks = txtApprovalComments.Text.Trim();

                    string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        string query = @"
                            UPDATE LeaveApplications 
                            SET Status = @Status,
                                ApproverID = @ApproverID,
                                ApproveTime = GETDATE(),
                                Remarks = @Remarks
                            WHERE LeaveID = @LeaveID";

                        SqlCommand cmd = new SqlCommand(query, conn);
                        cmd.Parameters.AddWithValue("@Status", status);
                        cmd.Parameters.AddWithValue("@ApproverID", Session["EmployeeID"]);
                        cmd.Parameters.AddWithValue("@Remarks", remarks);
                        cmd.Parameters.AddWithValue("@LeaveID", leaveId);

                        conn.Open();
                        cmd.ExecuteNonQuery();

                        string script = @"
                            <script>
                                closeEditModal();
                                alert('审批提交成功！');
                            </script>";
                        ClientScript.RegisterStartupScript(this.GetType(), "ApprovalSuccess", script);

                        BindLeaveData();
                        LoadStatistics();
                        upMain.Update();
                        upEditModal.Update();
                    }
                }
                catch (Exception ex)
                {
                    string script = $"<script>alert('提交失败: {ex.Message.Replace("'", "\\'")}');</script>";
                    ClientScript.RegisterStartupScript(this.GetType(), "ApprovalError", script);
                }
            }
        }

        protected void ddlStatus_SelectedIndexChanged(object sender, EventArgs e)
        {
            BindLeaveData();
            LoadStatistics();
            upMain.Update();
        }

        protected void ddlLeaveType_SelectedIndexChanged(object sender, EventArgs e)
        {
            BindLeaveData();
            upMain.Update();
        }

        protected void btnSearch_Click(object sender, EventArgs e)
        {
            BindLeaveData();
            LoadStatistics();
            upMain.Update();
        }

        protected void btnReset_Click(object sender, EventArgs e)
        {
            ddlStatus.SelectedIndex = 0;
            ddlLeaveType.SelectedIndex = 0;
            txtDateRange.Text = "";
            txtSearch.Text = "";
            BindLeaveData();
            LoadStatistics();
            upMain.Update();
        }

        protected void gvLeaveApplications_PageIndexChanging(object sender, GridViewPageEventArgs e)
        {
            gvLeaveApplications.PageIndex = e.NewPageIndex;
            BindLeaveData();
            upMain.Update();
        }
    }
}