const login = require('./login')

async function test() {
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
}
test()