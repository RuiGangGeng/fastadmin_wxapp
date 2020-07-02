const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
const app = getApp()
Page({
    data: {
        banner: [],
        info:[]
    },

    onLoad: function (e) {
        let that = this

        // 获取商品详情
        util.wxRequest("Good/getGood", {id:e.id}, res => {
            res.code == 200 && that.setData({
                info: res.data
            })
        })
    },

    // 加入购物车

})