/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/01/13     CPC_��
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var po_ogj_custForm = "243";

function suitelet(request, response){
	if (request.getMethod() == 'POST') {
		run(request, response);
		
	}else{
		if (!isEmpty(request.getParameter('custparam_logform'))) {
			logForm(request, response)
		}else{
			createForm(request, response);
		}
	}		 
}

function run(request, response){
	
	var ctx = nlapiGetContext();
	var theCount = parseInt(request.getLineItemCount('custpage_list'));
	var idList='';
    for (var m = 1; m < theCount + 1; m++) {
      if(request.getLineItemValue('custpage_list', 'check', m)=='T'){	
    	  var poId = request.getLineItemValue('custpage_list', 'internalid', m);//ID
    	  var to = request.getLineItemValue('custpage_list', 'to', m);//TO
    	  var cc = request.getLineItemValue('custpage_list', 'cc', m);//CC
    	  var subject = request.getLineItemValue('custpage_list', 'subject', m);//����
    	  var content = request.getLineItemValue('custpage_list', 'content', m);//���e
    	  idList += poId+'***'+to+'***'+cc+'***'+subject+'***'+content+'&&';
      	}
      }
	var scheduleparams = new Array();	
	scheduleparams['custscript_ogw_idlist'] = idList;
	scheduleparams['custscript_ogw_atuo_ss'] = 'F';
	
	runBatch('customscript_ogw_ss_sendmail', 'customdeploy_ogw_ss_sendmail', scheduleparams);

	var parameter = new Array();
	parameter['custparam_logform'] = '1';	
	nlapiSetRedirectURL('suitelet', ctx.getScriptId(), ctx.getDeploymentId(),null, parameter);
}


//�o�b�`��ԉ��
function logForm(request, response) {

	var form = nlapiCreateForm('�������', false);
	// ���s���
	form.addFieldGroup('custpage_run_info', '���s���');
	var resetbtn = "window.location.href=window.location.href";
	form.addButton('resetbtn', '�X�V', resetbtn);
	// �o�b�`���
	var batchStatus = getScheduledScriptRunStatus('customdeploy_ogw_ss_sendmail');

	if (batchStatus == 'FAILED') {
		// ���s���s�̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		var messageColour = '<font color="red"> �o�b�`���������s���܂��� </font>';
		runstatusField.setDefaultValue(messageColour);
		response.writePage(form);
	} else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {

		// ���s���̏ꍇ
		var runstatusField = form.addField('custpage_run_info_status', 'text',
				'', null, 'custpage_run_info');
		runstatusField.setDisplayType('inline');
		runstatusField.setDefaultValue('�o�b�`���������s��');
		response.writePage(form);
	}else{
		createForm(request, response);
	}
	
}


