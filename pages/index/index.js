const util = require('../../utils/util.js')
const user = require('../../utils/user.js')
const app = getApp()
Page({
    data: {
        auth: false,
        location: {},
        banner: [],
        categories: [],
        headlines: [],
        discount: [],
        list: [],
        page: 0,
        onAsync: false
    },
    onLoad: function() {
        let that = this

        // 获取地理位置
        wx.getLocation({
            success(res) {
                that.setData({
                    auth: true,
                    'location.latitude': res.latitude,
                    'location.longitude': res.longitude,
                })
                user.gpsToAddress(res.longitude, res.latitude, function(res) {
                    that.setData({
                        'localtion.address': res.result.formatted_addresses.recommend
                    })
                    app.globalData.location = that.data.location
                    that.loadData()
                })
            }
        })

        // 获取banner
        util.wxRequest("Index/getBanners", {}, res => {
            res.code == 200 && that.setData({ banner: res.data })
        })

        // 获取行业分类
        util.wxRequest("Index/getCategories", {}, res => {
            res.code == 200 && that.setData({ categories: res.data })
        })
    },

    // 触底加载
    onReachBottom: function() {
        this.loadData()
    },

    // 加载列表
    loadData: function() {
        let that = this

        if (that.data.onAsync) { return false } else { that.setData({ onAsync: true }) }

        wx.showLoading()
        setTimeout(function() { wx.hideLoading() }, 3000)

        let param = {
            page: that.data.page + 1,
            longitude: that.data.location.longitude,
            latitude: that.data.location.latitude,
        }


        util.wxRequest("Shop/getShops", param,
            res => {
                let temp = that.data.list.concat(res.data.data)

                that.setData({ page: res.data.current_page, list: temp })

            },
            () => {},
            () => {
                that.setData({ onAsync: false })
                wx.hideLoading()
            }
        )
    }
})