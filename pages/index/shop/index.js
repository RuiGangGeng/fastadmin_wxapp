const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
const app = getApp()
Page({
    data: {
        shop_id: false,
        shop_info: false,
        categories: [],
        select: 0,
        list: [],
        page: 0,
        onAsync: false,
        complete: false,
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
                that.setData({categories: res.data.data, select: res.data.data[0].id})
                that.loadData()
            }
        })
    },

    // 切换分类
    categoryClick: function (e) {
        this.setData({
            list: [],
            page: 0,
            select: e.currentTarget.dataset.id
        })
        this.loadData()
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

        let param = {
            shop_id: that.data.shop_id,
            shop_category_id: that.data.select
        }

        util.wxRequest("Good/getGoods", {page: that.data.page + 1, where: JSON.stringify(param)},
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
                    onAsync: false,
                    complete: true
                })
            }
        )
    }
});
