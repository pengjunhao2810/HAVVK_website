using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

namespace WebApplication1
{
    public partial class daka : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // 未登录则跳转登录页
            if (Session["EmployeeID"] == null)
            {
                Response.Redirect("WebForm2.aspx");
                return;
            }

            // 首次加载绑定数据
            if (!IsPostBack)
            {
                BindAttendanceData();
            }
        }

        /// <summary>
        /// 绑定考勤数据到GridView（原始核心逻辑）
        /// </summary>
        private void BindAttendanceData()
        {
            try
            {
                // 获取当前登录员工ID（Session中存储的真实ID）
                string currentEmployeeId = Session["EmployeeID"].ToString();

                // 数据库连接字符串
                string connStr = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    conn.Open();

                    // 查询当前员工的考勤记录
                    string sql = @"
                        SELECT EmployeeID, EmployeeName, AttendanceDate, AttendanceTime, CheckType
                        FROM EmployeeAttendance 
                        WHERE EmployeeID = @EmployeeID
                        ORDER BY AttendanceDate DESC, AttendanceTime DESC";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@EmployeeID", currentEmployeeId);

                    // 填充数据并绑定
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    gvAttendance.DataSource = dt;
                    gvAttendance.DataBind();
                }
            }
            catch (Exception ex)
            {
                // 错误提示（仅保留必要信息）
                gvAttendance.EmptyDataText = $"加载考勤记录失败：{ex.Message}";
                gvAttendance.DataBind();
            }
        }
    }
}