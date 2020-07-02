const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
const app = getApp()
Page({
    data: {
        info: [],
    },

    onLoad: function (e) {
        let that = this

        // 获取商品详情
        util.wxRequest("Good/getGood", {id: e.id}, res => {
            res.code == 200 && that.setData({info: res.data});
        })
    },

    // 加入购物车

    // 分享
    onShareAppMessage: function () {
        let that = this;
        return {
            title: that.data.info.short,
            path: 'pages/index/good/index?id=' + that.data.id, // 路径，传递参数到指定页面。
            imageUrl: that.data.info.images[0], // 分享的封面图
            success: function (res) {
                wx.showToast({
                    title: '转发成功',
                })
            },
            fail: function (res) {
                wx.showToast({
                    title: '转发失败',
                    icon: "none"
                })
            }
        }
    },
})