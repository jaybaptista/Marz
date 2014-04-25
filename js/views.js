function InterfaceManager(scope, spectraManager, templateManager, processorManager) {
    this.scope = scope;
    this.spectraManager = spectraManager;
    this.templateManager = templateManager;
    this.processorManager = processorManager;

    this.menuOptions = ['Overview', 'Detailed', 'Templates', 'Settings', 'Usage'];
    this.menuActive = 'Detailed';
    this.spectraIndex = 0;

    this.dispRaw = 1;
    this.dispProcessed = 1;
    this.dispTemplate = 1;
    this.changedRaw = 1;
    this.changedProcessed = 1;
    this.changedTemplate = 1;
    this.detailedViewZMax = 4;

    this.interface = {
        unselected: '#E8E8E8',
        rawColour: "#E8BA6B",
        processedColour: "#058518",
        matchedColour: "#AA0000",
        templateColour: '#8C0623'};

    this.detailedViewTemplate = 0;
    this.detailedViewZ = 0;

    this.detailedCanvas = null;
    this.detailedSettings = new DetailedPlotSettings();

    this.renderOverviewDone = new Array();

}
InterfaceManager.prototype.getButtonColour = function(category) {
    if (category == 'raw') {
        if (this.dispRaw) {
            return this.interface.rawColour;
        } else {
            return this.interface.unselected;
        }
    }
    if (category == 'pro') {
        if (this.dispProcessed) {
            return this.interface.processedColour;
        } else {
            return this.interface.unselected;
        }
    }
    if (category == 'templ') {
        if (this.dispTemplate) {
            return this.interface.templateColour;
        } else {
            return this.interface.unselected;
        }
    }
}
InterfaceManager.prototype.getNumSpectra = function () {
    return this.spectraManager.getAll().length;
}
InterfaceManager.prototype.getNumAnalysed = function () {
    return this.spectraManager.getAnalysed().length;
}
InterfaceManager.prototype.isMenuActive = function (array) {
    for (var i = 0; i < array.length; i++) {
        if (this.menuActive == array[i]) {
            return true;
        }
    }
    return false;
}
InterfaceManager.prototype.getProgessPercent = function () {
    if (this.getNumSpectra() == 0) {
        return 0;
    }
    return Math.ceil(-0.01 + (100 * this.getNumAnalysed() / this.getNumSpectra()));
}
InterfaceManager.prototype.saveManual = function () {
    var spectra = this.spectraManager.getSpectra(this.spectraIndex);
    spectra.setManual(parseFloat(this.detailedViewZ), this.detailedViewTemplate);
}
InterfaceManager.prototype.waitingDrop = function() {
    return this.getNumSpectra() == 0;
}
InterfaceManager.prototype.finishedAnalysis = function () {
    if (this.getNumSpectra() == 0) {
        return false
    }
    return (this.getNumSpectra() == this.getNumAnalysed());
}
InterfaceManager.prototype.showFooter = function () {
    return (this.processorManager.isProcessing() || this.getNumAnalysed());
}
InterfaceManager.prototype.getDetailedZ = function () {
    return parseFloat(this.detailedViewZ);
}
InterfaceManager.prototype.getDetailedTemplate = function() {
    return this.templateManager.templates[this.detailedViewTemplate];
}
InterfaceManager.prototype.getMinRedshiftForDetailedTemplate = function() {
    return this.getDetailedTemplate().redshift;
}
InterfaceManager.prototype.renderTemplate = function (i) {
    var canvas = document.getElementById('smallTemplateCanvas' + i);
    var arr = this.templateManager.getTemplateLambda(i);
    var bounds = getMaxes([
        [arr, this.templateManager.get(i).spec]
    ]);
    clearPlot(canvas);
    plot(arr, this.templateManager.get(i).spec, this.interface.templateColour, canvas, bounds);

}
InterfaceManager.prototype.plotZeroLine = function (canvas, colour, bounds) {
    var c = canvas.getContext("2d");
    var h = canvas.height;
    var w = canvas.width;
    var ymin = bounds[2];
    var ymax = bounds[3];
    var hh = h - (5 + (0 - ymin) * (h - 10) / (ymax - ymin));
    c.strokeStyle = colour;
    c.moveTo(0, hh);
    c.lineTo(w, hh);
    c.stroke();
}
InterfaceManager.prototype.rerenderOverview = function (index) {
    this.renderOverviewDone['' + index] = 0;
    this.renderOverview(index);
}
InterfaceManager.prototype.renderOverview = function (index) {
    var v = this.spectraManager.getSpectra(index);
    if (this.renderOverviewDone['' + index] == 1) {
        return;
    } else {
        this.renderOverviewDone['' + index] = 1;
    }
    var canvas = document.getElementById("smallGraphCanvas" + index);
    var width = Math.max(canvas.clientWidth, canvas.width);
    if (v.intensity.length > 0) {
        var lambda = condenseToXPixels(v.lambda, width);
        var intensity = condenseToXPixels(v.intensity, width);
        var processedLambda = condenseToXPixels(v.processedLambda, width);
        var processed = condenseToXPixels(v.processedIntensity, width);
        var r = this.templateManager.getShiftedLinearTemplate(v.getFinalTemplate(), v.getFinalRedshift())
        var tempLambda = condenseToXPixels(r[0], width);
        var tempIntensity = condenseToXPixels(r[1], width);

        clearPlot(canvas);
        var toBound = [];
        if (this.dispRaw) {
            toBound.push([lambda, intensity]);
        }
        if (this.dispProcessed) {
            toBound.push([processedLambda, processed]);
        }
        if (this.dispTemplate) {
            toBound.push([tempLambda, tempIntensity]);
        }

        var bounds = getMaxes(toBound);
        this.plotZeroLine(canvas, "#C4C4C4", bounds);
        if (this.dispRaw) {
            plot(lambda, intensity, this.interface.rawColour, canvas, bounds);
        }
        if (this.dispProcessed) {
            plot(processedLambda,processed, this.interface.processedColour, canvas, bounds);
        }
        if (this.dispTemplate) {
            plot(tempLambda, tempIntensity, this.interface.matchedColour, canvas, bounds);
        }
    }
}












