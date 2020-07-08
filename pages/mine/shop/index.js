const util = require('../../../utils/util.js');
Page({
    data: {
        id: null,
        info: null,
    },

    onLoad: function(options) {
        let that = this
        // 获取商家ID
        that.setData({ id: options.id })

        // 获取商家基本信息
        util.wxRequest("Shop/getShop", { id: options.id }, res => {
            res.code === 200 ? that.setData({ info: res.data }) : ''
        })
    }
})