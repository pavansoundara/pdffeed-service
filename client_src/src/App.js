import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Axios from 'axios';
import logo from './logo1.svg';
import pdf from './pdf-file.svg';

import './App.css';

class app extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputUrl: '',
      files: [],
      dropzoneActive: false
    };
    this.onDrop = this.onDrop.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getLinks = this.getLinks.bind(this);
    this.uploadSingleFile = this.uploadSingleFile.bind(this)
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
      dropzoneActive: false
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
    const getLinksApi = "http://ec2-52-90-113-86.compute-1.amazonaws.com:3000/api/Checker/getlinks";
    Axios.get(getLinksApi, {
      params: {
        url: this.state.inputUrl
      }
    }).then(response => {
      this.setState({
        links: response.data.links
      });
    });
  }

  uploadSingleFile() {
    const CONTAINER_API ='http://ec2-52-90-113-86.compute-1.amazonaws.com:3000/api/Container/files/upload';
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
          inputUrl: 'http://ec2-52-90-113-86.compute-1.amazonaws.com:3000/api/Container/' + file.container + '/download/' + file.name
      },
      this.getLinks
    );
    });
  }

  componentDidMount() {
    this.nameInput.focus();
  }

  render() {
    console.log(this.state);
    return (
      <div className="app">
        <div className="app__header">
          <div className="row justify-content-md-center">
            <div className="app__logo col-md-12">
              <div className="app__logotext ">
                <span className="app__logotext--red">Pdf</span>Feed
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
                    <input type="text" className="card__input" name="inputUrl" onChange={this.handleInputChange}  placeholder="http://www.example.com/file.pdf" ref={(input) => { this.nameInput = input; }}/>
                  </div>
                  <div className="col-1 col-sm-1 col-xs-1">
                    <div className="card__options">
                      <a href="#" className="card--buttoncolor" onClick={this.getLinks}><i className="material-icons card__searchbutton">search</i></a>
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
            <div className="col-md-8">
              <div className={"card card--uploadbox "+ this.state.activeClass}>
                <Dropzone accept="application/pdf" onDragEnter={this.onDragEnter.bind(this)} onDragLeave={this.onDragLeave.bind(this)}
                multiple={false} onDrop={this.onDrop} type="file" className='form-control upload-box'>
                  <img src={pdf} alt="Kiwi standing on oval" />
                  <h5 >Drag &amp; Drop</h5>
                  <p> Choose a file or drag it here</p>
                </Dropzone>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default app;
