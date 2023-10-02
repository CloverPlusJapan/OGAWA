/**
 * 購入契約書UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/02/23     CPC_宋
 *
 */


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
	 if(type == 'delete'){
	        return;
	 }
		 var startDate=nlapiGetFieldValue('custbody_ogw_contract_start_date');
		 var endDate=nlapiGetFieldValue('custbody_ogw_contract_end_date');
		 if(!isEmpty(startDate) && !isEmpty(endDate)){
			var newStartDate = getOgawaDate(startDate);
			var newEndDate = getOgawaDate(endDate);
			if(newEndDate <= newStartDate){
				throw nlapiCreateError('システムエラー', '契約終了日は契約開始日より後である必要があります。');
				return false;
			}
		 }
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