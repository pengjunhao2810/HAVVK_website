/* ============================================================
   HAWK 哈夫克集团 · 员工门户系统 附件存储模块
   文件附件持久化到 IndexedDB（localStorage 容量有限，无法存文件）
   对外提供 Promise 接口：save / get / remove
   ============================================================ */
(function (window) {
    'use strict';

    var DB_NAME = 'havvk_hr_files';
    var DB_VER = 1;
    var STORE = 'files';
    var _dbPromise = null;

    function openDB() {
        if (_dbPromise) return _dbPromise;
        _dbPromise = new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB_NAME, DB_VER);
            req.onupgradeneeded = function (e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    db.createObjectStore(STORE, { keyPath: 'id' });
                }
            };
            req.onsuccess = function (e) { resolve(e.target.result); };
            req.onerror = function (e) { reject(e.target.error); };
        });
        return _dbPromise;
    }

    // 保存附件，返回 Promise<fileId>
    function save(file) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var id = 'f_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
                var tx = db.transaction(STORE, 'readwrite');
                var store = tx.objectStore(STORE);
                store.put({
                    id: id,
                    name: file.name || '未命名文件',
                    type: file.type || '',
                    size: file.size || 0,
                    blob: file
                });
                tx.oncomplete = function () { resolve(id); };
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    // 按 id 读取附件，返回 Promise<{id,name,type,size,blob}>
    function get(id) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE, 'readonly');
                var store = tx.objectStore(STORE);
                var req = store.get(id);
                req.onsuccess = function () { resolve(req.result || null); };
                req.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    // 删除附件，返回 Promise
    function remove(id) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE, 'readwrite');
                tx.objectStore(STORE).delete(id);
                tx.oncomplete = function () { resolve(true); };
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    window.HRFiles = { save: save, get: get, remove: remove };
})(window);
