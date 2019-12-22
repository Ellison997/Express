let express = require('express');
let router = express.Router();
let utils = require('../../common/utils')
let log = require('../../common/log')
let multer = require('multer')
let userDao = require('../fdao/userDao')

/**
 * @api {GET} /fuser/list    获取列表
 * @apiDescription 获取列表
 * @apiName userList
 * @apiParam (query参数) {Number} limit 一页几条数据
 * @apiParam (query参数) {Number} page 第几页
 * @apiParam (query参数) {String} realname 姓名
 * @apiParam (query参数) {String} phone 手机号码
 * @apiSampleRequest /user/list
 * @apiGroup User
 * @apiVersion 1.0.0
 */
router.get('/list', async function(req, res, next) {
    let pageSize = req.query.limit;
    let pageIndex = req.query.page;
    let realname = req.query.realname;
    let phone = req.query.phone;

    // 台账列表
    let dbres = await userDao.queryUserList(pageSize * (pageIndex - 1), Number(pageSize), realname, phone)
    if (dbres.data != null) {
        res.json({
            code: 20000,
            msg: '获取列表成功',
            data: dbres.data,
            count: dbres.count
        })
    } else {
        res.json({
            code: 50000,
            msg: '获取列表失败',
            data: null,
            count: 0
        })
    }

});



/**
 * @api {POST} /fledger/add   添加
 * @apiDescription 添加
 * @apiName addfledger
 * @apiParam (body参数) {String} Ledgername 名称
 * @apiParam (body参数) {Number} Ledgertype 类型
 * @apiParam (body参数) {String} Ledgeraddress 地址
 * @apiParam (body参数) {String} Ledgercontact   联系人
 * @apiParam (body参数) {String} Ledgerphone  联系人电话
 * @apiParam (body参数) {Number} username 名
 * @apiParam (body参数) {String} password    密码
 * @apiParam (body参数) {String} photoUrl   照片
 * @apiSampleRequest /fledger/addfledger
 * @apiGroup （fix）Ledger
 * @apiVersion 1.0.0
 */
router.post('/addfledger', async function(req, res, next) {
    let Ledger = req.body;
    let dbres = await ledgerDao.insertLedger(Ledger)
    if (dbres != null) {
        res.json({
            code: 20000,
            msg: '添加成功',
            data: dbres
        })
    } else {
        res.json({
            code: 50000,
            msg: '添加失败',
            data: null
        })
    }

});


/**
 * @api {PUT} /fuser/updateEpa   修改
 * @apiDescription 修改
 * @apiName updateEpa
 * @apiParam (body参数) {String} id  ID
 * @apiParam (body参数) {String} realname  真实姓名
 * @apiParam (body参数) {String} username 名
 * @apiParam (body参数) {String} phone   手机号
 * @apiParam (body参数) {String} password  密码
 * @apiSampleRequest /fuser/updateEpa
 * @apiGroup （fix）User
 * @apiVersion 1.0.0
 */
router.put('/updateEpa', async function(req, res, next) {
    let fuser = req.body;

    let dbres = await userDao.updateEPALogin(fuser)
    if (dbres != null && dbres.changedRows != 0) {
        res.json({
            code: 20000,
            msg: '修改成功',
            data: dbres
        })
    } else {
        res.json({
            code: 50000,
            msg: '修改失败',
            data: null
        })
    }
});

module.exports = router;