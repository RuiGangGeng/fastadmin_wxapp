const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
const app = getApp()
Page({
    data: {
        category_id: false,
        discount: false,
        location: false,
        list: [],
        page: 0,
    },

    onLoad: function (options) {
        let that = this
        that.setData({category_id: options.category_id, location: app.globalData.location})
        // 获取优惠专区
        util.wxRequest("Index/getDiscount", {category_id: options.category_id}, res => {
            res.code === 200 && that.setData({
                discount: res.data
            })
        })
        that.loadData()
    },

    // 触底加载
    onReachBottom: function () {
        this.loadData()
    },

    // 加载列表
    loadData: function () {
        let that = this

        if (that.data.onAsync) {
            return false
        } else {
            that.setData({
                onAsync: true
            })
        }

        wx.showLoading()
        setTimeout(function () {
            wx.hideLoading()
        }, 3000)

        let param = {
            page: that.data.page + 1,
            longitude: that.data.location.longitude,
            latitude: that.data.location.latitude,
            category_id: that.data.category_id,
        }

        util.wxRequest("Shop/getShops", param, res => {
                let temp = that.data.list.concat(res.data.data)

                that.setData({
                    page: res.data.current_page,
                    list: temp
                })

            }, () => {
            }, () => {
                that.setData({
                    onAsync: false
                })
                wx.hideLoading()
            }
        )
    },

    // 商家主页
    shop: function (e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({url: "/pages/index/shop/index?id=" + id})
    },
});