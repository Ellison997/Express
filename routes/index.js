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
let demoDao = require('./mdao/demoDao');

let multer = require('multer')


/**
 * @api {GET} // 返回前端页面
 * @apiDescription  返回前端页面
 * @apiName return index.html
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.get('/', function (req, res, next) {
    res.sendFile(path.resolve(__dirname, './../dist') + '/index.html')
});

/**
 * @api {GET} /apidoc /apidoc 获取api文档
 * @apiDescription  获取api文档
 * @apiName apidoc
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.get('/apidoc', function (req, res, next) {
    log.info(`http://${req.headers.host}/dist/apidoc/index.html`)
    res.redirect(`http://${req.headers.host}/dist/apidoc/index.html`)
});


/**
 * @api {POST} /login  WEB 端人员登录
 * @apiDescription WEB 端人员登录
 * @apiName login
 * @apiParam (body参数) {String} uname 用户手机号
 * @apiParam (body参数) {String} pwd 用户密码
 * @apiSampleRequest /login
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.post('/login', async function (req, res, next) {
    let uname = req.body.uname;
    let pwd = req.body.pwd;

    let resData = {
        code: 50000,
        msg: '用户名或密码错误！',
        data: null
    }

    let users = [];

    users = await demoDao.queryUserByNameAndPhone(uname, utils.md5(pwd));

    if (users.length > 0) {
        users[0].username = users[0].username;

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
router.get('/getUserInfo', async function (req, res, next) {
    let token = utils.getRequestToken(req);
    let user = null;
    try {
        user = jwt.verify(token, secretKey);
    } catch (error) {
        log.error('getUserInfo', error)
    }

    let resJson = {
        code: 20000,
        msg: '获取人员信息',
        data: null
    }

    if (user != null) {
        resJson.data = user

    } else {
        resJson.code = 50000;
        resJson.msg = "获取人员信息失败"

    }
    res.json(resJson)

});


/**
 * 上传图片配置
 */
let imgFolder = './uploads/img'; // 临时文件夹

// 通过 filename 属性定制
let imgStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imgFolder); // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[1]);
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
let imgUpload = multer({ storage: imgStorage })


/**
 * 上传文件配置
 */
let fileFolder = './uploads/file'; // 临时文件夹

// 通过 filename 属性定制
let fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, fileFolder); // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[1]);
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
let fileUpload = multer({ storage: fileStorage })

/**
 * @api {POST} /upload    上传图片
 * @apiDescription 上传图片
 * @apiName upload
 * @apiParam (body参数) {Object} img  上传图片
 * @apiSampleRequest /upload
 * @apiGroup Index
 * @apiVersion 1.0.0
 */
router.post('/upload', imgUpload.single('img'), async function (req, res, next) {
    let file = req.file;
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
router.post('/uploadFile', fileUpload.single('file'), async function (req, res, next) {
    let file = req.file;
    res.json({
        code: 20000,
        msg: '上传文件',
        data: {
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            path: file.path
        },
    })
});

module.exports = router;