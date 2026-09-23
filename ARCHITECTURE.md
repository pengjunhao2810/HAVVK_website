# 哈夫克集团 · 融合网站系统说明文档

> 版本：v2.7（2026-09-22 V18 移除注册入口与警报静默交付后同步）
> 适用目录：`F:\柯睿\havvk_website`（本目录即网站根目录，全中文路径已清理，离线可运行）

---

## 一、项目定位与总体架构

### 1.1 项目是什么

「哈夫克集团」融合网站由 **三个相对独立的子系统** 组成，共用同一套设计语言（腾讯游戏《哈夫克》克隆风格：浅色云海底 + 深蓝渐变 + 方正兰亭字体），通过页面底部的"系统入口"弹窗互相跳转：

| 子系统 | 入口文件 | 定位 |
|---|---|---|
| **官网主站** | `index.html` | 品牌宣传页（视频/BGM/中英切换/轮播/加密文件柜展示） |
| **集团档案**（管理后台） | `admin.html` | 加密资料库（文件夹→文档→详情，带权限解锁） |
| **员工门户**（HR 系统） | `hr.html` | 人事业务系统（考勤/请假/任务/绩效/部门管理，三级权限） |

### 1.2 总体架构

```
┌─────────────────────────────────────────────────────────┐
│                   浏览器（file:// 或 http://）             │
├─────────────────────────────────────────────────────────┤
│  index.html  ←────┐     admin.html  ←────┐              │
│  (主站宣传页)      │     (集团档案后台)     │              │
│  js/index.js      │     js/admin3.js     │              │
│  js/swiper.js     │     js/offline-data.js              │
│  js/i18next.js    │     js/langan.js     │              │
│  js/lang-resources.js│   js/lang-resources.js            │
│                   │     └─ 底部入口弹窗 ──┼──┐           │
│  └── 底部入口弹窗 ──┼──────────────┐      │  │           │
│                     ▼              │      ▼  │           │
│                hr.html ────────────┘  (员工门户)          │
│                js/hr-app.js   ← 视图/交互层（12 模块）      │
│                js/hr-data.js  ← 数据层（localStorage）    │
│                js/hr-files.js ← 附件层（IndexedDB）       │
├─────────────────────────────────────────────────────────┤
│  数据持久化：localStorage(key=havvk_hr_db_v1) + IndexedDB │
│  原后端 API（dfx-back.7jing.com）不可达 → 已全部本地化      │
└─────────────────────────────────────────────────────────┘
```

### 1.3 关键架构决策

1. **纯前端 + 无服务器依赖**：整个网站在 `file://` 协议下双击即可离线运行，也可用任意静态服务器（`python -m http.server 8899`）托管。
2. **数据本地化三层**：
   - `localStorage`：HR 系统结构化业务数据（员工/部门/考勤/请假/任务/绩效），约 5MB 上限。
   - `IndexedDB`：任务附件文件（二进制 Blob），容量大、可持久化，key 名 `havvk_hr_files`。
   - `js/offline-data.js`：集团档案的资料库静态数据（文件夹/文档/详情），直接内联在 JS 中。
3. **前后端分离的模拟**：原 ASP.NET（.aspx + SQL Server）业务被重写为「视图层 hr-app.js + 数据层 hr-data.js」两层，逻辑上等价于前端 MVC。
4. **多语言**：i18next 库 + `lang-resources.js`（主站/后台）与 `locales/` JSON（备用）双通道，`file://` 下以内联语言包优先。
5. **原项目保留**：`legacy/` 存放原 ASP.NET 完整源码、数据库（Demo1.mdf）与建表脚本，作为业务逻辑的权威参考。

---

## 二、技术栈清单

### 2.1 运行时与语言

| 层 | 技术 |
|---|---|
| 前端语言 | HTML5 + CSS3 + 原生 JavaScript（ES5，兼容老内核） |
| DOM 库 | jQuery 1.11.3（本地化 `js/jquery-1.11.3.min.js`） |
| 轮播库 | Swiper（本地化 `js/swiper.js` + `css/swiper.css`） |
| 国际化 | i18next（本地化 `js/i18next.js`，语言包内联 `js/lang-resources.js`） |
| 存储 | Web Storage API（localStorage）+ IndexedDB API |
| 样式 | 自定义 `css/index.css`（主站+后台）、`css/hr.css`（HR 系统） |
| 字体 | 方正兰亭（`img/font_fzlth.woff / fzltzh / fzltth`）、`font_en.ttf`（英文） |
| 媒体 | `media/bgm.mp3`（背景音乐）、`media/video.mp4`（循环视频背景） |

### 2.2 legacy 原项目技术栈（参考/部署用）

| 项 | 值 |
|---|---|
| 后端框架 | ASP.NET WebForms（12 个 .aspx 页面）+ 少量 MVC（HomeController） |
| 语言 | C#（.cs）、HTML/ASPX 标记 |
| 数据库 | SQL Server（`legacy/database/Demo1.mdf`，建表脚本 `SQLQuery3.sql`） |
| 样式 | Bootstrap 3 + `Content/havvk-theme.css`（哈夫克浅色主题，已本地化） |
| 图表 | Chart.js（`Content/chart.min.js` 本地化） |

---

## 三、三个子系统的业务逻辑详解

### 3.1 官网主站（index.html）

**业务逻辑**：品牌展示页，无业务数据，纯展示 + 跳转门户。

- 视频背景循环播放、BGM 开关（`js/index.js`）
- 三段轮播（Swiper）：新世界愿景 / 技术突破 / 科研人员
- 中英文切换：`js/langan.js` 读取 `lang-resources.js` 语言包，通过 `data-i18n` 属性替换文案
- **系统入口弹窗**（自研改造）：页面底部 `.portal-open` 图片按钮 → 点击弹出 `#portalOverlay`（云海遮罩 + 白底登录框 + 集团 logo），两个按钮跳 `admin.html`（集团档案）与 `hr.html`（员工门户）

**调用的类/函数**：
- `js/index.js`：`$(function(){...})` 初始化轮播（`new Swiper`）、滚动动画（`toRightSmall` 等 class）、BGM 开关
- `js/langan.js`：`i18next.init` / `changeLanguage` / `jQuery.i18n` 挂载，响应 `#zh` / `#en` 点击
- 内联脚本：`$('#portalOpen')` 打开 / `$('#portalClose, #portalOverlay')` 关闭弹窗

### 3.2 集团档案管理后台（admin.html）

**业务逻辑**：加密资料库，登录后按「文件夹 → 文档列表 → 文档详情」三级浏览。

1. **登录**：`adminOverlay` 中账号 + 密码 → `admin3.js checkLogin()` 校验（**账号 `42847` / 密码 `time0926`**）。
2. **目录页**：登录成功 → `loadFolders()` 读取 `OFFLINE_DATA.folders` 渲染卡片；加密文件夹（`locked:true`）需输入密钥解锁。
3. **文档列表**：`loadDocuments(folderId)` 读取 `OFFLINE_DATA.documents[folderId]`；若文件夹加密则先校验 `folder_password`（密钥统一 `havvk`）。
4. **文档详情**：`loadDocumentDetail(docId)` 读取 `OFFLINE_DATA.details[docId]`；图片类型可点击放大（`doc-picbox`）+ 下载（`btn-down`）；部分文档二级加密（`verifyDocumentPassword`）。
5. **错误锁定**：`showPasswordError()` 输错密钥后 5 秒倒计时禁用输入。
6. **底部门户入口**（登录后显示 `#portalOpenAdmin`）：跳员工门户 `hr.html` / 返回主站 `index.html`；登出后隐藏。

**调用的类/函数（admin3.js）**：

| 函数 | 作用 | 检索参数 |
|---|---|---|
| `checkLogin(username,password,cb)` | 登录校验 | `username`(42847)、`password`(time0926) |
| `loadFolders()` | 渲染文件夹卡片 | `OFFLINE_DATA.folders[].id/name/icon/locked` |
| `loadDocuments(folderId)` | 渲染文档列表 | `folderId`；`OFFLINE_DATA.documents[folderId][]` |
| `loadDocumentDetail(docId)` | 渲染详情 | `docId`；`OFFLINE_DATA.details[docId]` |
| `verifyDocumentPassword(docId,password,cb)` | 文档密钥校验 | `OFFLINE_DATA.docPassword[docId]` |
| `renderFolders/renderDocuments` | DOM 渲染 | 列表数据 |
| `showPage(page)` | 页面切换 | `login / folder / doc_list / doc_detail` |

