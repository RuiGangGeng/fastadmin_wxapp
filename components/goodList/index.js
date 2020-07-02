Component({
    properties: {
        goodList:Array,
    },
    data:{
        goodList:[],
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
