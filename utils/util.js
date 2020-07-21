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

const wxUploads = (url, token, data, callback, success, index = 0) => {
    let multiple = data instanceof Array
    let length = multiple ? data.length : 1
    if (multiple) {
        if (length === 0) {
            success([])
        }
    }
    wx.uploadFile({
        url: getApp().globalData.api_host + url,
        filePath: multiple ? data[index] : data,
        header: {token: token},
        name: 'file',
        success: function (res) {
            res = JSON.parse(res.data)
            if (res.code === 1) {
                multiple ? data[index] = res.data.url : data = res.data.url
            }
        },
        complete() {
            index++
            if (index === length) { // 上传完毕调用成功回调暴露指定数据出去
                success(data)
            } else { // 执行下一张上传
                callback(url, token, data, callback, success, index)
            }
        }
    })
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
    wxUploads: wxUploads,
}