**数据源（offline-data.js，结构示例）**：
```js
var OFFLINE_DATA = {
  folders: [ { id:'f1', name:'人员伤亡事故调查', icon:'img/folder_icon1.png', locked:true, password:'havvk', maxlength:20 }, ... ],
  documents: { 'f1': [ { id:'d1', name:'事故调查报告-德穆兰', locked:false, type:'doc', src:'' }, ... ] },
  details: { 'd1': '…文档正文…' },
  docPassword: { 'd3': 'havvk' }
};
```

### 3.3 员工门户 HR 系统（hr.html）

**业务逻辑**：三级权限的人事业务系统，登录后按 `PermissionLevel` 进入不同工作台。

#### 3.3.1 权限模型（hr-app.js `PERM`）

| 权限值 | 角色 | 菜单规模 | 演示账号 |
|---|---|---|---|
| 1 | 普通员工 | 33 项（考勤/请假/任务/值班/日程/薪资/会议/报销/培训/文件柜/周报/设备/行政申请/知识库/投票/简报/警报/反馈/消息/通讯录/全局搜索/部门群聊/人事流程/打印单据/干员晋级/干员履历…） | `kr / 123456` |
| 2 | 部门主管 | 48 项（员工全部 + 反馈处理/任务下发/请假审批/绩效/部门报表/部门员工/行政审批/简报管理/技能矩阵/统一审批/考勤异常/考勤报表/审批代理/部门周报/团队关怀） | `dbh / 123456` |
| 3 | 管理员 | 58 项（用户管理/数据管理/内容管理/权限管理/日志管理/系统设置 六大模块，含注册审批/角色管理/评论管理/图片管理/登录日志/异常日志/网站配置） | `admin / admin` |

- 管理员视角：考勤/请假菜单显示"考勤记录/请假记录"（全量数据），不显示打卡与请假提交表单，个人信息页改为全员账号登录时间表。
- 菜单配置三处联动：`PERM[n].nav`（可见项）、`NAV_DEF`（图标/标题）、`NAV_GROUP`（分组名）；管理员菜单标题重名映射在 `renderNav`/`showView` 内处理。

#### 3.3.2 各功能板块的业务流

