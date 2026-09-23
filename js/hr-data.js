/* ============================================================
   HAWK 哈夫克集团 · HR 系统数据层
   对应原系统 SQL Server 数据库（EmployeeUser / Departments /
   EmployeeAttendance / LeaveApplications / EmployeeMission /
   PerformanceReviews），本地用 localStorage 持久化。
   ============================================================ */
var HRDB = (function () {
    var KEY = 'havvk_hr_db_v1';

    // 默认种子数据（对应原系统 WebForm1 员工表 / DepartmentReport 部门数据）
    function seed() {
        return {
            // 员工表（PermissionLevel: 1普通员工 2部门主管 3管理员）
            employees: [
                { EmployeeID: 'E2024001', EmployeeName: 'admin', Gender: '男', Age: 30, Department: 'D001', PermissionLevel: 3, PhoneNumber: '13800000000', Email: 'admin@havvk.com', IsActive: true, Password: 'admin', Remarks: '集团管理员', CreatedAt: '2024-01-01 09:00:00' },
                { EmployeeID: 'E2024002', EmployeeName: '张伟', Gender: '男', Age: 35, Department: 'D002', PermissionLevel: 2, PhoneNumber: '13800000002', Email: 'zhangwei@havvk.com', IsActive: true, Password: 'manager123', Remarks: '技术部主管', CreatedAt: '2024-01-08 10:30:00' },
                { EmployeeID: 'E2024003', EmployeeName: 'Kudo Airi', Gender: '女', Age: 26, Department: 'D001', PermissionLevel: 1, PhoneNumber: '13800000003', Email: 'kudo.airi@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-02-01 08:45:00' },
                { EmployeeID: 'E2024004', EmployeeName: '李强', Gender: '男', Age: 29, Department: 'D002', PermissionLevel: 1, PhoneNumber: '13800000004', Email: 'liqiang@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-02-05 14:20:00' },
                { EmployeeID: 'E2024005', EmployeeName: '袁致远', Gender: '男', Age: 31, Department: 'D002', PermissionLevel: 1, PhoneNumber: '13800000005', Email: 'yuanzhiyuan@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-02-10 11:00:00' },
                { EmployeeID: 'E2024006', EmployeeName: '王芳', Gender: '女', Age: 27, Department: 'D003', PermissionLevel: 2, PhoneNumber: '13800000006', Email: 'wangfang@havvk.com', IsActive: true, Password: 'manager123', Remarks: '人事部主管', CreatedAt: '2024-02-12 09:15:00' },
                { EmployeeID: 'E2024007', EmployeeName: 'Watanabe Aoi', Gender: '女', Age: 24, Department: 'D003', PermissionLevel: 1, PhoneNumber: '13800000007', Email: 'watanabe.aoi@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-03-01 10:00:00' },
                { EmployeeID: 'E2024008', EmployeeName: '刘洋', Gender: '男', Age: 33, Department: 'D004', PermissionLevel: 2, PhoneNumber: '13800000008', Email: 'liuyang@havvk.com', IsActive: true, Password: 'manager123', Remarks: '财务部主管', CreatedAt: '2024-03-05 16:40:00' },
                { EmployeeID: 'E2024009', EmployeeName: '常睿', Gender: '男', Age: 30, Department: 'D004', PermissionLevel: 1, PhoneNumber: '13800000009', Email: 'changrui@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-03-12 13:25:00' },
                { EmployeeID: 'E2024010', EmployeeName: '陈静', Gender: '女', Age: 32, Department: 'D004', PermissionLevel: 1, PhoneNumber: '13800000010', Email: 'chenjing@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-04-02 09:30:00' },
                { EmployeeID: 'E2024011', EmployeeName: '徐璐', Gender: '女', Age: 25, Department: 'D002', PermissionLevel: 1, PhoneNumber: '13800000011', Email: 'xulu@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-04-08 15:10:00' },
                { EmployeeID: 'E2024012', EmployeeName: 'Ogawa Shino', Gender: '女', Age: 27, Department: 'D002', PermissionLevel: 1, PhoneNumber: '13800000012', Email: 'ogawa.shino@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-04-15 10:45:00' },
                { EmployeeID: 'E2024013', EmployeeName: '蔡云熙', Gender: '女', Age: 26, Department: 'D003', PermissionLevel: 1, PhoneNumber: '13800000013', Email: 'caiyunxi@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-05-06 09:20:00' },
                { EmployeeID: 'E2024014', EmployeeName: '赵磊', Gender: '男', Age: 34, Department: 'D003', PermissionLevel: 1, PhoneNumber: '13800000014', Email: 'zhaolei@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-05-12 14:50:00' },
                { EmployeeID: 'E2024015', EmployeeName: '谭宇宁', Gender: '男', Age: 28, Department: 'D004', PermissionLevel: 1, PhoneNumber: '13800000015', Email: 'tanyuning@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-06-01 11:30:00' },
                { EmployeeID: 'E2024016', EmployeeName: 'Iwasaki Airi', Gender: '女', Age: 29, Department: 'D002', PermissionLevel: 1, PhoneNumber: '13800000016', Email: 'iwasaki.airi@havvk.com', IsActive: true, Password: 'user123', Remarks: '', CreatedAt: '2024-06-08 08:50:00' },
                { EmployeeID: 'E2024017', EmployeeName: 'kr', Gender: '男', Age: 25, Department: 'D002', PermissionLevel: 1, PhoneNumber: '13800000017', Email: 'kr@havvk.com', IsActive: true, Password: '123456', Remarks: '', CreatedAt: '2026-09-22 09:00:00' },
                { EmployeeID: 'E2024018', EmployeeName: 'dbh', Gender: '男', Age: 35, Department: 'D002', PermissionLevel: 2, PhoneNumber: '13800000018', Email: 'dbh@havvk.com', IsActive: true, Password: '123456', Remarks: '部门主管', CreatedAt: '2026-09-22 09:00:00' }
            ],
            // 部门表
            departments: [
                { DepartmentID: 1, DepartmentCode: 'D001', DepartmentName: '行政部', ManagerID: 'E2024001', IsActive: true },
                { DepartmentID: 2, DepartmentCode: 'D002', DepartmentName: '技术部', ManagerID: 'E2024002', IsActive: true },
                { DepartmentID: 3, DepartmentCode: 'D003', DepartmentName: '人事部', ManagerID: 'E2024006', IsActive: true },
                { DepartmentID: 4, DepartmentCode: 'D004', DepartmentName: '财务部', ManagerID: 'E2024008', IsActive: true },
                { DepartmentID: 5, DepartmentCode: 'D005', DepartmentName: '核电招聘部', ManagerID: '', IsActive: true }
            ],
            // 考勤表
            attendance: [
                { ID: 1, EmployeeID: 'E2024002', EmployeeName: '张伟', AttendanceDate: '2026-09-01', AttendanceTime: '08:30:00', CheckType: '上班打卡' },
                { ID: 2, EmployeeID: 'E2024002', EmployeeName: '张伟', AttendanceDate: '2026-09-01', AttendanceTime: '18:40:15', CheckType: '下班打卡' },
                { ID: 3, EmployeeID: 'E2024003', EmployeeName: 'Kudo Airi', AttendanceDate: '2026-09-02', AttendanceTime: '08:55:40', CheckType: '上班打卡' },
                { ID: 4, EmployeeID: 'E2024003', EmployeeName: 'Kudo Airi', AttendanceDate: '2026-09-02', AttendanceTime: '17:58:20', CheckType: '下班打卡' },
                { ID: 5, EmployeeID: 'E2024002', EmployeeName: '张伟', AttendanceDate: '2026-09-02', AttendanceTime: '08:32:11', CheckType: '上班打卡' },
                { ID: 6, EmployeeID: 'E2024002', EmployeeName: '张伟', AttendanceDate: '2026-09-02', AttendanceTime: '18:33:45', CheckType: '下班打卡' }
            ],
            // 请假申请（LeaveApplications）
            leaves: [
                { LeaveID: 1, EmployeeID: 'E2024003', EmployeeName: 'Kudo Airi', Department: 'D001', LeaveType: '事假', StartDate: '2026-09-10', EndDate: '2026-09-11', Days: 2, Reason: '家中临时有事', Status: '待审批', ApplyTime: '2026-09-05 09:20:00', ApproverID: '', ApproveTime: null, Remarks: '' },
                { LeaveID: 2, EmployeeID: 'E2024004', EmployeeName: '李强', Department: 'D002', LeaveType: '病假', StartDate: '2026-09-12', EndDate: '2026-09-12', Days: 1, Reason: '感冒发烧，医院就诊', Status: '待审批', ApplyTime: '2026-09-06 14:35:00', ApproverID: '', ApproveTime: null, Remarks: '' },
                { LeaveID: 3, EmployeeID: 'E2024007', EmployeeName: 'Watanabe Aoi', Department: 'D003', LeaveType: '年假', StartDate: '2026-09-20', EndDate: '2026-09-24', Days: 5, Reason: '年度休假', Status: '已批准', ApplyTime: '2026-09-01 10:00:00', ApproverID: 'E2024006', ApproveTime: '2026-09-02 09:10:00', Remarks: '同意安排' },
                { LeaveID: 4, EmployeeID: 'E2024009', EmployeeName: '常睿', Department: 'D004', LeaveType: '调休', StartDate: '2026-09-15', EndDate: '2026-09-15', Days: 1, Reason: '周末加班调休', Status: '已拒绝', ApplyTime: '2026-09-03 16:20:00', ApproverID: 'E2024008', ApproveTime: '2026-09-04 10:30:00', Remarks: '本月调休额度已用完' },
                { LeaveID: 5, EmployeeID: 'E2024011', EmployeeName: '徐璐', Department: 'D002', LeaveType: '婚假', StartDate: '2026-10-08', EndDate: '2026-10-14', Days: 7, Reason: '结婚', Status: '待审批', ApplyTime: '2026-09-08 11:15:00', ApproverID: '', ApproveTime: null, Remarks: '' }
            ],
            // 任务表（EmployeeMission）
            missions: [
                { ID: 1, EmployeeID: 'E2024003', EmployeeName: 'Kudo Airi', MissionContent: '完成行政部三季度档案整理工作', MissionDeadline: '2026-09-15', IsCompleted: false, CompleteTime: null, Status: '待执行', SubmitContent: '', SubmitTime: null, Score: null, ScoreComment: '', ScoreTime: null, AssignTime: '2026-08-20 10:00:00' },
                { ID: 2, EmployeeID: 'E2024003', EmployeeName: 'Kudo Airi', MissionContent: '更新员工通讯录', MissionDeadline: '2026-09-20', IsCompleted: false, CompleteTime: null, Status: '待执行', SubmitContent: '', SubmitTime: null, Score: null, ScoreComment: '', ScoreTime: null, AssignTime: '2026-08-25 09:30:00' },
                { ID: 3, EmployeeID: 'E2024003', EmployeeName: 'Kudo Airi', MissionContent: '协助筹备季度会议场地', MissionDeadline: '2026-09-08', IsCompleted: true, CompleteTime: '2026-09-06 15:30:00', Status: '已评分', SubmitContent: '已完成会议场地预约与布置方案，包含设备调试与座位安排。', SubmitTime: '2026-09-06 15:00:00', Score: 90, ScoreComment: '场地筹备高效，方案细致到位。', ScoreTime: '2026-09-06 16:00:00', AssignTime: '2026-08-15 10:00:00' },
                { ID: 4, EmployeeID: 'E2024004', EmployeeName: '李强', MissionContent: '完成系统模块联调测试', MissionDeadline: '2026-09-18', IsCompleted: false, CompleteTime: null, Status: '待执行', SubmitContent: '', SubmitTime: null, Score: null, ScoreComment: '', ScoreTime: null, AssignTime: '2026-09-01 09:00:00' },
                { ID: 5, EmployeeID: 'E2024004', EmployeeName: '李强', MissionContent: '修复登录页样式兼容性问题', MissionDeadline: '2026-09-10', IsCompleted: true, CompleteTime: '2026-09-09 17:20:00', Status: '已评分', SubmitContent: '已修复Chrome/Firefox/Edge三端兼容问题，并补充移动端适配。', SubmitTime: '2026-09-09 16:30:00', Score: 88, ScoreComment: '修复及时，兼容性测试覆盖到位。', ScoreTime: '2026-09-09 18:00:00', AssignTime: '2026-09-02 09:00:00' },
                { ID: 6, EmployeeID: 'E2024011', EmployeeName: '徐璐', MissionContent: '输出三季度技术培训计划', MissionDeadline: '2026-09-22', IsCompleted: false, CompleteTime: null, Status: '待执行', SubmitContent: '', SubmitTime: null, Score: null, ScoreComment: '', ScoreTime: null, AssignTime: '2026-09-05 14:00:00' },
                { ID: 7, EmployeeID: 'E2024005', EmployeeName: '袁致远', MissionContent: '整理项目需求文档V2', MissionDeadline: '2026-09-25', IsCompleted: false, CompleteTime: null, Status: '待执行', SubmitContent: '', SubmitTime: null, Score: null, ScoreComment: '', ScoreTime: null, AssignTime: '2026-09-08 11:00:00' }
            ],
            // 绩效考核（PerformanceReviews）
            reviews: [
                { ReviewID: 1, EmployeeID: 'E2024004', EmployeeName: '李强', Department: 'D002', ReviewPeriod: '2026年Q2', PerformanceScore: 88.0, KPICompletion: 92.0, WorkQuality: '良好', TeamworkScore: 90.0, ReviewComments: '模块开发质量稳定，进度把控良好', ReviewerID: 'E2024002', ReviewDate: '2026-07-10 10:00:00', Status: '已审核' },
                { ReviewID: 2, EmployeeID: 'E2024011', EmployeeName: '徐璐', Department: 'D002', ReviewPeriod: '2026年Q2', PerformanceScore: 65.0, KPICompletion: 70.0, WorkQuality: '待改进', TeamworkScore: 72.0, ReviewComments: '任务完成度不足，需加强时间管理', ReviewerID: 'E2024002', ReviewDate: '2026-07-11 14:00:00', Status: '已审核' },
                { ReviewID: 3, EmployeeID: 'E2024012', EmployeeName: 'Ogawa Shino', Department: 'D002', ReviewPeriod: '2026年Q2', PerformanceScore: 92.5, KPICompletion: 95.0, WorkQuality: '优秀', TeamworkScore: 94.0, ReviewComments: '表现突出，主动承担关键任务', ReviewerID: 'E2024002', ReviewDate: '2026-07-12 09:30:00', Status: '已审核' },
                { ReviewID: 4, EmployeeID: 'E2024013', EmployeeName: '蔡云熙', Department: 'D003', ReviewPeriod: '2026年Q2', PerformanceScore: 85.5, KPICompletion: 88.0, WorkQuality: '良好', TeamworkScore: 86.0, ReviewComments: '招聘工作完成较好', ReviewerID: 'E2024006', ReviewDate: '2026-07-09 15:20:00', Status: '已提交' },
                { ReviewID: 5, EmployeeID: 'E2024009', EmployeeName: '常睿', Department: 'D004', ReviewPeriod: '2026年Q2', PerformanceScore: 76.0, KPICompletion: 80.0, WorkQuality: '一般', TeamworkScore: 78.0, ReviewComments: '报表处理及时性有待提升', ReviewerID: 'E2024008', ReviewDate: '2026-07-08 11:00:00', Status: '已审核' },
                { ReviewID: 6, EmployeeID: 'E2024010', EmployeeName: '陈静', Department: 'D004', ReviewPeriod: '2026年Q2', PerformanceScore: 0, KPICompletion: 0, WorkQuality: '', TeamworkScore: 0, ReviewComments: '', ReviewerID: '', ReviewDate: null, Status: '待提交' },
                { ReviewID: 7, EmployeeID: 'E2024007', EmployeeName: 'Watanabe Aoi', Department: 'D003', ReviewPeriod: '2026年Q3', PerformanceScore: 0, KPICompletion: 0, WorkQuality: '', TeamworkScore: 0, ReviewComments: '', ReviewerID: '', ReviewDate: null, Status: '待提交' }
            ],
            // 集团公告板（哈夫克集团内部动态 / 公告）
            announcements: [
                { ID: 1, Title: '曼德尔砖技术结晶研究取得阶段性突破', Content: '研发中心已完成第三代曼德尔砖能源核心的封装测试，能量转化效率提升 18%。集团决定加快量产筹备，相关设备清单请各分部于本周五前报送。', PublisherID: 'E2024001', PublisherName: 'admin', PublisherDept: 'D001', Scope: '集团', PublishTime: '2026-09-18 09:00:00' },
                { ID: 2, Title: '「零号大坝」项目二期工程进度通报', Content: '零号大坝二期坝体加固已完成 72%，自动化灌溉系统进入联调阶段。请技术部安排两名工程师下周三赴现场支持设备验收。', PublisherID: 'E2024002', PublisherName: '张伟', PublisherDept: 'D002', Scope: 'D002', PublishTime: '2026-09-16 14:30:00' },
                { ID: 3, Title: '深瞳·深脑接口系统 Q3 测试排期', Content: '根据 Relink 实验室安排，深瞳（DeepPupil）与深脑（DeepBrain）接口系统将于本季度末进行跨部门联合测试，请各位同事提前完成数据台账整理。', PublisherID: 'E2024002', PublisherName: '张伟', PublisherDept: 'D002', Scope: 'D002', PublishTime: '2026-09-12 10:00:00' },
                { ID: 4, Title: 'Relink 2.0 医用脑机全球推广进展', Content: 'Relink 2.0 已完成多国医疗资质备案，彩虹桥（Rainbow Bridge）脑-脑直连模块进入临床推广阶段。集团总部将于下月召开全球分部视频会议。', PublisherID: 'E2024001', PublisherName: 'admin', PublisherDept: 'D001', Scope: '集团', PublishTime: '2026-09-10 16:00:00' },
                { ID: 5, Title: '人事部：第三季度人才招募计划启动', Content: '面向阿萨拉分部与核电招聘部的人才输送计划已启动，岗位包括高级算法工程师、军工项目协调员与物流调度专员，推荐通道即日开放。', PublisherID: 'E2024006', PublisherName: '王芳', PublisherDept: 'D003', Scope: 'D003', PublishTime: '2026-09-08 11:20:00' },
                { ID: 6, Title: '财务部：季度预算与差旅报销截止提醒', Content: '本季度差旅报销与预算申报将于 9 月 30 日截止，逾期将顺延至下季度处理。请各部门主管核查本部门申报明细。', PublisherID: 'E2024008', PublisherName: '刘洋', PublisherDept: 'D004', Scope: 'D004', PublishTime: '2026-09-05 09:40:00' }
            ],
            // 集团大事记（哈夫克发展历程，全员可阅）
            milestones: [
                { ID: 1, Year: '1993', Category: '集团前史', Title: '黑鹰坠落：信念的种子', Content: '6 岁的雅各布·哈夫克在索马里摩加迪沙事件中失去双亲。亲眼目睹战乱与资源失衡带来的苦难后，他立下"以绝对强权与技术实现全球资源平等"的信念。' },
                { ID: 2, Year: '2007', Category: '集团创立', Title: '哈夫克集团正式创立', Content: '雅各布·哈夫克继承父母 ERI 人道救援组织遗志，创立哈夫克集团，业务覆盖计算、物流与人工智能开发，同年 CTO 巴希尔加入，集团驶入快车道。' },
                { ID: 3, Year: '2011', Category: '重大项目', Title: '签署阿萨拉合作协议', Content: '哈夫克集团与阿萨拉王室正式签署合作协议，启动"零号大坝"世纪工程，以水电基建换取稀有资源开发权。' },
                { ID: 4, Year: '2018', Category: '重大项目', Title: '零号大坝竣工：第一块曼德尔砖', Content: '历时七年，零号大坝竣工——世界最大水力发电装置，为阿萨拉全境供水供电。大坝部署了世界上第一块曼德尔砖作为处理核心，并由 ERAIS（资源平等人工智能系统）原型统一调度。' },
                { ID: 5, Year: '2021', Category: '科研突破', Title: '曼德尔砖量产技术成熟', Content: '曼德尔砖——融合超算与 AI 算法的科技结晶实现量产。单砖算力远超全球现有超算中心，可精准预测粮食、能源与极端天气等全球性挑战。' },
                { ID: 6, Year: '2023', Category: '科研突破', Title: 'Relink 脑机实验室成立', Content: '哈夫克成立 Relink 实验室，研发深瞳（DeepPupil）、深脑（DeepBrain）与彩虹桥（Rainbow Bridge）脑-脑直连技术，进军医用脑机接口领域。' },
                { ID: 7, Year: '2024', Category: '集团大事', Title: '阿萨拉试验场全境部署', Content: '集团在阿萨拉全境部署先进设施、试验基地与安全节点，零号大坝区域成为国家级重点工程示范区。' },
                { ID: 8, Year: '2035', Category: '集团大事', Title: '全球市值第一的科技集团', Content: '哈夫克集团市值登顶全球第一，业务覆盖计算、物流、AI 开发与军工安保，分支机构遍布全球。' }
            ],
            // 值班排班（主管排班 → 员工查看 → 管理员全局）
            duties: [
                { DutyID: 1, DutyDate: '2026-09-23', Shift: '早班', EmployeeID: 'E2024017', EmployeeName: 'kr', Department: 'D002', Remark: '零号大坝项目联调值守', CreatedBy: 'E2024002', CreateTime: '2026-09-20 10:00:00' },
                { DutyID: 2, DutyDate: '2026-09-24', Shift: '晚班', EmployeeID: 'E2024002', EmployeeName: '张伟', Department: 'D002', Remark: '', CreatedBy: 'E2024002', CreateTime: '2026-09-20 10:00:00' },
                { DutyID: 3, DutyDate: '2026-09-25', Shift: '夜班', EmployeeID: 'E2024017', EmployeeName: 'kr', Department: 'D002', Remark: '深脑接口测试值班', CreatedBy: 'E2024002', CreateTime: '2026-09-21 14:00:00' },
                { DutyID: 4, DutyDate: '2026-09-24', Shift: '早班', EmployeeID: 'E2024006', EmployeeName: '王芳', Department: 'D003', Remark: '季度招聘现场支持', CreatedBy: 'E2024006', CreateTime: '2026-09-21 09:30:00' }
            ],
            // 意见反馈（员工提交 → 主管/管理员处理）
            feedbacks: [
                { FeedbackID: 1, Type: '建议', Content: '建议员工门户增加内部通讯录功能，方便跨部门协作联系。', EmployeeID: 'E2024017', EmployeeName: 'kr', Department: 'D002', CreateTime: '2026-09-15 11:20:00', Status: '已处理', HandleNote: '已采纳，通讯录功能已上线。', HandleBy: 'admin', HandleTime: '2026-09-18 09:00:00' },
                { FeedbackID: 2, Type: '求助', Content: '零号大坝项目现场设备的操作手册存放在哪里？', EmployeeID: 'E2024018', EmployeeName: 'dbh', Department: 'D002', CreateTime: '2026-09-16 15:40:00', Status: '待处理', HandleNote: '', HandleBy: '', HandleTime: null }
            ],
            // 差旅报销（员工提交 → 主管/管理员审批）
            expenses: [
                { ExpenseID: 1, Title: '广州—北京差旅（零号大坝项目对接）', Amount: 2860.50, Category: '差旅', ExpenseDate: '2026-09-12', Description: '参加零号大坝项目对接会，往返机票与两晚住宿。', EmployeeID: 'E2024017', EmployeeName: 'kr', Department: 'D002', CreateTime: '2026-09-14 09:30:00', Status: '待审批', ApproveNote: '', ApproveBy: '', ApproveTime: null },
                { ExpenseID: 2, Title: '技术部季度团建物资采购', Amount: 1200.00, Category: '办公', ExpenseDate: '2026-09-08', Description: '技术部 Q3 团建活动物资与场地布置。', EmployeeID: 'E2024018', EmployeeName: 'dbh', Department: 'D002', CreateTime: '2026-09-09 15:20:00', Status: '已批准', ApproveNote: '同意，从部门活动经费列支。', ApproveBy: 'admin', ApproveTime: '2026-09-10 10:00:00' }
            ],
            // 培训课程（管理员/主管发布 → 员工报名学习）
            trainings: [
                { TrainingID: 1, Title: '曼德尔砖安全操作规范', Category: '安全', Content: '学习曼德尔砖的存放、运输与异常处置规范，掌握能量核心在非常规状态下的标准操作流程。', Instructor: '总部安全培训部', Hours: 4, Deadline: '2026-10-31', Status: '进行中', CreatedBy: 'admin', CreateTime: '2026-09-01 09:00:00' },
                { TrainingID: 2, Title: 'Relink 医用脑机设备操作', Category: '技术', Content: '面向 Relink 实验室协作人员，讲解深瞳（DeepPupil）与深脑（DeepBrain）设备的基础操作与数据采集注意事项。', Instructor: 'Relink 实验室', Hours: 8, Deadline: '2026-11-15', Status: '进行中', CreatedBy: 'admin', CreateTime: '2026-09-05 14:00:00' },
                { TrainingID: 3, Title: '军工项目保密合规培训', Category: '合规', Content: '集团军工板块保密制度与信息安全红线，涵盖敏感项目外发、介质管理与离岗保密义务。', Instructor: '法务合规部', Hours: 3, Deadline: '2026-10-15', Status: '进行中', CreatedBy: 'admin', CreateTime: '2026-09-08 10:30:00' },
                { TrainingID: 4, Title: '零号大坝应急演练指南', Category: '安全', Content: '大坝区域洪涝与设备故障应急演练流程，值班人员必学。', Instructor: '安全培训部', Hours: 2, Deadline: '2026-09-30', Status: '进行中', CreatedBy: 'admin', CreateTime: '2026-09-10 16:00:00' }
            ],
            trainingEnrolls: [
                { ID: 1, TrainingID: 1, EmployeeID: 'E2024017', EnrollTime: '2026-09-15 10:00:00', Completed: false, CompleteTime: null },
                { ID: 2, TrainingID: 4, EmployeeID: 'E2024017', EnrollTime: '2026-09-16 11:00:00', Completed: true, CompleteTime: '2026-09-18 17:00:00' }
            ],
            // 个人信息变更申请（员工提交 → 主管/管理员审批）
            profileUpdates: [
                { UpdateID: 1, EmployeeID: 'E2024017', EmployeeName: 'kr', Department: 'D002', Field: '联系电话', OldValue: '13800000017', NewValue: '13900000017', Reason: '更换了常用手机号码', CreateTime: '2026-09-20 09:00:00', Status: '待审批', ApproveBy: '', ApproveTime: null }
            ],
            // 文件柜（元数据存 localStorage，文件内容存 IndexedDB）
            fileVault: [],
            // 工作周报（员工提交 → 主管/管理员点评）
            weeklyReports: [
                { ReportID: 1, WeekLabel: '2026年第38周', Done: '完成零号大坝项目数据台账整理；协助深脑接口测试环境搭建。', Plan: '配合完成深脑接口联合测试；整理曼德尔砖安全操作规范学习笔记。', Issue: '测试设备资源紧张，建议协调增加一台备用机。', EmployeeID: 'E2024017', EmployeeName: 'kr', Department: 'D002', CreateTime: '2026-09-19 17:30:00', ReviewNote: '', ReviewBy: '', ReviewTime: null }
            ],
            // 设备申领（员工申请 → 主管/管理员审批发放）
            equipRequests: [
                { ReqID: 1, Category: '笔记本电脑', Spec: 'ThinkPad X1 Carbon（16G/512G）', Quantity: 1, Reason: '现用笔记本老化严重，影响开发调试效率。', EmployeeID: 'E2024017', EmployeeName: 'kr', Department: 'D002', CreateTime: '2026-09-21 10:00:00', Status: '待审批', ApproveNote: '', ApproveBy: '', ApproveTime: null }
            ],
            // 员工嘉奖（主管/管理员发布，全员可见）
            recognitions: [
                { RecID: 1, FromID: 'E2024002', FromName: '张伟', ToID: 'E2024017', ToName: 'kr', Department: 'D002', Type: '嘉奖', Content: '在深脑接口测试中主动排查出数据同步异常，为项目节省两天排障时间。', CreateTime: '2026-09-18 15:00:00' },
                { RecID: 2, FromID: 'E2024001', FromName: 'admin', ToID: 'E2024018', ToName: 'dbh', Department: 'D002', Type: '榜样', Content: '技术部 Q3 任务交付及时率 100%，团队管理表现突出。', CreateTime: '2026-09-17 11:20:00' }
            ],
            // 站内消息（员工部门内对话 / 主管跨部门主管 / 管理员全局）
            messages: [
                { MsgID: 1, FromID: 'E2024002', FromName: '张伟', ToID: 'E2024017', ToName: 'kr', Type: 'text', Content: 'kr 你好，我是技术部张伟，新系统演示数据已就绪，欢迎体验消息功能。', Time: '2026-09-20 10:12:00', Read: true },
                { MsgID: 2, FromID: 'E2024017', FromName: 'kr', ToID: 'E2024002', ToName: '张伟', Type: 'text', Content: '收到，谢谢张伟哥！我这就去看。', Time: '2026-09-20 10:15:00', Read: true }
            ],
            // 薪资条（员工查自己，管理员管全员）
            salaries: [
                { SalaryID: 1, EmployeeID: 'E2024017', Month: '2026-09', Base: 6800, Performance: 1500, Allowance: 800, Deduction: 620, Note: '含社保公积金及个税代扣', CreateTime: '2026-09-25 09:00:00' },
                { SalaryID: 2, EmployeeID: 'E2024018', Month: '2026-09', Base: 9800, Performance: 2600, Allowance: 1200, Deduction: 1040, Note: '', CreateTime: '2026-09-25 09:00:00' },
                { SalaryID: 3, EmployeeID: 'E2024001', Month: '2026-09', Base: 15000, Performance: 4000, Allowance: 1500, Deduction: 2100, Note: '', CreateTime: '2026-09-25 09:00:00' },
                { SalaryID: 4, EmployeeID: 'E2024017', Month: '2026-08', Base: 6800, Performance: 1300, Allowance: 800, Deduction: 610, Note: '', CreateTime: '2026-08-25 09:00:00' }
            ],
            // 会议管理（发起 / 参与 / 会议室占用）
            meetings: [
                { MeetingID: 1, Title: 'Q4 集团战略部署会', Room: '曼德尔会议室', Start: '2026-09-23 09:30', End: '2026-09-23 11:00', OrganizerID: 'E2024001', OrganizerName: 'admin', Participants: ['E2024001', 'E2024002', 'E2024018'], Summary: '部署 Q4 经营目标与零号大坝二期验收节点。', CreateTime: '2026-09-21 14:00:00' }
            ],
            // 劳动合同（到期前 30 天提醒）
            contracts: [
                { ContractID: 1, EmployeeID: 'E2024017', EmployeeName: 'kr', Type: '固定期限', StartDate: '2024-06-01', EndDate: '2027-05-31', Status: '履行中', CreateTime: '2024-05-20 10:00:00' },
                { ContractID: 2, EmployeeID: 'E2024002', EmployeeName: '张伟', Type: '固定期限', StartDate: '2023-03-01', EndDate: '2026-10-20', Status: '履行中', CreateTime: '2023-02-10 10:00:00' },
                { ContractID: 3, EmployeeID: 'E2024001', EmployeeName: 'admin', Type: '无固定期限', StartDate: '2022-01-01', EndDate: '2099-12-31', Status: '履行中', CreateTime: '2022-01-01 10:00:00' }
            ],
            // 日程（个人 / 部门共享）
            schedules: [
                { ScheduleID: 1, Title: '零号大坝项目例会', Date: '2026-09-23', Time: '14:00', Type: '部门', Scope: 'D002', OwnerID: 'E2024018', OwnerName: 'dbh', Note: '每周三例会，汇报联调进度。', CreateTime: '2026-09-21 09:00:00' },
                { ScheduleID: 2, Title: '员工体检', Date: '2026-09-25', Time: '08:30', Type: '集团', Scope: 'ALL', OwnerID: 'E2024001', OwnerName: 'admin', Note: '哈夫克医疗中心，空腹前往。', CreateTime: '2026-09-20 15:00:00' }
            ],
            // 知识库
            knowledge: [
                { KbID: 1, Title: '新员工入职指引', Category: '制度流程', Content: '入职第一天请前往行政部领取工牌与设备，随后完成《哈夫克员工手册》在线签署，并参加当月新员工培训。', AuthorID: 'E2024001', AuthorName: 'admin', CreateTime: '2026-09-01 09:00:00', Views: 36 },
                { KbID: 2, Title: '差旅报销标准', Category: '制度流程', Content: '市内交通实报实销；出差住宿一线城市 500 元/晚上限，其他城市 350 元；餐补 80 元/天。超标部分需在报销单备注原因。', AuthorID: 'E2024001', AuthorName: 'admin', CreateTime: '2026-09-05 10:00:00', Views: 21 },
                { KbID: 3, Title: '深脑接口测试手册', Category: '技术文档', Content: '1. 确认测试环境版本号 ≥ 2.4.1；2. 按 SOP-07 校准曼德尔砖接口参数；3. 记录每次联调的延迟与丢包数据。', AuthorID: 'E2024002', AuthorName: '张伟', CreateTime: '2026-09-10 14:00:00', Views: 15 }
            ],
            // 投票问卷
            polls: [
                { PollID: 1, Title: '团建活动地点投票', Options: [{ text: '室内电竞馆', count: 5 }, { text: '白云山徒步', count: 3 }, { text: '轰趴馆', count: 4 }], CreatorID: 'E2024001', CreatorName: 'admin', CreateTime: '2026-09-18 10:00:00', Expire: '2026-09-30', VotedBy: ['E2024001', 'E2024002', 'E2024017'] }
            ],
            // 固定资产台账
            assets: [
                { AssetID: 1, Name: 'ThinkPad X1 Carbon', Category: '笔记本', SN: 'SN-HK-2024001', Status: '在用', OwnerID: 'E2024017', OwnerName: 'kr', Dept: 'D002', Note: '2024-06 入职配发', UpdateTime: '2024-06-01 09:00:00' },
                { AssetID: 2, Name: '深蓝 27 寸显示器', Category: '显示器', SN: 'SN-HK-2024018', Status: '在用', OwnerID: 'E2024018', OwnerName: 'dbh', Dept: 'D002', Note: '', UpdateTime: '2024-03-10 09:00:00' },
                { AssetID: 3, Name: '集团会议室投影仪', Category: '办公设备', SN: 'SN-HK-2020023', Status: '在库', OwnerID: '', OwnerName: '', Dept: 'D001', Note: '曼德尔会议室固定设备', UpdateTime: '2025-11-01 09:00:00' }
            ],
            // 行政申请（用车 / 用印）
            adminRequests: [
                { ReqID: 1, Type: '用车', Title: '零号大坝项目现场用车', Reason: '项目联调需前往零号大坝现场，申请商务车一辆（半天）。', UseDate: '2026-09-24', ApplicantID: 'E2024017', ApplicantName: 'kr', Department: 'D002', CreateTime: '2026-09-21 16:00:00', Status: '待审批', ApproveNote: '', ApproveBy: '', ApproveTime: null }
            ],
            // 任务简报（主管发布 → 员工回传行动报告）
            briefings: [
                { BriefID: 1, Title: '零号大坝二期数据联调', Mission: '配合完成深脑接口二期数据联调，输出联调报告与问题清单。', Dept: 'D002', AuthorID: 'E2024002', AuthorName: '张伟', CreateTime: '2026-09-22 09:00:00', Status: '进行中', Reports: [] }
            ],
            // 干员技能矩阵（技能定义 + 员工掌握度）
            skillDefs: [
                { SkillID: 1, Name: '深脑接口运维', Category: '技术', Dept: 'D002' },
                { SkillID: 2, Name: '渗透测试', Category: '技术', Dept: 'D002' },
                { SkillID: 3, Name: '战术行动协同', Category: '行动', Dept: 'D002' },
                { SkillID: 4, Name: '档案保密管理', Category: '行政', Dept: 'D001' },
                { SkillID: 5, Name: '曼德尔砖工艺', Category: '技术', Dept: 'D003' }
            ],
            skillLevels: [
                { SkillID: 1, EmployeeID: 'E2024017', Level: 4, UpdatedAt: '2026-09-10 10:00:00' },
                { SkillID: 2, EmployeeID: 'E2024017', Level: 3, UpdatedAt: '2026-09-10 10:00:00' },
                { SkillID: 3, EmployeeID: 'E2024018', Level: 4, UpdatedAt: '2026-09-10 10:00:00' },
                { SkillID: 4, EmployeeID: 'E2024001', Level: 5, UpdatedAt: '2026-09-10 10:00:00' }
            ],
            // 演习警报（等级横幅提醒）
            // 演习警报（V18 起默认清空：公司内网，平时不亮，仅管理员手动发布真实警报）
            alerts: [],
            // 操作日志（审计）
            auditLogs: [
                { LogID: 1, OperatorID: 'E2024001', OperatorName: 'admin', Action: '登录', Target: '员工门户', Detail: '管理员登录系统', Time: '2026-09-22 08:05:00' }
            ],
            // 干员晋级申请（员工发起 → 主管/管理员审批）
            advanceRequests: [
                { AdvID: 1, EmployeeID: 'E2024017', EmployeeName: 'kr', FromRank: '新进干员', ToRank: '正式干员', Reason: '入职满一年，绩效稳定在 85 分以上，申请晋级正式干员。', Status: '待审批', ApproveNote: '', CreateTime: '2026-09-21 15:00:00' }
            ],
            // 人事流程（转正 / 离职）
            workFlows: [
                { FlowID: 1, EmployeeID: 'E2024017', EmployeeName: 'kr', Type: '转正', Content: '试用期 6 个月期满，工作表现良好，申请转正。', Status: '待审批', ApproveNote: '', CreateTime: '2026-09-21 16:00:00' }
            ],
            // 部门群聊（按部门存）
            groupMessages: [
                { GMsgID: 1, Dept: 'D002', FromID: 'E2024002', FromName: '张伟', Content: '欢迎各位加入技术部群组，重要通知会在此发布。', Time: '2026-09-20 09:00:00' }
            ],
            // 考勤规则（单条配置：上下班时间 / 迟到阈值 / 节假日白名单）
            attendanceRules: [
                { RuleID: 1, WorkStart: '09:00', WorkEnd: '18:00', LateThreshold: 0, Holidays: [], UpdateBy: 'admin', UpdateTime: '2026-09-22 09:00:00' }
            ],
            // 审批委托代理（主管/管理员设置）
            approvalDelegations: [
                { DelegationID: 1, FromID: 'E2024002', FromName: '张伟', ToID: 'E2024018', ToName: 'dbh', Dept: 'D002', StartDate: '2026-09-22', EndDate: '2026-09-30', Status: '生效中', CreateTime: '2026-09-22 09:00:00' }
            ],
            // 离职交接清单（离职流程批准后生成）
            resignHandovers: [
                { HandoverID: 1, FlowID: 1, EmployeeID: 'E2024017', EmployeeName: 'kr', Dept: 'D002', Items: [{ Name: '归还办公设备（电脑/门禁卡）', Done: false }, { Name: '移交在办任务与文档', Done: false }, { Name: '权限与账号回收', Done: false }], Status: '进行中', CreateTime: '2026-09-22 09:00:00' }
            ],
            // 部门编制（管理员设置，缺编预警）
            deptHeadcounts: [
                { HCID: 1, Dept: 'D001', Headcount: 6, Note: '行政部' },
                { HCID: 2, Dept: 'D002', Headcount: 10, Note: '技术部' },
                { HCID: 3, Dept: 'D003', Headcount: 8, Note: '人事部' },
                { HCID: 4, Dept: 'D004', Headcount: 5, Note: '财务部' },
                { HCID: 5, Dept: 'D005', Headcount: 4, Note: '核电招聘部' }
            ],
            // V15 管理后台扩展：角色（null=使用内置默认导航；数组=自定义导航白名单）
            roles: [
                { RoleID: 1, RoleName: '普通员工', PermLevel: 1, AllowedNav: null, Remark: '内置角色' },
                { RoleID: 2, RoleName: '部门主管', PermLevel: 2, AllowedNav: null, Remark: '内置角色' },
                { RoleID: 3, RoleName: '系统管理员', PermLevel: 3, AllowedNav: null, Remark: '内置角色' }
            ],
            // 注册申请（员工自助注册 → 管理员审批通过后生成账号）
            regRequests: [
                { ReqID: 1, Name: '陈晨', Gender: '女', Department: 'D002', Position: '算法工程师', Phone: '13800001234', Email: 'chenchen@havvk.com', Reason: '集团校招新入职，申请员工账号。', Status: '待审批', RequestTime: '2026-09-21 14:30:00', ApproverID: '', ApproveTime: null }
            ],
            // 评论（公告/知识文章，管理员可审核删除）
            comments: [
                { CommentID: 1, TargetType: '公告', TargetID: 1, Content: '效率提升 18%，曼德尔砖量产指日可待！', AuthorID: 'E2024017', AuthorName: 'kr', Time: '2026-09-18 10:12:00', Status: '正常' },
                { CommentID: 2, TargetType: '公告', TargetID: 2, Content: '已收到，技术部将安排工程师下周三现场支持。', AuthorID: 'E2024018', AuthorName: 'dbh', Time: '2026-09-16 15:20:00', Status: '正常' }
            ],
            // 网站配置（系统设置-网站配置）
            settings: { SiteName: '哈夫克集团 · 员工门户系统', ThemeColor: '#0e5fb7', FooterText: 'HAVVK GROUP © 2026 哈夫克集团版权所有', UpdatedBy: 'admin', UpdateTime: '2026-09-22 08:00:00' },
            // 异常日志（window.onerror 捕获，管理员查看）
            errorLogs: [
                { ErrID: 1, Message: '系统自检：无异常', Source: 'bootstrap', Line: 0, Time: '2026-09-22 08:00:00', Page: 'hr.html' }
            ]
        };
    }

    var db = null;

    // 迁移：删除旧管理员 Hirano Yuna，新增管理员 admin/admin
    // （兼容浏览器 localStorage 中已存在的旧种子数据）
    function migrateAdmin(oldDb) {
        var changed = false;
        // 1. 移除 Hirano Yuna（任意职位）与残留的 admin 记录
        var emps = oldDb.employees.filter(function (e) {
            return e.EmployeeName !== 'Hirano Yuna' && e.EmployeeName !== 'admin';
        });
        if (emps.length !== oldDb.employees.length) changed = true;
        // 2. 若还没有 admin 管理员则添加（复用 E2024001 工号，维持部门经理关联）
        var hasAdmin = emps.some(function (e) { return e.PermissionLevel === 3 && e.EmployeeName === 'admin'; });
        if (!hasAdmin) {
            emps.push({ EmployeeID: 'E2024001', EmployeeName: 'admin', Gender: '男', Age: 30, Department: 'D001', PermissionLevel: 3, PhoneNumber: '13800000000', Email: 'admin@havvk.com', IsActive: true, Password: 'admin', Remarks: '集团管理员', CreatedAt: '2024-01-01 09:00:00' });
            changed = true;
        }
        oldDb.employees = emps;
        // 3. 清理考勤表中 Hirano Yuna 的记录
        var atts = oldDb.attendance.filter(function (a) { return a.EmployeeName !== 'Hirano Yuna' && a.EmployeeID !== 'E2024001'; });
        if (atts.length !== oldDb.attendance.length) changed = true;
        oldDb.attendance = atts;
        // 4. 部门 D001 经理指向 admin
        oldDb.departments.forEach(function (d) {
            if (d.DepartmentID === 1 && d.ManagerID !== 'E2024001') { d.ManagerID = 'E2024001'; changed = true; }
        });
        // 5. 补齐新增账号：kr（员工）/ dbh（主管），密码 123456
        var acc = [
            { EmployeeID: 'E2024017', EmployeeName: 'kr', Gender: '男', Age: 25, Department: 'D002', PermissionLevel: 1, PhoneNumber: '13800000017', Email: 'kr@havvk.com', IsActive: true, Password: '123456', Remarks: '', CreatedAt: '2026-09-22 09:00:00' },
            { EmployeeID: 'E2024018', EmployeeName: 'dbh', Gender: '男', Age: 35, Department: 'D002', PermissionLevel: 2, PhoneNumber: '13800000018', Email: 'dbh@havvk.com', IsActive: true, Password: '123456', Remarks: '部门主管', CreatedAt: '2026-09-22 09:00:00' }
        ];
        acc.forEach(function (a) {
            if (!emps.some(function (e) { return e.EmployeeName === a.EmployeeName; })) {
                emps.push(a);
                changed = true;
            }
        });
        oldDb.employees = emps;
        // 6. 任务表补齐任务流转字段（兼容旧数据）
        if (oldDb.missions) {
            oldDb.missions.forEach(function (m) {
                var need = false;
                if (!m.Status) { m.Status = m.IsCompleted ? '已评分' : '待执行'; need = true; }
                if (!m.SubmitContent) { m.SubmitContent = m.SubmitContent || ''; need = true; }
                if (m.SubmitTime === undefined) { m.SubmitTime = null; need = true; }
                if (m.Score === undefined || m.Score === null) { m.Score = null; need = true; }
                if (m.ScoreComment === undefined) { m.ScoreComment = ''; need = true; }
                if (m.ScoreTime === undefined) { m.ScoreTime = null; need = true; }
                if (m.AssignTime === undefined) { m.AssignTime = m.CompleteTime || ''; need = true; }
                if (m.Attachments === undefined) { m.Attachments = m.Attachments || []; need = true; }
                if (m.SubmitAttachments === undefined) { m.SubmitAttachments = m.SubmitAttachments || []; need = true; }
                if (need) changed = true;
            });
        }
        // 7. 补齐公告板数据（兼容旧库）
        if (!oldDb.announcements || !oldDb.announcements.length) {
            oldDb.announcements = seed().announcements;
            changed = true;
        }
        // 8. 补齐大事记 / 值班 / 反馈（兼容旧库）
        if (!oldDb.milestones) { oldDb.milestones = seed().milestones; changed = true; }
        if (!oldDb.duties) { oldDb.duties = []; changed = true; }
        if (!oldDb.feedbacks) { oldDb.feedbacks = seed().feedbacks; changed = true; }
        // 9. 补齐报销 / 培训 / 资料变更（兼容旧库）
        if (!oldDb.expenses) { oldDb.expenses = seed().expenses; changed = true; }
        if (!oldDb.trainings) { oldDb.trainings = seed().trainings; changed = true; }
        if (!oldDb.trainingEnrolls) { oldDb.trainingEnrolls = seed().trainingEnrolls; changed = true; }
        if (!oldDb.profileUpdates) { oldDb.profileUpdates = seed().profileUpdates; changed = true; }
        // 10. 补齐文件柜 / 周报 / 设备申领 / 嘉奖（兼容旧库）
        if (!oldDb.fileVault) { oldDb.fileVault = []; changed = true; }
        if (!oldDb.weeklyReports) { oldDb.weeklyReports = seed().weeklyReports; changed = true; }
        if (!oldDb.equipRequests) { oldDb.equipRequests = seed().equipRequests; changed = true; }
        if (!oldDb.recognitions) { oldDb.recognitions = seed().recognitions; changed = true; }
        // 11. 补齐站内消息
        if (!oldDb.messages) { oldDb.messages = []; changed = true; }
        // 12. 补齐 V12 扩展功能表
        if (!oldDb.salaries) { oldDb.salaries = seed().salaries; changed = true; }
        if (!oldDb.meetings) { oldDb.meetings = seed().meetings; changed = true; }
        if (!oldDb.contracts) { oldDb.contracts = seed().contracts; changed = true; }
        if (!oldDb.schedules) { oldDb.schedules = seed().schedules; changed = true; }
        if (!oldDb.knowledge) { oldDb.knowledge = seed().knowledge; changed = true; }
        if (!oldDb.polls) { oldDb.polls = seed().polls; changed = true; }
        if (!oldDb.assets) { oldDb.assets = seed().assets; changed = true; }
        if (!oldDb.adminRequests) { oldDb.adminRequests = seed().adminRequests; changed = true; }
        if (!oldDb.briefings) { oldDb.briefings = seed().briefings; changed = true; }
        if (!oldDb.skillDefs) { oldDb.skillDefs = seed().skillDefs; changed = true; }
        if (!oldDb.skillLevels) { oldDb.skillLevels = seed().skillLevels; changed = true; }
        if (!oldDb.alerts) { oldDb.alerts = seed().alerts; changed = true; }
        // 13. 补齐 V13 扩展功能表
        if (!oldDb.auditLogs) { oldDb.auditLogs = seed().auditLogs; changed = true; }
        if (!oldDb.advanceRequests) { oldDb.advanceRequests = seed().advanceRequests; changed = true; }
        if (!oldDb.workFlows) { oldDb.workFlows = seed().workFlows; changed = true; }
        if (!oldDb.groupMessages) { oldDb.groupMessages = seed().groupMessages; changed = true; }
        // 14. 补齐 V14 管理侧扩展表
        if (!oldDb.attendanceRules) { oldDb.attendanceRules = seed().attendanceRules; changed = true; }
        if (!oldDb.approvalDelegations) { oldDb.approvalDelegations = seed().approvalDelegations; changed = true; }
        if (!oldDb.resignHandovers) { oldDb.resignHandovers = seed().resignHandovers; changed = true; }
        if (!oldDb.deptHeadcounts) { oldDb.deptHeadcounts = seed().deptHeadcounts; changed = true; }
        // 15. 考勤 CheckType 规范化（旧数据 '上班打卡' → '上班'）
        (oldDb.attendance || []).forEach(function (a) {
            if (a.CheckType === '上班打卡') { a.CheckType = '上班'; changed = true; }
            else if (a.CheckType === '下班打卡') { a.CheckType = '下班'; changed = true; }
        });
        // 16. 补齐 V15 管理后台扩展表
        if (!oldDb.roles) { oldDb.roles = seed().roles; changed = true; }
        if (!oldDb.regRequests) { oldDb.regRequests = seed().regRequests; changed = true; }
        if (!oldDb.comments) { oldDb.comments = seed().comments; changed = true; }
        if (!oldDb.settings) { oldDb.settings = seed().settings; changed = true; }
        if (!oldDb.errorLogs) { oldDb.errorLogs = seed().errorLogs; changed = true; }
        // V17 公司内网：移除预置"演习"警报（平时不亮，仅管理员手动发布真实警报）
        if (oldDb.alerts && oldDb.alerts.some(function (a) { return (a.Title || '').indexOf('演习') >= 0; })) {
            oldDb.alerts = oldDb.alerts.filter(function (a) { return (a.Title || '').indexOf('演习') < 0; });
            changed = true;
        }
        return changed;
    }

    function load() {
        try {
            var raw = localStorage.getItem(KEY);
            if (raw) {
                db = JSON.parse(raw);
                if (db && db.employees) {
                    if (migrateAdmin(db)) save();
                }
                return db;
            }
        } catch (e) { }
        db = seed();
        save();
        return db;
    }

    // 各表主键映射（用于多标签并发合并）
    var TABLE_PK = {
        employees: 'ID', attendance: 'ID', leaves: 'LeaveID', missions: 'MissionID',
        reviews: 'ReviewID', expenses: 'ExpenseID', trainings: 'TrainingID',
        trainingEnrolls: 'EnrollID', profileUpdates: 'UpdateID', fileVault: 'FileID',
        weeklyReports: 'ReportID', equipRequests: 'ReqID', recognitions: 'RecogID',
        messages: 'MsgID', salaries: 'SalaryID', meetings: 'MeetingID',
        contracts: 'ContractID', schedules: 'ScheduleID', knowledge: 'DocID',
        polls: 'PollID', assets: 'AssetID', adminRequests: 'ReqID',
        briefings: 'BriefingID', alerts: 'AlertID', auditLogs: 'LogID',
        advanceRequests: 'AdvID', workFlows: 'FlowID', groupMessages: 'GMsgID',
        approvalDelegations: 'DelegationID', resignHandovers: 'HandoverID',
        deptHeadcounts: 'HCID', securityReviews: 'ReviewID', votes: 'VoteID',
        candidates: 'CandidateID', pollVotes: 'VoteID'
    };

    // 多标签并发保护：写前与 localStorage 最新快照合并（新记录按主键并入，避免覆盖丢失）
    function mergeLatest(cur) {
        try {
            var raw = localStorage.getItem(KEY);
            if (!raw) return;
            var latest = JSON.parse(raw);
            if (!latest || latest === cur) return;
            Object.keys(TABLE_PK).forEach(function (t) {
                if (!Array.isArray(cur[t]) || !Array.isArray(latest[t])) return;
                var pk = TABLE_PK[t];
                var ids = {};
                cur[t].forEach(function (row) {
                    if (row && typeof row === 'object' && row[pk] !== undefined && row[pk] !== null) ids[row[pk]] = true;
                });
                latest[t].forEach(function (row) {
                    if (row && typeof row === 'object' && row[pk] !== undefined && row[pk] !== null && !ids[row[pk]]) {
                        cur[t].push(row);
                        ids[row[pk]] = true;
                    }
                });
            });
        } catch (e) { }
    }

    function save() {
        mergeLatest(db);
        try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { }
    }

    // 其他标签写入后同步内存（storage 事件跨标签派发，同标签不触发）
    window.addEventListener('storage', function (e) {
        if (e.key === KEY) {
            try {
                var latest = JSON.parse(e.newValue || 'null');
                if (latest && latest.employees && latest !== db) {
                    // 本页内存中尚未落盘的新记录并入最新快照，避免被其他标签覆盖丢失
                    Object.keys(TABLE_PK).forEach(function (t) {
                        if (!Array.isArray(db[t]) || !Array.isArray(latest[t])) return;
                        var pk = TABLE_PK[t];
                        var ids = {};
                        latest[t].forEach(function (row) {
                            if (row && typeof row === 'object' && row[pk] !== undefined && row[pk] !== null) ids[row[pk]] = true;
                        });
                        db[t].forEach(function (row) {
                            if (row && typeof row === 'object' && row[pk] !== undefined && row[pk] !== null && !ids[row[pk]]) {
                                latest[t].push(row);
                                ids[row[pk]] = true;
                            }
                        });
                    });
                    db = latest;
                    save();
                    if (window.HRDB && HRDB.reloadUI) HRDB.reloadUI();
                }
            } catch (err) { }
        }
    });

    function reset() {
        db = seed();
        save();
    }

    // ------- 员工 -------
    function getEmployees(filter) {
        var list = db.employees.slice();
        filter = filter || {};
        if (filter.keyword) {
            var kw = filter.keyword.toLowerCase();
            list = list.filter(function (e) {
                return (e.EmployeeName || '').toLowerCase().indexOf(kw) >= 0 ||
                    (e.EmployeeID || '').toLowerCase().indexOf(kw) >= 0;
            });
        }
        var deptFilter = filter.department || filter.dept;
        if (deptFilter && deptFilter !== '所有部门') {
            list = list.filter(function (e) { return e.Department === deptFilter; });
        }
        if (filter.status && filter.status !== '所有状态') {
            var active = filter.status === '在职' || filter.status === 'true' || filter.status === '1';
            list = list.filter(function (e) { return !!e.IsActive === !!active; });
        }
        return list;
    }

    function getEmployeeById(id) {
        return db.employees.find(function (e) { return e.EmployeeID === id; }) || null;
    }

    function addEmployee(emp) {
        emp.CreatedAt = fmtNow();
        db.employees.push(emp);
        save();
        recordAudit('新增员工', emp.EmployeeName, '工号 ' + emp.EmployeeID + '，部门 ' + getDeptName(emp.Department));
    }

    function updateEmployee(id, patch) {
        var idx = db.employees.findIndex(function (e) { return e.EmployeeID === id; });
        if (idx >= 0) {
            for (var k in patch) db.employees[idx][k] = patch[k];
            save();
            recordAudit('编辑员工', db.employees[idx].EmployeeName, '工号 ' + id + '，字段：' + Object.keys(patch).join('、'));
            return true;
        }
        return false;
    }

    function deleteEmployee(id) {
        var idx = db.employees.findIndex(function (e) { return e.EmployeeID === id; });
        if (idx >= 0) { var nm = db.employees[idx].EmployeeName; db.employees.splice(idx, 1); save(); recordAudit('删除员工', nm, '工号 ' + id); return true; }
        return false;
    }

    function batchUpdateStatus(ids, isActive) {
        db.employees.forEach(function (e) {
            if (ids.indexOf(e.EmployeeID) >= 0) e.IsActive = isActive;
        });
        save();
        recordAudit('批量' + (isActive ? '启用' : '停用'), '员工', ids.length + ' 名员工');
    }

    function batchDelete(ids) {
        db.employees = db.employees.filter(function (e) { return ids.indexOf(e.EmployeeID) < 0; });
        save();
        recordAudit('批量删除', '员工', ids.length + ' 名员工');
    }

    // ------- 部门 -------
    function getDepartments() {
        return db.departments.map(function (d) {
            var mgr = getEmployeeById(d.ManagerID);
            var count = db.employees.filter(function (e) { return e.Department === d.DepartmentCode && e.IsActive; }).length;
            return {
                DepartmentID: d.DepartmentID, DepartmentCode: d.DepartmentCode,
                DepartmentName: d.DepartmentName, ManagerID: d.ManagerID,
                ManagerName: mgr ? mgr.EmployeeName : '', IsActive: d.IsActive, EmployeeCount: count
            };
        });
    }

    function getDeptName(code) {
        var d = db.departments.find(function (x) { return x.DepartmentCode === code; });
        return d ? d.DepartmentName : code;
    }

    function addDepartment(dept) {
        var maxId = 0;
        db.departments.forEach(function (d) { if (d.DepartmentID > maxId) maxId = d.DepartmentID; });
        dept.DepartmentID = maxId + 1;
        dept.IsActive = true;
        db.departments.push(dept);
        save();
    }

    function updateDepartment(id, patch) {
        var idx = db.departments.findIndex(function (d) { return d.DepartmentID === id; });
        if (idx >= 0) {
            for (var k in patch) db.departments[idx][k] = patch[k];
            save();
            return true;
        }
        return false;
    }

    function deleteDepartment(id) {
        var idx = db.departments.findIndex(function (d) { return d.DepartmentID === id; });
        if (idx >= 0) {
            var code = db.departments[idx].DepartmentCode;
            var cnt = db.employees.filter(function (e) { return e.Department === code && e.IsActive; }).length;
            if (cnt > 0) return { ok: false, msg: '该部门还有 ' + cnt + ' 名在职员工，无法删除' };
            db.departments.splice(idx, 1);
            save();
            return { ok: true };
        }
        return { ok: false, msg: '部门不存在' };
    }

    // ------- 考勤 -------
    function getAttendance(empId) {
        var list = empId ? db.attendance.filter(function (a) { return a.EmployeeID === empId; }) : db.attendance.slice();
        list.sort(function (a, b) { return (b.AttendanceDate + b.AttendanceTime).localeCompare(a.AttendanceDate + a.AttendanceTime); });
        return list;
    }

    function addAttendance(empId, empName, type) {
        var now = new Date();
        var date = fmtDate(now);
        var time = fmtTime(now);
        // 统一打卡类型存储：'上班' / '下班'（兼容 '上班打卡' / '下班打卡' 入参）
        var norm = (type || '').indexOf('上班') === 0 ? '上班' : '下班';
        // 同日同类型去重
        var dup = db.attendance.find(function (a) { return a.EmployeeID === empId && a.AttendanceDate === date && a.CheckType === norm; });
        if (dup) return { ok: false, msg: '今天已' + type + '，请勿重复打卡' };
        var maxId = 0;
        db.attendance.forEach(function (a) { if (a.ID > maxId) maxId = a.ID; });
        db.attendance.push({ ID: maxId + 1, EmployeeID: empId, EmployeeName: empName, AttendanceDate: date, AttendanceTime: time, CheckType: norm });
        save();
        return { ok: true, msg: type + '成功：' + date + ' ' + time };
    }

    // ------- 请假 -------
    function getLeaves(filter) {
        var list = db.leaves.slice();
        filter = filter || {};
        if (filter.empId) list = list.filter(function (l) { return l.EmployeeID === filter.empId; });
        if (filter.status) list = list.filter(function (l) { return l.Status === filter.status; });
        if (filter.leaveType) list = list.filter(function (l) { return l.LeaveType === filter.leaveType; });
        if (filter.keyword) {
            var kw = filter.keyword.toLowerCase();
            list = list.filter(function (l) {
                return (l.EmployeeName || '').toLowerCase().indexOf(kw) >= 0 || (l.EmployeeID || '').toLowerCase().indexOf(kw) >= 0;
            });
        }
        list.sort(function (a, b) { return (b.ApplyTime || '').localeCompare(a.ApplyTime || ''); });
        return list;
    }

    function addLeave(leave) {
        var maxId = 0;
        db.leaves.forEach(function (l) { if (l.LeaveID > maxId) maxId = l.LeaveID; });
        leave.LeaveID = maxId + 1;
        leave.Status = '待审批';
        leave.ApplyTime = fmtNow();
        db.leaves.push(leave);
        save();
    }

    function approveLeave(leaveId, status, approverId, remarks) {
        var idx = db.leaves.findIndex(function (l) { return l.LeaveID === leaveId; });
        if (idx >= 0) {
            db.leaves[idx].Status = status;
            db.leaves[idx].ApproverID = approverId;
            db.leaves[idx].ApproveTime = fmtNow();
            db.leaves[idx].Remarks = remarks;
            save();
            return true;
        }
        return false;
    }

    // ------- 任务 -------
    function getMissions(empId) {
        var list = db.missions.filter(function (m) { return m.EmployeeID === empId; });
        list.sort(function (a, b) {
            if (a.IsCompleted !== b.IsCompleted) return a.IsCompleted ? 1 : -1;
            return (a.MissionDeadline || '').localeCompare(b.MissionDeadline || '');
        });
        return list;
    }

    function completeMission(id) {
        var idx = db.missions.findIndex(function (m) { return m.ID === id; });
        if (idx >= 0) {
            db.missions[idx].IsCompleted = true;
            db.missions[idx].CompleteTime = fmtNow();
            save();
            return true;
        }
        return false;
    }

    // 主管下发任务给员工（状态流转：待执行 → 已提交 → 已评分）
    function addMission(empId, empName, content, deadline, attachments) {
        var maxId = 0;
        db.missions.forEach(function (m) { if (m.ID > maxId) maxId = m.ID; });
        db.missions.push({
            ID: maxId + 1, EmployeeID: empId, EmployeeName: empName,
            MissionContent: content, MissionDeadline: deadline,
            IsCompleted: false, CompleteTime: null,
            Status: '待执行', SubmitContent: '', SubmitTime: null,
            Score: null, ScoreComment: '', ScoreTime: null, AssignTime: fmtNow(),
            Attachments: attachments || []
        });
        save();
        return true;
    }

    // 员工提交任务成果给主管
    function submitMission(id, content, attachments) {
        var idx = db.missions.findIndex(function (m) { return m.ID === id; });
        if (idx >= 0 && db.missions[idx].Status === '待执行') {
            db.missions[idx].Status = '已提交';
            db.missions[idx].SubmitContent = content;
            db.missions[idx].SubmitTime = fmtNow();
            db.missions[idx].SubmitAttachments = attachments || [];
            save();
            return true;
        }
        return false;
    }

    // 主管查收：本部门所有任务（含已提交待评分）
    function getDeptMissions(deptId) {
        var empIds = {};
        db.employees.forEach(function (e) { if (e.Department === deptId) empIds[e.EmployeeID] = 1; });
        var list = db.missions.filter(function (m) { return empIds[m.EmployeeID]; });
        var order = { '待执行': 0, '已提交': 1, '已评分': 2 };
        list.sort(function (a, b) {
            var oa = order[a.Status] || 3, ob = order[b.Status] || 3;
            if (oa !== ob) return oa - ob;
            return ((b.AssignTime || '')).localeCompare((a.AssignTime || ''));
        });
        return list;
    }

    // 主管评分：更新任务状态并写入绩效考核表
    function scoreMission(id, score, comment, reviewerId) {
        var idx = db.missions.findIndex(function (m) { return m.ID === id; });
        if (idx < 0 || db.missions[idx].Status !== '已提交') return false;
        var m = db.missions[idx];
        m.Status = '已评分';
        m.Score = score;
        m.ScoreComment = comment;
        m.ScoreTime = fmtNow();
        m.IsCompleted = true;
        m.CompleteTime = fmtNow();
        // 写入绩效考核表（当前季度）
        var emp = db.employees.find(function (e) { return e.EmployeeID === m.EmployeeID; });
        var now = new Date();
        var q = '2026年Q' + Math.ceil((now.getMonth() + 1) / 3);
        var wq = score >= 85 ? '优秀' : score >= 70 ? '良好' : '待改进';
        var maxId = 0;
        db.reviews.forEach(function (r) { if (r.ReviewID > maxId) maxId = r.ReviewID; });
        db.reviews.push({
            ReviewID: maxId + 1, EmployeeID: m.EmployeeID, EmployeeName: m.EmployeeName,
            Department: emp ? emp.Department : '', ReviewPeriod: q,
            PerformanceScore: score, KPICompletion: 0, WorkQuality: wq,
            TeamworkScore: 0, ReviewComments: comment,
            ReviewerID: reviewerId, ReviewDate: fmtNow(), Status: '已审核'
        });
        save();
        return true;
    }

    // ------- 绩效 -------
    function getReviews(filter) {
        var list = db.reviews.slice();
        filter = filter || {};
        if (filter.status) list = list.filter(function (r) { return r.Status === filter.status; });
        if (filter.period) list = list.filter(function (r) { return r.ReviewPeriod === filter.period; });
        if (filter.quality) list = list.filter(function (r) { return r.WorkQuality === filter.quality; });
        if (filter.keyword) {
            var kw = filter.keyword.toLowerCase();
            list = list.filter(function (r) {
                return (r.EmployeeName || '').toLowerCase().indexOf(kw) >= 0 || (r.EmployeeID || '').toLowerCase().indexOf(kw) >= 0;
            });
        }
        list.sort(function (a, b) { return ((b.ReviewDate || '')).localeCompare((a.ReviewDate || '')); });
        return list;
    }

    function addReview(r) {
        var maxId = 0;
        db.reviews.forEach(function (x) { if (x.ReviewID > maxId) maxId = x.ReviewID; });
        r.ReviewID = maxId + 1;
        db.reviews.push(r);
        save();
    }

    function updateReview(id, patch) {
        var idx = db.reviews.findIndex(function (r) { return r.ReviewID === id; });
        if (idx >= 0) { for (var k in patch) db.reviews[idx][k] = patch[k]; save(); return true; }
        return false;
    }

    function deleteReview(id) {
        var idx = db.reviews.findIndex(function (r) { return r.ReviewID === id; });
        if (idx >= 0) { db.reviews.splice(idx, 1); save(); return true; }
        return false;
    }

    function submitReview(id, reviewerId) {
        var idx = db.reviews.findIndex(function (r) { return r.ReviewID === id; });
        if (idx >= 0) {
            db.reviews[idx].Status = '已提交';
            db.reviews[idx].ReviewerID = reviewerId;
            db.reviews[idx].ReviewDate = fmtNow();
            save();
            return true;
        }
        return false;
    }

    // ------- 工具 -------
    function fmtDate(d) {
        var m = d.getMonth() + 1, day = d.getDate();
        return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
    }
    function fmtTime(d) {
        var h = d.getHours(), mi = d.getMinutes(), s = d.getSeconds();
        return (h < 10 ? '0' + h : h) + ':' + (mi < 10 ? '0' + mi : mi) + ':' + (s < 10 ? '0' + s : s);
    }
    function fmtNow() {
        var d = new Date();
        return fmtDate(d) + ' ' + fmtTime(d);
    }
    function today() {
        return fmtDate(new Date());
    }
    function daysBetween(s, e) {
        var d1 = new Date(s), d2 = new Date(e);
        return Math.round((d2 - d1) / 86400000) + 1;
    }

    // 记录员工最近登录时间（存到员工记录 LastLogin 字段）
    function recordLogin(empId) {
        var now = fmtNow();
        var hit = false;
        db.employees.forEach(function (e) {
            if (e.EmployeeID === empId) { e.LastLogin = now; hit = true; }
        });
        if (!hit) return null;
        save();
        // 登录审计（操作者即登录人）
        var emp = db.employees.find(function (e) { return e.EmployeeID === empId; });
        var logs = db.auditLogs = db.auditLogs || [];
        logs.push({ LogID: logs.length + 1, OperatorID: empId, OperatorName: emp ? emp.EmployeeName : '', Action: '登录', Target: '员工门户', Detail: empId + ' 登录系统', Time: now });
        if (logs.length > 500) logs.splice(0, logs.length - 500);
        save();
        return now;
    }

    // ================= V15 管理后台扩展 =================
    // ---------- 角色管理 ----------
    function getRoles() { return (db.roles || []).slice(); }

    // 员工角色显示名：优先自定义角色，其次内置级别
    function getRoleName(emp) {
        if (emp && emp.RoleID) {
            var r = (db.roles || []).find(function (x) { return x.RoleID === emp.RoleID; });
            if (r) return r.RoleName;
        }
        var names = { 1: '普通员工', 2: '部门主管', 3: '系统管理员' };
        return names[emp ? emp.PermissionLevel : 0] || '未知';
    }

    // 员工所属自定义角色（无则 null）
    function getRoleByEmp(emp) {
        if (emp && emp.RoleID) {
            return (db.roles || []).find(function (x) { return x.RoleID === emp.RoleID; }) || null;
        }
        return null;
    }

    function getRoleByLevel(level) {
        return (db.roles || []).find(function (r) { return r.PermLevel === level; }) || null;
    }

    function addRole(data) {
        var roles = db.roles = db.roles || [];
        var maxId = 0;
        roles.forEach(function (r) { if (r.RoleID > maxId) maxId = r.RoleID; });
        var role = {
            RoleID: maxId + 1,
            RoleName: data.RoleName || ('角色' + (maxId + 1)),
            PermLevel: data.PermLevel || 1,
            AllowedNav: data.AllowedNav || null,
            Remark: data.Remark || ''
        };
        roles.push(role);
        save();
        recordAudit('角色管理', role.RoleName, '新建角色（权限级别 ' + role.PermLevel + '）');
        return { ok: true, role: role };
    }

    function updateRole(id, data) {
        var roles = db.roles = db.roles || [];
        var role = roles.find(function (r) { return r.RoleID === id; });
        if (!role) return { ok: false, msg: '角色不存在' };
        if (role.PermLevel === 3 && data.PermLevel !== 3 && roles.filter(function (r) { return r.PermLevel === 3; }).length === 1) {
            return { ok: false, msg: '系统必须保留至少一个管理员角色' };
        }
        if (data.RoleName) role.RoleName = data.RoleName;
        if (data.PermLevel) role.PermLevel = data.PermLevel;
        role.AllowedNav = data.AllowedNav !== undefined ? data.AllowedNav : role.AllowedNav;
        if (data.Remark !== undefined) role.Remark = data.Remark;
        save();
        recordAudit('角色管理', role.RoleName, '更新角色（权限级别 ' + role.PermLevel + '）');
        return { ok: true };
    }

    function deleteRole(id) {
        var roles = db.roles = db.roles || [];
        var idx = roles.findIndex(function (r) { return r.RoleID === id; });
        if (idx < 0) return { ok: false, msg: '角色不存在' };
        var role = roles[idx];
        if (role.PermLevel === 3) return { ok: false, msg: '管理员角色不可删除' };
        var used = (db.employees || []).filter(function (e) { return e.RoleID === id; }).length;
        if (used > 0) return { ok: false, msg: '仍有 ' + used + ' 名员工使用该角色，请先调整' };
        roles.splice(idx, 1);
        save();
        recordAudit('角色管理', role.RoleName, '删除角色');
        return { ok: true };
    }

    // ---------- 注册申请 ----------
    function getRegRequests(filter) {
        var list = (db.regRequests || []).slice();
        filter = filter || {};
        if (filter.status) list = list.filter(function (r) { return r.Status === filter.status; });
        return list;
    }

    function addRegRequest(data) {
        var list = db.regRequests = db.regRequests || [];
        var maxId = 0;
        list.forEach(function (r) { if (r.ReqID > maxId) maxId = r.ReqID; });
        // 同名/同邮箱防重复
        var dup = list.find(function (r) { return r.Email === data.Email && r.Status === '待审批'; });
        if (dup) return { ok: false, msg: '该邮箱已提交申请，请等待管理员审批' };
        list.push({
            ReqID: maxId + 1,
            Name: data.Name || '', Gender: data.Gender || '未填写',
            Department: data.Department || 'D001', Position: data.Position || '',
            Phone: data.Phone || '', Email: data.Email || '',
            Reason: data.Reason || '', Status: '待审批',
            RequestTime: fmtNow(), ApproverID: '', ApproveTime: null
        });
        save();
        return { ok: true, msg: '注册申请已提交，请等待管理员审批' };
    }

    function approveRegRequest(id, ok, byId, note) {
        var list = db.regRequests = db.regRequests || [];
        var req = list.find(function (r) { return r.ReqID === id; });
        if (!req) return { ok: false, msg: '申请不存在' };
        if (req.Status !== '待审批') return { ok: false, msg: '该申请已处理' };
        var by = db.employees.find(function (e) { return e.EmployeeID === byId; });
        if (ok) {
            // 通过 → 创建员工账号（初始密码 123456，角色按部门默认普通员工）
            var emps = db.employees;
            var maxEmp = 0;
            emps.forEach(function (e) {
                var n = parseInt((e.EmployeeID || '').replace(/\D/g, ''), 10);
                if (!isNaN(n) && n > maxEmp) maxEmp = n;
            });
            var newId = 'E' + (maxEmp + 1);
            emps.push({
                EmployeeID: newId, EmployeeName: req.Name, Gender: req.Gender,
                Age: 0, Department: req.Department, PermissionLevel: 1,
                PhoneNumber: req.Phone, Email: req.Email, IsActive: true,
                Password: '123456', Remarks: '注册审批通过（' + (req.Position || '新员工') + '）',
                CreatedAt: fmtDate(new Date())
            });
            req.Status = '已通过'; req.ApproverID = byId; req.ApproveTime = fmtNow();
            req.Note = note || '';
            save();
            recordAudit('注册审批', req.Name, '审批通过，生成账号 ' + newId);
            return { ok: true, msg: '已通过，账号 ' + newId + ' 已生成（初始密码 123456）' };
        }
        req.Status = '已驳回'; req.ApproverID = byId; req.ApproveTime = fmtNow();
        req.Note = note || '';
        save();
        recordAudit('注册审批', req.Name, '审批驳回：' + (note || '未说明'));
        return { ok: true, msg: '已驳回该申请' };
    }

    function deleteRegRequest(id) {
        var list = db.regRequests = db.regRequests || [];
        var idx = list.findIndex(function (r) { return r.ReqID === id; });
        if (idx < 0) return { ok: false, msg: '申请不存在' };
        list.splice(idx, 1);
        save();
        return { ok: true };
    }

    // ---------- 评论管理 ----------
    function getComments(filter) {
        var list = (db.comments || []).slice();
        filter = filter || {};
        if (filter.targetType) list = list.filter(function (c) { return c.TargetType === filter.targetType; });
        if (filter.targetId !== undefined) list = list.filter(function (c) { return c.TargetID === filter.targetId; });
        return list;
    }

    function addComment(data) {
        var list = db.comments = db.comments || [];
        var maxId = 0;
        list.forEach(function (c) { if (c.CommentID > maxId) maxId = c.CommentID; });
        list.push({
            CommentID: maxId + 1,
            TargetType: data.TargetType || '公告', TargetID: data.TargetID || 0,
            Content: data.Content || '', AuthorID: data.AuthorID || '',
            AuthorName: data.AuthorName || '', Time: fmtNow(), Status: '正常'
        });
        save();
        return { ok: true };
    }

    function deleteComment(id) {
        var list = db.comments = db.comments || [];
        var c = list.find(function (x) { return x.CommentID === id; });
        if (!c) return { ok: false, msg: '评论不存在' };
        c.Status = '已删除';
        save();
        recordAudit('评论管理', c.AuthorName, '删除评论：' + (c.Content || '').slice(0, 20));
        return { ok: true };
    }

    // ---------- 网站配置 ----------
    function getSettings() {
        if (!db.settings) db.settings = seed().settings;
        return db.settings;
    }

    function saveSettings(data) {
        var s = db.settings = db.settings || seed().settings;
        if (data.SiteName !== undefined) s.SiteName = data.SiteName;
        if (data.ThemeColor !== undefined) s.ThemeColor = data.ThemeColor;
        if (data.FooterText !== undefined) s.FooterText = data.FooterText;
        s.UpdatedBy = data.UpdatedBy || s.UpdatedBy;
        s.UpdateTime = fmtNow();
        save();
        recordAudit('系统设置', '网站配置', '更新站点配置（' + s.SiteName + '）');
        return { ok: true };
    }

    // ---------- 异常日志 ----------
    function getErrorLogs() { return (db.errorLogs || []).slice().reverse(); }

    function addErrorLog(msg, src, line, page) {
        var list = db.errorLogs = db.errorLogs || [];
        var maxId = 0;
        list.forEach(function (e) { if (e.ErrID > maxId) maxId = e.ErrID; });
        list.push({
            ErrID: maxId + 1,
            Message: String(msg || '').slice(0, 300),
            Source: src || '', Line: line || 0,
            Time: fmtNow(), Page: page || ''
        });
        if (list.length > 200) list.splice(0, list.length - 200);
        save();
    }

    function clearErrorLogs() {
        db.errorLogs = [];
        save();
        recordAudit('日志管理', '异常日志', '清空异常日志');
        return { ok: true };
    }

    // ---------- 登录日志（从审计中抽取登录记录） ----------
    function getLoginLogs(limit) {
        var logs = (db.auditLogs || []).slice().filter(function (l) { return l.Action === '登录'; });
        logs.reverse();
        return logs.slice(0, limit || 50);
    }

    // ---------- 图片管理（meta 存库，blob 存 IndexedDB） ----------
    function getImgMetas() { return (db.imgVault || []).slice(); }

    // ---------- 工作台自定义（快捷操作 + 板块开关，按员工） ----------
    var DASH_DEFAULTS = {
        1: ['leave', 'taskCenter', 'fileVault', 'training', 'feedbackCenter', 'groupNews', 'logistics', 'salaryCenter'],
        2: ['approvalCenter', 'performance', 'taskAdmin', 'dataReport', 'orgManage', 'careReminder', 'groupNews', 'leave'],
        3: ['systemLog', 'systemConfig', 'orgManage', 'roleManage', 'dataReport', 'approvalCenter', 'performance', 'contentAdmin']
    };

    function getDashPrefs(empId) {
        var map = db.dashPrefs = db.dashPrefs || {};
        if (map[empId]) return map[empId];
        var emp = (db.employees || []).find(function (e) { return e.EmployeeID === empId; });
        var lv = emp ? emp.PermissionLevel : 1;
        return {
            quick: (DASH_DEFAULTS[lv] || DASH_DEFAULTS[1]).slice(),
            panels: { announce: true, stats: true, quick: true, recent: true }
        };
    }

    function saveDashPrefs(empId, prefs) {
        var map = db.dashPrefs = db.dashPrefs || {};
        map[empId] = prefs;
        save();
        recordAudit('工作台', '自定义', '更新自定义快捷操作与板块配置');
        return { ok: true };
    }    function addImgMeta(data) {
        var list = db.imgVault = db.imgVault || [];
        var maxId = 0;
        list.forEach(function (m) { if (m.ImgID > maxId) maxId = m.ImgID; });
        list.push({
            ImgID: maxId + 1, Name: data.Name || '未命名图片',
            Thumb: data.Thumb || '', Uploader: data.Uploader || '',
            UploaderID: data.UploaderID || '', Time: fmtNow()
        });
        if (list.length > 200) list.splice(0, list.length - 200);
        save();
        recordAudit('内容管理', '图片管理', '上传图片：' + data.Name);
        return { ok: true, id: maxId + 1 };
    }

    function removeImgMeta(id) {
        var list = db.imgVault = db.imgVault || [];
        var idx = list.findIndex(function (m) { return m.ImgID === id; });
        if (idx < 0) return { ok: false, msg: '图片不存在' };
        var name = list[idx].Name;
        list.splice(idx, 1);
        save();
        recordAudit('内容管理', '图片管理', '删除图片：' + name);
        return { ok: true };
    }

    // ------- 集团公告板 -------
    // filter: { scope:'集团'|部门code|'all', keyword }
    function getAnnouncements(filter) {
        var list = db.announcements || [];
        list = list.slice();
        filter = filter || {};
        if (filter.scope && filter.scope !== 'all') {
            list = list.filter(function (a) { return a.Scope === '集团' || a.Scope === filter.scope; });
        }
        if (filter.keyword) {
            var kw = filter.keyword.toLowerCase();
            list = list.filter(function (a) {
                return (a.Title || '').toLowerCase().indexOf(kw) >= 0 || (a.Content || '').toLowerCase().indexOf(kw) >= 0;
            });
        }
        list.sort(function (a, b) { return (b.PublishTime || '').localeCompare(a.PublishTime || ''); });
        return list;
    }

    function addAnnouncement(ann) {
        var list = db.announcements = db.announcements || [];
        var maxId = 0;
        list.forEach(function (a) { if (a.ID > maxId) maxId = a.ID; });
        ann.ID = maxId + 1;
        ann.PublishTime = fmtNow();
        list.push(ann);
        save();
        return ann;
    }

    function deleteAnnouncement(id) {
        var list = db.announcements = db.announcements || [];
        var idx = list.findIndex(function (a) { return a.ID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }

    // ------- 集团大事记 -------
    function getMilestones() {
        var list = (db.milestones || []).slice();
        list.sort(function (a, b) { return a.Year - b.Year || a.ID - b.ID; });
        return list;
    }
    function addMilestone(m) {
        var list = db.milestones = db.milestones || [];
        var maxId = 0;
        list.forEach(function (x) { if (x.ID > maxId) maxId = x.ID; });
        m.ID = maxId + 1;
        list.push(m);
        save();
        return m;
    }
    function deleteMilestone(id) {
        var list = db.milestones = db.milestones || [];
        var idx = list.findIndex(function (x) { return x.ID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }

    // ------- 值班排班 -------
    // filter: { department:'D002'|'', empId, date:'2026-09-22'|'' }
    function getDuties(filter) {
        var list = (db.duties || []).slice();
        filter = filter || {};
        if (filter.department) {
            list = list.filter(function (d) { return d.Department === filter.department; });
        }
        if (filter.empId) {
            list = list.filter(function (d) { return d.EmployeeID === filter.empId; });
        }
        if (filter.date) {
            list = list.filter(function (d) { return d.DutyDate === filter.date; });
        }
        list.sort(function (a, b) { return (a.DutyDate || '').localeCompare(b.DutyDate || ''); });
        return list;
    }
    function addDuty(d) {
        var list = db.duties = db.duties || [];
        var maxId = 0;
        list.forEach(function (x) { if (x.DutyID > maxId) maxId = x.DutyID; });
        d.DutyID = maxId + 1;
        d.CreateTime = fmtNow();
        list.push(d);
        save();
        return d;
    }
    function deleteDuty(id) {
        var list = db.duties = db.duties || [];
        var idx = list.findIndex(function (x) { return x.DutyID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }

    // ------- 意见反馈 -------
    // filter: { department:'D002'|'', empId, status:'待处理'|'全部' }
    function getFeedbacks(filter) {
        var list = (db.feedbacks || []).slice();
        filter = filter || {};
        if (filter.department) {
            list = list.filter(function (f) { return f.Department === filter.department; });
        }
        if (filter.empId) {
            list = list.filter(function (f) { return f.EmployeeID === filter.empId; });
        }
        if (filter.status && filter.status !== '全部') {
            list = list.filter(function (f) { return f.Status === filter.status; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addFeedback(f) {
        var list = db.feedbacks = db.feedbacks || [];
        var maxId = 0;
        list.forEach(function (x) { if (x.FeedbackID > maxId) maxId = x.FeedbackID; });
        f.FeedbackID = maxId + 1;
        f.CreateTime = fmtNow();
        f.Status = '待处理';
        f.HandleNote = ''; f.HandleBy = ''; f.HandleTime = null;
        list.push(f);
        save();
        return f;
    }
    function handleFeedback(id, note, by) {
        var idx = (db.feedbacks || []).findIndex(function (x) { return x.FeedbackID === id; });
        if (idx >= 0) {
            db.feedbacks[idx].Status = '已处理';
            db.feedbacks[idx].HandleNote = note;
            db.feedbacks[idx].HandleBy = by;
            db.feedbacks[idx].HandleTime = fmtNow();
            save();
            return true;
        }
        return false;
    }
    function deleteFeedback(id) {
        var list = db.feedbacks = db.feedbacks || [];
        var idx = list.findIndex(function (x) { return x.FeedbackID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }

    // ------- 差旅报销 -------
    // filter: { department:'D002'|'', empId, status:'待审批'|'全部' }
    function getExpenses(filter) {
        var list = (db.expenses || []).slice();
        filter = filter || {};
        if (filter.department) {
            list = list.filter(function (e) { return e.Department === filter.department; });
        }
        if (filter.empId) {
            list = list.filter(function (e) { return e.EmployeeID === filter.empId; });
        }
        if (filter.status && filter.status !== '全部') {
            list = list.filter(function (e) { return e.Status === filter.status; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addExpense(exp) {
        var list = db.expenses = db.expenses || [];
        var maxId = 0;
        list.forEach(function (x) { if (x.ExpenseID > maxId) maxId = x.ExpenseID; });
        exp.ExpenseID = maxId + 1;
        exp.CreateTime = fmtNow();
        exp.Status = '待审批';
        exp.ApproveNote = ''; exp.ApproveBy = ''; exp.ApproveTime = null;
        list.push(exp);
        save();
        return exp;
    }
    function approveExpense(id, approved, note, by) {
        var idx = (db.expenses || []).findIndex(function (x) { return x.ExpenseID === id; });
        if (idx >= 0) {
            db.expenses[idx].Status = approved ? '已批准' : '已驳回';
            db.expenses[idx].ApproveNote = note;
            db.expenses[idx].ApproveBy = by;
            db.expenses[idx].ApproveTime = fmtNow();
            save();
            return true;
        }
        return false;
    }
    function deleteExpense(id) {
        var list = db.expenses = db.expenses || [];
        var idx = list.findIndex(function (x) { return x.ExpenseID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }

    // ------- 培训中心 -------
    function getTrainings() {
        return (db.trainings || []).slice();
    }
    function addTraining(t) {
        var list = db.trainings = db.trainings || [];
        var maxId = 0;
        list.forEach(function (x) { if (x.TrainingID > maxId) maxId = x.TrainingID; });
        t.TrainingID = maxId + 1;
        t.Status = t.Status || '进行中';
        t.CreateTime = fmtNow();
        list.push(t);
        save();
        return t;
    }
    function deleteTraining(id) {
        var list = db.trainings = db.trainings || [];
        var idx = list.findIndex(function (x) { return x.TrainingID === id; });
        if (idx >= 0) {
            list.splice(idx, 1);
            db.trainingEnrolls = (db.trainingEnrolls || []).filter(function (e) { return e.TrainingID !== id; });
            save();
            return true;
        }
        return false;
    }
    // 我的报名情况：{ TrainingID: { enrolled, completed } }
    function getMyTrainingState(empId) {
        var map = {};
        (db.trainingEnrolls || []).forEach(function (e) {
            if (e.EmployeeID === empId) map[e.TrainingID] = { enrolled: true, completed: !!e.Completed };
        });
        return map;
    }
    function getTrainingEnrolls() {
        return (db.trainingEnrolls || []).slice();
    }
    function enrollTraining(empId, trainingId) {
        var list = db.trainingEnrolls = db.trainingEnrolls || [];        if (list.some(function (e) { return e.EmployeeID === empId && e.TrainingID === trainingId; })) return false;
        var maxId = 0;
        list.forEach(function (x) { if (x.ID > maxId) maxId = x.ID; });
        list.push({ ID: maxId + 1, TrainingID: trainingId, EmployeeID: empId, EnrollTime: fmtNow(), Completed: false, CompleteTime: null });
        save();
        return true;
    }
    function completeTraining(empId, trainingId) {
        var hit = (db.trainingEnrolls || []).find(function (e) { return e.EmployeeID === empId && e.TrainingID === trainingId; });
        if (!hit || hit.Completed) return false;
        hit.Completed = true;
        hit.CompleteTime = fmtNow();
        save();
        return true;
    }
    // 课程学习统计：{ TrainingID: { enrollCount, completeCount } }
    function getTrainingStats() {
        var stats = {};
        (db.trainings || []).forEach(function (t) { stats[t.TrainingID] = { enrollCount: 0, completeCount: 0 }; });
        (db.trainingEnrolls || []).forEach(function (e) {
            if (stats[e.TrainingID]) {
                stats[e.TrainingID].enrollCount++;
                if (e.Completed) stats[e.TrainingID].completeCount++;
            }
        });
        return stats;
    }

    // ------- 个人信息变更申请 -------
    // filter: { department:'D002'|'', empId, status }
    function getProfileUpdates(filter) {
        var list = (db.profileUpdates || []).slice();
        filter = filter || {};
        if (filter.department) {
            list = list.filter(function (p) { return p.Department === filter.department; });
        }
        if (filter.empId) {
            list = list.filter(function (p) { return p.EmployeeID === filter.empId; });
        }
        if (filter.status && filter.status !== '全部') {
            list = list.filter(function (p) { return p.Status === filter.status; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addProfileUpdate(p) {
        var list = db.profileUpdates = db.profileUpdates || [];
        var maxId = 0;
        list.forEach(function (x) { if (x.UpdateID > maxId) maxId = x.UpdateID; });
        p.UpdateID = maxId + 1;
        p.CreateTime = fmtNow();
        p.Status = '待审批';
        p.ApproveBy = ''; p.ApproveTime = null;
        list.push(p);
        save();
        return p;
    }
    function approveProfileUpdate(id, approved, by) {
        var idx = (db.profileUpdates || []).findIndex(function (x) { return x.UpdateID === id; });
        if (idx >= 0) {
            db.profileUpdates[idx].Status = approved ? '已批准' : '已驳回';
            db.profileUpdates[idx].ApproveBy = by;
            db.profileUpdates[idx].ApproveTime = fmtNow();
            // 批准后同步更新员工主数据
            if (approved) {
                var p = db.profileUpdates[idx];
                var emp = db.employees.find(function (e) { return e.EmployeeID === p.EmployeeID; });
                if (emp) {
                    if (p.Field === '联系电话') emp.PhoneNumber = p.NewValue;
                    else if (p.Field === '电子邮箱') emp.Email = p.NewValue;
                }
            }
            save();
            return true;
        }
        return false;
    }
    function deleteProfileUpdate(id) {
        var list = db.profileUpdates = db.profileUpdates || [];
        var idx = list.findIndex(function (x) { return x.UpdateID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }

    // ------- 待办中心（按角色聚合） -------
    function getTodos(emp) {
        var todos = [];
        var level = emp.PermissionLevel;
        if (level === 3) {
            // 管理员：全局待审批/待处理
            todos.push({ key: 'leave', ico: '◷', title: '待审批请假', count: db.leaves.filter(function (l) { return l.Status === '待审批'; }).length, goto: 'leave' });
            todos.push({ key: 'mission', ico: '✎', title: '待评分任务', count: db.missions.filter(function (m) { return m.Status === '已提交'; }).length, goto: 'taskAdmin' });
            todos.push({ key: 'feedback', ico: '✉', title: '待处理反馈', count: db.feedbacks.filter(function (f) { return f.Status === '待处理'; }).length, goto: 'feedbackCenter' });
            todos.push({ key: 'expense', ico: '¥', title: '待审批报销', count: db.expenses.filter(function (e) { return e.Status === '待审批'; }).length, goto: 'logistics' });
            todos.push({ key: 'profile', ico: '☰', title: '待审批资料变更', count: db.profileUpdates.filter(function (p) { return p.Status === '待审批'; }).length, goto: 'hrService' });
            todos.push({ key: 'equip', ico: '⌨', title: '待审批设备申领', count: db.equipRequests.filter(function (e) { return e.Status === '待审批'; }).length, goto: 'logistics' });
        } else if (level === 2) {
            var dept = emp.Department;
            var deptEmpIds = {};
            db.employees.forEach(function (e) { if (e.Department === dept) deptEmpIds[e.EmployeeID] = 1; });
            todos.push({ key: 'leave', ico: '◷', title: '待审批请假', count: db.leaves.filter(function (l) { return l.Status === '待审批' && l.Department === dept; }).length, goto: 'approvalCenter' });
            todos.push({ key: 'mission', ico: '✎', title: '待评分任务', count: db.missions.filter(function (m) { return m.Status === '已提交' && deptEmpIds[m.EmployeeID]; }).length, goto: 'taskAdmin' });
            todos.push({ key: 'feedback', ico: '✉', title: '待处理反馈', count: db.feedbacks.filter(function (f) { return f.Status === '待处理' && f.Department === dept; }).length, goto: 'feedbackCenter' });
            todos.push({ key: 'expense', ico: '¥', title: '待审批报销', count: db.expenses.filter(function (e) { return e.Status === '待审批' && e.Department === dept; }).length, goto: 'logistics' });
            todos.push({ key: 'profile', ico: '☰', title: '待审批资料变更', count: db.profileUpdates.filter(function (p) { return p.Status === '待审批' && p.Department === dept; }).length, goto: 'hrService' });
            todos.push({ key: 'equip', ico: '⌨', title: '待审批设备申领', count: db.equipRequests.filter(function (e) { return e.Status === '待审批' && e.Department === dept; }).length, goto: 'logistics' });
        } else {
            todos.push({ key: 'leave', ico: '◷', title: '我的待审批请假', count: db.leaves.filter(function (l) { return l.Status === '待审批' && l.EmployeeID === emp.EmployeeID; }).length, goto: 'leave' });
            todos.push({ key: 'mission', ico: '✎', title: '我的未完成任务', count: db.missions.filter(function (m) { return m.EmployeeID === emp.EmployeeID && m.Status === '待执行'; }).length, goto: 'taskCenter' });
            todos.push({ key: 'expense', ico: '¥', title: '我的待审批报销', count: db.expenses.filter(function (e) { return e.Status === '待审批' && e.EmployeeID === emp.EmployeeID; }).length, goto: 'logistics' });
            todos.push({ key: 'equip', ico: '⌨', title: '我的待审批设备', count: db.equipRequests.filter(function (e) { return e.Status === '待审批' && e.EmployeeID === emp.EmployeeID; }).length, goto: 'logistics' });
            todos.push({ key: 'training', ico: '▤', title: '待完成培训', count: (db.trainingEnrolls || []).filter(function (e) { return e.EmployeeID === emp.EmployeeID && !e.Completed; }).length, goto: 'training' });
        }
        // 通用：行政申请（用车/用印）待审批——管理员全局 / 主管本部门
        if (level >= 2) {
            var reqs = db.adminRequests || [];
            if (level === 3) {
                todos.push({ key: 'adminReq', ico: '▣', title: '待审批行政申请', count: reqs.filter(function (r) { return r.Status === '待审批'; }).length, goto: 'adminReqApproval' });
            } else {
                todos.push({ key: 'adminReq', ico: '▣', title: '待审批行政申请', count: reqs.filter(function (r) { return r.Status === '待审批' && r.Department === emp.Department; }).length, goto: 'adminReqApproval' });
            }
        }
        // 通用：合同到期提醒（管理员）
        if (level === 3) {
            var expiring = (db.contracts || []).filter(function (c) {
                var d = daysUntil(c.EndDate);
                return d >= 0 && d <= 30;
            });
            todos.push({ key: 'contract', ico: '▤', title: '合同即将到期', count: expiring.length, goto: 'contract' });
        }
        return todos.filter(function (t) { return t.count > 0; });
    }

    // ------- 文件柜（元数据） -------
    // filter: { scope:'部门'|'个人', department:'D002'|'', ownerId }
    function getFileVault(filter) {
        var list = (db.fileVault || []).slice();
        filter = filter || {};
        if (filter.scope) {
            list = list.filter(function (f) { return f.Scope === filter.scope; });
        }
        if (filter.department) {
            // 部门可见范围：本部门文件 + 集团级共享文件
            list = list.filter(function (f) { return f.Department === filter.department || f.Department === '集团'; });
        }
        if (filter.ownerId) {
            list = list.filter(function (f) { return f.OwnerID === filter.ownerId; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addFileVault(meta) {
        var list = db.fileVault = db.fileVault || [];
        var maxId = 0;
        list.forEach(function (x) { if (x.VaultID > maxId) maxId = x.VaultID; });
        meta.VaultID = maxId + 1;
        meta.CreateTime = fmtNow();
        list.push(meta);
        save();
        return meta;
    }
    function deleteFileVault(vaultId) {
        var list = db.fileVault = db.fileVault || [];
        var idx = list.findIndex(function (x) { return x.VaultID === vaultId; });
        if (idx >= 0) { var f = list[idx]; list.splice(idx, 1); save(); return f; }
        return null;
    }

    // ------- 工作周报 -------
    // filter: { department:'D002'|'', empId }
    function getWeeklyReports(filter) {
        var list = (db.weeklyReports || []).slice();
        filter = filter || {};
        if (filter.department) {
            list = list.filter(function (r) { return r.Department === filter.department; });
        }
        if (filter.empId) {
            list = list.filter(function (r) { return r.EmployeeID === filter.empId; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addWeeklyReport(r) {
        var list = db.weeklyReports = db.weeklyReports || [];
        var maxId = 0;
        list.forEach(function (x) { if (x.ReportID > maxId) maxId = x.ReportID; });
        r.ReportID = maxId + 1;
        r.CreateTime = fmtNow();
        r.ReviewNote = ''; r.ReviewBy = ''; r.ReviewTime = null;
        list.push(r);
        save();
        return r;
    }
    function reviewWeeklyReport(id, note, by) {
        var idx = (db.weeklyReports || []).findIndex(function (x) { return x.ReportID === id; });
        if (idx >= 0) {
            db.weeklyReports[idx].ReviewNote = note;
            db.weeklyReports[idx].ReviewBy = by;
            db.weeklyReports[idx].ReviewTime = fmtNow();
            save();
            return true;
        }
        return false;
    }
    function deleteWeeklyReport(id) {
        var list = db.weeklyReports = db.weeklyReports || [];
        var idx = list.findIndex(function (x) { return x.ReportID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }

    // ------- 设备申领 -------
    function getEquipRequests(filter) {
        var list = (db.equipRequests || []).slice();
        filter = filter || {};
        if (filter.department) {
            list = list.filter(function (e) { return e.Department === filter.department; });
        }
        if (filter.empId) {
            list = list.filter(function (e) { return e.EmployeeID === filter.empId; });
        }
        if (filter.status && filter.status !== '全部') {
            list = list.filter(function (e) { return e.Status === filter.status; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addEquipRequest(e) {
        var list = db.equipRequests = db.equipRequests || [];
        var maxId = 0;
        list.forEach(function (x) { if (x.ReqID > maxId) maxId = x.ReqID; });
        e.ReqID = maxId + 1;
        e.CreateTime = fmtNow();
        e.Status = '待审批';
        e.ApproveNote = ''; e.ApproveBy = ''; e.ApproveTime = null;
        list.push(e);
        save();
        return e;
    }
    function approveEquipRequest(id, approved, note, by) {
        var idx = (db.equipRequests || []).findIndex(function (x) { return x.ReqID === id; });
        if (idx >= 0) {
            db.equipRequests[idx].Status = approved ? '已发放' : '已驳回';
            db.equipRequests[idx].ApproveNote = note;
            db.equipRequests[idx].ApproveBy = by;
            db.equipRequests[idx].ApproveTime = fmtNow();
            save();
            return true;
        }
        return false;
    }
    function deleteEquipRequest(id) {
        var list = db.equipRequests = db.equipRequests || [];
        var idx = list.findIndex(function (x) { return x.ReqID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }

    // ------- 员工嘉奖 -------
    function getRecognitions(filter) {
        var list = (db.recognitions || []).slice();
        filter = filter || {};
        if (filter.department) {
            list = list.filter(function (r) { return r.Department === filter.department; });
        }
        if (filter.toId) {
            list = list.filter(function (r) { return r.ToID === filter.toId; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addRecognition(r) {
        var list = db.recognitions = db.recognitions || [];
        var maxId = 0;
        list.forEach(function (x) { if (x.RecID > maxId) maxId = x.RecID; });
        r.RecID = maxId + 1;
        r.CreateTime = fmtNow();
        list.push(r);
        save();
        return r;
    }
    function deleteRecognition(id) {
        var list = db.recognitions = db.recognitions || [];
        var idx = list.findIndex(function (x) { return x.RecID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }

    // ------- 站内消息 -------
    function getMessagesBetween(uid, oid) {
        return (db.messages || []).filter(function (m) {
            return (m.FromID === uid && m.ToID === oid) || (m.FromID === oid && m.ToID === uid);
        }).sort(function (a, b) { return (a.Time || '').localeCompare(b.Time || ''); });
    }
    function addMessage(msg) {
        var list = db.messages = db.messages || [];
        msg.MsgID = (list.length ? Math.max.apply(null, list.map(function (m) { return m.MsgID; })) : 0) + 1;
        msg.Time = msg.Time || fmtNow();
        list.push(msg);
        save();
        return msg;
    }
    function getConversations(uid) {
        var map = {};
        (db.messages || []).forEach(function (m) {
            if (m.FromID !== uid && m.ToID !== uid) return; // 只统计本人相关消息
            var other = m.FromID === uid ? m.ToID : m.FromID;
            if (!map[other]) {
                map[other] = { OtherID: other, LastTime: m.Time, LastMsg: m.Content, LastType: m.Type || 'text', LastFrom: m.FromID, Unread: 0 };
            } else {
                if ((m.Time || '') > (map[other].LastTime || '')) {
                    map[other].LastTime = m.Time; map[other].LastMsg = m.Content; map[other].LastType = m.Type || 'text'; map[other].LastFrom = m.FromID;
                }
            }
            if (m.ToID === uid && !m.Read) map[other].Unread++;
        });
        var arr = [];
        for (var k in map) arr.push(map[k]);
        arr.sort(function (a, b) { return (b.LastTime || '').localeCompare(a.LastTime || ''); });
        return arr;
    }
    function markPairRead(uid, oid) {
        var changed = false;
        (db.messages || []).forEach(function (m) {
            if (m.ToID === uid && m.FromID === oid && !m.Read) { m.Read = true; changed = true; }
        });
        if (changed) save();
    }

    // ------- V12 扩展功能 -------
    // 薪资
    function getSalaries(filter) {
        var list = (db.salaries || []).slice();
        filter = filter || {};
        if (filter.employeeId) list = list.filter(function (s) { return s.EmployeeID === filter.employeeId; });
        if (filter.month) list = list.filter(function (s) { return s.Month === filter.month; });
        list.sort(function (a, b) { return (b.Month || '').localeCompare(a.Month || ''); });
        return list;
    }
    function addSalary(s) {
        var list = db.salaries = db.salaries || [];
        s.SalaryID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.SalaryID; })) : 0) + 1;
        s.CreateTime = s.CreateTime || fmtNow();
        list.push(s); save();
        recordAudit('薪资录入', s.EmployeeID, '月份 ' + s.Month + '，实发 ' + (s.Base + s.Performance + s.Allowance - s.Deduction).toFixed(2));
        return s;
    }
    function updateSalary(id, patch) {
        var idx = (db.salaries || []).findIndex(function (x) { return x.SalaryID === id; });
        if (idx < 0) return false;
        for (var k in patch) db.salaries[idx][k] = patch[k];
        save(); return true;
    }
    function deleteSalary(id) {
        var list = db.salaries = db.salaries || [];
        var idx = list.findIndex(function (x) { return x.SalaryID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); recordAudit('删除薪资', '记录#' + id, ''); return true; }
        return false;
    }
    // 会议
    function getMeetings(filter) {
        var list = (db.meetings || []).slice();
        filter = filter || {};
        if (filter.employeeId) {
            list = list.filter(function (m) { return m.OrganizerID === filter.employeeId || (m.Participants || []).indexOf(filter.employeeId) >= 0; });
        }
        list.sort(function (a, b) { return (b.Start || '').localeCompare(a.Start || ''); });
        return list;
    }
    function addMeeting(m) {
        var list = db.meetings = db.meetings || [];
        m.MeetingID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.MeetingID; })) : 0) + 1;
        m.CreateTime = m.CreateTime || fmtNow();
        list.push(m); save(); return m;
    }
    function updateMeeting(id, patch) {
        var idx = (db.meetings || []).findIndex(function (x) { return x.MeetingID === id; });
        if (idx < 0) return false;
        for (var k in patch) db.meetings[idx][k] = patch[k];
        save(); return true;
    }
    function deleteMeeting(id) {
        var list = db.meetings = db.meetings || [];
        var idx = list.findIndex(function (x) { return x.MeetingID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }
    // 合同
    function getContracts(filter) {
        var list = (db.contracts || []).slice();
        filter = filter || {};
        if (filter.employeeId) list = list.filter(function (c) { return c.EmployeeID === filter.employeeId; });
        list.sort(function (a, b) { return (b.EndDate || '').localeCompare(a.EndDate || ''); });
        return list;
    }
    function addContract(c) {
        var list = db.contracts = db.contracts || [];
        c.ContractID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.ContractID; })) : 0) + 1;
        c.CreateTime = c.CreateTime || fmtNow();
        list.push(c); save();
        recordAudit('合同录入', c.EmployeeName, c.Type + ' ' + c.StartDate + ' ~ ' + c.EndDate);
        return c;
    }
    function updateContract(id, patch) {
        var idx = (db.contracts || []).findIndex(function (x) { return x.ContractID === id; });
        if (idx < 0) return false;
        for (var k in patch) db.contracts[idx][k] = patch[k];
        save(); recordAudit('合同状态变更', db.contracts[idx].EmployeeName, '状态 → ' + (patch.Status || ''));
        return true;
    }
    function deleteContract(id) {
        var list = db.contracts = db.contracts || [];
        var idx = list.findIndex(function (x) { return x.ContractID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); recordAudit('删除合同', '记录#' + id, ''); return true; }
        return false;
    }
    function daysUntil(dateStr) {
        if (!dateStr) return 99999;
        var parts = dateStr.split('-');
        var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return Math.round((d - today) / 86400000);
    }
    function getExpiringContracts(withinDays) {
        var list = (db.contracts || []).filter(function (c) {
            var d = daysUntil(c.EndDate);
            return d >= 0 && d <= (withinDays || 30);
        });
        return list;
    }
    // 日程
    function getSchedules(filter) {
        var list = (db.schedules || []).slice();
        filter = filter || {};
        if (filter.date) list = list.filter(function (s) { return s.Date === filter.date; });
        if (filter.month) list = list.filter(function (s) { return (s.Date || '').indexOf(filter.month) === 0; });
        if (filter.scope) {
            list = list.filter(function (s) {
                if (s.Type === '集团') return true;
                if (filter.scope === 'ALL') return true;
                if (filter.scope === 'PERSONAL') return s.OwnerID === filter.ownerId;
                return s.Scope === filter.scope; // 部门范围
            });
        }
        list.sort(function (a, b) { return (a.Date + a.Time).localeCompare(b.Date + b.Time); });
        return list;
    }
    function addSchedule(s) {
        var list = db.schedules = db.schedules || [];
        s.ScheduleID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.ScheduleID; })) : 0) + 1;
        s.CreateTime = s.CreateTime || fmtNow();
        list.push(s); save(); return s;
    }
    function deleteSchedule(id) {
        var list = db.schedules = db.schedules || [];
        var idx = list.findIndex(function (x) { return x.ScheduleID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }
    // 知识库
    function getKnowledge(filter) {
        var list = (db.knowledge || []).slice();
        filter = filter || {};
        if (filter.category) list = list.filter(function (k) { return k.Category === filter.category; });
        if (filter.keyword) {
            var kw = filter.keyword.toLowerCase();
            list = list.filter(function (k) { return (k.Title || '').toLowerCase().indexOf(kw) >= 0 || (k.Content || '').toLowerCase().indexOf(kw) >= 0; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addKnowledge(k) {
        var list = db.knowledge = db.knowledge || [];
        k.KbID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.KbID; })) : 0) + 1;
        k.CreateTime = k.CreateTime || fmtNow();
        k.Views = k.Views || 0;
        list.push(k); save(); return k;
    }
    function viewKnowledge(id) {
        var idx = (db.knowledge || []).findIndex(function (x) { return x.KbID === id; });
        if (idx >= 0) { db.knowledge[idx].Views = (db.knowledge[idx].Views || 0) + 1; save(); }
    }
    function deleteKnowledge(id) {
        var list = db.knowledge = db.knowledge || [];
        var idx = list.findIndex(function (x) { return x.KbID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }
    // 投票
    function getPolls() {
        return (db.polls || []).slice().sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
    }
    function addPoll(p) {
        var list = db.polls = db.polls || [];
        p.PollID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.PollID; })) : 0) + 1;
        p.CreateTime = p.CreateTime || fmtNow();
        p.VotedBy = p.VotedBy || [];
        list.push(p); save(); return p;
    }
    function votePoll(pollId, employeeId, optionIdx) {
        var p = (db.polls || []).find(function (x) { return x.PollID === pollId; });
        if (!p) return { ok: false, msg: '投票不存在' };
        if ((p.VotedBy || []).indexOf(employeeId) >= 0) return { ok: false, msg: '你已参与过该投票' };
        var exp = (p.Expire || '');
        if (exp && exp < fmtDate()) return { ok: false, msg: '该投票已截止' };
        p.Options[optionIdx].count = (p.Options[optionIdx].count || 0) + 1;
        p.VotedBy.push(employeeId);
        save(); return { ok: true };
    }
    function deletePoll(id) {
        var list = db.polls = db.polls || [];
        var idx = list.findIndex(function (x) { return x.PollID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }
    // 固定资产
    function getAssets(filter) {
        var list = (db.assets || []).slice();
        filter = filter || {};
        if (filter.dept) list = list.filter(function (a) { return a.Dept === filter.dept; });
        if (filter.status) list = list.filter(function (a) { return a.Status === filter.status; });
        list.sort(function (a, b) { return (a.AssetID || 0) - (b.AssetID || 0); });
        return list;
    }
    function addAsset(a) {
        var list = db.assets = db.assets || [];
        a.AssetID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.AssetID; })) : 0) + 1;
        a.UpdateTime = a.UpdateTime || fmtNow();
        list.push(a); save();
        recordAudit('资产登记', a.Name, a.Category + ' / ' + (a.SN || '无序列号'));
        return a;
    }
    function updateAsset(id, patch) {
        var idx = (db.assets || []).findIndex(function (x) { return x.AssetID === id; });
        if (idx < 0) return false;
        for (var k in patch) db.assets[idx][k] = patch[k];
        db.assets[idx].UpdateTime = fmtNow();
        save(); recordAudit('资产流转', db.assets[idx].Name, '状态 → ' + (patch.Status || ''));
        return true;
    }
    function deleteAsset(id) {
        var list = db.assets = db.assets || [];
        var idx = list.findIndex(function (x) { return x.AssetID === id; });
        if (idx >= 0) { var nm = list[idx].Name; list.splice(idx, 1); save(); recordAudit('删除资产', nm, ''); return true; }
        return false;
    }
    // 行政申请（用车 / 用印）
    function getAdminRequests(filter) {
        var list = (db.adminRequests || []).slice();
        filter = filter || {};
        if (filter.type) list = list.filter(function (r) { return r.Type === filter.type; });
        if (filter.status) list = list.filter(function (r) { return r.Status === filter.status; });
        if (filter.department) list = list.filter(function (r) { return r.Department === filter.department; });
        if (filter.applicantId) list = list.filter(function (r) { return r.ApplicantID === filter.applicantId; });
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addAdminRequest(r) {
        var list = db.adminRequests = db.adminRequests || [];
        r.ReqID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.ReqID; })) : 0) + 1;
        r.CreateTime = r.CreateTime || fmtNow();
        r.Status = r.Status || '待审批';
        list.push(r); save(); return r;
    }
    function approveAdminRequest(id, ok, note, by) {
        var idx = (db.adminRequests || []).findIndex(function (x) { return x.ReqID === id; });
        if (idx < 0) return false;
        db.adminRequests[idx].Status = ok ? '已批准' : '已驳回';
        db.adminRequests[idx].ApproveNote = note || '';
        db.adminRequests[idx].ApproveBy = by || '';
        db.adminRequests[idx].ApproveTime = fmtNow();
        save(); return true;
    }
    function deleteAdminRequest(id) {
        var list = db.adminRequests = db.adminRequests || [];
        var idx = list.findIndex(function (x) { return x.ReqID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }
    // 任务简报
    function getBriefings(filter) {
        var list = (db.briefings || []).slice();
        filter = filter || {};
        if (filter.dept && filter.dept !== 'ALL') list = list.filter(function (b) { return b.Dept === filter.dept || b.Dept === 'ALL'; });
        if (filter.employeeId) {
            var e = (db.employees || []).find(function (x) { return x.EmployeeID === filter.employeeId; });
            var dept = e ? e.Department : '';
            list = list.filter(function (b) { return b.Dept === 'ALL' || b.Dept === dept; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addBriefing(b) {
        var list = db.briefings = db.briefings || [];
        b.BriefID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.BriefID; })) : 0) + 1;
        b.CreateTime = b.CreateTime || fmtNow();
        b.Status = b.Status || '待执行';
        b.Reports = b.Reports || [];
        list.push(b); save(); return b;
    }
    function submitBriefingReport(briefId, emp, content) {
        var b = (db.briefings || []).find(function (x) { return x.BriefID === briefId; });
        if (!b) return { ok: false, msg: '简报不存在' };
        b.Reports = b.Reports || [];
        var exist = b.Reports.findIndex(function (r) { return r.EmployeeID === emp.EmployeeID; });
        var rep = { EmployeeID: emp.EmployeeID, EmployeeName: emp.EmployeeName, Content: content, Time: fmtNow() };
        if (exist >= 0) b.Reports[exist] = rep; else b.Reports.push(rep);
        b.Status = '进行中';
        save(); return { ok: true };
    }
    function finishBriefing(id, status) {
        var b = (db.briefings || []).find(function (x) { return x.BriefID === id; });
        if (!b) return false;
        b.Status = status || '已完成';
        save(); return true;
    }
    function deleteBriefing(id) {
        var list = db.briefings = db.briefings || [];
        var idx = list.findIndex(function (x) { return x.BriefID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }
    // 技能矩阵
    function getSkillDefs() { return (db.skillDefs || []).slice(); }
    function addSkillDef(d) {
        var list = db.skillDefs = db.skillDefs || [];
        d.SkillID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.SkillID; })) : 0) + 1;
        list.push(d); save(); return d;
    }
    function deleteSkillDef(id) {
        var list = db.skillDefs = db.skillDefs || [];
        var idx = list.findIndex(function (x) { return x.SkillID === id; });
        if (idx >= 0) { list.splice(idx, 1); db.skillLevels = (db.skillLevels || []).filter(function (l) { return l.SkillID !== id; }); save(); return true; }
        return false;
    }
    function getSkillLevels() { return (db.skillLevels || []).slice(); }
    function setSkillLevel(skillId, employeeId, level) {
        var list = db.skillLevels = db.skillLevels || [];
        var idx = list.findIndex(function (l) { return l.SkillID === skillId && l.EmployeeID === employeeId; });
        if (level <= 0) {
            if (idx >= 0) { list.splice(idx, 1); save(); }
            return true;
        }
        if (idx >= 0) { list[idx].Level = level; list[idx].UpdatedAt = fmtNow(); }
        else { list.push({ SkillID: skillId, EmployeeID: employeeId, Level: level, UpdatedAt: fmtNow() }); }
        save(); return true;
    }
    // 演习警报
    function getAlerts() {
        return (db.alerts || []).slice().sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
    }
    function addAlert(a) {
        var list = db.alerts = db.alerts || [];
        a.AlertID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.AlertID; })) : 0) + 1;
        a.CreateTime = a.CreateTime || fmtNow();
        list.push(a); save(); return a;
    }
    function deleteAlert(id) {
        var list = db.alerts = db.alerts || [];
        var idx = list.findIndex(function (x) { return x.AlertID === id; });
        if (idx >= 0) { list.splice(idx, 1); save(); return true; }
        return false;
    }

    // ------- V13 扩展：审计日志 -------
    var auditOperator = null;
    function setAuditOperator(emp) { auditOperator = emp || null; }
    function recordAudit(action, target, detail) {
        var list = db.auditLogs = db.auditLogs || [];
        var op = auditOperator || { EmployeeID: '', EmployeeName: '系统' };
        list.push({ LogID: list.length + 1, OperatorID: op.EmployeeID, OperatorName: op.EmployeeName, Action: action, Target: target, Detail: detail || '', Time: fmtNow() });
        if (list.length > 500) list.splice(0, list.length - 500); // 只保留最近 500 条
        save();
    }
    function getAuditLogs(filter) {
        var list = (db.auditLogs || []).slice();
        filter = filter || {};
        if (filter.action) list = list.filter(function (l) { return l.Action === filter.action; });
        if (filter.keyword) {
            var kw = filter.keyword.toLowerCase();
            list = list.filter(function (l) { return (l.OperatorName || '').toLowerCase().indexOf(kw) >= 0 || (l.Target || '').toLowerCase().indexOf(kw) >= 0 || (l.Detail || '').toLowerCase().indexOf(kw) >= 0; });
        }
        list.sort(function (a, b) { return (b.Time || '').localeCompare(a.Time || ''); });
        return list;
    }
    // ------- V13 扩展：干员晋级申请 -------
    function getAdvanceRequests(filter) {
        var list = (db.advanceRequests || []).slice();
        filter = filter || {};
        if (filter.status) list = list.filter(function (r) { return r.Status === filter.status; });
        if (filter.department) {
            var ids = {};
            db.employees.forEach(function (e) { if (e.Department === filter.department) ids[e.EmployeeID] = 1; });
            list = list.filter(function (r) { return ids[r.EmployeeID]; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addAdvanceRequest(r) {
        var list = db.advanceRequests = db.advanceRequests || [];
        r.AdvID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.AdvID; })) : 0) + 1;
        r.CreateTime = r.CreateTime || fmtNow();
        r.Status = r.Status || '待审批';
        list.push(r); save();
        recordAudit('晋级申请', r.EmployeeName, '申请 ' + r.FromRank + ' → ' + r.ToRank);
        return r;
    }
    function approveAdvanceRequest(id, ok, note, by) {
        var idx = (db.advanceRequests || []).findIndex(function (x) { return x.AdvID === id; });
        if (idx < 0) return false;
        db.advanceRequests[idx].Status = ok ? '已通过' : '已驳回';
        db.advanceRequests[idx].ApproveNote = note || '';
        db.advanceRequests[idx].ApproveBy = by || '';
        db.advanceRequests[idx].ApproveTime = fmtNow();
        save();
        recordAudit('晋级审批', db.advanceRequests[idx].EmployeeName, ok ? '通过晋级申请' : '驳回晋级申请');
        return true;
    }
    // ------- V13 扩展：人事流程（转正/离职） -------
    function getWorkFlows(filter) {
        var list = (db.workFlows || []).slice();
        filter = filter || {};
        if (filter.status) list = list.filter(function (w) { return w.Status === filter.status; });
        if (filter.department) {
            var ids = {};
            db.employees.forEach(function (e) { if (e.Department === filter.department) ids[e.EmployeeID] = 1; });
            list = list.filter(function (w) { return ids[w.EmployeeID]; });
        }
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addWorkFlow(w) {
        var list = db.workFlows = db.workFlows || [];
        w.FlowID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.FlowID; })) : 0) + 1;
        w.CreateTime = w.CreateTime || fmtNow();
        w.Status = w.Status || '待审批';
        list.push(w); save();
        recordAudit('人事流程', w.EmployeeName, '发起' + w.Type + '申请');
        return w;
    }
    function approveWorkFlow(id, ok, note, by) {
        var idx = (db.workFlows || []).findIndex(function (x) { return x.FlowID === id; });
        if (idx < 0) return false;
        db.workFlows[idx].Status = ok ? '已批准' : '已驳回';
        db.workFlows[idx].ApproveNote = note || '';
        db.workFlows[idx].ApproveBy = by || '';
        db.workFlows[idx].ApproveTime = fmtNow();
        save();
        recordAudit('人事流程', db.workFlows[idx].EmployeeName, ok ? '批准' + db.workFlows[idx].Type : '驳回' + db.workFlows[idx].Type);
        // 离职申请批准后自动生成交接清单
        if (ok && db.workFlows[idx].Type === '离职') {
            var emp = db.employees.find(function (e) { return e.EmployeeID === db.workFlows[idx].EmployeeID; });
            addResignHandover({
                FlowID: db.workFlows[idx].FlowID,
                EmployeeID: db.workFlows[idx].EmployeeID,
                EmployeeName: db.workFlows[idx].EmployeeName,
                Dept: emp ? emp.Department : '',
                Items: [
                    { Name: '归还办公设备（电脑 / 门禁卡 / 工牌）', Done: false },
                    { Name: '移交在办任务与项目文档', Done: false },
                    { Name: '账号权限回收（系统 / 邮箱 / 文件柜）', Done: false },
                    { Name: '财务结算确认（工资 / 报销 / 借款）', Done: false }
                ]
            });
        }
        return true;
    }
    // ------- V13 扩展：部门群聊 -------
    function getGroupMessages(dept) {
        return (db.groupMessages || []).filter(function (m) { return !dept || m.Dept === dept; })
            .sort(function (a, b) { return (a.Time || '').localeCompare(b.Time || ''); });
    }
    function addGroupMessage(msg) {
        var list = db.groupMessages = db.groupMessages || [];
        msg.GMsgID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.GMsgID; })) : 0) + 1;
        msg.Time = msg.Time || fmtNow();
        list.push(msg); save();
        return msg;
    }
    // ------- V13 扩展：数据备份 / 恢复 -------
    function exportAllData() {
        return JSON.stringify({ db: db, exportedAt: fmtNow() });
    }
    function importAllData(jsonStr) {
        try {
            var obj = JSON.parse(jsonStr);
            if (!obj || !obj.db || typeof obj.db !== 'object') return { ok: false, msg: '备份文件格式不正确' };
            if (!obj.db.employees || !obj.db.departments) return { ok: false, msg: '备份文件缺少核心数据表' };
            db = obj.db;
            save();
            recordAudit('数据恢复', '全库', '导入备份并覆盖当前数据');
            return { ok: true, msg: '恢复成功：' + (db.employees || []).length + ' 名员工' };
        } catch (e) {
            return { ok: false, msg: '备份文件解析失败：' + e.message };
        }
    }
    function resetAllData() {
        db = seed();
        save();
        recordAudit('数据重置', '全库', '恢复出厂种子数据');
    }

    // ------- V14 管理侧扩展：考勤规则 -------
    function getAttendanceRule() {
        var list = db.attendanceRules || [];
        if (!list.length) { db.attendanceRules = seed().attendanceRules; save(); return db.attendanceRules[0]; }
        return list[0];
    }
    function updateAttendanceRule(patch) {
        var list = db.attendanceRules = db.attendanceRules || [];
        if (!list.length) list.push(seed().attendanceRules[0]);
        var r = list[0];
        for (var k in patch) if (patch[k] !== undefined) r[k] = patch[k];
        r.UpdateTime = fmtNow();
        save();
        recordAudit('考勤规则', '系统', '更新规则：上班 ' + r.WorkStart + ' 下班 ' + r.WorkEnd + ' 迟到阈值 ' + r.LateThreshold + ' 分钟');
        return r;
    }
    // ------- V14 管理侧扩展：审批委托代理 -------
    function getDelegations(filter) {
        var list = (db.approvalDelegations || []).slice();
        filter = filter || {};
        if (filter.fromId) list = list.filter(function (d) { return d.FromID === filter.fromId; });
        if (filter.dept) list = list.filter(function (d) { return d.Dept === filter.dept; });
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addDelegation(d) {
        var list = db.approvalDelegations = db.approvalDelegations || [];
        d.DelegationID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.DelegationID; })) : 0) + 1;
        d.Status = d.Status || '生效中';
        d.CreateTime = d.CreateTime || fmtNow();
        list.push(d); save();
        recordAudit('审批代理', d.FromName, '委托 ' + d.ToName + ' 代审 ' + d.StartDate + ' ~ ' + d.EndDate);
        return d;
    }
    function deleteDelegation(id) {
        var list = db.approvalDelegations = db.approvalDelegations || [];
        var idx = list.findIndex(function (x) { return x.DelegationID === id; });
        if (idx < 0) return false;
        var nm = list[idx].FromName;
        list.splice(idx, 1); save();
        recordAudit('审批代理', nm, '撤销委托');
        return true;
    }
    function getEffectiveDelegation(empId, dateStr) {
        var d = dateStr || today();
        return (db.approvalDelegations || []).find(function (x) {
            return x.FromID === empId && x.Status === '生效中' && x.StartDate <= d && x.EndDate >= d;
        });
    }
    // ------- V14 管理侧扩展：离职交接清单 -------
    function getResignHandovers(filter) {
        var list = (db.resignHandovers || []).slice();
        filter = filter || {};
        if (filter.status) list = list.filter(function (h) { return h.Status === filter.status; });
        if (filter.dept) list = list.filter(function (h) { return h.Dept === filter.dept; });
        list.sort(function (a, b) { return (b.CreateTime || '').localeCompare(a.CreateTime || ''); });
        return list;
    }
    function addResignHandover(h) {
        var list = db.resignHandovers = db.resignHandovers || [];
        h.HandoverID = (list.length ? Math.max.apply(null, list.map(function (x) { return x.HandoverID; })) : 0) + 1;
        h.Status = h.Status || '进行中';
        h.CreateTime = h.CreateTime || fmtNow();
        list.push(h); save();
        recordAudit('离职交接', h.EmployeeName, '生成交接清单（' + (h.Items || []).length + ' 项）');
        return h;
    }
    function updateHandoverItem(handoverId, itemIdx, done) {
        var h = (db.resignHandovers || []).find(function (x) { return x.HandoverID === handoverId; });
        if (!h || !h.Items[itemIdx]) return false;
        h.Items[itemIdx].Done = !!done;
        var all = h.Items.every(function (i) { return i.Done; });
        if (all) h.Status = '已完成';
        save();
        recordAudit('离职交接', h.EmployeeName, (done ? '完成' : '回退') + '交接项：' + h.Items[itemIdx].Name);
        return true;
    }
    // ------- V14 管理侧扩展：部门编制 -------
    function getHeadcounts() {
        var list = (db.deptHeadcounts || []).slice();
        list.forEach(function (h) {
            var cnt = db.employees.filter(function (e) { return e.Department === h.Dept && e.IsActive; }).length;
            h.Current = cnt;
            h.Gap = h.Headcount - cnt;
        });
        return list;
    }
    function setHeadcount(dept, hc, note) {
        var list = db.deptHeadcounts = db.deptHeadcounts || [];
        var hit = list.find(function (x) { return x.Dept === dept; });
        if (hit) { hit.Headcount = hc; hit.Note = note || hit.Note; }
        else { list.push({ HCID: list.length + 1, Dept: dept, Headcount: hc, Note: note || '' }); }
        save();
        var d = (db.departments || []).find(function (x) { return x.DepartmentCode === dept; });
        recordAudit('部门编制', d ? d.DepartmentName : dept, '设置编制 ' + hc + ' 人');
        return true;
    }
    // ------- V14 管理侧扩展：安全中心（高危操作复核队列） -------
    function getSecurityReviews() {
        var list = (db.securityReviews || []).slice();
        list.sort(function (a, b) { return (b.Time || '').localeCompare(a.Time || ''); });
        return list;
    }
    function addSecurityReview(action, detail) {
        var list = db.securityReviews = db.securityReviews || [];
        var r = { ReviewID: list.length + 1, Action: action, Detail: detail, Status: '待复核', RequesterID: '', RequesterName: '', Time: fmtNow() };
        list.push(r); save();
        return r;
    }
    function confirmSecurityReview(id, byName) {
        var r = (db.securityReviews || []).find(function (x) { return x.ReviewID === id; });
        if (!r || r.Status !== '待复核') return false;
        r.Status = '已执行'; r.ReviewTime = fmtNow(); r.Reviewer = byName;
        save();
        recordAudit('高危操作', r.Action, r.Detail + '（复核人 ' + byName + '）');
        return true;
    }
    function cancelSecurityReview(id, byName) {
        var r = (db.securityReviews || []).find(function (x) { return x.ReviewID === id; });
        if (!r || r.Status !== '待复核') return false;
        r.Status = '已取消'; r.ReviewTime = fmtNow(); r.Reviewer = byName;
        save();
        recordAudit('高危操作', r.Action, '取消执行（' + byName + '）');
        return true;
    }

    return {
        load: load, reset: reset,
        getEmployees: getEmployees, getEmployeeById: getEmployeeById,
        addEmployee: addEmployee, updateEmployee: updateEmployee, deleteEmployee: deleteEmployee,
        batchUpdateStatus: batchUpdateStatus, batchDelete: batchDelete,
        getDepartments: getDepartments, getDeptName: getDeptName,
        addDepartment: addDepartment, updateDepartment: updateDepartment, deleteDepartment: deleteDepartment,
        getAttendance: getAttendance, addAttendance: addAttendance,
        getLeaves: getLeaves, addLeave: addLeave, approveLeave: approveLeave,
        getMissions: getMissions, completeMission: completeMission,
        addMission: addMission, submitMission: submitMission,
        getDeptMissions: getDeptMissions, scoreMission: scoreMission,
        getReviews: getReviews, addReview: addReview, updateReview: updateReview,
        deleteReview: deleteReview, submitReview: submitReview,
        getAnnouncements: getAnnouncements, addAnnouncement: addAnnouncement,
        deleteAnnouncement: deleteAnnouncement,
        getMilestones: getMilestones, addMilestone: addMilestone, deleteMilestone: deleteMilestone,
        getDuties: getDuties, addDuty: addDuty, deleteDuty: deleteDuty,
        getFeedbacks: getFeedbacks, addFeedback: addFeedback,
        handleFeedback: handleFeedback, deleteFeedback: deleteFeedback,
        getExpenses: getExpenses, addExpense: addExpense,
        approveExpense: approveExpense, deleteExpense: deleteExpense,
        getTrainings: getTrainings, addTraining: addTraining, deleteTraining: deleteTraining,
        getMyTrainingState: getMyTrainingState, getTrainingEnrolls: getTrainingEnrolls, enrollTraining: enrollTraining,
        completeTraining: completeTraining, getTrainingStats: getTrainingStats,
        getProfileUpdates: getProfileUpdates, addProfileUpdate: addProfileUpdate,
        approveProfileUpdate: approveProfileUpdate, deleteProfileUpdate: deleteProfileUpdate,
        getFileVault: getFileVault, addFileVault: addFileVault, deleteFileVault: deleteFileVault,
        getWeeklyReports: getWeeklyReports, addWeeklyReport: addWeeklyReport,
        reviewWeeklyReport: reviewWeeklyReport, deleteWeeklyReport: deleteWeeklyReport,
        getEquipRequests: getEquipRequests, addEquipRequest: addEquipRequest,
        approveEquipRequest: approveEquipRequest, deleteEquipRequest: deleteEquipRequest,
        getRecognitions: getRecognitions, addRecognition: addRecognition,
        deleteRecognition: deleteRecognition,
        getMessagesBetween: getMessagesBetween, addMessage: addMessage,
        getConversations: getConversations, markPairRead: markPairRead,
        getSalaries: getSalaries, addSalary: addSalary, updateSalary: updateSalary, deleteSalary: deleteSalary,
        getMeetings: getMeetings, addMeeting: addMeeting, updateMeeting: updateMeeting, deleteMeeting: deleteMeeting,
        getContracts: getContracts, addContract: addContract, updateContract: updateContract, deleteContract: deleteContract,
        daysUntil: daysUntil, getExpiringContracts: getExpiringContracts,
        getSchedules: getSchedules, addSchedule: addSchedule, deleteSchedule: deleteSchedule,
        getKnowledge: getKnowledge, addKnowledge: addKnowledge, viewKnowledge: viewKnowledge, deleteKnowledge: deleteKnowledge,
        getPolls: getPolls, addPoll: addPoll, votePoll: votePoll, deletePoll: deletePoll,
        getAssets: getAssets, addAsset: addAsset, updateAsset: updateAsset, deleteAsset: deleteAsset,
        getAdminRequests: getAdminRequests, addAdminRequest: addAdminRequest,
        approveAdminRequest: approveAdminRequest, deleteAdminRequest: deleteAdminRequest,
        getBriefings: getBriefings, addBriefing: addBriefing,
        submitBriefingReport: submitBriefingReport, finishBriefing: finishBriefing, deleteBriefing: deleteBriefing,
        getSkillDefs: getSkillDefs, addSkillDef: addSkillDef, deleteSkillDef: deleteSkillDef,
        getSkillLevels: getSkillLevels, setSkillLevel: setSkillLevel,
        getAlerts: getAlerts, addAlert: addAlert, deleteAlert: deleteAlert,
        setAuditOperator: setAuditOperator, recordAudit: recordAudit, getAuditLogs: getAuditLogs,
        getAdvanceRequests: getAdvanceRequests, addAdvanceRequest: addAdvanceRequest,
        approveAdvanceRequest: approveAdvanceRequest,
        getWorkFlows: getWorkFlows, addWorkFlow: addWorkFlow, approveWorkFlow: approveWorkFlow,
        getGroupMessages: getGroupMessages, addGroupMessage: addGroupMessage,
        exportAllData: exportAllData, importAllData: importAllData, resetAllData: resetAllData,
        getAttendanceRule: getAttendanceRule, updateAttendanceRule: updateAttendanceRule,
        getDelegations: getDelegations, addDelegation: addDelegation,
        deleteDelegation: deleteDelegation, getEffectiveDelegation: getEffectiveDelegation,
        getResignHandovers: getResignHandovers, addResignHandover: addResignHandover,
        updateHandoverItem: updateHandoverItem,
        getHeadcounts: getHeadcounts, setHeadcount: setHeadcount,
        getSecurityReviews: getSecurityReviews, addSecurityReview: addSecurityReview,
        confirmSecurityReview: confirmSecurityReview, cancelSecurityReview: cancelSecurityReview,
        getTodos: getTodos,
        recordLogin: recordLogin,
        // ---------- V15 管理后台扩展 ----------
        getRoles: getRoles, getRoleName: getRoleName, getRoleByEmp: getRoleByEmp, addRole: addRole, updateRole: updateRole, deleteRole: deleteRole,
        getRoleByLevel: getRoleByLevel,
        getRegRequests: getRegRequests, addRegRequest: addRegRequest,
        approveRegRequest: approveRegRequest, deleteRegRequest: deleteRegRequest,
        getComments: getComments, addComment: addComment, deleteComment: deleteComment,
        getSettings: getSettings, saveSettings: saveSettings,
        getErrorLogs: getErrorLogs, addErrorLog: addErrorLog, clearErrorLogs: clearErrorLogs,
        getLoginLogs: getLoginLogs,
        getImgMetas: getImgMetas, addImgMeta: addImgMeta, removeImgMeta: removeImgMeta,
        getDashPrefs: getDashPrefs, saveDashPrefs: saveDashPrefs,
        fmtDate: fmtDate, fmtTime: fmtTime, fmtNow: fmtNow, today: today, daysBetween: daysBetween
    };
})();
