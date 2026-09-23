/* ============================================================
   HAWK 哈夫克集团 · HR 系统应用逻辑
   对应原系统全部页面服务：登录(WebForm2) / 管理员(WebForm1) /
   员工门户(WebForm3) / 主管门户(WebForm4) / 打卡(daka) /
   请假(qingjia) / 请假审批(LeaveApproval) / 任务(mission) /
   绩效评审(PerformanceReview) / 部门报表(DepartmentReport) /
   部门员工管理(DepartmentEmployeeManagement) / 个人资料(profile)
   ============================================================ */
$(function () {
    HRDB.load();

    var Session = {
        user: null
    };

    // 单账户会话（localStorage: havvk_hr_session）
    var SESSION_KEY = 'havvk_hr_session';
    function readSession() {
        try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
        catch (e) { return null; }
    }
    function writeSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
    function clearSession() { localStorage.removeItem(SESSION_KEY); }

    var PERM = {
        1: { name: '普通员工', nav: ['dashboard', 'todo', 'globalSearch', 'groupNews', 'directory', 'leave', 'taskCenter', 'duty', 'schedule', 'salaryCenter', 'logistics', 'hrService', 'training', 'fileVault', 'weekly', 'knowledge', 'poll', 'alert', 'feedbackCenter', 'archive', 'printForm'] },
        2: { name: '部门主管', nav: ['dashboard', 'todo', 'globalSearch', 'groupNews', 'directory', 'leave', 'taskCenter', 'duty', 'schedule', 'salaryCenter', 'meeting', 'logistics', 'hrService', 'training', 'fileVault', 'weekly', 'knowledge', 'poll', 'alert', 'feedbackCenter', 'archive', 'printForm', 'approvalCenter', 'performance', 'taskAdmin', 'orgManage', 'dataReport', 'careReminder'] },
        3: { name: '管理员', nav: ['dashboard', 'systemLog', 'systemConfig', 'contentAdmin', 'security', 'contract', 'asset', 'orgManage', 'dataReport', 'roleManage', 'todo', 'globalSearch', 'groupNews', 'directory', 'leave', 'duty', 'schedule', 'salaryCenter', 'meeting', 'logistics', 'hrService', 'training', 'fileVault', 'weekly', 'knowledge', 'poll', 'alert', 'feedbackCenter', 'archive', 'printForm', 'approvalCenter', 'performance', 'taskAdmin', 'careReminder'] }
    };

    // ===================== 工具 =====================
    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function toast(msg, type) {
        var t = $('#toast');
        t.text(msg).attr('class', 'toast show ' + (type || ''));
        clearTimeout(t.data('timer'));
        t.data('timer', setTimeout(function () { t.removeClass('show'); }, 2600));
    }
    function showModal(title, bodyHtml, footHtml) {
        $('#modalTitle').text(title);
        $('#modalBody').html(bodyHtml);
        $('#modalFoot').html(footHtml || '');
        $('#modalMask').addClass('show');
    }
    function closeModal() { $('#modalMask').removeClass('show'); }

    // ---------- 附件渲染 / 下载 ----------
    function fmtSize(sz) {
        sz = sz || 0;
        if (sz < 1024) return sz + ' B';
        if (sz < 1048576) return (sz / 1024).toFixed(1) + ' KB';
        return (sz / 1048576).toFixed(1) + ' MB';
    }
    function attListHtml(list, label) {
        list = list || [];
        if (!list.length) return '';
        var h = '<div class="att-list">' + (label ? '<div class="att-label">' + esc(label) + '</div>' : '');
        list.forEach(function (a) {
            h += '<span class="att-chip" data-file="' + esc(a.FileId) + '" title="点击下载 ' + esc(a.FileName) + '">📎 ' + esc(a.FileName) + ' <em>' + fmtSize(a.FileSize) + '</em></span>';
        });
        h += '</div>';
        return h;
    }
    function bindAttDownloads(scope) {
        $(scope + ' .att-chip[data-file]').off('click').on('click', function () {
            var fid = $(this).data('file');
            var chip = $(this);
            HRFiles.get(fid).then(function (rec) {
                if (!rec || !rec.blob) { toast('附件不存在或已删除', 'error'); return; }
                var url = URL.createObjectURL(rec.blob);
                var a = document.createElement('a');
                a.href = url; a.download = rec.name || '附件';
                document.body.appendChild(a); a.click();
                setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
            }).catch(function () { toast('读取附件失败', 'error'); });
        });
    }
    // 收集所选文件并保存到 IndexedDB，返回 Promise<附件元信息数组>
    function saveFiles(files) {
        var arr = Array.prototype.slice.call(files || []);
        if (!arr.length) return Promise.resolve([]);
        return Promise.all(arr.map(function (f) {
            return HRFiles.save(f).then(function (fid) {
                return { FileId: fid, FileName: f.name, FileSize: f.size };
            });
        }));
    }

    function statusTag(s) {
        var map = {
            '待审批': 'tag-gold', '已批准': 'tag-green', '已拒绝': 'tag-red',
            '待提交': 'tag-gold', '已提交': 'tag-blue', '已审核': 'tag-green',
            '在职': 'tag-green', '离职': 'tag-red', '启用': 'tag-green', '禁用': 'tag-gray',
            '待处理': 'tag-gold', '已处理': 'tag-green'
        };
        var cls = map[s] || 'tag-gray';
        return '<span class="tag ' + cls + '">' + esc(s) + '</span>';
    }
    function shiftTag(s) {
        var map = { '早班': 'tag-green', '晚班': 'tag-blue', '夜班': 'tag-gold' };
        return '<span class="tag ' + (map[s] || 'tag-gray') + '">' + esc(s || '—') + '</span>';
    }
    function currentWeekLabel() {
        var now = new Date();
        var d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        var dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return d.getUTCFullYear() + '年第' + weekNo + '周';
    }
    function scoreClass(sc) {
        var v = parseFloat(sc) || 0;
        if (v >= 90) return 'tag-green';
        if (v >= 80) return 'tag-blue';
        if (v >= 70) return 'tag-gold';
        return 'tag-red';
    }
    function qualityTag(q) {
        var map = { '优秀': 'tag-green', '良好': 'tag-blue', '一般': 'tag-gold', '待改进': 'tag-red' };
        return '<span class="tag ' + (map[q] || 'tag-gray') + '">' + esc(q || '—') + '</span>';
    }

    // ===================== 导航 =====================
    var NAV_DEF = {
        groupNews: { ico: '📢', title: '集团动态', subtitle: 'News' },
        messages: { ico: '💬', title: '消息中心', subtitle: 'Messages' },
        attendanceCenter: { ico: '◷', title: '考勤中心', subtitle: 'Attendance' },
        taskCenter: { ico: '✎', title: '任务中心', subtitle: 'Missions' },
        taskAdmin: { ico: '▣', title: '任务管理', subtitle: 'Assign' },
        approvalCenter: { ico: '☑', title: '审批中心', subtitle: 'Approval' },
        performance: { ico: '◈', title: '绩效管理', subtitle: 'Performance' },
        orgManage: { ico: '☷', title: '组织管理', subtitle: 'Org' },
        dataReport: { ico: '▥', title: '数据报表', subtitle: 'Reports' },
        hrService: { ico: '☰', title: '人事服务', subtitle: 'HR' },
        logistics: { ico: '¥', title: '行政后勤', subtitle: 'Logistics' },
        archive: { ico: '◉', title: '干员档案', subtitle: 'Archive' },
        weekly: { ico: '▤', title: '工作周报', subtitle: 'Weekly' },
        feedbackCenter: { ico: '✉', title: '意见反馈', subtitle: 'Feedback' },
        salaryCenter: { ico: '¥', title: '薪资中心', subtitle: 'Salary' },
        systemLog: { ico: '▦', title: '系统日志', subtitle: 'Logs' },
        contentAdmin: { ico: '▤', title: '内容管理', subtitle: 'Content' },
        systemConfig: { ico: '⚙', title: '系统设置', subtitle: 'Settings' },
        dashboard: { ico: '▣', title: '工作台', subtitle: 'Overview' },
        todo: { ico: '◫', title: '待办中心', subtitle: 'Work Center' },
        announcement: { ico: '📢', title: '集团公告', subtitle: 'Bulletin' },
        milestones: { ico: '🏛', title: '集团大事记', subtitle: 'Timeline' },
        directory: { ico: '☏', title: '内部通讯录', subtitle: 'Directory' },
        message: { ico: '💬', title: '消息中心', subtitle: 'Messages' },
        duty: { ico: '◈', title: '值班排班', subtitle: 'Duty' },
        feedback: { ico: '✉', title: '意见反馈', subtitle: 'Feedback' },
        feedbackAdmin: { ico: '✉', title: '反馈处理', subtitle: 'Feedback' },
        expense: { ico: '¥', title: '差旅报销', subtitle: 'Expense' },
        training: { ico: '▤', title: '培训中心', subtitle: 'Training' },
        fileVault: { ico: '🗂', title: '文件柜', subtitle: 'File Vault' },
        weeklyReport: { ico: '▤', title: '工作周报', subtitle: 'Weekly' },
        equipment: { ico: '⌨', title: '设备申领', subtitle: 'Equipment' },
        recognition: { ico: '★', title: '员工嘉奖', subtitle: 'Recognition' },
        profileUpdate: { ico: '☰', title: '资料变更', subtitle: 'Profile' },
        attendance: { ico: '◷', title: '我的考勤', subtitle: 'Attendance' },
        leave: { ico: '▤', title: '请假申请', subtitle: 'Leave' },
        leaveApproval: { ico: '☑', title: '请假审批', subtitle: 'Approval' },
        mission: { ico: '✎', title: '我的任务', subtitle: 'Missions' },
        missionAdmin: { ico: '▣', title: '任务下发', subtitle: 'Assign' },
        review: { ico: '◈', title: '绩效考核', subtitle: 'Performance' },
        deptReport: { ico: '▥', title: '部门报表', subtitle: 'Report' },
        deptEmployee: { ico: '☰', title: '部门员工管理', subtitle: 'Employees' },
        employeeAdmin: { ico: '☷', title: '员工管理', subtitle: 'Employees' },
        departmentAdmin: { ico: '▦', title: '部门管理', subtitle: 'Departments' },
        profile: { ico: '◉', title: '个人信息', subtitle: 'Profile' },
        stats: { ico: '◪', title: '数据看板', subtitle: 'Analytics' },
        salary: { ico: '¥', title: '我的薪资', subtitle: 'Salary' },
        salaryAdmin: { ico: '¥', title: '薪资管理', subtitle: 'Payroll' },
        meeting: { ico: '▣', title: '会议管理', subtitle: 'Meeting' },
        schedule: { ico: '▦', title: '日程日历', subtitle: 'Calendar' },
        knowledge: { ico: '▤', title: '知识库', subtitle: 'Knowledge' },
        poll: { ico: '☑', title: '投票问卷', subtitle: 'Poll' },
        alert: { ico: '◉', title: '演习警报', subtitle: 'Alert' },
        adminRequest: { ico: '▣', title: '行政申请', subtitle: 'Request' },
        adminReqApproval: { ico: '☑', title: '行政审批', subtitle: 'Approval' },
        skill: { ico: '★', title: '技能矩阵', subtitle: 'Skill' },
        contract: { ico: '▤', title: '合同管理', subtitle: 'Contract' },
        asset: { ico: '▦', title: '固定资产', subtitle: 'Asset' },
        export: { ico: '↧', title: '数据导出', subtitle: 'Export' },
        globalSearch: { ico: '⌕', title: '全局搜索', subtitle: 'Search' },
        groupChat: { ico: '▣', title: '部门群聊', subtitle: 'Group Chat' },
        workflow: { ico: '▥', title: '人事流程', subtitle: 'Workflow' },
        printForm: { ico: '▤', title: '打印单据', subtitle: 'Print' },
        rankUpgrade: { ico: '★', title: '干员晋级', subtitle: 'Promotion' },
        operatorProfile: { ico: '◉', title: '干员履历', subtitle: 'Profile' },
        approvalHub: { ico: '☑', title: '统一审批', subtitle: 'Approval Hub' },
        attendanceAbnormal: { ico: '◷', title: '考勤异常', subtitle: 'Abnormal' },
        backup: { ico: '↥', title: '数据备份', subtitle: 'Backup' },
        auditLog: { ico: '▦', title: '操作日志', subtitle: 'Audit' },
        warReport: { ico: '▣', title: '集团战报', subtitle: 'Report' },
        attendanceReport: { ico: '▥', title: '考勤报表', subtitle: 'Report' },
        attendanceRule: { ico: '◷', title: '考勤规则', subtitle: 'Rules' },
        delegation: { ico: '⇄', title: '审批代理', subtitle: 'Delegate' },
        resignHandover: { ico: '◈', title: '离职交接', subtitle: 'Handover' },
        orgChart: { ico: '◫', title: '组织架构', subtitle: 'Org Chart' },
        headcount: { ico: '▤', title: '编制管理', subtitle: 'Headcount' },
        security: { ico: '◈', title: '安全中心', subtitle: 'Security' },
        deptWeekly: { ico: '▥', title: '部门周报', subtitle: 'Weekly' },
        careReminder: { ico: '♡', title: '团队关怀', subtitle: 'Care' },
        // V15 管理后台扩展
        regApproval: { ico: '☷', title: '注册审批', subtitle: 'Register' },
        roleManage: { ico: '▤', title: '角色管理', subtitle: 'Roles' },
        commentAdmin: { ico: '☑', title: '评论管理', subtitle: 'Comments' },
        imgManage: { ico: '▣', title: '图片管理', subtitle: 'Images' },
        loginLog: { ico: '▥', title: '登录日志', subtitle: 'Login Log' },
        errorLog: { ico: '◉', title: '异常日志', subtitle: 'Errors' },
        siteConfig: { ico: '⚙', title: '网站配置', subtitle: 'Settings' }
    };
    var NAV_GROUP = {
        'groupNews': '集团动态', 'messages': '集团动态',
        'attendanceCenter': '日常考勤', 'taskCenter': '日常考勤',
        'taskAdmin': '管理审批', 'approvalCenter': '管理审批', 'performance': '管理审批', 'orgManage': '管理审批', 'dataReport': '管理审批',
        'hrService': '员工服务', 'logistics': '员工服务', 'weekly': '员工服务',
        'feedbackCenter': '互动参与',
        'archive': '账户', 'salaryCenter': '我的工作',
        'systemLog': '系统管理', 'contentAdmin': '系统管理', 'systemConfig': '系统管理',
        'dashboard': '总览',
        'stats': '总览', 'warReport': '总览', 'globalSearch': '总览',
        'todo': '我的工作', 'salary': '我的工作', 'meeting': '我的工作', 'schedule': '我的工作',
        'attendance': '日常考勤', 'leave': '日常考勤', 'mission': '日常考勤', 'duty': '日常考勤',
        'announcement': '集团动态', 'milestones': '集团动态', 'directory': '集团动态', 'message': '集团动态', 'recognition': '集团动态', 'knowledge': '集团动态', 'poll': '集团动态', 'alert': '集团动态', 'groupChat': '集团动态',
        'expense': '员工服务', 'training': '员工服务', 'profileUpdate': '员工服务', 'fileVault': '员工服务', 'weeklyReport': '员工服务', 'equipment': '员工服务', 'adminRequest': '员工服务', 'workflow': '员工服务', 'rankUpgrade': '员工服务', 'printForm': '员工服务',
        'feedback': '互动参与', 'feedbackAdmin': '互动参与',
        'missionAdmin': '管理审批', 'leaveApproval': '管理审批', 'review': '管理审批', 'deptReport': '管理审批', 'deptEmployee': '管理审批', 'adminReqApproval': '管理审批', 'skill': '管理审批', 'approvalHub': '管理审批', 'attendanceAbnormal': '管理审批', 'attendanceReport': '管理审批', 'delegation': '管理审批', 'deptWeekly': '管理审批', 'careReminder': '管理审批',
        'employeeAdmin': '系统管理', 'departmentAdmin': '系统管理', 'salaryAdmin': '系统管理', 'contract': '系统管理', 'asset': '系统管理', 'export': '系统管理', 'backup': '系统管理', 'auditLog': '系统管理', 'attendanceRule': '系统管理', 'resignHandover': '系统管理', 'orgChart': '系统管理', 'headcount': '系统管理', 'security': '系统管理',
        // V15 后台六大模块分组
        'regApproval': '用户管理',
        'roleManage': '权限管理',
        'commentAdmin': '内容管理', 'imgManage': '内容管理',
        'loginLog': '日志管理', 'errorLog': '日志管理',
        'siteConfig': '系统设置',
        'profile': '账户', 'operatorProfile': '账户'
    };

    function renderNav() {
        var perm = Session.user.PermissionLevel;
        var nav = PERM[perm].nav;
        // V15 角色导航白名单（自定义角色限制菜单）
        try {
            var role = HRDB.getRoleByEmp(Session.user);
            if (role && role.AllowedNav && role.AllowedNav.length) {
                nav = nav.filter(function (k) { return role.AllowedNav.indexOf(k) >= 0; });
            }
        } catch (e) { }
        var html = '';
        var lastGroup = '';
        nav.forEach(function (key) {
            var g = NAV_GROUP[key];
            if (g !== lastGroup) {
                html += '<div class="nav-group">' + esc(g) + '</div>';
                lastGroup = g;
            }
            var d = NAV_DEF[key];
            var navTitle = d.title;
            if (perm === 3) { // 管理员视角菜单名
                if (key === 'attendance') navTitle = '考勤记录';
                if (key === 'leave') navTitle = '请假记录';
            }
            html += '<a href="javascript:;" data-view="' + key + '" class="nav-item"><span class="nav-ico">' + d.ico + '</span><span>' + navTitle + '</span></a>';
        });
        $('#sideNav').html(html);
        $('#sideNav .nav-item').off('click').on('click', function () {
            var v = $(this).data('view');
            showView(v);
            $('#appSidebar').removeClass('open');
            $('#sidebarMask').removeClass('show');
        });
    }

    function canView(key) {
        // 工作台常驻视图：不在侧边栏，但从工作台卡片可进入
        if (key === 'attendanceCenter' || key === 'messages') return true;
        var perm = Session.user.PermissionLevel;
        var nav = PERM[perm].nav;
        // 与 renderNav 同源的导航白名单（含自定义角色限制）
        try {
            var role = HRDB.getRoleByEmp(Session.user);
            if (role && role.AllowedNav && role.AllowedNav.length) {
                nav = nav.filter(function (k) { return role.AllowedNav.indexOf(k) >= 0; });
            }
        } catch (e) { }
        return nav.indexOf(key) >= 0;
    }

    function showView(view) {
        // V17 视图权限门禁：不在当前角色导航白名单内 → 拒绝并回工作台
        if (!VIEWS[view]) { toast('功能不存在', 'error'); return; }
        if (!canView(view)) {
            toast('无权限访问该功能', 'error');
            showView('dashboard');
            return;
        }
        $('.nav-item').removeClass('active');
        $('.nav-item[data-view="' + view + '"]').addClass('active');
        var d = NAV_DEF[view];
        var t = d.title;
        if (Session.user.PermissionLevel === 3) { // 管理员视角菜单名
            if (view === 'attendanceCenter') t = '考勤记录';
            if (view === 'leave') t = '请假记录';
        }
        $('#pageTitle').html(t + '<small>' + d.subtitle + '</small>');
        VIEWS[view]();
        // 页脚（网站配置 FooterText）
        var ft = '';
        try {
            var s = HRDB.getSettings();
            if (s && s.FooterText) ft = s.FooterText;
        } catch (e) { }
        var appContent = $('#appContent');
        if (appContent.find('.app-footer').length === 0) {
            appContent.append('<div class="app-footer" id="appFooter"></div>');
        }
        $('#appFooter').text(ft || 'HAVVK GROUP © 2026 哈夫克集团版权所有');
    }

    // ===================== 视图 =====================
    var VIEWS = {};

    // 融合视图容器：多标签页（懒加载渲染到 #fusedBody，支持 __fusedRerender 重渲染当前页）
    function renderTabsView(tabs, renderers, active) {
        var html = '<div class="fused-tabs">';
        tabs.forEach(function (t) {
            html += '<a href="javascript:;" class="fused-tab' + (t.key === active ? ' active' : '') + '" data-tab="' + t.key + '">' + esc(t.label) + '</a>';
        });
        html += '</div><div id="fusedBody"></div>';
        $('#appContent').html(html);
        var c = $('#fusedBody');
        var current = active;
        function renderTab(k) {
            window.__fusedRerender = function () { renderTab(k); };
            if (renderers[k]) renderers[k](c);
        }
        renderTab(current);
        $('#appContent .fused-tab').off('click').on('click', function () {
            current = $(this).data('tab');
            $('#appContent .fused-tab').removeClass('active');
            $(this).addClass('active');
            c.empty();
            renderTab(current);
        });
    }

    // ---------- 系统日志（管理员：操作 / 登录 / 异常） ----------
    VIEWS.systemLog = function () {
        renderTabsView([
            { key: 'audit', label: '操作日志' },
            { key: 'login', label: '登录日志' },
            { key: 'error', label: '异常日志' }
        ], {
            audit: function (c) { VIEWS.auditLog(c); },
            login: function (c) { VIEWS.loginLog(c); },
            error: function (c) { VIEWS.errorLog(c); }
        }, 'audit');
    };

    // ---------- 工作台 ----------

    // ---------- 数据报表（主管/管理员：考勤报表 / 部门报表 / 集团战报 / 数据看板） ----------
    VIEWS.dataReport = function () {
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var tabs = [
            { key: 'attendance', label: '考勤报表' },
            { key: 'dept', label: '部门报表' }
        ];
        if (isAdmin) {
            tabs.push({ key: 'war', label: '集团战报' });
            tabs.push({ key: 'stats', label: '数据看板' });
        }
        renderTabsView(tabs, {
            attendance: function (c) { VIEWS.attendanceReport(c); },
            dept: function (c) { VIEWS.deptReport(c); },
            war: function (c) { VIEWS.warReport(c); },
            stats: function (c) { VIEWS.stats(c); }
        }, tabs[0].key);
    };


    // ---------- 集团动态（公告 / 嘉奖 / 大事记） ----------
    VIEWS.groupNews = function () {
        renderTabsView([
            { key: 'ann', label: '集团公告' },
            { key: 'rec', label: '员工嘉奖' },
            { key: 'mile', label: '集团大事记' }
        ], {
            ann: function (c) { VIEWS.announcement(c); },
            rec: function (c) { VIEWS.recognition(c); },
            mile: function (c) { VIEWS.milestones(c); }
        }, 'ann');
    };


    // ---------- 消息中心（会话 / 部门群聊） ----------
    VIEWS.messages = function () {
        renderTabsView([
            { key: 'conv', label: '消息会话' },
            { key: 'group', label: '部门群聊' }
        ], {
            conv: function (c) { VIEWS.message(c); },
            group: function (c) { VIEWS.groupChat(c); }
        }, 'conv');
    };


    // ---------- 人事服务（人事流程 / 干员晋级 / 资料变更 / 离职交接[管理]） ----------
    VIEWS.hrService = function () {
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var tabs = [
            { key: 'flow', label: '人事流程' },
            { key: 'rank', label: '干员晋级' },
            { key: 'pup', label: '资料变更' }
        ];
        if (isAdmin) tabs.push({ key: 'resign', label: '离职交接' });
        renderTabsView(tabs, {
            flow: function (c) { VIEWS.workflow(c); },
            rank: function (c) { VIEWS.rankUpgrade(c); },
            pup: function (c) { VIEWS.profileUpdate(c); },
            resign: function (c) { VIEWS.resignHandover(c); }
        }, tabs[0].key);
    };


    // ---------- 行政后勤（差旅报销 / 办公设备 / 行政申请） ----------
    VIEWS.logistics = function () {
        renderTabsView([
            { key: 'exp', label: '差旅报销' },
            { key: 'equip', label: '办公设备' },
            { key: 'adm', label: '行政申请' }
        ], {
            exp: function (c) { VIEWS.expense(c); },
            equip: function (c) { VIEWS.equipment(c); },
            adm: function (c) { VIEWS.adminRequest(c); }
        }, 'exp');
    };


    // ---------- 干员档案（我的档案 / 干员档案） ----------
    VIEWS.archive = function () {
        var t = window.__archiveTab || 'my';
        window.__archiveTab = null;
        renderTabsView([
            { key: 'my', label: '我的档案' },
            { key: 'ops', label: '干员档案' }
        ], {
            my: function (c) { VIEWS.profile(c); },
            ops: function (c) { VIEWS.operatorProfile(c); }
        }, t);
    };


    // ---------- 周报（周报提交 / 部门周报汇总） ----------
    VIEWS.weekly = function () {
        var u = Session.user;
        var tabs = [{ key: 'mine', label: '我的周报' }];
        if (u.PermissionLevel >= 2) tabs.push({ key: 'dept', label: '部门周报汇总' });
        renderTabsView(tabs, {
            mine: function (c) { VIEWS.weeklyReport(c); },
            dept: function (c) { VIEWS.deptWeekly(c); }
        }, 'mine');
    };


    // ---------- 绩效管理（主管/管理员：绩效评审 / 技能认证） ----------
    VIEWS.performance = function () {
        renderTabsView([
            { key: 'rv', label: '绩效评审' },
            { key: 'sk', label: '技能认证' }
        ], {
            rv: function (c) { VIEWS.review(c); },
            sk: function (c) { VIEWS.skill(c); }
        }, 'rv');
    };

    // ---------- 审批中心（主管/管理员：请假 / 行政 / 聚合 / 委托） ----------
    VIEWS.approvalCenter = function () {
        renderTabsView([
            { key: 'leave', label: '请假审批' },
            { key: 'admin', label: '行政审批' },
            { key: 'hub', label: '聚合审批' },
            { key: 'dg', label: '委托设置' }
        ], {
            leave: function (c) { VIEWS.leaveApproval(c); },
            admin: function (c) { VIEWS.adminReqApproval(c); },
            hub: function (c) { VIEWS.approvalHub(c); },
            dg: function (c) { VIEWS.delegation(c); }
        }, 'leave');
    };


    // ---------- 任务中心（我的任务 / 战情简报） ----------
    VIEWS.taskCenter = function () {
        renderTabsView([
            { key: 'ms', label: '我的任务' }
        ], {
            ms: function (c) { VIEWS.mission(c); }
        }, 'ms');
    };

    // ---------- 任务管理（主管/管理员：任务下发 / 简报发布） ----------
    VIEWS.taskAdmin = function () {
        renderTabsView([
            { key: 'mh', label: '任务下发' }
        ], {
            mh: function (c) { VIEWS.missionAdmin(c); }
        }, 'mh');
    };

    // ---------- 考勤中心（我的考勤 / 异常审核 / 考勤规则） ----------
    VIEWS.attendanceCenter = function () {
        var u = Session.user;
        var tabs = [{ key: 'my', label: (u.PermissionLevel === 3 ? '考勤记录' : '我的考勤') }];
        if (u.PermissionLevel >= 2) tabs.push({ key: 'abn', label: '异常审核' });
        if (u.PermissionLevel === 3) tabs.push({ key: 'rule', label: '考勤规则' });
        renderTabsView(tabs, {
            my: function (c) { VIEWS.attendance(c); },
            abn: function (c) { VIEWS.attendanceAbnormal(c); },
            rule: function (c) { VIEWS.attendanceRule(c); }
        }, 'my');
    };

    // ---------- 意见反馈（反馈提交 / 反馈处理） ----------
    VIEWS.feedbackCenter = function () {
        var u = Session.user;
        var tabs = [{ key: 'fb', label: '意见反馈' }];
        if (u.PermissionLevel >= 2) tabs.push({ key: 'fba', label: '反馈处理' });
        renderTabsView(tabs, {
            fb: function (c) { VIEWS.feedback(c); },
            fba: function (c) { VIEWS.feedbackAdmin(c); }
        }, 'fb');
    };

    // ---------- 薪资中心（我的薪资 / 薪资管理） ----------
    VIEWS.salaryCenter = function () {
        var u = Session.user;
        var tabs = [{ key: 'my', label: '我的薪资' }];
        if (u.PermissionLevel === 3) tabs.push({ key: 'adm', label: '薪资管理' });
        renderTabsView(tabs, {
            my: function (c) { VIEWS.salary(c); },
            adm: function (c) { VIEWS.salaryAdmin(c); }
        }, 'my');
    };

    // ---------- 组织管理（主管/管理员） ----------
    VIEWS.orgManage = function () {
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var tabs = [];
        if (isAdmin) {
            tabs.push({ key: 'emp', label: '员工管理' });
            tabs.push({ key: 'dept', label: '部门管理' });
            tabs.push({ key: 'chart', label: '组织架构' });
            tabs.push({ key: 'hc', label: '编制管理' });
        } else {
            tabs.push({ key: 'de', label: '部门员工' });
            tabs.push({ key: 'chart2', label: '组织架构' });
            tabs.push({ key: 'hc2', label: '编制管理' });
        }
        renderTabsView(tabs, {
            emp: function (c) { VIEWS.employeeAdmin(c); },
            dept: function (c) { VIEWS.departmentAdmin(c); },
            chart: function (c) { VIEWS.orgChart(c); },
            hc: function (c) { VIEWS.headcount(c); },
            de: function (c) { VIEWS.deptEmployee(c); },
            chart2: function (c) { VIEWS.orgChart(c); },
            hc2: function (c) { VIEWS.headcount(c); }
        }, tabs[0].key);
    };

    VIEWS.dashboard = function () {
        var u = Session.user;
        var permName = PERM[u.PermissionLevel].name;
        var deptName = HRDB.getDeptName(u.Department);
        // V16 工作台自定义：快捷操作 + 板块开关
        var prefs = HRDB.getDashPrefs(u.EmployeeID);
        var pan = prefs.panels || {};
        // 快捷操作（过滤出权限内有效视图）
        var permNav = PERM[u.PermissionLevel].nav;
        var quickKeys = (prefs.quick || []).filter(function (k) { return permNav.indexOf(k) >= 0 && NAV_DEF[k]; });
        if (!quickKeys.length) quickKeys = ['dashboard'];

        var html = '';
        html += '<div class="panel"><div class="panel-title">欢迎回来，' + esc(u.EmployeeName) + '</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">工号</div><div class="d-value">' + esc(u.EmployeeID) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">所属部门</div><div class="d-value">' + esc(deptName) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">角色权限</div><div class="d-value">' + statusTag(permName) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">系统状态</div><div class="d-value" style="color:var(--havvk-green);">运行正常</div></div>';
        html += '</div></div>';

        // 常驻：今日打卡 / 考勤概览
        html += '<div class="panel"><div class="panel-title">' + (u.PermissionLevel === 3 ? '📅 考勤概览' : '◷ 今日打卡') + '</div>';
        if (u.PermissionLevel === 3) {
            var _today = HRDB.today();
            var _allAtt = HRDB.getAttendance('');
            var _inCnt = _allAtt.filter(function (a) { return a.AttendanceDate === _today && a.CheckType === '上班'; }).length;
            var _outCnt = _allAtt.filter(function (a) { return a.AttendanceDate === _today && a.CheckType === '下班'; }).length;
            html += '<div class="detail-grid">';
            html += '<div class="detail-item"><div class="d-label">今日上班打卡</div><div class="d-value">' + _inCnt + ' 人</div></div>';
            html += '<div class="detail-item"><div class="d-label">今日下班打卡</div><div class="d-value">' + _outCnt + ' 人</div></div>';
            html += '<div class="detail-item"><div class="d-label">今日日期</div><div class="d-value">' + esc(_today) + '</div></div>';
            html += '</div>';
            html += '<div style="margin-top:10px;"><a href="javascript:;" class="btn btn-sm" data-goto="attendanceCenter">查看考勤记录 →</a></div>';
        } else {
            var _myAtt = HRDB.getAttendance(u.EmployeeID);
            var _myToday = _myAtt.filter(function (a) { return a.AttendanceDate === HRDB.today(); });
            var _in = null, _out = null;
            _myToday.forEach(function (a) { if (a.CheckType === '上班') _in = a; else if (a.CheckType === '下班') _out = a; });
            html += '<div class="detail-grid">';
            html += '<div class="detail-item"><div class="d-label">上班打卡</div><div class="d-value">' + (_in ? '<span class="tag tag-green">' + esc(_in.AttendanceTime) + '</span>' : '<span class="tag tag-gray">未打卡</span>') + '</div></div>';
            html += '<div class="detail-item"><div class="d-label">下班打卡</div><div class="d-value">' + (_out ? '<span class="tag tag-blue">' + esc(_out.AttendanceTime) + '</span>' : '<span class="tag tag-gray">未打卡</span>') + '</div></div>';
            html += '</div>';
            html += '<div style="margin-top:10px;"><a href="javascript:;" class="btn btn-sm btn-primary" id="dashClockIn">上班打卡</a> <a href="javascript:;" class="btn btn-sm" id="dashClockOut">下班打卡</a></div>';
        }
        html += '</div>';

        // 常驻：消息中心
        html += '<div class="panel"><div class="panel-title">💬 消息中心</div>';
        var convs = HRDB.getConversations(u.EmployeeID);
        if (!convs.length) {
            html += '<div class="empty-state" style="padding:14px;"><div class="empty-ico">💬</div>暂无会话<br/><span style="font-size:12px;">去「内部通讯录」搜索同事发起对话</span></div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>联系人</th><th>最近消息</th><th>时间</th></tr></thead><tbody>';
            convs.slice(0, 5).forEach(function (c) {
                var o = HRDB.getEmployeeById(c.OtherID) || { EmployeeName: c.OtherID, Department: '', PermissionLevel: 1 };
                var summary = c.LastType === 'image' ? '[图片]' : (c.LastType === 'file' ? '[文件] ' + c.LastMsg : (c.LastFrom === u.EmployeeID ? '我：' : '') + c.LastMsg);
                html += '<tr><td>' + esc(o.EmployeeName) + (c.Unread ? ' <span class="tag tag-red">' + c.Unread + '</span>' : '') + '</td><td>' + esc(summary) + '</td><td>' + esc(c.LastTime || '') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '<div style="margin-top:10px;"><a href="javascript:;" class="btn btn-sm" data-goto="messages">进入消息中心 →</a></div></div>';

        // 常驻：安全态势（仅管理员）
        if (u.PermissionLevel === 3 && pan.security !== false) {
            html += securityPanelHtml();
        }

        // 快捷操作（自定义）
        if (pan.quick !== false) {
            html += '<div class="panel"><div class="panel-title">⚡ 快捷操作 <span style="float:right;"><a href="javascript:;" class="btn btn-sm" id="dashCfg">⚙ 自定义</a></span></div>';
            html += '<div class="quick-grid">';
            quickKeys.forEach(function (k) {
                var d = NAV_DEF[k];
                html += '<a href="javascript:;" class="quick-item" data-goto="' + k + '"><span class="quick-ico">' + d.ico + '</span><span class="quick-name">' + esc(d.title) + '</span></a>';
            });
            html += '</div></div>';
        }

        // 最新公告
        if (pan.announce !== false) {
            var annScope = (u.PermissionLevel === 3) ? 'all' : u.Department;
            var latest = HRDB.getAnnouncements({ scope: annScope }).slice(0, 2);
            if (latest.length) {
                html += '<div class="panel"><div class="panel-title">📢 最新公告</div>';
                latest.forEach(function (a) {
                    var sc = a.Scope === '集团' ? '集团' : HRDB.getDeptName(a.Scope);
                    html += '<div class="ann-card">';
                    html += '<div class="ann-head"><span class="ann-tag">' + esc(sc) + '</span><span class="ann-title">' + esc(a.Title) + '</span></div>';
                    html += '<div class="ann-body">' + esc(a.Content) + '</div>';
                    html += '<div class="ann-meta">发布人：' + esc(a.PublisherName) + ' · ' + esc(a.PublishTime) + '</div>';
                    html += '</div>';
                });
                html += '<div style="margin-top:10px;"><a href="javascript:;" class="btn btn-sm" data-goto="groupNews">查看全部公告 →</a></div>';
                html += '</div>';
            }
        }

        // 统计卡
        if (pan.stats !== false) {
            if (u.PermissionLevel === 3) {
                var emps = HRDB.getEmployees();
                var today = HRDB.today();
                var todayNew = emps.filter(function (e) { return (e.CreatedAt || '').indexOf(today) === 0; }).length;
                var active = emps.filter(function (e) { return e.IsActive; }).length;
                var inactive = emps.length - active;
                var depts = HRDB.getDepartments().filter(function (d) { return d.IsActive; });
                html += '<div class="stat-grid">';
                html += '<div class="stat-card"><div class="stat-ico">👥</div><div class="stat-value">' + active + '</div><div class="stat-label">在职员工总数</div></div>';
                html += '<div class="stat-card"><div class="stat-ico">🆕</div><div class="stat-value">' + todayNew + '</div><div class="stat-label">今日新增</div><div class="stat-extra">' + esc(today) + '</div></div>';
                html += '<div class="stat-card"><div class="stat-ico">🏢</div><div class="stat-value">' + depts.length + '</div><div class="stat-label">启用部门数</div></div>';
                html += '<div class="stat-card"><div class="stat-ico">📤</div><div class="stat-value">' + inactive + '</div><div class="stat-label">离职员工数</div></div>';
                html += '</div>';
            } else if (u.PermissionLevel === 2) {
                var dept = HRDB.getDepartments().find(function (d) { return d.DepartmentCode === u.Department; });
                var empCount = HRDB.getEmployees({ department: u.Department }).filter(function (e) { return e.IsActive; }).length;
                var isMgr = dept && dept.ManagerID === u.EmployeeID;
                var pendingLeaves = HRDB.getLeaves({ status: '待审批' }).length;
                html += '<div class="stat-grid">';
                html += '<div class="stat-card"><div class="stat-ico">🏢</div><div class="stat-value">' + empCount + '</div><div class="stat-label">' + esc(deptName) + ' 在职员工</div></div>';
                html += '<div class="stat-card gold"><div class="stat-ico">☑</div><div class="stat-value">' + pendingLeaves + '</div><div class="stat-label">待审批请假</div></div>';
                html += '<div class="stat-card"><div class="stat-ico">◈</div><div class="stat-value">' + HRDB.getReviews().length + '</div><div class="stat-label">绩效考核记录</div></div>';
                html += '<div class="stat-card"><div class="stat-ico">' + (isMgr ? '★' : '○') + '</div><div class="stat-value">' + (isMgr ? '主管' : '成员') + '</div><div class="stat-label">部门角色</div></div>';
                html += '</div>';
            } else {
                var myLeaves = HRDB.getLeaves({ empId: u.EmployeeID });
                var pending = myLeaves.filter(function (l) { return l.Status === '待审批'; }).length;
                var myMissions = HRDB.getMissions(u.EmployeeID);
                var unfinished = myMissions.filter(function (m) { return !m.IsCompleted; }).length;
                html += '<div class="stat-grid">';
                html += '<div class="stat-card"><div class="stat-ico">◷</div><div class="stat-value">' + myLeaves.length + '</div><div class="stat-label">我的请假记录</div></div>';
                html += '<div class="stat-card gold"><div class="stat-ico">◷</div><div class="stat-value">' + pending + '</div><div class="stat-label">待审批申请</div></div>';
                html += '<div class="stat-card"><div class="stat-ico">✎</div><div class="stat-value">' + unfinished + '</div><div class="stat-label">未完成任务</div></div>';
                html += '<div class="stat-card"><div class="stat-ico">◷</div><div class="stat-value">' + HRDB.getAttendance(u.EmployeeID).length + '</div><div class="stat-label">本月考勤次数</div></div>';
                html += '</div>';
            }
        }

        // 最近入职（管理员）
        if (u.PermissionLevel === 3 && pan.recent !== false) {
            html += '<div class="panel" style="margin-top:24px;"><div class="panel-title">最近入职员工</div>' + recentEmployeeTable() + '</div>';
        }

        $('#appContent').html(html);
        $('#appContent a[data-goto]').off('click').on('click', function () { showView($(this).data('goto')); });
        $('#dashClockIn').off('click').on('click', function () {
            var r = HRDB.addAttendance(u.EmployeeID, u.EmployeeName, '上班打卡');
            toast(r.msg, r.ok ? 'success' : 'error');
            if (r.ok) setTimeout(function () { showView('dashboard'); }, 800);
        });
        $('#dashClockOut').off('click').on('click', function () {
            var r = HRDB.addAttendance(u.EmployeeID, u.EmployeeName, '下班打卡');
            toast(r.msg, r.ok ? 'success' : 'error');
            if (r.ok) setTimeout(function () { showView('dashboard'); }, 800);
        });

        // 自定义工作台
        $('#dashCfg').off('click').on('click', function () {
            var opts = permNav.filter(function (k) { return NAV_DEF[k]; }).map(function (k) {
                var d = NAV_DEF[k];
                var checked = quickKeys.indexOf(k) >= 0 ? ' checked' : '';
                return '<label class="chk-inline"><input type="checkbox" class="dq-nav" value="' + k + '"' + checked + '/> ' + d.ico + ' ' + esc(d.title) + '</label>';
            }).join('');
            var p = prefs.panels || {};
            showModal('自定义工作台', '' +
                '<p style="color:var(--havvk-text);font-size:13px;margin-bottom:6px;">快捷操作（勾选常用功能，最多 12 个）</p>' +
                '<div style="max-height:220px;overflow:auto;border:1px solid rgba(128,128,128,.25);border-radius:6px;padding:8px;margin-bottom:14px;">' + opts + '</div>' +
                '<p style="color:var(--havvk-text);font-size:13px;margin-bottom:6px;">工作台板块</p>' +
                '<label class="chk-inline"><input type="checkbox" class="dp-panel" value="quick"' + (p.quick !== false ? ' checked' : '') + '/> 快捷操作</label>' +
                '<label class="chk-inline"><input type="checkbox" class="dp-panel" value="stats"' + (p.stats !== false ? ' checked' : '') + '/> 数据统计</label>' +
                '<label class="chk-inline"><input type="checkbox" class="dp-panel" value="announce"' + (p.announce !== false ? ' checked' : '') + '/> 最新公告</label>' +
                (u.PermissionLevel === 3 ? '<label class="chk-inline"><input type="checkbox" class="dp-panel" value="recent"' + (p.recent !== false ? ' checked' : '') + '/> 最近入职</label>' : '') +
                (u.PermissionLevel === 3 ? '<label class="chk-inline"><input type="checkbox" class="dp-panel" value="security"' + (p.security !== false ? ' checked' : '') + '/> 安全态势</label>' : ''),
                '<a href="javascript:;" class="btn btn-primary" id="dqOk">保存</a><a href="javascript:;" class="btn" id="dqCancel">取消</a>');
            $('#dqOk').off('click').on('click', function () {
                var checked = $('.dq-nav:checked').map(function () { return this.value; }).get();
                if (checked.length > 12) { toast('快捷操作最多选择 12 个', 'error'); return; }
                if (!checked.length) { toast('请至少选择一个快捷操作', 'error'); return; }
                var np = {};
                $('.dp-panel').each(function () { np[this.value] = this.checked; });
                var r = HRDB.saveDashPrefs(u.EmployeeID, { quick: checked, panels: np });
                toast(r.ok ? '工作台已更新' : '保存失败', r.ok ? 'success' : 'error');
                closeModal();
                setTimeout(function () { showView('dashboard'); }, 600);
            });
            $('#dqCancel').off('click').on('click', closeModal);
        });
    };

    function securityPanelHtml() {
        var logs = HRDB.getErrorLogs().slice(0, 5);
        var h = '<div class="panel"><div class="panel-title">🛡 安全态势监控 <span style="float:right;"><a href="javascript:;" class="btn btn-sm" data-goto="systemLog">系统日志 →</a></span></div>';
        var today = HRDB.today();
        var logins = HRDB.getLoginLogs ? HRDB.getLoginLogs(1000) : [];
        var onlineSet = {};
        logins.forEach(function (l) { if ((l.Time || '').indexOf(today) === 0) onlineSet[l.OperatorID] = 1; });
        var online = Object.keys(onlineSet).length;
        var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive; }).length;
        var pct = emps ? Math.round(online / emps * 100) : 0;
        var r = 34, circ = 2 * Math.PI * r;
        var abn = logins.filter(function (l) { var hr = parseInt((l.Time || '').split(' ')[1] || '12', 10); return hr >= 23 || hr < 5; }).slice(0, 4);
        h += '<div class="sec-grid">';
        h += '<div class="sec-card"><div class="sec-title">👥 今日在线人数</div><svg viewBox="0 0 100 100" width="120" height="120"><circle cx="50" cy="50" r="' + r + '" fill="none" stroke="#e4ecf5" stroke-width="10"/><circle cx="50" cy="50" r="' + r + '" fill="none" stroke="#0e5fb7" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (circ * pct / 100).toFixed(2) + ' ' + circ + '" transform="rotate(-90 50 50)"/><text x="50" y="56" text-anchor="middle" font-size="22" font-weight="700" fill="#12375e">' + online + '</text></svg><div class="sec-label">' + emps + ' 名在职 · ' + pct + '% 已登录</div></div>';
        h += '<div class="sec-card"><div class="sec-title">🖥 服务器日志（最近异常）</div>';
        if (!logs.length) { h += '<div class="text-dim" style="font-size:12px;">暂无异常日志</div>'; }
        else {
            h += '<table class="table"><thead><tr><th>时间</th><th>来源</th><th>信息</th></tr></thead><tbody>';
            logs.forEach(function (l) { h += '<tr><td>' + esc(l.Time) + '</td><td>' + esc(l.Source || '—') + '</td><td>' + esc(l.Message) + '</td></tr>'; });
            h += '</tbody></table>';
        }
        h += '</div>';
        h += '<div class="sec-card"><div class="sec-title">⚠ 异常流量检测（深夜登录）</div>';
        h += '<table class="table"><thead><tr><th>时间</th><th>来源账号</th><th>类型</th><th>状态</th></tr></thead><tbody>';
        if (!abn.length) { h += '<tr><td colspan="4" class="text-dim">近 24 小时未发现异常访问</td></tr>'; }
        else {
            abn.forEach(function (l) { h += '<tr><td>' + esc(l.Time) + '</td><td>' + esc(l.OperatorID) + ' ' + esc(l.OperatorName) + '</td><td>深夜登录</td><td><span class="tag tag-orange">已标记</span></td></tr>'; });
        }
        h += '</tbody></table></div>';
        h += '</div></div>';
        return h;
    }

    function recentEmployeeTable() {
        var list = HRDB.getEmployees().sort(function (a, b) { return (b.CreatedAt || '').localeCompare(a.CreatedAt || ''); }).slice(0, 10);
        var html = '<div class="table-wrap"><table class="hr-table"><thead><tr><th>工号</th><th>姓名</th><th>部门</th><th>角色</th><th>入职时间</th><th>状态</th></tr></thead><tbody>';
        list.forEach(function (e) {
            var role = PERM[e.PermissionLevel] ? PERM[e.PermissionLevel].name : '未知';
            html += '<tr><td>' + esc(e.EmployeeID) + '</td><td>' + esc(e.EmployeeName) + '</td><td>' + esc(HRDB.getDeptName(e.Department)) + '</td><td>' + esc(role) + '</td><td>' + esc((e.CreatedAt || '').slice(0, 10)) + '</td><td>' + statusTag(e.IsActive ? '在职' : '离职') + '</td></tr>';
        });
        html += '</tbody></table></div>';
        return html;
    }

    // ---------- 考勤打卡 ----------
    VIEWS.attendance = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var list = HRDB.getAttendance(isAdmin ? '' : u.EmployeeID);
        var html = '';
        html += '<div class="clock-card">';
        html += '<div><div class="clock-time" id="clockTime">--:--:--</div><div class="clock-date" id="clockDate"></div></div>';
        if (!isAdmin) {
            html += '<div class="clock-actions"><a href="javascript:;" class="btn btn-primary" id="btnClockIn">上班打卡</a><a href="javascript:;" class="btn" id="btnClockOut">下班打卡</a></div>';
        }
        html += '</div>';
        html += '<div class="panel"><div class="panel-title">' + (isAdmin ? '全部考勤记录' : '考勤记录') + '</div>';
        if (list.length === 0) {
            html += '<div class="empty-state"><div class="empty-ico">📅</div>' + (isAdmin ? '暂无考勤记录' : '暂无考勤记录，请先打卡') + '</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr>' + (isAdmin ? '<th>员工工号</th><th>员工姓名</th>' : '') + '<th>打卡日期</th><th>打卡时间</th><th>打卡类型</th></tr></thead><tbody>';
            list.forEach(function (a) {
                html += '<tr>' + (isAdmin ? '<td>' + esc(a.EmployeeID) + '</td><td>' + esc(a.EmployeeName) + '</td>' : '') + '<td>' + esc(a.AttendanceDate) + '</td><td>' + esc(a.AttendanceTime) + '</td><td>' + (a.CheckType === '上班' ? '<span class="tag tag-green">上班打卡</span>' : '<span class="tag tag-blue">下班打卡</span>') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);

        function tick() {
            var d = new Date();
            var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
            $('#clockTime').text((h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s));
            $('#clockDate').text(d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + '日一二三四五六'[d.getDay()]);
        }
        tick();
        clearInterval(window.__clockTimer);
        window.__clockTimer = setInterval(tick, 1000);

        $('#btnClockIn').off('click').on('click', function () {
            var r = HRDB.addAttendance(u.EmployeeID, u.EmployeeName, '上班打卡');
            toast(r.msg, r.ok ? 'success' : 'error');
            if (r.ok) setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('attendanceCenter'); }, 900);
        });
        $('#btnClockOut').off('click').on('click', function () {
            var r = HRDB.addAttendance(u.EmployeeID, u.EmployeeName, '下班打卡');
            toast(r.msg, r.ok ? 'success' : 'error');
            if (r.ok) setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('attendanceCenter'); }, 900);
        });
    };

    // ---------- 请假申请 ----------
    VIEWS.leave = function () {
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var list = isAdmin ? HRDB.getLeaves() : HRDB.getLeaves({ empId: u.EmployeeID });
        var html = '';
        if (!isAdmin) {
            html += '<div class="panel"><div class="panel-title">提交请假申请</div>';
            html += '<div class="detail-grid">';
            html += '<div class="detail-item"><div class="d-label">员工工号</div><div class="d-value">' + esc(u.EmployeeID) + '</div></div>';
            html += '<div class="detail-item"><div class="d-label">员工姓名</div><div class="d-value">' + esc(u.EmployeeName) + '</div></div>';
            html += '<div class="detail-item"><div class="d-label">请假类型</div><div><select id="lvType"><option value="事假">事假</option><option value="病假">病假</option><option value="年假">年假</option><option value="调休">调休</option><option value="婚假">婚假</option><option value="产假">产假</option></select></div></div>';
            html += '<div class="detail-item"><div class="d-label">开始日期</div><div><input type="date" id="lvStart"/></div></div>';
            html += '<div class="detail-item"><div class="d-label">结束日期</div><div><input type="date" id="lvEnd"/></div></div>';
            html += '<div class="detail-item wide"><div class="d-label">请假事由</div><div><textarea id="lvReason" rows="2" placeholder="请填写请假原因"></textarea></div></div>';
            html += '</div>';
            html += '<div style="margin-top:18px;"><a href="javascript:;" class="btn btn-primary" id="btnLeaveSubmit">提交申请</a></div>';
            html += '</div>';
        }
        if (isAdmin) {
            var p = list.filter(function (l) { return l.Status === '待审批'; }).length;
            var a = list.filter(function (l) { return l.Status === '已批准'; }).length;
            var r = list.filter(function (l) { return l.Status === '已拒绝'; }).length;
            html += '<div class="stat-grid">';
            html += '<div class="stat-card gold"><div class="stat-ico">◷</div><div class="stat-value">' + p + '</div><div class="stat-label">待审批</div></div>';
            html += '<div class="stat-card"><div class="stat-ico">☑</div><div class="stat-value">' + a + '</div><div class="stat-label">已批准</div></div>';
            html += '<div class="stat-card"><div class="stat-ico">✕</div><div class="stat-value">' + r + '</div><div class="stat-label">已拒绝</div></div>';
            html += '</div>';
        }
        html += '<div class="panel"><div class="panel-title">' + (isAdmin ? '全部请假记录' : '我的请假记录') + '</div>';
        if (list.length === 0) {
            html += '<div class="empty-state"><div class="empty-ico">▤</div>暂无请假记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr>' + (isAdmin ? '<th>员工工号</th><th>员工姓名</th>' : '') + '<th>类型</th><th>开始日期</th><th>结束日期</th><th>天数</th><th>事由</th><th>提交时间</th><th>状态</th>' + (isAdmin ? '<th>操作</th>' : '') + '</tr></thead><tbody>';
            list.forEach(function (l) {
                html += '<tr>' + (isAdmin ? '<td>' + esc(l.EmployeeID) + '</td><td>' + esc(l.EmployeeName) + '</td>' : '') + '<td>' + esc(l.LeaveType) + '</td><td>' + esc(l.StartDate) + '</td><td>' + esc(l.EndDate) + '</td><td>' + l.Days + ' 天</td><td style="max-width:180px;">' + esc(l.Reason) + '</td><td>' + esc(l.ApplyTime) + '</td><td>' + statusTag(l.Status) + '</td>';
                if (isAdmin) {
                    html += '<td class="op-cell">';
                    html += '<a href="javascript:;" class="btn btn-sm" data-act="view" data-id="' + l.LeaveID + '">详情</a>';
                    if (l.Status === '待审批') {
                        html += '<a href="javascript:;" class="btn btn-sm btn-primary" data-act="approve" data-id="' + l.LeaveID + '">批准</a>';
                        html += '<a href="javascript:;" class="btn btn-sm btn-danger" data-act="reject" data-id="' + l.LeaveID + '">拒绝</a>';
                    }
                    html += '</td>';
                }
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $('#appContent').html(html);

        $('#btnLeaveSubmit').off('click').on('click', function () {
            var type = $('#lvType').val();
            var start = $('#lvStart').val();
            var end = $('#lvEnd').val();
            var reason = $('#lvReason').val().trim();
            if (!start || !end) { toast('请选择请假开始和截止日期', 'error'); return; }
            if (end < start) { toast('请假截止日期不能早于开始日期', 'error'); return; }
            if (!reason) { toast('请填写请假事由', 'error'); return; }
            var days = HRDB.daysBetween(start, end);
            HRDB.addLeave({
                EmployeeID: u.EmployeeID, EmployeeName: u.EmployeeName, Department: u.Department,
                LeaveType: type, StartDate: start, EndDate: end, Days: days, Reason: reason
            });
            toast('请假申请提交成功', 'success');
            setTimeout(function () { showView('leave'); }, 900);
        });

        // 管理员：详情 / 批准 / 拒绝
        $('#appContent a[data-act]').off('click').on('click', function () {
            var act = $(this).data('act');
            var id = parseInt($(this).data('id'));
            var leave = HRDB.getLeaves().find(function (l) { return l.LeaveID === id; });
            if (!leave) return;
            if (act === 'view') {
                showLeaveDetail(leave);
            } else if (act === 'approve') {
                HRDB.approveLeave(id, '已批准', u.EmployeeID, '同意');
                toast('已批准 ' + leave.EmployeeName + ' 的请假申请', 'success');
                setTimeout(function () { showView('leave'); }, 900);
            } else if (act === 'reject') {
                showModal('拒绝请假申请',
                    '<div class="form-group"><label>审批意见</label><textarea id="rejectRemark" rows="3" placeholder="请输入拒绝原因"></textarea></div>',
                    '<a href="javascript:;" class="btn btn-danger" id="btnRejectOk">确认拒绝</a><a href="javascript:;" class="btn" id="btnRejectCancel">取消</a>');
                $('#btnRejectOk').off('click').on('click', function () {
                    var r = $('#rejectRemark').val().trim() || '未通过';
                    HRDB.approveLeave(id, '已拒绝', u.EmployeeID, r);
                    closeModal(); toast('已拒绝 ' + leave.EmployeeName + ' 的请假申请', 'success');
                    setTimeout(function () { showView('leave'); }, 900);
                });
                $('#btnRejectCancel').off('click').on('click', closeModal);
            }
        });
    };

    // ---------- 请假审批（主管/管理员） ----------
    VIEWS.leaveApproval = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        // 部门主管：仅审批本部门员工的请假；管理员：可审批全部
        var all = HRDB.getLeaves();
        var list = (u.PermissionLevel === 3)
            ? all
            : all.filter(function (l) { return l.Department === u.Department; });
        var pending = list.filter(function (l) { return l.Status === '待审批'; }).length;
        var approved = list.filter(function (l) { return l.Status === '已批准'; }).length;
        var rejected = list.filter(function (l) { return l.Status === '已拒绝'; }).length;

        var html = '';
        html += '<div class="stat-grid">';
        html += '<div class="stat-card gold"><div class="stat-ico">◷</div><div class="stat-value">' + pending + '</div><div class="stat-label">待审批</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">☑</div><div class="stat-value">' + approved + '</div><div class="stat-label">已批准</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">✕</div><div class="stat-value">' + rejected + '</div><div class="stat-label">已拒绝</div></div>';
        html += '</div>';
        html += '<div class="panel"><div class="panel-title">请假申请列表</div>';
        html += '<div class="toolbar">';
        html += '<select id="laStatus"><option value="">全部状态</option><option value="待审批">待审批</option><option value="已批准">已批准</option><option value="已拒绝">已拒绝</option></select>';
        html += '<select id="laType"><option value="">全部类型</option><option value="事假">事假</option><option value="病假">病假</option><option value="年假">年假</option><option value="调休">调休</option><option value="婚假">婚假</option><option value="产假">产假</option></select>';
        html += '<input type="text" class="search-input" id="laSearch" placeholder="搜索姓名 / 工号"/>';
        html += '<a href="javascript:;" class="btn btn-sm" id="laSearchBtn">查询</a>';
        html += '<a href="javascript:;" class="btn btn-sm" id="laResetBtn">重置</a>';
        html += '</div>';
        if (list.length === 0) {
            html += '<div class="empty-state"><div class="empty-ico">▤</div>暂无请假申请</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>申请人</th><th>部门</th><th>类型</th><th>日期</th><th>天数</th><th>事由</th><th>状态</th><th>操作</th></tr></thead><tbody>';
            list.forEach(function (l) {
                html += '<tr>';
                html += '<td><div>' + esc(l.EmployeeName) + '</div><div class="text-dim" style="font-size:11px;">' + esc(l.EmployeeID) + '</div></td>';
                html += '<td>' + esc(HRDB.getDeptName(l.Department)) + '</td>';
                html += '<td>' + esc(l.LeaveType) + '</td>';
                html += '<td>' + esc(l.StartDate) + ' ~ ' + esc(l.EndDate) + '</td>';
                html += '<td>' + l.Days + ' 天</td>';
                html += '<td style="max-width:160px;">' + esc(l.Reason) + '</td>';
                html += '<td>' + statusTag(l.Status) + '</td>';
                html += '<td class="op-cell">';
                html += '<a href="javascript:;" class="btn btn-sm" data-act="view" data-id="' + l.LeaveID + '">详情</a>';
                if (l.Status === '待审批') {
                    html += '<a href="javascript:;" class="btn btn-sm btn-primary" data-act="approve" data-id="' + l.LeaveID + '">批准</a>';
                    html += '<a href="javascript:;" class="btn btn-sm btn-danger" data-act="reject" data-id="' + l.LeaveID + '">拒绝</a>';
                }
                html += '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);

        function reload() {
            var f = {};
            if ($('#laStatus').val()) f.status = $('#laStatus').val();
            if ($('#laType').val()) f.leaveType = $('#laType').val();
            if ($('#laSearch').val()) f.keyword = $('#laSearch').val();
            VIEWS.leaveApproval.__filter = f;
            VIEWS.leaveApproval(container);
        }

        $('#laSearchBtn').off('click').on('click', reload);
        $('#laResetBtn').off('click').on('click', function () {
            $('#laStatus').val(''); $('#laType').val(''); $('#laSearch').val('');
            VIEWS.leaveApproval.__filter = null;
            VIEWS.leaveApproval(container);
        });
        $(container).find('a[data-act]').off('click').on('click', function () {
            var act = $(this).data('act');
            var id = parseInt($(this).data('id'));
            var leave = HRDB.getLeaves().find(function (l) { return l.LeaveID === id; });
            if (act === 'view') {
                showLeaveDetail(leave);
            } else if (act === 'approve') {
                HRDB.approveLeave(id, '已批准', Session.user.EmployeeID, '同意');
                toast('已批准该请假申请', 'success');
                reload();
            } else if (act === 'reject') {
                showModal('拒绝请假申请',
                    '<div class="form-group"><label>审批意见</label><textarea id="rejectRemark" rows="3" placeholder="请输入拒绝原因"></textarea></div>',
                    '<a href="javascript:;" class="btn btn-danger" id="btnRejectOk">确认拒绝</a><a href="javascript:;" class="btn" id="btnRejectCancel">取消</a>');
                $('#btnRejectOk').off('click').on('click', function () {
                    var r = $('#rejectRemark').val().trim() || '未通过';
                    HRDB.approveLeave(id, '已拒绝', Session.user.EmployeeID, r);
                    closeModal(); toast('已拒绝该请假申请', 'success');
                    reload();
                });
                $('#btnRejectCancel').off('click').on('click', closeModal);
            }
        });
    };

    // ---------- 集团公告板（全员） ----------
    VIEWS.announcement = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var isMgr = (u.PermissionLevel >= 2);
        var scope = (u.PermissionLevel === 3) ? 'all' : u.Department; // 管理员看全部；主管/员工看本部门+集团
        var list = HRDB.getAnnouncements({ scope: scope });

        var html = '';
        // 发布权限：管理员可发集团公告；主管可发本部门公告；员工无发布权
        if (isMgr) {
            html += '<div class="panel"><div class="panel-title">发布公告</div>';
            html += '<div class="detail-grid">';
            html += '<div class="detail-item wide"><div class="d-label">公告标题</div><div><input type="text" id="annTitle" placeholder="请输入公告标题" maxlength="60"/></div></div>';
            html += '<div class="detail-item wide"><div class="d-label">公告内容</div><div><textarea id="annContent" rows="3" placeholder="请输入公告内容"></textarea></div></div>';
            html += '<div class="detail-item"><div class="d-label">发布范围</div><div>';
            if (isAdmin) {
                html += '<select id="annScope"><option value="集团">集团公告</option>' + HRDB.getDepartments().map(function (d) { return '<option value="' + d.DepartmentCode + '">' + esc(d.DepartmentName) + '</option>'; }).join('') + '</select>';
            } else {
                html += '<select id="annScope" disabled><option value="' + esc(u.Department) + '">' + esc(HRDB.getDeptName(u.Department)) + '</option></select>';
            }
            html += '</div></div>';
            html += '</div>';
            html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="annPublish">发布公告</a></div>';
            html += '</div>';
        }

        html += '<div class="panel"><div class="panel-title">公告列表</div>';
        if (list.length === 0) {
            html += '<div class="empty-state"><div class="empty-ico">📢</div>暂无公告</div>';
        } else {
            list.forEach(function (a) {
                var sc = a.Scope === '集团' ? '集团' : HRDB.getDeptName(a.Scope);
                html += '<div class="ann-card">';
                html += '<div class="ann-head">';
                html += '<span class="ann-tag">' + esc(sc) + '</span>';
                html += '<span class="ann-title">' + esc(a.Title) + '</span>';
                html += '</div>';
                html += '<div class="ann-body">' + esc(a.Content) + '</div>';
                html += '<div class="ann-meta">发布人：' + esc(a.PublisherName) + ' · ' + esc(a.PublishTime);
                if (isAdmin) html += '<a href="javascript:;" class="ann-del" data-del="' + a.ID + '">删除</a>';
                html += '</div>';
                // 评论（V15 内容管理）
                var cms = HRDB.getComments({ targetType: '公告', targetId: a.ID }).filter(function (c) { return c.Status === '正常'; });
                html += '<div class="ann-comments">';
                if (cms.length) {
                    cms.forEach(function (c) {
                        html += '<div class="ann-comment"><b>' + esc(c.AuthorName) + '</b>：' + esc(c.Content) + ' <span class="text-dim" style="font-size:11px;">' + esc(c.Time) + '</span></div>';
                    });
                }
                html += '<div class="ann-comment-input"><input type="text" id="annCmt' + a.ID + '" placeholder="写下你的评论…" maxlength="200"/><a href="javascript:;" class="btn btn-sm btn-primary" data-cmt="' + a.ID + '">评论</a></div></div>';
                html += '</div>';
            });
        }
        html += '</div>';
        $(container).html(html);

        if (isMgr) {
            $('#annPublish').off('click').on('click', function () {
                var title = $('#annTitle').val().trim();
                var content = $('#annContent').val().trim();
                if (!title) { toast('请输入公告标题', 'error'); return; }
                if (!content) { toast('请输入公告内容', 'error'); return; }
                HRDB.addAnnouncement({
                    Title: title, Content: content,
                    PublisherID: u.EmployeeID, PublisherName: u.EmployeeName, PublisherDept: u.Department,
                    Scope: isAdmin ? $('#annScope').val() : u.Department
                });
                toast('公告发布成功', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('groupNews'); }, 800);
            });
        }
        // 管理员删除公告
        $(container).find('.ann-del').off('click').on('click', function () {
            var id = parseInt($(this).data('del'));
            showModal('删除公告', '<p style="color:var(--havvk-text);line-height:1.8;">确定删除该公告吗？</p>',
                '<a href="javascript:;" class="btn btn-danger" id="annDelOk">确认删除</a><a href="javascript:;" class="btn" id="annDelCancel">取消</a>');
            $('#annDelOk').off('click').on('click', function () {
                HRDB.deleteAnnouncement(id);
                closeModal(); toast('公告已删除', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('groupNews'); }, 800);
            });
            $('#annDelCancel').off('click').on('click', closeModal);
        });
        // 发表评论
        $(container).find('[data-cmt]').off('click').on('click', function () {
            var aid = parseInt($(this).data('cmt'), 10);
            var content = $('#annCmt' + aid).val().trim();
            if (!content) { toast('请先输入评论内容', 'error'); return; }
            HRDB.addComment({ TargetType: '公告', TargetID: aid, Content: content, AuthorID: u.EmployeeID, AuthorName: u.EmployeeName });
            toast('评论成功', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('groupNews'); }, 700);
        });
    };

    // ---------- 集团大事记（全员，管理员可维护） ----------
    VIEWS.milestones = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var list = HRDB.getMilestones();
        var html = '';
        if (isAdmin) {
            html += '<div class="panel"><div class="panel-title">新增大事记</div>';
            html += '<div class="detail-grid">';
            html += '<div class="detail-item"><div class="d-label">年份</div><div><input type="number" id="msYear" placeholder="如 2018" min="1900" max="2100"/></div></div>';
            html += '<div class="detail-item"><div class="d-label">分类</div><div><select id="msCat"><option value="集团前史">集团前史</option><option value="集团创立">集团创立</option><option value="重大项目">重大项目</option><option value="科研突破">科研突破</option><option value="集团大事">集团大事</option></select></div></div>';
            html += '<div class="detail-item wide"><div class="d-label">标题</div><div><input type="text" id="msTitle" placeholder="请输入事件标题" maxlength="60"/></div></div>';
            html += '<div class="detail-item wide"><div class="d-label">内容</div><div><textarea id="msContent" rows="2" placeholder="请输入事件内容"></textarea></div></div>';
            html += '</div>';
            html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="msAdd">保存大事记</a></div>';
            html += '</div>';
        }
        html += '<div class="panel"><div class="panel-title">哈夫克集团发展历程</div>';
        html += '<div class="tl-wrap">';
        list.forEach(function (m) {
            html += '<div class="tl-item">';
            html += '<div class="tl-year">' + esc(m.Year) + '</div>';
            html += '<div class="tl-body">';
            html += '<div class="tl-head"><span class="ann-tag">' + esc(m.Category) + '</span><span class="tl-title">' + esc(m.Title) + '</span></div>';
            html += '<div class="tl-content">' + esc(m.Content) + '</div>';
            if (isAdmin) html += '<div class="tl-meta"><a href="javascript:;" class="ann-del" data-del="' + m.ID + '">删除</a></div>';
            html += '</div></div>';
        });
        html += '</div></div>';
        $(container).html(html);
        if (isAdmin) {
            $('#msAdd').off('click').on('click', function () {
                var year = $('#msYear').val().trim();
                var title = $('#msTitle').val().trim();
                var content = $('#msContent').val().trim();
                if (!year || !title || !content) { toast('请完整填写年份、标题与内容', 'error'); return; }
                HRDB.addMilestone({ Year: parseInt(year, 10), Category: $('#msCat').val(), Title: title, Content: content });
                toast('大事记已保存', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('groupNews'); }, 800);
            });
            $(container).find('.ann-del').off('click').on('click', function () {
                var id = parseInt($(this).data('del'));
                showModal('删除大事记', '<p style="color:var(--havvk-text);line-height:1.8;">确定删除该条大事记吗？</p>',
                    '<a href="javascript:;" class="btn btn-danger" id="msDelOk">确认删除</a><a href="javascript:;" class="btn" id="msDelCancel">取消</a>');
                $('#msDelOk').off('click').on('click', function () {
                    HRDB.deleteMilestone(id);
                    closeModal(); toast('已删除', 'success');
                    setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('groupNews'); }, 800);
                });
                $('#msDelCancel').off('click').on('click', closeModal);
            });
        }
    };

    // ---------- 内部通讯录（全员） ----------
    VIEWS.directory = function () {
        var u = Session.user;
        var depts = HRDB.getDepartments().filter(function (d) { return d.IsActive; });
        var html = '';
        html += '<div class="panel"><div class="panel-title">集团内部通讯录</div>';
        html += '<div class="toolbar">';
        html += '<select id="dirDept"><option value="">全部部门</option>' + depts.map(function (d) { return '<option value="' + d.DepartmentCode + '">' + esc(d.DepartmentName) + '</option>'; }).join('') + '</select>';
        html += '<input type="text" id="dirKw" class="search-input" placeholder="搜索姓名 / 工号 / 电话"/>';
        html += '</div>';
        html += '<div class="dir-grid" id="dirGrid"></div>';
        html += '</div>';
        $('#appContent').html(html);
        function renderDir() {
            var dept = $('#dirDept').val();
            var kw = $('#dirKw').val().trim().toLowerCase();
            var list = HRDB.getEmployees(dept ? { department: dept } : {}).filter(function (e) { return e.IsActive; });
            if (kw) {
                list = list.filter(function (e) {
                    return (e.EmployeeName || '').toLowerCase().indexOf(kw) >= 0 ||
                        (e.EmployeeID || '').toLowerCase().indexOf(kw) >= 0 ||
                        (e.PhoneNumber || '').indexOf(kw) >= 0;
                });
            }
            if (!list.length) {
                $('#dirGrid').html('<div class="empty-state"><div class="empty-ico">☏</div>未找到匹配的联系人</div>');
                return;
            }
            var h = '';
            list.forEach(function (e) {
                var role = PERM[e.PermissionLevel] ? PERM[e.PermissionLevel].name : '成员';
                var clickable = (e.EmployeeID !== u.EmployeeID);
                h += '<div class="dir-card' + (clickable ? ' clickable' : '') + '"' + (clickable ? ' data-msg="' + esc(e.EmployeeID) + '"' : '') + '>';
                h += '<div class="dir-avatar">' + (e.Avatar ? '<img src="' + e.Avatar + '"/>' : esc((e.EmployeeName || '?').charAt(0).toUpperCase())) + '</div>';
                h += '<div class="dir-info">';
                h += '<div class="dir-name">' + esc(e.EmployeeName) + '<span class="dir-role">' + esc(role) + '</span></div>';
                h += '<div class="dir-line">' + esc(HRDB.getDeptName(e.Department)) + ' · ' + esc(e.EmployeeID) + '</div>';
                h += '<div class="dir-line">📞 ' + esc(e.PhoneNumber || '—') + (e.Email ? ' · ✉ ' + esc(e.Email) : '') + '</div>';
                h += '</div>';
                h += '</div>';
            });
            $('#dirGrid').html(h);
        }
        renderDir();
        $('#dirDept').off('change').on('change', renderDir);
        $('#dirKw').off('input').on('input', renderDir);
    };

    // ===================== 站内消息中心 =====================
    // 对话权限：员工=同部门；主管=同部门员工+全体主管；管理员=无限制
    function canChat(from, to) {
        if (from.PermissionLevel === 3) return true;
        if (from.PermissionLevel === 2) return to.Department === from.Department || to.PermissionLevel === 2;
        return to.Department === from.Department;
    }
    function msgFmtSize(n) {
        n = n || 0;
        if (n < 1024) return n + ' B';
        if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
        return (n / 1048576).toFixed(1) + ' MB';
    }
    function msgShortTime(t) {
        if (!t) return '';
        var s = t.slice(11, 16);
        var d = t.slice(0, 10);
        var now = new Date();
        var today = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
        return d === today ? s : d.slice(5);
    }
    function resizeImage(file, cb) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                var maxW = 1000, maxH = 1000;
                var w = img.width, h = img.height;
                if (w > maxW) { h = h * maxW / w; w = maxW; }
                if (h > maxH) { w = w * maxH / h; h = maxH; }
                var c = document.createElement('canvas');
                c.width = Math.round(w); c.height = Math.round(h);
                var ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0, c.width, c.height);
                cb(c.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    function msgConvAvatar(e) {
        if (e.Avatar) return '<img src="' + e.Avatar + '"/>';
        return esc((e.EmployeeName || '?').charAt(0).toUpperCase());
    }
    VIEWS.message = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var chatWith = window.__chatWith || null;
        // 会话定位自检：对象不存在 / 是自己 / 超出对话权限 → 回到会话列表
        if (chatWith) {
            var _o = HRDB.getEmployeeById(chatWith);
            if (!_o || _o.EmployeeID === u.EmployeeID || !canChat(u, _o)) chatWith = null;
        }
        var other = chatWith ? (HRDB.getEmployeeById(chatWith) || { EmployeeName: chatWith }) : null;
        var html = '';
        html += '<div class="msg-layout">';
        html += '<div class="msg-list" id="msgList">';
        html += '<div class="msg-list-head">消息中心</div>';
        html += '<div class="msg-convs" id="msgConvs"></div>';
        html += '</div>';
        html += '<div class="msg-chat' + (chatWith ? '' : ' hidden') + '" id="msgChat">';
        html += '<div class="msg-chat-head"><a href="javascript:;" class="btn btn-sm msg-back" id="msgBack">← 会话</a><span id="msgChatUser"></span></div>';
        html += '<div class="msg-bubbles" id="msgBubbles"></div>';
        html += '<div class="msg-input">';
        html += '<input type="file" id="msgAttach" accept="image/*" style="display:none;"/>';
        html += '<a href="javascript:;" class="btn btn-sm msg-tool" id="msgPic" title="发送图片">🖼</a>';
        html += '<a href="javascript:;" class="btn btn-sm msg-tool" id="msgFile" title="发送文件">📎</a>';
        html += '<a href="javascript:;" class="btn btn-sm msg-tool" id="msgVault" title="从文件柜选择发送">📁</a>';
        html += '<textarea id="msgText" rows="2" placeholder="输入消息，Enter 发送 / Shift+Enter 换行"></textarea>';
        html += '<a href="javascript:;" class="btn btn-primary" id="msgSend">发送</a>';
        html += '</div></div>';
        html += '</div>';
        $(container).html(html);

        function renderConvs() {
            var convs = HRDB.getConversations(u.EmployeeID);
            var h = '';
            if (!convs.length) {
                h = '<div class="empty-state"><div class="empty-ico">💬</div>暂无会话<br/><span style="font-size:12px;">去「内部通讯录」搜索同事发起对话</span></div>';
            } else {
                convs.forEach(function (c) {
                    var o = HRDB.getEmployeeById(c.OtherID) || { EmployeeName: c.OtherID, Department: '', PermissionLevel: 1 };
                    var summary = c.LastType === 'image' ? '[图片]' : (c.LastType === 'file' ? '[文件] ' + c.LastMsg : (c.LastFrom === u.EmployeeID ? '我：' : '') + c.LastMsg);
                    h += '<div class="msg-conv' + (c.OtherID === chatWith ? ' active' : '') + '" data-other="' + c.OtherID + '">';
                    h += '<div class="msg-cav">' + msgConvAvatar(o) + '</div>';
                    h += '<div class="msg-cinfo"><div class="msg-cname">' + esc(o.EmployeeName) + '<span class="text-dim" style="font-size:11px;"> ' + esc(HRDB.getDeptName(o.Department)) + '</span></div>';
                    h += '<div class="msg-csum">' + esc(summary) + '</div></div>';
                    h += '<div class="msg-ctime">' + msgShortTime(c.LastTime) + (c.Unread ? '<span class="msg-unread">' + (c.Unread > 99 ? '99+' : c.Unread) + '</span>' : '') + '</div>';
                    h += '</div>';
                });
            }
            $('#msgConvs').html(h);
        }
        function renderBubbles() {
            var msgs = HRDB.getMessagesBetween(u.EmployeeID, chatWith);
            var h = '';
            msgs.forEach(function (m) {
                var mine = m.FromID === u.EmployeeID;
                var body = '';
                if (m.Type === 'image') {
                    body = '<img class="msg-img" src="' + m.DataURL + '" alt=""/>';
                } else if (m.Type === 'file') {
                    body = '<span class="msg-file" data-fid="' + m.FileID + '"><span class="mf-ico">📄</span><span class="mf-name">' + esc(m.Content) + '</span><small>' + msgFmtSize(m.Size) + '</small></span>';
                } else {
                    body = '<span>' + esc(m.Content) + '</span>';
                }
                h += '<div class="msg-row ' + (mine ? 'mine' : 'other') + '"><div class="msg-body">' + body + '</div><div class="msg-time">' + msgShortTime(m.Time) + '</div></div>';
            });
            $('#msgBubbles').html(h);
            var el = document.getElementById('msgBubbles');
            if (el) el.scrollTop = el.scrollHeight;
        }
        function openChat(oid, markRead) {
            chatWith = oid;
            window.__chatWith = oid;
            var o = HRDB.getEmployeeById(oid) || { EmployeeName: oid, Department: '', PermissionLevel: 1 };
            other = o;
            if (markRead !== false) HRDB.markPairRead(u.EmployeeID, oid);
            $('#msgChat').removeClass('hidden');
            var role = PERM[o.PermissionLevel] ? PERM[o.PermissionLevel].name : '';
            $('#msgChatUser').html('<span class="msg-cav sm">' + msgConvAvatar(o) + '</span><div style="min-width:0;"><div style="font-weight:700;color:#202020;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(o.EmployeeName) + ' <span class="text-dim" style="font-size:11px;font-weight:400;">' + esc(role) + '</span></div><div class="text-dim" style="font-size:11px;">' + esc(HRDB.getDeptName(o.Department)) + ' · ' + esc(o.EmployeeID) + '</div></div>');
            renderConvs();
            renderBubbles();
            if (window.innerWidth <= 720) { $('#msgList').hide(); }
        }
        $('#msgConvs').off('click').on('click', '.msg-conv', function () {
            openChat($(this).data('other'));
        });
        $('#msgBack').off('click').on('click', function () {
            $('#msgList').show();
            $('#msgChat').addClass('hidden');
            chatWith = null;
            window.__chatWith = null;
            renderConvs();
        });
        function sendText() {
            var t = $('#msgText').val().trim();
            if (!t || !chatWith) return;
            HRDB.addMessage({ FromID: u.EmployeeID, FromName: u.EmployeeName, ToID: chatWith, ToName: other.EmployeeName, Type: 'text', Content: t });
            $('#msgText').val('');
            renderBubbles(); renderConvs();
        }
        $('#msgSend').off('click').on('click', sendText);
        $('#msgText').off('keydown').on('keydown', function (e) {
            if (e.keyCode === 13 && !e.shiftKey) { e.preventDefault(); sendText(); }
        });
        $('#msgPic').off('click').on('click', function () {
            $('#msgAttach').attr('accept', 'image/*').data('kind', 'image').click();
        });
        $('#msgFile').off('click').on('click', function () {
            $('#msgAttach').attr('accept', '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar').data('kind', 'file').click();
        });
        // 从文件柜选择文件发送
        $('#msgVault').off('click').on('click', function () {
            if (!chatWith) { toast('请先选择会话', 'error'); return; }
            var mine = HRDB.getFileVault({ ownerId: u.EmployeeID, scope: '个人' });
            var share = (u.PermissionLevel === 3) ? HRDB.getFileVault({ scope: '部门' }) : HRDB.getFileVault({ scope: '部门', department: u.Department });
            var files = mine.concat(share);
            if (!files.length) { toast('文件柜暂无文件', 'error'); return; }
            var rows = '';
            files.forEach(function (f) {
                rows += '<tr><td style="max-width:200px;">' + esc(f.Name) + '</td><td>' + msgFmtSize(f.Size) + '</td><td>' + esc(f.Scope === '个人' ? '个人文件' : '部门共享') + '</td><td><a href="javascript:;" class="btn btn-sm btn-primary" data-vsend="' + f.VaultID + '">发送</a></td></tr>';
            });
            showModal('从文件柜选择文件',
                '<div class="table-wrap"><table class="hr-table" style="min-width:0;"><thead><tr><th>文件名</th><th>大小</th><th>位置</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div>',
                '<a href="javascript:;" class="btn" id="vsCancel">取消</a>');
            $('#vsCancel').off('click').on('click', closeModal);
            $('#modalBody a[data-vsend]').off('click').on('click', function () {
                var vid = parseInt($(this).data('vsend'));
                var meta = HRDB.getFileVault().find(function (x) { return x.VaultID === vid; });
                if (!meta) { toast('文件不存在', 'error'); return; }
                HRDB.addMessage({ FromID: u.EmployeeID, FromName: u.EmployeeName, ToID: chatWith, ToName: other.EmployeeName, Type: 'file', Content: meta.Name, FileID: meta.FileID, Size: meta.Size });
                closeModal();
                renderBubbles(); renderConvs();
                toast('已发送', 'success');
            });
        });
        $('#msgAttach').off('change').on('change', function () {
            var f = this.files && this.files[0];
            var kind = $(this).data('kind') || 'image';
            this.value = '';
            if (!f || !chatWith) return;
            var isImg = f.type.indexOf('image/') === 0;
            if (isImg && kind === 'image') {
                resizeImage(f, function (dataUrl) {
                    HRDB.addMessage({ FromID: u.EmployeeID, FromName: u.EmployeeName, ToID: chatWith, ToName: other.EmployeeName, Type: 'image', Content: f.name, DataURL: dataUrl, Size: f.size });
                    renderBubbles(); renderConvs();
                });
            } else {
                window.HRFiles.save(f).then(function (fid) {
                    HRDB.addMessage({ FromID: u.EmployeeID, FromName: u.EmployeeName, ToID: chatWith, ToName: other.EmployeeName, Type: 'file', Content: f.name, FileID: fid, Size: f.size });
                    renderBubbles(); renderConvs();
                }).catch(function () { toast('文件发送失败', 'error'); });
            }
        });
        // 图片预览
        $('#msgBubbles').off('click').on('click', '.msg-img', function () {
            var src = $(this).attr('src');
            showModal('图片预览', '<img src="' + src + '" style="max-width:100%;border-radius:8px;"/>', '<a href="javascript:;" class="btn" id="pvClose">关闭</a>');
            $('#pvClose').off('click').on('click', closeModal);
        });
        // 文件下载
        $('#msgBubbles').off('click').on('click', '.msg-file', function () {
            var fid = $(this).data('fid');
            if (!fid) { toast('文件内容缺失', 'error'); return; }
            window.HRFiles.get(fid).then(function (rec) {
                if (!rec) { toast('文件内容缺失', 'error'); return; }
                var url = URL.createObjectURL(rec.blob);
                var a = document.createElement('a');
                a.href = url; a.download = rec.name;
                document.body.appendChild(a); a.click(); a.remove();
                setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
            });
        });
        if (chatWith && other) {
            openChat(chatWith);
        } else {
            renderConvs();
            // 默认打开第一个会话（不标已读，保留未读红点）
            var convs = HRDB.getConversations(u.EmployeeID);
            if (convs.length) {
                openChat(convs[0].OtherID, false);
            }
        }
    };

    // ---------- 值班排班（员工看自己 / 主管管本部门 / 管理员全局） ----------
    VIEWS.duty = function () {
        var u = Session.user;
        var isMgr = (u.PermissionLevel >= 2);
        var isAdmin = (u.PermissionLevel === 3);
        var html = '';
        if (isMgr) {
            var empOpts;
            if (isAdmin) {
                empOpts = HRDB.getEmployees().filter(function (e) { return e.IsActive; }).map(function (e) { return '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '（' + esc(HRDB.getDeptName(e.Department)) + '）</option>'; }).join('');
            } else {
                empOpts = HRDB.getEmployees({ department: u.Department }).filter(function (e) { return e.IsActive; }).map(function (e) { return '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '</option>'; }).join('');
            }
            html += '<div class="panel"><div class="panel-title">新增值班安排</div>';
            html += '<div class="detail-grid">';
            html += '<div class="detail-item"><div class="d-label">值班日期</div><div><input type="date" id="dutyDate"/></div></div>';
            html += '<div class="detail-item"><div class="d-label">班次</div><div><select id="dutyShift"><option value="早班">早班</option><option value="晚班">晚班</option><option value="夜班">夜班</option></select></div></div>';
            html += '<div class="detail-item"><div class="d-label">值班员工</div><div><select id="dutyEmp">' + empOpts + '</select></div></div>';
            html += '<div class="detail-item wide"><div class="d-label">备注</div><div><input type="text" id="dutyRemark" placeholder="选填，如值守项目 / 注意事项" maxlength="60"/></div></div>';
            html += '</div>';
            html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="dutyAdd">发布排班</a></div>';
            html += '</div>';
        }
        var list = isAdmin ? HRDB.getDuties({}) : (isMgr ? HRDB.getDuties({ department: u.Department }) : HRDB.getDuties({ empId: u.EmployeeID }));
        html += '<div class="panel"><div class="panel-title">' + (isAdmin ? '全部值班安排' : (isMgr ? '本部门值班安排' : '我的值班安排')) + '</div>';
        if (!list.length) {
            html += '<div class="empty-state"><div class="empty-ico">◈</div>暂无值班安排</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>日期</th><th>班次</th>' + (isAdmin ? '<th>部门</th>' : '') + '<th>值班员工</th><th>备注</th>' + (isMgr ? '<th class="op-cell">操作</th>' : '') + '</tr></thead><tbody>';
            list.forEach(function (d) {
                html += '<tr><td>' + esc(d.DutyDate) + '</td><td>' + shiftTag(d.Shift) + '</td>' + (isAdmin ? '<td>' + esc(HRDB.getDeptName(d.Department)) + '</td>' : '') + '<td>' + esc(d.EmployeeName) + '</td><td style="max-width:180px;">' + esc(d.Remark || '—') + '</td>' + (isMgr ? '<td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-danger" data-del="' + d.DutyID + '">删除</a></td>' : '') + '</tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $('#appContent').html(html);
        if (isMgr) {
            $('#dutyAdd').off('click').on('click', function () {
                var date = $('#dutyDate').val();
                var empId = $('#dutyEmp').val();
                if (!date) { toast('请选择值班日期', 'error'); return; }
                var emp = HRDB.getEmployeeById(empId);
                HRDB.addDuty({
                    DutyDate: date, Shift: $('#dutyShift').val(),
                    EmployeeID: empId, EmployeeName: emp ? emp.EmployeeName : empId,
                    Department: emp ? emp.Department : (isAdmin ? '' : u.Department),
                    Remark: $('#dutyRemark').val().trim(), CreatedBy: u.EmployeeID
                });
                toast('排班已发布', 'success');
                setTimeout(function () { showView('duty'); }, 800);
            });
            $('#appContent a[data-del]').off('click').on('click', function () {
                var id = parseInt($(this).data('del'));
                showModal('删除排班', '<p style="color:var(--havvk-text);line-height:1.8;">确定删除该值班安排吗？</p>',
                    '<a href="javascript:;" class="btn btn-danger" id="dutyDelOk">确认删除</a><a href="javascript:;" class="btn" id="dutyDelCancel">取消</a>');
                $('#dutyDelOk').off('click').on('click', function () {
                    HRDB.deleteDuty(id);
                    closeModal(); toast('已删除', 'success');
                    setTimeout(function () { showView('duty'); }, 800);
                });
                $('#dutyDelCancel').off('click').on('click', closeModal);
            });
        }
    };

    // ---------- 意见反馈（员工提交 + 我的记录） ----------
    VIEWS.feedback = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var html = '';
        html += '<div class="panel"><div class="panel-title">提交反馈</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">反馈类型</div><div><select id="fbType"><option value="建议">建议</option><option value="投诉">投诉</option><option value="求助">求助</option><option value="其他">其他</option></select></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">反馈内容</div><div><textarea id="fbContent" rows="3" placeholder="请描述您的建议或问题，主管/管理员将及时处理"></textarea></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="fbSubmit">提交反馈</a></div>';
        html += '</div>';
        var my = HRDB.getFeedbacks({ empId: u.EmployeeID });
        html += '<div class="panel"><div class="panel-title">我的反馈记录</div>';
        if (!my.length) {
            html += '<div class="empty-state"><div class="empty-ico">✉</div>暂无反馈记录</div>';
        } else {
            my.forEach(function (f) {
                html += '<div class="fb-card">';
                html += '<div class="fb-head"><span class="ann-tag">' + esc(f.Type) + '</span><span class="fb-title">' + esc(f.EmployeeName) + '</span>' + statusTag(f.Status) + '</div>';
                html += '<div class="fb-body">' + esc(f.Content) + '</div>';
                html += '<div class="fb-meta">提交于 ' + esc(f.CreateTime);
                if (f.Status === '已处理') html += ' · 已由 ' + esc(f.HandleBy) + ' 处理：' + esc(f.HandleNote) + '（' + esc(f.HandleTime) + '）';
                html += '</div></div>';
            });
        }
        html += '</div>';
        $(container).html(html);
        $('#fbSubmit').off('click').on('click', function () {
            var content = $('#fbContent').val().trim();
            if (!content) { toast('请输入反馈内容', 'error'); return; }
            HRDB.addFeedback({
                Type: $('#fbType').val(), Content: content,
                EmployeeID: u.EmployeeID, EmployeeName: u.EmployeeName, Department: u.Department
            });
            toast('反馈已提交', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('feedbackCenter'); }, 800);
        });
    };

    // ---------- 反馈处理（主管本部门 / 管理员全局） ----------
    VIEWS.feedbackAdmin = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var html = '';
        html += '<div class="panel"><div class="panel-title">' + (isAdmin ? '全部反馈' : '本部门反馈') + '</div>';
        html += '<div class="toolbar"><select id="fbStatus"><option value="全部">全部状态</option><option value="待处理">待处理</option><option value="已处理">已处理</option></select></div>';
        html += '<div id="fbList"></div></div>';
        $(container).html(html);
        function render() {
            var status = $('#fbStatus').val();
            var list = isAdmin ? HRDB.getFeedbacks({ status: status }) : HRDB.getFeedbacks({ department: u.Department, status: status });
            if (!list.length) {
                $('#fbList').html('<div class="empty-state"><div class="empty-ico">✉</div>暂无反馈</div>');
                return;
            }
            var h = '';
            list.forEach(function (f) {
                h += '<div class="fb-card">';
                h += '<div class="fb-head"><span class="ann-tag">' + esc(f.Type) + '</span><span class="fb-title">' + esc(f.EmployeeName) + '（' + esc(HRDB.getDeptName(f.Department)) + '）</span>' + statusTag(f.Status) + '</div>';
                h += '<div class="fb-body">' + esc(f.Content) + '</div>';
                h += '<div class="fb-meta">提交于 ' + esc(f.CreateTime);
                if (f.Status === '已处理') {
                    h += ' · 已由 ' + esc(f.HandleBy) + ' 处理：' + esc(f.HandleNote) + '（' + esc(f.HandleTime) + '）';
                } else {
                    h += ' <a href="javascript:;" class="fb-handle" data-id="' + f.FeedbackID + '">处理</a>';
                }
                if (isAdmin) h += ' <a href="javascript:;" class="ann-del" data-del="' + f.FeedbackID + '">删除</a>';
                h += '</div></div>';
            });
            $('#fbList').html(h);
        }
        render();
        $('#fbStatus').off('change').on('change', render);
        $('#fbList').off('click', '.fb-handle').on('click', '.fb-handle', function () {
            var id = parseInt($(this).data('id'));
            showModal('处理反馈', '<div class="d-label">处理意见</div><textarea id="fbNote" rows="3" placeholder="填写处理意见" style="width:100%;"></textarea>',
                '<a href="javascript:;" class="btn btn-primary" id="fbHandleOk">确认处理</a><a href="javascript:;" class="btn" id="fbHandleCancel">取消</a>');
            $('#fbHandleOk').off('click').on('click', function () {
                var note = $('#fbNote').val().trim();
                if (!note) { toast('请填写处理意见', 'error'); return; }
                HRDB.handleFeedback(id, note, u.EmployeeName);
                closeModal(); toast('已处理', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('feedbackCenter'); }, 800);
            });
            $('#fbHandleCancel').off('click').on('click', closeModal);
        });
        $('#fbList').off('click', '.ann-del').on('click', '.ann-del', function () {
            var id = parseInt($(this).data('del'));
            showModal('删除反馈', '<p style="color:var(--havvk-text);line-height:1.8;">确定删除该条反馈吗？</p>',
                '<a href="javascript:;" class="btn btn-danger" id="fbDelOk">确认删除</a><a href="javascript:;" class="btn" id="fbDelCancel">取消</a>');
            $('#fbDelOk').off('click').on('click', function () {
                HRDB.deleteFeedback(id);
                closeModal(); toast('已删除', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('feedbackCenter'); }, 800);
            });
            $('#fbDelCancel').off('click').on('click', closeModal);
        });
    };

    // ---------- 待办中心（按角色聚合待审批/待处理事项） ----------
    VIEWS.todo = function () {
        var u = Session.user;
        var todos = HRDB.getTodos(u);
        var html = '';
        html += '<div class="panel"><div class="panel-title">待办中心</div>';
        if (!todos.length) {
            html += '<div class="empty-state"><div class="empty-ico">◫</div>太棒了，当前没有待办事项</div>';
        } else {
            html += '<div class="todo-grid">';
            todos.forEach(function (t) {
                html += '<div class="todo-card">';
                html += '<div class="todo-ico">' + t.ico + '</div>';
                html += '<div class="todo-body"><div class="todo-title">' + esc(t.title) + '</div><div class="todo-count">' + t.count + ' 项待处理</div></div>';
                html += '<a href="javascript:;" class="btn btn-sm btn-primary" data-goto="' + t.goto + '">去处理</a>';
                html += '</div>';
            });
            html += '</div>';
        }
        html += '</div>';
        $('#appContent').html(html);
        $('#appContent a[data-goto]').off('click').on('click', function () { showView($(this).data('goto')); });
    };

    // ---------- 差旅报销（自助提交 + 主管/管理员审批） ----------
    VIEWS.expense = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isMgr = (u.PermissionLevel >= 2);
        var isAdmin = (u.PermissionLevel === 3);
        var html = '';
        // 提交报销（所有人）
        html += '<div class="panel"><div class="panel-title">提交报销申请</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">报销标题</div><div><input type="text" id="exTitle" placeholder="如：广州—北京差旅" maxlength="60"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">报销类型</div><div><select id="exCat"><option value="差旅">差旅</option><option value="交通">交通</option><option value="餐饮">餐饮</option><option value="办公">办公</option><option value="其他">其他</option></select></div></div>';
        html += '<div class="detail-item"><div class="d-label">金额（元）</div><div><input type="number" id="exAmount" placeholder="0.00" min="0" step="0.01"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">费用日期</div><div><input type="date" id="exDate"/></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">费用说明</div><div><textarea id="exDesc" rows="2" placeholder="请说明费用明细与事由"></textarea></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="exSubmit">提交报销</a></div>';
        html += '</div>';
        // 审批区（主管/管理员）
        if (isMgr) {
            var pendList = isAdmin ? HRDB.getExpenses({ status: '待审批' }) : HRDB.getExpenses({ department: u.Department, status: '待审批' });
            html += '<div class="panel"><div class="panel-title">待审批报销' + (isAdmin ? '（全部）' : '（本部门）') + '</div>';
            if (!pendList.length) {
                html += '<div class="empty-state"><div class="empty-ico">¥</div>暂无待审批报销</div>';
            } else {
                html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>申请人</th><th>标题</th><th>金额</th><th>类型</th><th>日期</th><th class="op-cell">操作</th></tr></thead><tbody>';
                pendList.forEach(function (e) {
                    html += '<tr><td>' + esc(e.EmployeeName) + '（' + esc(e.EmployeeID) + '）</td><td style="max-width:180px;">' + esc(e.Title) + '</td><td style="color:#c04a4a;font-weight:600;">¥' + e.Amount.toFixed(2) + '</td><td>' + esc(e.Category) + '</td><td>' + esc(e.ExpenseDate) + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-primary" data-ok="' + e.ExpenseID + '">批准</a><a href="javascript:;" class="btn btn-sm btn-danger" data-no="' + e.ExpenseID + '">驳回</a></td></tr>';
                });
                html += '</tbody></table></div>';
            }
            html += '</div>';
        }
        // 我的报销记录
        var myList = HRDB.getExpenses({ empId: u.EmployeeID });
        html += '<div class="panel"><div class="panel-title">我的报销记录</div>';
        if (!myList.length) {
            html += '<div class="empty-state"><div class="empty-ico">¥</div>暂无报销记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>标题</th><th>类型</th><th>金额</th><th>费用日期</th><th>状态</th><th>审批意见</th></tr></thead><tbody>';
            myList.forEach(function (e) {
                html += '<tr><td style="max-width:180px;">' + esc(e.Title) + '</td><td>' + esc(e.Category) + '</td><td style="color:#c04a4a;font-weight:600;">¥' + e.Amount.toFixed(2) + '</td><td>' + esc(e.ExpenseDate) + '</td><td>' + statusTag(e.Status) + '</td><td style="max-width:160px;">' + (e.ApproveNote ? esc(e.ApproveBy) + '：' + esc(e.ApproveNote) : '—') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);
        $('#exSubmit').off('click').on('click', function () {
            var title = $('#exTitle').val().trim();
            var amount = parseFloat($('#exAmount').val());
            var date = $('#exDate').val();
            if (!title || isNaN(amount) || amount <= 0) { toast('请填写报销标题与有效金额', 'error'); return; }
            if (!date) { toast('请选择费用日期', 'error'); return; }
            HRDB.addExpense({
                Title: title, Amount: amount, Category: $('#exCat').val(), ExpenseDate: date,
                Description: $('#exDesc').val().trim(),
                EmployeeID: u.EmployeeID, EmployeeName: u.EmployeeName, Department: u.Department
            });
            toast('报销申请已提交', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('logistics'); }, 800);
        });
        if (isMgr) {
            $(container).find('a[data-ok]').off('click').on('click', function () {
                var id = parseInt($(this).data('ok'));
                showModal('批准报销', '<p style="color:var(--havvk-text);line-height:1.8;">确定批准该报销申请吗？</p><textarea id="exNote" rows="2" placeholder="审批意见（选填）" style="width:100%;"></textarea>',
                    '<a href="javascript:;" class="btn btn-primary" id="exOk">确认批准</a><a href="javascript:;" class="btn" id="exCancel">取消</a>');
                $('#exOk').off('click').on('click', function () {
                    HRDB.approveExpense(id, true, $('#exNote').val().trim() || '同意', u.EmployeeName);
                    closeModal(); toast('已批准', 'success');
                    setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('logistics'); }, 800);
                });
                $('#exCancel').off('click').on('click', closeModal);
            });
            $(container).find('a[data-no]').off('click').on('click', function () {
                var id = parseInt($(this).data('no'));
                showModal('驳回报销', '<p style="color:var(--havvk-text);line-height:1.8;">确定驳回该报销申请吗？请填写驳回原因。</p><textarea id="exNote2" rows="2" placeholder="驳回原因" style="width:100%;"></textarea>',
                    '<a href="javascript:;" class="btn btn-danger" id="exNoOk">确认驳回</a><a href="javascript:;" class="btn" id="exNoCancel">取消</a>');
                $('#exNoOk').off('click').on('click', function () {
                    var note = $('#exNote2').val().trim();
                    if (!note) { toast('请填写驳回原因', 'error'); return; }
                    HRDB.approveExpense(id, false, note, u.EmployeeName);
                    closeModal(); toast('已驳回', 'success');
                    setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('logistics'); }, 800);
                });
                $('#exNoCancel').off('click').on('click', closeModal);
            });
        }
    };

    // ---------- 培训中心（报名学习 + 主管/管理员发布与管理） ----------
    VIEWS.training = function () {
        var u = Session.user;
        var isMgr = (u.PermissionLevel >= 2);
        var isAdmin = (u.PermissionLevel === 3);
        var trainings = HRDB.getTrainings();
        var myState = HRDB.getMyTrainingState(u.EmployeeID);
        var stats = HRDB.getTrainingStats();
        var html = '';
        if (isMgr) {
            html += '<div class="panel"><div class="panel-title">发布培训课程</div>';
            html += '<div class="detail-grid">';
            html += '<div class="detail-item"><div class="d-label">课程名称</div><div><input type="text" id="trTitle" placeholder="请输入课程名称" maxlength="60"/></div></div>';
            html += '<div class="detail-item"><div class="d-label">课程分类</div><div><select id="trCat"><option value="安全">安全</option><option value="技术">技术</option><option value="管理">管理</option><option value="合规">合规</option><option value="文化">文化</option></select></div></div>';
            html += '<div class="detail-item"><div class="d-label">讲师</div><div><input type="text" id="trInstructor" placeholder="讲师 / 部门" maxlength="30"/></div></div>';
            html += '<div class="detail-item"><div class="d-label">学时（小时）</div><div><input type="number" id="trHours" min="1" max="200" placeholder="4"/></div></div>';
            html += '<div class="detail-item"><div class="d-label">截止日期</div><div><input type="date" id="trDeadline"/></div></div>';
            html += '<div class="detail-item wide"><div class="d-label">课程内容</div><div><textarea id="trContent" rows="2" placeholder="课程简介与学习要点"></textarea></div></div>';
            html += '</div>';
            html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="trAdd">发布课程</a></div>';
            html += '</div>';
        }
        html += '<div class="panel"><div class="panel-title">培训课程列表</div>';
        if (!trainings.length) {
            html += '<div class="empty-state"><div class="empty-ico">▤</div>暂无培训课程</div>';
        } else {
            trainings.forEach(function (t) {
                var st = myState[t.TrainingID];
                var enrolled = st && st.enrolled;
                var completed = st && st.completed;
                var sc = stats[t.TrainingID] || { enrollCount: 0, completeCount: 0 };
                html += '<div class="tr-card">';
                html += '<div class="tr-head"><span class="ann-tag">' + esc(t.Category) + '</span><span class="tr-title">' + esc(t.Title) + '</span>' + statusTag(t.Status) + '</div>';
                html += '<div class="tr-content">' + esc(t.Content) + '</div>';
                html += '<div class="tr-meta">讲师：' + esc(t.Instructor) + ' · 学时 ' + t.Hours + 'h · 截止 ' + esc(t.Deadline) + '</div>';
                if (isMgr) html += '<div class="tr-stats">📊 报名 ' + sc.enrollCount + ' 人 · 已完成 ' + sc.completeCount + ' 人</div>';
                html += '<div class="tr-actions">';
                if (!enrolled) html += '<a href="javascript:;" class="btn btn-sm btn-primary" data-enroll="' + t.TrainingID + '">报名学习</a>';
                else if (!completed) html += '<a href="javascript:;" class="btn btn-sm" data-finish="' + t.TrainingID + '">标记完成</a>';
                else html += '<span class="tag tag-green">✓ 已完成</span>';
                if (isAdmin) html += '<a href="javascript:;" class="btn btn-sm btn-danger" data-tr-del="' + t.TrainingID + '">删除课程</a>';
                html += '</div></div>';
            });
        }
        html += '</div>';
        $('#appContent').html(html);
        if (isMgr) {
            $('#trAdd').off('click').on('click', function () {
                var title = $('#trTitle').val().trim();
                var content = $('#trContent').val().trim();
                var instructor = $('#trInstructor').val().trim();
                var deadline = $('#trDeadline').val();
                var hours = parseInt($('#trHours').val(), 10);
                if (!title || !content || !instructor || !deadline || isNaN(hours)) { toast('请完整填写课程信息', 'error'); return; }
                HRDB.addTraining({
                    Title: title, Category: $('#trCat').val(), Content: content,
                    Instructor: instructor, Hours: hours, Deadline: deadline,
                    Status: '进行中', CreatedBy: u.EmployeeName
                });
                toast('课程已发布', 'success');
                setTimeout(function () { showView('training'); }, 800);
            });
            $('#appContent a[data-tr-del]').off('click').on('click', function () {
                var id = parseInt($(this).data('tr-del'));
                showModal('删除课程', '<p style="color:var(--havvk-text);line-height:1.8;">删除课程将同时清除报名记录，确定继续吗？</p>',
                    '<a href="javascript:;" class="btn btn-danger" id="trDelOk">确认删除</a><a href="javascript:;" class="btn" id="trDelCancel">取消</a>');
                $('#trDelOk').off('click').on('click', function () {
                    HRDB.deleteTraining(id);
                    closeModal(); toast('已删除', 'success');
                    setTimeout(function () { showView('training'); }, 800);
                });
                $('#trDelCancel').off('click').on('click', closeModal);
            });
        }
        $('#appContent a[data-enroll]').off('click').on('click', function () {
            var id = parseInt($(this).data('enroll'));
            HRDB.enrollTraining(u.EmployeeID, id);
            toast('报名成功，开始学习吧', 'success');
            setTimeout(function () { showView('training'); }, 800);
        });
        $('#appContent a[data-finish]').off('click').on('click', function () {
            var id = parseInt($(this).data('finish'));
            HRDB.completeTraining(u.EmployeeID, id);
            toast('已完成学习', 'success');
            setTimeout(function () { showView('training'); }, 800);
        });
    };

    // ---------- 资料变更申请（员工提交 → 主管/管理员审批，批准后同步主数据） ----------
    VIEWS.profileUpdate = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isMgr = (u.PermissionLevel >= 2);
        var isAdmin = (u.PermissionLevel === 3);
        var emp = HRDB.getEmployeeById(u.EmployeeID) || u;
        var html = '';
        html += '<div class="panel"><div class="panel-title">提交资料变更申请</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">变更项目</div><div><select id="puField"><option value="联系电话">联系电话</option><option value="电子邮箱">电子邮箱</option><option value="其他">其他</option></select></div></div>';
        html += '<div class="detail-item"><div class="d-label">当前值</div><div class="d-value">' + esc(emp.PhoneNumber || '—') + ' / ' + esc(emp.Email || '—') + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">新值</div><div><input type="text" id="puNew" placeholder="填写变更后的内容" maxlength="50"/></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">变更原因</div><div><input type="text" id="puReason" placeholder="选填，说明变更原因" maxlength="60"/></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="puSubmit">提交申请</a></div>';
        html += '</div>';
        if (isMgr) {
            var pend = isAdmin ? HRDB.getProfileUpdates({ status: '待审批' }) : HRDB.getProfileUpdates({ department: u.Department, status: '待审批' });
            html += '<div class="panel"><div class="panel-title">待审批变更' + (isAdmin ? '（全部）' : '（本部门）') + '</div>';
            if (!pend.length) {
                html += '<div class="empty-state"><div class="empty-ico">☰</div>暂无待审批变更</div>';
            } else {
                pend.forEach(function (p) {
                    html += '<div class="fb-card">';
                    html += '<div class="fb-head"><span class="ann-tag">' + esc(p.Field) + '</span><span class="fb-title">' + esc(p.EmployeeName) + '（' + esc(HRDB.getDeptName(p.Department)) + '）</span></div>';
                    html += '<div class="fb-body">' + esc(p.OldValue) + ' → <b>' + esc(p.NewValue) + '</b>（' + esc(p.Reason || '无说明') + '）</div>';
                    html += '<div class="fb-meta">提交于 ' + esc(p.CreateTime) + ' <a href="javascript:;" class="fb-handle" data-ok="' + p.UpdateID + '">批准</a> <a href="javascript:;" class="ann-del" data-no="' + p.UpdateID + '">驳回</a></div>';
                    html += '</div>';
                });
            }
            html += '</div>';
        }
        var myList = HRDB.getProfileUpdates({ empId: u.EmployeeID });
        html += '<div class="panel"><div class="panel-title">我的变更记录</div>';
        if (!myList.length) {
            html += '<div class="empty-state"><div class="empty-ico">☰</div>暂无变更记录</div>';
        } else {
            myList.forEach(function (p) {
                html += '<div class="fb-card">';
                html += '<div class="fb-head"><span class="ann-tag">' + esc(p.Field) + '</span><span class="fb-title">' + esc(p.OldValue) + ' → ' + esc(p.NewValue) + '</span>' + statusTag(p.Status) + '</div>';
                html += '<div class="fb-meta">提交于 ' + esc(p.CreateTime) + (p.Status !== '待审批' ? ' · 审批人：' + esc(p.ApproveBy) + '（' + esc(p.ApproveTime) + '）' : '') + '</div>';
                html += '</div>';
            });
        }
        html += '</div>';
        $(container).html(html);
        $('#puSubmit').off('click').on('click', function () {
            var field = $('#puField').val();
            var newVal = $('#puNew').val().trim();
            if (!newVal) { toast('请填写变更后的新值', 'error'); return; }
            var oldVal = field === '联系电话' ? (emp.PhoneNumber || '—') : (field === '电子邮箱' ? (emp.Email || '—') : '—');
            HRDB.addProfileUpdate({
                EmployeeID: u.EmployeeID, EmployeeName: u.EmployeeName, Department: u.Department,
                Field: field, OldValue: oldVal, NewValue: newVal, Reason: $('#puReason').val().trim()
            });
            toast('变更申请已提交', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('hrService'); }, 800);
        });
        if (isMgr) {
            $(container).find('a[data-ok]').off('click').on('click', function () {
                var id = parseInt($(this).data('ok'));
                HRDB.approveProfileUpdate(id, true, u.EmployeeName);
                toast('已批准，员工资料已同步更新', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('hrService'); }, 800);
            });
            $(container).find('a[data-no]').off('click').on('click', function () {
                var id = parseInt($(this).data('no'));
                HRDB.approveProfileUpdate(id, false, u.EmployeeName);
                toast('已驳回', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('hrService'); }, 800);
            });
        }
    };

    // ---------- 文件柜（个人文件 + 部门共享，文件存 IndexedDB） ----------
    VIEWS.fileVault = function () {
        var u = Session.user;
        var isMgr = (u.PermissionLevel >= 2);
        var isAdmin = (u.PermissionLevel === 3);
        var html = '';
        html += '<div class="panel"><div class="panel-title">上传文件</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">存放位置</div><div><select id="fvScope"><option value="部门">部门共享</option><option value="个人">个人文件</option></select></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">选择文件</div><div><input type="file" id="fvFile" multiple/></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="fvUpload">上传到文件柜</a><span class="text-dim" style="margin-left:10px;font-size:12px;">支持多个文件，内容保存在本地浏览器</span></div>';
        html += '</div>';
        // 部门共享区
        var shareList = isAdmin ? HRDB.getFileVault({ scope: '部门' }) : HRDB.getFileVault({ scope: '部门', department: u.Department });
        html += '<div class="panel"><div class="panel-title">部门共享' + (isAdmin ? '（全部部门）' : '') + '</div>';
        if (!shareList.length) {
            html += '<div class="empty-state"><div class="empty-ico">🗂</div>暂无共享文件</div>';
        } else {
            html += fileListTable(shareList, u, true);
        }
        html += '</div>';
        // 个人文件区（管理员可查看全体员工个人文件）
        var myFiles = isAdmin ? HRDB.getFileVault({ scope: '个人' }) : HRDB.getFileVault({ ownerId: u.EmployeeID, scope: '个人' });
        html += '<div class="panel"><div class="panel-title">' + (isAdmin ? '全体员工个人文件' : '我的个人文件') + '</div>';
        if (!myFiles.length) {
            html += '<div class="empty-state"><div class="empty-ico">🗂</div>暂无个人文件</div>';
        } else {
            html += fileListTable(myFiles, u, false);
        }
        html += '</div>';
        $('#appContent').html(html);

        function fileListTable(list, user, isShare) {
            var isAdmin2 = (user.PermissionLevel === 3);
            var h = '<div class="table-wrap"><table class="hr-table"><thead><tr><th>文件名</th><th>大小</th>' + (isShare && isAdmin2 ? '<th>所属部门</th>' : '') + (isAdmin2 ? '<th>上传人</th>' : '') + '<th>上传时间</th><th class="op-cell">操作</th></tr></thead><tbody>';
            list.forEach(function (f) {
                h += '<tr><td style="max-width:220px;">' + esc(f.Name) + '</td><td>' + fmtSize(f.Size) + '</td>' + (isShare && isAdmin2 ? '<td>' + esc(HRDB.getDeptName(f.Department)) + '</td>' : '') + (isAdmin2 ? '<td>' + esc(f.OwnerName) + '</td>' : '') + '<td>' + esc(f.CreateTime) + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm" data-dl="' + f.VaultID + '">下载</a><a href="javascript:;" class="btn btn-sm btn-danger" data-vdel="' + f.VaultID + '">删除</a></td></tr>';
            });
            h += '</tbody></table></div>';
            return h;
        }
        function fmtSize(n) {
            n = n || 0;
            if (n < 1024) return n + ' B';
            if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
            return (n / 1048576).toFixed(1) + ' MB';
        }
        $('#fvUpload').off('click').on('click', function () {
            var files = $('#fvFile')[0].files;
            if (!files || !files.length) { toast('请先选择文件', 'error'); return; }
            var scope = $('#fvScope').val();
            var arr = Array.prototype.slice.call(files);
            var done = 0;
            arr.forEach(function (f) {
                window.HRFiles.save(f).then(function (fid) {
                    HRDB.addFileVault({
                        FileID: fid, Name: f.name, Size: f.size, Type: f.type || '', Scope: scope,
                        OwnerID: u.EmployeeID, OwnerName: u.EmployeeName,
                        // 管理员上传到部门共享 = 集团级文件，全员可见；主管/员工上传归属本部门
                        Department: (u.PermissionLevel === 3 && scope === '部门') ? '集团' : u.Department
                    });
                    done++;
                    if (done === arr.length) {
                        toast('上传完成（' + done + ' 个文件）', 'success');
                        setTimeout(function () { showView('fileVault'); }, 700);
                    }
                }).catch(function () {
                    toast('上传失败', 'error');
                });
            });
        });
        $('#appContent a[data-dl]').off('click').on('click', function () {
            var vid = parseInt($(this).data('dl'));
            var meta = HRDB.getFileVault().find(function (x) { return x.VaultID === vid; });
            if (!meta) { toast('文件不存在', 'error'); return; }
            window.HRFiles.get(meta.FileID).then(function (rec) {
                if (!rec) { toast('文件内容缺失', 'error'); return; }
                var url = URL.createObjectURL(rec.blob);
                var a = document.createElement('a');
                a.href = url; a.download = rec.name;
                document.body.appendChild(a); a.click(); a.remove();
                setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
            });
        });
        $('#appContent a[data-vdel]').off('click').on('click', function () {
            var vid = parseInt($(this).data('vdel'));
            var meta = HRDB.getFileVault().find(function (x) { return x.VaultID === vid; });
            showModal('删除文件', '<p style="color:var(--havvk-text);line-height:1.8;">确定删除「' + esc(meta ? meta.Name : '该文件') + '」吗？</p>',
                '<a href="javascript:;" class="btn btn-danger" id="fvDelOk">确认删除</a><a href="javascript:;" class="btn" id="fvDelCancel">取消</a>');
            $('#fvDelOk').off('click').on('click', function () {
                var m = HRDB.deleteFileVault(vid);
                if (m) window.HRFiles.remove(m.FileID);
                closeModal(); toast('已删除', 'success');
                setTimeout(function () { showView('fileVault'); }, 700);
            });
            $('#fvDelCancel').off('click').on('click', closeModal);
        });
    };

    // ---------- 工作周报（员工提交 → 主管/管理员点评） ----------
    VIEWS.weeklyReport = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isMgr = (u.PermissionLevel >= 2);
        var isAdmin = (u.PermissionLevel === 3);
        var html = '';
        html += '<div class="panel"><div class="panel-title">提交本周周报</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">周次</div><div><input type="text" id="wrWeek" value="' + esc(currentWeekLabel()) + '" maxlength="20"/></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">本周完成</div><div><textarea id="wrDone" rows="2" placeholder="本周完成的主要工作"></textarea></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">下周计划</div><div><textarea id="wrPlan" rows="2" placeholder="下周工作计划"></textarea></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">问题与建议</div><div><textarea id="wrIssue" rows="2" placeholder="遇到的问题或改进建议（选填）"></textarea></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="wrSubmit">提交周报</a></div>';
        html += '</div>';
        // 主管/管理员点评区
        if (isMgr) {
            var deptList = isAdmin ? HRDB.getWeeklyReports({}) : HRDB.getWeeklyReports({ department: u.Department });
            html += '<div class="panel"><div class="panel-title">' + (isAdmin ? '全部周报' : '本部门周报') + '</div>';
            if (!deptList.length) {
                html += '<div class="empty-state"><div class="empty-ico">▤</div>暂无周报</div>';
            } else {
                deptList.forEach(function (r) {
                    html += '<div class="fb-card">';
                    html += '<div class="fb-head"><span class="ann-tag">' + esc(r.WeekLabel) + '</span><span class="fb-title">' + esc(r.EmployeeName) + '</span></div>';
                    html += '<div class="fb-body">📌 完成：' + esc(r.Done) + '<br/>📋 计划：' + esc(r.Plan) + (r.Issue ? '<br/>⚠️ 问题：' + esc(r.Issue) : '') + '</div>';
                    html += '<div class="fb-meta">提交于 ' + esc(r.CreateTime);
                    if (r.ReviewNote) html += ' · 点评：' + esc(r.ReviewBy) + '：' + esc(r.ReviewNote);
                    else html += ' <a href="javascript:;" class="fb-handle" data-review="' + r.ReportID + '">点评</a>';
                    html += '</div></div>';
                });
            }
            html += '</div>';
        }
        // 我的周报
        var myList = HRDB.getWeeklyReports({ empId: u.EmployeeID });
        html += '<div class="panel"><div class="panel-title">我的周报记录</div>';
        if (!myList.length) {
            html += '<div class="empty-state"><div class="empty-ico">▤</div>暂无周报记录</div>';
        } else {
            myList.forEach(function (r) {
                html += '<div class="fb-card">';
                html += '<div class="fb-head"><span class="ann-tag">' + esc(r.WeekLabel) + '</span><span class="fb-title">' + esc(r.EmployeeName) + '</span></div>';
                html += '<div class="fb-body">📌 完成：' + esc(r.Done) + '<br/>📋 计划：' + esc(r.Plan) + (r.Issue ? '<br/>⚠️ 问题：' + esc(r.Issue) : '') + '</div>';
                html += '<div class="fb-meta">提交于 ' + esc(r.CreateTime) + (r.ReviewNote ? ' · 主管点评：' + esc(r.ReviewBy) + '：' + esc(r.ReviewNote) : ' · 待主管点评') + '</div>';
                html += '</div>';
            });
        }
        html += '</div>';
        $(container).html(html);
        $('#wrSubmit').off('click').on('click', function () {
            var week = $('#wrWeek').val().trim();
            var done = $('#wrDone').val().trim();
            var plan = $('#wrPlan').val().trim();
            if (!week || !done || !plan) { toast('请填写周次、本周完成与下周计划', 'error'); return; }
            HRDB.addWeeklyReport({
                WeekLabel: week, Done: done, Plan: plan, Issue: $('#wrIssue').val().trim(),
                EmployeeID: u.EmployeeID, EmployeeName: u.EmployeeName, Department: u.Department
            });
            toast('周报已提交', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('weekly'); }, 800);
        });
        if (isMgr) {
            $(container).find('a[data-review]').off('click').on('click', function () {
                var id = parseInt($(this).data('review'));
                showModal('点评周报', '<textarea id="wrNote" rows="3" placeholder="填写点评意见" style="width:100%;"></textarea>',
                    '<a href="javascript:;" class="btn btn-primary" id="wrReviewOk">确认点评</a><a href="javascript:;" class="btn" id="wrReviewCancel">取消</a>');
                $('#wrReviewOk').off('click').on('click', function () {
                    var note = $('#wrNote').val().trim();
                    if (!note) { toast('请填写点评意见', 'error'); return; }
                    HRDB.reviewWeeklyReport(id, note, u.EmployeeName);
                    closeModal(); toast('点评完成', 'success');
                    setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('weekly'); }, 800);
                });
                $('#wrReviewCancel').off('click').on('click', closeModal);
            });
        }
    };

    // ---------- 设备申领（员工申请 → 主管/管理员审批发放） ----------
    VIEWS.equipment = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isMgr = (u.PermissionLevel >= 2);
        var isAdmin = (u.PermissionLevel === 3);
        var html = '';
        html += '<div class="panel"><div class="panel-title">申请办公设备</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">设备类别</div><div><select id="eqCat"><option value="笔记本电脑">笔记本电脑</option><option value="显示器">显示器</option><option value="工牌">工牌</option><option value="办公用品">办公用品</option><option value="其他">其他</option></select></div></div>';
        html += '<div class="detail-item"><div class="d-label">规格型号</div><div><input type="text" id="eqSpec" placeholder="如：ThinkPad X1 Carbon" maxlength="60"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">数量</div><div><input type="number" id="eqQty" value="1" min="1" max="50"/></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">申请原因</div><div><textarea id="eqReason" rows="2" placeholder="说明申领原因"></textarea></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="eqSubmit">提交申请</a></div>';
        html += '</div>';
        if (isMgr) {
            var pend = isAdmin ? HRDB.getEquipRequests({ status: '待审批' }) : HRDB.getEquipRequests({ department: u.Department, status: '待审批' });
            html += '<div class="panel"><div class="panel-title">待审批申领' + (isAdmin ? '（全部）' : '（本部门）') + '</div>';
            if (!pend.length) {
                html += '<div class="empty-state"><div class="empty-ico">⌨</div>暂无待审批申领</div>';
            } else {
                html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>申请人</th><th>设备</th><th>规格</th><th>数量</th><th>原因</th><th class="op-cell">操作</th></tr></thead><tbody>';
                pend.forEach(function (e) {
                    html += '<tr><td>' + esc(e.EmployeeName) + '（' + esc(e.EmployeeID) + '）</td><td>' + esc(e.Category) + '</td><td style="max-width:160px;">' + esc(e.Spec) + '</td><td>' + e.Quantity + '</td><td style="max-width:160px;">' + esc(e.Reason) + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-primary" data-ok="' + e.ReqID + '">发放</a><a href="javascript:;" class="btn btn-sm btn-danger" data-no="' + e.ReqID + '">驳回</a></td></tr>';
                });
                html += '</tbody></table></div>';
            }
            html += '</div>';
        }
        var myList = HRDB.getEquipRequests({ empId: u.EmployeeID });
        html += '<div class="panel"><div class="panel-title">我的申领记录</div>';
        if (!myList.length) {
            html += '<div class="empty-state"><div class="empty-ico">⌨</div>暂无申领记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>设备</th><th>规格</th><th>数量</th><th>申请时间</th><th>状态</th><th>审批意见</th></tr></thead><tbody>';
            myList.forEach(function (e) {
                html += '<tr><td>' + esc(e.Category) + '</td><td style="max-width:160px;">' + esc(e.Spec) + '</td><td>' + e.Quantity + '</td><td>' + esc(e.CreateTime) + '</td><td>' + statusTag(e.Status) + '</td><td style="max-width:160px;">' + (e.ApproveNote ? esc(e.ApproveBy) + '：' + esc(e.ApproveNote) : '—') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);
        $('#eqSubmit').off('click').on('click', function () {
            var spec = $('#eqSpec').val().trim();
            var reason = $('#eqReason').val().trim();
            var qty = parseInt($('#eqQty').val(), 10);
            if (!spec) { toast('请填写规格型号', 'error'); return; }
            if (!reason) { toast('请填写申请原因', 'error'); return; }
            if (isNaN(qty) || qty < 1) { toast('数量不正确', 'error'); return; }
            HRDB.addEquipRequest({
                Category: $('#eqCat').val(), Spec: spec, Quantity: qty, Reason: reason,
                EmployeeID: u.EmployeeID, EmployeeName: u.EmployeeName, Department: u.Department
            });
            toast('申领申请已提交', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('logistics'); }, 800);
        });
        if (isMgr) {
            $(container).find('a[data-ok]').off('click').on('click', function () {
                var id = parseInt($(this).data('ok'));
                showModal('确认发放', '<p style="color:var(--havvk-text);line-height:1.8;">确定批准该设备申领并发放吗？</p><textarea id="eqNote" rows="2" placeholder="发放说明（选填）" style="width:100%;"></textarea>',
                    '<a href="javascript:;" class="btn btn-primary" id="eqOk">确认发放</a><a href="javascript:;" class="btn" id="eqCancel">取消</a>');
                $('#eqOk').off('click').on('click', function () {
                    HRDB.approveEquipRequest(id, true, $('#eqNote').val().trim() || '已发放', u.EmployeeName);
                    closeModal(); toast('已发放', 'success');
                    setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('logistics'); }, 800);
                });
                $('#eqCancel').off('click').on('click', closeModal);
            });
            $(container).find('a[data-no]').off('click').on('click', function () {
                var id = parseInt($(this).data('no'));
                showModal('驳回申领', '<p style="color:var(--havvk-text);line-height:1.8;">确定驳回该申领吗？请填写驳回原因。</p><textarea id="eqNote2" rows="2" placeholder="驳回原因" style="width:100%;"></textarea>',
                    '<a href="javascript:;" class="btn btn-danger" id="eqNoOk">确认驳回</a><a href="javascript:;" class="btn" id="eqNoCancel">取消</a>');
                $('#eqNoOk').off('click').on('click', function () {
                    var note = $('#eqNote2').val().trim();
                    if (!note) { toast('请填写驳回原因', 'error'); return; }
                    HRDB.approveEquipRequest(id, false, note, u.EmployeeName);
                    closeModal(); toast('已驳回', 'success');
                    setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('logistics'); }, 800);
                });
                $('#eqNoCancel').off('click').on('click', closeModal);
            });
        }
    };

    // ---------- 员工嘉奖（主管/管理员发布，全员可见嘉奖墙） ----------
    VIEWS.recognition = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isMgr = (u.PermissionLevel >= 2);
        var isAdmin = (u.PermissionLevel === 3);
        var html = '';
        if (isMgr) {
            var empOpts;
            if (isAdmin) {
                empOpts = HRDB.getEmployees().filter(function (e) { return e.IsActive; }).map(function (e) { return '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '（' + esc(HRDB.getDeptName(e.Department)) + '）</option>'; }).join('');
            } else {
                empOpts = HRDB.getEmployees({ department: u.Department }).filter(function (e) { return e.IsActive; }).map(function (e) { return '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '</option>'; }).join('');
            }
            html += '<div class="panel"><div class="panel-title">发布嘉奖</div>';
            html += '<div class="detail-grid">';
            html += '<div class="detail-item"><div class="d-label">被嘉奖员工</div><div><select id="rcEmp">' + empOpts + '</select></div></div>';
            html += '<div class="detail-item"><div class="d-label">嘉奖类型</div><div><select id="rcType"><option value="嘉奖">嘉奖</option><option value="感谢">感谢</option><option value="榜样">榜样</option></select></div></div>';
            html += '<div class="detail-item wide"><div class="d-label">嘉奖内容</div><div><textarea id="rcContent" rows="2" placeholder="描述员工的具体贡献或值得表扬的行为"></textarea></div></div>';
            html += '</div>';
            html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="rcPublish">发布嘉奖</a></div>';
            html += '</div>';
        }
        var list = HRDB.getRecognitions({});
        html += '<div class="panel"><div class="panel-title">集团嘉奖墙</div>';
        if (!list.length) {
            html += '<div class="empty-state"><div class="empty-ico">★</div>暂无嘉奖记录</div>';
        } else {
            list.forEach(function (r) {
                html += '<div class="rec-card">';
                html += '<div class="rec-head"><span class="rec-star">★</span><span class="rec-to">' + esc(r.ToName) + '</span><span class="ann-tag">' + esc(r.Type) + '</span><span class="rec-dept">' + esc(HRDB.getDeptName(r.Department)) + '</span></div>';
                html += '<div class="rec-content">' + esc(r.Content) + '</div>';
                html += '<div class="rec-meta">由 ' + esc(r.FromName) + ' 发布于 ' + esc(r.CreateTime) + (isAdmin ? ' <a href="javascript:;" class="ann-del" data-del="' + r.RecID + '">删除</a>' : '') + '</div>';
                html += '</div>';
            });
        }
        html += '</div>';
        $(container).html(html);
        if (isMgr) {
            $('#rcPublish').off('click').on('click', function () {
                var toId = $('#rcEmp').val();
                var content = $('#rcContent').val().trim();
                if (!content) { toast('请填写嘉奖内容', 'error'); return; }
                var emp = HRDB.getEmployeeById(toId);
                HRDB.addRecognition({
                    FromID: u.EmployeeID, FromName: u.EmployeeName,
                    ToID: toId, ToName: emp ? emp.EmployeeName : toId,
                    Department: emp ? emp.Department : u.Department,
                    Type: $('#rcType').val(), Content: content
                });
                toast('嘉奖已发布', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('groupNews'); }, 800);
            });
            $(container).find('a[data-del]').off('click').on('click', function () {
                var id = parseInt($(this).data('del'));
                showModal('删除嘉奖', '<p style="color:var(--havvk-text);line-height:1.8;">确定删除该条嘉奖吗？</p>',
                    '<a href="javascript:;" class="btn btn-danger" id="rcDelOk">确认删除</a><a href="javascript:;" class="btn" id="rcDelCancel">取消</a>');
                $('#rcDelOk').off('click').on('click', function () {
                    HRDB.deleteRecognition(id);
                    closeModal(); toast('已删除', 'success');
                    setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('groupNews'); }, 800);
                });
                $('#rcDelCancel').off('click').on('click', closeModal);
            });
        }
    };

    function showLeaveDetail(l) {
        var html = '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">申请人</div><div class="d-value">' + esc(l.EmployeeName) + ' (' + esc(l.EmployeeID) + ')</div></div>';
        html += '<div class="detail-item"><div class="d-label">部门</div><div class="d-value">' + esc(HRDB.getDeptName(l.Department)) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">请假类型</div><div class="d-value">' + esc(l.LeaveType) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">状态</div><div class="d-value">' + statusTag(l.Status) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">请假日期</div><div class="d-value">' + esc(l.StartDate) + ' 至 ' + esc(l.EndDate) + '（' + l.Days + ' 天）</div></div>';
        html += '<div class="detail-item"><div class="d-label">提交时间</div><div class="d-value">' + esc(l.ApplyTime) + '</div></div>';
        html += '<div class="detail-item wide"><div class="d-label">请假事由</div><div class="d-value multi">' + esc(l.Reason) + '</div></div>';
        if (l.ApproverID) {
            html += '<div class="detail-item"><div class="d-label">审批人</div><div class="d-value">' + esc(l.ApproverID) + '</div></div>';
            html += '<div class="detail-item"><div class="d-label">审批时间</div><div class="d-value">' + esc(l.ApproveTime) + '</div></div>';
            html += '<div class="detail-item wide"><div class="d-label">审批意见</div><div class="d-value multi">' + esc(l.Remarks || '无') + '</div></div>';
        }
        html += '</div>';
        showModal('请假详情', html, '<a href="javascript:;" class="btn" id="btnDetailClose">关闭</a>');
        $('#btnDetailClose').off('click').on('click', closeModal);
    }

    // ---------- 我的任务 ----------
    VIEWS.mission = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var list = HRDB.getMissions(u.EmployeeID);
        var html = '';
        html += '<div class="panel"><div class="panel-title">我的任务清单</div>';
        if (list.length === 0) {
            html += '<div class="empty-state"><div class="empty-ico">✎</div>暂无任务</div>';
        } else {
            html += '<div class="mission-grid">';
            list.forEach(function (m) {
                var overdue = !m.IsCompleted && m.MissionDeadline < HRDB.today();
                var st = m.Status || (m.IsCompleted ? '已评分' : '待执行');
                var stTag = st === '已评分' ? '<span class="tag tag-green">已评分</span>'
                    : st === '已提交' ? '<span class="tag tag-blue">已提交</span>'
                    : overdue ? '<span class="tag tag-red">已逾期</span>'
                    : '<span class="tag tag-gold">待执行</span>';
                html += '<div class="mission-card' + (m.IsCompleted ? ' completed' : '') + '">';
                html += '<div class="mission-content">' + esc(m.MissionContent) + '</div>';
                html += attListHtml(m.Attachments, '任务附件');
                html += '<div class="mission-meta">';
                html += '<span>' + stTag + '</span>';
                html += '<span class="mission-deadline">⏱ ' + esc(m.MissionDeadline) + '</span>';
                html += '</div>';
                if (st === '已提交') {
                    html += '<div class="mission-submit-info">已提交成果，等待主管查收<br/><div class="text-dim" style="font-size:12px;margin-top:4px;">提交时间：' + esc(m.SubmitTime || '') + '</div></div>';
                    html += attListHtml(m.SubmitAttachments, '已提交附件');
                }
                if (st === '已评分') {
                    html += '<div class="mission-score-box">绩效评分：<span class="score-num">' + (m.Score != null ? m.Score : '—') + '</span> 分<br/><div class="text-dim" style="font-size:12px;margin-top:4px;">评语：' + esc(m.ScoreComment || '—') + '</div></div>';
                }
                if (st === '待执行') {
                    html += '<div class="mission-submit-form"><textarea class="mission-textarea" id="msContent_' + m.ID + '" rows="3" placeholder="填写任务成果 / 提交文档说明…"></textarea>';
                    html += '<div class="att-upload" style="margin-top:10px;"><label class="att-upload-label">📎 添加附件<input type="file" id="msFiles_' + m.ID + '" multiple style="display:none;"/><span class="att-file-list" id="msFileList_' + m.ID + '"></span></label></div>';
                    html += '<div style="margin-top:10px;"><a href="javascript:;" class="btn btn-sm btn-primary" data-submit="' + m.ID + '">提交成果给主管</a></div></div>';
                }
                html += '</div>';
            });
            html += '</div>';
        }
        html += '</div>';
        $(container).html(html);
        bindAttDownloads(container);
        // 附件选择即时显示文件名
        $(container).find('input[type=file]').off('change').on('change', function () {
            var t = $(this);
            var list = Array.prototype.slice.call(t[0].files).map(function (f) { return f.name; });
            t.siblings('.att-file-list').text(list.join('、'));
        });
        $(container).find('a[data-submit]').off('click').on('click', function () {
            var id = parseInt($(this).data('submit'));
            var content = $('#msContent_' + id).val().trim();
            if (!content) { toast('请填写任务成果内容', 'error'); return; }
            var files = $('#msFiles_' + id)[0].files;
            var btn = $(this);
            btn.text('正在提交…').css('opacity', .6);
            saveFiles(files).then(function (atts) {
                var r = HRDB.submitMission(id, content, atts);
                toast(r ? '成果已提交，等待主管查收' : '提交失败', r ? 'success' : 'error');
                if (r) setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('taskCenter'); }, 800);
                else btn.text('提交成果给主管').css('opacity', 1);
            }).catch(function () {
                btn.text('提交成果给主管').css('opacity', 1);
                toast('附件保存失败，请重试', 'error');
            });
        });
    };

    // ---------- 任务下发（主管） ----------
    VIEWS.missionAdmin = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var deptCode = u.Department;
        var deptName = HRDB.getDeptName(deptCode);
        // 本部门在职员工（排除主管自己，可选发给自己？不排除，主管也可给自己下发——默认给员工）
        var emps = HRDB.getEmployees({ department: deptCode }).filter(function (e) { return e.IsActive; });
        var list = HRDB.getDeptMissions(deptCode);
        var pending = list.filter(function (m) { return m.Status === '已提交'; }).length;
        var executing = list.filter(function (m) { return m.Status === '待执行'; }).length;
        var scored = list.filter(function (m) { return m.Status === '已评分'; }).length;

        var html = '';
        html += '<div class="stat-grid">';
        html += '<div class="stat-card gold"><div class="stat-ico">▣</div><div class="stat-value">' + executing + '</div><div class="stat-label">待执行</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">✎</div><div class="stat-value">' + pending + '</div><div class="stat-label">待查收评分</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">☑</div><div class="stat-value">' + scored + '</div><div class="stat-label">已评分</div></div>';
        html += '</div>';

        html += '<div class="panel"><div class="panel-title">下发新任务 · ' + esc(deptName) + '</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">接收员工</div><div><select id="maEmp">';
        emps.forEach(function (e) { html += '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '（' + esc(e.EmployeeID) + '）</option>'; });
        html += '</select></div></div>';
        html += '<div class="detail-item"><div class="d-label">截止日期</div><div><input type="date" id="maDeadline"/></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">任务内容</div><div><textarea id="maContent" rows="3" placeholder="请输入任务要求…"></textarea></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">任务附件（可选）</div><div><label class="att-upload-label">📎 选择文件<input type="file" id="maFiles" multiple style="display:none;"/><span class="att-file-list" id="maFileList"></span></label></div></div>';
        html += '</div>';
        html += '<div style="margin-top:18px;"><a href="javascript:;" class="btn btn-primary" id="maSend">下发任务</a></div>';
        html += '</div>';

        html += '<div class="panel"><div class="panel-title">部门任务列表</div>';
        if (list.length === 0) {
            html += '<div class="empty-state"><div class="empty-ico">▣</div>本部门暂无任务</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>员工</th><th>任务内容</th><th>截止日期</th><th>状态</th><th>提交成果</th><th>操作</th></tr></thead><tbody>';
            list.forEach(function (m) {
                var st = m.Status || '待执行';
                var stTag = st === '已评分' ? '<span class="tag tag-green">已评分</span>'
                    : st === '已提交' ? '<span class="tag tag-blue">已提交</span>'
                    : '<span class="tag tag-gold">待执行</span>';
                html += '<tr>';
                html += '<td><div>' + esc(m.EmployeeName) + '</div><div class="text-dim" style="font-size:11px;">' + esc(m.EmployeeID) + '</div></td>';
                html += '<td style="max-width:180px;">' + esc(m.MissionContent) + attListHtml(m.Attachments, '') + '</td>';
                html += '<td>' + esc(m.MissionDeadline) + '</td>';
                html += '<td>' + stTag + '</td>';
                if (st === '已提交') {
                    html += '<td style="max-width:220px;"><div>' + esc(m.SubmitContent) + '</div><div class="text-dim" style="font-size:11px;">' + esc(m.SubmitTime || '') + '</div>' + attListHtml(m.SubmitAttachments, '') + '</td>';
                    html += '<td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-primary" data-score="' + m.ID + '">评分</a></td>';
                } else if (st === '已评分') {
                    html += '<td><div>' + esc(m.SubmitContent || '—') + '</div><div class="text-dim" style="font-size:11px;">绩效：' + (m.Score != null ? m.Score : '—') + ' 分 · ' + esc(m.ScoreComment || '') + '</div>' + attListHtml(m.SubmitAttachments, '') + '</td>';
                    html += '<td></td>';
                } else {
                    html += '<td>—</td><td></td>';
                }
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);
        bindAttDownloads(container);
        // 附件选择即时显示文件名
        $('#maFiles').off('change').on('change', function () {
            var list = Array.prototype.slice.call(this.files).map(function (f) { return f.name; });
            $('#maFileList').text(list.join('、'));
        });
        $('#maSend').off('click').on('click', function () {
            var empId = $('#maEmp').val();
            var deadline = $('#maDeadline').val();
            var content = $('#maContent').val().trim();
            if (!deadline) { toast('请选择截止日期', 'error'); return; }
            if (!content) { toast('请填写任务内容', 'error'); return; }
            var emp = HRDB.getEmployeeById(empId);
            var files = $('#maFiles')[0].files;
            var btn = $(this);
            btn.text('正在下发…').css('opacity', .6);
            saveFiles(files).then(function (atts) {
                HRDB.addMission(empId, emp.EmployeeName, content, deadline, atts);
                toast('任务已下发', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('taskAdmin'); }, 800);
            }).catch(function () {
                btn.text('下发任务').css('opacity', 1);
                toast('附件保存失败，请重试', 'error');
            });
        });

        $(container).find('a[data-score]').off('click').on('click', function () {
            var id = parseInt($(this).data('score'));
            openScoreModal(id);
        });
    };

    function openScoreModal(mId) {
        var m = HRDB.getDeptMissions(Session.user.Department).find(function (x) { return x.ID === mId; });
        if (!m) return;
        var body = '';
        body += '<div class="form-group"><label>任务内容</label><div class="modal-text">' + esc(m.MissionContent) + '</div></div>';
        body += '<div class="form-group"><label>员工提交成果</label><div class="modal-text">' + esc(m.SubmitContent) + '<div class="text-dim" style="font-size:11px;margin-top:4px;">' + esc(m.SubmitTime || '') + '</div></div>' + attListHtml(m.SubmitAttachments, '提交附件') + '</div>';
        body += '<div class="form-group"><label>绩效评分（0-100）</label><input type="number" id="scScore" min="0" max="100" value="80"/></div>';
        body += '<div class="form-group"><label>绩效评语</label><textarea id="scComment" rows="3" placeholder="填写绩效评语…"></textarea></div>';
        var foot = '<a href="javascript:;" class="btn btn-primary" id="scSave">确认评分</a><a href="javascript:;" class="btn" id="scCancel">取消</a>';
        showModal('任务评分 · ' + m.EmployeeName, body, foot);
        bindAttDownloads('#modalBody');
        $('#scSave').off('click').on('click', function () {
            var score = parseFloat($('#scScore').val());
            if (isNaN(score) || score < 0 || score > 100) { toast('请输入 0-100 的评分', 'error'); return; }
            var comment = $('#scComment').val().trim() || '—';
            var r = HRDB.scoreMission(mId, score, comment, Session.user.EmployeeID);
            toast(r ? '评分完成，已写入绩效考核' : '评分失败（任务需为已提交状态）', r ? 'success' : 'error');
            closeModal();
            if (r) setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('taskAdmin'); }, 800);
        });
        $('#scCancel').off('click').on('click', closeModal);
    };

    // ---------- 绩效考核（主管） ----------
    VIEWS.review = function (container) {
        container = container || '#appContent';
        var list = HRDB.getReviews();
        var pending = list.filter(function (r) { return r.Status === '待提交'; }).length;
        var submitted = list.filter(function (r) { return r.Status === '已提交'; }).length;
        var reviewed = list.filter(function (r) { return r.Status === '已审核'; }).length;
        var avg = 0;
        var scored = list.filter(function (r) { return r.PerformanceScore > 0; });
        if (scored.length) {
            avg = scored.reduce(function (s, r) { return s + r.PerformanceScore; }, 0) / scored.length;
        }

        var html = '';
        html += '<div class="stat-grid">';
        html += '<div class="stat-card gold"><div class="stat-ico">◷</div><div class="stat-value">' + pending + '</div><div class="stat-label">待提交</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">▤</div><div class="stat-value">' + submitted + '</div><div class="stat-label">已提交</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">☑</div><div class="stat-value">' + reviewed + '</div><div class="stat-label">已审核</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">◈</div><div class="stat-value">' + (avg ? avg.toFixed(1) : '—') + '</div><div class="stat-label">平均绩效分</div></div>';
        html += '</div>';
        html += '<div class="panel"><div class="panel-title">绩效考核记录</div>';
        html += '<div class="toolbar">';
        html += '<a href="javascript:;" class="btn btn-primary" id="rvNew">＋ 新增考核</a>';
        html += '<span class="spacer"></span>';
        html += '<select id="rvStatus"><option value="">全部状态</option><option value="待提交">待提交</option><option value="已提交">已提交</option><option value="已审核">已审核</option></select>';
        html += '<select id="rvPeriod"><option value="">全部周期</option><option value="2026年Q1">2026年Q1</option><option value="2026年Q2">2026年Q2</option><option value="2026年Q3">2026年Q3</option></select>';
        html += '<input type="text" class="search-input" id="rvSearch" placeholder="搜索姓名 / 工号"/>';
        html += '<a href="javascript:;" class="btn btn-sm" id="rvSearchBtn">查询</a>';
        html += '</div>';
        if (list.length === 0) {
            html += '<div class="empty-state"><div class="empty-ico">◈</div>暂无考核记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>员工</th><th>考核周期</th><th>绩效分</th><th>KPI完成率</th><th>工作质量</th><th>协作分</th><th>状态</th><th>操作</th></tr></thead><tbody>';
            list.forEach(function (r) {
                html += '<tr>';
                html += '<td><div>' + esc(r.EmployeeName) + '</div><div class="text-dim" style="font-size:11px;">' + esc(r.EmployeeID) + '</div></td>';
                html += '<td>' + esc(r.ReviewPeriod) + '</td>';
                html += '<td><span class="tag ' + scoreClass(r.PerformanceScore) + '">' + (r.PerformanceScore ? r.PerformanceScore.toFixed(1) : '—') + '</span></td>';
                html += '<td>' + (r.KPICompletion ? r.KPICompletion.toFixed(1) + '%' : '—') + '</td>';
                html += '<td>' + qualityTag(r.WorkQuality) + '</td>';
                html += '<td>' + (r.TeamworkScore ? r.TeamworkScore.toFixed(0) : '—') + '</td>';
                html += '<td>' + statusTag(r.Status) + '</td>';
                html += '<td class="op-cell">';
                html += '<a href="javascript:;" class="btn btn-sm" data-act="view" data-id="' + r.ReviewID + '">详情</a>';
                if (r.Status === '待提交') {
                    html += '<a href="javascript:;" class="btn btn-sm" data-act="edit" data-id="' + r.ReviewID + '">编辑</a>';
                    html += '<a href="javascript:;" class="btn btn-sm btn-primary" data-act="submit" data-id="' + r.ReviewID + '">提交</a>';
                    html += '<a href="javascript:;" class="btn btn-sm btn-danger" data-act="delete" data-id="' + r.ReviewID + '">删除</a>';
                }
                html += '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);

        function reload() {
            var f = {};
            if ($('#rvStatus').val()) f.status = $('#rvStatus').val();
            if ($('#rvPeriod').val()) f.period = $('#rvPeriod').val();
            if ($('#rvSearch').val()) f.keyword = $('#rvSearch').val();
            VIEWS.review.__filter = f;
            VIEWS.review(container);
        }

        $('#rvNew').off('click').on('click', function () { openReviewModal(null); });
        $('#rvSearchBtn').off('click').on('click', reload);
        $(container).find('a[data-act]').off('click').on('click', function () {
            var act = $(this).data('act');
            var id = parseInt($(this).data('id'));
            var review = HRDB.getReviews().find(function (r) { return r.ReviewID === id; });
            if (act === 'view') {
                openReviewDetail(review);
            } else if (act === 'edit') {
                openReviewModal(review);
            } else if (act === 'submit') {
                HRDB.submitReview(id, Session.user.EmployeeID);
                toast('考核已提交', 'success');
                reload();
            } else if (act === 'delete') {
                HRDB.deleteReview(id);
                toast('考核记录已删除', 'success');
                reload();
            }
        });
    };

    function deptEmployeeOptions() {
        var opts = '';
        HRDB.getDepartments().forEach(function (d) { opts += '<option value="' + d.DepartmentCode + '">' + esc(d.DepartmentName) + '</option>'; });
        return opts;
    }

    function openReviewModal(review) {
        var isEdit = !!review;
        var empOptions = '<option value="">请选择员工</option>';
        HRDB.getEmployees({}).filter(function (e) { return e.IsActive; }).forEach(function (e) {
            empOptions += '<option value="' + e.EmployeeID + '"' + (isEdit && review.EmployeeID === e.EmployeeID ? ' selected' : '') + '>' + esc(e.EmployeeName + ' (' + e.EmployeeID + ')') + '</option>';
        });
        var body = '';
        body += '<div class="form-group"><label>考核员工</label><select id="rvEmp">' + empOptions + '</select></div>';
        body += '<div class="form-group"><label>考核周期</label><select id="rvPeriodF"><option value="2026年Q1"' + (isEdit && review.ReviewPeriod === '2026年Q1' ? ' selected' : '') + '>2026年Q1</option><option value="2026年Q2"' + (isEdit && review.ReviewPeriod === '2026年Q2' ? ' selected' : '') + '>2026年Q2</option><option value="2026年Q3"' + (isEdit && review.ReviewPeriod === '2026年Q3' ? ' selected' : '') + '>2026年Q3</option></select></div>';
        body += '<div class="form-group"><label>绩效得分（0-100）</label><input type="number" id="rvScore" min="0" max="100" value="' + (isEdit && review.PerformanceScore ? review.PerformanceScore : '') + '"/></div>';
        body += '<div class="form-group"><label>KPI完成率（%）</label><input type="number" id="rvKpi" min="0" max="100" value="' + (isEdit && review.KPICompletion ? review.KPICompletion : '') + '"/></div>';
        body += '<div class="form-group"><label>工作质量</label><select id="rvQuality"><option value="优秀"' + (isEdit && review.WorkQuality === '优秀' ? ' selected' : '') + '>优秀</option><option value="良好"' + (isEdit && review.WorkQuality === '良好' ? ' selected' : '') + '>良好</option><option value="一般"' + (isEdit && review.WorkQuality === '一般' ? ' selected' : '') + '>一般</option><option value="待改进"' + (isEdit && review.WorkQuality === '待改进' ? ' selected' : '') + '>待改进</option></select></div>';
        body += '<div class="form-group"><label>团队协作分</label><input type="number" id="rvTeam" min="0" max="100" value="' + (isEdit && review.TeamworkScore ? review.TeamworkScore : '') + '"/></div>';
        body += '<div class="form-group"><label>考核评语</label><textarea id="rvComment" rows="3">' + (isEdit ? esc(review.ReviewComments) : '') + '</textarea></div>';

        var foot = '<a href="javascript:;" class="btn btn-primary" id="rvSave">保存</a><a href="javascript:;" class="btn" id="rvCancel">取消</a>';
        showModal(isEdit ? '编辑绩效考核' : '新增绩效考核', body, foot);

        $('#rvSave').off('click').on('click', function () {
            var empId = $('#rvEmp').val();
            var period = $('#rvPeriodF').val();
            var score = parseFloat($('#rvScore').val());
            var kpi = parseFloat($('#rvKpi').val());
            var quality = $('#rvQuality').val();
            var team = parseFloat($('#rvTeam').val());
            var comment = $('#rvComment').val().trim();
            if (!empId) { toast('请选择考核员工', 'error'); return; }
            if (isNaN(score) || score < 0 || score > 100) { toast('绩效得分必须在0-100之间', 'error'); return; }
            if (isNaN(kpi) || kpi < 0 || kpi > 100) { toast('KPI完成率必须在0-100之间', 'error'); return; }
            var emp = HRDB.getEmployeeById(empId);
            var dept = HRDB.getEmployees().find(function (e) { return e.EmployeeID === empId; });
            var data = {
                EmployeeID: empId, EmployeeName: emp ? emp.EmployeeName : '',
                Department: dept ? dept.Department : '', ReviewPeriod: period,
                PerformanceScore: score, KPICompletion: kpi, WorkQuality: quality,
                TeamworkScore: isNaN(team) ? 0 : team, ReviewComments: comment
            };
            if (isEdit) {
                HRDB.updateReview(review.ReviewID, data);
                toast('考核记录已更新', 'success');
            } else {
                // 检查周期重复
                var dup = HRDB.getReviews().find(function (r) { return r.EmployeeID === empId && r.ReviewPeriod === period; });
                if (dup) { toast('该员工在此考核周期已存在记录', 'error'); return; }
                data.Status = '待提交';
                data.ReviewerID = '';
                data.ReviewDate = null;
                HRDB.addReview(data);
                toast('考核记录已保存', 'success');
            }
            closeModal();
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('performance'); }, 700);
        });
        $('#rvCancel').off('click').on('click', closeModal);
    }

    function openReviewDetail(r) {
        var html = '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">员工</div><div class="d-value">' + esc(r.EmployeeName) + ' (' + esc(r.EmployeeID) + ')</div></div>';
        html += '<div class="detail-item"><div class="d-label">部门</div><div class="d-value">' + esc(HRDB.getDeptName(r.Department)) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">考核周期</div><div class="d-value">' + esc(r.ReviewPeriod) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">状态</div><div class="d-value">' + statusTag(r.Status) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">绩效得分</div><div class="d-value highlight">' + (r.PerformanceScore ? r.PerformanceScore.toFixed(1) : '—') + '</div><div class="progress-track"><div class="progress-fill" style="width:' + (r.PerformanceScore || 0) + '%;"></div></div></div>';
        html += '<div class="detail-item"><div class="d-label">KPI完成率</div><div class="d-value highlight">' + (r.KPICompletion ? r.KPICompletion.toFixed(1) + '%' : '—') + '</div><div class="progress-track"><div class="progress-fill" style="width:' + (r.KPICompletion || 0) + '%;"></div></div></div>';
        html += '<div class="detail-item"><div class="d-label">工作质量</div><div class="d-value">' + qualityTag(r.WorkQuality) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">团队协作分</div><div class="d-value">' + (r.TeamworkScore ? r.TeamworkScore.toFixed(0) : '—') + '</div></div>';
        html += '<div class="detail-item wide"><div class="d-label">考核评语</div><div class="d-value multi">' + esc(r.ReviewComments || '—') + '</div></div>';
        if (r.ReviewerID) {
            html += '<div class="detail-item"><div class="d-label">考核人</div><div class="d-value">' + esc(r.ReviewerID) + '</div></div>';
            html += '<div class="detail-item"><div class="d-label">考核日期</div><div class="d-value">' + esc(r.ReviewDate || '—') + '</div></div>';
        }
        html += '</div>';
        showModal('绩效考核详情', html, '<a href="javascript:;" class="btn" id="rvDetailClose">关闭</a>');
        $('#rvDetailClose').off('click').on('click', closeModal);
    }

    // ---------- 部门报表（主管） ----------
    VIEWS.deptReport = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var deptCode = u.Department;
        var dept = HRDB.getDepartments().find(function (d) { return d.DepartmentCode === deptCode; });
        var deptName = dept ? dept.DepartmentName : deptCode;
        var emps = HRDB.getEmployees({ department: deptCode }).filter(function (e) { return e.IsActive; });
        var total = emps.length;
        var male = emps.filter(function (e) { return e.Gender === '男'; }).length;
        var female = emps.filter(function (e) { return e.Gender === '女'; }).length;
        var avgAge = emps.length ? (emps.reduce(function (s, e) { return s + (e.Age || 0); }, 0) / emps.length) : 0;

        var deptReviews = HRDB.getReviews().filter(function (r) { return r.Department === deptCode && r.PerformanceScore > 0; });
        var avgPerf = deptReviews.length ? (deptReviews.reduce(function (s, r) { return s + r.PerformanceScore; }, 0) / deptReviews.length) : 87.2;
        var avgKpi = deptReviews.length ? (deptReviews.reduce(function (s, r) { return s + r.KPICompletion; }, 0) / deptReviews.length) : 92.3;

        var html = '';
        html += '<div class="panel"><div class="panel-title">' + esc(deptName) + ' · 部门数据概览</div>';
        html += '<div class="stat-grid">';
        html += '<div class="stat-card"><div class="stat-ico">👥</div><div class="stat-value">' + total + '</div><div class="stat-label">部门总人数</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">◈</div><div class="stat-value">' + avgPerf.toFixed(1) + '</div><div class="stat-label">平均绩效分</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">▤</div><div class="stat-value">' + avgKpi.toFixed(1) + '%</div><div class="stat-label">KPI达成率</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">◷</div><div class="stat-value">96.5%</div><div class="stat-label">平均出勤率</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">▤</div><div class="stat-value">' + HRDB.getLeaves().filter(function (l) { return l.Department === deptCode; }).length + '</div><div class="stat-label">请假人次</div></div>';
        html += '</div></div>';

        html += '<div class="panel"><div class="panel-title">部门员工明细（绩效 / 考勤 / 请假）</div>';
        html += '<div class="toolbar">';
        html += '<select id="drType"><option value="">默认排序</option><option value="performance">按绩效分</option><option value="attendance">按出勤率</option><option value="leave">按请假天数</option></select>';
        html += '<span class="text-dim" style="font-size:12px;">更新于：<span id="drTime"></span></span>';
        html += '<span class="spacer"></span>';
        html += '<a href="javascript:;" class="btn btn-sm" id="drSummary">生成部门总结</a>';
        html += '</div>';
        html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>工号</th><th>姓名</th><th>绩效分</th><th>工作质量</th><th>KPI完成率</th><th>出勤率</th><th>请假天数</th></tr></thead><tbody>';
        // 部门员工绩效模拟明细（与原系统 DepartmentReport 一致的数据风格）
        var rows = emps.map(function (e) {
            var r = deptReviews.find(function (x) { return x.EmployeeID === e.EmployeeID; });
            var leaves = HRDB.getLeaves({ empId: e.EmployeeID }).filter(function (l) { return l.Status === '已批准'; });
            var leaveDays = leaves.reduce(function (s, l) { return s + l.Days; }, 0);
            return {
                emp: e,
                score: r ? r.PerformanceScore : (Math.round((70 + Math.random() * 25) * 10) / 10),
                quality: r ? r.WorkQuality : '良好',
                kpi: r ? r.KPICompletion : (75 + Math.random() * 23),
                attendance: Math.round((90 + Math.random() * 9) * 10) / 10,
                leaveDays: leaveDays
            };
        });
        var sort = $('#drType').val();
        if (sort === 'performance') rows.sort(function (a, b) { return b.score - a.score; });
        else if (sort === 'attendance') rows.sort(function (a, b) { return b.attendance - a.attendance; });
        else if (sort === 'leave') rows.sort(function (a, b) { return a.leaveDays - b.leaveDays; });
        rows.forEach(function (row) {
            html += '<tr>';
            html += '<td>' + esc(row.emp.EmployeeID) + '</td>';
            html += '<td>' + esc(row.emp.EmployeeName) + '</td>';
            html += '<td><span class="tag ' + scoreClass(row.score) + '">' + row.score.toFixed(1) + '</span></td>';
            html += '<td>' + qualityTag(row.quality) + '</td>';
            html += '<td>' + row.kpi.toFixed(1) + '%</td>';
            html += '<td>' + row.attendance.toFixed(1) + '%</td>';
            html += '<td>' + row.leaveDays + ' 天</td>';
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        html += '</div>';

        html += '<div class="panel"><div class="panel-title">自动生成的部门总结</div><div class="summary-box" id="drSummaryBox">' + esc(buildSummary(deptName, total, avgPerf, avgKpi)) + '</div></div>';
        $(container).html(html);
        $('#drTime').text(HRDB.fmtNow().slice(0, 16));

        $('#drType').off('change').on('change', function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('dataReport'); });
        $('#drSummary').off('click').on('click', function () {
            toast('部门总结已生成', 'success');
        });
    };

    function buildSummary(deptName, total, avgPerf, avgKpi) {
        var d = new Date();
        var t = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
        var perfTxt = avgPerf >= 90 ? '优秀，超出预期目标' : avgPerf >= 80 ? '良好，达到预期目标' : avgPerf >= 70 ? '一般，需要改进' : '待改进，需重点关注';
        var lines = [];
        lines.push('【' + deptName + '部门工作总结】');
        lines.push('生成时间：' + t);
        lines.push('');
        lines.push('📊 部门概况：');
        lines.push('• 部门总人数：' + total + '人');
        lines.push('• 平均绩效分：' + avgPerf.toFixed(1) + '分');
        lines.push('• KPI达成率：' + avgKpi.toFixed(1) + '%');
        lines.push('• 平均出勤率：96.5%');
        lines.push('');
        lines.push('📈 表现分析：');
        lines.push('• 绩效表现：' + perfTxt);
        lines.push('• 出勤情况：优秀，员工出勤良好');
        lines.push('');
        lines.push('🎯 建议措施：');
        lines.push('1. 保持现有优秀表现');
        lines.push('2. 关注绩效待改进员工');
        lines.push('3. 优化工作流程提高效率');
        return lines.join('\n');
    }

    // ---------- 部门员工管理（主管） ----------
    VIEWS.deptEmployee = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var deptCode = u.Department;
        var deptName = HRDB.getDeptName(deptCode);
        var allDeptEmps = HRDB.getEmployees({ department: deptCode });
        var list = allDeptEmps.slice();
        if (window.__deFilter) {
            list = list.filter(function (e) {
                return (e.EmployeeName || '').indexOf(window.__deFilter) >= 0 || (e.EmployeeID || '').indexOf(window.__deFilter) >= 0;
            });
        }
        var active = allDeptEmps.filter(function (e) { return e.IsActive; });
        var male = active.filter(function (e) { return e.Gender === '男'; }).length;
        var female = active.filter(function (e) { return e.Gender === '女'; }).length;
        var avgAge = active.length ? (active.reduce(function (s, e) { return s + (e.Age || 0); }, 0) / active.length) : 0;

        var html = '';
        html += '<div class="panel"><div class="panel-title">' + esc(deptName) + ' · 员工统计</div>';
        html += '<div class="stat-grid">';
        html += '<div class="stat-card"><div class="stat-ico">👥</div><div class="stat-value">' + active.length + '</div><div class="stat-label">在职员工</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">♂</div><div class="stat-value">' + male + '</div><div class="stat-label">男性员工</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">♀</div><div class="stat-value">' + female + '</div><div class="stat-label">女性员工</div></div>';
        html += '<div class="stat-card"><div class="stat-ico">◷</div><div class="stat-value">' + (avgAge ? avgAge.toFixed(1) : '—') + '</div><div class="stat-label">平均年龄</div></div>';
        html += '</div></div>';

        html += '<div class="panel"><div class="panel-title">部门员工列表</div>';
        html += '<div class="toolbar">';
        html += '<input type="text" class="search-input" id="deSearch" placeholder="搜索姓名 / 工号"/>';
        html += '<select id="deGender"><option value="">全部性别</option><option value="男">男</option><option value="女">女</option></select>';
        html += '<a href="javascript:;" class="btn btn-sm" id="deSearchBtn">查询</a>';
        html += '<a href="javascript:;" class="btn btn-sm" id="deResetBtn">重置</a>';
        html += '<span class="spacer"></span>';
        html += '<a href="javascript:;" class="btn btn-sm btn-primary" id="deAdd">＋ 新增员工</a>';
        html += '</div>';
        if (list.length === 0) {
            html += '<div class="empty-state"><div class="empty-ico">☰</div>暂无员工</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>工号</th><th>姓名</th><th>性别</th><th>年龄</th><th>角色</th><th>电话</th><th>状态</th><th>操作</th></tr></thead><tbody>';
            list.forEach(function (e) {
                var role = HRDB.getRoleName ? HRDB.getRoleName(e) : (PERM[e.PermissionLevel] ? PERM[e.PermissionLevel].name : '未知');
                html += '<tr>';
                html += '<td>' + esc(e.EmployeeID) + '</td><td>' + esc(e.EmployeeName) + '</td>';
                html += '<td>' + esc(e.Gender) + '</td><td>' + (e.Age || '—') + '</td>';
                html += '<td>' + esc(role) + '</td><td>' + esc(e.PhoneNumber || '—') + '</td>';
                html += '<td>' + statusTag(e.IsActive ? '在职' : '离职') + '</td>';
                html += '<td class="op-cell">';
                var isPeerSupervisor = (e.PermissionLevel === 2 && e.EmployeeID !== u.EmployeeID);
                if (isPeerSupervisor) {
                    // 同级主管：主管无权增删改
                    html += '<span class="text-dim" style="font-size:11px;">同级主管 · 不可操作</span>';
                } else {
                    html += '<a href="javascript:;" class="btn btn-sm" data-edit="' + e.EmployeeID + '">编辑</a>';
                    if (e.EmployeeID !== u.EmployeeID) {
                        html += '<a href="javascript:;" class="btn btn-sm btn-danger" data-del="' + e.EmployeeID + '">删除</a>';
                    }
                }
                html += '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);

        function reload() {
            if (window.__fusedRerender) window.__fusedRerender(); else showView('orgManage');
        }

        $('#deSearchBtn').off('click').on('click', function () {
            var kw = $('#deSearch').val();
            if (kw) {
                // 简单过滤：重渲染后直接应用
                window.__deFilter = kw;
                reload();
            }
        });
        $('#deResetBtn').off('click').on('click', function () {
            window.__deFilter = '';
            reload();
        });
        $('#deAdd').off('click').on('click', function () { openEmployeeModal(null, deptCode); });
        $(container).find('a[data-edit]').off('click').on('click', function () {
            var emp = HRDB.getEmployeeById($(this).data('edit'));
            // 主管无权编辑同级主管（防绕过）
            if (u.PermissionLevel === 2 && emp && emp.PermissionLevel === 2) {
                toast('主管无权编辑同级主管', 'error'); return;
            }
            openEmployeeModal(emp, deptCode);
        });
        $(container).find('a[data-del]').off('click').on('click', function () {
            var id = $(this).data('del');
            if (id === u.EmployeeID) { toast('不能删除当前登录用户', 'error'); return; }
            var target = HRDB.getEmployeeById(id);
            if (u.PermissionLevel === 2 && target && target.PermissionLevel === 2) {
                toast('主管无权删除同级主管', 'error'); return;
            }
            showModal('删除员工', '<p style="color:var(--havvk-text);line-height:1.8;">确定要删除员工 <b>' + esc(target.EmployeeName) + '</b>（' + esc(id) + '）吗？该操作不可恢复。</p>',
                '<a href="javascript:;" class="btn btn-danger" id="deDelOk">确认删除</a><a href="javascript:;" class="btn" id="deDelCancel">取消</a>');
            $('#deDelOk').off('click').on('click', function () {
                HRDB.deleteEmployee(id);
                closeModal(); toast('员工已删除', 'success');
                reload();
            });
            $('#deDelCancel').off('click').on('click', closeModal);
        });
    };

    // ---------- 员工管理（管理员） ----------
    VIEWS.employeeAdmin = function (container) {
        container = container || '#appContent';
        var list = HRDB.getEmployees(window.__eaFilter || null);
        var html = '';
        html += '<div class="panel"><div class="panel-title">员工管理</div>';
        html += '<div class="toolbar">';
        html += '<input type="text" class="search-input" id="eaSearch" placeholder="搜索姓名 / 工号"/>';
        html += '<select id="eaDept"><option value="所有部门">所有部门</option>' + HRDB.getDepartments().map(function (d) { return '<option value="' + d.DepartmentCode + '">' + esc(d.DepartmentName) + '</option>'; }).join('') + '</select>';
        html += '<select id="eaStatus"><option value="所有状态">所有状态</option><option value="在职">在职</option><option value="离职">离职</option></select>';
        html += '<a href="javascript:;" class="btn btn-sm" id="eaSearchBtn">查询</a>';
        html += '<a href="javascript:;" class="btn btn-sm" id="eaResetBtn">重置</a>';
        html += '<span class="spacer"></span>';
        html += '<a href="javascript:;" class="btn btn-sm" id="eaTemplate">📄 导入示例</a>';
        html += '<a href="javascript:;" class="btn btn-sm" id="eaImport">⬆ 表格导入</a>';
        html += '<a href="javascript:;" class="btn btn-sm btn-primary" id="eaAdd">＋ 新增员工</a>';
        html += '</div>';
        html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th><input type="checkbox" id="eaCheckAll"/></th><th>工号</th><th>姓名</th><th>部门</th><th>性别</th><th>年龄</th><th>电话</th><th>角色</th><th>状态</th><th>操作</th></tr></thead><tbody>';
        list.forEach(function (e) {
            var role = HRDB.getRoleName ? HRDB.getRoleName(e) : (PERM[e.PermissionLevel] ? PERM[e.PermissionLevel].name : '未知');
            html += '<tr>';
            html += '<td><input type="checkbox" class="ea-check" value="' + esc(e.EmployeeID) + '"/></td>';
            html += '<td>' + esc(e.EmployeeID) + '</td><td>' + esc(e.EmployeeName) + '</td>';
            html += '<td>' + esc(HRDB.getDeptName(e.Department)) + '</td>';
            html += '<td>' + esc(e.Gender) + '</td><td>' + (e.Age || '—') + '</td>';
            html += '<td>' + esc(e.PhoneNumber || '—') + '</td>';
            html += '<td>' + esc(role) + '</td>';
            html += '<td>' + statusTag(e.IsActive ? '在职' : '离职') + '</td>';
            html += '<td class="op-cell"><a href="javascript:;" class="btn btn-sm" data-msg="' + esc(e.EmployeeID) + '">消息</a><a href="javascript:;" class="btn btn-sm" data-edit="' + esc(e.EmployeeID) + '">编辑</a><a href="javascript:;" class="btn btn-sm btn-danger" data-del="' + esc(e.EmployeeID) + '">删除</a></td>';
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        html += '<div class="flex" style="margin-top:14px;gap:10px;">';
        html += '<a href="javascript:;" class="btn btn-sm" id="eaBatchOn">批量启用</a>';
        html += '<a href="javascript:;" class="btn btn-sm btn-danger" id="eaBatchOff">批量停用</a>';
        html += '<a href="javascript:;" class="btn btn-sm btn-danger" id="eaBatchDel">批量删除</a>';
        html += '</div>';
        html += '</div>';
        $(container).html(html);

        function getChecked() {
            var ids = [];
            $('.ea-check:checked').each(function () { ids.push($(this).val()); });
            return ids;
        }
        function reload() {
            if (window.__fusedRerender) window.__fusedRerender(); else showView('orgManage');
        }

        $('#eaCheckAll').off('change').on('change', function () {
            $('.ea-check').prop('checked', this.checked);
        });
        $('#eaSearchBtn').off('click').on('click', function () {
            window.__eaFilter = { keyword: $('#eaSearch').val(), department: $('#eaDept').val(), status: $('#eaStatus').val() };
            reload();
        });
        $('#eaResetBtn').off('click').on('click', function () {
            window.__eaFilter = null;
            $('#eaSearch').val(''); $('#eaDept').val('所有部门'); $('#eaStatus').val('所有状态');
            reload();
        });
        $('#eaAdd').off('click').on('click', function () { openEmployeeModal(null, 'D001'); });
        $('#eaTemplate').off('click').on('click', downloadEmployeeTemplate);
        $('#eaImport').off('click').on('click', openEmployeeImportModal);
        $(container).find('a[data-edit]').off('click').on('click', function () {
            openEmployeeModal(HRDB.getEmployeeById($(this).data('edit')), null);
        });
        $(container).find('a[data-del]').off('click').on('click', function () {
            var id = $(this).data('del');
            if (id === Session.user.EmployeeID) { toast('不能删除当前登录用户', 'error'); return; }
            var emp = HRDB.getEmployeeById(id);
            showModal('删除员工', '<p style="color:var(--havvk-text);line-height:1.8;">确定要删除员工 <b>' + esc(emp.EmployeeName) + '</b>（' + esc(id) + '）吗？</p>',
                '<a href="javascript:;" class="btn btn-danger" id="eaDelOk">确认删除</a><a href="javascript:;" class="btn" id="eaDelCancel">取消</a>');
            $('#eaDelOk').off('click').on('click', function () {
                HRDB.deleteEmployee(id);
                closeModal(); toast('员工已删除', 'success'); reload();
            });
            $('#eaDelCancel').off('click').on('click', closeModal);
        });
        $('#eaBatchOn').off('click').on('click', function () {
            var ids = getChecked();
            if (!ids.length) { toast('请先选择员工', 'error'); return; }
            HRDB.batchUpdateStatus(ids, true);
            toast('已批量启用 ' + ids.length + ' 名员工', 'success');
            reload();
        });
        $('#eaBatchOff').off('click').on('click', function () {
            var ids = getChecked();
            if (!ids.length) { toast('请先选择员工', 'error'); return; }
            HRDB.batchUpdateStatus(ids, false);
            toast('已批量停用 ' + ids.length + ' 名员工', 'success');
            reload();
        });
        $('#eaBatchDel').off('click').on('click', function () {
            var ids = getChecked();
            if (!ids.length) { toast('请先选择员工', 'error'); return; }
            if (ids.indexOf(Session.user.EmployeeID) >= 0) { toast('不能删除当前登录用户', 'error'); return; }
            // 高危操作两步复核：提交到安全中心
            var names = ids.map(function (id) { var e = HRDB.getEmployeeById(id); return e ? e.EmployeeName : id; }).join('、');
            var r = HRDB.addSecurityReview('批量删除员工', '删除 ' + ids.length + ' 名员工：' + names);
            r._ids = ids.join(',');
            // 持久化 ids（addSecurityReview 内部已 save，补存一次）
            var db2 = JSON.parse(localStorage.getItem('havvk_hr_db_v1'));
            var r2 = (db2.securityReviews || []).find(function (x) { return x.ReviewID === r.ReviewID; });
            if (r2) { r2._ids = ids.join(','); localStorage.setItem('havvk_hr_db_v1', JSON.stringify(db2)); }
            toast('已提交批量删除复核，请到安全中心确认执行', 'success');
            setTimeout(function () { showView('security'); }, 900);
        });
    };

    function openEmployeeModal(emp, defaultDept) {
        var viewer = Session.user;
        var isSupervisor = (viewer.PermissionLevel === 2);
        // 主管编辑同级主管 → 直接拒绝（防绕过）
        if (isSupervisor && emp && emp.PermissionLevel === 2) {
            toast('主管无权编辑同级主管', 'error');
            return;
        }
        var isEdit = !!emp;
        var body = '';
        body += '<div class="detail-grid" style="grid-template-columns:1fr 1fr;">';
        body += '<div class="form-group"><label>工号</label><input type="text" id="emId" value="' + (isEdit ? esc(emp.EmployeeID) : '') + '" ' + (isEdit ? 'disabled' : '') + '/></div>';
        body += '<div class="form-group"><label>姓名</label><input type="text" id="emName" value="' + (isEdit ? esc(emp.EmployeeName) : '') + '"/></div>';
        body += '<div class="form-group"><label>性别</label><select id="emGender"><option value="男"' + (isEdit && emp.Gender === '男' ? ' selected' : '') + '>男</option><option value="女"' + (isEdit && emp.Gender === '女' ? ' selected' : '') + '>女</option></select></div>';
        body += '<div class="form-group"><label>年龄</label><input type="number" id="emAge" value="' + (isEdit && emp.Age ? emp.Age : '') + '"/></div>';
        body += '<div class="form-group"><label>部门</label><select id="emDept">' + HRDB.getDepartments().map(function (d) { return '<option value="' + d.DepartmentCode + '"' + (isEdit ? (emp.Department === d.DepartmentCode ? ' selected' : '') : (defaultDept === d.DepartmentCode ? ' selected' : '')) + '>' + esc(d.DepartmentName) + '</option>'; }).join('') + '</select></div>';
        // 主管新增/编辑时：角色仅限普通员工（无权创建/调整主管）
        if (isSupervisor) {
            body += '<input type="hidden" id="emPermFixed" value="1"/>';
            body += '<div class="form-group"><label>角色权限</label><select id="emPerm" disabled><option value="1" selected>普通员工</option></select></div>';
        } else {
            body += '<div class="form-group"><label>角色权限</label><select id="emPerm"><option value="1"' + (isEdit && emp.PermissionLevel === 1 ? ' selected' : '') + '>普通员工</option><option value="2"' + (isEdit && emp.PermissionLevel === 2 ? ' selected' : '') + '>部门主管</option><option value="3"' + (isEdit && emp.PermissionLevel === 3 ? ' selected' : '') + '>管理员</option></select></div>';
        }
        body += '<div class="form-group"><label>电话</label><input type="text" id="emPhone" value="' + (isEdit ? esc(emp.PhoneNumber || '') : '') + '"/></div>';
        body += '<div class="form-group"><label>邮箱</label><input type="text" id="emEmail" value="' + (isEdit ? esc(emp.Email || '') : '') + '"/></div>';
        body += '<div class="form-group"><label>状态</label><select id="emStatus"><option value="true"' + (isEdit && emp.IsActive ? ' selected' : '') + '>在职</option><option value="false"' + (isEdit && !emp.IsActive ? ' selected' : '') + '>离职</option></select></div>';
        body += '<div class="form-group"><label>' + (isEdit ? '重置密码（留空不修改）' : '初始密码') + '</label><input type="password" id="emPwd" value=""/></div>';
        body += '</div>';
        body += '<div class="form-group"><label>备注</label><textarea id="emRemark" rows="2">' + (isEdit ? esc(emp.Remarks || '') : '') + '</textarea></div>';

        var foot = '<a href="javascript:;" class="btn btn-primary" id="emSave">保存</a><a href="javascript:;" class="btn" id="emCancel">取消</a>';
        showModal(isEdit ? '编辑员工信息' : '新增员工', body, foot);

        $('#emSave').off('click').on('click', function () {
            var id = $('#emId').val().trim();
            var name = $('#emName').val().trim();
            if (!id || !name) { toast('工号和姓名不能为空', 'error'); return; }
            if (!isEdit && !$('#emPwd').val()) { toast('新增员工时密码不能为空', 'error'); return; }
            if (!isEdit && HRDB.getEmployeeById(id)) { toast('该工号已存在', 'error'); return; }
            var data = {
                EmployeeName: name, Gender: $('#emGender').val(),
                Age: parseInt($('#emAge').val()) || 0, Department: $('#emDept').val(),
                // 主管操作：强制普通员工角色（无权创建/调整主管）
                PermissionLevel: isSupervisor ? 1 : parseInt($('#emPerm').val()),
                PhoneNumber: $('#emPhone').val().trim(), Email: $('#emEmail').val().trim(),
                IsActive: $('#emStatus').val() === 'true', Remarks: $('#emRemark').val().trim()
            };
            if (isEdit) {
                if ($('#emPwd').val()) data.Password = $('#emPwd').val();
                HRDB.updateEmployee(emp.EmployeeID, data);
                toast('员工信息更新成功', 'success');
            } else {
                data.EmployeeID = id;
                data.Password = $('#emPwd').val();
                data.CreatedAt = HRDB.fmtNow();
                HRDB.addEmployee(data);
                toast('员工添加成功', 'success');
            }
            closeModal();
            setTimeout(function () {
                if (window.__fusedRerender) window.__fusedRerender(); else showView('orgManage');
            }, 700);
        });
        $('#emCancel').off('click').on('click', closeModal);
    }

    // ---------- 员工表格导入 / 示例模板 ----------
    function downloadEmployeeTemplate() {
        var csv = '\uFEFF工号,姓名,性别,年龄,部门,角色,电话,邮箱,初始密码,状态,备注\n' +
            'E2024019,张三,男,28,技术部,普通员工,13800000019,zhangsan@havvk.com,123456,在职,示例数据一\n' +
            'E2024020,李四,女,30,行政部,部门主管,13800000020,lisi@havvk.com,123456,在职,示例数据二\n';
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = '员工导入模板.csv';
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
        toast('示例模板已下载', 'success');
    }

    // 简易 CSV 解析（支持 BOM / 引号包裹字段）
    function parseCSV(text) {
        text = String(text || '').replace(/^\uFEFF/, '');
        var rows = [], row = [], field = '', inQ = false;
        for (var i = 0; i < text.length; i++) {
            var c = text[i];
            if (inQ) {
                if (c === '"') {
                    if (text[i + 1] === '"') { field += '"'; i++; }
                    else inQ = false;
                } else field += c;
            } else {
                if (c === '"') inQ = true;
                else if (c === ',') { row.push(field); field = ''; }
                else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
                else if (c === '\r') { /* skip */ }
                else field += c;
            }
        }
        if (field.length || row.length) { row.push(field); rows.push(row); }
        return rows.filter(function (r) { return r.some(function (c) { return (c || '').trim() !== ''; }); });
    }

    // 部门名 / 代码 → DepartmentCode
    function deptNameToCode(name) {
        name = String(name || '').trim();
        var d = HRDB.getDepartments().find(function (x) { return x.DepartmentName === name || x.DepartmentCode === name; });
        return d ? d.DepartmentCode : '';
    }

    // 角色文本 → PermissionLevel（1/2/3）
    function permTextToLevel(v) {
        v = String(v || '').trim();
        if (v === '1' || v === '普通员工' || v === '员工') return 1;
        if (v === '2' || v === '部门主管' || v === '主管' || v === '经理') return 2;
        if (v === '3' || v === '管理员' || v === 'admin') return 3;
        return -1;
    }

    // 状态文本 → IsActive
    function statusTextToBool(v) {
        v = String(v || '').trim();
        return !(v === '离职' || v === 'false' || v === '0');
    }

    function openEmployeeImportModal() {
        var body = '';
        body += '<div style="color:var(--havvk-text);line-height:1.9;font-size:13px;">';
        body += '<p>支持导入 <b>.csv</b> 文件（UTF-8 编码，可用 Excel 另存为 CSV），每行一名员工，<b>表头必须</b>为：</p>';
        body += '<p class="text-dim">工号,姓名,性别,年龄,部门,角色,电话,邮箱,初始密码,状态,备注</p>';
        body += '<p class="text-dim">· 部门填名称（如：技术部）或代码（D002）<br/>· 角色：普通员工 / 部门主管 / 管理员<br/>· 状态：在职 / 离职（留空默认在职）<br/>· 初始密码留空默认 123456</p>';
        body += '<a href="javascript:;" class="btn btn-sm" id="impTpl">📄 下载示例模板</a>';
        body += '</div>';
        body += '<div class="form-group" style="margin-top:14px;"><label>选择 CSV 文件</label><input type="file" id="impFile" accept=".csv,.txt" style="font-size:13px;"/></div>';
        body += '<div id="impPreview"></div>';
        var foot = '<a href="javascript:;" class="btn btn-primary" id="impOk" style="display:none;">确认导入</a><a href="javascript:;" class="btn" id="impCancel">关闭</a>';
        showModal('批量导入员工', body, foot);

        $('#impTpl').off('click').on('click', downloadEmployeeTemplate);
        $('#impCancel').off('click').on('click', closeModal);

        $('#impFile').off('change').on('change', function () {
            var f = this.files && this.files[0];
            if (!f) return;
            var reader = new FileReader();
            reader.onload = function (ev) {
                var rows = parseCSV(String(ev.target.result));
                if (rows.length < 2) { toast('文件内容为空或无数据行', 'error'); return; }
                var header = rows[0].map(function (h) { return String(h || '').trim(); });
                var idx = {};
                header.forEach(function (h, i) { idx[h] = i; });
                var missing = ['工号', '姓名'].filter(function (k) { return !(k in idx); });
                if (missing.length) { toast('缺少表头：' + missing.join('、'), 'error'); return; }
                var cell = function (r, k) { var i = idx[k]; return i == null ? '' : String(r[i] == null ? '' : r[i]).trim(); };
                var okRows = [], errRows = [];
                for (var r = 1; r < rows.length; r++) {
                    var id = cell(rows[r], '工号'), name = cell(rows[r], '姓名');
                    if (!id || !name) { errRows.push({ line: r + 1, msg: '工号/姓名不能为空' }); continue; }
                    if (HRDB.getEmployeeById(id)) { errRows.push({ line: r + 1, msg: '工号已存在：' + id }); continue; }
                    var dept = deptNameToCode(cell(rows[r], '部门'));
                    if (!dept) { errRows.push({ line: r + 1, msg: '部门不存在：' + (cell(rows[r], '部门') || '空') }); continue; }
                    var perm = permTextToLevel(cell(rows[r], '角色'));
                    if (perm < 0) { errRows.push({ line: r + 1, msg: '角色无效：' + (cell(rows[r], '角色') || '空') }); continue; }
                    var age = parseInt(cell(rows[r], '年龄'), 10);
                    okRows.push({
                        EmployeeID: id, EmployeeName: name, Gender: cell(rows[r], '性别') || '男',
                        Age: isNaN(age) ? 0 : age, Department: dept, PermissionLevel: perm,
                        PhoneNumber: cell(rows[r], '电话'), Email: cell(rows[r], '邮箱'),
                        Password: cell(rows[r], '初始密码') || '123456',
                        IsActive: statusTextToBool(cell(rows[r], '状态')),
                        Remarks: cell(rows[r], '备注')
                    });
                }
                window.__impOk = okRows;
                var ph = '';
                if (okRows.length) {
                    ph += '<div class="table-wrap" style="margin-top:12px;max-height:180px;overflow:auto;"><table class="hr-table"><thead><tr><th>工号</th><th>姓名</th><th>部门</th><th>角色</th><th>初始密码</th></tr></thead><tbody>';
                    okRows.slice(0, 8).forEach(function (e) {
                        ph += '<tr><td>' + esc(e.EmployeeID) + '</td><td>' + esc(e.EmployeeName) + '</td><td>' + esc(HRDB.getDeptName(e.Department)) + '</td><td>' + esc(PERM[e.PermissionLevel].name) + '</td><td>' + esc(e.Password) + '</td></tr>';
                    });
                    if (okRows.length > 8) ph += '<tr><td colspan="5" class="text-dim">…共 ' + okRows.length + ' 条可导入</td></tr>';
                    ph += '</tbody></table></div>';
                }
                if (errRows.length) {
                    ph += '<div class="text-dim" style="margin-top:10px;font-size:12px;">以下 ' + errRows.length + ' 行未通过校验：' + errRows.slice(0, 6).map(function (e) { return '第' + e.line + '行（' + e.msg + '）'; }).join('；') + (errRows.length > 6 ? '…' : '') + '</div>';
                }
                ph += '<div style="margin-top:12px;font-weight:600;color:var(--havvk-primary);">校验通过 ' + okRows.length + ' 条，失败 ' + errRows.length + ' 条</div>';
                $('#impPreview').html(ph);
                $('#impOk').toggle(okRows.length > 0);
            };
            reader.readAsText(f, 'utf-8');
        });

        $('#impOk').off('click').on('click', function () {
            var rows = window.__impOk || [];
            if (!rows.length) return;
            rows.forEach(function (e) { HRDB.addEmployee(e); });
            closeModal();
            toast('成功导入 ' + rows.length + ' 名员工', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('orgManage'); }, 700);
        });
    }

    // ---------- 部门管理（管理员） ----------
    VIEWS.departmentAdmin = function (container) {
        container = container || '#appContent';
        var list = HRDB.getDepartments();
        var html = '';
        html += '<div class="panel"><div class="panel-title">部门管理</div>';
        html += '<div class="toolbar"><a href="javascript:;" class="btn btn-primary" id="dpAdd">＋ 新增部门</a><span class="spacer"></span></div>';
        html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>部门代码</th><th>部门名称</th><th>负责人</th><th>在职人数</th><th>状态</th><th>操作</th></tr></thead><tbody>';
        list.forEach(function (d) {
            html += '<tr>';
            html += '<td>' + esc(d.DepartmentCode) + '</td><td>' + esc(d.DepartmentName) + '</td>';
            html += '<td>' + esc(d.ManagerName || '未指定') + '</td>';
            html += '<td>' + d.EmployeeCount + ' 人</td>';
            html += '<td>' + statusTag(d.IsActive ? '启用' : '禁用') + '</td>';
            html += '<td class="op-cell"><a href="javascript:;" class="btn btn-sm" data-edit="' + d.DepartmentID + '">编辑</a><a href="javascript:;" class="btn btn-sm btn-danger" data-del="' + d.DepartmentID + '">删除</a></td>';
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        html += '</div>';
        $(container).html(html);

        $('#dpAdd').off('click').on('click', function () { openDeptModal(null); });
        $(container).find('a[data-edit]').off('click').on('click', function () {
            var id = parseInt($(this).data('edit'));
            var dept = HRDB.getDepartments().find(function (d) { return d.DepartmentID === id; });
            openDeptModal(dept);
        });
        $(container).find('a[data-del]').off('click').on('click', function () {
            var id = parseInt($(this).data('del'));
            var dept = HRDB.getDepartments().find(function (d) { return d.DepartmentID === id; });
            var r = HRDB.deleteDepartment(id);
            if (!r.ok) { toast(r.msg, 'error'); return; }
            toast('部门 "' + dept.DepartmentName + '" 已删除', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('orgManage'); }, 700);
        });
    };

    function openDeptModal(dept) {
        var isEdit = !!dept;
        var mgrOptions = '<option value="">未指定</option>';
        HRDB.getEmployees({}).filter(function (e) { return e.IsActive && (e.PermissionLevel === 2 || e.PermissionLevel === 3); }).forEach(function (e) {
            mgrOptions += '<option value="' + e.EmployeeID + '"' + (isEdit && dept.ManagerID === e.EmployeeID ? ' selected' : '') + '>' + esc(e.EmployeeName + ' (' + e.EmployeeID + ')') + '</option>';
        });
        var body = '';
        body += '<div class="form-group"><label>部门代码</label><input type="text" id="dpCode" value="' + (isEdit ? esc(dept.DepartmentCode) : '') + '" ' + (isEdit ? 'disabled' : '') + ' placeholder="如 D006"/></div>';
        body += '<div class="form-group"><label>部门名称</label><input type="text" id="dpName" value="' + (isEdit ? esc(dept.DepartmentName) : '') + '"/></div>';
        body += '<div class="form-group"><label>部门负责人</label><select id="dpMgr">' + mgrOptions + '</select></div>';
        var foot = '<a href="javascript:;" class="btn btn-primary" id="dpSave">保存</a><a href="javascript:;" class="btn" id="dpCancel">取消</a>';
        showModal(isEdit ? '编辑部门' : '新增部门', body, foot);

        $('#dpSave').off('click').on('click', function () {
            var code = $('#dpCode').val().trim();
            var name = $('#dpName').val().trim();
            var mgr = $('#dpMgr').val();
            if (!code || !name) { toast('部门代码和名称不能为空', 'error'); return; }
            var all = HRDB.getDepartments();
            if (!isEdit && all.find(function (d) { return d.DepartmentCode === code; })) { toast('部门代码已存在', 'error'); return; }
            if (!isEdit && all.find(function (d) { return d.DepartmentName === name; })) { toast('部门名称已存在', 'error'); return; }
            if (isEdit) {
                HRDB.updateDepartment(dept.DepartmentID, { DepartmentCode: code, DepartmentName: name, ManagerID: mgr });
                toast('部门信息更新成功', 'success');
            } else {
                HRDB.addDepartment({ DepartmentCode: code, DepartmentName: name, ManagerID: mgr });
                toast('部门添加成功', 'success');
            }
            closeModal();
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('orgManage'); }, 700);
        });
        $('#dpCancel').off('click').on('click', closeModal);
    }

    // ===================== V12 扩展功能 =====================
    function fmtDateStr(d) {
        var m = (d.getMonth() + 1); var day = d.getDate();
        return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
    }
    function monthRange(offset) {
        var now = new Date();
        var y = now.getFullYear(); var m = now.getMonth() + 1 + offset;
        if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
        var days = new Date(y, m, 0).getDate();
        return { y: y, m: m, days: days, label: y + '-' + (m < 10 ? '0' + m : m) };
    }
    function csvDownload(filename, rows) {
        var csv = '\ufeff' + rows.map(function (r) {
            return r.map(function (c) {
                c = String(c == null ? '' : c);
                return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
            }).join(',');
        }).join('\r\n');
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
    }
    function barHtml(pct, color) {
        return '<div class="bar-track"><div class="bar-fill" style="width:' + Math.min(100, Math.max(0, pct)) + '%;' + (color ? 'background:' + color + ';' : '') + '"></div></div>';
    }
    function alertTag(lv) {
        var map = { '红': 'tag-red', '橙': 'tag-gold', '黄': 'tag-blue', '蓝': 'tag-gray' };
        return '<span class="tag ' + (map[lv] || 'tag-gray') + '">' + esc(lv) + '色警报</span>';
    }
    function skillLevelTag(lv) {
        var stars = '';
        for (var i = 0; i < 5; i++) stars += (i < lv ? '★' : '☆');
        return '<span style="color:#e8a33d;letter-spacing:1px;" title="掌握度 ' + lv + '/5">' + stars + '</span>';
    }

    // ---------- 数据看板（管理员，纯前端图表） ----------
    VIEWS.stats = function (container) {
        container = container || '#appContent';
        var emps = HRDB.getEmployees();
        var depts = HRDB.getDepartments();
        var today = HRDB.today();
        var html = '';
        // 概览卡片
        var onJob = emps.filter(function (e) { return e.IsActive; }).length;
        var attAll = HRDB.getAttendance();
        var todayClock = attAll.filter(function (a) { return a.AttendanceDate === today && a.CheckType === '上班'; }).length;
        html += '<div class="panel"><div class="panel-title">集团数据概览</div><div class="stat-grid">';
        html += '<div class="stat-card"><div class="stat-num">' + emps.length + '</div><div class="stat-label">员工总数</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + onJob + '</div><div class="stat-label">在职人数</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + todayClock + '</div><div class="stat-label">今日打卡</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + HRDB.getMeetings().length + '</div><div class="stat-label">会议总数</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + HRDB.getAssets().length + '</div><div class="stat-label">固定资产</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + HRDB.getKnowledge().length + '</div><div class="stat-label">知识条目</div></div>';
        html += '</div></div>';
        // 部门人数分布
        var deptCount = {};
        var deptNames = {};
        emps.forEach(function (e) {
            if (!e.IsActive) return;
            deptCount[e.Department] = (deptCount[e.Department] || 0) + 1;
            deptNames[e.Department] = HRDB.getDeptName(e.Department);
        });
        var maxDept = Math.max.apply(null, Object.keys(deptCount).map(function (k) { return deptCount[k]; }).concat([1]));
        var deptHtml = '';
        Object.keys(deptCount).forEach(function (k) {
            deptHtml += '<div class="chart-row"><div class="chart-label">' + esc(deptNames[k] || k) + '</div><div class="chart-main">' + barHtml(deptCount[k] / maxDept * 100, '#2362af') + '</div><div class="chart-val">' + deptCount[k] + ' 人</div></div>';
        });
        html += '<div class="panel"><div class="panel-title">部门人数分布</div><div class="chart-list">' + (deptHtml || '<div class="empty-state">暂无数据</div>') + '</div></div>';
        // 近 7 天打卡趋势
        var trend = [];
        for (var i = 6; i >= 0; i--) {
            var d = new Date(); d.setDate(d.getDate() - i);
            var ds = fmtDateStr(d);
            var cnt = attAll.filter(function (a) { return a.AttendanceDate === ds && a.CheckType === '上班'; }).length;
            trend.push({ label: (d.getMonth() + 1) + '/' + d.getDate(), count: cnt });
        }
        var maxTrend = Math.max.apply(null, trend.map(function (t) { return t.count; }).concat([1]));
        var trendHtml = '<div class="trend-bars">';
        trend.forEach(function (t) {
            trendHtml += '<div class="trend-col"><div class="trend-bar"><div class="trend-fill" style="height:' + (t.count / maxTrend * 100) + '%;"></div></div><div class="trend-num">' + t.count + '</div><div class="trend-label">' + t.label + '</div></div>';
        });
        trendHtml += '</div>';
        html += '<div class="panel"><div class="panel-title">近 7 天打卡趋势</div>' + trendHtml + '</div>';
        // 请假类型占比
        var leaves = HRDB.getLeaves();
        var typeCount = {};
        leaves.forEach(function (l) { typeCount[l.LeaveType] = (typeCount[l.LeaveType] || 0) + 1; });
        var maxType = Math.max.apply(null, Object.keys(typeCount).map(function (k) { return typeCount[k]; }).concat([1]));
        var typeHtml = '';
        var colors = ['#2362af', '#e8a33d', '#5bbf6a', '#c04a4a', '#8a6fc9', '#4aa3c4'];
        var ci = 0;
        Object.keys(typeCount).forEach(function (k) {
            typeHtml += '<div class="chart-row"><div class="chart-label">' + esc(k) + '</div><div class="chart-main">' + barHtml(typeCount[k] / maxType * 100, colors[ci % colors.length]) + '</div><div class="chart-val">' + typeCount[k] + ' 次</div></div>';
            ci++;
        });
        html += '<div class="panel"><div class="panel-title">请假类型统计</div><div class="chart-list">' + (typeHtml || '<div class="empty-state">暂无请假数据</div>') + '</div></div>';
        // 绩效排行 TOP5
        var scores = {};
        HRDB.getReviews().forEach(function (r) {
            if (r.PerformanceScore > (scores[r.EmployeeID] || 0)) scores[r.EmployeeID] = r.PerformanceScore;
        });
        var rankRows = Object.keys(scores).map(function (id) {
            var e = HRDB.getEmployeeById(id);
            return { name: e ? e.EmployeeName : id, score: scores[id] };
        }).sort(function (a, b) { return b.score - a.score; }).slice(0, 5);
        var scoreHtml = '';
        if (rankRows.length) {
            var maxScore = rankRows[0].score || 1;
            rankRows.forEach(function (r, i) {
                scoreHtml += '<div class="chart-row"><div class="chart-label">' + (i + 1) + '. ' + esc(r.name) + '</div><div class="chart-main">' + barHtml(r.score / maxScore * 100, '#5bbf6a') + '</div><div class="chart-val">' + r.score + ' 分</div></div>';
            });
        }
        html += '<div class="panel"><div class="panel-title">绩效排行 TOP5</div><div class="chart-list">' + (scoreHtml || '<div class="empty-state">暂无绩效数据</div>') + '</div></div>';
        // 培训完成率
        var enrolls = HRDB.getTrainingEnrolls ? HRDB.getTrainingEnrolls() : [];
        var empDept = {};
        HRDB.getEmployees().forEach(function (e) { if (e.IsActive) empDept[e.EmployeeID] = e.Department; });
        var trainDone = enrolls.filter(function (e) { return e.Completed; }).length;
        var trainAll = enrolls.length;
        var trainRate = trainAll ? Math.round(trainDone / trainAll * 100) : 0;
        var deptEnrolls = {};
        HRDB.getEmployees().forEach(function (e) {
            if (!e.IsActive) return;
            deptEnrolls[e.Department] = { done: 0, all: 0 };
        });
        enrolls.forEach(function (e) {
            var dept = empDept[e.EmployeeID];
            if (!dept || !deptEnrolls[dept]) return;
            deptEnrolls[dept].all++;
            if (e.Completed) deptEnrolls[dept].done++;
        });
        var trainHtml = '<div class="chart-row"><div class="chart-label">集团整体</div><div class="chart-main">' + barHtml(trainRate, '#3f8ae0') + '</div><div class="chart-val">' + trainDone + '/' + trainAll + ' (' + trainRate + '%)</div></div>';
        Object.keys(deptEnrolls).forEach(function (k) {
            var d = deptEnrolls[k];
            if (!d.all) return;
            var rate = Math.round(d.done / d.all * 100);
            trainHtml += '<div class="chart-row"><div class="chart-label">' + esc(HRDB.getDeptName(k)) + '</div><div class="chart-main">' + barHtml(rate, '#5bbf6a') + '</div><div class="chart-val">' + d.done + '/' + d.all + ' (' + rate + '%)</div></div>';
        });
        html += '<div class="panel"><div class="panel-title">培训完成率</div><div class="chart-list">' + trainHtml + '</div></div>';
        $(container).html(html);
    };

    // ---------- 我的薪资（员工/主管查看本人） ----------
    VIEWS.salary = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var list = HRDB.getSalaries({ employeeId: u.EmployeeID });
        var html = '';
        html += '<div class="panel"><div class="panel-title">我的薪资明细</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">仅本人与管理员可见，薪资信息请勿外传。</div>';
        if (!list.length) {
            html += '<div class="empty-state"><div class="empty-ico">¥</div>暂无薪资记录，请联系管理员录入</div>';
        } else {
            var total = list.reduce(function (s, x) { return s + (x.Base + x.Performance + x.Allowance - x.Deduction); }, 0);
            html += '<div class="detail-grid" style="margin-bottom:14px;">';
            html += '<div class="detail-item"><div class="d-label">记录条数</div><div class="d-value highlight">' + list.length + ' 期</div></div>';
            html += '<div class="detail-item"><div class="d-label">累计实发</div><div class="d-value highlight">¥' + total.toFixed(2) + '</div></div>';
            html += '<div class="detail-item"><div class="d-label">最近月份</div><div class="d-value">' + esc(list[0].Month) + '</div></div>';
            html += '</div>';
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>月份</th><th>基本工资</th><th>绩效奖金</th><th>补贴</th><th>扣款</th><th>实发</th><th>备注</th></tr></thead><tbody>';
            list.forEach(function (s) {
                var net = s.Base + s.Performance + s.Allowance - s.Deduction;
                html += '<tr><td>' + esc(s.Month) + '</td><td>¥' + s.Base.toFixed(2) + '</td><td>¥' + s.Performance.toFixed(2) + '</td><td>¥' + s.Allowance.toFixed(2) + '</td><td style="color:#c04a4a;">¥' + s.Deduction.toFixed(2) + '</td><td style="color:#2362af;font-weight:700;">¥' + net.toFixed(2) + '</td><td style="max-width:160px;">' + esc(s.Note || '—') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        // 工资趋势（实发金额折线，离线 SVG）
        if (list.length >= 2) {
            var trend = list.slice().sort(function (a, b) { return (a.Month || '').localeCompare(b.Month || ''); });
            var nets = trend.map(function (s) { return s.Base + s.Performance + s.Allowance - s.Deduction; });
            var maxN = Math.max.apply(null, nets);
            var minN = Math.min.apply(null, nets);
            var W = 720, H = 200, padL = 70, padR = 20, padT = 24, padB = 40;
            var span = Math.max(maxN - minN, 1);
            var px = function (i) { return padL + i * (W - padL - padR) / (nets.length - 1); };
            var py = function (n) { return padT + (H - padT - padB) * (1 - (n - minN) / span); };
            var pts = nets.map(function (n, i) { return px(i) + ',' + py(n); });
            var gridY = [];
            for (var g = 0; g <= 4; g++) {
                var v = minN + span * g / 4;
                gridY.push('<line x1="' + padL + '" y1="' + py(v) + '" x2="' + (W - padR) + '" y2="' + py(v) + '" stroke="#e3ebf5" stroke-width="1"/>' +
                    '<text x="' + (padL - 8) + '" y="' + (py(v) + 4) + '" text-anchor="end" font-size="10" fill="#7c8aa0">¥' + Math.round(v) + '</text>');
            }
            var labels = trend.map(function (s, i) {
                return '<text x="' + px(i) + '" y="' + (H - 14) + '" text-anchor="middle" font-size="10" fill="#7c8aa0">' + esc(s.Month) + '</text>';
            });
            var dots = nets.map(function (n, i) {
                return '<circle cx="' + px(i) + '" cy="' + py(n) + '" r="3.5" fill="#2362af" stroke="#fff" stroke-width="1.5"><title>¥' + n.toFixed(2) + '</title></circle>';
            });
            html += '<div class="panel"><div class="panel-title">工资趋势（实发）</div>';
            html += '<div class="chart-scroll"><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;">' + gridY.join('') + '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#2362af" stroke-width="2"/>' + dots.join('') + labels.join('') + '</svg></div></div>';
        }
        html += '</div>';
        $(container).html(html);
    };

    // ---------- 薪资管理（管理员） ----------
    VIEWS.salaryAdmin = function (container) {
        container = container || '#appContent';
        var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive; });
        var html = '';
        html += '<div class="panel"><div class="panel-title">录入薪资</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">员工</div><div><select id="saEmp">' + emps.map(function (e) { return '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '（' + e.EmployeeID + '）</option>'; }).join('') + '</select></div></div>';
        html += '<div class="detail-item"><div class="d-label">月份</div><div><input type="month" id="saMonth"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">基本工资</div><div><input type="number" id="saBase" placeholder="0.00" min="0" step="0.01"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">绩效奖金</div><div><input type="number" id="saPerf" placeholder="0.00" min="0" step="0.01"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">补贴</div><div><input type="number" id="saAllow" placeholder="0.00" min="0" step="0.01"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">扣款（社保/个税）</div><div><input type="number" id="saDeduct" placeholder="0.00" min="0" step="0.01"/></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">备注</div><div><input type="text" id="saNote" placeholder="选填" maxlength="80"/></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="saSubmit">保存薪资</a></div>';
        html += '</div>';
        // 全部薪资列表
        var list = HRDB.getSalaries();
        html += '<div class="panel"><div class="panel-title">全部薪资记录（' + list.length + '）</div>';
        if (!list.length) {
            html += '<div class="empty-state"><div class="empty-ico">¥</div>暂无薪资记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>员工</th><th>月份</th><th>基本</th><th>绩效</th><th>补贴</th><th>扣款</th><th>实发</th><th class="op-cell">操作</th></tr></thead><tbody>';
            list.forEach(function (s) {
                var e = HRDB.getEmployeeById(s.EmployeeID);
                var net = s.Base + s.Performance + s.Allowance - s.Deduction;
                html += '<tr><td>' + esc(e ? e.EmployeeName : s.EmployeeID) + '</td><td>' + esc(s.Month) + '</td><td>¥' + s.Base.toFixed(2) + '</td><td>¥' + s.Performance.toFixed(2) + '</td><td>¥' + s.Allowance.toFixed(2) + '</td><td>¥' + s.Deduction.toFixed(2) + '</td><td style="color:#2362af;font-weight:700;">¥' + net.toFixed(2) + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-danger" data-sdel="' + s.SalaryID + '">删除</a></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);
        $('#saSubmit').off('click').on('click', function () {
            var empId = $('#saEmp').val();
            var month = $('#saMonth').val();
            var base = parseFloat($('#saBase').val());
            if (!empId || !month || isNaN(base) || base < 0) { toast('请选择员工、月份并填写有效基本工资', 'error'); return; }
            var dup = list.some(function (s) { return s.EmployeeID === empId && s.Month === month; });
            if (dup) { toast('该员工该月份已有薪资记录，请勿重复录入', 'error'); return; }
            HRDB.addSalary({
                EmployeeID: empId,
                Month: month,
                Base: base,
                Performance: parseFloat($('#saPerf').val()) || 0,
                Allowance: parseFloat($('#saAllow').val()) || 0,
                Deduction: parseFloat($('#saDeduct').val()) || 0,
                Note: $('#saNote').val().trim()
            });
            toast('薪资已保存', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('salaryCenter'); }, 800);
        });
        $(container).find('a[data-sdel]').off('click').on('click', function () {
            var id = parseInt($(this).data('sdel'));
            showModal('删除薪资记录', '<p style="color:var(--havvk-text);">确定删除该薪资记录吗？删除后员工将无法查看。</p>',
                '<a href="javascript:;" class="btn btn-danger" id="sdelOk">确认删除</a><a href="javascript:;" class="btn" id="sdelCancel">取消</a>');
            $('#sdelOk').off('click').on('click', function () {
                HRDB.deleteSalary(id); closeModal(); toast('已删除', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('salaryCenter'); }, 800);
            });
            $('#sdelCancel').off('click').on('click', closeModal);
        });
    };

    // ---------- 会议管理（全员：发起 / 参与） ----------
    VIEWS.meeting = function () {
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive; });
        var depts = HRDB.getDepartments();
        var html = '';
        html += '<div class="panel"><div class="panel-title">发起会议</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item wide"><div class="d-label">会议主题</div><div><input type="text" id="mtTitle" placeholder="如：Q4 战略部署会" maxlength="80"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">会议室</div><div><select id="mtRoom">' + ['曼德尔会议室', '零号大坝会议室', '第三会议室', '线上会议'].map(function (r) { return '<option>' + r + '</option>'; }).join('') + '</select></div></div>';
        html += '<div class="detail-item"><div class="d-label">开始时间</div><div><input type="datetime-local" id="mtStart"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">结束时间</div><div><input type="datetime-local" id="mtEnd"/></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">参会人员（可多选）</div><div id="mtEmps" class="chk-wrap">' + emps.map(function (e) { return '<label class="chk-item"><input type="checkbox" value="' + e.EmployeeID + '"/>' + esc(e.EmployeeName) + '</label>'; }).join('') + '</div></div>';
        html += '<div class="detail-item wide"><div class="d-label">议程摘要</div><div><textarea id="mtSummary" rows="2" placeholder="选填"></textarea></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="mtSubmit">创建会议</a></div>';
        html += '</div>';
        // 我的会议（我组织 / 我参与）
        var myList = HRDB.getMeetings({ employeeId: u.EmployeeID });
        html += '<div class="panel"><div class="panel-title">我的会议（' + myList.length + '）</div>';
        if (!myList.length) {
            html += '<div class="empty-state"><div class="empty-ico">▣</div>暂无会议</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>主题</th><th>会议室</th><th>时间</th><th>组织者</th><th>参会</th><th class="op-cell">操作</th></tr></thead><tbody>';
            myList.forEach(function (m) {
                var mine = (m.OrganizerID === u.EmployeeID);
                html += '<tr><td style="max-width:200px;">' + esc(m.Title) + '</td><td>' + esc(m.Room) + '</td><td>' + esc(m.Start) + '<br/><span class="text-dim" style="font-size:11px;">至 ' + esc(m.End) + '</span></td><td>' + esc(m.OrganizerName) + '</td><td>' + (m.Participants || []).length + ' 人</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-primary" data-mview="' + m.MeetingID + '">详情</a>' + ((mine || isAdmin) ? '<a href="javascript:;" class="btn btn-sm btn-danger" data-mdel="' + m.MeetingID + '">取消</a>' : '') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $('#appContent').html(html);
        $('#mtSubmit').off('click').on('click', function () {
            var title = $('#mtTitle').val().trim();
            var start = $('#mtStart').val();
            var end = $('#mtEnd').val();
            if (!title || !start || !end) { toast('请填写会议主题与起止时间', 'error'); return; }
            if (start >= end) { toast('结束时间需晚于开始时间', 'error'); return; }
            // 会议室冲突检查（统一时间格式：T → 空格）
            var room = $('#mtRoom').val();
            var ns = start.replace('T', ' ');
            var ne = end.replace('T', ' ');
            var clash = HRDB.getMeetings().filter(function (m) {
                return m.Room === room && !(ne <= String(m.Start).replace('T', ' ') || ns >= String(m.End).replace('T', ' '));
            });
            if (clash.length) {
                toast('该时段会议室与「' + clash[0].Title + '」冲突', 'error'); return;
            }
            var ps = [];
            $('#mtEmps input:checked').each(function () { ps.push($(this).val()); });
            if (!ps.length) { toast('请至少选择一位参会人员', 'error'); return; }
            HRDB.addMeeting({
                Title: title, Room: room, Start: start.replace('T', ' '), End: end.replace('T', ' '),
                OrganizerID: u.EmployeeID, OrganizerName: u.EmployeeName,
                Participants: ps, Summary: $('#mtSummary').val().trim()
            });
            toast('会议已创建并通知参会人', 'success');
            setTimeout(function () { showView('meeting'); }, 800);
        });
        $('#appContent a[data-mview]').off('click').on('click', function () {
            var m = HRDB.getMeetings().find(function (x) { return x.MeetingID === parseInt($(this).data('mview')); });
            if (!m) return;
            var names = (m.Participants || []).map(function (id) { var e = HRDB.getEmployeeById(id); return e ? e.EmployeeName : id; });
            showModal('会议详情', '<p style="line-height:1.9;">' +
                '<b>' + esc(m.Title) + '</b><br/>会议室：' + esc(m.Room) + '<br/>时间：' + esc(m.Start) + ' ~ ' + esc(m.End) + '<br/>组织者：' + esc(m.OrganizerName) + '<br/>参会人：' + esc(names.join('、') || '—') + '<br/>议程：' + esc(m.Summary || '—') + '</p>',
                '<a href="javascript:;" class="btn" id="mClose">关闭</a>');
            $('#mClose').off('click').on('click', closeModal);
        });
        $('#appContent a[data-mdel]').off('click').on('click', function () {
            var id = parseInt($(this).data('mdel'));
            showModal('取消会议', '<p style="color:var(--havvk-text);">确定取消该会议吗？参会人将不再看到此会议。</p>',
                '<a href="javascript:;" class="btn btn-danger" id="mdelOk">确认取消</a><a href="javascript:;" class="btn" id="mdelCancel">关闭</a>');
            $('#mdelOk').off('click').on('click', function () {
                HRDB.deleteMeeting(id); closeModal(); toast('会议已取消', 'success');
                setTimeout(function () { showView('meeting'); }, 800);
            });
            $('#mdelCancel').off('click').on('click', closeModal);
        });
    };

    // ---------- 数据导出（管理员，CSV） ----------
    VIEWS.export = function (container) {
        container = container || '#appContent';
        var html = '';
        html += '<div class="panel"><div class="panel-title">数据导出</div>';
        html += '<div class="text-dim" style="margin-bottom:14px;">导出为 CSV 文件，可使用 Excel / WPS 直接打开。</div>';
        var btns = [
            { id: 'expEmployees', name: '员工信息', icon: '☷' },
            { id: 'expAttendance', name: '考勤记录', icon: '◷' },
            { id: 'expLeaves', name: '请假记录', icon: '▤' },
            { id: 'expExpenses', name: '差旅报销', icon: '¥' },
            { id: 'expSalaries', name: '薪资记录', icon: '¥' },
            { id: 'expAssets', name: '固定资产', icon: '▦' }
        ];
        html += '<div class="todo-grid">';
        btns.forEach(function (b) {
            html += '<div class="todo-card"><div class="todo-ico">' + b.icon + '</div><div class="todo-body"><div class="todo-title">' + b.name + '</div><div class="todo-count">CSV</div></div><a href="javascript:;" class="btn btn-sm btn-primary" data-exp="' + b.id + '">导出</a></div>';
        });
        html += '</div></div>';
        $(container).html(html);
        var deptName = function (d) { return HRDB.getDeptName(d); };
        $(container).find('a[data-exp]').off('click').on('click', function () {
            var k = $(this).data('exp');
            var rows = [];
            if (k === 'expEmployees') {
                rows.push(['工号', '姓名', '部门', '职位', '邮箱', '电话', '状态', '入职日期']);
                HRDB.getEmployees().forEach(function (e) {
                    rows.push([e.EmployeeID, e.EmployeeName, deptName(e.Department), e.Position || '', e.Email || '', e.Phone || '', e.IsActive ? '在职' : '离职', e.CreatedAt || '']);
                });
                csvDownload('员工信息.csv', rows);
            } else if (k === 'expAttendance') {
                rows.push(['日期', '工号', '姓名', '上班打卡', '下班打卡', '状态']);
                HRDB.getAttendance().forEach(function (a) {
                    rows.push([a.Date || a.CheckTime || '', a.EmployeeID, a.EmployeeName, a.CheckIn || a.CheckTime || '', a.CheckOut || '', a.Status || '正常']);
                });
                csvDownload('考勤记录.csv', rows);
            } else if (k === 'expLeaves') {
                rows.push(['工号', '姓名', '请假类型', '开始日期', '结束日期', '天数', '状态', '申请时间']);
                HRDB.getLeaves().forEach(function (l) {
                    rows.push([l.EmployeeID, l.EmployeeName, l.LeaveType, l.StartDate, l.EndDate, l.Days, l.Status, l.ApplyTime]);
                });
                csvDownload('请假记录.csv', rows);
            } else if (k === 'expExpenses') {
                rows.push(['工号', '姓名', '标题', '类型', '金额', '费用日期', '状态']);
                HRDB.getExpenses().forEach(function (e) {
                    rows.push([e.EmployeeID, e.EmployeeName, e.Title, e.Category, e.Amount, e.ExpenseDate, e.Status]);
                });
                csvDownload('差旅报销.csv', rows);
            } else if (k === 'expSalaries') {
                rows.push(['工号', '姓名', '月份', '基本工资', '绩效奖金', '补贴', '扣款', '实发']);
                HRDB.getSalaries().forEach(function (s) {
                    var e = HRDB.getEmployeeById(s.EmployeeID);
                    rows.push([s.EmployeeID, e ? e.EmployeeName : '', s.Month, s.Base, s.Performance, s.Allowance, s.Deduction, s.Base + s.Performance + s.Allowance - s.Deduction]);
                });
                csvDownload('薪资记录.csv', rows);
            } else if (k === 'expAssets') {
                rows.push(['资产编号', '名称', '分类', '序列号', '状态', '领用人', '部门', '备注']);
                HRDB.getAssets().forEach(function (a) {
                    rows.push([a.AssetID, a.Name, a.Category, a.SN, a.Status, a.OwnerName || '', deptName(a.Dept), a.Note || '']);
                });
                csvDownload('固定资产.csv', rows);
            }
            toast('已导出 ' + k, 'success');
        });
    };

    // ---------- 合同管理（管理员） ----------
    VIEWS.contract = function () {
        var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive; });
        var html = '';
        html += '<div class="panel"><div class="panel-title">录入劳动合同</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">员工</div><div><select id="ctEmp">' + emps.map(function (e) { return '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '（' + e.EmployeeID + '）</option>'; }).join('') + '</select></div></div>';
        html += '<div class="detail-item"><div class="d-label">合同类型</div><div><select id="ctType"><option>固定期限</option><option>无固定期限</option><option>实习协议</option><option>劳务协议</option></select></div></div>';
        html += '<div class="detail-item"><div class="d-label">生效日期</div><div><input type="date" id="ctStart"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">到期日期</div><div><input type="date" id="ctEnd"/></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="ctSubmit">保存合同</a></div>';
        html += '</div>';
        var list = HRDB.getContracts();
        // 到期提醒
        var expiring = HRDB.getExpiringContracts(30);
        if (expiring.length) {
            html += '<div class="panel" style="border-left:3px solid #e8a33d;"><div class="panel-title">⏰ 30 天内到期提醒（' + expiring.length + '）</div>';
            expiring.forEach(function (c) {
                var d = HRDB.daysUntil(c.EndDate);
                html += '<div class="ann-card"><div class="ann-head"><span class="ann-tag">' + d + ' 天后到期</span><span class="ann-title">' + esc(c.EmployeeName) + ' · ' + esc(c.Type) + '</span></div><div class="ann-meta">到期日：' + esc(c.EndDate) + ' · 请及时安排续签或终止</div></div>';
            });
            html += '</div>';
        }
        html += '<div class="panel"><div class="panel-title">全部合同（' + list.length + '）</div>';
        if (!list.length) {
            html += '<div class="empty-state"><div class="empty-ico">▤</div>暂无合同记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>员工</th><th>类型</th><th>生效</th><th>到期</th><th>剩余天数</th><th>状态</th><th class="op-cell">操作</th></tr></thead><tbody>';
            list.forEach(function (c) {
                var d = HRDB.daysUntil(c.EndDate);
                var dCls = d < 0 ? '已到期' : (d <= 30 ? d + ' 天' : d + ' 天');
                var dTag = d < 0 ? '<span class="tag tag-red">已到期</span>' : (d <= 30 ? '<span class="tag tag-gold">' + d + ' 天</span>' : '<span class="tag tag-green">' + d + ' 天</span>');
                html += '<tr><td>' + esc(c.EmployeeName) + '</td><td>' + esc(c.Type) + '</td><td>' + esc(c.StartDate) + '</td><td>' + esc(c.EndDate) + '</td><td>' + dTag + '</td><td>' + statusTag(c.Status || '履行中') + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm" data-ctedit="' + c.ContractID + '">状态</a><a href="javascript:;" class="btn btn-sm btn-danger" data-ctdel="' + c.ContractID + '">删除</a></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $('#appContent').html(html);
        $('#ctSubmit').off('click').on('click', function () {
            var empId = $('#ctEmp').val();
            var start = $('#ctStart').val();
            var end = $('#ctEnd').val();
            if (!empId || !start || !end) { toast('请完整填写合同日期', 'error'); return; }
            if (start >= end) { toast('到期日期需晚于生效日期', 'error'); return; }
            var e = HRDB.getEmployeeById(empId);
            HRDB.addContract({ EmployeeID: empId, EmployeeName: e ? e.EmployeeName : '', Type: $('#ctType').val(), StartDate: start, EndDate: end, Status: '履行中' });
            toast('合同已保存', 'success');
            setTimeout(function () { showView('contract'); }, 800);
        });
        $('#appContent a[data-ctedit]').off('click').on('click', function () {
            var id = parseInt($(this).data('ctedit'));
            var c = HRDB.getContracts().find(function (x) { return x.ContractID === id; });
            if (!c) return;
            showModal('合同状态', '<p style="color:var(--havvk-text);">更新「' + esc(c.EmployeeName) + '」的合同状态：</p><select id="ctStatus" style="width:100%;"><option>履行中</option><option>已续签</option><option>已终止</option><option>已到期</option></select>',
                '<a href="javascript:;" class="btn btn-primary" id="ctStOk">保存</a><a href="javascript:;" class="btn" id="ctStCancel">取消</a>');
            $('#ctStatus').val(c.Status || '履行中');
            $('#ctStOk').off('click').on('click', function () {
                HRDB.updateContract(id, { Status: $('#ctStatus').val() }); closeModal(); toast('已更新', 'success');
                setTimeout(function () { showView('contract'); }, 800);
            });
            $('#ctStCancel').off('click').on('click', closeModal);
        });
        $('#appContent a[data-ctdel]').off('click').on('click', function () {
            var id = parseInt($(this).data('ctdel'));
            showModal('删除合同', '<p style="color:var(--havvk-text);">确定删除该合同记录吗？</p>',
                '<a href="javascript:;" class="btn btn-danger" id="ctdelOk">确认删除</a><a href="javascript:;" class="btn" id="ctdelCancel">取消</a>');
            $('#ctdelOk').off('click').on('click', function () {
                HRDB.deleteContract(id); closeModal(); toast('已删除', 'success');
                setTimeout(function () { showView('contract'); }, 800);
            });
            $('#ctdelCancel').off('click').on('click', closeModal);
        });
    };

    // ---------- 日程日历（全员） ----------
    VIEWS.schedule = function () {
        var u = Session.user;
        var cur = monthRange(0);
        var html = '';
        html += '<div class="panel"><div class="panel-title">日程日历 <a href="javascript:;" class="btn btn-sm" id="scPrev" style="float:right;margin-left:6px;">‹ 上月</a><a href="javascript:;" class="btn btn-sm" id="scNext" style="float:right;">下月 ›</a></div>';
        // 日历网格
        var firstDow = new Date(cur.y, cur.m - 1, 1).getDay();
        var monthKey = cur.y + '-' + (cur.m < 10 ? '0' + cur.m : cur.m);
        var monthSchedules = HRDB.getSchedules({ month: monthKey }).filter(function (s) {
            if (s.Type === '集团') return true;
            if (s.Type === '个人') return s.OwnerID === u.EmployeeID;
            return s.Scope === u.Department;
        });
        var byDate = {};
        monthSchedules.forEach(function (s) { byDate[s.Date] = byDate[s.Date] || []; byDate[s.Date].push(s); });
        var today = HRDB.today();
        html += '<div class="cal-grid">';
        ['日', '一', '二', '三', '四', '五', '六'].forEach(function (w) { html += '<div class="cal-head">' + w + '</div>'; });
        for (var i = 0; i < firstDow; i++) html += '<div class="cal-cell cal-empty"></div>';
        for (var d = 1; d <= cur.days; d++) {
            var ds = monthKey + '-' + (d < 10 ? '0' + d : d);
            var items = byDate[ds] || [];
            var isToday = (ds === today);
            html += '<div class="cal-cell' + (isToday ? ' cal-today' : '') + (items.length ? ' cal-has' : '') + '" data-date="' + ds + '"><div class="cal-day">' + d + '</div>';
            items.slice(0, 2).forEach(function (s) {
                html += '<div class="cal-item" style="border-left-color:' + (s.Type === '集团' ? '#c04a4a' : s.Type === '个人' ? '#5bbf6a' : '#2362af') + ';">' + esc(s.Title) + '</div>';
            });
            if (items.length > 2) html += '<div class="cal-more">+' + (items.length - 2) + '</div>';
            html += '</div>';
        }
        html += '</div></div>';
        // 添加日程
        html += '<div class="panel"><div class="panel-title">添加日程</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">标题</div><div><input type="text" id="scTitle" placeholder="如：项目例会" maxlength="60"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">日期</div><div><input type="date" id="scDate"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">时间</div><div><input type="time" id="scTime"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">可见范围</div><div><select id="scType"><option value="个人">仅自己</option><option value="部门">本部门共享</option><option value="集团">集团（管理员）</option></select></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">备注</div><div><input type="text" id="scNote" placeholder="选填" maxlength="120"/></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="scAdd">添加日程</a></div>';
        html += '</div>';
        // 当天日程列表
        html += '<div class="panel"><div class="panel-title">今日日程</div><div id="scTodayList"></div></div>';
        $('#appContent').html(html);
        // 当天日程详情（点击日期）
        function renderToday(ds) {
            var list = HRDB.getSchedules({ date: ds }).filter(function (s) {
                if (s.Type === '集团') return true;
                if (s.Type === '个人') return s.OwnerID === u.EmployeeID;
                return s.Scope === u.Department;
            });
            if (!list.length) {
                $('#scTodayList').html('<div class="empty-state"><div class="empty-ico">▦</div>当日暂无日程</div>');
                return;
            }
            var h = '';
            list.forEach(function (s) {
                h += '<div class="ann-card"><div class="ann-head"><span class="ann-tag">' + esc(s.Time || '—') + '</span><span class="ann-title">' + esc(s.Title) + '</span></div><div class="ann-body">' + esc(s.Note || '') + '</div><div class="ann-meta">' + esc(s.Type === '个人' ? '个人' : s.Type === '集团' ? '集团' : '部门') + ' · 创建人 ' + esc(s.OwnerName) + (s.OwnerID === u.EmployeeID ? ' · <a href="javascript:;" data-scdel="' + s.ScheduleID + '" style="color:#c04a4a;">删除</a>' : '') + '</div></div>';
            });
            $('#scTodayList').html(h);
            $('#scTodayList a[data-scdel]').off('click').on('click', function () {
                HRDB.deleteSchedule(parseInt($(this).data('scdel'))); toast('已删除', 'success'); renderToday(ds);
            });
        }
        renderToday(today);
        $('#appContent .cal-cell[data-date]').off('click').on('click', function () {
            renderToday($(this).data('date'));
            $('#appContent .cal-cell').removeClass('cal-sel');
            $(this).addClass('cal-sel');
        });
        function reloadCal() { showView('schedule'); }
        $('#scPrev').off('click').on('click', reloadCal);
        $('#scNext').off('click').on('click', reloadCal);
        $('#scAdd').off('click').on('click', function () {
            var title = $('#scTitle').val().trim();
            var date = $('#scDate').val();
            var time = $('#scTime').val();
            if (!title || !date) { toast('请填写标题与日期', 'error'); return; }
            var type = $('#scType').val();
            if (type === '集团' && u.PermissionLevel !== 3) { toast('仅管理员可发布集团日程', 'error'); return; }
            HRDB.addSchedule({ Title: title, Date: date, Time: time || '—', Type: type, Scope: type === '部门' ? u.Department : type === '集团' ? 'ALL' : '', OwnerID: u.EmployeeID, OwnerName: u.EmployeeName, Note: $('#scNote').val().trim() });
            toast('日程已添加', 'success');
            setTimeout(reloadCal, 800);
        });
    };

    // ---------- 知识库（全员浏览，主管/管理员发布） ----------
    VIEWS.knowledge = function () {
        var u = Session.user;
        var canPub = (u.PermissionLevel >= 2);
        var cats = ['全部', '制度流程', '技术文档', '操作手册', '常见问题', '其他'];
        var html = '';
        html += '<div class="panel"><div class="panel-title">知识库</div>';
        html += '<div class="toolbar"><select id="kbCat" class="search-input">' + cats.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select><input type="text" id="kbKw" class="search-input" placeholder="搜索标题 / 内容"/><a href="javascript:;" class="btn btn-sm" id="kbSearch">搜索</a></div>';
        if (canPub) {
            html += '<div style="margin-top:12px;"><a href="javascript:;" class="btn btn-primary btn-sm" id="kbAdd">＋ 发布知识</a></div>';
        }
        html += '<div id="kbList" style="margin-top:12px;"></div></div>';
        $('#appContent').html(html);
        function render() {
            var cat = $('#kbCat').val();
            var kw = $('#kbKw').val().trim();
            var list = HRDB.getKnowledge({ category: cat === '全部' ? '' : cat, keyword: kw });
            if (!list.length) {
                $('#kbList').html('<div class="empty-state"><div class="empty-ico">▤</div>暂无知识条目</div>');
                return;
            }
            var h = '';
            list.forEach(function (k) {
                h += '<div class="ann-card" data-kid="' + k.KbID + '"><div class="ann-head"><span class="ann-tag">' + esc(k.Category) + '</span><span class="ann-title">' + esc(k.Title) + '</span></div>';
                h += '<div class="ann-body kb-preview">' + esc(k.Content) + '</div>';
                h += '<div class="ann-meta">作者 ' + esc(k.AuthorName) + ' · 阅读 ' + (k.Views || 0) + ' · ' + esc(k.CreateTime) + (k.AuthorID === u.EmployeeID || u.PermissionLevel === 3 ? ' · <a href="javascript:;" data-kbdel="' + k.KbID + '" style="color:#c04a4a;">删除</a>' : '') + '</div></div>';
            });
            $('#kbList').html(h);
            // 阅读计数（点击展开正文）
            $('#kbList .ann-card').off('click').on('click', function (e) {
                if ($(e.target).closest('[data-kbdel]').length) return;
                var id = parseInt($(this).data('kid'));
                HRDB.viewKnowledge(id);
                $(this).find('.kb-preview').toggleClass('kb-open');
            });
            $('#kbList a[data-kbdel]').off('click').on('click', function () {
                var id = parseInt($(this).data('kbdel'));
                showModal('删除知识', '<p style="color:var(--havvk-text);">确定删除该知识条目吗？</p>',
                    '<a href="javascript:;" class="btn btn-danger" id="kbdelOk">确认删除</a><a href="javascript:;" class="btn" id="kbdelCancel">取消</a>');
                $('#kbdelOk').off('click').on('click', function () {
                    HRDB.deleteKnowledge(id); closeModal(); toast('已删除', 'success'); render();
                });
                $('#kbdelCancel').off('click').on('click', closeModal);
            });
        }
        $('#kbSearch').off('click').on('click', render);
        $('#kbCat').off('change', render);
        render();
        if (canPub) {
            $('#kbAdd').off('click').on('click', function () {
                showModal('发布知识', '<p style="color:var(--havvk-text);">分类：<select id="kbNewCat"><option>制度流程</option><option>技术文档</option><option>操作手册</option><option>常见问题</option><option>其他</option></select></p><p><input type="text" id="kbNewTitle" placeholder="标题" style="width:100%;"/></p><p><textarea id="kbNewContent" rows="5" placeholder="正文内容" style="width:100%;"></textarea></p>',
                    '<a href="javascript:;" class="btn btn-primary" id="kbPub">发布</a><a href="javascript:;" class="btn" id="kbPubCancel">取消</a>');
                $('#kbPub').off('click').on('click', function () {
                    var t = $('#kbNewTitle').val().trim();
                    var c = $('#kbNewContent').val().trim();
                    if (!t || !c) { toast('请填写标题与内容', 'error'); return; }
                    HRDB.addKnowledge({ Title: t, Category: $('#kbNewCat').val(), Content: c, AuthorID: u.EmployeeID, AuthorName: u.EmployeeName });
                    closeModal(); toast('已发布', 'success'); setTimeout(render, 600);
                });
                $('#kbPubCancel').off('click').on('click', closeModal);
            });
        }
    };

    // ---------- 投票问卷（全员参与，全员可发起） ----------
    VIEWS.poll = function () {
        var u = Session.user;
        var html = '';
        html += '<div class="panel"><div class="panel-title">投票问卷' + (u.PermissionLevel >= 2 ? ' <a href="javascript:;" class="btn btn-sm btn-primary" id="plAdd" style="float:right;">＋ 发起投票</a>' : '') + '</div>';
        html += '<div id="plList" style="margin-top:12px;"></div></div>';
        $('#appContent').html(html);
        function render() {
            var list = HRDB.getPolls();
            if (!list.length) {
                $('#plList').html('<div class="empty-state"><div class="empty-ico">☑</div>暂无投票</div>');
                return;
            }
            var h = '';
            list.forEach(function (p) {
                var voted = (p.VotedBy || []).indexOf(u.EmployeeID) >= 0;
                var total = p.Options.reduce(function (s, o) { return s + (o.count || 0); }, 0);
                var expired = p.Expire && p.Expire < HRDB.today();
                h += '<div class="ann-card"><div class="ann-head"><span class="ann-tag">' + (expired ? '已截止' : '进行中') + '</span><span class="ann-title">' + esc(p.Title) + '</span></div><div class="ann-body">';
                p.Options.forEach(function (o, i) {
                    var pct = total ? Math.round((o.count || 0) / total * 100) : 0;
                    if (voted || expired) {
                        h += '<div class="chart-row"><div class="chart-label">' + esc(o.text) + '</div><div class="chart-main">' + barHtml(pct) + '</div><div class="chart-val">' + (o.count || 0) + ' 票 ' + pct + '%</div></div>';
                    } else {
                        h += '<a href="javascript:;" class="poll-opt" data-plvote="' + p.PollID + '" data-opt="' + i + '">' + esc(o.text) + '</a>';
                    }
                });
                h += '</div><div class="ann-meta">发起人 ' + esc(p.CreatorName) + ' · ' + total + ' 人参与 · 截止 ' + esc(p.Expire || '长期') + (u.PermissionLevel === 3 ? ' · <a href="javascript:;" data-pldel="' + p.PollID + '" style="color:#c04a4a;">删除</a>' : '') + '</div></div>';
            });
            $('#plList').html(h);
            $('#plList a[data-plvote]').off('click').on('click', function () {
                var pid = parseInt($(this).data('plvote'));
                var opt = parseInt($(this).data('opt'));
                var r = HRDB.votePoll(pid, u.EmployeeID, opt);
                if (!r.ok) { toast(r.msg, 'error'); return; }
                toast('投票成功', 'success'); render();
            });
            $('#plList a[data-pldel]').off('click').on('click', function () {
                var id = parseInt($(this).data('pldel'));
                showModal('删除投票', '<p style="color:var(--havvk-text);">确定删除该投票吗？</p>',
                    '<a href="javascript:;" class="btn btn-danger" id="pldelOk">确认删除</a><a href="javascript:;" class="btn" id="pldelCancel">取消</a>');
                $('#pldelOk').off('click').on('click', function () {
                    HRDB.deletePoll(id); closeModal(); toast('已删除', 'success'); render();
                });
                $('#pldelCancel').off('click').on('click', closeModal);
            });
        }
        render();
        $('#plAdd').off('click').on('click', function () {
            showModal('发起投票', '<p style="color:var(--havvk-text);">标题：<input type="text" id="plNewTitle" style="width:100%;"/></p><p style="color:var(--havvk-text);">选项（每行一个，最多 6 个）：<textarea id="plNewOpts" rows="4" style="width:100%;" placeholder="选项1&#10;选项2&#10;选项3"></textarea></p><p style="color:var(--havvk-text);">截止日期：<input type="date" id="plNewExp"/></p>',
                '<a href="javascript:;" class="btn btn-primary" id="plPub">发布</a><a href="javascript:;" class="btn" id="plPubCancel">取消</a>');
            $('#plPub').off('click').on('click', function () {
                var t = $('#plNewTitle').val().trim();
                var opts = $('#plNewOpts').val().split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
                if (!t || opts.length < 2) { toast('请填写标题并至少两个选项', 'error'); return; }
                if (opts.length > 6) { toast('选项最多 6 个', 'error'); return; }
                HRDB.addPoll({ Title: t, Options: opts.map(function (o) { return { text: o, count: 0 }; }), CreatorID: u.EmployeeID, CreatorName: u.EmployeeName, Expire: $('#plNewExp').val() });
                closeModal(); toast('投票已发布', 'success'); setTimeout(render, 600);
            });
            $('#plPubCancel').off('click').on('click', closeModal);
        });
    };

    // ---------- 固定资产台账（管理员） ----------
    VIEWS.asset = function () {
        var depts = HRDB.getDepartments();
        var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive; });
        var html = '';
        html += '<div class="panel"><div class="panel-title">登记资产</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">资产名称</div><div><input type="text" id="asName" placeholder="如：ThinkPad X1" maxlength="60"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">分类</div><div><select id="asCat"><option>笔记本</option><option>台式机</option><option>显示器</option><option>办公设备</option><option>通讯设备</option><option>其他</option></select></div></div>';
        html += '<div class="detail-item"><div class="d-label">序列号</div><div><input type="text" id="asSN" placeholder="SN-xxx" maxlength="40"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">状态</div><div><select id="asStatus"><option>在库</option><option>在用</option><option>维修</option><option>报废</option></select></div></div>';
        html += '<div class="detail-item"><div class="d-label">领用人</div><div><select id="asOwner"><option value="">— 无（在库）—</option>' + emps.map(function (e) { return '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '</option>'; }).join('') + '</select></div></div>';
        html += '<div class="detail-item"><div class="d-label">所属部门</div><div><select id="asDept">' + depts.map(function (d) { return '<option value="' + d.DepartmentCode + '">' + esc(d.DepartmentName) + '</option>'; }).join('') + '</select></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">备注</div><div><input type="text" id="asNote" placeholder="选填" maxlength="120"/></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="asAdd">登记资产</a></div>';
        html += '</div>';
        // 台账列表 + 筛选
        html += '<div class="panel"><div class="panel-title">固定资产台账</div>';
        html += '<div class="toolbar"><select id="asFDept" class="search-input"><option value="">全部部门</option>' + depts.map(function (d) { return '<option value="' + d.DepartmentCode + '">' + esc(d.DepartmentName) + '</option>'; }).join('') + '</select><select id="asFStatus" class="search-input"><option value="">全部状态</option><option>在库</option><option>在用</option><option>维修</option><option>报废</option></select></div>';
        html += '<div id="asList" style="margin-top:12px;"></div></div>';
        $('#appContent').html(html);
        function render() {
            var list = HRDB.getAssets({ dept: $('#asFDept').val(), status: $('#asFStatus').val() });
            if (!list.length) {
                $('#asList').html('<div class="empty-state"><div class="empty-ico">▦</div>暂无资产记录</div>');
                return;
            }
            var h = '<div class="table-wrap"><table class="hr-table"><thead><tr><th>编号</th><th>名称</th><th>分类</th><th>序列号</th><th>状态</th><th>领用人</th><th>部门</th><th class="op-cell">操作</th></tr></thead><tbody>';
            list.forEach(function (a) {
                h += '<tr><td>AS-' + a.AssetID + '</td><td>' + esc(a.Name) + '</td><td>' + esc(a.Category) + '</td><td>' + esc(a.SN || '—') + '</td><td>' + statusTag(a.Status) + '</td><td>' + esc(a.OwnerName || '—') + '</td><td>' + esc(HRDB.getDeptName(a.Dept)) + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm" data-asedit="' + a.AssetID + '">流转</a><a href="javascript:;" class="btn btn-sm btn-danger" data-asdel="' + a.AssetID + '">删除</a></td></tr>';
            });
            h += '</tbody></table></div>';
            $('#asList').html(h);
            $('#asList a[data-asedit]').off('click').on('click', function () {
                var id = parseInt($(this).data('asedit'));
                var a = HRDB.getAssets().find(function (x) { return x.AssetID === id; });
                if (!a) return;
                showModal('资产状态流转', '<p style="color:var(--havvk-text);">「' + esc(a.Name) + '」当前状态：' + esc(a.Status) + '</p><p style="color:var(--havvk-text);">状态：<select id="asNewStatus" style="width:100%;"><option>在库</option><option>在用</option><option>维修</option><option>报废</option></select></p><p style="color:var(--havvk-text);">领用人：<select id="asNewOwner" style="width:100%;"><option value="">— 无（在库）—</option>' + emps.map(function (e) { return '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '</option>'; }).join('') + '</select></p>',
                    '<a href="javascript:;" class="btn btn-primary" id="asEditOk">保存</a><a href="javascript:;" class="btn" id="asEditCancel">取消</a>');
                $('#asNewStatus').val(a.Status);
                $('#asNewOwner').val(a.OwnerID || '');
                $('#asEditOk').off('click').on('click', function () {
                    var oid = $('#asNewOwner').val();
                    var oe = oid ? HRDB.getEmployeeById(oid) : null;
                    HRDB.updateAsset(id, { Status: $('#asNewStatus').val(), OwnerID: oid || '', OwnerName: oe ? oe.EmployeeName : '' });
                    closeModal(); toast('已更新', 'success'); render();
                });
                $('#asEditCancel').off('click').on('click', closeModal);
            });
            $('#asList a[data-asdel]').off('click').on('click', function () {
                var id = parseInt($(this).data('asdel'));
                showModal('删除资产', '<p style="color:var(--havvk-text);">确定删除该资产记录吗？</p>',
                    '<a href="javascript:;" class="btn btn-danger" id="asdelOk">确认删除</a><a href="javascript:;" class="btn" id="asdelCancel">取消</a>');
                $('#asdelOk').off('click').on('click', function () {
                    HRDB.deleteAsset(id); closeModal(); toast('已删除', 'success'); render();
                });
                $('#asdelCancel').off('click').on('click', closeModal);
            });
        }
        render();
        $('#asFDept').off('change', render);
        $('#asFStatus').off('change', render);
        $('#asAdd').off('click').on('click', function () {
            var name = $('#asName').val().trim();
            var sn = $('#asSN').val().trim();
            if (!name) { toast('请填写资产名称', 'error'); return; }
            var oid = $('#asOwner').val();
            var oe = oid ? HRDB.getEmployeeById(oid) : null;
            HRDB.addAsset({ Name: name, Category: $('#asCat').val(), SN: sn, Status: $('#asStatus').val(), OwnerID: oid || '', OwnerName: oe ? oe.EmployeeName : '', Dept: $('#asDept').val(), Note: $('#asNote').val().trim() });
            toast('资产已登记', 'success');
            setTimeout(function () { showView('asset'); }, 800);
        });
    };

    // ---------- 行政申请（用车 / 用印） ----------
    VIEWS.adminRequest = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var html = '';
        html += '<div class="panel"><div class="panel-title">提交行政申请</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">申请类型</div><div><select id="arType"><option value="用车">公务用车</option><option value="用印">公章使用</option></select></div></div>';
        html += '<div class="detail-item"><div class="d-label">事由标题</div><div><input type="text" id="arTitle" placeholder="如：零号大坝现场用车" maxlength="60"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">使用日期</div><div><input type="date" id="arDate"/></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">详细说明</div><div><textarea id="arReason" rows="3" placeholder="说明用途、时间、数量等信息"></textarea></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="arSubmit">提交申请</a></div>';
        html += '</div>';
        var myList = HRDB.getAdminRequests({ applicantId: u.EmployeeID });
        html += '<div class="panel"><div class="panel-title">我的申请记录（' + myList.length + '）</div>';
        if (!myList.length) {
            html += '<div class="empty-state"><div class="empty-ico">▣</div>暂无申请记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>类型</th><th>事由</th><th>使用日期</th><th>状态</th><th>审批意见</th></tr></thead><tbody>';
            myList.forEach(function (r) {
                html += '<tr><td>' + esc(r.Type) + '</td><td style="max-width:180px;">' + esc(r.Title) + '</td><td>' + esc(r.UseDate || '—') + '</td><td>' + statusTag(r.Status) + '</td><td style="max-width:160px;">' + (r.ApproveNote ? esc(r.ApproveBy) + '：' + esc(r.ApproveNote) : '—') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);
        $('#arSubmit').off('click').on('click', function () {
            var title = $('#arTitle').val().trim();
            var reason = $('#arReason').val().trim();
            var date = $('#arDate').val();
            if (!title || !reason) { toast('请填写事由与详细说明', 'error'); return; }
            HRDB.addAdminRequest({ Type: $('#arType').val(), Title: title, Reason: reason, UseDate: date, ApplicantID: u.EmployeeID, ApplicantName: u.EmployeeName, Department: u.Department });
            toast('申请已提交，等待审批', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('logistics'); }, 800);
        });
    };

    // ---------- 行政审批（主管本部门 / 管理员全局） ----------
    VIEWS.adminReqApproval = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var pend = isAdmin ? HRDB.getAdminRequests({ status: '待审批' }) : HRDB.getAdminRequests({ department: u.Department, status: '待审批' });
        var all = isAdmin ? HRDB.getAdminRequests() : HRDB.getAdminRequests({ department: u.Department });
        var html = '';
        html += '<div class="panel"><div class="panel-title">待审批行政申请' + (isAdmin ? '（全部）' : '（本部门）') + '</div>';
        if (!pend.length) {
            html += '<div class="empty-state"><div class="empty-ico">☑</div>暂无待审批申请</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>申请人</th><th>类型</th><th>事由</th><th>使用日期</th><th class="op-cell">操作</th></tr></thead><tbody>';
            pend.forEach(function (r) {
                html += '<tr><td>' + esc(r.ApplicantName) + '</td><td>' + esc(r.Type) + '</td><td style="max-width:200px;">' + esc(r.Title) + '<br/><span class="text-dim" style="font-size:11px;">' + esc(r.Reason) + '</span></td><td>' + esc(r.UseDate || '—') + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-primary" data-arok="' + r.ReqID + '">批准</a><a href="javascript:;" class="btn btn-sm btn-danger" data-arno="' + r.ReqID + '">驳回</a></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        html += '<div class="panel"><div class="panel-title">全部记录（' + all.length + '）</div>';
        if (!all.length) {
            html += '<div class="empty-state"><div class="empty-ico">▣</div>暂无申请记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>申请人</th><th>类型</th><th>事由</th><th>状态</th><th>审批意见</th></tr></thead><tbody>';
            all.forEach(function (r) {
                html += '<tr><td>' + esc(r.ApplicantName) + '</td><td>' + esc(r.Type) + '</td><td style="max-width:180px;">' + esc(r.Title) + '</td><td>' + statusTag(r.Status) + '</td><td style="max-width:160px;">' + (r.ApproveNote ? esc(r.ApproveBy) + '：' + esc(r.ApproveNote) : '—') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);
        $(container).find('a[data-arok]').off('click').on('click', function () {
            var id = parseInt($(this).data('arok'));
            showModal('批准申请', '<p style="color:var(--havvk-text);">确定批准该申请吗？</p><textarea id="arNote" rows="2" placeholder="审批意见（选填）" style="width:100%;"></textarea>',
                '<a href="javascript:;" class="btn btn-primary" id="arOk">确认批准</a><a href="javascript:;" class="btn" id="arCancel">取消</a>');
            $('#arOk').off('click').on('click', function () {
                HRDB.approveAdminRequest(id, true, $('#arNote').val().trim() || '同意', u.EmployeeName);
                closeModal(); toast('已批准', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('approvalCenter'); }, 800);
            });
            $('#arCancel').off('click').on('click', closeModal);
        });
        $(container).find('a[data-arno]').off('click').on('click', function () {
            var id = parseInt($(this).data('arno'));
            showModal('驳回申请', '<p style="color:var(--havvk-text);">请填写驳回原因：</p><textarea id="arNote2" rows="2" placeholder="驳回原因" style="width:100%;"></textarea>',
                '<a href="javascript:;" class="btn btn-danger" id="arNoOk">确认驳回</a><a href="javascript:;" class="btn" id="arNoCancel">取消</a>');
            $('#arNoOk').off('click').on('click', function () {
                HRDB.approveAdminRequest(id, false, $('#arNote2').val().trim() || '未通过审批', u.EmployeeName);
                closeModal(); toast('已驳回', 'success');
                setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('approvalCenter'); }, 800);
            });
            $('#arNoCancel').off('click').on('click', closeModal);
        });
    };

    // ---------- 任务简报（全员浏览，员工回传行动报告） ----------
    VIEWS.skill = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var defs = HRDB.getSkillDefs();
        var levels = HRDB.getSkillLevels();
        var emps = isAdmin ? HRDB.getEmployees().filter(function (e) { return e.IsActive; }) : HRDB.getEmployees().filter(function (e) { return e.IsActive && e.Department === u.Department; });
        var html = '';
        html += '<div class="panel"><div class="panel-title">干员技能矩阵</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">维护岗位技能掌握度（★1-5），用于培训规划与人员调配。</div>';
        // 技能定义管理
        html += '<div class="toolbar"><select id="skCat" class="search-input"><option value="">全部技能</option><option value="技术">技术</option><option value="行动">行动</option><option value="行政">行政</option></select><input type="text" id="skName" class="search-input" placeholder="新技能名称" style="width:180px;"/><a href="javascript:;" class="btn btn-sm btn-primary" id="skAdd">＋ 添加技能</a></div>';
        html += '<div id="skList" style="margin-top:12px;"></div>';
        html += '</div>';
        $(container).html(html);
        function render() {
            var cat = $('#skCat').val();
            var list = defs.filter(function (d) { return !cat || d.Category === cat; });
            if (!list.length) {
                $('#skList').html('<div class="empty-state"><div class="empty-ico">★</div>暂无技能定义</div>');
                return;
            }
            var h = '<div class="table-wrap"><table class="hr-table"><thead><tr><th>技能</th><th>分类</th>' + emps.map(function (e) { return '<th>' + esc(e.EmployeeName) + '</th>'; }).join('') + '<th class="op-cell">操作</th></tr></thead><tbody>';
            list.forEach(function (d) {
                h += '<tr><td>' + esc(d.Name) + '</td><td>' + esc(d.Category) + '</td>';
                emps.forEach(function (e) {
                    var lv = (levels.find(function (x) { return x.SkillID === d.SkillID && x.EmployeeID === e.EmployeeID; }) || {}).Level || 0;
                    h += '<td><select class="sk-lv" data-skill="' + d.SkillID + '" data-emp="' + e.EmployeeID + '" style="width:76px;">';
                    for (var i = 0; i <= 5; i++) h += '<option value="' + i + '"' + (i === lv ? ' selected' : '') + '>' + (i === 0 ? '—' : '★'.repeat(i)) + '</option>';
                    h += '</select></td>';
                });
                h += '<td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-danger" data-skdel="' + d.SkillID + '">删除</a></td></tr>';
            });
            h += '</tbody></table></div>';
            $('#skList').html(h);
            $('#skList .sk-lv').off('change').on('change', function () {
                HRDB.setSkillLevel(parseInt($(this).data('skill')), $(this).data('emp'), parseInt($(this).val()));
                toast('掌握度已保存', 'success');
            });
            $('#skList a[data-skdel]').off('click').on('click', function () {
                var id = parseInt($(this).data('skdel'));
                showModal('删除技能', '<p style="color:var(--havvk-text);">确定删除该技能定义及全部掌握度记录吗？</p>',
                    '<a href="javascript:;" class="btn btn-danger" id="skdelOk">确认删除</a><a href="javascript:;" class="btn" id="skdelCancel">取消</a>');
                $('#skdelOk').off('click').on('click', function () {
                    HRDB.deleteSkillDef(id); closeModal(); toast('已删除', 'success');
                    setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('performance'); }, 700);
                });
                $('#skdelCancel').off('click').on('click', closeModal);
            });
        }
        render();
        $('#skCat').off('change', render);
        $('#skAdd').off('click').on('click', function () {
            var name = $('#skName').val().trim();
            if (!name) { toast('请输入技能名称', 'error'); return; }
            var cat = $('#skCat').val() || '技术';
            HRDB.addSkillDef({ Name: name, Category: cat, Dept: '' });
            toast('技能已添加', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('performance'); }, 700);
        });
    };

    // ---------- 演习警报（全员查看，管理员发布） ----------
    VIEWS.alert = function () {
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        // V17 公司内网：历史列表不显示演习类条目（演习通知走公告渠道）
        var list = HRDB.getAlerts().filter(function (x) { return (x.Title || '').indexOf('演习') < 0; });
        var html = '';
        if (isAdmin) {
            html += '<div class="panel"><div class="panel-title">发布演习警报</div>';
            html += '<div class="detail-grid">';
            html += '<div class="detail-item"><div class="d-label">警报等级</div><div><select id="alLevel"><option value="蓝">蓝色 · 一般</option><option value="黄">黄色 · 注意</option><option value="橙">橙色 · 警告</option><option value="红">红色 · 紧急</option></select></div></div>';
            html += '<div class="detail-item"><div class="d-label">警报标题</div><div><input type="text" id="alTitle" placeholder="如：零号大坝区域例行演习" maxlength="60"/></div></div>';
            html += '<div class="detail-item wide"><div class="d-label">警报内容</div><div><textarea id="alContent" rows="3" placeholder="演练安排、注意事项等"></textarea></div></div>';
            html += '</div>';
            html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="alAdd">发布警报</a></div>';
            html += '</div>';
        }
        html += '<div class="panel"><div class="panel-title">警报历史（' + list.length + '）</div>';
        if (!list.length) {
            html += '<div class="empty-state"><div class="empty-ico">◉</div>暂无警报记录</div>';
        } else {
            list.forEach(function (a) {
                html += '<div class="ann-card" style="border-left-color:' + (a.Level === '红' ? '#c04a4a' : a.Level === '橙' ? '#e8743b' : a.Level === '黄' ? '#e8a33d' : '#4aa3c4') + ';"><div class="ann-head"><span>' + alertTag(a.Level) + '</span><span class="ann-title">' + esc(a.Title) + '</span></div>';
                html += '<div class="ann-body">' + esc(a.Content) + '</div>';
                html += '<div class="ann-meta">发布人 ' + esc(a.CreatorName) + ' · ' + esc(a.CreateTime) + (isAdmin ? ' · <a href="javascript:;" data-aldel="' + a.AlertID + '" style="color:#c04a4a;">删除</a>' : '') + '</div></div>';
            });
        }
        html += '</div>';
        $('#appContent').html(html);
        if (isAdmin) {
            $('#alAdd').off('click').on('click', function () {
                var title = $('#alTitle').val().trim();
                var content = $('#alContent').val().trim();
                if (!title || !content) { toast('请填写警报标题与内容', 'error'); return; }
                HRDB.addAlert({ Title: title, Level: $('#alLevel').val(), Content: content, CreatorID: u.EmployeeID, CreatorName: u.EmployeeName });
                toast('警报已发布', 'success');
                renderAlertBanner(); // 发布后即时刷新顶部横幅
                setTimeout(function () { showView('alert'); }, 800);
            });
            $('#appContent a[data-aldel]').off('click').on('click', function () {
                var id = parseInt($(this).data('aldel'));
                showModal('删除警报', '<p style="color:var(--havvk-text);">确定删除该警报记录吗？</p>',
                    '<a href="javascript:;" class="btn btn-danger" id="aldelOk">确认删除</a><a href="javascript:;" class="btn" id="aldelCancel">取消</a>');
                $('#aldelOk').off('click').on('click', function () {
                    HRDB.deleteAlert(id); closeModal(); toast('已删除', 'success');
                    setTimeout(function () { showView('alert'); }, 800);
                });
                $('#aldelCancel').off('click').on('click', closeModal);
            });
        }
    };

    // ===================== V13 扩展功能 =====================
    // ---------- 全局搜索（跨表检索） ----------
    VIEWS.globalSearch = function () {
        var u = Session.user;
        var html = '';
        html += '<div class="panel"><div class="panel-title">全局搜索</div>';
        html += '<div class="toolbar"><input type="text" id="gsKw" class="search-input" placeholder="搜索员工 / 公告 / 知识库 / 文件 / 日程 / 警报…" style="flex:1;"/><a href="javascript:;" class="btn btn-primary" id="gsBtn">搜索</a></div>';
        html += '<div id="gsResult" style="margin-top:14px;"></div></div>';
        $('#appContent').html(html);
        function render() {
            var kw = $('#gsKw').val().trim().toLowerCase();
            if (!kw) { $('#gsResult').html('<div class="empty-state"><div class="empty-ico">⌕</div>输入关键词开始搜索</div>'); return; }
            var hits = [];
            HRDB.getEmployees().filter(function (e) { return e.IsActive && (e.EmployeeName.toLowerCase().indexOf(kw) >= 0 || (e.EmployeeID || '').toLowerCase().indexOf(kw) >= 0); }).slice(0, 8).forEach(function (e) {
                hits.push({ group: '员工', title: e.EmployeeName + '（' + e.EmployeeID + '）', desc: HRDB.getDeptName(e.Department) + ' · ' + (e.Position || '') + ' · ' + PERM[e.PermissionLevel].name, goto: u.PermissionLevel === 3 ? 'orgManage' : 'directory' });
            });
            var annScope = (u.PermissionLevel === 3) ? 'all' : u.Department;
            HRDB.getAnnouncements({ scope: annScope }).filter(function (a) { return (a.Title + a.Content).toLowerCase().indexOf(kw) >= 0; }).slice(0, 5).forEach(function (a) {
                hits.push({ group: '集团公告', title: a.Title, desc: (a.Content || '').slice(0, 60), goto: 'groupNews' });
            });
            HRDB.getKnowledge({ keyword: kw }).slice(0, 5).forEach(function (k) {
                hits.push({ group: '知识库', title: k.Title, desc: '[' + k.Category + '] ' + (k.Content || '').slice(0, 50), goto: 'knowledge' });
            });
            var files = (u.PermissionLevel === 3) ? HRDB.getFileVault({ scope: '个人' }).concat(HRDB.getFileVault({ scope: '部门' })) : HRDB.getFileVault({ ownerId: u.EmployeeID, scope: '个人' }).concat(HRDB.getFileVault({ scope: '部门', department: u.Department }));
            files.filter(function (f) { return (f.Name || '').toLowerCase().indexOf(kw) >= 0; }).slice(0, 5).forEach(function (f) {
                hits.push({ group: '文件柜', title: f.Name, desc: fmtSize(f.Size) + ' · ' + (f.Scope === '个人' ? '个人文件' : '部门共享'), goto: 'fileVault' });
            });
            HRDB.getSchedules().filter(function (s) { return (s.Title + (s.Note || '')).toLowerCase().indexOf(kw) >= 0; }).slice(0, 5).forEach(function (s) {
                hits.push({ group: '日程', title: s.Title, desc: s.Date + ' ' + s.Time + ' · ' + (s.Type === '集团' ? '集团' : s.Type === '个人' ? '个人' : '部门'), goto: 'schedule' });
            });
            HRDB.getAlerts().filter(function (a) { return (a.Title + a.Content).toLowerCase().indexOf(kw) >= 0; }).slice(0, 3).forEach(function (a) {
                hits.push({ group: '演习警报', title: a.Title, desc: '[' + a.Level + '色] ' + (a.Content || '').slice(0, 50), goto: 'alert' });
            });
            if (!hits.length) { $('#gsResult').html('<div class="empty-state"><div class="empty-ico">⌕</div>未找到与「' + esc($('#gsKw').val()) + '」相关的结果</div>'); return; }
            var h = '';
            var lastG = '';
            hits.forEach(function (it) {
                if (it.group !== lastG) { h += '<div class="gs-group">' + esc(it.group) + '</div>'; lastG = it.group; }
                h += '<div class="gs-item" data-goto="' + it.goto + '"><div class="gs-title">' + esc(it.title) + '</div><div class="gs-desc">' + esc(it.desc) + '</div></div>';
            });
            $('#gsResult').html(h);
            $('#gsResult .gs-item').off('click').on('click', function () {
                toast('已跳转至「' + $(this).find('.gs-title').text().slice(0, 20) + '」相关页面', 'success');
                showView($(this).data('goto'));
            });
        }
        $('#gsBtn').off('click').on('click', render);
        $('#gsKw').off('keydown').on('keydown', function (e) { if (e.keyCode === 13) render(); });
    };

    // ---------- 部门群聊 ----------
    VIEWS.groupChat = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var depts = HRDB.getDepartments();
        var html = '';
        html += '<div class="panel"><div class="panel-title">部门群聊</div>';
        if (isAdmin) {
            html += '<div class="toolbar"><select id="gcDept" class="search-input">' + depts.map(function (d) { return '<option value="' + d.DepartmentCode + '">' + esc(d.DepartmentName) + '群</option>'; }).join('') + '</select></div>';
        } else {
            html += '<div style="margin-bottom:10px;color:var(--havvk-text-dim);font-size:13px;">当前群组：' + esc(HRDB.getDeptName(u.Department)) + '</div>';
        }
        html += '<div id="gcBox" style="height:calc(100vh - 320px);min-height:300px;border:1px solid var(--havvk-border-soft);border-radius:6px;background:#f4f7fb;display:flex;flex-direction:column;">';
        html += '<div id="gcMsgs" style="flex:1;overflow-y:auto;padding:14px;"></div>';
        html += '<div style="border-top:1px solid var(--havvk-border-soft);padding:10px;background:#fff;display:flex;gap:8px;"><input type="text" id="gcText" placeholder="输入群消息…" style="flex:1;" maxlength="300"/><a href="javascript:;" class="btn btn-primary" id="gcSend">发送</a></div>';
        html += '</div></div>';
        $(container).html(html);
        function curDept() { return isAdmin ? $('#gcDept').val() : u.Department; }
        function render() {
            var dept = curDept();
            var msgs = HRDB.getGroupMessages(dept);
            if (!msgs.length) {
                $('#gcMsgs').html('<div class="empty-state"><div class="empty-ico">▣</div>群内暂无消息</div>');
                return;
            }
            var h = '';
            msgs.forEach(function (m) {
                var mine = (m.FromID === u.EmployeeID);
                h += '<div style="display:flex;' + (mine ? 'justify-content:flex-end;' : '') + 'margin-bottom:10px;">';
                h += '<div style="max-width:75%;background:' + (mine ? '#2362af' : '#fff') + ';color:' + (mine ? '#fff' : '#333') + ';padding:8px 12px;border-radius:8px;font-size:13px;line-height:1.6;box-shadow:0 1px 2px rgba(0,0,0,.06);">';
                h += '<div style="font-size:11px;' + (mine ? 'color:rgba(255,255,255,.75);' : 'color:var(--havvk-text-dim);') + 'margin-bottom:3px;">' + esc(m.FromName) + ' · ' + esc(m.Time) + '</div>';
                h += esc(m.Content);
                h += '</div></div>';
            });
            $('#gcMsgs').html(h);
            $('#gcMsgs').scrollTop($('#gcMsgs')[0].scrollHeight);
        }
        render();
        $('#gcDept').off('change', render);
        function send() {
            var t = $('#gcText').val().trim();
            if (!t) return;
            HRDB.addGroupMessage({ Dept: curDept(), FromID: u.EmployeeID, FromName: u.EmployeeName, Content: t });
            $('#gcText').val('');
            render();
        }
        $('#gcSend').off('click').on('click', send);
        $('#gcText').off('keydown').on('keydown', function (e) { if (e.keyCode === 13) send(); });
    };

    // ---------- 人事流程（转正 / 离职） ----------
    VIEWS.workflow = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var html = '';
        html += '<div class="panel"><div class="panel-title">发起人事流程</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">流程类型</div><div><select id="wfType"><option value="转正">转正申请</option><option value="离职">离职申请</option></select></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">申请说明（转正：试用表现 / 离职：交接清单）</div><div><textarea id="wfContent" rows="3" placeholder="请填写申请理由、工作表现或离职交接内容"></textarea></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="wfAdd">提交申请</a></div>';
        html += '</div>';
        var myList = HRDB.getWorkFlows().filter(function (w) { return w.EmployeeID === u.EmployeeID; });
        html += '<div class="panel"><div class="panel-title">我的申请记录（' + myList.length + '）</div>';
        if (!myList.length) {
            html += '<div class="empty-state"><div class="empty-ico">▥</div>暂无流程记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>类型</th><th>内容</th><th>提交时间</th><th>状态</th><th>审批意见</th></tr></thead><tbody>';
            myList.forEach(function (w) {
                html += '<tr><td>' + esc(w.Type) + '</td><td style="max-width:220px;">' + esc(w.Content) + '</td><td>' + esc(w.CreateTime) + '</td><td>' + statusTag(w.Status) + '</td><td style="max-width:160px;">' + (w.ApproveNote ? esc(w.ApproveBy) + '：' + esc(w.ApproveNote) : '—') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);
        $('#wfAdd').off('click').on('click', function () {
            var content = $('#wfContent').val().trim();
            if (!content) { toast('请填写申请说明', 'error'); return; }
            HRDB.addWorkFlow({ EmployeeID: u.EmployeeID, EmployeeName: u.EmployeeName, Type: $('#wfType').val(), Content: content });
            toast('流程申请已提交', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('hrService'); }, 800);
        });
    };

    // ---------- 打印单据（请假单 / 报销单） ----------
    VIEWS.printForm = function () {
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var leaves = isAdmin ? HRDB.getLeaves() : HRDB.getLeaves({ empId: u.EmployeeID });
        var expenses = isAdmin ? HRDB.getExpenses() : HRDB.getExpenses({ empId: u.EmployeeID });
        var html = '';
        html += '<div class="panel"><div class="panel-title">打印单据</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">选择单据生成可打印页面，用于纸质归档。</div>';
        html += '<div class="panel" style="margin-bottom:12px;"><div class="panel-title">请假单（' + leaves.length + '）</div>';
        if (!leaves.length) { html += '<div class="empty-state">暂无请假记录</div>'; }
        else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>姓名</th><th>类型</th><th>起止</th><th>天数</th><th>状态</th><th class="op-cell">操作</th></tr></thead><tbody>';
            leaves.forEach(function (l) {
                html += '<tr><td>' + esc(l.EmployeeName) + '</td><td>' + esc(l.LeaveType) + '</td><td>' + esc(l.StartDate) + ' ~ ' + esc(l.EndDate) + '</td><td>' + l.Days + ' 天</td><td>' + statusTag(l.Status) + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-primary" data-printleave="' + l.LeaveID + '">打印</a></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        html += '<div class="panel"><div class="panel-title">报销单（' + expenses.length + '）</div>';
        if (!expenses.length) { html += '<div class="empty-state">暂无报销记录</div>'; }
        else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>姓名</th><th>标题</th><th>金额</th><th>状态</th><th class="op-cell">操作</th></tr></thead><tbody>';
            expenses.forEach(function (e) {
                html += '<tr><td>' + esc(e.EmployeeName) + '</td><td>' + esc(e.Title) + '</td><td>¥' + e.Amount.toFixed(2) + '</td><td>' + statusTag(e.Status) + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-primary" data-printexp="' + e.ExpenseID + '">打印</a></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div></div>';
        $('#appContent').html(html);
        function openPrint(title, body) {
            var w = window.open('', '_blank', 'width=820,height=1000');
            if (!w) { toast('浏览器拦截了弹窗，请允许后重试', 'error'); return; }
            w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title><style>body{font-family:"Microsoft YaHei",sans-serif;padding:40px;color:#222;}h1{font-size:20px;text-align:center;border-bottom:2px solid #2362af;padding-bottom:10px;margin-bottom:24px;}table{width:100%;border-collapse:collapse;margin-bottom:20px;}td,th{border:1px solid #999;padding:8px 10px;font-size:13px;}th{background:#f0f5fb;}label{font-size:13px;color:#666;}@media print{body{padding:10px;}}</style></head><body>' + body + '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();},300);};</scr' + 'ipt></body></html>');
            w.document.close();
        }
        $('#appContent a[data-printleave]').off('click').on('click', function () {
            var l = HRDB.getLeaves().find(function (x) { return x.LeaveID === parseInt($(this).data('printleave')); });
            if (!l) return;
            var e = HRDB.getEmployeeById(l.EmployeeID) || {};
            openPrint('请假单', '<h1>哈夫克集团 · 请假单</h1><table>' +
                '<tr><th>姓名</th><td>' + esc(l.EmployeeName) + '</td><th>工号</th><td>' + esc(l.EmployeeID) + '</td></tr>' +
                '<tr><th>部门</th><td>' + esc(HRDB.getDeptName(e.Department)) + '</td><th>请假类型</th><td>' + esc(l.LeaveType) + '</td></tr>' +
                '<tr><th>开始日期</th><td>' + esc(l.StartDate) + '</td><th>结束日期</th><td>' + esc(l.EndDate) + '</td></tr>' +
                '<tr><th>天数</th><td>' + l.Days + ' 天</td><th>状态</th><td>' + esc(l.Status) + '</td></tr>' +
                '<tr><th>请假事由</th><td colspan="3">' + esc(l.Reason) + '</td></tr></table>' +
                '<p style="margin-top:40px;"><label>申请人签字：________________</label>　<label>审批人签字：________________</label></p><p style="text-align:right;font-size:12px;color:#888;">打印时间：' + HRDB.today() + '</p>');
        });
        $('#appContent a[data-printexp]').off('click').on('click', function () {
            var e = HRDB.getExpenses().find(function (x) { return x.ExpenseID === parseInt($(this).data('printexp')); });
            if (!e) return;
            openPrint('报销单', '<h1>哈夫克集团 · 费用报销单</h1><table>' +
                '<tr><th>姓名</th><td>' + esc(e.EmployeeName) + '</td><th>工号</th><td>' + esc(e.EmployeeID) + '</td></tr>' +
                '<tr><th>报销标题</th><td colspan="3">' + esc(e.Title) + '</td></tr>' +
                '<tr><th>类型</th><td>' + esc(e.Category) + '</td><th>费用日期</th><td>' + esc(e.ExpenseDate) + '</td></tr>' +
                '<tr><th>金额</th><td style="color:#c04a4a;font-weight:700;">¥' + e.Amount.toFixed(2) + '</td><th>状态</th><td>' + esc(e.Status) + '</td></tr>' +
                '<tr><th>费用说明</th><td colspan="3">' + esc(e.Description || '—') + '</td></tr></table>' +
                '<p style="margin-top:40px;"><label>报销人签字：________________</label>　<label>审批人签字：________________</label></p><p style="text-align:right;font-size:12px;color:#888;">打印时间：' + HRDB.today() + '</p>');
        });
    };

    // ---------- 干员晋级申请 ----------
    VIEWS.rankUpgrade = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var info = rankInfo(u);
        var canApply = (u.PermissionLevel !== 3);
        var target = '';
        if (info.rank === '新进干员') target = '正式干员';
        else if (info.rank === '正式干员') target = '精英干员';
        else if (info.rank === '精英干员') target = '行动队长';
        else target = '已达最高级别';
        var html = '';
        html += '<div class="panel"><div class="panel-title">干员晋级申请</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">当前干员等级</div><div class="d-value"><span class="rank-badge ' + info.cls + '">' + info.rank + ' ' + info.star + '</span></div></div>';
        html += '<div class="detail-item"><div class="d-label">可申请目标</div><div class="d-value highlight">' + esc(target) + '</div></div>';
        if (canApply && target !== '已达最高级别') {
            html += '<div class="detail-item wide"><div class="d-label">申请理由</div><div><textarea id="ruReason" rows="3" placeholder="说明你的工作表现、贡献与晋级理由"></textarea></div></div>';
        }
        html += '</div>';
        if (canApply && target !== '已达最高级别') {
            html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="ruAdd">提交晋级申请</a></div>';
        }
        html += '</div>';
        var myList = HRDB.getAdvanceRequests().filter(function (r) { return r.EmployeeID === u.EmployeeID; });
        html += '<div class="panel"><div class="panel-title">我的晋级记录（' + myList.length + '）</div>';
        if (!myList.length) {
            html += '<div class="empty-state"><div class="empty-ico">★</div>暂无晋级记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>申请等级</th><th>理由</th><th>提交时间</th><th>状态</th><th>审批意见</th></tr></thead><tbody>';
            myList.forEach(function (r) {
                html += '<tr><td>' + esc(r.FromRank) + ' → ' + esc(r.ToRank) + '</td><td style="max-width:220px;">' + esc(r.Reason) + '</td><td>' + esc(r.CreateTime) + '</td><td>' + statusTag(r.Status) + '</td><td style="max-width:160px;">' + (r.ApproveNote ? esc(r.ApproveBy) + '：' + esc(r.ApproveNote) : '—') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);
        $('#ruAdd').off('click').on('click', function () {
            var reason = $('#ruReason').val().trim();
            if (!reason) { toast('请填写晋级理由', 'error'); return; }
            HRDB.addAdvanceRequest({ EmployeeID: u.EmployeeID, EmployeeName: u.EmployeeName, FromRank: info.rank, ToRank: target, Reason: reason });
            toast('晋级申请已提交', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('hrService'); }, 800);
        });
    };

    // ---------- 干员履历（聚合档案） ----------
    VIEWS.operatorProfile = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var isMgr = (u.PermissionLevel === 2);
        var candidates = [];
        if (isAdmin) candidates = HRDB.getEmployees().filter(function (e) { return e.IsActive; });
        else if (isMgr) candidates = HRDB.getEmployees().filter(function (e) { return e.IsActive && e.Department === u.Department; });
        else candidates = [u];
        var html = '';
        if (candidates.length > 1) {
            html += '<div class="panel"><div class="panel-title">选择干员</div><div class="toolbar"><select id="opEmp" class="search-input">' + candidates.map(function (e) { return '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '（' + e.EmployeeID + '）</option>'; }).join('') + '</select></div></div>';
        }
        html += '<div id="opBody"></div>';
        $(container).html(html);
        function render() {
            var empId = $('#opEmp').length ? $('#opEmp').val() : u.EmployeeID;
            var e = HRDB.getEmployeeById(empId);
            if (!e) return;
            var info = rankInfo(e);
            var h = '';
            h += '<div class="panel"><div class="panel-title">干员档案 · ' + esc(e.EmployeeName) + '</div>';
            h += '<div class="detail-grid">';
            h += '<div class="detail-item op-rank-item"><div class="d-label">干员等级</div><div class="d-value"><span class="rank-badge ' + info.cls + '">' + info.rank + ' ' + info.star + '</span></div></div>';
            h += '<div class="detail-item"><div class="d-label">工号 / 部门</div><div class="d-value">' + esc(e.EmployeeID) + ' · ' + esc(HRDB.getDeptName(e.Department)) + '</div></div>';
            h += '<div class="detail-item"><div class="d-label">角色</div><div class="d-value">' + esc(PERM[e.PermissionLevel].name) + '</div></div>';
            h += '<div class="detail-item"><div class="d-label">在职年限</div><div class="d-value">' + info.years + ' 年</div></div>';
            h += '</div></div>';
            var revs = HRDB.getReviews().filter(function (r) { return r.EmployeeID === e.EmployeeID; });
            h += '<div class="panel"><div class="panel-title">绩效记录（' + revs.length + '）</div>';
            if (!revs.length) h += '<div class="empty-state">暂无绩效记录</div>';
            else {
                h += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>周期</th><th>得分</th><th>KPI</th><th>工作质量</th><th>状态</th></tr></thead><tbody>';
                revs.forEach(function (r) {
                    h += '<tr><td>' + esc(r.ReviewPeriod) + '</td><td><span class="tag ' + scoreClass(r.PerformanceScore) + '">' + r.PerformanceScore + '</span></td><td>' + esc(r.KPICompletion || '—') + '</td><td>' + qualityTag(r.WorkQuality) + '</td><td>' + statusTag(r.Status) + '</td></tr>';
                });
                h += '</tbody></table></div>';
            }
            h += '</div>';
            var defs = HRDB.getSkillDefs();
            var levels = HRDB.getSkillLevels();
            var myLv = levels.filter(function (l) { return l.EmployeeID === e.EmployeeID; });
            h += '<div class="panel"><div class="panel-title">技能掌握度</div>';
            if (!myLv.length) h += '<div class="empty-state">暂无技能记录</div>';
            else {
                h += '<div class="chart-list">';
                myLv.forEach(function (l) {
                    var d = defs.find(function (x) { return x.SkillID === l.SkillID; });
                    h += '<div class="chart-row"><div class="chart-label">' + esc(d ? d.Name : '技能#' + l.SkillID) + '</div><div class="chart-main">' + barHtml(l.Level / 5 * 100, '#8a6fc9') + '</div><div class="chart-val">' + skillLevelTag(l.Level) + '</div></div>';
                });
                h += '</div>';
            }
            h += '</div>';
            var recs = HRDB.getRecognitions().filter(function (r) { return r.EmployeeID === e.EmployeeID; });
            h += '<div class="panel"><div class="panel-title">员工嘉奖（' + recs.length + '）</div>';
            if (!recs.length) h += '<div class="empty-state">暂无嘉奖记录</div>';
            else {
                recs.forEach(function (r) {
                    h += '<div class="ann-card"><div class="ann-head"><span class="ann-tag">★ 嘉奖</span><span class="ann-title">' + esc(r.Title) + '</span></div><div class="ann-body">' + esc(r.Content) + '</div><div class="ann-meta">' + esc(r.CreateTime || r.PublishTime || '') + '</div></div>';
                });
            }
            h += '</div>';
            var briefs = HRDB.getBriefings();
            var myB = [];
            briefs.forEach(function (b) {
                (b.Reports || []).forEach(function (r) {
                    if (r.EmployeeID === e.EmployeeID) myB.push({ title: b.Title, content: r.Content, time: r.Time });
                });
            });
            h += '<div class="panel"><div class="panel-title">行动报告（' + myB.length + '）</div>';
            if (!myB.length) h += '<div class="empty-state">暂无行动报告</div>';
            else {
                myB.forEach(function (b) {
                    h += '<div class="brief-report"><b>' + esc(b.title) + '</b>：' + esc(b.content) + '<br/><span class="text-dim" style="font-size:11px;">' + esc(b.time) + '</span></div>';
                });
            }
            h += '</div>';
            var advs = HRDB.getAdvanceRequests().filter(function (r) { return r.EmployeeID === e.EmployeeID && r.Status === '已通过'; });
            h += '<div class="panel"><div class="panel-title">晋级历史（' + advs.length + '）</div>';
            if (!advs.length) h += '<div class="empty-state">暂无晋级记录</div>';
            else {
                advs.forEach(function (r) {
                    h += '<div class="ann-card"><div class="ann-head"><span class="ann-tag">晋级</span><span class="ann-title">' + esc(r.FromRank) + ' → ' + esc(r.ToRank) + '</span></div><div class="ann-meta">' + esc(r.ApproveTime || '') + ' · 审批人 ' + esc(r.ApproveBy || '—') + '</div></div>';
                });
            }
            h += '</div>';
            $('#opBody').html(h);
        }
        render();
        $('#opEmp').off('change', render);
    };

    // ---------- 统一审批中心（7 类聚合） ----------
    VIEWS.approvalHub = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var dept = u.Department;
        var pendLeave = isAdmin ? HRDB.getLeaves().filter(function (l) { return l.Status === '待审批'; }) : HRDB.getLeaves().filter(function (l) { return l.Status === '待审批' && l.Department === dept; });
        var pendExp = isAdmin ? HRDB.getExpenses().filter(function (e) { return e.Status === '待审批'; }) : HRDB.getExpenses().filter(function (e) { return e.Status === '待审批' && e.Department === dept; });
        var pendEq = isAdmin ? HRDB.getEquipRequests().filter(function (e) { return e.Status === '待审批'; }) : HRDB.getEquipRequests().filter(function (e) { return e.Status === '待审批' && e.Department === dept; });
        var pendAr = isAdmin ? HRDB.getAdminRequests().filter(function (r) { return r.Status === '待审批'; }) : HRDB.getAdminRequests().filter(function (r) { return r.Status === '待审批' && r.Department === dept; });
        var pendPu = isAdmin ? HRDB.getProfileUpdates().filter(function (p) { return p.Status === '待审批'; }) : HRDB.getProfileUpdates().filter(function (p) { return p.Status === '待审批' && p.Department === dept; });
        var pendAdv = isAdmin ? HRDB.getAdvanceRequests({ status: '待审批' }) : HRDB.getAdvanceRequests({ status: '待审批', department: dept });
        var pendWf = isAdmin ? HRDB.getWorkFlows({ status: '待审批' }) : HRDB.getWorkFlows({ status: '待审批', department: dept });
        var sections = [
            { key: 'leave', name: '请假审批', list: pendLeave, idFn: function (l) { return l.LeaveID; }, row: function (l) { return esc(l.EmployeeName) + ' · ' + esc(l.LeaveType) + ' ' + esc(l.StartDate) + '~' + esc(l.EndDate) + '（' + l.Days + '天）'; }, ok: function (id) { HRDB.approveLeave(id, '已批准', u.EmployeeID, '同意'); }, no: function (id) { HRDB.approveLeave(id, '已拒绝', u.EmployeeID, '未通过'); } },
            { key: 'exp', name: '差旅报销', list: pendExp, idFn: function (e) { return e.ExpenseID; }, row: function (e) { return esc(e.EmployeeName) + ' · ' + esc(e.Title) + ' · ¥' + e.Amount.toFixed(2); }, ok: function (id) { HRDB.approveExpense(id, true, '同意', u.EmployeeName); }, no: function (id) { HRDB.approveExpense(id, false, '未通过', u.EmployeeName); } },
            { key: 'eq', name: '设备申领', list: pendEq, idFn: function (e) { return e.ReqID; }, row: function (e) { return esc(e.EmployeeName) + ' · ' + esc(e.EquipmentName); }, ok: function (id) { HRDB.approveEquipRequest(id, true, '同意发放', u.EmployeeName); }, no: function (id) { HRDB.approveEquipRequest(id, false, '暂不发放', u.EmployeeName); } },
            { key: 'ar', name: '行政申请', list: pendAr, idFn: function (r) { return r.ReqID; }, row: function (r) { return esc(r.ApplicantName) + ' · ' + esc(r.Type) + ' · ' + esc(r.Title); }, ok: function (id) { HRDB.approveAdminRequest(id, true, '同意', u.EmployeeName); }, no: function (id) { HRDB.approveAdminRequest(id, false, '未通过', u.EmployeeName); } },
            { key: 'pu', name: '资料变更', list: pendPu, idFn: function (p) { return p.UpdateID; }, row: function (p) { return esc(p.EmployeeName) + ' · ' + esc(p.ChangeType); }, ok: function (id) { HRDB.approveProfileUpdate(id, true, u.EmployeeName); }, no: function (id) { HRDB.approveProfileUpdate(id, false, u.EmployeeName); } },
            { key: 'adv', name: '干员晋级', list: pendAdv, idFn: function (r) { return r.AdvID; }, row: function (r) { return esc(r.EmployeeName) + ' · ' + esc(r.FromRank) + '→' + esc(r.ToRank); }, ok: function (id) { HRDB.approveAdvanceRequest(id, true, '同意晋级', u.EmployeeName); }, no: function (id) { HRDB.approveAdvanceRequest(id, false, '暂缓', u.EmployeeName); } },
            { key: 'wf', name: '人事流程', list: pendWf, idFn: function (w) { return w.FlowID; }, row: function (w) { return esc(w.EmployeeName) + ' · ' + esc(w.Type) + '申请'; }, ok: function (id) { HRDB.approveWorkFlow(id, true, '同意', u.EmployeeName); }, no: function (id) { HRDB.approveWorkFlow(id, false, '未通过', u.EmployeeName); } }
        ];
        var html = '';
        html += '<div class="panel"><div class="panel-title">统一审批中心' + (isAdmin ? '（全局）' : '（本部门）') + '</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">请假 / 报销 / 设备 / 行政 / 资料变更 / 晋级 / 人事流程集中处理；超过 24 小时未审批自动标「超时」催办。</div>';
        // 超时催办统计
        var overTotal = 0;
        sections.forEach(function (s) {
            s.list.forEach(function (item) {
                if (isApprovalOverdue(item.CreateTime)) overTotal++;
            });
        });
        if (overTotal > 0) {
            html += '<div class="overdue-banner"><b>催办提醒：</b>共 ' + overTotal + ' 项审批超过 24 小时未处理，请尽快处理。</div>';
        }
        sections.forEach(function (s) {
            var over = s.list.filter(function (item) { return isApprovalOverdue(item.CreateTime); }).length;
            html += '<div class="panel" style="margin-bottom:12px;"><div class="panel-title">' + esc(s.name) + '（' + s.list.length + '）' + (over ? ' <span class="tag tag-red">' + over + ' 项超时</span>' : '') + '</div>';
            if (!s.list.length) {
                html += '<div class="empty-state"><div class="empty-ico">☑</div>暂无待审批</div>';
            } else {
                html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>内容</th><th class="op-cell">操作</th></tr></thead><tbody>';
                s.list.forEach(function (item) {
                    var rid = s.idFn(item);
                    var overdue = isApprovalOverdue(item.CreateTime);
                    html += '<tr><td>' + (overdue ? '<span class="tag tag-red">超时</span> ' : '') + s.row(item) + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-primary" data-hubok="' + s.key + ':' + rid + '">批准</a><a href="javascript:;" class="btn btn-sm btn-danger" data-hubno="' + s.key + ':' + rid + '">驳回</a></td></tr>';
                });
                html += '</tbody></table></div>';
            }
            html += '</div>';
        });
        html += '</div>';
        $(container).html(html);
        function doAction(prefix, ok) {
            var parts = prefix.split(':');
            var key = parts[0]; var id = parseInt(parts[1]);
            var s = sections.find(function (x) { return x.key === key; });
            if (!s) return;
            if (ok) s.ok(id); else s.no(id);
            toast((ok ? '已批准' : '已驳回') + '：' + s.name, 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('approvalCenter'); }, 700);
        }
        $(container).find('a[data-hubok]').off('click').on('click', function () { doAction($(this).data('hubok'), true); });
        $(container).find('a[data-hubno]').off('click').on('click', function () { doAction($(this).data('hubno'), false); });
    };

    // ---------- 考勤异常检测（迟到 / 漏卡） ----------
    VIEWS.attendanceAbnormal = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var html = '';
        html += '<div class="panel"><div class="panel-title">考勤异常检测' + (isAdmin ? '（全部）' : '（本部门）') + '</div>';
        html += '<div class="toolbar"><input type="date" id="aaStart" class="search-input"/><span style="color:var(--havvk-text-dim);">至</span><input type="date" id="aaEnd" class="search-input"/><a href="javascript:;" class="btn btn-primary" id="aaBtn">检测</a></div>';
        html += '<div id="aaBody" style="margin-top:14px;"></div></div>';
        $(container).html(html);
        function detect() {
            var start = $('#aaStart').val() || HRDB.today();
            var end = $('#aaEnd').val() || HRDB.today();
            var rule = HRDB.getAttendanceRule();
            var lateTime = rule.WorkStart || '09:00';
            var lateMin = lateTime.split(':');
            var lateLimit = parseInt(lateMin[0]) * 60 + parseInt(lateMin[1]) + (rule.LateThreshold || 0);
            var holidays = rule.Holidays || [];
            var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive && (isAdmin || e.Department === u.Department); });
            var att = HRDB.getAttendance();
            var abnormal = [];
            var d = new Date(start.replace(/-/g, '/'));
            var endD = new Date(end.replace(/-/g, '/'));
            while (d <= endD) {
                var ds = fmtDateStr(d);
                if (holidays.indexOf(ds) >= 0) { d.setDate(d.getDate() + 1); continue; } // 节假日白名单
                emps.forEach(function (e) {
                    var day = att.filter(function (a) { return a.EmployeeID === e.EmployeeID && a.AttendanceDate === ds; });
                    var checkIn = day.find(function (a) { return a.CheckType === '上班'; });
                    var checkOut = day.find(function (a) { return a.CheckType === '下班'; });
                    if (checkIn) {
                        var hm = checkIn.AttendanceTime.split(':');
                        var cur = parseInt(hm[0]) * 60 + parseInt(hm[1]);
                        if (cur > lateLimit) {
                            abnormal.push({ Date: ds, EmployeeID: e.EmployeeID, EmployeeName: e.EmployeeName, Dept: HRDB.getDeptName(e.Department), Type: '迟到', Detail: checkIn.AttendanceTime });
                        }
                    }
                    if (checkIn && !checkOut) {
                        abnormal.push({ Date: ds, EmployeeID: e.EmployeeID, EmployeeName: e.EmployeeName, Dept: HRDB.getDeptName(e.Department), Type: '漏下班卡', Detail: '上班 ' + checkIn.AttendanceTime });
                    }
                    if (!checkIn && checkOut) {
                        abnormal.push({ Date: ds, EmployeeID: e.EmployeeID, EmployeeName: e.EmployeeName, Dept: HRDB.getDeptName(e.Department), Type: '漏上班卡', Detail: '下班 ' + checkOut.AttendanceTime });
                    }
                });
                d.setDate(d.getDate() + 1);
            }
            abnormal.sort(function (a, b) { return (a.Date + a.EmployeeID).localeCompare(b.Date + b.EmployeeID); });
            var late = abnormal.filter(function (a) { return a.Type === '迟到'; }).length;
            var miss = abnormal.filter(function (a) { return a.Type.indexOf('漏') === 0; }).length;
            var h = '<div class="stat-grid" style="margin-bottom:14px;">';
            h += '<div class="stat-card"><div class="stat-num">' + abnormal.length + '</div><div class="stat-label">异常总数</div></div>';
            h += '<div class="stat-card"><div class="stat-num">' + late + '</div><div class="stat-label">迟到</div></div>';
            h += '<div class="stat-card"><div class="stat-num">' + miss + '</div><div class="stat-label">漏卡</div></div>';
            h += '</div>';
            if (!abnormal.length) {
                h += '<div class="empty-state"><div class="empty-ico">◷</div>该时间段内无考勤异常</div>';
            } else {
                h += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>日期</th><th>姓名</th><th>部门</th><th>异常类型</th><th>详情</th></tr></thead><tbody>';
                abnormal.forEach(function (a) {
                    var tCls = a.Type === '迟到' ? 'tag-gold' : 'tag-red';
                    h += '<tr><td>' + esc(a.Date) + '</td><td>' + esc(a.EmployeeName) + '</td><td>' + esc(a.Dept) + '</td><td><span class="tag ' + tCls + '">' + esc(a.Type) + '</span></td><td>' + esc(a.Detail) + '</td></tr>';
                });
                h += '</tbody></table></div>';
            }
            $('#aaBody').html(h);
        }
        $('#aaBtn').off('click').on('click', detect);
        var today = HRDB.today();
        var d7 = new Date(); d7.setDate(d7.getDate() - 6);
        $('#aaStart').val(fmtDateStr(d7));
        $('#aaEnd').val(today);
        detect();
    };

    // ---------- 数据备份 / 恢复（管理员） ----------
    VIEWS.backup = function (container) {
        container = container || '#appContent';
        var html = '';
        html += '<div class="panel"><div class="panel-title">数据备份</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">一键导出全部数据为 JSON 存档文件，可随时导入恢复。建议定期备份。</div>';
        html += '<div class="todo-grid">';
        html += '<div class="todo-card"><div class="todo-ico">↥</div><div class="todo-body"><div class="todo-title">导出全库备份</div><div class="todo-count">JSON 文件</div></div><a href="javascript:;" class="btn btn-sm btn-primary" id="bkExport">导出</a></div>';
        html += '<div class="todo-card"><div class="todo-ico">↧</div><div class="todo-body"><div class="todo-title">导入备份恢复</div><div class="todo-count">覆盖当前数据</div></div><a href="javascript:;" class="btn btn-sm" id="bkImport">选择文件</a></div>';
        html += '<div class="todo-card"><div class="todo-ico">↻</div><div class="todo-body"><div class="todo-title">恢复出厂数据</div><div class="todo-count">重置种子数据</div></div><a href="javascript:;" class="btn btn-sm btn-danger" id="bkReset">重置</a></div>';
        html += '</div><input type="file" id="bkFile" accept=".json" style="display:none;"/></div>';
        $(container).html(html);
        $('#bkExport').off('click').on('click', function () {
            var json = HRDB.exportAllData();
            var blob = new Blob([json], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = 'havvk_hr_backup_' + HRDB.today() + '.json';
            document.body.appendChild(a); a.click();
            setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
            toast('备份已导出', 'success');
        });
        $('#bkImport').off('click').on('click', function () { $('#bkFile').click(); });
        $('#bkFile').off('change').on('change', function () {
            var f = this.files[0];
            if (!f) return;
            var reader = new FileReader();
            reader.onload = function (ev) {
                var r = HRDB.importAllData(ev.target.result);
                toast(r.msg, r.ok ? 'success' : 'error');
                if (r.ok) setTimeout(function () { location.reload(); }, 1000);
            };
            reader.readAsText(f);
        });
        $('#bkReset').off('click').on('click', function () {
            showModal('恢复出厂数据', '<p style="color:var(--havvk-text);">将清空全部业务数据并恢复种子数据，该操作不可撤销！</p><p class="text-dim" style="font-size:12px;">按安全规范，提交后将进入「安全中心 → 高危操作复核队列」，二次确认后才真正执行。</p>',
                '<a href="javascript:;" class="btn btn-danger" id="bkResetOk">提交复核</a><a href="javascript:;" class="btn" id="bkResetCancel">取消</a>');
            $('#bkResetOk').off('click').on('click', function () {
                closeModal();
                HRDB.addSecurityReview('数据重置', '恢复出厂种子数据');
                toast('已提交复核请求，请到安全中心确认执行', 'success');
                setTimeout(function () { showView('security'); }, 900);
            });
            $('#bkResetCancel').off('click').on('click', closeModal);
        });
    };

    // ---------- 操作日志（管理员） ----------
    VIEWS.auditLog = function (container) {
        container = container || '#appContent';
        var html = '';
        html += '<div class="panel"><div class="panel-title">操作日志</div>';
        html += '<div class="toolbar"><select id="alAction" class="search-input"><option value="">全部操作</option><option>登录</option><option>新增员工</option><option>编辑员工</option><option>删除员工</option><option>批量启用</option><option>批量停用</option><option>批量删除</option><option>薪资录入</option><option>删除薪资</option><option>合同录入</option><option>合同状态变更</option><option>删除合同</option><option>资产登记</option><option>资产流转</option><option>删除资产</option><option>晋级申请</option><option>晋级审批</option><option>人事流程</option><option>数据恢复</option><option>数据重置</option></select><input type="text" id="alKw" class="search-input" placeholder="搜索操作人 / 目标 / 详情" style="flex:1;"/><a href="javascript:;" class="btn btn-primary" id="alBtn">查询</a></div>';
        html += '<div id="alBody" style="margin-top:12px;"></div></div>';
        $(container).html(html);
        function render() {
            var list = HRDB.getAuditLogs({ action: $('#alAction').val(), keyword: $('#alKw').val().trim() });
            if (!list.length) {
                $('#alBody').html('<div class="empty-state"><div class="empty-ico">▦</div>暂无日志记录</div>');
                return;
            }
            var h = '<div class="table-wrap"><table class="hr-table"><thead><tr><th>时间</th><th>操作人</th><th>操作</th><th>目标</th><th>详情</th></tr></thead><tbody>';
            list.forEach(function (l) {
                h += '<tr><td>' + esc(l.Time) + '</td><td>' + esc(l.OperatorName) + '</td><td>' + esc(l.Action) + '</td><td>' + esc(l.Target) + '</td><td style="max-width:220px;">' + esc(l.Detail || '') + '</td></tr>';
            });
            h += '</tbody></table></div>';
            $('#alBody').html(h);
        }
        $('#alBtn').off('click').on('click', render);
        $('#alAction').off('change', render);
        render();
    };

    // ---------- 集团战报（管理员） ----------
    VIEWS.warReport = function (container) {
        container = container || '#appContent';
        var today = HRDB.today();
        var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive; });
        var att = HRDB.getAttendance();
        var todayIn = att.filter(function (a) { return a.AttendanceDate === today && a.CheckType === '上班'; }).length;
        var todayLeave = HRDB.getLeaves().filter(function (l) { return (l.StartDate || '') <= today && (l.EndDate || '') >= today && l.Status === '已批准'; }).length;
        var pendAll = HRDB.getLeaves().filter(function (l) { return l.Status === '待审批'; }).length
            + HRDB.getExpenses().filter(function (e) { return e.Status === '待审批'; }).length
            + (HRDB.getEquipRequests() || []).filter(function (e) { return e.Status === '待审批'; }).length
            + (HRDB.getAdminRequests() || []).filter(function (r) { return r.Status === '待审批'; }).length
            + (HRDB.getProfileUpdates() || []).filter(function (p) { return p.Status === '待审批'; }).length;
        var taskDone = HRDB.getMissions().filter(function (m) { return m.Status === '已评分'; }).length;
        var taskAll = HRDB.getMissions().length;
        var alert = HRDB.getAlerts()[0];
        var html = '';
        html += '<div class="panel"><div class="panel-title">集团战报 · ' + today + '</div>';
        html += '<div class="stat-grid">';
        html += '<div class="stat-card"><div class="stat-num">' + emps.length + '</div><div class="stat-label">在职干员</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + todayIn + '</div><div class="stat-label">今日打卡</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + Math.round(todayIn / (emps.length || 1) * 100) + '%</div><div class="stat-label">出勤率</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + todayLeave + '</div><div class="stat-label">今日请假</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + pendAll + '</div><div class="stat-label">待审批事项</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + taskDone + '/' + taskAll + '</div><div class="stat-label">任务完成</div></div>';
        html += '</div></div>';
        var week = [];
        for (var i = 6; i >= 0; i--) {
            var d = new Date(); d.setDate(d.getDate() - i);
            var ds = fmtDateStr(d);
            week.push({ label: (d.getMonth() + 1) + '/' + d.getDate(), count: att.filter(function (a) { return a.AttendanceDate === ds && a.CheckType === '上班'; }).length });
        }
        var maxW = Math.max.apply(null, week.map(function (w) { return w.count; }).concat([1]));
        var wHtml = '<div class="trend-bars">';
        week.forEach(function (w) {
            wHtml += '<div class="trend-col"><div class="trend-bar"><div class="trend-fill" style="height:' + (w.count / maxW * 100) + '%;"></div></div><div class="trend-num">' + w.count + '</div><div class="trend-label">' + w.label + '</div></div>';
        });
        wHtml += '</div>';
        html += '<div class="panel"><div class="panel-title">近 7 天打卡趋势</div>' + wHtml + '</div>';
        var text = '【哈夫克集团战报 ' + today + '】\n'
            + '· 在职干员 ' + emps.length + ' 人，今日打卡 ' + todayIn + ' 人（出勤率 ' + Math.round(todayIn / (emps.length || 1) * 100) + '%），请假 ' + todayLeave + ' 人。\n'
            + '· 任务完成 ' + taskDone + '/' + taskAll + '；待审批事项 ' + pendAll + ' 项。\n'
            + (alert ? '· 当前警报：' + alert.Level + '色 —— ' + alert.Title + '。\n' : '')
            + '—— 哈夫克集团行政中心';
        html += '<div class="panel"><div class="panel-title">战报文本（可复制发布）</div>';
        html += '<textarea id="wrText" rows="8" style="width:100%;box-sizing:border-box;font-size:13px;line-height:1.8;">' + esc(text) + '</textarea>';
        html += '<div style="margin-top:10px;"><a href="javascript:;" class="btn btn-primary" id="wrCopy">复制战报</a></div></div>';
        $(container).html(html);
        $('#wrCopy').off('click').on('click', function () {
            var ta = $('#wrText')[0];
            ta.select();
            try { document.execCommand('copy'); toast('战报已复制', 'success'); }
            catch (e) { toast('复制失败，请手动复制', 'error'); }
        });
    };

    // ===================== V14 管理侧扩展 =====================
    // 审批超时判定：超过 24 小时未处理
    function isApprovalOverdue(createTime) {
        if (!createTime) return false;
        var t = new Date(String(createTime).replace(/-/g, '/').replace('T', ' '));
        if (isNaN(t.getTime())) return false;
        return (Date.now() - t.getTime()) > 24 * 3600 * 1000;
    }
    // ---------- 月度考勤汇总报表（主管部门 / 管理员全局） ----------
    VIEWS.attendanceReport = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var html = '';
        html += '<div class="panel"><div class="panel-title">月度考勤汇总报表' + (isAdmin ? '（全局）' : '（本部门）') + '</div>';
        html += '<div class="toolbar"><input type="month" id="arMonth" class="search-input"/><a href="javascript:;" class="btn btn-primary" id="arBtn">生成报表</a><a href="javascript:;" class="btn" id="arPrint">打印报表</a></div>';
        html += '<div id="arBody" style="margin-top:14px;"></div></div>';
        $(container).html(html);
        var now = new Date();
        $('#arMonth').val(now.getFullYear() + '-' + (now.getMonth() < 9 ? '0' : '') + (now.getMonth() + 1));
        function generate() {
            var month = $('#arMonth').val();
            if (!month) { toast('请选择月份', 'error'); return; }
            var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive && (isAdmin || e.Department === u.Department); });
            var att = HRDB.getAttendance().filter(function (a) { return (a.AttendanceDate || '').indexOf(month) === 0; });
            var leaves = HRDB.getLeaves().filter(function (l) { return (l.StartDate || '').indexOf(month) === 0 && (isAdmin || l.Department === u.Department); });
            var rule = HRDB.getAttendanceRule();
            var rows = [];
            emps.forEach(function (e) {
                var ea = att.filter(function (a) { return a.EmployeeID === e.EmployeeID; });
                var days = {};
                ea.forEach(function (a) {
                    if (!days[a.AttendanceDate]) days[a.AttendanceDate] = {};
                    days[a.AttendanceDate][a.CheckType] = a.AttendanceTime;
                });
                var late = 0, missIn = 0, missOut = 0;
                for (var d in days) {
                    if (days[d]['上班'] && days[d]['上班'] > rule.WorkStart) late++;
                    if (days[d]['上班'] && !days[d]['下班']) missOut++;
                    if (!days[d]['上班'] && days[d]['下班']) missIn++;
                }
                var el = leaves.filter(function (l) { return l.EmployeeID === e.EmployeeID && l.Status === '已批准'; });
                var leaveDays = el.reduce(function (s, l) { return s + (l.Days || 0); }, 0);
                rows.push({ e: e, workDays: Object.keys(days).length, late: late, missIn: missIn, missOut: missOut, leaveDays: leaveDays });
            });
            var h = '<div class="stat-grid" style="margin-bottom:14px;">';
            h += '<div class="stat-card"><div class="stat-num">' + emps.length + '</div><div class="stat-label">统计人数</div></div>';
            h += '<div class="stat-card"><div class="stat-num">' + rows.reduce(function (s, r) { return s + r.workDays; }, 0) + '</div><div class="stat-label">总出勤人次</div></div>';
            h += '<div class="stat-card"><div class="stat-num">' + rows.reduce(function (s, r) { return s + r.late; }, 0) + '</div><div class="stat-label">迟到</div></div>';
            h += '<div class="stat-card"><div class="stat-num">' + rows.reduce(function (s, r) { return s + r.missIn + r.missOut; }, 0) + '</div><div class="stat-label">漏卡</div></div>';
            h += '<div class="stat-card"><div class="stat-num">' + rows.reduce(function (s, r) { return s + r.leaveDays; }, 0) + '</div><div class="stat-label">请假天数</div></div>';
            h += '</div>';
            h += '<div class="table-wrap"><table class="hr-table" id="arTable"><thead><tr><th>工号</th><th>姓名</th><th>部门</th><th>出勤天数</th><th>迟到</th><th>漏上班卡</th><th>漏下班卡</th><th>请假天数</th></tr></thead><tbody>';
            rows.forEach(function (r) {
                h += '<tr><td>' + esc(r.e.EmployeeID) + '</td><td>' + esc(r.e.EmployeeName) + '</td><td>' + esc(HRDB.getDeptName(r.e.Department)) + '</td><td>' + r.workDays + '</td><td>' + (r.late ? '<span class="tag tag-gold">' + r.late + '</span>' : r.late) + '</td><td>' + (r.missIn ? '<span class="tag tag-red">' + r.missIn + '</span>' : r.missIn) + '</td><td>' + (r.missOut ? '<span class="tag tag-red">' + r.missOut + '</span>' : r.missOut) + '</td><td>' + r.leaveDays + '</td></tr>';
            });
            h += '</tbody></table></div>';
            $('#arBody').html(h);
        }
        $('#arBtn').off('click').on('click', generate);
        $('#arPrint').off('click').on('click', function () {
            var month = $('#arMonth').val();
            var body = $('#arTable');
            if (!body.length) { toast('请先生成报表', 'error'); return; }
            var w = window.open('', '_blank', 'width=900,height=1000');
            if (!w) { toast('浏览器拦截了弹窗，请允许后重试', 'error'); return; }
            var rows = '';
            body.find('tbody tr').each(function () {
                var tds = $(this).find('td');
                rows += '<tr>' + tds.map(function () { return '<td>' + $(this).text() + '</td>'; }).get().join('') + '</tr>';
            });
            w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>考勤月报 ' + month + '</title><style>body{font-family:"Microsoft YaHei",sans-serif;padding:30px;color:#222;}h1{font-size:18px;text-align:center;border-bottom:2px solid #2362af;padding-bottom:8px;margin-bottom:18px;}table{width:100%;border-collapse:collapse;}td,th{border:1px solid #999;padding:6px 8px;font-size:12px;}th{background:#f0f5fb;}@media print{body{padding:8px;}}</style></head><body><h1>哈夫克集团 · 月度考勤汇总（' + month + '）</h1><table><thead><tr><th>工号</th><th>姓名</th><th>部门</th><th>出勤天数</th><th>迟到</th><th>漏上班卡</th><th>漏下班卡</th><th>请假天数</th></tr></thead><tbody>' + rows + '</tbody></table><p style="text-align:right;font-size:12px;color:#888;">生成时间：' + HRDB.fmtNow() + '</p><scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();},300);};</scr' + 'ipt></body></html>');
            w.document.close();
        });
        generate();
    };

    // ---------- 考勤规则配置（管理员） ----------
    VIEWS.attendanceRule = function (container) {
        container = container || '#appContent';
        var r = HRDB.getAttendanceRule();
        var html = '';
        html += '<div class="panel"><div class="panel-title">考勤规则配置</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">考勤异常检测将按此规则判定，节假日白名单内不判异常。</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">上班时间</div><div><input type="time" id="arWorkStart" value="' + esc(r.WorkStart) + '"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">下班时间</div><div><input type="time" id="arWorkEnd" value="' + esc(r.WorkEnd) + '"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">迟到判定</div><div><select id="arLate"><option value="0" ' + (r.LateThreshold === 0 ? 'selected' : '') + '>超过上班时间即迟到</option><option value="10" ' + (r.LateThreshold === 10 ? 'selected' : '') + '>宽限 10 分钟</option><option value="15" ' + (r.LateThreshold === 15 ? 'selected' : '') + '>宽限 15 分钟</option><option value="30" ' + (r.LateThreshold === 30 ? 'selected' : '') + '>宽限 30 分钟</option></select></div></div>';
        html += '<div class="detail-item wide"><div class="d-label">节假日白名单（YYYY-MM-DD，逗号分隔，节假日不判异常）</div><div><textarea id="arHolidays" rows="2" placeholder="如：2026-10-01,2026-10-02">' + esc((r.Holidays || []).join(',')) + '</textarea></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="arSave">保存规则</a></div>';
        html += '<div class="text-dim" style="margin-top:10px;font-size:12px;">最近更新：' + esc(r.UpdateTime || '—') + '（' + esc(r.UpdateBy || '—') + '）</div></div>';
        $(container).html(html);
        $('#arSave').off('click').on('click', function () {
            var h = $('#arHolidays').val().split(/[,，\s]+/).filter(function (x) { return x; });
            HRDB.updateAttendanceRule({
                WorkStart: $('#arWorkStart').val() || '09:00',
                WorkEnd: $('#arWorkEnd').val() || '18:00',
                LateThreshold: parseInt($('#arLate').val()) || 0,
                Holidays: h,
                UpdateBy: Session.user.EmployeeName
            });
            toast('考勤规则已保存', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('attendanceCenter'); }, 800);
        });
    };

    // ---------- 审批委托代理（主管 / 管理员） ----------
    VIEWS.delegation = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var isAdmin = (u.PermissionLevel === 3);
        var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive && (isAdmin || e.Department === u.Department); });
        var myDeleg = HRDB.getDelegations({ fromId: u.EmployeeID });
        var html = '';
        html += '<div class="panel"><div class="panel-title">设置审批委托</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">委托期间（如休假、出差），被委托人可代为审批你的待办事项，代理记录留痕。</div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">被委托人</div><div><select id="dgTo">' + emps.filter(function (e) { return e.EmployeeID !== u.EmployeeID; }).map(function (e) { return '<option value="' + e.EmployeeID + '">' + esc(e.EmployeeName) + '（' + esc(HRDB.getDeptName(e.Department)) + '）</option>'; }).join('') + '</select></div></div>';
        html += '<div class="detail-item"><div class="d-label">开始日期</div><div><input type="date" id="dgStart" value="' + HRDB.today() + '"/></div></div>';
        html += '<div class="detail-item"><div class="d-label">结束日期</div><div><input type="date" id="dgEnd" value="' + HRDB.today() + '"/></div></div>';
        html += '</div>';
        html += '<div style="margin-top:16px;"><a href="javascript:;" class="btn btn-primary" id="dgAdd">提交委托</a></div></div>';
        var all = isAdmin ? HRDB.getDelegations() : HRDB.getDelegations({ dept: u.Department });
        html += '<div class="panel"><div class="panel-title">委托记录' + (isAdmin ? '（全部）' : '（本部门）') + '（' + all.length + '）</div>';
        if (!all.length) {
            html += '<div class="empty-state"><div class="empty-ico">⇄</div>暂无委托记录</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>委托人</th><th>被委托人</th><th>有效期</th><th>状态</th><th class="op-cell">操作</th></tr></thead><tbody>';
            all.forEach(function (d) {
                html += '<tr><td>' + esc(d.FromName) + '</td><td>' + esc(d.ToName) + '</td><td>' + esc(d.StartDate) + ' ~ ' + esc(d.EndDate) + '</td><td>' + statusTag(d.Status) + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-danger" data-dgdel="' + d.DelegationID + '">撤销</a></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $(container).html(html);
        $('#dgAdd').off('click').on('click', function () {
            var s = $('#dgStart').val(), e = $('#dgEnd').val();
            if (!s || !e) { toast('请选择委托日期', 'error'); return; }
            if (e < s) { toast('结束日期不能早于开始日期', 'error'); return; }
            var to = HRDB.getEmployeeById($('#dgTo').val());
            HRDB.addDelegation({ FromID: u.EmployeeID, FromName: u.EmployeeName, ToID: to.EmployeeID, ToName: to.EmployeeName, Dept: u.Department, StartDate: s, EndDate: e });
            toast('委托已提交，生效期间 ' + to.EmployeeName + ' 可代审你的待办', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('approvalCenter'); }, 800);
        });
        $(container).find('a[data-dgdel]').off('click').on('click', function () {
            HRDB.deleteDelegation(parseInt($(this).data('dgdel')));
            toast('已撤销委托', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('approvalCenter'); }, 800);
        });
    };

    // ---------- 离职交接清单（管理员） ----------
    VIEWS.resignHandover = function (container) {
        container = container || '#appContent';
        var list = HRDB.getResignHandovers();
        var html = '';
        html += '<div class="panel"><div class="panel-title">离职交接管理</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">离职申请批准后自动生成交接清单，逐项确认完成后方可办理离岗。</div>';
        if (!list.length) {
            html += '<div class="empty-state"><div class="empty-ico">◈</div>暂无离职交接清单</div>';
        } else {
            list.forEach(function (h) {
                var done = h.Items.filter(function (i) { return i.Done; }).length;
                html += '<div class="panel" style="margin-bottom:12px;"><div class="panel-title">' + esc(h.EmployeeName) + '（' + esc(HRDB.getDeptName(h.Dept)) + '） · ' + done + '/' + h.Items.length + ' 项完成 <span class="tag ' + (h.Status === '已完成' ? 'tag-green' : 'tag-gold') + '">' + esc(h.Status) + '</span></div>';
                h.Items.forEach(function (it, i) {
                    html += '<div class="handover-item" data-hv="' + h.HandoverID + ':' + i + '"><span class="hv-check' + (it.Done ? ' on' : '') + '">' + (it.Done ? '✔' : '○') + '</span><span class="hv-name' + (it.Done ? ' done' : '') + '">' + esc(it.Name) + '</span></div>';
                });
                html += '</div>';
            });
        }
        html += '</div>';
        $(container).html(html);
        $(container).find('.handover-item').off('click').on('click', function () {
            var parts = $(this).data('hv').split(':');
            var hv = parseInt(parts[0]), idx = parseInt(parts[1]);
            var h = HRDB.getResignHandovers().find(function (x) { return x.HandoverID === hv; });
            if (!h) return;
            HRDB.updateHandoverItem(hv, idx, !h.Items[idx].Done);
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('hrService'); }, 500);
        });
    };

    // ---------- 组织架构图（管理员） ----------
    VIEWS.orgChart = function (container) {
        container = container || '#appContent';
        var depts = HRDB.getDepartments();
        var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive; });
        var html = '';
        html += '<div class="panel"><div class="panel-title">集团组织架构</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">部门树与汇报关系，点击主管名片可查看干员履历。</div>';
        html += '<div class="org-root"><div class="org-node org-ceo"><div class="org-name">哈夫克集团</div><div class="org-role">集团管理中心</div></div><div class="org-children">';
        depts.forEach(function (d) {
            var dEmps = emps.filter(function (e) { return e.Department === d.DepartmentCode; });
            var mgr = dEmps.find(function (e) { return e.PermissionLevel === 2; }) || dEmps.find(function (e) { return e.PermissionLevel === 3; });
            html += '<div class="org-dept"><div class="org-dept-name">' + esc(d.DepartmentName) + '</div><div class="org-dept-line"></div>';
            html += '<div class="org-emps">';
            if (mgr) {
                html += '<div class="org-node org-mgr" data-emp="' + mgr.EmployeeID + '"><div class="org-name">' + esc(mgr.EmployeeName) + '</div><div class="org-role">主管 · ' + esc(mgr.EmployeeID) + '</div></div>';
            }
            dEmps.filter(function (e) { return e.EmployeeID !== (mgr && mgr.EmployeeID); }).forEach(function (e) {
                html += '<div class="org-node" data-emp="' + e.EmployeeID + '"><div class="org-name">' + esc(e.EmployeeName) + '</div><div class="org-role">' + esc(PERM[e.PermissionLevel].name) + '</div></div>';
            });
            if (!dEmps.length) html += '<div class="org-empty">暂无成员</div>';
            html += '</div></div>';
        });
        html += '</div></div></div>';
        $(container).html(html);
        $(container).find('.org-node').off('click').on('click', function () {
            var e = HRDB.getEmployeeById($(this).data('emp'));
            if (!e) return;
            showModal('干员速览', '<p style="color:var(--havvk-text);">' + esc(e.EmployeeName) + '（' + e.EmployeeID + '）<br/>' + esc(HRDB.getDeptName(e.Department)) + ' · ' + esc(PERM[e.PermissionLevel].name) + '<br/>' + esc(e.Email || '') + '</p>',
                '<a href="javascript:;" class="btn btn-primary" id="ocView">查看完整履历</a><a href="javascript:;" class="btn" id="ocClose">关闭</a>');
            $('#ocView').off('click').on('click', function () { closeModal(); Session.tmpEmpId = e.EmployeeID; window.__archiveTab = 'ops'; showView('archive'); });
            $('#ocClose').off('click').on('click', closeModal);
        });
    };

    // ---------- 部门编制管理（管理员） ----------
    VIEWS.headcount = function (container) {
        container = container || '#appContent';
        var list = HRDB.getHeadcounts();
        var depts = HRDB.getDepartments();
        var html = '';
        html += '<div class="panel"><div class="panel-title">部门编制管理</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">设置各部门编制人数，实时对比在职人数，缺编自动预警。</div>';
        html += '<div class="toolbar"><select id="hcDept" class="search-input">' + depts.map(function (d) { return '<option value="' + d.DepartmentCode + '">' + esc(d.DepartmentName) + '</option>'; }).join('') + '</select><input type="number" id="hcNum" class="search-input" placeholder="编制人数" min="1" style="width:120px;"/><a href="javascript:;" class="btn btn-primary" id="hcSet">设置</a></div>';
        html += '<div id="hcBody" style="margin-top:14px;"></div></div>';
        $(container).html(html);
        function render() {
            var ls = HRDB.getHeadcounts();
            var h = '<div class="table-wrap"><table class="hr-table"><thead><tr><th>部门</th><th>编制人数</th><th>在职人数</th><th>缺编</th><th>状态</th><th>备注</th></tr></thead><tbody>';
            ls.forEach(function (r) {
                var cls = r.Gap > 0 ? 'tag-gold' : (r.Gap === 0 ? 'tag-green' : 'tag-red');
                var label = r.Gap > 0 ? '缺编 ' + r.Gap + ' 人' : (r.Gap === 0 ? '编制满员' : '超编 ' + (-r.Gap) + ' 人');
                h += '<tr><td>' + esc(HRDB.getDeptName(r.Dept)) + '</td><td>' + r.Headcount + '</td><td>' + r.Current + '</td><td>' + Math.max(0, r.Gap) + '</td><td><span class="tag ' + cls + '">' + label + '</span></td><td>' + esc(r.Note || '—') + '</td></tr>';
            });
            h += '</tbody></table></div>';
            $('#hcBody').html(h);
        }
        render();
        $('#hcSet').off('click').on('click', function () {
            var n = parseInt($('#hcNum').val());
            if (!n || n < 1) { toast('请输入有效的编制人数', 'error'); return; }
            HRDB.setHeadcount($('#hcDept').val(), n, '管理员设置');
            toast('编制已设置', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('orgManage'); }, 800);
        });
    };

    // ---------- 安全中心（管理员：高危复核 + 异常登录） ----------
    VIEWS.security = function () {
        var html = '';
        // 待复核队列
        var reviews = HRDB.getSecurityReviews();
        var pend = reviews.filter(function (r) { return r.Status === '待复核'; });
        html += '<div class="panel"><div class="panel-title">高危操作复核队列（' + pend.length + '）</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">批量删除、数据重置等高危操作需在此二次确认后才真正执行。</div>';
        if (!pend.length) {
            html += '<div class="empty-state"><div class="empty-ico">◈</div>当前无待复核操作</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>操作</th><th>详情</th><th>发起时间</th><th class="op-cell">操作</th></tr></thead><tbody>';
            pend.forEach(function (r) {
                html += '<tr><td><span class="tag tag-red">' + esc(r.Action) + '</span></td><td>' + esc(r.Detail) + '</td><td>' + esc(r.Time) + '</td><td class="op-cell"><a href="javascript:;" class="btn btn-sm btn-primary" data-secok="' + r.ReviewID + '">确认执行</a><a href="javascript:;" class="btn btn-sm" data-secno="' + r.ReviewID + '">取消</a></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        // 历史记录
        var done = reviews.filter(function (r) { return r.Status !== '待复核'; });
        html += '<div class="panel"><div class="panel-title">复核历史（' + done.length + '）</div>';
        if (done.length) {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>操作</th><th>状态</th><th>处理人</th><th>时间</th></tr></thead><tbody>';
            done.forEach(function (r) {
                html += '<tr><td>' + esc(r.Action) + '</td><td>' + statusTag(r.Status) + '</td><td>' + esc(r.Reviewer || '—') + '</td><td>' + esc(r.ReviewTime || '') + '</td></tr>';
            });
            html += '</tbody></table></div>';
        } else {
            html += '<div class="empty-state">暂无复核历史</div>';
        }
        html += '</div>';
        // 异常登录提醒
        var logs = HRDB.getAuditLogs({ action: '登录' });
        var abnormal = [];
        var seen = {};
        logs.forEach(function (l, i) {
            var t = l.Time || '';
            var key = t.slice(0, 16);
            if (seen[key]) abnormal.push(l);
            else seen[key] = 1;
            var hour = parseInt(t.slice(11, 13) || '0');
            if (hour >= 23 || hour < 5) abnormal.push(l);
        });
        html += '<div class="panel"><div class="panel-title">异常登录提醒（近 ' + logs.length + ' 条登录记录）</div>';
        if (!abnormal.length) {
            html += '<div class="empty-state"><div class="empty-ico">◈</div>未发现异常登录（同一分钟多账号切换 / 深夜 23:00-05:00 登录）</div>';
        } else {
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>时间</th><th>账号</th><th>提示</th></tr></thead><tbody>';
            abnormal.forEach(function (l) {
                var hour = parseInt((l.Time || '').slice(11, 13) || '0');
                var hint = (hour >= 23 || hour < 5) ? '深夜时段登录' : '同一分钟多账号切换';
                html += '<tr><td>' + esc(l.Time) + '</td><td>' + esc(l.OperatorName) + '</td><td><span class="tag tag-gold">' + hint + '</span></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        $('#appContent').html(html);
        $('#appContent a[data-secok]').off('click').on('click', function () {
            var id = parseInt($(this).data('secok'));
            var r = HRDB.getSecurityReviews().find(function (x) { return x.ReviewID === id; });
            if (!r) return;
            showModal('高危操作确认', '<p style="color:var(--havvk-text);">确认执行「' + esc(r.Action) + '」？' + esc(r.Detail) + '</p><p class="text-dim" style="font-size:12px;">该操作不可撤销，确认后将立即执行。</p>',
                '<a href="javascript:;" class="btn btn-danger" id="secOkGo">确认执行</a><a href="javascript:;" class="btn" id="secOkNo">返回</a>');
            $('#secOkGo').off('click').on('click', function () {
                HRDB.confirmSecurityReview(id, Session.user.EmployeeName);
                closeModal();
                if (r.Action === '数据重置') {
                    toast('正在恢复出厂数据…', 'success');
                    setTimeout(function () { HRDB.resetAllData(); location.reload(); }, 800);
                } else if (r.Action === '批量删除员工') {
                    var ids = (r._ids || '').split(',');
                    if (ids.length && ids[0]) HRDB.batchDelete(ids);
                    toast('已执行批量删除', 'success');
                    setTimeout(function () { showView('security'); }, 900);
                } else {
                    toast('操作已执行', 'success');
                    setTimeout(function () { showView('security'); }, 900);
                }
            });
            $('#secOkNo').off('click').on('click', closeModal);
        });
        $('#appContent a[data-secno]').off('click').on('click', function () {
            HRDB.cancelSecurityReview(parseInt($(this).data('secno')), Session.user.EmployeeName);
            toast('已取消该操作', 'success');
            setTimeout(function () { showView('security'); }, 800);
        });
    };

    // ---------- 部门周报自动汇总（主管） ----------
    VIEWS.deptWeekly = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive && e.Department === u.Department; });
        var att = HRDB.getAttendance();
        var monday = new Date();
        var day = monday.getDay() || 7;
        monday.setDate(monday.getDate() - day + 1);
        var weekStart = fmtDateStr(monday);
        var weekEnd = fmtDateStr(new Date());
        var weekAtt = att.filter(function (a) { return a.AttendanceDate >= weekStart && a.AttendanceDate <= weekEnd; });
        var late = 0;
        var rule = HRDB.getAttendanceRule();
        weekAtt.forEach(function (a) { if (a.CheckType === '上班' && a.AttendanceTime > rule.WorkStart) late++; });
        var missions = HRDB.getMissions().filter(function (m) { return emps.some(function (e) { return e.EmployeeID === m.EmployeeID; }); });
        var done = missions.filter(function (m) { return m.Status === '已评分'; }).length;
        var leaves = HRDB.getLeaves().filter(function (l) { return emps.some(function (e) { return e.EmployeeID === l.EmployeeID; }) && l.Status === '已批准' && (l.StartDate || '') >= weekStart; });
        var html = '';
        html += '<div class="panel"><div class="panel-title">部门周报自动汇总 · ' + esc(HRDB.getDeptName(u.Department)) + '</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">统计周期：' + weekStart + ' ~ ' + weekEnd + '（本周一至今）</div>';
        html += '<div class="stat-grid">';
        html += '<div class="stat-card"><div class="stat-num">' + emps.length + '</div><div class="stat-label">在编人数</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + weekAtt.length + '</div><div class="stat-label">打卡人次</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + late + '</div><div class="stat-label">迟到</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + leaves.length + '</div><div class="stat-label">请假申请</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + missions.length + '</div><div class="stat-label">任务总数</div></div>';
        html += '<div class="stat-card"><div class="stat-num">' + done + '/' + missions.length + '</div><div class="stat-label">任务完成</div></div>';
        html += '</div>';
        html += '<div class="panel"><div class="panel-title">周报文本（可复制发群）</div>';
        var text = '【' + HRDB.getDeptName(u.Department) + '周报 ' + weekStart + '~' + weekEnd + '】\n'
            + '· 在编 ' + emps.length + ' 人，本周打卡 ' + weekAtt.length + ' 人次，迟到 ' + late + ' 人次，请假 ' + leaves.length + ' 人次。\n'
            + '· 任务完成 ' + done + '/' + missions.length + '。\n'
            + '· 本周待关注：' + (late ? '迟到 ' + late + ' 人次需提醒。' : '考勤良好。') + (leaves.length ? '请假 ' + leaves.length + ' 人次，注意人员排班。' : '') + '\n'
            + '—— ' + u.EmployeeName + ' 于 ' + HRDB.fmtNow();
        html += '<textarea id="dwText" rows="8" style="width:100%;box-sizing:border-box;font-size:13px;line-height:1.8;">' + esc(text) + '</textarea>';
        html += '<div style="margin-top:10px;"><a href="javascript:;" class="btn btn-primary" id="dwCopy">复制周报</a></div></div></div>';
        $(container).html(html);
        $('#dwCopy').off('click').on('click', function () {
            var ta = $('#dwText')[0];
            ta.select();
            try { document.execCommand('copy'); toast('周报已复制', 'success'); }
            catch (e) { toast('复制失败，请手动复制', 'error'); }
        });
    };

    // ---------- 团队关怀提醒（主管） ----------
    VIEWS.careReminder = function () {
        var u = Session.user;
        var emps = HRDB.getEmployees().filter(function (e) { return e.IsActive && e.Department === u.Department; });
        var today = HRDB.today();
        var items = [];
        emps.forEach(function (e) {
            // 生日（Age 无法推导日期，按备注/Email 简化：用 CreatedAt 月日作为入职周年，生日用 Age 字段的备注）
            var created = e.CreatedAt || '';
            if (created && created.length >= 10) {
                var md = created.slice(5, 10);
                var nowMd = today.slice(5, 10);
                var days = daysUntilNext(md, nowMd);
                if (days <= 7) items.push({ type: '入职周年', emp: e, days: days, note: '加入哈夫克 ' + (parseInt(created.slice(0, 4)) ? (parseInt(today.slice(0, 4)) - parseInt(created.slice(0, 4))) : '?') + ' 周年' });
            }
            // 合同到期（30 天内）
            var cs = HRDB.getContracts().filter(function (c) { return c.EmployeeID === e.EmployeeID && (c.Status || '') === '履行中'; });
            cs.forEach(function (c) {
                var d = HRDB.daysUntil(c.EndDate);
                if (d >= 0 && d <= 30) items.push({ type: '合同到期', emp: e, days: d, note: c.Type + ' ' + c.EndDate + ' 到期' });
            });
        });
        // 转正：待审批转正流程提醒（部门内）
        HRDB.getWorkFlows().filter(function (w) { return w.Type === '转正' && w.Status === '待审批' && emps.some(function (e) { return e.EmployeeID === w.EmployeeID; }); }).forEach(function (w) {
            items.push({ type: '转正待批', emp: HRDB.getEmployeeById(w.EmployeeID) || { EmployeeName: w.EmployeeName }, days: 0, note: '转正申请待审批（' + (w.CreateTime || '').slice(0, 10) + '）' });
        });
        items.sort(function (a, b) { return a.days - b.days; });
        var html = '';
        html += '<div class="panel"><div class="panel-title">团队关怀提醒 · ' + esc(HRDB.getDeptName(u.Department)) + '</div>';
        html += '<div class="text-dim" style="margin-bottom:12px;">7 天内生日 / 入职周年 / 合同到期 / 转正待批自动聚合，点击可发消息关怀。</div>';
        if (!items.length) {
            html += '<div class="empty-state"><div class="empty-ico">♡</div>近期无待关怀事项</div>';
        } else {
            items.forEach(function (it) {
                var cls = it.type === '合同到期' ? 'tag-gold' : (it.type === '转正待批' ? 'tag-blue' : 'tag-green');
                html += '<div class="care-card" data-emp="' + it.emp.EmployeeID + '"><span class="tag ' + cls + '">' + esc(it.type) + (it.days > 0 ? ' ' + it.days + ' 天后' : '') + '</span><b>' + esc(it.emp.EmployeeName) + '</b><span class="care-note">' + esc(it.note) + '</span></div>';
            });
        }
        html += '</div>';
        $('#appContent').html(html);
        $('#appContent .care-card').off('click').on('click', function () {
            var e = HRDB.getEmployeeById($(this).data('emp'));
            if (!e) return;
            Session.chatTargetId = e.EmployeeID;
            showView('messages');
        });
        function daysUntilNext(mmdd, nowMmdd) {
            var y = parseInt(nowMmdd.slice(0, 2));
            var target = y + '-' + mmdd;
            var now = new Date(y, parseInt(nowMmdd.slice(3, 5)) - 1, parseInt(nowMmdd.slice(6, 8)));
            var t = new Date(y, parseInt(mmdd.slice(0, 2)) - 1, parseInt(mmdd.slice(3, 5)));
            var diff = Math.round((t - now) / 86400000);
            if (diff < 0) diff += 365;
            return diff;
        }
    };

    // ---------- 个人信息 / 账号登录记录 ----------
    // 哈夫克干员等级（结合绩效与工龄自动评定，基于游戏设定）
    function rankInfo(emp) {
        var level = emp.PermissionLevel;
        var maxScore = 0;
        HRDB.getReviews().forEach(function (r) {
            if (r.EmployeeID === emp.EmployeeID && r.PerformanceScore > maxScore) maxScore = r.PerformanceScore;
        });
        var years = 0;
        if (emp.CreatedAt) {
            var t = new Date(String(emp.CreatedAt).replace(' ', 'T'));
            if (!isNaN(t.getTime())) years = Math.max(0, Math.floor((Date.now() - t.getTime()) / 31536000000));
        }
        var rank, cls, star;
        if (level === 3) { rank = '集团指挥官'; cls = 'rank-admin'; star = '★'; }
        else if (level === 2) { rank = '行动队长'; cls = 'rank-mgr'; star = '◆'; }
        else if (maxScore >= 90) { rank = '精英干员'; cls = 'rank-elite'; star = '★★★'; }
        else if (maxScore >= 75 || years >= 2) { rank = '正式干员'; cls = 'rank-officer'; star = '★★'; }
        else { rank = '新进干员'; cls = 'rank-recruit'; star = '★'; }
        return { rank: rank, cls: cls, star: star, maxScore: maxScore, years: years };
    }

    // 头像工具：压缩为 128x128 居中裁剪（dataURL，离线可存）
    function resizeAvatar(file, cb) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                var s = 128, c = document.createElement('canvas');
                c.width = s; c.height = s;
                var ctx = c.getContext('2d');
                var min = Math.min(img.width, img.height);
                var sx = (img.width - min) / 2, sy = (img.height - min) / 2;
                ctx.drawImage(img, sx, sy, min, min, 0, 0, s, s);
                cb(c.toDataURL('image/jpeg', 0.82));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    function avatarImgHtml(emp, size) {
        if (emp.Avatar) {
            return '<img src="' + emp.Avatar + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;"/>';
        }
        return '<span>' + esc((emp.EmployeeName || '?').charAt(0).toUpperCase()) + '</span>';
    }
    function avatarBigHtml(emp, cls) {
        return '<div class="profile-av ' + (cls || '') + '">' + (emp.Avatar ? '<img src="' + emp.Avatar + '"/>' : '<span>' + esc((emp.EmployeeName || '?').charAt(0).toUpperCase()) + '</span>') + '</div>';
    }

    // 编辑个人信息（登录用户直接修改，保存即生效）
    function openEditProfile(emp) {
        var newAvatar = emp.Avatar || '';
        showModal('编辑个人信息',
            '<div class="pf-av-row">' +
            '<div class="profile-av sm" id="pfAvPrev">' + (newAvatar ? '<img src="' + newAvatar + '"/>' : '<span>' + esc((emp.EmployeeName || '?').charAt(0).toUpperCase()) + '</span>') + '</div>' +
            '<div style="flex:1;">' +
            '<div style="font-size:14px;color:var(--havvk-text);font-weight:700;">' + esc(emp.EmployeeName) + ' · ' + esc(emp.EmployeeID) + '</div>' +
            '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">' +
            '<a href="javascript:;" class="btn btn-sm" id="pfAvPick">选择图片</a>' +
            (newAvatar ? '<a href="javascript:;" class="btn btn-sm btn-danger" id="pfAvClear">移除头像</a>' : '') +
            '<input type="file" id="pfAvInput" accept="image/*" style="display:none;"/>' +
            '</div></div></div>' +
            '<div class="detail-grid">' +
            '<div class="detail-item"><div class="d-label">联系电话</div><div><input type="text" id="pfPhone" value="' + esc(emp.PhoneNumber || '') + '" maxlength="20"/></div></div>' +
            '<div class="detail-item"><div class="d-label">电子邮箱</div><div><input type="text" id="pfEmail" value="' + esc(emp.Email || '') + '" maxlength="50"/></div></div>' +
            '<div class="detail-item"><div class="d-label">性别</div><div><select id="pfGender"><option value="男">男</option><option value="女">女</option></select></div></div>' +
            '<div class="detail-item"><div class="d-label">年龄</div><div><input type="number" id="pfAge" value="' + (emp.Age || '') + '" min="16" max="70"/></div></div>' +
            '<div class="detail-item wide"><div class="d-label">备注</div><div><input type="text" id="pfRemarks" value="' + esc(emp.Remarks || '') + '" placeholder="选填" maxlength="60"/></div></div>' +
            '</div>',
            '<a href="javascript:;" class="btn btn-primary" id="pfSave">保存</a><a href="javascript:;" class="btn" id="pfCancel">取消</a>');
        $('#pfGender').val(emp.Gender || '男');
        $('#pfAvPick').off('click').on('click', function () { $('#pfAvInput').click(); });
        $('#pfAvInput').off('change').on('change', function () {
            var f = this.files && this.files[0];
            if (!f) { return; }
            if (f.type.indexOf('image/') !== 0) { toast('请选择图片文件', 'error'); return; }
            resizeAvatar(f, function (dataUrl) {
                newAvatar = dataUrl;
                $('#pfAvPrev').html('<img src="' + dataUrl + '"/>');
                if (!$('#pfAvClear').length) {
                    $('#pfAvPick').after('<a href="javascript:;" class="btn btn-sm btn-danger" id="pfAvClear">移除头像</a>');
                    $('#pfAvClear').off('click').on('click', function () {
                        newAvatar = '';
                        $('#pfAvPrev').html('<span>' + esc((emp.EmployeeName || '?').charAt(0).toUpperCase()) + '</span>');
                        $('#pfAvClear').remove();
                    });
                }
            });
        });
        $('#pfAvClear').off('click').on('click', function () {
            newAvatar = '';
            $('#pfAvPrev').html('<span>' + esc((emp.EmployeeName || '?').charAt(0).toUpperCase()) + '</span>');
            $('#pfAvClear').remove();
        });
        $('#pfSave').off('click').on('click', function () {
            var phone = $('#pfPhone').val().trim();
            var email = $('#pfEmail').val().trim();
            var gender = $('#pfGender').val();
            var age = parseInt($('#pfAge').val(), 10);
            if (!phone) { toast('请填写联系电话', 'error'); return; }
            if (email && email.indexOf('@') < 0) { toast('邮箱格式不正确', 'error'); return; }
            if (isNaN(age) || age < 16 || age > 70) { toast('请填写有效年龄（16-70）', 'error'); return; }
            HRDB.updateEmployee(emp.EmployeeID, { PhoneNumber: phone, Email: email, Gender: gender, Age: age, Remarks: $('#pfRemarks').val().trim(), Avatar: newAvatar });
            if (Session.user.EmployeeID === emp.EmployeeID) {
                Session.user.PhoneNumber = phone; Session.user.Email = email;
                Session.user.Gender = gender; Session.user.Age = age; Session.user.Avatar = newAvatar;
            }
            closeModal();
            toast('个人信息已更新', 'success');
            setTimeout(function () { showView('archive'); }, 700);
        });
        $('#pfCancel').off('click').on('click', closeModal);
    }

    // ================= V15 管理后台扩展视图 =================
    // ---------- 注册审批 ----------
    VIEWS.roleManage = function () {
        var u = Session.user;
        var roles = HRDB.getRoles();
        var emps = HRDB.getEmployees();
        var html = '<div class="panel"><div class="panel-title">角色管理 <span style="float:right;"><a href="javascript:;" class="btn btn-primary btn-sm" id="rlAdd">新建角色</a></span></div>';
        html += '<p class="text-dim" style="font-size:12px;margin-bottom:10px;">角色决定登录后可见的菜单与操作权限；内置三个角色为系统默认，可编辑导航白名单、不可删除管理员。</p>';
        html += '<table class="table"><thead><tr><th>角色ID</th><th>角色名称</th><th>权限级别</th><th>使用人数</th><th>导航权限</th><th>备注</th><th style="width:120px;">操作</th></tr></thead><tbody>';
        roles.forEach(function (r) {
            var cnt = emps.filter(function (e) { return e.RoleID === r.RoleID; }).length;
            var navCnt = r.AllowedNav ? r.AllowedNav.length : '默认全部';
            html += '<tr><td>' + r.RoleID + '</td><td>' + esc(r.RoleName) + '</td><td>L' + r.PermLevel + '</td><td>' + cnt + '</td><td>' + navCnt + '</td><td>' + esc(r.Remark || '—') + '</td>';
            html += '<td><a href="javascript:;" class="btn btn-sm" data-edit="' + r.RoleID + '">编辑</a> <a href="javascript:;" class="btn btn-sm" data-del="' + r.RoleID + '">删除</a></td></tr>';
        });
        html += '</tbody></table></div>';
        $('#appContent').html(html);

        var navOpts = '';
        Object.keys(NAV_DEF).forEach(function (k) {
            navOpts += '<label class="chk-inline"><input type="checkbox" class="rl-nav" value="' + k + '"/> ' + esc(NAV_DEF[k].title) + '</label>';
        });

        function openRoleModal(role) {
            var isEdit = !!role;
            showModal(isEdit ? '编辑角色：' + esc(role.RoleName) : '新建角色', '' +
                '<div class="form-group"><label>角色名称</label><input id="rlName" value="' + (isEdit ? esc(role.RoleName) : '') + '" placeholder="如：实习员工"/></div>' +
                '<div class="form-group"><label>权限级别</label><select id="rlLevel">' +
                '<option value="1"' + (isEdit && role.PermLevel === 1 ? ' selected' : '') + '>L1 普通员工</option>' +
                '<option value="2"' + (isEdit && role.PermLevel === 2 ? ' selected' : '') + '>L2 部门主管</option>' +
                '<option value="3"' + (isEdit && role.PermLevel === 3 ? ' selected' : '') + '>L3 系统管理员</option></select></div>' +
                '<div class="form-group"><label>备注</label><input id="rlRemark" value="' + (isEdit ? esc(role.Remark || '') : '') + '" placeholder="角色说明（可选）"/></div>' +
                '<div class="form-group"><label>导航白名单 <span class="text-dim">（不勾选=使用该级别的默认全部菜单）</span></label><div style="max-height:180px;overflow:auto;border:1px solid rgba(128,128,128,.25);border-radius:6px;padding:8px;">' +
                (isEdit && role.AllowedNav ? role.AllowedNav.map(function (k) { return '<label class="chk-inline"><input type="checkbox" class="rl-nav" value="' + k + '" checked/> ' + esc(NAV_DEF[k] ? NAV_DEF[k].title : k) + '</label>'; }).join('') : navOpts) +
                '</div></div>',
                '<a href="javascript:;" class="btn btn-primary" id="rlOk">保存</a><a href="javascript:;" class="btn" id="rlCancel">取消</a>');
            $('#rlOk').off('click').on('click', function () {
                var name = $('#rlName').val().trim();
                if (!name) { toast('请填写角色名称', 'error'); return; }
                var level = parseInt($('#rlLevel').val(), 10);
                var checked = $('.rl-nav:checked').map(function () { return this.value; }).get();
                var nav = checked.length ? checked : null;
                var r = isEdit ? HRDB.updateRole(role.RoleID, { RoleName: name, PermLevel: level, AllowedNav: nav, Remark: $('#rlRemark').val().trim() })
                    : HRDB.addRole({ RoleName: name, PermLevel: level, AllowedNav: nav, Remark: $('#rlRemark').val().trim() });
                toast(r.msg || '保存成功', r.ok ? 'success' : 'error');
                closeModal();
                setTimeout(function () { showView('roleManage'); }, 700);
            });
            $('#rlCancel').off('click').on('click', closeModal);
        }

        $('#appContent').off('click', '#rlAdd').on('click', '#rlAdd', function () { openRoleModal(null); });
        $('#appContent').off('click', '[data-edit]').on('click', '[data-edit]', function () {
            var rid = parseInt($(this).data('edit'), 10);
            openRoleModal(roles.find(function (x) { return x.RoleID === rid; }));
        });
        $('#appContent').off('click', '[data-del]').on('click', '[data-del]', function () {
            var rid = parseInt($(this).data('del'), 10);
            var r = HRDB.deleteRole(rid);
            toast(r.msg, r.ok ? 'success' : 'error');
            setTimeout(function () { showView('roleManage'); }, 700);
        });
    };

    // ---------- 评论管理 ----------
    // ---------- 内容管理（管理员：评论 / 图片） ----------
    VIEWS.contentAdmin = function () {
        renderTabsView([
            { key: 'comment', label: '评论管理' },
            { key: 'img', label: '图片管理' }
        ], {
            comment: function (c) { VIEWS.commentAdmin(c); },
            img: function (c) { VIEWS.imgManage(c); }
        }, 'comment');
    };

    VIEWS.commentAdmin = function (container) {
        container = container || '#appContent';
        var list = HRDB.getComments();
        var html = '<div class="panel"><div class="panel-title">评论管理 · 共 ' + list.length + ' 条</div>';
        html += '<p class="text-dim" style="font-size:12px;margin-bottom:10px;">员工对公告、知识文章的评论在此统一审核；删除为软删除（前台不再展示）。</p>';
        if (!list.length) { html += '<div class="empty">暂无评论</div>'; }
        else {
            html += '<table class="table"><thead><tr><th>作者</th><th>评论内容</th><th>目标</th><th>时间</th><th>状态</th><th style="width:80px;">操作</th></tr></thead><tbody>';
            list.slice().reverse().forEach(function (c) {
                var target = c.TargetType === '公告' ? '公告#' + c.TargetID : '知识#' + c.TargetID;
                html += '<tr><td>' + esc(c.AuthorName) + '</td><td>' + esc(c.Content) + '</td><td>' + target + '</td><td>' + esc(c.Time) + '</td><td>' + (c.Status === '正常' ? '<span class="tag tag-green">正常</span>' : '<span class="tag tag-red">已删除</span>') + '</td>';
                html += '<td>' + (c.Status === '正常' ? '<a href="javascript:;" class="btn btn-sm" data-del="' + c.CommentID + '">删除</a>' : '—') + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';
        $(container).html(html);
        $(container).off('click', '[data-del]').on('click', '[data-del]', function () {
            var id = parseInt($(this).data('del'), 10);
            var r = HRDB.deleteComment(id);
            toast(r.msg, r.ok ? 'success' : 'error');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('contentAdmin'); }, 700);
        });
    };

    // ---------- 图片管理 ----------
    VIEWS.imgManage = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var metas = HRDB.getImgMetas ? HRDB.getImgMetas() : [];
        var html = '<div class="panel"><div class="panel-title">图片管理 <span style="float:right;"><a href="javascript:;" class="btn btn-primary btn-sm" id="imUp">上传图片</a></span></div>';
        html += '<p class="text-dim" style="font-size:12px;margin-bottom:10px;">上传的图片存入本地媒体库（IndexedDB），可用于公告配图与宣传物料。共 ' + metas.length + ' 张。</p>';
        html += '<div class="img-grid" id="imGrid">';
        if (!metas.length) { html += '<div class="empty">暂无图片，点击右上角上传</div>'; }
        else {
            metas.slice().reverse().forEach(function (m) {
                html += '<div class="img-card" data-id="' + m.ImgID + '"><div class="img-thumb" data-b64="' + m.Thumb + '"><span>加载中…</span></div><div class="img-meta">' + esc(m.Name) + '<br/><span class="text-dim" style="font-size:11px;">' + esc(m.Uploader) + ' · ' + esc(m.Time) + '</span></div><a href="javascript:;" class="btn btn-sm btn-danger" data-rm="' + m.ImgID + '">删除</a></div>';
            });
        }
        html += '</div></div><input type="file" id="imFile" accept="image/*" style="display:none;"/>';
        $(container).html(html);
        // 缩略图直接渲染（meta 存 dataURL 缩略）
        $('#imGrid .img-thumb').each(function () {
            var b64 = $(this).data('b64');
            if (b64) $(this).html('<img src="' + b64 + '" style="max-width:100%;max-height:120px;border-radius:6px;"/>');
        });
        $(container).off('click', '#imUp').on('click', '#imUp', function () { $('#imFile').trigger('click'); });
        $('#imFile').off('change').on('change', function () {
            var f = this.files && this.files[0];
            if (!f) return;
            if (f.size > 4 * 1024 * 1024) { toast('图片不能超过 4MB', 'error'); return; }
            var reader = new FileReader();
            reader.onload = function (e) {
                var r = HRDB.addImgMeta ? HRDB.addImgMeta({ Name: f.name, Thumb: e.target.result, Uploader: u.EmployeeName, UploaderID: u.EmployeeID }) : null;
                if (r && r.ok) {
                    window.HRFiles.save({ name: f.name, type: f.type, size: f.size, blob: f });
                    toast('图片已上传', 'success');
                    setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('contentAdmin'); }, 700);
                }
            };
            reader.readAsDataURL(f);
        });
        $(container).off('click', '[data-rm]').on('click', '[data-rm]', function () {
            var id = parseInt($(this).data('rm'), 10);
            var r = HRDB.removeImgMeta ? HRDB.removeImgMeta(id) : null;
            toast(r && r.ok ? '图片已删除' : (r && r.msg) || '删除失败', r && r.ok ? 'success' : 'error');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('contentAdmin'); }, 700);
        });
    };

    // ---------- 登录日志 ----------
    VIEWS.loginLog = function (container) {
        container = container || '#appContent';
        var logs = HRDB.getLoginLogs(60);
        var html = '<div class="panel"><div class="panel-title">登录日志 · 最近 ' + logs.length + ' 条</div>';
        html += '<p class="text-dim" style="font-size:12px;margin-bottom:10px;">记录员工门户的全部登录行为；深夜（23:00-05:00）登录自动标记为异常时段。</p>';
        if (!logs.length) { html += '<div class="empty">暂无登录记录</div>'; }
        else {
            html += '<table class="table"><thead><tr><th>时间</th><th>账号</th><th>姓名</th><th>操作</th><th>详情</th><th>标记</th></tr></thead><tbody>';
            logs.forEach(function (l) {
                var hr = parseInt((l.Time || '').split(' ')[1] || '12', 10);
                var night = hr >= 23 || hr < 5;
                html += '<tr><td>' + esc(l.Time) + '</td><td>' + esc(l.OperatorID) + '</td><td>' + esc(l.OperatorName) + '</td><td>' + esc(l.Action) + '</td><td>' + esc(l.Detail || '—') + '</td><td>' + (night ? '<span class="tag tag-red">深夜登录</span>' : '<span class="tag tag-green">正常</span>') + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';
        $(container).html(html);
    };

    // ---------- 异常日志 ----------
    VIEWS.errorLog = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var logs = HRDB.getErrorLogs();
        var html = '<div class="panel"><div class="panel-title">异常日志 <span style="float:right;"><a href="javascript:;" class="btn btn-sm" id="elClear">清空日志</a></span></div>';
        html += '<p class="text-dim" style="font-size:12px;margin-bottom:10px;">window.onerror 自动捕获页面运行时异常；用于排查系统 bug 与兼容性问题。共 ' + logs.length + ' 条。</p>';
        if (!logs.length) { html += '<div class="empty">暂无异常记录</div>'; }
        else {
            html += '<table class="table"><thead><tr><th>时间</th><th>页面</th><th>来源</th><th>行号</th><th>异常信息</th></tr></thead><tbody>';
            logs.forEach(function (l) {
                html += '<tr><td>' + esc(l.Time) + '</td><td>' + esc(l.Page || '—') + '</td><td>' + esc(l.Source || '—') + '</td><td>' + (l.Line || 0) + '</td><td>' + esc(l.Message) + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        html += '</div>';
        $(container).html(html);
        $(container).off('click', '#elClear').on('click', '#elClear', function () {
            var r = HRDB.clearErrorLogs();
            toast(r.msg || '已清空', 'success');
            setTimeout(function () { if (window.__fusedRerender) window.__fusedRerender(); else showView('systemLog'); }, 700);
        });
    };

    // ---------- 网站配置 ----------
    // ---------- 系统设置（管理员：网站配置 / 数据备份 / 数据导出） ----------
    VIEWS.systemConfig = function () {
        renderTabsView([
            { key: 'site', label: '网站配置' },
            { key: 'backup', label: '数据备份' },
            { key: 'export', label: '数据导出' }
        ], {
            site: function (c) { VIEWS.siteConfig(c); },
            backup: function (c) { VIEWS.backup(c); },
            export: function (c) { VIEWS.export(c); }
        }, 'site');
    };

    VIEWS.siteConfig = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        var s = HRDB.getSettings();
        var html = '<div class="panel"><div class="panel-title">网站配置</div>';
        html += '<p class="text-dim" style="font-size:12px;margin-bottom:12px;">配置门户站点名称、主题色与页脚文案，保存后立即生效（主题色全局换肤）。</p>';
        html += '<div class="form-group"><label>站点名称</label><input id="scSite" value="' + esc(s.SiteName || '') + '" placeholder="网站标题"/></div>';
        html += '<div class="form-group"><label>主题色</label><input type="color" id="scColor" value="' + esc(s.ThemeColor || '#0e5fb7') + '" style="width:70px;height:34px;padding:2px;"/></div>';
        html += '<div class="form-group"><label>页脚文案</label><input id="scFooter" value="' + esc(s.FooterText || '') + '" placeholder="页脚版权信息"/></div>';
        html += '<div class="form-group"><label>最近更新</label><div class="text-dim" style="font-size:12px;">' + esc(s.UpdatedBy || '') + ' · ' + esc(s.UpdateTime || '—') + '</div></div>';
        html += '<a href="javascript:;" class="btn btn-primary" id="scSave">保存配置</a>';
        html += '</div>';
        $(container).html(html);
        $(container).off('click', '#scSave').on('click', '#scSave', function () {
            var r = HRDB.saveSettings({
                SiteName: $('#scSite').val().trim() || '哈夫克集团 · 员工门户系统',
                ThemeColor: $('#scColor').val() || '#0e5fb7',
                FooterText: $('#scFooter').val().trim(),
                UpdatedBy: u.EmployeeName
            });
            if (r.ok) {
                var s2 = HRDB.getSettings();
                document.title = s2.SiteName;
                $('.brand-sub').text(s2.SiteName.replace(' · 员工门户系统', ''));
                if ($('.topbar-user .uname').length) $('.topbar-user .uname').text(Session.user.EmployeeName);
                document.documentElement.style.setProperty('--havvk-primary', s2.ThemeColor);
                var f = $('#appFooter');
                if (f.length) f.text(s2.FooterText);
                toast('配置已保存并生效', 'success');
            }
        });
    };


    VIEWS.profile = function (container) {
        container = container || '#appContent';
        var u = Session.user;
        if (u.PermissionLevel === 3) {
            // 管理员：显示所有员工的登录账号与最近登录时间
            var emps = HRDB.getEmployees();
            var html = '';
            html += '<div class="panel"><div class="panel-title">员工账号登录记录<span style="float:right;"><a href="javascript:;" class="btn btn-sm" id="pfEditAdmin">编辑我的信息</a></span></div>';
            html += '<div class="table-wrap"><table class="hr-table"><thead><tr><th>员工工号</th><th>员工姓名</th><th>账号</th><th>所属部门</th><th>岗位角色</th><th>最近登录时间</th></tr></thead><tbody>';
            emps.forEach(function (e) {
                var role = PERM[e.PermissionLevel] ? PERM[e.PermissionLevel].name : '未知';
                html += '<tr><td>' + esc(e.EmployeeID) + '</td><td>' + esc(e.EmployeeName) + '</td><td>' + esc(e.EmployeeName) + '</td><td>' + esc(HRDB.getDeptName(e.Department)) + '</td><td>' + esc(role) + '</td><td>' + esc(e.LastLogin || '从未登录') + '</td></tr>';
            });
            html += '</tbody></table></div></div>';
            $(container).html(html);
            $('#pfEditAdmin').off('click').on('click', function () {
                var my = HRDB.getEmployeeById(u.EmployeeID) || u;
                openEditProfile(my);
            });
            return;
        }
        var emp = HRDB.getEmployeeById(u.EmployeeID) || u;
        var role = PERM[emp.PermissionLevel] ? PERM[emp.PermissionLevel].name : '未知';
        var ri = rankInfo(emp);
        var html = '';
        // 干员等级徽章
        html += '<div class="panel"><div class="panel-title">干员档案</div>';
        html += '<div class="rank-badge ' + ri.cls + '">';
        html += '<div class="rank-star">' + ri.star + '</div>';
        html += '<div class="rank-name">' + ri.rank + '</div>';
        html += '<div class="rank-sub">' + esc(emp.EmployeeName) + ' · ' + esc(HRDB.getDeptName(emp.Department)) + '</div>';
        html += '<div class="rank-metrics">';
        html += '<span>历史最佳绩效 ' + (ri.maxScore ? ri.maxScore.toFixed(1) : '—') + ' 分</span>';
        html += '<span>集团工龄 ' + ri.years + ' 年</span>';
        html += '</div>';
        html += '</div></div>';
        html += '<div class="panel"><div class="panel-title">我的个人信息<span style="float:right;"><a href="javascript:;" class="btn btn-sm" id="pfEditMe">编辑个人信息</a></span></div>';
        html += '<div class="profile-head">' + avatarBigHtml(emp) +
            '<div style="flex:1;min-width:150px;"><div style="font-size:16px;font-weight:700;color:#202020;">' + esc(emp.EmployeeName) + '</div>' +
            '<div class="text-dim" style="font-size:12px;margin-top:4px;">' + esc(emp.EmployeeID) + ' · ' + esc(HRDB.getDeptName(emp.Department)) + ' · ' + esc(role) + '</div>' +
            '<div style="margin-top:10px;"><a href="javascript:;" class="btn btn-sm" id="pfAvBtn">更换头像</a><input type="file" id="pfAvFile" accept="image/*" style="display:none;"/></div></div></div>';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><div class="d-label">员工姓名</div><div class="d-value">' + esc(emp.EmployeeName) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">员工工号</div><div class="d-value">' + esc(emp.EmployeeID) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">所属部门</div><div class="d-value">' + esc(HRDB.getDeptName(emp.Department)) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">岗位角色</div><div class="d-value">' + statusTag(role) + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">性别</div><div class="d-value">' + esc(emp.Gender || '—') + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">年龄</div><div class="d-value">' + (emp.Age ? emp.Age + ' 岁' : '—') + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">联系电话</div><div class="d-value">' + esc(emp.PhoneNumber || '—') + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">电子邮箱</div><div class="d-value">' + esc(emp.Email || '—') + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">入职时间</div><div class="d-value">' + esc((emp.CreatedAt || '').slice(0, 10) || '—') + '</div></div>';
        html += '<div class="detail-item"><div class="d-label">账户状态</div><div class="d-value">' + statusTag(emp.IsActive ? '在职' : '离职') + '</div></div>';
        html += '</div></div>';
        $(container).html(html);
        $('#pfEditMe').off('click').on('click', function () {
            openEditProfile(emp);
        });
        $('#pfAvBtn').off('click').on('click', function () { $('#pfAvFile').click(); });
        $('#pfAvFile').off('change').on('change', function () {
            var f = this.files && this.files[0];
            if (!f) { return; }
            if (f.type.indexOf('image/') !== 0) { toast('请选择图片文件', 'error'); return; }
            resizeAvatar(f, function (dataUrl) {
                HRDB.updateEmployee(emp.EmployeeID, { Avatar: dataUrl });
                if (Session.user.EmployeeID === emp.EmployeeID) Session.user.Avatar = dataUrl;
                toast('头像已更新', 'success');
                setTimeout(function () { showView('archive'); }, 600);
            });
        });
    };

    // ===================== 登录 =====================
    function doLogin(username, password) {
        var emp = HRDB.getEmployees().find(function (e) {
            return e.EmployeeName === username || e.EmployeeID === username;
        });
        if (!emp) {
            $('#loginError').text('用户不存在').show();
            return;
        }
        if (!emp.IsActive) {
            $('#loginError').text('账号已被禁用').show();
            return;
        }
        if (emp.Password !== password) {
            $('#loginError').text('密码错误').show();
            return;
        }
        $('#loginError').hide();
        // 单账户限制：同一浏览器同一时刻只允许登录一个账户
        var sess = readSession();
        if (sess && sess.EmployeeID && sess.EmployeeID !== emp.EmployeeID) {
            $('#loginError').text('当前已有账户「' + sess.EmployeeName + '」登录，请先退出登录').show();
            return;
        }
        HRDB.recordLogin(emp.EmployeeID); // 记录登录时间
        HRDB.setAuditOperator(emp); // 操作日志：记录当前操作人
        writeSession({ EmployeeID: emp.EmployeeID, EmployeeName: emp.EmployeeName, LoginAt: HRDB.fmtNow() });
        Session.user = emp;
        enterApp();
    }

    function enterApp() {
        var u = Session.user;
        $('#loginWrap').hide();
        $('#appLayout').css('display', 'block');
        $('#topName').text(u.EmployeeName);
        $('#topRole').text(PERM[u.PermissionLevel].name);
        $('#topAvatar').html(avatarImgHtml(u, 36));
        $('#sideUserInfo').html(esc(u.EmployeeName) + '<br/><span style="font-size:11px;">' + esc(u.EmployeeID) + ' · ' + esc(PERM[u.PermissionLevel].name) + '</span>');
        renderNav();
        showView(PERM[u.PermissionLevel].nav[0]);
        renderAlertBanner();
    }

    // 警报横幅（登录后顶部显示最新一条真实警报，可关闭）
    // V17 公司内网：演习类通知不走警报横幅（"没事不要亮"），仅真实警报显示
    function renderAlertBanner() {
        var list = HRDB.getAlerts().filter(function (x) { return (x.Title || '').indexOf('演习') < 0; });
        if (!list.length) return;
        var a = list[0];
        var colors = { '红': '#c04a4a', '橙': '#e8743b', '黄': '#e8a33d', '蓝': '#4aa3c4' };
        var color = colors[a.Level] || '#4aa3c4';
        if (!$('#alertBanner').length) {
            $('<div id="alertBanner"></div>').insertBefore('#appLayout .app-topbar');
        }
        $('#alertBanner').html(
            '<div style="background:' + color + ';color:#fff;padding:8px 16px;font-size:13px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
            '<b>『' + esc(a.Level) + '色警报』</b><span>' + esc(a.Title) + '：' + esc(a.Content) + '</span>' +
            '<a href="javascript:;" id="alertClose" style="margin-left:auto;color:#fff;font-weight:700;">✕ 关闭</a></div>'
        ).css('display', 'block');
        $('#alertClose').off('click').on('click', function () { $('#alertBanner').hide(); });
    }

    function doLogout() {
        Session.user = null;
        clearSession();
        window.__chatWith = null; // 清空对话定位，避免跨账户残留
        $('#loginWrap').show();
        $('#appLayout').hide();
        $('#loginUsername').val('');
        $('#loginPassword').val('');
        $('#loginError').hide();
        clearInterval(window.__clockTimer);
    }

    // ===================== 事件绑定 =====================
    $('#loginBtn').on('click', function () {
        doLogin($('#loginUsername').val().trim(), $('#loginPassword').val());
    });
    $('#loginPassword').on('keydown', function (e) {
        if (e.keyCode === 13) doLogin($('#loginUsername').val().trim(), $('#loginPassword').val());
    });
    $('.demo-chips .chip').on('click', function () {
        $('#loginUsername').val($(this).data('u'));
        $('#loginPassword').val($(this).data('p'));
        $('#loginError').hide();
    });
    $('#sideLogout').on('click', doLogout);
    $('#topbarPortal').on('click', function () { window.location.href = 'index.html'; });
    $('#modalClose').on('click', closeModal);
    $('#modalMask').on('click', function (e) { if (e.target === this) closeModal(); });
    $('#menuToggle').on('click', function () {
        $('#appSidebar').addClass('open');
        $('#sidebarMask').addClass('show');
    });
    $('#sidebarMask').on('click', function () {
        $('#appSidebar').removeClass('open');
        $(this).removeClass('show');
    });

    // 应用过滤条件（管理员员工管理）
    $(document).on('showViewApplied', function () { });

    // 全局发起对话：通讯录卡片 / 员工管理"消息"按钮（含权限校验）
    $(document).on('click', '[data-msg]', function () {
        var oid = $(this).data('msg');
        var me = Session.user;
        if (!me) return;
        var other = HRDB.getEmployeeById(oid);
        if (!other) return;
        if (me.EmployeeID === oid) { toast('不能给自己发消息', 'error'); return; }
        if (me.PermissionLevel !== 3 && !canChat(me, other)) {
            toast(me.PermissionLevel === 2 ? '仅支持与本部门员工或集团主管对话' : '仅支持与本部门成员对话', 'error');
            return;
        }
        window.__chatWith = oid;
        showView('messages');
    });

    // 全局异常捕获 → 异常日志（V15 日志管理）
    window.addEventListener('error', function (ev) {
        try {
            if (window.HRDB && HRDB.addErrorLog) {
                HRDB.addErrorLog(ev.message || '未知异常', ev.filename || '', ev.lineno || 0, location.pathname.split('/').pop());
            }
        } catch (e) { }
    });

    // 恢复上次登录会话（单账户：刷新后仍停留在同一账户）
    // 放在全部函数/变量定义与事件绑定之后，避免初始化中断
    var sess = readSession();
    if (sess && sess.EmployeeID) {
        var sessEmp = HRDB.getEmployeeById(sess.EmployeeID);
        if (sessEmp && sessEmp.IsActive) {
            Session.user = sessEmp;
            enterApp();
            toast('已恢复 ' + sessEmp.EmployeeName + ' 的登录会话');
        } else {
            clearSession(); // 账户已被删除或禁用，清除会话回登录页
        }
    }
});
