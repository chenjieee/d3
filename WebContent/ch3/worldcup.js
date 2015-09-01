function createSoccerViz() {
    d3.csv('worldcup.csv', function(data) {
        d3.select('svg')
            .append('g')
            .attr('id', 'teamsG')
            .attr('transform', 'translate(100, 150)')
            .selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'overallG')
            .attr('transform', function(d, i) { return 'translate(' + (i * 100) + ', 0)' });

        var teamG = d3.selectAll('g.overallG');
        teamG.append('circle')
            .style('fill', 'pink')
            .style('stroke', 'black')
            .style('stroke-width', '1px')
            .attr('r', 0)
            .transition().delay(function(d, i) { return i * 200 })
            .duration(1000)
            .attr('r', 40)
            .transition()
            .duration(1000)
            .attr('r', 20);

        teamG.append('text')
            .style('text-anchor', 'middle')
            .attr('y', 30)
            .style('font-size', '10px')
            .text(function(d) { return d.team; });

        var keys = d3.keys(data[0]).filter(function(key) { return key != 'team' && key != 'region' });
        d3.select('#controls')
            .selectAll('button')
            .data(keys)
            .enter()
            .append('button')
            .on('click', buttonClick)
            .html(function(d) { return d });

        function buttonClick(key) {
            var max = d3.max(data, function(d) { return Number(d[key]) });
            rScale = d3.scale.linear().domain([0, max]).range([5, 50]);
            teamG.select('circle')
                .transition().duration(1000)
                .attr('r', function(d) { return rScale(Number(d[key])) });
        }

        teamG.on('mouseover', function(d) {
            var teamColor = d3.rgb('pink');
            teamG.select('circle')
                .style('fill', function(p) {
                    return (d.region == p.region) ? teamColor.darker(.75) : teamColor.brighter(.5);
                });
        });
        teamG.on('mouseout', function(d) {
            teamG.select('circle')
                .style('fill', 'pink');
        });

        d3.text('modal.html', function(data) {
            d3.select('body')
                .append('div')
                .attr('id', 'modal')
                .html(data);
        });

        teamG.on('click', function(d) {
            d3.selectAll('td.data')
                .data(d3.values(d))
                .html(function(p) { return p });
        });
    });
}
