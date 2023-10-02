/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/02/08     CPC_‘v
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */

var so_ogj_custForm = '244'

function clientFieldChanged(type, name, linenum){
//	if(name == 'custbody_ogw_contract_start_date' || name == 'custbody_ogw_contract_end_date'){
//		
//	}
}

function getOgawaDate(str) {
	 var etaJp = nlapiStringToDate(str);
	 var etaJp_year = etaJp.getFullYear();
	 var etaJp_month = etaJp.getMonth()+1;
	 var etaJp_day = etaJp.getDate();
	 date = etaJp_year + '/' + etaJp_month + '/' + etaJp_day;
	 return date;
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
