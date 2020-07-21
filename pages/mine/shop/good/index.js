const util = require('../../../../utils/util.js');
Page({
    data: {
        shop_id: false,
        list: [],
        page: 0,
        param: {
            status: 1,
        },
    },

    onLoad: function (options) {
        let that = this

        // 获取商家ID
        that.setData({shop_id: options.shop_id})
    },

    onShow: function () {
        let that = this
        // 请求分类
        util.wxRequest('Category/getCategories', {shop_id: that.data.shop_id}, res => {
            if (res.code !== 200) {
                wx.showModal({
                    title: '提示',
                    content: '暂无分类，请先添加分类在添加商品',
                    showCancel: false,
                    success: function (res) {
                        res.confirm && wx.navigateTo({url: '/pages/mine/index/categories/add?shop_id=' + that.data.shop_id})
                    }
                })
            }
        })
        that.setData({list: [], page: 0})
        that.loadData()
    },

    // 点击筛选条件
    changeSelect: function (e) {
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
    changeGood: function (e) {
        let that = this
        let act = e.currentTarget.dataset.act
        let msg = '';
        let data = '';
        switch (act) {
            case 'up':
                msg = '确认上架产品么？'
                data = JSON.stringify({status: '1'})
                break
            case 'down':
                msg = '确认下架产品么？'
                data = JSON.stringify({status: '0'})
                break
            case 'delete':
                msg = '确认删除产品么？'
                data = JSON.stringify({deletetime: ((new Date()).getTime() / 1000).toFixed(0)})
                break
        }

        // 确认框
        wx.showModal({
            confirmColor: '#39a336',
            title: '温馨提示',
            content: msg,
            success: res => {
                if (res.confirm) {
                    util.wxRequest('Good/putGood', {id: e.currentTarget.dataset.id, shop_id: that.data.shop_id, data: data}, res => {
                        wx.showToast({title: res.msg, icon: res.code === 200 ? 'success' : "none"})
                    }, res => {
                    }, res => {
                        setTimeout(function () {
                            that.setData({list: [], page: 0})
                            that.loadData()
                        }, 2000)
                    });
                }
            },
        })
    },

    // 编辑
    edit: function (e) {
        wx.navigateTo({url: '/pages/mine/shop/good/add?id=' + e.currentTarget.dataset.id + '&shop_id=' + this.data.shop_id})
    },

    // 上拉加载
    onReachBottom: function () {
        this.loadData()
    },

    // 加载数据
    loadData: function () {
        let that = this;

        wx.showLoading()
        setTimeout(function () {
            wx.hideLoading()
        }, 3000)

        let param = {shop_id: that.data.shop_id, stock: false}
        Object.assign(param, that.data.param);

        util.wxRequest("Good/getGoods", {page: that.data.page + 1, where: JSON.stringify(param)}, res => {
            let list = that.data.list.concat(res.data.data)
            that.setData({
                page: res.data.current_page,
                list
            })
            wx.hideLoading()
        })
    },

    // 点击搜索
    bindFocus: function (e) {
        wx.navigateTo({
            url: '/pages/managshopSearch/managshopSearch?shop_id=' + this.data.shop_id,
        })
    }
})