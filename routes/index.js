/**
 * 登录 获取用户信息   退出登录等程序全局操作
 */

var express = require('express');
var router = express.Router();
let log = require('./../common/log');
const { secretKey } = require('./../common/constant');
const utils = require('./../common/utils');
let path = require('path');
const jwt = require("jsonwebtoken");
// let userDao = require('./dao/userDao');
let fixUnitDao = require('./fdao/unitDao');


let multer = require('multer')


/**
 * @api {GET} / / 返回前端页面
 * @apiDescription  返回前端页面
 * @apiName return index.html
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.get('/', function(req, res, next) {
    res.sendFile(path.resolve(__dirname, './../dist') + '/index.html')
});

/**
 * @api {GET} /apidoc /apidoc 获取api文档
 * @apiDescription  获取api文档
 * @apiName apidoc
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.get('/apidoc', function(req, res, next) {
    log.info(`http://${req.headers.host}/dist/apidoc/index.html`)
    res.redirect(`http://${req.headers.host}/dist/apidoc/index.html`)
});




/**
 * @api {POST} /login  WEB 端人员登录（暂时兼容）
 * @apiDescription WEB 端人员登录  （暂时兼容）
 * @apiName login
 * @apiParam (body参数) {Number} utype  用户类型   1. 管理员  2. 企业
 * @apiParam (body参数) {Number} usourType  类型（因为要查不同的数据库）  1. 移动  2.固定
 * @apiParam (body参数) {String} uname 用户手机号
 * @apiParam (body参数) {String} pwd 用户密码
 * @apiSampleRequest /login
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.post('/login', async function(req, res, next) {
    let uname = req.body.uname;
    let pwd = req.body.pwd;
    let utype = req.body.utype;
    let usourType = req.body.usourType;

    let resData = {
        code: 50000,
        msg: '用户名或密码错误！',
        data: null
    }

    let users = [];

    if (usourType == 1) {
        // users = await userDao.queryStaffByUNameAndPwd(uname, pwd);
    } else {
        users = await fixUnitDao.queryUserByNameAndPhone(uname, utils.md5(pwd));
    }
    if (users.length > 0) {
        users[0].username = (users[0].usertype == 1 ? users[0].username : users[0].unitname);

        let tokenObj = JSON.parse(JSON.stringify(users[0]));
        let token = jwt.sign(tokenObj,
            secretKey, {
                expiresIn: 60 * 60 * 2 * 24 // 授权时效两天
            }
        );
        resData.code = 20000;
        resData.msg = '登录成功！';
        resData.data = {
            token
        }
    }

    res.json(resData);

});


/**
 * @api {GET} /getUserInfo   获取登录的人员信息
 * @apiDescription 获取登录的人员信息
 * @apiName getUserInfo
 * @apiParam {String} token 访问令牌
 * @apiSampleRequest /getUserInfo
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.get('/getUserInfo', async function(req, res, next) {
    let token = utils.getRequestToken(req);
    let user = null;
    try {
        user = jwt.verify(token, secretKey);
    } catch (error) {
        log.error('getUserInfo', error)
    }


    if (user != null) {
        res.json({
            code: 20000,
            msg: '获取人员信息',
            data: user
        })
    } else {
        res.json({
            code: 50000,
            msg: '获取人员信息失败',
            data: null
        })
    }

});



let uploadFolder = './uploads/'; // 临时文件夹

// 通过 filename 属性定制
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadFolder); // 保存的路径，备注：需要自己创建
    },
    filename: function(req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[1]);
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
let upload = multer({ storage: storage })

/**
 * @api {POST} /upload    上传图片
 * @apiDescription 上传图片
 * @apiName upload
 * @apiParam (body参数) {Object} img  上传图片
 * @apiSampleRequest /upload
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.post('/upload', upload.single('img'), async function(req, res, next) {
    let file = req.file;
    await utils.createFolder(uploadFolder);
    res.json({
        code: 20000,
        msg: '上传图片',
        data: {
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            path: file.path
        },
    })
});


/**
 * @api {POST} /uploadFile    上传文件
 * @apiDescription 上传文件
 * @apiName uploadFile
 * @apiParam (body参数) {Object} file  上传图片
 * @apiSampleRequest /upload
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.post('/uploadFile', upload.single('file'), async function(req, res, next) {
    let file = req.file;
    await utils.createFolder(uploadFolder);
    res.json({
        code: 20000,
        msg: '上传图片',
        data: {
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            path: file.path
        },
    })
});

module.exports = router;