| 板块 | 视图函数（hr-app.js） | 数据函数（hr-data.js） | 业务流 |
|---|---|---|---|
| 登录 | `doLogin` / `enterApp` / `doLogout` | `getEmployees().find` | 校验姓名/工号+密码 → `recordLogin` 记登录时间 → 渲染权限菜单 |
| 工作台 | `VIEWS.dashboard` | `getEmployees` / `getLeaves` / `getAttendance` / `getReviews` | 欢迎语 + 快捷操作 + 最近入职 + 统计卡 |
| 我的考勤 | `VIEWS.attendance` | `getAttendance(empId)` / `addAttendance` | 员工：打卡上班/下班（同日同类型去重）；管理员：看全员记录 |
| 请假申请 | `VIEWS.leave` | `getLeaves(filter)` / `addLeave` | 员工/主管：提交表单 → 写入待审批；管理员：只看全部记录 |
| 请假审批 | `VIEWS.leaveApproval` | `getLeaves` / `approveLeave` | 主管：待审批列表 → 批准/拒绝/详情 |
| 我的任务 | `VIEWS.mission` | `getMissions(empId)` / `submitMission` | 员工：看任务 → 填写成果+上传附件 → 提交 |
| 任务下发 | `VIEWS.missionAdmin` | `getDeptMissions(deptId)` / `addMission` / `scoreMission` | 主管：下发任务（选员工+附件）→ 查收已提交 → 评分（同步写绩效表） |
| 绩效考核 | `VIEWS.review` | `getReviews(filter)` / `addReview` / `submitReview` | 主管：新增/编辑/提交/审核考核记录 |
| 部门报表 | `VIEWS.deptReport` | `getEmployees({department})` / `getReviews` / `getAttendance` / `getLeaves` | 主管：本部门统计 + 明细 + 自动总结 |
| 部门员工管理 | `VIEWS.deptEmployee` | `getEmployees({department})` / `addEmployee` / `updateEmployee` / `deleteEmployee` | 主管：本部门员工增删改查（同级主管不可操作） |
| 员工管理 | `VIEWS.employeeAdmin` | `getEmployees(filter)` / `batchUpdateStatus` / `batchDelete` | 管理员：全量 CRUD + 批量操作 + 表格导入 + 通讯录一键对话 |
| 部门管理 | `VIEWS.departmentAdmin` | `getDepartments` / `addDepartment` / `updateDepartment` / `deleteDepartment` | 管理员：部门增删改查（有在职员工不可删） |
| 个人信息 | `VIEWS.profile` | `getEmployeeById` / `getEmployees` / `recordLogin` | 员工/主管：本人详情（可编辑+自定义头像）；管理员：全员登录时间表 |
| 消息中心 | `VIEWS.message` | `getConversations` / `addMessage` / `markPairRead` | 员工同部门/主管跨部门主管/管理员全局对话；整卡点击进聊天；图片/文件/文件柜三种附件；固定高度+移动端单列 |
| 值班排班 | `VIEWS.duty` | `getDuties(filter)` / `addDuty` / `deleteDuty` | 员工看自己的班表；主管/管理员编排本部门/全局 |
| 意见反馈 | `VIEWS.feedback` | `getFeedbacks` / `addFeedback` | 员工提交；主管/管理员处理回复 |
| 差旅报销 | `VIEWS.expense` | `getExpenses(filter)` / `addExpense` / `approveExpense` | 提交 → 主管/管理员审批 |
| 培训中心 | `VIEWS.training` | `getTrainings` / `enrollTraining` / `completeTraining` | 报名 → 学习 → 完成；主管/管理员发布课程 |
| 资料变更 | `VIEWS.profileUpdate` | `getProfileUpdates` / `addProfileUpdate` / `approveProfileUpdate` | 申请改资料 → 批准后同步主数据 |
| 文件柜 | `VIEWS.fileVault` | `getFileVault(filter)` / `addFileVault` + `HRFiles` | 个人/部门共享/集团；IndexedDB 存文件；管理员可看全员个人文件 |
| 工作周报 | `VIEWS.weeklyReport` | `getWeeklyReports` / `addWeeklyReport` / `reviewWeeklyReport` | 员工提交周报 → 主管/管理员点评 |
| 设备申领 | `VIEWS.equipment` | `getEquipRequests` / `addEquipRequest` / `approveEquipRequest` | 员工申请 → 主管/管理员发放/驳回 |
| 员工嘉奖 | `VIEWS.recognition` | `getRecognitions` / `addRecognition` | 主管/管理员发布，全员可见嘉奖墙 |
| 数据看板 | `VIEWS.stats` | `getEmployees` / `getAttendance` / `getLeaves` / `getReviews` / `getTrainingEnrolls` | 管理员：概览卡 + 部门分布/打卡趋势/请假统计/绩效TOP5/培训完成率（纯 CSS 图表，离线可用） |
| 我的薪资 | `VIEWS.salary` | `getSalaries({employeeId})` | 本人月度明细（基本/绩效/补贴/扣款/实发） |
| 薪资管理 | `VIEWS.salaryAdmin` | `getSalaries` / `addSalary` / `deleteSalary` | 管理员录入/删除全员薪资，同员工同月去重 |
| 会议管理 | `VIEWS.meeting` | `getMeetings` / `addMeeting` / `deleteMeeting` | 发起（选参会人）→ 会议室时段冲突拦截 → 我的会议/详情/取消 |
| 数据导出 | `VIEWS.export` | `csvDownload` + 各 `getXxx` | 管理员：员工/考勤/请假/报销/薪资/资产 6 种 CSV（UTF-8 BOM 防乱码） |
| 合同管理 | `VIEWS.contract` | `getContracts` / `addContract` / `updateContract` / `getExpiringContracts` | 录入合同 → 剩余天数标记 → 30 天内到期进待办提醒 |
| 日程日历 | `VIEWS.schedule` | `getSchedules(filter)` / `addSchedule` / `deleteSchedule` | 月历网格（个人/部门/集团可见性）→ 点日期看当日日程 |
| 知识库 | `VIEWS.knowledge` | `getKnowledge(filter)` / `addKnowledge` / `viewKnowledge` | 分类+搜索 → 点击展开正文并计阅读；主管/管理员发布 |
| 投票问卷 | `VIEWS.poll` | `getPolls` / `addPoll` / `votePoll` | 全员发起/参与；截止后自动显示结果；已投则实时条形 |
| 固定资产 | `VIEWS.asset` | `getAssets(filter)` / `addAsset` / `updateAsset` / `deleteAsset` | 管理员：台账登记/状态流转（在库/在用/维修/报废）/领用人 |
| 行政申请 | `VIEWS.adminRequest` | `getAdminRequests` / `addAdminRequest` | 用车/用印提交 → 主管/管理员审批（待办聚合） |
| 行政审批 | `VIEWS.adminReqApproval` | `approveAdminRequest` | 主管本部门/管理员全局审批 |
| 任务简报 | `VIEWS.briefing` | `getBriefings` / `submitBriefingReport` | 主管发布行动简报 → 员工回传行动报告 |
| 简报管理 | `VIEWS.briefingAdmin` | `addBriefing` / `finishBriefing` / `deleteBriefing` | 发布（本部门/集团 ALL）→ 查看回传报告 → 标记完成 |
| 技能矩阵 | `VIEWS.skill` | `getSkillDefs` / `setSkillLevel` / `addSkillDef` | 主管（本部门）/管理员（全员）维护 ★1-5 掌握度 |
| 演习警报 | `VIEWS.alert` | `getAlerts` / `addAlert` / `deleteAlert` | 管理员发布蓝/黄/橙/红警报 → 全员登录顶部横幅提醒（可关闭） |
| 全局搜索 | `VIEWS.globalSearch` | `getEmployees` / `getAnnouncements` / `getKnowledge` / `getFileVault` / `getSchedules` / `getAlerts` | 跨表检索（员工/公告/知识/文件/日程/警报）→ 结果分组卡片 → 点击跳转对应视图 |
| 部门群聊 | `VIEWS.groupChat` | `getGroupMessages(dept)` / `addGroupMessage` | 按部门聚合群消息；员工/主管固定本部门群，管理员可切换任意部门群；Enter 发送 |
| 人事流程 | `VIEWS.workflow` | `getWorkFlows` / `addWorkFlow` | 员工发起转正/离职申请（Content 说明）→ 主管/管理员在统一审批中心审批 |
| 打印单据 | `VIEWS.printForm` | `getLeaves` / `getExpenses` | 请假单/报销单 → `window.open` 生成打印版单据（表格化）→ 自动 `window.print()` |
| 干员晋级 | `VIEWS.rankUpgrade` | `getAdvanceRequests` / `addAdvanceRequest` / `rankInfo` | 依据干员等级链（新进→正式→精英→行动队长）发起晋级申请 → 审批中心批准 |
| 干员履历 | `VIEWS.operatorProfile` | `getReviews` / `getSkillDefs` / `getSkillLevels` / `getRecognitions` / `getBriefings` / `getAdvanceRequests` / `rankInfo` | 聚合档案：等级徽章/绩效/技能/嘉奖/行动报告/晋级历史；员工看自己、主管看本部门、管理员全员 |
| 统一审批中心 | `VIEWS.approvalHub` | `approveLeave` / `approveExpense` / `approveEquipRequest` / `approveAdminRequest` / `approveProfileUpdate` / `approveAdvanceRequest` / `approveWorkFlow` | 7 类待审批聚合（请假/报销/设备/行政/资料变更/晋级/人事流程）；主管本部门、管理员全局，一键批准/驳回 |
| 考勤异常检测 | `VIEWS.attendanceAbnormal` | `getAttendance` / `getEmployees` | 本地推导：上班卡 >09:00=迟到、有上班无下班=漏下班卡、有下班无上班=漏上班卡；可选日期区间 |
| 数据备份 | `VIEWS.backup` | `exportAllData` / `importAllData` / `resetAllData` | 导出全库 JSON 文件 / 导入覆盖恢复 / 恢复出厂种子（二次确认模态）；导入恢复自动审计 |
| 操作日志 | `VIEWS.auditLog` | `getAuditLogs({action,keyword})` | 管理员审计回溯：登录/员工增删改/薪资/合同/资产/晋级/流程/恢复重置，上限 500 条，按操作+关键词筛选 |
| 集团战报 | `VIEWS.warReport` | `getAttendance` / `getLeaves` / `getMissions` / `getAlerts` | 管理员日报：在职/今日打卡/出勤率/请假/待审批/任务完成 + 近 7 天打卡趋势条 + 一键复制战报文本 |
| 考勤报表 | `VIEWS.attendanceReport` | `getAttendance` / `getLeaves` / `getAttendanceRule` | 月度汇总（出勤/迟到/漏卡/请假）；主管本部门、管理员全局；打印报表（window.open 打印版） |
| 考勤规则 | `VIEWS.attendanceRule` | `getAttendanceRule` / `updateAttendanceRule` | 管理员配置上下班时间/迟到宽限/节假日白名单；考勤异常检测动态读取 |
| 审批代理 | `VIEWS.delegation` | `getDelegations` / `addDelegation` / `deleteDelegation` | 主管/管理员设置生效期代理；委托记录留痕+审计 |
| 离职交接 | `VIEWS.resignHandover` | `getResignHandovers` / `updateHandoverItem` | 离职流程批准后自动生成交接清单（4 项），逐项勾选完成；管理员跟踪 |
| 组织架构 | `VIEWS.orgChart` | `getDepartments` / `getEmployees` / `getEmployeeById` | 部门树+汇报关系卡片，点击名片弹干员速览 → 跳干员履历 |
| 编制管理 | `VIEWS.headcount` | `getHeadcounts` / `setHeadcount` | 部门编制数 vs 在职数实时对比，缺编/超编/满员状态预警 |
| 安全中心 | `VIEWS.security` | `getSecurityReviews` / `confirmSecurityReview` / `cancelSecurityReview` / `getAuditLogs` | 高危操作（批量删除/数据重置）两步复核队列 + 复核历史 + 异常登录提醒（同分钟多账号/深夜登录） |
| 部门周报 | `VIEWS.deptWeekly` | `getAttendance` / `getMissions` / `getLeaves` / `getAttendanceRule` | 主管一键聚合本周部门考勤/任务/请假 → 生成可复制周报文本 |
| 团队关怀 | `VIEWS.careReminder` | `getEmployees` / `getContracts` / `getWorkFlows` / `daysUntil` | 7 天内入职周年/合同到期/转正待批自动聚合，点击卡片直达聊天关怀 |

#### 3.3.3 任务闭环（重点自研功能）

```
主管(dbh)                         员工(kr)                       主管(dbh)
  │ addMission(emp,内容,截止,附件)    │ submitMission(id,内容,附件)    │ scoreMission(id,分,评语)
  ▼                                ▼                             ▼
任务(待执行) ───────────────────► 任务(已提交) ──────────────────► 任务(已评分)
                                                                    │
                                                                    ▼
                                          绩效表新增记录(当前季度, 状态=已审核)
```

**状态机**：`待执行 → 已提交 → 已评分`；数据字段 `Status / SubmitContent / SubmitTime / Score / ScoreComment / ScoreTime / Attachments / SubmitAttachments`。

#### 3.3.4 数据表结构（hr-data.js `seed()`，即 localStorage 中的库）

