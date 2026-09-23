using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Web;
using System.Web.Services;
using System.Web.UI;

namespace WebApplication1
{
    public partial class WebForm1 : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // 权限验证
            if (!IsUserLoggedIn())
            {
                Response.Redirect("WebForm2.aspx");
                return;
            }

            if (!IsAdminUser())
            {
                RedirectToUserPage();
                return;
            }

            // 会话超时检查
            CheckSessionTimeout();
        }

        private bool IsUserLoggedIn()
        {
            return Session["EmployeeID"] != null && Session["PermissionLevel"] != null;
        }

        private bool IsAdminUser()
        {
            if (Session["PermissionLevel"] == null) return false;
            int permissionLevel;
            if (int.TryParse(Session["PermissionLevel"].ToString(), out permissionLevel))
            {
                return permissionLevel == 3;
            }
            return false;
        }

        private void RedirectToUserPage()
        {
            if (Session["PermissionLevel"] != null)
            {
                int permissionLevel;
                if (int.TryParse(Session["PermissionLevel"].ToString(), out permissionLevel))
                {
                    switch (permissionLevel)
                    {
                        case 1:
                            Response.Redirect("WebForm3.aspx");
                            break;
                        case 2:
                            Response.Redirect("WebForm4.aspx");
                            break;
                        default:
                            Response.Redirect("WebForm2.aspx");
                            break;
                    }
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

        // ==================== 权限检查辅助方法 ====================
        private static bool IsAuthorized()
        {
            return HttpContext.Current.Session["PermissionLevel"] != null;
        }

        // ==================== 员工数据获取方法（前端调用的主要方法） ====================
        [WebMethod]
        public static string GetEmployeeData(string keyword = "", string department = "", string status = "", int page = 1, int pageSize = 10)
        {
            try
            {
                // 权限检查 - 确保用户已登录
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足，请重新登录" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();

                    var whereClause = new List<string>();

                    // 获取总数 - 使用独立参数
                    string countQuery = "SELECT COUNT(*) FROM EmployeeUser";
                    var countParams = new List<SqlParameter>();

                    // 添加搜索条件
                    if (!string.IsNullOrEmpty(keyword))
                    {
                        whereClause.Add("(EmployeeID LIKE @Keyword OR EmployeeName LIKE @Keyword)");
                        countParams.Add(new SqlParameter("@Keyword", SqlDbType.NVarChar, 50)
                        {
                            Value = "%" + keyword.Trim() + "%"
                        });
                    }

                    if (!string.IsNullOrEmpty(department) && department != "所有部门")
                    {
                        whereClause.Add("Department = @Department");
                        countParams.Add(new SqlParameter("@Department", SqlDbType.NVarChar, 50)
                        {
                            Value = department.Trim()
                        });
                    }

                    if (!string.IsNullOrEmpty(status) && status != "所有状态")
                    {
                        bool isActive = false;

                        if (status.ToLower() == "true" || status == "在职" || status == "1")
                        {
                            isActive = true;
                        }
                        else if (status.ToLower() == "false" || status == "离职" || status == "0")
                        {
                            isActive = false;
                        }
                        else
                        {
                            bool.TryParse(status, out isActive);
                        }

                        whereClause.Add("IsActive = @Status");
                        countParams.Add(new SqlParameter("@Status", SqlDbType.Bit)
                        {
                            Value = isActive
                        });
                    }

                    // 构建WHERE子句
                    string whereSql = whereClause.Count > 0 ? "WHERE " + string.Join(" AND ", whereClause) : "";
                    countQuery += " " + whereSql;

                    int total = ExecuteScalarInt(connection, countQuery, countParams);

                    // 计算分页
                    int startRow = (page - 1) * pageSize;

                    // 创建查询数据的参数（独立集合）
                    var queryParams = new List<SqlParameter>();

                    if (!string.IsNullOrEmpty(keyword))
                    {
                        queryParams.Add(new SqlParameter("@Keyword", SqlDbType.NVarChar, 50)
                        {
                            Value = "%" + keyword.Trim() + "%"
                        });
                    }

                    if (!string.IsNullOrEmpty(department) && department != "所有部门")
                    {
                        queryParams.Add(new SqlParameter("@Department", SqlDbType.NVarChar, 50)
                        {
                            Value = department.Trim()
                        });
                    }

                    if (!string.IsNullOrEmpty(status) && status != "所有状态")
                    {
                        bool isActive = false;

                        if (status.ToLower() == "true" || status == "在职" || status == "1")
                        {
                            isActive = true;
                        }
                        else if (status.ToLower() == "false" || status == "离职" || status == "0")
                        {
                            isActive = false;
                        }
                        else
                        {
                            bool.TryParse(status, out isActive);
                        }

                        queryParams.Add(new SqlParameter("@Status", SqlDbType.Bit)
                        {
                            Value = isActive
                        });
                    }

                    // 优化查询字段
                    string query = $@"
                SELECT 
                    EmployeeID,
                    EmployeeName,
                    Department,
                    Gender,
                    Age,
                    PhoneNumber,
                    Email,
                    PermissionLevel,
                    IsActive,
                    CASE 
                        WHEN IsActive = 1 THEN '在职'
                        ELSE '离职'
                    END AS Status,
                    CONVERT(varchar, CreatedAt, 120) AS CreatedAt,
                    Remarks
                FROM EmployeeUser
                {whereSql}
                ORDER BY CreatedAt DESC
                OFFSET {startRow} ROWS FETCH NEXT {pageSize} ROWS ONLY";

                    var employees = ExecuteReaderToList(connection, query, queryParams);

                    return SerializeJson(new
                    {
                        success = true,
                        employees = employees,
                        total = total,
                        page = page,
                        pageSize = pageSize,
                        message = "加载成功"
                    });
                }
            }
            catch (Exception ex)
            {
                // 记录错误日志
                LogError($"GetEmployeeData 错误: {ex.Message}", ex);

                return SerializeJson(new
                {
                    success = false,
                    message = "加载员工数据失败: " + ex.Message,
                    error = ex.Message
                });
            }
        }

        // ==================== 仪表盘数据 ====================
        [WebMethod]
        public static string GetDashboardData()
        {
            try
            {
                // 权限检查
                if (!IsAuthorized())
                {
                    return SerializeJson(new { error = true, message = "权限不足，请重新登录" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();

                    List<SqlParameter> emptyParams = new List<SqlParameter>();

                    // 员工总数
                    string totalEmployeesQuery = "SELECT COUNT(*) FROM EmployeeUser WHERE IsActive = 1";
                    int totalEmployees = ExecuteScalarInt(connection, totalEmployeesQuery, emptyParams);

                    // 今日新增
                    string todayEmployeesQuery = "SELECT COUNT(*) FROM EmployeeUser WHERE IsActive = 1 AND CONVERT(date, CreatedAt) = CONVERT(date, GETDATE())";
                    int todayEmployees = ExecuteScalarInt(connection, todayEmployeesQuery, emptyParams);

                    // 部门数量
                    string totalDepartmentsQuery = "SELECT COUNT(*) FROM Departments WHERE IsActive = 1";
                    int totalDepartments = ExecuteScalarInt(connection, totalDepartmentsQuery, emptyParams);

                    // 离职员工
                    string inactiveEmployeesQuery = "SELECT COUNT(*) FROM EmployeeUser WHERE IsActive = 0";
                    int inactiveEmployees = ExecuteScalarInt(connection, inactiveEmployeesQuery, emptyParams);

                    return SerializeJson(new
                    {
                        success = true,
                        TotalEmployees = totalEmployees,
                        TodayEmployees = todayEmployees,
                        TotalDepartments = totalDepartments,
                        InactiveEmployees = inactiveEmployees
                    });
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new
                {
                    success = false,
                    message = "获取数据失败",
                    error = ex.Message
                });
            }
        }

        // ==================== 其他必要的方法 ====================

        [WebMethod]
        public static string GetRecentEmployees()
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();
                    string query = @"
                        SELECT TOP 10 
                            e.EmployeeID,
                            e.EmployeeName,
                            e.Department,
                            CASE e.PermissionLevel
                                WHEN 1 THEN '普通员工'
                                WHEN 2 THEN '部门主管'
                                WHEN 3 THEN '管理员'
                                ELSE '未知'
                            END AS PermissionName,
                            CONVERT(varchar, e.CreatedAt, 120) as CreatedAt,
                            CASE e.IsActive 
                                WHEN 1 THEN '启用' 
                                ELSE '禁用' 
                            END AS Status
                        FROM EmployeeUser e
                        ORDER BY e.CreatedAt DESC";

                    var parameters = new List<SqlParameter>();
                    var results = ExecuteReaderToList(connection, query, parameters);
                    return SerializeJson(new { success = true, data = results });
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string GetEmployeeById(string employeeId)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();
                    string query = @"
                        SELECT 
                            EmployeeID,
                            EmployeeName,
                            Department,
                            Gender,
                            Age,
                            PhoneNumber,
                            Email,
                            PermissionLevel,
                            IsActive,
                            Remarks
                        FROM EmployeeUser
                        WHERE EmployeeID = @EmployeeID";

                    var parameters = new List<SqlParameter>
                    {
                        new SqlParameter("@EmployeeID", SqlDbType.VarChar, 20) { Value = employeeId }
                    };

                    var result = ExecuteReaderToList(connection, query, parameters);

                    if (result.Count > 0)
                    {
                        return SerializeJson(new { success = true, employee = result[0] });
                    }
                    else
                    {
                        return SerializeJson(new { success = false, message = "员工不存在" });
                    }
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string AddEmployee(string EmployeeID, string EmployeeName, string Gender,
                                        string Age, string Department, int PermissionLevel,
                                        string Phone, string Email, bool IsActive, string Remarks)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();

                    // 检查员工ID是否已存在
                    string checkQuery = "SELECT COUNT(*) FROM EmployeeUser WHERE EmployeeID = @EmployeeID";
                    var checkParams = new List<SqlParameter>
                    {
                        new SqlParameter("@EmployeeID", SqlDbType.VarChar, 20) { Value = EmployeeID }
                    };

                    int exists = ExecuteScalarInt(connection, checkQuery, checkParams);

                    if (exists > 0)
                    {
                        return SerializeJson(new { success = false, message = "员工编号已存在" });
                    }

                    // 检查手机号和邮箱是否重复
                    string checkDuplicateQuery = @"
                        SELECT COUNT(*) FROM EmployeeUser 
                        WHERE (PhoneNumber = @PhoneNumber OR Email = @Email)";

                    var duplicateParams = new List<SqlParameter>
                    {
                        new SqlParameter("@PhoneNumber", SqlDbType.VarChar, 20) { Value = Phone },
                        new SqlParameter("@Email", SqlDbType.VarChar, 100) { Value = Email }
                    };

                    int duplicateExists = ExecuteScalarInt(connection, checkDuplicateQuery, duplicateParams);

                    if (duplicateExists > 0)
                    {
                        return SerializeJson(new { success = false, message = "手机号或邮箱已存在" });
                    }

                    // 插入新员工
                    string insertQuery = @"
                        INSERT INTO EmployeeUser (
                            EmployeeID, EmployeeName, Gender, Age, Department, PermissionLevel,
                            PhoneNumber, Email, IsActive, Remarks, CreatedAt, CreatedBy
                        ) VALUES (
                            @EmployeeID, @EmployeeName, @Gender, @Age, @Department, @PermissionLevel,
                            @PhoneNumber, @Email, @IsActive, @Remarks, GETDATE(), @CreatedBy
                        )";

                    var parameters = new List<SqlParameter>
                    {
                        new SqlParameter("@EmployeeID", SqlDbType.VarChar, 20) { Value = EmployeeID },
                        new SqlParameter("@EmployeeName", SqlDbType.NVarChar, 50) { Value = EmployeeName },
                        new SqlParameter("@Gender", SqlDbType.Char, 2) { Value = Gender ?? "" },
                        new SqlParameter("@Age", SqlDbType.Int) { Value = string.IsNullOrEmpty(Age) ? 0 : int.Parse(Age) },
                        new SqlParameter("@Department", SqlDbType.NVarChar, 50) { Value = Department ?? "" },
                        new SqlParameter("@PermissionLevel", SqlDbType.Int) { Value = PermissionLevel },
                        new SqlParameter("@PhoneNumber", SqlDbType.VarChar, 20) { Value = Phone ?? "" },
                        new SqlParameter("@Email", SqlDbType.VarChar, 100) { Value = Email ?? "" },
                        new SqlParameter("@IsActive", SqlDbType.Bit) { Value = IsActive },
                        new SqlParameter("@Remarks", SqlDbType.NVarChar, 500) { Value = Remarks ?? "" },
                        new SqlParameter("@CreatedBy", SqlDbType.VarChar, 20) { Value = HttpContext.Current.Session["EmployeeID"]?.ToString() ?? "system" }
                    };

                    int rowsAffected = ExecuteNonQuery(connection, insertQuery, parameters);

                    if (rowsAffected > 0)
                    {
                        return SerializeJson(new { success = true, message = "员工添加成功" });
                    }
                    else
                    {
                        return SerializeJson(new { success = false, message = "添加失败" });
                    }
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string UpdateEmployee(string EmployeeID, string EmployeeName, string Gender,
                                          string Age, string Department, int PermissionLevel,
                                          string Phone, string Email, bool IsActive, string Remarks)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();

                    // 检查手机号和邮箱是否重复（排除当前员工）
                    string checkDuplicateQuery = @"
                        SELECT COUNT(*) FROM EmployeeUser 
                        WHERE (PhoneNumber = @PhoneNumber OR Email = @Email)
                            AND EmployeeID != @EmployeeID";

                    var duplicateParams = new List<SqlParameter>
                    {
                        new SqlParameter("@PhoneNumber", SqlDbType.VarChar, 20) { Value = Phone },
                        new SqlParameter("@Email", SqlDbType.VarChar, 100) { Value = Email },
                        new SqlParameter("@EmployeeID", SqlDbType.VarChar, 20) { Value = EmployeeID }
                    };

                    int duplicateExists = ExecuteScalarInt(connection, checkDuplicateQuery, duplicateParams);

                    if (duplicateExists > 0)
                    {
                        return SerializeJson(new { success = false, message = "手机号或邮箱已被其他员工使用" });
                    }

                    // 更新员工信息
                    string updateQuery = @"
                        UPDATE EmployeeUser 
                        SET EmployeeName = @EmployeeName,
                            Gender = @Gender,
                            Age = @Age,
                            Department = @Department,
                            PermissionLevel = @PermissionLevel,
                            PhoneNumber = @PhoneNumber,
                            Email = @Email,
                            IsActive = @IsActive,
                            Remarks = @Remarks,
                            UpdatedAt = GETDATE(),
                            UpdatedBy = @UpdatedBy
                        WHERE EmployeeID = @EmployeeID";

                    var parameters = new List<SqlParameter>
                    {
                        new SqlParameter("@EmployeeID", SqlDbType.VarChar, 20) { Value = EmployeeID },
                        new SqlParameter("@EmployeeName", SqlDbType.NVarChar, 50) { Value = EmployeeName },
                        new SqlParameter("@Gender", SqlDbType.Char, 2) { Value = Gender ?? "" },
                        new SqlParameter("@Age", SqlDbType.Int) { Value = string.IsNullOrEmpty(Age) ? 0 : int.Parse(Age) },
                        new SqlParameter("@Department", SqlDbType.NVarChar, 50) { Value = Department ?? "" },
                        new SqlParameter("@PermissionLevel", SqlDbType.Int) { Value = PermissionLevel },
                        new SqlParameter("@PhoneNumber", SqlDbType.VarChar, 20) { Value = Phone ?? "" },
                        new SqlParameter("@Email", SqlDbType.VarChar, 100) { Value = Email ?? "" },
                        new SqlParameter("@IsActive", SqlDbType.Bit) { Value = IsActive },
                        new SqlParameter("@Remarks", SqlDbType.NVarChar, 500) { Value = Remarks ?? "" },
                        new SqlParameter("@UpdatedBy", SqlDbType.VarChar, 20) { Value = HttpContext.Current.Session["EmployeeID"]?.ToString() ?? "system" }
                    };

                    int rowsAffected = ExecuteNonQuery(connection, updateQuery, parameters);

                    if (rowsAffected > 0)
                    {
                        return SerializeJson(new { success = true, message = "员工信息更新成功" });
                    }
                    else
                    {
                        return SerializeJson(new { success = false, message = "更新失败，员工不存在" });
                    }
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string DeleteEmployee(string employeeId)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();
                    string query = "DELETE FROM EmployeeUser WHERE EmployeeID = @EmployeeID";

                    var parameters = new List<SqlParameter>
                    {
                        new SqlParameter("@EmployeeID", SqlDbType.VarChar, 20) { Value = employeeId }
                    };

                    int rowsAffected = ExecuteNonQuery(connection, query, parameters);

                    if (rowsAffected > 0)
                    {
                        return SerializeJson(new { success = true, message = "员工删除成功" });
                    }
                    else
                    {
                        return SerializeJson(new { success = false, message = "删除失败，员工不存在" });
                    }
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string BatchUpdateEmployeeStatus(string[] employeeIds, bool isActive)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                if (employeeIds == null || employeeIds.Length == 0)
                {
                    return SerializeJson(new { success = false, message = "请选择要操作的员工" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();

                    // 构建安全的参数化查询
                    var parameters = new List<SqlParameter>();
                    var paramNames = new List<string>();

                    for (int i = 0; i < employeeIds.Length; i++)
                    {
                        string paramName = $"@id{i}";
                        paramNames.Add(paramName);
                        parameters.Add(new SqlParameter(paramName, SqlDbType.VarChar, 20) { Value = employeeIds[i] });
                    }

                    string idList = string.Join(",", paramNames);
                    string query = $@"
                        UPDATE EmployeeUser 
                        SET IsActive = @IsActive, 
                            UpdatedAt = GETDATE(),
                            UpdatedBy = @UpdatedBy
                        WHERE EmployeeID IN ({idList})";

                    parameters.Add(new SqlParameter("@IsActive", SqlDbType.Bit) { Value = isActive });
                    parameters.Add(new SqlParameter("@UpdatedBy", SqlDbType.VarChar, 20)
                    { Value = HttpContext.Current.Session["EmployeeID"]?.ToString() ?? "system" });

                    int rowsAffected = ExecuteNonQuery(connection, query, parameters);

                    return SerializeJson(new
                    {
                        success = true,
                        message = $"成功更新 {rowsAffected} 名员工状态",
                        count = rowsAffected
                    });
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new
                {
                    success = false,
                    message = "批量更新失败: " + ex.Message
                });
            }
        }

        [WebMethod]
        public static string BatchDeleteEmployees(string[] employeeIds)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                if (employeeIds == null || employeeIds.Length == 0)
                {
                    return SerializeJson(new { success = false, message = "请选择要删除的员工" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();

                    // 构建安全的参数化查询
                    var parameters = new List<SqlParameter>();
                    var paramNames = new List<string>();

                    for (int i = 0; i < employeeIds.Length; i++)
                    {
                        string paramName = $"@id{i}";
                        paramNames.Add(paramName);
                        parameters.Add(new SqlParameter(paramName, SqlDbType.VarChar, 20) { Value = employeeIds[i] });
                    }

                    string idList = string.Join(",", paramNames);
                    string query = $"DELETE FROM EmployeeUser WHERE EmployeeID IN ({idList})";

                    int rowsAffected = ExecuteNonQuery(connection, query, parameters);

                    return SerializeJson(new
                    {
                        success = true,
                        message = $"成功删除 {rowsAffected} 名员工",
                        count = rowsAffected
                    });
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new
                {
                    success = false,
                    message = "批量删除失败: " + ex.Message
                });
            }
        }

        // ==================== 部门管理方法 ====================

        // ==================== 部门管理方法 ====================

        // ==================== 部门管理方法 ====================

        [WebMethod]
        public static string GetDepartments()
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();
                    string query = @"
                SELECT 
                    d.DepartmentID,
                    d.DepartmentCode,
                    d.DepartmentName,
                    d.ManagerID,
                    e.EmployeeName AS ManagerName,
                    d.IsActive,
                    (SELECT COUNT(*) FROM EmployeeUser 
                     WHERE Department = d.DepartmentCode AND IsActive = 1) AS EmployeeCount
                FROM Departments d
                LEFT JOIN EmployeeUser e ON d.ManagerID = e.EmployeeID
                ORDER BY d.DepartmentCode";

                    var parameters = new List<SqlParameter>();
                    var results = ExecuteReaderToList(connection, query, parameters);
                    return SerializeJson(new { success = true, data = results });
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string GetDepartmentsForSelect()
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();
                    string query = @"
                SELECT 
                    DepartmentCode,
                    DepartmentName
                FROM Departments
                WHERE IsActive = 1
                ORDER BY DepartmentName";

                    var parameters = new List<SqlParameter>();
                    var results = ExecuteReaderToList(connection, query, parameters);
                    return SerializeJson(new { success = true, data = results });
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string SearchDepartments(string keyword)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();

                    string query = @"
                SELECT 
                    d.DepartmentID,
                    d.DepartmentCode,
                    d.DepartmentName,
                    d.ManagerID,
                    e.EmployeeName AS ManagerName,
                    d.IsActive,
                    (SELECT COUNT(*) FROM EmployeeUser 
                     WHERE Department = d.DepartmentCode AND IsActive = 1) AS EmployeeCount
                FROM Departments d
                LEFT JOIN EmployeeUser e ON d.ManagerID = e.EmployeeID
                WHERE (d.DepartmentCode LIKE @Keyword OR d.DepartmentName LIKE @Keyword)
                ORDER BY d.DepartmentCode";

                    var parameters = new List<SqlParameter>
            {
                new SqlParameter("@Keyword", SqlDbType.NVarChar, 100)
                {
                    Value = "%" + (keyword ?? "") + "%"
                }
            };

                    var results = ExecuteReaderToList(connection, query, parameters);
                    return SerializeJson(new { success = true, data = results });
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string GetManagersForSelect()
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();
                    string query = @"
                SELECT 
                    EmployeeID,
                    EmployeeName,
                    PermissionLevel
                FROM EmployeeUser
                WHERE IsActive = 1 
                    AND PermissionLevel IN (2, 3)  -- 只显示部门主管(2)和管理员(3)
                ORDER BY EmployeeName";

                    var parameters = new List<SqlParameter>();
                    var results = ExecuteReaderToList(connection, query, parameters);
                    return SerializeJson(new { success = true, data = results });
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string AddDepartment(string departmentCode, string departmentName, string managerId)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();

                    // 检查部门代码是否已存在
                    string checkQuery = "SELECT COUNT(*) FROM Departments WHERE DepartmentCode = @DepartmentCode";
                    var checkParams = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentCode", SqlDbType.VarChar, 20) { Value = departmentCode }
            };

                    int exists = ExecuteScalarInt(connection, checkQuery, checkParams);

                    if (exists > 0)
                    {
                        return SerializeJson(new { success = false, message = "部门代码已存在" });
                    }

                    // 检查部门名称是否已存在
                    string checkNameQuery = "SELECT COUNT(*) FROM Departments WHERE DepartmentName = @DepartmentName";
                    var checkNameParams = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentName", SqlDbType.NVarChar, 50) { Value = departmentName }
            };

                    int nameExists = ExecuteScalarInt(connection, checkNameQuery, checkNameParams);

                    if (nameExists > 0)
                    {
                        return SerializeJson(new { success = false, message = "部门名称已存在" });
                    }

                    // 验证经理权限 - 只允许权限2或3的员工
                    if (!string.IsNullOrEmpty(managerId))
                    {
                        string checkManagerQuery = @"
                    SELECT COUNT(*) 
                    FROM EmployeeUser 
                    WHERE EmployeeID = @ManagerID 
                      AND IsActive = 1 
                      AND PermissionLevel IN (2, 3)";

                        var managerParams = new List<SqlParameter>
                {
                    new SqlParameter("@ManagerID", SqlDbType.VarChar, 20) { Value = managerId }
                };

                        int managerExists = ExecuteScalarInt(connection, checkManagerQuery, managerParams);

                        if (managerExists == 0)
                        {
                            return SerializeJson(new { success = false, message = "经理必须是权限2级（部门主管）或3级（管理员）的员工" });
                        }
                    }

                    // 插入新部门 - 使用正确的字段名
                    string insertQuery = @"
                INSERT INTO Departments (
                    DepartmentCode,
                    DepartmentName,
                    ManagerID,
                    IsActive
                ) VALUES (
                    @DepartmentCode,
                    @DepartmentName,
                    @ManagerID,
                    1  -- 默认启用
                )";

                    var parameters = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentCode", SqlDbType.VarChar, 20) { Value = departmentCode },
                new SqlParameter("@DepartmentName", SqlDbType.NVarChar, 50) { Value = departmentName },
                new SqlParameter("@ManagerID", SqlDbType.VarChar, 20)
                {
                    Value = string.IsNullOrEmpty(managerId) ? DBNull.Value : (object)managerId
                }
            };

                    int rowsAffected = ExecuteNonQuery(connection, insertQuery, parameters);

                    if (rowsAffected > 0)
                    {
                        return SerializeJson(new { success = true, message = "部门添加成功" });
                    }
                    else
                    {
                        return SerializeJson(new { success = false, message = "添加失败" });
                    }
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string UpdateDepartment(int departmentId, string departmentCode, string departmentName, string managerId)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();

                    // 检查部门代码是否被其他部门使用
                    string checkCodeQuery = @"SELECT COUNT(*) FROM Departments 
                                   WHERE DepartmentCode = @DepartmentCode AND DepartmentID != @DepartmentID";
                    var checkCodeParams = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentCode", SqlDbType.VarChar, 20) { Value = departmentCode },
                new SqlParameter("@DepartmentID", SqlDbType.Int) { Value = departmentId }
            };

                    int codeExists = ExecuteScalarInt(connection, checkCodeQuery, checkCodeParams);

                    if (codeExists > 0)
                    {
                        return SerializeJson(new { success = false, message = "部门代码已被其他部门使用" });
                    }

                    // 检查部门名称是否被其他部门使用
                    string checkNameQuery = @"SELECT COUNT(*) FROM Departments 
                                   WHERE DepartmentName = @DepartmentName AND DepartmentID != @DepartmentID";
                    var checkNameParams = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentName", SqlDbType.NVarChar, 50) { Value = departmentName },
                new SqlParameter("@DepartmentID", SqlDbType.Int) { Value = departmentId }
            };

                    int nameExists = ExecuteScalarInt(connection, checkNameQuery, checkNameParams);

                    if (nameExists > 0)
                    {
                        return SerializeJson(new { success = false, message = "部门名称已被其他部门使用" });
                    }

                    // 验证经理权限 - 只允许权限2或3的员工
                    if (!string.IsNullOrEmpty(managerId))
                    {
                        string checkManagerQuery = @"
                    SELECT COUNT(*) 
                    FROM EmployeeUser 
                    WHERE EmployeeID = @ManagerID 
                      AND IsActive = 1 
                      AND PermissionLevel IN (2, 3)";

                        var managerParams = new List<SqlParameter>
                {
                    new SqlParameter("@ManagerID", SqlDbType.VarChar, 20) { Value = managerId }
                };

                        int managerExists = ExecuteScalarInt(connection, checkManagerQuery, managerParams);

                        if (managerExists == 0)
                        {
                            return SerializeJson(new { success = false, message = "经理必须是权限2级（部门主管）或3级（管理员）的员工" });
                        }
                    }

                    // 检查是否有员工属于此部门
                    string checkEmployeesQuery = "SELECT COUNT(*) FROM EmployeeUser WHERE Department = @DepartmentCode AND IsActive = 1";
                    var checkEmployeesParams = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentCode", SqlDbType.VarChar, 20) { Value = departmentCode }
            };

                    int employeeCount = ExecuteScalarInt(connection, checkEmployeesQuery, checkEmployeesParams);

                    if (employeeCount > 0)
                    {
                        // 如果有员工属于此部门，需要更新这些员工的部门信息
                        string updateEmployeeDeptQuery = @"UPDATE EmployeeUser 
                                                 SET Department = @DepartmentCode
                                                 WHERE Department = (SELECT DepartmentCode FROM Departments WHERE DepartmentID = @DepartmentID)";

                        var updateEmployeeParams = new List<SqlParameter>
                {
                    new SqlParameter("@DepartmentCode", SqlDbType.VarChar, 20) { Value = departmentCode },
                    new SqlParameter("@DepartmentID", SqlDbType.Int) { Value = departmentId }
                };

                        ExecuteNonQuery(connection, updateEmployeeDeptQuery, updateEmployeeParams);
                    }

                    // 更新部门信息 - 使用正确的字段名
                    string updateQuery = @"
                UPDATE Departments 
                SET DepartmentCode = @DepartmentCode,
                    DepartmentName = @DepartmentName,
                    ManagerID = @ManagerID
                WHERE DepartmentID = @DepartmentID";

                    var parameters = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentID", SqlDbType.Int) { Value = departmentId },
                new SqlParameter("@DepartmentCode", SqlDbType.VarChar, 20) { Value = departmentCode },
                new SqlParameter("@DepartmentName", SqlDbType.NVarChar, 50) { Value = departmentName },
                new SqlParameter("@ManagerID", SqlDbType.VarChar, 20)
                {
                    Value = string.IsNullOrEmpty(managerId) ? DBNull.Value : (object)managerId
                }
            };

                    int rowsAffected = ExecuteNonQuery(connection, updateQuery, parameters);

                    if (rowsAffected > 0)
                    {
                        return SerializeJson(new { success = true, message = "部门信息更新成功" });
                    }
                    else
                    {
                        return SerializeJson(new { success = false, message = "更新失败，部门不存在" });
                    }
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string DeleteDepartment(int departmentId)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();

                    // 首先获取部门信息
                    string getDeptInfoQuery = "SELECT DepartmentCode, DepartmentName FROM Departments WHERE DepartmentID = @DepartmentID";
                    var getDeptInfoParams = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentID", SqlDbType.Int) { Value = departmentId }
            };

                    var deptInfo = ExecuteReaderToList(connection, getDeptInfoQuery, getDeptInfoParams);

                    if (deptInfo.Count == 0)
                    {
                        return SerializeJson(new { success = false, message = "部门不存在" });
                    }

                    string departmentCode = deptInfo[0]["DepartmentCode"]?.ToString();
                    string departmentName = deptInfo[0]["DepartmentName"]?.ToString();

                    // 检查是否有员工属于此部门
                    string checkEmployeesQuery = "SELECT COUNT(*) FROM EmployeeUser WHERE Department = @DepartmentCode AND IsActive = 1";
                    var checkEmployeesParams = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentCode", SqlDbType.VarChar, 20) { Value = departmentCode }
            };

                    int employeeCount = ExecuteScalarInt(connection, checkEmployeesQuery, checkEmployeesParams);

                    if (employeeCount > 0)
                    {
                        return SerializeJson(new
                        {
                            success = false,
                            message = $"无法删除部门 \"{departmentName}\"，还有 {employeeCount} 名员工属于此部门。请先将这些员工分配到其他部门再删除。"
                        });
                    }

                    // 删除部门
                    string deleteQuery = "DELETE FROM Departments WHERE DepartmentID = @DepartmentID";
                    var deleteParams = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentID", SqlDbType.Int) { Value = departmentId }
            };

                    int rowsAffected = ExecuteNonQuery(connection, deleteQuery, deleteParams);

                    if (rowsAffected > 0)
                    {
                        return SerializeJson(new { success = true, message = $"部门 \"{departmentName}\" 删除成功" });
                    }
                    else
                    {
                        return SerializeJson(new { success = false, message = "删除失败，部门不存在" });
                    }
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string GetDepartmentById(int departmentId)
        {
            try
            {
                if (!IsAuthorized())
                {
                    return SerializeJson(new { success = false, message = "权限不足" });
                }

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString))
                {
                    connection.Open();
                    string query = @"
                SELECT 
                    d.DepartmentID,
                    d.DepartmentCode,
                    d.DepartmentName,
                    d.ManagerID,
                    e.EmployeeName AS ManagerName,
                    d.IsActive
                FROM Departments d
                LEFT JOIN EmployeeUser e ON d.ManagerID = e.EmployeeID
                WHERE d.DepartmentID = @DepartmentID";

                    var parameters = new List<SqlParameter>
            {
                new SqlParameter("@DepartmentID", SqlDbType.Int) { Value = departmentId }
            };

                    var result = ExecuteReaderToList(connection, query, parameters);

                    if (result.Count > 0)
                    {
                        return SerializeJson(new { success = true, data = result[0] });
                    }
                    else
                    {
                        return SerializeJson(new { success = false, message = "部门不存在" });
                    }
                }
            }
            catch (Exception ex)
            {
                return SerializeJson(new { success = false, message = ex.Message });
            }
        }

        // ==================== 辅助方法 ====================

        private static string SerializeJson(object obj)
        {
            var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            serializer.MaxJsonLength = int.MaxValue;
            return serializer.Serialize(obj);
        }

        private static int ExecuteScalarInt(SqlConnection connection, string query, List<SqlParameter> parameters)
        {
            using (var cmd = new SqlCommand(query, connection))
            {
                if (parameters != null && parameters.Count > 0)
                {
                    cmd.Parameters.AddRange(parameters.ToArray());
                }
                object result = cmd.ExecuteScalar();
                return result == DBNull.Value || result == null ? 0 : Convert.ToInt32(result);
            }
        }

        private static int ExecuteScalarInt(SqlConnection connection, string query, params SqlParameter[] parameters)
        {
            var paramList = parameters != null ? new List<SqlParameter>(parameters) : new List<SqlParameter>();
            return ExecuteScalarInt(connection, query, paramList);
        }

        private static List<Dictionary<string, object>> ExecuteReaderToList(SqlConnection connection, string query, List<SqlParameter> parameters = null)
        {
            var results = new List<Dictionary<string, object>>();

            using (var cmd = new SqlCommand(query, connection))
            {
                if (parameters != null && parameters.Count > 0)
                {
                    cmd.Parameters.AddRange(parameters.ToArray());
                }

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var row = new Dictionary<string, object>();
                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            var value = reader.IsDBNull(i) ? null : reader.GetValue(i);
                            if (value is DateTime)
                            {
                                value = ((DateTime)value).ToString("yyyy-MM-dd HH:mm:ss");
                            }
                            row[reader.GetName(i)] = value;
                        }
                        results.Add(row);
                    }
                }
            }

            return results;
        }

        private static int ExecuteNonQuery(SqlConnection connection, string query, List<SqlParameter> parameters)
        {
            using (var cmd = new SqlCommand(query, connection))
            {
                if (parameters != null && parameters.Count > 0)
                {
                    cmd.Parameters.AddRange(parameters.ToArray());
                }
                return cmd.ExecuteNonQuery();
            }
        }

        private static int ExecuteNonQuery(SqlConnection connection, string query, params SqlParameter[] parameters)
        {
            var paramList = parameters != null ? new List<SqlParameter>(parameters) : new List<SqlParameter>();
            return ExecuteNonQuery(connection, query, paramList);
        }

        private static void LogError(string message, Exception ex = null)
        {
            try
            {
                string logPath = HttpContext.Current.Server.MapPath("~/App_Data/error.log");
                string logMessage = $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} - {message}";

                if (ex != null)
                {
                    logMessage += $"\n异常: {ex.Message}\n堆栈: {ex.StackTrace}";
                }

                logMessage += "\n" + new string('-', 80) + "\n";

                System.IO.File.AppendAllText(logPath, logMessage);
            }
            catch
            {
                // 如果日志记录失败，忽略
            }
        }
    }
}