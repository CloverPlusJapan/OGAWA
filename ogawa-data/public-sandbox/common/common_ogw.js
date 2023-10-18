/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', "N/ui/dialog", "N/format", 'N/error', 'N/email', 'N/runtime', 'N/query'],
function(search, record, dialog, format, error, email, runtime, query) {
	
	function getTokyoDate(format, isHourMm){
		let fdate = getJapanDate();
		let year = fdate.getFullYear();
		let month = npad(fdate.getMonth() + 1);
		let day = npad(fdate.getDate());
		let hour = fdate.getHours();
		let minute = fdate.getMinutes();
		let second = fdate.getSeconds();
		if (isHourMm) {
			return '' + year + month + day + hour + minute + second;
		} else {
			return '' + year + month + day;
		}
	}

	function getJapanDate() {
		let now = new Date();
		let offSet = now.getTimezoneOffset();
		let offsetHours = 9 + (offSet / 60);
		now.setHours(now.getHours() + offsetHours);
		return now;
	}

	function npad(v) {
		if (v >= 10) {
			return v;
		} else {
			return '0' + v;
		}
	}
	
	function getAllResults(mySearch){
		var resultSet = mySearch.run();
		var resultArr= [];
		var start = 0;
		var step  = 1000;
		var results = resultSet.getRange({
      	    start: start, 
      	    end: step
      	});
		while(results && results.length>0)
		{
			resultArr = resultArr.concat(results);
			start = Number(start)+Number(step); 
			results = resultSet.getRange({
				start: start,
				end: Number(start)+Number(step)
				});
		}
		return resultArr;
	}
	
	function paramsDate(date) {
        if (typeof (date) == 'string') return date;
        YYYY = date.getFullYear() + "";
        MM = (date.getMonth() + 1)
        MM = MM < 10 ? "0" + MM : MM;
        DS = date.getDate()
        DS = DS < 10 ? "0" + DS : DS;
        return YYYY +"/"+ MM +"/"+ DS
    }
	
	function isEmpty(obj) {
	    if (obj === undefined || obj == null || obj === '') {
	        return true;
	    }
	    if (obj.length && obj.length > 0) {
	        return false;
	    }
	    if (obj.length === 0) {
	        return true;
	    }
	    for ( var key in obj) {
	        if (hasOwnProperty.call(obj, key)) {
	            return false;
	        }
	    }
	    if (typeof (obj) == 'boolean') {
	        return false;
	    }
	    if (typeof (obj) == 'number') {
	        return false;
	    }
	    return true;
	}
	
    function toThousands(num){
        return (num||0).toString().replace(/(\d)(?=(?:\d{3})+$)/g,'$1,');
    }
    
    function formatPdfDate1(strDate) {

        var fdate = format.parse({
            type : format.Type.DATE,
            value : strDate
        });

        var year = fdate.getFullYear();
        var month = npad(fdate.getMonth() + 1);
        var day = npad(fdate.getDate());

        return year + '/' + month + '/' + day;
    }
	
    return {
    	getTokyoDate : getTokyoDate,
    	getJapanDate : getJapanDate,
    	getAllResults : getAllResults,
    	isEmpty : isEmpty,
    	paramsDate : paramsDate,
    	toThousands : toThousands,
    	formatPdfDate1 : formatPdfDate1,
    	
    };
});