/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/01/12     CPC_��
 *
 */

// �w���_��csvimport
var folderId='433';
var form = '247';
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	var fileid = nlapiGetContext().getSetting('SCRIPT','custscript_fileid');	
	nlapiLogExecution('debug', 'fileid', fileid);
	//changed by song add 23030327 strat
	var fileRecordId = nlapiGetContext().getSetting('SCRIPT','custscript_ogw_filerec_id');
	var csvStatus = '';
	var repeatFlg = false
	//changed by song add 23030327 end
	var detailsArray = [];
	var importEdTrainArray=new Array();
	var  file = nlapiLoadFile(fileid);
	var oldFieldName=file.getName();
	var fileArr = file.getValue().split('\r\n');
	var xmlString = '�G���[,�w���_�񏑔ԍ�,�d����,���Ɋ�Â��L����,�ʉ�,�_��J�n��,�_��I����\r\n';
	var nowDate=nlapiDateToString(getSystemTime());  
	var nextDate = nlapiDateToString(getTheNextDay());
	// 0 is header do not need
	Flag2:for(var i = 1 ; i  < fileArr.length ; i++){
		 governanceYield();
		 if(!isEmpty(fileArr[i])){
		 var fileLine = csvDataToArray(fileArr[i].toString());
		 				 
		 // �w���_�񏑔ԍ�
		 var tranid=fileLine[0];
		 
		if(importEdTrainArray.indexOf(tranid) < 0){
	     var itemArray=new Array(); 
		 var itemPriceArray={};
		 // �d����
		 var entity=fileLine[1];
		 
		 // ���Ɋ�Â��L����
		 var effectivitybasedon=fileLine[2];
		 
		 // �ʉ�
		 var currency=fileLine[3];
		 
		 // �J�n��
		 var startdate=fileLine[4];
		 
		 // �I����
		 var enddate=fileLine[5];
		 
		 // �A�C�e��
		 var item=fileLine[6];
		 
		 // �ŋ��R�[�h
		 var taxitem=fileLine[7];
		 
		 // ���ʂ���
		 var fromquantity=fileLine[8];
		 
		 // �P���܂��̓��b�g���i
		 var rateorlotprice=fileLine[9];
		 
		 // �A�C�e�����i�ݒ胁��
		 var memo=fileLine[10];
		 itemArray.push(item);
         itemPriceArray[item]=new Array();
         var qArray=new Array();
         qArray.push([taxitem],[fromquantity],[rateorlotprice],[memo]);
         itemPriceArray[item].push(qArray);
//		 detailsArray.push({
//			    tranid:tranid,
//			    entity:entity,
//			    effectivitybasedon:effectivitybasedon,
//			    currency:currency,
//			    startdate:startdate,
//			    enddate:enddate,
//			    item:item,
//			    taxitem:taxitem,
//			    fromquantity:fromquantity,
//			    rateorlotprice:rateorlotprice,
//			    memo:memo
//	        });
		 try{
			// sleep(100);
			 var purchasecontractSearch = nlapiSearchRecord("purchasecontract",null,
					 [
					    ["type","anyof","PurchCon"], 
					    "AND", 
					    ["numbertext","is",tranid]
					 ], 
					 [
					    new nlobjSearchColumn("internalid",null,"GROUP")
					 ]
					 );
			//changed by song add 23030327 strat
			 if(isEmpty(purchasecontractSearch) ){
				 var PurchConRecord= nlapiCreateRecord('purchasecontract');
				 PurchConRecord.setFieldValue('tranid', tranid);
			 }
			 if(!isEmpty(PurchConRecord)){
				 /*****TODO*/
				 for(var j = i+1 ; j  < fileArr.length ; j++){
						 governanceYield();
						 if(!isEmpty(fileArr[j])){
						 var fileLineInside = csvDataToArray(fileArr[j].toString());
						 
						 // �w���_�񏑔ԍ�
						 var tranidInside=fileLineInside[0];
						 
						 if(tranidInside==tranid){
						 
						 // �d����
						 var entityInside=fileLineInside[1];
						 
						 // ���Ɋ�Â��L����
						 var effectivitybasedonInside=fileLineInside[2];
						 
						 // �ʉ�
						 var currencyInside=fileLineInside[3];
						 
						 // �J�n��
						 var startdateInside=fileLineInside[4];
						 
						 // �I����
						 var enddateInside=fileLineInside[5];
						 
						 // �A�C�e��
						 var itemInside=fileLineInside[6];
						 
						 // �ŋ��R�[�h
						 var taxitemInside=fileLineInside[7];
						 
						 // ���ʂ���
						 var fromquantityInside=fileLineInside[8];
						 
						 // �P���܂��̓��b�g���i
						 var rateorlotpriceInside=fileLineInside[9];
						 
						 // �A�C�e�����i�ݒ胁��
						 var memoInside=fileLineInside[10];
						 if(isEmpty(itemPriceArray[itemInside])){
						  itemPriceArray[itemInside]=new Array();
						  itemArray.push(itemInside);
						 }
					         var qArray=new Array();
					         qArray.push([taxitemInside],[fromquantityInside],[rateorlotpriceInside],[memoInside]);
					         itemPriceArray[itemInside].push(qArray);				         
						 }
						 }
					 }
				  // �d����
				 if(PurchConRecord.getFieldText('entity')!=entity){	 
				  PurchConRecord.setFieldText('entity', entity); 
				 }
				  if(effectivitybasedon=='��̗\���'){
				  PurchConRecord.setFieldValue('effectivitybasedon', 'RECEIPTDATE');
				  }else if(effectivitybasedon=='������'){
				  PurchConRecord.setFieldValue('effectivitybasedon', 'ORDERDATE');
				  } 
				  
				  PurchConRecord.setFieldValue('customform', form);
				  
				  // �ʉ�
				  if(PurchConRecord.getFieldText('currency')!=currency){	 
				  PurchConRecord.setFieldText('currency', currency); 
				  }
				  
				// changed add by song 23030222 start
				  var systemStartDate = PurchConRecord.getFieldValue('startdate');// �J�n��		  
				  if(!isEmpty(systemStartDate)){			  
					  if(!isEmpty(startdate)){
						  var systemStart = getDate(systemStartDate);
						  var newStartdate = getDate(startdate);
						  
						  if(systemStart > newStartdate){  //�J�n�� == ���t
							  PurchConRecord.setFieldValue('startdate', nowDate);
						  }else if(systemStart == newStartdate){ //�J�n�� == �_��J�n��
							  PurchConRecord.setFieldValue('startdate', startdate);
						  }else if(systemStart < newStartdate){ //�J�n�� == �_��J�n��
							  PurchConRecord.setFieldValue('startdate', startdate);
						  }  
						  PurchConRecord.setFieldValue('custbody_ogw_contract_start_date', startdate); //�_��J�n��
					  }
					  
					  if(!isEmpty(enddate)){
						  var systemStart = getDate(systemStartDate);
						  var newEnddate = getDate(enddate);
						  
						  if(systemStart > newEnddate){  //�I���� == ���t
							  PurchConRecord.setFieldValue('enddate', nextDate);
						  }else if(systemStart == newEnddate){ //�I����== �_��I����
							  PurchConRecord.setFieldValue('enddate', enddate);
						  }else if(systemStart < newEnddate){ //�I���� == �_��I����
							  PurchConRecord.setFieldValue('enddate', enddate);
						  }	  
						  PurchConRecord.setFieldValue('custbody_ogw_contract_end_date', enddate); //�_��J�n��
					  }		  
				  }
				  
				  if(!isEmpty(startdate) && !isEmpty(enddate)){
					  var newStartdate = getDate(startdate);  //�_��J�n��
					  var newEnddate = getDate(enddate); //�_��I����
					  if(newEnddate <= newStartdate){
						  repeatFlg = true;
						  break Flag2;
					  }
				  }

				  // changed add by song 23030222 end
				  
				  if(!isEmpty(purchasecontractSearch) ){
					  var PcCount= PurchConRecord.getLineItemCount('item');
					  for(var itaf=0;itaf<itemArray.length;itaf++){
                         var itafItemTxt=itemArray[itaf];
                         var newItemFlag=true;
						 for(var pi=1;pi<PcCount+1;pi++){
							 governanceYield();
							 var itemTxt=PurchConRecord.getLineItemText('item', 'item', pi);
							 if(itafItemTxt==itemTxt){
								 newItemFlag=false;
								 PurchConRecord.selectLineItem('item', pi);
								 PurchConRecord.removeCurrentLineItemSubrecord('item', 'itempricing');
								 
								 var pcItemPriceArray=itemPriceArray[itemTxt]; 
								 var pcfltaxitem =pcItemPriceArray[0][0][0];
								 var pcflrateorlotprice =pcItemPriceArray[0][2][0];
								 var pcflmemo =pcItemPriceArray[0][3][0];
								   // ��{���[�g
								    PurchConRecord.setCurrentLineItemValue('item', 'rate', pcflrateorlotprice);
									PurchConRecord.setCurrentLineItemValue('item', 'origrate', pcflrateorlotprice);
																
									//TODO �ŋ��R�[�h
									var salestaxitemSearch = nlapiSearchRecord("salestaxitem",null,
											[
											   ["name","is",pcfltaxitem]
											], 
											[
											   new nlobjSearchColumn("internalid",null,"GROUP")
											]
											);
									if(!isEmpty(salestaxitemSearch)){
									PurchConRecord.setCurrentLineItemValue('item', 'taxcode',salestaxitemSearch[0].getValue("internalid",null,"GROUP"));
									}else{
										PurchConRecord.setCurrentLineItemValue('item', 'taxcode', '18041');
									}
									PurchConRecord.commitLineItem('item');
									var nid=nlapiSubmitRecord(PurchConRecord, false,true);

									 PurchConRecord=nlapiLoadRecord('purchasecontract',nid);
									 PurchConRecord.selectLineItem('item', pi);
								var subrecord2 = PurchConRecord.createCurrentLineItemSubrecord('item', 'itempricing');
									subrecord2.setFieldValue('calculatequantitydiscounts', 'LINE'); 
									subrecord2.setFieldValue('inputusing', 'RATE'); 
									subrecord2.setFieldValue('priceusing', 'RATE');
									
									subrecord2.selectNewLineItem('discount');
									subrecord2.setLineItemValue('discount', 'memo', 1,pcflmemo);
									
								 for(var pipa=1;pipa<pcItemPriceArray.length;pipa++){
									 governanceYield();
									 var pcltaxitem =pcItemPriceArray[pipa][0][0];
									 var pclfromquantity =pcItemPriceArray[pipa][1][0];
									 var pclrateorlotprice =pcItemPriceArray[pipa][2][0];
									 var pclmemo =pcItemPriceArray[pipa][3][0];
										subrecord2.selectNewLineItem('discount');

										//����
										subrecord2.setCurrentLineItemValue('discount','fromquantity', pclfromquantity);

										// ����
										subrecord2.setCurrentLineItemValue('discount','memo',pclmemo);

										// �P���܂��̓��b�g���i
										subrecord2.setCurrentLineItemValue('discount','rate',pclrateorlotprice);
										subrecord2.commitLineItem('discount');
										
								 }
								 subrecord2.commit();
								 PurchConRecord.commitLineItem('item');
								 var nid=nlapiSubmitRecord(PurchConRecord, false,true);
								 PurchConRecord=nlapiLoadRecord('purchasecontract',nid);
								 //sleep(1000);
							 }						 
						 }
						 if(newItemFlag){
							 /**/

							 governanceYield();
							 PurchConRecord.selectNewLineItem('item'); //����							 
							 var itemSearch = nlapiSearchRecord("item",null,
									 [
									    ["name","is",itafItemTxt]
									 ], 
									 [
									    new nlobjSearchColumn("internalid",null,"GROUP")
									 ]
									 );
							 if(!isEmpty(itemSearch)){
								// �A�C�e��
								 PurchConRecord.setCurrentLineItemValue('item', 'item', itemSearch[0].getValue("internalid",null,"GROUP"));								 
								 var pcItemPriceArray=itemPriceArray[itafItemTxt]; 
								 var pcfltaxitem =pcItemPriceArray[0][0][0];
								 var pcflrateorlotprice =pcItemPriceArray[0][2][0];
								 var pcflmemo =pcItemPriceArray[0][3][0];
								   // ��{���[�g
								    PurchConRecord.setCurrentLineItemValue('item', 'rate', pcflrateorlotprice);
									PurchConRecord.setCurrentLineItemValue('item', 'origrate', pcflrateorlotprice);
																
									//TODO �ŋ��R�[�h
									var salestaxitemSearch = nlapiSearchRecord("salestaxitem",null,
											[
											   ["name","is",pcfltaxitem]
											], 
											[
											   new nlobjSearchColumn("internalid",null,"GROUP")
											]
											);
									if(!isEmpty(salestaxitemSearch)){
									PurchConRecord.setCurrentLineItemValue('item', 'taxcode',salestaxitemSearch[0].getValue("internalid",null,"GROUP"));
									}else{
										PurchConRecord.setCurrentLineItemValue('item', 'taxcode', '18041');
									}
									PurchConRecord.commitLineItem('item');
									var nid=nlapiSubmitRecord(PurchConRecord, false,true);

									 PurchConRecord=nlapiLoadRecord('purchasecontract',nid);
									 var PcCount= PurchConRecord.getLineItemCount('item');
									 for(var pi=1;pi<PcCount+1;pi++){
										 governanceYield();
								var itemisdTxt=PurchConRecord.getLineItemText('item', 'item', pi);
								if(itemisdTxt==itafItemTxt){
								PurchConRecord.selectLineItem('item', pi);
								var subrecord2 = PurchConRecord.createCurrentLineItemSubrecord('item', 'itempricing');
									subrecord2.setFieldValue('calculatequantitydiscounts', 'LINE'); 
									subrecord2.setFieldValue('inputusing', 'RATE'); 
									subrecord2.setFieldValue('priceusing', 'RATE');
									subrecord2.selectNewLineItem('discount');
									subrecord2.setLineItemValue('discount', 'memo', 1,pcflmemo);
									
								 for(var pipa=1;pipa<pcItemPriceArray.length;pipa++){
									 governanceYield();
									 var pcltaxitem =pcItemPriceArray[pipa][0][0];
									 var pclfromquantity =pcItemPriceArray[pipa][1][0];
									 var pclrateorlotprice =pcItemPriceArray[pipa][2][0];
									 var pclmemo =pcItemPriceArray[pipa][3][0];
										subrecord2.selectNewLineItem('discount');

										//����
										subrecord2.setCurrentLineItemValue('discount','fromquantity', pclfromquantity);

										// ����
										subrecord2.setCurrentLineItemValue('discount','memo',pclmemo);

										// �P���܂��̓��b�g���i
										subrecord2.setCurrentLineItemValue('discount','rate',pclrateorlotprice);
										subrecord2.commitLineItem('discount');
										
								 }
								 subrecord2.commit();
								 PurchConRecord.commitLineItem('item');
								 var nid=nlapiSubmitRecord(PurchConRecord, false,true);
								 PurchConRecord=nlapiLoadRecord('purchasecontract',nid);
								 sleep(1000);
								  }
								}
							 }
						 
							 /**/
						 }
						 
				  }
					 }else{
						 
						 for(var crti=0;crti<itemArray.length;crti++){
							 governanceYield();
							 var itemTxt=itemArray[crti];
							 PurchConRecord.selectNewLineItem('item'); //����							 
							 var itemSearch = nlapiSearchRecord("item",null,
									 [
									    ["name","is",itemTxt]
									 ], 
									 [
									    new nlobjSearchColumn("internalid",null,"GROUP")
									 ]
									 );
							 if(!isEmpty(itemSearch)){
									// �A�C�e��
								 PurchConRecord.setCurrentLineItemValue('item', 'item', itemSearch[0].getValue("internalid",null,"GROUP"));								 
								 var pcItemPriceArray=itemPriceArray[itemTxt]; 
								 var pcfltaxitem =pcItemPriceArray[0][0][0];
								 var pcflrateorlotprice =pcItemPriceArray[0][2][0];
								 var pcflmemo =pcItemPriceArray[0][3][0];
								   // ��{���[�g
								    PurchConRecord.setCurrentLineItemValue('item', 'rate', pcflrateorlotprice);
									PurchConRecord.setCurrentLineItemValue('item', 'origrate', pcflrateorlotprice);
																
									//TODO �ŋ��R�[�h
									var salestaxitemSearch = nlapiSearchRecord("salestaxitem",null,
											[
											   ["name","is",pcfltaxitem]
											], 
											[
											   new nlobjSearchColumn("internalid",null,"GROUP")
											]
											);
									if(!isEmpty(salestaxitemSearch)){
									PurchConRecord.setCurrentLineItemValue('item', 'taxcode',salestaxitemSearch[0].getValue("internalid",null,"GROUP"));
									}else{
										PurchConRecord.setCurrentLineItemValue('item', 'taxcode', '18041');
									}
									PurchConRecord.commitLineItem('item');
									var nid=nlapiSubmitRecord(PurchConRecord, false,true);

									 PurchConRecord=nlapiLoadRecord('purchasecontract',nid);
									 var PcCount= PurchConRecord.getLineItemCount('item');
									 for(var pi=1;pi<PcCount+1;pi++){
										 governanceYield();
								var itemisdTxt=PurchConRecord.getLineItemText('item', 'item', pi);
								if(itemisdTxt==itemTxt){
								PurchConRecord.selectLineItem('item', pi);
								var subrecord2 = PurchConRecord.createCurrentLineItemSubrecord('item', 'itempricing');
									subrecord2.setFieldValue('calculatequantitydiscounts', 'LINE'); 
									subrecord2.setFieldValue('inputusing', 'RATE'); 
									subrecord2.setFieldValue('priceusing', 'RATE');
									subrecord2.selectNewLineItem('discount');
									subrecord2.setLineItemValue('discount', 'memo', 1,pcflmemo);
								 for(var pipa=1;pipa<pcItemPriceArray.length;pipa++){
									 governanceYield();
									 var pcltaxitem =pcItemPriceArray[pipa][0][0];
									 var pclfromquantity =pcItemPriceArray[pipa][1][0];
									 var pclrateorlotprice =pcItemPriceArray[pipa][2][0];
									 var pclmemo =pcItemPriceArray[pipa][3][0];
										subrecord2.selectNewLineItem('discount');

										//����
										subrecord2.setCurrentLineItemValue('discount','fromquantity', pclfromquantity);

										// ����
										subrecord2.setCurrentLineItemValue('discount','memo',pclmemo);

										// �P���܂��̓��b�g���i
										subrecord2.setCurrentLineItemValue('discount','rate',pclrateorlotprice);
										subrecord2.commitLineItem('discount');
										
								 }
								 subrecord2.commit();
								 PurchConRecord.commitLineItem('item');
								 var nid=nlapiSubmitRecord(PurchConRecord, false,true);
								 PurchConRecord=nlapiLoadRecord('purchasecontract',nid);
								// sleep(1000);
								  }
								}
							 }								
						 }
						 
					 }
					xmlString+='"'+'�C���|�[�g����'+'",'+tranid+',"'+entity+'",'+effectivitybasedon+','+currency+','+startdate+','+enddate+'\r\n';	  
					csvStatus ="T";
					//changed by song add 23030327 end
			 }else{
				 	xmlString+='"'+'�f�[�^�d��'+'",'+tranid+',"'+entity+'",'+effectivitybasedon+','+currency+','+startdate+','+enddate+'\r\n';	
				 	csvStatus ="F";
			 }

		 }catch(e){	
			 csvStatus = e.message;
			 xmlString+='"'+e.message+'",'+tranid+',"'+entity+'",'+effectivitybasedon+','+currency+','+startdate+','+enddate+'\r\n';
		 }
		 importEdTrainArray.push(tranid);
		 }
		}	
	 }
		if(repeatFlg){
			xmlString+='"'+'�_��I�����͌_��J�n������ł���K�v������܂�'+'",'+tranid+',"'+entity+'",'+effectivitybasedon+','+currency+','+startdate+','+enddate+'\r\n';
		}	
	    var nxlsFile = nlapiCreateFile(oldFieldName.split('.csv')[0]+'_'+RondomStr()+'_'+'results.csv', 'CSV', xmlString);
		
	    nxlsFile.setFolder(folderId);
	    nxlsFile.setName(oldFieldName.split('.csv')[0]+'_'+RondomStr()+'_'+'results.csv');
	    nxlsFile.setEncoding('SHIFT_JIS');
			
		// save file
		var newFileID = nlapiSubmitFile(nxlsFile);
		//changed by song add 23030327 strat
		var fileRecord = nlapiLoadRecord('customrecord_ogw_csvimport_result', fileRecordId);
		if(!isEmpty(fileRecord)){
			fileRecord.setFieldValue('custrecord_ogw_csvimport_results', newFileID);
			if(csvStatus == 'T'){
				fileRecord.setFieldValue('custrecord_ogw_csv_status', '2');
			}else{
				fileRecord.setFieldValue('custrecord_ogw_csv_status', '3');
			}
			nlapiSubmitRecord(fileRecord, false, true);
		}
		//changed by song add 23030327 end
	//Createpurchasecontract();
	
	nlapiLogExecution('debug', 'END');
}

