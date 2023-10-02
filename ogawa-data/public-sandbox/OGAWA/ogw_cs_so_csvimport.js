/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/03/03     CPC_宋
 *
 */

function search(){
	var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
	if(isEmpty(subsidiary)){
		alert("子会社は空白にできません。")
	}else{
		var parameter = setParam();
		parameter += '&selectFlg=T';
		var https = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_so_csvimport', 'customdeploy_ogw_sl_so_csvimport');
		https = https + parameter;
		window.ischanged = false;
		window.location.href = https;
	}
}

function searchReturn(){
	var parameter = setParam();
	parameter += '&selectFlg=F';
	var https = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_so_csvimport', 'customdeploy_ogw_sl_so_csvimport');
	https = https + parameter;
	window.ischanged = false;
	window.location.href = https;
}

function clientFieldChanged(type, name, linenum){
	 if(name=='custpage_subsidiary' || name == 'custpage_custform'){
		var thelink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_so_csvimport', 'customdeploy_ogw_sl_so_csvimport');
		var parameter = setParam();		
		parameter += '&selectFlg=F';		
		thelink += parameter;
		window.ischanged = false;
		window.location.href = thelink;
	 }
}

function csvDownload(){
	var parameter = setParam();
	parameter += '&selectFlg=T';
	var theLink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_so_csvimport', 'customdeploy_ogw_sl_so_csvimport');
	theLink += '&selectFlg=T';
	theLink += '&downloadFlag=T';
	theLink = theLink + parameter;
	var selectLine='';
	var count=nlapiGetLineItemCount('list');
	for(var i=1;i<count+1;i++){
		var checkbox=nlapiGetLineItemValue('list', 'checkbox', i);
		if(checkbox == 'T'){
			selectLine+=nlapiGetLineItemValue('list', 'salesorder_id', i) //注文書番号
			+'|'+nlapiGetLineItemValue('list', 'salesorder_customerid', i) //顧客
			+'|'+nlapiGetLineItemValue('list', 'salesorder_itemid', i) //アイテム
			+'|'+nlapiGetLineItemValue('list', 'salesorder_date', i) //日付
			+'|'+nlapiGetLineItemValue('list', 'salesorder_line', i)//line
			+'*';
			// changed add 0523 by song start
			if (i % 300 == 0 && i != 0) {
				selectLine+='&&';
			}
			// changed add 0523 by song end
		}
	}
	// changed add 0523 by song start
	var csvRecord=nlapiCreateRecord('customrecord_ogw_csv_download'); //CSVテンプレートのダウンロード
	var selectLineSplit = selectLine.split('&&');
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
	// changed add 0523 by song end
	theLink += '&selectLine='+csvRecordId;
	var rse = nlapiRequestURL(theLink);
	var url = rse.getBody();
	window.open(url);
}

function setParam(){

	var parameter = '';
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary'); //子会社
	parameter += '&customer='+nlapiGetFieldValue('custpage_customer');//顧客
	parameter += '&salesorder='+nlapiGetFieldValue('custpage_salesorder');//注文書番号
	parameter += '&item='+nlapiGetFieldValue('custpage_item');//アイテム
	parameter += '&vendor='+nlapiGetFieldValue('custpage_vendor');//仕入先
	parameter += '&purchaseorder='+nlapiGetFieldValue('custpage_po');//発注書番号
	parameter += '&employee='+nlapiGetFieldValue('custpage_employee');//従業員
	parameter += '&custform='+nlapiGetFieldValue('custpage_custform');//カスタム・フォーム
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