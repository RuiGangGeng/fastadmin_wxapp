const util = require('../../../../utils/util.js');
Page({
    data: {
        list: [],
        page: 0,

        statusType: [{
            name: "未发货",
            status: '1'
        }, {
            name: "配送中",
            status: '2'
        }, {
            name: "已完成",
            status: '3'
        }, {
            name: "退款",
            status: '4'
        }],
        currentType: 0,

        param: {
            back_msg: '',
            refund_refuse_msg: '',
        },
        refund: false,
        back: false,
    },

    onLoad: function (e) {
        this.setData({'param.shop_id': e.shop_id})
        this.loadData()
    },

    // tab切换
    statusTap: function (e) {
        this.setData({currentType: e.currentTarget.dataset.index, list: [], page: 0})
        this.loadData()
    },

    // 点击跳转订单详情页面
    order_details: function (e) {
        wx.navigateTo({url: '/pages/order/info?type=shop&id=' + e.currentTarget.dataset.id})
    },

    // 弹出退单确认框
    back: function (e) {
        let that = this
        wx.showModal({
            title: '温馨提示',
            content: '确认退单么？',
            success: res => {
                if (res.confirm) {
                    that.setData({'param.id': e.currentTarget.dataset.id, back: true})
                }
            },
        })
    },

    // 提交退单信息
    confirmBack: function () {
        let that = this
        if (that.data.param.back_msg === '') {
            wx.showToast({title: '请输入退单原由', icon: 'none'})
            return false
        }
        let param = {id: that.data.param.id, back_msg: that.data.param.back_msg}
        util.wxRequest("Order/confirmBack", param, res => {
            if (res.code === 200) {
                wx.showToast({title: res.msg})
                setTimeout(function () {
                    that.setData({list: [], page: 0})
                    that.loadData()
                }, 2000)
            } else {
                wx.showModal({
                    title: '警告',
                    content: res.msg,
                    showCancel: false,
                    success(res) {
                        if (res.confirm) {
                            that.setData({list: [], page: 0})
                            that.loadData()
                        }
                    }
                })
            }
        }, () => {
        }, () => {
            that.setData({back: false})
        })
    },

    // 发货
    delivery: function (e) {
        let that = this
        wx.showModal({
            title: '温馨提示',
            content: '确认发货么？',
            success: res => {
                if (res.confirm) {
                    let param = {id: e.currentTarget.dataset.id}
                    util.wxRequest("Order/delivery", param, res => {
                        wx.showToast({title: res.msg, icon: res.code === 200 ? "success" : "none"})
                        setTimeout(function () {
                            that.setData({list: [], page: 0})
                            that.loadData()
                        }, 2000)
                    })
                }
            },
        })

    },

    // 同意退款
    refund_agree: function (e) {
        let that = this
        let param = {id: e.currentTarget.dataset.id}
        wx.showModal({
            title: '温馨提示',
            content: '确认同意退款申请么？',
            success: res => {
                if (res.confirm) {
                    util.wxRequest("Order/refundAgree", param, res => {
                        if (res.code === 200) {
                            wx.showToast({title: res.msg})
                            setTimeout(function () {
                                that.setData({list: [], page: 0})
                                that.loadData()
                            }, 2000)
                        } else {
                            wx.showModal({
                                title: '警告',
                                content: res.msg,
                                showCancel: false,
                                success(res) {
                                    if (res.confirm) {
                                        that.setData({list: [], page: 0})
                                        that.loadData()
                                    }
                                }
                            })
                        }
                    })
                }
            },
        })
    },

    // 弹出拒绝退款 输入框
    refund_refuse: function (e) {
        let that = this
        wx.showModal({
            title: '温馨提示',
            content: '确认操作么？',
            success: res => {
                if (res.confirm) {
                    that.setData({'param.id': e.currentTarget.dataset.id, refund: true})
                }
            },
        })
    },

    // 提交拒绝退款理由
    confirmRefund: function () {
        let that = this
        if (that.data.param.refund_refuse_msg === '') {
            wx.showToast({title: '请输入拒绝原由', icon: 'none'})
            return false
        }
        let param = {id: that.data.param.id, refund_refuse_msg: that.data.param.refund_refuse_msg}
        util.wxRequest("Order/refundRefuse", param, res => {
            if (res.code === 200) {
                wx.showToast({title: res.msg})
                setTimeout(function () {
                    that.setData({list: [], page: 0})
                    that.loadData()
                }, 2000)
            } else {
                wx.showModal({
                    title: '警告',
                    content: res.msg,
                    showCancel: false,
                    success(res) {
                        if (res.confirm) {
                            that.setData({list: [], page: 0})
                            that.loadData()
                        }
                    }
                })
            }
        }, () => {
        }, () => {
            that.setData({refund: false})
        })
    },

    // 点击 拨打电话
    makeCall: function (e) {
        wx.makePhoneCall({phoneNumber: e.currentTarget.dataset.phone})
    },

    // 上拉加载
    onReachBottom: function () {
        this.loadData()
    },

    // 加载数据
    loadData: function () {
        let that = this

        let param = {
            status: this.data.statusType[this.data.currentType].status,
            page: that.data.page + 1,
            shop_id: this.data.param.shop_id,
        }

        // Object.assign(param, that.data.param)

        util.wxRequest("Order/getOrders", param, res => {
            if (res.code === 200) {
                for (let i = 0, length = res.data.data.length; i < length; i++) {
                    res.data.data[i].more = res.data.data[i].ordergood.length > 3
                    res.data.data[i].ordergood = res.data.data[i].ordergood.slice(0, 3)
                }
                let list = that.data.list.concat(res.data.data)
                that.setData({
                    page: res.data.current_page,
                    onAsync: false,
                    list,
                })
            }
        })
    },

    // 字段输入
    bindInput: function (e) {
        let field = e.currentTarget.dataset.field
        let param = this.data.param;
        param[field] = e.detail.value
        this.setData({param})
    },

})