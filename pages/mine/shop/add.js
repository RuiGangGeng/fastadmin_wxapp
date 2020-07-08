const app = getApp()
const util = require('../../../utils/util.js')
import WxValidate from '../../../utils/WxValidate.js'

Page({
    data: {
        param: {},
        onAsync: false,
        categories: [],
        categoriesSelectName: "请选择",
        auth: true,
    },

    onLoad: function () {
        let that = this

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
            sourceType: ['album'],
            success: function (res) {
                let param = 'param.' + e.currentTarget.dataset.field
                that.setData({[param]: res.tempFilePaths[0]})
            },
        })
    },

    // 加载数据
    onSubmit: function () {
        let that = this

        // 立即进入异步状态
        that.setData({onAsync: true})

        // 验证
        if (!this.validate.checkForm(that.data.param)) {
            let error = this.validate.errorList[0]
            wx.showToast({title: error.msg, icon: "none"})
            that.setData({onAsync: false})
            return false
        }

        let param = {}

        Object.assign(param, that.data.param)

        // 提交数据
        util.wxRequest('Shop/setShop', that.data.param, res => {
            wx.showToast({title: res.msg, icon: res.code === 200 ? 'success' : 'none'})
            if (res.code === 200) {
                setTimeout(function () {
                    wx.navigateBack();
                }, 2000)
            }
        })
    },

    // 初始化验证器
    initValidate: function () {
        const rules = {
            contact: {required: true},
            phone: {required: true, tel: true},
            name: {required: true},
            category_id: {required: true},
            address: {required: true},
            storefront_image: {required: true},
            license_image: {required: true},
            card_down_image: {required: true},
            card_up_image: {required: true},
        }
        const messages = {
            contact: {required: '请输入联系人'},
            phone: {required: '请输入手机号'},
            name: {required: '请输入店铺名称'},
            category_id: {required: '请选择行业分类'},
            address: {required: '请选择详细地址'},
            storefront_image: {required: '请选择营业执照（副本）照片'},
            license_image: {required: '请选择实体店铺照片照片'},
            card_down_image: {required: '请选择身份证正面照片'},
            card_up_image: {required: '请选择身份证反面照片'},
        }

        this.validate = new WxValidate(rules, messages)
    }
})