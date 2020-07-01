const util = require('../../../utils/util.js')
const user = require('../../../utils/user.js')
import WxValidate from '../../../utils/WxValidate.js'
Page({

    data: {
        no: false,
        param: {},
        auth: true,
        onAsync: false
    },

    onLoad: function(options) {
        let that = this
        if (options.id != undefined) {
            this.address(options.id)
        }

        that.initValidate()
    },

    // 修改地址场景 回填数据
    address: function(id) {
        let that = this
        let url = 'wechat/User/edit_address'
        let params = {
            id: id
        }
        util.wxRequest(url, params, data => {
            that.setData({
                addr: data,
            })
        })
    },

    // 字段输入
    bindInput: function(e) {
        let that = this
        let field = e.currentTarget.dataset.field
        let p = that.data.param;
        p[field] = e.detail.value
        that.setData({
            param: p
        })
    },

    // 选择地址
    location: function() {
        var that = this
        wx.chooseLocation({
            success: function(res) {
                getApp().globalData.debug && console.log(res)
                that.setData({
                    'param.address': res.address,
                    'param.latitude': res.latitude,
                    'param.longitude': res.longitude,
                    auth: true
                })
            },
            fail: function(res) {
                res.errMsg == "chooseLocation:fail auth deny" && that.setData({ auth: false })
            }
        })
    },

    // 提交
    submit: function() {
        let that = this

        if (that.data.onAsync) { return false } else { that.setData({ onAsync: true }) }

        // 验证
        if (!this.ValidateName.checkForm(that.data.param)) {
            const error = this.ValidateName.errorList[0]
            wx.showToast({
                title: error.msg,
                icon: "none"
            })
            that.setData({ onAsync: false })
            return false
        }

        util.wxRequest('Address/postAddress', that.data.param, res => {
            wx.showToast({ title: res.msg, icon: res.code == 200 ? 'success' : 'none' })
            setTimeout(function() { wx.navigateBack() }, 2000)
        })
    },

    // 验证
    initValidate: function() {
        const rules = {
            address: {
                required: true,
            },
            contact: {
                required: true,
            },
            phone: {
                required: true,
                tel: true
            },
        }
        const messages = {
            address: {
                required: "请选择地址",
            },
            contact: {
                required: "请输入联系人姓名",
            },
            phone: {
                required: "请输入联系人手机号",
            },
        }
        this.ValidateName = new WxValidate(rules, messages)
    }

})