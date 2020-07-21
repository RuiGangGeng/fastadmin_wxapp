const util = require('../../../utils/util.js')
const storage = require('../../../utils/storage.js')
Page({
    data: {
        type: false,
        shop_id: false,
        history: false,

        list: [],
        page: 0,
        total: 0,

        onAsync: false,
        param: {
            search: ''
        },

        sticky: false
    },

    onLoad: function (e) {
        let that = this
        let search = storage.getStorage('search') || []
        let shop_id = e.shop_id || false
        that.setData({type: e.type, history: search, shop_id})
    },

    // 字段输入
    bindInput: function (e) {
        let field = e.currentTarget.dataset.field
        let param = this.data.param;
        param[field] = e.detail.value
        this.setData({param, page: 0})
    },

    // 搜索
    search: function () {
        this.setData({list: [], page: 0})
        this.loadData()
    },

    // 是否吸顶
    bindScroll: function (e) {
        this.setData({sticky: e.detail.isFixed})
    },

    // 点击历史
    history: function (e) {
        this.setData({list: [], page: 0, 'param.search': e.currentTarget.dataset.text})
        this.loadData()
    },

    // 清除历史
    clearHistory: function () {
        storage.removeStorage('search')
        this.setData({history: []})
    },

    // 触底加载
    onReachBottom: function () {
        this.loadData()
    },

    // 加载列表
    loadData: function () {
        let that = this

        if (that.data.onAsync) return false
        that.setData({onAsync: true})

        wx.showLoading()
        let format_search = that.data.param.search.trim()
        let param = {name: ['like', format_search + '%']}

        if (that.data.type === 'index' || that.data.type === 'shop') {
            let search = storage.getStorage('search') || []
            if (format_search !== '' && !search.includes(format_search)) {
                search.push(format_search)
                storage.setStorage('search', search)
                that.setData({history: search})
            }
            param.status = '1'
        }
        if (that.data.type === 'back' || that.data.type === 'shop') {
            param.shop_id = that.data.shop_id
            that.data.type === 'back' && (param.stock = false)
        }

        util.wxRequest("Good/getGoods", {page: that.data.page + 1, where: JSON.stringify(param)}, res => {
            let list = that.data.list.concat(res.data.data)
            that.setData({
                page: res.data.current_page,
                total: res.data.total,
                list,
                onAsync: false,
            })
        }, () => {
        }, () => {
            wx.hideLoading()
        })
    },

    // 查看商品详情
    good: function (e) {
        wx.navigateTo({
            url: '/pages/index/good/index?id=' + e.currentTarget.dataset.id
        })
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
});
