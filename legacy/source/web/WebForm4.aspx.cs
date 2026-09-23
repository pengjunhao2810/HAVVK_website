using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.Services;
using System.Web.Script.Serialization;
using System.Collections.Generic;

namespace WebApplication1
{
    public partial class WebForm4 : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // 权限验证：只允许权限等级2的用户访问
            if (Session["EmployeeID"] == null)
            {
                Response.Redirect("WebForm2.aspx");
                return;
            }

            if (Session["PermissionLevel"] == null || Convert.ToInt32(Session["PermissionLevel"]) != 2)
            {
                // 如果不是权限2，重定向到对应页面
                RedirectByPermission();
                return;
            }

            CheckSessionTimeout();
        }

        private void RedirectByPermission()
        {
            if (Session["PermissionLevel"] != null)
            {
                int permissionLevel = Convert.ToInt32(Session["PermissionLevel"]);
                switch (permissionLevel)
                {
                    case 1:
                        Response.Redirect("WebForm3.aspx");
                        break;
                    case 3:
                        Response.Redirect("WebForm1.aspx");
                        break;
                    default:
                        Session.Clear();
                        Response.Redirect("WebForm2.aspx");
                        break;
                }
            }
        }

        private void CheckSessionTimeout()
        {
            if (Session["LoginTime"] != null)
            {
                DateTime loginTime = (DateTime)Session["LoginTime"];
                if (DateTime.Now.Subtract(loginTime).TotalMinutes > 30)
                {
                    Session.Clear();
                    Response.Redirect("WebForm2.aspx?timeout=1");
                }
                else
                {
                    Session["LoginTime"] = DateTime.Now;
                }
            }
        }

        [WebMethod]
        public static object GetUserInfo()
        {
            try
            {
                if (System.Web.HttpContext.Current.Session["EmployeeID"] == null)
                {
                    return new { success = false, message = "未登录" };
                }

                string employeeId = System.Web.HttpContext.Current.Session["EmployeeID"].ToString();
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = @"
                        SELECT EmployeeID, EmployeeName, Department, PermissionLevel
                        FROM EmployeeUser 
                        WHERE EmployeeID = @EmployeeID";

                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@EmployeeID", employeeId);

                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();

                    if (reader.Read())
                    {
                        return new
                        {
                            success = true,
                            user = new
                            {
                                EmployeeID = reader["EmployeeID"].ToString(),
                                EmployeeName = reader["EmployeeName"].ToString(),
                                Department = reader["Department"].ToString(),
                                PermissionLevel = Convert.ToInt32(reader["PermissionLevel"])
                            }
                        };
                    }
                }

                return new { success = false, message = "用户不存在" };
            }
            catch (Exception ex)
            {
                return new { success = false, message = ex.Message };
            }
        }

        [WebMethod]
        public static object GetDepartmentInfo()
        {
            try
            {
                if (System.Web.HttpContext.Current.Session["EmployeeID"] == null)
                {
                    return new { success = false, message = "未登录" };
                }

                string employeeId = System.Web.HttpContext.Current.Session["EmployeeID"].ToString();
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    // 查询部门信息
                    string query = @"
                        SELECT 
                            e.EmployeeID, e.EmployeeName, e.Department,
                            d.DepartmentName, d.ManagerID,
                            (SELECT COUNT(*) FROM EmployeeUser WHERE Department = e.Department) as EmployeeCount
                        FROM EmployeeUser e
                        LEFT JOIN Departments d ON e.Department = d.DepartmentCode
                        WHERE e.EmployeeID = @EmployeeID";

                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@EmployeeID", employeeId);

                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();

                    if (reader.Read())
                    {
                        return new
                        {
                            success = true,
                            department = new
                            {
                                DepartmentName = reader["DepartmentName"].ToString(),
                                EmployeeCount = Convert.ToInt32(reader["EmployeeCount"]),
                                IsManager = reader["ManagerID"]?.ToString() == employeeId
                            }
                        };
                    }
                }

                return new { success = false, message = "部门信息不存在" };
            }
            catch (Exception ex)
            {
                return new { success = false, message = ex.Message };
            }
        }

        [WebMethod]
        public static object Logout()
        {
            System.Web.HttpContext.Current.Session.Clear();
            return new { success = true };
        }
    }
}