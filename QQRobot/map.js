//定义map    
function Map() {
    this.container = {};
}
//将key-value放入map中    
Map.prototype.put = function(key, value) {
    try {
        if (key != null && key != "")
            this.container[key] = value;
    } catch (e) {
        return e;
    }
};
 
//根据key从map中取出对应的value    
Map.prototype.get = function(key) {
    try {
        return this.container[key];
    } catch (e) {
        return undefined;
    }
};
 
//判断map中是否包含指定的key    
Map.prototype.containsKey = function(key) {
    try {
        for ( var p in this.container) {
            if (p == key)
                return true;
        }
        return false;
 
    } catch (e) {
        return undefined;
    }
 
}
 
//判断map中是否包含指定的value    
Map.prototype.containsValue = function(value) {
    try {
        for ( var p in this.container) {
            if (this.container[p] === value)
                return true;
        }
        return false;
 
    } catch (e) {
        return undefined;
    }
};
 
//删除map中指定的key    
Map.prototype.remove = function(key) {
    try {
        delete this.container[key];
    } catch (e) {
        return undefined;
    }
};
 
//清空map    
Map.prototype.clear = function() {
    try {
        delete this.container;
        this.container = {};
 
    } catch (e) {
        return undefined;
    }
};
 
//判断map是否为空    
Map.prototype.isEmpty = function() {
 
    if (this.keySet().length == 0)
        return true;
    else
        return false;
};
 
//获取map的大小    
Map.prototype.size = function() {
 
    return this.keySet().length;
}
 
//返回map中的key值数组    
Map.prototype.keySet = function() {
    var keys = new Array();
    for ( var p in this.container) {
        keys.push(p);
    }
 
    return keys;
}
 
//返回map中的values值数组    
Map.prototype.values = function() {
    var valuesArray = new Array();
    var keys = this.keySet();
    for (var i = 0; i < keys.length; i++) {
        valuesArray.push(this.container[keys[i]]);
    }
    return valuesArray;
}
 
//返回 map 中的 entrySet 对象
Map.prototype.entrySet = function() {
    var array = new Array();
    var keys = this.keySet();
    for (var i = 0; i < keys.length; i++) {
        array.push(keys[i],this.container[keys[i]]);
    }
    return array;
}
 