| 表（数组） | 主键 | 关键字段 |
|---|---|---|
| `employees` | EmployeeID | EmployeeName, Department, PermissionLevel(1/2/3), Password, IsActive, LastLogin, Email, Phone, Avatar |
| `departments` | DepartmentID | DepartmentCode, DepartmentName, ManagerID, IsActive |
| `attendance` | ID | EmployeeID, EmployeeName, AttendanceDate, AttendanceTime, CheckType(上班/下班打卡) |
| `leaves` | LeaveID | EmployeeID, LeaveType, StartDate, EndDate, Days, Reason, Status(待审批/已批准/已拒绝), ApproverID |
| `missions` | ID | EmployeeID, MissionContent, MissionDeadline, Status(待执行/已提交/已评分), SubmitContent, Score, ScoreComment, Attachments[] |
| `reviews` | ReviewID | EmployeeID, ReviewPeriod, PerformanceScore, KPICompletion, WorkQuality, Status(待提交/已提交/已审核) |
| `announcements / milestones / duties / feedbacks / expenses / trainings / trainingEnrolls / profileUpdates / fileVault / weeklyReports / equipRequests / recognitions / messages` | 各自 ID | 集团公告/大事记/值班/反馈/报销/培训/报名/资料变更/文件柜(元数据)/周报/设备申领/嘉奖/站内消息 |
| `salaries` | SalaryID | EmployeeID, Month, Base, Performance, Allowance, Deduction, Note |
| `meetings` | MeetingID | Title, Room, Start, End, OrganizerID, Participants[], Summary |
| `contracts` | ContractID | EmployeeID, Type, StartDate, EndDate, Status(履行中/已续签/已终止) |
| `schedules` | ScheduleID | Title, Date, Time, Type(个人/部门/集团), Scope, OwnerID |
| `knowledge` | KbID | Title, Category, Content, AuthorID, Views |
| `polls` | PollID | Title, Options[{text,count}], CreatorID, Expire, VotedBy[] |
| `assets` | AssetID | Name, Category, SN, Status(在库/在用/维修/报废), OwnerID, Dept |
| `adminRequests` | ReqID | Type(用车/用印), Title, Reason, UseDate, ApplicantID, Status, ApproveNote |
| `briefings` | BriefID | Title, Mission, Dept(部门/ALL), Status(待执行/进行中/已完成), Reports[{EmployeeID,Content,Time}] |
| `skillDefs / skillLevels` | SkillID | 技能定义(Name/Category) + 员工掌握度(SkillID, EmployeeID, Level 1-5) |
| `alerts` | AlertID | Title, Level(蓝/黄/橙/红), Content, CreatorID |
| `auditLogs` | LogID | OperatorID, OperatorName, Action(登录/新增员工/晋级审批…), Target, Detail, Time；上限 500 条，写操作自动埋点 |
| `advanceRequests` | AdvID | EmployeeID, FromRank, ToRank, Reason, Status(待审批/已通过/已驳回), ApproveBy, ApproveNote, ApproveTime |
| `workFlows` | FlowID | EmployeeID, Type(转正/离职), Content, Status(待审批/已批准/已驳回), ApproveBy, ApproveNote, ApproveTime |
| `groupMessages` | MsgID | Dept, FromID, FromName, Content, Time |
| `attendanceRules` | RuleID | WorkStart, WorkEnd, LateThreshold(分钟), Holidays[](节假日白名单), UpdateBy, UpdateTime；单条配置 |
| `approvalDelegations` | DelegationID | FromID, FromName, ToID, ToName, Dept, StartDate, EndDate, Status(生效中) |
| `resignHandovers` | HandoverID | FlowID, EmployeeID, Dept, Items[{Name,Done}], Status(进行中/已完成)；离职批准自动生成 |
| `deptHeadcounts` | HCID | Dept, Headcount(编制), Note；在职数/缺编实时计算 |
| `securityReviews` | ReviewID | Action(批量删除员工/数据重置), Detail, Status(待复核/已执行/已取消), Requester, Reviewer, Time |
| `roles` | RoleID | RoleName, PermLevel, AllowedNav[](null=默认全部), Remark；内置 3 角色 |
| `regRequests` | ReqID | Name, Gender, Department, Position, Phone, Email, Reason, Status(待审批/已通过/已驳回), RequestTime, ApproverID |
| `comments` | CommentID | TargetType(公告/知识), TargetID, Content, AuthorID, AuthorName, Time, Status(正常/已删除) |
| `settings` | —(单对象) | SiteName, ThemeColor, FooterText, UpdatedBy, UpdateTime |
| `errorLogs` | ErrID | Message, Source, Line, Time, Page；window.onerror 自动捕获 |
| `imgVault` | ImgID | Name, Thumb(dataURL 缩略), Uploader, UploaderID, Time；blob 存 IndexedDB |
| `dashPrefs` | —(per-user map) | key=EmployeeID → { quick:[视图key], panels:{quick/stats/announce/recent} }；无记录时按角色默认 |

**持久化 key**：`havvk_hr_db_v1`（localStorage，约 34 张表）；**附件库**：IndexedDB `havvk_hr_files`（store `files`，keyPath `id`，`window.HRFiles.save/get/remove` Promise API）；**迁移机制**：`load()` → `migrateAdmin()`，自动补旧库缺失的任意新表（`if (!oldDb.xxx) oldDb.xxx = seed().xxx`），兼容老浏览器数据；**审计操作人**：登录成功后 `setAuditOperator(emp)` 设置闭包变量，`recordAudit(action,target,detail)` 统一写入。

---

## 四、每个功能板块"检索了什么参数"速查表

> 即各板块查询/过滤/校验所依据的入参。

| 板块 | 检索/校验参数 | 说明 |
|---|---|---|
| 集团档案登录 | `username=42847`, `password=time0926` | 硬编码校验 |
| 集团档案文件夹 | `folderId`, `folder.password='havvk'`, `maxlength` | 加密文件夹解锁密钥 |
| 集团档案文档 | `docId`, `OFFLINE_DATA.docPassword[docId]` | 文档二级密钥 |
| HR 登录 | `EmployeeName===输入` 或 `EmployeeID===输入`, `Password===输入`, `IsActive===true` | 姓名/工号 + 密码 |
| 考勤打卡 | `EmployeeID`, 同日同 `CheckType` 去重 | `getAttendance` 按员工过滤 |
| 请假查询 | `filter.status / leaveType / keyword` | `getLeaves(filter)` 多条件 |
| 请假审批 | `LeaveID`, `Status==='待审批'` | 批准/拒绝写回 |
| 任务下发 | `deptId`（主管部门），`getDeptMissions` 按部门过滤 | 员工下拉取自本部门在职 |
| 任务评分 | `mission.Status==='已提交'`, `score∈[0,100]` | 评分后同步绩效表 |
| 部门报表 | `Department===主管部门`, 周期/绩效汇总 | 员工明细过滤 |
| 员工管理筛选 | `filter.department(=dept,兼容旧dept)`, `filter.status`, `filter.keyword` | 三条件组合查询 |
| 批量操作 | `ids[]`, `IsActive` | 批量启用/停用/删除 |
| 个人信息 | `EmployeeID` | 管理员版遍历全员 + `LastLogin` |
| 消息中心 | `FromID/ToID`, `Read` | 会话按对方聚合；`canChat(from,to)` 权限（员工同部门/主管+主管/管理员全局）；文件柜发送引用 `FileID` |
| 数据看板 | 全表聚合 | `getAttendance()` 按 `AttendanceDate+CheckType==='上班'` 计数；培训按 `getTrainingEnrolls()` 关联员工部门 |
| 薪资 | `filter.employeeId / month` | 员工只查自己；管理员全量；同员工同月录入去重 |
| 会议冲突 | `Room`, `Start/End`（T→空格统一） | `!(end<=m.Start || start>=m.End)` 判定占用 |
| CSV 导出 | 各表全量 | 6 种文件，`\ufeff` BOM 防 Excel 乱码 |
| 合同到期 | `daysUntil(EndDate)`, `0<=d<=30` | 进待办 + 列表黄标/红标 |
| 日程可见性 | `Type(个人/部门/集团)` + `Scope` | 个人=OwnerID 本人；部门=Scope 本部门；集团=全员 |
| 知识库 | `filter.category / keyword` | 标题+内容模糊搜索；`viewKnowledge` 阅读+1 |
| 投票 | `VotedBy.includes(employeeId)` | 防重复投票；`Expire < today` 截止 |
| 资产 | `filter.dept / status` | 台账筛选；状态流转记录更新时间 |
| 行政申请 | `filter.type / status / department` | 主管按本部门过滤；管理员全局 |
| 简报可见性 | `Dept===本部门 或 'ALL'` | 员工按本人部门过滤；主管管理含集团简报 |
| 技能矩阵 | `SkillID + EmployeeID` | 主管仅本部门员工行；管理员全员 |
| 警报横幅 | `getAlerts()[0]`（按时间排序） | 登录后顶部渲染最新一条，可关闭 |
| 全局搜索 | `keyword` 小写模糊匹配各表 `Name/Title/Content` | 员工(姓名/工号)、公告(标题/内容)、知识(标题/内容)、文件(文件名)、日程(标题/备注)、警报(标题/内容)，各取前 N 条 |
| 部门群聊 | `Dept===当前部门`（管理员可传任意部门码） | `getGroupMessages(dept)` 按时间升序 |
| 人事流程 | `Status==='待审批'` + `Department===主管部门` | 发起记录 `Type/Content`；审批中心统一批准/驳回 |
| 干员晋级 | `rankInfo(emp)` 推等级 → `ToRank` 取下一级 | 员工/主管发起；管理员/主管审批 |
| 统一审批 | 各表 `Status==='待审批'` 聚合 | 主管按 `Department===本部门`；管理员全局；7 类各自主键（LeaveID/ExpenseID/ReqID/UpdateID/AdvID/FlowID） |
| 考勤异常 | `AttendanceDate` 分组 + `CheckType`（上班/下班） | 上班 `>09:00` 迟到；有上班无下班=漏下班卡；无上班有下班=漏上班卡；默认近 7 天 |
| 数据备份 | 全库 JSON 导出 / 导入覆盖 / 重置 | 导入校验 `backup.version` 字段；恢复/重置触发审计 |
| 操作日志 | `filter.action`（精确）+ `filter.keyword`（模糊） | 按 `Action/Target/Detail/OperatorName` 检索 |
| 集团战报 | 当日聚合 | 打卡数按 `AttendanceDate===today && CheckType==='上班'`；请假按起止日期包含今天 |
| 考勤报表 | `filter.month`（YYYY-MM）+ 部门/全局 | 出勤天数按 `AttendanceDate` 前缀分组；迟到按规则 `WorkStart+LateThreshold`；打印走 window.open |
| 考勤规则 | 单条 `attendanceRules[0]` | `WorkStart/WorkEnd/LateThreshold/Holidays`；异常检测动态引用 |
| 审批代理 | `FromID===当前用户`（本人）/ `Dept===主管部门` | 生效条件 `Status==='生效中' && StartDate<=today<=EndDate` |
| 离职交接 | `FlowID===批准离职的流程` | 批准时 `addResignHandover` 自动生成 4 项；逐项勾选全完成 → 状态已完成 |
| 组织架构 | `DepartmentCode` 分组 + `PermissionLevel` | 主管（2/3 级）名片高亮，点击按 `EmployeeID` 弹速览 |
| 编制 | `Dept===部门码` | 在职数 = `IsActive===true` 计数；Gap = 编制 − 在职 |
| 安全中心 | `Status==='待复核'` | 高危操作先入队；确认执行后按 `Action` 分发（数据重置→resetAllData；批量删除→batchDelete(ids)）；`_ids` 随记录持久化 |
| 部门周报 | 本周一至今日 | 打卡按日期区间；迟到按规则；任务按本部门员工 |
| 团队关怀 | `daysUntil(EndDate)<=30` + `CreatedAt` 月日 | 入职周年按 `CreatedAt` 推算；转正待批按 `workFlows.Type==='转正'`；点击卡片 `Session.chatTargetId` 直达消息 |

