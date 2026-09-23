using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

namespace WebApplication1
{
    public partial class profile : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // 未登录则跳转登录页
            if (Session["EmployeeID"] == null)
            {
                Response.Redirect("WebForm2.aspx");
                return;
            }

            // 首次加载读取个人信息
            if (!IsPostBack)
            {
                LoadUserProfile();
            }
        }

        /// <summary>
        /// 从EmployeeUser表读取当前用户的信息（新增Email字段）
        /// </summary>
        private void LoadUserProfile()
        {
            try
            {
                string empId = Session["EmployeeID"].ToString();
                string connStr = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    // 查询语句新增Email字段
                    string sql = @"
                        SELECT EmployeeName, Age, Department, Gender, PhoneNumber, Email
                        FROM EmployeeUser
                        WHERE EmployeeID = @EmployeeID";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@EmployeeID", empId);

                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();

                    if (reader.Read())
                    {
                        // 绑定数据到页面标签（新增Email绑定）
                        lblEmployeeName.Text = reader["EmployeeName"].ToString();
                        lblAge.Text = reader["Age"].ToString() + " 岁";
                        lblDepartment.Text = reader["Department"].ToString();
                        lblGender.Text = reader["Gender"].ToString();
                        lblPhoneNumber.Text = reader["PhoneNumber"].ToString();
                        lblEmail.Text = reader["Email"].ToString(); // 绑定Email字段
                    }
                    else
                    {
                        // 无数据时提示
                        lblEmployeeName.Text = "暂无信息";
                        lblEmail.Text = "暂无信息"; // Email默认提示
                    }
                }
            }
            catch (Exception ex)
            {
                lblEmployeeName.Text = $"加载失败：{ex.Message}";
                lblEmail.Text = "加载失败"; // Email异常提示
            }
        }
    }
}