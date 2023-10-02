	
/**
 * 社内レートTBL共通CS
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/05/19      CPC_宋
 *
 */


var vendorbill_ogj_form = '248';

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */


function rateClientFieldChanged(type, name, linenum){
	try{
		if(name == 'postingperiod'){
			var check = formCheck();
			if(check){
				var dateValue = getDateValue();
				if(!isEmpty(dateValue)){
					var currency = nlapiGetFieldValue('currency');
					setRateTbl(dateValue,currency);
				}
			}
		}
		
//		if(name == 'custbody_ogw_year_month'){
//			var check = formCheck();
//			if(check){
//				var dateValue = nlapiGetFieldValue('custbody_ogw_year_month');
//				if(!isEmpty(dateValue)){
//					var currency = nlapiGetFieldValue('currency');
//			    	if(!isEmpty(currency)){
//			    		setRateTbl(dateValue,currency);
//			    	}
//				}
//			}
//		}
		
		//為替レート
		if(name == 'exchangerate'){
			var check = formCheck();
			if(check){
				var customExchangerate = nlapiGetFieldValue('custbody_ogw_exchangerate');
				var itemCount = nlapiGetLineItemCount('item');
				for(var i = 1 ; i < itemCount + 1 ; i ++){
					nlapiSelectLineItem('item', i);
					if(!isEmpty(nlapiGetLineItemValue('item','item', i))){
						var rate = nlapiGetLineItemValue('item','rate', i);
						nlapiSetCurrentLineItemValue('item', 'custcol_ogw_exchange_rate',customExchangerate);
					}
					nlapiCommitLineItem('item');
				}
			}
		}
		
		
		if(name == 'custbody_ogw_internal_rate_tbl'){
			var check = formCheck();
			if(check){
				var rateTblId = nlapiGetFieldValue('custbody_ogw_internal_rate_tbl');
				if(!isEmpty(rateTblId)){
					var exchange = nlapiLookupField('customrecord_ogw_internal_rate_tbl', rateTblId, 'custrecord_ogw_internal_rate');
				}else{
					var exchange = nlapiGetFieldValue('exchangerate');
				}
				var itemCount = nlapiGetLineItemCount('item');
				for(var i = 1 ; i < itemCount + 1 ; i ++){
					nlapiSelectLineItem('item', i);
					if(!isEmpty(nlapiGetLineItemValue('item','item', i))){
						//line - 為替レート
						nlapiSetCurrentLineItemValue('item', 'custcol_ogw_exchange_rate',exchange);
					}
					nlapiCommitLineItem('item');
				}
			}
		}
			
		if(name == 'custcol_ogw_exchange_rate'){
			var check = formCheck();
			if(check){
				if(!isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))){	
					var rate = parseInt(nlapiGetCurrentLineItemValue('item', 'custcol_ogw_rate_count'));
					var exchangeRate = nlapiGetCurrentLineItemValue('item', 'custcol_ogw_exchange_rate');
					var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');
					if(!isEmpty(rate)){
						var ratePrinting = Number(rate * exchangeRate);
						if(!isEmpty(ratePrinting)){
							//set-単価(印刷用）
							nlapiSetCurrentLineItemValue('item', 'custcol_ogw_unit_printing',ratePrinting,false,true);
							var amountPrinting = Number(ratePrinting*quantity);
							if(!isEmpty(amountPrinting)){
								//set-総額(印刷用） 
								nlapiSetCurrentLineItemValue('item', 'custcol_ogw_amount_printing',amountPrinting,false,true);
							}
						}
					}
				}
			}
		}
			
	}catch(e){
		
	}	
}

function clientSaveRecord() {
	try{
		var itemCount = nlapiGetLineItemCount('item');
		for(var i = 1 ; i < itemCount + 1 ; i ++){
			nlapiSelectLineItem('item', i);
			if(!isEmpty(nlapiGetLineItemValue('item','item', i))){
				if(isEmpty(nlapiGetLineItemValue('item','location', i))){
					alert("明細な場所を選択してください");
					return false;
				}else{
					return true;
				}
			}
			nlapiCommitLineItem('item');
		}
	}catch(e){
		
	}
}


function setRateTbl(dateValue,currency){				// set header - 独自レートTBL/為替レート
	try{
		 if(!isEmpty(dateValue)){
			 if(nlapiGetFieldValue('custbody_ogw_year_month') != dateValue || isEmpty(nlapiGetFieldValue('custbody_ogw_year_month'))){
//				 nlapiSetFieldValue('custbody_ogw_year_month', dateValue);
			 }
			 var filit = new Array();
			 filit.push(["custrecord_ogw_internal_year_month","is",dateValue]);
			 filit.push("AND");
			 filit.push(["custrecord_ogw_internal_rate_currency","is",currency]);
			 filit.push("AND");
			 filit.push(["isinactive","is",'F']);
			 var rateSearch = getSearchResults("customrecord_ogw_internal_rate_tbl",null,
					 filit, 
					[
					   new nlobjSearchColumn("internalid"), 
					   new nlobjSearchColumn("custrecord_ogw_internal_rate"), 
					]
					);
			 if(!isEmpty(rateSearch)){
				 if(!isEmpty(rateSearch[0].getValue("internalid"))){
					 nlapiSetFieldValue('custbody_ogw_internal_rate_tbl', rateSearch[0].getValue("internalid"));
				 }
			 }
		 } 
	}catch(e){
		
	}
}

function getDateValue() {
	var monthString = '';
	var accountingPerio = nlapiGetFieldText('postingperiod');
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
		return dateValue;
	}
}

function formCheck() {
	var customform = nlapiGetFieldValue('customform');
	if(customform == vendorbill_ogj_form){
		return true;
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

function defaultEmpty(src){
	return src || " ";
}

