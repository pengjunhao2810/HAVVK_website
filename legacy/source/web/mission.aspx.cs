using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls; // 必须：解决HtmlGenericControl

namespace WebApplication1
{
    public partial class mission : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // 未登录则跳转登录页
            if (Session["EmployeeID"] == null)
            {
                Response.Redirect("WebForm2.aspx");
                return;
            }

            // 首次加载绑定任务列表
            if (!IsPostBack)
            {
                BindMissionRecords();
            }

            // 隐藏提示信息
            lblSuccess.Visible = false;
        }

        /// <summary>
        /// 绑定当前员工的任务列表
        /// </summary>
        private void BindMissionRecords()
        {
            try
            {
                string empId = Session["EmployeeID"].ToString();
                string connStr = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    string sql = @"
                        SELECT ID, EmployeeID, MissionContent, MissionDeadline, IsCompleted
                        FROM EmployeeMission 
                        WHERE EmployeeID = @EmployeeID
                        ORDER BY IsCompleted ASC, MissionDeadline ASC";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@EmployeeID", empId);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    // 绑定到Repeater
                    if (dt.Rows.Count > 0)
                    {
                        rptMissions.DataSource = dt;
                        rptMissions.DataBind();
                        pnlNoData.Visible = false;
                    }
                    else
                    {
                        rptMissions.DataSource = null;
                        rptMissions.DataBind();
                        pnlNoData.Visible = true;
                    }
                }
            }
            catch (Exception ex)
            {
                pnlNoData.Visible = true;
                pnlNoData.Controls.Clear();
                pnlNoData.Controls.Add(new LiteralControl($"加载任务失败：{ex.Message}"));
            }
        }

        /// <summary>
        /// 标记任务为已完成（核心功能）
        /// </summary>
        protected void lnkComplete_Click(object sender, EventArgs e)
        {
            try
            {
                // 获取任务ID
                LinkButton lnkBtn = (LinkButton)sender;
                int missionId = Convert.ToInt32(lnkBtn.CommandArgument);
                string empId = Session["EmployeeID"].ToString();

                // 更新数据库状态
                string connStr = ConfigurationManager.ConnectionStrings["HRConnectionString"].ConnectionString;
                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    string sql = @"
                        UPDATE EmployeeMission 
                        SET IsCompleted = 1, CompleteTime = GETDATE()
                        WHERE ID = @MissionID AND EmployeeID = @EmployeeID";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@MissionID", missionId);
                    cmd.Parameters.AddWithValue("@EmployeeID", empId);

                    conn.Open();
                    int rows = cmd.ExecuteNonQuery();

                    if (rows > 0)
                    {
                        // 显示成功提示+刷新列表
                        lblSuccess.Text = "任务已标记为完成！";
                        lblSuccess.Visible = true;
                        BindMissionRecords();
                    }
                    else
                    {
                        lblSuccess.Text = "任务状态更新失败，请重试！";
                        lblSuccess.CssClass = "error-msg"; // 临时改样式为错误
                        lblSuccess.Visible = true;
                    }
                }
            }
            catch (Exception ex)
            {
                lblSuccess.Text = $"标记失败：{ex.Message}";
                lblSuccess.CssClass = "error-msg";
                lblSuccess.Visible = true;
            }
        }

        /// <summary>
        /// Repeater行绑定：设置卡片样式和状态标签
        /// </summary>
        protected void rptMissions_ItemDataBound(object sender, RepeaterItemEventArgs e)
        {
            if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
            {
                // 获取数据项
                DataRowView drv = (DataRowView)e.Item.DataItem;
                bool isCompleted = Convert.ToBoolean(drv["IsCompleted"]);

                // 设置任务卡片样式
                HtmlGenericControl missionCard = (HtmlGenericControl)e.Item.FindControl("missionCard");
                if (isCompleted)
                {
                    missionCard.Attributes["class"] = "mission-card completed";
                }

                // 设置状态标签
                Label lblStatus = (Label)e.Item.FindControl("lblStatus");
                if (isCompleted)
                {
                    lblStatus.Text = "已完成";
                    lblStatus.CssClass = "status-tag status-completed";
                }
                else
                {
                    lblStatus.Text = "未完成";
                    lblStatus.CssClass = "status-tag status-unfinished";
                }
            }
        }
    }
}