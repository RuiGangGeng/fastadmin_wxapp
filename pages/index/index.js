const util = require('../../utils/util.js')
const user = require('../../utils/user.js')
const storage = require('../../utils/storage.js');
const app = getApp()
Page({
    data: {
        auth: false,
        has_location: false,
        location: {},
        banner: [],
        categories: [],
        headlines: [],
        discount: [],
        list: [],
        page: 0,
        onAsync: false,
        sticky: false,
        review: false
    },

    onLoad: function () {
        let that = this

        // 获取送审信息
        util.wxRequest("Index/review", {}, res => {
            this.setData({ review: res.data })
        })

        // 获取地理位置
        wx.getLocation({
            success(res) {
                that.setData({
                    auth: true,
                    'location.latitude': res.latitude,
                    'location.longitude': res.longitude,
                })
                user.gpsToAddress(res.longitude, res.latitude, function (res) {
                    that.setData({
                        'location.address': res.result.formatted_addresses.recommend,
                        has_location: true,
                    })
                    app.globalData.location = that.data.location
                    if (app.globalData.user_info) {
                        that.loadData()
                    } else {
                        app.wxLoginCallback = e => {
                            that.loadData()
                        }
                    }
                })
            }
        })

        // 获取banner
        util.wxRequest("Index/getBanners", {}, res => {
            res.code === 200 && that.setData({
                banner: res.data
            })
        })

        // 获取优惠专区
        util.wxRequest("Index/getDiscount", {}, res => {
            res.code === 200 && that.setData({
                discount: res.data
            })
        })

        // 获取头条信息
        util.wxRequest("Index/getHeadLine", {}, res => {
            res.code === 200 && that.setData({
                headlines: res.data
            })
        })

        // 获取行业分类
        util.wxRequest("Index/getCategories", {}, res => {
            res.code === 200 && that.setData({
                categories: res.data
            })
        })
    },

    onShow: function () {
        if (this.data.has_location) {
            this.setData({ list: [], page: 0 })
            this.loadData()
        }
    },

    // 是否吸顶
    bindScroll: function (e) {
        this.setData({ sticky: e.detail.isFixed })
    },

    // 商家主页
    shop: function (e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({ url: "/pages/index/shop/index?id=" + id })
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
            wx.stopPullDownRefresh()
        }
        )
    },

    // 下拉刷新
    onPullDownRefresh: function () {
        let that = this
        that.setData({
            page: 0,
            list: []
        })
        storage.removeStorage('token')
        app.wxLoginCallback = function () {
            that.onLoad()
        }
        user.wxLogin("User/wxAppLogIn")
    },

    // 分享
    onShareAppMessage: function () {
        let that = this;
        return {
            title: '京小美',
            path: 'pages/index/index',
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

    // 选择地址
    location: function () {
        let that = this
        wx.chooseLocation({
            success: function (res) {
                that.setData({
                    auth: true,
                    'location.latitude': res.latitude,
                    'location.longitude': res.longitude,
                })
                user.gpsToAddress(res.longitude, res.latitude, function (res) {
                    that.setData({
                        'location.address': res.result.formatted_addresses.recommend,
                        has_location: true,
                    })
                    app.globalData.location = that.data.location
                    that.setData({
                        list: [],
                        page: 0
                    })
                    that.loadData()
                })
            },
            fail: function (res) {
                res.errMsg === "chooseLocation:fail auth deny" && that.setData({ has_location: false })
            }
        })
    },
})