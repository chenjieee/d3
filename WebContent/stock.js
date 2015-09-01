function calcMA(data, n) {
    for (var i = 0; i < data.length; i++) {
        if (!data[i].ma) {
            data[i].ma = {};
        }
    }
    for (var i = 1; i < n; i++) {
        data[i - 1].ma[n] = null;
    }
    for (var i = n; i <= data.length; i++) {
        var nData = data.slice(i - n, i);
        data[i - 1].ma[n] = d3.mean(nData, function(d) { return Number(d.close) });
    }
}

function onload() {
    var maxWidth = 1500, maxHeight = 300;

    d3.json('60min.json', function(data) {
        var maNs = [ 5, 10, 20, 60 ];
        maNs.forEach(function(maN) { calcMA(data, maN) });

        data = data.slice(data.length - 125, data.length);
        data.forEach(function(d, i) { d.index = i });

        var width = maxWidth / data.length;

        var min = d3.min(data, function(d) {
            var values = maNs.map(function(maN) { return d.ma[maN] });
            values.push(Number(d.low));
            return d3.min(values);
        });
        var max = d3.max(data, function(d) {
            var values = maNs.map(function(maN) { return d.ma[maN] });
            values.push(Number(d.high));
            return d3.max(values);
        });
        var scale = d3.scale.linear().domain([max, min]).range([0, maxHeight]);

        var ticks = [ min, (max * 0.25 + min * 0.75), (max * 0.50 + min * 0.50), (max * 0.75 + min * 0.25), max ];
        var axis = d3.svg.axis().scale(scale).orient('right').tickValues(ticks).tickFormat(d3.format('.2f'));

        function left(d) { return d.index * width + 1 }
        function mid(d) { return (d.index + 0.5) * width  }
        function right(d) { return (d.index + 1) * width - 1 }

        function open(d) { return scale(Number(d.open)) }
        function close(d) { return scale(Number(d.close)) }
        function low(d) { return scale(Number(d.low)) }
        function high(d) { return scale(Number(d.high)) }

        function ma(d, n) { return scale(Number(d.ma[n])) }

        var yang = data.filter(function(d) { return Number(d.close) > Number(d.open) });
        var yin = data.filter(function(d) { return Number(d.close) < Number(d.open) });
        var cross = data.filter(function(d) { return Number(d.close) == Number(d.open) });

        var gK = d3.select('svg')
            .append('g')
            .attr('class', 'k')
            .attr('transform', 'translate(50, 50)');

        var gAxis = gK.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + maxWidth + ', 0)');
        gAxis.call(axis);

        var gTick = gK.append('g')
            .attr('class', 'tick');
        gTick.selectAll('path')
            .data(ticks)
            .enter()
            .append('path')
            .attr('d', function(d) { return 'M 0,' + scale(d) + ' L ' + maxWidth + ',' + scale(d) });

        var gYang = gK.append('g')
            .attr('class', 'yang')
            .selectAll('g')
            .data(yang)
            .enter()
            .append('g')
            .attr('index', function(d) { return d.index });
        gYang.append('rect')
            .attr('x', function(d) { return left(d) })
            .attr('y', function(d) { return close(d) })
            .attr('width', width - 2)
            .attr('height', function(d) { return open(d) - close(d) });
        gYang.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + low(d) + ' L ' + mid(d) + ',' + open(d) });
        gYang.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + high(d) + ' L ' + mid(d) + ',' + close(d) });

        var gYin = gK.append('g')
            .attr('class', 'yin')
            .selectAll('g')
            .data(yin)
            .enter()
            .append('g')
            .attr('index', function(d) { return d.index });
        gYin.append('rect')
            .attr('x', function(d) { return left(d) })
            .attr('y', function(d) { return open(d) })
            .attr('width', width - 2)
            .attr('height', function(d) { return close(d) - open(d) });
        gYin.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + low(d) + ' L ' + mid(d) + ',' + close(d) });
        gYin.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + high(d) + ' L ' + mid(d) + ',' + open(d) });

        var gCross = gK.append('g')
            .attr('class', 'cross')
            .selectAll('g')
            .data(cross)
            .enter()
            .append('g')
            .attr('index', function(d) { return d.index });
        gCross.append('path')
            .attr('d', function(d) { return 'M ' + left(d) + ',' + close(d) + ' L ' + right(d) + ',' + close(d) });
        gCross.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + low(d) + ' L ' + mid(d) + ',' + close(d) });
        gCross.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + high(d) + ' L ' + mid(d) + ',' + open(d) });

        var gMa = gK.append('g')
            .attr('class', 'ma')
            .selectAll('g')
            .data(maNs)
            .enter()
            .append('g')
            .attr('index', function(d) { return d });
        gMa.append('path')
            .attr('d', function(maN) { return 'M ' + data.filter(function(d) { return d.ma[maN] }).map(function(d) { return mid(d) + ',' + ma(d, maN) }).join(' L ') });
    });
}
