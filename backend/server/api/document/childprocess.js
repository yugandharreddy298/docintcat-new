var shell = require('shelljs');
var fs = require('fs');
//document image creation using child process
process.on('message', function (data) {
    if (!shell.exec(data.sshCommand).code) { // create Images using ssh commands 
        process.send('success');
    }
    else { // if Error to read file again read  create File and create images using ssh commands 
        var pdfFile = data.filepath;
        const { PDFDocumentFactory, PDFDocumentWriter} = require('pdf-lib');
        const loadPdf = fs.readFileSync(pdfFile);
        const pdfDoc = PDFDocumentFactory.load(loadPdf);
        const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
        fs.writeFileSync(pdfFile, pdfBytes);
        if (!shell.exec(data.sshCommand).code) {
            process.send('success');
        }
    }
})