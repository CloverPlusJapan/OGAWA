/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/02/10     CPC_�v
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function ueuserEventBeforeLoad(type, form, request){
	if(type == 'view'){
		form.setScript('customscript_ogw_cs_invoicepdf');
		var record =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
		var customform = record.getFieldValue('customform');
		if(customform == '246'){
	
			var tranidField = nlapiGetField('tranid'); //�������ԍ�
			var tranidLabel = tranidField.getLabel(); //LABEL
			if(tranidLabel == "�������ԍ�"){
				form.addButton('custpage_pdfbutton','PDF�쐬','pdfStart()');
			}else{
				form.addButton('custpage_pdfbutton', 'View PDF', 'pdfStart();');
			}
			
		}
	}
		
		try{		
			if(type=='create'){
				var customform = nlapiGetFieldValue('customform');
				// OGJ Invoice
				if(customform=='246'){
					
					// �쐬��
					var createdfrom=nlapiGetFieldValue('createdfrom');
					if(!isEmpty(createdfrom)){
						
						// ETA/ETD
						var sorecord=nlapiLookupField('salesorder', createdfrom, ['custbody4','custbody5']);
						var ETA=sorecord.custbody4;
						var ETD=sorecord.custbody5;
						nlapiSetFieldValue('trandate', ETA);
						nlapiSetFieldValue('custbody5', ETD);
					}
				}
			}
			}catch(e){
				
			}
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