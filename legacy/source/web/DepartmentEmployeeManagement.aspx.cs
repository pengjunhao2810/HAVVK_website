using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Security.Cryptography;
using System.Text;

namespace WebApplication1
{
    public partial class DepartmentEmployeeManagement : System.Web.UI.Page
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

                BindEmployeeData();
                LoadDepartmentStats();
            }

            // 处理编辑请求（来自JavaScript）
            string eventArg = Request.Params["__EVENTARGUMENT"];
            if (!string.IsNullOrEmpty(eventArg) && eventArg.StartsWith("Edit:"))
            {
                string employeeId = eventArg.Substring("Edit:".Length);
                LoadEmployeeForEdit(employeeId);
            }
        }

        protected void BindEmployeeData()
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;
                string currentUserDept = Session["Department"]?.ToString();

                // 调试：输出当前部门
                System.Diagnostics.Debug.WriteLine($"当前部门: {currentUserDept}");

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    // 先获取当前用户所在部门
                    string deptQuery = "SELECT Department FROM EmployeeUser WHERE EmployeeID = @EmployeeID";
                    SqlCommand deptCmd = new SqlCommand(deptQuery, conn);
                    deptCmd.Parameters.AddWithValue("@EmployeeID", Session["EmployeeID"].ToString());

                    conn.Open();
                    object deptResult = deptCmd.ExecuteScalar();
                    if (deptResult != null)
                    {
                        currentUserDept = deptResult.ToString();
                        Session["Department"] = currentUserDept; // 保存到Session
                        System.Diagnostics.Debug.WriteLine($"从数据库获取的部门: {currentUserDept}");
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine("未找到用户部门信息");
                    }
                    conn.Close();

                    // 查询该部门的所有员工
                    string query = @"
                SELECT 
                    EmployeeID, 
                    EmployeeName, 
                    Department, 
                    Gender, 
                    Age, 
                    PermissionLevel, 
                    PhoneNumber, 
                    Email, 
                    CreatedAt, 
                    LastLogin, 
                    IsActive, 
                    Remarks,
                    CreatedBy,
                    UpdatedAt,
                    UpdatedBy
                FROM EmployeeUser
                WHERE Department = @Department";

                    // 添加筛选条件
                    if (!string.IsNullOrEmpty(ddlGenderFilter.SelectedValue))
                    {
                        query += " AND Gender = @Gender";
                        System.Diagnostics.Debug.WriteLine($"性别筛选: {ddlGenderFilter.SelectedValue}");
                    }

                    if (!string.IsNullOrEmpty(txtSearch.Text))
                    {
                        query += " AND (EmployeeName LIKE @Search OR EmployeeID LIKE @Search)";
                        System.Diagnostics.Debug.WriteLine($"搜索条件: {txtSearch.Text}");
                    }

                    query += " ORDER BY EmployeeID";

                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@Department", currentUserDept);

                    if (!string.IsNullOrEmpty(ddlGenderFilter.SelectedValue))
                    {
                        cmd.Parameters.AddWithValue("@Gender", ddlGenderFilter.SelectedValue);
                    }

                    if (!string.IsNullOrEmpty(txtSearch.Text))
                    {
                        cmd.Parameters.AddWithValue("@Search", "%" + txtSearch.Text + "%");
                    }

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    // 调试：输出查询到的数据行数
                    System.Diagnostics.Debug.WriteLine($"查询到 {dt.Rows.Count} 条记录");

                    gvEmployees.DataSource = dt;
                    gvEmployees.DataBind();

                    lblTotal.Text = $"共 {dt.Rows.Count} 名员工";
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"BindEmployeeData错误: {ex.Message}");
                string script = $"<script>alert('加载数据失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "ErrorMessage", script);
            }
        }

        protected void LoadDepartmentStats()
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;
                string currentUserDept = Session["Department"]?.ToString();

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    // 获取部门统计信息
                    string query = @"
                        SELECT 
                            COUNT(*) as TotalEmployees,
                            SUM(CASE WHEN Gender = '男' THEN 1 ELSE 0 END) as MaleCount,
                            SUM(CASE WHEN Gender = '女' THEN 1 ELSE 0 END) as FemaleCount,
                            AVG(CAST(Age as float)) as AvgAge,
                            SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as ActiveCount
                        FROM EmployeeUser
                        WHERE Department = @Department";

                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@Department", currentUserDept);

                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();

                    if (reader.Read())
                    {
                        int total = reader.IsDBNull(0) ? 0 : Convert.ToInt32(reader["TotalEmployees"]);
                        int male = reader.IsDBNull(1) ? 0 : Convert.ToInt32(reader["MaleCount"]);
                        int female = reader.IsDBNull(2) ? 0 : Convert.ToInt32(reader["FemaleCount"]);
                        double avgAge = reader.IsDBNull(3) ? 0 : Convert.ToDouble(reader["AvgAge"]);
                        int active = reader.IsDBNull(4) ? 0 : Convert.ToInt32(reader["ActiveCount"]);

                        departmentStats.InnerHtml = $@"
                            <div class='stat-card'>
                                <div class='stat-value'>{total}</div>
                                <div class='stat-label'>总员工数</div>
                            </div>
                            <div class='stat-card'>
                                <div class='stat-value'>{male}</div>
                                <div class='stat-label'>男性员工</div>
                            </div>
                            <div class='stat-card'>
                                <div class='stat-value'>{female}</div>
                                <div class='stat-label'>女性员工</div>
                            </div>
                            <div class='stat-card'>
                                <div class='stat-value'>{avgAge:F1}</div>
                                <div class='stat-label'>平均年龄</div>
                            </div>
                            <div class='stat-card'>
                                <div class='stat-value'>{active}</div>
                                <div class='stat-label'>在职员工</div>
                            </div>";
                    }
                    else
                    {
                        departmentStats.InnerHtml = @"<div class='stat-card'><div class='stat-value'>0</div><div class='stat-label'>暂无数据</div></div>";
                    }

                    reader.Close();
                }
            }
            catch (Exception ex)
            {
                departmentStats.InnerHtml = @"<div class='stat-card'><div class='stat-value'>0</div><div class='stat-label'>数据加载失败</div></div>";
            }
        }

        protected void ddlGenderFilter_SelectedIndexChanged(object sender, EventArgs e)
        {
            BindEmployeeData();
            LoadDepartmentStats();
        }

        protected void btnSearch_Click(object sender, EventArgs e)
        {
            BindEmployeeData();
            LoadDepartmentStats();
        }

        protected void btnReset_Click(object sender, EventArgs e)
        {
            txtSearch.Text = "";
            ddlGenderFilter.SelectedIndex = 0;
            BindEmployeeData();
            LoadDepartmentStats();
        }

        protected void gvEmployees_RowCommand(object sender, GridViewCommandEventArgs e)
        {
            if (e.CommandName == "EditRow")
            {
                string employeeId = e.CommandArgument.ToString();
                hdnEditEmployeeID.Value = employeeId;
                // 调用客户端函数来显示编辑模态框
                string script = $"<script>showEditModal('{employeeId}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "ShowEditModal", script);
            }
            else if (e.CommandName == "DeleteRow")
            {
                string employeeId = e.CommandArgument.ToString();
                DeleteEmployee(employeeId);
            }

            upMain.Update();
        }

        protected void gvEmployees_PageIndexChanging(object sender, GridViewPageEventArgs e)
        {
            gvEmployees.PageIndex = e.NewPageIndex;
            BindEmployeeData();
            upMain.Update();
        }

        private void LoadEmployeeForEdit(string employeeId)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = "SELECT * FROM EmployeeUser WHERE EmployeeID = @EmployeeID";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@EmployeeID", employeeId);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    if (dt.Rows.Count > 0)
                    {
                        DataRow row = dt.Rows[0];

                        // 填充表单
                        txtEmployeeID.Text = row["EmployeeID"].ToString();
                        txtEmployeeName.Text = row["EmployeeName"].ToString();
                        ddlGenderModal.SelectedValue = row["Gender"].ToString();

                        if (!row.IsNull("Age"))
                        {
                            txtAge.Text = row["Age"].ToString();
                        }
                        else
                        {
                            txtAge.Text = "";
                        }

                        ddlDepartment.SelectedValue = row["Department"].ToString();
                        ddlPermissionLevel.SelectedValue = row["PermissionLevel"].ToString();

                        if (!row.IsNull("PhoneNumber"))
                        {
                            txtPhoneNumber.Text = row["PhoneNumber"].ToString();
                        }
                        else
                        {
                            txtPhoneNumber.Text = "";
                        }

                        if (!row.IsNull("Email"))
                        {
                            txtEmail.Text = row["Email"].ToString();
                        }
                        else
                        {
                            txtEmail.Text = "";
                        }

                        ddlIsActive.SelectedValue = row["IsActive"].ToString();

                        if (!row.IsNull("Remarks"))
                        {
                            txtRemarks.Text = row["Remarks"].ToString();
                        }
                        else
                        {
                            txtRemarks.Text = "";
                        }

                        hdnEditEmployeeID.Value = employeeId;
                        hdnIsEditMode.Value = "true";

                        // 更新模态框标题
                        string script = @"
                            <script>
                                document.getElementById('modalTitle').textContent = '编辑员工信息';
                                document.getElementById('" + txtPassword.ClientID + @"').style.display = 'none';
                                document.getElementById('passwordGroup').style.display = 'none';
                                document.getElementById('employeeModal').style.display = 'flex';
                            </script>";
                        ClientScript.RegisterStartupScript(this.GetType(), "ShowEditModal", script);
                    }

                    upModal.Update();
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('加载员工信息失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "LoadError", script);
            }
        }

        protected void btnSave_Click(object sender, EventArgs e)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;
                string employeeId = txtEmployeeID.Text.Trim();
                string employeeName = txtEmployeeName.Text.Trim();
                bool isEditMode = hdnIsEditMode.Value == "true";
                string oldEmployeeId = isEditMode ? hdnEditEmployeeID.Value : "";

                // 基本验证
                if (string.IsNullOrEmpty(employeeId) || string.IsNullOrEmpty(employeeName))
                {
                    string script = "<script>alert('工号和姓名不能为空！');</script>";
                    ClientScript.RegisterStartupScript(this.GetType(), "ValidationError", script);
                    return;
                }

                // 如果是新增模式，验证密码
                if (!isEditMode && string.IsNullOrEmpty(txtPassword.Text))
                {
                    string script = "<script>alert('新增员工时密码不能为空！');</script>";
                    ClientScript.RegisterStartupScript(this.GetType(), "PasswordError", script);
                    return;
                }

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // 检查工号是否存在（编辑时排除自己）
                    if (isEditMode && employeeId != oldEmployeeId)
                    {
                        string checkQuery = "SELECT COUNT(*) FROM EmployeeUser WHERE EmployeeID = @EmployeeID";
                        SqlCommand checkCmd = new SqlCommand(checkQuery, conn);
                        checkCmd.Parameters.AddWithValue("@EmployeeID", employeeId);

                        int count = (int)checkCmd.ExecuteScalar();
                        if (count > 0)
                        {
                            string script = "<script>alert('该工号已存在！');</script>";
                            ClientScript.RegisterStartupScript(this.GetType(), "DuplicateError", script);
                            return;
                        }
                    }

                    if (isEditMode)
                    {
                        // 更新员工信息
                        string updateQuery = @"
                    UPDATE EmployeeUser SET 
                        EmployeeID = @EmployeeID,
                        EmployeeName = @EmployeeName,
                        Gender = @Gender,
                        Age = @Age,
                        Department = @Department,
                        PermissionLevel = @PermissionLevel,
                        PhoneNumber = @PhoneNumber,
                        Email = @Email,
                        IsActive = @IsActive,
                        Remarks = @Remarks,
                        UpdatedAt = GETDATE(),
                        UpdatedBy = @UpdatedBy";

                        // 如果密码不为空，也更新密码
                        if (!string.IsNullOrEmpty(txtPassword.Text))
                        {
                            updateQuery += ", PasswordHash = @PasswordHash";
                        }

                        updateQuery += " WHERE EmployeeID = @OldEmployeeID";

                        SqlCommand cmd = new SqlCommand(updateQuery, conn);
                        AddEmployeeParameters(cmd, employeeId, employeeName, Session["EmployeeID"].ToString());

                        if (!string.IsNullOrEmpty(txtPassword.Text))
                        {
                            cmd.Parameters.AddWithValue("@PasswordHash", HashPassword(txtPassword.Text));
                        }

                        cmd.Parameters.AddWithValue("@OldEmployeeID", oldEmployeeId);

                        cmd.ExecuteNonQuery();
                    }
                    else
                    {
                        // 插入新员工
                        string insertQuery = @"
                    INSERT INTO EmployeeUser 
                    (EmployeeID, EmployeeName, Gender, Age, Department, PermissionLevel, 
                     PasswordHash, PhoneNumber, Email, CreatedAt, LastLogin, IsActive, 
                     Remarks, CreatedBy, UpdatedAt, UpdatedBy)
                    VALUES 
                    (@EmployeeID, @EmployeeName, @Gender, @Age, @Department, @PermissionLevel, 
                     @PasswordHash, @PhoneNumber, @Email, GETDATE(), NULL, @IsActive, 
                     @Remarks, @CreatedBy, GETDATE(), @CreatedBy)";

                        SqlCommand cmd = new SqlCommand(insertQuery, conn);
                        AddEmployeeParameters(cmd, employeeId, employeeName, Session["EmployeeID"].ToString());
                        cmd.Parameters.AddWithValue("@PasswordHash", HashPassword(txtPassword.Text));

                        cmd.ExecuteNonQuery();
                    }
                }

                // 保存成功后，重置表单并刷新数据
                ClearForm();
                BindEmployeeData();
                LoadDepartmentStats();

                // 更新UpdatePanels
                upMain.Update();
                upModal.Update();

                // 关闭模态框并显示成功消息
                string closeScript = @"
            <script>
                document.getElementById('employeeModal').style.display = 'none';
                alert('保存成功！');
            </script>";
                ClientScript.RegisterStartupScript(this.GetType(), "SaveSuccess", closeScript);

            }
            catch (Exception ex)
            {
                string script = $"<script>alert('保存失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "SaveError", script);
            }
        }

        // 添加清空表单的方法
        private void ClearForm()
        {
            txtEmployeeID.Text = "";
            txtEmployeeName.Text = "";
            txtAge.Text = "";
            txtPhoneNumber.Text = "";
            txtEmail.Text = "";
            txtRemarks.Text = "";
            txtPassword.Text = "";
            hdnEditEmployeeID.Value = "";
            hdnIsEditMode.Value = "false";
        }

        private void AddEmployeeParameters(SqlCommand cmd, string employeeId, string employeeName, string currentUser)
        {
            cmd.Parameters.AddWithValue("@EmployeeID", employeeId);
            cmd.Parameters.AddWithValue("@EmployeeName", employeeName);
            cmd.Parameters.AddWithValue("@Gender", ddlGenderModal.SelectedValue);

            int age = 0;
            int.TryParse(txtAge.Text, out age);
            cmd.Parameters.AddWithValue("@Age", age > 0 ? (object)age : DBNull.Value);

            cmd.Parameters.AddWithValue("@Department", ddlDepartment.SelectedValue);
            cmd.Parameters.AddWithValue("@PermissionLevel", Convert.ToInt32(ddlPermissionLevel.SelectedValue));
            cmd.Parameters.AddWithValue("@PhoneNumber", string.IsNullOrEmpty(txtPhoneNumber.Text) ? DBNull.Value : (object)txtPhoneNumber.Text);
            cmd.Parameters.AddWithValue("@Email", string.IsNullOrEmpty(txtEmail.Text) ? DBNull.Value : (object)txtEmail.Text);
            cmd.Parameters.AddWithValue("@IsActive", Convert.ToBoolean(ddlIsActive.SelectedValue));
            cmd.Parameters.AddWithValue("@Remarks", string.IsNullOrEmpty(txtRemarks.Text) ? DBNull.Value : (object)txtRemarks.Text);
            cmd.Parameters.AddWithValue("@CreatedBy", currentUser);
            cmd.Parameters.AddWithValue("@UpdatedBy", currentUser);
        }

        private string HashPassword(string password)
        {
            // 简单的密码哈希方法
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        private void DeleteEmployee(string employeeId)
        {
            try
            {
                // 防止删除当前登录用户
                if (employeeId == Session["EmployeeID"].ToString())
                {
                    string script = "<script>alert('不能删除当前登录用户！');</script>";
                    ClientScript.RegisterStartupScript(this.GetType(), "DeleteSelfError", script);
                    return;
                }

                string connectionString = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = "DELETE FROM EmployeeUser WHERE EmployeeID = @EmployeeID";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@EmployeeID", employeeId);

                    conn.Open();
                    int rowsAffected = cmd.ExecuteNonQuery();

                    if (rowsAffected > 0)
                    {
                        string script = "<script>alert('删除成功！');</script>";
                        ClientScript.RegisterStartupScript(this.GetType(), "DeleteSuccess", script);
                        BindEmployeeData();
                        LoadDepartmentStats();
                        upMain.Update();
                    }
                    else
                    {
                        string script = "<script>alert('删除失败：员工不存在！');</script>";
                        ClientScript.RegisterStartupScript(this.GetType(), "DeleteFail", script);
                    }
                }
            }
            catch (SqlException ex)
            {
                // 处理外键约束错误
                if (ex.Number == 547) // 外键约束错误代码
                {
                    string script = "<script>alert('删除失败：该员工有相关记录（如请假、考核等），无法删除！');</script>";
                    ClientScript.RegisterStartupScript(this.GetType(), "DeleteConstraintError", script);
                }
                else
                {
                    string script = $"<script>alert('删除失败: {ex.Message.Replace("'", "\\'")}');</script>";
                    ClientScript.RegisterStartupScript(this.GetType(), "DeleteError", script);
                }
            }
            catch (Exception ex)
            {
                string script = $"<script>alert('删除失败: {ex.Message.Replace("'", "\\'")}');</script>";
                ClientScript.RegisterStartupScript(this.GetType(), "DeleteError", script);
            }
        }

        protected void btnExport_Click(object sender, EventArgs e)
        {
            try
            {
                // Excel导出逻辑
                Response.Clear();
                Response.Buffer = true;
                Response.ContentType = "application/vnd.ms-excel";
                Response.AddHeader("content-disposition", "attachment;filename=员工列表.xls");
                Response.Charset = "utf-8";
                Response.ContentEncoding = System.Text.Encoding.UTF8;

                gvEmployees.AllowPaging = false;
                BindEmployeeData();

                System.IO.StringWriter sw = new System.IO.StringWriter();
                System.Web.UI.HtmlTextWriter hw = new System.Web.UI.HtmlTextWriter(sw);
                gvEmployees.RenderControl(hw);

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
                gvEmployees.AllowPaging = true;
            }
        }

        protected void btnPrint_Click(object sender, EventArgs e)
        {
            // 打印逻辑
            string script = "<script>window.print();</script>";
            ClientScript.RegisterStartupScript(this.GetType(), "PrintPage", script);
        }

        public override void VerifyRenderingInServerForm(Control control)
        {
            // 解决GridView导出Excel时的警告
            // 不需要在此处写任何代码
        }
    }
}