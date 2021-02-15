/*function pdfToImg(urlPdfO) {
    //var urlPdfO = 'https://cors-lucy.herokuapp.com/' + urlPdf;
    //var urlPdfO = 'https://cors-anywhere.herokuapp.com/' + urlPdf;    
    pdfjsLib.getDocument(urlPdfO).then(doc => {

        var numPages = 0;
        if (doc.numPages == 1) {
            numPages = 1;
        } else if (doc.numPages == 2) {
            numPages = 2;
        }

        //console.log(numPages);

        doc.getPage(numPages).then(page => {
            var myCanvas = document.getElementById('my_canvas');
            var context = myCanvas.getContext("2d");

            var viewport = page.getViewport(1);
            myCanvas.width = viewport.width;
            myCanvas.height = viewport.height;

            page.render({
                canvasContext: context,
                viewport: viewport
            });
        });
    });
}*/