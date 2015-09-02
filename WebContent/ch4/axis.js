var maxWidth = 500, maxHeight = 500;

function onload() {
    var data = [
        { friends: 5,  salary: 22000  },
        { friends: 3,  salary: 18000  },
        { friends: 10, salary: 88000  },
        { friends: 0,  salary: 180000 },
        { friends: 27, salary: 56000  },
        { friends: 8,  salary: 74000  }
    ];

    var xMax = d3.max(data, function(d) { return d.salary });
    var yMax = d3.max(data, function(d) { return d.friends });

    var xScale = d3.scale.linear().domain([0, xMax]).range([0, maxWidth]);
    var yScale = d3.scale.linear().domain([0, yMax]).range([0, maxHeight]);

    d3.select('svg').append('g').attr('id', 'rootG').attr('transform', 'translate(50, 50)');

    var xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickSize(500).ticks(4);
    d3.select('#rootG').append('g').attr('id', 'xAxisG').call(xAxis);

    var yAxis = d3.svg.axis().scale(yScale).orient('right').tickSize(500).ticks(10);
    d3.select('#rootG').append('g').attr('id', 'yAxisG').call(yAxis);

    d3.select('#rootG')
        .append('g')
        .attr('id', 'circleG')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', 10)
        .attr('cx', function(d) { return xScale(d.salary) })
        .attr('cy', function(d) { return yScale(d.friends) })
}
