using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

namespace WebApplication1
{
    public partial class qingjia : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // 未登录则跳转登录页
            if (Session["EmployeeID"] == null || Session["EmployeeName"] == null)
            {
                Response.Redirect("WebForm2.aspx");
                return;
            }

            // 首次加载：填充员工ID/姓名，绑定已有请假记录
            if (!IsPostBack)
            {
                // 从Session获取员工信息（只读，不可修改）
                txtEmployeeID.Text = Session["EmployeeID"].ToString();
                txtEmployeeName.Text = Session["EmployeeName"].ToString();

                // 绑定已有请假记录
                BindLeaveRecords();
            }

            // 隐藏提示信息
            lblSuccess.Visible = false;
            lblError.Visible = false;
        }

        /// <summary>
        /// 提交请假申请（插入数据库）
        /// </summary>
        protected void btnSubmit_Click(object sender, EventArgs e)
        {
            try
            {
                // 1. 获取表单数据
                string empId = txtEmployeeID.Text.Trim();
                string empName = txtEmployeeName.Text.Trim();
                string startDateStr = txtStartDate.Text.Trim();
                string endDateStr = txtEndDate.Text.Trim();

                // 2. 验证日期格式和逻辑
                if (string.IsNullOrEmpty(startDateStr) || string.IsNullOrEmpty(endDateStr))
                {
                    ShowError("请选择请假开始和截止日期！");
                    return;
                }

                // 转换日期格式（确保与数据库兼容）
                DateTime startDate;
                DateTime endDate;
                if (!DateTime.TryParse(startDateStr, out startDate))
                {
                    ShowError("请假开始日期格式错误！请选择正确的日期（yyyy-MM-dd）");
                    return;
                }
                if (!DateTime.TryParse(endDateStr, out endDate))
                {
                    ShowError("请假截止日期格式错误！请选择正确的日期（yyyy-MM-dd）");
                    return;
                }

                // 验证日期逻辑（截止日期不能早于开始日期）
                if (endDate < startDate)
                {
                    ShowError("请假截止日期不能早于开始日期！");
                    return;
                }

                // 3. 插入数据库（参数化查询，防止SQL注入）
                string connStr = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;
                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    string sql = @"
                        INSERT INTO EmployeeLeave (EmployeeID, EmployeeName, LeaveStartDate, LeaveEndDate)
                        VALUES (@EmployeeID, @EmployeeName, @LeaveStartDate, @LeaveEndDate)";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    // 添加参数（确保类型匹配）
                    cmd.Parameters.AddWithValue("@EmployeeID", empId);
                    cmd.Parameters.AddWithValue("@EmployeeName", empName);
                    cmd.Parameters.AddWithValue("@LeaveStartDate", startDate);
                    cmd.Parameters.AddWithValue("@LeaveEndDate", endDate);

                    conn.Open();
                    int rows = cmd.ExecuteNonQuery();

                    if (rows > 0)
                    {
                        // 提交成功：清空日期输入框，显示成功提示，重新绑定记录
                        ShowSuccess("请假申请提交成功！");
                        txtStartDate.Text = "";
                        txtEndDate.Text = "";
                        BindLeaveRecords(); // 实时刷新记录
                    }
                    else
                    {
                        ShowError("请假申请提交失败，请重试！");
                    }
                }
            }
            catch (Exception ex)
            {
                ShowError($"提交失败：{ex.Message}");
            }
        }

        /// <summary>
        /// 绑定当前员工的请假记录
        /// </summary>
        private void BindLeaveRecords()
        {
            try
            {
                string empId = Session["EmployeeID"].ToString();
                string connStr = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    string sql = @"
                        SELECT EmployeeID, EmployeeName, LeaveStartDate, LeaveEndDate, SubmitTime
                        FROM EmployeeLeave 
                        WHERE EmployeeID = @EmployeeID
                        ORDER BY SubmitTime DESC";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@EmployeeID", empId);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    gvLeaveRecords.DataSource = dt;
                    gvLeaveRecords.DataBind();
                }
            }
            catch (Exception ex)
            {
                gvLeaveRecords.EmptyDataText = $"加载记录失败：{ex.Message}";
                gvLeaveRecords.DataBind();
            }
        }

        /// <summary>
        /// 显示成功提示
        /// </summary>
        private void ShowSuccess(string msg)
        {
            lblSuccess.Text = msg;
            lblSuccess.Visible = true;
            lblError.Visible = false;
        }

        /// <summary>
        /// 显示错误提示
        /// </summary>
        private void ShowError(string msg)
        {
            lblError.Text = msg;
            lblError.Visible = true;
            lblSuccess.Visible = false;
        }
    }
}