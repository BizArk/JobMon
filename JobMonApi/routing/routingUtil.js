module.exports = (function(){
    function findDocByID(model, paramName, missingMsg) {
        return function(req, res, next) {
            model.findById(req.params[paramName])
                .exec(function(err, obj) {
                    if(err) 
                        res.status(500).send(err);
                    else if (obj) {
                        req.data = obj;
                        next();
                    } else {
                        res.status(404).send(missingMsg || 'Unable to find document.');
                    }                        
                });
        }
    }

    return {
        findDocByID: findDocByID
    }
})();