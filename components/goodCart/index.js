Component({
    properties: {
        dataCart: Array,
        base_price:Number,
    },
    data: {
        total: 0,
        totalPrice: 0,
        difference:0,
    },
    observers: {
        "dataCart": function (dataCart) {
            let total = 0
            let totalPrice = 0
            for (let i = 0, length = dataCart.length; i < length; i++) dataCart[i].select_ === '1' && (totalPrice += dataCart[i].price * dataCart[i].number, total += dataCart[i].number)
            totalPrice = totalPrice.toFixed(2)
            let difference = 0;
            if(totalPrice<this.data.base_price){
                difference = (this.data.base_price - totalPrice).toFixed(2)
            }
            this.setData({total, totalPrice,difference})
        }
    },
    methods: {
        // 显示订单详情
        showDetail: function () {
            console.log(this.data)
        },

        // 生成订单
        generateOrder: function () {
            wx.navigateTo({'url':'/pages/index/order/add?shop_id='+this.data.dataCart[0].shop_id})
        }
    }
});
