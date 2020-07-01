const app = getApp()
const util = require('../../../utils/util.js');

Page({
    data: {
        param: {},
        list: [],
        page: 0,
        complete: false,
        onAsync: false,
    },

    onLoad: function() {
        this.loadData()
    },

    // 设置默认地址
    setDefault: function(e) {
        var that = this
        let id = e.currentTarget.dataset.id
        var param = { id: id, data: JSON.stringify({ default: 1 }) }
        util.wxRequest('Address/putAddress', param, res => {
            if (res.code == 200) {
                wx.showToast({ title: res.msg, icon: res.code == 200 ? 'success' : 'none' })
                let temp = that.data.list
                for (let i of temp) i.id == id ? i.default = 1 : i.default = 0
                that.setData({ list: temp })
            } else {
                wx.showToast({ title: data.msg, icon: 'warn', duration: 2000 })
            }
        })
    },

    //删除地址
    deleteAddress: function(e) {
        let that = this;
        let id = e.currentTarget.dataset.id;
        for (let i of that.data.list) {
            if (i.id == id && i.default == 1) {
                wx.showModal({
                    title: '提示',
                    showCancel: false,
                    content: '默认地址不可删除',
                })
                return false
            }
        }
        wx.showModal({
            title: '提示',
            content: '您确定要删除该收获地址吗？',
            success: function(res) {
                res.confirm && util.wxRequest('Address/deleteAddress', { id: id }, res => {
                    wx.showToast({ title: res.msg, icon: res.code == 200 ? 'success' : 'none' })
                    that.setData({ list: [], page: 0, complete: false })
                    that.onLoad()
                })
            }
        })
    },

    // 编辑地址
    editAddress: function(e) {
        wx.navigateTo({ url: '/pages/mine/address/add?id=' + e.currentTarget.dataset.id })
    },

    // 触底加载
    onReachBottom: function() {
        this.loadData()
    },

    // 加载列表
    loadData: function() {
        let that = this

        if (that.data.onAsync) { return false } else { that.setData({ onAsync: true }) }

        that.data.complete && wx.showLoading()
        setTimeout(function() { wx.hideLoading() }, 3000)

        let param = { page: that.data.page + 1 }

        Object.assign(param, that.data.param)

        util.wxRequest("Address/getAddresses", param,
            res => {
                let temp = that.data.list.concat(res.data.data)

                that.setData({ page: res.data.current_page, list: temp })

                // 查询不到数据时
                // res.data.data.length == 0 && res.data.current_page !== 1 && wx.showToast({ title: '暂无更多数据', icon: "none" })
            },
            () => {},
            () => {
                that.setData({ onAsync: false, complete: true })
                wx.hideLoading()
            }
        )
    }
})