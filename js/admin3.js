let isEn = false;

$(function () {
    // ==================== 全局变量 ====================
    let loginUser = '';
    let loginPass = '';
    let currentFolderId = '';
    let currentFolderPassword = '';
    let currentDocId = '';
    let currentDocPassword = '';
    let passwordTarget = '';      // 'folder' | 'doc'
    let passwordTargetId = '';
    let passwordTargetName = '';

    // ==================== 离线数据访问层 ====================
    // 原站由后端 dfx-back.7jing.com 提供数据；离线版本改为读取
    // 本地 OFFLINE_DATA（见 offline-data.js），保证断网可用。
    function getLocalizedText(name) {
        const mapZhToEn = {
            '人员伤亡事故调查': 'Personnel Injury Incident Investigation',
            '哈夫克分部选址报告': 'Haavk Branch Site Selection Report',
            '核电招聘部': 'Nuclear Power Recruitment Dept',
            '脑机α原型机': 'Neural Device α Prototype',
            '草稿': 'Draft',
            '推荐给你': 'Recommended for You'
        };
        const mapEnToZh = {
            'Personnel Injury Incident Investigation': '人员伤亡事故调查',
            'Haavk Branch Site Selection Report': '哈夫克分部选址报告',
            'Nuclear Power Recruitment Dept': '核电招聘部',
            'Neural Device α Prototype': '脑机α原型机',
            'Draft': '草稿',
            'Recommended for You': '推荐给你'
        };
        if (isEn) {
            return mapZhToEn[name] || name;
        }
        return mapEnToZh[name] || name;
    }

    // ==================== 初始化 ====================
    $('#adminOverlay').show();
    $('#folderOverlay').hide();
    $('#passwordOverlay').hide();

    // ==================== 工具函数 ====================

    function showPage(page) {
        if (page === 'login') {
            $('#adminOverlay').show();
            $('#folderOverlay').hide();
            $('#portalPage').hide();
        } else if (page === 'portal') {
            $('#adminOverlay').hide();
            $('#folderOverlay').hide();
            $('#portalPage').show();
        } else {
            $('#adminOverlay').hide();
            $('#portalPage').hide();
            $('#folderOverlay').show();
            $('#folder-content').toggle(page === 'folder');
            $('#doc-list').toggle(page === 'doc_list');
            $('#doc-detail').toggle(page === 'doc_detail');
        }
    }

    function showPasswordError() {
        $('#passwordOverlay .login-error').show();
        $('#password1').prop('disabled', true);
        $('.password-btn-lock').css('pointer-events', 'none');
        var countDown = 5;
        var tips = '⚠ <span class="pwd-err">密码错误，' + countDown + '秒后可重新输入</span>'
        if(isEn){
            tips = '⚠ <span class="pwd-err">Password error, you can retry in ' + countDown + ' seconds</span>';
        }
        $('#passwordOverlay .login-error').html(tips);
        var timer = setInterval(function () {
            countDown--;
            if (countDown > 0) {
                var tips = '⚠ <span class="pwd-err">密码错误，' + countDown + '秒后可重新输入</span>';
                if(isEn){
                    tips = '⚠ <span class="pwd-err">Password error, you can retry in ' + countDown + ' seconds</span>';
                }
                $('#passwordOverlay .login-error').html(tips);
            } else {
                clearInterval(timer);
                $('#passwordOverlay .login-error').hide();
                $('#password1').prop('disabled', false);
                $('#password1').val('');
                $('.password-btn-lock').css('pointer-events', 'auto');
            }
        }, 1000);
    }

    function handleAuthError(res) {
        console.log(res)
        if (res.code === 403) {
            if(isEn){
                alert('Unauthorized. Please log in again.');
            }else{
                alert('未授权，请重新登录');
            }
            showPage('login');
        }
    }

    // ==================== 数据加载（离线版） ====================

    // 登录校验：管理员账号 42847 / time0926
    function checkLogin(username, password, callback) {
        var ok = (username === '42847' && password === 'time0926') || (username === 'admin' && password === 'admin');
        callback({ code: ok ? 0 : -1, msg: ok ? '' : '用户名或密码错误' });
    }

    function loadFolders() {
        var res = { code: 0, data: OFFLINE_DATA.folders || [] };
        if (res.code === 0) {
            renderFolders(res.data);
        } else {
            handleAuthError(res);
        }
    }

    function loadDocuments(folderId) {
        currentFolderId = folderId;
        // 查找文件夹信息
        var folder = null;
        (OFFLINE_DATA.folders || []).forEach(function (f) {
            if (String(f.id) === String(folderId)) folder = f;
        });

        // 加密文件夹：校验当前输入的 folder_password
        if (folder && folder.locked && folder.password && currentFolderPassword !== folder.password) {
            currentFolderPassword = '';
            showPasswordError();
            return;
        }

        var docs = (OFFLINE_DATA.documents || {})[String(folderId)] || [];
        var res = { code: 0, data: docs };
        if (res.code === 0) {
            var folderName = getLocalizedText(folder ? folder.name : '') || '';
            $('#doc-list-title').text(folderName);
            renderDocuments(res.data);
            showPage('doc_list');
            $('#passwordOverlay').hide();
            $('#password1').val('');
            $('#passwordOverlay .login-error').hide();
        } else {
            handleAuthError(res);
        }
    }

    function loadDocumentDetail(docId) {
        currentDocId = docId;
        var detail = (OFFLINE_DATA.details || {})[String(docId)];
        var res = detail ? { code: 0, data: detail } : { code: 404, data: null };
        if (res.code === 0 && res.data) {
            $('#doc-detail-title').text(res.data.title);
            $('#doc-detail-content').html(res.data.content);
            showPage('doc_detail');
        } else {
            handleAuthError(res);
        }
    }

    function verifyDocumentPassword(docId, password, callback) {
        var docPassword = (OFFLINE_DATA.docPassword || {})[String(docId)];
        var ok = !docPassword || password === docPassword;
        var doc = null;
        (OFFLINE_DATA.documents || {}).forEach ? null : null;
        // 查找文档信息（用于返回图片 src）
        Object.keys(OFFLINE_DATA.documents || {}).forEach(function (fid) {
            (OFFLINE_DATA.documents[fid] || []).forEach(function (d) {
                if (String(d.id) === String(docId)) doc = d;
            });
        });
        var data = (ok && doc && doc.type === 'image') ? doc.src : '';
        callback({ code: ok ? 0 : 403, data: data });
    }

    // ==================== 渲染 ====================
    function renderFolders(list) {
        var html = '';
        list.forEach(function (item) {
            var lockedNow = item.locked && item.password;
            var lockedClass = lockedNow ? 'folder-suo' : '';
            var tips = '<p class="suo-txt1"><i></i><span>加密·需要访问密钥</span></p><p class="suo-txt2"><i></i><span>ENCRYPTED</span></p>'
            if(isEn){
                tips = '<p class="suo-txt1"><i></i><span>Encrypted·Access key required</span></p><p class="suo-txt2"><i></i><span>ENCRYPTED</span></p>'
            }
            var lockedContent = lockedNow ? tips : '';
            html += '<a href="javascript:;" data-folder="' + item.id + '" data-name="' + item.name + '" data-locked="' + (lockedNow ? '1' : '0') + '" data-password="' + (item.password || '') + '" data-maxlength="' + (item.maxlength || '') + '" class="' + lockedClass + '">' +
                '<img src="' + item.icon + '" alt="">' +
                '<p class="folder-name">' + item.name + '</p>' +
                lockedContent +
                '</a>';
        });
        $('#folder-ct').html(html);
    }

    function renderDocuments(list) {
        var html = '';
        list.forEach(function (item) {
            var docClass = (item.locked && item.password) ? 'doc-suo' : (item.type === 'image' ? 'doc-pic' : '');
            var docContent = '';
            if (item.type === 'image') {
                if (item.locked && item.password) {
                    docContent = '<i></i><p class="doc-name">' + item.name + '</p>';
                } else {
                    docContent = '<img src="' + item.src + '" alt=""><p class="doc-name">' + item.name + '</p>';
                }
            } else {
                docContent = '<i></i><p class="doc-name">' + item.name + '</p>';
            }
            html += '<a href="javascript:;" data-doc="' + item.id + '" data-name="' + item.name + '" data-locked="' + ((item.locked && item.password) ? '1' : '0') + '" data-password="' + (item.password || '') + '" data-maxlength="' + (item.maxlength || '') + '" data-type="' + (item.type || '') + '" data-src="' + (item.src || '') + '" class="' + docClass + '">' + docContent + '</a>';
        });
        $('#doc-list-content').html(html);
    }

    // ==================== 事件绑定 ====================
    // 回车登录（用户名/密码框按 Enter 直接登录）
    $('#username, #password').off('keydown').on('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            $('#login').trigger('click');
        }
    });
    // 登录
    $('#login').off('click').on('click', function () {
        var username = $('#username').val();
        var password = $('#password').val();
        checkLogin(username, password, function (res) {
            if (res.code === 0) {
                loginUser = username;
                loginPass = password;
                currentFolderId = '';
                currentDocId = '';
                showPage('portal');
                renderPortal();
            } else {
                var tips = '用户名或密码错误，请重新输入'
                if(isEn){
                    tips = 'Username or password is incorrect, please try again'
                }
                $('.admin-login-err').text(tips)
                $('#adminOverlay .login-error').show();
                $('#login').css('pointer-events', 'none');
                setTimeout(function () {
                    $('#adminOverlay .login-error').hide();
                    $('#login').css('pointer-events', 'auto');
                }, 5000);
            }
        });
    });

    function reloadData() {
        console.log('Reloading currentDocId...',currentDocId);
        console.log('Reloading currentFolderId...',currentFolderId);
        $('#passwordOverlay .login-error').hide();
        $('#adminOverlay .login-error').hide();

        if (currentDocId) {
            // 当前在文档详情页
            loadDocumentDetail(currentDocId);
        } else if (currentFolderId) {
            // 当前在文档列表页
            loadDocuments(currentFolderId);
        } else if (loginUser) {
            // 已登录：门户可见则重渲染门户，否则在文件夹列表页
            if ($('#portalPage').is(':visible')) {
                renderPortal();
            } else {
                loadFolders();
            }
        }
    }

    // 退出
    $('.folder-logout, .portal-logout').click(function () {
        loginUser = '';
        loginPass = '';
        currentFolderId = '';
        currentDocId = '';
        $('#username').val('');
        $('#password').val('');
        showPage('login');
    });

    // 目录页返回档案中心
    $('#folderBack').click(function () {
        currentFolderId = '';
        currentDocId = '';
        currentFolderPassword = '';
        currentDocPassword = '';
        showPage('portal');
        renderPortal();
    });

    // 点击目录
    $(document).on('click', '#folder-ct a', function () {
        var folderId = $(this).data('folder');
        var folderName = getLocalizedText($(this).data('name'));
        var isLocked = String($(this).data('locked')) === '1';
        var maxlength = $(this).data('maxlength') || 6;

        if (isLocked) {
            passwordTarget = 'folder';
            passwordTargetId = folderId;
            passwordTargetName = folderName;
            $('#pass-title').text(folderName);
//          $('#password1').attr('maxlength', maxlength);
            $('#passwordOverlay').show();
        } else {
            currentFolderPassword = '';
            loadDocuments(folderId);
        }
    });

    // 点击文档
    $(document).on('click', '#doc-list-content a', function () {
        var docId = $(this).data('doc');
        var docName = getLocalizedText($(this).data('name'));
        var isLocked = String($(this).data('locked')) === '1';
        var maxlength = $(this).data('maxlength') || 6;
        var docType = $(this).data('type') || '';

        if (isLocked) {
            passwordTarget = 'doc';
            passwordTargetId = docId;
            passwordTargetName = docName;
            $('#pass-title').text(docName);
//          $('#password1').attr('maxlength', maxlength);
            $('#passwordOverlay').show();
        } else if (docType === 'image') {
            var src = $(this).find('img').attr('src');
            if (src) {
                $('#doc-picbox img').attr('src', src);
                var pureSrc = src.split('?')[0].split('#')[0];
                var suffix = pureSrc.split('.').pop();
                $('#doc-picbox .pic-name span').text(getLocalizedText(docName) + '.' + suffix);
                $('#doc-picbox').show();
            }
        } else {
            currentDocPassword = '';
            loadDocumentDetail(docId);
        }
    });

    // 列表页返回
    $('#doc-list-back').click(function () {
        showPage('folder');
        currentFolderId = '';
        currentFolderPassword = '';

        currentDocId = '';
        currentDocPassword = '';
        loadFolders(); // 重新加载文件夹列表，按当前 isEn 取最新语言
    });

    // 详情页返回
    $('#doc-detail-back').click(function () {
        showPage('doc_list');
        currentDocId = '';
        currentDocPassword = '';

        if (currentFolderId) {
            loadDocuments(currentFolderId);
        }
    });

    // 密码弹窗解锁
    $('.password-btn-lock').off('click').on('click', function () {
        var password1 = $('#password1').val();
        if(isEmpty(password1)){
            return;
        }
        if (passwordTarget === 'folder') {
            currentFolderPassword = password1;
            loadDocuments(passwordTargetId);
        } else if (passwordTarget === 'doc') {
            verifyDocumentPassword(passwordTargetId, password1, function (res) {
                if (res.code === 0) {
                    $('#passwordOverlay').hide();
                    $('#password1').val('');
                    $('#passwordOverlay .login-error').hide();
                    
                    var $doc = $('#doc-list-content a[data-doc="' + passwordTargetId + '"]');
                    var docType = $doc.data('type') || '';
                    
                    if (docType === 'image') {
                        var src = res.data;
                        if (src) {
                            $('#doc-picbox img').attr('src', src);
                            var pureSrc = src.split('?')[0].split('#')[0];
                            var suffix = pureSrc.split('.').pop();
                            $('#doc-picbox .pic-name span').text(getLocalizedText($doc.data('name')) + '.' + suffix);
                            $('#doc-picbox').show();
                        }
                    } else {
                        currentDocPassword = password1;
                        loadDocumentDetail(passwordTargetId);
                    }
                } else {
                    showPasswordError();
                }
            });
        }
    });

    // 密码弹窗取消
    $('.password-btn-cancel').off('click').on('click', function () {
        $('#passwordOverlay').hide();
        $('#password1').val('');
        $('#passwordOverlay .login-error').hide();
        passwordTarget = '';
        passwordTargetId = '';
    });

    // 图片弹窗关闭
    $('#doc-picbox .doc-close').click(function () {
        $('#doc-picbox').hide();
    });

    // 图片下载
    $('#doc-picbox .btn-down').click(async function () {
        var src = $('#doc-picbox img').attr('src');
        if (!src) return;
        try {
            var res = await fetch(src, { mode: 'cors' });
            var blob = await res.blob();
            var blobUrl = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = blobUrl;
            a.download = $('#doc-picbox .pic-name span').text() || '';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            // 离线 file:// 下 fetch 可能受限，降级为直接打开
            var a = document.createElement('a');
            a.href = src;
            a.download = $('#doc-picbox .pic-name span').text() || '';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });

    // ==================== 门户渲染（教务门户式） ====================
    function getTxt(zh, en) { return isEn ? en : zh; }

    // 响应式兜底：按视口宽度强制网格列数（防止缓存/异常视口导致排版错乱）
    function applyResponsiveGrid() {
        var w = window.innerWidth || document.documentElement.clientWidth;
        var grids = document.querySelectorAll('.arch-grid, .people-grid, .tech-grid, .faction-grid, .ov-stats');
        var cols = w < 720 ? 1 : (w < 900 ? 2 : 3);
        for (var i = 0; i < grids.length; i++) {
            if (grids[i].className.indexOf('mini-grid') >= 0) {
                grids[i].style.gridTemplateColumns = w < 720 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)';
            } else if (grids[i].className.indexOf('ov-stats') >= 0) {
                grids[i].style.gridTemplateColumns = w < 600 ? 'repeat(1, 1fr)' : (w < 900 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)');
            } else if (grids[i].className.indexOf('faction-grid') >= 0) {
                grids[i].style.gridTemplateColumns = w < 1080 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)';
            } else {
                grids[i].style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
            }
        }
        var colsWrap = document.querySelector('.portal-grid');
        if (colsWrap) {
            var l = document.querySelector('.col-l'), m = document.querySelector('.col-m'), r = document.querySelector('.col-r');
            if (w < 900) {
                colsWrap.style.flexDirection = 'column';
                [l, m, r].forEach(function (x) { if (x) { x.style.width = '100%'; } });
            } else {
                colsWrap.style.flexDirection = 'row';
                if (l && m && r) {
                    l.style.width = '42%';
                    if (m) { m.style.width = ''; }
                    r.style.width = '30%';
                } else if (l && r) {
                    l.style.width = '48%';
                    r.style.width = '';
                }
            }
        }
    }
    window.addEventListener('resize', function () { applyResponsiveGrid(); });
    window.addEventListener('load', function () { applyResponsiveGrid(); });

    function renderPortal() {
        $('#portalName').text(getTxt('哈夫克集团 · 档案中心', 'HAVVK GROUP · ARCHIVE CENTER'));
        $('#portalNameEn').text(getTxt('HAVVK GROUP · ARCHIVE CENTER', 'INFORMATION FOR YOU, UNLIMITED'));
        var navs = [
            { k: 'archive', zh: '档案中心', en: 'ARCHIVE' },
            { k: 'overview', zh: '集团概况', en: 'OVERVIEW' },
            { k: 'analysis', zh: '档案分析', en: 'ANALYSIS' },
            { k: 'action', zh: '行动档案', en: 'OPERATIONS' },
            { k: 'rnd', zh: '研发档案', en: 'R&D' },
            { k: 'hr', zh: '人事档案', en: 'PERSONNEL' },
            { k: 'news', zh: '公示公告', en: 'NOTICE' }
        ];
        $('#portalNav').html(navs.map(function (n) {
            return '<a href="javascript:;" data-sec="' + n.k + '"><span>' + (isEn ? n.en : n.zh) + '</span></a>';
        }).join(''));
        renderSection('archive');
        $('#portalNav a').off('click').on('click', function () {
            renderSection($(this).data('sec'));
            $('#portalNav a').removeClass('on');
            $(this).addClass('on');
        });
    }

    function renderSection(sec) {
        if (sec === 'archive') { renderArchiveHome(); }
        else if (sec === 'overview') { renderOverview(); }
        else if (sec === 'action') { renderGroupFolders('action', '行动档案', 'OPERATIONS ARCHIVE'); }
        else if (sec === 'rnd') { renderGroupFolders('rnd', '研发档案', 'R&D ARCHIVE'); }
        else if (sec === 'hr') { renderGroupFolders('hr', '人事档案', 'PERSONNEL ARCHIVE'); }
        else if (sec === 'analysis') { renderAnalysis(); }
        else if (sec === 'news') { renderNews(); }
        else { renderArchiveHome(); }
    }

    function archCardHtml(f) {
        var cnt = ((OFFLINE_DATA.documents || {})[f.id] || []).length;
        var ico = '<div class="arch-ico"><img src="' + f.icon + '" alt=""></div>';
        return '<a href="javascript:;" class="arch-card" data-folder="' + f.id + '">' +
            ico +
            '<div class="arch-info"><div class="arch-name">' + getLocalizedText(f.name) + '</div>' +
            '<div class="arch-desc">' + getTxt(f.desc || '', '') + '</div>' +
            '<div class="arch-meta">' + getTxt(cnt + ' 份档案 · 更新 ', cnt + ' docs · ') + (f.update || '') + '</div></div>' +
            '<div class="arch-go">→</div></a>';
    }

                    function renderArchiveHome() {
        var nw = OFFLINE_DATA.news || {};
        var a = OFFLINE_DATA.analysis || {};
        var totalDocs = 0, lockedDocs = 0, imageDocs = 0;
        Object.keys(OFFLINE_DATA.documents || {}).forEach(function (k) {
            (OFFLINE_DATA.documents[k] || []).forEach(function (d) {
                totalDocs++;
                if (d.locked) lockedDocs++;
                if (d.type === 'image') imageDocs++;
            });
        });
        var recent = (OFFLINE_DATA.folders || []).slice().sort(function (a2, b2) { return (b2.update || '').localeCompare(a2.update || ''); }).slice(0, 4);
        var groups = Object.keys((OFFLINE_DATA.navGroup || {})).length;
        var latest = (OFFLINE_DATA.folders || []).map(function (f) { return f.update || ''; }).sort().pop() || '';
        var html = '';
        // 顶部大图
        html += '<div class="portal-banner"><img src="img/n_pic2.png" alt=""><div class="banner-mask"></div><div class="banner-text"><h2>' + getTxt('信息予你无限', 'INFORMATION FOR YOU, UNLIMITED') + '</h2><p>' + getTxt('哈夫克集团 · 档案中心', 'HAVVK GROUP · ARCHIVE CENTER') + '</p></div></div>';
        // 档案分类整排
        html += '<div class="block-title" style="margin-top:24px;">' + getTxt('档案分类', 'ARCHIVE CATEGORIES') + '<a href="javascript:;" class="more" data-more="archive">' + getTxt('MORE', 'MORE') + ' →</a></div><div class="arch-grid">';
        (OFFLINE_DATA.folders || []).forEach(function (f) { html += archCardHtml(f); });
        html += '</div>';
        // 两栏（均衡配比：左=要闻+招聘+检索+统计；右=研发+安全+最近）
        html += '<div class="portal-grid" style="margin-top:26px;">';
        html += '<div class="portal-col col-l"><div class="block-title">' + getTxt('集团要闻', 'GROUP NEWS') + '<a href="javascript:;" class="more" data-more="news">' + getTxt('MORE', 'MORE') + ' →</a></div>';
        (nw.top || []).slice(0, 4).forEach(function (n) {
            html += '<div class="news-item"><span class="news-tag">' + getTxt(n.tag, n.tag) + '</span><a class="news-title">' + n.title + '</a><span class="news-date">' + n.date + '</span></div>';
        });
        html += '<div class="block-title" style="margin-top:20px;">' + getTxt('招聘公示', 'RECRUITMENT') + '</div>';
        (nw.hire || []).slice(0, 3).forEach(function (n) {
            html += '<div class="news-item"><span class="news-tag">' + getTxt('招聘', 'HIRE') + '</span><a class="news-title">' + n.title + '</a><span class="news-date">' + n.date + '</span></div>';
        });
        html += '<div class="block-title" style="margin-top:20px;">' + getTxt('档案检索', 'ARCHIVE SEARCH') + '</div><div class="search-box"><input id="archiveSearch" type="text" placeholder="' + getTxt('输入档案名称 / 关键词', 'Search name / keyword') + '"><a href="javascript:;" class="search-clear" id="searchClear">×</a></div><div class="search-hint" id="searchHint" style="display:none;">' + getTxt('未找到匹配档案', 'No match found') + '</div>';
        html += '<div class="block-title" style="margin-top:20px;">' + getTxt('档案统计', 'ARCHIVE STATS') + '</div><div class="stat-mini">' +
            '<div class="stat-mini-card"><b>' + totalDocs + '</b><span>' + getTxt('档案文档', 'DOCS') + '</span></div>' +
            '<div class="stat-mini-card"><b>' + (OFFLINE_DATA.folders || []).length + '</b><span>' + getTxt('档案分类', 'FOLDERS') + '</span></div>' +
            '<div class="stat-mini-card"><b>' + groups + '</b><span>' + getTxt('档案分组', 'GROUPS') + '</span></div>' +
            '<div class="stat-mini-card"><b>' + latest + '</b><span>' + getTxt('最近更新', 'UPDATED') + '</span></div>' +
            '<div class="stat-mini-card"><b>' + lockedDocs + '</b><span>' + getTxt('加密档案', 'LOCKED') + '</span></div>' +
            '<div class="stat-mini-card"><b>' + imageDocs + '</b><span>' + getTxt('图片档案', 'IMAGES') + '</span></div></div>';
        html += '</div>';
        html += '<div class="portal-col col-r"><div class="block-title">' + getTxt('研发动态', 'R&D UPDATES') + '<a href="javascript:;" class="more" data-more="news">' + getTxt('MORE', 'MORE') + ' →</a></div>';
        (nw.rnd || []).slice(0, 4).forEach(function (n) {
            html += '<div class="news-item"><span class="news-tag">' + getTxt('研发', 'R&D') + '</span><a class="news-title">' + n.title + '</a><span class="news-date">' + n.date + '</span></div>';
        });
        html += '<div class="block-title" style="margin-top:20px;">' + getTxt('安全公告', 'SECURITY') + '</div>';
        (nw.security || []).slice(0, 3).forEach(function (n) {
            html += '<div class="news-item"><span class="news-tag">' + getTxt('安全', 'SAFETY') + '</span><a class="news-title">' + n.title + '</a><span class="news-date">' + n.date + '</span></div>';
        });
        html += '<div class="block-title" style="margin-top:20px;">' + getTxt('最近更新', 'RECENT UPDATES') + '</div><div class="recent-list">';
        recent.forEach(function (f) {
            html += '<a href="javascript:;" class="recent-item" data-folder="' + f.id + '"><img src="' + f.icon + '" alt=""><span class="recent-name">' + getLocalizedText(f.name) + '</span><em class="recent-date">' + (f.update || '') + '</em></a>';
        });
        html += '</div></div></div>';
        // 核心科技整排
        html += '<div class="block-title" style="margin-top:26px;">' + getTxt('核心科技', 'KEY TECHNOLOGIES') + '<a href="javascript:;" class="more" data-more="analysis">' + getTxt('MORE', 'MORE') + ' →</a></div><div class="arch-grid">';
        (a.tech || []).forEach(function (t) {
            html += '<div class="tech-card"><h4>' + getTxt(t.name, t.name) + (t.status ? '<span class="tech-tag">' + getTxt(t.status, t.status) + '</span>' : '') + '</h4><p>' + getTxt(t.desc, t.desc) + '</p></div>';
        });
        html += '</div>';
        $('#portalBody').html(html);
        bindPortalClicks();
        applyResponsiveGrid();
        bindArchiveSearch();
    }

