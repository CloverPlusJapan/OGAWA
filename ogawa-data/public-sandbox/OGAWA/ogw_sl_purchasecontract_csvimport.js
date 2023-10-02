/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/01/12     CPC_��
 *
 */

// �w���_��csvimport
var folderId='433';
var devpUrl='https://3701295-sb1.app.netsuite.com';

var form = '247';
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	response.setEncoding("SHIFT_JIS");
	if (request.getMethod() == 'POST') {
		run(request, response);
		
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			// changed by song add 23030327 strat
			logForm(request, response,request.getParameter('custparam_logform'),request.getParameter('custparam_csvfileid'));
			// changed by song add 23030327 end
		}else{
			createForm(request, response);
		}
	}
	
	 
}

function run(request, response){
	
	var ctx = nlapiGetContext();	
	var scheduleparams = new Array();
	var file=request.getFile('custpage_importfile');
	var parameter = new Array();
	if(!isEmpty(file)){
		file.setEncoding('SHIFT_JIS');
		file.setFolder(folderId);
		var fileId = nlapiSubmitFile(file);
		scheduleparams['custscript_fileid'] = fileId;
		// changed by song add 23030327 strat
		var resultR=nlapiCreateRecord('customrecord_ogw_csvimport_result');
		resultR.setFieldValue('custrecord_csvimport_name', '������CSV�C���|�[�g');
		resultR.setFieldValue('custrecord_ogw_csv_status', '1');
		resultR.setFieldValue('custrecord_ogw_old_file',fileId);
		var fileRecordId = nlapiSubmitRecord(resultR, false, true);
		scheduleparams['custscript_ogw_filerec_id'] = fileRecordId;
		runBatch('customscript_ogw_ss_pc_csvimport', 'customdeploy_ogw_ss_pc_csvimport', scheduleparams);
		parameter['custparam_logform'] = '1';		
		parameter['custparam_csvfileid'] = fileRecordId;
		// changed by song add 23030327 end
	}else{
		parameter['custparam_logform'] = '2';		
	}
	
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}


