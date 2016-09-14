"use strict";
var JMUtil = JMUtil || {};//namespace creation

JMUtil.isArray = function isArray(arr) {
    if (!arr)
        return false;

    var hasLength = arr.hasOwnProperty("length");
    var isString = typeof arr === 'string';

    if (isString || !hasLength) {
        return false; //empty array, because source is not array
    }
    return true;
}

JMUtil.flattenNode = function flattenNode(sourceArray, propertyName) {

    var result = [];

    if (JMUtil.isArray(sourceArray) === false) {
        return result; //empty array, because source is not array
    }

    for (var i = 0; i < sourceArray.length; i++) {
        var t = sourceArray[i][propertyName];
        if (t) {
            for (var j = 0; j < t.length; j++) {
                result.push(t[j]);
            }
        }
    }
    return result;
}

JMUtil.countUnique = function countUnique(source) {
    var result = {};

    if (JMUtil.isArray(source) === false) {
        return result;
    }


    for (var i = 0; i < source.length; i++) {
        var item = source[i];

        if (!result.hasOwnProperty(item)) {
            result[item] = 1;
        }
        else {
            result[item] += 1;
        }
    }
    console.log(result);
    return result;
}