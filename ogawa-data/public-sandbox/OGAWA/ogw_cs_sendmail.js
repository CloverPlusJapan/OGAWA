/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/01/13     CPC_��
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

	var chkflag=true;
	var count = nlapiGetLineItemCount('custpage_list');
	for (var i = 1; i < count+1; i++) {
		if (nlapiGetLineItemValue('custpage_list', 'check', i) == 'T') {
			chkflag=false;
		}
	}
	
	if(chkflag!=false){
		alert('���M�ΏۑI�����Ă��������B')
		return false;
	}
	return true;
}

/*
 *�X�V
 */
function refresh(){
	window.ischanged = false;
	location=location;
}

/**
 * ����
 */
function search() {
	var sub=nlapiGetFieldValue('custpage_subsidiary');
	var sdate=nlapiGetFieldValue('custpage_startdate');
	var edate=nlapiGetFieldValue('custpage_enddate');
	if(isEmpty(sub)||isEmpty(sdate)||isEmpty(edate)){
	if(isEmpty(sub)){
		alert('�u�q��Ёv�t�B�[���h�͋󔒂ɂł��܂���');
	}
	if(isEmpty(sdate)){
		alert('�u���t(�J�n��)�v�t�B�[���h�͋󔒂ɂł��܂���');
	}
	if(isEmpty(edate)){
		alert('�u���t(�I����)�v�t�B�[���h�͋󔒂ɂł��܂���');
	}
	}else{
	var thelink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_sendmail', 'customdeploy_ogw_sl_sendmail');
	var parameter = setParam();
	parameter += '&selectFlg=T';		
	thelink += parameter;

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	location.href = thelink;
	}
}

function searchReturn(){
	var thelink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_sendmail', 'customdeploy_ogw_sl_sendmail');
	var parameter = setParam();		
	parameter += '&selectFlg=F';		
	thelink += parameter;

	// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
	window.ischanged = false;

	// ��ʂ����t���b�V������
	location.href = thelink;
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
function clientFieldChanged(type, name, linenum){
 if(name=='custpage_subsidiary'){
	    var thelink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_sendmail', 'customdeploy_ogw_sl_sendmail');
	    var parameter = setParam();		
		parameter += '&selectFlg=F';		
		thelink += parameter;
		

		// ��ʏ����ύX�ꍇ�A���b�Z�[�W�o�Ă��Ȃ��̂���
		window.ischanged = false;

		// ��ʂ����t���b�V������
		window.location.href = thelink;
 }
}

function setParam(){
	var parameter = '';
	parameter += '&subsidiary='+nlapiGetFieldValue('custpage_subsidiary');
	parameter += '&entity='+nlapiGetFieldValue('custpage_entity');
	parameter += '&startdate='+nlapiGetFieldValue('custpage_startdate');
	parameter += '&enddate='+nlapiGetFieldValue('custpage_enddate');
	parameter += '&sendmailed='+nlapiGetFieldValue('custpage_sendmailed');
	
	return parameter;
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