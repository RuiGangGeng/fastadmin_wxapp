const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
const app = getApp()
Page({
    data: {
        info: [],
    },

    onLoad: function () {
        let that = this

        // 获取优惠专区
        util.wxRequest("Index/help", {}, res => {
            res.code === 200 && that.setData({
                info: res.data
            })
        })
    },
})