//�o�b�`��ԉ��
function logForm(request, response,logflag,csvfileid) {

	var form = nlapiCreateForm('�������', false);
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	// changed by song add 23030327 strat
	if(!isEmpty(csvfileid)){
		var csvRecord = nlapiLoadRecord('customrecord_ogw_csvimport_result', csvfileid)
		var csvStatus = csvRecord.getFieldText('custrecord_ogw_csv_status');
		var csvStatusLabel = "CSV�t�@�C��" + "" + csvStatus;
	}
	// changed by song add 23030327 end
	if(logflag=='1'){
	var resetbtn = "window.location.href=window.location.href";
	form.addButton('resetbtn', '�X�V', resetbtn);
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_ogw_ss_pc_csvimport');

	if (batchStatus == 'FAILED') {
		// ���s���s�̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
		runstatusField.setDefaultValue(messageColour);
		// changed by song add 23030327 strat
		form.addField('custpage_lable1', 'label', csvStatusLabel);
		// changed by song add 23030327 end
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// ���s���̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('�o�b�`���������s��');
		// changed by song add 23030327 strat
		form.addField('custpage_lable1', 'label', csvStatusLabel);
		// changed by song add 23030327 end
		response.writePage(form);
	}else{
		// changed by song add 23030327 strat
		resultForm(csvfileid);
		// changed by song add 23030327 end
	}
	}else if(logflag=='2'){
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> CSV�t�@�C�����A�b�v���[�h���Ă��܂���</font>';
		runstatusField.setDefaultValue(messageColour);
		var theLink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_pc_csvimport', 'customdeploy_ogw_sl_pc_csvimport');
		var backbtns = "window.location.href='"+devpUrl+theLink+"&whence='";
		form.addButton('backbtns', '������ʂɖ߂�', backbtns);
		response.writePage(form);
	}
}


//��ʍ쐬
function createForm(request, response){
	
	var form = nlapiCreateForm('�w���_��CSV Import���', false);
	form.setScript('customscript_ogw_cs_pc_csvimport');
	
	var searchFlag=request.getParameter('searchFlag');
	var entitysearch=request.getParameter('entitysearch');
	var tranidsearch=request.getParameter('tranidsearch');	
	var effectivitybasedonsearch=request.getParameter('effectivitybasedonsearch');
	var startdatesearch=request.getParameter('startdatesearch');
	var enddatesearch=request.getParameter('enddatesearch');
		
	form.addFieldGroup('search', '��������');
	var entitysearchField=form.addField('entitysearch', 'select', '�d����', 'vendor', 'search');
	var tranidsearchField=form.addField('tranidsearch', 'select', '�w���_�񏑔ԍ�', '', 'search');
	tranidsearchField.addSelectOption('', '');
	 var tranidsearchListselect = new Array();
	 tranidsearchListselect.push(["type","anyof","PurchCon"]);
	 tranidsearchListselect.push("AND");
	 tranidsearchListselect.push(["mainline","is","F"]);
	 if(!isEmpty(entitysearch)){
		 tranidsearchListselect.push("AND");
		 tranidsearchListselect.push(["name","anyof",entitysearch]);
		}
	
	var tranidsearchList = getSearchResults("purchasecontract",null,tranidsearchListselect, 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP"), 
			   new nlobjSearchColumn("tranid",null,"GROUP")
			]
			);
	if(!isEmpty(tranidsearchList)){
		 for(var ts=0;ts<tranidsearchList.length;ts++){
			 tranidsearchField.addSelectOption(tranidsearchList[ts].getValue("internalid",null,"GROUP"),tranidsearchList[ts].getValue("tranid",null,"GROUP"));
		 }
	}
	
	var effectivitybasedonField=form.addField('effectivitybasedonsearch', 'select', '���Ɋ�Â��L����', '', 'search');
	effectivitybasedonField.addSelectOption('', '');
	effectivitybasedonField.addSelectOption('RECEIPTDATE', '��̗\���	');
	effectivitybasedonField.addSelectOption('ORDERDATE', '������');
	
	var startdateField=form.addField('startdatesearch', 'date', '�_��J�n��', '', 'search');
	var enddateField=form.addField('enddatesearch', 'date', '�_��I����', '', 'search');
	
	if(!isEmpty(entitysearch)){
		entitysearchField.setDefaultValue(entitysearch);
	}
	
	if(!isEmpty(tranidsearch)){
		tranidsearchField.setDefaultValue(tranidsearch);
	}
		
	if(!isEmpty(effectivitybasedonsearch)){
		effectivitybasedonField.setDefaultValue(effectivitybasedonsearch);
	}
	
	if(!isEmpty(startdatesearch)){
		startdateField.setDefaultValue(startdatesearch);
	}
	
	if(!isEmpty(enddatesearch)){
		enddateField.setDefaultValue(enddatesearch);
	}
	
	if(searchFlag=='T'){
	tranidsearchField.setDisplayType('inline');	
	entitysearchField.setDisplayType('inline');
	effectivitybasedonField.setDisplayType('inline');	
	startdateField.setDisplayType('inline');	
	enddateField.setDisplayType('inline');
	var fileField=form.addField('custpage_importfile', 'file', 'CSV�t�@�C���̃A�b�v���[�h');
	fileField.setLayoutType('outsideabove', 'startcol');
	var selectLine=request.getParameter('selectLine');
	var selectLineArray=new Array();
	if(!isEmpty(selectLine)){
		selectLineArray=selectLine.split("***");
	}
	 var select = new Array();
	 select.push(["type","anyof","PurchCon"]);
	 select.push("AND");
	 select.push(["mainline","is","F"]);
//	 select.push("AND");
//	 select.push(["customform","anyof","247"]);
	 if(!isEmpty(entitysearch)){
			 select.push("AND");
			 select.push(["name","anyof",entitysearch]);
		}
		if(!isEmpty(tranidsearch)){
			 select.push("AND");
			 select.push(["internalid","is",tranidsearch]);
		}
		if(!isEmpty(effectivitybasedonsearch)){
			 select.push("AND");
			 select.push(["effectivitybasedon","anyof",effectivitybasedonsearch]);
		}
		// changed add by song 23030222 start
		if(!isEmpty(startdatesearch)){
			 select.push("AND");
			 select.push(["custbody_ogw_contract_start_date","on",startdatesearch]);   //�_��J�n��
		}
		if(!isEmpty(enddatesearch)){
			 select.push("AND");
			 select.push(["custbody_ogw_contract_end_date","on",enddatesearch]);       //�_��I����
		}
		// changed add by song 23030222 end
	var purchasecontractSearch = getSearchResults("purchasecontract",null,select, 
			[
			   new nlobjSearchColumn("tranid").setSort(true), 
			   new nlobjSearchColumn("entity"), 
			   new nlobjSearchColumn("currency"), 
			// changed add by song 23030222 start
			   new nlobjSearchColumn("custbody_ogw_contract_start_date"),  //�_��J�n��
			   new nlobjSearchColumn("custbody_ogw_contract_end_date"),   //�_��I����
			// changed add by song 23030222 end
			   new nlobjSearchColumn("item").setSort(false), 
			   new nlobjSearchColumn("name","taxItem",null), 
			   new nlobjSearchColumn("fromquantity","itemPricing",null).setSort(false), 
			   new nlobjSearchColumn("rateorlotprice","itemPricing",null), 
			   new nlobjSearchColumn("memo","itemPricing",null), 
			   new nlobjSearchColumn("effectivitybasedon")
			]
			);	 
	 var subList = form.addSubList('details', 'list', '�w���_�񏑏ڍ�: '+purchasecontractSearch.length+' ��');
	 subList.addMarkAllButtons();
	 subList.addField('checkbox', 'checkbox', '�I��');
	 subList.addField('tranid', 'text', '�w���_�񏑔ԍ�').setDisplayType('disabled');
	 subList.addField('entity', 'text', '�d����').setDisplayType('disabled');
	 subList.addField('effectivitybasedon', 'text', '���Ɋ�Â��L����').setDisplayType('disabled');
	 subList.addField('currency', 'text', '�ʉ�').setDisplayType('disabled');	
	 subList.addField('startdate', 'text', '�_��J�n��').setDisplayType('disabled');
	 subList.addField('enddate', 'text', '�_��I����').setDisplayType('disabled');
	 subList.addField('item', 'text', '�A�C�e��').setDisplayType('disabled');
	 subList.addField('taxitem', 'text', '�ŋ��R�[�h').setDisplayType('disabled');	 
	 subList.addField('fromquantity', 'text', '���ʂ���').setDisplayType('disabled');
	 subList.addField('rateorlotprice', 'text', '�P���܂��̓��b�g���i').setDisplayType('disabled');
	 subList.addField('memo', 'text', '�A�C�e�����i�ݒ胁��').setDisplayType('disabled');
	 
	 
	 var xmlString = '�w���_�񏑔ԍ�,�d����,���Ɋ�Â��L����,�ʉ�,�_��J�n��,�_��I����,�A�C�e��,�ŋ��R�[�h,���ʂ���,�P���܂��̓��b�g���i,�A�C�e�����i�ݒ胁��\r\n';
	 if(!isEmpty(purchasecontractSearch)){
		 var lineCode=1;
		 for(var i=0;i<purchasecontractSearch.length;i++){
			 var tranid=purchasecontractSearch[i].getValue("tranid");
			 var entity=purchasecontractSearch[i].getText("entity");
			 var effectivitybasedon=purchasecontractSearch[i].getValue("effectivitybasedon");
			 var currency=purchasecontractSearch[i].getText("currency");
			// changed add by song 23030222 start
			 var startdate=purchasecontractSearch[i].getValue("custbody_ogw_contract_start_date");
			 var enddate=purchasecontractSearch[i].getValue("custbody_ogw_contract_end_date")
			 // changed add by song 23030222 end
			 var item=purchasecontractSearch[i].getText("item");
			 var taxitem=purchasecontractSearch[i].getValue("name","taxItem",null)
			 var fromquantity=purchasecontractSearch[i].getValue("fromquantity","itemPricing",null);
			 var rateorlotprice=purchasecontractSearch[i].getValue("rateorlotprice","itemPricing",null)
			 var memo=purchasecontractSearch[i].getValue("memo","itemPricing",null);
			 subList.setLineItemValue('tranid', lineCode,tranid);
			 subList.setLineItemValue('entity', lineCode,entity);
			 subList.setLineItemValue('effectivitybasedon', lineCode,effectivitybasedon);			 
			 subList.setLineItemValue('currency', lineCode,currency);
			 subList.setLineItemValue('startdate', lineCode,startdate);
			 subList.setLineItemValue('enddate', lineCode,enddate);
			 subList.setLineItemValue('item', lineCode,item);
			 subList.setLineItemValue('taxitem', lineCode,taxitem);
			 subList.setLineItemValue('fromquantity', lineCode,fromquantity);
			 subList.setLineItemValue('rateorlotprice', lineCode,rateorlotprice);
			 subList.setLineItemValue('memo', lineCode,memo);
			 var csvFlag=tranid+'|'+item+'|'+fromquantity;
			 if(selectLineArray.indexOf(csvFlag) > -1){
			 xmlString+=tranid+',"'+entity+'",'+effectivitybasedon+','+currency+','+startdate+','+enddate+',"'+item+'",'+taxitem+','+fromquantity+','+rateorlotprice+','+memo+'\r\n';
			 }
			 lineCode++;
		 } 
	 }
	form.addSubmitButton('CSV Import');
	form.addButton('csvdownload', 'CSV�e���v���[�g�̃_�E�����[�h', 'csvDownload();');
	form.addButton('backtosearch', '�����ɖ߂�', 'backToSearch();');
	}else{
	tranidsearchField.setDisplayType('entry');
	entitysearchField.setDisplayType('entry');
	form.addButton('search', '����', 'sepc();');
	}
	if(request.getParameter('downloadFlag')=='T'){
		var url=csvDown(xmlString);
		response.write(url);
	}else{
		response.writePage(form);
	}
	
	
}