//��ʍ쐬
function createForm(request, response){
	
	var form = nlapiCreateForm('�������ꊇ���M���', false);
	form.setScript('customscript_ogw_cs_sendmail');
	var  subsidiaryPar= request.getParameter('subsidiary');
	var  entityPar= request.getParameter('entity');
	var  startdatePar= request.getParameter('startdate');
	var  enddatePar= request.getParameter('enddate');
	var  sendmailedPar= request.getParameter('sendmailed');
	var selectFlg= request.getParameter('selectFlg');
	// �t�B�[���h�쐬
	form.addFieldGroup('select_group', '��������');
	var subsidiaryField =form.addField('custpage_subsidiary', 'select', '�q���', 'subsidiary', 'select_group');
	subsidiaryField.setMandatory(true);
	var startdateField =form.addField('custpage_startdate', 'date', '���t(�J�n��)', null, 'select_group');
	startdateField.setMandatory(true);
	var enddateField = form.addField('custpage_enddate', 'date', '���t(�I����)', null,'select_group');
	enddateField.setMandatory(true);
	var entityField = form.addField('custpage_entity', 'select', '�d����', null,'select_group');
	entityField.addSelectOption('','');
	var sendmailedField = form.addField('custpage_sendmailed', 'checkbox', '���������M�ς�', null,'select_group');
	if(!isEmpty(subsidiaryPar)){
		subsidiaryField.setDefaultValue(subsidiaryPar);
		var vendorSearch = getSearchResults("vendor",null,
				[
				   ["subsidiary","anyof",subsidiaryPar], 
				   "AND", 
				   ["category","noneof","5"]
				], 
				[
				   new nlobjSearchColumn("internalid",null,"GROUP"), 
				   new nlobjSearchColumn("entityid",null,"GROUP").setSort(false), 				   
				   new nlobjSearchColumn("altname",null,"GROUP").setSort(false)
				]
				);
		if(!isEmpty(vendorSearch)){
			for(var i=0;i<vendorSearch.length;i++){
				var vendortxt='';
				var enId=vendorSearch[i].getValue("entityid",null,"GROUP");
				var enAltname=vendorSearch[i].getValue("altname",null,"GROUP");
				if(!isEmpty(enId)&&enId!='- None -'){
					vendortxt+=enId;
				}
                if(!isEmpty(enAltname)&&enAltname!='- None -'){
                	if(!isEmpty(vendortxt)){
                		vendortxt+=' ';
                	}
                	vendortxt+=enAltname;
				}
				entityField.addSelectOption(vendorSearch[i].getValue("internalid",null,"GROUP"),vendortxt);
			}
		}		
	}
	if(!isEmpty(startdatePar)){
		startdateField.setDefaultValue(startdatePar);
	}else{
		startdateField.setDefaultValue(nlapiDateToString(getSystemTime()));
	}
	if(!isEmpty(enddatePar)){
		enddateField.setDefaultValue(enddatePar);
	}else{
		enddateField.setDefaultValue(nlapiDateToString(getSystemTime()));
	}
	if(!isEmpty(entityPar)){
		entityField.setDefaultValue(entityPar);
	}
	if(!isEmpty(sendmailedPar)){
		sendmailedField.setDefaultValue(sendmailedPar);
	}
	if(selectFlg == 'T'){
		subsidiaryField.setDisplayType('inline');
		startdateField.setDisplayType('inline');
		enddateField.setDisplayType('inline');
		entityField.setDisplayType('inline');
		sendmailedField.setDisplayType('inline');
		form.addButton('btn_searchReturn', '�����߂�', 'searchReturn()');
		form.addSubmitButton('�ꊇ���M');
		
		if(sendmailedPar!='T'){
			sendmailedPar='F';
		}
		
		var poSearch = getSearchResults("purchaseorder",null,
				[
				   ["type","anyof","PurchOrd"], 
				   "AND", 
				   ["custbody_ogw_po_sendmail","is",sendmailedPar], 
				   "AND", 
				   ["trandate","within",startdatePar,enddatePar], 
				   "AND", 
				   ["subsidiary","anyof",subsidiaryPar],
				   "AND", 
//				   ["status","noneof","PurchOrd:B","PurchOrd:C"],
//				   "AND", 
				   ["customform","anyof",po_ogj_custForm],
			       "AND", 
			       ["taxline","is","F"], 
			       "AND", 
			       ["mainline","is","F"],
				], 
				[
				 	new nlobjSearchColumn("internalid").setSort(true), 
				 	new nlobjSearchColumn("line").setSort(false),
				 	new nlobjSearchColumn("tranid"),//�������ԍ� 
				 	new nlobjSearchColumn("transactionnumber"),//�g�����U�N�V�����ԍ�
				 	new nlobjSearchColumn("trandate"),//���t
				 	new nlobjSearchColumn("entity"), //�d���� 
				 	new nlobjSearchColumn("custentity_ogw_entity_name","vendor",null),//TO(�d���於)
				 	new nlobjSearchColumn("custbody_ogw_po_mail_template"), //���������M�e���v���[�g
				 	new nlobjSearchColumn("custbody_ogw_po_sendmail"), //���������M�ς�
				 	new nlobjSearchColumn("custbody_ogw_to"), //TO
				 	new nlobjSearchColumn("custbody_ogw_cc"), //CC
				 	new nlobjSearchColumn("custbody_ogw_content"), //���e
				 	new nlobjSearchColumn("custbody_ogw_cancle_content"), //�L�����Z�����e
				 	new nlobjSearchColumn("custbody_ogw_change_content"), //�ύX���e
				 	new nlobjSearchColumn("custcol_ogw_po_pdf_temp"), //������PDF�e���v���[�g	
				 	new nlobjSearchColumn("custcol_ogw_inquiries"), //�₢���킹��
				 	new nlobjSearchColumn("custbody_ogw_po_change"), //CHANGE
				 	new nlobjSearchColumn("custbody_ogw_cancle"), //CANCLE  
				 	new nlobjSearchColumn("custcol7"), //CUST. PO#
				 	new nlobjSearchColumn("item"), //item
				 	new nlobjSearchColumn("memo"), //����
				 	new nlobjSearchColumn("custcol_eta"), //ETA
				 	new nlobjSearchColumn("custcol_eta"), //ETA
				]
				);
		var subList = form.addSubList('custpage_list', 'list', '���v:');
		subList.addMarkAllButtons()
		subList.addField('check', 'checkbox', '�I��');
		subList.addField('internalid', 'text', '����ID').setDisplayType('hidden');
		var linkField=subList.addField('linkurl', 'url', '�\��');
		linkField.setLinkText('�\��');
		subList.addField('docno', 'text', '�h�L�������g�ԍ�').setDisplayType('inline');	
		subList.addField('tranno', 'text', '�g�����U�N�V�����ԍ�').setDisplayType('inline');	
		subList.addField('date', 'text', '���t').setDisplayType('inline');	
		subList.addField('entity', 'text', '�d����','vendor').setDisplayType('inline');	
		subList.addField('potemp', 'text', '���������M�e���v���[�g','customrecord_ogw_po_mail_template').setDisplayType('inline');	
		subList.addField('posendmailed', 'checkbox', '���������M�ς�').setDisplayType('inline');	
		subList.addField('to', 'textarea', 'TO').setDisplayType('inline');	
		subList.addField('cc', 'textarea', 'CC').setDisplayType('inline');	
		subList.addField('subject', 'textarea', '����').setDisplayType('inline');	
		subList.addField('content', 'textarea', '���e').setDisplayType('inline');
		if(!isEmpty(poSearch)){
			var count=1;
			var poIdArr = new Array();
			var poIdIndex = new Array();
			var poTitleArr = new Array();
			for(var i=0;i<poSearch.length;i++){
				var poId = poSearch[i].getValue("internalid");//������ID
				var poPdfTemp = defaultEmpty(poSearch[i].getValue('custcol_ogw_po_pdf_temp'));//������PDF�e���v���[�g
				poIdIndex.push(poId);
				poTitleArr.push({
					poId:poId,
					poPdfTemp:poPdfTemp,
				});
			}
			
			for(var i=0;i<poSearch.length;i++){
				var poId = defaultEmpty(poSearch[i].getValue("internalid"));//������ID
				var itemNum= itemLength(poIdIndex,poId);
				if(itemNum > 1 ){
					var subText = "��";
				}else{
					var subText = "";
				}
				var titleFirstValue= getTitle(poTitleArr,poId);
	            if(poIdArr.indexOf(poId)< 0) { //SO ID
	            	var tranid = defaultEmpty(poSearch[i].getValue("tranid"));//�������ԍ�
					var transactionnumber = defaultEmpty(poSearch[i].getValue("transactionnumber"));//�g�����U�N�V�����ԍ�
					var trandate = defaultEmpty(poSearch[i].getValue("trandate"));//���t
					var entity = defaultEmpty(poSearch[i].getText("entity"));//�d���� 
					var entityTo = defaultEmpty(poSearch[i].getValue("custentity_ogw_entity_name","vendor",null));//TO(�d���於)
					var mailTemp = defaultEmpty(poSearch[i].getText('custbody_ogw_po_mail_template'));//���������M�e���v���[�g
					var mailFlg = defaultEmpty(poSearch[i].getValue('custbody_ogw_po_sendmail'));//���������M�ς�
					var poTo = defaultEmpty(poSearch[i].getValue('custbody_ogw_to'));//TO
					var poCc = defaultEmpty(poSearch[i].getValue('custbody_ogw_cc'));//CC
					var poContent = defaultEmpty(poSearch[i].getValue('custbody_ogw_content'));//���e
					var poCancleContent = defaultEmpty(poSearch[i].getValue('custbody_ogw_cancle_content'));//�L�����Z�����e
					var poChangeContent = defaultEmpty(poSearch[i].getValue('custbody_ogw_change_content'));//�ύX���e
					var poInquiries = defaultEmpty(poSearch[i].getValue('custcol_ogw_inquiries'));//�₢���킹��
					var cancleFlg = defaultEmpty(poSearch[i].getValue('custbody_ogw_cancle'));//CANCLE
					var changeFlg = defaultEmpty(poSearch[i].getValue('custbody_ogw_po_change'));//CHANGE
					var custPo = defaultEmpty(poSearch[i].getValue('custcol7'));//custPo
					var itemName = defaultEmpty(poSearch[i].getText('item'));//item
					var memo = defaultEmpty(poSearch[i].getValue('memo'));//����
					var etaValue = defaultEmpty(poSearch[i].getValue('custcol_eta'));//ETA
					var subName = "Ogawa Flavors and Fragrances(Singapore) Pte. Ltd.Purchasing Dep.";
					
					var mBodyMail = '';
					if(cancleFlg == 'T' && changeFlg == 'F'){
						mBodyMail = poCancleContent; //�L�����Z�����e
					}else if(changeFlg == 'T' && cancleFlg == 'F'){
						mBodyMail = poChangeContent; //�ύX���e
					}else if(changeFlg == 'T' && cancleFlg == 'T'){
						mBodyMail = poCancleContent; //�L�����Z�����e
					}else if(changeFlg == 'F' && cancleFlg == 'F'){
						mBodyMail = poContent; //���e
					}
					
					var inquiriesValue = '';
					if(!isEmpty(poInquiries)){
						inquiriesValue = poInquiries.replace(/�B/g,'�B'+'\n');
					}
					
					var lastMailText = "============================================================================="+'\n'+		
					   "OGAWA FLAVORS & FRAGRANCES (SINGAPORE) PTE. LTD."+'\n'+					
					   "���c�S�k/Ikuta Yuji"+'\n'+
					   "Add:    51 Science Park Road, Science Park II,"+'\n'+
					   "        #04-23/24, The Aries, Singapore 117586"+'\n'+
					   "Tel:    (65) 6777 1277"+'\n'+
					   "Fax:    (65) 6777 2245"+'\n'+
					   "URL:    http:// www.ogawa.net"+'\n'+
					   "=============================================================================";
					
		
					var mBody = '';
					mBody = mBodyMail + '\n'+'\n'+ inquiriesValue+'\n'+'\n'+lastMailText;	
					var mSubject = titleFirstValue +  custPo + "�@" + entityTo +"�@" + itemName + "�@" + subText + "�@" + memo + "�@"  + etaValue + "�@" +subName;
					
					var theLink = nlapiResolveURL('RECORD', 'purchaseorder',poSearch[i].getValue("internalid") ,'VIEW');
					subList.setLineItemValue('linkurl',count, theLink);
					subList.setLineItemValue('internalid',count, poId);
					subList.setLineItemValue('docno',count, tranid); //�h�L�������g�ԍ�
					subList.setLineItemValue('tranno',count, transactionnumber); //�g�����U�N�V�����ԍ�
					subList.setLineItemValue('date',count, trandate); //���t
					subList.setLineItemValue('entity',count, entity); //�d���� 
					subList.setLineItemValue('potemp',count, mailTemp); //���������M�e���v���[�g
					subList.setLineItemValue('posendmailed',count, mailFlg); //���������M�ς�
					subList.setLineItemValue('to',count, poTo); //TO
					subList.setLineItemValue('cc',count, poCc); //CC
					subList.setLineItemValue('subject',count, mSubject); //����
					subList.setLineItemValue('content',count, mBody); //���e
					count++;   
	            	poIdArr.push(poId);
	            } 
			}
		}		
	}else{
		form.addButton('btn_search', '����', 'search()');
	}
	response.writePage(form);
}

function defaultEmpty(src){
	return src || '';
}



function itemLength(poIdIndex,poId){
	var num =0;
	for(var k=0;k<poIdIndex.length;k++){
		if(poIdIndex[k] == poId){
			num++;
		}	
	}
	return num;
}

function getTitle(poTitleArr,poId){
	var titleFirstValue = '';
	for(var k=0;k<poTitleArr.length;k++){
		if(poTitleArr[k].poId == poId){
			if(poTitleArr[k].poPdfTemp == '1'){
				titleFirstValue = "�������F"
			}
		}	
	}
	return titleFirstValue;
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