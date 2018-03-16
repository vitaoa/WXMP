
const city = require('../../utils/city.js');
const area = require('../../utils/area.js');
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchLetter: [],
        showLetter: "",
        winHeight: 0,
        cityList: [],
        isShowLetter: false,
        scrollTop: 0,//置顶高度
        scrollTopId: '',//置顶id
        city: "定位中",
        currentCityCode: '',
        hotcityList: [{ cityCode: 110000, city: '北京市' }, { cityCode: 310000, city: '上海市' }, { cityCode: 440100, city: '广州市' }, { cityCode: 440300, city: '深圳市' }, { cityCode: 330100, city: '杭州市' }, { cityCode: 320100, city: '南京市' }, { cityCode: 420100, city: '武汉市' }, { cityCode: 120000, city: '天津市' }, { cityCode: 610100, city: '西安市' },],
        commonCityList: [{ cityCode: 110000, city: '北京市' }, { cityCode: 310000, city: '上海市' }],
        countyList: [{ cityCode: 110000, county: 'A区' }, { cityCode: 310000, county: 'B区' }, { cityCode: 440100, county: 'C区' }, { cityCode: 440300, county: 'D区' }, { cityCode: 330100, county: 'E县' }, { cityCode: 320100, county: 'F县' }, { cityCode: 420100, county: 'G县' }],
        inputName: '',
        completeList: [],
        county: '',
        condition: false,
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const searchLetter = city.searchLetter;
        const cityList = city.cityList();
        const sysInfo = wx.getSystemInfoSync();
        const winHeight = sysInfo.windowHeight;
        const itemH = winHeight / searchLetter.length;
        let tempArr = [];
        searchLetter.map(
            (item, index) => {
                let temp = {};
                temp.name = item;
                temp.tHeight = index * itemH;
                temp.bHeight = (index + 1) * itemH;
                tempArr.push(temp)
            }
        );
        this.setData({
            winHeight: winHeight,
            itemH: itemH,
            searchLetter: tempArr,
            cityList: cityList
        });
        this.getLocation();
    },

    //选择城市
    bindCity: function (e) {
        console.log(e.currentTarget)
        this.setData({
            condition: true,  //选择区县修改为true
            city: e.currentTarget.dataset.city,
            currentCityCode: e.currentTarget.dataset.code,
            scrollTop: 0,
            completeList: [],
        })
        this.selectCounty() //获取当前城市的区名称
        app.globalData.defaultCity = this.data.city
        app.globalData.defaultCounty = ''
    },
    //设置当前区域
    bindCounty: function (e){
        this.setData({ 
            county: e.currentTarget.dataset.city 
        })
        app.globalData.defaultCounty = this.data.county
        wx.redirectTo({
            url: '../index/index'
        })
    },
    //定位当前城市的函数
    getLocation: function () {
        this.setData({
            county: ''
        })
        const that = this;
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                //当前的经度和纬度
                let latitude = res.latitude
                let longitude = res.longitude
                wx.request({
                    url: 'https://api.map.baidu.com/geocoder/v2/?ak=' + app.globalData.baiduMapKey + '&location=' + res.latitude + ',' + res.longitude + '&output=json',
                    success: res => {
                        console.log(res.data);
                        that.setData({
                            city: res.data.result.addressComponent.city,
                            currentCityCode: res.data.result.addressComponent.adcode,
                            county: res.data.result.addressComponent.district
                        })
                    }
                })
            }
        })
    },
    //获取当前选择城市的区县
    selectCounty: function () {
        let code = this.data.currentCityCode
        const that = this;
        wx.request({
            url:"https://apis.map.qq.com/ws/district/v1/getchildren?&id="+code+"&key="+app.globalData.tencentMapKey ,
            success: function (res) {
                console.log(res);
                that.setData({
                    countyList: res.data.result[0],
                })
            },
            fail: function () {
                console.log("请求区县失败，请重试");
            }
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    //重新定位城市
    reGetLocation: function () {
        app.globalData.defaultCity = this.data.city
        app.globalData.defaultCounty = this.data.county
        //返回首页
        wx.redirectTo({
            url: '/pages/index/index',
        })
    },
})