---

## 五、legacy 原项目（参考实现）对应关系

`legacy/source/web/` 下 12 个 .aspx 页面与新版 hr.html 模块的映射：

| 原页面 (.aspx) | 对应新模块 |
|---|---|
| WebForm2（登录） | hr.html 登录页 / admin.html 登录 |
| WebForm1（管理员） | VIEWS.dashboard / employeeAdmin / departmentAdmin |
| WebForm3（员工门户） | 员工视图（attendance/leave/mission/profile） |
| WebForm4（主管门户） | 主管视图（missionAdmin/leaveApproval/review/deptReport/deptEmployee） |
| daka（打卡） | VIEWS.attendance |
| qingjia（请假） | VIEWS.leave |
| LeaveApproval（请假审批） | VIEWS.leaveApproval |
| mission（任务） | VIEWS.mission / missionAdmin |
| PerformanceReview（绩效） | VIEWS.review |
| DepartmentReport（部门报表） | VIEWS.deptReport |
| DepartmentEmployeeManagement | VIEWS.deptEmployee |
| profile（个人资料） | VIEWS.profile |

原项目数据库表：`EmployeeUser / Departments / EmployeeAttendance / LeaveApplications / EmployeeMission / PerformanceReviews`（见 `SQLQuery3.sql`），与新版 hr-data.js 的 6 个数组一一对应。

---

## 六、文件与目录说明

```
havvk_website/
├── index.html            官网主站（宣传 + 入口弹窗）
├── admin.html            集团档案后台（登录 + 加密资料库 + 入口弹窗）
├── hr.html               员工门户 HR 系统（登录 + 工作台）
├── README.md             快速上手说明
├── ARCHITECTURE.md       本文件（架构与业务逻辑说明）
├── css/
│   ├── index.css         主站+后台样式（含 portal 弹窗样式）
│   ├── swiper.css        轮播样式
│   └── hr.css            HR 系统样式（浅色主站风 + 移动端适配 @media 900px）
├── js/
│   ├── index.js          主站交互（轮播/动画/BGM）
│   ├── admin3.js         集团档案逻辑
│   ├── offline-data.js   集团档案静态数据（文件夹/文档/详情/密钥）
│   ├── hr-app.js         HR 视图层（70 个 VIEWS + 弹窗 + 附件绑定 + 警报横幅）
│   ├── hr-data.js        HR 数据层（seed/migrate/CRUD/导出 HRDB，约 30 张表）
│   ├── hr-files.js       附件层（IndexedDB，导出 HRFiles）
│   ├── i18next.js / langan.js / lang-resources.js   国际化
│   └── jquery-1.11.3.min.js / swiper.js  第三方库
├── img/                  61 张图片/字体（全本地化）
├── media/                bgm.mp3 / video.mp4
├── locales/              zh / en 翻译 JSON（备用）
├── data/                 预留数据目录
└── legacy/               原 ASP.NET 项目
    ├── database/         Demo1.mdf / Demo1_log.ldf
    └── source/           web/(12 aspx) + Controllers + Content + SQLQuery3.sql 等
```

---

## 七、运行方式与账号速查

| 项 | 值 |
|---|---|
| 离线运行 | 直接双击 `index.html` / `admin.html` / `hr.html` |
| 本地服务器 | `cd F:\柯睿\havvk_website && python -m http.server 8899` → `http://127.0.0.1:8899/index.html` |
| 集团档案账号 | `42847 / time0926`（加密文件夹密钥 `havvk`） |
| HR 管理员 | `admin / admin`（工号 E2024001，Perm 3） |
| HR 主管 | `dbh / 123456`（E2024018，D002 技术部，Perm 2；种子：张伟 E2024002 主管 manager123、王芳 E2024006 主管） |
| HR 员工 | `kr / 123456`（E2024017，D002，Perm 1；李强/袁致远/徐璐/Ogawa Shino/Iwasaki Airi 同部门） |

---

## 八、扩展与维护指引

