# login

## description

get ad\token\device_id in file: .login

## dependency

```shell
npm pnpm i
```

## usage

```shell
node login.js
```

or

```shell
npm run login
```

## logout:

```shell
npm run logout
```

or delete .login file

# 用函数调用

```node

const login = require('./login')
console.log('start')
const f = await login.asyncLogin();
if (!f) {
    console.log('login failed')
    return
}
if (f) {
    console.log('login success')
}
const {ad, token, device_id} = await login.adToken();
console.log(ad, token, device_id)
{
    await login.logout()
    let {ad, token, device_id} = await login.adToken();
    console.log(ad, token, device_id)
}
```

# 调用时传参定义用户环境

```node

const login = require('./login')
console.log('start')
const f = await login.asyncLogin('https://test.***.com');
if (!f) {
    console.log('login failed')
    return
}

```
