/**
 * �@�\: ����łɊւ��郌�|�[�g�o��
 *  Author: �v����
 *  Date :2023/09/12
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget'],

    (search, ui) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var request = scriptContext.request;
            var response = scriptContext.response;
            var form = createBodyForm();
            response.writePage(form);
        }

        /**
         * �{�̉�ʂ̍쐬
         * @returns {Form}
         */
        function createBodyForm() {
            var form = ui.createForm({title: "����Ń��|�[�g�o��"});
            form.clientScriptModulePath = './ogw_cs_list_of_taxreport.js';
            form.addButton({id: 'reportExcel', label: "EXCEL�o��", functionName: 'reportExcel'});
            form.addButton({id: 'clear', label: "�N���A", functionName: 'clearPage'});
            var  a = form.addField({id: 'custpage_vendor', label: "�d����", type: ui.FieldType.SELECT});
            a.addSelectOption({value:"",text:""} );
             search.create({
                type: "vendor",
                filters: [["entityid","startswith","31"], "OR", ["entityid","is","10195"]],
                columns: [search.createColumn({name: "altname"})]
            }).run().each(function(result){
                a.addSelectOption({value:result.id,text:result.getValue('altname')})
                return true;
            });
            form.addField({id: 'custpage_date_from', label: "�J�n��", type: ui.FieldType.DATE });
            form.addField({id: 'custpage_date_to', label: "�I����", type: ui.FieldType.DATE});
            a.updateBreakType({breakType: ui.FieldBreakType.STARTCOL});
            return form;
        }

        return {onRequest}

    });
