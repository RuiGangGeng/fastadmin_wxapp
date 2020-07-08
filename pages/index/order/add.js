const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
const storage = require('../../../utils/storage.js');
const app = getApp()
Page({
    data: {
        list: false,
        address: false,
        param: {},
        onAsync: false,
        total_price: false,
        total: false,
    },

    onLoad: function (options) {
        this.setData({'param.shop_id': options.shop_id})
    },

    onShow: function () {
        // 获取购物车信息
        util.wxRequest("Cart/getCarts", {shop_id: this.data.param.shop_id}, res => {
            let total_price = 0
            let total = 0
            for (let i of res.data) (total += i.number, total_price += i.price * i.number)
            total_price = total_price.toFixed(2)
            this.setData({list: res.data, total, total_price})
        })

        // 获取收货地址
        let id = storage.getStorage('generateOrder_address_id');
        if (id) {
            storage.removeStorage('generateOrder_address_id')
            util.wxRequest("Address/getAddress", {id: id}, res => {
                res.code === 200 && this.setData({address: res.data, 'param.address_id': res.data.id})
            })
            this.setData({onAsync: false})
        } else {
            util.wxRequest("Address/getDefaultAddress", {}, res => {
                res.code === 200 && this.setData({address: res.data, 'param.address_id': res.data.id})
            })
        }
    },

    // 字段输入
    bindInput: function (e) {
        let field = e.currentTarget.dataset.field
        let param = this.data.param;
        param[field] = e.detail.value
        this.setData({param})
    },

    // 下单支付
    formSubmit: function () {
        let that = this
        if(!that.data.address){
            wx.showModal({
                title: '温馨提示',
                content: '您还没有收货地址，点击确定添加地址',
                showCancel: false,
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({url: '/pages/mine/address/add'})
                    }
                }
            })
            return false
        }
        that.setData({onAsync: true})
        //调用订单创建接口
        util.wxRequest('Pay/pay', that.data.param, res => {
            if (res.code === 200) {
                // 发起支付
                wx.requestPayment({
                    timeStamp: res.data.package.timeStamp,
                    nonceStr: res.data.package.nonceStr,
                    package: res.data.package.package,
                    signType: res.data.package.signType,
                    paySign: res.data.package.sign,
                    complete() {
                        wx.showLoading({title: '查询订单状态', mask: true})
                        util.wxRequest('Pay/queryPayResult', {order_id: res.data.out_trade_no}, res => {
                            wx.hideLoading()
                            wx.switchTab({url: '/pages/order/index'})
                        })
                    }
                })
            } else {
                wx.showModal({
                    title: '温馨提示',
                    content: res.msg,
                    showCancel: false,
                    success: function () {
                        switch (res.data.type) {
                            case 'NO_RIGHT_ADDRESS':
                                wx.navigateTo({url: '/pages/mine/address/index?type=1&shop_id=' + that.data.param.shop_id})
                                break;
                            case 'ORDER_NO_GOOD':
                                wx.navigateTo({url: '/pages/index/shop/index?id=' + that.data.param.shop_id})
                                break;
                            default:
                                break;
                        }
                    }
                })
            }
        })
    }
});