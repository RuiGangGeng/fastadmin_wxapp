Component({
    properties: {
        dataCart: Array,
        base_price: Number,
    },
    data: {
        total: 0,
        totalPrice: 0,
        difference: 0,
        showDetail: false,
        select_: true,
    },
    observers: {
        "dataCart": function (dataCart) {
            let total = 0
            let totalPrice = 0
            let select_ = true
            for (let i = 0, length = dataCart.length; i < length; i++) {
                if (dataCart[i].select_ === '1') {
                    totalPrice += dataCart[i].price * dataCart[i].number
                    total += dataCart[i].number
                } else {
                    select_ = false
                }
            }
            totalPrice = totalPrice.toFixed(2)
            let difference = 0;
            if (totalPrice < this.data.base_price) {
                difference = (this.data.base_price - totalPrice).toFixed(2)
            }
            this.setData({total, totalPrice, difference, select_})
            total === 0 && this.setData({showDetail: false})
        }
    },
    methods: {
        // 显示订单详情
        showDetail: function () {
            if (this.data.total < 1) {
                this.setData({showDetail: false})
            } else {
                this.setData({showDetail: !this.data.showDetail})
            }
        },

        // 生成订单
        generateOrder: function () {
            if (this.data.total !== 0 && this.data.difference <= 0) {
                wx.navigateTo({'url': '/pages/index/order/add?shop_id=' + this.data.dataCart[0].shop_id})
            }
        },

        // 清空购物车
        clearCart: function () {
            this.triggerEvent('clear', {}, {bubbles: true, composed: true})
        },

        // 全选 取消全选
        select_: function () {
            let dataCart = this.data.dataCart
            let select_ = this.data.select_
            for (let i = 0, length = dataCart.length; i < length; i++) {
                if (select_) {
                    dataCart[i].select_ = '0'
                } else {
                    dataCart[i].select_ = '1'
                }
            }
            select_ = !select_
            this.setData({dataCart, select_})
        },

        // 选择 取消选择
        select: function () {
            console.log(this.data)
        }
    }
});
