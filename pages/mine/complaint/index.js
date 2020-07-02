const app = getApp();
const util = require('../../../utils/util.js');
Page({
    data: {
        onAsync: false
    },

    //提交
    submit: function (res) {
        let that = this
        if (that.data.onAsync) { return false } else { that.setData({ onAsync: true }) }

        let content = res.detail.value.content;
        if (!content) {
            wx.showToast({
                title: '内容不能为空',
                icon: 'none',
            })
            that.setData({onAsync: false})
            return;
        }

        let params = {content: content};
        util.wxRequest('Index/postComplaint', params, res => {
            wx.showModal({
                title:'提示',
                showCancel:false,
                content:res.msg,
                success(res) {
                    if(res.confirm){
                        wx.navigateBack()
                    }
                }
            })
        });
    },
})