InterfaceManager.prototype.updateDetailedData = function (changedToDetailed) {
    /*if (changedToDetailed || this.detailedCanvas == null) {
        this.renderDetailedInitial();
    } else {
        if (this.changedRaw || this.changedProcessed) {
            this.changedRaw = false;
            this.changedProcessed = false;
            this.renderDetailedStatic();
        }
        if (this.changedTemplate) {
            this.changedTemplate = false;
            this.renderDetailedTemplate();
        }
    }*/
}
InterfaceManager.prototype.renderDetailedInitial = function() {
    var c = document.getElementById ('detailedCanvas');
    if (c == null || c.clientWidth == 0) {
        return;
    } else {
        if (this.detailedCanvas == null) {
            this.detailedCanvas = c;
            c.addEventListener("mousedown", this.detailedSettings, false);
            c.addEventListener("mouseup", this.detailedSettings, false);
            c.addEventListener("mousemove", this.detailedSettings, false);
            c.addEventListener("touchstart", this.detailedSettings, false);
            c.addEventListener("touchend", this.detailedSettings, false);
            c.addEventListener("touchmove", this.detailedSettings, false);
        }
        this.detailedSettings.setCanvas(c);
        this.detailedSettings.clearData();
        this.getStaticData();
        this.getTemplateData();
        this.detailedSettings.redraw();
    }
}
/*InterfaceManager.prototype.renderDetailedBackground = function() {
    clear(this.detailedCanvas);

}*/
InterfaceManager.prototype.getStaticData = function () {
    var spectra = this.spectraManager.getSpectra(this.spectraIndex);
    if (spectra == null) return;
    if (this.dispRaw && spectra.intensity != null) {
        this.detailedSettings.addData('raw',true, this.interface.rawColour,
            spectra.lambda, spectra.intensity, spectra.variance);
    }
    if (this.dispProcessed && spectra.processedIntensity != null) {
        this.detailedSettings.addData('processed',true,this.interface.processedColour,
            spectra.processedLambda, spectra.processedIntensity, spectra.processedVariance);
    }
}
InterfaceManager.prototype.getTemplateData = function () {
    if (!this.dispTemplate) {
        return null;
    }
    if (this.spectraManager.getSpectra(this.spectraIndex) == null) return;
    var r = this.templateManager.getShiftedLinearTemplate(this.detailedViewTemplate, this.getDetailedZ());
    this.detailedSettings.addData('template', false, this.interface.templateColour, r[0].slice(0), r[1].slice(0));
}
/*InterfaceManager.prototype.renderDetailedStatic = function() {
    var spectra = this.spectraManager.getSpectra(this.spectraIndex);
    if (spectra == null) return;

    this.getStaticData(); //TODO: Only do this when data changes
    this.detailedSettings.renderPlots();
}
InterfaceManager.prototype.renderDetailedTemplate = function() {
    var spectra = this.spectraManager.getSpectra(this.spectraIndex);
    if (spectra == null) return;

    var dataToPlot = this.getTemplateData(); //TODO: Only do this when data changes
    plotDetailed(this.detailedCanvas, dataToPlot, this.detailedSettings);

}*/

