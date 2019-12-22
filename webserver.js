let createError = require('http-errors');
let express = require('express');
let fs = require('fs'); //用于读写文件 (node原生模块)
let path = require('path');
let logger = require('morgan');
const config = require('./config');
const httpError = require('http-errors');
let log = require('./common/log');
const jwtAuth = require('./common/jwt');
const OS = require('os');
const Cluster = require('cluster');

// let { createOraclePool, closePoolAndExit } = require('./common/oracle')

let indexRouter = require('./routes/index');

// 移动源
// let userRouter = require('./routes/move/user');
// let companyRouter = require('./routes/move/company');
// let carRouter = require('./routes/move/car');
// let rommRouter = require('./routes/move/room');
// let sourceRouter = require('./routes/move/source');
// let warehouseRouter = require('./routes/move/warehouse');
// let processRouter = require('./routes/move/process');
// let taskRouter = require('./routes/move/task');

// 固定源
let unitRouter = require('./routes/fixation/unit');
let ledgerRouter = require('./routes/fixation/ledger');
let partrolRouter = require('./routes/fixation/patrol');
let alarmRouter = require('./routes/fixation/alarm');
let userRouter = require('./routes/fixation/user');
let fblackboxRouter = require('./routes/fixation/blackbox');
let subsourceRouter = require('./routes/fixation/subsource');


let app = express();
let http = require('http');
let https = require('https');
let privateKey = fs.readFileSync(path.join(__dirname, './certificate/private.pem'), 'utf8');
let certificate = fs.readFileSync(path.join(__dirname, './certificate/file.crt'), 'utf8');
let credentials = { key: privateKey, cert: certificate };

// 启动数据库连接池
// createOraclePool();

let httpServer = http.createServer(app)
let httpsServer = https.createServer(credentials, app);

httpServer.listen(config.port, () => {
    log.info('http服务端口号 : ' + config.port);
});

//创建https服务器  
httpsServer.listen(config.sslport, () => {
    log.info('https服务端口号 : ' + config.sslport);
});


// if (Cluster.isMaster) {
//     for (let i = 0; i < OS.cpus().length; i++) Cluster.fork();
//     console.log('master', process.pid);
// } else {
//     let httpServer = http.createServer(app)
//     let httpsServer = https.createServer(credentials, app);

//     httpServer.listen(config.port, () => {
//         log.info('http服务端口号 : ' + config.port);
//     });

//     //创建https服务器  
//     httpsServer.listen(config.sslport, () => {
//         log.info('https服务端口号 : ' + config.sslport);
//     });

//     console.log('worker', process.pid);
// }


// 将所有的http请求自动重定向到https
// app.get('*', function(req, res, next) {
//     if (req.protocol != 'https') {
//         // log.info(`https://${req.headers.host.split(':')[0]}:${sslport}${req.url}`)
//         res.redirect(`https://${req.headers.host.split(':')[0]}:${sslport}${req.url}`)
//     } else
//         next() /* Continue to other routes if we're not redirecting */
// })

//使服务可被跨域请求
let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , X-Token');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200)
            //让options请求快速返回 s
    } else {
        next();
    };
}

app.use(allowCrossDomain);


app.use(logger('dev')); // 拦截http请求 打印请求日志
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 配置静态资源
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/static', express.static(path.join(__dirname, 'dist/static')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/android', express.static(path.join(__dirname, '../appserver/src')));


app.use(jwtAuth);

app.use(function(req, res, next) {
    log.info(`访问 ${req.path} 接口`);
    next();
});

app.use('/', indexRouter);

// 移动源
// app.use('/user', userRouter);
// app.use('/company', companyRouter);
// app.use('/car', carRouter);
// app.use('/room', rommRouter);
// app.use('/source', sourceRouter);
// app.use('/warehouse', warehouseRouter);
// app.use('/process', processRouter);
// app.use('/task', taskRouter);

// 固定源
app.use('/funit', unitRouter);
app.use('/fledger', ledgerRouter);
app.use('/fpartrol', partrolRouter);
app.use('/falarm', alarmRouter);
app.use('/fuser', userRouter);
app.use('/fblackbox', fblackboxRouter);
app.use('/fsubsource', subsourceRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    if (err.name === 'UnauthorizedError') {
        //这个需要根据自己的业务逻辑来处理（ 具体的err值 请看下面）
        res.status(200).json({
            code: 50014,
            data: null,
            msg: "登录凭据已过期，请重新登录..."
        })
    } else {
        res.status(err.status || 500);
        res.json({ error: err })
    }

});

// process
//     .once('SIGTERM', closePoolAndExit)
//     .once('SIGINT', closePoolAndExit);

module.exports = app;