/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/04/10     CPC_�v
 *
 */

function search(){
	var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
	if(isEmpty(subsidiary)){
		alert("�q��Ђ͋󔒂ɂł��܂���B")
	}else{
		var parameter = setParam();
		parameter += '&selectFlg=T';
		var https = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_completion_csvimport', 'customdeploy_ogw_sl_completion_csvimport');
		https = https + parameter;
		window.ischanged = false;
		window.location.href = https;
	}
}

function searchReturn(){
	var parameter = setParam();
	parameter += '&selectFlg=F';
	var https = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_completion_csvimport', 'customdeploy_ogw_sl_completion_csvimport');
	https = https + parameter;
	window.ischanged = false;
	window.location.href = https;
}

function clientFieldChanged(type, name, linenum){
	 if(name=='custpage_subsidiary'){
		var thelink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_completion_csvimport', 'customdeploy_ogw_sl_completion_csvimport');
		var parameter = setParam();		
		parameter += '&selectFlg=F';		
		thelink += parameter;
		window.ischanged = false;
		window.location.href = thelink;
	 }
}


function clientSaveRecord() {
	var file = nlapiGetFieldValue('custpage_importfile');//csv file
	if(isEmpty(file)){
		var count = nlapiGetLineItemCount('list');
		var zeroflg = true;
		for(var i = 0 ; i < count ; i++){
			if(nlapiGetLineItemValue('list', 'checkbox',i+1) == 'T'){
				var entrywait = nlapiGetLineItemValue('list', 'salesorder_entrywait',i+1);//���ב҂�����
				var quantity = nlapiGetLineItemValue('list', 'salesorder_quantity',i+1);//��������
				var quantitypicked = nlapiGetLineItemValue('list', 'salesorder_received',i+1);//���׍ςݐ��� 
				if(Number(entrywait) > Number(quantity - quantitypicked)){
					alert(i+1 + '�s�ڂ̓��ב҂����ʂ�����������܂���');
					return false;
				}
				zeroflg = false;
			}
		}
		if(zeroflg){
			alert('�ΏۑI�����Ă��������B')
			return false;
		}
	}
	return true;
}


function csvDownload(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_completion_csvimport', 'customdeploy_ogw_sl_completion_csvimport');
	theLink += '&selectFlg=T';
	theLink += '&downloadFlag=T';
	var selectLine='';
	var count=nlapiGetLineItemCount('list');
	var zeroflg = true;
	var csvRecord=nlapiCreateRecord('customrecord_ogw_csv_download'); //CSV�e���v���[�g�̃_�E�����[�h
	for(var i=1;i<count+1;i++){
		var checkbox=nlapiGetLineItemValue('list', 'checkbox', i);
		if(checkbox == 'T'){
			selectLine+=nlapiGetLineItemValue('list', 'salesorder_soid', i) //������ID
			+'|'+nlapiGetLineItemValue('list', 'salesorder_customerid', i) //�ڋqID
			+'|'+nlapiGetLineItemValue('list', 'salesorder_date', i) //���t
			+'|'+nlapiGetLineItemValue('list', 'salesorder_itemid', i)
			+'|'+nlapiGetLineItemValue('list', 'salesorder_line', i)
			+'*'; //�A�C�e��ID
	
			if (i % 300 == 0 && i != 0) {
				selectLine+='&&';
			}		
			zeroflg = false;
		}
	}
	var selectLineSplit = selectLine.split('&&');
	var jsonValue = '';
	for ( var j = 0; j < selectLineSplit.length; j ++) {	
		csvRecord.selectNewLineItem('recmachcustrecord_ogw_csv_download_list');
		if(j == 0 ){
			csvRecord.setCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list','custrecord_ogw_json_text',selectLineSplit[j]);
		}else if(j == 1){
			csvRecord.setCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list','custrecord_ogw_json_text2',selectLineSplit[j]);
		}else if(j == 2){
			csvRecord.setCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list','custrecord_ogw_json_text3',selectLineSplit[j]);
		}else if(j == 3){
			csvRecord.setCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list','custrecord_ogw_json_text4',selectLineSplit[j]);
		}else if(j == 4){
			csvRecord.setCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list','custrecord_ogw_json_text5',selectLineSplit[j]);
		}else if(j == 5){
			csvRecord.setCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list','custrecord_ogw_json_text6',selectLineSplit[j]);
		}
		csvRecord.commitLineItem('recmachcustrecord_ogw_csv_download_list');
	}
	var csvRecordId = nlapiSubmitRecord(csvRecord);
	if(zeroflg){
		alert('�ΏۑI�����Ă��������B')
		return false;
	}else{
		theLink += '&selectLine='+csvRecordId;
		var rse = nlapiRequestURL(theLink);
		var url = rse.getBody();
		window.open(url);
	}
}

function setParam(){

	var parameter = '';
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary'); //�q���
	parameter += '&customer='+nlapiGetFieldValue('custpage_customer');//�ڋq
	parameter += '&salesorder='+nlapiGetFieldValue('custpage_salesorder');//�������ԍ�
	parameter += '&item='+nlapiGetFieldValue('custpage_item');//�A�C�e��
	parameter += '&vendor='+nlapiGetFieldValue('custpage_vendor');//�d����
	parameter += '&purchaseorder='+nlapiGetFieldValue('custpage_po');//�������ԍ�
	parameter += '&employee='+nlapiGetFieldValue('custpage_employee');//�]�ƈ�
	parameter += '&eta='+nlapiGetFieldValue('custpage_eta');//eta
	parameter += '&date='+nlapiGetFieldValue('custpage_date');//�������t
	parameter += '&createdate='+nlapiGetFieldValue('custpage_createdate');//�����쐬��
	return parameter;
}

function refresh(){
	window.ischanged = false;
	location=location;
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