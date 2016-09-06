module.exports = (function () {
    function findDocByID(model, paramName, missingMsg) {
        return function (req, res, next) {
            model.findById(req.params[paramName])
                .exec(function (err, obj) {
                    if (err) {
                        err = toStandardErr(err);
                        res.status(400).json(err);
                    } else if (obj) {
                        req.data = obj;
                        next();
                    } else {
                        res.status(404).send(missingMsg || 'Unable to find document.');
                    }
                });
        }
    }

    function saveResponse(res, successStatus, successReturn) {
        function saveCallback(err) {
            if (err) {
                err = toStandardErr(err);
                res.status(400).json(err);
            } else {
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
            if(err.toJSON) {
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

        console.log('Unable to convert to standard error object.');
        console.log(err);
        return err;
    }

    return {
        findDocByID: findDocByID,
        saveResponse: saveResponse,
        toStandardErr: toStandardErr
    }
})();
