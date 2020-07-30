const util = require('util.js');
const storage = require('storage.js');

// 微信登录
const wxLogin = (url) => {
    let token = storage.getStorage('token')
    if (token) {
        setTimeout(function () {
            getApp().globalData.user_info = true
            getApp().globalData.token = token
            getApp().wxLoginCallback && getApp().wxLoginCallback() // callBack用户信息
        })
    } else {
        wx.showLoading({
          title: '加载中，请稍等',
          mask: true
        })
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                util.wxRequest(url, {code: res.code}, res => {
                    getApp().globalData.user_info = true
                    getApp().globalData.token = res.data.token
                    storage.setStorage('token', res.data.token)
                    wx.hideLoading()
                    getApp().wxLoginCallback && getApp().wxLoginCallback() // callBack用户信息
                })
            }
        })
    }
}

// 获取用户授权
const wxAuthUserInfo = (url, e = '') => {
    let param = {}
    if (e === '') {
        // 检查是否授权
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: function (res) {
                            param.nickname = res.userInfo.nickName
                            param.avatar = res.userInfo.avatarUrl
                            util.wxRequest(url, param, res => {
                                if (res.code === 200) {
                                    getApp().globalData.user_auth = true
                                    getApp().userAuthReadyCallback && getApp().userAuthReadyCallback()
                                }
                            })
                        }
                    })
                }
            }
        })
    } else {
        if (e.detail.errMsg === 'getUserInfo:ok') {
            // 防止session_key过期这里再登录一次
            storage.removeStorage('token')
            wxLogin("User/wxAppLogIn")
            param.nickname = e.detail.userInfo.nickName
            param.avatar = e.detail.userInfo.avatarUrl
            getApp().wxLoginCallback = function () {
                util.wxRequest(url, param, res => {
                    if (res.code === 200) {
                        getApp().globalData.user_auth = true
                        getApp().userAuthReadyCallback && getApp().userAuthReadyCallback()
                    }
                })
            }
        }
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
        success: function (res) {
            if (res.statusCode === 200) {
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