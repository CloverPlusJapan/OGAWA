/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/03/03     CPC_�v
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
	var ctx = nlapiGetContext();	
	var scheduleparams = new Array();
	var file=request.getFile('custpage_importfile'); //CSV File
	var csvType=request.getParameter('custpage_sotype'); //Csv type
	var csvCustForm = request.getParameter('custpage_custform'); //�J�X�^���E�t�H�[��
	var parameter = new Array();
       //custpage_employee
	var user = request.getParameter('custpage_employee'); //Csv type
	if(!isEmpty(file)){
		file.setEncoding('SHIFT_JIS');
		file.setFolder(soCsvfile);
		var fileId = nlapiSubmitFile(file);
		scheduleparams['custscript_ogw_import_file'] = fileId;	
		var resultR=nlapiCreateRecord('customrecord_ogw_csvimport_result');
		resultR.setFieldValue('custrecord_csvimport_name', '������CSV�C���|�[�g');
		resultR.setFieldValue('custrecord_ogw_csv_status', '1');
		resultR.setFieldValue('custrecord_ogw_old_file',fileId);
		var fileRecordId = nlapiSubmitRecord(resultR, false, true);
		scheduleparams['custscript_ogw_import_filerecord_id'] = fileRecordId;
		scheduleparams['custscript_ogw_csv_type'] = csvType;
		scheduleparams['custscript_ogw_csv_user'] = user;
		scheduleparams['custscript_ogw_csv_custform'] = csvCustForm;
		runBatch('customscript_ogw_ss_so_csvimport', 'customdeploy_ogw_ss_so_csvimport', scheduleparams);
		parameter['custparam_logform'] = '1';
		parameter['custparam_csvfileid'] = fileRecordId;
	}else{
		nlapiLogExecution("debug", "test");
		parameter['custparam_logform'] = '2';		
	}
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}

function logForm(request, response,logflag,csvfileid){
	var form = nlapiCreateForm('�����X�e�[�^�X', false);
	form.setScript('customscript_ogw_cs_so_csvimport');
	if(!isEmpty(csvfileid)){
		var csvRecord = nlapiLoadRecord('customrecord_ogw_csvimport_result', csvfileid)
		var csvStatus = csvRecord.getFieldText('custrecord_ogw_csv_status');
		var csvStatusLabel = "CSV�t�@�C��" + "" + csvStatus;
		
	}
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	if(logflag == '1'){
		form.addButton('custpage_refresh', '�X�V', 'refresh();');
		// �o�b�`���
		var batchStatus = getStatus('customdeploy_ogw_ss_so_csvimport');
		if (batchStatus == 'FAILED') {
			// ���s���s�̏ꍇ
			var runstatusField = form.addField('custpage_run_info_status', 'text','', null, 'custpage_run_info');
			runstatusField.setDisplayType('inline');
			var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
			runstatusField.setDefaultValue(messageColour+"�A"+csvStatusLabel);
			response.writePage(form);
		} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

			// ���s���̏ꍇ
			var runstatusField = form.addField('custpage_run_info_status', 'text',
					'', null, 'custpage_run_info');
			runstatusField.setDisplayType('inline');
			runstatusField.setDefaultValue('�o�b�`���������s��'+"�A"+csvStatusLabel);
			response.writePage(form);
		}else{
			resultForm(csvfileid);
		}
	}else if(logflag == '2'){
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> CSV�t�@�C�����A�b�v���[�h���Ă��܂���</font>';
		runstatusField.setDefaultValue(messageColour);
		var theLink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_so_csvimport', 'customdeploy_ogw_sl_so_csvimport');
		var backbtns = "window.location.href='"+devpUrl+theLink+"&whence='";
		form.addButton('backbtns', '������ʂɖ߂�', backbtns);
		response.writePage(form);
	}
}


