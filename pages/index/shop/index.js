const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
const app = getApp()
Page({
    data: {
        shop_id: false,
        shop_info: false,
        categories: [],
        activeTab: 0,
        list: [],
        page: 0,
        onAsync: false,
    },

    onLoad: function (e) {
        let that = this

        that.setData({shop_id: e.id})

        // 获取该商家的信息
        util.wxRequest("Shop/getShop", {id: e.id}, res => {
            res.code == 200 && that.setData({shop_info: res.data})
        })

        // 获取该商家的分类
        util.wxRequest("Category/getCategories", {shop_id: e.id, list_rows: 100}, res => {
            if (res.code == 200) {
                let categories = []
                for (let i of res.data.data) categories.push({title: i.name, id: i.id})
                that.setData({categories})
                that.loadData()
            }
        })
    },


    // 点击分类
    onTabCLick(e) {
        const index = e.detail.index
        console.log('tabClick', e)
    },

    // 变化
    onChange(e) {
        const index = e.detail.index
        console.log('change', e)
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
            shop_id:that.data.shop_id,
            shop_category_id:that.data.categories[that.data.activeTab].id
        }


        util.wxRequest("Good/getGoods", param,
            res => {
                let temp = that.data.list.concat(res.data.data)

                that.setData({
                    page: res.data.current_page,
                    list: temp
                })

            },
            () => {
            },
            () => {
                that.setData({
                    onAsync: false
                })
                wx.hideLoading()
            }
        )
    }
});
