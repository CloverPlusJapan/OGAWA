/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/record'],

    function (currentRecord, url, record) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

        }

        function pdfStart() {
            var date = currentRecord.get();
            var id = date.id;
            var printUrlOne = url.resolveScript({
                scriptId: 'customscript_ogw_sl_creditmemopdf',
                deploymentId: 'customdeploy_ogw_sl_creditmemopdf',
                returnExternalUrl: false,
                params: {dateId: id}
            })
            window.open(printUrlOne)
        }


        return {
            pageInit: pageInit,
            pdfStart: pdfStart
        };

    });
