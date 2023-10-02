/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/03/22     CPC_y
 *
 */
var so_ogj_custForm = '244';
var OGS_Domestic_Sales_Order='120';
var OGS_ProForma_Invoice='123';
var OGS_Sales_Order	='118';

	
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
//	try{
//		var soCustform = nlapiGetFieldValue('customform');
//		if(soCustform == so_ogj_custForm){
//			if(type!='view'){
//	       setLineItemDisableType('item', 'createpo', 'hidden');
//			}
//		 }
//	}catch(e){}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit approve, reject,
 *            cancel (SO, ER, Time Bill, PO & RMA only) pack, ship (IF)
 *            markcomplete (Call, Task) reassign (Case) editforecast (Opp,
 *            Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type) {
	try{
		if (type == 'delete') {
			return;
		}
		var customform=nlapiGetFieldValue('customform');
		if(customform == so_ogj_custForm||customform == OGS_Domestic_Sales_Order ||customform == OGS_ProForma_Invoice||customform ==OGS_Sales_Order){ //OGJ/OGS
			var count=nlapiGetLineItemCount('item');
			for(var i=1;i<count+1;i++){	
				nlapiSelectLineItem('item', i);
				var povendor=nlapiGetCurrentLineItemValue('item', 'povendor');
				if(!isEmpty(povendor)){
					var povendorname=nlapiLookupField('vendor', povendor, 'altname');
					nlapiSetCurrentLineItemValue('item', 'custcol_ogw_vendorname', povendorname);
					nlapiCommitLineItem('item');
				}								
			}
		}
	}catch(e){
		nlapiLogExecution("debug", "e", e.message);
	}
}

//change by song add 23030329 start
function userEventAfterSubmit(type, form, request){
		try{
			if (type == 'delete') {
				return;
			}
			var soRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());	
			var customform = soRecord.getFieldValue('customform');//�J�X�^���E�t�H�[��
			if(customform == so_ogj_custForm){ //OGJ
				if(type == 'create'){
					var itemArray= new Array();
					var soCount = soRecord.getLineItemCount('item');//����������
					for(var i=1;i<soCount+1;i++){			 
						var item=soRecord.getLineItemValue('item', 'item', i);
						itemArray.push(item); //�A�C�e��
					}
					itemArray=unique(itemArray);
					var itemKey = {};
					var itemSearch = getSearchResults("item",null,
							[
							   ["internalid","anyof",itemArray]
							], 
							[
							   new nlobjSearchColumn("purchasedescription"), 
							   new nlobjSearchColumn("internalid")
							]
							);
					if(!isEmpty(itemSearch)){
						 for(var k = 0 ; k < itemSearch.length; k++){
							 var itemExplain = itemSearch[k].getValue("purchasedescription");//�w���̐���
							 var itemId = itemSearch[k].getValue("internalid");//����ID
							 
							 var itemExplainValue = new Array();
							 itemExplainValue.push(itemSearch[k].getValue("purchasedescription"));//�w���̐���
							 itemKey[itemId] = new Array();
							 itemKey[itemId].push(itemExplainValue);// key:itemID value:�w���̐���
						 }
					}
					for(var p=1;p<soCount+1;p++){
						soRecord.selectLineItem('item', p);
						var item = soRecord.getCurrentLineItemValue('item', 'item');//�A�C�e��ID
						var KeyValue = itemKey[item];
						var KeyValueString = KeyValue.toString();
						if(!isEmpty(KeyValueString)){
							soRecord.setCurrentLineItemValue('item', 'description',KeyValueString);//����
//							soRecord.setCurrentLineItemText('item', 'costestimate','5000');
//							soRecord.setCurrentLineItemValue('item', 'costestimaterate','5000');
//							soRecord.setCurrentLineItemValue('item', 'porate','70000');
						}
						soRecord.commitLineItem('item');	
					}
				}
				var soTranid = soRecord.getFieldValue('tranid'); //�����ԍ� 
				
				var soId = nlapiGetRecordId();
				getTranid(soTranid,soId);
				
				if(isEmpty(soRecord.getFieldValue('otherrefnum'))){ 
					soRecord.setFieldValue('otherrefnum', soTranid);//�������ԍ�
				}
				nlapiSubmitRecord(soRecord, false, true);
			}
		}catch(e){
			nlapiLogExecution("debug", "e", e.message);
		}
}


//change by song add 23030420 start - po�̔ԕ␳
function getTranid(soTranid,soId){
	nlapiLogExecution("debug", "getTranid");
	var purchaseorderSearch   = nlapiSearchRecord("purchaseorder",null,
			[
			   ["type","anyof","PurchOrd"],  
			   "AND", 
			   ["createdfrom","anyof",soId],
			], 
			[
			   new nlobjSearchColumn("internalid"),
			]
			);
	if(!isEmpty(purchaseorderSearch)){
		var poIdList = new Array();
		for(var j = 0;j<purchaseorderSearch.length;j++){
			var poId = purchaseorderSearch[j].getValue("internalid");
			poIdList.push(poId);
		}
		poIdList = unique(poIdList);
		var poTranid = '';
		var poIdListLen = poIdList.length;
		for(var k = 0; k < poIdList.length; k++){
			var poId = poIdList[k];
			if(poIdListLen == 1){
				poTranid = soTranid
			}else{
				if(k == 0){
					poTranid= soTranid
				}else{
					poTranid = soTranid+"-"+(k+1);
				}
			}
			nlapiSubmitField('purchaseorder', poId, ['employee','tranid'], [nlapiGetUser(),poTranid], false);
			nlapiLogExecution("debug", "po poTranid", poTranid);
		}
	}
}
//change by song add 23030420 end - po�̔ԕ␳


/**
 * �d���f�[�^���폜����
 * 
 * @param array
 *            ���X�g
 * @returns ���X�g
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

//change by song add 23030329 end

function setLineItemDisableType(type, fileName, disableType) {
	try {
		var field = nlapiGetLineItemField(type, fileName);
		if (!isEmpty(field)) {
			field.setDisplayType(disableType);
		}
	} catch (e) {
		nlapiLogExecution('debug', fileName , e);
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