1. **加新 HR 功能**：数据层在 `hr-data.js` 加函数并挂到 `return {}`（含 `migrateAdmin` 补表分支）；视图层在 `hr-app.js` 加 `VIEWS.xxx` 并注册到对应权限的 `PERM[n].nav` + `NAV_DEF` + `NAV_GROUP`；样式补 `css/hr.css`；改完 `node --check` 两个 js 并升 `hr.html` 里对应版本号。
2. **加新档案**：编辑 `js/offline-data.js` 的 `folders / documents / details / docPassword`。
3. **改文案/语言**：`js/lang-resources.js`（主站后台）与 `hr.html` 内联中文。
4. **清空演示数据**：浏览器 DevTools → Application → Local Storage 删除 `havvk_hr_db_v1`，刷新即重置种子数据（migrate 会自动补齐所有表）。
5. **移动端适配**：`css/hr.css` 的 `@media (max-width:900px)` 块统一处理；消息中心固定高度、日历圆点模式、图表压缩都在此块。
6. **附件清理**：IndexedDB 中 `havvk_hr_files` 库 `files` 表存附件 Blob，可在 DevTools → Application → IndexedDB 中查看/删除。
7. **版本命名**：`hr.html` 内 `css?v=18 / hr-data.js?v=23 / hr-app.js?v=39`（当前），每次改动升对应版本号，避免浏览器缓存旧脚本。
8. **考勤类型规范**：`attendance.CheckType` 统一存 `'上班'` / `'下班'`（addAttendance 入参规范化；migrateAdmin 第 15 分支自动转换旧 `'上班打卡'`/`'下班打卡'` 存量），异常检测/战报/报表统一按 `'上班'`/`'下班'` 匹配。
9. **多标签并发保护**：单账户锁（`havvk_hr_session`）保证同浏览器同源只允许一个账户在线；`save()` 写前按 `TABLE_PK` 主键映射合并 localStorage 最新快照（新记录去重并入，避免 last-write-wins 覆盖丢失）；`window.addEventListener('storage')` 跨标签同步内存与视图。
10. **角色权限控制**：`employees.RoleID` 关联 `roles`；`renderNav()` 登录时若角色 `AllowedNav` 非空则按白名单过滤菜单（实测 kr 分配 3 项白名单后导航 33→3）；`showModal(title, body, footHtml)` 第三参为按钮 HTML，确认回调需单独 `$('#xxxOk').on('click')` 绑定（V15 曾误传函数被 jQuery html() 立即执行，已全部修正）。
11. **注册审批闭环**：登录页"申请注册"→ `addRegRequest` 入 `regRequests`（同邮箱待审批去重）→ 管理员"注册审批"通过 → `approveRegRequest` 自动生成员工账号（初始密码 123456）并写审计。
12. **自定义工作台（V16）**：`dashPrefs`（per-user）存 `{quick:[视图key], panels:{quick/stats/announce/recent}}`；工作台"⚡快捷操作"网格卡片默认 8 项（按角色预设），"⚙ 自定义"弹窗勾选权限内导航（≤12 个）与板块开关，保存即生效；`getDashPrefs` 按 `PermissionLevel` 返回默认配置。
13. **角色菜单精简与视图权限门禁（V17）**：按"功能对角色是否真有实际用途"精简菜单——员工移除 `operatorProfile`（仅能看自己、与个人信息重复，33→32 项）；主管移除 `rankUpgrade`（主管已达最高级别）、`mission`（主管只下发任务无任务来源，48→46 项）；管理员 58 项不变。同时 `showView()` 增加 `canView()` 权限门禁（与 renderNav 同源白名单：PERM[perm].nav ∩ 自定义角色 AllowedNav），越权访问一律 toast 拒绝并回工作台；全量跳转扫描确认无越权目标（employeeAdmin 内 else 分支 `deptEmployee` 仅非管理员可达、管理员走 if 分支）。
14. **移除注册入口与警报静默（V18）**：公司内网定位——登录页"申请注册"链接与 `regLink` 事件块整体删除（`regApproval` 移出管理员菜单 58→57 项，添加员工只走员工管理手动/表格批量导入）；警报改为默认静默——种子 `alerts` 清空、migrate 迁移清除存量"演习"类条目（标题含"演习"），`renderAlertBanner()` 与警报历史列表均过滤演习类（演习通知走公告渠道），仅管理员发布真实警报才亮横幅，发布后即时刷新横幅、可手动关闭。

15. **相似功能融合（V19，2026-09-23）**：为收敛侧边栏选项，将性质相同的模块合并为「多标签容器视图」——新增通用工具 `renderTabsView(tabs, renderers, active)`：渲染 `.fused-tabs` 标签条 + `#fusedBody` 容器，懒加载渲染当前 tab（切换时清空重建，避免 id 冲突），并设置 `window.__fusedRerender` 供底层视图内"删除/审批/保存后重渲染"回调当前 tab（不跳出容器）。被融合的底层视图统一改为 `function (container)` 签名（`$('#appContent').html` → `$(container).html`，事件委托 `$(container).find(...)`，`else showView('self')` fallback 全部映射到新容器 key）。融合清单：
   - `systemLog`（管理员）= 操作日志 + 登录日志 + 异常日志
   - `contentAdmin`（管理员）= 评论管理 + 图片管理
   - `systemConfig`（管理员）= 网站配置 + 数据备份 + 数据导出
   - `dataReport`（主管/管理员）= 考勤报表 + 部门报表（管理员另加 集团战报 + 数据看板）
   - `groupNews`（全员）= 集团公告 + 员工嘉奖 + 集团大事记
   - `messages`（全员）= 消息会话 + 部门群聊
   - `hrService`（全员）= 人事流程 + 干员晋级 + 资料变更（管理员另加 离职交接）
   - `logistics`（全员）= 差旅报销 + 办公设备 + 行政申请
   - `archive`（全员）= 我的档案 + 干员档案（支持 `window.__archiveTab='ops'` 直达干员档案 tab，供组织架构点击干员使用）
   - `weekly`（全员）= 我的周报（主管/管理员另加 部门周报汇总）
   - `performance`（主管/管理员）= 绩效评审 + 技能认证
   - `approvalCenter`（主管/管理员）= 请假审批 + 行政审批 + 聚合审批 + 委托设置
   - `taskCenter`（员工/主管）= 我的任务 + 战情简报
   - `taskAdmin`（主管/管理员）= 任务下发 + 简报发布
   - `attendanceCenter`（全员）= 我的考勤（管理员标签"考勤记录"）（主管/管理员另加 异常审核，管理员另加 考勤规则）
   - `feedbackCenter`（全员）= 意见反馈（主管/管理员另加 反馈处理）
   - `salaryCenter`（全员）= 我的薪资（管理员另加 薪资管理）
   - `orgManage`（主管/管理员）= 管理员：员工管理 + 部门管理 + 组织架构 + 编制管理；主管：部门员工 + 组织架构 + 编制管理
   - 菜单收敛结果：员工 32→24、主管 46→30、管理员 57→36（`PERM[1/2/3].nav`、`NAV_DEF`/`NAV_GROUP` 新 key、`DASH_DEFAULTS` 工作台快捷同步换新 key）。
   - 遗留清理：内网化删除 `VIEWS.regApproval` 整体（注册审批不可达）；`VIEWS.leaveApproval()`/`VIEWS.review()` 无参重渲染改为 `(container)` 修复容器被破坏；`globalSearch` 员工结果 goto 管理员改 `orgManage`；`showView` 管理员标题 `attendanceCenter`→"考勤记录"。
   - 融合后全量回归：三角色逐视图点击渲染正常（24/30/36 项）、融合 tab 切换正常、容器内真实操作（请假批准写库、绩效编辑保存、员工管理部门筛选）均生效且不跳出容器、无 console 错误。版本 hr-app v40 / hr-data v24 / hr.css v19。


### V20（2026-09-23）权限收敛 + 工作台常驻
- 战情简报功能整体删除：VIEWS.briefing/briefingAdmin 视图块、NAV_DEF/NAV_GROUP 对应键、taskCenter（只剩"我的任务"）/taskAdmin（只剩"任务下发"）简报 tab、getTodos 中"待回传行动报告"待办项全部移除；hr-data.js 数据层 briefings 表保留但不再被 UI 调用。
- 侧边栏权限收敛（PERM[1/2/3].nav 重写）：
  - 员工 21 项：移除 meeting/messages/attendanceCenter（后两者改工作台常驻；会议仅主管及以上）。
  - 主管 28 项：移除 messages/attendanceCenter（工作台常驻），保留 meeting。
  - 管理员 34 项：系统管理类前置 systemLog/systemConfig/contentAdmin/security/contract/asset/orgManage/dataReport/roleManage，后接业务项；移除 messages/attendanceCenter（工作台常驻）。
- 投票问卷："＋ 发起投票"按钮改为仅 PermissionLevel >= 2 渲染（VIEWS.poll 内条件拼接）；员工仅可投票不可发起。
- 工作台常驻模块（VIEWS.dashboard）：①今日打卡/考勤概览（员工/主管：今日上班下班打卡状态 tag + 工作台直接打卡按钮 #dashClockIn/#dashClockOut，调 HRDB.addAttendance；管理员：今日上班/下班打卡人数 + 跳考勤记录）；②消息中心（调 HRDB.getConversations 渲染最近 5 会话含未读，跳 messages）；③安全态势监控（仅管理员、可开关 panels.security）：今日在线人数 SVG 环形图（HRDB.getLoginLogs 当日去重）、服务器日志（HRDB.getErrorLogs 最近 5 条）、异常流量检测（深夜 23:00-05:00 登录表）。CSS 新增 .sec-grid/.sec-card/.sec-title（含 900px 单列适配）。
- 权限门禁放行：canView() 对 attendanceCenter/messages 两个工作台常驻视图特判放行（已移出 nav 但工作台可进入）。
- getTodos 全部 goto 换新融合 key（mission→taskCenter、expense/equipment→logistics、leaveApproval→approvalCenter、profileUpdate→hrService、missionAdmin→taskAdmin、feedbackAdmin→feedbackCenter）。
- 回归：员工 21 / 主管 28 / 管理员 34 项菜单数与顺序核对通过；员工无会议/无发起投票/无战情简报；工作台打卡真实写库（toast 成功）；工作台→考勤记录/消息中心跳转正常；管理员 34 视图逐一点开无异常；移动端适配沿用既有 900px 侧栏收起。版本 hr-app v42 / hr-data v25 / hr.css v20。


