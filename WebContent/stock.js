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
        data[i - 1].ma[n] = d3.mean(nData, function(d) { return d.close });
    }
}

function onload() {
    var maxWidth = 1500, maxHeight = 300;

    d3.json('60min.json', function(data) {
        data = data.slice(data.length - 125, data.length);
        data.forEach(function(d, i) { d.index = i });

        var maNs = [ 5, 10, 20, 60 ];
        maNs.forEach(function(maN) { calcMA(data, maN) });

        var width = maxWidth / data.length;

        var min = d3.min(data, function(d) { return Number(d.low) });
        var max = d3.max(data, function(d) { return Number(d.high) });
        var scale = d3.scale.linear().domain([min, max]).range([0, maxHeight]);

        var axis = d3.svg.axis().scale(scale).orient('right').tickSize(maxWidth);

        function left(d) { return d.index * width + 1 }
        function mid(d) { return (d.index + .5) * width  }
        function right(d) { return (d.index + 1) * width - 1 }

        function open(d) { return maxHeight - scale(Number(d.open)) }
        function close(d) { return maxHeight - scale(Number(d.close)) }
        function low(d) { return maxHeight - scale(Number(d.low)) }
        function high(d) { return maxHeight - scale(Number(d.high)) }

        function ma(d, n) { return maxHeight - scale(Number(d.ma[n])) }

        var yang = data.filter(function(d) { return d.close > d.open });
        var yin = data.filter(function(d) { return d.close < d.open });
        var cross = data.filter(function(d) { return d.close == d.open });

        var gK = d3.select('svg')
            .append('g')
            .attr('class', 'k');

        var gAxis = gK.append('g')
            .attr('class', 'axis')
            .call(axis);

        var gYang = gK.selectAll('g.yang')
            .data(yang)
            .enter()
            .append('g')
            .attr('class', 'yang');
        gYang.append('rect')
            .attr('x', function(d) { return left(d) })
            .attr('y', function(d) { return close(d) })
            .attr('width', width - 2)
            .attr('height', function(d) { return open(d) - close(d) });
        gYang.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + low(d) + ' L ' + mid(d) + ',' + open(d) });
        gYang.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + high(d) + ' L ' + mid(d) + ',' + close(d) });

        var gYin = gK.selectAll('g.yin')
            .data(yin)
            .enter()
            .append('g')
            .attr('class', 'yin');
        gYin.append('rect')
            .attr('x', function(d) { return left(d) })
            .attr('y', function(d) { return open(d) })
            .attr('width', width - 2)
            .attr('height', function(d) { return close(d) - open(d) });
        gYin.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + low(d) + ' L ' + mid(d) + ',' + close(d) });
        gYin.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + high(d) + ' L ' + mid(d) + ',' + open(d) });

        var gCross = gK.selectAll('g.cross')
            .data(cross)
            .enter()
            .append('g')
            .attr('class', 'cross');
        gCross.append('path')
            .attr('d', function(d) { return 'M ' + left(d) + ',' + close(d) + ' L ' + right(d) + ',' + close(d) });
        gCross.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + low(d) + ' L ' + mid(d) + ',' + close(d) });
        gCross.append('path')
            .attr('d', function(d) { return 'M ' + mid(d) + ',' + high(d) + ' L ' + mid(d) + ',' + open(d) });

        maNs.forEach(function(maN) {
            var maPath = 'M ' + data.filter(function(d) { return d.ma[maN] }).map(function(d) { return mid(d) + ',' + ma(d, maN) }).join(' L ');
            var gMa = gK.append('g')
                .attr('class', 'ma' + maN);
            gMa.append('path')
                .attr('d', maPath);
        });
    });
}
