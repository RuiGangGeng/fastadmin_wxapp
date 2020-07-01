const util = require('util.js');
const storage = require('storage.js');

// 微信登录
const wxLogin = (url) => {
    let token = storage.getStorage('token')
    if (token) {
        setTimeout(function() {
            getApp().globalData.user_info = true
            getApp().globalData.token = token
            getApp().wxLoginCallback && getApp().wxLoginCallback() // callBack用户信息
        })
    } else {
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                util.wxRequest(url, { code: res.code }, res => {
                    getApp().globalData.user_info = true
                    getApp().globalData.token = res.data.token
                    storage.setStorage('token', res.data.token)
                    getApp().wxLoginCallback && getApp().wxLoginCallback() // callBack用户信息
                })
            }
        })
    }
}

// 获取用户授权
const wxAuthUserInfo = (url, e) => {
    getApp().globalData.debug && console.log(e)

    // 防止session_key过期这里再登录一次
    storage.removeStorage('token')
    wxLogin()
    getApp().wxLoginCallback = function() {
        // 检查是否授权
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框

                    let param = { rawData: e.detail.rawData, signature: e.detail.signature }

                    // 校验 session_key 同时更新用户信息
                    util.wxRequest(url, param, res => {
                        if (res.data === true) {
                            getApp().userAuthReadyCallback && getApp().userAuthReadyCallback()
                        }
                    })
                }
            }
        })
    }

}

// 获取用户手机号
const wxAuthUserPhone = (e) => {

}

// 转换坐标系
const gpsToAddress = (longitude, latitude, call) => {
    wx.request({
        url: "https://apis.map.qq.com/ws/geocoder/v1/?location=" + latitude + "," + longitude + "&key=CDSBZ-KPJCG-XWUQR-IBZCX-XGRSQ-FRBPZ&poi_options=address_format=short",
        data: '',
        method: 'get',
        success: function(res) {
            if (res.statusCode == 200) {
                getApp().globalData.debug && console.log(res.data)
                call(res.data)
            }
        },
    })
}

module.exports = {
    wxLogin: wxLogin,
    wxAuthUserInfo: wxAuthUserInfo,
    wxAuthUserPhone: wxAuthUserPhone,
    gpsToAddress: gpsToAddress,
}