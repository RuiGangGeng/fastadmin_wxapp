const util = require('../../utils/util.js')
Component({
    properties: {
        count: Number,
        top: Number,
        topMsg: String,
        goodData: Object,
        showButton: {
            type: Boolean,
            value: false
        },
    },
    data: {
        count: 0,
        showButton: true,
        onAsync: false,
    },
    methods: {
        pushCart: function () {
            this.pub()
        },
        inc: function () {
            this.pub()
        },
        dec: function () {
            if (this.data.onAsync) {
                return false
            } else {
                this.setData({
                    onAsync: true
                })
            }
            let count = this.data.count;
            count--
            util.wxRequest("Cart/deleteCart", {good_id: this.data.goodData.id}, res => {
                if (res.code !== 200) {
                    wx.showModal({
                        title: '温馨提示',
                        content: res.msg,
                        showCancel: false,
                    })

                } else {
                    this.setData({count, onAsync: false})
                    this.triggerEvent('dec', {data: this.data.goodData}, { bubbles: true, composed: true })
                }
            })
        },
        pub: function () {
            if (this.data.onAsync) {
                return false
            } else {
                this.setData({
                    onAsync: true
                })
            }

            let count = this.data.count;
            let top = this.data.top;
            let topMsg = this.data.topMsg;

            if (++count > top) {
                wx.showModal({
                    title: '温馨提示',
                    showCancel: false,
                    content: topMsg,
                })
                this.setData({
                    onAsync: false
                })
                return false
            }

            util.wxRequest("Cart/postCart", {good_id: this.data.goodData.id,shop_id:this.data.goodData.shop_id}, res => {
                if (res.code !== 200) {
                    wx.showModal({
                        title: '温馨提示',
                        content: res.msg,
                        showCancel: false,
                    })
                } else {
                    this.setData({count})
                    this.triggerEvent('inc', {data: this.data.goodData}, { bubbles: true, composed: true })
                }
                this.setData({onAsync: false})
            })
        }
    }
});
