const app = getApp()
const util = require('../../../utils/util.js')
import WxValidate from '../../../utils/WxValidate.js'

Page({
    data: {
        param: {},
        list: [],
        page: 0,
        onLoad: true,
        onAsync: false,
    },

    onLoad: function() {
        let that = this
        that.initValidate()
    },

    // 加载数据
    onSubmit: function() {
        let that = this

        // 立即进入异步状态
        that.setData({ onAsync: true })

        // 验证
        if (!this.Validate.checkForm(that.data.param)) {
            let error = this.Validate.errorList[0]
            wx.showToast({ title: error.msg, icon: "none" })
            that.setData({ onAsync: false })
            return false
        }

        let param = {}

        Object.assign(param, that.data.param)

        // 提交数据
        util.wxRequest('Shop/setShop', that.data.param, res => {
            wx.showToast({ title: res.msg, icon: res.code == 200 ? 'success' : 'none' })
            res.code = 200 ? setTimeout(() => {}, 2000) : that.setData({ onASync: false })
        })
    },

    // 初始化验证器
    initValidate: function() {
        const rules = {
            address: { required: true },
        }
        const messages = {
            address: { required: "请选择地址" },
        }

        this.validate = new WxValidate(rules, messages)
    }
})