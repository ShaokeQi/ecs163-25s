const width = window.innerWidth;
const height = window.innerHeight;

let scatterMargin = { top: 10, right: 30, bottom: 60, left: 60 },
    scatterWidth = 500 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

let barMargin = { top: 10, right: 30, bottom: 60, left: 60 },
    barWidth = 500 - barMargin.left - barMargin.right,
    barHeight = 400 - barMargin.top - barMargin.bottom;

let radarMargin = { top: 10, right: 30, bottom: 60, left: 60 },
radarWidth = width - radarMargin.left - radarMargin.right,
radarHeight = 400 - radarMargin.top - radarMargin.bottom;

let lineMargin = { top: 10, right: 30, bottom: 60, left: 60 },
    lineWidth = 2000,
    lineHeight = 1000;


    d3.csv("pokemon_alopez247.csv").then(rawData =>{
        console.log("rawData", rawData);
    
        rawData.forEach(function(d){
            d.Height_m = Number(d.Height_m);
            d.Weight_kg = Number(d.Weight_kg);
            d.HP = Number(d.HP);
            d.Attack = Number(d.Attack);
            d.Sp_Atk = Number(d.Sp_Atk);
            d.Defense = Number(d.Defense);
            d.Sp_Def = Number(d.Sp_Def);
            d.Speed = Number(d.Speed);
        });
    
    
    const processedData = rawData.map(d=>{
                            return {
                                "Name": d.Name,
                                "Height":d.Height_m,
                                "Weight":d.Weight_kg,
                                "Type_1" : d.Type_1,
                                "Type_2" : d.Type_2,
                                "HP": d.HP,
                                "Attack": d.Attack,
                                "Sp_Atk": d.Sp_Atk,
                                "Defense": d.Defense,
                                "Sp_Def": d.Sp_Def,
                                "Speed": d.Speed,
                            };
    });
    
    // Bar Chart for type count
    const svg1 = d3.select("#bar").append("svg")
        .attr("width", barWidth + barMargin.left + barMargin.right)
        .attr("height", barHeight + barMargin.top + barMargin.bottom);

    function updateBarChart() {   
        svg1.selectAll("*").remove();
        const g1 = svg1.append("g")
        .attr("transform", `translate(${barMargin.left}, ${barMargin.top})`);
        const types = Array.from(new Set(
            processedData.flatMap(d => [d.Type_1, d.Type_2].filter(Boolean))
        ));
        const typeCounts = processedData.reduce((s, { Type_1, Type_2 }) => {
            [Type_1, Type_2].filter(Boolean).forEach(type => {
                s[type] = (s[type] || 0) + 1;
            });
            return s;
        }, {});
        const typeData = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
    
        // X ticks
        const x2 = d3.scaleBand()
            .domain(typeData.map(d => d.type))
            .range([0, barWidth])
            .padding(0.2);
        // Y ticks
        const y2 = d3.scaleLinear()
            .domain([0, d3.max(typeData, d => d.count)])
            .range([barHeight, 0])
            .nice();
    
        g1.append("g")
            .attr("transform", `translate(0, ${barHeight})`)
            .call(d3.axisBottom(x2))
            .selectAll("text")
            .attr("transform", "rotate(-40)")
            .style("text-anchor", "end");
    
        g1.append("g")
            .call(d3.axisLeft(y2));
    
        g1.selectAll("rect")
            .data(typeData)
            .enter().append("rect")
            .attr("x", d => x2(d.type))
            .attr("y", d => y2(d.count))
            .attr("width", x2.bandwidth())
            .attr("height", d => barHeight - y2(d.count))
            .attr("fill", "steelblue")
            .on("click", function(event, d) {
                updateLineChartXAxis(typeData[d].type);    
            });
    
        // X label
        g1.append("text")
            .attr("x", barWidth / 2)
            .attr("y", barHeight + 50)
            .attr("text-anchor", "middle")
            .text("Type");
    
        // Y label
        g1.append("text")
            .attr("x", -barHeight / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Count");
      }
    updateBarChart();


    // Scatter Plot
    const svg2 = d3.select("#scatter").append("svg")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom);

    const g2 = svg2.append("g")
        .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);
    // X label
    g2.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 40)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("Height (m)");
    
    // Y label
    g2.append("text")
        .attr("x", -scatterHeight / 2)
        .attr("y", -40)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Weight (kg)");

    // X ticks
    const x1 = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.Height)])
        .range([0, scatterWidth]);
    
    // Y ticks
    const y1 = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.Weight)])
        .range([scatterHeight, 0]);
    
      
    g2.append("g")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(d3.axisBottom(x1).ticks(7))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    g2.append("g")
        .call(d3.axisLeft(y1).ticks(10));

    const circles = g2.selectAll("circle")
        .data(processedData)
        .enter().append("circle")
        .attr("cx", d => x1(d.Height))
        .attr("cy", d => y1(d.Weight))
        .attr("r", 2)
        .attr("fill", "#69b3a2");
    let selectedData = [];
    const brush = d3.brush()
    .extent([[0, 0], [scatterWidth, scatterHeight]])
    .on("start brush end", function(event) {
        const selection = d3.event.selection;
        circles
            .style("fill", "#69b3a2")
            .style("stroke", "none");
        if (selection) {
            const [[x0, y0], [x1b, y1b]] = selection;

            selectedData = circles
                .filter(d => {
                    const cx = x1(d.Height);
                    const cy = y1(d.Weight);
                    return x0 <= cx && cx <= x1b && y0 <= cy && cy <= y1b;
                })
                .style("fill", "orange")
                .data();
        }
        updateLineChar();
        updateRadar();
    });

    g2.append("g")
    .attr("class", "brush")
    .call(brush)

    g2.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .text("Scatter plot for height and weight");

    const attributes = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];
    // Radar Chart for select pokeman
    const svg3 = d3.select("#radar").append("svg")
     .attr("width", radarWidth + radarMargin.left + radarMargin.right)
     .attr("height", radarHeight + radarMargin.top + radarMargin.bottom);
    const g3 = svg3.append("g")
        .attr("transform", `translate(${radarMargin.left}, ${radarMargin.top})`);
    const radarGroup = svg3.append("g")
        .attr("transform", "translate(200,200)");

    const angleSlice = (2 * Math.PI) / attributes.length;
    const levels = 4;
    const maxValue = d3.max(processedData, d => Math.max(...attributes.map(attr => d[attr])));

    
    for (let level = 1; level <= levels; level++) {
        const r = (level / levels) * 100;
        radarGroup.append("polygon")
            .attr("points", attributes.map((_, i) => {
                const angle = i * angleSlice + 0.5 * angleSlice;
                return [
                    r * Math.cos(angle),
                    r * Math.sin(angle)
                ].join(",");
            }).join(" "))
            .attr("fill", "none")
            .attr("stroke", "#ccc");
    }

    // add attibutes description
    attributes.forEach((attr, i) => {
        const angle = i * angleSlice + 0.5 * angleSlice;
        radarGroup.append("text")
            .attr("x", 120 * Math.cos(angle))
            .attr("y", 120 * Math.sin(angle))
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(attr);
    });

    
    const radarLine = d3.lineRadial()
        .radius(d => (d.value / maxValue) * 100)
        .angle((d, i) => i * angleSlice + 2 * angleSlice)
        .curve(d3.curveLinearClosed);
    
    const radarPath1 = radarGroup.append("path")
        .attr("fill", "rgba(0, 128, 255, 0.3)")
        .attr("stroke", "blue");

    const radarPath2 = radarGroup.append("path")
    .attr("fill", "rgba(255, 255, 0, 0.3)")
    .attr("stroke", "yellow");
    function updateRadar() {
        g3.select(".title").remove();
        const sortedData = selectedData
            .sort((a, b) => d3.ascending(a["total"], b["total"]));
        if (sortedData.length == 0) return;
        const poke1 = sortedData[0];
        const poke2 = sortedData[sortedData.length - 1];

        const data1 = attributes.map(attr => ({ axis: attr, value: poke1[attr] }));
        radarPath1
            .datum(data1)
            .attr("d", radarLine);

        const data2 = attributes.map(attr => ({ axis: attr, value: poke2[attr] }));
        radarPath2
            .datum(data2)
            .attr("d", radarLine);

        g3.append("text")
        .attr("x", 200)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("class", "title")
        .text(poke1["Name"] + "(Blue) VS " + poke2["Name"] + "(Yellow)");
    }
   

    // Line Chart for attribute
    const svg4 = d3.select("#line").append("svg")
    .attr("width", lineWidth + lineMargin.left + lineMargin.right)
    .attr("height", lineHeight + lineMargin.top + lineMargin.bottom);
    
    function reveal(path) {
        return path.transition()
            .duration(3000)
            .ease(d3.easeLinear)
            .attrTween("stroke-dasharray", function () {
                const length = this.getTotalLength();
                return d3.interpolate(`0,${length}`, `${length},${length}`);
            });
    }
    const arriSelect = d3.select("#attriSelect");
    arriSelect.selectAll("option")
        .data(attributes)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    function updateLineChar() {
        svg4.selectAll("*").remove();
        const attribute = d3.select("#attriSelect").property("value");
        const g4 = svg4.append("g")
        .attr("transform", `translate(${lineMargin.left}, ${lineMargin.top})`);
        g4.append("text")
            .attr("x", lineWidth / 2)
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .text("selected attibute:" + attribute);
        const sortedData = selectedData
            .sort((a, b) => d3.ascending(a[attribute], b[attribute]));
        const x = d3.scalePoint()
            .domain(sortedData.map(d => d.Name))
            .range([0, selectedData.length * 20 + 20]);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(sortedData, d => d[attribute])])
            .nice()
            .range([height, 0]);
        
         // x axis
        g4.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end");

        // y axis
        g4.append("g").call(d3.axisLeft(y));

        const line = d3.line()
        .x(d => x(d.Name))
        .y(d => y(d[attribute]))
        .curve(d3.curveMonotoneX);

        const path = g4.append("path")
        .datum(sortedData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);


        reveal(path);
    }

    function updateLineChartXAxis(type) {
        svg4.selectAll(".x-axis text").style("fill", "black");
        svg4.selectAll(".x-axis text")
        .filter(function() {
            const name = d3.select(this).text();
            const d = processedData
            .filter(item => item.Name === name);
            return d[0].Type_1 === type || d[0].Type_2 == name;
        })
        .style("fill", "red");
    };

    updateLineChar();
    arriSelect.on("change", updateLineChar);
}).catch(console.error);
