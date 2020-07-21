const QR = require('../../../utils/weapp-qrcode.js')
Page({
    data: {
        code: "",
        user_id: false
    },
    onLoad: function (e) {
        this.setData({user_id: e.user_id})
        let imgData = QR.drawImg(getApp().globalData.api_host + 'shop/extension?user_id=' + e.user_id, {
            typeNumber: 4,
            errorCorrectLevel: 'M',
            size: 500
        })
        this.setData({
            code: imgData
        })
    },

    // 分享
    onShareAppMessage: function () {
        let that = this;
        return {
            title: '欢迎入驻京小美',
            path: 'pages/mine/shop/add?q=%3D' + that.data.user_id, // 路径，传递参数到指定页面。
            // imageUrl: that.data.shop_info.logo_image,  分享的封面图
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
});