import React, { Component, lazy, Suspense } from 'react';
import { Bar, Doughnut, Line, Pie, Polar, Radar } from 'react-chartjs-2';
import Chart from 'chart.js';
import Axios from 'axios';
import {
  Badge,
  Button,
  ButtonDropdown,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Progress,
  Row,
  Table,Tooltip
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities'

import DataRecovery from './staticDataRecovery';
import { from } from 'rxjs';
import { object } from 'prop-types';
const urlBase="http://kamino.diinf.usach.cl/redes-0.0.1-SNAPSHOT/signals";

//
const bar = {
  labels: ['Mañana','Tarde','Noche'],
  datasets: [
  ],
};
const barComparative = {
 
  datasets: [
  ],
};
const barComparative2 = {
  
  datasets: [
  ],
};

var PieChart={
    labels: [
      'Excellent',
      'Good',
      'Moderate',
      'Bad',
      'Undefined',
    ],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(0, 255, 255,0.8)',
          'rgba(128, 255, 0,0.8)',
          'rgba(255, 255, 0,0.8)',
          'rgba(255, 64, 0,0.8)',
          'rgba(68,68,68,0.8)',
        ],
        hoverBackgroundColor: [
          'rgba(0, 255, 255,1)',
          'rgba(128, 255, 0,1)',
          'rgba(255, 255, 0,1)',
          'rgba(255, 64, 0,1)',
          'rgba(68,68,68,1)',
        ],
        hoverBorderColor:[
          'rgba(0, 255, 255,1)',
          'rgba(128, 255, 0,1)',
          'rgba(255, 255, 0,1)',
          'rgba(255, 64, 0,1)',
          'rgba(68,68,68,1)',
        ],
        borderColor:[
          'rgba(0, 255, 255,0.5)',
          'rgba(128, 255, 0,0.5)',
          'rgba(255, 255, 0,0.5)',
          'rgba(255, 64, 0,0.5)',
          'rgba(68,68,68,0.5)',
        ]
      }],
    
      
}

const options={
  title:{
    fontFamily:"Times New Roman",
    fontSize:22,
    display:false,
    text:"Prueva de Titulo",
  },
}

// Define a plugin to provide data labels
const plugins={
  afterDatasetsDraw: function(chart) {
    var ctx = chart.ctx;

    chart.data.datasets.forEach(function(dataset, i) {
      var meta = chart.getDatasetMeta(i);
      if (!meta.hidden) {
        meta.data.forEach(function(element, index) {
          // Draw the text in black, with the specified font
          //ctx.fillStyle = 'rgb(0, 0, 0)';

          var fontSize = 10;
          var fontStyle = 'normal';
          var fontFamily = 'Helvetica Neue';
          //ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

          // Just naively convert to string for now
          var dataString = dataset.data[index].toString();

          // Make sure alignment settings are correct
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          var padding = 5;
          var position = element.tooltipPosition();
          ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
        });
      }
    });
  }
};
const pluginsPie={
  afterDatasetsDraw: function(chart) {
    var ctx = chart.ctx;

    chart.data.datasets.forEach(function(dataset, i) {
      
      var meta = chart.getDatasetMeta(i);
      if (!meta.hidden) {
        var sum=0;
        for (let i = 0; i < dataset.data.length; i++) {
          if(!meta.data[i].hidden){
            sum=sum+dataset.data[i];
          }
        }
        meta.data.forEach(function(element, index) {
          

          
          if(dataset.data[index]!=0 && element.hidden==false){
            
            // Draw the text in black, with the specified font
            var fontSize = 10;
            var dataString = Math.round((dataset.data[index]*100)/sum)+"%"
            // Make sure alignment settings are correct
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            var padding = 5;
            var position = element.tooltipPosition();
            ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
          }
            
        });
      }
    });
  }
};



