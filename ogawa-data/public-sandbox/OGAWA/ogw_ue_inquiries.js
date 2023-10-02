/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/01/11     CPC_苑
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
function userEventBeforeSubmit(type){
if(type=='delete'){
	return;
}
	 var employees=nlapiGetFieldValues('custrecordogw_inquiries_employee');
	 var employee=nlapiGetFieldValue('custrecordogw_inquiries_employee');
	 var inquiries=nlapiGetFieldValue('custrecord_ogw_inquiries');
	 if(isEmpty(inquiries)){
			 if(!isEmpty(employees)&&!isEmpty(employee)){
	 var inquiriesTxt='弊社の';
	 var employeeSearch = nlapiSearchRecord("employee",null,
			 [
			    ["internalid","anyof",employees]
			 ], 
			 [
			    new nlobjSearchColumn("altname")
			 ]
			 );
	 if(!isEmpty(employeeSearch)){
		 for(var j=0;j<employeeSearch.length;j++){			 
			 inquiriesTxt+=employeeSearch[j].getValue("altname");
			 if(employeeSearch.length>1&&j!=employeeSearch.length-1){
				 inquiriesTxt+='、';
			 }
		 }
		 inquiriesTxt+='と連絡してください。';
		 nlapiSetFieldValue('custrecord_ogw_inquiries', inquiriesTxt);
	 }
	 }else{
		 nlapiSetFieldValue('custrecord_ogw_inquiries', '');
	 }
	 }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
	if(type=='delete'){
		return;
	}
	var record=nlapiLoadRecord('customrecord_ogw_inquiries', nlapiGetRecordId());
	var employees=record.getFieldValues('custrecordogw_inquiries_employee');
	var employee=record.getFieldValue('custrecordogw_inquiries_employee');
	 var inquiries=record.getFieldValue('custrecord_ogw_inquiries');
	 if(isEmpty(inquiries)){
		 if(!isEmpty(employees)&&!isEmpty(employee)){
	 var inquiriesTxt='弊社の';
	 var employeeSearch = nlapiSearchRecord("employee",null,
			 [
			    ["internalid","anyof",employees]
			 ], 
			 [
			    new nlobjSearchColumn("altname")
			 ]
			 );
	 if(!isEmpty(employeeSearch)){
		 for(var j=0;j<employeeSearch.length;j++){			 
			 inquiriesTxt+=employeeSearch[j].getValue("altname");
			 if(employeeSearch.length>1&&j!=employeeSearch.length-1){
				 inquiriesTxt+='、';
			 }
		 }
		 inquiriesTxt+='と連絡してください。';
		 record.setFieldValue('custrecord_ogw_inquiries', inquiriesTxt);
	 }
	 }else{
		 record.setFieldValue('custrecord_ogw_inquiries', '');
	 }
	 nlapiSubmitRecord(record, false, true);
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