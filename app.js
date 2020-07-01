const util = require('/utils/util.js');
const user = require('/utils/user.js');
App({
    onLaunch: function () {
        user.wxLogin("User/wxAppLogIn")
    },

    // 全局参数
    globalData: {
        debug: true,
        token: false,
        storage_time: 2592000,
        user_info: false,
        user_auth: false,
        location: null,
        api_host: 'http://www.jd.com/api/'
    }

})