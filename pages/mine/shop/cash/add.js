const app = getApp()
const util = require('../../../../utils/util.js')
import WxValidate from '../../../../utils/WxValidate.js'

Page({
    data: {
        total_price: '',
        cash: '',
        balance: '',
        onAsync: false,
        param: {},
        success: false,
        lock_name: false
    },

    onLoad: function (e) {
        this.setData({'param.shop_id': e.shop_id})
        this.initValidate()
    },

    onShow: function () {
        // 获取信息
        util.wxRequest('Finance/getFinanceField', this.data.param, res => {
            if (res.code === 200) {
                this.setData({
                    total_price: res.data.total_price,
                    cash: res.data.cash,
                    balance: res.data.balance,
                    'param.bank': res.data.bank,
                    'param.bank_number': res.data.bank_number,
                    'param.name': res.data.name,
                    'param.cash': '',
                })
                if (!res.data.name) {
                    this.setData({
                        lock_name: false,
                    })
                }
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
        wx.showLoading()
        // 提交数据
        util.wxRequest('Finance/postFinance', this.data.param, res => {
            wx.showModal({
                title: '温馨提示',
                content: res.msg,
                showCancel: false,
                success() {
                    if (res.code === 200) {
                        that.setData({success: true})
                        wx.navigateTo({url: '/pages/mine/shop/cash/index?shop_id=' + that.data.param.shop_id})
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
            bank: {required: true,},
            name: {required: true},
            bank_number: {required: true},
            cash: {required: true, min: 100},
        }
        const messages = {
            bank: {required: '请输入开户行'},
            name: {required: '请输入开户人姓名'},
            bank_number: {required: '请输入银行卡号'},
            cash: {required: '请输入提现金额', min: '至少提现100元'},
        }

        this.validate = new WxValidate(rules, messages)
    }
});