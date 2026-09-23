using System;
using System.Web;

namespace WebApplication1
{
    public static class SessionHelper
    {
        public static void SetUserSession(string employeeId, string employeeName, int permissionLevel)
        {
            HttpContext.Current.Session["EmployeeID"] = employeeId;
            HttpContext.Current.Session["EmployeeName"] = employeeName;
            HttpContext.Current.Session["PermissionLevel"] = permissionLevel;
            HttpContext.Current.Session["LoginTime"] = DateTime.Now;

            // 确保SessionID不变
            HttpContext.Current.Session.Timeout = 30;
        }

        public static bool IsUserLoggedIn()
        {
            return HttpContext.Current.Session["EmployeeID"] != null &&
                   HttpContext.Current.Session["PermissionLevel"] != null;
        }

        public static int GetUserPermissionLevel()
        {
            if (HttpContext.Current.Session["PermissionLevel"] != null)
                return Convert.ToInt32(HttpContext.Current.Session["PermissionLevel"]);
            return 0;
        }

        public static string GetUserId()
        {
            return HttpContext.Current.Session["EmployeeID"]?.ToString();
        }

        public static void ClearSession()
        {
            HttpContext.Current.Session.Clear();
            HttpContext.Current.Session.Abandon();
        }
    }
}