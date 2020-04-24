function draw(faculty, links) {
    
    // set a variable for the whole map
    
    var map = d3.select('#map');
    
    // make tooltip
    
    var toolTip = d3.select('#container')
    .append('div')
    .attr('class', 'tooltip')
    .attr('style','visibility: hidden;');
    
    // put the links on the map
    
    var lines = map.selectAll('.link')
    .data(links)
    .enter().append("line")
    .attr("class", "link");
    
    // mark locations for the nodes
    
    var node = map.selectAll('g')
    .data(faculty)
    .enter()
    .append('g')
    .attr('class','node')
    
    // set down node circles
    
    node.append('circle')
    .attr("r", function(d) { return 20; })
    .style("fill", 'blue')
    
    // put faculty avatars on the circles
    
    node.append("svg:image")
    .attr('class', 'avatar')
    .attr("xlink:href",  function(d){ return d.image})
    .attr("clip-path", 'circle(19px)')
    .attr("x", function(d) { return -25;})
    .attr("y", function(d) { return -25;})
    .attr("height", function(d) { return  50; })
    .attr("width", function(d) { return  50; });
    
    // make faculty links change color when you hover on a faculty member
    
    // make it show the tooltip with faculty name too
    
    node.on('mouseover', function(d){
      var posX = d3.event.pageX;
      var posY = d3.event.pageY;
        
      var connectedLinks = lines.filter(function(e) {
        return d == e.source || d == e.target; //connected links
      }).style('stroke', 'red').style('opacity', 1);
      
      toolTip
        .attr('style','left:'+ posX +'px;top:'+ posY +'px; visibility: visible;')
        .html('<strong>'+ d.name + '</strong>');
        
    });
    
    // make it stop doing that when you no longer hover
    
    // make the tooltip go away too
    
    node.on('mouseout', function(d){
      
      
      var connectedLinks = lines.filter(function(e) {
          return d.name == e.source.name || d.name == e.target.name; //connected links
      }).style('stroke', 'blue').style('opacity',.5);
      
       
      toolTip.attr('style', 'visibility: hidden;');
    });
    
    // show information when you click on a node
    
    node.on('click', function(d){
        
        
        
        
        // erase anything left in the box and show it
        
        var infoBox = document.getElementById('infobox');
        infoBox.innerHTML = '';
        
        infoBox.style.display = 'block';
        
        // post the image of the faculty member
        
        var img = document.createElement('img');
        img.src = d.image;
        infoBox.append(img);
        
        // write the name of the faculty member
        
        var name = document.createElement('h3');
        var nameText = document.createTextNode(d.name);
        name.append(nameText);
        infoBox.append(name);
        
        // write the research interests of the faculty member
        if (d.interests.length > 0){
            var researchElement = document.createElement('h5');
            var interests = d.interests.join('; ');
            var research = document.createTextNode('Research interests: ' + interests +'.');
            researchElement.append(research);
            infoBox.append(researchElement); 
        }
        
        //list faculty with similar research interests
        
        if (researchElement !== undefined){
            var simIntArr = [];
            
            // get the faculty who have similar interests
            
            links.forEach(function(e){
                if (e.source === d && !simIntArr.includes(e.target.name)){
                    simIntArr.push(e.target.name);
                } else if (e.target === d && !simIntArr.includes(e.source.name)){
                    simIntArr.push(e.source.name);}
            });
            var simIntString = simIntArr.join('; ');
            var simIntText = document.createTextNode('Faculty with similar interests include: ' + simIntString +'.');
            var simIntEl = document.createElement('h5');
            simIntEl.append(simIntText);
            infoBox.append(simIntEl);
            
            
        } else {
            var space = document.createElement("div");
            infoBox.append(space);
        }
        
        // button to close infoBox
            
        var closeButtonText = document.createTextNode("Close");
        var closeButton = document.createElement("button");
        closeButton.append(closeButtonText);
        closeButton.onclick = function(){
            infoBox.innerHTML = '';
            infoBox.style.display = 'none';
            lines.style('stroke', 'blue').style('opacity', .5);
        }
        infoBox.append(closeButton);
    });
    
    // force layout
    
    var simulation = d3.forceSimulation(faculty)
    .force('collision', d3.forceCollide(20))
    .force('x', d3.forceX(function(d){return d.x}))
    .force('y', d3.forceY(function(d){return d.y}))
    .on('tick', function(){
        lines
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
        node 
          .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; })
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
}


// fetch the data, make an object for each person and location, and put them in respective arrays

fetch('data.json')
    .then(function(response) {return response.json()})
    .then(function(data){
        var faculty = [];
        var locations = [];
        data.forEach(function(n){
            if (n.person !== undefined){
                var person = n.person;
                var image = n.icon;
                var interests = n.interests;
                var location = n.location;
                faculty.push({
                    name : person,
                    image : image,
                    interests: interests,
                    location: location
                });
            } else {
                var location = n.location;
                var x = n.x;
                var y = n.y;
                locations.push({
                    location: location,
                    x: x,
                    y: y
                });
            }
        });
    
    
    // put building coordinates in each faculty object

    faculty.forEach(function(n){
        var loc = locations.find(function(d){return d.location == n.location} );
        if (loc !== undefined){
            n.x = loc.x;
            n.y = loc.y;
        } else{
            n.x = 0;
            n.y = 0;
        }
    });
    
    // make an array containing all the interests all the faculty have. not sure what i'll do with this but might need it.
    
    var interests = [];
            
    faculty.forEach(function(n){
        var duplicate = false;
        n.interests.forEach(function(i){
                
            interests.forEach(function(j){
            if (i == j){
                duplicate = true;
                }
            });
            if (duplicate == false){
                interests.push(i);
            }
        });
    });
    
    
    // make an array of links between faculty by common research interest.
    
    var links = []
    
    faculty.forEach(function(n){
        faculty.forEach(function(i){
            if (n !== i && !links.includes({source: n, target: i}) && !links.includes({source: i, target: n})){
                if (n.interests.some(item => i.interests.includes(item))){
                    links.push({source: n, target: i});
                }
            }
        });
    });
    
    draw(faculty,links);
});