-- 创建用户信息表
CREATE TABLE EmployeeUser (
    -- 员工编号：主键，唯一标识
    EmployeeID VARCHAR(20) NOT NULL PRIMARY KEY,
    
    -- 员工姓名
    EmployeeName NVARCHAR(50) NOT NULL,
    
    -- 部门：存储部门代码或名称
    Department NVARCHAR(50) NOT NULL,
    
    -- 性别：只能为'男'或'女'，使用CHECK约束
    Gender CHAR(2) NOT NULL CHECK (Gender IN ('男', '女')),
    
    -- 年龄：限制在18-70岁之间
    Age INT NOT NULL CHECK (Age >= 18 AND Age <= 70),
    
    -- 权限等级：1-普通员工，2-部门主管，3-管理员
    PermissionLevel INT NOT NULL DEFAULT 1 CHECK (PermissionLevel IN (1, 2, 3)),
    
    -- 密码：加密存储，最小长度8位
    PasswordHash VARCHAR(128) NOT NULL,
    
    -- 手机号：中国手机号格式
    PhoneNumber VARCHAR(20) NOT NULL,
    
    -- 邮箱：公司邮箱格式验证
    Email VARCHAR(100) NOT NULL,
    
    -- 创建时间：记录账号创建时间
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    -- 最后登录时间
    LastLogin DATETIME NULL,
    
    -- 账号状态：1-启用，0-禁用
    IsActive BIT NOT NULL DEFAULT 1,
    
    -- 备注信息
    Remarks NVARCHAR(500) NULL,
    
    -- 创建人（管理员账号）
    CreatedBy VARCHAR(20) NULL,
    
    -- 最后修改时间
    UpdatedAt DATETIME NULL,
    
    -- 最后修改人
    UpdatedBy VARCHAR(20) NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IX_Department ON EmployeeUser(Department);
CREATE INDEX IX_PermissionLevel ON EmployeeUser(PermissionLevel);
CREATE UNIQUE INDEX IX_PhoneNumber ON EmployeeUser(PhoneNumber);
CREATE UNIQUE INDEX IX_Email ON EmployeeUser(Email);

-- 创建部门表（可选，用于规范化部门信息）
CREATE TABLE Departments (
    DepartmentID INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentCode VARCHAR(20) NOT NULL UNIQUE,
    DepartmentName NVARCHAR(50) NOT NULL,
    ParentDepartmentID INT NULL,
    ManagerID VARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

-- 如果需要更详细的权限管理，可以创建权限表
CREATE TABLE UserPermissions (
    PermissionID INT IDENTITY(1,1) PRIMARY KEY,
    PermissionLevel INT NOT NULL,
    PermissionName NVARCHAR(50) NOT NULL,
    CanView BIT NOT NULL DEFAULT 0,
    CanEdit BIT NOT NULL DEFAULT 0,
    CanDelete BIT NOT NULL DEFAULT 0,
    CanManageUsers BIT NOT NULL DEFAULT 0
);

-- 插入默认权限数据
INSERT INTO UserPermissions (PermissionLevel, PermissionName, CanView, CanEdit, CanDelete, CanManageUsers)
VALUES 
(1, '普通员工', 1, 0, 0, 0),
(2, '部门主管', 1, 1, 0, 0),
(3, '管理员', 1, 1, 1, 1);

-- 创建存储过程用于添加新员工
