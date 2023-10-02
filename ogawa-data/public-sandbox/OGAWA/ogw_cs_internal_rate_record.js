/**
 * 社内レートTBLレコード
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/05/19       CPC_宋
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	if(name == 'custrecord_ogw_internal_accounting_perio'){
		var monthString = '';
		var accountingPerio = nlapiGetFieldText('custrecord_ogw_internal_accounting_perio');
		if(!isEmpty(accountingPerio)){
			var accountingPerioSplit = accountingPerio.split(':');
			var dateString = accountingPerioSplit[accountingPerioSplit.length-1];
			var dateStringSplit  = dateString.split(' ');
			var yearString = dateStringSplit[dateStringSplit.length-1];
			var monthValue = dateStringSplit[dateStringSplit.length-2];
			if(monthValue == 'Jan'){
				monthString = '1';
			}else if(monthValue == 'Feb'){
				monthString = '2';
			}else if(monthValue == 'Mar'){
				monthString = '3';
			}else if(monthValue == 'Apr'){
				monthString = '4';
			}else if(monthValue == 'May'){
				monthString = '5';
			}else if(monthValue == 'Jun'){
				monthString = '6';
			}else if(monthValue == 'Jul'){
				monthString = '7';
			}else if(monthValue == 'Aug'){
				monthString = '8';
			}else if(monthValue == 'Sep'){
				monthString = '9';
			}else if(monthValue == 'Oct'){
				monthString = '10';
			}else if(monthValue == 'Nov'){
				monthString = '11';
			}else if(monthValue == 'Dec'){
				monthString = '12';
			}
			var dateValue = yearString+"-"+monthString;
			nlapiSetFieldValue('custrecord_ogw_internal_year_month', dateValue);
		}
	}
	
	if(name == 'custrecord_ogw_internal_rate_currency'){
		var rateCurrency = nlapiGetFieldValue('custrecord_ogw_internal_rate_currency');
		if(!isEmpty(rateCurrency)){
			if(rateCurrency == '1' || rateCurrency == '8' || rateCurrency == '11'){
				nlapiSetFieldValue('custrecord_ogw_internal_rate', 1);
				nlapiDisableField('custrecord_ogw_internal_rate', true);
			}else{
				nlapiSetFieldValue('custrecord_ogw_internal_rate', '');
				nlapiDisableField('custrecord_ogw_internal_rate', false);
			}
		}
	}
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