function bindArchiveSearch() {
        var folders = OFFLINE_DATA.folders || [];
        var $inp = $('#archiveSearch');
        if (!$inp.length) return;
        $inp.off('input').on('input', function () {
            var kw = ($(this).val() || '').trim().toLowerCase();
            var cards = [].slice.call(document.querySelectorAll('.mini-grid .arch-card'));
            var hit = 0;
            cards.forEach(function (card) {
                var fid = card.getAttribute('data-folder');
                var f = folders.filter(function (x) { return x.id === fid; })[0];
                if (!f) { card.style.display = 'none'; return; }
                var txt = ((f.name || '') + ' ' + (f.desc || '')).toLowerCase();
                var show = !kw || txt.indexOf(kw) >= 0;
                card.style.display = show ? '' : 'none';
                if (show) hit++;
            });
            $('#searchHint').css('display', hit === 0 && kw ? 'block' : 'none');
        });
        $('#searchClear').off('click').on('click', function () {
            $inp.val('');
            $inp.trigger('input');
            $inp.focus();
        });
    }

    function initCarousel() {
        var $c = $('#carousel');
        if (!$c.length) return;
        var slides = $c.find('.carousel-slide');
        var total = slides.length;
        var idx = 0;
        function go(i) {
            idx = (i + total) % total;
            slides.removeClass('on');
            slides.eq(idx).addClass('on');
            $c.find('.carousel-dot').removeClass('on');
            $c.find('.carousel-dot').eq(idx).addClass('on');
        }
        $c.find('.carousel-dot').off('click').on('click', function () { go($(this).index()); });
        var timer = setInterval(function () { go(idx + 1); }, 4500);
        $c.on('mouseenter', function () { clearInterval(timer); });
        $c.on('mouseleave', function () { timer = setInterval(function () { go(idx + 1); }, 4500); });
        go(0);
    }

    function renderOverview() {
        var g = OFFLINE_DATA.groupInfo || {};
        var html = '';
        html += '<div class="portal-banner banner-sm"><img src="img/n_pic1.png" alt=""><div class="banner-mask"></div><div class="banner-text"><h2>' + getTxt('集团概况', 'GROUP OVERVIEW') + '</h2><p>' + getTxt(g.slogan, g.sloganEn) + '</p></div></div>';
        html += '<div class="ov-wrap"><div class="ov-intro"><h3>' + getTxt(g.name, g.nameEn) + '</h3><p>' + getTxt(g.intro, g.introEn) + '</p></div>';
        html += '<div class="ov-stats">';
        (g.stats || []).forEach(function (s) {
            html += '<div class="ov-stat"><div class="ov-value">' + s.value + '</div><div class="ov-label">' + getTxt(s.label, s.label) + '</div></div>';
        });
        html += '</div><h3 class="ov-sub">' + getTxt('核心业务', 'CORE BUSINESS') + '</h3><div class="ov-tech">';
        (g.tech || []).forEach(function (t) {
            html += '<div class="tech-card"><h4>' + getTxt(t.name, t.name) + '</h4><p>' + getTxt(t.desc, t.desc) + '</p></div>';
        });
        html += '</div></div>';
        $('#portalBody').html(html);
    }

    function renderGroupFolders(groupKey, zh, en) {
        var ids = (OFFLINE_DATA.navGroup || {})[groupKey] || [];
        var html = '<div class="block-title">' + getTxt(zh, en) + '</div><div class="arch-grid arch-grid-lg">';
        ids.forEach(function (id) {
            var f = (OFFLINE_DATA.folders || []).find(function (x) { return x.id === id; });
            if (f) html += archCardHtml(f);
        });
        html += '</div>';
        $('#portalBody').html(html);
        bindPortalClicks();
        applyResponsiveGrid();
    }

    function renderAnalysis() {
        var a = OFFLINE_DATA.analysis || {};
        var items = [
            { id: 'tl', icon: 'img/folder_icon1.png', zh: '集团大事记', en: 'TIMELINE', desc: getTxt('1993 黑鹰坠落 → 2007 转型 → 2035 巴别塔行动', '1993 BLACK HAWK DOWN → 2007 PIVOT → 2035 BABEL') },
            { id: 'pp', icon: 'img/folder_icon2.png', zh: '关键人物档案', en: 'KEY PERSONNEL', desc: getTxt('雅各布 / 罗米修斯 / 德穆兰 / 瓦拉比 / 佐娅 / 赛伊德', 'JACOB / ROMIUS / DEMULAN / WALABI / ZOYA / SAEED') },
            { id: 'tc', icon: 'img/folder_icon3.png', zh: '核心科技档案', en: 'KEY TECHNOLOGIES', desc: getTxt('Relink 脑机 / 曼德尔砖 / 天王卫星', 'RELINK / MANDELBRICK / TIANWANG SAT') },
            { id: 'fc', icon: 'img/folder_icon1.png', zh: '势力格局', en: 'POWER MAP', desc: getTxt('哈夫克 / G.T.I / 阿萨拉 / 军阀', 'HAVVK / G.T.I / ASALA / WARLORDS') }
        ];
        var html = '<div class="ana-grid">';
        items.forEach(function (it) {
            html += '<a href="javascript:;" class="ana-card" data-an="' + it.id + '">' +
                '<img src="' + it.icon + '" alt="">' +
                '<p class="ana-name">' + getTxt(it.zh, it.en) + '</p>' +
                '<p class="ana-desc">' + it.desc + '</p></a>';
        });
        html += '</div><div class="ana-detail" id="anaDetail"></div>';
        $('#portalBody').html(html);
        renderAnaDetail('tl');
        $('.ana-card').on('click', function () {
            $('.ana-card').removeClass('on');
            $(this).addClass('on');
            renderAnaDetail($(this).attr('data-an'));
        });
    }

    function renderAnaDetail(id) {
        var a = OFFLINE_DATA.analysis || {};
        var html = '';
        if (id === 'tl') {
            html += '<div class="tl-wrap">';
            (a.timeline || []).forEach(function (t) {
                html += '<div class="tl-item"><div class="tl-year">' + t.y + '</div><div class="tl-dot"></div><div class="tl-text">' + getTxt(t.t, t.t) + '</div></div>';
            });
            html += '</div>';
        } else if (id === 'pp') {
            html += '<div class="people-grid">';
            (a.people || []).forEach(function (p) {
                html += '<div class="person-card"><div class="person-ico"><img src="' + p.icon + '" alt=""></div><div class="person-info"><div class="person-name">' + getTxt(p.name, p.name) + ' <span class="person-role">' + getTxt(p.role, p.role) + '</span></div><div class="person-desc">' + getTxt(p.desc, p.desc) + '</div></div></div>';
            });
            html += '</div>';
        } else if (id === 'tc') {
            html += '<div class="tech-grid">';
            (a.tech || []).forEach(function (t) {
                html += '<div class="tech-card"><h4>' + getTxt(t.name, t.name) + '</h4><p>' + getTxt(t.desc, t.desc) + '</p></div>';
            });
            html += '</div>';
        } else if (id === 'fc') {
            html += '<div class="faction-grid">';
            (a.factions || []).forEach(function (f) {
                html += '<div class="faction-card"><h4>' + getTxt(f.name, f.name) + '</h4><p>' + getTxt(f.desc, f.desc) + '</p></div>';
            });
            html += '</div>';
        }
        $('#anaDetail').html(html);
    }

    function renderNews() {
        var nw = OFFLINE_DATA.news || {};
        var cats = [['top', '集团要闻', 'GROUP NEWS'], ['rnd', '研发动态', 'R&D UPDATES'], ['hire', '招聘公示', 'RECRUITMENT'], ['security', '安全公告', 'SECURITY']];
        var html = '';
        cats.forEach(function (c) {
            html += '<div class="block-title">' + getTxt(c[1], c[2]) + '</div><div class="news-list">';
            (nw[c[0]] || []).forEach(function (n) {
                html += '<div class="news-item"><span class="news-tag">' + getTxt(n.tag, n.tag) + '</span><a class="news-title">' + n.title + '</a><span class="news-date">' + n.date + '</span></div>';
            });
            html += '</div>';
        });
        $('#portalBody').html(html);
    }

    function bindPortalClicks() {
        $('#portalBody a[data-folder]').off('click').on('click', function () {
            var folderId = $(this).data('folder');
            currentFolderPassword = '';
            loadDocuments(folderId);
        });
        $('#portalBody a[data-more]').off('click').on('click', function () {
            var sec = $(this).data('more');
            renderSection(sec);
            $('#portalNav a').removeClass('on');
            $('#portalNav a[data-sec="' + sec + '"]').addClass('on');
        });
    }

    function isEmpty(value) {
        // 1. 处理 null 或 undefined
        if (value == null) return true;

        // 2. 处理布尔值和数字（通常 0 和 false 不被视为空，根据业务需求可调整）
        if (typeof value === 'boolean' || typeof value === 'number') return false;

        // 3. 处理字符串（包含纯空格的情况）
        if (typeof value === 'string') return value.trim() === '';

        // 4. 处理数组
        if (Array.isArray(value)) return value.length === 0;

        // 5. 处理 Map 和 Set 集合
        if (value instanceof Map || value instanceof Set) return value.size === 0;

        // 6. 处理普通对象（排除 Date, RegExp 等特殊对象）
        if (Object.prototype.toString.call(value) === '[object Object]') {
            return Object.keys(value).length === 0;
        }

        // 其他类型（如 Function）默认不为空
        return false;
    }
    
    window.reloadData = reloadData;
});
