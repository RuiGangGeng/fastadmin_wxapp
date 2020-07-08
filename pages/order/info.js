const util = require('../../utils/util.js')
Page({
    data: {
        info: [],
        refund: false,
        param: {
            refund_refuse_msg: ''
        }
    },
    onLoad: function (options) {
        // 获取订单详情
        util.wxRequest("Order/getOrder", {id: options.id}, res => {
            if (res.code === 200) {
                res.data.createtime = res.data.createtime ? util.formatTime(new Date(res.data.createtime * 1000)) : res.data.createtime
                res.data.pay_time = res.data.pay_time ? util.formatTime(new Date(res.data.pay_time * 1000)) : res.data.pay_time
                res.data.delivery_time = res.data.delivery_time ? util.formatTime(new Date(res.data.delivery_time * 1000)) : res.data.delivery_time
                res.data.receiving_time = res.data.receiving_time ? util.formatTime(new Date(res.data.receiving_time * 1000)) : res.data.receiving_time
                res.data.refund_apply_time = res.data.refund_apply_time ? util.formatTime(new Date(res.data.refund_apply_time * 1000)) : res.data.refund_apply_time
                res.data.refund_agree_time = res.data.refund_agree_time ? util.formatTime(new Date(res.data.refund_agree_time * 1000)) : res.data.refund_agree_time
                res.data.refund_refuse_time = res.data.refund_refuse_time ? util.formatTime(new Date(res.data.refund_refuse_time * 1000)) : res.data.refund_refuse_time
                res.data.updatetime = res.data.updatetime ? util.formatTime(new Date(res.data.updatetime * 1000)) : res.data.updatetime

                this.setData({info: res.data});
            }
        })
    },

    // 商家
    shop: function () {
        wx.navigateTo({url: '/pages/index/shop/index?id=' + this.data.info.shop_id})
    },

    // 联系商家
    phone: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.info.ordershop.phone
        })
    },

    // 下单支付
    pay: function (e) {
        let that = this
        that.setData({payOnAsync: true})
        let param = {
            id: e.currentTarget.dataset.id
        }
        //调用订单创建接口
        util.wxRequest('Pay/payAgain', param, res => {
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
                            that.onLoad({id: that.data.info.id})
                        })
                    }
                })
            } else {
                wx.showModal({
                    title: '温馨提示',
                    content: res.msg,
                    showCancel: false,
                    success: function () {
                        that.onLoad({id: that.data.info.id})
                    }
                })
            }
        })
    },

    // 申请退款
    refund: function () {
        wx.showModal({
            title: '温馨提示',
            content: '确定申请退款吗？',
            success: res => {
                res.confirm && this.setData({refund: true})
            },
        })
    },

    // 提交退款申请
    confirmRefund: function () {
        let that = this
        if (that.data.param.refund_refuse_msg === '') {
            wx.showToast({title: '请输入退款理由', icon: 'none'})
            return false
        }

        let param = {
            id: that.data.info.id,
            refund_refuse_msg: that.data.param.refund_refuse_msg
        }

        util.wxRequest("Order/confirmRefund", param, res => {
            wx.showToast({title: res.msg, icon: res.code === 200 ? 'success' : 'none'})
            that.setData({
                refund: false,
                'param.refund_refuse_msg': ''
            })
            setTimeout(function () {
                that.onLoad({id: that.data.info.id})
            }, 1500)
        })
    },

    // 确认收货
    confirm: function (e) {
        let that = this
        let param = {id: e.currentTarget.dataset.id}
        wx.showModal({
            title: '温馨提示',
            content: '确认商品无误，点击确定收货',
            success: res => {
                if (res.confirm) {
                    util.wxRequest("Order/confirmReceiving", param, res => {
                        wx.showToast({title: res.msg, icon: res.code === 200 ? 'success' : 'none'})
                        setTimeout(function () {
                            that.onLoad({id: that.data.info.id})
                        }, 1500)
                    })
                }
            },
        })
    },

    // 字段输入
    bindInput: function (e) {
        let field = e.currentTarget.dataset.field
        let param = this.data.param;
        param[field] = e.detail.value
        this.setData({param})
    },
});