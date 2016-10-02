var debug = require('debug')('jobmon.route.util')

module.exports = (function () {
    function findDocByID(model, paramName, missingMsg) {
        return function (req, res, next) {
            debug(model.collection.name + '.findDocByID(' + req.params[paramName] + ')');
            model.findById(req.params[paramName])
                .exec(function (err, obj) {
                    if (err) {
                        err = toStandardErr(err);
                        res.status(400).json(err);
                    } else if (obj) {
                        req.data = obj;
                        next();
                    } else {
                        //debug('Doc not found');
                        res.status(404).send(missingMsg || 'Unable to find document.');
                    }
                });
        }
    }

    function queryData(req, model, fn) {

        var qstr = req.query.q;
        var query = null;
        if (qstr) {
            query = JSON.parse(qstr);
        }

        if (query) {
            model.find(query, function(err, data) {
                queryDataResults(err, data, fn);
            });
        } else {
            model.find(function(err, data) {
                queryDataResults(err, data, fn);
            });
        }

    }

    function queryDataResults(err, data, fn) {
        if (err) {
            err = routingUtil.toStandardErr(err);
            return res.status(400).json(err);
        }

        var retData = fn(data);        

    }

    function saveResponse(res, successStatus, successReturn) {
        function saveCallback(err) {
            if (err) {
                err = toStandardErr(err);
                res.status(400).json(err);
            } else {
                //debug(arguments);
                res.status(successStatus).json(successReturn);
            }
        }

        return saveCallback;
    }

    function toStandardErr(err) {
        ///<summary>Use the standard error format.</summary>
        ///<param name="err">The original error object.</param>

        if (!err) return;

        if (typeof err === 'String') {
            return {
                message: err,
                name: 'Error'
            };
        }

        if (err.message) {
            // From Mongoose or MongoDB. The original format is correct, 
            // then they serialize it to an invalid format.  
            if (err.toJSON) {
                return {
                    message: err.message,
                    name: 'MongoDB',
                    code: err.code
                }
            }

            return err;
        }

        if (err.errmsg) {
            return {
                message: err.errmsg,
                name: 'MongoDB',
                code: err.code
            };
        }

        debug('Unable to convert to standard error object.');
        debug(err);
        return err;
    }

    return {
        findDocByID: findDocByID,
        queryData: queryData,
        saveResponse: saveResponse,
        toStandardErr: toStandardErr
    }
})();
