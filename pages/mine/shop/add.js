const app = getApp()
const util = require('../../../utils/util.js')
import WxValidate from '../../../utils/WxValidate.js'

Page({
    data: {
        param: {},
        onAsync: false,
        categories: [],
        categoriesSelectName: "请选择",
        hours_starts: [
            {name: '0:00', id: 0},
            {name: '1:00', id: 1},
            {name: '2:00', id: 2},
            {name: '3:00', id: 3},
            {name: '4:00', id: 4},
            {name: '5:00', id: 5},
            {name: '6:00', id: 6},
            {name: '7:00', id: 7},
            {name: '8:00', id: 8},
            {name: '9:00', id: 9},
            {name: '10:00', id: 10},
            {name: '11:00', id: 11},
            {name: '12:00', id: 12},
            {name: '13:00', id: 13},
            {name: '14:00', id: 14},
            {name: '15:00', id: 15},
            {name: '16:00', id: 16},
            {name: '17:00', id: 17},
            {name: '18:00', id: 18},
            {name: '19:00', id: 19},
            {name: '20:00', id: 20},
            {name: '21:00', id: 21},
            {name: '22:00', id: 22},
            {name: '23:00', id: 23},
            {name: '24:00', id: 24},
        ],
        hours_startSelectName: "请选择",
        hours_endSelectName: "请选择",
        auth: true,
        temp: {
            license_image: "/images/mine_shop_image.png",
            storefront_image: "/images/mine_shop_image.png",
            card_up_image: "/images/mine_shop_image.png",
            card_down_image: "/images/mine_shop_image.png",
        }
    },

    onLoad: function (e) {
        let that = this
        let url = decodeURIComponent(e.q)
        if (url) {
            that.setData({'param.parent_id': url.split('=')[1]})
        }
        // 获取行业分类
        util.wxRequest("Index/getCategories", {}, res => {
            res.code === 200 && that.setData({
                categories: res.data
            })
        })

        that.initValidate()
    },

    // 字段输入
    bindInput: function (e) {
        let field = e.currentTarget.dataset.field
        let param = this.data.param;
        param[field] = e.detail.value
        this.setData({param})
    },

    // 选择Picker
    bindPicker: function (e) {
        let that = this
        let name = e.currentTarget.dataset.name
        let list = e.currentTarget.dataset.list
        let field = e.currentTarget.dataset.field
        let p = that.data.param;
        p[field] = that.data[list][e.detail.value].id
        for (let i in that.data) {
            if (i === name) {
                that.setData({
                    [name]: that.data[list][e.detail.value].name,
                    param: p
                })
            }
        }
    },

    // 选择地址
    location: function () {
        let that = this
        wx.chooseLocation({
            success: function (res) {
                getApp().globalData.debug && console.log(res)
                that.setData({
                    'param.address': res.address,
                    'param.latitude': res.latitude,
                    'param.longitude': res.longitude,
                    auth: true
                })
            },
            fail: function (res) {
                res.errMsg === "chooseLocation:fail auth deny" && that.setData({auth: false})
            }
        })
    },

    // 选择图片
    chooseImage(e) {
        let that = this
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                let temp = 'temp.' + e.currentTarget.dataset.field
                let param = 'param.' + e.currentTarget.dataset.field
                that.setData({[temp]: res.tempFilePaths[0], [param]: 1})
            },
        })
    },

    // 上传图片
    onSubmit: function () {
        let that = this

        // 立即进入异步状态
        that.setData({onAsync: true})

        // 验证
        if (!that.validate.checkForm(that.data.param)) {
            let error = this.validate.errorList[0]
            wx.showToast({title: error.msg, icon: "none"})
            that.setData({onAsync: false})
            return false
        }

        // 上传图片
        wx.showLoading({title: '上传图片中'})
        let token = getApp().globalData.token.toString()
        let temp = that.data.temp
        util.wxUploads('index/upload', token, temp.license_image, util.wxUploads, res => {
            that.setData({'param.license_image': res})
            util.wxUploads('index/upload', token, temp.storefront_image, util.wxUploads, res => {
                that.setData({'param.storefront_image': res})
                util.wxUploads('index/upload', token, temp.card_down_image, util.wxUploads, res => {
                    that.setData({'param.card_down_image': res})
                    util.wxUploads('index/upload', token, temp.card_up_image, util.wxUploads, res => {
                        that.setData({'param.card_up_image': res})
                        that.ajax()
                    })
                })
            })
        })
    },

    // 提交数据
    ajax: function () {
        // 提交数据
        util.wxRequest('Shop/setShop', this.data.param, res => {
            wx.showModal({
                title: '温馨提示',
                content: res.msg,
                showCancel: false,
                success() {
                    if (res.code === 200) {
                        wx.navigateBack({
                            complete(res) {
                                if (res.errMsg !== 'navigateBack:ok') {
                                    wx.switchTab({url: '/pages/index/index'})
                                }
                            }
                        })
                    }
                }
            })
        }, () => {
        }, () => {
            this.setData({onAsync: false})
            wx.hideLoading()
        })
    },

    // 初始化验证器
    initValidate: function () {
        const rules = {
            contact: {required: true},
            phone: {required: true, tel: true},
            name: {required: true},
            short: {required: true},
            category_id: {required: true},
            address: {required: true},
            hours_start: {required: true},
            hours_end: {required: true},
            distance: {required: true},
            delivery: {required: true},
            base_price: {required: true},
            storefront_image: {required: true},
            license_image: {required: true},
            card_down_image: {required: true},
            card_up_image: {required: true},
        }
        const messages = {
            contact: {required: '请输入联系人'},
            phone: {required: '请输入手机号'},
            name: {required: '请输入店铺名称'},
            short: {required: '请输入店铺简介'},
            category_id: {required: '请选择行业分类'},
            address: {required: '请选择详细地址'},
            hours_start: {required: '请选择开始营业时间'},
            hours_end: {required: '请选择结束营业时间'},
            distance: {required: '请输入配送距离'},
            delivery: {required: '请输入配送时间'},
            base_price: {required: '请输入起送价格'},
            storefront_image: {required: '请选择实体店铺照片照片'},
            license_image: {required: '请选择营业执照（副本）照片'},
            card_down_image: {required: '请选择身份证反面照片'},
            card_up_image: {required: '请选择身份证正面照片'},
        }

        this.validate = new WxValidate(rules, messages)
    }
})