/** Requires bounds to be set */
/*InterfaceManager.prototype.renderDetailedAxes = function() {
    plotAxes(this.detailedCanvas, this.detailedSettings);
    plotZeroLine(this.detailedCanvas, this.detailedSettings);
}
InterfaceManager.prototype.resizeDetailedCanvas = function() {
    this.detailedCanvas.width = this.detailedCanvas.clientWidth;
    this.detailedCanvas.height = this.detailedCanvas.clientHeight;
    this.detailedSettings.refreshSettings();
    this.renderDetailedBackground();
    this.renderDetailedStatic();
    this.renderDetailedAxes();
    this.renderDetailedTemplate();
}
*/







function DetailedPlotSettings() {
    this.top = 20;
    this.bottom = 50;
    this.left = 70;
    this.right = 20;

    this.templateScale = '1';
    this.minScale = 0.2;
    this.maxScale = 3;

    this.axesColour = '#444';
    this.zeroLineColour = '#444';
    this.stepColour = '#CCC';
    this.dragInteriorColour = 'rgba(38, 147, 232, 0.2)';
    this.dragOutlineColour = 'rgba(38, 147, 232, 0.6)';
    this.spacingFactor = 1.2;

    this.zoomOutWidth = 20;
    this.zoomOutHeight = 20;
    this.zoomOutImg = new Image();
    this.zoomOutImg.src = 'images/lens.png'

    this.data = [];
    this.template = null;

    this.labelWidth = 70;
    this.labelHeight = 40;
    this.labelFont = '10pt Verdana';
    this.labelFill = '#222';

    this.minDragForZoom = 20;
    this.lockedBounds = false;
}
DetailedPlotSettings.prototype.unlockBounds = function() {
    this.lockedBounds = false;
}
DetailedPlotSettings.prototype.setCanvas = function(canvas) {
    this.canvas = canvas;
    this.c = canvas.getContext("2d");
    this.c.lineWidth = 1;
    this.refreshSettings();
}
DetailedPlotSettings.prototype.refreshSettings = function () {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.width = this.canvas.width - this.left - this.right;
    this.height = this.canvas.height - this.top - this.bottom;

}
DetailedPlotSettings.prototype.getCanvas = function() {
    return this.canvas;
}
DetailedPlotSettings.prototype.setTemplateScale = function() {
    if (this.template == null) {
        return;
    }
    var s = parseFloat(this.templateScale);
    if (s == null || isNaN(s) || s < this.minScale || s > this.maxScale) {
        return;
    }
    for (var i = 0; i < this.data.length; i++) {
        if (this.data[i].id == 'template') {
            for (var j = 0; j < this.data[i].y.length; j++) {
                this.data[i].y[j] = this.template[j] * s;
            }
        }
    }
    this.redraw();
}
DetailedPlotSettings.prototype.clearData = function() {
    this.data = [];
}
DetailedPlotSettings.prototype.addData = function(id, bound, colour, x, y, e) {
    var item = {id: id, bound: bound, colour: colour, x: x, y: y, e: e};
    if (id == 'template') {
        this.template = [];
        for (var v = 0; v < y.length; v++) {
            this.template.push(y[v]);
        }
        var s = parseFloat(this.templateScale);
        for (var i = 0; i < y.length; i++) {
            y[i] *= s;
        }
    }
    this.data.push(item);
}
DetailedPlotSettings.prototype.getBounds = function() {
    if (this.lockedBounds) return;
    var c = 0;
    this.xMin = 9e9;
    this.xMax = -9e9;
    this.yMin = 9e9;
    this.yMax = -9e9;
    for (var i = 0; i < this.data.length; i++) {
        if (this.data[i].bound) {
            c++;
        }
        var xs = this.data[i].x;
        var ys = this.data[i].y;
        if (this.data[i].bound) {
            if (xs != null) {
                for (var j = 0; j < xs.length; j++) {
                    if (xs[j] < this.xMin) {
                        this.xMin = xs[j];
                    }
                    if (xs[j] > this.xMax) {
                        this.xMax = xs[j];
                    }
                }
            }
        }
        if (ys != null) {
            for (var j = 0; j < ys.length; j++) {
                if (ys[j] < this.yMin) {
                    this.yMin = ys[j];
                }
                if (ys[j] > this.yMax) {
                    this.yMax = ys[j];
                }
            }
        }
    }
    if (c == 0) {
        this.xMin = 4000;
        this.xMax = 9000;
        this.yMin = 0;
        this.yMax = 1000;
    } else {
        if (this.yMin < 0) {
            this.yMin *= this.spacingFactor;
        } else {
            this.yMin /= this.spacingFactor;
        }
        if (this.yMax < 0) {
            this.yMax /= this.spacingFactor;
        } else {
            this.yMax *= this.spacingFactor;
        }
    }
}
DetailedPlotSettings.prototype.convertCanvasXCoordinateToDataPoint = function(x) {
    return this.xMin + ((x-this.left)/(this.width)) * (this.xMax - this.xMin);
}
DetailedPlotSettings.prototype.convertCanvasYCoordinateToDataPoint = function(y) {
    return this.yMin + (1-((y-this.top)/(this.height))) * (this.yMax - this.yMin);
}
DetailedPlotSettings.prototype.convertDataYToCanvasCoordinate = function(y) {
    return this.top  + (1-((y-this.yMin)/(this.yMax-this.yMin))) * this.height;
}
DetailedPlotSettings.prototype.convertDataXToCanvasCoordinate = function(x) {
    return this.left + ((x-this.xMin)/(this.xMax-this.xMin)) * this.width;
}
DetailedPlotSettings.prototype.convertDataYToCanvasCoordinate = function(y) {
    return this.top  + (1-((y-this.yMin)/(this.yMax-this.yMin))) * this.height;
}
DetailedPlotSettings.prototype.clearPlot = function() {
    this.c.save();
    this.c.setTransform(1, 0, 0, 1, 0, 0);
    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.c.restore();
}
DetailedPlotSettings.prototype.renderPlots = function() {
    for (var j = 0; j < this.data.length; j++) {
        this.c.beginPath();
        this.c.strokeStyle = this.data[j].colour;
        var xs = this.data[j].x;
        var ys = this.data[j].y;
        var disconnect = true;
        for (var i = 1; i < xs.length; i++) {
            if (disconnect == true) {
                disconnect = false;
                this.c.moveTo(this.convertDataXToCanvasCoordinate(xs[i]),this.convertDataYToCanvasCoordinate(ys[i]));
            } else {
                this.c.lineTo(this.convertDataXToCanvasCoordinate(xs[i]),this.convertDataYToCanvasCoordinate(ys[i]));
            }
        }
        this.c.stroke();
    }
}
DetailedPlotSettings.prototype.clearSurrounding = function() {
    this.c.clearRect(0, 0, this.canvas.width, this.top);
    this.c.clearRect(0, 0, this.left, this.canvas.height);
    this.c.clearRect(0, this.top + this.height, this.canvas.width, this.bottom);
    this.c.clearRect(this.left + this.width, 0, this.right, this.canvas.height);
}
DetailedPlotSettings.prototype.plotAxes = function() {
    this.c.strokeStyle = this.axesColour;
    this.c.beginPath();
    this.c.moveTo(this.left, this.top);
    this.c.lineTo(this.left, this.top + this.height);
    this.c.lineTo(this.left + this.width, this.top + this.height);
    this.c.stroke();
}
DetailedPlotSettings.prototype.plotAxesLabels = function(onlyLabels) {
    this.c.font = this.labelFont;
    this.c.strokeStyle = this.stepColour;
    this.c.filLStyle = this.labelFill;
    this.c.textAlign = 'center';
    this.c.textBaseline="top";

    var y = this.top + this.height + 5;
    this.c.beginPath()
    for (var i = 0; i < this.width / this.labelWidth; i++) {
        var x = this.left + (this.labelWidth * i) + 0.5;
        if (onlyLabels) {
            this.c.fillText(this.convertCanvasXCoordinateToDataPoint(x).toFixed(0), x, y);
        } else {
            this.c.moveTo(x, this.top);
            this.c.lineTo(x, this.top + this.height);
        }
    }
    this.c.textAlign = 'right';
    this.c.textBaseline="middle";
    x = this.left - 10;
    var zero = this.convertDataYToCanvasCoordinate(0);
    if (zero < this.top) {
        zero = this.top;
    }
    if (zero > (this.top + this.height)) {
        zero = (this.top + this.height);
    }
    for (var i = 0; i < (zero - this.top) / this.labelHeight; i++) {
        y = zero - (this.labelHeight * i) + 0.5;
        if (onlyLabels) {
            this.c.fillText(this.convertCanvasYCoordinateToDataPoint(y - 0.5).toFixed(0), x, y);
        } else {
            this.c.moveTo(this.left, y);
            this.c.lineTo(this.left + this.width, y);
        }
    }
    for (var i = 1; i < (this.top + this.height - zero) / this.labelHeight; i++) {
        y = zero + (this.labelHeight * i) + 0.5;
        if (onlyLabels) {
            this.c.fillText(this.convertCanvasYCoordinateToDataPoint(y - 0.5).toFixed(0), x, y);
        } else {
            this.c.moveTo(this.left, y);
            this.c.lineTo(this.left + this.width, y);
        }
    }
    if (!onlyLabels) {
        this.c.stroke();
    }
}
DetailedPlotSettings.prototype.plotZeroLine = function() {
    var y = this.convertDataYToCanvasCoordinate(0);
    if (y > (this.top + this.height) || y < this.top) {
        return;
    }
    this.c.strokeStyle = this.zeroLineColour;
    this.c.beginPath();
    this.c.moveTo(this.left, y + 0.5);
    this.c.lineTo(this.left + this.width, y + 0.5);
    this.c.stroke();
}
DetailedPlotSettings.prototype.drawZoomOut = function() {
    var x = this.canvas.width - this.zoomOutWidth;
    var y = 0;
    this.c.drawImage(this.zoomOutImg, x, y);
}
DetailedPlotSettings.prototype.redraw = function() {
    this.refreshSettings();
    this.getBounds();
    this.clearPlot();
    this.plotZeroLine();
    this.plotAxes();
    this.plotAxesLabels(false);
    this.renderPlots();
    this.clearSurrounding();
    this.plotAxesLabels(true);
    this.drawZoomOut();
}


