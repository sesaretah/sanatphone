import React, { Component } from 'react';
import { Page, Navbar, Block, Link, Toolbar, Swiper, SwiperSlide, BlockTitle, List, ListInput, Row, Button, Col, NavTitle, Segmented, Progressbar, ListItem } from 'framework7-react';

import * as MyActions from "../../actions/MyActions";
import ProfileStore from "../../stores/ProfileStore";
import MyStore from "../../stores/MyStore";
import { dict} from '../Dict';
import AdvertCard from './AdvertCard';
import logo from  "../../images/logo.png";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//const server='http://localhost:3000/api';
const server='http://sanatik.ir/api';

export default class EditCamAdvert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: window.localStorage.getItem('token'),
      title: '',
      content: '',
      images: [] ,
      loaded: 0,
      files: [],
      thumbs: [],
      uploaded: [],
      progress: [],
      title: '',
      content: '',
      photos: '',
      id: '',
      phone_number:  '',
      city: '',
      address:  '',
      email:  '',
      telegram_channel: '',
      instagram_page: '',
      website: '',
      province_id: '',
      mobile: '',
      price: '',
      website: '',
      provinces: []
    };
    this.submit = this.submit.bind(this);
    this.getAdvertisement = this.getAdvertisement.bind(this);
    this.getPhotos = this.getPhotos.bind(this);
    this.editAdvertisement = this.editAdvertisement.bind(this);
    this.getProvinces = this.getProvinces.bind(this);
    this.change = this.change.bind(this);

  }

  takepic(src) {
    console.log(src);
    if (window.cordova) {
      var opt = {}
      if (src == 1) {
        opt = {
          quality: 80,
          encodingType: window.Camera.EncodingType.JPEG,
          mediaType: window.Camera.MediaType.PICTURE,
          allowEdit: true,
          targetWidth: 800,
          targetHeight: 800,
          correctOrientation: true
        }
      } else {
        opt = {
          quality: 80,
          encodingType: window.Camera.EncodingType.JPEG,
          mediaType: window.Camera.MediaType.PICTURE,
          sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: true,
          targetWidth: 800,
          targetHeight: 800,
          correctOrientation: true
        }
      }
      console.log(opt);
      var t = this
      navigator.camera.getPicture(image => {

        t.setState({
          images: t.state.images.concat(image),
          progress: t.state.progress.concat(0),
          thumbs: t.state.thumbs.concat(image)
        });

        var params = new Object();
        params.uploadable_type = 'Advertisement';
        params.uploadable_id = '0';
        params.attachment_type = 'attachment_photos';

        var uri = encodeURI(server + '/upload');
        var options = new window.FileUploadOptions();
        options.fileKey = "file";
        options.fileName = image.substr(image.lastIndexOf('/')+1);
        options.params = params;

        options.chunkedMode = false;
        options.headers = {
          Connection: "close"
        };
        var headers = {'Authorization':'Bearer ' + t.state.token};
        options.headers = headers;
        var ft = new window.FileTransfer();
        ft.onprogress = function(progressEvent) {
          var i = t.state.images.indexOf(image)

          if (progressEvent.lengthComputable) {
            t.state.progress[i] =  (progressEvent.loaded / progressEvent.total) * 100;
            t.forceUpdate()
            console.log(t.state.progress[i]);
          } else {
            //t.state.progress[i].increment();
          }
        };
        ft.upload(image, uri, onSuccess, onError, options);

        function onSuccess(r) {
          var response = JSON.parse(r.response)
          t.setState({
            uploaded: t.state.uploaded.concat(response.id)
          });
        }

        function onError(error) {
          //alert("An error has occurred: Code = " + error.code);
          //console.log("upload error source " + error.source);
          //console.log("upload error target " + error.target);
        }
      },
      function(message) { alert('Get picture failed'); },
      opt);
    } else console.log("please run the cordova project");
  }


  componentDidMount(){
    MyActions.getProvinces();
    if(this.state.token) {
      MyActions.getAdvertisement(this.$f7route.params['advertId']);
    } else {
      const self = this;
      const app = self.$f7;
      const router = self.$f7router;
      app.dialog.alert('برای ثبت آگهی باید وارد اپ شوید ', dict.error, () => {
        router.navigate('/login/');
      });

    }

  }


  componentWillMount() {
    MyStore.on("show_advertisement", this.getAdvertisement);
    MyStore.on("edit_advertisement", this.editAdvertisement);
    MyStore.on("change_photos", this.getPhotos);
    MyStore.on("show_provinces", this.getProvinces);
  }

  componentWillUnmount() {
    MyStore.removeListener("show_advertisement", this.getAdvertisement);
    MyStore.removeListener("edit_advertisement", this.editAdvertisement);
    MyStore.removeListener("change_photos", this.getPhotos);
    MyStore.removeListener("show_provinces", this.getProvinces);
  }

  getAdvertisement() {
    var advertisements = MyStore.getAll();
    console.log(advertisements[0]);
    this.setState({
      id: advertisements[0].id,
      title: advertisements[0].title,
      content: advertisements[0].content,
      photos: advertisements[0].photos,
      id: advertisements[0].id,
      phone_number:  advertisements[0].phone_number,
      city:  advertisements[0].city,
      address:  advertisements[0].address,
      email:  advertisements[0].email,
      telegram_channel:  advertisements[0].telegram_channel,
      instagram_page:  advertisements[0].instagram_page,
      website:  advertisements[0].website,
      province: advertisements[0].province,
      province_id: advertisements[0].province_id,
      mobile:  advertisements[0].mobile,
      price:  advertisements[0].price,

    });
  }

  editAdvertisement() {
    var advertisements = MyStore.getAll();
    const self = this;
    const app = self.$f7;
    const router = self.$f7router;
    router.navigate('/adverts/'+advertisements[0].id);
  }

  images(){
    var items = []
    for (let i = 0; i < this.state.thumbs.length; i++) {
      items.push(
        <div class='w-100'>
          <img src={this.state.thumbs[i]} className="thumb" alt="picture" />
          <Progressbar progress={this.state.progress[i]} id="demo-inline-progressbar" class='center'></Progressbar>
        </div>
      );
    }
    return items
  }

  deletePhoto(id){
    MyActions.deletePhoto(id, this.state.token);
  }

  photos() {
    var items = []
    for (let i = 0; i < this.state.photos.length; i++) {
      if (this.state.photos[i].id){
        items.push(
          <div class='w-100'>
            <img src={this.state.photos[i].url} className="thumb" alt="picture" />
            <Button fill color="red" onClick={() => {if (window.confirm('آیا مطمئن هستید؟ ')) this.deletePhoto(this.state.photos[i].id)}}>{dict.delete}</Button>
          </div>
        );
      }

    }
    return items
  }

  getPhotos(){
    var photos = MyStore.getPhotos();
    console.log('photos', photos);
    this.setState({
      photos: photos
    });
  }

  submit() {
    if (this.state.title && this.state.content && this.state.phone_number) {
      MyActions.editAdvertisement(this.state);
    } else {
      const self = this;
      const app = self.$f7;
      const router = self.$f7router;
      app.dialog.alert(dict.adverts_nes, dict.error, () => {

      });
    }
  }

  getProvinces(){
    var provinces = MyStore.getProvinces();
    this.setState({provinces: provinces});
  }

  provinceItems(){
    var length = this.state.provinces.length;
    let items = []
    for (let i = 0; i < length; i++) {
      items.push(<option value={this.state.provinces[i].id}>{this.state.provinces[i].name}</option>);
    }
    return items
  }

  change(e){
    this.setState({province_id: e.target.value});
  }

  render() {
    return (
      <Page colorTheme="blue" className="gray" pageContent>
        <Navbar>
          <NavTitle>
            <img src={logo} alt="Logo" className="logo" />
          </NavTitle>
        </Navbar>
        <BlockTitle>{dict.new_advert}</BlockTitle>
        <List form  className="pr-20 pb-10" >
          <ListInput
            label={dict.title}
            type="text"
            maxlength="70"
            placeholder= {dict.title_content}
            value={this.state.title}
            onInput={(e) => {
              this.setState({ title: e.target.value});
            }}
            />
          <ListInput
            label={dict.content}
            type="textarea"
            maxlength="600"
            placeholder= {dict.content_content}
            value={this.state.content}
            required
            onInput={(e) => {
              this.setState({ content: e.target.value});
            }}
            />

          <ListInput
            label={dict.price}
            type="tel"
            maxlength="70"
            placeholder= ""
            value={this.state.price}
            onInput={(e) => {
              this.setState({ price: e.target.value});
            }}
            />

          <ListInput
            label={dict.phone_number}
            type="tel"
            maxlength="70"
            placeholder= {dict.phone_number_content}
            value={this.state.phone_number}
            onInput={(e) => {
              this.setState({ phone_number: e.target.value});
            }}
            />

          <ListInput
            label={dict.mobile}
            type="tel"
            maxlength="70"
            placeholder= {dict.pmobile}
            value={this.state.mobile}
            onInput={(e) => {
              this.setState({ mobile: e.target.value});
            }}
            />


          <ListInput
            label={dict.telegram_channel}
            type="text"
            placeholder=""
            maxlength="25"
            className="ltr"
            value={this.state.telegram_channel}
            onInput={(e) => {
              this.setState({ telegram_channel: e.target.value});
            }}
            />

          <ListInput
            label={dict.instagram_page}
            type="text"
            className="ltr"
            maxlength="25"
            placeholder=""
            value={this.state.instagram_page}
            onInput={(e) => {
              this.setState({ instagram_page: e.target.value});
            }}
            />

          <ListInput
            label={dict.email}
            type="text"
            placeholder=""
            maxlength="35"
            className="ltr "
            value={this.state.email}
            onInput={(e) => {
              this.setState({ email: e.target.value});
            }}
            />

            <ListInput
              label={dict.website}
              type="text"
              placeholder=""
              maxlength="35"
              className="ltr "
              value={this.state.website}
              onInput={(e) => {
                this.setState({ website: e.target.value});
              }}
              />


          <ListInput
            label={dict.city}
            type="text"
            placeholder=""
            maxlength="35"
            value={this.state.city}
            onInput={(e) => {
              this.setState({ city: e.target.value});
            }}
            />

          <li class="">
            <span className="custom-label ">{dict.province}</span>
          </li>
          <ListItem>
            <select name="province" value={this.state.province_id} onChange={this.change} className='custom-select'>
              {this.provinceItems()}
            </select>
          </ListItem>

          <ListInput
            label={dict.address}
            type="textarea"
            maxlength="300"
            placeholder=""
            value={this.state.address}
            onInput={(e) => {
              this.setState({ address: e.target.value});
            }}
            />

            <li>
              <div class="item-content item-input">
                <div class="item-inner">
                  <div class="item-title item-label"></div>
                </div>
              </div>
            </li>
        </List>

        <Block>
          <Segmented raised tag="p">
            <Button  fill color="gray"  onClick={() => this.takepic(1)}><i class="f7-icons icon-3">camera</i> {dict.upload_from_camera}</Button>
            <Button  fill color="black"  onClick={() => this.takepic(0)}><i class="f7-icons icon-3">folder</i> {dict.upload_from_gallery}</Button>
          </Segmented>
        </Block>

        <Block className="thumb" >
          {this.photos()}
        </Block>

        <Block className="thumb" >
          {this.images()}
        </Block>

        <Block>
          <Button raised big fill onClick={this.submit.bind(this)} >{dict.submit}</Button>
        </Block>

        <Toolbar tabbar labels color="blue" bottomMd={true}>
          <Link href="/categories/0"><i class="f7-icons">data_fill</i></Link>
          <Link href="/new_cam_advert/"><i class="f7-icons">add_round_fill</i></Link>
          <Link href="/"><i class="icon f7-icons">home_fill</i></Link>
          <Link href="/login/">
            <i class="icon f7-icons ios-only">
              person_round
              <span class="badge color-red">{this.state.unseens}</span>
            </i>
          </Link>
        </Toolbar>
      </Page>

    );
  }
}
