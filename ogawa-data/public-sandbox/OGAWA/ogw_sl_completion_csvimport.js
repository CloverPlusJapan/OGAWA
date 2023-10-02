/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/04/10     CPC_�v
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

var so_ogj_custform ="244";
var po_ogj_custform ='243';
var soCsvfile = '528';
var devpUrl='https://3701295-sb1.app.netsuite.com';
function suitelet(request, response){
	if (request.getMethod() == 'POST') {
		run(request, response);
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response,request.getParameter('custparam_logform'),request.getParameter('custparam_csvfileid'))
		}else{
			createForm(request, response);
		}
	}	 
}


function run(request, response){
	var xmlString = '�������ԍ�,�������t,�ڋq,�A�C�e��,CUST. PO#,��������,���׍ςݐ���,���ב҂�����,�̔��P��,�̔��ŋ��R�[�h,ETA,�������ԍ�,�w���P��,�w���ŋ��R�[�h,�d����,��̗\���,����\r\n';
	var ctx = nlapiGetContext();	
	var scheduleparams = new Array();
	var file=request.getFile('custpage_importfile'); //CSV File
	var parameter = new Array();
	if(!isEmpty(file)){
		file.setEncoding('SHIFT_JIS');
		file.setFolder(soCsvfile);
		var fileId = nlapiSubmitFile(file);
		scheduleparams['custscript_ogw_csv_file_id'] = fileId;	
		var resultR=nlapiCreateRecord('customrecord_ogw_csvimport_result');
		resultR.setFieldValue('custrecord_csvimport_name', '���׊����iCSV�C���|�[�g');
		resultR.setFieldValue('custrecord_ogw_csv_status', '1');
		resultR.setFieldValue('custrecord_ogw_old_file',fileId);
		var fileRecordId = nlapiSubmitRecord(resultR, false, true);
		scheduleparams['custscript_ogw_csv_filerecord_id'] = fileRecordId;
		runBatch('customscript_ogw_ss_completion_csvimport', 'customdeploy_ogw_ss_completion_csvimport', scheduleparams);
		parameter['custparam_logform'] = '1';
		parameter['custparam_csvfileid'] = fileRecordId;
	}else{
		var theCount = parseInt(request.getLineItemCount('list'));
		var soValue = '';
		for(var i = 0 ; i < theCount; i++){
			var chk = request.getLineItemValue('list', 'checkbox', i+1);//FLG
			var tranid = request.getLineItemValue('list', 'salesorder_no', i+1);//�����ԍ�  
			var trandate = request.getLineItemValue('list', 'salesorder_date', i+1);//�������t 
			var entity = request.getLineItemValue('list', 'salesorder_customer', i+1);//�ڋq 
			var item = request.getLineItemValue('list', 'salesorder_item', i+1);//�A�C�e��
			var custcol7 = request.getLineItemValue('list', 'salesorder_custpo', i+1);//CUST. PO# 
			var quantity = request.getLineItemValue('list', 'salesorder_quantity', i+1);//��������		
			var quantitypicked = request.getLineItemValue('list', 'salesorder_received', i+1);//���׍ςݐ��� 
			var entrywait = request.getLineItemValue('list', 'salesorder_entrywait', i+1);//���ב҂�����	
			var soRate = request.getLineItemValue('list', 'salesorder_rate', i+1);//�̔��P��
			var taxcode = request.getLineItemValue('list', 'salesorder_tax', i+1);//�ŋ��R�[�h 
			var eta = request.getLineItemValue('list', 'salesorder_eta', i+1);//ETA
			var poName = request.getLineItemValue('list', 'salesorder_poname', i+1);//�������ԍ� 
			var poRate = request.getLineItemValue('list', 'salesorder_porate', i+1);//�w���P��
			var poTaxcod = request.getLineItemValue('list', 'salesorder_potax', i+1);//�w���ŋ��R�[�h
			var poVendor = request.getLineItemValue('list', 'salesorder_povendor', i+1);//�d���� 
			var expectedreceiptdate = request.getLineItemValue('list', 'salesorder_reservationdate', i+1);//��̗\��� 
			var description = request.getLineItemValue('list', 'salesorder_description', i+1);//���� 
			if(chk == 'T'){
				xmlString+=tranid+',"'+trandate+'","'+entity+'","'+item+'","'+custcol7+'","'+quantity+'","'+quantitypicked+'","'+entrywait+'","'+
				soRate+'","'+taxcode+'",'+eta+',"'+poName+'","'+poRate+'","'+poTaxcod+'","'+poVendor+'","'+expectedreceiptdate+'","'+description+'"\r\n';
			}
		}
		var oldFieldName = "���׊����i�f�[�^�捞"
	    var nxlsFile = nlapiCreateFile(oldFieldName.split('.csv')[0]+'_'+RondomStr()+'_'+'results.csv', 'CSV', xmlString);
	    nxlsFile.setFolder(soCsvfile);
	    nxlsFile.setName(oldFieldName.split('.csv')[0]+'_'+RondomStr()+'_'+'results.csv');
	    nxlsFile.setEncoding('SHIFT_JIS');
	    var newFileID = nlapiSubmitFile(nxlsFile);
	    var resultR=nlapiCreateRecord('customrecord_ogw_csvimport_result');
		resultR.setFieldValue('custrecord_csvimport_name', '���׊����iCSV�C���|�[�g');
		resultR.setFieldValue('custrecord_ogw_csv_status', '1');
		resultR.setFieldValue('custrecord_ogw_old_file',newFileID);
		var fileRecordId = nlapiSubmitRecord(resultR, false, true);
		scheduleparams['custscript_ogw_csv_filerecord_id'] = fileRecordId;
		scheduleparams['custscript_ogw_csv_file_id'] = newFileID;	
		runBatch('customscript_ogw_ss_completion_csvimport', 'customdeploy_ogw_ss_completion_csvimport', scheduleparams);
		parameter['custparam_logform'] = '2';	
		parameter['custparam_csvfileid'] = fileRecordId;
	}
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

function logForm(request, response,logflag,csvfileid,recordid){
	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_ogw_cs_completion_csvimport');
	var csvStatusLabel = '';
	nlapiLogExecution("debug", "logflag", logflag);
	if(logflag == '1'){
		if(!isEmpty(csvfileid)){
			var csvRecord = nlapiLoadRecord('customrecord_ogw_csvimport_result', csvfileid);
			var csvStatus = csvRecord.getFieldText('custrecord_ogw_csv_status');
			csvStatusLabel = "CSV�t�@�C��" + "" + csvStatus;	
		}
	}
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	form.addButton('custpage_refresh', '�X�V', 'refresh();');
	// �o�b�`���
	var batchStatus = getStatus('customdeploy_ogw_ss_completion_csvimport');
	if (batchStatus == 'FAILED') {
		// ���s���s�̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text','', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
		runstatusField.setDefaultValue(messageColour+" "+csvStatusLabel);
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {
		// ���s���̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text','', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('�o�b�`���������s��'+" "+csvStatusLabel);
		response.writePage(form);
	}else{
		resultForm(csvfileid);	
	}
}


//��ʍ쐬
function createForm(request, response){
	//�p�����[�^�擾
	var subsidiaryValue = request.getParameter('subsidiary');//�q���
	var salesorderValue = request.getParameter('salesorder');//�������ԍ�
	var purchaseorderValue = request.getParameter('purchaseorder');//�������ԍ�
	var customerValue = request.getParameter('customer');//�ڋq
	var itemValue = request.getParameter('item');//�A�C�e��
	var vendorValue = request.getParameter('vendor');//�d����
	var employeeValue = request.getParameter('employee');//�]�ƈ�
	var soEtaValue = request.getParameter('eta');//eta
	var soDateValue = request.getParameter('date');//�������t
	var soCreateDateValue = request.getParameter('createdate');//�����쐬��
	var selectFlg = request.getParameter('selectFlg');
	var form = nlapiCreateForm('���׊����i�f�[�^�捞���', false);
	form.setScript('customscript_ogw_cs_completion_csvimport');
	form.addFieldGroup('select_group', '����');
	var subsidiaryField =form.addField('custpage_subsidiary', 'select', '�q���', 'subsidiary', 'select_group');
	subsidiaryField.setMandatory(true);
	if(selectFlg != 'T'){
		if(isEmpty(subsidiaryValue)){
			subsidiaryValue = 1;
		}
	}
	 
	var customerField = form.addField('custpage_customer', 'select', '�ڋq',null, 'select_group');
	var customerSearch  = getSearchResults("customer",null,
			[
			 	["subsidiary","anyof",subsidiaryValue],
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("altname"),
			   new nlobjSearchColumn("entityid"),
			]
			);	
	customerField.addSelectOption('','');
	for(var i = 0; i<customerSearch.length;i++){
		var customerText = '';
		var entityid = customerSearch[i].getValue('entityid');
		var altname = customerSearch[i].getValue('altname');
		if(!isEmpty(entityid)){
			customerText += entityid;
		}
		if(!isEmpty(altname)&& !isEmpty(customerText)){
			customerText += " " + altname;
		}
		customerField.addSelectOption(customerSearch[i].getValue("internalid"),customerText);
	}
	
	var soField = form.addField('custpage_salesorder', 'select', '�������ԍ�',null, 'select_group');	
	soField.addSelectOption('','');
	var oldTranidArr = new Array();
	var oldInternalidArr = new Array();
	var soSearch = getSearchResults('salesorder',null,
			
			[ 		
			 	 ["mainline","is","F"],
			 	 "AND",
			 	 ["subsidiary","anyof",subsidiaryValue],
			 	 "AND",
			 	 ["customform","anyof",so_ogj_custform],
			 	 "AND",
			 	["status","anyof","SalesOrd:B","SalesOrd:A","SalesOrd:D","SalesOrd:E"],
			],
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("internalid"),

			]
			);
	if(!isEmpty(soSearch)){
		for(var i = 0; i<soSearch.length;i++){
			oldTranidArr.push(soSearch[i].getValue("tranid"));//�����ԍ�
			oldInternalidArr.push(soSearch[i].getValue("internalid"));//����ID
		}
		var tranidArr = unique1(oldTranidArr);//�������ԍ�
		var internalidArr = unique1(oldInternalidArr);//����ID
		for(var i = 0; i < tranidArr.length; i++){
			soField.addSelectOption(internalidArr[i],tranidArr[i]);
		}
	}
	
	var soDateField = form.addField('custpage_date', 'date', '�������t',null, 'select_group');
	var soCreateDateField = form.addField('custpage_createdate', 'date', '�����쐬��',null, 'select_group');

	var itemField =form.addField('custpage_item', 'select', '�A�C�e��',null, 'select_group');
	var searchItem = getSearchResults('item',null,
			["subsidiary","anyof",subsidiaryValue], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("itemid"),
			   new nlobjSearchColumn("displayname"),
			]
			);
	itemField.addSelectOption('', '');
	for(var i = 0; i<searchItem.length;i++){
		var itemText = '';
		var itemid = searchItem[i].getValue('itemid');
		var displayname = searchItem[i].getValue('displayname');
		if(!isEmpty(itemid)){
			itemText += itemid;
		}
		if(!isEmpty(displayname)&& !isEmpty(itemText)){
			itemText += " " + displayname;
		}
		itemField.addSelectOption(searchItem[i].getValue("internalid"),itemText);
	}
	
	var vendorField =form.addField('custpage_vendor', 'select', '�d����',null, 'select_group');
	var searchVendor = getSearchResults('vendor',null,
				["subsidiary","anyof",subsidiaryValue], 
				[
				   new nlobjSearchColumn("entityid"), 
				   new nlobjSearchColumn("internalid"),
				   new nlobjSearchColumn("altname")
				]
				);
		vendorField.addSelectOption('', '');
		for(var i = 0; i<searchVendor.length;i++){
			var vendortxt='';
			var entityid = searchVendor[i].getValue('entityid');
			var altname = searchVendor[i].getValue('altname');
			if(!isEmpty(entityid)){
				vendortxt += entityid;
			}
			if(!isEmpty(altname)&& !isEmpty(vendortxt)){
				vendortxt += " " + altname;
			}
			vendorField.addSelectOption(searchVendor[i].getValue("internalid"),vendortxt);
		}

	var poField =form.addField('custpage_po', 'select', '�������ԍ�',null, 'select_group');
	poField.addSelectOption('', '');
	var poOldTranidArr = new Array();
	var poOldInternalidArr = new Array();
	var poSearch = getSearchResults('purchaseorder',null,		
			[ 		
			 	 ["mainline","is","F"],
			 	 "AND",
			 	 ["subsidiary","anyof",subsidiaryValue],
			 	 "AND",
			 	 ["customform","anyof",po_ogj_custform],
			 	 "AND",
			 	 ["createdfrom","noneof","@NONE@"]
			],
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("internalid"),
			]
			);
	if(!isEmpty(soSearch)){
		for(var i = 0; i<poSearch.length;i++){
			poOldTranidArr.push(poSearch[i].getValue("tranid"));//�������ԍ�
			poOldInternalidArr.push(poSearch[i].getValue("internalid"));
		}
		var poTranidArr = unique1(poOldTranidArr);//
		var poInternalidArr = unique1(poOldInternalidArr);//
		for(var i = 0; i < poTranidArr.length; i++){
			poField.addSelectOption(poInternalidArr[i],poTranidArr[i]);
		}
	}
	var soEtaField = form.addField('custpage_eta', 'date', 'ETA',null, 'select_group');
	var employeeField = form.addField('custpage_employee', 'select', '�����쐬��','employee', 'select_group'); 
	if(selectFlg == 'T'){	
		soField.setDisplayType('inline');//�������ԍ�
		customerField.setDisplayType('inline');//�ڋq
		subsidiaryField.setDisplayType('inline');//�q���
		itemField.setDisplayType('inline');//�A�C�e��
		employeeField.setDisplayType('inline');//�����쐬��
		vendorField.setDisplayType('inline');//�d����
		poField.setDisplayType('inline');//�������ԍ�
		soEtaField.setDisplayType('inline'); //ETA
		soDateField.setDisplayType('inline'); //�������t
		soCreateDateField.setDisplayType('inline'); //�����쐬��
		var fileField=form.addField('custpage_importfile', 'file', 'CSV�t�@�C���̃A�b�v���[�h');
		fileField.setLayoutType('outsideabove', 'startcol');
		var csvRecordId=request.getParameter('selectLine');
		var csvString = '';
		var selectLineArray=new Array();
		if(!isEmpty(csvRecordId)){
			var csvRecord=nlapiLoadRecord('customrecord_ogw_csv_download', csvRecordId);
			var csvRecordCon = csvRecord.getLineItemCount('recmachcustrecord_ogw_csv_download_list');
			for(var i=1;i<csvRecordCon+1;i++){
				csvRecord.selectLineItem('recmachcustrecord_ogw_csv_download_list', i);
				var jsonText = csvRecord.getCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list', 'custrecord_ogw_json_text');
				var jsonTex2 = csvRecord.getCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list', 'custrecord_ogw_json_text2');
				var jsonTex3 = csvRecord.getCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list', 'custrecord_ogw_json_text3');
				var jsonTex4 = csvRecord.getCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list', 'custrecord_ogw_json_text4');
				var jsonTex5 = csvRecord.getCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list', 'custrecord_ogw_json_text5');
				var jsonTex6 = csvRecord.getCurrentLineItemValue('recmachcustrecord_ogw_csv_download_list', 'custrecord_ogw_json_text6');
				csvString+=jsonText+jsonTex2+jsonTex3+jsonTex4+jsonTex5+jsonTex6;
				if(!isEmpty(csvString)){
					selectLineArray=csvString.split("*");
				}
			}
		}	
	}
	
	subsidiaryField.setDefaultValue(subsidiaryValue);//�q���
	soField.setDefaultValue(salesorderValue);//�������ԍ�
	customerField.setDefaultValue(customerValue);//�ڋq
	itemField.setDefaultValue(itemValue);//�A�C�e��
	vendorField.setDefaultValue(vendorValue);//�d����
	poField.setDefaultValue(purchaseorderValue);//�������ԍ�
	employeeField.setDefaultValue(employeeValue);//�����쐬��
	soEtaField.setDefaultValue(soEtaValue);//ETA
	soDateField.setDefaultValue(soDateValue);//�������t
	soCreateDateField.setDefaultValue(soCreateDateValue);//�����쐬��
	
	if(selectFlg == 'T'){
		var filit = new Array();
		filit.push(["type","anyof","SalesOrd"]);
//		//���׍s
		filit.push("AND");
		filit.push(["mainline","is","F"]);
		//�����ȊO
		filit.push("AND");
		filit.push(["voided","is","F"]);
		//�ŋ����C���O��
		filit.push("AND");
		filit.push(["taxline","is","F"]);
		//OGJ
		filit.push("AND");
		filit.push(["customform","anyof",so_ogj_custform]);
		//STATUS
		filit.push("AND");
		filit.push(["status","anyof","SalesOrd:B","SalesOrd:A","SalesOrd:D","SalesOrd:E"]);
		//�q���
		if(!isEmpty(subsidiaryValue)){
			filit.push("AND");
			filit.push(["subsidiary","anyof",subsidiaryValue]);
		}
		//�������ԍ�
		if(!isEmpty(salesorderValue)){
			filit.push("AND");
			filit.push(["internalid","anyof",salesorderValue]);
		}
		//�ڋq
		if(!isEmpty(customerValue)){
			filit.push("AND");
			filit.push(["entity","anyof",customerValue]);
		}
		//�A�C�e��
		if(!isEmpty(itemValue)){
			filit.push("AND");
			filit.push(["item","anyof",itemValue]);
		}
		//�d����
		if(!isEmpty(vendorValue)){
			filit.push("AND");
			filit.push(["purchaseorder.name","anyof",vendorValue]);
		}
		//�������ԍ�
		if(!isEmpty(purchaseorderValue)){
			filit.push("AND");
			filit.push(["purchaseorder","anyof",purchaseorderValue]);
		}
		//�����쐬��
		if(!isEmpty(employeeValue)){
			filit.push("AND");
			filit.push(["createdby","anyof",employeeValue]);
		}
		//ETA
		if(!isEmpty(soEtaValue)){
			filit.push("AND");
			filit.push(["custcol_eta","on",soEtaValue]);
		}
		//���t
		if(!isEmpty(soDateValue)){
			filit.push("AND");
			filit.push(["trandate","on",soDateValue]);
		}
		//�����쐬��
		if(!isEmpty(soCreateDateValue)){
			filit.push("AND");
			filit.push(["datecreated","on",soCreateDateValue]);
		}
		var salesorderSearch = getSearchResults("salesorder",null,
				filit, 
				[
				   new nlobjSearchColumn("internalid"), //����id
				   new nlobjSearchColumn("tranid"), //�����ԍ�
				   new nlobjSearchColumn("trandate"),//���t
				   new nlobjSearchColumn("entity"),// �ڋq
				   new nlobjSearchColumn("item"), //�A�C�e��
				   new nlobjSearchColumn("custcol7"),//CUST. PO# 
				   new nlobjSearchColumn("taxcode"), //�ŋ��R�[�h
				   new nlobjSearchColumn("custcol_eta"), //ETA
				   new nlobjSearchColumn("tranid","purchaseOrder",null), //po�ԍ�
				   new nlobjSearchColumn("internalid","purchaseOrder",null), //poID
				   new nlobjSearchColumn("expectedreceiptdate"),//��̗\��� 
				   new nlobjSearchColumn("memo"), //���� 
				   new nlobjSearchColumn("line"), //line 
				   new nlobjSearchColumn("quantity"), //�������� 
				   new nlobjSearchColumn("quantitypicked"),//���׍ςݐ��� 
				   new nlobjSearchColumn("fxrate"),//�̔��P��
				   new nlobjSearchColumn("fxrate","purchaseOrder",null),//�w���P��   
				   new nlobjSearchColumn("taxcode","purchaseOrder",null),//�w���ŋ��R�[�h - 0509
				   new nlobjSearchColumn("internalid","item",null), //�A�C�e��ID
				   new nlobjSearchColumn("internalid","customer",null)//�ڋq : ����ID
				]
				);
		var purchaseorderSearch = getSearchResults("purchaseorder",null,
				[
				   ["type","anyof","PurchOrd"], 
				   "AND", 
				   ["customform","anyof",po_ogj_custform],
				   "AND",
				   ["createdfrom","noneof","@NONE@"],
				], 
				[
				   new nlobjSearchColumn("entity"), 
				   new nlobjSearchColumn("tranid"),
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("rate","taxItem",null)//�w���ŗ�
				]
				);
		var poArr = new Array();
		if(!isEmpty(purchaseorderSearch)){
			for(var i = 0 ; i < purchaseorderSearch.length ;i++){
				poArr.push(purchaseorderSearch[i].getValue("tranid"));	
			}
		}

		var subList = form.addSubList('list', 'list', 'list');
		subList.addMarkAllButtons();
		subList.addField('checkbox', 'checkbox', '�I��');
		var linkField=subList.addField('linkurl', 'url', '�\��');
		linkField.setLinkText('�\��');
		subList.addField('salesorder_no', 'text', '�������ԍ�');
		subList.addField('salesorder_soid', 'text', '������ID').setDisplayType('hidden');
		subList.addField('salesorder_date', 'date', '�������t').setDisplayType('entry'); 
		subList.addField('salesorder_customer', 'text', '�ڋq');
		subList.addField('salesorder_customerid', 'text', '�ڋqID').setDisplayType('hidden');
		subList.addField('salesorder_item', 'text', '�A�C�e��');
		subList.addField('salesorder_itemid', 'text', '�A�C�e��ID').setDisplayType('hidden');
		subList.addField('salesorder_line', 'text', 'line').setDisplayType('hidden');
		subList.addField('salesorder_custpo', 'text', 'CUST. PO#').setDisplayType('entry');
		subList.addField('salesorder_quantity', 'text', '��������');
		subList.addField('salesorder_received', 'text', '���׍ςݐ���');
		subList.addField('salesorder_entrywait', 'float', '���ב҂�����').setDisplayType('entry'); 
		subList.addField('salesorder_rate', 'text', '�̔��P��').setDisplayType('entry');
		subList.addField('salesorder_tax', 'text', '�̔��ŋ��R�[�h');
		subList.addField('salesorder_eta', 'date', 'ETA').setDisplayType('entry');
		subList.addField('salesorder_poname', 'text', '�������ԍ�');
		subList.addField('salesorder_porate', 'text', '�w���P��').setDisplayType('entry');
		subList.addField('salesorder_potax', 'text', '�w���ŋ��R�[�h');
		subList.addField('salesorder_poid', 'text', '������Id').setDisplayType('hidden');
		subList.addField('salesorder_povendor', 'text', '�d����');
		subList.addField('salesorder_reservationdate', 'text', '��̗\���');
		subList.addField('salesorder_description', 'text', '����'); 
		var xmlString = '�������ԍ�,�������t,�ڋq,�A�C�e��,CUST. PO#,��������,���׍ςݐ���,���ב҂�����,�̔��P��,�̔��ŋ��R�[�h,ETA,�������ԍ�,�w���P��,�w���ŋ��R�[�h,�d����,��̗\���,����\r\n';
		var consAdd = '';
		var custbody2 = '';
		var countText = 0;
		if(!isEmpty(salesorderSearch)){
			var lineCount = 1;
			for(var i = 0 ; i < salesorderSearch.length ;i++){
				var tranid = salesorderSearch[i].getValue("tranid");//�����ԍ�
				var trandate = salesorderSearch[i].getValue("trandate");//���t
				var entity = salesorderSearch[i].getText("entity");//�ڋq
				var entityId = salesorderSearch[i].getValue("internalid","customer",null);//�ڋqID
				var item = salesorderSearch[i].getText("item");//�A�C�e��
				var itemId = salesorderSearch[i].getValue("internalid","item",null);//�A�C�e��ID
				var custcol7 = salesorderSearch[i].getValue("custcol7");//CUST. PO# 
				var taxcode = salesorderSearch[i].getText("taxcode");//�ŋ��R�[�h
				var eta = salesorderSearch[i].getValue("custcol_eta");//ETA
				var poName = salesorderSearch[i].getValue("tranid","purchaseOrder",null);//PO�ԍ�
				var poId = salesorderSearch[i].getValue("internalid","purchaseOrder",null);//POID
				var rate = defaultEmpty(parseFloat(salesorderSearch[i].getValue("fxrate")));//�̔��P��
				var soInternalid = salesorderSearch[i].getValue("internalid");//����ID
				poArr_index = poArr.indexOf(poName);
				if(poArr_index < 0){
					var poVendor = '';
				}else{
					var poVendor = purchaseorderSearch[poArr_index].getText("entity"); //�d����
				}
				var line = salesorderSearch[i].getValue("line");//line
				var poTaxcode = salesorderSearch[i].getText("taxcode","purchaseOrder",null);//�w���ŋ��R�[�h
				var poRate = defaultEmpty(parseFloat(salesorderSearch[i].getValue("fxrate","purchaseOrder",null)));//�w���P��
				var expectedreceiptdate = salesorderSearch[i].getValue("expectedreceiptdate");//��̗\��� 
				var description = salesorderSearch[i].getValue("memo");//����
				var quantity = defaultEmpty(parseFloat(salesorderSearch[i].getValue("quantity")));//�������� 
				var quantitypicked = defaultEmpty(parseFloat(salesorderSearch[i].getValue("quantitypicked")));//���׍ςݐ��� 
				var entrywait = Number(quantity-quantitypicked);//���ב҂�����
				
				if(entrywait != 0){
					var theLink = nlapiResolveURL('RECORD', 'salesorder',soInternalid ,'VIEW');
					subList.setLineItemValue('linkurl',lineCount, theLink);//�\��
					subList.setLineItemValue('salesorder_no', lineCount, tranid);//�����ԍ�  
					subList.setLineItemValue('salesorder_soid', lineCount, soInternalid);//����ID
					subList.setLineItemValue('salesorder_date', lineCount, trandate);//�������t
					subList.setLineItemValue('salesorder_customer', lineCount, entity);//�ڋq
					subList.setLineItemValue('salesorder_customerid', lineCount, entityId);//�ڋqID
					subList.setLineItemValue('salesorder_item', lineCount, item);//�A�C�e��
					subList.setLineItemValue('salesorder_itemid', lineCount, itemId);//�A�C�e��ID
					subList.setLineItemValue('salesorder_line', lineCount, line);//line ID
					subList.setLineItemValue('salesorder_custpo', lineCount, custcol7);//CUST. PO# 
					subList.setLineItemValue('salesorder_rate', lineCount, rate);//�̔��P��
					subList.setLineItemValue('salesorder_potax', lineCount, poTaxcode);//�w���ŋ��R�[�h
					subList.setLineItemValue('salesorder_tax', lineCount, taxcode);//�ŋ��R�[�h
					subList.setLineItemValue('salesorder_eta', lineCount, eta);//ETA
					subList.setLineItemValue('salesorder_poname', lineCount, poName);//PO�ԍ�
					subList.setLineItemValue('salesorder_porate', lineCount, poRate);//�w���P��
					subList.setLineItemValue('salesorder_poname', lineCount, poName);//PO�ԍ�
					subList.setLineItemValue('salesorder_poid', lineCount, poId);//poId
					subList.setLineItemValue('salesorder_povendor', lineCount, poVendor);//�d����
					subList.setLineItemValue('salesorder_reservationdate', lineCount, expectedreceiptdate);//��̗\��� 
					subList.setLineItemValue('salesorder_description', lineCount, description);//����
					subList.setLineItemValue('salesorder_quantity', lineCount, quantity);//��������
					subList.setLineItemValue('salesorder_received', lineCount, quantitypicked);//���׍ςݐ��� 
					subList.setLineItemValue('salesorder_entrywait', lineCount, entrywait);//���ב҂�����
					var csvValue=soInternalid+'|'+entityId+'|'+trandate+'|'+itemId+'|'+line;
					if(selectLineArray.indexOf(csvValue) > -1){
						xmlString+=tranid+',"'+trandate+'","'+entity+'","'+item+'","'+custcol7+'","'+quantity+'","'+quantitypicked+'","'+entrywait+'","'+rate+'","'+taxcode+'",'+eta+',"'+poName+'","'+
						poRate+'","'+poTaxcode+'","'+poVendor+'","'+expectedreceiptdate+'","'+description+'"\r\n';
					}
					lineCount++;
					countText++;
				}
			}
		}
	subList.setLabel('���ב҂��ڍ�:'+countText+'��')
	form.addButton('csvdownload', 'CSV�e���v���[�g�̃_�E�����[�h', 'csvDownload();');
	form.addButton('btn_return', '�����߂�','searchReturn()')
	form.addSubmitButton('���s');
	}else{
		form.addButton('btn_search', '����', 'search()')
	}
	
	if(request.getParameter('downloadFlag')=='T'){
		var url=csvDown(xmlString);
		response.write(url);
	}else{
		response.writePage(form);
	}
}


