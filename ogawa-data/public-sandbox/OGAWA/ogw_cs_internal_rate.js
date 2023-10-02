
/**
 * �Г����[�gTBL_CS_����&�w���_��
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/05/19      CPC_�v
 *
 */


var po_ogj_form = '243'; //������
var purchasecontract_ogj_fomr = '247';//�w���_��
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function rateClientPageInit(type){
	try{
		if(type == 'create'){
			var purTypeCheck = purCheck();
			if(purTypeCheck){
				var result = formAndTypeCheck();
				if(result){
					var trandate = nlapiGetFieldValue('trandate');//���t
				    if(!isEmpty(trandate)){
				    	setDateValue(trandate);
				    }
				}
			}
		}
	}catch(e){
		
	}
}



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
		// ���t
		if(name == 'trandate'){
			var purTypeCheck = purCheck();
			if(purTypeCheck){
				var result = formAndTypeCheck();
				if(result){
					var trandate = nlapiGetFieldValue('trandate');
				    if(!isEmpty(trandate)){
				    	setDateValue(trandate);
				    }
				}
			}
		}
		//�N-�� & �ʉ� & �d����
		if(name == 'custbody_ogw_year_month' || name == 'currency' || name == 'entity'){
			var purTypeCheck = purCheck();
			if(purTypeCheck){
				var result = formAndTypeCheck();
				if(result){
					var dateValue = nlapiGetFieldValue('custbody_ogw_year_month');
				    if(!isEmpty(dateValue)){
				    	var currency = nlapiGetFieldValue('currency');
				    	if(!isEmpty(currency)){
				    		setRateTbl(dateValue,currency);
				    	}
				    }
				}
			}
		}
		
		
		//�בփ��[�g
		if(name == 'exchangerate'){
			var purTypeCheck = purCheck();
			if(purTypeCheck){
				var result = formAndTypeCheck();
				if(result){
					//custom - �בփ��[�g
					var customExchangerate = nlapiGetFieldValue('exchangerate');
					if(!isEmpty(customExchangerate)){
						//����
						var itemCount = nlapiGetLineItemCount('item');
						for(var i = 1 ; i < itemCount + 1 ; i ++){
							nlapiSelectLineItem('item', i);
							if(!isEmpty(nlapiGetLineItemValue('item','item', i))){
								//line - �בփ��[�g
								nlapiSetCurrentLineItemValue('item', 'custcol_ogw_exchange_rate',customExchangerate);
							}
							nlapiCommitLineItem('item');
						}
					}
				}
			}
		}
		
		//�Ǝ����[�gTBL
		if(name == 'custbody_ogw_internal_rate_tbl'){
			var purTypeCheck = purCheck();
			if(purTypeCheck){
				var result = formAndTypeCheck();
				if(result){
					var rateTblId = nlapiGetFieldValue('custbody_ogw_internal_rate_tbl');
					if(!isEmpty(rateTblId)){
						var exchange = nlapiLookupField('customrecord_ogw_internal_rate_tbl', rateTblId, 'custrecord_ogw_internal_rate');
					}else{
						var exchange = nlapiGetFieldValue('exchangerate');
					}
					//����
					var itemCount = nlapiGetLineItemCount('item');
					for(var i = 1 ; i < itemCount + 1 ; i ++){
						nlapiSelectLineItem('item', i);
						if(!isEmpty(nlapiGetLineItemValue('item','item', i))){
							//line - �בփ��[�g
							nlapiSetCurrentLineItemValue('item', 'custcol_ogw_exchange_rate',exchange);
						}
						nlapiCommitLineItem('item');
					}
				}
			}
		}
		
		
		
		//�A�C�e��  && �P��  && �Ǝ����[�g  && ���� && �w���_�� && �בփ��[�g
		if(name == 'item' || name == 'custcol_ogw_individual_rate' || name == 'quantity' || name == 'rate' || name == 'purchasecontract' || name == 'custcol_ogw_exchange_rate'){
			var purTypeCheck = purCheck();
			if(purTypeCheck){
				var result = formAndTypeCheck();
				if(result){
					var rateTblText = defaultEmpty(nlapiGetFieldText('custbody_ogw_internal_rate_tbl'));
					var rateTblId = nlapiGetFieldValue('custbody_ogw_internal_rate_tbl');
					if(!isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))){	
						if(!isEmpty(rateTblId)){
							var exchange = nlapiLookupField('customrecord_ogw_internal_rate_tbl', rateTblId, 'custrecord_ogw_internal_rate');
							nlapiSetCurrentLineItemValue('item', 'custcol_ogw_exchange_rate',exchange,false,true);	
						}else{
							var exchange = nlapiGetFieldValue('exchangerate');
							nlapiSetCurrentLineItemValue('item', 'custcol_ogw_exchange_rate',exchange,false,true);	
						}
						var rate = nlapiGetCurrentLineItemValue('item', 'rate');
						nlapiSetCurrentLineItemValue('item', 'custcol_ogw_individual_rate_printing',parseInt(rate)+""+rateTblText,false,true);
						var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');
						var ratePrinting = (rate * exchange);
						if(!isEmpty(ratePrinting) && !isNaN(ratePrinting)){
							nlapiSetCurrentLineItemValue('item', 'custcol_ogw_unit_printing',ratePrinting,false,true);
							var amountPrinting = parseInt(ratePrinting) *quantity;
							if(!isEmpty(amountPrinting) && !isNaN(amountPrinting)){
								nlapiSetCurrentLineItemValue('item', 'custcol_ogw_amount_printing',amountPrinting,false,true);
							}
						}
					}
				}
			}else{
				var individualRate = defaultEmpty(nlapiGetCurrentLineItemValue('item', 'custcol_ogw_individual_rate')); //�Ǝ����[�g
				var rate = parseInt(nlapiGetCurrentLineItemValue('item', 'rate')); //�P��
				nlapiSetCurrentLineItemValue('item', 'custcol_ogw_individual_rate_printing',rate+""+individualRate);//�Ǝ����[�g(����p)
			}
		}		
	}catch(e){
		
	}
}