DetailedPlotSettings.prototype.handleEvent = function(e) {
    var res = this.windowToCanvas(e);
    if (e.type == 'mousedown' || e.type == "touchstart") {
        this.canvasMouseDown(res);
    } else if (e.type == 'mouseup' || e.type == 'touchend') {
        this.canvasMouseUp(res);
    } else if (e.type == 'mousemove' || e.type == 'touchmove') {
        this.canvasMouseMove(res);
    }
}
DetailedPlotSettings.prototype.windowToCanvas = function(e) {
    var result = {};
    var rect = this.canvas.getBoundingClientRect();
    result.x = e.clientX - rect.left;
    result.y = e.clientY - rect.top;
    result.dataX = this.convertCanvasXCoordinateToDataPoint(result.x);
    result.dataY = this.convertCanvasYCoordinateToDataPoint(result.y);
    if (result.dataX < this.xMin || result.dataX > this.xMax) result.dataX = null;
    if (result.dataY < this.yMin || result.dataY > this.yMax) result.dataY = null;
    result.inside = (result.dataX != null && result.dataY != null);

    return result;
}
DetailedPlotSettings.prototype.canvasMouseDown = function(loc) {
    if (loc.inside) {
        this.lastXDown = loc.x;
        this.lastYDown = loc.y;
    }
}
DetailedPlotSettings.prototype.canvasMouseUp = function(loc) {
    this.currentMouseX = loc.x;
    this.currentMouseY = loc.y;
    if (this.lastXDown != null && this.lastYDown != null && this.currentMouseX != null && this.currentMouseY != null &&
        distance(this.lastXDown, this.lastYDown, this.currentMouseX, this.currentMouseY) > this.minDragForZoom) {
        var x1 = this.convertCanvasXCoordinateToDataPoint(this.lastXDown);
        var x2 = this.convertCanvasXCoordinateToDataPoint(this.currentMouseX);
        var y1 = this.convertCanvasYCoordinateToDataPoint(this.lastYDown);
        var y2 = this.convertCanvasYCoordinateToDataPoint(this.currentMouseY);
        this.xMin = Math.min(x1, x2);
        this.xMax = Math.max(x1, x2);
        this.yMin = Math.min(y1, y2);
        this.yMax = Math.max(y1, y2);
        this.lockedBounds = true;
    } else {
        if (loc.x > (this.canvas.width - this.zoomOutWidth) && loc.y < this.zoomOutHeight) {
            this.lockedBounds = false;
        }
    }
    this.lastXDown = null;
    this.lastYDown = null;
    this.redraw();
}
DetailedPlotSettings.prototype.canvasMouseMove = function(loc) {
    if (this.lastXDown == null || this.lastYDown == null || !loc.inside) {
        return;
    }
    if (distance(loc.x, loc.y, this.lastXDown, this.lastYDown) < this.minDragForZoom) {
        return;
    }
    this.currentMouseX = loc.x;
    this.currentMouseY = loc.y;
    this.redraw();
    this.c.strokeStyle = this.dragOutlineColour;
    this.c.fillStyle = this.dragInteriorColour;
    var w = loc.x - this.lastXDown;
    var h = loc.y - this.lastYDown;
    this.c.fillRect(this.lastXDown + 0.5, this.lastYDown, w, h);
    this.c.strokeRect(this.lastXDown + 0.5, this.lastYDown, w, h);
}