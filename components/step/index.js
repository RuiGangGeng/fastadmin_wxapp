Component({
    properties: {
        count:Number,
        top:Number,
        topMsg:String,
        data:Array
    },
    data: {},
    methods: {
        inc:function (e) {

        },
        dec:function (e) {
            let count = this.data.count;
            let top = this.data.top;
            let topMsg = this.data.topMsg;
            if(count++>top){
                wx.showModal({
                    title:"提示",
                    content:topMsg,
                })
                return false
            }
            this.setData({count:this.data.count++})
        }
    }
});
