const util = require('../../../../utils/util.js')
import WxValidate from '../../../../utils/WxValidate.js'

const app = getApp()

Page({
    data: {
        param: {},
        onAsync: false,
        categories: [],
        categoriesSelectName: "请选择",
        thumb_image: '',
        images: [''],
        id: false,
        update: false
    },

    onLoad: function (e) {
        let that = this
        that.setData({'param.shop_id': e.shop_id})
        if (e.id !== undefined) {
            that.setData({id: e.id})
        }
        that.initValidate()
    },
    onShow: function () {
        let that = this
        if (that.data.update) return false
        // 获取分类
        util.wxRequest("Category/getCategories", {shop_id: that.data.param.shop_id, list_rows: 1000}, res => {
            if (res.code === 200) {
                that.setData({categories: res.data.data})
                if (res.data.data.length === 0) {
                    wx.showModal({
                        title: '温馨提示',
                        showCancel: false,
                        content: '您还没有商品分类，请添加',
                        success() {
                            wx.navigateTo({
                                url: '/pages/mine/shop/categories/add?shop_id=' + that.data.param.shop_id,
                            })
                        }
                    })
                }
            }
            if (that.data.id !== false) {
                that.address(that.data.id)
            }
        })
    },

    // 修改场景 回填数据
    address: function (id) {
        let that = this
        let params = {id: id, back: true}
        let categoriesSelectName = ''
        util.wxRequest('Good/getGood', params, res => {
            res.data.images.push('')
            for (let i of that.data.categories) {
                if (i.id === res.data.shop_category_id) {
                    categoriesSelectName = i.name
                }
            }
            that.setData({
                'param.shop_id': res.data.shop_id,
                'param.id': res.data.id,
                'param.shop_category_id': res.data.shop_category_id,
                'param.name': res.data.name,
                'param.original': res.data.original,
                'param.price': res.data.price,
                'param.stock': res.data.stock,
                'param.thumb_image': res.data.thumb_image,
                'param.images': res.data.images,
                'param.short': res.data.short,
                'param.content': res.data.content,
                thumb_image: res.data.thumb_image,
                images: res.data.images,
                update: true,
                categoriesSelectName
            })
        })
    },

    // 字段输入
    bindInput: function (e) {
        let field = e.currentTarget.dataset.field
        let param = this.data.param;
        param[field] = e.detail.value
        this.setData({param})
    },

    // 选择Picker
    bindPicker: function (e) {
        let name = e.currentTarget.dataset.name
        let list = e.currentTarget.dataset.list
        let field = e.currentTarget.dataset.field
        let param = this.data.param;
        param[field] = this.data[list][e.detail.value].id
        for (let i in this.data) {
            if (i === name) {
                this.setData({
                    [name]: this.data[list][e.detail.value].name,
                    param
                })
            }
        }
    },

    // 选择图片
    chooseImage(e) {
        let that = this
        let index = e.currentTarget.dataset.index
        let field = e.currentTarget.dataset.field
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album','camera'],
            success: function (res) {
                if (field === 'images') {
                    let images = that.data.images
                    if (images.length < 6 && images.length - 1 === Number(index)) {
                        images.push('')
                    }
                    images[index] = res.tempFilePaths[0]
                    that.setData({images, 'param.images': 1})
                } else {
                    that.setData({[field]: res.tempFilePaths[0], 'param.thumb_image': 1})
                }
            },
        })
    },

    // 验证数据 上传图片
    onSubmit: function () {
        let that = this
        that.setData({onAsync: true})
        if (!this.validate.checkForm(that.data.param)) {
            let error = this.validate.errorList[0]
            wx.showToast({title: error.msg, icon: "none"})
            that.setData({onAsync: false})
            return false
        }
        wx.showLoading({title: '上传图片中'})
        let token = getApp().globalData.token.toString()
        if (that.data.update) {
            if (that.data.thumb_image.indexOf('https://') === -1) {
                util.wxUploads('index/upload', token, that.data.thumb_image, util.wxUploads, function (e) {
                    that.setData({'param.thumb_image': e})
                    let images = that.data.images
                    images.pop()
                    let temp = []
                    let temp_ = []
                    for (let i of images) {
                        if (i.indexOf('https://') === -1) {
                            temp.push(i)
                        } else {
                            temp_.push('/uploads/' + i.split('/uploads/')[1])
                        }
                    }
                    if (temp.length === 0) {
                        let param = that.data.param
                        delete param.images
                        that.setData({param})
                        that.ajax(that.data.param)
                    } else {
                        util.wxUploads('index/upload', token, temp, util.wxUploads, function (e) {
                            for (let i of temp_) {
                                e.push(i)
                            }
                            that.setData({'param.images': e.join(',')})
                            that.ajax(that.data.param)
                        })
                    }
                })
            } else {
                let param = that.data.param
                delete param.thumb_image
                that.setData({param})
                let images = that.data.images
                images.pop()
                let temp = []
                let temp_ = []
                for (let i of images) {
                    if (i.indexOf('https://') === -1) {
                        temp.push(i)
                    } else {
                        temp_.push('/uploads/' + i.split('/uploads/')[1])
                    }
                }
                if (temp.length === 0) {
                    param = that.data.param
                    delete param.images
                    that.setData({param})
                    that.ajax(that.data.param)
                } else {
                    util.wxUploads('index/upload', token, temp, util.wxUploads, function (e) {
                        let images = []
                        for (let i of temp_) {
                            e.push(i)
                        }
                        for(let i of e){
                            if(i!=='')images.push(i)
                        }
                        that.setData({'param.images': images.join(',')})
                        that.ajax(that.data.param)
                    })
                }
            }
        } else {
            util.wxUploads('index/upload', token, that.data.thumb_image, util.wxUploads, function (e) {
                that.setData({'param.thumb_image': e})
                util.wxUploads('index/upload', token, that.data.images, util.wxUploads, function (e) {
                    let images = []
                    for(let i of e){
                        if(i!=='')images.push(i)
                    }
                    that.setData({'param.images': images.join(',')})
                    that.ajax(that.data.param)
                })
            })
        }
    },

    ajax: function (param) {
        let that = this
        let url = that.data.update ? 'Good/putGood' : 'Good/postGood';
        that.data.update ? param = {id: param.id, shop_id: param.shop_id, data: JSON.stringify(param)} : ''
        // 提交数据
        util.wxRequest(url, param, res => {
            wx.showModal({
                title: '温馨提示',
                content: res.msg,
                showCancel: false,
                success() {
                    wx.navigateBack()
                }
            })
        },()=>{},()=>{
            wx.hideLoading()
        })
    },

    // 初始化验证器
    initValidate: function () {
        const rules = {
            shop_category_id: {required: true},
            name: {required: true},
            original: {required: true},
            price: {required: true},
            stock: {required: true},
            short: {required: true},
            content: {required: true},
            thumb_image: {required: true},
            images: {required: true},
        }
        const messages = {
            shop_category_id: {required: '请选择分类'},
            name: {required: '请输入商品名称'},
            original: {required: '请输入商品原价'},
            price: {required: '请输入商品售价'},
            stock: {required: '请输入商品库存'},
            thumb_image: {required: '请选择商品缩略图'},
            images: {required: '至少上传一张图片'},
            short: {required: '请输入简介,简介在分享时展示'},
            content: {required: '请输入详情,详情可在PC端编辑'},
        }

        this.validate = new WxValidate(rules, messages)
    },
})