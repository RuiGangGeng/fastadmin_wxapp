const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
const app = getApp()
Page({
    data: {
        bar_height: false,

        shop_id: false,
        shop_info: false,
        like: false,

        categories: false,
        select: 0,

        list: [],
        page: 0,
        total: 0,

        cart: false,

        onAsync: false,
        complete: false,
        flag: false,
    },

    onLoad: function (e) {
        let that = this
        that.setData({ shop_id: e.id, bar_height: app.globalData.status_bar_height })
        if (app.wxLoginCallback) {
            // 获取该商家的信息
            util.wxRequest("Shop/getShop", { id: e.id }, res => {
                res.code === 200 && that.setData({ shop_info: res.data })
            })
            util.wxRequest("Index/like_", { shop_id: e.id }, res => {
                res.code === 200 && that.setData({ like: true })
            })
        } else {
            app.wxLoginCallback = function () {
                // 获取该商家的信息
                util.wxRequest("Shop/getShop", { id: e.id }, res => {
                    res.code === 200 && that.setData({ shop_info: res.data })
                })
                util.wxRequest("Index/like_", { shop_id: e.id }, res => {
                    res.code === 200 && that.setData({ like: true })
                })
                that.setData({ flag: true })
                that.onShow()
            }
        }
    },

    // 页面显示刷新 购物车与商品的对应关系
    onShow: function () {
        if (app.wxLoginCallback && this.data.flag) {
            // 获取该商家的分类
            this.data.categories === false && util.wxRequest("Category/getCategories", { shop_id: this.data.shop_id, list_rows: 1000 }, res => {
                if (res.code === 200) {
                    this.setData({ categories: res.data.data, select: res.data.data[0].id })
                    this.loadData()
                }
            })

            this.data.categories !== false && function (that) {
                that.setData({
                    list: [],
                    page: 0,
                })
                that.loadData()
            }(this)
        }

    },

    // 返回上一页
    back: function () {
        wx.navigateBack({
            complete(res) {
                if (res.errMsg !== 'navigateBack:ok') {
                    wx.switchTab({url: '/pages/index/index'})
                }
            }
        })
    },

    // 收藏
    like: function () {
        let that = this
        let like = this.data.like
        util.wxRequest("Index/like", { shop_id: that.data.shop_id }, res => {
            if (res.code === 200) {
                wx.showToast({ title: like ? "取消成功" : '收藏成功' })
                that.setData({ like: !like })
            }
        })
    },

    // 联系商家
    phone: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.shop_info.phone
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

        that.data.complete && wx.showLoading()
        setTimeout(function () {
            wx.hideLoading()
        }, 3000)

        let param = {
            shop_id: that.data.shop_id,
            shop_category_id: that.data.select,
            status: 1
        }

        util.wxRequest("Good/getGoods", { page: that.data.page + 1, where: JSON.stringify(param) }, res => {
            let temp = that.data.list.concat(res.data.data)
            that.setData({
                page: res.data.current_page,
                total: res.data.total,
                onAsync: false,
                complete: true
            })
            this.loadCart(temp)
        })
    },

    // 分享
    onShareAppMessage: function () {
        let that = this;
        return {
            title: that.data.shop_info.short,
            path: 'pages/index/shop/index?id=' + that.data.shop_id, // 路径，传递参数到指定页面。
            imageUrl: that.data.shop_info.logo_image, // 分享的封面图
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

    // 获取购物车
    loadCart: function (list) {
        util.wxRequest("Cart/getCarts", { shop_id: this.data.shop_id }, res => {
            res = res.data
            for (let i = 0, length_cart = res.length; i < length_cart; i++) {
                for (let j = 0, length = list.length; j < length; j++) {
                    list[j].id === res[i].good_id && (list[j].count = res[i].number, res[i].stock = list[j].stock)
                }
            }
            this.setData({ list, cart: res })
            wx.hideLoading()
        })
    },

    // 递增购物车商品
    inc: function (e) {
        console.log(e)
        let cart = this.data.cart
        let list = this.data.list
        let in_cart = false
        for (let i = 0, cart_length = cart.length; i < cart_length; i++) {
            if (e.detail.type) {
                cart[i].good_id === e.detail.data.good_id && (cart[i].number++, in_cart = true)
            } else {
                cart[i].good_id === e.detail.data.id && (cart[i].number++, in_cart = true)
            }
        }
        let cartItem = {
            good_id: e.detail.data.id,
            shop_id: e.detail.data.shop_id,
            price: e.detail.data.price,
            thumb_image: e.detail.data.thumb_image,
            name: e.detail.data.name,
            original: e.detail.data.original,
            number: 1,
            stock: e.detail.data.stock,
            select_: '1',
        }
        !in_cart && cart.push(cartItem)

        for (let i = 0, cart_length = cart.length; i < cart_length; i++) {
            for (let j = 0, length = list.length; j < length; j++) {
                list[j].id === cart[i].good_id && (list[j].count = cart[i].number)
            }
        }

        this.setData({ list, cart })
    },

    // 递减购物车商品
    dec: function (e) {
        let cart = this.data.cart
        let list = this.data.list
        for (let i = 0, cart_length = cart.length; i < cart_length; i++) {
            if (e.detail.type) {
                cart[i].good_id === e.detail.data.good_id && cart[i].number--
            } else {
                cart[i].good_id === e.detail.data.id && cart[i].number--
            }
            for (let j = 0, length = list.length; j < length; j++) {
                list[j].id === cart[i].good_id && (list[j].count = cart[i].number)
            }
        }
        this.setData({ list, cart })
    },

    // 清空购物车商品
    clear: function () {
        let that = this
        util.wxRequest("Cart/clearCart", { shop_id: this.data.shop_id }, res => {
            wx.showModal({
                title: '温馨提示',
                content: res.msg,
                showCancel: false,
                success() {
                    that.onShow()
                }
            })
        })
    }
});
