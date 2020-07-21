const user = require('../../utils/user.js')
let app = getApp()
Component({
    properties: {
        show: {
            type: Boolean,
            value: false,
        }
    },
    data: {
        auth: false
    },
    attached: function () {
        this.setData({
            auth: app.globalData.user_auth
        })
    },
    methods: {
        bindGetUserInfo: function (e) {
            let that = this
            getApp().userAuthReadyCallback = function () {
                that.setData({
                    auth: true
                })
                that.triggerEvent('Auth', {}, )
            }
            user.wxAuthUserInfo('User/wxAppAuthUser', e)
        }
    }
});