//��ʍ쐬
function createForm(request, response){
	//�p�����[�^�擾
	var subsidiaryValue = request.getParameter('subsidiary');//�q���
	var custformValue = request.getParameter('custform');//�J�X�^���E�t�H�[��
	var salesorderValue = request.getParameter('salesorder');//�������ԍ�
	var purchaseorderValue = request.getParameter('purchaseorder');//�������ԍ�
	var customerValue = request.getParameter('customer');//�ڋq
	var itemValue = request.getParameter('item');//�A�C�e��
	var vendorValue = request.getParameter('vendor');//�d����
	var employeeValue = request.getParameter('employee');//�]�ƈ�
	var selectFlg = request.getParameter('selectFlg');
	
	var form = nlapiCreateForm('������CSV Import���', false);
	form.setScript('customscript_ogw_cs_so_csvimport');
	 
	if(selectFlg == 'T'){
		form.addFieldGroup('select_csvtype', 'CSV Import���');
		var soTypeField = form.addField('custpage_sotype', 'select', 'CSV Import���',null,'select_csvtype');	
		soTypeField.addSelectOption('create','�V�K');
		soTypeField.addSelectOption('edit','�X�V');
		if(custformValue == 244){
			soTypeField.addSelectOption('cancel','�L�����Z��');
		}
	}
	
	form.addFieldGroup('select_group', '����');
	var subsidiaryField =form.addField('custpage_subsidiary', 'select', '�q���', 'subsidiary', 'select_group');
	subsidiaryField.setMandatory(true);
	if(selectFlg != 'T'){
		if(isEmpty(subsidiaryValue)){
			subsidiaryValue = 1;
		}
	}
	var custformField = form.addField('custpage_custform', 'select', '�J�X�^���E�t�H�[�� ',null, 'select_group');
	custformField.setMandatory(true);
	if(selectFlg != 'T'){
		if(isEmpty(custformValue)){
			custformValue = 244;
		}
	}
	custformField.addSelectOption('244','OGJ Sales Order');
	custformField.addSelectOption('118','OGS Sales Order');
	
	var employeeField = form.addField('custpage_employee', 'select', '�]�ƈ�','employee', 'select_group').setDisplayType('hidden'); 
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
			 	 ["customform","anyof",custformValue],
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
	
		
	if(selectFlg == 'T'){	
		soField.setDisplayType('inline');
		customerField.setDisplayType('inline');
		subsidiaryField.setDisplayType('inline');
		custformField.setDisplayType('inline');
		itemField.setDisplayType('inline');
		employeeField.setDisplayType('inline');
		vendorField.setDisplayType('inline');
		poField.setDisplayType('inline');
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
	
	subsidiaryField.setDefaultValue(subsidiaryValue);
	soField.setDefaultValue(salesorderValue);
	customerField.setDefaultValue(customerValue);
	itemField.setDefaultValue(itemValue);
	vendorField.setDefaultValue(vendorValue);
	poField.setDefaultValue(purchaseorderValue);
	var nowUser = nlapiGetUser();
	employeeField.setDefaultValue(nowUser);
	custformField.setDefaultValue(custformValue);
	
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
		if(!isEmpty(custformValue)){
			filit.push("AND");
			filit.push(["customform","anyof",custformValue]);
		}
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
			filit.push(["vendor","anyof",vendorValue]);
		}
		//�������ԍ�
		if(!isEmpty(purchaseorderValue)){
			filit.push("AND");
			filit.push(["purchaseorder","anyof",purchaseorderValue]);
		}
		var salesorderSearch = getSearchResults("salesorder",null,
				filit, 
				[
				   new nlobjSearchColumn("internalid"), //����id
				   new nlobjSearchColumn("tranid"), //�����ԍ�
				   new nlobjSearchColumn("entity"),// �ڋq
				   new nlobjSearchColumn("trandate"),//���t
				   new nlobjSearchColumn("item"), //�A�C�e��
				   new nlobjSearchColumn("memo"), //����
				   new nlobjSearchColumn("custcol_number"), //Number
				   new nlobjSearchColumn("custcol7"), //Cust. PO#
				   new nlobjSearchColumn("custcol1"), //PACKING DETAILS
				   new nlobjSearchColumn("quantity"), //����
				   new nlobjSearchColumn("fxrate"), //�P��
				   new nlobjSearchColumn("custcol_eta"), //ETA
				   new nlobjSearchColumn("taxcode"), //�ŋ��R�[�h
				   new nlobjSearchColumn("custbody1"), //CONSIGNEE
				   new nlobjSearchColumn("custbody_cons_add"), //CONSIGNEE ADDRESS
				   new nlobjSearchColumn("custbody2"), //SHIPPING MARK
				   new nlobjSearchColumn("custbody3"), //SHIPPING MODE
				   new nlobjSearchColumn("custbody_me_incoterms"), //INCOTERMS 
				   new nlobjSearchColumn("tranid","purchaseOrder",null), //po�ԍ�
				   new nlobjSearchColumn("pricelevel"),//���i����
				   new nlobjSearchColumn("message"),//�ڋq�ւ̃��b�Z�[�W
				   new nlobjSearchColumn("custbody_ogw_purchasecontract_select"),//�w���_��
				   new nlobjSearchColumn("internalid","item",null), //�A�C�e��ID
				   new nlobjSearchColumn("internalid","customer",null),//�ڋq : ����ID
				   new nlobjSearchColumn("currency"), //�ʉ�
				   new nlobjSearchColumn("line"), //line 
				]
				);
		
		var purchaseorderSearch = getSearchResults("purchaseorder",null,
				[
				   ["type","anyof","PurchOrd"], 
				   "AND", 
				   ["customform","anyof",po_ogj_custform],
				   "AND",
				   ["taxline","is","F"],
				   "AND",
				   ["createdfrom","noneof","@NONE@"]
				], 
				[
				   new nlobjSearchColumn("entity"), 
				   new nlobjSearchColumn("createdfrom"), 
				]
				);
		var poArr = new Array();
		if(!isEmpty(purchaseorderSearch)){
			for(var i = 0 ; i < purchaseorderSearch.length ;i++){
				poArr.push(purchaseorderSearch[i].getValue("createdfrom"));	
			}
		}
		var subList = form.addSubList('list', 'list', 'list');
		subList.addMarkAllButtons();
		subList.addField('checkbox', 'checkbox', '�I��');
		var linkField=subList.addField('linkurl', 'url', '�\��');
		linkField.setLinkText('�\��');
		subList.addField('salesorder_no', 'text', '�������ԍ�');
		subList.addField('salesorder_id', 'text', '������ID').setDisplayType('hidden');
		subList.addField('salesorder_customer', 'text', '�ڋq');
		subList.addField('salesorder_customerid', 'text', '�ڋqID').setDisplayType('hidden');
		subList.addField('salesorder_date', 'text', '���t');
		subList.addField('salesorder_currency', 'text', '�ʉ�');
		subList.addField('salesorder_line', 'text', 'line').setDisplayType('hidden');
		subList.addField('salesorder_num', 'text', 'NUMBER');
		subList.addField('salesorder_item', 'text', '�A�C�e��');
		subList.addField('salesorder_itemid', 'text', '�A�C�e��ID').setDisplayType('hidden');
		subList.addField('salesorder_price', 'text', '���i����');
		subList.addField('salesorder_description', 'text', 'Description'); 
		subList.addField('salesorder_custpo', 'text', 'CUST. PO#'); 	
		subList.addField('salesorder_packing', 'text', 'PACKING DETAILS');
		subList.addField('salesorder_quantity', 'text', 'QTY');
		subList.addField('salesorder_rate', 'text', '�P��');
		subList.addField('salesorder_eta', 'text', 'ETA');
		subList.addField('salesorder_tax', 'text', 'TAX');
		subList.addField('salesorder_consignee', 'text', 'CONSIGNEE');
		subList.addField('salesorder_consigneeadd', 'text', 'CONSIGNEE ADDRESS');
		subList.addField('salesorder_shippingmark', 'text', 'SHIPPING MARK');
		subList.addField('salesorder_shippingmode', 'text', 'SHIPPING MODE');
		subList.addField('salesorder_incoterms', 'text', 'INCOTERMS');
		subList.addField('salesorder_message', 'text', '�ڋq�ւ̃��b�Z�[�W');
		subList.addField('salesorder_poname', 'text', '���������쐬');
		subList.addField('salesorder_povendor', 'text', '�d����');
		subList.addField('salesorder_purchase', 'text', '�w���_��');
		var xmlString = '�����ԍ�,�ڋq,���t,�ʉ� ,NUMBER,�A�C�e��,���i����,DESCRIPTION,CUST. PO#,PACKING DETAILS,QTY,�P��,ETA,TAX,CONSIGNEE,CONSIGNEE ADDRESS,SHIPPING MARK,SHIPPING MODE,INCOTERMS,�ڋq�ւ̃��b�Z�[�W,�������ԍ�,�d����,�w���_��\r\n';
		var consAdd = '';
		var custbody2 = '';
		var description = '';
		var countText = 0;
		if(!isEmpty(salesorderSearch)){
			var lineCount = 1;
			for(var i = 0 ; i < salesorderSearch.length ;i++){
				var tranid = salesorderSearch[i].getValue("tranid");//�����ԍ�
				var entity = salesorderSearch[i].getText("entity");//�ڋq
				var entityId = salesorderSearch[i].getValue("internalid","customer",null);//�ڋqID
				var trandate = salesorderSearch[i].getValue("trandate");//���t
				var soInternalid = salesorderSearch[i].getValue("internalid");//����ID
				var number = salesorderSearch[i].getValue("custcol_number");//number
				var custPo = salesorderSearch[i].getValue("custcol7");//Cust. PO#	
				var item = salesorderSearch[i].getText("item");//�A�C�e��
				var itemId = salesorderSearch[i].getValue("internalid","item",null);//�A�C�e��ID
				var description = salesorderSearch[i].getValue("memo");//����
				var custcol1 = salesorderSearch[i].getValue("custcol1");//PACKING DETAILS
				var quantity = parseFloat(salesorderSearch[i].getValue("quantity"));//����
				var rate = parseFloat(salesorderSearch[i].getValue("fxrate"));//�P��
				var eta = salesorderSearch[i].getValue("custcol_eta");//ETA
				var taxcode = salesorderSearch[i].getText("taxcode");//�ŋ��R�[�h
				var price = salesorderSearch[i].getText("pricelevel");//���i����
				var custbody1 = salesorderSearch[i].getText("custbody1");//CONSIGNEE
				var consAddString = salesorderSearch[i].getValue("custbody_cons_add");//CONSIGNEE ADDRESS
				if(!isEmpty(consAddString)){
					consAdd = meaning(consAddString);
				}
				var custbodyString = salesorderSearch[i].getValue("custbody2");//SHIPPING MARK
				if(!isEmpty(custbodyString)){
					custbody2 = meaning(custbodyString);
				}	
				var custbody3 = salesorderSearch[i].getText("custbody3");//SHIPPING MODE
				var incoterms = salesorderSearch[i].getText("custbody_me_incoterms");//INCOTERMS
				var message = salesorderSearch[i].getValue("message");//�ڋq�ւ̃��b�Z�[�W
				var poName = salesorderSearch[i].getValue("tranid","purchaseOrder",null);//PO�ԍ�
				var purchasecontract = salesorderSearch[i].getText("custbody_ogw_purchasecontract_select"); //�w���_��
				poArr_index = poArr.indexOf(soInternalid);
				if(poArr_index < 0){
					var poVendor = '';
				}else{
					var poVendor = purchaseorderSearch[poArr_index].getText("entity"); //�d����
				}
				var currency = salesorderSearch[i].getText("currency");//�ʉ�
				var line = salesorderSearch[i].getValue("line");//line
				var theLink = nlapiResolveURL('RECORD', 'salesorder',soInternalid ,'VIEW');
				
				subList.setLineItemValue('salesorder_no', lineCount, tranid);//�����ԍ�
				subList.setLineItemValue('salesorder_id', lineCount, soInternalid);//����ID
				subList.setLineItemValue('linkurl',lineCount, theLink);//�\��
				subList.setLineItemValue('salesorder_customer', lineCount, entity);//�ڋq
				subList.setLineItemValue('salesorder_customerid', lineCount, entityId);//�ڋqID
				subList.setLineItemValue('salesorder_date', lineCount, trandate);//���t
				subList.setLineItemValue('salesorder_currency', lineCount, currency);//�ʉ�
				subList.setLineItemValue('salesorder_line', lineCount, line);//line ID
				subList.setLineItemValue('salesorder_item', lineCount, item);//�A�C�e��
				subList.setLineItemValue('salesorder_itemid', lineCount, itemId);//�A�C�e��ID
				subList.setLineItemValue('salesorder_custpo', lineCount, custPo);//Cust. PO#	
				subList.setLineItemValue('salesorder_num', lineCount, number);//number
				subList.setLineItemValue('salesorder_price', lineCount, price);//���i����
				subList.setLineItemValue('salesorder_description', lineCount, description);//����
				subList.setLineItemValue('salesorder_packing', lineCount, custcol1);//PACKING DETAILS
				subList.setLineItemValue('salesorder_quantity', lineCount, quantity);//����
				subList.setLineItemValue('salesorder_rate', lineCount, rate);//�P��
				subList.setLineItemValue('salesorder_eta', lineCount, eta);//ETA
				subList.setLineItemValue('salesorder_tax', lineCount, taxcode);//�ŋ��R�[�h
				subList.setLineItemValue('salesorder_consignee', lineCount, custbody1);//CONSIGNEE
				subList.setLineItemValue('salesorder_consigneeadd', lineCount, consAdd);//CONSIGNEE ADDRESS
				subList.setLineItemValue('salesorder_shippingmark', lineCount, custbody2);//SHIPPING MARK
				subList.setLineItemValue('salesorder_shippingmode', lineCount, custbody3);//SHIPPING MODE
				subList.setLineItemValue('salesorder_incoterms', lineCount, incoterms);//INCOTERMS
				subList.setLineItemValue('salesorder_message', lineCount, message);//�ڋq�ւ̃��b�Z�[�W
				subList.setLineItemValue('salesorder_poname', lineCount, poName);//PO�ԍ�
				subList.setLineItemValue('salesorder_povendor', lineCount, poVendor);//�d����
				subList.setLineItemValue('salesorder_purchase', lineCount, purchasecontract);//�w���_��
				 
				var csvValue=soInternalid+'|'+entityId+'|'+itemId+'|'+trandate+'|'+line;
				if(selectLineArray.indexOf(csvValue) > -1){
					xmlString+=tranid+',"'+entity+'",'+trandate+','+currency+','+number+',"'+item+'",'+price+',"'+description+'","'+custPo+'","'+custcol1+'",'+
					quantity+','+rate+','+eta+','+taxcode+',"'+custbody1+'","'+consAdd+'","'+custbody2+'","'+custbody3+'","'+incoterms+'","'+message+'",'+poName+',"'+poVendor+'",'+purchasecontract+'\r\n';
				}
				lineCount++;
				countText++;
			}
		}
	subList.setLabel('�������ڍ�:'+countText+'��');
	form.addButton('csvdownload', 'CSV�e���v���[�g�̃_�E�����[�h', 'csvDownload();');
	form.addButton('btn_return', '�����߂�','searchReturn()')
	form.addSubmitButton('CSV Import');
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
			var form = nlapiCreateForm('CSV�C���|�[�g����', false);
			var subList = form.addSubList('list', 'list', 'CSV�C���|�[�g���ʈꗗ');
			var theLink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_so_csvimport', 'customdeploy_ogw_sl_so_csvimport');
			var backbtns = "window.location.href='"+devpUrl+theLink+"&whence='";
			form.addButton('custpage_refresh', '�߂�', backbtns);
			
			subList.addField('csv_error', 'text', '�G���[');
			var csvLink=subList.addField('csv_link', 'url', '�\��');
			csvLink.setLinkText('�\��');
			subList.addField('csv_sonum', 'text', '�������ԍ�');
			subList.addField('csv_entity', 'text', '�ڋq');
			subList.addField('csv_date', 'text', '���t');
			subList.addField('csv_num', 'text', 'NUMBER ');
			subList.addField('csv_item', 'text', '�A�C�e�� ');
			subList.addField('csv_price', 'text', '���i���� ');
			subList.addField('csv_explain', 'text', 'DESCRIPTION');
			subList.addField('csv_custpo', 'text', 'csv_custpo');
			subList.addField('csv_packling', 'text', 'PACKING DETAILS');
			subList.addField('csv_qty', 'text', 'QTY');
			subList.addField('csv_rate', 'text', '�P��');
			subList.addField('csv_eta', 'text', 'ETA');
			subList.addField('csv_tax', 'text', 'TAX');
			subList.addField('csv_con', 'text', 'CONSIGNEE');
			subList.addField('csv_address', 'text', 'CONSIGNEE ADDRESS');
			subList.addField('csv_mark', 'text', 'SHIPPING MARK');
			subList.addField('csv_mode', 'text', 'SHIPPING MODE');
			subList.addField('csv_incote', 'text', 'INCOTERMS');
			subList.addField('csv_message', 'text', '�ڋq�ւ̃��b�Z�[�W');
			subList.addField('csv_vendor', 'text', '�d����');
			subList.addField('csv_purchase', 'text', '�w���_��');
			var cont = 1;
			
			
			var soSearch = getSearchResults("salesorder",null,
					[
					   ["type","anyof","SalesOrd"], 
					   "AND", 
					   ["customform","anyof",so_ogj_custform],
					   "OR", 
					   ["customform","anyof","118"],
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
					 var csv_entity=defaultEmpty(fileLine[2]);// �ڋq
					 var csv_date=defaultEmpty(fileLine[3]);// ���t
					 var csv_num=defaultEmpty(fileLine[4]);// NUMBER
					 var csv_item=defaultEmpty(fileLine[5]);// �A�C�e��
					 var csv_price=defaultEmpty(fileLine[6]);// ���i����
					 var csv_explain=defaultEmpty(fileLine[7]);// DESCRIPTION
					 var csv_custpo=defaultEmpty(fileLine[8]);//CUST. PO#
					 var csv_packling=defaultEmpty(fileLine[9]);// PACKING DETAILS
					 var csv_qty=defaultEmpty(fileLine[10]);// QTY
					 
					 var csv_rate=defaultEmpty(fileLine[11]);// �P��
					 var csv_eta=defaultEmpty(fileLine[12]);// ETA
					 var csv_tax=defaultEmpty(fileLine[13]);// TAX
					 var csv_con=defaultEmpty(fileLine[14]);// CONSIGNEE
					 var csv_address=defaultEmpty(fileLine[15]);// CONSIGNEE ADDRESS
					 var csv_mark=defaultEmpty(fileLine[16]);// SHIPPING MARK
					 var csv_mode=defaultEmpty(fileLine[17]);// SHIPPING MODE
					 var csv_incote=defaultEmpty(fileLine[18]);// INCOTERMS
					 var csv_message=defaultEmpty(fileLine[19]);// �ڋq�ւ̃��b�Z�[�W
					 var csv_vendor=defaultEmpty(fileLine[20]);// �d����
					 var csv_purchase=defaultEmpty(fileLine[21]);// �w���_��
					 
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
					 subList.setLineItemValue('csv_entity', cont, csv_entity);// �ڋq
					 subList.setLineItemValue('csv_date', cont, csv_date);	// ���t	
					 subList.setLineItemValue('csv_num', cont, csv_num);	//NUMBER
					 subList.setLineItemValue('csv_item', cont, csv_item);// �A�C�e��
					 subList.setLineItemValue('csv_price', cont, csv_price);// ���i����
					 subList.setLineItemValue('csv_explain', cont, csv_explain);// DESCRIPTION
					 subList.setLineItemValue('csv_custpo', cont, csv_custpo);//CUST. PO#
					 subList.setLineItemValue('csv_packling', cont, csv_packling);// PACKING DETAILS
					 subList.setLineItemValue('csv_qty', cont, csv_qty);// QTY
					 subList.setLineItemValue('csv_rate', cont, csv_rate);// �P��
					 subList.setLineItemValue('csv_eta', cont, csv_eta);// ETA 
					 subList.setLineItemValue('csv_tax', cont, csv_tax);// TAX
					 subList.setLineItemValue('csv_con', cont, csv_con);// CONSIGNEE
					 subList.setLineItemValue('csv_address', cont, csv_address);// CONSIGNEE ADDRESS
					 subList.setLineItemValue('csv_mark', cont, csv_mark);// SHIPPING MARK
					 subList.setLineItemValue('csv_mode', cont, csv_mode);// SHIPPING MODE
					 subList.setLineItemValue('csv_incote', cont, csv_incote);// INCOTERMS
					 subList.setLineItemValue('csv_message', cont, csv_message);// �ڋq�ւ̃��b�Z�[�W
					 subList.setLineItemValue('csv_vendor', cont, csv_vendor);// �d����
					 subList.setLineItemValue('csv_purchase', cont, csv_purchase);// �w���_��
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
	var meaningString = str.replace(/\r/g," ").replace(/�B/g," ");
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