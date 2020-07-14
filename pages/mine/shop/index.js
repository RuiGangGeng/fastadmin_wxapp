const util = require('../../../utils/util.js');
Page({
    data: {
        shop_id: null,
        info: null,
    },

    onLoad: function (options) {
        let that = this
        // 获取商家ID
        that.setData({shop_id: options.shop_id})

        // 获取商家基本信息
        util.wxRequest("Shop/getShop", {id: options.shop_id}, res => {
            res.code === 200 ? that.setData({info: res.data}) : ''
        })
    }
})