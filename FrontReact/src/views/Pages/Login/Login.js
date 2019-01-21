import React, { Component } from 'react';
import { Button, Card, Row, CardHeader, CardBody, CardGroup, Col, Container, Input, Modal, ModalBody, ModalFooter, ModalHeader, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import  { Link } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login-component';
import Axios from 'axios';
import fondo from '../../../assets/img/imgI3.jpg'; 
import store from '../../../store';

import jwt from 'jsonwebtoken';
import {connect} from 'react-redux'


var sectionStyle = {
    width: "100%",
    height: "100%",
    position: "fixed",
    backgroundRepeat: "no-repeat",
    opacity: "0.8",
    backgroundImage: "url(" + fondo + ")"
  };

class Login extends Component {

   constructor (props, context) {
    super(props, context);
      this.state ={
        token:"",
        mail:"",//
        nombreUsuario:"", 
        infoUsuario:"",
        correo:"",
        espera:false,
        info: false,
        warning: false,
        danger: false,
        tipoUsuario: 1,
        obtenerUsuario:'',
        input:"",
      };
    this.responseGoogle = this.responseGoogle.bind(this);
    this.getMail= this.getMail.bind(this);
    this.toggleInfo = this.toggleInfo.bind(this);
    this.toggleWarning = this.toggleWarning.bind(this);
    this.toggleDanger = this.toggleDanger.bind(this);
    this.filtrarMail = this.filtrarMail.bind(this);
    this.agregarUsuario = this.agregarUsuario.bind(this);
    this.guardarDatos = this.guardarDatos.bind(this);
    this.obtener = this.obtener.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.comprobarUsuario= this.comprobarUsuario.bind(this);
    this.notUser=this.notUser.bind(this);
  }
  componentWillMount(){
    this.comprobarUsuario(this.props.infoUsuarios);
    this.setState({
        espera:true,
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  comprobarUsuario(tipoUsuario){
      var result = this.obtener();
      if((result ==='') || (result === null )|| (result === undefined )){
        this.notUser(this.props.infoUsuarios);
      }
      else{
        this.agregarUsuario(result);
        window.location.replace('/#/dashboard')
      }
  };
  notUser(tipoUsuario){
    if((tipoUsuario==='') || (tipoUsuario=== null )){
      if((window.location.href == 'http://localhost:3000/Login')||(window.location.href == 'http://localhost:3000/Login/')||(window.location.href == 'http://localhost:3000/#/Login')||(window.location.href =='http://localhost:3000/Login#/')||(window.location.href =='http://localhost:3000/#/')){

      }
      else{
        window.location.replace('/#/Login');
      }
    }
  };

  toggleInfo() {
    this.setState({
      info: !this.state.info,
    });
  }
  toggleWarning() {
    this.setState({
      warning: !this.state.warning,
    });
  }
  toggleDanger() {
    this.setState({
      danger: !this.state.danger,
    });
  }
  guardarDatos(){
    var token=jwt.sign(this.state.nombreUsuario,'secret');
    document.cookie=token;
    sessionStorage.setItem("Alumno", token);
  };

  obtener(){
    this.setState({
      obtenerUsuario: jwt.decode(sessionStorage.getItem("Alumno")),
    });
  };


  getMail(){  
    Axios.get('https://www.googleapis.com/gmail/v1/users/'+this.state.token+'/profile')
        .then(Response =>{
          //console.log("lala");
           // console.log(Response);
        }
        ).catch(function(error){
           // console.log(error);
        });
  };

  

  responseGoogle (googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    var googleId = googleUser.getId();


    this.setState({
        token:id_token
    });
    var mailUsuario = googleUser.w3.U3;
    var nombreUsuarios = googleUser.w3.ig;
    this.setState({
      mail:mailUsuario,
      nombreUsuario:nombreUsuarios
    });
    this.filtrarMail();
  }     

  filtrarMail(){

    var mailUsuario = this.state.mail;
    var temp;
    for (var i = 0; i< this.state.mail.length; i++){
      if (mailUsuario[i] == "@") {
        temp = mailUsuario.slice(i,mailUsuario.length);
        if (temp=="@usach.cl") {
          this.toggleInfo();
        }else{
          this.setState({
            mail:'',
            token:'',
            user:'',
          });
          this.toggleWarning();
          
        }

      }
    }
  }
  render() {
    return (
      <section style={ sectionStyle }>     
        <div className="app flex-row align-items-center">
          <Container>
            <Row className="justify-content-center">
              <Col md="10">
              <span className="display-3 text-white " style={{textAlign: "center" }} > Bienvenido a la plataforma</span>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md="3">
                <div style={{textAlign:"center"}}>
                      <GoogleLogin socialId="171991856415-96dr3egj16vhs32dg4hr2fhbns24bhh3.apps.googleusercontent.com"
                                   className="google-login btn-lg btn-success btn-block btn-pill  "
                                   scope="profile"
                                   fetchBasicProfile={true}
                                   style={{size:"lg"}}  
                                   responseHandler={this.responseGoogle}
                                   buttonText="Ingresar"
                      />
                </div>
              </Col>
            </Row>
          </Container>


          <Modal isOpen={this.state.info} toggle={this.toggleInfo}
                   className={'modal-info ' + this.props.className}>

            <ModalHeader toggle={this.toggleInfo}>Inicio de sesión</ModalHeader>
            <ModalBody>
            {this.state.espera?
              <div className="row">
                <div className ='col'>
                  <div className='defaultSpinner' ></div>
                </div>
              </div>
              :
              <span>Bienvenid@ <strong> {this.state.nombreUsuario}</strong>, su inicio de sesión fue exitoso.</span>
            }
              </ModalBody>
            <ModalFooter>
              <Link to={{
                pathname: '/dashboard',
                //state: {  this.props. }
              }}>
                <Button color="primary"  onClick={this.toggleInfo}  onClick={() => this.agregarUsuario(this.state.nombreUsuario)} 
                >Continuar</Button>
              </Link>
            </ModalFooter>
          </Modal>




          <Modal isOpen={this.state.warning} toggle={this.toggleWarning}
                className={'modal-warning ' + this.props.className}>
            <ModalHeader toggle={this.toggleWarning}>Inicio de sesión</ModalHeader>
            <ModalBody>
              Error en el inicio de sesión, utilice correo institucional.
            </ModalBody>
            <ModalFooter>
              <Link to={{
                pathname: '/Login',
                //state: {this.props. }
              }}>
                <Button color="warning" onClick={this.toggleWarning}>Reintentar</Button>
              </Link>
            </ModalFooter>
          </Modal>
        </div>
      </section>
    );
  }


  agregarUsuario(nombreUsuario){
    //console.log(infoUsuario);
      store.dispatch({
      type:"LOG_IN",
      infoUsuario: nombreUsuario,
  });
  }
}

const mapStateToProps = state =>{
  return{
    infoUsuarios: state.nombreUsuario,
  };
};
export default connect(mapStateToProps)(Login);