//changed by song add 23030327 strat
function resultForm(csvfileid){  
	if(!isEmpty(csvfileid)){
		var csvfileRecord = nlapiLoadRecord('customrecord_ogw_csvimport_result', csvfileid);//CSV�C���|�[�g����
		var resultsCsv = csvfileRecord.getFieldValue('custrecord_ogw_csvimport_results');//CSVID
		if(!isEmpty(resultsCsv)){
			var file = nlapiLoadFile(resultsCsv); // CSV�t�@�C��
			var fileArr = file.getValue().split('\r\n');
			var form = nlapiCreateForm('CSV�C���|�[�g����', false);
			var theLink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_pc_csvimport', 'customdeploy_ogw_sl_pc_csvimport');
			var backbtns = "window.location.href='"+devpUrl+theLink+"&whence='";
			form.addButton('backbtns', '�߂�', backbtns);
			var subList = form.addSubList('list', 'list', 'CSV�C���|�[�g���ʈꗗ');
			subList.addField('csv_error', 'text', '�G���[');
			subList.addField('csv_sonum', 'text', '�w���_�񏑔ԍ� ');
			subList.addField('csv_entity', 'text', '�d���� ');
			subList.addField('csv_eff', 'text', '���Ɋ�Â��L���� ');
			subList.addField('csv_curr', 'text', '�ʉ� ');
			subList.addField('csv_strat', 'text', '�_��J�n�� ');
			subList.addField('csv_end', 'text', '�_��I����');
			var cont = 1;
			for(var i = 1 ; i  < fileArr.length ; i++){
				if(!isEmpty(fileArr[i])){
					 var fileLine = csvDataToArray(fileArr[i].toString());
					 var csv_error=fileLine[0];// �G���[
					 var csv_sonum=fileLine[1];// �w���_�񏑔ԍ�
					 var csv_entity=fileLine[2];// �d����
					 var csv_eff=fileLine[3];// ���Ɋ�Â��L����
					 var csv_curr=fileLine[4];// �ʉ�
					 var csv_strat=fileLine[5];// �_��J�n��
					 var csv_end=fileLine[6];// �_��I����
					 
					 subList.setLineItemValue('csv_error', cont, csv_error);
					 subList.setLineItemValue('csv_sonum', cont, csv_sonum);
					 subList.setLineItemValue('csv_entity', cont, csv_entity);
					 subList.setLineItemValue('csv_eff', cont, csv_eff);			 
					 subList.setLineItemValue('csv_curr', cont, csv_curr);
					 subList.setLineItemValue('csv_strat', cont, csv_strat);
					 subList.setLineItemValue('csv_end', cont, csv_end);
					 cont++;
				}
			}
			
			response.writePage(form);
		}
		
	}
}
//changed by song add 23030327 end

