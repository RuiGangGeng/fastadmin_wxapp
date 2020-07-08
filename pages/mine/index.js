const app = getApp()
const util = require('../../utils/util.js');

Page({
    data: {
        info: null,
    },

    onShow: function() {
        let that = this

        // 获取用户信息 [在获取之前需要先进行微信登录]
        app.globalData.user_info ? that.loadUserInfo() : app.wxLoginCallback = () => that.loadUserInfo()
    },

    // 加载数据
    loadUserInfo: function() {
        util.wxRequest("User/getUserInfo", {}, res => { this.setData({ info: res.data }) })
    }
})