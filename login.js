const readline = require('readline-sync');
let {updateHost}= require('./request');
readline.setDefaultOptions({
    // print: function (display, encoding) {
    //   console.log('encoding:',encoding);
    //   process.stdout.write(display, 'utf8')
    // }, // Remove ctrl-chars.
    encoding: 'utf8',
    prompt: '>==> ',
});
const { sendCaptcha, captchaLogin, passwordLogin } = require('./request');

const phoneRegex = /^1\d{10}$/;
const captchaRegex = /^\d{6}$/;
const emailRegex = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

let status = 0

async function main(p) {
    // console.log(process.argv);
    // if (!process.argv[1].split('\\').includes('login.js')) {
    //     if (!p) {
    //         console.log('login.js is not the main module, pass login process')
    //         return;
    //     }
    // }
    status = 1
    const lang = readline.keyInSelect(['english', 'chinese'], 'select language');
    const en = lang === 0;
    const login_method = en
        ? ['short message(SMS) login', 'password login']
        : ['短信验证码登陆', '密码登陆'];
    main: while (true) {
        try {
            const index = readline.keyInSelect(
                login_method,
                en ? 'select login method:' : '请选择登陆方式:',
            );
            switch (index) {
                case -1:
                    status = -1
                    break main;
                case 0:
                    const phone = readline.question(en ? 'input phone number:' : '请输入手机号：');
                    if (phoneRegex.test(phone)) {
                        await sendCaptcha(phone);
                        while (true) {
                            const captcha = readline.question(
                                en ? 'input SMS verification code: ' : '请输入验证码：',
                            );
                            if (captchaRegex.test(captcha)) {
                                try {
                                    await captchaLogin(phone, captcha);
                                    status = 0
                                    break main;
                                } catch (e) {
                                    console.error(`[ERROR] ${e.message}\n`);
                                }
                            } else {
                                console.error(en ? '[ERROR] wrong SMS code\n' : '[ERROR] 错误的验证码\n');
                            }
                        }
                    } else {
                        console.error(en ? '[ERROR] wrong phone number\n' : '[ERROR] 错误的手机号\n');
                    }
                    break;
                case 1:
                    const userName = readline.question(
                        en ? 'input account: (phone or nickname)' : '请输入帐号：',
                    );
                    if (!emailRegex.test(userName) && !phoneRegex.test(userName)) {
                        console.error(en ? '[ERROR] wrong account\n' : '[ERROR] 帐号错误\n');
                        break;
                    }
                    const password = readline.question(en ? 'input password: ' : '请输入密码：', {
                        hideEchoBack: true,
                    });
                    await passwordLogin(userName, password);
                    status = 0
                    break main;
                default:
                    console.error(en ? '[ERROR] wrong login method\n' : '[ERROR] 请选择正确的登陆方式\n');
            }
        } catch (e) {
            console.error(`[ERROR] ${e.message}\n`);
            status = -1
        }
    }
}

//如果结束是status不是0状态，那么就是登录被用户终止（终止前可多次试错）
async function asyncLogin(host) {
    if (host) {
        if(typeof host === 'string' && host.startsWith('http')) {
            updateHost(host)
        }else {
            throw new Error('host must be a string and start with http(s)')
        }
    }
    await main(1)
    if (status === 0) {
        return true
    } else {
        status = 0
        return false
    }
}

const fs = require('fs');
const env = require('./env');

/**
 * 从本地文件中读取ad, token, device_id
 * @return {Promise<{ad: any, device_id: any, token: any}>}
 */
async function adToken() {
    if (!fs.existsSync(env.LOGIN_FILE)) {
        return { ad: '', token: '', device_id: '' }
    }
    const { ad, token, device_id } = JSON.parse(fs.readFileSync(env.LOGIN_FILE, 'utf8'));
    return { ad, token, device_id }
}

function getAdTokenSync() {
    if (!fs.existsSync(env.LOGIN_FILE)) {
        return { ad: '', token: '', device_id: '' }
    }
    const { ad, token, device_id } = JSON.parse(fs.readFileSync(env.LOGIN_FILE, 'utf8'));
    return { ad, token, device_id }
}

exports.main = main;
exports.asyncLogin = asyncLogin;
exports.adToken = adToken;
exports.getAdTokenSync = getAdTokenSync;
exports.logout = function () {
    //delete file .login
    if (fs.existsSync(env.LOGIN_FILE))
        fs.unlinkSync(env.LOGIN_FILE)
}
