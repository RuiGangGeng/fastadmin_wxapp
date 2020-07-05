Component({
    properties: {
        dataCart: Array,
    },
    data: {
        total: 0,
        totalPrice: 0
    },
    observers: {
        "dataCart": function (dataCart) {
            let total = 0
            let totalPrice = 0
            for (let i = 0, length = dataCart.length; i < length; i++) totalPrice += dataCart[i].price * dataCart[i].number, total += dataCart[i].number
            totalPrice = totalPrice.toFixed(2)
            this.setData({total, totalPrice})
        }
    },
    methods: {
        showDetail: function () {
            console.log(this.data)
        }
    }
});
