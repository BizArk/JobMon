var debug = require('debug')('jobmon.route.util')
var url = require('url');

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

    function queryData(req, model, fn, sanitize) {

        var qstr = req.query.q;
        var select = req.query.select;
        var criteria = null;
        var sort = req.query.sort;
        var page = Number(req.query.page || 1);
        var pageSize = Math.min(Number(req.query.pageSize || 50), 1000);
        var query;
        var countQuery;

        if (qstr) {
            criteria = JSON.parse(qstr);
        }

        // Allow the criteria to be sanitized before querying.
        if (sanitize)
            criteria = sanitize(criteria);

        if (criteria) {
            query = model.find(criteria);
            countQuery = model.find(criteria);
        } else {
            query = model.find();
            countQuery = model.find();
        }

        if (select)
            query.select(select);
        if (sort)
            query.sort(sort);

        countQuery.count().exec(function (err, count) {

            query
                .limit(pageSize)
                .skip((page - 1) * pageSize)
                .exec(function (err, data) {
                    if (err) {
                        err = toStandardErr(err);
                        return res.status(400).json(err);
                    }

                    var url = getUrl(req);
                    var prev = null;
                    var prevQs = Object.assign({}, req.query);
                    var next = null;
                    var nextQs = Object.assign({}, req.query);

                    if (page > 1) {
                        prevQs.page = page - 1;
                        prev = getUrl(req, prevQs);
                    }

                    if ((((page - 1) * pageSize) + pageSize) < count) {
                        nextQs.page = page + 1;
                        next = getUrl(req, nextQs);
                    }

                    var response = {
                        data: data,
                        page: page,
                        pageSize: pageSize,
                        total: count,
                        links: {
                            prev: prev,
                            next: next
                        }
                    };

                    fn(response);
                });

        });

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

    function getUrl(req, qs) {
        var host = req.headers.host;
        var idx = host.indexOf(':');
        var port = 80;
        var path = req.originalUrl;

        if (idx > 0)
            port = host.substr(idx + 1);

        idx = path.indexOf('?');
        if (idx > 0)
            path = path.substr(0, idx);

        return url.format({
            protocol: req.protocol,
            hostname: req.hostname,
            pathname: path,
            port: port,
            query: qs
        });
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
