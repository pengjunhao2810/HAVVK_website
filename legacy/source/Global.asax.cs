using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.UI; // 添加这个命名空间

namespace WebApplication1
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            // 为 WebForms 页面注册 jQuery 脚本映射
            RegisterScriptMappings();

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        private void RegisterScriptMappings()
        {
            // 检查 ScriptManager 是否存在（针对 WebForms 页面）
            if (ScriptManager.ScriptResourceMapping.GetDefinition("jquery") == null)
            {
                ScriptManager.ScriptResourceMapping.AddDefinition("jquery",
                    new ScriptResourceDefinition
                    {
                        Path = "~/Scripts/jquery-3.6.0.min.js",
                        DebugPath = "~/Scripts/jquery-3.6.0.js",
                        CdnPath = "https://code.jquery.com/jquery-3.6.0.min.js",
                        CdnDebugPath = "https://code.jquery.com/jquery-3.6.0.js",
                        CdnSupportsSecureConnection = true,
                        LoadSuccessExpression = "window.jQuery"
                    });
            }
        }
    }
}