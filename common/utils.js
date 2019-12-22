const crypto = require('crypto'); //crypto模块用于加密数据 (node原生模块)
let fs = require('fs');
let log = require('./log')


// md5 加密
let md5 = (str) => { //自定义md5()方法, 参数为需要加密的字符串,返回加密后的字符串
    let suffix = '';
    let md5Obj = crypto.createHash('md5'); //使用crypto模块的md5加密签名功能
    md5Obj.update(str + suffix); //md5Obj对象的update()方法用于加密数据,它的参数即为需要加密的字段
    return md5Obj.digest('hex'); //md4Obj对象的digest()方法可以返回加密后的字符串,它的参数表示需要以什么形式返回结果,'hex'表示十六进制结果
};


// 获取当前日期与时间
let getTimeString = (chuo) => {
    let yt = new Date(chuo);
    let year = yt.getFullYear();
    let month = yt.getMonth() + 1 < 10 ? '0' + (yt.getMonth() + 1) : yt.getMonth() + 1;
    let day = yt.getDate() < 10 ? '0' + yt.getDate() : yt.getDate();
    let hours = yt.getHours() < 10 ? '0' + yt.getHours() : yt.getHours();
    let minutes = yt.getMinutes() < 10 ? '0' + yt.getMinutes() : yt.getMinutes();
    let seconds = yt.getSeconds() < 10 ? '0' + yt.getSeconds() : yt.getSeconds();
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};



let dateFormat = (dateObj, string) => { //格式化日期
    let json_inf = {
        'y+': dateObj.getFullYear(),
        'M+': dateObj.getMonth() + 1 > 9 ? dateObj.getMonth() + 1 : '0' + (dateObj.getMonth() + 1),
        'd+': dateObj.getDate() > 9 ? dateObj.getDate() : '0' + dateObj.getDate(),
        'h+': dateObj.getHours() > 9 ? dateObj.getHours() : '0' + dateObj.getHours(),
        'm+': dateObj.getMinutes() > 9 ? dateObj.getMinutes() : '0' + dateObj.getMinutes(),
        's+': dateObj.getSeconds() > 9 ? dateObj.getSeconds() : '0' + dateObj.getSeconds(),
        'q+': Math.floor((dateObj.getMonth() + 3) / 3),
        'w+': dateObj.getDay(),
        'S+': function() {
            if (dateObj.getMilliseconds() < 10) {
                return '00' + dateObj.getMilliseconds();
            } else if (dateObj.getMilliseconds() > 9 && dateObj.getMilliseconds() < 100) {
                return '0' + dateObj.getMilliseconds();
            } else {
                return dateObj.getMilliseconds();
            }
        }
    };
    for (let key in json_inf) {
        let re = new RegExp(key);
        if (re.test(string)) {
            string = string.replace(re, (json_inf[key]));
        }
    }
    return string;
};

// 返回请求中的token
let getRequestToken = req => {
    // let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFmZklkIjoiZmYzZDhkOTktZDQ3Zi0xMWU5LTllODAtMDAxNjNlMDEwMDU5Iiwic3RhZmZQaG9uZSI6IjEyMzQ1Njc4OTEwIiwic3RhZmZOYW1lIjoi546L6JCNIiwic3RhZmZSb2xlcyI6IltcIkxhYm9yYXRvcnlBbmFseXNpc1wiLFwiRmllbGRNb25pdG9yaW5nXCIsXCJTYW1wbGVBZG1pblwiXSIsImlhdCI6MTU2ODI1MjQ4OSwiZXhwIjoxNTcwODQ0NDg5fQ.emI9Iohe61ibgE_leCabsjjiHoaReY8QfjjOUrt0BpU';
    log.info('authorization=====>', req.headers.authorization)
    if (req.headers.hasOwnProperty('authorization')) {
        token = req.headers.authorization.split(' ')[1];
    } else {
        token = req.query.token
    }
    return token;
}


// 将数组中的'' 空字符串转为null
let nullStrToNull = arr => {
    return arr.map(i => (i === '' ? null : i))
}


// 创建文件夹
let createFolder = function(folder) {
    try {
        fs.accessSync(folder);
    } catch (e) {
        fs.mkdirSync(folder);
    }
};

//移动文件
let rename = function(path, toPath) {
    return new Promise((resolve, reject) => {
        fs.rename(path, toPath, function(err) {
            reject(err)
        })
    })

}


module.exports = {
    md5,
    getTimeString,
    dateFormat,
    getRequestToken,
    nullStrToNull,
    createFolder,
    rename
}