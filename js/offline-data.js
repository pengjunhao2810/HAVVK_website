// ============================================================
// 离线版数据层（本地模拟数据）
// 说明：原站数据由后端 dfx-back.7jing.com 提供，离线版本改为
// 本地内置数据，保证断网环境下功能完整可用。
// 管理员账号：42847 / time0926
// 加密文件夹/文档访问密钥：暂时全部置空（免密解锁）
// ============================================================
var OFFLINE_DATA = {
    // 文件夹列表
    folders: [
        { id: 'f1', name: '人员伤亡事故调查', icon: 'img/folder_icon1.png', mark: '伤亡', grad: '#e2584b', grad2: '#a83a2f', locked: true, password: '', maxlength: 20, desc: '巴别塔袭击事件伤员救治记录与全球安全部行动档案', update: '09-16' },
        { id: 'f2', name: '哈夫克分部选址报告', icon: 'img/folder_icon2.png', mark: '选址', grad: '#0e5fb7', grad2: '#0a3f80', locked: true, password: '', maxlength: 20, desc: '全球新分部选址评估、地质勘测与能源供给数据', update: '09-12' },
        { id: 'f3', name: '核电招聘部', icon: 'img/folder_icon3.png', mark: '核电', grad: '#f2a33c', grad2: '#c97a14', locked: false, password: '', maxlength: 6, desc: '核电招聘部岗位需求清单与 2026 秋季全球招聘公告', update: '09-08' },
        { id: 'f4', name: '脑机α原型机', icon: 'img/folder_icon1.png', mark: '脑机', grad: '#7a5cf0', grad2: '#5436c9', locked: true, password: '', maxlength: 20, desc: 'Relink α 原型机研发历程、实验影像与临床数据', update: '09-15' },
        { id: 'f5', name: '推荐给你', icon: 'img/folder_icon2.png', mark: '推荐', grad: '#0aa2a0', grad2: '#0e6f6d', locked: false, password: '', maxlength: 6, desc: 'Relink 1.0/2.0 产品介绍与员工体验计划', update: '09-10' },
        { id: 'f6', name: '草稿', icon: 'img/folder_icon3.png', mark: '草稿', grad: '#7a94b0', grad2: '#5a7088', locked: false, password: '', maxlength: 6, desc: '未完成整理的内部文档与灵感速记', update: '09-02' }
    ],

    // 各文件夹下的文档列表（folder_id -> docs）
    documents: {
        'f1': [
            { id: 'd1', name: '事故调查报告-德穆兰', locked: false, password: '', maxlength: 6, type: 'doc', src: '' },
            { id: 'd2', name: '现场勘验记录', locked: false, password: '', maxlength: 6, type: 'image', src: 'img/rp1.jpg' },
            { id: 'd3', name: '伤亡人员名单', locked: true, password: '', maxlength: 20, type: 'image', src: 'img/rp2.jpg' },
            { id: 'd4', name: '事件时间线', locked: false, password: '', maxlength: 6, type: 'doc', src: '' }
        ],
        'f2': [
            { id: 'd5', name: '选址评估报告', locked: false, password: '', maxlength: 6, type: 'doc', src: '' },
            { id: 'd6', name: '候选区位示意图', locked: false, password: '', maxlength: 6, type: 'image', src: 'img/rp3.jpg' },
            { id: 'd7', name: '地质勘测数据', locked: true, password: '', maxlength: 20, type: 'doc', src: '' },
            { id: 'd8', name: '分部规划图', locked: false, password: '', maxlength: 6, type: 'image', src: 'img/rp4.jpg' }
        ],
        'f3': [
            { id: 'd9', name: '招聘公告', locked: false, password: '', maxlength: 6, type: 'doc', src: '' },
            { id: 'd10', name: '岗位需求清单', locked: false, password: '', maxlength: 6, type: 'doc', src: '' },
            { id: 'd11', name: '厂区实景', locked: false, password: '', maxlength: 6, type: 'image', src: 'img/pic1.jpg' }
        ],
        'f4': [
            { id: 'd12', name: '原型机技术说明', locked: false, password: '', maxlength: 6, type: 'doc', src: '' },
            { id: 'd13', name: '研发实验影像', locked: true, password: '', maxlength: 20, type: 'image', src: 'img/pic2.jpg' },
            { id: 'd14', name: '临床数据汇总', locked: false, password: '', maxlength: 6, type: 'doc', src: '' }
        ],
        'f5': [
            { id: 'd15', name: 'Relink 1.0 介绍', locked: false, password: '', maxlength: 6, type: 'doc', src: '' },
            { id: 'd16', name: 'Relink 2.0 介绍', locked: false, password: '', maxlength: 6, type: 'doc', src: '' },
            { id: 'd17', name: '产品宣传图', locked: false, password: '', maxlength: 6, type: 'image', src: 'img/gift1.png' }
        ],
        'f6': [
            { id: 'd18', name: '未命名文档-01', locked: false, password: '', maxlength: 6, type: 'doc', src: '' },
            { id: 'd19', name: '灵感速记', locked: false, password: '', maxlength: 6, type: 'doc', src: '' }
        ]
    },

    // 文档详情内容（doc_id -> {title, content}）
    details: {
        'd1': {
            title: '事故调查报告-德穆兰',
            content: '<h3>哈夫克全球安全总监遇袭事件调查报告</h3><p>事件编号：HAV-INC-0427</p><p>报告人：哈夫克安全事务部</p><p>经调查确认，德穆兰女士在恐袭事件中失去视觉，声带与面部严重受损。事件发生后，哈夫克立即启动最高级别应急响应，并调集顶尖医疗资源进行救治。</p><p>后续通过 Relink 脑机技术对其视觉功能进行重建，对发声能力与肌肉协调性实施修复，目前康复进展良好。</p>'
        },
        'd4': {
            title: '事件时间线',
            content: '<h3>事件时间线</h3><p>14:32 收到恐袭警报，安全部启动一级响应。</p><p>14:47 现场处置完成，伤员转运至哈夫克医疗中心。</p><p>15:20 德穆兰女士进入抢救室，生命体征稳定。</p><p>第 7 天：完成首期 Relink 植入手术。</p><p>第 30 天：视觉功能恢复测试通过。</p><p>第 90 天：发声与肌肉协调性显著改善。</p>'
        },
        'd5': {
            title: '选址评估报告',
            content: '<h3>哈夫克分部选址评估报告</h3><p>项目：新分部选址</p><p>候选地点共计 5 处，综合评估交通、地质、能源供给、周边安全等维度。</p><p>评估结论：推荐 C 区地块，该区域地质稳定、能源网络完善，且便于与现有设施联动。</p>'
        },
        'd7': {
            title: '地质勘测数据',
            content: '<h3>地质勘测数据</h3><p>勘测单位：哈夫克工程部</p><p>勘测深度：地下 80m</p><p>岩层结构：以花岗岩为主，承重能力满足建设要求。</p><p>地下水水位：位于地下 45m，对施工影响可控。</p><p>地震设防等级：满足当地最高设防标准。</p>'
        },
        'd9': {
            title: '招聘公告',
            content: '<h3>核电招聘部 招聘公告</h3><p>哈夫克核电招聘部面向全球招募核电领域专业人才。</p><p>岗位方向：反应堆运维、辐射防护、核安全监管、设备检修。</p><p>福利待遇：具备行业竞争力的薪酬体系、完善的职业发展通道、Relink 技术员工健康保障计划。</p>'
        },
        'd10': {
            title: '岗位需求清单',
            content: '<h3>岗位需求清单</h3><p>1. 反应堆运行工程师：5 名，要求 5 年以上核电运行经验。</p><p>2. 辐射防护专员：3 名，持有相关资质认证。</p><p>3. 核安全分析师：2 名，熟悉国际核安全标准。</p><p>4. 设备检修技师：8 名，具备大型设备检修经验。</p>'
        },
        'd12': {
            title: '原型机技术说明',
            content: '<h3>脑机α原型机 技术说明</h3><p>代号：α 原型机（Neural Device α Prototype）</p><p>定位：Relink 实验室独立研发的脑机接口原型设备。</p><p>核心能力：双向神经信号交互、运动与认知功能高精度重建。</p><p>状态：已完成临床实验，正在全球逐步进行医用推广。</p>'
        },
        'd14': {
            title: '临床数据汇总',
            content: '<h3>临床数据汇总</h3><p>累计入组受试者：1,284 例。</p><p>视觉重建成功率：97.6%。</p><p>运动功能恢复有效率：95.2%。</p><p>不良反应发生率：低于 0.3%，均为轻度、可逆。</p><p>结论：α 原型机安全性与有效性达到预期目标。</p>'
        },
        'd15': {
            title: 'Relink 1.0 介绍',
            content: '<h3>Relink 1.0</h3><p>Relink 第一代产品专注于医疗用途，旨在帮助神经退行性疾病患者或运动障碍者恢复身体机能。</p><p>应用场景：瘫痪康复、失语症治疗、视觉重建等。</p>'
        },
        'd16': {
            title: 'Relink 2.0 介绍',
            content: '<h3>Relink 2.0</h3><p>Relink 第二代产品不仅针对疾病人员，普通人员也可以选择植入，强化自身的身体机能。</p><p>核心理念：赋予科技温度，重塑与世界的连接方式。</p>'
        },
        'd18': {
            title: '未命名文档-01',
            content: '<h3>未命名文档-01</h3><p>这是一份尚未完成整理的草稿。</p><p>……</p>'
        },
        'd19': {
            title: '灵感速记',
            content: '<h3>灵感速记</h3><p>1. 脑机接口的模块化设计思路。</p><p>2. 跨模态感知拓展的可行性验证。</p><p>3. 脑-脑直接通讯的协议草案。</p>'
        }
    },

    // 集团概况（教务门户式首页）
    groupInfo: {
        name: '哈夫克集团',
        nameEn: 'HAVVK GROUP',
        slogan: '信息予你无限',
        sloganEn: 'INFORMATION FOR YOU, UNLIMITED',
        intro: '哈夫克集团（HAVVK GROUP）由雅各布继承父母遗志于2007年创立，以"实现资源平等、改善人类生活"为最终愿景。集团以全球物流业务起家，在技术专家巴西尔·瓦拉比加入后转型为AI技术平台企业，业务逐步覆盖人工智能、脑机接口、核能电力、生物医疗与全球安保。',
        introEn: 'Founded in 2007 by Jacob, inheriting his parents\' will, HAVVK GROUP aims to "achieve resource equality and improve human life". Starting from global logistics, the group transformed into an AI technology platform enterprise after Basil Wallaby joined, with businesses covering AI, brain-computer interface, nuclear power, biomedicine and global security.',
        stats: [
            { label: '创立年份', value: '2007' },
            { label: '全球分部', value: '32' },
            { label: '在编员工', value: '12,000+' },
            { label: '研发项目', value: '47' }
        ],
        tech: [
            { name: 'Relink 脑机', desc: '罗米修斯博士主导的脑机接口项目，可修复受损脑细胞、重建运动与认知功能，被称为"人类未来的钥匙"' },
            { name: 'AI 技术平台', desc: '集团核心业务之一，覆盖智能决策、数据处理与全球信息网络' },
            { name: '核能电力', desc: '核电招聘部面向全球招募反应堆运维、辐射防护、核安全监管等专业人才' },
            { name: '全球安保', desc: 'PMC 军事承包商体系，维护集团资产、在途物资与全球分部的安全' }
        ]
    },

    // 公示公告 / 动态（贴合游戏设定）
    news: {
        top: [
            { title: 'Relink Alpha 原型机公布会于巴别塔举行', date: '09-18', tag: '研发' },
            { title: '德穆兰总监完成 Relink 二期康复训练，视觉与发声功能显著恢复', date: '09-16', tag: '行动' },
            { title: '哈夫克全球分部扩张计划启动，5 处候选新址进入评估', date: '09-12', tag: '规划' },
            { title: '核电招聘部启动 2026 秋季全球招聘', date: '09-08', tag: '招聘' }
        ],
        rnd: [
            { title: '脑机α原型机通过 III 期临床实验，视觉重建成功率 97.6%', date: '09-15', tag: '研发' },
            { title: 'Relink 2.0 面向普通人群开放预申请通道', date: '09-10', tag: '研发' },
            { title: '神经信号双向交互模块完成升级，误触率降低 42%', date: '09-05', tag: '研发' },
            { title: '跨模态感知拓展可行性验证通过', date: '08-28', tag: '研发' }
        ],
        hire: [
            { title: '反应堆运行工程师：5 名，要求 5 年以上核电运行经验', date: '09-08', tag: '招聘' },
            { title: '辐射防护专员：3 名，需持有相关资质认证', date: '09-08', tag: '招聘' },
            { title: '核安全分析师：2 名，熟悉国际核安全标准', date: '09-08', tag: '招聘' },
            { title: '设备检修技师：8 名，具备大型设备检修经验', date: '09-08', tag: '招聘' }
        ],
        security: [
            { title: '关于加强全球分部安保等级的通知（一级响应）', date: '09-17', tag: '安全' },
            { title: '警惕以 Relink 名义进行的诈骗与非法交易活动', date: '09-11', tag: '安全' },
            { title: '内部情报网络月度安全审计完成，无异常', date: '09-03', tag: '安全' }
        ]
    },

    // 档案分析（参考官网/论坛/B站剧情解析整理的深度内容）
    analysis: {
        timeline: [
            { y: '1993', t: '雅各布·哈夫克亲历索马里黑鹰坠落事件，目睹战友惨死与资源分配不均带来的战争，埋下"以绝对权力实现资源平等"的种子；其父母创立的人道主义组织 E.R.I 在救援中遭袭遇难。' },
            { y: '2001', t: '雅各布两年内拿下计算机与工程双博士学位，创立物流公司，以全球物流起家。' },
            { y: '2007', t: '巴希尔·瓦拉比以 CTO 身份加入，集团主营业务从物流软件转型为 AI 技术平台研发，哈夫克逐步成长为全球市值第一的超级财团。' },
            { y: '2018', t: '五常组建全球应急行动组织 G.T.I，表面维和、实为制衡哈夫克扩张并介入阿萨拉局势。' },
            { y: '2029', t: '哈夫克投资罗米修斯博士与佐娅·庞琴科娃主导的脑机研发项目；二人因理念不合分道扬镳，佐娅加入 G.T.I。' },
            { y: '2035', t: 'Relink 脑机在巴别塔召开全球发布会；G.T.I 启动"巴别塔行动"抓捕罗米修斯并夺取原型机，阿萨拉卫队发动恐怖袭击，爆炸重伤德穆兰，哈夫克为其植入 Relink 保住性命。' }
        ],
        people: [
            { name: '雅各布·哈夫克', role: '创始人 · 最高领袖', desc: '亲历黑鹰坠落后坚信强权才能带来秩序，以"全球资源平等、改善人类生活"为终极愿景，掌控哈夫克的绝对权力。', icon: 'img/folder_icon1.png' },
            { name: '罗米修斯博士', role: 'Relink 首席科学家', desc: '脑机项目灵魂人物，称 Relink 为"人类未来的钥匙"，为推进技术不惜进行人体实验。', icon: 'img/folder_icon2.png' },
            { name: '德穆兰', role: '全球安全总监', desc: '前欧洲航天局最年轻女宇航员，巴别塔爆炸后植入 Relink 保住性命，成为哈夫克安保体系的铁腕指挥官，誓死效忠集团。', icon: 'img/folder_icon3.png' },
            { name: '巴希尔·瓦拉比', role: '集团 CTO', desc: '2007 年加入，推动哈夫克从物流软件转型 AI 技术平台，是集团科技路线的奠基人。', icon: 'img/folder_icon1.png' },
            { name: '佐娅·庞琴科娃', role: '前脑机研究员 · G.T.I', desc: 'Relink 早期联合开发者，因理念分歧离开哈夫克加入 G.T.I，2035 年带队执行巴别塔行动。', icon: 'img/folder_icon2.png' },
            { name: '赛伊德', role: '阿萨拉反抗力量领袖', desc: '视哈夫克为破坏阿萨拉生存环境的入侵者，带领当地武装力量持续反抗，矛盾无法调和。', icon: 'img/folder_icon3.png' }
        ],
        tech: [
            { name: 'Relink 脑机接口', status: '试验验证中', desc: '集团核心黑科技：通过神经信号双向交互修复受损脑细胞、重建运动与认知功能，副作用依赖哈夫克特效药维持，是集团控制体系的关键一环。' },
            { name: '曼德尔砖', status: '量产部署', desc: '代号"超强大脑"的信息处理单元，可破译关键情报；量产型曼德尔砖成为 G.T.I 与军阀势力争夺的目标。' },
            { name: '天王卫星', status: '在轨运行', desc: '代号"天神之眼"的卫星网络，与曼德尔砖结合后可实现全球信息掌控。' }
        ],
        factions: [
            { name: '哈夫克集团', desc: '以科技与强权重塑世界秩序的超级财团，掌控 AI、脑机、核能与安保体系。' },
            { name: 'G.T.I', desc: '五常组建的全球应急行动组织，表面维和，实则制衡哈夫克并介入阿萨拉资源争夺。' },
            { name: '阿萨拉卫队', desc: '北非虚构国家阿萨拉的反抗武装，为夺回国家控制权与哈夫克持续对抗。' },
            { name: '军阀势力', desc: '以雷斯、哈姆克为代表的地方军阀，与各方交易、劫掠曼德尔砖，搅动局势。' }
        ]
    },

    // 档案分类导航分组
    navGroup: {
        action: ['f1', 'f2'],
        rnd: ['f4', 'f5'],
        hr: ['f3', 'f6']
    },

    // 加密文档的密钥（doc_id -> password）
    docPassword: {
        'd3': '',
        'd7': '',
        'd13': ''
    }
};
