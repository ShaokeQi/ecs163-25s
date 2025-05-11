const width = window.innerWidth;
const height = window.innerHeight;

let scatterMargin = { top: 10, right: 30, bottom: 60, left: 60 },
    scatterWidth = 500 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

let barMargin = { top: 10, right: 30, bottom: 60, left: 60 },
    barWidth = 500 - barMargin.left - barMargin.right,
    barHeight = 400 - barMargin.top - barMargin.bottom;

let radarMargin = { top: 10, right: 30, bottom: 60, left: 60 },
    radarWidth = width - 100,
    radarHeight = 400;

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
    // Scatter Plot
    const svg1 = d3.select("#scatter").append("svg")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom);

    const g1 = svg1.append("g")
        .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);
    
    // X label
    g1.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 40)
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .text("Height (m)");
    
    // Y label
    g1.append("text")
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

    g1.append("g")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(d3.axisBottom(x1).ticks(7))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    g1.append("g")
        .call(d3.axisLeft(y1).ticks(10));

    g1.selectAll("circle")
        .data(processedData)
        .enter().append("circle")
        .attr("cx", d => x1(d.Height))
        .attr("cy", d => y1(d.Weight))
        .attr("r", 2)
        .attr("fill", "#69b3a2");

    // Bar Chart for type count
    const svg2 = d3.select("#bar").append("svg")
        .attr("width", barWidth + barMargin.left + barMargin.right)
        .attr("height", barHeight + barMargin.top + barMargin.bottom);

    const g2 = svg2.append("g")
        .attr("transform", `translate(${barMargin.left}, ${barMargin.top})`);

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

    g2.append("g")
        .attr("transform", `translate(0, ${barHeight})`)
        .call(d3.axisBottom(x2))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    g2.append("g")
        .call(d3.axisLeft(y2));

    g2.selectAll("rect")
        .data(typeData)
        .enter().append("rect")
        .attr("x", d => x2(d.type))
        .attr("y", d => y2(d.count))
        .attr("width", x2.bandwidth())
        .attr("height", d => barHeight - y2(d.count))
        .attr("fill", "steelblue");

    // X label
    g2.append("text")
        .attr("x", barWidth / 2)
        .attr("y", barHeight + 50)
        .attr("text-anchor", "middle")
        .text("Type");

    // Y label
    g2.append("text")
        .attr("x", -barHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Count");

    // Placeholder for third chart (can be reused later)
    const svg3 = d3.select("#radar").append("svg")
        .attr("width", radarWidth + radarMargin.left + radarMargin.right)
        .attr("height", radarHeight + radarMargin.top + radarMargin.bottom);
    const g3 = svg3.append("g")
        .attr("transform", `translate(${radarMargin.left}, ${radarMargin.top})`);
    g3.append("text")
        .attr("x", radarWidth / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .text("Attribute for selected pokeman");

    const select = d3.select("#pokemonSelect");
    select.selectAll("option")
        .data(processedData)
        .enter()
        .append("option")
        .attr("value", d => d.Name)
        .text(d => d.Name);
    const radarGroup = svg3.append("g")
        .attr("transform", "translate(200,200)");

    const attributes = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];
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
    
    const radarPath = radarGroup.append("path")
        .attr("fill", "rgba(0, 128, 255, 0.3)")
        .attr("stroke", "steelblue");

    function updateRadar(pokemonName) {
        const poke = processedData.find(d => d.Name === pokemonName);
        if (!poke) return;

        const data = attributes.map(attr => ({ axis: attr, value: poke[attr] }));
        radarPath
            .datum(data)
            .attr("d", radarLine);
    }

    
    updateRadar(processedData[0].Name);
    select.on("change", function () {
        updateRadar(this.value);
    });
}).catch(console.error);
