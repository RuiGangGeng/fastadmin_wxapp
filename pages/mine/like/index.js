const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
const app = getApp()
Page({
    data: {
        list: [],
        page: 0,
        onAsync: false,
    },

    onLoad: function () {
        this.loadData()
    },

    // 商家主页
    shop: function (e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({url: "/pages/index/shop/index?id=" + id})
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

        let param = {
            page: that.data.page + 1,
            longitude: app.globalData.location.longitude,
            latitude: app.globalData.location.latitude,
        }

        util.wxRequest("Shop/getShopsByLike", param, res => {
                let temp = that.data.list.concat(res.data.data)
                that.setData({
                    page: res.data.current_page,
                    list: temp
                })

            }, () => {
            }, () => {
                that.setData({onAsync: false})
                wx.hideLoading()
            }
        )
    }
})