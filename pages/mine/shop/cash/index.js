const app = getApp()
const util = require('../../../../utils/util.js');

Page({
    data: {
        param: {},
        list: [],
        page: 0,
        onAsync: false,
    },

    onLoad: function (options) {
        this.setData({'param.shop_id': options.shop_id})
        this.loadData()
    },

    // 触底加载
    onReachBottom: function () {
        this.loadData()
    },

    // 加载列表
    loadData: function () {
        let that = this
        if (that.data.onAsync) return false
        that.setData({onAsync: true})
        wx.showLoading()
        let param = {page: that.data.page + 1}
        Object.assign(param, that.data.param)
        util.wxRequest("Finance/getFinance", param, res => {
                let list = that.data.list.concat(res.data.data)
                that.setData({page: res.data.current_page, list})
            }, () => {
            }, () => {
                that.setData({onAsync: false})
                wx.hideLoading()
            }
        )
    }
})