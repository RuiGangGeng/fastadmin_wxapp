const util = require('/utils/util.js');
const user = require('/utils/user.js');
App({
    onLaunch: function () {
        user.wxLogin("User/wxAppLogIn")
    },

    // 全局参数
    globalData: {
        debug: true,
        // api_host: 'http://www.jd.com/api/'
        api_host: 'https://mini-jd.7758521.work/api/',
        token: false,
        storage_time: 2592000,
        user_info: false,
        user_auth: false,
        location: null,
        status_bar_height: wx.getSystemInfoSync()['statusBarHeight'],
        pixel_ratio: wx.getSystemInfoSync()['pixelRatio'],
    }

})
// {
//     "pagePath": "pages/active/index",
//     "iconPath": "images/tab/index.png",
//     "selectedIconPath": "images/tab/index_select.png",
//     "text": "活动"
// },