### V21（2026-09-23）集团档案门户化（教务门户式）
- 参考高校官网门户布局，将集团档案（admin.html"研究数据"目录页）改造为门户式：顶部 Header（哈夫克 logo + 标题 + 退出）、一级导航栏（档案中心/集团概况/行动档案/研发档案/人事档案/公示公告）、横幅 + 三栏板块（集团要闻 / 档案分类 / 研发动态+招聘公示+安全公告），各板块带 MORE 跳转。
- 导航与板块（admin3.js 新增 renderPortal/renderSection/archCardHtml/renderArchiveHome/renderOverview/renderGroupFolders/renderNews/bindPortalClicks，双语 getTxt 基于 isEn）：
  - 档案中心：横幅（n_pic2 图 + "信息予你无限"）+ 三栏首页，档案分类 6 卡片（图标+名称+描述+文档数+更新时间）。
  - 集团概况：集团图文简介（2007 年创立、物流起家转 AI 平台、Relink 脑机/核能/安保业务）+ 4 数据卡 + 4 核心业务卡。
  - 行动档案/研发档案/人事档案：navGroup 分组的文件夹卡片。
  - 公示公告：要闻/研发/招聘/安全四类列表。
- 数据扩展（offline-data.js）：groupInfo（集团简介/数据/业务）、news（top/rnd/hire/security 公告）、navGroup（分类分组）、folders 增加 desc/update 字段。
- 流程保留：登录（admin/admin、42847/time0926）、免密解锁、文件夹→文档列表→详情/图片浏览；新增 folder 页"← 档案中心"返回按钮（#folderBack）、门户退出按钮（.portal-logout）；showPage 增加 portal 分支；reloadData 门户可见时重渲染门户。
- 样式（index.css 追加 .portal-*）：蓝白军事科技风（主色 #12375e/#0e5fb7），横幅渐变遮罩、卡片 hover 上浮、980px 单列、640px 导航横向滚动。
- 回归：门户首页/五大板块渲染正常、点卡片进文档列表（免密无弹窗）、文档返回 folder 页→返回档案中心链路正常、中英切换正常（nav/标题/横幅同步）、主站 index.html 不受影响（图片/脚本无 console 错误）。版本：admin.html 引用 css v22 / offline-data v22 / admin3 v22。


### V22（2026-09-23）档案内容填充 + 新增"档案分析"板块
- 参考官网/游戏论坛/B站剧情解析（萌娘百科、三角洲行动剧情解说、德穆兰独白等）整理深度设定内容。
- offline-data.js 新增 analysis 数据：大事记时间线（1993 黑鹰坠落→2001 创业→2007 转型→2018 G.T.I→2029 脑机研发→2035 Relink 发布与巴别塔行动）、6 位关键人物（雅各布/罗米修斯/德穆兰/瓦拉比/佐娅/赛伊德）、3 项核心科技（Relink/曼德尔砖/天王卫星）、4 方势力（哈夫克/G.T.I/阿萨拉卫队/军阀）。
- admin3.js 导航新增"档案分析"（ANALYSIS），renderSection 增加 renderAnalysis()：大事记时间轴 + 关键人物档案卡 + 核心科技档案 + 势力格局。
- 档案分类 6 卡片 desc 全部补全为设定相关描述（如"巴别塔袭击事件伤员救治记录与全球安全部行动档案"）。
- index.css：.arch-desc 改两行截断显示；新增 .tl-* 时间轴、.people-* 人物卡、.tech-grid、.faction-* 阵营卡样式（980/640 响应式）。
- 回归：7 导航渲染正常、档案分析板块 6+6+3+4 内容齐全、首页卡片 desc 全显示、集团概况不受影响、中英切换含 ANALYSIS、窄屏适配、无 console 错误。版本 v23。


### V22（2026-09-23）档案内容填充 + 新增"档案分析"板块
- 参考官网/游戏论坛/B站剧情解析（萌娘百科、三角洲行动剧情解说、德穆兰独白等）整理深度设定内容。
- offline-data.js 新增 analysis 数据：大事记时间线（1993 黑鹰坠落→2001 创业→2007 转型→2018 G.T.I→2029 脑机研发→2035 Relink 发布与巴别塔行动）、6 位关键人物（雅各布/罗米修斯/德穆兰/瓦拉比/佐娅/赛伊德）、3 项核心科技（Relink/曼德尔砖/天王卫星）、4 方势力（哈夫克/G.T.I/阿萨拉卫队/军阀）。
- admin3.js 导航新增"档案分析"（ANALYSIS），renderSection 增加 renderAnalysis()：大事记时间轴 + 关键人物档案卡 + 核心科技档案 + 势力格局。
- 档案分类 6 卡片 desc 全部补全为设定相关描述（如"巴别塔袭击事件伤员救治记录与全球安全部行动档案"）。
- index.css：.arch-desc 改两行截断显示；新增 .tl-* 时间轴、.people-* 人物卡、.tech-grid、.faction-* 阵营卡样式（980/640 响应式）。
- 回归：7 导航渲染正常、档案分析板块 6+6+3+4 内容齐全、首页卡片 desc 全显示、集团概况不受影响、中英切换含 ANALYSIS、窄屏适配、无 console 错误。版本 v23。


### V23（2026-09-23）档案分类卡片样式重做
- 用户反馈档案分类卡片丑（锁形小图标 + 白底扁平）。重做卡片视觉：
  - offline-data.js folders 每项新增 mark（双字标识：伤亡/选址/核电/脑机/推荐/草稿）与 grad/grad2（6 组渐变主色：红棕/蓝/橙/紫/青绿/灰蓝）。
  - admin3.js archCardHtml 图标区改为 48px 渐变方块 + 白色粗体标记字（不再用 folder_icon 小锁图），保留 hover 箭头右移动效。
  - index.css .arch-card 改渐变底、10px 圆角、hover 上浮发光；.arch-ico 渐变+阴影+字距；.arch-name 15px；.arch-meta 加大间距；desc 保持两行截断。
- 回归：6 卡片 mark/渐变均正确渲染、meta 完整、窄屏单列与桌面三列布局正常、卡片点击进文件夹链路不受影响。版本 v24。


### V24（2026-09-23）档案分析板块回归原站风格
- 用户反馈档案分析板块（时间轴/人物/科技/势力四块直排）太丑，要求改回原站显示的样子。
- renderAnalysis 重写：4 张原站目录式文件夹卡片（bg2 深色底 + 锁图标 + 名称 + 描述）：集团大事记 / 关键人物档案 / 核心科技档案 / 势力格局；点击卡片切换下方详情区（renderAnaDetail），默认显示大事记时间轴；选中卡片高亮蓝框。
- 样式（index.css 新增 .ana-grid/.ana-card/.ana-detail）：复用原站 bg2.png 卡片背景；桌面 4 列、1080 下 2 列、720 下 2 列紧凑。
- 回归：4 卡片渲染/图标正常、点击切换 6 人物卡与 4 势力卡正常、选中态正确、无 console 错误。版本 v28。


### V25（2026-09-23）档案中心首页档案分类改整页网格
- 用户要求首页"档案分类"按研发档案页的整页卡片风格展示。
- renderArchiveHome 重构：横幅 + 两栏（左集团要闻 6 条 / 右研发动态+招聘公示+安全公告）+ 下方整页"档案分类"标题与 6 张 arch-card 大网格（桌面 3 列、窄屏单列，与研发档案页 renderGroupFolders 完全一致）。
- applyResponsiveGrid 兼容两栏布局（无 col-m 时 col-l 36% / col-r flex）。
- 回归：两栏动态正常、档案分类 6 卡整页网格正常、窄屏堆叠正常、卡片样式与研发档案页一致。版本 v29。


### V26（2026-09-23）档案中心首页两栏内容重排
- 用户反馈宽屏下两栏信息不均衡（左 6 条窄柱 + 右三块小柱）、排版失衡，要求重新排版。
- renderArchiveHome 重排：左栏=集团要闻 4 条 + 招聘公示 3 条；右栏=研发动态 4 条 + 安全公告 3 条；下方档案分类整页 3 列网格占满全宽（桌面每卡约 390px）。
- applyResponsiveGrid 两栏宽度 36% 调整为 48%/52%，窄屏仍堆叠单列。
- 回归：两栏结构正常（要闻+招聘在左、研发+安全在右）、新闻条目 14 条、窄屏堆叠正常。版本 v30。