class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      recovery:DataRecovery,
      pieChard:null,
      barChard:null,
      salas:null,
      nombreSalaPie:"Resumen",
      nombreSalaBar:"Resumen",
      dropdownOpenPie: false,
      dropdownOpenBar: false,
      radioSelected: 2,
      cantidadDatosBar:0,
      jsonTablaBase:undefined,
      jsonTablaMostrar:undefined,
      sort:{
        marca:0,
        modelo:0,
        version:0,
        intensidadPromedio:0,
        velocidadPromedio:0,
       
      },
       tooltipOpen:[false,false,false,false,false],
       barComparative:[null,null],
       nombreSalaBarComparative:["Resumen","Resumen"],
       dropdownOpenBarComparative:[false,false]
    };
  }

  componentWillMount(){
    Axios.get(urlBase).then(
      (response)=>{
        this.setState({
          recovery:response.data
        });
        var salas=this.genericFilterPie(response.data);
        var salas2=this.genericFilterBar(response.data);
        var dispositivos=this.genericFilterTabla(response.data);
       dispositivos=this.generateJsonTabla(dispositivos);
      this.setState({
        salas: Object.keys(salas),
        jsonTablaBase:dispositivos,
        jsonTablaMostrar:dispositivos,
      })
      this.moveDataToPie(salas,"Resumen");
      this.moveDataToBar(salas2,"Resumen");
      this.moveDataToBarComparative(salas,"Resumen",0);
      this.moveDataToBarComparative(salas,"Resumen",1);


      console.log(response);
    })
    .catch((error)=>{
      console.log(error);
      var salas=this.genericFilterPie(this.state.recovery);
      var salas2=this.genericFilterBar(this.state.recovery);
      var dispositivos=this.genericFilterTabla(this.state.recovery);
       dispositivos=this.generateJsonTabla(dispositivos);
      this.setState({
        salas: Object.keys(salas),
        jsonTablaBase:dispositivos,
        jsonTablaMostrar:dispositivos,

      })
      this.moveDataToPie(salas,"Resumen");
      this.moveDataToBar(salas2,"Resumen");
      this.moveDataToBarComparative(salas,"Resumen",0);
      this.moveDataToBarComparative(salas,"Resumen",1);
    });
      
  }

  componentDidMount(){
    var salas=this.genericFilterPie(this.state.recovery);
      var salas2=this.genericFilterBar(this.state.recovery);
      var dispositivos=this.genericFilterTabla(this.state.recovery);
       dispositivos=this.generateJsonTabla(dispositivos);
      this.setState({
        salas: Object.keys(salas),
        jsonTablaBase:dispositivos,
        jsonTablaMostrar:dispositivos,

      });
      this.moveDataToPie(salas,"Resumen");
      this.moveDataToBar(salas2,"Resumen");
      this.moveDataToBarComparative(salas,"Resumen",0);
      this.moveDataToBarComparative(salas,"Resumen",1);
  }
  
  sortResults(data,prop) {
    let baseSort={
        marca:0,
        modelo:0,
        version:0,
        intensidadPromedio:0,
        velocidadPromedio:0,
    };
    let sort=this.state.sort;

    data = data.sort(function(a, b) {
        if (sort[prop]==0 || sort[prop]==-1) {
          console.log(a,b,prop);
          console.log(a[prop], ">" ,b[prop])
          return (a[prop] > b[prop]);
        }
        else {
          console.log(a,b);
          console.log(a,b,prop);
          console.log(a[prop], "<" ,b[prop])
          return (b[prop] > a[prop]);
        }
    });
    baseSort[prop]=(sort[prop]==0 || sort[prop]==-1)?1:-1;
    this.setState({
      sort:baseSort
    });
    return data;
}
  handleEventSort=event=>{
    console.log(event);
    console.log(event.target);
    console.log(event.target.name)
    let propiedad=event.target.id;
    console.log(this.state.jsonTablaBase);
    let JsonTabla=this.sortResults(this.state.jsonTablaBase,propiedad);
    console.log(JsonTabla);
    this.setState({
      jsonTablaMostrar:JsonTabla,
    });
  };

  genericFilterTabla(data){
    /*
    {
      modelo:{
        marca:,
        version:,
        velocidad[]
        intensidad[]
      }

    }
    
    */
   let dispositivos={};
    data.map((dato,key)=>{
      const modelo=dato.modelo;
      dispositivos[modelo]=(dispositivos[modelo]==undefined)?{}:dispositivos[modelo];
      dispositivos[modelo].marca=dato.marca;
      dispositivos[modelo].version=dato.version;
      dispositivos[modelo].velocidad=(dispositivos[modelo].velocidad==undefined)?[]:dispositivos[modelo].velocidad;
      dispositivos[modelo].velocidad.push(dato.velocidad);
      dispositivos[modelo].intensidad=(dispositivos[modelo].intensidad==undefined)?[]:dispositivos[modelo].intensidad;
      dispositivos[modelo].intensidad.push(dato.intensidad);
    });
    console.log(dispositivos);
    return dispositivos;
  }

  genericFilterPie(data){
    let salas={

    };
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        salas["Resumen"]=(salas["Resumen"]==undefined)?{}:salas["Resumen"];
        salas["Resumen"][element.estado]=(salas["Resumen"][element.estado]==undefined)?1:salas["Resumen"][element.estado]+1;
        salas[element.lugar]=(salas[element.lugar]==undefined)?{}:salas[element.lugar];
        const existencia=salas[element.lugar][element.estado];
        salas[element.lugar][element.estado]=(existencia==undefined)?1:existencia+1;
        
    }
    return salas;
  }
  genericFilterBar(data){
    /*struct json
    {
     resumen:
     {
       manana:[extelente,good,moderate,malo,null]
      ...
     }
    }
    
    */
    let base={
      Mañana:[0,0,0,0,0],
      Tarde:[0,0,0,0,0],
      Noche:[0,0,0,0,0],
    }
    let salas={

    };
    for (let i = 0; i < data.length; i++) {
        const element = data[i];

        salas["Resumen"]=(salas["Resumen"]==undefined)?{
          Mañana:[0,0,0,0,0],
          Tarde:[0,0,0,0,0],
          Noche:[0,0,0,0,0],
        }: salas["Resumen"];

        salas[element.lugar]=(salas[element.lugar]==undefined)?{
          Mañana:[0,0,0,0,0],
          Tarde:[0,0,0,0,0],
          Noche:[0,0,0,0,0],
        }:salas[element.lugar];
        
        if(element.estado=="EXCELLENT"){
          salas[element.lugar][element.bloque][0]++;
          salas["Resumen"][element.bloque][0]++;
        }
        else if(element.estado=="GOOD"){
          salas[element.lugar][element.bloque][1]++;
          salas["Resumen"][element.bloque][1]++;
        }
        else if(element.estado=="MODERATE"){
          salas[element.lugar][element.bloque][2]++;
          salas["Resumen"][element.bloque][2]++;
        }
        else if(element.estado=="BAD"){
          salas[element.lugar][element.bloque][3]++;
          salas["Resumen"][element.bloque][3]++;
        }
        else if(element.estado==null){
          salas[element.lugar][element.bloque][4]++;
          salas["Resumen"][element.bloque][4]++;
        }
    }
    console.log(salas);
    return salas;
  }
  
  generateJsonTabla(filterTablaData){
    let jsonTabla=[];
    let modelos=Object.keys(filterTablaData);
    for (let i = 0; i < modelos.length; i++) {
      let suma=0;
      filterTablaData[modelos[i]].velocidad.map((velocidad)=>{
        //console.log(parseFloat(velocidad),"velocidad",velocidad)
        suma=parseFloat(velocidad)+suma;
      });
      let velocidadPromedio=suma/filterTablaData[modelos[i]].velocidad.length;
      suma=0;
      filterTablaData[modelos[i]].intensidad.map((intensidad)=>{
        suma=parseFloat(intensidad)+suma;
      });
      let intensidadPromedio=suma/filterTablaData[modelos[i]].intensidad.length;
      
      let dispositivo={};
      dispositivo.marca=filterTablaData[modelos[i]].marca;
      dispositivo.modelo=modelos[i];
      dispositivo.version=filterTablaData[modelos[i]].version;
      dispositivo.velocidadPromedio=velocidadPromedio.toFixed(3);
      dispositivo.intensidadPromedio=intensidadPromedio.toFixed(3);
        jsonTabla.push(dispositivo);
      
    }
    return jsonTabla;
  }

  generateTabla(filterTablaData){
    return(
      <Table bordered striped responsive size="sm">
        <thead>
        <tr>
          <th className="" id="marca" onClick={this.handleEventSort}> Marca   
            &nbsp;
            {(this.state.sort.marca==-1)&& 
                <i class="fa fa-sort-down"></i>
              }
              {(this.state.sort.marca==1)&& 
                <i class="fa fa-sort-up"></i>
              }
          
          </th>
          <th id="modelo" onClick={this.handleEventSort}>Modelo
          &nbsp;
            {(this.state.sort.modelo==-1)&& 
                <i class="fa fa-sort-down"></i>
              }
              {(this.state.sort.modelo==1)&& 
                <i class="fa fa-sort-up"></i>
              }
          </th>
          <th id="version" onClick={this.handleEventSort}> Version
          &nbsp;
            {(this.state.sort.version==-1)&& 
                <i class="fa fa-sort-down"></i>
              }
              {(this.state.sort.version==1)&& 
                <i class="fa fa-sort-up"></i>
              }
          </th>
          <th id="velocidadPromedio" onClick={this.handleEventSort}>Velocidad Promedio
          &nbsp;
            {(this.state.sort.velocidadPromedio==-1)&& 
                <i class="fa fa-sort-down"></i>
              }
              {(this.state.sort.velocidadPromedio==1)&& 
                <i class="fa fa-sort-up"></i>
              }
          </th>
          <th id="intensidadPromedio" onClick={this.handleEventSort}>intensidad Promedio
          &nbsp;
            {(this.state.sort.intensidadPromedio==-1)&& 
                <i class="fa fa-sort-down"></i>
              }
              {(this.state.sort.intensidadPromedio==1)&& 
                <i class="fa fa-sort-up"></i>
              }
          </th>
        </tr>
        </thead>
        <tbody>
        {filterTablaData && filterTablaData.map((dispositivo,key)=>{
            return <tr key={key}>
              <td>{dispositivo.marca}</td>
              <td>{dispositivo.modelo}</td>
              <td>{dispositivo.version}</td>
              <td>{dispositivo.velocidadPromedio}</td>
              <td>{dispositivo.intensidadPromedio}</td>
            </tr>
        })
        }                  
        </tbody>
        <Tooltip placement="top" isOpen={this.state.tooltipOpen[0]} target="marca" toggle={() => {this.toggleTabla(0);}}>
              Ordenar
        </Tooltip>
        <Tooltip placement="top" isOpen={this.state.tooltipOpen[1]} target="modelo" toggle={() => {this.toggleTabla(1);}}>
              Ordenar
        </Tooltip>
        <Tooltip placement="top" isOpen={this.state.tooltipOpen[2]} target="version" toggle={() => {this.toggleTabla(2);}}>
              Ordenar
        </Tooltip>
        <Tooltip placement="top" isOpen={this.state.tooltipOpen[3]} target="velocidadPromedio" toggle={() => {this.toggleTabla(3);}}>
              Ordenar
        </Tooltip>
        <Tooltip placement="top" isOpen={this.state.tooltipOpen[4]} target="intensidadPromedio" toggle={() => {this.toggleTabla(4);}}>
              Ordenar
        </Tooltip>
      </Table>
    );
  }

  moveDataToBar(salas,lugar){
    //var keys=Object.keys(salas);
    var color=["(0, 255, 255)","(128, 255, 0)","(255, 255, 0)","(255, 64, 0)","(132, 132, 132)"]
    var estado=['Excellent',
    'Good',
    'Moderate',
    'Bad',
    'Undefined']
    var data=[]
    
    bar.datasets=[];
    var cantidad=0;
    for (let i = 0; i < 5; i++) {
      let dataTemp=[];
      cantidad=cantidad+salas[lugar]["Mañana"][i]+salas[lugar]["Tarde"][i]+salas[lugar]["Noche"][i];
      dataTemp.push(salas[lugar]["Mañana"][i]);
      dataTemp.push(salas[lugar]["Tarde"][i]);
      dataTemp.push(salas[lugar]["Noche"][i]);
      this.addingDataBar(estado[i],dataTemp,color[i],bar)
      //data.push(dataTemp);
    }
    this.setState({
      barChard:bar,
      cantidadDatosBar:cantidad
    })
  }
  moveDataToBarComparative(salas,lugar,flag){
    //var keys=Object.keys(salas);
    var datos=salas[lugar];
    var color=["(0, 255, 255)","(128, 255, 0)","(255, 255, 0)","(255, 64, 0)","(132, 132, 132)"]
    var estado=['Excellent',
    'Good',
    'Moderate',
    'Bad',
    'Undefined']
    var data=[]
    
    var barsito=(flag==0)?barComparative:barComparative2;
    if(flag==0){
      barComparative.datasets=[]
    }else{
      barComparative2.datasets=[];
    }
    data.push((datos.EXCELLENT==undefined)?0:datos.EXCELLENT);
    data.push((datos.GOOD==undefined)?0:datos.GOOD);
    data.push((datos.MODERATE==undefined)?0:datos.MODERATE);
    data.push((datos.BAD==undefined)?0:datos.BAD);
    data.push((datos.null==undefined)?0:datos.null);
    for (let i = 0; i < data.length; i++) {
      this.addingDataBar(estado[i],[data[i]],color[i],barsito);
    }
    var comparative=this.state.barComparative;
    comparative[flag]=barsito;
    this.setState({
      barComparative:comparative
    })
    
    
  }
  addingDataBar=(nombre,data,rgb,bar)=>{
    
    var hue = 'rgba' + rgb.substr(0,rgb.length-1);
    var element={
      label: nombre,
      backgroundColor: hue+',0.2)',
      borderColor: hue+',1)',
      borderWidth: 1,
      hoverBackgroundColor: hue+',0.4)',
      hoverBorderColor: hue+',1)',
      data: data,
    }
    bar.datasets.push(element);
    //console.log(bar);
    /*this.setState({
      barChard:bar,
    })*/
  }
 

  moveDataToPie(salas,lugar){
    const datos=salas[lugar];
    let data=[];
    data.push((datos.EXCELLENT==undefined)?0:datos.EXCELLENT);
    data.push((datos.GOOD==undefined)?0:datos.GOOD);
    data.push((datos.MODERATE==undefined)?0:datos.MODERATE);
    data.push((datos.BAD==undefined)?0:datos.BAD);
    data.push((datos.null==undefined)?0:datos.null);

    PieChart.datasets[0].data=data;
    this.setState({
      pieChard:PieChart
    });
  }

  handleMoveDataPie=event=>{
    const name=event.target.name;
    const salas=this.genericFilterPie(this.state.recovery);
    this.moveDataToPie(salas,name);
    this.setState({
      nombreSalaPie:name
    });
  }
  handleMoveDataBar=event=>{
    const name=event.target.name;
    const salas=this.genericFilterBar(this.state.recovery);
    this.moveDataToBar(salas,name);
    this.setState({
      nombreSalaBar:name
    });
  } 
  handleMoveDataBarComparative=posicion=>event=>{
    const name=event.target.name;
    const salas=this.genericFilterPie(this.state.recovery);
    this.moveDataToBarComparative(salas,name,posicion);
    var comparative=this.state.nombreSalaBarComparative;
    comparative[posicion]=name;
    this.setState({
      nombreSalaBarComparative:comparative
    });
  }


  togglePie() {
    this.setState({
      dropdownOpenPie: !this.state.dropdownOpenPie,
    });
  }
  toggleBar() {
    this.setState({
      dropdownOpenBar: !this.state.dropdownOpenBar,
    });
  }
  toggleTabla(i) {
    const newArray = this.state.tooltipOpen.map((element, index) => {
      return (index === i ? !element : false);
    });
    this.setState({
      tooltipOpen: newArray,
    });
  }
  toggleBarComparative(i){
    var comparative=this.state.dropdownOpenBarComparative;
    comparative[i]=!this.state.dropdownOpenBarComparative[i];
    this.setState({
      dropdownOpenBarComparative:comparative
    })
  }

  onRadioBtnClick(radioSelected) {
    this.setState({
      radioSelected: radioSelected,
    });
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col>
            
            <Card>
                <CardHeader>
                <strong>Gráfico porcentaje de la calidad de la señal por sala.</strong>                  
                  <div className="card-header-actions">
                    <ButtonDropdown isOpen={this.state.dropdownOpenPie} toggle={() => { this.togglePie(); }}>
                    <DropdownToggle caret>
                      {this.state.nombreSalaPie}
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem header>Salas</DropdownItem>
                      {this.state.salas && this.state.salas.map((sala,key)=>{
                         return <DropdownItem key={key} name={sala} onClick={this.handleMoveDataPie}>{sala}</DropdownItem>;
                      })
                      }
                    </DropdownMenu>
                  </ButtonDropdown>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper" >
                    <Pie data={this.state.pieChard} plugins={pluginsPie} height="80%"/>
                  </div>
                </CardBody>
              </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
                <CardHeader>
                    <strong>Gráfico que representa la cantidad de datos capturados agrupados por bloque y sala.</strong>
                    <div className="card-header-actions">
                    <ButtonDropdown isOpen={this.state.dropdownOpenBar} toggle={() => { this.toggleBar(); }}>
                    <DropdownToggle caret>
                      {this.state.nombreSalaBar}
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem header>Salas</DropdownItem>
                      {this.state.salas && this.state.salas.map((sala,key)=>{
                         return <DropdownItem key={key} name={sala} onClick={this.handleMoveDataBar}>{sala}</DropdownItem>;
                      })
                      }
                    </DropdownMenu>
                  </ButtonDropdown>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper" >
                    <Bar data={this.state.barChard} options={options} plugins={plugins} height="90%"/>
                  </div>
                  <Row>
                    <Col sm={{ size: 6, order: 6, offset: 3 }}>
                      <Card className="card-accent-success text-white bg-info text-center">
                        <CardBody>
                        <strong> Cantidad de datos para {this.state.nombreSalaBar}: <strong>{this.state.cantidadDatosBar} </strong> datos </strong>
                        </CardBody>
                      </Card>
                  </Col>
                    </Row>
                  
                </CardBody>
              </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
                <CardHeader>
                    <strong>Tabla de Dispositivos</strong>
                </CardHeader>
                <CardBody>
                  {this.generateTabla(this.state.jsonTablaMostrar)}
                  
                </CardBody>
              </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
                <CardHeader>
                    <Row>
                    <Col>
                        
                          <ButtonDropdown isOpen={this.state.dropdownOpenBarComparative[0]} toggle={() => { this.toggleBarComparative(0); }}>
                          <DropdownToggle caret>
                            {this.state.nombreSalaBarComparative[0]}
                          </DropdownToggle>
                          <DropdownMenu >
                            <DropdownItem header>Salas</DropdownItem>
                            {this.state.salas && this.state.salas.map((sala,key)=>{
                              return <DropdownItem key={key} name={sala} onClick={this.handleMoveDataBarComparative(0)}>{sala}</DropdownItem>;
                            })
                            }
                          </DropdownMenu>
                        </ButtonDropdown>
                        
                      </Col>
                      <Col className="text-center">
                      <strong>Comparador de Salas</strong> 
                      <br/> 
                      (Estado de Red)
                      </Col>
                      <Col>
                      <div className="card-header-actions">
                        <ButtonDropdown isOpen={this.state.dropdownOpenBarComparative[1]} toggle={() => { this.toggleBarComparative(1); }}>
                        <DropdownToggle caret>
                          {this.state.nombreSalaBarComparative[1]}
                        </DropdownToggle>
                        <DropdownMenu right>
                          <DropdownItem header>Salas</DropdownItem>
                          {this.state.salas && this.state.salas.map((sala,key)=>{
                            return <DropdownItem key={key} name={sala} onClick={this.handleMoveDataBarComparative(1)}>{sala}</DropdownItem>;
                          })
                          }
                        </DropdownMenu>
                      </ButtonDropdown>
                      </div>
                      </Col>
                    </Row>
                    
                    
                    
                  
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col sm={6}>
                      <div className="chart-wrapper" >
                        <Bar data={this.state.barComparative[0]} options={options} plugins={plugins} height={100}/>
                      </div>
                    </Col>
                    <Col sm={6}>
                    <div className="chart-wrapper" >
                        <Bar data={this.state.barComparative[1]} options={options} plugins={plugins} height={100}/>
                      </div>
                    </Col>
                  </Row>
                  
                  
                </CardBody>
              </Card>
          </Col>
        </Row>

      </div>
    );
  }
}

export default Dashboard;
