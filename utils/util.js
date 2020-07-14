// 格式化时间
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

// 封装异步请求
const wxRequest = (url, params, successCallback, errorCallback, completeCallback, method = 'GET') => {
    wx.request({
        url: getApp().globalData.api_host + url,
        data: params || {},
        header: {
            'content-type': 'application/json',
            'token': getApp().globalData.token.toString()
        },
        method: method,
        success: function(res) {
            if (res.statusCode === 200) {
                getApp().globalData.debug && console.log(res.data)
                successCallback(res.data)
            }
        },
        fail: function(res) {
            errorCallback ? errorCallback(res) : wx.showToast({ title: '网络错误', icon: 'none' })
        },
        complete: function(res) {
            completeCallback ? completeCallback(res) : getApp().globalData.debug && console.log(url + " 请求完成")
        }
    })
}

module.exports = {
    formatTime: formatTime,
    wxRequest: wxRequest,
}