function resultForm(csvfileid){  
	if(!isEmpty(csvfileid)){
		var csvfileRecord = nlapiLoadRecord('customrecord_ogw_csvimport_result', csvfileid);//CSV�C���|�[�g����
		var resultsCsv = csvfileRecord.getFieldValue('custrecord_ogw_csvimport_results');//CSVID
		if(!isEmpty(resultsCsv)){
			var file = nlapiLoadFile(resultsCsv); // CSV�t�@�C��
			var fileArr = file.getValue().split('\r\n');
			
			var form = nlapiCreateForm('���׊����i�f�[�^�捞��ʌ���', false);
			var subList = form.addSubList('list', 'list', '���ב҂����ʈꗗ');
			subList.addMarkAllButtons();
			var theLink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_completion_csvimport', 'customdeploy_ogw_sl_completion_csvimport');
			var backbtns = "window.location.href='"+devpUrl+theLink+"&whence='";
			form.addButton('custpage_refresh', '�߂�', backbtns);
			subList.addField('csv_error', 'textarea', '�G���[');
			var csvLink=subList.addField('csv_link', 'url', '�\��');
			csvLink.setLinkText('�\��');
			subList.addField('csv_sonum', 'text', '�������ԍ�');
			subList.addField('csv_date', 'text', '�������t');
			subList.addField('csv_entity', 'text', '�ڋq');
			subList.addField('csv_itme', 'text', '�A�C�e��');
			subList.addField('csv_custpo', 'text', 'CUST. PO#');
			subList.addField('csv_soquantity', 'text', '��������');
			subList.addField('csv_quantitypicked', 'text', '���׍ςݐ���');
			subList.addField('csv_quantity', 'text', '���ב҂�����');
			subList.addField('csv_sorate', 'text', '�̔��P��');
			subList.addField('csv_tax', 'text', '�̔��ŋ��R�[�h');
			subList.addField('csv_eta', 'text', 'ETA');
			subList.addField('csv_ponum', 'text', '�������ԍ�');
			subList.addField('csv_porate', 'text', '�w���P��');
			subList.addField('csv_potax', 'text', '�w���ŋ��R�[�h');
			subList.addField('csv_poentity', 'text', '�d����');
			subList.addField('csv_mode', 'text', '��̗\���');
			subList.addField('csv_memo', 'text', '����');
			var cont = 1;
			var soSearch = getSearchResults("salesorder",null,
					[
					   ["type","anyof","SalesOrd"], 
					   "AND", 
					   ["customform","anyof",so_ogj_custform],
					], 
					[
					   new nlobjSearchColumn("tranid"), 
					   new nlobjSearchColumn("internalid"),
					]
					);
			var soArr = new Array();
			if(!isEmpty(soSearch)){
				for(var i = 0 ; i < soSearch.length ;i++){
					soArr.push(soSearch[i].getValue("tranid"));	
				}
			}
			for(var i = 1 ; i  < fileArr.length ; i++){
				if(!isEmpty(fileArr[i])){
					 var fileLine = csvDataToArray(fileArr[i].toString());
					 var csv_error=fileLine[0];// �G���[
					 var csv_sonum=defaultEmpty(fileLine[1]);// �������ԍ�
					 var csv_date=defaultEmpty(fileLine[2]);// �������t
					 var csv_entity=defaultEmpty(fileLine[3]);// �ڋq
					 var csv_itme=defaultEmpty(fileLine[4]);// �A�C�e��
					 var csv_custpo=defaultEmpty(fileLine[5]);// CUST. PO#
					 var csv_soquantity=defaultEmpty(fileLine[6]);// ��������
					 var csv_quantitypicked=defaultEmpty(fileLine[7]);// ���׍ςݐ���
					 var csv_quantity=defaultEmpty(fileLine[8]);// ���ב҂�����
					 var csv_sorate=defaultEmpty(fileLine[9]);// �̔��P��
					 var csv_tax=defaultEmpty(fileLine[10]);// �̔��ŋ��R�[�h
					 var csv_eta=defaultEmpty(fileLine[11]);// ETA
					 var csv_poname=defaultEmpty(fileLine[12]);//�������ԍ�
					 var csv_porate=defaultEmpty(fileLine[13]);//�w���P��
					 var csv_potax=defaultEmpty(fileLine[14]);//�w���ŋ��R�[�h
					 var csv_poEntity=defaultEmpty(fileLine[15]);// �d����
					 var csv_mode=defaultEmpty(fileLine[16]);// ��̗\���
					 var csv_memo=defaultEmpty(fileLine[17]);// ����
					 
					 var soArr_index = soArr.indexOf(csv_sonum);
					 if(soArr_index >= 0){
						var soId = soSearch[soArr_index].getValue("internalid"); //ID 
						if(!isEmpty(soId)){
							var csvTheLink = nlapiResolveURL('RECORD', 'salesorder',soId ,'VIEW');
							subList.setLineItemValue('csv_link',cont, csvTheLink);
						}
					 }
					 subList.setLineItemValue('csv_error', cont, csv_error);// �G���[
					 subList.setLineItemValue('csv_sonum', cont, csv_sonum);// �������ԍ�
					 subList.setLineItemValue('csv_date', cont, csv_date);//  �������t
					 subList.setLineItemValue('csv_entity', cont, csv_entity);	// �ڋq
					 subList.setLineItemValue('csv_itme', cont, csv_itme);// �A�C�e��
					 subList.setLineItemValue('csv_custpo', cont, csv_custpo);// CUST. PO#
					 subList.setLineItemValue('csv_soquantity', cont, csv_soquantity);// ��������
					 subList.setLineItemValue('csv_quantitypicked', cont, csv_quantitypicked);// ���׍ςݐ���
					 subList.setLineItemValue('csv_quantity', cont, csv_quantity);//���ב҂�����
					 subList.setLineItemValue('csv_sorate', cont, csv_sorate);//�̔��P��
					 subList.setLineItemValue('csv_tax', cont, csv_tax);// TAX
					 subList.setLineItemValue('csv_eta', cont, csv_eta);//ETA
					 subList.setLineItemValue('csv_ponum', cont, csv_poname);// �������ԍ�
					 subList.setLineItemValue('csv_porate', cont, csv_porate);// �w���P��
					 subList.setLineItemValue('csv_potax', cont, csv_potax);//�w���ŋ��R�[�h
					 subList.setLineItemValue('csv_poentity', cont, csv_poEntity);// �d����
					 subList.setLineItemValue('csv_mode', cont, csv_mode);// ��̗\���
					 subList.setLineItemValue('csv_memo', cont, csv_memo);// ����
					 cont++;
				}
			}	
			response.writePage(form);
		}
	}
}


function csvDown(xmlString){
	try{
	
		var xlsFile = nlapiCreateFile('������' + '_' + getFormatYmdHms() + '.csv', 'CSV', xmlString);
		
		xlsFile.setFolder(soCsvfile);
		xlsFile.setName('������' + '_' + getFormatYmdHms() + '.csv');
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
function getStatus(deploymentId) {

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

function meaning (str){
	var meaningString = str.replace(/\r/g,"=").replace(/�B/g,"=");
	return  meaningString;
}


function unique1(arr){
	  var hash=[];
	  for (var i = 0; i < arr.length; i++) {
	     if(hash.indexOf(arr[i])==-1){
	      hash.push(arr[i]);
	     }
	  }
	  return hash;
}

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
	   function replace(text)
	   {
	   if ( typeof(text)!= "string" )
	      text = text.toString() ;

	   text = text.replace(/,/g, "_") ;

	   return text ;
	   }
	   return (arrData[0]);
}

function defaultEmpty(src){
	return src || " ";
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