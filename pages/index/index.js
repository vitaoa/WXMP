//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        hasLocation: false,
        scale: 18,
        latitude: "",
        longitude: "",
        markers: [],
        circles: []
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {
        var _this = this;
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        };
        wx.getSystemInfo({
            success: function(res) {
                console.log(res);
                var jquery = wx.createSelectorQuery().select("#dif_map").boundingClientRect();
                jquery.exec(function(e){
                    _this.setData({
                        view: {
                            Height: res.windowHeight - e[0].height
                        }
                    });
                })
            },
        })
    },
    getUserInfo: function (e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
    //定位当前城市
    getLocation: function () {
        var _this = this;
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                console.log(res);
                //当前的经度和纬度
                _this.setData({
                    latitude: res.latitude,
                    longitude: res.longitude,
                    hasLocation: true,
                    markers: [{
                        id: "1",
                        latitude: res.latitude,
                        longitude: res.longitude,
                        width: 50,
                        height: 50,
                        iconPath: "/images/location.png",
                        title: "哪里"
                    }],
                    circles: [{
                        latitude: res.latitude,
                        longitude: res.longitude,
                        color: '#FF0000DD',
                        fillColor: '#7cb5ec88',
                        radius: 100,
                        strokeWidth: 1
                    }]
                });
                wx.request({
                    url: 'https://api.map.baidu.com/geocoder/v2/?ak=' + app.globalData.baiduMapKey + '&location=' + res.latitude + ',' + res.longitude + '&output=json',
                    data:{},
                    header:{
                        'Content-Type':'application/json'
                    },
                    success:function(res){
                        console.log(res);
                        _this.setData({
                            currentCity: res.data.result.formatted_address
                        })
                    },
                    fail:function(){
                        _this.setData({
                            currentCity:"获取定位失败"
                        })
                    }
                })
            },
        })
    }
})
