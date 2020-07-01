// 自定义设置缓存（带有效期）
const setStorage = (key, value) => {
    //获取缓存有效期
    var time = getApp().globalData.storage_time
    var seconds = parseInt(time)
    if (seconds > 0) {
        wx.setStorageSync(key, value)
        var timestamp = Date.parse(new Date()) / 1000
        var destroytime = timestamp + seconds
        wx.setStorageSync(key + '_destroytime', destroytime + '')
    } else {
        console.log('缓存' + key + '设置失败')
    }
}

// 自定义获取缓存
const getStorage = (key) => {
    var destroytime = parseInt(wx.getStorageSync(key + '_destroytime'))
    var timestamp = Date.parse(new Date()) / 1000
    if (timestamp < destroytime) {
        return wx.getStorageSync(key)
    } else {
        return false
    }
}

// 清除指定缓存
const removeStorage = (key) => {
    wx.removeStorageSync(key)
    wx.removeStorageSync(key + '_destroytime')
}

// 清除所有缓存
const clearStorage = () => {
    wx.clearStorageSync()
}

module.exports = {
    setStorage: setStorage,
    getStorage: getStorage,
    removeStorage: removeStorage,
    clearStorage: clearStorage,
}