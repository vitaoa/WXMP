//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');

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
        circles: [],
        location: '',
        city: '',
        district: '',
        streetInfo: '',
        today: "",
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {
        var _this = this;
        //更新当前日期
        app.globalData.day = util.formatTime(new Date()).split(' ')[0];
        _this.setData({
            today: app.globalData.day
        });
        //定位当前城市
        _this.getLocation();
        console.log(_this.data);
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
            success: function (res) {
                console.log(res);
                var jquery = wx.createSelectorQuery().select("#dif_map").boundingClientRect();
                jquery.exec(function (e) {
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
                    data: {},
                    header: {
                        'Content-Type': 'application/json'
                    },
                    success: function (res) {
                        console.log("==============");
                        console.log(res);
                        _this.setData({
                            city: res.data.result.addressComponent.city,
                            district: res.data.result.addressComponent.district,
                            streetInfo: res.data.result.addressComponent.street + res.data.result.addressComponent.street_number,
                        })
                        app.globalData.defaultCity = app.globalData.defaultCity ? app.globalData.defaultCity : res.data.result.addressComponent.city;
                        app.globalData.defaultCounty = app.globalData.defaultCounty ? app.globalData.defaultCounty : res.data.result.addressComponent.country;
                        _this.setData({
                            location: app.globalData.defaultCity,
                            county: app.globalData.defaultCounty
                        });
                        _this.getWeather();
                        _this.getAir();
                    },
                    fail: function () {
                        _this.setData({
                            currentCity: "获取定位失败"
                        })
                    }
                })
            },
        })
    },
    //获取天气
    getWeather: function (e) {
        var length = this.data.location.length;
        var city = this.data.location.slice(0, length - 1); //分割字符串
        console.log(city);
        var that = this;
        var param = {
            key: app.globalData.heWeatherKey,
            location: city
        };
        //发出请求
        wx.request({
            url: app.globalData.heWeatherBase + "/s6/weather",
            data: param,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                app.globalData.weatherData = res.data.HeWeather6[0].status == "unknown city" ? "" : res.data.HeWeather6[0];
                var weatherData = app.globalData.weatherData ? app.globalData.weatherData.now : "暂无该城市天气信息";
                var dress = app.globalData.weatherData ? res.data.HeWeather6[0].lifestyle[1] : { txt: "暂无该城市天气信息" };
                that.setData({
                    weatherData: weatherData, //今天天气情况数组 
                    dress: dress //生活指数
                });
            }
        })
    },
    //获取当前空气质量情况
    getAir: function (e) {
        var length = this.data.location.length;
        var city = this.data.location.slice(0, length - 1);
        var that = this;
        var param = {
            key: app.globalData.heWeatherKey,
            location: city
        };
        wx.request({
            url: app.globalData.heWeatherBase + "/s6/air/now",
            data: param,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                app.globalData.air = res.data.HeWeather6[0].status == "unknown city" ? "" : res.data.HeWeather6[0].air_now_city;
                that.setData({
                    air: app.globalData.air
                });
            }
        })
    },
    changePosition: function () {
        wx.reLaunch({
            url: '../switchcity/switchcity'
        });
    }
})
