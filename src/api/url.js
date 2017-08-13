
export default {

    getUrl : function (name) {
        return location.href;
    },

    getQueryParams : function () {

        let queryString = location.search;  //获取url中"?"符后的字串 
        let params = new Object();

        if (queryString.indexOf("?") != -1) {
            let str = queryString.substr(1);
            let strs = str.split("&");
            for (let i = 0; i < strs.length; i++) {
                params[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
            }
        }
        return params;
    }
}
