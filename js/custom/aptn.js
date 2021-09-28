let A = function (){
    const _this = this;
    this.maps = {
        map : null,
        mapId : 'aptn_map',
        mapOptions : {
            center : new naver.maps.LatLng(37.49740397050823, 127.06528437464816),
            zoom : 17,
            minZoom: 7,
            maxZoom: 20,
        }
    }
    this.charts = {};
    Chart.pluginService.register({
        beforeDraw: function(chart) {
            if (chart.config.options.elements.center) {
                // Get ctx from string
                var ctx = chart.chart.ctx;

                // Get options from the center object in options
                var centerConfig = chart.config.options.elements.center;
                var fontStyle = centerConfig.fontStyle || 'Arial';
                var txt = centerConfig.text;
                var color = centerConfig.color || '#000';
                var maxFontSize = centerConfig.maxFontSize || 75;
                var sidePadding = centerConfig.sidePadding || 20;
                var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
                // Start with a base font of 30px
                ctx.font = "30px " + fontStyle;

                // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
                var stringWidth = ctx.measureText(txt).width;
                var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

                // Find out how much the font can grow in width.
                var widthRatio = elementWidth / stringWidth;
                var newFontSize = Math.floor(30 * widthRatio);
                var elementHeight = (chart.innerRadius * 2);

                // Pick a new font size so it will not be larger than the height of label.
                var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
                var minFontSize = centerConfig.minFontSize;
                var lineHeight = centerConfig.lineHeight || 25;
                var wrapText = false;

                if (minFontSize === undefined) {
                    minFontSize = 20;
                }

                if (minFontSize && fontSizeToUse < minFontSize) {
                    fontSizeToUse = minFontSize;
                    wrapText = true;
                }

                // Set font settings to draw it correctly.
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
                var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
                ctx.font = 20 + "px ";
                ctx.fillStyle = color;

                if (!wrapText) {
                    ctx.fillText(txt, centerX, centerY + 30);
                    return;
                }

                var words = txt.split(' ');
                var line = '';
                var lines = [];

                // Break words up into multiple lines if necessary
                for (var n = 0; n < words.length; n++) {
                    var testLine = line + words[n] + ' ';
                    var metrics = ctx.measureText(testLine);
                    var testWidth = metrics.width;
                    if (testWidth > elementWidth && n > 0) {
                        lines.push(line);
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }

                // Move the center up depending on line height and number of lines
                centerY -= (lines.length / 2) * lineHeight;

                for (var n = 0; n < lines.length; n++) {
                    ctx.fillText(lines[n], centerX, centerY);
                    centerY += lineHeight;
                }
                //Draw text in center
                ctx.fillText(line, centerX, centerY);
            }
        }
    });
    const originalLineDraw = Chart.controllers.line.prototype.draw;
    Chart.helpers.extend(Chart.controllers.line.prototype, {
        draw : function(){
            originalLineDraw.apply(this, arguments);

            if (this.chart.tooltip._active && this.chart.tooltip._active.length){
                const activePoint = this.chart.tooltip._active[0];
                const ctx = this.chart.ctx;
                const x = activePoint.tooltipPosition().x;
                const topY = this.chart.scales["y1"].top;
                const bottomY = this.chart.scales["y1"].bottom;
                const leftY = this.chart.scales["y1"].left;
                const rightY = this.chart.scales["y1"].right;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#adacac';
                ctx.stroke();
                ctx.restore();
            }
        }
    })

    this.createMap();
    this.createChart();
}

A.prototype.createMap = function (){
    this.maps.map = new naver.maps.Map(this.maps.mapId, this.maps.mapOptions);

    const marker = new naver.maps.Marker({
        map: this.maps.map,
        position: this.maps.mapOptions.center
    });
    naver.maps.Event.addListener(marker, 'click', function(){
        $('.base-wrap').addClass('open');
    })
}

A.prototype.createChart = function (){
    let data = {
        scatter_datasets : {
            label: '실거주/투자가치',
            data: [{x:1.00, y:0.85}]
        },
        styles : {
            backgroundColor: '#4560d8',
            borderColor : '#4560d8'
        }
    }

    /* 실거주/투자가치 평가 */
    this.charts.chart1 = new Chart(document.getElementById('aptn_chart_1').getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: data.scatter_datasets.label,
                borderColor: data.styles.borderColor,
                data: data.scatter_datasets.data
            }]
        },
        options: {
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(tooltipItem, data){
                        return '투자(' + tooltipItem.label + '), ' + '실거주(' + tooltipItem.value + ')';
                    }
                }
            },
            legend: {display: false},
            elements: {
                point:{
                    radius: 8,
                    pointStyle: 'cicle',
                    backgroundColor: data.styles.backgroundColor,
                    borderColor: data.styles.borderColor,
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '투자 가치',
                    },
                    ticks: {
                        id: "x1",
                        beginAtZero: false,
                        max: 1,
                        min: -1,
                        stepSize: 0.5
                    },
                    gridLines: {
                        zeroLineColor: '#000'
                    }
                }],
                yAxes: [{
                    id: "y1",
                    scaleLabel: {
                        display: true,
                        labelString: '실거주 가치',
                    },
                    ticks: {
                        beginAtZero: false,
                        max: 1,
                        min: -1,
                        stepSize: 0.5
                    },
                    gridLines: {
                        zeroLineColor: '#000'
                    }
                }]
            },
        }
    })

    data = {
        data : {
            labels:["A","B","C","D","E","F","G","H"],
            datasets:[{
                label : "평가점수",
                data : [100,99,100,100,100,40,10,70],
                backgroundColor : "rgba(69, 96, 216, 0.1)",
                borderColor : "#4560d8",
                pointBackgroundColor : "#4560d8",
                borderWidth : 2
            }]
        },
        aptn_idx:96
    }

    this.charts.chart2 = new Chart(document.getElementById('aptn_chart_2').getContext('2d'), {
        type : 'radar',
        data : data.data,
        options: {
            responsive: true,
            legend: {display: false},
            maintainAspectRatio: false,
            scale: {
                ticks: {
                    beginAtZero: false,
                    min : 0,
                    max : 100,
                    stepSize : 20
                }
            }
        }
    })

    google.charts.load('current', {packages:['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    $(window).resize(function(){
        drawChart();
    });

    function drawChart() {
        let title = '';
        let chartData = {
            arr : [
                [2006,7.61,9.49,12.90,14.00,10.12],[2007,3.50,13.85,10.10,13.85,10.67],[2008,7.05,9.97,8.00,12.65,9.79],
                [2009,2.40,7.50,9.65,12.50,9.93],[2010,2.35,10.05,9.43,12.50,9.96],[2011,8.20,9.45,9.90,11.70,9.75],
                [2012,7.00,9.40,7.10,9.55,8.28],[2013,5.00,7.15,7.90,9.50,8.08],[2014,7.20,8.90,10.00,10.15,8.82],
                [2015,8.50,8.70,11.10,11.50,9.81],[2016,8.80,10.70,10.75,14.20,11.12],[2017,10.34,10.97,17.20,17.20,13.13],
                [2018,14.50,14.50,17.20,20.50,16.81],[2019,14.00,15.68,20.00,23.50,18.51],[2020,17.45,22.00,22.20,23.00,19.88]
            ]
        }
        const data = google.visualization.arrayToDataTable(chartData.arr.reverse(), true);
        const options = {
            title: title,
            titlePosition: 'in',
            legend:'none',
            chartArea:{left:30, top:15, bottom:30, right:30, height: '100%'},
            height : '265',
            candlestick: {
                risingColor: {strokeWidth: 0.5, stroke: '#2b4eb5', fill: '#4560d8' },
                fallingColor: {strokeWidth: 0.5, stroke: '#ba07b0', fill: '#cb19b0' },
            },
            crosshair: {
                trigger: 'both',
                color : '#adacac'
            },
            colors: ['#000','#f8750b'],
            isStacked: true,
            seriesType: 'candlesticks',
            series: {
                1: {
                    type: 'area',
                    areaOpacity: 0.2,
                    lineWidth: 1,
                },
            },
        };
        const chart = new google.visualization.ComboChart(document.getElementById('aptn_chart_3'));
        chart.draw(data, options);
    }

    data = {
        data : {
            labels : ["201601","201602","201603","201604","201605","201606","201607","201608","201609","201610","201611","201612","201701","201702","201703","201704","201705","201706","201707","201708","201709","201710","201711","201712","201801","201802","201803","201804","201805","201806","201807","201808","201809","201810","201811","201812","201901","201902","201903","201904","201905","201906","201907","201908","201909","201910","201911","201912","202001","202002","202003","202004","202005","202006","202007","202008","202009"],
            datasets : [{
                label : "아파트엔지수",
                data : [95,95,95,95,95,95,95,95,95,95,null,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,94,94,94,94,94,94,94,94,94,94,96,96,96,95,95,95,95,96,null],
                yAxisID:"y1",
                type:"line",
                backgroundColor:"#4560d8",
                borderColor : "#4560d8",
                fill : false,
                spanGaps : true,
                borderWidth : 2,
                pointRadius : 2,
                lineTension : 0.5
            },{
                label : "평균거래가격(억원)",
                data : [10.25,9.90,10.16,10.42,10.94,11.26,11.35,11.96,12.45,12.90,null,10.85,11.81,12.04,12.14,12.29,12.52,12.92,13.46,12.34,13.36,14.46,14.97,15.00,16.30,16.28,16.02,17.20,15.79,15.71,16.49,17.79,18.79,18.40,17.23,17.15,15.13,15.72,16.31,16.93,18.17,18.38,18.69,18.40,18.40,19.23,20.61,21.45,22.00,20.65,19.42,19.01,19.19,19.87,21.33,22.20,null],
                yAxisID : "y2",
                type : "line",
                backgroundColor : "rgba(248, 117, 11, 0.2)","borderColor":"#f8750b","fill":true,"spanGaps":true,"borderWidth":1, "pointRadius": 0, "lineTension":0.1
            }]
        }
    }

    this.charts.chart4 = new Chart(document.getElementById('aptn_chart_4').getContext('2d'), {
        type : 'line',
        data : data.data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {mode: 'index', intersect: false},
            hover: {mode: 'index', intersect: false},
            elements: {point:{radius: 2,pointStyle: 'rect'}},
            legend: {
                position: 'bottom',
                //align: 'start',
                labels: {
                    boxWidth: 12,
                    fontsize: 11,
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 10
                }
            },
            scales: {
                yAxes: [{
                    type: "linear",
                    display: true,
                    position: "left",
                    id: "y1",
                    ticks: {
                        beginAtZero: false,
                        min : 0,
                        max : 100,
                        stepSize : 10
                    },
                    gridLines:{display:true}
                }, {
                    type: "linear",
                    display: true,
                    position: "right",
                    id: "y2",
                    gridLines:{display:false}
                }],
                xAxes: [{
                    ticks: {
                        display: false
                    }
                }]
            }
        }
    })

    data = {
        data : {
            labels : ["2011","2012","2013","2014","2015","2016","2017","2018","2019","2020"],
            datasets : [{
                label : "소비자물가상승률",
                data : [4,2.2,1.3,1.3,0.7,1,1.9,1.5,0.4,0.6],
                yAxisID : "y1",
                type : "line",
                backgroundColor : "rgba(248, 117, 11, 0.2)",borderColor:"#f8750b",fill:true,spanGaps:true,borderWidth:1,pointRadius:0,lineTension:0.1
            },{
                label : "실거래가상승률",
                data : [-2.11,-15.11,-2.39,9.10,11.23,13.37,18.13,28.02,10.08,7.39],
                yAxisID : "y1",
                type:"line",
                backgroundColor:"rgba(69, 96, 216, 0.2)",borderColor:"#4560d8",fill:false,spanGaps:true,borderWidth:2,pointRadius:2,lineTension:0.5}]}
    }
    this.charts.chart5 = new Chart(document.getElementById('aptn_chart_5').getContext('2d'), {
        type : 'line',
        data : data.data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {mode: 'index', intersect: false},
            hover: {mode: 'index', intersect: false},
            elements: {point:{radius: 2,pointStyle: 'rect'}},
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    fontsize: 11,
                }

            },
            layout: {
                padding: {
                    left: 0,
                    right: 10,
                    top: 0,
                    bottom: 10
                }
            },
            scales: {
                yAxes: [{
                    type: "linear",
                    position: "left",
                    id: "y1",
                    gridLines:{display:true}
                }],
                xAxes: [{
                    ticks: {
                        display: false
                    }
                }]
            }
        }
    })

    data = {
        data : {
            labels : ["201701","201702","201703","201704","201705","201706","201707","201708","201709","201710","201711","201712","201801","201802","201803","201804","201805","201806","201807","201808","201809","201810","201811","201812","201901","201902","201903","201904","201905","201906","201907","201908","201909","201910","201911","201912","202001","202002","202003","202004","202005","202006","202007","202008"],
            datasets : [{
                idx : 3,
                label : "(아파트)거래가격지수",
                data : [99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,100,99,99,99,99,100,100,100,100,100,100,99,99,99,99,99,99,99,99,99,99,100,100,100,99,99,99,99,100],
                yAxisID : "y1",
                type : "line",backgroundColor:"#4560d8",borderColor:"#4560d8",fill:false,spanGaps:true,borderWidth:2,pointRadius:0,borderWidth:4
            },{
                idx : 2,
                label : "(강남구)거래가격지수",
                data : [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],
                yAxisID:"y2",
                type:"bar",backgroundColor:"#ffd3fa",borderColor:"#ffd3fa",fill:false,spanGaps:true,borderWidth:2
            },{
                idx : 1,
                label : "(대치동)거래가격지수",
                data : [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,99,100],
                yAxisID : "y2",
                type:"bar",backgroundColor:"#b6e9f2",borderColor:"#b6e9f2",fill:false,spanGaps:true,borderWidth:2}]}
    }
    this.charts.chart6 = new Chart(document.getElementById('aptn_chart_6').getContext('2d'), {
        type : 'bar',
        data : data.data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {mode: 'index', intersect: false},
            hover: {mode: 'index', intersect: false},
            elements: {point:{radius: 2,pointStyle: 'rect'}},
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    fontsize: 11,
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 10
                }
            },
            scales: {
                yAxes: [{
                    type: "linear",
                    position: "left",
                    id: "y2",
                    display: true,
                    gridLines:{display:false},
                    ticks: {
                        beginAtZero: false,
                        min : 0,
                        max : 120,
                        stepSize : 10
                    }
                }, {
                    type: "linear",
                    position: "right",
                    display: true,
                    id: "y1",
                    ticks: {
                        beginAtZero: false,
                        min : 0,
                        max : 120,
                        stepSize : 10
                    }
                }],
                xAxes: [{
                    ticks: {
                        display: false
                    }
                }]
            }
        }
    })

    data = {
        data : {
            labels : ["201701","201702","201703","201704","201705","201706","201707","201708","201709","201710","201711","201712","201801","201802","201803","201804","201805","201806","201807","201808","201809","201810","201811","201812","201901","201902","201903","201904","201905","201906","201907","201908","201909","201910","201911","201912","202001","202002","202003","202004","202005","202006","202007","202008",null],
            datasets : [{
                label : "회전률(%)",
                data : [0.43,0.54,0.52,0.72,0.86,0.84,0.97,0.14,0.70,0.47,0.50,0.59,0.63,0.18,0.25,0.02,0.20,0.27,0.66,0.52,0.27,0.16,0.05,0.07,0.09,0.14,0.41,0.29,0.34,0.61,0.41,0.18,0.57,0.66,0.66,0.14,0.02,0.29,0.05,0.18,0.50,0.63,0.14,0.02,null],
                yAxisID : "y2",
                type : "line",backgroundColor:"#ffd3fa",borderColor:"#ffd3fa",fill:false,spanGaps:true,borderWidth:2
            },{
                label : "호가상승률(%)",
                data : [null,1.96,0.88,1.19,1.85,3.20,4.20,-8.31,8.22,8.30,3.49,0.18,8.72,-0.14,-1.60,7.37,-8.20,-0.51,4.97,7.86,5.64,-2.08,-6.37,-0.44,-11.81,3.91,3.75,3.80,7.36,1.14,1.69,-1.55,0.02,4.47,7.22,4.06,2.56,-6.12,-6.00,-2.09,0.95,3.51,7.39,4.06,null],
                yAxisID : "y2",
                type : "line",backgroundColor:"#4560d8",borderColor:"#4560d8",fill:false,spanGaps:true,borderWidth:2
            },{
                label : "거래건수(건)",
                data : [19,24,23,32,38,37,43,6,31,21,22,26,28,8,11,1,9,12,29,23,12,7,2,3,4,6,18,13,15,27,18,8,25,29,29,6,1,13,2,8,22,28,6,1,null],
                yAxisID:"y1",
                type:"bar",backgroundColor:"#b6e9f2",borderColor:"#b6e9f2",fill:false,spanGaps:true,borderWidth:2}]
        }
    }
    this.charts.chart7 = new Chart(document.getElementById('aptn_chart_7').getContext('2d'), {
        type : 'bar',
        data : data.data,
        options: {
            //legend:{display:false},
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {mode: 'index', intersect: false},
            hover: {mode: 'index', intersect: false},
            elements: {point:{radius: 2,pointStyle: 'rect'}},
            legend: {
                position: 'bottom',
                //align: 'start',
                //display: false,
                labels: {
                    boxWidth: 12,
                    fontsize: 11,
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 10
                }
            },
            scales: {
                yAxes: [{
                    type: "linear",
                    position: "left",
                    id: "y2",
                    display: true,
                    gridLines:{display:false}
                    /*ticks: {
                        beginAtZero: false,
                        min : 0,
                        max : 100,
                        stepSize : 10
                    }*/
                }, {
                    type: "linear",
                    position: "right",
                    display: true,
                    id: "y1",
                }],
                xAxes: [{
                    //stacked: true,
                    ticks: {
                        display: false //this will remove only the label
                    }
                }]
            }
        }
    })

    data = {
        data : {
            labels : ["201701","201702","201703","201704","201705","201706","201707","201708","201709","201710","201711","201712","201801","201802","201803","201804","201805","201806","201807","201808","201809","201810","201811","201812","201901","201902","201903","201904","201905","201906","201907","201908","201909","201910","201911","201912","202001","202002","202003","202004","202005","202006","202007","202008"],
            datasets : [{
                label : "실거래가격",
                data : [11.81,12.04,12.14,12.29,12.52,12.92,13.46,12.34,13.36,14.46,14.97,15.00,16.30,16.28,16.02,17.20,15.79,15.71,16.49,17.79,18.79,18.40,17.23,17.15,15.13,15.72,16.31,16.93,18.17,18.38,18.69,18.40,18.40,19.23,20.61,21.45,22.00,20.65,19.42,19.01,19.19,19.87,21.33,22.20],
                yAxisID:"y1",
                type:"bar",backgroundColor:"#ffd3fa",borderColor:"#ffd3fa",fill:false,spanGaps:true,borderWidth:2
            },{
                label:"공시가격",
                data:[8.31,8.31,8.31,8.31,8.31,8.31,8.31,8.31,8.31,8.31,8.31,8.31,9.54,9.54,9.54,9.54,9.54,9.54,9.54,9.54,9.54,9.54,9.54,9.54,10.48,10.48,10.48,10.48,10.48,10.48,10.48,10.48,10.48,10.48,10.48,10.48,14.53,14.53,14.53,14.53,14.53,14.53,14.53,14.53],
                yAxisID:"y1",
                type:"bar",backgroundColor:"#b6e9f2",borderColor:"#b6e9f2",fill:false,spanGaps:true,borderWidth:5
            },{
                label:"실거래가대비공시지가비율",
                data:[42,44,46,47,50,55,62,48,60,74,80,80,70,70,67,80,65,64,72,86,96,92,80,79,44,49,55,61,73,75,78,75,75,83,96,104,51,42,33,30,32,36,46,52],
                yAxisID:"y2",
                type:"line",backgroundColor:"#4560d8",borderColor:"#4560d8",fill:false,spanGaps:true,borderWidth:2}]
        }
    }

    this.charts.chart8 = new Chart(document.getElementById('aptn_chart_8').getContext('2d'), {
        type : 'bar',
        data : data.data,
        options: {
            //legend:{display:false},
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {mode: 'index', intersect: false},
            hover: {mode: 'index', intersect: false},
            elements: {point:{radius: 2,pointStyle: 'rect'}},
            legend: {
                position: 'bottom',
                //align: 'start',
                labels: {
                    boxWidth: 12,
                    fontsize: 11,
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 10,
                    top: 0,
                    bottom: 10
                }
            },
            scales: {
                yAxes: [{
                    type: "linear",
                    position: "left",
                    id: "y1",
                    display: true,
                    gridLines:{display:false},
                    ticks: {
                        beginAtZero: false,
                        min : 0,
                        max : 70,
                        stepSize : 10
                    }
                }
                    , {
                        type: "linear",
                        position: "right",
                        display: true,
                        id: "y2",
                    }],
                xAxes: [{
                    ticks: {
                        display: false //this will remove only the label
                    }
                }]
            }
        }
    })

    data = {"datasets":[
            {"label":"실거래 내역",
                "data":[{"x":"2019-09-30","y":31.00},{"x":"2019-12-13","y":33.00},{"x":"2019-10-26","y":31.80},{"x":"2019-10-04","y":31.00},{"x":"2019-10-02","y":32.00},{"x":"2020-08-20","y":32.70},{"x":"2020-06-22","y":32.50},{"x":"2020-06-21","y":33.50},{"x":"2020-06-20","y":32.70},{"x":"2020-06-16","y":31.00},{"x":"2020-06-13","y":35.00},{"x":"2020-06-09","y":30.50},{"x":"2020-01-04","y":34.00},{"x":"2019-10-11","y":37.00},{"x":"2020-06-22","y":41.70},{"x":"2019-12-30","y":41.20}]
            }]}

    this.charts.chart9 = new Chart(document.getElementById('aptn_chart_9').getContext('2d'), {
        type : 'scatter',
        data : data,
        options: {
            legend: {display: false},
            elements: {
                point:{
                    radius: 3,
                    pointStyle: 'rect',
                    backgroundColor: '#4560d8',
                    borderColor: '#4560d8'
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            /*aspectRatio: 1,*/
            layout: {
                padding: {
                    left: 0,
                    right: 10,
                    top: 0,
                    bottom: 10
                }
            },
            scales: {
                xAxes: [{
                    gridLines:{display:false},
                    scaleLabel: {
                        display: true,
                        labelString: '거래일자',
                    },
                    type: 'time',
                    time: {
                        unit: 'year'
                    },
                    ticks: {
                        display: false //this will remove only the label
                    }
                }],
                yAxes: [{
                    id: "y1",
                    position : 'left',
                    scaleLabel: {
                        display: true,
                        labelString: '거래가격(억원)',
                    },
                }],
            },
        }
    })

    /*this.charts.chart9 = new Chart(document.getElementById('aptn_chart_pie'), {
        type: 'doughnut',
        data: {
            labels: ["Red", "Orange", "Green"],
            datasets: [{
                label: '# of Votes',
                data: [33, 33, 33],
                backgroundColor: [
                    'rgba(231, 76, 60, 0.1)',
                    'rgba(255, 164, 46, 0.1)',
                    '#0ec717'
                ],
                borderColor: [
                    'rgba(255, 255, 255 ,1)',
                    'rgba(255, 255, 255 ,1)',
                    'rgba(255, 255, 255 ,1)'
                ],
                //borderWidth: 5
            }]

        },
        options: {
            elements: {
                center: {
                    text: '투자 권장',
                    color: '#0ec717', // Default is #000000
                    fontStyle: 'Arial', // Default is Arial
                    sidePadding: 20, // Default is 20 (as a percentage)
                    minFontSize: 25, // Default is 20 (in px), set to false and text will not wrap.
                    lineHeight: 25 // Default is 25 (in px), used for when text wraps
                }
            },
            /!*title: {
                display: true,
                text: '투자권장' ,
                position: 'bottom',
                //verticalAlign: 'middle',
                align: 'center',
                lineHeight : 2
                //padding : 50
            },*!/
            responsive: true,
            maintainAspectRatio: false,
            rotation: 1 * Math.PI,
            circumference: 1 * Math.PI,
            legend: {
                display: false
            },
            tooltips: {
                enabled: false,
            },
            cutoutPercentage: 80,
            //circumference : 1 * Math.PI,
        }
    });*/

}

const aptn = new A();