function getSystemTime() {

	// �V�X�e������
	var now = new Date();
	var offSet = now.getTimezoneOffset();
	var offsetHours = 9 + (offSet / 60);
	now.setHours(now.getHours() + offsetHours);

	return now;
}

function getDate(str)
{
var strArr = str.split('/');
var day=strArr[0];
var month=strArr[1];
var year=strArr[2];
date = (year + '/' + month + '/' + day).toString();
return date;
}

function getTheNextDay() {

	// �V�X�e������
	var now = new Date();
	var offSet = now.getTimezoneOffset();
	var offsetHours = 9 + (offSet / 60);
	now.setHours(now.getHours() + offsetHours);
	now.setDate(now.getDate() + 1);
	return now;
}

function Createpurchasecontract(){
	var rec= nlapiCreateRecord('purchasecontract');

	// �d����
	rec.setFieldValue('entity', '1815'); 

	// �ʉ�
	rec.setFieldValue('currency', '6'); 

	// �J�n��
	rec.setFieldValue('startdate', '1/2/2023'); 

	// �I����
	rec.setFieldValue('enddate', '19/12/2023'); 

	rec.selectNewLineItem('item'); //����

	// �A�C�e��
	rec.setCurrentLineItemValue('item', 'item', '19894');

	// ��{���[�g
	rec.setCurrentLineItemValue('item', 'rate', '100000');
	rec.setCurrentLineItemValue('item', 'origrate', '100000');

	// �ŋ��R�[�h
	rec.setCurrentLineItemValue('item', 'taxcode', '18041');
	rec.commitLineItem('item');
	var id=nlapiSubmitRecord(rec, false,true);

	var rec=nlapiLoadRecord('purchasecontract',id);
	rec.selectLineItem('item', '1'); 
	var subrecord2 = rec.createCurrentLineItemSubrecord('item', 'itempricing');
	subrecord2.setFieldValue('calculatequantitydiscounts', 'LINE'); 
	subrecord2.setFieldValue('inputusing', 'RATE'); 
	subrecord2.setFieldValue('priceusing', 'RATE'); 

	subrecord2.selectNewLineItem('discount');

	//����
	subrecord2.setCurrentLineItemValue('discount','fromquantity', '300');

	// ����
	subrecord2.setCurrentLineItemValue('discount','memo','');

	// �P���܂��̓��b�g���i
	subrecord2.setCurrentLineItemValue('discount','rate','5000');
	subrecord2.commitLineItem('discount');
	subrecord2.commit();
	rec.commitLineItem('item');
	nlapiSubmitRecord(rec, false,true);
	}
