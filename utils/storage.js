// 自定义设置缓存（带有效期）
const setStorage = (key, value) => {
    //获取缓存有效期
    let time = getApp().globalData.storage_time
    let seconds = parseInt(time)
    if (seconds > 0) {
        wx.setStorageSync(key, value)
        let timestamp = Date.parse(new Date()) / 1000
        let destroy_time = timestamp + seconds
        wx.setStorageSync(key + '_destroy_time', destroy_time + '')
    } else {
        console.log('缓存' + key + '设置失败')
    }
}

// 自定义获取缓存
const getStorage = (key) => {
    let destroy_time = parseInt(wx.getStorageSync(key + '_destroy_time'))
    let timestamp = Date.parse(new Date()) / 1000
    if (timestamp < destroy_time) {
        return wx.getStorageSync(key)
    } else {
        return false
    }
}

// 清除指定缓存
const removeStorage = (key) => {
    wx.removeStorageSync(key)
    wx.removeStorageSync(key + '_destroy_time')
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