/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/05/04   	  CPC_宋
 *
 */
var invoice_ogj_custForm = '246'
var vendorbill_ogj_custForm = '248'
	
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventAfterSubmit(type, form, request){
		try{
			if (type == 'delete') {
				return;
			}
			var recordType = nlapiGetRecordType();
			var recordId = nlapiGetRecordId();
			getTranid(recordType,recordId);
		}catch(e){
			nlapiLogExecution("debug", "e", e.message);
		}
}


// invocie と vendorbill採番
function getTranid(recordType,recordId){
	var newTranid = '';
	if(recordType == 'invoice'){
		var invoiceRecord = nlapiLoadRecord('invoice', recordId);
		var customform = invoiceRecord.getFieldValue('customform');//カスタム・フォーム 
		if(customform == invoice_ogj_custForm){
			var createdfrom = invoiceRecord.getFieldValue('createdfrom');//作成元
			var createdfromText = invoiceRecord.getFieldText('createdfrom');//作成元
			var soTranidText = createdfromText.split('#');
			var soTranid = soTranidText[1];
			if(!isEmpty(createdfrom)){
				var invoiceSearch  = getSearchResults("invoice",null,
						[
						   ["type","anyof","CustInvc"],  
						   "AND", 
						   ["createdfrom","anyof",createdfrom],
						   "AND", 
						   ["mainline","is","F"], 
						   "AND", 
						   ["taxline","is","F"]
						], 
						[
						   new nlobjSearchColumn("internalid"),
						]
						);
				if(!isEmpty(invoiceSearch)){
					var invoiceTranidArr= new Array();
					for(var j = 0;j<invoiceSearch.length;j++){
						var invoiceId = invoiceSearch[j].getValue("internalid");
						invoiceTranidArr.push(invoiceId);
					}
					var invoiceLeng = invoiceTranidArr.length;
					for(var k = 0; k < invoiceTranidArr.length; k++){
						var invId = invoiceTranidArr[k];
						if(invId == recordId){
							if(invoiceLeng == 1){
								newTranid = soTranid
							}else{
								if(k == 0){
									newTranid= soTranid
								}else{
									newTranid = soTranid+"-"+(k+1);
								}
							}
							nlapiLogExecution("debug", "invoice newTranid", invId+" "+newTranid);
//							invoiceRecord.setFieldValue('tranid', newTranid);
//							invoiceRecord.setFieldValue('otherrefnum', newTranid);
						}
					}
				}
			}
		}
	}else if(recordType == 'vendorbill'){
		var vendorbillRecord = nlapiLoadRecord('vendorbill', recordId);
		var customform = vendorbillRecord.getFieldValue('customform');//カスタム・フォーム 
		if(customform == vendorbill_ogj_custForm){
			var createdfrom = vendorbillRecord.getFieldValue('createdfrom');//作成元
			var createdfromText = vendorbillRecord.getFieldText('createdfrom');//作成元
			nlapiLogExecution("debug", "createdfrom", createdfrom);
			nlapiLogExecution("debug", "createdfromText", createdfromText);
			var poTranidText = createdfromText.split('#');
			var poTranid = poTranidText[1];
			if(!isEmpty(createdfrom)){
				var vendorbillSearch = getSearchResults("vendorbill",null,
						[
						   ["type","anyof","VendBill"],  
						   "AND", 
						   ["createdfrom","anyof",createdfrom],
						   "AND", 
						   ["mainline","is","F"], 
						   "AND", 
						   ["taxline","is","F"]
						], 
						[
						   new nlobjSearchColumn("internalid")
						]
						);
				if(!isEmpty(vendorbillSearch)){
				    var vendorTranidArr= new Array();
					for(var j = 0;j<vendorbillSearch.length;j++){
						var vendBillId = vendorbillSearch[j].getValue("internalid");
						vendorTranidArr.push(vendBillId);
					}
					var vendBillLeng = vendorTranidArr.length;
					for(var k = 0; k < vendorTranidArr.length; k++){
						var vendId = vendorTranidArr[k];
						if(vendId == recordId){
							if(vendBillLeng == 1){
								newTranid = poTranid
							}else{
								if(k == 0){
									newTranid = poTranid
								}else{
									newTranid = poTranid+"-"+(k+1);
								}
							}
							nlapiLogExecution("debug", "vendorbill newTranid", vendId+" "+newTranid);
						}
					}
				}
			}
		}
	}
}



/**
 * 検索からデータを取得する
 * 
 * @param strSearchType
 * @param filters
 * @param columns
 * @returns {Array}
 */
function getSearchResults(type, id, filters, columns) {
    var search = nlapiCreateSearch(type, filters, columns);

    // 検索し、結果を渡す
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

//change by song add 23030329 end


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