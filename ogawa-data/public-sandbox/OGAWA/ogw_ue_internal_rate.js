/**
 * �Г����[�gTBL����UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/05/19   	  CPC_�v
 *
 */

var po_ogj_form = '243'; //������
var vendorbill_ogj_form = '248'; // �x��������
var vendorpayment_ogj_form = '250'; // �o���[
var journalentry_ogj_form = '251';// �d��
var so_ogj_form = '244'; // ������
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */

function rateUserEventBeforeLoad(type, form, request){

}



function rateUserEventBeforeSubmit(type){

}


function rateUserEventAfterSubmit(type, form, request){
	try{
		var recordType = nlapiGetRecordType();
		var recordId = nlapiGetRecordId();
		if(recordType == 'purchaseorder'){
			var poRecord = nlapiLoadRecord('purchaseorder', recordId);
			var poCustomform = poRecord.getFieldValue('customform');
			if(recordType == 'purchaseorder' && poCustomform == po_ogj_form){
				setRateValue(poRecord);
			}
		}else if(recordType == 'vendorbill'){
			var billRecord = nlapiLoadRecord('vendorbill', recordId);
			var billCustomform = billRecord.getFieldValue('customform');
			if(recordType == 'vendorbill' && billCustomform == vendorbill_ogj_form){
				setRateValue(billRecord);
			}
		}	
	}catch(e){
		nlapiLogExecution("debug", "e", e.message);
	}
}


function setRateValue(record){
	if(!isEmpty(record)){
		var trandate = record.getFieldValue('trandate');
	    if(!isEmpty(trandate)){
		   	var dateValue = nlapiStringToDate(trandate);
			var year = dateValue.getFullYear();
			var month = dateValue.getMonth()+1;
			var dateValue = year+"-"+month;
			if(record.getFieldValue('custbody_ogw_year_month') != dateValue || isEmpty(record.getFieldValue('custbody_ogw_year_month'))){
				record.setFieldValue('custbody_ogw_year_month', dateValue);
			}
	    }
		var itemCount = record.getLineItemCount('item');
		for(var i = 1 ; i < itemCount + 1 ; i ++){
			var ratePrintTing = record.getLineItemValue('item','custcol_ogw_unit_printing', i);
			if(!isEmpty(ratePrintTing)){
				record.setLineItemValue('item', 'rate', i, ratePrintTing);
			}
		}
		nlapiSubmitRecord(record, false, true);
	}
}

/**
 * ��������f�[�^���擾����
 * 
 * @param strSearchType
 * @param filters
 * @param columns
 * @returns {Array}
 */
function getSearchResults(type, id, filters, columns) {
    var search = nlapiCreateSearch(type, filters, columns);

    // �������A���ʂ�n��
    var searchResult = search.runSearch();
    var maxCount = 0;
    var results = [];
  if(!isEmpty(searchResult)){
    var resultInfo;
    try{
    do {
        resultInfo = searchResult.getResults(maxCount, maxCount + 1000);
        if (!isEmpty(resultInfo)) {
            resultInfo.forEach(function(row) {
                results.push(row);
            });
        }
        maxCount += 1000;
    } while (resultInfo.length == 1000);
    }catch(e){}
   }
    return results;
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

function defaultEmpty(src){
	return src || " ";
}