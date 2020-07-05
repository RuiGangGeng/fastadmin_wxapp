Component({
    properties: {
        list:Array,
    },
    data:{
        list:[],
    },
    methods: {
        // 查看商品详情
        good: function (e) {
            wx.navigateTo({
                url: '/pages/index/good/index?id=' + e.currentTarget.dataset.id
            })
        },
    }
});
