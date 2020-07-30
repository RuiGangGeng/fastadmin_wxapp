const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
const app = getApp()
Page({
    data: {
        info: [],
        cart: false,
    },

    onLoad: function (e) {
        let that = this

        if (app.globalData.user_info) {
            // 获取商品详情
            util.wxRequest("Good/getGood", { id: e.id }, res => {
                if (res.code === 200) {
                    // 获取购物车信息
                    let parent_res = res
                    util.wxRequest("Cart/getCarts", { shop_id: res.data.shop_id }, res => {
                        let cart = res.data
                        for (let j = 0, length = cart.length; j < length; j++) {
                            if (parent_res.data.id === cart[j].good_id) {
                                parent_res.data.count = cart[j].number
                            }
                        }
                        that.setData({ cart, info: parent_res.data });
                    })
                } else {
                    wx.showModal({
                        title: '温馨提示',
                        content: res.msg,
                        showCancel: false,
                        success(res) {
                            wx.switchTab({ url: '/pages/index/index' })
                        }
                    })
                }
            })
        } else {
            app.wxLoginCallback = function () {
                // 获取商品详情
                util.wxRequest("Good/getGood", { id: e.id }, res => {
                    if (res.code === 200) {
                        // 获取购物车信息
                        let parent_res = res
                        util.wxRequest("Cart/getCarts", { shop_id: res.data.shop_id }, res => {
                            let cart = res.data
                            for (let j = 0, length = cart.length; j < length; j++) {
                                if (parent_res.data.id === cart[j].good_id) {
                                    parent_res.data.count = cart[j].number
                                }
                            }
                            that.setData({ cart, info: parent_res.data });
                        })
                    } else {
                        wx.showModal({
                            title: '温馨提示',
                            content: res.msg,
                            showCancel: false,
                            success(res) {
                                wx.switchTab({ url: '/pages/index/index' })
                            }
                        })
                    }
                })
            }
        }
    },

    // 递增购物车商品
    inc: function (e) {
        console.log(e)
        if (e.type === 'inc') {
            let cart = this.data.cart
            let in_cart = false
            for (let i = 0, cart_length = cart.length; i < cart_length; i++) {
                cart[i].good_id === e.detail.data.id && (cart[i].number++, in_cart = true)
            }
            let cartItem = {
                good_id: e.detail.data.id,
                shop_id: e.detail.data.shop_id,
                price: e.detail.data.price,
                thumb_image: e.detail.data.thumb_image,
                name: e.detail.data.name,
                original: e.detail.data.original,
                number: 1,
                select_: '1',
            }
            !in_cart && cart.push(cartItem)
            this.setData({ cart })
        }
    },

    // 递减购物车商品
    dec: function (e) {
        console.log(e)
        if (e.type === 'dec') {
            let cart = this.data.cart
            for (let i = 0, cart_length = cart.length; i < cart_length; i++) cart[i].good_id === e.detail.data.id && cart[i].number--
            this.setData({ cart })
        }
    },

    // 商家
    shop: function () {
        wx.navigateTo({ url: '/pages/index/shop/index?id=' + this.data.info.shop_id })
    },

    // 联系商家
    phone: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.info.shop_info.phone
        })
    },

    // 分享
    onShareAppMessage: function () {
        let that = this;
        return {
            title: that.data.info.short,
            path: 'pages/index/good/index?id=' + that.data.info.id, // 路径，传递参数到指定页面。
            imageUrl: that.data.info.images[0], // 分享的封面图
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

    // 分享到朋友圈
    onShareTimeline: function () {
        let that = this;
        return {
            title: that.data.info.short,
            imageUrl: that.data.info.images[0], // 分享的封面图
        }
    }
})