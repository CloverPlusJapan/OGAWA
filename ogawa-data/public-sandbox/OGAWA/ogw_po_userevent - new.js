/**
 * 発注書のUserEvent
 * PO UserEvent
 * Version    Date            Author           Remarks
 * 1.00       2023/01/11     
 *
 */

// SO-OGJ-カスタム・フォーム
var so_ogj_custForm = "239";

// PO-OGJ-カスタム・フォーム
var po_ogj_custForm = "243";

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
	form.setScript('customscript_ogw_po_client');
	if(type=='view'){
		var record =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
		var customform = record.getFieldValue('customform');
		if(customform == po_ogj_custForm){
			var flg = record.getFieldValue('custbody_ogw_po_sendmail');
			form.addButton('custpage_pdf', 'PDF作成', 'creatPdf();');
			if(flg != 'T'){
          			form.addButton('custpage_posendmail', '送信', 'poSendMail();');  
			}
		}
	}
}
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
	 try{
		 var itemArray= new Array();
		 var count=nlapiGetLineItemCount('item');
		 for(var i=1;i<count+1;i++){			 
			 var item=nlapiGetLineItemValue('item', 'item', i);
			 itemArray.push(item);			 
		 }
		 itemArray=unique(itemArray);
		 var subsidiary=nlapiGetFieldValue('subsidiary');//子会社
		 var entity=nlapiGetFieldValue('entity');//仕入先
		 var entityId=nlapiGetFieldValue('entity');//仕入先Id
		 var entityString = entity.toString();
		 var entityFirst = entityString.substr(0,1);
		 var entityfive = entityString.substr(0,5);
		 if(!isEmpty(subsidiary)&&!isEmpty(entityId)){
			 var inquiriesSearch = getSearchResults("customrecord_ogw_inquiries",null,
						[
						   ["custrecord_ogw_inquiries_subsidiary","anyof",subsidiary], 
						   "AND", 
						   ["custrecord_ogw_inquiries_vendor","anyof",entityId], 
						   "AND", 
						   ["custrecord_ogw_inquiries_item","anyof",item]
						], 
						[
						   new nlobjSearchColumn("custrecord_ogw_inquiries"),
						   new nlobjSearchColumn("custrecord_ogw_pdftemp"),
						]
						);
		 }
		 
	 }catch(e){
		 
	 }
	 
}

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
function userEventAfterSubmit(type, form, request) {
	try {
		if (type == 'delete') {
			return;
		}
		
		// PO
		var poRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
		
		// POカスタム・フォーム
		var poCustomform = poRecord.getFieldValue('customform'); 
		var soLineArr = new Array();
		
		// POカスタム・フォーム=OGJ
		if (poCustomform == po_ogj_custForm) {
			
			// 作成元
			var createdfrom = poRecord.getFieldValue('createdfrom'); 
			if (!isEmpty(createdfrom)) {
				
				// SO
				var soRecord = nlapiLoadRecord('salesorder', createdfrom);
				
				// SOカスタム・フォーム
				var soCustomform = soRecord.getFieldValue('customform');
				
				// SOカスタム・フォーム=OGJ
				if (soCustomform == so_ogj_custForm) {
					var soCount = soRecord.getLineItemCount('item');
					var poCount = poRecord.getLineItemCount('item');
					for (var i = 1; i < soCount + 1; i++) {
						
					    // 直送アイテム&& SO item line poid= PO id
						if (soRecord.getLineItemValue('item', 'createpo', i) == 'DropShip'
								&& soRecord.getLineItemValue('item', 'poid', i) == nlapiGetRecordId()) {
							
							// SO item line アイテム
							var soItem = soRecord.getLineItemValue('item','item', i);
							
							// SO item line 税金コード
							var soTaxcode = soRecord.getLineItemValue('item','taxcode', i);
							
							// SO item line 数量
							var quantity = soRecord.getLineItemValue('item','quantity', i); 
							
							// SO item line UNIT TYPE
							var custcol4 = soRecord.getLineItemValue('item','custcol4', i); 
							
							// SO item line Number
							var linNum = soRecord.getLineItemValue('item','custcol_number', i); 

							for (var j = 1; j < poCount + 1; j++) {
								if (poRecord.getLineItemValue('item', 'item', j) == soItem
										&& poRecord.getLineItemValue('item','quantity', j) == quantity
										&& poRecord.getLineItemValue('item','custcol4', j) == custcol4
										&& poRecord.getLineItemValue('item','custcol_number', j) == linNum) {

									poRecord.setLineItemValue('item','taxcode', j, soTaxcode);
									poRecord.commitLineItem('item');
								}
							}
						}
					}
					nlapiSubmitRecord(poRecord, false, true);
				}
			}
		}
	} catch (e) {
		nlapiLogExecution('debug', 'エラー', e.message);
	}
}

/**
 * 空値を判断
 * 
 * @param str
 *            対象
 * @returns 判断結果
 */
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
 * 重複データを削除する
 * 
 * @param array
 *            リスト
 * @returns リスト
 */
function unique(array) {
	var resultArr = new Array();
	var numberOBJ = {};
	for (var i = 0; i < array.length; i++) {
		if (!numberOBJ[array[i]]) {
			resultArr.push(array[i]);
			numberOBJ[array[i]] = 1;
		}
	}
	return resultArr;
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
