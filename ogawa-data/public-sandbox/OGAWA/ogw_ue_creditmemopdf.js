/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search'],

    (search) => {
            /**
             * Defines the function definition that is executed before record is loaded.
             * @param {Object} scriptContext
             * @param {Record} scriptContext.newRecord - New record
             * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
             * @param {Form} scriptContext.form - Current form
             * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
             * @since 2015.2
             */
            const  CUSTOM_FORM = '110'; // OGS Customer Credit Note
            const beforeLoad = (scriptContext) => {
                    let  form = scriptContext.form;
                    let  type = scriptContext.type;
                    if (type == 'view'){
                        let formObj = search.lookupFields({type:scriptContext.newRecord.type,id:scriptContext.newRecord.id,columns:['customform']});
                        log.audit("formObj", formObj);
                        let customform = formObj.customform[0].value;
                        if (customform != CUSTOM_FORM) return;
                            form.addButton({
                                    id: 'custpage_addbutton',
                                    label: 'PDF作成',
                                    functionName: 'pdfStart'
                            });
                    }
                    form.clientScriptModulePath = '/SuiteScripts/OGAWA/ogw_cs_creditmemopdf.js'
            }



            return {beforeLoad}

    });
