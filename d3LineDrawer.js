import * as d3 from "d3";
export class D3LineDrawer {
    constructor(color = "red", width = 10, id = "d3-drawer-line") {
        this.width = width;
        this.lineContainer = d3
            .create("svg")
            .style("position", "fixed")
            .style("overflow", "hidden")
            .style("pointer-events", "none");
        this.path = this.lineContainer
            .append("path")
            .attr("stroke", color)
            .attr("stroke-width", width)
            .attr("id", id);
        document.body.append(this.lineContainer.node());
    }

    draw(leftPoint, rightPoint) {
        const {top, left, width, height} = this.computeLineContainerParams(leftPoint, rightPoint);
        const angle =
            this.computeAngle(rightPoint, leftPoint);
        this.lineContainer
            .style("top", top)
            .style("left", left)
            .style("width", width)
            .style("height", height);
        const line = d3.line()(
            this.mapAngleAndPointsToLineDots(angle, leftPoint, rightPoint)
        );
        this.lineContainer.select("path").attr("d", line);
    }

    computeAngle(rightPoint, leftPoint) {
        const RADIAN = 57.3;
        return Math.atan((rightPoint.y - leftPoint.y) / (rightPoint.x - leftPoint.x)) *
            RADIAN;
    }

    computeLineContainerParams(leftPoint, rightPoint) {
        const isLeftHigher = leftPoint.y < rightPoint.y;
        const top = isLeftHigher ? leftPoint.y : rightPoint.y;
        const left = leftPoint.x;
        const width = Math.max(Math.abs(leftPoint.x - rightPoint.x), 10);
        const height = Math.max(Math.abs(leftPoint.y - rightPoint.y), 10);
        return {top, left, width, height};
    }

    mapAngleAndPointsToLineDots(angle, leftPoint, rightPoint) {
        const res = [];

        const width = Math.max(Math.abs(leftPoint.x - rightPoint.x), 10);
        const height = Math.max(Math.abs(leftPoint.y - rightPoint.y), 10);
        const isTopHalf = angle < 0;
        // TODO: Вычислить формулу зависимости от угла наклона
        const yOffset = this.width;
        const xOffset = this.width;
        if (leftPoint.connectSide === "TOP") {
            res[0] = [xOffset, height + yOffset];
        } else if (leftPoint.connectSide === "RIGHT") {
            if (isTopHalf) {
                res[0] = [-xOffset, height - yOffset];
            } else {
                res[0] = [-xOffset, yOffset];
            }
        } else if (leftPoint.connectSide === "BOTTOM") {
            res[0] = [xOffset, -yOffset];
        }

        if (rightPoint.connectSide === "TOP") {
            res[1] = [width - xOffset, height + yOffset];
        } else if (rightPoint.connectSide === "LEFT") {
            if (isTopHalf) {
                res[1] = [width + xOffset, yOffset];
            } else {
                res[1] = [width + xOffset, height - yOffset];
            }
        } else if (rightPoint.connectSide === "BOTTOM") {
            res[1] = [width - xOffset, -yOffset];
        }
        return res;
    }

    remove() {
        this.lineContainer.remove();
    }
}
