/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/03/16     CPC_�v
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

function suitelet(request, response){
	var poId = request.getParameter('poid');//PO ID
	var errorValue = request.getParameter('errorValue'); //�ُ픭�� 

	if(!isEmpty(poId)){
		var poRecord = nlapiLookupField('purchaseorder', poId, ['custbody_ogw_po_mail_template','custbody_ogw_to','custbody_ogw_cc','custbody_ogw_content','custbody_ogw_cancle_content','custbody_ogw_change_content','custbody_ogw_person','custbody_ogw_po_change','custbody_ogw_cancle']);				
		var potTemplate = poRecord.custbody_ogw_po_mail_template; // ���������M�e���v���[�g
		var potTo = poRecord.custbody_ogw_to; // TO
		var poCc = poRecord.custbody_ogw_cc; //CC
		var poContent = poRecord.custbody_ogw_content; // ���e
		var pocancelContent = poRecord.custbody_ogw_cancle_content; // �L�����Z�����e
		var pochangeContent = poRecord.custbody_ogw_change_content; // �ύX���e
		var person = poRecord.custbody_ogw_person; // �S����
		var changeFlg = poRecord.custbody_ogw_po_change; // CHANGE
		var cancleFlg = poRecord.custbody_ogw_cancle; // CANCLE
			var form = nlapiCreateForm('���M', true);
			
			var templateField =form.addField('custpage_template', 'select', '���������M�e���v���[�g', null); //���������M�e���v���[�g
			var templateSearch  = getSearchResults("customrecord_ogw_po_mail_template",null,
					[
					], 
					[
					   new nlobjSearchColumn("internalid"), 
					   new nlobjSearchColumn("name"),
					]
					);
			
			if(!isEmpty(templateSearch)){
				templateField.addSelectOption('', '');
				for(var i = 0; i<templateSearch.length;i++){
					templateField.addSelectOption(templateSearch[i].getValue("internalid"),templateSearch[i].getValue("name"));
				}
			}
			templateField.setDisplayType('inline');	
			var toField =form.addField('custpage_to', 'textarea', 'TO', null); //TO
			toField.setMandatory(true);
			var ccField =form.addField('custpage_cc', 'textarea', 'CC', null); //CC
			var personField =form.addField('custpage_person', 'select', '�S����','employee', null); //�S����
			if(cancleFlg != 'T' && changeFlg != 'T'){
				var contentField =form.addField('custpage_content', 'textarea', '���e', null); //���e
				contentField.setDefaultValue(poContent);//���e
			}else if(cancleFlg == 'T' && changeFlg == 'F'){
				var cancleField =form.addField('custpage_cancle', 'textarea', '�L�����Z�����e', null); //�L�����Z�����e
				cancleField.setDefaultValue(pocancelContent);//�L�����Z�����e
			}else if(changeFlg == 'T' && cancleFlg == 'F'){
				var changeField =form.addField('custpage_change', 'textarea', '�ύX���e', null); //�ύX���e
				changeField.setDefaultValue(pochangeContent);//�ύX���e
			}else if(cancleFlg == 'T' && changeFlg == 'T'){
				var cancleField =form.addField('custpage_cancle', 'textarea', '�L�����Z�����e', null); //�L�����Z�����e
				cancleField.setDefaultValue(pocancelContent);//�L�����Z�����e
			}
			var poIdField =form.addField('custpage_poid', 'text', 'poid', null); //������ID .setDisplayType('hidden');
			poIdField.setDisplayType('hidden');
			templateField.setDefaultValue(potTemplate); //���������M�e���v���[�g
			toField.setDefaultValue(potTo);//TO
			ccField.setDefaultValue(poCc);//CC
			personField.setDefaultValue(person);//�S����
			poIdField.setDefaultValue(poId);//POID
			
			form.setScript('customscript_ogw_cs_sendmail_update');
			form.addButton('custpage_sandmail', '���M','sandmail()');
			form.addButton('custpage_save', '�h���b�v�ۑ�','saveReturn()');
			response.writePage(form);
	}
	if(!isEmpty(errorValue)){
		nlapiLogExecution("debug", "errorValue", errorValue);
		var form=nlapiCreateForm('���M�X�e�[�^�X', true);
		form.addButton('custpage_refresh', '�߂�', 'parent.location.reload();');
		form.addField('custpage_lable1', 'label', '�ُ픭��');
		var errorField =form.addField('custpage_error', 'textarea', '�ُ���', null); //�ُ��� 
		errorField.setDisplayType('inline');	
		errorField.setDefaultValue(errorValue);
		response.writePage(form);
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
