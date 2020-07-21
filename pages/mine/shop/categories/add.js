const util = require('../../../../utils/util.js')
const user = require('../../../../utils/user.js')
const app = getApp()
import WxValidate from '../../../../utils/WxValidate.js'

Page({

    data: {
        no: false,
        param: {},
        onAsync: false,
        update: false,
        shop_id: false,
    },

    onLoad: function (options) {
        let that = this
        if (options.id !== undefined) {
            this.address(options.id)
        }
        if (options.shop_id !== undefined) {
            that.setData({
                'param.shop_id': options.shop_id
            })
        }
        that.initValidate()
    },

    // 修改场景 回填数据
    address: function (id) {
        let that = this
        let params = {id: id}
        util.wxRequest('Category/getCategory', params, res => {
            that.setData({
                'param.name': res.data.name,
                'param.weigh': res.data.weigh,
                'param.status': res.data.status,
                'param.id': res.data.id,
                'param.shop_id': res.data.shop_id,
                update: true
            })
        })
    },

    // 字段输入
    bindInput: function (e) {
        let field = e.currentTarget.dataset.field
        let param = this.data.param;
        param[field] = e.detail.value
        this.setData({param})
    },

    // 提交
    submit: function () {
        let that = this

        if (that.data.onAsync) {
            return false
        } else {
            that.setData({onAsync: true})
        }

        // 验证
        if (!this.ValidateName.checkForm(that.data.param)) {
            const error = this.ValidateName.errorList[0]
            wx.showToast({
                title: error.msg,
                icon: "none"
            })
            that.setData({onAsync: false})
            return false
        }
        let url = that.data.update ? 'Category/putCategory' : 'Category/postCategory';
        let param = that.data.param
        if (that.data.update) {
            param = {id: that.data.param.id, shop_id: that.data.param.shop_id, data: JSON.stringify(that.data.param)}
        }

        util.wxRequest(url, param, res => {
            wx.showToast({title: res.msg, icon: res.code === 200 ? 'success' : 'none'})
            setTimeout(function () {
                wx.navigateBack()
            }, 2000)
        })
    },

    // 验证
    initValidate: function () {
        const rules = {
            name: {
                required: true,
            },
        }
        const messages = {
            name: {
                required: "请输入分类名称",
            },
        }
        this.ValidateName = new WxValidate(rules, messages)
    }

})