function rateClientSaveRecord() {
	try{
		var itemCount = nlapiGetLineItemCount('item');
		for(var i = 1 ; i < itemCount + 1 ; i ++){
			nlapiSelectLineItem('item', i);
			if(!isEmpty(nlapiGetLineItemValue('item','item', i))){
				//line - �בփ��[�g
				nlapiSetCurrentLineItemValue('item', 'custcol_ogw_rate_count',nlapiGetLineItemValue('item','rate', i));
			}
			nlapiCommitLineItem('item');
		}
		
		return true;
	}catch(e){
		
	}
}

function setDateValue(date){	
	try{
		 var dateValue = nlapiStringToDate(date);
		 var year = dateValue.getFullYear();
		 var month = dateValue.getMonth()+1;
		 var dateValue = year+"-"+month;
		 if(!isEmpty(dateValue)){
			 if(nlapiGetFieldValue('custbody_ogw_year_month') != dateValue || isEmpty(nlapiGetFieldValue('custbody_ogw_year_month'))){
				 nlapiSetFieldValue('custbody_ogw_year_month', dateValue);
				 var itemCount = nlapiGetLineItemCount('item');
				 for(var i = 1 ; i < itemCount + 1 ; i ++){
					nlapiSelectLineItem('item', i);
					if(!isEmpty(nlapiGetLineItemValue('item','item', i))){
						var purchasecontractValue = nlapiGetCurrentLineItemValue('item', 'purchasecontract');
						if(!isEmpty(purchasecontractValue)){
							nlapiSetCurrentLineItemValue('item', 'purchasecontract',purchasecontract);
							nlapiCommitLineItem('item');
						}
					}
				 }
			 }
		 } 
	}catch(e){
		
	}
}


function setRateTbl(dateValue,currency){				// set header - �Ǝ����[�gTBL/�בփ��[�g
	try{
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
				]
				);
		 if(!isEmpty(rateSearch)){
			 if(!isEmpty(rateSearch[0].getValue("internalid"))){
				 nlapiSetFieldValue('custbody_ogw_internal_rate_tbl', rateSearch[0].getValue("internalid"));
			 }
		 }
	}catch(e){
		
	}
}


function formAndTypeCheck(){
	var customform = nlapiGetFieldValue('customform');
	var recordType = nlapiGetRecordType();
	if(!isEmpty(recordType) && !isEmpty(customform) && (recordType == 'purchaseorder' && customform == po_ogj_form) || (recordType == 'purchasecontract' && customform == purchasecontract_ogj_fomr)){
		return true;
	}else{
		return false;
	}
}

function purCheck(){
	var recordType = nlapiGetRecordType();
	if(recordType == 'purchasecontract'){
		return false;
	}else{
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

function defaultEmpty(src){
	return src || " ";
}

