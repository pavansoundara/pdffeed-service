import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
// import Anime from 'react-anime';
import { Link, DirectLink, Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll';
import Axios from 'axios';

import pdf from './pdf-file.svg';
import gear from './gear.svg';
import srch from './search.svg';


import './App.css';

class app extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputUrl: '',
      files: [],
      links: [],
      dropzoneActive: false,
      loading: false,
      loaded: false,
      hasError: false,
      error: ''
    };
    this.onDrop = this.onDrop.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getLinks = this.getLinks.bind(this);
    this.uploadSingleFile = this.uploadSingleFile.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({ [name]: value });
  }

  onDrop(files) {
    this.setState({
      files,
      dropzoneActive: false,
      loading: true
    },
    this.uploadSingleFile
    );
  }

  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  getLinks() {
    if(this.state.loading===false){
      this.setState({
        loading:true
      })
    }
    const getLinksApi = "http://localhost:3000/api/Checker/getlinks";
    Axios.get(getLinksApi, {
      params: {
        url: this.state.inputUrl
      }
    }).then(response => {
      this.setState({
        links: response.data.links,
        loading: false,
        loaded: true
      });
    }).catch(error => {
      this.setState({
        hasError: true,
        error: error.response.data.error,
        loading: false,
        loaded: false
      })
    });
  }

  uploadSingleFile() {
    const CONTAINER_API ='http://localhost:3000/api/Container/files/upload';
    let bodyFormData = new FormData();
    bodyFormData.set('file', this.state.files[0]);
    Axios({
      method: 'post',
      url: CONTAINER_API,
      params: {
      },
      data: bodyFormData
    }).then(response => {
      console.log(response.data.result);
      let file = response.data.result.files.file[0];
      this.setState({
          inputUrl: 'http://localhost:3000/api/Container/' 
          + file.container + '/download/' + file.name,
      },
      this.getLinks
    );
    }).catch(error => {
      this.setState({
        hasError: true,
        error: error.response.data.error,
        loading: false
      })
    });
  }

  scrollTo() {
    scroller.scrollTo('anchor', {
      duration: 1000,
      delay: 0,
      smooth: 'easeInOutQuart'
    })
  }

  handleKeyPress(event) {
    if(event.key === 'Enter'){
      this.getLinks();
    }
  }

  componentDidMount() {
    this.nameInput.focus();
  }

  render() {
    console.log(this.state);
    let box = ''
    if(this.state.loading){
      box = <div className="card card__loading">
        <i className="material-icons card__spinner">data_usage</i>
        <p>Extracting</p>
      </div>
    } else if(!this.state.loading && !this.state.loaded) {
      box = <div className="card card--uploadbox">
      <Dropzone accept="application/pdf" 
      onDragEnter={this.onDragEnter.bind(this)} 
      onDragLeave={this.onDragLeave.bind(this)} 
      multiple={false} 
      onDrop={this.onDrop} 
      type="file" 
      className='form-control upload-box'>
        <img src={pdf} alt="pdf icon" />
        <h5 >Drag &amp; Drop</h5>
        <p> Choose a file or drag it here</p>
      </Dropzone>
    </div>
    } else if (this.state.loaded){
      this.scrollTo();
      if(this.state.links.length > 0){
        box = <div className="card">
        <div className="table-responsive-sm">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Link</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {this.state.links.map(link =>{
                return(
                <tr>
                  <td>{link}</td>
                  <td>NA</td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      } else {
        box = <div className="card card__loading">
        <i className="material-icons card__spinner">refresh</i>
        <p>No Links Found</p>
      </div>
      }
    }
    return (
      <div className="app">
        <div className="app__header" >
          <div className="row justify-content-md-center">
            <div className="app__logo col-md-12">
              <div className="app__logotext noselect" >
                <span className="app__logotext--red">Pdf</span>Feed
                <sup className="app__logotext--super">Beta</sup>
              </div>
            </div>
            <div className="app__logocap col-md-12">
              <h6>
                Extract links from pdf. Check for broken links in pdf.
              </h6>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-md-8">
              <div className="card card--searchbar">
                <div className="row no-gutters">
                  <div className="col-11 col-sm-11 col-xs-11">
                    <input type="text" 
                    className="card__input" 
                    name="inputUrl" 
                    onChange={this.handleInputChange} 
                    placeholder="http://www.example.com/file.pdf" 
                    onKeyPress={this.handleKeyPress}
                    ref={(input) => { this.nameInput = input; }}/>
                  </div>
                  <div className="col-1 col-sm-1 col-xs-1">
                    <div className="card__options">
                      <a href="#" className="card--buttoncolor" onClick={this.getLinks}>
                      <i className="material-icons card__searchbutton">search</i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row justify-content-md-center">
            <div className="col-12">
              <p className="app__placehold">or</p>
            </div>
            <Element className="col-md-8" name="anchor">
              {box}
            </Element>
          </div>
        </div>
      </div>
    );
  }
}

export default app;