/**
* ���e�ɂ̓J���}���܂߂鏈��
* 
* @param strData
* @returns
*/
function csvDataToArray(strData) {

   strDelimiter = (",");

   var objPattern = new RegExp(
           ("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");

   var arrData = [[]];

   var arrMatches = null;

   while (arrMatches = objPattern.exec(strData)) {

       var strMatchedDelimiter = arrMatches[1];

       if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
           arrData.push([]);
       }

       var strMatchedValue = '';
       if (arrMatches[2]) {
           strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

       } else {
           strMatchedValue = arrMatches[3];
       }

       arrData[arrData.length - 1].push(strMatchedValue);
   }
   
 //������u��
function replace(text) {
   if ( typeof(text)!= "string" )
      text = text.toString() ;

   text = text.replace(/,/g, "_") ;

   return text ;
   }
   return (arrData[0]);
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
function governanceYield() {
	if (parseInt(nlapiGetContext().getRemainingUsage()) <= 300) {
		var state = nlapiYieldScript();
		if (state.status == 'FAILURE') {
			nlapiLogExecution('DEBUG', 'Failed to yield script.');
		} else if (state.status == 'RESUME') {
			nlapiLogExecution('DEBUG', 'Resuming script');
		}
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

function sleep(waitMsec) {
    var startMsec = new Date();

    while (new Date() - startMsec < waitMsec);
}

function RondomStr(){
	  var arr1 = new Array("0","1","2","3","4","5","6","7","8","9");
	  var nonceStr=''
	  for(var i=0;i<5;i++){
	      var n = parseInt(Math.floor(Math.random()*5));
	      nonceStr+=arr1[n];
	  }
	  return parseInt(nonceStr)
	}