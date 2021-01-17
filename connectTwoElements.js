export class ConnectTwoElements {
    constructor(
        firstEl,
        secondEl,
        drawLine,
        redrawLine = drawLine,
        removeLine = () => null,
        changeTriggerSize = 1
    ) {
        this.drawLine = drawLine;
        this.redrawLine = redrawLine;
        this.removeLine = removeLine;
        this.firstEl = firstEl;
        this.secondEl = secondEl;
        this.changeTriggerSize = changeTriggerSize;
        this.oldCentersPoints = null;
        this.CORNER_ANGLE = 25;
        this.handleMouseWheel = this.handleMouseWheel.bind(this);
        window.addEventListener("mousewheel", this.handleMouseWheel);
        this.MO = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.target.contains(firstEl) ||
                    mutation.target.contains(secondEl)
                ) {
                    this.redraw();
                }
            });
        });
        this.MO.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        });
        this.firstElRO = new ResizeObserver(() => this.redraw());
        this.secondElRO = new ResizeObserver(() => this.redraw());
        this.firstElRO.observe(firstEl);
        this.secondElRO.observe(secondEl);
    }

    handleMouseWheel(ev) {
        if (ev.target.contains(this.firstEl) || ev.target.contains(this.secondEl)) {
            this.redraw();
        }
    }

    destroy() {
        window.removeEventListener("mousewheel", this.handleMouseWheel);
        this.MO.disconnect();
        this.firstElRO.disconnect();
        this.secondElRO.disconnect();
        this.removeLine();
    }

    connect() {
        const points = this.findConnectPoints();
        if (points[0] && points[1]) {
            this.drawLine(points[0], points[1]);
        }
    }

    computeSidesCenters(elem) {
        const {top, left, width, height} = elem.getBoundingClientRect();
        const widthCenter = left + width / 2;
        const heightCenter = top + height / 2;
        return {
            top: {
                x: widthCenter,
                y: top
            },
            left: {
                x: left,
                y: heightCenter
            },
            right: {
                x: left + width,
                y: heightCenter
            },
            bottom: {
                x: widthCenter,
                y: top + height
            }
        };
    }

    computeDistanceBetweenTwoPoints(point1, point2) {
        return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
    }

    computeMatrixOfDistances(points1, points2) {
        return points2.map((point2) =>
            points1.map((point1) =>
                this.computeDistanceBetweenTwoPoints(point1, point2)
            )
        );
    }

    sortCellsInMatrix(matrix) {
        const matrixCells = [];
        matrix.forEach((row, rowIdx) =>
            row.forEach((cell, colIdx) =>
                matrixCells.push({
                    distance: cell,
                    row: rowIdx,
                    col: colIdx
                })
            )
        );
        return matrixCells.sort((a, b) => a.distance - b.distance);
    }

    sidesToArray(sides) {
        return [sides.top, sides.right, sides.bottom, sides.left];
    }

    findConnectPoints() {
        if (document.body && (!document.body.contains(this.firstEl) || !document.body.contains(this.secondEl))) {
            this.destroy();
            return [null, null];
        }
        const firstPointCentersOfSides = this.sidesToArray(
            this.computeSidesCenters(this.firstEl)
        );
        const secondPointCentersOfSides = this.sidesToArray(
            this.computeSidesCenters(this.secondEl)
        );
        const newCenterPoints = firstPointCentersOfSides.concat(
            secondPointCentersOfSides
        );
        if (
            this.oldCentersPoints &&
            this.getMaxPointsDiff(this.oldCentersPoints, newCenterPoints) <
            this.changeTriggerSize
        ) {
            return [null, null];
        }
        this.oldCentersPoints = newCenterPoints;
        const matrixOfDistances = this.computeMatrixOfDistances(
            firstPointCentersOfSides,
            secondPointCentersOfSides
        );
        const matrixCells = this.sortCellsInMatrix(matrixOfDistances);
        for (let i = 0; i < matrixCells.length; i++) {
            const {row, col} = matrixCells[i];
            const firstPoint = firstPointCentersOfSides[col];
            firstPoint.connectSide = this.mapIdxToPlace(col);
            const secondPoint = secondPointCentersOfSides[row];
            secondPoint.connectSide = this.mapIdxToPlace(row);
            const angle = this.computeAngle(firstPoint, secondPoint);
            const leftPoint = firstPoint.x < secondPoint.x ? firstPoint : secondPoint;
            const rightPoint =
                firstPoint.x < secondPoint.x ? secondPoint : firstPoint;
            const isOppositeBlocks =
                leftPoint.connectSide === "RIGHT" && rightPoint.connectSide === "LEFT";
            if ((isNaN(angle) || angle < this.CORNER_ANGLE) && !isOppositeBlocks) {
                continue;
            }

            return [leftPoint, rightPoint];
        }
        return [null, null];
    }

    computeAngle(firstPoint, secondPoint) {
        const RADIAN = 57.3;
        return Math.abs(
            Math.atan(
                (firstPoint.y - secondPoint.y) / (firstPoint.x - secondPoint.x)
            ) * RADIAN
        );
    }

    mapIdxToPlace(idx) {
        switch (idx) {
            case 0:
                return "TOP";
            case 1:
                return "RIGHT";
            case 2:
                return "BOTTOM";
            default:
                return "LEFT";
        }
    }

    getPointsDiff(oldPoints, newPoints) {
        return oldPoints.map((point, idx) =>
            this.computeDistanceBetweenTwoPoints(point, newPoints[idx])
        );
    }

    getMaxPointsDiff(oldPoints, newPoints) {
        return Math.max.apply(null, this.getPointsDiff(oldPoints, newPoints));
    }

    redraw() {
        const points = this.findConnectPoints();
        if (points[0] && points[1]) {
            this.redrawLine(points[0], points[1]);
        }
    }
}