### V26（2026-09-23）档案中心首页两栏内容重排
- 用户反馈宽屏下两栏信息不均衡（左 6 条窄柱 + 右三块小柱）、排版失衡，要求重新排版。
- renderArchiveHome 重排：左栏=集团要闻 4 条 + 招聘公示 3 条；右栏=研发动态 4 条 + 安全公告 3 条；下方档案分类整页 3 列网格占满全宽（桌面每卡约 390px）。
- applyResponsiveGrid 两栏宽度 36% 调整为 48%/52%，窄屏仍堆叠单列。
- 回归：两栏结构正常（要闻+招聘在左、研发+安全在右）、新闻条目 14 条、窄屏堆叠正常。版本 v30。


### V27（2026-09-23）档案分类卡片缩小插入左栏
- 用户要求缩小档案分类卡片，插入左栏"集团要闻"与"招聘公示"之间，移除底部整页网格。
- renderArchiveHome：左栏 = 集团要闻 3 条 → 档案分类迷你网格（6 卡，2 列×3 行，.mini-grid）→ 招聘公示 3 条；右栏不变（研发动态 4 + 安全公告 3）。
- CSS：.mini-grid 强制 2 列，迷你卡竖排布局（图标 34px + 名称 13px + desc 单行 + meta 10px，隐藏箭头）。
- applyResponsiveGrid 对 .mini-grid 固定 2 列。
- 回归：左栏三板块顺序正确、6 张迷你卡渲染正常、底部网格已移除、窄屏堆叠正常。版本 v31。


### V28（2026-09-23）右栏内容补充（检索/最近更新/统计）
- 用户反馈右栏变空，补充三个新板块，右栏现为：档案检索 → 最近更新 → 档案统计 → 研发动态 → 安全公告。
  - 档案检索：输入关键词实时过滤左栏档案分类迷你卡（bindArchiveSearch，名称+描述匹配，无结果提示，× 清除）。
  - 最近更新：folders 按 update 倒序取 5 条，点击直接进入对应文件夹文档列表（复用 a[data-folder] 委托绑定）。
  - 档案统计：4 张迷你数据卡——档案文档总数（documents 各文件夹求和）、分类数、分组数、最近更新日期。
- CSS：.search-box/.recent-list/.stat-mini 系列（窄屏统计卡 4 列横排）。
- 回归：右栏 5 板块齐全、检索"脑机"过滤正确、无结果提示、清除恢复、最近更新点击进文件夹正常、统计 19/6/3/09-16、无 console 错误。版本 v33。


### V29（2026-09-23）首页按高校官网规格重构（轮播+三栏）
- 参考广州理工学院官网布局，按哈夫克设定重构首页为三栏：
  - 左列（42%）：集团形象轮播（n_pic2/n_pic1/n_pic3 三张，遮罩标题+底部指示点，4.5s 自动切换+点击切换+悬停暂停，initCarousel）+ 档案分类迷你网格（6 卡，MORE→archive）。
  - 中列（28%）：集团简介（groupInfo.intro 摘要，查看详情→overview）+ 研发动态 4 条（MORE→news）。
  - 右列（30%）：集团要闻 5 条（MORE→news）+ 官方媒体平台 4 链接（哈夫克官网/三角洲行动/B站/抖音，纯展示外链）。
- CSS：.carousel 系列（fade 切换/指示点）、.intro-card 摘要截断、.media-grid/.media-item 媒体卡。
- applyResponsiveGrid 三栏宽度 42/28/30，1080 下轮播 220px、720 下 170px 并堆叠单列。
- 回归：三栏结构、轮播 3 图自动切换（4.5s 0→1）、6 迷你卡、简介、4 媒体链接、窄屏堆叠均正常，无 console 错误。版本 v35。


### V30（2026-09-23）首页改回两栏 + 新增下行三栏内容
- 用户反馈学院式三栏+轮播太丑，改回原两栏布局，并新增更多内容板块。
- 上行两栏恢复：左=集团要闻 3 + 档案分类迷你卡 6（MORE→archive）+ 招聘公示 3；右=研发动态 3 + 安全公告 2 + 档案检索 + 最近更新 5 + 档案统计 4。
- 新增下行三栏（.sec2，桌面 3 等分、980 下堆叠）：
  - 集团大事记：analysis.timeline 前 5 条（紧凑时间轴，MORE→analysis）
  - 核心科技：Relink/曼德尔砖/天王卫星 3 卡（MORE→analysis）
  - 关键人物：雅各布/罗米修斯/德穆兰/瓦拉比 4 人物卡（MORE→analysis）
- 移除轮播/简介/媒体平台（学院式改造回滚）。轮播无引用残留不影响。
- 回归：两栏 8 板块 + 下行三栏（5/3/4 条目）、轮播已移除、窄屏堆叠正常、无 console 错误。版本 v36。


### V31（2026-09-23）首页规整重排 + 恢复顶部大图
- 用户反馈排版不规整、图片丢失（顶部大图在回滚时被移除）。重排为规整分块结构并恢复 banner：
  - 顶部大图 banner（n_pic2 + "信息予你无限"标题，恢复主视觉）。
  - 档案分类：6 张大卡片整排网格（3 列桌面/2 列/1 列窄屏，MORE→archive）。
  - 两栏对称列表：左=集团要闻 4 + 招聘公示 3 + 档案检索 + 最近更新 5；右=研发动态 4 + 安全公告 3 + 档案统计 4。
  - 三栏：集团大事记 5 / 核心科技 3 / 关键人物 4（MORE→analysis）。
- 空 img 排查：admin.html 图片放大弹窗的 `<img alt=""/>` 为隐藏占位（naturalWidth=0 但 display:none），非丢失；12 条 type:doc 文档 src 空属正常（doc 用 i 图标渲染）。
- 回归：banner 恢复、档案分类 6 大卡整排、两栏+三栏结构正常、窄屏单列/堆叠正常、无 console 错误。版本 v37。


### V32（2026-09-23）响应式断点细化 + 强制刷新版本
- 用户窗口缩小到 ~671px 时发现档案分类 3 列、两栏并排挤压（旧缓存 CSS 断点为 980/640，671 落在三列区间）。
- 断点细化对齐（CSS 1080/720 与 JS applyResponsiveGrid 一致）：<720px 档案网格 1 列、两栏/三栏堆叠；720–900px 2 列；>900px 3 列；<900px 两栏堆叠单列。
- 版本号统一升级强制刷新缓存：css v32 / offline-data v25 / admin3 v38。
- 回归：bu 552px 视口 1 列堆叠、6 卡片、无 console 错误。用户缩小窗口（671px）将正确单列/双列，不再三列挤压。


### V33（2026-09-23）消除留白 + 两栏/三栏等高对齐
- 用户要求不允许大部分留白、要对齐。实测两栏高差 221px、三栏高差 121px，底部大片空白。
- 修复：
  - 两栏内容配比均衡：左栏=集团要闻 4 + 招聘公示 3 + 档案检索 + 档案统计 6 卡；右栏=研发动态 4 + 安全公告 3 + 最近更新 4。实测高差 733 vs 723（10px）。
  - 档案统计卡 4→6：新增"加密档案"（locked 计数）与"图片档案"（image 计数）。
  - 三栏核心科技：tech 数据新增 status 字段（试验验证中/量产部署/在轨运行），科技卡加状态标签块级行，三栏高 531/488/492（最大差 43px）。
  - .portal-grid .portal-col 加白底卡片样式（背景/边框/圆角/padding），列高 flex stretch 填满，剩余空隙被白底填充，视觉无大片留白。
- 版本：css v35 / offline-data v26 / admin3 v41。
- 回归：两栏差 10px、三栏差 43px、6 统计卡、4 最近更新、3 状态标签、无 console 错误。


### V34（2026-09-23）删除集团大事记与关键人物板块
- 用户要求去掉"集团大事记"和"关键人物"，首页只保留核心科技。
- 三栏 sec2 移除；核心科技改为整排网格（arch-grid 3 卡：Relink 脑机接口/曼德尔砖/天王卫星，含状态标签），在档案分类下方与两栏之间独立成行。
- 首页最终结构：banner → 档案分类 6 卡 → 两栏（左=要闻+招聘+检索+统计6；右=研发+安全+最近4）→ 核心科技整排。
- 版本：css v36 / admin3 v42。
- 回归：无大事记/人物残留、核心科技 3 卡整排、两栏等高（852/852）、无 console 错误。
