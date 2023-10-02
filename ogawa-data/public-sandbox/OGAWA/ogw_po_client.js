/**
 * pocs
 * 
 * Version    Date            Author           Remarks
 * 1.00       2022/12/06     CPC_��
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

var po_ogj_custForm = "243";

function clientFieldChanged(type, name, linenum){

	 if(name == 'entity' || name == 'item'){
		 try{
				 var custForm = nlapiGetFieldValue('customform');
				 if(custForm == po_ogj_custForm){	
					 var subsidiary=nlapiGetFieldValue('subsidiary');//�q���
					 var item= nlapiGetCurrentLineItemValue('item', 'item');//�A�C�e��
					 var entity=nlapiGetFieldText('entity');//�d����
					 var entityId=nlapiGetFieldValue('entity');//�d����ID
					 var entityString = entity.toString();
					 var entityFirst = entityString.substr(0,1);//�d����1��
					 var entityFive = entityString.substr(0,5);//�d����5��
					 var itmeName = nlapiGetCurrentLineItemValue('item', 'item_display');
					 if(!isEmpty(itmeName)){
					 var itemString = itmeName.toString();			 			 
					 if(!isEmpty(subsidiary)&&!isEmpty(entityId)&&!isEmpty(item)&&!isEmpty(itemString)){
						 var inquiries='';
						 var pdfTemp='';
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
						 if(!isEmpty(inquiriesSearch)){
							 inquiries=inquiriesSearch[0].getValue("custrecord_ogw_inquiries"); //�₢���킹��					 				 
							 pdfTemp=inquiriesSearch[0].getValue("custrecord_ogw_pdftemp"); //������PDF�e���v���[�g					 				 
						 }else{
							 var inquiriesSearch = getSearchResults("customrecord_ogw_inquiries",null,
										[
										   ["custrecord_ogw_inquiries_subsidiary","anyof",subsidiary], 
										   "AND", 
										   ["custrecord_ogw_inquiries_vendor","anyof",entityId], 
										   "AND", 
										   ["custrecord_ogw_inquiries_item","anyof","@NONE@"]
										], 
										[
										   new nlobjSearchColumn("custrecord_ogw_inquiries"),
										   new nlobjSearchColumn("custrecord_ogw_pdftemp"),
										]
										);
							 if(!isEmpty(inquiriesSearch)){
								 inquiries=inquiriesSearch[0].getValue("custrecord_ogw_inquiries"); //�₢���킹�� 
								 pdfTemp=inquiriesSearch[0].getValue("custrecord_ogw_pdftemp"); //������PDF�e���v���[�g	 						
							 }else{
								 var inquiriesSearch = getSearchResults("customrecord_ogw_inquiries",null,
											[
											   ["custrecord_ogw_inquiries_subsidiary","anyof",subsidiary], 
											   "AND", 
											   ["custrecord_ogw_inquiries_item","anyof",item],
											   "AND", 
											   ["custrecord_ogw_inquiries_vendor","anyof","@NONE@"]
											], 
											[
											   new nlobjSearchColumn("custrecord_ogw_inquiries"),
											   new nlobjSearchColumn("custrecord_ogw_pdftemp"),
											]
											);						 						 
								 if(!isEmpty(inquiriesSearch)){
									 inquiries=inquiriesSearch[0].getValue("custrecord_ogw_inquiries"); //�₢���킹��								 
									 pdfTemp=inquiriesSearch[0].getValue("custrecord_ogw_pdftemp"); //������PDF�e���v���[�g								 
								 }else{
									 inquiries='';
									 pdfTemp='';				 				
								 }								 
							 }
						 }
						 setTempValue(entityFirst,entityFive,itemString,pdfTemp,inquiries);
					 }
				 }
				 } 
		 }catch(e){}
		 if(name == 'entity'){
				 nlapiSetFieldValue("custbody_ogw_po_mail_template", ""); //���������M�e���v���[�g
				 nlapiSetFieldValue("custbody_ogw_to", ""); //TO
				 nlapiSetFieldValue("custbody_ogw_cc", ""); //CC
				 nlapiSetFieldValue("custbody_ogw_person", ""); //�S����
				 nlapiSetFieldValue("custbody_ogw_change_content", ""); //�ύX���e
				 nlapiSetFieldValue("custbody_ogw_cancle_content", ""); //�L�����Z�����e
				 nlapiSetFieldValue("custbody_ogw_content", "");//���e
		 } 	
	 }
	}

	function setTempValue (str,str1,itemString,pdfTemp,inquiries){
		var first = str;
		var five = str1;
		if(first == "3"){
			nlapiSetCurrentLineItemValue('item', 'custcol_ogw_po_pdf_temp', '1', false, true);//���{��t�H�[�}�b�g
		}else if(first == "1" && five != "10115"){
			nlapiSetCurrentLineItemValue('item', 'custcol_ogw_po_pdf_temp', '2', false, true);//�p��t�H�[�}�b�g
		}else if(first == "1" && five == "10115"){
			 if(itemString.substr(0,1) == "4" && itemString.length == "11"){
				 nlapiSetCurrentLineItemValue('item', 'custcol_ogw_po_pdf_temp', "1", false, true);//���{��t�H�[�}�b�g
			 }else{
				 nlapiSetCurrentLineItemValue('item', 'custcol_ogw_po_pdf_temp', "2", false, true);//�p��t�H�[�}�b�g
			 }
		}else{
			 nlapiSetCurrentLineItemValue('item', 'custcol_ogw_po_pdf_temp', pdfTemp, false, true);
		}
		 nlapiSetCurrentLineItemValue('item', 'custcol_ogw_inquiries', inquiries, false, true); //�₢���킹��
	}


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



function creatPdf() {
	var id=nlapiGetRecordId();
	var theLink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_mailandpdf', 'customdeploy_ogw_sl_mailandpdf');
	theLink += '&sltype=creatpdf';
    theLink += '&poid=' + id;  
    var rse = nlapiRequestURL(theLink);
    var url = rse.getBody();
    if(!isEmpty(url)){
    	var urlArr=url.split('|||');
    	 for(var i=0;i<urlArr.length-1;i++){
    		 window.open(urlArr[i]);
    	 } 
    }
}


function poSendMailtest (){
	var poid=nlapiGetRecordId();
	var theLink = nlapiResolveURL('SUITELET','customscript_ogw_sl_sendmail_update','customdeploy_ogw_sl_sendmail_update');
	theLink+='&poid=' + poid;
    nlExtOpenWindow(theLink, 'newwindow',700, 400, this, false, '���M');
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
	return src || '';
}