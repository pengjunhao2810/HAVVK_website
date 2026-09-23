using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.Services;
using System.Web.Script.Serialization;
using System.Collections.Generic;

namespace WebApplication1
{
    public partial class WebForm3 : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // 权限验证：只允许权限等级1的用户访问
            if (Session["EmployeeID"] == null)
            {
                Response.Redirect("WebForm2.aspx");
                return;
            }

            if (Session["PermissionLevel"] == null || Convert.ToInt32(Session["PermissionLevel"]) != 1)
            {
                // 如果不是权限1，重定向到对应页面
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
                    case 2:
                        Response.Redirect("WebForm4.aspx");
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
        public static object GetPersonalInfo()
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
                        SELECT 
                            e.EmployeeID, e.EmployeeName, e.Department, 
                            e.Gender, e.Age, e.PhoneNumber, e.Email,
                            e.CreatedAt, p.PermissionName
                        FROM EmployeeUser e
                        LEFT JOIN UserPermissions p ON e.PermissionLevel = p.PermissionLevel
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
                            info = new
                            {
                                EmployeeID = reader["EmployeeID"].ToString(),
                                EmployeeName = reader["EmployeeName"].ToString(),
                                Department = reader["Department"].ToString(),
                                Gender = reader["Gender"].ToString(),
                                Age = Convert.ToInt32(reader["Age"]),
                                PhoneNumber = reader["PhoneNumber"].ToString(),
                                Email = reader["Email"].ToString(),
                                CreatedAt = Convert.ToDateTime(reader["CreatedAt"]).ToString("yyyy-MM-dd"),
                                PermissionName = reader["PermissionName"].ToString()
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
        public static object GetNotifications()
        {
            // 模拟通知数据
            var notifications = new List<object>
            {
                new {
                    type = "info",
                    icon = "📢",
                    title = "系统升级通知",
                    description = "系统将于本周五18:00-20:00进行维护升级",
                    time = "今天 09:30"
                },
                new {
                    type = "warning",
                    icon = "⚠️",
                    title = "考勤提醒",
                    description = "请及时完成本月考勤确认",
                    time = "昨天 15:20"
                },
                new {
                    type = "info",
                    icon = "📝",
                    title = "培训通知",
                    description = "下周将举办新员工培训，请相关人员准时参加",
                    time = "2023-12-10"
                }
            };

            return new { success = true, notifications = notifications };
        }

        [WebMethod]
        public static object Logout()
        {
            System.Web.HttpContext.Current.Session.Clear();
            return new { success = true };
        }
    }
}