function csvDown(xmlString){
	try{
	
		var xlsFile = nlapiCreateFile('�w���_��' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
		
		xlsFile.setFolder(folderId);
		xlsFile.setName('�w���_��' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setEncoding('SHIFT_JIS');
			
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		var fl = nlapiLoadFile(fileID);
		var url= fl.getURL();
		return url; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', '', e.message)
	}
}


/**
 * �V�X�e�����t�Ǝ��Ԃ��t�H�[�}�b�g�Ŏ擾
 */
 function getFormatYmdHms() {

    // �V�X�e������
    var now = getSystemTime();

    var str = now.getFullYear().toString();
    str += (now.getMonth() + 1).toString();
    str += now.getDate() + "_";
    str += now.getHours();
    str += now.getMinutes();
    str += now.getMilliseconds();

    return str;
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

    return (arrData[0]);
}

//������u��
function replace(text)
{
if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/,/g, "_") ;

return text ;
}

/**
 * �V�X�e�����Ԃ̎擾���\�b�h
 */
function getSystemTime() {

	// �V�X�e������
	var now = new Date();
	var offSet = now.getTimezoneOffset();
	var offsetHours = 9 + (offSet / 60);
	now.setHours(now.getHours() + offsetHours);

	return now;
}

/**
 * ��l�𔻒f
 * 
 * @param str
 *            �Ώ�
 * @returns ���f����
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

/**
 * �o�b�`����
 */
function runBatch(customscript, customdeploy, scheduleparams) {	
	try {
		var sleeptime = 10000;
		var status_jo;
		do {
			var status_jo = nlapiScheduleScript(customscript, customdeploy,
					scheduleparams);
			// �o�b�`���Ăяo��
			if (status_jo != 'QUEUED') {
				sleep(10000);
				sleeptime += 10000;
			}
			if (sleeptime >= 250000) {
				nlapiLogExecution('debug', '���s���Ԃ����߂��܂���');
				return;
			}
		} while (status_jo != 'QUEUED');		
	} catch (e) {
		nlapiLogExecution('debug', '�v���W�F�N�g���������ُ�:', e);
	}
}

/**
 * sleep
 */
function sleep(waitMsec) {
    var startMsec = new Date();

    while (new Date() - startMsec < waitMsec);
}

/**
 * ����o�b�`�̎��s�X�e�[�^�X���擾����
 * 
 * @param deploymentId
 * @returns {String}
 */
function getScheduledScriptRunStatus(deploymentId) {

	var filters = new Array();
	filters.push(new nlobjSearchFilter('datecreated', null, 'onOrAfter',
			getScheduledScriptDate()));
	filters.push(new nlobjSearchFilter('scriptid', 'scriptdeployment', 'is',
			deploymentId));

	var columns = new Array();
	columns.push(new nlobjSearchColumn('datecreated', null, 'max')
			.setWhenOrderedBy('datecreated', null).setSort(true));
	columns.push(new nlobjSearchColumn('status', null, 'group'));

	var scheduledStatusList = nlapiSearchRecord('scheduledscriptinstance',
			null, filters, columns);
	var status = '';
	if (scheduledStatusList != null && scheduledStatusList.length > 0) {
		status = scheduledStatusList[0].getValue('status', null, 'group')
				.toUpperCase();
	}

	return status;
}

/**
 * �o�b�`���s���t���擾����
 * 
 * @returns
 */
function getScheduledScriptDate() {
	var now = getSystemTime();
	now.setHours(0, 0, 0, 0);
	return now;
}