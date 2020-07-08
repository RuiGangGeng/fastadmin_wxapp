const util = require('../../../../utils/util.js');
Page({
    data: {
        shop_id: null,
        list: [],
        page: 0,
        list_rows: 5,
        param: {
            status: 1,
        },
    },

    onLoad: function(options) {
        let that = this

        // 获取商家ID
        that.setData({ shop_id: options.shop_id })
    },

    onShow: function() {
        let that = this

        // 请求分类
        util.wxRequest('wechat/Shop/getCategories', { shop_id: that.data.shop_id }, res => {
            res.code == 500 && function() {
                wx.showModal({
                    title: '提示',
                    content: '暂无分类，请先添加分类在添加商品',
                    showCancel: false,
                    success: function(res) {
                        res.confirm && wx.navigateTo({ url: '/pages/addcate/addcate?shop_id=' + that.data.shop_id })
                    }
                })
            }()
        })

        that.setData({ list: [], page: 0 })
        that.loadData()
    },

    // 点击筛选条件
    changeSelect: function(e) {
        let that = this
        let status = e.currentTarget.dataset.status
        let param = that.data.param
        if (status < 2) {
            param.status = status * 1
            delete param.price
        } else {
            param.price = "price"
            delete param.status
        }
        that.setData({
            select: status,
            param: param,
            page: 0,
            list: []
        })
        that.loadData();
    },

    // 上架 下架 删除
    changegood: function(e) {
        let that = this
        let act = e.currentTarget.dataset.act
        let msg = '';
        switch (act) {
            case 'up_goods':
                msg = '确认上架产品么？'
                break
            case 'down_goods':
                msg = '确认下架产品么？'
                break
            case 'delete_goods':
                msg = '确认删除产品么？'
                break
        }

        // 确认框
        wx.showModal({
            confirmColor: '#39a336',
            title: '温馨提示',
            content: msg,
            success: res => {
                if (res.confirm) {
                    util.wxRequest("wechat/shop/" + act, { id: e.currentTarget.dataset.id }, res => {
                        wx.showToast({
                            title: res.msg,
                            icon: res.code == 200 ? 'success' : "none"
                        })
                    }, res => {}, res => {
                        setTimeout(function() {
                            that.setData({ list: [], page: 0 })
                            that.loadData()
                        }, 1000)
                    });
                }
            },
        })
    },

    // 加载数据
    loadData: function() {
        let that = this;

        wx.showLoading({ title: '加载中' })
        setTimeout(function() { wx.hideLoading() }, 3000)

        let param = {
            shop_id: that.data.shop_id,
            page: that.data.page + 1,
        }

        Object.assign(param, that.data.param);

        util.wxRequest("wechat/Shop/get_goods", param, res => {
            let temp = that.data.list.concat(res.data.data)

            that.setData({
                page: res.data.current_page,
                list: temp
            })

            wx.hideLoading()

            res.data.data.length == 0 && res.data.current_page !== 1 ? wx.showToast({
                title: '暂无更多数据',
                icon: "none"
            }) : ''

        })
    },

    // 点击搜索
    bindfocus: function(e) {
        wx.navigateTo({
            url: '/pages/managshopSearch/managshopSearch?shop_id=' + this.data.shop_id,
        })
    }
})