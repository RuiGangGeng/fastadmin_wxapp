const util = require('../../../../utils/util.js');
Page({
    data: {
        shop_id: false,
        list: [],
        page: 0,
        onAsync: false,
    },

    onLoad: function (e) {
        this.setData({ shop_id: e.shop_id })
    },

    onShow: function () {
        this.setData({
            list: [],
            page: 0
        })
        this.loadData()
    },

    // 删除分类
    categoryDel: function (e) {
        let that = this
        wx.showModal({
            title: '提示',
            content: '您确定要删除该分类吗？',
            success: function (res) {
                res.confirm && util.wxRequest('Category/deleteCategory', { shop_id: that.data.shop_id, id: e.currentTarget.dataset.id }, res => {
                    if (res.code === 200) {
                        wx.showToast({ title: res.msg })
                        setTimeout(function () {
                            that.setData({
                                list: [],
                                page: 0
                            })
                            that.onShow()
                        }, 1000)
                    } else {
                        wx.showModal({
                            title: '温馨提示',
                            content: res.msg,
                            showCancel: false,
                            success: function () {
                                that.setData({
                                    list: [],
                                    page: 0
                                })
                                that.onShow()
                            }
                        })
                    }
                })
            }
        });
    },

    // 编辑地址
    categoryEdit: function (e) {
        wx.navigateTo({ url: '/pages/mine/shop/categories/add?id=' + e.currentTarget.dataset.id })
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
            that.setData({ onAsync: true })
        }

        wx.showLoading()
        setTimeout(function () {
            wx.hideLoading()
        }, 3000)

        let param = {
            page: that.data.page + 1,
            shop_id: that.data.shop_id,
        }

        util.wxRequest("Category/getCategories", param,
            res => {
                let temp = that.data.list.concat(res.data.data)

                that.setData({
                    page: res.data.current_page,
                    list: temp
                })
            }, () => {
            }, () => {
                that.setData({ onAsync: false })
                wx.hideLoading()
            }
        )
    }
})