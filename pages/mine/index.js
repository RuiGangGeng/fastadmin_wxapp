const app = getApp()
const util = require('../../utils/util.js');

Page({
    data: {
        info: null,
    },

    onShow: function() {
        let that = this

        app.globalData.user_info ? that.loadUserInfo() : app.wxLoginCallback = () => that.loadUserInfo()
    },

    // 获取用户信息
    loadUserInfo: function() {
        util.wxRequest("User/getUserInfo", {}, res => { this.setData({ info: res.data }) })
    }
})